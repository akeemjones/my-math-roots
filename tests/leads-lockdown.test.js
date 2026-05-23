// tests/leads-lockdown.test.js
//
// Contract tests for supabase/migrations/20260612_leads_lockdown.sql
// and the matching client cleanup in src/auth.js.
//
// Addresses audit SS-4 (2026-05-22): the `leads` table has an INSERT
// policy with WITH CHECK (true), letting any anon caller insert rows
// via the public REST endpoint. The migration drops the policy and
// revokes table grants from anon/authenticated. The client cleanup
// removes the dead `_supa.from('leads').insert()` call.

const fs   = require('fs');
const path = require('path');

const MIG_PATH    = path.resolve(__dirname, '..', 'supabase', 'migrations', '20260612_leads_lockdown.sql');
const AUTH_PATH   = path.resolve(__dirname, '..', 'src', 'auth.js');

describe('20260612_leads_lockdown.sql', () => {
  let sql;
  beforeAll(() => { sql = fs.readFileSync(MIG_PATH, 'utf8'); });

  test('migration exists and is non-trivial', () => {
    expect(sql.length).toBeGreaterThan(500);
  });

  test('drops the open INSERT policy `leads_insert`', () => {
    expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+leads_insert\s+ON\s+public\.leads/i);
  });

  test('revokes all grants from PUBLIC, anon, authenticated', () => {
    expect(sql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.leads\s+FROM\s+PUBLIC/i);
    expect(sql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.leads\s+FROM\s+anon/i);
    expect(sql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.leads\s+FROM\s+authenticated/i);
  });

  test('preserves service_role access', () => {
    expect(sql).toMatch(/GRANT\s+ALL\s+ON\s+TABLE\s+public\.leads\s+TO\s+service_role/i);
  });

  test('does NOT re-create an open INSERT policy', () => {
    // Defensive: no CREATE POLICY that uses WITH CHECK (true) shall ship.
    // Scan only non-comment lines (strip leading -- comments) so the
    // header docstring describing the OLD policy doesn't trip us.
    const codeOnly = sql
      .split('\n')
      .filter(line => !/^\s*--/.test(line))
      .join('\n');
    expect(codeOnly).not.toMatch(/CREATE\s+POLICY\s+leads_insert/i);
    expect(codeOnly).not.toMatch(/WITH\s+CHECK\s*\(\s*true\s*\)/i);
  });

  test('documents the re-enablement path (submit_lead RPC + Turnstile fn)', () => {
    expect(sql).toMatch(/submit_lead/i);
    expect(sql).toMatch(/Turnstile/i);
    expect(sql).toMatch(/check_and_increment_rate_limit/i);
  });
});

describe('src/auth.js — _submitSoftGate cleanup', () => {
  let src;
  beforeAll(() => { src = fs.readFileSync(AUTH_PATH, 'utf8'); });

  test('does NOT call _supa.from("leads").insert()', () => {
    // The pre-fix code did:
    //   await _supa.from('leads').insert({ ... });
    // Post-fix the entire insert call is removed; only the explanatory
    // comment about the migration remains.
    expect(src).not.toMatch(/_supa\.from\(\s*['"]leads['"]\s*\)\.insert/);
  });

  test('comment block explains the lockdown rationale', () => {
    // Sanity check that future maintainers see WHY the insert is gone
    // before reverting it. Look for the migration filename.
    expect(src).toMatch(/20260612_leads_lockdown\.sql/);
  });
});
