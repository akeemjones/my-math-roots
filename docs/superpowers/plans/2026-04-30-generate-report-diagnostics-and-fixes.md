# Generate Report — Diagnostics & System Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the AI Generate Report (a) actually use the diagnostic data the app already collects, and (b) fix five known UX/system gaps identified in the 2026-04-30 investigation report.

**Architecture:**
- **Server (`netlify/functions/gemini-report.js`):** Extend the system instruction with rules for translating diagnostic data into parent-friendly language. Extend the sanitizer to accept new diagnostic fields. Move the `report_last_generated` write server-side and add a `report_last_text` write so the report text persists. On a 14-day cooldown 429, return the saved text in the JSON body so the parent can re-view it.
- **Client (`src/dashboard.js`):** Extend `_buildDashboardPayload` to include diagnostic fields derived from the existing `_summarizeInterventions()` output and intervention events store. Parse 429 responses to distinguish cooldown vs rate-limit. Render a "View Last Report" button when on cooldown with saved text. Gate the Generate Report button when student has insufficient data so a brand-new student can't burn the 14-day window.
- **Schema (`supabase/migrations/`):** New nullable column `student_profiles.report_last_text TEXT NULL`. Real migration file checked in (past migrations were applied via the Supabase dashboard only — fix that here).

**Tech Stack:** Vanilla JS (ES5 style, IIFE-free), Netlify Functions (Node 18, no third-party deps), Supabase Postgres + service-role REST, Jest 29 for tests.

**Constraints carried forward from the user spec:**
- Do NOT change auth, quiz logic, dashboard layout, footer spacing, safe-area/PWA recovery.
- Do NOT change cooldown length (14 days) or the Gemini model (`gemini-2.5-flash`).
- Do NOT change Gemini temperature (0.6) without explicit approval.
- Sanitize all new fields server-side. Cap arrays. No raw attempt logs.
- Translate `err_*` tag names into parent-friendly language before Gemini sees them — never expose raw tags.

**Out-of-scope tech-debt acknowledged but NOT addressed here:**
- The legacy `dashboard/dashboard.js` (kept only for the existing test harness) will not be edited. Existing tests continue to import from there. New tests for new helpers import from `src/dashboard.js`.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `supabase/migrations/20260430_report_last_text.sql` | **Create** | Add `report_last_text TEXT NULL` column to `student_profiles` |
| `netlify/functions/gemini-report.js` | **Modify** | Extended system instruction, expanded sanitizer, server-side persistence write, cooldown response carries saved text |
| `src/dashboard.js` | **Modify** | Diagnostic fields in payload, 429 body parsing, View Last Report button, no-data gating, new SELECT column |
| `tests/report-payload.test.js` | **Create** | Unit tests for the new payload-builder helpers |

---

## Task 1: Add `report_last_text` Supabase migration

**Files:**
- Create: `supabase/migrations/20260430_report_last_text.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- ══════════════════════════════════════════════════════════════
--  Migration: report_last_text column on student_profiles
--  2026-04-30
--
--  Adds a nullable TEXT column that stores the most recent
--  AI-generated parent report. Lets parents re-view the last
--  report during the 14-day cooldown window without re-calling
--  Gemini.
--
--  Companion to the existing report_last_generated column
--  (added via dashboard before this repo had checked-in migrations).
--  This file is also a backfill point if you need to recreate the
--  schema from scratch — see the IF NOT EXISTS block below.
-- ══════════════════════════════════════════════════════════════

-- 1. Backfill report_last_generated if it doesn't exist yet (idempotent).
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS report_last_generated TIMESTAMPTZ;

-- 2. New column for the report body text.
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS report_last_text TEXT;

-- No RLS change needed — student_profiles already has the
-- "parent_owns_profiles" policy from 20260330_student_profiles.sql,
-- and this column is read/written by the same parent.
```

- [ ] **Step 2: Apply to the live Supabase project**

The live database doesn't auto-pick-up files from this folder — past migrations were applied through the Supabase dashboard. Apply this one the same way (or via `supabase db push` if the CLI is configured):

1. Open the Supabase SQL editor for project `omjegwtzirskgmgeojdn`.
2. Paste the contents of `supabase/migrations/20260430_report_last_text.sql`.
3. Run.
4. Verify: `SELECT column_name FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='report_last_text';` should return one row.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260430_report_last_text.sql
git commit -m "feat(db): add report_last_text column to student_profiles"
```

---

## Task 2: Server — extend system instruction with diagnostic-data rules

**Files:**
- Modify: `netlify/functions/gemini-report.js:235-257` (`_buildSystemInstruction`)

- [ ] **Step 1: Replace `_buildSystemInstruction()` body**

Replace the current `_buildSystemInstruction` (lines 235-257) with:

```javascript
function _buildSystemInstruction() {
  return `**ROLE & AUDIENCE**
You are an expert elementary math teacher and data analyst. Your job is to translate a raw JSON payload of student telemetry data into an encouraging, actionable, and easy-to-read progress report for a parent.

**TONE & STYLE**
* Warm, encouraging, and highly professional.
* Write directly to the parent (e.g., "Your student...", or use the student's name if provided).
* Avoid dense technical jargon. Do not mention "JSON", "telemetry", "UI", "tags", "intervention events", or "mastery hashes" to the parent.
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
* \`misconceptionPatterns\` — clusters of related errors. Each item has a \`label\` and a brief \`description\`. Reference these to explain *what kind* of mistake is happening.
* \`interventionSummary\` — \`{ total, recoveryRate }\`. \`recoveryRate\` is the % of times the student got a question right on the very next try after a teaching moment. Mention high recovery rates (≥70%) as a strength ("recovers quickly when shown a hint"). Mention low rates (<40%) gently in "Areas to Grow".
* \`recoveryPatterns\` — per-tag recovery breakdown. Use this to identify which mistake types resolve quickly vs. which need more practice.
* \`repeatedMistakes\` — questions the student has answered wrong multiple times. Treat as concrete signal for the Recommended Next Steps section.

If a diagnostic field is missing, null, or empty, omit that thread entirely. Do not invent data and do not say "no diagnostic data available" — just write the report from what you have.

**DATA INTEGRITY RULES (ZERO HALLUCINATION)**
* Every claim must be grounded in the JSON. If accuracy is low in a unit, address it gently but factually.
* If a field is missing/null, omit it. Do not invent filler data or assume.
* In "Recommended Next Steps", give specific, practical at-home actions tied to the detected mistake patterns. Example: if \`topErrorTags\` shows tens/hundreds confusion, recommend base-ten blocks or expanded-form practice. If it shows off-by-one counting, recommend counting real objects together.`;
}
```

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/gemini-report.js
git commit -m "feat(report): teach Gemini how to use diagnostic fields"
```

---

## Task 3: Server — sanitize new diagnostic payload fields

**Files:**
- Modify: `netlify/functions/gemini-report.js:141-230` (`_sanitizeReportData`)

- [ ] **Step 1: Append diagnostic-field sanitization to `_sanitizeReportData`**

Add this block immediately before the `return s;` at the end of `_sanitizeReportData` (currently line 229):

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/gemini-report.js
git commit -m "feat(report): sanitize new diagnostic fields server-side"
```

---

## Task 4: Server — persist report text and return it on cooldown 429

**Files:**
- Modify: `netlify/functions/gemini-report.js`
  - `_checkServerCooldown` (lines 58-85) — also return saved text
  - Handler (lines 326-358) — write `report_last_text` and `report_last_generated` server-side after success; pass saved text in cooldown 429 body

- [ ] **Step 1: Update `_checkServerCooldown` to also return saved text**

Replace `_checkServerCooldown` (lines 58-85) with:

```javascript
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
```

- [ ] **Step 2: Add a helper to write the report back to Supabase**

Add this helper above the `// ── CORS ──` divider (currently line 267):

```javascript
// Persist successful report — server-side write so cooldown enforcement and
// re-view-during-cooldown both see the same source of truth.
async function _persistReport(studentId, reportText) {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supaUrl = process.env.SUPABASE_URL;
  if (!svcKey || !supaUrl || !studentId) return;
  try {
    await fetch(
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
  } catch (e) {
    // Non-fatal — client also stores localStorage timestamp; cooldown check will retry.
    console.error('persistReport failed:', e.message);
  }
}
```

- [ ] **Step 3: Update the cooldown branch in the handler**

Replace the cooldown branch in the handler (currently lines 326-339) with:

```javascript
  // Server-side 14-day cooldown check (not bypassable by the client).
  // Returns the saved report text if cooldown is active so the client can show "View Last Report".
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
```

- [ ] **Step 4: Persist after a successful Gemini call**

Replace the successful-response branch (currently lines 344-350) with:

```javascript
  try {
    const text = await callGemini(sysInstr, userMsg);
    if (studentId && typeof studentId === 'string' && studentId.length <= 64) {
      await _persistReport(studentId, text);
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsH },
      body: JSON.stringify({ report: text }),
    };
  } catch (e) {
```

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/gemini-report.js
git commit -m "feat(report): persist report text server-side; return on cooldown 429"
```

---

## Task 5: Client — derive diagnostic fields and add to payload

**Files:**
- Modify: `src/dashboard.js:1712-1826` (`_buildDashboardPayload`)
- Modify: `src/dashboard.js:4427-4441` (Jest export bridge)
- Create: `tests/report-payload.test.js`

- [ ] **Step 1: Add a pure helper `_deriveReportDiagnostics` above `_buildDashboardPayload`**

Insert this function immediately before `function _buildDashboardPayload(` at line 1712. It uses the same `_summarizeInterventions` shape that already exists at line 3120 — reuse it, don't redefine.

```javascript
// Pure helper: turn raw intervention events + mastery into the parent-facing
// diagnostic shape Gemini sees. Kept pure so it can be unit-tested.
//
// events  : array from _getInterventionEvents() / _remoteInterventionEvents
//           shape: { type, errorTag, sessionId, resolvedCorrectly, timestamp }
// mastery : student.MASTERY map { qid → { attempts, correct } }
// labelFn : function(tag) → friendly label (parent-facing, no err_ prefix)
// helpFn  : function(tag) → short description / null
function _deriveReportDiagnostics(events, mastery, labelFn, helpFn) {
  events  = Array.isArray(events) ? events : [];
  mastery = mastery && typeof mastery === 'object' ? mastery : {};
  labelFn = typeof labelFn === 'function' ? labelFn : function(t){ return t; };
  helpFn  = typeof helpFn  === 'function' ? helpFn  : function(){ return null; };

  // ── interventionSummary + per-tag recovery from events ──
  var byTag = {};
  var totalTrig = 0;
  var totalResolved = 0;
  events.forEach(function(e) {
    if (!e || !e.errorTag) return;
    if (!byTag[e.errorTag]) byTag[e.errorTag] = { triggered: 0, resolved: 0 };
    if (e.type === 'triggered') { byTag[e.errorTag].triggered++; totalTrig++; }
    if (e.type === 'resolved' && e.resolvedCorrectly) {
      byTag[e.errorTag].resolved++; totalResolved++;
    }
  });

  var topErrorTags = Object.keys(byTag)
    .map(function(t){ return { tag: t, count: byTag[t].triggered }; })
    .filter(function(t){ return t.count > 0; })
    .sort(function(a,b){ return b.count - a.count; })
    .slice(0, 6)
    .map(function(t){ return { label: labelFn(t.tag), count: t.count }; });

  var misconceptionPatterns = topErrorTags
    .filter(function(t){ return helpFn(_tagFromLabel(t.label, byTag, labelFn)); })
    .slice(0, 5)
    .map(function(t){
      var rawTag = _tagFromLabel(t.label, byTag, labelFn);
      return { label: t.label, description: helpFn(rawTag) };
    });

  var interventionSummary = totalTrig > 0
    ? { total: totalTrig, recoveryRate: Math.round((totalResolved / totalTrig) * 100) }
    : null;

  var recoveryPatterns = Object.keys(byTag)
    .filter(function(t){ return byTag[t].triggered >= 2; })
    .map(function(t){
      return {
        label:        labelFn(t),
        attempts:     byTag[t].triggered,
        recoveryRate: Math.round((byTag[t].resolved / byTag[t].triggered) * 100),
      };
    })
    .sort(function(a,b){ return b.attempts - a.attempts; })
    .slice(0, 6);

  // ── repeatedMistakes from MASTERY (qid wrong ≥2 times) ──
  var repeatedMistakes = Object.keys(mastery)
    .map(function(k){
      var m = mastery[k] || {};
      var wrong = (m.attempts || 0) - (m.correct || 0);
      return { label: k, wrongCount: wrong };
    })
    .filter(function(r){ return r.wrongCount >= 2; })
    .sort(function(a,b){ return b.wrongCount - a.wrongCount; })
    .slice(0, 8);

  return {
    topErrorTags:          topErrorTags,
    misconceptionPatterns: misconceptionPatterns,
    interventionSummary:   interventionSummary,
    recoveryPatterns:      recoveryPatterns,
    repeatedMistakes:      repeatedMistakes,
  };
}

// Reverse-lookup tag from label; we keep the mapping local because labelFn
// is not necessarily injective.
function _tagFromLabel(label, byTag, labelFn) {
  var found = null;
  Object.keys(byTag).some(function(t){
    if (labelFn(t) === label) { found = t; return true; }
    return false;
  });
  return found;
}
```

- [ ] **Step 2: Wire diagnostics into `_buildDashboardPayload`**

In the `return { ... }` block at the end of `_buildDashboardPayload` (currently lines 1804-1825), insert one line that pulls diagnostics. Replace the return statement with:

```javascript
  // Diagnostic fields — only included when intervention events exist.
  // Tries remote-synced events first, falls back to local events store.
  var rawEvents = (typeof _remoteInterventionEvents !== 'undefined' && _remoteInterventionEvents && _remoteInterventionEvents.length)
    ? _remoteInterventionEvents
    : _getInterventionEvents();
  var diagnostics = _deriveReportDiagnostics(
    rawEvents,
    mastery,
    _friendlyInterventionTagSafe,
    _interventionHelpSafe
  );

  return {
    reportDate: new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
    period: 'Last '+days+' days',
    totalAttempts: period.length,
    overallAvg: avg,
    streak: { current: (streak&&streak.current)||0, longest: (streak&&streak.longest)||0 },
    activeDaysInPeriod: activeDays,
    timeInApp: {
      thisWeek:           weekSecs>0              ? Math.round(weekSecs/60)+' min'        : 'not tracked',
      total:              (appTime.totalSecs||0)>0 ? Math.round(appTime.totalSecs/60)+' min' : 'not tracked',
      avgSessionMins:     avgSessionSecs>0         ? Math.round(avgSessionSecs/60)+' min' : null,
      avgSecsPerQuestion: qCount>0                 ? Math.round(qSum/qCount)               : null,
      sessions:           appTime.sessions||0
    },
    recentActivity: recentActivity,
    units: units,
    strengths:  strengths.length  ? strengths  : ['No units at 80%+ yet'],
    weaknesses: weaknesses.length ? weaknesses : ['No weak areas identified'],
    quizTypeBreakdown: quizTypeBreakdown,
    recentQuizzes: recentQuizzes,
    masteryStats: masteryStats,
    topErrorTags:          diagnostics.topErrorTags,
    misconceptionPatterns: diagnostics.misconceptionPatterns,
    interventionSummary:   diagnostics.interventionSummary,
    recoveryPatterns:      diagnostics.recoveryPatterns,
    repeatedMistakes:      diagnostics.repeatedMistakes,
  };
}
```

- [ ] **Step 3: Add the safe wrapper helpers above `_deriveReportDiagnostics`**

Insert right above `function _deriveReportDiagnostics(`:

```javascript
// Safe wrappers: _friendlyInterventionTag and _ERR_HELP_MAP live further down
// the file, so guard against ordering issues / unit tests where they are absent.
function _friendlyInterventionTagSafe(tag) {
  if (typeof _friendlyInterventionTag === 'function') {
    var label = _friendlyInterventionTag(tag);
    if (label) return label;
  }
  return _toTitleCase ? _toTitleCase(String(tag).replace(/^err_/, '')) : String(tag);
}
function _interventionHelpSafe(tag) {
  if (typeof _ERR_HELP_MAP === 'object' && _ERR_HELP_MAP) return _ERR_HELP_MAP[tag] || null;
  return null;
}
```

- [ ] **Step 4: Export the new helper for testing**

Update the Jest bridge at `src/dashboard.js:4429-4440` — add `_deriveReportDiagnostics` to the export object:

```javascript
if (typeof module !== 'undefined') {
  module.exports = {
    getCategoryFromId,
    _computeOverallStats,
    _computeSkillBreakdown,
    _computeWeakAreas,
    _computeActivityData,
    _computeReviewQueue,
    _parseUnlockSettings,
    _parseTimerSettings,
    _isUnitUnlockedInDraft,
    _isLessonUnlockedInDraft,
    _deriveReportDiagnostics,
  };
}
```

- [ ] **Step 5: Write the failing tests**

Create `tests/report-payload.test.js`:

```javascript
'use strict';

// Same localStorage stub trick as dashboard.test.js — src/dashboard.js
// references localStorage at module load.
if (typeof globalThis.localStorage === 'undefined') {
  const _store = new Map();
  globalThis.localStorage = {
    getItem(k)    { return _store.has(k) ? _store.get(k) : null; },
    setItem(k, v) { _store.set(String(k), String(v)); },
    removeItem(k) { _store.delete(k); },
    clear()       { _store.clear(); },
  };
}

const { _deriveReportDiagnostics } = require('../src/dashboard.js');

const labelFn = (tag) => ({
  err_off_by_one: 'Counting by ones (off-by-one)',
  err_same:       'Reusing the same answer',
}[tag] || tag);

const helpFn = (tag) => ({
  err_off_by_one: 'May be miscounting by one when adding or counting up.',
}[tag] || null);

describe('_deriveReportDiagnostics', () => {
  test('returns empty diagnostics when no events and no mastery', () => {
    const out = _deriveReportDiagnostics([], {}, labelFn, helpFn);
    expect(out.topErrorTags).toEqual([]);
    expect(out.interventionSummary).toBeNull();
    expect(out.recoveryPatterns).toEqual([]);
    expect(out.repeatedMistakes).toEqual([]);
  });

  test('counts triggered events per tag and ranks by frequency', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_same' },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.topErrorTags).toEqual([
      { label: 'Counting by ones (off-by-one)', count: 3 },
      { label: 'Reusing the same answer',       count: 1 },
    ]);
  });

  test('computes overall and per-tag recovery rate', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: false },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.interventionSummary).toEqual({ total: 2, recoveryRate: 50 });
    expect(out.recoveryPatterns).toEqual([
      { label: 'Counting by ones (off-by-one)', attempts: 2, recoveryRate: 50 },
    ]);
  });

  test('includes misconception description only when helpFn returns one', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_same' },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.misconceptionPatterns).toEqual([
      {
        label:       'Counting by ones (off-by-one)',
        description: 'May be miscounting by one when adding or counting up.',
      },
    ]);
  });

  test('reports repeatedMistakes from mastery (wrongCount ≥ 2)', () => {
    const mastery = {
      'qid_a': { attempts: 5, correct: 1 }, // 4 wrong
      'qid_b': { attempts: 3, correct: 2 }, // 1 wrong — excluded
      'qid_c': { attempts: 4, correct: 2 }, // 2 wrong
    };
    const out = _deriveReportDiagnostics([], mastery, labelFn, helpFn);
    expect(out.repeatedMistakes).toEqual([
      { label: 'qid_a', wrongCount: 4 },
      { label: 'qid_c', wrongCount: 2 },
    ]);
  });

  test('caps topErrorTags at 6 and recoveryPatterns at 6', () => {
    const events = [];
    for (let i = 0; i < 10; i++) {
      events.push({ type: 'triggered', errorTag: 'err_' + i });
      events.push({ type: 'triggered', errorTag: 'err_' + i });
    }
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.topErrorTags.length).toBe(6);
    expect(out.recoveryPatterns.length).toBe(6);
  });
});
```

- [ ] **Step 6: Run tests, confirm they pass**

```bash
npx jest tests/report-payload.test.js
```

Expected: all 6 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/dashboard.js tests/report-payload.test.js
git commit -m "feat(report): derive diagnostic fields for AI payload"
```

---

## Task 6: Client — fetch `report_last_text` in `_fetchManagedProfiles`

**Files:**
- Modify: `src/dashboard.js:3605` (the SELECT in `_fetchManagedProfiles`)

- [ ] **Step 1: Add the column to the SELECT**

Replace line 3605 (the `.select(...)` call) with:

```javascript
        .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, username, updated_at, report_last_generated, report_last_text, grade')
```

- [ ] **Step 2: Commit**

```bash
git add src/dashboard.js
git commit -m "feat(report): fetch report_last_text alongside profile data"
```

---

## Task 7: Client — parse 429 cooldown body & rate-limit body separately

**Files:**
- Modify: `src/dashboard.js:1869-1899` (the fetch + error block in `generateAIReport`)

- [ ] **Step 1: Replace the fetch/handling block in `generateAIReport`**

Replace lines 1869-1899 (the `try { ... } catch ... }` block, but NOT the lines above that build the payload) with:

```javascript
  try {
    var resp = await fetch('/.netlify/functions/gemini-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: name, reportData: payload, studentId: _activeId })
    });

    // Read body once, even on non-OK, so we can branch on the server's error type.
    var data = null;
    try { data = await resp.json(); } catch (e) { data = null; }

    // ── Cooldown 429: render the saved report (if any) and update the footer ──
    if (resp.status === 429 && data && data.error === 'cooldown') {
      // Mirror the server cooldown into local state so the footer renders correctly
      // without waiting for the next profile fetch.
      if (typeof data.nextAvailable === 'number') {
        var lastMs = data.nextAvailable - _REPORT_COOL_MS;
        localStorage.setItem(_reportCooldownKey(), String(lastMs));
        var _mp1 = _managedProfiles.find(function(p){ return p.id === _activeId; });
        if (_mp1) {
          _mp1.report_last_generated = new Date(lastMs).toISOString();
          if (data.report) _mp1.report_last_text = data.report;
        }
      }
      if (data.report) {
        _prReportText = data.report;
        _renderAIReportView(data.report, name);
      } else {
        // Cooldown active but no saved text — restore stats and show cooldown footer.
        if (bodyEl && _prStatsHtml) bodyEl.innerHTML = _prStatsHtml;
        if (footerEl) footerEl.innerHTML = _genReportFooter();
      }
      return;
    }

    // ── Rate-limit 429: friendly message, no cooldown burned ──
    if (resp.status === 429) {
      if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
        + '<div style="font-size:2rem;margin-bottom:14px">⏱️</div>'
        + '<div style="color:#37474f">Too many report requests. Please try again soon.</div></div>';
      if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
        + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button>'
        + '<button class="db-ai-pdf-btn" data-action="generateAIReport">↺ Try Again</button></div>';
      return;
    }

    if (!resp.ok) throw new Error('Server error ' + resp.status);
    if (!data || data.error) throw new Error((data && data.error) || 'Empty response');

    _prReportText = data.report;
    // Record successful generation locally too — server already wrote it,
    // but localStorage gives instant cooldown feedback before next profile fetch.
    var _nowIso = new Date().toISOString();
    localStorage.setItem(_reportCooldownKey(), String(Date.now()));
    var _mp2 = _managedProfiles.find(function(p){ return p.id === _activeId; });
    if (_mp2) {
      _mp2.report_last_generated = _nowIso;
      _mp2.report_last_text      = data.report;
    }
    _renderAIReportView(data.report, name);
  } catch(e) {
    if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
      + '<div style="font-size:2rem;margin-bottom:14px">⚠️</div>'
      + '<div style="color:#37474f">Couldn\'t generate the report.</div>'
      + '<div style="font-size:.85rem;color:#90a4ae;margin-top:6px">' + _esc(e.message||'Check your connection.') + '</div></div>';
    if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
      + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button>'
      + '<button class="db-ai-pdf-btn" data-action="generateAIReport">↺ Try Again</button></div>';
  }
}
```

Note: this also removes the now-unnecessary client-side Supabase write — Task 4 moved that server-side. The localStorage timestamp write stays because it gives instant cooldown feedback for the same session.

- [ ] **Step 2: Commit**

```bash
git add src/dashboard.js
git commit -m "fix(report): parse 429 cooldown vs rate-limit; restore from saved text"
```

---

## Task 8: Client — "View Last Report" button + `viewLastReport` action

**Files:**
- Modify: `src/dashboard.js:1944-1957` (`_genReportFooter`)
- Add new function `viewLastReport` near `backToStats` (after line 1942)
- Modify: `src/dashboard.js:4310-4397` (`_DB_ACTIONS` map)

- [ ] **Step 1: Add a helper that returns the saved report text (Supabase or localStorage)**

Insert immediately above `function _genReportFooter()` (currently line 1945):

```javascript
function _savedReportText() {
  var profile = _managedProfiles.find(function(p){ return p.id === _activeId; });
  if (profile && profile.report_last_text) return profile.report_last_text;
  // Local mode — fall back to in-memory text from this session
  return _prReportText || null;
}
```

- [ ] **Step 2: Replace `_genReportFooter()` with cooldown-aware variant**

Replace `_genReportFooter()` (currently lines 1945-1957) with:

```javascript
function _genReportFooter() {
  var nextAvail = _reportNextAvailable();
  var onCooldown = nextAvail && Date.now() < nextAvail;
  if (onCooldown) {
    var nextDate = new Date(nextAvail).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    var hasSaved = !!_savedReportText();
    return '<div style="text-align:center">'
      + (hasSaved
          ? '<button class="db-ai-gen-btn" data-action="viewLastReport">📋 View Last Report</button>'
          : '<button class="db-ai-gen-btn" disabled style="opacity:0.45;cursor:not-allowed">📋 Generate Report</button>')
      + '<div class="db-ai-powered">Next report available ' + nextDate + '</div></div>';
  }
  return '<div style="text-align:center">'
    + '<button class="db-ai-gen-btn" data-action="generateAIReport">📋 Generate Report</button>'
    + '<div class="db-ai-powered">Powered by Gemini</div></div>';
}
```

- [ ] **Step 3: Add the `viewLastReport` function**

Insert immediately after `backToStats` (currently ends at line 1943):

```javascript
function viewLastReport() {
  var text = _savedReportText();
  if (!text) return;
  var student = _students[_activeId];
  var name    = student ? (student.name || 'Student') : 'Student';
  // Snapshot current dashboard so backToStats works
  var bodyEl = document.getElementById('db-root');
  if (bodyEl && !_prStatsHtml) _prStatsHtml = bodyEl.innerHTML;
  _prReportText = text;
  _renderAIReportView(text, name);
}
```

- [ ] **Step 4: Register `viewLastReport` in `_DB_ACTIONS`**

Insert after the `generateAIReport` line in `_DB_ACTIONS` (currently line 4337):

```javascript
    viewLastReport:          function()     { viewLastReport(); },
```

- [ ] **Step 5: Commit**

```bash
git add src/dashboard.js
git commit -m "feat(report): add View Last Report button during cooldown"
```

---

## Task 9: Client — gate brand-new students from generating

**Files:**
- Modify: `src/dashboard.js:1844-1867` (the start of `generateAIReport`)
- Add a small helper `_hasEnoughDataForReport`

- [ ] **Step 1: Add the data-sufficiency helper above `generateAIReport`**

Insert right above `async function generateAIReport()` (currently line 1844):

```javascript
// Minimum signal threshold — prevents brand-new students from burning the
// 14-day cooldown on a thin report. Tunable: adjust as we learn.
function _hasEnoughDataForReport(scores, mastery, events) {
  var completedQuizzes = (scores || []).filter(function(s){ return s.pct != null && s.total > 0; }).length;
  if (completedQuizzes >= 3) return true;
  var totalQuestions = (scores || []).reduce(function(sum, s){ return sum + (s.total || 0); }, 0);
  if (totalQuestions >= 10) return true;
  var triggered = (events || []).filter(function(e){ return e && e.type === 'triggered'; }).length;
  if (triggered >= 3) return true;
  return false;
}
```

- [ ] **Step 2: Add the gate at the top of `generateAIReport`**

Replace lines 1844-1851 (from `async function generateAIReport()` through the `var name` line) with:

```javascript
async function generateAIReport() {
  var footerEl = document.getElementById('db-ai-footer');
  var bodyEl   = document.getElementById('db-root');
  if (!footerEl) return;
  var student   = _students[_activeId];
  if (!student) return;
  var name      = student.name || 'Student';

  // Don't burn the 14-day cooldown if there's not enough data to write a useful report.
  var rawEvents = (typeof _remoteInterventionEvents !== 'undefined' && _remoteInterventionEvents && _remoteInterventionEvents.length)
    ? _remoteInterventionEvents
    : _getInterventionEvents();
  if (!_hasEnoughDataForReport(student.SCORES || [], student.MASTERY || {}, rawEvents)) {
    if (bodyEl) {
      _prStatsHtml = bodyEl.innerHTML;
      bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
        + '<div style="font-size:2rem;margin-bottom:14px">📚</div>'
        + '<div style="color:#37474f;font-weight:600;margin-bottom:8px">Not enough activity yet</div>'
        + '<div style="font-size:.9rem;color:#607d8b;max-width:320px;margin:0 auto">'
        + 'Complete a few lessons or quizzes first. Reports become useful after more activity is recorded.'
        + '</div></div>';
    }
    if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
      + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button></div>';
    return;
  }
```

(The rest of `generateAIReport` — cooldown check, payload build, fetch — stays unchanged.)

- [ ] **Step 3: Commit**

```bash
git add src/dashboard.js
git commit -m "feat(report): block generation when student has insufficient data"
```

---

## Task 10: Build, test, manual verification, deploy

**Files:** none (verification only)

- [ ] **Step 1: Run the full Jest suite**

```bash
npx jest
```

Expected: all existing tests still pass + the 6 new tests in `tests/report-payload.test.js`.

- [ ] **Step 2: Build production bundle**

```bash
node build.js
```

Expected: clean build of `dist/`. No errors. The bundle includes `src/dashboard.js` (per build.js line 78).

- [ ] **Step 3: Sanity-check the build output**

```bash
grep -c "viewLastReport\|topErrorTags\|_deriveReportDiagnostics\|report_last_text" dist/app.js
```

Expected: ≥4 hits (one per token). Confirms the new code made it through the obfuscator.

- [ ] **Step 4: Verify the migration applied**

In Supabase SQL editor:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name='student_profiles' AND column_name='report_last_text';
```

Expected: 1 row.

- [ ] **Step 5: Manual smoke (production)**

After deploy, on a parent account with at least one student that has activity:

1. Open Parent Dashboard → click **Generate Report**.
   - Expect: spinner, then a four-section report. Areas to Grow should reference specific mistake patterns by parent-friendly name (e.g. "appears to be confusing tens and hundreds"), not raw `err_*` tags.
2. Refresh the dashboard. Footer should show **"View Last Report"** + "Next report available <date>".
3. Click **View Last Report** — same report renders (no Gemini call, no cost).
4. On a brand-new student profile (zero activity), clicking **Generate Report** should show the "Not enough activity yet" message and NOT consume the cooldown.
5. From a different device (or after `localStorage.clear()`): the cooldown footer should still appear after profile fetch (server enforces).

- [ ] **Step 6: Commit & push**

```bash
git push origin master
```

Netlify auto-deploys. Run Step 5 against the live URL.

---

## Self-review

**Spec coverage check** (against the user's 7 sections):

| Spec section | Tasks |
|---|---|
| 1. Use diagnostic data in generated report | Task 2 (system instruction), Task 3 (sanitizer), Task 5 (payload) |
| 2. Fix cooldown error handling | Task 7 (parse 429 body, distinguish cooldown vs rate-limit) |
| 3. Persist generated report text | Task 1 (column), Task 4 (server write), Task 6 (client fetch) |
| 4. "View Last Report" behavior | Task 8 (button + action) |
| 5. Prevent no-data report generation | Task 9 (gate + helper) |
| 6. Keep diagnostic payload summarized | Task 3 (server caps) + Task 5 (client caps in `_deriveReportDiagnostics`) |
| 7. Verification | Task 10 |

**Out-of-spec hygiene:**
- Migration file is checked in (addresses Issue 9 from the original investigation)
- Server-side persistence write (Task 4) makes the server the single source of truth, eliminating the client/server cooldown drift risk

**Type/name consistency:**
- `topErrorTags`, `misconceptionPatterns`, `interventionSummary`, `recoveryPatterns`, `repeatedMistakes` are spelled identically in: server sanitizer (Task 3), system instruction (Task 2), client builder (Task 5).
- `report_last_text` is spelled identically in: migration (Task 1), server SELECT/PATCH (Task 4), client SELECT (Task 6), client read via `_savedReportText()` (Task 8).
- `_REPORT_COOL_MS` already exists at `src/dashboard.js:1828` — Task 7 reuses it.
- `_renderAIReportView` already exists at `src/dashboard.js:1902` — Tasks 7 & 8 reuse it.

**Things this plan deliberately does NOT do:**
- Doesn't touch the legacy `dashboard/dashboard.js` (only used by old test harness; a separate cleanup).
- Doesn't change Gemini temperature, model, or token limit.
- Doesn't touch `gemini-hint.js` (separate function).
- Doesn't change footer spacing, dashboard layout, or any styling.
- Doesn't refactor `_buildDashboardPayload` beyond the additive change.
