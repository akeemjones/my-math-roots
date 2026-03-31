-- ══════════════════════════════════════════
--  Parent Controls — Fixup Migration
--  2026-03-31
--  Fixes: pin_hash → parent_pin_hash rename,
--         update_pin_hash NOT FOUND guard,
--         REVOKE FROM public for all 8 RPCs
-- ══════════════════════════════════════════

-- 1. Rename pin_hash to parent_pin_hash on profiles
--    (avoids ambiguity with student_profiles.pin_hash)
ALTER TABLE profiles RENAME COLUMN pin_hash TO parent_pin_hash;

-- 2. REVOKE FROM public (SECURITY DEFINER fns should not be callable by public)
REVOKE EXECUTE ON FUNCTION get_unlock_settings(UUID)           FROM public;
REVOKE EXECUTE ON FUNCTION get_timer_settings(UUID)            FROM public;
REVOKE EXECUTE ON FUNCTION get_a11y_settings(UUID)             FROM public;
REVOKE EXECUTE ON FUNCTION get_pin_hash(UUID)                  FROM public;
REVOKE EXECUTE ON FUNCTION update_unlock_settings(UUID, JSONB) FROM public;
REVOKE EXECUTE ON FUNCTION update_timer_settings(UUID, JSONB)  FROM public;
REVOKE EXECUTE ON FUNCTION update_a11y_settings(UUID, JSONB)   FROM public;
REVOKE EXECUTE ON FUNCTION update_pin_hash(TEXT)               FROM public;

-- 3. Recreate get_pin_hash to reference parent_pin_hash
CREATE OR REPLACE FUNCTION get_pin_hash(p_parent_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT parent_pin_hash FROM profiles WHERE id = p_parent_id;
$$;
REVOKE EXECUTE ON FUNCTION get_pin_hash(UUID) FROM public;
GRANT  EXECUTE ON FUNCTION get_pin_hash(UUID) TO authenticated;

-- 4. Recreate update_pin_hash: reference parent_pin_hash + add NOT FOUND guard
CREATE OR REPLACE FUNCTION update_pin_hash(p_hash TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles SET parent_pin_hash = p_hash WHERE id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
END; $$;
REVOKE EXECUTE ON FUNCTION update_pin_hash(TEXT) FROM public;
GRANT  EXECUTE ON FUNCTION update_pin_hash(TEXT) TO authenticated;
