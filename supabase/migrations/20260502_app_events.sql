-- supabase/migrations/20260502_app_events.sql
-- PRODUCT ANALYTICS: app_events table
--
-- Trust model:
--   - No direct client INSERT. All writes via analytics-ingest Netlify Function
--     using SUPABASE_SERVICE_ROLE_KEY. Service role bypasses RLS on write.
--   - parent_id/student_id never come from the client payload; always server-stamped
--     after JWT or PIN session verification.
--   - parent_id nullable: app_opened fires before auth resolves.
--   - student_id nullable: parent-only events (report_generated, parent_dashboard_opened).
--   - metadata_json capped at 500 chars (DB CHECK + application-level check).
--   - client_event_id dedup: sendBeacon can fire twice on iOS Safari unload.
--   - hourly_parent_cap trigger: limits each parent to 500 events/hour to cap bill risk.
--   - 90-day TTL via cleanup_old_analytics_events() — schedule weekly via pg_cron.

CREATE TABLE IF NOT EXISTS public.app_events (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_event_id  TEXT        NOT NULL,
  event_name       TEXT        NOT NULL,
  parent_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id       UUID        REFERENCES public.student_profiles(id) ON DELETE SET NULL,
  grade            TEXT,
  unit_id          TEXT,
  lesson_id        TEXT,
  metadata_json    JSONB       NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT app_events_event_name_whitelist CHECK (event_name IN (
    'app_opened','session_started','session_ended','grade_selected',
    'unit_started','lesson_started','lesson_completed','quiz_started',
    'quiz_completed','unit_test_started','unit_test_completed',
    'intervention_shown','intervention_completed','report_generated',
    'parent_dashboard_opened','subscription_started'
  )),
  CONSTRAINT app_events_metadata_size CHECK (
    octet_length(metadata_json::text) <= 500
  ),
  CONSTRAINT app_events_client_event_id_unique UNIQUE (client_event_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- Parents may SELECT only their own events. No INSERT policy for any role:
-- all inserts go through the analytics-ingest Netlify Function (service role,
-- bypasses RLS). No client JWT can write a row directly.
CREATE POLICY "parent_reads_own_events"
  ON public.app_events FOR SELECT
  USING (parent_id = auth.uid());

-- ── Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_app_events_created_at   ON public.app_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_event_name   ON public.app_events (event_name);
CREATE INDEX IF NOT EXISTS idx_app_events_name_created ON public.app_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_parent_id    ON public.app_events (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_events_student_id   ON public.app_events (student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_events_grade        ON public.app_events (grade) WHERE grade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_events_unit_id      ON public.app_events (unit_id) WHERE unit_id IS NOT NULL;

-- ── Hourly per-parent cap (durable rate limiting) ─────────────────────────
-- Prevents a single parent account from generating > 500 events/hour,
-- protecting against runaway client loops or bill abuse. Fires BEFORE INSERT.
-- Skips check when parent_id IS NULL (anonymous events like app_opened).
CREATE OR REPLACE FUNCTION public._check_analytics_hourly_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT COUNT(*) INTO v_count
  FROM public.app_events
  WHERE parent_id = NEW.parent_id
    AND created_at >= now() - INTERVAL '1 hour';
  IF v_count >= 500 THEN
    RAISE EXCEPTION 'analytics_hourly_cap_exceeded'
      USING HINT = 'Parent has exceeded 500 analytics events per hour';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public._check_analytics_hourly_cap() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_analytics_hourly_cap
  BEFORE INSERT ON public.app_events
  FOR EACH ROW EXECUTE FUNCTION public._check_analytics_hourly_cap();

-- ── 90-day cleanup function ────────────────────────────────────────────────
-- Schedule after enabling pg_cron:
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   SELECT cron.schedule('analytics-cleanup', '0 3 * * 0',
--     'SELECT cleanup_old_analytics_events()');
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_events()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM public.app_events WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics_events() FROM PUBLIC, anon, authenticated;
