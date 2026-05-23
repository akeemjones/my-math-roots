'use strict';

const {
  _shouldRunResumeSync,
  _reconcilePausedAgainstDone,
  _mergeRemoteDoneIntoLocal,
  _mergeRemoteScoresIntoLocal,
  _dbProgressCacheKeysForReset,
  _computeUnitLessonsComplete,
} = require('./sync-helpers');

// ── Test A — Resume/focus throttle ──────────────────────────────────────
// The resume listener fires on visibilitychange/focus/online/pageshow.
// The pure throttle helper decides whether enough time has elapsed.
describe('Tier 1 sync — resume throttle', () => {
  test('first call (no prior time) is allowed', () => {
    expect(_shouldRunResumeSync(1000, 0, 10000)).toBe(true);
    expect(_shouldRunResumeSync(1000, null, 10000)).toBe(true);
    expect(_shouldRunResumeSync(1000, undefined, 10000)).toBe(true);
  });

  test('blocks repeat call within the throttle window', () => {
    expect(_shouldRunResumeSync(5000, 1000, 10000)).toBe(false);
    expect(_shouldRunResumeSync(10999, 1000, 10000)).toBe(false);
  });

  test('allows call exactly at the throttle boundary', () => {
    expect(_shouldRunResumeSync(11000, 1000, 10000)).toBe(true);
  });

  test('allows call long after the last sync', () => {
    expect(_shouldRunResumeSync(50000, 1000, 10000)).toBe(true);
  });

  test('rejects invalid argument shapes', () => {
    expect(_shouldRunResumeSync('x', 1000, 10000)).toBe(false);
    expect(_shouldRunResumeSync(1000, 0, 'x')).toBe(false);
  });
});

// ── Test B — Completed beats paused ─────────────────────────────────────
describe('Tier 1 sync — completed beats paused', () => {
  test('clears paused qids that are now done=true', () => {
    const done = { lq_u1l4: true, u1l4: true, lq_u1l3: true };
    const paused = { lq_u1l4: { q: 5 }, lq_u2l1: { q: 2 } };
    expect(_reconcilePausedAgainstDone(done, paused).sort()).toEqual(['lq_u1l4']);
  });

  test('does not clear paused qids that are not in DONE', () => {
    const done = { lq_u1l3: true };
    const paused = { lq_u1l4: { q: 5 } };
    expect(_reconcilePausedAgainstDone(done, paused)).toEqual([]);
  });

  test('ignores non-true DONE entries (only strict === true wins)', () => {
    const done = { lq_u1l4: false, lq_u2l1: 0, lq_u3l1: 'yes', lq_u4l1: 1 };
    const paused = { lq_u1l4: {}, lq_u2l1: {}, lq_u3l1: {}, lq_u4l1: {} };
    expect(_reconcilePausedAgainstDone(done, paused)).toEqual([]);
  });

  test('handles empty/null inputs gracefully', () => {
    expect(_reconcilePausedAgainstDone({}, {})).toEqual([]);
    expect(_reconcilePausedAgainstDone(null, { lq_u1l4: {} })).toEqual([]);
    expect(_reconcilePausedAgainstDone({ lq_u1l4: true }, null)).toEqual([]);
    expect(_reconcilePausedAgainstDone({ lq_u1l4: true }, 'not-an-object')).toEqual([]);
  });

  test('returns multiple qids in one pass', () => {
    const done = { lq_u1l1: true, lq_u1l2: true, lq_u1l3: true, lq_u1l4: true };
    const paused = { lq_u1l1: {}, lq_u1l2: {}, lq_u1l4: {}, lq_u2l1: {} };
    expect(_reconcilePausedAgainstDone(done, paused).sort()).toEqual(['lq_u1l1', 'lq_u1l2', 'lq_u1l4']);
  });
});

// ── Test C — Cross-device stale unit count ─────────────────────────────
describe('Tier 1 sync — cross-device stale unit count', () => {
  test('Device B shows 3/4 → after score-merge → 4/4', () => {
    // Device B's local cache: 3 lessons recorded, lesson 4 missing.
    const localScores = [
      { id: 100, qid: 'lq_u1l1', pct: 90, score: 9, total: 10 },
      { id: 101, qid: 'lq_u1l2', pct: 85, score: 8, total: 10 },
      { id: 102, qid: 'lq_u1l3', pct: 95, score: 9, total: 10 },
    ];
    // Device A pushed lq_u1l4 to the server.
    const remoteScores = [
      { local_id: 103, qid: 'lq_u1l4', pct: 100, score: 10, total: 10, type: 'lesson' },
    ];
    const merged = _mergeRemoteScoresIntoLocal(localScores, remoteScores);
    expect(_computeUnitLessonsComplete(localScores, 1, 4)).toBe(3);
    expect(_computeUnitLessonsComplete(merged,      1, 4)).toBe(4);
  });

  test('Device B local DONE missing l4 → after merge → has l4 and lq_u1l4', () => {
    const localDone  = { u1l1: true, u1l2: true, u1l3: true };
    const remoteDone = { u1l4: true, lq_u1l4: true };
    const merged = _mergeRemoteDoneIntoLocal(localDone, remoteDone);
    expect(merged.u1l4).toBe(true);
    expect(merged.lq_u1l4).toBe(true);
    expect(merged.u1l1).toBe(true);
  });

  test('done-merge rejects __proto__ / constructor / prototype keys', () => {
    const merged = _mergeRemoteDoneIntoLocal({},
      { __proto__: true, constructor: true, prototype: true, safe: true });
    expect(merged.safe).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(merged, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(merged, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(merged, 'prototype')).toBe(false);
  });
});

// ── Test D — Score merge / sync ─────────────────────────────────────────
describe('Tier 1 sync — score merge', () => {
  test('appends missing remote score', () => {
    const localScores = [
      { id: 100, qid: 'lq_u1l1', pct: 90, score: 9, total: 10 },
    ];
    const remoteScores = [
      { local_id: 200, qid: 'lq_u1l4', pct: 100, score: 10, total: 10, type: 'lesson' },
    ];
    const merged = _mergeRemoteScoresIntoLocal(localScores, remoteScores);
    expect(merged.length).toBe(2);
    expect(merged.find(s => s.id === 200)).toMatchObject({ qid: 'lq_u1l4', pct: 100 });
  });

  test('does not duplicate when remote local_id matches local id', () => {
    const localScores = [
      { id: 200, qid: 'lq_u1l4', pct: 90, score: 9, total: 10 },
    ];
    const remoteScores = [
      { local_id: 200, qid: 'lq_u1l4', pct: 100, score: 10, total: 10, type: 'lesson' },
    ];
    const merged = _mergeRemoteScoresIntoLocal(localScores, remoteScores);
    expect(merged.length).toBe(1);
    expect(merged[0].id).toBe(200);
    // Local row kept (append-only — no overwrite).
    expect(merged[0].pct).toBe(90);
  });

  test('rejects malformed remote rows', () => {
    const merged = _mergeRemoteScoresIntoLocal([], [
      { local_id: 'x' },                                                // local_id not number
      { local_id: 1, qid: 42 },                                          // qid not string
      { local_id: 2, qid: 'q', score: 'x', total: 10, pct: 50 },         // score not number
      { local_id: 3, qid: 'q', score: 5, total: 10, pct: 150 },          // pct out of range
      { local_id: 4, qid: 'q', score: 5, total: 10, pct: 50,
        type: 'lesson' },                                                 // valid
    ]);
    expect(merged.length).toBe(1);
    expect(merged[0].id).toBe(4);
  });

  test('returns sorted by id descending after merge', () => {
    const merged = _mergeRemoteScoresIntoLocal(
      [{ id: 100, qid: 'a', pct: 50, score: 5, total: 10 }],
      [
        { local_id: 50,  qid: 'b', score: 5, total: 10, pct: 50, type: 'lesson' },
        { local_id: 200, qid: 'c', score: 5, total: 10, pct: 50, type: 'lesson' },
      ]
    );
    expect(merged.map(s => s.id)).toEqual([200, 100, 50]);
  });
});

// ── Test E — Profile switch wipes paused even when sessionMatches=false ─
describe('Tier 1 sync — profile switch always wipes paused', () => {
  test('sessionMatches=false still includes wb_paused_quiz', () => {
    const keys = _dbProgressCacheKeysForReset('1', false);
    expect(keys).toContain('wb_paused_quiz');
  });

  test('sessionMatches=true also includes wb_paused_quiz', () => {
    const keys = _dbProgressCacheKeysForReset('1', true);
    expect(keys).toContain('wb_paused_quiz');
  });

  test('wb_paused_quiz appears exactly once (dedup)', () => {
    const keys = _dbProgressCacheKeysForReset('1', true);
    const count = keys.filter(k => k === 'wb_paused_quiz').length;
    expect(count).toBe(1);
  });

  test('sessionMatches=false does NOT trigger the wide cross-grade sweep', () => {
    const keys = _dbProgressCacheKeysForReset('1', false);
    expect(keys).not.toContain('wb_sc5_K');
    expect(keys).not.toContain('wb_sc5_2');
    expect(keys).not.toContain('wb_streak');
    expect(keys).not.toContain('wb_apptime');
    // Legacy un-namespaced keys also stay scoped to sessionMatches=true.
    expect(keys).not.toContain('wb_sc5');
    expect(keys).not.toContain('wb_done5');
  });

  test('sessionMatches=true DOES trigger the wide cross-grade sweep', () => {
    const keys = _dbProgressCacheKeysForReset('1', true);
    expect(keys).toContain('wb_sc5_K');
    expect(keys).toContain('wb_sc5_2');
    expect(keys).toContain('wb_streak');
    expect(keys).toContain('wb_apptime');
    expect(keys).toContain('wb_act_dates');
    expect(keys).toContain('wb_sc5');
    expect(keys).toContain('wb_done5');
    expect(keys).toContain('wb_mastery');
  });
});

// ── Test F — Grade scoping ──────────────────────────────────────────────
describe('Tier 1 sync — grade scoping', () => {
  test('grade-scoped key naming keeps G1, K, G2 isolated', () => {
    const k1 = _dbProgressCacheKeysForReset('1', false);
    const kK = _dbProgressCacheKeysForReset('K', false);
    const k2 = _dbProgressCacheKeysForReset('2', false);
    expect(k1).toContain('wb_sc5_1');
    expect(kK).toContain('wb_sc5_K');
    expect(k2).toContain('wb_sc5_2');
    // No cross-grade bleed when sessionMatches=false:
    expect(k1).not.toContain('wb_sc5_K');
    expect(k1).not.toContain('wb_sc5_2');
    expect(kK).not.toContain('wb_sc5_1');
    expect(kK).not.toContain('wb_sc5_2');
    expect(k2).not.toContain('wb_sc5_1');
    expect(k2).not.toContain('wb_sc5_K');
  });

  test('done-merge is a flat map — grade isolation lives in the localStorage key, not the merge', () => {
    // Sanity check: the merge logic operates on a single grade-scoped
    // DONE at a time; G1 and G2 keys never coexist in the same map.
    const merged = _mergeRemoteDoneIntoLocal({ u1l1: true }, { u2l1: true });
    expect(merged).toEqual({ u1l1: true, u2l1: true });
  });

  test('reset key list for grade K does not include grade-1 cache key', () => {
    const kK = _dbProgressCacheKeysForReset('K', false);
    expect(kK).not.toContain('wb_done5_1');
    expect(kK).not.toContain('mmr_mastery_v1_1');
  });
});
