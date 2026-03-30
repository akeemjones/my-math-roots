# SEC-3: Remove `unsafe-inline` from CSP — Design Spec

**Date:** 2026-03-30
**Issue:** SEC-3
**Scope:** Migrate all inline `onclick=` handlers to `data-action` delegation; remove `'unsafe-inline'` from `script-src` in the Content Security Policy.

---

## Context

My Math Roots is a COPPA-regulated K-5 math PWA. The current CSP contains `'unsafe-inline'` in `script-src`, which means the browser will execute any inline JavaScript — including injected scripts from XSS attacks. Removing it is the single highest-impact security hardening remaining.

**Not in scope:** `style-src 'unsafe-inline'` (inline styles in template literals — a separate, larger refactor). `script-src` only.

**PERF-2 status:** Code audit confirms `refreshHomeState()` with full DOM diffing is already implemented and `goHome()` already routes to it when the DOM is populated. PERF-2 is resolved — not in scope for this sprint.

---

## Architecture

Three sequential phases, each independently testable before proceeding to the next:

1. **Phase 1 — Migrate `index.html` static handlers** (~112 `onclick=` attributes)
2. **Phase 2 — Migrate JS-generated HTML handlers** (template literals in `auth.js`, `home.js`, `settings.js`, `quiz.js`)
3. **Phase 3 — Remove `'unsafe-inline'` from `script-src`** (`netlify.toml`)

The `data-action` delegation system in `src/events.js` is already fully built (160+ mapped actions, `document.addEventListener('click')` root listener). It handles both static and dynamically-injected HTML because delegation fires at the document level. No new infrastructure needed — only new action entries for compound handlers.

---

## Section 1 — Phase 1: `index.html` Static Handlers

### Pattern

Every `onclick="fn()"` becomes `data-action="fn"`. Arguments use `data-arg` and `data-arg2`:

```html
<!-- Before -->
<button onclick="goSettings()">Settings</button>
<button onclick="openUnit(2)">Unit 2</button>

<!-- After -->
<button data-action="goSettings">Settings</button>
<button data-action="openUnit" data-arg="2">Unit 2</button>
```

### Scope

Approximately 112 `onclick=` attributes in `index.html`. All target functions already have entries in `events.js`. No new actions needed for this phase.

### Verification

After this phase: reload app, exercise every static button (nav bar, login tabs, quiz controls, history button). Zero JS errors in console. `onclick=` must be absent from `index.html` after migration.

---

## Section 2 — Phase 2: JS-Generated HTML Handlers

### Files and Handler Counts

| File | `onclick=` count | Notes |
|------|-----------------|-------|
| `src/auth.js` | 6 | 3 compound handlers |
| `src/home.js` | 12 | All simple or with-arg |
| `src/settings.js` | 7 | All simple or with-arg |
| `src/quiz.js` | 12 | 1 special JSON-arg case |

### New Actions to Add to `src/events.js`

**Compound handlers — 3 new actions:**

```js
// signup nudge modal — "Create a Free Account →" button (auth.js line 845)
nudgeModalSignup: () => {
  document.getElementById('signup-nudge-modal')?.remove();
  show('login-screen');
  _lsSwitchTab('signup');
},

// signup nudge modal — "Maybe later" button (auth.js line 850)
nudgeModalDismiss: () => {
  document.getElementById('signup-nudge-modal')?.remove();
},

// soft gate modal — "Create a Free Account" button (auth.js line 895)
softGateSignup: () => {
  document.getElementById('soft-gate-modal')?.remove();
  show('login-screen');
  _lsSwitchTab('signup');
},
```

**`showLockToast` boolean arg — update existing mapping:**

```js
// Before (events.js existing entry — update in place):
showLockToast: (msg, withIcon) => showLockToast(msg, withIcon === 'true'),
```

**`_fetchAIHint` JSON-arg special case (quiz.js line 503):**

The current handler passes 4 arguments (revId + 3 JSON-serialized objects). Pack hint data into `data-arg2` as a single JSON object:

```html
<!-- In quiz.js template literal — before -->
onclick="_fetchAIHint('${revId}',${_escHtml(JSON.stringify(q.t))},${_escHtml(JSON.stringify(chosen))},${_escHtml(JSON.stringify(correct))})"

<!-- After -->
data-action="fetchAIHint"
data-arg="${_escHtml(revId)}"
data-arg2='${_escHtml(JSON.stringify({q:q.t,chosen,correct}))}'
```

```js
// New action in events.js:
fetchAIHint: (revId, dataJson) => {
  const { q, chosen, correct } = JSON.parse(dataJson);
  _fetchAIHint(revId, q, chosen, correct);
},
```

The browser HTML-unescapes attribute values on read, so `el.dataset.arg2` delivers valid JSON to `JSON.parse`.

### Simple and With-Arg Handlers

All remaining handlers in `home.js`, `settings.js`, and `quiz.js` are single-function calls with 0–2 arguments. They follow the same `data-action` / `data-arg` / `data-arg2` pattern. Existing events.js mappings cover all of them. For two-argument numeric calls (e.g., `openLesson(unitIdx, lessonIdx)`):

```html
<!-- Before -->
onclick="openLesson(${CUR.unitIdx},${CUR.lessonIdx})"

<!-- After -->
data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${CUR.lessonIdx}"
```

The existing `openLesson` mapping must coerce both args to Number:
```js
openLesson: (a, b) => openLesson(Number(a), Number(b)),
```

### Verification

After this phase: trigger each dynamic UI — signup nudge (both buttons), soft gate (both buttons), AI hint button in quiz results, quiz results navigation buttons, progress report rows, lock toast. Zero JS errors.

---

## Section 3 — Phase 3: Remove `'unsafe-inline'` from CSP

**File:** `netlify.toml`

```toml
# Before:
  Content-Security-Policy = """
    ...
    script-src 'self' 'unsafe-inline'
      https://cdn.jsdelivr.net
      https://accounts.google.com
      https://challenges.cloudflare.com;
    ...
  """

# After:
  Content-Security-Policy = """
    ...
    script-src 'self'
      https://cdn.jsdelivr.net
      https://accounts.google.com
      https://challenges.cloudflare.com;
    ...
  """
```

This is the last step, committed only after Phases 1 and 2 are fully verified.

### Final Verification

Deploy to Netlify preview (or test locally with a proxy that injects the header). Open DevTools → Console, filter to `Content-Security-Policy`. Walk through:
- Home navigation, carousel scroll
- Quiz start, answer, quit, complete
- Signup nudge modal (both buttons)
- Soft gate modal (both buttons)
- AI hint button
- Login / signup forms
- Parent settings, PIN entry

Zero CSP violation reports = done.

**Regression signal:** Any missed `onclick=` will manifest as a silently unresponsive button — easy to find by clicking through the app.

---

## File Map

| File | Change | Phase |
|------|--------|-------|
| `index.html` | ~112 `onclick=` → `data-action` | 1 |
| `src/events.js` | Add `nudgeModalSignup`, `nudgeModalDismiss`, `softGateSignup`, `fetchAIHint`; update `showLockToast`, `openLesson` | 2 |
| `src/auth.js` | 6 template literal `onclick=` → `data-action` | 2 |
| `src/home.js` | 12 template literal `onclick=` → `data-action` | 2 |
| `src/settings.js` | 7 template literal `onclick=` → `data-action` | 2 |
| `src/quiz.js` | 12 template literal `onclick=` → `data-action` | 2 |
| `netlify.toml` | Remove `'unsafe-inline'` from `script-src` | 3 |

---

## Testing Strategy

| Phase | Gate |
|-------|------|
| After Phase 1 | All static buttons in `index.html` respond; zero JS errors; no `onclick=` in `index.html` |
| After Phase 2 | All dynamic modals and quiz UI respond correctly; zero JS errors |
| After Phase 3 | Zero CSP violation reports across full user flow |
