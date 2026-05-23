# G1 Unit 4 Lesson 4.5 — Tens and Ones Word Problems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 170 single-step word problem questions to L4.5 in `src/data/g1/u4.js`, completing Unit 4 as the capstone lesson that applies L4.1–L4.4 skills in story contexts.

**Architecture:** All code lives in `src/data/g1/u4.js` (appended after the L4.4 block, before the `// ════ Spec` export section). Follows the exact same factory-function pattern as L4.1–L4.4: `_l45Q` factory, `_l45VisBase10`/`_l45TV`/`_l45C` helpers, 8 intervention factories, 10 category builders, data arrays, quiz bank assembly loop, worked examples array, then scaffold wiring in `G1_U4_SPEC.lessons[4]`.

**Tech Stack:** Vanilla ES5-style JS data file. No imports. No frameworks. Tests via Jest (`npm test`) and `node --test tests/g1-unit-quiz.test.js`.

---

## § 1 — Lesson Title

**Add Tens to Two-Digit Numbers → Tens and Ones Word Problems**

lessonId: `g1-u4-l5`

---

## § 2 — TEKS Alignment

| TEKS | Role | Description |
|------|------|-------------|
| **1.3A** | Primary | Use concrete and pictorial models to determine the sum of a multiple of 10 and a one-digit number in problems up to 99 |
| **1.5C** | Supporting | Determine the number that is 10 more and 10 less than a given number up to 120 |

teks array for questions and scaffold: `['1.3A', '1.5C']`

---

## § 3 — Skill Name

`tens_and_ones_word_problems`

---

## § 4 — Exact Scope

Every question is a **single-step word problem** using exactly one of these operations:

| Source | Operation | Example |
|--------|-----------|---------|
| L4.1 review | multiple of 10 + 1-digit | 40 + 6 = 46 |
| L4.2 review | N + 10 (10 more) | 37 + 10 = 47 |
| L4.2 review | N − 10 (10 less) | 68 − 10 = 58 |
| L4.3 review | tens + tens | 30 + 40 = 70 |
| L4.4 review | two-digit + tens | 24 + 20 = 44 |

Numbers within 99 unless a boundary case is explicitly justified. Boundary numbers (100–120) allowed only in C10 with proper hundreds visual.

---

## § 5 — Out of Scope

- Two-step word problems ("first...then", "after that")
- "How many more are needed" chaining
- Two-digit + two-digit with ones added (no 24 + 35)
- Regrouping / carrying / borrowing
- Vertical algorithm
- Subtraction with borrowing
- Three-digit operation problems
- Numbers above 120
- Legacy `src/data/u4.js` content (that is Grade 4)

**Hard guardrail:** Before approval, search the final bank for these strings in prompts — all must return 0 hits:
- `"first"`
- `"then"`
- `"after that"`
- `"two-step"`
- `"two_step"`
- `"how many more are needed"`

---

## § 6 — How L4.1–L4.4 Is Applied Without Multi-Step

Each question wraps **exactly one operation** from L4.1–L4.4 in a story context. The new skill is reading the story to identify start and change (TEKS 1.5G). The computation itself is the same single-step arithmetic students already know.

| What's new | What's the same |
|------------|----------------|
| Story context (characters, objects, action verb) | One-operation arithmetic |
| "Find what changed" reading comprehension | Tens-and-ones computation |
| "Add or subtract?" decision | No regrouping; ones digit rule |

Students do NOT need to perform two operations. They only need to (1) read, (2) identify operation, (3) compute.

---

## § 7 — Key Ideas (6)

```
'A word problem tells a math story — find the starting number and what changed.',
'When you add tens to a number, only the tens digit changes — the ones digit stays the same.',
'"10 more" means add 1 ten. "10 less" means take away 1 ten.',
'Adding tens to tens gives more tens — 30 + 40 = 70, not 7.',
'The ones digit in the answer always matches the ones digit in the starting number when you add or subtract whole tens.',
'Before solving, ask: What do I start with? What changes? Do I add or subtract?'
```

---

## § 8 — Worked Examples (6)

### Example 1 — C1: Add tens and ones story
```javascript
{
  title: 'ADD TENS AND ONES: STICKERS',
  prompt: 'Maya has 30 stickers. She gets 8 more stickers. How many stickers does she have now?',
  visual: { type: 'base10', tens: 3, ones: 0 },
  steps: [
    '30 stickers is 3 tens and 0 ones.',
    'She gets 8 more — that is 8 ones.',
    '3 tens + 8 ones = 38.',
    '30 + 8 = 38.'
  ],
  answer: '38'
}
```

### Example 2 — C2: 10 more story
```javascript
{
  title: '10 MORE: BOOKS ON A SHELF',
  prompt: 'There are 37 books on a shelf. The teacher adds 10 more books. How many books are there now?',
  visual: { type: 'base10', tens: 3, ones: 7 },
  steps: [
    '37 books is 3 tens and 7 ones.',
    'The teacher adds 10 more — that is 1 more ten.',
    '3 tens + 1 ten = 4 tens. The ones stay 7.',
    '37 + 10 = 47.'
  ],
  answer: '47'
}
```

### Example 3 — C3: 10 less story
```javascript
{
  title: '10 LESS: PENCILS TAKEN AWAY',
  prompt: 'There are 68 pencils. 10 pencils are taken away. How many pencils are left?',
  visual: { type: 'base10', tens: 6, ones: 8 },
  steps: [
    '68 pencils is 6 tens and 8 ones.',
    '10 pencils are taken away — that is 1 ten less.',
    '6 tens − 1 ten = 5 tens. The ones stay 8.',
    '68 − 10 = 58.'
  ],
  answer: '58'
}
```

### Example 4 — C4: Add multiples of 10 story
```javascript
{
  title: 'ADD TENS: BLOCKS IN TWO GROUPS',
  prompt: 'There are 30 red blocks and 40 blue blocks. How many blocks are there in all?',
  visual: { type: 'base10', tens: 3, ones: 0 },
  steps: [
    '30 red blocks is 3 tens.',
    '40 blue blocks is 4 tens.',
    '3 tens + 4 tens = 7 tens.',
    '7 tens = 70.',
    '30 + 40 = 70.'
  ],
  answer: '70'
}
```

### Example 5 — C5: Add tens to two-digit story
```javascript
{
  title: 'ADD TENS TO TWO-DIGIT: CRAYONS',
  prompt: 'A class has 24 crayons. The teacher gives them 20 more crayons. How many crayons do they have now?',
  visual: { type: 'base10', tens: 2, ones: 4 },
  steps: [
    '24 crayons is 2 tens and 4 ones.',
    '20 more is 2 more tens.',
    '2 tens + 2 tens = 4 tens. The ones stay 4.',
    '24 + 20 = 44.'
  ],
  answer: '44'
}
```

### Example 6 — C8: Missing number story
```javascript
{
  title: 'MISSING NUMBER: MARBLES ADDED',
  prompt: 'There are 35 marbles in a box. Some more marbles are added. Now there are 65. How many marbles were added?',
  visual: null,
  steps: [
    'We start with 35 marbles.',
    'We end with 65 marbles.',
    'Both numbers end in 5 — the ones did not change.',
    'The tens changed: 3 tens → 6 tens. That is 3 more tens.',
    '3 tens = 30. So 30 marbles were added.',
    '35 + 30 = 65. ✓'
  ],
  answer: '30'
}
```

---

## § 9 — Question Categories

| # | Name | Skill reviewed | Count | E | M | H |
|---|------|---------------|-------|---|---|---|
| C1 | Add tens and ones story | L4.1 | 25 | 20 | 5 | 0 |
| C2 | 10 more story | L4.2 | 20 | 15 | 5 | 0 |
| C3 | 10 less story | L4.2 | 15 | 10 | 5 | 0 |
| C4 | Add multiples of 10 story | L4.3 | 15 | 10 | 5 | 0 |
| C5 | Add tens to two-digit story | L4.4 | 20 | 0 | 15 | 5 |
| C6 | Match story to equation | mixed | 20 | 0 | 10 | 10 |
| C7 | Base-10 model story | mixed | 15 | 0 | 10 | 5 |
| C8 | Missing number story | mixed | 20 | 0 | 10 | 10 |
| C9 | Error repair story | mixed | 10 | 0 | 0 | 10 |
| C10 | Boundary story (sum 100–120) | L4.2/L4.4 | 10 | 0 | 0 | 10 |
| **Total** | | | **170** | **55** | **65** | **50** |

---

## § 10 — Target Question Count

**170 questions**

---

## § 11 — Easy / Medium / Hard Distribution

**55E / 65M / 50H**

Verification: 55 + 65 + 50 = 170 ✓

---

## § 12 — Visual Strategy

| Category | Question visual | Intervention visual (TRY IT THIS WAY) |
|----------|----------------|---------------------------------------|
| C1 (easy) | `base10{tens, ones=0}` — starting tens stack | `base10{tens, ones}` — answer with ones added |
| C1 (medium) | text-only | `base10` of answer |
| C2 | `base10{tens, ones}` of start | `base10{tens+1, ones}` — after +10 |
| C3 | `base10{tens, ones}` of start | `base10{tens-1, ones}` — after −10 |
| C4 | `base10{tens, ones=0}` of first addend | `base10{tens1+tens2, ones=0}` — combined |
| C5 | `base10{tens, ones}` of start | `base10{tens+addedTens, ones}` — answer |
| C6 | text-only | `base10` of start |
| C7 | `base10{tens, ones}` — story model | `base10` of answer |
| C8 | text-only | `base10` of answer |
| C9 | text-only | `base10` of correct answer |
| C10 | text-only | `base10{hundreds:1, tens, ones}` (hundreds block) |

**numberLine:** Skip entirely — not verified working in this codebase. Use base10 for all C2/C3 visuals.

**Visual schema recap:**
- Question visual: `{ type: 'base10', tens: N, ones: K }` (or `null` for text-only)
- Teaching visual: `{ type: 'base10', config: { tens: N, ones: K, label: '...' } }`
- Boundary: `{ type: 'base10', config: { hundreds: 1, tens: T, ones: 0, label: '...' } }`

---

## § 13 — Error Tags (7)

| Tag | Trigger |
|-----|---------|
| `err_word_problem_setup` | Student misidentified start number or the change |
| `err_operation_swap` | Added when should subtract, or subtracted when should add |
| `err_ten_as_one` | Treated the tens value as ones (e.g., +30 → +3) |
| `err_ones_changed` | Changed the ones digit when only tens should change |
| `err_missing_tens_value` | Used only the digit, not the full tens value (20 → 2) |
| `err_place_value_confusion` | General place-value breakdown |
| `err_boundary_100_confusion` | Confused at the 100 boundary |

---

## § 14 — Intervention Templates (8 factories)

Each factory returns an object merged into the question's `intervention` field.
The factories are named `_l45Int*` and called inside each category builder.

### Factory 1: `_l45IntWordProblemSetup(startN, change, answer, op)`
```javascript
function _l45IntWordProblemSetup(startN, change, answer, op) {
  var opStr = op === 'sub' ? ' − ' : ' + ';
  return {
    errorTag: 'err_word_problem_setup',
    title: 'Read the story again — find the start and the change',
    teachingSteps: [
      'Read the story from the beginning.',
      'Find the starting number — the number you begin with: ' + startN + '.',
      'Find what changes — ' + (op === 'sub' ? 'some are taken away: ' : 'more are added: ') + change + '.',
      'Write the equation: ' + startN + opStr + change + ' = ?',
      'Solve: ' + startN + opStr + change + ' = ' + answer + '.'
    ],
    correctAnswerExplanation: 'Starting number: ' + startN + '. Change: ' + (op === 'sub' ? '−' : '+') + change + '. Answer: ' + answer + '.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(startN / 10), ones: startN % 10, label: 'Start: ' + startN } }
  };
}
```

### Factory 2: `_l45IntOperationSwap(startN, change, answer, op)`
```javascript
function _l45IntOperationSwap(startN, change, answer, op) {
  var keyword = op === 'sub' ? '"taken away" or "less"' : '"gets more," "adds," or "joins"';
  var opStr = op === 'sub' ? ' − ' : ' + ';
  return {
    errorTag: 'err_operation_swap',
    title: 'Check the story — did you add or subtract?',
    teachingSteps: [
      'Read the action in the story.',
      'Words like "gets more," "adds," or "joins" mean addition (+).',
      'Words like "takes away," "lost," or "removed" mean subtraction (−).',
      'This story uses ' + keyword + '.',
      'So: ' + startN + opStr + change + ' = ' + answer + '.'
    ],
    correctAnswerExplanation: startN + opStr + change + ' = ' + answer + '. The story tells you to ' + (op === 'sub' ? 'subtract' : 'add') + '.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(answer / 10), ones: answer % 10, label: 'Answer: ' + answer } }
  };
}
```

### Factory 3: `_l45IntTenAsOne(startN, mTens, answer)`
```javascript
function _l45IntTenAsOne(startN, mTens, answer) {
  return {
    errorTag: 'err_ten_as_one',
    title: mTens + ' means ' + (mTens / 10) + ' tens — not ' + (mTens / 10) + ' ones',
    teachingSteps: [
      'The number you added is ' + mTens + '.',
      mTens + ' is not ' + (mTens / 10) + ' — it is ' + (mTens / 10) + ' tens.',
      'Add the tens: count up the tens rods.',
      'The ones digit stays the same.',
      startN + ' + ' + mTens + ' = ' + answer + '.'
    ],
    correctAnswerExplanation: mTens + ' = ' + (mTens / 10) + ' tens. ' + startN + ' + ' + mTens + ' = ' + answer + '.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(answer / 10), ones: answer % 10, label: 'Answer: ' + answer } }
  };
}
```

### Factory 4: `_l45IntOnesChanged(startN, mTens, answer)`
```javascript
function _l45IntOnesChanged(startN, mTens, answer) {
  var ones = startN % 10;
  return {
    errorTag: 'err_ones_changed',
    title: 'When you add tens, the ones stay the same',
    teachingSteps: [
      'Look at the ones digit in ' + startN + ': it is ' + ones + '.',
      'Adding ' + mTens + ' only changes the tens digit.',
      'The ones digit stays ' + ones + ' — it never changes.',
      'Count up the tens: ' + Math.floor(startN / 10) + ' + ' + (mTens / 10) + ' = ' + Math.floor(answer / 10) + ' tens.',
      'Answer: ' + Math.floor(answer / 10) + ' tens and ' + ones + ' ones = ' + answer + '.'
    ],
    correctAnswerExplanation: 'Ones stay ' + ones + '. Tens: ' + Math.floor(startN / 10) + ' + ' + (mTens / 10) + ' = ' + Math.floor(answer / 10) + '. Answer: ' + answer + '.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(answer / 10), ones: ones, label: 'Ones stay ' + ones } }
  };
}
```

### Factory 5: `_l45IntMissingTensValue(startN, mTens, answer)`
```javascript
function _l45IntMissingTensValue(startN, mTens, answer) {
  return {
    errorTag: 'err_missing_tens_value',
    title: 'Use the full number — ' + mTens + ', not ' + (mTens / 10),
    teachingSteps: [
      'The amount added is ' + mTens + '.',
      'Do not use just the digit ' + (mTens / 10) + ' — use the full value ' + mTens + '.',
      'Add the full amount: ' + startN + ' + ' + mTens + '.',
      'Count up the tens rods: ' + Math.floor(startN / 10) + ' + ' + (mTens / 10) + ' = ' + Math.floor(answer / 10) + ' tens.',
      'Answer: ' + answer + '.'
    ],
    correctAnswerExplanation: startN + ' + ' + mTens + ' = ' + answer + '. Always add the full tens value.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(answer / 10), ones: answer % 10, label: 'Add full ' + mTens } }
  };
}
```

### Factory 6: `_l45IntPlaceValueConfusion(startN, mTens, answer)`
```javascript
function _l45IntPlaceValueConfusion(startN, mTens, answer) {
  var startTens = Math.floor(startN / 10), startOnes = startN % 10;
  var addTens = mTens / 10;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Break it into tens and ones, then add',
    teachingSteps: [
      'Break ' + startN + ' into tens and ones: ' + startTens + ' tens and ' + startOnes + ' ones.',
      'We are adding ' + mTens + ' — that is ' + addTens + ' tens.',
      'Add the tens: ' + startTens + ' + ' + addTens + ' = ' + (startTens + addTens) + ' tens.',
      'Keep the ones: ' + startOnes + ' ones.',
      'Put them together: ' + (startTens + addTens) + ' tens and ' + startOnes + ' ones = ' + answer + '.'
    ],
    correctAnswerExplanation: startN + ' + ' + mTens + ' = ' + answer + '. Add tens to tens, keep the ones.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(answer / 10), ones: startOnes, label: startTens + '+' + addTens + ' tens' } }
  };
}
```

### Factory 7: `_l45IntBoundary100(startN, mTens, answer)`
```javascript
function _l45IntBoundary100(startN, mTens, answer) {
  var ansH = Math.floor(answer / 100), ansT = Math.floor((answer % 100) / 10), ansO = answer % 10;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: 'At 100, 10 tens become 1 hundred',
    teachingSteps: [
      'We start with ' + startN + ' — that is ' + Math.floor(startN / 10) + ' tens.',
      'We add ' + mTens + ' — that is ' + (mTens / 10) + ' more ten' + (mTens > 10 ? 's' : '') + '.',
      Math.floor(startN / 10) + ' + ' + (mTens / 10) + ' = ' + (Math.floor(startN / 10) + mTens / 10) + ' tens.',
      '10 tens = 1 hundred = 100.',
      'Answer: ' + answer + ' — that is ' + ansH + ' hundred' + (ansT ? ', ' + ansT + ' ten' + (ansT > 1 ? 's' : '') : '') + (ansO ? ', ' + ansO + ' ones' : '') + '.'
    ],
    correctAnswerExplanation: startN + ' + ' + mTens + ' = ' + answer + '. 10 tens trade for 1 hundred.',
    teachingVisual: { type: 'base10', config: { hundreds: ansH, tens: ansT, ones: ansO, label: 'Answer: ' + answer } }
  };
}
```

### Factory 8: `_l45IntTwoStepConfusion(startN, change, answer, op)` *(reference only — not registered in diagnostics; no questions naturally produce this error)*
```javascript
function _l45IntTwoStepConfusion(startN, change, answer, op) {
  var opStr = op === 'sub' ? ' − ' : ' + ';
  return {
    errorTag: 'err_two_step_confusion',
    title: 'This is one step — find the start and the change',
    teachingSteps: [
      'Read the story one more time.',
      'This problem only asks you to do one thing.',
      'Starting number: ' + startN + '.',
      'Change: ' + (op === 'sub' ? '−' : '+') + change + '.',
      startN + opStr + change + ' = ' + answer + '. Done.'
    ],
    correctAnswerExplanation: 'One step only: ' + startN + opStr + change + ' = ' + answer + '.',
    teachingVisual: { type: 'base10', config: { tens: Math.floor(answer / 10), ones: answer % 10, label: 'Answer: ' + answer } }
  };
}
```

---

## § 15 — Retry Behavior

Every question has:
```javascript
intervention: {
  ...factoryResult,
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
}
```

The `_l45Q` factory auto-merges these defaults via `Object.assign`.

---

## § 16 — Risks Before Coding

1. **Two-step creep (C8 missing number):** The constraint that "ones digit must match in start and end" enforces single-step-ness. Verify each C8 datum: `startOnes === endOnes`. Any datum violating this must be removed.

2. **C6 equation matching distractors:** Each wrong equation must represent a real misconception (wrong operation, off-by-ten, ten-as-one). Never use two equations that are equivalent (commutativity).

3. **C10 boundary visual schema:** Use `{ hundreds:1, tens:T, ones:O }` same as L4.3 C9. Verify before coding that the renderer handles this — it was confirmed for L4.3.

4. **"first/then" language creep:** Writers (and generators) naturally reach for sequential language. Do a full string search after writing all prompts. Zero tolerance.

5. **Subtraction distractors for C3:** The distractor for "10 less" should avoid producing a negative number. All C3 start values must be ≥ 10.

6. **C9 error student mistakes:** The claimed student answer must be a plausible distracter that a child would actually pick — not random. Each must map to exactly one error tag.

7. **Error tag coverage:** All 8 tags must appear at least once in the bank. Verify after assembly.

---

## § 17 — Verification Checklist

After implementation, verify ALL of the following before reporting complete:

```
[ ] 1.  `err_start_num_confusion` → 0 occurrences in entire L4.5 block
[ ] 2.  All 7 approved error tags appear in the bank
[ ] 3.  Guardrail strings → 0 hits in all L4.5 prompt fields:
          "first", "then", "after that", "two-step", "two_step", "how many more are needed"
[ ] 4.  No two-digit + two-digit with ones added (no N+M where both have ones > 0)
[ ] 5.  No regrouping, no carrying in any answer
[ ] 6.  170 questions total
[ ] 7.  55 easy / 65 medium / 50 hard
[ ] 8.  All 170 questions have a complete intervention object
[ ] 9.  U4 pool = 845 (675 + 170)
[ ] 10. `npm test` → 130/130 Jest
[ ] 11. `node --test tests/g1-unit-quiz.test.js` → 29/29
[ ] 12. `npm run build` → clean
[ ] 13. Browser: L4.5 lesson page loads, 6 key ideas visible, 6 worked examples visible
[ ] 14. Browser: quiz starts (8 questions from L4.5 pool)
[ ] 15. Browser: base10 visuals render on visual questions
[ ] 16. Browser: intervention overlay — all 7 panels verified
[ ] 17. Browser: "Try a new one" → lessonIdx=4 held, new L4.5 question served
[ ] 18. Browser: no console errors
[ ] 19. L4.1/L4.2/L4.3/L4.4 regression: each still loads and quizzes start
```

---

## File Structure

**One file modified:** `src/data/g1/u4.js`

Insert the entire L4.5 block between the closing `];` of `_l44Examples` and the `// ════ Spec` comment — same insertion point used for L4.4.

---

## Implementation Tasks

---

### Task 1: Scaffold Helpers and Core Factory

**Files:**
- Modify: `src/data/g1/u4.js` (after L4.4 block, before `// ════ Spec`)

- [ ] **Step 1.1: Identify insertion point**

  Find the line: `// ════ Spec` and insert the entire L4.5 block above it.
  The block starts with:
  ```javascript
  // ════ Lesson 4.5 — Tens and Ones Word Problems ════
  ```

- [ ] **Step 1.2: Write the helpers and core factory**

  ```javascript
  // ════ Lesson 4.5 — Tens and Ones Word Problems ════
  // Skill: tens_and_ones_word_problems · TEKS 1.3A, 1.5C
  // 170q: 55E/65M/50H across 10 categories

  function _l45Q(n, o) {
    return {
      id: 'g1-u4-l5-q-' + String(n).padStart(3, '0'),
      teks: o.teks || ['1.3A', '1.5C'],
      lessonId: 'g1-u4-l5',
      skill: 'tens_and_ones_word_problems',
      subSkill: o.subSkill, keyIdea: o.keyIdea, difficulty: o.difficulty,
      interactionType: 'multipleChoice', prompt: o.prompt,
      visual: o.visual || null, answer: String(o.answer),
      choices: o.choices, hint: o.hint,
      intervention: Object.assign({ followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true }, o.intervention)
    };
  }

  function _l45VisBase10(tens, ones) { return { type: 'base10', tens: tens, ones: ones }; }

  function _l45TV(tens, ones, label) {
    return { type: 'base10', config: { tens: tens, ones: ones, label: label || '' } };
  }

  function _l45TVH(hundreds, tens, ones, label) {
    return { type: 'base10', config: { hundreds: hundreds, tens: tens, ones: ones, label: label || '' } };
  }

  function _l45C(val, errorTag, misconception) {
    return { value: String(val), correct: false, errorTag: errorTag, misconceptionExplanation: misconception };
  }
  ```

- [ ] **Step 1.3: Verify insertion compiles**

  Run: `node -e "import('./src/data/g1/u4.js').then(m=>console.log('ok')).catch(e=>console.error(e.message))"` from `E:\Cameron Jones\mymathroots-v1.1`.
  Expected: `ok` (no syntax errors).

- [ ] **Step 1.4: Commit**

  ```
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.5 scaffold helpers and core factory"
  ```

---

### Task 2: Intervention Factories (8)

**Files:**
- Modify: `src/data/g1/u4.js` (append after Task 1 code)

- [ ] **Step 2.1: Write all 8 factories**

  Copy exactly from § 14 above. The 8 factories in order:
  1. `_l45IntWordProblemSetup(startN, change, answer, op)`
  2. `_l45IntOperationSwap(startN, change, answer, op)`
  3. `_l45IntTenAsOne(startN, mTens, answer)`
  4. `_l45IntOnesChanged(startN, mTens, answer)`
  5. `_l45IntMissingTensValue(startN, mTens, answer)`
  6. `_l45IntPlaceValueConfusion(startN, mTens, answer)`
  7. `_l45IntBoundary100(startN, mTens, answer)`
  8. `_l45IntTwoStepConfusion(startN, change, answer, op)`

  All code is in § 14. Copy verbatim.

- [ ] **Step 2.2: Syntax check**

  Run: `node -e "import('./src/data/g1/u4.js').then(()=>console.log('ok')).catch(e=>console.error(e.message))"`
  Expected: `ok`

- [ ] **Step 2.3: Commit**

  ```
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.5 intervention factories (8)"
  ```

---

### Task 3: Category Builders and C1–C4 Data (75 questions)

**Files:**
- Modify: `src/data/g1/u4.js`

#### Builder `_l45MkC1(tens0, ones, n, diff)`
Single-step: `tens0 × 10 + ones = answer`. Story: "X has [tens0×10]. Gets [ones] more."

```javascript
function _l45MkC1(tens0, ones, n, diff) {
  var start = tens0 * 10, answer = start + ones;
  var w1 = start + (ones === 9 ? ones - 1 : ones + 1);       // off-by-one in ones
  var w2 = (tens0 + 1) * 10 + ones;                           // added extra ten
  var w3 = tens0 * 10 + (ones === 0 ? 1 : 0);                 // ten-as-one: added 0 ones
  var contexts = [
    ['Maya', 'stickers', 'she gets', 'does she have now'],
    ['Liam', 'marbles', 'he collects', 'does he have now'],
    ['Sofia', 'crayons', 'she finds', 'does she have now'],
    ['The class', 'books', 'the teacher adds', 'are there now']
  ];
  var ctx = contexts[n % contexts.length];
  return _l45Q(n, {
    subSkill: 'add_tens_and_ones_story', keyIdea: 0, difficulty: diff,
    prompt: ctx[0] + ' has ' + start + ' ' + ctx[1] + '. ' + ctx[2].charAt(0).toUpperCase() + ctx[2].slice(1) + ' ' + ones + ' more ' + ctx[1] + '. How many ' + ctx[1] + ' ' + ctx[3] + '?',
    visual: diff === 'easy' ? _l45VisBase10(tens0, 0) : null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_ones_changed', 'Off by one in the ones digit.'),
      _l45C(w2, 'err_place_value_confusion', 'Added an extra ten instead of ones.'),
      _l45C(w3, 'err_ten_as_one', 'Added tens instead of ones.')
    ],
    hint: start + ' + ' + ones + ' = ? Only the ones change.',
    intervention: _l45IntWordProblemSetup(start, ones, answer, 'add')
  });
}
```

#### Data arrays for C1

```javascript
// C1 Easy (20): [tens0, ones] — start is multiple of 10, add 1–9 ones
var _l45_E_C1 = [
  [1,3],[1,5],[1,7],[1,9],[2,1],[2,4],[2,6],[2,8],
  [3,2],[3,5],[3,7],[4,1],[4,3],[4,6],[4,9],
  [5,2],[5,4],[6,1],[6,3],[7,2]
];
// C1 Medium (5): same shape but less common contexts
var _l45_M_C1 = [
  [3,9],[5,7],[6,6],[7,4],[8,3]
];
```

#### Builder `_l45MkC2(start, n, diff)`
10 more: `start + 10 = answer`. Story: "There are [start]. 10 more added. How many now?"

```javascript
function _l45MkC2(start, n, diff) {
  var answer = start + 10;
  var w1 = start + 1;      // err_ten_as_one: added 1 instead of 10
  var w2 = start - 10;     // err_operation_swap: subtracted instead
  var w3 = start + 20;     // err_off_by_ten (added 20)
  var contexts = [
    ['books on a shelf', 'the teacher adds 10 more books', 'books are there'],
    ['crayons in a box', '10 more crayons are put in', 'crayons are in the box'],
    ['stickers on a page', '10 more stickers are added', 'stickers are there'],
    ['pencils in a cup', '10 more pencils are placed in', 'pencils are in the cup']
  ];
  var ctx = contexts[n % contexts.length];
  return _l45Q(n, {
    subSkill: 'ten_more_story', keyIdea: 1, difficulty: diff,
    prompt: 'There are ' + start + ' ' + ctx[0] + '. ' + ctx[1].charAt(0).toUpperCase() + ctx[1].slice(1) + '. How many ' + ctx[2] + ' now?',
    visual: diff === 'easy' ? _l45VisBase10(Math.floor(start / 10), start % 10) : null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_ten_as_one', 'Added 1 instead of 10.'),
      _l45C(w2, 'err_operation_swap', 'Subtracted 10 instead of adding.'),
      _l45C(w3, 'err_place_value_confusion', 'Added 20 instead of 10.')
    ],
    hint: start + ' + 10: add 1 ten to the tens digit.',
    intervention: _l45IntTenAsOne(start, 10, answer)
  });
}
```

#### Data arrays for C2

```javascript
// C2 Easy (15): [start] — start 10–79 (result ≤ 89 for simplicity)
var _l45_E_C2 = [12, 23, 34, 15, 26, 37, 48, 19, 41, 52, 63, 27, 38, 45, 56];
// C2 Medium (5): start 20–79
var _l45_M_C2 = [72, 64, 55, 47, 33];
```

#### Builder `_l45MkC3(start, n, diff)`
10 less: `start − 10 = answer`. Story: "There are [start]. 10 taken away. How many left?"

```javascript
function _l45MkC3(start, n, diff) {
  var answer = start - 10;
  var w1 = start - 1;    // err_ten_as_one: subtracted 1 instead of 10
  var w2 = start + 10;   // err_operation_swap: added instead
  var w3 = start - 20;   // err_off_by_ten: subtracted 20
  var contexts = [
    ['pencils', '10 pencils are taken away', 'pencils are left'],
    ['apples', '10 apples are eaten', 'apples are left'],
    ['cards', '10 cards are removed', 'cards are left'],
    ['beads', '10 beads fall off', 'beads are left']
  ];
  var ctx = contexts[n % contexts.length];
  return _l45Q(n, {
    subSkill: 'ten_less_story', keyIdea: 2, difficulty: diff,
    prompt: 'There are ' + start + ' ' + ctx[0] + '. ' + ctx[1].charAt(0).toUpperCase() + ctx[1].slice(1) + '. How many ' + ctx[2] + '?',
    visual: diff === 'easy' ? _l45VisBase10(Math.floor(start / 10), start % 10) : null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_ten_as_one', 'Subtracted 1 instead of 10.'),
      _l45C(w2, 'err_operation_swap', 'Added 10 instead of subtracting.'),
      _l45C(w3, 'err_place_value_confusion', 'Subtracted 20 instead of 10.')
    ],
    hint: start + ' − 10: subtract 1 ten from the tens digit.',
    intervention: _l45IntOperationSwap(start, 10, answer, 'sub')
  });
}
```

#### Data arrays for C3

```javascript
// C3 Easy (10): [start] — start ≥ 20 so result ≥ 10
var _l45_E_C3 = [28, 35, 46, 57, 63, 74, 85, 92, 41, 68];
// C3 Medium (5)
var _l45_M_C3 = [53, 77, 89, 62, 44];
```

#### Builder `_l45MkC4(t1, t2, n, diff)`
Multiples-of-10 story: `t1×10 + t2×10 = answer`. Story: "[t1×10] of X and [t2×10] of Y. How many in all?"

```javascript
function _l45MkC4(t1, t2, n, diff) {
  var a1 = t1 * 10, a2 = t2 * 10, answer = a1 + a2;
  var w1 = t1 + t2;           // err_ten_as_one: added digits only
  var w2 = answer + 10;       // err_off_by_ten
  var w3 = answer - 10;       // err_off_by_ten
  var pairs = [
    ['red blocks', 'blue blocks', 'blocks'],
    ['apples', 'oranges', 'pieces of fruit'],
    ['crayons', 'markers', 'art supplies'],
    ['pennies', 'nickels', 'coins']
  ];
  var p = pairs[n % pairs.length];
  return _l45Q(n, {
    subSkill: 'add_multiples_of_10_story', keyIdea: 3, difficulty: diff,
    prompt: 'There are ' + a1 + ' ' + p[0] + ' and ' + a2 + ' ' + p[1] + '. How many ' + p[2] + ' are there in all?',
    visual: diff === 'easy' ? _l45VisBase10(t1, 0) : null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_ten_as_one', 'Added the tens digits only, not the full values.'),
      _l45C(w2, 'err_place_value_confusion', 'Off by one ten too many.'),
      _l45C(w3, 'err_place_value_confusion', 'Off by one ten too few.')
    ],
    hint: a1 + ' + ' + a2 + ': count the tens — ' + t1 + ' + ' + t2 + ' = ' + (t1+t2) + ' tens.',
    intervention: _l45IntTenAsOne(a1, a2, answer)
  });
}
```

#### Data arrays for C4

```javascript
// C4 Easy (10): [t1, t2] — both mult of 10, sum ≤ 90
var _l45_E_C4 = [[1,2],[1,3],[2,3],[1,4],[2,4],[3,4],[1,5],[2,5],[1,6],[3,3]];
// C4 Medium (5)
var _l45_M_C4 = [[4,4],[2,6],[3,5],[4,5],[3,6]];
```

- [ ] **Step 3.1: Write builders and data arrays for C1–C4 exactly as above**

- [ ] **Step 3.2: Write the assembly stubs (will be completed in Task 5)**

  ```javascript
  var _l45QuizBank = [];
  var _l45N = 0;
  ```

- [ ] **Step 3.3: Assemble C1–C4 into quiz bank**

  ```javascript
  _l45_E_C1.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC1(p[0], p[1], _l45N, 'easy')); });
  _l45_M_C1.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC1(p[0], p[1], _l45N, 'medium')); });
  _l45_E_C2.forEach(function(s) { _l45N++; _l45QuizBank.push(_l45MkC2(s, _l45N, 'easy')); });
  _l45_M_C2.forEach(function(s) { _l45N++; _l45QuizBank.push(_l45MkC2(s, _l45N, 'medium')); });
  _l45_E_C3.forEach(function(s) { _l45N++; _l45QuizBank.push(_l45MkC3(s, _l45N, 'easy')); });
  _l45_M_C3.forEach(function(s) { _l45N++; _l45QuizBank.push(_l45MkC3(s, _l45N, 'medium')); });
  _l45_E_C4.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC4(p[0], p[1], _l45N, 'easy')); });
  _l45_M_C4.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC4(p[0], p[1], _l45N, 'medium')); });
  // After this: _l45N = 75
  ```

- [ ] **Step 3.4: Syntax check**

  Run: `node -e "import('./src/data/g1/u4.js').then(()=>console.log('ok')).catch(e=>console.error(e.message))"`
  Expected: `ok`

- [ ] **Step 3.5: Spot-check C1–C4 counts via console**

  ```
  node -e "
    import('./src/data/g1/u4.js').then(m => {
      var spec = m.default;
      var l5 = spec.lessons[4];
      console.log('qb:', l5.quizBank.length);
    });
  "
  ```
  Expected: `qb: 75`

- [ ] **Step 3.6: Commit**

  ```
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.5 C1-C4 questions (75)"
  ```

---

### Task 4: Category Builders and C5–C8 Data (75 questions)

**Files:**
- Modify: `src/data/g1/u4.js`

#### Builder `_l45MkC5(startN, mTens, n, diff)`
Add tens to two-digit story. `startN + mTens = answer`. `startN` has ones ≠ 0.

```javascript
function _l45MkC5(startN, mTens, n, diff) {
  var answer = startN + mTens;
  var startOnes = startN % 10;
  var w1 = startN + (mTens / 10);    // err_ten_as_one
  var w2 = answer + 10;               // err_off_by_ten
  var w3 = (Math.floor(startN/10) + mTens/10) * 10; // err_ones_changed
  var contexts = [
    ['A class has', 'crayons', 'the teacher gives them', 'more crayons', 'crayons do they have'],
    ['A shelf has', 'books', 'a librarian adds', 'more books', 'books are on the shelf'],
    ['A jar has', 'marbles', 'more marbles are poured in', '', 'marbles are in the jar'],
    ['A box holds', 'stickers', 'someone puts in', 'more stickers', 'stickers are in the box']
  ];
  var ctx = contexts[n % contexts.length];
  var promptAdded = ctx[3] ? mTens + ' ' + ctx[3] : mTens + ' more ' + ctx[1];
  return _l45Q(n, {
    subSkill: 'add_tens_to_two_digit_story', keyIdea: 1, difficulty: diff,
    prompt: ctx[0] + ' ' + startN + ' ' + ctx[1] + '. ' + ctx[2].charAt(0).toUpperCase() + ctx[2].slice(1) + ' ' + promptAdded + '. How many ' + ctx[4] + ' now?',
    visual: _l45VisBase10(Math.floor(startN / 10), startOnes),
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_ten_as_one', 'Added the tens digit as ones.'),
      _l45C(w2, 'err_off_by_ten', 'Added one extra ten.'),
      _l45C(w3, 'err_ones_changed', 'Changed the ones digit instead of keeping it.')
    ],
    hint: startN + ' + ' + mTens + ': add ' + (mTens/10) + ' ten' + (mTens > 10 ? 's' : '') + '. Ones stay ' + startOnes + '.',
    intervention: _l45IntOnesChanged(startN, mTens, answer)
  });
}
```

#### Data arrays for C5

```javascript
// C5 Medium (15): [startN, mTens] — startN ones ≠ 0, sum ≤ 99
var _l45_M_C5 = [
  [13,20],[24,10],[35,30],[46,20],[57,10],
  [23,40],[34,30],[45,20],[61,10],[72,20],
  [16,50],[27,40],[38,30],[51,20],[43,10]
];
// C5 Hard (5): larger starts, boundary-adjacent
var _l45_H_C5 = [
  [64,30],[75,20],[53,40],[82,10],[67,20]
];
```

#### Builder `_l45MkC6(startN, change, sumVal, equation, n, diff, op)`
Match story to equation. Given 4 equations, pick the correct one.

```javascript
function _l45MkC6(startN, change, sumVal, n, diff, op) {
  var opSym = op === 'sub' ? '−' : '+';
  var correctEq = startN + ' ' + opSym + ' ' + change + ' = ' + sumVal;
  var wrongOp = op === 'sub'
    ? startN + ' + ' + change + ' = ' + (startN + change)
    : startN + ' − ' + change + ' = ' + (startN - change);
  var wrongNum1 = startN + ' ' + opSym + ' ' + (change * 2) + ' = ' + (op === 'sub' ? startN - change*2 : startN + change*2);
  var wrongNum2 = (startN + 10) + ' ' + opSym + ' ' + change + ' = ' + (op === 'sub' ? startN + 10 - change : startN + 10 + change);
  var contexts = [
    ['Liam has {S} cards. He gets {C} more.', 'add'],
    ['There are {S} books. The teacher removes {C}.', 'sub'],
    ['A box has {S} pencils. {C} more are added.', 'add'],
    ['There are {S} apples. {C} are eaten.', 'sub']
  ];
  var ctx = contexts[n % contexts.length];
  var story = ctx[0].replace('{S}', startN).replace('{C}', change);
  return _l45Q(n, {
    subSkill: 'match_story_to_equation', keyIdea: 5, difficulty: diff,
    prompt: 'Which equation matches this story? "' + story + '"',
    visual: null,
    answer: correctEq,
    choices: [
      { value: correctEq, correct: true },
      _l45C(wrongOp, 'err_operation_swap', 'Wrong operation — check if the story adds or subtracts.'),
      _l45C(wrongNum1, 'err_missing_tens_value', 'Wrong number — check the amount that changed.'),
      _l45C(wrongNum2, 'err_word_problem_setup', 'Wrong starting number — re-read the story.')
    ],
    hint: 'Find the starting number. Find what changed. Choose + or −.',
    intervention: _l45IntWordProblemSetup(startN, change, sumVal, op)
  });
}
```

#### Data arrays for C6

```javascript
// C6 Medium (10): [startN, change, sum, op]
var _l45_M_C6 = [
  [50, 7, 57, 'add'],[37, 10, 47, 'add'],[30, 40, 70, 'add'],
  [24, 20, 44, 'add'],[68, 10, 58, 'sub'],[45, 30, 75, 'add'],
  [56, 10, 46, 'sub'],[20, 6, 26, 'add'],[80, 10, 70, 'sub'],[63, 20, 83, 'add']
];
// C6 Hard (10)
var _l45_H_C6 = [
  [75, 20, 95, 'add'],[43, 30, 73, 'add'],[52, 10, 42, 'sub'],
  [40, 8, 48, 'add'],[66, 10, 56, 'sub'],[31, 40, 71, 'add'],
  [84, 10, 74, 'sub'],[57, 30, 87, 'add'],[72, 20, 92, 'add'],[49, 10, 39, 'sub']
];
```

#### Builder `_l45MkC7(startN, mTens, n, diff, op)`
Base-10 model story: visual shows starting amount, student picks answer.

```javascript
function _l45MkC7(startN, change, n, diff, op) {
  var answer = op === 'sub' ? startN - change : startN + change;
  var w1 = op === 'sub' ? startN + change : startN - change; // swapped op
  var w2 = answer + 10;
  var w3 = answer - 10;
  var contexts = [
    ['The model shows {S} students in a class.', '{C} more students join.', '{C} students leave.'],
    ['The model shows {S} stickers on a sheet.', '{C} more stickers are added.', '{C} stickers are removed.']
  ];
  var ctx = contexts[n % contexts.length];
  var action = op === 'sub' ? ctx[2] : ctx[1];
  return _l45Q(n, {
    subSkill: 'base10_model_story', keyIdea: 0, difficulty: diff,
    prompt: ctx[0].replace('{S}', startN) + ' ' + action.replace('{C}', change) + ' How many are there now?',
    visual: _l45VisBase10(Math.floor(startN / 10), startN % 10),
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_operation_swap', 'Used the wrong operation.'),
      _l45C(w2, 'err_place_value_confusion', 'Off by one ten too many.'),
      _l45C(w3, 'err_place_value_confusion', 'Off by one ten too few.')
    ],
    hint: 'Count the tens and ones in the model. Then ' + (op === 'sub' ? 'subtract.' : 'add.'),
    intervention: op === 'sub'
      ? _l45IntOperationSwap(startN, change, answer, 'sub')
      : _l45IntPlaceValueConfusion(startN, change, answer)
  });
}
```

#### Data arrays for C7

```javascript
// C7 Medium (10): [startN, change, op]
var _l45_M_C7 = [
  [23,10,'add'],[45,20,'add'],[37,10,'sub'],[56,30,'add'],
  [64,10,'sub'],[31,40,'add'],[78,10,'sub'],[22,50,'add'],[83,10,'sub'],[44,20,'add']
];
// C7 Hard (5)
var _l45_H_C7 = [
  [47,30,'add'],[66,20,'add'],[72,10,'sub'],[55,30,'add'],[83,20,'add']
];
```

#### Builder `_l45MkC8(startN, mTens, n, diff)`
Missing number: `startN + mTens = endN`. Student finds mTens.
Constraint: `startN % 10 === endN % 10` (ones match — no borrowing needed).

```javascript
function _l45MkC8(startN, mTens, n, diff) {
  var endN = startN + mTens;
  var answer = mTens;
  var w1 = endN;          // err_word_problem_setup: gave end number
  var w2 = startN;        // err_word_problem_setup: gave start number
  var w3 = mTens + 10;    // err_off_by_ten
  var obj = ['marbles', 'stickers', 'crayons', 'books'][n % 4];
  return _l45Q(n, {
    subSkill: 'missing_number_story', keyIdea: 5, difficulty: diff,
    prompt: 'There are ' + startN + ' ' + obj + '. Some more ' + obj + ' are added. Now there are ' + endN + '. How many ' + obj + ' were added?',
    visual: null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_word_problem_setup', 'Gave the ending total instead of the change.'),
      _l45C(w2, 'err_word_problem_setup', 'Gave the starting number instead of the change.'),
      _l45C(w3, 'err_off_by_ten', 'Off by one ten in the answer.')
    ],
    hint: endN + ' − ' + startN + ' = ? The ones match, so only tens changed.',
    intervention: _l45IntMissingTensValue(startN, mTens, endN)
  });
}
```

#### Data arrays for C8

All pairs satisfy: `startN % 10 === (startN + mTens) % 10` (ones unchanged). `mTens` ∈ {10, 20, 30, 40, 50}.

```javascript
// C8 Medium (10): [startN, mTens]
var _l45_M_C8 = [
  [15,20],[23,30],[34,10],[42,40],[51,30],
  [16,20],[27,40],[35,30],[43,20],[62,10]
];
// C8 Hard (10)
var _l45_H_C8 = [
  [38,40],[47,30],[56,20],[64,10],[73,20],
  [25,50],[33,40],[44,30],[52,40],[61,30]
];
```

- [ ] **Step 4.1: Write builders and data arrays for C5–C8 exactly as above**

- [ ] **Step 4.2: Append assembly for C5–C8 to the quiz bank loop**

  ```javascript
  _l45_M_C5.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC5(p[0], p[1], _l45N, 'medium')); });
  _l45_H_C5.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC5(p[0], p[1], _l45N, 'hard')); });
  _l45_M_C6.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC6(p[0], p[1], p[2], _l45N, 'medium', p[3])); });
  _l45_H_C6.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC6(p[0], p[1], p[2], _l45N, 'hard', p[3])); });
  _l45_M_C7.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC7(p[0], p[1], _l45N, 'medium', p[2])); });
  _l45_H_C7.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC7(p[0], p[1], _l45N, 'hard', p[2])); });
  _l45_M_C8.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC8(p[0], p[1], _l45N, 'medium')); });
  _l45_H_C8.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC8(p[0], p[1], _l45N, 'hard')); });
  // After this: _l45N = 150
  ```

- [ ] **Step 4.3: Syntax check and count**

  ```
  node -e "
    import('./src/data/g1/u4.js').then(m => {
      var l5 = m.default.lessons[4];
      console.log('qb:', l5.quizBank.length);
    });
  "
  ```
  Expected: `qb: 150`

- [ ] **Step 4.4: Commit**

  ```
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.5 C5-C8 questions (75, running total 150)"
  ```

---

### Task 5: C9–C10, Worked Examples, Key Ideas, Wire Scaffold

**Files:**
- Modify: `src/data/g1/u4.js`

#### Builder `_l45MkC9(startN, mTens, studentWrong, errorTag, n)`
Error repair story. Always hard.

```javascript
function _l45MkC9(startN, mTens, studentWrong, errorTag, n) {
  var answer = startN + mTens;
  var obj = ['crayons', 'stickers', 'marbles', 'books'][n % 4];
  var verb = ['gets', 'collects', 'receives', 'finds'][n % 4];
  var w2 = answer + 10;
  var w3 = answer - 10;
  return _l45Q(n, {
    subSkill: 'error_repair_story', keyIdea: 5, difficulty: 'hard',
    prompt: 'A student says ' + startN + ' + ' + mTens + ' = ' + studentWrong + ' because they added wrong. What is the correct answer?',
    visual: null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(studentWrong, errorTag, 'This is the mistake the student made.'),
      _l45C(w2, 'err_off_by_ten', 'Off by one extra ten.'),
      _l45C(w3, 'err_off_by_ten', 'Off by one ten too few.')
    ],
    hint: startN + ' + ' + mTens + ': add ' + (mTens / 10) + ' ten' + (mTens > 10 ? 's' : '') + '. Ones stay ' + (startN % 10) + '.',
    intervention: _l45IntTenAsOne(startN, mTens, answer)
  });
}
```

#### Data arrays for C9

Each entry: `[startN, mTens, studentWrong, errorTag]`.
`studentWrong` reflects the specific error.

```javascript
// C9 Hard (10): error-repair stories
var _l45_H_C9 = [
  // err_ten_as_one: +30 treated as +3
  [43, 30, 46, 'err_ten_as_one'],
  [52, 20, 54, 'err_ten_as_one'],
  // err_ones_changed: ones digit changed
  [27, 40, 60, 'err_ones_changed'],  // student dropped ones: 20+40=60
  [34, 20, 50, 'err_ones_changed'],  // student got 50 (dropped ones)
  // err_missing_tens_value: only used digit
  [61, 30, 64, 'err_missing_tens_value'], // 61+3
  [45, 20, 47, 'err_missing_tens_value'], // 45+2
  // err_operation_swap: subtracted
  [56, 30, 26, 'err_operation_swap'],
  [73, 20, 53, 'err_operation_swap'],
  // err_place_value_confusion
  [38, 40, 42, 'err_place_value_confusion'], // 38+4
  [65, 30, 68, 'err_place_value_confusion']  // 65+3
];
```

#### Builder `_l45MkC10(startN, mTens, n)`
Boundary story: sum = 100, 110, or 120. Always hard.

```javascript
function _l45MkC10(startN, mTens, n) {
  var answer = startN + mTens;
  var ansH = Math.floor(answer / 100);
  var ansT = Math.floor((answer % 100) / 10);
  var ansO = answer % 10;
  var w1 = answer - 10;   // forgot one ten
  var w2 = answer - 1;    // off by one (ones confusion)
  var w3 = 10;            // err_ten_as_one: only the added amount
  var obj = ['tickets', 'stickers', 'blocks', 'cards'][n % 4];
  return _l45Q(n, {
    subSkill: 'boundary_story', keyIdea: 1, difficulty: 'hard',
    prompt: 'There are ' + startN + ' ' + obj + '. ' + mTens + ' more ' + obj + ' are added. How many ' + obj + ' are there now?',
    visual: null,
    answer: answer,
    choices: [
      { value: String(answer), correct: true },
      _l45C(w1, 'err_off_by_ten', 'Off by one ten — counted the added tens wrong.'),
      _l45C(w2, 'err_boundary_100_confusion', 'Off by one — did not trade 10 tens for 1 hundred.'),
      _l45C(w3, 'err_ten_as_one', 'Only wrote the added amount, not the total.')
    ],
    hint: startN + ' + ' + mTens + ' = ' + answer + '. 10 tens = 1 hundred.',
    intervention: _l45IntBoundary100(startN, mTens, answer)
  });
}
```

#### Data arrays for C10

```javascript
// C10 Hard (10): [startN, mTens] — answer is 100, 110, or 120
var _l45_H_C10 = [
  [90, 10, 100], [80, 20, 100], [70, 30, 100],
  [60, 40, 100], [50, 50, 100],
  [100, 10, 110], [90, 20, 110], [80, 30, 110],
  [100, 20, 120], [90, 30, 120]
];
```

Note: `_l45MkC10` takes `[startN, mTens]` — adjust builder call to ignore third element (it's for documentation).

- [ ] **Step 5.1: Write builders and data arrays for C9–C10 exactly as above**

- [ ] **Step 5.2: Append assembly for C9–C10**

  ```javascript
  _l45_H_C9.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC9(p[0], p[1], p[2], p[3], _l45N)); });
  _l45_H_C10.forEach(function(p) { _l45N++; _l45QuizBank.push(_l45MkC10(p[0], p[1], _l45N)); });
  // After this: _l45N = 170 ✓
  ```

- [ ] **Step 5.3: Write `_l45Examples` array**

  ```javascript
  var _l45Examples = [
    {
      title: 'ADD TENS AND ONES: STICKERS',
      prompt: 'Maya has 30 stickers. She gets 8 more stickers. How many stickers does she have now?',
      visual: { type: 'base10', tens: 3, ones: 0 },
      steps: [
        '30 stickers is 3 tens and 0 ones.',
        'She gets 8 more — that is 8 ones.',
        '3 tens + 8 ones = 38.',
        '30 + 8 = 38.'
      ],
      answer: '38'
    },
    {
      title: '10 MORE: BOOKS ON A SHELF',
      prompt: 'There are 37 books on a shelf. The teacher adds 10 more books. How many books are there now?',
      visual: { type: 'base10', tens: 3, ones: 7 },
      steps: [
        '37 books is 3 tens and 7 ones.',
        'The teacher adds 10 more — that is 1 more ten.',
        '3 tens + 1 ten = 4 tens. The ones stay 7.',
        '37 + 10 = 47.'
      ],
      answer: '47'
    },
    {
      title: '10 LESS: PENCILS TAKEN AWAY',
      prompt: 'There are 68 pencils. 10 pencils are taken away. How many pencils are left?',
      visual: { type: 'base10', tens: 6, ones: 8 },
      steps: [
        '68 pencils is 6 tens and 8 ones.',
        '10 pencils are taken away — that is 1 ten less.',
        '6 tens − 1 ten = 5 tens. The ones stay 8.',
        '68 − 10 = 58.'
      ],
      answer: '58'
    },
    {
      title: 'ADD TENS: BLOCKS IN TWO GROUPS',
      prompt: 'There are 30 red blocks and 40 blue blocks. How many blocks are there in all?',
      visual: { type: 'base10', tens: 3, ones: 0 },
      steps: [
        '30 red blocks is 3 tens.',
        '40 blue blocks is 4 tens.',
        '3 tens + 4 tens = 7 tens.',
        '7 tens = 70.',
        '30 + 40 = 70.'
      ],
      answer: '70'
    },
    {
      title: 'ADD TENS TO TWO-DIGIT: CRAYONS',
      prompt: 'A class has 24 crayons. The teacher gives them 20 more crayons. How many crayons do they have now?',
      visual: { type: 'base10', tens: 2, ones: 4 },
      steps: [
        '24 crayons is 2 tens and 4 ones.',
        '20 more is 2 more tens.',
        '2 tens + 2 tens = 4 tens. The ones stay 4.',
        '24 + 20 = 44.'
      ],
      answer: '44'
    },
    {
      title: 'MISSING NUMBER: MARBLES ADDED',
      prompt: 'There are 35 marbles in a box. Some more marbles are added. Now there are 65. How many marbles were added?',
      visual: null,
      steps: [
        'We start with 35 marbles.',
        'We end with 65 marbles.',
        'Both numbers end in 5 — the ones did not change.',
        'The tens changed: 3 tens → 6 tens. That is 3 more tens.',
        '3 tens = 30. So 30 marbles were added.',
        '35 + 30 = 65. ✓'
      ],
      answer: '30'
    }
  ];
  ```

- [ ] **Step 5.4: Wire the L4.5 scaffold in `G1_U4_SPEC.lessons[4]`**

  Find and replace the existing L4.5 scaffold:
  ```javascript
  // BEFORE:
  {
    lessonId: 'g1-u4-l5',
    title: 'Tens and Ones Word Problems',
    teks: ['1.3A', '1.5D'],
    skill: 'tens_and_ones_word_problems',
    allowedQuestionTypes: ['multipleChoice'],
    keyIdeas: [],
    workedExamples: [],
    quizBank: [],
    diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
  }

  // AFTER:
  {
    lessonId: 'g1-u4-l5',
    title: 'Tens and Ones Word Problems',
    teks: ['1.3A', '1.5C'],
    skill: 'tens_and_ones_word_problems',
    allowedQuestionTypes: ['multipleChoice'],
    keyIdeas: [
      'A word problem tells a math story — find the starting number and what changed.',
      'When you add tens to a number, only the tens digit changes — the ones digit stays the same.',
      '"10 more" means add 1 ten. "10 less" means take away 1 ten.',
      'Adding tens to tens gives more tens — 30 + 40 = 70, not 7.',
      'The ones digit in the answer always matches the ones digit in the starting number when you add or subtract whole tens.',
      'Before solving, ask: What do I start with? What changes? Do I add or subtract?'
    ],
    workedExamples: _l45Examples,
    quizBank: _l45QuizBank,
    diagnostics: {
      commonDistractors: [],
      errorTags: [
        'err_word_problem_setup', 'err_operation_swap', 'err_ten_as_one',
        'err_ones_changed', 'err_missing_tens_value', 'err_place_value_confusion',
        'err_boundary_100_confusion'
      ],
      interventionRules: [
        { tag: 'err_word_problem_setup',       followUp: 'same_skill_new_numbers' },
        { tag: 'err_operation_swap',            followUp: 'same_skill_new_numbers' },
        { tag: 'err_ten_as_one',                followUp: 'same_skill_new_numbers' },
        { tag: 'err_ones_changed',              followUp: 'same_skill_new_numbers' },
        { tag: 'err_missing_tens_value',        followUp: 'same_skill_new_numbers' },
        { tag: 'err_place_value_confusion',     followUp: 'same_skill_new_numbers' },
        { tag: 'err_boundary_100_confusion',    followUp: 'same_skill_new_numbers' }
      ]
    }
  }
  ```

- [ ] **Step 5.5: Update file header**

  Update the header comment at the top of u4.js:
  ```
  L4.5  Tens and Ones Word Problems         ← COMPLETE (170 questions)
  ```
  (It currently reads `← SCAFFOLD (0 questions)`)

- [ ] **Step 5.6: Final count verification**

  ```
  node -e "
    import('./src/data/g1/u4.js').then(m => {
      var spec = m.default;
      var l5 = spec.lessons[4];
      var pool = spec.lessons.reduce(function(a,l){ return a.concat(l.quizBank||[]); }, []);
      var e = l5.quizBank.filter(function(q){return q.difficulty==='easy';}).length;
      var md = l5.quizBank.filter(function(q){return q.difficulty==='medium';}).length;
      var h = l5.quizBank.filter(function(q){return q.difficulty==='hard';}).length;
      console.log('l5 total:', l5.quizBank.length, '| E:', e, 'M:', md, 'H:', h, '| U4 pool:', pool.length);
    });
  "
  ```
  Expected: `l5 total: 170 | E: 55 M: 65 H: 50 | U4 pool: 845`

- [ ] **Step 5.7: Run guardrail search**

  ```
  node -e "
    import('./src/data/g1/u4.js').then(m => {
      var l5 = m.default.lessons[4];
      var flags = ['first', 'then', 'after that', 'two-step', 'two_step', 'how many more are needed'];
      flags.forEach(function(f) {
        var hits = l5.quizBank.filter(function(q){ return q.prompt.toLowerCase().indexOf(f) !== -1; });
        if (hits.length) console.error('FAIL: \"' + f + '\" found in ' + hits.length + ' prompts');
        else console.log('ok: \"' + f + '\" → 0 hits');
      });
    });
  "
  ```
  Expected: 6 lines starting with `ok:`

- [ ] **Step 5.8: Commit**

  ```
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.5 C9-C10, worked examples, key ideas, scaffold wired"
  ```

---

### Task 6: Tests, Build, Browser Verification, Final Commit

**Files:**
- No file changes in this task — verify only.

- [ ] **Step 6.1: Run Jest**

  ```
  cd "E:\Cameron Jones\mymathroots-v1.1"
  npm test
  ```
  Expected: `Tests: 130 passed, 130 total`

- [ ] **Step 6.2: Run g1-unit-quiz tests**

  ```
  node --test tests/g1-unit-quiz.test.js
  ```
  Expected: `# pass 29 # fail 0`

- [ ] **Step 6.3: Run build**

  ```
  npm run build
  ```
  Expected: `🚀 Build complete → dist/` (no errors)

- [ ] **Step 6.4: Browser — lesson page loads**

  Navigate to L4.5 in browser (via `openLesson(3, 4)` in console after `show('home'); buildHome()`).
  Verify:
  - Title: "Tens and Ones Word Problems" (or with icon)
  - TEKS banner includes 1.5G
  - 6 key ideas visible
  - 6 worked examples visible, first example has base10 visual

- [ ] **Step 6.5: Browser — quiz starts**

  Call `startLessonQuiz(3, 4)` in console.
  Verify:
  - Quiz shows "Question 1 of 8"
  - First question is a word problem prompt (story context)
  - `CUR.lessonIdx === 4`

- [ ] **Step 6.6: Browser — intervention overlay**

  Answer wrong twice in a row.
  Verify all 7 panels:
  - title ✓
  - THE QUESTION ✓
  - WHY IT WAS TRICKY ✓
  - teaching steps ✓
  - correct answer explanation ✓
  - TRY IT THIS WAY visual ✓
  - "Try a new one →" button ✓

- [ ] **Step 6.7: Browser — Try a new one**

  Click "Try a new one →".
  Verify in console: `CUR.lessonIdx === 4` and new question is from L4.5 (`CUR.quiz.questions[CUR.quiz.idx].lessonId === 'g1-u4-l5'`).

- [ ] **Step 6.8: Browser — no console errors**

  Check: `mcp__Claude_Preview__preview_console_logs(level: 'error')` → No real errors.

- [ ] **Step 6.9: Browser — U4 pool count**

  ```javascript
  UNITS_DATA[3].lessons.reduce(function(a,l){return a+(l.quizBank?l.quizBank.length:0);}, 0)
  ```
  Expected: `845`

- [ ] **Step 6.10: Regression — L4.1/L4.2/L4.3/L4.4 still work**

  Call `openLesson(3, 0)` through `openLesson(3, 3)` in sequence. Confirm lesson page loads for each.

- [ ] **Step 6.11: Final commit**

  ```
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): Lesson 4.5 Tens and Ones Word Problems — 170 questions, full intervention coverage"
  ```

---

## Self-Review

### Spec Coverage Check

| Spec requirement | Covered in |
|-----------------|-----------|
| 170 questions | Tasks 3–5, § 10 |
| 55E/65M/50H | § 11, category tables |
| All 10 categories | § 9, Tasks 3–5 |
| TEKS 1.3A + 1.5C | § 2, Task 5 scaffold |
| 6 key ideas | § 7, Task 5.3 |
| 6 worked examples | § 8, Task 5.3 |
| 8 error tags | § 13, Task 2 |
| 8 intervention factories | § 14, Task 2 |
| Guardrail search | Task 5.7 |
| Two-step guardrail | § 5, § 16 |
| numberLine: skip | § 12 |
| Boundary visual schema | § 12, builder C10 |
| U4 pool = 845 | Task 6.9 |
| Full browser verify | Task 6.4–6.10 |
| `err_two_step_confusion` removed from diagnostics | Factory 8 kept as reference code only. Not in errorTags or interventionRules — no questions naturally produce this error, and no fake two-step distractors were added. |

### Placeholder Scan

No TBDs, no "similar to Task N" shortcuts, no missing code blocks. All data arrays contain real number pairs. All builders contain complete JavaScript.

### Type Consistency

- `_l45Q` factory used in every builder ✓
- `_l45C` choice helper used in every builder ✓
- `_l45VisBase10` / `_l45TV` / `_l45TVH` used consistently ✓
- `_l45QuizBank` assembled by all forEach loops ✓
- `_l45Examples` referenced in scaffold ✓
- All 8 intervention factories return objects with `errorTag`, `title`, `teachingSteps`, `correctAnswerExplanation`, `teachingVisual` ✓

---

Plan complete and saved to `docs/superpowers/plans/2026-05-08-g1u4-l5-tens-and-ones-word-problems.md`.

**Wait for approval before implementing.**
