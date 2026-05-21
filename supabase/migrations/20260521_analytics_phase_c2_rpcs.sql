-- supabase/migrations/20260521_analytics_phase_c2_rpcs.sql
-- Analytics Phase C.2 — admin RPCs gain p_days and p_grade filters,
-- plus new RPCs for MAU, total students, drop-off funnel, top lessons,
-- and per-action usage counts (hints, free-mode toggles, resets, unlocks).
--
-- KEEP IN SYNC with:
--   netlify/functions/analytics-query.js  METRIC_TO_RPC
--   src/admin-analytics.js                METRICS array
--
-- All RPCs remain SECURITY DEFINER and have EXECUTE revoked from PUBLIC /
-- anon / authenticated — only the service role (used by analytics-query
-- behind the admin gate) can invoke them.

-- ── Drop existing RPCs so we can re-create with new parameter list ───────
DROP FUNCTION IF EXISTS public.analytics_dau();
DROP FUNCTION IF EXISTS public.analytics_wau();
DROP FUNCTION IF EXISTS public.analytics_session_duration();
DROP FUNCTION IF EXISTS public.analytics_quiz_completion();
DROP FUNCTION IF EXISTS public.analytics_retention_1d();
DROP FUNCTION IF EXISTS public.analytics_retention_7d();
DROP FUNCTION IF EXISTS public.analytics_retention_30d();
DROP FUNCTION IF EXISTS public.analytics_top_grades();
DROP FUNCTION IF EXISTS public.analytics_top_units();
DROP FUNCTION IF EXISTS public.analytics_hardest_lessons();
DROP FUNCTION IF EXISTS public.analytics_error_tags();
DROP FUNCTION IF EXISTS public.analytics_report_usage();
DROP FUNCTION IF EXISTS public.analytics_bill_risk();
DROP FUNCTION IF EXISTS public.analytics_parent_usage();

-- ─────────────────────────────────────────────────────────────────────────
-- Updated RPCs — accept p_days INTEGER DEFAULT 30 and p_grade TEXT DEFAULT NULL.
-- p_days is clamped at the application layer (analytics-query) to {7,30,90}.
-- p_grade IS NULL ⇒ "all grades".
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.analytics_dau(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(day date, dau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('day', created_at)::date AS day,
         COUNT(DISTINCT student_id)           AS dau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_wau(p_days INTEGER DEFAULT 90, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(week_start date, wau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('week', created_at)::date AS week_start,
         COUNT(DISTINCT student_id)            AS wau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 90) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_session_duration(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(avg_duration_secs numeric, session_count bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT ROUND(AVG((metadata_json->>'duration_secs')::numeric)) AS avg_duration_secs,
         COUNT(*)                                                AS session_count
  FROM app_events
  WHERE event_name = 'session_ended'
    AND metadata_json->>'duration_secs' IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade);
$$;

CREATE OR REPLACE FUNCTION public.analytics_quiz_completion(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(started bigint, completed bigint, abandoned bigint,
              completion_pct numeric, abandonment_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH base AS (
    SELECT
      COUNT(*) FILTER (WHERE event_name = 'quiz_started') AS started,
      COUNT(*) FILTER (WHERE event_name = 'quiz_completed'
        AND (metadata_json->>'quit')::boolean IS NOT TRUE
        AND (metadata_json->>'abandoned')::boolean IS NOT TRUE) AS completed,
      COUNT(*) FILTER (WHERE event_name = 'quiz_completed'
        AND ((metadata_json->>'quit')::boolean = true
          OR (metadata_json->>'abandoned')::boolean = true)) AS abandoned
    FROM app_events
    WHERE event_name IN ('quiz_started','quiz_completed')
      AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT started, completed, abandoned,
    ROUND(completed::numeric / NULLIF(started,0) * 100, 1),
    ROUND(abandoned::numeric / NULLIF(started,0) * 100, 1)
  FROM base;
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_1d(p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  -- 1-day retention is fixed-window by definition. p_days is accepted for
  -- API symmetry but ignored.
  WITH cohort AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE
      AND (p_grade IS NULL OR grade = p_grade)
  ), returned AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= CURRENT_DATE
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT COUNT(DISTINCT c.student_id),
         COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_7d(p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH cohort AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days'
      AND (p_grade IS NULL OR grade = p_grade)
  ), returned AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '7 days'
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT COUNT(DISTINCT c.student_id),
         COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_30d(p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH cohort AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
      AND (p_grade IS NULL OR grade = p_grade)
  ), returned AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT COUNT(DISTINCT c.student_id),
         COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_grades(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(grade text, student_count bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT grade, COUNT(DISTINCT student_id) AS student_count
  FROM app_events
  WHERE grade IS NOT NULL AND student_id IS NOT NULL
    AND event_name = 'session_started'
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 2 DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_units(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(unit_id text, start_count bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT unit_id,
         COUNT(*)                    AS start_count,
         COUNT(DISTINCT student_id)  AS unique_students
  FROM app_events
  WHERE event_name = 'unit_started' AND unit_id IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_hardest_lessons(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(lesson_id text, starts bigint, interventions bigint,
              resolved bigint, interventions_per_start numeric, resolution_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH ls AS (
    SELECT lesson_id,
      COUNT(*) FILTER (WHERE event_name = 'lesson_started') AS starts,
      COUNT(*) FILTER (WHERE event_name = 'intervention_shown') AS interventions,
      COUNT(*) FILTER (WHERE event_name = 'intervention_completed'
        AND (metadata_json->>'resolved_correctly')::boolean = true) AS resolved
    FROM app_events
    WHERE event_name IN ('lesson_started','intervention_shown','intervention_completed')
      AND lesson_id IS NOT NULL
      AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY lesson_id
  )
  SELECT lesson_id, starts, interventions, resolved,
    ROUND(interventions::numeric / NULLIF(starts,0), 2),
    ROUND(resolved::numeric / NULLIF(interventions,0) * 100, 1)
  FROM ls WHERE starts > 0
  ORDER BY 5 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_error_tags(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(error_tag text, occurrences bigint, affected_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT metadata_json->>'error_tag' AS error_tag,
         COUNT(*)                     AS occurrences,
         COUNT(DISTINCT student_id)   AS affected_students
  FROM app_events
  WHERE event_name = 'intervention_shown'
    AND metadata_json->>'error_tag' IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_report_usage(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(day date, report_count bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('day', created_at)::date AS day,
         COUNT(*)                            AS report_count,
         COUNT(DISTINCT parent_id)           AS unique_parents
  FROM app_events
  WHERE event_name = 'report_generated'
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_bill_risk(p_days INTEGER DEFAULT 7, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(gemini_calls_7d bigint, unique_parents_7d bigint, gemini_calls_24h bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  -- bill-risk is intentionally a fixed 7-day window for the weekly figure;
  -- p_days/p_grade accepted for API symmetry only.
  SELECT COUNT(*) AS gemini_calls_7d,
         COUNT(DISTINCT parent_id) AS unique_parents_7d,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') AS gemini_calls_24h
  FROM app_events
  WHERE event_name = 'report_generated'
    AND created_at >= NOW() - INTERVAL '7 days';
$$;

CREATE OR REPLACE FUNCTION public.analytics_parent_usage(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(day date, opens bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('day', created_at)::date AS day,
         COUNT(*)                            AS opens,
         COUNT(DISTINCT parent_id)           AS unique_parents
  FROM app_events
  WHERE event_name = 'parent_dashboard_opened'
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
  GROUP BY 1 ORDER BY 1;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- New RPCs (Phase C.2)
-- ─────────────────────────────────────────────────────────────────────────

-- Monthly active students (last 30 days by default).
CREATE OR REPLACE FUNCTION public.analytics_mau(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(mau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(DISTINCT student_id) AS mau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade);
$$;

-- Total student profiles in the system. Pseudonymous count only.
CREATE OR REPLACE FUNCTION public.analytics_total_students(p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(total bigint, with_recent_activity bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH active AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT
    (SELECT COUNT(*) FROM student_profiles)         AS total,
    (SELECT COUNT(*) FROM active)                   AS with_recent_activity;
$$;

-- Drop-off funnel — counts unique students at each stage over the window.
-- Stages mirror the user's spec exactly.
CREATE OR REPLACE FUNCTION public.analytics_drop_off_funnel(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(stage text, step_idx int, students bigint, events bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH events_in_window AS (
    SELECT event_name, student_id
    FROM app_events
    WHERE event_name IN ('app_opened','student_app_opened','unit_viewed',
                         'lesson_viewed','quiz_started','quiz_completed',
                         'quiz_abandoned')
      AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
  ),
  stages(stage, step_idx) AS (
    VALUES
      ('app_opened',         1),
      ('student_app_opened', 2),
      ('unit_viewed',        3),
      ('lesson_viewed',      4),
      ('quiz_started',       5),
      ('quiz_completed',     6),
      ('quiz_abandoned',     7)
  )
  SELECT s.stage,
         s.step_idx,
         COUNT(DISTINCT e.student_id) AS students,
         COUNT(e.student_id)          AS events
  FROM stages s
  LEFT JOIN events_in_window e ON e.event_name = s.stage
  GROUP BY s.stage, s.step_idx
  ORDER BY s.step_idx;
$$;

-- Top lessons — most-viewed (Phase B lesson_viewed) and most-completed.
CREATE OR REPLACE FUNCTION public.analytics_top_lessons(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(lesson_id text, views bigint, starts bigint, completions bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT lesson_id,
         COUNT(*) FILTER (WHERE event_name = 'lesson_viewed')    AS views,
         COUNT(*) FILTER (WHERE event_name = 'lesson_started')   AS starts,
         COUNT(*) FILTER (WHERE event_name = 'lesson_completed') AS completions,
         COUNT(DISTINCT student_id)                              AS unique_students
  FROM app_events
  WHERE event_name IN ('lesson_viewed','lesson_started','lesson_completed')
    AND lesson_id IS NOT NULL
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY lesson_id
  ORDER BY (COUNT(*) FILTER (WHERE event_name = 'lesson_started')) DESC,
           views DESC
  LIMIT 20;
$$;

-- Hint usage — count and unique students.
CREATE OR REPLACE FUNCTION public.analytics_hint_usage(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(total_hints bigint, unique_students bigint, hints_per_student numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH base AS (
    SELECT COUNT(*) AS total_hints, COUNT(DISTINCT student_id) AS uniq
    FROM app_events
    WHERE event_name = 'hint_used'
      AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT total_hints, uniq AS unique_students,
         ROUND(total_hints::numeric / NULLIF(uniq, 0), 2) AS hints_per_student
  FROM base;
$$;

-- Free-Mode toggles (on/off transitions).
CREATE OR REPLACE FUNCTION public.analytics_free_mode_usage(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(total bigint, turned_on bigint, turned_off bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COUNT(*)                                                                          AS total,
    COUNT(*) FILTER (WHERE (metadata_json->>'next')::boolean = true)                  AS turned_on,
    COUNT(*) FILTER (WHERE (metadata_json->>'next')::boolean = false)                 AS turned_off,
    COUNT(DISTINCT parent_id)                                                          AS unique_parents
  FROM app_events
  WHERE event_name = 'free_mode_changed'
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade);
$$;

-- Student-reset usage (parent action; per-event override means student_id reflects target).
CREATE OR REPLACE FUNCTION public.analytics_reset_usage(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(total bigint, unique_parents bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*) AS total,
         COUNT(DISTINCT parent_id)  AS unique_parents,
         COUNT(DISTINCT student_id) AS unique_students
  FROM app_events
  WHERE event_name = 'student_reset'
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade);
$$;

-- Manual unlock / relock usage, broken down by scope + action.
CREATE OR REPLACE FUNCTION public.analytics_unlock_usage(p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL)
RETURNS TABLE(scope text, action text, total bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT metadata_json->>'scope'  AS scope,
         metadata_json->>'action' AS action,
         COUNT(*)                  AS total,
         COUNT(DISTINCT parent_id) AS unique_parents
  FROM app_events
  WHERE event_name = 'manual_unlock_changed'
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1, 2
  ORDER BY 3 DESC;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Revoke direct execute access — only the service role (via the admin-only
-- Netlify analytics-query function) can invoke these.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'analytics_dau(integer,text)','analytics_wau(integer,text)',
    'analytics_session_duration(integer,text)','analytics_quiz_completion(integer,text)',
    'analytics_retention_1d(integer,text)','analytics_retention_7d(integer,text)',
    'analytics_retention_30d(integer,text)','analytics_top_grades(integer,text)',
    'analytics_top_units(integer,text)','analytics_hardest_lessons(integer,text)',
    'analytics_error_tags(integer,text)','analytics_report_usage(integer,text)',
    'analytics_bill_risk(integer,text)','analytics_parent_usage(integer,text)',
    'analytics_mau(integer,text)','analytics_total_students(integer,text)',
    'analytics_drop_off_funnel(integer,text)','analytics_top_lessons(integer,text)',
    'analytics_hint_usage(integer,text)','analytics_free_mode_usage(integer,text)',
    'analytics_reset_usage(integer,text)','analytics_unlock_usage(integer,text)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
