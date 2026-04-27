#!/usr/bin/env node
// scripts/migrate_u1_phase2.js
// One-shot transform for Grade 2 Unit 1 Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - Writes review list for ambiguous lessonId classification
//   - Re-emits src/data/u1.js with the transformed payload

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U1_PATH = path.join(REPO_ROOT, 'src', 'data', 'u1.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u1_review.txt');

// ───── Load u1.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U1_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 0) { console.error('FATAL: expected idx=0, got', idx); process.exit(1); }

// ───── lessonId classifier (testBank/unitQuiz) ─────
const reviewItems = [];
function classifyLessonId(prompt){
  const t = String(prompt || '').toLowerCase();
  if(/double|twice|same number twice/.test(t) || /(\d+)\s*\+\s*\1\b/.test(t)) return { id: 'u1l2', confident: true };
  if(/fact family|number family|related fact|inverse/.test(t)) return { id: 'u1l4', confident: true };
  if(/make a (?:ten|10)|making (?:ten|10)|make.*=.*10|complete.*10|to make 10/.test(t)) return { id: 'u1l3', confident: true };
  if(/missing number|missing addend|\?.*=.*\d|=\s*\?/.test(t) && /[+−\-]/.test(t)) return { id: 'u1l4', confident: false };
  if(/count (?:on|up|forward|back|backward|backwards)|number line/.test(t)) return { id: 'u1l1', confident: true };
  return { id: 'u1l1', confident: false };
}

// ───── Distractor heuristics (Addition/Subtraction domain) ─────
const heuristicCounts = {
  err_off_by_one: 0,
  err_reversed_digits: 0,
  err_sub_instead: 0,
  err_add_instead: 0,
  err_skip_count_error: 0,
  err_magnitude_error: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_confused: 0,
};

function reverseDigits(n){
  if(!Number.isInteger(n) || n < 0) return null;
  return parseInt(String(n).split('').reverse().join(''), 10);
}

function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  const m = String(s).match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}

function extractAddends(prompt){
  // Return [a, op, b] for "X + Y", "X - Y", "X − Y" if found
  const m = String(prompt || '').match(/(\d+)\s*([+\-−])\s*(\d+)/);
  if(!m) return null;
  return { a: parseInt(m[1], 10), op: m[2] === '−' ? '-' : m[2], b: parseInt(m[3], 10) };
}

function classifyDistractor(wrongVal, correctVal, prompt){
  const wn = tryParseInt(wrongVal);
  const cn = tryParseInt(correctVal);
  if(wn === null || cn === null){
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }
  const delta = wn - cn;
  const absDelta = Math.abs(delta);

  if(absDelta === 1){
    return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
  }

  // reversed-digits check (only if both are 2+ digit, and not equal)
  if(wn !== cn && cn >= 10 && wn >= 10){
    const rev = reverseDigits(cn);
    if(rev !== null && rev === wn && rev !== cn){
      return { tag: 'err_reversed_digits', patternTag: 'pattern_digit_reversal' };
    }
  }

  // Operation-swap: when prompt has X op Y, see if wrong matches the inverse op result
  const ad = extractAddends(prompt);
  if(ad){
    const sumAB = ad.a + ad.b;
    const diffAB = Math.abs(ad.a - ad.b);
    if(ad.op === '+' && cn === sumAB && wn === diffAB){
      return { tag: 'err_sub_instead', patternTag: 'pattern_subtracted_instead' };
    }
    if(ad.op === '-' && cn === diffAB && wn === sumAB){
      return { tag: 'err_add_instead', patternTag: 'pattern_added_instead' };
    }
  }

  // Small-delta (±2 or other small): NOT off_by_one. Pick skip-count vs magnitude.
  if(absDelta === 2){
    // Plausible skip-count step if BOTH addends are single-digit, OR if correct ≤ 20
    const singleDigitOperands = ad && ad.a < 10 && ad.b < 10;
    const inSkipRange = cn <= 20;
    if(singleDigitOperands || inSkipRange){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_skip_count_wrong_step' };
    }
    return { tag: 'err_magnitude_error', patternTag: delta > 0 ? 'pattern_too_high' : 'pattern_too_low' };
  }

  // Larger deltas
  if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
  return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
}

// ───── Option converter ─────
const stats = {
  totalQuestions: 0,
  qBankConverted: 0,
  testBankConverted: 0,
  unitQuizConverted: 0,
  optionsConverted: 0,
  ambiguousLessonIds: 0,
  alreadyObjectForm: 0,
  indexMismatches: 0,
};

function isBareStringOptions(o){
  return Array.isArray(o) && o.length > 0 && o.every(x => typeof x === 'string' || typeof x === 'number');
}

function convertOptions(q, where){
  if(!q || !Array.isArray(q.o)) return;
  const a = q.a;
  if(!Number.isInteger(a) || a < 0 || a >= q.o.length){
    console.error(`FATAL: out-of-range answer index a=${a} in ${where}: ${JSON.stringify(q).slice(0,160)}`);
    process.exit(1);
  }
  if(!isBareStringOptions(q.o)){
    stats.alreadyObjectForm++;
    // Already object form — verify each option has val
    q.o.forEach((opt, i) => {
      if(typeof opt !== 'object' || opt === null || !('val' in opt)){
        console.error(`FATAL: malformed option in ${where} at index ${i}: ${JSON.stringify(opt)}`);
        process.exit(1);
      }
    });
    return;
  }

  const originalCorrect = q.o[a];
  const newOpts = q.o.map((val, i) => {
    if(i === a){
      return { val: String(val) };
    }
    const cls = classifyDistractor(val, originalCorrect, q.t);
    heuristicCounts[cls.tag] = (heuristicCounts[cls.tag] || 0) + 1;
    return { val: String(val), tag: cls.tag, patternTag: cls.patternTag };
  });

  // Assert correct-index preservation
  if(newOpts[a].val !== String(originalCorrect)){
    console.error(`FATAL: correct-answer drift in ${where}: was "${originalCorrect}", now "${newOpts[a].val}"`);
    stats.indexMismatches++;
    process.exit(1);
  }

  q.o = newOpts;
  stats.optionsConverted++;
}

// ───── Walk + transform ─────
data.lessons.forEach((lesson, lessonIdx) => {
  const lessonId = `u1l${lessonIdx + 1}`;
  if(Array.isArray(lesson.qBank)){
    lesson.qBank.forEach((q, qi) => {
      stats.totalQuestions++;
      q.lessonId = lessonId;
      convertOptions(q, `qBank[${lessonId}][${qi}]`);
      stats.qBankConverted++;
    });
  }
});

if(Array.isArray(data.testBank)){
  data.testBank.forEach((q, qi) => {
    stats.totalQuestions++;
    const cls = classifyLessonId(q.t);
    q.lessonId = cls.id;
    if(!cls.confident){
      stats.ambiguousLessonIds++;
      reviewItems.push(`testBank[${qi}] -> ${cls.id} (low confidence): ${String(q.t).slice(0,140)}`);
    }
    convertOptions(q, `testBank[${qi}]`);
    stats.testBankConverted++;
  });
}

if(Array.isArray(data.unitQuiz)){
  data.unitQuiz.forEach((q, qi) => {
    stats.totalQuestions++;
    const cls = classifyLessonId(q.t);
    q.lessonId = cls.id;
    if(!cls.confident){
      stats.ambiguousLessonIds++;
      reviewItems.push(`unitQuiz[${qi}] -> ${cls.id} (low confidence): ${String(q.t).slice(0,140)}`);
    }
    convertOptions(q, `unitQuiz[${qi}]`);
    stats.unitQuizConverted++;
  });
}

// ───── Write review file ─────
fs.writeFileSync(REVIEW_PATH, reviewItems.join('\n') + '\n', 'utf8');

// ───── Re-emit u1.js ─────
const header = '// Unit 1: Basic Fact Strategies\n';
const body = '_mergeUnitData(0, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U1_PATH, header + body, 'utf8');

// ───── Report ─────
console.log('=== migrate_u1_phase2 ===');
console.log(JSON.stringify({ stats, heuristicCounts, reviewListSize: reviewItems.length }, null, 2));
console.log('Wrote:', U1_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
