# Grade 1 Unit 8 Lesson 8.4 — Charitable Giving · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Grade 1 Unit 8 Lesson 8.4 ("Charitable Giving") — a 130-question (40E / 55M / 35H) lesson that introduces giving as a third choice alongside L8.3's spend/save binary. Lifts U8 pool from 430 → 560. **Locking L8.4 completes Unit 8 and the entire Grade 1 curriculum.**

**Architecture:** All L8.4 work lives inside `src/data/g1/u8.js` (replacing the L8.4 scaffold). Reuse L8.1/L8.2/L8.3 helpers. No new top-level helpers required. 9 intervention factories. 10 question factories. 10 question banks. No changes to L8.1/L8.2/L8.3 banks/helpers, L7.x banks, U1–U7 content, Grade 2/default data, `quiz.js`, `unit.js`, or the unit-test system.

---

## 1. Lesson title

**Charitable Giving**

## 2. TEKS alignment

**TEKS 1.9D** — Consider charitable giving.

## 3. Skill name

`charitable_giving` — already declared in the L8.4 scaffold.

## 4. Exact scope

- **Charitable giving** = sharing money or resources to help others
- Giving is **different from spending** (spending for self; giving for others)
- Giving is **different from saving** (saving for self's later; giving shared with others)
- Recipients: **food banks, animal shelters, school drives, park cleanups, families who need help**
- **Spend / save / give** as three different choices

**Tone locked as neutral:** "can give" / "may choose to give" / "people may decide to give" / "sharing to help others." Never "should" or "must." No guilt. No religious tithing. No political causes. No deservingness judgments.

## 5. What stays out of scope

- ❌ `$` / `¢` / dollar / cents amounts
- ❌ coin names, prices, money math
- ❌ taxes, interest, percentages, fractions
- ❌ religious tithing (tithe / church / synagogue / mosque / temple / religious offering)
- ❌ political causes (party names, political campaigns)
- ❌ guilt language ("should", "must", "feel bad", "selfish")
- ❌ deservingness judgments (no "deserve(s)" in recipient context, no ranking recipients)
- ❌ sad / extreme / distressing imagery
- ❌ multi-step money word problems
- ❌ Grade 2 financial-literacy content
- ❌ wants vs needs classification
- ❌ touching L8.1 / L8.2 / L8.3 banks and helpers, Units 1–7, Grade 2/default
- ❌ touching `quiz.js`, `unit.js`, unit-test system

## 6. How this differs from L8.1

L8.1 = define income (1.9A). L8.4 = consider giving as a use of income (1.9D). L8.1 banned "give" in donation sense; L8.4 makes "give" the lesson topic.

## 7. How this differs from L8.2

L8.2 = identify goods/services obtained by income (1.9B). L8.4 = consider giving income to help others (1.9D). L8.4 references L8.2's vocabulary but the assessed skill is giving identification.

## 8. How this differs from L8.3

L8.3 = distinguish spending from saving (1.9C). L8.4 = consider charitable giving as a third option, extending spend-vs-save into spend / save / give three-way framing.

## 9. How this differs from Kindergarten financial literacy

K U8 covers earning + gifts + skills + wants/needs. No charitable giving content in K — that's a G1 standard (1.9D).

## 10. How this differs from Grade 2 financial literacy

G2 U5 includes save/spend/give with multi-coin counting and dollar amounts. L8.4 is purely conceptual — zero money math.

## 11. Key ideas (6)

1. **Charitable giving** means sharing money or resources to help others.
2. Giving is different from **spending** — spending uses income for yourself; giving uses income to help others.
3. Giving is different from **saving** — saving keeps income for later; giving shares income with others.
4. People can choose to give to a **food bank**, an **animal shelter**, a **school supply drive**, a **park cleanup**, or families who need help.
5. People may choose to **spend, save, or give** — it is their choice. Giving is one of three options.
6. To tell giving from spending or saving, ask: **"Is this sharing to help others?"**

## 12. Worked examples (5)

1. **What is charitable giving?** — helping-hands card → "Giving means sharing money or resources to help others."
2. **Identify giving** — "Maya shares some income to help a food bank" → yes, giving.
3. **Not giving** — "Lin keeps income in a jar for a bike later" → no, that's saving.
4. **Giving vs spending** — "Nia buys a backpack for herself" → spending. "Nia shares income to help families" → giving.
5. **Spend / save / give** — three-card row → Sam can spend / save / give.

## 13. Question categories (10) with counts

| # | Category | Pattern | Type | Q | E / M / H |
|---|---|---|---|---:|:---:|
| C1 | Define charitable giving | text MC, definition options | multipleChoice | 10 | 3 / 4 / 3 |
| C2 | Identify giving | scenario + Yes/No-with-reason | multipleChoice | 14 | 4 / 6 / 4 |
| C3 | Not giving | non-giving scenario + Yes/No-with-reason | multipleChoice | 12 | 4 / 5 / 3 |
| C4 | Giving vs spending | 2-card imgChoice (1 giving + 1 spending) | imgChoice (2-card) | 14 | 5 / 6 / 3 |
| C5 | Giving vs saving | 2-card imgChoice (1 giving + 1 saving) | imgChoice (2-card) | 14 | 5 / 6 / 3 |
| C6 | Choose giving example | 4-card imgChoice (1 giving + 3 non-giving) | imgChoice (4-card) | 16 | 5 / 7 / 4 |
| C7 | Who/what can be helped | 4-card imgChoice ("Which shows giving to help others?") | imgChoice (4-card) | 14 | 4 / 6 / 4 |
| C8 | Spend / save / give | Scenario + 4 text options (spend / save / give / other) | multipleChoice | 14 | 4 / 6 / 4 |
| C9 | Error repair | Wrong claim + correct fix | multipleChoice | 12 | 3 / 5 / 4 |
| C10 | True sentence / mixed review | "Which sentence is true about spending, saving, and giving?" | multipleChoice | 10 | 3 / 4 / 3 |
| | **Total** | | | **130** | **40 / 55 / 35** |

**imgChoice count: 58** (C4=14 + C5=14 + C6=16 + C7=14). **4-card: 30** (C6 + C7). **2-card: 28** (C4 + C5).

## 14. Target question count

**130 questions** total.

## 15. Easy / medium / hard distribution

**40 E / 55 M / 35 H.**

## 16. Visual strategy

Reuse L8.1/L8.2/L8.3 helpers. No new top-level helpers needed.

**Giving-scenario catalog (12+):** food bank (🥫), animal shelter (🐾), school supply drive (🎒), park cleanup (🌳), donation basket (🧺), helping hands (🤝), heart (❤️), library book drive (📚), food sharing (🥕), community garden (🌱), helping neighbors (🧑‍🤝‍🧑).

**Spending and saving catalogs** carry forward from L8.3.

All cards use the same `_u8WorkerCard` helper — no styling clue between categories.

## 17. Error tags (9)

| Const | Tag |
|---|---|
| `_84GD` | `err_giving_definition_confusion` |
| `_84GS` | `err_give_vs_spend_confusion` |
| `_84GV` | `err_give_vs_save_confusion` |
| `_84HO` | `err_helping_others_confusion` |
| `_84SP` | `err_self_purchase_as_giving` |
| `_84SA` | `err_saving_as_giving` |
| `_84CE` | `err_charity_example_confusion` |
| `_84TC` | `err_three_choice_confusion` |
| `_84NS` | `err_category_not_supported` |

## 18. Intervention factories (9)

One per error tag, following L8.1/L8.2/L8.3's `_i8X*` shape (`title`, `teachingSteps[]`, `teachingVisualRaw`, `correctAnswerExplanation`, `followUpRule: 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion: true`).

## 19. Retry behavior

Same as L8.1–L8.3 — `same_skill_new_numbers` retry; threshold via `_shouldShowFullIntervention`.

## 20. Risks before coding

1. Zero `$` and zero `¢` in any string
2. Zero religious tithing vocabulary
3. Zero political causes / symbols
4. Zero guilt language ("should", "must", "feel bad", "selfish")
5. Zero deservingness judgments
6. "Give" / "giving" / "gave" / "given" is the lesson topic in L8.4 — scope scan must allow them
7. "Mom gives Maya income" type income-source phrasings avoided in L8.4 to prevent confusion
8. L8.1/L8.2/L8.3 banks and helpers stay strictly untouched
9. Three-way spend/save/give confusion — C8 must clearly anchor all three options
10. Card sizing inherited from `_u8WorkerCard` fixed 108px

## 21. Verification checklist

- [ ] `npm test` 130/130 pass
- [ ] `npm run build` clean
- [ ] L8.4.quizBank.length === 130
- [ ] Per-category split: C1=10, C2=14, C3=12, C4=14, C5=14, C6=16, C7=14, C8=14, C9=12, C10=10
- [ ] 40E / 55M / 35H
- [ ] All required keys + interventions
- [ ] All 9 error tags appear at least once
- [ ] All 9 intervention factories referenced at least once
- [ ] **imgChoice count: 58** (C4+C5+C6+C7)
- [ ] **4-card imgChoice: 30** (C6 + C7); **2-card imgChoice: 28** (C4 + C5)
- [ ] Scope scan #1: zero `$` in L8.4 strings
- [ ] Scope scan #2: zero `¢` in L8.4 strings
- [ ] Scope scan #3: zero digit-currency patterns
- [ ] Scope scan #4: zero banned vocabulary (coin/penny/nickel/dime/quarter/price/cost/tax/interest/percent)
- [ ] Scope scan #5: zero religious tithing (tithe/church/synagogue/mosque/temple)
- [ ] Scope scan #6: zero political causes
- [ ] Scope scan #7: zero guilt language ("should give", "must give", "feel bad", "selfish")
- [ ] Scope scan #8: zero deservingness judgments
- [ ] Scope scan #9: `allowedQuestionTypes === ['multipleChoice', 'imgChoice']`
- [ ] Scope scan #10: no coin_assets references
- [ ] L8.1 / L8.2 / L8.3 banks/helpers untouched
- [ ] L7.x banks untouched; U1–U7 still resolve
- [ ] **U8 pool = 560** (content-complete)
- [ ] Preview: L8.4 opens, 6 key ideas, 5 examples, quiz starts at Q1/8, imgChoice 4-card + 2-card both render with tappable equal-size cards (no text buttons below), intervention overlay fires after 2 wrong, retry stays in L8.4, no L8.4-specific console errors
- [ ] Memory file `project_g1u8_status.md` updated to reflect **Unit 8 content-complete**
- [ ] Commit message: `feat(g1u8): add Lesson 8.4 Charitable Giving (Unit 8 complete)`
