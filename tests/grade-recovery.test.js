'use strict';

// =============================================================================
//  UNSUPPORTED-GRADE RECOVERY
//
//  A grade is a real decision about a child's learning. When the active grade
//  is no longer offered (Grade 3), the app must NOT guess a replacement — it
//  enters a recovery state and waits for a PARENT to choose K, Grade 1 or
//  Grade 2.
//
//  This suite pins the guarantees that matter:
//    - no silent rewrite of mmr_grade to '2'
//    - no Grade 3 curriculum loads
//    - no Grade 2 lesson can start before the parent chooses
//    - Grade 3 progress survives byte-for-byte
//    - the choice is gated by the existing parent access control
//    - recovery is sticky until a supported grade is actually chosen
//
//  The DOM-driven parts of the flow (screen wiring, the parent-auth hook) are
//  pinned as source contracts — the repo convention for code that needs a live
//  DOM, used by tests/learning-calendar-hydrate.test.js and others.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { needsGradeRecovery } = require('../src/app-config.js');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function store(init) {
  const map = new Map(Object.entries(init || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(String(k), String(v)),
    removeItem: (k) => map.delete(String(k)),
    _all: () => Object.fromEntries(map),
  };
}

// A Grade 3 student's device: their grade, and their work.
const G3_PROGRESS = {
  wb_done5_3: '{"g3-u1-l1":1,"g3-u1-l2":1}',
  wb_sc5_3: '[{"qid":"lq_g3-u1-l1","pct":90},{"qid":"lq_g3-u1-l2","pct":75}]',
  wb_mastery_3: '{"place_value":{"attempts":6,"correct":5}}',
  mmr_mastery_v1_3: '{"err_place_value":{"attempts":4,"correct":1}}',
  wb_streak: '{"current":5,"longest":9,"lastDate":"2026-07-10"}',
};

describe('a Grade 3 profile enters recovery, not Grade 2', () => {
  test('recovery is required', () => {
    expect(needsGradeRecovery(store({ mmr_grade: '3', ...G3_PROGRESS }))).toBe(true);
  });

  // The correction. Detection is read-only; nothing decides for the parent.
  test('mmr_grade is NOT silently rewritten to "2"', () => {
    const s = store({ mmr_grade: '3', ...G3_PROGRESS });
    needsGradeRecovery(s);
    expect(s.getItem('mmr_grade')).toBe('3');
    expect(s.getItem('mmr_grade')).not.toBe('2');
  });

  test('Grade 3 progress is byte-for-byte unchanged', () => {
    const s = store({ mmr_grade: '3', ...G3_PROGRESS });
    const before = JSON.stringify(s._all());
    needsGradeRecovery(s);
    needsGradeRecovery(s);
    expect(JSON.stringify(s._all())).toBe(before);
    for (const [k, v] of Object.entries(G3_PROGRESS)) {
      expect(s.getItem(k)).toBe(v);
    }
  });

  test('recovery reopens every time until a supported grade is chosen', () => {
    const s = store({ mmr_grade: '3', ...G3_PROGRESS });
    for (let visit = 0; visit < 5; visit++) {
      expect(needsGradeRecovery(s)).toBe(true);
    }
  });
});

describe('no content loads before the parent chooses', () => {
  const nav = read('src/nav.js');

  test('the recovery screen is a real screen', () => {
    expect(nav).toMatch(/'grade-recovery-screen'/);
    expect(read('index.html')).toMatch(/<div id="grade-recovery-screen" class="sc">/);
  });

  // The hard boundary. Every learning surface routes through show().
  test('every learning screen is blocked while recovery is pending', () => {
    const m = nav.match(/const _LEARNING_SCREENS = \[([^\]]+)\]/);
    expect(m).toBeTruthy();
    const blocked = m[1].split(',').map((s) => s.trim().replace(/'/g, ''));
    // No Grade 2 lesson, quiz or unit can start before the choice is made.
    expect(blocked).toEqual(expect.arrayContaining([
      'home', 'unit-screen', 'lesson-screen', 'quiz-screen', 'results-screen', 'history-screen',
    ]));
  });

  test('show() redirects to recovery rather than silently doing nothing', () => {
    const fn = nav.match(/function show\(id\)\{[\s\S]*?\n  \/\/ Guard: parent-screen/)[0];
    expect(fn).toMatch(/_LEARNING_SCREENS\.indexOf\(id\) !== -1/);
    expect(fn).toMatch(/needsGradeRecovery\(localStorage\)/);
    expect(fn).toMatch(/id = 'grade-recovery-screen'/);
  });

  // Redirecting (not returning) is what makes boot fast-paths, resume banners
  // and restored deep state all land on recovery.
  test('the guard runs before the screen is activated', () => {
    const guardAt = nav.indexOf('needsGradeRecovery(localStorage)');
    const activateAt = nav.indexOf("el.classList.add('on')");
    expect(guardAt).toBeGreaterThan(-1);
    expect(activateAt).toBeGreaterThan(guardAt);
  });

  test('production ships no Grade 3 curriculum to load', () => {
    // Belt and braces with the bundle exclusion: even in recovery there is no
    // Grade 3 content in a prod build.
    expect(read('build.js')).toMatch(/const G3_FILES = DEV_MODE/);
  });
});

describe('the choice belongs to a parent', () => {
  const settings = read('src/settings.js');
  const fn = settings.match(/function chooseRecoveryGrade\(g\)\{[\s\S]*?\n}/)[0];

  test('an unsupported grade cannot be chosen', () => {
    expect(fn).toMatch(/!isGradeLaunched\(g\)/);
  });

  test('the choice is gated by the existing parent access control', () => {
    expect(fn).toMatch(/if\(!isParentUnlocked\(\)\)/);
    expect(fn).toMatch(/_openParentAuth\(\)/);
  });

  // A child must not be able to move themselves onto another grade.
  test('nothing is applied until an adult confirms', () => {
    const gateAt = fn.indexOf('isParentUnlocked()');
    const applyAt = fn.indexOf('_applyRecoveryGrade(g)');
    expect(gateAt).toBeGreaterThan(-1);
    expect(applyAt).toBeGreaterThan(gateAt);
    // The pending choice is parked, not committed.
    expect(fn).toMatch(/_pendingRecoveryGrade = g;/);
  });

  test('a confirmed choice is applied from the parent-auth success path', () => {
    expect(settings).toMatch(/if\(_applyPendingRecoveryGrade\(\)\) return;/);
    const applyFn = settings.match(/function _applyPendingRecoveryGrade\(\)\{[\s\S]*?\n}/)[0];
    // Re-validated at apply time, so a stale pending value cannot slip through.
    expect(applyFn).toMatch(/!isGradeLaunched\(g\)/);
  });

  test('guests go through the same adult gate — no second, weaker path', () => {
    // The parent PIN exists for local/guest use too, so there is one path.
    expect(fn).not.toMatch(/guest/i);
    expect((settings.match(/_openParentAuth\(\)/g) || []).length).toBeGreaterThan(0);
  });
});

describe('applying a chosen grade', () => {
  const settings = read('src/settings.js');
  const applyFn = settings.match(/function _applyRecoveryGrade\(g\)\{[\s\S]*?\n}/)[0];

  test.each([['K'], ['1'], ['2']])('grade %s is a valid choice', (g) => {
    const html = read('index.html');
    expect(html).toMatch(new RegExp(`data-action="chooseRecoveryGrade" data-arg="${g}"`));
  });

  test('the recovery screen offers exactly K, Grade 1 and Grade 2', () => {
    const html = read('index.html');
    const screen = html.match(/<div id="grade-recovery-screen"[\s\S]*?\n<\/div>\n\n<div id="home"/)[0];
    const args = (screen.match(/data-arg="([^"]+)"/g) || []).map((a) => a.split('"')[1]);
    expect(args).toEqual(['K', '1', '2']);
  });

  test('records the previous grade', () => {
    expect(applyFn).toMatch(/setItem\('mmr_grade_prev', prev\)/);
  });

  test('delegates to switchGrade so the grade persists normally afterward', () => {
    // switchGrade pushes progress, writes mmr_grade and reloads — the same path
    // a normal grade switch takes, so nothing about recovery is special-cased.
    expect(applyFn).toMatch(/switchGrade\(g\)/);
  });

  test('applying touches no progress keys', () => {
    // Compare CODE only — the comment above the function names those keys
    // precisely to document that it does not write them.
    const code = applyFn.replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/wb_done5|wb_sc5|wb_mastery|mmr_mastery_v1/);
    expect(code).not.toMatch(/removeItem|clear\(\)/);
    // The only writes are the audit trail and the new grade.
    const writes = code.match(/setItem\('([^']+)'/g) || [];
    expect(writes).toEqual(["setItem('mmr_grade_prev'"]);
  });

  test('switchGrade permits moving OFF an unsupported grade', () => {
    // The guard checks the DESTINATION only, so '3' -> 'K' is allowed. If it
    // checked the source too, recovery would be a dead end.
    const auth = read('src/auth.js');
    const sw = auth.match(/async function switchGrade\(newGrade\)\{[\s\S]*?\n}/)[0];
    expect(sw).toMatch(/isGradeLaunched\(newGrade\)/);
    expect(sw).not.toMatch(/isGradeLaunched\(current\)/);
  });
});

// Regression: found by driving the real app, not by reading the source.
//
// The recovery screen gates the choice behind isParentUnlocked(), but the
// settings screen carries its own grade picker, and index.html invokes it via
// inline onclick="pickGrade('2')". A child who reached settings could pick a
// grade themselves and switchGrade would honour it — the parent gate bypassed
// entirely, and the recovery screen never seen again. The guard therefore
// belongs on the WRITE, which every path funnels through, not on a screen.
describe('the parent gate cannot be bypassed via the settings grade picker', () => {
  const auth = read('src/auth.js');
  const sw = auth.match(/async function switchGrade\(newGrade\)\{[\s\S]*?\n}/)[0];

  test('switchGrade itself refuses a grade change during recovery without a parent', () => {
    expect(sw).toMatch(/needsGradeRecovery\(localStorage\)/);
    expect(sw).toMatch(/!isParentUnlocked\(\)/);
  });

  test('the refusal returns the student to recovery rather than failing silently', () => {
    expect(sw).toMatch(/show\('grade-recovery-screen'\)/);
  });

  test('the guard runs before mmr_grade is written', () => {
    const guardAt = sw.indexOf('needsGradeRecovery(localStorage)');
    const writeAt = sw.indexOf("localStorage.setItem('mmr_grade'");
    expect(guardAt).toBeGreaterThan(-1);
    expect(writeAt).toBeGreaterThan(guardAt);
  });

  // With a parent present the same path must work — recovery is not a dead end.
  test('an unlocked parent is not blocked', () => {
    expect(sw).toMatch(/needsGradeRecovery\(localStorage\)\s*\n?\s*&&[\s\S]*?!isParentUnlocked\(\)/);
  });
});

describe('sibling profiles are unaffected', () => {
  test('recovery keys off this device active grade, not the parent account', () => {
    // mmr_grade is per-device/per-active-session. A sibling on Grade 2 has
    // their own profile row and their own resolved grade; nothing here touches
    // student_profiles or another profile's cache.
    expect(needsGradeRecovery(store({ mmr_grade: '2' }))).toBe(false);
    expect(needsGradeRecovery(store({ mmr_grade: 'K' }))).toBe(false);
  });

  test('recovery writes nothing that could affect another profile', () => {
    const s = store({ mmr_grade: '3', mmr_profile_grade_sibling: '2' });
    needsGradeRecovery(s);
    expect(s.getItem('mmr_profile_grade_sibling')).toBe('2');
  });
});

describe('recovery screen copy', () => {
  const html = read('index.html');
  const screen = html.match(/<div id="grade-recovery-screen"[\s\S]*?\n<\/div>\n\n<div id="home"/)[0];

  test('explains the situation and that the work is kept', () => {
    expect(screen).toMatch(/previous grade is not currently available/i);
    expect(screen).toMatch(/progress has been preserved/i);
    expect(screen).toMatch(/Choose a supported grade to continue/i);
  });

  test('says an adult must choose', () => {
    expect(screen).toMatch(/parent or guardian/i);
  });

  test('no emojis in new student-facing UI', () => {
    expect(screen).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  test('exposes no lesson or unit navigation', () => {
    expect(screen).not.toMatch(/openUnit|openLesson|startLessonQuiz|goHome|data-action="open/);
  });
});
