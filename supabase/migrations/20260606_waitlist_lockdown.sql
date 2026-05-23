-- supabase/migrations/20260606_waitlist_lockdown.sql
--
-- Move the waitlist write path behind a server-side Netlify function and
-- remove its anonymous-callable RPC entry point.
--
-- Today, src/auth.js:1497-1535 calls supabase.rpc('join_waitlist', ...)
-- directly with the anon key. The RPC (20260525_launch_gate.sql:111-140)
-- is GRANTed to anon AND authenticated and has no rate-limit, no
-- CAPTCHA, and a distinguishable already_on_list return that enables
-- user enumeration.
--
-- This migration:
--   1. Adds a metadata_json size CHECK to waitlist_entries (the original
--      table created in 20260525_launch_gate.sql:40-49 had no size cap).
--   2. Creates public.join_waitlist_internal(text, text) — same body as
--      join_waitlist but returns VOID and is service-role only. The
--      Netlify function (netlify/functions/waitlist-join.js, this same
--      commit) is the only intended caller.
--   3. REVOKEs EXECUTE on the legacy public.join_waitlist(TEXT, TEXT)
--      from anon and authenticated. The function remains defined for
--      compatibility but cannot be invoked from the browser.

-- ── 1. metadata_json size cap ──────────────────────────────────────────────
-- 500 bytes mirrors app_events_metadata_size (20260502_app_events.sql:35-37).
-- Defensive guard against future code paths or admin tooling adding bloat.
-- IF NOT EXISTS so re-applying the migration is safe.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.waitlist_entries'::regclass
      AND conname  = 'waitlist_entries_metadata_size'
  ) THEN
    ALTER TABLE public.waitlist_entries
      ADD CONSTRAINT waitlist_entries_metadata_size
      CHECK (octet_length(metadata_json::text) <= 500);
  END IF;
END $$;

-- ── 2. Service-role-only insert RPC ────────────────────────────────────────
-- Same normalization (trim+lower), same email regex, same dedupe on
-- email_lower UNIQUE. Returns VOID — the Netlify function presents a
-- non-distinguishing 200 {ok:true} regardless of new vs existing email.
CREATE OR REPLACE FUNCTION public.join_waitlist_internal(p_email TEXT, p_source TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lower TEXT;
BEGIN
  IF p_email IS NULL THEN RETURN; END IF;
  v_lower := lower(trim(p_email));
  IF v_lower !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(v_lower) > 254 THEN
    RETURN;  -- silent: function returns void
  END IF;

  -- Idempotent insert: on conflict, do nothing. Caller cannot distinguish
  -- new vs duplicate (Netlify function returns same 200 either way).
  INSERT INTO waitlist_entries (email, email_lower, source)
    VALUES (trim(p_email), v_lower, COALESCE(p_source, 'login_screen'))
  ON CONFLICT (email_lower) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_waitlist_internal(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.join_waitlist_internal(TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION public.join_waitlist_internal(TEXT, TEXT) IS
  'Service-role-only waitlist insert. Invoked exclusively by '
  'netlify/functions/waitlist-join.js after Turnstile + rate-limit '
  'checks. Returns void so the caller cannot distinguish a new email '
  'from an already-listed one (non-enumerating).';

-- ── 3. Drop anon/authenticated EXECUTE on the legacy RPC ───────────────────
-- The legacy join_waitlist(TEXT, TEXT) function from 20260525_launch_gate.sql
-- remains defined (we don't DROP it to avoid breaking any dashboard SQL or
-- internal scripts that hand-call it) but anon and authenticated can no
-- longer invoke it. The Netlify function uses the new internal RPC.
REVOKE EXECUTE ON FUNCTION public.join_waitlist(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ── Manual verification queries (post-apply) ───────────────────────────────
-- As anon:
--   POST /rest/v1/rpc/join_waitlist {"p_email":"a@b.c","p_source":"x"}
--                                                  → 401 permission_denied
--   POST /rest/v1/rpc/join_waitlist_internal {...} → 401 permission_denied
-- Via /.netlify/functions/waitlist-join (Turnstile token required):
--   400 invalid_email / 403 turnstile_failed / 429 rate_limited /
--   200 {ok:true} for both new and existing emails.
-- Service role:
--   SELECT public.join_waitlist_internal('test@example.com', 'audit'); -- void
--   SELECT email, email_lower FROM public.waitlist_entries
--     ORDER BY created_at DESC LIMIT 1;                                -- inserted
--   SELECT public.join_waitlist_internal('test@example.com', 'audit'); -- void; ON CONFLICT
