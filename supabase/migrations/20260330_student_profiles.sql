-- ══════════════════════════════════════════
--  Student Profiles & Auth — Migration
--  2026-03-30
-- ══════════════════════════════════════════

-- 1. New table: student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  age               INTEGER,
  avatar_emoji      TEXT NOT NULL DEFAULT '🦁',
  avatar_color_from TEXT NOT NULL DEFAULT '#f59e0b',
  avatar_color_to   TEXT NOT NULL DEFAULT '#f97316',
  pin_hash          TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, username)
);

-- RLS: parent reads/writes only their own children
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_owns_profiles" ON student_profiles
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- 2. Add family_code to profiles (one per parent account)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_code TEXT UNIQUE;

-- Restrict anon access to only (id, family_code) via a view — never expose full profiles row
CREATE OR REPLACE VIEW public.family_code_lookup AS
  SELECT id, family_code FROM profiles;

GRANT SELECT ON public.family_code_lookup TO anon;
GRANT SELECT ON public.family_code_lookup TO authenticated;

-- Device setup is handled safely by get_profiles_by_family_code SECURITY DEFINER RPC (Task 9)
-- No broad anon RLS policy needed on student_profiles

-- 3. Add student_id to student_progress (quiz_scores table in this codebase)
-- ON DELETE SET NULL preserves historical scores when a student profile is deleted
ALTER TABLE quiz_scores ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL;

-- Index for fast per-student queries
CREATE INDEX IF NOT EXISTS idx_quiz_scores_student_id ON quiz_scores(student_id);

-- ── RPC: get student profiles by family code (called by anon/child devices) ──
CREATE OR REPLACE FUNCTION get_profiles_by_family_code(p_family_code TEXT)
RETURNS TABLE (
  id                UUID,
  username          TEXT,
  display_name      TEXT,
  age               INTEGER,
  avatar_emoji      TEXT,
  avatar_color_from TEXT,
  avatar_color_to   TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.id, sp.username, sp.display_name, sp.age,
         sp.avatar_emoji, sp.avatar_color_from, sp.avatar_color_to
  FROM student_profiles sp
  JOIN profiles p ON p.id = sp.parent_id
  WHERE p.family_code = upper(p_family_code);
$$;

GRANT EXECUTE ON FUNCTION get_profiles_by_family_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_profiles_by_family_code(TEXT) TO authenticated;

-- ── RPC: generate family_code for a parent if not set ──
CREATE OR REPLACE FUNCTION ensure_family_code(p_parent_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT family_code INTO v_code FROM profiles WHERE id = p_parent_id;
  IF v_code IS NULL THEN
    v_code := 'MMR-' || upper(substring(gen_random_uuid()::text, 1, 4));
    UPDATE profiles SET family_code = v_code WHERE id = p_parent_id;
  END IF;
  RETURN v_code;
END;
$$;

GRANT EXECUTE ON FUNCTION ensure_family_code(UUID) TO authenticated;
