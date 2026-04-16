# Design: Student Session UI & Parent Dashboard Navigation Fixes
**Date:** 2026-04-14  
**Scope:** V1 vanilla JS app (`src/`)

---

## Problem Summary

Four related bugs around student PIN sessions and parent dashboard access:

1. No "Switch to Dashboard" button when a student profile is signed in.
2. No "Sign Out" button when a student profile is signed in (shows "Sign In" instead).
3. Tapping the parent dashboard button lands on the student login slide rather than the parent slide.
4. Parent dashboard button navigates to `/dashboard/` which 404s; swiping back reloads the app on the login screen.

---

## Root Causes

### Issues 1 & 2 — `updateAccountUI()` missing student state
`updateAccountUI()` in `src/auth.js` has two states: `isRealAccount` (Supabase session) and "everyone else". Students (`role === 'student'`, no Supabase session) are incorrectly grouped with guests, producing a "Sign In" label instead of "Sign Out" and hiding the dashboard button.

### Issues 3 & 4 — `_goParentDashboard()` navigates outside the SPA
```js
if (_supaUser) { window.location.href = '/dashboard/'; }
```
`/dashboard/` is not a real route — the parent dashboard is `#dashboard-screen` inside the SPA. This causes a 404. The swipe-back from that 404 reloads `/` fresh, which drops the user on the login screen at its default slide 0 (student). Issue 3 is a downstream symptom of issue 4.

---

## Design

### Change 1 — `updateAccountUI()` in `src/auth.js`

Add a third state for student sessions. The `signout-btn-wrap` flex row renders:

| Role | `#parent-dash-btn` (left) | Auth button (right) |
|---|---|---|
| Parent — `isRealAccount` | Label: **Dashboard** · Action: `_goParentDashboard` · colour: purple | Label: **Sign Out** · Action: `_signOut` · colour: red |
| Student — `role === 'student'` | Label: **Switch to Dashboard** · Action: `_goParentDashboard` · colour: purple | Label: **Sign Out** · Action: `_signOut` · colour: red |
| Guest — no role | Hidden | Label: **Sign In** · Action: `_showLoginScreen` · colour: blue |

Both buttons in the student row are visible. The dashboard button label distinguishes intent: "Dashboard" for parents (they own the session), "Switch to Dashboard" for students (signals a role change is needed).

`_signOut()` already handles the student case correctly — it removes `mmr_user_role` and redirects to the login screen. No changes needed there.

### Change 2 — `_goParentDashboard()` in `src/auth.js`

Replace the hard URL navigation with the same in-SPA transition used everywhere else:

```js
// BEFORE
function _goParentDashboard() {
  if (_supaUser) {
    window.location.href = '/dashboard/';
  } else {
    _showParentSignInGate();
  }
}

// AFTER
function _goParentDashboard() {
  if (_supaUser) {
    show('dashboard-screen');
    _dbInit();
    _installHistoryGuard();
  } else {
    _showParentSignInGate();
  }
}
```

This eliminates the 404 (issue 4) and the login-screen-after-swipe-back symptom (issue 3).

### Change 3 — Pre-position login carousel in `_showParentSignInGate()` (`src/auth.js`)

As a safety net: if the parent gate modal is ever dismissed and the user ends up on the login screen, it should be on the parent slide. Add `_lsCarouselGo(1)` at the start of `_showParentSignInGate()` so the carousel is pre-positioned before the modal opens.

---

## Files Changed

| File | Change |
|---|---|
| `src/auth.js` | `updateAccountUI()` — add student-session state for both buttons |
| `src/auth.js` | `_goParentDashboard()` — replace URL navigation with in-SPA show |
| `src/auth.js` | `_showParentSignInGate()` — add `_lsCarouselGo(1)` pre-positioning |

No HTML changes. No new elements. `build.js` rebuilds `dist/` as normal.

---

## Out of Scope

- Styling changes beyond button labels and colours already set inline by `updateAccountUI()`
- Any V2 / SvelteKit changes
- Dashboard content or data changes
