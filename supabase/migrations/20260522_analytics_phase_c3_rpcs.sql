-- supabase/migrations/20260522_analytics_phase_c3_rpcs.sql
-- Analytics Phase C.3A — 4 new admin RPCs:
--   analytics_new_signups            parents + student profiles per day
--   analytics_returning_students     % of active students who returned a 2nd day
--   analytics_sessions_per_student   avg / min / max sessions per active student
--   analytics_avg_score              avg pct, broken down by grade / unit / lesson
--
-- All SECURITY DEFINER. EXECUTE revoked from PUBLIC / anon / authenticated —
-- the admin-only Netlify analytics-query function is the sole entry point.
-- No dynamic SQL: p_breakdown is enforced by an allow-list in the function
-- body (CASE + WHERE p_breakdown IN (...)).

-- ── new signups ──────────────────────────────────────────────────────────
-- Joins are over different tables (auth.users + student_profiles) so we
-- emit one row per day with both counts. Parent accounts don't have a
-- grade, so the grade filter applies only to the student-profile side.
CREATE OR REPLACE FUNCTION public.analytics_new_signups(
  p_days  INTEGER DEFAULT 30,
  p_grade TEXT    DEFAULT NULL
)
RETURNS TABLE(day date, parent_signups bigint, student_signups bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public, auth
AS $$
  WITH parent_days AS (
    SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*) AS n
    FROM auth.users
    WHERE created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
    GROUP BY 1
  ),
  student_days AS (
    SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*) AS n
    FROM public.student_profiles
    WHERE created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY 1
  )
  SELECT COALESCE(p.day, s.day)        AS day,
         COALESCE(p.n,   0)            AS parent_signups,
         COALESCE(s.n,   0)            AS student_signups
  FROM parent_days p
  FULL OUTER JOIN student_days s ON p.day = s.day
  ORDER BY 1;
$$;

-- ── returning students ──────────────────────────────────────────────────
-- "Returning" = active on at least 2 distinct days within the window.
CREATE OR REPLACE FUNCTION public.analytics_returning_students(
  p_days  INTEGER DEFAULT 30,
  p_grade TEXT    DEFAULT NULL
)
RETURNS TABLE(active_students bigint, returning_count bigint, returning_pct numeric)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH per_student AS (
    SELECT student_id, COUNT(DISTINCT DATE_TRUNC('day', created_at)) AS days_active
    FROM app_events
    WHERE event_name = 'session_started'
      AND student_id IS NOT NULL
      AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY student_id
  )
  SELECT
    COUNT(*)                                                          AS active_students,
    COUNT(*) FILTER (WHERE days_active >= 2)                          AS returning_count,
    ROUND(COUNT(*) FILTER (WHERE days_active >= 2)::numeric
          / NULLIF(COUNT(*), 0) * 100, 1)                             AS returning_pct
  FROM per_student;
$$;

-- ── sessions per student ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_sessions_per_student(
  p_days  INTEGER DEFAULT 30,
  p_grade TEXT    DEFAULT NULL
)
RETURNS TABLE(active_students bigint, avg_sessions numeric, min_sessions int, max_sessions int)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  WITH per_student AS (
    SELECT student_id, COUNT(*)::int AS session_count
    FROM app_events
    WHERE event_name = 'session_started'
      AND student_id IS NOT NULL
      AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
      AND (p_grade IS NULL OR grade = p_grade)
    GROUP BY student_id
  )
  SELECT COUNT(*)                                          AS active_students,
         ROUND(AVG(session_count)::numeric, 1)             AS avg_sessions,
         MIN(session_count)                                AS min_sessions,
         MAX(session_count)                                AS max_sessions
  FROM per_student;
$$;

-- ── average score by breakdown (grade / unit / lesson) ──────────────────
-- p_breakdown is allow-listed inside the function body. No dynamic SQL.
-- Rows missing 'pct' or flagged quit/abandoned are excluded.
CREATE OR REPLACE FUNCTION public.analytics_avg_score(
  p_days      INTEGER DEFAULT 30,
  p_grade     TEXT    DEFAULT NULL,
  p_breakdown TEXT    DEFAULT 'lesson'
)
RETURNS TABLE(key text, avg_pct numeric, attempts bigint, unique_students bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
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
    AND created_at >= NOW() - (COALESCE(p_days, 30) || ' days')::interval
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

-- ── Revoke direct execute — service-role only, via admin Netlify proxy ──
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'analytics_new_signups(integer,text)',
    'analytics_returning_students(integer,text)',
    'analytics_sessions_per_student(integer,text)',
    'analytics_avg_score(integer,text,text)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
