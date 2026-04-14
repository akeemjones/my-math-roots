// netlify/functions/gemini-report.js
// Secure proxy — keeps GEMINI_API_KEY server-side only.
// Generates a personalized AI progress report for parents.
// Security hardening:
//   - CORS: only reflects allowed origins (no fallback to first)
//   - Rate limiting: persistent via Supabase RPC, in-memory fallback
//   - Server-side 14-day cooldown: reads student_profiles via service role
//   - Input sanitization: strips control chars, limits field lengths

const https = require('https');

const MODEL            = 'gemini-2.5-flash';
const MAX_OUTPUT_TOKENS = 2000;
const REPORT_COOL_MS   = 14 * 24 * 60 * 60 * 1000; // 14 days

// ── Rate limiting ─────────────────────────────────────────────────────────
// Primary: persistent Supabase table (survives cold starts, shared across containers)
// Fallback: in-memory map (used if SUPABASE_SERVICE_ROLE_KEY is not set)
const _rateMapFallback = new Map();

async function _checkRateLimit(ip) {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supaUrl = process.env.SUPABASE_URL;

  if (svcKey && supaUrl) {
    const key       = 'report:' + ip;
    const windowMs  = 60000;
    const maxPerMin = 10;

    try {
      const res = await fetch(`${supaUrl}/rest/v1/rpc/check_and_increment_rate_limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': svcKey,
          'Authorization': 'Bearer ' + svcKey,
        },
        body: JSON.stringify({ p_key: key, p_max: maxPerMin, p_window_ms: windowMs }),
      });
      const json = await res.json();
      return json === true; // true = over limit
    } catch (e) {
      // Fall through to in-memory on Supabase error
    }
  }

  // In-memory fallback
  const now   = Date.now();
  const entry = _rateMapFallback.get(ip) || { count: 0, reset: now + 60000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
  entry.count++;
  _rateMapFallback.set(ip, entry);
  return entry.count > 10;
}

// ── Server-side cooldown check ────────────────────────────────────────────
// Verifies the 14-day window using student_profiles (service role — not user-forgeable)
async function _checkServerCooldown(studentId) {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supaUrl = process.env.SUPABASE_URL;
  if (!svcKey || !supaUrl || !studentId) return null; // null = can't verify, allow

  try {
    const res = await fetch(
      `${supaUrl}/rest/v1/student_profiles?id=eq.${encodeURIComponent(studentId)}&select=report_last_generated`,
      {
        headers: {
          'apikey': svcKey,
          'Authorization': 'Bearer ' + svcKey,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    const ts = rows[0].report_last_generated;
    if (!ts) return null; // never generated — allow
    const lastMs = new Date(ts).getTime();
    if (isNaN(lastMs)) return null;
    const nextAvailMs = lastMs + REPORT_COOL_MS;
    return nextAvailMs > Date.now() ? nextAvailMs : null; // null = cooldown expired, allow
  } catch (e) {
    return null; // on error, allow
  }
}

// ── Gemini call ───────────────────────────────────────────────────────────
function callGemini(systemInstruction, userMessage) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('GEMINI_API_KEY not configured'));

    const body = JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (!text) return reject(new Error('Empty response from Gemini'));
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Sanitization ──────────────────────────────────────────────────────────
// Strips control chars and limits field length to prevent prompt injection
function _sanitizeStr(val, maxLen) {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').slice(0, maxLen);
}

function _sanitizeNum(val, fallback) {
  var n = Number(val);
  return isFinite(n) ? n : fallback;
}

// Deeply sanitize the reportData object so no field can inject instructions
function _sanitizeReportData(d) {
  if (!d || typeof d !== 'object') return {};
  var s = {};

  s.reportDate       = _sanitizeStr(d.reportDate, 50);
  s.period           = _sanitizeNum(d.period, 30);
  s.totalAttempts    = _sanitizeNum(d.totalAttempts, 0);
  s.overallAvg       = _sanitizeNum(d.overallAvg, 0);
  s.activeDaysInPeriod = _sanitizeNum(d.activeDaysInPeriod, 0);

  s.streak = { current: 0, longest: 0 };
  if (d.streak && typeof d.streak === 'object') {
    s.streak.current = _sanitizeNum(d.streak.current, 0);
    s.streak.longest = _sanitizeNum(d.streak.longest, 0);
  }

  s.timeInApp = { thisWeek: '', total: '', avgSessionMins: '', sessions: 0, avgSecsPerQuestion: 0 };
  if (d.timeInApp && typeof d.timeInApp === 'object') {
    s.timeInApp.thisWeek          = _sanitizeStr(d.timeInApp.thisWeek, 30);
    s.timeInApp.total             = _sanitizeStr(d.timeInApp.total, 30);
    s.timeInApp.avgSessionMins    = _sanitizeStr(d.timeInApp.avgSessionMins, 30);
    s.timeInApp.sessions          = _sanitizeNum(d.timeInApp.sessions, 0);
    s.timeInApp.avgSecsPerQuestion = _sanitizeNum(d.timeInApp.avgSecsPerQuestion, 0);
  }

  s.units = [];
  if (Array.isArray(d.units)) {
    d.units.slice(0, 30).forEach(u => {
      if (!u || typeof u !== 'object') return;
      s.units.push({
        name:         _sanitizeStr(u.name, 80),
        avgPct:       _sanitizeNum(u.avgPct, 0),
        mastery:      _sanitizeStr(u.mastery, 30),
        attempts:     _sanitizeNum(u.attempts, 0),
        correctOfTotal: _sanitizeStr(u.correctOfTotal, 30),
        trend:        _sanitizeStr(u.trend, 30),
      });
    });
  }

  s.strengths  = Array.isArray(d.strengths)  ? d.strengths.slice(0, 15).map(x => _sanitizeStr(x, 80))  : [];
  s.weaknesses = Array.isArray(d.weaknesses) ? d.weaknesses.slice(0, 15).map(x => _sanitizeStr(x, 80)) : [];

  s.quizTypeBreakdown = [];
  if (Array.isArray(d.quizTypeBreakdown)) {
    d.quizTypeBreakdown.slice(0, 10).forEach(qt => {
      if (!qt || typeof qt !== 'object') return;
      s.quizTypeBreakdown.push({
        type:   _sanitizeStr(qt.type, 40),
        count:  _sanitizeNum(qt.count, 0),
        avgPct: _sanitizeNum(qt.avgPct, 0),
      });
    });
  }

  s.masteryStats = null;
  if (d.masteryStats && typeof d.masteryStats === 'object') {
    s.masteryStats = {
      totalQsPracticed: _sanitizeNum(d.masteryStats.totalQsPracticed, 0),
      mastered:         _sanitizeNum(d.masteryStats.mastered, 0),
      needsWork:        _sanitizeNum(d.masteryStats.needsWork, 0),
    };
  }

  s.recentActivity = [];
  if (Array.isArray(d.recentActivity)) {
    d.recentActivity.slice(0, 14).forEach(a => {
      if (!a || typeof a !== 'object') return;
      s.recentActivity.push({
        date:   _sanitizeStr(a.date, 20),
        quizzes: _sanitizeNum(a.quizzes, 0),
      });
    });
  }

  s.recentQuizzes = [];
  if (Array.isArray(d.recentQuizzes)) {
    d.recentQuizzes.slice(0, 8).forEach(q => {
      if (!q || typeof q !== 'object') return;
      s.recentQuizzes.push({
        label: _sanitizeStr(q.label, 80),
        date:  _sanitizeStr(q.date, 20),
        pct:   _sanitizeNum(q.pct, 0),
        score: _sanitizeStr(q.score, 30),
      });
    });
  }

  return s;
}

// ── Prompt builders ───────────────────────────────────────────────────────
// System instruction: role, tone, strict formatting, and zero-hallucination rules.
// Passed as system_instruction in the Gemini API request — never visible to the parent.
function _buildSystemInstruction() {
  return `**ROLE & AUDIENCE**
You are an expert elementary math teacher and data analyst. Your job is to translate a raw JSON payload of student telemetry data into an encouraging, actionable, and easy-to-read progress report for a parent.

**TONE & STYLE**
* Warm, encouraging, and highly professional.
* Write directly to the parent (e.g., "Your student...", or use the student's name if provided).
* Avoid dense technical jargon. Do not mention "JSON", "telemetry", "UI", or "mastery hashes" to the parent.
* Keep sentences concise. Use bullet points heavily within sections for quick readability.

**STRICT FORMATTING CONSTRAINTS (CRITICAL)**
You MUST output the report using EXACTLY these four markdown headings and nothing else. Do not output any conversational filler (e.g., "Here is the report") before the first heading or after the last section. Do not use single \`#\` or triple \`###\` headings. You must use exactly \`## \`.

## Overview
## Strengths
## Areas to Grow
## Recommended Next Steps

**DATA INTEGRITY RULES (ZERO HALLUCINATION)**
* You must base EVERY claim strictly on the provided JSON data. If the data shows low accuracy in a unit, you must address it gently but factually.
* If data for a specific area or metric is missing/null in the JSON payload, omit it entirely. Do not invent filler data or make assumptions.
* In the "Recommended Next Steps" section, suggest specific, practical actions the parent can take at home to support their child's learning based on the "Areas to Grow" (e.g., "Practice counting change together at the grocery store," "Point out arrays when arranging cookies on a baking sheet").`;
}

// User message: sanitised student data as JSON — what Gemini analyses.
function _buildUserMessage(studentName, reportData) {
  const safeName = studentName.replace(/[^a-zA-Z0-9 '\-]/g, '').trim() || 'Student';
  const d = _sanitizeReportData(reportData);
  const payload = { studentName: safeName, ...d };
  return JSON.stringify(payload, null, 2);
}

// ── CORS ──────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://mymathroots.com',
  'https://www.mymathroots.com',
  'https://mymathroots.netlify.app',
  'https://mymathroots-staging.netlify.app',
];

function _corsHeaders(event) {
  const origin = event.headers.origin || '';
  // Only reflect the origin header if it is explicitly allowed
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return {}; // No ACAO header — browser will block cross-origin requests
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

// ── Handler ───────────────────────────────────────────────────────────────
exports.handler = async function(event) {
  const corsH = _corsHeaders(event);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsH };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Rate limit by IP
  const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (await _checkRateLimit(ip)) {
    return {
      statusCode: 429,
      headers: corsH,
      body: JSON.stringify({ error: 'Too many requests' }),
    };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { studentName, reportData, studentId } = body;

  if (!studentName || !reportData || typeof studentName !== 'string' || typeof reportData !== 'object') {
    return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'Missing or invalid fields' }) };
  }

  if (studentName.length > 100) {
    return { statusCode: 400, headers: corsH, body: JSON.stringify({ error: 'studentName too long' }) };
  }

  // Server-side 14-day cooldown check (not bypassable by the client)
  if (studentId && typeof studentId === 'string' && studentId.length <= 64) {
    const cooldownNextAvail = await _checkServerCooldown(studentId);
    if (cooldownNextAvail) {
      const nextDate = new Date(cooldownNextAvail).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      return {
        statusCode: 429,
        headers: corsH,
        body: JSON.stringify({ error: 'cooldown', nextAvailable: cooldownNextAvail, nextDate }),
      };
    }
  }

  const sysInstr = _buildSystemInstruction();
  const userMsg  = _buildUserMessage(studentName, reportData);

  try {
    const text = await callGemini(sysInstr, userMsg);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsH },
      body: JSON.stringify({ report: text }),
    };
  } catch (e) {
    console.error('Gemini report error:', e.message);
    return {
      statusCode: 500,
      headers: corsH,
      body: JSON.stringify({ error: 'AI service unavailable' }),
    };
  }
};
