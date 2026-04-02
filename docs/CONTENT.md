# My Math Roots — Content Model

This document describes the curriculum structure, content format, and question schema for **My Math Roots**. It is the reference for anyone adding, editing, or auditing content — no code knowledge required to understand it.

---

## Overview

- **Target:** Grades K–5 math review
- **Standards alignment:** Texas TEKS (2nd grade focus, K–5 scope)
- **Total units:** 10
- **Total lessons:** 35
- **Questions per lesson quiz bank:** ~25–30 randomized questions (8 shown per attempt)
- **Questions per unit quiz:** 30 (10 shown per attempt)
- **Final test:** Pulls from all unit quiz banks

---

## Curriculum Map

Units are grouped into 4 grade-level bands (`gp` = grade period).

| Unit | Name | TEKS | Grade Period | Lessons |
|------|------|------|-------------|---------|
| u1 | Basic Fact Strategies | 2.4A, 2.7A | 1 | 4 |
| u2 | Place Value | 2.2A–F, 2.7B, 2.9C | 1 | 4 |
| u3 | Add & Subtract to 200 | 2.4A–D, 2.7B–C | 2 | 4 |
| u4 | Add & Subtract to 1,000 | 2.4A–D, 2.7B–C | 2 | 3 |
| u5 | Money & Financial Literacy | 2.5A–B, 2.11A–F | 3 | 4 |
| u6 | Data Analysis | 2.10A–D | 3 | 4 |
| u7 | Measurement & Time | 2.9A–G | 3 | 3 |
| u8 | Fractions | 2.3A–D | 4 | 3 |
| u9 | Geometry | 2.8A–E | 4 | 3 |
| u10 | Multiplication & Division | 2.6A–B | 4 | 3 |

---

## Lesson List

### Unit 1 — Basic Fact Strategies
| ID | Title | Description |
|----|-------|-------------|
| u1l1 | Count Up & Count Back | Count forward to add, backward to subtract |
| u1l2 | Doubles! | Use doubles facts to add quickly |
| u1l3 | Make a 10 | Break apart numbers to reach 10 first |
| u1l4 | Number Families | Understand fact families and related equations |

### Unit 2 — Place Value
| ID | Title | Description |
|----|-------|-------------|
| u2l1 | Big Numbers | Understand hundreds, tens, and ones |
| u2l2 | Different Ways to Write Numbers | Expanded form, word form, standard form |
| u2l3 | Bigger or Smaller? | Compare numbers using <, >, = |
| u2l4 | Skip Counting | Count by 2s, 5s, 10s, and 100s |

### Unit 3 — Add & Subtract to 200
| ID | Title | Description |
|----|-------|-------------|
| u3l1 | Adding Bigger Numbers | Add 2-digit and 3-digit numbers |
| u3l2 | Taking Away Bigger Numbers | Subtract 2-digit and 3-digit numbers |
| u3l3 | Add Three Numbers | Add three addends using strategies |
| u3l4 | Math Stories | Solve addition and subtraction word problems |

### Unit 4 — Add & Subtract to 1,000
| ID | Title | Description |
|----|-------|-------------|
| u4l1 | Adding Really Big Numbers | Add numbers up to 1,000 |
| u4l2 | Taking Away Really Big Numbers | Subtract numbers up to 1,000 |
| u4l3 | Close Enough Counts! | Round and estimate sums and differences |

### Unit 5 — Money & Financial Literacy
| ID | Title | Description |
|----|-------|-------------|
| u5l1 | All About Coins | Identify and know the value of coins |
| u5l2 | Count Your Coins | Count collections of coins |
| u5l3 | Dollars and Cents | Work with dollar bills and mixed amounts |
| u5l4 | Save, Spend and Give | Understand basic financial decisions |

### Unit 6 — Data Analysis
| ID | Title | Description |
|----|-------|-------------|
| u6l1 | Tally Marks | Read and create tally charts |
| u6l2 | Bar Graphs | Read and interpret bar graphs |
| u6l3 | Picture Graphs | Read and interpret picture graphs |
| u6l4 | Line Plots | Read and create line plots |

### Unit 7 — Measurement & Time
| ID | Title | Description |
|----|-------|-------------|
| u7l1 | How Long Is It? | Measure length using standard units |
| u7l2 | What Time Is It? | Tell time to the nearest 5 minutes |
| u7l3 | Hot, Cold and Full | Read thermometers and measure capacity |

### Unit 8 — Fractions
| ID | Title | Description |
|----|-------|-------------|
| u8l1 | What is a Fraction? | Understand numerator and denominator |
| u8l2 | Halves, Fourths and Eighths | Name and identify common fractions |
| u8l3 | Which Piece is Bigger? | Compare fractions with the same denominator |

### Unit 9 — Geometry
| ID | Title | Description |
|----|-------|-------------|
| u9l1 | Flat Shapes | Identify 2D shapes and their attributes |
| u9l2 | Solid Shapes | Identify 3D shapes and their attributes |
| u9l3 | Mirror Shapes | Identify lines of symmetry |

### Unit 10 — Multiplication & Division
| ID | Title | Description |
|----|-------|-------------|
| u10l1 | Equal Groups | Understand multiplication as equal groups |
| u10l2 | Adding the Same Number | Repeated addition as multiplication |
| u10l3 | Sharing Equally | Understand division as fair sharing |

---

## Content Structure (How a Lesson is Built)

Every lesson has five components. All five are required.

### 1. Lesson Metadata
```
id:    unique string, format u{unit}l{lesson}  e.g. "u1l1"
title: short display name                       e.g. "Count Up & Count Back"
icon:  single emoji                             e.g. "🔢"
desc:  one-sentence description (shown on card) e.g. "Count forward to add, backward to subtract"
```

### 2. Key Points (3 bullet points shown in lesson intro)
Plain English facts the child should remember. Each point is one sentence, written at a 2nd grade reading level.
```
points: [
  "Count ON to add: start at the bigger number, then count forward",
  "Count BACK to subtract: start at the bigger number, then count backward",
  "Always start with the BIGGER number!"
]
```
**Rules:**
- Exactly 3 points per lesson
- No punctuation at the end
- No HTML tags

### 3. Worked Examples (3 examples shown before practice)
Each example walks through a problem step by step with a visual.
```
examples: [
  {
    c:   hex color for the card accent    e.g. "#e74c3c"
    tag: category label shown on card     e.g. "Counting ON to Add"
    p:   the problem stated               e.g. "7 + 3 = ?"
    s:   step-by-step solution (use \n for line breaks)
    a:   the final answer with checkmark  e.g. "7 + 3 = 10 ✅"
    vis: visual type (see Visual Types below)
  }
]
```
**Rules:**
- Exactly 3 examples per lesson
- Solutions should show every step, not just the answer
- The `vis` field drives the animated visual — see Visual Types section

### 4. Practice Problems (3 free-response warm-up problems)
Short input problems the child types an answer to before the timed quiz begins.
```
practice: [
  {
    q: the question            e.g. "5 + 2 = ?"
    a: the correct answer      e.g. "7"
    h: hint shown if wrong     e.g. "Start at 5, count on 2 fingers!"
    e: emoji shown             e.g. "🍎"
  }
]
```
**Rules:**
- Exactly 3 practice problems per lesson
- Answer `a` must be a string (numbers written as "7" not 7)
- Hints should be encouraging, not just the answer

### 5. Quiz Bank (25–30 multiple choice questions)
The lesson quiz randomly pulls 8 questions from this bank each attempt.
```
q('Question text', ['Option A','Option B','Option C','Option D'], correctIndex, 'Explanation')
```
- `correctIndex` is 0-based (0 = first option, 3 = last option)
- Explanation is shown after the child answers — make it educational
- Shuffle answer options so the correct answer isn't always in the same position

**Rules:**
- Minimum 25 questions in the bank (ensures variety across retries)
- Questions progress from easy → medium → conceptual within the bank
- Include at least 2 conceptual questions ("Which strategy works best for…")
- No question should repeat the exact same numbers as another question

---

## Question Format Reference

```javascript
q('Use the count-on strategy. What is 6 + 3?', ['7','8','9','10'], 2, 'Start at 6, count on 3: 7,8,9.')
//  ─────────────────────────────────────────   ──────────────────  ─  ────────────────────────────────
//  Question text                               Answer choices       ↑  Explanation (shown after answer)
//                                                                   Correct index (0-based)
```

---

## Visual Types (`vis` field)

The `vis` field in worked examples triggers an animated visual. Format is `type:params`.

| Format | What It Shows | Example |
|--------|--------------|---------|
| `add:emoji:a:b` | Two groups of emoji being combined | `add:🍎:7:3` |
| `sub:emoji:a:b` | One group with items removed | `sub:🍎:12:4` |
| `doubles:emoji:n` | Two equal groups side by side | `doubles:🍊:6` |
| `tenframe:n` | Ten-frame grid filled to n | `tenframe:8` |
| `clock:h:m` | Analog clock face | `clock:3:15` |
| `coins:list` | Coin display | `coins:q,q,d,n` |
| `bar:label:value` | Bar chart segment | `bar:Cats:5` |
| `shape:name` | 2D or 3D shape | `shape:hexagon` |

If no visual is needed, omit the `vis` field entirely.

---

## Unit Quiz

Each unit has a separate `unitQuiz` array of 30 questions (same `q()` format). The quiz randomly selects 10 per attempt. These are harder than lesson questions — they mix concepts from all lessons in the unit.

**Rules:**
- 30 questions minimum
- Must require 80%+ to pass (enforced in app — do not change)
- Mix question types across all lessons in the unit

---

## Adding a New Lesson — Checklist

Before submitting new lesson content, verify:

- [ ] Lesson `id` follows format `u{n}l{n}` and is unique
- [ ] Exactly 3 key points, no HTML, no trailing punctuation
- [ ] Exactly 3 worked examples with valid `vis` type or no `vis` field
- [ ] Exactly 3 practice problems with string answers
- [ ] Minimum 25 questions in `qBank`
- [ ] Correct answer index is 0-based and accurate
- [ ] No duplicate question text in the bank
- [ ] At least 2 conceptual questions (not just computation)
- [ ] Explanations are educational (not just "The answer is X")
- [ ] Added to `unitQuiz` bank with 3–4 representative questions

---

## Adding a New Unit — Checklist

- [ ] Unit `id` follows format `u{n}` and is unique
- [ ] TEKS standard cited (format: `2.4A, 2.4B`)
- [ ] `gp` set to 1, 2, 3, or 4 (grade period / difficulty band)
- [ ] Minimum 3 lessons, maximum 5 lessons
- [ ] `unitQuiz` bank has 30 questions
- [ ] Unit added to the `UNITS_DATA` array in the correct position
- [ ] Unit color is a distinct hex value not already used

---

## Content Tone Guidelines

- Write at a **2nd grade reading level** (short sentences, common words)
- Be **encouraging** — assume the child is trying their best
- Use **concrete language** — "start at the bigger number" not "use the commutative property"
- Emoji are welcome in titles and examples, not in key points
- Avoid negative framing in hints — say "Try starting at 9!" not "That's wrong, you forgot to…"

---

*Last updated: March 2026 — v5.22*
