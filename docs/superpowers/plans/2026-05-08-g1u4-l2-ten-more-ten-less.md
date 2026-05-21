# Grade 1 Unit 4 · Lesson 4.2 — 10 More and 10 Less · Design Plan

> **Status:** PLANNING ONLY — no code yet. Awaiting approval before implementation.
> **Scope of this document:** content/design plan + TDD task breakdown.

---

## 1. Lesson title

**10 More and 10 Less**

---

## 2. TEKS alignment

- **Primary:** TEKS 1.5C — Use relationships to determine the number that is 10 more and 10 less than a given number up to 120.

`teks: ['1.5C']` in spec (already set in scaffold).

No secondary TEKS needed. 1.3A belongs to L4.1, L4.3, L4.4. 1.5D and 1.5G belong to L4.4 and L4.5.

---

## 3. Skill name

`skill: 'ten_more_ten_less'` (already set in scaffold)

Sub-skills used on individual questions:

| subSkill | Category |
|---|---|
| `find_10_more` | C1 |
| `find_10_less` | C2 |
| `add_10_equation` | C3 |
| `subtract_10_equation` | C4 |
| `identify_direction` | C5 |
| `ones_digit_unchanged` | C6 |
| `tens_digit_changes` | C7 |
| `error_repair` | C8 |
| `boundary_crossing` | C9 |
| `reverse_operation` | C10 |

---

## 4. Exact scope

A single skill: **finding the number that is 10 more or 10 less** than a given number, using place-value reasoning (the tens digit changes by 1; the ones digit stays the same).

Allowed problem shapes:
- `10 more than N = ?` — output format (N is any number 11–109 such that result ≤ 120)
- `10 less than N = ?` — output format (N is any number 11–120 such that result ≥ 1)
- `N + 10 = ?` — equation form
- `N − 10 = ?` — equation form
- `Which equals 10 more than N?` — direction identification (MCQ)
- `In N + 10, what digit stays the same?` — ones-stay-same conceptual
- `N + 10 = R. How many tens does R have?` — tens-change conceptual
- `A student says N + 10 = X. What is the correct answer?` — error repair
- `___ + 10 = R. What is the missing number?` — reverse operation (hard)

Where:
- N ∈ integers 11–120, restricted by operation: `+10` → N ≤ 110 (result ≤ 120); `−10` → N ≥ 11 (result ≥ 1)
- All results stay within **1–120**
- Boundary values deliberately included at hard difficulty: N ∈ {90, 100, 110, 120}
- No question has a result below 1 or above 120

---

## 5. What stays out of scope

Hard guardrails — none of these may appear in any L4.2 question:

- ❌ Generic counting or skip-counting as the main skill (that belongs to L1.6)
- ❌ Two-digit + two-digit addition (e.g., `34 + 24`)
- ❌ Adding or subtracting any non-10 multiple (no `N + 20`, `N − 30`, etc. — those belong to L4.3 / L4.4)
- ❌ Regrouping, carrying, borrowing
- ❌ Vertical algorithm / column layout
- ❌ Subtracting a non-multiple of 10 (e.g., `45 − 7`)
- ❌ Word problems as the primary question form (word problems belong to L4.5; L4.2 uses plain numeric prompts only)
- ❌ Results above 120 (TEKS 1.5C cap)
- ❌ Results below 1 (no negative answers)
- ❌ Three-digit numbers in prompts (100–120 is allowed; 121+ is not)
- ❌ Adding or subtracting 100, 1000, or any three-digit value
- ❌ Any content reused from `src/data/u4.js` (Grade 4 file)

---

## 6. How this differs from Unit 1 Lesson 1.6

**L1.6** taught 10 more / 10 less as a **counting-context skill** — kids count forward or backward 10 from a number, often using a hundred chart, skip-counting, or "one more row." The emphasis was on the counting pattern and the visual of the hundred chart.

**L4.2** teaches the same operation as a **place-value strategy** — the tens digit increases or decreases by 1; the ones digit is unchanged. No counting, no hundred chart, no "jump 10 cells."

| Dimension | L1.6 (counting context) | L4.2 (place-value strategy) |
|---|---|---|
| Main idea | Count forward/back 10 | The tens digit changes by 1 |
| Visual | Hundred chart / number line (+1 per step) | Base-10 rods (one rod added/removed) |
| Framing | "10 more than 34 means count on 10" | "34 + 10: the tens go from 3 to 4, ones stay 4" |
| Fluency target | Recognize the pattern | Reason directly from place value |
| Error focus | Counting errors | Place-value errors (treated +10 as +1, didn't change tens, etc.) |
| Question types | Pattern recognition, counting | Equation form, conceptual (ones-stay, tens-change), error repair |

A student who passed L1.6 can *find* 10 more; L4.2 teaches them to *explain why* and *use it as an operation* without counting.

---

## 7. Key ideas (6)

These populate `keyIdeas` in the spec — kid-readable rules, one per insight.

1. **"Adding 10 means adding one ten-rod. The tens digit goes up by 1."**
2. **"Subtracting 10 means taking away one ten-rod. The tens digit goes down by 1."**
3. **"The ones digit never changes when you add or subtract 10."** (Example: 34 + 10 = 44 — the 4 ones stay 4.)
4. **"You can find 10 more by looking at the tens digit: 3 tens → 4 tens, so 34 → 44."**
5. **"You can find 10 less by looking at the tens digit: 7 tens → 6 tens, so 76 → 66."**
6. **"Crossing 100 is okay: 90 + 10 = 100 because 9 tens + 1 ten = 10 tens = 100."**

---

## 8. Worked examples (6)

Each has an `id`, `title`, `prompt`, `visual`, `steps[]`, and `finalAnswer`.

| id | prompt | visual | key idea |
|---|---|---|---|
| g1-u4-l2-ex-1 | 34 + 10 = ___ | base10 {t:3, o:4} | KI 1 + 3 |
| g1-u4-l2-ex-2 | 76 − 10 = ___ | base10 {t:7, o:6} | KI 2 + 3 |
| g1-u4-l2-ex-3 | What is 10 more than 52? | base10 {t:5, o:2} | KI 4 |
| g1-u4-l2-ex-4 | In 63 + 10, what digit stays the same? | base10 {t:6, o:3} | KI 3 |
| g1-u4-l2-ex-5 | 90 + 10 = ___ | base10 {t:9, o:0} | KI 6 |
| g1-u4-l2-ex-6 | Why does 34 + 10 give 44 and NOT 35? | base10 {t:3, o:4} | KI 1 + 3 (error repair) |

**Example 1 steps (34 + 10):**
1. "34 is 3 tens and 4 ones."
2. "Adding 10 means adding one more ten-rod."
3. "3 tens + 1 ten = 4 tens."
4. "The ones (4) stay the same."
5. "4 tens and 4 ones = 44."

**Example 2 steps (76 − 10):**
1. "76 is 7 tens and 6 ones."
2. "Subtracting 10 means taking away one ten-rod."
3. "7 tens − 1 ten = 6 tens."
4. "The ones (6) stay the same."
5. "6 tens and 6 ones = 66."

**Example 5 steps (90 + 10):**
1. "90 is 9 tens and 0 ones."
2. "Adding 10 means adding one more ten-rod."
3. "9 tens + 1 ten = 10 tens."
4. "10 tens = 100 (that's one flat = a hundred)."
5. "90 + 10 = 100."

**Example 6 steps (why NOT 35):**
1. "A student said 34 + 10 = 35. Let's check."
2. "If you only added 1 instead of 10, you'd get 35."
3. "But +10 means ONE MORE TEN-ROD, not one more cube."
4. "The tens digit goes from 3 to 4, not from 3 to 3."
5. "34 + 10 = 44. The ones stay 4."

---

## 9. Question categories

Ten categories across three difficulty bands:

### Easy (C1–C3)

**C1 — Find 10 more (output)**
- Prompt: "What is 10 more than `N`?"
- Visual: base10 showing N
- Choices: correct (N+10), err_ten_as_one (N+1), err_wrong_direction (N−10), err_ones_changed (N+10 with ones altered)
- 20 questions. N ∈ {11–79} with ones ∈ {1–9} (no multiples of 10, no boundary numbers)

**C2 — Find 10 less (output)**
- Prompt: "What is 10 less than `N`?"
- Visual: base10 showing N
- Choices: correct (N−10), err_ten_as_one (N−1), err_wrong_direction (N+10), err_ones_changed (N−10 with ones altered)
- 20 questions. N ∈ {21–79} with ones ∈ {1–9}

**C3 — Equation form +10 (result)**
- Prompt: "`N` + 10 = ___"
- Visual: base10 showing N
- Same choice structure as C1
- 15 questions. N ∈ {11–69} with ones ∈ {1–9}

### Medium (C4–C7)

**C4 — Equation form −10 (result)**
- Prompt: "`N` − 10 = ___"
- Visual: base10 showing N
- Same choice structure as C2
- 15 questions. N ∈ {21–79} with ones ∈ {1–9}

**C5 — Missing direction identification**
- Prompt: "Which number shows 10 more than `N`?" or "Which number shows 10 less than `N`?"
- Visual: none (or base10 of N)
- Choices: correct (N±10), err_ten_as_one (N±1), wrong_direction (N∓10), err_place_value_confusion (digits rearranged)
- 15 questions. N ∈ {15–85}, ones ∈ {1–9}

**C6 — Ones-digit-stays-same conceptual**
- Prompt: "In `N` + 10, what is the ones digit of the answer?" or "In `N` − 10, the ones digit will be ___."
- Visual: base10 showing N (highlights ones cubes)
- Choices: ones(N) (correct), ones(N)+1 (err_ones_changed), tens(N) (err_place_value_confusion: answered with tens digit), ones(N)−1 (err_off_by_one)
- 20 questions. N ∈ {13–79}, ones ∈ {2–8}

**C7 — Tens-digit-changes conceptual**
- Prompt: "`N` + 10 = `R`. How many tens does `R` have?" or "`N` − 10 = `R`. How many tens does `R` have?"
- Visual: base10 showing R (the result)
- Choices: tens(R) (correct), tens(N) (err_tens_not_changed: gave original tens), tens(R)+1 (err_off_by_ten), ones(R) (err_place_value_confusion)
- 15 questions. N ∈ {13–79}

### Hard (C8–C10)

**C8 — Error repair**
- Prompt: "A student says `N` + 10 = `wrong`. What is the correct answer?" or "A student says `N` − 10 = `wrong`. What is the correct answer?"
- Visual: none (student's work)
- `wrong` values drawn from actual error-tag misconceptions (e.g., N+1 for err_ten_as_one)
- Choices: correct (N±10), the_error (repeat of student's wrong answer), second_error (different error), err_place_value_confusion
- 15 questions. N ∈ {13–89}

**C9 — Boundary cases**
- Prompt: `N` + 10 = ___ or `N` − 10 = ___ where N ∈ {90, 100, 110, 80, 110, 120}
- Specifically: 90+10=100, 100+10=110, 110+10=120, 100−10=90, 110−10=100, 120−10=110
- Visual: base10 for the starting number (includes 100–120 range)
- Choices: correct, err_boundary_100_confusion (e.g., 910 for 90+10, or 91 for 90+10), err_ten_as_one, err_wrong_direction
- 15 questions (2–3 questions per boundary pair, varied representations)

**C10 — Reverse operation (missing starting number)**
- Prompt: "___ + 10 = `R`. What number goes in the blank?" or "___ − 10 = `R`. What number goes in the blank?"
- Visual: base10 showing R (the result)
- Choices: correct (R−10 or R+10), err_ten_as_one (R±1), err_wrong_direction (R±10 in the wrong direction), err_off_by_ten (R±20)
- 15 questions. R ∈ {21–79} for +10 reverse; R ∈ {11–69} for −10 reverse

---

## 10. Target question count

**165 total**

---

## 11. Easy / medium / hard distribution

| Band | Categories | Count |
|---|---|---|
| Easy | C1 (20) + C2 (20) + C3 (15) | **55** |
| Medium | C4 (15) + C5 (15) + C6 (20) + C7 (15) | **65** |
| Hard | C8 (15) + C9 (15) + C10 (15) | **45** |
| **Total** | | **165** |

Question IDs:
- q-001 to q-020: C1 (easy)
- q-021 to q-040: C2 (easy)
- q-041 to q-055: C3 (easy)
- q-056 to q-070: C4 (medium)
- q-071 to q-085: C5 (medium)
- q-086 to q-105: C6 (medium)
- q-106 to q-120: C7 (medium)
- q-121 to q-135: C8 (hard)
- q-136 to q-150: C9 (hard)
- q-151 to q-165: C10 (hard)

---

## 12. Visual strategy

### Question-level visuals

| Category | Visual type | Config |
|---|---|---|
| C1, C2, C3, C4 | `base10` | `{tens: t, ones: o}` of starting number N |
| C5 | `base10` or `null` | `{tens: t, ones: o}` of N (optional) |
| C6 | `base10` | `{tens: t, ones: o}` of N |
| C7 | `base10` | `{tens: t, ones: o}` of result R |
| C8 | `null` | student-error-repair; no visual needed |
| C9 | `base10` | `{tens: t, ones: o}` of N (handles 100–120 via flat) |
| C10 | `base10` | `{tens: t, ones: o}` of result R |

**numberLine** is available as an alternative for C1–C4 and C9 where a jump visual helps, but base10 is the default. Do not mix numberLine into C6/C7/C8 (those are conceptual / textual).

For the number line, the format (matching L1.6 pattern):
```js
{
  type: 'numberLine',
  min: startNum - 10,
  max: startNum + 20,       // round to nearest 10
  ticks: [multiples of 10 in range],
  mark: startNum,
  jumps: [{ from: startNum, to: result, label: '+10' }]  // or '−10'
}
```

### Intervention (teaching) visuals

The "TRY IT THIS WAY" panel gets one teaching visual per intervention. Always `base10` with `config` wrapper.

**For +10 teaching:**
```js
{
  type: 'base10',
  config: {
    tens: tens(N) + 1,       // result's tens
    ones: ones(N),           // unchanged ones
    label: N + ' + 10 = ' + (N+10) + ': one more ten-rod, same ones'
  }
}
```

**For −10 teaching:**
```js
{
  type: 'base10',
  config: {
    tens: tens(N) - 1,       // result's tens
    ones: ones(N),           // unchanged ones
    label: N + ' − 10 = ' + (N-10) + ': one fewer ten-rod, same ones'
  }
}
```

**Boundary teaching (90+10=100):**
```js
{
  type: 'base10',
  config: {
    tens: 10,                // 100 = 10 tens
    ones: 0,
    label: '90 + 10 = 100: 9 tens + 1 ten = 10 tens = 100'
  }
}
```

Visual rule: top panel shows the question visual (starting number); bottom panel shows the teaching visual (result with label). This is the same convention as L4.1.

---

## 13. Error tags (7)

| Tag | Meaning | Typical wrong answer for 34+10 |
|---|---|---|
| `err_ten_as_one` | Added/subtracted 1 instead of 10 | 34+10=**35** |
| `err_wrong_direction` | Subtracted when should add, or vice versa | 34+10=**24** |
| `err_ones_changed` | Changed the ones digit in the result | 34+10=**45** or **43** |
| `err_tens_not_changed` | Tens digit unchanged; answered the original | 34+10=**34** |
| `err_off_by_ten` | Added/subtracted 20 instead of 10 | 34+10=**54** |
| `err_place_value_confusion` | Digits rearranged or in wrong place | 34+10=**41** or **74** |
| `err_boundary_100_confusion` | Concatenated or misapplied hundreds | 90+10=**910** or **91** |

Each question uses exactly one distractor per tag (where the tag is relevant to the category). A question typically has one correct answer and three distractors drawn from 3–4 of the 7 tags above. Not every question needs all 7 — choose the most realistic misconceptions for the number.

---

## 14. Intervention templates (7 functions)

One parameterised factory function per error tag. Each returns the full intervention object.

### `_l42IntTenAsOne(N, op, result)`
```js
// op is '+' or '-'
{
  errorTag: 'err_ten_as_one',
  title: '10 more means one ten-rod, not one cube',
  teachingSteps: [
    'You added 1 instead of 10.',
    '10 is one TENS rod — not one small cube.',
    N + ' ' + op + ' 10: the tens digit goes ' + (op === '+' ? 'up' : 'down') + ' by 1.',
    'The ones digit (' + ones(N) + ') stays the same.',
    N + ' ' + op + ' 10 = ' + result + '.'
  ],
  correctAnswerExplanation: N + ' ' + op + ' 10 = ' + result + ' because ' + op === '+' ?
    'the tens go from ' + tens(N) + ' to ' + tens(result) + ', and the ones stay ' + ones(N) + '.' :
    'the tens go from ' + tens(N) + ' to ' + tens(result) + ', and the ones stay ' + ones(N) + '.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(N),
    N + ' ' + op + ' 10 = ' + result + ': ' + (op === '+' ? 'one more' : 'one fewer') + ' ten-rod')
}
```

### `_l42IntWrongDirection(N, op, result)`
```js
{
  errorTag: 'err_wrong_direction',
  title: 'Check the direction: more means add, less means subtract',
  teachingSteps: [
    '"10 more" means ADD 10 → the number gets bigger.',
    '"10 less" means SUBTRACT 10 → the number gets smaller.',
    'You went the wrong way.',
    N + ' ' + op + ' 10 = ' + result + '. Is ' + result + ' bigger or smaller than ' + N + '?',
    (op === '+' ? result + ' > ' + N + ': correct, it is bigger.' :
                  result + ' < ' + N + ': correct, it is smaller.')
  ],
  correctAnswerExplanation: N + ' ' + op + ' 10 = ' + result + '.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(N),
    N + ' ' + op + ' 10 = ' + result)
}
```

### `_l42IntOnesChanged(N, op, result)`
```js
{
  errorTag: 'err_ones_changed',
  title: 'The ones digit never changes when you add or subtract 10',
  teachingSteps: [
    'Adding or subtracting 10 only changes the TENS digit.',
    'The ones digit (' + ones(N) + ') stays exactly the same.',
    'If you got an answer where the ones digit changed, something went wrong.',
    N + ' ' + op + ' 10: ones stay ' + ones(N) + ', tens go ' +
      (op === '+' ? 'up' : 'down') + ' by 1.',
    N + ' ' + op + ' 10 = ' + result + '.'
  ],
  correctAnswerExplanation: 'The ones digit is ' + ones(N) + ' — it does not change. Only the tens change.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(N),
    'Ones stay ' + ones(N) + '. Tens: ' + tens(N) + ' → ' + tens(result))
}
```

### `_l42IntTensNotChanged(N, op, result)`
```js
{
  errorTag: 'err_tens_not_changed',
  title: 'Adding 10 always changes the tens digit',
  teachingSteps: [
    'When you add 10, you add one ten-rod.',
    'One more rod means the tens digit MUST change.',
    tens(N) + ' tens ' + (op === '+' ? '+ 1 ten = ' : '− 1 ten = ') + tens(result) + ' tens.',
    'So the tens digit goes from ' + tens(N) + ' to ' + tens(result) + '.',
    N + ' ' + op + ' 10 = ' + result + '.'
  ],
  correctAnswerExplanation: 'The tens digit changed from ' + tens(N) + ' to ' + tens(result) + '. That is how you know +10 worked.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(N),
    tens(N) + ' tens → ' + tens(result) + ' tens. Ones stay ' + ones(N))
}
```

### `_l42IntOffByTen(N, op, result)`
```js
{
  errorTag: 'err_off_by_ten',
  title: 'Add only ONE ten, not two',
  teachingSteps: [
    'You added (or subtracted) 20 instead of 10.',
    '10 more means ONE new ten-rod, not two.',
    'Count the rods: ' + tens(N) + ' rods + 1 rod = ' + tens(result) + ' rods.',
    'That gives us ' + result + ', not ' + (op === '+' ? N + 20 : N - 20) + '.',
    N + ' ' + op + ' 10 = ' + result + '.'
  ],
  correctAnswerExplanation: 'Only one ten was added. ' + tens(N) + ' + 1 = ' + tens(result) + ' tens → ' + result + '.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(N),
    'Only ONE rod ' + (op === '+' ? 'added' : 'removed') + ': ' + N + ' ' + op + ' 10 = ' + result)
}
```

### `_l42IntPlaceValueConfusion(N, op, result)`
```js
{
  errorTag: 'err_place_value_confusion',
  title: 'Tens live in the tens place, ones in the ones place',
  teachingSteps: [
    N + ' = ' + tens(N) + ' tens and ' + ones(N) + ' ones.',
    'The tens digit is on the LEFT. The ones digit is on the RIGHT.',
    'Adding 10 changes the tens digit (left). The ones digit (right) stays.',
    tens(N) + ' tens ' + (op === '+' ? '+' : '−') + ' 1 ten = ' + tens(result) + ' tens.',
    N + ' ' + op + ' 10 = ' + result + '.'
  ],
  correctAnswerExplanation: tens(result) + ' tens and ' + ones(N) + ' ones = ' + result + '.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(N),
    tens(result) + ' tens (LEFT) + ' + ones(N) + ' ones (RIGHT) = ' + result)
}
```

### `_l42IntBoundary100(N, op, result)`
```js
{
  errorTag: 'err_boundary_100_confusion',
  title: '100 is just 10 tens — crossing it is okay',
  teachingSteps: [
    '100 is not a wall — it is just 10 groups of ten.',
    N + ' = ' + tens(N) + ' tens and ' + ones(N) + ' ones.',
    tens(N) + ' tens ' + (op === '+' ? '+ 1 ten' : '− 1 ten') + ' = ' + tens(result) + ' tens.',
    tens(result) + ' tens = ' + result + '.',
    'So ' + N + ' ' + op + ' 10 = ' + result + '.'
  ],
  correctAnswerExplanation: N + ' ' + op + ' 10 = ' + result + '. Crossing 100 is fine — just count the tens.',
  teachingVisual: _l42TeachingBase10(tens(result), ones(result),
    tens(result) + ' tens = ' + result)
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

The `followUpRule: 'same_skill_new_numbers'` tells the engine to pull another `ten_more_ten_less` question with different N when the student retries after intervention.

---

## 16. Risks before coding

1. **base10 renderer with 10+ tens (100–120):** Verify the renderer handles `{tens: 10, ones: 0}` and `{tens: 11, ones: 5}` without layout overflow. L4.1 max was {tens: 9, ones: 9}. If the renderer clips or wraps at 9 rods, boundary questions (C9) need a workaround or the visual should be skipped for those. **Check before coding C9.**

2. **Ones = 0 (multiples of 10):** Questions like 30+10=40 or 90+10=100 have `ones: 0`. Verify `base10 {tens: 3, ones: 0}` renders correctly (no phantom cubes, no empty row artifact).

3. **Semantic overlap with L1.6:** Some C1/C2 questions are structurally identical to L1.6 questions. The differentiation is in the **framing** (place-value language, not counting language) and in the **intervention** (which teaches "change the tens digit," not "count on"). If the renderer or question engine deduplicates by prompt text, this may surface duplicates. Watch for this during L4.2 build — but do not touch L1.6 to resolve it.

4. **C6/C7 conceptual questions — distractor design:** Asking "what is the ones digit of the answer?" with choices like "3", "4", "6", "5" is easy to get right by luck (25% base rate). Ensure exactly one clearly correct answer and three plausible-but-wrong options that reflect real misconceptions, not arbitrary numbers.

5. **C10 (reverse) framing:** "___ + 10 = 58" is subtraction in disguise. Kids who don't recognize this will systematically err. The `err_wrong_direction` distractor (68) will be the most common error. Ensure the intervention for C10 teaches "to find the missing start, subtract 10 from the result."

6. **No new renderer changes:** All visuals use existing `base10` and `numberLine` renderers. Do not introduce new visual types. If a question needs a visual the renderer can't handle cleanly, use `visual: null` and a strong text prompt instead.

7. **ID uniqueness:** L4.1 uses `g1-u4-l1-q-001` through `g1-u4-l1-q-170`. L4.2 must use `g1-u4-l2-q-001` through `g1-u4-l2-q-165`. Verify no collision.

8. **Regression on L4.1:** L4.2 additions are appended to `_l42QuizBank` (a separate const), then referenced in the `lessons[1]` slot. L4.1 data is in `_l41QuizBank` referenced in `lessons[0]`. There is no structural risk of collision — but build must still pass and U4 unit test should draw from the now-larger pool.

---

## 17. Verification checklist

Before closing the implementation PR, confirm all of the following:

### Question count
- [ ] `quizBank.filter(q => q.difficulty === 'easy').length === 55`
- [ ] `quizBank.filter(q => q.difficulty === 'medium').length === 65`
- [ ] `quizBank.filter(q => q.difficulty === 'hard').length === 45`
- [ ] `quizBank.length === 165`

### Scope guardrails
- [ ] No result above 120
- [ ] No result below 1 (no negative answers)
- [ ] No two-digit + two-digit problem
- [ ] No regrouping / carrying
- [ ] No word problems
- [ ] No subtracting a non-10 value

### Schema completeness
- [ ] Every question has `id`, `teks`, `lessonId`, `skill`, `subSkill`, `keyIdea`, `difficulty`, `interactionType`, `prompt`, `answer`, `choices`, `hint`, `intervention`
- [ ] Every `intervention` has `followUpRule`, `doNotRepeatOriginalQuestion`, `errorTag`, `title`, `teachingSteps`, `correctAnswerExplanation`, `teachingVisual`
- [ ] All 7 error tags appear at least once across the `quizBank`
- [ ] All 7 error tags appear in `diagnostics.errorTags[]`
- [ ] All 7 intervention rules appear in `diagnostics.interventionRules[]`

### Visuals
- [ ] No question uses a visual type other than `base10` or `numberLine`
- [ ] All teaching visuals use `{type:'base10', config:{tens, ones, label}}`
- [ ] base10 with `tens >= 10` renders cleanly (boundary numbers 100–120)
- [ ] base10 with `ones: 0` renders cleanly (multiples of 10)

### Build + tests
- [ ] `node build.js` — no errors, `dist/data/g1/u4.js` emitted
- [ ] `npm test` — all jest tests pass
- [ ] `node --test tests/g1-unit-quiz.test.js` — passes
- [ ] L4.1 quizBank untouched (count still 170)
- [ ] U4 unit test pool = 335 (170 L4.1 + 165 L4.2)

### Browser regression
- [ ] L4.2 lesson page renders 6 key ideas + 6 worked examples
- [ ] L4.2 quiz starts with correct question mix
- [ ] Wrong answer triggers simple feedback (correct answer + hint)
- [ ] Second wrong answer triggers intervention overlay
- [ ] Intervention overlay shows: title, teachingSteps, correctAnswerExplanation, teachingVisual
- [ ] "Try a new one" pulls a same-skill question with different N
- [ ] U1 (1506 q), U2 (530 q), U3 (850 q), U4 (335 q) all still load correctly
- [ ] No console errors

---

## Implementation file

**Single file modified:** `src/data/g1/u4.js`

Changes:
- Add helper functions `_l42Q`, `_l42VisBase10`, `_l42VisNumberLine`, `_l42Choice`, `_l42TeachingBase10` (mirroring the `_l41*` pattern)
- Add 7 intervention factory functions `_l42Int*`
- Add `_l42Examples` array (6 worked examples)
- Add `_l42QuizBank` array (165 questions)
- Replace `lessons[1]` scaffold fields: `keyIdeas`, `workedExamples`, `quizBank`, `diagnostics`

No other files touched.

---

## TDD Task Breakdown

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate `src/data/g1/u4.js` Lesson 4.2 with 165 place-value-framed questions teaching +10/−10 as a place-value operation.

**Architecture:** All changes are in `src/data/g1/u4.js`. Helper functions and quizBank array appended after the L4.1 block, before the `G1_U4_SPEC` export. No new files.

**Tech Stack:** Vanilla JS data, existing question-engine schema, base10/numberLine renderers.

---

### Task 1 — Helper functions

**Files:**
- Modify: `src/data/g1/u4.js` (append after L4.1 block, before `G1_U4_SPEC`)

- [ ] **Step 1: Verify build is clean before starting**

```
node build.js
```
Expected: exits 0, `dist/data/g1/u4.js` emitted. If it fails, stop and fix before proceeding.

- [ ] **Step 2: Add the helper functions block**

Add the following after the last L4.1 line and before `export const G1_U4_SPEC`:

```js
// ════════════════════════════════════════════════════════════════════════════
//  Lesson 4.2 — 10 More and 10 Less — helpers
//  Skill: ten_more_ten_less · TEKS 1.5C
//  Target: 165 questions (55 easy / 65 medium / 45 hard)
// ════════════════════════════════════════════════════════════════════════════

function _l42Q(n, o) {
  return {
    id: 'g1-u4-l2-q-' + String(n).padStart(3, '0'),
    teks: o.teks || ['1.5C'],
    lessonId: 'g1-u4-l2',
    skill: 'ten_more_ten_less',
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

function _l42VisBase10(t, o) {
  return { type: 'base10', tens: t, ones: o };
}

function _l42VisNumberLine(start, result, label) {
  var lo = Math.floor(Math.min(start, result) / 10) * 10 - 10;
  var hi = Math.ceil(Math.max(start, result) / 10) * 10 + 10;
  var ticks = [];
  for (var t = lo; t <= hi; t += 10) ticks.push(t);
  return {
    type: 'numberLine',
    min: lo,
    max: hi,
    ticks: ticks,
    mark: start,
    jumps: [{ from: start, to: result, label: label }]
  };
}

function _l42Choice(value, errorTag, misconception) {
  if (errorTag == null) {
    return { value: value, correct: true };
  }
  return {
    value: value,
    correct: false,
    errorTag: errorTag,
    misconceptionExplanation: misconception || null
  };
}

function _l42TeachingBase10(t, o, label) {
  return {
    type: 'base10',
    config: { tens: t, ones: o, label: label }
  };
}
```

- [ ] **Step 3: Run build to verify helpers parse cleanly**

```
node build.js
```
Expected: exits 0. If there are syntax errors, fix them before Task 2.

- [ ] **Step 4: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l2): add L4.2 helper functions"
```

---

### Task 2 — Intervention templates

**Files:**
- Modify: `src/data/g1/u4.js` (append after Task 1 helpers)

- [ ] **Step 1: Add the 7 intervention factory functions**

Add the following block after the Task 1 helpers:

```js
// ── Intervention templates ──────────────────────────────────────────────────

function _l42IntTenAsOne(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  var dir = op === '+' ? 'up' : 'down';
  return {
    errorTag: 'err_ten_as_one',
    title: '10 means one ten-rod, not one cube',
    teachingSteps: [
      'You added 1 instead of 10.',
      '10 is a TENS rod — ten cubes bundled together.',
      N + ' ' + op + ' 10: the tens digit goes ' + dir + ' by 1.',
      'The ones digit (' + oN + ') stays the same.',
      N + ' ' + op + ' 10 = ' + result + '.'
    ],
    correctAnswerExplanation: N + ' ' + op + ' 10 = ' + result +
      '. Tens: ' + tN + ' → ' + tR + '. Ones stay ' + oN + '.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      N + ' ' + op + ' 10 = ' + result + ': one ' + (op === '+' ? 'more' : 'fewer') + ' ten-rod')
  };
}

function _l42IntWrongDirection(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  return {
    errorTag: 'err_wrong_direction',
    title: 'More means add; less means subtract',
    teachingSteps: [
      '"10 more" means ADD 10 — the number gets bigger.',
      '"10 less" means SUBTRACT 10 — the number gets smaller.',
      'You went the wrong way.',
      N + ' ' + op + ' 10 should give a ' + (op === '+' ? 'bigger' : 'smaller') + ' number.',
      N + ' ' + op + ' 10 = ' + result + '.'
    ],
    correctAnswerExplanation: result + ' is ' + (op === '+' ? 'bigger' : 'smaller') +
      ' than ' + N + ' — that is correct for ' + (op === '+' ? '10 more' : '10 less') + '.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      N + ' ' + op + ' 10 = ' + result)
  };
}

function _l42IntOnesChanged(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  return {
    errorTag: 'err_ones_changed',
    title: 'The ones digit never changes for ±10',
    teachingSteps: [
      'Adding or subtracting 10 only touches the TENS rod.',
      'The small ones cubes do not move.',
      'The ones digit (' + oN + ') stays exactly the same.',
      'Tens: ' + tN + ' → ' + tR + '. Ones: ' + oN + ' → ' + oN + ' (no change).',
      N + ' ' + op + ' 10 = ' + result + '.'
    ],
    correctAnswerExplanation: 'Ones stay ' + oN + '. Tens change from ' + tN + ' to ' + tR + '. Answer: ' + result + '.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      'Ones stay ' + oN + '. Tens: ' + tN + ' → ' + tR)
  };
}

function _l42IntTensNotChanged(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  var dir = op === '+' ? 'more' : 'fewer';
  return {
    errorTag: 'err_tens_not_changed',
    title: 'Adding 10 always changes the tens digit',
    teachingSteps: [
      'Every time you add 10, you add one ten-rod.',
      'One ' + dir + ' rod means the tens digit MUST change by 1.',
      tN + ' tens ' + (op === '+' ? '+ 1' : '− 1') + ' = ' + tR + ' tens.',
      'So the tens digit changes from ' + tN + ' to ' + tR + '.',
      N + ' ' + op + ' 10 = ' + result + '.'
    ],
    correctAnswerExplanation: 'Tens changed from ' + tN + ' to ' + tR + '. Ones stayed ' + oN + '. Answer: ' + result + '.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      tN + ' tens → ' + tR + ' tens. Ones stay ' + oN)
  };
}

function _l42IntOffByTen(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  return {
    errorTag: 'err_off_by_ten',
    title: 'Add only ONE ten, not two',
    teachingSteps: [
      'You added (or subtracted) 20 instead of 10.',
      '+10 means ONE new ten-rod — just one.',
      'Count the rods after: ' + tN + ' rods ' + (op === '+' ? '+ 1' : '− 1') + ' = ' + tR + ' rods.',
      tR + ' rods = ' + result + '.',
      N + ' ' + op + ' 10 = ' + result + ', not ' + (op === '+' ? N + 20 : N - 20) + '.'
    ],
    correctAnswerExplanation: 'Only one ten was ' + (op === '+' ? 'added' : 'removed') +
      '. ' + tN + ' → ' + tR + ' tens. Answer: ' + result + '.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      'Only ONE rod ' + (op === '+' ? 'added' : 'removed') + ': ' + result)
  };
}

function _l42IntPlaceValueConfusion(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Tens on the left, ones on the right',
    teachingSteps: [
      N + ' = ' + tN + ' tens (left digit) and ' + oN + ' ones (right digit).',
      'Adding 10 changes the LEFT digit (tens) by 1.',
      'The RIGHT digit (ones) stays.',
      tN + ' tens ' + (op === '+' ? '+' : '−') + ' 1 ten = ' + tR + ' tens.',
      N + ' ' + op + ' 10 = ' + result + '.'
    ],
    correctAnswerExplanation: tR + ' tens and ' + oN + ' ones = ' + result + '.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      tR + ' tens (LEFT) + ' + oN + ' ones (RIGHT) = ' + result)
  };
}

function _l42IntBoundary100(N, op, result) {
  var tN = Math.floor(N / 10), oN = N % 10;
  var tR = Math.floor(result / 10);
  return {
    errorTag: 'err_boundary_100_confusion',
    title: '100 is just 10 tens — crossing it works the same way',
    teachingSteps: [
      '100 is not a wall. It is just 10 groups of ten.',
      N + ' = ' + tN + ' tens and ' + oN + ' ones.',
      tN + ' tens ' + (op === '+' ? '+ 1 ten = ' : '− 1 ten = ') + tR + ' tens.',
      tR + ' tens = ' + result + '.',
      N + ' ' + op + ' 10 = ' + result + '.'
    ],
    correctAnswerExplanation: N + ' ' + op + ' 10 = ' + result +
      '. Crossing 100 is fine — just count the tens.',
    teachingVisual: _l42TeachingBase10(tR, oN,
      tR + ' tens = ' + result)
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
git commit -m "feat(g1u4-l2): add L4.2 intervention templates"
```

---

### Task 3 — Key ideas, worked examples, diagnostics; update lessons[1]

**Files:**
- Modify: `src/data/g1/u4.js`

- [ ] **Step 1: Add `_l42Examples` array**

Append after intervention templates:

```js
// ── Worked examples ──────────────────────────────────────────────────────────

var _l42Examples = [
  {
    id: 'g1-u4-l2-ex-1',
    title: 'Example 1: 10 more (basic)',
    prompt: '34 + 10 = ___',
    visual: { type: 'base10', tens: 3, ones: 4 },
    steps: [
      '34 is 3 tens and 4 ones.',
      'Adding 10 means adding one more ten-rod.',
      '3 tens + 1 ten = 4 tens.',
      'The ones (4) stay the same.',
      '4 tens and 4 ones = 44.'
    ],
    finalAnswer: '34 + 10 = 44'
  },
  {
    id: 'g1-u4-l2-ex-2',
    title: 'Example 2: 10 less (basic)',
    prompt: '76 − 10 = ___',
    visual: { type: 'base10', tens: 7, ones: 6 },
    steps: [
      '76 is 7 tens and 6 ones.',
      'Subtracting 10 means taking away one ten-rod.',
      '7 tens − 1 ten = 6 tens.',
      'The ones (6) stay the same.',
      '6 tens and 6 ones = 66.'
    ],
    finalAnswer: '76 − 10 = 66'
  },
  {
    id: 'g1-u4-l2-ex-3',
    title: 'Example 3: Find 10 more using the tens digit',
    prompt: 'What is 10 more than 52?',
    visual: { type: 'base10', tens: 5, ones: 2 },
    steps: [
      '52 has 5 tens and 2 ones.',
      '10 more means one more ten: 5 tens → 6 tens.',
      'The ones stay 2.',
      '6 tens and 2 ones = 62.'
    ],
    finalAnswer: '10 more than 52 is 62.'
  },
  {
    id: 'g1-u4-l2-ex-4',
    title: 'Example 4: The ones digit never changes',
    prompt: 'In 63 + 10, what digit stays the same?',
    visual: { type: 'base10', tens: 6, ones: 3 },
    steps: [
      '63 + 10 = 73.',
      'Look at the ones digit: 63 has 3 ones, and 73 also has 3 ones.',
      'The ones cubes did not move — only one ten-rod was added.',
      'The ones digit always stays the same when you add or subtract 10.'
    ],
    finalAnswer: 'The ones digit (3) stays the same.'
  },
  {
    id: 'g1-u4-l2-ex-5',
    title: 'Example 5: Crossing 100',
    prompt: '90 + 10 = ___',
    visual: { type: 'base10', tens: 9, ones: 0 },
    steps: [
      '90 is 9 tens and 0 ones.',
      'Adding 10 means adding one more ten-rod.',
      '9 tens + 1 ten = 10 tens.',
      '10 tens = 100.',
      '90 + 10 = 100.'
    ],
    finalAnswer: '90 + 10 = 100'
  },
  {
    id: 'g1-u4-l2-ex-6',
    title: 'Example 6: Why NOT 35?',
    prompt: 'A student says 34 + 10 = 35. What went wrong?',
    visual: { type: 'base10', tens: 3, ones: 4 },
    steps: [
      '35 would mean adding only 1, not 10.',
      '10 is a ten-rod — ten cubes bundled together.',
      'Adding a ten-rod changes the tens digit from 3 to 4.',
      'The ones digit (4) stays the same.',
      '34 + 10 = 44, not 35.'
    ],
    finalAnswer: '34 + 10 = 44. The student added 1 instead of 10.'
  }
];
```

- [ ] **Step 2: Update `lessons[1]` in `G1_U4_SPEC`**

Replace the scaffold `lessons[1]` block with:

```js
{
  lessonId: 'g1-u4-l2',
  title: '10 More and 10 Less',
  teks: ['1.5C'],
  skill: 'ten_more_ten_less',
  allowedQuestionTypes: ['multipleChoice'],
  keyIdeas: [
    'Adding 10 means adding one ten-rod. The tens digit goes up by 1.',
    'Subtracting 10 means taking away one ten-rod. The tens digit goes down by 1.',
    'The ones digit never changes when you add or subtract 10.',
    'You can find 10 more by looking at the tens digit: 3 tens → 4 tens, so 34 → 44.',
    'You can find 10 less by looking at the tens digit: 7 tens → 6 tens, so 76 → 66.',
    'Crossing 100 is okay: 90 + 10 = 100 because 9 tens + 1 ten = 10 tens = 100.'
  ],
  workedExamples: _l42Examples,
  quizBank: [],           // ← will be replaced in Task 4–6
  diagnostics: {
    commonDistractors: [
      { value: 'ten_as_one',             meaning: 'Added/subtracted 1 instead of 10 (48+10=49).',                    errorTag: 'err_ten_as_one' },
      { value: 'wrong_direction',        meaning: 'Went the wrong way: subtracted when should add or vice versa.',     errorTag: 'err_wrong_direction' },
      { value: 'ones_changed',           meaning: 'Changed the ones digit in the result.',                             errorTag: 'err_ones_changed' },
      { value: 'tens_not_changed',       meaning: 'Tens digit unchanged; answered the original number.',               errorTag: 'err_tens_not_changed' },
      { value: 'off_by_ten',             meaning: 'Added/subtracted 20 instead of 10 (34+10=54).',                    errorTag: 'err_off_by_ten' },
      { value: 'place_value_confusion',  meaning: 'Digits rearranged or in wrong place (34+10=41).',                   errorTag: 'err_place_value_confusion' },
      { value: 'boundary_100_confusion', meaning: 'Concatenated or misapplied hundreds (90+10=910 or 91).',           errorTag: 'err_boundary_100_confusion' }
    ],
    errorTags: [
      'err_ten_as_one', 'err_wrong_direction', 'err_ones_changed',
      'err_tens_not_changed', 'err_off_by_ten', 'err_place_value_confusion',
      'err_boundary_100_confusion'
    ],
    interventionRules: [
      { errorTag: 'err_ten_as_one',             style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_wrong_direction',         style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_ones_changed',            style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_tens_not_changed',        style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_off_by_ten',              style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_place_value_confusion',   style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
      { errorTag: 'err_boundary_100_confusion',  style: 'visual_model', followUpRule: 'same_skill_new_numbers' }
    ]
  }
},
```

- [ ] **Step 3: Run build**

```
node build.js
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l2): add key ideas, worked examples, diagnostics"
```

---

### Task 4 — Easy questions (55)

**Files:**
- Modify: `src/data/g1/u4.js` (add `_l42QuizBank` array; populate `lessons[1].quizBank`)

- [ ] **Step 1: Add `var _l42QuizBank = [];` stub and populate C1 (20 easy "Find 10 more")**

After the `_l42Examples` block, add:

```js
// ── Quiz bank ─────────────────────────────────────────────────────────────────
//  C1: Find 10 more (easy, q-001–q-020)         20 questions
//  C2: Find 10 less (easy, q-021–q-040)         20 questions
//  C3: Equation +10 result (easy, q-041–q-055)  15 questions
//  C4: Equation -10 result (medium, q-056–q-070) 15 questions
//  C5: Missing direction (medium, q-071–q-085)  15 questions
//  C6: Ones-stay-same (medium, q-086–q-105)     20 questions
//  C7: Tens-change (medium, q-106–q-120)        15 questions
//  C8: Error repair (hard, q-121–q-135)         15 questions
//  C9: Boundary cases (hard, q-136–q-150)       15 questions
//  C10: Reverse operation (hard, q-151–q-165)   15 questions
//  ────────────────────────────────────────────────────────
//  TOTAL                                        165 questions

var _l42QuizBank = [

// ── C1: Find 10 more (easy, q-001 to q-020) ──────────────────────────────────
// Prompt: "What is 10 more than N?" N ∈ {11–79}, ones 1–9, no multiples of 10
// Choices: correct(N+10), err_ten_as_one(N+1), err_wrong_direction(N-10), err_ones_changed
// Visual: base10 of N

_l42Q(1, {
  subSkill: 'find_10_more', keyIdea: 1, difficulty: 'easy',
  prompt: 'What is 10 more than 34?',
  visual: _l42VisBase10(3, 4),
  answer: 44,
  choices: [
    _l42Choice('44', null),
    _l42Choice('35', 'err_ten_as_one',        'Added 1 instead of 10.'),
    _l42Choice('24', 'err_wrong_direction',   'Subtracted 10 instead of adding.'),
    _l42Choice('45', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Adding 10 means one more ten-rod. The tens digit goes up by 1.',
  intervention: _l42IntTenAsOne(34, '+', 44)
}),

// ... (repeat pattern for q-002 through q-020 with varied N)
// Representative additional examples:

_l42Q(2, {
  subSkill: 'find_10_more', keyIdea: 1, difficulty: 'easy',
  prompt: 'What is 10 more than 23?',
  visual: _l42VisBase10(2, 3),
  answer: 33,
  choices: [
    _l42Choice('33', null),
    _l42Choice('24', 'err_ten_as_one',        'Added 1 instead of 10.'),
    _l42Choice('13', 'err_wrong_direction',   'Subtracted 10 instead of adding.'),
    _l42Choice('32', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Adding 10 means one more ten-rod. The tens digit goes up by 1.',
  intervention: _l42IntTenAsOne(23, '+', 33)
}),

// (q-003 through q-020 follow the same structure with N from the set:
//  11, 15, 26, 31, 42, 47, 53, 58, 61, 64, 67, 72, 75, 13, 19, 28, 36, 45)

// ── C2: Find 10 less (easy, q-021 to q-040) ──────────────────────────────────
// Prompt: "What is 10 less than N?" N ∈ {21–79}, ones 1–9

_l42Q(21, {
  subSkill: 'find_10_less', keyIdea: 2, difficulty: 'easy',
  prompt: 'What is 10 less than 76?',
  visual: _l42VisBase10(7, 6),
  answer: 66,
  choices: [
    _l42Choice('66', null),
    _l42Choice('75', 'err_ten_as_one',        'Subtracted 1 instead of 10.'),
    _l42Choice('86', 'err_wrong_direction',   'Added 10 instead of subtracting.'),
    _l42Choice('67', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Subtracting 10 means one fewer ten-rod. The tens digit goes down by 1.',
  intervention: _l42IntTenAsOne(76, '-', 66)
}),

_l42Q(22, {
  subSkill: 'find_10_less', keyIdea: 2, difficulty: 'easy',
  prompt: 'What is 10 less than 54?',
  visual: _l42VisBase10(5, 4),
  answer: 44,
  choices: [
    _l42Choice('44', null),
    _l42Choice('53', 'err_ten_as_one',        'Subtracted 1 instead of 10.'),
    _l42Choice('64', 'err_wrong_direction',   'Added 10 instead of subtracting.'),
    _l42Choice('45', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Subtracting 10 means one fewer ten-rod. The tens digit goes down by 1.',
  intervention: _l42IntWrongDirection(54, '-', 44)
}),

// (q-023 through q-040: N from the set:
//  21, 29, 37, 41, 48, 53, 62, 67, 71, 74, 79, 32, 45, 58, 63, 25, 36, 73)

// ── C3: Equation form +10 result (easy, q-041 to q-055) ──────────────────────
// Prompt: "N + 10 = ___"

_l42Q(41, {
  subSkill: 'add_10_equation', keyIdea: 1, difficulty: 'easy',
  prompt: '52 + 10 = ___',
  visual: _l42VisBase10(5, 2),
  answer: 62,
  choices: [
    _l42Choice('62', null),
    _l42Choice('53', 'err_ten_as_one',        'Added 1 instead of 10.'),
    _l42Choice('42', 'err_wrong_direction',   'Subtracted 10 instead of adding.'),
    _l42Choice('63', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Adding 10 means one more ten-rod. The tens digit goes up by 1.',
  intervention: _l42IntTenAsOne(52, '+', 62)
}),

_l42Q(42, {
  subSkill: 'add_10_equation', keyIdea: 1, difficulty: 'easy',
  prompt: '31 + 10 = ___',
  visual: _l42VisBase10(3, 1),
  answer: 41,
  choices: [
    _l42Choice('41', null),
    _l42Choice('32', 'err_ten_as_one',        'Added 1 instead of 10.'),
    _l42Choice('21', 'err_wrong_direction',   'Subtracted 10 instead of adding.'),
    _l42Choice('40', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Adding 10 means one more ten-rod.',
  intervention: _l42IntOnesChanged(31, '+', 41)
}),

// (q-043 through q-055: N from the set:
//  14, 25, 38, 43, 57, 61, 16, 47, 68, 22, 35, 49)

]; // end _l42QuizBank stub — to be extended in Tasks 5 and 6
```

Also update `lessons[1].quizBank` to `_l42QuizBank`:
```js
quizBank: _l42QuizBank,
```

- [ ] **Step 2: Run build**

```
node build.js
```
Expected: exits 0.

- [ ] **Step 3: Run jest**

```
npm test
```
Expected: all existing tests pass (nothing new breaks).

- [ ] **Step 4: Commit stub + C1–C3 representative questions**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l2): add C1–C3 easy questions scaffold (55 total once complete)"
```

> **Note to implementor:** Fill in all 55 easy questions (q-001 through q-055) before this commit. The examples above show 5 representative questions; expand to the full set using the number lists in the comments. Each question follows the same structure — vary N, compute correct answer, compute distractors.

---

### Task 5 — Medium questions (65)

**Files:**
- Modify: `src/data/g1/u4.js` (extend `_l42QuizBank`)

- [ ] **Step 1: Add C4 — Equation form −10 result (15 medium)**

```js
// ── C4: Equation form −10 result (medium, q-056 to q-070) ────────────────────

_l42Q(56, {
  subSkill: 'subtract_10_equation', keyIdea: 2, difficulty: 'medium',
  prompt: '63 − 10 = ___',
  visual: _l42VisBase10(6, 3),
  answer: 53,
  choices: [
    _l42Choice('53', null),
    _l42Choice('62', 'err_ten_as_one',        'Subtracted 1 instead of 10.'),
    _l42Choice('73', 'err_wrong_direction',   'Added 10 instead of subtracting.'),
    _l42Choice('52', 'err_ones_changed',      'Changed the ones digit.')
  ],
  hint: 'Subtracting 10 means one fewer ten-rod. The tens digit goes down by 1.',
  intervention: _l42IntTenAsOne(63, '-', 53)
}),

// (q-057 through q-070: N from the set:
//  28, 45, 71, 39, 57, 84, 62, 74, 23, 48, 36, 59, 77)
```

- [ ] **Step 2: Add C5 — Missing direction identification (15 medium)**

```js
// ── C5: Missing direction identification (medium, q-071 to q-085) ────────────
// Prompt: "Which number shows 10 more than N?" or "Which shows 10 less than N?"
// Choices vary — include one of each error type as realistic distractors

_l42Q(71, {
  subSkill: 'identify_direction', keyIdea: 4, difficulty: 'medium',
  prompt: 'Which number shows 10 more than 47?',
  visual: null,
  answer: 57,
  choices: [
    _l42Choice('57', null),
    _l42Choice('48', 'err_ten_as_one',        'Added 1 instead of 10.'),
    _l42Choice('37', 'err_wrong_direction',   '10 less, not 10 more.'),
    _l42Choice('74', 'err_place_value_confusion', 'Reversed the digits.')
  ],
  hint: '10 more means the tens digit goes up by 1. 47 → 57.',
  intervention: _l42IntWrongDirection(47, '+', 57)
}),

_l42Q(72, {
  subSkill: 'identify_direction', keyIdea: 5, difficulty: 'medium',
  prompt: 'Which number shows 10 less than 85?',
  visual: null,
  answer: 75,
  choices: [
    _l42Choice('75', null),
    _l42Choice('84', 'err_ten_as_one',        'Subtracted 1 instead of 10.'),
    _l42Choice('95', 'err_wrong_direction',   '10 more, not 10 less.'),
    _l42Choice('58', 'err_place_value_confusion', 'Rearranged the digits.')
  ],
  hint: '10 less means the tens digit goes down by 1. 85 → 75.',
  intervention: _l42IntWrongDirection(85, '-', 75)
}),

// (q-073 through q-085: alternate +10/−10 direction questions with N from:
//  32, 61, 24, 78, 43, 56, 19, 67, 35, 82, 51, 73)
```

- [ ] **Step 3: Add C6 — Ones-digit-stays-same conceptual (20 medium)**

```js
// ── C6: Ones-stay-same conceptual (medium, q-086 to q-105) ───────────────────
// Prompt: "In N + 10, what is the ones digit of the answer?"
// Choices: ones(N), ones(N)+1, tens(N), ones(N)-1

_l42Q(86, {
  subSkill: 'ones_digit_unchanged', keyIdea: 3, difficulty: 'medium',
  prompt: 'In 36 + 10, what is the ones digit of the answer?',
  visual: _l42VisBase10(3, 6),
  answer: 6,
  choices: [
    _l42Choice('6', null),
    _l42Choice('7', 'err_ones_changed',       'The ones digit does not change when you add 10.'),
    _l42Choice('4', 'err_place_value_confusion', 'That is the tens digit of 36, not the ones.'),
    _l42Choice('5', 'err_off_by_one',         'Off by one from the correct ones digit.')
  ],
  hint: 'Adding 10 only changes the tens digit. The ones digit stays the same.',
  intervention: _l42IntOnesChanged(36, '+', 46)
}),

_l42Q(87, {
  subSkill: 'ones_digit_unchanged', keyIdea: 3, difficulty: 'medium',
  prompt: 'In 72 − 10, what is the ones digit of the answer?',
  visual: _l42VisBase10(7, 2),
  answer: 2,
  choices: [
    _l42Choice('2', null),
    _l42Choice('3', 'err_ones_changed',       'The ones digit does not change when you subtract 10.'),
    _l42Choice('6', 'err_place_value_confusion', 'That is related to the tens digit, not ones.'),
    _l42Choice('1', 'err_off_by_one',         'Off by one from the correct ones digit.')
  ],
  hint: 'Subtracting 10 only changes the tens digit. The ones stay the same.',
  intervention: _l42IntOnesChanged(72, '-', 62)
}),

// (q-088 through q-105: N from set:
//  15, 43, 58, 61, 27, 34, 79, 52, 46, 83, 67, 24, 38, 71, 55, 29, 64, 47)
```

- [ ] **Step 4: Add C7 — Tens-digit-changes conceptual (15 medium)**

```js
// ── C7: Tens-digit-changes conceptual (medium, q-106 to q-120) ───────────────
// Prompt: "N + 10 = R. How many tens does R have?"
// Choices: tens(R), tens(N), tens(R)+1, ones(R)

_l42Q(106, {
  subSkill: 'tens_digit_changes', keyIdea: 1, difficulty: 'medium',
  prompt: '52 + 10 = 62. How many tens does 62 have?',
  visual: _l42VisBase10(6, 2),
  answer: 6,
  choices: [
    _l42Choice('6', null),
    _l42Choice('5', 'err_tens_not_changed',   'That is how many tens 52 had. After +10, it changed.'),
    _l42Choice('7', 'err_off_by_ten',         'That would be 72 — one too many.'),
    _l42Choice('2', 'err_place_value_confusion', 'That is the ones digit of 62, not the tens.')
  ],
  hint: 'Adding 10 adds one ten-rod. 52 has 5 tens → 62 has 6 tens.',
  intervention: _l42IntTensNotChanged(52, '+', 62)
}),

_l42Q(107, {
  subSkill: 'tens_digit_changes', keyIdea: 2, difficulty: 'medium',
  prompt: '74 − 10 = 64. How many tens does 64 have?',
  visual: _l42VisBase10(6, 4),
  answer: 6,
  choices: [
    _l42Choice('6', null),
    _l42Choice('7', 'err_tens_not_changed',   'That is how many tens 74 had. After −10, it changed.'),
    _l42Choice('5', 'err_off_by_ten',         'That would be 54 — one too few.'),
    _l42Choice('4', 'err_place_value_confusion', 'That is the ones digit of 64, not the tens.')
  ],
  hint: 'Subtracting 10 removes one ten-rod. 74 has 7 tens → 64 has 6 tens.',
  intervention: _l42IntTensNotChanged(74, '-', 64)
}),

// (q-108 through q-120: use N from:
//  31, 45, 68, 57, 23, 86, 49, 62, 75, 38, 54, 71, 46)
```

- [ ] **Step 5: Run build + tests**

```
node build.js
npm test
```
Expected: both pass.

- [ ] **Step 6: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l2): add C4–C7 medium questions (65 total once complete)"
```

> **Note to implementor:** Fill all 65 medium questions before this commit. The examples above are representative — expand each category to its full count using the number lists in comments.

---

### Task 6 — Hard questions (45)

**Files:**
- Modify: `src/data/g1/u4.js` (extend `_l42QuizBank`)

- [ ] **Step 1: Add C8 — Error repair (15 hard)**

```js
// ── C8: Error repair (hard, q-121 to q-135) ──────────────────────────────────
// Prompt: "A student says N + 10 = wrong. What is the correct answer?"
// The wrong value is always a known-error distractor; correct = N ± 10

_l42Q(121, {
  subSkill: 'error_repair', keyIdea: 1, difficulty: 'hard',
  prompt: 'A student says 48 + 10 = 49. What is the correct answer?',
  visual: null,
  answer: 58,
  choices: [
    _l42Choice('58', null),
    _l42Choice('49', 'err_ten_as_one',        'The student added 1 instead of 10 — that mistake.'),
    _l42Choice('38', 'err_wrong_direction',   'Subtracted instead of adding.'),
    _l42Choice('68', 'err_off_by_ten',        'Added 20 instead of 10.')
  ],
  hint: 'Adding 10 changes the tens digit by 1, not the ones digit. 48 → 58.',
  intervention: _l42IntTenAsOne(48, '+', 58)
}),

_l42Q(122, {
  subSkill: 'error_repair', keyIdea: 2, difficulty: 'hard',
  prompt: 'A student says 65 − 10 = 64. What is the correct answer?',
  visual: null,
  answer: 55,
  choices: [
    _l42Choice('55', null),
    _l42Choice('64', 'err_ten_as_one',        'The student subtracted 1 instead of 10 — that mistake.'),
    _l42Choice('75', 'err_wrong_direction',   'Added instead of subtracting.'),
    _l42Choice('45', 'err_off_by_ten',        'Subtracted 20 instead of 10.')
  ],
  hint: 'Subtracting 10 changes the tens digit by 1. 65 → 55.',
  intervention: _l42IntTenAsOne(65, '-', 55)
}),

// (q-123 through q-135: use N from:
//  37, 53, 82, 14, 76, 29, 61, 43, 58, 71, 25, 47, 69)
// Mix: ~8 with err_ten_as_one as the student's error, ~4 with err_ones_changed, ~3 with err_wrong_direction
```

- [ ] **Step 2: Add C9 — Boundary cases (15 hard)**

> **Before coding:** verify `_l42VisBase10(9, 0)` and `_l42VisBase10(10, 0)` render correctly in the browser. If `tens: 10` causes layout issues, use `visual: null` for those questions.

```js
// ── C9: Boundary cases (hard, q-136 to q-150) ────────────────────────────────
// N ∈ {80, 90, 100, 110, 120} — crossing into/out of 100

_l42Q(136, {
  subSkill: 'boundary_crossing', keyIdea: 6, difficulty: 'hard',
  prompt: '90 + 10 = ___',
  visual: _l42VisBase10(9, 0),
  answer: 100,
  choices: [
    _l42Choice('100', null),
    _l42Choice('910', 'err_boundary_100_confusion', 'Wrote the digits side by side instead of adding.'),
    _l42Choice('91',  'err_ten_as_one',             'Added 1 instead of 10.'),
    _l42Choice('80',  'err_wrong_direction',        'Subtracted instead of adding.')
  ],
  hint: '90 is 9 tens. 9 tens + 1 ten = 10 tens = 100.',
  intervention: _l42IntBoundary100(90, '+', 100)
}),

_l42Q(137, {
  subSkill: 'boundary_crossing', keyIdea: 6, difficulty: 'hard',
  prompt: '100 − 10 = ___',
  visual: _l42VisBase10(10, 0),
  answer: 90,
  choices: [
    _l42Choice('90',  null),
    _l42Choice('99',  'err_ten_as_one',             'Subtracted 1 instead of 10.'),
    _l42Choice('110', 'err_wrong_direction',        'Added instead of subtracting.'),
    _l42Choice('10',  'err_boundary_100_confusion', 'Confused the 1 in 100 with 1 ten.')
  ],
  hint: '100 is 10 tens. 10 tens − 1 ten = 9 tens = 90.',
  intervention: _l42IntBoundary100(100, '-', 90)
}),

_l42Q(138, {
  subSkill: 'boundary_crossing', keyIdea: 6, difficulty: 'hard',
  prompt: '110 + 10 = ___',
  visual: _l42VisBase10(11, 0),
  answer: 120,
  choices: [
    _l42Choice('120',  null),
    _l42Choice('111',  'err_ten_as_one',             'Added 1 instead of 10.'),
    _l42Choice('100',  'err_wrong_direction',        'Subtracted instead of adding.'),
    _l42Choice('1110', 'err_boundary_100_confusion', 'Wrote digits side by side.')
  ],
  hint: '110 is 11 tens. 11 tens + 1 ten = 12 tens = 120.',
  intervention: _l42IntBoundary100(110, '+', 120)
}),

// (q-139 through q-150: cover each boundary pair 2–3 times with varied framing:
//  80+10=90, 110-10=100, 120-10=110, 100+10=110
//  Also include non-zero-ones boundary: 95+10=105 — wait, 105 exceeds no constraint but
//  ones change is 5→5 (ones stay). Include a few like 91+10=101, 101-10=91.)
```

- [ ] **Step 3: Add C10 — Reverse operation (15 hard)**

```js
// ── C10: Reverse operation (hard, q-151 to q-165) ────────────────────────────
// Prompt: "___ + 10 = R. What number goes in the blank?"
// Correct = R - 10

_l42Q(151, {
  subSkill: 'reverse_operation', keyIdea: 1, difficulty: 'hard',
  prompt: '___ + 10 = 58. What number goes in the blank?',
  visual: _l42VisBase10(5, 8),
  answer: 48,
  choices: [
    _l42Choice('48', null),
    _l42Choice('57', 'err_ten_as_one',        'Subtracted 1 instead of 10 from the result.'),
    _l42Choice('68', 'err_wrong_direction',   'Added 10 to the result instead of subtracting.'),
    _l42Choice('38', 'err_off_by_ten',        'Subtracted 20 instead of 10.')
  ],
  hint: 'If adding 10 gives 58, the starting number is 10 less than 58.',
  intervention: _l42IntTenAsOne(48, '+', 58)
}),

_l42Q(152, {
  subSkill: 'reverse_operation', keyIdea: 2, difficulty: 'hard',
  prompt: '___ − 10 = 43. What number goes in the blank?',
  visual: _l42VisBase10(4, 3),
  answer: 53,
  choices: [
    _l42Choice('53', null),
    _l42Choice('44', 'err_ten_as_one',        'Added 1 instead of 10 to the result.'),
    _l42Choice('33', 'err_wrong_direction',   'Subtracted 10 from the result instead of adding.'),
    _l42Choice('63', 'err_off_by_ten',        'Added 20 instead of 10.')
  ],
  hint: 'If subtracting 10 gives 43, the starting number is 10 more than 43.',
  intervention: _l42IntTenAsOne(53, '-', 43)
}),

// (q-153 through q-165: alternate +10/−10 reverse with R from:
//  62, 35, 74, 27, 86, 53, 41, 68, 24, 79, 46, 57)
```

- [ ] **Step 4: Run build + full tests**

```
node build.js
npm test
node --test tests/g1-unit-quiz.test.js
```
Expected: all pass. `_l42QuizBank.length` should be 165 (verify in console or test).

- [ ] **Step 5: Commit**

```
git add src/data/g1/u4.js
git commit -m "feat(g1u4-l2): add C8–C10 hard questions — 165 total"
```

> **Note to implementor:** Fill all 45 hard questions before this commit.

---

### Task 7 — Count validation + regression

**Files:**
- Read only: `src/data/g1/u4.js`, test output

- [ ] **Step 1: Verify counts**

```
node -e "
  import('./src/data/g1/u4.js').then(m => {
    var l2 = m.G1_U4_SPEC.lessons[1];
    var qb = l2.quizBank;
    var e = qb.filter(q => q.difficulty === 'easy').length;
    var med = qb.filter(q => q.difficulty === 'medium').length;
    var h = qb.filter(q => q.difficulty === 'hard').length;
    console.log('L4.2 easy:', e, '(want 55)');
    console.log('L4.2 med:', med, '(want 65)');
    console.log('L4.2 hard:', h, '(want 45)');
    console.log('L4.2 total:', qb.length, '(want 165)');
    var l1 = m.G1_U4_SPEC.lessons[0];
    console.log('L4.1 total (must stay 170):', l1.quizBank.length);
  });
"
```

Expected output:
```
L4.2 easy: 55 (want 55)
L4.2 med: 65 (want 65)
L4.2 hard: 45 (want 45)
L4.2 total: 165 (want 165)
L4.1 total (must stay 170): 170
```

- [ ] **Step 2: Run all tests**

```
npm test
node --test tests/g1-unit-quiz.test.js
```
Expected: all pass.

- [ ] **Step 3: Run build and verify output file**

```
node build.js
```
Expected: `dist/data/g1/u4.js` emitted, no errors.

- [ ] **Step 4: Commit if any minor fixes were needed**

If counts were off, fix and re-run before committing.

```
git add src/data/g1/u4.js
git commit -m "fix(g1u4-l2): correct question counts to 55E/65M/45H=165"
```

---

### Task 8 — Browser verification

**No code changes — observation only.**

- [ ] Start the dev server and open the G1 lesson list
- [ ] Navigate to Unit 4 → Lesson 4.2
- [ ] Verify 6 key ideas render
- [ ] Verify 6 worked examples render (including boundary example with 90+10=100)
- [ ] Start the lesson quiz; answer the first question incorrectly
- [ ] Verify simple feedback shows (correct answer + hint)
- [ ] Answer a second question incorrectly
- [ ] Verify intervention overlay shows: title, teachingSteps, correctAnswerExplanation, base-10 teaching visual
- [ ] Click "Try a new one" — verify a different question loads (different N, same skill)
- [ ] Verify boundary questions (90+10=100, 100−10=90) render without visual artifacts
- [ ] Navigate to U1, U2, U3 — verify they still load with correct question counts
- [ ] Open browser console — verify zero errors

---

## Self-review against spec

| Spec requirement | Plan section | Status |
|---|---|---|
| Lesson title | §1 | ✓ |
| TEKS alignment | §2 | ✓ 1.5C confirmed |
| Skill name | §3 | ✓ ten_more_ten_less |
| Exact scope | §4 | ✓ |
| Out of scope | §5 | ✓ |
| Diff from L1.6 | §6 | ✓ detailed table |
| 5–6 key ideas | §7 | ✓ 6 ideas |
| 5–6 worked examples | §8 | ✓ 6 examples |
| Question categories | §9 | ✓ 10 categories |
| Target count (~165) | §10 | ✓ 165 |
| 55E/65M/45H | §11 | ✓ |
| Visual strategy | §12 | ✓ base10 + numberLine |
| Error tags (7) | §13 | ✓ all 7 specified |
| Intervention templates | §14 | ✓ all 7 functions |
| Retry behavior | §15 | ✓ same_skill_new_numbers |
| Risks | §16 | ✓ 8 risks identified |
| Verification checklist | §17 | ✓ 20+ checks |
| No word problems | §5 | ✓ explicitly excluded |
| No regrouping | §5 | ✓ explicitly excluded |
| Numbers ≤ 120 | §4 | ✓ TEKS 1.5C bound |
| err_ten_as_one | §13 | ✓ |
| err_wrong_direction | §13 | ✓ |
| err_ones_changed | §13 | ✓ |
| err_tens_not_changed | §13 | ✓ |
| err_off_by_ten | §13 | ✓ |
| err_place_value_confusion | §13 | ✓ |
| err_boundary_100_confusion | §13 | ✓ |
| base10 primary visual | §12 | ✓ |
| numberLine secondary visual | §12 | ✓ |
| Top visual = question | §12 | ✓ |
| Bottom visual = teaching | §12 | ✓ |
| +10: one more rod | §12, §14 | ✓ |
| −10: one fewer rod | §12, §14 | ✓ |
| Ones-stay-same interventions | §14 | ✓ in all 7 templates |
| doNotRepeatOriginalQuestion | §15 | ✓ |
| followUpRule same_skill | §15 | ✓ |
