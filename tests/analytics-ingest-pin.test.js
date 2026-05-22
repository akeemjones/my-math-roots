// tests/analytics-ingest-pin.test.js
//
// Verifies the A5-F3 fix for netlify/functions/analytics-ingest.js:
// the PIN-session lookup must filter `token=eq.` (the real column name),
// not `session_token=eq.` (which doesn't exist and was causing PostgREST
// to return 400 + every PIN-mode event to be silently null-stamped).

const fs   = require('fs');
const path = require('path');

const FN_PATH = path.resolve(__dirname, '..', 'netlify', 'functions', 'analytics-ingest.js');

describe('analytics-ingest source — PIN session column name', () => {
  let src;
  beforeAll(() => { src = fs.readFileSync(FN_PATH, 'utf8'); });

  test('uses the correct column name (token=eq.) on pin_sessions', () => {
    // The PIN lookup must filter on token=eq., not session_token=eq.
    expect(src).toMatch(/pin_sessions[^`'"]*token=eq\./);
  });

  test('does NOT use session_token=eq. as a live query filter (the pre-fix bug)', () => {
    // session_token does not exist as a column on pin_sessions. The
    // pre-fix code shipped this and silently dropped every PIN-mode
    // attribution. Guard against regression — only flag when it appears
    // inside a runtime URL template, not inside a docstring/comment.
    expect(src).not.toMatch(/pin_sessions[^`'"\n]*session_token=eq\./);
  });
});

describe('analytics-ingest._verifyPinSession (mocked fetch)', () => {
  let originalFetch;
  let mod;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.resetModules();
    mod = require(FN_PATH);
  });
  afterEach(() => { global.fetch = originalFetch; });

  test('returns null on missing inputs (no fetch)', async () => {
    global.fetch = jest.fn();
    expect(await mod._verifyPinSession(null, 'sid', 'https://x.supabase.co', 'svc')).toBeNull();
    expect(await mod._verifyPinSession('tok', null, 'https://x.supabase.co', 'svc')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns null on non-UUID session_token or claimed student_id (no fetch)', async () => {
    global.fetch = jest.fn();
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    expect(await mod._verifyPinSession('not-uuid', uuid,      'https://x.supabase.co', 'svc')).toBeNull();
    expect(await mod._verifyPinSession(uuid,      'not-uuid', 'https://x.supabase.co', 'svc')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('query URL includes token=eq. (correct column) and student_id=eq.', async () => {
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000abc';
    let observedUrl = '';
    global.fetch = jest.fn(async (url) => {
      observedUrl = url;
      return { ok: true, json: async () => [{ student_id: uuid }] };
    });
    const result = await mod._verifyPinSession(token, uuid, 'https://x.supabase.co', 'svc');
    expect(result).toBe(uuid);
    expect(observedUrl).toContain('/rest/v1/pin_sessions');
    expect(observedUrl).toContain('token=eq.' + token);
    expect(observedUrl).toContain('student_id=eq.' + uuid);
    expect(observedUrl).not.toContain('session_token=eq.');
  });

  test('returns null when fetch returns non-OK (bad query)', async () => {
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000abc';
    global.fetch = jest.fn(async () => ({ ok: false }));
    expect(await mod._verifyPinSession(token, uuid, 'https://x.supabase.co', 'svc')).toBeNull();
  });

  test('returns null when no row matches (invalid/expired token)', async () => {
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000abc';
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => [] }));
    expect(await mod._verifyPinSession(token, uuid, 'https://x.supabase.co', 'svc')).toBeNull();
  });

  test('returns student_id when token + claimed student match a live row', async () => {
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000abc';
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => [{ student_id: uuid }] }));
    expect(await mod._verifyPinSession(token, uuid, 'https://x.supabase.co', 'svc')).toBe(uuid);
  });

  test('returns null on fetch exception (network error)', async () => {
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000abc';
    global.fetch = jest.fn(async () => { throw new Error('network'); });
    expect(await mod._verifyPinSession(token, uuid, 'https://x.supabase.co', 'svc')).toBeNull();
  });

  test('expires_at filter uses gte. (live sessions only)', async () => {
    const uuid  = '123e4567-e89b-12d3-a456-426614174000';
    const token = '00000000-0000-0000-0000-000000000abc';
    let observedUrl = '';
    global.fetch = jest.fn(async (url) => {
      observedUrl = url;
      return { ok: true, json: async () => [{ student_id: uuid }] };
    });
    await mod._verifyPinSession(token, uuid, 'https://x.supabase.co', 'svc');
    expect(observedUrl).toMatch(/expires_at=gte\./);
  });
});
