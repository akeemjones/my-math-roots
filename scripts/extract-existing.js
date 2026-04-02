#!/usr/bin/env node
/**
 * Extract all existing questions from src/data/u*.js into JSON files
 * organized by unit and section (lesson qBank, testBank, unitQuiz).
 * Output: scripts/existing/{unit}-{section}.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUT_DIR = path.join(__dirname, 'existing');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Minimal stub so _mergeUnitData works
const captured = {};
global._mergeUnitData = function(idx, data) {
  captured[idx] = data;
};
global.UNITS_DATA = new Array(10).fill(null).map(() => ({ lessons: [{},{},{},{}] }));

for (let u = 1; u <= 10; u++) {
  const fpath = path.join(DATA_DIR, `u${u}.js`);
  if (!fs.existsSync(fpath)) { console.log(`Skipping u${u}.js (not found)`); continue; }

  const src = fs.readFileSync(fpath, 'utf8');

  // Extract the JSON object from _mergeUnitData(N, {...})
  const m = src.match(/_mergeUnitData\s*\(\s*(\d+)\s*,\s*/);
  if (!m) { console.log(`No _mergeUnitData in u${u}.js`); continue; }

  const jsonStart = src.indexOf('{', m.index + m[0].length - 1);
  let depth = 0, jsonEnd = jsonStart;
  for (let i = jsonStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { jsonEnd = i + 1; break; } }
  }

  const jsonStr = src.slice(jsonStart, jsonEnd);

  // Use eval in a controlled way to parse JS object notation
  let data;
  try {
    data = eval('(' + jsonStr + ')');
  } catch(e) {
    console.log(`Parse error u${u}.js: ${e.message}`);
    continue;
  }

  const lessons = data.lessons || [];
  let unitTotal = 0;

  lessons.forEach((lesson, i) => {
    const qBank = lesson.qBank || [];
    if (qBank.length > 0) {
      const outFile = path.join(OUT_DIR, `u${u}-l${i+1}-qbank.json`);
      fs.writeFileSync(outFile, JSON.stringify(qBank, null, 2));
      console.log(`  u${u}-l${i+1}-qbank.json: ${qBank.length} questions`);
      unitTotal += qBank.length;
    }
  });

  const testBank = data.testBank || [];
  if (testBank.length > 0) {
    const outFile = path.join(OUT_DIR, `u${u}-testbank.json`);
    fs.writeFileSync(outFile, JSON.stringify(testBank, null, 2));
    console.log(`  u${u}-testbank.json: ${testBank.length} questions`);
    unitTotal += testBank.length;
  }

  const unitQuiz = data.unitQuiz || [];
  if (unitQuiz.length > 0) {
    const outFile = path.join(OUT_DIR, `u${u}-unitquiz.json`);
    fs.writeFileSync(outFile, JSON.stringify(unitQuiz, null, 2));
    console.log(`  u${u}-unitquiz.json: ${unitQuiz.length} questions`);
    unitTotal += unitQuiz.length;
  }

  console.log(`Unit ${u}: ${unitTotal} total questions\n`);
}
