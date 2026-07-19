# Single Family Account Architecture

Status: **design — client-side rework in progress on `feature/simplified-product`. Nothing deployed or merged.**
Supersedes: the "Parent Center" and "parent-dashboard" plans (both discarded).

---

## 1. The one-line model

There is exactly **one authenticated identity: the Family Account** (a Supabase user, signed in with email/password or Google; Apple later). **Children are profiles inside that account, not separate logins.** An "active child" is *application state*, never a second authentication.

```
Open app → (Family Account authenticated) → Choose child profile → Continue Learning
Settings icon → Parent PIN gate → Children / Learning Preferences / Progress / Account → back to child learning
```

The protected area is labelled **Settings** — never Dashboard, Parent Dashboard, Parent Center, Analytics, or Control Center.

---

## 2. What is being eliminated

| Removed | Replaced by |
|---|---|
| Standalone parent dashboard (`dashboard-screen`) | nothing — deleted; a compact **Progress** section inside Settings covers the honest subset |
| Separate "Parent Center" destination | one **Settings** screen |
| Separate parent vs student login systems | one Family Account login |
| Family-code student login | child-profile selection (no credential) |
| Student PIN as an account session | Parent PIN as a short-lived **gate** for Settings only (not a session) |
| Student session token (`mmr_session_token`) | eliminated — the Family Account Supabase session is the only identity |
| Competing parent/student auth states | one auth state + an application-mode axis |

---

## 3. The state model

State is two independent axes plus active-child data and a short-lived gate. **None of this is a second credential.**

### 3.1 Authentication state (`authState`)
- `signed_out` — no Supabase user
- `family` — Supabase Family Account session present (the only authenticated identity)
- `demo` — local-only demo, no cloud sync (kept separate from the account model)

### 3.2 Application mode (`appMode`)
- `profile_selection` — choosing which child
- `child_learning` — the primary app (home, units, lessons, quizzes, results)
- `parent_settings` — the PIN-protected Settings area

### 3.3 Active child state (application data, NOT auth)
- **active child id** — canonical key stays `mmr_active_student_id` (semantically "active child"; retained to avoid an upgrade that drops the active child on existing devices). Documented as app state.
- **active grade** — `mmr_grade` (unchanged; the 3-writer rule below is preserved)
- **resume state** — an unfinished lesson/quiz for the active child

### 3.4 Parent gate (short-lived)
- `mmr_parent_gate_until` — epoch ms until which the parent gate is valid. The PIN opens Settings and parent-only actions for a short session; it **does not** create a Supabase session, does not replace family auth, does not issue any token, and is never required for normal lesson use. The plain PIN is never stored.

### 3.5 localStorage key transition
| Key | Before | After |
|---|---|---|
| `mmr_session_token` | student PIN session token | **removed** |
| `mmr_user_role` = `parent`/`student` | auth role toggle | **retired** as an auth role; app mode moves to `mmr_app_mode` |
| `mmr_learning_active` (staged) | parent-launched vs PIN student | **repurposed** → `mmr_app_mode` = `child` \| `settings` (absent ⇒ profile selection) |
| `mmr_active_student_id` | active student | **kept**, re-described as active child id (app state) |
| `mmr_grade` | active grade | **kept** (3 legitimate writers preserved) |
| family-code / rate-limit / PIN-attempt keys | student auth | **removed** (client) — see migration doc for backend |

---

## 4. The authoritative resolver

One pure function decides the initial screen from persisted state. It replaces the staged `resolveRecoveryRoute` (which was built for the discarded dual-login world and returned `dashboard`). It **never routes to a removed screen**.

```
resolveInitialScreen({ authState, activeChildId, appMode, parentGateValid, resume }) -> screen
```

Decision order:

1. `authState === 'signed_out'` → `login`
2. `authState === 'demo'` → `demo` (demo child home)
3. `authState === 'family'`:
   1. `appMode === 'parent_settings'` **and** `parentGateValid` → `settings`
   2. `appMode === 'parent_settings'` **and** gate expired → `activeChildId ? child-home : profile-selection` (never re-open Settings without a valid gate)
   3. no `activeChildId` → `profile-selection`
   4. `activeChildId` **and** `resume.type === 'quiz'` → `quiz` (resume)
   5. `activeChildId` **and** `resume.type === 'lesson'` → `lesson` (resume)
   6. `activeChildId` → `child-home`

It distinguishes only: **signed out / family-no-child / child-learning / parent-settings / demo**. It does **not** distinguish separate authenticated parent and student identities, because there is only one.

### Reload behaviour (acceptance)
- Reload signed-out → login/Demo
- Reload signed-in, no child → profile selection
- Reload signed-in, active child → child home
- Reload during a lesson/quiz → restore that child's lesson/quiz
- Reload while Settings open → Settings **only if the gate is still valid**, else child home / profile selection
- **Never** route into a removed dashboard.

---

## 5. Screen flow (target `ALL_SCREENS`)

Active: `login`, `profile-selection`, `child-home` (`home`), `unit`, `lesson`, `quiz`/`mastery-check`, `result`, `settings`, `progress-drilldown`, `demo`.

Removed from active routing: parent dashboard, Parent Center, student login, family-code login, separate PIN login, old duplicate settings shell.

---

## 6. Settings (one screen, exactly four sections)

1. **Children** — profile selector, add/edit child, change supported grade (K/1/2 only — Grades 3–5 not exposed), avatar, reset progress, delete child (when backend verified).
2. **Learning Preferences** — quiz timer, lesson quiz length, Unit Mastery Check length, sound effects, accessibility. Applies to the **selected** child; switching children updates immediately. (Sound controls, quiz timers, custom quiz lengths are **kept**.)
3. **Progress** — compact only: current unit, unit completion, most recent result, recent quiz history, mastery-check results, one common mistake / skill to practise, recommended next lesson. Question-by-question quiz review as a drill-down. Ranges: **Last 7 days / Last 30 days / All time**. No large charts, no unverified mastery %, no weekly snapshots, no heat maps, no streak calendars, no recovery-rate metrics, no AI reports, no fake time-on-task.
4. **Account** — parent PIN, password, support, privacy, account deletion (when backend verified), subscription (later), sign out. No changelog, no push notifications, no inert reminders, no AI marketing, no dev flags.

---

## 7. Parent PIN behaviour

Gates: opening Settings, add/edit child, change grade, reset progress, delete profile, subscription/account controls. **Not** required for normal lesson use. Short-lived gate (`mmr_parent_gate_until`); re-prompt after expiry or when Settings closes. Never creates a Supabase/student session; never stored in plaintext.

---

## 8. Authorization (Phase 9 — must not weaken)

Children no longer authenticate, but **every remote read/write stays scoped to the authenticated Family Account and a child profile it owns.** Do not authorize a write on a browser-supplied active-child id alone; the server must verify the authenticated parent owns the target profile. Where student-PIN RPCs currently supply authorization, they are replaced by parent-owned RPCs or RLS-safe writes keyed on `auth.uid()`. Migration drafts only — no production migration without approval (see `SINGLE_FAMILY_ACCOUNT_MIGRATION.md`).

---

## 9. Disposition of the staged (uncommitted) session work

The staged change added `resolveRecoveryRoute`, `mmr_learning_active`, `_enterParentMode()`, and 18 tests to fix "parent-launched child ejected to the dashboard on reload." **That bug dissolves in this model** — there is no dashboard to eject to and no competing identity. Disposition:

| Staged element | Decision |
|---|---|
| Pure-resolver pattern (storage → route) | **Keep the pattern** → becomes `resolveInitialScreen` (§4) |
| `resolveRecoveryRoute` returning `dashboard`; `mmr_session_token` gate | **Revert** — dual-login-only |
| `mmr_learning_active` marker | **Repurpose** → `mmr_app_mode` view-state |
| `_enterParentMode()` (auth-role flip) | **Rework** → "enter Parent Settings mode" (mode + gate), not a role flip |
| `tests/session-recovery-route.test.js` (scaffold + `store()` helper) | **Rewrite** to the 5-state resolver (Phase 12) |

**Not committed as-is.** It is adapted/reverted inside the routing and test commits below.

---

## 10. Commit plan

1. `docs(auth): define single family account architecture` — **this doc**
2. `refactor(auth): replace student login with profile selection`
3. `refactor(nav): simplify family and child routing` — introduces `resolveInitialScreen`, retires the staged resolver
4. `refactor(settings): consolidate parent controls`
5. `chore(parent): remove standalone dashboard`
6. `chore(auth): remove legacy student-login client code`
7. `test(auth): cover single-account profile flow`
8. `docs(auth): add legacy backend retirement plan` — `SINGLE_FAMILY_ACCOUNT_MIGRATION.md`

## 11. Hard stop conditions

Stop before: applying a production DB migration; deleting production RPCs used by deployed clients; weakening ownership authorization; deleting production data; exposing profile/account deletion without a verified backend; any destructive compatibility decision. Do **not** stop for normal client-side simplification.
