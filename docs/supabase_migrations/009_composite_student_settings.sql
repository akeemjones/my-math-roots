-- Migration 009: Composite student settings RPC
-- Replaces 3 separate RPCs (get_unlock_settings, get_timer_settings, get_a11y_settings)
-- with a single get_all_student_settings call — 1 round trip instead of 3.

CREATE OR REPLACE FUNCTION get_all_student_settings(p_student_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'unlock', COALESCE(unlock_settings, '{}'::jsonb),
    'timer',  COALESCE(timer_settings,  '{}'::jsonb),
    'a11y',   COALESCE(a11y_settings,   '{}'::jsonb)
  )
  FROM student_profiles
  WHERE id = p_student_id;
$$;

GRANT EXECUTE ON FUNCTION get_all_student_settings(UUID) TO anon, authenticated;
