#!/usr/bin/env node
// scripts/migrate_u7_phase2.js
// One-shot transform for Grade 2 Unit 7 (Measurement & Time) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - PRESERVES `s`-field SVG/HTML byte-for-byte per question (strict triple-equals gate)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u7.js with the transformed payload
//
// NOTE: backup (cp src/data/u7.js src/data/u7.js.bak) and pre-edit git tag
// (git tag phase2-u7-pre-edit) are run as EXPLICIT terminal commands BEFORE this script.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U7_PATH = path.join(REPO_ROOT, 'src', 'data', 'u7.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u7_review.txt');

// ───── Load u7.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U7_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 6) { console.error('FATAL: expected idx=6 for u7, got', idx); process.exit(1); }

// ───── Snapshot s-fields BEFORE any transformation ─────
const sSnapshots = []; // { ref, orig, where }
function snapshotS(q, where){
  if(q && typeof q.s === 'string'){
    sSnapshots.push({ ref: q, where, orig: q.s });
  }
}
data.lessons.forEach((lesson, li) => {
  (lesson.qBank || []).forEach((q, qi) => snapshotS(q, `qBank[u7l${li+1}][${qi}]`));
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

// ───── Measurement & time prompt classifiers ─────
function isTimePrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(time|clock|hour|hours|minute|minutes|o'?clock|half\s*past|quarter\s*(past|to|hour|of)|short\s*hand|long\s*hand|minute\s*hand|hour\s*hand|a\.?m\.?|p\.?m\.?|noon|midnight|elapsed|day|days|week|weeks|month|months|year|years|seconds?|how\s*many\s*(hours|minutes|seconds|days|weeks|months))\b/.test(s)
    || /\b\d{1,2}:\d{2}\b/.test(s);
}
function isClockPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(clock|analog|short\s*hand|long\s*hand|minute\s*hand|hour\s*hand|o'?clock)\b/.test(s)
    || /\b\d{1,2}:\d{2}\b/.test(s);
}
function isLengthPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(length|long|longer|longest|short(er|est)?|measure|measurement|measuring|ruler|inch(es)?|foot|feet|yard|yards|centimeter|centimeters?|cm\b|meter|meters?|m\b|distance|height|tall|taller|tallest|wide|width|best\s*unit|unit\s*of\s*length|how\s*long|how\s*tall|how\s*wide|how\s*far|estimate)\b/.test(s);
}
function isRulerPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(ruler|inch(es)?|cm\b|centimeter|tick|mark|starts?\s*at|ends?\s*at|line\s*it\s*up|zero\s*end)\b/.test(s);
}
function isTemperaturePrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(temperature|thermometer|degrees?|°|fahrenheit|celsius|hot|cold|hotter|colder|warm(er)?|cool(er)?|freezing|freeze|boiling|boil)\b/.test(s);
}
function isCapacityPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(capacity|holds|holds\s*more|holds\s*less|container|cup|cups|pint|pints|quart|quarts|gallon|gallons|liter|liters|milliliter|milliliters|ml\b|liquid|volume|how\s*much\s*(water|liquid|juice|milk|soda)|fill\s*the)\b/.test(s);
}
function isMoreLessPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(most|least|more|fewer|fewest|less|how many more|how many fewer|how many less|which has more|which has fewer|which has the most|which has the least|greatest|smallest|longer|longest|shorter|shortest|tallest|hotter|colder|warmer|cooler|holds more|holds less)\b/.test(s);
}
function detectMostLeastDirection(t){
  const s = String(t || '').toLowerCase();
  if(/\b(least|fewest|smallest|shortest|how many fewer|how many less|which has fewer|which has the least|coldest|coolest|holds less)\b/.test(s)) return 'least';
  if(/\b(most|greatest|longest|tallest|how many more|which has more|which has the most|hottest|warmest|holds more)\b/.test(s)) return 'most';
  return null;
}

// ───── Measurement-unit detection ─────
const LENGTH_UNITS = ['inches','inch','feet','foot','yards','yard','centimeters','centimeter','cm','meters','meter'];
const CAPACITY_UNITS = ['cups','cup','pints','pint','quarts','quart','gallons','gallon','liters','liter','milliliters','milliliter','ml'];
const TEMP_UNITS_TOKENS = ['fahrenheit','celsius','°f','°c','degrees','degree'];

function detectMeasurementUnit(s){
  const t = String(s || '').toLowerCase();
  for(const u of LENGTH_UNITS){
    if(new RegExp('\\b' + u + '\\b').test(t)) return { kind: 'length', unit: u };
  }
  for(const u of CAPACITY_UNITS){
    if(new RegExp('\\b' + u + '\\b').test(t)) return { kind: 'capacity', unit: u };
  }
  for(const u of TEMP_UNITS_TOKENS){
    if(t.includes(u)) return { kind: 'temperature', unit: u };
  }
  return null;
}
function detectWrongMeasurementUnit(wrongVal, correctVal){
  const w = detectMeasurementUnit(wrongVal);
  const c = detectMeasurementUnit(correctVal);
  if(!w || !c) return null;
  if(w.kind !== c.kind) return { reason: 'wrong_attribute', wrongKind: w.kind, correctKind: c.kind };
  if(w.unit !== c.unit) return { reason: 'wrong_unit_same_kind', wrongUnit: w.unit, correctUnit: c.unit };
  return null;
}

// ───── Time-format helpers ─────
function parseTimeValue(s){
  const m = String(s || '').match(/(\d{1,2}):(\d{2})/);
  if(!m) return null;
  return { h: parseInt(m[1],10), min: parseInt(m[2],10), raw: m[0] };
}
function detectMinuteHandByOnesPattern(wrongVal, correctVal){
  const w = parseTimeValue(wrongVal); const c = parseTimeValue(correctVal);
  if(!w || !c) return false;
  // wrong reads minute hand number directly (e.g. correct 3:30 → wrong 3:06 because hand pointed at 6)
  return w.h === c.h && c.min % 5 === 0 && w.min === (c.min / 5);
}
function detectMinuteHandByFivesPattern(wrongVal, correctVal){
  const w = parseTimeValue(wrongVal); const c = parseTimeValue(correctVal);
  if(!w || !c) return false;
  return w.h === c.h && c.min % 5 === 0 && w.min % 5 === 0 && Math.abs(w.min - c.min) === 5;
}
function detectHourHandConfusion(wrongVal, correctVal){
  const w = parseTimeValue(wrongVal); const c = parseTimeValue(correctVal);
  if(!w || !c) return false;
  return Math.abs(w.h - c.h) === 1 && w.min === c.min;
}

function isCategoryText(s){
  if(typeof s !== 'string') return false;
  const t = s.trim();
  if(!t) return false;
  if(/^-?\d+(\.\d+)?$/.test(t)) return false;       // pure number
  if(/^\d{1,2}:\d{2}$/.test(t)) return false;       // pure time literal — treated separately
  if(/^\d+\s+[A-Za-z]/.test(t)) return true;        // "5 inches"
  return /[A-Za-z]/.test(t);
}

// ───── lessonId classifier (testBank/unitQuiz; first-match-wins) ─────
const reviewItems = [];

function classifyLessonId(prompt, options){
  const t = String(prompt || '');
  // 1. Time first — clock language is unambiguous and might co-occur with measurement word problems.
  if(isTimePrompt(t) || isClockPrompt(t)) return { id: 'u7l2', confident: true };
  // 2. Temperature/capacity before generic length (both are technically measurement).
  if(isTemperaturePrompt(t) || isCapacityPrompt(t)) return { id: 'u7l3', confident: true };
  // 3. Length / ruler / units.
  if(isLengthPrompt(t) || isRulerPrompt(t)) return { id: 'u7l1', confident: true };
  // 4. Fallback: assume length (the dominant lesson) but flag for review.
  return { id: 'u7l1', confident: false };
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_wrong_unit: 0,
  err_measurement_reading_error: 0,
  err_length_confusion: 0,
  err_capacity_confusion: 0,
  err_temperature_confusion: 0,
  err_clock_hour_hand_confusion: 0,
  err_clock_minute_hand_confusion: 0,
  err_time_to_five_confusion: 0,
  err_elapsed_time_confusion: 0,
  err_more_less_confusion: 0,
  err_off_by_one: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_magnitude_error: 0,
  err_wrong_category: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId, allOptions){
  const wStr = String(wrongVal);
  const cStr = String(correctVal);
  const wn = getNumericValue(wStr);
  const cn = getNumericValue(cStr);
  const wrongIsCategory = isCategoryText(wStr) && wn === null;
  const correctIsCategory = isCategoryText(cStr) && cn === null;
  const t = String(prompt || '');
  const isTime = lessonId === 'u7l2' || isTimePrompt(t) || isClockPrompt(t);
  const isLength = lessonId === 'u7l1' || isLengthPrompt(t) || isRulerPrompt(t);
  const isTemp = isTemperaturePrompt(t);
  const isCap = isCapacityPrompt(t);
  const isMoreLess = isMoreLessPrompt(t);
  const moreLessDir = detectMostLeastDirection(t);

  // ============= 1. TIME / CLOCK =============
  if(isTime){
    if(detectMinuteHandByOnesPattern(wStr, cStr))
      return { tag: 'err_clock_minute_hand_confusion', patternTag: 'pattern_counted_minutes_by_ones' };
    if(detectMinuteHandByFivesPattern(wStr, cStr))
      return { tag: 'err_time_to_five_confusion', patternTag: 'pattern_counted_minutes_by_fives_wrong' };
    if(detectHourHandConfusion(wStr, cStr))
      return { tag: 'err_clock_hour_hand_confusion', patternTag: 'pattern_confused_hour_minute_hand' };
    if(/\belapsed\b/i.test(t))
      return { tag: 'err_elapsed_time_confusion', patternTag: 'pattern_needs_review' };
    // Numeric time-related: hours/days/weeks math
    if(wn !== null && cn !== null){
      const delta = wn - cn;
      const absDelta = Math.abs(delta);
      if(absDelta === 1) return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      if(cn !== 0 && wn === cn * 60) return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
      if(cn % 60 === 0 && cn !== 0 && wn === cn / 60) return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
      if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
      return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
    }
    // Non-numeric time fallback (text "morning"/"afternoon" etc)
    if(wrongIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
  }

  // ============= 2. LENGTH / RULER / UNITS =============
  if(isLength && !isTemp && !isCap){
    const unitMismatch = detectWrongMeasurementUnit(wStr, cStr);
    if(unitMismatch){
      if(unitMismatch.reason === 'wrong_attribute'){
        return { tag: 'err_wrong_unit', patternTag: 'pattern_wrong_unit' };
      }
      // length-vs-length unit confusion (inches vs feet vs yards vs cm)
      return { tag: 'err_length_confusion', patternTag: 'pattern_confused_inches_feet_yards' };
    }
    // ruler reading off-by-one — student measured from 1 instead of 0
    if(wn !== null && cn !== null){
      if(/\bruler\b/i.test(t) && wn === cn - 1){
        return { tag: 'err_measurement_reading_error', patternTag: 'pattern_measured_from_one_not_zero' };
      }
      if(Math.abs(wn - cn) === 1){
        return { tag: 'err_measurement_reading_error', patternTag: 'pattern_read_wrong_ruler_mark' };
      }
    }
    if(isMoreLess && moreLessDir){
      if(moreLessDir === 'most' && wn !== null && cn !== null && wn < cn){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      if(moreLessDir === 'least' && wn !== null && cn !== null && wn > cn){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
    }
    if(wrongIsCategory && !correctIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
  }

  // ============= 3. TEMPERATURE =============
  if(isTemp){
    if(isMoreLess || /\b(hotter|colder|warmer|cooler|hottest|coldest)\b/i.test(t)){
      if(wn !== null && cn !== null){
        if(moreLessDir === 'most' && wn < cn) return { tag: 'err_temperature_confusion', patternTag: 'pattern_reversed_more_less' };
        if(moreLessDir === 'least' && wn > cn) return { tag: 'err_temperature_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      if(wrongIsCategory){
        return { tag: 'err_temperature_confusion', patternTag: 'pattern_reversed_more_less' };
      }
    }
    if(wn !== null && cn !== null){
      if(Math.abs(wn - cn) > 30){
        return { tag: 'err_temperature_confusion', patternTag: 'pattern_wrong_temperature_scale' };
      }
      const delta = wn - cn;
      if(Math.abs(delta) === 1) return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
      return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
    }
    if(wrongIsCategory){
      return { tag: 'err_temperature_confusion', patternTag: 'pattern_wrong_category' };
    }
  }

  // ============= 4. CAPACITY =============
  if(isCap){
    const unitMismatch = detectWrongMeasurementUnit(wStr, cStr);
    if(unitMismatch){
      if(unitMismatch.reason === 'wrong_attribute'){
        return { tag: 'err_capacity_confusion', patternTag: 'pattern_confused_capacity_with_other' };
      }
      return { tag: 'err_capacity_confusion', patternTag: 'pattern_confused_capacity_units' };
    }
    if(isMoreLess || /\b(holds\s*more|holds\s*less)\b/i.test(t)){
      if(wn !== null && cn !== null){
        if(moreLessDir === 'most' && wn < cn) return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
        if(moreLessDir === 'least' && wn > cn) return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      if(wrongIsCategory){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
    }
    if(wn !== null && cn !== null){
      const delta = wn - cn;
      if(Math.abs(delta) === 1) return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
      return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
    }
    if(wrongIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
  }

  // ============= 5. MORE/LESS COMPARISON (cross-cutting) =============
  if(isMoreLess && moreLessDir){
    if(wn !== null && cn !== null){
      if(moreLessDir === 'most' && wn < cn) return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      if(moreLessDir === 'least' && wn > cn) return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
    }
  }

  // ============= 6. NON-NUMERIC FALLBACK =============
  if(wn === null || cn === null){
    const wL = wStr.trim().toLowerCase();
    const cL = cStr.trim().toLowerCase();

    // True/False/Yes/No
    if(/^(true|false|yes|no)$/i.test(wL) || /^(true|false|yes|no)$/i.test(cL)){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_assertion' };
    }
    // Equality misjudgment
    if(/^(equal|same|they are (equal|the same)|the same|tied|it is a tie)$/i.test(wL)){
      return { tag: 'err_more_less_confusion', patternTag: 'pattern_thinks_equal' };
    }
    // Avoidance
    if(/^(not enough info|cannot tell|depends|sometimes|it depends|just guess|i don't know)$/i.test(wL)){
      return { tag: 'err_confused', patternTag: 'pattern_avoidance' };
    }
    // Both/neither/all/none
    if(/^(both|neither|all of (the )?above|none of (the )?above|all|none|both [a-c] and [a-c]|only [a-z]+)$/i.test(wL)){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_meta_option' };
    }
    // Wrong unit detection across categories
    const unitMismatchAny = detectWrongMeasurementUnit(wStr, cStr);
    if(unitMismatchAny){
      if(unitMismatchAny.reason === 'wrong_attribute') return { tag: 'err_wrong_unit', patternTag: 'pattern_wrong_unit' };
      // Same kind, different unit — pick the most specific tag we can
      if(unitMismatchAny.wrongKind === 'length' || unitMismatchAny.correctKind === 'length'){
        return { tag: 'err_length_confusion', patternTag: 'pattern_confused_inches_feet_yards' };
      }
      if(unitMismatchAny.wrongKind === 'capacity' || unitMismatchAny.correctKind === 'capacity'){
        return { tag: 'err_capacity_confusion', patternTag: 'pattern_confused_capacity_units' };
      }
      return { tag: 'err_wrong_unit', patternTag: 'pattern_wrong_unit' };
    }
    if(wrongIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
    // Lesson-specific text fallback
    if(lessonId === 'u7l1') return { tag: 'err_measurement_reading_error', patternTag: 'pattern_needs_review' };
    if(lessonId === 'u7l2') return { tag: 'err_clock_minute_hand_confusion', patternTag: 'pattern_needs_review' };
    if(lessonId === 'u7l3') return { tag: 'err_capacity_confusion', patternTag: 'pattern_needs_review' };
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  // ============= 7. GENERAL NUMERIC =============
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
    // Negative-integer sanity check (measurements/time should never be negative)
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
  const lessonId = `u7l${lessonIdx + 1}`;
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
const perLesson = { u7l1: 0, u7l2: 0, u7l3: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u7l${idx+1}`;
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

// ───── Re-emit u7.js ─────
const header = '// Unit 7: Measurement & Time\n';
const body = '_mergeUnitData(6, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U7_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u7_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length,
  sGate: { checked: sGateChecked, failed: sGateFailed }
}, null, 2));
console.log('Wrote:', U7_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`s-field byte-equality gate: ${sGateChecked} questions checked, ${sGateFailed} mismatches`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
