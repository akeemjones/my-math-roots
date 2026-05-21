// netlify/functions/signup-gate.js
// Server-enforced controlled-beta signup gate.
//
// THE ONLY PATH that creates parent accounts. The Supabase Dashboard setting
// "Allow new users to sign up" must be OFF in production so that the anon-key
// `supabase.auth.signUp()` call from the browser is rejected. This function
// uses the service-role key to call `auth.admin.createUser`, which bypasses
// the global disable and still triggers the standard confirmation email.
//
// Flow:
//   1. Method/origin/rate-limit checks
//   2. Validate request body (email format, password length, captchaToken)
//   3. Verify Turnstile token with Cloudflare siteverify
//   4. Read launch_settings (signup_enabled + max_parent_accounts)
//   5. Count current parent accounts
//   6. If allowed: admin.createUser (email_confirm=false → Supabase sends email)
//      If blocked: return 403 { reason: 'waitlist' | 'disabled' | 'cap_reached' }
//   7. Best-effort fire-and-forget call to the existing notify-new-signup hook

'use strict';

// ── Email normalization ─────────────────────────────────────────────────────
const _EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function _normalizeEmail(raw) {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s.length > 254) return null;        // RFC 5321 cap; rejects DoS-y inputs
  if (!_EMAIL_RE.test(s)) return null;
  return s;
}

// ── Request body validation ─────────────────────────────────────────────────
function _validateSignupRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, reason: 'invalid_body' };
  }
  const email = _normalizeEmail(body.email);
  if (!email) return { ok: false, reason: 'invalid_email' };

  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 6) return { ok: false, reason: 'short_password' };

  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken.trim() : '';
  if (!captchaToken) return { ok: false, reason: 'missing_captcha' };

  let displayName = (typeof body.displayName === 'string' ? body.displayName : '').trim();
  if (!displayName) displayName = 'Parent';
  if (displayName.length > 30) displayName = displayName.slice(0, 30);

  return { ok: true, email, password, displayName, captchaToken };
}

// ── Turnstile response parser (Cloudflare siteverify shape) ─────────────────
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

// ── Launch-settings + parent count (via service role) ───────────────────────
async function _readLaunchSettings(supaUrl, svcKey) {
  const r = await fetch(`${supaUrl}/rest/v1/launch_settings?id=eq.1&select=signup_enabled,max_parent_accounts,max_students_per_parent,waitlist_enabled`, {
    headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

// Atomically reserve one signup slot via the SECURITY DEFINER RPC. Returns
// true on success, false if the cap is reached, or null on RPC error
// (surfaced upstream as 500 reserve_unavailable). The counter is the
// single source of truth — see migration 20260604_signup_cap_atomic.sql.
async function _tryReserveSignupSlot(supaUrl, svcKey) {
  try {
    const r = await fetch(`${supaUrl}/rest/v1/rpc/try_reserve_signup_slot`, {
      method:  'POST',
      headers: {
        'apikey':        svcKey,
        'Authorization': 'Bearer ' + svcKey,
        'Content-Type':  'application/json',
      },
      body: '{}',
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j === true;
  } catch { return null; }
}

// Decrement the signup counter. Called when _adminCreateUser fails AFTER
// _tryReserveSignupSlot has already incremented it. Best-effort: errors
// are swallowed (drift is acceptable and is monitored separately by
// public.reconcile_signup_counter()).
async function _releaseSignupSlot(supaUrl, svcKey) {
  try {
    await fetch(`${supaUrl}/rest/v1/rpc/release_signup_slot`, {
      method:  'POST',
      headers: {
        'apikey':        svcKey,
        'Authorization': 'Bearer ' + svcKey,
        'Content-Type':  'application/json',
      },
      body: '{}',
    });
  } catch (_) {}
}

async function _adminCreateUser(supaUrl, svcKey, email, password, displayName) {
  const r = await fetch(`${supaUrl}/auth/v1/admin/users`, {
    method:  'POST',
    headers: {
      'apikey':        svcKey,
      'Authorization': 'Bearer ' + svcKey,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: false,                              // Supabase sends confirmation
      user_metadata: { display_name: displayName },
    }),
  });
  if (!r.ok) {
    let errText = '';
    try { errText = await r.text(); } catch (_) {}
    return { ok: false, status: r.status, error: errText };
  }
  const json = await r.json();
  return { ok: true, user: json };
}

// ── CORS + rate limit ───────────────────────────────────────────────────────
const ALLOWED_ORIGINS = ['https://mymathroots.com','https://www.mymathroots.com','https://mymathroots.netlify.app'];
function _corsH(event) {
  const o = (event.headers && event.headers.origin) || '';
  if (!ALLOWED_ORIGINS.includes(o)) return {};
  return { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
}

const _rateMap = new Map();
function _rateLimited(ip) {
  const now = Date.now();
  const e = _rateMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > e.reset) { e.count = 0; e.reset = now + 60000; }
  e.count++;
  _rateMap.set(ip, e);
  return e.count > 5;                                    // 5 signup attempts/min/IP
}

// ── Handler ──────────────────────────────────────────────────────────────────
exports.handler = async function(event) {
  const corsH = _corsH(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsH };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: corsH, body: JSON.stringify({ error: 'Method not allowed' }) };

  const ip = ((event.headers && event.headers['x-forwarded-for']) || '').split(',')[0].trim() || 'unknown';
  if (_rateLimited(ip)) return { statusCode: 429, headers: corsH, body: JSON.stringify({ error: 'Rate limited' }) };

  const supaUrl = process.env.SUPABASE_URL;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tsSec   = process.env.TURNSTILE_SECRET_KEY;
  if (!supaUrl || !svcKey || !tsSec) {
    return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'Misconfigured' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  const v = _validateSignupRequest(body);
  if (!v.ok) return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: v.reason }) };

  const captchaOk = await _verifyTurnstile(v.captchaToken, tsSec, ip);
  if (!captchaOk) return { statusCode: 403, headers: corsH, body: JSON.stringify({ error: 'turnstile_failed' }) };

  const settings = await _readLaunchSettings(supaUrl, svcKey);
  if (!settings) return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'settings_unavailable' }) };

  if (!settings.signup_enabled) {
    return { statusCode: 403, headers: corsH, body: JSON.stringify({ error: 'signup_disabled', reason: 'disabled' }) };
  }

  // Race-safe slot reservation. Counts both create-succeeds and
  // create-fails paths against the cap to prevent N parallel requests at
  // count=cap-1 all passing a stale check. See migration
  // 20260604_signup_cap_atomic.sql for the atomic UPDATE.
  const reserved = await _tryReserveSignupSlot(supaUrl, svcKey);
  if (reserved === null) {
    return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'reserve_unavailable' }) };
  }
  if (!reserved) {
    return { statusCode: 403, headers: corsH, body: JSON.stringify({ error: 'cap_reached', reason: 'cap_reached' }) };
  }

  const created = await _adminCreateUser(supaUrl, svcKey, v.email, v.password, v.displayName);
  if (!created.ok) {
    // Reservation is now leaked from the perspective of this attempt — give
    // the slot back so future signups can use it. Best-effort; drift is
    // monitored via public.reconcile_signup_counter().
    await _releaseSignupSlot(supaUrl, svcKey);
    // Most likely: email already exists (Supabase returns 422).
    if (created.status === 422 || /already/i.test(created.error || '')) {
      return { statusCode: 409, headers: corsH, body: JSON.stringify({ error: 'email_in_use' }) };
    }
    return { statusCode: 500, headers: corsH, body: JSON.stringify({ error: 'create_failed' }) };
  }

  // Fire-and-forget: existing notify-new-signup Supabase Edge Function
  try {
    fetch(`${supaUrl}/functions/v1/notify-new-signup`, {
      method:  'POST',
      headers: { 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: v.email, display_name: v.displayName }),
    }).catch(() => {});
  } catch (_) {}

  return {
    statusCode: 200,
    headers: corsH,
    body: JSON.stringify({ ok: true, email_confirmation_required: true }),
  };
};

// ── Jest bridge ──────────────────────────────────────────────────────────────
exports._normalizeEmail         = _normalizeEmail;
exports._validateSignupRequest  = _validateSignupRequest;
exports._parseTurnstileResponse = _parseTurnstileResponse;
exports._tryReserveSignupSlot   = _tryReserveSignupSlot;
exports._releaseSignupSlot      = _releaseSignupSlot;
exports.handler                 = exports.handler;
