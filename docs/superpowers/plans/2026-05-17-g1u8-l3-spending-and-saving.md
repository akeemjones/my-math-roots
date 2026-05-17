# Grade 1 Unit 8 Lesson 8.3 — Spending and Saving · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Grade 1 Unit 8 Lesson 8.3 ("Spending and Saving") — a 150-question (45 E / 60 M / 45 H) lesson that distinguishes spending (using income now) from saving (keeping income for later). Lifts U8 pool from 280 → 430.

**Architecture:** All L8.3 work lives inside `src/data/g1/u8.js` (replacing the L8.3 scaffold). Reuse L8.1/L8.2 helpers (`_u8WorkerCard`, `_u8ScenarioCard`, `_u8MoneyBag`, `_u8IncomeChainCard`, `_u8ItemGridFallback`, `_u8TvWrap`, `_u8Place`). No new top-level helpers required. 9 intervention factories. 10 question factories. 10 question banks. No changes to L8.1/L8.2 banks/helpers, L8.4 scaffold, L7.x banks, U1–U7 content, Grade 2/default data, `quiz.js`, `unit.js`, or the unit-test system.

**Tech Stack:** Vanilla ES module exporting `G1_U8_SPEC` from `src/data/g1/u8.js`. Build runs through `build.js` (src → dist). Tests: `npm test` (130/130 baseline). Preview verification on 414px viewport.

---

## 1. Lesson title

**Spending and Saving**

## 2. TEKS alignment

**TEKS 1.9C** — Distinguish between spending and saving.

## 3. Skill name

`spending_and_saving` — already declared in the L8.3 scaffold.

## 4. Exact scope

- **Spending** = using income now to obtain a good or service
- **Saving** = keeping income for later (often for a future goal)
- **Choice** = decide whether to spend now or save for later

**Delayed-spending rule (locked):** if income is kept for a future purchase, it counts as **saving**, regardless of intended future use. Spending requires the income to be used *right now*.

## 5. What stays out of scope

- ❌ `$` / `¢` symbols
- ❌ coin names, coin values, coin counting
- ❌ dollar/cents amounts in any string
- ❌ exact prices, price tags, receipts, making change, money math
- ❌ charitable giving (L8.4), donations, charity (any form)
- ❌ "give" / "giving" / "gave" in the donation sense (L8.4 territory)
- ❌ taxes, interest, percentages, fractions
- ❌ wants vs needs as a classification skill (K.9D, not G1 1.9C)
- ❌ Grade 2 financial-literacy content
- ❌ touching L8.1, L8.2, L8.4 scaffold, Units 1–7, Grade 2/default
- ❌ touching `quiz.js`, `unit.js`, unit-test system

## 6. How this differs from L8.1

L8.1 = define income (1.9A). L8.3 = what to do with income (1.9C). L8.3 assumes L8.1's "income is money earned by working" foundation.

## 7. How this differs from L8.2

L8.2 = identify what income obtains (goods or services). L8.3 = when does income get used (now vs later). L8.3 reuses L8.2's goods/services vocabulary in C7 ("spending obtains goods/services").

## 8. How this builds toward L8.4

L8.4 (Charitable Giving, 1.9D) extends the spend-vs-save binary into a three-way frame: spend / save / give. L8.3's "what to do with income" mental hook becomes a 3-option choice in L8.4.

## 9. How this differs from Kindergarten financial literacy

K U8 covers earning (K.9A-C) + wants/needs (K.9D). No save/spend classification in K. L8.3 uses different vocabulary entirely.

## 10. How this differs from Grade 2 financial literacy

G2 U5 uses dollar amounts and multi-coin counting in save/spend/give scenarios. L8.3 is purely conceptual — zero money math, zero coin imagery.

## 11. Key ideas (6)

1. **Spending** means using income now to get a good or service.
2. **Saving** means keeping income for later.
3. People can spend income today, or they can save income for a future goal.
4. Saving for a future goal means setting income aside instead of using it now.
5. Spending gets goods or services right away. Saving keeps the income for the future.
6. To tell spending from saving, ask: **"Is the income being used now, or kept for later?"**

## 12. Worked examples (5)

1. **What is spending?** — book card → "Spending means using income now to get a good or service."
2. **What is saving?** — piggy-bank card → "Saving means keeping income for later."
3. **Identify spending** — "Maya gets a book today" → spending.
4. **Identify saving** — "Lin keeps income in a jar for a bike later" → saving.
5. **Spend now vs save for later** — "Nia has a future goal" → save income for the goal.

## 13. Question categories (10) with counts

| # | Category | Pattern | Type | Q | E / M / H |
|---|---|---|---|---:|:---:|
| C1 | Define spending | text MC, definition options | multipleChoice | 12 | 4 / 5 / 3 |
| C2 | Define saving | text MC, definition options | multipleChoice | 12 | 4 / 5 / 3 |
| C3 | Identify spending | 4-card imgChoice (1 spend + 3 save) | imgChoice | 18 | 6 / 7 / 5 |
| C4 | Identify saving | 4-card imgChoice (1 save + 3 spend) | imgChoice | 18 | 6 / 7 / 5 |
| C5 | Spend now vs save for later | scenario + 4 text decision options | multipleChoice | 16 | 5 / 6 / 5 |
| C6 | Match action to jar | 2-card imgChoice (1 saving jar + 1 spending action) | imgChoice (2-card) | 14 | 4 / 6 / 4 |
| C7 | Spending obtains goods/services | scenario + 4 text options linking to L8.2 | multipleChoice | 12 | 3 / 5 / 4 |
| C8 | Error repair | claim + correct fix | multipleChoice | 14 | 4 / 5 / 5 |
| C9 | True sentence / mixed review | 4 text sentences | multipleChoice | 16 | 5 / 7 / 4 |
| C10 | Visual choice (mixed) | 2-card imgChoice with mixed prompts | imgChoice (2-card) | 18 | 4 / 7 / 7 |
| | **Total** | | | **150** | **45 / 60 / 45** |

**imgChoice count: 68** (C3=18 + C4=18 + C6=14 + C10=18). 4-card: **36** (C3 + C4). 2-card: **32** (C6 + C10).

## 14. Target question count

**150 questions** total.

## 15. Easy / medium / hard distribution

**45 E / 60 M / 45 H.**

## 16. Visual strategy

Reuse L8.1/L8.2 helpers. No new top-level helpers needed.

Scenario catalog:
- **Spending scenarios:** "gets a book today", "buys an apple today", "gets a shirt today", "pays for a haircut today", "pays for a bus ride today", "pays for a doctor visit today", etc. Emoji = the obtained good or service (📕, 🍎, 💇, 🚌, …)
- **Saving scenarios:** "saves for a bike later", "keeps income for later", "saves for new shoes later", "puts income in a jar", "saves for a future trip", etc. Emoji = 🐷 (piggy bank) or 🏺 (jar)

All scenario cards use `_u8WorkerCard(emoji, label)` — equal-size by construction. Spending and saving cards use the SAME visual format — no styling clue.

## 17. Error tags (9)

| Const | Tag |
|---|---|
| `_83SS` | `err_spend_vs_save_confusion` |
| `_83SD` | `err_spending_definition_confusion` |
| `_83VD` | `err_saving_definition_confusion` |
| `_83NL` | `err_now_vs_later_confusion` |
| `_83GS` | `err_goal_saving_confusion` |
| `_83IU` | `err_income_use_confusion` |
| `_83GP` | `err_good_service_spending_confusion` |
| `_83SA` | `err_saving_as_spending_confusion` |
| `_83NS` | `err_category_not_supported` |

## 18. Intervention factories (9)

One per error tag, matching L8.1/L8.2's `_i8X*` shape (`title`, `teachingSteps[]`, `teachingVisualRaw`, `correctAnswerExplanation`, `followUpRule: 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion: true`).

## 19. Retry behavior

Same as L8.1/L8.2 — `same_skill_new_numbers` retry; threshold via `_shouldShowFullIntervention`; engine handles imgChoice and multipleChoice paths identically.

## 20. Risks before coding

1. Zero `$` and zero `¢` in any string
2. "Delayed spending" rule — kept income = saving, regardless of intent
3. Goal-saving framing locked: "saves for X later" = saving
4. No "give/giving/gave" in donation sense (L8.4 territory)
5. No wants/needs vocabulary
6. "Spend" and "save" ARE the lesson topic — scope scan must NOT flag them
7. L8.1/L8.2 banks and helpers stay strictly untouched
8. Card sizing inherited from `_u8WorkerCard` fixed 108px
9. C6 saving jar uses 🐷 emoji prominently; spending card uses good/service emoji
10. C10 mixed prompts: half ask "Tap spending", half ask "Tap saving"

## 21. Verification checklist

- [ ] `npm test` 130/130 pass
- [ ] `npm run build` clean
- [ ] L8.3.quizBank.length === 150
- [ ] Per-category split: C1=12, C2=12, C3=18, C4=18, C5=16, C6=14, C7=12, C8=14, C9=16, C10=18
- [ ] 45E / 60M / 45H
- [ ] All required keys + interventions
- [ ] All 9 error tags appear at least once
- [ ] All 9 intervention factories referenced at least once
- [ ] **imgChoice count: 68** (C3+C4+C6+C10)
- [ ] **4-card imgChoice: 36** (C3 + C4); **2-card imgChoice: 32** (C6 + C10)
- [ ] Scope scan #1: zero `$` in L8.3 strings
- [ ] Scope scan #2: zero `¢` in L8.3 strings
- [ ] Scope scan #3: zero digit-currency patterns
- [ ] Scope scan #4: zero banned vocabulary (coin/penny/nickel/dime/quarter/price/cost/tax/donate/donation/charity)
- [ ] Scope scan #5: no "give/giving/gave" in donation sense
- [ ] Scope scan #6: no `\bwants\b` or `\bneeds\b` financial-literacy noun usage
- [ ] Scope scan #7: `allowedQuestionTypes === ['multipleChoice', 'imgChoice']`
- [ ] Scope scan #8: no coin_assets references
- [ ] L8.1 / L8.2 banks/helpers untouched
- [ ] L8.4 scaffold untouched
- [ ] L7.x banks untouched; U1–U7 still resolve
- [ ] U8 pool = 430
- [ ] Preview: L8.3 opens, 6 key ideas, 5 examples, quiz starts at Q1/8, imgChoice 4-card + 2-card both render with tappable equal-size cards (no text buttons below), intervention overlay fires after 2 wrong, retry stays in L8.3, no L8.3-specific console errors
- [ ] Memory file `project_g1u8_status.md` updated
- [ ] Commit message: `feat(g1u8): add Lesson 8.3 Spending and Saving`
