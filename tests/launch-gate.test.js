'use strict';

// =============================================================================
//  Launch Gate — controlled beta signup
//
//  Server-enforced launch controls. The Netlify function `signup-gate.js` is
//  the ONLY path that creates parent accounts. It:
//    1. validates the request (email, password, displayName, captchaToken)
//    2. verifies Turnstile via Cloudflare siteverify
//    3. checks launch_settings (signup_enabled + max_parent_accounts)
//    4. calls auth.admin.createUser (which sends the confirmation email)
//
//  Direct browser supabase.auth.signUp() is blocked at the Supabase Auth
//  layer (Dashboard → "Allow new users to sign up" OFF). Even if a user
//  bypasses the UI, they can't create an account without going through
//  this function.
//
//  Pure helpers tested here. End-to-end account creation is verified in
//  production via the browser flow.
// =============================================================================

const path = require('path');
const fs   = require('fs');

// ── signup-gate helpers ──────────────────────────────────────────────────────
const {
  _normalizeEmail,
  _validateSignupRequest,
  _parseTurnstileResponse,
} = require('../netlify/functions/signup-gate.js');

// ── analytics-query.js extension (admin launch settings update) ─────────────
const { _parseLaunchSettingsUpdate } = require('../netlify/functions/analytics-query.js');

describe('_normalizeEmail', () => {
  test('lowercases and trims', () => {
    expect(_normalizeEmail('  Foo@BAR.com  ')).toBe('foo@bar.com');
  });

  test('returns null for non-string', () => {
    expect(_normalizeEmail(null)).toBeNull();
    expect(_normalizeEmail(undefined)).toBeNull();
    expect(_normalizeEmail(123)).toBeNull();
    expect(_normalizeEmail({})).toBeNull();
  });

  test('returns null for empty / whitespace-only', () => {
    expect(_normalizeEmail('')).toBeNull();
    expect(_normalizeEmail('   ')).toBeNull();
  });

  test('returns null for malformed addresses', () => {
    expect(_normalizeEmail('no-at-sign')).toBeNull();
    expect(_normalizeEmail('@example.com')).toBeNull();
    expect(_normalizeEmail('foo@')).toBeNull();
    expect(_normalizeEmail('foo@bar')).toBeNull();  // no TLD
    expect(_normalizeEmail('foo @bar.com')).toBeNull();
  });

  test('accepts common valid addresses', () => {
    expect(_normalizeEmail('user@example.com')).toBe('user@example.com');
    expect(_normalizeEmail('first.last+tag@sub.example.co.uk')).toBe('first.last+tag@sub.example.co.uk');
  });

  test('caps absurd lengths', () => {
    const huge = 'a'.repeat(300) + '@example.com';
    expect(_normalizeEmail(huge)).toBeNull();
  });
});

describe('_validateSignupRequest', () => {
  const okBody = {
    email:         'parent@example.com',
    password:      'secret1234',
    displayName:   'Parent',
    captchaToken:  'tok_abc',
  };

  test('accepts a complete valid request', () => {
    const r = _validateSignupRequest(okBody);
    expect(r.ok).toBe(true);
    expect(r.email).toBe('parent@example.com');
    expect(r.password).toBe('secret1234');
    expect(r.displayName).toBe('Parent');
    expect(r.captchaToken).toBe('tok_abc');
  });

  test('rejects missing or invalid email', () => {
    expect(_validateSignupRequest({ ...okBody, email: '' }).ok).toBe(false);
    expect(_validateSignupRequest({ ...okBody, email: 'not-an-email' }).ok).toBe(false);
    expect(_validateSignupRequest({ ...okBody, email: null }).ok).toBe(false);
  });

  test('rejects short or missing password', () => {
    expect(_validateSignupRequest({ ...okBody, password: 'short' }).ok).toBe(false);
    expect(_validateSignupRequest({ ...okBody, password: '' }).ok).toBe(false);
    expect(_validateSignupRequest({ ...okBody, password: null }).ok).toBe(false);
  });

  test('rejects missing captchaToken', () => {
    expect(_validateSignupRequest({ ...okBody, captchaToken: '' }).ok).toBe(false);
    expect(_validateSignupRequest({ ...okBody, captchaToken: null }).ok).toBe(false);
  });

  test('defaults displayName when blank', () => {
    const r = _validateSignupRequest({ ...okBody, displayName: '   ' });
    expect(r.ok).toBe(true);
    expect(r.displayName).toBe('Parent');
  });

  test('truncates excessively long displayName', () => {
    const r = _validateSignupRequest({ ...okBody, displayName: 'A'.repeat(200) });
    expect(r.ok).toBe(true);
    expect(r.displayName.length).toBeLessThanOrEqual(30);
  });

  test('rejects non-object body safely', () => {
    expect(_validateSignupRequest(null).ok).toBe(false);
    expect(_validateSignupRequest('string').ok).toBe(false);
    expect(_validateSignupRequest([]).ok).toBe(false);
  });
});

describe('_parseTurnstileResponse', () => {
  test('treats success:true as valid', () => {
    expect(_parseTurnstileResponse({ success: true, hostname: 'mymathroots.com' })).toBe(true);
  });

  test('treats success:false as invalid', () => {
    expect(_parseTurnstileResponse({ success: false, 'error-codes': ['invalid-input-response'] })).toBe(false);
  });

  test('rejects malformed responses', () => {
    expect(_parseTurnstileResponse(null)).toBe(false);
    expect(_parseTurnstileResponse(undefined)).toBe(false);
    expect(_parseTurnstileResponse({})).toBe(false);
    expect(_parseTurnstileResponse('ok')).toBe(false);
  });
});

describe('_parseLaunchSettingsUpdate (admin input validation)', () => {
  test('accepts a fully-valid payload', () => {
    const r = _parseLaunchSettingsUpdate({
      signup_enabled:           true,
      max_parent_accounts:      100,
      max_students_per_parent:  3,
      waitlist_enabled:         true,
    });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({
      signup_enabled:          true,
      max_parent_accounts:     100,
      max_students_per_parent: 3,
      waitlist_enabled:        true,
    });
  });

  test('coerces stringified numbers and booleans', () => {
    const r = _parseLaunchSettingsUpdate({
      signup_enabled:           'true',
      max_parent_accounts:      '25',
      max_students_per_parent:  '2',
      waitlist_enabled:         'false',
    });
    expect(r.ok).toBe(true);
    expect(r.value.signup_enabled).toBe(true);
    expect(r.value.max_parent_accounts).toBe(25);
    expect(r.value.max_students_per_parent).toBe(2);
    expect(r.value.waitlist_enabled).toBe(false);
  });

  test('rejects non-positive parent cap', () => {
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: 0,  max_students_per_parent: 2 }).ok).toBe(false);
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: -1, max_students_per_parent: 2 }).ok).toBe(false);
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: 1.5, max_students_per_parent: 2 }).ok).toBe(false);
  });

  test('rejects unsafely large parent cap', () => {
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: 1000000, max_students_per_parent: 2 }).ok).toBe(false);
  });

  test('rejects non-positive student-per-parent limit', () => {
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: 50, max_students_per_parent: 0  }).ok).toBe(false);
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: 50, max_students_per_parent: -1 }).ok).toBe(false);
  });

  test('rejects unsafely large student-per-parent limit', () => {
    expect(_parseLaunchSettingsUpdate({ max_parent_accounts: 50, max_students_per_parent: 100 }).ok).toBe(false);
  });

  test('rejects non-string / non-bool flags', () => {
    expect(_parseLaunchSettingsUpdate({ signup_enabled: 'maybe', max_parent_accounts: 50, max_students_per_parent: 2 }).ok).toBe(false);
    expect(_parseLaunchSettingsUpdate({ signup_enabled: null,    max_parent_accounts: 50, max_students_per_parent: 2 }).ok).toBe(false);
  });

  test('rejects null / non-object input safely', () => {
    expect(_parseLaunchSettingsUpdate(null).ok).toBe(false);
    expect(_parseLaunchSettingsUpdate(undefined).ok).toBe(false);
    expect(_parseLaunchSettingsUpdate('').ok).toBe(false);
  });
});

describe('METRIC_TO_RPC — launch metrics', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'netlify', 'functions', 'analytics-query.js'),
    'utf8',
  );

  test.each([
    ['launch_status',    'get_launch_status'],
    ['launch_dashboard', 'admin_get_launch_dashboard'],
  ])('metric %s is mapped to RPC %s', (metric, rpc) => {
    expect(src).toMatch(new RegExp("['\"]?" + metric + "['\"]?\\s*:\\s*['\"]" + rpc + "['\"]"));
  });
});

describe('Existing helpers unchanged', () => {
  const { _parseAnalyticsFilters, _parseBreakdown } = require('../netlify/functions/analytics-query.js');
  test('_parseAnalyticsFilters still returns defaults', () => {
    const r = _parseAnalyticsFilters({});
    expect(r.p_days).toBe(30);
    expect(r.p_grade).toBeNull();
  });
  test('_parseBreakdown still defaults to lesson', () => {
    expect(_parseBreakdown(undefined)).toBe('lesson');
  });
});
