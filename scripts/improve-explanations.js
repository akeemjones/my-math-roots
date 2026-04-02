#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//  improve-explanations.js
//  Rewrites the `e` (explanation) field in existing quiz questions to
//  be conceptual and Grade 2 friendly — not just step-by-step.
//
//  Usage:
//    GEMINI_API_KEY=xxx node scripts/improve-explanations.js
//    GEMINI_API_KEY=xxx node scripts/improve-explanations.js --unit=3
//
//  Safe: only rewrites `e` fields; never changes t/o/a/d fields.
//  Idempotent: backs up each file before writing.
// ════════════════════════════════════════════════════════════════════

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const DATA_DIR  = path.join(__dirname, '../src/data');
const BACKUP_DIR = path.join(__dirname, 'explanation-backups');

const arg = process.argv.find(a => a.startsWith('--unit='));
const TARGET_UNIT = arg ? parseInt(arg.split('=')[1]) : null;

// ── Gemini API ───────────────────────────────────────────────────────
function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('Set GEMINI_API_KEY first.\nRun: GEMINI_API_KEY=your_key node scripts/improve-explanations.js'));

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 8192, responseMimeType: 'application/json' },
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error('Gemini: ' + JSON.stringify(json.error)));
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Empty Gemini response'));
          resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Extract all "e":"..." occurrences with their character positions ──
function extractExplanations(src) {
  const results = [];
  const re = /"e":"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    results.push({ index: m.index, full: m[0], value: m[1] });
  }
  return results;
}

// ── Ask Gemini to improve a batch ────────────────────────────────────
async function improveBatch(values, unitNum) {
  const numbered = values.map((v, i) => `${i+1}. ${v}`).join('\n');
  const prompt = `You are improving quiz answer explanations for a Grade 2 math app (ages 7-8), Unit ${unitNum}.

Current explanations (numbered):
${numbered}

Rewrite each to be:
- Conceptual: explain WHY the answer is correct, not just calculation steps
- Grade 2 friendly: short, simple words, encouraging tone
- Complete: the final answer is clearly stated
- Max 130 characters each (shorter is better)
- You may add one relevant emoji at the end if helpful
- Use "regroup" instead of "carry" or "borrow"
- Do NOT change mathematical content or introduce errors

Return ONLY a JSON array of strings, same count and order:
["improved 1", "improved 2", ...]`;

  const raw = await callGemini(prompt);
  const cleaned = raw.replace(/^```json\s*/,'').replace(/\s*```$/,'').trim();
  let arr;
  try { arr = JSON.parse(cleaned); } catch(e) { return null; }
  if (!Array.isArray(arr) || arr.length !== values.length) return null;
  return arr;
}

// ── Process one unit ─────────────────────────────────────────────────
async function processUnit(unitNum) {
  const file = path.join(DATA_DIR, `u${unitNum}.js`);
  if (!fs.existsSync(file)) { console.log(`u${unitNum}: not found`); return; }

  const src = fs.readFileSync(file, 'utf8');
  const explanations = extractExplanations(src);
  if (!explanations.length) { console.log(`u${unitNum}: no explanations`); return; }
  console.log(`\nu${unitNum}: ${explanations.length} explanations`);

  // Backup
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const bak = path.join(BACKUP_DIR, `u${unitNum}.js.bak`);
  if (!fs.existsSync(bak)) { fs.writeFileSync(bak, src); console.log(`  Backed up → ${path.basename(bak)}`); }

  // Collect ALL improvements first, then apply in one pass
  const allImproved = new Array(explanations.length).fill(null);
  const BATCH = 20;
  const totalBatches = Math.ceil(explanations.length / BATCH);

  for (let i = 0; i < explanations.length; i += BATCH) {
    const batch = explanations.slice(i, i + BATCH);
    const bn = Math.floor(i/BATCH) + 1;
    process.stdout.write(`  Batch ${bn}/${totalBatches}… `);

    let improved = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        improved = await improveBatch(batch.map(x => x.value), unitNum);
        if (improved) break;
      } catch(e) {
        if (attempt < 2) { process.stdout.write(`retry… `); await sleep(5000); }
        else console.error(`\n  ⚠ Failed: ${e.message}`);
      }
    }

    if (improved) {
      batch.forEach((_, bi) => { allImproved[i + bi] = improved[bi]; });
      process.stdout.write('✓\n');
    } else {
      process.stdout.write('skipped (kept original)\n');
    }

    if (i + BATCH < explanations.length) await sleep(4200);
  }

  // Apply all replacements in reverse index order (so earlier positions stay valid)
  let newSrc = src;
  const toReplace = explanations
    .map((item, idx) => ({ ...item, improved: allImproved[idx] }))
    .filter(x => x.improved !== null)
    .sort((a, b) => b.index - a.index); // reverse order

  for (const r of toReplace) {
    const replacement = `"e":"${r.improved.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    newSrc = newSrc.slice(0, r.index) + replacement + newSrc.slice(r.index + r.full.length);
  }

  fs.writeFileSync(file, newSrc, 'utf8');
  const changed = toReplace.length;
  console.log(`  ✅ ${changed}/${explanations.length} explanations improved`);
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const units = TARGET_UNIT ? [TARGET_UNIT] : [1,2,3,4,5,6,7,8,9,10];
  console.log(`Improving explanations — units: ${units.join(', ')}`);
  console.log(`Backups → ${BACKUP_DIR}\n`);

  for (let i = 0; i < units.length; i++) {
    await processUnit(units[i]);
    if (i < units.length - 1) await sleep(2000);
  }

  console.log('\n✅ Done. Run: cd "E:/Cameron Jones/my-math-roots" && node build.js');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
