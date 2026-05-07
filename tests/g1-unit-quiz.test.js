// =============================================================================
//  G1 Unit Quiz Assembly — Test Suite
//  Run: node --test tests/g1-unit-quiz.test.js
//  Requires Node 18+
//
//  Model: Unit testBank holds the FULL POOL of every lesson question. Each
//  attempt samples `totalQuestions` (default 25) from that pool, balanced
//  across lessons (as evenly as possible) and difficulty (target 8E+10M+7H).
// =============================================================================

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// =============================================================================
//  RE-IMPLEMENTED PURE FUNCTIONS (mirror src/data/shared_g1.js)
// =============================================================================

function _g1Shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function _apportion(total, weights) {
  if (!weights || weights.length === 0) return [];
  var sumW = 0;
  for (var i = 0; i < weights.length; i++) sumW += weights[i];
  if (sumW === 0 || total === 0) return weights.map(function() { return 0; });

  var quotas = weights.map(function(w) { return total * w / sumW; });
  var floors = quotas.map(function(q) { return Math.floor(q); });
  var allocated = 0;
  for (var k = 0; k < floors.length; k++) allocated += floors[k];
  var deficit = total - allocated;
  if (deficit <= 0) return floors;

  var indexed = quotas.map(function(q, i) {
    return { i: i, frac: q - Math.floor(q), tie: Math.random() };
  });
  indexed.sort(function(a, b) {
    if (Math.abs(b.frac - a.frac) > 1e-9) return b.frac - a.frac;
    return a.tie - b.tie;
  });
  for (var d = 0; d < deficit && d < indexed.length; d++) {
    floors[indexed[d].i]++;
  }
  return floors;
}

function _assembleUnitTestBank(u, utSpec) {
  var result = [];
  u.lessons.forEach(function(lesson, lessonIdx) {
    var bank = lesson.qBank || [];
    for (var i = 0; i < bank.length; i++) {
      var tagged = Object.assign({}, bank[i], {
        sourceLessonId:    lesson.id || null,
        sourceLessonTitle: lesson.title || null,
        sourceLessonIndex: lessonIdx,
        sourceUnitId:      u.id || null
      });
      result.push(tagged);
    }
  });
  return result;
}

function _sampleUnitTestAttempt(pool, n) {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= n) {
    var copy = pool.slice();
    _g1Shuffle(copy);
    return copy;
  }

  var byLesson = {};
  for (var p = 0; p < pool.length; p++) {
    var idx = pool[p].sourceLessonIndex != null ? pool[p].sourceLessonIndex : 0;
    if (!byLesson[idx]) byLesson[idx] = [];
    byLesson[idx].push(pool[p]);
  }
  var lessonIndices = Object.keys(byLesson).map(Number).sort(function(a, b) { return a - b; });
  var numLessons = lessonIndices.length;
  if (numLessons === 0) return [];

  var base  = Math.floor(n / numLessons);
  var bonus = n - base * numLessons;
  var lessonSizes = lessonIndices.map(function() { return base; });
  if (bonus > 0) {
    var bonusOrder = lessonIndices.slice();
    _g1Shuffle(bonusOrder);
    for (var b = 0; b < bonus; b++) {
      lessonSizes[lessonIndices.indexOf(bonusOrder[b])]++;
    }
  }

  var eTotal = Math.round(n * 8 / 25);
  var mTotal = Math.round(n * 10 / 25);
  var hTotal = n - eTotal - mTotal;

  var ePerLesson = _apportion(eTotal, lessonSizes);
  var afterE = lessonSizes.map(function(s, i) { return s - ePerLesson[i]; });
  var hPerLesson = _apportion(hTotal, afterE);
  var mPerLesson = lessonSizes.map(function(s, i) { return afterE[i] - hPerLesson[i]; });

  var result = [];
  lessonIndices.forEach(function(lIdx, i) {
    var lessonPool = byLesson[lIdx];
    var ePool = lessonPool.filter(function(q) { return q.d === 'e'; });
    var mPool = lessonPool.filter(function(q) { return q.d === 'm'; });
    var hPool = lessonPool.filter(function(q) { return q.d === 'h'; });

    _g1Shuffle(ePool); _g1Shuffle(mPool); _g1Shuffle(hPool);

    var ePicks = ePool.slice(0, ePerLesson[i]);
    var mPicks = mPool.slice(0, mPerLesson[i]);
    var hPicks = hPool.slice(0, hPerLesson[i]);
    var picks  = ePicks.concat(mPicks).concat(hPicks);

    var lessonTarget = lessonSizes[i];
    if (picks.length < lessonTarget) {
      var picked = picks.slice();
      var spillover = lessonPool.filter(function(q) {
        return picked.indexOf(q) === -1;
      });
      _g1Shuffle(spillover);
      var needed = lessonTarget - picks.length;
      for (var s = 0; s < needed && s < spillover.length; s++) {
        picks.push(spillover[s]);
      }
    }

    for (var pi = 0; pi < picks.length; pi++) result.push(picks[pi]);
  });

  _g1Shuffle(result);
  return result;
}

// =============================================================================
//  TEST FIXTURES
// =============================================================================

// Build a fake qBank entry with given difficulty and a unique id
function q(id, d) {
  return { id: id, t: 'Q' + id, o: ['A', 'B'], a: 0, e: 'hint-' + id, v: null,
           i: { followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true },
           sk: 'test_skill', d: d, pt: null };
}

// Build a lesson with given pool sizes per difficulty tier
function makeLesson(lessonId, easy, medium, hard) {
  var bank = [];
  for (var i = 0; i < easy;   i++) bank.push(q(lessonId + '_e' + i, 'e'));
  for (var i = 0; i < medium; i++) bank.push(q(lessonId + '_m' + i, 'm'));
  for (var i = 0; i < hard;   i++) bank.push(q(lessonId + '_h' + i, 'h'));
  return { id: 'g1-u2-' + lessonId, title: 'Lesson ' + lessonId, qBank: bank };
}

// G1 U2 fixture mirroring real lesson sizes (80, 170, 120, 160 = 530 total).
// Per-lesson tiers split roughly proportional, enough to exercise sampling.
function makeRealU2() {
  return {
    id: 'g1u2',
    name: 'Place Value',
    lessons: [
      makeLesson('l1', 26, 32, 22),   // 80
      makeLesson('l2', 56, 68, 46),   // 170
      makeLesson('l3', 40, 48, 32),   // 120
      makeLesson('l4', 53, 64, 43)    // 160
    ]
  };
}

// Smaller fixture for fast-running tests
function makeSmallU2() {
  return {
    id: 'g1u2',
    lessons: [
      makeLesson('l1', 30, 30, 30),
      makeLesson('l2', 30, 30, 30),
      makeLesson('l3', 30, 30, 30),
      makeLesson('l4', 30, 30, 30)
    ]
  };
}

const U2_SPEC = {
  sourceRule: 'all_lesson_quizbanks',
  totalQuestions: 25,
  difficultyMixBalanced: true,
  preserveDiagnosticMetadata: true
};

// =============================================================================
//  TESTS
// =============================================================================

// -- _g1Shuffle ---------------------------------------------------------------

describe('_g1Shuffle', () => {
  it('returns the same array reference (mutates in place)', () => {
    var arr = [1, 2, 3, 4, 5];
    var result = _g1Shuffle(arr);
    assert.strictEqual(result, arr);
  });

  it('preserves all elements (no duplicates, no losses)', () => {
    var arr = [10, 20, 30, 40, 50];
    _g1Shuffle(arr);
    assert.deepStrictEqual(arr.sort(function(a, b) { return a - b; }), [10, 20, 30, 40, 50]);
  });
});

// -- _apportion ---------------------------------------------------------------

describe('_apportion', () => {
  it('returns empty array for empty weights', () => {
    assert.deepStrictEqual(_apportion(10, []), []);
  });

  it('returns zeros when total is 0', () => {
    assert.deepStrictEqual(_apportion(0, [1, 1, 1]), [0, 0, 0]);
  });

  it('apportions evenly when weights are equal', () => {
    var result = _apportion(8, [1, 1, 1, 1]);
    assert.strictEqual(result.reduce(function(s, x) { return s + x; }, 0), 8);
    result.forEach(function(x) { assert.strictEqual(x, 2); });
  });

  it('apportions 7 across [1,1,1,1] giving sum=7 with 3 slots getting 2 and 1 getting 1', () => {
    for (var run = 0; run < 50; run++) {
      var result = _apportion(7, [1, 1, 1, 1]);
      assert.strictEqual(result.reduce(function(s, x) { return s + x; }, 0), 7);
      var twos = result.filter(function(x) { return x === 2; }).length;
      var ones = result.filter(function(x) { return x === 1; }).length;
      assert.strictEqual(twos, 3, 'run ' + run + ' twos=' + twos);
      assert.strictEqual(ones, 1, 'run ' + run + ' ones=' + ones);
    }
  });

  it('apportions proportional to weights (8 across [7,6,6,6])', () => {
    // 7/25*8 = 2.24, 6/25*8 = 1.92 (×3). Floors: 2,1,1,1 = 5. Need 3 more.
    // Highest fractions: 6/25*8=1.92 (×3) > 0.24. So three 6-weight lessons each +1.
    // Result: 2,2,2,2.
    for (var run = 0; run < 50; run++) {
      var result = _apportion(8, [7, 6, 6, 6]);
      assert.strictEqual(result.reduce(function(s, x) { return s + x; }, 0), 8);
      assert.deepStrictEqual(result, [2, 2, 2, 2], 'run ' + run);
    }
  });

  it('always sums exactly to the total', () => {
    var samples = [
      [25, [7, 6, 6, 6]],
      [10, [3, 4, 3]],
      [13, [5, 5, 5, 5]],
      [1,  [10, 10, 10]],
      [100, [1, 2, 3, 4, 5]]
    ];
    samples.forEach(function(s) {
      var total = s[0], weights = s[1];
      var result = _apportion(total, weights);
      var sum = result.reduce(function(a, b) { return a + b; }, 0);
      assert.strictEqual(sum, total, 'total=' + total + ' weights=' + JSON.stringify(weights));
    });
  });
});

// -- _assembleUnitTestBank — full pool ----------------------------------------

describe('_assembleUnitTestBank — full pool', () => {
  it('returns every question from every lesson (530 for real-U2 sizes)', () => {
    var u = makeRealU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    assert.strictEqual(pool.length, 530, 'expected 80+170+120+160 = 530');
  });

  it('per-lesson pool sizes are 80 / 170 / 120 / 160', () => {
    var u = makeRealU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var byLesson = { 0: 0, 1: 0, 2: 0, 3: 0 };
    pool.forEach(function(q) { byLesson[q.sourceLessonIndex]++; });
    assert.strictEqual(byLesson[0], 80,  'L1 pool should be 80');
    assert.strictEqual(byLesson[1], 170, 'L2 pool should be 170');
    assert.strictEqual(byLesson[2], 120, 'L3 pool should be 120');
    assert.strictEqual(byLesson[3], 160, 'L4 pool should be 160');
  });

  it('every pool question has source-lesson metadata', () => {
    var u = makeRealU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    pool.forEach(function(p, i) {
      assert.ok(p.sourceLessonId,    'q ' + i + ' missing sourceLessonId');
      assert.ok(p.sourceLessonTitle, 'q ' + i + ' missing sourceLessonTitle');
      assert.strictEqual(typeof p.sourceLessonIndex, 'number');
      assert.strictEqual(p.sourceUnitId, 'g1u2');
    });
  });

  it('preserves diagnostic metadata (d, sk, e, i, v, pt)', () => {
    var u = makeRealU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var sample = pool[0];
    assert.ok(sample.d);
    assert.strictEqual(sample.sk, 'test_skill');
    assert.ok(sample.e.startsWith('hint-'));
    assert.deepStrictEqual(sample.i, { followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true });
  });

  it('does not mutate original lesson qBanks', () => {
    var u = makeRealU2();
    var beforeKeys = u.lessons.map(function(l) {
      return l.qBank.map(function(q) { return Object.keys(q).sort().join(','); });
    });
    var beforeSizes = u.lessons.map(function(l) { return l.qBank.length; });
    _assembleUnitTestBank(u, U2_SPEC);
    var afterKeys = u.lessons.map(function(l) {
      return l.qBank.map(function(q) { return Object.keys(q).sort().join(','); });
    });
    var afterSizes = u.lessons.map(function(l) { return l.qBank.length; });
    assert.deepStrictEqual(afterSizes, beforeSizes);
    assert.deepStrictEqual(afterKeys, beforeKeys);

    // Spot-check: no source qBank question has sourceLessonId
    u.lessons.forEach(function(l) {
      l.qBank.forEach(function(q) {
        assert.strictEqual(q.sourceLessonId, undefined);
      });
    });
  });

  it('returns clones, not references to source qBank entries', () => {
    var u = makeRealU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var sourceQuestions = u.lessons.reduce(function(acc, l) {
      return acc.concat(l.qBank);
    }, []);
    pool.forEach(function(p) {
      assert.ok(!sourceQuestions.includes(p),
        'pool question should be a clone, not a reference');
    });
  });
});

// -- _sampleUnitTestAttempt: count + lesson balance --------------------------

describe('_sampleUnitTestAttempt — Unit 2 attempt (n=25)', () => {
  it('produces exactly 25 questions', () => {
    var u = makeSmallU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var attempt = _sampleUnitTestAttempt(pool, 25);
    assert.strictEqual(attempt.length, 25);
  });

  it('lesson distribution is one of 7/6/6/6 (in some order, exactly one lesson with 7)', () => {
    for (var run = 0; run < 50; run++) {
      var u = makeSmallU2();
      var pool = _assembleUnitTestBank(u, U2_SPEC);
      var attempt = _sampleUnitTestAttempt(pool, 25);
      var byLesson = { 0: 0, 1: 0, 2: 0, 3: 0 };
      attempt.forEach(function(q) { byLesson[q.sourceLessonIndex]++; });

      var counts = [byLesson[0], byLesson[1], byLesson[2], byLesson[3]];
      counts.sort(function(a, b) { return b - a; });
      assert.deepStrictEqual(counts, [7, 6, 6, 6], 'run ' + run + ' counts=' + JSON.stringify(counts));
    }
  });

  it('every assembled question has source-lesson metadata', () => {
    var u = makeSmallU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var attempt = _sampleUnitTestAttempt(pool, 25);
    attempt.forEach(function(q, i) {
      assert.ok(q.sourceLessonId,    'q ' + i + ' missing sourceLessonId');
      assert.ok(q.sourceLessonTitle, 'q ' + i + ' missing sourceLessonTitle');
      assert.strictEqual(typeof q.sourceLessonIndex, 'number');
      assert.strictEqual(q.sourceUnitId, 'g1u2');
    });
  });

  it('all 25 attempt questions are distinct objects', () => {
    var u = makeSmallU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var attempt = _sampleUnitTestAttempt(pool, 25);
    var ids = attempt.map(function(q) { return q.id; });
    var unique = new Set(ids);
    assert.strictEqual(unique.size, 25);
  });
});

// -- _sampleUnitTestAttempt: difficulty balance ------------------------------

describe('_sampleUnitTestAttempt — difficulty target', () => {
  it('hits exact 8E + 10M + 7H target', () => {
    for (var run = 0; run < 50; run++) {
      var u = makeSmallU2();
      var pool = _assembleUnitTestBank(u, U2_SPEC);
      var attempt = _sampleUnitTestAttempt(pool, 25);
      var e = attempt.filter(function(q) { return q.d === 'e'; }).length;
      var m = attempt.filter(function(q) { return q.d === 'm'; }).length;
      var h = attempt.filter(function(q) { return q.d === 'h'; }).length;
      assert.strictEqual(e, 8,  'run ' + run + ' easy=' + e);
      assert.strictEqual(m, 10, 'run ' + run + ' medium=' + m);
      assert.strictEqual(h, 7,  'run ' + run + ' hard=' + h);
    }
  });

  it('per-lesson totals equal the chosen lesson sizes', () => {
    for (var run = 0; run < 20; run++) {
      var u = makeSmallU2();
      var pool = _assembleUnitTestBank(u, U2_SPEC);
      var attempt = _sampleUnitTestAttempt(pool, 25);
      var byLesson = { 0: 0, 1: 0, 2: 0, 3: 0 };
      attempt.forEach(function(q) { byLesson[q.sourceLessonIndex]++; });

      var sum = byLesson[0] + byLesson[1] + byLesson[2] + byLesson[3];
      assert.strictEqual(sum, 25, 'run ' + run);
    }
  });
});

// -- _sampleUnitTestAttempt: variability across attempts --------------------

describe('_sampleUnitTestAttempt — repeated attempts vary', () => {
  it('produces different question sets on repeated calls', () => {
    var u = makeSmallU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);

    // Capture id-sets for 5 attempts; at least 4 should be distinct.
    var idSets = [];
    for (var i = 0; i < 5; i++) {
      var a = _sampleUnitTestAttempt(pool, 25);
      idSets.push(a.map(function(q) { return q.id; }).sort().join('|'));
    }
    var unique = new Set(idSets);
    assert.ok(unique.size >= 4, 'expected at least 4 distinct attempt sets out of 5, got ' + unique.size);
  });

  it('which lesson gets the +1 bonus varies across attempts', () => {
    var u = makeSmallU2();
    var pool = _assembleUnitTestBank(u, U2_SPEC);

    var bonusLessons = {};
    for (var i = 0; i < 30; i++) {
      var a = _sampleUnitTestAttempt(pool, 25);
      var byLesson = { 0: 0, 1: 0, 2: 0, 3: 0 };
      a.forEach(function(q) { byLesson[q.sourceLessonIndex]++; });
      // Find the lesson with 7 (the bonus)
      for (var idx = 0; idx < 4; idx++) {
        if (byLesson[idx] === 7) {
          bonusLessons[idx] = (bonusLessons[idx] || 0) + 1;
          break;
        }
      }
    }
    // Across 30 attempts we expect at least 2 different lessons to have been bonused
    assert.ok(Object.keys(bonusLessons).length >= 2,
      'expected bonus to land on >= 2 different lessons across 30 attempts; got ' +
      JSON.stringify(bonusLessons));
  });
});

// -- _sampleUnitTestAttempt: Unit 1 (8 lessons, n=25) ----------------------

describe('_sampleUnitTestAttempt — Unit 1 attempt (8 lessons, n=25)', () => {
  function makeU1() {
    return {
      id: 'g1u1',
      lessons: Array.from({ length: 8 }, function(_, i) {
        return makeLesson('l' + (i + 1), 30, 30, 30);
      })
    };
  }

  it('produces exactly 25 questions', () => {
    var u = makeU1();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var attempt = _sampleUnitTestAttempt(pool, 25);
    assert.strictEqual(attempt.length, 25);
  });

  it('lesson distribution is 4/3/3/3/3/3/3/3 (one lesson with 4, seven with 3)', () => {
    for (var run = 0; run < 50; run++) {
      var u = makeU1();
      var pool = _assembleUnitTestBank(u, U2_SPEC);
      var attempt = _sampleUnitTestAttempt(pool, 25);
      var byLesson = {};
      for (var li = 0; li < 8; li++) byLesson[li] = 0;
      attempt.forEach(function(q) { byLesson[q.sourceLessonIndex]++; });

      var counts = [];
      for (var i = 0; i < 8; i++) counts.push(byLesson[i]);
      counts.sort(function(a, b) { return b - a; });
      assert.deepStrictEqual(counts, [4, 3, 3, 3, 3, 3, 3, 3],
        'run ' + run + ' counts=' + JSON.stringify(counts));
    }
  });

  it('hits exact 8E + 10M + 7H difficulty target', () => {
    for (var run = 0; run < 30; run++) {
      var u = makeU1();
      var pool = _assembleUnitTestBank(u, U2_SPEC);
      var attempt = _sampleUnitTestAttempt(pool, 25);
      var e = attempt.filter(function(q) { return q.d === 'e'; }).length;
      var m = attempt.filter(function(q) { return q.d === 'm'; }).length;
      var h = attempt.filter(function(q) { return q.d === 'h'; }).length;
      assert.strictEqual(e, 8,  'run ' + run);
      assert.strictEqual(m, 10, 'run ' + run);
      assert.strictEqual(h, 7,  'run ' + run);
    }
  });

  it('the +1 bonus rotates across lessons over many attempts', () => {
    var u = makeU1();
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var bonusLessons = {};
    for (var i = 0; i < 80; i++) {
      var attempt = _sampleUnitTestAttempt(pool, 25);
      var byLesson = {};
      for (var li = 0; li < 8; li++) byLesson[li] = 0;
      attempt.forEach(function(q) { byLesson[q.sourceLessonIndex]++; });
      for (var idx = 0; idx < 8; idx++) {
        if (byLesson[idx] === 4) {
          bonusLessons[idx] = (bonusLessons[idx] || 0) + 1;
          break;
        }
      }
    }
    // Across 80 attempts we expect bonus to land on at least 5 different lessons
    assert.ok(Object.keys(bonusLessons).length >= 5,
      'bonus should rotate across >=5 of 8 lessons; got ' + JSON.stringify(bonusLessons));
  });
});

// -- _sampleUnitTestAttempt: edge cases -------------------------------------

describe('_sampleUnitTestAttempt — edge cases', () => {
  it('returns empty for empty pool', () => {
    assert.deepStrictEqual(_sampleUnitTestAttempt([], 25), []);
    assert.deepStrictEqual(_sampleUnitTestAttempt(null, 25), []);
  });

  it('returns the whole pool shuffled when pool.length <= n', () => {
    var pool = [
      { id: '1', d: 'e', sourceLessonIndex: 0 },
      { id: '2', d: 'm', sourceLessonIndex: 0 },
      { id: '3', d: 'h', sourceLessonIndex: 1 }
    ];
    var attempt = _sampleUnitTestAttempt(pool, 25);
    assert.strictEqual(attempt.length, 3);
    var ids = attempt.map(function(q) { return q.id; }).sort();
    assert.deepStrictEqual(ids, ['1', '2', '3']);
  });

  it('handles a lesson with empty difficulty tier (spillover from other tiers)', () => {
    // Build a pool where one lesson has zero hard questions
    var u = {
      id: 'g1u2',
      lessons: [
        makeLesson('l1', 30, 30, 30),
        makeLesson('l2', 30, 30, 30),
        { id: 'g1-u2-l3', title: 'L3', qBank: [
          // 30 easy, 30 medium, 0 hard
        ].concat(
          Array.from({ length: 30 }, function(_, i) { return q('l3_e' + i, 'e'); }),
          Array.from({ length: 30 }, function(_, i) { return q('l3_m' + i, 'm'); })
        ) },
        makeLesson('l4', 30, 30, 30)
      ]
    };
    var pool = _assembleUnitTestBank(u, U2_SPEC);
    var attempt = _sampleUnitTestAttempt(pool, 25);
    assert.strictEqual(attempt.length, 25, 'spillover should still produce 25 questions');
  });
});
