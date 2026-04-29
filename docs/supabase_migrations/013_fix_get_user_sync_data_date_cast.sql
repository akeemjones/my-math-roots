-- ═══════════════════════════════════════════════════════════════════════════
-- 013: Fix last_activity_date cast in get_user_sync_data
-- ═══════════════════════════════════════════════════════════════════════════
--
-- APPLIED AS HOTFIX 2026-04-28 (live, via MCP apply_migration).
-- Root cause: after migration 012 resolved the overload ambiguity, the
-- surviving 2-param function still errored with:
--   "invalid input syntax for type date: ''"
-- because COALESCE(last_activity_date, '') attempted to coerce an empty
-- string literal to the DATE column type for users with no activity date.
--
-- Fix: cast last_activity_date to text before the COALESCE so the fallback
-- '' is compared as text, not as date.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_sync_data(
  p_student_id uuid DEFAULT NULL::uuid,
  p_grade      text DEFAULT '2'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid      UUID;
  v_progress JSONB;
  v_scores   JSONB;
  v_profile  JSONB;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Fetch progress scoped to student + grade if provided
  IF p_student_id IS NOT NULL THEN
    SELECT row_to_json(sp)::jsonb INTO v_progress
    FROM student_progress sp
    WHERE sp.user_id = v_uid
      AND sp.student_id = p_student_id
      AND sp.grade = p_grade;
  END IF;

  -- Fall back to legacy user-level row if no student-scoped row found
  IF v_progress IS NULL THEN
    SELECT row_to_json(sp)::jsonb INTO v_progress
    FROM student_progress sp
    WHERE sp.user_id = v_uid AND sp.student_id IS NULL;
  END IF;

  -- Fetch scores scoped to student if provided, else all for user
  IF p_student_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb ORDER BY s.created_at DESC), '[]'::jsonb)
    INTO v_scores
    FROM (
      SELECT * FROM quiz_scores
      WHERE user_id = v_uid AND student_id = p_student_id
      ORDER BY created_at DESC LIMIT 200
    ) s;
  ELSE
    SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb ORDER BY s.created_at DESC), '[]'::jsonb)
    INTO v_scores
    FROM (
      SELECT * FROM quiz_scores WHERE user_id = v_uid
      ORDER BY created_at DESC LIMIT 200
    ) s;
  END IF;

  -- Fetch parent profile (streak, family code).
  -- last_activity_date is type DATE — cast to text before COALESCE to avoid
  -- "invalid input syntax for type date: ''" when the value is NULL.
  SELECT jsonb_build_object(
    'current_streak',     COALESCE(current_streak, 0),
    'longest_streak',     COALESCE(longest_streak, 0),
    'last_activity_date', COALESCE(last_activity_date::text, ''),
    'family_code',        family_code
  ) INTO v_profile
  FROM profiles WHERE id = v_uid;

  RETURN jsonb_build_object(
    'progress', v_progress,
    'scores',   v_scores,
    'profile',  v_profile
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_sync_data(uuid, text) FROM public;
GRANT  EXECUTE ON FUNCTION public.get_user_sync_data(uuid, text) TO authenticated;
