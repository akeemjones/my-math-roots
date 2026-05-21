# Settings Back-Button Navigation Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user opens Settings from any learning screen, the Settings back button returns them to that exact screen instead of always going to Home.

**Architecture:** Add a single module-level variable `_settingsReturnScreen` in `src/settings.js`. Capture the active screen ID in `goSettings()` before navigating away. Add `goSettingsBack()` that reads the stored ID and calls `show(id)` (or `goHome()` for the home fallback). Wire this function into the HTML button, the event dispatcher, the global-scope registry, and the swipe-back MAP.

**Tech Stack:** Vanilla JS, no framework, no build-time JS transforms (build.js concatenates src/ files). All changes are in plain JS and HTML.

---

## File Map

| File | Change |
|---|---|
| `src/settings.js` | Add `_settingsReturnScreen` var; capture screen in `goSettings()`; add `goSettingsBack()` |
| `index.html` | Settings back button: `data-action="goHome"` → `data-action="goSettingsBack"`, text "Home" → "Back" |
| `src/nav.js` | Swipe MAP `settings-screen` entry: make `prev` a function, update `back`; handle function-valued `prev` in touch engine |
| `src/events.js` | Register `goSettingsBack` in `_ACTIONS` |
| `src/boot.js` | Add `'goSettingsBack'` to `_APP_GLOBALS` |

**Tests:** The existing test suite (`tests/core.test.js`, `tests/dashboard.test.js`, etc.) tests pure functions reimplemented without a DOM. No navigation tests exist; the project has no DOM test harness. Per the spec: "Add or update tests if the project has navigation tests" — none do, so no test file is added.

---

## Task 1: Add `_settingsReturnScreen` and capture logic in `src/settings.js`

**Files:**
- Modify: `src/settings.js:1671-1704`

- [ ] **Step 1: Add the return-screen variable and capture it in `goSettings()`**

Find the line immediately before `function goSettings(){` (currently line 1672 — there is a blank line at 1671). Insert the variable declaration there, then add the capture line as the very first statement inside `goSettings()`.

Current `goSettings()` opening (lines 1672-1674):
```js
function goSettings(){
  playTap();
  updateAccountUI();
```

Replace with:
```js
let _settingsReturnScreen = 'home';

function goSettings(){
  _settingsReturnScreen = ALL_SCREENS.find(s => document.getElementById(s)?.classList.contains('on')) || 'home';
  playTap();
  updateAccountUI();
```

- [ ] **Step 2: Add `goSettingsBack()` immediately after `goSettings()` closes**

`goSettings()` ends at `}` on line 1704. Insert the new function on line 1706 (after the closing brace and its trailing blank line):

```js
function goSettingsBack(){
  playSwooshBack();
  const ret = _settingsReturnScreen || 'home';
  _settingsReturnScreen = 'home';
  if(ret === 'home' || ret === 'settings-screen' || ret === 'login-screen'
     || ret === 'parent-screen' || ret === 'dashboard-screen'){
    goHome();
  } else {
    show(ret);
  }
}
```

**Why the else-branch uses `show()` not named functions:** The quiz/unit/lesson DOM is still in the DOM when settings is shown (the `show()` function only toggles the `.on` class — it does not rebuild or clear content). `CUR.unitIdx`, `CUR.lessonIdx`, and `CUR.quiz` are all still intact. Calling `show(ret)` is sufficient to restore the screen with zero state loss. `goHome()` is used for `'home'` because it also calls `buildHome()` / `refreshHomeState()` — home is the only screen that requires an explicit rebuild.

- [ ] **Step 3: Verify the edit looks correct**

Read `src/settings.js` offset 1669, limit 45 to confirm the variable, the capture line, and the new function are all present and correctly placed.

- [ ] **Step 4: Commit**

```bash
git add src/settings.js
git commit -m "feat(nav): add _settingsReturnScreen + goSettingsBack() — capture return target before opening settings"
```

---

## Task 2: Update the Settings back button in `index.html`

**Files:**
- Modify: `index.html:461`

- [ ] **Step 1: Change `data-action` and button label**

Find (line 461, inside `<div id="settings-screen">`):
```html
    <button class="bar-back" style="color:#8e44ad" data-action="goHome">Home</button>
```

Replace with:
```html
    <button class="bar-back" style="color:#8e44ad" data-action="goSettingsBack">Back</button>
```

`"Home"` → `"Back"`: the button is now context-sensitive and the label "Home" would be misleading when returning to a quiz or lesson. No other visual changes.

- [ ] **Step 2: Verify**

```bash
grep -n 'settings-screen' index.html | head -5
```

Confirm line 461 now reads `data-action="goSettingsBack"`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix(nav): settings back button — goSettingsBack instead of goHome"
```

---

## Task 3: Update swipe-back MAP in `src/nav.js`

**Files:**
- Modify: `src/nav.js:107` (MAP entry)
- Modify: `src/nav.js:206` (touch engine `prevEl` assignment)

The swipe MAP has two roles: (a) `prev` tells the engine which screen to reveal behind the current one during the gesture; (b) `back()` is what executes on a committed swipe. We make `prev` a zero-arg function so it reads `_settingsReturnScreen` dynamically at gesture start, giving a correct visual peek-behind for any origin screen.

- [ ] **Step 1: Update the MAP entry (line 107)**

Current:
```js
    'settings-screen':{ prev:'home',            back:()=>{ playSwooshBack(); goHome(); } },
```

Replace with:
```js
    'settings-screen':{ prev:()=>_settingsReturnScreen||'home', back:()=>goSettingsBack() },
```

- [ ] **Step 2: Update the touch engine to handle function-valued `prev` (line 206)**

Current (inside the `touchstart` handler, `_startSwipe()` context — the line directly after `curEl = document.getElementById(id);`):
```js
  prevEl = entry.prev ? document.getElementById(entry.prev) : null;
```

Replace with:
```js
  const _prevId = typeof entry.prev === 'function' ? entry.prev() : entry.prev;
  prevEl = _prevId ? document.getElementById(_prevId) : null;
```

- [ ] **Step 3: Verify**

Read `src/nav.js` offset 100, limit 15 to confirm the MAP entry. Read offset 200, limit 12 to confirm the `_prevId` line.

- [ ] **Step 4: Commit**

```bash
git add src/nav.js
git commit -m "fix(nav): settings swipe-back — dynamic prev + goSettingsBack()"
```

---

## Task 4: Register `goSettingsBack` in `src/events.js`

**Files:**
- Modify: `src/events.js:33`

- [ ] **Step 1: Add `goSettingsBack` to `_ACTIONS`**

Find (line 33):
```js
    goSettings:             ()    => goSettings(),
```

Replace with:
```js
    goSettings:             ()    => goSettings(),
    goSettingsBack:         ()    => goSettingsBack(),
```

- [ ] **Step 2: Verify**

```bash
grep -n 'goSettingsBack' src/events.js
```

Should show one result at line ~34.

- [ ] **Step 3: Commit**

```bash
git add src/events.js
git commit -m "feat(events): register goSettingsBack action"
```

---

## Task 5: Register `goSettingsBack` in `src/boot.js` global scope guard

**Files:**
- Modify: `src/boot.js:78`

- [ ] **Step 1: Add to `_APP_GLOBALS`**

Find (line 78):
```js
  'goSettings','toggleGradePicker','pickGrade','_fpAnswer','_gen5thGradeProblem','_fpProblem','_fpBlurHandler',
```

Replace with:
```js
  'goSettings','goSettingsBack','toggleGradePicker','pickGrade','_fpAnswer','_gen5thGradeProblem','_fpProblem','_fpBlurHandler',
```

- [ ] **Step 2: Verify**

```bash
grep -n 'goSettingsBack' src/boot.js
```

Should show one result.

- [ ] **Step 3: Commit**

```bash
git add src/boot.js
git commit -m "chore(boot): add goSettingsBack to _APP_GLOBALS scope guard"
```

---

## Task 6: Run test suite and build

- [ ] **Step 1: Run tests**

```bash
npm test
```

Expected: all tests pass. The existing test suite tests pure functions without a DOM — no navigation tests exist, so no test changes are needed and no new failures are expected.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build completes with no errors. The build concatenates `src/` files into `dist/` — it does not transform or minify JS in a way that would break the new function.

- [ ] **Step 3: Commit if build output changed**

```bash
git add dist/
git commit -m "build: rebuild dist after settings-back-navigation fix"
```

---

## Task 7: Manual browser verification

Start the dev server and verify each scenario. The server runs on port 3000 serving `dist/`.

```bash
node serve.js
```

Then open `http://localhost:3000` and test each path:

- [ ] **Scenario 1 — Home → Settings → Back → Home**
  1. Load app, arrive at Home screen
  2. Tap cog (⚙) → Settings opens
  3. Tap Back → should land on Home (not a black screen or login)

- [ ] **Scenario 2 — Unit page → Settings → Back → same Unit page**
  1. Open any unit (e.g., Unit 1)
  2. Tap cog → Settings opens
  3. Tap Back → should land on Unit 1 page (not Home)

- [ ] **Scenario 3 — Lesson page → Settings → Back → same Lesson page**
  1. Open a unit, open a lesson
  2. Tap cog → Settings opens
  3. Tap Back → should land on the same lesson page (not Home, not the unit page)

- [ ] **Scenario 4 — Active quiz → Settings → Back → same quiz**
  1. Start a lesson quiz
  2. Answer 1–2 questions
  3. Tap cog → Settings opens
  4. Tap Back → should return to the quiz at the same question
  5. Confirm: score counter and question index are not reset

- [ ] **Scenario 5 — Swipe right on Settings → correct screen reveals behind**
  1. Open a lesson, then open Settings
  2. Swipe right from the left edge of the Settings screen
  3. The lesson screen should peek from behind (not the home screen)
  4. Commit the swipe → lands on the lesson screen

- [ ] **Step 6: Commit final verification note**

No code change needed — this step is a green-light check only.

---

## Expected behavior matrix (post-fix)

| Origin | Settings → Back | Swipe back |
|---|---|---|
| Home | → Home | → Home |
| Unit page | → Same unit page | → Same unit page |
| Lesson page | → Same lesson page | → Same lesson page |
| Active quiz | → Same quiz, same question | → Same quiz, same question |
| Results screen | → Results screen | → Results screen |
| History screen | → History screen | → History screen |
| (root screens: login, parent, dashboard) | → Home (fallback) | → Home (fallback) |
