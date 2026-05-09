# Grade 1 Unit 4 · Lesson 4.3 — Add Multiples of 10 · Design Plan

> **Status:** PLANNING ONLY — no code yet. Awaiting approval before implementation.
> **Scope of this document:** content/design plan + TDD task breakdown.

---

## 1. Lesson title

**Add Multiples of 10**

---

## 2. TEKS alignment

- **Primary:** TEKS 1.3A — Use concrete and pictorial models to determine the sum of a multiple of 10 and a one-digit number in problems up to 99.

`teks: ['1.3A']` (already set in scaffold).

> Note on scope extension: TEKS 1.3A does not explicitly cap multiples-of-10 sums at 90. Including 50+50=100 as a C9 boundary category is pedagogically appropriate and consistent with how L4.2 treated the 90→100 crossing. Sums of 110 or 120 are excluded — those require a hundreds context not covered until Grade 2.

---

## 3. Skill name

`skill: 'add_multiples_of_ten'` (already set in scaffold)

Sub-skills used on individual questions:

| subSkill | Category |
|---|---|
| `basic_tens_addition` | C1 |
| `commutative_tens` | C2 |
| `model_to_equation` | C3 |
| `model_to_answer` | C4 |
| `missing_addend` | C5 |
| `missing_first_addend` | C6 |
| `tens_language` | C7 |
| `error_repair` | C8 |
| `boundary_sum_100` | C9 |

---

## 4. Exact scope

A single skill: **adding two multiples of 10**, using place-value reasoning (both addends are tens numbers; their sum is the total count of tens).

Allowed problem shapes:
- `A + B = ?` where A, B ∈ {10, 20, 30, 40, 50, 60, 70, 80, 90} and sum ≤ 90 (main scope)
- `50 + 50 = ?`, `40 + 60 = ?`, etc. — sums = 100 (C9 boundary only)
- `A + __ = sum` — missing second addend
- `__ + B = sum` — missing first addend
- `X tens + Y tens = __ tens` — tens-language form
- `A student says A + B = wrong. What is the correct answer?` — error repair
- Visual: base-10 model showing A's rods, or the combined sum's rods

Where:
- Both addends are multiples of 10 (never single-digit, never non-multiple-of-10)
- All sums ≤ 100
- No ones component in any question — ones are always 0

---

## 5. What stays out of scope

Hard guardrails — none of these may appear in any L4.3 question:

- ❌ Ones digits — no `30 + 4`, no `40 + 5` (that is L4.1)
- ❌ Two-digit + two-digit like `24 + 35` (Grade 2)
- ❌ Adding or subtracting a non-multiple of 10 (no `N + 7`, no `N − 3`)
- ❌ 10 more / 10 less as the **main** skill (that is L4.2; L4.3 uses arbitrary multiples)
- ❌ Regrouping, carrying, borrowing
- ❌ Vertical algorithm / column layout
- ❌ Subtraction as the primary operation (missing-addend questions are still addition)
- ❌ Word problems (L4.5)
- ❌ Sums above 100
- ❌ Three-digit numbers in prompts (100 is allowed as a boundary result only)
- ❌ Any content reused from `src/data/u4.js` (Grade 4 file)

---

## 6. How this differs from L4.1 and L4.2

| Dimension | L4.1 | L4.2 | L4.3 |
|---|---|---|---|
| Addend A | Multiple of 10 (10–90) | Any 2-digit N | Multiple of 10 (10–90) |
| Addend B | One-digit (1–9) | Always 10 | Multiple of 10 (10–90) |
| Ones in result | Yes (the B value) | Yes (unchanged) | **No — result always ends in 0** |
| Main error | Digit-only adding (40+5→9) | Wrong direction / ones changed | Digit-only adding (30+40→7) |
| Key insight | Tens and ones live in different places | Only tens digit changes | Both numbers ARE tens — add the tens |
| Visual shape | X rods + Y cubes | X rods + Y cubes (Y unchanged) | X rods (only rods, no cubes) |

**L4.3 is not a subset of L4.1** — L4.1 always has a non-zero ones digit. L4.3 is purer tens-only arithmetic. A student can pass L4.1 using digit-pattern matching without understanding tens; L4.3 forces them to reason about groups of tens explicitly.

**L4.3 is not a generalization of L4.2** — L4.2 always adds exactly 10. L4.3 allows any pair of multiples. "Add 10 to any number" ≠ "Add two arbitrary tens numbers."

---

## 7. Key ideas (6)

1. **"30 means 3 tens — not 3. 40 means 4 tens — not 4."**
2. **"To add 30 + 40, add the tens: 3 tens + 4 tens = 7 tens."**
3. **"7 tens = 70. Always keep the zero — it shows this is a tens number."**
4. **"You can add in any order: 30 + 40 = 40 + 30 = 70."**
5. **"A base-10 model for 30 + 40 shows 7 tens rods — count them to find 70."**
6. **"50 + 50 = 100 because 5 tens + 5 tens = 10 tens, and 10 tens make 1 hundred."**

---

## 8. Worked examples (6)

| id | prompt | visual | key idea |
|---|---|---|---|
| g1-u4-l3-ex-1 | What is 30 + 40? | base10 {t:7, o:0} | KI 1–3 |
| g1-u4-l3-ex-2 | What is 40 + 30? | base10 {t:7, o:0} | KI 4 |
| g1-u4-l3-ex-3 | Model shows 5 tens rods. Add 2 more. How many? | base10 {t:5, o:0} | KI 5 |
| g1-u4-l3-ex-4 | 30 + __ = 80. What is the missing number? | null | KI 2–3 |
| g1-u4-l3-ex-5 | 4 tens + 3 tens = __ tens. What number is that? | null | KI 2–3 |
| g1-u4-l3-ex-6 | A student says 20 + 50 = 7. What is the mistake? | null | KI 1–3 |

**Example 1 steps (30 + 40):**
1. "30 means 3 tens. 40 means 4 tens."
2. "Count all the tens together: 3 tens + 4 tens = 7 tens."
3. "7 tens = 70. Don't drop the zero!"
4. "30 + 40 = 70."

**Example 2 steps (40 + 30 — commutative):**
1. "40 + 30 has the same numbers as 30 + 40, just in a different order."
2. "3 tens + 4 tens = 7 tens, no matter which comes first."
3. "40 + 30 = 70. Order doesn't change the answer."

**Example 3 steps (model → answer):**
1. "Count the first group: 5 tens rods = 50."
2. "Add 2 more tens rods: 5 + 2 = 7 tens rods."
3. "7 tens rods = 70."
4. "50 + 20 = 70."

**Example 4 steps (missing addend 30 + __ = 80):**
1. "80 has 8 tens."
2. "We already have 30 — that is 3 tens."
3. "How many more tens do we need? 8 − 3 = 5 tens."
4. "5 tens = 50. The missing number is 50."

**Example 5 steps (tens-language):**
1. "4 tens is 40. 3 tens is 30."
2. "4 tens + 3 tens = 7 tens."
3. "7 tens = 70."

**Example 6 steps (error repair):**
1. "The student said 20 + 50 = 7."
2. "They did 2 + 5 = 7 — they forgot the zeros!"
3. "20 means 2 tens. 50 means 5 tens."
4. "2 tens + 5 tens = 7 tens = 70."
5. "The correct answer is 70, not 7."

---

## 9. Question categories

Nine categories across three difficulty bands.

### Easy (C1–C4)

**C1 — Basic equation A + B = ? (text only)**
- Prompt: `What is A + B?`
- Visual: none (text only) — ~10 of 25 have a visual showing A's rods
- Choices: correct (sum), err_added_digits_only (a+b as single digits), err_off_by_ten (sum±10), err_place_value_confusion (alternate wrong tens value)
- 25 questions. Both A, B ∈ {10, 20, 30, 40, 50}, sum ≤ 80

**C2 — Commutative recognition**
- Prompt: `Which equation gives the same answer as A + B?` or `A + B = B + A. What is the answer?`
- Visual: none
- Choices: correct (B + A or sum), err_commutative_confusion (A + wrong / B + wrong), err_added_digits_only (a + b), err_place_value_confusion
- 5 easy questions. Small addend pairs: (10,20), (20,30), (10,40), (30,20), (20,40)

**C3 — Base-10 model → equation**
- Prompt: `The model shows A tens rods. A student adds B more tens rods. Which equation does this show?`
- Visual: `_l43VisT(A/10)` — shows A's rods only
- Choices: "A + B = sum" (correct), "a + b = a+b" (err_added_digits_only), "A + b" (err_missing_tens_value — used B's digit instead of B), "A + B = wrong_sum" (err_off_by_ten)
- 10 questions. Both A, B ∈ {10, 20, 30, 40}, sum ≤ 70

**C4 — Base-10 model → answer**
- Prompt: `This model shows T tens rods. What number is this?`
- Visual: `_l43VisT(T)` — shows the combined sum's rods
- Choices: T×10 (correct), T (err_added_digits_only — "I see T rods so the answer is T"), (T-1)×10 (err_off_by_ten), (T+1)×10 (err_off_by_ten)
- 15 easy questions. T ∈ {2..9} (representing 20–90)

### Medium (C1, C2, C3, C5, C6, C7)

**C1 medium — Larger addends, sums 60–90**
- Same format as C1 easy; at least one addend ≥ 50
- 15 questions

**C2 medium — Commutative recognition (larger pairs)**
- 5 questions. Pairs where at least one addend ≥ 50: (30,60), (50,20), (40,50), (20,70), (60,20)

**C3 medium — Harder model → equation**
- 5 questions. Larger rods: A ∈ {30, 40, 50, 60}, B ∈ {20, 30, 40, 50}

**C5 — Missing addend: A + __ = sum**
- Prompt: `A + ___ = sum. What is the missing number?`
- Visual: none (or `_l43VisT(sum/10)` showing sum's rods on ~5 questions)
- Choices: correct (sum−A), err_dropped_zero (digit of missing, e.g., 5 instead of 50), err_off_by_ten (correct±10), err_missing_tens_value (answers with A instead of missing)
- 15 medium questions

**C6 — Missing first addend: __ + B = sum**
- Prompt: `___ + B = sum. What is the missing number?`
- Same choice structure as C5
- 10 medium questions

**C7 — Tens-language**
- Prompt: `X tens + Y tens = ___ tens. What number is that?` or `X tens + Y tens = ? (choose the number)`
- Visual: none
- Choices: correct (sum), X×10 or Y×10 (err_missing_tens_value — stopped at one addend), x+y as digit (err_added_digits_only — counted tens but forgot zero), correct±10 (err_off_by_ten)
- 10 medium questions

### Hard (C2, C5, C6, C7, C8, C9)

**C2 hard — Commutative recognition (complex)**
- 5 questions. Pairs where both ≥ 40: (40,50), (50,40), (30,60), (40,40), (60,30)

**C5 hard — Missing addend (larger sums)**
- 10 questions. sum ∈ {60..90}, harder pairs

**C6 hard — Missing first addend (larger sums)**
- 5 questions

**C7 hard — Tens-language (harder)**
- 5 questions. Sums 70–90

**C8 — Error repair**
- Prompt: `A student says A + B = wrong. What is the correct answer?`
- `wrong` is always a real error-tag distractor (most commonly err_added_digits_only: the kid wrote a+b instead of sum)
- Visual: none
- Choices: correct (sum), the_student_wrong_answer (err_added_digits_only), sum−10 (err_off_by_ten), sum+10 or other wrong (err_place_value_confusion)
- 10 hard questions

**C9 — Boundary: sum = 100**
- Prompt: `What is A + B?` where A + B = 100 (50+50, 40+60, 30+70, 20+80, 10+90, and commutative forms)
- Visual: `_l43VisT(10)` = `{hundreds:1, tens:0, ones:0}` for the sum; or `_l43VisT(A/10)` for the addend
- Choices: 100 (correct), 10 (err_boundary_100_confusion — confused the 1 hundred as 1 ten), 90 or 110 (err_off_by_ten), a+b (err_added_digits_only)
- 10 hard questions

---

## 10. Target question count

**170 total**

---

## 11. Easy / medium / hard distribution

| Category | Description | Easy | Medium | Hard | Total |
|---|---|---|---|---|---|
| C1 | Direct equation A + B = ? | 25 | 15 | 0 | 40 |
| C2 | Commutative recognition | 5 | 5 | 5 | 15 |
| C3 | Model → equation | 10 | 5 | 0 | 15 |
| C4 | Model → answer | 15 | 10 | 0 | 25 |
| C5 | Missing addend A + __ = sum | 0 | 15 | 10 | 25 |
| C6 | Missing first addend __ + B = sum | 0 | 10 | 5 | 15 |
| C7 | Tens-language | 0 | 10 | 5 | 15 |
| C8 | Error repair | 0 | 0 | 10 | 10 |
| C9 | Boundary sum = 100 | 0 | 0 | 10 | 10 |
| **Total** | | **55** | **70** | **45** | **170** |

Question ID ranges:

| Range | Category | Band |
|---|---|---|
| q-001 – q-025 | C1 | easy |
| q-026 – q-040 | C1 | medium |
| q-041 – q-045 | C2 | easy |
| q-046 – q-050 | C2 | medium |
| q-051 – q-055 | C2 | hard |
| q-056 – q-065 | C3 | easy |
| q-066 – q-070 | C3 | medium |
| q-071 – q-085 | C4 | easy |
| q-086 – q-095 | C4 | medium |
| q-096 – q-110 | C5 | medium |
| q-111 – q-120 | C5 | hard |
| q-121 – q-130 | C6 | medium |
| q-131 – q-135 | C6 | hard |
| q-136 – q-145 | C7 | medium |
| q-146 – q-150 | C7 | hard |
| q-151 – q-160 | C8 | hard |
| q-161 – q-170 | C9 | hard |

---

## 12. Visual strategy

### Question-level visuals

| Category | Visual | Config |
|---|---|---|
| C1 (~40% of questions) | `base10` | `_l43VisT(A/10)` — first addend's rods |
| C2 | none | — |
| C3 (all) | `base10` | `_l43VisT(A/10)` — first addend's rods |
| C4 (all) | `base10` | `_l43VisT(sum/10)` — combined rods |
| C5 (~30% of questions) | `base10` | `_l43VisT(sum/10)` — total rods as a scaffold |
| C6 (~30% of questions) | `base10` | `_l43VisT(sum/10)` |
| C7 | none | text-only tens language |
| C8 | none | error-repair context |
| C9 (all) | `base10` | `_l43VisT(A/10)` for addend OR `_l43VisT(10)` for the 100-result |

**`_l43VisT(t)` — question-time visual for t tens rods:**
```js
function _l43VisT(t) {
  if (t >= 10) {
    return { type: 'base10', hundreds: Math.floor(t / 10), tens: t % 10, ones: 0 };
  }
  return { type: 'base10', tens: t, ones: 0 };
}
```
- `_l43VisT(3)` → `{type:'base10', tens:3, ones:0}` (for 30)
- `_l43VisT(10)` → `{type:'base10', hundreds:1, tens:0, ones:0}` (for 100)

This form is run through the `_g1VisToV` adapter (same as L4.1 and L4.2 question visuals).

### Intervention (teaching) visuals

Always use `base10` with the `config` wrapper form — same pattern as L4.1's `_l41TeachingBase10` and L4.2's `_l42TV`.

**`_l43TV(t, label)` — teaching visual for the sum's rods:**
```js
function _l43TV(t, label) {
  var h = t >= 10 ? Math.floor(t / 10) : 0;
  return {
    type: 'base10',
    config: { hundreds: h, tens: t % 10, ones: 0, label: label || null }
  };
}
```

- Top panel ("THE QUESTION"): original question's visual (one addend's rods, if C3/C4)
- Bottom panel ("TRY IT THIS WAY"): teaching visual showing combined rods with an explanatory label

For C1 (no question visual): the teaching visual is the only visual — it shows the combined tens with a label like `"3 tens + 4 tens = 7 tens = 70"`.

**100-result boundary:** `_l43TV(10, '5 tens + 5 tens = 10 tens = 100')` → `{type:'base10', config:{hundreds:1, tens:0, ones:0, label:'...'}}`

**Do not introduce new visual types.** No numberLine, no new renderer changes.

---

## 13. Error tags (7)

| Tag | Meaning | Example for 30+40 |
|---|---|---|
| `err_added_digits_only` | Treated tens as singles — dropped both zeros | 30+40=**7** (did 3+4) |
| `err_dropped_zero` | Dropped the zero from the missing value (C5/C6 only) | 30+__=70, chose **4** not 40 |
| `err_off_by_ten` | Answer is ±10 from correct | 30+40=**60** or **80** |
| `err_missing_tens_value` | Gave the digit count instead of the tens value | __ +40=70, chose **3** not 30 |
| `err_place_value_confusion` | Generic catch-all — wrong tens range, digits scrambled | 30+40=**34** |
| `err_boundary_100_confusion` | Error at the 90→100 crossing | 50+50=**10** (thought 1 hundred = 1 ten) |
| `err_commutative_confusion` | Thinks order matters; chose a wrong equation as the "same as" | Says 30+50 ≠ 50+30 |

All 7 tags must appear in `diagnostics.errorTags[]` and in `diagnostics.interventionRules[]`.

Primary tag per category:
- C1: `err_added_digits_only` (main distractor is always the digit-sum)
- C2: `err_commutative_confusion`
- C3: `err_added_digits_only`, `err_missing_tens_value`
- C4: `err_added_digits_only` (T rods → answered T instead of T×10)
- C5/C6: `err_dropped_zero`, `err_missing_tens_value`
- C7: `err_added_digits_only` (X+Y tens → X+Y not (X+Y)×10)
- C8: `err_added_digits_only` (this IS the student's error being repaired)
- C9: `err_boundary_100_confusion`

---

## 14. Intervention templates (7 functions)

One parameterized factory per error tag. Each returns the intervention object merged into the question by `_l43Q`.

### `_l43IntAddedDigitsOnly(A, B, sum)`
Called when student answered `a + b` (digit sum) instead of `A + B`.
```js
function _l43IntAddedDigitsOnly(A, B, sum) {
  var a = A / 10, b = B / 10, digitSum = a + b;
  return {
    errorTag: 'err_added_digits_only',
    title: "Don't forget the zeros — 30 is not 3",
    teachingSteps: [
      A + ' is not ' + a + '. It means ' + a + ' tens, which is ' + A + '.',
      B + ' is not ' + b + '. It means ' + b + ' tens, which is ' + B + '.',
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens.',
      (a + b) + ' tens = ' + sum + ', not ' + digitSum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum + ' because ' +
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
    teachingVisual: _l43TV(a + b,
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}
```

### `_l43IntDroppedZero(missing, other, sum)`
Called when student dropped the zero from the missing addend (C5/C6).
`missing` is the correct missing value; `other` is the known addend.
```js
function _l43IntDroppedZero(missing, other, sum) {
  var mTens = missing / 10;
  return {
    errorTag: 'err_dropped_zero',
    title: "The missing number is a tens number — keep the zero",
    teachingSteps: [
      'The blank stands for a TENS number, not a single digit.',
      sum + ' has ' + (sum / 10) + ' tens. We already have ' + other + ' (' + (other / 10) + ' tens).',
      'Missing tens: ' + (sum / 10) + ' − ' + (other / 10) + ' = ' + mTens + ' tens.',
      mTens + ' tens = ' + missing + ', not ' + mTens + '.',
      other + ' + ' + missing + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + missing +
      ' (not ' + mTens + ') because ' + mTens + ' tens = ' + missing + '.',
    teachingVisual: _l43TV(sum / 10, mTens + ' tens = ' + missing + ' (not ' + mTens + ')')
  };
}
```

### `_l43IntOffByTen(A, B, sum)`
Called when student is ±10 from correct (counted wrong number of tens).
```js
function _l43IntOffByTen(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_off_by_ten',
    title: 'Count the tens carefully',
    teachingSteps: [
      A + ' has ' + a + ' tens. ' + B + ' has ' + b + ' tens.',
      'Count all tens together: ' + a + ' + ' + b + ' = ' + (a + b) + ' tens.',
      (a + b) + ' tens = ' + sum + '.',
      'Not ' + (sum - 10) + ' (' + (a + b - 1) + ' tens) and not ' + (sum + 10) + ' (' + (a + b + 1) + ' tens).'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum +
      ' because ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
    teachingVisual: _l43TV(a + b, a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}
```

### `_l43IntMissingTensValue(missing, other, sum)`
Called when student gave the tens-count digit instead of the value (e.g., 3 instead of 30).
```js
function _l43IntMissingTensValue(missing, other, sum) {
  var mTens = missing / 10, oTens = other / 10, sTens = sum / 10;
  return {
    errorTag: 'err_missing_tens_value',
    title: 'The blank is a tens number, not a count of rods',
    teachingSteps: [
      sum + ' = ' + sTens + ' tens. We know ' + other + ' = ' + oTens + ' tens.',
      'Missing tens: ' + sTens + ' − ' + oTens + ' = ' + mTens + ' tens.',
      mTens + ' tens = ' + missing + '.',
      'Write ' + missing + ' in the blank — not just the digit ' + mTens + '.',
      other + ' + ' + missing + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + missing +
      ' (' + mTens + ' tens), not the digit ' + mTens + '.',
    teachingVisual: _l43TV(sTens, 'Missing piece = ' + mTens + ' tens = ' + missing)
  };
}
```

### `_l43IntPlaceValueConfusion(A, B, sum)`
Generic catch-all.
```js
function _l43IntPlaceValueConfusion(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Each number tells you how many tens',
    teachingSteps: [
      A + ' means ' + a + ' tens rods.',
      B + ' means ' + b + ' tens rods.',
      'Count all rods together: ' + a + ' + ' + b + ' = ' + (a + b) + ' rods.',
      (a + b) + ' rods = ' + sum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum +
      ' (' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens).',
    teachingVisual: _l43TV(a + b, a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}
```

### `_l43IntBoundary100(A, B)`
Called for sums that equal 100.
```js
function _l43IntBoundary100(A, B) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: '10 tens = 100 — crossing into the hundreds is okay',
    teachingSteps: [
      A + ' = ' + a + ' tens. ' + B + ' = ' + b + ' tens.',
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens.',
      (a + b) + ' tens = 100 — that is 1 hundred, 0 tens, 0 ones.',
      '100 is not 10. It is a whole new group: one hundred.'
    ],
    correctAnswerExplanation: A + ' + ' + B +
      ' = 100 because ' + a + ' tens + ' + b + ' tens = 10 tens = 1 hundred.',
    teachingVisual: _l43TV(10, a + ' tens + ' + b + ' tens = 10 tens = 100')
  };
}
```

### `_l43IntCommutativeConfusion(A, B, sum)`
Called when student picked a wrong equation as the commutative pair.
```js
function _l43IntCommutativeConfusion(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_commutative_confusion',
    title: 'You can add in either order — the answer stays the same',
    teachingSteps: [
      A + ' + ' + B + ': ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
      B + ' + ' + A + ': ' + b + ' tens + ' + a + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
      'Addition does not care which number comes first.',
      A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' and ' + B + ' + ' + A +
      ' both equal ' + sum + '. Order does not change the sum.',
    teachingVisual: _l43TV(a + b, A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum)
  };
}
```

---

## 15. Retry behavior

Every question:
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

`followUpRule: 'same_skill_new_numbers'` tells the engine to pull another `add_multiples_of_ten` question with different A and B on retry.

---

## 16. Risks before coding

1. **`_l43VisT(10)` for 100:** The base-10 renderer has only been tested with `tens` up to 9 in L4.1. Passing `{type:'base10', hundreds:1, tens:0, ones:0}` must render as a hundreds flat, not as 10 rods. L4.2 already set this precedent for intervention visuals — confirm it works for question-level visuals too before coding C9.

2. **Ones = 0 throughout:** Every question in L4.3 has `ones: 0`. Verify the renderer shows no phantom cubes or empty rows for `{tens: 5, ones: 0}`. This was confirmed clean in L4.2 — but double-check for the L4.3 question-visual adapter path specifically.

3. **C3 visual framing:** Showing only A's rods while the prompt mentions B is a partial visual. If kids see 3 rods and think "that IS the answer," they'll get C3 questions wrong. The prompt wording must make clear that the model shows ONE addend, not the result. Phrase carefully: "This model shows 30. A student adds 40 more. Which equation does this show?"

4. **C4 distractor collision:** For `T = 5` (showing 5 rods, answer 50): the digit distractor is 5, and the off-by-ten distractors are 40 and 60. If T = 1 (10 rods = 100 — only in C9), distractor must avoid negative numbers. Guard: never produce a distractor ≤ 0.

5. **Missing-addend direction (C5 vs C6):** C5 is `A + __ = sum` (missing second addend). C6 is `__ + B = sum` (missing first addend). These are mathematically identical but pedagogically distinct — the position of the blank matters for early readers. Keep them as separate categories; do not merge.

6. **C2 commutative choices:** For "Which equation gives the same answer as 30 + 50?", the correct answer is "50 + 30". Do NOT include "30 + 50" itself as a distractor — that is the prompt equation, which `doNotRepeatOriginalQuestion: true` already blocks for retry but which would be a confusing answer choice here.

7. **err_added_digits_only vs err_dropped_zero:** These tag distinct errors. `err_added_digits_only` applies when the student computed the sum as if both numbers were single digits (30+40→7). `err_dropped_zero` applies only in C5/C6 when the student correctly found the digit count of the missing value but dropped the zero (found "4" instead of "40"). Do not mix them.

8. **ID uniqueness:** L4.1 uses `g1-u4-l1-q-001` through `g1-u4-l1-q-170`. L4.2 uses `g1-u4-l2-q-001` through `g1-u4-l2-q-165`. L4.3 must use `g1-u4-l3-q-001` through `g1-u4-l3-q-170`. No collision risk given the `l3` prefix — but verify in tests.

9. **U4 pool size after L4.3:** L4.1 (170) + L4.2 (165) + L4.3 (170) = 505. The unit test still targets 25 questions and `sourceRule: 'all_lesson_quizbanks'`. Confirm the unit test still samples correctly and counts shift gracefully.

---

## 17. Verification checklist

### Question counts
- [ ] `quizBank.filter(q => q.difficulty === 'easy').length === 55`
- [ ] `quizBank.filter(q => q.difficulty === 'medium').length === 70`
- [ ] `quizBank.filter(q => q.difficulty === 'hard').length === 45`
- [ ] `quizBank.length === 170`

### Scope guardrails
- [ ] No question has a ones digit in either addend (all multiples of 10)
- [ ] No sum > 100
- [ ] No two-digit + two-digit non-tens problem
- [ ] No regrouping / carrying
- [ ] No word problems
- [ ] No subtraction as the primary operation

### Schema completeness
- [ ] Every question has `id`, `teks`, `lessonId`, `skill`, `subSkill`, `keyIdea`, `difficulty`, `interactionType`, `prompt`, `answer`, `choices`, `hint`, `intervention`
- [ ] Every `intervention` has `followUpRule`, `doNotRepeatOriginalQuestion`, `errorTag`, `title`, `teachingSteps`, `correctAnswerExplanation`, `teachingVisual`
- [ ] All 7 error tags appear at least once in `quizBank`
- [ ] All 7 error tags appear in `diagnostics.errorTags[]`
- [ ] All 7 intervention rules appear in `diagnostics.interventionRules[]`

### Visuals
- [ ] No question uses a visual type other than `base10`
- [ ] All teaching visuals use `{type:'base10', config:{hundreds?, tens, ones, label}}`
- [ ] `{type:'base10', hundreds:1, tens:0, ones:0}` renders correctly (100 boundary)
- [ ] `{type:'base10', tens:T, ones:0}` renders cleanly for all T ∈ {2..9} (no phantom cubes)
- [ ] C3 question prompt wording clearly establishes that the model shows ONE addend

### Build + tests
- [ ] `node build.js` — no errors, `dist/data/g1/u4.js` emitted
- [ ] `npm test` — all jest tests pass (130+)
- [ ] `node --test tests/g1-unit-quiz.test.js` — passes
- [ ] L4.1 quizBank untouched (still 170)
- [ ] L4.2 quizBank untouched (still 165)
- [ ] U4 pool = 505 (170 + 165 + 170)

### Browser regression
- [ ] L4.3 lesson page renders 6 key ideas + 6 worked examples
- [ ] L4.3 quiz starts with correct question mix (easy first)
- [ ] Wrong answer triggers simple feedback
- [ ] Second wrong answer triggers intervention overlay with all 5 parts: title, teachingSteps, correctAnswerExplanation, teachingVisual, "Try a new one" button
- [ ] "Try a new one" pulls a question with `skill: 'add_multiples_of_ten'` and different A/B values
- [ ] C9 boundary question (50+50=100) renders correctly with hundreds flat in teaching visual
- [ ] U1, U2, U3, and existing U4 lessons (L4.1, L4.2) still load correctly
- [ ] No new console errors

---

## Implementation file

**Single file modified:** `src/data/g1/u4.js`

Changes:
- Add helper functions `_l43Q`, `_l43VisT`, `_l43TV`, `_l43C`
- Add 7 intervention factory functions `_l43Int*`
- Add `_l43Examples` array (6 worked examples)
- Add `_l43QuizBank` array (170 questions across 9 categories)
- Replace `lessons[2]` scaffold fields: `keyIdeas`, `workedExamples`, `quizBank`, `diagnostics`

No other files touched.

---

## TDD Task Breakdown

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate `src/data/g1/u4.js` Lesson 4.3 with 170 questions teaching tens + tens addition using groups-of-ten reasoning.

**Architecture:** All changes in `src/data/g1/u4.js`. L4.3 block appended after the L4.2 block, before `export const G1_U4_SPEC`. No new files.

**Tech Stack:** Vanilla JS data, existing question-engine schema, base10 renderer only.

---

### Task 1 — Helper functions

**Files:**
- Modify: `src/data/g1/u4.js` (append after L4.2 block, before `export const G1_U4_SPEC`)

- [ ] **Step 1: Verify build is clean before starting**

```
node build.js
```
Expected: exits 0. If it fails, stop and fix before proceeding.

- [ ] **Step 2: Add the L4.3 helper functions block**

Add the following after the last L4.2 line and before `export const G1_U4_SPEC`:

```js
// ════════════════════════════════════════════════════════════════════════════
//  Lesson 4.3 — Add Multiples of 10 — helpers
//  Skill: add_multiples_of_ten · TEKS 1.3A
//  Target: 170 questions (55 easy / 70 medium / 45 hard)
//
//  C1  Direct equation A + B = ?           25E + 15M        = 40   q001–q040
//  C2  Commutative recognition              5E +  5M +  5H  = 15   q041–q055
//  C3  Model → equation                    10E +  5M        = 15   q056–q070
//  C4  Model → answer                      15E + 10M        = 25   q071–q095
//  C5  Missing addend A + __ = sum               15M + 10H  = 25   q096–q120
//  C6  Missing first addend __ + B = sum         10M +  5H  = 15   q121–q135
//  C7  Tens-language                             10M +  5H  = 15   q136–q150
//  C8  Error repair                                    10H  = 10   q151–q160
//  C9  Boundary: sum = 100                             10H  = 10   q161–q170
//  ────────────────────────────────────────────────────────────────
//  TOTAL                                   55E + 70M + 45H  = 170
//
//  Error tags:
//    err_added_digits_only    — 30+40=7 (did 3+4, dropped zeros)
//    err_dropped_zero         — missing addend: chose 4 not 40
//    err_off_by_ten           — answer is ±10 from correct
//    err_missing_tens_value   — gave digit count not tens value
//    err_place_value_confusion — generic catch-all
//    err_boundary_100_confusion — 50+50=10 or similar
//    err_commutative_confusion — thinks order matters
// ════════════════════════════════════════════════════════════════════════════

function _l43Q(n, o) {
  return {
    id: 'g1-u4-l3-q-' + String(n).padStart(3, '0'),
    teks: o.teks || ['1.3A'],
    lessonId: 'g1-u4-l3',
    skill: 'add_multiples_of_ten',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: String(o.answer),
    choices: o.choices,
    hint: o.hint,
    intervention: Object.assign({
      followUpRule: 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: true
    }, o.intervention)
  };
}

// Question-time visual for t tens rods (ones always 0).
// Runs through _g1VisToV — use flat {type, tens, ones} form.
// For t === 10 (representing 100), emits hundreds field.
function _l43VisT(t) {
  if (t >= 10) {
    return { type: 'base10', hundreds: Math.floor(t / 10), tens: t % 10, ones: 0 };
  }
  return { type: 'base10', tens: t, ones: 0 };
}

// Teaching visual (intervention panels only).
// Canonical config form — NOT run through _g1VisToV.
function _l43TV(t, label) {
  var h = t >= 10 ? Math.floor(t / 10) : 0;
  return {
    type: 'base10',
    config: { hundreds: h, tens: t % 10, ones: 0, label: label || null }
  };
}

function _l43C(val, tag, msg) {
  return tag == null
    ? { value: String(val), correct: true }
    : { value: String(val), correct: false, errorTag: tag, misconceptionExplanation: msg || null };
}
```

- [ ] **Step 3: Run build to verify helpers parse cleanly**

```
node build.js
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l3): add L4.3 helper functions (_l43Q, _l43VisT, _l43TV, _l43C)"
```

---

### Task 2 — Intervention templates

**Files:**
- Modify: `src/data/g1/u4.js` (append after Task 1 helpers)

- [ ] **Step 1: Add the 7 intervention factory functions**

Append after the Task 1 helpers:

```js
// ── Intervention templates ──────────────────────────────────────────────────

function _l43IntAddedDigitsOnly(A, B, sum) {
  var a = A / 10, b = B / 10, digitSum = a + b;
  return {
    errorTag: 'err_added_digits_only',
    title: "Don't forget the zeros — 30 is not 3",
    teachingSteps: [
      A + ' is not ' + a + '. It means ' + a + ' tens, which is ' + A + '.',
      B + ' is not ' + b + '. It means ' + b + ' tens, which is ' + B + '.',
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens.',
      (a + b) + ' tens = ' + sum + ', not ' + digitSum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum + ' because ' +
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
    teachingVisual: _l43TV(a + b,
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}

function _l43IntDroppedZero(missing, other, sum) {
  var mTens = missing / 10, sTens = sum / 10, oTens = other / 10;
  return {
    errorTag: 'err_dropped_zero',
    title: 'The missing number is a tens number — keep the zero',
    teachingSteps: [
      'The blank stands for a TENS number, not a single digit.',
      sum + ' has ' + sTens + ' tens. We already have ' + other + ' (' + oTens + ' tens).',
      'Missing tens: ' + sTens + ' − ' + oTens + ' = ' + mTens + ' tens.',
      mTens + ' tens = ' + missing + ', not ' + mTens + '.',
      other + ' + ' + missing + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + missing +
      ' (not ' + mTens + ') because ' + mTens + ' tens = ' + missing + '.',
    teachingVisual: _l43TV(sTens, mTens + ' tens = ' + missing + ' (not ' + mTens + ')')
  };
}

function _l43IntOffByTen(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_off_by_ten',
    title: 'Count the tens carefully',
    teachingSteps: [
      A + ' has ' + a + ' tens. ' + B + ' has ' + b + ' tens.',
      'Count all tens together: ' + a + ' + ' + b + ' = ' + (a + b) + ' tens.',
      (a + b) + ' tens = ' + sum + '.',
      'Not ' + (sum - 10) + ' (' + (a + b - 1) + ' tens) and not ' + (sum + 10) + ' (' + (a + b + 1) + ' tens).'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum +
      ' because ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
    teachingVisual: _l43TV(a + b,
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}

function _l43IntMissingTensValue(missing, other, sum) {
  var mTens = missing / 10, oTens = other / 10, sTens = sum / 10;
  return {
    errorTag: 'err_missing_tens_value',
    title: 'The blank is a tens number, not a count of rods',
    teachingSteps: [
      sum + ' = ' + sTens + ' tens. We know ' + other + ' = ' + oTens + ' tens.',
      'Missing tens: ' + sTens + ' − ' + oTens + ' = ' + mTens + ' tens.',
      mTens + ' tens = ' + missing + '.',
      'Write ' + missing + ' in the blank — not just the digit ' + mTens + '.',
      other + ' + ' + missing + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + missing +
      ' (' + mTens + ' tens), not the digit ' + mTens + '.',
    teachingVisual: _l43TV(sTens, 'Missing piece = ' + mTens + ' tens = ' + missing)
  };
}

function _l43IntPlaceValueConfusion(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Each number tells you how many tens',
    teachingSteps: [
      A + ' means ' + a + ' tens rods.',
      B + ' means ' + b + ' tens rods.',
      'Count all rods together: ' + a + ' + ' + b + ' = ' + (a + b) + ' rods.',
      (a + b) + ' rods = ' + sum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum +
      ' (' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens).',
    teachingVisual: _l43TV(a + b,
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}

function _l43IntBoundary100(A, B) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: '10 tens = 100 — crossing into hundreds is okay',
    teachingSteps: [
      A + ' = ' + a + ' tens. ' + B + ' = ' + b + ' tens.',
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens.',
      (a + b) + ' tens = 100 — that is 1 hundred, 0 tens, 0 ones.',
      '100 is not 10. It is one whole hundred.'
    ],
    correctAnswerExplanation: A + ' + ' + B +
      ' = 100 because ' + a + ' tens + ' + b + ' tens = 10 tens = 1 hundred.',
    teachingVisual: _l43TV(10,
      a + ' tens + ' + b + ' tens = 10 tens = 100')
  };
}

function _l43IntCommutativeConfusion(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_commutative_confusion',
    title: 'You can add in either order — the answer stays the same',
    teachingSteps: [
      A + ' + ' + B + ': ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
      B + ' + ' + A + ': ' + b + ' tens + ' + a + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
      'Addition does not care which number comes first.',
      A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' and ' + B + ' + ' + A +
      ' both equal ' + sum + '. Order does not change the sum.',
    teachingVisual: _l43TV(a + b,
      A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum)
  };
}
```

- [ ] **Step 2: Run build**

```
node build.js
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l3): add L4.3 intervention templates (7 functions)"
```

---

### Task 3 — Key ideas, worked examples, diagnostics; update lessons[2]

**Files:**
- Modify: `src/data/g1/u4.js`

- [ ] **Step 1: Add `_l43Examples` array**

Append after intervention templates:

```js
// ── Worked examples ──────────────────────────────────────────────────────────

var _l43Examples = [
  {
    id: 'g1-u4-l3-ex-1',
    title: 'Example 1: Adding two tens numbers',
    prompt: 'What is 30 + 40?',
    visual: { type: 'base10', tens: 7, ones: 0 },
    steps: [
      '30 means 3 tens. 40 means 4 tens.',
      'Count all the tens together: 3 tens + 4 tens = 7 tens.',
      '7 tens = 70. Keep the zero!',
      '30 + 40 = 70.'
    ],
    finalAnswer: '30 + 40 = 70'
  },
  {
    id: 'g1-u4-l3-ex-2',
    title: 'Example 2: Order does not matter',
    prompt: 'What is 40 + 30?',
    visual: { type: 'base10', tens: 7, ones: 0 },
    steps: [
      '40 + 30 has the same numbers as 30 + 40, just switched.',
      '4 tens + 3 tens = 7 tens, no matter which comes first.',
      '40 + 30 = 70. Order does not change the answer.'
    ],
    finalAnswer: '40 + 30 = 70'
  },
  {
    id: 'g1-u4-l3-ex-3',
    title: 'Example 3: Reading a tens model',
    prompt: 'A model shows 5 tens rods. You add 2 more. What is the total?',
    visual: { type: 'base10', tens: 5, ones: 0 },
    steps: [
      '5 tens rods = 50.',
      'Add 2 more tens rods: 5 + 2 = 7 tens rods.',
      '7 tens rods = 70.',
      '50 + 20 = 70.'
    ],
    finalAnswer: '50 + 20 = 70'
  },
  {
    id: 'g1-u4-l3-ex-4',
    title: 'Example 4: Finding the missing tens number',
    prompt: '30 + ___ = 80. What is the missing number?',
    visual: null,
    steps: [
      '80 has 8 tens.',
      'We already have 30, which is 3 tens.',
      'How many more tens? 8 − 3 = 5 tens.',
      '5 tens = 50.',
      '30 + 50 = 80.'
    ],
    finalAnswer: 'The missing number is 50.'
  },
  {
    id: 'g1-u4-l3-ex-5',
    title: 'Example 5: Tens language',
    prompt: '4 tens + 3 tens = ___ tens. What number is that?',
    visual: null,
    steps: [
      '4 tens + 3 tens = 7 tens.',
      '7 tens = 70.',
      'So 40 + 30 = 70.'
    ],
    finalAnswer: '4 tens + 3 tens = 7 tens = 70'
  },
  {
    id: 'g1-u4-l3-ex-6',
    title: 'Example 6: Spotting the zero mistake',
    prompt: 'A student says 20 + 50 = 7. What is the mistake?',
    visual: null,
    steps: [
      'The student did 2 + 5 = 7 — they forgot the zeros.',
      '20 means 2 tens. 50 means 5 tens.',
      '2 tens + 5 tens = 7 tens.',
      '7 tens = 70, not 7.',
      '20 + 50 = 70.'
    ],
    finalAnswer: '20 + 50 = 70. The correct answer is 70, not 7.'
  }
];
```

- [ ] **Step 2: Update `lessons[2]` in `G1_U4_SPEC`**

Replace the scaffold `lessons[2]` block with:

```js
{
  lessonId: 'g1-u4-l3',
  title: 'Add Multiples of 10',
  teks: ['1.3A'],
  skill: 'add_multiples_of_ten',
  allowedQuestionTypes: ['multipleChoice'],
  keyIdeas: [
    '30 means 3 tens — not 3. 40 means 4 tens — not 4.',
    'To add 30 + 40, add the tens: 3 tens + 4 tens = 7 tens.',
    '7 tens = 70. Always keep the zero — it shows this is a tens number.',
    'You can add in any order: 30 + 40 = 40 + 30 = 70.',
    'A base-10 model for 30 + 40 shows 7 tens rods — count them to find 70.',
    '50 + 50 = 100 because 5 tens + 5 tens = 10 tens = 1 hundred.'
  ],
  workedExamples: _l43Examples,
  quizBank: _l43QuizBank,
  diagnostics: {
    commonDistractors: [
      { value: 'added_digits_only',      meaning: 'Treated tens as single digits — dropped both zeros (30+40=7).', errorTag: 'err_added_digits_only' },
      { value: 'dropped_zero',           meaning: 'Found the digit count of missing value but dropped the zero (chose 4 not 40).', errorTag: 'err_dropped_zero' },
      { value: 'off_by_ten',             meaning: 'Answer is ±10 from correct (30+40=60 or 80).', errorTag: 'err_off_by_ten' },
      { value: 'missing_tens_value',     meaning: 'Gave digit count not tens value for missing addend (3 not 30).', errorTag: 'err_missing_tens_value' },
      { value: 'place_value_confusion',  meaning: 'Generic — wrong tens range, digits scrambled.', errorTag: 'err_place_value_confusion' },
      { value: 'boundary_100_confusion', meaning: 'Error at 90→100 crossing (50+50=10 or omitting the hundred).', errorTag: 'err_boundary_100_confusion' },
      { value: 'commutative_confusion',  meaning: 'Thinks order matters; chose wrong equation as commutative pair.', errorTag: 'err_commutative_confusion' }
    ],
    errorTags: [
      'err_added_digits_only', 'err_dropped_zero', 'err_off_by_ten',
      'err_missing_tens_value', 'err_place_value_confusion',
      'err_boundary_100_confusion', 'err_commutative_confusion'
    ],
    interventionRules: [
      { errorTag: 'err_added_digits_only',      style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_dropped_zero',           style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_off_by_ten',             style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_missing_tens_value',     style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_place_value_confusion',  style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_boundary_100_confusion', style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_commutative_confusion',  style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
    ]
  }
},
```

- [ ] **Step 3: Add `var _l43QuizBank = [];` stub before the spec** (so the spec reference compiles)

```js
var _l43QuizBank = []; // populated in Task 4–6
```

- [ ] **Step 4: Run build**

```
node build.js
```
Expected: exits 0.

- [ ] **Step 5: Run jest**

```
npm test
```
Expected: all existing tests pass.

- [ ] **Step 6: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l3): add key ideas, worked examples, diagnostics, lessons[2] scaffold"
```

---

### Task 4 — Easy questions (55)

**Files:**
- Modify: `src/data/g1/u4.js` (populate `_l43QuizBank` with q-001 through q-095)

> **Before starting:** Replace the `var _l43QuizBank = [];` stub with the full array opened with `[` — close it after Task 6.

- [ ] **Step 1: Add C1 Easy — basic equation (q-001 to q-025)**

Pattern: both addends are multiples of 10, at least one ≤ 40, sum ≤ 80. The correct answer is the sum. The three distractors are: `a+b` (digit sum, `err_added_digits_only`), `sum-10` (`err_off_by_ten`), `sum+10` (`err_off_by_ten`). If `sum-10` or `sum+10` collides with `a+b`, swap for `err_place_value_confusion` at a safe offset.

Representative questions (implement all 25 before committing):

```js
// ── C1 Easy: basic equation A + B = ? (q-001 to q-025) ──────────────────────
// Pairs [A, B, useVisual]: both ∈ {10..50}, sum ≤ 80
// useVisual true = show _l43VisT(A/10) for the first addend

_l43Q(1, {
  subSkill: 'basic_tens_addition', keyIdea: 2, difficulty: 'easy',
  prompt: 'What is 20 + 30?',
  visual: _l43VisT(2),
  answer: 50,
  choices: [
    _l43C('50', null),
    _l43C('5',  'err_added_digits_only',   'Added 2 + 3 as single digits — forgot the zeros.'),
    _l43C('40', 'err_off_by_ten',          'Off by one ten — counted one too few.'),
    _l43C('60', 'err_off_by_ten',          'Off by one ten — counted one too many.')
  ],
  hint: '20 is 2 tens. 30 is 3 tens. 2 tens + 3 tens = 5 tens = 50.',
  intervention: _l43IntAddedDigitsOnly(20, 30, 50)
}),

_l43Q(2, {
  subSkill: 'basic_tens_addition', keyIdea: 2, difficulty: 'easy',
  prompt: 'What is 30 + 40?',
  visual: null,
  answer: 70,
  choices: [
    _l43C('70', null),
    _l43C('7',  'err_added_digits_only',   'Added 3 + 4 as single digits — forgot the zeros.'),
    _l43C('60', 'err_off_by_ten',          'Off by one ten.'),
    _l43C('80', 'err_off_by_ten',          'Off by one ten.')
  ],
  hint: '30 is 3 tens. 40 is 4 tens. 3 tens + 4 tens = 7 tens = 70.',
  intervention: _l43IntAddedDigitsOnly(30, 40, 70)
}),

_l43Q(3, {
  subSkill: 'basic_tens_addition', keyIdea: 2, difficulty: 'easy',
  prompt: 'What is 10 + 20?',
  visual: _l43VisT(1),
  answer: 30,
  choices: [
    _l43C('30', null),
    _l43C('3',  'err_added_digits_only',   'Added 1 + 2 as single digits — forgot the zeros.'),
    _l43C('20', 'err_off_by_ten',          'Off by one ten.'),
    _l43C('40', 'err_off_by_ten',          'Off by one ten.')
  ],
  hint: '10 is 1 ten. 20 is 2 tens. 1 ten + 2 tens = 3 tens = 30.',
  intervention: _l43IntAddedDigitsOnly(10, 20, 30)
}),

// Full list of 25 easy C1 pairs (implement all before committing):
// [A, B, useVisual] — include both orderings of each unordered pair where useful
// q-001: [20,30,true]  q-002: [30,40,false] q-003: [10,20,true]  q-004: [10,30,false]
// q-005: [20,40,true]  q-006: [10,40,false] q-007: [30,10,true]  q-008: [40,20,false]
// q-009: [20,20,true]  q-010: [30,30,false] q-011: [40,40,true]  q-012: [10,50,false]
// q-013: [50,10,true]  q-014: [20,50,false] q-015: [50,20,true]  q-016: [30,50,false]
// q-017: [50,30,true]  q-018: [40,10,false] q-019: [10,10,true]  q-020: [40,30,false]
// q-021: [20,10,true]  q-022: [30,20,false] q-023: [40,20,true]  q-024: [10,40,false]
// q-025: [20,30,false] — different prompt phrasing: "What is 20 added to 30?"
```

- [ ] **Step 2: Add C2 Easy — commutative recognition (q-041 to q-045)**

```js
// ── C2 Easy: commutative recognition (q-041 to q-045) ───────────────────────
// Prompt: "Which equation gives the same answer as A + B?"
// Correct: "B + A". Distractors: wrong-number pairs, digit-sum form, reversed A.

_l43Q(41, {
  subSkill: 'commutative_tens', keyIdea: 4, difficulty: 'easy',
  prompt: 'Which equation gives the same answer as 20 + 30?',
  visual: null,
  answer: '30 + 20',
  choices: [
    _l43C('30 + 20', null),
    _l43C('3 + 2',   'err_commutative_confusion', 'The numbers are wrong — 20 is 2 tens, not 2.'),
    _l43C('20 + 40', 'err_commutative_confusion', 'That uses the wrong second number.'),
    _l43C('30 + 30', 'err_commutative_confusion', 'That doubles the second number instead of switching.')
  ],
  hint: 'When you add, you can switch the order. 20 + 30 is the same as 30 + 20.',
  intervention: _l43IntCommutativeConfusion(20, 30, 50)
}),

// q-042: "Which equation gives the same answer as 10 + 40?" → "40 + 10"
// q-043: "Which equation gives the same answer as 30 + 20?" → "20 + 30"
// q-044: "20 + 40 = 40 + 20. What is the answer?" → 60 (tests computation with commutative framing)
// q-045: "Which equation gives the same answer as 20 + 40?" → "40 + 20"
```

- [ ] **Step 3: Add C3 Easy — model → equation (q-056 to q-065)**

```js
// ── C3 Easy: model → equation (q-056 to q-065) ──────────────────────────────
// Prompt: "This model shows A tens rods. A student adds B more tens rods. Which equation?"
// Visual: _l43VisT(A/10). Answer: "A + B = sum". Distractors include digit-sum equation.

_l43Q(56, {
  subSkill: 'model_to_equation', keyIdea: 1, difficulty: 'easy',
  prompt: 'This model shows 3 tens rods. A student adds 4 more tens rods. Which equation does this show?',
  visual: _l43VisT(3),
  answer: '30 + 40 = 70',
  choices: [
    _l43C('30 + 40 = 70', null),
    _l43C('3 + 4 = 7',    'err_added_digits_only',  'Used single digits instead of tens values.'),
    _l43C('30 + 4 = 34',  'err_missing_tens_value', 'Treated the 4 rods as ones, not tens.'),
    _l43C('30 + 40 = 7',  'err_dropped_zero',       'Right equation, wrong sum — dropped the zero.')
  ],
  hint: '3 tens rods = 30. 4 more tens rods = 40. 30 + 40 = 70.',
  intervention: _l43IntAddedDigitsOnly(30, 40, 70)
}),

// Pairs for q-056 to q-065 [A/10, B/10]:
// 056:[3,4] 057:[2,3] 058:[1,4] 059:[2,4] 060:[3,2]
// 061:[1,3] 062:[4,1] 063:[2,2] 064:[3,3] 065:[1,2]
```

- [ ] **Step 4: Add C4 Easy — model → answer (q-071 to q-085)**

```js
// ── C4 Easy: model → answer (q-071 to q-085) ────────────────────────────────
// Prompt: "This model shows T tens rods. What number is this?"
// Visual: _l43VisT(T). Answer: T*10.
// Distractors: T (err_added_digits_only), (T-1)*10 (err_off_by_ten), (T+1)*10 (err_off_by_ten)

_l43Q(71, {
  subSkill: 'model_to_answer', keyIdea: 3, difficulty: 'easy',
  prompt: 'This model shows 5 tens rods. What number is this?',
  visual: _l43VisT(5),
  answer: 50,
  choices: [
    _l43C('50', null),
    _l43C('5',  'err_added_digits_only', 'Counted 5 rods but wrote 5 — 5 rods is 50, not 5.'),
    _l43C('40', 'err_off_by_ten',        'One ten too few.'),
    _l43C('60', 'err_off_by_ten',        'One ten too many.')
  ],
  hint: '5 tens rods = 5 tens = 50.',
  intervention: _l43IntAddedDigitsOnly(50, 0, 50)  // special: A=50, B=0 — intervention explains that 5 rods = 50
}),

// T values for q-071 to q-085: 5,3,7,2,4,6,8,9,3,5,7,2,6,4,8
// Note: for T=10 → save for C9 boundary. Keep T ∈ {2..9} for C4 easy.
```

> **Note to implementor:** For C4 `intervention`, the model-to-answer questions involve only one number (T tens). Use `_l43IntAddedDigitsOnly(T*10, 0, T*10)` — this produces slightly awkward text ("0 means 0 tens"). Override with a simpler inline intervention instead:
> ```js
> {
>   errorTag: 'err_added_digits_only',
>   title: T + ' tens rods = ' + (T*10) + ', not ' + T,
>   teachingSteps: [
>     'Each rod stands for 10, not 1.',
>     'Count the rods: ' + T + ' rods.',
>     T + ' tens = ' + (T*10) + '.',
>     'Always keep the zero: ' + (T*10) + ', not ' + T + '.'
>   ],
>   correctAnswerExplanation: T + ' tens rods = ' + (T*10) + '.',
>   teachingVisual: _l43TV(T, T + ' tens = ' + (T*10))
> }
> ```

- [ ] **Step 5: Run build + jest**

```
node build.js && npm test
```
Expected: both pass.

- [ ] **Step 6: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l3): add easy questions — C1 (25), C2 (5), C3 (10), C4 (15) = 55 easy"
```

---

### Task 5 — Medium questions (70)

**Files:**
- Modify: `src/data/g1/u4.js` (extend `_l43QuizBank`)

- [ ] **Step 1: Add C1 Medium — larger pairs (q-026 to q-040)**

At least one addend ≥ 50, sum 60–90. Follow the same 4-choice pattern as C1 Easy.

```js
// ── C1 Medium: larger pairs (q-026 to q-040) ────────────────────────────────
// Pairs [A, B]: at least one ≥ 50, sum ≤ 90
// q-026:[60,10] q-027:[70,20] q-028:[50,40] q-029:[80,10] q-030:[60,20]
// q-031:[70,10] q-032:[50,30] q-033:[40,50] q-034:[30,60] q-035:[20,70]
// q-036:[10,80] q-037:[60,30] q-038:[20,60] q-039:[50,20] q-040:[40,40]

_l43Q(26, {
  subSkill: 'basic_tens_addition', keyIdea: 2, difficulty: 'medium',
  prompt: 'What is 60 + 10?',
  visual: null,
  answer: 70,
  choices: [
    _l43C('70', null),
    _l43C('7',  'err_added_digits_only', 'Added 6 + 1 as single digits — forgot the zeros.'),
    _l43C('60', 'err_off_by_ten',        'Off by one ten.'),
    _l43C('80', 'err_off_by_ten',        'Off by one ten.')
  ],
  hint: '60 is 6 tens. 10 is 1 ten. 6 tens + 1 ten = 7 tens = 70.',
  intervention: _l43IntAddedDigitsOnly(60, 10, 70)
}),
// ... (implement all 15 before committing)
```

- [ ] **Step 2: Add C2 Medium — larger commutative pairs (q-046 to q-050)**

```js
// ── C2 Medium: commutative recognition larger pairs (q-046 to q-050) ─────────
// Pairs: [30,60], [50,20], [40,50], [20,70], [60,20]

_l43Q(46, {
  subSkill: 'commutative_tens', keyIdea: 4, difficulty: 'medium',
  prompt: 'Which equation gives the same answer as 30 + 60?',
  visual: null,
  answer: '60 + 30',
  choices: [
    _l43C('60 + 30', null),
    _l43C('3 + 6',   'err_commutative_confusion', 'Single digits — forgot the zeros.'),
    _l43C('60 + 60', 'err_commutative_confusion', 'Doubled 60 instead of switching.'),
    _l43C('30 + 70', 'err_commutative_confusion', 'Wrong second number.')
  ],
  hint: 'Switching the order: 30 + 60 becomes 60 + 30. Same sum.',
  intervention: _l43IntCommutativeConfusion(30, 60, 90)
}),
// ... (implement q-047 to q-050)
```

- [ ] **Step 3: Add C3 Medium — harder model → equation (q-066 to q-070)**

```js
// ── C3 Medium: harder model → equation (q-066 to q-070) ─────────────────────
// Pairs [A/10, B/10]: larger rods, A ∈ {3..6}, B ∈ {2..5}
// q-066:[5,2] q-067:[4,4] q-068:[3,5] q-069:[6,2] q-070:[4,3]
```

- [ ] **Step 4: Add C4 Medium — model → answer harder (q-086 to q-095)**

```js
// ── C4 Medium: model → answer harder (q-086 to q-095) ───────────────────────
// T values: 6,7,8,9,4,3,8,7,6,5 (T ∈ {3..9}, mix of higher values)
```

- [ ] **Step 5: Add C5 Medium — missing addend A + __ = sum (q-096 to q-110)**

```js
// ── C5 Medium: missing addend A + __ = sum (q-096 to q-110) ─────────────────
// Prompt: "A + ___ = sum. What is the missing number?"
// Choices: missing (correct), missing/10 (err_dropped_zero), missing-10 (err_off_by_ten), A (err_missing_tens_value)
// ~5 questions have visual: _l43VisT(sum/10) showing sum's rods

_l43Q(96, {
  subSkill: 'missing_addend', keyIdea: 2, difficulty: 'medium',
  prompt: '30 + ___ = 70. What is the missing number?',
  visual: _l43VisT(7),
  answer: 40,
  choices: [
    _l43C('40', null),
    _l43C('4',  'err_dropped_zero',       'Found 4 tens but dropped the zero — the answer is 40, not 4.'),
    _l43C('30', 'err_off_by_ten',         'Off by one ten.'),
    _l43C('50', 'err_off_by_ten',         'Off by one ten.')
  ],
  hint: '70 has 7 tens. 30 has 3 tens. Missing tens: 7 − 3 = 4 tens = 40.',
  intervention: _l43IntDroppedZero(40, 30, 70)
}),

_l43Q(97, {
  subSkill: 'missing_addend', keyIdea: 2, difficulty: 'medium',
  prompt: '20 + ___ = 80. What is the missing number?',
  visual: null,
  answer: 60,
  choices: [
    _l43C('60', null),
    _l43C('6',  'err_dropped_zero',       'Found 6 tens but dropped the zero — the answer is 60, not 6.'),
    _l43C('50', 'err_off_by_ten',         'Off by one ten.'),
    _l43C('70', 'err_off_by_ten',         'Off by one ten.')
  ],
  hint: '80 has 8 tens. 20 has 2 tens. Missing tens: 8 − 2 = 6 tens = 60.',
  intervention: _l43IntDroppedZero(60, 20, 80)
}),

// Pairs [A, sum] for q-096 to q-110 (missing = sum − A):
// 096:[30,70]  097:[20,80]  098:[10,60]  099:[40,80]  100:[20,70]
// 101:[30,90]  102:[50,90]  103:[10,50]  104:[40,70]  105:[30,80]
// 106:[20,60]  107:[10,70]  108:[40,90]  109:[30,60]  110:[20,90]
```

- [ ] **Step 6: Add C6 Medium — missing first addend __ + B = sum (q-121 to q-130)**

```js
// ── C6 Medium: missing first addend __ + B = sum (q-121 to q-130) ────────────
// Prompt: "___ + B = sum. What is the missing number?"
// Same choice structure as C5.

_l43Q(121, {
  subSkill: 'missing_first_addend', keyIdea: 2, difficulty: 'medium',
  prompt: '___ + 40 = 70. What is the missing number?',
  visual: null,
  answer: 30,
  choices: [
    _l43C('30', null),
    _l43C('3',  'err_dropped_zero',       'Found 3 tens but dropped the zero — the answer is 30, not 3.'),
    _l43C('20', 'err_off_by_ten',         'Off by one ten.'),
    _l43C('40', 'err_missing_tens_value', 'That is the number already given — the blank is different.')
  ],
  hint: '70 has 7 tens. 40 has 4 tens. Missing tens: 7 − 4 = 3 tens = 30.',
  intervention: _l43IntDroppedZero(30, 40, 70)
}),

// Pairs [B, sum] for q-121 to q-130:
// 121:[40,70] 122:[30,80] 123:[20,60] 124:[50,90] 125:[10,70]
// 126:[20,80] 127:[30,90] 128:[40,80] 129:[10,60] 130:[20,70]
```

- [ ] **Step 7: Add C7 Medium — tens-language (q-136 to q-145)**

```js
// ── C7 Medium: tens-language (q-136 to q-145) ────────────────────────────────
// Prompt: "X tens + Y tens = ___ tens. What number is that?" → (X+Y)*10
// OR: "3 tens + 4 tens = ? Choose the number." → 70
// Choices: sum (correct), X*10 or Y*10 (err_missing_tens_value — gave one addend's value),
//          X+Y as digit (err_added_digits_only), sum±10 (err_off_by_ten)

_l43Q(136, {
  subSkill: 'tens_language', keyIdea: 2, difficulty: 'medium',
  prompt: '3 tens + 4 tens = ___ tens. What number is that?',
  visual: null,
  answer: 70,
  choices: [
    _l43C('70', null),
    _l43C('7',  'err_added_digits_only',   'Found 7 tens but wrote 7 — 7 tens is 70, not 7.'),
    _l43C('30', 'err_missing_tens_value',  'That is 3 tens, the first addend — not the total.'),
    _l43C('60', 'err_off_by_ten',          'One ten too few.')
  ],
  hint: '3 tens + 4 tens = 7 tens. 7 tens = 70.',
  intervention: _l43IntAddedDigitsOnly(30, 40, 70)
}),

_l43Q(137, {
  subSkill: 'tens_language', keyIdea: 2, difficulty: 'medium',
  prompt: '2 tens + 5 tens = ___ tens. What number is that?',
  visual: null,
  answer: 70,
  choices: [
    _l43C('70', null),
    _l43C('7',  'err_added_digits_only',   'Found 7 tens but wrote 7 — 7 tens is 70.'),
    _l43C('50', 'err_missing_tens_value',  'That is 5 tens, the second addend — not the total.'),
    _l43C('80', 'err_off_by_ten',          'One ten too many.')
  ],
  hint: '2 tens + 5 tens = 7 tens = 70.',
  intervention: _l43IntAddedDigitsOnly(20, 50, 70)
}),

// X+Y pairs for q-136 to q-145:
// 136:[3,4]=7tens=70  137:[2,5]=7tens=70  138:[1,6]=7tens=70  139:[4,5]=9tens=90
// 140:[3,5]=8tens=80  141:[2,6]=8tens=80  142:[1,7]=8tens=80  143:[4,4]=8tens=80
// 144:[3,6]=9tens=90  145:[2,7]=9tens=90
```

- [ ] **Step 8: Run build + jest**

```
node build.js && npm test
```
Expected: both pass.

- [ ] **Step 9: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l3): add medium questions — C1(15), C2(5), C3(5), C4(10), C5(15), C6(10), C7(10) = 70 medium"
```

---

### Task 6 — Hard questions (45)

**Files:**
- Modify: `src/data/g1/u4.js` (extend `_l43QuizBank`; close the array with `]`)

- [ ] **Step 1: Add C2 Hard — commutative (larger/harder pairs, q-051 to q-055)**

```js
// ── C2 Hard: commutative recognition hard (q-051 to q-055) ──────────────────
// Pairs: both ≥ 40: [40,50], [50,40], [30,60], [40,40], [60,30]

_l43Q(51, {
  subSkill: 'commutative_tens', keyIdea: 4, difficulty: 'hard',
  prompt: 'Which equation gives the same answer as 40 + 50?',
  visual: null,
  answer: '50 + 40',
  choices: [
    _l43C('50 + 40', null),
    _l43C('4 + 5',   'err_commutative_confusion', 'Single digits — forgot the zeros.'),
    _l43C('50 + 50', 'err_commutative_confusion', 'Wrong — changed one number.'),
    _l43C('40 + 60', 'err_commutative_confusion', 'Wrong — changed one number.')
  ],
  hint: '40 + 50 = 50 + 40. Switching the order gives the same sum.',
  intervention: _l43IntCommutativeConfusion(40, 50, 90)
}),
// q-052:[50,40] q-053:[30,60] q-054:[40,40] q-055:[60,30]
```

- [ ] **Step 2: Add C5 Hard — missing addend, harder (q-111 to q-120)**

```js
// ── C5 Hard: missing addend harder (q-111 to q-120) ─────────────────────────
// Pairs [A, sum] with larger values:
// 111:[40,90] 112:[60,90] 113:[30,90] 114:[50,80] 115:[20,90]
// 116:[70,90] 117:[40,80] 118:[60,80] 119:[30,70] 120:[50,90]

_l43Q(111, {
  subSkill: 'missing_addend', keyIdea: 2, difficulty: 'hard',
  prompt: '40 + ___ = 90. What is the missing number?',
  visual: null,
  answer: 50,
  choices: [
    _l43C('50', null),
    _l43C('5',  'err_dropped_zero',       'Found 5 tens but dropped the zero — write 50, not 5.'),
    _l43C('40', 'err_off_by_ten',         'Off by one ten.'),
    _l43C('60', 'err_off_by_ten',         'Off by one ten.')
  ],
  hint: '90 has 9 tens. 40 has 4 tens. Missing: 9 − 4 = 5 tens = 50.',
  intervention: _l43IntDroppedZero(50, 40, 90)
}),
// ... (implement q-112 to q-120 following same structure)
```

- [ ] **Step 3: Add C6 Hard — missing first addend harder (q-131 to q-135)**

```js
// ── C6 Hard: missing first addend harder (q-131 to q-135) ────────────────────
// Pairs [B, sum]:
// 131:[50,90] 132:[60,80] 133:[40,90] 134:[70,80] 135:[30,90]

_l43Q(131, {
  subSkill: 'missing_first_addend', keyIdea: 2, difficulty: 'hard',
  prompt: '___ + 50 = 90. What is the missing number?',
  visual: null,
  answer: 40,
  choices: [
    _l43C('40', null),
    _l43C('4',  'err_dropped_zero',       'Found 4 tens but dropped the zero — write 40, not 4.'),
    _l43C('30', 'err_off_by_ten',         'Off by one ten.'),
    _l43C('50', 'err_missing_tens_value', 'That is the known addend, not the missing one.')
  ],
  hint: '90 has 9 tens. 50 has 5 tens. Missing: 9 − 5 = 4 tens = 40.',
  intervention: _l43IntDroppedZero(40, 50, 90)
}),
// ... (implement q-132 to q-135)
```

- [ ] **Step 4: Add C7 Hard — tens-language harder (q-146 to q-150)**

```js
// ── C7 Hard: tens-language harder (q-146 to q-150) ───────────────────────────
// X+Y pairs: both ≥ 4; sums 70–90
// 146:[4,5]=90  147:[5,4]=90  148:[3,6]=90  149:[4,6]=100 ← boundary, use _l43IntBoundary100
// 150:[5,3]=80
// Note: q-149 [4,6] sums to 100 — use err_boundary_100_confusion as primary distractor

_l43Q(146, {
  subSkill: 'tens_language', keyIdea: 2, difficulty: 'hard',
  prompt: '4 tens + 5 tens = ___ tens. What number is that?',
  visual: null,
  answer: 90,
  choices: [
    _l43C('90', null),
    _l43C('9',  'err_added_digits_only',  '9 tens is 90, not 9.'),
    _l43C('80', 'err_off_by_ten',         'One ten too few.'),
    _l43C('40', 'err_missing_tens_value', 'That is the first addend — not the total.')
  ],
  hint: '4 tens + 5 tens = 9 tens = 90.',
  intervention: _l43IntAddedDigitsOnly(40, 50, 90)
}),
// ... (implement q-147 to q-150)
```

- [ ] **Step 5: Add C8 Hard — error repair (q-151 to q-160)**

```js
// ── C8 Hard: error repair (q-151 to q-160) ───────────────────────────────────
// Prompt: "A student says A + B = wrong. What is the correct answer?"
// The student's wrong answer is always a real error-tag value.
// Primary student error: err_added_digits_only (most common — treat tens as digits).
// Mix: ~6 with digit-sum error, ~2 with off-by-ten error, ~2 with dropped-zero-style error.

_l43Q(151, {
  subSkill: 'error_repair', keyIdea: 3, difficulty: 'hard',
  prompt: 'A student says 30 + 50 = 8. What is the correct answer?',
  visual: null,
  answer: 80,
  choices: [
    _l43C('80', null),
    _l43C('8',  'err_added_digits_only',  'The student added 3 + 5 as digits — that is the mistake!'),
    _l43C('70', 'err_off_by_ten',         'One ten too few.'),
    _l43C('90', 'err_off_by_ten',         'One ten too many.')
  ],
  hint: '30 is 3 tens. 50 is 5 tens. 3 tens + 5 tens = 8 tens = 80.',
  intervention: _l43IntAddedDigitsOnly(30, 50, 80)
}),

_l43Q(152, {
  subSkill: 'error_repair', keyIdea: 3, difficulty: 'hard',
  prompt: 'A student says 40 + 20 = 6. What is the correct answer?',
  visual: null,
  answer: 60,
  choices: [
    _l43C('60', null),
    _l43C('6',  'err_added_digits_only',  'The student added 4 + 2 as digits — forgot the zeros.'),
    _l43C('50', 'err_off_by_ten',         'One ten too few.'),
    _l43C('70', 'err_off_by_ten',         'One ten too many.')
  ],
  hint: '4 tens + 2 tens = 6 tens = 60.',
  intervention: _l43IntAddedDigitsOnly(40, 20, 60)
}),

// Pairs [A, B, studentWrong] for q-151 to q-160:
// 151:[30,50,8]  152:[40,20,6]  153:[20,60,8]  154:[50,30,8]  155:[10,70,8]
// 156:[60,20,8]  157:[30,40,7]  158:[20,50,7]  159:[40,30,70←off] 160:[50,20,70←off]
// For q-159/160, the student's wrong answer is sum±10 (err_off_by_ten), not digit-sum.
```

- [ ] **Step 6: Add C9 Hard — boundary sum = 100 (q-161 to q-170)**

> **Before coding C9:** verify in a browser that `_l43VisT(10)` → `{type:'base10', hundreds:1, tens:0, ones:0}` renders correctly as a hundreds flat. If it doesn't, set `visual: null` for those questions and note it in a code comment.

```js
// ── C9 Hard: boundary sum = 100 (q-161 to q-170) ────────────────────────────
// Pairs [A, B] where A + B = 100:
// [50,50],[40,60],[60,40],[30,70],[70,30],[20,80],[80,20],[10,90],[90,10],[50,50 alt prompt]

_l43Q(161, {
  subSkill: 'boundary_sum_100', keyIdea: 6, difficulty: 'hard',
  prompt: 'What is 50 + 50?',
  visual: _l43VisT(5),
  answer: 100,
  choices: [
    _l43C('100', null),
    _l43C('10',  'err_boundary_100_confusion', 'Got 10 tens but wrote 10 — 10 tens = 100, not 10.'),
    _l43C('90',  'err_off_by_ten',             'One ten too few.'),
    _l43C('110', 'err_off_by_ten',             'One ten too many.')
  ],
  hint: '50 is 5 tens. 5 tens + 5 tens = 10 tens = 100.',
  intervention: _l43IntBoundary100(50, 50)
}),

_l43Q(162, {
  subSkill: 'boundary_sum_100', keyIdea: 6, difficulty: 'hard',
  prompt: 'What is 40 + 60?',
  visual: null,
  answer: 100,
  choices: [
    _l43C('100', null),
    _l43C('10',  'err_boundary_100_confusion', 'Got 10 tens but wrote 10 — 10 tens = 100.'),
    _l43C('90',  'err_off_by_ten',             'One ten too few.'),
    _l43C('1',   'err_added_digits_only',      'Added 4 + 6 = 10 then wrote just 1?')
  ],
  hint: '40 is 4 tens. 60 is 6 tens. 4 + 6 = 10 tens = 100.',
  intervention: _l43IntBoundary100(40, 60)
}),

// Pairs for q-161 to q-170:
// 161:[50,50]  162:[40,60]  163:[60,40]  164:[30,70]  165:[70,30]
// 166:[20,80]  167:[80,20]  168:[10,90]  169:[90,10]
// 170: "5 tens + 5 tens = ___ tens. What number is that?" → 100 (tens-language boundary)
```

- [ ] **Step 7: Close the `_l43QuizBank` array**

After q-170, add:

```js
]; // end _l43QuizBank
```

- [ ] **Step 8: Run build + full tests**

```
node build.js && npm test && node --test tests/g1-unit-quiz.test.js
```
Expected: all pass.

- [ ] **Step 9: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l3): add hard questions — C2(5), C5(10), C6(5), C7(5), C8(10), C9(10) = 45 hard"
```

---

### Task 7 — Count validation + regression

**Files:**
- Read only: test output and console

- [ ] **Step 1: Verify L4.3 counts**

```
node -e "
  import('./src/data/g1/u4.js').then(m => {
    var l3 = m.G1_U4_SPEC.lessons[2];
    var qb = l3.quizBank;
    var e   = qb.filter(q => q.difficulty === 'easy').length;
    var med = qb.filter(q => q.difficulty === 'medium').length;
    var h   = qb.filter(q => q.difficulty === 'hard').length;
    console.log('L4.3 easy:',  e,   '(want 55)');
    console.log('L4.3 med:',   med, '(want 70)');
    console.log('L4.3 hard:',  h,   '(want 45)');
    console.log('L4.3 total:', qb.length, '(want 170)');
    console.log('L4.1 total (must stay 170):', m.G1_U4_SPEC.lessons[0].quizBank.length);
    console.log('L4.2 total (must stay 165):', m.G1_U4_SPEC.lessons[1].quizBank.length);
    var all = m.G1_U4_SPEC.lessons.reduce(function(s,l){ return s + l.quizBank.length; }, 0);
    console.log('U4 pool total:', all, '(want 505)');
  });
"
```

Expected output:
```
L4.3 easy:  55 (want 55)
L4.3 med:   70 (want 70)
L4.3 hard:  45 (want 45)
L4.3 total: 170 (want 170)
L4.1 total (must stay 170): 170
L4.2 total (must stay 165): 165
U4 pool total: 505 (want 505)
```

- [ ] **Step 2: Verify all 7 error tags appear**

```
node -e "
  import('./src/data/g1/u4.js').then(m => {
    var tags = ['err_added_digits_only','err_dropped_zero','err_off_by_ten',
                'err_missing_tens_value','err_place_value_confusion',
                'err_boundary_100_confusion','err_commutative_confusion'];
    var qb = m.G1_U4_SPEC.lessons[2].quizBank;
    tags.forEach(function(t) {
      var count = qb.filter(function(q) { return q.intervention && q.intervention.errorTag === t; }).length;
      console.log(t + ':', count, count > 0 ? 'OK' : 'MISSING');
    });
  });
"
```

Expected: all 7 tags print `OK`.

- [ ] **Step 3: Run all tests**

```
npm test && node --test tests/g1-unit-quiz.test.js
```
Expected: all pass.

- [ ] **Step 4: Commit if any fixes were needed**

```
git add src/data/g1/u4.js
git commit -m "fix(g1u4-l3): correct question counts or error tags to match spec"
```

---

### Task 8 — Browser verification

**No code changes — observation only.**

- [ ] Start dev server; navigate to Unit 4 → Lesson 4.3
- [ ] Verify 6 key ideas render
- [ ] Verify 6 worked examples render (including boundary example about 50+50=100)
- [ ] Start the lesson quiz; answer the first question incorrectly once
- [ ] Verify simple feedback shows (correct answer + hint)
- [ ] Answer incorrectly again
- [ ] Verify intervention overlay shows all 5 parts: title, teachingSteps, correctAnswerExplanation, teachingVisual, "Try a new one"
- [ ] Click "Try a new one" — verify new question is `skill: 'add_multiples_of_ten'` with different A/B
- [ ] Test a C9 boundary question (50+50=100) — verify teaching visual shows hundreds flat correctly
- [ ] Verify base-10 visuals with `ones: 0` show no phantom cubes
- [ ] Navigate to L4.1 and L4.2 — verify they still work
- [ ] Navigate to U1, U2, U3 — verify correct question counts load
- [ ] Check browser console — zero new errors

---

## Self-review against spec

| Spec requirement | Plan section | Status |
|---|---|---|
| Lesson title | §1 | ✓ |
| TEKS alignment | §2 | ✓ 1.3A confirmed; boundary scope justified |
| Skill name | §3 | ✓ add_multiples_of_ten |
| Exact scope | §4 | ✓ both addends multiples of 10, sum ≤ 100 |
| Out of scope | §5 | ✓ 11 hard guardrails listed |
| Differs from L4.1, L4.2 | §6 | ✓ table with 6 dimensions |
| 5–6 key ideas | §7 | ✓ 6 ideas |
| 5–6 worked examples | §8 | ✓ 6 with full steps |
| Question categories | §9 | ✓ 9 categories |
| Target count 170 | §10 | ✓ |
| 55E / 70M / 45H | §11 | ✓ table + ID ranges |
| Visual strategy | §12 | ✓ `_l43VisT`, `_l43TV`, rules per category |
| Error tags (7) | §13 | ✓ all 7 defined |
| Intervention templates (7) | §14 | ✓ all 7 functions with full JS code |
| Retry behavior | §15 | ✓ same_skill_new_numbers |
| Risks | §16 | ✓ 9 risks identified |
| Verification checklist | §17 | ✓ 25+ checks |
| No word problems | §5 | ✓ |
| No regrouping | §5 | ✓ |
| No ones digit in addends | §5 | ✓ |
| err_added_digits_only | §13–14 | ✓ |
| err_dropped_zero | §13–14 | ✓ |
| err_off_by_ten | §13–14 | ✓ |
| err_missing_tens_value | §13–14 | ✓ |
| err_place_value_confusion | §13–14 | ✓ |
| err_boundary_100_confusion | §13–14 | ✓ |
| err_commutative_confusion | §13–14 | ✓ |
| base10 primary visual | §12 | ✓ |
| 100 rendered as hundreds flat | §12, §16 | ✓ risk noted + helper defined |
| Top visual = question | §12 | ✓ |
| Bottom visual = teaching | §12 | ✓ |
| doNotRepeatOriginalQuestion | §15 | ✓ |
| followUpRule same_skill | §15 | ✓ |
| L4.1 and L4.2 untouched | §16 risk 8, §17 | ✓ |
| U4 pool = 505 after L4.3 | §17 | ✓ validation script provided |
