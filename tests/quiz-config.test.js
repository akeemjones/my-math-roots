'use strict';

// =============================================================================
//  Configurable Quiz Lengths — pure resolver helper
//
//  Pins the behavior of src/quiz-config.js, the single source of truth for
//  turning a stored per-student quiz-length setting ("default" | <int> | "all")
//  into the actual number of questions a quiz attempt serves, AND for deciding
//  whether a unit quiz keeps its native path (K blueprint / G1 sampler / G2-3
//  default 25) or switches to the pooled eligible-bank sampler.
//
//  No DOM, no globals — load/save take an injected storage stub.
// =============================================================================

const {
  LESSON_QUIZ_DEFAULT,
  UNIT_QUIZ_DEFAULT,
  resolveLessonCount,
  resolveUnitDecision,
  isValidCustom,
  quizLengthsKey,
  loadQuizLengths,
  saveQuizLengths,
  unitEligibleBank,
  unitEligiblePoolSize,
} = require('../src/quiz-config.js');

// Minimal in-memory localStorage stand-in.
function fakeStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    _dump: () => Object.fromEntries(map),
  };
}

describe('defaults', () => {
  test('lesson default is 8, unit default is 25', () => {
    expect(LESSON_QUIZ_DEFAULT).toBe(8);
    expect(UNIT_QUIZ_DEFAULT).toBe(25);
  });
});

describe('resolveLessonCount', () => {
  test('"default" with bank larger than 8 → 8', () => {
    expect(resolveLessonCount('default', 32)).toBe(8);
  });
  test('"default" with bank exactly 8 → 8', () => {
    expect(resolveLessonCount('default', 8)).toBe(8);
  });
  test('"default" with bank smaller than 8 → bank size', () => {
    expect(resolveLessonCount('default', 5)).toBe(5);
  });
  test('missing / undefined setting behaves like default', () => {
    expect(resolveLessonCount(undefined, 32)).toBe(8);
    expect(resolveLessonCount(null, 4)).toBe(4);
  });
  test('custom number within bank → that number', () => {
    expect(resolveLessonCount(15, 32)).toBe(15);
  });
  test('custom number larger than bank → clamped to bank', () => {
    expect(resolveLessonCount(50, 32)).toBe(32);
  });
  test('"all" → full bank size', () => {
    expect(resolveLessonCount('all', 32)).toBe(32);
  });
  test('invalid setting falls back to min(default, bank)', () => {
    expect(resolveLessonCount('abc', 32)).toBe(8);
    expect(resolveLessonCount('abc', 5)).toBe(5);
    expect(resolveLessonCount(0, 32)).toBe(8);
    expect(resolveLessonCount(-3, 32)).toBe(8);
    expect(resolveLessonCount(2.5, 32)).toBe(8);
  });
  test('empty bank → 0 (lets caller hit the existing empty-state)', () => {
    expect(resolveLessonCount('default', 0)).toBe(0);
    expect(resolveLessonCount('all', 0)).toBe(0);
    expect(resolveLessonCount(10, 0)).toBe(0);
  });
  test('never returns more than the bank holds', () => {
    for (const setting of ['default', 'all', 1, 7, 8, 25, 999]) {
      expect(resolveLessonCount(setting, 12)).toBeLessThanOrEqual(12);
    }
  });
});

describe('resolveUnitDecision', () => {
  // nativeSize = _unitQuizSize(u): K blueprint sum / G1 totalQuestions / G2-3 25
  test('"default" → native path at native size', () => {
    expect(resolveUnitDecision('default', 25, 200)).toEqual({ mode: 'native', count: 25 });
  });
  test('missing setting → native path', () => {
    expect(resolveUnitDecision(undefined, 20, 120)).toEqual({ mode: 'native', count: 20 });
  });
  test('number equal to native size → native path (does NOT bypass blueprint)', () => {
    // K unit whose blueprint sums to 20; an explicit "20" must keep the blueprint.
    expect(resolveUnitDecision(20, 20, 120)).toEqual({ mode: 'native', count: 20 });
    // G2 unit native 25; explicit "25" keeps native.
    expect(resolveUnitDecision(25, 25, 133)).toEqual({ mode: 'native', count: 25 });
  });
  test('"all" → pooled path at full pooled size', () => {
    expect(resolveUnitDecision('all', 25, 86)).toEqual({ mode: 'pooled', count: 86 });
  });
  test('custom number different from native → pooled path at that count', () => {
    expect(resolveUnitDecision(40, 25, 86)).toEqual({ mode: 'pooled', count: 40 });
    expect(resolveUnitDecision(10, 25, 86)).toEqual({ mode: 'pooled', count: 10 });
  });
  test('custom number larger than pooled → clamped to pooled', () => {
    expect(resolveUnitDecision(200, 25, 86)).toEqual({ mode: 'pooled', count: 86 });
  });
  test('custom number that differs from native bypasses K blueprint', () => {
    // K native (blueprint) = 20; parent picks 30 → pooled, NOT native.
    expect(resolveUnitDecision(30, 20, 150).mode).toBe('pooled');
  });
  test('default K unit still uses native (blueprint) path', () => {
    expect(resolveUnitDecision('default', 20, 150).mode).toBe('native');
  });
  test('invalid setting falls back to native', () => {
    expect(resolveUnitDecision('abc', 25, 86)).toEqual({ mode: 'native', count: 25 });
    expect(resolveUnitDecision(0, 25, 86)).toEqual({ mode: 'native', count: 25 });
    expect(resolveUnitDecision(2.5, 25, 86)).toEqual({ mode: 'native', count: 25 });
  });
  test('pooled count never exceeds pooled size', () => {
    for (const setting of ['all', 10, 40, 500]) {
      const r = resolveUnitDecision(setting, 25, 60);
      if (r.mode === 'pooled') expect(r.count).toBeLessThanOrEqual(60);
    }
  });
});

describe('unitEligibleBank (K-3 = all lesson-bank questions in the unit)', () => {
  test('uses testBank when present and non-empty', () => {
    const u = { testBank: new Array(133).fill({ t: 'q' }), lessons: [{ qBank: [{}, {}] }] };
    expect(unitEligibleBank(u).length).toBe(133);
    expect(unitEligiblePoolSize(u)).toBe(133);
  });
  test('falls back to concatenated lesson qBanks when no testBank', () => {
    const u = { lessons: [
      { qBank: [{ t: 'a' }, { t: 'b' }] },
      { qBank: [{ t: 'c' }, { t: 'd' }, { t: 'e' }] },
    ] };
    expect(unitEligibleBank(u).length).toBe(5);
    expect(unitEligiblePoolSize(u)).toBe(5);
  });
  test('empty testBank falls back to lesson banks', () => {
    const u = { testBank: [], lessons: [{ qBank: [{}, {}, {}] }] };
    expect(unitEligiblePoolSize(u)).toBe(3);
  });
  test('honors lessons that use `quiz` instead of `qBank`', () => {
    const u = { lessons: [{ quiz: [{}, {}] }, { qBank: [{}] }] };
    expect(unitEligiblePoolSize(u)).toBe(3);
  });
  test('unit with no banks at all → empty pool (caller hits empty-state)', () => {
    expect(unitEligibleBank({ lessons: [{}] })).toEqual([]);
    expect(unitEligiblePoolSize(null)).toBe(0);
    expect(unitEligiblePoolSize({})).toBe(0);
  });
  test('pooled size is what a custom unit length is clamped against', () => {
    const u = { lessons: [{ qBank: new Array(40).fill({}) }, { qBank: new Array(46).fill({}) }] };
    const pooled = unitEligiblePoolSize(u); // 86
    expect(pooled).toBe(86);
    expect(resolveUnitDecision(75, 25, pooled)).toEqual({ mode: 'pooled', count: 75 });
    expect(resolveUnitDecision('all', 25, pooled)).toEqual({ mode: 'pooled', count: 86 });
    expect(resolveUnitDecision(999, 25, pooled).count).toBe(86);
  });
});

describe('isValidCustom', () => {
  test('accepts integers >= 1 (number or numeric string)', () => {
    expect(isValidCustom(1)).toBe(true);
    expect(isValidCustom(32)).toBe(true);
    expect(isValidCustom('15')).toBe(true);
  });
  test('rejects zero, negatives, blanks, non-integers, non-numeric', () => {
    expect(isValidCustom(0)).toBe(false);
    expect(isValidCustom(-1)).toBe(false);
    expect(isValidCustom('')).toBe(false);
    expect(isValidCustom('  ')).toBe(false);
    expect(isValidCustom('abc')).toBe(false);
    expect(isValidCustom('10.5')).toBe(false);
    expect(isValidCustom(2.5)).toBe(false);
    expect(isValidCustom(null)).toBe(false);
    expect(isValidCustom(undefined)).toBe(false);
  });
});

describe('quizLengthsKey', () => {
  test('keys per student id', () => {
    expect(quizLengthsKey('abc-123')).toBe('mmr_quiz_lengths_abc-123');
  });
  test('guest/local/null fall back to the local key', () => {
    expect(quizLengthsKey('local')).toBe('mmr_quiz_lengths_local');
    expect(quizLengthsKey(null)).toBe('mmr_quiz_lengths_local');
    expect(quizLengthsKey(undefined)).toBe('mmr_quiz_lengths_local');
    expect(quizLengthsKey('')).toBe('mmr_quiz_lengths_local');
  });
});

describe('loadQuizLengths / saveQuizLengths', () => {
  test('missing key → both default', () => {
    const s = fakeStorage();
    expect(loadQuizLengths('s1', s)).toEqual({ lesson: 'default', unit: 'default' });
  });
  test('save then load round-trips', () => {
    const s = fakeStorage();
    saveQuizLengths('s1', { lesson: 15, unit: 'all' }, s);
    expect(loadQuizLengths('s1', s)).toEqual({ lesson: 15, unit: 'all' });
  });
  test('save is scoped per student id', () => {
    const s = fakeStorage();
    saveQuizLengths('s1', { lesson: 10, unit: 40 }, s);
    saveQuizLengths('s2', { lesson: 'all', unit: 'default' }, s);
    expect(loadQuizLengths('s1', s)).toEqual({ lesson: 10, unit: 40 });
    expect(loadQuizLengths('s2', s)).toEqual({ lesson: 'all', unit: 'default' });
  });
  test('guest/local share the local key', () => {
    const s = fakeStorage();
    saveQuizLengths(null, { lesson: 20, unit: 'all' }, s);
    expect(loadQuizLengths('local', s)).toEqual({ lesson: 20, unit: 'all' });
  });
  test('corrupt JSON → defaults', () => {
    const s = fakeStorage({ 'mmr_quiz_lengths_s1': '{not json' });
    expect(loadQuizLengths('s1', s)).toEqual({ lesson: 'default', unit: 'default' });
  });
  test('partial / invalid stored values normalize to "default"', () => {
    const s = fakeStorage({ 'mmr_quiz_lengths_s1': JSON.stringify({ lesson: 15 }) });
    expect(loadQuizLengths('s1', s)).toEqual({ lesson: 15, unit: 'default' });
    const s2 = fakeStorage({ 'mmr_quiz_lengths_s1': JSON.stringify({ lesson: 'huge', unit: -4 }) });
    expect(loadQuizLengths('s1', s2)).toEqual({ lesson: 'default', unit: 'default' });
  });
  test('no storage available → defaults, no throw', () => {
    expect(loadQuizLengths('s1', null)).toEqual({ lesson: 'default', unit: 'default' });
    expect(() => saveQuizLengths('s1', { lesson: 10, unit: 'all' }, null)).not.toThrow();
  });
});
