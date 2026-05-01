// netlify/functions/analytics-query.js
// Admin-only metrics endpoint. Requires Supabase JWT with profiles.role = 'admin'.
// Maps ?metric= to a named SECURITY DEFINER RPC (migration 20260502_analytics_rpcs.sql).
// Rate limited: 10 req/min per IP.

const METRIC_TO_RPC = {
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

  const metric  = event.queryStringParameters && event.queryStringParameters.metric;
  const rpcName = METRIC_TO_RPC[metric];
  if (!rpcName) return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'Unknown metric' }) };

  try {
    const res = await fetch(`${supaUrl}/rest/v1/rpc/${rpcName}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey },
      body:    '{}',
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
