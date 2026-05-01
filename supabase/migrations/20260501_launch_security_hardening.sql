-- ════════════════════════════════════════════════════════════════════════════
--  2026-05-01 — LAUNCH SECURITY HARDENING
--  ⚠️ DO NOT APPLY WITHOUT FIRST READING /SECURITY_AUDIT.md
-- ════════════════════════════════════════════════════════════════════════════
--
-- Closes the four launch-blocker findings flagged in the public-launch audit:
--   1. anon_select_for_realtime policy lets ANY anon role SELECT every
--      student_profiles row (display_name, age, parent_id, mastery, settings)
--   2. get_all_student_settings(uuid) has no ownership check
--   3. get_student_progress_by_pin(uuid) has no ownership check
--   4. notify_new_visitor edge function is callable without auth via the
--      Supabase trigger's open net.http_post — fix the trigger here, then
--      redeploy the edge function with the matching Bearer check (see §7)
--
-- Plus three hardening cleanups:
--   5. Drop stale push_student_progress (12-arg, 13-arg) and
--      pull_student_progress (2-arg) overloads — the frontend uses the
--      latest signatures, but the older overloads remain callable by anon
--   6. anonymous_sessions has open INSERT/UPDATE policies; the frontend no
--      longer writes to this table (auth.js:1138 confirms log_anon_session
--      is "no longer called for guests"), so we can revoke direct access
--      and leave only the SECURITY DEFINER RPC path
--   7. validate_quiz_score has mutable search_path (Supabase advisor
--      warning 0011)
--
-- All changes are designed to be non-breaking against the current frontend:
--   - get_all_student_settings  → new sig is (uuid, uuid DEFAULT NULL)
--                                  single-arg callers still work, auth.uid()
--                                  path protects the parent-authed dashboard
--   - get_student_progress_by_pin → same default-arg pattern
--   - dropped push/pull overloads → frontend uses 14-arg push and 3-arg pull
--   - anonymous_sessions lockdown → frontend doesn't write to it
--   - notify_new_visitor trigger → existing trigger continues to fire; only
--                                   adds Authorization header to edge call
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- After applying: re-run get_advisors(security) and confirm count drops.
-- ════════════════════════════════════════════════════════════════════════════


-- ── 1. CRITICAL: drop anon_select_for_realtime on student_profiles ──────────
-- Removes the wildcard SELECT policy granted to the anon role. Realtime
-- subscriptions for parents continue to work via parent_owns_profiles
-- (parent_id = auth.uid()), which authenticates over the same channel.
DROP POLICY IF EXISTS "anon_select_for_realtime" ON public.student_profiles;


-- ── 2. CRITICAL: harden get_all_student_settings ────────────────────────────
-- Mirrors the get_unlock_settings/get_timer_settings/get_a11y_settings 2-arg
-- pattern from migration 007: parent path requires auth.uid() = parent_id;
-- PIN-session path requires a valid token via _validate_pin_session.
-- The default p_session_token = NULL keeps existing single-arg callers
-- (auth.js:_syncStudentSettings) working; they just need the parent's
-- Supabase session, which they already have.
DROP FUNCTION IF EXISTS public.get_all_student_settings(uuid);

CREATE OR REPLACE FUNCTION public.get_all_student_settings(
  p_student_id     uuid,
  p_session_token  uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM student_profiles
      WHERE id = p_student_id AND parent_id = auth.uid()
    ) THEN
      RETURN (
        SELECT jsonb_build_object(
          'unlock', COALESCE(unlock_settings, '{}'::jsonb),
          'timer',  COALESCE(timer_settings,  '{}'::jsonb),
          'a11y',   COALESCE(a11y_settings,   '{}'::jsonb)
        )
        FROM student_profiles WHERE id = p_student_id
      );
    END IF;
  END IF;

  IF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    RETURN (
      SELECT jsonb_build_object(
        'unlock', COALESCE(unlock_settings, '{}'::jsonb),
        'timer',  COALESCE(timer_settings,  '{}'::jsonb),
        'a11y',   COALESCE(a11y_settings,   '{}'::jsonb)
      )
      FROM student_profiles WHERE id = p_student_id
    );
  END IF;

  RAISE EXCEPTION 'not_authorized'
    USING HINT = 'Requires parent auth or valid session token';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_all_student_settings(uuid, uuid) FROM public;
GRANT  EXECUTE ON FUNCTION public.get_all_student_settings(uuid, uuid) TO anon;
GRANT  EXECUTE ON FUNCTION public.get_all_student_settings(uuid, uuid) TO authenticated;


-- ── 3. CRITICAL: harden get_student_progress_by_pin ─────────────────────────
-- Today this returns up to 200 quiz_scores rows + the parent's full
-- student_progress payload for ANY caller who knows a student_profiles.id.
-- Combined with the now-dropped anon_select_for_realtime that meant a full
-- child-progress dump for any anonymous attacker.
DROP FUNCTION IF EXISTS public.get_student_progress_by_pin(uuid);

CREATE OR REPLACE FUNCTION public.get_student_progress_by_pin(
  p_student_id     uuid,
  p_session_token  uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_scores    json;
  v_progress  json;
BEGIN
  SELECT parent_id INTO v_parent_id
  FROM student_profiles
  WHERE id = p_student_id;

  IF v_parent_id IS NULL THEN
    RETURN json_build_object('scores', '[]'::json, 'progress', '{}'::json);
  END IF;

  -- AUTH: parent owner OR valid student session.
  IF auth.uid() IS NOT NULL THEN
    IF v_parent_id <> auth.uid() THEN
      RAISE EXCEPTION 'not_authorized';
    END IF;
  ELSIF p_session_token IS NOT NULL THEN
    PERFORM _validate_pin_session(p_student_id, p_session_token);
  ELSE
    RAISE EXCEPTION 'not_authorized'
      USING HINT = 'Requires parent auth or valid session token';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(qs) ORDER BY qs.local_id DESC), '[]'::json)
  INTO v_scores
  FROM (
    SELECT id, local_id, qid, label, type, score, total, pct, stars,
           unit_idx, color, student_name, time_taken, answers,
           date_str, time_str, quit, abandoned, student_id
    FROM quiz_scores
    WHERE student_id = p_student_id
    ORDER BY local_id DESC
    LIMIT 200
  ) qs;

  SELECT to_json(
    json_build_object(
      'done_json',     COALESCE(sp.done_json::json,     '{}'::json),
      'mastery_json',  COALESCE(sp.mastery_json::json,  '{}'::json),
      'activity_json', COALESCE(sp.activity_json::json, '{"v":1,"events":[]}'::json)
    )
  )
  INTO v_progress
  FROM student_progress sp
  WHERE sp.user_id = v_parent_id
  LIMIT 1;

  RETURN json_build_object(
    'scores',   COALESCE(v_scores,   '[]'::json),
    'progress', COALESCE(v_progress, '{}'::json)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_student_progress_by_pin(uuid, uuid) FROM public;
GRANT  EXECUTE ON FUNCTION public.get_student_progress_by_pin(uuid, uuid) TO anon;
GRANT  EXECUTE ON FUNCTION public.get_student_progress_by_pin(uuid, uuid) TO authenticated;


-- ── 4. HIGH: drop stale push/pull overloads ─────────────────────────────────
-- These predate migration 007 (push) and migration 011 (activity_json) and
-- are still callable by anon today. The frontend uses only the latest
-- signatures (3-arg pull, 14-arg push), so dropping these is safe.
DROP FUNCTION IF EXISTS public.pull_student_progress(uuid, uuid);

DROP FUNCTION IF EXISTS public.push_student_progress(
  uuid, uuid, jsonb, integer, integer, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb
);  -- 12-arg, no grade

DROP FUNCTION IF EXISTS public.push_student_progress(
  uuid, uuid, jsonb, integer, integer, text,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text
);  -- 13-arg, no activity_json


-- ── 5. MEDIUM: lock validate_quiz_score search_path ─────────────────────────
-- Supabase advisor 0011_function_search_path_mutable. Set explicit
-- search_path so a future schema/role change can't shadow built-ins.
ALTER FUNCTION public.validate_quiz_score() SET search_path = public;


-- ── 6. HIGH: tighten anonymous_sessions to RPC-only access ──────────────────
-- The frontend no longer calls log_anon_session for guests
-- (auth.js:1138 confirms). The "Anyone can insert/update" policies are
-- residue from an earlier visitor-tracking design and currently let any
-- attacker spam the table from anywhere.
DROP POLICY IF EXISTS "Anyone can insert anonymous session" ON public.anonymous_sessions;
DROP POLICY IF EXISTS "Anyone can update anonymous session" ON public.anonymous_sessions;
CREATE POLICY "no_direct_access" ON public.anonymous_sessions USING (false);


-- ── 7. CRITICAL: notify_new_visitor trigger now sends shared secret ─────────
-- The Supabase trigger today calls the notify-new-visitor edge function with
-- ZERO authentication — meaning anyone with the public function URL can POST
-- a fake `record` payload and trigger an email to the support inbox via
-- Resend (bill-risk + spam vector). After this migration the trigger sends
-- Authorization: Bearer <secret>; the matching change in
-- supabase/functions/notify-new-visitor/index.ts is documented as a
-- follow-up in /SECURITY_AUDIT.md and MUST be deployed at the same time
-- this migration is applied — otherwise the email will silently stop.
--
-- Secret storage: Supabase Vault.
-- Hosted Supabase doesn't allow `ALTER DATABASE ... SET` for custom GUC
-- parameters, so we read from vault.decrypted_secrets instead. Create the
-- secret BEFORE applying this section:
--   SELECT vault.create_secret('<long-random>', 'notify_new_visitor_secret',
--          'Auth secret for notify-new-visitor edge function trigger');
-- Then set the same value as env var NOTIFY_NEW_VISITOR_SECRET on the edge
-- function (Supabase dashboard → Edge Functions → notify-new-visitor → Secrets).
CREATE OR REPLACE FUNCTION public.notify_new_visitor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'notify_new_visitor_secret'
  LIMIT 1;

  IF v_secret IS NULL OR v_secret = '' THEN
    RAISE WARNING 'notify_new_visitor: vault secret notify_new_visitor_secret not found — skipping email';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := 'https://omjegwtzirskgmgeojdn.supabase.co/functions/v1/notify-new-visitor',
    body    := json_build_object('record', row_to_json(NEW))::jsonb,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || v_secret
               )
  );
  RETURN NEW;
END;
$$;


-- ════════════════════════════════════════════════════════════════════════════
--  Items intentionally NOT in this migration — see /SECURITY_AUDIT.md
--  · submit_lead RPC + leads_insert lockdown (needs coordinated frontend
--    update of auth.js:_submitSoftGate, otherwise sign-up is blocked)
--  · log_anon_session per-IP rate limiting (low priority; the table is
--    now SECURITY-DEFINER-only via §6 above and the frontend no longer
--    writes to it)
--  · HaveIBeenPwned leaked-password protection (manual Supabase Auth setting)
--  · CSP 'unsafe-inline' tightening (requires onclick-handler refactor)
-- ════════════════════════════════════════════════════════════════════════════
