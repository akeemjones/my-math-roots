// netlify/functions/analytics-ingest.js
// Privacy-first analytics ingest. Always returns 200 (fail-silent contract).
//
// TRUST MODEL:
//   - parent_id  → stamped from verified Supabase JWT (never from client payload)
//   - student_id → stamped from verified PIN session token OR parent ownership check
//   - Client payload never contains raw UUIDs for parent_id/student_id
//
// PRIVACY:
//   - Strips PII key names (email, name, password, phone, address) from metadata
//   - Detects email-pattern values in metadata and clears metadata entirely
//   - IP used only for in-memory rate limiting, never persisted
//
// RATE LIMITING (two layers):
//   - In-memory: 30 events/min per IP (burst protection)
//   - DB trigger: 500 events/hour per parent_id (bill-risk protection, durable)

const ALLOWED_EVENT_NAMES = new Set([
  // ── Phase A whitelist ──
  'app_opened','session_started','session_ended','grade_selected',
  'unit_started','lesson_started','lesson_completed','quiz_started',
  'quiz_completed','unit_test_started','unit_test_completed',
  'intervention_shown','intervention_completed','report_generated',
  'parent_dashboard_opened','subscription_started',
  // ── Phase B additions (2026-05-21) ──
  // KEEP IN SYNC with src/analytics.js _ANA_VALID_EVENTS and the
  // app_events_event_name_whitelist CHECK constraint (migration
  // 20260521_app_events_phase_b_events.sql).
  'student_app_opened',
  'unit_viewed',
  'lesson_viewed',
  'score_history_opened',
  'hint_used',
  'student_reset',
  'free_mode_changed',
  'manual_unlock_changed',
  'quiz_abandoned',
  'parent_dash_section_viewed',
]);
const VALID_GRADES         = new Set(['K','1','2','3','4','5']);
const MAX_EVENTS_PER_BATCH = 50;
const MAX_METADATA_CHARS   = 500;
const RATE_LIMIT_PER_MIN   = 30;
const PII_KEY_PATTERNS     = ['email','name','password','phone','address','ip'];
const UUID_RE              = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_RE                = /^[a-zA-Z0-9_\-]{1,32}$/;
const EMAIL_RE             = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

// ── In-memory rate limiter (burst protection) ─────────────────────────────
const _rateMap = new Map();
function _checkRateLimit(ip) {
  const now   = Date.now();
  const entry = _rateMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
  entry.count++;
  _rateMap.set(ip, entry);
  return entry.count > RATE_LIMIT_PER_MIN;
}

// ── JWT verification → parent_id ──────────────────────────────────────────
// Returns verified parent UUID from Supabase JWT, or null if absent/invalid.
async function _verifyJwt(authHeader, supaUrl, svcKey) {
  if (!authHeader) return null;
  const m = /^Bearer\s+([^\s]+)$/.exec(authHeader);
  if (!m) return null;
  try {
    const res = await fetch(`${supaUrl}/auth/v1/user`, {
      headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + m[1] },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return (user && user.id && UUID_RE.test(user.id)) ? user.id : null;
  } catch { return null; }
}

// ── PIN session verification → student_id ────────────────────────────────
// Returns the student UUID if the session_token is valid, or null otherwise.
async function _verifyPinSession(sessionToken, claimedStudentId, supaUrl, svcKey) {
  if (!sessionToken || !claimedStudentId) return null;
  if (!UUID_RE.test(sessionToken) || !UUID_RE.test(claimedStudentId)) return null;
  try {
    const res = await fetch(
      `${supaUrl}/rest/v1/pin_sessions?student_id=eq.${encodeURIComponent(claimedStudentId)}&session_token=eq.${encodeURIComponent(sessionToken)}&expires_at=gte.${encodeURIComponent(new Date().toISOString())}&select=student_id&limit=1`,
      { headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return (Array.isArray(rows) && rows.length > 0) ? rows[0].student_id : null;
  } catch { return null; }
}

// ── Student ownership check ───────────────────────────────────────────────
// Returns claimedStudentId if parent_id owns it, else null.
async function _verifyStudentOwnership(claimedStudentId, parentId, supaUrl, svcKey) {
  if (!claimedStudentId || !parentId) return null;
  if (!UUID_RE.test(claimedStudentId)) return null;
  try {
    const res = await fetch(
      `${supaUrl}/rest/v1/student_profiles?id=eq.${encodeURIComponent(claimedStudentId)}&parent_id=eq.${encodeURIComponent(parentId)}&select=id&limit=1`,
      { headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return (Array.isArray(rows) && rows.length > 0) ? claimedStudentId : null;
  } catch { return null; }
}

// ── PII stripping ─────────────────────────────────────────────────────────
function _stripPiiKeys(obj, depth) {
  if (!obj || typeof obj !== 'object' || depth > 3) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const kl = k.toLowerCase();
    if (PII_KEY_PATTERNS.some(p => kl.includes(p))) continue;
    out[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? _stripPiiKeys(v, depth + 1) : v;
  }
  return out;
}
function _containsEmailValue(obj) {
  return obj && typeof obj === 'object'
    && Object.values(obj).some(v => typeof v === 'string' && EMAIL_RE.test(v));
}

// ── Event validation ──────────────────────────────────────────────────────
// Returns a sanitized event or null. Does NOT set parent_id/student_id —
// those are stamped by the caller after credential verification.
function _validateEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.event_name !== 'string' || !ALLOWED_EVENT_NAMES.has(raw.event_name)) return null;
  const client_event_id = typeof raw.client_event_id === 'string'
    ? raw.client_event_id.slice(0, 128) : null;
  if (!client_event_id) return null;

  const grade     = VALID_GRADES.has(raw.grade) ? raw.grade : null;
  const unit_id   = (typeof raw.unit_id   === 'string' && ID_RE.test(raw.unit_id))   ? raw.unit_id   : null;
  const lesson_id = (typeof raw.lesson_id === 'string' && ID_RE.test(raw.lesson_id)) ? raw.lesson_id : null;

  // claimed_student_id: kept for server-side verification only; never written directly
  const claimed_student_id = (typeof raw.claimed_student_id === 'string' && UUID_RE.test(raw.claimed_student_id))
    ? raw.claimed_student_id : null;

  let metadata = (raw.metadata_json && typeof raw.metadata_json === 'object')
    ? _stripPiiKeys(raw.metadata_json, 0) : {};
  if (_containsEmailValue(metadata)) metadata = {};
  if (JSON.stringify(metadata).length > MAX_METADATA_CHARS) metadata = {};

  return { event_name: raw.event_name, client_event_id, grade, unit_id, lesson_id,
           metadata_json: metadata, claimed_student_id };
}

// ── CORS ─────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = ['https://mymathroots.com','https://www.mymathroots.com','https://mymathroots.netlify.app'];
function _corsHeaders(event) {
  const origin = (event.headers && event.headers.origin) || '';
  if (!ALLOWED_ORIGINS.includes(origin)) return {};
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Vary': 'Origin' };
}

const OK = (h) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json', ...h }, body: '{"ok":true}' });

exports.handler = async function(event) {
  const corsH = _corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsH };
  if (event.httpMethod !== 'POST') return OK(corsH);

  const ip = ((event.headers && event.headers['x-forwarded-for']) || '').split(',')[0].trim() || 'unknown';
  if (_checkRateLimit(ip)) return OK(corsH); // fail-silent on rate limit

  let body;
  try { body = JSON.parse(event.body); } catch { return OK(corsH); }

  const rawEvents = Array.isArray(body && body.events) ? body.events : null;
  if (!rawEvents || rawEvents.length === 0) return OK(corsH);

  const supaUrl = process.env.SUPABASE_URL;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !svcKey) return OK(corsH);

  // ── Credential verification ───────────────────────────────────────────
  const authHeader   = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const sessionToken = (typeof body.session_token === 'string' && UUID_RE.test(body.session_token))
    ? body.session_token : null;
  const claimedStudentFromBody = (typeof body.student_id === 'string' && UUID_RE.test(body.student_id))
    ? body.student_id : null;

  // Body-embedded JWT fallback for sendBeacon (cannot set custom headers)
  const bodyJwt    = (typeof body._supaJwt === 'string') ? body._supaJwt : null;
  const jwtToVerify = authHeader || (bodyJwt ? 'Bearer ' + bodyJwt : '');

  // Verify parent JWT (if present)
  const verifiedParentId = await _verifyJwt(jwtToVerify, supaUrl, svcKey);

  // Verify student identity (two paths, mutually exclusive)
  let verifiedStudentId = null;
  if (sessionToken && claimedStudentFromBody) {
    // PIN session path: student is logged in without parent JWT
    verifiedStudentId = await _verifyPinSession(sessionToken, claimedStudentFromBody, supaUrl, svcKey);
  } else if (verifiedParentId && claimedStudentFromBody) {
    // Parent JWT path: parent claims a student_id — verify ownership
    verifiedStudentId = await _verifyStudentOwnership(claimedStudentFromBody, verifiedParentId, supaUrl, svcKey);
  }

  // ── Validate events ───────────────────────────────────────────────────
  const validEvents = rawEvents.slice(0, MAX_EVENTS_PER_BATCH).map(_validateEvent).filter(Boolean);
  if (validEvents.length === 0) return OK(corsH);

  // ── Per-event student_id override (Phase C.1) ─────────────────────────
  // An event may carry its own `claimed_student_id` (e.g. parent-dashboard
  // actions that target a student other than the one in the batch claim).
  // For each such override, verify ownership against the verified parent
  // JWT. Unowned overrides resolve to NULL — they NEVER fall back to the
  // batch-level student. Ownership lookups are cached per-batch to avoid
  // hitting student_profiles N times.
  const ownershipCache = new Map();
  async function _perEventStudent(eventClaimedSid) {
    if (!eventClaimedSid) return verifiedStudentId; // no override → batch-level
    // Fast path: claim matches the already-verified PIN-session student.
    if (eventClaimedSid === verifiedStudentId) return verifiedStudentId;
    // Per-event override requires a parent JWT to verify against. Without
    // one we cannot trust the claim — null-stamp instead of guessing.
    if (!verifiedParentId) return null;
    if (ownershipCache.has(eventClaimedSid)) return ownershipCache.get(eventClaimedSid);
    const verified = await _verifyStudentOwnership(eventClaimedSid, verifiedParentId, supaUrl, svcKey);
    ownershipCache.set(eventClaimedSid, verified);
    return verified;
  }

  // ── Build DB rows (stamp server-verified IDs) ─────────────────────────
  const rows = [];
  for (const e of validEvents) {
    const stamped = await _perEventStudent(e.claimed_student_id);
    rows.push({
      client_event_id: e.client_event_id,
      event_name:      e.event_name,
      parent_id:       verifiedParentId || null,
      student_id:      stamped          || null,
      grade:           e.grade,
      unit_id:         e.unit_id,
      lesson_id:       e.lesson_id,
      metadata_json:   e.metadata_json,
    });
  }

  try {
    const res = await fetch(`${supaUrl}/rest/v1/app_events`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        svcKey,
        'Authorization': 'Bearer ' + svcKey,
        'Prefer':        'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      if (!txt.includes('analytics_hourly_cap_exceeded')) {
        console.error('[analytics-ingest] insert failed:', res.status, txt.slice(0, 200));
      }
    }
  } catch (e) {
    console.error('[analytics-ingest] network error:', e.message);
  }

  return OK(corsH);
};
