// netlify/functions/analytics-query.js
// Admin-only metrics endpoint. Requires Supabase JWT with profiles.role = 'admin'.
// Maps ?metric= to a named SECURITY DEFINER RPC (migration 20260502_analytics_rpcs.sql).
// Rate limited: 10 req/min per IP.

// ── Filter parsing (Phase C.2 + C.3A follow-up) ──────────────────────────
// Admin page passes:
//   ?days=7|30|90                                (preset window)
//   ?grade=K|1|2|all                             (band token also accepted)
//   ?from=YYYY-MM-DD & ?to=YYYY-MM-DD            (custom range, overrides days)
// Anything else falls back to safe defaults: 30 days, all grades.
// Parameters are passed to RPCs as named args (p_days / p_grade / p_from /
// p_to). No SQL string concatenation anywhere — the RPCs themselves treat
// `p_from`/`p_to` as TIMESTAMPTZ inputs.
const _ALLOWED_DAYS   = new Set([7, 30, 90]);
const _ALLOWED_GRADES = new Set(['K', '1', '2', '3', '4', '5']);
const _DATE_RE        = /^\d{4}-\d{2}-\d{2}$/;
const _FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;  // accept up to ~1 day past 'now' for clock skew / today

// Returns the ISO start-of-day UTC for a strictly-formatted YYYY-MM-DD, or
// null if the input is not a real date. Strict: rejects e.g. '2026-13-99'.
function _parseUtcStartOfDay(s) {
  if (typeof s !== 'string' || !_DATE_RE.test(s)) return null;
  var d = new Date(s + 'T00:00:00.000Z');
  if (isNaN(d.getTime())) return null;
  // Round-trip check: '2026-13-99' would parse to a Date via Date overflow.
  // Insist the parsed Date renders back to the same YYYY-MM-DD.
  if (d.toISOString().slice(0, 10) !== s) return null;
  return d;
}

function _parseAnalyticsFilters(params) {
  var p = params || {};

  // Days — strict: only pure positive integers as strings or numbers; anything
  // with extra characters ('7; DROP', '7d', '-7') is rejected.
  var dRaw = p.days;
  var d;
  if (typeof dRaw === 'number' && Number.isInteger(dRaw) && dRaw > 0) {
    d = dRaw;
  } else if (typeof dRaw === 'string' && /^[1-9][0-9]*$/.test(dRaw)) {
    d = parseInt(dRaw, 10);
  } else {
    d = null;
  }
  var p_days = (d !== null && _ALLOWED_DAYS.has(d)) ? d : 30;

  // Grade — accept canonical + band tokens, treat 'all' / empty / unknown as no filter
  var gRaw = p.grade;
  var gStr = (gRaw == null) ? '' : String(gRaw).trim().toLowerCase();
  var p_grade = null;
  if (gStr === 'k' || gStr === 'kindergarten')              p_grade = 'K';
  else if (gStr === '1' || gStr === 'g1' || gStr === 'grade1') p_grade = '1';
  else if (gStr === '2' || gStr === 'g2' || gStr === 'grade2') p_grade = '2';
  else if (gStr === '3' || gStr === 'g3' || gStr === 'grade3') p_grade = '3';
  else if (gStr === '4' || gStr === 'g4' || gStr === 'grade4') p_grade = '4';
  else if (gStr === '5' || gStr === 'g5' || gStr === 'grade5') p_grade = '5';
  if (p_grade && !_ALLOWED_GRADES.has(p_grade)) p_grade = null;

  // Custom date range — both ends must be valid. Invalid pairs silently fall
  // back to preset days (admin UI is expected to validate before sending,
  // but the server is the authoritative gatekeeper).
  var p_from = null, p_to = null;
  var dFrom = _parseUtcStartOfDay(p.from);
  var dTo   = _parseUtcStartOfDay(p.to);
  if (dFrom && dTo && dFrom.getTime() <= dTo.getTime()) {
    var maxAllowedTo = Date.now() + _FUTURE_TOLERANCE_MS;
    if (dTo.getTime() <= maxAllowedTo) {
      // start-of-day UTC for `from`, end-of-day UTC for `to`
      p_from = dFrom.toISOString();
      p_to   = new Date(dTo.getTime() + 86399999).toISOString();  // +23:59:59.999
      // Custom range supersedes the preset window
      p_days = null;
    }
  }

  return { p_days: p_days, p_grade: p_grade, p_from: p_from, p_to: p_to };
}

// ── Breakdown parsing (Phase C.3A) ────────────────────────────────────────
// analytics_avg_score is the only RPC that takes a third parameter the
// admin can vary at request time. Validated against a strict allow-list
// both here and in the RPC body itself (defense in depth). Unknown input
// defaults to 'lesson' — the most-specific, most-useful breakdown.
const _ALLOWED_BREAKDOWNS = new Set(['grade', 'unit', 'lesson']);
function _parseBreakdown(raw) {
  if (typeof raw !== 'string') return 'lesson';
  var s = raw.trim().toLowerCase();
  if (_ALLOWED_BREAKDOWNS.has(s)) return s;
  return 'lesson';
}

const METRIC_TO_RPC = {
  // Phase A
  dau:                  'analytics_dau',
  wau:                  'analytics_wau',
  session_duration:     'analytics_session_duration',
  quiz_completion:      'analytics_quiz_completion',
  retention_1d:         'analytics_retention_1d',
  retention_7d:         'analytics_retention_7d',
  retention_30d:        'analytics_retention_30d',
  top_grades:           'analytics_top_grades',
  top_units:            'analytics_top_units',
  hardest_lessons:      'analytics_hardest_lessons',
  error_tags:           'analytics_error_tags',
  report_usage:         'analytics_report_usage',
  bill_risk:            'analytics_bill_risk',
  parent_usage:         'analytics_parent_usage',
  // Phase C.2
  mau:                  'analytics_mau',
  total_students:       'analytics_total_students',
  drop_off_funnel:      'analytics_drop_off_funnel',
  top_lessons:          'analytics_top_lessons',
  hint_usage:           'analytics_hint_usage',
  free_mode_usage:      'analytics_free_mode_usage',
  reset_usage:          'analytics_reset_usage',
  unlock_usage:         'analytics_unlock_usage',
  // Phase C.3A
  new_signups:          'analytics_new_signups',
  returning_students:   'analytics_returning_students',
  sessions_per_student: 'analytics_sessions_per_student',
  avg_score:            'analytics_avg_score',
};

// Metrics that accept p_breakdown in addition to p_days/p_grade.
const _METRICS_WITH_BREAKDOWN = new Set(['avg_score']);

const _rateMap = new Map();
function _checkRateLimit(ip) {
  const now = Date.now();
  const e = _rateMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > e.reset) { e.count = 0; e.reset = now + 60000; }
  e.count++;
  _rateMap.set(ip, e);
  return e.count > 10;
}

async function _verifyAdmin(authHeader, supaUrl, svcKey) {
  if (!authHeader) return false;
  const m = /^Bearer\s+([^\s]+)$/.exec(authHeader);
  if (!m) return false;
  try {
    const r1 = await fetch(`${supaUrl}/auth/v1/user`, {
      headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + m[1] },
    });
    if (!r1.ok) return false;
    const user = await r1.json();
    if (!user || !user.id) return false;
    const r2 = await fetch(
      `${supaUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
      { headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey } }
    );
    if (!r2.ok) return false;
    const rows = await r2.json();
    return Array.isArray(rows) && rows.length > 0 && rows[0].role === 'admin';
  } catch { return false; }
}

const ALLOWED_ORIGINS = ['https://mymathroots.com','https://www.mymathroots.com','https://mymathroots.netlify.app'];
function _corsH(event) {
  const o = (event.headers && event.headers.origin) || '';
  if (!ALLOWED_ORIGINS.includes(o)) return {};
  return { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Vary': 'Origin' };
}

exports.handler = async function(event) {
  const corsH = _corsH(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsH };

  const ip = ((event.headers && event.headers['x-forwarded-for']) || '').split(',')[0].trim() || 'unknown';
  if (_checkRateLimit(ip)) return { statusCode: 429, headers: corsH, body: JSON.stringify({ error: 'Rate limited' }) };

  const supaUrl = process.env.SUPABASE_URL;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !svcKey) return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'Misconfigured' }) };

  const authH   = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const isAdmin = await _verifyAdmin(authH, supaUrl, svcKey);
  if (!isAdmin) return { statusCode: 401, headers: corsH, body: JSON.stringify({ error: 'Unauthorized' }) };

  const qs      = event.queryStringParameters || {};
  const metric  = qs.metric;
  const rpcName = METRIC_TO_RPC[metric];
  if (!rpcName) return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'Unknown metric' }) };

  // Validated filter values — pass as named RPC args. RPCs declare matching
  // p_days INTEGER DEFAULT 30 / p_grade TEXT DEFAULT NULL signatures.
  const filters = _parseAnalyticsFilters(qs);
  // Phase C.3A: a small set of RPCs also accept p_breakdown. Attach when relevant.
  const rpcArgs = _METRICS_WITH_BREAKDOWN.has(metric)
    ? Object.assign({}, filters, { p_breakdown: _parseBreakdown(qs.breakdown) })
    : filters;

  try {
    const res = await fetch(`${supaUrl}/rest/v1/rpc/${rpcName}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey },
      body:    JSON.stringify(rpcArgs),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'Query failed', detail: txt.slice(0, 200) }) };
    }
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsH }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: e.message }) };
  }
};

// Jest bridge — exposes the pure helpers for unit testing.
if (typeof module !== 'undefined' && module.exports) {
  module.exports._parseAnalyticsFilters = _parseAnalyticsFilters;
  module.exports._parseBreakdown        = _parseBreakdown;
}
