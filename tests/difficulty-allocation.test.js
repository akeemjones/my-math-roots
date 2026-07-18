'use strict';

// =============================================================================
//  DIFFICULTY ALLOCATION — proportional, deterministic, capacity-aware
//
//  allocateDifficulty(requested, available, ratio) is the single allocator that
//  makes every quiz length keep an intentional easy/medium/hard mix. Pure, so
//  it is tested directly. The random question SELECTION within a tier lives in
//  quiz.js; this pins only the allocation, which is the part that was broken.
// =============================================================================

const {
  allocateDifficulty,
  LESSON_DIFFICULTY_RATIO,
  UNIT_DIFFICULTY_RATIO,
} = require('../src/quiz-config.js');

// Ample tiers (never the limiting factor) unless a test says otherwise.
const AMPLE = { e: 100, m: 100, h: 100 };
const sum = (d) => d.e + d.m + d.h;
const lesson = (n, avail) => allocateDifficulty(n, avail || AMPLE, LESSON_DIFFICULTY_RATIO);

describe('proportional lesson distribution (the spec examples)', () => {
  // Guidance from the spec — the algorithm must produce these when questions
  // are ample. They are derived, not hardcoded, so this doubles as a check that
  // the ratio + largest-remainder tie-break (e > m > h) is right.
  test.each([
    [4,  { e: 2, m: 1, h: 1 }],
    [5,  { e: 2, m: 2, h: 1 }],
    [6,  { e: 2, m: 2, h: 2 }],
    [8,  { e: 3, m: 3, h: 2 }],   // the native default — unchanged
    [10, { e: 4, m: 4, h: 2 }],
    [12, { e: 5, m: 4, h: 3 }],
  ])('%i questions -> the documented mix', (n, expected) => {
    expect(lesson(n)).toEqual(expected);
  });

  test('the native default (8) reproduces exactly today\'s 3/3/2', () => {
    expect(lesson(8)).toEqual({ e: 3, m: 3, h: 2 });
  });

  test('every size sums to exactly the requested count when questions are ample', () => {
    for (let n = 1; n <= 60; n++) expect(sum(lesson(n))).toBe(n);
  });

  test('larger custom lengths stay proportional', () => {
    expect(lesson(16)).toEqual({ e: 6, m: 6, h: 4 });
    expect(lesson(24)).toEqual({ e: 9, m: 9, h: 6 });
    expect(sum(lesson(40))).toBe(40);
  });

  test('a request of one still picks a single question', () => {
    expect(sum(lesson(1))).toBe(1);
  });
});

describe('unit mastery checks keep their own blueprint mix (not the lesson mix)', () => {
  const unit = (n, avail) => allocateDifficulty(n, avail || AMPLE, UNIT_DIFFICULTY_RATIO);

  test('the native 25 reproduces 8/10/7', () => {
    expect(unit(25)).toEqual({ e: 8, m: 10, h: 7 });
  });

  test('a unit ratio differs from a lesson ratio at the same size', () => {
    // 8/10/7 leans medium; 3/3/2 does not.
    expect(unit(10)).not.toEqual(lesson(10));
    expect(sum(unit(10))).toBe(10);
  });

  test('custom unit lengths scale the unit mix and hit the total', () => {
    for (const n of [12, 20, 30, 50]) expect(sum(unit(n))).toBe(n);
  });
});

describe('capacity limits — never over-draw a tier', () => {
  test('respects a small bucket and redistributes the shortfall', () => {
    // Only 1 hard available; the 2 hard slots for an 8-question lesson must go
    // to the other tiers, and the total must still be 8.
    const d = lesson(8, { e: 100, m: 100, h: 1 });
    expect(d.h).toBe(1);
    expect(sum(d)).toBe(8);
  });

  test('an empty tier sends all its slots elsewhere', () => {
    const d = lesson(8, { e: 100, m: 100, h: 0 });
    expect(d.h).toBe(0);
    expect(sum(d)).toBe(8);
    expect(d.e + d.m).toBe(8);
  });

  test('when the whole bank is smaller than requested, returns the whole bank', () => {
    const d = lesson(20, { e: 3, m: 2, h: 1 });   // only 6 questions exist
    expect(d).toEqual({ e: 3, m: 2, h: 1 });
    expect(sum(d)).toBe(6);
  });

  test('never asks a tier for more than it holds, across many sizes', () => {
    const avail = { e: 5, m: 4, h: 2 };
    for (let n = 1; n <= 15; n++) {
      const d = lesson(n, avail);
      expect(d.e).toBeLessThanOrEqual(avail.e);
      expect(d.m).toBeLessThanOrEqual(avail.m);
      expect(d.h).toBeLessThanOrEqual(avail.h);
      expect(sum(d)).toBe(Math.min(n, 11));
    }
  });

  test('a single-tier bank fills entirely from that tier', () => {
    expect(lesson(5, { e: 0, m: 10, h: 0 })).toEqual({ e: 0, m: 5, h: 0 });
  });
});

describe('degenerate and malformed inputs never throw', () => {
  test('zero / negative requested -> nothing', () => {
    expect(lesson(0)).toEqual({ e: 0, m: 0, h: 0 });
    expect(lesson(-5)).toEqual({ e: 0, m: 0, h: 0 });
    expect(lesson(NaN)).toEqual({ e: 0, m: 0, h: 0 });
    expect(lesson(Infinity)).toEqual({ e: 0, m: 0, h: 0 });
  });

  test('a decimal request is floored, not rejected outright', () => {
    // _qcSize floors positive finite numbers, so 2.7 -> 2 questions.
    expect(sum(allocateDifficulty(2.7, AMPLE, LESSON_DIFFICULTY_RATIO))).toBe(2);
  });

  test('missing / empty available -> nothing to allocate', () => {
    expect(allocateDifficulty(8, undefined, LESSON_DIFFICULTY_RATIO)).toEqual({ e: 0, m: 0, h: 0 });
    expect(allocateDifficulty(8, {}, LESSON_DIFFICULTY_RATIO)).toEqual({ e: 0, m: 0, h: 0 });
    expect(allocateDifficulty(8, { e: 0, m: 0, h: 0 }, LESSON_DIFFICULTY_RATIO)).toEqual({ e: 0, m: 0, h: 0 });
  });

  test('a zero or missing ratio falls back to an even split without throwing', () => {
    expect(() => allocateDifficulty(9, AMPLE, { e: 0, m: 0, h: 0 })).not.toThrow();
    const even = allocateDifficulty(9, AMPLE, { e: 0, m: 0, h: 0 });
    expect(sum(even)).toBe(9);
    expect(() => allocateDifficulty(6, AMPLE, undefined)).not.toThrow();
  });
});

describe('determinism', () => {
  test('identical inputs give identical output every time', () => {
    for (let n = 1; n <= 25; n++) {
      const a = allocateDifficulty(n, { e: 9, m: 7, h: 5 }, UNIT_DIFFICULTY_RATIO);
      const b = allocateDifficulty(n, { e: 9, m: 7, h: 5 }, UNIT_DIFFICULTY_RATIO);
      expect(a).toEqual(b);
    }
  });
});
