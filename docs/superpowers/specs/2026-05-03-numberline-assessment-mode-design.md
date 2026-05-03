# Number Line Assessment Mode — Design Spec

**Date:** 2026-05-03  
**Scope:** Lesson 1.2 quiz/practice number line visuals  
**Approach:** Approach A — Mode + compact ticks

---

## Problem

All Lesson 1.2 number line quiz visuals reveal the correct answer. The current renderer
auto-labels every tick not in `hideLabels`. The factories only hide the answer tick, leaving
surrounding ticks (e.g. 49, 50, 51 after a hidden 48) labeled — which makes the blank
position obvious by context.

**Example (broken):**  
Question: "Count forward one step from 47. What number do you reach?"  
Visual shows: `45, 46, 47, __, 49, 50, 51` — student reads off 48 from context.

---

## Solution Summary

Three coordinated changes:

1. **Renderer** — add `mode: "assessment"` that disables auto-labeling; only renders labels from explicit `cfg.labels` map.
2. **Factories** — `_l2Q` and `_l2P` call `_toAssessmentNL()` to produce compact 4-tick configs with only the start number labeled.
3. **Validator** — R13 strictly enforces assessment-mode requirements on all L1.2 quizBank and practice numberLine visuals.

---

## Section 1: Renderer (`src/visuals.js`)

### New config fields

| Field | Type | Description |
|---|---|---|
| `mode` | `"assessment" \| undefined` | Switches labeling to explicit-only |
| `labels` | `{ [value: string]: string }` | Map of tick value → display text |

### Label rendering (updated tick loop)

```js
const assessMode = cfg.mode === 'assessment';
const explicitLabels = cfg.labels || {};

// Per tick:
const key = String(v);
const isMark = v === mark;

let showLabel;
if (assessMode) {
  showLabel = isMark || (key in explicitLabels);
} else {
  showLabel = isMark || !hideSet.has(v);
}

const labelText = assessMode && key in explicitLabels
  ? explicitLabels[key]
  : String(v);
```

- `hideLabels` / `hideToLabel` remain for belt-and-suspenders (no-op in assessment mode).
- Tick marks always render regardless of mode.
- Jump arc, baseline, and arrowhead are unchanged.

### Aria label (accessibility)

**Assessment mode** — does not reveal destination:
```js
ariaLabel = mark != null ? `Number line starting at ${mark}` : 'Number line';
if (jumps.length) {
  const desc = jumps.map(j => {
    const step = j.label != null ? j.label : (j.to - j.from);
    return step < 0 ? 'one step backward' : 'one step forward';
  }).join(' and ');
  ariaLabel += ` with ${desc}`;
}
```

**Teaching mode** — full description:
```js
ariaLabel = `Number line from ${min} to ${max}`;
if (jumps.length) {
  ariaLabel += ' showing ' + jumps.map(j =>
    `a jump of ${j.label != null ? j.label : j.to - j.from} from ${j.from} to ${j.to}`
  ).join(' and ');
}
if (mark != null) ariaLabel += `, starting at ${mark}`;
```

---

## Section 2: Factories (`src/data/g1/u1.js`)

### Shared helper `_toAssessmentNL(visual, answerNum)`

Transforms a raw numberLine visual config into assessment mode.

```js
function _toAssessmentNL(visual, answerNum) {
  var markVal = Number(visual.mark);
  var destFromAnswer = Number(answerNum);

  // Mark is required — return warning config if missing
  if (!Number.isFinite(markVal)) {
    return Object.assign({}, visual, {
      mode: 'assessment',
      labels: {},
      assessmentWarning: 'Missing valid mark for assessment numberLine'
    });
  }

  var dest = null;
  var sourceJumps = Array.isArray(visual.jumps) ? visual.jumps : [];
  var newJumps = sourceJumps.map(function(j) {
    var to = Number(j.to);
    if (dest === null && Number.isFinite(to)) dest = to;
    return Object.assign({}, j, { hideToLabel: true });
  });

  // Infer destination from answer if no jump provides it
  if (dest === null && Number.isFinite(destFromAnswer)) {
    dest = destFromAnswer;
  }

  // Synthesize a jump if jumps array is empty but we know dest
  if (newJumps.length === 0 && Number.isFinite(dest)) {
    newJumps.push({ from: markVal, to: dest, label: '+1', hideToLabel: true });
  }

  // Destination still unknown — return partial warning config
  if (!Number.isFinite(dest)) {
    return Object.assign({}, visual, {
      mode: 'assessment',
      labels: { [String(markVal)]: String(markVal) },
      assessmentWarning: 'Missing valid destination for assessment numberLine'
    });
  }

  // Compact window: [mark-1, mark, dest, dest+1]
  var compactMin = Math.min(markVal - 1, dest - 1);
  var compactMax = Math.max(markVal + 2, dest + 1);
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

### Usage in `_l2Q` and `_l2P`

Replace the existing 5-line numberLine block in both factories:

```js
if (visual && visual.type === 'numberLine') {
  visual = _toAssessmentNL(visual, Number(o.answer));
}
```

### `_l2E` (worked examples)

Not changed. Worked examples use fully labeled number lines (teaching mode).

### Expected output for `mark: 47`, answer `"48"`

```js
{
  type:       "numberLine",
  mode:       "assessment",
  min:        46,
  max:        49,
  ticks:      [46, 47, 48, 49],
  mark:       47,
  labels:     { "47": "47" },
  jumps:      [{ from: 47, to: 48, label: "+1", hideToLabel: true }],
  hideLabels: [48]
}
```

---

## Section 3: Validator (`scripts/validate-g1u1-spec.mjs`)

### R13 — strict assessment-mode rules

Applies to every `numberLine` visual in `quizBank` and `practiceQuestions` for L1.2.  
`workedExamples` are exempt.

| Check | Condition | Failure message |
|---|---|---|
| Mode | `visual.mode !== 'assessment'` | `R13: numberLine must use mode:"assessment"` |
| Mark | `!Number.isFinite(Number(visual.mark))` | `R13: numberLine missing valid mark` |
| Destination | No `jump.to` and no answer inferrable | `R13: numberLine missing valid destination` |
| Labels exists | `!visual.labels` | `R13: numberLine missing labels map` |
| Mark in labels | `!(String(mark) in labels)` | `R13: labels must contain the mark "${mark}"` |
| Answer not in labels | `String(ans) in labels` | `R13: answer "${ans}" must not appear in labels` |
| Labels must be mark-only | any key in `labels` other than `String(mark)` | `R13: labels must only contain the mark key — found extra key "${key}"` |
| No label text equals answer | any label value `=== String(ans)` | `R13: label text "${v}" equals answer — would reveal the answer` |
| hideToLabel on jumps | any jump missing `hideToLabel: true` | `R13: all jumps must have hideToLabel:true` |
| Compact ticks | `ticks.length < 3 \|\| ticks.length > 5` | warn: `R13: ticks.length=${n} — expected 3–5 for compact assessment view` |
| Mark in ticks | `!ticks.includes(mark)` | `R13: ticks must include mark ${mark}` |
| Dest in ticks | `!ticks.includes(dest)` | `R13: ticks must include destination ${dest}` |

---

## Scope Constraint: One-Step Forward Movement Only

Assessment mode numberLines in L1.2 are **only for +1 movement questions**.

`_toAssessmentNL()` produces 4 ticks for a +1 jump. Multi-step jumps (e.g. +3) produce
more ticks, may exceed the 3–5 compact-tick range, and create a confusing assessment
visual where the student can count labeled ticks to infer the answer.

Rules:
- Use `mode: "assessment"` numberLine only when `dest === mark + 1`.
- Multi-step count-forward questions must use text or sequence-card format — not compact numberLine.
- Worked examples may use fuller teaching visuals for any jump size.
- A multi-step assessment visual mode may be designed separately in future, but is out of scope here.

The validator R13 compact-tick check (warn if `ticks.length > 5`) is the guard for this constraint.

---

## Section 4: Manual Verification

After implementation:

```
node scripts/validate-g1u1-spec.mjs
```

Then start the dev server and run Lesson 1.2 quiz 3 times. Confirm:

1. Only the starting number is labeled (e.g. tick at 47 shows "47"; all others show blank ticks)
2. The +1 arc is visible between start and next tick
3. No "47, blank, 49" appearance — surrounding unlabeled ticks don't create a broken look
4. The 8-question quiz selection still mixes text-only and numberLine question types
5. Worked examples (`_l2E`) still render fully labeled (teaching mode unaffected)
6. Validator reports 0 errors and 0 warnings

---

## Files Changed

| File | Change |
|---|---|
| `src/visuals.js` | Add assessment mode to `drawNumberLine` (label logic + aria) |
| `src/data/g1/u1.js` | Add `_toAssessmentNL` helper; update `_l2Q` and `_l2P` |
| `src/data/shared_g1.js` | Update `_g1VisToV` numberLine case to pass through `mode`, `labels`, `hideLabels` |
| `scripts/validate-g1u1-spec.mjs` | Rewrite R13 with strict assessment-mode checks |

## Spec Note: Visual Adapter (`src/data/shared_g1.js`)

The v0.2.0 flat visual format must pass through `_g1VisToV` before reaching
`_buildVisualHTML`. The current numberLine case only copies `min, max, ticks, jumps, mark`.
The new fields `mode`, `labels`, and `hideLabels` must be added:

```js
case 'numberLine': return {
  type: 'numberLine',
  config: {
    min:        vis.min,
    max:        vis.max,
    ticks:      vis.ticks      || [],
    jumps:      vis.jumps      || [],
    mark:       vis.mark != null ? vis.mark : null,
    mode:       vis.mode       || undefined,
    labels:     vis.labels     || undefined,
    hideLabels: vis.hideLabels || undefined
  }
};
```

Without this change, `mode: "assessment"` and `labels` are silently dropped at the
adapter layer and the renderer never sees them.
