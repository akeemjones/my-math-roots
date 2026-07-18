'use strict';

// =============================================================================
//  QUIZ TIME — timeTaken is wall-clock, valid whether or not the timer runs
//
//  Fixes defect B: elapsed used to be totalSecs - _quizSecsLeft, so a quiz with
//  the timer DISABLED (where _startTimer never sets _quizSecsLeft) recorded a
//  fabricated full-duration time. Elapsed is now measured from _quizStartedAt.
//
//  _quizElapsedSecs is pure; extract and run the real one from source (quiz.js
//  is not a module — same new Function extraction the engine tests use).
// =============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const QUIZ_SRC = fs.readFileSync(path.join(ROOT, 'src', 'quiz.js'), 'utf8');

function extractFn(src, name) {
  const start = src.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('not found: ' + name);
  // Walk braces to the matching close.
  let i = src.indexOf('{', start), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}

const elapsed = new Function(extractFn(QUIZ_SRC, '_quizElapsedSecs') + '\nreturn _quizElapsedSecs;')();

describe('_quizElapsedSecs', () => {
  const START = 1_000_000_000_000;

  test('measures whole seconds from start to now', () => {
    expect(elapsed(START, START + 90_000)).toBe(90);       // 1:30
    expect(elapsed(START, START + 8_000)).toBe(8);
    expect(elapsed(START, START + 500)).toBe(1);           // rounds
  });

  test('is zero at the instant of start', () => {
    expect(elapsed(START, START)).toBe(0);
  });

  // The bug: an untimed quiz used to record the full configured duration.
  test('is valid when the timer is disabled (no dependence on _quizSecsLeft)', () => {
    // The function takes only start + now, so a disabled timer cannot influence
    // it. A real 45-second untimed attempt records 45, not the timer default.
    expect(elapsed(START, START + 45_000)).toBe(45);
  });

  test('never negative, even if the clock appears to go backwards', () => {
    expect(elapsed(START, START - 5_000)).toBe(0);
  });

  test('is always finite and a non-negative integer', () => {
    for (const now of [START, START + 1, START + 999, START + 123_456]) {
      const v = elapsed(START, now);
      expect(Number.isFinite(v)).toBe(true);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  test('returns 0 for a missing or invalid start time', () => {
    expect(elapsed(0, START)).toBe(0);
    expect(elapsed(null, START)).toBe(0);
    expect(elapsed(undefined, START)).toBe(0);
    expect(elapsed(NaN, START)).toBe(0);
    expect(elapsed(-1, START)).toBe(0);
  });

  test('is independent of the question count', () => {
    // Same wall time -> same elapsed, whether the quiz served 4 or 40 questions.
    expect(elapsed(START, START + 60_000)).toBe(60);
  });

  test('defaults "now" to the current clock when omitted', () => {
    const before = Date.now();
    const v = elapsed(before - 2_000);
    expect(v).toBeGreaterThanOrEqual(2);
    expect(v).toBeLessThan(10); // sanity — should be ~2
  });
});

describe('timeTaken formatting contract (source)', () => {
  test('formats mm:ss from the wall-clock elapsed', () => {
    expect(QUIZ_SRC).toMatch(/const elapsedSecs = _quizElapsedSecs\(_quizStartedAt, Date\.now\(\)\);/);
    expect(QUIZ_SRC).toMatch(/const timeTaken = elapsedMin \+ ':' \+ String\(elapsedSec\)\.padStart\(2,'0'\);/);
  });
});
