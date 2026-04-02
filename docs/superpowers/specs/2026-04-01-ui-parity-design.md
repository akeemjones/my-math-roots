# UI/UX Parity Sprint — Design Spec
**Date:** 2026-04-01
**Status:** Approved
**Approach:** Option B — Screen-by-screen port
**Source of truth:** `dist/` (pre-SvelteKit vanilla JS build, currently live on production)

---

## Goal

Achieve true 1:1 visual parity between the legacy vanilla JS build and the SvelteKit build. Every class name, every SVG path, every DOM node is copied verbatim from the legacy source. Dark mode included. Svelte logic, stores, and routing are never modified — only templates and CSS.

---

## What Is Already Done

| Screen | Status |
|--------|--------|
| Login (`/login`) | ✅ Complete — plant SVG, math background, white title, K-5 subtitle, tab row, Google + email form |
| Home (`/`) | ✅ Complete — `.home-in` / `.hero` / `.op` / `.carousel-wrap` / `.carousel-track` / `.cs.cs-active` unit cards / `.big-btn` |
| Select (`/select`) | ✅ Complete — student card grid, PIN keypad, sign-out button |
| `app/src/app.css` | ✅ Created — global home-screen classes imported in `+layout.svelte` |
| `boot.ts` | ✅ Fixed — dynamic import changed from `$lib/data/u${n}.ts` → `./data/u${n}.ts` so unit content lazy-loads correctly |

---

## Remaining Work (in priority order)

### 1. Quiz Screen — `/quiz/[id]`

**Data fix (prerequisite):**
The quiz route navigated to directly shows "No questions found" because unit data isn't lazy-loaded unless the unit screen was visited first. Fix: `quiz/[id]/+page.svelte` must call `loadUnit(unitId)` in `onMount` before building the question set, mirroring the fix applied to `unit/[id]/+page.svelte`.

**Legacy DOM structure** (from `src/quiz.js` + `src/index.html #quiz-screen`):
```
#quiz-screen.sc
  .sc-in
    .quiz-header
      .quiz-back-btn           ← back arrow
      .quiz-progress           ← "Q 3 of 10" label
      .quiz-bar                ← .quiz-barf (progress fill)
    .quiz-card
      [optional .quiz-svg]     ← inline SVG for visual questions
      .quiz-q                  ← question text
    .quiz-opts
      .qopt[data-i=0]          ← A option
      .qopt[data-i=1]          ← B option
      .qopt[data-i=2]          ← C option
      .qopt[data-i=3]          ← D option
    .quiz-footer
      .quiz-hint-btn           ← optional hint button
```

**Results DOM** (`#results-screen`):
```
.results-wrap
  .results-score-circle        ← large % number, colored ring
  .results-stars               ← ★★★ / ★★☆ / ★☆☆
  .results-msg                 ← "Great job!" etc.
  .results-btns
    .results-retry-btn
    .results-continue-btn
```

**Animations:**
- `.qopt.correct` → green flash → `coin-drop` animation
- `.qopt.wrong` → red flash → shake
- 100% score → confetti burst

**Dark mode:** `.quiz-card`, `.qopt` use `--bg2` / `--border` tokens; `body.dark` overrides via existing token system.

**CSS source:** `src/styles.css` — search for `.quiz-`, `.qopt`, `.results-`

---

### 2. Dashboard — `/dashboard`

**Auth:** `dashboard/+layout.svelte` guards parent-only access via `$isSignedIn`. No change to logic — only CSS.

**Student switcher** (in dashboard layout header):
```
.dash-header
  .dash-brand                  ← "🌱 My Math Roots"
  .dash-student-row            ← horizontal pill row
    .dash-pill[data-active]    ← one per familyProfiles entry
  .dash-back-btn               ← "← Back to student"
```

**OverallStats component:**
```
.stats-grid                    ← 2×3 chip grid
  .stat-chip[style=--chip-color]
    .stat-val                  ← big number
    .stat-lbl                  ← label text
```

**QuizHistory component:**
```
.qh-list
  .qh-row
    .qh-dot                    ← unit color circle
    .qh-label                  ← unit + lesson name
    .qh-score                  ← "87%"
    .qh-stars                  ← ★★☆
    .qh-date
    .qh-del                    ← delete stub button
```

**MasteryGrid component:**
```
.mg-grid
  .mg-row (per unit)
    .mg-unit-label
    .mg-cells
      .mg-cell.pass / .mg-cell.attempt / .mg-cell.untouched
```

**AiReportCard component:**
```
.air-card
  .air-cooldown                ← "Available in N days"
  .air-generate-btn            ← disabled during cooldown
  .air-report-text             ← scrollable rendered report
```

**ParentSettings component:**
```
.ps-section
  .ps-toggle-row (× 4)
    .ps-label
    .ps-toggle input[type=checkbox]
```

**CSS source:** `src/styles.css` — search for `.dash-`, `.stat-`, `.qh-`, `.mg-`, `.air-`, `.ps-`

---

### 3. Lesson Screen — `/lesson/[id]`

**Legacy DOM structure** (from `src/unit.js` lesson panel + `#lesson-screen`):
```
#lesson-screen.sc
  .sc-in
    .lesson-hdr
      .lesson-back             ← back to unit
      .lesson-title            ← lesson name
      .lesson-desc
    .lesson-glass-wrap         ← flex:1, overflow-y:auto
      .kp-card                 ← key points
        .kp-title              ← "📌 Key Points"
        .kp-list
          .kp-item × N
      .ex-card × N             ← each worked example
        .ex-tag                ← colored label (e.g. "No Regrouping")
        .ex-prob               ← problem statement
        .ex-sol                ← solution steps
        .ex-ans                ← final answer
      .prac-section
        .prac-title            ← "✏️ Practice"
        .prac-item × N
          .prac-q
          .prac-reveal-btn
          .prac-answer[hidden]
    .lesson-footer
      .lesson-prev-btn
      .lesson-quiz-btn         ← "🎯 Start Quiz"
      .lesson-next-btn
```

**CSS source:** `src/styles.css` — search for `.lesson-`, `.kp-`, `.ex-`, `.prac-`

---

### 4. Unit Detail Screen — `/unit/[id]`

**Replace** current minimal lesson list with full legacy structure:

```
#unit-screen.sc
  .sc-in
    .unit-banner[style=background:var(--uc)]
      .back-btn
      .unit-ico                ← emoji icon
      h2                       ← unit name
      p                        ← description
      .unit-teks               ← TEKS pill
      .uc-mini-pb
        .uc-mini-pbf[style=width:{pct}%]
    .lesson-glass-wrap
      .lcard-grid
        .lcard × N
          .lcard-num           ← colored circle with lesson number
          .lcard-info
            .lcard-title
            .lcard-desc
          .lcard-badges
            .badge-done (if completed)
            .badge-quiz (if quiz passed)
```

**CSS source:** `src/styles.css` — search for `.unit-banner`, `.lcard`, `.badge-`

---

## CSS Strategy

All extracted CSS rules go into `app/src/app.css` (already imported globally). Each screen's rules are added in a clearly-labelled section block:

```css
/* ── QUIZ SCREEN ───────────────────────────── */
/* ── DASHBOARD ─────────────────────────────── */
/* ── LESSON SCREEN ─────────────────────────── */
/* ── UNIT DETAIL ───────────────────────────── */
```

Dark mode overrides use `body.dark .class { }` — same pattern as legacy. The `body.dark` class is toggled by `$a11y.darkMode` from the existing prefs store, applied as a `class:dark={$a11y.darkMode}` binding on `<body>` in `+layout.svelte`.

---

## Verification Protocol (per screen)

1. Bypass auth guard temporarily (comment out `$effect` redirect)
2. Navigate directly to the route
3. Take `preview_screenshot` — compare against `dist/` reference
4. Check `preview_console_logs` for errors
5. Restore auth guard
6. Move to next screen

---

## Out of Scope for This Sprint

- Tour / spotlight overlay (`src/tour.js`)
- Install / update banners
- Settings screen (no SvelteKit route exists yet)
- History screen (covered by Dashboard QuizHistory component)
- Final Test screen
- Any new features (Supabase sync, AI report backend)
