#!/usr/bin/env node
/**
 * generate-hints.js
 * Build-time script: generates pre-answer hints for every question in u1.js–u10.js
 * using the Google Gemini API, then writes the `h` field back into each data file.
 *
 * Usage:
 *   node scripts/generate-hints.js              # all units
 *   node scripts/generate-hints.js --unit=3     # unit 3 only
 *   node scripts/generate-hints.js --dry-run    # print hints, no write
 *
 * Prerequisites:
 *   npm install @google/generative-ai
 *   set GEMINI_API_KEY=<your-key>
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── CLI args ────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const DRY_RUN  = args.includes('--dry-run');
const UNIT_ARG = args.find(a => a.startsWith('--unit='));
const ONLY_UNIT = UNIT_ARG ? parseInt(UNIT_ARG.split('=')[1], 10) : null;

// ── Config ──────────────────────────────────────────────────────────────────
const DATA_DIR    = path.join(__dirname, '..', 'src', 'data');
const FAILED_LOG  = path.join(__dirname, 'hints-failed.json');
const BATCH_SIZE  = 20;
const INTER_BATCH_MS = 1000;   // 1 s between batches — safe for free tier (15 RPM)
const MAX_RETRIES = 3;
const BACKOFF_MS  = [5000, 10000, 20000];
const MODEL_NAME  = 'gemini-1.5-flash';

const SYSTEM_PROMPT =
  'You are a math tutor assistant generating pre-answer hints for elementary school math quiz questions. ' +
  'For each question, write exactly one hint: 1–2 sentences, encouraging tone, guides the student toward ' +
  'the right approach without naming the answer or any of the options directly. ' +
  'Use vocabulary appropriate for grades 2–5. Never use the word "hint". ' +
  'Return only valid JSON — a single array of objects with fields "id" and "h". No markdown fences, no extra text.';

// ── Gemini client ────────────────────────────────────────────────────────────
let genAI;
function getClient() {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    console.error('ERROR: @google/generative-ai not installed. Run: npm install @google/generative-ai');
    process.exit(1);
  }
  return genAI;
}

// ── Sleep helper ─────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Trailing-comma normaliser ─────────────────────────────────────────────────
// Removes trailing commas before ] or } so JSON.parse doesn't choke.
function stripTrailingCommas(str) {
  return str.replace(/,\s*([}\]])/g, '$1');
}

// ── Extract _mergeUnitData({...}) blocks from a unit file ─────────────────────
// Uses a brace-depth counter so nested objects are handled correctly.
function extractBlocks(src) {
  const blocks = [];
  const marker = '_mergeUnitData(';
  let pos = 0;
  while (true) {
    const start = src.indexOf(marker, pos);
    if (start === -1) break;
    let i = start + marker.length;
    // Skip to opening brace
    while (i < src.length && src[i] !== '{') i++;
    if (i >= src.length) break;
    const braceStart = i;
    let depth = 0;
    while (i < src.length) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) break; }
      i++;
    }
    blocks.push({ raw: src.slice(braceStart, i + 1), start: braceStart, end: i + 1 });
    pos = i + 1;
  }
  return blocks;
}

// ── Parse a single block into JS object ──────────────────────────────────────
function parseBlock(raw) {
  try {
    return JSON.parse(stripTrailingCommas(raw));
  } catch (e) {
    return null;
  }
}

// ── Collect all unhinted questions from a file ───────────────────────────────
function collectQuestions(fileText, fileIdx) {
  const blocks = extractBlocks(fileText);
  const tuples = [];
  blocks.forEach((block, blockIdx) => {
    const data = parseBlock(block.raw);
    if (!data) return;
    const lessons = data.lessons || [];
    lessons.forEach(lesson => {
      const bank = lesson.qBank || lesson.quiz || [];
      bank.forEach((q, qIdx) => {
        if (q.h && q.h.trim()) return; // already has hint — skip
        tuples.push({ fileIdx, blockIdx, qIdx, question: q, lessonBank: bank });
      });
    });
    // Also handle top-level testBank / unitQuiz
    const testBank = data.testBank || data.unitQuiz || [];
    testBank.forEach((q, qIdx) => {
      if (q.h && q.h.trim()) return;
      tuples.push({ fileIdx, blockIdx, qIdx: `t_${qIdx}`, question: q, lessonBank: testBank });
    });
  });
  return tuples;
}

// ── Call Gemini API for a batch of questions ──────────────────────────────────
async function callGemini(batch, attempt) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { responseMimeType: 'application/json' },
    systemInstruction: SYSTEM_PROMPT,
  });

  const payload = batch.map(t => ({
    id: `${t.fileIdx}_${t.blockIdx}_${t.qIdx}`,
    t: t.question.t,
    o: t.question.o,
    a: t.question.a,
  }));

  const userMsg = JSON.stringify(payload);
  const result = await model.generateContent(userMsg);
  const text = result.response.text().trim();

  // Parse response — strip accidental markdown fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) throw new Error('Response is not an array');
  return parsed; // [{ id, h }, ...]
}

// ── Write hints back into a file ──────────────────────────────────────────────
// Inserts "h":"<text>" before the closing } of each matched question object.
// Writes to a .tmp file, validates parse, then atomically renames.
function writeHintsToFile(filePath, hints) {
  let src = fs.readFileSync(filePath, 'utf8');
  let changed = 0;

  for (const { id, h } of hints) {
    // id format: "<fileIdx>_<blockIdx>_<qIdx>" — we only need to find the question text
    // Strategy: find the question's `t` field value and insert h before the closing }
    // This is robust because question text is unique within a file.
    // We locate the question by finding its exact `t` field in the source.
  }

  // Simpler, robust approach: for each hint, find the question JSON object
  // by searching for a unique text snippet and inserting h before its last }
  // We rebuild using a character-level approach on each hint entry.
  for (const { questionText, h } of hints) {
    if (!questionText) continue;
    // Escape for use in string search (literal match, not regex)
    const escaped = JSON.stringify(questionText); // adds surrounding quotes
    const searchFor = '"t":' + escaped;
    const idx = src.indexOf(searchFor);
    if (idx === -1) continue;

    // From idx, find the end of this question object by scanning forward for }
    // that closes this object (depth tracking from the { before "t":)
    let objStart = idx;
    while (objStart > 0 && src[objStart] !== '{') objStart--;
    let depth = 0, i = objStart;
    while (i < src.length) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) break; }
      i++;
    }
    const objEnd = i; // points at the closing }

    // Check if h field already exists in this object
    const objText = src.slice(objStart, objEnd + 1);
    if (/"h"\s*:/.test(objText)) continue; // already has h

    // Insert "h":"<escaped>" before the closing }
    const hField = ',"h":' + JSON.stringify(h);
    src = src.slice(0, objEnd) + hField + src.slice(objEnd);
    changed++;
  }

  if (changed === 0) return 0;

  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, src, 'utf8');

  // Validate: try to parse the modified blocks
  try {
    const blocks = extractBlocks(src);
    blocks.forEach(b => { if (!parseBlock(b.raw)) throw new Error('Block parse failed'); });
  } catch (e) {
    fs.unlinkSync(tmpPath);
    throw new Error('Validation failed after write-back: ' + e.message);
  }

  fs.renameSync(tmpPath, filePath);
  return changed;
}

// ── Process one unit file ─────────────────────────────────────────────────────
async function processFile(unitNum) {
  const fileName = `u${unitNum}.js`;
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`[${fileName}] Not found — skipping`);
    return { written: 0, skipped: 0, failed: 0 };
  }

  const fileText = fs.readFileSync(filePath, 'utf8');
  const tuples   = collectQuestions(fileText, unitNum);

  if (tuples.length === 0) {
    console.log(`[${fileName}] All questions already have hints — nothing to do`);
    return { written: 0, skipped: 0, failed: 0 };
  }

  console.log(`[${fileName}] ${tuples.length} questions need hints`);

  const batches = [];
  for (let i = 0; i < tuples.length; i += BATCH_SIZE) {
    batches.push(tuples.slice(i, i + BATCH_SIZE));
  }

  const allHints = []; // { questionText, h }
  const failures = [];

  for (let bIdx = 0; bIdx < batches.length; bIdx++) {
    const batch = batches[bIdx];
    process.stdout.write(`[${fileName}] batch ${bIdx+1}/${batches.length}: ${batch.length} questions → `);

    let result = null;
    let lastErr = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        result = await callGemini(batch, attempt);
        break;
      } catch (e) {
        lastErr = e;
        const isRateLimit = e.message && (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED'));
        const isJsonErr   = e instanceof SyntaxError;

        if (attempt < MAX_RETRIES - 1) {
          const delay = BACKOFF_MS[attempt];
          console.log(`\n  ⚠ ${isRateLimit ? 'Rate limit' : isJsonErr ? 'JSON parse error' : 'Error'}: retrying in ${delay/1000}s…`);
          await sleep(delay);
        }
      }
    }

    if (!result) {
      console.log(`FAILED (${lastErr && lastErr.message})`);
      batch.forEach(t => failures.push({ id: `${t.fileIdx}_${t.blockIdx}_${t.qIdx}`, question: t.question.t, error: lastErr && lastErr.message }));
    } else {
      // Map results back by id
      const byId = {};
      result.forEach(r => { byId[r.id] = r.h; });

      let batchWritten = 0;
      batch.forEach(t => {
        const id = `${t.fileIdx}_${t.blockIdx}_${t.qIdx}`;
        const h  = byId[id];
        if (h && typeof h === 'string' && h.trim()) {
          allHints.push({ questionText: t.question.t, h: h.trim() });
          batchWritten++;
        } else {
          failures.push({ id, question: t.question.t, error: 'No hint returned' });
        }
      });
      console.log(`${batchWritten} hints`);
    }

    if (bIdx < batches.length - 1) await sleep(INTER_BATCH_MS);
  }

  if (DRY_RUN) {
    console.log(`\n[${fileName}] DRY RUN — sample hints:`);
    allHints.slice(0, 3).forEach(({ questionText, h }) => {
      console.log(`  Q: ${questionText.slice(0, 60)}…`);
      console.log(`  H: ${h}\n`);
    });
    return { written: allHints.length, skipped: tuples.length - allHints.length - failures.length, failed: failures.length };
  }

  let written = 0;
  if (allHints.length > 0) {
    written = writeHintsToFile(filePath, allHints);
    console.log(`[${fileName}] ✓ Wrote ${written} hints to file`);
  }

  return { written, skipped: tuples.length - allHints.length - failures.length, failed: failures.length, failures };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`My Math Roots — Hint Generator`);
  console.log(`Model: ${MODEL_NAME} | Batch size: ${BATCH_SIZE} | Dry run: ${DRY_RUN}`);
  if (ONLY_UNIT) console.log(`Processing unit ${ONLY_UNIT} only`);
  console.log('─'.repeat(60));

  const units = ONLY_UNIT ? [ONLY_UNIT] : [1,2,3,4,5,6,7,8,9,10];

  let totalWritten = 0, totalSkipped = 0, totalFailed = 0;
  const allFailures = [];

  for (const u of units) {
    const { written, skipped, failed, failures } = await processFile(u);
    totalWritten += written;
    totalSkipped += skipped;
    totalFailed  += failed;
    if (failures) allFailures.push(...failures);
  }

  console.log('─'.repeat(60));
  console.log(`Done. ${totalWritten} hints written, ${totalSkipped} skipped, ${totalFailed} failed.`);

  if (allFailures.length > 0) {
    fs.writeFileSync(FAILED_LOG, JSON.stringify(allFailures, null, 2), 'utf8');
    console.error(`\n⚠ ${allFailures.length} failures logged to ${FAILED_LOG}`);
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
