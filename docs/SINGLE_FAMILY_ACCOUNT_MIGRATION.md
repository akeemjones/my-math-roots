# Single Family Account — Legacy Backend Retirement & Compatibility Plan

Status: **Client conversion complete on `feature/simplified-product`; no production migration applied; nothing deployed or merged.**
Companion to `SINGLE_FAMILY_ACCOUNT_ARCHITECTURE.md`. Grounded in two read-only audits (student-auth system; child-data authorization) of `feature/simplified-product`.

## Implementation status (client)

Bucket A (client-safe changes) is **done** across these commits — the new client
presents one Family Account login, children as profiles, a PIN-gated four-section
Settings, and no dashboard; it no longer calls the student-auth RPCs:

| Commit | |
|---|---|
| `docs(auth)` | single-family-account architecture |
| `refactor(auth)` | child-profile selection screen |
| `refactor(nav)` | single-account startup resolver (`resolveInitialScreen`) |
| `refactor(settings)` | one PIN-gated Settings, four sections |
| `refactor(parent)` | relocate progress utilities → `parent-progress.js` |
| `chore(parent)` | remove the standalone dashboard (screen + reachability) |
| `chore(auth)` | remove the student-login client (single login card, no-PIN switch) |
| `test(auth)` | cover the family-account + profile flow |

Two implementation notes:
- The new profile fetch (`profile-management.js` `_fetchManagedProfiles`) drops
  the `report_last_generated` / `report_last_text` / `pin_hash` columns from its
  SELECT — the client no longer reads AI-report or PIN data.
- Inert dead code remains pending a follow-up prune (does not affect behaviour or
  reachability): the old dashboard renderer functions + `.db-*` CSS, and the
  now-unreachable student-login helpers (`_lsStudentLogin`, `_lsFamilyCodeSetup`,
  `_lsRenderStudentCard`, `_lsPin*`, `_validateFamilyCode`) + `_continueAsGuest`.
  Buckets B and C below are unchanged and remain gated on approval.

This document separates three buckets so the client work can proceed safely while backend changes wait for explicit approval:

- **Bucket A — Client changes safe NOW** (this branch, no backend dependency)
- **Bucket B — Backend changes REQUIRING APPROVAL** (reviewed migration drafts only)
- **Bucket C — Production cleanup AFTER the new client is deployed and old traffic has drained**

> ⚠️ **Hard stop conditions** (from the task): do not apply a production DB migration, do not drop/alter production RPCs old clients call, do not weaken ownership authorization, do not delete production data, do not expose profile/account deletion without a verified backend. Everything in Buckets B and C is a **draft/checklist**, not an action.

---

## 0. Compatibility reality (read first)

1. **Old deployed clients authenticate via anon-key family-code + student PIN.** Any build already in users' browsers/PWAs calls `get_profiles_by_family_code` and `verify_student_pin` (which mints a `pin_sessions` token) and then uses token-authorized RPCs. Removing those server objects **breaks those clients**. They must keep working until their traffic drains.

2. **Repo/production drift is real.** The student-PIN objects (`verify_student_pin`, `_validate_pin_session`, `reset_student_pin`, `pin_sessions`, `pin_attempts`, `cleanup_expired_pin_sessions`) are defined **only in `docs/supabase_migrations/` (legacy 005/007/011)**, *not* in the canonical `supabase/migrations/` set. Several live RPC bodies (`push_student_progress`, `pull_student_progress`, `get_student_progress_by_pin`, `get_all_student_settings`) are noted as **hand-edited in the Supabase dashboard**. **Therefore: validate every object against the live database (`pg_get_functiondef`, `\d+`) and against production call-volume analytics before writing or applying any drop.** The repo is necessary but not sufficient truth.

3. **Two PIN systems — only one retires.** *Student PIN* (family-code login) is removed. *Parent PIN* (`get_pin_hash`/`update_pin_hash`, `wb_parent_pin`, `parent-pin-inp`) is an in-app gate that **survives** as the Settings gate. Do not conflate them in any migration.

---

## 1. The safe target state

Child sessions run under the **parent's Supabase session** (the already-existing "parent-launched" regime). No child credential, no session token. Every child write goes through a path that asserts `student_profiles.parent_id = auth.uid()` for the target `student_id`. The family-code/PIN machinery is revoked and dropped **after** old-client traffic drains.

Crucially, **the parent-owned write path already exists in the client** (`_pushAllParent` direct upserts + `get_student_progress_by_pin` parent-owner branch), so the client can be switched to it without new RPCs — *once the ownership gap (Risk 1) is closed server-side.*

---

## 2. Bucket A — Client changes safe NOW (this branch)

No backend dependency; ships with the new client. These are the Phase 3–8 commits.

- Remove the login carousel's **student card** (`index.html` Card 0 / family-code + student-PIN UI) and route straight to family-account (parent) login → child-profile selection.
- Remove **family-code entry** (`_lsFamilyCodeSetup`, `_validateFamilyCode`, `_lsRenderStudentCard`) and **student-PIN entry** (`_lsPin*`, `_lsStudentLogin`, profile-switcher `_psCheckPin`/`_psPinView`) from the client.
- **Stop calling** `verify_student_pin`, `get_profiles_by_family_code`, and the token branch of `pull_student_progress` from the new client. (The server objects stay up for old clients — Bucket C drops them later.)
- Make the child app **always run in the parent-owned regime**: select-child sets `mmr_active_student_id` (app state) and hydrates via `get_student_progress_by_pin` (parent-owner branch, R5); writes go through the parent direct-upsert path (W3–W7) / `push_quiz_scores` parent branch (W2).
- **Remove `mmr_session_token`** issuance and consumption client-side; retire `_sessionToken`, `_isStudentSession`, `_hasValidStudentSession` token checks.
- **Keep the parent PIN** (`get_pin_hash`/`update_pin_hash`) wired to the new Settings gate.
- Stop displaying the **family code** in the UI (onboarding + former dashboard). The `create_student_profile` RPC still mints one server-side for now (harmless, unused by the new client); its refactor is Bucket B.
- Dead client keys to delete: `mmr_stud_fail_ts`, `mmr_stud_fail_count` (never written), plus `mmr_session_token` reads.

**None of Bucket A weakens authorization** *by itself* — but it shifts all child writes onto the parent direct-upsert path, which makes **Risk 1 (below) the primary authorization surface.** Risk 1 must be closed (Bucket B) before this client is deployed to real families.

---

## 3. Bucket B — Backend changes REQUIRING APPROVAL (drafts only)

Draft SQL to be reviewed; **not applied** here. Validate against live definitions first (§0.2).

### B1 — HIGH: ownership check on child-data writes (Risk 1)
Today `student_progress` and `quiz_scores` direct upserts are gated by RLS on `user_id = auth.uid()` **only**. The browser-supplied `student_id` is *not* verified to belong to the authenticated parent, so a parent could tag rows with another family's `student_id`. Once the child app writes exclusively via this path (Bucket A), this is the authorization boundary.

Draft options (pick one at review):
- **(preferred) Tighten RLS with an ownership `WITH CHECK`:**
  ```sql
  -- DRAFT — validate table/policy names against live DB first.
  ALTER POLICY student_progress_write ON public.student_progress
    WITH CHECK (
      user_id = auth.uid()
      AND (student_id IS NULL OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.id = student_id AND sp.parent_id = auth.uid()
      ))
    );
  -- Repeat for quiz_scores.
  ```
- **or** route writes through a new ownership-checked `SECURITY DEFINER` RPC that asserts the same `EXISTS(...)` before upsert.
- **or** a `BEFORE INSERT/UPDATE` trigger enforcing the same invariant.

### B2 — HIGH: `push_student_progress` has no parent path (Risk 2)
`push_student_progress` validates only via `_validate_pin_session` (token). A parent-owned child session cannot call it. Draft: **retire it** in favor of the direct-upsert path (after B1), **or** add an `auth.uid()`-owner branch mirroring `push_quiz_scores`.

### B3 — MEDIUM: harden unauthenticated settings getters (Risk 4)
`get_quiz_settings` (DRAFT `20260717`) and any superseded single-arg settings getters do `WHERE id = p_student_id` with no ownership/token check, granted to `anon`. Confirm the hardened 2-arg versions are deployed and harden/replace the DRAFT quiz-settings getter before it ships.

### B4 — MEDIUM: verify `intervention_events` RLS (Risk 5)
`intervention_events` upsert/select (`dashboard.js:6312/6328`) has **no table/RLS definition anywhere in the repo**. Verify against the live DB that it is owner-scoped before the new client relies on it. (Note: intervention overlays are already flag-off in the simplified product; confirm whether this path is even reachable.)

### B5 — refactor `create_student_profile` (mixed object)
It creates a child **and** mints `family_code` + `pin_hash`. Do **not** drop it — children still need creating. Draft an edit (or a new `create_child` RPC) that inserts the profile under `parent_id = auth.uid()` **without** minting family code / PIN hash.

---

## 4. Bucket C — Production cleanup AFTER deploy + traffic drain

Only after (a) the new client is deployed, (b) analytics show `verify_student_pin` / `get_profiles_by_family_code` call volume has fallen to ~zero for a full deprecation window, and (c) live-DB verification confirms no active `pin_sessions`.

**Revoke anon grants**, then **drop**, in order:
1. Disable the `cleanup_expired_pin_sessions` scheduled job.
2. Revoke `anon` EXECUTE on: `verify_student_pin`, `get_profiles_by_family_code`, `pull_student_progress`, `push_student_progress`, `reset_student_data`, `push_quiz_scores`, `get_student_progress_by_pin`, and the settings getters. (Retain `authenticated` grants for the objects still used by the parent path.)
3. Drop student-PIN objects: `verify_student_pin`, `_validate_pin_session`, `reset_student_pin`, `cleanup_expired_pin_sessions`, `ensure_family_code`, `_generate_family_code`, `get_profiles_by_family_code`.
4. Drop tables `pin_sessions`, `pin_attempts`.
5. Drop columns `profiles.family_code`, `student_profiles.pin_hash`.

**Never removed (shared / parent path):** `get_student_progress_by_pin` (parent branch — only the token branch is deleted), `push_quiz_scores` (parent branch), `get_all_student_settings`/`get_unlock_settings`/`get_timer_settings`/`get_a11y_settings` (parent branch), `get_pin_hash`/`update_pin_hash` (parent PIN), `check_and_increment_rate_limit`/`api_rate_limits` (shared with gemini/waitlist — only the `family_code:` key usage disappears).

---

## 5. Object classification (from audits)

| Object | Type | Bucket | Note |
|---|---|---|---|
| `verify_student_pin` | RPC (anon) | C | keep for old clients → revoke+drop after drain |
| `get_profiles_by_family_code` | RPC (anon) | C | family-code login lookup |
| `reset_student_pin` | RPC (auth) | C | remove after clients stop PIN reset |
| `pull_student_progress` | RPC (token) | C | superseded by parent `get_student_progress_by_pin` |
| `_validate_pin_session` | DB helper | C | drop after all PIN RPC callers gone |
| `cleanup_expired_pin_sessions` | cron RPC | C | disable job, then drop |
| `pin_sessions`, `pin_attempts` | tables | C (+manual verify) | confirm no live tokens first |
| `_generate_family_code`, `ensure_family_code` | helpers | C | retire with family code |
| `profiles.family_code`, `student_profiles.pin_hash` | columns | C | drop after readers gone |
| `create_student_profile` | RPC | **B5** | edit (stop minting code/PIN), do NOT drop |
| `push_student_progress` | RPC | **B2** | no parent path — retire or add owner branch |
| `student_progress` / `quiz_scores` RLS | policy | **B1** | add `student_id` ownership check |
| `get_quiz_settings` (+ superseded getters) | RPC | **B3** | harden anon getter |
| `intervention_events` | table | **B4** | RLS unverifiable from repo |
| `get_student_progress_by_pin`, `push_quiz_scores`, settings getters | RPC | keep | shared; only token branch retires |
| `get_pin_hash`/`update_pin_hash`, `check_and_increment_rate_limit` | RPC | keep | parent PIN / shared rate limit |

---

## 6. Deprecation window

Recommended: keep Bucket C objects live for **at least one full release cycle after the new client is the only build served**, monitoring `verify_student_pin` + `get_profiles_by_family_code` call counts. Proceed to drops only when both are ~0 over the window. (Exact duration to be set by the owner based on PWA update cadence.)

---

## 7. Manual production steps (owner, gated on approval)

Record in `docs/MANUAL_PRODUCTION_ACTIONS.md` when the time comes:
1. Verify live definitions: `pg_get_functiondef` for each Bucket B/C RPC; `\d+ pin_sessions`, `\d+ pin_attempts`.
2. Confirm `verify_student_pin` / `get_profiles_by_family_code` call volume ≈ 0 for the deprecation window.
3. Confirm `SELECT count(*) FROM pin_sessions WHERE expires_at > now()` = 0 before dropping the table.
4. Apply B1 (ownership hardening) **before** deploying the parent-owned-write client to real families.
5. Apply Bucket C revokes/drops only after the window.

---

## 8. Rollback plan

- **Client:** the new client is a normal branch deploy; roll back by redeploying the prior build. Because Bucket C objects remain live during the deprecation window, a rolled-back (old) client keeps working unchanged.
- **B1 RLS tightening:** reversible — restore the prior policy `WITH CHECK (user_id = auth.uid())`. Test in a Supabase branch first.
- **Bucket C drops:** effectively irreversible (data loss for `pin_sessions`/columns). Gate behind §7 verification; take a backup/snapshot before any drop. Do not proceed without owner approval.

---

## 9. Blockers summary (what stands between "client done" and "safe for real families")

1. **B1 ownership hardening must be applied** before the parent-owned-write client reaches real families (else cross-family write risk).
2. **B2 `push_student_progress`** path decided (retire vs. owner branch).
3. **B3/B4** anon-getter + `intervention_events` verification.
4. Everything else (Bucket C) is post-deploy cleanup with no client blocker.
