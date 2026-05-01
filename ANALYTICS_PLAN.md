# My Math Roots — Internal Analytics Plan

## Trust Model

The central security guarantee is that `parent_id` and `student_id` are **never trusted from the client payload**. They are stamped server-side by `analytics-ingest.js` after credential verification.

| What the client sends | How the server resolves it |
|---|---|
| `Authorization: Bearer <supabase_jwt>` | `/auth/v1/user` call → `user.id` → `parent_id` |
| `body.session_token` + `body.student_id` (claimed) | `pin_sessions` query: token + student_id + expires_at → `student_id` |
| `body.student_id` + parent JWT | `student_profiles` ownership check: `id = claimed AND parent_id = verified_parent_id` → `student_id` |
| `parent_id` or `student_id` fields in event payload | Silently ignored by `_validateEvent()` — never written |

`claimed_student_id` passes through `_validateEvent()` as a hint for the server's ownership check only; it is never written directly to the DB.

For `sendBeacon` (unload events that cannot set HTTP headers), the Supabase JWT is embedded as `body._supaJwt`; `analytics-ingest.js` reads it as a fallback when the `Authorization` header is absent.

## Privacy Decisions

**Two-layer PII filtering:**
- Client (`_anaStripPii`): strips keys containing `email`, `name`, `password`, `phone`, `address` before queuing
- Server (`_stripPiiKeys`): repeats the same strip on `metadata_json` before DB insert; additionally clears metadata entirely if any string value matches an email pattern

**What metadata_json never contains:**
- `parent_id`, `student_id`, or any UUID
- Email addresses, names, passwords, phone numbers, physical addresses
- IP addresses
- Session tokens or auth credentials
- Free-text student answers

**IP handling:** Used only for in-memory burst rate limiting in the Netlify function (30 events/min per IP). Never written to any database column.

**Student UUIDs are pseudonymous:** `student_id` values stored in `app_events` are internal UUIDs. They are not linked to student names or email addresses within the analytics pipeline itself. The `student_profiles` table (which holds names) is a separate table not joined in any analytics query.

## COPPA Notice

Analytics are collected during student sessions but are privacy-minimized and pseudonymous. No direct identifiers (names, email addresses) appear in any analytics event. `student_id` values are UUIDs stored internally and not exposed externally or linked to identifiable information in the analytics layer.

## Data Retained

| Column | Type | Notes |
|---|---|---|
| `event_name` | TEXT | Whitelisted 16 values; CHECK constraint enforced at DB level |
| `client_event_id` | TEXT | UNIQUE — deduplicates sendBeacon double-fires |
| `parent_id` | UUID (nullable) | Server-stamped; NULL for anonymous events (e.g. `app_opened`) |
| `student_id` | UUID (nullable) | Server-stamped; NULL for parent-only events |
| `grade` | TEXT (nullable) | K, 1–5 only; validated against allowlist |
| `unit_id` | TEXT (nullable) | Alphanumeric ID, ≤32 chars |
| `lesson_id` | TEXT (nullable) | Alphanumeric ID, ≤32 chars |
| `metadata_json` | JSONB | ≤500 bytes (CHECK constraint + application-level guard) |
| `created_at` | TIMESTAMPTZ | Auto-set; used for TTL and all time-series queries |

**Not stored:** email, name, IP address, location, keystrokes, screen recording, free-text answers, session tokens, auth credentials.

## Retention Policy

All rows older than 90 days are deleted by `cleanup_old_analytics_events()`.

Schedule after enabling `pg_cron`:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'analytics-cleanup',
  '0 3 * * 0',
  'SELECT cleanup_old_analytics_events()'
);
```

## Rate Limiting

Two independent layers prevent runaway clients from causing Supabase bill abuse:

1. **In-memory burst limit** (Netlify function): 30 events/min per IP. Resets every 60 seconds. Fail-silent — returns HTTP 200 without inserting.

2. **Durable hourly cap** (DB trigger `trg_analytics_hourly_cap`): Rejects any insert where the same `parent_id` already has ≥500 rows in the last hour. Fires `BEFORE INSERT`. Anonymous events (`parent_id IS NULL`) are exempt. The Netlify function catches the resulting exception and returns HTTP 200 to the client (fail-silent contract maintained externally).

## Admin Access

- **URL:** `/admin-analytics.html` (not linked from any public page)
- **Auth:** Requires active Supabase session + `profiles.role = 'admin'`
- **Verification:** `analytics-query.js` verifies JWT via `/auth/v1/user`, then checks `profiles.role` via service role query. Returns 401 if either check fails.
- **Search engine exclusion:** `X-Robots-Tag: noindex, nofollow` header (netlify.toml) + `Disallow: /admin-analytics.html` in robots.txt + `<meta name="robots" content="noindex, nofollow">` in page head
- **XSS safety:** `admin-analytics.js` uses `textContent` and `createElement` throughout — no `innerHTML` with API response data

## Instrumentation Map

| File | Event | Insertion point |
|---|---|---|
| `src/boot.js` | `app_opened` | `DOMContentLoaded` listener at bottom of file |
| `src/auth.js` | `session_started` | `enterStudentLearningSession()` — after session is established |
| `src/auth.js` | `session_ended` | `visibilitychange`/`pagehide` handlers in `analytics.js` (auto-fired) |
| `src/auth.js` | `parent_dashboard_opened` | `INITIAL_SESSION` and `SIGNED_IN` parent branches (deduped via `_anaParentDashFired`) |
| `src/auth.js` | `grade_selected` | `switchGrade()` — before `location.reload()` |
| `src/quiz.js` | `lesson_started` | `startLessonQuiz()` inside `.then()` before `_runQuiz` |
| `src/quiz.js` | `lesson_completed` | `_finishQuiz()` `type==='lesson'` branch |
| `src/quiz.js` | `quiz_started` | `startUnitQuiz()` and `startFinalTest()` |
| `src/quiz.js` | `quiz_completed` | `_finishQuiz()` `type==='unit'` and `type==='final'` branches |
| `src/quiz.js` | `unit_test_started` | `startUnitQuiz()` inside `.then()` before `_runQuiz` |
| `src/quiz.js` | `unit_test_completed` | `_finishQuiz()` `type==='unit'` branch |
| `src/quiz.js` | `intervention_shown` | `_pauseForIntervention()` after `_appendInterventionEvent` |
| `src/quiz.js` | `intervention_completed` | `_handleAnswer()` after resolvedEvt's `_appendInterventionEvent` |
| `src/dashboard.js` | `report_generated` | `generateAIReport()` after success path, before `_renderAIReportView` |
| `src/unit.js` | `unit_started` | `openUnit()` after `CUR.unitIdx = idx` |

## Migration Files

Both migrations must be **applied manually** in Supabase Dashboard → SQL Editor. They are not auto-applied.

| File | Purpose | Prerequisite |
|---|---|---|
| `supabase/migrations/20260502_app_events.sql` | `app_events` table, RLS, indexes, hourly-cap trigger, cleanup function | None |
| `supabase/migrations/20260502_analytics_rpcs.sql` | 14 SECURITY DEFINER admin metrics RPCs | Task 1 migration applied |

## Admin Metrics

14 metrics served by `analytics-query.js` via named SECURITY DEFINER RPCs:

| Metric param | RPC | Description |
|---|---|---|
| `dau` | `analytics_dau` | Daily active students (last 30 days) |
| `wau` | `analytics_wau` | Weekly active students (last 90 days) |
| `session_duration` | `analytics_session_duration` | Avg session length (last 30 days) |
| `quiz_completion` | `analytics_quiz_completion` | Quiz start/complete/abandon rates (last 30 days) |
| `retention_1d` | `analytics_retention_1d` | Day-1 retention cohort |
| `retention_7d` | `analytics_retention_7d` | Day-7 retention cohort |
| `retention_30d` | `analytics_retention_30d` | Day-30 retention cohort |
| `top_grades` | `analytics_top_grades` | Students by grade (last 30 days) |
| `top_units` | `analytics_top_units` | Most-started units (last 30 days) |
| `hardest_lessons` | `analytics_hardest_lessons` | Lessons by intervention rate (last 30 days) |
| `error_tags` | `analytics_error_tags` | Top error tags from interventions (last 30 days) |
| `report_usage` | `analytics_report_usage` | AI report generations per day (last 30 days) |
| `bill_risk` | `analytics_bill_risk` | Gemini API call volume (7d + 24h) |
| `parent_usage` | `analytics_parent_usage` | Parent dashboard opens per day (last 30 days) |
