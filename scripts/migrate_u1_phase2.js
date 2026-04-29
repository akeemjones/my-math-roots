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
  err_inverse_confusion: 0,
  err_wrong_operation: 0,
  err_doubles_confusion: 0,
  err_make_ten_confusion: 0,
  err_fact_family_confusion: 0,
  err_concept_confusion: 0,
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

function classifyWordDistractor(wrongVal, correctVal, prompt, lessonId){
  const w = String(wrongVal).toLowerCase().trim();
  const c = String(correctVal).toLowerCase().trim();
  const p = String(prompt || '').toLowerCase();

  // 1) Strategy-name inverse (count on vs count back, etc.)
  const STRAT_TOKENS = ['count on', 'count back', 'count up', 'count down', 'count forward', 'count backward', 'count backwards'];
  const cStrat = STRAT_TOKENS.find(s => c.includes(s));
  const wStrat = STRAT_TOKENS.find(s => w.includes(s));
  if(cStrat && wStrat && cStrat !== wStrat){
    return { tag: 'err_inverse_confusion', patternTag: 'pattern_inverse_fact_confusion' };
  }

  // 2) Bare operation-word distractor ("Subtract"/"Add"/etc. when correct is something else)
  const OP_RE = /^(subtract|add|multiply|divide|addition|subtraction)\s*\.?$/;
  if(OP_RE.test(w) && !OP_RE.test(c)){
    return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
  }

  // 2.5) Strategy-pick prompt with strategy-phrase distractor (broader than #2)
  const isStrategyPrompt = /\b(strategy|best way|helps (?:you )?solve|way (?:to|that helps) solve|which way helps|method|trick|which (?:problem|number sentence|expression|fact|two problems))\b/.test(p);
  const STRAT_PHRASE_RE = /^\s*(subtract|add|count|use|near|skip|start|double|doubles|make|begin|think|put|find|reverse)\b/i;
  if(isStrategyPrompt && STRAT_PHRASE_RE.test(w) && !STRAT_PHRASE_RE.test(c)){
    return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
  }
  // Strategy prompt with arithmetic distractor (e.g., "5 + 2" when prompt asks about counting back)
  if(isStrategyPrompt && /\d+\s*[+\-−]\s*\d+/.test(w) && !/\d+\s*[+\-−]\s*\d+/.test(c)){
    return { tag: 'err_inverse_confusion', patternTag: 'pattern_inverse_fact_confusion' };
  }
  // Strategy prompt where BOTH correct and wrong are strategy phrases but different
  if(isStrategyPrompt && STRAT_PHRASE_RE.test(w) && STRAT_PHRASE_RE.test(c) && w !== c){
    return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
  }

  // 3) "Add N" / "Subtract N" near-doubles modifier (e.g., "Add 1" vs "Add 0")
  const wAS = w.match(/^(add|subtract)\s+(\d+)\b/);
  const cAS = c.match(/^(add|subtract)\s+(\d+)\b/);
  if(wAS && cAS){
    if(wAS[1] !== cAS[1]){
      return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
    }
    const wn = parseInt(wAS[2], 10);
    const cn = parseInt(cAS[2], 10);
    if(Math.abs(wn - cn) === 1){
      return { tag: 'err_off_by_one', patternTag: wn > cn ? 'pattern_one_more' : 'pattern_one_less' };
    }
    return { tag: 'err_magnitude_error', patternTag: wn > cn ? 'pattern_too_high' : 'pattern_too_low' };
  }

  // 4) Doubles fact heuristic — prompt asks for a doubles fact OR lesson is u1l2
  if(/\bdouble(s)?\b/.test(p) || lessonId === 'u1l2'){
    // Wrong is an arithmetic addition expression (with or without "=")
    if(/\d+\s*\+\s*\d+/.test(w)){
      return { tag: 'err_doubles_confusion', patternTag: 'pattern_doubled_wrong_number' };
    }
    // Wrong is "X and Y" pair format (e.g., "7 and 7" when correct "8 and 8")
    if(/^\s*\d+\s+and\s+\d+\s*$/.test(w) && /^\s*\d+\s+and\s+\d+\s*$/.test(c)){
      return { tag: 'err_doubles_confusion', patternTag: 'pattern_doubled_wrong_number' };
    }
  }

  // 4.5) Pair-format "X and Y" with one number off by 1 (any lesson)
  const wPair = w.match(/^\s*(\d+)\s+and\s+(\d+)\s*$/);
  const cPair = c.match(/^\s*(\d+)\s+and\s+(\d+)\s*$/);
  if(wPair && cPair){
    const w1 = parseInt(wPair[1], 10), w2 = parseInt(wPair[2], 10);
    const c1 = parseInt(cPair[1], 10), c2 = parseInt(cPair[2], 10);
    const d1 = w1 - c1, d2 = w2 - c2;
    if((d1 === 0 && Math.abs(d2) === 1) || (d2 === 0 && Math.abs(d1) === 1)){
      const sign = (d1 || d2) > 0 ? 'pattern_one_more' : 'pattern_one_less';
      return { tag: 'err_off_by_one', patternTag: sign };
    }
    if(lessonId === 'u1l4'){
      return { tag: 'err_fact_family_confusion', patternTag: 'pattern_inverse_fact_confusion' };
    }
  }

  // 5) Make-a-ten miscombination — prompt mentions make-ten or lesson is u1l3
  if(/make (?:a )?(?:ten|10)|making (?:a )?(?:ten|10)|(?:make|making).*=.*10/.test(p) || lessonId === 'u1l3'){
    if(/=\s*\d+/.test(w) && /\+/.test(w)){
      return { tag: 'err_make_ten_confusion', patternTag: 'pattern_wrong_ten_pair' };
    }
    if(/(double|count by|skip count|subtract from|use doubles)/.test(w)){
      return { tag: 'err_make_ten_confusion', patternTag: 'pattern_wrong_ten_pair' };
    }
  }

  // 6) Fact-family arithmetic distractors
  if(/fact (?:family|families)|number (?:family|families)|related fact|inverse|fact triangle/.test(p) || lessonId === 'u1l4'){
    const wmm = w.match(/(\d+)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)/);
    const cmm = c.match(/(\d+)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)/);
    if(wmm && cmm){
      const wOp = wmm[2] === '−' ? '-' : wmm[2];
      const cOp = cmm[2] === '−' ? '-' : cmm[2];
      if(wOp !== cOp){
        return { tag: 'err_inverse_confusion', patternTag: 'pattern_inverse_fact_confusion' };
      }
      return { tag: 'err_fact_family_confusion', patternTag: 'pattern_inverse_fact_confusion' };
    }
    if(wmm && !cmm){
      return { tag: 'err_fact_family_confusion', patternTag: 'pattern_inverse_fact_confusion' };
    }
    // Three-number lists: "8,5,13" vs "8,5,12"
    const wL = w.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
    const cL = c.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
    if(wL && cL){
      const ws = [parseInt(wL[1]), parseInt(wL[2]), parseInt(wL[3])].sort((a,b)=>a-b);
      const cs = [parseInt(cL[1]), parseInt(cL[2]), parseInt(cL[3])].sort((a,b)=>a-b);
      const diffs = ws.map((v,i)=>v-cs[i]);
      const nonZero = diffs.filter(d => d !== 0);
      if(nonZero.length === 1 && Math.abs(nonZero[0]) === 1){
        return { tag: 'err_off_by_one', patternTag: nonZero[0] > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      }
      return { tag: 'err_fact_family_confusion', patternTag: 'pattern_inverse_fact_confusion' };
    }
  }

  // 7) Doubles-strategy helper (u1l2): wrong is an arithmetic expression
  if(lessonId === 'u1l2' && /\d+\s*\+\s*\d+\s*=\s*\d+/.test(w)){
    return { tag: 'err_doubles_confusion', patternTag: 'pattern_doubled_wrong_number' };
  }

  // 8) Concept-question fallback (Why / What does / What is / What helps)
  if(/^\s*(why|what does|what is|what helps|how does)\b/.test(p)){
    return { tag: 'err_concept_confusion', patternTag: 'pattern_unrelated_concept' };
  }

  // 9) Mistake-finder / yes-no-explanation reasoning questions
  if(/\b(mistake|did .* (?:make|do)|is (?:he|she|they|this) (?:right|correct)|is right|is correct|is wrong|find the error)\b/.test(p)){
    return { tag: 'err_concept_confusion', patternTag: 'pattern_unrelated_concept' };
  }

  // 10) u1l4 strategy-phrase distractor (no fact-family arithmetic match yet)
  if(lessonId === 'u1l4' && STRAT_PHRASE_RE.test(w)){
    return { tag: 'err_fact_family_confusion', patternTag: 'pattern_inverse_fact_confusion' };
  }

  // 11) u1l1 generic count-strategy fallback — wrong has count/skip/double phrase
  if(lessonId === 'u1l1' && STRAT_PHRASE_RE.test(w)){
    return { tag: 'err_wrong_operation', patternTag: 'pattern_wrong_operation' };
  }

  // 12) u1l3 strategy-phrase or arithmetic-expression distractor
  if(lessonId === 'u1l3' && (STRAT_PHRASE_RE.test(w) || /\d+\s*[+\-−]\s*\d+/.test(w))){
    return { tag: 'err_make_ten_confusion', patternTag: 'pattern_wrong_ten_pair' };
  }

  // Final fallback
  return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
}

function classifyDistractor(wrongVal, correctVal, prompt, lessonId){
  const wn = tryParseInt(wrongVal);
  const cn = tryParseInt(correctVal);
  if(wn === null || cn === null){
    return classifyWordDistractor(wrongVal, correctVal, prompt, lessonId);
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
  // Normalize: extract val from either bare-string or object-form options
  const extractVal = (opt) => (typeof opt === 'object' && opt !== null && 'val' in opt) ? String(opt.val) : String(opt);
  const isAlreadyObject = !isBareStringOptions(q.o);
  if(isAlreadyObject){
    stats.alreadyObjectForm++;
    q.o.forEach((opt, i) => {
      if(typeof opt !== 'object' || opt === null || !('val' in opt)){
        console.error(`FATAL: malformed option in ${where} at index ${i}: ${JSON.stringify(opt)}`);
        process.exit(1);
      }
    });
  }

  const originalCorrect = extractVal(q.o[a]);
  const newOpts = q.o.map((opt, i) => {
    const val = extractVal(opt);
    if(i === a){
      return { val };
    }
    const cls = classifyDistractor(val, originalCorrect, q.t, q.lessonId);
    heuristicCounts[cls.tag] = (heuristicCounts[cls.tag] || 0) + 1;
    return { val, tag: cls.tag, patternTag: cls.patternTag };
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
