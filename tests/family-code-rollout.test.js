'use strict';

// Contract tests for the 8-digit family-code rollout
// (supabase/migrations/20260610_family_code_8_digit.sql + matching
// frontend changes in src/auth.js and src/dashboard.js).
//
// Pure file-scanning assertions — does not require a live DB or DOM.
// If a future edit removes any of the listed components, jest fails
// with a specific message pointing at the missing pattern.

const fs = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const MIGRATION  = path.join(ROOT, 'supabase', 'migrations', '20260610_family_code_8_digit.sql');
const AUTH_JS    = path.join(ROOT, 'src', 'auth.js');
const DASH_JS    = path.join(ROOT, 'src', 'dashboard.js');

describe('Family-code 8-digit migration — text contract', () => {
  let sql;
  beforeAll(() => { sql = fs.readFileSync(MIGRATION, 'utf8'); });

  test('migration file exists and is non-empty', () => {
    expect(sql.length).toBeGreaterThan(0);
  });

  test('creates the private _generate_family_code helper', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\._generate_family_code\(\)/);
  });

  test('helper uses cryptographic gen_random_bytes for entropy', () => {
    expect(sql).toMatch(/gen_random_bytes\(4\)/);
  });

  test('helper formats output as MMR- + 8 zero-padded digits', () => {
    expect(sql).toMatch(/'MMR-'\s*\|\|\s*lpad\(\s*\(.*100000000.*\)::text\s*,\s*8\s*,\s*'0'\s*\)/);
  });

  test('helper revoked from anon/authenticated, granted only to service_role', () => {
    expect(sql).toMatch(/REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\._generate_family_code\(\)\s+FROM\s+PUBLIC,\s*anon,\s*authenticated/);
    expect(sql).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\._generate_family_code\(\)\s+TO\s+service_role/);
  });

  test('ensure_family_code is replaced and calls _generate_family_code', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.ensure_family_code\(p_parent_id UUID\)/);
    // Match the body's call to the helper (the auth.uid() gate is intact upstream).
    const slice = sql.slice(sql.indexOf('ensure_family_code(p_parent_id UUID)'));
    expect(slice).toMatch(/v_code\s*:=\s*public\._generate_family_code\(\)/);
    expect(slice).toMatch(/auth\.uid\(\)/);
  });

  test('create_student_profile is replaced and calls _generate_family_code', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.create_student_profile\(/);
    const slice = sql.slice(sql.indexOf('create_student_profile('));
    expect(slice).toMatch(/v_family\s*:=\s*public\._generate_family_code\(\)/);
  });

  test('rotation DO-block updates non-compliant existing codes', () => {
    expect(sql).toMatch(/DO \$rotate\$/);
    expect(sql).toMatch(/family_code\s+IS NOT NULL\s+AND\s+family_code\s+!~\s+'\^MMR-\[0-9\]\{8\}\$'/);
    expect(sql).toMatch(/UPDATE public\.profiles[\s\S]*SET family_code = v_new/);
  });

  test('data-verification DO-block aborts if any non-compliant code survives', () => {
    expect(sql).toMatch(/DO \$verify_data\$/);
    expect(sql).toMatch(/non-compliant codes remain/);
  });

  test('generator-verification DO-block asserts ^MMR-\\[0-9\\]\\{8\\}\\$', () => {
    expect(sql).toMatch(/DO \$verify_gen\$/);
    expect(sql).toMatch(/!~\s+'\^MMR-\[0-9\]\{8\}\$'/);
  });
});

describe('Family-code 8-digit frontend — auth.js contract', () => {
  let src;
  beforeAll(() => { src = fs.readFileSync(AUTH_JS, 'utf8'); });

  test('regex is /^MMR-[0-9]{8}$/i (digits only, no hex/alphanumeric)', () => {
    expect(src).toMatch(/\/\^MMR-\[0-9\]\{8\}\$\/i/);
    // The legacy mixed regex should be gone.
    expect(src).not.toMatch(/\[A-Z0-9\]\{4\}\|\[A-Z0-9\]\{8\}/);
  });

  test('_normalizeFamilyCode helper is defined', () => {
    expect(src).toMatch(/function\s+_normalizeFamilyCode\s*\(\s*input\s*\)/);
  });

  test('family-code input is numeric-only with 8-char maxlength', () => {
    expect(src).toContain('placeholder="12345678"');
    expect(src).toContain('maxlength="8"');
    expect(src).toContain('inputmode="numeric"');
    expect(src).toContain('type="tel"');
    expect(src).toContain('id="ls-family-code-prefix"');
    // Legacy attributes should be absent.
    expect(src).not.toContain('placeholder="MMR-00000000"');
    expect(src).not.toContain('placeholder="MMR-0000"');
    expect(src).not.toContain('maxlength="12"');
  });

  test('_lsFamilyCodeSetup uses _normalizeFamilyCode before RPC', () => {
    // Verify the normalize call appears in the same function as the RPC call.
    const setupIdx = src.indexOf('function _lsFamilyCodeSetup');
    expect(setupIdx).toBeGreaterThan(-1);
    const slice = src.slice(setupIdx, setupIdx + 2000);
    expect(slice).toMatch(/_normalizeFamilyCode\(\s*inp\.value\s*\)/);
    expect(slice).toMatch(/get_profiles_by_family_code/);
  });

  test('onboarding step-2 fallback uses 8-digit MMR-???????? placeholder', () => {
    expect(src).toContain("'MMR-????????'");
    expect(src).not.toContain("'MMR-????'");
  });
});

describe('Family-code 8-digit frontend — dashboard.js Copy button', () => {
  let src;
  beforeAll(() => { src = fs.readFileSync(DASH_JS, 'utf8'); });

  test('display HTML includes "Copy Code" button wired to _dbCopyFamilyCode', () => {
    expect(src).toMatch(/data-action="_dbCopyFamilyCode"/);
    expect(src).toContain('Copy Code');
  });

  test('display HTML includes the Copied confirmation element', () => {
    expect(src).toContain('id="db-family-code-copied"');
    // Should start hidden — display none — so it can be toggled on click.
    expect(src).toMatch(/id="db-family-code-copied"[^>]*display:\s*none/);
  });

  test('_dbCopyFamilyCode strips the MMR- prefix before copying', () => {
    const idx = src.indexOf('function _dbCopyFamilyCode');
    expect(idx).toBeGreaterThan(-1);
    const slice = src.slice(idx, idx + 1500);
    expect(slice).toMatch(/\.replace\(\/\^MMR-\/i\s*,\s*''\)/);
  });

  test('_dbCopyFamilyCode uses navigator.clipboard with fallback', () => {
    const idx = src.indexOf('function _dbCopyFamilyCode');
    const slice = src.slice(idx, idx + 1500);
    expect(slice).toMatch(/navigator\.clipboard\.writeText/);
    expect(slice).toMatch(/_copyFallback/);
  });

  test('_dbCopyFamilyCode is registered in _DB_ACTIONS', () => {
    expect(src).toMatch(/_dbCopyFamilyCode:\s*function\(\)\s*\{\s*_dbCopyFamilyCode\(\)/);
  });
});
