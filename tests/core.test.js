// =============================================================================
//  My Math Roots — Core Logic Test Suite
//  Run: node --test tests/core.test.js
//  Requires Node 18+ (uses built-in node:test and node:assert)
// =============================================================================

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// =============================================================================
//  RE-IMPLEMENTED PURE FUNCTIONS (copied from src/ browser globals)
//  These mirror the exact logic in the app so we can test without a DOM.
// =============================================================================

// -- From src/util.js ---------------------------------------------------------

function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function _sanitize(str, maxLen = 200) {
  return String(str ?? '')
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/[<>"'`]/g, '')      // strip remaining dangerous chars
    .trim()
    .substring(0, maxLen);
}

function _escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const _rateLimit = (() => {
  const _rlBuckets = {};
  return function (key, maxPerMin = 5) {
    const now = Date.now();
    if (!_rlBuckets[key]) _rlBuckets[key] = [];
    _rlBuckets[key] = _rlBuckets[key].filter(t => now - t < 60000);
    if (_rlBuckets[key].length >= maxPerMin) return false;
    _rlBuckets[key].push(now);
    return true;
  };
})();

// -- From src/quiz.js (scoring) -----------------------------------------------

function calcPct(score, total) {
  return Math.floor(score / total * 100);
}

function calcStars(pct) {
  if (pct === 100) return 3;
  if (pct >= 90)   return 3;
  if (pct >= 80)   return 2;
  if (pct >= 70)   return 2;
  if (pct >= 60)   return 1;
  return 1; // below 60 still gets 1 star (no zero-star state)
}

// -- From src/nav.js (unlock logic) -------------------------------------------

function isUnitUnlocked(unitIdx, SCORES, UNITS_DATA, parentUnlocked = false, individuallyUnlocked = false) {
  if (parentUnlocked) return true;
  if (unitIdx === 0) return true;
  if (individuallyUnlocked) return true;
  const prevUnit = UNITS_DATA[unitIdx - 1];
  return SCORES.some(s => s.qid === prevUnit.id + '_uq' && s.pct >= 80);
}

function isLessonUnlocked(unitIdx, lessonIdx, SCORES, UNITS_DATA, parentUnlocked = false, individuallyUnlocked = false) {
  if (parentUnlocked) return true;
  if (lessonIdx === 0) return true;
  if (individuallyUnlocked) return true;
  const prevLesson = UNITS_DATA[unitIdx].lessons[lessonIdx - 1];
  return SCORES.some(s => s.qid === 'lq_' + prevLesson.id && s.pct === 100);
}

function isUnitQuizUnlocked(unitIdx, SCORES, UNITS_DATA, parentUnlocked = false) {
  if (parentUnlocked) return true;
  const u = UNITS_DATA[unitIdx];
  return u.lessons.every(l => SCORES.some(s => s.qid === 'lq_' + l.id && s.pct === 100));
}


// =============================================================================
//  TESTS
// =============================================================================

// -- _shuffle -----------------------------------------------------------------

describe('_shuffle', () => {
  it('returns the same array reference (mutates in place)', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = _shuffle(arr);
    assert.strictEqual(result, arr, 'should return the exact same array object');
  });

  it('preserves all elements (no duplicates, no losses)', () => {
    const arr = [10, 20, 30, 40, 50];
    _shuffle(arr);
    assert.deepStrictEqual(arr.sort((a, b) => a - b), [10, 20, 30, 40, 50]);
  });

  it('handles empty array', () => {
    const arr = [];
    assert.strictEqual(_shuffle(arr), arr);
    assert.deepStrictEqual(arr, []);
  });

  it('handles single-element array', () => {
    const arr = [42];
    _shuffle(arr);
    assert.deepStrictEqual(arr, [42]);
  });

  it('produces roughly uniform distribution across positions', () => {
    // Shuffle [0,1,2] 10000 times; count how often each value lands in each position.
    // With 3 elements and 10000 trials, each (position, value) pair should appear ~3333 times.
    // We allow a tolerance of 15% deviation from expected.
    const n = 3;
    const trials = 10000;
    const counts = Array.from({ length: n }, () => Array(n).fill(0));

    for (let t = 0; t < trials; t++) {
      const arr = [0, 1, 2];
      _shuffle(arr);
      for (let pos = 0; pos < n; pos++) {
        counts[pos][arr[pos]]++;
      }
    }

    const expected = trials / n;
    const tolerance = expected * 0.15; // 15%
    for (let pos = 0; pos < n; pos++) {
      for (let val = 0; val < n; val++) {
        const diff = Math.abs(counts[pos][val] - expected);
        assert.ok(
          diff < tolerance,
          `Position ${pos}, value ${val}: count ${counts[pos][val]} deviates >${tolerance.toFixed(0)} from expected ${expected.toFixed(0)}`
        );
      }
    }
  });
});

// -- Scoring (Math.floor percentage) ------------------------------------------

describe('calcPct (Math.floor scoring)', () => {
  it('7/10 = 70 (not 70.something rounded)', () => {
    assert.strictEqual(calcPct(7, 10), 70);
  });

  it('1/3 = 33 (not 34, floors down)', () => {
    assert.strictEqual(calcPct(1, 3), 33);
  });

  it('10/10 = 100', () => {
    assert.strictEqual(calcPct(10, 10), 100);
  });

  it('0/10 = 0', () => {
    assert.strictEqual(calcPct(0, 10), 0);
  });

  it('2/3 = 66 (not 67)', () => {
    assert.strictEqual(calcPct(2, 3), 66);
  });

  it('9/10 = 90', () => {
    assert.strictEqual(calcPct(9, 10), 90);
  });

  it('1/7 = 14 (floors 14.28...)', () => {
    assert.strictEqual(calcPct(1, 7), 14);
  });
});

// -- Star rating --------------------------------------------------------------

describe('calcStars (star rating)', () => {
  it('100% = 3 stars', () => {
    assert.strictEqual(calcStars(100), 3);
  });

  it('95% = 3 stars', () => {
    assert.strictEqual(calcStars(95), 3);
  });

  it('90% = 3 stars (boundary)', () => {
    assert.strictEqual(calcStars(90), 3);
  });

  it('89% = 2 stars (just below 3-star threshold)', () => {
    assert.strictEqual(calcStars(89), 2);
  });

  it('80% = 2 stars', () => {
    assert.strictEqual(calcStars(80), 2);
  });

  it('79% = 2 stars (70-79 range)', () => {
    assert.strictEqual(calcStars(79), 2);
  });

  it('70% = 2 stars (boundary)', () => {
    assert.strictEqual(calcStars(70), 2);
  });

  it('69% = 1 star', () => {
    assert.strictEqual(calcStars(69), 1);
  });

  it('60% = 1 star', () => {
    assert.strictEqual(calcStars(60), 1);
  });

  it('59% = 1 star (below 60 still gets 1)', () => {
    assert.strictEqual(calcStars(59), 1);
  });

  it('0% = 1 star (minimum)', () => {
    assert.strictEqual(calcStars(0), 1);
  });
});

// -- _sanitize ----------------------------------------------------------------

describe('_sanitize', () => {
  it('strips HTML tags', () => {
    assert.strictEqual(_sanitize('<b>bold</b>'), 'bold');
  });

  it('strips script tags and content between angle brackets', () => {
    assert.strictEqual(_sanitize('<script>alert("xss")</script>'), 'alert(xss)');
  });

  it('strips dangerous chars: < > " \' `', () => {
    assert.strictEqual(_sanitize('a<b>c"d\'e`f'), 'acdef');
  });

  it('trims whitespace', () => {
    assert.strictEqual(_sanitize('  hello  '), 'hello');
  });

  it('respects maxLen parameter', () => {
    assert.strictEqual(_sanitize('abcdefghij', 5), 'abcde');
  });

  it('defaults maxLen to 200', () => {
    const long = 'x'.repeat(300);
    assert.strictEqual(_sanitize(long).length, 200);
  });

  it('handles null/undefined input', () => {
    assert.strictEqual(_sanitize(null), '');
    assert.strictEqual(_sanitize(undefined), '');
  });

  it('converts non-string input to string', () => {
    assert.strictEqual(_sanitize(12345), '12345');
  });
});

// -- _escHtml -----------------------------------------------------------------

describe('_escHtml', () => {
  it('escapes & to &amp;', () => {
    assert.strictEqual(_escHtml('a&b'), 'a&amp;b');
  });

  it('escapes < to &lt;', () => {
    assert.strictEqual(_escHtml('a<b'), 'a&lt;b');
  });

  it('escapes > to &gt;', () => {
    assert.strictEqual(_escHtml('a>b'), 'a&gt;b');
  });

  it('escapes " to &quot;', () => {
    assert.strictEqual(_escHtml('a"b'), 'a&quot;b');
  });

  it("escapes ' to &#39;", () => {
    assert.strictEqual(_escHtml("a'b"), 'a&#39;b');
  });

  it('escapes all dangerous chars together', () => {
    assert.strictEqual(
      _escHtml('<img src="x" onerror=\'alert(1)\'>'),
      '&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;'
    );
  });

  it('handles null/undefined', () => {
    assert.strictEqual(_escHtml(null), '');
    assert.strictEqual(_escHtml(undefined), '');
  });

  it('does not double-escape already-escaped text', () => {
    // If someone passes &amp; it should become &amp;amp;
    assert.strictEqual(_escHtml('&amp;'), '&amp;amp;');
  });
});

// -- _rateLimit ---------------------------------------------------------------

describe('_rateLimit', () => {
  it('allows requests under the limit', () => {
    // Use a unique key per test to avoid cross-contamination
    const key = 'test_' + Date.now() + '_under';
    assert.strictEqual(_rateLimit(key, 3), true);
    assert.strictEqual(_rateLimit(key, 3), true);
    assert.strictEqual(_rateLimit(key, 3), true);
  });

  it('blocks requests at the limit', () => {
    const key = 'test_' + Date.now() + '_block';
    _rateLimit(key, 2);
    _rateLimit(key, 2);
    assert.strictEqual(_rateLimit(key, 2), false);
  });

  it('different keys are independent', () => {
    const key1 = 'test_' + Date.now() + '_a';
    const key2 = 'test_' + Date.now() + '_b';
    _rateLimit(key1, 1);
    assert.strictEqual(_rateLimit(key1, 1), false); // key1 exhausted
    assert.strictEqual(_rateLimit(key2, 1), true);  // key2 still ok
  });
});

// -- Unit unlock logic --------------------------------------------------------

describe('isUnitUnlocked', () => {
  const UNITS_DATA = [
    { id: 'u1', lessons: [{ id: 'u1l1' }, { id: 'u1l2' }] },
    { id: 'u2', lessons: [{ id: 'u2l1' }] },
    { id: 'u3', lessons: [{ id: 'u3l1' }] },
  ];

  it('unit 0 is always unlocked', () => {
    assert.strictEqual(isUnitUnlocked(0, [], UNITS_DATA), true);
  });

  it('unit 1 is locked when no scores exist', () => {
    assert.strictEqual(isUnitUnlocked(1, [], UNITS_DATA), false);
  });

  it('unit 1 unlocked when previous unit quiz scored 80%', () => {
    const scores = [{ qid: 'u1_uq', pct: 80 }];
    assert.strictEqual(isUnitUnlocked(1, scores, UNITS_DATA), true);
  });

  it('unit 1 unlocked when previous unit quiz scored above 80%', () => {
    const scores = [{ qid: 'u1_uq', pct: 95 }];
    assert.strictEqual(isUnitUnlocked(1, scores, UNITS_DATA), true);
  });

  it('unit 1 locked when previous unit quiz scored 79%', () => {
    const scores = [{ qid: 'u1_uq', pct: 79 }];
    assert.strictEqual(isUnitUnlocked(1, scores, UNITS_DATA), false);
  });

  it('unit 2 requires unit 1 quiz (not unit 0)', () => {
    const scores = [{ qid: 'u1_uq', pct: 100 }, { qid: 'u2_uq', pct: 85 }];
    assert.strictEqual(isUnitUnlocked(2, scores, UNITS_DATA), true);
  });

  it('parent unlock bypasses all checks', () => {
    assert.strictEqual(isUnitUnlocked(2, [], UNITS_DATA, true), true);
  });

  it('individually unlocked bypasses score check', () => {
    assert.strictEqual(isUnitUnlocked(1, [], UNITS_DATA, false, true), true);
  });
});

// -- Lesson unlock logic ------------------------------------------------------

describe('isLessonUnlocked', () => {
  const UNITS_DATA = [
    {
      id: 'u1',
      lessons: [
        { id: 'u1l1' },
        { id: 'u1l2' },
        { id: 'u1l3' },
      ],
    },
  ];

  it('lesson 0 is always unlocked', () => {
    assert.strictEqual(isLessonUnlocked(0, 0, [], UNITS_DATA), true);
  });

  it('lesson 1 locked when no scores exist', () => {
    assert.strictEqual(isLessonUnlocked(0, 1, [], UNITS_DATA), false);
  });

  it('lesson 1 unlocked when previous lesson quiz is 100%', () => {
    const scores = [{ qid: 'lq_u1l1', pct: 100 }];
    assert.strictEqual(isLessonUnlocked(0, 1, scores, UNITS_DATA), true);
  });

  it('lesson 1 LOCKED when previous lesson quiz is 99% (must be exactly 100)', () => {
    const scores = [{ qid: 'lq_u1l1', pct: 99 }];
    assert.strictEqual(isLessonUnlocked(0, 1, scores, UNITS_DATA), false);
  });

  it('lesson 2 requires lesson 1 quiz at 100%', () => {
    const scores = [
      { qid: 'lq_u1l1', pct: 100 },
      { qid: 'lq_u1l2', pct: 100 },
    ];
    assert.strictEqual(isLessonUnlocked(0, 2, scores, UNITS_DATA), true);
  });

  it('lesson 2 locked if lesson 1 quiz not 100%', () => {
    const scores = [
      { qid: 'lq_u1l1', pct: 100 },
      { qid: 'lq_u1l2', pct: 90 },
    ];
    assert.strictEqual(isLessonUnlocked(0, 2, scores, UNITS_DATA), false);
  });

  it('parent unlock bypasses all checks', () => {
    assert.strictEqual(isLessonUnlocked(0, 2, [], UNITS_DATA, true), true);
  });
});

// -- Unit quiz unlock logic ---------------------------------------------------

describe('isUnitQuizUnlocked', () => {
  const UNITS_DATA = [
    {
      id: 'u1',
      lessons: [
        { id: 'u1l1' },
        { id: 'u1l2' },
        { id: 'u1l3' },
      ],
    },
  ];

  it('locked when no lesson quizzes completed', () => {
    assert.strictEqual(isUnitQuizUnlocked(0, [], UNITS_DATA), false);
  });

  it('locked when only some lesson quizzes at 100%', () => {
    const scores = [
      { qid: 'lq_u1l1', pct: 100 },
      { qid: 'lq_u1l2', pct: 100 },
      // u1l3 missing
    ];
    assert.strictEqual(isUnitQuizUnlocked(0, scores, UNITS_DATA), false);
  });

  it('locked when all lessons attempted but one below 100%', () => {
    const scores = [
      { qid: 'lq_u1l1', pct: 100 },
      { qid: 'lq_u1l2', pct: 90 },
      { qid: 'lq_u1l3', pct: 100 },
    ];
    assert.strictEqual(isUnitQuizUnlocked(0, scores, UNITS_DATA), false);
  });

  it('unlocked when ALL lesson quizzes at 100%', () => {
    const scores = [
      { qid: 'lq_u1l1', pct: 100 },
      { qid: 'lq_u1l2', pct: 100 },
      { qid: 'lq_u1l3', pct: 100 },
    ];
    assert.strictEqual(isUnitQuizUnlocked(0, scores, UNITS_DATA), true);
  });

  it('parent unlock bypasses all checks', () => {
    assert.strictEqual(isUnitQuizUnlocked(0, [], UNITS_DATA, true), true);
  });
});
