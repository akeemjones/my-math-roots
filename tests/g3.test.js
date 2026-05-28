'use strict';
// ════════════════════════════════════════════════════════════════════════════
//  Grade 3 scaffold tests
//  - Pure-Node, mirrors tests/dashboard.test.js conventions.
//  - Grade-enablement + dashboard routing assertions require ../dashboard/dashboard.js.
//  - Data-layer assertions load src/data/shared_g3.js + g3/u*.js (+ cbe.js when
//    present) in a single vm script so top-level `const` bindings resolve across
//    files exactly as they do when the browser bundles them.
// ════════════════════════════════════════════════════════════════════════════
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const D = require('../dashboard/dashboard.js');
const {
  normalizeGrade, _gradeBand, _unitsMetaForBand, _G3_UNITS_META,
  _lessonDisplayName, _lessonIdBand, _inferScoreGrade,
  _parseUnlockSettings, _dbProgressCacheKeysForReset
} = D;

const ROOT = path.join(__dirname, '..');

// Expected lesson counts per unit (8+8+10+8+11+10+8+12+12+10 = 97).
const EXPECTED_LESSON_COUNTS = [8, 8, 10, 8, 11, 10, 8, 12, 12, 10];
const EXPECTED_TOTAL_LESSONS = 97;

// Load the G3 data layer into a sandbox. Concatenating the source files into one
// vm script mirrors the browser's single-bundle scope (shared_g3.js defines the
// shells + helpers; g3/u*.js call _mergeG3UnitData against them).
function loadG3() {
  let src = fs.readFileSync(path.join(ROOT, 'src/data/shared_g3.js'), 'utf8');
  for (let n = 1; n <= 10; n++) {
    const p = path.join(ROOT, 'src/data/g3/u' + n + '.js');
    if (fs.existsSync(p)) src += '\n' + fs.readFileSync(p, 'utf8');
  }
  const cbe = path.join(ROOT, 'src/data/g3/cbe.js');
  if (fs.existsSync(cbe)) src += '\n' + fs.readFileSync(cbe, 'utf8');
  const diag = path.join(ROOT, 'src/data/g3/unit0_diagnostic.js');
  if (fs.existsSync(diag)) src += '\n' + fs.readFileSync(diag, 'utf8');
  // Surface the symbols the tests read onto the context global.
  src += '\nthis._UNITS_DATA_G3 = _UNITS_DATA_G3;';
  src += '\nthis._sampleG3UnitTestAttempt = _sampleG3UnitTestAttempt;';
  src += '\nthis._G3_CBE_BANK = (typeof _G3_CBE_BANK !== "undefined") ? _G3_CBE_BANK : null;';
  src += '\nthis._G3_UNIT0_DIAGNOSTIC = (typeof _G3_UNIT0_DIAGNOSTIC !== "undefined") ? _G3_UNIT0_DIAGNOSTIC : null;';
  const ctx = {
    window: {}, console,
    document: { createElement: function () { return {}; }, head: { appendChild: function () {} } },
    localStorage: { getItem: function () { return null; }, setItem: function () {} }
  };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx;
}

describe('G3 grade enablement (persistence / no fallback to Grade 2)', () => {
  test('normalizeGrade("3") === "3" — never falls back to "2"', () => {
    expect(normalizeGrade('3')).toBe('3');
    expect(normalizeGrade(3)).toBe('3');
  });
  test('_gradeBand maps 3 / g3 / "grade 3" → "g3"', () => {
    expect(_gradeBand('3')).toBe('g3');
    expect(_gradeBand('g3')).toBe('g3');
    expect(_gradeBand('grade 3')).toBe('g3');
  });
  test('_inferScoreGrade resolves grade 3 by field and by id prefix', () => {
    expect(_inferScoreGrade({ grade: '3' })).toBe('g3');
    expect(_inferScoreGrade({ qid: 'lq_g3-u1-l1' })).toBe('g3');
    expect(_inferScoreGrade({ sourceUnitId: 'g3u1' })).toBe('g3');
  });
});

describe('G3 dashboard routing + metadata', () => {
  test('_unitsMetaForBand("g3") returns _G3_UNITS_META', () => {
    expect(_unitsMetaForBand('g3')).toBe(_G3_UNITS_META);
  });
  test('_G3_UNITS_META has 10 units with the expected per-unit lesson counts', () => {
    expect(_G3_UNITS_META).toHaveLength(10);
    expect(_G3_UNITS_META.map(u => u.lessons.length)).toEqual(EXPECTED_LESSON_COUNTS);
  });
  test('_G3_UNITS_META has exactly 97 lesson display names', () => {
    const total = _G3_UNITS_META.reduce((n, u) => n + u.lessons.length, 0);
    expect(total).toBe(EXPECTED_TOTAL_LESSONS);
  });
  test('_lessonDisplayName resolves G3 ids; _lessonIdBand tags them g3', () => {
    const r = _lessonDisplayName('g3-u1-l1');
    expect(r).not.toBeNull();
    expect(r.unit).toBe('Place Value to 100,000');
    expect(r.lesson).toBeTruthy();
    expect(_lessonDisplayName('g3-u8-l11').lesson).toBe('Perimeter');
    expect(_lessonIdBand('g3-u1-l1')).toBe('g3');
    expect(_lessonIdBand('g3-u10-l10')).toBe('g3');
  });
});

describe('G3 unlock-state + reset cache coverage', () => {
  test('_parseUnlockSettings exposes a g3 slot', () => {
    const parsed = _parseUnlockSettings({});
    expect(parsed.byGrade.g3).toBeDefined();
    expect(parsed.byGrade.g3).toEqual({ freeMode: false, units: [], lessons: {} });
  });
  test('_dbProgressCacheKeysForReset sweeps grade-3 caches', () => {
    const keys = _dbProgressCacheKeysForReset('3', true);
    expect(keys).toContain('wb_sc5_3');
    expect(keys).toContain('wb_done5_3');
    expect(keys).toContain('wb_mastery_3');
  });
});

describe('G3 grade selector markup (index.html)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  test('both grade pickers expose a clickable Grade 3 button', () => {
    const matches = html.match(/data-grade="3"[^>]*onclick="pickGrade\('3'\)"/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2); // hero + settings pickers
  });
  test('Grade 3 is no longer a disabled "Soon" option', () => {
    expect(html).not.toMatch(/grade-picker-soon">Grade 3/);
  });
});

describe('G3 data layer (10 units / 97 lesson shells / unit-test wiring)', () => {
  const ctx = loadG3();

  test('data files load without throwing', () => {
    expect(() => loadG3()).not.toThrow();
  });
  test('all 10 units present with canonical g3u<n> ids', () => {
    expect(ctx._UNITS_DATA_G3).toHaveLength(10);
    ctx._UNITS_DATA_G3.forEach((u, i) => {
      expect(u.id).toBe('g3u' + (i + 1));
      expect(typeof u.name).toBe('string');
      expect(u.teks).toMatch(/TEKS 3\./);
    });
  });
  test('exactly 97 lesson shells, all with canonical g3-u<n>-l<m> ids + TEKS', () => {
    const lessons = ctx._UNITS_DATA_G3.flatMap(u => u.lessons);
    expect(lessons).toHaveLength(EXPECTED_TOTAL_LESSONS);
    ctx._UNITS_DATA_G3.forEach((u, ui) => {
      expect(u.lessons.length).toBe(EXPECTED_LESSON_COUNTS[ui]);
      u.lessons.forEach((l, li) => {
        expect(l.id).toBe('g3-u' + (ui + 1) + '-l' + (li + 1));
        expect(l.teks).toMatch(/TEKS 3\./);
        expect(Array.isArray(l.defaultTags)).toBe(true);
      });
    });
  });
  test('every unit registers the lesson-bank-sourced unit test', () => {
    ctx._UNITS_DATA_G3.forEach(u => {
      expect(u.unitTest).toBeDefined();
      expect(u.unitTest.sourceRule).toBe('all_lesson_quizbanks');
      expect(Array.isArray(u.testBank)).toBe(true); // assembled pool (empty until lessons populate)
    });
  });
  test('lesson shells carry err_-prefixed intervention tags', () => {
    const tags = new Set();
    ctx._UNITS_DATA_G3.forEach(u => u.lessons.forEach(l => {
      (l.defaultIntervention && l.defaultIntervention.retry && l.defaultIntervention.retry.matchTags || [])
        .forEach(t => tags.add(t));
    }));
    expect(tags.size).toBeGreaterThan(0);
    expect([...tags].every(t => t.startsWith('err_'))).toBe(true);
    // representative families from the spec are present
    expect(tags.has('err_place_value_digit_confusion')).toBe(true);
    expect(tags.has('err_area_perimeter_confusion')).toBe(true);
  });
});
