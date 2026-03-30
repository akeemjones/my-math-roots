// tests/mergeCloudData.test.js
const { _mergeCloudData } = require('./mergeCloudData-helpers.js');

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeScore(overrides = {}){
  return { qid:'q1', label:'Test', type:'lesson', score:8, total:10, pct:80,
    stars:'⭐⭐', unitIdx:1, color:'green', name:'', id:Date.now(),
    timeTaken:30, answers:[], date:'2026-03-30', time:'10:00',
    quit:false, abandoned:false, ...overrides };
}

function makeCloud(overrides = {}){
  return {
    prog: { done_json:{}, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } },
    remoteScores: [],
    profile: null,
    ...overrides
  };
}

function makeLocal(overrides = {}){
  return {
    done: {}, scores: [], streak: { current:0, longest:0, lastDate:'' },
    mastery: {}, appTime: { totalSecs:0, sessions:0, dailySecs:{} },
    ...overrides
  };
}

// ── DONE merge ───────────────────────────────────────────────────────────────
describe('DONE union merge', () => {
  test('cloud keys are merged into local', () => {
    const local = makeLocal({ done: { 'u1-l1': true } });
    const cloud = makeCloud({ prog: { done_json: { 'u1-l2': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
    const result = _mergeCloudData(local, cloud);
    expect(result.done['u1-l1']).toBe(true);
    expect(result.done['u1-l2']).toBe(true);
  });

  test('cloud overwrites matching local key', () => {
    const local = makeLocal({ done: { 'u1-l1': false } });
    const cloud = makeCloud({ prog: { done_json: { 'u1-l1': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
    const result = _mergeCloudData(local, cloud);
    expect(result.done['u1-l1']).toBe(true);
  });

  test('local-only keys survive', () => {
    const local = makeLocal({ done: { 'u2-l3': true } });
    const cloud = makeCloud({ prog: { done_json: { 'u1-l1': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
    const result = _mergeCloudData(local, cloud);
    expect(result.done['u2-l3']).toBe(true);
  });

  test('prototype pollution keys are rejected', () => {
    const local = makeLocal();
    const cloud = makeCloud({ prog: { done_json: { '__proto__': true, 'constructor': true, 'prototype': true, 'safe-key': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
    const result = _mergeCloudData(local, cloud);
    expect(result.done['safe-key']).toBe(true);
    expect(Object.prototype.polluted).toBeUndefined();
    expect(Object.hasOwn(result.done, '__proto__')).toBe(false);
    expect(Object.hasOwn(result.done, 'constructor')).toBe(false);
    expect(Object.hasOwn(result.done, 'prototype')).toBe(false);
  });

  test('non-boolean values are coerced to boolean', () => {
    const local = makeLocal();
    const cloud = makeCloud({ prog: { done_json: { 'u1-l1': 1, 'u1-l2': 0 }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
    const result = _mergeCloudData(local, cloud);
    expect(result.done['u1-l1']).toBe(true);
    expect(result.done['u1-l2']).toBe(false);
  });
});

// ── SCORES append-only ───────────────────────────────────────────────────────
describe('SCORES append-only merge', () => {
  test('remote score with new local_id is appended', () => {
    const local = makeLocal({ scores: [makeScore({ id: 1 })] });
    const remote = [{ local_id:2, qid:'q2', label:'', type:'', score:5, total:10, pct:50,
      stars:'⭐', unit_idx:1, color:'', student_name:'', time_taken:20, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
    const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
    expect(result.scores).toHaveLength(2);
  });

  test('remote score with existing local_id is ignored', () => {
    const local = makeLocal({ scores: [makeScore({ id: 1 })] });
    const remote = [{ local_id:1, qid:'q1', label:'', type:'', score:5, total:10, pct:50,
      stars:'⭐', unit_idx:1, color:'', student_name:'', time_taken:20, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
    const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
    expect(result.scores).toHaveLength(1);
  });

  test('merged scores are sorted descending by id', () => {
    const local = makeLocal({ scores: [makeScore({ id: 1 })] });
    const remote = [{ local_id:5, qid:'q2', label:'', type:'', score:5, total:10, pct:50,
      stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
    const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
    expect(result.scores[0].id).toBe(5);
    expect(result.scores[1].id).toBe(1);
  });

  test('scores capped at 200 after merge', () => {
    const local = makeLocal({ scores: Array.from({length:199}, (_,i) => makeScore({ id:i+1 })) });
    const remote = [
      { local_id:200, qid:'q', label:'', type:'', score:1, total:1, pct:100, stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false },
      { local_id:201, qid:'q', label:'', type:'', score:1, total:1, pct:100, stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false },
    ];
    const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
    expect(result.scores).toHaveLength(200);
  });

  test('invalid remote score (missing qid) is filtered out', () => {
    const local = makeLocal();
    const remote = [{ local_id:1, qid:null, label:'', type:'', score:5, total:10, pct:50,
      stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
    const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
    expect(result.scores).toHaveLength(0);
  });

  test('remote score with pct > 100 is filtered out', () => {
    const local = makeLocal();
    const remote = [{ local_id:1, qid:'q', label:'', type:'', score:5, total:10, pct:150,
      stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
    const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
    expect(result.scores).toHaveLength(0);
  });
});

// ── STREAK last-writer-wins ──────────────────────────────────────────────────
describe('STREAK last-writer-wins', () => {
  test('server date newer → adopt server values', () => {
    const local = makeLocal({ streak: { current:3, longest:5, lastDate:'2026-03-29' } });
    const profile = { current_streak:7, longest_streak:10, last_activity_date:'2026-03-30' };
    const result = _mergeCloudData(local, makeCloud({ profile }));
    expect(result.streak.current).toBe(7);
    expect(result.streak.lastDate).toBe('2026-03-30');
  });

  test('server date older → keep local', () => {
    const local = makeLocal({ streak: { current:5, longest:5, lastDate:'2026-03-30' } });
    const profile = { current_streak:2, longest_streak:3, last_activity_date:'2026-03-28' };
    const result = _mergeCloudData(local, makeCloud({ profile }));
    expect(result.streak.current).toBe(5);
  });

  test('longest_streak uses Math.max (never decreases)', () => {
    const local = makeLocal({ streak: { current:1, longest:20, lastDate:'2026-03-30' } });
    const profile = { current_streak:10, longest_streak:15, last_activity_date:'2026-03-30' };
    const result = _mergeCloudData(local, makeCloud({ profile }));
    expect(result.streak.longest).toBe(20);
  });

  test('missing local lastDate → adopt server', () => {
    const local = makeLocal({ streak: { current:0, longest:0, lastDate:'' } });
    const profile = { current_streak:3, longest_streak:3, last_activity_date:'2026-03-30' };
    const result = _mergeCloudData(local, makeCloud({ profile }));
    expect(result.streak.current).toBe(3);
  });
});

// ── MASTERY higher-attempts-wins ─────────────────────────────────────────────
describe('MASTERY higher-attempts-wins', () => {
  test('higher remote attempts → replace local', () => {
    const local = makeLocal({ mastery: { 'add-2': { attempts:3, correct:2, lastSeen:0 } } });
    const mastery_json = { 'add-2': { attempts:5, correct:4, lastSeen:1 } };
    const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
    expect(result.mastery['add-2'].attempts).toBe(5);
  });

  test('equal attempts, higher remote correct → replace local', () => {
    const local = makeLocal({ mastery: { 'add-2': { attempts:3, correct:1, lastSeen:0 } } });
    const mastery_json = { 'add-2': { attempts:3, correct:3, lastSeen:0 } };
    const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
    expect(result.mastery['add-2'].correct).toBe(3);
  });

  test('lower remote attempts → keep local', () => {
    const local = makeLocal({ mastery: { 'add-2': { attempts:10, correct:8, lastSeen:0 } } });
    const mastery_json = { 'add-2': { attempts:3, correct:3, lastSeen:0 } };
    const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
    expect(result.mastery['add-2'].attempts).toBe(10);
  });

  test('missing local key → adopt remote', () => {
    const local = makeLocal({ mastery: {} });
    const mastery_json = { 'sub-3': { attempts:2, correct:1, lastSeen:0 } };
    const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
    expect(result.mastery['sub-3']).toBeDefined();
    expect(result.mastery['sub-3'].attempts).toBe(2);
  });
});

// ── APP_TIME max-per-day ─────────────────────────────────────────────────────
describe('APP_TIME max merge', () => {
  test('remote totalSecs higher → adopt', () => {
    const local = makeLocal({ appTime: { totalSecs:100, sessions:1, dailySecs:{} } });
    const apptime_json = { totalSecs:500, sessions:3, dailySecs:{} };
    const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json:{}, apptime_json } }));
    expect(result.appTime.totalSecs).toBe(500);
  });

  test('remote dailySecs wins per-day max', () => {
    const local = makeLocal({ appTime: { totalSecs:0, sessions:0, dailySecs: { '2026-03-30': 120 } } });
    const apptime_json = { totalSecs:0, sessions:0, dailySecs: { '2026-03-30': 300, '2026-03-29': 60 } };
    const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json:{}, apptime_json } }));
    expect(result.appTime.dailySecs['2026-03-30']).toBe(300);
    expect(result.appTime.dailySecs['2026-03-29']).toBe(60);
  });
});
