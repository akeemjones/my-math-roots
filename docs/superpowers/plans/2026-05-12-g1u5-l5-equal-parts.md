# Grade 1 Unit 5 · Lesson 5.5 — Equal Parts — Halves and Fourths · Design Plan

> **Status:** PLANNING ONLY — no code yet. Awaiting approval before implementation.
> **Scope of this document:** content/design plan. Implementation TDD plan is a separate document after approval.

---

## 1. Lesson title

**Equal Parts — Halves and Fourths**

---

## 2. TEKS alignment

- **Primary:** TEKS 1.6G — Partition two-dimensional figures into two and four fair shares or equal parts and describe the parts using the words "halves," "half of," "fourths," and "quarters."
- **Supporting:** TEKS 1.6H — Identify examples and non-examples of halves and fourths.

`teks: ['1.6G', '1.6H']`

The existing scaffold at `src/data/g1/u5.js` (last `lessons[]` entry) already has this TEKS assignment.

---

## 3. Skill name

`skill: 'equal_parts_halves_fourths'`

Already declared in the scaffold. No change needed.

---

## 4. Exact scope

This lesson covers **splitting 2D shapes into equal parts** and **naming those parts** using Grade 1 vocabulary only.

### Allowed shapes for partitioning

| Shape | 2 Equal Parts (halves) | 4 Equal Parts (fourths) |
|-------|------------------------|-------------------------|
| Circle | 1 diameter line (vertical or horizontal) | 2 perpendicular diameters |
| Square | 1 midline (vertical or horizontal) | Both midlines (2×2 grid) |
| Rectangle | 1 midline (horizontal or vertical) | 3 evenly-spaced parallel lines |

> **No diagonal cuts.** Diagonal partitions that produce triangles are excluded — they conflict with the user's explicit prohibition of "cut a rectangle into triangles and name the parts" questions.

### Allowed vocabulary

- **halves** (primary term)
- **fourths** (primary term)
- **quarters** (accepted alternate for fourths in prompts; always select "fourths" as the correct-answer option label)
- "2 equal parts," "4 equal parts," "same size," "equal," "not equal"

### Allowed question types

- Name the parts (what are these equal parts called?)
- Identify equal vs. unequal (which picture shows equal parts?)
- Non-example identification (is this halves? why or why not?)
- Count the parts (how many equal parts are shown?)
- Match a description to a picture
- Same shape, different valid partition orientations
- Error repair (what is wrong with this statement?)
- Mixed review

All questions use `interactionType: 'multipleChoice'`.

---

## 5. What stays out of scope

Hard guardrails — NONE of these may appear in any L5.5 question:

- ❌ Thirds, sixths, eighths, or any other denominator beyond halves/fourths
- ❌ Fraction notation (no "1/2", "1/4", or any fraction bar)
- ❌ Fraction arithmetic (no "half of 8 is 4")
- ❌ Numerator/denominator vocabulary
- ❌ Equivalent fractions ("1/2 = 2/4")
- ❌ Comparing fractions ("1/4 is less than 1/2")
- ❌ 3D shapes (no partition of a cube, cylinder, etc.)
- ❌ Diagonal cuts that produce triangles ("cut into 2 triangles = halves")
- ❌ Area or perimeter
- ❌ Symmetry as the main concept (TEKS 2.8D — Grade 2 only)
- ❌ Grade 2 decomposition tasks
- ❌ "Equal parts" of a SET of objects (distributing 8 items into 2 groups is Grade 2)
- ❌ Pentagon, octagon, rhombus, hexagon, or triangle as partition targets
- ❌ Word problems as the primary question format
- ❌ Any content from Grade 2 u9.js
- ❌ Changes to Unit Test system, global quiz logic, or other lessons

---

## 6. How this differs from L5.4 (Compose and Recognize 2D Shapes)

| L5.4 | L5.5 |
|------|------|
| **Join** small shapes into a larger whole | **Split** a whole shape into equal parts |
| Direction: additive (pieces → whole) | Direction: partitive (whole → pieces) |
| Names the **whole** ("two triangles make a square") | Names the **parts** ("two equal parts are halves") |
| Interior line shows the JOIN boundary | Interior line shows the PARTITION boundary |
| All 6 Grade 1 shapes may be pieces OR targets | Only circle, square, rectangle are partitioned |
| "Halves" and "fourths" never appear | "Halves" and "fourths" are the core vocabulary |
| Error: misnames the composite shape | Error: misnames the parts or misidentifies equal vs. unequal |
| Vocabulary: shape names, "triangle," "square," etc. | Vocabulary: "halves," "fourths," "equal," "not equal" |

**Progression chain:**
> L5.4: "I can put shapes together to make new shapes."
> L5.5: "I can split a shape into equal parts and name those parts."

These are **inverse operations** that share visual overlap (both use interior lines) but have completely different cognitive demands. L5.5 is not a continuation of L5.4 — it is a new conceptual shift.

---

## 7. How this differs from Grade 2 geometry/fraction content

| Grade 1 (this lesson) | Grade 2 (NOT this lesson) |
|-----------------------|--------------------------|
| Name parts: "halves," "fourths" | Notation: 1/2, 1/4, write fraction |
| 2 or 4 equal parts only | Thirds, eighths, other denominators |
| Equal vs. unequal — visual recognition | Numerator/denominator — formal abstraction |
| "The two parts are called halves" | "One of the two halves is written 1/2" |
| Identify equal/unequal by visual inspection | Equivalent fractions: 1/2 = 2/4 |
| No comparing fractions | Comparing: 1/4 < 1/2 |
| No fraction arithmetic | Half of 8 is 4 (fraction × whole) |
| Same shape, different valid partitions | Decompose shapes into specified fraction types |

The cognitive anchor is: **Grade 1 names the parts with words. Grade 2 writes the parts with numbers.**

---

## 8. Key ideas (6)

```
1. Equal parts means every piece is the same size — no piece is bigger or
   smaller than any other piece.

2. When a shape is split into 2 equal parts, the two parts are called halves.
   Each part is one half.

3. When a shape is split into 4 equal parts, the four parts are called
   fourths (also called quarters). Each part is one fourth.

4. To check if parts are equal, look at the dividing line — it must split
   the shape so that all pieces are the same size.

5. A shape can be split into halves or fourths in more than one way.
   As long as all parts are equal, it shows halves or fourths.

6. If a shape is split into 2 or 4 parts but the parts are NOT the same
   size, it does NOT show halves or fourths — those are unequal parts.
```

---

## 9. Worked examples (6)

```
Example 1: Name the halves
  id: 'g1-u5-l5-ex-1'
  title: 'Circle split into halves'
  Prompt: "A circle is cut into 2 equal parts. What are the two parts called?"
  Visual: _svgHalfCircleV()   ← circle with vertical diameter
  Steps:
    1. Count the parts: 1 … 2.
    2. Are both parts the same size? Yes — the line goes through the center.
    3. Two equal parts = halves.
  Final answer: The two equal parts are called halves.

Example 2: Name the fourths
  id: 'g1-u5-l5-ex-2'
  title: 'Rectangle split into fourths'
  Prompt: "A rectangle is split into 4 equal parts. What are the parts called?"
  Visual: _svgFourthRectV()   ← landscape rectangle with 3 vertical lines
  Steps:
    1. Count the parts: 1, 2, 3, 4.
    2. Are all parts the same size? Yes — the lines are evenly spaced.
    3. Four equal parts = fourths.
  Final answer: The four equal parts are called fourths.

Example 3: Identify equal vs. unequal halves
  id: 'g1-u5-l5-ex-3'
  title: 'Which square shows halves?'
  Prompt: "Which picture shows halves?"
  Visual: _svgRow2( _svgHalfSquareH(), _svgUneqHalfSquare() )
           ← side by side: equal midline vs. off-center line
  Steps:
    1. Look at picture A: the line is in the MIDDLE of the square.
    2. Both parts look the same size — those are equal parts.
    3. Look at picture B: the line is NOT in the middle. One part is bigger.
    4. Those are NOT equal parts.
    5. Picture A shows halves; Picture B does not.
  Final answer: Picture A shows halves — both parts are equal in size.

Example 4: Non-example — unequal parts are not halves
  id: 'g1-u5-l5-ex-4'
  title: 'Two parts but not halves'
  Prompt: "A circle is cut into 2 parts, but one part is bigger. Is this halves?"
  Visual: _svgUneqHalfCircle()   ← circle with off-center vertical chord
  Steps:
    1. Count the parts: 2 parts.
    2. Are the parts the same size? One is bigger than the other.
    3. Halves means the 2 parts MUST be the same size.
    4. These parts are not equal — this is NOT halves.
  Final answer: No — the parts are not equal, so this is not halves.

Example 5: Count the parts — fourths on a square
  id: 'g1-u5-l5-ex-5'
  title: 'Square split into fourths'
  Prompt: "How many equal parts does this square show?"
  Visual: _svgFourthSquare()   ← square with both midlines (2×2 grid)
  Steps:
    1. Count each piece: 1, 2, 3, 4.
    2. There are 4 parts.
    3. Are all parts the same size? Yes.
    4. 4 equal parts = fourths.
  Final answer: The square shows 4 equal parts — those are fourths.

Example 6: Same shape, different ways to show halves
  id: 'g1-u5-l5-ex-6'
  title: 'Two ways to make halves'
  Prompt: "A square can be split into halves in more than one way. What matters most?"
  Visual: _svgRow2( _svgHalfSquareH(), _svgHalfSquareV() )
           ← horizontal cut on left, vertical cut on right
  Steps:
    1. Picture A: line goes across (horizontal). 2 equal parts.
    2. Picture B: line goes up-down (vertical). 2 equal parts.
    3. Both show halves — because BOTH have 2 parts that are the same size.
    4. The direction of the cut does not matter.
    5. What matters is that the parts are equal in size.
  Final answer: Both show halves. Direction of the cut does not matter —
                equal size does.
```

---

## 10. Question categories

| # | Category | Description | Question form |
|---|----------|-------------|---------------|
| C1 | **Name the halves** | Shape split into 2 equal parts; ask what the parts are called | Visual + 4-choice name |
| C2 | **Name the fourths** | Shape split into 4 equal parts; ask what the parts are called | Visual + 4-choice name |
| C3 | **Equal vs. unequal** | Two or four pictures; ask which shows equal parts | Multiple visuals + 4-choice or visual + Yes/No |
| C4 | **Non-examples of halves** | Shape with 2 UNEQUAL parts; ask "Is this halves?" | Visual + Yes/No or 4-choice |
| C5 | **Non-examples of fourths** | Shape with 4 UNEQUAL parts; ask "Is this fourths?" | Visual + Yes/No or 4-choice |
| C6 | **Count the parts** | Partitioned shape; ask how many equal parts are shown | Visual + 4-choice number |
| C7 | **Match description to picture** | "Which picture shows four equal parts?" or "Which shows halves?" | 4 visual choices |
| C8 | **Same shape, different partitions** | Show 2 pictures of same shape, different valid cut; ask if both show halves/fourths | Visual pair + Yes/No or reasoning |
| C9 | **Error repair** | Stated misconception; ask what is wrong | Text + optional visual + 4-choice |
| C10 | **Mixed review** | "Is this halves, fourths, or unequal parts?" | Visual + 4-choice |

All use `interactionType: 'multipleChoice'` with 4 choices, except pure Yes/No questions (2 choices).

---

## 11. Target question count

**155 questions** total.

---

## 12. Easy / medium / hard distribution

```
Easy:    50  (32%)
Medium:  60  (39%)
Hard:    45  (29%)
─────────────────
Total:  155
```

### Per-category allocation

| Category | Easy | Medium | Hard | Total |
|----------|-----:|-------:|-----:|------:|
| C1 Name the halves | 18 | 8 | 0 | 26 |
| C2 Name the fourths | 14 | 8 | 0 | 22 |
| C3 Equal vs. unequal | 10 | 8 | 4 | 22 |
| C4 Non-examples of halves | 4 | 8 | 4 | 16 |
| C5 Non-examples of fourths | 0 | 8 | 4 | 12 |
| C6 Count the parts | 2 | 6 | 4 | 12 |
| C7 Match description to picture | 0 | 8 | 5 | 13 |
| C8 Same shape, different partitions | 0 | 6 | 6 | 12 |
| C9 Error repair | 0 | 0 | 8 | 8 |
| C10 Mixed review | 2 | 0 | 10 | 12 |
| **Totals** | **50** | **60** | **45** | **155** |

### Difficulty rules

**Easy:**
- Single shape, obvious equal partition (circle with diameter, square with midline)
- Question asks directly: "What are these parts called?" → halves or fourths
- 4 choices with wide spread (e.g., "halves" vs. "thirds" vs. "ones" vs. "sixths")
- Visual is unambiguous — partition line clearly in the center

**Medium:**
- Requires comparing two pictures or making a yes/no judgment with explanation
- Unequal-part shapes appear as non-examples (less obviously off-center than easy versions)
- Different shape (e.g., rectangle instead of circle) for the same concept
- Count-the-parts questions begin here; match-to-description begins here
- Distractors are conceptually close (e.g., "fourths" vs. "halves" when the student may confuse 4 parts with 2 parts)

**Hard:**
- Error repair, multiple-step reasoning, same-shape different-partition
- Mixed review (halves, fourths, or unequal parts — all three as possible answers)
- Non-examples with 4 unequal parts (requires checking ALL 4 parts)
- "What is wrong with this student's reasoning?" format
- Distractors represent real documented misconceptions

---

## 13. Visual strategy

### Design principles

Every question must have a visual. The partition lines must be **thick and visible**. Equal parts must look **clearly equal**. Unequal parts must look **obviously unequal**.

- Partition lines use `stroke="white" stroke-width="3"` on colored shapes — same convention as L5.4 interior lines. White is not replaced by `_colorizeQ()`, so lines survive colorization.
- All shapes use the same canvas sizes and fill/stroke conventions as L5.1 (`fill="#CE93D8"`, `stroke="#7B1FA2"`, `stroke-width="5"`).
- Side-by-side question visuals use the existing `_svgRow2(s1, s2)` helper from L5.3/L5.4.
- Teaching visuals use `_tvWrap(svg, caption)` and lighter fill (`opacity="0.2"`) with `stroke="` + `_TVP + "` for the `#9C27B0` accent color.

### New SVG helpers

All new helpers go in a new `// ── L5.5 SVG helpers` section in `src/data/g1/u5.js`, placed directly before the L5.5 question categories.

---

#### Equal-partition question visual helpers

**Canvas convention:** matches existing L5.1 shapes exactly.
- Circle: `width="120" height="120" viewBox="0 0 120 120"`, `cx="60" cy="60" r="52"`
- Square: `width="110" height="110" viewBox="0 0 110 110"`, `rect x="7" y="7" width="96" height="96"`
- Rectangle (landscape): `width="160" height="100" viewBox="0 0 160 100"`, `rect x="10" y="16" width="140" height="68"`
- Rectangle (portrait): `width="100" height="160" viewBox="0 0 100 160"`, `rect x="16" y="10" width="68" height="140"`

| Helper | Description | Key geometry |
|--------|-------------|-------------|
| `_svgHalfCircleV()` | Circle, vertical diameter | line `x1="60" y1="8" x2="60" y2="112"` |
| `_svgHalfCircleH()` | Circle, horizontal diameter | line `x1="8" y1="60" x2="112" y2="60"` |
| `_svgHalfSquareV()` | Square, vertical midline | line `x1="55" y1="7" x2="55" y2="103"` |
| `_svgHalfSquareH()` | Square, horizontal midline | line `x1="7" y1="55" x2="103" y2="55"` |
| `_svgHalfRectH()` | Landscape rect, horizontal midline | line `x1="10" y1="50" x2="150" y2="50"` (y=16+34=50) |
| `_svgHalfRectV()` | Landscape rect, vertical midline | line `x1="80" y1="16" x2="80" y2="84"` (x=10+70=80) |
| `_svgFourthCircle()` | Circle, 2 perpendicular diameters | both diameter lines crossing at (60,60) |
| `_svgFourthSquare()` | Square, both midlines | `x1="55" y1="7" …` + `x1="7" y1="55" …` |
| `_svgFourthRectV()` | Landscape rect, 3 even vertical lines | lines at `x=45`, `x=80`, `x=115` (140 ÷ 4 = 35px cols) |
| `_svgFourthRectH()` | Portrait rect, 3 even horizontal lines | lines at `y=45`, `y=80`, `y=115` (140 ÷ 4 = 35px rows) |

**Full code for each helper:**

```js
function _svgHalfCircleV() {
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="60" y1="8" x2="60" y2="112" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgHalfCircleH() {
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="8" y1="60" x2="112" y2="60" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgHalfSquareV() {
  return '<svg width="110" height="110" viewBox="0 0 110 110">' +
    '<rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="55" y1="7" x2="55" y2="103" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgHalfSquareH() {
  return '<svg width="110" height="110" viewBox="0 0 110 110">' +
    '<rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="7" y1="55" x2="103" y2="55" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgHalfRectH() {
  return '<svg width="160" height="100" viewBox="0 0 160 100">' +
    '<rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="10" y1="50" x2="150" y2="50" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgHalfRectV() {
  return '<svg width="160" height="100" viewBox="0 0 160 100">' +
    '<rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="80" y1="16" x2="80" y2="84" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgFourthCircle() {
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="60" y1="8" x2="60" y2="112" stroke="white" stroke-width="3"/>' +
    '<line x1="8" y1="60" x2="112" y2="60" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgFourthSquare() {
  return '<svg width="110" height="110" viewBox="0 0 110 110">' +
    '<rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="55" y1="7" x2="55" y2="103" stroke="white" stroke-width="3"/>' +
    '<line x1="7" y1="55" x2="103" y2="55" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgFourthRectV() {
  // Landscape rectangle (140×68) divided into 4 equal columns (35px each)
  return '<svg width="160" height="100" viewBox="0 0 160 100">' +
    '<rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="45" y1="16" x2="45" y2="84" stroke="white" stroke-width="3"/>' +
    '<line x1="80" y1="16" x2="80" y2="84" stroke="white" stroke-width="3"/>' +
    '<line x1="115" y1="16" x2="115" y2="84" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgFourthRectH() {
  // Portrait rectangle (68×140) divided into 4 equal rows (35px each)
  return '<svg width="100" height="160" viewBox="0 0 100 160">' +
    '<rect x="16" y="10" width="68" height="140" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="16" y1="45" x2="84" y2="45" stroke="white" stroke-width="3"/>' +
    '<line x1="16" y1="80" x2="84" y2="80" stroke="white" stroke-width="3"/>' +
    '<line x1="16" y1="115" x2="84" y2="115" stroke="white" stroke-width="3"/>' +
    '</svg>';
}
```

---

#### Unequal-partition question visual helpers

These show **obviously** off-center dividing lines. The visual disproportion must be unambiguous — no 40/60 splits that could be mistaken for equal; use 25/75 or 30/70 splits.

| Helper | Description | Key geometry |
|--------|-------------|-------------|
| `_svgUneqHalfCircle()` | Circle with off-center vertical chord | chord at `x=42` (left sliver = 34px, right = 70px); spans `y1="11" y2="109"` |
| `_svgUneqHalfSquare()` | Square with line at ~30% from left | line at `x=36` (left=29px, right=67px of 96px total) |
| `_svgUneqHalfRect()` | Landscape rect with line at ~20% from left | line at `x=38` (left=28px, right=112px of 140px total) |
| `_svgUneqFourthSquare()` | Square with off-center cross | vertical at `x=40`, horizontal at `y=70` — four clearly unequal regions |
| `_svgUneqFourthRect()` | Landscape rect with 3 uneven vertical lines | lines at `x=35`, `x=75`, `x=120` — widths: 25, 40, 45, 30px |

**Full code for each helper:**

```js
function _svgUneqHalfCircle() {
  // Chord at x=42 (not center 60). Left slice ~33% width, right ~67%.
  // y bounds: 60 ± sqrt(52^2 - 18^2) = 60 ± sqrt(2380) ≈ 60 ± 48.8 → y1=11, y2=109
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="42" y1="11" x2="42" y2="109" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgUneqHalfSquare() {
  // Line at x=36: left piece is 29px wide, right is 67px wide (≈30/70 split)
  return '<svg width="110" height="110" viewBox="0 0 110 110">' +
    '<rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="36" y1="7" x2="36" y2="103" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgUneqHalfRect() {
  // Line at x=38: left piece 28px wide, right 112px wide (≈20/80 split)
  return '<svg width="160" height="100" viewBox="0 0 160 100">' +
    '<rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="38" y1="16" x2="38" y2="84" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgUneqFourthSquare() {
  // Cross at x=40, y=70 — clearly off-center in both axes
  return '<svg width="110" height="110" viewBox="0 0 110 110">' +
    '<rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="40" y1="7" x2="40" y2="103" stroke="white" stroke-width="3"/>' +
    '<line x1="7" y1="70" x2="103" y2="70" stroke="white" stroke-width="3"/>' +
    '</svg>';
}

function _svgUneqFourthRect() {
  // 3 lines at x=35, x=75, x=120 → column widths: 25, 40, 45, 30 (clearly unequal)
  return '<svg width="160" height="100" viewBox="0 0 160 100">' +
    '<rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="35" y1="16" x2="35" y2="84" stroke="white" stroke-width="3"/>' +
    '<line x1="75" y1="16" x2="75" y2="84" stroke="white" stroke-width="3"/>' +
    '<line x1="120" y1="16" x2="120" y2="84" stroke="white" stroke-width="3"/>' +
    '</svg>';
}
```

---

#### Teaching visual helpers

Six teaching visual functions used inside intervention `teachingVisualRaw`. All use `_tvWrap(svg, caption)` and the `_TVP = '#9C27B0'` token (replaced by `_colorizeQ` via `#9C27B0` → palette stroke color).

```js
function _tv55Equal() {
  // Side-by-side: equal-halves square (purple) vs. unequal square (red)
  return _tvWrap(
    '<svg width="260" height="120" viewBox="0 0 260 120" style="display:inline-block">' +
    '<text x="58" y="14" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Equal parts ✓</text>' +
    '<rect x="10" y="22" width="96" height="88" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="58" y1="22" x2="58" y2="110" stroke="' + _TVP + '" stroke-width="2.5" stroke-dasharray="5,3"/>' +
    '<line x1="130" y1="14" x2="130" y2="115" stroke="#ddd" stroke-width="1"/>' +
    '<text x="196" y="14" font-size="11" font-weight="700" fill="#E53935" text-anchor="middle" font-family="Nunito,sans-serif">Unequal parts ✗</text>' +
    '<rect x="142" y="22" width="96" height="88" fill="#EF9A9A" opacity="0.2" stroke="#E53935" stroke-width="3"/>' +
    '<line x1="172" y1="22" x2="172" y2="110" stroke="#E53935" stroke-width="2.5" stroke-dasharray="5,3"/>' +
    '</svg>',
    'Equal parts: every piece is the same size'
  );
}

function _tv55Halves() {
  // Three shapes (circle, square, rectangle) each showing 2 equal parts = halves
  return _tvWrap(
    '<svg width="260" height="105" viewBox="0 0 260 105" style="display:inline-block">' +
    '<text x="130" y="13" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">2 equal parts = halves</text>' +
    '<circle cx="50" cy="60" r="36" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="50" y1="24" x2="50" y2="96" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="50" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">circle</text>' +
    '<rect x="104" y="28" width="60" height="60" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="134" y1="28" x2="134" y2="88" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="134" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">square</text>' +
    '<rect x="178" y="36" width="72" height="44" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="214" y1="36" x2="214" y2="80" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="214" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">rectangle</text>' +
    '</svg>',
    '2 equal parts = halves'
  );
}

function _tv55Fourths() {
  // Three shapes each showing 4 equal parts = fourths
  return _tvWrap(
    '<svg width="260" height="105" viewBox="0 0 260 105" style="display:inline-block">' +
    '<text x="130" y="13" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">4 equal parts = fourths</text>' +
    '<circle cx="50" cy="60" r="36" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="50" y1="24" x2="50" y2="96" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="14" y1="60" x2="86" y2="60" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="50" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">circle</text>' +
    '<rect x="104" y="28" width="60" height="60" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="134" y1="28" x2="134" y2="88" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="104" y1="58" x2="164" y2="58" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="134" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">square</text>' +
    '<rect x="176" y="36" width="72" height="44" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="194" y1="36" x2="194" y2="80" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="212" y1="36" x2="212" y2="80" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="230" y1="36" x2="230" y2="80" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="212" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">rectangle</text>' +
    '</svg>',
    '4 equal parts = fourths'
  );
}

function _tv55Count() {
  // Numbered circles on 2-part square (left) and 4-part square (right)
  return _tvWrap(
    '<svg width="260" height="110" viewBox="0 0 260 110" style="display:inline-block">' +
    '<text x="64" y="13" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">2 parts = halves</text>' +
    '<rect x="10" y="20" width="88" height="80" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="54" y1="20" x2="54" y2="100" stroke="' + _TVP + '" stroke-width="2"/>' +
    _tvDot(32, 60, 1) + _tvDot(76, 60, 2) +
    '<text x="194" y="13" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">4 parts = fourths</text>' +
    '<rect x="142" y="20" width="76" height="76" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="180" y1="20" x2="180" y2="96" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="142" y1="58" x2="218" y2="58" stroke="' + _TVP + '" stroke-width="2"/>' +
    _tvDot(161, 39, 1) + _tvDot(199, 39, 2) + _tvDot(161, 77, 3) + _tvDot(199, 77, 4) +
    '</svg>',
    'Touch and count each piece: 1 … 2 (halves)   or   1 … 2 … 3 … 4 (fourths)'
  );
}

function _tv55HalvesFourths() {
  // Side-by-side circles: 2-part on left, 4-part on right
  return _tvWrap(
    '<svg width="260" height="110" viewBox="0 0 260 110" style="display:inline-block">' +
    '<text x="65" y="13" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Halves</text>' +
    '<text x="65" y="26" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">2 equal parts</text>' +
    '<circle cx="65" cy="70" r="36" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="65" y1="34" x2="65" y2="106" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="128" y1="15" x2="128" y2="108" stroke="#ddd" stroke-width="1"/>' +
    '<text x="195" y="13" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Fourths</text>' +
    '<text x="195" y="26" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">4 equal parts</text>' +
    '<circle cx="195" cy="70" r="36" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="195" y1="34" x2="195" y2="106" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="159" y1="70" x2="231" y2="70" stroke="' + _TVP + '" stroke-width="2"/>' +
    '</svg>',
    '2 equal parts = halves     4 equal parts = fourths'
  );
}

function _tv55MultiWay() {
  // Two squares: vertical cut on left, horizontal cut on right. Both = halves.
  return _tvWrap(
    '<svg width="260" height="115" viewBox="0 0 260 115" style="display:inline-block">' +
    '<text x="130" y="13" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Different cuts — still halves!</text>' +
    '<rect x="10" y="22" width="82" height="82" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="51" y1="22" x2="51" y2="104" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="51" y="113" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">vertical cut</text>' +
    '<line x1="103" y1="18" x2="103" y2="108" stroke="#ddd" stroke-width="1"/>' +
    '<rect x="115" y="22" width="82" height="82" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="115" y1="63" x2="197" y2="63" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="156" y="113" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">horizontal cut</text>' +
    '<text x="230" y="55" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Both</text>' +
    '<text x="230" y="71" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">= halves</text>' +
    '</svg>',
    'Equal parts — same size — in different directions'
  );
}
```

---

#### How question visuals are assembled per category

| Category | Visual pattern |
|----------|---------------|
| C1 (name halves) | Single equal-partition helper (e.g., `_svgHalfCircleV()`) |
| C2 (name fourths) | Single equal-partition helper (e.g., `_svgFourthSquare()`) |
| C3 (equal vs. unequal) | `_svgRow2(equalSvg, unequalSvg)` — side by side |
| C4 (non-examples halves) | Single unequal helper (e.g., `_svgUneqHalfCircle()`) |
| C5 (non-examples fourths) | Single unequal helper (e.g., `_svgUneqFourthSquare()`) |
| C6 (count the parts) | Single helper — equal or unequal, ask student to count |
| C7 (match to description) | `_svgRow2(a, b)` or `_svgRow3(a, b, c)` for "pick the one that shows X" |
| C8 (different partitions) | `_svgRow2(halvesV, halvesH)` — same shape, two cuts, ask if both valid |
| C9 (error repair) | Supporting visual of the relevant shape + text-primary prompt |
| C10 (mixed review) | Single helper — student must classify as halves / fourths / unequal |

---

## 14. Error tags

New shorthands defined at the top of the L5.5 section:

```js
var _55WN = 'err_wrong_fraction_name';       // Named halves when fourths (or vice versa)
var _55PC = 'err_wrong_part_count';          // Counted parts wrong (said 2 when 4, etc.)
var _55UP = 'err_unequal_parts';             // Accepted unequal parts as halves or fourths
var _55EQ = 'err_equal_parts_confusion';     // Rejected equal parts ("doesn't look equal")
var _55HF = 'err_halves_fourths_confusion';  // Confused halves with fourths specifically
var _55SP = 'err_shape_partition_confusion'; // Named the shape rather than the parts
var _55NE = 'err_nonexample_confusion';      // Accepted a non-example as halves/fourths
```

### Tag-per-distractor rule

- Every wrong answer choice carries an `errorTag` from the 7 above.
- The correct answer carries no `errorTag`.
- Typical question: 3 distractors → up to 3 distinct error tags. Two distractors may share a tag if they represent the same misconception expressed differently.

---

## 15. Intervention templates

### Helper signatures and mapping to teaching visuals

```js
_i55WN()  // err_wrong_fraction_name     → _tv55HalvesFourths()
_i55PC()  // err_wrong_part_count        → _tv55Count()
_i55UP()  // err_unequal_parts           → _tv55Equal()
_i55EQ()  // err_equal_parts_confusion   → _tv55Equal()
_i55HF()  // err_halves_fourths_confusion → _tv55HalvesFourths()
_i55SP()  // err_shape_partition_confusion → _tv55MultiWay()
_i55NE()  // err_nonexample_confusion    → _tv55Equal()
```

### Template content

```
─────────────────────────────────────────────────────────────────────
_i55WN() — err_wrong_fraction_name
─────────────────────────────────────────────────────────────────────
title: 'Count the equal parts to choose the name'
teachingSteps:
  1. Count the equal parts: touch each one.
  2. 2 equal parts → the parts are called halves.
  3. 4 equal parts → the parts are called fourths.
  4. The name tells you HOW MANY equal parts there are.
  5. Always count before you name.
teachingVisualRaw: _tv55HalvesFourths()
correctAnswerExplanation: (filled per question — e.g., "There are 2 equal parts, so the parts are called halves, not fourths.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true

─────────────────────────────────────────────────────────────────────
_i55PC() — err_wrong_part_count
─────────────────────────────────────────────────────────────────────
title: 'Count each piece carefully'
teachingSteps:
  1. Touch each piece one by one.
  2. Count: 1 … 2 … (or 1 … 2 … 3 … 4 …)
  3. Each separated region inside the shape is one part.
  4. Number of dividing lines + 1 = number of parts.
     (1 line = 2 parts. 3 lines = 4 parts.)
  5. Only count the pieces INSIDE the shape, not outside.
teachingVisualRaw: _tv55Count()
correctAnswerExplanation: (filled per question — e.g., "There are 3 dividing lines, so there are 4 parts — that makes fourths.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true

─────────────────────────────────────────────────────────────────────
_i55UP() — err_unequal_parts
─────────────────────────────────────────────────────────────────────
title: 'Equal parts must be the SAME size'
teachingSteps:
  1. Look at each piece — are they the same size?
  2. For halves: BOTH parts must be the same size.
  3. For fourths: ALL FOUR parts must be the same size.
  4. If any piece is bigger or smaller, the parts are NOT equal.
  5. Look at the dividing line — is it exactly in the middle?
teachingVisualRaw: _tv55Equal()
correctAnswerExplanation: (filled per question — e.g., "The line is not in the middle, so one part is bigger. These are not equal parts.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true

─────────────────────────────────────────────────────────────────────
_i55EQ() — err_equal_parts_confusion
─────────────────────────────────────────────────────────────────────
title: 'If all parts look the same size, they are equal'
teachingSteps:
  1. Equal means every piece is the same size.
  2. Check: do all pieces look the same?
  3. If yes → the parts are equal.
  4. 2 equal parts = halves. 4 equal parts = fourths.
  5. Equal parts do not have to be the same shape — just the same size.
teachingVisualRaw: _tv55Equal()
correctAnswerExplanation: (filled per question — e.g., "The line goes through the center — both parts are equal. These are halves.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true

─────────────────────────────────────────────────────────────────────
_i55HF() — err_halves_fourths_confusion
─────────────────────────────────────────────────────────────────────
title: '2 equal parts = halves. 4 equal parts = fourths.'
teachingSteps:
  1. Count the parts: 1 … 2 … (stop here → 2 parts → halves)
  2. Count the parts: 1 … 2 … 3 … 4 (4 parts → fourths)
  3. "Halves" and "fourths" sound alike — always COUNT first.
  4. 2 parts = halves. 4 parts = fourths. They are different.
teachingVisualRaw: _tv55HalvesFourths()
correctAnswerExplanation: (filled per question — e.g., "Count: 1, 2, 3, 4. There are 4 equal parts. That is fourths, not halves.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true

─────────────────────────────────────────────────────────────────────
_i55SP() — err_shape_partition_confusion
─────────────────────────────────────────────────────────────────────
title: 'Name the PARTS, not the shape'
teachingSteps:
  1. The question asks what the PARTS are called, not what shape it is.
  2. A circle split into 2 equal parts is still a circle.
  3. The name of the PARTS is "halves" — because there are 2 equal parts.
  4. A square split into 4 equal parts is still a square.
  5. The name of the PARTS is "fourths" — because there are 4 equal parts.
teachingVisualRaw: _tv55MultiWay()
correctAnswerExplanation: (filled per question — e.g., "The shape is a square, but the question asks about the parts — they are halves.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true

─────────────────────────────────────────────────────────────────────
_i55NE() — err_nonexample_confusion
─────────────────────────────────────────────────────────────────────
title: 'Check: are the parts equal?'
teachingSteps:
  1. Look at the dividing line — is it exactly in the center?
  2. If one part is bigger than the other, it is NOT halves.
  3. Halves = 2 parts, BOTH the same size.
  4. Fourths = 4 parts, ALL the same size.
  5. The number of parts alone is not enough — they MUST be equal.
teachingVisualRaw: _tv55Equal()
correctAnswerExplanation: (filled per question — e.g., "The line is off-center, so one part is bigger. This does NOT show halves.")
followUpRule: 'same_skill_new_numbers'
doNotRepeatOriginalQuestion: true
```

---

## 16. Retry behavior

Per question:

```js
intervention: {
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true,
  errorTag: '...',
  title: '...',
  teachingSteps: [...],
  correctAnswerExplanation: '...',
  teachingVisualRaw: '...'  // SVG string from teaching visual helper
}
```

**Retry strategy** (handled by existing quiz engine — no changes needed):
- Wrong answer → intervention overlay opens (THE QUESTION panel + TRY IT THIS WAY panel).
- User clicks "Try a new one."
- Engine pulls a new question from L5.5's bank with `skill === 'equal_parts_halves_fourths'`, excluding the just-answered question's id.
- `same_skill_new_numbers` ensures the retry is from the same skill pool. In this context, "new numbers" means a different shape/partition scenario.

No change to global retry logic. Same plumbing as L5.1–L5.4.

---

## 17. Risks before coding

| # | Risk | Mitigation |
|---|------|------------|
| R1 | **Partition line invisible on colored shapes** — white `stroke-width="3"` may be too thin on small screens or certain color palette entries | Test all 10 question visual helpers at 320px viewport with each of the 6 palette colors before writing questions. Increase to `stroke-width="4"` if any line disappears. |
| R2 | **Rectangle halves visual ambiguity** — `_svgHalfRectH()` (horizontal midline) produces two very flat strips (140×34 each). Students may not perceive these as "equal" because they look thin | Use `_svgHalfRectH()` only where the question text explicitly says "same height strips." Prefer `_svgHalfRectV()` (two 70×68 pieces) for general naming questions — the vertical cut is visually clearer. |
| R3 | **_svgFourthRectH() portrait orientation** — portrait rects (100×160) are taller than wide. This is atypical in this codebase. Ensure `.q-visual svg { max-width: 100%; height: auto }` CSS applies and the tall visual doesn't overflow | Include in visual QA checklist. Test at 320px. If overflow occurs, replace with `_svgFourthRectV()` instead. |
| R4 | **"Quarters" vs. "fourths" distractor confusion** — using "quarters" as a distractor for "fourths" questions could create unnecessary reading-level friction | Never put "quarters" as a distractor. If "quarters" appears at all, it must be treated as an equivalent correct term (not offered as a separate wrong answer). Use "thirds," "halves," or "ones" as distractors for C2 questions. |
| R5 | **Visual overlap with L5.4** — a square with a single diagonal was used in L5.4 as a composition visual. It could be confused with a halves partition. | L5.5 NEVER uses diagonal partition lines. All L5.5 partitions are strict horizontal or vertical. Cross-contamination is avoided by design. |
| R6 | **Unequal circles — off-center chord rendering** — `_svgUneqHalfCircle()` uses a vertical chord at x=42 that does NOT align with the circle's outline. The chord endpoints (y=11, y=109) are INSIDE the stroke boundary (r=52 from center 60,60 means circle outer edge ≈ y=5 at x=60). The chord is a simple line that visually intersects the circle | Verify in browser that the chord reads as a dividing line inside the circle, not an external line. If it looks detached, shift chord to x=44 and recompute y bounds. |
| R7 | **C8 (same shape, different partitions) misconceptions** — some students may believe a shape "only has one correct way to show halves." C8 addresses this, but the intervention must explicitly confirm both orientations are valid | All C8 prompts and interventions use `_tv55MultiWay()` and explicitly state "both are halves." Never leave ambiguity about whether orientation matters. |
| R8 | **Error repair distractors must reflect real misconceptions** — "The parts are not equal" is correct reasoning for C4/C5 non-examples, but if the student says "Yes, it IS halves because it has 2 parts," that is the target error. Ensure wrong choices represent `_55NE` or `_55UP` tags | Run each C9 error repair question against the intervention templates to confirm the wrong choices map to a documented error tag. |
| R9 | **quizBank length validation** — Jest tests and node:test g1-unit-quiz tests exercise the unit pool assembly. L5.5's quizBank must be non-empty after implementation | Add assertion in verification: `quizBank.length === 155`. Update U5 pool note: 615 + 155 = 770. |
| R10 | **Colorizer interaction with partition lines** — `_colorizeQ()` replaces `#CE93D8` (fill) and `#7B1FA2` (stroke) but NOT white. Partition lines use `stroke="white"` — they must survive colorization | Verify by calling `_colorizeQ([{ s: _svgHalfCircleV() }])` and confirming white line is preserved in the output. Same test applies to unequal helpers. |
| R11 | **teachingVisualRaw colorization** — `_colorizeQ()` also colorizes `q.i.teachingVisualRaw`. The teaching visuals use `_TVP = '#9C27B0'` which IS in the replacement list (`#9C27B0 → palette stroke`). Confirm all 6 teaching visual helpers use `_TVP` consistently so colorization applies | Audit all 6 `_tv55*` function bodies: every purple stroke/fill reference must use `_TVP` token, not hard-coded `#9C27B0`. |
| R12 | **Two-choice Yes/No questions** — C4/C5 non-example questions may use 2-choice Yes/No format. The existing quiz engine renders 2-choice questions differently than 4-choice. Confirm this format is used elsewhere in U5 before using it in L5.5 | Check existing L5.3 bank for Yes/No questions (they were converted to 2-choice in commit `9a0566a`). Use the same format if present; otherwise default to 4-choice with explicit "No — because …" options. |

---

## 18. Verification checklist

After implementation, before declaring L5.5 complete, ALL of these must pass:

### Static checks (source file)

- [ ] L5.5 lesson in `G1_U5_SPEC.lessons[4]` (index 4)
- [ ] `lessonId === 'g1-u5-l5'`
- [ ] `skill === 'equal_parts_halves_fourths'`
- [ ] `teks` is `['1.6G', '1.6H']`
- [ ] `keyIdeas.length === 6`
- [ ] `workedExamples.length === 6`
- [ ] `quizBank.length === 155`
- [ ] Easy count (`d === 'e'`) === 50
- [ ] Medium count (`d === 'm'`) === 60
- [ ] Hard count (`d === 'h'`) === 45
- [ ] All 10 question visual SVG helpers defined before the first `_l55C*` array
- [ ] All 6 teaching visual helpers (`_tv55Equal`, `_tv55Halves`, `_tv55Fourths`, `_tv55Count`, `_tv55HalvesFourths`, `_tv55MultiWay`) defined before the intervention factories
- [ ] Every question has `sk: 'equal_parts_halves_fourths'`
- [ ] Every wrong answer choice has an `errorTag` from the 7-tag list (`_55WN`, `_55PC`, `_55UP`, `_55EQ`, `_55HF`, `_55SP`, `_55NE`)
- [ ] Every `intervention` has `followUpRule: 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion: true`, one `errorTag`, a `title`, `teachingSteps[]` with ≥ 3 items, `correctAnswerExplanation`, and `teachingVisualRaw`
- [ ] No question uses "thirds," "sixths," "eighths," or any fraction notation ("1/2," "1/4")
- [ ] No question uses "numerator," "denominator," or "equivalent"
- [ ] No question involves a diagonal partition producing triangles
- [ ] No question involves 3D shapes
- [ ] No question involves area, perimeter, or symmetry
- [ ] No pentagon, octagon, rhombus, hexagon, or triangle as a shape being partitioned
- [ ] `_colorizeQ()` applied to all `_l55C*` arrays in `_l55Bank = _colorizeQ([].concat(...))` assembly line
- [ ] `_tv55*` helpers use `_TVP` (not hardcoded `#9C27B0`) so colorizer applies
- [ ] `_svgRow2()` calls use the existing L5.3/L5.4 helper (no new row helper needed)

### Runtime checks (build + tests)

- [ ] `node build.js` succeeds (run from `E:\Cameron Jones\mymathroots-v1.1`)
- [ ] `dist/data/g1/u5.js` reflects L5.5 quizBank populated (non-empty array at lessons[4])
- [ ] Jest: 130/130 pass (no regressions)
- [ ] Node-test: existing count + any new tests pass (no regressions)
- [ ] G1 Unit Test pool size = 770 (615 from L5.1–L5.4 + 155 from L5.5)
- [ ] No console errors or warnings on app load with `mmr_grade=1`

### Browser verification (preview server)

- [ ] Grade 1 home still shows correct unit count
- [ ] Click into Unit 5: lesson card 5 shows "Equal Parts — Halves and Fourths"
- [ ] Click L5.5: quiz starts correctly, question 1 of 155 visible
- [ ] Sample 5 random easy questions: each has a single centered SVG visual, 4 choices legible
- [ ] Sample 3 C3 questions: side-by-side `_svgRow2()` layout shows equal and unequal shapes clearly
- [ ] Sample 3 C4/C5 questions: unequal partition lines are visually obvious (not subtly off-center)
- [ ] Sample 3 hard questions: error repair and mixed-review formats work
- [ ] Submit wrong answer: intervention overlay opens with THE QUESTION (SVG visible) and TRY IT THIS WAY panels
- [ ] `teachingVisualRaw` in TRY IT THIS WAY renders an SVG (not blank), correct colors applied
- [ ] Click "Try a new one": new question loads from same skill pool
- [ ] Complete a full session at 100%; confirm lesson registers complete
- [ ] No visual overflow at 320px (portrait rectangle helpers fit within mobile screen width)
- [ ] White partition lines visible at both 320px and 768px viewports on all helpers
- [ ] All 6 palette colors produce readable partition lines (no white-on-white clash)

### Visual QA (sample-based)

- [ ] `_svgHalfCircleV()` — circle with clear vertical white diameter line
- [ ] `_svgFourthSquare()` — square with both midlines forming 4 equal quadrants
- [ ] `_svgFourthRectV()` — landscape rect with 3 vertical lines forming 4 equal columns
- [ ] `_svgFourthRectH()` — portrait rect with 3 horizontal lines forming 4 equal rows; no overflow
- [ ] `_svgUneqHalfCircle()` — circle with visually obvious off-center chord (one side clearly smaller)
- [ ] `_svgUneqFourthSquare()` — square with cross lines that produce 4 obviously different-sized pieces
- [ ] `_svgRow2(_svgHalfSquareH(), _svgUneqHalfSquare())` — two squares side by side; equal vs. unequal is immediately visible
- [ ] All 6 `_tv55*` teaching visuals render readable text (no text overflow past SVG viewBox)

---

## Implementation outline (after approval)

When approved, the implementation plan will follow this task structure (separate TDD plan document):

1. **New SVG helpers** — write and verify all 10 equal-partition helpers + 5 unequal helpers + 6 teaching visual helpers. Validate at 320px before writing any questions.
2. **Error tag shorthands** — declare `_55WN`, `_55PC`, `_55UP`, `_55EQ`, `_55HF`, `_55SP`, `_55NE`.
3. **Intervention factories** — write `_i55WN()` through `_i55NE()` (7 helpers).
4. **Easy tier (50 questions)** — C1×18, C2×14, C3×10, C4×4, C6×2, C10×2.
5. **Medium tier (60 questions)** — C1×8, C2×8, C3×8, C4×8, C5×8, C6×6, C7×8, C8×6.
6. **Hard tier (45 questions)** — C3×4, C4×4, C5×4, C6×4, C7×5, C8×6, C9×8, C10×10.
7. **Worked examples (6)** — assemble `_l55Examples` array.
8. **Key ideas (6)** — assemble `_l55KeyIdeas` array.
9. **Bank assembly** — `_l55Bank = _colorizeQ([].concat(C1…C10))`.
10. **Spec update** — replace scaffold fields: `keyIdeas`, `workedExamples`, `quizBank`, `diagnostics.errorTags`.
11. **Validation pass** — run static checks in-file.
12. **Build + tests** — `node build.js`, Jest 130/130, node-test full suite.
13. **Browser smoke test** — preview verification against checklist.
14. **Commit** — `feat(g1u5): Lesson 5.5 Equal Parts Halves and Fourths — 155 questions, full intervention coverage`.

---

## Open questions for approval

1. **Portrait rectangle helper** — `_svgFourthRectH()` uses a portrait (100×160) canvas, which is unusual in this codebase. Confirm this orientation is acceptable, or prefer to use only landscape rectangles for all partition questions (replacing portrait-fourths with `_svgFourthRectV()` variants at different shapes).

2. **"Quarters" in answer choices** — Plan keeps "fourths" as the always-correct answer label. If you'd like questions where "quarters" is also accepted as correct (two valid choices), confirm this and I'll use 2-correct-answer logic or keep it as a fourth option labeled "fourths (quarters)" to avoid confusion.

3. **Circle unequal chord** — `_svgUneqHalfCircle()` uses a vertical chord at x=42 (not centered). If the chord looks detached from the circle edge at render time, the mitigation is a slight inward shift to x=44. Confirm whether browser visual QA should happen before or after writing questions (plan: before, matching L5.4 practice).

4. **C8 "different partitions" scope** — Plan shows horizontal-cut vs. vertical-cut of the same shape both being valid halves/fourths. Confirm: should C8 also include two different shapes (circle halves + square halves) both being valid halves — or is that a separate concept that belongs only in C10 (mixed review)?

5. **Unequal fourths visual** — `_svgUneqFourthRect()` shows 4 uneven columns in a landscape rectangle (widths 25, 40, 45, 30). This tests that a student can recognize NOT all 4 parts are equal. Confirm this is within the expected difficulty range for medium/hard (no concern about it being too visually complex for Grade 1).

---

**Status:** Plan complete. **Awaiting approval before any implementation begins.**
