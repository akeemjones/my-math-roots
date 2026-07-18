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
  isDevBuild,
  isFeatureOn,
  isGradeLaunched,
  normalizeGradeToken,
  launchGrades,
  needsGradeRecovery,
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
  'SIMPLIFIED_NAV',
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
  test('the enabled surface is exactly Demo Mode and simplified nav', () => {
    const on = REQUIRED_FLAGS.filter((f) => isFeatureOn(f));
    expect(on).toEqual(['DEMO_MODE', 'SIMPLIFIED_NAV']);
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
  // The override is authorized by the BUILD, not by the browser. Simulate an
  // authorized dev build by substituting the build-mode token exactly as
  // `node build.js --dev` does.
  const asDevBuild = (s) => s.replace("'%%BUILD_MODE%%'", "'dev'");

  const onLocalhost = (store) =>
    loadConfig({
      patch: asDevBuild,
      location: { hostname: 'localhost' },
      localStorage: fakeStorage(store),
    });

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

  // ══════════════════════════════════════════════════════════════════════
  //  The build gate is the real boundary.
  //
  //  A customer must not be able to unlock withdrawn content — above all the
  //  unfinished Grade 3 curriculum — from client-controlled state. localStorage,
  //  query params and console variables are all attacker-controlled; the build
  //  mode is not, because it is substituted into the artifact at build time.
  //  UI hiding is never the boundary either: the write guards in switchGrade()
  //  and dbAddSave()/dbEditSave() enforce grade availability independently.
  // ══════════════════════════════════════════════════════════════════════
  describe('production builds ignore overrides', () => {
    const prodOnLocalhost = (store) =>
      loadConfig({
        // No patch: the shipped source carries the raw token, and a real prod
        // build substitutes 'prod'. Both must fail closed.
        location: { hostname: 'localhost' },
        localStorage: fakeStorage(store),
      });

    test('a production build served from localhost still refuses Grade 3', () => {
      const cfg = prodOnLocalhost({ mmr_flag_GRADE_3: '1' });
      expect(cfg.isDevBuild()).toBe(false);
      expect(cfg.isGradeLaunched('3')).toBe(false);
    });

    test('an explicit prod build ignores every flag override', () => {
      const cfg = loadConfig({
        patch: (s) => s.replace("'%%BUILD_MODE%%'", "'prod'"),
        location: { hostname: 'localhost' },
        localStorage: fakeStorage({ mmr_flag_GRADE_3: '1', mmr_flag_STREAK_CALENDAR: '1' }),
      });
      expect(cfg.isDevBuild()).toBe(false);
      expect(cfg.isGradeLaunched('3')).toBe(false);
      expect(cfg.isFeatureOn('STREAK_CALENDAR')).toBe(false);
    });

    // Fail closed: an unsubstituted or tampered token is not a dev build.
    test.each([['%%BUILD_MODE%%'], ['development'], ['DEV'], [''], ['prod']])(
      'build mode %p is not treated as dev',
      (mode) => {
        const cfg = loadConfig({
          patch: (s) => s.replace("'%%BUILD_MODE%%'", JSON.stringify(mode)),
          location: { hostname: 'localhost' },
          localStorage: fakeStorage({ mmr_flag_GRADE_3: '1' }),
        });
        expect(cfg.isDevBuild()).toBe(false);
        expect(cfg.isGradeLaunched('3')).toBe(false);
      }
    );

    test('only the exact token "dev" authorizes an override', () => {
      const cfg = loadConfig({
        patch: (s) => s.replace("'%%BUILD_MODE%%'", "'dev'"),
        location: { hostname: 'localhost' },
        localStorage: fakeStorage({ mmr_flag_GRADE_3: '1' }),
      });
      expect(cfg.isDevBuild()).toBe(true);
      expect(cfg.isGradeLaunched('3')).toBe(true);
    });

    // Even an authorized dev build does not leak overrides to a real host.
    test('a dev build served from a production host ignores overrides', () => {
      const cfg = loadConfig({
        patch: asDevBuild,
        location: { hostname: 'mymathroots.com' },
        localStorage: fakeStorage({ mmr_flag_GRADE_3: '1' }),
      });
      expect(cfg.isGradeLaunched('3')).toBe(false);
    });
  });

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
      patch: asDevBuild,
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

describe('unsupported-grade recovery detection', () => {
  const store = (init) => {
    const map = new Map(Object.entries(init || {}));
    return {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(String(k), String(v)),
      _all: () => Object.fromEntries(map),
    };
  };

  test('a Grade 3 device needs recovery', () => {
    expect(needsGradeRecovery(store({ mmr_grade: '3' }))).toBe(true);
  });

  // The core correction: the app asks, it does not decide. An earlier revision
  // silently rewrote mmr_grade '3' -> '2' so the app could boot, which made a
  // parent's decision for them.
  test('detection writes nothing at all — no silent grade change', () => {
    const s = store({ mmr_grade: '3' });
    const before = JSON.stringify(s._all());
    needsGradeRecovery(s);
    expect(JSON.stringify(s._all())).toBe(before);
    expect(s.getItem('mmr_grade')).toBe('3');   // NOT rewritten to '2'
    expect(s.getItem('mmr_grade_prev')).toBe(null);
  });

  test('Grade 3 progress is untouched by detection', () => {
    const s = store({
      mmr_grade: '3',
      wb_done5_3: '{"g3-u1-l1":1}',
      wb_sc5_3: '[{"pct":90}]',
      wb_mastery_3: '{"x":1}',
      mmr_mastery_v1_3: '{"tag":{"attempts":4}}',
    });
    needsGradeRecovery(s);
    expect(s.getItem('wb_done5_3')).toBe('{"g3-u1-l1":1}');
    expect(s.getItem('wb_sc5_3')).toBe('[{"pct":90}]');
    expect(s.getItem('wb_mastery_3')).toBe('{"x":1}');
    expect(s.getItem('mmr_mastery_v1_3')).toBe('{"tag":{"attempts":4}}');
  });

  test.each(['K', '1', '2'])('supported grade %s needs no recovery', (g) => {
    expect(needsGradeRecovery(store({ mmr_grade: g }))).toBe(false);
  });

  test.each(['4', '5'])('withdrawn grade %s also needs recovery', (g) => {
    expect(needsGradeRecovery(store({ mmr_grade: g }))).toBe(true);
  });

  test('a first run with no grade set is not recovery', () => {
    expect(needsGradeRecovery(store({}))).toBe(false);
  });

  // Recovery is sticky: it stays until a parent actually chooses.
  test('returning to the same Grade 3 device reopens recovery', () => {
    const s = store({ mmr_grade: '3' });
    expect(needsGradeRecovery(s)).toBe(true);
    expect(needsGradeRecovery(s)).toBe(true);
    expect(needsGradeRecovery(s)).toBe(true);
  });

  test('recovery ends once a supported grade is chosen', () => {
    const s = store({ mmr_grade: '3' });
    expect(needsGradeRecovery(s)).toBe(true);
    s.setItem('mmr_grade', 'K');           // what _applyRecoveryGrade -> switchGrade does
    expect(needsGradeRecovery(s)).toBe(false);
  });

  test('a dev build with Grade 3 enabled does not enter recovery', () => {
    const cfg = loadConfig({
      patch: (s) => s.replace("'%%BUILD_MODE%%'", "'dev'"),
      location: { hostname: 'localhost' },
      localStorage: fakeStorage({ mmr_flag_GRADE_3: '1' }),
    });
    expect(cfg.needsGradeRecovery(store({ mmr_grade: '3' }))).toBe(false);
  });

  // Never trap a student behind a storage failure.
  test('fails open on a hostile storage', () => {
    const hostile = { getItem() { throw new Error('nope'); } };
    expect(() => needsGradeRecovery(hostile)).not.toThrow();
    expect(needsGradeRecovery(hostile)).toBe(false);
    expect(needsGradeRecovery(null)).toBe(false);
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
