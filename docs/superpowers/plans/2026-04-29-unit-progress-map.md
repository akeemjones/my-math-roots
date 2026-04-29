# Unit Progress Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the decorative Root System vine with a compact, expandable Unit Progress Map — one card per unit — that gives parents a clear answer to "which units are strong, which need review, and what should we do next?"

**Architecture:** Pure JS + CSS. One new helper function `_computeUnitInsights`, one new render function `_renderUnitProgressMap`. `<details>/<summary>` for expand/collapse (same pattern as Settings accordion — zero JS toggle code needed). No new screen, no navigation change, no data plumbing change.

**Tech Stack:** Vanilla JS, CSS custom properties, `<details>` HTML, existing `_UNITS_META` / `_TAG_LABEL_MAP` / `_ERR_LABEL_MAP` / `_lessonDisplayName`

---

## 1. Audit Findings

### 1a. Current `_renderRootSystem` — what it does

- Located at `src/dashboard.js` lines 435–518
- Accepts `(scores, unitNames)` — **no mastery, no activity events**
- Computes per-unit avg accuracy from scores only
- Renders an SVG vine with 10 alternating left/right nodes
- 4 visual states: mastered (≥80%), growing (60–79%), struggling (<60%), locked (no scores)
- **No click handler of any kind.** Nodes are static `<div>` elements.
- Call site (line 2480): `_renderRootSystem(scores, _unitNames())`

### 1b. Unit name mismatch — confirmed bug

`_unitNames()` (line 1328) returns hardcoded names that diverge from `_UNITS_META` (line 1107) starting at index 2:

| idx | `_unitNames()` | `_UNITS_META` (source of truth) |
|---|---|---|
| 0 | Basic Fact Strategies | Basic Fact Strategies ✓ |
| 1 | Place Value | Place Value ✓ |
| 2 | **Addition & Subtraction** | **Add & Subtract to 200** ✗ |
| 3 | **Subtraction** | **Add & Subtract to 1,000** ✗ |
| 4 | **Multiplication** | **Money & Financial Literacy** ✗ |
| 5 | **Division** | **Data Analysis** ✗ |
| 6 | **Fractions** | **Measurement & Time** ✗ |
| 7 | **Decimals** | **Fractions** ✗ |
| 8 | **Geometry** | **Geometry** ✓ (by coincidence) |
| 9 | **Measurement** | **Multiplication & Division** ✗ |

**Impact:** The Root System is showing wrong unit names for 7 of 10 units. The new implementation must use `_UNITS_META[idx].name` throughout.

### 1c. Activity events carry `unitId`

Confirmed in session summary and code: `mmr_activity_v1` events include `{ ts, grade, unitId, lessonId, questionId, tags, correct, errorType, patternTag }`. This allows per-unit weak-tag and error analysis.

### 1d. Scores carry `unitIdx`

Confirmed at lines 106, 110, 122, 439. Score objects: `{ pct, score, total, unitIdx, answers, date, ts }`.

### 1e. No lesson-launch action exists

`_DB_ACTIONS` has no handler to navigate from the parent dashboard to a specific lesson. `dbGoToApp` switches to the student home screen but carries no lesson context. **The plan will recommend the lesson by name only — no navigation action.** A separate follow-up can add safe lesson-launch if desired.

### 1f. `_UNITS_META` has lesson display names

`_UNITS_META[idx].lessons` is an array of lesson display-name strings. This gives a lesson list per unit without needing to parse the heavy `data/uX.js` files.

### 1g. Design recommendation: Option A (unit cards)

The vine layout is mobile-hostile for tap targets, hard to expand in-place, and adds vertical height with no information density. **Option A (compact unit cards with `<details>` expand) is the right call.**

---

## 2. Proposed Design

**Unit Progress Map** replaces the Root System section with a vertical list of unit cards.

### Collapsed state (all users see this)

```
┌─────────────────────────────────────────┐
│ 3  Add & Subtract to 200   [Needs Work] │  ← red left border
│                                    40%  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 4  Add & Subtract to 1,000  [Developing]│  ← orange border
│                                    72%  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 1  Basic Fact Strategies      [Strong]  │  ← green border
│                                    91%  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 5  Money & Financial Literacy           │  ← muted
│    Not started                          │
└─────────────────────────────────────────┘
```

- **Sort order:** Needs Review first → Developing → Strong → Not Started (actionable items surface to top)
- **Not-started units** are muted (gray) and collapsed by default with no expand target
- Tapping any started unit expands it

### Expanded state (tap to expand)

```
┌─────────────────────────────────────────┐
│ 3  Add & Subtract to 200   [Needs Work] ▲
│                                    40%  │
│ ─────────────────────────────────────── │
│ 30 questions answered · 2 quizzes       │
│                                         │
│ Weakest skill:   Regrouping             │
│ Common mistake:  Forgot to regroup      │
│                  Write out each step — show them │
│                  to circle the tens.    │
│                                         │
│ Review:  Subtracting Numbers            │
└─────────────────────────────────────────┘
```

If no weak-tag data: "Not enough practice data yet. Complete a quiz to unlock unit insights."

---

## 3. New Helper Function — `_computeUnitInsights`

**Location:** `src/dashboard.js` — insert before `_renderUnitProgressMap` (which replaces `_renderRootSystem`)

```javascript
function _computeUnitInsights(scores, mastery, activityEvents) {
  // ── 1. Group scores by unitIdx ──────────────────────────────────────────
  var scoreMap = {};
  (scores || []).forEach(function(s) {
    if (s.unitIdx == null || s.pct == null || s.total <= 0) return;
    var k = s.unitIdx;
    if (!scoreMap[k]) scoreMap[k] = { sumPct: 0, count: 0, correct: 0, total: 0 };
    scoreMap[k].sumPct  += s.pct;
    scoreMap[k].count   += 1;
    scoreMap[k].correct += (s.score  || 0);
    scoreMap[k].total   += (s.total  || 0);
  });

  // ── 2. Group activity events by unitId ──────────────────────────────────
  var actMap = {};
  (activityEvents || []).forEach(function(e) {
    if (e.unitId == null) return;
    var k = e.unitId;
    if (!actMap[k]) actMap[k] = [];
    actMap[k].push(e);
  });

  // ── 3. Build per-unit insight object ────────────────────────────────────
  return _UNITS_META.map(function(unit, idx) {
    var sd     = scoreMap[idx];
    var events = actMap[idx] || [];

    if (!sd) {
      return {
        idx: idx, name: unit.name, lessons: unit.lessons || [],
        status: 'not-started', accuracy: null, total: 0,
        correct: 0, quizCount: 0,
        weakTagLabel: null, topErrLabel: null, topErrHelp: null, lessonRec: null,
      };
    }

    var accuracy = Math.round(sd.sumPct / sd.count);

    // Tag-level accuracy from unit's activity events
    var tagBucket = {};
    events.forEach(function(e) {
      (e.tags || []).forEach(function(tag) {
        if (!tagBucket[tag]) tagBucket[tag] = { attempts: 0, correct: 0 };
        tagBucket[tag].attempts++;
        if (e.correct) tagBucket[tag].correct++;
      });
    });
    var weakTagKey = null, weakTagAcc = 1;
    Object.keys(tagBucket).forEach(function(tag) {
      var t = tagBucket[tag];
      if (t.attempts < 3) return;
      var acc = t.correct / t.attempts;
      if (acc < 0.60 && acc < weakTagAcc) { weakTagKey = tag; weakTagAcc = acc; }
    });

    // Most common error in unit's activity
    var errCounts = {};
    events.forEach(function(e) {
      if (e.errorType) errCounts[e.errorType] = (errCounts[e.errorType] || 0) + 1;
    });
    var topErrKey = null, topErrCount = 0;
    Object.keys(errCounts).forEach(function(t) {
      if (errCounts[t] > topErrCount) { topErrKey = t; topErrCount = errCounts[t]; }
    });

    // Lesson recommendation: most practiced lesson for the weak tag (or any lesson in unit)
    var lessonRec = null;
    if (weakTagKey) {
      var lessonCounts = {};
      events.forEach(function(e) {
        if (e.lessonId && (e.tags || []).indexOf(weakTagKey) !== -1) {
          lessonCounts[e.lessonId] = (lessonCounts[e.lessonId] || 0) + 1;
        }
      });
      var topLessonId = Object.keys(lessonCounts)
        .sort(function(a, b) { return lessonCounts[b] - lessonCounts[a]; })[0] || null;
      if (topLessonId) {
        var ldn = _lessonDisplayName(topLessonId);
        lessonRec = ldn ? ldn.lesson : null;
      }
    }

    // Status
    var status;
    if (sd.total < 5)                          status = 'low-data';
    else if (weakTagKey || accuracy < 60)      status = 'needs-review';
    else if (accuracy < 80)                    status = 'developing';
    else                                       status = 'strong';

    return {
      idx:          idx,
      name:         unit.name,
      lessons:      unit.lessons || [],
      status:       status,
      accuracy:     accuracy,
      total:        sd.total,
      correct:      sd.correct,
      quizCount:    sd.count,
      weakTagLabel: weakTagKey ? (_TAG_LABEL_MAP[weakTagKey] || _toTitleCase(weakTagKey)) : null,
      topErrLabel:  topErrKey  ? (_ERR_LABEL_MAP[topErrKey]  || null) : null,
      topErrHelp:   topErrKey  ? (_ERR_HELP_MAP  && _ERR_HELP_MAP[topErrKey]  || null) : null,
      lessonRec:    lessonRec,
    };
  });
}
```

**Sort order for display** (applied in `_renderUnitProgressMap`, not in the helper):
```javascript
var STATUS_ORDER = { 'needs-review': 0, 'low-data': 1, 'developing': 2, 'strong': 3, 'not-started': 4 };
units.sort(function(a, b) { return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; });
```

---

## 4. Unit Status Rules

| Status | Trigger | Visual |
|---|---|---|
| `needs-review` | accuracy < 60% **or** weak tag (≥3 attempts at <60%) | Red left border, red badge |
| `low-data` | scored at least once but total < 5 questions | Orange left border, "Getting started" badge |
| `developing` | accuracy 60–79%, no weak tags | Orange left border, "Developing" badge |
| `strong` | accuracy ≥ 80%, ≥5 questions | Green left border, "Strong" badge |
| `not-started` | no completed scores | Gray, muted, no expand |

---

## 5. Render Function — `_renderUnitProgressMap`

**Replaces** `_renderRootSystem`. **Call site** changes from:
```javascript
_renderRootSystem(scores, _unitNames()) +
```
to:
```javascript
_renderUnitProgressMap(scores, mastery, activityEvents) +
```

Both `mastery` and `activityEvents` are already declared in `renderDashboard` at lines 2436–2437.

```javascript
function _renderUnitProgressMap(scores, mastery, activityEvents) {
  var units = _computeUnitInsights(scores, mastery, activityEvents);

  var STATUS_ORDER = { 'needs-review': 0, 'low-data': 1, 'developing': 2, 'strong': 3, 'not-started': 4 };
  units = units.slice().sort(function(a, b) { return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; });

  var statusLabel = {
    'needs-review': 'Needs Review',
    'low-data':     'Getting started',
    'developing':   'Developing',
    'strong':       'Strong',
    'not-started':  'Not started',
  };
  var statusColor = {
    'needs-review': '#c62828',
    'low-data':     '#e65100',
    'developing':   '#e65100',
    'strong':       '#2e7d32',
    'not-started':  '#b0bec5',
  };

  var cards = units.map(function(u) {
    var col    = statusColor[u.status];
    var lbl    = statusLabel[u.status];
    var isStarted = u.status !== 'not-started';

    // Collapsed summary line
    var pctStr = u.accuracy != null ? u.accuracy + '%' : '';
    var summary = '<div class="db-upm-summary">'
      + '<span class="db-upm-num" style="color:' + col + '">' + (u.idx + 1) + '</span>'
      + '<span class="db-upm-name">' + _esc(u.name) + '</span>'
      + '<span class="db-upm-badge" style="color:' + col + ';border-color:' + col + '30">' + lbl + '</span>'
      + (pctStr ? '<span class="db-upm-pct" style="color:' + col + '">' + pctStr + '</span>' : '')
      + '</div>';

    if (!isStarted) {
      return '<div class="db-upm-card db-upm-not-started">' + summary + '</div>';
    }

    // Expanded detail
    var detail = '';
    if (u.status === 'low-data') {
      detail = '<div class="db-upm-detail">'
        + '<p class="db-upm-hint">Not enough practice data yet. Complete a lesson quiz to unlock unit insights.</p>'
        + '</div>';
    } else {
      var statLine = u.total + ' question' + (u.total !== 1 ? 's' : '') + ' answered';
      if (u.quizCount > 0) statLine += ' &bull; ' + u.quizCount + ' quiz' + (u.quizCount !== 1 ? 'zes' : '');

      detail = '<div class="db-upm-detail">'
        + '<p class="db-upm-stat">' + statLine + '</p>';

      if (u.weakTagLabel) {
        detail += '<div class="db-upm-row"><span class="db-upm-row-lbl">Weakest skill</span><span class="db-upm-row-val">' + _esc(u.weakTagLabel) + '</span></div>';
      }
      if (u.topErrLabel) {
        detail += '<div class="db-upm-row"><span class="db-upm-row-lbl">Common mistake</span><span class="db-upm-row-val">' + _esc(u.topErrLabel) + '</span></div>';
      }
      if (u.topErrHelp) {
        detail += '<p class="db-upm-hint">💡 ' + _esc(u.topErrHelp) + '</p>';
      }
      if (u.lessonRec) {
        detail += '<div class="db-upm-rec">📌 Review: <strong>' + _esc(u.lessonRec) + '</strong></div>';
      }
      detail += '</div>';
    }

    return '<details class="db-upm-card" style="border-left:4px solid ' + col + '">'
      + '<summary class="db-upm-card-inner">' + summary + '</summary>'
      + detail
      + '</details>';
  }).join('');

  var strong   = units.filter(function(u) { return u.status === 'strong'; }).length;
  var started  = units.filter(function(u) { return u.status !== 'not-started'; }).length;

  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🌱 Unit Progress Map</h2>'
    + '<p class="db-upm-overview">' + strong + ' of 10 units strong &bull; ' + started + ' started</p>'
    + '<div class="db-upm-list">' + cards + '</div>'
    + '</section>';
}
```

---

## 6. CSS Additions — `src/styles.css`

Append after existing Phase 4 rules (end of file). All selectors scoped under `#dashboard-screen`.

```css
/* ── Unit Progress Map ────────────────────────────────────────────────── */
#dashboard-screen .db-upm-overview {
  font-size: var(--db-text-sm);
  color: var(--neutral-500);
  margin: 0 0 12px;
}
#dashboard-screen .db-upm-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
#dashboard-screen .db-upm-card {
  background: #fff;
  border: 1px solid var(--border2);
  border-radius: 12px;
  overflow: hidden;
}
#dashboard-screen .db-upm-card.db-upm-not-started {
  background: var(--neutral-50);
  border-left: 4px solid #cfd8dc;
  opacity: 0.7;
  padding: 12px;
}
#dashboard-screen .db-upm-card-inner {
  display: block;
  padding: 12px;
  cursor: pointer;
  list-style: none;
}
#dashboard-screen .db-upm-card-inner::-webkit-details-marker { display: none; }
#dashboard-screen .db-upm-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
#dashboard-screen .db-upm-num {
  font-size: var(--db-text-xs);
  font-weight: 700;
  min-width: 18px;
  flex-shrink: 0;
}
#dashboard-screen .db-upm-name {
  font-size: var(--db-text-base);
  font-weight: 600;
  color: var(--neutral-900);
  flex: 1;
}
#dashboard-screen .db-upm-badge {
  font-size: var(--db-text-xs);
  font-weight: 600;
  border: 1px solid;
  border-radius: 20px;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}
#dashboard-screen .db-upm-pct {
  font-size: var(--db-text-sm);
  font-weight: 700;
  margin-left: auto;
  flex-shrink: 0;
}
#dashboard-screen .db-upm-detail {
  padding: 0 12px 12px;
  border-top: 1px solid var(--border2);
  margin-top: 8px;
  padding-top: 10px;
}
#dashboard-screen .db-upm-stat {
  font-size: var(--db-text-sm);
  color: var(--neutral-500);
  margin: 0 0 10px;
}
#dashboard-screen .db-upm-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}
#dashboard-screen .db-upm-row-lbl {
  font-size: var(--db-text-sm);
  color: var(--neutral-500);
  flex-shrink: 0;
}
#dashboard-screen .db-upm-row-val {
  font-size: var(--db-text-sm);
  font-weight: 600;
  color: var(--neutral-900);
  text-align: right;
}
#dashboard-screen .db-upm-hint {
  font-size: var(--db-text-sm);
  color: var(--neutral-600);
  line-height: 1.5;
  margin: 8px 0 0;
}
#dashboard-screen .db-upm-rec {
  font-size: var(--db-text-sm);
  color: var(--neutral-700);
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--neutral-50);
  border-radius: 8px;
}
/* Remove old Root System styles */
#dashboard-screen .rs-track,
#dashboard-screen .rs-row,
#dashboard-screen .rs-node,
#dashboard-screen .rs-spine,
#dashboard-screen .rs-label,
#dashboard-screen .rs-legend,
#dashboard-screen .rs-summary { display: none !important; }
```

> **Note:** The `display: none` tombstone on old `.rs-*` classes is a safety net in case any `.rs-*` HTML leaks through during the transition. Once `_renderRootSystem` is fully removed, these can be cleaned up.

---

## 7. Files Likely to Change

| File | Change |
|---|---|
| `src/dashboard.js` | Add `_computeUnitInsights` (~65 lines); add `_renderUnitProgressMap` (~70 lines); update call site (1 line); update `renderDashboard` to pass `activityEvents` to unit map |
| `src/styles.css` | Append ~65 lines of `.db-upm-*` rules; add tombstone rules for `.rs-*` |
| `dashboard/dashboard.js` | Add `_computeUnitInsights` to exports for testing |
| `tests/dashboard.test.js` | Add 4 test scenarios for `_computeUnitInsights` |

**No changes to:** `data/u*.js`, quiz logic, auth, Supabase sync, mastery logging, activity logging, `_UNITS_META`, `_TAG_LABEL_MAP`, `_ERR_LABEL_MAP`, `_ERR_HELP_MAP`.

---

## 8. Validation Plan

```
npx jest --silent
node --test tests/security.test.js
node --test tests/core.test.js
node scripts/u8_smoke.js
node scripts/verify_stage2.js
node scripts/verify_stage3.js
node build.js
```

All suites must pass before commit.

**Visual checks (mock data via preview):**
- [ ] "Needs Review" units appear first, have red left border and red badge
- [ ] "Developing" units appear second, orange border
- [ ] "Strong" units appear third, green border
- [ ] "Not started" units appear last, muted gray, no expand arrow
- [ ] Tapping a started unit expands to show detail; tapping again collapses
- [ ] Expanded detail shows: questions answered, weakest skill label, common mistake label, 💡 help text, 📌 review lesson name
- [ ] No raw `err_*` or snake_case tag keys visible anywhere
- [ ] Unit names match Grade 2 curriculum (Add & Subtract to 200, not "Addition & Subtraction")
- [ ] Summary line "X of 10 units strong · Y started" is correct
- [ ] On 360px wide screen: cards do not overflow horizontally
- [ ] Low-data units show "Not enough practice data yet" message, not raw numbers

---

## 9. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `activityEvents` missing `unitId` in real production data | Low — confirmed in schema; may be 0/null for old events | Guard: `if (e.unitId == null) return` in helper |
| `_ERR_HELP_MAP` not defined in `dashboard/dashboard.js` test harness | Medium — need to check | Guard: `_ERR_HELP_MAP && _ERR_HELP_MAP[key]` — if undefined, help text is null, detail still renders |
| `<details>` open/close animation jarring on old Android | Low | Accept; matches existing Settings accordion behavior |
| Sort order change surprises parent who memorized vine layout | Negligible | Cards are labelled; no muscle-memory required |
| Removing `_renderRootSystem` breaks a test | None expected | No existing tests for this function; grep confirms no test references |

---

## 10. Acceptance Checklist

**Data correctness**
- [ ] Unit names match `_UNITS_META` (not `_unitNames()`)
- [ ] Status rules match spec: <60% or weak tag → Needs Review, 60–79% → Developing, ≥80% → Strong, <5q → low-data, no score → not-started
- [ ] Weak tag detection uses ≥3 attempts and <60% accuracy from unit activity events
- [ ] Error label comes from `_ERR_LABEL_MAP`, never a raw `err_*` key
- [ ] Lesson rec comes from `_lessonDisplayName()`, never a raw lessonId
- [ ] `_computeUnitInsights` passes all 4 Jest scenarios

**Display correctness**
- [ ] Needs Review units sorted first
- [ ] Not-started units sorted last and muted
- [ ] No raw codes anywhere in the rendered HTML
- [ ] "Not enough practice data" shown when total < 5

**Mobile**
- [ ] Cards fit within 360px viewport
- [ ] Tap target on `<summary>` is comfortable (≥44px height)
- [ ] Long unit names wrap cleanly

**Regression**
- [ ] All existing Jest tests still pass
- [ ] All `node:test` suites still pass
- [ ] All smoke/verify scripts still pass
- [ ] Build completes cleanly
- [ ] No other dashboard sections affected

---

## Implementation Task Breakdown

### Task 1 — Add `_computeUnitInsights` to `dashboard/dashboard.js` and write tests

- [ ] Insert `_computeUnitInsights` (full code from Section 3) before the Jest bridge in `dashboard/dashboard.js`
- [ ] Add `_computeUnitInsights` to `module.exports`
- [ ] Add 4 test scenarios to `tests/dashboard.test.js`:
  1. No scores → all units return `not-started`
  2. One unit with accuracy 40% and weak tag → `needs-review`, correct labels
  3. One unit with accuracy 85%, no weak tag → `strong`
  4. One unit with 3 questions total → `low-data`
- [ ] Run `npx jest tests/dashboard.test.js --silent` — all pass
- [ ] Commit: `feat(upm): add _computeUnitInsights with tests`

### Task 2 — Add `_renderUnitProgressMap` to `src/dashboard.js`

- [ ] Insert `_computeUnitInsights` (identical body) before `_renderUnitProgressMap` in `src/dashboard.js`
- [ ] Insert `_renderUnitProgressMap` (full code from Section 5) in place of `_renderRootSystem` signature
- [ ] Update call site in `renderDashboard` (line ~2480): replace `_renderRootSystem(scores, _unitNames())` with `_renderUnitProgressMap(scores, mastery, activityEvents)`
- [ ] Verify `mastery` and `activityEvents` are declared above the call site (they are, at lines 2436–2437)
- [ ] Commit: `feat(upm): add _renderUnitProgressMap to src/dashboard.js`

### Task 3 — CSS additions to `src/styles.css`

- [ ] Append all `.db-upm-*` rules (Section 6) after the existing Phase 4 block at end of file
- [ ] Append `.rs-*` tombstone rules
- [ ] Run `node build.js` — clean build
- [ ] Commit: `feat(upm): add unit progress map styles`

### Task 4 — Full validation and final commit

- [ ] Run full test suite (all 5 commands from Section 8)
- [ ] Visual verify in browser preview (all checklist items from Section 8)
- [ ] If all pass, squash Tasks 1–3 commits or leave as-is
- [ ] Final commit if squashing: `feat(dashboard): replace Root System with Unit Progress Map`
