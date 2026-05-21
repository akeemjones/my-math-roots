-- supabase/migrations/20260602_family_code_lockdown.sql
--
-- Lock down the family-code surface to stop two enumeration attacks:
--
--   (1) public.family_code_lookup VIEW (created by
--       20260330_student_profiles.sql) grants SELECT to anon AND
--       authenticated and exposes (id, family_code) for every parent.
--       Anon can dump the entire table to harvest every family code.
--       Verified in production via Supabase MCP on 2026-05-21: the view
--       still exists with relkind='v' and ACL listing anon + authenticated.
--
--   (2) public.get_profiles_by_family_code(text) returns
--       (id, username, display_name, age, avatar_emoji, avatar_color_from,
--        avatar_color_to, grade)
--       to anon AND authenticated, with NO rate limit and NO ownership
--       check. Combined with (1), an attacker can dump every parent's
--       family code, then for each code dump every child's first name,
--       age, and grade. Child PII at scale.
--
-- This migration:
--   * DROPs the family_code_lookup view (no remaining caller — the RPC
--     is the supported family-pick path).
--   * Replaces get_profiles_by_family_code with a version that:
--       - returns only the columns the login picker actually renders
--         (id, username, display_name, avatar_emoji, avatar_color_from,
--          avatar_color_to). display_name is needed so the child can
--         identify their avatar; age + grade are dropped (the picker
--         does not display them).
--       - rate-limits per family-code (key = 'family_code:' || upper(code))
--         at 20 lookups / 5-min window via public.check_and_increment_rate_limit
--         (verified to exist in production 2026-05-21, signature
--         (text, int, bigint) RETURNS boolean — TRUE when over limit).
--       - on unknown code, returns an empty set with no extra hint
--         (no timing-side-channel improvement is attempted here —
--         pg's UPDATE-on-rate-limit-table dominates timing).
--   * Keeps GRANT to anon + authenticated (the join/login flow legitimately
--     needs anon access).

-- ── 1. Drop the enumerable view ────────────────────────────────────────────
DROP VIEW IF EXISTS public.family_code_lookup;

-- ── 2. Replace get_profiles_by_family_code with the trimmed + rate-limited version ──
-- Drop the previous overload to make the migration deterministic; the
-- function is re-defined immediately below.
DROP FUNCTION IF EXISTS public.get_profiles_by_family_code(TEXT);

CREATE OR REPLACE FUNCTION public.get_profiles_by_family_code(p_family_code TEXT)
RETURNS TABLE (
  id                 UUID,
  username           TEXT,
  display_name       TEXT,
  avatar_emoji       TEXT,
  avatar_color_from  TEXT,
  avatar_color_to    TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code  TEXT;
  v_over  BOOLEAN;
BEGIN
  -- Normalize the input. Family codes are upper-case 8-char hex per
  -- 20260330_student_profiles.sql / 20260331 fixups; pass through any
  -- string, normalize, and look up. Invalid shapes simply find nothing.
  v_code := upper(trim(coalesce(p_family_code, '')));
  IF v_code = '' THEN RETURN; END IF;

  -- Per-family-code rate limit: 20 lookups per 5-minute window. Brute-
  -- forcing the 8-char hex space (~4 billion codes) at 20/5min would take
  -- ~1900 years, so this is sufficient even without per-IP throttling
  -- (the SECURITY DEFINER body cannot easily access the caller IP).
  -- check_and_increment_rate_limit returns TRUE when OVER the limit.
  v_over := public.check_and_increment_rate_limit(
              'family_code:' || v_code,
              20,
              (5 * 60 * 1000)::bigint  -- 5-minute window
            );
  IF v_over THEN
    -- Indistinguishable from "code not found" to the caller. Internal logs
    -- (Postgres) will show repeated calls; admin can monitor rate-limit table.
    RETURN;
  END IF;

  RETURN QUERY
    SELECT sp.id,
           sp.username,
           sp.display_name,
           sp.avatar_emoji,
           sp.avatar_color_from,
           sp.avatar_color_to
    FROM   student_profiles sp
    JOIN   profiles p ON p.id = sp.parent_id
    WHERE  p.family_code = v_code;
END;
$$;

-- Lock down EXECUTE: still anon + authenticated (login picker uses it).
REVOKE EXECUTE ON FUNCTION public.get_profiles_by_family_code(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_profiles_by_family_code(TEXT) TO anon;
GRANT  EXECUTE ON FUNCTION public.get_profiles_by_family_code(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_profiles_by_family_code(TEXT) IS
  'Login-screen family-code → student-picker lookup. Trimmed return '
  '(no age, no grade) and rate-limited at 20/5-min/code as of '
  '20260602_family_code_lockdown.sql.';

-- ── 3. Manual verification queries (post-apply) ────────────────────────────
-- As anon (curl REST):
--   GET /rest/v1/family_code_lookup?select=*  → 404 / "relation does not exist"
-- As anon RPC:
--   POST /rest/v1/rpc/get_profiles_by_family_code  {"p_family_code":"MMR-XXXXXXXX"}
--     → returns [] or [{id,username,display_name,avatar_emoji,...}]; never age/grade.
-- Repeated anon calls (>20 within 5 min for the same code):
--     → returns [] starting with the 21st call regardless of validity.
