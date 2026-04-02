#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//  merge-questions.js
//  After reviewing the PDF, run this to inject the generated questions
//  into the src/data/u{N}.js files.
//
//  What it does:
//    1. Reads each src/data/u{N}.js
//    2. Adds d:'m' to all existing questions that lack a d field
//    3. Appends new questions from scripts/generated/ to each lesson qBank
//    4. Appends new testBank questions
//    5. Deduplicates by question text
//    6. Rewrites the source file
//
//  Usage:
//    node scripts/merge-questions.js --unit=all
//    node scripts/merge-questions.js --unit=1
//    node scripts/merge-questions.js --unit=1 --dry-run   (preview only)
//
//  Safe to re-run: deduplication prevents double-adding questions.
// ════════════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');

const SRC_DIR   = path.join(__dirname, '..', 'src', 'data');
const GEN_DIR   = path.join(__dirname, 'generated');
const EXIST_DIR = path.join(__dirname, 'existing');

const LESSON_COUNTS = [4, 4, 4, 3, 4, 4, 3, 3, 3, 3]; // lessons per unit

function main() {
  const args = {};
  process.argv.slice(2).forEach(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    args[k] = v !== undefined ? v : true;
  });

  const dryRun = args['dry-run'] === true || args['dry-run'] === 'true';
  if (dryRun) console.log('DRY RUN — no files will be written.\n');

  const unitNs = args.unit === 'all' || !args.unit
    ? Array.from({ length: 10 }, (_, i) => i + 1)
    : [parseInt(args.unit, 10)];

  let totalAdded = 0;
  let totalTagged = 0;

  for (const unitN of unitNs) {
    const srcPath = path.join(SRC_DIR, `u${unitN}.js`);
    if (!fs.existsSync(srcPath)) {
      console.warn(`SKIP: ${srcPath} not found`);
      continue;
    }

    console.log(`\n── Unit ${unitN} ──`);

    // ── 1. Parse the file ──────────────────────────────────────────
    const raw = fs.readFileSync(srcPath, 'utf8');

    // Find _mergeUnitData(N, {....}) using brace-counting
    const callMatch = raw.match(/_mergeUnitData\s*\(\s*(\d+)\s*,\s*/);
    if (!callMatch) {
      console.error(`  ERROR: Cannot parse u${unitN}.js — _mergeUnitData not found.`);
      continue;
    }

    const jsonStart = raw.indexOf('{', callMatch.index + callMatch[0].length - 1);
    let depth = 0, jsonEnd = jsonStart;
    for (let i = jsonStart; i < raw.length; i++) {
      if (raw[i] === '{') depth++;
      else if (raw[i] === '}') { depth--; if (depth === 0) { jsonEnd = i + 1; break; } }
    }

    const jsonStr = raw.slice(jsonStart, jsonEnd);
    let unitData;
    // eslint-disable-next-line no-eval
    try { unitData = eval('(' + jsonStr + ')'); }
    catch (e) {
      console.error(`  ERROR: eval failed for u${unitN}.js: ${e.message}`);
      continue;
    }

    // ── 2. Tag existing questions using classified d values from existing/ ──
    // Build lookup maps: question text → d value
    const existLookup = {};
    const loadExistMap = (file) => {
      const fp = path.join(EXIST_DIR, file);
      if (!fs.existsSync(fp)) return {};
      try {
        const qs = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const m = {};
        qs.forEach(q => { if (q.t && q.d) m[q.t] = q.d; });
        return m;
      } catch(e) { return {}; }
    };

    let tagged = 0;
    const tagBank = (bank, dMap) => {
      if (!Array.isArray(bank)) return;
      bank.forEach(q => {
        if (!q.d) {
          q.d = (dMap && dMap[q.t]) || 'm';
          tagged++;
        }
      });
    };

    unitData.lessons.forEach((l, li) => {
      const dMap = loadExistMap(`u${unitN}-l${li + 1}-qbank.json`);
      tagBank(l.qBank, dMap);
    });
    tagBank(unitData.testBank,  loadExistMap(`u${unitN}-testbank.json`));
    tagBank(unitData.unitQuiz,  loadExistMap(`u${unitN}-unitquiz.json`));
    totalTagged += tagged;
    console.log(`  Tagged ${tagged} existing questions with d:'m'`);

    // ── 3. Merge lesson qBank questions ───────────────────────────
    const lessonCount = LESSON_COUNTS[unitN - 1] || (unitData.lessons || []).length;
    let lessonAdded = 0;

    unitData.lessons.forEach((lesson, li) => {
      if (!lesson.qBank) lesson.qBank = [];
      const existingTexts = new Set(lesson.qBank.map(q => q.t));
      let addedThisLesson = 0;

      for (const d of ['e', 'm', 'h']) {
        const genFile = path.join(GEN_DIR, `u${unitN}-l${li + 1}-${d}.json`);
        if (!fs.existsSync(genFile)) {
          // silently skip — generation may not be complete yet
          continue;
        }

        let generated;
        try {
          generated = JSON.parse(fs.readFileSync(genFile, 'utf8'));
        } catch (e) {
          console.warn(`  WARN: Could not parse ${path.basename(genFile)}: ${e.message}`);
          continue;
        }

        for (const q of generated) {
          if (!q.t || existingTexts.has(q.t)) continue;
          // Ensure required fields
          if (!Array.isArray(q.o) || q.o.length !== 4) continue;
          if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) continue;
          if (!q.e) continue;
          lesson.qBank.push({ t: q.t, o: q.o, a: q.a, e: q.e, d: q.d || d });
          existingTexts.add(q.t);
          addedThisLesson++;
        }
      }

      lessonAdded += addedThisLesson;
      const totalInLesson = lesson.qBank.length;
      const byDiff = { e: 0, m: 0, h: 0, none: 0 };
      lesson.qBank.forEach(q => {
        if (q.d === 'e' || q.d === 'm' || q.d === 'h') byDiff[q.d]++;
        else byDiff.none++;
      });
      console.log(`  Lesson ${li + 1}: +${addedThisLesson} new → ${totalInLesson} total (E:${byDiff.e} M:${byDiff.m} H:${byDiff.h})`);
    });

    totalAdded += lessonAdded;

    // ── 4. Merge testBank questions (testBank and unitQuiz are separate banks) ──
    // Append new generated questions only to testBank (not unitQuiz)
    const testBankKey = unitData.testBank !== undefined ? 'testBank'
                      : unitData.unitQuiz !== undefined ? 'unitQuiz' : null;
    if (testBankKey) {
      const bank = unitData[testBankKey];
      const existingTexts = new Set(bank.map(q => q.t));
      let addedToTest = 0;

      for (const d of ['e', 'm', 'h']) {
        const genFile = path.join(GEN_DIR, `u${unitN}-testbank-${d}.json`);
        if (!fs.existsSync(genFile)) continue;

        let generated;
        try {
          generated = JSON.parse(fs.readFileSync(genFile, 'utf8'));
        } catch (e) {
          console.warn(`  WARN: Could not parse ${path.basename(genFile)}: ${e.message}`);
          continue;
        }

        for (const q of generated) {
          if (!q.t || existingTexts.has(q.t)) continue;
          if (!Array.isArray(q.o) || q.o.length !== 4) continue;
          if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) continue;
          if (!q.e) continue;
          bank.push({ t: q.t, o: q.o, a: q.a, e: q.e, d: q.d || d });
          existingTexts.add(q.t);
          addedToTest++;
        }
      }

      totalAdded += addedToTest;
      const byDiff = { e: 0, m: 0, h: 0, none: 0 };
      bank.forEach(q => {
        if (q.d === 'e' || q.d === 'm' || q.d === 'h') byDiff[q.d]++;
        else byDiff.none++;
      });
      console.log(`  Test Bank: +${addedToTest} new → ${bank.length} total (E:${byDiff.e} M:${byDiff.m} H:${byDiff.h})`);
    }

    // ── 5. Write updated file ─────────────────────────────────────
    if (!dryRun) {
      const newContent = raw.slice(0, jsonStart) + JSON.stringify(unitData) + raw.slice(jsonEnd);
      fs.writeFileSync(srcPath, newContent, 'utf8');
      console.log(`  Wrote u${unitN}.js`);
    } else {
      console.log(`  [DRY RUN] Would write u${unitN}.js`);
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`Total new questions added: ${totalAdded}`);
  console.log(`Total existing questions tagged with difficulty: ${totalTagged}`);

  if (!dryRun) {
    console.log('\nNext steps:');
    console.log('  1. Validate: node -e "global._mergeUnitData=(i,d)=>{const q=d.lessons.map(l=>l.qBank?.length||0);console.log(\'u\'+(i+1)+\': \'+q);};for(let i=1;i<=10;i++)require(\'./src/data/u\'+i+\'.js\')"');
    console.log('  2. Rebuild:  node build.js --dev');
  }
}

main();
