# Grade 1 Unit 8 Lesson 8.1 — Earning Income · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Grade 1 Unit 8 Lesson 8.1 ("Earning Income") — a 140-question (45 E / 55 M / 40 H) foundational lesson that defines income as money earned by working. Lifts the U8 pool from 0 → 140 and is the foundation L8.2 / L8.3 / L8.4 build on.

**Architecture:** All L8.1 work lives inside `src/data/g1/u8.js` (replacing the L8.1 scaffold). New unit-scoped helpers (icon cell, worker card, scenario card, work-vs-rest pair, gift-vs-work pair, job grid, money-bag/gift-box income markers, teaching-visual wrapper, option-placer). 8 intervention factories. 9 question factories. 9 question banks (C1–C9). No new top-level infrastructure; no changes to L8.2 / L8.3 / L8.4 scaffolds, L7.x banks, U1–U7 content, Grade 2/default data, `quiz.js`, `unit.js`, or the unit-test system.

**Tech Stack:** Vanilla ES module exporting `G1_U8_SPEC` from `src/data/g1/u8.js`. Build runs through `build.js` (src → dist). Tests: `npm test` (130/130 baseline). Preview verification on 414px viewport.

---

## 1. Lesson title

**Earning Income**

## 2. TEKS alignment

**TEKS 1.9A** — Define money earned as income.

L8.1 is the only lesson that touches 1.9A. L8.2 covers 1.9B, L8.3 covers 1.9C, L8.4 covers 1.9D.

## 3. Skill name

`earning_income` — already declared in the L8.1 scaffold. Reuse without renaming.

## 4. Exact scope

L8.1 is the **foundational** lesson in Unit 8. After L8.1 the student is fluent in three distinctions:

- **Working vs not working** — only working earns income; playing, resting, sleeping, and eating do not
- **Earning vs receiving (gift)** — money you work for is income; money handed to you for free is a gift
- **Jobs and skills** — every kind of work needs skills (cooking, teaching, building, caring); skills are how people do their work and earn income

**Income definition (Grade 1 wording, locked):** *Income is money earned by working.* Income comes from doing work — that work can be a job at a workplace, selling things, or doing paid chores. The Grade 1 standard is that **any paid work earns income, including paid kid work** (walking dogs for pay, mowing a lawn for pay, watering plants for pay, selling lemonade). Paid kid work counts as earning income because work was done in exchange for pay.

## 5. What stays out of scope

Hard guardrails — enforced by automated scope scans before locking:

- ❌ coin identification (penny, nickel, dime, quarter) — K.4A territory
- ❌ coin values, coin counting — K.4A / G2 2.5A
- ❌ `$` symbol in any student-facing string
- ❌ `¢` symbol in any student-facing string
- ❌ any explicit dollar amount or cents amount in any prompt, option, explanation, hint, key idea, worked example, or intervention text
- ❌ price tags, receipts, payment-amount visuals
- ❌ spending choices (L8.3)
- ❌ saving choices (L8.3)
- ❌ charitable giving (L8.4)
- ❌ buying goods or services as the assessed skill (L8.2)
- ❌ wants-vs-needs as a skill or vocabulary (K.9D, not G1)
- ❌ taxes, interest, percentages, fractions
- ❌ multi-step word problems, more than one operation
- ❌ Grade 2 financial-literacy content
- ❌ Grade 2 default Unit 5 lesson IDs, item IDs, or visuals
- ❌ tap-group / sort-order / input-number / drag-drop / imgChoice — `multipleChoice` only
- ❌ touching L8.2 / L8.3 / L8.4 scaffolds, Units 1–7, Unit 8 infrastructure
- ❌ touching `quiz.js`, `unit.js`, the unit-test system, global quiz logic
- ❌ wording that implies "only adult careers earn income" or "kids cannot earn income"

## 6. How this differs from Kindergarten financial literacy

K U8 L1 "Earning Money & Jobs" ([src/data/k/u10.js](src/data/k/u10.js)) covers K.9A + K.9B + K.9C combined.

| Kindergarten L1 | Grade 1 L8.1 |
|---|---|
| TEKS K.9A + K.9B + K.9C in one lesson | TEKS 1.9A only |
| Uses `$N` dollar amounts (`$3`, `$5`, `$8`, `$10`) throughout | **Zero `$` or `¢` symbols, zero numeric money amounts** |
| ~44 questions (18E / 16M / 10H) | 140 questions (45E / 55M / 40H) |
| Mostly adult-job scenarios with some paid-kid (lemonade, lawn mowing) | Mixed adult-job + paid-kid scenarios with explicit "paid kid work counts as income" framing |
| 3-option distractors with `err_same` / `err_confused` tags | 4-option distractors with full L8.1 error tag coverage |
| `emojiV` pair visuals only | Worker-card + scenario-pair + job-grid + work-vs-rest visuals |
| No retry behavior beyond engine default | `same_skill_new_numbers` + `doNotRepeatOriginalQuestion: true` on every question |

**Key elevation:** L8.1 is *conceptually purer* than K's L1 because it strips the dollar amounts. Students focus on whether work happened (and was paid), not on what amount was paid. The K-graduate arrives able to recognize "Maya sold lemonade for $3 = earned" — L8.1 widens the reasoning to "Maya sold lemonade and was paid = earned" so the concept is portable to scenarios without dollar amounts.

## 7. How this differs from Grade 2 financial literacy

G2 default Unit 5 "Money & Financial Literacy" ([src/data/u5.js](src/data/u5.js)) covers coins, counting coins, dollars-and-cents notation, and a mixed save/spend/give lesson.

| Grade 2 U5 | Grade 1 L8.1 |
|---|---|
| 4 lessons, ~360 questions across coins / counting / dollars-cents / save-spend-give | 1 lesson, 140 questions on income only |
| Heavy coin imagery (PNG photos, SVG glyphs, base64 assets) | Zero coin imagery |
| Dollars-and-cents notation (`$2.50`, `7¢`) | Zero `$` or `¢` notation |
| Multi-coin counting context | Zero counting context |
| Mixes earning, spending, saving, giving | Earning only |

**Risk of duplicating Grade 2 content:** essentially zero.

## 8. How this builds toward L8.2, L8.3, and L8.4

L8.1 is the foundation. Every subsequent L8 lesson presupposes the student knows what income is:

| Lesson | Depends on L8.1 because… |
|---|---|
| **L8.2 Goods and Services** (1.9B) | Every scenario starts "someone uses **their income** to buy…" |
| **L8.3 Spending and Saving** (1.9C) | The spend-vs-save choice is a choice about what to do with **income** |
| **L8.4 Charitable Giving** (1.9D) | Donations come out of **income** |

L8.1's job is to lock in three durable mental hooks for the rest of the unit:
1. **Income = money earned by working.** (anchor for L8.2 → L8.3 → L8.4)
2. **Gifts are not income.** (prevents L8.3 confusion when scenarios mention birthday gifts)
3. **People do many kinds of work.** (establishes worker-card visual vocabulary that L8.2 reuses)

## 9. Key ideas (6)

1. **Income** is money earned by working.
2. People can earn income in many ways — at a job, by selling things, or by doing paid chores. A job is one common way people earn income.
3. A **gift** is money or something given to you. A gift is not income because you did not work for it.
4. Playing, resting, sleeping, and having fun are not work. They do not earn income.
5. Every kind of work needs **skills** — a cook needs cooking skills, a teacher needs teaching skills, a builder needs building skills. Skills help people do their work and earn income.
6. Income comes only from doing work. Money you get for free, like a birthday gift, is not income.

(6 ideas, in scope of the 5–6 range. No dollar symbols, no money amounts, no save/spend/give vocabulary, no wants/needs vocabulary.)

## 10. Worked examples (5)

| # | Title | Prompt | Visual | Final answer (narration) |
|---|---|---|---|---|
| 1 | What is income? | What is income? | (no visual — text concept) | Income is money earned by working. |
| 2 | Paid work earns income | Maya walks the neighbor's dog after school and gets paid. Is Maya earning income? | gift-vs-work pair: 🐕 "Maya walks the dog for pay" vs the question framing | Yes — Maya is doing work and being paid. That money is income. |
| 3 | Playing is not earning | Sam plays soccer with his friends for fun. Is Sam earning income? | scenario card (⚽ "Sam plays soccer for fun") | No — playing for fun is not work. Sam is not earning income. |
| 4 | Gift is not income | Grandma sends Lin a birthday card with money inside. Is that money income? | gift-vs-work pair: 🎁 "Lin's birthday card from Grandma" vs 👩‍🍳 "Lin baking cookies for pay" | No — birthday money is a gift, not income. Lin did not work for it. The bottom-right card shows income because Lin did the baking and was paid. |
| 5 | Skills help earn income | A baker uses baking skills at work and gets paid. What is the money the baker earned called? | worker card (🥖 "Baker") | Income. The baker did work and used baking skills, so the pay is income. |

5 examples, within the 4–6 range. No dollar amounts. Mix of adult and kid scenarios.

## 11. Question categories (9) with counts

| # | Category | Pattern | Q | E / M / H |
|---|---|---|---:|:---:|
| C1 | Define income | text question + 4 definition-style sentence options | 12 | 4 / 5 / 3 |
| C2 | Identify earning income | scenario + "Is [Name] earning income?" with 4 yes/no-with-reason options | 18 | 6 / 7 / 5 |
| C3 | Job vs not-job | 4-card grid + "Which person is working at a job?" | 18 | 7 / 7 / 4 |
| C4 | Gift vs income | gift-card + work-card visual pair + "Which one is income?" / "Which one is a gift?" | 18 | 6 / 7 / 5 |
| C5 | Work vs play/rest | work-vs-leisure visual pair + "Which one earns income?" | 14 | 5 / 5 / 4 |
| C6 | Work that earns income | 4-card grid + "Which activity shows someone earning income?" (mixed distractors: play, gift, volunteer, hobby) | 16 | 5 / 6 / 5 |
| C7 | Skills and work | "A [job] needs which skill to do their work?" with 4 skill options | 14 | 5 / 5 / 4 |
| C8 | Error repair | student's wrong statement + "What is the correct fix?" with 4 fix options | 14 | 4 / 6 / 4 |
| C9 | True sentence / mixed review | "Which sentence is true about income?" with 4 candidate sentences | 16 | 3 / 7 / 6 |
| | **Total** | | **140** | **45 / 55 / 40** |

**Correction-1 framing applied throughout:**
- C2, C3, C6 all include a meaningful proportion of **paid-kid scenarios** alongside adult-job scenarios. Examples: "Maya walks the neighbor's dog for pay," "Carlos mows the lawn for pay," "Sara waters plants for pay," "Lin bakes cookies to sell at the bake sale."
- C8 error-repair includes corrections of the misconception "only adult careers earn income" — student says "kids cannot earn income," correct fix: "Kids can earn income from paid work like dog-walking or selling lemonade."

**Correction-2 framing applied to C6:**
- C6 NEVER asks "Which job earns income?" with all-jobs-as-options (which would have multiple correct answers).
- C6 uses one of: "Which activity shows someone earning income?" / "Which person is doing work that can earn income?" / "Which worker is using skills at work?" — each with exactly ONE clearly correct answer (a paid-work scenario) and three clearly distinct distractors (play / rest / gift-receiving / unpaid-help).
- C6 distractor strategy: mix the four "non-income" categories (play, rest, gift, volunteer/unpaid) so the student must recognize multiple kinds of non-income, not just play-vs-work.

## 12. Target question count

**140 questions** total.

## 13. Easy / medium / hard distribution

**45 easy / 55 medium / 40 hard.**

- **Easy** — clear-cut scenarios with high-frequency examples (teacher teaching, baker baking, kid playing, kid eating). One-step recognition.
- **Medium** — paid-kid scenarios mixed with adult jobs, gift-vs-paid-work pairs with similar context, less-obvious skill mappings.
- **Hard** — edge cases (volunteer help vs paid work, allowance-for-chores vs allowance-for-existing), 3-way distractor sets where all wrong options are plausible-sounding but only one is correct.

## 14. Visual strategy

**All visuals are helper-generated SVG/HTML strings inside `src/data/g1/u8.js`. No coin assets are referenced. No `coin_assets.js` import.**

New unit-scoped helpers:

| Helper | Purpose |
|---|---|
| `_u8IconCell(emoji, size)` | Single fixed-size emoji cell |
| `_u8WorkerCard(emoji, label)` | Worker icon + bold caption (90×90 card) |
| `_u8ScenarioCard(emoji, caption)` | Amber-tinted scenario panel with caption |
| `_u8WorkVsRest(workEmoji, workLabel, restEmoji, restLabel)` | Side-by-side pair for C3/C5 |
| `_u8GiftVsWork(giftEmoji, giftLabel, workEmoji, workLabel)` | Gift card (with 🎁 badge) + work card for C4 |
| `_u8JobGrid(items)` | 2×2 grid of worker/scenario cards for C3 / C6 |
| `_u8MoneyBag()` | Generic 💰 + caption "income" — no value shown |
| `_u8GiftBox()` | 🎁 + caption "gift" |
| `_u8TvWrap(html, caption)` | Teaching-visual wrapper (mirrors `_u7TvWrap`) |
| `_u8Place(opts, aIdx)` | Position correct option at slot `aIdx` (mirrors `_u7Place`) |

**Visual rules enforced:**
- ✅ Worker cards = emoji + text label
- ✅ Money bag 💰 used ONLY as a non-numeric income symbol with literal caption "income"
- ✅ Gift box 🎁 used as a gift indicator with literal caption "gift"
- ✅ Adult job pool: chef, teacher, doctor, nurse, baker, driver, builder, firefighter, librarian, vet, dentist, mail carrier, mechanic, gardener, farmer
- ✅ Paid-kid scenario pool: dog walker (🚶‍♀️🐕), lawn mower (🚜), lemonade seller (🍋), plant waterer (🌿), cat feeder (🐱), bake-sale baker (🍪), errand runner (🚲)
- ✅ Non-work pool: playing soccer (⚽), playing video games (🎮), watching TV (📺), napping (🛏️), eating (🍕), reading for fun (📚), taking a bath (🛀)
- ❌ No coin photos, no coin glyphs, no `coinSVG`/`coinImg`
- ❌ No `$` or `¢` characters in any rendered string
- ❌ No price tags, no receipts, no shopping carts
- ❌ No save/spend/give jars (those are L8.3/L8.4 territory)

## 15. Error tags (8)

Naming follows the L7.x two-letter convention:

| Const | Tag | Triggered by |
|---|---|---|
| `_81ID` | `err_income_definition_confusion` | C1 — wrong definition of income |
| `_81GI` | `err_gift_vs_income_confusion` | C2/C4/C8 — picks gift as income |
| `_81WP` | `err_work_vs_play_confusion` | C2/C5/C8 — picks play/leisure as earning income |
| `_81JC` | `err_job_confusion` | C3 — picks a non-job as a job |
| `_81NW` | `err_not_working_is_income` | C2/C6 — claims someone not working is earning |
| `_81PW` | `err_paid_work_confusion` | C2/C4 — confuses being paid for work with being given money |
| `_81SW` | `err_skill_work_confusion` | C7/C8 — picks a wrong skill for a job |
| `_81IU` | `err_income_use_confusion` | C9 — drifts into spending/saving/giving territory when defining income |

## 16. Intervention factories (8)

Each follows the standard `{errorTag, title, teachingSteps[], teachingVisualRaw, correctAnswerExplanation, followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true}` shape.

| Factory | Tag | Teaches |
|---|---|---|
| `_i81Definition` | `_81ID` | Income is money earned by working — not any money, only money earned through work |
| `_i81GiftVsIncome` | `_81GI` | A gift is given to you for free; income is earned by doing work |
| `_i81WorkVsPlay` | `_81WP` | Playing, resting, eating, and having fun are not work; they do not earn income |
| `_i81JobConfusion` | `_81JC` | A job is work people do for pay; not every activity is a job |
| `_i81NotWorking` | `_81NW` | If no work is done, no income is earned — even if money is received |
| `_i81PaidWork` | `_81PW` | Pay for work is income. Money given for free is a gift, not income |
| `_i81SkillWork` | `_81SW` | Every job needs the right skill: a cook needs cooking; a teacher needs teaching; a builder needs building |
| `_i81IncomeUse` | `_81IU` | Income is what you earn. What you do with income comes later — first, learn what income is |

Each teaching visual is a small `_u81Tv*` helper wrapping a worker-card or scenario-pair visual with a one-sentence caption.

## 17. Retry behavior

Every question carries:
```js
i: {
  errorTag: ...,
  title: ...,
  teachingSteps: [...],
  teachingVisualRaw: _u81Tv...(),
  correctAnswerExplanation: ...,
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
}
```

Engine threshold `_shouldShowFullIntervention` (quiz.js:167) applies as for L7.4 — 2+ consecutive wrong (or 2+ same-tag) before the overlay fires. Retry pulls a fresh `sk === 'earning_income'` question, excluding the originating question id within the attempt.

## 18. Risks before coding

1. **Dollar-amount temptation.** K U8 L1 uses `$3 / $5 / $10` throughout. L8.1 must use zero `$` and zero `¢` characters in any student-facing string. Hard rule. Release-gate grep.
2. **"Only formal jobs" trap.** Correction-1 explicit: paid-kid work earns income. Every scenario where a child does paid work counts as a CORRECT "yes, this is income" answer. Reviewer must validate that no L8.1 question implies "only adult careers earn income."
3. **C6 multiple-correct trap.** Correction-2 explicit: C6 must never have 4 jobs as options where multiple could earn income. C6 always uses scenario-distractor mix: paid work vs play/rest/gift/volunteer. Exactly one correct.
4. **Wants-vs-needs drift.** Words "need" / "want" (financial-literacy sense) must not appear in any L8.1 string. Ordinary usage ("you need to find the income") is fine; financial-literacy noun usage is out.
5. **Coin/shopping-cart visual drift.** The `_u8MoneyBag` helper uses 💰 — there is risk a student or reviewer reads this as "a bag of coins." Mitigation: caption it literally `income` so the meaning is anchored.
6. **Gift edge cases.** Allowance for chores = income (chores are work). Allowance just for existing = gift. Birthday money = gift. Tip from a customer = income. Inheritance / lottery / found money are all out-of-scope (too complex for G1).
7. **Skill-job mapping ambiguity.** Many jobs need multiple skills. C7 distractors must pick the *most fitting* skill, with one clearly correct option and three obviously wrong.
8. **Mixing income with money-handling.** C2/C9 must stay on identification, not decision. No "what should X do with the income?" prompts.
9. **Visual scaling on 414px viewport.** Worker cards are ~90×90; the 4-card grid must wrap to 2×2 cleanly. Test in preview.
10. **The `_appErrors` background noise.** Periodic cross-origin "Script error." entries are pre-existing and unrelated. Use delta comparisons, not absolute counts, during preview verification.

## 19. Verification checklist

Run after the lesson is implemented, before locking. All must pass.

- [ ] `npm test` — 130/130 pass
- [ ] `npm run build` — clean; `data/g1/u8.js` rebuilt
- [ ] ESM-load: `L8.1.quizBank.length === 140`
- [ ] Per-category split: C1=12, C2=18, C3=18, C4=18, C5=14, C6=16, C7=14, C8=14, C9=16
- [ ] Per-difficulty: 45E / 55M / 40H
- [ ] Every L8.1 question has `t, o, a, e, d, h, sk, i`
- [ ] Every L8.1 question has `i.followUpRule === 'same_skill_new_numbers'` and `i.doNotRepeatOriginalQuestion === true`
- [ ] Every L8.1 question has `sk === 'earning_income'`
- [ ] Every L8.1 distractor has an `errorTag`
- [ ] All 8 error tags appear at least once
- [ ] All 8 intervention factories referenced at least once
- [ ] **Scope scan #1 — no `$`:** zero `$` characters in L8.1 student-facing strings
- [ ] **Scope scan #2 — no `¢`:** zero `¢` characters anywhere in L8.1
- [ ] **Scope scan #3 — no money amounts:** zero matches for `/[0-9]\s*(dollars?|cents?|bucks?)/i`
- [ ] **Scope scan #4 — no banned vocabulary:** zero matches for `penny`, `nickel`, `dime`, `quarter`, `coin`, `bill` (currency sense), `change` (currency sense), `price`, `cost`, `tax`, `interest`, `percent`, `\bspend\b`, `\bsave\b`, `\bgive\b` (donation sense), `donate`, `donation`, `charity`, `\bwants\b`, `\bneeds\b` (financial-literacy senses)
- [ ] **Scope scan #5 — only multipleChoice:** `allowedQuestionTypes === ['multipleChoice']`
- [ ] **Scope scan #6 — no `coin_assets`:** L8.1 source does not reference `coinImg`, `coinSVG`, or import from `coin_assets.js`
- [ ] L8.2 / L8.3 / L8.4 scaffolds untouched (`quizBank.length === 0` each)
- [ ] L7.x banks untouched; U1–U7 still resolve
- [ ] U8 pool = 140
- [ ] Preview verify on 414px viewport: L8.1 opens, 6 key ideas render, 5 examples render with visuals, quiz starts at "Question 1 of 8", a 2-consecutive-wrong sequence triggers intervention overlay with matching `_i81*` content, "Try a new one →" pulls a fresh L8.1 question, no L8.1-specific console errors (delta 0)
- [ ] Memory file `project_g1u8_status.md` (new) reflects L8.1 lock
- [ ] Final commit message: `feat(g1u8): add Lesson 8.1 Earning Income`
