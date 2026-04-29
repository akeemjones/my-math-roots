-- ══════════════════════════════════════════════════════════════
--  Migration: clear_intervention_events RPC
--  Adds an ownership-checked SECURITY DEFINER function that lets a
--  parent delete all intervention_events rows for their own student.
--  Called by _dbFullReset() in dashboard.js alongside reset_student_data.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION clear_intervention_events(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Parent must own this student profile (same ownership check as reset_student_data).
  IF NOT EXISTS (
    SELECT 1 FROM student_profiles
    WHERE id = p_student_id AND parent_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  DELETE FROM intervention_events WHERE student_id = p_student_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION clear_intervention_events(UUID) FROM public;
GRANT EXECUTE ON FUNCTION clear_intervention_events(UUID) TO authenticated;
