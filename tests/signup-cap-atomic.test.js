// tests/signup-cap-atomic.test.js
//
// Unit tests for the atomic signup-cap reservation flow added in
// migration 20260604_signup_cap_atomic.sql + the signup-gate.js update.
//
// The migration provides:
//   public.try_reserve_signup_slot()  RETURNS boolean
//   public.release_signup_slot()      RETURNS void
//   public.reconcile_signup_counter() RETURNS (counter, profiles, drift)
//
// signup-gate.js now:
//   1. Calls try_reserve_signup_slot before _adminCreateUser.
//   2. On _adminCreateUser failure, calls release_signup_slot.
//   3. NO LONGER does HEAD /profiles count then in-app comparison.
//
// These tests verify the JS contract by mocking fetch. The DB-level
// concurrency proof (the atomic UPDATE ... WHERE parent_count < cap)
// is documented as a manual SQL verification in the migration; running
// it from CI would require a live Supabase instance.

const path = require('path');

const FN_PATH = path.resolve(__dirname, '..', 'netlify', 'functions', 'signup-gate.js');

describe('signup-gate atomic slot reservation', () => {
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

  test('_tryReserveSignupSlot returns true when the RPC returns true (slot reserved)', async () => {
    global.fetch = jest.fn(async (url, opts) => {
      expect(url).toContain('/rest/v1/rpc/try_reserve_signup_slot');
      expect(opts.method).toBe('POST');
      // Body must be valid JSON; RPC takes no args.
      expect(opts.body).toBe('{}');
      return { ok: true, json: async () => true };
    });
    const ok = await mod._tryReserveSignupSlot('https://x.supabase.co', 'svc');
    expect(ok).toBe(true);
  });

  test('_tryReserveSignupSlot returns false when the RPC returns false (cap reached)', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => false }));
    const ok = await mod._tryReserveSignupSlot('https://x.supabase.co', 'svc');
    expect(ok).toBe(false);
  });

  test('_tryReserveSignupSlot returns null when the RPC errors (surfaces as 500)', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));
    const ok = await mod._tryReserveSignupSlot('https://x.supabase.co', 'svc');
    expect(ok).toBe(null);
  });

  test('_tryReserveSignupSlot returns null when fetch throws (network failure)', async () => {
    global.fetch = jest.fn(async () => { throw new Error('net'); });
    const ok = await mod._tryReserveSignupSlot('https://x.supabase.co', 'svc');
    expect(ok).toBe(null);
  });

  test('_releaseSignupSlot calls the release RPC even on a fail-and-forget basis', async () => {
    let called = false;
    global.fetch = jest.fn(async (url, opts) => {
      called = true;
      expect(url).toContain('/rest/v1/rpc/release_signup_slot');
      expect(opts.method).toBe('POST');
      expect(opts.body).toBe('{}');
      return { ok: false };
    });
    // Should not throw even though the fetch returns !ok or rejects.
    await expect(mod._releaseSignupSlot('https://x.supabase.co', 'svc')).resolves.toBeUndefined();
    expect(called).toBe(true);
  });

  test('_releaseSignupSlot swallows fetch errors', async () => {
    global.fetch = jest.fn(async () => { throw new Error('net'); });
    await expect(mod._releaseSignupSlot('https://x.supabase.co', 'svc')).resolves.toBeUndefined();
  });
});

describe('signup-gate handler end-to-end (mocked fetch)', () => {
  let originalFetch;
  let originalEnv;
  let mod;

  // Helper: install a mock fetch that pattern-matches by URL substring and
  // returns the queued response for each pattern. Throws if an unexpected
  // URL is hit.
  function installFetch(handlers) {
    global.fetch = jest.fn(async (url, opts) => {
      const found = handlers.find(h => url.includes(h.match));
      if (!found) {
        throw new Error(`unexpected fetch URL: ${url}`);
      }
      return found.handler(url, opts);
    });
  }

  // Helper: a valid request body that passes _validateSignupRequest.
  function freshBody(emailExt) {
    return JSON.stringify({
      email:        `new${emailExt || ''}@example.com`,
      password:     'p4ssword!',
      displayName:  'Test Parent',
      captchaToken: 'turnstile-token-' + (emailExt || ''),
    });
  }
  function freshEvent(opts) {
    return Object.assign({
      httpMethod: 'POST',
      headers: { 'x-forwarded-for': (opts && opts.ip) || '1.2.3.4', origin: 'https://mymathroots.com' },
      body: freshBody(opts && opts.emailExt),
    }, opts && opts.override || {});
  }

  beforeEach(() => {
    originalFetch = global.fetch;
    originalEnv   = { ...process.env };
    process.env.SUPABASE_URL              = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
    process.env.TURNSTILE_SECRET_KEY      = 'ts';
    jest.resetModules();
    mod = require(FN_PATH);
  });
  afterEach(() => {
    global.fetch = originalFetch;
    process.env  = originalEnv;
  });

  test('happy path: reserves, creates, returns 200', async () => {
    const calls = [];
    installFetch([
      { match: 'siteverify',                handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/launch_settings',  handler: () => ({ ok: true, json: async () => ([{ signup_enabled: true, max_parent_accounts: 50, max_students_per_parent: 2, waitlist_enabled: true }]) }) },
      { match: '/rest/v1/rpc/try_reserve_signup_slot', handler: (u, o) => { calls.push('reserve'); return { ok: true, json: async () => true }; } },
      { match: '/auth/v1/admin/users',      handler: (u, o) => { calls.push('createUser'); return { ok: true, json: async () => ({ id: 'u-1' }) }; } },
      { match: '/functions/v1/notify-new-signup', handler: () => ({ ok: true }) },
      { match: '/rest/v1/rpc/release_signup_slot', handler: () => { throw new Error('should not be called on happy path'); } },
    ]);
    const res = await mod.handler(freshEvent({ emailExt: 'a' }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true, email_confirmation_required: true });
    expect(calls).toEqual(['reserve', 'createUser']);
  });

  test('cap reached: reservation returns false, handler returns 403 cap_reached', async () => {
    let reserveCalls = 0;
    installFetch([
      { match: 'siteverify',                handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/launch_settings',  handler: () => ({ ok: true, json: async () => ([{ signup_enabled: true, max_parent_accounts: 50, max_students_per_parent: 2, waitlist_enabled: true }]) }) },
      { match: '/rest/v1/rpc/try_reserve_signup_slot', handler: () => { reserveCalls++; return { ok: true, json: async () => false }; } },
      { match: '/auth/v1/admin/users',      handler: () => { throw new Error('admin create should not run when cap reached'); } },
    ]);
    const res = await mod.handler(freshEvent({ emailExt: 'b' }));
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ error: 'cap_reached', reason: 'cap_reached' });
    expect(reserveCalls).toBe(1);
  });

  test('create-user fails (email already exists): slot is released', async () => {
    const calls = [];
    installFetch([
      { match: 'siteverify',                handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/launch_settings',  handler: () => ({ ok: true, json: async () => ([{ signup_enabled: true, max_parent_accounts: 50, max_students_per_parent: 2, waitlist_enabled: true }]) }) },
      { match: '/rest/v1/rpc/try_reserve_signup_slot', handler: () => { calls.push('reserve'); return { ok: true, json: async () => true }; } },
      { match: '/auth/v1/admin/users',      handler: () => { calls.push('createUser'); return { ok: false, status: 422, text: async () => 'User already registered' }; } },
      { match: '/rest/v1/rpc/release_signup_slot', handler: () => { calls.push('release'); return { ok: true }; } },
    ]);
    const res = await mod.handler(freshEvent({ emailExt: 'c' }));
    // Item 5 keeps the 409 here; Item 13 will change to non-enumerating 200.
    expect(res.statusCode).toBe(409);
    expect(calls).toEqual(['reserve', 'createUser', 'release']);
  });

  test('create-user fails (server 500): slot is released, returns 500', async () => {
    const calls = [];
    installFetch([
      { match: 'siteverify',                handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/launch_settings',  handler: () => ({ ok: true, json: async () => ([{ signup_enabled: true, max_parent_accounts: 50, max_students_per_parent: 2, waitlist_enabled: true }]) }) },
      { match: '/rest/v1/rpc/try_reserve_signup_slot', handler: () => { calls.push('reserve'); return { ok: true, json: async () => true }; } },
      { match: '/auth/v1/admin/users',      handler: () => { calls.push('createUser'); return { ok: false, status: 500, text: async () => 'internal' }; } },
      { match: '/rest/v1/rpc/release_signup_slot', handler: () => { calls.push('release'); return { ok: true }; } },
    ]);
    const res = await mod.handler(freshEvent({ emailExt: 'd' }));
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'create_failed' });
    expect(calls).toEqual(['reserve', 'createUser', 'release']);
  });

  test('reservation RPC errors: returns 500 reserve_unavailable, never creates user', async () => {
    installFetch([
      { match: 'siteverify',                handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/launch_settings',  handler: () => ({ ok: true, json: async () => ([{ signup_enabled: true, max_parent_accounts: 50, max_students_per_parent: 2, waitlist_enabled: true }]) }) },
      { match: '/rest/v1/rpc/try_reserve_signup_slot', handler: () => ({ ok: false }) },
      { match: '/auth/v1/admin/users',      handler: () => { throw new Error('should not run on reserve failure'); } },
    ]);
    const res = await mod.handler(freshEvent({ emailExt: 'e' }));
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'reserve_unavailable' });
  });
});
