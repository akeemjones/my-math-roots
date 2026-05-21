'use strict';

// =============================================================================
//  Analytics Phase C.1 — per-event student-id override
//
//  Closes the dashboard student-mismatch edge case: a parent viewing student A
//  in the dashboard but with `localStorage.mmr_active_student_id` still set to
//  student B (from a prior student session) was getting dashboard actions
//  (`student_reset`, `free_mode_changed`, `manual_unlock_changed`,
//  `report_generated`) attributed to B, because the analytics tracker derived
//  attribution from localStorage at flush time.
//
//  Fix: `_trackEvent` now accepts a special metadata key `_override_student_id`.
//  When set to a valid UUID, the override is extracted into the event's
//  `claimed_student_id` field (per-event, not batch-level) and removed from
//  metadata. The Netlify ingest function then verifies parent ownership of
//  the claimed student before stamping `student_id` — unowned overrides
//  resolve to NULL, never to the batch-level student.
//
//  Server-side trust is unchanged: claimed_student_id is a CLAIM, not a
//  truth. The server still queries `student_profiles(id, parent_id)` to
//  verify the claim against the verified parent JWT before writing.
// =============================================================================

const { _anaExtractOverride } = require('../src/analytics.js');

const SID_A = '11111111-1111-1111-1111-111111111111';
const SID_B = '22222222-2222-2222-2222-222222222222';

describe('_anaExtractOverride', () => {
  test('valid UUID override → claimed_student_id set, key removed from metadata', () => {
    const r = _anaExtractOverride({ _override_student_id: SID_A, grade: '2' });
    expect(r.claimed_student_id).toBe(SID_A);
    expect(r.metadata).toEqual({ grade: '2' });
  });

  test('non-UUID override → claimed_student_id null, key still removed', () => {
    const r = _anaExtractOverride({ _override_student_id: 'not-a-uuid', grade: '2' });
    expect(r.claimed_student_id).toBeNull();
    expect(r.metadata).toEqual({ grade: '2' });
  });

  test('no override field → null + metadata unchanged', () => {
    const r = _anaExtractOverride({ grade: '2', unit_id: 'u1' });
    expect(r.claimed_student_id).toBeNull();
    expect(r.metadata).toEqual({ grade: '2', unit_id: 'u1' });
  });

  test('null input → safe defaults', () => {
    const r = _anaExtractOverride(null);
    expect(r).toEqual({ claimed_student_id: null, metadata: {} });
  });

  test('undefined input → safe defaults', () => {
    const r = _anaExtractOverride(undefined);
    expect(r).toEqual({ claimed_student_id: null, metadata: {} });
  });

  test('non-object input → safe defaults', () => {
    const r = _anaExtractOverride('string');
    expect(r).toEqual({ claimed_student_id: null, metadata: {} });
  });

  test('does not mutate the input object', () => {
    const input = { _override_student_id: SID_A, grade: '2' };
    _anaExtractOverride(input);
    expect(input).toEqual({ _override_student_id: SID_A, grade: '2' });
  });

  test('reserved sentinel "local" is rejected', () => {
    expect(_anaExtractOverride({ _override_student_id: 'local' }).claimed_student_id).toBeNull();
  });

  test('empty string is rejected', () => {
    expect(_anaExtractOverride({ _override_student_id: '' }).claimed_student_id).toBeNull();
  });

  test('numeric value is rejected', () => {
    expect(_anaExtractOverride({ _override_student_id: 12345 }).claimed_student_id).toBeNull();
  });

  test('uppercase UUID accepted', () => {
    const upper = SID_A.toUpperCase();
    expect(_anaExtractOverride({ _override_student_id: upper }).claimed_student_id).toBe(upper);
  });

  test('override is independent of other tracked-event fields', () => {
    const r = _anaExtractOverride({
      _override_student_id: SID_B,
      grade: '2',
      unit_id: 'u3',
      lesson_id: 'u3l2',
      reason: 'quit',
    });
    expect(r.claimed_student_id).toBe(SID_B);
    expect(r.metadata).toEqual({ grade: '2', unit_id: 'u3', lesson_id: 'u3l2', reason: 'quit' });
  });

  test('returns an object with exactly { claimed_student_id, metadata }', () => {
    const r = _anaExtractOverride({ _override_student_id: SID_A });
    expect(Object.keys(r).sort()).toEqual(['claimed_student_id', 'metadata']);
  });
});
