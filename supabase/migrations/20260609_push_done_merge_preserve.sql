-- ══════════════════════════════════════════════════════════════
--  Migration: push_student_progress — done_json merge-preserve
--
--  Tier 2 cross-device sync fix paired with the Tier 1 frontend
--  resume-pull (commit 95ad394).
--
--  PROBLEM
--  -------
--  The previous push_student_progress body (introduced in
--  20260520_student_profiles_reset_epoch.sql, line 408) replaced
--  the server's done_json wholesale:
--      done_json = p_done_json
--  The existing anti-tamper guard rejects explicit true→false
--  flips, but it does NOT cover the case where the payload simply
--  omits a key that the server has stored as true. A stale device
--  (logged in before another device pushed lesson L4) would push a
--  DONE map lacking L4, and the wholesale UPDATE would silently
--  remove L4 from the server's done_json.
--
--  Production evidence (verified 2026-05-21 via Supabase MCP on
--  project omjegwtzirskgmgeojdn):
--    Student 8d465d79-...-3b4 has 4 quiz_scores rows for lq_u1l4
--    (all post-reset, best pct=100) but their student_profiles
--    .done_json contains neither u1l4 nor lq_u1l4 — the
--    completion summary flags were overwritten by a stale device's
--    push while quiz_scores (append-only) stayed intact.
--
--  FIX
--  ---
--  Change the UPDATE clause from a wholesale replacement to a
--  JSONB merge-preserve using the `||` operator:
--      done_json = COALESCE(v_stored.done_json, '{}'::jsonb)
--                  || COALESCE(p_done_json,    '{}'::jsonb)
--
--  `||` is right-side wins on key collision, so payload values
--  override stored values when both are present. Stored keys
--  absent from the payload are PRESERVED.
--
--  All other behavior is unchanged:
--    * Stale reset_epoch rejection (lines 265-274 of 20260520)
--      still fires first.
--    * Validation guards (streak ranges, mastery shapes, etc.)
--      are unchanged.
--    * Anti-tamper guard on explicit done true→false flips
--      (lines 356-365 of 20260520) is unchanged and still rejects
--      that case before the UPDATE runs.
--    * mastery / apptime / act_dates wholesale UPDATEs are
--      unchanged — Tier 2 deliberately scopes to done_json only.
--    * quiz_scores append-INSERT loop (lines 415-449 of 20260520)
--      is unchanged.
--    * Signature is identical (15 params) so the CREATE OR REPLACE
--      preserves all existing GRANTs on the function.
-- ══════════════════════════════════════════════════════════════

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
  p_scores          jsonb  DEFAULT '[]'::jsonb,
  p_grade           text   DEFAULT '2'::text,
  p_activity_json   jsonb  DEFAULT '{"v": 1, "events": []}'::jsonb,
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

    -- Existing anti-tamper guard: reject explicit true→false flips on
    -- done_json. Unchanged from 20260520. Runs BEFORE the merge below,
    -- so a tampering payload is still rejected before any UPDATE.
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

  -- ── UPDATE student_profiles ───────────────────────────────────
  -- *** TIER 2 CHANGE: done_json uses JSONB `||` merge-preserve
  --     instead of wholesale replacement. ***
  -- All other columns continue to be wholesale-replaced (the Tier 2
  -- scope is deliberately narrow). Merging mastery/apptime is a
  -- separate, larger change because their values are not simple
  -- booleans and the existing guards on them already mitigate the
  -- worst data-loss patterns.
  UPDATE student_profiles SET
    mastery_json      = p_mastery_json,
    activity_json     = p_activity_json,
    streak_current    = p_streak_current,
    streak_longest    = p_streak_longest,
    streak_last_date  = p_streak_last_date,
    apptime_json      = p_apptime_json,
    done_json         = COALESCE(v_stored.done_json, '{}'::jsonb)
                        || COALESCE(p_done_json,    '{}'::jsonb),
    act_dates_json    = p_act_dates_json,
    settings_json     = p_settings_json,
    a11y_json         = p_a11y_json,
    updated_at        = now()
  WHERE id = p_student_id;

  -- ── quiz_scores append-INSERT (unchanged) ─────────────────────
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

COMMENT ON FUNCTION public.push_student_progress(
  uuid, uuid, jsonb, integer, integer, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, bigint
) IS
  'Student-session progress push. done_json uses JSONB || merge-preserve '
  '(20260609_push_done_merge_preserve.sql) so a stale device push cannot '
  'remove completion flags the server already has. Anti-tamper guard '
  'against explicit true→false flips still applies and runs before the '
  'merge.';

-- ══════════════════════════════════════════════════════════════
--  Self-verification: JSONB || merge semantics
--
--  Runs at migration-apply time. Aborts the migration with a
--  RAISE EXCEPTION if any invariant breaks. Pure JSONB literals,
--  no table writes, so safe to re-run.
-- ══════════════════════════════════════════════════════════════
DO $verify$
DECLARE
  v_merged JSONB;
BEGIN
  -- Invariant 1: stored keys absent from payload are preserved.
  v_merged := '{"u1l4": true, "lq_u1l4": true, "u1l3": true}'::jsonb
              || '{"u1l3": true, "u1l1": true}'::jsonb;
  IF NOT (v_merged ? 'u1l4'
          AND v_merged ? 'lq_u1l4'
          AND v_merged ? 'u1l3'
          AND v_merged ? 'u1l1') THEN
    RAISE EXCEPTION '[20260609] merge-preserve invariant 1 failed: omitted keys not preserved. merged=%', v_merged;
  END IF;

  -- Invariant 2: preserved keys retain their value (true stays true).
  IF v_merged->'u1l4'    <> 'true'::jsonb
     OR v_merged->'lq_u1l4' <> 'true'::jsonb THEN
    RAISE EXCEPTION '[20260609] merge-preserve invariant 2 failed: preserved key values corrupted. merged=%', v_merged;
  END IF;

  -- Invariant 3: new key in payload is added to merged result.
  v_merged := '{"u1l1": true}'::jsonb || '{"u1l2": true}'::jsonb;
  IF NOT (v_merged ? 'u1l1' AND v_merged ? 'u1l2') THEN
    RAISE EXCEPTION '[20260609] merge-preserve invariant 3 failed: new key not added. merged=%', v_merged;
  END IF;

  -- Invariant 4: payload value wins on key collision.
  -- (The function-level anti-tamper guard catches the true→false case
  --  *before* this merge runs, so the merge would only see a payload
  --  collision when payload also says true. We assert the underlying
  --  || semantics here as documentation.)
  v_merged := '{"u1l4": false}'::jsonb || '{"u1l4": true}'::jsonb;
  IF v_merged->'u1l4' <> 'true'::jsonb THEN
    RAISE EXCEPTION '[20260609] merge-preserve invariant 4 failed: payload should win on collision. merged=%', v_merged;
  END IF;

  -- Invariant 5: NULL stored falls back to empty object before merge.
  v_merged := COALESCE(NULL::jsonb, '{}'::jsonb) || '{"u1l1": true}'::jsonb;
  IF NOT (v_merged ? 'u1l1') THEN
    RAISE EXCEPTION '[20260609] merge-preserve invariant 5 failed: NULL stored fallback broken. merged=%', v_merged;
  END IF;

  -- Invariant 6: NULL payload falls back to empty object (no key loss).
  v_merged := '{"u1l4": true}'::jsonb || COALESCE(NULL::jsonb, '{}'::jsonb);
  IF NOT (v_merged ? 'u1l4') THEN
    RAISE EXCEPTION '[20260609] merge-preserve invariant 6 failed: NULL payload fallback broken. merged=%', v_merged;
  END IF;

  RAISE NOTICE '[20260609_push_done_merge_preserve] all merge-preserve invariants verified.';
END
$verify$;

-- ══════════════════════════════════════════════════════════════
--  Manual verification (post-apply, run via Supabase SQL editor
--  or MCP execute_sql)
--
--    -- 1. Confirm new function body contains the merge expression
--    SELECT 'merge_preserve_present' AS check_name,
--           position('COALESCE(v_stored.done_json' IN
--                    pg_get_functiondef('public.push_student_progress(
--                      uuid, uuid, jsonb, integer, integer, text, jsonb,
--                      jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, bigint
--                    )'::regprocedure)) > 0 AS pass;
--
--    -- 2. Confirm the existing anti-tamper guard line still exists
--    SELECT 'false_flip_guard_intact' AS check_name,
--           position('done flag flipped back to false' IN
--                    pg_get_functiondef('public.push_student_progress(
--                      uuid, uuid, jsonb, integer, integer, text, jsonb,
--                      jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, bigint
--                    )'::regprocedure)) > 0 AS pass;
--
--    -- 3. Confirm stale_reset_epoch guard still exists
--    SELECT 'reset_epoch_guard_intact' AS check_name,
--           position('stale_reset_epoch' IN
--                    pg_get_functiondef('public.push_student_progress(
--                      uuid, uuid, jsonb, integer, integer, text, jsonb,
--                      jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, bigint
--                    )'::regprocedure)) > 0 AS pass;
-- ══════════════════════════════════════════════════════════════
