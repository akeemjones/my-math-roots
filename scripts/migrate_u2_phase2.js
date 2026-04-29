#!/usr/bin/env node
// scripts/migrate_u2_phase2.js
// One-shot transform for Grade 2 Unit 2 (Place Value) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u2.js with the transformed payload

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U2_PATH = path.join(REPO_ROOT, 'src', 'data', 'u2.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u2_review.txt');

// ───── Load u2.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U2_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 1) { console.error('FATAL: expected idx=1, got', idx); process.exit(1); }

// ───── lessonId classifier (testBank/unitQuiz) ─────
// First-match wins. Place Value domain lessons:
//   u2l1 Big Numbers — digit/place/value identification
//   u2l2 Different Ways to Write Numbers — expanded/word/standard form
//   u2l3 Bigger or Smaller? — comparison
//   u2l4 Skip Counting — patterns + skip count by 2/5/10/100
const reviewItems = [];
function classifyLessonId(prompt){
  const t = String(prompt || '').toLowerCase();
  // u2l4: skip counting + patterns
  if(/skip count|count by [25]\b|count by 10\b|count by 100\b|by 2s|by 5s|by 10s|by 100s|next number in the pattern|continue the pattern|what comes next/.test(t))
    return { id: 'u2l4', confident: true };
  // u2l3: comparison
  if(/(?:greater|less|bigger|smaller) than|>|<|equal to|compare|biggest|smallest|largest|which is more|which is less|which number is (?:greater|larger|bigger|smaller)/.test(t))
    return { id: 'u2l3', confident: true };
  // u2l2: expanded/word/standard form transformations
  if(/expanded form|word form|standard form|written as|in words|three different ways|how do you write|written form/.test(t))
    return { id: 'u2l2', confident: true };
  // u2l1: digit/place/value identification (catches "what is the value of 4 in 347" etc.)
  if(/value of (?:the )?\d|in (?:the )?(?:hundreds|tens|ones) (?:place|digit)|what (?:digit|number) is in the|what is the (?:hundreds|tens|ones)|base.?10 block|hundreds digit|tens digit|ones digit|place value/.test(t))
    return { id: 'u2l1', confident: true };
  // Soft heuristics — flag for review
  if(/digit|place|hundreds|tens|ones/.test(t)) return { id: 'u2l1', confident: false };
  return { id: 'u2l1', confident: false };
}

// ───── Distractor heuristics (Place Value domain) ─────
function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  // Strip thousands-separator commas: "1,000" → 1000
  const cleaned = String(s).trim().replace(/,/g, '');
  const m = cleaned.match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}

// Detect expanded-form expressions like "100 + 40 + 2", "300 + 0 + 5"
function parseExpandedForm(s){
  if(typeof s !== 'string') return null;
  const t = s.trim();
  // Must contain at least one '+' and only digits, '+', whitespace, commas
  if(!/^[\d,+\s]+$/.test(t)) return null;
  if(!t.includes('+')) return null;
  const parts = t.split('+').map(p => p.trim().replace(/,/g, ''));
  if(parts.length < 2) return null;
  const nums = parts.map(p => /^\d+$/.test(p) ? parseInt(p, 10) : NaN);
  if(nums.some(n => !Number.isFinite(n))) return null;
  return { parts: nums, sum: nums.reduce((a,b)=>a+b, 0) };
}

// Detect number-list answers like "10, 20, 30, 40" or "6, 8, 10"
function parseNumberList(s){
  if(typeof s !== 'string') return null;
  const t = s.trim();
  // At least 2 numbers separated by commas
  if(!/,/.test(t)) return null;
  const parts = t.split(',').map(p => p.trim().replace(/,/g, ''));
  if(parts.length < 2) return null;
  const nums = parts.map(p => {
    const m = p.replace(/,/g,'').match(/^-?\d+$/);
    return m ? parseInt(m[0], 10) : NaN;
  });
  if(nums.some(n => !Number.isFinite(n))) return null;
  return nums;
}

// Detect place-name answers ("Tens", "Ones", "Hundreds", "Thousands")
function isPlaceName(s){
  return typeof s === 'string' && /^(ones|tens|hundreds|thousands)$/i.test(s.trim());
}

// Detect "Add N" rule answers in skip-count questions
function parseAddRule(s){
  if(typeof s !== 'string') return null;
  const m = s.trim().match(/^(?:add|subtract|count by)\s+(\d+)s?$/i);
  return m ? parseInt(m[1], 10) : null;
}

function digitsOf(n){
  if(!Number.isInteger(n) || n < 0) return null;
  return String(n).split('').map(d => parseInt(d, 10));
}

// Detect tens/ones swap: same hundreds digit, but tens & ones swapped
function isTensOnesSwap(correctN, wrongN){
  if(correctN < 10 || wrongN < 10) return false;
  const cd = digitsOf(correctN);
  const wd = digitsOf(wrongN);
  if(!cd || !wd || cd.length !== wd.length) return false;
  if(cd.length < 2) return false;
  // For 2-digit: full swap is reversed-digits, not tens/ones swap
  if(cd.length === 2) return false;
  // For 3-digit: hundreds match, ones&tens reversed → swap
  if(cd.length === 3){
    return cd[0] === wd[0] && cd[1] === wd[2] && cd[2] === wd[1] && cd[1] !== cd[2];
  }
  // Higher digits: rare; check last two only
  return cd.slice(0,-2).join('') === wd.slice(0,-2).join('') &&
         cd[cd.length-1] === wd[cd.length-2] && cd[cd.length-2] === wd[cd.length-1] &&
         cd[cd.length-1] !== cd[cd.length-2];
}

// Detect hundreds/tens swap: same ones digit, but hundreds&tens swapped (3-digit)
function isHundredsTensSwap(correctN, wrongN){
  if(correctN < 100 || wrongN < 100) return false;
  const cd = digitsOf(correctN);
  const wd = digitsOf(wrongN);
  if(!cd || !wd || cd.length !== 3 || wd.length !== 3) return false;
  return cd[2] === wd[2] && cd[0] === wd[1] && cd[1] === wd[0] && cd[0] !== cd[1];
}

// Detect full digit reversal: every digit reversed end-to-end
function isFullDigitReversal(correctN, wrongN){
  if(correctN === wrongN) return false;
  const cd = digitsOf(correctN);
  const wd = digitsOf(wrongN);
  if(!cd || !wd || cd.length !== wd.length) return false;
  if(cd.length < 2) return false;
  for(let i = 0; i < cd.length; i++){
    if(cd[i] !== wd[cd.length - 1 - i]) return false;
  }
  return true;
}

// Detect "value of digit D in N" prompts and extract (D, N).
function parseValueOfDigit(prompt){
  if(!prompt) return null;
  const t = String(prompt);
  // Match "value of (the) D in N" or "what is D's value in N"
  let m = t.match(/value\s+of\s+(?:the\s+)?(\d+)\s+in\s+(\d+)/i);
  if(m) return { digit: parseInt(m[1],10), num: parseInt(m[2],10) };
  m = t.match(/in\s+(\d+),\s*(?:what\s+is\s+)?(?:the\s+)?(\d+)['']?s?\s+value/i);
  if(m) return { digit: parseInt(m[2],10), num: parseInt(m[1],10) };
  return null;
}

// Detect "what is the (hundreds|tens|ones) digit of N" prompts
function parseDigitAtPlace(prompt){
  if(!prompt) return null;
  const t = String(prompt).toLowerCase();
  let m = t.match(/in\s+(\d+),?\s+what\s+is\s+the\s+(hundreds|tens|ones)\s+digit/);
  if(m) return { num: parseInt(m[1],10), place: m[2] };
  m = t.match(/what\s+(?:digit|number)\s+is\s+in\s+the\s+(hundreds|tens|ones)\s+(?:place|digit)\s+of\s+(\d+)/);
  if(m) return { num: parseInt(m[2],10), place: m[1] };
  m = t.match(/in\s+(\d+),?\s+what\s+digit\s+is\s+in\s+the\s+(hundreds|tens|ones)/);
  if(m) return { num: parseInt(m[1],10), place: m[2] };
  return null;
}

function placeFactor(place){
  if(place === 'hundreds') return 100;
  if(place === 'tens') return 10;
  if(place === 'ones') return 1;
  return null;
}

function isComparisonPrompt(t){
  return /(?:greater|less|bigger|smaller) than|>|<|equal to|which is more|which is less|biggest|smallest|largest|which symbol goes in|fill in the blank|symbol goes between/i.test(t);
}

function isWordFormPrompt(t){
  return /word form|in words|how do you write.*as words|spell out/i.test(t);
}

function isSkipCountPrompt(t){
  return /skip count|count by [25]\b|count by 10\b|count by 100\b|by 2s|by 5s|by 10s|by 100s|next number in the pattern|continue the pattern|what comes next/i.test(t);
}

function isExpandedFormPrompt(t){
  return /expanded form|written as|standard form|three different ways|word form|how do you write/i.test(t);
}

// Estimate skip-count step from prompt (e.g. "10, 12, 14, ___" → step 2)
function estimateSkipStep(prompt){
  if(!prompt) return null;
  const nums = String(prompt).match(/\b\d+\b/g);
  if(!nums || nums.length < 2) return null;
  const n0 = parseInt(nums[0],10);
  const n1 = parseInt(nums[1],10);
  if(!Number.isFinite(n0) || !Number.isFinite(n1)) return null;
  const diff = n1 - n0;
  if(Math.abs(diff) === 2 || Math.abs(diff) === 5 || Math.abs(diff) === 10 || Math.abs(diff) === 100) return diff;
  // Try second pair
  if(nums.length >= 3){
    const n2 = parseInt(nums[2],10);
    const diff2 = n2 - n1;
    if(Math.abs(diff2) === 2 || Math.abs(diff2) === 5 || Math.abs(diff2) === 10 || Math.abs(diff2) === 100) return diff2;
  }
  return null;
}

function classifyDistractor(wrongVal, correctVal, prompt){
  const promptStr = String(prompt || '');
  const wn = tryParseInt(wrongVal);
  const cn = tryParseInt(correctVal);
  const wStr = String(wrongVal);
  const cStr = String(correctVal);

  // ─── Branch A: Comparison non-numeric distractors (>, <, =, "Equal", "Cannot tell") ───
  if(isComparisonPrompt(promptStr) && (wn === null)){
    return { tag: 'err_compare_place_value', patternTag: 'pattern_wrong_place_value' };
  }

  // ─── Branch B: Place-name distractors ("Tens", "Ones", "Hundreds") ───
  if(isPlaceName(wStr) && isPlaceName(cStr)){
    return { tag: 'err_place_value_confusion', patternTag: 'pattern_wrong_place_value' };
  }

  // ─── Branch C: Expanded-form expressions ("100 + 40 + 2" vs "100 + 20 + 4") ───
  const cExp = parseExpandedForm(cStr);
  const wExp = parseExpandedForm(wStr);
  if(cExp && wExp){
    return { tag: 'err_expanded_form_confusion', patternTag: 'pattern_wrong_expanded_form' };
  }
  // One side expanded, other side scalar → expanded vs concatenated/standard form mismatch
  if((cExp && wn !== null) || (wExp && cn !== null)){
    return { tag: 'err_expanded_form_confusion', patternTag: 'pattern_wrong_expanded_form' };
  }

  // ─── Branch D: Skip-count "Add N" rule answers ───
  if(isSkipCountPrompt(promptStr)){
    const cRule = parseAddRule(cStr);
    const wRule = parseAddRule(wStr);
    if(cRule !== null && wRule !== null){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_skip_count_wrong_step' };
    }
  }

  // ─── Branch E: Number-list skip-count answers ("10, 20, 30, 40" vs "5, 10, 15, 20") ───
  const cList = parseNumberList(cStr);
  const wList = parseNumberList(wStr);
  if(cList && wList && cList.length >= 2 && wList.length >= 2){
    if(isSkipCountPrompt(promptStr) || /pattern|sequence|next|count/i.test(promptStr)){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_skip_count_wrong_step' };
    }
  }

  // ─── Branch F: Word-form prompts (text-based "Different Ways to Write Numbers") ───
  if(isWordFormPrompt(promptStr) && wn === null){
    return { tag: 'err_expanded_form_confusion', patternTag: 'pattern_wrong_expanded_form' };
  }
  // u2l2 prompt asking for standard-form from words: text correct, numeric wrong is magnitude error
  if(/standard form|how do you write/i.test(promptStr) && wn !== null && cn === null){
    return { tag: 'err_expanded_form_confusion', patternTag: 'pattern_wrong_expanded_form' };
  }

  // If either side is non-numeric and no specialized branch caught it, fall back
  if(wn === null || cn === null){
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  // Branch 1+2: Skip count
  if(isSkipCountPrompt(promptStr)){
    const step = estimateSkipStep(promptStr);
    const delta = wn - cn;
    if(Math.abs(delta) === 1){
      return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_too_high' : 'pattern_too_low' };
    }
    if(step !== null && delta !== 0){
      // If wrong is on the count line but at a wrong step (e.g. step+1, step-1, 2*step, 0*step)
      // we treat anything ≠ step as wrong-step
      return { tag: 'err_skip_count_error', patternTag: 'pattern_skip_count_wrong_step' };
    }
    // Fallback within skip-count: magnitude
    if(Math.abs(delta) === 2){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_skip_count_wrong_step' };
    }
    return { tag: 'err_magnitude_error', patternTag: delta > 0 ? 'pattern_too_high' : 'pattern_too_low' };
  }

  // Branches 6 & 7: Place-of-digit / value-of-digit prompts
  const valQ = parseValueOfDigit(promptStr);
  if(valQ){
    // correct should be valQ.digit * place; wrong=digit alone → digit-vs-value confusion
    if(wn === valQ.digit){
      return { tag: 'err_digit_value_confusion', patternTag: 'pattern_wrong_place_value' };
    }
    // wrong = digit × wrong place magnitude (×10 or ×100 off from correct)
    if(cn !== 0){
      const ratio = wn / cn;
      if(ratio === 10 || ratio === 100 || ratio === 0.1 || ratio === 0.01){
        return { tag: 'err_magnitude_error', patternTag: ratio > 1 ? 'pattern_too_high' : 'pattern_too_low' };
      }
    }
  }
  const placeQ = parseDigitAtPlace(promptStr);
  if(placeQ){
    const numDigits = digitsOf(placeQ.num);
    if(numDigits){
      // wrong is one of the OTHER digits in the same number → wrong place identified
      const placeIdxFromRight = placeQ.place === 'ones' ? 0 : placeQ.place === 'tens' ? 1 : 2;
      const otherDigits = numDigits.filter((d, i) => (numDigits.length - 1 - i) !== placeIdxFromRight);
      if(otherDigits.includes(wn)){
        return { tag: 'err_place_value_confusion', patternTag: 'pattern_wrong_place_value' };
      }
      // wrong is a multi-digit concatenation of two of N's digits → digit/value confusion
      const wnStr = String(wn);
      if(wnStr.length >= 2 && wnStr.length < numDigits.length){
        const numStr = String(placeQ.num);
        if(numStr.includes(wnStr)){
          return { tag: 'err_digit_value_confusion', patternTag: 'pattern_wrong_place_value' };
        }
      }
    }
  }

  // Branches 3,4,5: Digit position swaps (numeric only, both same-length integers)
  if(isTensOnesSwap(cn, wn)){
    return { tag: 'err_tens_ones_swap', patternTag: 'pattern_tens_ones_swap' };
  }
  if(isHundredsTensSwap(cn, wn)){
    return { tag: 'err_hundreds_tens_swap', patternTag: 'pattern_hundreds_tens_swap' };
  }
  if(isFullDigitReversal(cn, wn)){
    return { tag: 'err_reversed_digits', patternTag: 'pattern_digit_reversal' };
  }

  // Branch 8: Comparison prompts — wrong picks the smaller-when-comparing-by-ones option
  if(isComparisonPrompt(promptStr) && wn !== cn){
    return { tag: 'err_compare_place_value', patternTag: 'pattern_compared_ones_first' };
  }

  // Branch 9: Expanded form mismatch (numeric distractor on expanded-form prompt with same digits, wrong place values)
  if(isExpandedFormPrompt(promptStr)){
    const cd = digitsOf(cn);
    const wd = digitsOf(wn);
    if(cd && wd){
      const cdSorted = cd.slice().sort().join('');
      const wdSorted = wd.slice().sort().join('');
      if(cdSorted === wdSorted && cn !== wn){
        return { tag: 'err_expanded_form_confusion', patternTag: 'pattern_wrong_expanded_form' };
      }
    }
  }

  // Branch 10: Magnitude off by ×10/×100 (general — outside skip-count)
  if(cn !== 0){
    const ratio = wn / cn;
    if(ratio === 10 || ratio === 100 || ratio === 1000){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
    }
    if(ratio === 0.1 || ratio === 0.01 || ratio === 0.001){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
  }

  // Branch 1 again: ±1 off (general — used after specific branches don't trigger)
  const delta = wn - cn;
  if(Math.abs(delta) === 1){
    return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_too_high' : 'pattern_too_low' };
  }

  // Branches 11/12: Larger gaps
  if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
  if(delta > 0) return { tag: 'err_over_count', patternTag: 'pattern_too_high' };

  // Last resort
  return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
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

const heuristicCounts = {};
function bump(tag){ heuristicCounts[tag] = (heuristicCounts[tag] || 0) + 1; }

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
    bump(cls.tag);
    if(cls.tag === 'err_confused'){
      reviewItems.push(`fallback distractor in ${where}: prompt="${String(q.t).slice(0,80)}", correct="${originalCorrect}", wrong="${val}"`);
    }
    return { val: String(val), tag: cls.tag, patternTag: cls.patternTag };
  });

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
  const lessonId = `u2l${lessonIdx + 1}`;
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

// ───── Re-emit u2.js ─────
const header = '// Unit 2: Place Value\n';
const body = '_mergeUnitData(1, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U2_PATH, header + body, 'utf8');

// ───── Report ─────
console.log('=== migrate_u2_phase2 ===');
console.log(JSON.stringify({ stats, heuristicCounts, reviewListSize: reviewItems.length }, null, 2));
console.log('Wrote:', U2_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
