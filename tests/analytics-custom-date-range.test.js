'use strict';

// =============================================================================
//  Analytics Phase C.3A follow-up — custom date range
//
//  `_parseAnalyticsFilters` is extended to recognise `from` / `to` query
//  string params alongside the existing `days` / `grade`. When a valid
//  start+end pair is supplied, the RPCs receive p_from / p_to (TIMESTAMPTZ
//  string) and p_days is nullified so they can't conflict. When the pair is
//  missing or invalid, fallback is the existing days/preset behavior.
//
//  Dates are interpreted as UTC: `from` becomes start-of-day UTC, `to`
//  becomes end-of-day UTC. The RPC signatures gain
//  `p_from TIMESTAMPTZ DEFAULT NULL` and `p_to TIMESTAMPTZ DEFAULT NULL`.
// =============================================================================

const { _parseAnalyticsFilters } = require('../netlify/functions/analytics-query.js');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

describe('_parseAnalyticsFilters — custom date range (Phase C.3A follow-up)', () => {
  test('valid from + to returns p_from / p_to and clears p_days', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-01', to: '2026-05-15' });
    expect(r.p_days).toBeNull();
    expect(r.p_from).toBe('2026-05-01T00:00:00.000Z');
    expect(r.p_to).toBe('2026-05-15T23:59:59.999Z');
    expect(r.p_grade).toBeNull();
  });

  test('custom range combines with grade filter', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-01', to: '2026-05-15', grade: 'g2' });
    expect(r.p_grade).toBe('2');
    expect(r.p_from).toBe('2026-05-01T00:00:00.000Z');
    expect(r.p_to).toBe('2026-05-15T23:59:59.999Z');
  });

  test('end-of-day clamp uses .999Z so events on the to-day are included', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-01', to: '2026-05-01' });
    expect(r.p_from).toBe('2026-05-01T00:00:00.000Z');
    expect(r.p_to).toBe('2026-05-01T23:59:59.999Z');
  });

  test('returns object with all four expected keys', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-01', to: '2026-05-15' });
    expect(Object.keys(r).sort()).toEqual(['p_days', 'p_from', 'p_grade', 'p_to']);
  });

  test('only `from` (no `to`) falls back to days preset, no custom range', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-01' });
    expect(r.p_days).toBe(30);
    expect(r.p_from).toBeNull();
    expect(r.p_to).toBeNull();
  });

  test('only `to` (no `from`) falls back to days preset, no custom range', () => {
    const r = _parseAnalyticsFilters({ to: '2026-05-15' });
    expect(r.p_days).toBe(30);
    expect(r.p_from).toBeNull();
    expect(r.p_to).toBeNull();
  });

  test('from after to is rejected and falls back to preset', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-15', to: '2026-05-01' });
    expect(r.p_days).toBe(30);
    expect(r.p_from).toBeNull();
    expect(r.p_to).toBeNull();
  });

  test('from == to is allowed (single-day range)', () => {
    const r = _parseAnalyticsFilters({ from: '2026-05-01', to: '2026-05-01' });
    expect(r.p_days).toBeNull();
    expect(r.p_from).toBe('2026-05-01T00:00:00.000Z');
    expect(r.p_to).toBe('2026-05-01T23:59:59.999Z');
  });

  test('invalid date format is rejected and falls back to preset', () => {
    expect(_parseAnalyticsFilters({ from: '05/01/2026', to: '05/15/2026' }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: '2026-13-99', to: '2026-13-99' }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: '2026-05-01T00:00', to: '2026-05-15' }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: 'bogus',       to: '2026-05-15' }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: '2026-05-01',  to: 'bogus'      }).p_from).toBeNull();
  });

  test('SQL-injection-shaped input rejected', () => {
    expect(_parseAnalyticsFilters({ from: '2026-05-01; DROP TABLE app_events', to: '2026-05-15' }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: '2026-05-01', to: "2026-05-15' OR '1'='1" }).p_from).toBeNull();
  });

  test('non-string from/to rejected', () => {
    expect(_parseAnalyticsFilters({ from: 20260501, to: 20260515 }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: {}, to: {} }).p_from).toBeNull();
    expect(_parseAnalyticsFilters({ from: ['2026-05-01'], to: ['2026-05-15'] }).p_from).toBeNull();
  });

  test('far-future to (>1 day after now) is rejected to catch typos', () => {
    // "to" two years out is almost certainly a typo.
    const farFuture = new Date(Date.now() + 730 * 86400 * 1000).toISOString().slice(0, 10);
    expect(_parseAnalyticsFilters({ from: '2026-05-01', to: farFuture }).p_from).toBeNull();
  });

  test('today as to-date is accepted', () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = _parseAnalyticsFilters({ from: '2026-01-01', to: today });
    expect(r.p_from).toBe('2026-01-01T00:00:00.000Z');
    expect(r.p_to).toBe(today + 'T23:59:59.999Z');
  });

  test('null / undefined inputs are safe', () => {
    expect(_parseAnalyticsFilters(null)).toEqual({ p_days: 30, p_grade: null, p_from: null, p_to: null });
    expect(_parseAnalyticsFilters(undefined)).toEqual({ p_days: 30, p_grade: null, p_from: null, p_to: null });
  });
});

describe('Existing preset behavior still works (regression)', () => {
  test('days=7 + no from/to → p_days=7, p_from=null, p_to=null', () => {
    const r = _parseAnalyticsFilters({ days: '7' });
    expect(r.p_days).toBe(7);
    expect(r.p_from).toBeNull();
    expect(r.p_to).toBeNull();
  });

  test('days=30 default keeps working', () => {
    const r = _parseAnalyticsFilters({});
    expect(r.p_days).toBe(30);
    expect(r.p_from).toBeNull();
    expect(r.p_to).toBeNull();
  });

  test('days=14 (unsupported preset) still falls back to 30', () => {
    expect(_parseAnalyticsFilters({ days: '14' }).p_days).toBe(30);
  });

  test('days strict numeric validation still rejects unsafe strings', () => {
    expect(_parseAnalyticsFilters({ days: '7; DROP' }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: '-7'      }).p_days).toBe(30);
  });

  test('grade band token g2 still normalizes to 2', () => {
    expect(_parseAnalyticsFilters({ grade: 'g2' }).p_grade).toBe('2');
  });
});
