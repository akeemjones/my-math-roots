'use strict';

// =============================================================================
//  Analytics Phase B — whitelist expansion + per-session dedup helper
//
//  Adds 10 new event names to the client whitelist and a pure dedup helper
//  for view-style events so they don't spam on every re-render. Server-side
//  whitelist (netlify/functions/analytics-ingest.js) and the Supabase CHECK
//  constraint must mirror the same set — those are validated by the runtime
//  contract, not by these unit tests.
// =============================================================================

const { _ANA_VALID_EVENTS, _anaShouldFire } = require('../src/analytics.js');

// Phase A events that must still be allowed.
const PHASE_A_EVENTS = [
  'app_opened','session_started','session_ended','grade_selected',
  'unit_started','lesson_started','lesson_completed','quiz_started',
  'quiz_completed','unit_test_started','unit_test_completed',
  'intervention_shown','intervention_completed','report_generated',
  'parent_dashboard_opened','subscription_started',
];

// Phase B additions.
const PHASE_B_EVENTS = [
  'student_app_opened',
  'unit_viewed',
  'lesson_viewed',
  'score_history_opened',
  'hint_used',
  'student_reset',
  'free_mode_changed',
  'manual_unlock_changed',
  'quiz_abandoned',
  'parent_dash_section_viewed',  // whitelisted, no emission yet (no collapsible sections)
];

describe('_ANA_VALID_EVENTS — Phase B whitelist', () => {
  test('still includes every Phase A event name', () => {
    PHASE_A_EVENTS.forEach(name => {
      expect(_ANA_VALID_EVENTS.has(name)).toBe(true);
    });
  });

  test.each(PHASE_B_EVENTS)('includes Phase B event: %s', (name) => {
    expect(_ANA_VALID_EVENTS.has(name)).toBe(true);
  });

  test('rejects unknown event names', () => {
    expect(_ANA_VALID_EVENTS.has('hacked_event')).toBe(false);
    expect(_ANA_VALID_EVENTS.has('')).toBe(false);
    expect(_ANA_VALID_EVENTS.has('UNIT_VIEWED')).toBe(false);
  });

  test('whitelist set is the expected total size (Phase A + Phase B)', () => {
    expect(_ANA_VALID_EVENTS.size).toBe(PHASE_A_EVENTS.length + PHASE_B_EVENTS.length);
  });
});

describe('_anaShouldFire — per-session dedup for view events', () => {
  // Each test gets a fresh in-memory state via the optional reset argument.
  // The dedup state lives in module scope; clearing it between tests keeps
  // them order-independent.

  test('returns true on first call for a key, false on subsequent calls', () => {
    _anaShouldFire('__reset__');
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(true);
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(false);
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(false);
  });

  test('different keys are independent', () => {
    _anaShouldFire('__reset__');
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(true);
    expect(_anaShouldFire('unit_viewed_sid1_u2')).toBe(true);
    expect(_anaShouldFire('lesson_viewed_sid1_u1l1')).toBe(true);
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(false);
  });

  test('different students get independent dedup (key includes sid)', () => {
    _anaShouldFire('__reset__');
    expect(_anaShouldFire('unit_viewed_sidA_u1')).toBe(true);
    expect(_anaShouldFire('unit_viewed_sidB_u1')).toBe(true);
    expect(_anaShouldFire('unit_viewed_sidA_u1')).toBe(false);
  });

  test('reset clears all keys (used when switching active student in-session)', () => {
    _anaShouldFire('__reset__');
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(true);
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(false);
    _anaShouldFire('__reset__');
    expect(_anaShouldFire('unit_viewed_sid1_u1')).toBe(true);
  });

  test('handles falsy / non-string keys safely (defensive)', () => {
    _anaShouldFire('__reset__');
    // null / undefined / '' should not be tracked — return false so caller skips emission.
    expect(_anaShouldFire(null)).toBe(false);
    expect(_anaShouldFire(undefined)).toBe(false);
    expect(_anaShouldFire('')).toBe(false);
  });
});
