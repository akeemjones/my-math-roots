'use strict';

// =============================================================================
//  CHARACTERIZATION — custom quiz lengths, score records, and quiz timing
//
//  Pins the CURRENT behavior of the retained custom-quiz-length feature before
//  it is made reliable, so the follow-up work cannot silently:
//    - change the score-record shape (historical and new scores must stay readable)
//    - change what the length resolver treats as default / a count / "all"
//    - change the total stored (must be the ACTUAL number of questions presented)
//
//  It also documents two defects being fixed next, as source contracts, so the
//  fix commits show them changing:
//    A. non-default lengths bypass the difficulty-stratified sampler (quiz.js)
//    B. elapsed time is derived from the timer's remaining seconds, so an
//       untimed quiz records a fabricated duration (quiz.js)
// =============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const {
  LESSON_QUIZ_DEFAULT,
  UNIT_QUIZ_DEFAULT,
  resolveLessonCount,
  resolveUnitDecision,
  loadQuizLengths,
  saveQuizLengths,
  quizLengthsKey,
} = require('../src/quiz-config.js');

// ── The length resolver is the single authoritative reader ──────────────────
describe('quiz-length resolver contract (must not drift)', () => {
  test('defaults are 8 (lesson) and 25 (unit)', () => {
    expect(LESSON_QUIZ_DEFAULT).toBe(8);
    expect(UNIT_QUIZ_DEFAULT).toBe(25);
  });

  describe('resolveLessonCount', () => {
    const BANK = 100;
    test('"default" / missing / invalid -> min(8, bank)', () => {
      expect(resolveLessonCount('default', BANK)).toBe(8);
      expect(resolveLessonCount(undefined, BANK)).toBe(8);
      expect(resolveLessonCount('nonsense', BANK)).toBe(8);
      expect(resolveLessonCount('default', 5)).toBe(5); // clamped to a small bank
    });
    test('a positive integer clamps to 1..bank', () => {
      expect(resolveLessonCount(12, BANK)).toBe(12);
      expect(resolveLessonCount('4', BANK)).toBe(4);
      expect(resolveLessonCount(999, BANK)).toBe(BANK); // never exceeds the bank
    });
    test('"all" is the whole bank', () => {
      expect(resolveLessonCount('all', BANK)).toBe(BANK);
      expect(resolveLessonCount('all', 3)).toBe(3);
    });
    test('an empty bank yields 0 (caller shows the empty state)', () => {
      expect(resolveLessonCount('default', 0)).toBe(0);
      expect(resolveLessonCount('all', 0)).toBe(0);
    });
    test('rejects zero, negative, decimal', () => {
      expect(resolveLessonCount(0, BANK)).toBe(8);      // -> default
      expect(resolveLessonCount(-5, BANK)).toBe(8);
      expect(resolveLessonCount(10.5, BANK)).toBe(8);
      expect(resolveLessonCount('10.5', BANK)).toBe(8);
    });
  });

  describe('resolveUnitDecision', () => {
    test('"default" keeps the native path', () => {
      expect(resolveUnitDecision('default', 25, 200)).toEqual({ mode: 'native', count: 25 });
    });
    test('a number equal to native stays native (does not bypass blueprint)', () => {
      expect(resolveUnitDecision(25, 25, 200)).toEqual({ mode: 'native', count: 25 });
    });
    test('a different number pools and clamps to the pool', () => {
      expect(resolveUnitDecision(40, 25, 200)).toEqual({ mode: 'pooled', count: 40 });
      expect(resolveUnitDecision(999, 25, 200)).toEqual({ mode: 'pooled', count: 200 });
    });
    test('"all" pools the whole eligible bank', () => {
      expect(resolveUnitDecision('all', 25, 200)).toEqual({ mode: 'pooled', count: 200 });
    });
  });

  test('settings are per-student, keyed by student id, local for guests', () => {
    expect(quizLengthsKey('abc-123')).toBe('mmr_quiz_lengths_abc-123');
    expect(quizLengthsKey('local')).toBe('mmr_quiz_lengths_local');
    expect(quizLengthsKey(null)).toBe('mmr_quiz_lengths_local');
    expect(quizLengthsKey('')).toBe('mmr_quiz_lengths_local');
  });

  test('load/save round-trips the {lesson, unit} shape and normalizes', () => {
    const store = (() => {
      const m = new Map();
      return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
    })();
    saveQuizLengths('s1', { lesson: 12, unit: 'all' }, store);
    expect(loadQuizLengths('s1', store)).toEqual({ lesson: 12, unit: 'all' });
    saveQuizLengths('s1', { lesson: 'garbage', unit: -3 }, store);
    expect(loadQuizLengths('s1', store)).toEqual({ lesson: 'default', unit: 'default' });
  });
});

// ── The score record shape must not drift ───────────────────────────────────
describe('score-record shape (source contract on _finishQuiz)', () => {
  const quiz = read('src/quiz.js');
  const fn = quiz.slice(quiz.indexOf('function _finishQuiz('));
  const autoEntry = fn.slice(fn.indexOf('const autoEntry = {'), fn.indexOf('SCORES.unshift(autoEntry)'));

  test('every documented top-level field is present', () => {
    // Fields are a mix of `name: value` and ES6 shorthand (`total, pct`).
    for (const field of [
      'qid', 'label', 'type', 'score', 'total', 'pct', 'rawPct', 'penPct',
      'hintsUsed', 'stars', 'unitIdx', 'color', 'name', 'id', 'timeTaken',
      'mode', 'grade', 'answers', 'date', 'time',
    ]) {
      const present = new RegExp('\\b' + field + '\\s*[:,]').test(autoEntry);
      expect({ field, present }).toEqual({ field, present: true });
    }
  });

  test('total is the ACTUAL number of questions presented, not the requested count', () => {
    // total = qz.questions.length — the sampled/served set, so "all" and any
    // clamped custom length record what the student actually saw.
    expect(fn).toMatch(/const total = qz\.questions\.length;/);
    expect(autoEntry).toMatch(/score:\s*qz\.score, total, pct/);
  });

  test('pct applies the hint penalty over the raw percentage', () => {
    expect(fn).toMatch(/const rawPct = Math\.floor\(qz\.score\/total\*100\);/);
    expect(fn).toMatch(/const pct = Math\.max\(0, rawPct - hintsUsed \* 2\);/);
  });

  test('the per-answer sub-shape is stable', () => {
    for (const k of ['t', 'chosen', 'correct', 'ok', 'exp', 'opts', 'timeSecs', 'hintUsed', 'errTag', 'difficulty']) {
      expect(autoEntry).toContain(k + ':');
    }
  });
});

// ── Defects documented here, fixed next ─────────────────────────────────────
describe('DEFECT A — non-default lengths currently bypass difficulty balancing', () => {
  const quiz = read('src/quiz.js');

  test('_runQuiz gates the stratified sampler on count === native', () => {
    // The current code only balances when the requested count equals the native
    // total; any other length falls back to the flat _masteryWeightedSample.
    // The difficulty-balance fix removes this gate.
    expect(quiz).toMatch(/_useBalanced\s*=\s*!_hasCount \|\| n === _nativeN/);
    expect(quiz).toMatch(/_useBalanced\s*\?\s*_weightedSample\([\s\S]*?:\s*_masteryWeightedSample/);
  });

  test('_weightedSample uses fixed per-type targets that do not scale to n', () => {
    // _DIFF_TARGETS are absolute counts summing to the native size; a custom n
    // cannot be honored proportionally. The fix scales a ratio to n.
    expect(quiz).toMatch(/const _DIFF_TARGETS = \{/);
    expect(quiz).toMatch(/lesson:\s*\{ e:3, m:3, h:2 \}/);
  });
});

describe('DEFECT B — elapsed time is derived from the timer, not the clock', () => {
  const quiz = read('src/quiz.js');

  test('_finishQuiz currently computes elapsed from totalSecs - _quizSecsLeft', () => {
    // When the timer is disabled, _startTimer returns early without setting
    // _quizSecsLeft, so this yields a fabricated full-duration timeTaken. The
    // fix measures elapsed from _quizStartedAt (wall clock).
    expect(quiz).toMatch(/const elapsedSecs = Math\.max\(0, totalSecs - Math\.max\(0, _quizSecsLeft\)\);/);
  });

  test('_quizStartedAt is set at quiz start (the correct basis for the fix)', () => {
    expect(quiz).toMatch(/_quizStartedAt = Date\.now\(\);/);
  });
});
