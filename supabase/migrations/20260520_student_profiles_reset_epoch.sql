-- ══════════════════════════════════════════════════════════════
--  Migration: reset_epoch on student_profiles
--
--  Adds a per-student reset revision so every device can detect
--  "the student was reset on another device after my local cache
--  was saved" and clear stale local progress. Also guards the
--  push pipeline from re-uploading scores that pre-date the
--  latest reset.
--
--  Updates four RPCs:
--    - reset_student_data         → bumps reset_epoch + returns it
--    - get_student_progress_by_pin → returns reset_epoch
--    - pull_student_progress      → returns reset_epoch
--    - push_student_progress      → new optional p_reset_epoch
--                                    param + stale-cache rejection
--
--  Rollout: the new column defaults to 0, the new RPC param has a
--  default value, and the stale-push check only fires when the
--  client passes a non-zero epoch. So old clients continue to push
--  successfully — they're upgraded transparently as soon as their
--  cache rolls over to the new build.
-- ══════════════════════════════════════════════════════════════

-- ── 1. Schema ───────────────────────────────────────────────────
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS reset_epoch BIGINT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.student_profiles.reset_epoch IS
  'Milliseconds-since-epoch of the most recent reset_student_data call. '
  'Clients store the last-seen value as mmr_reset_epoch_<sid> in '
  'localStorage; on next pull/sync, if server.reset_epoch > local, the '
  'client clears its grade-scoped progress caches and refuses to push '
  'pre-reset scores back.';


-- ── 2. reset_student_data — bump reset_epoch and return it ──────
-- Return type changes void → bigint, so DROP then CREATE (CREATE OR
-- REPLACE cannot change return type).
DROP FUNCTION IF EXISTS public.reset_student_data(uuid);

CREATE FUNCTION public.reset_student_data(p_student_id uuid)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_new_epoch BIGINT;
BEGIN
  -- Verify parent owns this student
  IF NOT EXISTS (
    SELECT 1 FROM student_profiles
    WHERE id = p_student_id AND parent_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  -- Delete from related tables
  DELETE FROM quiz_scores  WHERE student_id = p_student_id;
  DELETE FROM user_mastery WHERE student_id = p_student_id;

  v_new_epoch := FLOOR(EXTRACT(EPOCH FROM now()) * 1000)::BIGINT;

  -- Reset all progress columns on student_profiles + bump epoch
  UPDATE student_profiles
  SET
    mastery_json     = '{}'::jsonb,
    streak_current   = 0,
    streak_longest   = 0,
    streak_last_date = '',
    apptime_json     = '{"totalSecs":0,"sessions":0,"dailySecs":{}}'::jsonb,
    done_json        = '{}'::jsonb,
    act_dates_json   = '[]'::jsonb,
    settings_json    = '{}'::jsonb,
    onboarding_json  = NULL,
    pin_attempts     = 0,
    pin_locked_until = NULL,
    reset_epoch      = v_new_epoch
  WHERE id = p_student_id;

  RETURN v_new_epoch;
END;
$function$;

-- DROP removed prior grants; re-apply (matches the original ACL pattern
-- of the other RPCs in this file: anon + authenticated + service_role).
GRANT EXECUTE ON FUNCTION public.reset_student_data(uuid) TO anon, authenticated, service_role;


-- ── 3. get_student_progress_by_pin — return reset_epoch ─────────
CREATE OR REPLACE FUNCTION public.get_student_progress_by_pin(p_student_id uuid, p_session_token uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent_id    uuid;
  v_reset_epoch  BIGINT;
  v_scores       json;
  v_progress     json;
BEGIN
  SELECT parent_id, reset_epoch INTO v_parent_id, v_reset_epoch
  FROM student_profiles
  WHERE id = p_student_id;

  IF v_parent_id IS NULL THEN
    RETURN json_build_object(
      'scores',       '[]'::json,
      'progress',     '{}'::json,
      'reset_epoch',  0
    );
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
    'scores',      COALESCE(v_scores,   '[]'::json),
    'progress',    COALESCE(v_progress, '{}'::json),
    'reset_epoch', COALESCE(v_reset_epoch, 0)
  );
END;
$function$;


-- ── 4. pull_student_progress — include reset_epoch on profile ───
CREATE OR REPLACE FUNCTION public.pull_student_progress(p_student_id uuid, p_session_token uuid, p_grade text DEFAULT '2'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_profile JSONB;
  v_scores  JSONB;
BEGIN
  PERFORM _validate_pin_session(p_student_id, p_session_token);

  SELECT jsonb_build_object(
    'mastery_json',    mastery_json,
    'activity_json',   activity_json,
    'streak_current',  streak_current,
    'streak_longest',  streak_longest,
    'streak_last_date',streak_last_date,
    'apptime_json',    apptime_json,
    'done_json',       done_json,
    'act_dates_json',  act_dates_json,
    'settings_json',   settings_json,
    'a11y_json',       a11y_json,
    'unlock_settings', unlock_settings,
    'onboarding_json', COALESCE(onboarding_json, '{}'::jsonb),
    'reset_epoch',     reset_epoch
  ) INTO v_profile
  FROM student_profiles WHERE id = p_student_id;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('error', 'student_not_found');
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb ORDER BY s.created_at DESC), '[]'::jsonb)
  INTO v_scores
  FROM (
    SELECT local_id, qid, label, type, score, total, pct, stars,
           unit_idx, color, student_name, time_taken, answers,
           date_str, time_str, quit, abandoned, student_id, created_at
    FROM quiz_scores
    WHERE student_id = p_student_id
    ORDER BY created_at DESC
    LIMIT 200
  ) s;

  RETURN jsonb_build_object(
    'profile', v_profile,
    'scores',  v_scores
  );
END;
$function$;


-- ── 5. push_student_progress — guard against stale local pushes ─
-- Adds the p_reset_epoch parameter (default 0 = legacy client).
-- Reject pushes where p_reset_epoch > 0 AND server's reset_epoch is
-- newer. The error payload tells the client to clear local caches
-- and stop retrying with the same data.
--
-- Adding a parameter creates a new function signature, so DROP the
-- existing 14-arg overload first to avoid leaving a stale function
-- behind that supabase-js could still match against.
DROP FUNCTION IF EXISTS public.push_student_progress(
  uuid, uuid, jsonb, integer, integer, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb
);

CREATE OR REPLACE FUNCTION public.push_student_progress(
  p_student_id      uuid,
  p_session_token   uuid,
  p_mastery_json    jsonb,
  p_streak_current  integer,
  p_streak_longest  integer,
  p_streak_last_date text,
  p_apptime_json    jsonb,
  p_done_json       jsonb,
  p_act_dates_json  jsonb,
  p_settings_json   jsonb,
  p_a11y_json       jsonb,
  p_scores          jsonb DEFAULT '[]'::jsonb,
  p_grade           text  DEFAULT '2'::text,
  p_activity_json   jsonb DEFAULT '{"v": 1, "events": []}'::jsonb,
  p_reset_epoch     bigint DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_stored          RECORD;
  v_key             TEXT;
  v_val             JSONB;
  v_entry           JSONB;
  v_stored_mastery  JSONB;
  v_pct_calc        INTEGER;
  v_server_epoch    BIGINT;
BEGIN
  PERFORM _validate_pin_session(p_student_id, p_session_token);

  -- ── Stale-cache guard ─────────────────────────────────────────
  -- The client passes its last-known reset_epoch. If the server has
  -- since bumped (i.e. reset_student_data ran on another device),
  -- the client's payload is stale and must be discarded. The error
  -- payload returns the new epoch so the client can sync up.
  SELECT reset_epoch INTO v_server_epoch
  FROM student_profiles WHERE id = p_student_id;

  IF p_reset_epoch > 0 AND v_server_epoch IS NOT NULL AND v_server_epoch > p_reset_epoch THEN
    RETURN jsonb_build_object(
      'error',              'stale_reset_epoch',
      'server_reset_epoch', v_server_epoch,
      'details',            'Local cache predates the most recent reset_student_data. Clear local progress and re-pull before retrying.'
    );
  END IF;

  IF p_streak_current < 0 OR p_streak_current > 365 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_current out of range 0-365');
  END IF;
  IF p_streak_longest < 0 OR p_streak_longest > 365 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_longest out of range 0-365');
  END IF;
  IF p_streak_longest < p_streak_current THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_longest must be >= streak_current');
  END IF;

  IF p_streak_last_date IS NOT NULL AND p_streak_last_date <> '' THEN
    BEGIN
      IF p_streak_last_date::date > (current_date + interval '1 day')::date THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_last_date is in the future');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('error', 'validation_failed', 'details', 'streak_last_date is not a valid date');
    END;
  END IF;

  IF jsonb_typeof(p_mastery_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'mastery_json must be an object');
  END IF;
  FOR v_key, v_val IN SELECT * FROM jsonb_each(p_mastery_json) LOOP
    IF (v_val->>'attempts')::int < 0 OR (v_val->>'correct')::int < 0 THEN
      RETURN jsonb_build_object('error', 'validation_failed', 'details', 'mastery entry has negative values for key ' || v_key);
    END IF;
  END LOOP;

  IF jsonb_typeof(p_apptime_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime_json must be an object');
  END IF;
  IF (p_apptime_json->>'totalSecs')::int < 0 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime totalSecs must be >= 0');
  END IF;
  IF (p_apptime_json->>'sessions')::int < 0 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime sessions must be >= 0');
  END IF;

  IF jsonb_typeof(p_done_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'done_json must be an object');
  END IF;

  IF jsonb_typeof(p_act_dates_json) <> 'array' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'act_dates_json must be an array');
  END IF;
  IF jsonb_array_length(p_act_dates_json) > 365 THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'act_dates_json exceeds 365 entries');
  END IF;

  IF p_activity_json IS NOT NULL AND jsonb_typeof(p_activity_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'activity_json must be an object');
  END IF;

  SELECT mastery_json, apptime_json, done_json, act_dates_json
  INTO v_stored
  FROM student_profiles WHERE id = p_student_id;

  IF v_stored IS NOT NULL THEN
    v_stored_mastery := v_stored.mastery_json;
    IF v_stored_mastery IS NOT NULL AND jsonb_typeof(v_stored_mastery) = 'object' THEN
      FOR v_key, v_val IN SELECT * FROM jsonb_each(v_stored_mastery) LOOP
        IF p_mastery_json ? v_key THEN
          IF (p_mastery_json->v_key->>'attempts')::int < (v_val->>'attempts')::int THEN
            RETURN jsonb_build_object('error', 'validation_failed', 'details',
              'mastery attempts decreased for key ' || v_key);
          END IF;
        END IF;
      END LOOP;
    END IF;

    IF v_stored.apptime_json IS NOT NULL AND jsonb_typeof(v_stored.apptime_json) = 'object' THEN
      IF (p_apptime_json->>'totalSecs')::int < (v_stored.apptime_json->>'totalSecs')::int THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime totalSecs decreased');
      END IF;
      IF (p_apptime_json->>'sessions')::int < (v_stored.apptime_json->>'sessions')::int THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'apptime sessions decreased');
      END IF;
    END IF;

    IF v_stored.done_json IS NOT NULL AND jsonb_typeof(v_stored.done_json) = 'object' THEN
      FOR v_key, v_val IN SELECT * FROM jsonb_each(v_stored.done_json) LOOP
        IF v_val = 'true'::jsonb AND p_done_json ? v_key THEN
          IF (p_done_json->v_key) <> 'true'::jsonb THEN
            RETURN jsonb_build_object('error', 'validation_failed', 'details',
              'done flag flipped back to false for key ' || v_key);
          END IF;
        END IF;
      END LOOP;
    END IF;

    IF v_stored.act_dates_json IS NOT NULL AND jsonb_typeof(v_stored.act_dates_json) = 'array' THEN
      IF jsonb_array_length(p_act_dates_json) < jsonb_array_length(v_stored.act_dates_json) THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'act_dates_json array shrank');
      END IF;
    END IF;
  END IF;

  IF p_scores IS NOT NULL AND jsonb_typeof(p_scores) = 'array' AND jsonb_array_length(p_scores) > 0 THEN
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_scores) LOOP
      IF (v_entry->>'score')::int < 0 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'score < 0');
      END IF;
      IF (v_entry->>'total')::int < 1 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'total < 1');
      END IF;
      IF (v_entry->>'score')::int > (v_entry->>'total')::int THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'score > total');
      END IF;
      IF (v_entry->>'pct')::int < 0 OR (v_entry->>'pct')::int > 100 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'pct out of range 0-100');
      END IF;
      v_pct_calc := round((v_entry->>'score')::numeric / (v_entry->>'total')::numeric * 100);
      IF abs((v_entry->>'pct')::int - v_pct_calc) > 1 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'pct does not match score/total');
      END IF;
      IF (v_entry->>'unit_idx')::int < 0 OR (v_entry->>'unit_idx')::int > 9 THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'unit_idx out of range 0-9');
      END IF;
      IF (v_entry->>'type') NOT IN ('lesson', 'unit', 'final', 'review') THEN
        RETURN jsonb_build_object('error', 'validation_failed', 'details', 'invalid score type');
      END IF;
    END LOOP;
  END IF;

  UPDATE student_profiles SET
    mastery_json      = p_mastery_json,
    activity_json     = p_activity_json,
    streak_current    = p_streak_current,
    streak_longest    = p_streak_longest,
    streak_last_date  = p_streak_last_date,
    apptime_json      = p_apptime_json,
    done_json         = p_done_json,
    act_dates_json    = p_act_dates_json,
    settings_json     = p_settings_json,
    a11y_json         = p_a11y_json,
    updated_at        = now()
  WHERE id = p_student_id;

  IF p_scores IS NOT NULL AND jsonb_typeof(p_scores) = 'array' AND jsonb_array_length(p_scores) > 0 THEN
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_scores) LOOP
      IF NOT EXISTS (
        SELECT 1 FROM quiz_scores
        WHERE student_id = p_student_id AND local_id = (v_entry->>'local_id')::bigint
      ) THEN
        INSERT INTO quiz_scores (
          user_id, student_id, local_id, qid, label, type,
          score, total, pct, stars, unit_idx, color,
          student_name, time_taken, answers, date_str, time_str,
          quit, abandoned
        ) VALUES (
          (SELECT parent_id FROM student_profiles WHERE id = p_student_id),
          p_student_id,
          (v_entry->>'local_id')::bigint,
          v_entry->>'qid',
          COALESCE(v_entry->>'label', ''),
          v_entry->>'type',
          (v_entry->>'score')::int,
          (v_entry->>'total')::int,
          (v_entry->>'pct')::int,
          COALESCE(v_entry->>'stars', ''),
          (v_entry->>'unit_idx')::int,
          COALESCE(v_entry->>'color', '#6c5ce7'),
          COALESCE(v_entry->>'student_name', ''),
          COALESCE(v_entry->>'time_taken', ''),
          COALESCE(v_entry->'answers', '[]'::jsonb),
          COALESCE(v_entry->>'date_str', ''),
          COALESCE(v_entry->>'time_str', ''),
          COALESCE((v_entry->>'quit')::boolean, false),
          COALESCE((v_entry->>'abandoned')::boolean, false)
        );
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- DROP removed prior grants on push_student_progress; re-apply.
GRANT EXECUTE ON FUNCTION public.push_student_progress(
  uuid, uuid, jsonb, integer, integer, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, bigint
) TO anon, authenticated, service_role;
