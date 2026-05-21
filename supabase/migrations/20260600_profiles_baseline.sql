-- supabase/migrations/20260600_profiles_baseline.sql
--
-- Phase 0 schema baseline — captured from production on 2026-05-21.
--
-- The `public.profiles` table predates the migration history in this repo:
-- it was created during initial Supabase bootstrap (likely via the studio
-- editor or a docs/supabase_setup.sql script) and only ALTERed by tracked
-- migrations (family_code added in 20260330_student_profiles.sql,
-- parent_pin_hash added in 20260331_parent_controls.sql, role CHECK widened
-- to include 'admin' in 20260501_profiles_add_admin_role.sql, etc).
--
-- This migration declares the current production shape so:
--   (1) Future profile schema changes land here or in subsequent migrations
--       — never via the dashboard.
--   (2) Fresh test/dev environments get the exact same table shape, policies,
--       and trigger set without depending on an out-of-band bootstrap.
--   (3) Audits can grep this file to see the authoritative state, including
--       which RLS policies are in force.
--
-- The migration is non-destructive: every statement uses IF [NOT] EXISTS or
-- DROP-then-CREATE so it can be re-applied without losing data. Applied
-- against production it is a no-op (table + policies already exist).
--
-- Future production-only tables (quiz_scores, intervention_events,
-- student_progress, user_mastery, push_subscriptions, pin_sessions,
-- pin_attempts, anonymous_sessions, leads, feedback) are intentionally
-- DEFERRED to a Phase 1 reverse-engineer pass — they exist in production
-- but their baseline is out of scope for the launch-blocker fixes.

-- ── 1. profiles table ───────────────────────────────────────────────────────
-- Columns captured from pg_catalog on 2026-05-21. The CHECK on `role`
-- includes 'admin' (added in 20260501_profiles_add_admin_role.sql); the
-- baseline declares the final shape so a fresh DB doesn't need the chained
-- ALTER from the earlier migration to match production.
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name         TEXT        NOT NULL DEFAULT ''::text,
  role                 TEXT        NOT NULL DEFAULT 'student'::text
                                    CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text])),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_streak       INTEGER     NOT NULL DEFAULT 0,
  longest_streak       INTEGER     NOT NULL DEFAULT 0,
  last_activity_date   DATE,
  family_code          TEXT        UNIQUE,
  parent_pin_hash      TEXT
);

-- Defensive idempotency for the chained role CHECK (in case an older
-- environment still has the pre-admin constraint).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname  = 'profiles_role_check'
      AND pg_get_constraintdef(oid) LIKE '%admin%'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
        CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text]));
  END IF;
END $$;

-- ── 2. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── 3. Policies (captured verbatim from production) ─────────────────────────
-- Audited 2026-05-21 via pg_policies:
--   "Users can insert own profile"  INSERT  WITH CHECK (auth.uid() = id)
--   "Users can read own profile"    SELECT  USING       (auth.uid() = id)
--   "Users can update own profile"  UPDATE  USING       (auth.uid() = id)
--                                          WITH CHECK   (auth.uid() = id)
--
-- IMPORTANT: the UPDATE policy is row-level only — it does NOT restrict
-- which columns the caller may set. In particular, an authenticated user
-- could call
--     UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
-- and successfully promote themselves to admin. The follow-up migration
-- 20260601_admin_source_of_truth.sql adds (a) an `admin_users` table as
-- the new source of truth for admin authorization and (b) a BEFORE UPDATE
-- trigger on this table that rejects role changes unless the caller is
-- already admin or running with service_role. This baseline file does
-- NOT add the trigger — it only captures the as-found policies.

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── 4. Triggers ─────────────────────────────────────────────────────────────
-- Production has no triggers on public.profiles as of 2026-05-21 (verified
-- via pg_trigger query). The handle_new_user() function lives on auth.users
-- and inserts the matching profiles row from raw_user_meta_data. It is
-- managed via supabase_setup.sql / dashboard and out of scope for this
-- baseline.
