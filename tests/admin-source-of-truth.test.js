// tests/admin-source-of-truth.test.js
//
// Verifies that `_verifyAdmin` in netlify/functions/analytics-query.js
// queries the new admin_users table (not profiles.role) and only returns
// true when the lookup returns at least one matching row.
//
// Migration 20260601_admin_source_of_truth.sql moves the admin source of
// truth off profiles.role onto a service-role-only admin_users table.
// This unit test mocks fetch and asserts the Netlify function is updated
// to match that new contract.
//
// DB-level verification (the trigger blocking role self-promotion and the
// is_admin() helper) lives in the migration as inline manual SQL queries
// to be run after the migration is applied — it requires a live Supabase
// project and an authenticated test user, which we don't have in CI.

const path = require('path');

const FN_PATH = path.resolve(__dirname, '..', 'netlify', 'functions', 'analytics-query.js');

// Each test installs its own global.fetch mock and resets module cache.
describe('_verifyAdmin uses admin_users (not profiles.role)', () => {
  let originalFetch;
  let mod;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.resetModules();
    mod = require(FN_PATH);
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('rejects when there is no Authorization header', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => { calls++; return { ok: false }; });
    const ok = await mod._verifyAdmin('', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
    expect(calls).toBe(0);
  });

  test('rejects when the Authorization header is malformed', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => { calls++; return { ok: false }; });
    const ok = await mod._verifyAdmin('Token abc', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
    expect(calls).toBe(0);
  });

  test('rejects when /auth/v1/user fails (bad JWT)', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));
    const ok = await mod._verifyAdmin('Bearer bad-jwt', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
  });

  test('queries admin_users (NOT profiles.role) and returns true on hit', async () => {
    const seen = [];
    global.fetch = jest.fn(async (url, opts) => {
      seen.push({ url, opts });
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({ id: 'u-1' }) };
      }
      // The second call must hit admin_users — NOT profiles.
      if (url.includes('/rest/v1/admin_users?')) {
        return { ok: true, json: async () => ([{ user_id: 'u-1' }]) };
      }
      throw new Error(`unexpected fetch URL: ${url}`);
    });
    const ok = await mod._verifyAdmin('Bearer good-jwt', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(true);
    // Sanity: no profiles?role= lookup happened.
    const profilesCalls = seen.filter(s => s.url.includes('/rest/v1/profiles'));
    expect(profilesCalls.length).toBe(0);
    // And the admin_users URL filters on user_id=eq.<uuid>.
    const adminCall = seen.find(s => s.url.includes('/rest/v1/admin_users?'));
    expect(adminCall.url).toContain('user_id=eq.u-1');
  });

  test('returns false when admin_users lookup returns empty array', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({ id: 'u-1' }) };
      }
      if (url.includes('/rest/v1/admin_users?')) {
        return { ok: true, json: async () => ([]) };
      }
      throw new Error(`unexpected fetch URL: ${url}`);
    });
    const ok = await mod._verifyAdmin('Bearer good-jwt', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
  });

  test('returns false when admin_users lookup returns non-OK', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({ id: 'u-1' }) };
      }
      if (url.includes('/rest/v1/admin_users?')) {
        return { ok: false };
      }
      throw new Error(`unexpected fetch URL: ${url}`);
    });
    const ok = await mod._verifyAdmin('Bearer good-jwt', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
  });

  test('returns false when /auth/v1/user response has no id', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({}) };
      }
      throw new Error(`unexpected fetch URL: ${url}`);
    });
    const ok = await mod._verifyAdmin('Bearer good-jwt', 'https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
  });
});
