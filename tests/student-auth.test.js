'use strict';

// student-auth helpers are pure functions exported for testing.
// They live in src/auth.js but are also mirrored in a test-only export shim.
// We use a minimal CommonJS shim rather than trying to require the full browser bundle.

const { _validateFamilyCode, _buildAvatarHtml, _buildStudentCardHtml } = require('./student-auth-helpers');

// ── _validateFamilyCode ───────────────────────────────────────────────────
describe('_validateFamilyCode', () => {
  test('accepts MMR-XXXX format (uppercase)', () => {
    expect(_validateFamilyCode('MMR-4829')).toBe(true);
    expect(_validateFamilyCode('MMR-AB12')).toBe(true);
    expect(_validateFamilyCode('MMR-0000')).toBe(true);
  });

  test('accepts lowercase input (case-insensitive)', () => {
    expect(_validateFamilyCode('mmr-4829')).toBe(true);
    expect(_validateFamilyCode('mmr-ab12')).toBe(true);
  });

  test('rejects wrong prefix', () => {
    expect(_validateFamilyCode('ABC-4829')).toBe(false);
    expect(_validateFamilyCode('MMR4829')).toBe(false);
  });

  test('rejects wrong suffix length', () => {
    expect(_validateFamilyCode('MMR-123')).toBe(false);
    expect(_validateFamilyCode('MMR-12345')).toBe(false);
  });

  test('rejects special chars in suffix', () => {
    expect(_validateFamilyCode('MMR-48 9')).toBe(false);
    expect(_validateFamilyCode('MMR-48-9')).toBe(false);
  });

  test('rejects null and empty', () => {
    expect(_validateFamilyCode(null)).toBe(false);
    expect(_validateFamilyCode('')).toBe(false);
    expect(_validateFamilyCode(undefined)).toBe(false);
  });

  // ── 8-char family codes (current backend output since
  //    20260603_rpc_ownership_lockdown.sql) ────────────────────────────────
  test('accepts MMR-XXXXXXXX format (uppercase, 8-char)', () => {
    expect(_validateFamilyCode('MMR-A1B2C3D4')).toBe(true);
    expect(_validateFamilyCode('MMR-00000000')).toBe(true);
    expect(_validateFamilyCode('MMR-ZZZZ9999')).toBe(true);
  });

  test('normalizes lowercase 8-char input (case-insensitive)', () => {
    expect(_validateFamilyCode('mmr-a1b2c3d4')).toBe(true);
    expect(_validateFamilyCode('MmR-A1b2C3d4')).toBe(true);
  });

  test('rejects in-between suffix lengths (5, 6, 7 chars)', () => {
    expect(_validateFamilyCode('MMR-12345')).toBe(false);
    expect(_validateFamilyCode('MMR-123456')).toBe(false);
    expect(_validateFamilyCode('MMR-1234567')).toBe(false);
  });

  test('rejects 9+ char suffix', () => {
    expect(_validateFamilyCode('MMR-A1B2C3D4E')).toBe(false);
    expect(_validateFamilyCode('MMR-123456789')).toBe(false);
  });

  // Production has 1 seed profile with a 4-char family_code. Keep this
  // backwards-compat path until that row is rotated or confirmed absent.
  test('retains backwards compat for legacy 4-char codes', () => {
    expect(_validateFamilyCode('MMR-4829')).toBe(true);
    expect(_validateFamilyCode('mmr-ab12')).toBe(true);
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
