-- supabase/migrations/20260604_signup_cap_atomic.sql
--
-- Make the controlled-beta signup cap race-safe.
--
-- Today netlify/functions/signup-gate.js does:
--   currentCount = await _countParentAccounts(...)         -- HEAD /profiles
--   if (currentCount >= settings.max_parent_accounts) return 403 cap_reached
--   await _adminCreateUser(...)
--
-- The COUNT-then-CREATE pair is not atomic. N parallel POSTs at
-- count=cap-1 all read the same count, all pass the check, all create.
-- A burst of signups at the cap boundary can therefore exceed
-- launch_settings.max_parent_accounts.
--
-- This migration introduces a singleton signup_counter row plus three
-- SECURITY DEFINER RPCs (service-role only) so the Netlify function can:
--   1. Reserve a slot atomically (UPDATE ... WHERE count < cap RETURNING),
--   2. Release a slot on _adminCreateUser failure (decrement),
--   3. Report drift between the counter and the actual profiles count
--      for an out-of-band reconciliation alarm.
--
-- Design notes:
--   * The counter is the SINGLE source of truth. There is NO trigger on
--     public.profiles that increments it — that would double-count when
--     the Netlify function both reserves AND a trigger fires on the
--     subsequent INSERT into profiles via the auth → profiles
--     handle_new_user path. Instead we use a periodic reconciliation
--     report (reconcile_signup_counter) and adjust by hand if drift
--     occurs.
--   * Reservations may leak (e.g. _adminCreateUser fails after Supabase
--     500 with no clean error path → release_signup_slot is not called).
--     Acceptable trade-off: leaked slots LOWER the effective cap by at
--     most a handful; over-allocation would be worse.
--   * The cap value lives in launch_settings.max_parent_accounts; this
--     migration reads it inside try_reserve_signup_slot at call time so
--     an admin update via admin_update_launch_settings takes effect
--     immediately.

-- ── 1. signup_counter (singleton) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.signup_counter (
  id           INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  parent_count INT NOT NULL DEFAULT 0 CHECK (parent_count >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One-time seed from the current profiles count. ON CONFLICT DO NOTHING
-- so re-running the migration is safe (no double seeding).
INSERT INTO public.signup_counter (id, parent_count)
SELECT 1, COALESCE((SELECT COUNT(*)::INT FROM public.profiles), 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.signup_counter ENABLE ROW LEVEL SECURITY;
-- No policies → no client access. Mutations only via the RPCs below.

REVOKE ALL ON TABLE public.signup_counter FROM PUBLIC, anon, authenticated;
GRANT  ALL ON TABLE public.signup_counter TO service_role;

COMMENT ON TABLE public.signup_counter IS
  'Singleton counter (id=1) reflecting reserved + created parent slots. '
  'The signup-gate Netlify function atomically increments via '
  'public.try_reserve_signup_slot() before creating the auth user, and '
  'decrements via public.release_signup_slot() on creation failure. '
  'Drift vs the actual COUNT(*) in profiles is reported by '
  'public.reconcile_signup_counter() — never auto-fixed.';

-- ── 2. try_reserve_signup_slot() ───────────────────────────────────────────
-- Returns TRUE if a slot was reserved (parent_count incremented),
-- FALSE if the cap was already met.
CREATE OR REPLACE FUNCTION public.try_reserve_signup_slot()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cap INT;
  v_new INT;
BEGIN
  SELECT max_parent_accounts INTO v_cap FROM launch_settings WHERE id = 1;
  IF v_cap IS NULL THEN
    -- Fail closed: if launch_settings is missing or unreadable, refuse
    -- to reserve. Operators can recover by re-seeding launch_settings.
    RETURN FALSE;
  END IF;

  -- Atomic compare-and-swap: only updates when current count is below the
  -- cap. PostgreSQL takes a row lock during UPDATE so concurrent reserves
  -- serialise on the singleton row.
  UPDATE signup_counter
     SET parent_count = parent_count + 1,
         updated_at   = now()
   WHERE id = 1
     AND parent_count < v_cap
  RETURNING parent_count INTO v_new;

  RETURN v_new IS NOT NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.try_reserve_signup_slot() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.try_reserve_signup_slot() TO service_role;

COMMENT ON FUNCTION public.try_reserve_signup_slot() IS
  'Atomically reserves one signup slot. Returns TRUE on success or '
  'FALSE if cap is reached. service_role only.';

-- ── 3. release_signup_slot() ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.release_signup_slot()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE signup_counter
     SET parent_count = GREATEST(parent_count - 1, 0),
         updated_at   = now()
   WHERE id = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_signup_slot() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.release_signup_slot() TO service_role;

COMMENT ON FUNCTION public.release_signup_slot() IS
  'Decrements signup_counter.parent_count by one (clamped at zero). '
  'Called by signup-gate.js when _adminCreateUser fails AFTER a '
  'successful try_reserve_signup_slot(). service_role only.';

-- ── 4. reconcile_signup_counter() — report-only drift check ────────────────
CREATE OR REPLACE FUNCTION public.reconcile_signup_counter()
RETURNS TABLE(counter_value INT, profiles_count INT, drift INT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT parent_count FROM signup_counter WHERE id = 1)         AS counter_value,
    (SELECT COUNT(*)::INT FROM profiles)                           AS profiles_count,
    ((SELECT parent_count FROM signup_counter WHERE id = 1)
     - (SELECT COUNT(*)::INT FROM profiles))                       AS drift;
$$;

REVOKE EXECUTE ON FUNCTION public.reconcile_signup_counter() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.reconcile_signup_counter() TO service_role;

COMMENT ON FUNCTION public.reconcile_signup_counter() IS
  'Read-only drift report. Returns (counter_value, profiles_count, drift). '
  'A scheduled weekly health check should alert when drift != 0. Drift is '
  'never auto-corrected; admin manually runs UPDATE signup_counter SET '
  'parent_count = (SELECT COUNT(*) FROM profiles) WHERE id = 1 when needed.';

-- ── 5. Manual verification queries (post-apply) ────────────────────────────
-- Initial seed:
--   SELECT * FROM signup_counter;                  -- (1, COUNT(*) FROM profiles, ...)
-- Reservation increments:
--   SELECT try_reserve_signup_slot();              -- TRUE; parent_count + 1
--   SELECT release_signup_slot();                  -- void; parent_count back
-- At cap:
--   UPDATE signup_counter SET parent_count = (SELECT max_parent_accounts
--     FROM launch_settings WHERE id = 1) WHERE id = 1;
--   SELECT try_reserve_signup_slot();              -- FALSE
-- Drift report:
--   SELECT * FROM reconcile_signup_counter();      -- (counter, profiles, drift)
