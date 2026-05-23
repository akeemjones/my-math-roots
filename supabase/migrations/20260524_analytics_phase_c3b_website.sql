-- supabase/migrations/20260524_analytics_phase_c3b_website.sql
-- Analytics Phase C.3B — unique site visits
--
-- Changes:
--   1. Extends app_events.event_name CHECK constraint to include website_viewed.
--   2. Creates analytics_unique_site_visits RPC — counts distinct anonymous
--      visitor IDs per day from website_viewed events.
--
-- KEEP IN SYNC with:
--   src/analytics.js                        _ANA_VALID_EVENTS
--   netlify/functions/analytics-ingest.js   ALLOWED_EVENT_NAMES
--
-- Must be applied BEFORE deploying client code (otherwise website_viewed
-- inserts will fail the CHECK constraint and be silently dropped).

-- ── 1. Extend CHECK constraint ───────────────────────────────────────────────
ALTER TABLE public.app_events
  DROP CONSTRAINT IF EXISTS app_events_event_name_whitelist,
  ADD CONSTRAINT app_events_event_name_whitelist CHECK (event_name IN (
    -- Phase A
    'app_opened','session_started','session_ended','grade_selected',
    'unit_started','lesson_started','lesson_completed','quiz_started',
    'quiz_completed','unit_test_started','unit_test_completed',
    'intervention_shown','intervention_completed','report_generated',
    'parent_dashboard_opened','subscription_started',
    -- Phase B
    'student_app_opened',
    'unit_viewed',
    'lesson_viewed',
    'score_history_opened',
    'hint_used',
    'student_reset',
    'free_mode_changed',
    'manual_unlock_changed',
    'quiz_abandoned',
    'parent_dash_section_viewed',
    -- Phase C.3B
    'website_viewed'
  ));

-- ── 2. analytics_unique_site_visits RPC ─────────────────────────────────────
-- Returns daily unique anonymous visitor counts for website_viewed events.
-- anon_visitor_id is stored in metadata_json under the key 'anon_visitor_id'.
-- When p_from / p_to are supplied the custom range is used; otherwise the
-- preset p_days window applies (same COALESCE pattern as other analytics RPCs).
--
-- SECURITY DEFINER — EXECUTE revoked from PUBLIC / anon / authenticated.
-- Callable only by the service-role key inside the admin Netlify function.
CREATE OR REPLACE FUNCTION public.analytics_unique_site_visits(
  p_days  INTEGER     DEFAULT 30,
  p_grade TEXT        DEFAULT NULL,
  p_from  TIMESTAMPTZ DEFAULT NULL,
  p_to    TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(day date, unique_visitors bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    DATE_TRUNC('day', created_at)::date                     AS day,
    COUNT(DISTINCT metadata_json->>'anon_visitor_id')        AS unique_visitors
  FROM app_events
  WHERE event_name = 'website_viewed'
    AND metadata_json->>'anon_visitor_id' IS NOT NULL
    AND created_at >= COALESCE(p_from, NOW() - (COALESCE(p_days, 30) || ' days')::interval)
    AND (p_to IS NULL OR created_at <= p_to)
  GROUP BY 1
  ORDER BY 1;
$$;

-- Revoke broad access; the Netlify function uses the service-role key.
REVOKE EXECUTE ON FUNCTION public.analytics_unique_site_visits(INTEGER, TEXT, TIMESTAMPTZ, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
