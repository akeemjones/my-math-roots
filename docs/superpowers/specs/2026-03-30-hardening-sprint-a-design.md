# Hardening Sprint A — Design Spec

**Date:** 2026-03-30
**Issues:** SEC-2, SEC-6, SEC-7, PERF-6, PERF-10
**Scope:** Security quick-fixes, progression signing for signed-in users, carousel scroll optimisation

---

## Context

My Math Roots is a COPPA-regulated K-5 math PWA. A security audit identified several remaining open issues. This sprint addresses the five lowest-risk, highest-value items that are independent of the large SEC-3/PERF-2 CSP+Home refactor (which is its own dedicated sprint).

**Not in scope:** SEC-3 (unsafe-inline CSP), PERF-1/4 (backdrop-filter removal), PERF-2 (home DOM diffing), PERF-3 (font FOUT), PERF-5/8/9/11/12 (SW and SVG infrastructure).

---

## Architecture Overview

Three focused changes, each touching 1–2 files:

1. **Keyed lockout salt + preview restriction** (`src/boot.js`, `src/settings.js`) — SEC-6, SEC-7
2. **Score signature for Supabase sync** (`src/util.js`, `src/quiz.js`, score-sync path) — SEC-2
3. **IntersectionObserver carousel + scrollIntoView** (`src/home.js`) — PERF-6, PERF-10

The three changes are independent and can be implemented and committed separately.

---

## Section 1 — SEC-6: Keyed Lockout Signature

### Problem
`_lockoutSig(count, ts)` uses a plain DJB2 hash. An attacker who knows the algorithm can pre-compute a valid `{count, ts, sig}` triple and write it to localStorage, bypassing the lockout counter.

### Design
**On first boot**, generate and store a per-device secret:
```js
// In boot sequence (after localStorage is available)
if(!localStorage.getItem('wb_app_secret')){
  localStorage.setItem('wb_app_secret', crypto.randomUUID());
}
```

**Update `_lockoutSig()`** in `src/settings.js` to include the secret in the salt:
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

**Result:** Pre-computation is infeasible without knowing `wb_app_secret`. No async cascade — fully synchronous. `wb_app_secret` is also reused by SEC-2 (score signing), so it's generated once and shared.

---

## Section 2 — SEC-7: Restrict Preview Mode to localhost Only

### Problem
`?preview=1` injects a fake authenticated session on `localhost`, `127.0.0.1`, AND any `192.168.*` address. A staging server on a private network would expose this bypass to anyone on that LAN.

### Design
In `src/boot.js`, narrow the `_isLocal` check to exclude `192.168.*`:

```js
// Before:
const _isLocal = ['localhost','127.0.0.1'].includes(location.hostname)
  || /^192\.168\./.test(location.hostname);

// After:
const _isLocal = ['localhost','127.0.0.1'].includes(location.hostname);
```

This appears in two places in boot.js (the main check and the 8-second fallback). Both must be updated.

**Result:** Preview mode is restricted to true local development only. LAN/staging IPs get no bypass.

---

## Section 3 — SEC-2: Score Signature for Supabase Sync

### Problem
For signed-in users, `SCORES` entries are stored in localStorage as plain JSON. A child can open DevTools and modify `pct: 100` on any score entry. On the next sync cycle, that fabricated score reaches Supabase.

### Scope
- **Signed-in users only.** Guest scores have no server-side destination; signing them provides no meaningful protection.
- **Forgery protection only.** Does not protect against deleting scores from localStorage (out of scope).

### Design

**New helper `_scoreSig(entry)` in `src/util.js`:**
```js
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

**On score write** (`src/quiz.js` — all three save paths: completion, quit, abandon):
```js
// Only sign for signed-in users
if(_supaUser){
  autoEntry._sig = _scoreSig(autoEntry);
}
SCORES.unshift(autoEntry);
saveSc();
```

**On Supabase sync** (`_pushScores()` in `src/auth.js` line 996 — filters before the `.map()` that builds Supabase rows):
```js
// Filter out tampered entries before sync (entries with no _sig pass through for backwards compat)
const verifiedScores = SCORES.filter(s => !s._sig || _scoreValid(s));
const rows = verifiedScores.map(s => ({ ... })); // existing mapping unchanged
```

Note: Entries without `_sig` (written before this sprint, or by guests) pass through the filter with `!s._sig` to avoid breaking existing data. Only entries that have a `_sig` but fail verification are rejected.

**Migration:** No migration needed. Old entries without `_sig` sync as before. New entries for signed-in users get `_sig` going forward.

---

## Section 4 — PERF-6: IntersectionObserver for Carousel Focus

### Problem
`updateFocus()` in `src/home.js` calls `getBoundingClientRect()` on every carousel slide on every RAF-throttled scroll event. Each call forces a layout reflow, producing measurable jank on low-end devices.

### Design
Replace the per-frame geometry loop with a single `IntersectionObserver` set up after `buildHome()` renders the slides.

```js
// In src/home.js — called at the end of buildHome()
function _initCarouselObserver(){
  if(window._carouselObserver) window._carouselObserver.disconnect();

  const slides = document.querySelectorAll('#unit-track .cs');
  window._carouselObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Apply/remove focus class based on visibility
      entry.target.classList.toggle('cs-focused', entry.isIntersecting);
    });
  }, { threshold: 0.6 });

  slides.forEach(slide => window._carouselObserver.observe(slide));
}
```

The existing `updateFocus()` RAF listener is removed. `_initCarouselObserver()` is called once at the end of `buildHome()` and once at the end of `refreshHomeState()`.

**Result:** Focus style changes fire only when a slide crosses the 60% visibility threshold — zero per-frame geometry queries.

---

## Section 5 — PERF-10: scrollIntoView in carouselGoTo()

### Problem
`carouselGoTo(idx)` in `src/home.js` sums `offsetHeight` of every slide before the target in a loop to compute scroll position. `offsetHeight` reads force layout reflows.

### Design
Replace the loop with a single browser-native call:

```js
// Before:
function carouselGoTo(idx){
  const track = document.getElementById('unit-track');
  const slides = track.querySelectorAll('.cs');
  let top = 0;
  for(let i = 0; i < idx; i++) top += slides[i].offsetHeight;
  track.scrollTo({ top, behavior: 'smooth' });
}

// After:
function carouselGoTo(idx){
  const slide = document.querySelectorAll('#unit-track .cs')[idx];
  if(slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
```

`scrollIntoView` is GPU-composited by the browser, requires no manual geometry, and handles edge cases (slide at top/bottom of container) correctly.

---

## File Map

| File | Changes | Issues |
|------|---------|--------|
| `src/boot.js` | Add `wb_app_secret` generation on first boot; restrict `_isLocal` to localhost only | SEC-6, SEC-7 |
| `src/settings.js` | Update `_lockoutSig()` to include `wb_app_secret` in salt | SEC-6 |
| `src/util.js` | Add `_scoreSig(entry)` and `_scoreValid(entry)` helpers | SEC-2 |
| `src/quiz.js` | Sign score entries on write for signed-in users (3 save paths) | SEC-2 |
| `src/auth.js` (`_pushScores`, line 996) | Filter unverified scores before upload | SEC-2 |
| `src/home.js` | Add `_initCarouselObserver()`; replace `carouselGoTo()` | PERF-6, PERF-10 |

---

## Testing Strategy

**SEC-6 regression:** In browser console after boot, confirm `localStorage.getItem('wb_app_secret')` exists. Manually craft a `{count, ts, sig}` triple using plain DJB2 (no secret) and set it in localStorage — confirm the lockout counter is NOT reset (signature mismatch).

**SEC-7 regression:** Confirm `?preview=1` on `localhost` still works (dev parity). Confirm the check no longer includes `192.168.*` in source.

**SEC-2 regression:** Sign in as test user, complete a quiz, open DevTools → Application → localStorage → find the score entry → modify `pct`. Trigger a sync. Confirm the tampered score does NOT appear in Supabase. Confirm an unmodified score (matching `_sig`) DOES sync correctly.

**PERF-6 verification:** Open Performance tab in DevTools, record scrolling through carousel. Confirm no `getBoundingClientRect` calls in the JS flame chart during scroll.

**PERF-10 verification:** Call `carouselGoTo(3)` in console. Confirm smooth scroll to the correct slide with no console errors.
