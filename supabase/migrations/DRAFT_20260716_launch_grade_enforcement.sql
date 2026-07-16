-- ══════════════════════════════════════════════════════════════════════════
--  DRAFT — DO NOT APPLY
--
--  Server-side enforcement of launch grades for student_profiles.
--
--  STATUS: reviewed draft. NOT applied to any environment. Deliberately named
--  DRAFT_* rather than a date-ordered migration so the Supabase CLI will not
--  pick it up. Rename to 20260716_launch_grade_enforcement.sql only when the
--  production action below is authorized.
--
--  ── WHY THIS EXISTS ─────────────────────────────────────────────────────
--  Grade validation is currently CLIENT-SIDE ONLY. Traced 2026-07-16:
--
--    * Profile creation is a DIRECT TABLE INSERT — src/dashboard.js dbAddSave()
--      does _supa.from('student_profiles').insert({...}). There is no
--      create-student RPC to validate inside.
--    * The only server-side gates on that insert are:
--        - RLS "parent_owns_profiles" (20260330_student_profiles.sql:25-27)
--          → checks parent_id = auth.uid(). Says nothing about grade.
--        - trigger enforce_max_students_per_parent
--          (20260605_student_cap_atomic.sql:32-64) → per-parent cap only.
--        - CHECK student_profiles_grade_check
--          (20260430_student_profile_grade.sql:30-31)
--          → CHECK (grade IN ('K','1','2','3','4','5'))
--
--  So the database TODAY:
--    REJECTS  arbitrary strings ('banana', 'g3', '') ......... via the CHECK
--    ACCEPTS  '3', '4', '5' ................................. they are in the CHECK list
--    ACCEPTS  NULL / missing grade .......................... the column is nullable, and
--                                                             `NULL IN (...)` is NULL, which
--                                                             a CHECK treats as pass
--
--  A parent with a session can therefore create a Grade 3 profile with a
--  handcrafted PostgREST call, bypassing the client guard entirely.
--
--  ── WHY NOT JUST TIGHTEN THE CHECK ──────────────────────────────────────
--  Narrowing student_profiles_grade_check to ('K','1','2') would INVALIDATE
--  every existing Grade 3 row: the constraint is validated against existing
--  data on creation, so the ALTER would fail outright, and if forced with NOT
--  VALID those rows would break on their next UPDATE. Existing Grade 3
--  students must stay readable and untouched — they are mid-recovery, and the
--  app asks their parent to choose a supported grade. A constraint that
--  prevents those rows from surviving is unacceptable.
--
--  ── APPROACH ────────────────────────────────────────────────────────────
--  An INSERT/UPDATE trigger that constrains only NEW assignments, reading the
--  allowed set from launch_settings — the table that already holds product
--  configuration (signup_enabled, max_students_per_parent, waitlist_enabled)
--  and is already RLS-locked with no policies (service-role/RPC access only).
--  This mirrors how the student cap is enforced, so it fits the existing
--  architecture rather than introducing a new mechanism.
--
--  Semantics:
--    INSERT  → grade must be in launch_settings.launch_grades. NULL rejected.
--    UPDATE  → grade may only CHANGE to a launched grade. A row keeping its
--              existing grade is never blocked, so Grade 3 rows stay editable
--              (rename, avatar, age) and can always move to a supported grade.
--    Existing rows → never rewritten, never invalidated.
--
--  ── PRODUCTION ACTION REQUIRED ──────────────────────────────────────────
--  1. Verify against a Supabase BRANCH database first, not production.
--  2. Confirm the live student_profiles_grade_check still matches this file's
--     assumption. The audit found several production tables whose baseline is
--     absent from this repo (20260600_profiles_baseline.sql:24-28); the grade
--     CHECK is tracked, but confirm before relying on it.
--  3. Confirm no other writer inserts student_profiles (the family-code and
--     PIN RPCs read only — reverified 2026-07-16).
--  4. Apply, then re-run tests/launch-grades.test.js against the branch.
--  5. Keep the client guard (dbAddSave / dbEditSave / switchGrade) in place as
--     defense in depth regardless — this trigger is the backstop, not a
--     replacement.
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1. Launch grades live with the rest of the product configuration ───────
ALTER TABLE public.launch_settings
  ADD COLUMN IF NOT EXISTS launch_grades TEXT[] NOT NULL DEFAULT ARRAY['K','1','2'];

COMMENT ON COLUMN public.launch_settings.launch_grades IS
  'Grades customers may be assigned to. Mirrors LAUNCH_GRADES in '
  'src/app-config.js. Grade 3 is withdrawn: 89 of its 97 lessons are empty '
  'shells. Existing rows on withdrawn grades are preserved and are moved only '
  'by an explicit parent choice in the app recovery screen.';

-- ── 2. Reject NEW assignments to unlaunched grades ─────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_launch_grade_on_student_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed TEXT[];
BEGIN
  -- An UPDATE that does not change the grade is always allowed. This is what
  -- keeps existing Grade 3 rows fully editable and readable.
  IF TG_OP = 'UPDATE' AND NEW.grade IS NOT DISTINCT FROM OLD.grade THEN
    RETURN NEW;
  END IF;

  SELECT launch_grades INTO v_allowed FROM launch_settings WHERE id = 1;

  -- Fail closed, matching enforce_max_students_per_parent: if the settings row
  -- is missing, refuse loudly rather than silently allowing anything.
  IF v_allowed IS NULL THEN
    RAISE EXCEPTION 'launch_settings_missing: launch_grades could not be read'
      USING ERRCODE = 'P0001';
  END IF;

  -- NULL is not a grade. The existing CHECK lets NULL through (NULL IN (...)
  -- evaluates to NULL, which a CHECK treats as satisfied), so reject it here.
  IF NEW.grade IS NULL THEN
    RAISE EXCEPTION 'grade_required: a student profile must specify a grade'
      USING ERRCODE = 'P0001';
  END IF;

  IF NOT (NEW.grade = ANY (v_allowed)) THEN
    RAISE EXCEPTION 'grade_not_available: grade % is not offered (allowed: %)',
      NEW.grade, array_to_string(v_allowed, ', ')
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_launch_grade ON public.student_profiles;
CREATE TRIGGER trg_enforce_launch_grade
  BEFORE INSERT OR UPDATE OF grade ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_launch_grade_on_student_profiles();

COMMENT ON FUNCTION public.enforce_launch_grade_on_student_profiles() IS
  'BEFORE INSERT OR UPDATE OF grade on student_profiles. Constrains only NEW '
  'grade assignments to launch_settings.launch_grades. Existing rows on '
  'withdrawn grades are preserved: an UPDATE that leaves grade unchanged is '
  'always allowed. Fail-closed if launch_settings is missing. Backstops the '
  'client guards in dbAddSave/dbEditSave/switchGrade.';

-- ── 3. Verification — run against a BRANCH database, never production ──────
--
-- Expected results once applied:
--
--   -- (a) new profiles on launched grades: ACCEPTED
--   INSERT INTO student_profiles (parent_id, username, display_name, pin_hash, grade)
--   VALUES (auth.uid(), 'kid_k', 'Kid K', 'x', 'K');   -- ok
--   -- ...same for '1' and '2'
--
--   -- (b) new profile on a withdrawn grade: REJECTED -> grade_not_available
--   INSERT INTO student_profiles (parent_id, username, display_name, pin_hash, grade)
--   VALUES (auth.uid(), 'kid3', 'Kid 3', 'x', '3');
--
--   -- (c) grades 4 and 5: REJECTED -> grade_not_available
--   -- (d) arbitrary string: REJECTED -> student_profiles_grade_check (existing CHECK)
--   -- (e) NULL / omitted grade: REJECTED -> grade_required   (NEW: previously accepted)
--
--   -- (f) EXISTING Grade 3 rows still readable and editable
--   SELECT id, grade FROM student_profiles WHERE grade = '3';          -- rows intact
--   UPDATE student_profiles SET display_name = 'New Name' WHERE grade = '3';  -- allowed
--
--   -- (g) an existing Grade 3 row may move to a supported grade (the recovery path)
--   UPDATE student_profiles SET grade = '2' WHERE grade = '3';         -- allowed
--
--   -- (h) an existing row may NOT move to a withdrawn grade
--   UPDATE student_profiles SET grade = '3' WHERE grade = '2';         -- rejected
--
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_enforce_launch_grade ON public.student_profiles;
--   DROP FUNCTION IF EXISTS public.enforce_launch_grade_on_student_profiles();
--   ALTER TABLE public.launch_settings DROP COLUMN IF EXISTS launch_grades;
