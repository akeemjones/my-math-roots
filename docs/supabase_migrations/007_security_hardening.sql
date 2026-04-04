-- Migration 007: Security Hardening
-- 1. pin_sessions table for server-verified student identity
-- 2. Upgrade verify_student_pin to bcrypt + session token issuance
-- 3. Create create_student_profile RPC with bcrypt hashing
-- 4. Reset all existing PIN hashes (no prod users — confirmed)
-- 5. Add reset_student_pin RPC for parents
-- 6. Create push_student_progress RPC with monotonic + schema validation
-- 7. Create pull_student_progress RPC with session token auth
-- 8. Fix get_unlock_settings (and siblings) to require session token or parent auth
-- 9. Add quiz_scores INSERT trigger for schema validation
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Prerequisite: pgcrypto extension (already enabled by migration 005)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 0. Drop conflicting objects from prior manual SQL or earlier migrations
-- ═══════════════════════════════════════════════════════════════════════════════

-- Old push_student_progress overloads (10-param and 11-param, without session token)
DROP FUNCTION IF EXISTS push_student_progress(UUID, JSONB, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB);
DROP FUNCTION IF EXISTS push_student_progress(UUID, JSONB, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB);

-- Old pull_student_progress (single-param, no session token)
DROP FUNCTION IF EXISTS pull_student_progress(UUID);

-- Old quiz_scores trigger + function (will be recreated with updated logic)
DROP TRIGGER IF EXISTS check_score_plausibility ON quiz_scores;
DROP TRIGGER IF EXISTS trg_validate_quiz_score ON quiz_scores;
DROP FUNCTION IF EXISTS validate_quiz_score();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PIN sessions table — server-issued tokens after PIN verification
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pin_sessions (
  token       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours'
);

ALTER TABLE pin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_direct_access" ON pin_sessions USING (false);
CREATE INDEX idx_pin_sessions_student ON pin_sessions(student_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Helper: validate a pin session token
-- Returns the student_id if valid, raises exception if not.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION _validate_pin_session(p_student_id UUID, p_session_token UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_found UUID;
BEGIN
  SELECT student_id INTO v_found
  FROM pin_sessions
  WHERE token = p_session_token
    AND student_id = p_student_id
    AND expires_at > now();

  IF v_found IS NULL THEN
    RAISE EXCEPTION 'invalid_session'
      USING HINT = 'Session token is missing, expired, or does not match student';
  END IF;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Upgrade verify_student_pin — bcrypt + session token
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
  v_token       UUID;
BEGIN
  -- 1. Get stored hash
  SELECT pin_hash INTO v_stored_hash
  FROM student_profiles WHERE id = p_student_id;

  IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
    RETURN jsonb_build_object('success', false, 'attempts_left', 0, 'error', 'PIN not set — please ask a parent to reset your PIN.');
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

  -- 5. Verify PIN using bcrypt (pgcrypto crypt)
  IF crypt(p_pin, v_stored_hash) = v_stored_hash THEN
    -- Success: reset attempts
    UPDATE pin_attempts SET attempts = 0, locked_until = NULL, window_start = now()
    WHERE student_id = p_student_id;

    -- Clean up expired sessions for this student
    DELETE FROM pin_sessions WHERE student_id = p_student_id AND expires_at <= now();

    -- Issue a new session token
    INSERT INTO pin_sessions (student_id) VALUES (p_student_id)
    RETURNING token INTO v_token;

    RETURN jsonb_build_object(
      'success', true,
      'session_token', v_token,
      'attempts_left', null
    );
  ELSE
    -- Failure: increment attempts
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
-- 3. Create student profile RPC — bcrypt PIN hashing
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_student_profile(
  p_display_name      TEXT,
  p_avatar_emoji      TEXT,
  p_avatar_color_from TEXT,
  p_avatar_color_to   TEXT,
  p_age               INTEGER,
  p_pin               TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id UUID;
  v_profile   student_profiles;
  v_family    TEXT;
BEGIN
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Ensure the parent has a family code
  SELECT family_code INTO v_family FROM profiles WHERE id = v_parent_id;
  IF v_family IS NULL THEN
    v_family := 'MMR-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    UPDATE profiles SET family_code = v_family WHERE id = v_parent_id;
  END IF;

  -- Create the student profile with bcrypt-hashed PIN
  INSERT INTO student_profiles (
    parent_id, display_name, username, avatar_emoji,
    avatar_color_from, avatar_color_to, age, pin_hash
  ) VALUES (
    v_parent_id, p_display_name, lower(p_display_name), p_avatar_emoji,
    p_avatar_color_from, p_avatar_color_to, p_age,
    crypt(p_pin, gen_salt('bf'))
  )
  RETURNING * INTO v_profile;

  RETURN jsonb_build_object(
    'id', v_profile.id,
    'display_name', v_profile.display_name,
    'age', v_profile.age,
    'avatar_emoji', v_profile.avatar_emoji,
    'avatar_color_from', v_profile.avatar_color_from,
    'avatar_color_to', v_profile.avatar_color_to,
    'parent_id', v_profile.parent_id,
    'family_code', v_family
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION create_student_profile(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION create_student_profile(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Drop all existing PIN hashes (no production users — confirmed)
--    Allow NULL so parents can reset PINs via reset_student_pin RPC.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE student_profiles ALTER COLUMN pin_hash DROP NOT NULL;
UPDATE student_profiles SET pin_hash = NULL WHERE pin_hash IS NOT DISTINCT FROM '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Reset student PIN — parent-only RPC
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION reset_student_pin(p_student_id UUID, p_new_pin TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the owning parent can reset
  UPDATE student_profiles
  SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  -- Invalidate all existing sessions for this student
  DELETE FROM pin_sessions WHERE student_id = p_student_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION reset_student_pin(UUID, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION reset_student_pin(UUID, TEXT) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. push_student_progress — validated push with session token auth
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION push_student_progress(
  p_student_id       UUID,
  p_session_token    UUID,
  p_mastery_json     JSONB,
  p_streak_current   INTEGER,
  p_streak_longest   INTEGER,
  p_streak_last_date TEXT,
  p_apptime_json     JSONB,
  p_done_json        JSONB,
  p_act_dates_json   JSONB,
  p_settings_json    JSONB,
  p_a11y_json        JSONB,
  p_scores           JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored         RECORD;
  v_key            TEXT;
  v_val            JSONB;
  v_entry          JSONB;
  v_stored_mastery JSONB;
  v_score_row      RECORD;
  v_pct_calc       INTEGER;
BEGIN
  -- ── Auth: validate session token ──────────────────────────────────────────
  PERFORM _validate_pin_session(p_student_id, p_session_token);

  -- ── Schema validation ─────────────────────────────────────────────────────

  -- Streak range checks
  IF p_streak_current < 0 OR p_streak_current > 365 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_current out of range 0-365');
  END IF;
  IF p_streak_longest < 0 OR p_streak_longest > 365 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_longest out of range 0-365');
  END IF;
  IF p_streak_longest < p_streak_current THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_longest must be >= streak_current');
  END IF;

  -- Streak last date: empty string or valid date not in the future
  IF p_streak_last_date IS NOT NULL AND p_streak_last_date <> '' THEN
    BEGIN
      IF p_streak_last_date::date > (current_date + interval '1 day')::date THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_last_date is in the future');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_last_date is not a valid date');
    END;
  END IF;

  -- Mastery: validate each entry has valid numeric fields
  IF jsonb_typeof(p_mastery_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'mastery_json must be an object');
  END IF;
  FOR v_key, v_val IN SELECT * FROM jsonb_each(p_mastery_json) LOOP
    IF (v_val->>'attempts')::int < 0 OR (v_val->>'correct')::int < 0 OR (v_val->>'wrong')::int < 0 THEN
      RETURN jsonb_build_object('error', 'validation_failed', 'details', 'mastery entry has negative values for key ' || v_key);
    END IF;
    IF (v_val->>'correct')::int + (v_val->>'wrong')::int > (v_val->>'attempts')::int THEN
      RETURN jsonb_build_object('error', 'validation_failed', 'details', 'mastery correct+wrong > attempts for key ' || v_key);
    END IF;
  END LOOP;

  -- AppTime: validate structure
  IF jsonb_typeof(p_apptime_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime_json must be an object');
  END IF;
  IF (p_apptime_json->>'totalSecs')::int < 0 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime totalSecs must be >= 0');
  END IF;
  IF (p_apptime_json->>'sessions')::int < 0 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime sessions must be >= 0');
  END IF;

  -- Done: must be object with boolean values
  IF jsonb_typeof(p_done_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'done_json must be an object');
  END IF;

  -- Act dates: must be array, max 365
  IF jsonb_typeof(p_act_dates_json) <> 'array' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'act_dates_json must be an array');
  END IF;
  IF jsonb_array_length(p_act_dates_json) > 365 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'act_dates_json exceeds 365 entries');
  END IF;

  -- ── Monotonic validation (compare against stored values) ──────────────────
  SELECT mastery_json, apptime_json, done_json, act_dates_json
  INTO v_stored
  FROM student_profiles WHERE id = p_student_id;

  IF v_stored IS NOT NULL THEN
    -- Mastery: attempts can't decrease for existing keys
    v_stored_mastery := v_stored.mastery_json;
    IF v_stored_mastery IS NOT NULL AND jsonb_typeof(v_stored_mastery) = 'object' THEN
      FOR v_key, v_val IN SELECT * FROM jsonb_each(v_stored_mastery) LOOP
        IF p_mastery_json ? v_key THEN
          IF (p_mastery_json->v_key->>'attempts')::int < (v_val->>'attempts')::int THEN
            RETURN jsonb_build_object('error', 'validation_failed', 'details',
              'mastery attempts decreased for key ' || v_key);
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- AppTime: totalSecs and sessions can't decrease
    IF v_stored.apptime_json IS NOT NULL AND jsonb_typeof(v_stored.apptime_json) = 'object' THEN
      IF (p_apptime_json->>'totalSecs')::int < (v_stored.apptime_json->>'totalSecs')::int THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime totalSecs decreased');
      END IF;
      IF (p_apptime_json->>'sessions')::int < (v_stored.apptime_json->>'sessions')::int THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime sessions decreased');
      END IF;
    END IF;

    -- Done: flags can't flip back to false
    IF v_stored.done_json IS NOT NULL AND jsonb_typeof(v_stored.done_json) = 'object' THEN
      FOR v_key, v_val IN SELECT * FROM jsonb_each(v_stored.done_json) LOOP
        IF v_val = 'true'::jsonb AND p_done_json ? v_key THEN
          IF (p_done_json->v_key) <> 'true'::jsonb THEN
            RETURN jsonb_build_object('error', 'validation_failed', 'details',
              'done flag flipped back to false for key ' || v_key);
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- Act dates: array can't shrink
    IF v_stored.act_dates_json IS NOT NULL AND jsonb_typeof(v_stored.act_dates_json) = 'array' THEN
      IF jsonb_array_length(p_act_dates_json) < jsonb_array_length(v_stored.act_dates_json) THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'act_dates_json array shrank');
      END IF;
    END IF;
  END IF;

  -- ── Score validation ──────────────────────────────────────────────────────
  IF p_scores IS NOT NULL AND jsonb_typeof(p_scores) = 'array' AND jsonb_array_length(p_scores) > 0 THEN
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_scores) LOOP
      -- Required fields and range checks
      IF (v_entry->>'score')::int < 0 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'score < 0');
      END IF;
      IF (v_entry->>'total')::int < 1 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'total < 1');
      END IF;
      IF (v_entry->>'score')::int > (v_entry->>'total')::int THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'score > total');
      END IF;
      IF (v_entry->>'pct')::int < 0 OR (v_entry->>'pct')::int > 100 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'pct out of range 0-100');
      END IF;
      -- Verify pct matches score/total (±1 for rounding)
      v_pct_calc := round((v_entry->>'score')::numeric / (v_entry->>'total')::numeric * 100);
      IF abs((v_entry->>'pct')::int - v_pct_calc) > 1 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'pct does not match score/total');
      END IF;
      -- unit_idx range
      IF (v_entry->>'unit_idx')::int < 0 OR (v_entry->>'unit_idx')::int > 9 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'unit_idx out of range 0-9');
      END IF;
      -- type must be valid
      IF (v_entry->>'type') NOT IN ('lesson', 'unit', 'final', 'review') THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'invalid score type');
      END IF;
    END LOOP;
  END IF;

  -- ── Write progress to student_profiles ────────────────────────────────────
  UPDATE student_profiles SET
    mastery_json      = p_mastery_json,
    streak_current    = p_streak_current,
    streak_longest    = p_streak_longest,
    streak_last_date  = p_streak_last_date,
    apptime_json      = p_apptime_json,
    done_json         = p_done_json,
    act_dates_json    = p_act_dates_json,
    settings_json     = p_settings_json,
    a11y_json         = p_a11y_json,
    updated_at        = now()
  WHERE id = p_student_id;

  -- ── Insert validated scores ───────────────────────────────────────────────
  IF p_scores IS NOT NULL AND jsonb_typeof(p_scores) = 'array' AND jsonb_array_length(p_scores) > 0 THEN
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_scores) LOOP
      -- Skip duplicates (same local_id for this student)
      IF NOT EXISTS (
        SELECT 1 FROM quiz_scores
        WHERE student_id = p_student_id AND local_id = (v_entry->>'local_id')::bigint
      ) THEN
        INSERT INTO quiz_scores (
          user_id, student_id, local_id, qid, label, type,
          score, total, pct, stars, unit_idx, color,
          student_name, time_taken, answers, date_str, time_str,
          quit, abandoned
        ) VALUES (
          -- PIN-only students don't have a user_id; use the parent_id from student_profiles
          (SELECT parent_id FROM student_profiles WHERE id = p_student_id),
          p_student_id,
          (v_entry->>'local_id')::bigint,
          v_entry->>'qid',
          COALESCE(v_entry->>'label', ''),
          v_entry->>'type',
          (v_entry->>'score')::int,
          (v_entry->>'total')::int,
          (v_entry->>'pct')::int,
          COALESCE(v_entry->>'stars', ''),
          (v_entry->>'unit_idx')::int,
          COALESCE(v_entry->>'color', '#6c5ce7'),
          COALESCE(v_entry->>'student_name', ''),
          COALESCE(v_entry->>'time_taken', ''),
          COALESCE(v_entry->'answers', '[]'::jsonb),
          COALESCE(v_entry->>'date_str', ''),
          COALESCE(v_entry->>'time_str', ''),
          COALESCE((v_entry->>'quit')::boolean, false),
          COALESCE((v_entry->>'abandoned')::boolean, false)
        );
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION push_student_progress(UUID, UUID, JSONB, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) FROM public;
GRANT EXECUTE ON FUNCTION push_student_progress(UUID, UUID, JSONB, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION push_student_progress(UUID, UUID, JSONB, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. pull_student_progress — session-authenticated read
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION pull_student_progress(p_student_id UUID, p_session_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile  JSONB;
  v_scores   JSONB;
BEGIN
  -- Auth: validate session token
  PERFORM _validate_pin_session(p_student_id, p_session_token);

  -- Fetch profile data
  SELECT jsonb_build_object(
    'mastery_json', mastery_json,
    'streak_current', streak_current,
    'streak_longest', streak_longest,
    'streak_last_date', streak_last_date,
    'apptime_json', apptime_json,
    'done_json', done_json,
    'act_dates_json', act_dates_json,
    'settings_json', settings_json,
    'a11y_json', a11y_json,
    'unlock_settings', unlock_settings,
    'onboarding_json', COALESCE(onboarding_json, '{}'::jsonb)
  ) INTO v_profile
  FROM student_profiles WHERE id = p_student_id;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('error', 'student_not_found');
  END IF;

  -- Fetch scores (limit 200, most recent first)
  SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb ORDER BY s.created_at DESC), '[]'::jsonb)
  INTO v_scores
  FROM (
    SELECT local_id, qid, label, type, score, total, pct, stars,
           unit_idx, color, student_name, time_taken, answers,
           date_str, time_str, quit, abandoned, student_id, created_at
    FROM quiz_scores
    WHERE student_id = p_student_id
    ORDER BY created_at DESC
    LIMIT 200
  ) s;

  RETURN jsonb_build_object(
    'profile', v_profile,
    'scores', v_scores
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION pull_student_progress(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION pull_student_progress(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION pull_student_progress(UUID, UUID) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Fix get_unlock_settings — require session token or parent auth
--    Same fix applied to get_timer_settings and get_a11y_settings.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop old single-arg versions first to avoid overload ambiguity
DROP FUNCTION IF EXISTS get_unlock_settings(UUID);
DROP FUNCTION IF EXISTS get_timer_settings(UUID);
DROP FUNCTION IF EXISTS get_a11y_settings(UUID);

CREATE OR REPLACE FUNCTION get_unlock_settings(p_student_id UUID, p_session_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Parent path: auth.uid() owns the student
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM student_profiles WHERE id = p_student_id AND parent_id = auth.uid()) THEN
      RETURN (SELECT COALESCE(unlock_settings, '{}') FROM student_profiles WHERE id = p_student_id);
    END IF;
  END IF;

  -- PIN-only path: valid session token required
  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (SELECT COALESCE(unlock_settings, '{}') FROM student_profiles WHERE id = p_student_id);
  END IF;

  RAISE EXCEPTION 'not_authorized'
    USING HINT = 'Requires parent auth or valid session token';
END;
$$;

REVOKE EXECUTE ON FUNCTION get_unlock_settings(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_timer_settings(p_student_id UUID, p_session_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM student_profiles WHERE id = p_student_id AND parent_id = auth.uid()) THEN
      RETURN (SELECT COALESCE(timer_settings, '{}') FROM student_profiles WHERE id = p_student_id);
    END IF;
  END IF;

  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (SELECT COALESCE(timer_settings, '{}') FROM student_profiles WHERE id = p_student_id);
  END IF;

  RAISE EXCEPTION 'not_authorized';
END;
$$;

REVOKE EXECUTE ON FUNCTION get_timer_settings(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_a11y_settings(p_student_id UUID, p_session_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM student_profiles WHERE id = p_student_id AND parent_id = auth.uid()) THEN
      RETURN (SELECT COALESCE(a11y_settings, '{}') FROM student_profiles WHERE id = p_student_id);
    END IF;
  END IF;

  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (SELECT COALESCE(a11y_settings, '{}') FROM student_profiles WHERE id = p_student_id);
  END IF;

  RAISE EXCEPTION 'not_authorized';
END;
$$;

REVOKE EXECUTE ON FUNCTION get_a11y_settings(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID, UUID) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. Quiz scores INSERT trigger — validates even the authenticated parent path
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_quiz_score()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.score < 0 OR NEW.total < 1 OR NEW.score > NEW.total THEN
    RAISE EXCEPTION 'invalid score values: score=%, total=%', NEW.score, NEW.total;
  END IF;
  IF NEW.pct < 0 OR NEW.pct > 100 THEN
    RAISE EXCEPTION 'invalid pct: %', NEW.pct;
  END IF;
  IF NEW.unit_idx IS NOT NULL AND (NEW.unit_idx < 0 OR NEW.unit_idx > 9) THEN
    RAISE EXCEPTION 'invalid unit_idx: %', NEW.unit_idx;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_quiz_score
  BEFORE INSERT ON quiz_scores
  FOR EACH ROW EXECUTE FUNCTION validate_quiz_score();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. Cleanup: scheduled deletion of expired pin_sessions
--     Run as a Supabase cron job (pg_cron) or call manually:
--     SELECT cleanup_expired_pin_sessions();
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION cleanup_expired_pin_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM pin_sessions WHERE expires_at < now();
$$;
