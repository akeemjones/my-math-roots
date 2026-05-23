// tests/waitlist-join.test.js
//
// Verifies the new /.netlify/functions/waitlist-join function and its
// migration counterpart (20260606_waitlist_lockdown.sql) match the
// contract: Turnstile + IP rate limit + service-role-only RPC, with a
// single non-enumerating 200 {ok:true} response for any success path.
//
// Notes:
// - DB-level REVOKE on the legacy join_waitlist RPC is documented as a
//   manual SQL verification in the migration (needs a live Supabase).
// - The src/auth.js consumer change is exercised by manual smoke; this
//   suite covers the Netlify function helpers and full handler flow.

const path = require('path');

const FN_PATH = path.resolve(__dirname, '..', 'netlify', 'functions', 'waitlist-join.js');

describe('waitlist-join helpers', () => {
  let mod;
  beforeEach(() => {
    jest.resetModules();
    mod = require(FN_PATH);
  });

  describe('_normalizeEmail', () => {
    test('trims and lowercases valid emails', () => {
      expect(mod._normalizeEmail('  Foo@Example.COM  ')).toBe('foo@example.com');
    });
    test('rejects empty / non-string input', () => {
      expect(mod._normalizeEmail(null)).toBeNull();
      expect(mod._normalizeEmail('')).toBeNull();
      expect(mod._normalizeEmail('   ')).toBeNull();
      expect(mod._normalizeEmail(42)).toBeNull();
    });
    test('rejects oversize email (>254 chars)', () => {
      const long = 'a'.repeat(250) + '@x.io';
      expect(mod._normalizeEmail(long)).toBeNull();
    });
    test('rejects emails without a TLD', () => {
      expect(mod._normalizeEmail('user@localhost')).toBeNull();
    });
  });

  describe('_validateWaitlistRequest', () => {
    test('happy path: email + source + captchaToken returns ok', () => {
      const r = mod._validateWaitlistRequest({
        email: 'Foo@Bar.com',
        source: 'login_screen',
        captchaToken: 'tok',
      });
      expect(r).toEqual({ ok: true, email: 'foo@bar.com', source: 'login_screen', captchaToken: 'tok' });
    });
    test('rejects invalid body shapes', () => {
      expect(mod._validateWaitlistRequest(null)).toEqual({ ok: false, reason: 'invalid_body' });
      expect(mod._validateWaitlistRequest('not-obj')).toEqual({ ok: false, reason: 'invalid_body' });
      expect(mod._validateWaitlistRequest([])).toEqual({ ok: false, reason: 'invalid_body' });
    });
    test('rejects missing/invalid email', () => {
      const r = mod._validateWaitlistRequest({ captchaToken: 'tok' });
      expect(r).toEqual({ ok: false, reason: 'invalid_email' });
    });
    test('rejects missing captcha', () => {
      const r = mod._validateWaitlistRequest({ email: 'a@b.co' });
      expect(r).toEqual({ ok: false, reason: 'missing_captcha' });
    });
    test('coerces unknown source to login_screen', () => {
      const r = mod._validateWaitlistRequest({
        email: 'a@b.co', captchaToken: 'tok', source: 'malicious_source_value',
      });
      expect(r.source).toBe('login_screen');
    });
    test('keeps allowed sources verbatim', () => {
      const r = mod._validateWaitlistRequest({
        email: 'a@b.co', captchaToken: 'tok', source: 'cap_reached',
      });
      expect(r.source).toBe('cap_reached');
    });
  });

  describe('_parseTurnstileResponse', () => {
    test('returns true only on json.success === true', () => {
      expect(mod._parseTurnstileResponse({ success: true })).toBe(true);
      expect(mod._parseTurnstileResponse({ success: false })).toBe(false);
      expect(mod._parseTurnstileResponse(null)).toBe(false);
      expect(mod._parseTurnstileResponse('ok')).toBe(false);
    });
  });
});

describe('waitlist-join handler (mocked fetch)', () => {
  let originalFetch;
  let originalEnv;
  let mod;

  function installFetch(handlers) {
    global.fetch = jest.fn(async (url, opts) => {
      const found = handlers.find(h => url.includes(h.match));
      if (!found) throw new Error(`unexpected fetch URL: ${url}`);
      return found.handler(url, opts);
    });
  }

  function event(over) {
    return Object.assign({
      httpMethod: 'POST',
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com' },
      body: JSON.stringify({ email: 'new@example.com', source: 'login_screen', captchaToken: 'tok' }),
    }, over || {});
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

  test('happy path: Turnstile passes, rate-limit RPC clears, RPC inserts, 200 {ok:true}', async () => {
    const calls = [];
    installFetch([
      { match: 'siteverify', handler: () => { calls.push('siteverify'); return { ok: true, json: async () => ({ success: true }) }; } },
      { match: '/rest/v1/rpc/check_and_increment_rate_limit', handler: () => { calls.push('rate'); return { ok: true, json: async () => false }; } },
      { match: '/rest/v1/rpc/join_waitlist_internal', handler: () => { calls.push('insert'); return { ok: true }; } },
    ]);
    const res = await mod.handler(event());
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    expect(calls).toEqual(['siteverify', 'rate', 'insert']);
  });

  test('OPTIONS preflight returns 204', async () => {
    const res = await mod.handler({ httpMethod: 'OPTIONS', headers: { origin: 'https://mymathroots.com' } });
    expect(res.statusCode).toBe(204);
  });

  test('method other than POST returns 405', async () => {
    const res = await mod.handler({ httpMethod: 'GET', headers: { origin: 'https://mymathroots.com' } });
    expect(res.statusCode).toBe(405);
  });

  test('invalid email returns 400 invalid_email', async () => {
    installFetch([
      { match: 'siteverify', handler: () => { throw new Error('should not be called'); } },
    ]);
    const res = await mod.handler(event({ body: JSON.stringify({ email: 'not-an-email', captchaToken: 'tok' }) }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'invalid_email' });
  });

  test('missing captcha returns 400 missing_captcha', async () => {
    installFetch([
      { match: 'siteverify', handler: () => { throw new Error('should not be called'); } },
    ]);
    const res = await mod.handler(event({ body: JSON.stringify({ email: 'a@b.co' }) }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'missing_captcha' });
  });

  test('failed Turnstile returns 403 turnstile_failed and never inserts', async () => {
    installFetch([
      { match: 'siteverify', handler: () => ({ ok: true, json: async () => ({ success: false }) }) },
      { match: '/rest/v1/rpc/join_waitlist_internal', handler: () => { throw new Error('should not be called'); } },
    ]);
    const res = await mod.handler(event());
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ error: 'turnstile_failed' });
  });

  test('durable rate limit (RPC returns true) returns 429 and never inserts', async () => {
    installFetch([
      { match: 'siteverify', handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/rpc/check_and_increment_rate_limit', handler: () => ({ ok: true, json: async () => true }) },
      { match: '/rest/v1/rpc/join_waitlist_internal', handler: () => { throw new Error('should not be called'); } },
    ]);
    const res = await mod.handler(event());
    expect(res.statusCode).toBe(429);
  });

  test('duplicate email vs new email return identical 200 {ok:true}', async () => {
    // The RPC is service-role-only ON CONFLICT DO NOTHING — the handler
    // never inspects what changed. Both attempts should look identical
    // from the client perspective.
    let attempt = 0;
    installFetch([
      { match: 'siteverify', handler: () => ({ ok: true, json: async () => ({ success: true }) }) },
      { match: '/rest/v1/rpc/check_and_increment_rate_limit', handler: () => ({ ok: true, json: async () => false }) },
      { match: '/rest/v1/rpc/join_waitlist_internal', handler: () => { attempt++; return { ok: true }; } },
    ]);
    const first  = await mod.handler(event());
    const second = await mod.handler(event());
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.body).toBe(second.body);
    expect(attempt).toBe(2);
  });

  test('misconfigured env returns 500', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    jest.resetModules();
    const m2 = require(FN_PATH);
    const res = await m2.handler(event());
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'Misconfigured' });
  });
});
