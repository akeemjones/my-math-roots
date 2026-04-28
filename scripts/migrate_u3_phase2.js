#!/usr/bin/env node
// scripts/migrate_u3_phase2.js
// One-shot transform for Grade 2 Unit 3 (Add & Subtract to 200) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u3.js with the transformed payload

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U3_PATH = path.join(REPO_ROOT, 'src', 'data', 'u3.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u3_review.txt');

// ───── Load u3.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U3_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 2) { console.error('FATAL: expected idx=2, got', idx); process.exit(1); }

// ───── lessonId classifier (testBank/unitQuiz) ─────
// First-match wins. Add & Subtract to 200 lessons:
//   u3l1 Adding Bigger Numbers
//   u3l2 Taking Away Bigger Numbers
//   u3l3 Add Three Numbers
//   u3l4 Math Stories
// Story-problem detection runs FIRST so words like "left"/"in all" inside a story
// don't misroute. Three-addend detection runs BEFORE generic addition.
const reviewItems = [];
function classifyLessonId(prompt){
  const t = String(prompt || '').toLowerCase();

  // u3l4 Math Stories — explicit story markers
  if(/\b(story|word problem|altogether|in all|how many more|how many fewer|how many.*left|how many.*are left|how many.*remain|more than|fewer than|in total)\b/.test(t))
    return { id: 'u3l4', confident: true };
  // sentence-shape: subject + give/take/have verb + a number → story
  if(/\b(has|have|had|gives|gave|takes|took|buys|bought|sells|sold|finds|found|loses|lost|shares|shared|brings|brought|eats|ate|reads|read|wins|won|baked|bakes|made|makes)\b.*\b\d+\b/.test(t))
    return { id: 'u3l4', confident: true };

  // u3l3 Add Three Numbers — three-addend phrases or three-term sums
  if(/\b(three numbers|add three|find the total of)\b/.test(t))
    return { id: 'u3l3', confident: true };
  if(/\d+\s*\+\s*\d+\s*\+\s*\d+/.test(t))
    return { id: 'u3l3', confident: true };

  // u3l2 Taking Away Bigger Numbers — subtraction language
  if(/\b(subtract|minus|take away|takes away|taking away|difference|remain|fewer|how many.*are.*left)\b/.test(t))
    return { id: 'u3l2', confident: true };
  if(/\bleft\b/.test(t)) return { id: 'u3l2', confident: false };
  if(/\d+\s*[-−]\s*\d+/.test(t) && !/\d+\s*\+\s*\d+/.test(t))
    return { id: 'u3l2', confident: true };

  // u3l1 Adding Bigger Numbers — addition language / two-term sums
  if(/\b(add|plus|sum|total)\b/.test(t)) return { id: 'u3l1', confident: true };
  if(/\d+\s*\+\s*\d+/.test(t)) return { id: 'u3l1', confident: true };

  return { id: 'u3l1', confident: false };
}

// ───── Distractor helpers (Add/Subtract domain) ─────
function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  const cleaned = String(s).trim().replace(/,/g, '');
  const m = cleaned.match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}

// Compute a numeric value for option strings that aren't bare integers:
//   - Arithmetic expressions: "47 + 38" → 85, "53 - 27" → 26, "5 + 7 + 5" → 17
//   - Pair phrasing: "6 and 4" → 10
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

// For verification-style options ("No, it should be 134", "About 45 each"):
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

// Two-addend extractor: "X + Y", "X - Y", "X − Y"
function extractAddends(prompt){
  const m = String(prompt || '').match(/(\d+)\s*([+\-−])\s*(\d+)(?!\s*[+\-−]\s*\d)/);
  if(!m) return null;
  return { a: parseInt(m[1], 10), op: m[2] === '−' ? '-' : m[2], b: parseInt(m[3], 10) };
}

// Three-addend extractor: "X + Y + Z" (addition only)
function extractThreeAddends(prompt){
  const m = String(prompt || '').match(/(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+)/);
  if(!m) return null;
  return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10)];
}

// Heuristic: 'add' if joining/total cues, 'sub' if separating/comparing cues, else null
function detectStoryOperation(prompt){
  const t = String(prompt || '').toLowerCase();
  // Subtraction cues run first — "more than X has" is comparison
  if(/\b(gave away|took|took away|loses|lost|fewer|less than|how many.*left|how many.*remain|how many more|how many fewer|difference|gone)\b/.test(t)) return 'sub';
  if(/\b(altogether|in all|in total|total|combined|joined|added|both|together|more|bought|brought|gave|got|made|baked|reads|won|earned|found|saved)\b/.test(t)) return 'add';
  return null;
}

function requiresAdditionRegrouping(a, b){
  return ((a % 10) + (b % 10)) >= 10
      || ((Math.floor(a/10) % 10) + (Math.floor(b/10) % 10) + (((a%10)+(b%10)) >= 10 ? 1 : 0)) >= 10;
}

function requiresSubtractionBorrowing(a, b){
  return (a % 10) < (b % 10) || (Math.floor(a/10) % 10) < (Math.floor(b/10) % 10);
}

// Add columnwise without carrying — produces the "forgot to regroup" answer
// e.g. 27 + 18 → ones: 5, tens: 3, hundreds: 0  → 35 (instead of 45)
function computeNoRegroupAdditionMistake(a, b){
  const ones = (a % 10) + (b % 10);
  const tens = (Math.floor(a/10) % 10) + (Math.floor(b/10) % 10);
  const hundreds = Math.floor(a/100) + Math.floor(b/100);
  return hundreds * 100 + (tens % 10) * 10 + (ones % 10);
}

// Subtract larger-from-smaller per column — produces the "forgot to borrow" answer
// e.g. 53 - 27 → ones: |3-7|=4, tens: |5-2|=3 → 34 (instead of 26)
function computeNoBorrowSubtractionMistake(a, b){
  const ones = Math.abs((a % 10) - (b % 10));
  const tens = Math.abs((Math.floor(a/10) % 10) - (Math.floor(b/10) % 10));
  const hundreds = Math.abs(Math.floor(a/100) - Math.floor(b/100));
  return hundreds * 100 + tens * 10 + ones;
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_off_by_one: 0,
  err_three_number_strategy: 0,
  err_sub_instead: 0,
  err_add_instead: 0,
  err_word_problem_operation: 0,
  err_left_only: 0,
  err_right_only: 0,
  err_no_regroup: 0,
  err_borrow_error: 0,
  err_extra_regroup: 0,
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

  // Rule 1: Off-by-one
  if(absDelta === 1){
    return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
  }

  // Rule 2: Three-addend strategies (u3l3 only)
  if(lessonId === 'u3l3'){
    const tri = extractThreeAddends(prompt);
    if(tri){
      // wrong equals one of the addends → used only one
      if(tri.includes(wn)){
        return { tag: 'err_three_number_strategy', patternTag: 'pattern_used_left_only' };
      }
      // wrong equals sum of any two of three → grouping error
      const pairs = [[tri[0]+tri[1]], [tri[0]+tri[2]], [tri[1]+tri[2]]];
      if(pairs.some(p => p[0] === wn)){
        return { tag: 'err_three_number_strategy', patternTag: 'pattern_three_addend_grouping_error' };
      }
      // wrong is correct ± one of the addends → missed make-ten / forgot one
      if(tri.some(x => wn === cn + x || wn === cn - x)){
        return { tag: 'err_three_number_strategy', patternTag: 'pattern_missed_make_ten' };
      }
    }
  }

  // Rule 3: Wrong arithmetic operation (two-addend prompts)
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

  // Rule 4: Story-problem operation confusion (u3l4)
  if(lessonId === 'u3l4'){
    const op = detectStoryOperation(prompt);
    // For story problems, extract any two numbers from the prompt
    const nums = (String(prompt || '').match(/\d+/g) || []).map(n => parseInt(n,10)).filter(n => Number.isFinite(n));
    if(op === 'add' && nums.length >= 2){
      const expectedDiff = Math.abs(nums[0] - nums[1]);
      if(wn === expectedDiff && cn !== expectedDiff){
        return { tag: 'err_word_problem_operation', patternTag: 'pattern_wrong_operation_from_story' };
      }
    }
    if(op === 'sub' && nums.length >= 2){
      const expectedSum = nums[0] + nums[1];
      if(wn === expectedSum && cn !== expectedSum){
        return { tag: 'err_word_problem_operation', patternTag: 'pattern_wrong_operation_from_story' };
      }
    }
  }

  // Rule 5: Used only one number (left/right operand)
  if(ad){
    if(wn === ad.a) return { tag: 'err_left_only', patternTag: 'pattern_used_left_only' };
    if(wn === ad.b) return { tag: 'err_right_only', patternTag: 'pattern_used_right_only' };
  }

  // Rule 6: Regrouping / borrowing errors (only for parseable two-addend prompts)
  if(ad){
    if(ad.op === '+'){
      if(requiresAdditionRegrouping(ad.a, ad.b)){
        const noRegroup = computeNoRegroupAdditionMistake(ad.a, ad.b);
        if(wn === noRegroup){
          return { tag: 'err_no_regroup', patternTag: 'pattern_forgot_regroup' };
        }
      } else {
        // No regroup needed but wrong looks like an extra carry: ±10, ±100
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

  // Rule 7: Numeric magnitude fallback
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
  const lessonId = `u3l${lessonIdx + 1}`;
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

// ───── Write review file ─────
fs.writeFileSync(REVIEW_PATH, reviewItems.join('\n') + '\n', 'utf8');

// ───── Re-emit u3.js ─────
const header = '// Unit 3: Add & Subtract to 200\n';
const body = '_mergeUnitData(2, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U3_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u3_phase2 ===');
console.log(JSON.stringify({
  stats,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length
}, null, 2));
console.log('Wrote:', U3_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
