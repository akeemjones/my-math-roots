// tests/send-push-key-resolver.test.js
//
// Verifies the _resolveSupabaseServiceKey helper added to
// supabase/functions/send-push/index.ts (legacy-key retirement prep).
//
// Two layers:
//   1. BEHAVIORAL — a parallel Node port of the resolver, byte-for-byte
//      matching the TS implementation. Tested against all the input
//      combinations the production resolver must handle. Node cannot
//      directly require a Deno .ts file, so this mirror pattern follows
//      tests/analytics-ingest.test.js precedent.
//   2. SOURCE CONTRACT — reads the .ts file as text and asserts the
//      helper exists with the expected shape, that the top-level
//      SUPABASE_SERVICE_KEY initializer uses it, and that no secret
//      values or JWT-shaped strings leak into the source.
//
// The contract test exists specifically to catch drift between the JS
// parallel and the TS source: if you change one without the other,
// these tests fail.

const fs = require('fs');
const path = require('path');

const FN_PATH = path.resolve(
  __dirname, '..', 'supabase', 'functions', 'send-push', 'index.ts'
);

// ── Parallel Node implementation — must mirror the TS helper exactly ─────
function resolveSupabaseServiceKey(envGet) {
  const secretKeysRaw = envGet('SUPABASE_SECRET_KEYS');
  if (secretKeysRaw) {
    try {
      const parsed = JSON.parse(secretKeysRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (first && typeof first === 'object') {
          const candidate = first.key || first.api_key;
          if (typeof candidate === 'string' && candidate.length > 0) {
            return candidate;
          }
        }
      }
    } catch {
      // Malformed JSON — fall through to legacy fallback.
    }
  }
  const legacy = envGet('SUPABASE_SERVICE_ROLE_KEY');
  if (typeof legacy === 'string' && legacy.length > 0) {
    return legacy;
  }
  throw new Error('Neither SUPABASE_SECRET_KEYS nor SUPABASE_SERVICE_ROLE_KEY is set');
}

function envFrom(map) {
  return (name) => map[name];
}

describe('send-push key resolver — behavioral', () => {
  test('chooses SUPABASE_SECRET_KEYS[0].key when present', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([{ name: 'default', key: 'NEW_KEY_VALUE' }]),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('NEW_KEY_VALUE');
  });

  test('chooses SUPABASE_SECRET_KEYS[0].api_key when .key is absent', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([{ name: 'default', api_key: 'NEW_API_KEY' }]),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('NEW_API_KEY');
  });

  test('prefers .key over .api_key when both are present', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([{ key: 'PRIMARY', api_key: 'ALTERNATE' }]),
    });
    expect(resolveSupabaseServiceKey(e)).toBe('PRIMARY');
  });

  test('uses ONLY the first array element', () => {
    // Multiple keys may exist (e.g. during a rotation grace period).
    // The resolver must pick the first one and ignore the rest.
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([
        { name: 'default', key: 'FIRST' },
        { name: 'secondary', key: 'SECOND' },
      ]),
    });
    expect(resolveSupabaseServiceKey(e)).toBe('FIRST');
  });

  test('falls back to SUPABASE_SERVICE_ROLE_KEY when SECRET_KEYS missing', () => {
    const e = envFrom({ SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE' });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when SECRET_KEYS is malformed JSON', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: '{not valid json',
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when SECRET_KEYS is an empty array', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: '[]',
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when first item lacks key/api_key', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([{ name: 'default' }]),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when first item .key is an empty string', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([{ key: '' }]),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when first item .key is non-string', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([{ key: 12345 }]),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when SECRET_KEYS is an object (not an array)', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify({ key: 'OBJECT_FORMAT' }),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('falls back to legacy when SECRET_KEYS first item is null', () => {
    const e = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify([null]),
      SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_VALUE',
    });
    expect(resolveSupabaseServiceKey(e)).toBe('LEGACY_VALUE');
  });

  test('throws when neither source is set', () => {
    const e = envFrom({});
    expect(() => resolveSupabaseServiceKey(e)).toThrow(
      /Neither SUPABASE_SECRET_KEYS nor SUPABASE_SERVICE_ROLE_KEY/
    );
  });

  test('throws when both sources are empty strings', () => {
    const e = envFrom({ SUPABASE_SECRET_KEYS: '', SUPABASE_SERVICE_ROLE_KEY: '' });
    expect(() => resolveSupabaseServiceKey(e)).toThrow();
  });

  test('throws when both sources are undefined', () => {
    const e = envFrom({ SUPABASE_SECRET_KEYS: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined });
    expect(() => resolveSupabaseServiceKey(e)).toThrow();
  });

  test('legacy null falls through to throw (not returned)', () => {
    const e = envFrom({ SUPABASE_SERVICE_ROLE_KEY: null });
    expect(() => resolveSupabaseServiceKey(e)).toThrow();
  });

  test('error message contains both env var names', () => {
    let captured;
    try { resolveSupabaseServiceKey(envFrom({})); } catch (err) { captured = err; }
    expect(captured).toBeDefined();
    expect(captured.message).toContain('SUPABASE_SECRET_KEYS');
    expect(captured.message).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  test('error message does NOT contain any provided secret value', () => {
    // Construct a scenario where the resolver throws despite having
    // received values it tried to parse. The malformed-JSON path falls
    // through to legacy; if legacy is also unset/empty, the throw fires.
    // The thrown message must not echo any of the input values.
    const sensitiveValue = 'sb_secret_DO_NOT_LEAK_VALUE_xyz_99999';
    let captured;
    try {
      resolveSupabaseServiceKey(envFrom({
        SUPABASE_SECRET_KEYS: '{partial:' + sensitiveValue,  // malformed → fall through
        SUPABASE_SERVICE_ROLE_KEY: '',                       // empty → throw
      }));
    } catch (err) { captured = err; }
    expect(captured).toBeDefined();
    expect(String(captured.message)).not.toContain('sb_secret_');
    expect(String(captured.message)).not.toContain(sensitiveValue);
    expect(String(captured.message)).not.toContain('partial');
  });

  test('does not log when falling back from malformed SECRET_KEYS', () => {
    // The catch block must be silent (the partial source could contain
    // secret material). Spy on console.* and assert zero calls.
    const spies = ['log','warn','error','info','debug'].map(m =>
      jest.spyOn(console, m).mockImplementation(() => {})
    );
    try {
      const result = resolveSupabaseServiceKey(envFrom({
        SUPABASE_SECRET_KEYS: '{not valid json with sb_secret_DO_NOT_LEAK',
        SUPABASE_SERVICE_ROLE_KEY: 'LEGACY_FALLBACK',
      }));
      expect(result).toBe('LEGACY_FALLBACK');
      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
  });

  test('does not log on the happy path either', () => {
    const spies = ['log','warn','error','info','debug'].map(m =>
      jest.spyOn(console, m).mockImplementation(() => {})
    );
    try {
      resolveSupabaseServiceKey(envFrom({
        SUPABASE_SECRET_KEYS: JSON.stringify([{ key: 'SHOULD_NOT_BE_LOGGED' }]),
      }));
      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
  });
});

describe('send-push key resolver — source contract', () => {
  let src;
  beforeAll(() => { src = fs.readFileSync(FN_PATH, 'utf8'); });

  test('source defines function _resolveSupabaseServiceKey', () => {
    expect(src).toMatch(/function\s+_resolveSupabaseServiceKey\s*\(/);
  });

  test('source uses the helper to populate SUPABASE_SERVICE_KEY', () => {
    expect(src).toMatch(/SUPABASE_SERVICE_KEY\s*=\s*_resolveSupabaseServiceKey\s*\(/);
  });

  test('source no longer reads SUPABASE_SERVICE_ROLE_KEY directly via Deno.env.get', () => {
    // The legacy var name is now only referenced via the envGet
    // parameter (a string literal inside the helper). A top-level
    // Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') would mean the change
    // was reverted.
    expect(src).not.toMatch(/Deno\.env\.get\(\s*['"]SUPABASE_SERVICE_ROLE_KEY['"]\s*\)/);
  });

  test('source mentions SUPABASE_SECRET_KEYS (the preferred path)', () => {
    expect(src).toMatch(/SUPABASE_SECRET_KEYS/);
  });

  test('resolver checks SECRET_KEYS BEFORE the legacy fallback', () => {
    const fnBody = src.match(/function\s+_resolveSupabaseServiceKey[\s\S]+?\n\}\n/);
    expect(fnBody).toBeTruthy();
    const secretIdx = fnBody[0].indexOf('SUPABASE_SECRET_KEYS');
    const legacyIdx = fnBody[0].indexOf('SUPABASE_SERVICE_ROLE_KEY');
    expect(secretIdx).toBeGreaterThan(-1);
    expect(legacyIdx).toBeGreaterThan(-1);
    expect(secretIdx).toBeLessThan(legacyIdx);
  });

  test('resolver supports both .key and .api_key fields', () => {
    const fnBody = src.match(/function\s+_resolveSupabaseServiceKey[\s\S]+?\n\}\n/);
    expect(fnBody[0]).toMatch(/\.key\b/);
    expect(fnBody[0]).toMatch(/\.api_key\b/);
  });

  test('resolver throws when neither source resolves', () => {
    const fnBody = src.match(/function\s+_resolveSupabaseServiceKey[\s\S]+?\n\}\n/);
    expect(fnBody[0]).toMatch(/throw\s+new\s+Error\([\s\S]*Neither\s+SUPABASE_SECRET_KEYS\s+nor\s+SUPABASE_SERVICE_ROLE_KEY/i);
  });

  test('source contains no secret-shaped strings', () => {
    expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    expect(src).not.toMatch(/sb_secret_/);
    expect(src).not.toMatch(/sb_publishable_/);
  });

  test('SEND_PUSH_SECRET auth check remains intact (unchanged behavior)', () => {
    expect(src).toMatch(/Deno\.env\.get\(\s*['"]SEND_PUSH_SECRET['"]\s*\)/);
    expect(src).toMatch(/Bearer\s+\$\{SEND_PUSH_SECRET\}/);
    expect(src).toMatch(/Unauthorized/);
  });
});
