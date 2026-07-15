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

describe('unfinished content is withdrawn, not destroyed', () => {
  test('Grade 3 data files are still in the repo', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/data/g3/u1.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/data/shared_g3.js'))).toBe(true);
  });

  test('Grade 3 is still built into the bundle for dev use', () => {
    const build = read('build.js');
    expect(build).toContain('data/shared_g3.js');
  });

  test('Grade 3 can be reopened on localhost with a dev flag', () => {
    const cfgSrc = read('src/app-config.js');
    // isGradeLaunched consults the per-grade dev override before LAUNCH_GRADES.
    expect(cfgSrc).toMatch(/_configDevOverride\('GRADE_' \+ tok\)/);
  });
});
