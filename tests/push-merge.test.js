'use strict';

const fs = require('fs');
const path = require('path');
const { _mergeDoneJsonPreserve, _findFalseFlipKeys } = require('./push-merge-helpers');

const MIGRATION_PATH = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20260609_push_done_merge_preserve.sql'
);

// ── Scenario 1-3 — stored has true keys, payload omits, server preserves ─
describe('Tier 2 push_student_progress — merge-preserve (scenarios 1-3)', () => {
  test('omitted keys (u1l4, lq_u1l4) survive a stale payload push', () => {
    // Reproduces the production bug: stored has l4 done flags from
    // Device A; Device B pushes without l4 because its local DONE is
    // stale. Pre-Tier-2: l4 lost. Post-Tier-2: l4 preserved.
    const stored  = { u1l4: true, lq_u1l4: true, u1l3: true, lq_u1l3: true };
    const payload = { u1l1: true, u1l3: true, lq_u1l3: true };
    const merged  = _mergeDoneJsonPreserve(stored, payload);
    expect(merged.u1l4).toBe(true);
    expect(merged.lq_u1l4).toBe(true);
    expect(merged.u1l3).toBe(true);
    expect(merged.lq_u1l3).toBe(true);
    expect(merged.u1l1).toBe(true);
  });

  test('payload that exactly matches stored (no omissions) is a no-op', () => {
    const stored  = { u1l4: true, lq_u1l4: true };
    const payload = { u1l4: true, lq_u1l4: true };
    expect(_mergeDoneJsonPreserve(stored, payload)).toEqual(stored);
  });

  test('empty payload preserves all stored keys', () => {
    const stored = { u1l1: true, u1l2: true, u1l3: true, u1l4: true };
    expect(_mergeDoneJsonPreserve(stored, {})).toEqual(stored);
  });
});

// ── Scenario 4-5 — explicit true→false flip is still rejected ─────────
describe('Tier 2 push_student_progress — anti-tamper preserved (scenarios 4-5)', () => {
  test('explicit u1l4: false against stored u1l4: true is flagged', () => {
    // The Tier 2 migration leaves the false-flip guard intact and runs
    // it BEFORE the merge UPDATE — so a tampering payload still raises
    // validation_failed before any merge happens.
    const stored = { u1l4: true, lq_u1l4: true };
    const tampering = { u1l4: false, lq_u1l4: true };
    expect(_findFalseFlipKeys(stored, tampering)).toEqual(['u1l4']);
  });

  test('multiple flips are all detected', () => {
    const stored = { u1l1: true, u1l2: true, u1l4: true };
    const tampering = { u1l1: false, u1l2: 0, u1l4: 'no' };
    expect(_findFalseFlipKeys(stored, tampering).sort()).toEqual(['u1l1', 'u1l2', 'u1l4']);
  });

  test('payload that omits keys does NOT count as a flip (guard skip)', () => {
    // The guard only fires when the payload contains the key. Omitted
    // keys are silently allowed — that's the gap Tier 2 closes via the
    // merge instead. Confirm the guard itself behaves as documented.
    const stored = { u1l4: true };
    const omittedPayload = { u1l1: true };
    expect(_findFalseFlipKeys(stored, omittedPayload)).toEqual([]);
  });

  test('payload that re-affirms the stored true is not a flip', () => {
    const stored = { u1l4: true };
    const reaffirm = { u1l4: true };
    expect(_findFalseFlipKeys(stored, reaffirm)).toEqual([]);
  });

  test('non-true stored entries are not protected (only true keys are guarded)', () => {
    // Documents the semantics: completion = strict true. Other values
    // can be overwritten freely.
    const stored = { u1l4: false, u1l3: 0, u1l2: 'yes' };
    const payload = { u1l4: true, u1l3: true, u1l2: true };
    expect(_findFalseFlipKeys(stored, payload)).toEqual([]);
  });
});

// ── Scenario 6-7 — new completion key added alongside old keys ────────
describe('Tier 2 push_student_progress — new key addition (scenarios 6-7)', () => {
  test('new u1l5 in payload is added; old u1l1-4 preserved', () => {
    const stored  = { u1l1: true, u1l2: true, u1l3: true, u1l4: true };
    const payload = { u1l5: true };
    const merged  = _mergeDoneJsonPreserve(stored, payload);
    expect(merged).toEqual({
      u1l1: true, u1l2: true, u1l3: true, u1l4: true, u1l5: true,
    });
  });

  test('multiple new keys + multiple preserved keys', () => {
    const stored  = { u1l1: true, u1l2: true };
    const payload = { u2l1: true, u2l2: true, u2l3: true };
    const merged  = _mergeDoneJsonPreserve(stored, payload);
    expect(Object.keys(merged).sort()).toEqual(['u1l1', 'u1l2', 'u2l1', 'u2l2', 'u2l3']);
    expect(Object.keys(merged).every(k => merged[k] === true)).toBe(true);
  });
});

// ── Edge cases for the JSONB || mirror ────────────────────────────────
describe('Tier 2 push_student_progress — merge edge cases', () => {
  test('null stored is treated as empty object', () => {
    expect(_mergeDoneJsonPreserve(null, { u1l1: true })).toEqual({ u1l1: true });
  });

  test('null payload preserves stored', () => {
    expect(_mergeDoneJsonPreserve({ u1l4: true }, null)).toEqual({ u1l4: true });
  });

  test('both null returns empty object', () => {
    expect(_mergeDoneJsonPreserve(null, null)).toEqual({});
  });

  test('array stored or payload is rejected as non-object', () => {
    expect(_mergeDoneJsonPreserve([1, 2, 3], { u1l1: true })).toEqual({ u1l1: true });
    expect(_mergeDoneJsonPreserve({ u1l1: true }, [1, 2, 3])).toEqual({ u1l1: true });
  });

  test('payload wins on direct key collision', () => {
    // In production this case is gated by the false-flip guard, but
    // the underlying JSONB || semantics are documented here.
    const merged = _mergeDoneJsonPreserve({ u1l4: false }, { u1l4: true });
    expect(merged.u1l4).toBe(true);
  });

  test('stress: 100 stored keys, payload omits 50, all preserved + 10 new added', () => {
    const stored = {};
    for (let i = 1; i <= 100; i++) {
      stored['lq_u' + Math.ceil(i / 10) + 'l' + ((i - 1) % 10 + 1) + '_' + i] = true;
    }
    const payload = {};
    for (let i = 0; i < 10; i++) payload['newkey_' + i] = true;
    const merged = _mergeDoneJsonPreserve(stored, payload);
    expect(Object.keys(merged).length).toBe(110);
    Object.keys(stored).forEach(k => expect(merged[k]).toBe(true));
    Object.keys(payload).forEach(k => expect(merged[k]).toBe(true));
  });
});

// ── Scenario 8 — quiz_scores INSERT loop unchanged ────────────────────
// ── Scenario 9 — reset_epoch stale rejection unchanged ────────────────
//
// These two scenarios are about code paths NOT touched by the Tier 2
// migration. Rather than ship dead `expect(true).toBe(true)` assertions
// or duplicate the PL/pgSQL logic in JS, the tests below assert against
// the migration text directly — if a future edit accidentally removes
// either guard, the assertion catches it. The DO-block at the bottom of
// the migration itself provides the live SQL-level invariant check at
// apply time.
describe('Tier 2 push_student_progress — migration text contract (scenarios 8-9)', () => {
  let migrationText;

  beforeAll(() => {
    migrationText = fs.readFileSync(MIGRATION_PATH, 'utf8');
  });

  test('migration file exists at expected path', () => {
    expect(migrationText.length).toBeGreaterThan(0);
  });

  test('migration body contains the JSONB || merge-preserve expression', () => {
    expect(migrationText).toMatch(/COALESCE\(v_stored\.done_json,\s*'\{\}'::jsonb\)\s*\|\|\s*COALESCE\(p_done_json,\s*'\{\}'::jsonb\)/);
  });

  test('migration preserves quiz_scores append-INSERT loop (scenario 8)', () => {
    expect(migrationText).toMatch(/INSERT INTO quiz_scores/);
    expect(migrationText).toMatch(/local_id/);
    expect(migrationText).toMatch(/NOT EXISTS\s*\(\s*SELECT 1 FROM quiz_scores/);
  });

  test('migration preserves reset_epoch stale-cache rejection (scenario 9)', () => {
    expect(migrationText).toMatch(/stale_reset_epoch/);
    expect(migrationText).toMatch(/p_reset_epoch\s*>\s*0/);
    expect(migrationText).toMatch(/v_server_epoch\s*>\s*p_reset_epoch/);
  });

  test('migration preserves existing anti-tamper false-flip guard', () => {
    expect(migrationText).toMatch(/done flag flipped back to false/);
  });

  test('migration preserves _validate_pin_session call (auth gate)', () => {
    expect(migrationText).toMatch(/PERFORM _validate_pin_session\(p_student_id, p_session_token\)/);
  });

  test('migration function signature is unchanged (15 params)', () => {
    expect(migrationText).toMatch(/CREATE OR REPLACE FUNCTION public\.push_student_progress\(/);
    expect(migrationText).toMatch(/p_reset_epoch\s+bigint\s+DEFAULT 0/);
    expect(migrationText).toMatch(/p_activity_json\s+jsonb\s+DEFAULT/);
  });

  test('migration includes self-verifying DO block', () => {
    expect(migrationText).toMatch(/DO \$verify\$/);
    expect(migrationText).toMatch(/merge-preserve invariant/);
    expect(migrationText).toMatch(/all merge-preserve invariants verified/);
  });
});
