// netlify/functions/analytics-query.js
// Admin-only metrics endpoint. Requires Supabase JWT with profiles.role = 'admin'.
// Maps ?metric= to a named SECURITY DEFINER RPC (migration 20260502_analytics_rpcs.sql).
// Rate limited: 10 req/min per IP.

// ── Filter parsing (Phase C.2) ────────────────────────────────────────────
// Admin page passes ?days=7|30|90 and ?grade=K|1|2|all (or the band tokens
// k/g1/g2). Anything else falls back to safe defaults: 30 days, all grades.
// Parameters are passed to RPCs as named arguments (p_days/p_grade), never
// concatenated into SQL.
const _ALLOWED_DAYS   = new Set([7, 30, 90]);
const _ALLOWED_GRADES = new Set(['K', '1', '2', '3', '4', '5']);
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
  // 'all' / empty / unknown → null (no grade filter applied)
  if (p_grade && !_ALLOWED_GRADES.has(p_grade)) p_grade = null;
  return { p_days: p_days, p_grade: p_grade };
}

const METRIC_TO_RPC = {
  // Phase A
  dau:              'analytics_dau',
  wau:              'analytics_wau',
  session_duration: 'analytics_session_duration',
  quiz_completion:  'analytics_quiz_completion',
  retention_1d:     'analytics_retention_1d',
  retention_7d:     'analytics_retention_7d',
  retention_30d:    'analytics_retention_30d',
  top_grades:       'analytics_top_grades',
  top_units:        'analytics_top_units',
  hardest_lessons:  'analytics_hardest_lessons',
  error_tags:       'analytics_error_tags',
  report_usage:     'analytics_report_usage',
  bill_risk:        'analytics_bill_risk',
  parent_usage:     'analytics_parent_usage',
  // Phase C.2
  mau:              'analytics_mau',
  total_students:   'analytics_total_students',
  drop_off_funnel:  'analytics_drop_off_funnel',
  top_lessons:      'analytics_top_lessons',
  hint_usage:       'analytics_hint_usage',
  free_mode_usage:  'analytics_free_mode_usage',
  reset_usage:      'analytics_reset_usage',
  unlock_usage:     'analytics_unlock_usage',
};

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

  try {
    const res = await fetch(`${supaUrl}/rest/v1/rpc/${rpcName}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey },
      body:    JSON.stringify(filters),
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

// Jest bridge — exposes the pure helper for unit testing.
if (typeof module !== 'undefined' && module.exports) {
  module.exports._parseAnalyticsFilters = _parseAnalyticsFilters;
}
