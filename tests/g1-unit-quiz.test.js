// =============================================================================
//  G1 Unit Quiz Assembly — Test Suite
//  Run: node --test tests/g1-unit-quiz.test.js
//  Requires Node 18+
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

function _sampleFromBank(bank, count, balanced) {
  if (!bank || bank.length === 0) return [];
  count = Math.min(count, bank.length);

  if (!balanced) {
    var pool = bank.slice();
    _g1Shuffle(pool);
    return pool.slice(0, count);
  }

  var easy   = bank.filter(function(q) { return q.d === 'e'; });
  var medium = bank.filter(function(q) { return q.d === 'm'; });
  var hard   = bank.filter(function(q) { return q.d === 'h'; });

  _g1Shuffle(easy); _g1Shuffle(medium); _g1Shuffle(hard);

  var tH = Math.round(count * 0.25);
  var tE = Math.round((count - tH) / 2);
  var tM = count - tH - tE;

  var usedE = easy.slice(0, tE);
  var usedM = medium.slice(0, tM);
  var usedH = hard.slice(0, tH);
  var selected = usedE.concat(usedM).concat(usedH);

  if (selected.length < count) {
    var spillover = easy.slice(tE).concat(medium.slice(tM)).concat(hard.slice(tH));
    _g1Shuffle(spillover);
    var needed = count - selected.length;
    for (var j = 0; j < needed && j < spillover.length; j++) {
      selected.push(spillover[j]);
    }
  }

  return selected;
}

function _assembleUnitTestBank(u, utSpec) {
  var perLesson = utSpec.perLessonCount || 5;
  var balanced  = !!utSpec.difficultyMixBalanced;
  var result    = [];

  u.lessons.forEach(function(lesson) {
    var bank   = (lesson.qBank || []).slice();
    var sample = _sampleFromBank(bank, perLesson, balanced);
    for (var i = 0; i < sample.length; i++) result.push(sample[i]);
  });

  return result;
}

// =============================================================================
//  TEST FIXTURES
// =============================================================================

// Build a fake qBank entry with given difficulty and a unique id
function q(id, d) {
  return { id: id, t: 'Q' + id, o: ['A', 'B'], a: 0, e: '', v: null,
           i: { followUpRule: 'same_skill_new_numbers' }, sk: 'test_skill', d: d, pt: null };
}

// Build a lesson with n questions in each difficulty tier
function makeLesson(lessonId, easy, medium, hard) {
  var bank = [];
  for (var i = 0; i < easy;   i++) bank.push(q(lessonId + '_e' + i, 'e'));
  for (var i = 0; i < medium; i++) bank.push(q(lessonId + '_m' + i, 'm'));
  for (var i = 0; i < hard;   i++) bank.push(q(lessonId + '_h' + i, 'h'));
  return { id: lessonId, qBank: bank };
}

// U2-like unit: 4 lessons, each with plenty of questions per tier
function makeU2() {
  return {
    id: 'g1u2',
    lessons: [
      makeLesson('l1', 50, 60, 50),
      makeLesson('l2', 50, 60, 50),
      makeLesson('l3', 50, 60, 50),
      makeLesson('l4', 50, 60, 50)
    ]
  };
}

// U1-like unit: 8 lessons, each with plenty of questions per tier
function makeU1() {
  return {
    id: 'g1u1',
    lessons: Array.from({ length: 8 }, function(_, i) {
      return makeLesson('l' + (i + 1), 40, 50, 30);
    })
  };
}

const U2_SPEC = {
  sourceRule: 'all_lesson_quizbanks',
  totalQuestions: 32,
  perLessonCount: 8,
  difficultyMixBalanced: true,
  preserveDiagnosticMetadata: true
};

const U1_SPEC = {
  sourceRule: 'all_lesson_quizbanks',
  totalQuestions: 40,
  perLessonCount: 5,
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
    assert.strictEqual(result, arr, 'should return the exact same array object');
  });

  it('preserves all elements (no duplicates, no losses)', () => {
    var arr = [10, 20, 30, 40, 50];
    _g1Shuffle(arr);
    assert.deepStrictEqual(arr.sort(function(a, b) { return a - b; }), [10, 20, 30, 40, 50]);
  });
});

// -- _sampleFromBank -----------------------------------------------------------

describe('_sampleFromBank', () => {
  it('returns empty array for empty bank', () => {
    assert.deepStrictEqual(_sampleFromBank([], 5, true), []);
    assert.deepStrictEqual(_sampleFromBank(null, 5, true), []);
  });

  it('returns at most count items (balanced=false)', () => {
    var bank = Array.from({ length: 20 }, function(_, i) { return q(i, 'e'); });
    var result = _sampleFromBank(bank, 8, false);
    assert.strictEqual(result.length, 8);
  });

  it('returns all items when bank is smaller than count', () => {
    var bank = [q(0, 'e'), q(1, 'm')];
    var result = _sampleFromBank(bank, 10, true);
    assert.strictEqual(result.length, 2);
  });

  it('does not mutate the original bank array', () => {
    var bank = [q(0, 'e'), q(1, 'm'), q(2, 'h'), q(3, 'e'), q(4, 'm')];
    var original = bank.map(function(x) { return x.id; });
    _sampleFromBank(bank, 3, true);
    var after = bank.map(function(x) { return x.id; });
    assert.deepStrictEqual(after, original);
  });

  it('balanced=true with 8 count: targets 3E + 3M + 2H', () => {
    var bank = [];
    for (var i = 0; i < 20; i++) bank.push(q('e' + i, 'e'));
    for (var i = 0; i < 20; i++) bank.push(q('m' + i, 'm'));
    for (var i = 0; i < 20; i++) bank.push(q('h' + i, 'h'));

    for (var run = 0; run < 100; run++) {
      var result = _sampleFromBank(bank, 8, true);
      assert.strictEqual(result.length, 8, 'expected 8 questions, run ' + run);
      var e = result.filter(function(q) { return q.d === 'e'; }).length;
      var m = result.filter(function(q) { return q.d === 'm'; }).length;
      var h = result.filter(function(q) { return q.d === 'h'; }).length;
      assert.strictEqual(e, 3, 'expected 3 easy (got ' + e + '), run ' + run);
      assert.strictEqual(m, 3, 'expected 3 medium (got ' + m + '), run ' + run);
      assert.strictEqual(h, 2, 'expected 2 hard (got ' + h + '), run ' + run);
    }
  });

  it('balanced=true with 5 count: targets 2E + 2M + 1H', () => {
    var bank = [];
    for (var i = 0; i < 20; i++) bank.push(q('e' + i, 'e'));
    for (var i = 0; i < 20; i++) bank.push(q('m' + i, 'm'));
    for (var i = 0; i < 20; i++) bank.push(q('h' + i, 'h'));

    for (var run = 0; run < 100; run++) {
      var result = _sampleFromBank(bank, 5, true);
      assert.strictEqual(result.length, 5, 'expected 5 questions, run ' + run);
      var e = result.filter(function(q) { return q.d === 'e'; }).length;
      var m = result.filter(function(q) { return q.d === 'm'; }).length;
      var h = result.filter(function(q) { return q.d === 'h'; }).length;
      assert.strictEqual(e, 2, 'expected 2 easy (got ' + e + '), run ' + run);
      assert.strictEqual(m, 2, 'expected 2 medium (got ' + m + '), run ' + run);
      assert.strictEqual(h, 1, 'expected 1 hard (got ' + h + '), run ' + run);
    }
  });

  it('falls back to spillover when a difficulty tier is short', () => {
    var bank = [];
    for (var i = 0; i < 10; i++) bank.push(q('e' + i, 'e'));
    for (var i = 0; i < 10; i++) bank.push(q('m' + i, 'm'));
    bank.push(q('h0', 'h')); // only 1 hard

    var result = _sampleFromBank(bank, 8, true);
    assert.strictEqual(result.length, 8, 'should still get 8 questions with short hard tier');
    var hardCount = result.filter(function(r) { return r.d === 'h'; }).length;
    assert.ok(hardCount <= 1, 'at most 1 hard question (only 1 exists)');
    var nonHardCount = result.filter(function(r) { return r.d !== 'h'; }).length;
    assert.ok(nonHardCount >= 7, 'spillover filled from easy/medium');
  });

  it('handles a bank with only one difficulty tier', () => {
    var bank = Array.from({ length: 20 }, function(_, i) { return q('e' + i, 'e'); });
    var result = _sampleFromBank(bank, 8, true);
    assert.strictEqual(result.length, 8);
    assert.ok(result.every(function(q) { return q.d === 'e'; }), 'all should be easy');
  });

  it('preserves metadata fields on returned questions', () => {
    var bank = [
      { id: 'q1', t: 'prompt', o: ['A', 'B'], a: 0, e: 'hint',
        v: { type: 'base10', config: { tens: 2, ones: 4 } },
        i: { followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true },
        sk: 'compose_groups_of_ten', d: 'e', pt: null }
    ];
    var result = _sampleFromBank(bank, 1, true);
    assert.strictEqual(result.length, 1);
    var r = result[0];
    assert.strictEqual(r.sk, 'compose_groups_of_ten');
    assert.deepStrictEqual(r.v, { type: 'base10', config: { tens: 2, ones: 4 } });
    assert.deepStrictEqual(r.i, { followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true });
    assert.strictEqual(r.e, 'hint');
  });

  it('does not return duplicate question objects in one sample', () => {
    var bank = [];
    for (var i = 0; i < 20; i++) bank.push(q('e' + i, 'e'));
    for (var i = 0; i < 20; i++) bank.push(q('m' + i, 'm'));
    for (var i = 0; i < 20; i++) bank.push(q('h' + i, 'h'));

    var result = _sampleFromBank(bank, 8, true);
    var ids = result.map(function(q) { return q.id; });
    var unique = new Set(ids);
    assert.strictEqual(unique.size, 8, 'all 8 should be distinct questions');
  });
});

// -- _assembleUnitTestBank: U2 (4 lessons × 8 = 32) ---------------------------

describe('_assembleUnitTestBank — Unit 2 (4 lessons × 8)', () => {
  it('produces exactly 32 questions', () => {
    var u = makeU2();
    var bank = _assembleUnitTestBank(u, U2_SPEC);
    assert.strictEqual(bank.length, 32);
  });

  it('draws 8 questions from each of the 4 lessons', () => {
    var u = makeU2();
    var bank = _assembleUnitTestBank(u, U2_SPEC);

    var perLesson = { l1: 0, l2: 0, l3: 0, l4: 0 };
    bank.forEach(function(q) {
      var prefix = q.id.split('_')[0];
      if (perLesson[prefix] !== undefined) perLesson[prefix]++;
    });

    assert.strictEqual(perLesson.l1, 8, 'l1 should contribute 8');
    assert.strictEqual(perLesson.l2, 8, 'l2 should contribute 8');
    assert.strictEqual(perLesson.l3, 8, 'l3 should contribute 8');
    assert.strictEqual(perLesson.l4, 8, 'l4 should contribute 8');
  });

  it('balanced difficulty per lesson: each lesson yields 3E+3M+2H', () => {
    for (var run = 0; run < 10; run++) {
      var u = makeU2();
      var bank = _assembleUnitTestBank(u, U2_SPEC);

      ['l1', 'l2', 'l3', 'l4'].forEach(function(lid) {
        var slice = bank.filter(function(q) { return q.id.startsWith(lid + '_'); });
        var e = slice.filter(function(q) { return q.d === 'e'; }).length;
        var m = slice.filter(function(q) { return q.d === 'm'; }).length;
        var h = slice.filter(function(q) { return q.d === 'h'; }).length;
        assert.strictEqual(e, 3, lid + ': expected 3E, run ' + run);
        assert.strictEqual(m, 3, lid + ': expected 3M, run ' + run);
        assert.strictEqual(h, 2, lid + ': expected 2H, run ' + run);
      });
    }
  });

  it('does not mutate original lesson qBanks', () => {
    var u = makeU2();
    var originalSizes = u.lessons.map(function(l) { return l.qBank.length; });
    _assembleUnitTestBank(u, U2_SPEC);
    var afterSizes = u.lessons.map(function(l) { return l.qBank.length; });
    assert.deepStrictEqual(afterSizes, originalSizes);
  });

  it('all 32 questions have distinct ids (no duplicates)', () => {
    var u = makeU2();
    var bank = _assembleUnitTestBank(u, U2_SPEC);
    var ids = bank.map(function(q) { return q.id; });
    var unique = new Set(ids);
    assert.strictEqual(unique.size, 32, 'all 32 should be distinct');
  });
});

// -- _assembleUnitTestBank: U1 (8 lessons × 5 = 40) ---------------------------

describe('_assembleUnitTestBank — Unit 1 (8 lessons × 5)', () => {
  it('produces exactly 40 questions', () => {
    var u = makeU1();
    var bank = _assembleUnitTestBank(u, U1_SPEC);
    assert.strictEqual(bank.length, 40);
  });

  it('draws 5 questions from each of 8 lessons', () => {
    var u = makeU1();
    var bank = _assembleUnitTestBank(u, U1_SPEC);

    for (var li = 1; li <= 8; li++) {
      var lid = 'l' + li;
      var count = bank.filter(function(q) { return q.id.startsWith(lid + '_'); }).length;
      assert.strictEqual(count, 5, lid + ' should contribute 5');
    }
  });

  it('balanced difficulty per lesson: each lesson yields 2E+2M+1H', () => {
    for (var run = 0; run < 10; run++) {
      var u = makeU1();
      var bank = _assembleUnitTestBank(u, U1_SPEC);

      for (var li = 1; li <= 8; li++) {
        var lid = 'l' + li;
        var slice = bank.filter(function(q) { return q.id.startsWith(lid + '_'); });
        var e = slice.filter(function(q) { return q.d === 'e'; }).length;
        var m = slice.filter(function(q) { return q.d === 'm'; }).length;
        var h = slice.filter(function(q) { return q.d === 'h'; }).length;
        assert.strictEqual(e, 2, lid + ': expected 2E, run ' + run);
        assert.strictEqual(m, 2, lid + ': expected 2M, run ' + run);
        assert.strictEqual(h, 1, lid + ': expected 1H, run ' + run);
      }
    }
  });
});

// -- edge cases ---------------------------------------------------------------

describe('_assembleUnitTestBank — edge cases', () => {
  it('handles a lesson with empty qBank gracefully', () => {
    var u = {
      id: 'g1u2',
      lessons: [
        makeLesson('l1', 50, 60, 50),
        { id: 'l2', qBank: [] },
        makeLesson('l3', 50, 60, 50),
        makeLesson('l4', 50, 60, 50)
      ]
    };
    var bank = _assembleUnitTestBank(u, U2_SPEC);
    assert.strictEqual(bank.length, 24);
  });

  it('handles a lesson with no qBank property', () => {
    var u = {
      id: 'g1u2',
      lessons: [
        makeLesson('l1', 50, 60, 50),
        { id: 'l2' },
        makeLesson('l3', 50, 60, 50),
        makeLesson('l4', 50, 60, 50)
      ]
    };
    var bank = _assembleUnitTestBank(u, U2_SPEC);
    assert.strictEqual(bank.length, 24);
  });
});
