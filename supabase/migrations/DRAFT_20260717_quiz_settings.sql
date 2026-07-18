-- ══════════════════════════════════════════════════════════════════════════
--  DRAFT — DO NOT APPLY
--
--  Per-student quiz-length settings sync for student_profiles.
--
--  STATUS: reviewed draft. NOT applied to any environment. Named DRAFT_* so the
--  Supabase CLI will not pick it up. Rename to 20260717_quiz_settings.sql only
--  when the production action below is authorized.
--
--  ── WHY ─────────────────────────────────────────────────────────────────
--  Parent-set lesson and unit quiz lengths are kept in the simplified product,
--  but today they live only in the device's localStorage (mmr_quiz_lengths_<id>)
--  and never reach Supabase, so a length set on one device is invisible on
--  another. This adds a per-student sync path that mirrors the existing
--  timer/a11y/unlock settings pattern exactly (20260331_parent_controls.sql):
--  a dedicated JSONB column plus a SECURITY DEFINER read RPC and an
--  ownership-checked write RPC.
--
--  ── ISOLATION ───────────────────────────────────────────────────────────
--  quiz_settings is its OWN column. update_quiz_settings writes ONLY that
--  column, so a quiz-length save can never overwrite unlock_settings,
--  timer_settings, a11y_settings, grade, or any progress/mastery/streak/
--  activity column. No merge across settings is needed — they are separate
--  columns with separate RPCs.
--
--  ── CONFLICT RULE ───────────────────────────────────────────────────────
--  The client stamps each edit with a millisecond `ts`. update_quiz_settings
--  applies the write ONLY when the incoming ts is >= the stored ts, so a stale
--  device cannot silently overwrite a newer setting made on another device.
--  Equal ts is allowed (idempotent re-push of the same edit). A payload with no
--  ts (0) never overwrites a real stored edit.
--
--  ── PRODUCTION ACTION REQUIRED ──────────────────────────────────────────
--  1. Verify against a Supabase BRANCH database first, not production.
--  2. Confirm student_profiles and the parent_id ownership column match the
--     assumptions here (they are defined in 20260330_student_profiles.sql).
--  3. Apply, then re-run tests/quiz-length-sync.test.js semantics against the
--     branch and exercise the dashboard save/switch flow.
--  Until applied, the client falls back to localStorage-only (it treats a
--  missing RPC, PostgREST error PGRST202, as "sync unavailable") so nothing
--  breaks; cross-device sync simply does not happen yet.
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1. Column (additive, safe default, existing rows compatible) ───────────
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS quiz_settings JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN student_profiles.quiz_settings IS
  'Per-student quiz-length settings: { lesson, unit, ts }. lesson/unit are '
  '"default" | <positive int> | "all". ts is the client edit timestamp used '
  'for stale-write protection. Missing/empty means "default".';

-- ── 2. Read RPC (SECURITY DEFINER, anon + authenticated) ───────────────────
CREATE OR REPLACE FUNCTION get_quiz_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(quiz_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
REVOKE EXECUTE ON FUNCTION get_quiz_settings(UUID) FROM public;
GRANT EXECUTE ON FUNCTION get_quiz_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_quiz_settings(UUID) TO authenticated;

-- ── 3. Write RPC (authenticated, ownership-checked, ts-guarded) ────────────
CREATE OR REPLACE FUNCTION update_quiz_settings(p_student_id UUID, p_settings JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner   UUID;
  v_current JSONB;
  v_cur_ts  BIGINT;
  v_new_ts  BIGINT;
BEGIN
  SELECT parent_id, COALESCE(quiz_settings, '{}')
    INTO v_owner, v_current
    FROM student_profiles WHERE id = p_student_id;

  IF v_owner IS NULL OR v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  -- Stale-write guard: only apply when the incoming ts is at least the stored
  -- ts. A stale device (older ts) is rejected silently by returning the current
  -- stored value unchanged, so the client can reconcile to the newer setting.
  v_cur_ts := COALESCE((v_current ->> 'ts')::BIGINT, 0);
  v_new_ts := COALESCE((p_settings ->> 'ts')::BIGINT, 0);

  IF v_new_ts < v_cur_ts THEN
    RETURN v_current;                 -- reject stale write, hand back the winner
  END IF;

  UPDATE student_profiles
     SET quiz_settings = p_settings, updated_at = now()
   WHERE id = p_student_id;
  RETURN p_settings;
END; $$;
REVOKE EXECUTE ON FUNCTION update_quiz_settings(UUID, JSONB) FROM public;
GRANT EXECUTE ON FUNCTION update_quiz_settings(UUID, JSONB) TO authenticated;

-- ── 4. Verification (run against a BRANCH database, never production) ───────
--
--   -- (a) default: an untouched profile reads '{}' -> client treats as default
--   SELECT get_quiz_settings('<student-uuid>');            -- {}
--
--   -- (b) owner can write; returns the stored value
--   SELECT update_quiz_settings('<student-uuid>',
--     '{"lesson":12,"unit":"all","ts":1000}'::jsonb);      -- echoes the payload
--   SELECT get_quiz_settings('<student-uuid>');            -- {lesson:12,unit:"all",ts:1000}
--
--   -- (c) stale write is rejected, newer stored value is preserved and returned
--   SELECT update_quiz_settings('<student-uuid>',
--     '{"lesson":4,"unit":"default","ts":500}'::jsonb);    -- returns the ts:1000 row
--   SELECT get_quiz_settings('<student-uuid>');            -- still ts:1000
--
--   -- (d) a non-owner is rejected
--   -- (as a different auth.uid()) SELECT update_quiz_settings(...);  -- ERROR not_owner
--
--   -- (e) unrelated settings are untouched by a quiz-length write
--   SELECT timer_settings, a11y_settings, unlock_settings, grade
--     FROM student_profiles WHERE id = '<student-uuid>';   -- unchanged
--
-- Rollback:
--   DROP FUNCTION IF EXISTS update_quiz_settings(UUID, JSONB);
--   DROP FUNCTION IF EXISTS get_quiz_settings(UUID);
--   ALTER TABLE student_profiles DROP COLUMN IF EXISTS quiz_settings;
