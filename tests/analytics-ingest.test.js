// tests/analytics-ingest.test.js
// Unit tests for _validateEvent (server-side helper from analytics-ingest.js).
// Trust model: client payload never contains parent_id or student_id — server stamps them.
// Run: node --test tests/analytics-ingest.test.js
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Mirror _validateEvent from analytics-ingest.js
const ALLOWED = new Set([
  'app_opened','session_started','session_ended','grade_selected',
  'unit_started','lesson_started','lesson_completed','quiz_started',
  'quiz_completed','unit_test_started','unit_test_completed',
  'intervention_shown','intervention_completed','report_generated',
  'parent_dashboard_opened','subscription_started',
]);
const VALID_GRADES = new Set(['K','1','2','3','4','5']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_RE   = /^[a-zA-Z0-9_\-]{1,32}$/;
const PII_K   = ['email','name','password','phone','address','ip'];
const EMAIL_R = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

function _stripPii(obj, d) {
  if (!obj || typeof obj !== 'object' || d > 3) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PII_K.some(p => k.toLowerCase().includes(p))) continue;
    out[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? _stripPii(v, d+1) : v;
  }
  return out;
}
function _emailInValues(obj) {
  return obj && typeof obj === 'object'
    && Object.values(obj).some(v => typeof v === 'string' && EMAIL_R.test(v));
}
function _validateEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!ALLOWED.has(raw.event_name)) return null;
  const eid = typeof raw.client_event_id === 'string' ? raw.client_event_id.slice(0,128) : null;
  if (!eid) return null;
  const grade     = VALID_GRADES.has(raw.grade)    ? raw.grade    : null;
  const unit_id   = (typeof raw.unit_id   === 'string' && ID_RE.test(raw.unit_id))   ? raw.unit_id   : null;
  const lesson_id = (typeof raw.lesson_id === 'string' && ID_RE.test(raw.lesson_id)) ? raw.lesson_id : null;
  // claimed_student_id: kept for ownership verification by caller; never written directly
  const claimed = (typeof raw.claimed_student_id === 'string' && UUID_RE.test(raw.claimed_student_id))
    ? raw.claimed_student_id : null;
  // parent_id / student_id from client payload are IGNORED entirely
  let meta = (raw.metadata_json && typeof raw.metadata_json === 'object') ? _stripPii(raw.metadata_json, 0) : {};
  if (_emailInValues(meta)) meta = {};
  if (JSON.stringify(meta).length > 500) meta = {};
  return { event_name: raw.event_name, client_event_id: eid, grade, unit_id, lesson_id,
           metadata_json: meta, claimed_student_id: claimed };
}

describe('_validateEvent — trust model', () => {
  it('ignores parent_id field from client (not returned in result)', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'session_started',
      parent_id: '123e4567-e89b-12d3-a456-426614174000', metadata_json: {} });
    assert.ok(r);
    assert.strictEqual('parent_id' in r, false, 'parent_id must not appear in validated event');
  });
  it('ignores student_id field from client (only claimed_student_id passes through)', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'session_started',
      student_id: '123e4567-e89b-12d3-a456-426614174000', metadata_json: {} });
    assert.ok(r);
    assert.strictEqual('student_id' in r, false, 'student_id must not appear in validated event');
  });
  it('preserves claimed_student_id for server ownership verification', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const r = _validateEvent({ client_event_id: 'x', event_name: 'session_started',
      claimed_student_id: uuid, metadata_json: {} });
    assert.ok(r);
    assert.strictEqual(r.claimed_student_id, uuid);
  });
  it('drops non-UUID claimed_student_id', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'session_started',
      claimed_student_id: 'not-a-uuid', metadata_json: {} });
    assert.ok(r);
    assert.strictEqual(r.claimed_student_id, null);
  });
});

describe('_validateEvent — basic validation', () => {
  it('returns null for invalid event_name', () => {
    assert.strictEqual(_validateEvent({ client_event_id: 'x', event_name: 'bad', metadata_json: {} }), null);
  });
  it('returns null when client_event_id is missing', () => {
    assert.strictEqual(_validateEvent({ event_name: 'app_opened', metadata_json: {} }), null);
  });
  it('strips email key from metadata', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'app_opened',
      metadata_json: { email: 'a@b.com', grade: 'K' } });
    assert.ok(r);
    assert.strictEqual('email' in r.metadata_json, false);
    assert.strictEqual(r.metadata_json.grade, 'K');
  });
  it('clears metadata when email value detected', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'app_opened',
      metadata_json: { tag: 'test@example.com' } });
    assert.ok(r);
    assert.deepEqual(r.metadata_json, {});
  });
  it('clears oversized metadata', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'app_opened',
      metadata_json: { data: 'x'.repeat(600) } });
    assert.ok(r);
    assert.deepEqual(r.metadata_json, {});
  });
  it('accepts all valid grade values K,1,2,3,4,5', () => {
    ['K','1','2','3','4','5'].forEach(g => {
      const r = _validateEvent({ client_event_id: 'x', event_name: 'grade_selected',
        grade: g, metadata_json: {} });
      assert.ok(r);
      assert.strictEqual(r.grade, g);
    });
  });
  it('rejects unknown grade values', () => {
    const r = _validateEvent({ client_event_id: 'x', event_name: 'grade_selected',
      grade: '7', metadata_json: {} });
    assert.ok(r);
    assert.strictEqual(r.grade, null);
  });
  it('accepts a fully valid event', () => {
    const r = _validateEvent({
      client_event_id: 'evt_001', event_name: 'lesson_completed',
      grade: '2', unit_id: 'u3', lesson_id: 'u3l1',
      metadata_json: { score: 7, pct: 87, quit: false },
    });
    assert.ok(r);
    assert.strictEqual(r.event_name, 'lesson_completed');
    assert.strictEqual(r.grade, '2');
    assert.strictEqual(r.unit_id, 'u3');
    assert.strictEqual(r.lesson_id, 'u3l1');
  });
  it('returns null for null input', () => {
    assert.strictEqual(_validateEvent(null), null);
    assert.strictEqual(_validateEvent(undefined), null);
    assert.strictEqual(_validateEvent('string'), null);
  });
  it('truncates client_event_id to 128 chars', () => {
    const r = _validateEvent({
      client_event_id: 'a'.repeat(200),
      event_name: 'app_opened',
      metadata_json: {},
    });
    assert.ok(r);
    assert.strictEqual(r.client_event_id.length, 128);
  });
});
