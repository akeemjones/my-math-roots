# Assessment-Model Simplification — Implementation Plan

Branch: `feature/simplified-product`. Scope: three UI-flag-gated workstreams.
All changes governed by flags already declared in `src/app-config.js:80-83`, so
`SIMPLIFIED_PRODUCT_MODE=false` restores current-master behavior exactly (tested
by `tests/app-config.test.js`). Flags govern **UI surfaces only** — the Supabase
push pipeline (`mastery_json`/`streak`/`apptime_json`/`intervention_events`)
stays byte-identical, per the app-config contract.

Product decisions (owner, 2026-07-17):
- Targeted feedback = **inline, acknowledge to continue**.
- Progression = **status labels: Recommended / Ready / Review / Done**.
- Dashboard = **Overview / Progress / Practice / Account** (4 sections).
- Mastery wrong-table RPC bug = **deferred** to the sync-reliability phase; the
  redesign must not newly feature mastery.

---

## Workstream A — Interventions → inline targeted feedback

Flag: `INTERVENTION_OVERLAYS` (false = inline; true = legacy full-screen modal).
Currently inert (zero consumers); overlays always render today.

Keep unchanged (reused): trigger predicate `_shouldShowFullIntervention`
(`src/quiz.js:180`), all content builders — `_buildInterventionContent`
(`:2249`), `_buildTopicAwareIntervention` (`:1547`), `MINI_LESSONS` (`:228`) —
and the full telemetry path (`triggered`/`resolved` events + `intervention_shown`/
`intervention_completed` analytics). Byte-identical push guarantee holds.

Change: presentation only.
- Extract `_renderTargetedFeedbackInline(content, {onDismiss})` — injects a
  compact inline card into the quiz DOM near the question: chosen vs correct
  value, one teaching line (from `teachingSteps`/`text`), optional `visualHTML`,
  and a **"Got it — continue"** button. Sets `isPaused=true` (acknowledge-to-
  continue: manipulatives stay blocked until dismissed). Scroll into view;
  single-fire; listener cleanup on dismiss.
- `_pauseForIntervention` (MC, `:2675`) and `_pauseForInterventionTapGroup`
  (`:1430`) branch on `isFeatureOn('INTERVENTION_OVERLAYS')`: true → existing
  overlay; false → inline renderer. Both share the content builder. Consolidate
  the ~90% duplicated overlay code only within the new inline path.
- `_resumeQuiz` (`:2845`) unchanged — question stays frozen (acknowledge model),
  which keeps `tests/quiz-question-stability.test.js` valid.

Tests: existing topic-routing + question-stability stay green (button text
"Got it — continue" and no-swap both preserved). Add `tests/targeted-feedback.test.js`:
inline path renders no `[data-focus-overlay]` full-screen node; legacy path does;
telemetry events fire in both.

## Workstream B — Hard-lock removal + status labels

Flag: `HARD_PROGRESSION_LOCKS` (false = unlocked; true = legacy 80% gate).
Currently inert — the gate in `src/nav.js` is unconditional.

B1 — Gate the three functions in `src/nav.js:78-101`
(`isUnitUnlocked`/`isLessonUnlocked`/`isUnitQuizUnlocked`): early
`if(!isFeatureOn('HARD_PROGRESSION_LOCKS')) return true;`. Legacy keeps 80%.

B2 — New pure `lessonStatus(unitIdx, lessonIdx)` → `'done'|'review'|'recommended'|'ready'`
(and `'locked'` when the flag is on, for the legacy render path):
- passed ≥80% → `done`; attempted <80% → `review`;
- equals `nextLearningTarget()` (`src/nav.js:120`) → `recommended`; else → `ready`.
Render status pills in the lesson list (`src/unit.js:167-182`) in place of the
locked-card branch, and unit-level status in the home carousel
(`src/home.js:122-132, 277-287`). Legacy flag-on path keeps existing lock render.

B3 — Tests: `tests/core.test.js:71-91` re-implements the gate locally and has
drifted (uses `pct===100` for lesson/quiz vs real `pct>=80`) — rewrite those
copies to match `src/nav.js` and add flag-off = all-unlocked assertions. Add
`tests/lesson-status.test.js` for the four states. Check
`tests/practice-progression.test.js` still holds (practice never satisfies pass).

## Workstream C — Four-section parent dashboard

Flag: `LEGACY_DASHBOARD_SECTIONS` (false = 4 groups; true = current 8-section flat list).

Regroup the composition in `renderDashboard()` (`src/dashboard.js:5534-5552`)
under four labeled group headers (not nested accordions — lower risk; inner
render functions keep their own `_dbSection` chrome unchanged):
- **Overview** — Action Summary + Activity Snapshot
- **Progress** — Learning Insights + Unit Map (Root System) + Quiz History
- **Practice** — Practice Plan
- **Account** — Profiles & Account + Settings

Mastery: no new emphasis. Learning Insights / Root System stay as-is; the
deterministic summary already omits mastery. RPC fix stays out of this phase.

Tests: grouping is presentational — add one structural assertion (4 group
headers present when flag off) via the dashboard harness; compute-function tests
unaffected.

---

## Sequencing & verification
1. B (nav/unit/home) → 2. A (quiz) → 3. C (dashboard). Each its own commit(s),
full suite green between. Drive the real app in the browser preview after B and A
(student flow) and after C (dashboard) — not just tests.

## Explicitly out of scope (tracked elsewhere)
- Mastery wrong-table RPC fix (`get_student_progress_by_pin`) → sync-reliability phase.
- Student→dashboard routing bug → sync-reliability phase.
- `QE.selectRetry` revival — not needed for the acknowledge model.
