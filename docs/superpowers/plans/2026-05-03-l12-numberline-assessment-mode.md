# Lesson 1.2 Number Line Assessment Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix L1.2 quiz/practice number line visuals so they no longer reveal the answer, by implementing `mode: "assessment"` rendering with compact 4-tick configs and explicit-only labels.

**Architecture:** Four coordinated changes in dependency order — (1) validator gets strict R13 rules first so the red/green cycle is visible; (2) data factories generate assessment-mode configs via `_toAssessmentNL()`; (3) the v0.2.0→runtime adapter (`_g1VisToV` in `shared_g1.js`) passes the new fields through to the renderer; (4) the SVG renderer reads `mode` and `labels` to control what gets labeled. Worked examples are intentionally untouched.

**Tech Stack:** Vanilla JS, Node.js v18+ (for validator), SVG string generation in `src/visuals.js`

---

## Files Changed

| File | What changes |
|---|---|
| `scripts/validate-g1u1-spec.mjs` | Add `_checkR13NL` helper; replace old R13 block in quizBank loop; add R13 call in practiceQuestions loop |
| `src/data/g1/u1.js` | Add `_toAssessmentNL()` helper before `_l2Q`; replace numberLine block in `_l2Q` and `_l2P` |
| `src/data/shared_g1.js` | Update `_g1VisToV` numberLine case to pass through `mode`, `labels`, `hideLabels` |
| `src/visuals.js` | Add `assessMode`/`explicitLabels` vars, replace tick-loop label logic, replace aria block in `drawNumberLine` |

---

## Task 1: Write strict R13 validator rules — TDD red

**Files:**
- Modify: `scripts/validate-g1u1-spec.mjs`

- [ ] **Step 1.1 — Add `_checkR13NL` helper before `checkMigratedLesson`**

Find the line `function checkMigratedLesson(tag, l) {` (around line 124). Insert this function immediately before it:

```js
// ─── R13 helper: strict assessment-mode check for numberLine visuals ──────────
// Called from both quizBank and practiceQuestions loops. workedExamples exempt.
function _checkR13NL(qtag, vis, ansStr) {
  const markNum = Number(vis.mark);
  const ansNum  = Number(ansStr);

  if (vis.mode !== 'assessment')
    err(`${qtag} R13: numberLine must use mode:"assessment"`);
  if (!Number.isFinite(markNum))
    err(`${qtag} R13: numberLine missing valid mark`);

  // Resolve destination from first finite jump.to, else from answer
  let dest = null;
  if (Array.isArray(vis.jumps)) {
    for (const j of vis.jumps) {
      const to = Number(j.to);
      if (Number.isFinite(to)) { dest = to; break; }
    }
  }
  if (dest === null && Number.isFinite(ansNum)) dest = ansNum;
  if (dest === null) err(`${qtag} R13: numberLine missing valid destination`);

  // Labels checks
  if (!vis.labels) {
    err(`${qtag} R13: numberLine missing labels map`);
  } else {
    const markKey = Number.isFinite(markNum) ? String(markNum) : null;
    if (markKey && !(markKey in vis.labels))
      err(`${qtag} R13: labels must contain the mark "${markNum}"`);
    if (Number.isFinite(ansNum) && String(ansNum) in vis.labels)
      err(`${qtag} R13: answer "${ansNum}" must not appear in labels`);
    for (const k of Object.keys(vis.labels)) {
      if (k !== markKey)
        err(`${qtag} R13: labels must only contain the mark key — found extra key "${k}"`);
    }
    for (const v of Object.values(vis.labels)) {
      if (Number.isFinite(ansNum) && String(v) === String(ansNum))
        err(`${qtag} R13: label text "${v}" equals answer — would reveal the answer`);
    }
  }

  // Jump hideToLabel checks
  if (Array.isArray(vis.jumps)) {
    vis.jumps.forEach((j, ji) => {
      if (!j.hideToLabel)
        err(`${qtag} R13: jump ${ji + 1} must have hideToLabel:true`);
    });
  }

  // Compact tick checks
  const ticks = Array.isArray(vis.ticks) ? vis.ticks : [];
  if (ticks.length < 3 || ticks.length > 5)
    warn(`${qtag} R13: ticks.length=${ticks.length} — expected 3–5 for compact assessment view`);
  if (Number.isFinite(markNum) && !ticks.includes(markNum))
    err(`${qtag} R13: ticks must include mark ${markNum}`);
  if (dest !== null && !ticks.includes(dest))
    err(`${qtag} R13: ticks must include destination ${dest}`);
}
```

- [ ] **Step 1.2 — Replace old R13 block in the `quizBank` loop**

Find this block inside `l.quizBank.forEach((q, qi) => { ... }` (around line 221):

```js
    // R13: numberLine quizBank visuals must not expose the answer tick label.
    // The answer value must appear in hideLabels, or on a jump with hideToLabel:true.
    // Worked examples are exempt (different array, not quizBank).
    if (q.visual && q.visual.type === 'numberLine') {
      const hiddenNums = new Set((q.visual.hideLabels || []).map(Number));
      (q.visual.jumps || []).forEach(j => { if (j.hideToLabel) hiddenNums.add(Number(j.to)); });
      const ansNum = parseFloat(q.answer);
      if (!isNaN(ansNum) && !hiddenNums.has(ansNum)) {
        err(`${qtag} R13: numberLine visual exposes answer "${q.answer}" — add hideLabels:[${ansNum}] or hideToLabel:true on the jump reaching ${ansNum}`);
      }
    }
```

Replace with:

```js
    // R13: strict assessment-mode check. Worked examples are exempt.
    if (q.visual && q.visual.type === 'numberLine') {
      _checkR13NL(qtag, q.visual, q.answer);
    }
```

- [ ] **Step 1.3 — Add R13 call to the `practiceQuestions` loop**

Find this closing block in the `(l.practiceQuestions || []).forEach((p, pi) => { ... }` loop (around line 185):

```js
    if (seenIds.has(p.id)) err(`R5: duplicate id ${p.id}`);
    seenIds.add(p.id);
  });
```

Replace with:

```js
    // R13: assessment-mode check for practice numberLines
    if (p.visual && p.visual.type === 'numberLine') {
      _checkR13NL(`${tag} p${pi + 1}`, p.visual, p.answer);
    }
    if (seenIds.has(p.id)) err(`R5: duplicate id ${p.id}`);
    seenIds.add(p.id);
  });
```

- [ ] **Step 1.4 — Run validator, expect FAIL**

```
node scripts/validate-g1u1-spec.mjs
```

Expected: many R13 errors like:

```
  - L2 qb17 R13: numberLine must use mode:"assessment"
  - L2 qb17 R13: numberLine missing labels map
  - L2 p21 R13: numberLine must use mode:"assessment"
  ...
```

This is the intended red state. Do not proceed until you see R13 errors firing. If the validator passes cleanly, R13 is not wired up.

---

## Task 2: Add `_toAssessmentNL` helper and update factories — TDD green

**Files:**
- Modify: `src/data/g1/u1.js`

- [ ] **Step 2.1 — Insert `_toAssessmentNL` helper before `_l2Q`**

Find the line `function _l2Q(n, o) {` (line 139). Insert this function immediately before it:

```js
// ── Assessment numberLine transformer ─────────────────────────────────────────
// Converts a raw v0.2.0 numberLine visual into assessment mode.
// Compact 4-tick window: [mark-1, mark, dest, dest+1].
// Only mark is labeled. Synthesizes a +1 jump if none is present.
// Returns a warning config if mark or destination cannot be resolved.
function _toAssessmentNL(visual, answerNum) {
  var markVal        = Number(visual.mark);
  var destFromAnswer = Number(answerNum);

  if (!Number.isFinite(markVal)) {
    return Object.assign({}, visual, {
      mode: 'assessment',
      labels: {},
      assessmentWarning: 'Missing valid mark for assessment numberLine'
    });
  }

  var dest       = null;
  var sourceJumps = Array.isArray(visual.jumps) ? visual.jumps : [];
  var newJumps   = sourceJumps.map(function(j) {
    var to = Number(j.to);
    if (dest === null && Number.isFinite(to)) dest = to;
    return Object.assign({}, j, { hideToLabel: true });
  });

  if (dest === null && Number.isFinite(destFromAnswer)) {
    dest = destFromAnswer;
  }

  if (newJumps.length === 0 && Number.isFinite(dest)) {
    newJumps.push({ from: markVal, to: dest, label: '+1', hideToLabel: true });
  }

  if (!Number.isFinite(dest)) {
    return Object.assign({}, visual, {
      mode: 'assessment',
      labels: { [String(markVal)]: String(markVal) },
      assessmentWarning: 'Missing valid destination for assessment numberLine'
    });
  }

  var compactMin   = Math.min(markVal - 1, dest - 1);
  var compactMax   = Math.max(markVal + 2, dest + 1);
  var compactTicks = [];
  for (var t = compactMin; t <= compactMax; t++) compactTicks.push(t);

  return Object.assign({}, visual, {
    mode:       'assessment',
    min:        compactMin,
    max:        compactMax,
    ticks:      compactTicks,
    labels:     { [String(markVal)]: String(markVal) },
    jumps:      newJumps,
    hideLabels: [dest]
  });
}
```

- [ ] **Step 2.2 — Replace the numberLine block in `_l2Q`**

Find this block inside `_l2Q` (around lines 154–163):

```js
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    var answerNum = parseFloat(o.answer);
    var newJumps = (visual.jumps || []).map(function(j) {
      return Object.assign({}, j, { hideToLabel: true });
    });
    var hideList = (visual.hideLabels || []).slice();
    if (!isNaN(answerNum) && hideList.indexOf(answerNum) < 0) hideList.push(answerNum);
    visual = Object.assign({}, visual, { jumps: newJumps, hideLabels: hideList });
  }
```

Replace with:

```js
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    visual = _toAssessmentNL(visual, Number(o.answer));
  }
```

- [ ] **Step 2.3 — Replace the numberLine block in `_l2P`**

Find this block inside `_l2P` (around lines 193–201):

```js
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    var answerNum = parseFloat(o.answer);
    var newJumps = (visual.jumps || []).map(function(j) {
      return Object.assign({}, j, { hideToLabel: true });
    });
    var hideList = (visual.hideLabels || []).slice();
    if (!isNaN(answerNum) && hideList.indexOf(answerNum) < 0) hideList.push(answerNum);
    visual = Object.assign({}, visual, { jumps: newJumps, hideLabels: hideList });
  }
```

Replace with:

```js
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    visual = _toAssessmentNL(visual, Number(o.answer));
  }
```

- [ ] **Step 2.4 — Run validator, expect PASS**

```
node scripts/validate-g1u1-spec.mjs
```

Expected:

```
=== Validation results ===
✓ 0 errors
✓ 0 warnings
```

If errors remain, the most likely causes are:
- A quizBank numberLine where `visual.mark` is missing — check the data entry.
- A practice numberLine where `p.answer` is not parseable as a number.

- [ ] **Step 2.5 — Commit data layer**

```
git add scripts/validate-g1u1-spec.mjs src/data/g1/u1.js
git commit -m "feat(l1.2): assessment-mode numberLine — compact configs, strict R13 validator"
```

---

## Task 3: Update `_g1VisToV` adapter to pass through new fields

**Files:**
- Modify: `src/data/shared_g1.js` (line 163)

**Background:** `_g1VisToV` converts v0.2.0 flat visuals into `{type, config}` before they reach `_buildVisualHTML`. Without this change, `mode`, `labels`, and `hideLabels` are silently dropped and the renderer never sees them.

- [ ] **Step 3.1 — Update the `numberLine` case in `_g1VisToV`**

Find this single-line case (line 163):

```js
    case 'numberLine':  return { type: 'numberLine',  config: { min: vis.min, max: vis.max, ticks: vis.ticks || [], jumps: vis.jumps || [], mark: vis.mark != null ? vis.mark : null } };
```

Replace with:

```js
    case 'numberLine': {
      const nlCfg = { min: vis.min, max: vis.max, ticks: vis.ticks || [], jumps: vis.jumps || [], mark: vis.mark != null ? vis.mark : null };
      if (vis.mode       != null) nlCfg.mode       = vis.mode;
      if (vis.labels     != null) nlCfg.labels     = vis.labels;
      if (vis.hideLabels != null) nlCfg.hideLabels = vis.hideLabels;
      return { type: 'numberLine', config: nlCfg };
    }
```

- [ ] **Step 3.2 — Commit**

```
git add src/data/shared_g1.js
git commit -m "fix(shared_g1): pass mode/labels/hideLabels through _g1VisToV for numberLine"
```

---

## Task 4: Update `drawNumberLine` renderer

**Files:**
- Modify: `src/visuals.js` (function `drawNumberLine`, lines 368–435)

- [ ] **Step 4.1 — Add `assessMode` and `explicitLabels` after the `hideSet` setup**

Find these two lines near the top of `drawNumberLine` (around lines 378–380):

```js
  const hideSet = new Set((cfg.hideLabels || []).map(Number));
  jumps.forEach(j => { if (j.hideToLabel) hideSet.add(Number(j.to)); });
```

Insert immediately after them:

```js
  const assessMode     = cfg.mode === 'assessment';
  const explicitLabels = cfg.labels || {};
```

- [ ] **Step 4.2 — Replace the tick-loop label logic**

Find this block (the `ticks.forEach` loop, around lines 412–422):

```js
  const tickFont = n <= 6 ? 13 : n <= 12 ? 11 : 9;
  ticks.forEach(v => {
    const x         = valToX(v);
    const isMark    = v === mark;
    // Suppress label if the value is in hideSet — but never suppress the mark (start position)
    const hideLabel = !isMark && hideSet.has(v);
    parts.push(`<line x1="${x}" y1="${LINE_Y - 8}" x2="${x}" y2="${LINE_Y + 8}" stroke="currentColor" stroke-width="${isMark ? 3 : 1.5}" opacity="${isMark ? 1 : 0.65}"/>`);
    if (!hideLabel) {
      parts.push(`<text x="${x}" y="${LINE_Y + 22}" text-anchor="middle" font-size="${tickFont}" fill="currentColor" opacity="${isMark ? 1 : 0.8}" font-family="sans-serif"${isMark ? ' font-weight="bold"' : ''}>${v}</text>`);
    }
  });
```

Replace with:

```js
  const tickFont = n <= 6 ? 13 : n <= 12 ? 11 : 9;
  ticks.forEach(v => {
    const x      = valToX(v);
    const isMark = v === mark;
    const key    = String(v);

    const showLabel = assessMode
      ? isMark || (key in explicitLabels)
      : isMark || !hideSet.has(v);

    const labelText = (assessMode && key in explicitLabels)
      ? explicitLabels[key]
      : String(v);

    parts.push(`<line x1="${x}" y1="${LINE_Y - 8}" x2="${x}" y2="${LINE_Y + 8}" stroke="currentColor" stroke-width="${isMark ? 3 : 1.5}" opacity="${isMark ? 1 : 0.65}"/>`);
    if (showLabel) {
      parts.push(`<text x="${x}" y="${LINE_Y + 22}" text-anchor="middle" font-size="${tickFont}" fill="currentColor" opacity="${isMark ? 1 : 0.8}" font-family="sans-serif"${isMark ? ' font-weight="bold"' : ''}>${_escHtml(labelText)}</text>`);
    }
  });
```

- [ ] **Step 4.3 — Replace the aria label block**

Find this block near the end of `drawNumberLine` (around lines 424–432):

```js
  // ── Aria label ──
  let ariaLabel = `Number line from ${min} to ${max}`;
  if (jumps.length) {
    ariaLabel += ' showing ' + jumps.map(j =>
      `a jump of ${j.label != null ? j.label : j.to - j.from} from ${j.from} to ${j.to}`
    ).join(' and ');
  }
  if (mark != null) ariaLabel += `, landing on ${mark}`;
  const label = cfg.label || ariaLabel;
```

Replace with:

```js
  // ── Aria label ──
  let ariaLabel;
  if (assessMode) {
    ariaLabel = mark != null ? `Number line starting at ${mark}` : 'Number line';
    if (jumps.length) {
      const desc = jumps.map(j => {
        const step = j.label != null ? j.label : (j.to - j.from);
        return step < 0 ? 'one step backward' : 'one step forward';
      }).join(' and ');
      ariaLabel += ` with ${desc}`;
    }
  } else {
    ariaLabel = `Number line from ${min} to ${max}`;
    if (jumps.length) {
      ariaLabel += ' showing ' + jumps.map(j =>
        `a jump of ${j.label != null ? j.label : j.to - j.from} from ${j.from} to ${j.to}`
      ).join(' and ');
    }
    if (mark != null) ariaLabel += `, starting at ${mark}`;
  }
  const label = cfg.label || ariaLabel;
```

- [ ] **Step 4.4 — Commit renderer**

```
git add src/visuals.js
git commit -m "feat(renderer): assessment mode for drawNumberLine — explicit-only labels, aria fix"
```

---

## Task 5: Build, validate, and browser-test

**Files:**
- No code changes in this task — build and test only

- [ ] **Step 5.1 — Build**

```
node build.js
```

Expected: exits with no errors.

- [ ] **Step 5.2 — Final validator pass**

```
node scripts/validate-g1u1-spec.mjs
```

Expected:

```
=== Validation results ===
✓ 0 errors
✓ 0 warnings
```

- [ ] **Step 5.3 — Browser test: open Lesson 1.2 quiz**

Open `dist/index.html` (or the dev server URL). Navigate to Grade 1 → Unit 1 → Lesson 2 (Count Forward) → Start Lesson Quiz.

Run the quiz 3 complete times. For every numberLine question, confirm **all** of the following:

| Check | Expected |
|---|---|
| Start tick is labeled | e.g., "47" appears in bold |
| All other tick marks visible | tick lines present for 46, 48, 49 |
| No other labels visible | 46, 48, 49 have no numbers |
| +1 arc is visible | curved arrow from start tick to next tick |
| No "47, blank, 49" appearance | looks like a number line, not a sequence with a gap |
| Aria (DevTools → Accessibility) | title reads "Number line starting at 47 with one step forward" |

Also confirm:

| Check | Expected |
|---|---|
| Worked examples | Fully labeled number line (all ticks show numbers) |
| 8-question quiz mix | Not all numberLine questions — text-only questions also appear |

- [ ] **Step 5.4 — Commit build output**

```
git add dist/
git commit -m "build: rebuild after L1.2 assessment numberLine fix"
```
