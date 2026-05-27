// =============================================================================
//  Practice (Weak Topic) Progression — Test Suite
//
//  Verifies that weak-topic practice attempts are REMEDIATION ONLY and never:
//    • mark the original lesson as passed
//    • satisfy the unit-quiz unlock check
//    • overwrite the original failed quiz score
//    • count toward "all content complete" for the streak
//
//  Bug context: _practiceWeak() previously called _runQuiz with the original
//  qz.id, so a 100% practice attempt was recorded with qid='lq_u1l1' and
//  every downstream check that filtered SCORES by qid='lq_'+lesson.id treated
//  the practice as an official pass. The fix uses qid='practice_lq_u1l1' +
//  qz.mode='practice' so practice attempts are filterable.
// =============================================================================

'use strict';

// Mirrors the production filter at quiz.js:_allContentComplete and
// unit.js:lqBestScore. The pass criterion is: ≥80% on an entry whose qid
// matches the official lesson-quiz id exactly.
function lessonHasOfficialPass(SCORES, lessonId) {
  return SCORES.some(function(s) {
    return s.qid === 'lq_' + lessonId && s.pct >= 80;
  });
}

// Mirrors the production filter for "best lesson score" used by the unit
// progress UI. Practice attempts must not show up here either.
function bestLessonScore(SCORES, lessonId) {
  return SCORES
    .filter(function(s) { return s.qid === 'lq_' + lessonId; })
    .sort(function(a, b) { return b.pct - a.pct; })[0] || null;
}

describe('Weak-Topic Practice progression', () => {
  test('practice attempt with 100% does NOT mark the lesson passed', () => {
    const lessonId = 'u1l1';
    const SCORES = [
      { qid: 'lq_' + lessonId, type: 'lesson', pct: 50, score: 4, total: 8 },
    ];
    SCORES.unshift({
      qid: 'practice_lq_' + lessonId,
      type: 'lesson',
      pct: 100,
      score: 5,
      total: 5,
      mode: 'practice',
    });
    expect(lessonHasOfficialPass(SCORES, lessonId)).toBe(false);
  });

  test('best-lesson-score lookup ignores practice attempts', () => {
    const lessonId = 'u1l1';
    const SCORES = [
      { qid: 'practice_lq_' + lessonId, type: 'lesson', pct: 100, mode: 'practice' },
      { qid: 'lq_' + lessonId,          type: 'lesson', pct: 50 },
    ];
    const best = bestLessonScore(SCORES, lessonId);
    expect(best).not.toBeNull();
    expect(best.pct).toBe(50);
  });

  test('practice qid does not satisfy "all content complete" check', () => {
    const lessonId = 'u1l1';
    const SCORES = [
      { qid: 'practice_lq_' + lessonId, type: 'lesson', pct: 100, mode: 'practice' },
    ];
    const lessonPassed = SCORES.some(function(s) {
      return s.qid === 'lq_' + lessonId && s.pct >= 80;
    });
    expect(lessonPassed).toBe(false);
  });

  test('official lesson pass at ≥80% still unlocks normally', () => {
    const lessonId = 'u1l1';
    const SCORES = [
      { qid: 'lq_' + lessonId, type: 'lesson', pct: 88 },
    ];
    expect(lessonHasOfficialPass(SCORES, lessonId)).toBe(true);
  });

  test('practice attempt has a distinct paused-quiz key from the official quiz', () => {
    // Paused-quiz state is keyed by qz.id. Original qz.id='lq_u1l1' must NOT
    // be the same key as practice qz.id, otherwise quitting practice could
    // overwrite the in-progress official quiz snapshot.
    const officialId = 'lq_u1l1';
    const practiceId = 'practice_' + officialId;
    expect(practiceId).not.toBe(officialId);
    const store = {};
    store[officialId] = { idx: 3, score: 1 };
    store[practiceId] = { idx: 0, score: 0 };
    expect(store[officialId].idx).toBe(3);
    expect(store[practiceId].idx).toBe(0);
  });
});

// =============================================================================
//  _formatAnswerForReview — defensive formatter for results review
//
//  Bug context: review screens rendered "Correct: [object Object]" when the
//  stored answer was an option object {val, tag} or a tapGroup payload. The
//  helper now unwraps these to readable strings.
// =============================================================================

// Reimplemented under test — util.js is browser-coupled so we mirror the logic.
function _formatAnswerForReview(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map(_formatAnswerForReview).filter(Boolean).join(', ');
  }
  if (typeof val === 'object') {
    if ('val' in val && val.val != null) return _formatAnswerForReview(val.val);
    if (Array.isArray(val.selectedIds)) return _formatAnswerForReview(val.selectedIds);
    if (typeof val.text === 'string') return val.text;
    return '';
  }
  return String(val);
}

describe('_formatAnswerForReview', () => {
  test('returns "" for null/undefined (avoids [object Object])', () => {
    expect(_formatAnswerForReview(null)).toBe('');
    expect(_formatAnswerForReview(undefined)).toBe('');
  });

  test('passes plain strings through', () => {
    expect(_formatAnswerForReview('48')).toBe('48');
  });

  test('unwraps option objects {val, tag} to val', () => {
    expect(_formatAnswerForReview({ val: '48', tag: 'err_off_by_one' })).toBe('48');
  });

  test('unwraps numeric val', () => {
    expect(_formatAnswerForReview({ val: 42 })).toBe('42');
  });

  test('joins arrays (tapGroup selectedIds) into a readable string', () => {
    expect(_formatAnswerForReview(['s1', 's4'])).toBe('s1, s4');
  });

  test('handles nested tapGroup payloads', () => {
    expect(_formatAnswerForReview({ selectedIds: ['s1', 's4'] })).toBe('s1, s4');
  });

  test('never renders [object Object]', () => {
    const cases = [
      { val: { tag: 'no_val' } }, // nested object with no val
      {},                          // empty object
      { foo: 'bar' },              // unknown shape
    ];
    cases.forEach(function(c) {
      const out = _formatAnswerForReview(c);
      expect(out).not.toMatch(/\[object Object\]/);
    });
  });

  test('falls back to .text when present (legacy option shape)', () => {
    expect(_formatAnswerForReview({ text: '12', i: 2 })).toBe('12');
  });
});
