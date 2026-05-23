'use strict';

// Tests for the learning-calendar hydration fix.
//
// Bug: when a parent navigated from the dashboard into the student app
// ("Go to App"), enterStudentLearningSession wiped wb_streak and
// wb_act_dates (step 3) and then called _hydrateStudentFromParentSession
// instead of _pullStudentProgress. _hydrateStudentFromParentSession used
// the RPC get_student_progress_by_pin, which doesn't return streak fields
// or act_dates_json — so the wiped state was never repopulated, and the
// student-side calendar grid showed no active days.
//
// Fix: after the existing progress/activity hydration in
// _hydrateStudentFromParentSession, fetch streak_current, streak_longest,
// streak_last_date, and act_dates_json directly from student_profiles
// using the parent's Supabase session (same RLS path as
// _fetchManagedProfiles). Write to wb_streak / wb_act_dates with the
// same defensive coercion the dashboard helpers use, then call
// _renderCalBtn() to refresh the cal-btn dot.
//
// Source-text contract assertions are used here because src/auth.js
// runs against real Supabase + DOM globals and is not safely jest-
// requireable in isolation. The defensive coercion semantics are
// validated separately in tests/parent-dashboard-streak.test.js
// against the equivalent _dbBuildStudentStreak /
// _dbBuildStudentActDates helpers in dashboard.js — auth.js mirrors
// the exact same predicates.

const fs = require('fs');
const path = require('path');

const AUTH_PATH = path.join(__dirname, '..', 'src', 'auth.js');

let src;
beforeAll(() => { src = fs.readFileSync(AUTH_PATH, 'utf8'); });

function sliceAround(text, anchor, before, after) {
  const idx = text.indexOf(anchor);
  if (idx < 0) return '';
  return text.slice(Math.max(0, idx - (before || 0)), idx + (after || 0));
}

// Isolate the body of _hydrateStudentFromParentSession so each contract
// check targets that function (not look-alike code elsewhere in auth.js).
function hydrateBody() {
  const start = src.indexOf('async function _hydrateStudentFromParentSession');
  expect(start).toBeGreaterThan(-1);
  // The next top-level `async function` or `function ` after this one
  // marks the end. We slice up to the next 'async function _' or
  // 'function _lsStudentLogin'.
  const after = src.indexOf('async function _lsStudentLogin', start);
  expect(after).toBeGreaterThan(start);
  return src.slice(start, after);
}

// Isolate _pullStudentProgress similarly for the regression check.
function pullBody() {
  const start = src.indexOf('async function _pullStudentProgress');
  expect(start).toBeGreaterThan(-1);
  // _pullStudentProgress is followed by a long body; cap at 25 KB.
  return src.slice(start, start + 25000);
}

// ── 1. The new fetch is wired ────────────────────────────────────────
describe('_hydrateStudentFromParentSession — student_profiles SELECT contract', () => {
  test('body contains .from("student_profiles").select(...) call', () => {
    const body = hydrateBody();
    expect(body).toMatch(/\.from\(['"]student_profiles['"]\)\s*\.\s*select\(/);
  });

  test('SELECT lists streak_current', () => {
    expect(hydrateBody()).toMatch(/\.select\([^)]*streak_current[^)]*\)/);
  });

  test('SELECT lists streak_longest', () => {
    expect(hydrateBody()).toMatch(/\.select\([^)]*streak_longest[^)]*\)/);
  });

  test('SELECT lists streak_last_date', () => {
    expect(hydrateBody()).toMatch(/\.select\([^)]*streak_last_date[^)]*\)/);
  });

  test('SELECT lists act_dates_json', () => {
    expect(hydrateBody()).toMatch(/\.select\([^)]*act_dates_json[^)]*\)/);
  });

  test('uses .eq("id", studentId).maybeSingle() to scope to the active student', () => {
    const body = hydrateBody();
    expect(body).toMatch(/\.eq\(['"]id['"]\s*,\s*studentId\)/);
    expect(body).toMatch(/\.maybeSingle\(\)/);
  });

  test('has a Promise.race timeout (no infinite wait)', () => {
    const body = hydrateBody();
    // Streak hydration has its own try block + its own race timeout
    // (separately from the activity/RPC race timeout earlier in the fn).
    expect(body).toMatch(/streak timeout/);
  });
});

// ── 2. The hydrated values are written ───────────────────────────────
describe('_hydrateStudentFromParentSession — writes wb_streak and wb_act_dates', () => {
  test('writes localStorage key "wb_streak" inside the hydrate function', () => {
    const body = hydrateBody();
    expect(body).toMatch(/localStorage\.setItem\(['"]wb_streak['"]/);
  });

  test('writes localStorage key "wb_act_dates" inside the hydrate function', () => {
    const body = hydrateBody();
    expect(body).toMatch(/localStorage\.setItem\(['"]wb_act_dates['"]/);
  });

  test('coerces STREAK.current with non-negative number guard', () => {
    const body = hydrateBody();
    // Pattern: typeof ... === 'number' && ... >= 0
    expect(body).toMatch(/STREAK\.current\s*=\s*\(typeof\s+_sp\.streak_current\s*===\s*['"]number['"]\s*&&\s*_sp\.streak_current\s*>=\s*0\)/);
  });

  test('coerces STREAK.longest with non-negative number guard', () => {
    const body = hydrateBody();
    expect(body).toMatch(/STREAK\.longest\s*=\s*\(typeof\s+_sp\.streak_longest\s*===\s*['"]number['"]\s*&&\s*_sp\.streak_longest\s*>=\s*0\)/);
  });

  test('coerces STREAK.lastDate with empty-string guard', () => {
    const body = hydrateBody();
    expect(body).toMatch(/STREAK\.lastDate\s*=\s*\(typeof\s+_sp\.streak_last_date\s*===\s*['"]string['"]\s*&&\s*_sp\.streak_last_date\s*!==\s*['"]['"]\)/);
  });

  test('filters act_dates_json by /^\\d{4}-\\d{2}-\\d{2}$/ (drops invalid date strings)', () => {
    const body = hydrateBody();
    expect(body).toMatch(/\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\//);
  });

  test('falls back to [] when act_dates_json is not an array (missing / null / non-array)', () => {
    const body = hydrateBody();
    // Pattern: Array.isArray(_sp.act_dates_json) ? … : []
    expect(body).toMatch(/Array\.isArray\(_sp\.act_dates_json\)\s*\?[\s\S]*?:\s*\[\]/);
  });
});

// ── 3. UI refresh happens after hydration ────────────────────────────
describe('_hydrateStudentFromParentSession — refreshes cal-btn after hydration', () => {
  test('calls _renderCalBtn() inside the streak/act_dates hydration block', () => {
    const body = hydrateBody();
    // The _renderCalBtn call must live AFTER wb_act_dates write, BEFORE
    // the catch. Slice from wb_act_dates write to end-of-try to scope.
    const writeIdx = body.indexOf("localStorage.setItem('wb_act_dates'");
    expect(writeIdx).toBeGreaterThan(-1);
    const region = body.slice(writeIdx, writeIdx + 600);
    expect(region).toMatch(/_renderCalBtn\(\)/);
  });

  test('guards _renderCalBtn call with typeof === "function" (safe under partial bundles)', () => {
    const body = hydrateBody();
    expect(body).toMatch(/typeof\s+_renderCalBtn\s*===\s*['"]function['"]\s*\)\s*_renderCalBtn\(\)/);
  });
});

// ── 4. The new fetch failure is non-fatal ────────────────────────────
describe('_hydrateStudentFromParentSession — failure handling', () => {
  test('streak hydration is wrapped in its own try/catch (does not block _pullSucceeded)', () => {
    const body = hydrateBody();
    // _pullSucceeded = true must appear AFTER the streak hydration block.
    const streakIdx = body.indexOf("streak timeout");
    const succIdx   = body.indexOf("_pullSucceeded = true");
    expect(streakIdx).toBeGreaterThan(-1);
    expect(succIdx).toBeGreaterThan(streakIdx);
  });

  test('catch logs a warning so failures are observable in dev console', () => {
    const body = hydrateBody();
    expect(body).toMatch(/console\.warn\([^)]*parent-session streak\/act_dates hydration failed/);
  });
});

// ── 5. Family-code path is unchanged (regression) ───────────────────
describe('_pullStudentProgress — family-code path still writes wb_streak and wb_act_dates', () => {
  test('still writes wb_streak', () => {
    expect(pullBody()).toMatch(/localStorage\.setItem\(['"]wb_streak['"]/);
  });

  test('still writes wb_act_dates with the same /^\\d{4}-\\d{2}-\\d{2}$/ filter', () => {
    const body = pullBody();
    expect(body).toMatch(/localStorage\.setItem\(['"]wb_act_dates['"]/);
    expect(body).toMatch(/\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\//);
  });

  test('still merges prof.streak_current / streak_longest / streak_last_date into STREAK', () => {
    const body = pullBody();
    expect(body).toMatch(/STREAK\.current\s*=\s*prof\.streak_current/);
    expect(body).toMatch(/STREAK\.longest\s*=\s*prof\.streak_longest/);
    expect(body).toMatch(/STREAK\.lastDate\s*=\s*prof\.streak_last_date/);
  });
});

// ── 6. Defensive coercion semantics (cross-referenced) ───────────────
// The auth.js inline coercion mirrors dashboard.js's _dbBuildStudentStreak
// and _dbBuildStudentActDates. Re-validate those helpers here so a
// regression in either codepath surfaces as a clear test failure.
describe('Defensive coercion (canonical semantics, exercised via dashboard helpers)', () => {
  const { _dbBuildStudentStreak, _dbBuildStudentActDates } = require('../src/dashboard');

  test('missing/invalid streak values default to {current:0, longest:0, lastDate:null}', () => {
    expect(_dbBuildStudentStreak({})).toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak(null)).toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak({ streak_current: -5, streak_longest: -1 }))
      .toEqual({ current: 0, longest: 0, lastDate: null });
    expect(_dbBuildStudentStreak({ streak_current: NaN, streak_longest: 'x', streak_last_date: '' }))
      .toEqual({ current: 0, longest: 0, lastDate: null });
  });

  test('valid streak values pass through unchanged', () => {
    expect(_dbBuildStudentStreak({
      streak_current: 7, streak_longest: 14, streak_last_date: '2026-05-22',
    })).toEqual({ current: 7, longest: 14, lastDate: '2026-05-22' });
  });

  test('valid YYYY-MM-DD entries in act_dates_json are preserved', () => {
    expect(_dbBuildStudentActDates({ act_dates_json: ['2026-05-21', '2026-05-22'] }))
      .toEqual(['2026-05-21', '2026-05-22']);
  });

  test('invalid entries are dropped while valid ones survive', () => {
    expect(_dbBuildStudentActDates({
      act_dates_json: ['2026-05-22', 'garbage', '', null, 999, '2026-05-21'],
    }).sort()).toEqual(['2026-05-21', '2026-05-22']);
  });

  test('missing / null / non-array act_dates_json becomes []', () => {
    expect(_dbBuildStudentActDates({})).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: null })).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: undefined })).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: 'not-an-array' })).toEqual([]);
    expect(_dbBuildStudentActDates({ act_dates_json: {} })).toEqual([]);
    expect(_dbBuildStudentActDates(null)).toEqual([]);
  });
});

// ── 7. The wipe step in enterStudentLearningSession still happens ───
// (Regression: we rely on the wipe to prevent cross-student leakage when
// switching profiles. The new fetch above repopulates the wiped values.)
describe('enterStudentLearningSession — wipe step still resets wb_streak and wb_act_dates', () => {
  test('wb_streak reset to {0,0,null} on entry', () => {
    expect(src).toMatch(/localStorage\.setItem\(['"]wb_streak['"]\s*,\s*JSON\.stringify\(\{\s*current:\s*0,\s*longest:\s*0,\s*lastDate:\s*null\s*\}\)\)/);
  });

  test('wb_act_dates reset to [] on entry', () => {
    expect(src).toMatch(/localStorage\.setItem\(['"]wb_act_dates['"]\s*,\s*JSON\.stringify\(\[\]\)\)/);
  });
});
