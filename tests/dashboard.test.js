'use strict';

const {
  getCategoryFromId,
  _computeOverallStats,
  _computeSkillBreakdown,
  _computeWeakAreas,
  _computeActivityData,
  _computeReviewQueue,
} = require('../dashboard/dashboard.js');

function makeScore(overrides) {
  return Object.assign({
    qid: 'lq_add_01', pct: 80, id: Date.now(), type: 'lesson',
    label: 'Addition - Quiz', date: '2026-03-30',
    score: 8, total: 10, unitIdx: 0, answers: [],
  }, overrides);
}

const TODAY     = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// ── getCategoryFromId ─────────────────────────────────────────────────────
describe('getCategoryFromId', () => {
  test('parses stable ID format u{N}-{cat}-{NNN}', () => {
    expect(getCategoryFromId('u1-add-01')).toEqual({ key: 'add', label: 'Addition' });
    expect(getCategoryFromId('u3-sub-07')).toEqual({ key: 'sub', label: 'Subtraction' });
    expect(getCategoryFromId('u5-mul-12')).toEqual({ key: 'mul', label: 'Multiplication' });
    expect(getCategoryFromId('u6-div-03')).toEqual({ key: 'div', label: 'Division' });
    expect(getCategoryFromId('u7-frac-01')).toEqual({ key: 'frac', label: 'Fractions' });
    expect(getCategoryFromId('u8-dec-02')).toEqual({ key: 'dec', label: 'Decimals' });
    expect(getCategoryFromId('u9-word-04')).toEqual({ key: 'word', label: 'Word Problems' });
  });

  test('returns fallback for unrecognized category code', () => {
    const r = getCategoryFromId('u1-xyz-01');
    expect(r.key).toBe('xyz');
    expect(r.label).toBe('xyz');
  });

  test('returns unknown for null or non-matching input', () => {
    expect(getCategoryFromId(null)).toEqual({ key: 'unknown', label: 'Unknown' });
    expect(getCategoryFromId('')).toEqual({ key: 'unknown', label: 'Unknown' });
    expect(getCategoryFromId('lq_add_01')).toEqual({ key: 'unknown', label: 'Unknown' });
  });
});

// ── _computeOverallStats ──────────────────────────────────────────────────
describe('_computeOverallStats', () => {
  const baseStreak  = { current: 3, longest: 7, lastDate: TODAY };
  const baseAppTime = { totalSecs: 3600, sessions: 12, dailySecs: { [TODAY]: 300, [YESTERDAY]: 600 } };

  test('returns zeros for empty scores', () => {
    const r = _computeOverallStats([], baseStreak, baseAppTime);
    expect(r.accuracy).toBe(0);
    expect(r.quizCount).toBe(0);
    expect(r.totalAttempted).toBe(0);
    expect(r.totalCorrect).toBe(0);
  });

  test('ignores scores with null pct or zero total', () => {
    const r = _computeOverallStats(
      [makeScore({ pct: null, total: 10 }), makeScore({ pct: 80, total: 0 })],
      baseStreak, baseAppTime
    );
    expect(r.quizCount).toBe(0);
  });

  test('computes accuracy as average of score pct values', () => {
    const r = _computeOverallStats(
      [makeScore({ pct: 100, score: 10, total: 10 }),
       makeScore({ pct: 60,  score: 6,  total: 10 }),
       makeScore({ pct: 80,  score: 8,  total: 10 })],
      baseStreak, baseAppTime
    );
    expect(r.accuracy).toBe(80);
    expect(r.totalCorrect).toBe(24);
    expect(r.totalAttempted).toBe(30);
  });

  test('passes streak.current through unchanged', () => {
    expect(_computeOverallStats([], { current: 5, longest: 5 }, baseAppTime).streak).toBe(5);
  });

  test('weekSecs excludes dates older than 7 days', () => {
    const appTime = { totalSecs: 0, sessions: 0,
      dailySecs: { [TODAY]: 300, [YESTERDAY]: 600, '2020-01-01': 9999 } };
    expect(_computeOverallStats([], baseStreak, appTime).weekSecs).toBe(900);
  });

  test('lastActive is date of first score in newest-first array', () => {
    const scores = [
      makeScore({ date: '2026-03-30', id: 3000 }),
      makeScore({ date: '2026-03-29', id: 2000 }),
    ];
    expect(_computeOverallStats(scores, baseStreak, baseAppTime).lastActive).toBe('2026-03-30');
  });

  test('handles missing appTime.dailySecs gracefully', () => {
    expect(_computeOverallStats([], baseStreak, { totalSecs: 0, sessions: 0 }).weekSecs).toBe(0);
  });
});

// ── _computeSkillBreakdown ────────────────────────────────────────────────
describe('_computeSkillBreakdown', () => {
  const unitNames = ['Basic Fact Strategies','Place Value','Addition','Subtraction',
    'Multiplication','Division','Fractions','Decimals','Geometry','Measurement'];

  test('returns empty array for no completed scores', () => {
    expect(_computeSkillBreakdown([], unitNames)).toEqual([]);
  });

  test('skips scores with null unitIdx', () => {
    expect(_computeSkillBreakdown([makeScore({ unitIdx: null })], unitNames)).toEqual([]);
  });

  test('groups by unitIdx, averages pct, sums score/total', () => {
    const scores = [
      makeScore({ unitIdx: 0, pct: 100, score: 10, total: 10 }),
      makeScore({ unitIdx: 0, pct: 60,  score: 6,  total: 10 }),
      makeScore({ unitIdx: 1, pct: 80,  score: 8,  total: 10 }),
    ];
    const r = _computeSkillBreakdown(scores, unitNames);
    expect(r).toHaveLength(2);
    const u0 = r.find(x => x.unitIdx === 0);
    expect(u0.accuracy).toBe(80);
    expect(u0.correct).toBe(16);
    expect(u0.total).toBe(20);
    expect(u0.label).toBe('Basic Fact Strategies');
  });

  test('sorts result by unitIdx ascending', () => {
    const scores = [makeScore({ unitIdx: 2 }), makeScore({ unitIdx: 0 }), makeScore({ unitIdx: 1 })];
    expect(_computeSkillBreakdown(scores, unitNames).map(x => x.unitIdx)).toEqual([0, 1, 2]);
  });

  test('uses fallback label for out-of-range unitIdx', () => {
    expect(_computeSkillBreakdown([makeScore({ unitIdx: 99 })], unitNames)[0].label).toBe('Unit 100');
  });
});

// ── _computeWeakAreas ─────────────────────────────────────────────────────
describe('_computeWeakAreas', () => {
  test('returns empty for empty input', () => {
    expect(_computeWeakAreas([])).toEqual([]);
  });

  test('excludes skills with total < 5', () => {
    expect(_computeWeakAreas([{ unitIdx:0, label:'A', accuracy:40, correct:2, total:4 }])).toEqual([]);
  });

  test('excludes skills with accuracy >= 70', () => {
    expect(_computeWeakAreas([{ unitIdx:0, label:'A', accuracy:70, correct:7, total:10 }])).toEqual([]);
  });

  test('sorts by accuracy asc and caps at 5', () => {
    const skills = [
      { unitIdx:0, label:'A', accuracy:60, correct:6, total:10 },
      { unitIdx:1, label:'B', accuracy:30, correct:3, total:10 },
      { unitIdx:2, label:'C', accuracy:50, correct:5, total:10 },
    ];
    const r = _computeWeakAreas(skills);
    expect(r).toHaveLength(3);
    expect(r.map(x => x.accuracy)).toEqual([30, 50, 60]);
  });

  test('returns at most 5 items', () => {
    const skills = Array.from({length:8}, (_,i) => ({ unitIdx:i, label:`U${i}`, accuracy:40, correct:4, total:10 }));
    expect(_computeWeakAreas(skills).length).toBeLessThanOrEqual(5);
  });
});

// ── _computeActivityData ──────────────────────────────────────────────────
describe('_computeActivityData', () => {
  test('returns exactly N days', () => {
    expect(_computeActivityData([], 7)).toHaveLength(7);
  });

  test('first entry is today', () => {
    expect(_computeActivityData([], 7)[0].date).toBe(TODAY);
  });

  test('counts completed quizzes per day', () => {
    const scores = [makeScore({ date: TODAY }), makeScore({ date: TODAY }), makeScore({ date: YESTERDAY })];
    const r = _computeActivityData(scores, 7);
    expect(r.find(d => d.date === TODAY).quizCount).toBe(2);
    expect(r.find(d => d.date === YESTERDAY).quizCount).toBe(1);
  });

  test('skips scores with null pct or zero total', () => {
    const scores = [makeScore({ date: TODAY, pct: null }), makeScore({ date: TODAY, total: 0 })];
    expect(_computeActivityData(scores, 7).find(d => d.date === TODAY).quizCount).toBe(0);
  });

  test('dayLabel is a valid abbreviated weekday', () => {
    const valid = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    _computeActivityData([], 7).forEach(d => expect(valid).toContain(d.dayLabel));
  });
});

// ── _computeReviewQueue ───────────────────────────────────────────────────
describe('_computeReviewQueue', () => {
  test('returns empty for empty mastery', () => {
    expect(_computeReviewQueue({}, {})).toEqual([]);
  });

  test('excludes items with null nextReview', () => {
    expect(_computeReviewQueue({ abc: { attempts:3, correct:2, lastSeen:1000, nextReview:null } }, {})).toEqual([]);
  });

  test('marks overdue vs upcoming correctly', () => {
    const now = Date.now();
    const mastery = {
      key1: { attempts:5, correct:3, lastSeen:0, nextReview: now - 86400000 },
      key2: { attempts:4, correct:4, lastSeen:0, nextReview: now + 86400000 },
    };
    const r = _computeReviewQueue(mastery, { key1:'What is 2+2?', key2:'What is 3x3?' });
    expect(r.find(x => x.key === 'key1').overdue).toBe(true);
    expect(r.find(x => x.key === 'key1').qText).toBe('What is 2+2?');
    expect(r.find(x => x.key === 'key1').accuracy).toBe(60);
    expect(r.find(x => x.key === 'key2').overdue).toBe(false);
  });

  test('falls back to empty string for missing qText', () => {
    const r = _computeReviewQueue({ x: { attempts:2, correct:1, lastSeen:0, nextReview: Date.now()+1000 } }, {});
    expect(r[0].qText).toBe('');
  });

  test('sorts overdue before upcoming', () => {
    const now = Date.now();
    const mastery = {
      a: { attempts:1, correct:1, lastSeen:0, nextReview: now + 1000 },
      b: { attempts:1, correct:1, lastSeen:0, nextReview: now - 1000 },
    };
    const r = _computeReviewQueue(mastery, {});
    expect(r[0].key).toBe('b');
  });
});
