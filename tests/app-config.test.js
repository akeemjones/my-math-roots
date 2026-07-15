'use strict';

// =============================================================================
//  APP CONFIG — central product configuration
//
//  Pins the simplified product surface: which features the shipping build
//  exposes, which grades are customer-visible, and that flipping the master
//  switch off restores current-master behavior exactly.
//
//  Two harnesses are used, matching existing repo convention:
//   - require() for the shipping configuration (the module is pure, so this
//     is safe and is itself a regression guard against parse-time DOM access).
//   - readFileSync + vm for variants that need a patched source or fake
//     browser globals (the config object is frozen by design).
// =============================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  APP_CONFIG,
  _LEGACY_DEFAULTS,
  isFeatureOn,
  isGradeLaunched,
  normalizeGradeToken,
  launchGrades,
} = require('../src/app-config.js');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'app-config.js'), 'utf8');

// Evaluate app-config.js in a sandbox, optionally patching the source and
// injecting fake browser globals.
function loadConfig({ patch, location, localStorage } = {}) {
  const src = patch ? patch(SRC) : SRC;
  const sandbox = { module: { exports: {} } };
  if (location) sandbox.location = location;
  if (localStorage) sandbox.localStorage = localStorage;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.module.exports;
}

function fakeStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return { getItem: (k) => (map.has(k) ? map.get(k) : null) };
}

// Every flag the simplification spec requires the config to govern.
const REQUIRED_FLAGS = [
  'DEMO_MODE',
  'STREAK_CALENDAR',
  'ACTIVITY_REWARDS',
  'AI_PARENT_REPORT',
  'AI_HINTS',
  'PUSH_NOTIFICATIONS',
  'REMINDERS',
  'SOUND_CONTROLS',
  'CUSTOM_QUIZ_LENGTHS',
  'QUIZ_TIMERS',
  'FINAL_TESTS',
  'HARD_PROGRESSION_LOCKS',
  'ACCESS_CONTROL_GRIDS',
  'INTERVENTION_OVERLAYS',
  'LEGACY_DASHBOARD_SECTIONS',
];

describe('module shape', () => {
  test('requires cleanly with no DOM — the module is pure at parse time', () => {
    expect(typeof globalThis.location).toBe('undefined');
    expect(() => require('../src/app-config.js')).not.toThrow();
  });

  test('APP_CONFIG and its grade list are frozen', () => {
    expect(Object.isFrozen(APP_CONFIG)).toBe(true);
    expect(Object.isFrozen(APP_CONFIG.LAUNCH_GRADES)).toBe(true);
    expect(Object.isFrozen(_LEGACY_DEFAULTS)).toBe(true);
  });

  test('governs every flag the simplification requires', () => {
    for (const flag of REQUIRED_FLAGS) {
      expect(APP_CONFIG).toHaveProperty(flag);
      expect(_LEGACY_DEFAULTS).toHaveProperty(flag);
    }
  });
});

describe('shipping configuration exposes only the intended product', () => {
  test('simplified product mode is on', () => {
    expect(APP_CONFIG.SIMPLIFIED_PRODUCT_MODE).toBe(true);
  });

  // The core acceptance check: the exact enabled surface, enumerated. A new
  // flag defaulting to on, or a removed feature creeping back, fails here.
  test('the enabled surface is exactly Demo Mode', () => {
    const on = REQUIRED_FLAGS.filter((f) => isFeatureOn(f));
    expect(on).toEqual(['DEMO_MODE']);
  });

  test.each([
    'STREAK_CALENDAR',
    'ACTIVITY_REWARDS',
    'AI_PARENT_REPORT',
    'AI_HINTS',
    'PUSH_NOTIFICATIONS',
    'REMINDERS',
    'SOUND_CONTROLS',
    'CUSTOM_QUIZ_LENGTHS',
    'QUIZ_TIMERS',
    'FINAL_TESTS',
    'HARD_PROGRESSION_LOCKS',
    'ACCESS_CONTROL_GRIDS',
    'INTERVENTION_OVERLAYS',
    'LEGACY_DASHBOARD_SECTIONS',
  ])('%s is disabled', (flag) => {
    expect(isFeatureOn(flag)).toBe(false);
  });

  test('unknown flags fail closed', () => {
    expect(isFeatureOn('NOT_A_REAL_FLAG')).toBe(false);
    expect(isFeatureOn('')).toBe(false);
    expect(isFeatureOn(undefined)).toBe(false);
  });
});

describe('grade availability', () => {
  test('K, 1 and 2 are launched', () => {
    expect(isGradeLaunched('K')).toBe(true);
    expect(isGradeLaunched('1')).toBe(true);
    expect(isGradeLaunched('2')).toBe(true);
  });

  // Grade 3 is 8% built (89 of 97 lessons are empty shells). Grades 4-5 do not
  // exist. None may be customer-accessible.
  test.each(['3', '4', '5'])('grade %s is not launched', (g) => {
    expect(isGradeLaunched(g)).toBe(false);
  });

  test('accepts every grade spelling the app actually stores', () => {
    // mmr_grade, student_profiles.grade, and _gradeBand spellings.
    expect(isGradeLaunched('k')).toBe(true);
    expect(isGradeLaunched('Kindergarten')).toBe(true);
    expect(isGradeLaunched('0')).toBe(true);
    expect(isGradeLaunched('g1')).toBe(true);
    expect(isGradeLaunched('Grade 2')).toBe(true);
    expect(isGradeLaunched('grade2')).toBe(true);
    expect(isGradeLaunched(2)).toBe(true);
    // ...and still refuses G3 in each of them.
    expect(isGradeLaunched('g3')).toBe(false);
    expect(isGradeLaunched('Grade 3')).toBe(false);
    expect(isGradeLaunched(3)).toBe(false);
  });

  test('unrecognized grades fail closed', () => {
    expect(isGradeLaunched(null)).toBe(false);
    expect(isGradeLaunched(undefined)).toBe(false);
    expect(isGradeLaunched('')).toBe(false);
    expect(isGradeLaunched('6')).toBe(false);
    expect(isGradeLaunched('banana')).toBe(false);
    expect(isGradeLaunched('2x')).toBe(false);
  });

  test('normalizeGradeToken canonicalizes', () => {
    expect(normalizeGradeToken('kindergarten')).toBe('K');
    expect(normalizeGradeToken('G1')).toBe('1');
    expect(normalizeGradeToken(' 3 ')).toBe('3');
    expect(normalizeGradeToken('nope')).toBe(null);
  });

  test('launchGrades reports the shipping list', () => {
    expect(launchGrades()).toEqual(['K', '1', '2']);
  });
});

describe('legacy escape hatch', () => {
  const legacy = () =>
    loadConfig({
      patch: (s) => s.replace('SIMPLIFIED_PRODUCT_MODE: true', 'SIMPLIFIED_PRODUCT_MODE: false'),
    });

  test('the patch under test actually flips the switch', () => {
    expect(legacy().APP_CONFIG.SIMPLIFIED_PRODUCT_MODE).toBe(false);
  });

  test('master-off restores current-master behavior for every flag', () => {
    const cfg = legacy();
    for (const flag of REQUIRED_FLAGS) {
      expect(cfg.isFeatureOn(flag)).toBe(cfg._LEGACY_DEFAULTS[flag] === true);
    }
  });

  test('master-off re-exposes Grade 3, matching master today', () => {
    const cfg = legacy();
    expect(cfg.isGradeLaunched('3')).toBe(true);
    expect(cfg.launchGrades()).toEqual(['K', '1', '2', '3']);
  });

  test('master-off restores the features the pivot disables', () => {
    const cfg = legacy();
    expect(cfg.isFeatureOn('STREAK_CALENDAR')).toBe(true);
    expect(cfg.isFeatureOn('QUIZ_TIMERS')).toBe(true);
    expect(cfg.isFeatureOn('HARD_PROGRESSION_LOCKS')).toBe(true);
    expect(cfg.isFeatureOn('INTERVENTION_OVERLAYS')).toBe(true);
    expect(cfg.isFeatureOn('DEMO_MODE')).toBe(false); // master ships full guest mode
  });

  // Fidelity guard: these two are off on master because their surfaces are
  // orphaned (no caller / no UI), not because the pivot disabled them.
  test('legacy defaults tell the truth about orphaned features', () => {
    expect(_LEGACY_DEFAULTS.AI_HINTS).toBe(false);
    expect(_LEGACY_DEFAULTS.PUSH_NOTIFICATIONS).toBe(false);
  });
});

describe('dev override', () => {
  const onLocalhost = (store) =>
    loadConfig({ location: { hostname: 'localhost' }, localStorage: fakeStorage(store) });

  test('localhost can force a disabled flag on', () => {
    const cfg = onLocalhost({ mmr_flag_STREAK_CALENDAR: '1' });
    expect(cfg.isFeatureOn('STREAK_CALENDAR')).toBe(true);
  });

  test('localhost can force an enabled flag off', () => {
    const cfg = onLocalhost({ mmr_flag_DEMO_MODE: '0' });
    expect(cfg.isFeatureOn('DEMO_MODE')).toBe(false);
  });

  test('localhost can unhide a grade for development', () => {
    const cfg = onLocalhost({ mmr_flag_GRADE_3: '1' });
    expect(cfg.isGradeLaunched('3')).toBe(true);
    expect(cfg.isGradeLaunched('4')).toBe(false);
  });

  test('an unset or junk override changes nothing', () => {
    const cfg = onLocalhost({ mmr_flag_STREAK_CALENDAR: 'yes' });
    expect(cfg.isFeatureOn('STREAK_CALENDAR')).toBe(false);
    expect(onLocalhost({}).isFeatureOn('DEMO_MODE')).toBe(true);
  });

  // The override must never reach customers.
  test('production hosts ignore overrides entirely', () => {
    const cfg = loadConfig({
      location: { hostname: 'mymathroots.com' },
      localStorage: fakeStorage({ mmr_flag_STREAK_CALENDAR: '1', mmr_flag_GRADE_3: '1' }),
    });
    expect(cfg.isFeatureOn('STREAK_CALENDAR')).toBe(false);
    expect(cfg.isGradeLaunched('3')).toBe(false);
  });

  test('a hostile localStorage cannot break flag reads', () => {
    const cfg = loadConfig({
      location: { hostname: 'localhost' },
      localStorage: {
        getItem() {
          throw new Error('storage disabled');
        },
      },
    });
    expect(cfg.isFeatureOn('STREAK_CALENDAR')).toBe(false);
    expect(cfg.isGradeLaunched('2')).toBe(true);
  });
});

describe('build wiring', () => {
  test('app-config.js is element 0 of the concat order', () => {
    const build = fs.readFileSync(path.join(__dirname, '..', 'build.js'), 'utf8');
    const m = build.match(/const SRC_FILES = \[\s*([\s\S]*?)\]/);
    expect(m).toBeTruthy();
    const first = m[1].split(',')[0].trim();
    // It must load before state.js derives its storage keys at parse time.
    expect(first).toBe("'app-config.js'");
  });

  test('boot.js registers the config globals for the collision check', () => {
    const boot = fs.readFileSync(path.join(__dirname, '..', 'src', 'boot.js'), 'utf8');
    for (const g of ['APP_CONFIG', 'isFeatureOn', 'isGradeLaunched', 'launchGrades']) {
      expect(boot).toContain(`'${g}'`);
    }
  });
});
