# Manual production actions

Work on `feature/simplified-product` that **cannot be completed from the
repository alone**. Nothing here has been done. Nothing has been deployed and
nothing has been merged.

Each item says what is live now, what the branch changed, why the repo cannot
finish the job, and what a human must do.

---

## 1. Retire the push-notification backend and its daily cron

**Status: LIVE in production. Not touched by this branch.**

What exists:

| Piece | Where | State |
|---|---|---|
| Edge function | `supabase/functions/send-push/index.ts` | Deployed, retained in repo |
| Daily cron | Supabase `cron.job` — `daily-push-reminder` | **Scheduled and running** |
| Subscriptions table | `push_subscriptions` | Holds real rows |
| SW push handler | `sw.js:27-40` | Deployed |
| Client | `src/settings.js` push functions | Flag-gated off this branch |

Evidence the cron is live: `supabase/migrations/20260607_app_events_anon_cap.sql:24-25`
states that direct `cron.job` inspection on production "confirms the only
scheduled job is daily-push-reminder".

**Why the repo cannot finish this.** The cron lives in the database, not in
version control. Deleting `send-push/index.ts` locally would only stop it being
*re-deployed*; the already-deployed function and its schedule would keep
running, and the cron would then invoke a function that no longer exists.
Sequence matters.

**What the branch did:** disabled the client half only (unreachable already —
nothing renders `push-toggle-btn` / `push-notif-section`) and removed the
misleading third-visit toast telling students to "Enable in Settings →
Notifications", a section that does not exist. The function, cron, table and
service worker handler are untouched.

**Required actions, in order:**

1. Inspect the live schedule and confirm what it targets and whether it is
   still sending:
   ```sql
   SELECT jobid, schedule, command, active FROM cron.job;
   SELECT count(*) FROM push_subscriptions;
   ```
2. Decide whether any real subscriber would lose a notification they expect.
   The client could not have been enabled through the UI, so any rows are
   likely from testing — **confirm before assuming**.
3. Unschedule the job **first**, so it can never call a missing function:
   ```sql
   SELECT cron.unschedule('daily-push-reminder');
   ```
4. Only then remove the deployed function (`supabase functions delete send-push`).
5. Delete `supabase/functions/send-push/` and `tests/send-push-key-resolver.test.js`
   from the repo, and drop the push handler from `sw.js`, in one commit.
6. Decide the fate of `push_subscriptions` and `sw.js`'s reference to
   `/icon-192-v5.1.png`, **an asset that does not exist** — a push notification
   would render a broken icon today.

**Until step 3 is done, do not delete anything.** The tests for
`_resolveSupabaseServiceKey` are kept and passing precisely because the code
they cover is still deployed.

---

## 2. Remove `GEMINI_API_KEY` from the Netlify environment

**Status: the key is now referenced by nothing.**

Both consumers are deleted on this branch: `netlify/functions/gemini-hint.js`
(orphaned, zero callers) and `netlify/functions/gemini-report.js` (replaced by
an on-device deterministic summary). Verified: zero hits for `GEMINI_API_KEY`
across `netlify/` and `supabase/`.

**Required action:** after this branch is merged and deployed, delete
`GEMINI_API_KEY` from the Netlify environment. Do not delete it before, or the
currently deployed functions break while still live.

**Related:** `/.netlify/functions/gemini-hint` and `/.netlify/functions/gemini-report`
stop being deployed at the next publish. Nothing calls either, so no client
breaks.

---

## 3. Apply the launch-grade enforcement migration

**Status: DRAFT, not applied.**
File: `supabase/migrations/DRAFT_20260716_launch_grade_enforcement.sql`

Grade validation is client-side only. Profile creation is a **direct table
insert**, so the database accepts `'3'`, `'4'`, `'5'` and `NULL` today — a
parent with a session can create a Grade 3 profile with a handcrafted PostgREST
call. Full analysis in the migration header.

**Required actions:** verify against a Supabase **branch** database (not
production), confirm the live `student_profiles_grade_check` matches the
file's assumption, rename off the `DRAFT_` prefix, apply, then re-run
`tests/launch-grades.test.js` against the branch. Keep the client guard as
defense in depth regardless.

---

## 4. Columns no longer written (no action required yet)

`student_profiles.report_last_generated` and `report_last_text` stored the
Gemini report text and its 14-day cooldown. Nothing writes them now. They are
left in place — no migration, no data touched. Drop them only as part of a
deliberate schema cleanup, once no rollback to the AI report is contemplated.

---

## Not manual actions, recorded to prevent confusion

- **Grade 3 content** is withdrawn from customers but retained in the repo and
  in dev builds. No data was deleted. Existing Grade 3 profiles keep
  `student_profiles.grade = '3'` and are moved only by an explicit parent
  choice in the recovery screen.
- **Streak and activity sync** is deliberately unchanged. The UI is hidden; the
  payload `_pushAll` sends is byte-identical, because those fields are
  wholesale last-write-wins server-side and a client that stopped computing
  them while still pushing would destroy real data.
