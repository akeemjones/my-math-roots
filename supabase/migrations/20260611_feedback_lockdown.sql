-- supabase/migrations/20260611_feedback_lockdown.sql
--
-- Pre-launch hardening — addresses three findings from the 2026-05-22 audit:
--
--   1. SS-1 (Critical) — the `feedback-email` AFTER INSERT trigger on
--      public.feedback embeds a plaintext service_role JWT in
--      `pg_trigger.tgargs`. The JWT decoded shows role=service_role,
--      exp=2089788635 (2036-08-15). Anyone with read access to pg_trigger,
--      a database dump, or a Supabase dashboard screenshot now has a key
--      that bypasses RLS for ~10 years. Dropping the trigger scrubs the
--      JWT from catalog state, after which the service_role key must be
--      rotated manually (see ROTATION STEPS below).
--
--   2. A2-F5 (Low) — the existing INSERT policy `"Authenticated users can
--      submit feedback"` enforces `auth.uid() IS NOT NULL` but does NOT
--      pin `user_id = auth.uid()`. An authenticated parent could insert a
--      row with `user_id = <another parent's uuid>`, and the victim would
--      see it in their own feedback view (the SELECT policy is
--      `auth.uid() = user_id`). Tightening WITH CHECK closes that hole.
--
--   3. A3-F9 (Medium) — feedback has no server-side rate limit. The
--      client throttle in src/settings.js (3/min) is trivially bypassed
--      by a direct PostgREST POST. A single authenticated parent could
--      have exhausted the Resend free tier (100 emails/day) in a single
--      POST loop — though the Resend trigger is removed in step 1, we
--      still want a row-count cap for storage hygiene and to keep the
--      blast radius bounded when feedback email is eventually re-wired.
--
-- This migration is idempotent (re-applying is a no-op) and intentionally
-- DOES NOT recreate the feedback-email trigger. Re-enabling parent
-- feedback email notifications post-launch requires the manual steps
-- documented at the bottom of this file.

-- ── 1. Drop the trigger that embeds the service_role JWT ──────────────────
-- The trigger calls supabase_functions.http_request(...) with the JWT
-- hardcoded in `tgargs`. DROP TRIGGER scrubs the JWT from catalog state.
-- After this migration applies, manually rotate the service_role key in
-- the Supabase dashboard (see ROTATION STEPS) — the embedded JWT remains
-- valid until then.
--
-- IF EXISTS so re-application on a fresh DB (where the trigger never
-- existed) does not error.
DROP TRIGGER IF EXISTS "feedback-email" ON public.feedback;

-- ── 2. Tighten the INSERT WITH CHECK ──────────────────────────────────────
-- Old: WITH CHECK (auth.uid() IS NOT NULL)
-- New: WITH CHECK (auth.uid() = user_id)
--
-- The old policy let any authenticated user insert feedback rows on
-- behalf of any other user. The new policy pins user_id to the caller's
-- auth.uid() — combined with the SELECT policy (auth.uid() = user_id),
-- this means a user can only insert and read their OWN feedback.
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.feedback;
CREATE POLICY "Authenticated users can submit feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Server-side rate-limit trigger ─────────────────────────────────────
-- Calls public.check_and_increment_rate_limit (service-role-only RPC,
-- defined in 20260608_rate_limit_rpc.sql) keyed by the authenticated
-- user's UUID. Returns TRUE when count > p_max — i.e. caller is OVER the
-- limit — at which point we RAISE EXCEPTION to abort the INSERT.
--
-- Limit: 5 feedback submissions per authenticated user per rolling hour.
-- Generous for legitimate use (most users submit 0-1/month) and tight
-- enough to bound storage growth and downstream notification cost.
--
-- ERRCODE 53400 = configuration_limit_exceeded — distinct from 23xxx
-- integrity violations so the client can surface a friendly retry-later
-- message without confusing it with WITH CHECK rejection.
CREATE OR REPLACE FUNCTION public._feedback_rate_limit_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_over_limit BOOLEAN;
BEGIN
  -- Defense in depth: WITH CHECK above already enforces auth.uid() = user_id,
  -- but if the policy is ever loosened we still want the trigger to fail
  -- closed rather than fall through to an unkeyed limit check.
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'feedback requires authenticated user'
      USING ERRCODE = '42501';
  END IF;

  v_over_limit := public.check_and_increment_rate_limit(
    'feedback:' || NEW.user_id::text,
    5,
    3600000  -- 1 hour in ms
  );
  IF v_over_limit THEN
    RAISE EXCEPTION 'feedback_rate_limited'
      USING ERRCODE = '53400',
            HINT    = 'Please wait before submitting more feedback.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._feedback_rate_limit_check()
  FROM PUBLIC, anon, authenticated;
-- Trigger functions are invoked by the trigger system regardless of
-- EXECUTE grants, so revoking from clients prevents REST callers from
-- invoking the function out-of-context while still allowing the trigger
-- itself to fire.

COMMENT ON FUNCTION public._feedback_rate_limit_check() IS
  'BEFORE INSERT trigger for public.feedback. Limits inserts to 5 per '
  'authenticated user per rolling hour via check_and_increment_rate_limit. '
  'Added 2026-05-22 (audit A3-F9). Errcode 53400 on limit hit.';

DROP TRIGGER IF EXISTS trg_feedback_rate_limit ON public.feedback;
CREATE TRIGGER trg_feedback_rate_limit
  BEFORE INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public._feedback_rate_limit_check();

-- ── Manual verification (post-apply, against prod or staging) ─────────────
-- 1. Confirm the trigger that embedded the JWT is gone:
--      SELECT count(*) FROM pg_trigger t
--      JOIN pg_class c ON c.oid = t.tgrelid
--      WHERE c.relname='feedback'
--        AND t.tgname='feedback-email'
--        AND NOT t.tgisinternal;          -- expected: 0
--
-- 2. Confirm no remaining JWTs in trigger args anywhere:
--      SELECT count(*) FROM pg_trigger t
--      JOIN pg_class c ON c.oid = t.tgrelid
--      JOIN pg_namespace n ON n.oid = c.relnamespace
--      WHERE n.nspname='public'
--        AND NOT t.tgisinternal
--        AND encode(t.tgargs,'escape')
--            ~ 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+';
--      -- expected: 0
--
-- 3. Confirm new policy is in place:
--      SELECT policyname, with_check
--      FROM pg_policies
--      WHERE schemaname='public' AND tablename='feedback' AND cmd='INSERT';
--      -- expected: with_check = (auth.uid() = user_id)
--
-- 4. Confirm rate-limit trigger fires:
--      As parent A (use any test user with at least one feedback row):
--        INSERT INTO feedback (user_id, rating, category)
--          VALUES (auth.uid(), 5, 'General');             -- 1: ok
--        ...(repeat 5 times)
--        INSERT INTO feedback (user_id, rating, category)
--          VALUES (auth.uid(), 5, 'General');             -- 6: errcode 53400
--      Cleanup: DELETE FROM api_rate_limits WHERE key='feedback:'||auth.uid()::text;
--               DELETE FROM feedback WHERE user_id=auth.uid() AND category='General';
--
-- ── ROTATION STEPS (manual, post-deploy) ──────────────────────────────────
-- After this migration applies in production, the embedded JWT is gone
-- from catalog state but it remains a valid credential against the
-- Supabase API until the service_role key is rotated. Steps:
--
--   1. Supabase dashboard → Project Settings → API → Reset service_role key.
--      Copy the new key (it will only be shown once).
--
--   2. Update SUPABASE_SERVICE_ROLE_KEY in every environment that holds it:
--      - Netlify → Site settings → Environment variables (production +
--        deploy-preview + branch deploys)
--      - Supabase → Project Settings → Edge Functions secrets
--        (notify-feedback, notify-new-signup, notify-new-visitor,
--         send-push, and any other function that uses it)
--      - Local developer .env files (Cameron's machine only — the repo
--        .env is gitignored and contains only the anon key by design)
--
--   3. Trigger a fresh Netlify deploy so the new key is used. Trigger a
--      manual redeploy of each Supabase Edge Function (functions cache
--      env vars at boot).
--
--   4. Smoke test:
--      - signup-gate happy path (proves the new service-role key works
--        for auth.admin.createUser)
--      - waitlist-join happy path
--      - parent dashboard loads (proves analytics-query admin path works)
--
-- ── RE-WIRING FEEDBACK EMAIL (deferred, post-launch) ──────────────────────
-- The feedback-email trigger is dropped, not replaced. To re-enable
-- per-feedback admin email notifications post-launch, mirror the pattern
-- already used by notify-new-visitor (20260501_launch_security_hardening.sql
-- §7) which reads its shared secret from Supabase Vault:
--
--   1. INSERT INTO vault.secrets (name, secret)
--        VALUES ('notify_feedback_secret',
--                encode(extensions.gen_random_bytes(32), 'base64'));
--   2. Update supabase/functions/notify-feedback/index.ts to require
--        Authorization: Bearer ${Deno.env.get('NOTIFY_FEEDBACK_SECRET')}
--        and deploy with --no-verify-jwt.
--   3. Set the NOTIFY_FEEDBACK_SECRET edge-function secret to match the
--        Vault value.
--   4. Create a new AFTER INSERT trigger that calls
--        supabase_functions.http_request(...) with the header
--        'Authorization: Bearer ' || (SELECT decrypted_secret FROM
--                                     vault.decrypted_secrets
--                                     WHERE name='notify_feedback_secret')
--      built at insert time so the secret never lives in pg_trigger.tgargs.
