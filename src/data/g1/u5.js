/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 5: Geometry
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.6A  Classify and sort 2D shapes by attributes using informal language
 *    1.6B  Distinguish defining vs non-defining attributes of 2D and 3D shapes
 *    1.6C  Create 2D figures (circle, triangle, rectangle, square, rhombus, hexagon)
 *    1.6D  Identify 2D shapes and describe their attributes
 *    1.6E  Identify 3D solids and describe their attributes
 *    1.6F  Compose 2D shapes by joining two, three, or four figures
 *    1.6G  Partition 2D figures into two and four equal parts
 *    1.6H  Identify examples and non-examples of halves and fourths
 *
 *  Lessons:
 *    L5.1  2D Shapes — Identify and Describe     ← 170 questions (55E/65M/50H)
 *    L5.2  3D Shapes — Identify and Describe     ← SCAFFOLD (0 questions)
 *    L5.3  Shape Attributes and Sorting          ← SCAFFOLD (0 questions)
 *    L5.4  Compose and Recognize 2D Shapes       ← SCAFFOLD (0 questions)
 *    L5.5  Equal Parts — Halves and Fourths      ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - 2D shapes: circle, triangle, rectangle, square, rhombus, hexagon ONLY.
 *    - Pentagon and octagon may appear as distractors/non-examples ONLY — never correct answers.
 *    - Do NOT use polygon or quadrilateral as required Grade 1 vocabulary.
 *    - 3D solids: sphere, cone, cylinder, cube, rectangular prism, triangular prism ONLY.
 *    - Square pyramid is NOT a Grade 1 solid — do not include.
 *    - L5.2: identification and real-world connection only — no face/edge/vertex counting.
 *    - L5.4: 2D shape composition only — no 3D, no symmetry.
 *    - L5.5: halves and fourths as equal parts only — no symmetry, no fractions beyond halves/fourths.
 *    - No symmetry content in any lesson (symmetry is TEKS 2.8D, Grade 2).
 * ════════════════════════════════════════════════════════════════════════════ */

// ── SVG helpers ──────────────────────────────────────────────────────────────
// Each shape has its own canvas sized for its geometry.
// Fill: #CE93D8 (purple-200, opaque pastel). Stroke: #7B1FA2 (purple-800, bold).
// Helpers are called at parse time; values are baked into the question objects.
// .q-visual svg CSS applies display:block + max-width:100% + height:auto.

function _svgCircle() {
  // 120x120 canvas, radius 52 — fills the space with 8px margin on each side
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '</svg>';
}

function _svgTriangle(deg) {
  // 120x120 canvas, circumradius 50, center at (60,60)
  var d = deg || 0, r = 50, cx = 60, cy = 60;
  var a0 = (d - 90) * Math.PI / 180, p = [];
  for (var i = 0; i < 3; i++) {
    var a = a0 + i * 2 * Math.PI / 3;
    p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
  }
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<polygon points="' + p.join(' ') + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

function _svgRect() {
  // 160x100 canvas — clearly wide rectangle, ratio 140:68 ≈ 2:1
  return '<svg width="160" height="100" viewBox="0 0 160 100">' +
    '<rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

function _svgSquare() {
  // 110x110 canvas — 96x96 square, clearly equal sides
  return '<svg width="110" height="110" viewBox="0 0 110 110">' +
    '<rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

function _svgRhombus(deg) {
  // 140x140 canvas, center (70,70). Points: top(70,8), right(122,70), bottom(70,132), left(18,70)
  // Clearly diamond-shaped with leaning corners — visually distinct from square
  var pts = '70,8 122,70 70,132 18,70';
  var poly = '<polygon points="' + pts + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>';
  var body = (deg && deg !== 0)
    ? '<g transform="rotate(' + deg + ',70,70)">' + poly + '</g>'
    : poly;
  return '<svg width="140" height="140" viewBox="0 0 140 140">' + body + '</svg>';
}

function _svgHex(deg) {
  // 130x130 canvas, center (65,65), circumradius 55 — 10px margin for stroke
  var d = deg || 0, r = 55, cx = 65, cy = 65, p = [];
  for (var i = 0; i < 6; i++) {
    var a = (d + i * 60) * Math.PI / 180;
    p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
  }
  return '<svg width="130" height="130" viewBox="0 0 130 130">' +
    '<polygon points="' + p.join(' ') + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

// ── Error tag shorthands ─────────────────────────────────────────────────────
var _WS  = 'err_wrong_shape_name';
var _CO  = 'err_confuse_circle_oval';
var _SR  = 'err_confuse_square_rectangle';
var _SRh = 'err_confuse_square_rhombus';
var _HP  = 'err_confuse_hexagon_pentagon';
var _SNC = 'err_sides_not_counted';
var _CNC = 'err_corner_not_considered';
var _NSC = 'err_non_shape_confusion';

// ── Teaching visual SVG helpers ───────────────────────────────────────────────
// Called at parse time; annotated SVG strings baked into intervention objects.

var _TVP = '#9C27B0';

function _tvWrap(svg, cap) {
  return '<div style="text-align:center;padding:2px 0">' + svg +
    (cap ? '<div style="font-size:0.78rem;color:#5a7080;font-family:\'Nunito\',sans-serif;margin-top:5px;line-height:1.3">' + cap + '</div>' : '') +
    '</div>';
}

function _tvDot(x, y, n) {
  return '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + _TVP + '"/>' +
    '<text x="' + x + '" y="' + (y + 4) + '" font-size="13" font-weight="bold" fill="white" text-anchor="middle" font-family="Nunito,sans-serif">' + n + '</text>';
}

function _tvTriangleSides() {
  // Triangle points (80,12)(142,112)(18,112); side-number circles near each side midpoint
  return _tvWrap(
    '<svg width="160" height="145" viewBox="0 0 160 145" style="display:inline-block">' +
    '<polygon points="80,12 142,112 18,112" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    _tvDot(120, 57, 1) + _tvDot(80, 131, 2) + _tvDot(40, 57, 3) +
    '</svg>',
    '3 sides = triangle'
  );
}

function _tvTriangleCorners() {
  // Triangle with numbered dots at each corner vertex
  return _tvWrap(
    '<svg width="160" height="125" viewBox="0 0 160 125" style="display:inline-block">' +
    '<polygon points="80,12 142,112 18,112" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    _tvDot(80, 12, 1) + _tvDot(142, 112, 2) + _tvDot(18, 112, 3) +
    '</svg>',
    '3 corners = triangle'
  );
}

function _tvCircle0() {
  // Circle with "0 sides / 0 corners" callout lines
  return _tvWrap(
    '<svg width="210" height="90" viewBox="0 0 210 90" style="display:inline-block">' +
    '<circle cx="48" cy="45" r="38" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="86" y1="25" x2="100" y2="25" stroke="' + _TVP + '" stroke-width="1.5"/>' +
    '<line x1="86" y1="65" x2="100" y2="65" stroke="' + _TVP + '" stroke-width="1.5"/>' +
    '<text x="103" y="30" font-size="14" font-weight="bold" fill="' + _TVP + '" font-family="Nunito,sans-serif">0 sides</text>' +
    '<text x="103" y="70" font-size="14" font-weight="bold" fill="' + _TVP + '" font-family="Nunito,sans-serif">0 corners</text>' +
    '</svg>',
    'Perfectly round — no sides, no corners'
  );
}

function _tvCircleVsOval() {
  // Side-by-side: purple circle (correct) vs gray oval (wrong)
  return _tvWrap(
    '<svg width="230" height="102" viewBox="0 0 230 102" style="display:inline-block">' +
    '<text x="55" y="14" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Circle</text>' +
    '<circle cx="55" cy="57" r="38" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="115" y1="18" x2="115" y2="96" stroke="#ccc" stroke-width="1"/>' +
    '<text x="175" y="14" font-size="12" font-weight="700" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">Oval</text>' +
    '<ellipse cx="175" cy="57" rx="50" ry="32" fill="#888" opacity="0.13" stroke="#999" stroke-width="3"/>' +
    '</svg>',
    'Circle = perfectly round     Oval = stretched'
  );
}

function _tvRectAnnotated() {
  // Rectangle with longer/shorter side labels
  return _tvWrap(
    '<svg width="195" height="108" viewBox="0 0 195 108" style="display:inline-block">' +
    '<rect x="12" y="28" width="150" height="58" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="87" y="20" font-size="11" font-weight="bold" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">← longer →</text>' +
    '<text x="170" y="54" font-size="11" font-weight="bold" fill="' + _TVP + '" text-anchor="start" font-family="Nunito,sans-serif">↑</text>' +
    '<text x="170" y="68" font-size="11" font-weight="bold" fill="' + _TVP + '" text-anchor="start" font-family="Nunito,sans-serif">short</text>' +
    '<text x="170" y="82" font-size="11" font-weight="bold" fill="' + _TVP + '" text-anchor="start" font-family="Nunito,sans-serif">↓</text>' +
    '</svg>',
    'Rectangle: 2 longer sides + 2 shorter sides'
  );
}

function _tvSquareAnnotated() {
  // Square with perpendicular tick marks on all 4 sides (equal length indicator)
  return _tvWrap(
    '<svg width="120" height="120" viewBox="0 0 120 120" style="display:inline-block">' +
    '<rect x="18" y="18" width="84" height="84" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="60" y1="10" x2="60" y2="26" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="94" y1="60" x2="110" y2="60" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="60" y1="94" x2="60" y2="110" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="10" y1="60" x2="26" y2="60" stroke="' + _TVP + '" stroke-width="3"/>' +
    '</svg>',
    'Square: all 4 sides are equal length'
  );
}

function _tvRectVsSquare() {
  // Side-by-side rectangle (unequal sides) vs square (tick marks = equal sides)
  return _tvWrap(
    '<svg width="240" height="112" viewBox="0 0 240 112" style="display:inline-block">' +
    '<text x="55" y="13" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Rectangle</text>' +
    '<rect x="5" y="22" width="100" height="58" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="55" y="98" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">unequal sides</text>' +
    '<line x1="120" y1="8" x2="120" y2="104" stroke="#ddd" stroke-width="1"/>' +
    '<text x="185" y="13" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Square</text>' +
    '<rect x="152" y="22" width="66" height="66" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="185" y1="14" x2="185" y2="30" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="144" y1="55" x2="160" y2="55" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="185" y1="80" x2="185" y2="96" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<line x1="210" y1="55" x2="226" y2="55" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<text x="185" y="102" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">all sides equal</text>' +
    '</svg>',
    'Check side lengths: unequal = rectangle     equal = square'
  );
}

function _tvSquareVsRhombus() {
  // Side-by-side: square (square corner mark) vs rhombus (leaning corners)
  return _tvWrap(
    '<svg width="250" height="115" viewBox="0 0 250 115" style="display:inline-block">' +
    '<text x="43" y="14" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Square</text>' +
    '<rect x="5" y="24" width="76" height="76" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<polyline points="5,44 25,44 25,24" fill="none" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="43" y="112" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">square corners</text>' +
    '<line x1="127" y1="8" x2="127" y2="107" stroke="#ddd" stroke-width="1"/>' +
    '<text x="188" y="14" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Rhombus</text>' +
    '<polygon points="188,18 233,62 188,106 143,62" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="188" y="112" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">leaning corners</text>' +
    '</svg>',
    'Both have 4 equal sides — the corners are different!'
  );
}

function _tvHexVsPenta() {
  // Side-by-side hexagon (6 sides) vs pentagon (5 sides) — points computed at parse time
  var i, a, hPts = [], pPts = [];
  for (i = 0; i < 6; i++) {
    a = (i * 60 - 90) * Math.PI / 180;
    hPts.push((68 + 44 * Math.cos(a)).toFixed(1) + ',' + (59 + 44 * Math.sin(a)).toFixed(1));
  }
  for (i = 0; i < 5; i++) {
    a = (i * 72 - 90) * Math.PI / 180;
    pPts.push((182 + 38 * Math.cos(a)).toFixed(1) + ',' + (59 + 38 * Math.sin(a)).toFixed(1));
  }
  return _tvWrap(
    '<svg width="250" height="112" viewBox="0 0 250 112" style="display:inline-block">' +
    '<text x="68" y="10" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Hexagon</text>' +
    '<polygon points="' + hPts.join(' ') + '" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="68" y="108" font-size="11" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">6 sides</text>' +
    '<line x1="125" y1="8" x2="125" y2="104" stroke="#ddd" stroke-width="1"/>' +
    '<text x="182" y="10" font-size="11" font-weight="700" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">Pentagon</text>' +
    '<polygon points="' + pPts.join(' ') + '" fill="#888" opacity="0.13" stroke="#999" stroke-width="3"/>' +
    '<text x="182" y="108" font-size="11" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">5 sides</text>' +
    '</svg>',
    'Count carefully: 6 sides = hexagon     5 sides = pentagon'
  );
}

function _tvHexSides() {
  // Hexagon with numbered circles on each side midpoint
  var cx = 80, cy = 66, r = 50, i, a, verts = [];
  for (i = 0; i < 6; i++) {
    a = (i * 60 - 90) * Math.PI / 180;
    verts.push({x: cx + r * Math.cos(a), y: cy + r * Math.sin(a)});
  }
  var pts = verts.map(function(v){ return v.x.toFixed(1) + ',' + v.y.toFixed(1); }).join(' ');
  var dots = '';
  for (i = 0; i < 6; i++) {
    var v1 = verts[i], v2 = verts[(i + 1) % 6];
    var mx = (v1.x + v2.x) / 2, my = (v1.y + v2.y) / 2;
    var dx = mx - cx, dy = my - cy;
    var len = Math.sqrt(dx * dx + dy * dy);
    var lx = (mx + dx / len * 15).toFixed(1);
    var ly = (my + dy / len * 15).toFixed(1);
    dots += '<circle cx="' + lx + '" cy="' + ly + '" r="10" fill="' + _TVP + '"/>' +
      '<text x="' + lx + '" y="' + (parseFloat(ly) + 4).toFixed(1) + '" font-size="11" font-weight="bold" fill="white" text-anchor="middle" font-family="Nunito,sans-serif">' + (i + 1) + '</text>';
  }
  return _tvWrap(
    '<svg width="160" height="132" viewBox="0 0 160 132" style="display:inline-block">' +
    '<polygon points="' + pts + '" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    dots +
    '</svg>',
    '6 sides = hexagon'
  );
}

// ── Intervention factories ───────────────────────────────────────────────────

function _iWS(shape) {
  var steps = {
    circle:    ['A circle is perfectly round — no sides, no corners.', 'Trace the edge: it curves all the way around with no straight parts.', 'That curving edge is what makes it a circle.'],
    triangle:  ['A triangle has exactly 3 straight sides.', 'Count the sides: 1, 2, 3.', '3 sides and 3 corners = triangle.'],
    rectangle: ['A rectangle has 4 straight sides and 4 corners.', 'Two sides are longer and two are shorter.', 'The unequal side lengths are what make it a rectangle.'],
    square:    ['A square has 4 sides and 4 corners.', 'All 4 sides are the same length.', '4 equal sides = square.'],
    rhombus:   ['A rhombus has 4 equal sides.', 'Its corners lean to the side — they are not square.', 'Equal sides + leaning corners = rhombus.'],
    hexagon:   ['A hexagon has 6 straight sides.', 'Count: 1, 2, 3, 4, 5, 6.', '6 sides = hexagon.']
  };
  var tvMap = {
    circle:    _tvCircle0(),
    triangle:  _tvTriangleSides(),
    rectangle: _tvRectAnnotated(),
    square:    _tvSquareAnnotated(),
    rhombus:   _tvSquareVsRhombus(),
    hexagon:   _tvHexSides()
  };
  return {
    errorTag: _WS,
    title: 'Let\'s identify this shape',
    teachingSteps: steps[shape],
    teachingVisualRaw: tvMap[shape],
    correctAnswerExplanation: 'This shape is a ' + shape + '.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _iCO() {
  return {
    errorTag: _CO,
    title: 'Circle vs. oval',
    teachingSteps: [
      'A circle is perfectly round — it looks the same from every direction.',
      'An oval stretches out, like an egg.',
      'This shape is perfectly round — that means it is a circle.',
      'A circle has no sides and no corners.'
    ],
    correctAnswerExplanation: 'This is a circle. It is perfectly round — not stretched like an oval.',
    teachingVisualRaw: _tvCircleVsOval(),
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _iSR() {
  return {
    errorTag: _SR,
    title: 'Rectangle or square?',
    teachingSteps: [
      'Both a rectangle and a square have 4 sides and 4 corners.',
      'A square has 4 equal sides — all the same length.',
      'A rectangle has 2 longer sides and 2 shorter sides.',
      'Check the side lengths to tell them apart.'
    ],
    correctAnswerExplanation: 'Check the side lengths: equal sides = square; unequal sides = rectangle.',
    teachingVisualRaw: _tvRectVsSquare(),
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _iSRh() {
  return {
    errorTag: _SRh,
    title: 'Rhombus vs. square',
    teachingSteps: [
      'A rhombus and a square both have 4 equal sides.',
      'The difference is in the corners.',
      'A square has square corners — like the corner of a book.',
      'A rhombus has leaning corners — they tilt to the side.'
    ],
    correctAnswerExplanation: 'Both have 4 equal sides, but the corners are different. Square corners = square. Leaning corners = rhombus.',
    teachingVisualRaw: _tvSquareVsRhombus(),
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _iHP() {
  return {
    errorTag: _HP,
    title: 'Hexagon vs. pentagon',
    teachingSteps: [
      'Count the sides carefully — touch each side as you go.',
      'A pentagon has 5 sides.',
      'A hexagon has 6 sides.',
      'Count again: 1, 2, 3, 4, 5, 6. Six sides = hexagon.'
    ],
    correctAnswerExplanation: 'Count the sides: 5 = pentagon, 6 = hexagon.',
    teachingVisualRaw: _tvHexVsPenta(),
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _iSNC() {
  return {
    errorTag: _SNC,
    title: 'Count the sides',
    teachingSteps: [
      'A side is a straight line that forms the edge of a shape.',
      'Touch each side as you count.',
      'Go all the way around without skipping any.',
      'The number of sides is your answer.'
    ],
    correctAnswerExplanation: 'Touch each straight side and count: that is the number of sides.',
    teachingVisualRaw: _tvTriangleSides(),
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _iCNC() {
  return {
    errorTag: _CNC,
    title: 'Count the corners',
    teachingSteps: [
      'A corner is where two sides meet.',
      'Touch each corner as you count.',
      'Go all the way around the shape.',
      'The number of corners equals the number of sides.'
    ],
    correctAnswerExplanation: 'Touch each corner and count: that is the number of corners.',
    teachingVisualRaw: _tvTriangleCorners(),
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

// ── C1: Basic naming — circle, triangle, rectangle, square (22E) ─────────────

var _l51C1 = [

  // Circles (6E)
  {t:'What is the name of this shape?', s:_svgCircle(), o:[{val:'Circle'},{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS}], a:0, e:'A circle is perfectly round with no sides and no corners.', d:'e', h:'Does this shape have any straight sides?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'Which name matches this shape?', s:_svgCircle(), o:[{val:'Triangle',tag:_WS},{val:'Circle'},{val:'Rectangle',tag:_WS},{val:'Rhombus',tag:_WS}], a:1, e:'A circle has no sides and no corners — it curves all the way around.', d:'e', h:'Look at the edge. Is any part straight?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'What shape is this?', s:_svgCircle(), o:[{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Circle'},{val:'Hexagon',tag:_WS}], a:2, e:'This is a circle. It has no straight sides — it is perfectly round.', d:'e', h:'Count the straight sides.', sk:'identify_2d_shapes', i:_iWS('circle')},
  {t:'Which word names this shape?', s:_svgCircle(), o:[{val:'Rectangle',tag:_WS},{val:'Rhombus',tag:_WS},{val:'Triangle',tag:_WS},{val:'Circle'}], a:3, e:'A circle curves all the way around. No straight sides, no corners.', d:'e', h:'Is the outline curved or straight?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'What is the name of this shape?', s:_svgCircle(), o:[{val:'Hexagon',tag:_WS},{val:'Circle'},{val:'Square',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'A circle is a round shape with no sides and no corners.', d:'e', h:'This shape is perfectly round.', sk:'identify_2d_shapes', i:_iWS('circle')},
  {t:'Which name matches this shape?', s:_svgCircle(), o:[{val:'Circle'},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS},{val:'Hexagon',tag:_WS}], a:0, e:'A circle has no straight edges — it curves all the way around.', d:'e', h:'No straight edges — which shape is that?', sk:'identify_2d_shapes', i:_iCO()},

  // Triangles (6E)
  {t:'What is the name of this shape?', s:_svgTriangle(0), o:[{val:'Triangle'},{val:'Circle',tag:_WS},{val:'Square',tag:_WS},{val:'Rectangle',tag:_WS}], a:0, e:'A triangle has 3 straight sides and 3 corners.', d:'e', h:'Count the straight sides.', sk:'identify_2d_shapes', i:_iWS('triangle')},
  {t:'Which name matches this shape?', s:_svgTriangle(30), o:[{val:'Circle',tag:_WS},{val:'Triangle'},{val:'Rectangle',tag:_WS},{val:'Hexagon',tag:_WS}], a:1, e:'Count the sides: 1, 2, 3. Three sides means triangle.', d:'e', h:'How many straight sides does this shape have?', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'What shape is this?', s:_svgTriangle(60), o:[{val:'Rectangle',tag:_WS},{val:'Square',tag:_WS},{val:'Triangle'},{val:'Circle',tag:_WS}], a:2, e:'This triangle has 3 sides and 3 corners.', d:'e', h:'Look at the number of sides.', sk:'identify_2d_shapes', i:_iWS('triangle')},
  {t:'Which word names this shape?', s:_svgTriangle(120), o:[{val:'Square',tag:_WS},{val:'Circle',tag:_WS},{val:'Hexagon',tag:_WS},{val:'Triangle'}], a:3, e:'3 corners, 3 sides — that is always a triangle.', d:'e', h:'Count the corners. How many are there?', sk:'identify_2d_shapes', i:_iWS('triangle')},
  {t:'What is the name of this shape?', s:_svgTriangle(150), o:[{val:'Triangle'},{val:'Rectangle',tag:_WS},{val:'Circle',tag:_WS},{val:'Square',tag:_WS}], a:0, e:'A triangle has 3 sides. Count them: 1, 2, 3.', d:'e', h:'This shape is pointy. How many sides does it have?', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'Which name matches this shape?', s:_svgTriangle(90), o:[{val:'Rectangle',tag:_WS},{val:'Triangle'},{val:'Square',tag:_WS},{val:'Circle',tag:_WS}], a:1, e:'Three sides = triangle.', d:'e', h:'Start at one corner and count each side.', sk:'identify_2d_shapes', i:_iWS('triangle')},

  // Rectangles (5E)
  {t:'What is the name of this shape?', s:_svgRect(), o:[{val:'Rectangle'},{val:'Square',tag:_SR},{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS}], a:0, e:'A rectangle has 4 sides. Two sides are longer and two are shorter.', d:'e', h:'Are all 4 sides the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Which name matches this shape?', s:_svgRect(), o:[{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS},{val:'Rectangle'},{val:'Square',tag:_SR}], a:2, e:'This shape has 4 sides. The long sides and short sides are different lengths — it is a rectangle.', d:'e', h:'Count the sides. Are they all the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'What shape is this?', s:_svgRect(), o:[{val:'Circle',tag:_WS},{val:'Rectangle'},{val:'Rhombus',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:"A rectangle's sides are not all equal — two are longer, two are shorter.", d:'e', h:'This shape has 4 sides and 4 corners. Are all sides the same?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Which word names this shape?', s:_svgRect(), o:[{val:'Square',tag:_SR},{val:'Triangle',tag:_WS},{val:'Hexagon',tag:_WS},{val:'Rectangle'}], a:3, e:'Two sides are longer, two are shorter — rectangle.', d:'e', h:'Look at the side lengths. Are all 4 sides equal?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'What is the name of this shape?', s:_svgRect(), o:[{val:'Rectangle'},{val:'Square',tag:_SR},{val:'Hexagon',tag:_WS},{val:'Circle',tag:_WS}], a:0, e:'This shape has 4 sides and 4 corners, but the sides are not all equal: it is a rectangle.', d:'e', h:'How many sides does this shape have? Are they all equal?', sk:'identify_2d_shapes', i:_iSR()},

  // Squares (5E)
  {t:'What is the name of this shape?', s:_svgSquare(), o:[{val:'Square'},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS}], a:0, e:'A square has 4 equal sides and 4 square corners.', d:'e', h:'Are all 4 sides the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Which name matches this shape?', s:_svgSquare(), o:[{val:'Triangle',tag:_WS},{val:'Square'},{val:'Rectangle',tag:_SR},{val:'Circle',tag:_WS}], a:1, e:'All 4 sides are the same length — that is a square.', d:'e', h:'Count the sides. Are they all the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'What shape is this?', s:_svgSquare(), o:[{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS},{val:'Square'},{val:'Rhombus',tag:_SRh}], a:2, e:'A square has 4 equal sides. All 4 sides here are the same length.', d:'e', h:'This shape has 4 sides. Are all 4 sides equal?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Which word names this shape?', s:_svgSquare(), o:[{val:'Rectangle',tag:_SR},{val:'Rhombus',tag:_SRh},{val:'Triangle',tag:_WS},{val:'Square'}], a:3, e:'This shape has 4 equal sides and 4 square (not leaning) corners — it is a square.', d:'e', h:'Look at the corners. Do they lean or are they square?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What is the name of this shape?', s:_svgSquare(), o:[{val:'Square'},{val:'Rhombus',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS}], a:0, e:'4 equal sides and corners that do not lean = square.', d:'e', h:'This shape has 4 equal sides. Do its corners lean?', sk:'identify_2d_shapes', i:_iSRh()}

];

// ── C2: Rhombus naming (5E + 10M + 5H = 20) ─────────────────────────────────

var _l51C2 = [

  // Easy (5)
  {t:'What is the name of this shape?', s:_svgRhombus(0), o:[{val:'Square',tag:_SRh},{val:'Rectangle',tag:_WS},{val:'Triangle',tag:_WS},{val:'Rhombus'}], a:3, e:'A rhombus has 4 equal sides, but its corners lean — they are not square.', d:'e', h:'Look at the corners. Do they make a square angle or do they lean?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which name matches this shape?', s:_svgRhombus(0), o:[{val:'Rhombus'},{val:'Square',tag:_SRh},{val:'Circle',tag:_WS},{val:'Triangle',tag:_WS}], a:0, e:'A rhombus is a 4-sided shape with 4 equal sides and leaning corners.', d:'e', h:'This shape has 4 equal sides. Are the corners square or leaning?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What shape is this?', s:_svgRhombus(0), o:[{val:'Triangle',tag:_WS},{val:'Rhombus'},{val:'Square',tag:_SRh},{val:'Rectangle',tag:_WS}], a:1, e:'This is a rhombus. It has 4 equal sides and corners that lean.', d:'e', h:'4 equal sides — but look at the corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which word names this shape?', s:_svgRhombus(15), o:[{val:'Circle',tag:_WS},{val:'Triangle',tag:_WS},{val:'Rhombus'},{val:'Square',tag:_SRh}], a:2, e:'A rhombus has 4 equal sides. Unlike a square, its corners lean.', d:'e', h:'The corners lean to the side. What shape has leaning corners?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What is the name of this shape?', s:_svgRhombus(15), o:[{val:'Rectangle',tag:_WS},{val:'Rhombus'},{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS}], a:1, e:'A rhombus has 4 equal, straight sides. The corners are not square — they lean.', d:'e', h:'Count the sides. Look at the corners.', sk:'identify_2d_shapes', i:_iSRh()},

  // Medium (10)
  {t:'What is the name of this shape?', s:_svgRhombus(30), o:[{val:'Square',tag:_SRh},{val:'Rhombus'},{val:'Rectangle',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'Even when tilted, a shape with 4 equal sides and leaning corners is a rhombus.', d:'m', h:'Count the sides. Look at the corners — do they lean?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which name matches this shape?', s:_svgRhombus(30), o:[{val:'Triangle',tag:_WS},{val:'Square',tag:_SRh},{val:'Circle',tag:_WS},{val:'Rhombus'}], a:3, e:'A rhombus has 4 equal sides and corners that lean to the side.', d:'m', h:'4 equal sides and leaning corners — what is this shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What shape is this?', s:_svgRhombus(45), o:[{val:'Rhombus'},{val:'Square',tag:_SRh},{val:'Rectangle',tag:_WS},{val:'Hexagon',tag:_WS}], a:0, e:'This shape has 4 equal sides. Its corners lean — not square corners. That is a rhombus.', d:'m', h:'Are the corners square or leaning?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which word names this shape?', s:_svgRhombus(45), o:[{val:'Square',tag:_SRh},{val:'Triangle',tag:_WS},{val:'Rhombus'},{val:'Rectangle',tag:_WS}], a:2, e:'A rhombus: 4 equal sides, leaning corners.', d:'m', h:'Look at the corners carefully.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Look at the corners of this shape. They lean to the side. What is the name of this shape?', s:_svgRhombus(0), o:[{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Rhombus'},{val:'Triangle',tag:_WS}], a:2, e:'Leaning corners with 4 equal sides = rhombus.', d:'m', h:'Leaning corners — square or rhombus?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 4 equal sides. Its corners are not square. What is it?', s:_svgRhombus(15), o:[{val:'Square',tag:_SRh},{val:'Rhombus'},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS}], a:1, e:'4 equal sides + leaning corners = rhombus.', d:'m', h:'Not square corners — that rules out which shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What is the name of this shape?', s:_svgRhombus(30), o:[{val:'Rectangle',tag:_WS},{val:'Square',tag:_SRh},{val:'Triangle',tag:_WS},{val:'Rhombus'}], a:3, e:'4 equal sides, leaning corners — rhombus.', d:'m', h:'Count the sides. Are they all equal? Look at the corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which name matches this shape?', s:_svgRhombus(45), o:[{val:'Rhombus'},{val:'Rectangle',tag:_WS},{val:'Square',tag:_SRh},{val:'Circle',tag:_WS}], a:0, e:'A rhombus has 4 equal sides and leaning corners.', d:'m', h:'4 sides, all equal, but leaning corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What shape is this?', s:_svgRhombus(60), o:[{val:'Square',tag:_SRh},{val:'Triangle',tag:_WS},{val:'Rhombus'},{val:'Rectangle',tag:_WS}], a:2, e:'No matter how much it is rotated, 4 equal sides with leaning corners = rhombus.', d:'m', h:'Even when rotated, look at the corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What is the name of this shape?', s:_svgRhombus(15), o:[{val:'Triangle',tag:_WS},{val:'Rhombus'},{val:'Square',tag:_SRh},{val:'Hexagon',tag:_WS}], a:1, e:'4 equal sides and leaning corners = rhombus.', d:'m', h:'Look at the corner angle — does it lean?', sk:'identify_2d_shapes', i:_iSRh()},

  // Hard (5)
  {t:'What is the name of this shape?', s:_svgRhombus(75), o:[{val:'Square',tag:_SRh},{val:'Rhombus'},{val:'Rectangle',tag:_WS},{val:'Pentagon',tag:_HP}], a:1, e:'Even heavily tilted, this shape has 4 equal sides with leaning corners — it is a rhombus.', d:'h', h:'Count the sides. Check the corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which name matches this shape?', s:_svgRhombus(60), o:[{val:'Triangle',tag:_WS},{val:'Square',tag:_SRh},{val:'Pentagon',tag:_HP},{val:'Rhombus'}], a:3, e:'Count the sides: 4. Are they equal? Yes. Do the corners lean? Yes. That is a rhombus.', d:'h', h:'Count sides, then check corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student said this shape is a square because it has 4 equal sides. What is the shape really?', s:_svgRhombus(45), o:[{val:'Square',tag:_SRh},{val:'Rhombus'},{val:'Rectangle',tag:_SR},{val:'Hexagon',tag:_WS}], a:1, e:'4 equal sides is true for both a square and a rhombus. But the corners lean — so it is a rhombus.', d:'h', h:'Both a square and a rhombus have 4 equal sides. What else can you check?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What shape is this?', s:_svgRhombus(75), o:[{val:'Rhombus'},{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Pentagon',tag:_HP}], a:0, e:'Tilted shape, 4 equal sides, leaning corners: rhombus.', d:'h', h:'What do the corners look like?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 4 equal sides. Its corners are NOT square. Which name fits?', s:_svgRhombus(30), o:[{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS},{val:'Rhombus'}], a:3, e:'If it has 4 equal sides but the corners lean, it is a rhombus.', d:'h', h:'Not square corners — which shape has leaning corners?', sk:'identify_2d_shapes', i:_iSRh()}

];

// ── C3: Hexagon naming (5E + 10M + 5H = 20) ─────────────────────────────────

var _l51C3 = [

  // Easy (5)
  {t:'What is the name of this shape?', s:_svgHex(0), o:[{val:'Hexagon'},{val:'Circle',tag:_WS},{val:'Triangle',tag:_WS},{val:'Square',tag:_WS}], a:0, e:'A hexagon has 6 sides and 6 corners.', d:'e', h:'Count the sides.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which name matches this shape?', s:_svgHex(30), o:[{val:'Circle',tag:_WS},{val:'Hexagon'},{val:'Rectangle',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'Count the sides: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'e', h:'Count every side carefully.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What shape is this?', s:_svgHex(0), o:[{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS},{val:'Hexagon'},{val:'Rectangle',tag:_WS}], a:2, e:'A hexagon has 6 sides and 6 corners.', d:'e', h:'How many sides does this shape have?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which word names this shape?', s:_svgHex(30), o:[{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS},{val:'Hexagon'}], a:3, e:'Six sides and six corners = hexagon.', d:'e', h:'Count the sides one by one.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What is the name of this shape?', s:_svgHex(0), o:[{val:'Hexagon'},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS},{val:'Circle',tag:_WS}], a:0, e:'A hexagon has 6 sides. Count them: 1, 2, 3, 4, 5, 6.', d:'e', h:'Start at one corner and count each side.', sk:'identify_2d_shapes', i:_iHP()},

  // Medium (10)
  {t:'What is the name of this shape?', s:_svgHex(10), o:[{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Circle',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'Count carefully: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'m', h:'Count every side carefully.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which name matches this shape?', s:_svgHex(10), o:[{val:'Triangle',tag:_WS},{val:'Pentagon',tag:_HP},{val:'Square',tag:_WS},{val:'Hexagon'}], a:3, e:'6 sides = hexagon. 5 sides = pentagon.', d:'m', h:'Is it 5 sides or 6 sides?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What shape is this?', s:_svgHex(20), o:[{val:'Hexagon'},{val:'Pentagon',tag:_HP},{val:'Rectangle',tag:_WS},{val:'Circle',tag:_WS}], a:0, e:'Six sides = hexagon. Five sides = pentagon.', d:'m', h:'Count the sides. Is it 5 or 6?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which word names this shape?', s:_svgHex(20), o:[{val:'Pentagon',tag:_HP},{val:'Triangle',tag:_WS},{val:'Hexagon'},{val:'Square',tag:_WS}], a:2, e:'Count the sides: 6. Six sides = hexagon.', d:'m', h:'Touch each side as you count.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'This shape has 6 sides. What is its name?', s:_svgHex(0), o:[{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Rectangle',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'6 sides = hexagon. (5 sides = pentagon.)', d:'m', h:'6 sides — hexagon or pentagon?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'This shape has 6 corners. What is its name?', s:_svgHex(30), o:[{val:'Triangle',tag:_WS},{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Rectangle',tag:_WS}], a:2, e:'6 corners = hexagon. The number of corners equals the number of sides.', d:'m', h:'6 corners — which shape has 6?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What is the name of this shape?', s:_svgHex(15), o:[{val:'Circle',tag:_WS},{val:'Hexagon'},{val:'Pentagon',tag:_HP},{val:'Rectangle',tag:_WS}], a:1, e:'6 sides and 6 corners = hexagon.', d:'m', h:'Count the sides carefully.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which name matches this shape?', s:_svgHex(15), o:[{val:'Hexagon'},{val:'Triangle',tag:_WS},{val:'Pentagon',tag:_HP},{val:'Square',tag:_WS}], a:0, e:'A hexagon has 6 sides.', d:'m', h:'Look for the shape with 6 sides.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What shape is this?', s:_svgHex(30), o:[{val:'Pentagon',tag:_HP},{val:'Square',tag:_WS},{val:'Circle',tag:_WS},{val:'Hexagon'}], a:3, e:'Count: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'m', h:'Start at one corner. Count each side all the way around.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Count the sides of this shape. What is it?', s:_svgHex(10), o:[{val:'Rectangle',tag:_WS},{val:'Hexagon'},{val:'Pentagon',tag:_HP},{val:'Triangle',tag:_WS}], a:1, e:'Counted 6 sides = hexagon.', d:'m', h:'Touch each side as you count.', sk:'identify_2d_shapes', i:_iHP()},

  // Hard (5)
  {t:'What is the name of this shape?', s:_svgHex(25), o:[{val:'Hexagon'},{val:'Pentagon',tag:_HP},{val:'Square',tag:_WS},{val:'Triangle',tag:_WS}], a:0, e:'Even when rotated, counting 6 sides tells us this is a hexagon.', d:'h', h:'Count slowly. Touch each side with your finger.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which name matches this shape?', s:_svgHex(25), o:[{val:'Pentagon',tag:_HP},{val:'Rectangle',tag:_WS},{val:'Hexagon'},{val:'Circle',tag:_WS}], a:2, e:'Count carefully: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'h', h:'Count each side — do not skip any.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What shape is this?', s:_svgHex(35), o:[{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS}], a:1, e:'Count carefully on the rotated shape: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'h', h:'Even when rotated, count each side.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which word names this shape?', s:_svgHex(5), o:[{val:'Triangle',tag:_WS},{val:'Square',tag:_WS},{val:'Pentagon',tag:_HP},{val:'Hexagon'}], a:3, e:'Six sides = hexagon, not pentagon.', d:'h', h:'Count carefully — is it 5 or 6 sides?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'What is the name of this shape?', s:_svgHex(40), o:[{val:'Pentagon',tag:_HP},{val:'Circle',tag:_WS},{val:'Square',tag:_WS},{val:'Hexagon'}], a:3, e:'Count: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'h', h:'Even when tilted, count each side carefully.', sk:'identify_2d_shapes', i:_iHP()}

];

// ── C4: How many sides? (10E + 10M + 5H = 25) ───────────────────────────────

var _l51C4 = [

  // Easy (10) — circles (5), triangles (3), rect/square (2)
  {t:'How many sides does this shape have?', s:_svgCircle(), o:[{val:'0'},{val:'3',tag:_SNC},{val:'4',tag:_SNC},{val:'6',tag:_SNC}], a:0, e:'A circle has 0 sides — it is perfectly round with no straight parts.', d:'e', h:'Does this shape have any straight edges?', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'Count the sides of this shape. How many are there?', s:_svgCircle(), o:[{val:'6',tag:_SNC},{val:'4',tag:_SNC},{val:'0'},{val:'3',tag:_SNC}], a:2, e:'A circle has no sides at all — it curves all the way around.', d:'e', h:'Count each straight line. Are there any?', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgCircle(), o:[{val:'3',tag:_SNC},{val:'0'},{val:'4',tag:_SNC},{val:'6',tag:_SNC}], a:1, e:'A circle is round. It has no straight sides — 0 sides.', d:'e', h:'Look for straight edges.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does a circle have?', s:_svgCircle(), o:[{val:'0'},{val:'4',tag:_SNC},{val:'3',tag:_SNC},{val:'6',tag:_SNC}], a:0, e:'A circle has 0 sides. It has no straight lines.', d:'e', h:'A circle is round — does round mean straight or curved?', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'Count the sides of this circle. What is the answer?', s:_svgCircle(), o:[{val:'4',tag:_SNC},{val:'6',tag:_SNC},{val:'3',tag:_SNC},{val:'0'}], a:3, e:'A circle has zero sides. Its edge is one smooth curve.', d:'e', h:'Count each straight side.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgTriangle(0), o:[{val:'3'},{val:'4',tag:_SNC},{val:'6',tag:_SNC},{val:'2',tag:_SNC}], a:0, e:'A triangle has 3 straight sides.', d:'e', h:'Count each side one by one.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'Count the sides. How many does this shape have?', s:_svgTriangle(45), o:[{val:'4',tag:_SNC},{val:'3'},{val:'6',tag:_SNC},{val:'0',tag:_SNC}], a:1, e:'Count: 1, 2, 3. This triangle has 3 sides.', d:'e', h:'Touch each side as you count.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this triangle have?', s:_svgTriangle(90), o:[{val:'6',tag:_SNC},{val:'4',tag:_SNC},{val:'3'},{val:'2',tag:_SNC}], a:2, e:'Every triangle has exactly 3 sides.', d:'e', h:'Every triangle has the same number of sides.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgRect(), o:[{val:'3',tag:_SNC},{val:'4'},{val:'6',tag:_SNC},{val:'0',tag:_SNC}], a:1, e:'A rectangle has 4 sides.', d:'e', h:'Count: top, right, bottom, left.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgSquare(), o:[{val:'3',tag:_SNC},{val:'6',tag:_SNC},{val:'0',tag:_SNC},{val:'4'}], a:3, e:'A square has 4 sides.', d:'e', h:'Count each side carefully.', sk:'identify_2d_shapes', i:_iSNC()},

  // Medium (10) — rhombus (3), hexagon (4), mixed (3)
  {t:'How many sides does this shape have?', s:_svgRhombus(0), o:[{val:'3',tag:_SNC},{val:'4'},{val:'6',tag:_SNC},{val:'5',tag:_SNC}], a:1, e:'A rhombus has 4 sides — count them: 1, 2, 3, 4.', d:'m', h:'Count the straight sides one by one.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'Count the sides. How many does this shape have?', s:_svgRhombus(30), o:[{val:'4'},{val:'6',tag:_SNC},{val:'3',tag:_SNC},{val:'5',tag:_SNC}], a:0, e:'This rhombus has 4 sides.', d:'m', h:'Touch each side and count.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgRhombus(45), o:[{val:'5',tag:_SNC},{val:'3',tag:_SNC},{val:'4'},{val:'6',tag:_SNC}], a:2, e:'Count carefully: 1, 2, 3, 4. Four sides.', d:'m', h:'Count each edge of this tilted shape.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgHex(0), o:[{val:'5',tag:_HP},{val:'4',tag:_SNC},{val:'6'},{val:'3',tag:_SNC}], a:2, e:'A hexagon has 6 sides: 1, 2, 3, 4, 5, 6.', d:'m', h:'Count slowly — this shape has more than 4 sides.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'Count the sides of this shape. How many are there?', s:_svgHex(30), o:[{val:'6'},{val:'5',tag:_HP},{val:'4',tag:_SNC},{val:'3',tag:_SNC}], a:0, e:'Six sides — this is a hexagon.', d:'m', h:'Touch each side as you count all the way around.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this hexagon have?', s:_svgHex(0), o:[{val:'4',tag:_SNC},{val:'3',tag:_SNC},{val:'5',tag:_HP},{val:'6'}], a:3, e:'A hexagon always has 6 sides.', d:'m', h:'Count all the way around.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgHex(15), o:[{val:'3',tag:_SNC},{val:'6'},{val:'5',tag:_HP},{val:'4',tag:_SNC}], a:1, e:'Count all 6 sides: 1, 2, 3, 4, 5, 6.', d:'m', h:'Start at one corner and count each side until you get back to the start.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'A student said this shape has 3 sides. How many sides does it really have?', s:_svgRect(), o:[{val:'3',tag:_SNC},{val:'6',tag:_SNC},{val:'4'},{val:'0',tag:_SNC}], a:2, e:'A rectangle has 4 sides. Count: top, right, bottom, left.', d:'m', h:'Count each side of the rectangle.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgSquare(), o:[{val:'3',tag:_SNC},{val:'0',tag:_SNC},{val:'6',tag:_SNC},{val:'4'}], a:3, e:'A square has 4 sides — count: top, right, bottom, left.', d:'m', h:'This shape has more than 3 sides.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgTriangle(120), o:[{val:'4',tag:_SNC},{val:'3'},{val:'6',tag:_SNC},{val:'0',tag:_SNC}], a:1, e:'Every triangle has exactly 3 sides, no matter which way it points.', d:'m', h:'Even when a triangle is rotated, it still has the same number of sides.', sk:'identify_2d_shapes', i:_iSNC()},

  // Hard (5)
  {t:'How many sides does this shape have?', s:_svgHex(10), o:[{val:'5',tag:_HP},{val:'4',tag:_SNC},{val:'6'},{val:'3',tag:_SNC}], a:2, e:'Count carefully: 1, 2, 3, 4, 5, 6. Six sides.', d:'h', h:'Count slowly. Touch each side.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgRhombus(75), o:[{val:'3',tag:_SNC},{val:'5',tag:_SNC},{val:'6',tag:_SNC},{val:'4'}], a:3, e:'This tilted rhombus still has 4 sides.', d:'h', h:'Even when tilted, count each straight edge.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'A student counted 5 sides. How many sides does this shape really have?', s:_svgHex(25), o:[{val:'4',tag:_SNC},{val:'5',tag:_HP},{val:'3',tag:_SNC},{val:'6'}], a:3, e:'Count carefully: 1, 2, 3, 4, 5, 6. The shape has 6 sides.', d:'h', h:'Count again — touch each side.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgTriangle(150), o:[{val:'3'},{val:'4',tag:_SNC},{val:'6',tag:_SNC},{val:'0',tag:_SNC}], a:0, e:'Every triangle has 3 sides, even when rotated.', d:'h', h:'It may look different, but all triangles have the same number of sides.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'How many sides does this shape have?', s:_svgRhombus(60), o:[{val:'6',tag:_SNC},{val:'3',tag:_SNC},{val:'4'},{val:'5',tag:_SNC}], a:2, e:'Even when heavily tilted, this rhombus has 4 sides.', d:'h', h:'Count each straight edge carefully.', sk:'identify_2d_shapes', i:_iSNC()}

];

// ── C5: How many corners? (8E + 10M + 5H = 23) ──────────────────────────────

var _l51C5 = [

  // Easy (8) — circles (4), triangles (2), rect/square (2)
  {t:'How many corners does this shape have?', s:_svgCircle(), o:[{val:'0'},{val:'3',tag:_CNC},{val:'4',tag:_CNC},{val:'6',tag:_CNC}], a:0, e:'A circle has 0 corners — it has no straight sides, so no corners.', d:'e', h:'A corner is where two sides meet. Does this shape have sides?', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'Count the corners. How many does this shape have?', s:_svgCircle(), o:[{val:'4',tag:_CNC},{val:'0'},{val:'3',tag:_CNC},{val:'6',tag:_CNC}], a:1, e:'A circle has no corners.', d:'e', h:'Look for the pointy places. Does this shape have any?', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does a circle have?', s:_svgCircle(), o:[{val:'3',tag:_CNC},{val:'4',tag:_CNC},{val:'6',tag:_CNC},{val:'0'}], a:3, e:'Zero. A circle is perfectly round and has no corners.', d:'e', h:'Corners only happen where two straight sides meet.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'Count the corners of this shape.', s:_svgCircle(), o:[{val:'0'},{val:'4',tag:_CNC},{val:'3',tag:_CNC},{val:'6',tag:_CNC}], a:0, e:'A circle has 0 corners. No corners, no sides.', d:'e', h:'Does this shape have any pointy places?', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgTriangle(0), o:[{val:'3'},{val:'4',tag:_CNC},{val:'6',tag:_CNC},{val:'2',tag:_CNC}], a:0, e:'A triangle has 3 corners — one at each point.', d:'e', h:'Touch each pointy place and count.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'Count the corners of this shape.', s:_svgTriangle(45), o:[{val:'4',tag:_CNC},{val:'3'},{val:'6',tag:_CNC},{val:'0',tag:_CNC}], a:1, e:'Count the pointy places: 1, 2, 3. Three corners.', d:'e', h:'Count each corner — where do the sides meet?', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgRect(), o:[{val:'3',tag:_CNC},{val:'6',tag:_CNC},{val:'4'},{val:'0',tag:_CNC}], a:2, e:'A rectangle has 4 corners — one in each corner of the shape.', d:'e', h:'Count each corner of this rectangle.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgSquare(), o:[{val:'6',tag:_CNC},{val:'3',tag:_CNC},{val:'0',tag:_CNC},{val:'4'}], a:3, e:'A square has 4 corners.', d:'e', h:'Count the corners of this square.', sk:'identify_2d_shapes', i:_iCNC()},

  // Medium (10) — rhombus (3), hexagon (4), mixed (3)
  {t:'How many corners does this shape have?', s:_svgRhombus(0), o:[{val:'3',tag:_CNC},{val:'4'},{val:'6',tag:_CNC},{val:'5',tag:_CNC}], a:1, e:'A rhombus has 4 corners — one at each tip.', d:'m', h:'Touch each tip and count.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'Count the corners. How many does this shape have?', s:_svgRhombus(30), o:[{val:'4'},{val:'3',tag:_CNC},{val:'6',tag:_CNC},{val:'5',tag:_CNC}], a:0, e:'This rhombus has 4 corners.', d:'m', h:'Count each corner of the tilted shape.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgRhombus(45), o:[{val:'6',tag:_CNC},{val:'3',tag:_CNC},{val:'4'},{val:'5',tag:_CNC}], a:2, e:'4 corners. The number of corners equals the number of sides.', d:'m', h:'The number of corners equals the number of sides.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgHex(0), o:[{val:'5',tag:_HP},{val:'4',tag:_CNC},{val:'6'},{val:'3',tag:_CNC}], a:2, e:'A hexagon has 6 corners — one at each point.', d:'m', h:'Count each pointy corner all the way around.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'Count the corners. How many does this shape have?', s:_svgHex(30), o:[{val:'6'},{val:'4',tag:_CNC},{val:'5',tag:_HP},{val:'3',tag:_CNC}], a:0, e:'Count the corners: 1, 2, 3, 4, 5, 6. Six corners.', d:'m', h:'Touch each corner and count.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this hexagon have?', s:_svgHex(0), o:[{val:'4',tag:_CNC},{val:'3',tag:_CNC},{val:'5',tag:_HP},{val:'6'}], a:3, e:'A hexagon always has 6 corners.', d:'m', h:'A hexagon has as many corners as it has sides.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgHex(15), o:[{val:'3',tag:_CNC},{val:'6'},{val:'5',tag:_HP},{val:'4',tag:_CNC}], a:1, e:'Count: 1, 2, 3, 4, 5, 6. Six corners.', d:'m', h:'Count each corner of this shape.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgTriangle(120), o:[{val:'3'},{val:'4',tag:_CNC},{val:'0',tag:_CNC},{val:'6',tag:_CNC}], a:0, e:'A triangle has 3 corners, no matter which way it points.', d:'m', h:'Even when tilted, count each pointy corner.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'A student said this shape has 3 corners. How many corners does it really have?', s:_svgRect(), o:[{val:'3',tag:_CNC},{val:'2',tag:_CNC},{val:'4'},{val:'6',tag:_CNC}], a:2, e:'A rectangle has 4 corners: top-left, top-right, bottom-right, bottom-left.', d:'m', h:'Count each corner of the rectangle.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgHex(10), o:[{val:'5',tag:_HP},{val:'4',tag:_CNC},{val:'6'},{val:'3',tag:_CNC}], a:2, e:'Count the corners: 1, 2, 3, 4, 5, 6. Six corners.', d:'m', h:'Count each corner carefully.', sk:'identify_2d_shapes', i:_iCNC()},

  // Hard (5)
  {t:'How many corners does this shape have?', s:_svgRhombus(75), o:[{val:'3',tag:_CNC},{val:'5',tag:_CNC},{val:'6',tag:_CNC},{val:'4'}], a:3, e:'This tilted rhombus still has 4 corners.', d:'h', h:'Touch each corner as you count.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgHex(25), o:[{val:'5',tag:_HP},{val:'6'},{val:'4',tag:_CNC},{val:'3',tag:_CNC}], a:1, e:'Six corners — a hexagon always has 6.', d:'h', h:'Count slowly. Touch each corner.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgTriangle(150), o:[{val:'4',tag:_CNC},{val:'0',tag:_CNC},{val:'3'},{val:'6',tag:_CNC}], a:2, e:'A triangle always has 3 corners.', d:'h', h:'Even flipped, count each pointy corner.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'A student counted 5 corners. How many corners does this shape really have?', s:_svgHex(35), o:[{val:'4',tag:_CNC},{val:'5',tag:_HP},{val:'3',tag:_CNC},{val:'6'}], a:3, e:'Count carefully: 1, 2, 3, 4, 5, 6. Six corners.', d:'h', h:'Count again — do not skip any corner.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'How many corners does this shape have?', s:_svgRhombus(60), o:[{val:'6',tag:_CNC},{val:'3',tag:_CNC},{val:'4'},{val:'5',tag:_CNC}], a:2, e:'This rhombus has 4 corners, even when tilted.', d:'h', h:'Count each corner of this tilted shape.', sk:'identify_2d_shapes', i:_iCNC()}

];

// ── C6: Attribute → shape (5E + 8M + 7H = 20, no SVG) ───────────────────────

var _l51C6 = [

  // Easy (5)
  {t:'This shape has no sides and no corners. What is it?', o:[{val:'Circle'},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS},{val:'Square',tag:_WS}], a:0, e:'A circle has 0 sides and 0 corners.', d:'e', h:'Which shape has no straight sides at all?', sk:'identify_2d_shapes', i:_iWS('circle')},
  {t:'This shape has 3 sides and 3 corners. What is it?', o:[{val:'Circle',tag:_WS},{val:'Triangle'},{val:'Square',tag:_WS},{val:'Rectangle',tag:_WS}], a:1, e:'3 sides and 3 corners = triangle.', d:'e', h:'Which shape has exactly 3 sides?', sk:'identify_2d_shapes', i:_iWS('triangle')},
  {t:'This shape has 4 sides. Two sides are longer and two are shorter. What is it?', o:[{val:'Square',tag:_SR},{val:'Rectangle'},{val:'Triangle',tag:_WS},{val:'Circle',tag:_WS}], a:1, e:'A rectangle has 4 sides with 2 longer sides and 2 shorter sides.', d:'e', h:'Which shape has sides that are not all the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'This shape has 6 sides and 6 corners. What is it?', o:[{val:'Circle',tag:_WS},{val:'Triangle',tag:_WS},{val:'Hexagon'},{val:'Rectangle',tag:_WS}], a:2, e:'6 sides and 6 corners = hexagon.', d:'e', h:'Which shape has 6 sides?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'This shape has 4 equal sides and 4 square corners. What is it?', o:[{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS},{val:'Square'},{val:'Circle',tag:_WS}], a:2, e:'4 equal sides + 4 square corners = square.', d:'e', h:'Which shape has 4 sides that are all the same length?', sk:'identify_2d_shapes', i:_iSR()},

  // Medium (8)
  {t:'This shape has 4 equal sides but its corners lean. What is it?', o:[{val:'Square',tag:_SRh},{val:'Rhombus'},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS}], a:1, e:'4 equal sides + leaning corners = rhombus.', d:'m', h:'The corners lean — which shape has leaning corners?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape is perfectly round with no corners. What is it?', o:[{val:'Circle'},{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Hexagon',tag:_WS}], a:0, e:'Perfectly round and no corners = circle.', d:'m', h:'Which shape is perfectly round?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'This shape has 3 corners and 3 sides. What is it?', o:[{val:'Rectangle',tag:_WS},{val:'Circle',tag:_WS},{val:'Triangle'},{val:'Square',tag:_WS}], a:2, e:'3 corners and 3 sides = triangle.', d:'m', h:'3 of each — which shape?', sk:'identify_2d_shapes', i:_iWS('triangle')},
  {t:'This shape has 4 sides and 4 square corners. Two sides are longer. What is it?', o:[{val:'Rhombus',tag:_SRh},{val:'Triangle',tag:_WS},{val:'Rectangle'},{val:'Square',tag:_SR}], a:2, e:'4 sides, square corners, two sides longer = rectangle.', d:'m', h:'Square corners and unequal sides.', sk:'identify_2d_shapes', i:_iSR()},
  {t:'This shape has 4 equal sides. Its corners are square. What is it?', o:[{val:'Rhombus',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS},{val:'Square'}], a:3, e:'4 equal sides + square corners = square.', d:'m', h:'Equal sides AND square corners — which shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 6 sides and 6 corners. What is it called?', o:[{val:'Triangle',tag:_WS},{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Rectangle',tag:_WS}], a:2, e:'6 sides = hexagon. A pentagon has 5 sides.', d:'m', h:'6 sides — hexagon or pentagon?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'This shape has 4 sides. All 4 sides are the same length. The corners lean. What is it?', o:[{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Rhombus'},{val:'Triangle',tag:_WS}], a:2, e:'4 equal sides + leaning corners = rhombus.', d:'m', h:'Not square corners — which shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 4 sides and 4 corners. Its sides are not all the same length. What is it?', o:[{val:'Square',tag:_SR},{val:'Triangle',tag:_WS},{val:'Rectangle'},{val:'Circle',tag:_WS}], a:2, e:'4 sides, not all equal = rectangle.', d:'m', h:'Unequal sides — which 4-sided shape?', sk:'identify_2d_shapes', i:_iSR()},

  // Hard (7)
  {t:'A shape has 4 equal sides. How do you tell if it is a square or a rhombus?', o:[{val:'Count the sides',tag:_WS},{val:'Look at the corners'},{val:'Look at the color',tag:_NSC},{val:'Count the corners',tag:_WS}], a:1, e:'Square: corners do not lean. Rhombus: corners lean. The corners tell you which one it is.', d:'h', h:'Both have 4 equal sides — what is different about them?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 4 sides and 4 corners. All sides are equal. The corners lean. What is it?', o:[{val:'Rectangle',tag:_SR},{val:'Square',tag:_SRh},{val:'Hexagon',tag:_WS},{val:'Rhombus'}], a:3, e:'Equal sides + leaning corners = rhombus.', d:'h', h:'Equal sides, but leaning corners — which shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 0 sides and 0 corners. It is perfectly round. What is it?', o:[{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS},{val:'Circle'}], a:3, e:'0 sides, 0 corners, perfectly round = circle.', d:'h', h:'Which shape has 0 sides?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'A shape has 4 equal sides. Its corners do not lean. What is it?', o:[{val:'Rhombus',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Square'},{val:'Triangle',tag:_WS}], a:2, e:'4 equal sides + corners that do not lean = square.', d:'h', h:'Not leaning corners — which shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A shape has more than 4 sides. What could it be?', o:[{val:'Square',tag:_WS},{val:'Rectangle',tag:_WS},{val:'Triangle',tag:_WS},{val:'Hexagon'}], a:3, e:'A hexagon has 6 sides — more than any of the other answer choices.', d:'h', h:'Which shape here has more than 4 sides?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which shape has the same number of sides and corners, and that number is 6?', o:[{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Hexagon'},{val:'Rectangle',tag:_WS}], a:2, e:'A hexagon has 6 sides and 6 corners.', d:'h', h:'Which shape has 6 of each?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'This shape has 4 sides. The sides are all the same length. The corners are not square. Which name fits?', o:[{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS},{val:'Rhombus'}], a:3, e:'4 equal sides + leaning corners = rhombus.', d:'h', h:'Equal sides but not square corners — which shape?', sk:'identify_2d_shapes', i:_iSRh()}

];

// ── C7: Discrimination (12M + 8H = 20, with SVG) ────────────────────────────

var _l51C7 = [

  // Medium (12)
  {t:'What makes this shape different from a rhombus?', s:_svgSquare(), o:[{val:'It has more sides',tag:_WS},{val:'Its corners are square'},{val:'It has fewer sides',tag:_WS},{val:'It has a different color',tag:_NSC}], a:1, e:'A square has square corners (not leaning). A rhombus has leaning corners.', d:'m', h:'Look at the corners — are they square or leaning?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What makes this shape different from a square?', s:_svgRhombus(0), o:[{val:'It has fewer sides',tag:_WS},{val:'It has more corners',tag:_WS},{val:'Its corners lean'},{val:'It is bigger',tag:_NSC}], a:2, e:'A rhombus has leaning corners. A square has square corners.', d:'m', h:'What is different about the corners?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'What makes this shape different from a square?', s:_svgRect(), o:[{val:'It has fewer corners',tag:_WS},{val:'Its sides are not all the same length'},{val:'It has more sides',tag:_WS},{val:'It has no corners',tag:_WS}], a:1, e:'A rectangle has sides that are not all equal. A square has 4 equal sides.', d:'m', h:'Compare the side lengths.', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Is this shape a square or a rectangle? How do you know?', s:_svgSquare(), o:[{val:'Rectangle — sides are not all equal',tag:_SR},{val:'Square — all 4 sides are equal'},{val:'Rectangle — it has 4 corners',tag:_WS},{val:'Square — it has 4 sides',tag:_WS}], a:1, e:'All 4 sides are equal, so this is a square.', d:'m', h:'Are all 4 sides the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Is this shape a square or a rectangle? How do you know?', s:_svgRect(), o:[{val:'Square — all 4 sides are equal',tag:_SR},{val:'Rectangle — two sides are longer'},{val:'Square — it has 4 corners',tag:_WS},{val:'Rectangle — it has no corners',tag:_WS}], a:1, e:'Two sides are longer and two are shorter, so this is a rectangle.', d:'m', h:'Are the sides all the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'Is this a square or a rhombus? How do you know?', s:_svgRhombus(15), o:[{val:'Square — corners are square',tag:_SRh},{val:'Square — it has 4 equal sides',tag:_SRh},{val:'Rhombus — corners lean'},{val:'Rectangle — two sides are longer',tag:_SR}], a:2, e:'The corners lean, so this is a rhombus.', d:'m', h:'Look at the corners — do they lean?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 4 equal sides. Is it a square or a rhombus?', s:_svgSquare(), o:[{val:'Rhombus — corners lean',tag:_SRh},{val:'Rhombus — sides are not equal',tag:_WS},{val:'Square — corners are square'},{val:'Rectangle — sides are not equal',tag:_SR}], a:2, e:'The corners are square (not leaning), so this is a square.', d:'m', h:'Look at the corners — square or leaning?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'This shape has 4 equal sides. Is it a square or a rhombus?', s:_svgRhombus(30), o:[{val:'Square — corners are square',tag:_SRh},{val:'Rhombus — corners lean'},{val:'Rectangle — sides not equal',tag:_SR},{val:'Square — it has more sides',tag:_WS}], a:1, e:'The corners lean, so this is a rhombus — not a square.', d:'m', h:'The corners lean — which shape has leaning corners?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student said this is a square. What is wrong?', s:_svgRect(), o:[{val:'It has too many corners',tag:_WS},{val:'Its sides are not all the same length'},{val:'It has no corners',tag:_WS},{val:'It only has 3 sides',tag:_WS}], a:1, e:'A square has 4 equal sides. This shape has two longer sides — so it is a rectangle.', d:'m', h:'Check the side lengths.', sk:'identify_2d_shapes', i:_iSR()},
  {t:'A student said this is a rectangle. What is wrong?', s:_svgSquare(), o:[{val:'It has more sides than a rectangle',tag:_WS},{val:'All 4 sides are equal — so it is a square'},{val:'It has no corners',tag:_WS},{val:'It only has 3 sides',tag:_WS}], a:1, e:'When all 4 sides are equal, it is a square — not just a rectangle.', d:'m', h:'Are all the sides equal?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'A student said this is a square. What is wrong?', s:_svgRhombus(0), o:[{val:'It has too many sides',tag:_WS},{val:'Its corners lean — so it is a rhombus'},{val:'It has no corners',tag:_WS},{val:'It only has 3 sides',tag:_WS}], a:1, e:'The corners lean, which means this is a rhombus — not a square.', d:'m', h:'What do the corners look like?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which TWO words describe this shape? Choose the best answer.', s:_svgRect(), o:[{val:'4 sides AND all sides equal',tag:_SR},{val:'4 sides AND 2 sides longer'},{val:'3 sides AND 3 corners',tag:_WS},{val:'0 sides AND 0 corners',tag:_WS}], a:1, e:'A rectangle has 4 sides and the two longer sides are different from the two shorter sides.', d:'m', h:'Count the sides. Are they all the same?', sk:'identify_2d_shapes', i:_iSR()},

  // Hard (8)
  {t:'Which is the BEST name for this shape?', s:_svgSquare(), o:[{val:'Rectangle — it has 4 sides',tag:_SR},{val:'Rhombus — it has 4 equal sides',tag:_SRh},{val:'Square — it has 4 equal sides AND square corners'},{val:'Triangle — it has 3 sides',tag:_WS}], a:2, e:'Square is the most precise name: 4 equal sides AND square corners.', d:'h', h:'Which name tells us the most about this shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which is the BEST name for this shape?', s:_svgRhombus(45), o:[{val:'Square — 4 equal sides',tag:_SRh},{val:'Rectangle — 4 sides',tag:_SR},{val:'Rhombus — 4 equal sides with leaning corners'},{val:'Triangle — 3 sides',tag:_WS}], a:2, e:'Rhombus: 4 equal sides, but leaning corners — not square.', d:'h', h:'The corners lean — which name fits?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which is the BEST name for this shape?', s:_svgRect(), o:[{val:'Square — 4 sides',tag:_SR},{val:'Rectangle — 4 sides, 2 longer and 2 shorter'},{val:'Rhombus — equal sides',tag:_WS},{val:'Triangle — 3 sides',tag:_WS}], a:1, e:'Rectangle: 4 sides, 2 longer, 2 shorter.', d:'h', h:'The best name tells you the most about the shape.', sk:'identify_2d_shapes', i:_iSR()},
  {t:'A student must choose between square, rectangle, and rhombus. Which is correct?', s:_svgSquare(), o:[{val:'Rectangle',tag:_SR},{val:'Square'},{val:'Rhombus',tag:_SRh},{val:'All three are correct',tag:_WS}], a:1, e:'Square: 4 equal sides with square corners. Rectangle has unequal sides. Rhombus has leaning corners.', d:'h', h:'Check side lengths AND corner angles.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student must choose between square, rectangle, and rhombus. Which is correct?', s:_svgRhombus(60), o:[{val:'Rhombus'},{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS}], a:0, e:'4 equal sides + leaning corners = rhombus.', d:'h', h:'Leaning corners — which shape is that?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student must choose between square, rectangle, and rhombus. Which is correct?', s:_svgRect(), o:[{val:'Square',tag:_SR},{val:'Rhombus',tag:_WS},{val:'Rectangle'},{val:'Triangle',tag:_WS}], a:2, e:'Two sides are longer than the other two = rectangle.', d:'h', h:'Check the side lengths.', sk:'identify_2d_shapes', i:_iSR()},
  {t:'How is a rhombus different from BOTH a square AND a rectangle?', s:_svgRhombus(0), o:[{val:'It has fewer sides',tag:_WS},{val:'Its corners lean'},{val:'It has no corners',tag:_WS},{val:'It has 6 sides',tag:_WS}], a:1, e:'A rhombus has leaning corners. Both squares and rectangles have square corners.', d:'h', h:'What do squares and rectangles have in common that a rhombus does not?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'How is a square different from BOTH a rectangle AND a rhombus?', s:_svgSquare(), o:[{val:'It has 4 sides',tag:_WS},{val:'It has equal sides AND square corners'},{val:'It has leaning corners',tag:_SRh},{val:'It has 6 corners',tag:_WS}], a:1, e:'A square has 4 equal sides (like a rhombus) AND square corners (unlike a rhombus).', d:'h', h:'What is special about a square compared to the other two?', sk:'identify_2d_shapes', i:_iSRh()}

];

// ── C8: Error repair (5M + 10H = 15, with SVG) ──────────────────────────────

var _l51C8 = [

  // Medium (5)
  {t:'A student said this shape is an oval. What is it really?', s:_svgCircle(), o:[{val:'Oval',tag:_CO},{val:'Circle'},{val:'Square',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'This shape is a circle — it is perfectly round, not stretched like an oval.', d:'m', h:'Is this shape stretched out, or perfectly round?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'A student said this shape has 4 sides. How many sides does it really have?', s:_svgTriangle(30), o:[{val:'4',tag:_SNC},{val:'3'},{val:'6',tag:_SNC},{val:'2',tag:_SNC}], a:1, e:'Count: 1, 2, 3. This triangle has 3 sides.', d:'m', h:'Count the sides carefully.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'A student said this shape is a square. What is it really?', s:_svgRect(), o:[{val:'Square',tag:_SR},{val:'Rectangle'},{val:'Rhombus',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'A square has 4 equal sides. This shape has two longer sides, so it is a rectangle.', d:'m', h:'Are all the sides the same length?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'A student said this shape is a pentagon. What is it really?', s:_svgHex(0), o:[{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Circle',tag:_WS},{val:'Rectangle',tag:_WS}], a:1, e:'Count the sides: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'m', h:'Count the sides.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'A student said this shape is a rectangle. What is it really?', s:_svgSquare(), o:[{val:'Rectangle',tag:_SR},{val:'Square'},{val:'Triangle',tag:_WS},{val:'Rhombus',tag:_SRh}], a:1, e:'All 4 sides are equal — that makes it a square, not just a rectangle.', d:'m', h:'Are all the sides the same length?', sk:'identify_2d_shapes', i:_iSR()},

  // Hard (10)
  {t:'A student said this shape is a square. What is it really?', s:_svgRhombus(0), o:[{val:'Square',tag:_SRh},{val:'Rhombus'},{val:'Rectangle',tag:_SR},{val:'Triangle',tag:_WS}], a:1, e:'The corners lean — that makes it a rhombus. A square has square corners.', d:'h', h:'Look at the corners — are they square or leaning?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student said this shape is a pentagon. What is it really?', s:_svgHex(15), o:[{val:'Pentagon',tag:_HP},{val:'Hexagon'},{val:'Rectangle',tag:_WS},{val:'Triangle',tag:_WS}], a:1, e:'Count carefully: 1, 2, 3, 4, 5, 6. Six sides = hexagon.', d:'h', h:'Count each side carefully.', sk:'identify_2d_shapes', i:_iHP()},
  {t:'A student said this shape has 4 sides. How many sides does it really have?', s:_svgTriangle(150), o:[{val:'4',tag:_SNC},{val:'6',tag:_SNC},{val:'3'},{val:'0',tag:_SNC}], a:2, e:'Even when rotated, a triangle always has exactly 3 sides.', d:'h', h:'Count each side of this rotated shape.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'A student said this is a square because it has 4 equal sides. What is wrong?', s:_svgRhombus(60), o:[{val:'It does not have 4 equal sides',tag:_WS},{val:'Squares have no sides',tag:_WS},{val:'The corners lean — it is a rhombus'},{val:'It has too many corners',tag:_WS}], a:2, e:'Having 4 equal sides is true for both a square and a rhombus. The corners lean — so it is a rhombus.', d:'h', h:'Both shapes have 4 equal sides — what is different?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student said this shape has 4 sides. How many sides does it really have?', s:_svgCircle(), o:[{val:'4',tag:_SNC},{val:'3',tag:_SNC},{val:'1',tag:_SNC},{val:'0'}], a:3, e:'A circle has 0 sides — it is perfectly round.', d:'h', h:'Does a circle have any straight sides?', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'A student said this shape has 5 sides. How many sides does it really have?', s:_svgHex(25), o:[{val:'5',tag:_HP},{val:'4',tag:_SNC},{val:'3',tag:_SNC},{val:'6'}], a:3, e:'Count again: 1, 2, 3, 4, 5, 6. Six sides.', d:'h', h:'Count again, touching each side.', sk:'identify_2d_shapes', i:_iSNC()},
  {t:'A student called this shape a rhombus. What is wrong?', s:_svgRect(), o:[{val:'A rectangle has 3 sides, not 4',tag:_WS},{val:'The sides are not all equal AND the corners are square'},{val:'A rectangle has no corners',tag:_WS},{val:'A rhombus and rectangle are the same',tag:_WS}], a:1, e:'A rhombus has 4 equal sides with leaning corners. A rectangle has unequal sides and square corners.', d:'h', h:'What is different about a rhombus and a rectangle?', sk:'identify_2d_shapes', i:_iSR()},
  {t:'A student said this shape is a rhombus. What is wrong?', s:_svgSquare(), o:[{val:'A square has 3 sides',tag:_WS},{val:'A square has no corners',tag:_WS},{val:'This shape has square corners — it is a square, not a rhombus'},{val:'A rhombus has 6 sides',tag:_WS}], a:2, e:'Square corners (not leaning) = square. Leaning corners = rhombus.', d:'h', h:'Look at the corners.', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'A student said this shape has 0 corners. How many corners does it really have?', s:_svgTriangle(90), o:[{val:'0',tag:_CNC},{val:'4',tag:_CNC},{val:'3'},{val:'6',tag:_CNC}], a:2, e:'A triangle has 3 corners — count the pointy places: 1, 2, 3.', d:'h', h:'Count each pointy place.', sk:'identify_2d_shapes', i:_iCNC()},
  {t:'A student said this shape is a hexagon. What is it really?', s:_svgRhombus(45), o:[{val:'Hexagon',tag:_WS},{val:'Rectangle',tag:_SR},{val:'Rhombus'},{val:'Square',tag:_SRh}], a:2, e:'Count the sides: 1, 2, 3, 4. Four sides, not six. And the corners lean — it is a rhombus.', d:'h', h:'Count the sides. Then look at the corners.', sk:'identify_2d_shapes', i:_iSRh()}

];

// ── C9: Multi-attribute (5H, no SVG) ─────────────────────────────────────────

var _l51C9 = [
  {t:'Which shape has BOTH 4 equal sides AND corners that lean?', o:[{val:'Square',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Rhombus'},{val:'Triangle',tag:_WS}], a:2, e:'A rhombus has 4 equal sides and leaning corners.', d:'h', h:'Which shape has leaning corners?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which shape has NO sides AND no corners?', o:[{val:'Circle'},{val:'Square',tag:_WS},{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS}], a:0, e:'A circle has 0 sides and 0 corners — it is perfectly round.', d:'h', h:'Which shape has 0 sides?', sk:'identify_2d_shapes', i:_iCO()},
  {t:'Which shape has 6 sides AND 6 corners?', o:[{val:'Triangle',tag:_WS},{val:'Rectangle',tag:_WS},{val:'Square',tag:_WS},{val:'Hexagon'}], a:3, e:'A hexagon has 6 sides and 6 corners.', d:'h', h:'Which shape has 6 of each?', sk:'identify_2d_shapes', i:_iHP()},
  {t:'Which shape has 4 equal sides AND 4 square corners?', o:[{val:'Rhombus',tag:_SRh},{val:'Rectangle',tag:_SR},{val:'Square'},{val:'Triangle',tag:_WS}], a:2, e:'A square has 4 equal sides and 4 square corners. A rhombus has equal sides but leaning corners.', d:'h', h:'Square corners AND equal sides — which shape?', sk:'identify_2d_shapes', i:_iSRh()},
  {t:'Which shape has 3 sides AND 3 corners?', o:[{val:'Circle',tag:_WS},{val:'Triangle'},{val:'Rectangle',tag:_WS},{val:'Hexagon',tag:_WS}], a:1, e:'A triangle has exactly 3 sides and 3 corners.', d:'h', h:'Which shape has 3 of each?', sk:'identify_2d_shapes', i:_iWS('triangle')}
];

// ── L5.1 bank assembly ───────────────────────────────────────────────────────

var _l51Bank = [].concat(_l51C1, _l51C2, _l51C3, _l51C4, _l51C5, _l51C6, _l51C7, _l51C8, _l51C9);

// ── L5.1 worked examples ─────────────────────────────────────────────────────

var _l51Examples = [
  {
    id: 'g1-u5-l1-ex-1',
    title: 'Example 1: Naming a shape — circle',
    prompt: 'Look at this shape. What is its name?',
    visual: {type: 'shapes', config: {items: ['circle']}},
    steps: [
      'Look at the edge. Does it have any straight parts?',
      'The edge curves all the way around — no straight parts.',
      'A shape with no straight sides and no corners is a circle.',
      'A circle is perfectly round.'
    ],
    finalAnswer: 'The shape is a circle.'
  },
  {
    id: 'g1-u5-l1-ex-2',
    title: 'Example 2: Naming a shape — triangle',
    prompt: 'Look at this shape. Count the sides. What is its name?',
    visual: {type: 'shapes', config: {items: ['triangle']}},
    steps: [
      'Touch each straight side and count: 1, 2, 3.',
      'Three sides — that tells us the name.',
      'A shape with 3 sides also has 3 corners.',
      '3 sides + 3 corners = triangle.'
    ],
    finalAnswer: 'The shape is a triangle.'
  },
  {
    id: 'g1-u5-l1-ex-3',
    title: 'Example 3: Square or rectangle?',
    prompt: 'How do you tell the difference between a square and a rectangle?',
    visual: {type: 'shapes', config: {items: ['square', 'rectangle']}},
    steps: [
      'Both shapes have 4 sides and 4 corners.',
      'Look at the side lengths: are they all equal, or are some longer?',
      'Square: all 4 sides are the same length.',
      'Rectangle: two sides are longer and two are shorter.'
    ],
    finalAnswer: 'Check the side lengths: equal sides = square; unequal sides = rectangle.'
  },
  {
    id: 'g1-u5-l1-ex-4',
    title: 'Example 4: Square or rhombus?',
    prompt: 'Both a square and a rhombus have 4 equal sides. How do you tell them apart?',
    visual: {type: 'shapes', config: {items: ['square']}},
    steps: [
      'A square and a rhombus both have 4 equal sides.',
      'Look at the corners: do they make a square angle or lean to the side?',
      'Square corners (like the corner of a book) = square.',
      'Leaning corners (tilted to the side) = rhombus.'
    ],
    finalAnswer: 'Check the corners: square corners = square; leaning corners = rhombus.'
  },
  {
    id: 'g1-u5-l1-ex-5',
    title: 'Example 5: How many sides does a hexagon have?',
    prompt: 'Count the sides of a hexagon.',
    steps: [
      'Start at any corner of the hexagon.',
      'Touch each side and count: 1, 2, 3, 4, 5, 6.',
      'Go all the way around until you reach the starting corner.',
      'A hexagon always has 6 sides and 6 corners.'
    ],
    finalAnswer: 'A hexagon has 6 sides and 6 corners.'
  },
  {
    id: 'g1-u5-l1-ex-6',
    title: 'Example 6: Counting corners',
    prompt: 'How many corners does a triangle have?',
    visual: {type: 'shapes', config: {items: ['triangle']}},
    steps: [
      'A corner is where two sides meet.',
      'Touch each pointy place on the triangle and count: 1, 2, 3.',
      'The number of corners always equals the number of sides.',
      'A triangle has 3 sides, so it also has 3 corners.'
    ],
    finalAnswer: 'A triangle has 3 corners.'
  }
];

// ── L5.1 key ideas ───────────────────────────────────────────────────────────

var _l51KeyIdeas = [
  'A circle has 0 sides and 0 corners. It is perfectly round.',
  'A triangle has 3 straight sides and 3 corners.',
  'A rectangle has 4 sides and 4 corners. Two sides are longer than the other two.',
  'A square has 4 equal sides and 4 square corners.',
  'A rhombus has 4 equal sides, but its corners lean — they are not square corners.',
  'A hexagon has 6 sides and 6 corners.'
];

// ══════════════════════════════════════════════════════════════════════════════
//  Unit 5 Spec
// ══════════════════════════════════════════════════════════════════════════════

export const G1_U5_SPEC = {
  unitId: 'g1u5',
  title: 'Geometry',
  teks: ['1.6A', '1.6B', '1.6C', '1.6D', '1.6E', '1.6F', '1.6G', '1.6H'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.1 — 2D Shapes — Identify and Describe
    //  TEKS 1.6D | 170 questions (55E / 65M / 50H)
    //  9 categories: C1 basic naming, C2 rhombus, C3 hexagon,
    //    C4 sides, C5 corners, C6 attribute→shape,
    //    C7 discrimination, C8 error repair, C9 multi-attribute
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l1',
      title: '2D Shapes — Identify and Describe',
      teks: ['1.6D'],
      skill: 'identify_2d_shapes',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l51KeyIdeas,
      workedExamples: _l51Examples,
      quizBank: _l51Bank,
      diagnostics: {
        commonDistractors: [_WS, _CO, _SR, _SRh, _HP, _SNC, _CNC, _NSC],
        errorTags: [_WS, _CO, _SR, _SRh, _HP, _SNC, _CNC, _NSC],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.2 — 3D Shapes — Identify and Describe (scaffold, 0 questions)
    //  TEKS 1.6E
    //  Solids: sphere, cone, cylinder, cube, rectangular prism, triangular prism
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l2',
      title: '3D Shapes — Identify and Describe',
      teks: ['1.6E'],
      skill: 'identify_3d_solids',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.3 — Shape Attributes and Sorting (scaffold, 0 questions)
    //  TEKS 1.6A, 1.6B
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l3',
      title: 'Shape Attributes and Sorting',
      teks: ['1.6A', '1.6B'],
      skill: 'shape_attributes_and_sorting',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.4 — Compose and Recognize 2D Shapes (scaffold, 0 questions)
    //  TEKS 1.6F
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l4',
      title: 'Compose and Recognize 2D Shapes',
      teks: ['1.6F'],
      skill: 'compose_2d_shapes',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.5 — Equal Parts — Halves and Fourths (scaffold, 0 questions)
    //  TEKS 1.6G, 1.6H
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l5',
      title: 'Equal Parts — Halves and Fourths',
      teks: ['1.6G', '1.6H'],
      skill: 'equal_parts_halves_fourths',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    }

  ]
};

export default G1_U5_SPEC;
