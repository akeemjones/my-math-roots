-- supabase/migrations/20260603_rpc_ownership_lockdown.sql
--
-- Tracking-baseline migration: backport the production-hardened bodies of
-- the parent-control SECURITY DEFINER RPCs into the repo migration history.
--
-- Codex audit flagged these five RPCs as trusting browser-supplied IDs:
--   get_pin_hash(p_parent_id uuid)
--   ensure_family_code(p_parent_id uuid)
--   get_a11y_settings(p_student_id uuid, p_session_token uuid)
--   get_timer_settings(p_student_id uuid, p_session_token uuid)
--   get_unlock_settings(p_student_id uuid, p_session_token uuid)
--
-- DIRECT INSPECTION VERDICT (Supabase MCP on omjegwtzirskgmgeojdn, 2026-05-21
-- — `SELECT prosrc FROM pg_proc WHERE proname IN (...)`):
--
--   * get_pin_hash production body now includes "AND id = auth.uid()".
--     The corresponding repo migration 20260331_parent_controls_fixup.sql
--     at lines 24-27 declares the OLDER, unsafe body without that clause.
--     A fresh test/dev DB built from the current repo would therefore
--     install the vulnerable version.
--
--   * ensure_family_code production body raises 'Not authorized' when
--     auth.uid() IS NULL OR auth.uid() != p_parent_id. The repo migration
--     20260330_student_profiles.sql declares an earlier body without this
--     check.
--
--   * get_a11y_settings / get_timer_settings / get_unlock_settings
--     production bodies require EITHER parent ownership
--     (student_profiles.parent_id = auth.uid()) OR a valid PIN session
--     token via _validate_pin_session(p_student_id, p_session_token).
--     The repo migrations show simpler earlier versions.
--
-- This migration therefore is NOT a behavior change in production (which
-- is already safe), but it IS a behavior change for any fresh
-- staging/test environment built off this repo: those environments will
-- now install the safe bodies on day one rather than depending on an
-- out-of-band dashboard patch that was previously not tracked.

-- ── 1. get_pin_hash(uuid) — restrict to caller's own row ───────────────────
DROP FUNCTION IF EXISTS public.get_pin_hash(UUID);
CREATE OR REPLACE FUNCTION public.get_pin_hash(p_parent_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Caller can only retrieve their OWN pin hash. The AND id = auth.uid()
  -- clause makes the function safe even if a misconfigured GRANT exposes
  -- it to anon (no rows ever returned without an auth context).
  SELECT parent_pin_hash FROM profiles WHERE id = p_parent_id AND id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_pin_hash(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_pin_hash(UUID) TO authenticated;
COMMENT ON FUNCTION public.get_pin_hash(UUID) IS
  'Returns the caller''s own parent_pin_hash only. Production-hardened '
  'body backported from prod (2026-05-21) into the repo migration history.';

-- ── 2. ensure_family_code(uuid) — explicit ownership check ─────────────────
DROP FUNCTION IF EXISTS public.ensure_family_code(UUID);
CREATE OR REPLACE FUNCTION public.ensure_family_code(p_parent_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Reject if no auth context or if caller is requesting another parent's row.
  IF auth.uid() IS NULL OR auth.uid() != p_parent_id THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT family_code INTO v_code FROM profiles WHERE id = p_parent_id;
  IF v_code IS NULL THEN
    v_code := 'MMR-' || upper(
      substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)
    );
    UPDATE profiles SET family_code = v_code WHERE id = p_parent_id;
  END IF;
  RETURN v_code;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.ensure_family_code(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.ensure_family_code(UUID) TO authenticated;
COMMENT ON FUNCTION public.ensure_family_code(UUID) IS
  'Generates a family_code for the caller''s own profile row only. '
  'Production-hardened body backported from prod (2026-05-21).';

-- ── 3. get_a11y_settings / get_timer_settings / get_unlock_settings ────────
-- All three accept a student id + optional PIN session token. Caller is
-- authorized if they own the student profile (parent_id = auth.uid()) OR
-- if the PIN session token is valid via _validate_pin_session.

DROP FUNCTION IF EXISTS public.get_a11y_settings(UUID, UUID);
CREATE OR REPLACE FUNCTION public.get_a11y_settings(p_student_id UUID, p_session_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM student_profiles WHERE id = p_student_id AND parent_id = auth.uid()) THEN
      RETURN (SELECT COALESCE(a11y_settings, '{}'::jsonb) FROM student_profiles WHERE id = p_student_id);
    END IF;
  END IF;
  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (SELECT COALESCE(a11y_settings, '{}'::jsonb) FROM student_profiles WHERE id = p_student_id);
  END IF;
  RAISE EXCEPTION 'not_authorized' USING ERRCODE = '42501';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_a11y_settings(UUID, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_a11y_settings(UUID, UUID) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.get_timer_settings(UUID, UUID);
CREATE OR REPLACE FUNCTION public.get_timer_settings(p_student_id UUID, p_session_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM student_profiles WHERE id = p_student_id AND parent_id = auth.uid()) THEN
      RETURN (SELECT COALESCE(timer_settings, '{}'::jsonb) FROM student_profiles WHERE id = p_student_id);
    END IF;
  END IF;
  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (SELECT COALESCE(timer_settings, '{}'::jsonb) FROM student_profiles WHERE id = p_student_id);
  END IF;
  RAISE EXCEPTION 'not_authorized' USING ERRCODE = '42501';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_timer_settings(UUID, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_timer_settings(UUID, UUID) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.get_unlock_settings(UUID, UUID);
CREATE OR REPLACE FUNCTION public.get_unlock_settings(p_student_id UUID, p_session_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM student_profiles WHERE id = p_student_id AND parent_id = auth.uid()) THEN
      RETURN (SELECT COALESCE(unlock_settings, '{}'::jsonb) FROM student_profiles WHERE id = p_student_id);
    END IF;
  END IF;
  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (SELECT COALESCE(unlock_settings, '{}'::jsonb) FROM student_profiles WHERE id = p_student_id);
  END IF;
  RAISE EXCEPTION 'not_authorized' USING ERRCODE = '42501'
    USING HINT = 'Requires parent auth or valid session token';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_unlock_settings(UUID, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_unlock_settings(UUID, UUID) TO anon, authenticated;

-- ── 4. Manual verification queries (post-apply) ────────────────────────────
-- Run as authenticated user A:
--   SELECT public.get_pin_hash(<auth.uid()>);  -- returns hash
--   SELECT public.get_pin_hash(<other-parent-uuid>); -- returns NULL (no row)
--   SELECT public.ensure_family_code(<other-parent-uuid>); -- raises 42501
--   SELECT public.get_unlock_settings('<other-parent-student-id>'::uuid);
--                                                            -- raises 42501
-- Run as anon:
--   SELECT public.get_pin_hash('<any-uuid>'::uuid);  -- permission denied
-- Run as student with PIN session for student S:
--   SELECT public.get_unlock_settings(S, '<session_token>'::uuid); -- returns row
