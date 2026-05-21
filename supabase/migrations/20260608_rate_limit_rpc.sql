-- supabase/migrations/20260608_rate_limit_rpc.sql
--
-- Baseline migration: track the public.api_rate_limits table and
-- public.check_and_increment_rate_limit(text, int, bigint) RPC that
-- predate the repo migration history (created during initial Supabase
-- bootstrap or via dashboard).
--
-- WHY THIS MATTERS:
--   netlify/functions/gemini-hint.js, netlify/functions/gemini-report.js,
--   netlify/functions/waitlist-join.js (this branch), and the
--   get_profiles_by_family_code RPC (20260602) all call this RPC. If a
--   fresh staging environment is built from the current repo, the RPC
--   is missing — calls fall through to in-memory fallback (gemini-hint)
--   or fail with "function does not exist" (waitlist-join, family-code
--   lockdown). Both states are unsafe.
--
-- VERIFIED PROD STATE (Supabase MCP on omjegwtzirskgmgeojdn, 2026-05-21):
--   api_rate_limits (key TEXT PK, count INT NOT NULL DEFAULT 0,
--                    window_end TIMESTAMPTZ NOT NULL) — RLS enabled.
--   check_and_increment_rate_limit(p_key text, p_max integer,
--     p_window_ms bigint) RETURNS boolean, SECURITY DEFINER.
--   Behavior: returns TRUE when count > p_max (i.e. caller is OVER the
--   limit). UPSERT pattern: if the existing window has expired, reset
--   count to 1 and start a new window; otherwise increment count and
--   keep window_end fixed.
--
-- This migration is non-destructive: CREATE TABLE IF NOT EXISTS +
-- CREATE OR REPLACE FUNCTION reproduce the exact production shape.
-- Re-applying on prod is a no-op.

-- ── 1. api_rate_limits ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key        TEXT PRIMARY KEY,
  count      INTEGER     NOT NULL DEFAULT 0,
  window_end TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies → no client access. Mutations only via the RPC below.

REVOKE ALL ON TABLE public.api_rate_limits FROM PUBLIC, anon, authenticated;
GRANT  ALL ON TABLE public.api_rate_limits TO service_role;

COMMENT ON TABLE public.api_rate_limits IS
  'Sliding-window rate-limit counters keyed by an opaque caller-supplied '
  'string (e.g. ''gemini:<ip>'', ''family_code:<code>'', ''waitlist:<ip>''). '
  'Mutated only via public.check_and_increment_rate_limit.';

-- ── 2. check_and_increment_rate_limit ─────────────────────────────────────
-- Returns TRUE when the caller is OVER the limit (count > p_max). Body
-- mirrors production exactly so a fresh DB matches what the existing
-- callers (gemini-hint, gemini-report, get_profiles_by_family_code,
-- waitlist-join) expect.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key       TEXT,
  p_max       INTEGER,
  p_window_ms BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now        BIGINT := (extract(epoch from now()) * 1000)::bigint;
  v_window_end BIGINT := v_now + p_window_ms;
  v_count      INTEGER;
BEGIN
  -- Upsert: insert new row or increment within existing window.
  INSERT INTO api_rate_limits (key, count, window_end)
  VALUES (p_key, 1, to_timestamp(v_window_end / 1000.0))
  ON CONFLICT (key) DO UPDATE
    SET
      count      = CASE
                     WHEN api_rate_limits.window_end < to_timestamp(v_now / 1000.0)
                     THEN 1                                  -- window expired, reset
                     ELSE api_rate_limits.count + 1          -- still in window, increment
                   END,
      window_end = CASE
                     WHEN api_rate_limits.window_end < to_timestamp(v_now / 1000.0)
                     THEN to_timestamp(v_window_end / 1000.0)  -- start new window
                     ELSE api_rate_limits.window_end           -- keep existing window
                   END
  RETURNING count INTO v_count;

  RETURN v_count > p_max;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, BIGINT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, BIGINT) TO service_role;

COMMENT ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, BIGINT) IS
  'Sliding-window rate-limit counter. Returns TRUE when the caller is '
  'OVER the limit (count > p_max). Mirrors production body verified '
  '2026-05-21. Service-role only.';

-- ── Manual verification queries (post-apply, against prod or staging) ──────
-- Function existence:
--   SELECT proname, prosrc FROM pg_proc
--   JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
--   WHERE n.nspname='public' AND proname='check_and_increment_rate_limit';
-- Functional smoke:
--   SELECT check_and_increment_rate_limit('audit-smoke', 3, 60000); -- false
--   SELECT check_and_increment_rate_limit('audit-smoke', 3, 60000); -- false
--   SELECT check_and_increment_rate_limit('audit-smoke', 3, 60000); -- false
--   SELECT check_and_increment_rate_limit('audit-smoke', 3, 60000); -- true (4 > 3)
-- Cleanup smoke row:
--   DELETE FROM api_rate_limits WHERE key='audit-smoke';
