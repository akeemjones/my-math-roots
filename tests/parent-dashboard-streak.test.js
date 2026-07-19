'use strict';

// Tests for the parent dashboard's streak / active-dates hydration
// for managed (Supabase-backed) student profiles.
//
// Before this fix, `_fetchManagedProfiles` selected only the display
// columns (id, display_name, avatars, grade, …) and `_students[id]`
// was seeded with a hard-coded `STREAK: { current: 0, longest: 0,
// lastDate: null }`. The parent's Activity Snapshot card then always
// showed "0 days" current streak regardless of real student progress.
//
// The fix:
//   1. Adds streak_current, streak_longest, streak_last_date,
//      act_dates_json to the SELECT in _fetchManagedProfiles.
//   2. Seeds _students[id].STREAK and _students[id].ACT_DATES from
//      the fetched values via two pure helpers exported here.
//   3. The Activity Snapshot reads st.STREAK as before, so the real
//      values now flow through.

const fs = require('fs');
const path = require('path');

const DASH_PATH = path.join(__dirname, '..', 'src', 'dashboard.js');

// Pure mappers relocated to parent-progress.js; _renderActivitySnapshotInner
// (the renderer) still lives in dashboard.js until the dashboard is removed.
const {
  _dbBuildStudentStreak,
  _dbBuildStudentActDates,
} = require('../src/parent-progress');
const { _renderActivitySnapshotInner } = require('../src/dashboard');

// ── _fetchManagedProfiles SELECT contract ───────────────────────────
describe('_fetchManagedProfiles SELECT contract (parent dashboard streak hydration)', () => {
  let src;
  beforeAll(() => { src = fs.readFileSync(DASH_PATH, 'utf8'); });

  test('SELECT includes streak_current', () => {
    expect(src).toMatch(/\.select\([^)]*streak_current[^)]*\)/);
  });

  test('SELECT includes streak_longest', () => {
    expect(src).toMatch(/\.select\([^)]*streak_longest[^)]*\)/);
  });

  test('SELECT includes streak_last_date', () => {
    expect(src).toMatch(/\.select\([^)]*streak_last_date[^)]*\)/);
  });

  test('SELECT includes act_dates_json', () => {
    expect(src).toMatch(/\.select\([^)]*act_dates_json[^)]*\)/);
  });

  test('managed-profile seed uses _dbBuildStudentStreak (not the hard-coded zero shape)', () => {
    expect(src).toMatch(/STREAK:\s*_dbBuildStudentStreak\(p\)/);
    // Legacy hard-coded zero shape no longer used at the seed site.
    expect(src).not.toMatch(/STREAK:\s*\{\s*current:\s*0,\s*longest:\s*0,\s*lastDate:\s*null\s*\}\s*,\s*\n[\s\S]*?APP_TIME/);
  });

  test('managed-profile seed uses _dbBuildStudentActDates', () => {
    expect(src).toMatch(/ACT_DATES:\s*_dbBuildStudentActDates\(p\)/);
  });
});

// ── _dbBuildStudentStreak ────────────────────────────────────────────
describe('_dbBuildStudentStreak', () => {
  test('maps a fully-populated profile to { current, longest, lastDate }', () => {
    const profile = {
      id: 'a', display_name: 'Test', grade: '2',
      streak_current: 5,
      streak_longest: 9,
      streak_last_date: '2026-05-22',
    };
    expect(_dbBuildStudentStreak(profile)).toEqual({
      current: 5,
      longest: 9,
      lastDate: '2026-05-22',
    });
  });

  test('missing fields default to { current: 0, longest: 0, lastDate: null }', () => {
    expect(_dbBuildStudentStreak({})).toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak({ id: 'a' })).toEqual({ current: 0, longest: 0, lastDate: null });
  });

  test('null / undefined / non-object input defaults to all-zero shape', () => {
    expect(_dbBuildStudentStreak(null)).toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak(undefined)).toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak('not-an-object')).toEqual({ current: 0, longest: 0, lastDate: null });
  });

  test('empty-string streak_last_date (server default) becomes null', () => {
    const out = _dbBuildStudentStreak({ streak_current: 3, streak_longest: 3, streak_last_date: '' });
    expect(out.lastDate).toBeNull();
    expect(out.current).toBe(3);
    expect(out.longest).toBe(3);
  });

  test('zero current with non-zero longest (resumed-from-gap student)', () => {
    const out = _dbBuildStudentStreak({ streak_current: 0, streak_longest: 12, streak_last_date: '2026-03-01' });
    expect(out).toEqual({ current: 0, longest: 12, lastDate: '2026-03-01' });
  });

  test('negative / NaN / non-number values fall back to 0', () => {
    expect(_dbBuildStudentStreak({ streak_current: -1, streak_longest: -5, streak_last_date: '2026-05-22' }))
      .toEqual({ current: 0, longest: 0, lastDate: '2026-05-22' });
    expect(_dbBuildStudentStreak({ streak_current: '5', streak_longest: 'x', streak_last_date: null }))
      .toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak({ streak_current: NaN, streak_longest: NaN, streak_last_date: undefined }))
      .toEqual({ current: 0, longest: 0, lastDate: null });
  });
});

// ── _dbBuildStudentActDates ─────────────────────────────────────────
describe('_dbBuildStudentActDates', () => {
  test('preserves a valid YYYY-MM-DD array', () => {
    const profile = { act_dates_json: ['2026-05-20', '2026-05-21', '2026-05-22'] };
    expect(_dbBuildStudentActDates(profile)).toEqual(['2026-05-20', '2026-05-21', '2026-05-22']);
  });

  test('missing act_dates_json becomes []', () => {
    expect(_dbBuildStudentActDates({})).toEqual([]);
    expect(_dbBuildStudentActDates({ id: 'a' })).toEqual([]);
  });

  test('null / undefined act_dates_json becomes []', () => {
    expect(_dbBuildStudentActDates({ act_dates_json: null })).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: undefined })).toEqual([]);
  });

  test('non-array act_dates_json (object/string/number) becomes []', () => {
    expect(_dbBuildStudentActDates({ act_dates_json: {} })).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: 'not-an-array' })).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: 42 })).toEqual([]);
  });

  test('drops invalid date strings while keeping the valid ones', () => {
    const profile = { act_dates_json: ['2026-05-22', 'garbage', '', null, 12345, '2026-13-01', '2026-05-21'] };
    // '2026-13-01' has month=13 which the regex /^\d{4}-\d{2}-\d{2}$/ DOES match
    // (it's a syntactic filter, not a calendar validity check). Document that
    // by asserting all syntactically-valid strings survive.
    const out = _dbBuildStudentActDates(profile);
    expect(out).toContain('2026-05-22');
    expect(out).toContain('2026-05-21');
    expect(out).toContain('2026-13-01');
    expect(out).not.toContain('garbage');
    expect(out).not.toContain('');
    expect(out).not.toContain(null);
    expect(out).not.toContain(12345);
  });

  test('null / undefined / non-object profile becomes []', () => {
    expect(_dbBuildStudentActDates(null)).toEqual([]);
    expect(_dbBuildStudentActDates(undefined)).toEqual([]);
    expect(_dbBuildStudentActDates('not-an-object')).toEqual([]);
  });
});

// ── End-to-end: Activity Snapshot renders the real STREAK ────────────
describe('Activity Snapshot renders the real managed-student streak', () => {
  function callRender(streak) {
    const stats   = { accuracy: 0, quizCount: 0, lastActive: '' };
    const scores  = [];
    const appTime = { totalSecs: 0, sessions: 0, dailySecs: {} };
    const activity = [];
    return _renderActivitySnapshotInner(stats, scores, appTime, activity, streak, []);
  }

  test('renders "5 days" when STREAK.current is 5', () => {
    const html = callRender({ current: 5, longest: 9, lastDate: '2026-05-22' });
    expect(html).toContain('Current Streak');
    expect(html).toContain('5 day');
    expect(html).not.toMatch(/>0 days?</);  // would be the pre-fix output
  });

  test('renders "1 day" (singular) when STREAK.current is 1', () => {
    const html = callRender({ current: 1, longest: 1, lastDate: '2026-05-22' });
    expect(html).toContain('1 day');
    expect(html).not.toContain('1 days');
  });

  test('renders "0 days" when streak truly is 0', () => {
    const html = callRender({ current: 0, longest: 0, lastDate: null });
    expect(html).toContain('0 days');
  });

  test('end-to-end: profile → seed → render shows correct streak text', () => {
    // Simulate the full path from fetched managed profile to rendered HTML.
    const profile = {
      id: 'abc', display_name: 'Test', grade: '2',
      streak_current: 7, streak_longest: 14, streak_last_date: '2026-05-22',
      act_dates_json: ['2026-05-20', '2026-05-21', '2026-05-22'],
    };
    const seededStreak = _dbBuildStudentStreak(profile);
    const seededActDates = _dbBuildStudentActDates(profile);
    expect(seededStreak).toEqual({ current: 7, longest: 14, lastDate: '2026-05-22' });
    expect(seededActDates).toEqual(['2026-05-20', '2026-05-21', '2026-05-22']);

    const html = callRender(seededStreak);
    expect(html).toContain('7 day');
    expect(html).not.toMatch(/>0 days?</);
  });
});
