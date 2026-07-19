'use strict';

// =============================================================================
//  SINGLE FAMILY ACCOUNT — architecture acceptance
//
//  Locks the shape of the converted client: one Family Account login, children
//  as profiles (no student login / family code / PIN / session token), one
//  PIN-gated Settings with four sections, no standalone dashboard. Complements
//  tests/startup-resolver.test.js (the routing contract) with UI-absence and
//  wiring contracts plus behavioural coverage of the relocated progress data.
// =============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const html = read('index.html');
const auth = read('src/auth.js');
const switcher = read('src/profile-switcher.js');
const settings = read('src/settings.js');
const nav = read('src/nav.js');

describe('one Family Account login (no student login screen)', () => {
  test('login has a single Family Account card, not a Student card', () => {
    expect(html).toMatch(/id="ls-card-0"/);
    expect(html).toMatch(/Family Account/);
    // The student card + its family-code/PIN body are gone.
    expect(html).not.toMatch(/id="ls-card-1"/);
    expect(html).not.toMatch(/id="ls-student-body"/);
  });

  test('no carousel dots and no guest link remain on the login screen', () => {
    expect(html).not.toMatch(/class="ls-dots"/);
    expect(html).not.toMatch(/id="ls-guest-btn"/);
  });

    test('the new client does not call the student-auth RPCs from reachable UI', () => {
    // verify_student_pin / get_profiles_by_family_code are not invoked by the
    // profile switcher any more (the sole remaining live child-selection path).
    // Check for the actual .rpc() call, not mentions in comments.
    expect(switcher).not.toMatch(/\.rpc\(\s*['"]verify_student_pin/);
    expect(switcher).not.toMatch(/\.rpc\(\s*['"]get_profiles_by_family_code/);
  });
});

describe('children are profiles, not logins', () => {
  test('selecting/switching a child uses the parent-owned entry with no token', () => {
    const fn = switcher.match(/function psSelectProfile\(id\)\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/enterStudentLearningSession\(/);
    expect(fn).toMatch(/sessionToken:\s*null/);
    // No PIN prompt in the switch path.
    expect(fn).not.toMatch(/_psPinViewHtml|verify_student_pin/);
  });

  test('the PIN entry view and verifier are gone from the switcher', () => {
    expect(switcher).not.toMatch(/function _psCheckPin/);
    expect(switcher).not.toMatch(/function _psPinViewHtml/);
  });

  test('entering a child session sets child app-mode (no auth-role flip)', () => {
    const fn = auth.match(/async function enterStudentLearningSession\(opts\)\s*\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/setItem\('mmr_app_mode',\s*'child'\)/);
    expect(auth).not.toMatch(/function _enterParentMode\s*\(/);
  });
});

describe('one PIN-gated Settings with four sections', () => {
  test('Settings entry is gated by the parent PIN', () => {
    const fn = settings.match(/function openSettings\(\)\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/isParentUnlocked\(\)/);
    expect(fn).toMatch(/_openParentAuth\(\)/);
  });

  test('opening Settings sets settings mode + a gate stamp for the resolver', () => {
    const fn = settings.match(/function _enterSettingsMode\(\)\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/setItem\('mmr_app_mode',\s*'settings'\)/);
    expect(fn).toMatch(/mmr_parent_gate_until/);
  });

  test('Settings shows exactly the four sections, in order', () => {
    const groups = (html.match(/class="set-group">([^<]+)</g) || [])
      .map((m) => m.replace(/class="set-group">/, '').replace(/</, '').trim());
    expect(groups).toEqual(['Children', 'Learning Preferences', 'Progress', 'Account']);
  });
});

describe('no standalone dashboard / parent-center', () => {
  test('the dashboard screen and its entry button are gone from the client', () => {
    expect(html).not.toMatch(/id="dashboard-screen"/);
    expect(html).not.toMatch(/id="db-root"/);
    expect(html).not.toMatch(/id="parent-dash-btn"/);
  });

  test('routing no longer knows dashboard-screen or parent-screen', () => {
    const line = nav.match(/const ALL_SCREENS = \[[^\]]*\]/)[0];
    expect(line).not.toMatch(/dashboard-screen/);
    expect(line).not.toMatch(/parent-screen/);
    expect(line).toMatch(/profile-selection/);
  });
});

describe('relocated progress utilities behave correctly (parent-progress.js)', () => {
  const PP = require('../src/parent-progress');

  test('_computeOverallStats averages completed quizzes', () => {
    const s = PP._computeOverallStats([
      { pct: 90, total: 10, score: 9 },
      { pct: 50, total: 10, score: 5 },
    ]);
    expect(s.quizCount).toBe(2);
    expect(s.accuracy).toBe(70);
    expect(s.totalCorrect).toBe(14);
  });

  test('_getLast7DaysLessonQuizScores filters by type + 7-day cutoff', () => {
    const now = Date.now();
    const recent = { type: 'lesson', pct: 80, total: 10, id: now - 1000 };
    const old = { type: 'lesson', pct: 80, total: 10, id: now - 9 * 86400000 };
    const unit = { type: 'unit', pct: 80, total: 10, id: now - 1000 };
    const out = PP._getLast7DaysLessonQuizScores([recent, old, unit]);
    expect(out).toEqual([recent]);
  });

  test('_dbResolveProfileGrade prefers the profile grade and normalizes it', () => {
    // The resolver has its own normalizer, so the returned grade is correct even
    // without the bundle's normalizeGrade global. (The cache-mirror value depends
    // on that global, so we assert the return value only here.)
    const m = new Map();
    global.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
    try {
      expect(PP._dbResolveProfileGrade({ id: 'c1', grade: '1' })).toBe('1');
      expect(PP._dbResolveProfileGrade({ id: 'c2', grade: 'Kindergarten' })).toBe('K');
      expect(PP._dbResolveProfileGrade({ id: 'c3' })).toBe('2'); // no grade anywhere → fallback
    } finally {
      delete global.localStorage;
    }
  });

  test('_dbBuildStudentStreak maps a profile row, defaulting missing values', () => {
    expect(PP._dbBuildStudentStreak({ streak_current: 5, streak_longest: 9, streak_last_date: '2026-07-01' }))
      .toEqual({ current: 5, longest: 9, lastDate: '2026-07-01' });
    expect(PP._dbBuildStudentStreak(null)).toEqual({ current: 0, longest: 0, lastDate: null });
  });
});
