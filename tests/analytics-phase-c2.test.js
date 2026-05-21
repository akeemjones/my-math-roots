'use strict';

// =============================================================================
//  Analytics Phase C.2 — grade normalization + admin query filters
//
//  Two pure helpers added in this phase:
//
//  1. _normalizeGrade(raw) — server-side, in netlify/functions/analytics-ingest.js
//     C.1 dashboard emissions send grade='g1'|'g2' (the band tokens used by the
//     dashboard's view-grade picker), but the ingest validator's allow-list
//     only accepts 'K' and '1'..'5', so the top-level grade column got NULLed.
//     This helper maps every reasonable input to the canonical token before
//     the allow-list check, so dashboard events keep their grade.
//
//  2. _parseAnalyticsFilters({ days, grade }) — admin query, in
//     netlify/functions/analytics-query.js. Validates the date-range and
//     grade-filter query strings the admin page now passes, returns the
//     sanitized values the RPCs accept ({ p_days, p_grade }). Invalid input
//     falls back to safe defaults instead of erroring.
// =============================================================================

const { _normalizeGrade }        = require('../netlify/functions/analytics-ingest.js');
const { _parseAnalyticsFilters } = require('../netlify/functions/analytics-query.js');

describe('_normalizeGrade', () => {
  // Canonical values (allow-list) pass through unchanged
  test.each([
    ['K', 'K'],
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
    ['5', '5'],
  ])('canonical %s → %s', (input, expected) => {
    expect(_normalizeGrade(input)).toBe(expected);
  });

  // Kindergarten variants
  test.each([
    ['k',            'K'],
    ['K',            'K'],
    ['kindergarten', 'K'],
    ['Kindergarten', 'K'],
    ['KINDERGARTEN', 'K'],
    [0,              'K'],
    ['0',            'K'],
  ])('kindergarten variant %p → K', (input, expected) => {
    expect(_normalizeGrade(input)).toBe(expected);
  });

  // Grade 1 variants
  test.each([
    ['g1',      '1'],
    ['G1',      '1'],
    ['grade1',  '1'],
    ['grade 1', '1'],
    [1,         '1'],
    ['1',       '1'],
  ])('grade-1 variant %p → 1', (input, expected) => {
    expect(_normalizeGrade(input)).toBe(expected);
  });

  // Grade 2 variants (the C.1 follow-up bug case)
  test.each([
    ['g2',      '2'],
    ['G2',      '2'],
    ['grade2',  '2'],
    ['grade 2', '2'],
    [2,         '2'],
    ['2',       '2'],
  ])('grade-2 variant %p → 2 (C.1 follow-up)', (input, expected) => {
    expect(_normalizeGrade(input)).toBe(expected);
  });

  // Unknown / invalid inputs → null (drops the column rather than guessing)
  test.each([
    'bogus',
    '',
    null,
    undefined,
    {},
    [],
    'g99',
    '99',
    'NaN',
  ])('invalid input %p → null', (input) => {
    expect(_normalizeGrade(input)).toBeNull();
  });
});

describe('_parseAnalyticsFilters', () => {
  test('returns safe defaults when no filters supplied', () => {
    const r = _parseAnalyticsFilters({});
    // Phase C.3A follow-up extended the output with p_from / p_to.
    expect(r).toEqual({ p_days: 30, p_grade: null, p_from: null, p_to: null });
  });

  test('accepts allowed day windows', () => {
    expect(_parseAnalyticsFilters({ days: '7'  }).p_days).toBe(7);
    expect(_parseAnalyticsFilters({ days: '30' }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: '90' }).p_days).toBe(90);
  });

  test('coerces accepted day values from numeric strings', () => {
    expect(_parseAnalyticsFilters({ days: 7  }).p_days).toBe(7);
    expect(_parseAnalyticsFilters({ days: 30 }).p_days).toBe(30);
  });

  test('rejects unsupported day values and falls back to default', () => {
    expect(_parseAnalyticsFilters({ days: '14'        }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: '365'       }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: '7; DROP'   }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: '-7'        }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: 'seven'     }).p_days).toBe(30);
    expect(_parseAnalyticsFilters({ days: null        }).p_days).toBe(30);
  });

  test('accepts canonical grade values', () => {
    expect(_parseAnalyticsFilters({ grade: 'K' }).p_grade).toBe('K');
    expect(_parseAnalyticsFilters({ grade: '1' }).p_grade).toBe('1');
    expect(_parseAnalyticsFilters({ grade: '2' }).p_grade).toBe('2');
  });

  test('normalizes band tokens to canonical grade', () => {
    expect(_parseAnalyticsFilters({ grade: 'k'  }).p_grade).toBe('K');
    expect(_parseAnalyticsFilters({ grade: 'g1' }).p_grade).toBe('1');
    expect(_parseAnalyticsFilters({ grade: 'g2' }).p_grade).toBe('2');
  });

  test('treats "all" / missing / invalid grade as no filter', () => {
    expect(_parseAnalyticsFilters({ grade: 'all'    }).p_grade).toBeNull();
    expect(_parseAnalyticsFilters({                 }).p_grade).toBeNull();
    expect(_parseAnalyticsFilters({ grade: ''       }).p_grade).toBeNull();
    expect(_parseAnalyticsFilters({ grade: 'bogus'  }).p_grade).toBeNull();
    expect(_parseAnalyticsFilters({ grade: 'DROP'   }).p_grade).toBeNull();
  });

  test('returns object with exactly { p_days, p_grade, p_from, p_to }', () => {
    const r = _parseAnalyticsFilters({ days: '7', grade: 'g2' });
    expect(Object.keys(r).sort()).toEqual(['p_days', 'p_from', 'p_grade', 'p_to']);
  });

  test('null / undefined input is safe', () => {
    expect(_parseAnalyticsFilters(null)).toEqual({ p_days: 30, p_grade: null, p_from: null, p_to: null });
    expect(_parseAnalyticsFilters(undefined)).toEqual({ p_days: 30, p_grade: null, p_from: null, p_to: null });
  });
});
