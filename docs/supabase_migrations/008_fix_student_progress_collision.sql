-- Migration 008: Fix multi-student progress collision
-- Problem: _pushDone/_pushMastery/_pushAppTime all upsert to student_progress
-- keyed only on user_id (parent ID). Siblings sharing one parent overwrite
-- each other's DONE, MASTERY, and APP_TIME data.
--
-- Fix: Add student_id column, composite unique constraint, and update
-- get_user_sync_data RPC to accept a student_id parameter.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- 1. Add student_id column to student_progress
ALTER TABLE student_progress
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL;

-- 2. Create composite unique constraint (replaces user_id-only uniqueness)
--    Drop existing unique constraint on user_id first if it exists
DO $$
BEGIN
  -- Drop the old unique constraint if it exists (name varies by DB)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'student_progress_user_id_key'
    AND conrelid = 'student_progress'::regclass
  ) THEN
    ALTER TABLE student_progress DROP CONSTRAINT student_progress_user_id_key;
  END IF;
END $$;

-- Add composite unique constraint
ALTER TABLE student_progress
  ADD CONSTRAINT student_progress_user_student_unique
  UNIQUE (user_id, student_id);

-- 3. Index for fast per-student lookups
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id
  ON student_progress(student_id);

-- 4. Update get_user_sync_data RPC to accept optional student_id
--    Falls back to user_id-only lookup for backwards compatibility
CREATE OR REPLACE FUNCTION get_user_sync_data(p_student_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Fetch progress scoped to student if provided, else fall back to user-level
  IF p_student_id IS NOT NULL THEN
    SELECT row_to_json(sp)::jsonb INTO v_progress
    FROM student_progress sp
    WHERE sp.user_id = v_uid AND sp.student_id = p_student_id;
  END IF;

  -- Fall back to legacy user-level row if no student-scoped row found
  IF v_progress IS NULL THEN
    SELECT row_to_json(sp)::jsonb INTO v_progress
    FROM student_progress sp
    WHERE sp.user_id = v_uid AND sp.student_id IS NULL;
  END IF;

  -- Fetch scores scoped to student if provided
  IF p_student_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb ORDER BY s.created_at DESC), '[]'::jsonb)
    INTO v_scores
    FROM (
      SELECT * FROM quiz_scores
      WHERE user_id = v_uid AND student_id = p_student_id
      ORDER BY created_at DESC
      LIMIT 200
    ) s;
  ELSE
    SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb ORDER BY s.created_at DESC), '[]'::jsonb)
    INTO v_scores
    FROM (
      SELECT * FROM quiz_scores
      WHERE user_id = v_uid
      ORDER BY created_at DESC
      LIMIT 200
    ) s;
  END IF;

  -- Fetch parent profile (streak, family code)
  SELECT jsonb_build_object(
    'current_streak', COALESCE(current_streak, 0),
    'longest_streak', COALESCE(longest_streak, 0),
    'last_activity_date', COALESCE(last_activity_date, ''),
    'family_code', family_code
  ) INTO v_profile
  FROM profiles WHERE id = v_uid;

  RETURN jsonb_build_object(
    'progress', v_progress,
    'scores', v_scores,
    'profile', v_profile
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_sync_data(UUID) TO authenticated;
