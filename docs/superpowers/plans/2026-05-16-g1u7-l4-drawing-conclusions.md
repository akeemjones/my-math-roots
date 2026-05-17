# Grade 1 Unit 7 Lesson 7.4 — Drawing Conclusions from Data · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Grade 1 Unit 7 Lesson 7.4 ("Drawing Conclusions from Data") — a 135-question (40E / 55M / 40H) conclusion-and-reasoning lesson built on the picture-graph and bar-type-graph visuals already locked in L7.2 and L7.3. Lifts the U7 pool from 430 → 565.

**Architecture:** All work lives inside `src/data/g1/u7.js`. Reuse the existing `_u7PictureGraph`, `_u7BarTypeGraph`, `_u7Place`, `_u7OtherCats`, `_u7TvWrap` helpers; add only lesson-scoped error-tag constants, 10 teaching-visual helpers, 10 intervention factories, 10 question factories, 5 worked examples, 6 key ideas, and the 10 question banks (C1–C10). Replace the existing L7.4 scaffold inside `G1_U7_SPEC.lessons` with the fully-populated lesson entry. No new top-level graph infrastructure. No `quiz.js` or `unit.js` changes. L7.4 uses `multipleChoice` only.

**Tech Stack:** Vanilla ES module exporting `G1_U7_SPEC` from `src/data/g1/u7.js`. Build runs through `build.js` (src → dist). Tests: `npm test` (29/29 baseline). Preview verification on 414px viewport via the preview server.

---

## 1. Lesson title

**Drawing Conclusions from Data**

## 2. TEKS alignment

**TEKS 1.8C** — Draw conclusions and generate and answer questions using information from picture and bar-type graphs.

L7.4 is the only L7 lesson that touches 1.8C; L7.1 covers 1.8A (sort/organize) and L7.2 + L7.3 share 1.8B (build/read picture and bar graphs).

## 3. Skill name

`draw_conclusions_from_data` — the slug already exists in the scaffold lesson record at `src/data/g1/u7.js` line 4328. Reuse without renaming.

## 4. Exact scope

L7.4 is the **conclusion / reasoning** lesson. Students arrive having already mastered:
- L7.2 — fluent picture-graph reading (140 q)
- L7.3 — fluent bar-type graph reading (140 q)

L7.4 puts those graphs to work answering simple conclusion questions:
- identify the category with the **most**
- identify the category with the **fewest**
- find **how many in all** (visible counting only — no scaled keys)
- find **how many more** of one category than another
- find **how many fewer** of one category than another
- compare two categories using the graph
- choose **true** statements about the data
- identify **false** statements about the data
- match a stated question to its numeric answer
- repair a student's wrong conclusion

Every question reads from an on-screen scale-of-1 picture graph **or** scale-of-1 bar-type graph using `_u7PictureGraph` and `_u7BarTypeGraph`. No new graph types are introduced.

## 5. What stays out of scope

Hard guardrails — enforced by content review and by automated scope scans before locking:

- ❌ scaled picture graphs (one picture = more than one item)
- ❌ scaled bar graphs (one cell = more than one item)
- ❌ graph keys of any kind that change the 1:1 mapping
- ❌ skip-count scales on bar graphs
- ❌ axes, y-axis labels, tick marks, gridlines
- ❌ line plots, dot plots, frequency tables, histograms
- ❌ mean, median, mode, range
- ❌ multi-step word problems
- ❌ more than one operation per question
- ❌ `+`, `-`, `−`, `=` or any equation formatting in student-facing strings (prompts, options, explanations, hints, key ideas, worked examples, intervention text)
- ❌ drag-and-drop interactions
- ❌ Grade 2 data-analysis content (lives at `src/data/u6.js`, different namespace)
- ❌ more than 3 graph categories in any single question
- ❌ tap-group / sort-order / input-number / counter / two-groups interactions
- ❌ unit-test changes, global quiz logic changes
- ❌ touching L7.1, L7.2, L7.3 (locked)
- ❌ touching Units 1–6 or Unit 8

## 6. How this differs from L7.1

| L7.1 (Sorting and Organizing Data) | L7.4 (Drawing Conclusions) |
|---|---|
| TEKS 1.8A | TEKS 1.8C |
| Skill: sort items into categories, count groups, read tally / T-charts | Skill: answer conclusion questions about already-organized data |
| Visuals: sorting mats, tally charts, T-charts, three-col charts | Visuals: picture graphs + bar-type graphs (reuse L7.2/L7.3) |
| No graph reading | All work is graph-based |
| No comparison between categories | Comparison is the core skill |

L7.4 explicitly does **not** ask students to sort, count tally marks, or read T-charts. Those are L7.1 skills and stay there.

## 7. How this differs from L7.2

| L7.2 (Picture Graphs) | L7.4 (Drawing Conclusions) |
|---|---|
| TEKS 1.8B (picture half) | TEKS 1.8C |
| Skill: read and build picture graphs | Skill: draw conclusions from graphs |
| Most / fewest framed as **graph reading** | Most / fewest framed as **conclusion drawing** |
| No "how many more" / "how many fewer" | These are the **core new skill** in L7.4 |
| C10 mixed review is graph-reading only | All categories are conclusion-based |
| Picture graphs only | Picture **and** bar-type graphs interleaved |

L7.2 C2 (most) and C3 (fewest) overlap L7.4 C1 and C2 conceptually, but L7.4 versions are framed as "conclusions you can draw from the graph" rather than basic graph reading, and L7.4 uses both graph types in each category. The two question banks live in separate lessons and route through separate interventions.

## 8. How this differs from L7.3

| L7.3 (Bar-Type Graphs) | L7.4 (Drawing Conclusions) |
|---|---|
| TEKS 1.8B (bar half) | TEKS 1.8C |
| Skill: read and build bar-type graphs | Skill: draw conclusions from graphs |
| No "how many more" / "how many fewer" | These are the **core new skill** |
| Cell color reinforces category mapping in **isolated** bar reading | Cell color carries over; L7.4 leans on the color hint when comparing two bars |
| Bar graphs only | Picture **and** bar graphs interleaved |
| C10 graph-reading only | Every category is conclusion drawing |

L7.4 reuses `_u7BarTypeGraph`, `_u7BarTypeGraphForChoice`, and the existing color map (`_U7_BAR_COLORS`). No new bar visual is needed.

## 9. How this differs from Grade 2 data analysis

Grade 2's Data Analysis lives at `src/data/u6.js` (Grade 2 calls it Unit 6 — distinct namespace from g1u7).

G2/u6 expectations that **must not** appear in L7.4:
- scaled picture graphs (one picture = 2 or 5 items)
- bar graphs with a scale axis
- dot plots / line plots
- tally groups of 5 emphasized as a primary skip-count skill
- multi-step word problems with sums
- data sets larger than 10 per category

L7.4 stays inside Grade 1's narrow band: one picture = one item, one cell = one item, ≤ 3 categories, individual counts capped at 6 (most categories) or 5 (three-cat questions). Total visible items per graph ≤ 10 for "how many in all"; "how many more / fewer" graphs may be slightly larger only if the two compared rows are still easy to count, and per-category counts stay ≤ 6 with differences in the 1–4 range.

## 10. Key ideas (6)

1. A graph can answer questions. Read the graph carefully, then answer.
2. **Most** means the longest row of pictures or the longest bar. **Fewest** means the shortest.
3. **How many in all** means count every picture (or every cell) across every row.
4. **How many more** means compare two rows. Find the bigger count and the smaller count. The gap between them is the answer.
5. **How many fewer** asks for the same gap, from the other side.
6. A statement is **true** when every number in it matches what the graph shows. If even one number is wrong, the statement is false.

(No equation symbols. Differences described as "gap" / "extra cells beyond" / "more than".)

## 11. Worked examples (5)

| # | Title | Prompt | Visual | Final answer (narration) |
|---|---|---|---|---|
| 1 | Find the most | Which category has the most? | picture graph: Fruit 3, Animals 1, Toys 4 | Toys has the longest row. Toys has the most. |
| 2 | Find the fewest | Which category has the fewest? | bar graph: Fruit 2, Animals 4, Toys 1 | Toys has the shortest bar. Toys has the fewest. |
| 3 | How many in all | How many pictures are in the whole graph? | picture graph: Fruit 2, Animals 3 (5 total) | Touch each picture: 1, 2, 3, 4, 5. There are 5 in all. |
| 4 | How many more | How many more Dogs than Cats are in the graph? | bar graph: Cats 3, Dogs 5 | Dogs has 5. Cats has 3. The gap is 2. There are 2 more Dogs than Cats. |
| 5 | True conclusion | Which sentence is true about the graph? | picture graph: Apples 2, Bananas 4 | Bananas has 2 more than Apples. (The other three sentences have at least one wrong number.) |

All narration uses Grade 1 graph language — no equation symbols anywhere.

## 12. Question categories (10) with counts

| # | Category | Pattern | Q | E / M / H |
|---|---|---|---:|:---:|
| C1 | Identify most | graph + "Which has the most?" with 4 category-name options | 14 | 5 / 5 / 4 |
| C2 | Identify fewest | graph + "Which has the fewest?" with 4 category-name options | 14 | 5 / 5 / 4 |
| C3 | How many in all | graph + "How many in all?" with 4 numeric options (total visible ≤ 10) | 12 | 3 / 5 / 4 |
| C4 | How many more | graph + "How many more X than Y?" with 4 numeric options (X > Y, gap 1–4) | 16 | 4 / 7 / 5 |
| C5 | How many fewer | graph + "How many fewer X than Y?" with 4 numeric options (X < Y, gap 1–4) | 16 | 4 / 7 / 5 |
| C6 | Compare two categories | graph + "Which sentence is true?" with 4 candidate comparison sentences | 14 | 4 / 6 / 4 |
| C7 | Choose true conclusion | graph + 4 conclusion sentences, one is correct, others have wrong numbers/categories | 14 | 4 / 6 / 4 |
| C8 | Find false conclusion | graph + 4 conclusion sentences, three are true, one is false ("Which does NOT match?") | 12 | 4 / 4 / 4 |
| C9 | Match question to answer | graph + a stated question + 4 numeric options (mix of most/fewest/total/more/fewer prompts) | 12 | 4 / 5 / 3 |
| C10 | Error repair | graph + a student's wrong statement + 4 options describing the correct fix | 11 | 3 / 5 / 3 |
| | **Total** | | **135** | **40 / 55 / 40** |

**Cat-2 vs cat-3 distribution per difficulty (applies to every category):**
- Easy → always 2-category graphs
- Medium → mix of 2-cat (varied counts) and 3-cat (small counts)
- Hard → always 3-cat graphs with similar counts (hardest comparisons)

**Picture-vs-bar graph distribution per category:** roughly 50/50, interleaved across difficulties.

## 13. Target question count

**135 questions** total.

## 14. Easy / medium / hard distribution

**40 easy / 55 medium / 40 hard.** Numeric ceilings inside each tier:
- Easy: 2 categories, counts 1–4, difference 1–3 for C4/C5
- Medium: 2-cat with counts 1–6, or 3-cat with counts 1–4; difference 1–4
- Hard: 3 categories, counts 1–5, differences 1–4 with at least two near-equal categories

Per-category counts capped at **6**; **5** in 3-cat questions. Total visible items per graph **≤ 10** for C3 ("how many in all"); for C4/C5 graphs may run slightly above 10 only if the two compared rows are still easy to count.

## 15. Visual strategy

**Reuse only — no new graph infrastructure.**

| Helper | Source | L7.4 use |
|---|---|---|
| `_u7PictureGraph(rows)` | u7.js:1330 | Picture-graph visual for half of L7.4 questions |
| `_u7BarTypeGraph(rows)` | u7.js:2942 | Bar-type-graph visual for the other half |
| `_u7TvWrap(html, cap)` | u7.js:259 | Wraps intervention teaching visuals |
| `_u7Place(opts, aIdx)` | u7.js:398 | Position correct answer at requested option slot |
| `_u7OtherCats(targetCat)` | u7.js:407 | Pick wrong-category distractors |

**New visual pieces (small, lesson-scoped):**
- `_u74TvMost()`, `_u74TvFewest()`, `_u74TvTotal()`, `_u74TvHowManyMore()`, `_u74TvHowManyFewer()`, `_u74TvCompare()`, `_u74TvTrueSentence()`, `_u74TvFalseSentence()`, `_u74TvMatchQA()`, `_u74TvErrorRepair()` — 10 teaching-visual functions wrapping the existing graph helpers, each 5–15 lines, identical pattern to the existing `_u72Tv*` / `_u73Tv*` helpers.

**Visual requirements honored:**
- every graph is scale-of-1
- max 3 categories per graph
- comparison categories are adjacent rows in the graph (the caller orders rows so X comes directly before Y in C4/C5/C6)
- no scaled key, no axes, no tick marks, no skip-count

## 16. Error tags (10)

Naming follows the existing `_7X..` two-letter convention. All declared at the top of the L7.4 section in u7.js.

| Const | Tag | Triggered by |
|---|---|---|
| `_74MF` | `err_most_fewest_confusion` | C1/C2 — picks the opposite (fewest when asked most) |
| `_74TC` | `err_total_vs_category_confusion` | C3 — counts only one category instead of the whole graph |
| `_74HMM` | `err_how_many_more_confusion` | C4 — picks the larger total instead of the gap, or picks 0 / the smaller count |
| `_74HMF` | `err_how_many_fewer_confusion` | C5 — same as above but flipped |
| `_74CW` | `err_compares_wrong_categories` | C4/C5/C6 — compares Y to Z instead of X to Y |
| `_74SD` | `err_subtracts_wrong_direction` | C4/C5 — computes smaller minus bigger instead of bigger minus smaller |
| `_74CG` | `err_counts_graph_wrong` | C1–C5 — miscounts a row or bar (off by one) |
| `_74TS` | `err_true_statement_confusion` | C6/C7 — picks a false sentence as true |
| `_74FS` | `err_false_statement_confusion` | C8 — picks a true sentence as the false one |
| `_74NS` | `err_conclusion_not_supported` | C7/C10 — picks a sentence with a category the graph does not show |

Every question carries at least one error tag per distractor. The lesson's `commonDistractors` and `errorTags` arrays list all 10 in order.

## 17. Intervention templates (10)

One intervention factory per error tag. Each returns the standard object shape used by L7.2 / L7.3:

```js
function _i74MostFewest() { return {
  errorTag: _74MF, title: 'Most is the biggest. Fewest is the smallest.',
  teachingSteps: [
    '"Most" means the biggest count — the longest row or bar.',
    '"Fewest" means the smallest count — the shortest row or bar.',
    'Compare every category before you choose.',
    'Do not pick the opposite of what is asked.'
  ],
  teachingVisualRaw: _u74TvMost(),
  correctAnswerExplanation: 'Most is the longest. Fewest is the shortest.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
```

The other nine factories follow the identical shape with content tuned to the error tag. No equation symbols in teachingSteps or correctAnswerExplanation.

| Factory | Tag | Teaches |
|---|---|---|
| `_i74MostFewest` | `_74MF` | Most is longest, fewest is shortest; do not pick the opposite |
| `_i74TotalVsCategory` | `_74TC` | "In all" means count every picture/cell across every row; one category means one row only |
| `_i74HowManyMore` | `_74HMM` | "How many more" is the gap between the bigger and the smaller count |
| `_i74HowManyFewer` | `_74HMF` | "How many fewer" asks the same gap, from the other side |
| `_i74CompareWrong` | `_74CW` | Always re-read which two categories the question names — do not drift to a different pair |
| `_i74SubtractDirection` | `_74SD` | The bigger count is on top. Start from the bigger count and find the gap down to the smaller one |
| `_i74CountsWrong` | `_74CG` | Touch each picture / cell once; do not skip; do not double-count |
| `_i74TrueSentence` | `_74TS` | A sentence is true only when every number in it matches the graph |
| `_i74FalseSentence` | `_74FS` | The false one has at least one number that does not match the graph |
| `_i74Unsupported` | `_74NS` | A conclusion has to use only categories the graph shows — never invent a new one |

## 18. Retry behavior

Every question carries:
```js
i: {
  errorTag: ...,
  title: ...,
  teachingSteps: [...],
  teachingVisualRaw: ...,
  correctAnswerExplanation: ...,
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
}
```

- Wrong answer → engine shows intervention overlay (title + teaching steps + teaching visual + correct-answer explanation).
- After dismissal → retry pulls a different question with skill `draw_conclusions_from_data`, driven by `followUpRule: 'same_skill_new_numbers'`.
- Originating question id is added to the engine's `excludeIds` so the same question never repeats inside one attempt.
- Identical pattern to L7.1 / L7.2 / L7.3 — no engine changes required.

## 19. Risks before coding

1. **No equation symbols anywhere.** Hard rule: zero `+`, `-`, `−`, `=` in any `t`, `o[i].val`, `e`, `h`, key idea, worked example, or intervention field. All differences phrased as "gap", "extra", "more than", "fewer than". Verification grep is a release gate.
2. **C9 framing.** Approved as **graph + stated question + 4 numeric options** (NOT "given an answer, pick the question"). Each C9 question's prompt explicitly states the question being answered.
3. **Distractor symmetry on C4/C5.** Distractors: smaller count alone (wrong direction misread), one-off gap, the larger raw count. Dedupe loop mirrors `_q73ReadCategoryCount` (u7.js:3188–3196) to guarantee 4 unique numeric options.
4. **True/false sentence length on small screens.** Comparison sentences like "Bananas has 2 more than Apples" can wrap badly at 414px. Keep sentence values short (one comparison clause, two short numbers, two short category names).
5. **Mixed-graph-type within one category.** Half picture, half bar. 3-cat hard questions cap per-category count at 5.
6. **Stay inside `multipleChoice`.** No `imgChoice`. The `_u7PromptWithSource` raw-HTML escape hatch is not used in L7.4.
7. **Per-category count cap.** ≤ 6 always; ≤ 5 in 3-cat questions. Differences 1–4. Total visible items ≤ 10 for C3.
8. **Lock honored: do not touch L7.1, L7.2, L7.3, Units 1–6, Unit 8, Grade 2 data analysis, `unit.js`, `quiz.js`, the unit-test system.**

## 20. Verification checklist

Run after the lesson is implemented, before locking. All must pass.

- [ ] `npm test` — all baseline tests pass (no regressions)
- [ ] `node --check src/data/g1/u7.js` returns clean (or ESM equivalent)
- [ ] Total L7.4 question count = **135**
- [ ] Per-category split matches Section 12 (C1=14, C2=14, C3=12, C4=16, C5=16, C6=14, C7=14, C8=12, C9=12, C10=11)
- [ ] Per-difficulty split = **40E / 55M / 40H**
- [ ] Every L7.4 question has `t`, `o`, `a`, `e`, `d`, `h`, `sk`, `i` keys
- [ ] Every L7.4 question has `i.followUpRule === 'same_skill_new_numbers'`
- [ ] Every L7.4 question has `i.doNotRepeatOriginalQuestion === true`
- [ ] Every L7.4 question has `sk === 'draw_conclusions_from_data'`
- [ ] Every L7.4 distractor has an `errorTag`
- [ ] All 10 error tags appear at least once
- [ ] All 10 intervention factories are referenced at least once
- [ ] **Scope scan #1 — no equation symbols:** L7.4 strings contain zero `+`, `-`, `−` (U+2212), `=` in student-facing fields
- [ ] **Scope scan #2 — no banned vocabulary:** `scale`, `scaled`, `key`, `tick`, `axis`, `axes`, `mean`, `median`, `mode`, `histogram`, `line plot`, `dot plot`, `skip-count`, `skip count` → zero matches inside L7.4 strings
- [ ] **Scope scan #3 — no Grade 2 vocabulary:** zero matches
- [ ] **Scope scan #4 — category count:** every `rows` array passed to `_u7PictureGraph` / `_u7BarTypeGraph` in L7.4 has length ≤ 3
- [ ] **Scope scan #5 — counts:** every row's `count` or `items.length` ≤ 6 (≤ 5 in 3-cat rows)
- [ ] **Scope scan #6 — total cap for C3:** sum of all row counts in C3 questions ≤ 10
- [ ] **Scope scan #7 — only multipleChoice:** L7.4 `allowedQuestionTypes === ['multipleChoice']`
- [ ] L7.1 / L7.2 / L7.3 banks untouched (`git diff` shows only L7.4 additions and the spec entry update)
- [ ] Units 1–6 and Unit 8 untouched
- [ ] Grade 2 `src/data/u6.js` untouched
- [ ] `src/unit.js` and `quiz.js` untouched
- [ ] U7 pool total after lock = **565** (430 + 135)
- [ ] Preview verify: L7.4 opens, 6 key ideas render, 5 worked examples render with visuals, quiz starts with 8 questions, intervention overlay triggers on a wrong answer, "Try a new one" pulls another L7.4 question, no console errors
- [ ] Memory file `project_g1u7_status.md` updated to reflect L7.4 lock
- [ ] Final commit message: `feat(g1u7): add Lesson 7.4 Drawing Conclusions from Data`
