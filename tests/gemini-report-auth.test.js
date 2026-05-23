// tests/gemini-report-auth.test.js
//
// Verifies the SS-3 fix for netlify/functions/gemini-report.js:
// every request now requires a verified parent JWT. Previously, missing
// or non-UUID studentId values skipped the auth+ownership check entirely,
// turning the endpoint into a free Gemini proxy.
//
// Mocks: global.fetch for all Supabase calls; https.request as a Gemini
// tripwire. If auth ever passes when it shouldn't, the tripwire fires.

const path = require('path');
const https = require('https');

const FN_PATH = path.resolve(__dirname, '..', 'netlify', 'functions', 'gemini-report.js');

const REPORT_BODY = {
  studentName: 'Test Student',
  reportData: { reportDate: '2026-05-22', period: 30, totalAttempts: 0 },
};

function _evt(overrides) {
  return Object.assign({
    httpMethod: 'POST',
    headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com' },
    body: JSON.stringify(REPORT_BODY),
  }, overrides || {});
}

describe('gemini-report — auth gate (SS-3)', () => {
  let originalFetch;
  let originalEnv;
  let originalHttpsRequest;
  let geminiCalled;
  let mod;

  beforeEach(() => {
    originalFetch        = global.fetch;
    originalEnv          = { ...process.env };
    originalHttpsRequest = https.request;
    geminiCalled         = false;

    process.env.SUPABASE_URL              = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
    process.env.GEMINI_API_KEY            = 'gem';
    delete process.env.ALLOW_LOCAL_REPORT;  // production default

    // Tripwire — any Gemini call when auth should have blocked it.
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

  test('no Authorization header → 401 auth_required, no Gemini call', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler(_evt());
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: 'auth_required' });
    expect(geminiCalled).toBe(false);
  });

  test('malformed Authorization → 401, no Gemini', async () => {
    global.fetch = jest.fn();
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Token abc' },
    }));
    expect(res.statusCode).toBe(401);
    expect(geminiCalled).toBe(false);
  });

  test('bad JWT (Supabase rejects) → 401, no Gemini', async () => {
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

  test('valid JWT but no studentId → still requires JWT (passes), reaches Gemini', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => false };
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
    }));
    // Gemini tripwire fires → handler maps to 500 'AI service unavailable'.
    expect(geminiCalled).toBe(true);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'AI service unavailable' });
  });

  test('valid JWT + non-UUID studentId (no ALLOW_LOCAL_REPORT flag) → 400 invalid_studentId, no Gemini', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => false };
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
      body: JSON.stringify({ ...REPORT_BODY, studentId: 'local' }),
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'invalid_studentId' });
    expect(geminiCalled).toBe(false);
  });

  test('valid JWT + non-UUID studentId WITH ALLOW_LOCAL_REPORT=true → reaches Gemini', async () => {
    process.env.ALLOW_LOCAL_REPORT = 'true';
    jest.resetModules();
    const m2 = require(FN_PATH);

    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => false };
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await m2.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
      body: JSON.stringify({ ...REPORT_BODY, studentId: 'local' }),
    }));
    expect(geminiCalled).toBe(true);
    expect(res.statusCode).toBe(500); // tripwire
  });

  test('valid JWT + UUID studentId not owned by parent → 403 (no Gemini)', async () => {
    const parentId  = 'abcdefab-1234-5678-9abc-def012345678';
    const studentId = '99999999-9999-9999-9999-999999999999';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => false };
      if (url.includes('/rest/v1/student_profiles')) {
        // Owned by a different parent
        return { ok: true, json: async () => [{ parent_id: 'someone-else' }] };
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
      body: JSON.stringify({ ...REPORT_BODY, studentId }),
    }));
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ error: 'Not authorized for this student' });
    expect(geminiCalled).toBe(false);
  });

  test('valid JWT + UUID studentId owned by parent → reaches Gemini', async () => {
    const parentId  = 'abcdefab-1234-5678-9abc-def012345678';
    const studentId = '99999999-9999-9999-9999-999999999999';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => false };
      if (url.includes('/rest/v1/student_profiles?id=eq.')) {
        return { ok: true, json: async () => [{ parent_id: parentId, report_last_generated: null, report_last_text: null }] };
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
      body: JSON.stringify({ ...REPORT_BODY, studentId }),
    }));
    expect(geminiCalled).toBe(true);
    expect(res.statusCode).toBe(500); // Gemini tripwire
  });

  test('rate-limit key uses verified parent UUID (not IP)', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    let observedKey;
    global.fetch = jest.fn(async (url, opts) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) {
        const reqBody = JSON.parse(opts.body);
        observedKey = reqBody.p_key;
        return { ok: true, json: async () => false };
      }
      throw new Error('unexpected fetch URL: ' + url);
    });
    await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
    }));
    expect(observedKey).toBe('report:' + parentId);
    expect(observedKey).not.toContain('1.2.3.4');
  });

  test('rate-limit hit → 429, no Gemini', async () => {
    const parentId = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: parentId }) };
      if (url.includes('check_and_increment_rate_limit')) return { ok: true, json: async () => true }; // over
      throw new Error('unexpected fetch URL: ' + url);
    });
    const res = await mod.handler(_evt({
      headers: { 'x-forwarded-for': '1.2.3.4', origin: 'https://mymathroots.com',
                 authorization: 'Bearer good-jwt' },
    }));
    expect(res.statusCode).toBe(429);
    expect(geminiCalled).toBe(false);
  });

  test('OPTIONS / non-POST / bad JSON paths do not reach Gemini', async () => {
    global.fetch = jest.fn();
    const opt = await mod.handler({ httpMethod: 'OPTIONS', headers: { origin: 'https://mymathroots.com' } });
    expect(opt.statusCode).toBe(204);
    const gt = await mod.handler({ httpMethod: 'GET', headers: { origin: 'https://mymathroots.com' } });
    expect(gt.statusCode).toBe(405);
    const bj = await mod.handler(_evt({ body: '{not json' }));
    expect(bj.statusCode).toBe(400);
    expect(geminiCalled).toBe(false);
  });
});

describe('gemini-report — _verifyParentJwt helper', () => {
  let originalFetch;
  let mod;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.resetModules();
    mod = require(FN_PATH);
  });
  afterEach(() => { global.fetch = originalFetch; });

  test('returns null without auth header', async () => {
    global.fetch = jest.fn();
    expect(await mod._verifyParentJwt('', 'https://x.supabase.co', 'svc')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns null when /auth/v1/user fails', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));
    expect(await mod._verifyParentJwt('Bearer x', 'https://x.supabase.co', 'svc')).toBeNull();
  });

  test('returns null when response has no id or non-UUID id', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({}) }));
    expect(await mod._verifyParentJwt('Bearer x', 'https://x.supabase.co', 'svc')).toBeNull();

    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ id: 'not-a-uuid' }) }));
    expect(await mod._verifyParentJwt('Bearer x', 'https://x.supabase.co', 'svc')).toBeNull();
  });

  test('returns parent UUID when JWT verifies', async () => {
    const uuid = 'abcdefab-1234-5678-9abc-def012345678';
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ id: uuid }) }));
    expect(await mod._verifyParentJwt('Bearer good', 'https://x.supabase.co', 'svc')).toBe(uuid);
  });
});

describe('gemini-report — _verifyParentOwnsStudent helper', () => {
  let originalFetch;
  let mod;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.resetModules();
    mod = require(FN_PATH);
  });
  afterEach(() => { global.fetch = originalFetch; });

  test('returns false when student row does not exist', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => [] }));
    expect(await mod._verifyParentOwnsStudent('parent-id', 'student-id', 'https://x.supabase.co', 'svc')).toBe(false);
  });

  test('returns false when parent_id mismatches', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => [{ parent_id: 'other' }] }));
    expect(await mod._verifyParentOwnsStudent('parent-id', 'student-id', 'https://x.supabase.co', 'svc')).toBe(false);
  });

  test('returns true when parent_id matches', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => [{ parent_id: 'parent-id' }] }));
    expect(await mod._verifyParentOwnsStudent('parent-id', 'student-id', 'https://x.supabase.co', 'svc')).toBe(true);
  });
});
