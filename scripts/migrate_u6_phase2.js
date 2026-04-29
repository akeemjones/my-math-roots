#!/usr/bin/env node
// scripts/migrate_u6_phase2.js
// One-shot transform for Grade 2 Unit 6 (Data Analysis) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - PRESERVES `s`-field SVG/HTML byte-for-byte per question (strict triple-equals gate)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u6.js with the transformed payload
//
// NOTE: backup (cp src/data/u6.js src/data/u6.js.bak) and pre-edit git tag
// (git tag phase2-u6-pre-edit) are run as EXPLICIT terminal commands BEFORE this script.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U6_PATH = path.join(REPO_ROOT, 'src', 'data', 'u6.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u6_review.txt');

// ───── Load u6.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U6_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 5) { console.error('FATAL: expected idx=5 for u6, got', idx); process.exit(1); }

// ───── Snapshot s-fields BEFORE any transformation ─────
const sSnapshots = []; // { ref, orig, where }
function snapshotS(q, where){
  if(q && typeof q.s === 'string'){
    sSnapshots.push({ ref: q, where, orig: q.s });
  }
}
data.lessons.forEach((lesson, li) => {
  (lesson.qBank || []).forEach((q, qi) => snapshotS(q, `qBank[u6l${li+1}][${qi}]`));
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

// ───── Data-analysis prompt classifiers ─────
function isLinePlotPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\bline\s*plot\b|\blineplot\b|\bx\s*marks?\b|\bmarks? on the line\b|\bnumber line data\b|\bmeasurement data\b|\blengths? on the line\b|\bline graph\b/.test(s);
}
function isPictureGraphPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\bpicture\s*graph\b|\bpictograph\b|\bpicture chart\b|\beach\s*(picture|symbol|star|smiley|heart|apple|book|flower|stamp)\b|\bgraph key\b|\bkey shows\b|\bone (picture|symbol|star) (=|equals)\b|\b=\s*\d+\s+(students|kids|children|votes|people|items|books|apples|hearts|stars)\b/.test(s);
}
function isBarGraphPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\bbar\s*graph\b|\bbar\s*chart\b|\bbar is (tallest|shortest|longest)\b|\bheight of the bar\b|\bwhich bar\b|\btallest bar\b|\bshortest bar\b/.test(s);
}
function isTallyPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\btally\b|\btally\s*marks?\b|\bfifth mark\b|\bdiagonal mark\b|\bgroups of five\b|\bgroup of five\b|\bcross(ed)? out the (4|four)\b/.test(s);
}
function isMoreLessPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(most|least|more|fewer|fewest|how many more|how many fewer|how many less|which has more|which has fewer|which has the most|which has the least|greatest|smallest)\b/.test(s);
}
function detectMostLeastDirection(t){
  const s = String(t || '').toLowerCase();
  if(/\b(least|fewest|smallest|how many fewer|how many less|which has fewer|which has the least)\b/.test(s)) return 'least';
  if(/\b(most|greatest|how many more|which has more|which has the most)\b/.test(s)) return 'most';
  return null;
}
function detectDifferencePrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(how many more|how many fewer|how many less|the difference|difference between)\b/.test(s);
}
function detectTotalPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(total|altogether|in all|how many in all|combined|sum of)\b/.test(s);
}
function detectPictureKeyMultiplier(t){
  // "Each picture = 2 students" / "key: 1 star = 5 votes"
  const s = String(t || '').toLowerCase();
  const m = s.match(/=\s*(\d+)\s+(students|kids|children|votes|people|items|books|apples|hearts|stars|flowers|cookies|cars|toys)/);
  if(m) return parseInt(m[1], 10);
  const m2 = s.match(/each\s+(picture|symbol|star|smiley|heart|apple|book|flower|stamp|cookie|car|toy)\s+=?\s*(\d+)/);
  if(m2) return parseInt(m2[2], 10);
  return null;
}

function isCategoryText(s){
  if(typeof s !== 'string') return false;
  const t = s.trim();
  if(!t) return false;
  // Pure number → not a category
  if(/^-?\d+(\.\d+)?$/.test(t)) return false;
  // "5 inches" / "7 books" — has units; treat as category-like measurement
  if(/^\d+\s+[A-Za-z]/.test(t)) return true;
  // Letters present → category-like
  return /[A-Za-z]/.test(t);
}

// ───── lessonId classifier (testBank/unitQuiz; first-match-wins) ─────
const reviewItems = [];

function classifyLessonId(prompt, options){
  const t = String(prompt || '');
  // Order: line plot first (marks/measurement may overlap with tally/bar);
  // picture graph next (key/each-picture); bar graph; tally; fallback bar.
  if(isLinePlotPrompt(t))     return { id: 'u6l4', confident: true };
  if(isPictureGraphPrompt(t)) return { id: 'u6l3', confident: true };
  if(isBarGraphPrompt(t))     return { id: 'u6l2', confident: true };
  if(isTallyPrompt(t))        return { id: 'u6l1', confident: true };
  return { id: 'u6l2', confident: false };
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_tally_group_confusion: 0,
  err_graph_reading_confusion: 0,
  err_wrong_category: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_total_category_confusion: 0,
  err_more_less_confusion: 0,
  err_line_plot_confusion: 0,
  err_picture_key_confusion: 0,
  err_counted_symbols_not_key_value: 0,
  err_off_by_one: 0,
  err_magnitude_error: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId, allOptions){
  const wStr = String(wrongVal);
  const cStr = String(correctVal);
  const wn = getNumericValue(wStr);
  const cn = getNumericValue(cStr);
  const wrongIsCategory = isCategoryText(wStr) && wn === null;
  const correctIsCategory = isCategoryText(cStr) && cn === null;
  const promptNumbers = extractNumbersFromPrompt(prompt);
  const isTally = lessonId === 'u6l1' || isTallyPrompt(prompt);
  const isPictureKey = lessonId === 'u6l3' || isPictureGraphPrompt(prompt);
  const isBarGraph = lessonId === 'u6l2' || isBarGraphPrompt(prompt);
  const isLinePlot = lessonId === 'u6l4' || isLinePlotPrompt(prompt);
  const isMoreLess = isMoreLessPrompt(prompt);
  const moreLessDir = detectMostLeastDirection(prompt);
  const isDifference = detectDifferencePrompt(prompt);
  const isTotal = detectTotalPrompt(prompt);

  // ── Rule 1: Tally rules (u6l1 / tally prompts) ──
  if(isTally && wn !== null && cn !== null){
    const delta = wn - cn;
    const absDelta = Math.abs(delta);
    if(absDelta === 5){
      return { tag: 'err_tally_group_confusion', patternTag: 'pattern_missed_tally_group_of_five' };
    }
    if(absDelta === 1){
      return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
    }
    if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
    return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
  }

  // ── Rule 2: Picture graph key rules (u6l3 / picture graph prompts) ──
  if(isPictureKey){
    const keyMult = detectPictureKeyMultiplier(prompt);
    if(wn !== null && cn !== null && keyMult !== null && keyMult >= 2){
      // Wrong equals raw symbol count when prompt has a key multiplier
      // (correct = symbols * keyMult, wrong = symbols)
      if(cn % keyMult === 0 && wn === cn / keyMult){
        return { tag: 'err_counted_symbols_not_key_value', patternTag: 'pattern_counted_symbols_not_key_value' };
      }
      // Wrong used a different multiplier
      if(promptNumbers.length > 0){
        for(const n of promptNumbers){
          if(n >= 2 && n !== keyMult && wn === n * (cn / keyMult)){
            return { tag: 'err_picture_key_confusion', patternTag: 'pattern_picture_key_ignored' };
          }
        }
      }
    }
    if(wrongIsCategory && !correctIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
    if(wn !== null && cn !== null){
      const delta = wn - cn;
      const absDelta = Math.abs(delta);
      if(absDelta === 1){
        return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      }
      // Numeric miscount in picture-graph context
      if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_miscounted_graph' };
      return { tag: 'err_over_count', patternTag: 'pattern_miscounted_graph' };
    }
  }

  // ── Rule 3: Bar graph rules (u6l2 / bar graph prompts) ──
  if(isBarGraph){
    if(wrongIsCategory && correctIsCategory){
      // Both options are categories — most/least reversal
      if(isMoreLess){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
    if(wrongIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
    if(wn !== null && cn !== null){
      // Total/category confusion: wrong matches a total of multiple bars from prompt
      if(isTotal === false && promptNumbers.length >= 2){
        const total = promptNumbers.reduce((a,b) => a + b, 0);
        if(wn === total && cn !== total){
          return { tag: 'err_total_category_confusion', patternTag: 'pattern_confused_total_with_group' };
        }
      }
      const delta = wn - cn;
      const absDelta = Math.abs(delta);
      if(absDelta === 1){
        return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      }
      // More/less reversal (wrong on the wrong side of correct)
      if(isMoreLess && moreLessDir === 'most' && wn < cn){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      if(isMoreLess && moreLessDir === 'least' && wn > cn){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      return { tag: 'err_graph_reading_confusion', patternTag: 'pattern_miscounted_graph' };
    }
  }

  // ── Rule 4: Line plot rules (u6l4 / line plot prompts) ──
  if(isLinePlot){
    if(wrongIsCategory && correctIsCategory){
      // Both options are measurement categories ("5 inches" vs "7 inches")
      return { tag: 'err_line_plot_confusion', patternTag: 'pattern_wrong_line_plot_mark' };
    }
    if(wrongIsCategory){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
    if(wn !== null && cn !== null){
      // Total of all bins vs single bin
      if(isTotal === false && promptNumbers.length >= 2){
        const total = promptNumbers.reduce((a,b) => a + b, 0);
        if(wn === total && cn !== total){
          return { tag: 'err_total_category_confusion', patternTag: 'pattern_confused_total_with_group' };
        }
      }
      const delta = wn - cn;
      const absDelta = Math.abs(delta);
      if(absDelta === 1){
        return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      }
      // Most/least reversal in line plot context
      if(isMoreLess && moreLessDir === 'most' && wn < cn){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      if(isMoreLess && moreLessDir === 'least' && wn > cn){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      return { tag: 'err_line_plot_confusion', patternTag: 'pattern_wrong_line_plot_mark' };
    }
  }

  // ── Rule 5: Non-numeric specialized text rules ──
  if(wn === null || cn === null){
    const wL = wStr.trim().toLowerCase();
    const cL = cStr.trim().toLowerCase();

    // True/False/Yes/No
    if(/^(true|false|yes|no)$/i.test(wL) || /^(true|false|yes|no)$/i.test(cL)){
      return { tag: 'err_graph_reading_confusion', patternTag: 'pattern_wrong_assertion' };
    }
    // Equality misjudgment
    if(/^(equal|same|they are (equal|the same)|the same|tied|it is a tie)$/i.test(wL)){
      return { tag: 'err_more_less_confusion', patternTag: 'pattern_thinks_equal' };
    }
    // Avoidance / non-committal
    if(/^(not enough info|cannot tell|depends|sometimes|it depends|just guess|i don't know)$/i.test(wL)){
      return { tag: 'err_confused', patternTag: 'pattern_avoidance' };
    }
    // Strategy options
    if(/\b(count by|in order|count all|count everything|biggest|smallest|first|strategy|just guess)\b/i.test(wL)){
      return { tag: 'err_graph_reading_confusion', patternTag: 'pattern_wrong_strategy' };
    }
    // Both/neither/all/none meta-options
    if(/^(both|neither|all of (the )?above|none of (the )?above|all|none|both [a-c] and [a-c]|only [a-z]+)$/i.test(wL)){
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_meta_option' };
    }
    // Person/category names — wrong category in comparison
    if(wrongIsCategory){
      if(isMoreLess){
        return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
      }
      return { tag: 'err_wrong_category', patternTag: 'pattern_wrong_category' };
    }
    // Lesson-specific text fallback
    if(lessonId === 'u6l1') return { tag: 'err_tally_group_confusion', patternTag: 'pattern_needs_review' };
    if(lessonId === 'u6l2') return { tag: 'err_graph_reading_confusion', patternTag: 'pattern_needs_review' };
    if(lessonId === 'u6l3') return { tag: 'err_picture_key_confusion', patternTag: 'pattern_needs_review' };
    if(lessonId === 'u6l4') return { tag: 'err_line_plot_confusion', patternTag: 'pattern_needs_review' };
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  // ── Rule 6: More/less comparison (any lesson, both numeric) ──
  if(isMoreLess && moreLessDir){
    if(moreLessDir === 'most' && wn < cn){
      return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
    }
    if(moreLessDir === 'least' && wn > cn){
      return { tag: 'err_more_less_confusion', patternTag: 'pattern_reversed_more_less' };
    }
    // Total/category confusion in difference prompts
    if(isDifference && promptNumbers.length >= 2){
      const total = promptNumbers.reduce((a,b) => a + b, 0);
      if(wn === total){
        return { tag: 'err_total_category_confusion', patternTag: 'pattern_confused_total_with_group' };
      }
      // Wrong matches a single category value rather than the difference
      if(promptNumbers.includes(wn) && wn !== cn){
        return { tag: 'err_total_category_confusion', patternTag: 'pattern_confused_total_with_group' };
      }
    }
  }

  // ── Rule 7: General numeric ──
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
    // Negative-integer sanity check (data analysis: counts/measurements should never be negative)
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
  const lessonId = `u6l${lessonIdx + 1}`;
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
const perLesson = { u6l1: 0, u6l2: 0, u6l3: 0, u6l4: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u6l${idx+1}`;
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

// ───── Re-emit u6.js ─────
const header = '// Unit 6: Data Analysis\n';
const body = '_mergeUnitData(5, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U6_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u6_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length,
  sGate: { checked: sGateChecked, failed: sGateFailed }
}, null, 2));
console.log('Wrote:', U6_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`s-field byte-equality gate: ${sGateChecked} questions checked, ${sGateFailed} mismatches`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
