// ════════════════════════════════════════════════════════
//  ANALYTICS — Privacy-first internal event tracker
//  COPPA-safe: no PII, no third-party calls, fail-silent.
//  Batches events and flushes via sendBeacon (unload) or
//  fetch every 10s. parent_id/student_id are NEVER in the
//  event payload — they are stamped server-side from
//  verified credentials sent at flush time.
// ════════════════════════════════════════════════════════

var _ANA_INGEST_URL     = '/.netlify/functions/analytics-ingest';
var _ANA_MAX_QUEUE      = 50;
var _ANA_FLUSH_INTERVAL = 10000;
var _ANA_RATE_KEY       = 'analytics';
var _ANA_RATE_MAX       = 20;
var _ANA_META_MAX       = 500;
var _ANA_PII_KEYS       = ['email','name','password','phone','address'];

var _ANA_VALID_EVENTS = new Set([
  // ── Phase A whitelist ──
  'app_opened','session_started','session_ended','grade_selected',
  'unit_started','lesson_started','lesson_completed','quiz_started',
  'quiz_completed','unit_test_started','unit_test_completed',
  'intervention_shown','intervention_completed','report_generated',
  'parent_dashboard_opened','subscription_started',
  // ── Phase B additions (2026-05-21) ──
  // KEEP IN SYNC with netlify/functions/analytics-ingest.js ALLOWED_EVENT_NAMES
  // and the app_events_event_name_whitelist CHECK constraint.
  'student_app_opened',          // student session is active and home rendered
  'unit_viewed',                 // student opened a unit page (deduped per session/unit)
  'lesson_viewed',               // student opened a lesson page (deduped per session/lesson)
  'score_history_opened',        // student tapped through to Score History
  'hint_used',                   // student revealed a hint (fires once per question)
  'student_reset',               // parent successfully reset a student's data
  'free_mode_changed',           // parent toggled Free Mode in the unlock UI
  'manual_unlock_changed',       // parent manually unlocked/relocked a unit or lesson
  'quiz_abandoned',              // quiz quit/restarted before completion
  'parent_dash_section_viewed',  // reserved — dashboard sections not yet collapsible
  // ── Phase C.3B (2026-05-21) ──
  'website_viewed',              // public site visit, deduped once per calendar day
  // ── Launch Gate (2026-05-21) ──
  'waitlist_viewed',             // waitlist panel shown
  'waitlist_joined',             // user submitted waitlist email
  'signup_gate_viewed',          // signup gate panel shown (cap reached or signups disabled)
  'signup_blocked_capacity',     // signup attempt rejected by cap
  'launch_settings_updated',     // admin changed launch controls
]);

// ── Per-event student-id override (Phase C.1) ─────────────────────────────
//
// Pure helper: takes a metadata object that may contain a special key
// `_override_student_id` and returns { claimed_student_id, metadata }.
//
// Use case: the parent dashboard knows which student each action targets
// (`_activeId`), but `localStorage.mmr_active_student_id` may still point to
// a different student from a prior PIN/launch session. By passing
// `_override_student_id: <uuid>` in the event metadata, the dashboard tells
// the tracker (and ultimately the server) which student this specific event
// is about. The server still verifies parent ownership of the claimed
// student before stamping `student_id` — an invalid or unowned override
// resolves to NULL, never to the batch-level student.
//
// The key is stripped from metadata regardless of whether the value was a
// valid UUID, so the special marker never leaks into the DB column.
var _ANA_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function _anaExtractOverride(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { claimed_student_id: null, metadata: {} };
  }
  var out = {};
  var override = null;
  var keys = Object.keys(metadata);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k === '_override_student_id') {
      var v = metadata[k];
      if (typeof v === 'string' && _ANA_UUID_RE.test(v)) override = v;
      // else: drop silently — invalid override never reaches the server
      continue;
    }
    out[k] = metadata[k];
  }
  return { claimed_student_id: override, metadata: out };
}

// ── Anonymous visitor ID (Phase C.3B) ────────────────────────────────────────
// Generates a random, persistent identifier stored in localStorage under
// mmr_anon_visitor_id. Used only to dedup website_viewed events at the
// aggregate level (count distinct IDs per day). Never tied to auth, student
// data, IP, or any PII. Falls back to an opaque timestamp+random string when
// crypto.randomUUID is unavailable. Returns null if localStorage is blocked.
function _getAnonVisitorId() {
  var KEY = 'mmr_anon_visitor_id';
  try {
    var id = localStorage.getItem(KEY);
    if (id) return id;
    var newId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : ('anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11));
    localStorage.setItem(KEY, newId);
    return newId;
  } catch (_) { return null; }
}

// ── View-event dedup (in-memory; clears on page reload or explicit reset) ──
// Used to suppress repeat fires of `unit_viewed` / `lesson_viewed` /
// `student_app_opened` etc. that would otherwise spam every time openUnit /
// openLesson re-renders. Keys must include the active student id so a
// profile-switcher swap legitimately re-fires for the new student. Pass the
// sentinel '__reset__' to clear the set (used by profile-switcher flows).
var _anaSeenKeys = Object.create(null);
function _anaShouldFire(key) {
  if (key === '__reset__') { _anaSeenKeys = Object.create(null); return false; }
  if (typeof key !== 'string' || !key) return false;
  if (_anaSeenKeys[key]) return false;
  _anaSeenKeys[key] = 1;
  return true;
}

var _anaQueue            = [];
var _anaFlushTimer       = null;
var _anaFlushing         = false;
var _anaSessionStartTs   = 0;
var _anaSessionEndedSent = false; // dedup: only fire session_ended once per page
var _anaParentDashFired  = false; // dedup: only fire the family-open event once per load

// ── Privacy: strip PII keys from metadata ────────────────────────────────
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

// ── Auth-context decision (pure; testable in Node) ───────────────────────
//
// Phase A fix (2026-05-21): the previous version gated student-id attribution
// on (role==='student' AND mmr_session_token). Parent-launched student
// sessions (enterStudentLearningSession with sessionToken=null — e.g.
// dashboard "Go to App", in-session profile switcher parent-bypass) set
// role='student' but no PIN token, so neither branch fired and student_id
// stayed null on 99%+ of events. Now the PIN-session path and the
// parent-JWT-ownership path are independent. Server-side trust is unchanged:
// the Netlify ingest function still verifies every claimed student via
// pin_sessions lookup OR student_profiles.parent_id ownership check before
// stamping the row.
//
// Inputs (all values may be null/undefined):
//   storage.supaJwt          — Supabase access_token from sb-auth-auth-token
//   storage.role             — mmr_user_role  ('student' | 'parent' | null)
//   storage.sessionToken     — mmr_session_token (UUID; only set on PIN flow)
//   storage.activeStudentId  — mmr_active_student_id (UUID | 'local' | null)
//
// Output: { sessionToken, claimedSid } — both null when no valid attribution.
function _anaResolveAttribution(storage) {
  if (!storage || typeof storage !== 'object') {
    return { sessionToken: null, claimedSid: null };
  }
  var sid = (typeof storage.activeStudentId === 'string'
             && storage.activeStudentId
             && storage.activeStudentId !== 'local')
            ? storage.activeStudentId : null;

  // Path 1 — PIN session: role==='student' AND PIN token AND non-local student.
  // Server verifies via pin_sessions(student_id, session_token, expires_at).
  if (storage.role === 'student' && storage.sessionToken && sid) {
    return { sessionToken: storage.sessionToken, claimedSid: sid };
  }

  // Path 2 — Parent JWT ownership: supaJwt AND non-local student.
  // Role is intentionally ignored — parent-launched student sessions set
  // role='student' but supply no PIN token; parent on dashboard with an
  // active student also flows through here. Server verifies via
  // student_profiles(id, parent_id) ownership check.
  if (storage.supaJwt && sid) {
    return { sessionToken: null, claimedSid: sid };
  }

  // No reliable attribution — server stamps student_id = NULL.
  return { sessionToken: null, claimedSid: null };
}

// ── Auth context for flush (reads localStorage, defers decision to pure fn) ─
function _anaGetAuthContext() {
  var supaJwt = null;
  try {
    var raw = localStorage.getItem('sb-auth-auth-token') || localStorage.getItem('supabase.auth.token');
    if (raw) {
      var parsed = JSON.parse(raw);
      var tok = parsed && (parsed.access_token || (parsed.currentSession && parsed.currentSession.access_token));
      if (tok) supaJwt = tok;
    }
  } catch (_) {}

  var role             = null;
  var sessionToken     = null;
  var activeStudentId  = null;
  try {
    role            = localStorage.getItem('mmr_user_role');
    sessionToken    = localStorage.getItem('mmr_session_token');
    activeStudentId = localStorage.getItem('mmr_active_student_id');
  } catch (_) {}

  var decided = _anaResolveAttribution({
    supaJwt:         supaJwt,
    role:            role,
    sessionToken:    sessionToken,
    activeStudentId: activeStudentId,
  });

  return {
    supaJwt:      supaJwt,
    sessionToken: decided.sessionToken,
    claimedSid:   decided.claimedSid,
  };
}

// ── Flush ─────────────────────────────────────────────────────────────────
function _anaFlush(useBeacon) {
  if (_anaFlushing && !useBeacon) return;
  if (_anaQueue.length === 0) return;

  var auth   = _anaGetAuthContext();
  var events = _anaQueue.splice(0, _anaQueue.length);

  if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      var beaconBody = JSON.stringify({
        events:        events,
        student_id:    auth.claimedSid    || undefined,
        session_token: auth.sessionToken  || undefined,
        _supaJwt:      auth.supaJwt       || undefined,
      });
      navigator.sendBeacon(_ANA_INGEST_URL, new Blob([beaconBody], { type: 'application/json' }));
    } catch (_) {}
    return;
  }

  var headers = { 'Content-Type': 'application/json' };
  if (auth.supaJwt) headers['Authorization'] = 'Bearer ' + auth.supaJwt;

  var payload = JSON.stringify({
    events:        events,
    student_id:    auth.claimedSid   || undefined,
    session_token: auth.sessionToken || undefined,
  });

  _anaFlushing = true;
  fetch(_ANA_INGEST_URL, { method: 'POST', headers: headers, body: payload, keepalive: true })
    .catch(function() {})
    .finally(function() { _anaFlushing = false; });
}

function _anaScheduleFlush() {
  if (_anaFlushTimer) return;
  _anaFlushTimer = setInterval(function() { try { _anaFlush(false); } catch (_) {} }, _ANA_FLUSH_INTERVAL);
}

// ── Visibility / unload handlers ─────────────────────────────────────────
(function() {
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', function() {
    try {
      if (document.visibilityState === 'hidden') {
        var role = localStorage.getItem('mmr_user_role');
        if (role === 'student' && _anaSessionStartTs && !_anaSessionEndedSent) {
          _anaSessionEndedSent = true;
          var g = localStorage.getItem('mmr_grade');
          _trackEvent('session_ended', {
            duration_secs: Math.round((Date.now() - _anaSessionStartTs) / 1000),
            grade: g || null,
          });
        }
        _anaFlush(true);
      }
    } catch (_) {}
  });
  window.addEventListener('pagehide', function() {
    try {
      var role = localStorage.getItem('mmr_user_role');
      if (role === 'student' && _anaSessionStartTs && !_anaSessionEndedSent) {
        _anaSessionEndedSent = true;
        var g = localStorage.getItem('mmr_grade');
        _trackEvent('session_ended', {
          duration_secs: Math.round((Date.now() - _anaSessionStartTs) / 1000),
          grade: g || null,
        });
      }
      _anaFlush(true);
    } catch (_) {}
  });
})();

// ── Public API ────────────────────────────────────────────────────────────
// _trackEvent(event_name, metadata)
//   Fail-silent: never throws, never surfaces errors to caller.
function _trackEvent(event_name, metadata) {
  try {
    if (typeof event_name !== 'string' || !_ANA_VALID_EVENTS.has(event_name)) return;
    if (typeof _rateLimit === 'function' && !_rateLimit(_ANA_RATE_KEY, _ANA_RATE_MAX)) return;

    var safeMeta = _anaStripPii(metadata || {});
    // Extract the per-event student override BEFORE size + PII checks so the
    // special key never counts toward metadata_json size and never lands
    // in the DB column.
    var _ext = _anaExtractOverride(safeMeta);
    safeMeta = _ext.metadata;
    if (JSON.stringify(safeMeta).length > _ANA_META_MAX) safeMeta = {};

    var evt = {
      client_event_id:    event_name + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      event_name:         event_name,
      metadata_json:      safeMeta,
      grade:              safeMeta.grade || null,
      unit_id:            null,
      lesson_id:          null,
      claimed_student_id: _ext.claimed_student_id,
    };

    if (safeMeta.unit_id)   { evt.unit_id   = safeMeta.unit_id;   delete safeMeta.unit_id;   }
    if (safeMeta.lesson_id) { evt.lesson_id = safeMeta.lesson_id; delete safeMeta.lesson_id; }
    if (safeMeta.grade)     { delete safeMeta.grade; }

    _anaQueue.push(evt);
    if (_anaQueue.length > _ANA_MAX_QUEUE) _anaQueue.shift();
    if (_anaQueue.length >= 10) { try { _anaFlush(false); } catch (_) {} }
    _anaScheduleFlush();
  } catch (_) {
    if (typeof _isDev !== 'undefined' && _isDev) console.warn('[analytics] _trackEvent error', _);
  }
}

// ── Jest bridge ──────────────────────────────────────────────────────────────
// Browser ignores `module`; Node test runners pick up the export. Only the
// pure decision function is exported — _trackEvent and _anaFlush touch DOM
// + global timers that aren't relevant to unit tests.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _anaResolveAttribution: _anaResolveAttribution,
    _ANA_VALID_EVENTS:      _ANA_VALID_EVENTS,
    _anaShouldFire:         _anaShouldFire,
    _anaExtractOverride:    _anaExtractOverride,
    _getAnonVisitorId:      _getAnonVisitorId,
  };
}
