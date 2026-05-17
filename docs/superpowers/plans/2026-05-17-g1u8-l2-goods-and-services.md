# Grade 1 Unit 8 Lesson 8.2 — Goods and Services · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Grade 1 Unit 8 Lesson 8.2 ("Goods and Services") — a 140-question (45 E / 55 M / 40 H) lesson that defines goods vs services, links them to L8.1's income concept, and teaches purchase-choice reasoning. Lifts U8 pool from 140 → 280.

**Architecture:** All L8.2 work lives inside `src/data/g1/u8.js` (replacing the L8.2 scaffold). Reuse L8.1 helpers (`_u8WorkerCard`, `_u8ScenarioCard`, `_u8MoneyBag`, `_u8TvWrap`, `_u8Place`). Add small new lesson-scoped helpers (`_u8GoodServicePair`, `_u8ItemGridFallback`, `_u8IncomeChainCard`). 9 intervention factories. 10 question factories. 10 question banks. No changes to L8.1 banks/helpers, L8.3/L8.4 scaffolds, L7.x banks, U1–U7 content, Grade 2/default data, `quiz.js`, `unit.js`, or the unit-test system.

**Tech Stack:** Vanilla ES module exporting `G1_U8_SPEC` from `src/data/g1/u8.js`. Build runs through `build.js` (src → dist). Tests: `npm test` (130/130 baseline). Preview verification on 414px viewport.

---

## 1. Lesson title

**Goods and Services**

## 2. TEKS alignment

**TEKS 1.9B** — Identify income as a means of obtaining goods and services, oftentimes making choices about what to purchase.

## 3. Skill name

`goods_and_services` — already declared in the L8.2 scaffold.

## 4. Exact scope

- **Goods** = things people can hold, use, eat, wear, read, or own
- **Services** = work that someone does to help others
- **Purchase choice** = matching a good or service to a situation
- **Wants/needs vocabulary** is supporting context for purchase-choice scenarios (1 category, ~12 questions in C8 only)

## 5. What stays out of scope

- ❌ `$` / `¢` symbols
- ❌ coin names, coin values, coin counting
- ❌ dollar/cents amounts in any string
- ❌ price tags, receipts, making change, money math
- ❌ spending/saving (L8.3), charitable giving (L8.4)
- ❌ taxes, interest, percentages
- ❌ wants/needs as the primary skill
- ❌ "wants" / "needs" outside C8 prompts
- ❌ Grade 2 financial-literacy content
- ❌ touching L8.1, L8.3, L8.4 scaffolds, Units 1–7, Grade 2/default
- ❌ touching `quiz.js`, `unit.js`, unit-test system

## 6. How this differs from L8.1

L8.1 = define income (1.9A). L8.2 = identify income's purpose (obtaining goods and services) and make purchase choices (1.9B). L8.2 assumes L8.1's foundation: every scenario uses "income" as already-defined money earned by working.

## 7. How this builds toward L8.3 and L8.4

L8.3 (spend vs save): the spending side specifically means using income to obtain a good or service (L8.2's territory). L8.4 (charitable giving): donations are gifts of goods/services to help others — L8.2's vocabulary makes those concrete.

## 8. How this differs from Kindergarten financial literacy

K U8 L2 covers wants vs needs as a classification skill (K.9D). L8.2 covers goods vs services (1.9B) — different TEKS. Wants/needs in L8.2 is **supporting context** only (~12 questions in C8), never the assessed skill.

## 9. How this differs from Grade 2 financial literacy

G2 U5 uses dollar amounts, multi-coin counting, and mixes wants/needs into a save/spend framework. L8.2 has zero money math, zero coin imagery, and isolates wants/needs to one supporting category.

## 10. Key ideas (6)

1. **Goods** are things people can have or use — like a book, an apple, a shirt, a toy, a backpack, or a pair of shoes.
2. **Services** are work that people do to help others — like a haircut, a doctor visit, a bus ride, or a teacher teaching.
3. People can use **income** to obtain goods.
4. People can use **income** to obtain services.
5. People make **choices** about what to obtain with their income — they pick the good or service that fits their situation.
6. To tell goods from services, ask: **"Is it a thing, or is it work someone does?"** A thing is a good. Work that helps others is a service.

## 11. Worked examples (5)

1. **What is a good?** — book card → "A book is a thing you can hold, open, and read. A book is a good."
2. **What is a service?** — haircut card → "A haircut is work that someone does for you. A haircut is a service."
3. **Goods vs services** — hat vs dentist → "A hat is a thing you wear (good). A dentist cleaning teeth is work (service)."
4. **Income obtains goods** — income → backpack → "A backpack is a good. Maya's income obtained a good."
5. **Income obtains services** — income → mechanic fixing car → "The mechanic does work. Dad's income obtained a service."

## 12. Question categories (10) with counts

| # | Category | Pattern | Type | Q | E / M / H |
|---|---|---|---|---:|:---:|
| C1 | Identify goods | "Tap the picture that shows a good." (4-card) | imgChoice | 16 | 5 / 6 / 5 |
| C2 | Identify services | "Tap the picture that shows a service." (4-card) | imgChoice | 16 | 5 / 6 / 5 |
| C3 | Goods vs services | Item card + binary text MC | multipleChoice | 18 | 6 / 7 / 5 |
| C4 | Match scenario to good/service | Scenario sentence + text MC | multipleChoice | 14 | 5 / 5 / 4 |
| C5 | Income → goods | Income-chain visual + text MC | multipleChoice | 12 | 4 / 5 / 3 |
| C6 | Income → services | Income-chain visual + text MC | multipleChoice | 12 | 4 / 5 / 3 |
| C7 | Purchase choice | Scenario + 4 tappable cards | imgChoice | 14 | 4 / 6 / 4 |
| C8 | Wants/needs supporting context | Scenario invoking need + text MC item choices | multipleChoice | 12 | 3 / 5 / 4 |
| C9 | Error repair | Wrong claim + correct fix text MC | multipleChoice | 12 | 4 / 5 / 3 |
| C10 | True sentence / mixed review | True/false sentences text MC | multipleChoice | 14 | 5 / 5 / 4 |
| | **Total** | | | **140** | **45 / 55 / 40** |

**imgChoice count: 46** (C1=16 + C2=16 + C7=14).

## 13. Target question count

**140 questions**.

## 14. Easy / medium / hard distribution

**45 E / 55 M / 40 H** — matches L8.1 envelope.

## 15. Visual strategy

Reuse L8.1's `_u8WorkerCard` (fixed 108px width, equal-size enforced), `_u8ScenarioCard`, `_u8MoneyBag`, `_u8TvWrap`, `_u8Place`. Add three lesson-scoped helpers:
- `_u8GoodServicePair(goodEmoji, goodLabel, serviceEmoji, serviceLabel)` — 2-card vs pair for C3 visuals and teaching visuals
- `_u8ItemGridFallback(items, letters)` — 4-card grid fallback for C1/C2/C7 review mode
- `_u8IncomeChainCard(incomeHtml, resultHtml)` — 💰 → result chain visual for C5/C6

Canonical catalogs:
- **Goods (13):** 📕 book, 🍎 apple, 👕 shirt, 🎒 backpack, ✏️ pencil, 👟 shoes, 🥪 sandwich, 🥛 milk, 🧢 hat, 🍞 bread, 🚲 bike, 🪥 toothbrush, 🍌 banana
- **Services (10):** 💇 haircut, 🚌 bus ride, 👨‍⚕️ doctor visit, 👩‍🏫 teacher teaching, 🔧 mechanic fixing a car, 🚿 plumber fixing a sink, 📚 librarian helping kids find books, 🐾 vet caring for animals, 🦷 dentist cleaning teeth, 📫 mail carrier delivering

Goods and services cards use the **same visual format** (`_u8WorkerCard` with emoji + label) — no badges or color hints that give away the category.

## 16. Error tags (9)

| Const | Tag | Triggered by |
|---|---|---|
| `_82GS` | `err_good_vs_service_confusion` | Picks the wrong category |
| `_82GD` | `err_good_definition_confusion` | C1 — picks a service when asked for a good |
| `_82SD` | `err_service_definition_confusion` | C2 — picks a good when asked for a service |
| `_82IP` | `err_income_purchase_confusion` | C5/C6 — confuses what income obtained |
| `_82PC` | `err_purchase_choice_confusion` | C7/C8 — picks something that doesn't fit the scenario |
| `_82WN` | `err_want_need_context_confusion` | C8 — drifts away from picking the matching purchase |
| `_82WS` | `err_worker_service_confusion` | Confuses the worker (person) with the service (work) |
| `_82IS` | `err_item_service_confusion` | Calls a thing a service because "people pay for it" |
| `_82NS` | `err_category_not_supported` | Picks an unrelated category |

## 17. Intervention factories (9)

One per error tag, matching L8.1's `_i81*` shape (`title`, `teachingSteps[]`, `teachingVisualRaw`, `correctAnswerExplanation`, `followUpRule: 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion: true`).

## 18. Retry behavior

Same as L8.1 — `same_skill_new_numbers` retry; threshold via `_shouldShowFullIntervention`; engine handles imgChoice and multipleChoice paths identically.

## 19. Risks before coding

1. Restaurant/meal edge case (food + service mix) — avoid entirely
2. Cook/baker ambiguity (worker = service; the food = good) — keep cards precise
3. Wants/needs vocabulary creep into C7 — use neutral framings ("is broken", "is hungry", "is sick") in C7; only C8 prompts use "needs"
4. Dollar amount temptation — zero `$`, zero `¢` in any string
5. Visual hints — goods cards and services cards must look identical (same `_u8WorkerCard` helper)
6. C7 vs C8 boundary — C7 = general purchase fit; C8 = need-framed purchase fit
7. L8.1 dependency — leave L8.1 helpers strictly untouched
8. Equal-size cards — inherited from `_u8WorkerCard` fixed-width
9. Service emoji clarity — pair emoji with explicit work-doing label always

## 20. Verification checklist

- [ ] `npm test` 130/130 pass
- [ ] `npm run build` clean
- [ ] L8.2.quizBank.length === 140
- [ ] Per-category split: C1=16, C2=16, C3=18, C4=14, C5=12, C6=12, C7=14, C8=12, C9=12, C10=14
- [ ] 45E / 55M / 40H
- [ ] Every L8.2 question has `t, o, a, e, d, h, sk, i`
- [ ] Every L8.2 question has `i.followUpRule === 'same_skill_new_numbers'` and `i.doNotRepeatOriginalQuestion === true`
- [ ] Every L8.2 question has `sk === 'goods_and_services'`
- [ ] Every L8.2 distractor has an `errorTag`
- [ ] All 9 error tags appear at least once
- [ ] All 9 intervention factories referenced at least once
- [ ] **imgChoice count: 46** (C1=16 + C2=16 + C7=14)
- [ ] Scope scan #1: zero `$` in L8.2 strings
- [ ] Scope scan #2: zero `¢` in L8.2 strings
- [ ] Scope scan #3: zero digit-currency patterns
- [ ] Scope scan #4: zero banned vocabulary (penny/nickel/dime/quarter/coin/spend/save/donate/donation/charity)
- [ ] Scope scan #5: "want" / "wants" / "need" / "needs" appear **only in C8 prompts** (≤12 questions)
- [ ] Scope scan #6: `allowedQuestionTypes === ['multipleChoice', 'imgChoice']`
- [ ] Scope scan #7: no coin_assets references
- [ ] L8.1 banks/helpers untouched
- [ ] L8.3 / L8.4 scaffolds untouched (`quizBank.length === 0` each)
- [ ] L7.x banks untouched; U1–U7 still resolve
- [ ] U8 pool = 280 (140 L8.1 + 140 L8.2)
- [ ] Preview: L8.2 opens, 6 key ideas, 5 examples with visuals, quiz starts at "Question 1 of 8", at least one C1/C2 imgChoice and one C7 imgChoice render with tappable cards (no text buttons below), intervention overlay fires after 2 wrong, retry stays in L8.2, no L8.2-specific console errors
- [ ] Memory file `project_g1u8_status.md` updated
- [ ] Commit message: `feat(g1u8): add Lesson 8.2 Goods and Services`
