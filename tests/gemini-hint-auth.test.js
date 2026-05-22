// tests/gemini-hint-auth.test.js
//
// Verifies the SS-2 fix for netlify/functions/gemini-hint.js:
// every request must carry either a verified parent JWT or a valid PIN
// session, and Gemini must NOT be called when auth fails.
//
// Mocks: global.fetch — separates Supabase auth/PIN lookup from Gemini.
// The function uses https.request for Gemini (not fetch), so Gemini is
// only invoked once auth passes. The tests assert the absence of any
// Gemini call by mocking https.request to throw — if auth passes when it
// shouldn't, the test will see that throw bubble out.

const path = require('path');
const https = require('https');

const FN_PATH = path.resolve(__dirname, '..', 'netlify', 'functions', 'gemini-hint.js');

const VALID_BODY = {
  type: 'hint',
  question: 'What is 2 + 2?',
  wrongAnswer: '5',
  correctAnswer: '4',
};

function _evt(overrides) {
  return Object.assign({
    httpMethod: 'POST',
    headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com' },
    body: JSON.stringify(VALID_BODY),
  }, overrides || {});
}

describe('gemini-hint — auth gate (SS-2)', () => {
  let originalFetch;
  let originalEnv;
  let originalHttpsRequest;
  let geminiCalled;
  let mod;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalEnv   = { ...process.env };
    originalHttpsRequest = https.request;
    geminiCalled = false;

    process.env.SUPABASE_URL              = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
    process.env.GEMINI_API_KEY            = 'gem';

    // Tripwire: if any test path reaches Gemini, this will record it.
    https.request = jest.fn(() => {
      geminiCalled = true;
      throw new Error('TEST: Gemini was called — auth gate failed');
    });

    jest.resetModules();
    mod = require(FN_PATH);
  });

  afterEach(() => {
    global.fetch  = originalFetch;
    process.env   = originalEnv;
    https.request = originalHttpsRequest;
  });

  test('no Authorization header and no session_token → 401 auth_required, no Gemini call', async () => {
    global.fetch = jest.fn();  // any fetch call is unexpected
    const res = await mod.handler(_evt());
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: 'auth_required' });
    expect(geminiCalled).toBe(false);
  });

  test('malformed Authorization header → 401, no Gemini call', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Token abc' },
    }));
    expect(res.statusCode).toBe(401);
    expect(geminiCalled).toBe(false);
  });

  test('bad JWT (Supabase Auth rejects) → 401, no Gemini call', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: false };
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer bad-jwt' },
    }));
    expect(res.statusCode).toBe(401);
    expect(geminiCalled).toBe(false);
  });

  test('PIN session with wrong token → 401, no Gemini call', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000000';
    global.fetch = jest.fn(async (url) => {
      if (url.includes('/rest/v1/pin_sessions')) {
        // Wrong token → empty result
        return { ok: true, json: async () => [] };
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      body: JSON.stringify({ ...VALID_BODY, session_token: token, student_id: uuid }),
    }));
    expect(res.statusCode).toBe(401);
    expect(geminiCalled).toBe(false);
  });

  test('non-UUID session_token or student_id → 401, no PIN lookup, no Gemini call', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler(_evt({
      body: JSON.stringify({ ...VALID_BODY, session_token: 'not-a-uuid', student_id: 'also-not' }),
    }));
    expect(res.statusCode).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(geminiCalled).toBe(false);
  });

  test('valid PIN session — passes auth gate, rate-limited by student id', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000123';
    const seen = [];
    global.fetch = jest.fn(async (url, opts) => {
      seen.push(url);
      if (url.includes('/rest/v1/pin_sessions')) {
        // Valid token returns the matching student_id row
        return { ok: true, json: async () => [{ student_id: uuid }] };
      }
      if (url.includes('/rest/v1/rpc/check_and_increment_rate_limit')) {
        // Inspect: rate-limit key should be hint:student:<uuid>
        const reqBody = JSON.parse(opts.body);
        expect(reqBody.p_key).toBe('hint:student:' + uuid);
        return { ok: true, json: async () => false }; // not over limit
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    // Gemini will throw via the tripwire (we don't want a real call). The
    // handler maps callGemini throws to 500 'AI service unavailable',
    // so a 500 response here means auth + rate-limit + gemini-call happened.
    const res = await mod.handler(_evt({
      body: JSON.stringify({ ...VALID_BODY, session_token: token, student_id: uuid }),
    }));
    expect(geminiCalled).toBe(true);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'AI service unavailable' });
    // PIN-session and rate-limit fetches both happened
    expect(seen.some(u => u.includes('/rest/v1/pin_sessions'))).toBe(true);
    expect(seen.some(u => u.includes('check_and_increment_rate_limit'))).toBe(true);
  });

  test('valid parent JWT — passes auth gate, rate-limited by parent id', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url, opts) => {
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({ id: parentId }) };
      }
      if (url.includes('/rest/v1/rpc/check_and_increment_rate_limit')) {
        const reqBody = JSON.parse(opts.body);
        expect(reqBody.p_key).toBe('hint:parent:' + parentId);
        return { ok: true, json: async () => false };
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
    }));
    expect(geminiCalled).toBe(true);
    expect(res.statusCode).toBe(500); // Gemini tripwire
  });

  test('parent JWT takes precedence over PIN session fields (only one auth path attempted)', async () => {
    // Parent JWT is checked first. If it succeeds, PIN-session fields
    // should not be consulted.
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    let pinSessionsCalled = false;
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({ id: parentId }) };
      }
      if (url.includes('/rest/v1/pin_sessions')) {
        pinSessionsCalled = true;
        return { ok: true, json: async () => [] };
      }
      if (url.includes('check_and_increment_rate_limit')) {
        return { ok: true, json: async () => false };
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
      body: JSON.stringify({
        ...VALID_BODY,
        session_token: '11111111-1111-1111-1111-111111111111',
        student_id:    '22222222-2222-2222-2222-222222222222',
      }),
    }));
    expect(pinSessionsCalled).toBe(false);
  });

  test('rate-limit hit (RPC returns true) → 429, no Gemini call', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) {
        return { ok: true, json: async () => ({ id: parentId }) };
      }
      if (url.includes('check_and_increment_rate_limit')) {
        return { ok: true, json: async () => true }; // over limit
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
    }));
    expect(res.statusCode).toBe(429);
    expect(geminiCalled).toBe(false);
  });

  test('OPTIONS preflight → 204 without auth', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler({ httpMethod: 'OPTIONS',
      headers: { origin: 'https://mymathroots.com' } });
    expect(res.statusCode).toBe(204);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(geminiCalled).toBe(false);
  });

  test('non-POST → 405 without auth (no Gemini)', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler({ httpMethod: 'GET',
      headers: { origin: 'https://mymathroots.com' } });
    expect(res.statusCode).toBe(405);
    expect(geminiCalled).toBe(false);
  });

  test('invalid JSON body → 400 without auth', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler(_evt({ body: '{not json' }));
    expect(res.statusCode).toBe(400);
    expect(geminiCalled).toBe(false);
  });

  test('auth passes but body missing required fields → 400 (after auth, before Gemini)', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => false };
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
      body: JSON.stringify({ type: 'hint' }),
    }));
    expect(res.statusCode).toBe(400);
    expect(geminiCalled).toBe(false);
  });
});
