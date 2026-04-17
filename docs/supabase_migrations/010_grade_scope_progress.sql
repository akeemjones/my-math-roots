-- Migration 010: Grade-scoped progress
-- Adds `grade` column to student_progress so each (student, grade) gets its own row.
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- 1. Add grade column (default '2' preserves existing rows as Grade 2)
ALTER TABLE student_progress
  ADD COLUMN IF NOT EXISTS grade TEXT NOT NULL DEFAULT '2';

-- 2. Backfill any rows that pre-date this migration
UPDATE student_progress SET grade = '2' WHERE grade IS NULL OR grade = '';

-- 3. Drop the old (user_id, student_id) unique constraint from migration 008
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'student_progress_user_student_unique'
      AND conrelid = 'student_progress'::regclass
  ) THEN
    ALTER TABLE student_progress DROP CONSTRAINT student_progress_user_student_unique;
  END IF;
END $$;

-- 4. New three-column unique constraint
ALTER TABLE student_progress
  ADD CONSTRAINT student_progress_user_student_grade_unique
  UNIQUE (user_id, student_id, grade);

-- 5. Fast lookup index for (student_id, grade) used by pull RPCs
CREATE INDEX IF NOT EXISTS idx_student_progress_student_grade
  ON student_progress(student_id, grade);


-- 6. Update push_student_progress RPC — add p_grade parameter
-- Apply these diffs to the existing function body in Supabase Dashboard
-- Database → Functions → push_student_progress → Edit:
--
--   DIFF 1 — add to the parameter list (after p_a11y_json):
--     p_grade TEXT DEFAULT '2'
--
--   DIFF 2 — in the INSERT INTO student_progress column list, add:
--     , grade
--
--   DIFF 3 — in the VALUES list, add:
--     , p_grade
--
--   DIFF 4 — change the ON CONFLICT target from:
--     ON CONFLICT (user_id, student_id) DO UPDATE SET ...
--   to:
--     ON CONFLICT (user_id, student_id, grade) DO UPDATE SET ...
--
-- Skeleton showing changed lines only (merge with your existing body):
/*
CREATE OR REPLACE FUNCTION push_student_progress(
  p_student_id       TEXT,
  p_session_token    TEXT,
  p_done_json        JSONB    DEFAULT '{}',
  p_mastery_json     JSONB    DEFAULT '{}',
  p_streak_current   INT      DEFAULT 0,
  p_streak_longest   INT      DEFAULT 0,
  p_streak_last_date TEXT     DEFAULT '',
  p_apptime_json     JSONB    DEFAULT '{}',
  p_act_dates_json   JSONB    DEFAULT '[]',
  p_settings_json    JSONB    DEFAULT '{}',
  p_a11y_json        JSONB    DEFAULT '{}',
  p_scores           JSONB    DEFAULT '[]',
  p_grade            TEXT     DEFAULT '2'    -- NEW
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
... existing validation body unchanged ...

  INSERT INTO student_progress (
    user_id, student_id, grade,             -- grade added
    done_json, mastery_json, streak_current, streak_longest, streak_last_date,
    apptime_json, act_dates_json, settings_json, a11y_json, updated_at
  ) VALUES (
    v_parent_id, v_student_id, p_grade,     -- p_grade added
    p_done_json, p_mastery_json, p_streak_current, p_streak_longest, p_streak_last_date,
    p_apptime_json, p_act_dates_json, p_settings_json, p_a11y_json, now()
  )
  ON CONFLICT (user_id, student_id, grade) DO UPDATE SET  -- grade in conflict target
    done_json        = EXCLUDED.done_json,
    mastery_json     = EXCLUDED.mastery_json,
    streak_current   = EXCLUDED.streak_current,
    streak_longest   = EXCLUDED.streak_longest,
    streak_last_date = EXCLUDED.streak_last_date,
    apptime_json     = EXCLUDED.apptime_json,
    act_dates_json   = EXCLUDED.act_dates_json,
    settings_json    = EXCLUDED.settings_json,
    a11y_json        = EXCLUDED.a11y_json,
    updated_at       = now();

... existing score upsert unchanged ...
$$;
*/


-- 7. Update pull_student_progress RPC — add p_grade parameter
-- Apply these diffs in Supabase Dashboard → Database → Functions → pull_student_progress → Edit:
--
--   DIFF 1 — add to parameter list:
--     p_grade TEXT DEFAULT '2'
--
--   DIFF 2 — in the SELECT FROM student_progress WHERE clause, change:
--     WHERE sp.student_id = p_student_id::uuid
--   to:
--     WHERE sp.student_id = p_student_id::uuid AND sp.grade = p_grade
--
-- Leave any fallback SELECT (student_id IS NULL) unchanged.


-- 8. Update get_user_sync_data RPC — add p_grade parameter (full replacement)
CREATE OR REPLACE FUNCTION get_user_sync_data(
  p_student_id UUID   DEFAULT NULL,
  p_grade      TEXT   DEFAULT '2'
)
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

  -- Fetch progress scoped to (student, grade) if student provided
  IF p_student_id IS NOT NULL THEN
    SELECT row_to_json(sp)::jsonb INTO v_progress
    FROM student_progress sp
    WHERE sp.user_id = v_uid
      AND sp.student_id = p_student_id
      AND sp.grade = p_grade;
  END IF;

  -- Fall back to legacy user-level row (student_id IS NULL) for old accounts
  IF v_progress IS NULL THEN
    SELECT row_to_json(sp)::jsonb INTO v_progress
    FROM student_progress sp
    WHERE sp.user_id = v_uid AND sp.student_id IS NULL;
  END IF;

  -- Scores scoped to student (not grade-filtered)
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

  SELECT jsonb_build_object(
    'current_streak', COALESCE(current_streak, 0),
    'longest_streak', COALESCE(longest_streak, 0),
    'last_activity_date', COALESCE(last_activity_date, ''),
    'family_code', family_code
  ) INTO v_profile
  FROM profiles WHERE id = v_uid;

  RETURN jsonb_build_object(
    'progress', v_progress,
    'scores',   v_scores,
    'profile',  v_profile
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_sync_data(UUID, TEXT) TO authenticated;
