-- supabase/migrations/20260523_analytics_custom_date_range.sql
-- Analytics — extends every admin RPC to accept p_from TIMESTAMPTZ and
-- p_to TIMESTAMPTZ alongside the existing p_days/p_grade params.
--
-- Behavior:
--   When p_from / p_to are both provided, the window becomes exactly
--   [p_from, p_to] (admin-supplied custom range).
--   When either is NULL, the existing p_days preset behavior applies.
--   The client (analytics-query.js) is the authoritative validator; this
--   migration just defends in depth via COALESCE / IS NULL guards.
--
-- All RPCs stay SECURITY DEFINER with EXECUTE revoked from anon/authenticated.
-- The 'special' RPCs (retention windows, total_students, bill_risk) accept
-- p_from/p_to for call-signature symmetry but ignore them — their windows
-- are anchored by definition.

-- ─────────────────────────────────────────────────────────────────────────
-- Standard RPCs — replace `created_at >= NOW() - INTERVAL` with the
-- COALESCE(p_from, …) + (p_to IS NULL OR created_at <= p_to) pattern.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.analytics_dau(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(day date, dau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT DATE_TRUNC('day', created_at)::date AS day,
         COUNT(DISTINCT student_id)           AS dau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_wau(
  p_days INTEGER DEFAULT 90, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(week_start date, wau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT DATE_TRUNC('week', created_at)::date AS week_start,
         COUNT(DISTINCT student_id)            AS wau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 90) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_session_duration(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(avg_duration_secs numeric, session_count bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT ROUND(AVG((metadata_json->>'duration_secs')::numeric)) AS avg_duration_secs,
         COUNT(*)                                                AS session_count
  FROM app_events
  WHERE event_name = 'session_ended'
    AND metadata_json->>'duration_secs' IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade);
$$;

CREATE OR REPLACE FUNCTION public.analytics_quiz_completion(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(started bigint, completed bigint, abandoned bigint,
                completion_pct numeric, abandonment_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
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
      AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT started, completed, abandoned,
    ROUND(completed::numeric / NULLIF(started,0) * 100, 1),
    ROUND(abandoned::numeric / NULLIF(started,0) * 100, 1)
  FROM base;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_grades(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(grade text, student_count bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT grade, COUNT(DISTINCT student_id) AS student_count
  FROM app_events
  WHERE grade IS NOT NULL AND student_id IS NOT NULL
    AND event_name = 'session_started'
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 2 DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_units(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(unit_id text, start_count bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT unit_id, COUNT(*), COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name = 'unit_started' AND unit_id IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_hardest_lessons(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(lesson_id text, starts bigint, interventions bigint,
                resolved bigint, interventions_per_start numeric, resolution_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH ls AS (
    SELECT lesson_id,
      COUNT(*) FILTER (WHERE event_name = 'lesson_started') AS starts,
      COUNT(*) FILTER (WHERE event_name = 'intervention_shown') AS interventions,
      COUNT(*) FILTER (WHERE event_name = 'intervention_completed'
        AND (metadata_json->>'resolved_correctly')::boolean = true) AS resolved
    FROM app_events
    WHERE event_name IN ('lesson_started','intervention_shown','intervention_completed')
      AND lesson_id IS NOT NULL
      AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY lesson_id
  )
  SELECT lesson_id, starts, interventions, resolved,
    ROUND(interventions::numeric / NULLIF(starts,0), 2),
    ROUND(resolved::numeric / NULLIF(interventions,0) * 100, 1)
  FROM ls WHERE starts > 0
  ORDER BY 5 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_error_tags(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(error_tag text, occurrences bigint, affected_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT metadata_json->>'error_tag', COUNT(*), COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name = 'intervention_shown'
    AND metadata_json->>'error_tag' IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_report_usage(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(day date, report_count bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT DATE_TRUNC('day', created_at)::date, COUNT(*), COUNT(DISTINCT parent_id)
  FROM app_events
  WHERE event_name = 'report_generated'
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_parent_usage(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(day date, opens bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT DATE_TRUNC('day', created_at)::date, COUNT(*), COUNT(DISTINCT parent_id)
  FROM app_events
  WHERE event_name = 'parent_dashboard_opened'
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_mau(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(mau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade);
$$;

CREATE OR REPLACE FUNCTION public.analytics_drop_off_funnel(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(stage text, step_idx int, students bigint, events bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH events_in_window AS (
    SELECT event_name, student_id
    FROM app_events
    WHERE event_name IN ('app_opened','student_app_opened','unit_viewed',
                         'lesson_viewed','quiz_started','quiz_completed',
                         'quiz_abandoned')
      AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
  ),
  stages(stage, step_idx) AS (
    VALUES
      ('app_opened', 1), ('student_app_opened', 2), ('unit_viewed', 3),
      ('lesson_viewed', 4), ('quiz_started', 5), ('quiz_completed', 6),
      ('quiz_abandoned', 7)
  )
  SELECT s.stage, s.step_idx,
         COUNT(DISTINCT e.student_id), COUNT(e.student_id)
  FROM stages s
  LEFT JOIN events_in_window e ON e.event_name = s.stage
  GROUP BY s.stage, s.step_idx
  ORDER BY s.step_idx;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_lessons(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(lesson_id text, views bigint, starts bigint, completions bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT lesson_id,
         COUNT(*) FILTER (WHERE event_name = 'lesson_viewed'),
         COUNT(*) FILTER (WHERE event_name = 'lesson_started'),
         COUNT(*) FILTER (WHERE event_name = 'lesson_completed'),
         COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name IN ('lesson_viewed','lesson_started','lesson_completed')
    AND lesson_id IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY lesson_id
  ORDER BY (COUNT(*) FILTER (WHERE event_name = 'lesson_started')) DESC,
           (COUNT(*) FILTER (WHERE event_name = 'lesson_viewed')) DESC
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_hint_usage(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(total_hints bigint, unique_students bigint, hints_per_student numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH base AS (
    SELECT COUNT(*) AS total_hints, COUNT(DISTINCT student_id) AS uniq
    FROM app_events
    WHERE event_name = 'hint_used'
      AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
  )
  SELECT total_hints, uniq,
         ROUND(total_hints::numeric / NULLIF(uniq, 0), 2)
  FROM base;
$$;

CREATE OR REPLACE FUNCTION public.analytics_free_mode_usage(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(total bigint, turned_on bigint, turned_off bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE (metadata_json->>'next')::boolean = true),
    COUNT(*) FILTER (WHERE (metadata_json->>'next')::boolean = false),
    COUNT(DISTINCT parent_id)
  FROM app_events
  WHERE event_name = 'free_mode_changed'
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade);
$$;

CREATE OR REPLACE FUNCTION public.analytics_reset_usage(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(total bigint, unique_parents bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*), COUNT(DISTINCT parent_id), COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name = 'student_reset'
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade);
$$;

CREATE OR REPLACE FUNCTION public.analytics_unlock_usage(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(scope text, action text, total bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT metadata_json->>'scope', metadata_json->>'action',
         COUNT(*), COUNT(DISTINCT parent_id)
  FROM app_events
  WHERE event_name = 'manual_unlock_changed'
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1, 2 ORDER BY 3 DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_returning_students(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(active_students bigint, returning_count bigint, returning_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH per_student AS (
    SELECT student_id, COUNT(DISTINCT DATE_TRUNC('day', created_at)) AS days_active
    FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY student_id
  )
  SELECT COUNT(*), COUNT(*) FILTER (WHERE days_active >= 2),
         ROUND(COUNT(*) FILTER (WHERE days_active >= 2)::numeric / NULLIF(COUNT(*), 0) * 100, 1)
  FROM per_student;
$$;

CREATE OR REPLACE FUNCTION public.analytics_sessions_per_student(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(active_students bigint, avg_sessions numeric, min_sessions int, max_sessions int)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH per_student AS (
    SELECT student_id, COUNT(*)::int AS session_count
    FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY student_id
  )
  SELECT COUNT(*), ROUND(AVG(session_count)::numeric, 1),
         MIN(session_count), MAX(session_count)
  FROM per_student;
$$;

CREATE OR REPLACE FUNCTION public.analytics_new_signups(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(day date, parent_signups bigint, student_signups bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public, auth AS $$
  WITH parent_days AS (
    SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*) AS n
    FROM auth.users
    WHERE created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
    GROUP BY 1
  ),
  student_days AS (
    SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*) AS n
    FROM public.student_profiles
    WHERE created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
      AND (p_to IS NULL OR created_at <= p_to)
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY 1
  )
  SELECT COALESCE(p.day, s.day), COALESCE(p.n, 0), COALESCE(s.n, 0)
  FROM parent_days p
  FULL OUTER JOIN student_days s ON p.day = s.day
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_avg_score(
  p_days INTEGER DEFAULT 30, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL,
  p_breakdown TEXT DEFAULT 'lesson'
) RETURNS TABLE(key text, avg_pct numeric, attempts bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE
      WHEN p_breakdown = 'grade'  THEN grade
      WHEN p_breakdown = 'unit'   THEN unit_id
      WHEN p_breakdown = 'lesson' THEN lesson_id
    END                                                  AS key,
    ROUND(AVG((metadata_json->>'pct')::numeric), 1)      AS avg_pct,
    COUNT(*)                                             AS attempts,
    COUNT(DISTINCT student_id)                           AS unique_students
  FROM app_events
  WHERE event_name IN ('lesson_completed','quiz_completed')
    AND p_breakdown IN ('grade','unit','lesson')
    AND metadata_json ? 'pct'
    AND metadata_json->>'pct' ~ '^-?\d+(\.\d+)?$'
    AND (metadata_json->>'quit')::boolean      IS NOT TRUE
    AND (metadata_json->>'abandoned')::boolean IS NOT TRUE
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
    AND (p_grade IS NULL OR grade = p_grade)
  GROUP BY 1
  HAVING (
    CASE
      WHEN p_breakdown = 'grade'  THEN grade
      WHEN p_breakdown = 'unit'   THEN unit_id
      WHEN p_breakdown = 'lesson' THEN lesson_id
    END
  ) IS NOT NULL
  ORDER BY avg_pct DESC NULLS LAST, attempts DESC
  LIMIT 50;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Special RPCs — accept p_from / p_to for call-signature symmetry but
-- ignore them. Retention windows are anchored to "now" / yesterday / etc.
-- by definition; total_students is point-in-time; bill_risk is fixed 7d.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.analytics_retention_1d(
  p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
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
  SELECT COUNT(DISTINCT c.student_id), COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_7d(
  p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
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
  SELECT COUNT(DISTINCT c.student_id), COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_30d(
  p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
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
  SELECT COUNT(DISTINCT c.student_id), COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_total_students(
  p_days INTEGER DEFAULT NULL, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(total bigint, with_recent_activity bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH active AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE student_id IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT (SELECT COUNT(*) FROM student_profiles), (SELECT COUNT(*) FROM active);
$$;

CREATE OR REPLACE FUNCTION public.analytics_bill_risk(
  p_days INTEGER DEFAULT 7, p_grade TEXT DEFAULT NULL,
  p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(gemini_calls_7d bigint, unique_parents_7d bigint, gemini_calls_24h bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*), COUNT(DISTINCT parent_id),
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')
  FROM app_events
  WHERE event_name = 'report_generated'
    AND created_at >= NOW() - INTERVAL '7 days';
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Revoke direct EXECUTE on the new signatures.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'analytics_dau(integer,text,timestamptz,timestamptz)',
    'analytics_wau(integer,text,timestamptz,timestamptz)',
    'analytics_session_duration(integer,text,timestamptz,timestamptz)',
    'analytics_quiz_completion(integer,text,timestamptz,timestamptz)',
    'analytics_retention_1d(integer,text,timestamptz,timestamptz)',
    'analytics_retention_7d(integer,text,timestamptz,timestamptz)',
    'analytics_retention_30d(integer,text,timestamptz,timestamptz)',
    'analytics_top_grades(integer,text,timestamptz,timestamptz)',
    'analytics_top_units(integer,text,timestamptz,timestamptz)',
    'analytics_hardest_lessons(integer,text,timestamptz,timestamptz)',
    'analytics_error_tags(integer,text,timestamptz,timestamptz)',
    'analytics_report_usage(integer,text,timestamptz,timestamptz)',
    'analytics_bill_risk(integer,text,timestamptz,timestamptz)',
    'analytics_parent_usage(integer,text,timestamptz,timestamptz)',
    'analytics_mau(integer,text,timestamptz,timestamptz)',
    'analytics_total_students(integer,text,timestamptz,timestamptz)',
    'analytics_drop_off_funnel(integer,text,timestamptz,timestamptz)',
    'analytics_top_lessons(integer,text,timestamptz,timestamptz)',
    'analytics_hint_usage(integer,text,timestamptz,timestamptz)',
    'analytics_free_mode_usage(integer,text,timestamptz,timestamptz)',
    'analytics_reset_usage(integer,text,timestamptz,timestamptz)',
    'analytics_unlock_usage(integer,text,timestamptz,timestamptz)',
    'analytics_new_signups(integer,text,timestamptz,timestamptz)',
    'analytics_returning_students(integer,text,timestamptz,timestamptz)',
    'analytics_sessions_per_student(integer,text,timestamptz,timestamptz)',
    'analytics_avg_score(integer,text,timestamptz,timestamptz,text)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- The old 2- and 3-arg signatures are gone (they're replaced by CREATE OR
-- REPLACE with the new 4/5-arg signature). PostgreSQL's CREATE OR REPLACE
-- FUNCTION requires the same argument list — since we added arguments,
-- the new function effectively replaces (drops + creates) the old one.
-- No explicit DROP needed; the migration succeeded if this comment is read.
