# Grade 1 Unit 4 · Lesson 4.4 — Add Tens to Two-Digit Numbers · Design Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Status:** PLANNING ONLY — no code yet. Awaiting approval before implementation.
> **Scope of this document:** content/design plan + TDD task breakdown.

**Goal:** Add 170 questions to the existing `g1-u4-l4` scaffold in `src/data/g1/u4.js` covering the skill of adding a multiple of 10 to a two-digit number (24 + 30 = 54), with full intervention coverage and browser-verified correctness.

**Architecture:** All content lives in `src/data/g1/u4.js` alongside L4.1–L4.3 — no new files. The scaffold for `g1-u4-l4` already exists with `lessonId: 'g1-u4-l4'` and an empty `quizBank`. Implementation replaces that empty array with 170 questions and fills `keyIdeas` and `workedExamples`. Tests live in `tests/g1-unit-quiz.test.js` (existing file, append L4.4 assertions).

**Tech Stack:** Vanilla JS (ES5-style factory functions, `var` declarations, `G1_U4_SPEC` export), Jest for unit tests, Node.js `node:test` for quiz-structure tests, browser manual verification.

---

## 1. Lesson title

**Add Tens to Two-Digit Numbers**

---

## 2. TEKS alignment

- **Primary:** TEKS 1.3A — Use concrete and pictorial models to determine the sum of a multiple of 10 and a one-digit number in problems up to 99.

`teks: ['1.3A']` (already set in scaffold).

> Scope note: TEKS 1.3A focuses on multiples of 10 combined with a known starting value. L4.4 applies this to two-digit starting numbers (ones digit > 0) plus an added multiple of 10. Sums stay ≤ 99 throughout. No 100-result boundary cases in L4.4 — crossing into hundreds is reserved for L4.3 C9 which is already approved.

---

## 3. Skill name

`skill: 'add_tens_to_two_digit'` (already set in scaffold)

Sub-skills used on individual questions:

| subSkill | Category |
|---|---|
| `add_ten_direct` | C1 |
| `add_tens_direct` | C2 |
| `equation_to_answer` | C3 |
| `model_to_result` | C4 |
| `missing_tens_addend` | C5 |
| `missing_start_number` | C6 |
| `ones_stay_same` | C7 |
| `tens_change` | C8 |
| `error_repair` | C9 |
| `boundary_high_sum` | C10 |

---

## 4. Exact scope

A single skill: **adding a multiple of 10 to a two-digit number**, using place-value reasoning — the tens digit of the starting number increases by the count of added tens; the ones digit never changes.

Allowed problem shapes:

- `N + M = ?` where N is a two-digit number with ones digit > 0, M ∈ {10, 20, 30, 40}, sum ≤ 99
- `N + M = ?` with visual model showing N's base-10 blocks
- `N + __ = sum` — missing tens addend
- `__ + M = sum` — missing starting number
- `In N + M, what happens to the ones digit?` — conceptual identification
- `N + M changes _ tens to _ tens. What number is that?` — tens-change identification
- `A student says N + M = wrong. What is correct?` — error repair
- Boundary: sums in range 90–99 (e.g., 89 + 10 = 99, 69 + 30 = 99)

Constraints on N:
- N is always a two-digit number: tens digit ∈ {1..7}, ones digit ∈ {1..9}
- Selected so that N + M ≤ 99 (N's tens digit + M/10 ≤ 9)

Constraints on M:
- M ∈ {10, 20, 30, 40} only
- M is never 0 and never has a ones component

---

## 5. What stays out of scope

Hard guardrails — none of these may appear in any L4.4 question:

- ❌ Two-digit + two-digit where both have ones digits (e.g., 24 + 35 — Grade 2)
- ❌ Single-digit addend (e.g., 24 + 5 — that is L4.1 territory)
- ❌ Multiples-of-10 + multiples-of-10 with no ones (e.g., 30 + 40 — that is L4.3)
- ❌ Regrouping or carrying (sum's ones digit always equals N's ones digit)
- ❌ Vertical algorithm / column layout
- ❌ Subtraction or "10 less" as the main skill (missing-addend questions are still addition)
- ❌ Word problems (L4.5)
- ❌ Sums above 99 (no 100-result boundary for L4.4)
- ❌ Three-digit numbers in prompts
- ❌ M = 50, 60, 70, 80, 90 (too large; would require tens digit ≥ 6 in starting number to stay ≤ 99, restricting pool too much)
- ❌ Ones digit of N = 0 (that would make N itself a multiple of 10, which is L4.3 territory)
- ❌ Any content from `src/data/u4.js` (Grade 4 file)

---

## 6. How this differs from L4.1, L4.2, and L4.3

| Dimension | L4.1 | L4.2 | L4.3 | **L4.4** |
|---|---|---|---|---|
| Starting addend A | Multiple of 10 (10–90) | Any two-digit N | Multiple of 10 (10–90) | **Two-digit N with ones ≠ 0** |
| Added amount B | One-digit (1–9) | Exactly 10 (or −10) | Multiple of 10 (10–90) | **Multiple of 10 (10, 20, 30, 40)** |
| Ones in result | Yes (= B) | Yes (= N's ones, unchanged) | No (result ends in 0) | **Yes (= N's ones, unchanged)** |
| Tens in result | = A/10 | = N's tens ± 1 | = (A+B)/10 | **= N's tens + M/10** |
| Main error | Digit-only adding (40+5→9) | Wrong direction / ones changed | Digit-only adding (30+40→7) | **Adding M as ones (47+20→49)** |
| Key insight | Tens and ones live in different places | Only tens digit changes ±1 | Both numbers ARE tens — add the tens | **Ones are frozen; only tens grow** |
| Visual shape | X rods + Y cubes | X rods + Y cubes (Y unchanged) | X rods only (no cubes) | **X rods + Y cubes + added rods** |

**L4.4 is not a duplicate of L4.2:** L4.2 always adds exactly 10 and focuses on the +10/−10 pattern. L4.4 adds 10, 20, 30, or 40 and focuses on the general rule that ones stay frozen while tens grow by M/10.

**L4.4 is not a duplicate of L4.3:** L4.3 has no ones digit in either addend. L4.4's starting number always has a non-zero ones digit. The student must track two separate components.

**L4.4 is not a duplicate of L4.1:** L4.1 builds a two-digit number from parts (tens rod + ones cubes). L4.4 starts from a complete two-digit number and extends its tens — a fundamentally different operation.

---

## 7. Key ideas (6)

1. **"Adding tens only changes the tens digit — the ones digit stays the same."**
2. **"In 47 + 20, the 7 stays. Only the tens change: 4 tens + 2 tens = 6 tens."**
3. **"47 + 20 = 67, not 49. Adding 20 means adding 2 tens, not 2 ones."**
4. **"Adding 10 moves the tens digit up by 1. Adding 20 moves it up by 2. Adding 30 moves it up by 3."**
5. **"To add tens to a two-digit number, count up the tens rods and keep the ones cubes exactly as they were."**
6. **"The ones digit in the answer always matches the ones digit in the starting number."**

---

## 8. Worked examples (6)

| id | prompt | visual | key idea |
|---|---|---|---|
| g1-u4-l4-ex-1 | What is 24 + 10? | base10 {t:2, o:4} | KI 1, KI 4 |
| g1-u4-l4-ex-2 | What is 36 + 20? | base10 {t:3, o:6} | KI 1, KI 2 |
| g1-u4-l4-ex-3 | What is 47 + 30? | base10 {t:4, o:7} | KI 1, KI 5 |
| g1-u4-l4-ex-4 | 35 + ___ = 65. What is the missing number? | null | KI 4 |
| g1-u4-l4-ex-5 | A student says 47 + 20 = 49. What is the correct answer? | null | KI 3 |
| g1-u4-l4-ex-6 | 62 + 20: what digit stays the same? What digit changes? | null | KI 1, KI 6 |

**Example 1 steps (24 + 10):**
1. "24 has 2 tens and 4 ones."
2. "We are adding 10 — that is 1 ten."
3. "2 tens + 1 ten = 3 tens. The ones stay: 4 ones."
4. "3 tens and 4 ones = 34. 24 + 10 = 34."

**Example 2 steps (36 + 20):**
1. "36 has 3 tens and 6 ones."
2. "We are adding 20 — that is 2 tens."
3. "3 tens + 2 tens = 5 tens. The ones stay: 6 ones."
4. "5 tens and 6 ones = 56. 36 + 20 = 56."

**Example 3 steps (47 + 30):**
1. "47 has 4 tens and 7 ones."
2. "We are adding 30 — that is 3 tens."
3. "4 tens + 3 tens = 7 tens. The ones stay: 7 ones."
4. "7 tens and 7 ones = 77. 47 + 30 = 77."

**Example 4 steps (35 + __ = 65):**
1. "65 has 6 tens and 5 ones."
2. "We started with 35 — that is 3 tens and 5 ones."
3. "The ones are the same (5 = 5), so only the tens changed."
4. "6 tens − 3 tens = 3 tens. 3 tens = 30. The missing number is 30."

**Example 5 steps (error repair: 47 + 20 = 49):**
1. "The student said 47 + 20 = 49."
2. "They added 20 as if it were 2 ones: 7 + 2 = 9. That is wrong."
3. "20 is not 2 ones — it is 2 tens."
4. "47 has 4 tens. Add 2 more tens: 4 + 2 = 6 tens."
5. "6 tens and 7 ones = 67. The correct answer is 67."

**Example 6 steps (conceptual: 62 + 20):**
1. "62 + 20: look at the ones digit. It is 2."
2. "Does adding 20 (2 tens) change the ones? No — ones stay the same."
3. "The ones digit in the answer is still 2."
4. "62 has 6 tens. Adding 20 gives 6 + 2 = 8 tens."
5. "The tens digit changes from 6 to 8. Answer: 82."

---

## 9. Question categories

Ten categories across three difficulty bands.

### Easy (C1, C2, C3, C4, C7, C8, C10)

**C1 — Add exactly 10 to a two-digit number (Easy)**
- Prompt: `What is N + 10?` (text only on ~10 of 15; base10 visual on ~5 of 15)
- Visual (where present): `{ type: 'base10', tens: N_tens, ones: N_ones }`
- Choices: correct (N+10), err_ten_as_one (N+1), err_off_by_ten (N+20 or N), err_ones_changed (N's tens + 10, wrong ones)
- **15 easy questions.** N's tens ∈ {1..6}, ones ∈ {1..9}, sum ≤ 79.
- Sample Ns: 24, 31, 45, 53, 62, 14, 23, 41, 35, 52, 61, 26, 33, 44, 55

**C2 — Add 20 or 30 to a two-digit number (Easy)**
- Prompt: `What is N + M?` where M ∈ {20, 30}
- Visual (on ~6 of 12): `{ type: 'base10', tens: N_tens, ones: N_ones }`
- Choices: correct (N+M), err_ten_as_one (N + M_digit, e.g. 47+20→49), err_off_by_ten (N+M±10), err_place_value_confusion (alternate wrong sum)
- **12 easy questions.** N's tens ∈ {1..5}, ones ∈ {1..9}, sum ≤ 79.
- Sample pairs: (36,20), (47,30), (23,20), (15,30), (42,20), (34,30), (21,20), (26,30), (13,20), (44,30), (52,20), (16,30)

**C3 — Mixed equation to answer (Easy)**
- Prompt: `What is N + M?` where M ∈ {10, 20, 30, 40}, larger variety
- Visual: none
- Choices: correct, err_ten_as_one, err_off_by_ten, err_place_value_confusion
- **8 easy questions.** M may be 40 when N's tens ∈ {1..4}.

**C4 — Base-10 model to result (Easy)**
- Prompt: `The model shows N. You add M tens rods. What is the total?`
- Visual: `{ type: 'base10', tens: N_tens, ones: N_ones }` (shows starting N only; added rods described in text)
- Choices: correct (N+M), err_ten_as_one (add M_digit to ones: N_ones + M_digit), err_off_by_ten (N+M±10), err_place_value_confusion
- **8 easy questions.** N's tens ∈ {1..4}, M ∈ {10, 20, 30}, sum ≤ 79.

**C7 — Ones-stay-same identification (Easy)**
- Prompt: `In N + M, what happens to the ones digit?` (multiple choice: stays the same / increases by M / decreases / doubles)
- Visual: none
- Choices: "It stays N_ones" (correct), "It becomes N_ones + M_digit" (err_ten_as_one), "It becomes 0" (err_place_value_confusion), "It changes to match the tens" (err_place_value_confusion)
- **5 easy questions.**

**C8 — Tens-change identification (Easy)**
- Prompt: `N + M changes the tens digit. What is the new tens digit?` or `N + M = ?. How many tens does the answer have?`
- Visual: none
- Choices: correct tens count (N_tens + M/10), N_tens only (err_tens_not_changed), M/10 only (err_start_number_confusion), N_tens + M_digit (err_ten_as_one)
- **5 easy questions.**

**C10 — Boundary high-sum cases (Easy)**
- Prompt: `What is N + M?` where sum ∈ {90, 91} — near the top of range but safely ≤ 99
- Visual: `{ type: 'base10', tens: N_tens, ones: N_ones }` on all 2
- Choices: correct, err_ten_as_one, err_off_by_ten, err_place_value_confusion
- **2 easy questions.** e.g., 81+10=91, 70+20=90

### Medium (C1, C2, C3, C4, C5, C6, C7, C8, C10)

**C1 medium — Add 10 (larger starting numbers)**
- Same format as C1 easy; N's tens ∈ {5..7}, sum ∈ {60..85}
- **10 medium questions.**

**C2 medium — Add 20 or 30 (larger starting numbers)**
- Same format as C2 easy; at least one of N's tens ∈ {4..6}, sum ∈ {60..89}
- **8 medium questions.**

**C3 medium — Mixed equation (harder numbers, M may be 40)**
- Same format as C3 easy; N's tens ∈ {2..5}, M ∈ {20, 30, 40}, sums 50–89
- **12 medium questions.**

**C4 medium — Base-10 model (larger N and M)**
- Same format as C4 easy; N's tens ∈ {3..5}, M ∈ {20, 30, 40}, sum ∈ {60..89}
- **7 medium questions.**

**C5 — Missing tens addend: N + __ = sum (Medium)**
- Prompt: `N + ___ = sum. What is the missing number?`
- Visual: none (or `{ type: 'base10', tens: sum_tens, ones: sum_ones }` showing the target sum on ~4 questions)
- Choices: correct (sum − N = M), err_dropped_zero (M_digit, e.g. 3 instead of 30), err_off_by_ten (M ± 10), err_start_number_confusion (N itself)
- **10 medium questions.** Pairs where M ∈ {10, 20, 30}: (35,65), (24,44), (42,72), (53,83), (16,36), (27,57), (48,78), (31,61), (22,52), (44,64)

**C6 — Missing starting number: __ + M = sum (Medium)**
- Prompt: `___ + M = sum. What is the missing number?`
- Visual: none
- Choices: correct (sum − M), err_dropped_zero (sum_digit or M_digit), err_off_by_ten (correct ± 10), err_start_number_confusion (sum itself)
- **5 medium questions.** Pairs: (?,20,74)→54, (?,10,63)→53, (?,30,82)→52, (?,20,57)→37, (?,30,76)→46

**C7 medium — Ones-stay-same (harder prompt)**
- Prompt: `N + M = ?. What is the ones digit of the answer?`
- Visual: none
- Choices: N's ones digit (correct), M_digit (err_ten_as_one), sum's tens digit (err_place_value_confusion), 0 (err_place_value_confusion)
- **5 medium questions.**

**C8 medium — Tens-change (harder prompt)**
- Prompt: `N + M = ?. The tens digit changes from N_tens to ___?`
- Visual: none
- Choices: correct (N_tens + M/10), N_tens (err_tens_not_changed), M/10 (err_start_number_confusion), N_tens + M_digit (err_ten_as_one)
- **5 medium questions.**

**C10 medium — Boundary (sum ∈ 92–99)**
- Prompt: `What is N + M?` where sum ∈ {92..99}
- Visual: `{ type: 'base10', tens: N_tens, ones: N_ones }` on ~4 of 8
- Choices: correct, err_ten_as_one, err_off_by_ten, err_boundary_high_sum (nearby wrong value like 89 or 100 — but 100 only as a distractor, never as correct answer)
- **8 medium questions.** e.g., 79+20=99, 69+30=99, 89+10=99 (×2 variations), 72+20=92, 63+30=93, 54+40=94, 62+30=92

### Hard (C3, C5, C6, C9, C10)

**C3 hard — Mixed equation (two-step reasoning prompt)**
- Prompt framed as: `Which of these is correct? A) N + M = sum, B) N + M = sum±10, ...` (choose-correct form)
- Or: `N + M = ?. Explain: the tens digit goes from N_tens to ___?` (combined equation + reasoning)
- **5 hard questions.** Larger N values (tens ∈ {5..7}), M ∈ {20, 30, 40}.

**C5 hard — Missing tens addend (larger sums)**
- Same structure as C5 medium; sums ∈ {80..99}, M ∈ {20, 30, 40}
- **10 hard questions.** Pairs: (59,89), (49,79), (39,69), (58,88), (47,77), (36,76), (19,49), (28,58), (67,97), (48,78)

**C6 hard — Missing starting number (larger, harder pairs)**
- Same structure as C6 medium; M ∈ {20, 30, 40}, sum ∈ {70..99}
- **10 hard questions.** e.g., (?+30=97)→67, (?+20=89)→69, (?+40=94)→54, (?+30=83)→53, (?+20=78)→58, (?+40=86)→46, (?+30=71)→41, (?+20=93)→73, (?+40=99)→59, (?+30=92)→62

**C9 — Error repair (Hard)**
- Prompt: `A student says N + M = wrong. What is the correct answer?`
- `wrong` is always a real-error-tag value: most commonly err_ten_as_one (added M's digit to ones place)
- Visual: none
- Choices: correct (N+M), wrong (err_ten_as_one — the student's answer), correct−10 (err_off_by_ten), other plausible wrong (err_place_value_confusion)
- **15 hard questions.** Each uses a unique (N, M, wrong) triple; wrong is always computed by a real misconception.
- Sample triples: (47,20,49), (36,30,39), (53,20,55), (62,30,65), (24,20,26), (41,30,44), (73,20,75), (34,40,38), (56,30,59), (22,40,26), (45,20,47), (63,30,66), (71,20,73), (38,40,42), (27,30,30)

**C10 hard — Boundary (sum = 99, harder distractors)**
- Prompt: `What is N + M?` where N + M = 99 exactly
- Visual: `{ type: 'base10', tens: 9, ones: 9 }` on some; or `{ type: 'base10', tens: N_tens, ones: N_ones }` as question visual
- Choices: 99 (correct), N + M_digit (err_ten_as_one), 89 (err_off_by_ten), 100 (err_boundary_100_confusion — distractor only, not the correct answer)
- **5 hard questions.** Pairs summing to 99: (79,20), (69,30), (59,40), (89,10)×2 (different Ns: 89+10 and 79+20 already done — so also 49+50 EXCLUDED since M=50 is out of scope; use (79,20), (69,30), (59,40), (29,70) EXCLUDED — M=70 out of scope)
- Valid pairs summing to exactly 99: (89,10), (79,20), (69,30), (59,40), (49,50) — but M=50 is out of scope.
- **Revised:** (89,10)×1, (79,20)×1, (69,30)×1, (59,40)×1, (29+70 excluded) → use (89,10), (79,20), (69,30), (59,40), (49,40)→89 (not 99 — skip) — adjust to 4 exact-99 + 1 near-99 variant: (78,20)→98 as 5th.
- **Final C10 hard list:** (89,10)=99, (79,20)=99, (69,30)=99, (59,40)=99, (78,20)=98.

---

## 10. Target question count

**170 total**

---

## 11. Easy / medium / hard distribution

| Category | Description | Easy | Medium | Hard | Total |
|---|---|---|---|---|---|
| C1 | Add 10 directly | 15 | 10 | 0 | 25 |
| C2 | Add 20 or 30 | 12 | 8 | 0 | 20 |
| C3 | Mixed equation to answer | 8 | 12 | 5 | 25 |
| C4 | Base-10 model → result | 8 | 7 | 0 | 15 |
| C5 | Missing tens addend | 0 | 10 | 10 | 20 |
| C6 | Missing starting number | 0 | 5 | 10 | 15 |
| C7 | Ones-stay-same ID | 5 | 5 | 0 | 10 |
| C8 | Tens-change ID | 5 | 5 | 0 | 10 |
| C9 | Error repair | 0 | 0 | 15 | 15 |
| C10 | Boundary high-sum | 2 | 8 | 5 | 15 |
| **Total** | | **55** | **70** | **45** | **170** |

Question ID ranges:

| Range | Category | Band |
|---|---|---|
| q-001 – q-025 | C1 | E×15, M×10 |
| q-026 – q-045 | C2 | E×12, M×8 |
| q-046 – q-070 | C3 | E×8, M×12, H×5 |
| q-071 – q-085 | C4 | E×8, M×7 |
| q-086 – q-105 | C5 | M×10, H×10 |
| q-106 – q-120 | C6 | M×5, H×10 |
| q-121 – q-130 | C7 | E×5, M×5 |
| q-131 – q-140 | C8 | E×5, M×5 |
| q-141 – q-155 | C9 | H×15 |
| q-156 – q-170 | C10 | E×2, M×8, H×5 |

---

## 12. Visual strategy

### Primary: base10

All question visuals use the same shapes as L4.1–L4.3:

```javascript
// Question visual (shows starting number N):
{ type: 'base10', tens: N_tens, ones: N_ones }

// Teaching visual under "TRY IT THIS WAY" (shows N + added tens):
{ type: 'base10', config: { tens: result_tens, ones: N_ones, label: '...' } }
```

For C9 (error repair) and purely conceptual questions: `visual: null`.

### Intervention visual rule

- **Top** (under "THE QUESTION"): shows the original starting number N, not the result.
  - `{ type: 'base10', tens: N_tens, ones: N_ones }`
- **Bottom** (under "TRY IT THIS WAY"): shows the result after adding M, with a label.
  - `{ type: 'base10', config: { tens: N_tens + M/10, ones: N_ones, label: N + ' + ' + M + ' = ' + sum } }`

This makes it visually clear that the ones cubes are identical in both visuals — they do not change.

### numberLine (optional, verify before use)

The spec requests `numberLine` for "+10 jump" style questions. However, the L4.1–L4.3 codebase shows no confirmed `numberLine` visual usage. **Before any numberLine questions are written**, the implementer must:

1. Search `src/renderers/` (or equivalent) for `'numberLine'` support.
2. If found: use `{ type: 'numberLine', start: N, jumps: [10, 10] }` (or whatever the actual schema is) for ~5 C1 questions.
3. If not found: **all questions use base10 only**. Do not build a new renderer.

The plan is written assuming base10 only. If numberLine is confirmed, up to 5 C1 questions may swap in a numberLine visual — no structural changes needed.

### Hundreds blocks

Not used in L4.4. No question produces a sum of 100 or more. The `hundreds` field (used in L4.3 C9 for the 100-result boundary) is not needed here.

---

## 13. Error tags

Eight tags, one per intervention factory. Every question must use exactly one.

| Tag | Meaning | Example misconception |
|---|---|---|
| `err_ten_as_one` | Treated M as ones, not tens | 47 + 20 = 49 (added 2 to ones) |
| `err_ones_changed` | Changed ones digit when only tens should change | 47 + 20 = 60 (changed 7 to 0) |
| `err_tens_not_changed` | Left tens unchanged, changed something else | 47 + 20 = 47 or 48 |
| `err_off_by_ten` | Off by exactly one ten (counted M ± 10) | 47 + 20 = 57 or 77 |
| `err_missing_tens_value` | Could not identify missing addend; answered with wrong place | 35 + __ = 65 → answered 6 or 65 |
| `err_start_number_confusion` | Used the wrong starting number | __ + 20 = 74 → answered 20 or 74 |
| `err_place_value_confusion` | General place value error | 47 + 20 = 270 or 670 |
| `err_boundary_100_confusion` | Answered 100 or above when sum ≤ 99 | 89 + 10 = 100 (off by 1 ten) |

`err_boundary_100_confusion` is only used in C10 questions.

---

## 14. Intervention templates

Eight factory functions, one per error tag. All follow the same pattern as L4.1–L4.3 factories.

### Factory signature convention

```javascript
function _l44Int<ErrorName>(startNum, addTens, sum [, wrongAnswer]) { ... }
```

Returns an object with: `errorTag`, `title`, `teachingSteps[]`, `correctAnswerExplanation`, `teachingVisual`.

`followUpRule` and `doNotRepeatOriginalQuestion` are set directly on each question's `intervention` object — not inside the factory return.

---

### Factory 1: `_l44IntTenAsOne(startNum, addTens, sum, wrongAnswer)`

Used on: C2, C3, C9 primarily.

```javascript
function _l44IntTenAsOne(startNum, addTens, sum, wrongAnswer) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var addedTensCount = addTens / 10;
  var newTens = startTens + addedTensCount;
  return {
    errorTag: 'err_ten_as_one',
    title: addTens + ' is ' + addedTensCount + ' tens — not ' + addedTensCount + ' ones',
    teachingSteps: [
      startNum + ' has ' + startTens + ' tens and ' + startOnes + ' ones.',
      'We are adding ' + addTens + '. That is ' + addedTensCount + ' tens — not ' + addedTensCount + ' ones.',
      'Add the tens: ' + startTens + ' tens + ' + addedTensCount + ' tens = ' + newTens + ' tens.',
      'The ones stay the same: ' + startOnes + '.',
      startNum + ' + ' + addTens + ' = ' + sum + ', not ' + wrongAnswer + '.'
    ],
    correctAnswerExplanation: startNum + ' + ' + addTens + ' = ' + sum + ' because ' + addTens + ' means ' + addedTensCount + ' tens, so the tens go from ' + startTens + ' to ' + newTens + '.',
    teachingVisual: { type: 'base10', config: { tens: newTens, ones: startOnes, label: startNum + ' + ' + addTens + ' = ' + sum } }
  };
}
```

---

### Factory 2: `_l44IntOnesChanged(startNum, addTens, sum)`

Used on: C7 (conceptual wrong-answer paths), C3.

```javascript
function _l44IntOnesChanged(startNum, addTens, sum) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var newTens = startTens + addTens / 10;
  return {
    errorTag: 'err_ones_changed',
    title: 'The ones digit never changes when you add tens',
    teachingSteps: [
      startNum + ' has ' + startOnes + ' ones. When we add ' + addTens + ', the ones do not change.',
      addTens + ' is tens only — it has no ones.',
      'Tens change: ' + startTens + ' → ' + newTens + '. Ones stay: ' + startOnes + ' → ' + startOnes + '.',
      startNum + ' + ' + addTens + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: startNum + ' + ' + addTens + ' = ' + sum + '. The ones digit stays ' + startOnes + ' because adding tens never touches the ones place.',
    teachingVisual: { type: 'base10', config: { tens: newTens, ones: startOnes, label: 'Ones stay ' + startOnes } }
  };
}
```

---

### Factory 3: `_l44IntTensNotChanged(startNum, addTens, sum)`

Used on: C8 (incorrect "tens stay" answer path).

```javascript
function _l44IntTensNotChanged(startNum, addTens, sum) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var newTens = startTens + addTens / 10;
  return {
    errorTag: 'err_tens_not_changed',
    title: 'Adding tens must change the tens digit',
    teachingSteps: [
      'We are adding ' + addTens + ' to ' + startNum + '.',
      addTens + ' means ' + (addTens / 10) + ' tens. The tens digit must go up by ' + (addTens / 10) + '.',
      startNum + ' has ' + startTens + ' tens. After adding: ' + startTens + ' + ' + (addTens / 10) + ' = ' + newTens + ' tens.',
      'The answer is ' + newTens + ' tens and ' + startOnes + ' ones = ' + sum + '.'
    ],
    correctAnswerExplanation: startNum + ' + ' + addTens + ' = ' + sum + '. The tens digit changes from ' + startTens + ' to ' + newTens + '.',
    teachingVisual: { type: 'base10', config: { tens: newTens, ones: startOnes, label: startTens + ' tens → ' + newTens + ' tens' } }
  };
}
```

---

### Factory 4: `_l44IntOffByTen(startNum, addTens, sum)`

Used on: C1, C2, C3, C5.

```javascript
function _l44IntOffByTen(startNum, addTens, sum) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var newTens = startTens + addTens / 10;
  return {
    errorTag: 'err_off_by_ten',
    title: 'Count the tens carefully — you were off by one ten',
    teachingSteps: [
      startNum + ' has ' + startTens + ' tens and ' + startOnes + ' ones.',
      'We are adding ' + addTens + '. That is exactly ' + (addTens / 10) + ' tens.',
      'Count up: ' + startTens + ' + ' + (addTens / 10) + ' = ' + newTens + ' tens.',
      'The ones stay ' + startOnes + '. So the answer is ' + sum + '.'
    ],
    correctAnswerExplanation: startNum + ' + ' + addTens + ' = ' + sum + '. Count the added tens carefully: ' + startTens + ' + ' + (addTens / 10) + ' = ' + newTens + '.',
    teachingVisual: { type: 'base10', config: { tens: newTens, ones: startOnes, label: 'Count ' + (addTens / 10) + ' new tens' } }
  };
}
```

---

### Factory 5: `_l44IntMissingTensValue(startNum, missing, sum)`

Used on: C5.

```javascript
function _l44IntMissingTensValue(startNum, missing, sum) {
  var startTens = Math.floor(startNum / 10);
  var sumTens = Math.floor(sum / 10);
  var startOnes = startNum % 10;
  return {
    errorTag: 'err_missing_tens_value',
    title: 'Find the missing tens by comparing the tens digits',
    teachingSteps: [
      sum + ' has ' + sumTens + ' tens. ' + startNum + ' has ' + startTens + ' tens.',
      'The ones are the same (' + startOnes + ' = ' + startOnes + ') — the only difference is in the tens.',
      'How many tens did we add? ' + sumTens + ' − ' + startTens + ' = ' + (sumTens - startTens) + ' tens.',
      (sumTens - startTens) + ' tens = ' + missing + '. The missing number is ' + missing + '.'
    ],
    correctAnswerExplanation: startNum + ' + ' + missing + ' = ' + sum + '. The tens went from ' + startTens + ' to ' + sumTens + ', a difference of ' + (sumTens - startTens) + ' tens = ' + missing + '.',
    teachingVisual: { type: 'base10', config: { tens: sumTens, ones: startOnes, label: startNum + ' + ' + missing + ' = ' + sum } }
  };
}
```

---

### Factory 6: `_l44IntStartNumConfusion(startNum, addTens, sum)`

Used on: C6.

```javascript
function _l44IntStartNumConfusion(startNum, addTens, sum) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var sumTens = Math.floor(sum / 10);
  return {
    errorTag: 'err_start_number_confusion',
    title: 'The starting number is sum minus the tens you added',
    teachingSteps: [
      'The answer is ' + sum + '. We added ' + addTens + '.',
      'To find where we started, subtract: ' + sum + ' − ' + addTens + ' = ' + startNum + '.',
      startNum + ' has ' + startTens + ' tens and ' + startOnes + ' ones.',
      'Check: ' + startNum + ' + ' + addTens + ' = ' + sum + '. Correct!'
    ],
    correctAnswerExplanation: 'The missing starting number is ' + startNum + '. ' + startNum + ' + ' + addTens + ' = ' + sum + '.',
    teachingVisual: { type: 'base10', config: { tens: startTens, ones: startOnes, label: 'Start: ' + startNum } }
  };
}
```

---

### Factory 7: `_l44IntPlaceValueConfusion(startNum, addTens, sum)`

Used on: C3, C4, general fallback.

```javascript
function _l44IntPlaceValueConfusion(startNum, addTens, sum) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var newTens = startTens + addTens / 10;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Tens and ones live in different places — keep them separate',
    teachingSteps: [
      startNum + ': the ' + startTens + ' is in the tens place (worth ' + (startTens * 10) + '). The ' + startOnes + ' is in the ones place.',
      'We are adding ' + addTens + '. That goes in the tens place too.',
      'Tens: ' + startTens + ' + ' + (addTens / 10) + ' = ' + newTens + '. Ones: ' + startOnes + ' + 0 = ' + startOnes + '.',
      newTens + ' tens and ' + startOnes + ' ones = ' + sum + '.'
    ],
    correctAnswerExplanation: startNum + ' + ' + addTens + ' = ' + sum + '. Add only the tens digits; the ones digit stays ' + startOnes + '.',
    teachingVisual: { type: 'base10', config: { tens: newTens, ones: startOnes, label: startNum + ' + ' + addTens + ' = ' + sum } }
  };
}
```

---

### Factory 8: `_l44IntBoundary100(startNum, addTens, sum)`

Used on: C10 hard (sum = 99; distractor is 100).

```javascript
function _l44IntBoundary100(startNum, addTens, sum) {
  var startTens = Math.floor(startNum / 10);
  var startOnes = startNum % 10;
  var newTens = startTens + addTens / 10;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: sum + ' is the answer — it is less than 100',
    teachingSteps: [
      startNum + ' has ' + startTens + ' tens and ' + startOnes + ' ones.',
      'Adding ' + addTens + ': ' + startTens + ' + ' + (addTens / 10) + ' = ' + newTens + ' tens.',
      newTens + ' tens and ' + startOnes + ' ones = ' + sum + '.',
      sum + ' is less than 100 — we do not reach 100 here.'
    ],
    correctAnswerExplanation: startNum + ' + ' + addTens + ' = ' + sum + '. ' + newTens + ' tens and ' + startOnes + ' ones is ' + sum + ', which is still less than 100.',
    teachingVisual: { type: 'base10', config: { tens: newTens, ones: startOnes, label: sum + ' — still less than 100' } }
  };
}
```

---

## 15. Retry behavior

- Every question: `followUpRule: 'same_skill_new_numbers'`
- Every question: `doNotRepeatOriginalQuestion: true`
- Retry pool: filtered by `lessonId: 'g1-u4-l4'`
- Quiz engine maps to `lessonIdx: 3` (L4.4 is the 4th element in the `lessons` array, 0-based)
- The existing `quiz.js` fix (commit `0d3f200`) already handles `lessonIdx` persistence across `startLessonQuiz` — no changes to `quiz.js` needed.

---

## 16. Risks before coding

**Risk 1: lessonIdx = 3 mapping**
The `quiz.js` fix preserves `CUR.lessonIdx` across async calls. L4.4 is the 4th lesson (index 3). Before writing any L4.4 question, verify the `lessons` array order in the scaffold: L4.1=0, L4.2=1, L4.3=2, L4.4=3, L4.5=4. If order differs, lessonIdx on retry will be wrong.

**Risk 2: C10 boundary — no 100-result**
Unlike L4.3 which included 50+50=100 (hundreds block), L4.4 does **not** include any 100-result questions. The distractor `100` appears in C10 hard choices only as a wrong answer. If any question accidentally produces a sum of 100, it must be cut or moved to a different lesson.

**Risk 3: numberLine renderer unknown**
The spec mentions numberLine visuals. No confirmed support was found in L4.1–L4.3. The implementer must check the renderer before authoring any numberLine questions. Default: skip numberLine and use base10 only.

**Risk 4: C5/C6 distractor quality**
Missing-addend and missing-start-number questions are the hardest to write meaningful distractors for. The four choices must represent real misconceptions (not random numbers). Specifically:
- `err_dropped_zero` distractor: use `M/10` (e.g., 3 instead of 30) — a real student error
- `err_off_by_ten` distractor: use `M ± 10` — always stay within 10–40 range or make it clearly "one ten off"
- `err_start_number_confusion` distractor: use `sum` itself or `M` alone — both are real errors

**Risk 5: C3 hard wording**
"Choose the correct equation" format is valid but must be phrased carefully so it does not become a trick question. Each incorrect choice must represent a distinct, real error tag — not be obviously nonsensical.

**Risk 6: question overlap with L4.2**
C1 (add 10 to a two-digit number) shares surface-level similarity with L4.2. Differentiation:
- L4.2 C1 prompts typically say "10 more than N" or use the number chart context.
- L4.4 C1 always frames as an addition equation: `N + 10 = ?`.
- L4.4 C1 uses base10 block visuals; L4.2 used number-chart / tens-column context.
- L4.4 C7/C8 explicitly name the ones/tens digit behavior — a teaching element absent from L4.2.

**Risk 7: 170-question count integrity**
With 10 categories, hand-counted totals must match exactly. The implementer should count after writing each category block and adjust before committing.

---

## 17. Verification checklist

After implementation, before marking complete:

### Question structure
- [ ] `quizBank.length === 170`
- [ ] Easy: exactly 55 (`q.difficulty === 'easy'`)
- [ ] Medium: exactly 70 (`q.difficulty === 'medium'`)
- [ ] Hard: exactly 45 (`q.difficulty === 'hard'`)
- [ ] All IDs are `g1-u4-l4-q-001` through `g1-u4-l4-q-170`, no gaps, no duplicates
- [ ] All questions: `lessonId: 'g1-u4-l4'`
- [ ] All questions: `teks: ['1.3A']`
- [ ] All questions: `skill: 'add_tens_to_two_digit'`

### Scope guardrails
- [ ] No question has a sum > 99 (correct answer or visual)
- [ ] No question adds a non-multiple of 10 (no ones component in the added value)
- [ ] No question has `ones: 0` on the starting number (that is L4.3 territory)
- [ ] No question frames the task as subtraction
- [ ] No question uses a vertical algorithm prompt
- [ ] No word problems

### Intervention completeness
- [ ] Every question has `intervention` object
- [ ] Every intervention has `errorTag`, `title`, `teachingSteps`, `correctAnswerExplanation`, `teachingVisual`, `followUpRule: 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion: true`
- [ ] `teachingSteps` is an array of at least 3 strings
- [ ] `teachingVisual` uses a valid known visual type (`base10` confirmed; `numberLine` only if renderer verified)
- [ ] No intervention uses `hundreds` field (no 100-result questions in L4.4)

### Lesson metadata
- [ ] `keyIdeas` array has exactly 6 entries
- [ ] `workedExamples` array has exactly 6 entries
- [ ] Each worked example has `id`, `content`, and `steps` (or equivalent fields matching the existing schema)

### Test suite
- [ ] `npm test` passes (Jest): all tests green, 0 failures
- [ ] `node:test` for `g1-unit-quiz` passes: all assertions green
- [ ] No new test failures in L4.1, L4.2, L4.3, or prior unit tests

### Browser verification
- [ ] L4.4 lesson page loads: key ideas display, worked examples display, practice drill renders a question
- [ ] Answer a question correctly → next question appears from L4.4 pool
- [ ] Trigger an incorrect answer → intervention overlay opens
- [ ] Intervention overlay: title ✓, THE QUESTION panel ✓, WHY IT WAS TRICKY ✓, teaching steps ✓, correct answer explanation ✓, TRY IT THIS WAY visual ✓, "Try a new one" button ✓
- [ ] "Try a new one" → new question from L4.4 pool (`lessonIdx=3` held)
- [ ] No console errors (pre-existing Supabase auth refresh errors are acceptable)
- [ ] L4.1, L4.2, L4.3 spot-check: intervention and "Try a new one" still work on each

---

## Implementation tasks (TDD, after plan is approved)

> **Do not begin until the plan is approved.**

### Task 1: Verify scaffold and write failing tests

**Files:**
- Read: `src/data/g1/u4.js` — confirm L4.4 scaffold exists with `lessonId: 'g1-u4-l4'` and empty `quizBank`
- Modify: `tests/g1-unit-quiz.test.js` — append L4.4 assertions

- [ ] **Step 1: Confirm scaffold**

  Search for `'g1-u4-l4'` in `src/data/g1/u4.js`. Confirm the lessons array has an entry with:
  - `lessonId: 'g1-u4-l4'`
  - `title: 'Add Tens to Two-Digit Numbers'`
  - `quizBank: []` (empty)
  - `keyIdeas: []` (empty)
  - `workedExamples: []` (empty)
  
  Also confirm lesson index: `G1_U4_SPEC.lessons[3].lessonId === 'g1-u4-l4'`.

- [ ] **Step 2: Write failing count test**

  In `tests/g1-unit-quiz.test.js`, append after the L4.3 block:

  ```javascript
  describe('L4.4 — Add Tens to Two-Digit Numbers', () => {
    const L44 = G1_U4_SPEC.lessons.find(l => l.lessonId === 'g1-u4-l4');

    test('quizBank has 170 questions', () => {
      expect(L44.quizBank.length).toBe(170);
    });

    test('difficulty split is 55E / 70M / 45H', () => {
      const easy   = L44.quizBank.filter(q => q.difficulty === 'easy').length;
      const medium = L44.quizBank.filter(q => q.difficulty === 'medium').length;
      const hard   = L44.quizBank.filter(q => q.difficulty === 'hard').length;
      expect(easy).toBe(55);
      expect(medium).toBe(70);
      expect(hard).toBe(45);
    });

    test('all questions have required fields', () => {
      L44.quizBank.forEach(q => {
        expect(q.id).toMatch(/^g1-u4-l4-q-\d{3}$/);
        expect(q.lessonId).toBe('g1-u4-l4');
        expect(q.teks).toEqual(['1.3A']);
        expect(q.skill).toBe('add_tens_to_two_digit');
        expect(q.intervention).toBeDefined();
        expect(q.intervention.followUpRule).toBe('same_skill_new_numbers');
        expect(q.intervention.doNotRepeatOriginalQuestion).toBe(true);
        expect(Array.isArray(q.intervention.teachingSteps)).toBe(true);
        expect(q.intervention.teachingSteps.length).toBeGreaterThanOrEqual(3);
        expect(q.intervention.teachingVisual).toBeDefined();
      });
    });

    test('no question produces a sum over 99', () => {
      L44.quizBank.forEach(q => {
        const ans = parseInt(q.answer, 10);
        if (!isNaN(ans)) {
          expect(ans).toBeLessThanOrEqual(99);
        }
      });
    });

    test('IDs are unique and sequential', () => {
      const ids = L44.quizBank.map(q => q.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(170);
      for (var i = 1; i <= 170; i++) {
        var expected = 'g1-u4-l4-q-' + String(i).padStart(3, '0');
        expect(ids).toContain(expected);
      }
    });

    test('keyIdeas has 6 entries', () => {
      expect(L44.keyIdeas.length).toBe(6);
    });

    test('workedExamples has 6 entries', () => {
      expect(L44.workedExamples.length).toBe(6);
    });
  });
  ```

- [ ] **Step 3: Run tests to confirm they fail**

  ```powershell
  npm test -- --testPathPattern=g1-unit-quiz
  ```

  Expected: 7 failures (170 questions not yet written). If tests error on import, fix import path first.

- [ ] **Step 4: Commit failing tests**

  ```powershell
  git add tests/g1-unit-quiz.test.js
  git commit -m "test(g1u4): add failing L4.4 tests — 170q, 55E/70M/45H, field coverage"
  ```

---

### Task 2: Implement visual helpers and intervention factories

**Files:**
- Modify: `src/data/g1/u4.js` — add helper functions immediately before the L4.4 question block (following the L4.1–L4.3 pattern of `// --- L4.4 helpers ---`)

- [ ] **Step 1: Add visual helpers**

  In `src/data/g1/u4.js`, after the last L4.3 helper and before the L4.4 quizBank, insert:

  ```javascript
  // --- L4.4 helpers ---

  function _l44VisBase10(tens, ones) {
    return { type: 'base10', tens: tens, ones: ones };
  }

  function _l44TeachingBase10(tens, ones, label) {
    return { type: 'base10', config: { tens: tens, ones: ones, label: label } };
  }
  ```

- [ ] **Step 2: Add all 8 intervention factories**

  Insert the 8 factory functions from Section 14 of this plan, in order, after the visual helpers. Copy the exact function bodies from Section 14. Do not abbreviate or paraphrase.

- [ ] **Step 3: Run tests — still failing (no questions yet)**

  ```powershell
  npm test -- --testPathPattern=g1-unit-quiz
  ```

  Expected: same 7 failures as Task 1. No new failures. If new failures appear, fix before continuing.

- [ ] **Step 4: Commit helpers**

  ```powershell
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): add L4.4 visual helpers and intervention factory functions"
  ```

---

### Task 3: Implement C1–C4 questions (Easy + Medium — 85 questions)

**Files:**
- Modify: `src/data/g1/u4.js` — fill `quizBank` inside the `g1-u4-l4` lesson object

- [ ] **Step 1: Write C1 — Add 10 directly (q-001 to q-025)**

  15 easy + 10 medium = 25 questions. Each question:
  - `interactionType: 'multipleChoice'`
  - `prompt: 'What is ' + N + ' + 10?'`
  - `visual: _l44VisBase10(N_tens, N_ones)` on ~12 of 25; `null` on remaining 13
  - `answer: String(N + 10)`
  - `choices: [String(N+10), String(N+1), String(N+20), String(N)]` (shuffled by category rule)
  - `intervention: Object.assign(_l44IntTenAsOne(N, 10, N+10, N+1), { followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true })`

  Use easy Ns (tens 1–6): 24, 31, 45, 53, 62, 14, 23, 41, 35, 52, 61, 26, 33, 44, 55
  Use medium Ns (tens 5–7): 51, 63, 74, 57, 65, 71, 76, 58, 72, 67

- [ ] **Step 2: Write C2 — Add 20 or 30 (q-026 to q-045)**

  12 easy + 8 medium = 20 questions. Each:
  - M ∈ {20, 30}
  - `answer: String(N + M)`
  - `choices: [N+M, N+M_digit (ten-as-one), N+M+10 or N+M-10, alternate wrong]`
  - Error tag: `err_ten_as_one` for M_digit distractor; `err_off_by_ten` for ±10 distractor

- [ ] **Step 3: Write C3 — Mixed equation (q-046 to q-070, easy + medium portions)**

  8 easy (q-046 to q-053) + 12 medium (q-054 to q-065). Hard portion (q-066 to q-070) done in Task 5.
  - M ∈ {10, 20, 30, 40} mixed
  - `visual: null` on all C3
  - Choices always include: correct, err_ten_as_one, err_off_by_ten, err_place_value_confusion

- [ ] **Step 4: Write C4 — Model to result (q-071 to q-085)**

  8 easy + 7 medium = 15 questions.
  - `prompt: 'The model shows ' + N + '. You add ' + M + '. What is the total?'`
  - `visual: _l44VisBase10(N_tens, N_ones)` on all C4
  - Choices: N+M (correct), N+M_digit (ten-as-one), N+M±10 (off-by-ten), alternate wrong

- [ ] **Step 5: Run tests — still failing but fewer fields missing**

  ```powershell
  npm test -- --testPathPattern=g1-unit-quiz
  ```

  Expected: count test fails (not yet 170), other structural tests may partially pass. Fix any field errors before continuing.

- [ ] **Step 6: Commit C1–C4**

  ```powershell
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.4 C1-C4 — 85 questions (add-10, add-20/30, mixed, model)"
  ```

---

### Task 4: Implement C5–C8 questions (Medium — 50 questions)

- [ ] **Step 1: Write C5 — Missing tens addend (q-086 to q-105)**

  10 medium (q-086 to q-095) + 10 hard (q-096 to q-105).
  - `prompt: N + ' + ___ = ' + sum + '. What is the missing number?'`
  - `visual: null` on all (with `_l44VisBase10(sum_tens, sum_ones)` on ~4 medium)
  - `answer: String(sum - N)`
  - `choices: [sum-N, (sum-N)/10, sum-N+10, N]` mapped to error tags: missing_tens_value (dropped zero), off-by-ten, start-num-confusion
  - Intervention: `_l44IntMissingTensValue(N, sum-N, sum)`

- [ ] **Step 2: Write C6 — Missing starting number (q-106 to q-120)**

  5 medium (q-106 to q-110) + 10 hard (q-111 to q-120).
  - `prompt: '___ + ' + M + ' = ' + sum + '. What is the missing number?'`
  - `answer: String(sum - M)`
  - `choices: [sum-M, sum, M, sum-M+10]`
  - Intervention: `_l44IntStartNumConfusion(sum-M, M, sum)`

- [ ] **Step 3: Write C7 — Ones-stay-same (q-121 to q-130)**

  5 easy + 5 medium = 10 questions.
  - `prompt: 'In ' + N + ' + ' + M + ', what happens to the ones digit?'`
  - `answer: 'It stays ' + N_ones`
  - `choices: ['It stays ' + N_ones, 'It becomes ' + (N_ones + M/10), 'It becomes 0', 'It changes to match the tens']`
  - Error tags: err_ten_as_one (added M's tens count to ones), err_ones_changed, err_place_value_confusion

- [ ] **Step 4: Write C8 — Tens-change (q-131 to q-140)**

  5 easy + 5 medium = 10 questions.
  - `prompt: N + ' + ' + M + ' = ?. How many tens does the answer have?'`
  - `answer: String(N_tens + M/10)`
  - `choices: [N_tens + M/10, N_tens, M/10, N_tens + M_digit]`
  - Error tags: err_tens_not_changed, err_start_number_confusion, err_ten_as_one

- [ ] **Step 5: Run tests — should pass count for C1–C8 (140 questions)**

  ```powershell
  npm test -- --testPathPattern=g1-unit-quiz
  ```

  Expected: count test still fails (only 140 of 170). All field tests should now pass for q-001 through q-140. Fix any failures.

- [ ] **Step 6: Commit C5–C8**

  ```powershell
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.4 C5-C8 — 50 questions (missing addend, missing start, ones-stay, tens-change)"
  ```

---

### Task 5: Implement C3 hard, C9, C10 + metadata (45 questions + metadata)

- [ ] **Step 1: Write C3 hard (q-066 to q-070)**

  5 hard questions. "Choose the correct equation" or compound-reasoning format.
  - Use large N (tens 5–7), M ∈ {20, 30, 40}
  - Include `err_ten_as_one`, `err_off_by_ten`, `err_place_value_confusion` distractors

- [ ] **Step 2: Write C9 — Error repair (q-141 to q-155)**

  15 hard questions. Use the 15 sample triples from Section 9:
  (47,20,49), (36,30,39), (53,20,55), (62,30,65), (24,20,26), (41,30,44), (73,20,75), (34,40,38), (56,30,59), (22,40,26), (45,20,47), (63,30,66), (71,20,73), (38,40,42), (27,30,30).
  - `prompt: 'A student says ' + N + ' + ' + M + ' = ' + wrong + '. What is the correct answer?'`
  - `answer: String(N + M)`
  - `choices: [N+M, wrong, N+M-10, alternate wrong]`
  - Intervention: `_l44IntTenAsOne(N, M, N+M, wrong)` (primary error is ten-as-one in all cases)

- [ ] **Step 3: Write C10 — Boundary high-sum (q-156 to q-170)**

  2 easy + 8 medium + 5 hard = 15 questions. Sums in range 90–99.
  - Hard: pairs summing to exactly 99 per Section 9 C10 hard list
  - Medium: pairs summing to 92–98
  - Easy: pairs summing to 90–91 (e.g., 81+10=91, 70+20=90)
  - C10 hard: use `_l44IntBoundary100(N, M, sum)` intervention; include 100 as a distractor
  - C10 medium: use `_l44IntOffByTen` or `_l44IntTenAsOne` as appropriate

- [ ] **Step 4: Write keyIdeas (6 entries)**

  In the `g1-u4-l4` lesson object, fill `keyIdeas`:

  ```javascript
  keyIdeas: [
    { id: 'g1-u4-l4-ki-1', content: 'Adding tens only changes the tens digit — the ones digit stays the same.' },
    { id: 'g1-u4-l4-ki-2', content: 'In 47 + 20, the 7 stays. Only the tens change: 4 tens + 2 tens = 6 tens.' },
    { id: 'g1-u4-l4-ki-3', content: '47 + 20 = 67, not 49. Adding 20 means adding 2 tens, not 2 ones.' },
    { id: 'g1-u4-l4-ki-4', content: 'Adding 10 moves the tens digit up by 1. Adding 20 moves it up by 2. Adding 30 moves it up by 3.' },
    { id: 'g1-u4-l4-ki-5', content: 'To add tens to a two-digit number, count up the tens rods and keep the ones cubes exactly as they were.' },
    { id: 'g1-u4-l4-ki-6', content: 'The ones digit in the answer always matches the ones digit in the starting number.' }
  ],
  ```

- [ ] **Step 5: Write workedExamples (6 entries)**

  Fill `workedExamples` using the examples from Section 8. Match the schema pattern used in L4.1–L4.3 (check existing fields: `id`, `content`, `steps` array or `prompt`/`visual`/`steps` — match exactly).

- [ ] **Step 6: Run all tests — all should pass**

  ```powershell
  npm test
  ```

  Expected: 130+ tests pass (or whatever the full suite count is), 0 failures.

- [ ] **Step 7: Run g1-unit-quiz node:test**

  ```powershell
  node --test tests/g1-unit-quiz.test.mjs
  ```

  (Or equivalent path/command used for prior lessons.) Expected: 29+ assertions pass.

- [ ] **Step 8: Commit C3-hard + C9 + C10 + metadata**

  ```powershell
  git add src/data/g1/u4.js
  git commit -m "feat(g1u4): L4.4 C3H/C9/C10 — complete 170q, keyIdeas, workedExamples"
  ```

---

### Task 6: Browser verification

- [ ] **Step 1: Start dev server**

  ```powershell
  npm run dev
  ```

  Navigate to the L4.4 lesson page.

- [ ] **Step 2: Verify lesson page**
  - Key ideas render (all 6)
  - Worked examples render (all 6)
  - Practice drill shows a question with choices

- [ ] **Step 3: Verify intervention overlay**
  - Trigger a wrong answer
  - Overlay opens: title ✓, THE QUESTION ✓, WHY IT WAS TRICKY ✓, teaching steps ✓, correct answer explanation ✓, TRY IT THIS WAY visual (base10 blocks) ✓, "Try a new one" button ✓

- [ ] **Step 4: Verify retry pool**
  - Click "Try a new one"
  - Confirm new question is from L4.4 pool (`lessonIdx=3` held, not a random unit question)

- [ ] **Step 5: Regression spot-check**
  - Open L4.1, L4.2, L4.3: trigger one wrong answer each, confirm intervention still works
  - Confirm no console errors (Supabase auth refresh errors are pre-existing and acceptable)

- [ ] **Step 6: Final commit**

  ```powershell
  git add src/data/g1/u4.js tests/g1-unit-quiz.test.js
  git commit -m "feat(g1u4): Lesson 4.4 Add Tens to Two-Digit Numbers — 170 questions, full intervention coverage"
  ```

---

*Plan written 2026-05-08. Awaiting approval before any implementation begins.*
