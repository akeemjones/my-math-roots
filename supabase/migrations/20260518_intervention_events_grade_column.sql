-- ════════════════════════════════════════════════════════════════════════════
--  Migration: add `grade` column to public.intervention_events
--  Phase 2C — server-side authoritative grade for Learning Insights
--
--  Adds a nullable `grade text` column (values: 'k' | 'g1' | 'g2' | NULL),
--  backfills existing rows from session_id / question_id prefixes, and
--  installs a composite index for grade-scoped student lookups.
--
--  Safety:
--    - Column is nullable with no default. Existing INSERTs that don't
--      include `grade` continue to work; the dashboard read path falls back
--      to session-id inference when the column is NULL.
--    - CHECK constraint allows NULL so the backfill UPDATE never fails on
--      rows that can't be inferred.
--    - Backfill UPDATE is online-safe on a small per-student table
--      (typically <500 rows per profile, limit enforced by the client).
--    - No RLS policy changes — existing student_id → parent_id checks cover
--      the new column automatically.
--    - No RPC changes — `clear_intervention_events(p_student_id UUID)`
--      deletes by student_id and is unaffected.
--
--  Rollback (if needed):
--    ALTER TABLE public.intervention_events DROP CONSTRAINT IF EXISTS intervention_events_grade_values;
--    DROP INDEX IF EXISTS public.idx_intervention_events_student_grade_occurred_at;
--    ALTER TABLE public.intervention_events DROP COLUMN IF EXISTS grade;
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Add the nullable grade column.
ALTER TABLE public.intervention_events
  ADD COLUMN IF NOT EXISTS grade text DEFAULT NULL;

-- 2. CHECK constraint — only valid bands or NULL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'intervention_events_grade_values'
  ) THEN
    ALTER TABLE public.intervention_events
      ADD CONSTRAINT intervention_events_grade_values
      CHECK (grade IS NULL OR grade IN ('k','g1','g2'));
  END IF;
END $$;

-- 3. Backfill from session_id / question_id prefixes. Mirrors the
--    _inferInterventionGrade() probe order in src/dashboard.js so client and
--    server agree on the inference rules.
UPDATE public.intervention_events
SET grade = CASE
  WHEN session_id  ~* '^(lq_)?g1'        THEN 'g1'
  WHEN session_id  ~* '^(lq_)?(ku|k\d)'  THEN 'k'
  WHEN session_id  ~* '^(lq_)?u\d'       THEN 'g2'
  WHEN question_id ~* '^(lq_)?g1'        THEN 'g1'
  WHEN question_id ~* '^(lq_)?(ku|k\d)'  THEN 'k'
  WHEN question_id ~* '^(lq_)?u\d'       THEN 'g2'
  ELSE NULL
END
WHERE grade IS NULL;

-- 4. Composite index for grade-scoped per-student fetches.
CREATE INDEX IF NOT EXISTS idx_intervention_events_student_grade_occurred_at
  ON public.intervention_events (student_id, grade, occurred_at DESC);
