-- Migration: remove pin_hash from get_profiles_by_family_code return columns
-- CRITICAL SECURITY FIX: pin hashes were being exposed to anon callers
-- Run in: Supabase Dashboard → SQL Editor → New Query

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
