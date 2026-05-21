'use strict';

// =============================================================================
//  Unit-Quiz Banner — attempt-size helper
//
//  Bug: G2 + K unit pages showed the FULL test-bank pool size (e.g. 133
//  Questions) instead of the actual quiz attempt size (25). The actual
//  sampler (quiz.js → _runQuiz / _buildKUnitQuiz / _sampleUnitTestAttempt)
//  always produces a fixed-size attempt; the banner just had no helper that
//  mirrored that logic.
//
//  These tests pin the behavior of _unitQuizSize(u), the single source of
//  truth the banner now consults.
// =============================================================================

const { _unitQuizSize } = require('../src/quiz-helpers.js');

describe('_unitQuizSize', () => {
  test('Grade 2 unit (no unitTest, no quizBlueprint) — returns 25', () => {
    // Mirrors a G2 unit after _loadUnit: testBank loaded as a flat array,
    // no unitTest object on the unit metadata.
    const g2u1 = {
      id: 'u1',
      name: 'Basic Fact Strategies',
      testBank: new Array(133).fill({ t: 'q', o: ['a','b','c','d'], a: 0, e: '' }),
    };
    expect(_unitQuizSize(g2u1)).toBe(25);
  });

  test('Grade 2 banner never shows the full testBank length', () => {
    const g2 = { testBank: new Array(133).fill({}) };
    expect(_unitQuizSize(g2)).not.toBe(133);
    expect(_unitQuizSize(g2)).toBe(25);
  });

  test('Grade 1 unit (unitTest.totalQuestions = 25) — returns 25', () => {
    const g1 = {
      id: 'g1-u1',
      unitTest: { totalQuestions: 25, sourceRule: 'all_lesson_quizbanks' },
      testBank: new Array(530).fill({}),
    };
    expect(_unitQuizSize(g1)).toBe(25);
  });

  test('Grade 1 unit with custom totalQuestions — honors the config', () => {
    const g1 = { unitTest: { totalQuestions: 30 }, testBank: new Array(530).fill({}) };
    expect(_unitQuizSize(g1)).toBe(30);
  });

  test('Kindergarten unit (quizBlueprint sums to 25) — returns 25', () => {
    // K u1 blueprint: ku1l1:5 + ku1l2:4 + ku1l3:4 + ku1l4:3 + ku1l5:3 + ku1l6:3 + ku1l7:3 = 25
    const ku1 = {
      id: 'ku1',
      quizBlueprint: { ku1l1: 5, ku1l2: 4, ku1l3: 4, ku1l4: 3, ku1l5: 3, ku1l6: 3, ku1l7: 3 },
      testBank: new Array(180).fill({}),
    };
    expect(_unitQuizSize(ku1)).toBe(25);
  });

  test('Kindergarten unit (quizBlueprint sums to 24) — returns 24', () => {
    // K u2 blueprint: 5+3+5+5+3+3 = 24
    const ku2 = {
      id: 'ku2',
      quizBlueprint: { ku2l1: 5, ku2l2: 3, ku2l3: 5, ku2l4: 5, ku2l5: 3, ku2l6: 3 },
      testBank: new Array(120).fill({}),
    };
    expect(_unitQuizSize(ku2)).toBe(24);
  });

  test('Kindergarten unit (4-lesson 7+7+5+5 blueprint) — returns 24', () => {
    const ku4 = {
      id: 'ku4',
      quizBlueprint: { ku4l1: 7, ku4l2: 7, ku4l3: 5, ku4l4: 5 },
      testBank: new Array(100).fill({}),
    };
    expect(_unitQuizSize(ku4)).toBe(24);
  });

  test('quizBlueprint takes precedence over unitTest.totalQuestions', () => {
    // Defensive — should never coexist in practice, but if it did the
    // blueprint reflects the K sampler's actual output.
    const u = {
      quizBlueprint: { l1: 10, l2: 10 },
      unitTest: { totalQuestions: 25 },
    };
    expect(_unitQuizSize(u)).toBe(20);
  });

  test('null / undefined / empty unit — falls back to default 25', () => {
    expect(_unitQuizSize(null)).toBe(25);
    expect(_unitQuizSize(undefined)).toBe(25);
    expect(_unitQuizSize({})).toBe(25);
  });

  test('empty quizBlueprint — does not lock in 0, falls through', () => {
    // Empty blueprint object should not short-circuit to 0; the helper
    // should keep looking for unitTest.totalQuestions, then default.
    expect(_unitQuizSize({ quizBlueprint: {} })).toBe(25);
    expect(_unitQuizSize({ quizBlueprint: {}, unitTest: { totalQuestions: 30 } })).toBe(30);
  });

  test('unitTest present but no totalQuestions — falls back to 25', () => {
    expect(_unitQuizSize({ unitTest: { sourceRule: 'all_lesson_quizbanks' } })).toBe(25);
  });

  test('does not consider testBank.length even when present', () => {
    // Regression guard against the original bug.
    const u = { testBank: new Array(500).fill({}) };
    expect(_unitQuizSize(u)).toBe(25);
    expect(_unitQuizSize(u)).not.toBe(500);
  });

  test('does not consider quizBank.length either (legacy field name)', () => {
    const u = { quizBank: new Array(75).fill({}) };
    expect(_unitQuizSize(u)).toBe(25);
  });
});
