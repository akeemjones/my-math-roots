# Grade 1 Unit 4 · Lesson 4.1 — Add Tens and Ones · Design Plan

> **Status:** PLANNING ONLY — no code yet. Awaiting approval before implementation.
> **Scope of this document:** content/design plan. Implementation TDD plan will be a separate document after approval.

---

## 1. Lesson title

**Add Tens and Ones**

## 2. TEKS alignment

- **Primary:** TEKS 1.3A — Use concrete and pictorial models to determine the sum of a multiple of 10 and a one-digit number in problems up to 99.
- **Supporting:** TEKS 1.5G — Apply properties of operations to add and subtract two or three numbers (commutative form: `40 + 5 = 5 + 40`).

`teks: ['1.3A', '1.5G']` in spec.

## 3. Skill name

`skill: 'add_tens_and_ones'`

## 4. Exact scope

A single skill: combining a **multiple of 10** with a **one-digit number** (or vice versa) using place-value reasoning.

Allowed problem shapes:
- `M + d = ?` — multiple of 10 plus one-digit  (e.g., `40 + 5`, `60 + 8`)
- `d + M = ?` — one-digit plus multiple of 10 (commutative form: `5 + 40`, `8 + 60`)
- `M + ☐ = sum` — missing ones (e.g., `50 + ☐ = 57`)
- `☐ + d = sum` — missing tens (e.g., `☐ + 4 = 84`)
- `M + d = ?` with base-10 model visual support (model→equation, equation→model)
- "Order doesn't matter" recognition (commutative): `8 + 60 = 60 + 8`
- Error-repair: identify the misconception when a peer drops the zero or adds digits only

Where:
- `M` ∈ {10, 20, 30, 40, 50, 60, 70, 80, 90}
- `d` ∈ {1, 2, 3, 4, 5, 6, 7, 8, 9}
- All sums ≤ 99

Total unique `(M, d)` pairs: 9 × 9 = **81** distinct addition facts. With reordering, missing-blank variants, and visual variants, the effective question space is several hundred — plenty for 170 questions without repetition.

## 5. What stays out of scope

Hard guardrails — these MUST NOT appear in any L4.1 question:

- ❌ Two-digit + two-digit (e.g., `27 + 18`)
- ❌ Regrouping / carrying / borrowing
- ❌ Vertical algorithm / column-addition layouts
- ❌ Subtraction (deferred — Unit 4 does not subtract two-digit numbers; multiples-of-10 subtraction is not in this unit either)
- ❌ Word problems as the main skill (L4.5 owns word problems — L4.1 may use *micro-stories* but not multi-sentence narratives)
- ❌ "10 more / 10 less" as the main skill (L4.2 owns this)
- ❌ Sums above 99
- ❌ Three-digit numbers anywhere
- ❌ Reuse of any content from `src/data/u4.js` (Grade 4 file)

## 6. Key ideas (6)

These populate `keyIdeas` in the spec — kid-readable rules.

```
1. A number like 40 means "4 tens" — that's 4 groups of ten.
2. A number like 5 means "5 ones" — five single units.
3. To add a multiple of 10 and a one-digit number, keep the tens in the tens place and the ones in the ones place.
4. The tens digit comes from how many tens you have. The ones digit comes from how many ones you have. (40 + 5 → 4 in tens, 5 in ones → 45.)
5. Numbers can be added in any order, so 40 + 5 and 5 + 40 give the same answer.
6. When you add a one-digit number to a multiple of 10, the tens digit doesn't change — you only fill in the ones place.
```

## 7. Worked examples (6)

These populate `workedExamples`. Each is one `{title, prompt, visual, steps[], finalAnswer}` object built by a `_l41Examples` array. Visuals use the existing `base10` renderer.

```
Example 1: Adding tens and ones with a model
  Prompt: "What is 40 + 5?"
  Visual: base10 { tens: 4, ones: 5 }
  Steps:
    1. 40 means 4 tens.
    2. 5 means 5 ones.
    3. Put the tens in the tens place: 4.
    4. Put the ones in the ones place: 5.
    5. The number is 45.
  Final answer: 40 + 5 = 45

Example 2: One-digit number first
  Prompt: "What is 6 + 30?"
  Visual: base10 { tens: 3, ones: 6 }
  Steps:
    1. 6 + 30 is the same as 30 + 6 — order doesn't matter.
    2. 30 means 3 tens.
    3. 6 means 6 ones.
    4. Tens in the tens place (3), ones in the ones place (6).
    5. The number is 36.
  Final answer: 6 + 30 = 36

Example 3: Reading a base-10 model
  Prompt: "What addition does this picture show?"
  Visual: base10 { tens: 7, ones: 8 }
  Steps:
    1. Count the tens rods: 7. That is 70.
    2. Count the ones cubes: 8. That is 8.
    3. 70 + 8 = 78.
  Final answer: 70 + 8 = 78

Example 4: Avoiding the digit-only mistake
  Prompt: "Why is 30 + 6 NOT 9?"
  Visual: base10 { tens: 3, ones: 6 }
  Steps:
    1. 30 is not 3 ones — it is 3 TENS.
    2. If you only count digits and get 9, you ignored place value.
    3. 30 + 6 = 36, not 9.
    4. Tens stay in the tens place. Ones stay in the ones place.
  Final answer: 30 + 6 = 36

Example 5: Finding a missing one
  Prompt: "50 + ☐ = 57. What goes in the box?"
  Visual: base10 { tens: 5, ones: 7 }
  Steps:
    1. The total is 57.
    2. 57 is 5 tens and 7 ones.
    3. We already have 50 (the 5 tens).
    4. We need 7 more ones.
    5. 50 + 7 = 57.
  Final answer: 50 + 7 = 57

Example 6: Order doesn't matter (commutative)
  Prompt: "Is 8 + 60 the same as 60 + 8?"
  Visual: base10 { tens: 6, ones: 8 }
  Steps:
    1. When you add, you can switch the order.
    2. 8 + 60 = 68.
    3. 60 + 8 = 68.
    4. Both give 68 because the tens (6) and ones (8) are the same.
  Final answer: Yes — both equal 68.
```

## 8. Question categories (8)

Mirrors the user's category list. Each category has a builder helper (`_l41MkBasicQ`, `_l41MkVisualQ`, etc.).

| # | Category | Form | Visual? |
|---|---|---|---|
| C1 | **Basic M + d** | `40 + 5 = ?` | optional base-10 |
| C2 | **Commutative form: d + M** | `5 + 40 = ?` | optional base-10 |
| C3 | **Base-10 model → equation** | "Which addition does this show?" | required base-10 |
| C4 | **Equation → standard number** | `70 + 6 = ?` | none (text only) |
| C5 | **Missing ones** | `50 + ☐ = 57` | optional base-10 (sum) |
| C6 | **Missing tens** | `☐ + 4 = 84` | optional base-10 (sum) |
| C7 | **Error repair** | "Why is 30 + 6 = 9 wrong?" / "What is the correct answer?" | none |
| C8 | **Commutative recognition** | "Is 8 + 60 the same as 60 + 8?" / "Which equals 7 + 50?" | none |

All categories use `interactionType: 'multipleChoice'`.

## 9. Target question count

**170 questions** (matches Unit 3 average for broad lessons).

## 10. Easy / medium / hard distribution

```
Easy:    55  (32%)
Medium:  70  (41%)
Hard:    45  (26%)
─────────────
Total:  170
```

### Per-category allocation

| Category | Easy | Medium | Hard | Total |
|---|---:|---:|---:|---:|
| C1 Basic M + d | 25 | 20 | 0 | 45 |
| C2 d + M (commutative form) | 10 | 0 | 0 | 10 |
| C3 Base-10 model → equation | 12 | 15 | 0 | 27 |
| C4 Equation → standard number | 8 | 15 | 0 | 23 |
| C5 Missing ones | 0 | 10 | 10 | 20 |
| C6 Missing tens | 0 | 0 | 12 | 12 |
| C7 Error repair | 0 | 0 | 13 | 13 |
| C8 Commutative recognition | 0 | 10 | 10 | 20 |
| **Totals** | **55** | **70** | **45** | **170** |

### Difficulty rules

- **Easy:** small `M` (10, 20, 30) and friendly `d` (1–5); answer choices have wide spread; visuals available.
- **Medium:** any `M`, any `d`; missing-blank variants begin; visuals optional; commutative forms appear.
- **Hard:** missing-tens, error-repair, advanced commutative chains. Numbers can be at the upper end (`80 + 9 = 89`). No visual safety-net unless the prompt explicitly involves a model.

### Coverage rules (avoid repetition)

- Within a single difficulty tier, no `(M, d)` pair appears more than once across the 8 categories. (We have 81 unique pairs — easily fits 55 + 70 + 45 with cross-tier reuse only.)
- Across all 170 questions, no exact `(category, M, d, prompt-template)` tuple repeats.
- Helpers MUST validate uniqueness via a `seen` Set keyed on `(category, M, d, variant)`.

## 11. Visual strategy

**Primary visual:** `base10` (existing `drawBase10` renderer in `src/visuals.js:278`).

### Where visuals appear

| Category | Question visual? | Intervention teaching visual? |
|---|---|---|
| C1 (E only) | sometimes (~50% of E) | always |
| C1 (M) | rare (~20%) | always |
| C2 | sometimes (~50% of E) | always |
| C3 | **required** (the visual *is* the question) | always |
| C4 | none | always |
| C5 | sometimes (~50%) | always |
| C6 | sometimes (~50%) | always |
| C7 | none (conceptual prompt) | always |
| C8 | none | always |

**Approximate visual coverage on questions:** ~40% of 170 = ~68 questions show base-10. Remaining 60% are text-only prompts to build numerical fluency without an always-on crutch.

### Visual structure rules

- For `M + d` (e.g., `40 + 5`): show `base10 { tens: M/10, ones: d }` — the model represents the **sum** (since base10 renders one composite quantity, not two addends).
- For C3 (model → equation): show `base10 { tens: T, ones: O }`, ask "Which addition does this show?", correct answer `T*10 + " + " + O`.
- For C5/C6 (missing-blank): visual shows the **target sum**; the kid reads the digit corresponding to the blank.
- **No new visual renderer changes.** Use only existing types from `_g1VisToV` adapter at `src/data/shared_g1.js:170`.

### Intervention visual rule (matches user's spec)

- **Top of intervention** ("THE QUESTION"): the original question's visual (or a faithful re-render if question was text-only).
- **Bottom of intervention** ("TRY IT THIS WAY"): a `base10` teaching visual with explicit captions naming the tens place and ones place (e.g., `caption: "4 tens = 40,  5 ones = 5,  total: 45"`).
- Built by a helper `_l41TeachingBase10(t, o)` that returns a `{type:'base10', config:{tens, ones, label:"..."}}` object — wrapped form because intervention objects bypass `_g1VisToV` per the U3 pattern.

## 12. Error tags (8)

| Tag | Meaning | Example wrong answer |
|---|---|---|
| `err_added_digits_only` | Added the digits ignoring place value | `40 + 5 → 9` (4+5), `60 + 8 → 14` (6+8) |
| `err_dropped_zero` | Dropped trailing 0 from the multiple of 10 | `30 + 6 → 9` (treats 30 as 3, then 3+6=9). Note: same numeric outcome as `err_added_digits_only` for some pairs — distinguished semantically. |
| `err_ones_in_tens_place` | Wrote the ones digit in the tens slot | `40 + 5 → 54` |
| `err_reversed_tens_ones` | Reversed the order of digits in the answer | `40 + 5 → 54` (same numerically; tagged when the misconception is about answer-order rather than slot misplacement) |
| `err_missing_tens_value` | For `☐ + d = sum`, answered the digit instead of the tens value | `☐ + 4 = 84 → 8` (should be 80) |
| `err_missing_ones_value` | For `M + ☐ = sum`, answered the multiple of 10 instead of the ones | `50 + ☐ = 57 → 50` (should be 7) |
| `err_off_by_one` | Counted ±1 from correct | `40 + 5 → 44` or `46` |
| `err_place_value_confusion` | Generic catch-all for place-value errors not fitting above | various |

### Tag-per-distractor rule

- Every wrong answer in every question MUST carry an `errorTag` matching one of the 8 above.
- The correct answer carries no `errorTag`.
- A typical question has 3 distractors → 3 distinct error tags (or 2 distinct + 1 repeat with different value).
- `err_dropped_zero` and `err_added_digits_only` may BOTH appear in the same question if two distinct wrong-answer slots represent each conceptual variant.

## 13. Intervention templates

Each tag gets a parameterized helper that returns an intervention object matching the U3 pattern (`{errorTag, title, teachingSteps[], correctAnswerExplanation, teachingVisual}`).

### Helper signatures

```js
_l41IntAddedDigitsOnly(M, d, sum)    // err_added_digits_only / err_dropped_zero
_l41IntDigitsSwapped(M, d, sum)      // err_ones_in_tens_place / err_reversed_tens_ones
_l41IntMissingTensValue(d, sum)      // err_missing_tens_value
_l41IntMissingOnesValue(M, sum)      // err_missing_ones_value
_l41IntOffByOne(M, d, sum)           // err_off_by_one
_l41IntPlaceValueConfusion(M, d, sum)// err_place_value_confusion
_l41TeachingBase10(t, o, label)      // teaching visual builder
```

### Template content

```
─────────────────────────────────────────────────────────────────────
err_added_digits_only / err_dropped_zero
─────────────────────────────────────────────────────────────────────
title: "Tens and ones go in different places"
teachingSteps:
  1. {M} is not {M/10} — it means {M/10} TENS, which is {M}.
  2. {d} means {d} ONES.
  3. Tens go in the tens place, ones go in the ones place.
  4. {M} + {d} = {sum}, not {M/10 + d}.
correctAnswerExplanation: "{M} + {d} = {sum} because {M/10} tens and {d} ones make {sum}."
teachingVisual: base10 with tens={M/10}, ones={d}, captions naming each part

─────────────────────────────────────────────────────────────────────
err_ones_in_tens_place / err_reversed_tens_ones
─────────────────────────────────────────────────────────────────────
title: "Be careful where each digit goes"
teachingSteps:
  1. The TENS digit shows how many groups of ten.
  2. The ONES digit shows how many leftover ones.
  3. For {M} + {d}: tens digit = {M/10}, ones digit = {d}.
  4. The answer is {sum} — not {ones-in-tens variant}.
correctAnswerExplanation: "{sum} has {M/10} in the tens place and {d} in the ones place."
teachingVisual: base10 with tens={M/10}, ones={d}, label "Tens place: {M/10} · Ones place: {d}"

─────────────────────────────────────────────────────────────────────
err_missing_tens_value (for ☐ + d = sum)
─────────────────────────────────────────────────────────────────────
title: "The blank goes in the tens place"
teachingSteps:
  1. The answer is {sum}, which has {sum_tens} tens and {d} ones.
  2. We already have {d} (the ones).
  3. The blank stands in for the TENS — that's {sum_tens} tens.
  4. {sum_tens} tens = {sum_tens * 10}.
  5. {sum_tens * 10} + {d} = {sum}.
correctAnswerExplanation: "The missing number is {sum_tens * 10}, not {sum_tens}, because it stands for the tens."
teachingVisual: base10 with tens={sum_tens}, ones={d}, label "Missing piece = {sum_tens} tens = {sum_tens * 10}"

─────────────────────────────────────────────────────────────────────
err_missing_ones_value (for M + ☐ = sum)
─────────────────────────────────────────────────────────────────────
title: "The blank goes in the ones place"
teachingSteps:
  1. The answer is {sum}.
  2. We already have {M} ({M/10} tens).
  3. The blank stands for the ones — count the ones digit of {sum}.
  4. {sum} has {sum_ones} ones.
  5. {M} + {sum_ones} = {sum}.
correctAnswerExplanation: "The missing number is {sum_ones}, not {M}."
teachingVisual: base10 with tens={M/10}, ones={sum_ones}, label "Missing piece = {sum_ones} ones"

─────────────────────────────────────────────────────────────────────
err_off_by_one
─────────────────────────────────────────────────────────────────────
title: "Count carefully"
teachingSteps:
  1. {M} stays as {M}. Don't change the tens.
  2. Add {d} ones.
  3. {M} + {d} = {sum} — exactly {sum}, not {sum-1} or {sum+1}.
correctAnswerExplanation: "{M} + {d} = {sum}."
teachingVisual: base10 with tens={M/10}, ones={d}

─────────────────────────────────────────────────────────────────────
err_place_value_confusion (catch-all)
─────────────────────────────────────────────────────────────────────
title: "Tens and ones live in different places"
teachingSteps:
  1. The tens digit shows groups of ten.
  2. The ones digit shows the leftovers (1–9).
  3. For {M} + {d}: tens = {M/10}, ones = {d}, total = {sum}.
correctAnswerExplanation: "{M} + {d} = {sum}."
teachingVisual: base10 with tens={M/10}, ones={d}, label "Tens place · Ones place"
```

### Per-question intervention assembly

A question's `intervention` field is built like this (mirrors `_l31Q` at `src/data/g1/u3.js:23-43`):

```js
intervention: Object.assign({
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
}, _l41IntAddedDigitsOnly(M, d, sum))
```

…where the inner intervention helper supplies `errorTag`, `title`, `teachingSteps`, `correctAnswerExplanation`, and `teachingVisual`. The merge yields an object containing every required field per the user's spec.

## 14. Retry behavior

Per question:

```js
intervention: {
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true,
  errorTag: '...',
  title: '...',
  teachingSteps: [...],
  correctAnswerExplanation: '...',
  teachingVisual: { type: 'base10', config: { ... } }
}
```

**Retry strategy** (handled by the existing quiz engine — no changes needed):
- After a wrong answer, the intervention overlay shows.
- User clicks "Try Another."
- Engine pulls a NEW question from L4.1's bank with `skill === 'add_tens_and_ones'` and excluding the just-answered question's id.
- `same_skill_new_numbers` ensures the retry uses a different `(M, d)` pair.

**No change to global retry logic** — same plumbing as Unit 3.

## 15. Risks before coding

| # | Risk | Mitigation |
|---|---|---|
| R1 | base-10 visual overflow on small mobile (e.g., 9 tens + 9 ones) | `drawBase10` already wraps at 5-per-row. Verify worst-case `tens:9, ones:9` renders within 375px viewport before generating any 9× cases. |
| R2 | Distractor collisions (4 choices include duplicate values) | Each builder MUST run `_l41ValidateChoices(choices)` — rejects duplicates, ensures correct value present, ensures all values are integers ≤ 99. |
| R3 | Out-of-scope drift (e.g., a "wrong example" in C7 accidentally shows `27 + 18`) | Hard guardrail: every prompt template runs through `_l41AssertScope(promptText)` which rejects any string matching `/[2-9]\d\s*\+\s*[1-9]\d/` (two-digit + two-digit) or three-digit numbers. |
| R4 | Repetition: 81 unique `(M, d)` pairs across 170 questions ⇒ ~2× reuse needed | Track usage in a `seen` Set keyed by `(category, M, d, variant)`. Reuse across categories OK; reuse within same category at same difficulty NOT OK. |
| R5 | Hint length creep | Cap each hint at ≤ 100 characters. Add a `_l41ValidateHint(text)` assertion. |
| R6 | Too much copy-paste in intervention text → drift between similar interventions | All intervention text comes from helper functions — no inline strings inside builder loops. |
| R7 | Commutative bias (too many `M + d` vs `d + M`) | Track form ratios; aim for ~70/30 split (M+d dominates because it's the canonical TEKS form). |
| R8 | Spec validation — `G1_U4_SPEC` array length should still equal `quizBank` length post-merge | Add an assert in the test stub to compare expected count (170) to actual array length. |
| R9 | Performance — generating 170 questions at parse time should not slow the page load | base10 visual is lightweight; question objects are pure data; no measurable risk vs. U3's 850 questions. |
| R10 | The error-repair questions (C7) could confuse fluent kids who pick the "wrong" answer thinking it's a trick. | Phrase prompts unambiguously: "Which is the CORRECT answer?" with the wrong work clearly bracketed. Keep all 4 choices integers. |

## 16. Verification checklist

After implementation, before declaring L4.1 complete, ALL of these must pass:

### Static checks (run against the source file)

- [ ] L4.1 lesson in `G1_U4_SPEC.lessons[0]`
- [ ] `lessonId === 'g1-u4-l1'`
- [ ] `skill === 'add_tens_and_ones'`
- [ ] `teks` includes `'1.3A'`
- [ ] `keyIdeas.length === 6`
- [ ] `workedExamples.length === 6`
- [ ] `quizBank.length === 170`
- [ ] Easy count (`d === 'e'` after merge, `difficulty === 'easy'` in source) === 55
- [ ] Medium count === 70
- [ ] Hard count === 45
- [ ] Every question has unique `id`
- [ ] Every question has all required fields: `id`, `lessonId`, `teks`, `skill`, `subSkill`, `difficulty`, `interactionType`, `prompt`, `answer`, `choices`, `hint`, `intervention`
- [ ] Every `intervention` has: `followUpRule === 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion === true`, `errorTag`, `title`, `teachingSteps[]` (≥3 entries), `correctAnswerExplanation`, `teachingVisual` (with `type === 'base10'`)
- [ ] Every distractor (non-correct choice) has an `errorTag` from the 8-tag list
- [ ] No prompt text matches `/[2-9]\d\s*[+]\s*[1-9]\d/` (no two-digit + two-digit)
- [ ] No prompt text contains a three-digit number `/\b\d{3}\b/`
- [ ] No prompt contains `−` or `-` followed by a digit (no subtraction)
- [ ] No `(category, M, d, variant)` repeats within a difficulty tier

### Runtime checks (build + tests)

- [ ] `npm run build` succeeds; `📋 Built: data/g1/u4.js` appears
- [ ] `dist/data/g1/u4.js` contains `_mergeG1UnitData(3, G1_U4_SPEC)` at end
- [ ] Jest: 130/130 pass
- [ ] Node-test: 158/158 pass
- [ ] No console errors / warnings on app load with `mmr_grade=1`

### Browser verification (preview server)

- [ ] Grade 1 home still shows "8 Units · 26 Lessons" (lesson count is shell-driven and was already 26 after Phase 1 — no change expected; L4.1 content fills the quizBank for an already-counted lesson)
- [ ] Click into Unit 4: lesson card 1 shows "1 🔢 Add Tens and Ones · Add a multiple of 10 and a one-digit number"
- [ ] Click on L4.1: quiz starts with question 1 of 170 (or whatever the per-attempt sample size is)
- [ ] Sample 5 random questions render correctly: prompt visible, 4 choices visible, hint button works
- [ ] At least one C3 (base-10 model) question shows a base-10 visual that matches the addition
- [ ] Submit a known-wrong answer on any question: intervention overlay opens, "THE QUESTION" panel shows the question's visual (or its caption), "TRY IT THIS WAY" panel shows a base-10 teaching visual with tens/ones labeled
- [ ] Click "Try Another": new question loads, different `(M, d)` pair, same skill
- [ ] Submit the correct answer on a question: green flash, advance
- [ ] Complete the lesson quiz at 100% (use the answer key); confirm L4.2 unlocks via standard 80%+ rule

### Coverage / quality (sample-based)

- [ ] Pick 10 random questions; manually verify each `intervention.teach.text` is grammatical, age-appropriate, and matches the question's actual numbers.
- [ ] Pick 5 questions with `errorTag: 'err_dropped_zero'` distractors; verify the distractor value matches the dropped-zero misconception.
- [ ] Verify the `_l41TeachingBase10` helper produces visuals that render correctly at viewport widths 320px, 375px, 768px.

---

## Implementation outline (after approval)

When approved, the implementation plan will follow this task structure (separate plan document):

1. **Helpers and templates** — write `_l41Q`, `_l41Examples`, `_l41TeachingBase10`, all 6 intervention helpers, and the 8 builder helpers (one per category).
2. **Easy tier (55 questions)** — assemble C1×25 + C2×10 + C3×12 + C4×8.
3. **Medium tier (70 questions)** — assemble C1×20 + C3×15 + C4×15 + C5×10 + C8×10.
4. **Hard tier (45 questions)** — assemble C5×10 + C6×12 + C7×13 + C8×10.
5. **Diagnostics block** — `commonDistractors`, `errorTags`, `interventionRules` (8 rules, one per tag).
6. **Validation pass** — run static checks on the assembled bank inside the source file (assertions in dev mode).
7. **Build + tests** — verify no regressions.
8. **Browser smoke test** — preview verification against the checklist above.
9. **Commit** — single commit: `feat(g1u4): Lesson 4.1 Add Tens and Ones — 170 questions, full intervention coverage`.

---

## Open questions for you

1. **Approve the 8-category allocation** in §10? (55E / 70M / 45H exactly.)
2. **Approve the 8 error tags** in §12? (Both `err_added_digits_only` and `err_dropped_zero` — they overlap semantically; OK to keep both for analytics granularity, or collapse?)
3. **Approve the visual coverage strategy** in §11? (~40% of questions get a question-level base-10 visual; 100% of interventions get a teaching base-10 visual.)
4. **C7 error-repair format** — confirm "What is the correct answer?" multiple-choice (with the kid's wrong reasoning shown in the prompt) versus a metacognitive "What did the friend do wrong?" format. I've assumed the former.
5. **Word-problem micro-stories in L4.1** — OK to use occasional one-sentence contexts (e.g., "Maya has 40 marbles and gets 5 more. How many?") to add variety, or strict numerical-only prompts only? L4.5 owns true word problems, but a sprinkle of contextualization in L4.1 can help engagement. I've assumed strict numerical for L4.1.

---

**Status:** Plan complete. **Awaiting your approval before any implementation begins.**
