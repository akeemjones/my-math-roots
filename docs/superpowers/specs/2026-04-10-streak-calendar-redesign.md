# Streak Calendar Redesign — Design Spec

## Overview

Redesign the existing v1 streak calendar into a motivation tracker + progress journal. The calendar is accessed via a dedicated button on the home screen, opens as a glassmorphic modal, and includes a milestone celebration system that evolves as streaks grow.

**Target:** v1 app only (`E:/Cameron Jones/my-math-roots/`).
**Audience:** Created/authenticated accounts only (not guests).

## Calendar Button

### Placement
- Fixed position, top-left of the home screen.
- **Stacks below the profile switcher button** when profile switcher is visible (multi-profile students with 2+ profiles).
- **Takes the top-left position directly** when profile switcher is hidden (single-profile or non-student).

### Appearance
- **Size:** 50x50px — matches existing `.prof-btn` dimensions.
- **Style:** Same glassmorphic circle as `.prof-btn` — `rgba(255,255,255,0.85)` background, `backdrop-filter: blur`, 1.5px white border, soft shadow.
- **Icon:** Calendar SVG (rect + two vertical lines for ring binders + horizontal divider line), stroke `#444`, 22x22px.
- **Activity dot:** 10px circle, top-right corner of the button.
  - **Green (`#27ae60`):** Student has completed at least one quiz/lesson today.
  - **Gray (`#ddd`):** No activity yet today.
  - **2px white border** around the dot for contrast.
- Supports light/dark theme via existing CSS variable pattern.

### Visibility Rules
- Only rendered for authenticated users (`_supaUser` is truthy).
- Hidden for guests/anonymous sessions.
- The button element: `<button id="cal-btn" class="cal-btn">` registered in the event system via `data-action="openStreakCal"`.

### Positioning Logic
```
if prof-btn is visible:
  cal-btn.top = prof-btn.bottom + 10px gap
else:
  cal-btn.top = same as prof-btn default (14px + safe-area-inset-top)
cal-btn.left = 16px (same as prof-btn)
```

## Calendar Modal

### Open/Close
- **Open:** Tap the calendar button. Pushes history state for back-button support.
- **Close:** Tap backdrop overlay OR swipe down on the modal sheet. No visible close (X) button.
- **Scroll lock:** Lock body scroll while modal is open (existing `_lockScroll`/`_unlockScroll` pattern).

### Layout (no scroll — everything fits in viewport)

From top to bottom:

1. **Drag pill** — 32x3px centered, `rgba(0,0,0,0.12)`, visual swipe-down affordance.

2. **Streak hero row** — horizontal layout:
   - Left: Fire SVG (32x40px, existing `_fireSvg` function).
   - Center: Streak count (Boogaloo font, 28px, `#ff7700`), "Day Streak · Best: N" label (10px uppercase), milestone badge below the label.
   - No close button in this area.
   - Background: subtle orange gradient (`rgba(255,119,0,0.08)` to `rgba(255,60,0,0.04)`), 14px border-radius.

3. **Month navigation** — `‹ April 2026 ›` with arrow buttons. Right arrow disabled (opacity 0.25) on current month.

4. **Calendar grid** — 7-column CSS grid, 30px row height, 24px day circles.
   - **Active day (not in streak):** Green fill (`#27ae60`), white text.
   - **Active day (in streak):** Orange fill (`#ff7700`), white text, with horizontal connector bars (`rgba(255,119,0,0.15)`) linking consecutive streak days.
   - **Today (active + streak):** Orange fill with double ring (`box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px #ff7700`).
   - **Today (no activity):** Orange outline only (`border: 2px solid #ff7700`), orange text.
   - **Future days:** 30% opacity.
   - **Tappable:** Only days with activity respond to tap (show day detail below).
   - Always render 6 rows (42 cells) so grid height is constant across months.

5. **Day detail panel** — appears below the grid when a day with activity is tapped. Two states:
   - **Collapsed:** Date header ("Thu, Apr 10" + "3 activities"), stats row (Quizzes count, Avg score %, Time spent), "View details ▾" expander.
   - **Expanded:** Same header + stats, plus individual quiz items listed below. Each item shows: colored bar (blue for lesson, green for unit quiz, orange for final), quiz name (truncated), type + time, score percentage (color-coded: green ≥90%, blue ≥80%, orange <80%).

6. **Dismiss hint** — "Tap outside or swipe down to close" in 9px muted text, centered at bottom.

### Swipe Navigation (months)
Keep the existing momentum-based swipe system from `_openStreakCal`:
- **Fast forceful swipe** (velocity > 0.3 px/ms AND distance > 20px): immediately commits to next/previous month.
- **Slow drag:** requires > 50% of viewport width to commit. Otherwise snaps back.
- Peek element shows the incoming month sliding in from the appropriate side.
- Cannot swipe past the current month (future months blocked).
- CSS transition: `transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)`.
- Button navigation (`‹` / `›`) uses slide animation (0.28s) with enter-from-side effect.

### Glassmorphism
Matches existing app style:
- **Light mode:** `background: linear-gradient(145deg, rgba(255,255,255,0.93), rgba(240,248,255,0.85), rgba(235,252,245,0.80))`, `backdrop-filter: blur(28px) saturate(160%)`, white inset borders, soft blue shadow.
- **Dark mode:** `background: rgba(255,255,255,0.07)`, `box-shadow: 0 8px 40px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.12)`.
- Border-radius: 24px.
- Max-width: 340px, centered in viewport.

## Milestone System

Badges appear in the streak hero row when the current streak reaches a threshold. Only the highest achieved milestone is shown.

| Streak | Badge Label     | Gradient Colors              |
|--------|-----------------|------------------------------|
| 3      | GETTING STARTED | `#74b9ff` → `#0984e3` (blue) |
| 7      | WEEK WARRIOR    | `#ff9500` → `#ff5a00` (orange) |
| 14     | SUPER STUDENT   | `#a29bfe` → `#6c5ce7` (purple) |
| 30     | MATH LEGEND     | `#ffd700` → `#ff8c00` (gold) |

Badge styling: inline-block, `padding: 2px 8px`, `border-radius: 10px`, 8px bold uppercase white text.

When streak is 0 or below 3, no milestone badge is shown.

## Data Sources

No new data storage required — uses existing localStorage keys:

- **`wb_streak`** — `{ current, longest, lastDate }` for streak display.
- **`wb_sc5`** (SCORES) — signed array of quiz results, filtered by date for day detail. Fields: `date`, `label`, `qid`, `type`, `pct`, `stars`, `time`, `color`.
- **`wb_act_dates`** — array of `YYYY-MM-DD` strings for marking active days on the grid.
- **`wb_apptime`** — `{ dailySecs: { "YYYY-MM-DD": secs } }` for time-spent stat in day detail.

## Activity Dot Logic

The home screen button dot updates on:
- App boot (check if today's date is in `wb_act_dates`).
- After any quiz completion (the existing score-save flow already updates `wb_act_dates`).

```
dot.color = wb_act_dates.includes(todayStr) ? '#27ae60' : '#ddd'
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/auth.js` | Replace `_openStreakCal`, `_buildStreakCal`, `_buildCalGridHTML`, `_showDayDetail`, `_streakCalNav` with redesigned versions. Add `_renderCalBtn`, `_updateCalDot`, milestone logic. |
| `src/styles.css` | Add `.cal-btn` styles (mirror `.prof-btn` at 50x50), `.cal-dot`, modal layout classes. |
| `src/home.js` | Call `_renderCalBtn()` on home render. Adjust layout if profile button visibility changes. |
| `src/events.js` | Register new actions: `openStreakCal`, `_showDayDetail`, `_streakCalNav`, `_toggleDayExpand`. |
| `src/nav.js` | Add `scal-modal` to modal registry if not already present (it is). |
| `index.html` | Add `<button id="cal-btn" class="cal-btn">` to home screen markup. |
| `build.js` | No changes needed (auth.js already in build order). |

## What This Replaces

The existing streak calendar (`_openStreakCal` and related functions in `auth.js`) is fully replaced. The old streak badge (`#streak-badge`) is removed — the calendar button with activity dot replaces its function.

## Out of Scope

- Study planner / scheduling features.
- Push notifications or reminders.
- Streak freeze / skip days.
- V2 app changes.
- Guest/anonymous user access.
