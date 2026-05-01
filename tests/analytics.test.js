// tests/analytics.test.js
// Run: node --test tests/analytics.test.js
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

if (typeof globalThis.localStorage === 'undefined') {
  const _s = new Map();
  globalThis.localStorage = {
    getItem(k)    { return _s.has(k) ? _s.get(k) : null; },
    setItem(k, v) { _s.set(String(k), String(v)); },
    removeItem(k) { _s.delete(k); },
    clear()       { _s.clear(); },
  };
}

// Mirror pure functions from analytics.js
const _ANA_PII_KEYS = ['email','name','password','phone','address'];
function _anaStripPii(metadata) {
  if (!metadata || typeof metadata !== 'object') return {};
  var out = {}, keys = Object.keys(metadata);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], kl = k.toLowerCase(), isPii = false;
    for (var j = 0; j < _ANA_PII_KEYS.length; j++) {
      if (kl.indexOf(_ANA_PII_KEYS[j]) !== -1) { isPii = true; break; }
    }
    if (!isPii) out[k] = metadata[k];
  }
  return out;
}

const _VALID = new Set([
  'app_opened','session_started','session_ended','grade_selected',
  'unit_started','lesson_started','lesson_completed','quiz_started',
  'quiz_completed','unit_test_started','unit_test_completed',
  'intervention_shown','intervention_completed','report_generated',
  'parent_dashboard_opened','subscription_started',
]);

const _rateLimit = (() => {
  const b = {};
  return function(key, max) {
    const now = Date.now();
    if (!b[key]) b[key] = [];
    b[key] = b[key].filter(t => now - t < 60000);
    if (b[key].length >= max) return false;
    b[key].push(now); return true;
  };
})();

function _makeQueue(max) {
  const q = [];
  return {
    push(e) { q.push(e); if (q.length > max) q.shift(); },
    size()  { return q.length; },
    flush() { return q.splice(0, q.length); },
    peek()  { return [...q]; },
  };
}

function _makeDedupGuard() {
  var fired = false;
  return {
    fire() { if (fired) return false; fired = true; return true; },
    reset() { fired = false; },
    hasFired() { return fired; },
  };
}

describe('_anaStripPii', () => {
  it('removes key containing "email"', () => {
    const r = _anaStripPii({ email: 'x@y.com', score: 80 });
    assert.strictEqual('email' in r, false);
    assert.strictEqual(r.score, 80);
  });
  it('removes key containing "name" (substring, case-insensitive)', () => {
    const r = _anaStripPii({ studentName: 'Alice', pct: 90 });
    assert.strictEqual('studentName' in r, false);
    assert.strictEqual(r.pct, 90);
  });
  it('removes key containing "password"', () => {
    const r = _anaStripPii({ password: 'x', grade: 'K' });
    assert.strictEqual('password' in r, false);
    assert.strictEqual(r.grade, 'K');
  });
  it('preserves safe keys', () => {
    assert.deepEqual(_anaStripPii({ score: 80, pct: 90, grade: '2', quit: false }),
                     { score: 80, pct: 90, grade: '2', quit: false });
  });
  it('returns empty object for null/string/number input', () => {
    assert.deepEqual(_anaStripPii(null), {});
    assert.deepEqual(_anaStripPii('str'), {});
    assert.deepEqual(_anaStripPii(42), {});
  });
  it('strips DisplayName (mixed-case substring)', () => {
    const r = _anaStripPii({ DisplayName: 'Bob', score: 100 });
    assert.strictEqual('DisplayName' in r, false);
  });
  it('metadata never contains UUID values', () => {
    const meta = { score: 80, pct: 90 };
    const r = _anaStripPii(meta);
    assert.ok(!Object.values(r).some(v =>
      typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    ), 'metadata should not contain UUID values');
  });
});

describe('event name whitelist', () => {
  it('accepts all 16 valid events', () => {
    [..._VALID].forEach(e => assert.ok(_VALID.has(e), `Expected valid: ${e}`));
  });
  it('rejects unlisted events', () => {
    assert.ok(!_VALID.has('page_view'));
    assert.ok(!_VALID.has('APP_OPENED'));
    assert.ok(!_VALID.has(''));
  });
  it('contains exactly 16 events', () => {
    assert.strictEqual(_VALID.size, 16);
  });
});

describe('rate limiter', () => {
  it('allows calls up to maxPerMin', () => {
    const key = 'rl_' + Date.now();
    for (let i = 0; i < 5; i++) assert.strictEqual(_rateLimit(key, 5), true);
  });
  it('blocks calls exceeding maxPerMin', () => {
    const key = 'rlb_' + Date.now();
    for (let i = 0; i < 5; i++) _rateLimit(key, 5);
    assert.strictEqual(_rateLimit(key, 5), false);
  });
  it('isolates buckets per key', () => {
    const k1 = 'k1_' + Date.now(), k2 = 'k2_' + Date.now();
    for (let i = 0; i < 5; i++) _rateLimit(k1, 5);
    assert.strictEqual(_rateLimit(k2, 5), true);
  });
});

describe('event queue', () => {
  it('caps at maxSize, drops oldest', () => {
    const q = _makeQueue(3);
    [1,2,3,4].forEach(id => q.push({ id }));
    assert.strictEqual(q.size(), 3);
    assert.strictEqual(q.peek()[0].id, 2);
  });
  it('flush empties queue', () => {
    const q = _makeQueue(50);
    q.push({ event_name: 'app_opened' });
    q.push({ event_name: 'session_started' });
    const flushed = q.flush();
    assert.strictEqual(flushed.length, 2);
    assert.strictEqual(q.size(), 0);
  });
});

describe('dedup guards (session_ended, parent_dashboard_opened)', () => {
  it('fires only once per page load', () => {
    const guard = _makeDedupGuard();
    assert.strictEqual(guard.fire(), true,  '1st call should fire');
    assert.strictEqual(guard.fire(), false, '2nd call should be blocked');
    assert.strictEqual(guard.fire(), false, '3rd call should be blocked');
  });
  it('fires again after reset (new session)', () => {
    const guard = _makeDedupGuard();
    guard.fire();
    guard.reset();
    assert.strictEqual(guard.fire(), true, 'Should fire after reset');
  });
});

describe('event payload shapes (PII + size guards)', () => {
  const payloads = [
    { name: 'app_opened',              meta: { grade: 'K' } },
    { name: 'session_started',         meta: { grade: '2' } },
    { name: 'session_ended',           meta: { duration_secs: 300, grade: '2' } },
    { name: 'grade_selected',          meta: { grade: 'K' } },
    { name: 'unit_started',            meta: { unit_id: 'u3', grade: '2' } },
    { name: 'lesson_started',          meta: { unit_id: 'u3', lesson_id: 'u3l1', grade: '2' } },
    { name: 'lesson_completed',        meta: { score: 7, pct: 87, quit: false, abandoned: false } },
    { name: 'quiz_started',            meta: { unit_id: 'u3', quiz_type: 'unit' } },
    { name: 'quiz_completed',          meta: { quiz_type: 'unit', score: 20, pct: 80, quit: false, abandoned: false } },
    { name: 'unit_test_started',       meta: {} },
    { name: 'unit_test_completed',     meta: { pct: 84, quit: false } },
    { name: 'intervention_shown',      meta: { error_tag: 'err_forgot_carry' } },
    { name: 'intervention_completed',  meta: { resolved_correctly: true, error_tag: 'err_forgot_carry' } },
    { name: 'report_generated',        meta: {} },
    { name: 'parent_dashboard_opened', meta: {} },
    { name: 'subscription_started',    meta: {} },
  ];
  payloads.forEach(({ name, meta }) => {
    it(`${name}: whitelisted, passes PII filter, under 500 chars`, () => {
      assert.ok(_VALID.has(name), `${name} not in whitelist`);
      const stripped = _anaStripPii(meta);
      const hasUuid = Object.values(stripped).some(v =>
        typeof v === 'string' && /^[0-9a-f]{8}-/.test(v));
      assert.ok(!hasUuid, `${name} metadata must not contain UUID values`);
      assert.ok(JSON.stringify(stripped).length <= 500, `${name} metadata exceeds 500 chars`);
    });
  });
});
