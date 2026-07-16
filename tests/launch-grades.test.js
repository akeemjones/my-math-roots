'use strict';

// =============================================================================
//  LAUNCH GRADE GATING
//
//  Only validated grades may reach customers. K / 1 / 2 are complete; Grade 3
//  is 8% built (89 of 97 lessons are empty shells) and the dashboard never
//  supported it (see the DEFECT suites in tests/g3.test.js). Grades 4-5 do not
//  exist.
//
//  This pins BOTH directions:
//   - no customer path exposes or persists an unlaunched grade
//   - unfinished content is not deleted, existing Grade 3 students are not
//     silently downgraded, and a localhost dev flag still reopens Grade 3
//
//  The dashboard pieces run against the production bundle (src/dashboard.js)
//  via the harness, not the retired dashboard/dashboard.js fork.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { loadDashboard, makeStorage } = require('./dashboard-harness.js');
const { isGradeLaunched, launchGrades } = require('../src/app-config.js');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('launch grade policy', () => {
  test('K, 1 and 2 ship; 3, 4 and 5 do not', () => {
    expect(launchGrades()).toEqual(['K', '1', '2']);
    expect(isGradeLaunched('K')).toBe(true);
    expect(isGradeLaunched('1')).toBe(true);
    expect(isGradeLaunched('2')).toBe(true);
    expect(isGradeLaunched('3')).toBe(false);
    expect(isGradeLaunched('4')).toBe(false);
    expect(isGradeLaunched('5')).toBe(false);
  });
});

describe('parent dashboard grade controls', () => {
  const D = loadDashboard(makeStorage());

  describe('view-grade filter', () => {
    test('offers only launched grades', () => {
      const html = D._dbViewGradeOptions('g2');
      expect(html).toContain('value="k"');
      expect(html).toContain('value="g1"');
      expect(html).toContain('value="g2"');
      expect(html).not.toContain('value="g3"');
    });

    test('marks the active band selected', () => {
      expect(D._dbViewGradeOptions('g1')).toMatch(/value="g1" selected/);
    });

    // The g3 option was dead anyway: _setDashboardViewGrade runs the value
    // through _gradeBand, which returns null for g3 and bails. Selecting
    // "Grade 3" silently did nothing. Removing it makes the control honest.
    test('the removed g3 option was inert — _gradeBand never yields g3', () => {
      expect(D._gradeBand('g3')).toBe(null);
    });
  });

  describe('edit-student grade picker', () => {
    test('Grade 1 is selectable — it is complete, and was wrongly disabled', () => {
      const html = D._dbEditGradeOptions('2');
      expect(html).toContain('<option value="1"');
      // The reversal that shipped on master: G1 "(coming soon)" while G3 was live.
      expect(html).not.toMatch(/<option value="1"[^>]*disabled/);
      expect(html).not.toContain('Grade 1 (coming soon)');
    });

    test('Grade 3 is not offered to a student on a supported grade', () => {
      const html = D._dbEditGradeOptions('2');
      expect(html).not.toContain('<option value="3"');
      expect(html).toContain('<option value="K"');
      expect(html).toContain('<option value="2"');
    });

    test('Grades 4 and 5 remain visible but disabled', () => {
      const html = D._dbEditGradeOptions('2');
      expect(html).toMatch(/<option value="4" disabled>Grade 4 \(coming soon\)/);
      expect(html).toMatch(/<option value="5" disabled>Grade 5 \(coming soon\)/);
    });

    // The trap: dropping the selected option would make the select fall back to
    // its first entry (Kindergarten), so a parent editing the child's NAME and
    // pressing Save would silently move them to a different grade.
    test('an existing Grade 3 student keeps a selected, disabled Grade 3 entry', () => {
      const html = D._dbEditGradeOptions('3');
      expect(html).toMatch(/<option value="3" selected disabled>/);
      expect(html).toContain('no longer available');
      // The first enabled option must not be pre-selected in their place.
      expect(html).not.toMatch(/<option value="K" selected/);
    });

    test('supported grades are still offered to that student as the way out', () => {
      const html = D._dbEditGradeOptions('3');
      expect(html).toContain('<option value="K"');
      expect(html).toContain('<option value="1"');
      expect(html).toContain('<option value="2"');
    });
  });

  describe('unsupported-grade recovery notice', () => {
    test('shown for a Grade 3 student', () => {
      const html = D._dbUnsupportedGradeNotice('3');
      expect(html).toContain('Grade 3 is not available right now');
    });

    // Nobody should fear that switching grade discards their child's work.
    test('states that existing work is saved, not deleted', () => {
      const html = D._dbUnsupportedGradeNotice('3');
      expect(html).toMatch(/saved and is not deleted/);
      expect(html).toMatch(/choose a supported grade/i);
    });

    test('absent for supported grades and for unset grades', () => {
      expect(D._dbUnsupportedGradeNotice('K')).toBe('');
      expect(D._dbUnsupportedGradeNotice('1')).toBe('');
      expect(D._dbUnsupportedGradeNotice('2')).toBe('');
      expect(D._dbUnsupportedGradeNotice(null)).toBe('');
      expect(D._dbUnsupportedGradeNotice('')).toBe('');
    });
  });

  describe('_dbIsUnsupportedGrade', () => {
    test('flags withdrawn grades only', () => {
      expect(D._dbIsUnsupportedGrade('3')).toBe(true);
      expect(D._dbIsUnsupportedGrade('4')).toBe(true);
      expect(D._dbIsUnsupportedGrade('K')).toBe(false);
      expect(D._dbIsUnsupportedGrade('1')).toBe(false);
      expect(D._dbIsUnsupportedGrade('2')).toBe(false);
    });

    test('treats missing grade as supported — never blocks a profile with no grade set', () => {
      expect(D._dbIsUnsupportedGrade(null)).toBe(false);
      expect(D._dbIsUnsupportedGrade(undefined)).toBe(false);
      expect(D._dbIsUnsupportedGrade('')).toBe(false);
    });
  });
});

// Source contracts. These paths need a live Supabase client or a real DOM to
// execute, so pin them at the source level — the convention already used by
// tests/learning-calendar-hydrate.test.js and tests/parent-dashboard-streak.test.js.
describe('write-path guards (source contracts)', () => {
  test('dbEditSave refuses to persist an unsupported grade', () => {
    const src = read('src/dashboard.js');
    const fn = src.match(/async function dbEditSave[\s\S]*?\n}/);
    expect(fn).toBeTruthy();
    expect(fn[0]).toMatch(/_dbIsUnsupportedGrade\(nNew\)/);
    // The guard must return BEFORE the Supabase update.
    const guardAt = fn[0].indexOf('_dbIsUnsupportedGrade(nNew)');
    const updateAt = fn[0].indexOf("_supa.from('student_profiles').update");
    expect(guardAt).toBeGreaterThan(-1);
    expect(updateAt).toBeGreaterThan(guardAt);
  });

  test('switchGrade refuses an unlaunched grade before writing mmr_grade', () => {
    const src = read('src/auth.js');
    const fn = src.match(/async function switchGrade[\s\S]*?\n}/);
    expect(fn).toBeTruthy();
    expect(fn[0]).toMatch(/isGradeLaunched\(newGrade\)/);
    const guardAt = fn[0].indexOf('isGradeLaunched(newGrade)');
    const writeAt = fn[0].indexOf("localStorage.setItem('mmr_grade'");
    expect(guardAt).toBeGreaterThan(-1);
    expect(writeAt).toBeGreaterThan(guardAt);
  });

  test('pickGrade refuses an unlaunched grade before delegating', () => {
    const src = read('src/settings.js');
    const fn = src.match(/function pickGrade[\s\S]*?\n}/);
    expect(fn).toBeTruthy();
    expect(fn[0]).toMatch(/isGradeLaunched\(val\)/);
  });

  test('the hero picker is gated on every boot via buildHome', () => {
    const src = read('src/home.js');
    expect(src).toMatch(/_applyLaunchGradeVisibility\(\)/);
  });

  test('the settings picker is gated whenever the list refreshes', () => {
    const src = read('src/settings.js');
    const fn = src.match(/function _refreshGradeList[\s\S]*?\n}/);
    expect(fn[0]).toMatch(/_applyLaunchGradeVisibility\(\)/);
  });

  // A student already on Grade 3 must never be trapped: the picker keeps their
  // current grade visible so they can move off it.
  test('grade visibility never hides the grade the student is currently on', () => {
    const src = read('src/settings.js');
    const fn = src.match(/function _applyLaunchGradeVisibility[\s\S]*?\n}/);
    expect(fn[0]).toMatch(/isGradeLaunched\(g\)\s*\|\|\s*g === active/);
  });
});

describe('Add Student grade selection', () => {
  const D = loadDashboard(makeStorage());

  // Before: every new profile was created as Grade 2, silently, with no picker.
  // The parent only found out by opening the Edit sheet afterwards.
  test('offers all three launch grades', () => {
    const html = D._dbAddGradeOptions();
    expect(html).toContain('<option value="K">Kindergarten</option>');
    expect(html).toContain('<option value="1">Grade 1</option>');
    expect(html).toContain('<option value="2">Grade 2</option>');
  });

  test('offers no withdrawn or unbuilt grade', () => {
    const html = D._dbAddGradeOptions();
    expect(html).not.toContain('value="3"');
    expect(html).not.toContain('value="4"');
    expect(html).not.toContain('value="5"');
  });

  test('nothing is pre-selected — the parent must choose', () => {
    expect(D._dbAddGradeOptions()).not.toContain('selected');
    const src = read('src/dashboard.js');
    // The placeholder is what makes the choice deliberate.
    expect(src).toContain('<option value="" selected disabled>Choose a grade…</option>');
  });

  test.each([['K'], ['1'], ['2']])('grade %s is accepted by the validator', (g) => {
    expect(isGradeLaunched(g)).toBe(true);
  });

  test.each([['3'], ['4'], ['5']])('grade %s is rejected', (g) => {
    expect(isGradeLaunched(g)).toBe(false);
  });

  test.each([[''], ['banana'], ['2x'], ['０'], ['K3'], ['-1'], ['3.0'], [' 3 ']])(
    'malformed grade value %p is rejected',
    (v) => {
      // ' 3 ' normalizes to the real, withdrawn grade 3 — still rejected.
      expect(isGradeLaunched(v)).toBe(false);
    }
  );

  describe('write path (source contract)', () => {
    const fn = read('src/dashboard.js').match(/async function dbAddSave[\s\S]*?\n}/)[0];

    test('reads the parent selection instead of hardcoding Grade 2', () => {
      expect(fn).toMatch(/getElementById\('db-add-grade'\)/);
      expect(fn).toContain('grade: addGradeNorm');
      expect(fn).not.toMatch(/grade:\s*'2',\s*\/\/ default/);
    });

    test('requires a grade before saving', () => {
      expect(fn).toMatch(/if \(!addGrade\)/);
    });

    test('validates against launchGrades and rejects unsupported values', () => {
      expect(fn).toMatch(/isGradeLaunched\(addGrade\)/);
    });

    test('the guard runs before the Supabase insert, so a bypassed UI cannot persist', () => {
      const guardAt = fn.indexOf('isGradeLaunched(addGrade)');
      const insertAt = fn.indexOf("from('student_profiles')");
      expect(guardAt).toBeGreaterThan(-1);
      expect(insertAt).toBeGreaterThan(guardAt);
    });

    test('the student cap and profile-creation behavior are preserved', () => {
      // The cap is enforced server-side by a fail-closed Postgres trigger; the
      // client path must still go through the same insert + PIN + avatar flow.
      expect(fn).toMatch(/_dbAddPinBuffer/);
      expect(fn).toMatch(/pin_hash/);
      expect(fn).toMatch(/parent_id/);
    });

    test('the saved grade is mirrored to the per-profile cache so it survives reload', () => {
      expect(fn).toMatch(/_dbWriteProfileGrade\(newRows\[0\]\.id/);
    });
  });

  // Siblings are independent rows; nothing in the resolver couples them.
  test('sibling profiles may hold different supported grades', () => {
    const s = makeStorage();
    const D2 = loadDashboard(s);
    D2._dbWriteProfileGrade('kid-a', 'K');
    D2._dbWriteProfileGrade('kid-b', '1');
    D2._dbWriteProfileGrade('kid-c', '2');
    expect(D2._dbReadProfileGrade('kid-a')).toBe('K');
    expect(D2._dbReadProfileGrade('kid-b')).toBe('1');
    expect(D2._dbReadProfileGrade('kid-c')).toBe('2');
  });

  test('a profile grade persists across a reload (separate storage read)', () => {
    const s = makeStorage();
    loadDashboard(s)._dbWriteProfileGrade('kid-a', 'K');
    // Fresh bundle evaluation against the same storage == a page reload.
    expect(loadDashboard(s)._dbReadProfileGrade('kid-a')).toBe('K');
  });
});

describe('no customer-facing grade advertises an unsupported grade', () => {
  const html = read('index.html');

  test('Grade 4 and Grade 5 "Soon" entries are gone from both pickers', () => {
    expect(html).not.toContain('grade-picker-soon');
    expect(html).not.toContain('grade-soon-tag');
    expect(html).not.toMatch(/Grade 4\s*<span/);
    expect(html).not.toMatch(/Grade 5\s*<span/);
  });

  test('in-app copy no longer markets K-5', () => {
    expect(html).not.toContain('K-5');
    expect(read('manifest.json')).not.toContain('K-5');
    expect(read('src/boot.js')).not.toContain('K-5 REVIEW');
  });

  test('both pickers still offer exactly the launch grades', () => {
    const opts = html.match(/data-grade="[^"]+"/g) || [];
    const grades = [...new Set(opts.map((o) => o.split('"')[1]))];
    // Grade 3 remains in markup solely so an existing G3 student is not trapped;
    // it is hidden at runtime by _applyLaunchGradeVisibility.
    expect(grades.sort()).toEqual(['1', '2', '3', 'K']);
    expect(grades).not.toContain('4');
    expect(grades).not.toContain('5');
  });
});

describe('unfinished content is withdrawn, not destroyed', () => {
  test('Grade 3 data files are still in the repo', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/data/g3/u1.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/data/shared_g3.js'))).toBe(true);
  });

  test('Grade 3 is still built into DEV bundles', () => {
    const build = read('build.js');
    expect(build).toMatch(/const G3_FILES = DEV_MODE[\s\S]*?data\/shared_g3\.js/);
  });

  test('Grade 3 can be reopened in an authorized dev build', () => {
    const cfgSrc = read('src/app-config.js');
    // isGradeLaunched consults the per-grade dev override before LAUNCH_GRADES.
    expect(cfgSrc).toMatch(/_configDevOverride\('GRADE_' \+ tok\)/);
  });
});

describe('production bundle excludes the unfinished Grade 3 curriculum', () => {
  const build = read('build.js');

  test('the G3 source files are dev-only in the concat order', () => {
    expect(build).toMatch(/const G3_FILES = DEV_MODE\s*\?\s*\[[^\]]*'data\/shared_g3\.js'[^\]]*\]\s*:\s*\[\]/);
    // ...and are no longer unconditionally listed.
    expect(build).not.toMatch(/'data\/shared_g1\.js','data\/shared_g3\.js'/);
  });

  test('the G3 lazy data files are not copied for production', () => {
    expect(build).toMatch(/if \(!DEV_MODE\) \{[\s\S]*?data\/g3[\s\S]*?rmSync/);
  });

  test('a prod build sweeps G3 data left behind by a previous dev build', () => {
    expect(build).toMatch(/rmSync\(staleG3, \{ recursive: true, force: true \}\)/);
  });

  test('the build-mode token is substituted at build time', () => {
    expect(build).toMatch(/%%BUILD_MODE%%\/g, DEV_MODE \? 'dev' : 'prod'/);
  });

  // Every G3 global consumer outside the G3 data files must tolerate absence.
  test('boot.js guards its Grade 3 dispatch', () => {
    const boot = read('src/boot.js');
    expect(boot).toMatch(/_g === '3' && typeof _applyGrade3Grade === 'function'/);
  });

  test('quiz.js already guards the G3 CBE bank', () => {
    const quiz = read('src/quiz.js');
    expect(quiz).toMatch(/typeof _g3CbeGateOpen === 'function'/);
    expect(quiz).toMatch(/typeof _G3_CBE_BANK === 'undefined'/);
  });

  test('the dev-only global check does not report absent G3 globals as missing', () => {
    const boot = read('src/boot.js');
    expect(boot).toMatch(/_G3_ONLY_GLOBALS/);
    expect(boot).toMatch(/if \(!g3Bundled && _G3_ONLY_GLOBALS\.indexOf\(name\) !== -1\) continue;/);
  });

  // _G3_UNITS_META lives in dashboard.js, not the G3 data files, so the
  // dashboard's G3 lesson-name resolution is unaffected by the exclusion.
  test('dashboard G3 metadata is self-contained and unaffected', () => {
    const dash = read('src/dashboard.js');
    expect(dash).toMatch(/var _G3_UNITS_META = \[/);
  });
});
