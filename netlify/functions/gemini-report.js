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
// Verifies the 14-day window using student_profiles (service role — not user-forgeable).
// Returns:
//   null                                          → no cooldown active, allow generation
//   { nextAvailMs, savedText: string|null }       → cooldown active; savedText is the previously generated report (if any)
async function _checkServerCooldown(studentId) {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supaUrl = process.env.SUPABASE_URL;
  if (!svcKey || !supaUrl || !studentId) return null;

  try {
    const res = await fetch(
      `${supaUrl}/rest/v1/student_profiles?id=eq.${encodeURIComponent(studentId)}&select=report_last_generated,report_last_text`,
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
    if (!ts) return null;
    const lastMs = new Date(ts).getTime();
    if (isNaN(lastMs)) return null;
    const nextAvailMs = lastMs + REPORT_COOL_MS;
    if (nextAvailMs <= Date.now()) return null;
    return { nextAvailMs: nextAvailMs, savedText: rows[0].report_last_text || null };
  } catch (e) {
    return null;
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

  // Diagnostic fields (added 2026-04-30 — Generate Report diagnostics upgrade).
  // All sourced from intervention_events + MASTERY; capped tightly.
  s.topErrorTags = [];
  if (Array.isArray(d.topErrorTags)) {
    d.topErrorTags.slice(0, 6).forEach(t => {
      if (!t || typeof t !== 'object') return;
      s.topErrorTags.push({
        label: _sanitizeStr(t.label, 80),
        count: _sanitizeNum(t.count, 0),
      });
    });
  }

  s.misconceptionPatterns = [];
  if (Array.isArray(d.misconceptionPatterns)) {
    d.misconceptionPatterns.slice(0, 5).forEach(m => {
      if (!m || typeof m !== 'object') return;
      s.misconceptionPatterns.push({
        label:       _sanitizeStr(m.label, 80),
        description: _sanitizeStr(m.description, 200),
      });
    });
  }

  s.interventionSummary = null;
  if (d.interventionSummary && typeof d.interventionSummary === 'object') {
    s.interventionSummary = {
      total:        _sanitizeNum(d.interventionSummary.total, 0),
      recoveryRate: _sanitizeNum(d.interventionSummary.recoveryRate, 0),
    };
  }

  s.recoveryPatterns = [];
  if (Array.isArray(d.recoveryPatterns)) {
    d.recoveryPatterns.slice(0, 6).forEach(r => {
      if (!r || typeof r !== 'object') return;
      s.recoveryPatterns.push({
        label:        _sanitizeStr(r.label, 80),
        attempts:     _sanitizeNum(r.attempts, 0),
        recoveryRate: _sanitizeNum(r.recoveryRate, 0),
      });
    });
  }

  s.repeatedMistakes = [];
  if (Array.isArray(d.repeatedMistakes)) {
    d.repeatedMistakes.slice(0, 8).forEach(m => {
      if (!m || typeof m !== 'object') return;
      s.repeatedMistakes.push({
        label:       _sanitizeStr(m.label, 80),
        wrongCount:  _sanitizeNum(m.wrongCount, 0),
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
* Avoid dense technical jargon. Do not use these words in the report itself: "JSON", "telemetry", "UI", "tags", "intervention events", "mastery hashes".
* Keep sentences concise. Use bullet points heavily within sections for quick readability.
* Use careful, observational language: "may be confusing", "appears to", "suggests".
* Never say "does not understand", "failed", "is bad at", or "cannot do".

**STRICT FORMATTING CONSTRAINTS (CRITICAL)**
You MUST output the report using EXACTLY these four markdown headings and nothing else. Do not output any conversational filler (e.g., "Here is the report") before the first heading or after the last section. Do not use single \`#\` or triple \`###\` headings. You must use exactly \`## \`.

## Overview
## Strengths
## Areas to Grow
## Recommended Next Steps

**HOW TO USE THE DIAGNOSTIC DATA (CRITICAL)**

The payload may include these diagnostic fields. When present, weave them into the relevant sections — don't list them mechanically.

* \`topErrorTags\` — recurring mistake patterns. Each item has a \`label\` (already parent-friendly — use it verbatim) and a \`count\`. Use these in "Areas to Grow" to be specific. Example: instead of "needs work in Place Value", write "appears to be confusing tens and hundreds (came up about 6 times this period)".
* For any \`topErrorTags\` item with a \`count\` of 1 or 2, soften the language ("came up a couple of times") or fold it into a more general observation rather than calling it out as a recurring pattern.
* \`misconceptionPatterns\` — clusters of related errors. Each item has a \`label\` and a brief \`description\`. Reference these to explain *what kind* of mistake is happening.
* \`interventionSummary\` — \`{ total, recoveryRate }\`. \`recoveryRate\` is the % of times the student got a question right on the very next try after a teaching moment. Mention high recovery rates (≥70%) as a strength ("recovers quickly when shown a hint"). Mention low rates (<40%) gently in "Areas to Grow".
* \`recoveryPatterns\` — per-tag recovery breakdown. Use this to identify which mistake types resolve quickly vs. which need more practice.
* \`repeatedMistakes\` — questions the student has answered wrong multiple times. The \`label\` field is an internal question ID — never show it or quote it to the parent. Use only the \`wrongCount\` as a signal that this question type needs more practice in your "Recommended Next Steps" suggestions.

If a diagnostic field is missing, null, or empty, omit that thread entirely. Do not invent data and do not say "no diagnostic data available" — just write the report from what you have.

**DATA INTEGRITY RULES (ZERO HALLUCINATION)**
* Every claim must be grounded in the JSON. If accuracy is low in a unit, address it gently but factually.
* If a field is missing/null, omit it. Do not invent filler data or assume.
* In "Recommended Next Steps", give specific, practical at-home actions tied to the detected mistake patterns. Example: if \`topErrorTags\` shows tens/hundreds confusion, recommend base-ten blocks or expanded-form practice. If it shows off-by-one counting, recommend counting real objects together.`;
}

// User message: sanitised student data as JSON — what Gemini analyses.
function _buildUserMessage(studentName, reportData) {
  const safeName = studentName.replace(/[^a-zA-Z0-9 '\-]/g, '').trim() || 'Student';
  const d = _sanitizeReportData(reportData);
  const payload = { studentName: safeName, ...d };
  return JSON.stringify(payload, null, 2);
}

// ── Persist report (server-side write) ────────────────────────────────────
// Server-side write so cooldown enforcement and re-view-during-cooldown both
// see the same source of truth. Uses service role to bypass RLS.
async function _persistReport(studentId, reportText) {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supaUrl = process.env.SUPABASE_URL;
  if (!svcKey || !supaUrl || !studentId) return;
  try {
    const res = await fetch(
      `${supaUrl}/rest/v1/student_profiles?id=eq.${encodeURIComponent(studentId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': svcKey,
          'Authorization': 'Bearer ' + svcKey,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          report_last_generated: new Date().toISOString(),
          report_last_text: reportText,
        }),
      }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('persistReport non-ok:', res.status, txt.slice(0, 200));
    }
  } catch (e) {
    // Non-fatal — client also stores localStorage timestamp; cooldown check will retry.
    console.error('persistReport failed:', e.message);
  }
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

  // Server-side 14-day cooldown check (not bypassable by the client).
  // Returns the saved report text if cooldown is active so the client can show "View Last Report".
  // SECURITY: studentId is client-supplied and only length-validated here.
  // The function relies on IP rate-limiting + the 14-day cooldown for abuse
  // resistance. A future hardening pass should JWT-verify that the studentId
  // belongs to the authenticated parent (student_profiles.parent_id = auth.uid()).
  if (studentId && typeof studentId === 'string' && studentId.length <= 64) {
    const cooldown = await _checkServerCooldown(studentId);
    if (cooldown) {
      const nextDate = new Date(cooldown.nextAvailMs).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json', ...corsH },
        body: JSON.stringify({
          error: 'cooldown',
          nextAvailable: cooldown.nextAvailMs,
          nextDate: nextDate,
          report: cooldown.savedText,
        }),
      };
    }
  }

  const sysInstr = _buildSystemInstruction();
  const userMsg  = _buildUserMessage(studentName, reportData);

  try {
    const text = await callGemini(sysInstr, userMsg);
    // Awaited (not fire-and-forget): Netlify can freeze the container after the
    // response, dropping pending promises. Losing this write would let the next
    // request re-call Gemini and burn the cooldown twice.
    if (studentId && typeof studentId === 'string' && studentId.length <= 64) {
      await _persistReport(studentId, text);
    }
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
