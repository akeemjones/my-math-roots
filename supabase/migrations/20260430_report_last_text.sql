-- ══════════════════════════════════════════════════════════════
--  Migration: report_last_text column on student_profiles
--  2026-04-30
--
--  Adds a nullable TEXT column that stores the most recent
--  AI-generated parent report. Lets parents re-view the last
--  report during the 14-day cooldown window without re-calling
--  Gemini.
--
--  Companion to the existing report_last_generated column
--  (added via dashboard before this repo had checked-in migrations).
--  This file is also a backfill point if you need to recreate the
--  schema from scratch — see the IF NOT EXISTS block below.
-- ══════════════════════════════════════════════════════════════

-- 1. Backfill report_last_generated if it doesn't exist yet (idempotent).
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS report_last_generated TIMESTAMPTZ;

-- 2. New column for the report body text.
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS report_last_text TEXT;

-- No RLS change needed — student_profiles already has the
-- "parent_owns_profiles" policy from 20260330_student_profiles.sql,
-- and this column is read/written by the same parent.
