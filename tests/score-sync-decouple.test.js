'use strict';

// =============================================================================
//  Score-sync decoupling — regression tests for the dashboard "out of sync" bug.
//
//  Root cause: push_student_progress is atomic — a monotonic profile guard
//  (apptime/mastery/done/act_dates "decreased") OR a per-score pct-mismatch
//  (hint penalty makes pct != round(score/total*100)) rejects the WHOLE payload
//  with `validation_failed`, so quiz scores never reach quiz_scores (the table
//  the parent dashboard reads). The client also swallowed `validation_failed`.
//
//  Fix: classify every push result (never swallow), and push scores through a
//  separate, lenient path (push_quiz_scores RPC for PIN students; the existing
//  quiz_scores upsert for parent "Go to App"), so a completed quiz score is
//  saved even when the profile push is rejected.
//
//  These mirror the src/auth.js helpers as pure functions (the sync-helpers.js
//  pattern) so the routing/classification logic is provable without a browser.
// =============================================================================

const {
  _classifyPushResult,
  _normalizeScoreForCloud,
  _planScoreSync,
  _mergeRemoteScoresIntoLocal,
} = require('./sync-helpers.js');

describe('_classifyPushResult — never silently swallow', () => {
  test('ok when the RPC reports success', () => {
    expect(_classifyPushResult({ data: { success: true } })).toBe('ok');
    expect(_classifyPushResult({ data: { inserted: 2, success: true } })).toBe('ok');
  });
  test('validation_failed (monotonic guard) is surfaced — the previously swallowed case', () => {
    expect(_classifyPushResult({ data: { error: 'validation_failed', details: 'apptime totalSecs decreased' } }))
      .toBe('validation_failed');
  });
  test('validation_failed (hint-penalty pct mismatch) is surfaced', () => {
    expect(_classifyPushResult({ data: { error: 'validation_failed', details: 'pct does not match score/total' } }))
      .toBe('validation_failed');
  });
  test('stale_reset_epoch is classified distinctly', () => {
    expect(_classifyPushResult({ data: { error: 'stale_reset_epoch', server_reset_epoch: 123 } }))
      .toBe('stale_reset_epoch');
  });
  test('a transport/PostgREST error is classified', () => {
    expect(_classifyPushResult({ error: { message: 'network down' } })).toBe('transport_error');
    expect(_classifyPushResult(null)).toBe('transport_error');
  });
  test('an unknown server-side error is classified as rejected (still not swallowed)', () => {
    expect(_classifyPushResult({ data: { error: 'something_else' } })).toBe('rejected');
  });
});

describe('_normalizeScoreForCloud — preserves a hint-penalized pct', () => {
  test('a hint-penalized lesson score keeps its stored pct (not recomputed)', () => {
    // 3/8 = 37.5 -> round 38; one hint -> pct 35. The lenient RPC must accept this.
    const s = { id: 111, qid: 'lq_u3l1', type: 'lesson', score: 3, total: 8, pct: 35, grade: 'g2', unitIdx: 2 };
    const row = _normalizeScoreForCloud(s);
    expect(row.pct).toBe(35);            // NOT 38
    expect(row.local_id).toBe(111);
    expect(row.qid).toBe('lq_u3l1');
    expect(row.grade).toBe('g2');
    expect(row.unit_idx).toBe(2);
  });
  test('final test (unitIdx null) maps unit_idx to 0', () => {
    const row = _normalizeScoreForCloud({ id: 1, qid: 'final_test', type: 'final', score: 40, total: 50, pct: 80, unitIdx: null });
    expect(row.unit_idx).toBe(0);
  });
  test('missing grade maps to null (dashboard falls back to qid inference)', () => {
    expect(_normalizeScoreForCloud({ id: 2, qid: 'lq_u1l1', score: 8, total: 8, pct: 100 }).grade).toBe(null);
  });
});

describe('_planScoreSync — scores decoupled from the guarded profile push', () => {
  test('PIN student session routes scores to the lenient push_quiz_scores RPC', () => {
    const plan = _planScoreSync({ isStudentSession: true, hasScores: true });
    expect(plan.scorePush).toBe('push_quiz_scores');
    expect(plan.profilePush).toBe(true);
  });
  test('parent "Go to App" session routes scores to the parent quiz_scores upsert', () => {
    const plan = _planScoreSync({ isStudentSession: false, hasParentSession: true, hasScores: true });
    expect(plan.scorePush).toBe('quiz_scores_upsert');
  });
  test('no scores → no score push', () => {
    expect(_planScoreSync({ isStudentSession: true, hasScores: false }).scorePush).toBe(null);
  });
  test('stale local progress (rejected profile push) does NOT remove the score push', () => {
    const plan = _planScoreSync({ isStudentSession: true, hasScores: true });
    // Even when the profile push is rejected by a monotonic guard...
    const profileCategory = _classifyPushResult({ data: { error: 'validation_failed', details: 'apptime totalSecs decreased' } });
    expect(profileCategory).toBe('validation_failed');
    // ...the score push is still scheduled (independent path).
    expect(plan.scorePush).toBe('push_quiz_scores');
  });
});

describe('completion reaches the dashboard-read source (quiz_scores → SCORES)', () => {
  test('lesson completion round-trips into the dashboard SCORES shape', () => {
    const cloudRow = _normalizeScoreForCloud({ id: 201, qid: 'lq_u1l1', type: 'lesson', score: 8, total: 8, pct: 100, grade: 'g2', unitIdx: 0 });
    const merged = _mergeRemoteScoresIntoLocal([], [cloudRow]);
    const got = merged.find((s) => s.qid === 'lq_u1l1');
    expect(got).toBeTruthy();
    expect(got.pct).toBe(100);           // pct>=80 → dashboard marks the lesson complete
    expect(got.id).toBe(201);
  });
  test('unit completion round-trips into the dashboard SCORES shape', () => {
    const cloudRow = _normalizeScoreForCloud({ id: 202, qid: 'u2_uq', type: 'unit', score: 23, total: 25, pct: 92, grade: 'g2', unitIdx: 1 });
    const merged = _mergeRemoteScoresIntoLocal([], [cloudRow]);
    const got = merged.find((s) => s.qid === 'u2_uq');
    expect(got).toBeTruthy();
    expect(got.pct).toBe(92);
    expect(got.type).toBe('unit');
  });
  test('a hint-penalized passing score still reaches the dashboard via the lenient path', () => {
    const cloudRow = _normalizeScoreForCloud({ id: 203, qid: 'lq_u4l2', type: 'lesson', score: 8, total: 8, pct: 96, grade: 'g2', unitIdx: 3 });
    const merged = _mergeRemoteScoresIntoLocal([], [cloudRow]);
    expect(merged.find((s) => s.qid === 'lq_u4l2').pct).toBe(96);
  });
});
