# Learning Insights Phase 3A — Difficulty Breakdown (Execution Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a parent-facing "Difficulty Breakdown" card to Learning Insights showing easy/medium/hard accuracy and surfacing struggle/foundation/ready states. Light up new data by adding a normalized `difficulty` field to saved answers.

**Architecture:** Dashboard-side aggregators + UI card first (testable in isolation; degrades to "not enough data" while quiz side is still pre-3A). Then quiz/unit-side push-site changes + whitelist patches. Then verification.

**Tech Stack:** Vanilla JS (V1), Jest 29.7.0, mirror lockstep between `src/dashboard.js` and `dashboard/dashboard.js`, tests import from the mirror.

**Companion spec:** `2026-05-19-learning-insights-phase3a.md`

**Pre-flight:** All file paths below are relative to the **repo root** `E:\Cameron Jones\mymathroots-v1.1\`. The worktree at `.claude/worktrees/nostalgic-benz-d2c9f4/` is empty; work happens at repo root.

---

## Task 1: `_normalizeAnswerDifficulty` helper + tests

**Files:**
- Modify: `dashboard/dashboard.js` (mirror — add helper + add to exports block)
- Modify: `src/dashboard.js` (mirror parity)
- Modify: `tests/dashboard.test.js` (add import + new describe block)

- [ ] **Step 1: Add failing test for `_normalizeAnswerDifficulty`**

In `tests/dashboard.test.js`, add to the imports destructure (around line 40-48):

```js
_normalizeAnswerDifficulty,
```

Then add a new describe block at the end of the imports section (after the existing `_normalizeInterventionRow` describe — find it via grep, append after its closing `});`):

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=dashboard
```

Expected: failure with `_normalizeAnswerDifficulty is not a function` or import error.

- [ ] **Step 3: Implement `_normalizeAnswerDifficulty` in `dashboard/dashboard.js`**

Insert immediately above `_aggregateMistakesFromScoreAnswers` at `dashboard/dashboard.js:3442`:

```js
// Normalize a question's difficulty into the canonical long-form value
// used by saved answers and dashboard aggregators. Accepts both short-form
// (`q.d = 'e'|'m'|'h'`) and long-form (`q.difficulty = 'easy'|...`).
// Untagged or unrecognized values resolve to null (NOT 'medium').
function _normalizeAnswerDifficulty(q) {
  var d = (q && (q.difficulty || q.d)) || null;
  if (d === 'easy'   || d === 'e') return 'easy';
  if (d === 'medium' || d === 'm') return 'medium';
  if (d === 'hard'   || d === 'h') return 'hard';
  return null;
}
```

- [ ] **Step 4: Add to exports bridge**

In `dashboard/dashboard.js`, find the `module.exports = {` block (around line 3800). Add `_normalizeAnswerDifficulty,` before the closing `}`:

```js
  _aggregateMistakesFromScoreAnswers,
  _normalizeAnswerDifficulty,
  _lessonDisplayName,
```

- [ ] **Step 5: Mirror to `src/dashboard.js`**

Find `_aggregateMistakesFromScoreAnswers` in `src/dashboard.js:3691`. Insert the same `_normalizeAnswerDifficulty` function immediately above it (identical body).

- [ ] **Step 6: Run tests to verify pass**

```bash
npm test
```

Expected: all 230 tests pass (223 prior + 7 new).

- [ ] **Step 7: Commit**

```bash
git add dashboard/dashboard.js src/dashboard.js tests/dashboard.test.js
git commit -m "feat(dashboard): add _normalizeAnswerDifficulty helper (Phase 3A)"
```

---

## Task 2: `_aggregateDifficultyPerformance` + tests

**Files:**
- Modify: `dashboard/dashboard.js`
- Modify: `src/dashboard.js`
- Modify: `tests/dashboard.test.js`

- [ ] **Step 1: Add failing tests**

Append to `tests/dashboard.test.js` imports:

```js
_aggregateDifficultyPerformance,
```

Then add the describe block (after `_normalizeAnswerDifficulty`):

```js
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
      { ok: true },                              // legacy, no difficulty
      { ok: false, difficulty: null },           // explicit null
      { ok: true,  difficulty: 'easy' },         // counted
    ])]);
    expect(r.easy.total).toBe(1);
    expect(r.medium.total).toBe(0);
    expect(r.hard.total).toBe(0);
  });

  test('ignores answers with unrecognized difficulty value', () => {
    const r = _aggregateDifficultyPerformance([sc([
      { ok: true, difficulty: 'extreme' },
      { ok: true, difficulty: 'e' },             // short-form NOT accepted post-normalize
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
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- --testPathPattern=dashboard
```

Expected: `_aggregateDifficultyPerformance is not a function`.

- [ ] **Step 3: Implement in `dashboard/dashboard.js`**

Insert immediately above `_LI_THRESH` at `dashboard/dashboard.js:3459`:

```js
// Bucket per-answer accuracy by difficulty level. Input is assumed
// already-grade-filtered. Untagged or unrecognized difficulty values are
// skipped (NOT bucketed to medium). Pre-Phase-3A scores have no difficulty
// field and are tolerated as legacy.
function _aggregateDifficultyPerformance(scores) {
  var result = {
    easy:   { correct: 0, total: 0, accuracy: 0 },
    medium: { correct: 0, total: 0, accuracy: 0 },
    hard:   { correct: 0, total: 0, accuracy: 0 }
  };
  if (!Array.isArray(scores)) return result;
  scores.forEach(function(s) {
    if (!s || !Array.isArray(s.answers)) return;
    s.answers.forEach(function(a) {
      if (!a) return;
      var d = a.difficulty;
      if (d !== 'easy' && d !== 'medium' && d !== 'hard') return;
      result[d].total += 1;
      if (a.ok) result[d].correct += 1;
    });
  });
  ['easy', 'medium', 'hard'].forEach(function(k) {
    result[k].accuracy = result[k].total > 0
      ? result[k].correct / result[k].total
      : 0;
  });
  return result;
}
```

- [ ] **Step 4: Add to exports bridge**

```js
  _normalizeAnswerDifficulty,
  _aggregateDifficultyPerformance,
```

- [ ] **Step 5: Mirror to `src/dashboard.js`**

Insert the same function immediately above `_LI_THRESH` in `src/dashboard.js:3706`.

- [ ] **Step 6: Run tests to verify pass**

```bash
npm test
```

Expected: 237 pass (230 + 7 new).

- [ ] **Step 7: Commit**

```bash
git add dashboard/dashboard.js src/dashboard.js tests/dashboard.test.js
git commit -m "feat(dashboard): add _aggregateDifficultyPerformance (Phase 3A)"
```

---

## Task 3: `_aggregateDifficultyByLesson` + tests

**Files:**
- Modify: `dashboard/dashboard.js`
- Modify: `src/dashboard.js`
- Modify: `tests/dashboard.test.js`

- [ ] **Step 1: Add failing tests**

Append to imports:

```js
_aggregateDifficultyByLesson,
```

Add describe block:

```js
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
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- --testPathPattern=dashboard
```

- [ ] **Step 3: Implement in `dashboard/dashboard.js`**

Insert immediately below `_aggregateDifficultyPerformance`:

```js
// Cluster per-answer accuracy by (lessonId, difficulty). lessonId is
// extracted from score.qid via a flexible regex matching k/g1/g2 + uN-lM.
// Scores whose qid doesn't match (Unit Tests, Free Mode, legacy short qids)
// are skipped — the helper returns no entry for them.
function _aggregateDifficultyByLesson(scores) {
  var result = {};
  if (!Array.isArray(scores)) return result;
  var rx = /(k|g1|g2)u\d+-l\d+/i;
  scores.forEach(function(s) {
    if (!s || !s.qid || !Array.isArray(s.answers)) return;
    var m = String(s.qid).match(rx);
    if (!m) return;
    var lessonId = m[0].toLowerCase();
    if (!result[lessonId]) {
      result[lessonId] = {
        easy:   { correct: 0, total: 0, accuracy: 0 },
        medium: { correct: 0, total: 0, accuracy: 0 },
        hard:   { correct: 0, total: 0, accuracy: 0 }
      };
    }
    s.answers.forEach(function(a) {
      if (!a) return;
      var d = a.difficulty;
      if (d !== 'easy' && d !== 'medium' && d !== 'hard') return;
      result[lessonId][d].total += 1;
      if (a.ok) result[lessonId][d].correct += 1;
    });
  });
  Object.keys(result).forEach(function(lid) {
    ['easy', 'medium', 'hard'].forEach(function(k) {
      result[lid][k].accuracy = result[lid][k].total > 0
        ? result[lid][k].correct / result[lid][k].total
        : 0;
    });
  });
  return result;
}
```

- [ ] **Step 4: Add to exports bridge**

```js
  _aggregateDifficultyPerformance,
  _aggregateDifficultyByLesson,
```

- [ ] **Step 5: Mirror to `src/dashboard.js`**

Insert the same function in `src/dashboard.js` immediately below `_aggregateDifficultyPerformance`.

- [ ] **Step 6: Run tests to verify pass**

```bash
npm test
```

Expected: 242 pass.

- [ ] **Step 7: Commit**

```bash
git add dashboard/dashboard.js src/dashboard.js tests/dashboard.test.js
git commit -m "feat(dashboard): add _aggregateDifficultyByLesson (Phase 3A)"
```

---

## Task 4: Extend `_LI_THRESH` + `buildLearningInsights.difficultyBreakdown`

**Files:**
- Modify: `dashboard/dashboard.js`
- Modify: `src/dashboard.js`
- Modify: `tests/dashboard.test.js`

- [ ] **Step 1: Extend `_LI_THRESH` in `dashboard/dashboard.js`**

At `dashboard/dashboard.js:3459-3470`, add new keys before the closing `};`:

```js
var _LI_THRESH = {
  WEAK_MIN_ATTEMPTS:        3,
  WEAK_MAX_ACCURACY:        0.60,
  STRONG_MIN_ATTEMPTS:      5,
  STRONG_MIN_ACCURACY:      0.85,
  MISTAKE_MIN_COUNT:        3,
  TREND_MIN_EVENTS:         6,
  RECOVERY_MIN_TOTAL:       2,
  NEEDS_PRACTICE_LIMIT:     3,
  COMMON_MISTAKES_LIMIT:    3,
  STRENGTHS_LIMIT:          3,
  DIFF_MIN_TOTAL:           6,
  DIFF_MIN_PER_LEVEL:       3,
  DIFF_HARD_STRUGGLE_PCT:   0.60,
  DIFF_FOUNDATION_PCT:      0.70,
  DIFF_READY_PCT:           0.80,
  DIFF_READY_HARD_PCT:      0.70,
  DIFF_LESSON_CLUSTER_MIN:  3,
};
```

- [ ] **Step 2: Mirror in `src/dashboard.js`**

Same change at `src/dashboard.js:3706-3717`.

- [ ] **Step 3: Add failing tests for `buildLearningInsights.difficultyBreakdown`**

Find existing `buildLearningInsights` describe block in `tests/dashboard.test.js` (search for `describe('buildLearningInsights'`). Add a nested describe at the end of it (before the outer block's closing `});`):

```js
describe('difficultyBreakdown', () => {
  function ans(ok, difficulty) { return { ok: ok, difficulty: difficulty }; }
  function scWith(answers, qid) {
    return {
      qid: qid || 'lq_g1u4-l1-x', pct: 80, id: Date.now() + Math.random(),
      type: 'lesson', label: 'Test', date: '2026-05-19',
      score: 0, total: answers.length, unitIdx: 3, answers: answers, grade: 'g1',
    };
  }
  const BASE = {
    viewBand: 'g1', scores: [], activityEvents: [], mastery: {},
    interventionEvents: [], tagLessonIndex: null,
  };

  test('returns not-enough-data when total tagged answers < DIFF_MIN_TOTAL', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(true,  'easy'), ans(true,  'easy'),
        ans(false, 'hard'), ans(false, 'hard'),
        ans(true,  'medium'),
      ])],
    }));
    expect(r.difficultyBreakdown.state).toBe('not-enough-data');
  });

  test('returns hard-struggle when hard accuracy < 60% and hard total >= 3', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
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
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(false, 'easy'), ans(false, 'easy'), ans(true, 'easy'),
        ans(true,  'medium'), ans(true,  'medium'), ans(true, 'medium'),
        ans(true,  'hard'),   ans(true,  'hard'),   ans(true, 'hard'),
      ])],
    }));
    expect(r.difficultyBreakdown.state).toBe('foundation-review');
  });

  test('returns ready-for-challenge when easy + medium >= 80% and hard >= 70% or missing', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(true, 'easy'),   ans(true, 'easy'),   ans(true, 'easy'),
        ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'),
        ans(true, 'hard'),   ans(true, 'hard'),   ans(true, 'hard'),
      ])],
    }));
    expect(r.difficultyBreakdown.state).toBe('ready-for-challenge');
  });

  test('returns balanced-progress when neither struggle nor ready triggers', () => {
    // easy 75% (just below ready), medium 75%, hard 75%
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(true, 'easy'),   ans(true, 'easy'),   ans(true, 'easy'),   ans(false, 'easy'),
        ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'), ans(false, 'medium'),
        ans(true, 'hard'),   ans(true, 'hard'),   ans(true, 'hard'),   ans(false, 'hard'),
      ])],
    }));
    expect(r.difficultyBreakdown.state).toBe('balanced-progress');
  });

  test('hard-struggle takes precedence over foundation-review when both trigger', () => {
    // easy 50% AND hard 25% — hard-struggle wins
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(false, 'easy'), ans(false, 'easy'), ans(true, 'easy'),
        ans(true,  'medium'), ans(true,  'medium'), ans(true, 'medium'),
        ans(false, 'hard'), ans(false, 'hard'), ans(false, 'hard'), ans(true, 'hard'),
      ])],
    }));
    expect(r.difficultyBreakdown.state).toBe('hard-struggle');
  });

  test('does not make a claim about a level with < DIFF_MIN_PER_LEVEL answers', () => {
    // hard has only 2 answers, both wrong — should NOT trigger hard-struggle
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(true, 'easy'), ans(true, 'easy'), ans(true, 'easy'), ans(true, 'easy'),
        ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'),
        ans(false, 'hard'), ans(false, 'hard'),  // only 2 hard, both wrong
      ])],
    }));
    expect(r.difficultyBreakdown.state).not.toBe('hard-struggle');
  });

  test('topCluster identifies the lesson with the most hard misses', () => {
    const r = buildLearningInsights(Object.assign({}, BASE, {
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
    const r = buildLearningInsights(Object.assign({}, BASE, {
      scores: [scWith([
        ans(true, 'easy'), ans(true, 'easy'), ans(true, 'easy'),
        ans(false, 'hard'), ans(false, 'hard'),  // only 2 hard wrong
        ans(true, 'medium'), ans(true, 'medium'), ans(true, 'medium'),
      ])],
    }));
    expect(r.difficultyBreakdown.topCluster).toBe(null);
  });
});
```

- [ ] **Step 4: Run to verify fail**

```bash
npm test -- --testPathPattern=dashboard
```

Expected: failures — `difficultyBreakdown` is undefined on the result.

- [ ] **Step 5: Extend `buildLearningInsights` in `dashboard/dashboard.js`**

Locate `buildLearningInsights` (search for `function buildLearningInsights(`). Just before the function's `return {` block, add the difficulty computation:

```js
  // Phase 3A: Difficulty Breakdown
  var diffPerf = _aggregateDifficultyPerformance(scores);
  var diffByLesson = _aggregateDifficultyByLesson(scores);
  var diffTotal = diffPerf.easy.total + diffPerf.medium.total + diffPerf.hard.total;
  var diffState;
  if (diffTotal < _LI_THRESH.DIFF_MIN_TOTAL) {
    diffState = 'not-enough-data';
  } else {
    var hasEasy   = diffPerf.easy.total   >= _LI_THRESH.DIFF_MIN_PER_LEVEL;
    var hasMedium = diffPerf.medium.total >= _LI_THRESH.DIFF_MIN_PER_LEVEL;
    var hasHard   = diffPerf.hard.total   >= _LI_THRESH.DIFF_MIN_PER_LEVEL;
    if (!hasEasy && !hasMedium && !hasHard) {
      diffState = 'not-enough-data';
    } else if (hasHard && diffPerf.hard.accuracy < _LI_THRESH.DIFF_HARD_STRUGGLE_PCT) {
      diffState = 'hard-struggle';
    } else if (hasEasy && diffPerf.easy.accuracy < _LI_THRESH.DIFF_FOUNDATION_PCT) {
      diffState = 'foundation-review';
    } else if (hasEasy && hasMedium
               && diffPerf.easy.accuracy   >= _LI_THRESH.DIFF_READY_PCT
               && diffPerf.medium.accuracy >= _LI_THRESH.DIFF_READY_PCT
               && (!hasHard || diffPerf.hard.accuracy >= _LI_THRESH.DIFF_READY_HARD_PCT)) {
      diffState = 'ready-for-challenge';
    } else {
      diffState = 'balanced-progress';
    }
  }
  var topCluster = null;
  var bestHardWrong = 0;
  Object.keys(diffByLesson).forEach(function(lid) {
    var hw = diffByLesson[lid].hard.total - diffByLesson[lid].hard.correct;
    if (hw >= _LI_THRESH.DIFF_LESSON_CLUSTER_MIN && hw > bestHardWrong) {
      bestHardWrong = hw;
      topCluster = { lessonId: lid, hardWrong: hw };
    }
  });
  var difficultyBreakdown = {
    state: diffState,
    perf: diffPerf,
    byLesson: diffByLesson,
    topCluster: topCluster,
  };
```

Then add `difficultyBreakdown: difficultyBreakdown,` to the `return { ... };` object literal (one new field on the bundle).

- [ ] **Step 6: Mirror in `src/dashboard.js`**

Same change in `src/dashboard.js` — search for `function buildLearningInsights(` and apply identical edits.

- [ ] **Step 7: Run tests to verify pass**

```bash
npm test
```

Expected: 251 pass (242 + 9 new). All prior tests still green.

- [ ] **Step 8: Commit**

```bash
git add dashboard/dashboard.js src/dashboard.js tests/dashboard.test.js
git commit -m "feat(dashboard): difficultyBreakdown state machine on buildLearningInsights (Phase 3A)"
```

---

## Task 5: Add "Difficulty Breakdown" card to `_renderLearningInsightsV2`

**Files:**
- Modify: `src/dashboard.js` (renderer — no mirror needed; `dashboard/dashboard.js` has no renderer)

Renderer is not under test (the mirror file omits the renderer). Verification happens via browser preview in Task 8.

- [ ] **Step 1: Locate Trend card render block**

In `src/dashboard.js`, find the Trend card push (search for `sections.push(card('li-trend'`). Currently around line 4085-4087. The block ends with the closing `));`.

- [ ] **Step 2: Insert Difficulty Breakdown card immediately after Trend**

After Trend's `sections.push(...)` ends, before the `// E. Recommended Next Step` comment, insert:

```js
  // D2. Difficulty Breakdown (Phase 3A)
  var diff = insights.difficultyBreakdown;
  if (diff && diff.state !== 'not-enough-data') {
    var diffCopyMap = {
      'hard-struggle':       'Strong foundation; hard questions need practice.',
      'foundation-review':   'Easier review first will help build confidence.',
      'ready-for-challenge': 'Ready for more challenge: easy and medium are strong.',
      'balanced-progress':   'Balanced progress across difficulty levels.'
    };
    function diffRow(label, bucket, color) {
      var pct = bucket.total > 0 ? Math.round(bucket.accuracy * 100) : null;
      var barW = pct == null ? 0 : pct;
      var rightLabel = bucket.total > 0
        ? (pct + '% (' + bucket.correct + '/' + bucket.total + ')')
        : '—';
      return '<div style="display:grid;grid-template-columns:60px 1fr 90px;gap:8px;align-items:center;margin:4px 0">'
        + '<div style="font-size:.82rem;color:#546e7a">' + label + '</div>'
        + '<div style="height:8px;border-radius:999px;background:#eceff1;overflow:hidden">'
        +   '<div style="height:100%;width:' + barW + '%;background:' + color + '"></div>'
        + '</div>'
        + '<div style="font-size:.78rem;color:#546e7a;text-align:right">' + rightLabel + '</div>'
        + '</div>';
    }
    var bars = diffRow('Easy',   diff.perf.easy,   '#2e7d32')
             + diffRow('Medium', diff.perf.medium, '#f9a825')
             + diffRow('Hard',   diff.perf.hard,   '#c62828');
    var copy = diffCopyMap[diff.state] || '';
    var clusterLine = '';
    if (diff.topCluster && diff.topCluster.lessonId) {
      var lessonName = (typeof _lessonDisplayName === 'function')
        ? _lessonDisplayName(diff.topCluster.lessonId)
        : diff.topCluster.lessonId;
      clusterLine = subLine('&#x1F4CD; Most common in ' + _esc(lessonName));
    }
    sections.push(card('li-difficulty', '&#x1F3AF; Difficulty Breakdown',
      bars
      + '<div style="margin-top:8px;color:#263238;font-size:.88rem">' + _esc(copy) + '</div>'
      + clusterLine));
  }
```

- [ ] **Step 3: Run full test suite to confirm no regressions**

```bash
npm test
```

Expected: 251 still pass (no new tests; renderer not under test).

- [ ] **Step 4: Commit**

```bash
git add src/dashboard.js
git commit -m "feat(dashboard): render Difficulty Breakdown card in Learning Insights V2 (Phase 3A)"
```

---

## Task 6: Patch quiz.js whitelist sites

**Files:**
- Modify: `src/quiz.js` (3 whitelist sites)

These patches must land BEFORE Task 7's push-site changes, otherwise any new `difficulty` field will be stripped on auto-finish / quit / abandoned paths.

- [ ] **Step 1: Patch auto-finish whitelist at `src/quiz.js:2231`**

Find the line (current state):

```js
    answers: qz.answers ? qz.answers.map(a=>({t:a.t,chosen:a.chosen,correct:a.correct,ok:a.ok,exp:a.exp,opts:a.opts,timeSecs:a.timeSecs,hintUsed:a.hintUsed||false})) : [],
```

Change to:

```js
    answers: qz.answers ? qz.answers.map(a=>({t:a.t,chosen:a.chosen,correct:a.correct,ok:a.ok,exp:a.exp,opts:a.opts,timeSecs:a.timeSecs,hintUsed:a.hintUsed||false,errTag:a.errTag||null,difficulty:a.difficulty||null})) : [],
```

(adds `errTag` to fix Phase 2A regression + `difficulty` for Phase 3A)

- [ ] **Step 2: Patch quit-confirm whitelist at `src/quiz.js:2579`**

Find:

```js
    answers: qz.answers ? qz.answers.map(a=>({t:a.t, chosen:a.chosen, correct:a.correct, ok:a.ok})) : [],
```

Change to:

```js
    answers: qz.answers ? qz.answers.map(a=>({t:a.t, chosen:a.chosen, correct:a.correct, ok:a.ok, errTag:a.errTag||null, difficulty:a.difficulty||null})) : [],
```

- [ ] **Step 3: Patch restart/abandoned whitelist at `src/quiz.js:2614`**

Find:

```js
      answers: qz.answers.map(a=>({t:a.t, chosen:a.chosen, correct:a.correct, ok:a.ok})),
```

Change to:

```js
      answers: qz.answers.map(a=>({t:a.t, chosen:a.chosen, correct:a.correct, ok:a.ok, errTag:a.errTag||null, difficulty:a.difficulty||null})),
```

- [ ] **Step 4: Run test suite to confirm no regression**

```bash
npm test
```

Expected: 251 still pass (no new tests; these patches affect only field-preservation).

- [ ] **Step 5: Commit**

```bash
git add src/quiz.js
git commit -m "fix(quiz): preserve errTag (Phase 2A regression) + difficulty in answer whitelists (Phase 3A)"
```

---

## Task 7: Add normalizer to quiz.js + modify push sites

**Files:**
- Modify: `src/quiz.js` (3 push sites + new helper)
- Modify: `src/unit.js` (1 push site)

- [ ] **Step 1: Add `_normalizeAnswerDifficulty` helper to `src/quiz.js`**

Find a stable location near the top of the file's module scope. A reasonable anchor: just above the first `function _` definition (search for `function _handleAnswer` or similar early helper). Insert:

```js
// Phase 3A: Normalize a question's difficulty for saved-answer records.
// Mirrors the helper in dashboard/dashboard.js. Accepts both short-form
// (q.d = 'e'|'m'|'h') and long-form (q.difficulty = 'easy'|...).
// Untagged or unrecognized values resolve to null.
function _normalizeAnswerDifficulty(q) {
  var d = (q && (q.difficulty || q.d)) || null;
  if (d === 'easy'   || d === 'e') return 'easy';
  if (d === 'medium' || d === 'm') return 'medium';
  if (d === 'hard'   || d === 'h') return 'hard';
  return null;
}
```

- [ ] **Step 2: Modify push site A at `src/quiz.js:940`**

Find:

```js
    qz.answers.push({t:q.t, chosen, correct, ok:isOk, exp:q.e, opts:qz._opts.map(o=>o.text), timeSecs:qTimeSecs, hintUsed:qz._hintRevealed||false, errTag:_ansErrTag});
```

Change to:

```js
    qz.answers.push({t:q.t, chosen, correct, ok:isOk, exp:q.e, opts:qz._opts.map(o=>o.text), timeSecs:qTimeSecs, hintUsed:qz._hintRevealed||false, errTag:_ansErrTag, difficulty:_normalizeAnswerDifficulty(q)});
```

- [ ] **Step 3: Modify push site B at `src/quiz.js:1266-1273`**

Find:

```js
    qz.answers.push({
      t: q.t || q.prompt, ok: isOk, exp: exp,
      selectedIds: selectedIds, timeSecs: qTimeSecs,
      hintUsed: qz._hintRevealed || false,
      // Phase 2A: tapGroup's grading function already computes errorType.
      // Correct answers resolve to null per convention.
      errTag: !isOk ? (gradeResult.errorType || null) : null
    });
```

Change to:

```js
    qz.answers.push({
      t: q.t || q.prompt, ok: isOk, exp: exp,
      selectedIds: selectedIds, timeSecs: qTimeSecs,
      hintUsed: qz._hintRevealed || false,
      // Phase 2A: tapGroup's grading function already computes errorType.
      // Correct answers resolve to null per convention.
      errTag: !isOk ? (gradeResult.errorType || null) : null,
      // Phase 3A: normalized difficulty for parent dashboard insights.
      difficulty: _normalizeAnswerDifficulty(q)
    });
```

- [ ] **Step 4: Modify push site C at `src/unit.js:2166`**

Find:

```js
    qz.answers.push({t:q.t, chosen:'(Time ran out)', correct:q.o[q.a], ok:false, exp:q.e});
```

Change to:

```js
    qz.answers.push({t:q.t, chosen:'(Time ran out)', correct:q.o[q.a], ok:false, exp:q.e, difficulty:(typeof _normalizeAnswerDifficulty==='function'?_normalizeAnswerDifficulty(q):null)});
```

(The `typeof` guard handles the case where `unit.js` loads before `quiz.js`'s helper is defined — defensive in vanilla-JS load order.)

- [ ] **Step 5: Build + run tests to confirm no regression**

```bash
node build.js
npm test
```

Expected: build clean, 251 tests pass. New `difficulty` field doesn't affect existing tests (they don't read it).

- [ ] **Step 6: Commit**

```bash
git add src/quiz.js src/unit.js
git commit -m "feat(quiz): tag saved answers with normalized difficulty (Phase 3A)"
```

---

## Task 8: Browser verification

**Files:** None — verification only.

- [ ] **Step 1: Start preview**

Use `preview_start` to launch the local dev server (or `node build.js && open dist/index.html` if there's no preview MCP).

- [ ] **Step 2: Seed a G1 profile with mixed-difficulty answers**

In the preview, create or sign into a G1 profile. Manually run several G1 lessons producing approximately:
- Easy: 18/20 correct (~90%)
- Medium: 13/18 correct (~72%)
- Hard: 5/14 correct (~36%)

(Use the existing diagnostic / lesson questions; do not modify question data.)

- [ ] **Step 3: Verify card appears in G1 view with hard-struggle state**

- Open Parent Dashboard.
- Confirm grade dropdown is set to G1.
- Scroll to Learning Insights.
- Confirm "Difficulty Breakdown" card appears between Trend and Recommended Next Step.
- Confirm three bars (Easy / Medium / Hard) with correct percentages.
- Confirm copy reads "Strong foundation; hard questions need practice."
- If a single lesson has ≥3 hard misses, confirm the lesson-cluster subline shows.

Use `preview_screenshot` for proof.

- [ ] **Step 4: Switch grade dropdown to G2**

- Confirm card switches to "not enough data" or doesn't appear (no G2 questions ship).
- No G1 data should leak into the G2 view.

- [ ] **Step 5: Switch back to G1**

- Confirm hard-struggle card returns.

- [ ] **Step 6: Open a quiz review modal**

- Click any score row → review modal opens.
- Close modal → card still intact.
- Run `preview_console_logs` → no new errors.

- [ ] **Step 7: Test legacy-only profile**

- Switch to a different profile whose scores are all pre-Phase-3A (no `difficulty` on answers).
- Confirm card shows "not enough data" gracefully — no crashes.

- [ ] **Step 8: End-to-end fresh-quiz test**

- From G1 profile, run a single fresh lesson quiz to completion.
- Return to dashboard.
- Confirm new answers appear in the breakdown (totals tick up by the question count).

- [ ] **Step 9: Document outcomes**

Report each step's result in the conversation. If anything fails, return to the relevant task before continuing.

---

## Task 9: Final test sweep + sign-off

- [ ] **Step 1: Full test run**

```bash
npm test
```

Expected: 251 / 251 green (or similar +20 from prior 223).

- [ ] **Step 2: Build clean**

```bash
node build.js
```

Expected: no errors.

- [ ] **Step 3: Manual smoke**

Skim `dist/` to confirm bundle includes the new dashboard helpers and renderer block. Quick `grep` for `Difficulty Breakdown` in `dist/app.js` should hit.

- [ ] **Step 4: Update memory + announce completion**

The implementer should save a `project_learning_insights_phase3a_lock.md` memory file documenting the lock state, mirroring the Phase 2A/2C patterns.

- [ ] **Step 5: NO commit needed for sign-off**

(Sign-off is the implementer announcing completion in chat. Production deploy is a separate user-triggered step.)

---

## Summary

| Task | Touched | Tests | Commit |
|---|---|---|---|
| 1 | `_normalizeAnswerDifficulty` | +7 | `feat(dashboard): add _normalizeAnswerDifficulty helper (Phase 3A)` |
| 2 | `_aggregateDifficultyPerformance` | +7 | `feat(dashboard): add _aggregateDifficultyPerformance (Phase 3A)` |
| 3 | `_aggregateDifficultyByLesson` | +5 | `feat(dashboard): add _aggregateDifficultyByLesson (Phase 3A)` |
| 4 | `_LI_THRESH` + `buildLearningInsights.difficultyBreakdown` | +9 | `feat(dashboard): difficultyBreakdown state machine on buildLearningInsights (Phase 3A)` |
| 5 | Renderer card | 0 | `feat(dashboard): render Difficulty Breakdown card in Learning Insights V2 (Phase 3A)` |
| 6 | Quiz whitelist patches | 0 | `fix(quiz): preserve errTag (Phase 2A regression) + difficulty in answer whitelists (Phase 3A)` |
| 7 | Quiz push sites | 0 | `feat(quiz): tag saved answers with normalized difficulty (Phase 3A)` |
| 8 | Browser verification | — | — |
| 9 | Final sweep | — | — |

**Total: 7 commits, +28 tests (223 → 251), 4 files touched (`src/quiz.js`, `src/unit.js`, `src/dashboard.js`, `dashboard/dashboard.js`, plus `tests/dashboard.test.js`).**

**Production deploy is NOT part of this plan.** After all tasks complete and pass, the implementer reports state; user decides whether to `netlify deploy --prod`.
