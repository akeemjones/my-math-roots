-- supabase/migrations/20260502_analytics_rpcs.sql
-- Named SECURITY DEFINER RPCs for each admin analytics metric.
-- Called by analytics-query.js (service role) — NOT callable by anon or authenticated clients.

CREATE OR REPLACE FUNCTION public.analytics_dau()
RETURNS TABLE(day date, dau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('day', created_at)::date AS day,
         COUNT(DISTINCT student_id) AS dau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_wau()
RETURNS TABLE(week_start date, wau bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('week', created_at)::date AS week_start,
         COUNT(DISTINCT student_id) AS wau
  FROM app_events
  WHERE event_name = 'session_started' AND student_id IS NOT NULL
    AND created_at >= NOW() - INTERVAL '90 days'
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_session_duration()
RETURNS TABLE(avg_duration_secs numeric, session_count bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT ROUND(AVG((metadata_json->>'duration_secs')::numeric)) AS avg_duration_secs,
         COUNT(*) AS session_count
  FROM app_events
  WHERE event_name = 'session_ended'
    AND metadata_json->>'duration_secs' IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days';
$$;

CREATE OR REPLACE FUNCTION public.analytics_quiz_completion()
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
      AND created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT started, completed, abandoned,
    ROUND(completed::numeric / NULLIF(started,0) * 100, 1),
    ROUND(abandoned::numeric / NULLIF(started,0) * 100, 1)
  FROM base;
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_1d()
RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH cohort AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE
  ), returned AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= CURRENT_DATE
  )
  SELECT COUNT(DISTINCT c.student_id),
         COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_7d()
RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH cohort AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days'
  ), returned AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '7 days'
  )
  SELECT COUNT(DISTINCT c.student_id),
         COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_retention_30d()
RETURNS TABLE(cohort_size bigint, retained bigint, retention_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH cohort AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
  ), returned AS (
    SELECT DISTINCT student_id FROM app_events
    WHERE event_name = 'session_started' AND student_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT COUNT(DISTINCT c.student_id),
         COUNT(DISTINCT r.student_id),
         ROUND(COUNT(DISTINCT r.student_id)::numeric / NULLIF(COUNT(DISTINCT c.student_id),0) * 100, 1)
  FROM cohort c LEFT JOIN returned r USING (student_id);
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_grades()
RETURNS TABLE(grade text, student_count bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT grade, COUNT(DISTINCT student_id)
  FROM app_events
  WHERE grade IS NOT NULL AND student_id IS NOT NULL
    AND event_name = 'session_started'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 2 DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_units()
RETURNS TABLE(unit_id text, start_count bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT unit_id, COUNT(*), COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name = 'unit_started' AND unit_id IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_hardest_lessons()
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
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY lesson_id
  )
  SELECT lesson_id, starts, interventions, resolved,
    ROUND(interventions::numeric / NULLIF(starts,0), 2),
    ROUND(resolved::numeric / NULLIF(interventions,0) * 100, 1)
  FROM ls WHERE starts > 0
  ORDER BY 5 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_error_tags()
RETURNS TABLE(error_tag text, occurrences bigint, affected_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT metadata_json->>'error_tag' AS error_tag,
         COUNT(*), COUNT(DISTINCT student_id)
  FROM app_events
  WHERE event_name = 'intervention_shown'
    AND metadata_json->>'error_tag' IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.analytics_report_usage()
RETURNS TABLE(day date, report_count bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('day', created_at)::date,
         COUNT(*), COUNT(DISTINCT parent_id)
  FROM app_events
  WHERE event_name = 'report_generated'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_bill_risk()
RETURNS TABLE(gemini_calls_7d bigint, unique_parents_7d bigint, gemini_calls_24h bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*),
         COUNT(DISTINCT parent_id),
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')
  FROM app_events
  WHERE event_name = 'report_generated'
    AND created_at >= NOW() - INTERVAL '7 days';
$$;

CREATE OR REPLACE FUNCTION public.analytics_parent_usage()
RETURNS TABLE(day date, opens bigint, unique_parents bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT DATE_TRUNC('day', created_at)::date,
         COUNT(*), COUNT(DISTINCT parent_id)
  FROM app_events
  WHERE event_name = 'parent_dashboard_opened'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 1;
$$;

-- Revoke public execute — service role access only (via Netlify function)
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'analytics_dau()','analytics_wau()','analytics_session_duration()',
    'analytics_quiz_completion()','analytics_retention_1d()','analytics_retention_7d()',
    'analytics_retention_30d()','analytics_top_grades()','analytics_top_units()',
    'analytics_hardest_lessons()','analytics_error_tags()','analytics_report_usage()',
    'analytics_bill_risk()','analytics_parent_usage()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
