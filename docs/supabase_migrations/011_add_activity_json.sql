-- ═══════════════════════════════════════════════════════════════════════════
-- 011: Add activity_json to Supabase sync pipeline
-- ═══════════════════════════════════════════════════════════════════════════
--
-- APPLY THIS MIGRATION BEFORE deploying the updated client.
-- The new column and parameter both use DEFAULT values, so:
--   - Old clients (without p_activity_json) continue to work after migration
--   - New clients (with p_activity_json) require this migration to be applied
--
-- Tables changed: student_profiles, student_progress
-- RPCs changed:   push_student_progress, pull_student_progress
-- RPCs unchanged: get_user_sync_data (already uses row_to_json — picks up new column automatically)
-- Manual update:  get_student_progress_by_pin (see §5 below)
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1. Add activity_json to student_profiles ─────────────────────────────
-- Used by PIN/session-token student path (push_student_progress / pull_student_progress).

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS activity_json JSONB NOT NULL DEFAULT '{"v":1,"events":[]}'::jsonb;


-- ── 2. Add activity_json to student_progress ─────────────────────────────
-- Used by parent-auth path (direct .upsert() from auth.js _pushAllParent pipeline).
-- get_user_sync_data already returns row_to_json(sp) — picks up this column automatically.

ALTER TABLE student_progress
  ADD COLUMN IF NOT EXISTS activity_json JSONB NOT NULL DEFAULT '{"v":1,"events":[]}'::jsonb;


-- ── 3. Update push_student_progress ──────────────────────────────────────
-- Full replacement. Adds p_activity_json with DEFAULT so old clients keep working.
-- Also includes p_grade (from migration 010) in case that migration was not applied.

CREATE OR REPLACE FUNCTION push_student_progress(
  p_student_id       UUID,
  p_session_token    UUID,
  p_mastery_json     JSONB,
  p_streak_current   INTEGER,
  p_streak_longest   INTEGER,
  p_streak_last_date TEXT,
  p_apptime_json     JSONB,
  p_done_json        JSONB,
  p_act_dates_json   JSONB,
  p_settings_json    JSONB,
  p_a11y_json        JSONB,
  p_scores           JSONB    DEFAULT '[]'::jsonb,
  p_grade            TEXT     DEFAULT '2',
  p_activity_json    JSONB    DEFAULT '{"v":1,"events":[]}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored         RECORD;
  v_key            TEXT;
  v_val            JSONB;
  v_entry          JSONB;
  v_stored_mastery JSONB;
  v_score_row      RECORD;
  v_pct_calc       INTEGER;
BEGIN
  -- ── Auth: validate session token ─────────────────────────────────────────
  PERFORM _validate_pin_session(p_student_id, p_session_token);

  -- ── Schema validation ────────────────────────────────────────────────────

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

  -- activity_json: must be object with v=1 key, or empty-ish — accept gracefully
  IF p_activity_json IS NOT NULL AND jsonb_typeof(p_activity_json) <> 'object' THEN
    RETURN jsonb_build_object('error', 'validation_failed', 'details', 'activity_json must be an object');
  END IF;

  -- ── Monotonic validation ─────────────────────────────────────────────────
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

  -- ── Score validation ─────────────────────────────────────────────────────
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

  -- ── Write progress to student_profiles ───────────────────────────────────
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

  -- ── Insert validated scores ──────────────────────────────────────────────
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
$$;

REVOKE EXECUTE ON FUNCTION push_student_progress FROM public;
GRANT  EXECUTE ON FUNCTION push_student_progress TO anon;
GRANT  EXECUTE ON FUNCTION push_student_progress TO authenticated;


-- ── 4. Update pull_student_progress ──────────────────────────────────────
-- Full replacement. Adds activity_json to the returned profile object.
-- Also includes p_grade parameter for API consistency.

CREATE OR REPLACE FUNCTION pull_student_progress(
  p_student_id    UUID,
  p_session_token UUID,
  p_grade         TEXT DEFAULT '2'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    'onboarding_json', COALESCE(onboarding_json, '{}'::jsonb)
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
$$;

REVOKE EXECUTE ON FUNCTION pull_student_progress FROM public;
GRANT  EXECUTE ON FUNCTION pull_student_progress TO anon;
GRANT  EXECUTE ON FUNCTION pull_student_progress TO authenticated;


-- ── 5. Manual update required: get_student_progress_by_pin ───────────────
-- This function exists only in the live Supabase project (not version-controlled).
-- Apply the following diff manually in:
--   Supabase Dashboard → Database → Functions → get_student_progress_by_pin → Edit
--
-- In the SELECT that builds the progress/profile JSONB return object, add:
--   'activity_json', activity_json,
-- alongside the existing mastery_json entry.
--
-- Example diff (exact line may vary):
--   BEFORE:  'mastery_json', mastery_json,
--   AFTER:   'mastery_json', mastery_json,
--            'activity_json', activity_json,
--
-- This allows the parent dashboard's _loadManagedStudentScores to read
-- activity_json from managed student profiles.
--
-- If not updated: _loadManagedStudentScores gracefully handles missing
-- activity_json (ACTIVITY defaults to [] in dashboard). Not a crash.

DO $$ BEGIN
  RAISE NOTICE 'ACTION REQUIRED: get_student_progress_by_pin must be updated manually. See comment in §5 of this migration.';
END $$;
