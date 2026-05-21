'use strict';

// =============================================================================
//  Analytics Phase A — _anaResolveAttribution pure-function tests
//
//  Bug: 99.3% of production app_events rows had student_id = NULL because the
//  client tracker's auth-context resolver gated on `mmr_user_role === 'student'`
//  AND `mmr_session_token` together. Parent-launched student sessions
//  (enterStudentLearningSession with no PIN session_token) set role='student'
//  but leave session_token null — so the existing code fell through neither
//  branch and never claimed the student_id. The server's parent-ownership
//  verification path was wired up but never reached.
//
//  Fix: separate the two attribution paths. PIN-session path requires
//  (role==='student' + session_token + active_student_id). Parent JWT path
//  requires (supaJwt + active_student_id) regardless of role. Local-only
//  ('local' sentinel) is always anonymous.
//
//  This pure function takes the localStorage state as input and returns the
//  attribution claims the flush will send. Server-side trust is unchanged —
//  the Netlify ingest function still verifies every claimed student via
//  PIN session lookup OR parent_id ownership check before stamping the row.
// =============================================================================

const { _anaResolveAttribution } = require('../src/analytics.js');

const SID_A = '11111111-1111-1111-1111-111111111111';
const SID_B = '22222222-2222-2222-2222-222222222222';
const TOK_A = '33333333-3333-3333-3333-333333333333';
const JWT_A = 'fake-jwt-string';

describe('_anaResolveAttribution', () => {
  test('truly anonymous (no auth, no student) → no claims', () => {
    const r = _anaResolveAttribution({ supaJwt: null, role: null, sessionToken: null, activeStudentId: null });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('local-only mode with no auth → no claims', () => {
    // Cameron's local-mode testing sets activeStudentId='local'. Must never be
    // sent as a UUID claim — server would reject it anyway, but cleaner to skip.
    const r = _anaResolveAttribution({ supaJwt: null, role: 'student', sessionToken: null, activeStudentId: 'local' });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('PIN session path: role=student + sessionToken + studentId → both claims', () => {
    const r = _anaResolveAttribution({ supaJwt: null, role: 'student', sessionToken: TOK_A, activeStudentId: SID_A });
    expect(r).toEqual({ sessionToken: TOK_A, claimedSid: SID_A });
  });

  test('PIN session path with parent JWT also present → PIN takes precedence (still sends sessionToken)', () => {
    // If both auth contexts somehow exist, the PIN session is more specific —
    // it pins the request to one student. Server verifies the same.
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'student', sessionToken: TOK_A, activeStudentId: SID_A });
    expect(r).toEqual({ sessionToken: TOK_A, claimedSid: SID_A });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // THE BUG: parent-launched student session
  // ──────────────────────────────────────────────────────────────────────────
  test('parent-launched student session: role=student + NO sessionToken + parent JWT → claims student only', () => {
    // enterStudentLearningSession() with sessionToken=null (dashboard "Go to App"
    // path, in-session profile switcher parent-bypass). Pre-fix: claimedSid was
    // null because both branches required session_token OR role!=='student'.
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'student', sessionToken: null, activeStudentId: SID_A });
    expect(r).toEqual({ sessionToken: null, claimedSid: SID_A });
  });

  test('parent on dashboard with selected student → claims student (server verifies ownership)', () => {
    // Parent viewing one student's dashboard. mmr_active_student_id persists
    // from a prior session. Events fired here (parent_dashboard_opened,
    // report_generated) should attribute to the currently-viewed student.
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'parent', sessionToken: null, activeStudentId: SID_A });
    expect(r).toEqual({ sessionToken: null, claimedSid: SID_A });
  });

  test('parent on dashboard with no selected student → parent-only event', () => {
    // Brand-new parent, never picked a student yet. Parent-only events are
    // legitimately parent-only — student_id should stay null.
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'parent', sessionToken: null, activeStudentId: null });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('parent + local-mode student id → no claim (local is anonymous)', () => {
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'parent', sessionToken: null, activeStudentId: 'local' });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('stale active student in storage WITHOUT parent auth → no claim (server cannot verify)', () => {
    // A previously-signed-in user signed out (no supaJwt) but mmr_active_student_id
    // lingers in localStorage. We have no way to verify ownership — server would
    // reject anyway. Don't send the claim.
    const r = _anaResolveAttribution({ supaJwt: null, role: null, sessionToken: null, activeStudentId: SID_A });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('PIN session token present but active student is local → no claim', () => {
    // Edge: shouldn't happen in practice (PIN flow always sets a real UUID),
    // but if storage is inconsistent, prefer "no claim" over a bogus pair.
    const r = _anaResolveAttribution({ supaJwt: null, role: 'student', sessionToken: TOK_A, activeStudentId: 'local' });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('PIN session token without student id → no claim', () => {
    const r = _anaResolveAttribution({ supaJwt: null, role: 'student', sessionToken: TOK_A, activeStudentId: null });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('role=null but parent JWT present and active student set (post-reload pre-role-set window)', () => {
    // After page reload, supaJwt may be available from Supabase SDK before
    // mmr_user_role is restored. As long as parent JWT + active student exist,
    // we can still attribute (server will verify ownership).
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: null, sessionToken: null, activeStudentId: SID_A });
    expect(r).toEqual({ sessionToken: null, claimedSid: SID_A });
  });

  test('empty-string active student is treated as null', () => {
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'parent', sessionToken: null, activeStudentId: '' });
    expect(r).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('returns a plain object with exactly { sessionToken, claimedSid }', () => {
    const r = _anaResolveAttribution({ supaJwt: JWT_A, role: 'student', sessionToken: null, activeStudentId: SID_A });
    expect(Object.keys(r).sort()).toEqual(['claimedSid', 'sessionToken']);
  });

  test('null input does not throw', () => {
    // Defensive: storage-read errors should bubble null, not exception.
    expect(() => _anaResolveAttribution(null)).not.toThrow();
    expect(_anaResolveAttribution(null)).toEqual({ sessionToken: null, claimedSid: null });
  });

  test('different students per call do not bleed state', () => {
    const r1 = _anaResolveAttribution({ supaJwt: JWT_A, role: 'parent', sessionToken: null, activeStudentId: SID_A });
    const r2 = _anaResolveAttribution({ supaJwt: JWT_A, role: 'parent', sessionToken: null, activeStudentId: SID_B });
    expect(r1.claimedSid).toBe(SID_A);
    expect(r2.claimedSid).toBe(SID_B);
  });
});
