// =============================================================================
//  My Math Roots — Lesson Status Test Suite
//  Run: node --test tests/lesson-status.test.js
//
//  Covers the simplified-product lesson status model that replaces hard
//  progression locks: Recommended / Ready / Review / Done.
//
//  The functions below are faithful mirrors of src/nav.js (lessonStatus and
//  _recommendedLessonTarget) in their locks-off form. The 'locked' branch of
//  lessonStatus (hard locks ON) is exercised by the unlock tests in
//  tests/core.test.js. Keep these in sync with src/nav.js.
// =============================================================================

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// -- Mirror of src/nav.js -----------------------------------------------------

function _recommendedLessonTarget(units, scores) {
  for (let u = 0; u < units.length; u++) {
    const lessons = (units[u] && Array.isArray(units[u].lessons)) ? units[u].lessons : [];
    for (let l = 0; l < lessons.length; l++) {
      if (!scores.some(s => s.qid === 'lq_' + lessons[l].id)) return { unitIdx: u, lessonIdx: l };
    }
  }
  return null;
}

function lessonStatus(unitIdx, lessonIdx, units, scores) {
  const lesson = units[unitIdx] && units[unitIdx].lessons && units[unitIdx].lessons[lessonIdx];
  if (!lesson) return 'ready';
  const history = scores.filter(s => s.qid === 'lq_' + lesson.id);
  if (history.length) {
    const best = history.reduce((m, s) => Math.max(m, s.pct), 0);
    return best >= 80 ? 'done' : 'review';
  }
  const rec = _recommendedLessonTarget(units, scores);
  if (rec && rec.unitIdx === unitIdx && rec.lessonIdx === lessonIdx) return 'recommended';
  return 'ready';
}

// -- Fixtures -----------------------------------------------------------------

const UNITS = [
  { id: 'u1', lessons: [{ id: 'u1l1' }, { id: 'u1l2' }, { id: 'u1l3' }, { id: 'u1l4' }, { id: 'u1l5' }] },
  { id: 'u2', lessons: [{ id: 'u2l1' }, { id: 'u2l2' }] },
];

// =============================================================================
//  TESTS
// =============================================================================

describe('lessonStatus — the preview scenario', () => {
  // L1 passed, L2 attempted-but-low, L3+ untouched.
  const scores = [
    { qid: 'lq_u1l1', pct: 92 },
    { qid: 'lq_u1l2', pct: 65 },
  ];

  it('a passed lesson is Done', () => {
    assert.strictEqual(lessonStatus(0, 0, UNITS, scores), 'done');
  });
  it('an attempted-but-low lesson is Review', () => {
    assert.strictEqual(lessonStatus(0, 1, UNITS, scores), 'review');
  });
  it('the first never-attempted lesson is Recommended', () => {
    assert.strictEqual(lessonStatus(0, 2, UNITS, scores), 'recommended');
  });
  it('later never-attempted lessons are Ready', () => {
    assert.strictEqual(lessonStatus(0, 3, UNITS, scores), 'ready');
    assert.strictEqual(lessonStatus(0, 4, UNITS, scores), 'ready');
  });
  it('only one lesson is Recommended', () => {
    let count = 0;
    UNITS.forEach((u, ui) => u.lessons.forEach((l, li) => {
      if (lessonStatus(ui, li, UNITS, scores) === 'recommended') count++;
    }));
    assert.strictEqual(count, 1);
  });
});

describe('lessonStatus — boundaries and edges', () => {
  it('exactly 80% is Done', () => {
    assert.strictEqual(lessonStatus(0, 0, UNITS, [{ qid: 'lq_u1l1', pct: 80 }]), 'done');
  });
  it('79% is Review', () => {
    assert.strictEqual(lessonStatus(0, 0, UNITS, [{ qid: 'lq_u1l1', pct: 79 }]), 'review');
  });
  it('Done reflects the BEST attempt, not the latest', () => {
    const scores = [{ qid: 'lq_u1l1', pct: 55 }, { qid: 'lq_u1l1', pct: 88 }];
    assert.strictEqual(lessonStatus(0, 0, UNITS, scores), 'done');
  });
  it('a low first attempt is Review even with a later low retry', () => {
    const scores = [{ qid: 'lq_u1l1', pct: 40 }, { qid: 'lq_u1l1', pct: 70 }];
    assert.strictEqual(lessonStatus(0, 0, UNITS, scores), 'review');
  });
  it('Recommended crosses the unit boundary when unit 1 is fully attempted', () => {
    // Every u1 lesson attempted; u2l1 is the first untouched → recommended.
    const scores = UNITS[0].lessons.map(l => ({ qid: 'lq_' + l.id, pct: 90 }));
    assert.strictEqual(lessonStatus(1, 0, UNITS, scores), 'recommended');
    assert.strictEqual(lessonStatus(1, 1, UNITS, scores), 'ready');
  });
  it('no lesson is Recommended once every lesson has an attempt', () => {
    const scores = [];
    UNITS.forEach(u => u.lessons.forEach(l => scores.push({ qid: 'lq_' + l.id, pct: 90 })));
    assert.strictEqual(_recommendedLessonTarget(UNITS, scores), null);
    UNITS.forEach((u, ui) => u.lessons.forEach((l, li) => {
      assert.notStrictEqual(lessonStatus(ui, li, UNITS, scores), 'recommended');
    }));
  });
  it('with an empty slate, the very first lesson is Recommended', () => {
    assert.strictEqual(lessonStatus(0, 0, UNITS, []), 'recommended');
    assert.strictEqual(lessonStatus(0, 1, UNITS, []), 'ready');
  });
});
