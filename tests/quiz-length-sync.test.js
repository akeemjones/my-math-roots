'use strict';

// =============================================================================
//  QUIZ-LENGTH CROSS-DEVICE SYNC
//
//  Covers the per-student sync helpers (pure) and the conflict rule:
//    - settings are per student, isolated between siblings
//    - the higher-ts record wins; a stale device never overwrites a newer one
//    - a pending local edit survives an older-or-equal remote and is re-pushed
//    - offline / missing-RPC falls back to local-only without loss
//    - a quiz-length write carries only lesson/unit/ts (no other settings)
//
//  The server RPC (update_quiz_settings) applies the same ts guard; that is
//  pinned as a source contract on the draft migration, since it needs a live DB.
// =============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const {
  loadQuizLengths,
  loadQuizLengthsRaw,
  saveQuizLengthsLocalEdit,
  markQuizLengthsSynced,
  reconcileQuizLengths,
  quizLengthsKey,
} = require('../src/quiz-config.js');

// In-memory localStorage stand-in (one per "device").
function device(initial) {
  const m = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(String(k), String(v)),
    removeItem: (k) => m.delete(String(k)),
    _dump: () => Object.fromEntries(m),
  };
}

describe('local edit records lesson/unit/ts and marks pending', () => {
  test('an edit stamps ts and pending=true', () => {
    const d = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 12, unit: 'all' }, 1000, d);
    expect(loadQuizLengthsRaw('s1', d)).toEqual({ lesson: 12, unit: 'all', ts: 1000, pending: true });
  });

  test('the engine reader still sees a plain {lesson, unit}', () => {
    const d = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 6, unit: 4 }, 1000, d);
    expect(loadQuizLengths('s1', d)).toEqual({ lesson: 6, unit: 4 });
  });

  test('markQuizLengthsSynced clears pending, keeps the value and ts', () => {
    const d = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 6, unit: 'default' }, 1000, d);
    markQuizLengthsSynced('s1', d);
    expect(loadQuizLengthsRaw('s1', d)).toEqual({ lesson: 6, unit: 'default', ts: 1000, pending: false });
  });

  test('a pre-sync {lesson, unit} record (no ts) loads as ts:0, pending:false', () => {
    const d = device({ [quizLengthsKey('s1')]: JSON.stringify({ lesson: 10, unit: 'all' }) });
    expect(loadQuizLengthsRaw('s1', d)).toEqual({ lesson: 10, unit: 'all', ts: 0, pending: false });
  });
});

describe('conflict rule — higher ts wins, pending is protected', () => {
  test('a NEWER remote is adopted locally (Device B gets Device A\'s edit)', () => {
    const b = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 'default', unit: 'default' }, 1000, b);
    markQuizLengthsSynced('s1', b);
    const r = reconcileQuizLengths('s1', { lesson: 20, unit: 'all', ts: 2000 }, b);
    expect(r.adopt).toBe('remote');
    expect(loadQuizLengthsRaw('s1', b)).toEqual({ lesson: 20, unit: 'all', ts: 2000, pending: false });
  });

  test('an OLDER remote does not overwrite a newer local edit', () => {
    const a = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 12, unit: 6 }, 5000, a); // newer, pending
    const r = reconcileQuizLengths('s1', { lesson: 4, unit: 'default', ts: 1000 }, a);
    expect(r.adopt).toBe('local');
    expect(r.pushLocal).toBe(true); // still pending -> must be pushed
    expect(loadQuizLengthsRaw('s1', a)).toEqual({ lesson: 12, unit: 6, ts: 5000, pending: true });
  });

  test('an EQUAL-ts remote keeps local (idempotent re-pull)', () => {
    const a = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 8, unit: 25 }, 3000, a);
    markQuizLengthsSynced('s1', a);
    const r = reconcileQuizLengths('s1', { lesson: 8, unit: 25, ts: 3000 }, a);
    expect(r.adopt).toBe('local');
    expect(r.pushLocal).toBe(false);
  });

  test('no remote at all -> keep local, push if pending', () => {
    const a = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 10, unit: 'all' }, 4000, a);
    const r = reconcileQuizLengths('s1', {}, a); // empty remote (untouched profile)
    expect(r.adopt).toBe('local');
    expect(r.pushLocal).toBe(true);
  });

  test('a stale device cannot clobber a newer setting across a round-trip', () => {
    // Device A saves late (ts 9000). Device B, holding an old edit (ts 2000),
    // pulls A's newer value and must adopt it, not push its own stale one.
    const b = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 4, unit: 'default' }, 2000, b);
    const r = reconcileQuizLengths('s1', { lesson: 16, unit: 'all', ts: 9000 }, b);
    expect(r.adopt).toBe('remote');
    expect(r.pushLocal).toBe(false);
    expect(loadQuizLengths('s1', b)).toEqual({ lesson: 16, unit: 'all' });
  });
});

describe('student isolation', () => {
  test('each child has its own key; editing one does not touch another', () => {
    const d = device();
    saveQuizLengthsLocalEdit('kid-a', { lesson: 12, unit: 'all' }, 1000, d);
    saveQuizLengthsLocalEdit('kid-b', { lesson: 4, unit: 'default' }, 1000, d);
    expect(loadQuizLengths('kid-a', d)).toEqual({ lesson: 12, unit: 'all' });
    expect(loadQuizLengths('kid-b', d)).toEqual({ lesson: 4, unit: 'default' });
    // Keys are distinct and student-scoped.
    expect(quizLengthsKey('kid-a')).not.toBe(quizLengthsKey('kid-b'));
  });

  test('reconciling one child does not disturb a sibling', () => {
    const d = device();
    saveQuizLengthsLocalEdit('kid-a', { lesson: 12, unit: 'all' }, 1000, d);
    saveQuizLengthsLocalEdit('kid-b', { lesson: 4, unit: 'default' }, 1000, d);
    reconcileQuizLengths('kid-a', { lesson: 20, unit: 6, ts: 5000 }, d);
    expect(loadQuizLengths('kid-b', d)).toEqual({ lesson: 4, unit: 'default' }); // untouched
  });

  test('guest / local uses a shared local key, not a per-parent one', () => {
    expect(quizLengthsKey('local')).toBe('mmr_quiz_lengths_local');
    expect(quizLengthsKey(null)).toBe('mmr_quiz_lengths_local');
  });
});

describe('offline / missing-RPC resilience (pure layer)', () => {
  test('an unpushed edit stays pending so a later load can retry it', () => {
    const a = device();
    saveQuizLengthsLocalEdit('s1', { lesson: 10, unit: 'all' }, 1000, a);
    // No push happened (offline). The value is usable and still pending.
    expect(loadQuizLengths('s1', a)).toEqual({ lesson: 10, unit: 'all' });
    expect(reconcileQuizLengths('s1', {}, a).pushLocal).toBe(true);
  });

  test('a hostile storage never throws', () => {
    const hostile = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
    expect(() => saveQuizLengthsLocalEdit('s1', { lesson: 4, unit: 4 }, 1, hostile)).not.toThrow();
    expect(() => loadQuizLengthsRaw('s1', hostile)).not.toThrow();
    expect(() => reconcileQuizLengths('s1', { ts: 5 }, hostile)).not.toThrow();
  });
});

// ── Client wiring (source contracts) ────────────────────────────────────────
describe('dashboard sync wiring', () => {
  const dash = read('src/dashboard.js');

  test('managed students are distinguished from local/guest/mock', () => {
    const fn = dash.match(/function _quizLenIsManaged[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/studentId !== 'local'/);
    expect(fn).toMatch(/studentId !== 'mock_1'/);
    expect(fn).toMatch(/_supa/);
  });

  test('save writes locally first, then pushes for managed students', () => {
    const fn = dash.match(/function _dbSaveQuizLen[\s\S]*?\n}/)[0];
    const localAt = fn.indexOf('saveQuizLengthsLocalEdit(_activeId');
    const pushAt = fn.indexOf('_pushQuizLenRemote(_activeId');
    expect(localAt).toBeGreaterThan(-1);
    expect(pushAt).toBeGreaterThan(localAt); // local save before remote push
  });

  test('load pulls + reconciles for managed students', () => {
    const fn = dash.match(/async function _loadQuizLenSettings[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/rpc\('get_quiz_settings'/);
    expect(fn).toMatch(/reconcileQuizLengths\(studentId/);
  });

  test('push never claims sync on failure and keeps the pending edit', () => {
    const fn = dash.match(/async function _pushQuizLenRemote[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/rpc\('update_quiz_settings'/);
    expect(fn).toMatch(/will sync when online/); // honest offline state
    expect(fn).toMatch(/markQuizLengthsSynced/); // only on success
  });

  test('the load is awaited before render (folded into Promise.all)', () => {
    expect(dash).toMatch(/Promise\.all\(\[\s*\n\s*_loadQuizLenSettings\(id\),/);
  });
});

// ── Server RPC (source contract on the draft migration) ─────────────────────
describe('update_quiz_settings RPC applies the same ts guard', () => {
  const sql = read('supabase/migrations/DRAFT_20260717_quiz_settings.sql');

  test('is a reviewed, not-applied draft', () => {
    expect(sql).toMatch(/DRAFT — DO NOT APPLY/);
  });

  test('writes only the quiz_settings column (isolation)', () => {
    expect(sql).toMatch(/SET quiz_settings = p_settings/);
    expect(sql).not.toMatch(/SET (timer_settings|a11y_settings|unlock_settings|grade)/);
  });

  test('rejects a stale write (incoming ts < stored ts)', () => {
    expect(sql).toMatch(/IF v_new_ts < v_cur_ts THEN\s*\n\s*RETURN v_current;/);
  });

  test('is ownership-checked and authenticated-only', () => {
    expect(sql).toMatch(/v_owner <> auth\.uid\(\)/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION update_quiz_settings\(UUID, JSONB\) TO authenticated/);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION update_quiz_settings\(UUID, JSONB\) FROM public/);
  });

  test('the additive column defaults to {} so existing profiles stay compatible', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS quiz_settings JSONB NOT NULL DEFAULT '\{\}'/);
  });

  test('documents a rollback', () => {
    expect(sql).toMatch(/DROP COLUMN IF EXISTS quiz_settings/);
  });
});
