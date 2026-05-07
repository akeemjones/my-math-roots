# G1 Unit Quiz Assembly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `_mergeG1UnitData` to build a `testBank` from lesson quizBanks whenever `spec.unitTest.sourceRule === 'all_lesson_quizbanks'`, so that G1 Unit 2 (and Unit 1) get a valid 32-question (40-question) unit quiz bank automatically.

**Architecture:** Add two pure helper functions (`_g1Shuffle`, `_sampleFromBank`) and one assembly function (`_assembleUnitTestBank`) directly above `_mergeG1UnitData` in `shared_g1.js`. Inside `_mergeG1UnitData`, replace the existing single-branch `spec.unitTest.bank` check with a two-branch check that also handles `sourceRule`. Tests live in a new `tests/g1-unit-quiz.test.js` using the same `node:test` pattern as `tests/core.test.js`.

**Tech Stack:** Vanilla JS (ES5-compatible browser globals), Node.js `node:test` + `node:assert/strict` for tests.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/data/shared_g1.js` | Add `_g1Shuffle`, `_sampleFromBank`, `_assembleUnitTestBank`; update `_mergeG1UnitData` |
| Create | `tests/g1-unit-quiz.test.js` | Unit tests for assembly logic |

No other files change.

---

## Background: How the pieces fit

`_mergeG1UnitData(idx, spec)` is called at the end of each lazy-loaded data script (`dist/data/g1/u1.js`, `dist/data/g1/u2.js`). The function:

1. Walks `spec.lessons`, converting each v0.2.0 question format to legacy `{t, o, a, e, v, i, sk, d, pt}`.
2. Sets `u.lessons[i].qBank` to the converted array.
3. **Currently:** only sets `u.testBank` if `spec.unitTest.bank` is a pre-built array.

After step 2, all lesson `qBank`s are available on `u.lessons`. The new code runs in step 3 instead, reading those `qBank`s when `sourceRule === 'all_lesson_quizbanks'`.

**Legacy question shape** (what lands in `qBank` after conversion):
```js
{
  t:  string,          // prompt text
  o:  Array,           // answer choices (string or {val, tag, me})
  a:  number,          // index of correct choice
  e:  string,          // hint
  v:  {type, config},  // visual (or null)
  i:  object,          // intervention (or null)
  sk: string,          // subSkill (or null)
  d:  string,          // difficulty first char: 'e' | 'm' | 'h' (or null)
  pt: string           // promptTemplate (or null)
}
```

`d` is the difficulty field used by `_sampleFromBank` to split easy/medium/hard.

---

## Task 1: Write failing tests

**Files:**
- Create: `tests/g1-unit-quiz.test.js`

### Step 1.1 — Create the test file with pure function copies and test stubs

The test file re-implements the helper logic as pure JS (same pattern as `core.test.js`) so it runs under Node without a DOM.

- [ ] Create `tests/g1-unit-quiz.test.js` with this content:

```js
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
    // Run 100 times; each run should have at most tE+spillover E, etc.
    // The key invariant: total === 8 every time.
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
    // Only 1 hard question available; extra needed question should come from spillover
    var bank = [];
    for (var i = 0; i < 10; i++) bank.push(q('e' + i, 'e'));
    for (var i = 0; i < 10; i++) bank.push(q('m' + i, 'm'));
    bank.push(q('h0', 'h')); // only 1 hard

    var result = _sampleFromBank(bank, 8, true);
    assert.strictEqual(result.length, 8, 'should still get 8 questions with short hard tier');
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

    // Each lesson's questions have ids prefixed by lesson id
    var perLesson = { l1: 0, l2: 0, l3: 0, l4: 0 };
    bank.forEach(function(q) {
      var prefix = q.id.split('_')[0]; // 'l1', 'l2', etc.
      if (perLesson[prefix] !== undefined) perLesson[prefix]++;
    });

    assert.strictEqual(perLesson.l1, 8, 'l1 should contribute 8');
    assert.strictEqual(perLesson.l2, 8, 'l2 should contribute 8');
    assert.strictEqual(perLesson.l3, 8, 'l3 should contribute 8');
    assert.strictEqual(perLesson.l4, 8, 'l4 should contribute 8');
  });

  it('balanced difficulty per lesson: each lesson yields 3E+3M+2H', () => {
    // Run 10 times (each run is random); check invariant holds each time
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
        { id: 'l2', qBank: [] },        // empty lesson
        makeLesson('l3', 50, 60, 50),
        makeLesson('l4', 50, 60, 50)
      ]
    };
    var bank = _assembleUnitTestBank(u, U2_SPEC);
    // l2 contributes 0; l1, l3, l4 each contribute 8 → total 24
    assert.strictEqual(bank.length, 24);
  });

  it('handles a lesson with no qBank property', () => {
    var u = {
      id: 'g1u2',
      lessons: [
        makeLesson('l1', 50, 60, 50),
        { id: 'l2' },                   // qBank missing entirely
        makeLesson('l3', 50, 60, 50),
        makeLesson('l4', 50, 60, 50)
      ]
    };
    var bank = _assembleUnitTestBank(u, U2_SPEC);
    assert.strictEqual(bank.length, 24);
  });
});
```

### Step 1.2 — Run the tests to confirm they fail

- [ ] Run:

```
node --test tests/g1-unit-quiz.test.js
```

Expected output: all tests FAIL with `ReferenceError` or `AssertionError` because the pure function copies in the test file are the implementations themselves — once the file is saved, they should actually PASS (this is a self-contained test file, not an import test). Verify that the tests **pass** after creation.

> **Note:** Because this test file re-implements the helpers inline (as `core.test.js` does), the tests will pass as soon as the file exists. The real "failing" state is the runtime: `u.testBank` won't exist until `_mergeG1UnitData` is patched in Task 2. The tests here validate the pure logic independently.

- [ ] Confirm: 62 + N tests pass (where N is the new tests added), 0 fail.

---

## Task 2: Implement the assembly logic in `shared_g1.js`

**Files:**
- Modify: `src/data/shared_g1.js:191-275`

### Step 2.1 — Add helper functions above `_mergeG1UnitData`

Insert the following three functions immediately before `// ── Data merge (called by dist/data/g1/u1.js at parse time) ──` at line 191:

- [ ] In `src/data/shared_g1.js`, insert this block between `_g1VisToV` (ends ~line 188) and the `// ── Data merge` comment (line 191):

```js
// ── Unit test bank assembly helpers ──────────────────────────────────────────

// Local Fisher-Yates shuffle — self-contained so shared_g1.js has no
// dependency on _shuffle from util.js (which loads after this file in bundle).
function _g1Shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// Returns up to `count` questions sampled from `bank`.
// When `balanced` is true, targets ~25% hard / ~37.5% medium / ~37.5% easy
// (formula: tH = round(count*0.25), tE = round((count-tH)/2), tM = rest).
// If any tier is short, the deficit is filled from remaining questions.
// Never mutates `bank`.
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

// Assembles a unit testBank from lesson qBanks.
// Called when spec.unitTest.sourceRule === 'all_lesson_quizbanks'.
// u.lessons must already be fully merged before this runs.
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
```

### Step 2.2 — Update the unit test bank section of `_mergeG1UnitData`

In `_mergeG1UnitData`, replace the existing comment + conditional at lines 271-274:

```js
  // Unit test bank — pull from spec.unitTest if wired in future
  if(spec.unitTest && Array.isArray(spec.unitTest.bank)){
    u.testBank = spec.unitTest.bank;
  }
```

With:

```js
  // Unit test bank assembly
  if (spec.unitTest) {
    if (spec.unitTest.sourceRule === 'all_lesson_quizbanks') {
      u.testBank = _assembleUnitTestBank(u, spec.unitTest);
    } else if (Array.isArray(spec.unitTest.bank)) {
      u.testBank = spec.unitTest.bank;
    }
  }
```

### Step 2.3 — Run all tests

- [ ] Run:

```
node --test tests/core.test.js tests/g1-unit-quiz.test.js
```

Expected output:
```
# tests N
# pass N
# fail 0
```

All 62 original tests pass. All new tests pass. Zero failures.

### Step 2.4 — Run the build

- [ ] Run from `E:\Cameron Jones\mymathroots-v1.1`:

```
node build.js
```

Expected output ends with:
```
📋 Built:   data/g1/u1.js
📋 Built:   data/g1/u2.js
🚀 Build complete → dist/
```

No errors.

### Step 2.5 — Commit

- [ ] Stage and commit:

```bash
git add src/data/shared_g1.js tests/g1-unit-quiz.test.js
git commit -m "feat(g1): wire unit quiz assembly from lesson quizBanks

_assembleUnitTestBank samples perLessonCount questions per lesson
with balanced difficulty (3E+3M+2H for 8, 2E+2M+1H for 5) when
difficultyMixBalanced is true. Fixes U1 and U2 unit quiz 'No
questions found' — both now get valid testBanks at merge time."
```

---

## Task 3: Browser verification

**Files:**
- Read: `dist/data/g1/u2.js` (verify build output)
- Browser: preview server (already running or `preview_start`)

### Step 3.1 — Verify build output contains testBank assembly call

- [ ] Confirm `dist/data/g1/u2.js` ends with:

```js
_mergeG1UnitData(1, G1_U2_SPEC);
```

And that `src/data/shared_g1.js` contains `_assembleUnitTestBank` (the source that will be included in the main bundle).

### Step 3.2 — Start preview server and navigate to Grade 1 Unit 2

- [ ] Start preview: `preview_start` (if not already running)
- [ ] Take a screenshot of the Grade 1 Unit 2 page
- [ ] Confirm the Unit Quiz button is visible (it becomes active once all lesson quizzes are passed)

### Step 3.3 — Use `preview_eval` to inspect the assembled testBank at runtime

- [ ] In the browser console via `preview_eval`:

```js
// Force-load G1 U2 data and inspect testBank
_loadG1Unit(1).then(function() {
  var u = _UNITS_DATA_G1[1];
  var bank = u.testBank;
  var perLesson = {};
  if (bank) {
    bank.forEach(function(q) {
      // id format: g1-u2-l{n}-q-NNN
      var match = q.id && q.id.match(/g1-u2-(l\d+)/);
      var lid = match ? match[1] : 'unknown';
      perLesson[lid] = (perLesson[lid] || 0) + 1;
    });
  }
  return JSON.stringify({
    hasTestBank: !!bank,
    totalQuestions: bank ? bank.length : 0,
    perLesson: perLesson,
    diffDist: bank ? {
      e: bank.filter(function(q){return q.d==='e';}).length,
      m: bank.filter(function(q){return q.d==='m';}).length,
      h: bank.filter(function(q){return q.d==='h';}).length
    } : null
  });
});
```

Expected result:
```json
{
  "hasTestBank": true,
  "totalQuestions": 32,
  "perLesson": { "l1": 8, "l2": 8, "l3": 8, "l4": 8 },
  "diffDist": { "e": 12, "m": 12, "h": 8 }
}
```

### Step 3.4 — Verify U1 testBank

- [ ] In `preview_eval`:

```js
_loadG1Unit(0).then(function() {
  var u = _UNITS_DATA_G1[0];
  var bank = u.testBank;
  return JSON.stringify({
    hasTestBank: !!bank,
    totalQuestions: bank ? bank.length : 0
  });
});
```

Expected: `{ "hasTestBank": true, "totalQuestions": 40 }`

### Step 3.5 — Verify Unit 1 is unbroken

- [ ] Navigate to Grade 1 Unit 1. Confirm lesson quiz still starts and runs normally (not a unit quiz — lesson quiz).

### Step 3.6 — Screenshot proof

- [ ] Take `preview_screenshot` showing the G1 U2 unit page with the unit quiz in a visible/unlocked state (or show the console eval result confirming the testBank is populated).

---

## Self-Review Checklist

### 1. Spec coverage

| Requirement | Task |
|---|---|
| Find `_mergeG1UnitData` | Task 2 |
| Add `sourceRule === 'all_lesson_quizbanks'` branch | Task 2, Step 2.2 |
| Sample `perLessonCount` per lesson | `_sampleFromBank` in Step 2.1 |
| Total = `totalQuestions` | 4×8=32 (U2), 8×5=40 (U1) — validated in Task 1 |
| Preserve diagnostic metadata (d, sk, i, v, e, etc.) | All fields pass through — validated in Task 1 |
| `difficultyMixBalanced: true` → 3E+3M+2H (n=8), 2E+2M+1H (n=5) | `_sampleFromBank` balanced branch — validated in Task 1 |
| Fallback for short tiers | Spillover logic in `_sampleFromBank` — validated in Task 1 |
| Do not mutate original qBanks | `.slice()` before every shuffle — validated in Task 1 |
| Reusable for future units | `_assembleUnitTestBank` is generic, keyed on `perLessonCount` |
| Don't break Unit 1 | Task 3, Step 3.4 + 3.5 |
| Browser verify 32-question testBank | Task 3, Step 3.3 |

### 2. Placeholder scan

None found. All code blocks contain real, complete implementations.

### 3. Type consistency

- `_g1Shuffle` → called in `_sampleFromBank` ✓
- `_sampleFromBank(bank, count, balanced)` → called in `_assembleUnitTestBank` ✓
- `_assembleUnitTestBank(u, utSpec)` → called in `_mergeG1UnitData` ✓
- `q.d` used as difficulty key in both `_sampleFromBank` and tests ✓
- `lesson.qBank` (legacy field set by `_mergeG1UnitData` loop) used in `_assembleUnitTestBank` ✓
