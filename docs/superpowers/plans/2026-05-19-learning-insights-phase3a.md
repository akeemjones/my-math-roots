# Learning Insights Phase 3A — Difficulty Breakdown (Audit + Spec)

> **Status:** Planning complete. Awaiting approval before implementation.
> **Date:** 2026-05-19
> **Goal:** Add a parent-facing "Difficulty Breakdown" card to Learning Insights showing per-difficulty accuracy (easy / medium / hard), surfacing patterns like "strong foundation but struggling on hard."
> **Companion doc:** `2026-05-19-learning-insights-phase3a-execution.md` (TDD task-by-task)

---

## Constraints honoured

- No curriculum changes
- No question-bank changes (`src/data/` untouched)
- No quiz-scoring changes
- No Unit Test sampling changes
- No Free Mode changes
- No Supabase schema changes (`quiz_scores.answers` is already a JSON column)
- No unrelated dashboard work

---

## 0. Worktree note

The worktree at `.claude/worktrees/nostalgic-benz-d2c9f4/` is empty (screenshots only). All real source lives at the repo root. File paths below are relative to the repo root.

---

## 1. Where difficulty exists today

### Storage formats found

| Grade | Source format | Sample | Coverage |
|---|---|---|---|
| K (most) | short-form `d:'e'\|'m'\|'h'` | `src/data/k/u1.js:62` | ~1966 hits, ~100% |
| K (tapGroup older) | long-form `difficulty:'easy'\|...` | `src/data/k/u6.js:240` | ~10 hits |
| G1 U1–U5 | long-form `difficulty:` | `src/data/g1/u1.js:541` | ~2184 hits |
| G1 U5–U8 | short-form `d: diff` (factory param) | `src/data/g1/u6.js:356` | factory-propagated |
| G2 (`src/data/u*.js`) | none — only unit/lesson shells | — | 0 questions |

### Two normalization chokepoints

- `src/question-engine.js:12-28` — `QE.normalize` maps `q.d → q.difficulty` (`{e:'easy', m:'medium', h:'hard'}`) at render time
- `src/data/shared_g1.js:521` — G1 unit merge collapses long-form → `d:` at unit-load time

**Runtime guarantee:** every K/G1 question has `q.d` populated; after `QE.normalize`, also has `q.difficulty`. G2 has nothing by design (no G2 questions ship yet).

**Confidence: HIGH for K + G1. N/A for G2.**

`src/quiz.js:466-573` already uses `q.d` to select difficulty pools, with `!q.d → 'medium'` fallback at line 473. **Phase 3A's aggregator must NOT inherit this fallback** — untagged answers should bucket to `null`/ignored, not silently inflate medium.

---

## 2. Where answers are saved today

### Three `qz.answers.push` sites

| Site | File:line | Trigger | Current fields |
|---|---|---|---|
| A | `src/quiz.js:940` | multipleChoice / tapSingle / imgChoice | `t, chosen, correct, ok, exp, opts, timeSecs, hintUsed, errTag` |
| B | `src/quiz.js:1266-1273` | tapGroup | `t, ok, exp, selectedIds, timeSecs, hintUsed, errTag` |
| C | `src/unit.js:2166` | Unit-test timeout fallback | `t, chosen, correct, ok, exp` |

### Persistence lifecycle

`qz.answers[]` → `SCORES` array → `localStorage.wb_sc5` → Supabase `quiz_scores.answers` (JSON column). Hydration on cloud → local passes through unchanged.

### ⚠️ Pre-existing whitelist gap

Three field-stripping sites today:

| Line | Context | Current whitelist |
|---|---|---|
| `src/quiz.js:2231` | `_finishQuiz` autoEntry | `{t, chosen, correct, ok, exp, opts, timeSecs, hintUsed}` |
| `src/quiz.js:2579` | quit-confirm | `{t, chosen, correct, ok}` |
| `src/quiz.js:2614` | restart/abandoned | `{t, chosen, correct, ok}` |

**`errTag` is dropped by all three today (Phase 2A regression).** `difficulty` would be dropped too unless we patch these.

**Phase 3A must patch these whitelists or the new field will not survive.**

### Dashboard reader to extend

`_aggregateMistakesFromScoreAnswers` at:
- `src/dashboard.js:3691-3704`
- `dashboard/dashboard.js:3442-3455` (mirror — tests import from here via `tests/dashboard.test.js:48`)

Tolerant to missing fields. Will need a sibling `_aggregateDifficultyPerformance`.

---

## 3. Proposed normalized field

**Decision:** write `difficulty: 'easy' | 'medium' | 'hard' | null` on every answer record.

Helper (added once, used at all push sites):

```js
function _normalizeAnswerDifficulty(q) {
  var d = (q && (q.difficulty || q.d)) || null;
  if (d === 'easy'   || d === 'e') return 'easy';
  if (d === 'medium' || d === 'm') return 'medium';
  if (d === 'hard'   || d === 'h') return 'hard';
  return null;
}
```

**Untagged → `null`, NOT `'medium'`.** The aggregator ignores nulls. Storage cost ~10–15 bytes per answer. Negligible.

---

## 4. Where to save it

| Site | Action |
|---|---|
| `src/quiz.js:940` | Add `difficulty: _normalizeAnswerDifficulty(q)` |
| `src/quiz.js:1266-1273` | Same |
| `src/unit.js:2166` | Same |
| `src/quiz.js:2231` (auto-finish whitelist) | Add `errTag, difficulty` |
| `src/quiz.js:2579` (quit-confirm) | Add `difficulty` |
| `src/quiz.js:2614` (restart/abandoned) | Add `difficulty` |

No field removals. No renames. No reorders. All existing fields preserved.

---

## 5. Dashboard aggregation plan

New helpers in **both** `src/dashboard.js` and `dashboard/dashboard.js` (mirror lockstep + export bridge update at `dashboard/dashboard.js:3800-3831`):

```js
function _aggregateDifficultyPerformance(scores) {
  // Input: already-grade-filtered scores
  // Output: { easy: {correct, total, accuracy}, medium: {...}, hard: {...} }
  // - Skips answers with difficulty: null or unrecognized value
  // - Tolerates legacy scores missing the field
  // - Tolerates empty / non-array answers
}

function _aggregateDifficultyByLesson(scores) {
  // Output: { [lessonId]: { easy: {...}, medium: {...}, hard: {...} } }
  // Derives lessonId from score.qid via regex (e.g. "lq_g1u8-l3-x" → "g1u8-l3")
  // Falls back gracefully when qid doesn't match (Unit Tests, Free Mode)
}
```

`buildLearningInsights` (mirror at `dashboard/dashboard.js`) calls both, attaches result as `difficultyBreakdown` on the returned bundle.

---

## 6. Learning Insights UI card

### Placement

**After Trend, before Recommended Next Step** — between `src/dashboard.js:4087` and `src/dashboard.js:4089`.

Rationale: Trend is meta/aggregate ("how is it going?"), Difficulty Breakdown is also meta/aggregate ("where is it going wrong?"). Actionable cards (Recommended Next Step, Parent Action) stay at the end.

### Card states

| State | Trigger | Parent copy |
|---|---|---|
| `not-enough-data` | total < 6 OR no bucket has ≥3 | "Not enough data yet to spot a difficulty pattern." |
| `ready-for-challenge` | easy + medium ≥ 80%, hard either missing or ≥ 70% | "Ready for more challenge: easy and medium are strong." |
| `hard-struggle` | hard total ≥ 3, hard accuracy < 60% | "Strong foundation; hard questions need practice." |
| `foundation-review` | easy total ≥ 3, easy accuracy < 70% | "Easier review first will help build confidence." |
| `balanced-progress` | none of above, ≥ 6 total | "Balanced progress across difficulty levels." |

State precedence (when multiple match): `hard-struggle` > `foundation-review` > `ready-for-challenge` > `balanced-progress`. This ensures the most actionable signal wins.

Lesson-context subline (when `_aggregateDifficultyByLesson` finds a cluster of ≥3 hard misses in a single lesson):

> 📍 Most hard-question misses are in **Unit 8 Lesson 3: Spending and Saving**.

### Layout

```
┌─────────────────────────────────────┐
│ Difficulty Breakdown                │
├─────────────────────────────────────┤
│ Easy    ████████████  90%  (18/20)  │
│ Medium  ████████░░░░  72%  (13/18)  │
│ Hard    ████░░░░░░░░  35%  (5/14)   │
│                                     │
│ Strong foundation; hard questions   │
│ need practice.                      │
│ 📍 Most common in Unit 8 Lesson 3   │
└─────────────────────────────────────┘
```

Inline-style row with three bars matching the existing card patterns. Uses `card(cssClass, headerHtml, bodyHtml)` helper at `src/dashboard.js:3996`. New CSS class: `li-difficulty`. **No CSS file change required** — all Learning Insights cards style inline today.

---

## 7. Threshold rules

Extend `_LI_THRESH` at `src/dashboard.js:3706` and `dashboard/dashboard.js:3459`:

```js
DIFF_MIN_TOTAL:          6,    // need 6+ tagged answers total
DIFF_MIN_PER_LEVEL:      3,    // need 3+ in a level to make a claim
DIFF_HARD_STRUGGLE_PCT:  0.60, // hard accuracy below this → "needs practice"
DIFF_FOUNDATION_PCT:     0.70, // easy below this → "foundation review"
DIFF_READY_PCT:          0.80, // easy AND medium above this → "ready"
DIFF_READY_HARD_PCT:     0.70, // hard above this (or missing) → still ready
DIFF_LESSON_CLUSTER_MIN: 3,    // need 3+ hard misses in one lesson to show subline
```

Tests will hardcode these per Phase 2A/2B/2C convention (`_LI_THRESH` is not exported).

---

## 8. Legacy handling

- **Old scores** (pre-3A): no `difficulty` on any answer → aggregator skips. Card shows "not enough data" until new scores accumulate.
- **Mixed scores**: tagged counted, untagged ignored. No bucket inflation.
- **Empty/malformed `answers`**: tolerated (returns zeros for all buckets).
- **G2 scores**: aggregator runs, returns zeros, card shows "not enough data" — correct behaviour until G2 ships questions.

**No backfill. No migration. No Supabase change.**

---

## 9. Test plan

Test file: `tests/dashboard.test.js` (Jest 29.7.0, `npm test`). Tests import from `dashboard/dashboard.js`. Follow existing conventions: local `sc()` factory per describe block, lowercase BDD sentences (no "should"), hardcoded thresholds, stateless.

**Estimated +20 tests, taking 223 → 243.**

| Describe | Test |
|---|---|
| `_normalizeAnswerDifficulty` | maps `'e'` → `'easy'` |
| | maps `'m'` → `'medium'` |
| | maps `'h'` → `'hard'` |
| | preserves long-form `'easy'/'medium'/'hard'` |
| | reads `q.d` when only short-form exists |
| | reads `q.difficulty` when only long-form exists |
| | returns null for missing / unknown |
| `_aggregateDifficultyPerformance` | buckets answers into easy/medium/hard |
| | computes accuracy correctly |
| | ignores answers without difficulty (legacy tolerance) |
| | returns zeros for empty scores or empty answers |
| | grade filtering: G1 data does not leak into G2 view (caller pre-filters) |
| `_aggregateDifficultyByLesson` | clusters hard misses by lesson |
| | falls back gracefully when qid format unrecognized (Unit Tests, Free Mode) |
| `buildLearningInsights.difficultyBreakdown` | not-enough-data state when total < 6 |
| | hard-struggle state (hard ≥ 3, < 60%) |
| | foundation-review state (easy ≥ 3, < 70%) |
| | ready-for-challenge state (easy + medium ≥ 80%, hard ≥ 70% or missing) |
| | balanced-progress state |
| | `DIFF_MIN_PER_LEVEL` enforced (no claim for level with < 3 answers) |
| Regression | all 223 existing tests still pass |

---

## 10. Browser verification plan

After unit tests pass, before any production deploy:

1. `preview_start` → dashboard
2. Seed two test profiles:
   - G1: easy ~90%, medium ~70%, hard ~40%
   - G2: empty or sparse
3. **G1 view**: card appears after Trend; bars + percentages correct; "hard-struggle" copy; lesson subline if cluster found
4. **Switch dropdown → G2**: card switches to "not enough data" (no leakage)
5. **Switch back → G1**: original view restored
6. **Open quiz review modal**: no console errors, card intact on modal close
7. **Profile with only legacy answers**: graceful "not enough data"
8. **Fresh G1 quiz → finish → return to dashboard**: new answers appear in breakdown

Tools: `preview_console_logs`, `preview_screenshot`, `preview_snapshot`.

---

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | Whitelist gap at `src/quiz.js:2231` drops `errTag` today and would drop `difficulty` | Patch whitelist in this phase — small, localized |
| 2 | Mirror drift between `src/dashboard.js` and `dashboard/dashboard.js` | Update both + export bridge. `npm test` fails if mirror missing helper |
| 3 | Untagged answers inflate medium bucket | Normalize to `null`. Aggregator ignores. Do NOT inherit `quiz.js:473` fallback |
| 4 | G2 difficulty card always empty | Acceptable. "Not enough data yet" is correct behaviour |
| 5 | qid format breaks `_aggregateDifficultyByLesson` for Unit Tests / Free Mode | Helper falls back to no-cluster; subline simply doesn't render |
| 6 | JSON column size growth | ~10–15 bytes/answer × 20 questions ≈ 300 B/score row. Negligible |
| 7 | Card placement subjective | After Trend recommended; easy to move during code review |
| 8 | State precedence ambiguity (e.g., both hard-struggle and foundation-review match) | Explicit precedence rule: `hard-struggle > foundation-review > ready > balanced` |

---

## 12. Files likely to change

```
src/quiz.js              — 3 push sites + 3 whitelist sites + 1 helper
src/unit.js              — 1 push site
src/dashboard.js         — 2 aggregators + _LI_THRESH extension +
                            1 new card render + buildLearningInsights bundle
dashboard/dashboard.js   — mirror helpers + exports bridge
tests/dashboard.test.js  — +20 tests
```

**Unchanged:** question banks, `src/data/`, `shared_g1.js`, `question-engine.js`, Supabase schema, Unit Test sampling, Free Mode, scoring logic.

---

## 13. Final recommendation

**READY TO IMPLEMENT PHASE 3A.**

All required data is reachable. All chokepoints identified. Your spec covers thresholds, copy, and states without further product decisions. No schema changes needed. The pre-existing whitelist gap at `src/quiz.js:2231` (Phase 2A regression) is small and folds cleanly into this phase.

Companion execution plan: `2026-05-19-learning-insights-phase3a-execution.md`.
