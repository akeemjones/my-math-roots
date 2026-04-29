-- ═══════════════════════════════════════════════════════════════════════════
-- 012: Drop ambiguous get_user_sync_data overloads
-- ═══════════════════════════════════════════════════════════════════════════
--
-- APPLIED AS HOTFIX 2026-04-28 (live, via MCP apply_migration).
-- Root cause: three overloads of get_user_sync_data existed with overlapping
-- DEFAULT parameters. Calling the function with no arguments caused Postgres
-- to fail with "could not choose the best candidate function", breaking the
-- parent dashboard pull on every page load.
--
-- Overloads that existed before this migration:
--   1. get_user_sync_data()                              — original SQL function
--   2. get_user_sync_data(p_student_id uuid DEFAULT NULL)
--   3. get_user_sync_data(p_student_id uuid DEFAULT NULL, p_grade text DEFAULT '2')
--
-- Overloads 1 and 2 are superseded by overload 3, which handles all cases via
-- DEFAULT values. Dropping 1 and 2 leaves a single unambiguous function.
--
-- The surviving function (overload 3) is fully replaced in migration 013 with
-- the date-cast fix applied simultaneously.
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop the original no-param SQL overload (legacy, returns json, missing columns)
DROP FUNCTION IF EXISTS public.get_user_sync_data();

-- Drop the 1-param overload (superseded by the 2-param version with p_grade)
DROP FUNCTION IF EXISTS public.get_user_sync_data(p_student_id uuid);
