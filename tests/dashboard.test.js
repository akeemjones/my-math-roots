'use strict';

// Minimal localStorage stub for tests that exercise grade-resolver paths.
// The dashboard module reads localStorage at runtime; without this, calls
// throw ReferenceError under Node's default test environment.
if (typeof globalThis.localStorage === 'undefined') {
  const _store = new Map();
  globalThis.localStorage = {
    getItem(k)        { return _store.has(k) ? _store.get(k) : null; },
    setItem(k, v)     { _store.set(String(k), String(v)); },
    removeItem(k)     { _store.delete(k); },
    clear()           { _store.clear(); },
    _reset()          { _store.clear(); }
  };
}

// Exercises the PRODUCTION dashboard (src/dashboard.js — the file build.js
// bundles into dist/app.js), loaded through the bundle harness so the globals
// it depends on (normalizeGrade from state.js) are present exactly as they are
// in the shipped app. Previously this suite imported dashboard/dashboard.js, a
// fork that is not deployed and had drifted behind production.
const { loadDashboard } = require('./dashboard-harness.js');

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
  _gradeBand,
  _unitsMetaForBand,
  _K_UNITS_META,
  _G1_UNITS_META,
  _UNITS_META,
  _inferScoreGrade,
  buildParentInsight,
  _computeUnitInsights,
  _unitIndexFromId,
  normalizeGrade,
  _summarizeInterventions,
  _dbResolveProfileGrade,
  _dbProfileGradeKey,
  _dbReadProfileGrade,
  _dbWriteProfileGrade,
  _filterInterventionsByGrade,
  _deriveMasteryFromActivity,
  buildLearningInsights,
  _aggregateMistakesFromScoreAnswers,
  _lessonDisplayName,
  _buildInterventionRowForSync,
  _normalizeInterventionRow,
  _normalizeAnswerDifficulty,
  _aggregateDifficultyPerformance,
  _aggregateDifficultyByLesson,
  _renderRecentQuizzes,
  _dbResetStudentInMemory,
  _dbProgressCacheKeysForReset,
  _dbResetEpochKey,
  _dbReadLocalResetEpoch,
  _dbWriteLocalResetEpoch,
  _dbShouldClearForResetEpoch,
} = loadDashboard(globalThis.localStorage);

function makeScore(overrides) {
  return Object.assign({
    qid: 'lq_add_01', pct: 80, id: Date.now(), type: 'lesson',
    label: 'Addition - Quiz', date: '2026-03-30',
    score: 8, total: 10, unitIdx: 0, answers: [],
  }, overrides);
}

const TODAY     = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// Production buckets activity by LOCAL day (src/dashboard.js _localDayKey), not
// UTC, so day-bucketing assertions must compare against local keys or they fail
// for anyone west of UTC late in the day. Mirrors _localDayKey exactly.
function localDayKey(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.getFullYear() + '-' +
    String(dt.getMonth() + 1).padStart(2, '0') + '-' +
    String(dt.getDate()).padStart(2, '0');
}
const TODAY_LOCAL     = localDayKey(new Date());
const YESTERDAY_LOCAL = localDayKey(new Date(Date.now() - 86400000));

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
    expect(_computeActivityData([], 7)[0].date).toBe(TODAY_LOCAL);
  });

  // Production buckets a score by _scoreDayKey(), which trusts `s.id` (the
  // epoch ms stamped at _finishQuiz) and derives a LOCAL day key; it only falls
  // back to parsing `s.date` when `id` is absent. The fork instead grouped on
  // the raw `s.date` string in UTC and had no _scoreDayKey at all — production
  // gained it as a timezone-correctness fix the fork never received.
  //
  // So the fixture must be internally consistent: a score dated yesterday also
  // carries yesterday's id, exactly as real data does. (The previous fixture
  // set `date: YESTERDAY` while makeScore defaulted `id: Date.now()`, which no
  // real score can be, and which production correctly buckets as today.)
  test('counts completed quizzes per day', () => {
    const scores = [
      makeScore({ date: TODAY, id: Date.now() }),
      makeScore({ date: TODAY, id: Date.now() - 1 }),
      makeScore({ date: YESTERDAY, id: Date.now() - 86400000 }),
    ];
    const r = _computeActivityData(scores, 7);
    expect(r.find(d => d.date === TODAY_LOCAL).quizCount).toBe(2);
    expect(r.find(d => d.date === YESTERDAY_LOCAL).quizCount).toBe(1);
  });

  test('buckets by the score timestamp, not the display date string', () => {
    // A score whose display string disagrees with its timestamp follows the
    // timestamp — the canonical value that survives sync.
    const r = _computeActivityData([makeScore({ date: YESTERDAY, id: Date.now() })], 7);
    expect(r.find(d => d.date === TODAY_LOCAL).quizCount).toBe(1);
    expect(r.find(d => d.date === YESTERDAY_LOCAL).quizCount).toBe(0);
  });

  test('skips scores with null pct or zero total', () => {
    const scores = [makeScore({ date: TODAY, pct: null }), makeScore({ date: TODAY, total: 0 })];
    expect(_computeActivityData(scores, 7).find(d => d.date === TODAY_LOCAL).quizCount).toBe(0);
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
  test('empty object returns empty byGrade scaffold', () => {
    const r = _parseUnlockSettings({});
    expect(r.schemaVersion).toBe(2);
    expect(r.byGrade.k.freeMode).toBe(false);
    expect(r.byGrade.g1.freeMode).toBe(false);
    expect(r.byGrade.g2.freeMode).toBe(false);
    expect(r.byGrade.g1.units).toEqual([]);
    expect(r.byGrade.g2.lessons).toEqual({});
  });

  test('null/undefined return empty byGrade scaffold', () => {
    expect(_parseUnlockSettings(null).byGrade.g2.freeMode).toBe(false);
    expect(_parseUnlockSettings(undefined).byGrade.g2.units).toEqual([]);
  });

  test('legacy flat shape migrates into active band slot, defaulting to g2', () => {
    const r = _parseUnlockSettings({ freeMode: true, units: [0,2], lessons: { '1_2': true } });
    expect(r.schemaVersion).toBe(2);
    expect(r.byGrade.g2.freeMode).toBe(true);
    expect(r.byGrade.g2.units).toEqual([0, 2]);
    expect(r.byGrade.g2.lessons['1_2']).toBe(true);
    // Other grades stay defaulted off
    expect(r.byGrade.g1.freeMode).toBe(false);
    expect(r.byGrade.k.freeMode).toBe(false);
  });

  test('legacy flat shape migrates into supplied activeBand', () => {
    const r = _parseUnlockSettings({ freeMode: true, units: [3], lessons: {} }, 'g1');
    expect(r.byGrade.g1.freeMode).toBe(true);
    expect(r.byGrade.g1.units).toEqual([3]);
    expect(r.byGrade.g2.freeMode).toBe(false);
  });

  test('schema-v2 byGrade input is preserved verbatim', () => {
    const r = _parseUnlockSettings({
      schemaVersion: 2,
      byGrade: {
        k:  { freeMode: false, units: [], lessons: {} },
        g1: { freeMode: true,  units: [2,4], lessons: { '3_1': true } },
        g2: { freeMode: false, units: [1], lessons: {} }
      }
    });
    expect(r.byGrade.g1.freeMode).toBe(true);
    expect(r.byGrade.g1.units).toEqual([2,4]);
    expect(r.byGrade.g1.lessons['3_1']).toBe(true);
    expect(r.byGrade.g2.units).toEqual([1]);
    expect(r.byGrade.k.freeMode).toBe(false);
  });

  test('LEGACY (pre-v2) flat-shape fields no longer leak onto top level', () => {
    const r = _parseUnlockSettings({ freeMode: true, units: [], lessons: {} });
    // After parse the new shape replaces the legacy flat shape — top-level
    // freeMode should be undefined, byGrade should be the source of truth.
    expect(r.freeMode).toBeUndefined();
    expect(r.units).toBeUndefined();
    expect(r.lessons).toBeUndefined();
  });

  // Backwards-compat (legacy flat input still produces a valid byGrade output)
  test('legacy shape with grades inherited still works for top-level access via byGrade.g2', () => {
    const r = _parseUnlockSettings({ freeMode: true, units: [0,2], lessons: { '1_2': true } });
    // Use byGrade.g2 directly for assertions against the migrated values.
    expect(r.byGrade.g2.freeMode).toBe(true);
    expect(r.byGrade.g2.units).toEqual([0, 2]);
    expect(r.byGrade.g2.lessons['1_2']).toBe(true);
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

// ── _isUnitUnlockedInDraft (byGrade-aware) ────────────────────────────────
describe('_isUnitUnlockedInDraft byGrade', () => {
  const draftWithBands = {
    schemaVersion: 2,
    byGrade: {
      k:  { freeMode: false, units: [],    lessons: {} },
      g1: { freeMode: true,  units: [],    lessons: {} },
      g2: { freeMode: false, units: [3,5], lessons: {} }
    }
  };

  test('g1 slot freeMode unlocks all G1 units', () => {
    expect(_isUnitUnlockedInDraft(draftWithBands, 7, 'g1')).toBe(true);
  });

  test('g2 slot units list unlocks just those units', () => {
    expect(_isUnitUnlockedInDraft(draftWithBands, 3, 'g2')).toBe(true);
    expect(_isUnitUnlockedInDraft(draftWithBands, 5, 'g2')).toBe(true);
    expect(_isUnitUnlockedInDraft(draftWithBands, 4, 'g2')).toBe(false);
  });

  test('k slot with no unlocks stays locked', () => {
    expect(_isUnitUnlockedInDraft(draftWithBands, 2, 'k')).toBe(false);
  });

  test('G1 freeMode does NOT leak into G2 or K', () => {
    expect(_isUnitUnlockedInDraft(draftWithBands, 7, 'g2')).toBe(false);
    expect(_isUnitUnlockedInDraft(draftWithBands, 7, 'k')).toBe(false);
  });

  test('legacy flat freeMode:true applies to G2 only — not G1 or K', () => {
    var legacy = { freeMode: true, units: [], lessons: {} };
    expect(_isUnitUnlockedInDraft(legacy, 5, 'g2')).toBe(true);
    expect(_isUnitUnlockedInDraft(legacy, 5, 'g1')).toBe(false);
    expect(_isUnitUnlockedInDraft(legacy, 5, 'k')).toBe(false);
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

// ── _gradeBand ────────────────────────────────────────────────────────────
describe('_gradeBand', () => {
  test('K aliases collapse to "k"', () => {
    expect(_gradeBand('K')).toBe('k');
    expect(_gradeBand('k')).toBe('k');
    expect(_gradeBand('Kindergarten')).toBe('k');
    expect(_gradeBand('0')).toBe('k');
  });
  test('Grade 1 aliases collapse to "g1"', () => {
    expect(_gradeBand('1')).toBe('g1');
    expect(_gradeBand('g1')).toBe('g1');
    expect(_gradeBand('Grade1')).toBe('g1');
    expect(_gradeBand('Grade 1')).toBe('g1');
  });
  test('Grade 2 aliases collapse to "g2"', () => {
    expect(_gradeBand('2')).toBe('g2');
    expect(_gradeBand('g2')).toBe('g2');
    expect(_gradeBand('Grade 2')).toBe('g2');
  });
  test('Unknown returns null', () => {
    expect(_gradeBand(null)).toBe(null);
    expect(_gradeBand(undefined)).toBe(null);
    expect(_gradeBand('')).toBe(null);
    expect(_gradeBand('foo')).toBe(null);
    expect(_gradeBand('5')).toBe(null);
  });
});

// ── _inferScoreGrade ──────────────────────────────────────────────────────
describe('_inferScoreGrade', () => {
  test('direct grade field takes precedence', () => {
    expect(_inferScoreGrade({ grade: 'g1', qid: 'lq_u2-l1-xyz' })).toBe('g1');
    expect(_inferScoreGrade({ grade: 'K' })).toBe('k');
  });
  test('Grade 1 qid prefix → g1', () => {
    expect(_inferScoreGrade({ qid: 'lq_g1u1-l1-xyz' })).toBe('g1');
    expect(_inferScoreGrade({ qid: 'g1u3_uq' })).toBe('g1');
  });
  test('Kindergarten qid prefix → k', () => {
    expect(_inferScoreGrade({ qid: 'lq_ku2-l1-zzz' })).toBe('k');
    expect(_inferScoreGrade({ qid: 'ku4_uq' })).toBe('k');
  });
  test('Legacy Grade 2 (no prefix) → g2', () => {
    expect(_inferScoreGrade({ qid: 'lq_u1-l2-add-01' })).toBe('g2');
    expect(_inferScoreGrade({ qid: 'u3_uq' })).toBe('g2');
  });
  test('sourceLessonId fallback used if qid is absent', () => {
    expect(_inferScoreGrade({ sourceLessonId: 'g1u4-l5-tens-add' })).toBe('g1');
  });
  test('Unrecognized → legacy_unknown', () => {
    expect(_inferScoreGrade({ qid: 'final_test' })).toBe('legacy_unknown');
    expect(_inferScoreGrade({ qid: 'random_thing' })).toBe('legacy_unknown');
    expect(_inferScoreGrade(null)).toBe('legacy_unknown');
    expect(_inferScoreGrade({})).toBe('legacy_unknown');
  });
  test('invalid grade field falls through to inference / legacy_unknown', () => {
    // Bad grade='5' with no qid → no inference possible → legacy_unknown
    expect(_inferScoreGrade({ grade: '5' })).toBe('legacy_unknown');
    // Bad grade='5' but qid prefix wins
    expect(_inferScoreGrade({ grade: '5', qid: 'lq_g1u1-l1' })).toBe('legacy_unknown');
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
  test('Grade 1 stays "1"', () => {
    expect(normalizeGrade('1')).toBe('1');
    expect(normalizeGrade(1)).toBe('1');
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
    expect(normalizeGrade('foo')).toBe('2');
    expect(normalizeGrade({})).toBe('2');
  });
  test('Grade 3 normalizes to "3" (selectable grade)', () => {
    expect(normalizeGrade('3')).toBe('3');
    expect(normalizeGrade(3)).toBe('3');
  });
  test('result only ever uses a canonical value — never lowercase k or extended strings', () => {
    var inputs = ['k','K','Kindergarten','kindergarten','0',0,'1',1,'2',2,null,undefined,'','3','foo'];
    inputs.forEach(function(v) {
      var out = normalizeGrade(v);
      expect(['K','1','2','3']).toContain(out);
    });
  });
});

// ── Grade-scoped mastery key format ───────────────────────────────────────
//
//  This replaces a suite that tested `_masteryKeyFor()`, a helper that exists
//  ONLY in the non-shipping dashboard/dashboard.js fork — nothing in src/ ever
//  defined or called it, so those assertions proved nothing about the product.
//
//  The key FORMAT it described is real and load-bearing: src/auth.js builds it
//  inline as 'mmr_mastery_v1_' + normalizeGrade(grade) on the push and pull
//  paths. Getting it wrong silently detaches a student's mastery from their
//  grade. Since production inlines the formula rather than exposing a function,
//  pin it as a source contract (the convention tests/learning-calendar-hydrate
//  .test.js already uses) plus the normalizer that feeds it.
describe('grade-scoped mastery key (production formula in src/auth.js)', () => {
  const _fs = require('fs');
  const _path = require('path');
  const authSrc = _fs.readFileSync(_path.join(__dirname, '..', 'src', 'auth.js'), 'utf8');

  test('auth.js builds the mastery key from the normalized grade', () => {
    expect(authSrc).toMatch(/'mmr_mastery_v1_'\s*\+\s*_g\b/);
    expect(authSrc).toMatch(/'mmr_mastery_v1_'\s*\+\s*_gPull\b/);
  });

  test('the normalizer feeding the key canonicalizes every K alias', () => {
    expect('mmr_mastery_v1_' + normalizeGrade('K')).toBe('mmr_mastery_v1_K');
    expect('mmr_mastery_v1_' + normalizeGrade('k')).toBe('mmr_mastery_v1_K');
    expect('mmr_mastery_v1_' + normalizeGrade('kindergarten')).toBe('mmr_mastery_v1_K');
    expect('mmr_mastery_v1_' + normalizeGrade('0')).toBe('mmr_mastery_v1_K');
  });

  test('grades resolve to their own key; unknown falls back to Grade 2', () => {
    expect('mmr_mastery_v1_' + normalizeGrade('1')).toBe('mmr_mastery_v1_1');
    expect('mmr_mastery_v1_' + normalizeGrade('2')).toBe('mmr_mastery_v1_2');
    expect('mmr_mastery_v1_' + normalizeGrade(null)).toBe('mmr_mastery_v1_2');
    expect('mmr_mastery_v1_' + normalizeGrade('')).toBe('mmr_mastery_v1_2');
  });
});

// NOTE — coverage gap recorded during the production-test migration.
// The removed `_filterActivityByGrade` suite tested another fork-only phantom.
// Production filters activity events INLINE inside renderDashboard
// (src/dashboard.js, the `activityEvents` filter), and with different
// semantics: it compares _gradeBand() bands ('k'|'g1'|'g2'), not normalizeGrade
// tokens ('K'|'1'|'2'). That inline path has no unit coverage and cannot get
// any without extracting it, which is out of scope for a test-migration commit
// that must preserve production behavior. Close this when Phase 9 restructures
// renderDashboard. `_filterInterventionsByGrade` — the real, shipped sibling —
// remains covered below.

// ── _dbResolveProfileGrade ────────────────────────────────────────────────

describe('_dbResolveProfileGrade', () => {
  beforeEach(() => { globalThis.localStorage.clear(); });

  test('1. profile.grade takes top precedence', () => {
    localStorage.setItem('mmr_profile_grade_p1', '2');     // local cache says G2
    localStorage.setItem('mmr_grade', '2');                 // global flag says G2
    const profile = { id: 'p1', grade: 'K' };               // Supabase says K
    expect(_dbResolveProfileGrade(profile)).toBe('K');
  });

  test('1b. profile.grade is normalized (lowercase k → K)', () => {
    expect(_dbResolveProfileGrade({ id: 'p1', grade: 'k' })).toBe('K');
    expect(_dbResolveProfileGrade({ id: 'p2', grade: 'kindergarten' })).toBe('K');
    expect(_dbResolveProfileGrade({ id: 'p3', grade: '0' })).toBe('K');
  });

  test('1c. resolving from profile.grade also mirrors to local cache', () => {
    _dbResolveProfileGrade({ id: 'p1', grade: 'K' });
    expect(localStorage.getItem('mmr_profile_grade_p1')).toBe('K');
  });

  test('2. local cache (mmr_profile_grade_<id>) is second', () => {
    localStorage.setItem('mmr_profile_grade_p1', 'K');
    localStorage.setItem('mmr_grade', '2');
    expect(_dbResolveProfileGrade({ id: 'p1' })).toBe('K');                // profile has no grade → fall through to cache
    expect(_dbResolveProfileGrade(null, 'p1')).toBe('K');                  // accept fallback id
  });

  test('3. mmr_grade (global flag) is third', () => {
    localStorage.setItem('mmr_grade', 'K');
    expect(_dbResolveProfileGrade({ id: 'p1' })).toBe('K');
    expect(_dbResolveProfileGrade(null)).toBe('K');
  });

  test('3b. resolving from mmr_grade mirrors to local cache when id is known', () => {
    localStorage.setItem('mmr_grade', 'K');
    _dbResolveProfileGrade({ id: 'p1' });
    expect(localStorage.getItem('mmr_profile_grade_p1')).toBe('K');
  });

  test('4. final fallback is "2"', () => {
    expect(_dbResolveProfileGrade(null)).toBe('2');
    expect(_dbResolveProfileGrade(undefined)).toBe('2');
    expect(_dbResolveProfileGrade({})).toBe('2');
    expect(_dbResolveProfileGrade({ id: 'p1' })).toBe('2');
  });

  test('5. empty-string profile.grade falls through to next layer', () => {
    localStorage.setItem('mmr_grade', 'K');
    expect(_dbResolveProfileGrade({ id: 'p1', grade: '' })).toBe('K');
  });

  test('6. _dbReadProfileGrade is the cache-only read', () => {
    localStorage.setItem('mmr_profile_grade_p1', 'K');
    expect(_dbReadProfileGrade('p1')).toBe('K');
    expect(_dbReadProfileGrade('p2')).toBe('2');     // no cache → '2'
    expect(_dbReadProfileGrade(null)).toBe('2');
  });

  test('7. _dbWriteProfileGrade normalizes before write', () => {
    _dbWriteProfileGrade('p1', 'k');
    _dbWriteProfileGrade('p2', 'Kindergarten');
    _dbWriteProfileGrade('p3', '2');
    _dbWriteProfileGrade('p4', 'foo');                // unknown → '2'
    expect(localStorage.getItem('mmr_profile_grade_p1')).toBe('K');
    expect(localStorage.getItem('mmr_profile_grade_p2')).toBe('K');
    expect(localStorage.getItem('mmr_profile_grade_p3')).toBe('2');
    expect(localStorage.getItem('mmr_profile_grade_p4')).toBe('2');
  });
});

// ── grade split-brain isolation ──────────────────────────────────────────
// Regression suite for the bug where the grade context label (resolved from
// _managedProfiles[].grade) diverged from the data sections (reading
// localStorage.mmr_grade or hardcoded Grade 2 unit names).

describe('grade split-brain isolation', () => {
  // Mirrors _K_UNITS_META.map(u => u.name) from src/dashboard.js
  const K_UNIT_NAMES = [
    'Counting & Cardinality', 'Number Relationships', 'Addition & Subtraction',
    'Counting Patterns', 'Geometry — Shapes & Solids',
    'Measurement — Comparing & Ordering', 'Data Analysis',
    'Financial Literacy & Money',
  ];
  // Mirrors _unitNames() from src/dashboard.js
  const G2_UNIT_NAMES = [
    'Basic Fact Strategies', 'Place Value', 'Addition & Subtraction',
    'Subtraction', 'Multiplication', 'Division',
    'Fractions', 'Decimals', 'Geometry', 'Measurement',
  ];

  const mixedActivity = [
    { ts: 1, grade: 'K', unitId: 'ku3', lessonId: 'ku3l2', tags: ['shapes'],    correct: false },
    { ts: 2, grade: '2', unitId: 'u3',  lessonId: 'u3l1',  tags: ['regrouping'],correct: false },
    { ts: 3, grade: 'K', unitId: 'ku1', lessonId: 'ku1l1', tags: ['counting'],  correct: true  },
    { ts: 4, grade: '2', unitId: 'u1',  lessonId: 'u1l1',  tags: ['addition'],  correct: true  },
    { ts: 5,                            lessonId: 'legacy',                      correct: true  },
  ];

  // COVERAGE GAP (recorded during the production-test migration).
  //
  // This sub-suite called `_filterActivityByGrade(events, grade)`, which exists
  // only in the non-shipping dashboard/dashboard.js fork. Production has no
  // such function: renderDashboard filters activity events inline, and against
  // _gradeBand() bands ('k'|'g1'|'g2') rather than normalizeGrade() tokens
  // ('K'|'1'|'2'). The assertions therefore described a function the product
  // does not contain, and are removed rather than rewritten against a mirror
  // that could drift the same way the fork did.
  //
  // The grade-isolation property they guarded is still covered here by
  // `_filterInterventionsByGrade` (a real, shipped sibling), the skill-breakdown
  // and unit-name sub-suites, and the mastery-key isolation suite below. The
  // inline activity filter itself stays uncovered until Phase 9 restructures
  // renderDashboard and the filter can be extracted without changing behavior.

  describe('skill breakdown isolation (_computeSkillBreakdown)', () => {
    // Build 5+ scores at each unitIdx so _computeWeakAreas can fire
    function makeKScores(unitIdx, pct) {
      return Array.from({ length: 5 }, function(_, i) {
        return makeScore({ unitIdx: unitIdx, pct: pct, score: Math.round(pct / 10), total: 10, id: i + unitIdx * 100 });
      });
    }

    const kScores = makeKScores(0, 80).concat(makeKScores(3, 30)); // unit 3 weak

    test('K scores with K unit names produce K unit labels', () => {
      const skills = _computeSkillBreakdown(kScores, K_UNIT_NAMES);
      const labels = skills.map(function(s){ return s.label; });
      expect(labels).toContain('Counting & Cardinality');   // unitIdx 0
      expect(labels).toContain('Counting Patterns');        // unitIdx 3
    });

    test('K scores with K unit names do NOT produce Grade 2 labels', () => {
      const skills = _computeSkillBreakdown(kScores, K_UNIT_NAMES);
      const labels = skills.map(function(s){ return s.label; });
      expect(labels).not.toContain('Subtraction');          // G2 unitIdx 3
      expect(labels).not.toContain('Decimals');
      expect(labels).not.toContain('Division');
      expect(labels).not.toContain('Multiplication');
    });

    test('K weak areas with K unit names do NOT surface Grade 2 skill names', () => {
      const skills = _computeSkillBreakdown(kScores, K_UNIT_NAMES);
      const weak   = _computeWeakAreas(skills);
      const labels = weak.map(function(s){ return s.label; });
      expect(labels).not.toContain('Subtraction');
      expect(labels).not.toContain('Decimals');
      expect(labels).not.toContain('Division');
      // The actual weak unit in kScores is Counting Patterns (unitIdx 3)
      expect(labels).toContain('Counting Patterns');
    });

    test('Grade 2 scores with G2 unit names produce G2 unit labels', () => {
      const g2Scores = makeKScores(3, 35).concat(makeKScores(5, 25));
      const skills   = _computeSkillBreakdown(g2Scores, G2_UNIT_NAMES);
      const labels   = skills.map(function(s){ return s.label; });
      expect(labels).toContain('Subtraction');              // G2 unitIdx 3
      expect(labels).toContain('Division');                 // G2 unitIdx 5
      expect(labels).not.toContain('Counting Patterns');   // K unit name
    });
  });

  // Rebuilt on the production formula. `_masteryKeyFor()` was a fork-only
  // helper; production (src/auth.js) inlines 'mmr_mastery_v1_' + the
  // normalized grade. The format itself is pinned by the source-contract suite
  // above; here we assert the isolation property that matters — two grades can
  // never collide on one key.
  describe('mastery key isolation (production formula)', () => {
    const masteryKey = (g) => 'mmr_mastery_v1_' + normalizeGrade(g);

    test('K profile reads the K mastery key exclusively', () => {
      expect(masteryKey('K')).toBe('mmr_mastery_v1_K');
      expect(masteryKey('K')).not.toBe('mmr_mastery_v1_2');
    });

    test('Grade 2 profile reads the G2 mastery key exclusively', () => {
      expect(masteryKey('2')).toBe('mmr_mastery_v1_2');
      expect(masteryKey('2')).not.toBe('mmr_mastery_v1_K');
    });

    test('every supported grade gets a distinct key', () => {
      const keys = ['K', '1', '2'].map(masteryKey);
      expect(new Set(keys).size).toBe(3);
    });
  });
});

// ── Learning Insights reset behavior (_summarizeInterventions) ───────────
// Verifies that an empty intervention event list produces a zeroed summary
// (no Learning Insights section rendered), and that a populated list
// surfaces the expected counts — regression guard for the reset bug where
// _dbFullReset did not clear _remoteInterventionEvents.

describe('_summarizeInterventions', () => {
  test('empty events list produces zeroed summary (reset state)', () => {
    const summary = _summarizeInterventions([]);
    expect(summary.total).toBe(0);
    expect(summary.recoveryRate).toBe(0);
    expect(Object.keys(summary.byTag)).toHaveLength(0);
  });

  test('null/undefined events list is treated as empty', () => {
    expect(_summarizeInterventions(null).total).toBe(0);
    expect(_summarizeInterventions(undefined).total).toBe(0);
  });

  test('triggered events are counted by errorTag', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
    ];
    const s = _summarizeInterventions(events);
    expect(s.total).toBe(3);
    expect(s.byTag['err_off_by_one'].count).toBe(3);
    expect(s.recoveryRate).toBe(0); // no resolved events
  });

  test('recovery rate is correct proportion of resolved events', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: false },
    ];
    const s = _summarizeInterventions(events);
    expect(s.total).toBe(2);         // 2 triggered
    expect(s.recoveryRate).toBe(50); // 1 of 2 resolved correctly
    expect(s.byTag['err_off_by_one'].count).toBe(2);
    expect(s.byTag['err_off_by_one'].resolved).toBe(1);
  });

  test('multiple error tags are tracked independently', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_no_regroup' },
    ];
    const s = _summarizeInterventions(events);
    expect(s.total).toBe(3);
    expect(s.byTag['err_off_by_one'].count).toBe(2);
    expect(s.byTag['err_no_regroup'].count).toBe(1);
  });

  test('after simulated reset: cleared events produce same result as fresh profile', () => {
    // Simulates: events were populated, then reset clears _remoteInterventionEvents to []
    const beforeReset = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
    ];
    const afterReset = []; // _dbFullReset sets _remoteInterventionEvents = []

    const sBefore = _summarizeInterventions(beforeReset);
    const sAfter  = _summarizeInterventions(afterReset);

    expect(sBefore.total).toBe(3);         // had data before reset
    expect(sAfter.total).toBe(0);          // empty after reset
    expect(sAfter.recoveryRate).toBe(0);
    expect(Object.keys(sAfter.byTag)).toHaveLength(0);
  });

  test('other profile data is unaffected (different student IDs are isolated)', () => {
    // Profile A events (would belong to student A in Supabase)
    const profileAEvents = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
    ];
    // Profile B events (not cleared when profile A is reset)
    const profileBEvents = [
      { type: 'triggered', errorTag: 'err_no_regroup' },
      { type: 'triggered', errorTag: 'err_no_regroup' },
    ];

    const sA = _summarizeInterventions(profileAEvents);
    const sB = _summarizeInterventions(profileBEvents);

    expect(sA.total).toBe(1);
    expect(sA.byTag['err_off_by_one'].count).toBe(1);
    expect(sB.total).toBe(2);
    expect(sB.byTag['err_no_regroup'].count).toBe(2);
    // Resetting A (producing []) doesn't change B
    const sAAfterReset = _summarizeInterventions([]);
    expect(sAAfterReset.total).toBe(0);
    expect(sB.total).toBe(2); // B unchanged
  });
});

// ── _filterInterventionsByGrade ───────────────────────────────────────────
// Phase 1 grade-filter for Learning Insights intervention events. Events
// carry a `sessionId` minted by the quiz runtime which contains the qid prefix
// (lq_g1u1-l1-..., lq_ku2-l1-..., lq_u3-l2-...). Some events also carry an
// explicit `grade` field — when present, it overrides the inference.

describe('_filterInterventionsByGrade', () => {
  const events = [
    { type: 'triggered', errorTag: 'err_off_by_one',  sessionId: 'lq_g1u1-l1-abc' }, // → g1
    { type: 'triggered', errorTag: 'err_no_regroup',  sessionId: 'lq_u3-l2-xyz'  }, // → g2
    { type: 'triggered', errorTag: 'err_under_count', sessionId: 'lq_ku2-l1-abc' }, // → k
    { type: 'triggered', errorTag: 'err_explicit_g1', grade: 'g1', sessionId: 'random' }, // explicit g1
    { type: 'triggered', errorTag: 'err_legacy',      sessionId: 'final_test'    }, // → legacy_unknown
  ];

  test('Grade 1 view returns only g1 events', () => {
    const out = _filterInterventionsByGrade(events, 'g1');
    const tags = out.map(function(e){ return e.errorTag; });
    expect(tags).toContain('err_off_by_one');
    expect(tags).toContain('err_explicit_g1');
    expect(tags).not.toContain('err_no_regroup');
    expect(tags).not.toContain('err_under_count');
    expect(tags).not.toContain('err_legacy');
  });

  test('Grade 2 view returns only g2 events', () => {
    const out = _filterInterventionsByGrade(events, 'g2');
    expect(out.length).toBe(1);
    expect(out[0].errorTag).toBe('err_no_regroup');
  });

  test('Kindergarten view returns only k events', () => {
    const out = _filterInterventionsByGrade(events, 'k');
    expect(out.length).toBe(1);
    expect(out[0].errorTag).toBe('err_under_count');
  });

  test('legacy_unknown events are excluded from every grade view', () => {
    ['g1', 'g2', 'k'].forEach(function(band) {
      const out = _filterInterventionsByGrade(events, band);
      expect(out.find(function(e){ return e.errorTag === 'err_legacy'; })).toBeUndefined();
    });
  });

  test('explicit grade field overrides session-id inference', () => {
    const e = { type: 'triggered', errorTag: 'err_x', grade: 'k', sessionId: 'lq_g1u1-l1-xyz' };
    expect(_filterInterventionsByGrade([e], 'k').length).toBe(1);
    expect(_filterInterventionsByGrade([e], 'g1').length).toBe(0);
  });

  test('handles null/undefined event list', () => {
    expect(_filterInterventionsByGrade(null, 'g1')).toEqual([]);
    expect(_filterInterventionsByGrade(undefined, 'g1')).toEqual([]);
  });

  test('accepts canonical normalizeGrade aliases for the band argument', () => {
    expect(_filterInterventionsByGrade(events, '1').length).toBe(2);  // alias for g1
    expect(_filterInterventionsByGrade(events, '2').length).toBe(1);  // alias for g2
    expect(_filterInterventionsByGrade(events, 'K').length).toBe(1);  // alias for k
  });
});

// ── _deriveMasteryFromActivity ────────────────────────────────────────────
// Phase 1 mastery derivation: rebuild a mastery dict from already-grade-
// filtered activity events. Avoids leaking mastery across grades when the
// dashboard's view-band changes.

describe('_deriveMasteryFromActivity', () => {
  test('empty events → empty mastery', () => {
    expect(_deriveMasteryFromActivity([])).toEqual({});
    expect(_deriveMasteryFromActivity(null)).toEqual({});
    expect(_deriveMasteryFromActivity(undefined)).toEqual({});
  });

  test('aggregates attempts and correct per tag across events', () => {
    const events = [
      { ts: 1, correct: true,  tags: ['counting'] },
      { ts: 2, correct: false, tags: ['counting'] },
      { ts: 3, correct: true,  tags: ['counting', 'subtraction'] },
    ];
    const m = _deriveMasteryFromActivity(events);
    expect(m.counting.attempts).toBe(3);
    expect(m.counting.correct).toBe(2);
    expect(m.subtraction.attempts).toBe(1);
    expect(m.subtraction.correct).toBe(1);
  });

  test('tracks lastSeen as the max ts across events', () => {
    const events = [
      { ts: 5, correct: true, tags: ['x'] },
      { ts: 2, correct: true, tags: ['x'] },
      { ts: 8, correct: true, tags: ['x'] },
    ];
    expect(_deriveMasteryFromActivity(events).x.lastSeen).toBe(8);
  });

  test('skips events without a boolean correct field', () => {
    const events = [
      { ts: 1, tags: ['x'] },                 // no correct → skip
      { ts: 2, correct: 'yes', tags: ['x'] }, // not a boolean → skip
      { ts: 3, correct: true, tags: ['x'] },  // counts
    ];
    expect(_deriveMasteryFromActivity(events).x.attempts).toBe(1);
  });

  test('skips events with empty / missing tag arrays', () => {
    const events = [
      { ts: 1, correct: true, tags: [] },
      { ts: 2, correct: true },               // no tags
      { ts: 3, correct: true, tags: ['x'] },  // counts
    ];
    const m = _deriveMasteryFromActivity(events);
    expect(Object.keys(m)).toEqual(['x']);
  });

  test('grade-leak guard: derived mastery only contains tags from the events passed in', () => {
    // Caller filtered to g1 — derived mastery has no g2 traces.
    const g1Events = [
      { ts: 1, correct: false, tags: ['g1_saving'] },
      { ts: 2, correct: false, tags: ['g1_saving'] },
    ];
    const m = _deriveMasteryFromActivity(g1Events);
    expect(Object.keys(m)).toEqual(['g1_saving']);
    expect(m.g1_saving.attempts).toBe(2);
  });
});

// ── buildLearningInsights ─────────────────────────────────────────────────
// The Phase 1 redesigned Learning Insights builder. Returns a structured
// object describing the rendered cards. All inputs are assumed to be already
// filtered to the selected viewBand.

const LI_TAG_LABELS = {
  counting:   'Counting',
  regrouping: 'Regrouping',
  shapes:     'Shapes',
  saving:     'Saving and Spending',
  steady:     'Steady Practice',
};
const LI_ERR_LABELS = {
  err_off_by_one:              'Off by one',
  err_no_regroup:              'Forgot to regroup',
  err_spend_vs_save_confusion: 'Confuses spending now with saving for later',
};
const LI_ERR_HELP = {
  err_off_by_one:              'Use objects: one finger touch per count.',
  err_no_regroup:              'Write out each step.',
  err_spend_vs_save_confusion: 'Ask: "Are we using money today, or putting it away?"',
};
const LI_LESSON_FN = (id) => {
  if (id === 'g1u8-l3') return { lesson: 'Spending and Saving', unit: 'Financial Literacy' };
  if (id === 'g1u5-l1') return { lesson: 'Equal Parts',         unit: 'Geometry'           };
  return null;
};

describe('buildLearningInsights', () => {
  const BASE = {
    viewBand:     'g1',
    studentName:  'Alex',
    tagLabels:    LI_TAG_LABELS,
    errLabels:    LI_ERR_LABELS,
    errHelpMap:   LI_ERR_HELP,
    lessonNameFn: LI_LESSON_FN,
  };

  test('empty inputs → hasAnyData=false and not-enough-data on every card', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [], activityEvents: [], interventionEvents: [], mastery: {},
    }));
    expect(r.hasAnyData).toBe(false);
    expect(r.needsPractice).toEqual([]);
    expect(r.commonMistakes).toEqual([]);
    expect(r.strengths).toEqual([]);
    expect(r.trend.state).toBe('not-enough-data');
    expect(r.interventionRecovery.state).toBe('not-enough-data');
    expect(r.nextStep.kind).toBe('not-enough-data');
    expect(r.parentAction.label).toBeTruthy();
  });

  test('viewBand is carried through unchanged', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g1',
      scores: [], activityEvents: [], interventionEvents: [], mastery: {},
    }));
    expect(r.viewBand).toBe('g1');
  });

  test('needsPractice: top weak tag (≥3 attempts, <60%) labeled in parent language', () => {
    const mastery = {
      counting:   { attempts: 5, correct: 1, lastSeen: 0 }, // 20% — weakest
      regrouping: { attempts: 4, correct: 1, lastSeen: 0 }, // 25%
      shapes:     { attempts: 3, correct: 1, lastSeen: 0 }, // 33%
      saving:     { attempts: 6, correct: 5, lastSeen: 0 }, // strong, excluded
      tooFew:     { attempts: 2, correct: 0, lastSeen: 0 }, // <3, excluded
    };
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{ pct: 30, total: 10 }],
      activityEvents: [], interventionEvents: [],
      mastery: mastery,
    }));
    expect(r.needsPractice.length).toBeGreaterThanOrEqual(1);
    expect(r.needsPractice.length).toBeLessThanOrEqual(3);
    expect(r.needsPractice[0].label).toBe('Counting');
    expect(r.needsPractice[0].accuracy).toBe(20);
    r.needsPractice.forEach(function(np) {
      expect(np.label).not.toMatch(/^[a-z_]+$/);
      expect(np.why).not.toMatch(/err_/);
    });
  });

  test('commonMistakes: translates known err tags via errLabels and gates on count', () => {
    const events = [
      { ts: 1, correct: false, errorType: 'err_off_by_one', tags: [] },
      { ts: 2, correct: false, errorType: 'err_off_by_one', tags: [] },
      { ts: 3, correct: false, errorType: 'err_off_by_one', tags: [] },
      { ts: 4, correct: false, errorType: 'err_no_regroup', tags: [] },
      { ts: 5, correct: false, errorType: 'err_no_regroup', tags: [] }, // only 2, below 3 threshold
    ];
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{ pct: 30, total: 10 }],
      activityEvents: events,
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].errorType).toBe('err_off_by_one');
    expect(r.commonMistakes[0].label).toBe('Off by one');
    expect(r.commonMistakes[0].helpText).toBe('Use objects: one finger touch per count.');
    expect(r.commonMistakes[0].count).toBe(3);
  });

  test('strengths: only surfaced with ≥5 attempts AND ≥85% accuracy', () => {
    const mastery = {
      counting: { attempts: 10, correct: 9, lastSeen: 0 }, // 90% ✓
      shapes:   { attempts: 6,  correct: 5, lastSeen: 0 }, // 83% — below 85
      tooFew:   { attempts: 4,  correct: 4, lastSeen: 0 }, // <5 attempts
    };
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{ pct: 90, total: 20 }],
      activityEvents: [], interventionEvents: [],
      mastery: mastery,
    }));
    expect(r.strengths.length).toBe(1);
    expect(r.strengths[0].label).toBe('Counting');
    expect(r.strengths[0].accuracy).toBe(90);
  });

  test('trend: not-enough-data when fewer than 6 graded events', () => {
    const events = Array.from({length: 3}).map(function(_, i) {
      return { ts: i + 1, correct: true, tags: ['x'] };
    });
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [], activityEvents: events, interventionEvents: [], mastery: {},
    }));
    expect(r.trend.state).toBe('not-enough-data');
    expect(r.trend.sampleSize).toBe(3);
  });

  test('trend: improving when recent accuracy is ≥20% higher than older slice', () => {
    const events = [
      { ts: 1,  correct: false, tags: ['x'] },
      { ts: 2,  correct: false, tags: ['x'] },
      { ts: 3,  correct: false, tags: ['x'] },
      { ts: 4,  correct: false, tags: ['x'] },
      { ts: 5,  correct: false, tags: ['x'] },
      { ts: 6,  correct: true,  tags: ['x'] },
      { ts: 7,  correct: true,  tags: ['x'] },
      { ts: 8,  correct: true,  tags: ['x'] },
      { ts: 9,  correct: true,  tags: ['x'] },
      { ts: 10, correct: true,  tags: ['x'] },
    ];
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [], activityEvents: events, interventionEvents: [], mastery: {},
    }));
    expect(r.trend.state).toBe('improving');
  });

  test('nextStep: recommends the lesson where the top weak tag was most missed', () => {
    const mastery = { saving: { attempts: 5, correct: 1, lastSeen: 0 } }; // 20% weak
    const events = [
      { ts: 1, correct: false, tags: ['saving'], lessonId: 'g1u8-l3', errorType: 'err_spend_vs_save_confusion' },
      { ts: 2, correct: false, tags: ['saving'], lessonId: 'g1u8-l3', errorType: 'err_spend_vs_save_confusion' },
      { ts: 3, correct: false, tags: ['saving'], lessonId: 'g1u8-l3', errorType: 'err_spend_vs_save_confusion' },
    ];
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{ pct: 30, total: 10 }],
      activityEvents: events, interventionEvents: [],
      mastery: mastery,
    }));
    expect(r.nextStep.kind).toBe('lesson');
    expect(r.nextStep.lessonId).toBe('g1u8-l3');
    expect(r.nextStep.lessonName).toBe('Spending and Saving');
  });

  test('nextStep: keep-going when no weak tags and overall accuracy strong', () => {
    const mastery = { counting: { attempts: 10, correct: 9, lastSeen: 0 } };
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{ pct: 90, total: 10 }, { pct: 92, total: 10 }, { pct: 88, total: 10 }],
      activityEvents: [], interventionEvents: [], mastery: mastery,
    }));
    expect(r.nextStep.kind).toBe('keep-going');
  });

  test('interventionRecovery: not-enough-data when fewer than 2 triggered interventions', () => {
    const r1 = buildLearningInsights(Object.assign({}, BASE, {
      scores: [], activityEvents: [], interventionEvents: [], mastery: {},
    }));
    expect(r1.interventionRecovery.state).toBe('not-enough-data');

    const r2 = buildLearningInsights(Object.assign({}, BASE, {
      scores: [], activityEvents: [],
      interventionEvents: [{ type: 'triggered', errorTag: 'err_x' }],
      mastery: {},
    }));
    expect(r2.interventionRecovery.state).toBe('not-enough-data');
  });

  test('interventionRecovery: surfaces percent and top tag when ≥2 interventions', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [], activityEvents: [],
      interventionEvents: [
        { type: 'triggered', errorTag: 'err_off_by_one' },
        { type: 'triggered', errorTag: 'err_off_by_one' },
        { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      ],
      mastery: {},
    }));
    expect(r.interventionRecovery.state).not.toBe('not-enough-data');
    expect(r.interventionRecovery.total).toBe(2);
    expect(r.interventionRecovery.overallPct).toBe(50);
    expect(r.interventionRecovery.topTag).toBe('err_off_by_one');
  });

  test('parentAction.label is a complete parent sentence (no raw tags)', () => {
    const events = Array.from({length: 5}).map(function(_, i) {
      return { ts: i + 1, correct: false, tags: ['saving'], lessonId: 'g1u8-l3',
               errorType: 'err_spend_vs_save_confusion' };
    });
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{ pct: 30, total: 10 }],
      activityEvents: events, interventionEvents: [],
      mastery: { saving: { attempts: 5, correct: 1, lastSeen: 0 } },
    }));
    expect(r.parentAction.label.length).toBeGreaterThan(10);
    expect(r.parentAction.label).not.toMatch(/err_/);
    expect(r.parentAction.label).not.toMatch(/^[a-z_]+$/);
  });

  test('grade-leak guard: when the builder receives only g1 inputs the output has no g2 traces', () => {
    const g1Mastery = { saving: { attempts: 5, correct: 1, lastSeen: 0 } };
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g1',
      scores: [{ pct: 30, total: 10 }],
      activityEvents: [
        { ts: 1, correct: false, tags: ['saving'], lessonId: 'g1u8-l3', errorType: 'err_spend_vs_save_confusion' },
        { ts: 2, correct: false, tags: ['saving'], lessonId: 'g1u8-l3', errorType: 'err_spend_vs_save_confusion' },
        { ts: 3, correct: false, tags: ['saving'], lessonId: 'g1u8-l3', errorType: 'err_spend_vs_save_confusion' },
      ],
      interventionEvents: [],
      mastery: g1Mastery,
    }));
    const blob = JSON.stringify(r);
    // No legacy-G2 lesson id pattern (u3-l*) and no K prefix (ku*) in any field.
    expect(blob).not.toMatch(/\bu\d+-l\d+\b/);
    expect(blob).not.toMatch(/\bku\d+/);
    expect(r.needsPractice[0].label).toBe('Saving and Spending');
  });

  test('integration: Grade 1 view does not surface Grade 2 mistakes', () => {
    // Mixed intervention events; filter to g1 then feed to builder.
    const mixed = [
      { type: 'triggered', errorTag: 'err_no_regroup',  sessionId: 'lq_u3-l2-xyz'  }, // G2
      { type: 'triggered', errorTag: 'err_off_by_one',  sessionId: 'lq_g1u1-l1-a' },  // G1
      { type: 'triggered', errorTag: 'err_off_by_one',  sessionId: 'lq_g1u1-l1-b' },  // G1
      { type: 'triggered', errorTag: 'err_off_by_one',  sessionId: 'lq_g1u1-l1-c' },  // G1
    ];
    const filtered = _filterInterventionsByGrade(mixed, 'g1');
    expect(filtered.find(function(e){ return e.errorTag === 'err_no_regroup'; })).toBeUndefined();

    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g1',
      scores: [{ pct: 50, total: 10 }],
      activityEvents: [],
      interventionEvents: filtered,
      mastery: {},
    }));
    expect(JSON.stringify(r)).not.toContain('Forgot to regroup');
  });

  test('integration: Grade 2 view does not surface Grade 1 mistakes', () => {
    const mixed = [
      { type: 'triggered', errorTag: 'err_off_by_one', sessionId: 'lq_g1u1-l1-a' }, // G1
      { type: 'triggered', errorTag: 'err_no_regroup', sessionId: 'lq_u3-l2-x'   }, // G2
      { type: 'triggered', errorTag: 'err_no_regroup', sessionId: 'lq_u3-l2-y'   }, // G2
      { type: 'triggered', errorTag: 'err_no_regroup', sessionId: 'lq_u3-l2-z'   }, // G2
    ];
    const filtered = _filterInterventionsByGrade(mixed, 'g2');
    expect(filtered.find(function(e){ return e.errorTag === 'err_off_by_one'; })).toBeUndefined();

    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g2',
      scores: [{ pct: 50, total: 10 }],
      activityEvents: [],
      interventionEvents: filtered,
      mastery: {},
    }));
    expect(JSON.stringify(r)).not.toContain('Off by one');
  });

  describe('difficultyBreakdown (Phase 3A)', () => {
    function ans(ok, difficulty) { return { ok: ok, difficulty: difficulty }; }
    function scWith(answers, qid) {
      return {
        qid: qid || 'lq_g1u4-l1-x', pct: 80, id: Date.now() + Math.random(),
        type: 'lesson', label: 'Test', date: '2026-05-19',
        score: 0, total: answers.length, unitIdx: 3, answers: answers, grade: 'g1',
      };
    }
    const BASE3A = Object.assign({}, BASE, {
      viewBand: 'g1', activityEvents: [], mastery: {},
      interventionEvents: [], tagLessonIndex: null,
    });

    test('returns not-enough-data when total tagged answers < DIFF_MIN_TOTAL', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(true,  'easy'), ans(true,  'easy'),
          ans(false, 'hard'), ans(false, 'hard'),
          ans(true,  'medium'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).toBe('not-enough-data');
    });

    test('returns hard-struggle when hard accuracy < 60% and hard total >= 3', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(true,  'easy'),   ans(true,  'easy'),   ans(true,  'easy'),
          ans(true,  'medium'), ans(true,  'medium'), ans(true,  'medium'),
          ans(false, 'hard'),   ans(false, 'hard'),   ans(false, 'hard'),
          ans(true,  'hard'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).toBe('hard-struggle');
      expect(r.difficultyBreakdown.perf.hard.accuracy).toBeCloseTo(0.25, 2);
    });

    test('returns foundation-review when easy accuracy < 70% and easy total >= 3', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(false, 'easy'), ans(false, 'easy'), ans(true, 'easy'),
          ans(true,  'medium'), ans(true,  'medium'), ans(true, 'medium'),
          ans(true,  'hard'),   ans(true,  'hard'),   ans(true, 'hard'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).toBe('foundation-review');
    });

    test('returns ready-for-challenge when easy + medium >= 80% and hard >= 70%', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(true, 'easy'),   ans(true, 'easy'),   ans(true, 'easy'),
          ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'),
          ans(true, 'hard'),   ans(true, 'hard'),   ans(true, 'hard'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).toBe('ready-for-challenge');
    });

    test('returns balanced-progress when neither struggle nor ready triggers', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(true, 'easy'),   ans(true, 'easy'),   ans(true, 'easy'),   ans(false, 'easy'),
          ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'), ans(false, 'medium'),
          ans(true, 'hard'),   ans(true, 'hard'),   ans(true, 'hard'),   ans(false, 'hard'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).toBe('balanced-progress');
    });

    test('hard-struggle takes precedence over foundation-review when both trigger', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(false, 'easy'), ans(false, 'easy'), ans(true, 'easy'),
          ans(true,  'medium'), ans(true,  'medium'), ans(true, 'medium'),
          ans(false, 'hard'), ans(false, 'hard'), ans(false, 'hard'), ans(true, 'hard'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).toBe('hard-struggle');
    });

    test('does not make a claim about a level with < DIFF_MIN_PER_LEVEL answers', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(true, 'easy'), ans(true, 'easy'), ans(true, 'easy'), ans(true, 'easy'),
          ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'),
          ans(false, 'hard'), ans(false, 'hard'),
        ])],
      }));
      expect(r.difficultyBreakdown.state).not.toBe('hard-struggle');
    });

    test('topCluster identifies the lesson with the most hard misses', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [
          scWith([
            ans(false, 'hard'), ans(false, 'hard'), ans(false, 'hard'),
            ans(true,  'easy'), ans(true,  'easy'), ans(true,  'easy'),
          ], 'lq_g1u8-l3-a'),
          scWith([
            ans(false, 'hard'),
          ], 'lq_g1u5-l2-b'),
        ],
      }));
      expect(r.difficultyBreakdown.topCluster).toBeTruthy();
      expect(r.difficultyBreakdown.topCluster.lessonId).toBe('g1u8-l3');
      expect(r.difficultyBreakdown.topCluster.hardWrong).toBe(3);
    });

    test('topCluster is null when no lesson has DIFF_LESSON_CLUSTER_MIN+ hard misses', () => {
      const r = buildLearningInsights(Object.assign({}, BASE3A, {
        scores: [scWith([
          ans(true, 'easy'), ans(true, 'easy'), ans(true, 'easy'),
          ans(false, 'hard'), ans(false, 'hard'),
          ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'),
        ])],
      }));
      expect(r.difficultyBreakdown.topCluster).toBe(null);
    });
  });
});

// ── _aggregateMistakesFromScoreAnswers (Phase 2A) ─────────────────────────
// Aggregates per-question diagnostic error tags from score.answers[]. Inputs
// are assumed to already be grade-filtered by the caller. Output is an
// { errorType: count } map compatible with the existing Common Mistakes
// pipeline in buildLearningInsights.

describe('_aggregateMistakesFromScoreAnswers', () => {
  function sc(answers, overrides) {
    return Object.assign(
      { qid: 'lq_g1u8-l3-x', label: 'Test', type: 'lesson',
        score: 5, total: 10, pct: 50, stars: '', unitIdx: 7,
        date: '2026-05-18', time: '12:00', id: Date.now() + Math.random(),
        answers: answers || [], grade: 'g1' },
      overrides || {}
    );
  }

  test('returns empty object for empty input', () => {
    expect(_aggregateMistakesFromScoreAnswers([])).toEqual({});
    expect(_aggregateMistakesFromScoreAnswers(null)).toEqual({});
    expect(_aggregateMistakesFromScoreAnswers(undefined)).toEqual({});
  });

  test('counts errTag values across answers', () => {
    const scores = [
      sc([
        { t: 'q1', ok: false, errTag: 'err_off_by_one' },
        { t: 'q2', ok: false, errTag: 'err_off_by_one' },
        { t: 'q3', ok: true,  errTag: null },
      ]),
      sc([
        { t: 'q4', ok: false, errTag: 'err_off_by_one' },
        { t: 'q5', ok: false, errTag: 'err_no_regroup' },
      ]),
    ];
    const r = _aggregateMistakesFromScoreAnswers(scores);
    expect(r.err_off_by_one).toBe(3);
    expect(r.err_no_regroup).toBe(1);
  });

  test('ignores answers with errTag === null', () => {
    const r = _aggregateMistakesFromScoreAnswers([
      sc([
        { t: 'q1', ok: true,  errTag: null },
        { t: 'q2', ok: false, errTag: null },
      ]),
    ]);
    expect(r).toEqual({});
  });

  test('ignores answers missing the errTag field entirely (legacy)', () => {
    const r = _aggregateMistakesFromScoreAnswers([
      sc([
        { t: 'q1', ok: false },                       // legacy — no errTag
        { t: 'q2', ok: false, errTag: 'err_no_regroup' },
      ]),
    ]);
    expect(r.err_no_regroup).toBe(1);
    expect(Object.keys(r).length).toBe(1);
  });

  test('does not crash on legacy scores with no answers field', () => {
    const r = _aggregateMistakesFromScoreAnswers([
      sc(undefined, { answers: undefined }),
      sc(undefined, { answers: null }),
      sc(undefined, { answers: [] }),
    ]);
    expect(r).toEqual({});
  });

  test('does not crash on answers missing fields or null entries', () => {
    const r = _aggregateMistakesFromScoreAnswers([
      sc([
        null,
        undefined,
        { errTag: 'err_off_by_one' },                // no other fields
        { t: 'q', ok: true,  errTag: 'err_should_be_ignored' }, // correct: still counted? see next test
      ]),
    ]);
    // We include any answer with a truthy errTag (so the engine can record
    // a tag on correct-after-intervention etc.). The "ignore correct"
    // behavior is governed by errTag value, not by ok.
    expect(r.err_off_by_one).toBe(1);
  });

  test('correct answers with errTag: null are not counted', () => {
    // The quiz runtime sets errTag: null on correct answers by convention.
    // This test pins that convention.
    const r = _aggregateMistakesFromScoreAnswers([
      sc([
        { t: 'q1', ok: true, errTag: null },
        { t: 'q2', ok: true, errTag: null },
        { t: 'q3', ok: false, errTag: 'err_off_by_one' },
      ]),
    ]);
    expect(r.err_off_by_one).toBe(1);
    expect(Object.keys(r).length).toBe(1);
  });

  test('handles answers as a non-array gracefully', () => {
    const r = _aggregateMistakesFromScoreAnswers([
      sc(undefined, { answers: 'not an array' }),
      sc(undefined, { answers: 42 }),
    ]);
    expect(r).toEqual({});
  });
});

// ── buildLearningInsights merges score.answers errTags into Common Mistakes ─

describe('buildLearningInsights with score.answers errTags', () => {
  const BASE = {
    viewBand:     'g1',
    studentName:  'Alex',
    tagLabels:    LI_TAG_LABELS,
    errLabels:    LI_ERR_LABELS,
    errHelpMap:   LI_ERR_HELP,
    lessonNameFn: LI_LESSON_FN,
  };
  function scoreWith(errTags, grade) {
    var answers = errTags.map(function(t, i) {
      return { t: 'q'+i, ok: t == null, errTag: t };
    });
    return {
      qid: 'lq_g1u8-l3-x', pct: 50, total: errTags.length,
      score: errTags.filter(function(t){ return t == null; }).length,
      type: 'lesson', unitIdx: 7, grade: grade || 'g1',
      date: '2026-05-18', time: '10:00', id: Math.random(),
      answers: answers,
    };
  }

  test('Common Mistakes can be built from score.answers when activity is empty', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [
        scoreWith(['err_spend_vs_save_confusion', 'err_spend_vs_save_confusion', 'err_spend_vs_save_confusion']),
      ],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].errorType).toBe('err_spend_vs_save_confusion');
    expect(r.commonMistakes[0].count).toBe(3);
  });

  test('Common Mistakes merges activity errors and score.answers errTags', () => {
    // Activity has 2 of err_no_regroup; score.answers has 3 of err_off_by_one.
    // Both should appear; threshold (>=3) is required, so err_no_regroup is below threshold.
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreWith(['err_off_by_one', 'err_off_by_one', 'err_off_by_one'])],
      activityEvents: [
        { ts: 1, correct: false, errorType: 'err_no_regroup', tags: [] },
        { ts: 2, correct: false, errorType: 'err_no_regroup', tags: [] },
      ],
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].errorType).toBe('err_off_by_one');
    expect(r.commonMistakes[0].count).toBe(3);
  });

  test('When both sources have the SAME errorType, the higher count wins (no double-count)', () => {
    // Activity has 5 of err_off_by_one; score.answers has 3 of err_off_by_one.
    // Result should be max=5, not 8.
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreWith(['err_off_by_one', 'err_off_by_one', 'err_off_by_one'])],
      activityEvents: [
        { ts: 1, correct: false, errorType: 'err_off_by_one', tags: [] },
        { ts: 2, correct: false, errorType: 'err_off_by_one', tags: [] },
        { ts: 3, correct: false, errorType: 'err_off_by_one', tags: [] },
        { ts: 4, correct: false, errorType: 'err_off_by_one', tags: [] },
        { ts: 5, correct: false, errorType: 'err_off_by_one', tags: [] },
      ],
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].errorType).toBe('err_off_by_one');
    expect(r.commonMistakes[0].count).toBe(5);
  });

  test('Phase 1 threshold rules still apply (≥3 count required)', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreWith(['err_off_by_one', 'err_off_by_one'])], // only 2, below threshold
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(0);
  });

  test('Grade 1 view: only G1-grade scores contribute to score-answer mistakes', () => {
    // Caller is responsible for filtering scores. We feed only G1 scores here,
    // demonstrating that no G2 errTags can leak.
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g1',
      scores: [scoreWith(['err_spend_vs_save_confusion', 'err_spend_vs_save_confusion', 'err_spend_vs_save_confusion'], 'g1')],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].label).toBe('Confuses spending now with saving for later');
  });

  test('Grade 2 view: G1 score-answer mistakes are not in the Common Mistakes output', () => {
    // Caller passes only G2 scores; G1 ones are absent.
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g2',
      scores: [scoreWith(['err_no_regroup', 'err_no_regroup', 'err_no_regroup'], 'g2')],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
    }));
    expect(JSON.stringify(r)).not.toContain('err_spend_vs_save_confusion');
    expect(r.commonMistakes[0].errorType).toBe('err_no_regroup');
  });

  test('legacy scores without errTag on answers still contribute zero to score-answer mistakes', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [{
        qid: 'lq_g1u1-l1-legacy', pct: 30, total: 5, score: 1, type: 'lesson',
        unitIdx: 0, grade: 'g1', date: '', time: '', id: 1,
        answers: [
          { t: 'q1', ok: false, chosen: 'wrong', correct: 'right' }, // no errTag
          { t: 'q2', ok: false, chosen: 'wrong', correct: 'right' },
          { t: 'q3', ok: false, chosen: 'wrong', correct: 'right' },
        ],
      }],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(0);
  });
});

// ── _lessonDisplayName Grade 1 extension (Phase 2B) ───────────────────────
// Phase 1 _lessonDisplayName only handled ku<n>l<m> (K) and u<n>l<m> (G2/default).
// Phase 2B adds support for g1-u<n>-l<m> so the dashboard can name G1 lessons
// like "Spending and Saving" instead of falling back to the raw lessonId.

describe('_lessonDisplayName (Phase 2B G1 support)', () => {
  test('resolves g1-u8-l3 to Spending and Saving', () => {
    const r = _lessonDisplayName('g1-u8-l3');
    expect(r).not.toBeNull();
    expect(r.lesson).toBe('Spending and Saving');
    expect(r.unit).toBe('Financial Literacy');
  });

  test('resolves g1-u8-l4 to Charitable Giving', () => {
    const r = _lessonDisplayName('g1-u8-l4');
    expect(r.lesson).toBe('Charitable Giving');
    expect(r.unit).toBe('Financial Literacy');
  });

  test('resolves g1-u7-l2 to Picture Graphs', () => {
    const r = _lessonDisplayName('g1-u7-l2');
    expect(r.lesson).toBe('Picture Graphs');
    expect(r.unit).toBe('Data Analysis');
  });

  test('resolves g1-u5-l1 to 2D Shapes — Identify and Describe', () => {
    const r = _lessonDisplayName('g1-u5-l1');
    expect(r.lesson).toMatch(/2D Shapes/);
    expect(r.unit).toBe('Geometry');
  });

  test('resolves g1-u1-l1 to Quick Looks', () => {
    const r = _lessonDisplayName('g1-u1-l1');
    expect(r.lesson).toBe('Quick Looks');
    expect(r.unit).toBe('Counting and Number Relationships to 120');
  });

  test('still resolves Kindergarten IDs (ku<n>l<m>)', () => {
    const r = _lessonDisplayName('ku3l2');
    expect(r).not.toBeNull();
    expect(r.lesson).toBeTruthy();
    expect(r.unit).toBe('Addition & Subtraction');
  });

  test('still resolves legacy Grade 2 IDs (u<n>l<m>)', () => {
    const r = _lessonDisplayName('u1l1');
    expect(r).not.toBeNull();
    expect(r.lesson).toBeTruthy();
    expect(r.unit).toBe('Basic Fact Strategies');
  });

  test('returns null for unknown lesson ID patterns', () => {
    expect(_lessonDisplayName('totally-unknown')).toBeNull();
    expect(_lessonDisplayName(null)).toBeNull();
    expect(_lessonDisplayName('')).toBeNull();
  });

  test('returns null for out-of-range G1 unit/lesson indices', () => {
    expect(_lessonDisplayName('g1-u99-l1')).toBeNull();
    expect(_lessonDisplayName('g1-u1-l99')).toBeNull();
  });
});

// ── buildLearningInsights tagLessonIndex integration (Phase 2B) ───────────
// The builder now accepts a tagLessonIndex (the static index emitted by build.js)
// and uses it as a FALLBACK lesson resolver when live activity events don't
// already include lessonId info for the weak tag. Grade filtering is strict:
// only lessons whose lessonId matches the viewBand can be recommended.

describe('buildLearningInsights with tagLessonIndex (Phase 2B)', () => {
  // Phase 2B uses the production _lessonDisplayName resolver (which handles
  // K, G1, and G2 lessonIds) so the recommended-lesson names round-trip.
  const BASE = {
    viewBand:     'g1',
    studentName:  'Alex',
    tagLabels:    LI_TAG_LABELS,
    errLabels:    LI_ERR_LABELS,
    errHelpMap:   LI_ERR_HELP,
    lessonNameFn: _lessonDisplayName,
  };

  function scoreOf(errTags, grade) {
    const answers = errTags.map(function(t, i) { return { t: 'q'+i, ok: t == null, errTag: t }; });
    return { qid:'lq_g1u8-l3-x', pct: 50, total: errTags.length, score: 0, type:'lesson',
             unitIdx: 7, grade: grade || 'g1', date:'', time:'', id: Math.random(),
             answers: answers };
  }

  test('Common Mistakes entries include lessonId / lessonName when static index has it', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreOf(['err_spend_vs_save_confusion', 'err_spend_vs_save_confusion', 'err_spend_vs_save_confusion'])],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: {
          'err_spend_vs_save_confusion': { 'g1-u8-l3': 12 },
        },
      },
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].lessonId).toBe('g1-u8-l3');
    // lessonName comes from lessonNameFn — in BASE that's LI_LESSON_FN which maps g1u8-l3.
    expect(r.commonMistakes[0].lessonName).toBe('Spending and Saving');
  });

  test('live activity lesson wins over static index when both have data for the same tag', () => {
    // Live activity says the saving misses happened in g1u5-l1 (Equal Parts).
    // Static index says they happened in g1u8-l3. Live wins.
    const events = [
      { ts: 1, correct: false, tags: ['saving'], lessonId: 'g1u5-l1', errorType: 'err_spend_vs_save_confusion' },
      { ts: 2, correct: false, tags: ['saving'], lessonId: 'g1u5-l1', errorType: 'err_spend_vs_save_confusion' },
      { ts: 3, correct: false, tags: ['saving'], lessonId: 'g1u5-l1', errorType: 'err_spend_vs_save_confusion' },
    ];
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreOf([])],
      activityEvents: events,
      interventionEvents: [],
      mastery: { saving: { attempts: 3, correct: 0, lastSeen: 0 } },
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: { 'saving': { 'g1-u8-l3': 12 } },
      },
    }));
    // Needs Practice's top entry should use the LIVE lesson (g1u5-l1, not g1-u8-l3).
    expect(r.needsPractice.length).toBeGreaterThan(0);
    expect(r.needsPractice[0].lessonId).toBe('g1u5-l1');
  });

  test('static index falls back when live activity lacks lessonId for the tag', () => {
    // Score-answer mistakes only (no lessonId info in score.answers, no activity).
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreOf(['err_spend_vs_save_confusion', 'err_spend_vs_save_confusion', 'err_spend_vs_save_confusion'])],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: {
          'err_spend_vs_save_confusion': { 'g1-u8-l3': 12 },
        },
      },
    }));
    expect(r.commonMistakes[0].lessonId).toBe('g1-u8-l3');
    expect(r.commonMistakes[0].lessonName).toBe('Spending and Saving');
  });

  test('Grade 1 view excludes Grade 2 lessons from static-index recommendations', () => {
    // Static index has BOTH a G1 lesson (g1-u8-l3) and a G2 lesson (u5l1).
    // Viewing G1, the G2 lesson must not be selected.
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g1',
      scores: [scoreOf(['err_x', 'err_x', 'err_x'])],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: { 'err_x': { 'u5l1': 99, 'g1-u8-l3': 1 } }, // G2 has more, but G1 view must pick G1
      },
    }));
    expect(r.commonMistakes[0].lessonId).toBe('g1-u8-l3');
  });

  test('Grade 2 view excludes Grade 1 lessons from static-index recommendations', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'g2',
      scores: [scoreOf(['err_x', 'err_x', 'err_x'], 'g2')],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: { 'err_x': { 'g1-u8-l3': 99, 'u5l1': 1 } },
      },
    }));
    expect(r.commonMistakes[0].lessonId).toBe('u5l1');
  });

  test('Kindergarten view excludes G1 and G2 lessons from static-index recommendations', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      viewBand: 'k',
      scores: [scoreOf(['err_x', 'err_x', 'err_x'], 'K')],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: { 'err_x': { 'g1-u8-l3': 99, 'u5l1': 99, 'ku2l1': 5 } },
      },
    }));
    expect(r.commonMistakes[0].lessonId).toBe('ku2l1');
  });

  test('no lesson info anywhere → Common Mistakes still renders (just no lessonId/lessonName)', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreOf(['err_spend_vs_save_confusion', 'err_spend_vs_save_confusion', 'err_spend_vs_save_confusion'])],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      // no tagLessonIndex at all
    }));
    expect(r.commonMistakes.length).toBe(1);
    expect(r.commonMistakes[0].errorType).toBe('err_spend_vs_save_confusion');
    expect(r.commonMistakes[0].lessonId).toBeFalsy();
    expect(r.commonMistakes[0].lessonName).toBeFalsy();
  });

  test('empty / null tagLessonIndex behaves as if absent (no crash, no recommendation)', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreOf(['err_x', 'err_x', 'err_x'])],
      activityEvents: [],
      interventionEvents: [],
      mastery: {},
      tagLessonIndex: null,
    }));
    expect(r.commonMistakes[0].errorType).toBe('err_x');
    expect(r.commonMistakes[0].lessonId).toBeFalsy();
  });

  test('Recommended Next Step uses static-index lesson when live activity is empty', () => {
    // Weak tag from mastery; no live lessonId on activity; static index points
    // to g1-u8-l3. Score record carries enough volume to clear the totalQuestions
    // gate so the builder reaches the lesson branch.
    const fillerScore = { qid: 'lq_g1u8-l3-x', pct: 30, total: 10, score: 3, type: 'lesson',
                          unitIdx: 7, grade: 'g1', date: '', time: '', id: 99, answers: [] };
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [fillerScore],
      activityEvents: [],
      interventionEvents: [],
      mastery: { saving: { attempts: 5, correct: 1, lastSeen: 0 } },
      tagLessonIndex: {
        schemaVersion: 1,
        byTag: { 'saving': { 'g1-u8-l3': 12 } },
      },
    }));
    expect(r.nextStep.kind).toBe('lesson');
    expect(r.nextStep.lessonId).toBe('g1-u8-l3');
    expect(r.nextStep.lessonName).toBe('Spending and Saving');
  });

  test('Phase 1 + 2A integration still passes (no regression)', () => {
    // Mixed inputs — activity + score.answers + intervention + mastery.
    // No tagLessonIndex. All Phase 1/2A behavior preserved.
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scoreOf(['err_off_by_one', 'err_off_by_one', 'err_off_by_one'])],
      activityEvents: [
        { ts: 1, correct: false, errorType: 'err_no_regroup', tags: ['regrouping'] },
        { ts: 2, correct: false, errorType: 'err_no_regroup', tags: ['regrouping'] },
        { ts: 3, correct: false, errorType: 'err_no_regroup', tags: ['regrouping'] },
      ],
      interventionEvents: [
        { type: 'triggered', errorTag: 'err_off_by_one' },
        { type: 'triggered', errorTag: 'err_off_by_one' },
      ],
      mastery: {},
    }));
    expect(r.commonMistakes.length).toBe(2);
    expect(r.interventionRecovery.state).not.toBe('not-enough-data');
  });
});

// ── Phase 2C: intervention_events.grade column wiring ────────────────────
// Two new pure helpers extracted from the previously-inline sync/fetch code
// in src/dashboard.js so the round-trip of the new `grade` field can be
// exercised by jest without a live Supabase connection.

describe('_buildInterventionRowForSync (Phase 2C)', () => {
  test('includes grade field on the upsert row when event has explicit grade', () => {
    const row = _buildInterventionRowForSync({
      clientId: 'c1', type: 'triggered', errorTag: 'err_x',
      sessionId: 'lq_g1u1-l1', questionId: 'g1-u1-l1-q-001',
      grade: 'g1', timestamp: 1700000000000,
    }, 'student-uuid');
    expect(row.client_id).toBe('c1');
    expect(row.student_id).toBe('student-uuid');
    expect(row.grade).toBe('g1');
    expect(row.session_id).toBe('lq_g1u1-l1');
    expect(row.error_tag).toBe('err_x');
    expect(row.event_type).toBe('triggered');
    expect(typeof row.occurred_at).toBe('string');
  });

  test('grade is null on the row when event lacks an explicit grade (legacy)', () => {
    const row = _buildInterventionRowForSync({
      clientId: 'c2', type: 'triggered', errorTag: 'err_y',
      sessionId: 'lq_u3-l2', questionId: 'u3-l2-001',
      timestamp: 1700000000000,
    }, 'student-uuid');
    expect(row.grade).toBeNull();
  });

  test('grade=k|g1|g2 all round-trip unchanged', () => {
    ['k','g1','g2'].forEach(function(g) {
      const row = _buildInterventionRowForSync({
        clientId: 'cx', type: 'triggered', grade: g, timestamp: 1700000000000,
      }, 'sid');
      expect(row.grade).toBe(g);
    });
  });

  test('handles missing optional fields gracefully', () => {
    const row = _buildInterventionRowForSync({ clientId: 'c3' }, 'sid');
    expect(row.client_id).toBe('c3');
    expect(row.student_id).toBe('sid');
    expect(row.session_id).toBe('');
    expect(row.event_type).toBe('');
    expect(row.error_tag).toBeNull();
    expect(row.question_id).toBeNull();
    expect(row.resolved_correctly).toBeNull();
    expect(row.grade).toBeNull();
  });
});

describe('_normalizeInterventionRow (Phase 2C)', () => {
  test('includes grade on the normalized event when Supabase row carries it', () => {
    const e = _normalizeInterventionRow({
      event_type: 'triggered', error_tag: 'err_x', session_id: 'lq_g1u1-l1',
      resolved_correctly: null, occurred_at: '2026-05-19T10:00:00.000Z',
      grade: 'g1',
    });
    expect(e.type).toBe('triggered');
    expect(e.errorTag).toBe('err_x');
    expect(e.sessionId).toBe('lq_g1u1-l1');
    expect(e.grade).toBe('g1');
    expect(typeof e.timestamp).toBe('number');
  });

  test('grade is null on normalized event when Supabase row lacks the column (legacy backfill miss)', () => {
    const e = _normalizeInterventionRow({
      event_type: 'triggered', error_tag: 'err_z',
      session_id: 'lq_legacy-no-prefix', resolved_correctly: null,
      occurred_at: '2026-05-19T10:00:00.000Z',
      // grade column omitted entirely (older rows pre-backfill)
    });
    expect(e.grade).toBeNull();
  });

  test('explicit-grade event still wins over session-id inference downstream', () => {
    // _normalizeInterventionRow just round-trips the column; the
    // _filterInterventionsByGrade helper applies the precedence rule.
    const e = _normalizeInterventionRow({
      event_type: 'triggered', error_tag: 'err_x',
      session_id: 'lq_g1u1-l1-xyz', // session looks like G1...
      resolved_correctly: null,
      occurred_at: '2026-05-19T10:00:00.000Z',
      grade: 'k',                   // ...but explicit grade says K.
    });
    expect(e.grade).toBe('k');
    expect(_filterInterventionsByGrade([e], 'k').length).toBe(1);
    expect(_filterInterventionsByGrade([e], 'g1').length).toBe(0);
  });
});

describe('intervention_events grade round-trip (Phase 2C integration)', () => {
  test('event with grade=g1 + g2-looking sessionId surfaces only in G1 view', () => {
    const evt = _normalizeInterventionRow({
      event_type: 'triggered', error_tag: 'err_x',
      session_id: 'lq_u3-l2-abc', resolved_correctly: null,
      occurred_at: '2026-05-19T10:00:00.000Z',
      grade: 'g1',
    });
    expect(_filterInterventionsByGrade([evt], 'g1').length).toBe(1);
    expect(_filterInterventionsByGrade([evt], 'g2').length).toBe(0);
  });

  test('legacy event (no grade) with g1 sessionId still resolves to G1', () => {
    const evt = _normalizeInterventionRow({
      event_type: 'triggered', error_tag: 'err_x',
      session_id: 'lq_g1u1-l1-abc', resolved_correctly: null,
      occurred_at: '2026-05-19T10:00:00.000Z',
      // grade absent — falls through to session-id inference
    });
    expect(_filterInterventionsByGrade([evt], 'g1').length).toBe(1);
    expect(_filterInterventionsByGrade([evt], 'g2').length).toBe(0);
  });

  test('legacy event with no grade and no inferable session is excluded from every grade-specific view', () => {
    const evt = _normalizeInterventionRow({
      event_type: 'triggered', error_tag: 'err_x',
      session_id: 'opaque_session_id', resolved_correctly: null,
      occurred_at: '2026-05-19T10:00:00.000Z',
    });
    ['k','g1','g2'].forEach(function(b) {
      expect(_filterInterventionsByGrade([evt], b).length).toBe(0);
    });
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

// ── F3 — Quiz history row data-arg uses stable score.id ──────────────────
// Regression test for the index-mismatch bug where renderer rows had
// _originalIndex (positional in a grade-filtered list) but openQuizReview
// looked up student.SCORES unfiltered. After fix: rows carry `data-arg`
// equal to `score.id`, openQuizReview looks up by id.

describe('quiz history row data-arg', () => {
  function mkScore(id, type, qid, grade, label) {
    return {
      qid: qid, id: id, type: type, label: label,
      pct: 80, score: 8, total: 10, unitIdx: 0, color: '#888',
      grade: grade, name: 'Test', answers: [{ t: 'q', chosen: 'a', correct: 'a', ok: true }],
      date: 'May 19, 2026', time: '10:00 AM',
    };
  }

  test('row data-arg holds the stable score id (lesson)', () => {
    var s = mkScore(1779000000001, 'lesson', 'lq_g1u4-l1-x', 'g1', 'Counting & Cardinality');
    var html = _renderRecentQuizzes([s]);
    expect(html).toContain('data-arg="1779000000001"');
    expect(html).not.toContain('data-arg="0"');
  });

  test('row data-arg holds the stable score id (unit quiz)', () => {
    var s = mkScore(1779000000002, 'unit', 'g1u4_uq', 'g1', 'Counting Patterns — Unit Test');
    var html = _renderRecentQuizzes([s]);
    expect(html).toContain('data-arg="1779000000002"');
  });

  test('unit quiz appears in history with correct label', () => {
    var s = mkScore(1779000000003, 'unit', 'g1u4_uq', 'g1', 'Counting Patterns — Unit Test');
    var html = _renderRecentQuizzes([s]);
    expect(html).toContain('Counting Patterns');
    expect(html).toContain('Unit Test');
  });

  test('mixed lesson + unit scores all render with id-based data-arg', () => {
    var lesson = mkScore(1779000000010, 'lesson', 'lq_g1u4-l1-x', 'g1', 'Lesson 1');
    var unit   = mkScore(1779000000020, 'unit',   'g1u4_uq',      'g1', 'Unit 4 Test');
    var html = _renderRecentQuizzes([lesson, unit]);
    expect(html).toContain('data-arg="1779000000010"');
    expect(html).toContain('data-arg="1779000000020"');
  });

  test('lesson quiz history still works (does not regress)', () => {
    var s = mkScore(1779000000004, 'lesson', 'lq_g1u4-l1-x', 'g1', 'Counting to 10');
    var html = _renderRecentQuizzes([s]);
    expect(html).toContain('Counting to 10');
    expect(html).toContain('Lesson Quiz');
    expect(html).toContain('data-arg="1779000000004"');
  });
});

// ── _normalizeAnswerDifficulty ────────────────────────────────────────────

describe('_normalizeAnswerDifficulty', () => {
  test('maps short-form e to easy', () => {
    expect(_normalizeAnswerDifficulty({ d: 'e' })).toBe('easy');
  });
  test('maps short-form m to medium', () => {
    expect(_normalizeAnswerDifficulty({ d: 'm' })).toBe('medium');
  });
  test('maps short-form h to hard', () => {
    expect(_normalizeAnswerDifficulty({ d: 'h' })).toBe('hard');
  });
  test('preserves long-form easy/medium/hard', () => {
    expect(_normalizeAnswerDifficulty({ difficulty: 'easy' })).toBe('easy');
    expect(_normalizeAnswerDifficulty({ difficulty: 'medium' })).toBe('medium');
    expect(_normalizeAnswerDifficulty({ difficulty: 'hard' })).toBe('hard');
  });
  test('prefers difficulty over d when both present', () => {
    expect(_normalizeAnswerDifficulty({ difficulty: 'hard', d: 'e' })).toBe('hard');
  });
  test('reads q.d when only short-form exists', () => {
    expect(_normalizeAnswerDifficulty({ d: 'e', t: 'x' })).toBe('easy');
  });
  test('returns null for missing or unknown values', () => {
    expect(_normalizeAnswerDifficulty({})).toBe(null);
    expect(_normalizeAnswerDifficulty({ d: 'x' })).toBe(null);
    expect(_normalizeAnswerDifficulty({ difficulty: 'extreme' })).toBe(null);
    expect(_normalizeAnswerDifficulty(null)).toBe(null);
    expect(_normalizeAnswerDifficulty(undefined)).toBe(null);
  });
});

// ── _aggregateDifficultyPerformance ───────────────────────────────────────

describe('_aggregateDifficultyPerformance', () => {
  function sc(answers, overrides) {
    return Object.assign({
      qid: 'lq_g1u4-l1-x', pct: 80, id: Date.now() + Math.random(), type: 'lesson',
      label: 'Test', date: '2026-05-19', score: 8, total: 10,
      unitIdx: 3, answers: answers, grade: 'g1',
    }, overrides || {});
  }

  test('buckets answers into easy / medium / hard', () => {
    const r = _aggregateDifficultyPerformance([sc([
      { t: 'q1', ok: true,  difficulty: 'easy' },
      { t: 'q2', ok: true,  difficulty: 'easy' },
      { t: 'q3', ok: false, difficulty: 'medium' },
      { t: 'q4', ok: true,  difficulty: 'hard' },
    ])]);
    expect(r.easy.total).toBe(2);
    expect(r.easy.correct).toBe(2);
    expect(r.medium.total).toBe(1);
    expect(r.medium.correct).toBe(0);
    expect(r.hard.total).toBe(1);
    expect(r.hard.correct).toBe(1);
  });

  test('computes accuracy as correct / total per level', () => {
    const r = _aggregateDifficultyPerformance([sc([
      { ok: true,  difficulty: 'easy' },
      { ok: true,  difficulty: 'easy' },
      { ok: false, difficulty: 'easy' },
      { ok: false, difficulty: 'easy' },
    ])]);
    expect(r.easy.accuracy).toBeCloseTo(0.5, 5);
  });

  test('ignores answers without difficulty (legacy tolerance)', () => {
    const r = _aggregateDifficultyPerformance([sc([
      { ok: true },
      { ok: false, difficulty: null },
      { ok: true,  difficulty: 'easy' },
    ])]);
    expect(r.easy.total).toBe(1);
    expect(r.medium.total).toBe(0);
    expect(r.hard.total).toBe(0);
  });

  test('ignores answers with unrecognized difficulty value', () => {
    const r = _aggregateDifficultyPerformance([sc([
      { ok: true, difficulty: 'extreme' },
      { ok: true, difficulty: 'e' },
      { ok: true, difficulty: 'easy' },
    ])]);
    expect(r.easy.total).toBe(1);
  });

  test('returns zeroed buckets for empty scores', () => {
    const r = _aggregateDifficultyPerformance([]);
    expect(r.easy.total).toBe(0);
    expect(r.easy.accuracy).toBe(0);
    expect(r.medium.total).toBe(0);
    expect(r.hard.total).toBe(0);
  });

  test('tolerates non-array scores input', () => {
    expect(_aggregateDifficultyPerformance(null).easy.total).toBe(0);
    expect(_aggregateDifficultyPerformance(undefined).hard.total).toBe(0);
  });

  test('tolerates scores with missing or non-array answers', () => {
    const r = _aggregateDifficultyPerformance([
      sc(undefined),
      sc(null),
      sc([]),
      sc([{ ok: true, difficulty: 'easy' }]),
    ]);
    expect(r.easy.total).toBe(1);
  });
});

// ── _aggregateDifficultyByLesson ──────────────────────────────────────────

describe('_aggregateDifficultyByLesson', () => {
  function sc(qid, answers) {
    return {
      qid: qid, pct: 50, id: Date.now() + Math.random(), type: 'lesson',
      label: 'Test', date: '2026-05-19', score: 5, total: 10,
      unitIdx: 7, answers: answers, grade: 'g1',
    };
  }

  test('clusters answers by lessonId extracted from qid', () => {
    const r = _aggregateDifficultyByLesson([
      sc('lq_g1u8-l3-abc', [
        { ok: false, difficulty: 'hard' },
        { ok: false, difficulty: 'hard' },
        { ok: true,  difficulty: 'easy' },
      ]),
      sc('lq_g1u5-l2-xyz', [
        { ok: true, difficulty: 'medium' },
      ]),
    ]);
    expect(r['g1u8-l3']).toBeDefined();
    expect(r['g1u8-l3'].hard.total).toBe(2);
    expect(r['g1u8-l3'].hard.correct).toBe(0);
    expect(r['g1u8-l3'].easy.total).toBe(1);
    expect(r['g1u5-l2']).toBeDefined();
    expect(r['g1u5-l2'].medium.total).toBe(1);
  });

  test('falls back gracefully when qid does not match the lesson pattern', () => {
    const r = _aggregateDifficultyByLesson([
      sc('ut_g1-final', [{ ok: true, difficulty: 'hard' }]),
      sc('lq_add_01',   [{ ok: true, difficulty: 'easy' }]),
      sc(null,          [{ ok: true, difficulty: 'easy' }]),
    ]);
    expect(Object.keys(r).length).toBe(0);
  });

  test('merges multiple scores under the same lessonId', () => {
    const r = _aggregateDifficultyByLesson([
      sc('lq_g1u8-l3-a', [{ ok: true, difficulty: 'easy' }]),
      sc('lq_g1u8-l3-b', [{ ok: false, difficulty: 'easy' }]),
    ]);
    expect(r['g1u8-l3'].easy.total).toBe(2);
    expect(r['g1u8-l3'].easy.correct).toBe(1);
  });

  test('tolerates empty / non-array input', () => {
    expect(_aggregateDifficultyByLesson([])).toEqual({});
    expect(_aggregateDifficultyByLesson(null)).toEqual({});
  });

  test('matches K and G2 qid prefixes too', () => {
    const r = _aggregateDifficultyByLesson([
      sc('lq_ku4-l1-x',  [{ ok: true, difficulty: 'easy' }]),
      sc('lq_g2u1-l1-y', [{ ok: true, difficulty: 'medium' }]),
    ]);
    expect(r['ku4-l1']).toBeDefined();
    expect(r['g2u1-l1']).toBeDefined();
  });
});

// ── _dbResetStudentInMemory (Reset All in-memory wipe) ───────────────────
// Regression guard for the "Reset failed" bug where the Manage Profile
// "Reset Student Data" button reported failure even though the server reset
// had succeeded. The dashboard now relies on this helper to mirror the
// server-side reset_student_data RPC for every in-memory field, so the UI
// refreshes in real time without a page reload. Identity (name, grade,
// avatar) is intentionally preserved — Reset All is a progress wipe, not a
// profile deletion.

describe('_dbResetStudentInMemory', () => {
  function makePopulatedStudent() {
    return {
      name: 'Ada',
      grade: '1',
      avatar_emoji: '🧮',
      SCORES:    [{ qid: 'lq_g1u1-l1', pct: 80, id: Date.now() }],
      MASTERY:   { err_off_by_one: { attempts: 4, correct: 2 } },
      ACTIVITY:  [{ lessonId: 'g1u1-l1', ts: Date.now() }],
      STREAK:    { current: 5, longest: 10, lastDate: '2026-05-19' },
      APP_TIME:  { totalSecs: 3600, sessions: 4, dailySecs: { '2026-05-19': 900 } },
      DONE:      { 'g1u1-l1': true },
      ACT_DATES: ['2026-05-19', '2026-05-18'],
      SETTINGS:  { sound: true, theme: 'dark' },
      ONBOARDING: { step: 'home_tour', completed: false },
      _scoresLoaded: true,
    };
  }

  test('clears SCORES, MASTERY, ACTIVITY, STREAK (the original four fields)', () => {
    const s = makePopulatedStudent();
    _dbResetStudentInMemory(s);
    expect(s.SCORES).toEqual([]);
    expect(s.MASTERY).toEqual({});
    expect(s.ACTIVITY).toEqual([]);
    expect(s.STREAK).toEqual({ current: 0, longest: 0, lastDate: null });
  });

  test('also clears APP_TIME, DONE, ACT_DATES, SETTINGS, ONBOARDING (the fields the SQL function clears that were previously stale)', () => {
    const s = makePopulatedStudent();
    _dbResetStudentInMemory(s);
    expect(s.APP_TIME).toEqual({ totalSecs: 0, sessions: 0, dailySecs: {} });
    expect(s.DONE).toEqual({});
    expect(s.ACT_DATES).toEqual([]);
    expect(s.SETTINGS).toEqual({});
    expect(s.ONBOARDING).toBeNull();
  });

  test('preserves profile identity (name, grade, avatar) — Reset All is NOT a profile deletion', () => {
    const s = makePopulatedStudent();
    _dbResetStudentInMemory(s);
    expect(s.name).toBe('Ada');
    expect(s.grade).toBe('1');
    expect(s.avatar_emoji).toBe('🧮');
  });

  test('sets _scoresLoaded to false so the next async fetch re-populates', () => {
    const s = makePopulatedStudent();
    _dbResetStudentInMemory(s);
    expect(s._scoresLoaded).toBe(false);
  });

  test('does not throw on missing / null / undefined student', () => {
    expect(() => _dbResetStudentInMemory(null)).not.toThrow();
    expect(() => _dbResetStudentInMemory(undefined)).not.toThrow();
  });

  test('post-reset student object behaves like a fresh profile for downstream renderers', () => {
    // Smoke-test: after the reset, the same shape the dashboard reads for
    // its render pipeline produces empty insights and no NaN/undefined.
    const s = makePopulatedStudent();
    _dbResetStudentInMemory(s);
    const stats = _computeOverallStats(s.SCORES, s.STREAK, s.APP_TIME);
    expect(stats.quizCount).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.weekSecs).toBe(0);
  });

  test('repeat invocations are idempotent (Reset All clicked twice in a row)', () => {
    const s = makePopulatedStudent();
    _dbResetStudentInMemory(s);
    const snapshot = JSON.stringify(s);
    _dbResetStudentInMemory(s);
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});

// ── _dbProgressCacheKeysForReset (cross-unit stale-unlock fix) ──────────
// Regression guard for the bug where Reset Student Data left the
// grade-scoped wb_sc5_<grade> / wb_done5_<grade> / wb_mastery_<grade> /
// mmr_mastery_v1_<grade> localStorage keys in place. enterStudentLearningSession
// re-hydrates SCORES from those keys on the next student-app entry, so
// isUnitUnlocked happily re-opened Unit 2+ on the strength of pre-reset
// prior-unit quiz scores. The helper enumerates the keys the dashboard
// must remove; isolating the policy here lets us verify the set explicitly
// and lock the grade-scoping contract.

describe('_dbProgressCacheKeysForReset', () => {
  test('Grade 2 reset (active session): wipes all grade caches + session keys (cross-grade safety)', () => {
    // POST-DEPLOY REGRESSION GUARD: an earlier shape of this helper only
    // cleared the profile's "official" grade — so when the student-app's
    // mmr_grade had drifted to a different grade than profile.grade, the
    // wrong wb_sc5_<grade> got cleared and Unit 2/3/etc. re-appeared
    // unlocked on the student home. The fix is to sweep every grade
    // cache when the device's active session belongs to the reset
    // student.
    const keys = _dbProgressCacheKeysForReset('2', true);
    expect(keys).toEqual(expect.arrayContaining([
      'wb_sc5_K', 'wb_sc5_1', 'wb_sc5_2',
      'wb_done5_K', 'wb_done5_1', 'wb_done5_2',
      'wb_mastery_K', 'wb_mastery_1', 'wb_mastery_2',
      'mmr_mastery_v1_K', 'mmr_mastery_v1_1', 'mmr_mastery_v1_2',
      'wb_streak', 'wb_act_dates', 'wb_apptime', 'wb_paused_quiz',
      'wb_sc5', 'wb_done5', 'wb_mastery',
    ]));
    // Dedup: no key appears twice
    const counts = {};
    keys.forEach(k => { counts[k] = (counts[k] || 0) + 1; });
    Object.entries(counts).forEach(([k, n]) => {
      expect(n).toBe(1);
    });
  });

  test('Grade 1 reset (active session): also wipes K + G2 grade caches', () => {
    const keys = _dbProgressCacheKeysForReset('1', true);
    expect(keys).toEqual(expect.arrayContaining([
      'wb_sc5_K', 'wb_sc5_1', 'wb_sc5_2',
      'wb_done5_K', 'wb_done5_1', 'wb_done5_2',
    ]));
  });

  test('Kindergarten reset (active session): also wipes G1 + G2 grade caches', () => {
    const keys = _dbProgressCacheKeysForReset('K', true);
    expect(keys).toEqual(expect.arrayContaining([
      'wb_sc5_K', 'wb_sc5_1', 'wb_sc5_2',
      'wb_done5_K', 'wb_done5_1', 'wb_done5_2',
    ]));
  });

  test('sessionMatches=false: only clears profile-grade cache, no cross-grade sweep, no session keys', () => {
    // Different student is active on this device — we MUST NOT corrupt
    // their local session by touching cross-grade caches or session keys.
    const keys = _dbProgressCacheKeysForReset('2', false);
    expect(keys).toEqual(expect.arrayContaining([
      'wb_sc5_2', 'wb_done5_2', 'wb_mastery_2', 'mmr_mastery_v1_2',
    ]));
    // Cross-grade keys are preserved (might belong to the active student's grade)
    expect(keys).not.toContain('wb_sc5_K');
    expect(keys).not.toContain('wb_sc5_1');
    // Session-scoped keys are preserved (belong to the active student's session)
    expect(keys).not.toContain('wb_streak');
    expect(keys).not.toContain('wb_act_dates');
    expect(keys).not.toContain('wb_apptime');
    expect(keys).not.toContain('wb_sc5');
    expect(keys).not.toContain('wb_done5');
    expect(keys).not.toContain('wb_mastery');
    // ...with ONE deliberate exception. Production always wipes the paused-quiz
    // key regardless of sessionMatches (src/dashboard.js
    // _dbProgressCacheKeysForReset): it is a single global JSON map keyed by
    // qid, so leaving it intact lets a paused entry from another student — or
    // another device, under Tier 1 cross-device sync — surface on the reset
    // student's next render. The fork predates that change and the previous
    // assertion here encoded its stale behavior.
    expect(keys).toContain('wb_paused_quiz');
  });

  test('unknown / invalid grade band returns empty grade-scoped keys; session keys still respect sessionMatches', () => {
    // No grade-scoped keys for an unrecognized band — but the always-wiped
    // paused-quiz key is still present (see the note above).
    expect(_dbProgressCacheKeysForReset('garbage', false)).toEqual(['wb_paused_quiz']);
    expect(_dbProgressCacheKeysForReset(null, false)).toEqual(['wb_paused_quiz']);
    // sessionMatches=true with invalid band still sweeps all grades + session
    const allGradesKeys = _dbProgressCacheKeysForReset('garbage', true);
    expect(allGradesKeys).toEqual(expect.arrayContaining([
      'wb_sc5_K', 'wb_sc5_1', 'wb_sc5_2',
      'wb_streak', 'wb_act_dates', 'wb_apptime', 'wb_paused_quiz',
    ]));
  });

  test('reset NEVER touches identity / auth / theme / dashboard-view-grade / unlock-settings keys', () => {
    const keys = _dbProgressCacheKeysForReset('2', true);
    expect(keys).not.toContain('mmr_active_student_id');
    expect(keys).not.toContain('mmr_session_token');
    expect(keys).not.toContain('mmr_user_role');
    expect(keys).not.toContain('mmr_family_profiles');
    expect(keys).not.toContain('mmr_parent_unlock');
    expect(keys.some(k => k.startsWith('mmr_profile_grade_'))).toBe(false);
    expect(keys).not.toContain('wb_theme');
    expect(keys).not.toContain('mmr_db_section_state');
    expect(keys.some(k => k.startsWith('mmr_dash_view_grade_'))).toBe(false);
    expect(keys.some(k => k.startsWith('wb_unlock_'))).toBe(false);
    expect(keys.some(k => k.startsWith('wb_timer_'))).toBe(false);
    expect(keys.some(k => k.startsWith('wb_a11y_'))).toBe(false);
  });

  test('SCENARIO: profile.grade=1 + student-app mmr_grade=2 → BOTH grade caches cleared (post-deploy bug)', () => {
    // This is the EXACT scenario from the production bug report:
    //   Student app: Grade 2 (mmr_grade=2)
    //   Profile.grade: Grade 1 (per dashboard Access Controls saying "Grade 1")
    //   Reset clicked
    //   Previous shape: only wb_sc5_1 cleared, wb_sc5_2 left stale,
    //     student-app reloaded Grade 2 progress and re-unlocked Unit 2+.
    //   Current shape: when sessionMatches=true, ALL grades are wiped.
    const keys = _dbProgressCacheKeysForReset('1', true);
    expect(keys).toContain('wb_sc5_1'); // profile grade
    expect(keys).toContain('wb_sc5_2'); // student-app's actual grade — must also clear
    expect(keys).toContain('wb_sc5_K'); // and the third grade for completeness
  });

  test('SCENARIO: stale Unit 1 quiz score in wb_sc5_2 no longer unlocks Unit 2 after reset', () => {
    const keys = _dbProgressCacheKeysForReset('2', true);
    expect(keys).toContain('wb_sc5_2');
    expect(_dbProgressCacheKeysForReset('1', true)).toContain('wb_sc5_1');
    expect(_dbProgressCacheKeysForReset('K', true)).toContain('wb_sc5_K');
  });
});

// ── reset_epoch (cross-device cache invalidation) ───────────────────────
// Pins the contract on the four pure helpers that drive the cross-device
// Reset All flow: the local epoch storage layer (read/write/key) and the
// "should I clear?" decision function. The end-to-end wiring
// (_dbApplyServerResetEpoch, _dbFullReset capturing the RPC return) is
// integration-only and exercised via Supabase + DOM in the real app.

describe('_dbResetEpochKey + _dbRead/WriteLocalResetEpoch', () => {
  beforeEach(() => { if (globalThis.localStorage && globalThis.localStorage._reset) globalThis.localStorage._reset(); });

  test('key is namespaced per student', () => {
    expect(_dbResetEpochKey('abc-123')).toBe('mmr_reset_epoch_abc-123');
    expect(_dbResetEpochKey('def-456')).toBe('mmr_reset_epoch_def-456');
  });

  test('read returns 0 for absent / local / null', () => {
    expect(_dbReadLocalResetEpoch('abc')).toBe(0);
    expect(_dbReadLocalResetEpoch('local')).toBe(0);
    expect(_dbReadLocalResetEpoch(null)).toBe(0);
    expect(_dbReadLocalResetEpoch(undefined)).toBe(0);
  });

  test('write + read round-trip', () => {
    _dbWriteLocalResetEpoch('abc-123', 1734567890123);
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(1734567890123);
  });

  test('write floors fractional epochs to integers', () => {
    _dbWriteLocalResetEpoch('abc-123', 1734567890123.7);
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(1734567890123);
  });

  test('write rejects non-numeric / negative / NaN / null', () => {
    _dbWriteLocalResetEpoch('abc-123', 'oops');
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(0);
    _dbWriteLocalResetEpoch('abc-123', -1);
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(0);
    _dbWriteLocalResetEpoch('abc-123', NaN);
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(0);
    _dbWriteLocalResetEpoch('abc-123', null);
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(0);
  });

  test('write is a no-op for sid == "local" or missing', () => {
    _dbWriteLocalResetEpoch('local', 12345);
    _dbWriteLocalResetEpoch(null, 67890);
    expect(_dbReadLocalResetEpoch('local')).toBe(0);
  });

  test('read returns 0 if the stored value got corrupted', () => {
    globalThis.localStorage.setItem('mmr_reset_epoch_abc-123', 'not-a-number');
    expect(_dbReadLocalResetEpoch('abc-123')).toBe(0);
  });

  test('per-student isolation', () => {
    _dbWriteLocalResetEpoch('alice', 100);
    _dbWriteLocalResetEpoch('bob',   200);
    expect(_dbReadLocalResetEpoch('alice')).toBe(100);
    expect(_dbReadLocalResetEpoch('bob')).toBe(200);
  });
});

describe('_dbShouldClearForResetEpoch (the decision function)', () => {
  test('server newer than local: TRUE', () => {
    expect(_dbShouldClearForResetEpoch(100, 200)).toBe(true);
    expect(_dbShouldClearForResetEpoch(0,   1)).toBe(true);
  });

  test('server equal to local: FALSE (already in sync)', () => {
    expect(_dbShouldClearForResetEpoch(200, 200)).toBe(false);
  });

  test('server older than local: FALSE', () => {
    expect(_dbShouldClearForResetEpoch(200, 100)).toBe(false);
  });

  test('server epoch of 0 NEVER triggers a clear (no reset has happened)', () => {
    expect(_dbShouldClearForResetEpoch(0, 0)).toBe(false);
    expect(_dbShouldClearForResetEpoch(100, 0)).toBe(false);
    expect(_dbShouldClearForResetEpoch(0, -1)).toBe(false);
  });

  test('non-numeric / NaN server epoch: FALSE (defensive)', () => {
    expect(_dbShouldClearForResetEpoch(0, 'bogus')).toBe(false);
    expect(_dbShouldClearForResetEpoch(0, NaN)).toBe(false);
    expect(_dbShouldClearForResetEpoch(0, null)).toBe(false);
    expect(_dbShouldClearForResetEpoch(0, undefined)).toBe(false);
  });

  test('non-numeric / NaN local epoch coerces to 0 — server-newer test still wins', () => {
    expect(_dbShouldClearForResetEpoch('bogus', 500)).toBe(true);
    expect(_dbShouldClearForResetEpoch(NaN, 500)).toBe(true);
    expect(_dbShouldClearForResetEpoch(null, 500)).toBe(true);
  });

  test('SCENARIO: Device A resets at t=1000; Device B (local=0) pulls and sees 1000', () => {
    expect(_dbShouldClearForResetEpoch(0, 1000)).toBe(true);
  });

  test('SCENARIO: Device A and B both at t=1000; B re-pulls, server still 1000 — no second wipe', () => {
    expect(_dbShouldClearForResetEpoch(1000, 1000)).toBe(false);
  });

  test('SCENARIO: Device A resets at t=2000; B (which last absorbed t=1000) sees 2000', () => {
    expect(_dbShouldClearForResetEpoch(1000, 2000)).toBe(true);
  });
});


// =============================================================================
//  _unitsMetaForBand — guards the parent-dashboard view-band → unit-meta map
//  (previously '_activeDashboardUnitsMeta' silently routed Grade 1 to the
//  G2 metadata, so unlocks for indices 8-9 had no matching G1 unit on the
//  student side).
// =============================================================================
describe('_unitsMetaForBand returns the right unit list per grade', () => {
  test('K band returns _K_UNITS_META (8 units)', () => {
    const meta = _unitsMetaForBand('k');
    expect(meta).toBe(_K_UNITS_META);
    expect(meta).toHaveLength(8);
    expect(meta[7].name).toMatch(/financial|money/i);
  });

  test('G1 band returns _G1_UNITS_META (8 units) — not G2 fallthrough', () => {
    const meta = _unitsMetaForBand('g1');
    expect(meta).toBe(_G1_UNITS_META);
    expect(meta).toHaveLength(8);
    // Specifically NOT the G2 unit list, which has 10 units
    expect(meta).not.toBe(_UNITS_META);
  });

  test('G2 band returns _UNITS_META (10 units)', () => {
    const meta = _unitsMetaForBand('g2');
    expect(meta).toBe(_UNITS_META);
    expect(meta).toHaveLength(10);
  });

  test('accepts raw grade aliases — "1" / "grade1" / "Grade 1" all map to G1', () => {
    expect(_unitsMetaForBand('1')).toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('grade1')).toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('Grade 1')).toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('Kindergarten')).toBe(_K_UNITS_META);
    expect(_unitsMetaForBand('K')).toBe(_K_UNITS_META);
    expect(_unitsMetaForBand('2')).toBe(_UNITS_META);
  });

  test('unknown / nullish band falls back to G2 (so dashboard never shows an empty grid)', () => {
    expect(_unitsMetaForBand(null)).toBe(_UNITS_META);
    expect(_unitsMetaForBand(undefined)).toBe(_UNITS_META);
    expect(_unitsMetaForBand('zzz')).toBe(_UNITS_META);
  });

  test('regression: parent toggling unlock on G1 unit 3 maps to a real G1 unit name (not a G2 unit)', () => {
    // Unit index 2 in the G1 meta should be the Grade 1 addition/subtraction unit.
    const g1Meta = _unitsMetaForBand('g1');
    expect(g1Meta[2].name).toMatch(/addition|subtraction|add|subtract/i);
    expect(g1Meta[2].name).not.toMatch(/200|1,000|fractions|geometry/i);
  });
});



// =============================================================================
//  Kindergarten — explicit alias + isolation coverage. The G1 fix lands the
//  full _unitsMetaForBand routing, but K has the broadest alias surface
//  ('k' / 'K' / 'kindergarten' / 'Kindergarten' / '0') — these tests pin all
//  of them and guard the K↔G1↔G2 isolation invariant.
// =============================================================================
describe('Kindergarten Free Mode unit-meta — every alias routes to the K list', () => {
  test('alias "k" returns _K_UNITS_META', () => {
    expect(_unitsMetaForBand('k')).toBe(_K_UNITS_META);
  });
  test('alias "K" returns _K_UNITS_META', () => {
    expect(_unitsMetaForBand('K')).toBe(_K_UNITS_META);
  });
  test('alias "kindergarten" returns _K_UNITS_META', () => {
    expect(_unitsMetaForBand('kindergarten')).toBe(_K_UNITS_META);
  });
  test('alias "Kindergarten" returns _K_UNITS_META', () => {
    expect(_unitsMetaForBand('Kindergarten')).toBe(_K_UNITS_META);
  });
  test('alias "0" returns _K_UNITS_META (school-system numeric variant)', () => {
    expect(_unitsMetaForBand('0')).toBe(_K_UNITS_META);
  });

  test('K returns the correct unit count (8) — matches the K curriculum', () => {
    const meta = _unitsMetaForBand('k');
    expect(meta).toHaveLength(8);
  });

  test('K unit names match the K curriculum (not G1 or G2 unit names)', () => {
    const kMeta = _unitsMetaForBand('k');
    // K unit 1 is Counting & Cardinality, not G1's "Counting and Number Relationships to 120"
    // or G2's "Basic Fact Strategies"
    expect(kMeta[0].name).toMatch(/counting.*cardinality/i);
    expect(kMeta[0].name).not.toMatch(/basic fact strategies/i);
    expect(kMeta[0].name).not.toMatch(/relationships to 120/i);
    // K unit 8 is Financial Literacy & Money
    expect(kMeta[7].name).toMatch(/financial.*money/i);
  });

  test('K does not return G1 metadata', () => {
    expect(_unitsMetaForBand('k')).not.toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('K')).not.toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('kindergarten')).not.toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('Kindergarten')).not.toBe(_G1_UNITS_META);
    expect(_unitsMetaForBand('0')).not.toBe(_G1_UNITS_META);
  });

  test('K does not return G2 metadata', () => {
    expect(_unitsMetaForBand('k')).not.toBe(_UNITS_META);
    expect(_unitsMetaForBand('K')).not.toBe(_UNITS_META);
    expect(_unitsMetaForBand('kindergarten')).not.toBe(_UNITS_META);
    expect(_unitsMetaForBand('Kindergarten')).not.toBe(_UNITS_META);
    expect(_unitsMetaForBand('0')).not.toBe(_UNITS_META);
  });

  test('regression: K unit index 2 is a real K unit (Addition & Subtraction), not a G1 or G2 unit name', () => {
    const kMeta = _unitsMetaForBand('k');
    expect(kMeta[2].name).toMatch(/addition|subtract/i);
    // Distinct from G1 unit 2 ("Addition and Subtraction to 20") — K's wording
    // omits the "to 20" suffix.
    expect(kMeta[2].name).not.toMatch(/to 20/i);
    // Distinct from G2 unit 2 ("Add & Subtract to 200")
    expect(kMeta[2].name).not.toMatch(/200/i);
  });
});

// =============================================================================
//  Kindergarten — _parseUnlockSettings / _isUnitUnlockedInDraft / by-grade
//  slot isolation. The save layer is grade-scoped via byGrade.<band>.units;
//  these tests pin that K unlocks live in byGrade.k and do NOT leak into
//  byGrade.g1 or byGrade.g2.
// =============================================================================
describe('Kindergarten unlock state isolation in the by-grade slot', () => {
  test('_parseUnlockSettings creates a K slot when initialBand="k"', () => {
    const draft = _parseUnlockSettings({}, 'k');
    expect(draft.byGrade).toBeDefined();
    expect(draft.byGrade.k).toBeDefined();
    expect(draft.byGrade.k.freeMode).toBe(false);
    expect(Array.isArray(draft.byGrade.k.units)).toBe(true);
  });

  test('_isUnitUnlockedInDraft reads the K slot when band="k"', () => {
    const draft = { byGrade: { k: { freeMode: false, units: [2], lessons: {} } } };
    expect(_isUnitUnlockedInDraft(draft, 2, 'k')).toBe(true);
    expect(_isUnitUnlockedInDraft(draft, 1, 'k')).toBe(false);
    expect(_isUnitUnlockedInDraft(draft, 3, 'k')).toBe(false);
  });

  test('K unlock does NOT leak into G1 — _isUnitUnlockedInDraft for band="g1" returns false', () => {
    const draft = { byGrade: { k: { freeMode: false, units: [2], lessons: {} } } };
    expect(_isUnitUnlockedInDraft(draft, 2, 'g1')).toBe(false);
  });

  test('K unlock does NOT leak into G2 — _isUnitUnlockedInDraft for band="g2" returns false', () => {
    const draft = { byGrade: { k: { freeMode: false, units: [2], lessons: {} } } };
    expect(_isUnitUnlockedInDraft(draft, 2, 'g2')).toBe(false);
  });

  test('K freeMode=true unlocks ALL K units but does NOT unlock G1 or G2 units', () => {
    const draft = { byGrade: { k: { freeMode: true, units: [], lessons: {} } } };
    // Every K index returns true under freeMode
    expect(_isUnitUnlockedInDraft(draft, 0, 'k')).toBe(true);
    expect(_isUnitUnlockedInDraft(draft, 7, 'k')).toBe(true);
    // G1 / G2 unaffected
    expect(_isUnitUnlockedInDraft(draft, 0, 'g1')).toBe(false);
    expect(_isUnitUnlockedInDraft(draft, 0, 'g2')).toBe(false);
  });

  test('K and G1 unlocks coexist independently in byGrade — neither overwrites the other', () => {
    const draft = {
      byGrade: {
        k:  { freeMode: false, units: [3], lessons: {} },
        g1: { freeMode: false, units: [5], lessons: {} }
      }
    };
    // K side: index 3 unlocked, index 5 NOT unlocked
    expect(_isUnitUnlockedInDraft(draft, 3, 'k')).toBe(true);
    expect(_isUnitUnlockedInDraft(draft, 5, 'k')).toBe(false);
    // G1 side: index 5 unlocked, index 3 NOT unlocked
    expect(_isUnitUnlockedInDraft(draft, 5, 'g1')).toBe(true);
    expect(_isUnitUnlockedInDraft(draft, 3, 'g1')).toBe(false);
  });
});



// =============================================================================
//  Grade persistence — the dashboard MUST NOT overwrite the student's active
//  learning grade (`localStorage.mmr_grade`). The previous v6.0.29 build had
//  `renderDashboard` mirror its view-band into mmr_grade on every paint —
//  opening the dashboard with profile.grade='2' would clobber a K/G1
//  selection. This source-level guard pins the policy so a future refactor
//  cannot re-introduce the regression. (The dashboard's view-band still lives
//  in mmr_dash_view_grade_<sid> and is independent.)
// =============================================================================
describe('renderDashboard must not write to localStorage.mmr_grade', () => {
  const fs   = require('fs');
  const path = require('path');
  const dashSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'dashboard.js'), 'utf8');

  // Brace-count the body of a function so we only inspect its own scope.
  function _bodyOf(fnName) {
    const re = new RegExp('function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{', 'g');
    const m = re.exec(dashSrc);
    if (!m) return null;
    const start = m.index;
    let i = start + m[0].length - 1; // at the '{'
    let depth = 0;
    for (; i < dashSrc.length; i++) {
      const c = dashSrc[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return dashSrc.slice(start, i + 1); }
    }
    return null;
  }

  test('renderDashboard body does NOT call setItem("mmr_grade", ...)', () => {
    const body = _bodyOf('renderDashboard');
    expect(body).not.toBeNull();
    expect(body).not.toMatch(/setItem\s*\(\s*['"]mmr_grade['"]/);
  });

  test('renderDashboard body still reads the view-band (the function still cares about grade scope)', () => {
    const body = _bodyOf('renderDashboard');
    expect(body).toMatch(/_getDashboardViewGrade\s*\(/);
  });

  test('the intentional mmr_grade writers (profile-grade save) survive — only the renderDashboard mirror was removed', () => {
    // _dbSaveEditProfile mirrors mmr_grade ONLY when the parent saves a
    // profile-grade change — keep that path so changing a profile's enrolled
    // grade does cascade into the learning side after a reload.
    expect(dashSrc).toMatch(/setItem\s*\(\s*['"]mmr_grade['"][\s\S]{0,400}location\.reload/);
  });
});

// =============================================================================
//  Dashboard view-band reads do NOT route through mmr_grade for the lesson
//  dropdown filter. Confirms the lesson-key prefix is derived from the
//  dashboard view-band (not the learning-side mmr_grade) and handles G1.
// =============================================================================
describe('Quiz history lesson dropdown — prefix derived from view-band, not mmr_grade', () => {
  const fs   = require('fs');
  const path = require('path');
  const dashSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'dashboard.js'), 'utf8');

  function _fnBody(fnName) {
    const re = new RegExp('function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{');
    const m = re.exec(dashSrc);
    if (!m) return null;
    const start = m.index;
    let i = start + m[0].length - 1, depth = 0;
    for (; i < dashSrc.length; i++) {
      const c = dashSrc[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return dashSrc.slice(start, i + 1); }
    }
    return null;
  }

  test('_renderQuizHistoryControls reads _getDashboardViewGrade()', () => {
    const body = _fnBody('_renderQuizHistoryControls');
    expect(body).not.toBeNull();
    expect(body).toMatch(/_getDashboardViewGrade/);
  });

  test('_renderQuizHistoryControls produces a g1-u{n}-l{m} key for the G1 band', () => {
    const body = _fnBody('_renderQuizHistoryControls');
    expect(body).toMatch(/g1-u/);
  });
});

// =============================================================================
//  enterStudentLearningSession — must NOT clobber the student's mmr_grade
//  when returning from the parent dashboard. Pre-v6.0.31, the function
//  unconditionally wrote profile.grade → mmr_grade on every return, which
//  reset a fresh K/G1 student selection back to whatever stale '2' the
//  Supabase profile carried. v6.0.31 makes it prefer existing mmr_grade and
//  only write when no valid saved value exists.
//
//  These are source-level guards: the bundle isn't loadable into Node without
//  a full DOM, but the regression patterns are precise enough to pin in
//  src/auth.js.
// =============================================================================
describe('enterStudentLearningSession respects existing mmr_grade', () => {
  const fs   = require('fs');
  const path = require('path');
  const authSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'auth.js'), 'utf8');

  function _enterBody() {
    const re = /async\s+function\s+enterStudentLearningSession\s*\([^)]*\)\s*\{/;
    const m = authSrc.match(re);
    if (!m) return null;
    const start = authSrc.indexOf(m[0]);
    let i = start + m[0].length - 1, depth = 0;
    for (; i < authSrc.length; i++) {
      const c = authSrc[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return authSrc.slice(start, i + 1); }
    }
    return null;
  }

  test('enterStudentLearningSession does NOT unconditionally setItem mmr_grade with _profileGrade', () => {
    const body = _enterBody();
    expect(body).not.toBeNull();
    // The old line was: localStorage.setItem('mmr_grade', _profileGrade);  (no surrounding guard).
    // After v6.0.31, any write to mmr_grade in this function must be guarded
    // by a check that mmr_grade is missing/invalid.
    expect(body).not.toMatch(/^\s*localStorage\.setItem\(\s*['"]mmr_grade['"]\s*,\s*_profileGrade\s*\)\s*;\s*$/m);
  });

  test('enterStudentLearningSession reads the existing mmr_grade as the source of truth', () => {
    const body = _enterBody();
    expect(body).toMatch(/_existingRaw\s*=\s*localStorage\.getItem\(\s*['"]mmr_grade['"]/);
    expect(body).toMatch(/_existingValid/);
  });

  test('enterStudentLearningSession writes mmr_grade ONLY when no valid existing value', () => {
    const body = _enterBody();
    // Find the setItem call and check it sits inside an `if (_existingValid == null)` guard.
    const setRe = /if\s*\(\s*_existingValid\s*==\s*null\s*\)\s*\{[\s\S]{0,400}localStorage\.setItem\(\s*['"]mmr_grade['"]/;
    expect(body).toMatch(setRe);
  });

  test('the dev-log breadcrumb captures the grade resolution for production debugging', () => {
    const body = _enterBody();
    expect(body).toMatch(/_devLog\(\s*['"]\[MMR SESSION\] grade resolve['"]/);
  });

  test('_norm in enterStudentLearningSession handles Grade 1 (returns "1"), not just K/G2', () => {
    const body = _enterBody();
    // The fallback _norm must understand '1' so a Grade 1 student isn't normalized to '2'.
    expect(body).toMatch(/if\s*\(\s*s\s*===\s*['"]1['"]\s*\)\s*return\s*['"]1['"]/);
  });
});

// =============================================================================
//  Exhaustive audit of mmr_grade writers — locks down the legitimate writers
//  so a future refactor cannot accidentally add another rogue overwrite.
//  Expected total: 3 setItem('mmr_grade', ...) calls across the entire src/
//  tree, in src/auth.js (switchGrade, enterStudentLearningSession first-time)
//  and src/dashboard.js (_dbSaveEditProfile when parent edits profile.grade).
// =============================================================================
describe('mmr_grade writer audit — exactly the three legitimate writers exist', () => {
  const fs   = require('fs');
  const path = require('path');

  const SOURCES = [
    'src/auth.js',
    'src/dashboard.js',
    'src/boot.js',
    'src/settings.js',
    'src/unit.js',
    'src/ui.js',
    'src/quiz.js',
    'src/util.js',
    'src/events.js',
    'src/home.js',
    'src/state.js',
    'src/nav.js',
    'src/key-ideas.js',
  ];

  function readAll() {
    return SOURCES.map(rel => ({
      file: rel,
      body: fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'),
    }));
  }

  test('exactly 3 setItem("mmr_grade", ...) calls across src/', () => {
    const hits = [];
    for (const { file, body } of readAll()) {
      const matches = body.match(/localStorage\.setItem\(\s*['"]mmr_grade['"]/g) || [];
      if (matches.length) hits.push({ file, count: matches.length });
    }
    const total = hits.reduce((s, h) => s + h.count, 0);
    expect({ total, hits }).toEqual({
      total: 3,
      hits: [
        { file: 'src/auth.js',      count: 2 },  // enterStudentLearningSession (guarded) + switchGrade
        { file: 'src/dashboard.js', count: 1 },  // _dbSaveEditProfile (parent profile-grade edit)
      ],
    });
  });

  test('switchGrade still writes mmr_grade unconditionally (the legit student-selector path)', () => {
    const auth = fs.readFileSync(path.join(__dirname, '..', 'src', 'auth.js'), 'utf8');
    const m = auth.match(/async\s+function\s+switchGrade\s*\([^)]*\)\s*\{[\s\S]+?\n\}/);
    expect(m).not.toBeNull();
    expect(m[0]).toMatch(/localStorage\.setItem\(\s*['"]mmr_grade['"]\s*,\s*newGrade\s*\)/);
  });

  test('_dbSaveEditProfile still writes mmr_grade behind the location.reload path (the legit parent-edit path)', () => {
    const dash = fs.readFileSync(path.join(__dirname, '..', 'src', 'dashboard.js'), 'utf8');
    expect(dash).toMatch(/setItem\s*\(\s*['"]mmr_grade['"][\s\S]{0,400}location\.reload/);
  });
});

