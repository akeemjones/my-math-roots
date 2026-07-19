'use strict';

// =============================================================================
//  SINGLE-FAMILY-ACCOUNT STARTUP RESOLVER
//
//  resolveInitialScreen() (src/app-config.js) is THE authoritative decision for
//  which screen the app opens on — used by first boot, every Family Account
//  auth-success path, and blank-screen recovery (bfcache thaw / visibility).
//
//  The model has ONE authenticated identity (the Family Account). Children are
//  profiles, not logins, so there is no student session, no family code, and no
//  session token. The resolver distinguishes only:
//    login · demo · profile-selection · child · settings
//  and never returns a removed destination (dashboard / parent-center / student
//  login). It ignores mmr_user_role — role is not a second identity here.
//
//  This suite pins the resolver's contract AND the source wiring that sets the
//  app mode and routes through it.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { resolveInitialScreen } = require('../src/app-config.js');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// A localStorage-shaped object that also records whether anything wrote to it.
function store(init) {
  const map = new Map(Object.entries(init || {}));
  let writes = 0;
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { writes++; map.set(String(k), String(v)); },
    removeItem: (k) => { writes++; map.delete(String(k)); },
    _writes: () => writes,
  };
}

const NOW = 1_800_000_000_000; // fixed clock for gate tests

describe('signed out', () => {
  test('no Family Account, no demo → login', () => {
    expect(resolveInitialScreen(store({}), false, NOW)).toBe('login');
  });
  test('a stale active-child id without a Family Account does NOT authorize child mode', () => {
    // Children are not logins — with no Supabase family session there is nothing
    // to restore. (A child is app state under an authenticated parent, not auth.)
    expect(resolveInitialScreen(store({ mmr_active_student_id: 'c1', mmr_app_mode: 'child' }), false, NOW)).toBe('login');
  });
});

describe('demo mode', () => {
  test('guest flag, no Family Account → demo', () => {
    expect(resolveInitialScreen(store({ wb_guest_mode: '1' }), false, NOW)).toBe('demo');
  });
});

describe('Family Account signed in', () => {
  test('no active child → profile selection', () => {
    expect(resolveInitialScreen(store({}), true, NOW)).toBe('profile-selection');
  });
  test('active child selected → child', () => {
    expect(resolveInitialScreen(store({ mmr_active_student_id: 'c1' }), true, NOW)).toBe('child');
  });
  test('active child + explicit child mode → child (reload during a lesson/quiz)', () => {
    expect(resolveInitialScreen(store({ mmr_active_student_id: 'c1', mmr_app_mode: 'child' }), true, NOW)).toBe('child');
  });
});

describe('parent Settings mode + gate', () => {
  test('settings mode with a still-valid parent gate → settings', () => {
    const s = store({ mmr_app_mode: 'settings', mmr_parent_gate_until: String(NOW + 60_000), mmr_active_student_id: 'c1' });
    expect(resolveInitialScreen(s, true, NOW)).toBe('settings');
  });
  test('settings mode with an EXPIRED gate falls through to the active child', () => {
    const s = store({ mmr_app_mode: 'settings', mmr_parent_gate_until: String(NOW - 1), mmr_active_student_id: 'c1' });
    expect(resolveInitialScreen(s, true, NOW)).toBe('child');
  });
  test('settings mode, expired gate, no active child → profile selection', () => {
    const s = store({ mmr_app_mode: 'settings', mmr_parent_gate_until: String(NOW - 1) });
    expect(resolveInitialScreen(s, true, NOW)).toBe('profile-selection');
  });
  test('settings mode with no gate stamp never silently reopens Settings', () => {
    expect(resolveInitialScreen(store({ mmr_app_mode: 'settings', mmr_active_student_id: 'c1' }), true, NOW)).toBe('child');
  });
});

describe('role is not an identity', () => {
  test('mmr_user_role is ignored entirely', () => {
    // A stale role must not change routing; only the Family Account session +
    // active-child app state decide.
    expect(resolveInitialScreen(store({ mmr_user_role: 'parent', mmr_active_student_id: 'c1' }), true, NOW)).toBe('child');
    expect(resolveInitialScreen(store({ mmr_user_role: 'student' }), true, NOW)).toBe('profile-selection');
    expect(resolveInitialScreen(store({ mmr_user_role: 'student', mmr_active_student_id: 'c1' }), false, NOW)).toBe('login');
  });
});

describe('never returns a removed destination', () => {
  test('no input combination yields dashboard / parent-center / student-login', () => {
    const combos = [
      [{}, false], [{ wb_guest_mode: '1' }, false], [{}, true],
      [{ mmr_active_student_id: 'c1' }, true],
      [{ mmr_app_mode: 'settings', mmr_parent_gate_until: String(NOW + 1) }, true],
      [{ mmr_user_role: 'parent', mmr_active_student_id: 'c1' }, true],
    ];
    const banned = new Set(['dashboard', 'parent-center', 'student-login', 'pin-login']);
    for (const [st, hasUser] of combos) {
      expect(banned.has(resolveInitialScreen(store(st), hasUser, NOW))).toBe(false);
    }
  });
});

describe('pure and fail-safe', () => {
  test('it writes nothing to storage', () => {
    const s = store({ mmr_active_student_id: 'c1', mmr_app_mode: 'child' });
    resolveInitialScreen(s, true, NOW);
    resolveInitialScreen(s, false, NOW);
    expect(s._writes()).toBe(0);
  });
  test('null storage, signed out → login, never a throw', () => {
    expect(resolveInitialScreen(null, false, NOW)).toBe('login');
  });
  test('a throwing storage → login, never a throw', () => {
    const boom = { getItem: () => { throw new Error('quota'); } };
    expect(resolveInitialScreen(boom, true, NOW)).toBe('login');
  });
});

// ── Source contracts: the resolver is only useful if the app sets the app mode
//    and every routing path funnels through it. ───────────────────────────────
describe('the app wires the mode and the resolver correctly', () => {
  const auth = read('src/auth.js');
  const boot = read('src/boot.js');
  const appConfig = read('src/app-config.js');

  test('entering a child session sets child app mode', () => {
    const fn = auth.match(/async function enterStudentLearningSession\(opts\)\s*\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/setItem\('mmr_app_mode',\s*'child'\)/);
  });

  test('the old dual-login role flip is gone', () => {
    // _enterParentMode and its mmr_learning_active marker no longer exist.
    expect(auth).not.toMatch(/function _enterParentMode\s*\(/);
    expect(appConfig).not.toMatch(/mmr_learning_active/);
  });

  test('boot recovery routes through resolveInitialScreen, not a dashboard', () => {
    const fn = boot.match(/function _recoverVisibleScreen\(reason\)\s*\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/resolveInitialScreen\(/);
    expect(fn).not.toMatch(/show\('dashboard-screen'\)/);
  });

  test('boot no longer reads a student session token', () => {
    expect(boot).not.toMatch(/getItem\('mmr_session_token'\)/);
  });

  test('there is a single authoritative post-auth router', () => {
    expect(boot).toMatch(/function _routeToInitialScreen\(/);
    // The auth-success paths funnel through it rather than opening the dashboard.
    expect(auth).toMatch(/_routeToInitialScreen\('signed-in'\)/);
    expect(auth).toMatch(/_routeToInitialScreen\('initial-session'\)/);
  });
});
