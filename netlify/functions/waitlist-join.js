// netlify/functions/waitlist-join.js
// Server-enforced waitlist join. The ONLY path that writes
// public.waitlist_entries.
//
// Prior to this function the frontend called supabase.rpc('join_waitlist')
// directly with the anon key — no rate limit, no Turnstile, and a
// distinguishable already_on_list response (user enumeration). This
// function:
//   1. Validates origin / method / in-memory burst rate-limit (5/min/IP).
//   2. Validates the request body (email + source + Turnstile token).
//   3. Verifies the Turnstile token with Cloudflare siteverify.
//   4. Applies a durable rate limit per IP via the Supabase RPC
//      public.check_and_increment_rate_limit.
//   5. Calls public.join_waitlist_internal via the service-role key
//      (legacy join_waitlist RPC is REVOKEd from anon/authenticated).
//   6. Returns 200 {ok:true} on every success path — new or duplicate —
//      so the caller cannot enumerate which emails are already listed.

'use strict';

// ── Email normalization (mirrors signup-gate.js _normalizeEmail) ────────────
const _EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function _normalizeEmail(raw) {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s.length > 254) return null;
  if (!_EMAIL_RE.test(s)) return null;
  return s;
}

// ── Request body validation ─────────────────────────────────────────────────
const _ALLOWED_SOURCES = new Set(['login_screen', 'signup_screen', 'header_cta', 'cap_reached', 'manual']);
function _validateWaitlistRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, reason: 'invalid_body' };
  }
  const email = _normalizeEmail(body.email);
  if (!email) return { ok: false, reason: 'invalid_email' };

  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken.trim() : '';
  if (!captchaToken) return { ok: false, reason: 'missing_captcha' };

  // source is allow-listed; unknown values silently coerce to 'login_screen'
  // so the database column stays clean (waitlist_entries.source has no
  // CHECK constraint).
  let source = typeof body.source === 'string' ? body.source.trim() : '';
  if (!_ALLOWED_SOURCES.has(source)) source = 'login_screen';

  return { ok: true, email, source, captchaToken };
}

// ── Turnstile verification (siteverify) ────────────────────────────────────
function _parseTurnstileResponse(json) {
  if (!json || typeof json !== 'object') return false;
  return json.success === true;
}

async function _verifyTurnstile(token, secret, remoteIp) {
  if (!token || !secret) return false;
  try {
    const params = new URLSearchParams();
    params.set('secret',   secret);
    params.set('response', token);
    if (remoteIp) params.set('remoteip', remoteIp);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });
    if (!r.ok) return false;
    const json = await r.json();
    return _parseTurnstileResponse(json);
  } catch { return false; }
}

// ── Durable per-IP rate limit via check_and_increment_rate_limit RPC ───────
// Returns true if the request is OVER the limit (should be rejected). The
// RPC body (verified in production, see 20260608_rate_limit_rpc.sql) returns
// TRUE when count > p_max. We use the IP as the key; 10 attempts per
// 15-min window per IP.
const _WAITLIST_RPS_MAX        = 10;
const _WAITLIST_RPS_WINDOW_MS  = 15 * 60 * 1000;
async function _isRateLimited(supaUrl, svcKey, ip) {
  if (!ip || ip === 'unknown') return false; // can't key without an IP — fall back to in-memory limit below
  try {
    const r = await fetch(`${supaUrl}/rest/v1/rpc/check_and_increment_rate_limit`, {
      method:  'POST',
      headers: {
        'apikey':        svcKey,
        'Authorization': 'Bearer ' + svcKey,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        p_key:       'waitlist:' + ip,
        p_max:       _WAITLIST_RPS_MAX,
        p_window_ms: _WAITLIST_RPS_WINDOW_MS,
      }),
    });
    if (!r.ok) return false; // RPC failure must not block legitimate users
    const j = await r.json();
    return j === true;
  } catch { return false; }
}

// ── Service-role-only insert ───────────────────────────────────────────────
async function _joinWaitlistInternal(supaUrl, svcKey, email, source) {
  try {
    const r = await fetch(`${supaUrl}/rest/v1/rpc/join_waitlist_internal`, {
      method:  'POST',
      headers: {
        'apikey':        svcKey,
        'Authorization': 'Bearer ' + svcKey,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ p_email: email, p_source: source }),
    });
    return r.ok;
  } catch { return false; }
}

// ── CORS + in-memory burst rate limit ──────────────────────────────────────
const ALLOWED_ORIGINS = ['https://mymathroots.com','https://www.mymathroots.com','https://mymathroots.netlify.app'];
function _corsH(event) {
  const o = (event.headers && event.headers.origin) || '';
  if (!ALLOWED_ORIGINS.includes(o)) return {};
  return { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
}

const _rateMap = new Map();
function _burstRateLimited(ip) {
  const now = Date.now();
  const e = _rateMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > e.reset) { e.count = 0; e.reset = now + 60000; }
  e.count++;
  _rateMap.set(ip, e);
  return e.count > 5;  // 5 attempts/min/IP (burst protection; durable layer above)
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async function(event) {
  const corsH = _corsH(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsH };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: corsH, body: JSON.stringify({ error: 'Method not allowed' }) };

  const ip = ((event.headers && event.headers['x-forwarded-for']) || '').split(',')[0].trim() || 'unknown';
  if (_burstRateLimited(ip)) return { statusCode: 429, headers: corsH, body: JSON.stringify({ error: 'Rate limited' }) };

  const supaUrl = process.env.SUPABASE_URL;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tsSec   = process.env.TURNSTILE_SECRET_KEY;
  if (!supaUrl || !svcKey || !tsSec) {
    return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'Misconfigured' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  const v = _validateWaitlistRequest(body);
  if (!v.ok) return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: v.reason }) };

  const captchaOk = await _verifyTurnstile(v.captchaToken, tsSec, ip);
  if (!captchaOk) return { statusCode: 403, headers: corsH, body: JSON.stringify({ error: 'turnstile_failed' }) };

  if (await _isRateLimited(supaUrl, svcKey, ip)) {
    // Same shape as burst rate-limit. Generic to avoid enumerating which
    // emails / IPs are being filtered.
    return { statusCode: 429, headers: corsH, body: JSON.stringify({ error: 'Rate limited' }) };
  }

  // Best-effort insert; the RPC silently no-ops on duplicate or invalid
  // email shape. Either way we present a single 200 — non-enumerating.
  await _joinWaitlistInternal(supaUrl, svcKey, v.email, v.source);

  return { statusCode: 200, headers: corsH, body: JSON.stringify({ ok: true }) };
};

// ── Jest bridge ────────────────────────────────────────────────────────────
exports._normalizeEmail          = _normalizeEmail;
exports._validateWaitlistRequest = _validateWaitlistRequest;
exports._parseTurnstileResponse  = _parseTurnstileResponse;
exports._verifyTurnstile         = _verifyTurnstile;
exports._isRateLimited           = _isRateLimited;
exports._joinWaitlistInternal    = _joinWaitlistInternal;
