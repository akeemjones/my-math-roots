'use strict';

// student-auth helpers are pure functions exported for testing.
// They live in src/auth.js but are also mirrored in a test-only export shim.
// We use a minimal CommonJS shim rather than trying to require the full browser bundle.

const { _validateFamilyCode, _normalizeFamilyCode, _buildAvatarHtml, _buildStudentCardHtml } = require('./student-auth-helpers');

// ── _validateFamilyCode (canonical: MMR-XXXXXXXX, 8 numeric digits) ─────
// Standardized in supabase/migrations/20260610_family_code_8_digit.sql.
// No alphanumeric/hex support; rotated codes always match ^MMR-[0-9]{8}$.
describe('_validateFamilyCode', () => {
  test('accepts canonical MMR-XXXXXXXX (8 numeric digits, uppercase)', () => {
    expect(_validateFamilyCode('MMR-12345678')).toBe(true);
    expect(_validateFamilyCode('MMR-00000000')).toBe(true);
    expect(_validateFamilyCode('MMR-99999999')).toBe(true);
  });

  test('accepts lowercase prefix (case-insensitive on MMR-)', () => {
    expect(_validateFamilyCode('mmr-12345678')).toBe(true);
    expect(_validateFamilyCode('MmR-12345678')).toBe(true);
  });

  test('rejects wrong prefix', () => {
    expect(_validateFamilyCode('ABC-12345678')).toBe(false);
    expect(_validateFamilyCode('MMR12345678')).toBe(false);
    expect(_validateFamilyCode('12345678')).toBe(false);
  });

  test('rejects letters in suffix (no hex/alphanumeric)', () => {
    expect(_validateFamilyCode('MMR-A1B2C3D4')).toBe(false);
    expect(_validateFamilyCode('MMR-1234567A')).toBe(false);
    expect(_validateFamilyCode('MMR-ZZZZZZZZ')).toBe(false);
  });

  test('rejects legacy 4-character codes (rotated by 20260610 migration)', () => {
    expect(_validateFamilyCode('MMR-4829')).toBe(false);
    expect(_validateFamilyCode('MMR-0000')).toBe(false);
    expect(_validateFamilyCode('MMR-AB12')).toBe(false);
  });

  test('rejects 7 or fewer digits', () => {
    expect(_validateFamilyCode('MMR-1234567')).toBe(false);
    expect(_validateFamilyCode('MMR-123456')).toBe(false);
    expect(_validateFamilyCode('MMR-12345')).toBe(false);
    expect(_validateFamilyCode('MMR-')).toBe(false);
  });

  test('rejects 9 or more digits', () => {
    expect(_validateFamilyCode('MMR-123456789')).toBe(false);
    expect(_validateFamilyCode('MMR-1234567890')).toBe(false);
  });

  test('rejects special chars in suffix', () => {
    expect(_validateFamilyCode('MMR-1234 678')).toBe(false);
    expect(_validateFamilyCode('MMR-1234-678')).toBe(false);
    expect(_validateFamilyCode('MMR-12345.78')).toBe(false);
  });

  test('rejects null and empty', () => {
    expect(_validateFamilyCode(null)).toBe(false);
    expect(_validateFamilyCode('')).toBe(false);
    expect(_validateFamilyCode(undefined)).toBe(false);
  });
});

// ── _normalizeFamilyCode (input → canonical MMR-XXXXXXXX) ───────────────
describe('_normalizeFamilyCode', () => {
  test('accepts suffix-only 8 digits → canonical', () => {
    expect(_normalizeFamilyCode('12345678')).toBe('MMR-12345678');
    expect(_normalizeFamilyCode('00000000')).toBe('MMR-00000000');
  });

  test('accepts full canonical input → unchanged', () => {
    expect(_normalizeFamilyCode('MMR-12345678')).toBe('MMR-12345678');
  });

  test('lowercase MMR- input normalizes to uppercase', () => {
    expect(_normalizeFamilyCode('mmr-12345678')).toBe('MMR-12345678');
    expect(_normalizeFamilyCode('MmR-12345678')).toBe('MMR-12345678');
  });

  test('trims surrounding whitespace', () => {
    expect(_normalizeFamilyCode('  12345678  ')).toBe('MMR-12345678');
    expect(_normalizeFamilyCode('\tMMR-12345678\n')).toBe('MMR-12345678');
  });

  test('strips internal spaces and dashes', () => {
    expect(_normalizeFamilyCode('1234 5678')).toBe('MMR-12345678');
    expect(_normalizeFamilyCode('12-34-56-78')).toBe('MMR-12345678');
    expect(_normalizeFamilyCode('MMR-12-34-56-78')).toBe('MMR-12345678');
  });

  test('rejects too few digits', () => {
    expect(_normalizeFamilyCode('1234567')).toBeNull();
    expect(_normalizeFamilyCode('MMR-1234567')).toBeNull();
    expect(_normalizeFamilyCode('')).toBeNull();
  });

  test('rejects too many digits', () => {
    expect(_normalizeFamilyCode('123456789')).toBeNull();
    expect(_normalizeFamilyCode('MMR-123456789')).toBeNull();
  });

  test('rejects letters (no hex/alphanumeric)', () => {
    expect(_normalizeFamilyCode('A1B2C3D4')).toBeNull();
    expect(_normalizeFamilyCode('MMR-A1B2C3D4')).toBeNull();
    expect(_normalizeFamilyCode('1234567X')).toBeNull();
  });

  test('rejects legacy 4-character codes', () => {
    expect(_normalizeFamilyCode('MMR-4829')).toBeNull();
    expect(_normalizeFamilyCode('4829')).toBeNull();
  });

  test('returns null for null/undefined/non-string inputs', () => {
    expect(_normalizeFamilyCode(null)).toBeNull();
    expect(_normalizeFamilyCode(undefined)).toBeNull();
  });
});

// ── _buildAvatarHtml ──────────────────────────────────────────────────────
describe('_buildAvatarHtml', () => {
  const profiles = [
    { id: 'p1', display_name: 'Cameron', avatar_emoji: '🦁', avatar_color_from: '#f59e0b', avatar_color_to: '#f97316' },
    { id: 'p2', display_name: 'Maya',    avatar_emoji: '🦋', avatar_color_from: '#8b5cf6', avatar_color_to: '#ec4899' },
  ];

  test('renders one circle per profile', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    expect((html.match(/ls-avatar-item/g) || []).length).toBe(2);
  });

  test('selected avatar has ls-avatar-selected class', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    expect(html).toContain('data-id="p1"');
    expect(html).toMatch(/ls-avatar-item[^"]*ls-avatar-selected/);
  });

  test('unselected avatar does NOT have ls-avatar-selected class', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    // p2 should not have selected class
    const p2Match = html.match(/data-id="p2"[^>]*/);
    expect(p2Match).not.toBeNull();
    expect(p2Match[0]).not.toContain('ls-avatar-selected');
  });

  test('includes data-action="_lsSelectAvatar" on each item', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    expect((html.match(/data-action="_lsSelectAvatar"/g) || []).length).toBe(2);
  });

  test('escapes XSS in display_name', () => {
    const evil = [{ id: 'x1', display_name: '<script>alert(1)</script>', avatar_emoji: '🦁', avatar_color_from: '#f59e0b', avatar_color_to: '#f97316' }];
    expect(_buildAvatarHtml(evil, 'x1')).not.toContain('<script>');
  });

  test('returns empty string for empty profiles array', () => {
    expect(_buildAvatarHtml([], null)).toBe('');
  });
});

// ── _buildStudentCardHtml ─────────────────────────────────────────────────
describe('_buildStudentCardHtml', () => {
  const profiles = [
    { id: 'p1', display_name: 'Cameron', avatar_emoji: '🦁', avatar_color_from: '#f59e0b', avatar_color_to: '#f97316' },
  ];

  test('State A: renders family code input when profiles is empty', () => {
    const html = _buildStudentCardHtml([], null, []);
    expect(html).toContain('ls-family-code-inp');
    expect(html).toContain('_lsFamilyCodeSetup');
    expect(html).not.toContain('ls-pin-keypad');
  });

  test('State A: renders family code input when profiles is null', () => {
    const html = _buildStudentCardHtml(null, null, []);
    expect(html).toContain('ls-family-code-inp');
  });

  test('State A: shows MMR- as a fixed visual prefix beside the input', () => {
    const html = _buildStudentCardHtml([], null, []);
    expect(html).toContain('id="ls-family-code-prefix"');
    // The visible "MMR-" label sits adjacent to the editable input.
    expect(html).toMatch(/id="ls-family-code-prefix"[^>]*>\s*MMR-/);
  });

  test('State A: input is numeric-only with 8-digit limit + placeholder "12345678"', () => {
    const html = _buildStudentCardHtml([], null, []);
    expect(html).toContain('placeholder="12345678"');
    expect(html).toContain('maxlength="8"');
    expect(html).toContain('inputmode="numeric"');
    expect(html).toContain('type="tel"');
    expect(html).toContain('pattern="[0-9]*"');
    // Legacy placeholders should be gone.
    expect(html).not.toContain('placeholder="MMR-0000"');
    expect(html).not.toContain('placeholder="MMR-00000000"');
    expect(html).not.toContain('maxlength="12"');
  });

  test('State B: renders avatar row when profiles has entries', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    expect(html).toContain('ls-avatar-row');
    expect(html).toContain('ls-pin-keypad');
  });

  test('State B: renders PIN dots equal to buffer length (filled)', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', ['1', '2']);
    // 2 filled dots (ls-pin-dot-filled) + 2 empty
    expect((html.match(/ls-pin-dot-filled/g) || []).length).toBe(2);
    expect((html.match(/ls-pin-dot-empty/g) || []).length).toBe(2);
  });

  test('State B: shows selected profile name in PIN label', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    expect(html).toContain("Cameron");
  });

  test('State B: "Enter family code" link appears in State B', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    expect(html).toContain('_lsClearFamilyCache');
  });

  test('keypad has 10 digit buttons + backspace', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    // 10 digit buttons (0-9)
    expect((html.match(/data-action="_lsPinKey"/g) || []).length).toBe(10);
    // 1 backspace
    expect(html).toContain('_lsPinBackspace');
  });
});
