-- supabase/migrations/20260605_student_cap_atomic.sql
--
-- Make the per-parent student-profile cap race-safe and fail-closed.
--
-- The current trigger in 20260525_launch_gate.sql:56-81 has two issues:
--
--   (1) Race: SELECT COUNT(*) ... FROM student_profiles WHERE parent_id =
--       NEW.parent_id reads the count without a row lock. Under default
--       READ COMMITTED isolation, two parallel INSERTs by the same parent
--       can both see count=1 (below the cap of 2), both pass the check,
--       and both succeed — exceeding the cap.
--
--   (2) Fail-open: `IF v_max IS NULL THEN RETURN NEW; END IF;` silently
--       allows the insert when launch_settings is unreadable or its row
--       is missing. A deleted/empty settings table effectively disables
--       the cap.
--
-- This migration replaces the trigger function with a version that:
--
--   * Acquires pg_advisory_xact_lock keyed by the parent_id so that
--     concurrent INSERTs for the SAME parent serialise on this lock.
--     The lock is transaction-scoped (released on COMMIT/ROLLBACK).
--     Different parents do not contend with each other.
--
--   * Fails closed when launch_settings.max_students_per_parent is null
--     or unreadable — raises 'launch_settings_missing' so an operator
--     misconfiguration is loud, not silent.
--
-- Trigger definition (BEFORE INSERT ON student_profiles FOR EACH ROW)
-- is unchanged; we replace the function body only.

CREATE OR REPLACE FUNCTION public.enforce_max_students_per_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max INTEGER;
  v_cur INTEGER;
BEGIN
  -- Per-parent transaction lock: concurrent INSERTs for the SAME
  -- NEW.parent_id serialise on this lock. Releases at end of
  -- transaction (commit or rollback). hashtext gives a stable bigint.
  PERFORM pg_advisory_xact_lock(hashtext('student_cap:' || NEW.parent_id::text));

  SELECT max_students_per_parent INTO v_max FROM launch_settings WHERE id = 1;

  -- Fail closed: if the singleton row is missing or the column is null,
  -- refuse the insert with a loud error rather than silently allowing it.
  IF v_max IS NULL THEN
    RAISE EXCEPTION 'launch_settings_missing: max_students_per_parent could not be read'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO v_cur FROM student_profiles WHERE parent_id = NEW.parent_id;
  IF v_cur >= v_max THEN
    RAISE EXCEPTION 'profile_limit_reached: max % students per parent', v_max
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_max_students_per_parent() IS
  'BEFORE INSERT trigger on student_profiles. Race-safe via '
  'pg_advisory_xact_lock keyed by parent_id. Fail-closed if '
  'launch_settings is missing. Updated 20260605.';

-- The trigger itself (trg_enforce_max_students_per_parent) was created
-- by 20260525_launch_gate.sql:78-81 and points at the function above —
-- nothing to recreate. CREATE OR REPLACE FUNCTION preserves the trigger
-- binding.

-- ── Manual verification queries (post-apply) ───────────────────────────────
-- Race-safety smoke (run in psql with two concurrent connections):
--   tx1: BEGIN; INSERT INTO student_profiles (parent_id, ...) VALUES (P, ...);
--   tx2: BEGIN; INSERT INTO student_profiles (parent_id, ...) VALUES (P, ...);
-- With cap=2 and existing count=1, exactly one transaction will commit;
-- the other waits on the advisory lock, then fails with
-- profile_limit_reached when count is re-read after the first commits.
--
-- Fail-closed smoke (admin / service_role):
--   DELETE FROM launch_settings WHERE id = 1;
--   INSERT INTO student_profiles (...) -> RAISE 'launch_settings_missing'
-- (Restore the settings row before exiting verification.)
