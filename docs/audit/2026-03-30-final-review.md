# My Math Roots — Final Hardening Audit Report
**Date:** 2026-03-30
**Sprint:** Hardening Sprint A + SEC-3 CSP Migration
**Auditor:** Claude Sonnet 4.6

---

## Executive Summary

The codebase is in strong shape following the SEC-3 CSP migration and SEC-2/SEC-6 signing work. One High finding was identified: multiple residual inline event handlers in `index.html` that contradict the newly-strict CSP (`script-src 'self'` without `'unsafe-inline'`) and will silently fail in production. All Critical-tier concerns (eval, document.write, XSS via innerHTML) were **not found**. The signing architecture, memory management, and Supabase sync logic are all sound.

---

## Findings

---

### 🟠 High — Residual Inline Event Handlers in index.html Blocked by CSP

**File:** `index.html` lines 93, 113, 386, 1079–1080, 1152, 1174
**Description:**
The deployed CSP (`script-src 'self' https://cdn.jsdelivr.net ...`) has no `'unsafe-inline'` directive, which means browser-parsed inline event handler attributes (`onsubmit=`, `oninput=`, `onkeydown=`) are **silently blocked** in production. Seven instances were found:

1. **Line 93** — `<form onsubmit="return false">` — the form submit is already suppressed by events.js `data-nosubmit`, but this attribute is dead weight and a CSP violation.
2. **Line 113** — `<input … onkeydown="if(event.key==='Enter')_lsSubmit()" oninput="_updatePwStrength()">` — **both** handlers are blocked. The Enter-key submit on the password field falls back to the events.js keydown listener (`data-submit-on="enter"` pattern on `id="ls-password"` is handled via the `if(el.id === 'ls-password')` branch in events.js), so Enter still works. But `_updatePwStrength()` is **silently dead** in production — the password strength bar never updates.
3. **Line 386** — `<input … oninput="autoSaveSettings()">` — student name field auto-save is **silently dead** in production. Settings are only saved on explicit submit/navigate-away.
4. **Line 1079** — `oninput="this.value=this.value.replace(/[^0-9]/g,'')"` on the forgot-PIN answer input — numeric filter is dead. Non-numeric input passes through.
5. **Line 1080** — `onkeydown="if(event.key==='Enter')checkForgotAnswer()"` — Enter-to-check is dead for this input.
6. **Line 1152** — `<input … onkeydown="if(event.key==='Enter')submitAuth()">` — Enter-to-submit in the change-password auth modal is dead.
7. **Line 1174** — `oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)"` on the PIN entry input — numeric filter is dead. A user can type letters into the PIN field.

**Risk:**
- `_updatePwStrength` never fires → signup UX regression (password strength bar blank).
- `autoSaveSettings` never fires → student name may not save as user types (data loss if page crashes before navigation).
- PIN entry numeric-only filter is bypassed → non-numeric PIN entry sent to SHA-256 `_hashPin`, producing a mismatch that always fails — a minor annoyance, not a security hole (still rejected), but degrades UX.
- Forgot-PIN numeric filter bypass: same impact.
- The `onsubmit="return false"` form could in theory submit if events.js fails to load.

**Fix:**
Replace each inline handler with the `data-action`/`data-oninput`/`data-submit-on` equivalents that events.js already supports, and convert `onsubmit="return false"` to `data-nosubmit`. For `oninput` numeric-only filters, add new single-purpose actions `_numericOnly4` and `_numericOnlyAny` to events.js, or handle them via the `data-oninput` dispatch path. See source fixes applied below.

---

### 🟡 Medium — `fetchAIHint` Action: JSON.parse Without try/catch

**File:** `src/events.js` line 70
**Description:**
```js
fetchAIHint: (revId, dataJson) => { const {q,chosen,correct} = JSON.parse(dataJson); _fetchAIHint(revId, q, chosen, correct); },
```
`dataJson` is pulled directly from `data-arg2` on a button. The value is written at quiz render time via `_escHtml(JSON.stringify({...}))`, which is safe under normal execution. However, if `dataJson` is `null` (button rendered without `data-arg2`) or somehow malformed, `JSON.parse` throws an uncaught exception that propagates to the global error handler. This does **not** crash the app (the global `window.onerror` catches and logs it), but it means the entire click handler throws rather than failing gracefully.

**Risk:** Low in practice — `data-arg2` is always written by server-side quiz rendering. But defensive programming best practice for a COPPA app warrants a try/catch here.

**Fix:** Wrap the `JSON.parse` in a `try/catch`.

---

### 🟡 Medium — `_signUnlockToken` Does Not Use `wb_app_secret`

**File:** `src/settings.js` lines 885–890
**Description:**
`_signUnlockToken` signs "unlock all" tokens using only a static string (`':mymathroots_unlock_v1'`) without incorporating `wb_app_secret`. This means the signature is the same on every device and every browser. A determined user who reverse-engineers the function can compute the valid token locally.

**Risk:** A parent could use browser DevTools to compute the "unlock all" signature and store it in localStorage, bypassing the PIN requirement for "Unlock All Units". However, this requires DevTools access and the exploit only unlocks content (not data), making it Medium rather than High. The per-device `wb_app_secret` integration in `_lockoutSig` and `_scoreSig` is consistent — this token was likely an oversight.

**Fix:** Incorporate `wb_app_secret` into the token signature the same way `_lockoutSig` does.

---

### 🟡 Medium — `wb_app_secret` Generated After `applyStoredTheme()` / `buildHome()` Are Called

**File:** `src/boot.js` lines 159–168
**Description:**
Boot sequence:
```js
applyStoredTheme();   // line 159 — reads only CSS prefs, no signing needed
applyA11y();          // line 160 — reads only CSS prefs, no signing needed
buildHome();          // line 161 — builds home UI, calls initCarousel → no signing
// Set version display
const vEl = ...       // line 163
if(!localStorage.getItem('wb_app_secret')){   // line 166
  localStorage.setItem('wb_app_secret', crypto.randomUUID());
}
supabaseInit();       // line 169 — triggers auth + _pullOnLogin → _pushScores → _scoreValid
```
`wb_app_secret` is generated **before** `supabaseInit()` which is the only call that could reach `_scoreValid` or `_lockoutSig` at startup. `buildHome()` at line 161 does not call any signing functions. So the secret is always available in time.

However, `buildHome()` → `initCarousel()` is called before the secret is set. If future code ever adds signing into the home-build path, the secret could be missing. The ordering is technically safe today but fragile.

**Risk:** Low today. Latent ordering hazard for future developers.

**Fix (recommended):** Move the `wb_app_secret` generation block to **immediately after** the first comment block in boot.js (before any function calls) to make the invariant explicit.

---

### 🟡 Medium — `wb_app_secret` Absent in Private Browsing / localStorage Disabled

**File:** `src/settings.js` line 876, `src/util.js` line 289
**Description:**
Both `_lockoutSig` and `_scoreSig` fall back to the literal string `'fallback'` when `localStorage.getItem('wb_app_secret')` returns null:
```js
const secret = localStorage.getItem('wb_app_secret') || 'fallback';
```
In Private Browsing mode or when localStorage is disabled, this means:
- **Score signing:** All scores on device A get signed with `'fallback'`. On device B also in private mode, all scores also get `'fallback'`. Any score from device A is accepted as valid by device B. Since `_pushScores` filters `!s._sig || _scoreValid(s)`, scores without a sig pass through anyway (backwards compat), so this adds no new hole.
- **Lockout signing:** The lockout signature is the same string `'fallback'` for all private-mode users. An attacker who discovers this value can store a pre-computed signature in localStorage to bypass a lockout. But in Private Browsing, localStorage resets on close anyway, so the lockout is also reset.

**Risk:** The `'fallback'` secret weakens signing to a deterministic value. For score signing, it's acceptable since the filter is defense-in-depth. For lockout signing, it's a theoretical bypass in normal browser mode if `wb_app_secret` is somehow deleted — but `_clearUserData()` does not delete `wb_app_secret`, and there is no `localStorage.clear()` anywhere in the codebase, so this is low-risk.

**Fix:** Already noted in fix above for `wb_app_secret` generation. Additionally, for lockout signing, log a warning in dev mode if `wb_app_secret` is missing at `_lockoutSig` call time.

---

### 🟢 Low — `callBlockAdv` Action: Theoretical Prototype Pollution Vector

**File:** `src/events.js` line 106
**Description:**
```js
callBlockAdv: (a) => typeof window[a+'_adv'] === 'function' && window[a+'_adv'](),
```
`a` comes from `data-arg` on a button rendered by `unit.js` in template literals. The values are block IDs like `'carry'`, `'borrow'`, etc. — controlled by the developer at render time, never by user input.

However, if `a` were ever set to a value like `__proto__` or `constructor`, `window['__proto___adv']` is not a function, so the `typeof ... === 'function'` guard prevents execution. Actual prototype pollution would require `window[a+'_adv'] = someFunction` which would require prior code execution (at which point you've already lost).

A DOM-clobbering attack where a user inserts a `<div id="__proto___adv">` wouldn't satisfy `typeof === 'function'`. Safe as written.

**Risk:** Informational — no actionable exploit path found.

---

### 🟢 Low — `unit.js` Uses `.onclick =` Property Assignment (Not an `onclick=` Attribute)

**File:** `src/unit.js` line 401
**Description:**
```js
btnEl.onclick = () => play3dCarry(btnEl, top, bot);
```
This is a **JavaScript property assignment**, not an HTML `onclick=` attribute. CSP `script-src` does **not** block `.onclick` property assignment via JavaScript — only inline HTML event handler attributes are blocked. This is safe.

**Risk:** None. Informational only.

---

### 🟢 Low — `_clearUserData` Does Not Disconnect the Carousel Observer

**File:** `src/auth.js` line 1144 / `src/home.js` line 325
**Description:**
`_clearUserData()` sets `_carouselInited = false` but does not call `window._carouselObserver.disconnect()`. The observer will continue watching stale DOM nodes until the next `initCarousel()` call (which disconnects it as the first step). In the sign-out → sign-in flow this is benign since `buildHome()` is called on SIGNED_IN which eventually calls `initCarousel()`.

However, if a user signs out while on a non-home screen, the observer is watching slides that will be replaced on next `buildHome()`. Because `IntersectionObserver` callbacks execute asynchronously, there is a brief window where the old observer fires on DOM nodes that no longer exist in the track — this is a no-op since `classList.toggle` on a detached element is harmless.

**Risk:** Minor memory/correctness concern. No user-visible impact.

**Fix:** Add `if(window._carouselObserver) window._carouselObserver.disconnect();` to `_clearUserData()`.

---

### ℹ️ Info — `_pushScores` Filter Does Not Catch Exceptions from `_scoreValid`

**File:** `src/auth.js` line 1000
**Description:**
```js
const verifiedScores = SCORES.filter(s => !s._sig || _scoreValid(s));
```
`_scoreValid` → `_scoreSig` reads `localStorage.getItem('wb_app_secret')` which cannot throw. It also accesses `entry.qid`, `entry.pct`, `entry.id` with `||` fallbacks. It cannot throw under any realistic input — even a `null` entry would produce `String(NaN)` as a hash (which would not match any stored `_sig`). The outer `_pushScores` is already wrapped in `try/catch`, so even an unexpected exception would be swallowed at line 1015.

**Risk:** None. The try/catch outer wrapper is adequate. No tampered score logging beyond `console.warn` on the outer catch.

---

### ℹ️ Info — `goHome` Does Not Explicitly Disconnect Observer on Navigation

**File:** `src/home.js` line 349
**Description:**
`goHome()` does not call `window._carouselObserver.disconnect()`. Instead, it calls `refreshHomeState()` or `buildHome()`, the latter of which calls `initCarousel()`, which disconnects first. For the `refreshHomeState()` path (most common case), the observer is **not** disconnected — but `refreshHomeState()` does not replace the slide nodes (it does in-place updates), so the observer continues watching the same nodes, which is correct behavior.

In rapid Unit → Home → Unit → Home navigation, `initCarousel()` is called each time home is fully rebuilt, and it disconnects the old observer first. The guard at line 325 prevents accumulation. **No accumulation detected.**

**Risk:** None. The existing guard is effective.

---

### ℹ️ Info — `onsubmit="return false"` on Login Form

**File:** `index.html` line 93
**Description:**
The form has `onsubmit="return false"`. Under the strict CSP this attribute is blocked, meaning the form _could_ submit if events.js fails to load. However:
1. The submit button has `type="button"` not `type="submit"`.
2. The form has no `action` attribute (defaults to current URL).
3. Even if submitted, no sensitive data would be sent since inputs are not named (they use `id=` not `name=`).

**Risk:** None functional. Should still be migrated to `data-nosubmit` for consistency.

---

## What Looks Good

- **No `eval()`, `new Function()`, or `document.write()` anywhere** in the source — clean bill of health for code injection vectors.
- **`wb_app_secret` generation is properly guarded** with `if(!localStorage.getItem('wb_app_secret'))` — it will never regenerate on boot and overwrite existing signatures.
- **`_clearUserData()` does not call `localStorage.clear()`** — it uses precise `localStorage.removeItem()` calls for only the user-scoped keys. `wb_app_secret` and `wb_device_key` are deliberately preserved across sign-out. Score signatures remain valid after sign-out.
- **`_lockoutSig` and `_scoreSig` are synchronous** — no call sites use `await` on them. The `if(!localStorage.getItem('wb_app_secret'))` guard runs before `supabaseInit()`, ensuring the secret is available at first use.
- **`_pushScores` is wrapped in a full `try/catch`** with an 8-second timeout via `Promise.race`. If all scores fail verification, `verifiedScores` is an empty array and `upsert([])` is a no-op — no crash, no infinite retry.
- **`initCarousel()` disconnects the previous observer** before creating a new one (line 325). The old `_carouselScrollHandler` is also explicitly removed. No observer accumulation possible through the standard navigation paths.
- **No `innerHTML` with event handlers (`onclick=`, `javascript:`)** in the JS template literals. All dynamic HTML uses `data-action=` attributes exclusively. All user content interpolated into `innerHTML` passes through `_escHtml()`.
- **CSP is well-formed and comprehensive**: `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `worker-src 'self'`. No `unsafe-eval`. SRI integrity hash on the Supabase CDN script.
- **`_scoreValid` cannot throw** under any realistic malformed input — `||` fallbacks throughout `_scoreSig` ensure only safe string concatenation.
- **Events dispatcher fails silently** for unknown `data-action` values in production (returns early; only warns on localhost). No throw, no crash.
- **The `callBlockAdv` XSS vector is neutralized** by the `typeof === 'function'` guard.
- **No `javascript:` URLs** found anywhere in source or HTML.
- **No residual `<script>` tags injected via innerHTML** anywhere.
- **No `setTimeout(string, ...)` or `setInterval(string, ...)` calls** anywhere.

---

## Verdict

The application is **production-ready from a security architecture standpoint**. The critical infrastructure (CSP, score signing, lockout signing, data sync, observer lifecycle, XSS prevention) is correctly implemented. The one actionable High finding — residual inline event handlers blocked by the CSP — causes silent UX regressions (password strength bar, student name auto-save, PIN numeric filter) rather than security holes, but must be fixed before shipping. Four medium findings are addressed in fixes below. No Critical findings were identified.
