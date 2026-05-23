// tests/feedback-lockdown.test.js
//
// Contract tests for supabase/migrations/20260611_feedback_lockdown.sql.
//
// Addresses three audit findings (2026-05-22):
//   SS-1   Drop the `feedback-email` trigger that embeds a plaintext
//          service_role JWT in pg_trigger.tgargs (10-year credential
//          exposure to anyone with catalog read access).
//   A2-F5  Tighten INSERT WITH CHECK from `auth.uid() IS NOT NULL`
//          to `auth.uid() = user_id` so a user cannot insert feedback
//          on behalf of another user.
//   A3-F9  Add a BEFORE INSERT rate-limit trigger calling
//          check_and_increment_rate_limit, 5/hour/user.
//
// DB-level functional verification (the trigger actually firing, the
// JWT scrub being visible, the new policy preventing cross-user inserts)
// lives in the migration as inline manual SQL queries — running them
// requires a live Supabase project, which we don't have in CI. These
// contract tests confirm the migration file ships the right SQL shape.

const fs = require('fs');
const path = require('path');

const MIGRATION_PATH = path.resolve(
  __dirname, '..', 'supabase', 'migrations',
  '20260611_feedback_lockdown.sql'
);

describe('20260611_feedback_lockdown.sql', () => {
  let sql;
  beforeAll(() => {
    sql = fs.readFileSync(MIGRATION_PATH, 'utf8');
  });

  test('migration file exists and is not empty', () => {
    expect(sql.length).toBeGreaterThan(500);
  });

  test('drops the feedback-email trigger (scrubs embedded JWT from tgargs)', () => {
    expect(sql).toMatch(/DROP\s+TRIGGER\s+IF\s+EXISTS\s+"feedback-email"\s+ON\s+public\.feedback/i);
  });

  test('tightens INSERT WITH CHECK to auth.uid() = user_id', () => {
    // The old policy ("Authenticated users can submit feedback") used
    // WITH CHECK (auth.uid() IS NOT NULL). The new one must pin user_id.
    expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"Authenticated users can submit feedback"\s+ON\s+public\.feedback/i);
    expect(sql).toMatch(/CREATE\s+POLICY\s+"Authenticated users can submit feedback"[\s\S]+WITH\s+CHECK\s*\(\s*auth\.uid\(\)\s*=\s*user_id\s*\)/i);
  });

  test('adds BEFORE INSERT rate-limit trigger function with correct cap', () => {
    expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\._feedback_rate_limit_check/i);
    // Cap: 5 per hour. Window is in milliseconds. Match the actual call
    // shape (with the opening paren and feedback: prefix) so the SQL
    // header comments mentioning the function name don't match first.
    const callMatch = sql.match(/check_and_increment_rate_limit\(\s*[\s\S]*?\)/);
    expect(callMatch).toBeTruthy();
    expect(callMatch[0]).toMatch(/['"]feedback:['"]\s*\|\|/);
    expect(callMatch[0]).toMatch(/\b5\b/);
    expect(callMatch[0]).toMatch(/3600000/);
  });

  test('rate-limit function raises errcode 53400 (configuration_limit_exceeded)', () => {
    expect(sql).toMatch(/RAISE\s+EXCEPTION[\s\S]+feedback_rate_limited[\s\S]+ERRCODE\s*=\s*['"]53400['"]/i);
  });

  test('rate-limit function is SECURITY DEFINER with pinned search_path', () => {
    const fnBlock = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\._feedback_rate_limit_check[\s\S]+?\$\$;/i);
    expect(fnBlock).toBeTruthy();
    expect(fnBlock[0]).toMatch(/SECURITY\s+DEFINER/i);
    expect(fnBlock[0]).toMatch(/SET\s+search_path\s*=\s*public/i);
  });

  test('rate-limit function EXECUTE is revoked from PUBLIC, anon, authenticated', () => {
    expect(sql).toMatch(/REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\._feedback_rate_limit_check\(\)\s*\n?\s*FROM\s+PUBLIC,\s*anon,\s*authenticated/i);
  });

  test('creates trg_feedback_rate_limit as BEFORE INSERT FOR EACH ROW', () => {
    expect(sql).toMatch(/DROP\s+TRIGGER\s+IF\s+EXISTS\s+trg_feedback_rate_limit\s+ON\s+public\.feedback/i);
    expect(sql).toMatch(/CREATE\s+TRIGGER\s+trg_feedback_rate_limit[\s\S]+BEFORE\s+INSERT\s+ON\s+public\.feedback[\s\S]+FOR\s+EACH\s+ROW[\s\S]+EXECUTE\s+FUNCTION\s+public\._feedback_rate_limit_check\(\)/i);
  });

  test('documents the manual service_role key rotation steps', () => {
    expect(sql).toMatch(/ROTATION\s+STEPS/i);
    expect(sql).toMatch(/Reset\s+service_role\s+key/i);
    expect(sql).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  test('does NOT recreate the feedback-email trigger (deferred to post-launch)', () => {
    // Re-enabling feedback email is a post-launch task. The migration
    // must not silently re-introduce the embedded-JWT pattern.
    const createTriggerCount = (sql.match(/CREATE\s+TRIGGER/gi) || []).length;
    // Only one CREATE TRIGGER allowed: trg_feedback_rate_limit.
    expect(createTriggerCount).toBe(1);
    expect(sql).not.toMatch(/CREATE\s+TRIGGER\s+"?feedback-email"?/i);
  });

  test('does not embed any JWT pattern (eyJ...)', () => {
    expect(sql).not.toMatch(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  });
});
