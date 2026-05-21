-- supabase/migrations/20260521_app_events_phase_b_events.sql
-- Analytics Phase B — extend app_events.event_name CHECK whitelist with 10 new events.
-- KEEP IN SYNC with:
--   src/analytics.js                            _ANA_VALID_EVENTS
--   netlify/functions/analytics-ingest.js       ALLOWED_EVENT_NAMES
--
-- Must be applied BEFORE deploying client code that emits any of these names,
-- otherwise inserts will fail with constraint-violation and the events will be
-- silently dropped (fail-silent ingest contract).

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
    'parent_dash_section_viewed'
  ));
