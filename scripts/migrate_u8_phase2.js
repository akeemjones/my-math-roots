#!/usr/bin/env node
// scripts/migrate_u8_phase2.js
// One-shot transform for Grade 2 Unit 8 (Fractions) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - PRESERVES `s`-field SVG/HTML byte-for-byte per question (strict triple-equals gate)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u8.js with the transformed payload
//
// NOTE: backup (cp src/data/u8.js src/data/u8.js.bak) and pre-edit git tag
// (git tag phase2-u8-pre-edit) are run as EXPLICIT terminal commands BEFORE this script.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U8_PATH = path.join(REPO_ROOT, 'src', 'data', 'u8.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u8_review.txt');

// ───── Load u8.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U8_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 7) { console.error('FATAL: expected idx=7 for u8, got', idx); process.exit(1); }

// ───── Snapshot s-fields BEFORE any transformation ─────
const sSnapshots = []; // { ref, orig, where }
function snapshotS(q, where){
  if(q && typeof q.s === 'string'){
    sSnapshots.push({ ref: q, where, orig: q.s });
  }
}
data.lessons.forEach((lesson, li) => {
  (lesson.qBank || []).forEach((q, qi) => snapshotS(q, `qBank[u8l${li+1}][${qi}]`));
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

// ───── Fraction helpers ─────
function parseFractionString(s){
  if(s == null) return null;
  const m = String(s).trim().match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if(!m) return null;
  const n = parseInt(m[1], 10);
  const d = parseInt(m[2], 10);
  if(!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  return { n, d };
}
function fractionToNumber(f){
  if(!f || f.d === 0) return null;
  return f.n / f.d;
}
function isUnitFraction(f){
  return !!(f && f.n === 1);
}

// Word-form fraction names: returns {n,d} or null
function fractionNameToFraction(s){
  if(typeof s !== 'string') return null;
  const t = s.trim().toLowerCase();
  if(!t) return null;
  // Direct numeric form first
  const num = parseFractionString(t);
  if(num) return num;
  // Whole / one whole / a whole
  if(/^(one\s+whole|a\s+whole|whole|1\s+whole)$/.test(t)) return { n: 1, d: 1 };
  // Plurals & specific names
  const specials = [
    [/^(one\s+)?(half|halves)$/, { n: 1, d: 2 }],
    [/^a\s+half$/, { n: 1, d: 2 }],
    [/^(one\s+)?(fourth|quarter)$/, { n: 1, d: 4 }],
    [/^a\s+(fourth|quarter)$/, { n: 1, d: 4 }],
    [/^(one\s+)?eighth$/, { n: 1, d: 8 }],
    [/^an\s+eighth$/, { n: 1, d: 8 }],
    [/^(one\s+)?third$/, { n: 1, d: 3 }],
    [/^a\s+third$/, { n: 1, d: 3 }],
  ];
  for(const [re, val] of specials){
    if(re.test(t)) return val;
  }
  // "<num-word> <denom-word>" generic — e.g. "two fourths", "three eighths"
  const numWords = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8 };
  const denomWords = { half:2, halves:2, third:3, thirds:3, fourth:4, fourths:4, quarter:4, quarters:4, eighth:8, eighths:8 };
  const m2 = t.match(/^(one|two|three|four|five|six|seven|eight)\s+(halves|halfs|thirds|fourths|quarters|eighths|half|third|fourth|quarter|eighth)$/);
  if(m2){
    const n = numWords[m2[1]];
    const d = denomWords[m2[2]];
    if(n != null && d != null) return { n, d };
  }
  return null;
}

function detectNumeratorDenominatorSwap(wF, cF){
  if(!wF || !cF) return false;
  if(wF.n === cF.n && wF.d === cF.d) return false;
  return wF.n === cF.d && wF.d === cF.n;
}
function detectWrongDenominator(wF, cF){
  if(!wF || !cF) return false;
  return wF.n === cF.n && wF.d !== cF.d;
}
function detectWrongNumerator(wF, cF){
  if(!wF || !cF) return false;
  return wF.d === cF.d && wF.n !== cF.n;
}

// ───── Fraction prompt classifiers ─────
function isFractionPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(fraction|fractions|numerator|denominator|equal\s*parts|shaded|unshaded|whole|out\s*of)\b/.test(s)
    || /\d+\s*\/\s*\d+/.test(s);
}
function isComparisonPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(bigger|biggest|smaller|smallest|larger|largest|less|greater|compare|which\s*piece|which\s*fraction|larger\s*piece|smaller\s*piece|more\s*pieces|fewer\s*pieces|same\s*size|smaller\s*part|larger\s*part)\b/.test(s);
}
function isEqualPartsPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(equal\s*parts|same\s*size|cut\s*into|divid(?:e|ed)\s*into|split\s*into|fair\s*share|same\s*shape|same\s*pieces|equal\s*pieces|equal\s*size|equal\s*shares|all\s*parts\s*must|valid\s*fraction|show(?:s)?\s*(?:a\s*)?fraction|makes\s*a\s*fraction|parts\s*must\s*be|pieces\s*must\s*be)\b/.test(s);
}
function isFractionVocabPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(top\s*number|bottom\s*number|number\s*on\s*top|number\s*on\s*bottom|denominator|numerator|tell\s*you|mean(?:s)?)\b/.test(s) && /\b(fraction|fractions)\b/.test(s);
}
function isAvoidanceText(s){
  const t = String(s || '').trim().toLowerCase();
  return /^(cannot|cannot\s*(?:tell|compare|say)|you\s*cannot(?:\s*(?:tell|compare|say))?|it\s*depends(?:\s*on.*)?|depends(?:\s*on.*)?|not\s*enough\s*info|i\s*(?:don'?t|do\s*not)\s*know|impossible|maybe|sometimes|neither|none|no\s*way)$/.test(t);
}
function isFractionVocabWord(s){
  const t = String(s || '').trim().toLowerCase();
  return /^(numerator|denominator|whole|total|parts?|pieces?|equal|equal\s*(?:size|pieces|parts|shares)|same|same\s*(?:size|amount)|different|different\s*(?:size|sizes)|any\s*(?:size|sizes|pieces|parts)|many\s*pieces|few\s*pieces|zero\s*parts|some|all|none|all\s*of\s*them|all\s*of\s*the\s*above|none\s*of\s*the\s*above)$/.test(t);
}
function isComparisonSymbol(s){
  const t = String(s || '').trim();
  return /^([<>=]|<=|>=|≤|≥|x|×|cannot|none|equal)$/i.test(t);
}
function isShadedPartsPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(shaded|unshaded|colored|painted|filled|how\s*many\s*(?:parts|pieces)\s*are\s*shaded|what\s*fraction\s*is\s*shaded)\b/.test(s);
}
function isFractionNamePrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(name|called|word|written\s*as|how\s*do\s*you\s*write|how\s*do\s*we\s*write|in\s*words|name\s*for)\b/.test(s);
}
function isCategoryText(s){
  if(typeof s !== 'string') return false;
  const t = s.trim();
  if(!t) return false;
  if(/^-?\d+(\.\d+)?$/.test(t)) return false;       // pure number
  if(/^\d+\s*\/\s*\d+$/.test(t)) return false;      // pure fraction literal
  return /[A-Za-z]/.test(t);
}

// More-pieces-bigger detection: comparison prompt asking for larger piece
// where wrong has a larger denominator (= more pieces = each piece smaller)
function detectMostLeastDirection(t){
  const s = String(t || '').toLowerCase();
  if(/\b(smaller|smallest|less|fewer|fewest|smaller\s*piece|smaller\s*part)\b/.test(s)) return 'least';
  if(/\b(bigger|biggest|larger|largest|greater|more\s*pieces|larger\s*piece|larger\s*part)\b/.test(s)) return 'most';
  return null;
}
function detectMorePiecesBiggerPattern(wF, cF, prompt){
  if(!wF || !cF) return false;
  if(!isUnitFraction(wF) || !isUnitFraction(cF)) return false;
  const dir = detectMostLeastDirection(prompt);
  if(dir === 'most') return wF.d > cF.d;       // asked larger, wrong picked smaller (bigger denom = smaller piece)
  if(dir === 'least') return wF.d < cF.d;      // asked smaller, wrong picked larger (smaller denom = larger piece)
  return false;
}

// ───── lessonId classifier (testBank/unitQuiz; first-match-wins) ─────
const reviewItems = [];

function classifyLessonId(prompt, options){
  const t = String(prompt || '');
  // 1. Compare-fraction-size first (may also mention halves/fourths/eighths).
  if(isComparisonPrompt(t)) return { id: 'u8l3', confident: true };
  // 2. "Equals 1 whole" / equivalent-to-whole prompts → u8l2 (denominator concept).
  //    Per user clarification: route "Which fraction equals 1 whole?" to u8l2 with
  //    denominator/fraction-size confusion tags, not generic err_confused.
  if(/\b(equals?\s*(?:1|one)\s*whole|equal\s*to\s*(?:1|one)\s*whole|same\s*as\s*(?:1|one)\s*whole)\b/i.test(t)){
    return { id: 'u8l2', confident: true };
  }
  // 3. Halves/fourths/eighths and unit-fraction language before generic basics.
  if(/\b(halves?|fourths?|quarter|quarters|eighths?|unit\s*fraction|one\s*out\s*of)\b/i.test(t)
     || /\b1\s*\/\s*[2348]\b/.test(t)){
    return { id: 'u8l2', confident: true };
  }
  // 4. Fraction basics / equal parts / shaded.
  if(isFractionPrompt(t) || isEqualPartsPrompt(t) || isShadedPartsPrompt(t)){
    return { id: 'u8l1', confident: true };
  }
  // 5. Fallback: assume basics (the dominant lesson) but flag for review.
  return { id: 'u8l1', confident: false };
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_fraction_equal_parts_confusion: 0,
  err_numerator_confusion: 0,
  err_denominator_confusion: 0,
  err_fraction_size_confusion: 0,
  err_unit_fraction_confusion: 0,
  err_more_pieces_bigger_confusion: 0,
  err_wrong_fraction_name: 0,
  err_counted_shaded_wrong: 0,
  err_counted_total_parts_wrong: 0,
  err_off_by_one: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_magnitude_error: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId, allOptions){
  const wStr = String(wrongVal);
  const cStr = String(correctVal);
  const wn = getNumericValue(wStr);
  const cn = getNumericValue(cStr);
  const wF = fractionNameToFraction(wStr);
  const cF = fractionNameToFraction(cStr);
  const wrongIsCategory = isCategoryText(wStr) && wF === null;
  const correctIsCategory = isCategoryText(cStr) && cF === null;
  const t = String(prompt || '');
  const isCmp = lessonId === 'u8l3' || isComparisonPrompt(t);
  const isShade = isShadedPartsPrompt(t);
  const isEqParts = isEqualPartsPrompt(t);
  const isName = isFractionNamePrompt(t) || (cF && wF && (lessonId === 'u8l2'));

  // ============= 0. Pre-rule for shaded prompts: "counted unshaded instead of shaded" =============
  // wrong.n === correct.d - correct.n with same denom → err_fraction_size_confusion + pattern_counted_shaded_wrong
  if(isShade && wF && cF && wF.d === cF.d && wF.n === (cF.d - cF.n) && wF.n !== cF.n){
    return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_counted_shaded_wrong' };
  }

  // ============= 0a. AVOIDANCE / REFUSAL ANSWERS =============
  // "Cannot tell", "It depends", "You cannot compare", etc. — common avoidance distractor.
  // In comparison context, this represents the misconception that fractions can't be compared.
  if(isAvoidanceText(wStr) || /^(cannot|you\s*cannot|cannot\s*(?:tell|compare|say)|it\s*depends|depends)/i.test(wStr.trim())){
    if(isCmp){
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_needs_review' };
    }
    if(isEqParts || isFractionPrompt(t)){
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_needs_review' };
    }
    return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_needs_review' };
  }

  // ============= 0b. COMPARISON SYMBOL ANSWERS =============
  // ">", "<", "=", "x" — wrong inequality direction or invalid symbol.
  if(/^[<>=]$/.test(wStr.trim()) || /^[<>=]$/.test(cStr.trim()) || /^x$/i.test(wStr.trim())){
    if(isCmp || /\bsymbol|compares?|number\s*sentence|correctly\s*compares\b/i.test(t)){
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_thinks_more_pieces_means_bigger' };
    }
  }

  // ============= 0c. FRACTION-VOCABULARY-WORD ANSWERS =============
  // "Numerator"/"Denominator"/"Whole"/"Total"/"Parts" answers in vocabulary prompts.
  if(isFractionVocabPrompt(t) && isFractionVocabWord(wStr)){
    return { tag: 'err_wrong_fraction_name', patternTag: 'pattern_wrong_fraction_name' };
  }

  // ============= 1. COMPARE UNIT FRACTIONS =============
  if(isCmp){
    // Both are fractions and follow "more pieces = bigger" misconception
    if(wF && cF && detectMorePiecesBiggerPattern(wF, cF, t)){
      return { tag: 'err_more_pieces_bigger_confusion', patternTag: 'pattern_thinks_more_pieces_means_bigger' };
    }
    // Both are fractions, same numerator, different denominators (size comparison)
    if(wF && cF && wF.n === cF.n && wF.d !== cF.d){
      // Generic size-confusion when not unit fractions or direction unknown
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_thinks_more_pieces_means_bigger' };
    }
    // Wrong is a category word ("smaller"/"bigger"/"same") inverted from correct
    if(wrongIsCategory && /\b(bigger|smaller|larger|less|greater|same|equal|more|fewer)\b/i.test(wStr)){
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_wrong_unit_fraction' };
    }
  }

  // ============= 2. NUMERATOR / DENOMINATOR CONFUSION =============
  if(wF && cF){
    if(detectNumeratorDenominatorSwap(wF, cF)){
      return { tag: 'err_numerator_confusion', patternTag: 'pattern_confused_numerator_denominator' };
    }
    if(detectWrongDenominator(wF, cF)){
      return { tag: 'err_denominator_confusion', patternTag: 'pattern_counted_total_parts_wrong' };
    }
    if(detectWrongNumerator(wF, cF)){
      // For shaded prompts, prefer the more specific "counted shaded wrong" tag
      if(isShade){
        return { tag: 'err_counted_shaded_wrong', patternTag: 'pattern_counted_shaded_wrong' };
      }
      return { tag: 'err_numerator_confusion', patternTag: 'pattern_counted_shaded_wrong' };
    }
    // Different fractions but no clean n/d relationship — fall through to fraction name / size logic
  }

  // ============= 3. FRACTION-NAME RULES =============
  if(isName && wF && cF && (wF.n !== cF.n || wF.d !== cF.d)){
    return { tag: 'err_wrong_fraction_name', patternTag: 'pattern_wrong_fraction_name' };
  }

  // ============= 4. EQUAL-PARTS RULES (Yes/No / shape-pick / reasoning) =============
  if(isEqParts){
    const wL = wStr.trim().toLowerCase();
    if(/^(yes|no|true|false|equal|not\s*equal|unequal|not\s*the\s*same)$/.test(wL)){
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_parts_not_equal' };
    }
    // Reasoning-style answers starting with Yes/No/Maybe + comma + reason
    if(/^(yes|no|maybe|nothing)[\s,\-—]/i.test(wStr) || /^(nothing\s*[-—]\s*)/i.test(wStr)){
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_parts_not_equal' };
    }
    if(wrongIsCategory && !wF){
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_parts_not_equal' };
    }
  }

  // ============= 4a. COMPARISON REASONING ANSWERS =============
  // For comparison prompts that have reasoning-style Yes/No answers
  if(isCmp){
    if(/^(yes|no|maybe|nothing)[\s,\-—]/i.test(wStr) || /^(nothing\s*[-—]\s*)/i.test(wStr)){
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_thinks_more_pieces_means_bigger' };
    }
  }

  // ============= 5. SHADED-PARTS GENERIC FALLBACK =============
  if(isShade && wF && cF){
    // If we got here despite shaded prompt, treat as generic shaded-count error
    return { tag: 'err_counted_shaded_wrong', patternTag: 'pattern_counted_shaded_wrong' };
  }

  // ============= 6. GENERAL NUMERIC (both numeric or both fractions) =============
  if(wF && cF){
    const wNum = fractionToNumber(wF);
    const cNum = fractionToNumber(cF);
    if(wNum != null && cNum != null){
      const delta = wNum - cNum;
      if(delta === 0){
        // Same numeric value but different rep — unit_fraction_confusion
        return { tag: 'err_unit_fraction_confusion', patternTag: 'pattern_wrong_unit_fraction' };
      }
      if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
      return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
    }
  }
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

  // ============= 7. CATEGORY / WORD ANSWER FALLBACK =============
  if(wrongIsCategory){
    const wL = wStr.trim().toLowerCase();
    // Yes/No or true/false in a fraction context — equal-parts misconception
    if(/^(yes|no|true|false)$/.test(wL)){
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_parts_not_equal' };
    }
    // Reasoning-style Yes/No
    if(/^(yes|no|maybe|nothing)[\s,\-—]/i.test(wStr)){
      if(isCmp){
        return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_thinks_more_pieces_means_bigger' };
      }
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_parts_not_equal' };
    }
    // Comparison words
    if(/\b(bigger|smaller|larger|less|greater|same|equal|more|fewer)\b/.test(wL)){
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_wrong_unit_fraction' };
    }
    // Fraction vocabulary fallback (in any fraction-context prompt)
    if(isFractionVocabWord(wStr) && (isFractionPrompt(t) || isFractionVocabPrompt(t))){
      return { tag: 'err_wrong_fraction_name', patternTag: 'pattern_wrong_fraction_name' };
    }
    // "X parts/pieces" magnitude phrases (Zero parts, Many pieces, Any pieces)
    if(/^(zero\s*parts|many\s*pieces|any\s*pieces|some\s*pieces|all\s*pieces|few\s*pieces|0\s*parts)$/i.test(wL)){
      return { tag: 'err_fraction_equal_parts_confusion', patternTag: 'pattern_parts_not_equal' };
    }
    // "All of them" / "None of them" / "All of the above" — meta-options usually wrong
    if(/^(all\s*of\s*(?:them|the\s*above)|none\s*of\s*(?:them|the\s*above)|all|none|both|neither)$/i.test(wL)){
      return { tag: 'err_fraction_size_confusion', patternTag: 'pattern_wrong_unit_fraction' };
    }
    // If wrong is a fraction word and correct is too, but didn't match name rule
    if(wF){
      return { tag: 'err_wrong_fraction_name', patternTag: 'pattern_wrong_fraction_name' };
    }
    // Generic short fraction-vocab text in fraction-prompt context
    if(isFractionPrompt(t) && wL.length < 25){
      return { tag: 'err_wrong_fraction_name', patternTag: 'pattern_wrong_fraction_name' };
    }
  }

  // ============= 8. FINAL FALLBACK =============
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
      reviewItems.push(`fallback distractor in ${where}: prompt="${String(q.t).slice(0,140)}" correct="${originalCorrect}" wrong="${val}"`);
    }
    // Negative-integer sanity check (no negative fractions in Grade 2)
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
  const lessonId = `u8l${lessonIdx + 1}`;
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
      reviewItems.push(`testBank[${qi}] -> ${cls.id} (low confidence): ${String(q.t).slice(0,140)}`);
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
      reviewItems.push(`unitQuiz[${qi}] -> ${cls.id} (low confidence): ${String(q.t).slice(0,140)}`);
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
const perLesson = { u8l1: 0, u8l2: 0, u8l3: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u8l${idx+1}`;
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

// ───── Re-emit u8.js ─────
const header = '// Unit 8: Fractions\n';
const body = '_mergeUnitData(7, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U8_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u8_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length,
  sGate: { checked: sGateChecked, failed: sGateFailed }
}, null, 2));
console.log('Wrote:', U8_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`s-field byte-equality gate: ${sGateChecked} questions checked, ${sGateFailed} mismatches`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
