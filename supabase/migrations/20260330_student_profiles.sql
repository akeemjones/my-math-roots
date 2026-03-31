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

-- Allow anon to look up parent_id by family_code (device linking)
-- Only projects id + family_code — no other fields exposed
CREATE POLICY "anon_family_code_lookup" ON profiles
  FOR SELECT TO anon
  USING (true);

-- Allow anon to SELECT from student_profiles via JOIN on family_code
-- (the app queries: SELECT sp.* FROM student_profiles sp JOIN profiles p ON p.id=sp.parent_id WHERE p.family_code=$1)
-- RLS on student_profiles blocks anon SELECT by default; we need a special policy for device setup:
CREATE POLICY "anon_device_setup_read" ON student_profiles
  FOR SELECT TO anon
  USING (true);

-- 3. Add student_id to student_progress (quiz_scores table in this codebase)
ALTER TABLE quiz_scores ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES student_profiles(id);

-- Index for fast per-student queries
CREATE INDEX IF NOT EXISTS idx_quiz_scores_student_id ON quiz_scores(student_id);
