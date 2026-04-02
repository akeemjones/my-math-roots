# Soft Gate UI Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all soft-gate / signup-nudge modals to use a transparent frosted-glass overlay (no dark dim), consistent messaging, and tap-outside dismissal — backed by a shared CSS class and a two-line JS helper.

**Architecture:** A `.nudge-overlay` CSS class owns the wrapper styling (transparent + 4px backdrop blur). A `_makeNudgeOverlay(id, dismissable)` helper creates and appends the wrapper element, wiring up the click-outside handler when `dismissable` is true. Each caller (`_showSignupNudge`, `_showSoftGate`) populates the wrapper's `innerHTML` with its own content, so the helper stays small and each modal retains full control of its internals.

**Tech Stack:** Vanilla JS, CSS custom properties, Web Animations API (existing `_animateModalOpen`/`_animateModalClose`). No new dependencies.

---

## File Map

| File | Change |
|------|--------|
| `src/styles.css` | Add `.nudge-overlay` class + dark-mode variant |
| `src/auth.js` | Add `_makeNudgeOverlay()` helper; refactor `_showSignupNudge()` and `_showSoftGate()` to use it |
| `src/boot.js` | No change — helper is internal, not called from HTML onclick |

---

### Task 1: Add `.nudge-overlay` CSS class

**Files:**
- Modify: `src/styles.css` (append near the `/* ── Modal card */` block, around line 1989)

- [ ] **Step 1: Locate the insertion point**

Open `src/styles.css` and find the comment `/* ── Modal card — light mode glass ──` (around line 1989). You will insert the new block just before it.

- [ ] **Step 2: Add the CSS**

Insert the following block immediately before the `/* ── Modal card */` comment:

```css
/* ── Nudge overlay — transparent glass wrapper for soft-gate / signup-nudge modals ── */
.nudge-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-soft-gate);  /* 9800 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
body.dark .nudge-overlay {
  background: rgba(0,0,0,0.10);
}
```

- [ ] **Step 3: Build and spot-check**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected output ends with: `🚀 Build complete → dist/`

Open DevTools → Sources → `dist/app.js`, search for `.nudge-overlay`. Confirm the rule is present.

- [ ] **Step 4: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/styles.css
git commit -m "feat: add .nudge-overlay CSS class for transparent glass modal wrapper"
```

---

### Task 2: Add `_makeNudgeOverlay()` helper to `src/auth.js`

**Files:**
- Modify: `src/auth.js` (insert before `_showSoftGate`, around line 861)

- [ ] **Step 1: Locate insertion point**

In `src/auth.js`, find the line `function _showSoftGate(){` (around line 861). Insert the new helper immediately before it.

- [ ] **Step 2: Write the helper**

```js
// Creates a .nudge-overlay wrapper, appends to body, returns the element.
// If dismissable=true, clicking outside the inner card removes the overlay.
function _makeNudgeOverlay(id, dismissable){
  if(document.getElementById(id)) return null;
  const el = document.createElement('div');
  el.id = id;
  el.className = 'nudge-overlay';
  if(dismissable){
    el.addEventListener('click', function(e){ if(e.target === el) el.remove(); });
  }
  document.body.appendChild(el);
  return el;
}
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify in browser console**

Navigate to `http://localhost:3001`, open DevTools console, run:

```js
// Should create a div#test-overlay with class nudge-overlay and append to body
const el = _makeNudgeOverlay('test-overlay', true);
console.assert(el !== null, 'should return element');
console.assert(el.className === 'nudge-overlay', 'should have nudge-overlay class');
console.assert(document.getElementById('test-overlay') === el, 'should be in DOM');
// Calling again with same id should return null (idempotent guard)
console.assert(_makeNudgeOverlay('test-overlay', true) === null, 'should be idempotent');
// Dismiss by simulating click on overlay itself
el.click();
console.assert(!document.getElementById('test-overlay'), 'should be removed on outside click');
console.log('_makeNudgeOverlay: all assertions passed');
```

Expected console output: `_makeNudgeOverlay: all assertions passed`

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/auth.js
git commit -m "feat: add _makeNudgeOverlay() shared helper for soft-gate modals"
```

---

### Task 3: Refactor `_showSignupNudge()` — use helper + fix messaging

**Files:**
- Modify: `src/auth.js` lines ~832–859

The current function sets `Object.assign(overlay.style, {...background:'rgba(0,0,0,.52)'...})` and uses the heading "Great work on that lesson!" — both need to change.

- [ ] **Step 1: Replace the function body**

Find the current `function _showSignupNudge(){` block (lines ~832–859) and replace the entire function with:

```js
function _showSignupNudge(){
  const overlay = _makeNudgeOverlay('signup-nudge-modal', true);
  if(!overlay) return;
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:#0d1e35;box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.08)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.95) 0%,rgba(240,248,255,0.88) 100%);box-shadow:0 8px 40px rgba(60,120,200,0.18),0 2px 12px rgba(0,0,0,0.08),inset 0 1.5px 0 rgba(255,255,255,0.98)';
  overlay.innerHTML = `<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;${_bg};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:2.4rem;margin-bottom:8px">🌟</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Save Your Progress!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:10px;line-height:1.6">Create a free account to save your scores and unlock all features — it only takes 30 seconds!</div>
    </div>
    <button onclick="document.getElementById('signup-nudge-modal').remove();show('login-screen');_lsSwitchTab('signup');"
      style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#4a90d9,#27ae60);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px;letter-spacing:.3px;touch-action:manipulation">
      Create a Free Account →
    </button>
    <div style="text-align:center">
      <button onclick="document.getElementById('signup-nudge-modal').remove()"
        style="background:none;border:none;color:var(--txt2,#888);font-size:var(--fs-sm);cursor:pointer;text-decoration:underline;font-family:inherit;touch-action:manipulation">
        Maybe later
      </button>
    </div>
  </div>`;
}
```

- [ ] **Step 2: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 3: Verify in browser — transparent overlay + new message**

In browser console (after cache-busting reload: `window.location.href = 'http://localhost:3001/?v=' + Date.now()`):

```js
// Trigger the nudge
_showSignupNudge();
const overlay = document.getElementById('signup-nudge-modal');
// 1. Overlay background should NOT be the old dark color
console.assert(!overlay.style.background.includes('rgba(0,0,0'), 'overlay should not be dark');
// 2. Overlay should have nudge-overlay class
console.assert(overlay.classList.contains('nudge-overlay'), 'should have nudge-overlay class');
// 3. Title text should be the new message
console.assert(overlay.innerHTML.includes('Save Your Progress'), 'should show new title');
// 4. Tap outside: simulate click on overlay itself
overlay.click();
console.assert(!document.getElementById('signup-nudge-modal'), 'should dismiss on outside tap');
console.log('_showSignupNudge: all assertions passed');
```

Expected: `_showSignupNudge: all assertions passed`

- [ ] **Step 4: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/auth.js
git commit -m "feat: refactor _showSignupNudge to use nudge-overlay — transparent glass, fixed messaging, tap-outside dismiss"
```

---

### Task 4: Refactor `_showSoftGate()` — use helper, keep consent form, no dismiss on outside tap

**Files:**
- Modify: `src/auth.js` lines ~861–888

The current function also uses `Object.assign(overlay.style, {...background:'rgba(0,0,0,.52)'...})`. Replace the wrapper creation with `_makeNudgeOverlay`. The consent form content is unchanged.

- [ ] **Step 1: Replace the overlay creation lines**

Find `function _showSoftGate(){` (lines ~861–888). Replace **only** the lines that create and configure the `overlay` variable:

**Remove these 4 lines:**
```js
  const overlay = document.createElement('div');
  overlay.id = 'soft-gate-modal';
  Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9800',background:'rgba(0,0,0,.52)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'});
  overlay.innerHTML = `...`;
  document.body.appendChild(overlay);
```

**Replace with:**
```js
  const overlay = _makeNudgeOverlay('soft-gate-modal', false);  // false = no tap-outside dismiss (consent required)
  if(!overlay) return;
  overlay.innerHTML = `<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;${_bg};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
    <div style="text-align:center;margin-bottom:22px">
      <div style="font-size:2.2rem;margin-bottom:8px">👋</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Welcome to My Math Roots!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:8px;line-height:1.55">This app is designed for K–5 students.<br>A quick note for parents before you begin.</div>
    </div>
    <div style="margin-bottom:18px">
      <label id="sg-consent-label" style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:var(--fs-sm);color:var(--txt,#222);line-height:1.45;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(120,160,220,0.3);background:rgba(255,255,255,0.55)">
        <input type="checkbox" id="sg-consent" style="margin-top:2px;flex-shrink:0;width:17px;height:17px;cursor:pointer;accent-color:#ff6b00">
        <span>I am a parent or guardian of the child using this app</span>
      </label>
      <div style="margin-top:8px;font-size:var(--fs-xs);color:var(--txt2,#888);text-align:center;line-height:1.5">By continuing, you agree to our <a href="./privacy.html" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Privacy Policy</a> and <a href="./terms.html" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Terms of Service</a>.</div>
    </div>
    <div id="sg-msg" style="font-size:var(--fs-sm);color:#e74c3c;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>
    <button onclick="_guestConsentContinue()" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff6b00,#e05200);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px;letter-spacing:.3px;touch-action:manipulation">Continue as Guest →</button>
    <button onclick="document.getElementById('soft-gate-modal').remove();show('login-screen');_lsSwitchTab('signup');" style="width:100%;padding:12px;border-radius:14px;border:2px solid #4a90d9;background:transparent;color:#4a90d9;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);cursor:pointer;margin-bottom:6px;touch-action:manipulation">Create a Free Account</button>
  </div>`;
```

- [ ] **Step 2: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 3: Verify in browser — transparent overlay, consent gate cannot be dismissed by tapping outside**

```js
// Force soft gate (simulate guest flow)
_showSoftGate();
const sg = document.getElementById('soft-gate-modal');
console.assert(sg !== null, 'soft gate should be present');
console.assert(sg.classList.contains('nudge-overlay'), 'should have nudge-overlay class');
// Tap outside should NOT dismiss soft gate
sg.click();
console.assert(document.getElementById('soft-gate-modal') !== null, 'soft gate should NOT dismiss on outside tap');
// Consent checkbox should be present
console.assert(document.getElementById('sg-consent') !== null, 'consent checkbox should be present');
// Clean up
document.getElementById('soft-gate-modal').remove();
console.log('_showSoftGate: all assertions passed');
```

Expected: `_showSoftGate: all assertions passed`

- [ ] **Step 4: Visual screenshot check**

In the preview at `http://localhost:3001`, trigger `_showSoftGate()` from console. Confirm:
- Background behind the modal is blurred but app content is visible (not blacked out)
- Modal card has glass appearance
- Consent checkbox, "Continue as Guest →", and "Create a Free Account" buttons are present

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/auth.js
git commit -m "feat: refactor _showSoftGate to use nudge-overlay — transparent glass, consent gate remains non-dismissable"
```

---

### Task 5: Final build and end-to-end verification

**Files:** None — build and verify only.

- [ ] **Step 1: Clean build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 2: Cache-bust and reload**

In DevTools console:
```js
window.location.href = 'http://localhost:3001/?v=' + Date.now();
```

- [ ] **Step 3: Check for console errors**

Open DevTools → Console. Filter to Errors. Confirm: no errors on load.

- [ ] **Step 4: Signup nudge flow**

```js
// Trigger nudge manually
_showSignupNudge();
```

Confirm visually:
- App content is visible (blurred, not dimmed to black) behind the modal
- Title reads "Save Your Progress!"
- Tapping the blurred area behind the card closes the modal
- "Create a Free Account →" and "Maybe later" buttons present

- [ ] **Step 5: Soft gate flow**

Tap "Continue without an account" (or call `_showSoftGate()` in console). Confirm:
- Same transparent glass appearance as nudge
- Tapping outside does NOT close the modal (consent is required)
- Checking checkbox + "Continue as Guest →" proceeds correctly
- "Create a Free Account" button takes user to signup tab

- [ ] **Step 6: Unit lock toast (regression)**

Sign in as guest (complete soft gate). Tap any locked unit's lock icon. Confirm:
- Toast appears: "Unit unlocking is only available to account holders — create a free account!"
- No PIN modal appears

- [ ] **Step 7: Final commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add -A
git commit -m "chore: final build verification for soft gate UI standardization"
```
