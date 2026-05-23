-- supabase/migrations/20260601_admin_source_of_truth.sql
--
-- Move admin authorization off `profiles.role = 'admin'` and onto a
-- dedicated, lockable `admin_users` table.
--
-- Why this exists:
--   The production `profiles` UPDATE policy (captured in
--   20260600_profiles_baseline.sql) gates on auth.uid() = id only — it has
--   no column-level restriction. An authenticated user can therefore call
--       UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
--   and successfully promote themselves. The analytics-query Netlify
--   function gates the admin dashboard on `profiles.role = 'admin'`, so
--   self-promotion today unlocks the analytics dashboard.
--
-- What this migration does:
--   1. Adds public.admin_users — RLS-enabled, NO policies, mutated only
--      by service-role (Supabase dashboard / SECURITY DEFINER seeding).
--   2. Adds public.is_admin() — a STABLE SECURITY DEFINER helper that
--      returns TRUE iff the caller's auth.uid() is in admin_users.
--   3. Seeds admin_users from existing profiles.role='admin' rows.
--   4. Adds a BEFORE UPDATE trigger on profiles that rejects any change
--      to `role` unless the caller is service_role OR is_admin() = true.
--      This is defense-in-depth: even with the row-only UPDATE policy in
--      place, role mutation by normal users is blocked at the trigger.
--
-- Migration order: applies after 20260600_profiles_baseline.sql.
-- Consumer update: netlify/functions/analytics-query.js switches its
-- admin lookup from profiles.role to admin_users in the same commit.

-- ── 1. admin_users table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID,
  note       TEXT
);
COMMENT ON TABLE public.admin_users IS
  'Admin source-of-truth. RLS enabled, no policies — all writes via '
  'service_role (Supabase dashboard) or the seed in this migration. '
  'analytics-query.js checks membership of this table to authorize '
  'admin metrics endpoints.';

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- No policies → no client access. is_admin() is the read interface.

-- Belt-and-braces: drop any default SELECT/INSERT/UPDATE/DELETE grants
-- (Supabase REST may otherwise let anon/auth hit the relation; RLS would
-- deny but we want the table absent from PostgREST entirely).
REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
GRANT  ALL ON TABLE public.admin_users TO service_role;

-- ── 2. is_admin() RPC ──────────────────────────────────────────────────────
-- STABLE so callers can use it in policy USING/WITH CHECK clauses and the
-- planner can cache its result inside a single query.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;
COMMENT ON FUNCTION public.is_admin() IS
  'Returns TRUE iff the caller is an admin (member of public.admin_users). '
  'STABLE + SECURITY DEFINER + locked search_path so it is safe to call '
  'from RLS policies, triggers, and Netlify-function authorization checks.';

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ── 3. Seed admin_users from existing profiles.role='admin' rows ───────────
-- One-time bootstrap so the analytics dashboard keeps working for the
-- humans who were admin under the old scheme. Safe to re-run via ON
-- CONFLICT DO NOTHING.
INSERT INTO public.admin_users (user_id, granted_at, granted_by, note)
SELECT p.id, NOW(), NULL, 'auto-seeded from profiles.role=''admin'''
FROM   public.profiles p
WHERE  p.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- ── 4. profiles role-change guard ─────────────────────────────────────────
-- Blocks self-promotion via UPDATE profiles SET role='admin'.
CREATE OR REPLACE FUNCTION public._profiles_block_role_self_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow if the caller is the service-role (Supabase admin API, dashboard,
    -- our SECURITY DEFINER functions running with elevated privileges) OR
    -- if the caller is already an admin (admins re-assigning roles).
    IF auth.role() = 'service_role' THEN
      RETURN NEW;
    END IF;
    IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION
      'role_change_not_allowed: only service_role or existing admins may change profiles.role (attempted % -> %)',
      OLD.role, NEW.role
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public._profiles_block_role_self_promotion() IS
  'Defense-in-depth trigger blocking role changes on public.profiles by '
  'anyone other than service_role or an existing admin. The profiles '
  'UPDATE policy is row-only (auth.uid()=id) and does not restrict the '
  'role column on its own.';

DROP TRIGGER IF EXISTS trg_profiles_block_role_change ON public.profiles;
CREATE TRIGGER trg_profiles_block_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public._profiles_block_role_self_promotion();

-- ── 5. Manual verification queries (run after migration applies) ──────────
-- As a non-admin authenticated user:
--   SELECT public.is_admin();                                 -- expect false
--   UPDATE public.profiles SET role='admin' WHERE id=auth.uid();
--                                                            -- expect 42501
-- As service_role (Supabase dashboard SQL editor):
--   SELECT user_id, granted_at FROM public.admin_users;       -- expect seeded
--   INSERT INTO public.admin_users (user_id) VALUES ('<uuid>'); -- OK
