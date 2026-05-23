'use strict';

// =============================================================================
//  Analytics Phase C.3B — anonymous visitor ID helper + website_viewed event
//
//  C.3B adds:
//    - _getAnonVisitorId()   generates/persists a random UUID per browser
//                            (localStorage key: mmr_anon_visitor_id). No PII.
//    - website_viewed event  emitted once per calendar day via dedup key
//                            mmr_website_viewed_YYYY_MM_DD
//    - analytics_unique_site_visits RPC  counts distinct anon_visitor_ids
//                            per day from website_viewed events in app_events
// =============================================================================

// ── Shared localStorage mock ─────────────────────────────────────────────────
let _store;
function _mockLocalStorage() {
  _store = {};
  global.localStorage = {
    getItem:    (k)    => (_store[k] !== undefined ? _store[k] : null),
    setItem:    (k, v) => { _store[k] = String(v); },
    removeItem: (k)    => { delete _store[k]; },
  };
  // Ensure crypto.randomUUID is available in the test environment
  if (typeof global.crypto === 'undefined' || typeof global.crypto.randomUUID !== 'function') {
    const { webcrypto } = require('crypto');
    global.crypto = webcrypto;
  }
}
function _clearLocalStorage() {
  delete global.localStorage;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('_getAnonVisitorId', () => {
  const { _getAnonVisitorId } = require('../src/analytics.js');

  beforeEach(_mockLocalStorage);
  afterEach(_clearLocalStorage);

  test('generates a UUID-shaped ID on first call', () => {
    const id = _getAnonVisitorId();
    expect(typeof id).toBe('string');
    // Accepts standard v4 UUID OR the anon_TIMESTAMP_RAND fallback
    const isUuid  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const isAnon  = /^anon_\d+_[a-z0-9]+$/.test(id);
    expect(isUuid || isAnon).toBe(true);
  });

  test('persists the ID under mmr_anon_visitor_id', () => {
    _getAnonVisitorId();
    expect(typeof _store['mmr_anon_visitor_id']).toBe('string');
    expect(_store['mmr_anon_visitor_id'].length).toBeGreaterThan(8);
  });

  test('returns the same ID on subsequent calls (no new ID generated)', () => {
    const id1 = _getAnonVisitorId();
    const id2 = _getAnonVisitorId();
    expect(id1).toBe(id2);
  });

  test('respects an existing mmr_anon_visitor_id in localStorage', () => {
    _store['mmr_anon_visitor_id'] = 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb';
    expect(_getAnonVisitorId()).toBe('aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb');
  });

  test('does not encode auth tokens, student IDs, or PII into the generated ID', () => {
    // Auth and student keys must never bleed into the anonymous ID
    _store['sb-auth-auth-token']   = 'fake-jwt-XYZ';
    _store['mmr_active_student_id'] = 'student-UUID-ABC';
    const id = _getAnonVisitorId();
    expect(id).not.toContain('fake-jwt');
    expect(id).not.toContain('student-UUID');
    expect(id).not.toContain('XYZ');
    expect(id).not.toContain('ABC');
  });

  test('returns null (fail-silent) when localStorage is unavailable', () => {
    global.localStorage = {
      getItem:    () => { throw new Error('SecurityError'); },
      setItem:    () => { throw new Error('SecurityError'); },
      removeItem: () => { throw new Error('SecurityError'); },
    };
    const id = _getAnonVisitorId();
    expect(id).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('website_viewed — client-side whitelist (_ANA_VALID_EVENTS)', () => {
  const { _ANA_VALID_EVENTS } = require('../src/analytics.js');

  test('website_viewed is present in _ANA_VALID_EVENTS', () => {
    expect(_ANA_VALID_EVENTS.has('website_viewed')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('website_viewed — server-side whitelist (ALLOWED_EVENT_NAMES)', () => {
  const fs   = require('fs');
  const path = require('path');
  const src  = fs.readFileSync(
    path.join(__dirname, '..', 'netlify', 'functions', 'analytics-ingest.js'),
    'utf8',
  );

  test("website_viewed appears in ALLOWED_EVENT_NAMES source", () => {
    expect(src).toContain("'website_viewed'");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('METRIC_TO_RPC — Phase C.3B mapping', () => {
  const fs   = require('fs');
  const path = require('path');
  const src  = fs.readFileSync(
    path.join(__dirname, '..', 'netlify', 'functions', 'analytics-query.js'),
    'utf8',
  );

  test('unique_site_visits is mapped to analytics_unique_site_visits', () => {
    expect(src).toMatch(
      /['"']?unique_site_visits['"']?\s*:\s*['"]analytics_unique_site_visits['"]/,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase C.3A helpers unchanged after C.3B additions', () => {
  const { _parseBreakdown, _parseAnalyticsFilters } = require('../netlify/functions/analytics-query.js');

  test('_parseBreakdown defaults are unchanged', () => {
    expect(_parseBreakdown(undefined)).toBe('lesson');
    expect(_parseBreakdown('grade')).toBe('grade');
    expect(_parseBreakdown('bogus')).toBe('lesson');
  });

  test('_parseAnalyticsFilters defaults are unchanged', () => {
    const r = _parseAnalyticsFilters({});
    expect(r.p_days).toBe(30);
    expect(r.p_grade).toBeNull();
    expect(r.p_from).toBeNull();
    expect(r.p_to).toBeNull();
  });
});
