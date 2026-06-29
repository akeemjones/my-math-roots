-- ============================================================================
-- 20260628_push_quiz_scores_decoupled.sql
--
-- Decoupled, lenient quiz-score sync for PIN-student sessions.
--
-- ROOT CAUSE (dashboard "out of sync"): the existing push_student_progress RPC
-- is ATOMIC — it validates the whole profile payload (mastery/apptime/done/
-- act_dates/streak) AND inserts quiz scores in one call, and RETURNs an error
-- BEFORE the score insert if ANY guard trips:
--   * a monotonic guard (apptime/mastery/done/act_dates "decreased") after a
--     local cache clear, or
--   * a per-score check that requires pct == round(score/total*100) ±1 — which
--     a legitimate HINT PENALTY (pct = rawPct - 2*hintsUsed) violates.
-- Either one rejects the ENTIRE payload, so quiz scores never reach quiz_scores
-- (the table the parent dashboard reads). The client also swallowed the
-- `validation_failed` return, so this was silent.
--
-- FIX: a score-only RPC that inserts valid scores INDEPENDENTLY of the profile
-- guards and does NOT enforce pct == score/total (so a hint-penalized score
-- still syncs). The client pushes scores through this RPC separately from the
-- monotonic-guarded profile push, so a completed quiz score is saved even when
-- the broader profile progress payload is rejected.
--
-- Idempotent by (student_id, local_id), mirroring push_student_progress's
-- existing NOT EXISTS insert. Additive and reversible (DROP FUNCTION).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.push_quiz_scores(
  p_student_id    uuid,
  p_session_token uuid,
  p_scores        jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent_id uuid;
  v_entry     jsonb;
  v_inserted  int := 0;
  v_skipped   int := 0;
BEGIN
  -- Same auth as push_student_progress: parent JWT (auth.uid) OR a valid PIN
  -- session token. _validate_pin_session raises on an invalid token.
  IF auth.uid() IS NOT NULL THEN
    SELECT parent_id INTO v_parent_id FROM student_profiles WHERE id = p_student_id;
    IF v_parent_id IS NULL OR v_parent_id <> auth.uid() THEN
      RAISE EXCEPTION 'not_authorized';
    END IF;
  ELSE
    PERFORM _validate_pin_session(p_student_id, p_session_token);
    SELECT parent_id INTO v_parent_id FROM student_profiles WHERE id = p_student_id;
  END IF;

  IF v_parent_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found', 'details', 'student profile not found');
  END IF;

  IF p_scores IS NULL OR jsonb_typeof(p_scores) <> 'array' THEN
    RETURN jsonb_build_object('success', true, 'inserted', 0, 'skipped', 0);
  END IF;

  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_scores) LOOP
    -- Sanity only — NO pct==score/total guard, NO monotonic profile guards.
    -- A malformed row is skipped (counted), never aborting the whole batch.
    IF (v_entry->>'local_id') IS NULL
       OR (v_entry->>'total') IS NULL OR (v_entry->>'total')::int < 1
       OR (v_entry->>'score') IS NULL OR (v_entry->>'score')::int < 0
       OR (v_entry->>'score')::int > (v_entry->>'total')::int
       OR (v_entry->>'pct') IS NULL
       OR (v_entry->>'pct')::int < 0 OR (v_entry->>'pct')::int > 100
    THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM quiz_scores
      WHERE student_id = p_student_id AND local_id = (v_entry->>'local_id')::bigint
    ) THEN
      INSERT INTO quiz_scores (
        user_id, student_id, local_id, qid, label, type,
        score, total, pct, stars, unit_idx, color,
        student_name, time_taken, answers, date_str, time_str,
        quit, abandoned, grade
      ) VALUES (
        v_parent_id,
        p_student_id,
        (v_entry->>'local_id')::bigint,
        COALESCE(v_entry->>'qid', ''),
        COALESCE(v_entry->>'label', ''),
        COALESCE(v_entry->>'type', ''),
        (v_entry->>'score')::int,
        (v_entry->>'total')::int,
        (v_entry->>'pct')::int,
        COALESCE(v_entry->>'stars', ''),
        LEAST(GREATEST(COALESCE((v_entry->>'unit_idx')::int, 0), 0), 9),
        COALESCE(v_entry->>'color', '#6c5ce7'),
        COALESCE(v_entry->>'student_name', ''),
        COALESCE(v_entry->>'time_taken', ''),
        COALESCE(v_entry->'answers', '[]'::jsonb),
        COALESCE(v_entry->>'date_str', ''),
        COALESCE(v_entry->>'time_str', ''),
        COALESCE((v_entry->>'quit')::boolean, false),
        COALESCE((v_entry->>'abandoned')::boolean, false),
        NULLIF(v_entry->>'grade', '')
      );
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'inserted', v_inserted, 'skipped', v_skipped);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.push_quiz_scores(uuid, uuid, jsonb) TO anon, authenticated;

-- Rollback: DROP FUNCTION public.push_quiz_scores(uuid, uuid, jsonb);
