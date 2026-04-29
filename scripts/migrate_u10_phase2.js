#!/usr/bin/env node
// scripts/migrate_u10_phase2.js
// One-shot transform for Grade 2 Unit 10 (Multiplication & Division foundations) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - PRESERVES `s`-field content byte-for-byte per question (strict triple-equals gate)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u10.js with _mergeUnitData(9, ...) to match the established 0-based UNITS index
//
// U10 distractor taxonomy (canonical Grade 2 names):
//   err_equal_groups_confusion, err_array_reading_confusion,
//   err_repeated_addition_confusion, err_skip_count_error, err_counting_total_error,
//   err_sharing_equally_confusion, err_groups_items_confusion,
//   err_rows_columns_confusion, err_wrong_operation,
//   err_left_only, err_right_only,
//   err_off_by_one, err_under_count, err_over_count, err_magnitude_error,
//   err_confused
//
// CRITICAL: Engine activation only. No visual migration. No advanced multiplication/division.
//           Preserves `v` array configs verbatim. Touches no U1–U9 data.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U10_PATH = path.join(REPO_ROOT, 'src', 'data', 'u10.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u10_review.txt');

// ───── Load u10.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U10_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 9) { console.error('FATAL: expected idx=9 for u10, got', idx); process.exit(1); }

// ───── Snapshot s-fields BEFORE any transformation ─────
const sSnapshots = []; // { ref, orig, where }
function snapshotS(q, where){
  if(q && typeof q.s === 'string'){
    sSnapshots.push({ ref: q, where, orig: q.s });
  }
}
data.lessons.forEach((lesson, li) => {
  (lesson.qBank || []).forEach((q, qi) => snapshotS(q, `qBank[u10l${li+1}][${qi}]`));
});
(data.testBank || []).forEach((q, qi) => snapshotS(q, `testBank[${qi}]`));
(data.unitQuiz || []).forEach((q, qi) => snapshotS(q, `unitQuiz[${qi}]`));

// ───── Numeric helpers ─────
function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  const cleaned = String(s).trim().replace(/,/g, '');
  const m = cleaned.match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}
function extractLastNumberFromText(s){
  if(typeof s !== 'string') return null;
  const cleaned = s.replace(/,/g, '');
  const matches = cleaned.match(/-?\d+/g);
  if(!matches || matches.length === 0) return null;
  return parseInt(matches[matches.length - 1], 10);
}
function getNumericValue(s){
  const plain = tryParseInt(s);
  if(plain !== null) return plain;
  const text = extractLastNumberFromText(s);
  if(text !== null) return text;
  return null;
}
function extractNumbersFromPrompt(t){
  if(typeof t !== 'string') return [];
  const cleaned = t.replace(/,/g, '');
  const matches = cleaned.match(/\d+/g) || [];
  return matches.map(m => parseInt(m, 10)).filter(n => Number.isFinite(n));
}
function stripTags(s){
  if(typeof s !== 'string') return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function isCategoryText(s){
  if(typeof s !== 'string') return false;
  const t = s.trim();
  if(!t) return false;
  if(/^-?\d+(\.\d+)?$/.test(t)) return false;
  return /[A-Za-z+×÷*\-]/.test(t);
}

// ───── Domain extraction helpers ─────
// "3 groups of 4" → { groups:3, each:4, total:12 }
function extractGroupsAndItems(t){
  const s = String(t || '').toLowerCase();
  let m = s.match(/(\d+)\s*(?:equal\s*)?groups?\s*of\s*(\d+)/);
  if(m) return { groups: +m[1], each: +m[2], total: +m[1] * +m[2] };
  m = s.match(/(\d+)\s*sets?\s*of\s*(\d+)/);
  if(m) return { groups: +m[1], each: +m[2], total: +m[1] * +m[2] };
  m = s.match(/(\d+)\s*(?:equal\s*)?groups?\s*(?:with|having|that\s*have|each\s*with)\s*(\d+)/);
  if(m) return { groups: +m[1], each: +m[2], total: +m[1] * +m[2] };
  return null;
}
// "3 rows and 4 columns" / "3 rows × 4 columns" / "rows: 3, cols: 4"
function extractRowsCols(t){
  const s = String(t || '').toLowerCase();
  let m = s.match(/(\d+)\s*rows?\s*(?:and|×|x|by|,)?\s*(\d+)\s*columns?/);
  if(m) return { rows: +m[1], cols: +m[2], total: +m[1] * +m[2] };
  m = s.match(/array\s*(?:has|of|with)?\s*(\d+)\s*(?:rows?|×|x)\s*(?:and|by|,|×|x)?\s*(\d+)/);
  if(m) return { rows: +m[1], cols: +m[2], total: +m[1] * +m[2] };
  return null;
}
// "5+5+5" / "2+2+2+2+2" → { addend, count, total }
function extractRepeatedAddend(t){
  const s = String(t || '');
  // Match a series of identical addends separated by '+'
  // Allow various whitespace; at least 3 occurrences for repeated addition
  const m = s.match(/(\d+)(?:\s*\+\s*(\d+)){2,}/);
  if(!m) return null;
  // Parse the full expression matched
  const expr = m[0];
  const nums = expr.split('+').map(x => parseInt(x.trim(), 10));
  if(nums.some(n => !Number.isFinite(n))) return null;
  // All addends must be equal
  if(!nums.every(n => n === nums[0])) return null;
  if(nums.length < 3) return null;
  return { addend: nums[0], count: nums.length, total: nums[0] * nums.length };
}
// "12 ÷ 3" / "20 / 4" / "15 divided by 3"
function extractDivisionExpression(t){
  const s = String(t || '');
  let m = s.match(/(\d+)\s*[÷\/]\s*(\d+)/);
  if(m) return { dividend: +m[1], divisor: +m[2], quotient: +m[1] / +m[2] };
  m = s.match(/(\d+)\s+divided\s+by\s+(\d+)/i);
  if(m) return { dividend: +m[1], divisor: +m[2], quotient: +m[1] / +m[2] };
  return null;
}
// "8 apples shared equally between 2 groups" / "12 cookies shared by 3 friends"
function extractSharingExpression(t){
  const s = String(t || '').toLowerCase();
  let m = s.match(/(\d+)\s+\w+\s+(?:are\s+)?shared\s+(?:equally\s+)?(?:between|by|among|with)\s+(\d+)/);
  if(m){
    const total = +m[1], groups = +m[2];
    return { total, groups, each: groups > 0 ? total / groups : null };
  }
  m = s.match(/(\d+)\s+\w+\s+(?:are\s+)?(?:split|divided)\s+(?:equally\s+)?(?:between|by|among|into)\s+(\d+)/);
  if(m){
    const total = +m[1], groups = +m[2];
    return { total, groups, each: groups > 0 ? total / groups : null };
  }
  m = s.match(/share\s+(\d+)\s+\w+\s+(?:equally\s+)?(?:between|by|among|with)\s+(\d+)/);
  if(m){
    const total = +m[1], groups = +m[2];
    return { total, groups, each: groups > 0 ? total / groups : null };
  }
  return null;
}
// "3 × 6" / "3 x 6" / "3 times 6"
function extractMultiplicationExpression(t){
  const s = String(t || '');
  let m = s.match(/(\d+)\s*[×x*]\s*(\d+)/);
  if(m) return { a: +m[1], b: +m[2], product: +m[1] * +m[2] };
  m = s.match(/(\d+)\s+times\s+(\d+)/i);
  if(m) return { a: +m[1], b: +m[2], product: +m[1] * +m[2] };
  return null;
}

// ───── Prompt classifiers ─────
function isSharingPrompt(t){
  const s = String(t || '').toLowerCase();
  if(/\b(shared?|sharing|share)\s*(?:equally|fairly|between|by|among|with)/.test(s)) return true;
  if(/\b(divide(?:d|s)?|division)\b/.test(s)) return true;
  if(/[÷]/.test(t)) return true;
  if(/\b(?:each|every)\s+(?:person|child|kid|friend|student|group|one)\s+(?:get|gets|receives?|has)\b/.test(s)) return true;
  if(/\bfair\s+share/.test(s)) return true;
  if(/\bsplit\s+(?:equally|into|between|among)/.test(s)) return true;
  if(/\bhow\s+many\s+(?:in\s+each|does\s+each|each\s+person|each\s+child|each\s+friend|each\s+kid)\b/.test(s)) return true;
  if(/\bhow\s+many\s+groups?\s+(?:can\s+(?:you|i)\s+make|of)\b/.test(s)) return true;
  return false;
}
function isRepeatedAdditionPrompt(t){
  const s = String(t || '').toLowerCase();
  if(/repeated\s+addition/.test(s)) return true;
  if(/add\s+the\s+same\s+number/.test(s)) return true;
  if(/same\s+number\s+(?:again|repeated)/.test(s)) return true;
  if(/skip\s*-?\s*count/.test(s)) return true;
  if(/count(?:ing)?\s+by\s+\d/.test(s)) return true;
  // Three or more identical addends in expression
  if(extractRepeatedAddend(t) !== null) return true;
  // Multiplication expression like "3 × 6" — bridge to repeated addition lesson
  if(extractMultiplicationExpression(t) !== null) return true;
  // "matches NxM" / "which expression matches"
  if(/which\s+(?:matches|expression|sum)/.test(s) && extractMultiplicationExpression(t) !== null) return true;
  return false;
}
function isEqualGroupsPrompt(t){
  const s = String(t || '').toLowerCase();
  if(/\bequal\s+groups?\b/.test(s)) return true;
  if(/\bgroups?\s+of\s+\d/.test(s)) return true;
  if(/\beach\s+group\s+(?:has|with)\b/.test(s)) return true;
  if(/\bsame\s+number\s+in\s+each\s+group\b/.test(s)) return true;
  if(/\bitems?\s+in\s+each\s+group\b/.test(s)) return true;
  if(/\bsets?\s+of\s+\d/.test(s)) return true;
  if(/\bhow\s+many\s+(?:total|in\s+all|altogether)\b/.test(s)) return true;
  if(/\btotal\s+(?:number\s+of\s+)?(?:objects|items|things|dots)\b/.test(s)) return true;
  return false;
}
function isArrayPrompt(t){
  const s = String(t || '').toLowerCase();
  if(/\barray\b/.test(s)) return true;
  if(/\brows?\b.*\bcolumns?\b/.test(s)) return true;
  if(/\bcolumns?\b.*\brows?\b/.test(s)) return true;
  if(extractRowsCols(t) !== null) return true;
  if(/\bdots?\s+in\s+this\s+group\b/.test(s)) return true;  // u10l1 visual array prompts
  return false;
}
function isMultiplicationPrompt(t){
  const s = String(t || '').toLowerCase();
  if(/\bmultiply|multiplication\b/.test(s)) return true;
  if(extractMultiplicationExpression(t) !== null) return true;
  return false;
}

// ───── lessonId classifier (testBank/unitQuiz; first-match-wins) ─────
const reviewItems = [];

function classifyLessonId(prompt, options){
  const t = String(prompt || '');
  // 1. Sharing/division first — most specific signal
  if(isSharingPrompt(t)) return { id: 'u10l3', confident: true };
  // 2. Repeated addition / skip counting (expression with same addend ≥3 OR skip-count language)
  if(isRepeatedAdditionPrompt(t)) return { id: 'u10l2', confident: true };
  // 3. Equal groups / arrays / mult foundations
  if(isEqualGroupsPrompt(t) || isArrayPrompt(t) || isMultiplicationPrompt(t)) return { id: 'u10l1', confident: true };
  // 4. Fallback → u10l1 (generic mult-foundation language) flagged as low confidence
  return { id: 'u10l1', confident: false };
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_equal_groups_confusion: 0,
  err_array_reading_confusion: 0,
  err_repeated_addition_confusion: 0,
  err_skip_count_error: 0,
  err_counting_total_error: 0,
  err_sharing_equally_confusion: 0,
  err_groups_items_confusion: 0,
  err_rows_columns_confusion: 0,
  err_wrong_operation: 0,
  err_left_only: 0,
  err_right_only: 0,
  err_off_by_one: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_magnitude_error: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId, allOptions){
  const wRaw = String(wrongVal);
  const cRaw = String(correctVal);
  const wStr = wRaw.startsWith('<') ? stripTags(wRaw) : wRaw;
  const cStr = cRaw.startsWith('<') ? stripTags(cRaw) : cRaw;
  const wn = getNumericValue(wStr);
  const cn = getNumericValue(cStr);
  const wLower = wStr.trim().toLowerCase();
  const cLower = cStr.trim().toLowerCase();
  const wrongIsCategory = isCategoryText(wStr);
  const t = String(prompt || '');
  const numsInPrompt = extractNumbersFromPrompt(t);
  const isShare = lessonId === 'u10l3' || isSharingPrompt(t);
  const isRepAdd = lessonId === 'u10l2' || isRepeatedAdditionPrompt(t);
  const isEG = lessonId === 'u10l1' || isEqualGroupsPrompt(t);
  const isArr = isArrayPrompt(t);
  const groupsInfo = extractGroupsAndItems(t);
  const rcInfo = extractRowsCols(t);
  const repAddInfo = extractRepeatedAddend(t);
  const divInfo = extractDivisionExpression(t);
  const shareInfo = extractSharingExpression(t);
  const multInfo = extractMultiplicationExpression(t);

  // ============= 0. YES/NO style answers =============
  if(/^(yes|no|true|false|sometimes|maybe|depends|cannot\s*tell)$/i.test(wLower)){
    if(isEG || /equal\s+groups?/i.test(t)) return { tag: 'err_equal_groups_confusion', patternTag: 'pattern_confused_groups_and_items' };
    if(isShare) return { tag: 'err_sharing_equally_confusion', patternTag: 'pattern_unequal_sharing' };
    if(isRepAdd) return { tag: 'err_repeated_addition_confusion', patternTag: 'pattern_wrong_repeated_addition' };
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  // ============= 1. SHARING / DIVISION =============
  if(isShare && wn !== null && cn !== null){
    // Wrong = total (used unsplit total instead of per-group)
    if(shareInfo && wn === shareInfo.total){
      return { tag: 'err_sharing_equally_confusion', patternTag: 'pattern_confused_groups_and_items' };
    }
    if(divInfo && wn === divInfo.dividend){
      return { tag: 'err_sharing_equally_confusion', patternTag: 'pattern_confused_groups_and_items' };
    }
    // Wrong = number of groups (counted divisor instead of quotient)
    if(shareInfo && wn === shareInfo.groups){
      return { tag: 'err_sharing_equally_confusion', patternTag: 'pattern_counted_groups_not_items' };
    }
    if(divInfo && wn === divInfo.divisor){
      return { tag: 'err_sharing_equally_confusion', patternTag: 'pattern_counted_groups_not_items' };
    }
    // Wrong = product (used multiplication instead of division)
    if(shareInfo && wn === shareInfo.total * shareInfo.groups){
      return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
    }
    if(divInfo && wn === divInfo.dividend * divInfo.divisor){
      return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
    }
    // Wrong = sum (used addition instead of division)
    if(shareInfo && wn === shareInfo.total + shareInfo.groups){
      return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
    }
    if(divInfo && wn === divInfo.dividend + divInfo.divisor){
      return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
    }
    // Off-by-one in sharing → unequal sharing pattern
    if(Math.abs(wn - cn) === 1){
      return { tag: 'err_sharing_equally_confusion', patternTag: 'pattern_unequal_sharing' };
    }
    // Anything else numeric in sharing context → sharing confusion fallback
    return { tag: 'err_sharing_equally_confusion', patternTag: wn < cn ? 'pattern_too_low' : 'pattern_too_high' };
  }

  // ============= 2. REPEATED ADDITION / SKIP COUNTING =============
  if(isRepAdd && wn !== null && cn !== null){
    if(repAddInfo){
      // Wrong = single addend → used one addend only
      if(wn === repAddInfo.addend){
        return { tag: 'err_right_only', patternTag: 'pattern_used_right_only' };
      }
      // Wrong = count of addends (counted groups, not total)
      if(wn === repAddInfo.count){
        return { tag: 'err_equal_groups_confusion', patternTag: 'pattern_counted_groups_not_items' };
      }
      // Wrong = sum minus one addend (skipped one)
      if(wn === repAddInfo.total - repAddInfo.addend){
        return { tag: 'err_repeated_addition_confusion', patternTag: 'pattern_wrong_repeated_addition' };
      }
      // Wrong = sum plus one addend (added one too many)
      if(wn === repAddInfo.total + repAddInfo.addend){
        return { tag: 'err_repeated_addition_confusion', patternTag: 'pattern_wrong_repeated_addition' };
      }
      // Wrong = addend × addend (squared instead of multiplied by count)
      if(wn === repAddInfo.addend * repAddInfo.addend){
        return { tag: 'err_repeated_addition_confusion', patternTag: 'pattern_wrong_repeated_addition' };
      }
    }
    if(multInfo){
      // Wrong = a + b instead of a × b
      if(wn === multInfo.a + multInfo.b){
        return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
      }
      // Wrong = one factor only
      if(wn === multInfo.a) return { tag: 'err_left_only', patternTag: 'pattern_used_left_only' };
      if(wn === multInfo.b) return { tag: 'err_right_only', patternTag: 'pattern_used_right_only' };
    }
    // Off-by-one in repeated-addition context
    if(Math.abs(wn - cn) === 1){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_skip_count_wrong_step' };
    }
    return { tag: 'err_repeated_addition_confusion', patternTag: wn < cn ? 'pattern_too_low' : 'pattern_too_high' };
  }

  // ============= 3. EQUAL GROUPS / ARRAYS =============
  if(isEG || isArr){
    if(wn !== null && cn !== null){
      // Array prompt with rows/cols extracted
      if(rcInfo){
        if(wn === rcInfo.rows) return { tag: 'err_array_reading_confusion', patternTag: 'pattern_counted_rows_not_total' };
        if(wn === rcInfo.cols) return { tag: 'err_array_reading_confusion', patternTag: 'pattern_counted_rows_not_total' };
        if(wn === rcInfo.rows + rcInfo.cols) return { tag: 'err_groups_items_confusion', patternTag: 'pattern_confused_groups_and_items' };
        // Swapped: wrong product is cols × rows, but those are equal so this rarely matches separately
        // Off-by-row or off-by-col → magnitude
        if(wn === rcInfo.cols * (rcInfo.rows + 1) || wn === rcInfo.cols * (rcInfo.rows - 1)){
          return { tag: 'err_rows_columns_confusion', patternTag: 'pattern_confused_rows_columns' };
        }
        if(wn === rcInfo.rows * (rcInfo.cols + 1) || wn === rcInfo.rows * (rcInfo.cols - 1)){
          return { tag: 'err_rows_columns_confusion', patternTag: 'pattern_confused_rows_columns' };
        }
      }
      // Equal-groups prompt with groups/each extracted
      if(groupsInfo){
        if(wn === groupsInfo.groups) return { tag: 'err_equal_groups_confusion', patternTag: 'pattern_counted_groups_not_items' };
        if(wn === groupsInfo.each) return { tag: 'err_equal_groups_confusion', patternTag: 'pattern_counted_items_per_group_not_total' };
        if(wn === groupsInfo.groups + groupsInfo.each) return { tag: 'err_groups_items_confusion', patternTag: 'pattern_confused_groups_and_items' };
      }
      // Off-by-one
      if(Math.abs(wn - cn) === 1){
        return { tag: 'err_off_by_one', patternTag: wn < cn ? 'pattern_one_less' : 'pattern_one_more' };
      }
      // Magnitude (10x)
      if(cn !== 0 && (wn === cn * 10 || (cn % 10 === 0 && wn === cn / 10))){
        return { tag: 'err_magnitude_error', patternTag: wn > cn ? 'pattern_too_high' : 'pattern_too_low' };
      }
      // Generic over/under count in equal-groups context
      if(wn < cn) return { tag: 'err_counting_total_error', patternTag: 'pattern_too_low' };
      return { tag: 'err_counting_total_error', patternTag: 'pattern_too_high' };
    }
    // Word/expression answer in equal-groups context
    if(wrongIsCategory){
      // Wrong is a repeated-addition-like expression: "3+3+3", "6+6+6", etc.
      if(/^\s*\d+(\s*\+\s*\d+)+\s*$/.test(wStr)){
        return { tag: 'err_repeated_addition_confusion', patternTag: 'pattern_wrong_repeated_addition' };
      }
      return { tag: 'err_equal_groups_confusion', patternTag: 'pattern_confused_groups_and_items' };
    }
  }

  // ============= 4. EXPRESSION ANSWERS (multiple choice with addition expressions) =============
  if(wrongIsCategory && /^\s*\d+(\s*\+\s*\d+)+\s*$/.test(wStr)){
    return { tag: 'err_repeated_addition_confusion', patternTag: 'pattern_wrong_repeated_addition' };
  }

  // ============= 5. LEFT/RIGHT OPERAND ONLY (general numeric) =============
  if(wn !== null && numsInPrompt.length >= 2){
    if(wn === numsInPrompt[0]) return { tag: 'err_left_only', patternTag: 'pattern_used_left_only' };
    if(wn === numsInPrompt[numsInPrompt.length - 1]) return { tag: 'err_right_only', patternTag: 'pattern_used_right_only' };
  }

  // ============= 6. GENERIC NUMERIC FALLBACK =============
  if(wn !== null && cn !== null){
    const delta = wn - cn;
    const absDelta = Math.abs(delta);
    if(absDelta === 1){
      return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
    }
    if(cn !== 0 && wn !== 0){
      if(wn === cn * 10) return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
      if(cn % 10 === 0 && wn === cn / 10) return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
    if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
    return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
  }

  // ============= FINAL FALLBACK =============
  return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
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
  negativeDistractors: 0,
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
    const cls = classifyDistractor(val, originalCorrect, q.t, lessonId, q.o);
    heuristicCounts[cls.tag] = (heuristicCounts[cls.tag] || 0) + 1;
    stats.totalDistractors++;
    if(cls.tag === 'err_confused'){
      const promptText = String(q.t || '').replace(/<[^>]+>/g, ' ').slice(0, 140);
      reviewItems.push(`fallback distractor in ${where}: prompt="${promptText}" correct="${String(originalCorrect).slice(0,80)}" wrong="${String(val).slice(0,80)}"`);
    }
    // Negative-integer sanity check (no negative counts in mult/div foundations)
    const n = tryParseInt(String(val));
    if(n !== null && n < 0){
      stats.negativeDistractors++;
      console.error(`FATAL: negative distractor in ${where}: "${val}"`);
      process.exit(1);
    }
    return { val: String(val), tag: cls.tag, patternTag: cls.patternTag };
  });

  // Duplicate detection
  const seen = new Set();
  for(const opt of newOpts){
    if(seen.has(opt.val)){
      console.error(`FATAL: duplicate option val="${opt.val}" in ${where}: ${JSON.stringify(newOpts)}`);
      process.exit(1);
    }
    seen.add(opt.val);
  }

  // Correct-index preservation
  if(newOpts[a].val !== String(originalCorrect)){
    console.error(`FATAL: correct-answer drift in ${where}: was "${originalCorrect}", now "${newOpts[a].val}"`);
    stats.indexMismatches++;
    process.exit(1);
  }

  q.o = newOpts;
}

// ───── Walk + transform ─────
data.lessons.forEach((lesson, lessonIdx) => {
  const lessonId = `u10l${lessonIdx + 1}`;
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
    const cls = classifyLessonId(q.t, q.o);
    q.lessonId = cls.id;
    if(!cls.confident){
      stats.ambiguousLessonIds++;
      const promptText = String(q.t || '').replace(/<[^>]+>/g, ' ').slice(0, 140);
      reviewItems.push(`testBank[${qi}] -> ${cls.id} (low confidence): ${promptText}`);
    }
    convertOptions(q, `testBank[${qi}]`, cls.id);
    stats.testBankConverted++;
  });
}

if(Array.isArray(data.unitQuiz)){
  data.unitQuiz.forEach((q, qi) => {
    stats.totalQuestions++;
    const cls = classifyLessonId(q.t, q.o);
    q.lessonId = cls.id;
    if(!cls.confident){
      stats.ambiguousLessonIds++;
      const promptText = String(q.t || '').replace(/<[^>]+>/g, ' ').slice(0, 140);
      reviewItems.push(`unitQuiz[${qi}] -> ${cls.id} (low confidence): ${promptText}`);
    }
    convertOptions(q, `unitQuiz[${qi}]`, cls.id);
    stats.unitQuizConverted++;
  });
}

// ───── Per-question s-field byte-equality gate ─────
let sGateChecked = 0, sGateFailed = 0;
for(const snap of sSnapshots){
  sGateChecked++;
  if(snap.ref.s !== snap.orig){
    sGateFailed++;
    console.error(`FATAL: s-field byte-equality gate failed at ${snap.where}`);
    console.error(`  prompt: ${String(snap.ref.t).slice(0,120)}`);
    console.error(`  before length: ${snap.orig.length}, after length: ${String(snap.ref.s).length}`);
    process.exit(1);
  }
}

// ───── Per-lesson distribution (for report) ─────
const perLesson = { u10l1: 0, u10l2: 0, u10l3: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u10l${idx+1}`;
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

// ───── Re-emit u10.js ─────
const header = '// Unit 10: Multiplication & Division\n';
const body = '_mergeUnitData(9, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U10_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u10_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length,
  sGate: { checked: sGateChecked, failed: sGateFailed }
}, null, 2));
console.log('Wrote:', U10_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`s-field byte-equality gate: ${sGateChecked} questions checked, ${sGateFailed} mismatches`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
