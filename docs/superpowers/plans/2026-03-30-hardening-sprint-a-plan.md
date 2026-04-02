# Hardening Sprint A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement five audit fixes — SEC-2 (score signing), SEC-6 (keyed lockout), SEC-7 (preview restriction), PERF-6 (IntersectionObserver carousel), PERF-10 (scrollIntoView) — across six source files.

**Architecture:** Three independent changes: (1) `wb_app_secret` generated in boot and used by both SEC-6 lockout signing and SEC-2 score signing; (2) `_isLocal2` narrowed to strip `192.168.*`; (3) RAF scroll loop replaced by IntersectionObserver + `scrollIntoView`. All changes are synchronous except the existing Supabase push which is already async.

**Tech Stack:** Vanilla JS, no bundler, built by `node build.js` → `dist/`. Source: `src/`. Preview server at `http://localhost:3001`.

---

## File Map

| File | Changes | Issues |
|------|---------|--------|
| `src/boot.js` | Generate `wb_app_secret` on first boot (line 165, before supabaseInit); narrow `_isLocal2` (line 175) | SEC-6, SEC-7 |
| `src/settings.js` | Update `_lockoutSig()` (lines 875–883) to include `wb_app_secret` in salt | SEC-6 |
| `src/util.js` | Append `_scoreSig()` and `_scoreValid()` after line 285 | SEC-2 |
| `src/quiz.js` | Add `_sig` to score entries at lines 692, 1018, 1053 (signed-in users only) | SEC-2 |
| `src/auth.js` | Filter tampered scores in `_pushScores()` at line 999 | SEC-2 |
| `src/home.js` | Replace `updateFocus()` RAF loop in `initCarousel()` with IntersectionObserver; replace `carouselGoTo()` offsetHeight loop with `scrollIntoView` | PERF-6, PERF-10 |

---

### Task 1: Generate `wb_app_secret` in `src/boot.js`

**Files:**
- Modify: `src/boot.js` (line 165, before `supabaseInit()`)

This secret is shared by both SEC-6 (lockout signing) and SEC-2 (score signing). It must exist before either feature runs.

- [ ] **Step 1: Locate the insertion point**

Open `src/boot.js`. Find line 165:
```js
supabaseInit();
```

- [ ] **Step 2: Insert secret generation immediately before `supabaseInit()`**

Replace:
```js
supabaseInit();
```

With:
```js
// SEC-6/SEC-2: Generate per-device secret used for lockout and score signing
if(!localStorage.getItem('wb_app_secret')){
  localStorage.setItem('wb_app_secret', crypto.randomUUID());
}
supabaseInit();
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected output ends with: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify in browser console**

Navigate to `http://localhost:3001`, open DevTools → Console, run:
```js
console.assert(typeof localStorage.getItem('wb_app_secret') === 'string', 'wb_app_secret should be a string');
console.assert(localStorage.getItem('wb_app_secret').length > 0, 'wb_app_secret should not be empty');
console.log('wb_app_secret:', localStorage.getItem('wb_app_secret'));
console.log('Task 1: PASS');
```

Expected: logs the UUID and `Task 1: PASS`.

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/boot.js
git commit -m "sec: generate wb_app_secret on first boot for keyed signing (SEC-6, SEC-2)"
```

---

### Task 2: Update `_lockoutSig()` in `src/settings.js` — SEC-6

**Files:**
- Modify: `src/settings.js` (lines 875–883)

- [ ] **Step 1: Locate the function**

Open `src/settings.js`. Find the function at lines 875–883:
```js
function _lockoutSig(count, ts){
  // One-way hash — not reversible like btoa
  const str = count + ':' + ts + ':mymathroots_lockout_v2';
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}
```

- [ ] **Step 2: Replace with keyed version**

```js
function _lockoutSig(count, ts){
  const secret = localStorage.getItem('wb_app_secret') || 'fallback';
  const str = count + ':' + ts + ':mymathroots_lockout_v2:' + secret;
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify regression — pre-computed plain signature must not bypass lockout**

In DevTools console:
```js
// Compute sig WITHOUT secret (old algorithm) and write to localStorage
const oldSig = (() => {
  const str = '5:1000000:mymathroots_lockout_v2';
  let hash = 0;
  for(let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return String(hash);
})();
localStorage.setItem('wb_lockout', JSON.stringify({count:5, ts:1000000, sig:oldSig}));
// Now read it back and check: the app should NOT see it as valid
// Reload and check that the lockout counter wasn't reset
window.location.reload();
```

After reload, re-open DevTools and check:
```js
const lockout = JSON.parse(localStorage.getItem('wb_lockout') || '{}');
// The lockout entry was written with old sig — the new _lockoutSig will not match it
// Confirm wb_lockout was ignored (or the old entry is still there but won't be trusted)
console.log('Lockout entry:', lockout);
console.log('Task 2: Verify manually that PIN lockout screen is NOT bypassed by the old sig');
```

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/settings.js
git commit -m "sec: key lockout signature with wb_app_secret — pre-computation no longer feasible (SEC-6)"
```

---

### Task 3: Restrict `_isLocal2` to localhost only in `src/boot.js` — SEC-7

**Files:**
- Modify: `src/boot.js` (line 175)

The design spec notes this appears in one place (the 8-second fallback). Confirm this is the only occurrence before editing.

- [ ] **Step 1: Confirm there is only one occurrence**

```bash
cd "E:\Cameron Jones\my-math-roots"
grep -n "_isLocal" src/boot.js
```

Expected output: one line mentioning `_isLocal2` at line 175.

- [ ] **Step 2: Narrow the check**

Find line 175:
```js
    const _isLocal2 = ['localhost','127.0.0.1'].includes(location.hostname) || /^192\.168\./.test(location.hostname);
```

Replace with:
```js
    const _isLocal2 = ['localhost','127.0.0.1'].includes(location.hostname);
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify source — 192.168 pattern is gone**

```bash
cd "E:\Cameron Jones\my-math-roots"
grep -n "192" src/boot.js
```

Expected: no matches.

- [ ] **Step 5: Verify localhost preview still works**

In browser at `http://localhost:3001/?preview=1`, confirm app loads in preview mode (no broken state). This is a localhost URL so it must still work.

- [ ] **Step 6: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/boot.js
git commit -m "sec: restrict ?preview=1 bypass to localhost only — remove 192.168.* allowance (SEC-7)"
```

---

### Task 4: Add `_scoreSig()` and `_scoreValid()` to `src/util.js` — SEC-2

**Files:**
- Modify: `src/util.js` (append after line 285, the last line of the file)

- [ ] **Step 1: Confirm the insertion point**

Open `src/util.js`. Confirm line 285 is the last line (closing brace of `_migrateEmailStorage`). The new functions go immediately after.

- [ ] **Step 2: Append the helpers**

Append after line 285 (end of file):
```js

// SEC-2: Score signing — prevents tampered localStorage scores from reaching Supabase
function _scoreSig(entry){
  const secret = localStorage.getItem('wb_app_secret') || 'fallback';
  const str = (entry.qid||'') + ':' + (entry.pct||0) + ':' + (entry.id||0) + ':' + secret;
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}

function _scoreValid(entry){
  if(!entry._sig) return false;
  return entry._sig === _scoreSig(entry);
}
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify helpers are callable in browser**

In DevTools console (after cache-busting reload: `window.location.href = 'http://localhost:3001/?cb=' + Date.now()`):
```js
// Must have wb_app_secret set (Task 1 ensures this)
const fakeEntry = { qid: 'lq_u1l1', pct: 80, id: 1234567 };
const sig = _scoreSig(fakeEntry);
console.assert(typeof sig === 'string' && sig.length > 0, '_scoreSig should return a non-empty string');

// Valid entry
fakeEntry._sig = sig;
console.assert(_scoreValid(fakeEntry) === true, '_scoreValid should return true for correct sig');

// Tampered entry
const tampered = { ...fakeEntry, pct: 100, _sig: sig };
console.assert(_scoreValid(tampered) === false, '_scoreValid should return false for tampered pct');

// Entry with no sig (old data) — returns false
const nosig = { qid: 'lq_u1l1', pct: 80, id: 1234567 };
console.assert(_scoreValid(nosig) === false, '_scoreValid should return false when no _sig');

console.log('Task 4: all assertions passed');
```

Expected: `Task 4: all assertions passed`

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/util.js
git commit -m "sec: add _scoreSig() and _scoreValid() helpers for score tamper detection (SEC-2)"
```

---

### Task 5: Sign scores on write in `src/quiz.js` — SEC-2

**Files:**
- Modify: `src/quiz.js` (three locations: lines 692, 1018, 1053)

Only sign for signed-in users (`_supaUser` is truthy). Guest scores (kept only for `lq_u1l1`) are not signed because they never reach Supabase.

- [ ] **Step 1: Update completion save (line 692)**

Find (lines 692–696):
```js
  if(_supaUser || autoEntry.qid === 'lq_u1l1'){
    SCORES.unshift(autoEntry);
    if(SCORES.length>200) SCORES.pop();
    saveSc();
  }
```

Replace with:
```js
  if(_supaUser || autoEntry.qid === 'lq_u1l1'){
    if(_supaUser) autoEntry._sig = _scoreSig(autoEntry);
    SCORES.unshift(autoEntry);
    if(SCORES.length>200) SCORES.pop();
    saveSc();
  }
```

- [ ] **Step 2: Update quit save (line 1018)**

Find (lines 1018–1022):
```js
  if(_supaUser || quitEntry.qid === 'lq_u1l1'){
    SCORES.unshift(quitEntry);
    if(SCORES.length > 200) SCORES.pop();
    saveSc();
  }
```

Replace with:
```js
  if(_supaUser || quitEntry.qid === 'lq_u1l1'){
    if(_supaUser) quitEntry._sig = _scoreSig(quitEntry);
    SCORES.unshift(quitEntry);
    if(SCORES.length > 200) SCORES.pop();
    saveSc();
  }
```

- [ ] **Step 3: Update abandon save (line 1053)**

Find (lines 1053–1057):
```js
    if(_supaUser || abandonedEntry.qid === 'lq_u1l1'){
      SCORES.unshift(abandonedEntry);
      if(SCORES.length > 200) SCORES.pop();
      saveSc();
    }
```

Replace with:
```js
    if(_supaUser || abandonedEntry.qid === 'lq_u1l1'){
      if(_supaUser) abandonedEntry._sig = _scoreSig(abandonedEntry);
      SCORES.unshift(abandonedEntry);
      if(SCORES.length > 200) SCORES.pop();
      saveSc();
    }
```

- [ ] **Step 4: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 5: Verify score entry gets `_sig` after quiz completion**

Sign in as a test user, complete any quiz. Then in DevTools console:
```js
const scores = JSON.parse(localStorage.getItem('SCORES') || '[]');
const latest = scores[0];
console.assert(latest && typeof latest._sig === 'string', 'latest score should have _sig field');
console.assert(_scoreValid(latest), '_sig should be valid for untampered score');
console.log('Latest score _sig:', latest._sig);
console.log('Task 5: PASS');
```

Expected: `Task 5: PASS`

- [ ] **Step 6: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/quiz.js
git commit -m "sec: sign score entries on write for signed-in users — completion, quit, abandon paths (SEC-2)"
```

---

### Task 6: Filter tampered scores before Supabase push in `src/auth.js` — SEC-2

**Files:**
- Modify: `src/auth.js` (lines 999–1007, inside `_pushScores()`)

- [ ] **Step 1: Locate the mapping in `_pushScores()`**

Open `src/auth.js`. Find lines 999–1007:
```js
    const rows = SCORES.map(s => ({
      user_id:_supaUser.id, local_id:s.id,
      qid:s.qid||'', label:s.label||'', type:s.type||'',
      score:s.score||0, total:s.total||0, pct:s.pct||0,
      stars:s.stars||'', unit_idx:s.unitIdx??null, color:s.color||null,
      student_name:s.name||null, time_taken:s.timeTaken||null,
      answers:s.answers||[], date_str:s.date||null, time_str:s.time||null,
      quit:!!s.quit, abandoned:!!s.abandoned
    }));
```

- [ ] **Step 2: Add filter before the map**

Replace the block above with:
```js
    // Filter out entries with a _sig that doesn't verify. Entries without _sig pass through (backwards compat).
    const verifiedScores = SCORES.filter(s => !s._sig || _scoreValid(s));
    const rows = verifiedScores.map(s => ({
      user_id:_supaUser.id, local_id:s.id,
      qid:s.qid||'', label:s.label||'', type:s.type||'',
      score:s.score||0, total:s.total||0, pct:s.pct||0,
      stars:s.stars||'', unit_idx:s.unitIdx??null, color:s.color||null,
      student_name:s.name||null, time_taken:s.timeTaken||null,
      answers:s.answers||[], date_str:s.date||null, time_str:s.time||null,
      quit:!!s.quit, abandoned:!!s.abandoned
    }));
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify tampered score is rejected**

Sign in, complete a quiz (score entry now has `_sig`). Then in DevTools console:
```js
const scores = JSON.parse(localStorage.getItem('SCORES') || '[]');
// Tamper with the first score
const tampered = [...scores];
tampered[0] = { ...tampered[0], pct: 100 }; // _sig still references old pct
localStorage.setItem('SCORES', JSON.stringify(tampered));
// Reload SCORES into memory and run the filter manually
const reloaded = JSON.parse(localStorage.getItem('SCORES') || '[]');
const verified = reloaded.filter(s => !s._sig || _scoreValid(s));
console.assert(verified.length < reloaded.length || !reloaded[0]._sig, 'tampered score should be filtered out');
console.log('Verified scores count:', verified.length, '/', reloaded.length);
console.log('Task 6: PASS if verified count is less than total (tampered entry filtered)');
```

Expected: `verified count` is `total - 1` (the tampered entry removed).

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/auth.js
git commit -m "sec: filter tampered scores before Supabase push in _pushScores() (SEC-2)"
```

---

### Task 7: Replace RAF scroll loop with IntersectionObserver in `src/home.js` — PERF-6

**Files:**
- Modify: `src/home.js` — `initCarousel()` (lines 319–379)

The current `initCarousel()` uses `updateFocus()` which calls `getBoundingClientRect()` on every slide per animation frame. Replace with `IntersectionObserver` that fires only when visibility crosses a threshold.

Note: `updateFocus()` also applies `scale` and `opacity` transforms and manages the `carousel-animating` GPU-promotion class via `scheduleUpdate()`. The new approach uses `cs-focused` CSS class toggling instead of inline style transforms; the `carousel-animating` class management can be removed since IntersectionObserver callbacks don't occur per-frame.

Confirm the `cs-focused` class has CSS rules before proceeding:
```bash
cd "E:\Cameron Jones\my-math-roots"
grep -n "cs-focused" src/styles.css
```

If `cs-focused` has no CSS rules, you must add them. Check the output — if the class is missing, add:
```css
.cs-focused { transform: scale(1.0); opacity: 1; }
.cs:not(.cs-focused) { transform: scale(0.88); opacity: 0.80; }
```
in `src/styles.css` near the existing `.cs` block. Add a task to the next step if needed.

- [ ] **Step 1: Check for `cs-focused` CSS**

```bash
cd "E:\Cameron Jones\my-math-roots"
grep -n "cs-focused\|\.cs " src/styles.css | head -20
```

Review the output. If `cs-focused` is absent from CSS, add it (Step 1a). If present, skip to Step 2.

- [ ] **Step 1a (only if cs-focused is absent): Add CSS**

Find the `.cs` block in `src/styles.css` and add after it:
```css
/* Carousel focus — IntersectionObserver drives this class */
.cs { transform: scale(0.88); opacity: 0.80; transition: transform 0.2s ease, opacity 0.2s ease; }
.cs.cs-focused { transform: scale(1.0); opacity: 1.0; }
```

- [ ] **Step 2: Replace `initCarousel()` body**

Find the full `initCarousel()` function (lines 319–379):
```js
let _carouselInited = false; // kept for compat
function initCarousel(){
  const wrap = document.getElementById('carousel-wrap');
  const track = document.getElementById('ugrid');
  if(!wrap || !track) return;

  let _rafPending = false;
  function updateFocus(){
    ...
  }

  let _scrollEndTimer = null;
  function scheduleUpdate(){
    ...
  }

  // Remove previous listener to prevent stacking on repeated buildHome() calls
  if(wrap._carouselScrollHandler) wrap.removeEventListener('scroll', wrap._carouselScrollHandler);
  wrap._carouselScrollHandler = scheduleUpdate;
  wrap.addEventListener('scroll', scheduleUpdate, {passive:true});
  // Initial call after cards render
  requestAnimationFrame(() => requestAnimationFrame(updateFocus));
}
```

Replace the entire function body (keep the `let _carouselInited = false;` line above it) with:
```js
let _carouselInited = false; // kept for compat
function initCarousel(){
  const wrap = document.getElementById('carousel-wrap');
  const track = document.getElementById('ugrid');
  if(!wrap || !track) return;

  // Disconnect any previous observer (guard against repeated buildHome() calls)
  if(window._carouselObserver) window._carouselObserver.disconnect();
  // Remove old scroll listener if present
  if(wrap._carouselScrollHandler){
    wrap.removeEventListener('scroll', wrap._carouselScrollHandler);
    wrap._carouselScrollHandler = null;
  }

  const slides = track.querySelectorAll('.cs');
  window._carouselObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('cs-focused', entry.isIntersecting);
    });
  }, { root: wrap, threshold: 0.6 });

  slides.forEach(slide => window._carouselObserver.observe(slide));
}
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify no `getBoundingClientRect` during scroll**

In browser, open DevTools → Performance tab. Click Record, scroll through the unit carousel for 3–5 seconds, stop recording. In the flame chart, search for `getBoundingClientRect`. Expected: zero occurrences in the JS main thread during carousel scroll.

Also run in console:
```js
console.assert(window._carouselObserver instanceof IntersectionObserver, 'carousel observer should be set up');
const focusedSlides = document.querySelectorAll('#ugrid .cs.cs-focused');
console.assert(focusedSlides.length >= 1, 'at least one slide should be cs-focused');
console.log('cs-focused count:', focusedSlides.length);
console.log('Task 7: PASS');
```

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/home.js src/styles.css
git commit -m "perf: replace getBoundingClientRect RAF loop with IntersectionObserver in initCarousel (PERF-6)"
```

---

### Task 8: Replace `carouselGoTo()` offset loop with `scrollIntoView` in `src/home.js` — PERF-10

**Files:**
- Modify: `src/home.js` (lines 381–391)

- [ ] **Step 1: Locate `carouselGoTo()`**

Find lines 381–391:
```js
function carouselGoTo(idx, smooth=true){
  CAR.idx=idx;
  const wrap=document.getElementById('carousel-wrap');
  const track=document.getElementById('ugrid');
  if(!wrap||!track) return;
  const slides=track.querySelectorAll('.cs');
  if(!slides[idx]) return;
  let top=0;
  for(let i=0;i<idx;i++) top+=slides[i].offsetHeight+8;
  wrap.scrollTo({top:Math.max(0,top-8), behavior:smooth?'smooth':'instant'});
}
```

- [ ] **Step 2: Replace with `scrollIntoView`**

```js
function carouselGoTo(idx, smooth=true){
  CAR.idx=idx;
  const slide = document.querySelectorAll('#ugrid .cs')[idx];
  if(slide) slide.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'nearest' });
}
```

- [ ] **Step 3: Build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 4: Verify carouselGoTo() works correctly**

In DevTools console:
```js
// Navigate to slide index 2 (the third unit card)
carouselGoTo(2);
// Wait 600ms for smooth scroll to complete
setTimeout(() => {
  const slides = document.querySelectorAll('#ugrid .cs');
  console.assert(slides[2], 'slide at index 2 should exist');
  console.log('carouselGoTo(2): smooth scroll triggered with scrollIntoView');
  console.log('Task 8: PASS — verify visually that card 3 is centered');
}, 600);
```

Also verify no `offsetHeight` reads: open Performance tab, record `carouselGoTo(3)`, confirm no layout reflow in JS flame chart.

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add src/home.js
git commit -m "perf: replace offsetHeight loop in carouselGoTo() with scrollIntoView (PERF-10)"
```

---

### Task 9: Final build and end-to-end verification

**Files:** None — build and verify only.

- [ ] **Step 1: Clean build**

```bash
cd "E:\Cameron Jones\my-math-roots" && node build.js
```

Expected: `🚀 Build complete → dist/`

- [ ] **Step 2: Cache-bust reload**

In DevTools console:
```js
window.location.href = 'http://localhost:3001/?cb=' + Date.now();
```

- [ ] **Step 3: Check for console errors on load**

Open DevTools → Console, filter to Errors. Confirm: no errors.

- [ ] **Step 4: SEC-6 regression**

In console:
```js
// wb_app_secret must exist
console.assert(localStorage.getItem('wb_app_secret'), 'wb_app_secret must exist');
// Craft a lockout triple with the OLD (unsalted) algorithm
const oldHash = (() => {
  const str = '5:1000000:mymathroots_lockout_v2';
  let h = 0;
  for(let i=0;i<str.length;i++) h = ((h<<5)-h+str.charCodeAt(i))|0;
  return String(h);
})();
localStorage.setItem('wb_lockout', JSON.stringify({count:5,ts:1000000,sig:oldHash}));
// The new _lockoutSig includes the secret, so oldHash won't match — lockout will not be bypassed
console.log('SEC-6 regression: old sig written. Reload and confirm PIN lockout is not bypassed.');
```

- [ ] **Step 5: SEC-7 regression**

In DevTools source panel, search `src/boot.js` for `192`. Expected: zero matches.

- [ ] **Step 6: SEC-2 regression**

Sign in as test user, complete a quiz. In DevTools → Application → Local Storage, find `SCORES`. Confirm the most recent entry has a `_sig` field. Modify `pct` to 100 in the localStorage editor. Reload the app and wait for sync. Confirm the tampered score does NOT appear in Supabase (check Supabase dashboard → quiz_scores table, sort by inserted_at desc).

- [ ] **Step 7: PERF-6 regression**

Open Performance tab, record scrolling through carousel. Confirm no `getBoundingClientRect` in JS flame chart.

- [ ] **Step 8: PERF-10 regression**

In console: `carouselGoTo(3)`. Confirm smooth scroll to card 4 with no console errors.

- [ ] **Step 9: Final commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add -A
git commit -m "chore: Hardening Sprint A complete — SEC-2, SEC-6, SEC-7, PERF-6, PERF-10"
```
