-- Migration 005: Security hardening
-- 1. Create verify_student_pin RPC with lockout
-- 2. Lengthen family codes from 4 to 8 chars
-- 3. Add rate limiting to get_profiles_by_family_code
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PIN attempt tracking table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pin_attempts (
  student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  attempts    INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id)
);

ALTER TABLE pin_attempts ENABLE ROW LEVEL SECURITY;
-- No direct access — only via SECURITY DEFINER RPC
CREATE POLICY "no_direct_access" ON pin_attempts USING (false);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. verify_student_pin RPC
--    Accepts raw PIN, hashes with SHA-256 + salt (same as client), compares.
--    5-attempt lockout for 5 minutes.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION verify_student_pin(p_student_id UUID, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_stored_hash TEXT;
  v_attempts    INTEGER;
  v_locked      TIMESTAMPTZ;
  v_window      TIMESTAMPTZ;
  v_entered_hash TEXT;
BEGIN
  -- 1. Get stored hash
  SELECT pin_hash INTO v_stored_hash
  FROM student_profiles WHERE id = p_student_id;

  IF v_stored_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'attempts_left', 0, 'error', 'Student not found');
  END IF;

  -- 2. Check/create attempt record
  INSERT INTO pin_attempts (student_id, attempts, locked_until, window_start)
  VALUES (p_student_id, 0, NULL, now())
  ON CONFLICT (student_id) DO NOTHING;

  SELECT attempts, locked_until, window_start
  INTO v_attempts, v_locked, v_window
  FROM pin_attempts WHERE student_id = p_student_id;

  -- 3. Check lockout
  IF v_locked IS NOT NULL AND v_locked > now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'attempts_left', 0,
      'locked_until', extract(epoch from v_locked) * 1000
    );
  END IF;

  -- 4. Reset window if lockout expired or window older than 15 minutes
  IF v_locked IS NOT NULL AND v_locked <= now() THEN
    UPDATE pin_attempts SET attempts = 0, locked_until = NULL, window_start = now()
    WHERE student_id = p_student_id;
    v_attempts := 0;
  ELSIF v_window < now() - interval '15 minutes' THEN
    UPDATE pin_attempts SET attempts = 0, window_start = now()
    WHERE student_id = p_student_id;
    v_attempts := 0;
  END IF;

  -- 5. Hash the entered PIN (SHA-256 with same salt as client)
  v_entered_hash := encode(
    digest(p_pin || 'mymathroots_pin_salt_2025', 'sha256'),
    'hex'
  );

  -- 6. Compare
  IF v_entered_hash = v_stored_hash THEN
    -- Reset attempts on success
    UPDATE pin_attempts SET attempts = 0, locked_until = NULL, window_start = now()
    WHERE student_id = p_student_id;
    RETURN jsonb_build_object('success', true, 'attempts_left', null);
  ELSE
    -- Increment attempts
    v_attempts := v_attempts + 1;
    IF v_attempts >= 5 THEN
      UPDATE pin_attempts SET attempts = v_attempts, locked_until = now() + interval '5 minutes'
      WHERE student_id = p_student_id;
      RETURN jsonb_build_object('success', false, 'attempts_left', 0);
    ELSE
      UPDATE pin_attempts SET attempts = v_attempts
      WHERE student_id = p_student_id;
      RETURN jsonb_build_object('success', false, 'attempts_left', 5 - v_attempts);
    END IF;
  END IF;
END;
$$;

-- Must be callable by anon (child devices) and authenticated (parent devices)
GRANT EXECUTE ON FUNCTION verify_student_pin(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_student_pin(UUID, TEXT) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Lengthen family codes from 4 to 8 characters
--    New format: MMR-XXXXXXXX (8 hex chars = 4 billion combinations)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION ensure_family_code(p_parent_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT family_code INTO v_code FROM profiles WHERE id = p_parent_id;
  IF v_code IS NULL THEN
    -- 8 hex chars from two UUIDs for more entropy
    v_code := 'MMR-' || upper(
      substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)
    );
    UPDATE profiles SET family_code = v_code WHERE id = p_parent_id;
  END IF;
  RETURN v_code;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Rate limiting on get_profiles_by_family_code
--    Track lookup attempts per IP-ish identifier (using claim sub or anon session)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS family_code_lookups (
  lookup_key   TEXT NOT NULL,  -- auth.uid()::text or 'anon'
  attempts     INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lookup_key)
);

ALTER TABLE family_code_lookups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_direct_access" ON family_code_lookups USING (false);

-- Replace the existing RPC with a rate-limited version
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_key TEXT;
  v_attempts INTEGER;
  v_window TIMESTAMPTZ;
BEGIN
  -- Rate limit: 10 lookups per 15 minutes per caller
  v_key := COALESCE(auth.uid()::text, 'anon');

  INSERT INTO family_code_lookups (lookup_key, attempts, window_start)
  VALUES (v_key, 0, now())
  ON CONFLICT (lookup_key) DO NOTHING;

  SELECT attempts, window_start INTO v_attempts, v_window
  FROM family_code_lookups WHERE lookup_key = v_key;

  -- Reset window if older than 15 minutes
  IF v_window < now() - interval '15 minutes' THEN
    UPDATE family_code_lookups SET attempts = 0, window_start = now()
    WHERE lookup_key = v_key;
    v_attempts := 0;
  END IF;

  -- Check rate limit
  IF v_attempts >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Try again later.';
  END IF;

  -- Increment
  UPDATE family_code_lookups SET attempts = v_attempts + 1
  WHERE lookup_key = v_key;

  -- Return profiles
  RETURN QUERY
    SELECT sp.id, sp.username, sp.display_name, sp.age,
           sp.avatar_emoji, sp.avatar_color_from, sp.avatar_color_to
    FROM student_profiles sp
    JOIN profiles p ON p.id = sp.parent_id
    WHERE p.family_code = upper(p_family_code);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Require pgcrypto extension for digest() function
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS pgcrypto;
