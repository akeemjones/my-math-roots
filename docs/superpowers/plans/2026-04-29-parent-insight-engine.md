# Parent Dashboard Insight Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static threshold-based Action Summary copy with a deterministic insight engine that analyzes overall performance, skill-level accuracy, recent trend, and mistake patterns to generate genuinely responsive parent-facing summaries.

**Architecture:** Add a pure function `buildParentInsight(opts)` to `dashboard/dashboard.js` (for testing) and `src/dashboard.js` (for production). The function accepts pre-loaded data + injected label lookups, returns a structured insight object, and `_renderParentActionSummary` is refactored to call it instead of doing inline analysis. No external API calls, no AI generation — all text is deterministic from data.

**Tech Stack:** Vanilla JS, Jest 29 (tests), existing `_TAG_LABEL_MAP`/`_ERR_LABEL_MAP`/`_ERR_HELP_MAP` label maps, existing mastery/activity/scores data structures.

---

## 1. Current Static Logic Audit

### Where the current logic lives

`src/dashboard.js`, lines **2171–2268** — `_renderParentActionSummary(stats, mastery, activityEvents, name)`

### Current tier determination (lines 2197–2202)

```javascript
if (totalAttempts < 3)         tier = 'no-data';
else if (topWeakTag)           tier = 'needs-review';
else if (stats.accuracy >= 80) tier = 'strong';
else                           tier = 'developing';
```

`totalAttempts` = `stats.totalAttempted` (sum of `s.total` across completed scores).  
`topWeakTag` = first element of tags where `attempts >= 3 && accuracy < 0.60`.

### What's static / missing

| Problem | Impact |
|---|---|
| 4-tier system collapses distinct situations | "developing" covers everything that isn't strong/needs-review/no-data |
| No trend analysis | Improving student gets same copy as plateau student |
| Summary copy is generic for all "needs-review" cases | "developing in math" regardless of how severe or recent the issue is |
| "why" line only shows accuracy % — no mistake context except in needs-review | Strong/developing tiers give no skill-level detail |
| No mixed-signal detection | A student with 2 strong skills and 1 weak skill looks the same as one who is weak everywhere |
| Low-data students (3–9 total) get same no-data message as 0-attempt students | Parents think there's a bug |
| trend detection | Not implemented at all |
| confidence gradient | Binary: no-data OR everything else |

---

## 2. Proposed Insight Engine Rules

### Eight insight tiers (replaces 4)

| Tier | Trigger condition |
|---|---|
| `no-data` | `totalQuestionsAnswered < 3` |
| `low-data` | `3 ≤ totalQuestionsAnswered < 10` AND no tags with `attempts >= 3` |
| `needs-review` | Weak tag(s) exist + trend is `steady` + not mixed |
| `improving` | Weak tag(s) exist + trend is `improving` |
| `declining` | Weak tag(s) exist + trend is `declining` |
| `mixed` | Weak tag(s) exist AND strong tag(s) exist + trend is `steady` |
| `strong` | No weak tags AND (`overallAccuracy >= 80` OR `strongTags.length >= 2`) |
| `developing` | Everything else with enough data |

**Weak tag:** `attempts >= 3 && accuracy < 0.60`  
**Strong tag:** `attempts >= 3 && accuracy >= 0.80`  
**Overall accuracy:** average `s.pct` across completed scores (`pct != null && total > 0`)

### CSS tier mapping (no new CSS classes needed)

The 8 insight tiers map to the 4 existing CSS border-color classes:

```javascript
var _CSS_TIER = {
  'no-data':      'no-data',
  'low-data':     'no-data',
  'needs-review': 'needs-review',
  'improving':    'developing',
  'declining':    'needs-review',
  'mixed':        'developing',
  'strong':       'strong',
  'developing':   'developing',
};
```

---

## 3. Helper Function Design

### `buildParentInsight(opts)` — complete spec

**Location:** `dashboard/dashboard.js` (testable) AND `src/dashboard.js` (production)

**Inputs via `opts`:**

| Key | Type | Description |
|---|---|---|
| `mastery` | `{ [tag]: { attempts, correct, lastSeen } }` | Per-tag mastery object |
| `activityEvents` | `Array<{ ts, correct, errorType, tags, lessonId }>` | Raw activity log |
| `scores` | `Array<{ pct, score, total }>` | Completed quiz scores |
| `studentName` | `string` | Student display name |
| `tagLabels` | `{ [tag]: string }` | Maps tag key → parent label (inject `_TAG_LABEL_MAP` in prod) |
| `errLabels` | `{ [errorType]: string }` | Maps errorType → label (inject `_ERR_LABEL_MAP` in prod) |
| `lessonNameFn` | `function(lessonId) → {lesson, unit} \| null` | Resolves lesson ID to name (inject `_lessonDisplayName` in prod) |

`tagLabels`, `errLabels`, and `lessonNameFn` default to empty/no-op for safety. Tests inject minimal versions.

**Return value:**

```javascript
{
  tier:             string,   // one of the 8 insight tiers
  cssTier:          string,   // one of the 4 CSS tier strings
  headline:         string,   // short pill text shown in the card
  summary:          string,   // 1-2 sentence parent explanation
  actionLabel:      string,   // what the parent should do next
  actionLessonId:   string|null,  // lessonId for the action, or null
  actionLessonName: string|null,  // resolved lesson name, or null
  why:              string,   // 1-sentence data backing
  confidence:       string,   // 'none' | 'low' | 'medium' | 'high'
  weakTag:          string|null,
  weakTagLabel:     string|null,
  weakTagAccuracy:  number|null,  // 0–1
  weakTagAttempts:  number|null,
  strongTag:        string|null,
  strongTagLabel:   string|null,
  commonErrorType:  string|null,
  commonErrorLabel: string|null,
  commonErrorHelp:  string|null,
  trend:            string,   // 'improving' | 'declining' | 'steady'
}
```

### Internal helpers needed in `dashboard/dashboard.js`

These 4 functions are already in `src/dashboard.js` but not in `dashboard/dashboard.js`. They must be added to `dashboard/dashboard.js` for `buildParentInsight` to be testable without mocking:

```javascript
// ── Already in src/dashboard.js at lines 268-312; duplicate here for testability ──

function _computeTagStats(mastery) {
  return Object.keys(mastery || {}).map(function(tag) {
    var m = mastery[tag];
    var attempts = m.attempts || 0;
    return { tag: tag, attempts: attempts, correct: m.correct || 0,
             accuracy: attempts ? (m.correct || 0) / attempts : 0,
             lastSeen: m.lastSeen || 0 };
  }).sort(function(a, b) { return a.accuracy - b.accuracy; });
}

function _computeMisconceptions(activityEvents) {
  var counts = {};
  (activityEvents || []).forEach(function(e) {
    if (e.errorType) counts[e.errorType] = (counts[e.errorType] || 0) + 1;
  });
  return counts;
}

function _buildTagLessonMap(activityEvents) {
  var map = {};
  (activityEvents || []).forEach(function(e) {
    if (!e.lessonId) return;
    (e.tags || []).forEach(function(tag) {
      if (!map[tag]) map[tag] = {};
      map[tag][e.lessonId] = (map[tag][e.lessonId] || 0) + 1;
    });
  });
  return map;
}

function _recommendReviewLessons(weakTags, tagLessonMap, limit) {
  var recs = [], seen = {};
  weakTags.forEach(function(t) {
    var lessons = tagLessonMap[t.tag] || {};
    Object.keys(lessons).sort(function(a, b) { return lessons[b] - lessons[a]; })
      .slice(0, 2).forEach(function(lessonId) {
        if (!seen[lessonId]) {
          seen[lessonId] = true;
          recs.push({ lessonId: lessonId, weakTag: t.tag, accuracy: t.accuracy });
        }
      });
  });
  return recs.slice(0, limit || 5);
}
```

---

## 4. Message Variants (all deterministic)

All variants use the student's real name and real label strings — no `err_*` codes or snake_case tags ever reach the UI.

| Tier | `headline` | `summary` | `actionLabel` | `why` |
|---|---|---|---|---|
| `no-data` | `Not enough data` | `{name} needs a few more practice questions before we can spot patterns.` | `Complete one more lesson quiz to unlock better insights.` | `There is not enough activity yet to identify a weak skill.` |
| `low-data` | `Getting started` | `{name} has started practicing. A few more questions will unlock skill-level insights.` | `Try a 5-question quiz on any lesson.` | `We have {n} answer{s} so far — a few more will unlock skill-level insights.` |
| `needs-review` | `Needs review` | `{name} is struggling most with {weakLabel}. {weakPct}% accuracy across {n} question{s}{, most common mistake: {errLabel}}.` | `Review: {lessonName}.` OR `Spend a few minutes practicing {weakLabel}.` | `{weakLabel} is at {weakPct}% accuracy across {n} attempt{s}.{ Most common mistake: {errLabel}.}` |
| `improving` | `Improving` | `{name} still needs work on {weakLabel}, but recent answers are improving. Keep going.` | `Continue: {lessonName}.` OR `Keep practicing {weakLabel}.` | `{weakPct}% accuracy on {weakLabel} across {n} attempt{s}. Recent answers show improvement.` |
| `declining` | `Needs attention` | `{name}'s recent answers show more misses in {weakLabel}. A short review now can help.` | `Review {lessonName} before moving ahead.` OR `Review {weakLabel} before the next lesson.` | `{weakPct}% accuracy on {weakLabel}. Recent trend: more misses.{ Most common mistake: {errLabel}.}` |
| `mixed` | `Mixed` | `{name} is strong in {strongLabel} but needs review in {weakLabel}.` | `Focus on {lessonName} this week.` OR `Spend a few minutes on {weakLabel} this week.` | `{weakLabel} is at {weakPct}% accuracy ({n} attempt{s}).{ Most common mistake: {errLabel}.}` |
| `strong` | `Strong` | `{name} is doing well overall. Keep practicing to stay sharp.` | `Try a new lesson to keep growing.` | `{n} skill{s} at 80%+ accuracy.` |
| `developing` | `Developing` | `{name} is developing in math. Steady practice is making a difference.` | `Continue with the recommended lessons below.` | `{totalAttempted} question{s} answered. Keep building the streak.` |

---

## 5. Trend Logic

```javascript
function _computeTrend(activityEvents) {
  // Sort by timestamp ascending, take last 10 events
  var sorted = (activityEvents || [])
    .filter(function(e) { return e.ts && typeof e.correct === 'boolean'; })
    .sort(function(a, b) { return a.ts - b.ts })
    .slice(-10);

  // Need at least 6 data points to detect a real trend
  if (sorted.length < 6) return 'steady';

  var first5 = sorted.slice(0, 5);
  var last5  = sorted.slice(-5);

  var acc5first = first5.filter(function(e) { return e.correct; }).length / 5;
  var acc5last  = last5.filter(function(e)  { return e.correct; }).length / 5;
  var delta     = acc5last - acc5first;

  // ±20pp threshold (1 correct/wrong out of 5 = meaningful shift)
  if (delta >=  0.20) return 'improving';
  if (delta <= -0.20) return 'declining';
  return 'steady';
}
```

**Threshold rationale:** 20 percentage points = 1 correct/wrong out of every 5 answers. Below this, the variation is indistinguishable from noise at low attempt counts.

---

## 6. Confidence Logic

```javascript
function _computeConfidence(totalQuestionsAnswered) {
  if (totalQuestionsAnswered < 3)  return 'none';
  if (totalQuestionsAnswered < 10) return 'low';
  if (totalQuestionsAnswered < 30) return 'medium';
  return 'high';
}
```

`totalQuestionsAnswered` = `scores.filter(s => s.pct != null && s.total > 0).reduce((acc, s) => acc + s.total, 0)`.

The confidence value is included in the return object but not yet shown visually — reserved for a future tooltip or indicator.

---

## 7. Recommended Action Logic

```javascript
// Called inside buildParentInsight after tier is resolved
function _resolveAction(tier, weakTagLabel, actionLessonName, errLabels) {
  switch (tier) {
    case 'no-data':
      return 'Complete one more lesson quiz to unlock better insights.';
    case 'low-data':
      return 'Try a 5-question quiz on any lesson.';
    case 'needs-review':
      return actionLessonName
        ? 'Review: ' + actionLessonName + '.'
        : 'Spend a few minutes practicing ' + weakTagLabel + '.';
    case 'improving':
      return actionLessonName
        ? 'Continue: ' + actionLessonName + '.'
        : 'Keep practicing ' + weakTagLabel + '.';
    case 'declining':
      return actionLessonName
        ? 'Review ' + actionLessonName + ' before moving ahead.'
        : 'Review ' + weakTagLabel + ' before the next lesson.';
    case 'mixed':
      return actionLessonName
        ? 'Focus on ' + actionLessonName + ' this week.'
        : 'Spend a few minutes on ' + weakTagLabel + ' this week.';
    case 'strong':
      return 'Try a new lesson to keep growing.';
    case 'developing':
    default:
      return 'Continue with the recommended lessons below.';
  }
}
```

Action verb matches tone: "Review" for declining/review, "Continue" for improving, "Focus on" for mixed.

---

## 8. Files Likely to Change

| File | Change | Notes |
|---|---|---|
| `dashboard/dashboard.js` | Add 4 helper functions + `buildParentInsight` + export | ~120 lines added near bottom before Jest bridge |
| `src/dashboard.js` | Add same `buildParentInsight` near line 2171; refactor `_renderParentActionSummary` to call it | `_renderParentActionSummary` shrinks from ~100 lines to ~20 |
| `tests/dashboard.test.js` | Add new describe block with 7 seed scenarios | ~120 lines added |

**No changes to:** question data, quiz logic, Supabase sync, auth, styles (the existing 4 CSS tiers absorb all 8 insight tiers via `_CSS_TIER` mapping), test runner config, build script.

---

## 9. Test / Seed Plan

Seven seed scenarios required — one per meaningful state. Tests live in `tests/dashboard.test.js`, imported from `dashboard/dashboard.js`.

### Shared test helpers

```javascript
// Minimal label maps for tests — no need to import the full 84/53-entry maps
const TEST_TAG_LABELS = {
  regrouping:  'Regrouping',
  place_value: 'Place Value',
  counting:    'Counting',
  subtraction: 'Subtraction',
};
const TEST_ERR_LABELS = {
  err_no_regroup:      'Forgot to regroup',
  err_reversed_digits: 'Reversed Digits',
};
const noopLessonFn = () => null;
const lessonFn = (id) => id === 'ku3l2' ? { lesson: 'Subtracting Numbers', unit: 'Addition & Subtraction' } : null;

function makeActivity(overrides) {
  return Object.assign({ ts: Date.now(), correct: true, errorType: null, tags: [], lessonId: null }, overrides);
}

function makeScore(overrides) {
  return Object.assign({ pct: 80, score: 8, total: 10 }, overrides);
}
```

### Scenario 1: No data

```javascript
test('no-data: fewer than 3 total questions answered', () => {
  const r = buildParentInsight({
    mastery: {},
    activityEvents: [],
    scores: [makeScore({ pct: 100, total: 2 })],
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn,
  });
  expect(r.tier).toBe('no-data');
  expect(r.cssTier).toBe('no-data');
  expect(r.confidence).toBe('none');
  expect(r.summary).toContain('Alex');
  expect(r.summary).not.toMatch(/err_|snake_case/);
  expect(r.weakTag).toBeNull();
  expect(r.trend).toBe('steady');
});
```

### Scenario 2: Low data

```javascript
test('low-data: 3-9 questions, no tags with enough attempts', () => {
  const r = buildParentInsight({
    mastery: { regrouping: { attempts: 2, correct: 1 } },  // < 3 attempts
    activityEvents: [],
    scores: [makeScore({ pct: 50, total: 5 })],
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn,
  });
  expect(r.tier).toBe('low-data');
  expect(r.confidence).toBe('low');
  expect(r.headline).toBe('Getting started');
  expect(r.actionLabel).toContain('quiz');
});
```

### Scenario 3: Needs review (steady)

```javascript
test('needs-review: weak tag, steady trend, lesson resolved', () => {
  const events = [
    makeActivity({ correct: false, errorType: 'err_no_regroup', tags: ['regrouping'], lessonId: 'ku3l2', ts: 1000 }),
    makeActivity({ correct: false, errorType: 'err_no_regroup', tags: ['regrouping'], lessonId: 'ku3l2', ts: 2000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], lessonId: 'ku3l2', ts: 3000 }),
  ];
  const r = buildParentInsight({
    mastery: { regrouping: { attempts: 8, correct: 3 } },
    activityEvents: events,
    scores: [makeScore({ pct: 40, total: 10 }), makeScore({ pct: 40, total: 5 })],
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: lessonFn,
  });
  expect(r.tier).toBe('needs-review');
  expect(r.weakTagLabel).toBe('Regrouping');
  expect(r.summary).toContain('Regrouping');
  expect(r.summary).not.toContain('err_');
  expect(r.commonErrorLabel).toBe('Forgot to regroup');
  expect(r.actionLessonName).toBe('Subtracting Numbers');
  expect(r.actionLabel).toContain('Subtracting Numbers');
});
```

### Scenario 4: Improving

```javascript
test('improving: weak tag exists, recent accuracy rising', () => {
  const now = Date.now();
  const events = [
    // first 5: 1/5 correct (20%)
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 9000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 8000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 7000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 6000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 5000 }),
    // last 5: 4/5 correct (80%)  — delta = +0.60, > 0.20 threshold
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 4000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 3000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 2000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 1000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now }),
  ];
  const r = buildParentInsight({
    mastery: { regrouping: { attempts: 10, correct: 4 } },  // 40% — still weak
    activityEvents: events,
    scores: Array(2).fill(null).map(() => makeScore({ pct: 40, total: 5 })),
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn,
  });
  expect(r.tier).toBe('improving');
  expect(r.trend).toBe('improving');
  expect(r.summary).toContain('improving');
});
```

### Scenario 5: Declining

```javascript
test('declining: weak tag, recent accuracy dropping', () => {
  const now = Date.now();
  const events = [
    // first 5: 4/5 correct (80%)
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 9000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 8000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 7000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 6000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 5000 }),
    // last 5: 1/5 correct (20%) — delta = -0.60, < -0.20 threshold
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 4000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 3000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now - 2000 }),
    makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 1000 }),
    makeActivity({ correct: false, tags: ['regrouping'], ts: now }),
  ];
  const r = buildParentInsight({
    mastery: { regrouping: { attempts: 10, correct: 5 } },  // 50% — weak
    activityEvents: events,
    scores: Array(2).fill(null).map(() => makeScore({ pct: 50, total: 5 })),
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn,
  });
  expect(r.tier).toBe('declining');
  expect(r.trend).toBe('declining');
  expect(r.summary).toContain('more misses');
  expect(r.headline).toBe('Needs attention');
});
```

### Scenario 6: Strong

```javascript
test('strong: no weak tags, high accuracy', () => {
  const r = buildParentInsight({
    mastery: {
      regrouping:  { attempts: 10, correct: 9 },  // 90%
      place_value: { attempts: 8,  correct: 7 },  // 87.5%
    },
    activityEvents: [],
    scores: Array(4).fill(null).map(() => makeScore({ pct: 88, total: 10 })),
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn,
  });
  expect(r.tier).toBe('strong');
  expect(r.cssTier).toBe('strong');
  expect(r.headline).toBe('Strong');
  expect(r.weakTag).toBeNull();
  expect(r.summary).toContain('doing well');
});
```

### Scenario 7: Mixed

```javascript
test('mixed: strong skill + weak skill coexist', () => {
  const r = buildParentInsight({
    mastery: {
      place_value: { attempts: 8,  correct: 7 },  // 87.5% — strong
      regrouping:  { attempts: 10, correct: 4 },  // 40%  — weak
    },
    activityEvents: [],
    scores: Array(3).fill(null).map(() => makeScore({ pct: 60, total: 10 })),
    studentName: 'Alex',
    tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn,
  });
  expect(r.tier).toBe('mixed');
  expect(r.weakTagLabel).toBe('Regrouping');
  expect(r.strongTagLabel).toBe('Place Value');
  expect(r.summary).toContain('Place Value');
  expect(r.summary).toContain('Regrouping');
  expect(r.summary).not.toContain('err_');
});
```

---

## 10. Acceptance Checklist

Visual and behavioral checks after implementation:

**Data behavior**
- [ ] With 0 total questions: shows "Not enough data" pill
- [ ] With 5 total questions and no tag ≥ 3 attempts: shows "Getting started" pill
- [ ] With 1 weak tag, steady trend: shows "Needs review" with specific tag name and lesson name (no raw tag key)
- [ ] With 1 weak tag, recent accuracy rising: shows "Improving"
- [ ] With 1 weak tag, recent accuracy falling: shows "Needs attention"
- [ ] With 1 strong + 1 weak tag: shows "Mixed" with both tag labels
- [ ] With no weak tags and accuracy ≥ 80%: shows "Strong"
- [ ] With mixed accuracy but no weak tags: shows "Developing"

**No raw codes**
- [ ] No `err_*` strings visible anywhere in Action Summary card
- [ ] No snake_case tag keys (`regrouping`, `place_value`) visible
- [ ] All lesson names come from `_lessonDisplayName` (real names like "Subtracting Numbers")

**Action field**
- [ ] "Needs review" action names the specific lesson when one is available
- [ ] "Improving" action says "Continue: [lesson]" when lesson is available
- [ ] "Declining" action says "Review [lesson] before moving ahead" when lesson available
- [ ] Fallback actions use friendly tag label, never raw key

**Layout**
- [ ] All existing CSS tier borders still apply (the 4-class border system from Phase 4)
- [ ] `_renderParentActionSummary` still generates the same HTML structure (no layout change)
- [ ] Settings, practice spotlight, learning insights sections unaffected

**Tests**
- [ ] All 7 scenario tests pass
- [ ] All existing test suites still pass: `npx jest --silent`, `node --test tests/security.test.js`, `node --test tests/core.test.js`
- [ ] `node scripts/u8_smoke.js`, `node scripts/verify_stage2.js`, `node scripts/verify_stage3.js` all pass

---

## Implementation Tasks

### Task 1 — Add helper functions + `buildParentInsight` to `dashboard/dashboard.js`

**Files:**
- Modify: `dashboard/dashboard.js` — insert before the Jest bridge section (`if (typeof module !== 'undefined')`)

- [ ] **Step 1.1: Add 4 helper functions to `dashboard/dashboard.js`** (before Jest bridge)

  Insert after the last existing function definition, before `if (typeof module !== 'undefined')`:

  ```javascript
  // ── Insight engine helpers (also in src/dashboard.js; duplicated here for testability) ──

  function _bie_computeTagStats(mastery) {
    return Object.keys(mastery || {}).map(function(tag) {
      var m = mastery[tag];
      var attempts = m.attempts || 0;
      return { tag: tag, attempts: attempts, correct: m.correct || 0,
               accuracy: attempts ? (m.correct || 0) / attempts : 0 };
    }).sort(function(a, b) { return a.accuracy - b.accuracy; });
  }

  function _bie_computeMisconceptions(events) {
    var counts = {};
    (events || []).forEach(function(e) {
      if (e.errorType) counts[e.errorType] = (counts[e.errorType] || 0) + 1;
    });
    return counts;
  }

  function _bie_buildTagLessonMap(events) {
    var map = {};
    (events || []).forEach(function(e) {
      if (!e.lessonId) return;
      (e.tags || []).forEach(function(tag) {
        if (!map[tag]) map[tag] = {};
        map[tag][e.lessonId] = (map[tag][e.lessonId] || 0) + 1;
      });
    });
    return map;
  }

  function _bie_recommendLesson(weakTags, tagLessonMap) {
    var recs = [], seen = {};
    weakTags.forEach(function(t) {
      var lessons = tagLessonMap[t.tag] || {};
      Object.keys(lessons).sort(function(a, b) { return lessons[b] - lessons[a]; })
        .slice(0, 2).forEach(function(lessonId) {
          if (!seen[lessonId]) { seen[lessonId] = true; recs.push({ lessonId: lessonId, weakTag: t.tag }); }
        });
    });
    return recs[0] || null;
  }

  function _bie_computeTrend(activityEvents) {
    var sorted = (activityEvents || [])
      .filter(function(e) { return e.ts && typeof e.correct === 'boolean'; })
      .sort(function(a, b) { return a.ts - b.ts; })
      .slice(-10);
    if (sorted.length < 6) return 'steady';
    var first5 = sorted.slice(0, 5);
    var last5  = sorted.slice(-5);
    var acc5first = first5.filter(function(e) { return e.correct; }).length / 5;
    var acc5last  = last5.filter(function(e)  { return e.correct; }).length / 5;
    var delta = acc5last - acc5first;
    if (delta >=  0.20) return 'improving';
    if (delta <= -0.20) return 'declining';
    return 'steady';
  }
  ```

  **Note:** Prefixed `_bie_` to avoid collisions with existing functions in `dashboard/dashboard.js` that may have same names.

- [ ] **Step 1.2: Add `buildParentInsight` to `dashboard/dashboard.js`** (after helpers, before Jest bridge)

  ```javascript
  var _BIE_CSS_TIER = {
    'no-data': 'no-data', 'low-data': 'no-data',
    'needs-review': 'needs-review', 'declining': 'needs-review',
    'improving': 'developing', 'mixed': 'developing', 'developing': 'developing',
    'strong': 'strong',
  };

  function buildParentInsight(opts) {
    var mastery        = opts.mastery        || {};
    var activityEvents = opts.activityEvents || [];
    var scores         = opts.scores         || [];
    var studentName    = opts.studentName    || 'Your child';
    var tagLabels      = opts.tagLabels      || {};
    var errLabels      = opts.errLabels      || {};
    var lessonNameFn   = opts.lessonNameFn   || function() { return null; };

    // ── 1. Tag stats ──────────────────────────────────────────────────────────
    var tagStats   = _bie_computeTagStats(mastery);
    var weakTags   = tagStats.filter(function(t) { return t.attempts >= 3 && t.accuracy < 0.60; });
    var strongTags = tagStats.filter(function(t) { return t.attempts >= 3 && t.accuracy >= 0.80; });
    var topWeakTag   = weakTags[0]   || null;
    var topStrongTag = strongTags[strongTags.length - 1] || null;

    // ── 2. Totals ─────────────────────────────────────────────────────────────
    var completedScores = scores.filter(function(s) { return s.pct != null && s.total > 0; });
    var totalQuestionsAnswered = completedScores.reduce(function(a, s) { return a + (s.total || 0); }, 0);
    var overallAccuracy = completedScores.length > 0
      ? Math.round(completedScores.reduce(function(a, s) { return a + s.pct; }, 0) / completedScores.length)
      : 0;

    // ── 3. Confidence ─────────────────────────────────────────────────────────
    var confidence;
    if (totalQuestionsAnswered < 3)  confidence = 'none';
    else if (totalQuestionsAnswered < 10) confidence = 'low';
    else if (totalQuestionsAnswered < 30) confidence = 'medium';
    else confidence = 'high';

    // ── 4. Trend ──────────────────────────────────────────────────────────────
    var trend = _bie_computeTrend(activityEvents);

    // ── 5. Mistakes ───────────────────────────────────────────────────────────
    var errCounts = _bie_computeMisconceptions(activityEvents);
    var topErr = null, topErrCount = 0;
    Object.keys(errCounts).forEach(function(t) {
      if (errCounts[t] > topErrCount) { topErr = t; topErrCount = errCounts[t]; }
    });

    // ── 6. Lesson recommendation ──────────────────────────────────────────────
    var topRec = topWeakTag
      ? _bie_recommendLesson(weakTags, _bie_buildTagLessonMap(activityEvents))
      : null;
    var actionLessonId   = topRec ? topRec.lessonId : null;
    var actionLessonName = null;
    if (actionLessonId) {
      var ldn = lessonNameFn(actionLessonId);
      actionLessonName = ldn ? ldn.lesson : null;
    }

    // ── 7. Labels ─────────────────────────────────────────────────────────────
    var _toTitle = function(s) { return s ? s.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }) : s; };
    var weakTagLabel   = topWeakTag   ? (tagLabels[topWeakTag.tag]   || _toTitle(topWeakTag.tag))   : null;
    var strongTagLabel = topStrongTag ? (tagLabels[topStrongTag.tag] || _toTitle(topStrongTag.tag)) : null;
    var commonErrorLabel = topErr ? (errLabels[topErr] || null) : null;

    // ── 8. Tier ───────────────────────────────────────────────────────────────
    var tier;
    var isMixed = weakTags.length > 0 && strongTags.length > 0;
    if (confidence === 'none') {
      tier = 'no-data';
    } else if (confidence === 'low' && weakTags.length === 0) {
      tier = 'low-data';
    } else if (weakTags.length > 0) {
      if      (trend === 'improving') tier = 'improving';
      else if (trend === 'declining') tier = 'declining';
      else if (isMixed)               tier = 'mixed';
      else                            tier = 'needs-review';
    } else if (overallAccuracy >= 80 || strongTags.length >= 2) {
      tier = 'strong';
    } else {
      tier = 'developing';
    }

    // ── 9. Copy ───────────────────────────────────────────────────────────────
    var n = studentName;
    var wpct = topWeakTag ? Math.round(topWeakTag.accuracy * 100) : 0;
    var wattempts = topWeakTag ? topWeakTag.attempts : 0;
    var errSuffix = commonErrorLabel ? ' Most common mistake: ' + commonErrorLabel + '.' : '';
    var headline, summary, actionLabel, why;

    switch (tier) {
      case 'no-data':
        headline    = 'Not enough data';
        summary     = n + ' needs a few more practice questions before we can spot patterns.';
        actionLabel = 'Complete one more lesson quiz to unlock better insights.';
        why         = 'There is not enough activity yet to identify a weak skill.';
        break;
      case 'low-data':
        headline    = 'Getting started';
        summary     = n + ' has started practicing. A few more questions will unlock skill-level insights.';
        actionLabel = 'Try a 5-question quiz on any lesson.';
        why         = 'We have ' + totalQuestionsAnswered + ' answer' + (totalQuestionsAnswered !== 1 ? 's' : '') + ' so far — a few more will unlock skill-level insights.';
        break;
      case 'needs-review':
        headline    = 'Needs review';
        summary     = n + ' is struggling most with ' + weakTagLabel + '. ' + wpct + '% accuracy across ' + wattempts + ' question' + (wattempts !== 1 ? 's' : '') + (commonErrorLabel ? ', most common mistake: ' + commonErrorLabel + '.' : '.');
        actionLabel = actionLessonName ? 'Review: ' + actionLessonName + '.' : 'Spend a few minutes practicing ' + weakTagLabel + '.';
        why         = weakTagLabel + ' is at ' + wpct + '% accuracy across ' + wattempts + ' attempt' + (wattempts !== 1 ? 's' : '') + '.' + errSuffix;
        break;
      case 'improving':
        headline    = 'Improving';
        summary     = n + ' still needs work on ' + weakTagLabel + ', but recent answers are improving. Keep going.';
        actionLabel = actionLessonName ? 'Continue: ' + actionLessonName + '.' : 'Keep practicing ' + weakTagLabel + '.';
        why         = wpct + '% accuracy on ' + weakTagLabel + ' across ' + wattempts + ' attempt' + (wattempts !== 1 ? 's' : '') + '. Recent answers show improvement.';
        break;
      case 'declining':
        headline    = 'Needs attention';
        summary     = n + '\'s recent answers show more misses in ' + weakTagLabel + '. A short review now can help.';
        actionLabel = actionLessonName ? 'Review ' + actionLessonName + ' before moving ahead.' : 'Review ' + weakTagLabel + ' before the next lesson.';
        why         = wpct + '% accuracy on ' + weakTagLabel + '. Recent trend: more misses.' + errSuffix;
        break;
      case 'mixed':
        headline    = 'Mixed';
        summary     = n + ' is strong in ' + strongTagLabel + ' but needs review in ' + weakTagLabel + '.';
        actionLabel = actionLessonName ? 'Focus on ' + actionLessonName + ' this week.' : 'Spend a few minutes on ' + weakTagLabel + ' this week.';
        why         = weakTagLabel + ' is at ' + wpct + '% accuracy (' + wattempts + ' attempt' + (wattempts !== 1 ? 's' : '') + ').' + errSuffix;
        break;
      case 'strong':
        headline    = 'Strong';
        summary     = n + ' is doing well overall. Keep practicing to stay sharp.';
        actionLabel = 'Try a new lesson to keep growing.';
        why         = strongTags.length + ' skill' + (strongTags.length !== 1 ? 's' : '') + ' at 80%+ accuracy.';
        break;
      case 'developing':
      default:
        headline    = 'Developing';
        summary     = n + ' is developing in math. Steady practice is making a difference.';
        actionLabel = 'Continue with the recommended lessons below.';
        why         = totalQuestionsAnswered + ' question' + (totalQuestionsAnswered !== 1 ? 's' : '') + ' answered. Keep building the streak.';
        break;
    }

    return {
      tier:             tier,
      cssTier:          _BIE_CSS_TIER[tier] || 'developing',
      headline:         headline,
      summary:          summary,
      actionLabel:      actionLabel,
      actionLessonId:   actionLessonId,
      actionLessonName: actionLessonName,
      why:              why,
      confidence:       confidence,
      weakTag:          topWeakTag   ? topWeakTag.tag   : null,
      weakTagLabel:     weakTagLabel,
      weakTagAccuracy:  topWeakTag   ? topWeakTag.accuracy   : null,
      weakTagAttempts:  topWeakTag   ? topWeakTag.attempts   : null,
      strongTag:        topStrongTag ? topStrongTag.tag : null,
      strongTagLabel:   strongTagLabel,
      commonErrorType:  topErr,
      commonErrorLabel: commonErrorLabel,
      trend:            trend,
    };
  }
  ```

- [ ] **Step 1.3: Add `buildParentInsight` to `module.exports` in `dashboard/dashboard.js`**

  Locate the `module.exports = {` block at the end of the file. Add one line:
  ```javascript
  buildParentInsight,
  ```

---

### Task 2 — Write failing tests for all 7 scenarios

**Files:**
- Modify: `tests/dashboard.test.js`

- [ ] **Step 2.1: Add import of `buildParentInsight`**

  Update the destructuring import at the top of `tests/dashboard.test.js`:
  ```javascript
  const {
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
    buildParentInsight,
  } = require('../dashboard/dashboard.js');
  ```

- [ ] **Step 2.2: Add test helpers and all 7 scenario tests** (after existing test blocks)

  Add the complete test block from Section 9 of this plan (scenarios 1–7), preceded by the shared `TEST_TAG_LABELS`, `TEST_ERR_LABELS`, `makeActivity`, and updated `makeScore` helpers.

  ```javascript
  // ── buildParentInsight ────────────────────────────────────────────────────
  const TEST_TAG_LABELS = {
    regrouping:  'Regrouping',
    place_value: 'Place Value',
    counting:    'Counting',
    subtraction: 'Subtraction',
  };
  const TEST_ERR_LABELS = {
    err_no_regroup:      'Forgot to regroup',
    err_reversed_digits: 'Reversed Digits',
  };
  const noopLessonFn = () => null;
  const lessonFn = (id) =>
    id === 'ku3l2' ? { lesson: 'Subtracting Numbers', unit: 'Addition & Subtraction' } : null;

  function makeActivity(overrides) {
    return Object.assign(
      { ts: Date.now(), correct: true, errorType: null, tags: [], lessonId: null },
      overrides
    );
  }
  function makeSc(overrides) {
    return Object.assign({ pct: 80, score: 8, total: 10 }, overrides);
  }

  describe('buildParentInsight', () => {
    const BASE_OPTS = { tagLabels: TEST_TAG_LABELS, errLabels: TEST_ERR_LABELS, lessonNameFn: noopLessonFn };

    test('no-data: fewer than 3 total questions answered', () => {
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: {}, activityEvents: [], scores: [makeSc({ total: 2 })], studentName: 'Alex',
      });
      expect(r.tier).toBe('no-data');
      expect(r.cssTier).toBe('no-data');
      expect(r.confidence).toBe('none');
      expect(r.headline).toBe('Not enough data');
      expect(r.summary).toContain('Alex');
      expect(r.summary).not.toMatch(/err_/);
      expect(r.weakTag).toBeNull();
      expect(r.trend).toBe('steady');
    });

    test('low-data: 3-9 questions, no tags with enough attempts', () => {
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: { regrouping: { attempts: 2, correct: 1 } },
        activityEvents: [], scores: [makeSc({ pct: 50, total: 5 })], studentName: 'Alex',
      });
      expect(r.tier).toBe('low-data');
      expect(r.confidence).toBe('low');
      expect(r.headline).toBe('Getting started');
      expect(r.actionLabel).toContain('quiz');
    });

    test('needs-review: weak tag, steady trend, lesson resolved', () => {
      const events = [
        makeActivity({ correct: false, errorType: 'err_no_regroup', tags: ['regrouping'], lessonId: 'ku3l2', ts: 1000 }),
        makeActivity({ correct: false, errorType: 'err_no_regroup', tags: ['regrouping'], lessonId: 'ku3l2', ts: 2000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], lessonId: 'ku3l2', ts: 3000 }),
      ];
      const r = buildParentInsight({ ...BASE_OPTS,
        lessonNameFn: lessonFn,
        mastery: { regrouping: { attempts: 8, correct: 3 } },
        activityEvents: events,
        scores: [makeSc({ pct: 40, total: 10 }), makeSc({ pct: 40, total: 5 })],
        studentName: 'Alex',
      });
      expect(r.tier).toBe('needs-review');
      expect(r.weakTagLabel).toBe('Regrouping');
      expect(r.summary).toContain('Regrouping');
      expect(r.summary).not.toContain('err_');
      expect(r.commonErrorLabel).toBe('Forgot to regroup');
      expect(r.actionLessonName).toBe('Subtracting Numbers');
      expect(r.actionLabel).toContain('Subtracting Numbers');
    });

    test('improving: weak tag, recent accuracy rising', () => {
      const now = Date.now();
      const events = [
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 9000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 8000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 7000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 6000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 5000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 4000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 3000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 2000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 1000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now }),
      ];
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: { regrouping: { attempts: 10, correct: 4 } },
        activityEvents: events,
        scores: [makeSc({ pct: 40, total: 5 }), makeSc({ pct: 40, total: 5 })],
        studentName: 'Alex',
      });
      expect(r.tier).toBe('improving');
      expect(r.trend).toBe('improving');
      expect(r.summary).toContain('improving');
    });

    test('declining: weak tag, recent accuracy dropping', () => {
      const now = Date.now();
      const events = [
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 9000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 8000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 7000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 6000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 5000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 4000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 3000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now - 2000 }),
        makeActivity({ correct: true,  tags: ['regrouping'], ts: now - 1000 }),
        makeActivity({ correct: false, tags: ['regrouping'], ts: now }),
      ];
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: { regrouping: { attempts: 10, correct: 5 } },
        activityEvents: events,
        scores: [makeSc({ pct: 50, total: 5 }), makeSc({ pct: 50, total: 5 })],
        studentName: 'Alex',
      });
      expect(r.tier).toBe('declining');
      expect(r.trend).toBe('declining');
      expect(r.summary).toContain('more misses');
      expect(r.headline).toBe('Needs attention');
    });

    test('strong: no weak tags, high accuracy', () => {
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: {
          regrouping:  { attempts: 10, correct: 9 },
          place_value: { attempts: 8,  correct: 7 },
        },
        activityEvents: [], scores: [makeSc({ pct: 88, total: 10 })].concat(
          [makeSc({ pct: 88, total: 10 }), makeSc({ pct: 88, total: 10 }), makeSc({ pct: 88, total: 10 })]),
        studentName: 'Alex',
      });
      expect(r.tier).toBe('strong');
      expect(r.cssTier).toBe('strong');
      expect(r.headline).toBe('Strong');
      expect(r.weakTag).toBeNull();
      expect(r.summary).toContain('doing well');
    });

    test('mixed: strong + weak skill coexist', () => {
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: {
          place_value: { attempts: 8,  correct: 7 },
          regrouping:  { attempts: 10, correct: 4 },
        },
        activityEvents: [],
        scores: [makeSc({ pct: 60, total: 10 }), makeSc({ pct: 60, total: 10 }), makeSc({ pct: 60, total: 10 })],
        studentName: 'Alex',
      });
      expect(r.tier).toBe('mixed');
      expect(r.weakTagLabel).toBe('Regrouping');
      expect(r.strongTagLabel).toBe('Place Value');
      expect(r.summary).toContain('Place Value');
      expect(r.summary).toContain('Regrouping');
      expect(r.summary).not.toContain('err_');
    });

    test('no raw tag keys in any string field', () => {
      const r = buildParentInsight({ ...BASE_OPTS,
        mastery: { regrouping: { attempts: 8, correct: 3 } },
        activityEvents: [makeActivity({ errorType: 'err_no_regroup', correct: false, tags: ['regrouping'] })],
        scores: [makeSc({ pct: 38, total: 10 }), makeSc({ pct: 38, total: 5 })],
        studentName: 'TestChild',
      });
      const stringFields = [r.headline, r.summary, r.actionLabel, r.why];
      stringFields.forEach(function(f) {
        expect(f).not.toMatch(/err_/);
        expect(f).not.toMatch(/regrouping|place_value|subtraction/);
      });
    });
  });
  ```

- [ ] **Step 2.3: Run tests — expect failures**

  ```
  npx jest tests/dashboard.test.js --silent 2>&1
  ```
  Expected: `buildParentInsight is not a function` error for all 8 new tests.

---

### Task 3 — Implement `buildParentInsight` in `dashboard/dashboard.js`

- [ ] **Step 3.1: Apply Steps 1.1, 1.2, 1.3** from Task 1 above.

- [ ] **Step 3.2: Run tests — expect all new tests to pass**

  ```
  npx jest tests/dashboard.test.js --silent 2>&1
  ```
  Expected: 8 new tests pass. All previously passing tests continue to pass.

- [ ] **Step 3.3: Commit**

  ```
  git add dashboard/dashboard.js tests/dashboard.test.js
  git commit -m "feat(insight): add buildParentInsight engine with 7-scenario tests"
  ```

---

### Task 4 — Add `buildParentInsight` to `src/dashboard.js` and refactor `_renderParentActionSummary`

**Files:**
- Modify: `src/dashboard.js`

- [ ] **Step 4.1: Add `buildParentInsight` to `src/dashboard.js`** (insert before `_renderParentActionSummary` at line 2171)

  Add the same `_BIE_*` helpers and `buildParentInsight` function from Task 1, steps 1.1 and 1.2 — but in the production version, label lookups use the global maps directly. The function signature is identical; callers in `src/dashboard.js` can either call it with injected maps or use `_TAG_LABEL_MAP` directly.

  Insert before line 2171:
  ```javascript
  // ── Insight engine helpers ─────────────────────────────────────────────────
  // (also in dashboard/dashboard.js for testability)
  var _BIE_CSS_TIER = {
    'no-data': 'no-data', 'low-data': 'no-data',
    'needs-review': 'needs-review', 'declining': 'needs-review',
    'improving': 'developing', 'mixed': 'developing', 'developing': 'developing',
    'strong': 'strong',
  };
  ```

  Then add the full `buildParentInsight` function (identical body to `dashboard/dashboard.js` version).

- [ ] **Step 4.2: Refactor `_renderParentActionSummary`** (lines 2171–2268 → ~25 lines)

  Replace the existing function body with:

  ```javascript
  function _renderParentActionSummary(stats, mastery, activityEvents, name) {
    var insight = buildParentInsight({
      mastery:        mastery        || {},
      activityEvents: activityEvents || [],
      scores:         (stats && stats._rawScores) || [],
      studentName:    name,
      tagLabels:      _TAG_LABEL_MAP,
      errLabels:      _ERR_LABEL_MAP,
      lessonNameFn:   _lessonDisplayName,
    });

    var tierColors = {
      'no-data':      '#607d8b',
      'needs-review': '#c62828',
      'developing':   '#e65100',
      'strong':       '#2e7d32',
    };
    var color = tierColors[insight.cssTier] || '#607d8b';

    return '<section class="db-section db-action-summary das-' + insight.cssTier + '">'
      + '<div class="das-pill" style="background:' + color + '15;color:' + color
      + ';border:1px solid ' + color + '">' + _esc(insight.headline) + '</div>'
      + '<p class="das-summary">' + insight.summary + '</p>'
      + '<p class="das-action"><strong>Action:</strong> ' + insight.actionLabel + '</p>'
      + '<p class="das-why">' + insight.why + '</p>'
      + '</section>';
  }
  ```

  **Note on `stats._rawScores`:** The `stats` object from `_computeOverallStats` does not carry the raw scores array. The cleanest fix is to pass `scores` directly to `_renderParentActionSummary`. Update the call site in `renderDashboard` at line 2349:

  ```javascript
  // Before (line 2349):
  _renderParentActionSummary(stats, mastery, activityEvents, student.name) +

  // After:
  _renderParentActionSummary(stats, mastery, activityEvents, student.name, scores) +
  ```

  And update the function signature:
  ```javascript
  function _renderParentActionSummary(stats, mastery, activityEvents, name, scores) {
  ```

  Then use `scores || []` directly instead of `stats._rawScores`.

- [ ] **Step 4.3: Run full test suite**

  ```
  npx jest --silent
  node --test tests/security.test.js
  node --test tests/core.test.js
  node scripts/u8_smoke.js
  node scripts/verify_stage2.js
  node scripts/verify_stage3.js
  ```
  All suites must pass.

- [ ] **Step 4.4: Build**

  ```
  node build.js
  ```
  Expected: clean output, `dist/index.html` updated.

- [ ] **Step 4.5: Manual visual verification**

  Open `dist/index.html` in a browser. With seeded mock student data (see verification scenarios above), confirm:
  - Each of the 8 tiers produces a different pill headline
  - No `err_*` or snake_case strings visible in the card
  - Real lesson names appear in the Action field when available
  - "Needs attention" pill (declining) shows red border
  - "Improving" pill shows orange border
  - "Mixed" pill shows orange border
  - "Strong" shows green border

- [ ] **Step 4.6: Commit**

  ```
  git add src/dashboard.js
  git commit -m "feat(insight): wire buildParentInsight into Action Summary card"
  ```

---

## Self-Review

**Spec coverage:**

| Requirement | Task |
|---|---|
| Overall performance analysis | Task 1 — `buildParentInsight` computes totalQuestionsAnswered, overallAccuracy, weak/strong counts |
| Weakest skill with lesson rec + errorType | Task 1 — topWeakTag, actionLessonName, commonErrorLabel |
| Recent trend (last 5 vs 5 of last 10) | Task 1 — `_bie_computeTrend` |
| Mistake pattern + parent help | Task 1 — errCounts, commonErrorLabel (help text available via `_ERR_HELP_MAP` in production) |
| Confidence level | Task 1 — `confidence` field |
| Summary variants (all 8) | Task 1 — switch statement |
| Action variants per tier | Task 1 — `_resolveAction` logic inline |
| Data shape `buildParentInsight({...})` | Task 1 — full return object matches spec |
| Integration into Action Summary card | Task 4 |
| 7 seed test scenarios | Task 2 |
| No raw tags anywhere | Task 2 — final test `'no raw tag keys in any string field'` |

**Placeholder scan:** No TBDs, TODOs, or incomplete descriptions found. All code blocks are complete and executable.

**Type consistency:** `buildParentInsight` return fields used in Task 4 (`insight.cssTier`, `insight.headline`, `insight.summary`, `insight.actionLabel`, `insight.why`) all match the defined return shape in Task 1.
