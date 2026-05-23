-- supabase/migrations/20260607_app_events_anon_cap.sql
--
-- Two changes to the analytics ingest plumbing, both cost-control:
--
-- 1. Anonymous app_events rate cap.
--    The current trigger (20260502_app_events.sql:64-91) short-circuits
--    when NEW.parent_id IS NULL — anonymous events (app_opened,
--    website_viewed, waitlist_*, signup_gate_*) have no DB-side cap and
--    rely entirely on the in-memory IP throttle inside
--    netlify/functions/analytics-ingest.js (30/min/IP). That counter
--    resets on Netlify cold start and is per-instance, so a hostile
--    actor coordinating across IPs / waves can inflate the table.
--
--    This migration replaces _check_analytics_hourly_cap with a version
--    that adds two anon branches:
--      * 200 events / hour / anon_visitor_id (the client-stamped UUID
--        in metadata_json->>'anon_visitor_id').
--      * 10000 events / hour global anon backstop for events that lack
--        anon_visitor_id (rare — app_opened before client init, etc).
--
-- 2. Weekly cleanup schedule.
--    public.cleanup_old_analytics_events() was defined in
--    20260502_app_events.sql:98-107 but never actually scheduled. A
--    direct cron.job inspection on prod (2026-05-21 via Supabase MCP)
--    confirms the only scheduled job is daily-push-reminder. Without
--    cleanup, app_events grows forever — at the rate of ~50-500
--    rows/parent/day this is tens of GB/year.
--
--    This migration schedules the cleanup at 03:00 UTC every Sunday.
--    pg_cron is verified installed on the production project; if it is
--    missing on a fresh staging environment the schedule call inside a
--    DO block will RAISE NOTICE rather than abort the whole migration.

-- ── 1. Replace the analytics-hourly-cap trigger function ───────────────────
CREATE OR REPLACE FUNCTION public._check_analytics_hourly_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count  INTEGER;
  v_visid  TEXT;
BEGIN
  -- Authenticated branch: existing 500/hr/parent cap.
  IF NEW.parent_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count
    FROM public.app_events
    WHERE parent_id = NEW.parent_id
      AND created_at >= now() - INTERVAL '1 hour';
    IF v_count >= 500 THEN
      RAISE EXCEPTION 'analytics_hourly_cap_exceeded'
        USING HINT = 'Parent has exceeded 500 analytics events per hour';
    END IF;
    RETURN NEW;
  END IF;

  -- Anonymous branch: per-visitor cap of 200/hr.
  v_visid := NEW.metadata_json->>'anon_visitor_id';
  IF v_visid IS NOT NULL AND v_visid <> '' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.app_events
    WHERE parent_id IS NULL
      AND (metadata_json->>'anon_visitor_id') = v_visid
      AND created_at >= now() - INTERVAL '1 hour';
    IF v_count >= 200 THEN
      RAISE EXCEPTION 'analytics_hourly_cap_exceeded'
        USING HINT = 'Anonymous visitor has exceeded 200 events per hour';
    END IF;
    RETURN NEW;
  END IF;

  -- Anonymous backstop: events without anon_visitor_id (e.g. pre-init
  -- app_opened). 10k/hr global ceiling — a generous bound that still
  -- caps a coordinated flood at ~$0.10/hr Supabase storage equivalent.
  SELECT COUNT(*) INTO v_count
  FROM public.app_events
  WHERE parent_id IS NULL
    AND (metadata_json->>'anon_visitor_id') IS NULL
    AND created_at >= now() - INTERVAL '1 hour';
  IF v_count >= 10000 THEN
    RAISE EXCEPTION 'analytics_hourly_cap_exceeded'
      USING HINT = 'Global anonymous backstop (10k/hr) reached';
  END IF;

  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public._check_analytics_hourly_cap() IS
  'BEFORE INSERT trigger function on public.app_events. '
  '500/hr/parent for authenticated events; 200/hr/anon_visitor_id for '
  'anonymous events with a stamped visitor id; 10k/hr global backstop '
  'for anonymous events lacking visitor id. Updated 20260607.';

-- The trigger (trg_analytics_hourly_cap) still binds to this function.

-- ── 2. Supporting index for the per-visitor lookup ─────────────────────────
-- Partial index keyed on (anon_visitor_id, created_at) for parent_id IS NULL
-- rows. Makes the new anon branches O(log n + matches) instead of seq scan.
CREATE INDEX IF NOT EXISTS idx_app_events_anon_visitor_recent
  ON public.app_events ((metadata_json->>'anon_visitor_id'), created_at DESC)
  WHERE parent_id IS NULL;

-- ── 3. Schedule weekly analytics cleanup ───────────────────────────────────
-- Idempotent: unschedule any existing job of the same name, then schedule.
-- Wrapped in DO so missing pg_cron on a fresh env logs a notice rather
-- than aborting the migration.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Detach any prior schedule with the same name (no-op if absent).
    BEGIN
      PERFORM cron.unschedule('analytics-cleanup-weekly');
    EXCEPTION WHEN OTHERS THEN
      -- pg_cron.unschedule raises 'cron job ... does not exist' which we
      -- can ignore safely.
      NULL;
    END;
    PERFORM cron.schedule(
      'analytics-cleanup-weekly',
      '0 3 * * 0',                                   -- Sunday 03:00 UTC
      $job$SELECT public.cleanup_old_analytics_events();$job$
    );
    RAISE NOTICE 'Scheduled analytics-cleanup-weekly at 03:00 UTC every Sunday';
  ELSE
    RAISE NOTICE 'pg_cron extension is not installed; analytics cleanup must be scheduled externally (Netlify scheduled function, GitHub Actions cron, etc.).';
  END IF;
END $$;

-- ── Manual verification queries (post-apply) ───────────────────────────────
-- Per-visitor cap (run as service_role):
--   INSERT INTO app_events (client_event_id, event_name, parent_id, metadata_json)
--   SELECT 'x' || g, 'website_viewed', NULL,
--          jsonb_build_object('anon_visitor_id','test-vis')
--   FROM generate_series(1, 201) g;
-- -> 201st insert raises 'analytics_hourly_cap_exceeded'.
--
-- Cron job listed:
--   SELECT jobname, schedule, command FROM cron.job WHERE jobname='analytics-cleanup-weekly';
