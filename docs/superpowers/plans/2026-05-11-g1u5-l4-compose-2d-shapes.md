# Grade 1 Unit 5 · Lesson 5.4 — Compose and Recognize 2D Shapes · Design Plan

> **Status:** PLANNING ONLY — no code yet. Awaiting approval before implementation.
> **Scope of this document:** content/design plan. Implementation TDD plan is a separate document after approval.

---

## 1. Lesson title

**Compose and Recognize 2D Shapes**

---

## 2. TEKS alignment

- **Primary:** TEKS 1.6F — Compose 2D shapes by joining two, three, or four figures to produce a target shape.
- **Supporting:** TEKS 1.6C — Create 2D figures including circles, triangles, rectangles, squares, rhombuses, and hexagons.

`teks: ['1.6C', '1.6F']`

> **Note:** The existing scaffold in `src/data/g1/u5.js:2244` has only `teks: ['1.6F']`. Implementation must update this to `['1.6C', '1.6F']`.

---

## 3. Skill name

`skill: 'compose_2d_shapes'`

Already declared in the scaffold at `src/data/g1/u5.js:2247`.

---

## 4. Exact scope

This lesson covers **putting small shapes together** to make a larger named shape, **recognizing** what larger shape was made from smaller pieces, and **identifying** which pieces were used — all using Grade 1 2D shapes only.

### Allowed composition pairs (these drive almost all questions)

| Pieces | Target | Visual approach |
|--------|--------|-----------------|
| 2 right isoceles triangles | Square | Diagonal split line inside square |
| 2 right isoceles triangles | Rectangle | Diagonal split line inside rectangle |
| 2 equal squares | Rectangle | Vertical midline inside rectangle |
| 2 equal rectangles | Larger rectangle | Horizontal or vertical midline |
| 3 equal squares | Wide rectangle | Two vertical midlines |
| 4 equal squares | Larger square | 2×2 grid inside square |
| 2 equilateral triangles | Rhombus | Horizontal midline inside rhombus |
| 1 square + 1 triangle | "House" composite | Horizontal line at roof joint |

### Allowed question types

- Given the pieces, name the target shape
- Given the composite (with interior dividing line visible), name it
- Given the composite, identify which pieces were used
- Given the target + one piece, identify the missing piece
- Recognize that the same target can be built from different piece sets
- Compositions using 3 or 4 pieces (simpler cases only)
- Error repair (correct a misconception about what pieces make what target)

All questions use `interactionType: 'multipleChoice'`.

---

## 5. What stays out of scope

Hard guardrails — NONE of these may appear in any L5.4 question:

- ❌ 3D solids anywhere (no cube, cylinder, cone, sphere, etc.)
- ❌ Pentagon or octagon as a correct answer (may appear as distractors only)
- ❌ Polygon or quadrilateral as required vocabulary
- ❌ Symmetry (TEKS 2.8D — Grade 2 only)
- ❌ Area or perimeter
- ❌ Equal parts / halves / fourths (TEKS 1.6G/H — L5.5 owns this)
- ❌ Fractions
- ❌ Measurement
- ❌ Grade 2 decomposition ("decompose this rectangle into triangles")
- ❌ Attribute-driven creation ("create a shape with 5 sides")
- ❌ Shape nets
- ❌ Hexagon as a composition TARGET (too complex to show clearly; hexagon may appear as a named distractor)
- ❌ Circle as a composition target or piece (cannot be composed from straight-sided shapes)
- ❌ Advanced algebra-style decomposition
- ❌ Any content from Grade 2 u9.js
- ❌ Changes to the Unit Test system or global quiz logic

---

## 6. How this differs from Grade 2 geometry

| Grade 1 (this lesson) | Grade 2 (not this lesson) |
|-----------------------|--------------------------|
| "Put two triangles together. What do you get?" | "Decompose this rectangle into triangles." |
| "Which shapes were used to make this square?" | "Create a shape with exactly 4 sides and 2 right angles." |
| "What shape do two squares make side by side?" | "Classify the resulting geometric parts by attribute." |
| Visual recognition + piece naming | Attribute-driven creation and formal decomposition |
| 2D shapes only, Grade 1 vocabulary | Broader shape vocabulary, polygon/quadrilateral language |
| Composition: join pieces to get a whole | Decomposition: break a whole into defined parts |

The cognitive direction is **additive** (join → name), not **analytical** (split → classify). The question of "why does this work?" is not asked — only "what does this make?" and "what are the pieces?"

---

## 7. How it builds from L5.1 and L5.3

**From L5.1 (2D Shapes — Identify and Describe):**
- Students already know the 6 shape names and their attribute descriptions (sides, corners).
- L5.4 assumes shape names are fluent — no re-teaching of "what is a hexagon."
- L5.4 uses the L5.1 shape SVG helpers directly for piece visuals.

**From L5.3 (Shape Attributes and Sorting):**
- Students understand that size, color, and orientation are non-defining attributes.
- L5.4 directly applies this: "Turning a triangle to fit next to another triangle does not change the triangle's name."
- L5.3's orientation error tag (`err_orientation_confusion`) concept reappears as `err_orientation_confusion` in L5.4 when students reject a rotated piece as "not the right shape."

**Progression chain:**
> L5.1: "I can name shapes by their attributes."  
> L5.3: "I know which attributes define a shape vs. don't matter."  
> L5.4: "I can put shapes together to make new shapes, and I can name the pieces."

---

## 8. Key ideas (6)

```
1. Small shapes can be joined together to make a larger shape.
2. Two triangles can fit together to make a square or a rectangle.
3. Two squares placed side by side make a rectangle.
4. Turning a shape does not change its name — a flipped triangle is still a triangle.
5. You can check what shape was made by looking at its outside outline.
6. The same large shape can sometimes be made from different sets of pieces.
```

---

## 9. Worked examples (6)

```
Example 1: Two triangles make a square
  id: 'g1-u5-l4-ex-1'
  title: 'Two triangles → one square'
  Prompt: "Look at these two triangles. What shape do they make when you put them together?"
  Visual: _svgRow2( _svgRtTriSm(false), _svgRtTriSm(true) )   ← two mirrored right triangles
  Steps:
    1. Each piece is a triangle.
    2. Slide one triangle next to the other so the long edges match up.
    3. Look at the outline of the joined shape.
    4. The outline has 4 equal straight sides and 4 corners.
    5. That is a square.
  Final answer: Two triangles make a square.

Example 2: Two squares make a rectangle
  id: 'g1-u5-l4-ex-2'
  title: 'Two squares → one rectangle'
  Prompt: "What shape do two squares make when you put them side by side?"
  Visual: _svgRow2( _svgSquSm(), _svgSquSm() )
  Steps:
    1. Each piece is a square.
    2. Place one square right next to the other.
    3. Look at the outline — 4 straight sides, 4 corners.
    4. Two sides are longer now. Two sides are shorter.
    5. A shape with two longer sides and two shorter sides is a rectangle.
  Final answer: Two squares make a rectangle.

Example 3: Identify pieces inside a composite shape
  id: 'g1-u5-l4-ex-3'
  title: 'What pieces are hidden inside?'
  Prompt: "This rectangle is made from two pieces. What are the two pieces?"
  Visual: _svgComp2SqRect()   ← rectangle with vertical midline showing two squares
  Steps:
    1. Look at the line inside the shape.
    2. The line divides the shape into two pieces.
    3. Each piece has 4 equal sides and 4 corners.
    4. A shape with 4 equal sides is a square.
    5. This rectangle is made from two squares.
  Final answer: The two pieces are squares.

Example 4: Missing piece
  id: 'g1-u5-l4-ex-4'
  title: 'Which piece completes the rectangle?'
  Prompt: "One triangle is already in place. Which piece goes in the empty space to make a rectangle?"
  Visual: _svgCompRectOneTri()   ← rectangle with left half filled, right half outlined/gray
  Steps:
    1. Look at the completed half — it is a right triangle.
    2. Look at the empty half — trace its outline.
    3. The empty space also has the shape of a right triangle.
    4. You need a matching right triangle (a mirror of the first piece).
    5. Slide the second triangle into the space — together they make a rectangle.
  Final answer: A triangle (the matching piece) completes the rectangle.

Example 5: Same target, different pieces
  id: 'g1-u5-l4-ex-5'
  title: 'Two ways to make a rectangle'
  Prompt: "Can a rectangle be made from two different piece sets?"
  Visual: _svgRow2( _svgComp2SqRect(), _svgComp2TriRect() )  ← side by side: square-pair and triangle-pair
  Steps:
    1. Look at the first picture: two squares side by side make a rectangle.
    2. Look at the second picture: two right triangles make a rectangle.
    3. Both result shapes have 4 sides and 4 corners.
    4. Both are rectangles — just built from different pieces.
    5. Yes, the same shape can be made from different sets of pieces.
  Final answer: Yes — a rectangle can be made from two squares or from two right triangles.

Example 6: Three pieces make a rectangle
  id: 'g1-u5-l4-ex-6'
  title: 'Three squares → long rectangle'
  Prompt: "Three squares are lined up in a row. What shape do they make?"
  Visual: _svgComp3SqRect()   ← three squares in a row with two dividing lines
  Steps:
    1. There are three pieces, each a square.
    2. Line them up in a row.
    3. Look at the outside outline: 4 sides, 4 corners.
    4. The top and bottom sides are long; the left and right sides are short.
    5. A shape with two long sides and two short sides is a rectangle.
  Final answer: Three squares in a row make a rectangle.
```

---

## 10. Question categories

| # | Category | Description | Question form |
|---|----------|-------------|---------------|
| C1 | **Two pieces → target name** | Show 2 pieces side by side; ask what they make | Visual pieces + 4-choice name |
| C2 | **Composite → name** | Show joined shape with interior line; ask its name | Visual composite + 4-choice name |
| C3 | **Identify components** | Show composite; ask what pieces were used | Visual composite + 4-choice pieces description |
| C4 | **Missing piece** | Show composite with one piece grayed out; ask which piece completes it | Visual + 4-choice piece |
| C5 | **Same target, different pieces** | Show two piece sets; ask if both make the same shape | Visual pairs + Yes/No or 4-choice |
| C6 | **3-piece composition** | Show 3 pieces or a 3-piece composite; ask name or components | Visual + 4-choice |
| C7 | **4-piece composition** | 4 small squares or similar; ask what they make | Visual + 4-choice (use sparingly) |
| C8 | **Error repair** | Student makes a misconception claim; ask what is wrong | Text + optional visual + 4-choice |

All use `interactionType: 'multipleChoice'` with 4 choices except pure Yes/No questions (2 choices).

---

## 11. Target question count

**135 questions** total.

---

## 12. Easy / medium / hard distribution

```
Easy:    40  (30%)
Medium:  55  (41%)
Hard:    40  (30%)
─────────────────
Total:  135
```

### Per-category allocation

| Category | Easy | Medium | Hard | Total |
|----------|-----:|-------:|-----:|------:|
| C1 Two pieces → target name | 18 | 12 | 0 | 30 |
| C2 Composite → name | 8 | 10 | 0 | 18 |
| C3 Identify components | 5 | 10 | 5 | 20 |
| C4 Missing piece | 0 | 10 | 8 | 18 |
| C5 Same target, different pieces | 5 | 8 | 5 | 18 |
| C6 3-piece composition | 4 | 5 | 6 | 15 |
| C7 4-piece composition | 0 | 0 | 8 | 8 |
| C8 Error repair | 0 | 0 | 8 | 8 |
| **Totals** | **40** | **55** | **40** | **135** |

### Difficulty rules

**Easy:**
- 2 pieces only
- Well-known, prototypical pairs: (triangle + triangle → square), (square + square → rectangle)
- 4 choices with wide spread (e.g., square vs. triangle vs. circle vs. hexagon)
- Visual is unambiguous — pieces clearly match the target

**Medium:**
- 2 pieces, slightly less obvious pair: (triangle + triangle → rectangle), (2 small rectangles → large rectangle)
- Distractors are plausible shapes (e.g., rhombus vs. square when triangles are close to equilateral)
- Missing piece questions begin here; composite → component ID begins here
- Orientations may vary (a triangle may be rotated)

**Hard:**
- 3 or 4 pieces; error repair; same-target/different-pieces
- Distractors are close to the correct answer (e.g., square vs. rectangle when proportions are similar)
- Orientation confusion tested directly
- "What is wrong with this reasoning?" format appears

---

## 13. Visual strategy

Geometry visual quality is critical for this lesson. Every question must have a visual unless the prompt text alone is unambiguous (error repair only, and even then a supporting composite visual is recommended).

### New SVG helpers needed

All helpers go in a new `// ── L5.4 SVG helpers` section in `src/data/g1/u5.js`, placed directly before the L5.4 question categories.

#### Piece helpers (standalone shapes for C1 / C4 "pieces" choices)

| Helper | Description | Canvas | Key points |
|--------|-------------|--------|------------|
| `_svgRtTriSm(flip)` | Right isoceles triangle (half of a square, cut diagonally). `flip=false`: right angle at bottom-left; `flip=true`: mirrored | `width="80" height="80" viewBox="0 0 80 80"` | `flip=false` pts: `(5,75) (75,75) (5,5)` — `flip=true` pts: `(75,75) (5,75) (75,5)` |
| `_svgRtTriRectSm(flip)` | Right triangle that is half of a 2:1 rectangle (narrow right angle). `flip=false` / `flip=true` mirrored | `width="90" height="58" viewBox="0 0 90 58"` | `flip=false` pts: `(5,53) (85,53) (5,5)` — `flip=true` pts: `(85,53) (5,53) (85,5)` |

#### Composite helpers (joined shapes with interior dividing line)

| Helper | Description | Canvas | Visual spec |
|--------|-------------|--------|-------------|
| `_svgComp2TriSq()` | Square from 2 right triangles (diagonal split) | `96×96 viewBox 0 0 96 96` | Full square `(5,5)→(91,91)`, fill `#CE93D8`, stroke `#7B1FA2` sw=5; interior diagonal `(5,5)→(91,91)` stroke white sw=2 |
| `_svgComp2TriRect()` | Rectangle from 2 right triangles (diagonal split) | `136×88 viewBox 0 0 136 88` | Full rect `(5,5)→(131,83)`, fill/stroke same; diagonal `(5,5)→(131,83)` white sw=2 |
| `_svgComp2SqRect()` | Rectangle from 2 equal squares (vertical midline) | `170×90 viewBox 0 0 170 90` | Outer rect `(5,5)→(165,85)`, fill/stroke standard; midline `(85,5)→(85,85)` white sw=2 |
| `_svgComp2RectRect()` | Larger rect from 2 smaller rects (horizontal midline) | `136×88 viewBox 0 0 136 88` | Outer rect standard; midline `(5,44)→(131,44)` white sw=2 |
| `_svgComp3SqRect()` | Wide rectangle from 3 squares (2 vertical midlines) | `254×90 viewBox 0 0 254 90` | Outer rect `(5,5)→(249,85)`; midlines at `x=88` and `x=171`, white sw=2 |
| `_svgComp4SqSq()` | Larger square from 4 small squares (2×2 grid) | `96×96 viewBox 0 0 96 96` | Outer square `(5,5)→(91,91)`; horizontal midline `(5,48)→(91,48)`, vertical midline `(48,5)→(48,91)`, both white sw=2 |
| `_svgComp2TriRh()` | Rhombus from 2 equilateral triangles (horizontal midline) | `120×88 viewBox 0 0 120 88` | Rhombus pts `(60,5) (115,44) (60,83) (5,44)`, fill/stroke standard; midline `(5,44)→(115,44)` white sw=2 |
| `_svgCompSqTri()` | House composite: square bottom + triangle top | `96×130 viewBox 0 0 96 130` | Square `(5,49)→(91,125)`, triangle pts `(5,49) (48,5) (91,49)`, same fill/stroke; line `(5,49)→(91,49)` white sw=2 |

#### Missing-piece variants

| Helper | Description |
|--------|-------------|
| `_svgCompMiss2TriSq(side)` | Square with one triangle grayed out. `side='left'` or `side='right'` fills one triangle with `#CE93D8` and outlines the other with `stroke="#7B1FA2" stroke-dasharray="6,4" fill="none"` |
| `_svgCompMiss2SqRect(side)` | Rectangle with one square grayed out (outline only). `side='left'` or `side='right'` |
| `_svgCompMiss2TriRect(side)` | Rectangle with one right-triangle outlined only |

#### Interior-line color convention

- Interior dividing lines use `stroke="white" stroke-width="2"` on question visuals (full-color shapes).
- Teaching visuals use `stroke="#7B1FA2" stroke-width="1.5" stroke-dasharray="5,3"` on the lighter opacity background to make pieces distinct.

### How question visuals are assembled per category

| Category | Visual pattern |
|----------|---------------|
| C1 (pieces → name) | `_svgRow2(piece1, piece2)` or `_svgRow3(p1, p2, p3)` using small shape helpers |
| C2 (composite → name) | Single composite helper (e.g., `_svgComp2TriSq()`) |
| C3 (components ID) | Single composite helper (same as C2 — the interior line reveals the pieces) |
| C4 (missing piece) | Missing-piece variant helper (e.g., `_svgCompMiss2SqRect('left')`) |
| C5 (same target) | `_svgRow2(composite1, composite2)` — two composites side by side |
| C6 (3 pieces) | `_svgRow3(p1, p2, p3)` for piece-naming; composite helper for composite → name |
| C7 (4 pieces) | `_svgComp4SqSq()` composite or `_svgRow3(sq, sq, _svgRow2(sq,sq))` — keep clean |
| C8 (error repair) | Reuse simplest composite helper as supporting visual; text-primary |

### Teaching visual pattern for interventions

Teaching visuals use `teachingVisualRaw` (SVG string) inside the intervention object, following the L5.3 `_tvWrap(svg, caption)` pattern.

Each intervention helper produces a teaching visual showing:
- The small pieces on the left (outlined, light fill, `opacity="0.2"`)
- An arrow (`→`) in the center
- The target composite shape on the right (outlined with `opacity="0.2"` and interior line visible)
- A text caption below

---

## 14. Error tags

New shorthands defined at the top of the L5.4 section:

```js
var _54CS  = 'err_wrong_composite_shape';    // Named the wrong target (e.g., said "triangle" instead of "square")
var _54CP  = 'err_wrong_component_shape';    // Wrong pieces identified (e.g., said "circles" when pieces are triangles)
var _54MP  = 'err_missing_piece_confusion';  // Chose wrong missing piece
var _54CN  = 'err_count_pieces_confusion';   // Wrong piece count (e.g., said "3 triangles" when there are 2)
var _54OR  = 'err_orientation_confusion';    // Rejected flipped/rotated piece as "wrong shape"
var _54SZ  = 'err_size_match_confusion';     // Confused piece sizes or scale
var _54SA  = 'err_shape_attribute_confusion';// Confused shape names by attributes (e.g., called result a rhombus instead of square)
```

### Tag-per-distractor rule

- Every wrong answer carries an `errorTag` matching one of the 7 above.
- The correct answer carries no `errorTag`.
- Typical question: 3 distractors → 3 distinct error tags (may reuse if two distractors represent the same misconception with different values).

---

## 15. Intervention templates

### Helper signatures

```js
_i54CS()   // err_wrong_composite_shape   — "Look at the outer outline"
_i54CP()   // err_wrong_component_shape   — "Count and name each piece"
_i54MP()   // err_missing_piece_confusion — "Trace the empty space"
_i54CN()   // err_count_pieces_confusion  — "Count the dividing lines"
_i54OR()   // err_orientation_confusion   — "Turning a shape doesn't change its name"
_i54SZ()   // err_size_match_confusion    — "Pieces must fill the whole target"
_i54SA()   // err_shape_attribute_confusion — "Count sides and corners of the result"
```

### Template content

```
─────────────────────────────────────────────────────────────────────
_i54CS() — err_wrong_composite_shape
─────────────────────────────────────────────────────────────────────
title: "Look at the outside outline"
teachingSteps:
  1. When pieces are joined, look only at the OUTSIDE edge — ignore the interior line.
  2. Count the sides of the outside shape.
  3. Count the corners of the outside shape.
  4. Use those counts to name the shape.
  5. The interior dividing line does not add extra sides or corners.
correctAnswerExplanation: (filled per question — e.g., "The two triangles make a square because the outside has 4 equal sides and 4 corners.")
teachingVisualRaw: composite teaching SVG (pieces → arrow → target)

─────────────────────────────────────────────────────────────────────
_i54CP() — err_wrong_component_shape
─────────────────────────────────────────────────────────────────────
title: "Count and name each piece"
teachingSteps:
  1. Find the dividing line inside the shape.
  2. Look at each piece separately — not the whole shape.
  3. Count the sides on each piece.
  4. Use the side count to name the piece.
correctAnswerExplanation: (filled per question — e.g., "Each piece has 3 sides, so the pieces are triangles.")
teachingVisualRaw: composite with labeled piece count

─────────────────────────────────────────────────────────────────────
_i54MP() — err_missing_piece_confusion
─────────────────────────────────────────────────────────────────────
title: "Trace the empty space"
teachingSteps:
  1. Look at the shape of the empty space (the gray area).
  2. Trace its outline with your finger.
  3. Count the sides and corners of that empty outline.
  4. The missing piece must be that exact shape — same size, same shape.
  5. Ignore color and look only at the shape outline.
correctAnswerExplanation: (filled per question)
teachingVisualRaw: missing-piece composite with dashed-border empty slot, arrow to correct piece

─────────────────────────────────────────────────────────────────────
_i54CN() — err_count_pieces_confusion
─────────────────────────────────────────────────────────────────────
title: "Count the dividing lines"
teachingSteps:
  1. Look at the interior lines inside the shape.
  2. Count those lines: that tells you how many times the shape was divided.
  3. Number of pieces = number of dividing lines + 1.
  4. Count out loud: "1, 2" (or "1, 2, 3") for each piece.
correctAnswerExplanation: (filled per question — e.g., "There is one dividing line, so there are 2 pieces.")
teachingVisualRaw: composite with numbered piece labels (small circles: "1", "2")

─────────────────────────────────────────────────────────────────────
_i54OR() — err_orientation_confusion
─────────────────────────────────────────────────────────────────────
title: "Turning a shape does not change its name"
teachingSteps:
  1. A triangle with 3 sides is still a triangle when you flip or turn it.
  2. The NAME comes from sides and corners — not from direction.
  3. If the piece has 3 sides, it is a triangle, no matter how it is turned.
correctAnswerExplanation: (filled per question — e.g., "The triangle is turned to fit next to the other triangle — but it is still a triangle.")
teachingVisualRaw: two triangles side by side (one flipped) with caption "same shape, different direction"

─────────────────────────────────────────────────────────────────────
_i54SZ() — err_size_match_confusion
─────────────────────────────────────────────────────────────────────
title: "Pieces must fill the whole target"
teachingSteps:
  1. The pieces must fit together perfectly — no gaps, no overlaps.
  2. Check that the pieces together match the outline of the target.
  3. If a piece is too big or too small, it is the wrong piece.
correctAnswerExplanation: (filled per question)
teachingVisualRaw: side-by-side target and correctly-fitted pieces with matching outline highlighted

─────────────────────────────────────────────────────────────────────
_i54SA() — err_shape_attribute_confusion
─────────────────────────────────────────────────────────────────────
title: "Count sides and corners of the result"
teachingSteps:
  1. After joining the pieces, look at the OUTSIDE shape.
  2. Count its sides and corners.
  3. 4 equal sides + 4 corners = square.
  4. 4 sides (2 long, 2 short) + 4 corners = rectangle.
  5. 4 equal sides + 4 corners but leaning = rhombus.
  6. Use those rules to name the result correctly.
correctAnswerExplanation: (filled per question — e.g., "The joined shape has 4 equal sides and 4 corners — that makes it a square, not a rhombus.")
teachingVisualRaw: _tvSquareVsRhombus() (already exists in u5.js at line ~257) with caption for the specific case
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
  teachingVisualRaw: '...'  // SVG string
}
```

**Retry strategy** (handled by existing quiz engine — no changes needed):
- Wrong answer → intervention overlay shows (THE QUESTION panel + TRY IT THIS WAY panel).
- User clicks "Try a new one."
- Engine pulls a new question from L5.4's bank with `skill === 'compose_2d_shapes'`, excluding the just-answered question's id.
- `same_skill_new_numbers` ensures the retry is from the same skill pool — in this geometry context, "new numbers" means a different piece pair / different composition scenario.

No change to global retry logic — same plumbing as L5.1–L5.3.

---

## 17. Risks before coding

| # | Risk | Mitigation |
|---|------|------------|
| R1 | **Interior line invisible on small screens** — the white dividing line inside a colored shape may disappear at 80px wide | Validate all composite helpers at 320px viewport width before writing questions; increase to sw=3 if needed; test with `_svgComp2TriSq()` first |
| R2 | **Right triangle vs. equilateral triangle confusion** — `_svgRtTriSm()` will look different from `_svgTriSm()` used in L5.1/L5.3; kid may see "two different triangles" | Avoid mixing `_svgTriSm` and `_svgRtTriSm` in the same question. When question says "triangle piece," use the piece that matches the composite being shown. |
| R3 | **L5.4 / L5.5 visual crossover** — showing a square split by diagonal looks like "halves" (L5.5 topic) | Frame ALL prompts as composition ("put together"), never as partition ("split"). Keep L5.4 question language additive: "these pieces make…" not "this shape was divided into…" |
| R4 | **Hexagon composition too complex** — 6 triangles or 3 rhombuses forming a hexagon produces a cluttered SVG that is hard to read at Grade 1 | Keep hexagon off the composition TARGET list entirely. Hexagon may appear only as a named distractor in choices. |
| R5 | **Circle as piece or target** — a circle cannot be composed from straight-sided shapes; using it creates a meaningless question | Circle must never appear as a composition target or piece. Circle may appear as a distractor choice labeled "circle" (clearly wrong). |
| R6 | **Square vs. rhombus ambiguity in composites** — two triangles at certain angles produce a shape whose answer depends on precise angle (is it a square or a rhombus?) | Only use the diagonal-square composition for the square target; use equilateral-triangles for the rhombus target. Never use ambiguous angles. |
| R7 | **"House" composite not a Grade 1 shape name** — square + triangle makes a house, but "house" is not a shape name | House composite appears ONLY in C3 (component ID) questions where the prompt asks "what pieces make this house shape?" — never as a composition target name question. |
| R8 | **Error repair distractors must be plausible** — if the student clearly could not make that mistake, the distractor is bad | Run each error repair question past the intervention-template to confirm the wrong answer choices match real documented misconceptions (err tags above). |
| R9 | **quizBank length validation** — test suite uses `g1-unit-quiz.test.js` which tests unit assembly; L5.4 quizBank must be non-empty after implementation | Add an assertion in the verification checklist: `quizBank.length === 135`. Jest tests that test the unit test assembly will need the bank filled. |
| R10 | **TEKS field update** — scaffold has `teks: ['1.6F']`; plan requires `['1.6C', '1.6F']` | Implementation step 1 must update the teks array; include in verification checklist. |
| R11 | **Colorizer interaction** — `_colorizeQ()` replaces `#CE93D8` and `#7B1FA2` tokens; interior dividing lines use `stroke="white"` which is NOT replaced — correct by design, but confirm white lines survive colorization | Verify: run `_colorizeQ([{ s: _svgComp2TriSq() }])` and confirm white interior line is preserved. |
| R12 | **teachingVisualRaw field name** — L5.3 uses `q.i.teachingVisualRaw` for colorization; L5.4 must follow same convention or colorizer skips it | Confirm colorizer at line ~143 reads `q.i.teachingVisualRaw` and apply to all L5.4 intervention objects. |

---

## 18. Verification checklist

After implementation, before declaring L5.4 complete, ALL of these must pass:

### Static checks (source file)

- [ ] L5.4 lesson in `G1_U5_SPEC.lessons[3]` (index 3)
- [ ] `lessonId === 'g1-u5-l4'`
- [ ] `skill === 'compose_2d_shapes'`
- [ ] `teks` is `['1.6C', '1.6F']` (not just `['1.6F']`)
- [ ] `keyIdeas.length === 6`
- [ ] `workedExamples.length === 6`
- [ ] `quizBank.length === 135`
- [ ] Easy count (`d === 'e'`) === 40
- [ ] Medium count (`d === 'm'`) === 55
- [ ] Hard count (`d === 'h'`) === 40
- [ ] Every question has unique `id` (no two matching `g1-u5-l4-*`)
- [ ] Every question has all required fields: `id`, `lessonId`, `teks`, `skill`, `subSkill`, `difficulty`, `interactionType`, `prompt`, `answer`, `choices`, `hint`, `intervention`
- [ ] Every `intervention` has: `followUpRule === 'same_skill_new_numbers'`, `doNotRepeatOriginalQuestion === true`, `errorTag` (one of 7 above), `title`, `teachingSteps[]` (≥3 items), `correctAnswerExplanation`, `teachingVisualRaw`
- [ ] Every wrong answer choice has an `errorTag` from the 7-tag list
- [ ] No question uses pentagon or octagon as a correct answer
- [ ] No question contains "3D," "face," "edge," "vertex," "cone," "cylinder," "cube," "sphere," "prism," "net," "area," "perimeter," "symmetry," "half," "halves," "fourth," "quarter," "fraction," "equal part," "polygon," "quadrilateral"
- [ ] No question uses hexagon as a composition TARGET (hexagon may appear as a distractor only)
- [ ] Circle does not appear as a composition piece or target
- [ ] All 8 composite SVG helpers and 2 piece helpers are defined BEFORE the first `_l54C*` array

### Runtime checks (build + tests)

- [ ] `npm run build` succeeds; `📋 Built: data/g1/u5.js` appears in output
- [ ] `dist/data/g1/u5.js` reflects L5.4 quizBank populated
- [ ] Jest: 130/130 pass (no regressions)
- [ ] Node-test: 91/91 pass
- [ ] No console errors or warnings on app load with `mmr_grade=1`

### Browser verification (preview server)

- [ ] Grade 1 home still shows "8 Units" header
- [ ] Click into Unit 5: lesson card 4 shows "Compose and Recognize 2D Shapes"
- [ ] Click L5.4: quiz starts correctly, question 1 of 135 visible
- [ ] Sample 5 random easy questions: each has a visual (piece row or composite), 4 choices are legible
- [ ] Sample 3 medium questions: composite SVGs show interior dividing line clearly
- [ ] Sample 3 hard questions: error repair and missing-piece formats work
- [ ] Submit wrong answer on any question: intervention overlay opens correctly with "THE QUESTION" and "TRY IT THIS WAY" panels
- [ ] `teachingVisualRaw` in TRY IT THIS WAY panel renders an SVG (not blank)
- [ ] Click "Try a new one": new question loads from same skill pool
- [ ] Complete a session at 100%; confirm lesson registers as complete
- [ ] No visual overflow at 320px viewport (composite SVGs fit within screen width)
- [ ] White interior dividing lines are visible on all composite SVG helpers at 320px–768px viewport

### Visual QA (sample-based)

- [ ] `_svgComp2TriSq()` renders clearly: solid square, white diagonal visible
- [ ] `_svgComp2SqRect()` renders clearly: solid rectangle, white vertical midline visible
- [ ] `_svgComp2TriRect()` renders clearly: solid rectangle, white diagonal visible
- [ ] `_svgCompMiss2SqRect('left')` renders clearly: right square filled, left square outlined dashed
- [ ] `_svgRtTriSm(false)` and `_svgRtTriSm(true)` together look like they fit to form a square
- [ ] `_svgRow2(_svgRtTriSm(false), _svgRtTriSm(true))` displays two matching right triangles side by side

---

## Implementation outline (after approval)

When approved, the implementation plan will follow this task structure (separate TDD plan document):

1. **New SVG helpers** — write and verify all 8 composite helpers + 2 piece helpers + 2 missing-piece variants. Validate rendering at 320px before any questions.
2. **Error tag shorthands** — declare `_54CS`, `_54CP`, `_54MP`, `_54CN`, `_54OR`, `_54SZ`, `_54SA`.
3. **Intervention factories** — write `_i54CS()` through `_i54SA()` (7 helpers).
4. **Easy tier (40 questions)** — C1×18, C2×8, C3×5, C5×5, C6×4.
5. **Medium tier (55 questions)** — C1×12, C2×10, C3×10, C4×10, C5×8, C6×5.
6. **Hard tier (40 questions)** — C3×5, C4×8, C5×5, C6×6, C7×8, C8×8.
7. **Worked examples (6)** — assemble `_l54Examples` array.
8. **Key ideas (6)** — assemble `_l54KeyIdeas` array.
9. **Bank assembly** — `_l54Bank = _colorizeQ([].concat(C1…C8))`.
10. **Spec update** — replace scaffold fields: `teks`, `keyIdeas`, `workedExamples`, `quizBank`, `diagnostics.errorTags`.
11. **Validation pass** — run static checks in-file.
12. **Build + tests** — `npm run build`, Jest 130/130, node-test 91/91.
13. **Browser smoke test** — preview verification against checklist.
14. **Commit** — `feat(g1u5): Lesson 5.4 Compose and Recognize 2D Shapes — 135 questions, full intervention coverage`.

---

## Open questions for approval

1. **TEKS array update** — confirm changing scaffold `teks: ['1.6F']` to `['1.6C', '1.6F']` is correct. If 1.6C scope is considered separate, L5.4 can stay with just `['1.6F']`.
2. **Rhombus composition** — confirm including 2-equilateral-triangles → rhombus as a medium/hard composition. If the rhombus angle visual is hard to read clearly at small size, this category can be dropped and replaced with additional rectangle variants.
3. **House composite** — confirm using square + triangle "house" composite only for component-ID questions (C3), never as a named target. If you'd prefer to avoid the house shape entirely, those slots can be replaced with a third rectangle variant.
4. **Interior line visibility** — confirm white interior dividing lines on the colored shape SVGs are the right approach. Alternative: use a dashed stroke in a contrasting dark color (e.g., `stroke="#1565C0" stroke-dasharray="6,3"`).
5. **Category C7 (4-piece) on hard only** — confirm that 4-piece questions appear only in the hard tier (8 questions). If you'd like a couple in medium, say so and I'll adjust.

---

**Status:** Plan complete. **Awaiting approval before any implementation begins.**
