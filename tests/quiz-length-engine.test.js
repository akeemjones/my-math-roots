'use strict';

// =============================================================================
//  Configurable Quiz Lengths — engine wiring guards
//
//  quiz.js is not Node-loadable (it references DOM/app globals at module
//  scope), so these tests (1) extract the real without-replacement sampler and
//  prove it serves exactly N unique questions, and (2) pin the structural
//  invariants of the length wiring so the approved behaviors can't silently
//  regress:
//    - final test never receives a custom count (its 50-question path is intact)
//    - the K blueprint / native unit path is preserved and only bypassed for a
//      pooled (All / different-number) selection
//    - lesson + pooled-unit attempts thread a resolved count into _runQuiz
// =============================================================================

const fs = require('fs');
const path = require('path');

const QUIZ_SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'quiz.js'), 'utf8');

// Brace-balanced extraction of a top-level `function name(...) { ... }`.
function extractFn(src, name) {
  const start = src.indexOf('function ' + name);
  if (start < 0) return null;
  let i = src.indexOf('{', start);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  return null;
}

describe('_masteryWeightedSample — without replacement, honors N', () => {
  // Pull the real sampler out of quiz.js and run it in isolation with stubbed
  // MASTERY / _qKey. This is the function the custom + pooled paths use.
  const fnSrc = extractFn(QUIZ_SRC, '_masteryWeightedSample');
  const sampler = new Function('MASTERY', '_qKey', fnSrc + '\nreturn _masteryWeightedSample;')({}, function (t) { return t; });
  const bank = Array.from({ length: 50 }, function (_, i) { return { t: 'q' + i }; });

  function unique(arr) { return new Set(arr.map(function (q) { return q.t; })).size; }

  test('serves exactly N when N < bank, all unique', () => {
    const out = sampler(bank, 30);
    expect(out.length).toBe(30);
    expect(unique(out)).toBe(30);
  });
  test('a larger custom count is capped at the bank, still unique (no duplicates)', () => {
    const out = sampler(bank, 999);
    expect(out.length).toBe(50);
    expect(unique(out)).toBe(50);
  });
  test('serves "all" (== bank length) with no repeats', () => {
    const out = sampler(bank, bank.length);
    expect(out.length).toBe(50);
    expect(unique(out)).toBe(50);
  });
  test('empty request → empty result', () => {
    expect(sampler(bank, 0).length).toBe(0);
  });
});

describe('_runQuiz wiring', () => {
  test('_runQuiz accepts a trailing count parameter', () => {
    expect(QUIZ_SRC).toMatch(/function _runQuiz\(bank, qid, label, type, unitIdx, _prebuiltQs, mode, count\)/);
  });
  test('native attempt size still falls back to final=50 / unit=25 / lesson=8', () => {
    expect(QUIZ_SRC).toMatch(/type===['"]final['"]\s*\?\s*50\s*:\s*type===['"]unit['"]\s*\?\s*25\s*:\s*8/);
  });
  test('every non-practice count now routes through the stratified sampler', () => {
    // The old count===native gate (which dropped custom lengths to a flat
    // sampler) is gone; _weightedSample scales the difficulty mix to any n.
    expect(QUIZ_SRC).not.toMatch(/_useBalanced/);
    expect(QUIZ_SRC).toMatch(/isPractice \? bank\.slice\(\) : _weightedSample\(bank, n, type\)/);
  });
});

describe('final test is untouched', () => {
  test('both final_test calls pass no custom count', () => {
    expect(QUIZ_SRC).toMatch(/_runQuiz\(bank, 'final_test',[^\n]*'final', null\);/);
    expect(QUIZ_SRC).toMatch(/_runQuiz\(\[\], 'final_test_balanced',[^\n]*'final', null, allQs\);/);
  });
});

describe('unit native (K blueprint) path preserved', () => {
  test('startUnitQuiz evaluates the pooled decision before the native branch', () => {
    const idx = QUIZ_SRC.indexOf('function startUnitQuiz');
    const decisionAt = QUIZ_SRC.indexOf('resolveUnitDecision(_quizLengthCfg().unit', idx);
    const blueprintAt = QUIZ_SRC.indexOf('_buildKUnitQuiz(u)', idx);
    expect(decisionAt).toBeGreaterThan(idx);
    expect(blueprintAt).toBeGreaterThan(decisionAt); // native branch still after the gate
  });
  test('pooled selection only bypasses native when mode === "pooled"', () => {
    expect(QUIZ_SRC).toMatch(/_decision\.mode === ['"]pooled['"] && _pooled\.length > 0/);
  });
  test('the K blueprint sampler (_buildKUnitQuiz) is still invoked', () => {
    expect(QUIZ_SRC).toMatch(/u\.quizBlueprint && typeof _buildKUnitQuiz === ['"]function['"]/);
  });
});

describe('lesson + pooled-unit attempts thread a resolved count', () => {
  test('startLessonQuiz resolves and passes a lesson count', () => {
    expect(QUIZ_SRC).toMatch(/_resolveLessonQuizCount\(bank\)/);
    expect(QUIZ_SRC).toMatch(/_runQuiz\(bank, 'lq_'\+l\.id,[^\n]*'lesson', unitIdx, prebuilt, null, _lessonN\)/);
  });
  test('pooled unit attempt passes _decision.count', () => {
    expect(QUIZ_SRC).toMatch(/_runQuiz\(_pooled,[^\n]*'unit', unitIdx, null, null, _decision\.count\)/);
  });
});
