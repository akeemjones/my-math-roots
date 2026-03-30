# SEC-3: Remove `unsafe-inline` from CSP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all inline `onclick=` handlers to `data-action` event delegation, then remove `'unsafe-inline'` from `script-src` in the Content Security Policy.

**Architecture:** Three sequential phases — (1) fix missing entries in `events.js`, (2) replace `onclick=` in `index.html` and JS template literals with `data-action` attributes, (3) drop `'unsafe-inline'` from `netlify.toml`. The `data-action` delegation system in `src/events.js` already handles both static and dynamically-injected HTML via `document.addEventListener('click', ..., true)` at the document root.

**Tech Stack:** Vanilla JS PWA, no bundler. Source in `src/`, built by `node build.js` → `dist/`. Preview at `http://localhost:3001`. CSP defined in `netlify.toml`.

---

## File Map

| File | Change |
|------|--------|
| `src/events.js` | Add 7 missing actions; fix `_softGateShowLogin` |
| `index.html` | ~112 `onclick=` → `data-action` attributes |
| `src/auth.js` | 6 template literal `onclick=` → `data-action` |
| `src/home.js` | 12 template literal `onclick=` → `data-action` |
| `src/settings.js` | 7 template literal `onclick=` → `data-action` |
| `src/quiz.js` | 13 template literal `onclick=` → `data-action` |
| `netlify.toml` | Remove `'unsafe-inline'` from `script-src` |

---

### Task 1: Fix missing actions in `src/events.js`

**Files:**
- Modify: `src/events.js` (lines 54–161)

The `_ACTIONS` registry in `events.js` is missing 7 entries and has one entry with a bug. Fix all of these before touching any HTML.

- [ ] **Step 1: Read the current registry**

Read `src/events.js` lines 54–65 to confirm the current soft-gate block:
```js
_submitSoftGate:        ()    => _submitSoftGate(),
_skipSoftGate:          ()    => _skipSoftGate(),
_softGateShowLogin:     ()    => { document.getElementById('soft-gate-modal')?.remove(); show('login-screen'); },
_softGateClose:         ()    => { document.getElementById('soft-gate-modal')?.remove(); },
```

- [ ] **Step 2: Fix `_softGateShowLogin` — add missing `_lsSwitchTab('signup')` call**

Find this exact string:
```js
    _softGateShowLogin:     ()    => { document.getElementById('soft-gate-modal')?.remove(); show('login-screen'); },
```

Replace with:
```js
    _softGateShowLogin:     ()    => { document.getElementById('soft-gate-modal')?.remove(); show('login-screen'); _lsSwitchTab('signup'); },
```

- [ ] **Step 3: Add 7 missing actions**

Find the streak calendar block (around line 152):
```js
    // ── Streak calendar ──────────────────────────────────────────────────────
    _openStreakCal:         ()    => _openStreakCal(),
    _closeStreakCal:        ()    => _closeStreakCal(),
    _streakCalNav:          (a)   => _streakCalNav(Number(a)),
    _showDayDetail:         (a)   => _showDayDetail(a),
```

Replace with (adds `_buildStreakCal`):
```js
    // ── Streak calendar ──────────────────────────────────────────────────────
    _openStreakCal:         ()    => _openStreakCal(),
    _closeStreakCal:        ()    => _closeStreakCal(),
    _buildStreakCal:        ()    => _buildStreakCal(),
    _streakCalNav:          (a)   => _streakCalNav(Number(a)),
    _showDayDetail:         (a)   => _showDayDetail(a),
```

Then find the soft-gate block (after the fix in Step 2) and add `_guestConsentContinue`:
```js
    // ── Soft gate (email lead capture) ──────────────────────────────────────
    _submitSoftGate:        ()    => _submitSoftGate(),
    _skipSoftGate:          ()    => _skipSoftGate(),
    _guestConsentContinue:  ()    => _guestConsentContinue(),
    // Multi-step soft-gate actions (compound: remove modal + navigate)
    _softGateShowLogin:     ()    => { document.getElementById('soft-gate-modal')?.remove(); show('login-screen'); _lsSwitchTab('signup'); },
    _softGateClose:         ()    => { document.getElementById('soft-gate-modal')?.remove(); },
    // Signup nudge modal actions
    nudgeModalSignup:       ()    => { document.getElementById('signup-nudge-modal')?.remove(); show('login-screen'); _lsSwitchTab('signup'); },
    nudgeModalDismiss:      ()    => { document.getElementById('signup-nudge-modal')?.remove(); },
```

Then find the Quiz block (around line 61) and add `_pickAnswer`, `_practiceWeak`, and `fetchAIHint`:
```js
    // ── Quiz ────────────────────────────────────────────────────────────────
    nextQ:                  ()    => nextQ(),
    prevQ:                  ()    => prevQ(),
    _pickAnswer:            (a)   => _pickAnswer(Number(a)),
    _practiceWeak:          ()    => _practiceWeak(),
    fetchAIHint:            (revId, dataJson) => { const {q,chosen,correct} = JSON.parse(dataJson); _fetchAIHint(revId, q, chosen, correct); },
    restartQuiz:            ()    => restartQuiz(),
```

- [ ] **Step 4: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 5: Verify new actions work in browser console**

Navigate to `http://localhost:3001`, open DevTools → Console, run:
```js
// Trigger a simple new action
window.location.reload();
```
After reload:
```js
// Test nudgeModalDismiss by manually injecting a fake modal
const el = document.createElement('div');
el.id = 'signup-nudge-modal';
document.body.appendChild(el);
// Trigger via data-action click
const btn = document.createElement('button');
btn.dataset.action = 'nudgeModalDismiss';
document.body.appendChild(btn);
btn.click();
console.assert(!document.getElementById('signup-nudge-modal'), 'nudgeModalDismiss should remove modal');
btn.remove();
console.log('Task 1: nudgeModalDismiss ✓');
```

Expected: `Task 1: nudgeModalDismiss ✓` with no errors.

- [ ] **Step 6: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/events.js
git commit -m "feat: add missing data-action handlers to events.js — nudge modals, _pickAnswer, _practiceWeak, fetchAIHint, _buildStreakCal (SEC-3)"
```

---

### Task 2: Migrate `index.html` static inline handlers — Phase 1

**Files:**
- Modify: `index.html` (~112 `onclick=` attributes)

**Pattern:** Every `onclick="fn()"` → `data-action="fn"`. Arguments → `data-arg` / `data-arg2`.

```html
<!-- Before -->
<button onclick="goSettings()">Settings</button>
<button onclick="_lsSwitchTab('login')">Log In</button>
<button onclick="openUnit(2)">Unit 2</button>

<!-- After -->
<button data-action="goSettings">Settings</button>
<button data-action="_lsSwitchTab" data-arg="login">Log In</button>
<button data-action="openUnit" data-arg="2">Unit 2</button>
```

- [ ] **Step 1: Count current onclick= attributes in index.html**

```bash
grep -c "onclick=" "E:\Cameron Jones\my-math-roots\index.html"
```

Record the number. After migration it must be 0.

- [ ] **Step 2: Migrate all onclick= in index.html**

Open `index.html`. For every `onclick="..."` attribute, apply the following transformation rules:

**Rule 1 — No-arg functions:** Remove `onclick="fn()"`, add `data-action="fn"`.
```html
onclick="goSettings()"          → data-action="goSettings"
onclick="goHome()"              → data-action="goHome"
onclick="goHistory()"           → data-action="goHistory"
onclick="_lsSubmit()"           → data-action="_lsSubmit"
onclick="_lsTogglePw()"         → data-action="_lsTogglePw"
onclick="_lsResend()"           → data-action="_lsResend"
onclick="_lsForgotPassword()"   → data-action="_lsForgotPassword"
onclick="_continueAsGuest()"    → data-action="_continueAsGuest"
onclick="quitQuiz()"            → data-action="quitQuiz"
onclick="restartQuiz()"         → data-action="restartQuiz"
onclick="openScratchPad()"      → data-action="openScratchPad"
onclick="showQuitConfirm()"     → data-action="showQuitConfirm"
onclick="cancelQuit()"          → data-action="cancelQuit"
onclick="confirmQuit()"         → data-action="confirmQuit"
onclick="nextQ()"               → data-action="nextQ"
onclick="prevQ()"               → data-action="prevQ"
onclick="cancelRestart()"       → data-action="cancelRestart"
onclick="confirmRestart()"      → data-action="confirmRestart"
onclick="supaSignOut()"         → data-action="supaSignOut"
onclick="syncNow()"             → data-action="syncNow"
onclick="showInstall()"         → data-action="showInstall"
onclick="closeInstall()"        → data-action="closeInstall"
onclick="openPinModal()"        → data-action="openPinModal"
onclick="closePinModal()"       → data-action="closePinModal"
onclick="openTimerModal()"      → data-action="openTimerModal"
onclick="closeTimerModal()"     → data-action="closeTimerModal"
onclick="openA11yModal()"       → data-action="openA11yModal"
onclick="closeA11yModal()"      → data-action="closeA11yModal"
onclick="openForgotPin()"       → data-action="openForgotPin"
onclick="closeForgotPin()"      → data-action="closeForgotPin"
onclick="refreshForgotProblem()"→ data-action="refreshForgotProblem"
onclick="checkForgotAnswer()"   → data-action="checkForgotAnswer"
onclick="closeUnitPinModal()"   → data-action="closeUnitPinModal"
onclick="checkUnitPinUnlock()"  → data-action="checkUnitPinUnlock"
onclick="checkLessonPinUnlock()"→ data-action="checkLessonPinUnlock"
onclick="goParentControls()"    → data-action="goParentControls"
onclick="openProgressReport()"  → data-action="openProgressReport"
onclick="closeProgressReport()" → data-action="closeProgressReport"
onclick="closeScratchPad()"     → data-action="closeScratchPad"
onclick="clearScratchPad()"     → data-action="clearScratchPad"
onclick="morePractice()"        → data-action="morePractice"
onclick="tutNext()"             → data-action="tutNext"
onclick="tutBack()"             → data-action="tutBack"
onclick="tutSkip()"             → data-action="tutSkip"
onclick="closeScLightbox()"     → data-action="closeScLightbox"
onclick="clearAll()"            → data-action="clearAll"
onclick="closeCoinLightbox()"   → data-action="closeCoinLightbox"
onclick="closeAccessModal()"    → data-action="closeAccessModal"
onclick="_cancelAccessConfirm()"→ data-action="_cancelAccessConfirm"
onclick="_executeAccessConfirm()"→ data-action="_executeAccessConfirm"
onclick="startFinalTest()"      → data-action="startFinalTest"
onclick="retryQuiz()"           → data-action="retryQuiz"
onclick="afterResults()"        → data-action="afterResults"
onclick="openAuthModal()"       → data-action="openAuthModal"
onclick="closeAuthModal()"      → data-action="closeAuthModal"
onclick="submitAuth()"          → data-action="submitAuth"
onclick="buildRevSection()"     → data-action="buildRevSection"
```

**Rule 2 — Single string arg:** Add `data-arg="value"`.
```html
onclick="_lsOAuth('google')"         → data-action="_lsOAuth" data-arg="google"
onclick="_lsSwitchTab('login')"      → data-action="_lsSwitchTab" data-arg="login"
onclick="_lsSwitchTab('signup')"     → data-action="_lsSwitchTab" data-arg="signup"
onclick="show('some-screen')"        → data-action="show" data-arg="some-screen"
onclick="setSound('on')"             → data-action="setSound" data-arg="on"
onclick="setTheme('dark')"           → data-action="setTheme" data-arg="dark"
onclick="switchInstallTab('ios')"    → data-action="switchInstallTab" data-arg="ios"
onclick="setScratchColor('#000')"    → data-action="setScratchColor" data-arg="#000"
onclick="setScratchTool('pen')"      → data-action="setScratchTool" data-arg="pen"
onclick="openAccessModal('feature')" → data-action="openAccessModal" data-arg="feature"
onclick="_showAccessConfirm('x')"    → data-action="_showAccessConfirm" data-arg="x"
onclick="setFilt('all')"             → data-action="setFilt" data-arg="all"
onclick="toggleA11y('contrast')"     → data-action="toggleA11y" data-arg="contrast"
onclick="openScLightbox(3)"          → data-action="openScLightbox" data-arg="3"
onclick="openCoinLightbox('gold')"   → data-action="openCoinLightbox" data-arg="gold"
onclick="delScore(5)"                → data-action="delScore" data-arg="5"
onclick="resumeQuiz('final_test')"   → data-action="resumeQuiz" data-arg="final_test"
onclick="openUnit(2)"                → data-action="openUnit" data-arg="2"
onclick="openUnitPinUnlock(2)"       → data-action="openUnitPinUnlock" data-arg="2"
onclick="toggleRS('section-id')"     → data-action="toggleRS" data-arg="section-id"
onclick="revealPQ(0)"                → data-action="revealPQ" data-arg="0"
onclick="togglePQ(0)"                → data-action="togglePQ" data-arg="0"
onclick="_streakCalNav(-1)"          → data-action="_streakCalNav" data-arg="-1"
onclick="_streakCalNav(1)"           → data-action="_streakCalNav" data-arg="1"
onclick="_switchAuthTab('login')"    → data-action="_switchAuthTab" data-arg="login"
```

**Rule 3 — Two args:**
```html
onclick="openLesson(0, 1)"           → data-action="openLesson" data-arg="0" data-arg2="1"
onclick="openLessonPinUnlock(0, 1)"  → data-action="openLessonPinUnlock" data-arg="0" data-arg2="1"
onclick="showLockToast('msg', true)" → data-action="showLockToast" data-arg="msg" data-arg2="true"
```

**Rule 4 — `window.print()`:** Use the `windowPrint` action:
```html
onclick="window.print()"             → data-action="windowPrint"
```

For any `onclick=` not in the list above: look up the function name in `src/events.js`. If the action exists, map it. If it does not exist, add it to `events.js` first (following Task 1 pattern), then map it.

- [ ] **Step 3: Verify zero onclick= remain**

```bash
grep -c "onclick=" "E:\Cameron Jones\my-math-roots\index.html"
```

Expected: `0`

- [ ] **Step 4: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 5: Smoke-test Phase 1 in browser**

Load `http://localhost:3001` (cache-bust: `window.location.href = 'http://localhost:3001/?cb=' + Date.now()`).

Exercise every static button:
- Settings gear icon → opens settings
- Login tab / Signup tab → switch tabs correctly
- Google OAuth button → triggers Google OAuth (or shows error if not configured)
- "Continue without account" button → triggers guest flow
- Nav bar back buttons (Unit, Lesson, Quiz) → navigate correctly
- History button on home → opens score history
- Scratch pad buttons (if in quiz) → open/close/clear

Open DevTools → Console → confirm zero errors.

- [ ] **Step 6: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add index.html
git commit -m "feat: migrate index.html onclick= to data-action delegation — Phase 1 of SEC-3"
```

---

### Task 3: Migrate `src/auth.js` template literal handlers — Phase 2a

**Files:**
- Modify: `src/auth.js` (lines 574, 760, 773, 776, 845, 850, 894, 895)

- [ ] **Step 1: Read the relevant lines**

Read `src/auth.js` lines 570–580 (streak cal back button), then lines 755–765 (day cell), then lines 840–900 (nudge and soft gate modals).

- [ ] **Step 2: Fix line ~574 — streak calendar back button**

Find:
```js
onclick="_buildStreakCal()"
```
Replace with:
```js
data-action="_buildStreakCal"
```

- [ ] **Step 3: Fix line ~760 — calendar day cell**

Find:
```js
onclick="_showDayDetail('${ds}')"
```
Replace with:
```js
data-action="_showDayDetail" data-arg="${ds}"
```

- [ ] **Step 4: Fix lines ~773 and ~776 — calendar navigation buttons**

Find:
```js
onclick="_streakCalNav(-1)"
```
Replace with:
```js
data-action="_streakCalNav" data-arg="-1"
```

Find:
```js
onclick="_streakCalNav(1)"
```
Replace with:
```js
data-action="_streakCalNav" data-arg="1"
```

- [ ] **Step 5: Fix line ~845 — signup nudge "Create Account" button**

Find:
```js
onclick="document.getElementById('signup-nudge-modal').remove();show('login-screen');_lsSwitchTab('signup');"
```
Replace with:
```js
data-action="nudgeModalSignup"
```

- [ ] **Step 6: Fix line ~850 — signup nudge "Maybe later" button**

Find:
```js
onclick="document.getElementById('signup-nudge-modal').remove()"
```
Replace with:
```js
data-action="nudgeModalDismiss"
```

- [ ] **Step 7: Fix line ~894 — soft gate "Continue as Guest" button**

Find:
```js
onclick="_guestConsentContinue()"
```
Replace with:
```js
data-action="_guestConsentContinue"
```

- [ ] **Step 8: Fix line ~895 — soft gate "Create a Free Account" button**

Find:
```js
onclick="document.getElementById('soft-gate-modal').remove();show('login-screen');_lsSwitchTab('signup');"
```
Replace with:
```js
data-action="_softGateShowLogin"
```

- [ ] **Step 9: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 10: Verify modals in browser**

After cache-bust reload:
```js
// Test signup nudge
_showSignupNudge();
const nudge = document.getElementById('signup-nudge-modal');
console.assert(nudge, 'nudge modal should appear');
// "Maybe later" button must dismiss
nudge.querySelector('[data-action="nudgeModalDismiss"]').click();
console.assert(!document.getElementById('signup-nudge-modal'), 'nudge should be gone');
// Test soft gate
_showSoftGate();
const gate = document.getElementById('soft-gate-modal');
console.assert(gate, 'soft gate should appear');
console.assert(gate.querySelector('[data-action="_guestConsentContinue"]'), 'guest continue button must use data-action');
console.assert(gate.querySelector('[data-action="_softGateShowLogin"]'), 'create account button must use data-action');
document.getElementById('soft-gate-modal')?.remove();
console.log('Task 3: auth.js modals ✓');
```

Expected: `Task 3: auth.js modals ✓`

- [ ] **Step 11: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/auth.js
git commit -m "feat: migrate auth.js template literal onclick= to data-action (SEC-3)"
```

---

### Task 4: Migrate `src/home.js` template literal handlers — Phase 2b

**Files:**
- Modify: `src/home.js` (lines 53, 57, 63, 77, 105, 110, 114, 127, 205, 209, 214, 224, 267, 278, 283, 287)

These handlers appear in both `buildHome()` and `refreshHomeState()` — both must be updated.

- [ ] **Step 1: Read home.js lines 48–135 and 200–295**

Confirm the exact onclick= strings before editing.

- [ ] **Step 2: Migrate all handlers**

Apply these replacements throughout `src/home.js`:

**Locked unit toast:**
```js
// Before:
onclick="showLockToast('Finish Unit ${i} with 80%+ to unlock!', true)"
// After:
data-action="showLockToast" data-arg="Finish Unit ${i} with 80%+ to unlock!" data-arg2="true"
```

**Parent unlock button:**
```js
// Before:
onclick="openUnitPinUnlock(${i})"
// After:
data-action="openUnitPinUnlock" data-arg="${i}"
```

**Open unit (active or done):**
```js
// Before:
onclick="openUnit(${i})"
// After:
data-action="openUnit" data-arg="${i}"
```

**Final Test — locked toast:**
```js
// Before:
onclick="showLockToast('Unlock all units to take the Final Test!', true)"
// After:
data-action="showLockToast" data-arg="Unlock all units to take the Final Test!" data-arg2="true"
```

**Resume final test:**
```js
// Before:
onclick="resumeQuiz('final_test')"
// After:
data-action="resumeQuiz" data-arg="final_test"
```

**Start final test:**
```js
// Before:
onclick="startFinalTest()"
// After:
data-action="startFinalTest"
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify home carousel in browser**

After reload, on the home screen:
- Tap an active unit card → opens unit
- Tap a locked unit's lock icon → shows toast "Finish Unit X with 80%+ to unlock!"
- If Final Test visible → tap it and confirm navigation
- Open DevTools → zero errors

```bash
grep -n "onclick=" "E:\Cameron Jones\my-math-roots\src\home.js"
```

Expected: no output (zero remaining onclick=).

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/home.js
git commit -m "feat: migrate home.js template literal onclick= to data-action (SEC-3)"
```

---

### Task 5: Migrate `src/settings.js` template literal handlers — Phase 2c

**Files:**
- Modify: `src/settings.js` (lines 285, 373, 487, 488, 520, 521, 610)

- [ ] **Step 1: Read settings.js lines 280–295, 368–380, 482–525, 605–615**

Confirm the exact onclick= strings.

- [ ] **Step 2: Migrate all handlers**

**Progress report score row (line ~285):**
```js
// Before:
onclick="openPrReview(${s.id})"
// After:
data-action="openPrReview" data-arg="${s.id}"
```

**Generate report button (line ~373):**
```js
// Before:
onclick="generateAIReport()"
// After:
data-action="generateAIReport"
```

**Back to stats / Try again in error state (lines ~487–488):**
```js
// Before:
onclick="_backToProgressStats()"
// After:
data-action="_backToProgressStats"

// Before:
onclick="generateAIReport()"
// After:
data-action="generateAIReport"
```

**Back to stats / Download PDF in success footer (lines ~520–521):**
```js
// Before:
onclick="_backToProgressStats()"
// After:
data-action="_backToProgressStats"

// Before:
onclick="downloadReportPDF()"
// After:
data-action="downloadReportPDF"
```

**Save as PDF button (line ~610):**
```js
// Before:
onclick="window.print()"
// After:
data-action="windowPrint"
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify**

```bash
grep -n "onclick=" "E:\Cameron Jones\my-math-roots\src\settings.js"
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/settings.js
git commit -m "feat: migrate settings.js template literal onclick= to data-action (SEC-3)"
```

---

### Task 6: Migrate `src/quiz.js` template literal handlers — Phase 2d

**Files:**
- Modify: `src/quiz.js` (lines 438, 503, 614, 628, 643, 809, 814, 822, 830, 835, 836)

- [ ] **Step 1: Read quiz.js lines 433–445, 498–510, 608–650, 805–840**

Confirm the exact onclick= strings.

- [ ] **Step 2: Migrate answer buttons (line ~438)**

The answer buttons use string concatenation (not template literals):
```js
// Before:
'<button class="abtn" type="button" onclick="_pickAnswer('+i+')" id="abtn-'+i+'" ...'

// After:
'<button class="abtn" type="button" data-action="_pickAnswer" data-arg="'+i+'" id="abtn-'+i+'" ...'
```

- [ ] **Step 3: Migrate AI hint button (line ~503)**

This is the complex JSON-arg case. Current code:
```js
'<button class="ai-hint-btn" onclick="_fetchAIHint(\''+revId+'\','+_escHtml(JSON.stringify(q.t))+','+_escHtml(JSON.stringify(chosen))+','+_escHtml(JSON.stringify(correct))+')">💡 Get a Hint</button>'
```

Replace with:
```js
'<button class="ai-hint-btn" data-action="fetchAIHint" data-arg="'+_escHtml(revId)+'" data-arg2=\''+_escHtml(JSON.stringify({q:q.t,chosen,correct})).replace(/'/g,"&#39;")+'\'>💡 Get a Hint</button>'
```

Note: `data-arg2` uses single-quote delimiters because the JSON contains double quotes. The `.replace(/'/g,"&#39;")` escapes any single quotes in the JSON value so they don't break the attribute.

- [ ] **Step 4: Migrate lesson/unit navigation buttons (lines ~614, 628, 643)**

**"Go Back to" lesson button (line ~614):**
```js
// Before:
onclick="openLesson(${CUR.unitIdx},${CUR.lessonIdx})"
// After:
data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${CUR.lessonIdx}"
```

**"Review" weak lesson button (line ~628):**
```js
// Before:
onclick="openLesson(${CUR.unitIdx},${weakLesson.li})"
// After:
data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${weakLesson.li}"
```

**"Review" weak unit button (line ~643):**
```js
// Before:
onclick="openUnit(${weakUnit.ui})"
// After:
data-action="openUnit" data-arg="${weakUnit.ui}"
```

- [ ] **Step 5: Migrate results buttons (lines ~809, 814, 822, 830, 835, 836)**

**"Next Lesson" button (line ~809):**
```js
// Before:
onclick="openLesson(${CUR.unitIdx},${nextIdx})"
// After:
data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${nextIdx}"
```

**"Go to Unit Quiz" button (line ~814):**
```js
// Before:
onclick="goUnit()"
// After:
data-action="goUnit"
```

**"Next Unit" button (line ~822):**
```js
// Before:
onclick="openUnit(${nextUnitIdx})"
// After:
data-action="openUnit" data-arg="${nextUnitIdx}"
```

**"Practice Weak Topics" button (line ~830):**
```js
// Before:
onclick="_practiceWeak()"
// After:
data-action="_practiceWeak"
```

**"Try Again" button (line ~835):**
```js
// Before:
onclick="retryQuiz()"
// After:
data-action="retryQuiz"
```

**"Back to Home/Unit" button (line ~836):**
```js
// Before:
onclick="afterResults()"
// After:
data-action="afterResults"
```

- [ ] **Step 6: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 7: Verify zero onclick= remain in quiz.js**

```bash
grep -n "onclick=" "E:\Cameron Jones\my-math-roots\src\quiz.js"
```

Expected: no output.

- [ ] **Step 8: Smoke-test quiz flow in browser**

Load `http://localhost:3001`, start a quiz (Lesson 1 as guest works without login):
- Answer buttons respond when tapped → `_pickAnswer` fires
- Quit button → confirm quit dialog appears
- Results screen back button → navigates correctly
- If AI hint is visible (wrong answer) → button is present with `data-action="fetchAIHint"`
- Zero console errors throughout

- [ ] **Step 9: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/quiz.js
git commit -m "feat: migrate quiz.js template literal onclick= to data-action — includes fetchAIHint JSON-arg case (SEC-3)"
```

---

### Task 7: Remove `'unsafe-inline'` from `script-src` in `netlify.toml`

**Files:**
- Modify: `netlify.toml`

Do NOT do this task until Tasks 1–6 are complete and smoke-tested.

- [ ] **Step 1: Confirm zero onclick= remain across all source files**

```bash
grep -rn "onclick=" "E:\Cameron Jones\my-math-roots\src\" "E:\Cameron Jones\my-math-roots\index.html"
```

Expected: no output. If any results appear, fix them before continuing.

- [ ] **Step 2: Read the current CSP in netlify.toml**

Read `E:\Cameron Jones\my-math-roots\netlify.toml` lines 25–52 to confirm the exact current CSP string.

- [ ] **Step 3: Remove `'unsafe-inline'` from `script-src`**

Find:
```toml
    script-src 'self' 'unsafe-inline'
      https://cdn.jsdelivr.net
      https://accounts.google.com
      https://challenges.cloudflare.com;
```

Replace with:
```toml
    script-src 'self'
      https://cdn.jsdelivr.net
      https://accounts.google.com
      https://challenges.cloudflare.com;
```

- [ ] **Step 4: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add netlify.toml
git commit -m "sec: remove 'unsafe-inline' from script-src CSP — SEC-3 complete"
```

---

### Task 8: Final end-to-end verification

**Files:** None — verification only.

The CSP change only takes effect when served with the actual HTTP headers. For local verification, use the DevTools Network tab to confirm headers, or deploy to Netlify preview.

- [ ] **Step 1: Check no onclick= anywhere in the project**

```bash
grep -rn "onclick=" "E:\Cameron Jones\my-math-roots\src\" "E:\Cameron Jones\my-math-roots\index.html"
```

Expected: no output.

- [ ] **Step 2: Build and reload**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Reload browser: `window.location.href = 'http://localhost:3001/?cb=' + Date.now()`

- [ ] **Step 3: Full user flow smoke test**

Walk through each flow and confirm zero console errors:

1. **Home navigation** — tap settings gear, tap back, tap history, tap back
2. **Guest flow** — tap "Continue without account" → soft gate appears → check consent checkbox → tap "Continue as Guest"
3. **Lesson quiz** — open Unit 1 → open Lesson 1 → answer 3 questions → quit
4. **Signup nudge** — if it appears, tap "Maybe later" → dismisses; tap "Create a Free Account" → goes to login signup tab
5. **Login screen** — tap Login/Signup tabs, type in fields, tap back
6. **Settings** — open settings, tap Parent Controls, tap back

- [ ] **Step 4: Check for CSP violations (requires Netlify deploy)**

Deploy to Netlify preview:
```bash
cd "E:\Cameron Jones\my-math-roots"
npx netlify-cli deploy --dir=dist --site=d7bda627-be6f-4588-bc38-33a26e39bb85
```

Open the preview URL in browser. DevTools → Console → filter to Errors. Walk through the same flows as Step 3. Expected: zero `Content-Security-Policy` violation messages.

- [ ] **Step 5: Final commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add -A
git commit -m "chore: SEC-3 complete — unsafe-inline removed from script-src, all handlers migrated to data-action"
```
