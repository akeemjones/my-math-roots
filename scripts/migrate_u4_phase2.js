#!/usr/bin/env node
// scripts/migrate_u4_phase2.js
// One-shot transform for Grade 2 Unit 4 (Add & Subtract to 1,000) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u4.js with the transformed payload
//
// NOTE: backup (cp src/data/u4.js src/data/u4.js.bak) and pre-edit git tag
// (git tag phase2-u4-pre-edit) are run as EXPLICIT terminal commands BEFORE this script.
// They are intentionally NOT hidden inside this script.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U4_PATH = path.join(REPO_ROOT, 'src', 'data', 'u4.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u4_review.txt');

// ───── Load u4.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U4_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 3) { console.error('FATAL: expected idx=3 for u4, got', idx); process.exit(1); }

// ───── lessonId classifier (testBank/unitQuiz) ─────
// First-match wins. Add & Subtract to 1,000 lessons:
//   u4l1 Adding Really Big Numbers
//   u4l2 Taking Away Really Big Numbers
//   u4l3 Close Enough Counts! (estimation/rounding)
// Estimation/rounding detection runs FIRST because rounding prompts often
// contain "+" or "−" but the skill being tested is estimation, not exact arithmetic.
const reviewItems = [];
function classifyLessonId(prompt){
  const t = String(prompt || '').toLowerCase();

  // u4l3 Close Enough Counts! — estimation / rounding
  if(/\b(estimate|estimation|approximately|best estimate|closest|close enough)\b/.test(t))
    return { id: 'u4l3', confident: true };
  if(/\b(round|rounded|rounding)\b/.test(t))
    return { id: 'u4l3', confident: true };
  if(/\bnearest\s+(ten|tens|hundred|hundreds)\b/.test(t))
    return { id: 'u4l3', confident: true };
  if(/\babout (how|\d)/.test(t))
    return { id: 'u4l3', confident: true };
  if(/\b(is the answer reasonable|is this answer reasonable|reasonable answer|reasonable estimate)\b/.test(t))
    return { id: 'u4l3', confident: true };
  if(/\bdoes (this |the )?(answer )?make sense\b/.test(t))
    return { id: 'u4l3', confident: true };
  if(/\bwhich is closest\b/.test(t))
    return { id: 'u4l3', confident: true };

  // u4l2 Taking Away Really Big Numbers — subtraction language
  if(/\b(subtract|minus|take away|takes away|taking away|difference|fewer|how many.*are.*left|how many.*remain|how many fewer)\b/.test(t))
    return { id: 'u4l2', confident: true };
  if(/\bleft\b/.test(t)) return { id: 'u4l2', confident: false };
  if(/\d+\s*[-−]\s*\d+/.test(t) && !/\d+\s*\+\s*\d+/.test(t))
    return { id: 'u4l2', confident: true };

  // u4l1 Adding Really Big Numbers — addition language / two-term sums
  if(/\b(add|plus|sum|altogether|in all|total)\b/.test(t)) return { id: 'u4l1', confident: true };
  if(/\d+\s*\+\s*\d+/.test(t)) return { id: 'u4l1', confident: true };

  return { id: 'u4l1', confident: false };
}

// ───── Numeric helpers (reused from U3 — handle 1,000-range identically) ─────
function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  const cleaned = String(s).trim().replace(/,/g, '');
  const m = cleaned.match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}

// Compute a numeric value for option strings that aren't bare integers:
//   - Arithmetic expressions: "476 + 285" → 761, "832 - 487" → 345
//   - Pair phrasing: "300 and 500" → 800
function parseExpressionToNumber(s){
  if(typeof s !== 'string') return null;
  const cleaned = s.trim().replace(/,/g, '');
  const tri = cleaned.match(/^(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+)$/);
  if(tri) return parseInt(tri[1],10) + parseInt(tri[2],10) + parseInt(tri[3],10);
  const bin = cleaned.match(/^(\d+)\s*([+\-−])\s*(\d+)$/);
  if(bin){
    const a = parseInt(bin[1],10), b = parseInt(bin[3],10);
    return bin[2] === '+' ? a + b : a - b;
  }
  const pair = cleaned.match(/^(\d+)\s+and\s+(\d+)$/i);
  if(pair) return parseInt(pair[1],10) + parseInt(pair[2],10);
  return null;
}

// For verification-style options ("No, it should be 467", "About 800 each"):
// pull the LAST integer in the string — that's typically the asserted answer.
function extractLastNumberFromText(s){
  if(typeof s !== 'string') return null;
  const cleaned = s.replace(/,/g, '');
  const matches = cleaned.match(/-?\d+/g);
  if(!matches || matches.length === 0) return null;
  return parseInt(matches[matches.length - 1], 10);
}

// Multi-strategy numeric coercion: integer first, then expression, then last-int-in-text.
function getNumericValue(s){
  const plain = tryParseInt(s);
  if(plain !== null) return plain;
  const expr = parseExpressionToNumber(s);
  if(expr !== null) return expr;
  const text = extractLastNumberFromText(s);
  if(text !== null) return text;
  return null;
}

// Two-addend extractor: "X + Y", "X - Y", "X − Y" — generalizes to 1,000-range
function extractAddends(prompt){
  const m = String(prompt || '').replace(/,/g,'').match(/(\d+)\s*([+\-−])\s*(\d+)(?!\s*[+\-−]\s*\d)/);
  if(!m) return null;
  return { a: parseInt(m[1], 10), op: m[2] === '−' ? '-' : m[2], b: parseInt(m[3], 10) };
}

// Walks all places (ones, tens, hundreds, thousands) — works for 1,000-range
function requiresAdditionRegrouping(a, b){
  let carry = 0;
  let pa = a, pb = b;
  while(pa > 0 || pb > 0){
    const sum = (pa % 10) + (pb % 10) + carry;
    if(sum >= 10) return true;
    carry = 0;
    pa = Math.floor(pa / 10);
    pb = Math.floor(pb / 10);
  }
  return false;
}

function requiresSubtractionBorrowing(a, b){
  let pa = a, pb = b;
  while(pa > 0 || pb > 0){
    if((pa % 10) < (pb % 10)) return true;
    pa = Math.floor(pa / 10);
    pb = Math.floor(pb / 10);
  }
  return false;
}

// Add columnwise without carrying — produces the "forgot to regroup" answer
// e.g. 476 + 285 → ones: |6+5|=11→1, tens: |7+8|=15→5, hundreds: |4+2|=6 → 651 (instead of 761)
function computeNoRegroupAdditionMistake(a, b){
  let pa = a, pb = b;
  let result = 0;
  let mul = 1;
  while(pa > 0 || pb > 0){
    const digit = ((pa % 10) + (pb % 10)) % 10;
    result += digit * mul;
    mul *= 10;
    pa = Math.floor(pa / 10);
    pb = Math.floor(pb / 10);
  }
  return result;
}

// Subtract larger-from-smaller per column — produces the "forgot to borrow" answer
// e.g. 832 - 487 → ones: |2-7|=5, tens: |3-8|=5, hundreds: |8-4|=4 → 455 (instead of 345)
function computeNoBorrowSubtractionMistake(a, b){
  let pa = a, pb = b;
  let result = 0;
  let mul = 1;
  while(pa > 0 || pb > 0){
    const digit = Math.abs((pa % 10) - (pb % 10));
    result += digit * mul;
    mul *= 10;
    pa = Math.floor(pa / 10);
    pb = Math.floor(pb / 10);
  }
  return result;
}

// ───── U4-specific helpers (estimation / rounding) ─────
function isEstimationPrompt(prompt){
  const t = String(prompt || '').toLowerCase();
  return /\b(estimate|estimation|approximately|best estimate|closest|close enough)\b/.test(t)
      || /\babout (how|\d)/.test(t)
      || /\b(is the answer reasonable|is this answer reasonable|reasonable answer|reasonable estimate)\b/.test(t)
      || /\bdoes (this |the )?(answer )?make sense\b/.test(t)
      || /\bwhich is closest\b/.test(t);
}

function isRoundingPrompt(prompt){
  const t = String(prompt || '').toLowerCase();
  return /\b(round|rounded|rounding)\b/.test(t)
      || /\bnearest\s+(ten|tens|hundred|hundreds)\b/.test(t);
}

function detectRoundingPlace(prompt){
  const t = String(prompt || '').toLowerCase();
  if(/\bnearest\s+hundred(s)?\b/.test(t)) return 'hundred';
  if(/\bnearest\s+ten(s)?\b/.test(t)) return 'ten';
  return null;
}

function roundToNearestTen(n){
  return Math.round(n / 10) * 10;
}

function roundToNearestHundred(n){
  return Math.round(n / 100) * 100;
}

function roundDownToTen(n){ return Math.floor(n / 10) * 10; }
function roundUpToTen(n){ return Math.ceil(n / 10) * 10; }
function roundDownToHundred(n){ return Math.floor(n / 100) * 100; }
function roundUpToHundred(n){ return Math.ceil(n / 100) * 100; }

// Same multiset of digits but in different positions: e.g., 762 vs 627
function detectPlaceValueDigitPattern(wrong, correct){
  if(wrong === correct) return false;
  const w = String(Math.abs(wrong)).split('').sort();
  const c = String(Math.abs(correct)).split('').sort();
  if(w.length !== c.length) return false;
  for(let i = 0; i < w.length; i++){ if(w[i] !== c[i]) return false; }
  return true;
}

// Extract numbers from prompt that could be the source of a rounding question
function extractPromptNumbers(prompt){
  const cleaned = String(prompt || '').replace(/,/g,'');
  const matches = cleaned.match(/\d+/g) || [];
  return matches.map(n => parseInt(n,10)).filter(n => Number.isFinite(n));
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_estimate_exact_answer: 0,
  err_rounds_wrong_place: 0,
  err_rounding_error: 0,
  err_reasonableness_confusion: 0,
  err_off_by_one: 0,
  err_sub_instead: 0,
  err_add_instead: 0,
  err_left_only: 0,
  err_right_only: 0,
  err_no_regroup: 0,
  err_extra_regroup: 0,
  err_borrow_error: 0,
  err_regrouping_error: 0,
  err_place_value_confusion: 0,
  err_magnitude_error: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId){
  const wn = getNumericValue(wrongVal);
  const cn = getNumericValue(correctVal);

  // Fallback if either side isn't a number we can extract
  if(wn === null || cn === null){
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  const delta = wn - cn;
  const absDelta = Math.abs(delta);

  // ── Rule 1: Estimation / rounding rules (run first for u4l3 + estimation prompts) ──
  const isEstim = lessonId === 'u4l3' || isEstimationPrompt(prompt) || isRoundingPrompt(prompt);
  if(isEstim){
    // 1a: Exact answer chosen when estimate requested
    //  - Two-addend prompts: wrong equals the exact arithmetic result
    //  - Rounding prompts: wrong equals the source number unchanged ("didn't round")
    const ad = extractAddends(prompt);
    if(ad){
      const exact = ad.op === '+' ? ad.a + ad.b : ad.a - ad.b;
      if(wn === exact && cn !== exact){
        return { tag: 'err_estimate_exact_answer', patternTag: 'pattern_chose_exact_answer_not_estimate' };
      }
    }
    if(isRoundingPrompt(prompt)){
      const promptNums = extractPromptNumbers(prompt).filter(n => n >= 10);
      if(promptNums.includes(wn) && wn !== cn){
        return { tag: 'err_estimate_exact_answer', patternTag: 'pattern_chose_exact_answer_not_estimate' };
      }
    }

    // 1b: Wrong rounding place (asks nearest hundred but distractor rounded to ten, or vice versa)
    //  - Standard rounding (Math.round) and also floor/ceil to the unintended place
    if(isRoundingPrompt(prompt)){
      const place = detectRoundingPlace(prompt);
      const nums = extractPromptNumbers(prompt).filter(n => n >= 10);
      for(const src of nums){
        if(place === 'hundred'){
          // wrong looks like a tens-place rounding of source while correct is hundreds-place rounding
          const tenVariants = [roundToNearestTen(src), roundDownToTen(src), roundUpToTen(src)];
          if(tenVariants.includes(wn) && roundToNearestHundred(src) === cn && wn !== cn){
            return { tag: 'err_rounds_wrong_place', patternTag: 'pattern_rounded_to_tens_not_hundreds' };
          }
        }
        if(place === 'ten'){
          const hundredVariants = [roundToNearestHundred(src), roundDownToHundred(src), roundUpToHundred(src)];
          if(hundredVariants.includes(wn) && roundToNearestTen(src) === cn && wn !== cn){
            return { tag: 'err_rounds_wrong_place', patternTag: 'pattern_rounded_to_hundreds_not_tens' };
          }
        }
      }
    }

    // 1c: Rounded wrong direction (off by exactly one rounding step in the targeted place)
    if(isRoundingPrompt(prompt)){
      const place = detectRoundingPlace(prompt);
      const step = place === 'hundred' ? 100 : place === 'ten' ? 10 : null;
      const nums = extractPromptNumbers(prompt).filter(n => n >= 10);
      // Direct ±step against correct
      if(step && (wn === cn + step || wn === cn - step)){
        return { tag: 'err_rounding_error', patternTag: wn > cn ? 'pattern_rounds_up_instead' : 'pattern_rounds_down_instead' };
      }
      // Or floor/ceil mismatch from source
      if(step){
        for(const src of nums){
          if(step === 10){
            if(roundDownToTen(src) === wn && roundUpToTen(src) === cn && wn !== cn){
              return { tag: 'err_rounding_error', patternTag: 'pattern_rounds_down_instead' };
            }
            if(roundUpToTen(src) === wn && roundDownToTen(src) === cn && wn !== cn){
              return { tag: 'err_rounding_error', patternTag: 'pattern_rounds_up_instead' };
            }
          }
          if(step === 100){
            if(roundDownToHundred(src) === wn && roundUpToHundred(src) === cn && wn !== cn){
              return { tag: 'err_rounding_error', patternTag: 'pattern_rounds_down_instead' };
            }
            if(roundUpToHundred(src) === wn && roundDownToHundred(src) === cn && wn !== cn){
              return { tag: 'err_rounding_error', patternTag: 'pattern_rounds_up_instead' };
            }
          }
        }
      }
    }

    // 1d: Reasonableness — for "reasonable"/"closest" prompts where wrong is far from correct
    if(/\b(reasonable|closest|close enough)\b/.test(String(prompt || '').toLowerCase())){
      if(absDelta >= 100){
        return { tag: 'err_reasonableness_confusion', patternTag: 'pattern_reasonableness_error' };
      }
    }
    // Fall through to general rules if no estimation-specific match
  }

  // ── Rule 2: Off-by-one ──
  if(absDelta === 1){
    return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
  }

  // ── Rule 3: Wrong arithmetic operation (two-addend prompts) ──
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

  // ── Rule 4: Used only one number (left/right operand) ──
  if(ad){
    if(wn === ad.a) return { tag: 'err_left_only', patternTag: 'pattern_used_left_only' };
    if(wn === ad.b) return { tag: 'err_right_only', patternTag: 'pattern_used_right_only' };
  }

  // ── Rule 5: Regrouping / borrowing errors ──
  if(ad){
    if(ad.op === '+'){
      if(requiresAdditionRegrouping(ad.a, ad.b)){
        const noRegroup = computeNoRegroupAdditionMistake(ad.a, ad.b);
        if(wn === noRegroup){
          return { tag: 'err_no_regroup', patternTag: 'pattern_forgot_regroup' };
        }
      } else {
        if(wn === cn + 10 || wn === cn - 10 || wn === cn + 100 || wn === cn - 100){
          return { tag: 'err_extra_regroup', patternTag: 'pattern_unneeded_regroup' };
        }
      }
    }
    if(ad.op === '-'){
      if(requiresSubtractionBorrowing(ad.a, ad.b)){
        const noBorrow = computeNoBorrowSubtractionMistake(ad.a, ad.b);
        if(wn === noBorrow){
          return { tag: 'err_borrow_error', patternTag: 'pattern_borrowed_wrong_place' };
        }
      }
    }
  }

  // ── Rule 6: Place-value confusion (right digits, wrong place) ──
  if(detectPlaceValueDigitPattern(wn, cn)){
    return { tag: 'err_place_value_confusion', patternTag: 'pattern_wrong_place_value' };
  }

  // ── Rule 7: Magnitude error (×10/÷10/×100/÷100) ──
  if(cn !== 0 && wn !== 0){
    if(wn === cn * 10 || wn === cn * 100){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
    }
    if(cn % 10 === 0 && wn === cn / 10){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
    if(cn % 100 === 0 && wn === cn / 100){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
  }

  // ── Rule 8: Numeric magnitude fallback ──
  if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
  return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
}

// ───── Option converter ─────
const stats = {
  totalQuestions: 0,
  qBankConverted: 0,
  testBankConverted: 0,
  unitQuizConverted: 0,
  alreadyObjectForm: 0,
  ambiguousLessonIds: 0,
  indexMismatches: 0,
  totalDistractors: 0,
};

function isBareStringOptions(o){
  return Array.isArray(o) && o.length > 0 && o.every(x => typeof x === 'string' || typeof x === 'number');
}

function convertOptions(q, where, lessonId){
  if(!q || !Array.isArray(q.o)) return;
  const a = q.a;
  if(!Number.isInteger(a) || a < 0 || a >= q.o.length){
    console.error(`FATAL: out-of-range answer index a=${a} in ${where}: ${JSON.stringify(q).slice(0,160)}`);
    process.exit(1);
  }
  if(!isBareStringOptions(q.o)){
    stats.alreadyObjectForm++;
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
    const cls = classifyDistractor(val, originalCorrect, q.t, lessonId);
    heuristicCounts[cls.tag] = (heuristicCounts[cls.tag] || 0) + 1;
    stats.totalDistractors++;
    if(cls.tag === 'err_confused'){
      reviewItems.push(`fallback distractor in ${where}: prompt="${String(q.t).slice(0,120)}" correct="${originalCorrect}" wrong="${val}"`);
    }
    return { val: String(val), tag: cls.tag, patternTag: cls.patternTag };
  });

  // Check duplicates
  const seen = new Set();
  for(const opt of newOpts){
    if(seen.has(opt.val)){
      console.error(`FATAL: duplicate option val="${opt.val}" in ${where}: ${JSON.stringify(newOpts)}`);
      process.exit(1);
    }
    seen.add(opt.val);
  }

  // Assert correct-index preservation
  if(newOpts[a].val !== String(originalCorrect)){
    console.error(`FATAL: correct-answer drift in ${where}: was "${originalCorrect}", now "${newOpts[a].val}"`);
    stats.indexMismatches++;
    process.exit(1);
  }

  q.o = newOpts;
}

// ───── Walk + transform ─────
data.lessons.forEach((lesson, lessonIdx) => {
  const lessonId = `u4l${lessonIdx + 1}`;
  if(Array.isArray(lesson.qBank)){
    lesson.qBank.forEach((q, qi) => {
      stats.totalQuestions++;
      q.lessonId = lessonId;
      convertOptions(q, `qBank[${lessonId}][${qi}]`, lessonId);
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
    convertOptions(q, `testBank[${qi}]`, cls.id);
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
    convertOptions(q, `unitQuiz[${qi}]`, cls.id);
    stats.unitQuizConverted++;
  });
}

// ───── Per-lesson distribution (for report) ─────
const perLesson = { u4l1: 0, u4l2: 0, u4l3: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u4l${idx+1}`;
  if(Array.isArray(lesson.qBank)) perLesson[id] = (perLesson[id] || 0) + lesson.qBank.length;
});
if(Array.isArray(data.testBank)){
  data.testBank.forEach(q => { perLesson[q.lessonId] = (perLesson[q.lessonId] || 0) + 1; });
}
if(Array.isArray(data.unitQuiz)){
  data.unitQuiz.forEach(q => { perLesson[q.lessonId] = (perLesson[q.lessonId] || 0) + 1; });
}

// ───── Write review file ─────
fs.writeFileSync(REVIEW_PATH, reviewItems.join('\n') + '\n', 'utf8');

// ───── Re-emit u4.js ─────
const header = '// Unit 4: Add & Subtract to 1,000\n';
const body = '_mergeUnitData(3, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U4_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u4_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length
}, null, 2));
console.log('Wrote:', U4_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
