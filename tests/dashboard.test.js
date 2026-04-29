'use strict';

const {
  getCategoryFromId,
  _computeOverallStats,
  _computeSkillBreakdown,
  _computeWeakAreas,
  _computeActivityData,
  _computeReviewQueue,
  _parseUnlockSettings,
  _parseTimerSettings,
  _isUnitUnlockedInDraft,
  _isLessonUnlockedInDraft,
  buildParentInsight,
  _computeUnitInsights,
  _unitIndexFromId,
  normalizeGrade,
  _filterActivityByGrade,
  _masteryKeyFor,
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

// ── _parseUnlockSettings ──────────────────────────────────────────────────
describe('_parseUnlockSettings', () => {
  test('returns defaults for empty object', () => {
    const r = _parseUnlockSettings({});
    expect(r.freeMode).toBe(false);
    expect(r.units).toEqual([]);
    expect(r.lessons).toEqual({});
  });

  test('returns defaults for null/undefined', () => {
    expect(_parseUnlockSettings(null).freeMode).toBe(false);
    expect(_parseUnlockSettings(undefined).units).toEqual([]);
  });

  test('parses freeMode, units, lessons from valid object', () => {
    const r = _parseUnlockSettings({ freeMode: true, units: [0,2], lessons: { '1_2': true } });
    expect(r.freeMode).toBe(true);
    expect(r.units).toEqual([0, 2]);
    expect(r.lessons['1_2']).toBe(true);
  });
});

// ── _parseTimerSettings ───────────────────────────────────────────────────
describe('_parseTimerSettings', () => {
  test('returns defaults for empty object', () => {
    const r = _parseTimerSettings({});
    expect(r.enabled).toBe(true);
    expect(r.lessonSecs).toBe(300);
    expect(r.unitSecs).toBe(600);
    expect(r.finalSecs).toBe(3600);
  });

  test('uses provided values when present', () => {
    const r = _parseTimerSettings({ enabled: false, lessonSecs: 120, unitSecs: 300, finalSecs: 1800 });
    expect(r.enabled).toBe(false);
    expect(r.lessonSecs).toBe(120);
    expect(r.unitSecs).toBe(300);
    expect(r.finalSecs).toBe(1800);
  });

  test('returns defaults for null/undefined', () => {
    expect(_parseTimerSettings(null).enabled).toBe(true);
  });
});

// ── _isUnitUnlockedInDraft ────────────────────────────────────────────────
describe('_isUnitUnlockedInDraft', () => {
  test('returns true when freeMode is on', () => {
    expect(_isUnitUnlockedInDraft({ freeMode: true, units: [], lessons: {} }, 5)).toBe(true);
  });

  test('returns true when unitIdx is in units array', () => {
    expect(_isUnitUnlockedInDraft({ freeMode: false, units: [0, 2, 4], lessons: {} }, 2)).toBe(true);
  });

  test('returns false when unitIdx not in units array and freeMode off', () => {
    expect(_isUnitUnlockedInDraft({ freeMode: false, units: [0, 1], lessons: {} }, 3)).toBe(false);
  });
});

// ── _isLessonUnlockedInDraft ──────────────────────────────────────────────
describe('_isLessonUnlockedInDraft', () => {
  test('returns true when freeMode is on', () => {
    expect(_isLessonUnlockedInDraft({ freeMode: true, units: [], lessons: {} }, 0, 3)).toBe(true);
  });

  test('returns true when lesson key exists in lessons', () => {
    expect(_isLessonUnlockedInDraft({ freeMode: false, units: [], lessons: { '2_1': true } }, 2, 1)).toBe(true);
  });

  test('returns false when lesson key absent', () => {
    expect(_isLessonUnlockedInDraft({ freeMode: false, units: [], lessons: {} }, 2, 1)).toBe(false);
  });
});

// ── buildParentInsight ────────────────────────────────────────────────────

const TEST_TAG_LABELS = {
  regrouping:  'Regrouping',
  place_value: 'Place Value',
  counting:    'Counting',
  subtraction: 'Subtraction',
};
const TEST_ERR_LABELS = {
  err_no_regroup:      'Forgot to regroup',
  err_reversed_digits: 'Reversed Digits',
};
const noopLessonFn = () => null;
const lessonFn = (id) =>
  id === 'ku3l2' ? { lesson: 'Subtracting Numbers', unit: 'Addition & Subtraction' } : null;

function makeActivity(overrides) {
  return Object.assign(
    { ts: Date.now(), correct: true, errorType: null, tags: [], lessonId: null },
    overrides
  );
}
function makeSc(overrides) {
  return Object.assign({ pct: 80, score: 8, total: 10 }, overrides);
}

describe('buildParentInsight', () => {
  const BASE_OPTS = { tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn };

  test('no-data: fewer than 3 total questions answered', () => {
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: {}, activityEvents: [], scores: [makeSc({ total: 2 })], studentName: 'Alex',
    });
    expect(r.tier).toBe('no-data');
    expect(r.cssTier).toBe('no-data');
    expect(r.confidence).toBe('none');
    expect(r.headline).toBe('Not enough data');
    expect(r.summary).toContain('Alex');
    expect(r.summary).not.toMatch(/err_/);
    expect(r.weakTag).toBeNull();
    expect(r.trend).toBe('steady');
  });

  test('low-data: 3-9 questions, no tags with enough attempts', () => {
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: { regrouping: { attempts: 2, correct: 1 } },
      activityEvents: [], scores: [makeSc({ pct: 50, total: 5 })], studentName: 'Alex',
    });
    expect(r.tier).toBe('low-data');
    expect(r.confidence).toBe('low');
    expect(r.headline).toBe('Getting started');
    expect(r.actionLabel).toContain('quiz');
  });

  test('needs-review: weak tag, steady trend, lesson resolved', () => {
    const events = [
      makeActivity({ correct: false, errorType: 'err_no_regroup', tags: ['regrouping'], lessonId: 'ku3l2', ts: 1000 }),
      makeActivity({ correct: false, errorType: 'err_no_regroup', tags: ['regrouping'], lessonId: 'ku3l2', ts: 2000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], lessonId: 'ku3l2', ts: 3000 }),
    ];
    const r = buildParentInsight({ ...BASE_OPTS,
      lessonNameFn: lessonFn,
      mastery: { regrouping: { attempts: 8, correct: 3 } },
      activityEvents: events,
      scores: [makeSc({ pct: 40, total: 10 }), makeSc({ pct: 40, total: 5 })],
      studentName: 'Alex',
    });
    expect(r.tier).toBe('needs-review');
    expect(r.weakTagLabel).toBe('Regrouping');
    expect(r.summary).toContain('Regrouping');
    expect(r.summary).not.toContain('err_');
    expect(r.commonErrorLabel).toBe('Forgot to regroup');
    expect(r.actionLessonName).toBe('Subtracting Numbers');
    expect(r.actionLabel).toContain('Subtracting Numbers');
  });

  test('improving: weak tag, recent accuracy rising', () => {
    const now = Date.now();
    const events = [
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 9000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 8000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 7000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 6000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 5000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 4000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 3000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 2000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 1000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now }),
    ];
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: { regrouping: { attempts: 10, correct: 4 } },
      activityEvents: events,
      scores: [makeSc({ pct: 40, total: 5 }), makeSc({ pct: 40, total: 5 })],
      studentName: 'Alex',
    });
    expect(r.tier).toBe('improving');
    expect(r.trend).toBe('improving');
    expect(r.summary).toContain('improving');
  });

  test('declining: weak tag, recent accuracy dropping', () => {
    const now = Date.now();
    const events = [
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 9000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 8000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 7000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 6000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 5000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 4000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 3000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now - 2000 }),
      makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 1000 }),
      makeActivity({ correct: false, tags: ['regrouping'], ts: now }),
    ];
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: { regrouping: { attempts: 10, correct: 5 } },
      activityEvents: events,
      scores: [makeSc({ pct: 50, total: 5 }), makeSc({ pct: 50, total: 5 })],
      studentName: 'Alex',
    });
    expect(r.tier).toBe('declining');
    expect(r.trend).toBe('declining');
    expect(r.summary).toContain('more misses');
    expect(r.headline).toBe('Needs attention');
  });

  test('strong: no weak tags, high accuracy', () => {
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: {
        regrouping:  { attempts: 10, correct: 9 },
        place_value: { attempts: 8,  correct: 7 },
      },
      activityEvents: [],
      scores: [makeSc({ pct: 88, total: 10 }), makeSc({ pct: 88, total: 10 }),
               makeSc({ pct: 88, total: 10 }), makeSc({ pct: 88, total: 10 })],
      studentName: 'Alex',
    });
    expect(r.tier).toBe('strong');
    expect(r.cssTier).toBe('strong');
    expect(r.headline).toBe('Strong');
    expect(r.weakTag).toBeNull();
    expect(r.summary).toContain('doing well');
  });

  test('mixed: strong + weak skill coexist', () => {
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: {
        place_value: { attempts: 8,  correct: 7 },
        regrouping:  { attempts: 10, correct: 4 },
      },
      activityEvents: [],
      scores: [makeSc({ pct: 60, total: 10 }), makeSc({ pct: 60, total: 10 }), makeSc({ pct: 60, total: 10 })],
      studentName: 'Alex',
    });
    expect(r.tier).toBe('mixed');
    expect(r.weakTagLabel).toBe('Regrouping');
    expect(r.strongTagLabel).toBe('Place Value');
    expect(r.summary).toContain('Place Value');
    expect(r.summary).toContain('Regrouping');
    expect(r.summary).not.toContain('err_');
  });

  test('no raw tag keys in any string field', () => {
    const r = buildParentInsight({ ...BASE_OPTS,
      mastery: { regrouping: { attempts: 8, correct: 3 } },
      activityEvents: [makeActivity({ errorType: 'err_no_regroup', correct: false, tags: ['regrouping'] })],
      scores: [makeSc({ pct: 38, total: 10 }), makeSc({ pct: 38, total: 5 })],
      studentName: 'TestChild',
    });
    [r.headline, r.summary, r.actionLabel, r.why].forEach(function(f) {
      expect(f).not.toMatch(/err_/);
      expect(f).not.toMatch(/regrouping|place_value|subtraction/);
    });
  });
});

// ── _computeUnitInsights ──────────────────────────────────────────────────

const TEST_UNITS_META = [
  { name: 'Basic Fact Strategies', lessons: ['Count Up & Count Back', 'Doubles!'] },
  { name: 'Place Value',           lessons: ['Big Numbers', 'Skip Counting'] },
  { name: 'Add & Subtract',        lessons: ['Adding Bigger Numbers', 'Subtracting Numbers'] },
];
const UI_TAG_LABELS = { regrouping: 'Regrouping', place_value: 'Place Value' };
const UI_ERR_LABELS = { err_no_regroup: 'Forgot to regroup' };
const UI_ERR_HELP   = { err_no_regroup: 'Write out each step.' };
const noopLessonFnUi = () => null;
const lessonFnUi = (id) =>
  id === 'ku3l2' ? { lesson: 'Subtracting Numbers', unit: 'Add & Subtract' } : null;

const BASE_UI = {
  unitsMeta: TEST_UNITS_META, tagLabels: UI_TAG_LABELS,
  errLabels: UI_ERR_LABELS,  errHelpMap: UI_ERR_HELP,
  lessonNameFn: noopLessonFnUi,
};

describe('_computeUnitInsights', () => {
  test('no scores → all units not-started', () => {
    const result = _computeUnitInsights({ ...BASE_UI, scores: [], activityEvents: [] });
    expect(result).toHaveLength(3);
    result.forEach(function(u) {
      expect(u.status).toBe('not-started');
      expect(u.accuracy).toBeNull();
      expect(u.weakTagLabel).toBeNull();
    });
  });

  test('low-data: score exists but < 5 total questions', () => {
    const result = _computeUnitInsights({ ...BASE_UI,
      scores: [{ unitIdx: 0, pct: 40, score: 1, total: 3 }],
      activityEvents: [],
    });
    expect(result[0].status).toBe('low-data');
    expect(result[0].accuracy).toBe(40);
    expect(result[1].status).toBe('not-started');
    expect(result[2].status).toBe('not-started');
  });

  test('needs-review: weak tag resolves to parent label, error help included', () => {
    const events = [
      { unitId: 2, correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'ku3l2', ts: 1000 },
      { unitId: 2, correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'ku3l2', ts: 2000 },
      { unitId: 2, correct: true,  tags: ['regrouping'],                              lessonId: 'ku3l2', ts: 3000 },
    ];
    const result = _computeUnitInsights({ ...BASE_UI,
      lessonNameFn: lessonFnUi,
      scores: [{ unitIdx: 2, pct: 35, score: 7, total: 20 }],
      activityEvents: events,
    });
    const u = result[2];
    expect(u.status).toBe('needs-review');
    expect(u.weakTagLabel).toBe('Regrouping');
    expect(u.topErrLabel).toBe('Forgot to regroup');
    expect(u.topErrHelp).toBe('Write out each step.');
    expect(u.lessonRec).toBe('Subtracting Numbers');
    expect(u.weakTagLabel).not.toMatch(/err_|regrouping/);
    expect(u.topErrLabel).not.toMatch(/err_/);
  });

  test('strong: accuracy >= 80%, no weak tags, other units untouched', () => {
    const result = _computeUnitInsights({ ...BASE_UI,
      scores: [{ unitIdx: 1, pct: 88, score: 22, total: 25 }],
      activityEvents: [],
    });
    expect(result[1].status).toBe('strong');
    expect(result[1].accuracy).toBe(88);
    expect(result[1].weakTagLabel).toBeNull();
    expect(result[0].status).toBe('not-started');
    expect(result[2].status).toBe('not-started');
  });

  test('grade-2 activity event with unitId "u3" enriches Unit 3', () => {
    const events = [
      { unitId: 'u3', correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'u3l2', ts: 1000 },
      { unitId: 'u3', correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'u3l2', ts: 2000 },
      { unitId: 'u3', correct: true,  tags: ['regrouping'],                              lessonId: 'u3l2', ts: 3000 },
    ];
    const result = _computeUnitInsights({ ...BASE_UI,
      lessonNameFn: (id) => id === 'u3l2' ? { lesson: 'Subtracting Bigger Numbers', unit: 'Add & Subtract' } : null,
      scores: [{ unitIdx: 2, pct: 35, score: 7, total: 20 }],
      activityEvents: events,
    });
    expect(result[2].status).toBe('needs-review');
    expect(result[2].weakTagLabel).toBe('Regrouping');
    expect(result[2].topErrLabel).toBe('Forgot to regroup');
    expect(result[2].lessonRec).toBe('Subtracting Bigger Numbers');
    expect(result[0].weakTagLabel).toBeNull();
    expect(result[1].weakTagLabel).toBeNull();
  });

  test('kindergarten activity event with unitId "ku3" enriches K Unit 3', () => {
    const events = [
      { unitId: 'ku3', correct: false, tags: ['subtraction'], errorType: 'err_off_by_one', lessonId: 'ku3l2', ts: 1000 },
      { unitId: 'ku3', correct: false, tags: ['subtraction'], errorType: 'err_off_by_one', lessonId: 'ku3l2', ts: 2000 },
      { unitId: 'ku3', correct: true,  tags: ['subtraction'],                              lessonId: 'ku3l2', ts: 3000 },
    ];
    const result = _computeUnitInsights({
      unitsMeta: [
        { name: 'Counting & Cardinality', lessons: [] },
        { name: 'Number Relationships',   lessons: [] },
        { name: 'Addition & Subtraction', lessons: ['Adding Numbers', 'Subtracting Numbers'] },
      ],
      tagLabels:    { subtraction: 'Subtraction' },
      errLabels:    { err_off_by_one: 'Off by one' },
      errHelpMap:   { err_off_by_one: 'Use objects: one finger touch per count.' },
      lessonNameFn: (id) => id === 'ku3l2' ? { lesson: 'Subtracting Numbers', unit: 'Addition & Subtraction' } : null,
      scores:       [{ unitIdx: 2, pct: 35, score: 7, total: 20 }],
      activityEvents: events,
    });
    expect(result[2].status).toBe('needs-review');
    expect(result[2].weakTagLabel).toBe('Subtraction');
    expect(result[2].topErrLabel).toBe('Off by one');
    expect(result[2].topErrHelp).toBe('Use objects: one finger touch per count.');
    expect(result[2].lessonRec).toBe('Subtracting Numbers');
    expect(result[2].weakTagLabel).not.toMatch(/err_|subtraction/);
    expect(result[2].topErrLabel).not.toMatch(/err_/);
  });

  test('mixed unitId formats in events all land on the right unit', () => {
    // Three events on Unit 3 expressed three different ways: integer, "u3", "ku3".
    // All must converge on index 2 so attempts cross the >= 3 threshold.
    const events = [
      { unitId: 2,     correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'u3l2', ts: 1000 },
      { unitId: 'u3',  correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'u3l2', ts: 2000 },
      { unitId: 'ku3', correct: true,  tags: ['regrouping'],                              lessonId: 'u3l2', ts: 3000 },
    ];
    const result = _computeUnitInsights({ ...BASE_UI,
      scores: [{ unitIdx: 2, pct: 33, score: 1, total: 3 }],
      activityEvents: events,
    });
    expect(result[2].weakTagLabel).toBe('Regrouping');
    expect(result[2].topErrLabel).toBe('Forgot to regroup');
  });

  test('events with malformed unitId are skipped, not crashed on', () => {
    const events = [
      { unitId: null,    correct: false, tags: ['x'], errorType: 'err_x', ts: 1 },
      { unitId: 'foo',   correct: false, tags: ['x'], errorType: 'err_x', ts: 2 },
      { /* missing */    correct: false, tags: ['x'], errorType: 'err_x', ts: 3 },
      { unitId: 'u3',    correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'u3l2', ts: 4 },
      { unitId: 'u3',    correct: false, tags: ['regrouping'], errorType: 'err_no_regroup', lessonId: 'u3l2', ts: 5 },
      { unitId: 'u3',    correct: true,  tags: ['regrouping'],                              lessonId: 'u3l2', ts: 6 },
    ];
    const result = _computeUnitInsights({ ...BASE_UI,
      scores: [{ unitIdx: 2, pct: 33, score: 1, total: 3 }],
      activityEvents: events,
    });
    expect(result[2].weakTagLabel).toBe('Regrouping');
  });
});

// ── normalizeGrade ────────────────────────────────────────────────────────

describe('normalizeGrade', () => {
  test('K-aliases all collapse to canonical "K"', () => {
    expect(normalizeGrade('K')).toBe('K');
    expect(normalizeGrade('k')).toBe('K');
    expect(normalizeGrade('Kindergarten')).toBe('K');
    expect(normalizeGrade('KINDERGARTEN')).toBe('K');
    expect(normalizeGrade('  k  ')).toBe('K');
    expect(normalizeGrade('0')).toBe('K');
    expect(normalizeGrade(0)).toBe('K');
  });
  test('Grade 2 stays "2"', () => {
    expect(normalizeGrade('2')).toBe('2');
    expect(normalizeGrade(2)).toBe('2');
  });
  test('null/undefined/empty falls through to "2"', () => {
    expect(normalizeGrade(null)).toBe('2');
    expect(normalizeGrade(undefined)).toBe('2');
    expect(normalizeGrade('')).toBe('2');
  });
  test('any unknown input falls through to "2" (safe default)', () => {
    expect(normalizeGrade('1')).toBe('2');
    expect(normalizeGrade('3')).toBe('2');
    expect(normalizeGrade('foo')).toBe('2');
    expect(normalizeGrade({})).toBe('2');
  });
  test('result only ever uses canonical case — never lowercase k or extended strings', () => {
    var inputs = ['k','K','Kindergarten','kindergarten','0',0,'2',2,null,undefined,'','1','foo'];
    inputs.forEach(function(v) {
      var out = normalizeGrade(v);
      expect(['K','2']).toContain(out);
    });
  });
});

// ── _filterActivityByGrade ────────────────────────────────────────────────

describe('_filterActivityByGrade', () => {
  const events = [
    { ts: 1, grade: 'K', tags: ['counting'],    correct: true  },
    { ts: 2, grade: '2', tags: ['regrouping'],  correct: false },
    { ts: 3, grade: 'k', tags: ['shapes'],      correct: true  }, // lowercase legacy
    { ts: 4, grade: 'K', tags: ['subtraction'], correct: false },
    { ts: 5, grade: '2', tags: ['addition'],    correct: true  },
    { ts: 6,             tags: ['legacy'],      correct: true  }, // missing grade — kept
  ];
  test('K active grade returns only K events plus untagged', () => {
    const out = _filterActivityByGrade(events, 'K');
    expect(out.map(function(e){ return e.ts; })).toEqual([1, 3, 4, 6]);
  });
  test('Grade 2 active grade returns only G2 events plus untagged', () => {
    const out = _filterActivityByGrade(events, '2');
    expect(out.map(function(e){ return e.ts; })).toEqual([2, 5, 6]);
  });
  test('lowercase active grade still works (caller may pass raw value)', () => {
    const out = _filterActivityByGrade(events, 'k');
    expect(out.map(function(e){ return e.ts; })).toEqual([1, 3, 4, 6]);
  });
  test('handles null events list', () => {
    expect(_filterActivityByGrade(null, 'K')).toEqual([]);
    expect(_filterActivityByGrade(undefined, '2')).toEqual([]);
  });
});

// ── _masteryKeyFor ────────────────────────────────────────────────────────

describe('_masteryKeyFor', () => {
  test('produces canonical grade-scoped keys', () => {
    expect(_masteryKeyFor('K')).toBe('mmr_mastery_v1_K');
    expect(_masteryKeyFor('2')).toBe('mmr_mastery_v1_2');
  });
  test('K-aliases all resolve to mmr_mastery_v1_K', () => {
    expect(_masteryKeyFor('k')).toBe('mmr_mastery_v1_K');
    expect(_masteryKeyFor('kindergarten')).toBe('mmr_mastery_v1_K');
    expect(_masteryKeyFor('0')).toBe('mmr_mastery_v1_K');
  });
  test('null/empty falls through to mmr_mastery_v1_2', () => {
    expect(_masteryKeyFor(null)).toBe('mmr_mastery_v1_2');
    expect(_masteryKeyFor('')).toBe('mmr_mastery_v1_2');
  });
});

// ── _unitIndexFromId ──────────────────────────────────────────────────────

describe('_unitIndexFromId', () => {
  test('parses grade-2 string ids (1-based → 0-based)', () => {
    expect(_unitIndexFromId('u1')).toBe(0);
    expect(_unitIndexFromId('u3')).toBe(2);
    expect(_unitIndexFromId('u10')).toBe(9);
  });
  test('parses kindergarten string ids', () => {
    expect(_unitIndexFromId('ku1')).toBe(0);
    expect(_unitIndexFromId('ku3')).toBe(2);
    expect(_unitIndexFromId('ku8')).toBe(7);
  });
  test('passes integer indices through unchanged', () => {
    expect(_unitIndexFromId(0)).toBe(0);
    expect(_unitIndexFromId(2)).toBe(2);
  });
  test('parses purely numeric strings', () => {
    expect(_unitIndexFromId('2')).toBe(2);
  });
  test('returns null for nullish or non-matching values', () => {
    expect(_unitIndexFromId(null)).toBeNull();
    expect(_unitIndexFromId(undefined)).toBeNull();
    expect(_unitIndexFromId('')).toBeNull();
    expect(_unitIndexFromId('foo')).toBeNull();
    expect(_unitIndexFromId(NaN)).toBeNull();
  });
});
