-- ══════════════════════════════════════════
--  Parent Controls — Full Dashboard Migration
--  2026-03-31
-- ══════════════════════════════════════════

-- 1. Per-student settings columns on student_profiles
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS unlock_settings JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS timer_settings  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS a11y_settings   JSONB NOT NULL DEFAULT '{}';

-- 2. Parent-level PIN hash on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- ── Read RPCs (SECURITY DEFINER, anon + authenticated) ──────────────────

CREATE OR REPLACE FUNCTION get_unlock_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(unlock_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_timer_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(timer_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_a11y_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(a11y_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_pin_hash(p_parent_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT pin_hash FROM profiles WHERE id = p_parent_id;
$$;
GRANT EXECUTE ON FUNCTION get_pin_hash(UUID) TO authenticated;

-- ── Write RPCs (authenticated only, ownership-checked) ──────────────────

CREATE OR REPLACE FUNCTION update_unlock_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET unlock_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_unlock_settings(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION update_timer_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET timer_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_timer_settings(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION update_a11y_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET a11y_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_a11y_settings(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION update_pin_hash(p_hash TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles SET pin_hash = p_hash WHERE id = auth.uid();
END; $$;
GRANT EXECUTE ON FUNCTION update_pin_hash(TEXT) TO authenticated;
