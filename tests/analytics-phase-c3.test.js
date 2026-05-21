'use strict';

// =============================================================================
//  Analytics Phase C.3A — _parseBreakdown helper + new metric mappings
//
//  C.3A adds 4 admin RPCs:
//    - analytics_new_signups
//    - analytics_returning_students
//    - analytics_sessions_per_student
//    - analytics_avg_score (takes p_breakdown ∈ {'grade','unit','lesson'})
//
//  Only the avg-score RPC has a third parameter the admin can vary. The
//  client passes ?breakdown=… and the Netlify query function validates it
//  against an allow-list before forwarding as a named RPC arg. No dynamic
//  SQL anywhere — the allow-list is enforced both client- and server-side.
// =============================================================================

const queryMod = require('../netlify/functions/analytics-query.js');
const {
  _parseAnalyticsFilters,  // existing (Phase C.2)
  _parseBreakdown,         // new (Phase C.3A)
  METRIC_TO_RPC,           // not exported; we'll assert via a probe
} = queryMod;

describe('_parseBreakdown', () => {
  test('accepts canonical breakdown values', () => {
    expect(_parseBreakdown('grade')).toBe('grade');
    expect(_parseBreakdown('unit')).toBe('unit');
    expect(_parseBreakdown('lesson')).toBe('lesson');
  });

  test('is case-insensitive on input but emits lowercase canonical', () => {
    expect(_parseBreakdown('GRADE')).toBe('grade');
    expect(_parseBreakdown('Unit')).toBe('unit');
    expect(_parseBreakdown('LeSsOn')).toBe('lesson');
  });

  test('defaults to lesson on missing input', () => {
    expect(_parseBreakdown(undefined)).toBe('lesson');
    expect(_parseBreakdown(null)).toBe('lesson');
    expect(_parseBreakdown('')).toBe('lesson');
  });

  test('defaults to lesson on unrecognized input (never trusts arbitrary strings)', () => {
    expect(_parseBreakdown('hacked')).toBe('lesson');
    expect(_parseBreakdown('grade; DROP TABLE')).toBe('lesson');
    expect(_parseBreakdown('students')).toBe('lesson');
  });

  test('rejects non-string input safely', () => {
    expect(_parseBreakdown(123)).toBe('lesson');
    expect(_parseBreakdown({})).toBe('lesson');
    expect(_parseBreakdown([])).toBe('lesson');
    expect(_parseBreakdown(true)).toBe('lesson');
  });

  test('output is always one of the three allowed tokens', () => {
    const allowed = new Set(['grade','unit','lesson']);
    [undefined, null, '', 'grade', 'unit', 'lesson', 'GRADE', 'bogus', 42, [], {}].forEach(v => {
      expect(allowed.has(_parseBreakdown(v))).toBe(true);
    });
  });
});

describe('METRIC_TO_RPC — Phase C.3A mappings', () => {
  // The METRIC_TO_RPC object isn't exported directly, but the same module
  // ships an admin-only Netlify handler. Walking the module file is the
  // simplest way to assert the mapping exists. We re-read the source as a
  // string and grep for the metric names. (No runtime invocation needed.)
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'netlify', 'functions', 'analytics-query.js'), 'utf8');

  test.each([
    ['new_signups',           'analytics_new_signups'],
    ['returning_students',    'analytics_returning_students'],
    ['sessions_per_student',  'analytics_sessions_per_student'],
    ['avg_score',             'analytics_avg_score'],
  ])('metric %s is mapped to RPC %s', (metric, rpc) => {
    // Tolerate bare-identifier object keys (current style) and quoted keys.
    expect(src).toMatch(new RegExp("['\"]?" + metric + "['\"]?\\s*:\\s*['\"]" + rpc + "['\"]"));
  });
});

describe('Phase C.2 helpers still work after C.3A additions', () => {
  // Regression guard: adding _parseBreakdown must not break the existing
  // _parseAnalyticsFilters contract.
  test('_parseAnalyticsFilters defaults unchanged', () => {
    expect(_parseAnalyticsFilters({})).toEqual({ p_days: 30, p_grade: null });
  });

  test('_parseAnalyticsFilters still validates strict numeric days', () => {
    expect(_parseAnalyticsFilters({ days: '7; DROP' }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: '7' }).p_days).toBe(7);
  });
});
