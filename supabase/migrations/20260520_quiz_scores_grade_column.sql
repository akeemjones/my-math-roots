-- Phase 3A bug-batch (F5): add `grade` column to quiz_scores so the Parent
-- Dashboard quiz history can grade-filter scores after Supabase round-trip.
-- Mirrors the Phase 2C pattern for intervention_events.grade.
--
-- Why: client now writes a `grade` field on every saved score (lesson, unit,
-- final, quit, abandoned). Before this migration, the push payload omitted
-- `grade`, the column didn't exist, and round-tripped records fell back to
-- qid-pattern inference. That works for most prefixed qids but drops some
-- legacy `final_test*` records into `legacy_unknown`, hiding them from the
-- grade-scoped quiz history view.
--
-- Safety: column is NULLABLE so existing rows continue to load without
-- breaking. CHECK constraint enforces the canonical set of band values.
-- Backfill uses the same regex priorities as src/dashboard.js
-- _inferScoreGrade so historical data shows up consistently.

-- 1. Add nullable grade column
ALTER TABLE public.quiz_scores
  ADD COLUMN IF NOT EXISTS grade text NULL;

-- 2. CHECK constraint — only canonical band values (or NULL for legacy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quiz_scores_grade_values'
  ) THEN
    ALTER TABLE public.quiz_scores
      ADD CONSTRAINT quiz_scores_grade_values
      CHECK (grade IS NULL OR grade IN ('k', 'g1', 'g2'));
  END IF;
END $$;

-- 3. Backfill NULL grades from qid prefix patterns (mirrors _inferScoreGrade).
-- Order matters: g1 first (most specific), then k (ku/k\d), then g2 (u\d).
UPDATE public.quiz_scores
  SET grade = 'g1'
  WHERE grade IS NULL
    AND (qid ~* '^(lq_)?g1' OR qid ~* '^g1u');

UPDATE public.quiz_scores
  SET grade = 'k'
  WHERE grade IS NULL
    AND (qid ~* '^(lq_)?(ku|k\d)' OR qid ~* '^k(u|\d)');

UPDATE public.quiz_scores
  SET grade = 'g2'
  WHERE grade IS NULL
    AND qid ~* '^(lq_)?u\d';

-- 4. Composite index for grade-scoped quiz history queries
CREATE INDEX IF NOT EXISTS idx_quiz_scores_student_grade_created_at
  ON public.quiz_scores (student_id, grade, created_at DESC);
