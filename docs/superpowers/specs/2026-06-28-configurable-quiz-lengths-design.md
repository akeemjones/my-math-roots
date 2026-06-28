# Configurable Quiz Lengths — Design

Date: 2026-06-28
Status: Approved (brainstorm). Scope: lesson + unit quiz length only. No deploy.

## Goal

Let a parent set per-student lesson- and unit-quiz lengths from the Parent
Dashboard. Defaults stay 8 (lesson) / 25 (unit). Never serve more questions
than the eligible bank holds. Scoring/progress already use the served count, so
no changes there.

## Data model

Per-student localStorage key: `mmr_quiz_lengths_<sid>` where `<sid>` is the
active student id (`_activeId` in dashboard, `mmr_active_student_id` on the
learning side). Guest/free/local mode falls back to `mmr_quiz_lengths_local`.
No DB migration, no cloud sync for v1.

```
{ lesson: "default" | <int> | "all",
  unit:   "default" | <int> | "all" }
```

Both default to `"default"` until the parent changes them.

## Pure helper: `src/quiz-config.js` (Node-loadable, like quiz-helpers.js)

- `LESSON_QUIZ_DEFAULT = 8`, `UNIT_QUIZ_DEFAULT = 25`
- `loadQuizLengths(sid)` / `saveQuizLengths(sid, cfg)` — read/write the keyed object; guard JSON.
- `resolveLessonCount(setting, bankSize)` → integer to serve.
  - `"default"` → `min(8, bankSize)`; `<int>` → `clamp(1..bankSize)`;
    `"all"` → `bankSize`. Never exceeds bankSize, never below 1 (bank empty → 0).
- `resolveUnitDecision(setting, nativeSize, pooledSize)` → `{ mode, count }`.
  - `mode: "native"` when `setting === "default"` / missing, OR `setting` is a
    number equal to `nativeSize`.
  - `mode: "pooled"` when `setting === "all"` (count = pooledSize) or a number
    `!= nativeSize` (count = clamp(1..pooledSize)).
- `isValidCustom(v)` → true for an integer >= 1 (used by dashboard Save gating).

## Learning-side integration (src/quiz.js)

Single choke point `_runQuiz(bank, qid, label, type, unitIdx, _prebuiltQs, mode, count)`:
add optional `count`. When omitted, behavior is byte-for-byte today's
(`final?50 : unit?25 : 8`). **Final test is untouched** — only lesson/unit paths
pass a `count`.

- `startLessonQuiz`: `bank = l.qBank||l.quiz`; `n = resolveLessonCount(cfg.lesson, bank.length)`.
  Pass `n` to `_buildLessonAttempt` (already takes a count) and to `_runQuiz`.
- `startUnitQuiz`: compute `nativeSize = _unitQuizSize(u)` and
  `pooledBank = u.testBank || (all lesson qBanks concatenated)`.
  `resolveUnitDecision(cfg.unit, nativeSize, pooledBank.length)`:
  - `native` → existing path exactly as today (K blueprint / G1 sampler / G2-3 25).
  - `pooled` → `_runQuiz(pooledBank, ..., count)` → existing no-replacement
    weighted sampler. No dupes; never exceeds pooled size.
- Resume: served `qz.questions` is already frozen into the pause record, so a
  resumed attempt keeps its length even if the setting/bank later changes.

Active-student id read via `mmr_active_student_id` (fallback `local`).

## Dashboard UX (src/dashboard.js) — per active student, no emoji

`_renderQuizLengthSection()` inside the Settings section, beside Quiz Timer.
Two chip groups + reveal-on-Custom number input:

- Lesson Quiz: `Default (8)` · `10` · `15` · `20` · `All` · `Custom`
- Unit Quiz:   `Default` · `10` · `15` · `40` · `All` · `Custom`  (no "(25)" — K/G1 native may not be 25)

Save via a Save button (mirrors Timer). Custom input `min=1`, integer-only:
invalid/blank shows an inline validation message and **Save stays disabled** —
`"default"` is only stored when the parent actually picks Default. Helper text:

> "Each quiz uses up to the selected amount. If that lesson or unit has fewer
> questions, it will use the available questions."

Clamping happens at quiz start (approved consequence of a global-per-student
control over banks of differing sizes). Student sees the true served count as
"Question X of N" in the quiz.

Wiring: `data-action` handlers + `boot.js` global registration.

## Testing (`__tests__/quiz-config.test.js`)

- Lesson: bank < 8, = 8, > 8, custom number, `"all"`; custom > bank → clamp;
  invalid → `min(8, bank)`; empty bank → 0.
- Unit: pooled < 25, = 25, > 25, custom, `"all"`; `"default"` → native;
  number == native → native; number != native → pooled at clamped count;
  `"all"` → pooled = full size.
- Guard checks: final quiz behavior unchanged; no duplicate questions in one
  attempt (sampler is without-replacement); custom unit quiz does NOT use the K
  blueprint; default K unit quiz STILL uses the K blueprint.

## Out of scope

Cross-device cloud sync, DB migration, per-lesson option hiding, final-test
length, any unrelated refactor, deploy/SW-cache bump.
