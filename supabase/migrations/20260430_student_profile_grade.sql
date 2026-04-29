-- ══════════════════════════════════════════
--  Phase 3: per-profile grade column
--  2026-04-30
--
--  Adds student_profiles.grade so each student carries its own grade level
--  ('K' or '2' today; '1','3','4','5' reserved). The CHECK constraint and
--  RPC update are both written defensively so this migration is safe to
--  rerun.  Old clients that don't know about grade simply ignore the new
--  column — no regression.
-- ══════════════════════════════════════════

-- 1. Add grade column (nullable so the migration is safe to rerun)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS grade TEXT;

-- 2. Backfill existing rows to the historical default ('2' was the only
--    grade with content when student_profiles shipped)
UPDATE student_profiles SET grade = '2' WHERE grade IS NULL;

-- 3. Constrain to canonical values.  DO block + IF NOT EXISTS check avoids
--    the duplicate-constraint failure if the migration is reapplied.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'student_profiles_grade_check'
      AND conrelid = 'student_profiles'::regclass
  ) THEN
    ALTER TABLE student_profiles
      ADD CONSTRAINT student_profiles_grade_check
        CHECK (grade IN ('K','1','2','3','4','5'));
  END IF;
END $$;

-- 4. Update get_profiles_by_family_code to return the new column.
--    Postgres won't change the return type via CREATE OR REPLACE alone,
--    so we DROP first.  IF EXISTS keeps the migration safe to rerun.
DROP FUNCTION IF EXISTS get_profiles_by_family_code(TEXT);

CREATE OR REPLACE FUNCTION get_profiles_by_family_code(p_family_code TEXT)
RETURNS TABLE (
  id                UUID,
  username          TEXT,
  display_name      TEXT,
  age               INTEGER,
  avatar_emoji      TEXT,
  avatar_color_from TEXT,
  avatar_color_to   TEXT,
  grade             TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.id, sp.username, sp.display_name, sp.age,
         sp.avatar_emoji, sp.avatar_color_from, sp.avatar_color_to,
         COALESCE(sp.grade, '2') AS grade
  FROM student_profiles sp
  JOIN profiles p ON p.id = sp.parent_id
  WHERE p.family_code = upper(p_family_code);
$$;

GRANT EXECUTE ON FUNCTION get_profiles_by_family_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_profiles_by_family_code(TEXT) TO authenticated;
