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
 *    L5.2  3D Shapes — Identify and Describe     ← 132 questions (30E/66M/36H)
 *    L5.3  Shape Attributes and Sorting          ← 160 questions (50E/65M/45H)
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
  // 140x140 canvas, center (70,70). Diagonal ratio 2:1 (ry=60, rx=30) — clearly diamond-shaped
  // with obviously acute top/bottom corners (~53°) and obtuse left/right corners (~127°),
  // visually distinct from square at ALL rotation angles including 45°.
  var d = deg || 0, rad = d * Math.PI / 180, cx = 70, cy = 70, rx = 30, ry = 60;
  var base = [[0, -ry], [rx, 0], [0, ry], [-rx, 0]];
  var pts = base.map(function(p) {
    var x = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
    var y = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
    return (cx + x).toFixed(1) + ',' + (cy + y).toFixed(1);
  });
  return '<svg width="140" height="140" viewBox="0 0 140 140">' +
    '<polygon points="' + pts.join(' ') + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
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

// ── Shape color palette ───────────────────────────────────────────────────────
// 6 kid-friendly colors; sequentially assigned across the question pool.
// _rclr() replaces the three purple tokens used in question SVGs and teaching visuals.
// _colorizeQ() walks a question array and applies one palette entry per question.
// Color choice is deterministic (index % 6) so a question always gets the same color.

var _SC = [
  {f:'#64B5F6', s:'#1565C0'},  // blue
  {f:'#81C784', s:'#2E7D32'},  // green
  {f:'#FFB74D', s:'#E65100'},  // orange
  {f:'#CE93D8', s:'#7B1FA2'},  // purple (existing default)
  {f:'#EF9A9A', s:'#C62828'},  // coral
  {f:'#4DB6AC', s:'#00695C'},  // teal
];

function _rclr(str, c) {
  return str
    .replace(/#CE93D8/g, c.f)
    .replace(/#7B1FA2/g, c.s)
    .replace(/#9C27B0/g, c.s);
}

function _colorizeQ(qs) {
  qs.forEach(function(q, idx) {
    var c = _SC[idx % _SC.length];
    if (q.s) q.s = _rclr(q.s, c);
    if (q.i && q.i.teachingVisualRaw) q.i.teachingVisualRaw = _rclr(q.i.teachingVisualRaw, c);
  });
  return qs;
}

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
    '<polygon points="188,22 216,62 188,102 160,62" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
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

var _l51Bank = _colorizeQ([].concat(_l51C1, _l51C2, _l51C3, _l51C4, _l51C5, _l51C6, _l51C7, _l51C8, _l51C9));

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
//  Lesson 5.2 — 3D Shapes — Identify and Describe
//  TEKS 1.6E | 132 questions (30E / 66M / 36H)
//  Solids: sphere, cone, cylinder, cube, rectangular prism, triangular prism
//  Scope: identification + real-world connections ONLY — no face/edge/vertex counting
// ══════════════════════════════════════════════════════════════════════════════

// ── 3D SVG helpers ────────────────────────────────────────────────────────────
// Same color scheme as L5.1. fill-opacity variation gives isometric lighting.
// Colorized at bank-assembly time via _colorizeQ.

function _svg3dSphere() {
  return '<svg width="120" height="120" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<ellipse cx="44" cy="39" rx="14" ry="9" fill="white" opacity="0.28"/>' +
    '</svg>';
}

function _svg3dCone() {
  return '<svg width="120" height="130" viewBox="0 0 120 130">' +
    '<polygon points="60,8 8,116 112,116" fill="#CE93D8" stroke="none"/>' +
    '<ellipse cx="60" cy="116" rx="52" ry="16" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="60" y1="8" x2="8" y2="108" stroke="#7B1FA2" stroke-width="5" stroke-linecap="round"/>' +
    '<line x1="60" y1="8" x2="112" y2="108" stroke="#7B1FA2" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="60" cy="8" r="5" fill="#7B1FA2"/>' +
    '</svg>';
}

function _svg3dCylinder() {
  return '<svg width="120" height="130" viewBox="0 0 120 130">' +
    '<rect x="10" y="26" width="100" height="78" fill="#CE93D8" stroke="none"/>' +
    '<ellipse cx="60" cy="104" rx="50" ry="15" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="10" y1="26" x2="10" y2="104" stroke="#7B1FA2" stroke-width="5"/>' +
    '<line x1="110" y1="26" x2="110" y2="104" stroke="#7B1FA2" stroke-width="5"/>' +
    '<ellipse cx="60" cy="26" rx="50" ry="15" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/>' +
    '</svg>';
}

function _svg3dCube() {
  // Isometric cube: top face (lightest) → right face → front face (full)
  // Front (16,44)-(64,44)-(64,92)-(16,92); right (64,44)-(88,32)-(88,80)-(64,92); top (16,44)-(64,44)-(88,32)-(40,32)
  return '<svg width="100" height="104" viewBox="0 0 100 104">' +
    '<polygon points="16,44 64,44 88,32 40,32" fill="#CE93D8" fill-opacity="0.55" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="64,44 88,32 88,80 64,92" fill="#CE93D8" fill-opacity="0.78" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="16,44 64,44 64,92 16,92" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

function _svg3dRectPrism() {
  // Wider box: front 80×52, depth offset (20,-10)
  // Front (10,40)-(90,40)-(90,92)-(10,92); right (90,40)-(110,30)-(110,82)-(90,92); top (10,40)-(90,40)-(110,30)-(30,30)
  return '<svg width="118" height="102" viewBox="0 0 118 102">' +
    '<polygon points="10,40 90,40 110,30 30,30" fill="#CE93D8" fill-opacity="0.55" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="90,40 110,30 110,82 90,92" fill="#CE93D8" fill-opacity="0.78" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="10,40 90,40 90,92 10,92" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

function _svg3dTriPrism() {
  // Front triangle A=(18,97) B=(82,97) C=(50,32); depth offset (26,-13)
  // A'=(44,84) B'=(108,84) C'=(76,19)
  // Left face A,C,C',A'; right face B,C,C',B'; front triangle A,B,C
  return '<svg width="120" height="110" viewBox="0 0 120 110">' +
    '<polygon points="18,97 50,32 76,19 44,84" fill="#CE93D8" fill-opacity="0.55" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="82,97 50,32 76,19 108,84" fill="#CE93D8" fill-opacity="0.78" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="18,97 82,97 50,32" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

// ── L5.2 error tag shorthands ─────────────────────────────────────────────────
var _3WS = 'err_wrong_solid_name';
var _3DC = 'err_confuse_2d_3d';
var _3KP = 'err_confuse_cube_rect_prism';
var _3CC = 'err_confuse_cone_cylinder';
var _3TS = 'err_confuse_tri_prism_cone';
var _3SR = 'err_confuse_sphere_cylinder';

// ── L5.2 teaching visual helpers ─────────────────────────────────────────────

function _tv3dSphereVsCircle() {
  return _tvWrap(
    '<svg width="240" height="110" viewBox="0 0 240 110" style="display:inline-block">' +
    '<text x="55" y="14" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Sphere</text>' +
    '<circle cx="55" cy="64" r="44" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<ellipse cx="42" cy="46" rx="11" ry="7" fill="white" opacity="0.5"/>' +
    '<text x="55" y="107" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">3D solid</text>' +
    '<line x1="118" y1="8" x2="118" y2="102" stroke="#ddd" stroke-width="1"/>' +
    '<text x="182" y="14" font-size="12" font-weight="700" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">Circle</text>' +
    '<circle cx="182" cy="64" r="36" fill="#888" opacity="0.13" stroke="#999" stroke-width="3"/>' +
    '<text x="182" y="107" font-size="10" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">flat 2D shape</text>' +
    '</svg>',
    'Sphere = 3D round solid     Circle = flat 2D shape'
  );
}

function _tv3dConeVsCylinder() {
  return _tvWrap(
    '<svg width="248" height="110" viewBox="0 0 248 110" style="display:inline-block">' +
    '<text x="52" y="12" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Cone</text>' +
    '<polygon points="52,20 18,94 86,94" fill="' + _TVP + '" opacity="0.2" stroke="none"/>' +
    '<ellipse cx="52" cy="94" rx="34" ry="10" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="52" y1="20" x2="18" y2="88" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="52" y1="20" x2="86" y2="88" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="52" y="108" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">point at top</text>' +
    '<line x1="122" y1="8" x2="122" y2="104" stroke="#ddd" stroke-width="1"/>' +
    '<text x="186" y="12" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Cylinder</text>' +
    '<rect x="162" y="28" width="48" height="58" fill="' + _TVP + '" opacity="0.2" stroke="none"/>' +
    '<ellipse cx="186" cy="86" rx="24" ry="8" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="162" y1="28" x2="162" y2="86" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="210" y1="28" x2="210" y2="86" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<ellipse cx="186" cy="28" rx="24" ry="8" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="186" y="108" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">round at both ends</text>' +
    '</svg>',
    'Cone = pointed top     Cylinder = round at both ends'
  );
}

function _tv3dCubeVsRectPrism() {
  return _tvWrap(
    '<svg width="250" height="108" viewBox="0 0 250 108" style="display:inline-block">' +
    '<text x="48" y="12" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Cube</text>' +
    '<polygon points="8,44 44,44 58,34 22,34" fill="' + _TVP + '" opacity="0.13" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<polygon points="44,44 58,34 58,72 44,82" fill="' + _TVP + '" opacity="0.22" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<polygon points="8,44 44,44 44,82 8,82" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="48" y="100" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">all faces equal squares</text>' +
    '<line x1="118" y1="8" x2="118" y2="102" stroke="#ddd" stroke-width="1"/>' +
    '<text x="192" y="12" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Rect. Prism</text>' +
    '<polygon points="138,46 208,46 220,36 150,36" fill="' + _TVP + '" opacity="0.13" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<polygon points="208,46 220,36 220,78 208,88" fill="' + _TVP + '" opacity="0.22" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<polygon points="138,46 208,46 208,88 138,88" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="182" y="100" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">rectangle faces</text>' +
    '</svg>',
    'Cube = all equal square faces     Rect. prism = rectangle faces'
  );
}

function _tv3dTriPrismVsCone() {
  return _tvWrap(
    '<svg width="248" height="110" viewBox="0 0 248 110" style="display:inline-block">' +
    '<text x="52" y="12" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Cone</text>' +
    '<polygon points="52,20 18,94 86,94" fill="' + _TVP + '" opacity="0.2" stroke="none"/>' +
    '<line x1="52" y1="20" x2="18" y2="88" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="52" y1="20" x2="86" y2="88" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<ellipse cx="52" cy="94" rx="34" ry="10" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="52" y="108" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">one point</text>' +
    '<line x1="122" y1="8" x2="122" y2="104" stroke="#ddd" stroke-width="1"/>' +
    '<text x="186" y="12" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Tri. Prism</text>' +
    '<polygon points="150,94 220,94 185,28" fill="' + _TVP + '" opacity="0.2" stroke="none"/>' +
    '<line x1="150" y1="94" x2="220" y2="94" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="150" y1="94" x2="185" y2="28" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="220" y1="94" x2="185" y2="28" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="186" y="108" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">flat triangle ends</text>' +
    '</svg>',
    'Cone = one point     Triangular prism = flat triangle ends'
  );
}

function _tv3dSphereVsCylinder() {
  return _tvWrap(
    '<svg width="248" height="110" viewBox="0 0 248 110" style="display:inline-block">' +
    '<text x="52" y="12" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Sphere</text>' +
    '<circle cx="52" cy="62" r="42" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<ellipse cx="40" cy="46" rx="12" ry="8" fill="white" opacity="0.4"/>' +
    '<text x="52" y="108" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">round everywhere</text>' +
    '<line x1="122" y1="8" x2="122" y2="104" stroke="#ddd" stroke-width="1"/>' +
    '<text x="186" y="12" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Cylinder</text>' +
    '<rect x="162" y="28" width="48" height="58" fill="' + _TVP + '" opacity="0.2" stroke="none"/>' +
    '<ellipse cx="186" cy="86" rx="24" ry="8" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="162" y1="28" x2="162" y2="86" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<line x1="210" y1="28" x2="210" y2="86" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<ellipse cx="186" cy="28" rx="24" ry="8" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="186" y="108" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">flat ends you can feel</text>' +
    '</svg>',
    'Sphere = round like a ball     Cylinder = flat ends you can feel'
  );
}

// ── L5.2 intervention factories ───────────────────────────────────────────────

function _i3WS(solid) {
  var steps = {
    sphere:       ['A sphere is perfectly round, like a ball.', 'It has no flat faces — it curves everywhere.', 'Round in every direction = sphere.'],
    cone:         ['A cone has a point at the top and a round flat base.', 'Trace the side: it goes from the base up to the tip.', 'One point + one round base = cone.'],
    cylinder:     ['A cylinder looks like a soup can.', 'It has two round flat ends and a curved side.', 'Round at BOTH ends = cylinder.'],
    cube:         ['A cube has 6 faces that are all equal squares.', 'All the faces are the same size — like a dice.', '6 equal square faces = cube.'],
    'rect-prism': ['A rectangular prism has 6 faces.', 'The faces are rectangles — some are longer than others.', 'Box shape with rectangle faces = rectangular prism.'],
    'tri-prism':  ['A triangular prism has triangle faces at both ends.', 'The sides connecting the triangles are rectangles.', 'Triangle ends + rectangle sides = triangular prism.']
  };
  var tvMap = {
    sphere:       _tv3dSphereVsCircle(),
    cone:         _tv3dConeVsCylinder(),
    cylinder:     _tv3dConeVsCylinder(),
    cube:         _tv3dCubeVsRectPrism(),
    'rect-prism': _tv3dCubeVsRectPrism(),
    'tri-prism':  _tv3dTriPrismVsCone()
  };
  var label = solid === 'rect-prism' ? 'rectangular prism' : solid === 'tri-prism' ? 'triangular prism' : solid;
  return {
    errorTag: _3WS,
    title: 'Let\'s identify this solid',
    teachingSteps: steps[solid],
    teachingVisualRaw: tvMap[solid],
    correctAnswerExplanation: 'This is a ' + label + '.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i3DC() {
  return {
    errorTag: _3DC,
    title: 'Flat shape vs. solid',
    teachingSteps: [
      '2D shapes are flat — like a drawing on paper.',
      '3D solids have depth — you can pick them up and turn them.',
      'A circle is a flat 2D shape. A sphere is a 3D solid that is round everywhere.',
      'A square is flat. A cube is a 3D solid with square faces.'
    ],
    teachingVisualRaw: _tv3dSphereVsCircle(),
    correctAnswerExplanation: 'This is a 3D solid, not a flat 2D shape.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i3KP() {
  return {
    errorTag: _3KP,
    title: 'Cube vs. rectangular prism',
    teachingSteps: [
      'Both a cube and a rectangular prism are box-shaped.',
      'A cube: all faces are the same size — like a dice.',
      'A rectangular prism: the faces are rectangles and are not all the same size.',
      'Equal square faces = cube. Rectangle faces (not all equal) = rectangular prism.'
    ],
    teachingVisualRaw: _tv3dCubeVsRectPrism(),
    correctAnswerExplanation: 'Equal square faces = cube. Longer rectangle faces = rectangular prism.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i3CC() {
  return {
    errorTag: _3CC,
    title: 'Cone vs. cylinder',
    teachingSteps: [
      'Both a cone and a cylinder have a round base.',
      'A cone comes to a point at the top.',
      'A cylinder is round at BOTH ends — no point anywhere.',
      'Point at top = cone. Round at both ends = cylinder.'
    ],
    teachingVisualRaw: _tv3dConeVsCylinder(),
    correctAnswerExplanation: 'A point means cone. Round at both ends means cylinder.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i3TS() {
  return {
    errorTag: _3TS,
    title: 'Triangular prism vs. cone',
    teachingSteps: [
      'A cone comes to one single point at the top.',
      'A triangular prism has flat triangle faces at each end — no point.',
      'Look at the ends: flat triangles or a curved point?',
      'Flat triangle ends = triangular prism. Single point = cone.'
    ],
    teachingVisualRaw: _tv3dTriPrismVsCone(),
    correctAnswerExplanation: 'A triangular prism has flat triangle ends. A cone has a pointed tip.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i3SR() {
  return {
    errorTag: _3SR,
    title: 'Sphere vs. cylinder',
    teachingSteps: [
      'A sphere is round in every direction — no flat faces anywhere.',
      'A cylinder has flat round faces at each end.',
      'Pick up a ball: round everywhere = sphere.',
      'Pick up a can: flat ends you can feel = cylinder.'
    ],
    teachingVisualRaw: _tv3dSphereVsCylinder(),
    correctAnswerExplanation: 'A sphere has no flat faces. A cylinder has flat round ends.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

// ── C1: Basic naming (30E — 5 per solid) ─────────────────────────────────────

var _l52C1 = [

  // Sphere (5E)
  {t:'What is the name of this solid?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cube',tag:_3WS},{val:'Cylinder',tag:_3SR},{val:'Cone',tag:_3WS}], a:0, e:'A sphere is perfectly round, like a ball. No flat faces.', d:'e', h:'This solid is perfectly round in every direction.', sk:'identify_3d_solids', i:_i3DC()},
  {t:'Which name matches this solid?', s:_svg3dSphere(), o:[{val:'Cone',tag:_3WS},{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Cube',tag:_3WS}], a:1, e:'A sphere curves everywhere — no flat parts. Like a ball.', d:'e', h:'Is any part of this solid flat?', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'What solid is this?', s:_svg3dSphere(), o:[{val:'Cylinder',tag:_3SR},{val:'Cone',tag:_3WS},{val:'Sphere'},{val:'Rectangular prism',tag:_3WS}], a:2, e:'This solid curves in every direction — it is a sphere.', d:'e', h:'No flat parts anywhere — which solid is perfectly round?', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'Which word names this solid?', s:_svg3dSphere(), o:[{val:'Cube',tag:_3WS},{val:'Triangular prism',tag:_3WS},{val:'Cylinder',tag:_3SR},{val:'Sphere'}], a:3, e:'Round in every direction, no flat faces = sphere.', d:'e', h:'No flat parts — think of a ball.', sk:'identify_3d_solids', i:_i3DC()},
  {t:'What is the name of this solid?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Rectangular prism',tag:_3WS},{val:'Cone',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:0, e:'A sphere is perfectly round, like a ball or an orange.', d:'e', h:'Which solid is perfectly round with no flat parts?', sk:'identify_3d_solids', i:_i3WS('sphere')},

  // Cone (5E)
  {t:'What is the name of this solid?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Sphere',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'A cone has a point at the top and one round flat base.', d:'e', h:'Does this solid come to a point?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'Which name matches this solid?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'A cone has one point and one round flat base.', d:'e', h:'This solid comes to a tip at the top.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'What solid is this?', s:_svg3dCone(), o:[{val:'Sphere',tag:_3WS},{val:'Triangular prism',tag:_3TS},{val:'Cone'},{val:'Cylinder',tag:_3CC}], a:2, e:'The point at the top is the key feature of a cone.', d:'e', h:'Look at the top of this solid.', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'Which word names this solid?', s:_svg3dCone(), o:[{val:'Rectangular prism',tag:_3WS},{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Cube',tag:_3WS}], a:1, e:'One point + one round flat base = cone.', d:'e', h:'Which solid has a pointed tip at the top?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'What is the name of this solid?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Sphere',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Cone'}], a:3, e:'A cone has a pointed top and a round base — like an ice cream cone!', d:'e', h:'Does it have a point or is the top flat?', sk:'identify_3d_solids', i:_i3CC()},

  // Cylinder (5E)
  {t:'What is the name of this solid?', s:_svg3dCylinder(), o:[{val:'Cylinder'},{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Cube',tag:_3WS}], a:0, e:'A cylinder has two round flat ends — like a soup can.', d:'e', h:'How many round ends does this solid have?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'Which name matches this solid?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Cylinder'},{val:'Cube',tag:_3WS}], a:2, e:'Two round flat ends = cylinder.', d:'e', h:'Look at both ends. Both are round.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'What solid is this?', s:_svg3dCylinder(), o:[{val:'Cube',tag:_3WS},{val:'Cylinder'},{val:'Sphere',tag:_3SR},{val:'Cone',tag:_3CC}], a:1, e:'This solid is round at the top AND the bottom — cylinder.', d:'e', h:'Is the top round or pointed?', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'Which word names this solid?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Rectangular prism',tag:_3WS},{val:'Cylinder'},{val:'Sphere',tag:_3SR}], a:2, e:'Cylinder: round at both ends, like a can or a tube.', d:'e', h:'Which solid looks like a soup can?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'What is the name of this solid?', s:_svg3dCylinder(), o:[{val:'Sphere',tag:_3SR},{val:'Cone',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Cylinder'}], a:3, e:'A cylinder has a round face at each end and a curved middle.', d:'e', h:'Both the top and the bottom are round and flat.', sk:'identify_3d_solids', i:_i3WS('cylinder')},

  // Cube (5E)
  {t:'What is the name of this solid?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:0, e:'A cube has 6 faces that are all equal squares — like a dice.', d:'e', h:'All the faces are the same size squares.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which name matches this solid?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Cone',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'All faces equal squares = cube.', d:'e', h:'Every face is the same size — like a dice.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'What solid is this?', s:_svg3dCube(), o:[{val:'Triangular prism',tag:_3WS},{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Cone',tag:_3WS}], a:2, e:'A cube looks like a dice — all 6 square faces are equal.', d:'e', h:'Which solid has all square faces?', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which word names this solid?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Cylinder',tag:_3WS}], a:1, e:'A cube has 6 equal square faces.', d:'e', h:'Think of a dice — what shape is that?', sk:'identify_3d_solids', i:_i3KP()},
  {t:'What is the name of this solid?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cone',tag:_3WS},{val:'Cube'},{val:'Triangular prism',tag:_3WS}], a:2, e:'This solid has equal square faces — it is a cube.', d:'e', h:'A cube looks like a dice.', sk:'identify_3d_solids', i:_i3WS('cube')},

  // Rectangular prism (5E)
  {t:'What is the name of this solid?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A rectangular prism has rectangle faces — like a cereal box.', d:'e', h:'This solid looks like a box.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which name matches this solid?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Rectangular prism'},{val:'Cone',tag:_3WS}], a:2, e:'A rectangular prism looks like a cereal box or a brick.', d:'e', h:'This solid is box-shaped but longer than a cube.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'What solid is this?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Rectangular prism'},{val:'Triangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'A rectangular prism: the faces are rectangles, not all equal squares.', d:'e', h:'Are the faces squares or rectangles?', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'Which word names this solid?', s:_svg3dRectPrism(), o:[{val:'Triangular prism',tag:_3WS},{val:'Cube',tag:_3KP},{val:'Cone',tag:_3WS},{val:'Rectangular prism'}], a:3, e:'Rectangle faces + box shape = rectangular prism.', d:'e', h:'Think of a shoebox or a juice box.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'What is the name of this solid?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:0, e:'A rectangular prism has rectangle faces. It is longer than a cube.', d:'e', h:'More like a box than a dice.', sk:'identify_3d_solids', i:_i3KP()},

  // Triangular prism (5E)
  {t:'What is the name of this solid?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Cone',tag:_3TS},{val:'Cube',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:0, e:'A triangular prism has triangle shapes at both ends.', d:'e', h:'Look at the ends — what shape are they?', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'Which name matches this solid?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'Triangle ends + rectangle sides = triangular prism.', d:'e', h:'What shape do you see at the ends?', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'What solid is this?', s:_svg3dTriPrism(), o:[{val:'Rectangular prism',tag:_3WS},{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Cube',tag:_3WS}], a:2, e:'The triangular front face tells you this is a triangular prism.', d:'e', h:'Is the front face a triangle or a rectangle?', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'Which word names this solid?', s:_svg3dTriPrism(), o:[{val:'Cube',tag:_3WS},{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Triangular prism'}], a:3, e:'A triangular prism: flat triangle ends and rectangle sides.', d:'e', h:'The front face is a triangle.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'What is the name of this solid?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS},{val:'Cone',tag:_3TS},{val:'Sphere',tag:_3WS}], a:0, e:'Triangle shapes at both ends = triangular prism.', d:'e', h:'What shape are the two ends?', sk:'identify_3d_solids', i:_i3WS('tri-prism')}

];

// ── C2: Description → name (24M — 4 per solid) ───────────────────────────────

var _l52C2 = [

  // Sphere (4M)
  {t:'This solid is perfectly round in every direction. It has no flat parts. What is it?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Cube',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'Perfectly round with no flat faces = sphere.', d:'m', h:'No flat parts anywhere — only one solid fits.', sk:'identify_3d_solids', i:_i3DC()},
  {t:'I am round like a ball. I have no flat faces. What solid am I?', s:_svg3dSphere(), o:[{val:'Cone',tag:_3WS},{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Rectangular prism',tag:_3WS}], a:1, e:'Round everywhere, no flat parts = sphere. A ball is a sphere.', d:'m', h:'Think of a ball or an orange.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'Which solid has no flat faces at all?', s:_svg3dSphere(), o:[{val:'Cylinder',tag:_3SR},{val:'Cone',tag:_3WS},{val:'Sphere'},{val:'Cube',tag:_3WS}], a:2, e:'Only a sphere has no flat faces — it curves everywhere.', d:'m', h:'A sphere is the only solid with no flat parts.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'This solid is shaped exactly like a basketball. What is its name?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Cone',tag:_3WS},{val:'Rectangular prism',tag:_3WS}], a:0, e:'A basketball is a sphere — round in every direction.', d:'m', h:'A basketball has no flat parts.', sk:'identify_3d_solids', i:_i3WS('sphere')},

  // Cone (4M)
  {t:'This solid has one point at the top and one round flat base. What is it?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Triangular prism',tag:_3TS},{val:'Sphere',tag:_3WS}], a:0, e:'One point + one round flat base = cone.', d:'m', h:'Which solid has a pointed top?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'I come to a point at the top. My base is round and flat. What solid am I?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'A cone has a point at the top and a round flat base.', d:'m', h:'What solid has a tip at the very top?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'Which solid has a point at one end and a round face at the other end?', s:_svg3dCone(), o:[{val:'Cube',tag:_3WS},{val:'Triangular prism',tag:_3TS},{val:'Sphere',tag:_3WS},{val:'Cone'}], a:3, e:'Point at one end + round face at the other = cone.', d:'m', h:'The solid has a tip, not a flat top.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'This solid looks like an ice cream cone. What is its name?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'An ice cream cone has a point at the top and a round base — it is a cone.', d:'m', h:'Think about the shape of an ice cream cone.', sk:'identify_3d_solids', i:_i3WS('cone')},

  // Cylinder (4M)
  {t:'This solid has two round flat ends and a curved side. What is it?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Cylinder'},{val:'Cube',tag:_3WS}], a:2, e:'Two round flat ends + curved side = cylinder.', d:'m', h:'How many round ends does it have?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'I look like a soup can. What solid am I?', s:_svg3dCylinder(), o:[{val:'Cylinder'},{val:'Cone',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3SR}], a:0, e:'A soup can is cylinder-shaped: round at both ends.', d:'m', h:'Think about the shape of a soup can.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'Which solid is round at the top AND round at the bottom?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Cylinder'},{val:'Cube',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:1, e:'Round at both ends = cylinder. (A cone has a point, not a round top.)', d:'m', h:'Both the top and bottom are round.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'This solid can roll on its side. It has two round ends. What is it?', s:_svg3dCylinder(), o:[{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Cylinder'},{val:'Cone',tag:_3CC}], a:2, e:'Round at both ends and rolls on its curved side = cylinder.', d:'m', h:'Two round ends — not a cone.', sk:'identify_3d_solids', i:_i3WS('cylinder')},

  // Cube (4M)
  {t:'This solid has all equal square faces. What is it?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'All faces equal squares = cube.', d:'m', h:'All the faces are the same size squares.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'I look like a dice. All my faces are equal squares. What solid am I?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Sphere',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:1, e:'A dice is a cube — all 6 faces are equal squares.', d:'m', h:'Think about a dice. What shape is that?', sk:'identify_3d_solids', i:_i3WS('cube')},
  {t:'This solid is box-shaped and all faces are the same size. What is it?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Cone',tag:_3WS},{val:'Sphere',tag:_3WS}], a:0, e:'Box-shaped with all equal square faces = cube.', d:'m', h:'A cube has all equal square faces — like a dice.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid is like a wooden building block where every face is a square?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Cone',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:1, e:'Every face is a square, all equal = cube.', d:'m', h:'Every single face is a square.', sk:'identify_3d_solids', i:_i3KP()},

  // Rectangular prism (4M)
  {t:'This solid has rectangle faces and looks like a cereal box. What is it?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Rectangular prism'},{val:'Cylinder',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:1, e:'A cereal box has rectangle faces — it is a rectangular prism.', d:'m', h:'Think about a cereal box.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'I am a box shape, but my faces are NOT all equal squares. What solid am I?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Cone',tag:_3WS},{val:'Sphere',tag:_3WS}], a:0, e:'Box-shaped but faces are rectangles (not all equal) = rectangular prism.', d:'m', h:'Not a cube — the faces are rectangles, not equal squares.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid looks like a shoebox?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Rectangular prism'},{val:'Cone',tag:_3WS}], a:2, e:'A shoebox has rectangle faces — it is a rectangular prism.', d:'m', h:'A shoebox is longer than it is tall.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'This solid is shaped like a brick. What is its name?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Triangular prism',tag:_3WS},{val:'Sphere',tag:_3WS},{val:'Rectangular prism'}], a:3, e:'A brick has rectangle faces — it is a rectangular prism.', d:'m', h:'Think about the shape of a brick.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},

  // Triangular prism (4M)
  {t:'This solid has triangle shapes at both ends. What is its name?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'Triangle shapes at both ends = triangular prism.', d:'m', h:'Look at the shape of the two ends.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'I have flat triangle faces at each end and rectangle faces on the sides. What solid am I?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Cylinder',tag:_3WS},{val:'Rectangular prism',tag:_3WS}], a:1, e:'Triangle ends + rectangle sides = triangular prism.', d:'m', h:'Triangle at BOTH ends — that rules out a cone.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'Which solid looks like a tent with a triangular cross-section?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:0, e:'A tent with a triangular cross-section is a triangular prism.', d:'m', h:'A tent has triangles at each end.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'This solid has no point. Its ends are flat triangles. What is it?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Cube',tag:_3WS},{val:'Triangular prism'},{val:'Cylinder',tag:_3WS}], a:2, e:'Flat triangle ends (no point) = triangular prism. A cone has a point.', d:'m', h:'Flat triangles at both ends — not a cone.', sk:'identify_3d_solids', i:_i3TS()}

];

// ── C3: Real-world connections (24M — 4 per solid) ───────────────────────────

var _l52C3 = [

  // Sphere (4M)
  {t:'A basketball is shaped like which solid?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A basketball is perfectly round — it is a sphere.', d:'m', h:'A basketball is round in every direction.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'An orange is shaped like which solid?', s:_svg3dSphere(), o:[{val:'Cone',tag:_3WS},{val:'Sphere'},{val:'Cylinder',tag:_3WS},{val:'Rectangular prism',tag:_3WS}], a:1, e:'An orange is round in every direction — it is a sphere.', d:'m', h:'Think about the shape of an orange.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'A globe (like the Earth) is shaped like which solid?', s:_svg3dSphere(), o:[{val:'Cylinder',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Sphere'},{val:'Cone',tag:_3WS}], a:2, e:'The Earth is round in every direction — it is a sphere.', d:'m', h:'The Earth is round like a ball.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'A marble is shaped like which solid?', s:_svg3dSphere(), o:[{val:'Rectangular prism',tag:_3WS},{val:'Cone',tag:_3WS},{val:'Cylinder',tag:_3WS},{val:'Sphere'}], a:3, e:'A marble is round in every direction — it is a sphere.', d:'m', h:'A marble is perfectly round.', sk:'identify_3d_solids', i:_i3WS('sphere')},

  // Cone (4M)
  {t:'An ice cream cone is shaped like which solid?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Sphere',tag:_3WS},{val:'Triangular prism',tag:_3TS}], a:0, e:'An ice cream cone has a point at the top — it is a cone.', d:'m', h:'Think about the pointy bottom of an ice cream cone.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'A party hat is shaped like which solid?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'A party hat comes to a point — it is a cone.', d:'m', h:'A party hat has a pointy top.', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'A traffic cone is shaped like which solid?', s:_svg3dCone(), o:[{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS},{val:'Triangular prism',tag:_3TS},{val:'Cone'}], a:3, e:'A traffic cone has a point at the top and a round base — it is a cone.', d:'m', h:'A traffic cone comes to a point.', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'A funnel comes to a point at the bottom. Which solid matches its shape?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Triangular prism',tag:_3TS},{val:'Rectangular prism',tag:_3WS}], a:0, e:'A funnel narrows to a point — it is a cone.', d:'m', h:'The narrow point at the bottom is the key clue.', sk:'identify_3d_solids', i:_i3CC()},

  // Cylinder (4M)
  {t:'A soup can is shaped like which solid?', s:_svg3dCylinder(), o:[{val:'Cylinder'},{val:'Cone',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3SR}], a:0, e:'A soup can has round ends at the top and bottom — it is a cylinder.', d:'m', h:'A soup can is round at both the top and the bottom.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'A battery is shaped like which solid?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Cylinder'},{val:'Sphere',tag:_3SR}], a:2, e:'A battery is round at both ends — it is a cylinder.', d:'m', h:'Think about the shape of a AA battery.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'A paper towel roll is shaped like which solid?', s:_svg3dCylinder(), o:[{val:'Sphere',tag:_3SR},{val:'Cylinder'},{val:'Triangular prism',tag:_3WS},{val:'Cone',tag:_3CC}], a:1, e:'A paper towel roll is round at both ends — it is a cylinder.', d:'m', h:'A paper towel roll is round all the way around.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'A tin can of paint is shaped like which solid?', s:_svg3dCylinder(), o:[{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Cone',tag:_3CC},{val:'Cylinder'}], a:3, e:'A paint can has two round flat ends — it is a cylinder.', d:'m', h:'A paint can is round at the top and the bottom.', sk:'identify_3d_solids', i:_i3WS('cylinder')},

  // Cube (4M)
  {t:'A dice is shaped like which solid?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:0, e:'A dice has equal square faces on all sides — it is a cube.', d:'m', h:'A dice has all square faces, all the same size.', sk:'identify_3d_solids', i:_i3WS('cube')},
  {t:'A square wooden block (same on all sides) is shaped like which solid?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Cone',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:1, e:'Equal square faces on all sides = cube.', d:'m', h:'All sides are the same size.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'An ice cube is shaped like which solid?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cylinder',tag:_3WS},{val:'Cube'},{val:'Rectangular prism',tag:_3KP}], a:2, e:'An ice cube has equal square faces — it is a cube.', d:'m', h:'An ice cube looks like a little box with equal sides.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid looks like a Rubik\'s cube toy?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A Rubik\'s cube has equal square faces on every side — it is a cube.', d:'m', h:'Every face of a Rubik\'s cube is the same square size.', sk:'identify_3d_solids', i:_i3WS('cube')},

  // Rectangular prism (4M)
  {t:'A cereal box is shaped like which solid?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Rectangular prism'},{val:'Cylinder',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:1, e:'A cereal box has rectangle faces — it is a rectangular prism.', d:'m', h:'A cereal box is taller than it is wide.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'A shoebox is shaped like which solid?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A shoebox has rectangle faces — it is a rectangular prism.', d:'m', h:'A shoebox is longer than it is tall.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'A brick is shaped like which solid?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Triangular prism',tag:_3WS},{val:'Rectangular prism'},{val:'Cone',tag:_3WS}], a:2, e:'A brick has rectangle faces — it is a rectangular prism.', d:'m', h:'A brick is longer than it is tall and has rectangle faces.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'A book is shaped like which solid?', s:_svg3dRectPrism(), o:[{val:'Triangular prism',tag:_3WS},{val:'Cube',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Rectangular prism'}], a:3, e:'A book has rectangle faces — it is a rectangular prism.', d:'m', h:'A book is flat and rectangular.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},

  // Triangular prism (4M)
  {t:'A tent with a triangular cross-section is shaped like which solid?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS}], a:1, e:'A tent with triangle ends is a triangular prism.', d:'m', h:'A tent has triangles at each end.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'A Toblerone candy box is shaped like which solid?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Cone',tag:_3TS},{val:'Sphere',tag:_3WS},{val:'Rectangular prism',tag:_3WS}], a:0, e:'A Toblerone box has triangle ends — it is a triangular prism.', d:'m', h:'The Toblerone box has triangular ends.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'A wedge of cheese with flat triangular ends is shaped like which solid?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Triangular prism'}], a:3, e:'Flat triangle ends = triangular prism.', d:'m', h:'The ends of the cheese wedge are flat triangles.', sk:'identify_3d_solids', i:_i3TS()},
  {t:'A door stopper shaped like a wedge has triangle ends. Which solid is it?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Cone',tag:_3TS},{val:'Cylinder',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'A wedge with flat triangle ends is a triangular prism.', d:'m', h:'Flat triangle ends — not a cone.', sk:'identify_3d_solids', i:_i3WS('tri-prism')}

];

// ── C4: Discrimination — which is NOT this solid (18H — 3 per solid) ──────────

var _l52C4 = [

  // NOT a sphere
  {t:'Three of these are spheres. Which one is NOT a sphere?', s:_svg3dSphere(), o:[{val:'A basketball',tag:_3WS},{val:'A tennis ball',tag:_3WS},{val:'A soup can'},{val:'A marble',tag:_3WS}], a:2, e:'A soup can has flat round ends — it is a cylinder, not a sphere.', d:'h', h:'Which one is NOT perfectly round in every direction?', sk:'identify_3d_solids', i:_i3SR()},
  {t:'Which of these is NOT shaped like a sphere?', s:_svg3dSphere(), o:[{val:'An orange',tag:_3WS},{val:'A globe',tag:_3WS},{val:'A party hat'},{val:'A marble',tag:_3WS}], a:2, e:'A party hat comes to a point — it is a cone, not a sphere.', d:'h', h:'Which one has a point or flat parts?', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'A student says all four of these are spheres. Which one is WRONG?', s:_svg3dSphere(), o:[{val:'Ball',tag:_3WS},{val:'Dice'},{val:'Basketball',tag:_3WS},{val:'Marble',tag:_3WS}], a:1, e:'A dice has flat square faces — it is a cube, not a sphere.', d:'h', h:'Which one has flat faces?', sk:'identify_3d_solids', i:_i3WS('sphere')},

  // NOT a cone
  {t:'Which of these is NOT shaped like a cone?', s:_svg3dCone(), o:[{val:'Ice cream cone',tag:_3WS},{val:'Party hat',tag:_3WS},{val:'Soup can'},{val:'Traffic cone',tag:_3WS}], a:2, e:'A soup can has round ends at both the top AND bottom — it is a cylinder, not a cone.', d:'h', h:'Which one does NOT have a point at the top?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'Three of these have the shape of a cone. Which one does NOT?', s:_svg3dCone(), o:[{val:'Party hat',tag:_3WS},{val:'Traffic cone',tag:_3WS},{val:'A dice'},{val:'Ice cream cone',tag:_3WS}], a:2, e:'A dice has equal square faces — it is a cube, not a cone.', d:'h', h:'Which one is NOT pointy at one end?', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'Which solid is NOT a cone?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Cone'}], a:1, e:'A cylinder has round ends at the top AND bottom — no point. It is not a cone.', d:'h', h:'Which one does NOT come to a point?', sk:'identify_3d_solids', i:_i3CC()},

  // NOT a cylinder
  {t:'Which of these is NOT shaped like a cylinder?', s:_svg3dCylinder(), o:[{val:'Soup can',tag:_3WS},{val:'Battery',tag:_3WS},{val:'A dice'},{val:'Paper towel roll',tag:_3WS}], a:2, e:'A dice has square faces — it is a cube, not a cylinder.', d:'h', h:'Which one does NOT have two round ends?', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'Three of these are cylinders. Which is NOT?', s:_svg3dCylinder(), o:[{val:'Tin can',tag:_3WS},{val:'Ice cream cone'},{val:'Battery',tag:_3WS},{val:'Paper towel roll',tag:_3WS}], a:1, e:'An ice cream cone has a point — it is a cone, not a cylinder.', d:'h', h:'Which one has a point instead of a round end?', sk:'identify_3d_solids', i:_i3CC()},
  {t:'Which solid is NOT a cylinder?', s:_svg3dCylinder(), o:[{val:'Cylinder'},{val:'Cylinder'},{val:'Sphere',tag:_3SR},{val:'Cylinder'}], a:2, e:'A sphere is round everywhere and has no flat ends — it is not a cylinder.', d:'h', h:'Which one is round in every direction, not just at the ends?', sk:'identify_3d_solids', i:_i3SR()},

  // NOT a cube
  {t:'Which of these is NOT shaped like a cube?', s:_svg3dCube(), o:[{val:'Dice',tag:_3WS},{val:'Ice cube',tag:_3WS},{val:'Cereal box'},{val:'Square wooden block',tag:_3WS}], a:2, e:'A cereal box has rectangle faces — it is a rectangular prism, not a cube.', d:'h', h:'Which one has rectangle faces instead of square faces?', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Three of these are cubes. Which is NOT?', s:_svg3dCube(), o:[{val:'Dice',tag:_3WS},{val:'Shoebox'},{val:'Ice cube',tag:_3WS},{val:'Square building block',tag:_3WS}], a:1, e:'A shoebox is longer than a cube — it has rectangle faces. It is a rectangular prism.', d:'h', h:'Which one is longer than it is tall?', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid is NOT a cube?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Cube'},{val:'Cube'},{val:'Rectangular prism',tag:_3KP}], a:3, e:'A rectangular prism has rectangle faces that are not all equal — it is not a cube.', d:'h', h:'Which one has longer rectangle faces?', sk:'identify_3d_solids', i:_i3KP()},

  // NOT a rectangular prism
  {t:'Which of these is NOT shaped like a rectangular prism?', s:_svg3dRectPrism(), o:[{val:'Cereal box',tag:_3WS},{val:'Shoebox',tag:_3WS},{val:'Tennis ball'},{val:'Book',tag:_3WS}], a:2, e:'A tennis ball is round — it is a sphere, not a rectangular prism.', d:'h', h:'Which one is round instead of box-shaped?', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'Three of these are rectangular prisms. Which is NOT?', s:_svg3dRectPrism(), o:[{val:'Brick',tag:_3WS},{val:'Dice'},{val:'Juice box',tag:_3WS},{val:'Book',tag:_3WS}], a:1, e:'A dice has equal square faces — it is a cube, not a rectangular prism.', d:'h', h:'Which one has all equal square faces?', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid is NOT a rectangular prism?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cone',tag:_3CC},{val:'Rectangular prism'},{val:'Rectangular prism'}], a:1, e:'A cone has a point at the top — it is not a rectangular prism.', d:'h', h:'Which one has a point?', sk:'identify_3d_solids', i:_i3WS('rect-prism')},

  // NOT a triangular prism
  {t:'Which of these is NOT shaped like a triangular prism?', s:_svg3dTriPrism(), o:[{val:'Tent',tag:_3WS},{val:'Toblerone box',tag:_3WS},{val:'Basketball'},{val:'Wedge of cheese',tag:_3WS}], a:2, e:'A basketball is round everywhere — it is a sphere, not a triangular prism.', d:'h', h:'Which one is round instead of having triangle ends?', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'Three of these are triangular prisms. Which is NOT?', s:_svg3dTriPrism(), o:[{val:'Tent',tag:_3WS},{val:'Wedge door stopper',tag:_3WS},{val:'Soup can'},{val:'Toblerone box',tag:_3WS}], a:2, e:'A soup can has round ends — it is a cylinder, not a triangular prism.', d:'h', h:'Which one has round ends instead of flat triangle ends?', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'Which solid is NOT a triangular prism?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Triangular prism'},{val:'Triangular prism'},{val:'Cone',tag:_3TS}], a:3, e:'A cone comes to a single point — it does not have flat triangle ends.', d:'h', h:'Which one has a point instead of flat triangle ends?', sk:'identify_3d_solids', i:_i3TS()}

];

// ── C5: Clue-based identification (18H — 3 per solid) ────────────────────────

var _l52C5 = [

  // Sphere clues
  {t:'I have no flat faces anywhere. I look the same from every direction. What solid am I?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Cone',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'No flat faces + same from every direction = sphere.', d:'h', h:'Only one solid has no flat faces at all.', sk:'identify_3d_solids', i:_i3DC()},
  {t:'I can roll in any direction. I never stop rolling on my own. What solid am I?', s:_svg3dSphere(), o:[{val:'Cube',tag:_3WS},{val:'Sphere'},{val:'Rectangular prism',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:1, e:'A sphere rolls in any direction because it is round everywhere.', d:'h', h:'Which solid is so round it rolls in any direction?', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'A student says: "This solid is round, but not like a ball — it has flat ends." Is this a sphere?', s:_svg3dCylinder(), o:[{val:'Yes, it is a sphere',tag:_3SR},{val:'No, it is a cylinder'},{val:'No, it is a cone',tag:_3CC},{val:'No, it is a cube',tag:_3WS}], a:1, e:'Flat ends mean it is a cylinder, not a sphere. A sphere has NO flat parts.', d:'h', h:'Does a sphere have flat ends?', sk:'identify_3d_solids', i:_i3SR()},

  // Cone clues
  {t:'I have exactly one point and exactly one round flat face. What solid am I?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Triangular prism',tag:_3TS},{val:'Cone'},{val:'Sphere',tag:_3WS}], a:2, e:'One point + one round flat face = cone.', d:'h', h:'Exactly one point, exactly one round base.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'I can spin on my point like a top. What solid am I?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Cylinder',tag:_3CC},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:0, e:'A cone has a single point it can spin on.', d:'h', h:'Which solid has a single point at the bottom it could balance on?', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'I have a curved surface AND a flat face, but I am NOT a cylinder. What am I?', s:_svg3dCone(), o:[{val:'Sphere',tag:_3WS},{val:'Cone'},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS}], a:1, e:'A cone has one curved surface and one flat circular base — but only ONE flat face, unlike a cylinder which has two.', d:'h', h:'Curved AND flat, but only one flat face.', sk:'identify_3d_solids', i:_i3CC()},

  // Cylinder clues
  {t:'I have a flat face at the top AND a flat face at the bottom, and both are round. What solid am I?', s:_svg3dCylinder(), o:[{val:'Sphere',tag:_3SR},{val:'Cone',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Cylinder'}], a:3, e:'Round flat face at the top AND at the bottom = cylinder.', d:'h', h:'Both ends are the same round flat face.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'I can roll on my side but NOT in every direction. What solid am I?', s:_svg3dCylinder(), o:[{val:'Cylinder'},{val:'Sphere',tag:_3SR},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'A cylinder rolls on its curved side but only in one direction — it cannot roll sideways.', d:'h', h:'Rolls, but only in one direction — not like a sphere.', sk:'identify_3d_solids', i:_i3SR()},
  {t:'I am NOT a cone, but I have a curved surface. I have TWO round flat faces. What solid am I?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Cylinder'},{val:'Cube',tag:_3WS}], a:2, e:'Two round flat faces + curved surface = cylinder. (A cone only has one round face.)', d:'h', h:'TWO round flat faces — not one like a cone.', sk:'identify_3d_solids', i:_i3CC()},

  // Cube clues
  {t:'All of my faces are the same size squares. What solid am I?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Triangular prism',tag:_3WS},{val:'Cone',tag:_3WS}], a:1, e:'All faces equal squares = cube.', d:'h', h:'Every face is the same — square and equal.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'I am a box shape. I have 6 faces and they are ALL the same size. What solid am I?', s:_svg3dCube(), o:[{val:'Cube'},{val:'Rectangular prism',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Sphere',tag:_3WS}], a:0, e:'Box with 6 equal faces = cube.', d:'h', h:'Box-shaped with ALL faces equal.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'A student says this solid is a rectangular prism because it is box-shaped. But all the faces are equal squares. Is the student right?', s:_svg3dCube(), o:[{val:'Yes, it is a rectangular prism',tag:_3KP},{val:'No, it is a cube'},{val:'No, it is a sphere',tag:_3WS},{val:'No, it is a cylinder',tag:_3WS}], a:1, e:'If all faces are equal squares, it is a cube — not a rectangular prism.', d:'h', h:'Equal square faces = cube, not rectangular prism.', sk:'identify_3d_solids', i:_i3KP()},

  // Rectangular prism clues
  {t:'I am box-shaped, but my faces are NOT all equal. Some faces are longer than others. What solid am I?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Rectangular prism'},{val:'Cone',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'Box shape with faces that are not all equal = rectangular prism.', d:'h', h:'Box-shaped, but NOT all faces are equal.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'I have 6 faces. Some are longer and some are shorter. What solid am I?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:0, e:'6 faces, not all equal = rectangular prism.', d:'h', h:'All box-shaped solids have 6 faces — which one has faces that are NOT all equal?', sk:'identify_3d_solids', i:_i3KP()},
  {t:'I am longer than I am tall. My faces are rectangles. What solid am I?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Triangular prism',tag:_3WS},{val:'Rectangular prism'},{val:'Cone',tag:_3WS}], a:2, e:'Longer than tall + rectangle faces = rectangular prism.', d:'h', h:'Think of a shoebox: longer than tall, rectangle faces.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},

  // Triangular prism clues
  {t:'My ends are flat triangles. My sides are rectangles. What solid am I?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:1, e:'Flat triangle ends + rectangle sides = triangular prism.', d:'h', h:'Triangle ends — that rules out all other solids.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'I am NOT a cone, but I have triangle shapes in my solid. What am I?', s:_svg3dTriPrism(), o:[{val:'Triangular prism'},{val:'Cone',tag:_3TS},{val:'Sphere',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'A triangular prism has flat triangle ends — not a cone (which has one point).', d:'h', h:'Triangle shapes, but flat ends — not a pointed cone.', sk:'identify_3d_solids', i:_i3TS()},
  {t:'A student says this solid is a cone because it looks triangular. Is that right?', s:_svg3dTriPrism(), o:[{val:'Yes, it is a cone',tag:_3TS},{val:'No, it is a triangular prism'},{val:'No, it is a cube',tag:_3WS},{val:'No, it is a sphere',tag:_3WS}], a:1, e:'A triangular prism has flat triangle ends — no point. A cone has one pointed tip.', d:'h', h:'Does this solid have a point, or flat triangle ends?', sk:'identify_3d_solids', i:_i3TS()}

];

// ── C6: Mixed review (18H — 3 per solid) ─────────────────────────────────────

var _l52C6 = [

  // Cone mixed
  {t:'A traffic cone keeps cars away. Which solid matches its shape?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Sphere',tag:_3WS},{val:'Cube',tag:_3WS}], a:1, e:'A traffic cone has a point at the top — it is a cone.', d:'h', h:'A traffic cone has a pointed top and a wide round base.', sk:'identify_3d_solids', i:_i3WS('cone')},

  // Cube mixed
  {t:'A Rubik\'s cube is a famous puzzle toy. Which solid matches its shape?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Triangular prism',tag:_3WS}], a:2, e:'A Rubik\'s cube has equal square faces on all sides — it is a cube.', d:'h', h:'All six faces are equal squares.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid stacks perfectly on top of another identical solid?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS},{val:'Cube'},{val:'Cylinder',tag:_3WS}], a:2, e:'A cube has flat faces — it stacks perfectly on another cube.', d:'h', h:'Flat faces stack evenly — which solid has flat faces on all sides?', sk:'identify_3d_solids', i:_i3WS('cube')},
  {t:'Which solid could a builder stack to build a perfect flat wall with no gaps?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Cylinder',tag:_3WS},{val:'Cone',tag:_3WS}], a:1, e:'A cube has flat square faces that fit together with no gaps.', d:'h', h:'Flat faces on all sides stack with no gaps.', sk:'identify_3d_solids', i:_i3KP()},

  // Rectangular prism mixed
  {t:'You want to stack books flat on a shelf. Which solid matches the shape of a book?', s:_svg3dRectPrism(), o:[{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS},{val:'Rectangular prism'},{val:'Cylinder',tag:_3WS}], a:2, e:'A book has flat rectangle faces — it is a rectangular prism.', d:'h', h:'A book has rectangle faces on all sides.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'Which solid is used as a building block in most houses and walls?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A brick is a rectangular prism — it has rectangle faces and stacks well.', d:'h', h:'Bricks are rectangular prisms.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'A cereal box is a rectangular prism. How is it different from a cube?', s:_svg3dRectPrism(), o:[{val:'It is taller than it is wide — faces are rectangles, not all equal squares'},{val:'It has fewer faces than a cube',tag:_3KP},{val:'It has curved faces',tag:_3WS},{val:'They are the same solid',tag:_3KP}], a:0, e:'A rectangular prism has rectangle faces — a cube has equal square faces. Both have 6 faces.', d:'h', h:'The faces are the key difference.', sk:'identify_3d_solids', i:_i3KP()},

  // Triangular prism mixed
  {t:'A tent is set up in the backyard. The front and back are triangles. Which solid matches the tent shape?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'Triangle front and back + rectangle sides = triangular prism.', d:'h', h:'Triangle at the front AND back = triangular prism.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'A wedge of cheese has triangle sides and flat rectangle faces. Which solid matches?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Triangular prism'},{val:'Cube',tag:_3WS}], a:2, e:'A wedge of cheese has triangle ends and flat rectangle sides — it is a triangular prism.', d:'h', h:'Triangle ends and rectangle sides — triangular prism.', sk:'identify_3d_solids', i:_i3TS()}

];

// ── C7: Backfill — extra easy/medium + 2D-vs-3D awareness (15E + 12M) ─────────

var _l52C7 = [

  // Sphere easy (2E)
  {t:'A marble is shaped like which solid?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cone',tag:_3WS},{val:'Cylinder',tag:_3SR},{val:'Cube',tag:_3WS}], a:0, e:'A marble is perfectly round — it is a sphere.', d:'e', h:'A marble is round like a ball.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'I am round like a ball and roll in every direction. What solid am I?', s:_svg3dSphere(), o:[{val:'Cylinder',tag:_3SR},{val:'Cone',tag:_3WS},{val:'Sphere'},{val:'Cube',tag:_3WS}], a:2, e:'Round in every direction = sphere.', d:'e', h:'A ball is a sphere.', sk:'identify_3d_solids', i:_i3WS('sphere')},

  // Cone easy (2E)
  {t:'An ice cream cone has this shape. What is it called?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Sphere',tag:_3WS},{val:'Cone'},{val:'Rectangular prism',tag:_3WS}], a:2, e:'An ice cream cone has a point at the top — it is a cone.', d:'e', h:'An ice cream cone has a pointed top.', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'I have a point at the top and a round flat base. What solid am I?', s:_svg3dCone(), o:[{val:'Sphere',tag:_3WS},{val:'Cylinder',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Cone'}], a:3, e:'A point at the top + round flat base = cone.', d:'e', h:'Which solid has one point and one round base?', sk:'identify_3d_solids', i:_i3WS('cone')},

  // Cylinder easy (2E)
  {t:'A soup can has this shape. What is it called?', s:_svg3dCylinder(), o:[{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3CC},{val:'Cylinder'},{val:'Cube',tag:_3WS}], a:2, e:'A soup can has two round flat ends and a curved side — it is a cylinder.', d:'e', h:'A soup can is a cylinder.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'I look like a soup can. I have two round flat ends. What solid am I?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Rectangular prism',tag:_3WS},{val:'Cylinder'}], a:3, e:'Two round flat ends + curved side = cylinder.', d:'e', h:'Two round flat ends, like a can.', sk:'identify_3d_solids', i:_i3WS('cylinder')},

  // Cube easy (2E)
  {t:'A wooden block with all equal square faces — what solid is this?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Cube'},{val:'Sphere',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:1, e:'Equal square faces on all sides = cube.', d:'e', h:'All faces are equal squares.', sk:'identify_3d_solids', i:_i3WS('cube')},
  {t:'I look the same from every side. All my faces are squares. What solid am I?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Cone',tag:_3WS},{val:'Rectangular prism',tag:_3KP}], a:1, e:'Same from every side, all square faces = cube.', d:'e', h:'Think of a dice — all faces are equal.', sk:'identify_3d_solids', i:_i3WS('cube')},

  // Rectangular prism easy (2E)
  {t:'A brick is shaped like which solid?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Rectangular prism'},{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS}], a:1, e:'A brick has rectangle faces — it is a rectangular prism.', d:'e', h:'A brick is box-shaped but the faces are not all equal.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'I am box-shaped. My faces are rectangles and are not all the same size. What solid am I?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Cone',tag:_3WS},{val:'Cylinder',tag:_3WS}], a:0, e:'Box shape with rectangle faces that are not all equal = rectangular prism.', d:'e', h:'Rectangle faces, not all the same size.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},

  // Triangular prism easy (2E)
  {t:'A tent has triangle ends and rectangle sides. What solid is this?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Cube',tag:_3WS},{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS}], a:2, e:'Triangle ends + rectangle sides = triangular prism.', d:'e', h:'Triangle at both ends.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'I have triangle ends and flat rectangle sides. What solid am I?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS},{val:'Triangular prism'}], a:3, e:'Triangle ends + rectangle sides = triangular prism.', d:'e', h:'Triangle at both ends.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},

  // 2D vs 3D easy (3E — gives _3DC natural distractor usage)
  {t:'Which one is a 3D solid, not a flat shape?', s:_svg3dSphere(), o:[{val:'Circle',tag:_3DC},{val:'Sphere'},{val:'Square',tag:_3DC},{val:'Triangle',tag:_3DC}], a:1, e:'A sphere is a 3D solid you can hold. A circle, square, and triangle are flat shapes.', d:'e', h:'3D solids are objects you can hold — flat shapes are drawn on paper.', sk:'identify_3d_solids', i:_i3DC()},
  {t:'A circle is flat. Which solid is round like a circle but 3D?', s:_svg3dSphere(), o:[{val:'Square',tag:_3DC},{val:'Sphere'},{val:'Triangle',tag:_3DC},{val:'Rectangle',tag:_3DC}], a:1, e:'A sphere is 3D and round — it looks like a circle from any angle, but you can hold it.', d:'e', h:'Round like a circle, but solid.', sk:'identify_3d_solids', i:_i3DC()},
  {t:'A square is flat. Which 3D solid has square faces?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Circle',tag:_3DC},{val:'Cylinder',tag:_3WS}], a:1, e:'A cube is a 3D solid — its faces are squares, but the cube itself is solid.', d:'e', h:'3D solid with square faces.', sk:'identify_3d_solids', i:_i3DC()},

  // Sphere medium (2M)
  {t:'Which solid would you use to model a planet?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Rectangular prism',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'Planets are round in every direction — they are spheres.', d:'m', h:'Planets are perfectly round.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'Both a sphere and a cylinder can roll. How can you tell them apart?', s:_svg3dSphere(), o:[{val:'A sphere rolls in any direction — a cylinder only rolls on its curved side'},{val:'They are the same solid',tag:_3SR},{val:'A sphere has flat ends — a cylinder does not',tag:_3SR},{val:'A cylinder rolls in every direction',tag:_3SR}], a:0, e:'A sphere rolls in any direction. A cylinder rolls only on its curved side.', d:'m', h:'Which one rolls in every direction?', sk:'identify_3d_solids', i:_i3SR()},

  // Cone medium (2M)
  {t:'A party hat has a pointed top and a round base. Which solid matches?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'A party hat has a point at the top and a round base — it is a cone.', d:'m', h:'Pointed top and round base.', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'Which solid does NOT have any flat faces?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A sphere is round everywhere — it has no flat faces at all.', d:'m', h:'Which solid is round everywhere with no flat parts?', sk:'identify_3d_solids', i:_i3DC()},

  // Cylinder medium (2M)
  {t:'A paint roller has a curved side and two round flat ends. Which solid is this?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Cylinder'},{val:'Triangular prism',tag:_3WS}], a:2, e:'Curved side + two round flat ends = cylinder.', d:'m', h:'A paint roller is this shape.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'Which solid can both roll AND slide?', s:_svg3dCylinder(), o:[{val:'Sphere',tag:_3SR},{val:'Cube',tag:_3WS},{val:'Cylinder'},{val:'Triangular prism',tag:_3WS}], a:2, e:'A cylinder rolls on its curved side and slides on its flat ends.', d:'m', h:'Flat ends for sliding, curved side for rolling.', sk:'identify_3d_solids', i:_i3SR()},

  // Cube medium (2M)
  {t:'Which solid has all flat faces and is used as a game die?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Cylinder',tag:_3WS},{val:'Cone',tag:_3WS}], a:1, e:'A die is a cube — it has flat faces that are all equal squares.', d:'m', h:'A game die is a cube.', sk:'identify_3d_solids', i:_i3WS('cube')},
  {t:'Which solid looks the same when you look at it from any direction?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Triangular prism',tag:_3WS},{val:'Cube'},{val:'Cone',tag:_3WS}], a:2, e:'A cube looks the same from the front, back, top, and sides — all faces are equal.', d:'m', h:'Same shape from every direction.', sk:'identify_3d_solids', i:_i3WS('cube')},

  // Rectangular prism medium (2M)
  {t:'Which solid is shaped like a mattress?', s:_svg3dRectPrism(), o:[{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Rectangular prism'},{val:'Triangular prism',tag:_3WS}], a:2, e:'A mattress is wider than it is tall and has rectangle faces — it is a rectangular prism.', d:'m', h:'A mattress is flat and wide — rectangle faces.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'A suitcase is box-shaped with rectangle faces. Which solid matches?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Cylinder',tag:_3WS},{val:'Sphere',tag:_3WS}], a:0, e:'A suitcase has rectangle faces — it is a rectangular prism, not a cube.', d:'m', h:'Box-shaped with rectangle faces — not all equal.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},

  // Triangular prism medium (2M)
  {t:'A triangular prism and a cone both look pointed. What is the key difference?', s:_svg3dTriPrism(), o:[{val:'A triangular prism has flat triangle ends — a cone comes to one single point'},{val:'They are the same solid',tag:_3TS},{val:'A triangular prism is always bigger',tag:_3WS},{val:'A cone has flat triangle ends',tag:_3TS}], a:0, e:'A triangular prism has flat triangle ends at both ends. A cone comes to one single point.', d:'m', h:'Does the shape have a flat triangle end, or does it come to a single point?', sk:'identify_3d_solids', i:_i3TS()},
  {t:'Which solid has all flat faces and no curved surfaces at all?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Cylinder',tag:_3WS},{val:'Sphere',tag:_3WS},{val:'Triangular prism'}], a:3, e:'A triangular prism has only flat faces — no curved surfaces anywhere.', d:'m', h:'All flat faces, no curves at all.', sk:'identify_3d_solids', i:_i3WS('tri-prism')}

];

// ── L5.2 bank assembly ────────────────────────────────────────────────────────

var _l52Bank = _colorizeQ([].concat(_l52C1, _l52C2, _l52C3, _l52C4, _l52C5, _l52C6, _l52C7));

// ── L5.2 worked examples ──────────────────────────────────────────────────────

var _l52Examples = [
  {
    id: 'g1-u5-l2-ex-1',
    title: 'Example 1: Identifying a sphere',
    prompt: 'Look at this solid. It is perfectly round. What is its name?',
    steps: [
      'Look at the surface. Is any part flat?',
      'This solid is round everywhere — no flat parts at all.',
      'A solid that is round in every direction is a sphere.',
      'Think of a ball or an orange — those are spheres.'
    ],
    finalAnswer: 'The solid is a sphere.'
  },
  {
    id: 'g1-u5-l2-ex-2',
    title: 'Example 2: Identifying a cone',
    prompt: 'This solid has a point at the top and a round flat base. What is it?',
    steps: [
      'Look at the top: it comes to a single point.',
      'Look at the base: it is a flat circle.',
      'One point at the top + one round flat base = cone.',
      'Think of an ice cream cone or a party hat.'
    ],
    finalAnswer: 'The solid is a cone.'
  },
  {
    id: 'g1-u5-l2-ex-3',
    title: 'Example 3: Cone vs. cylinder',
    prompt: 'How do you tell a cone from a cylinder?',
    steps: [
      'Both a cone and a cylinder have a round base.',
      'A cone comes to a point at the top.',
      'A cylinder has a round flat face at the top AND the bottom — no point.',
      'Point = cone. Round at both ends = cylinder.'
    ],
    finalAnswer: 'Check the top: a point means cone; a round flat face means cylinder.'
  },
  {
    id: 'g1-u5-l2-ex-4',
    title: 'Example 4: Cube vs. rectangular prism',
    prompt: 'Both a cube and a rectangular prism are box-shaped. How do you tell them apart?',
    steps: [
      'Look at the faces of the solid.',
      'A cube: every face is a square, and all faces are the same size.',
      'A rectangular prism: the faces are rectangles — they are not all the same size.',
      'Equal square faces = cube. Rectangle faces (not all equal) = rectangular prism.'
    ],
    finalAnswer: 'Check the faces: equal squares = cube; rectangles = rectangular prism.'
  },
  {
    id: 'g1-u5-l2-ex-5',
    title: 'Example 5: Identifying a triangular prism',
    prompt: 'This solid has triangle shapes at both ends. What is it?',
    steps: [
      'Look at the two ends of the solid.',
      'Both ends are flat triangles.',
      'The sides connecting the triangles are rectangles.',
      'Flat triangle ends + rectangle sides = triangular prism.'
    ],
    finalAnswer: 'The solid is a triangular prism.'
  },
  {
    id: 'g1-u5-l2-ex-6',
    title: 'Example 6: Real-world connection',
    prompt: 'A soup can is shaped like which solid?',
    steps: [
      'Think about the shape of a soup can.',
      'The top is a round flat circle. The bottom is a round flat circle.',
      'Both ends are round — and the middle is curved.',
      'Round at both ends = cylinder.'
    ],
    finalAnswer: 'A soup can is shaped like a cylinder.'
  }
];

// ── L5.2 key ideas ────────────────────────────────────────────────────────────

var _l52KeyIdeas = [
  'A sphere is perfectly round, like a ball. It has no flat faces.',
  'A cone has one pointed tip and one round flat base, like an ice cream cone.',
  'A cylinder has two round flat ends and a curved side, like a soup can.',
  'A cube has 6 faces that are all equal squares, like a dice.',
  'A rectangular prism has 6 faces that are rectangles, like a cereal box.',
  'A triangular prism has triangle faces at both ends and rectangle faces on the sides.'
];

// ══════════════════════════════════════════════════════════════════════════════
//  Lesson 5.3 — Shape Attributes and Sorting
//  TEKS 1.6A, 1.6B | 160 questions (50E / 65M / 45H)
// ══════════════════════════════════════════════════════════════════════════════

// ── L5.3 error tag shorthands ─────────────────────────────────────────────────
var _53DA = 'err_defining_attribute_confusion';
var _53ND = 'err_non_defining_attribute';
var _53WS = 'err_wrong_sort_category';
var _53SC = 'err_sides_count';
var _53VC = 'err_vertex_count';
var _53OR = 'err_orientation_confusion';
var _53CS = 'err_color_size_confusion';
var _53TD = 'err_2d_3d_confusion';

// ── L5.3 mini SVG helpers (80×80 via viewBox scaling) ────────────────────────
function _svgCircSm() {
  return '<svg width="80" height="80" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5"/></svg>';
}
function _svgTriSm(deg) {
  var d = deg || 0, r = 50, cx = 60, cy = 60;
  var a0 = (d - 90) * Math.PI / 180, p = [];
  for (var i = 0; i < 3; i++) {
    var a = a0 + i * 2 * Math.PI / 3;
    p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
  }
  return '<svg width="80" height="80" viewBox="0 0 120 120"><polygon points="' + p.join(' ') + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>';
}
function _svgSquSm() {
  return '<svg width="80" height="80" viewBox="0 0 110 110"><rect x="7" y="7" width="96" height="96" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>';
}
function _svgRectSm() {
  return '<svg width="90" height="58" viewBox="0 0 160 100"><rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>';
}
function _svgRhSm(deg) {
  var d = deg || 0, rad = d * Math.PI / 180, cx = 70, cy = 70, rx = 30, ry = 60;
  var base = [[0,-ry],[rx,0],[0,ry],[-rx,0]];
  var pts = base.map(function(p) {
    var x = p[0]*Math.cos(rad) - p[1]*Math.sin(rad);
    var y = p[0]*Math.sin(rad) + p[1]*Math.cos(rad);
    return (cx+x).toFixed(1)+','+(cy+y).toFixed(1);
  });
  return '<svg width="80" height="80" viewBox="0 0 140 140"><polygon points="' + pts.join(' ') + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>';
}
function _svgHexSm(deg) {
  var d = deg || 0, r = 55, cx = 65, cy = 65, p = [];
  for (var i = 0; i < 6; i++) {
    var a = (d + i * 60) * Math.PI / 180;
    p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
  }
  return '<svg width="80" height="80" viewBox="0 0 130 130"><polygon points="' + p.join(' ') + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>';
}

// ── L5.3 row layout helpers ───────────────────────────────────────────────────
function _svgRow3(s1, s2, s3) {
  return '<div style="display:flex;justify-content:space-around;align-items:center;width:100%;padding:4px 0">' +
    '<div style="width:96px;text-align:center">' + s1 + '</div>' +
    '<div style="width:96px;text-align:center">' + s2 + '</div>' +
    '<div style="width:96px;text-align:center">' + s3 + '</div>' +
    '</div>';
}
function _svgRow2(s1, s2) {
  return '<div style="display:flex;justify-content:space-around;align-items:center;width:100%;padding:4px 0">' +
    '<div style="width:120px;text-align:center">' + s1 + '</div>' +
    '<div style="width:120px;text-align:center">' + s2 + '</div>' +
    '</div>';
}
// Labeled variants — add A / B / C above each shape so answer choices match visuals
function _svgRow2L(s1, s2) {
  const lbl = l => '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:2px">' + l + '</div>';
  return '<div style="display:flex;justify-content:space-around;align-items:flex-start;width:100%;padding:4px 0">' +
    '<div style="width:120px;text-align:center">' + lbl('A') + s1 + '</div>' +
    '<div style="width:120px;text-align:center">' + lbl('B') + s2 + '</div>' +
    '</div>';
}
function _svgRow3L(s1, s2, s3) {
  const lbl = l => '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:2px">' + l + '</div>';
  return '<div style="display:flex;justify-content:space-around;align-items:flex-start;width:100%;padding:4px 0">' +
    '<div style="width:96px;text-align:center">' + lbl('A') + s1 + '</div>' +
    '<div style="width:96px;text-align:center">' + lbl('B') + s2 + '</div>' +
    '<div style="width:96px;text-align:center">' + lbl('C') + s3 + '</div>' +
    '</div>';
}

// ── L5.3 teaching visual functions ───────────────────────────────────────────

function _tv53DefVsNon() {
  return _tvWrap(
    '<svg width="260" height="115" viewBox="0 0 260 115" style="display:inline-block">' +
    '<text x="65" y="14" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Defining</text>' +
    '<polygon points="65,22 110,95 20,95" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="65" y="110" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">3 sides — ALWAYS</text>' +
    '<line x1="130" y1="10" x2="130" y2="105" stroke="#ddd" stroke-width="1"/>' +
    '<text x="195" y="14" font-size="11" font-weight="700" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">Non-defining</text>' +
    '<polygon points="195,22 240,95 150,95" fill="#bbb" opacity="0.25" stroke="#999" stroke-width="3"/>' +
    '<text x="195" y="110" font-size="10" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">color — can change</text>' +
    '</svg>',
    'Sides/corners define a shape.  Color does not.'
  );
}

function _tv53NonDefining() {
  return _tvWrap(
    '<svg width="260" height="110" viewBox="0 0 260 110" style="display:inline-block">' +
    '<text x="130" y="14" font-size="12" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">All three are triangles!</text>' +
    '<polygon points="45,28 80,95 10,95" fill="#EF9A9A" opacity="0.7" stroke="#C62828" stroke-width="3"/>' +
    '<polygon points="130,28 165,95 95,95" fill="#81C784" opacity="0.7" stroke="#1B5E20" stroke-width="3"/>' +
    '<polygon points="215,28 250,95 180,95" fill="#64B5F6" opacity="0.7" stroke="#0D47A1" stroke-width="3"/>' +
    '<text x="45" y="108" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">red</text>' +
    '<text x="130" y="108" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">green</text>' +
    '<text x="215" y="108" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">blue</text>' +
    '</svg>',
    'Color changes — shape name stays the same'
  );
}

function _tv53SortBySides() {
  return _tvWrap(
    '<svg width="260" height="115" viewBox="0 0 260 115" style="display:inline-block">' +
    '<rect x="2" y="20" width="116" height="90" rx="6" fill="none" stroke="' + _TVP + '" stroke-width="2" stroke-dasharray="5,3"/>' +
    '<text x="60" y="15" font-size="10" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">3 sides</text>' +
    '<polygon points="60,30 90,85 30,85" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2.5"/>' +
    '<rect x="142" y="20" width="116" height="90" rx="6" fill="none" stroke="#F57F17" stroke-width="2" stroke-dasharray="5,3"/>' +
    '<text x="200" y="15" font-size="10" font-weight="700" fill="#F57F17" text-anchor="middle" font-family="Nunito,sans-serif">4 sides</text>' +
    '<rect x="162" y="35" width="55" height="55" fill="#FFD54F" opacity="0.5" stroke="#F57F17" stroke-width="2.5"/>' +
    '<rect x="222" y="45" width="28" height="48" fill="#FFD54F" opacity="0.5" stroke="#F57F17" stroke-width="2.5"/>' +
    '</svg>',
    'Sort by sides: triangles with 3, squares/rectangles with 4'
  );
}

function _tv53SideCount() {
  return _tvWrap(
    '<svg width="170" height="125" viewBox="0 0 170 125" style="display:inline-block">' +
    '<polygon points="85,10 152,110 18,110" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    _tvDot(122, 55, 1) + _tvDot(85, 122, 2) + _tvDot(48, 55, 3) +
    '</svg>',
    'Count the sides: 1 … 2 … 3'
  );
}

function _tv53CornerCount() {
  return _tvWrap(
    '<svg width="170" height="125" viewBox="0 0 170 125" style="display:inline-block">' +
    '<polygon points="85,10 152,110 18,110" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    _tvDot(85, 10, 1) + _tvDot(152, 110, 2) + _tvDot(18, 110, 3) +
    '</svg>',
    'Count the corners: 1 … 2 … 3'
  );
}

function _tv53Orientation() {
  return _tvWrap(
    '<svg width="260" height="105" viewBox="0 0 260 105" style="display:inline-block">' +
    '<text x="130" y="13" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Same shape — different direction</text>' +
    '<polygon points="43,20 76,90 10,90" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<polygon points="130,90 163,20 97,20" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<polygon points="173,20 217,65 173,90 173,90" fill="none" stroke="none"/>' +
    '<polygon points="200,20 233,90 167,90" transform="rotate(30,200,55)" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="43" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">up</text>' +
    '<text x="130" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">down</text>' +
    '<text x="200" y="102" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">tilted</text>' +
    '</svg>',
    'A triangle turned or flipped is still a triangle'
  );
}

function _tv53ColorSize() {
  return _tvWrap(
    '<svg width="260" height="115" viewBox="0 0 260 115" style="display:inline-block">' +
    '<text x="65" y="13" font-size="10" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Size changes</text>' +
    '<rect x="10" y="20" width="60" height="60" fill="#CE93D8" opacity="0.5" stroke="#7B1FA2" stroke-width="3"/>' +
    '<rect x="82" y="42" width="36" height="36" fill="#CE93D8" opacity="0.5" stroke="#7B1FA2" stroke-width="3"/>' +
    '<text x="65" y="100" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">big square  small square</text>' +
    '<line x1="130" y1="10" x2="130" y2="105" stroke="#ddd" stroke-width="1"/>' +
    '<text x="195" y="13" font-size="10" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">Color changes</text>' +
    '<polygon points="165,20 198,90 132,90" fill="#EF9A9A" opacity="0.7" stroke="#C62828" stroke-width="3"/>' +
    '<polygon points="228,20 261,90 195,90" fill="#64B5F6" opacity="0.7" stroke="#0D47A1" stroke-width="3"/>' +
    '<text x="195" y="100" font-size="9" fill="#888" text-anchor="middle" font-family="Nunito,sans-serif">red triangle  blue triangle</text>' +
    '</svg>',
    'Both are still squares. Both are still triangles.'
  );
}

function _tv53FlatVsSolid() {
  return _tvWrap(
    '<svg width="260" height="115" viewBox="0 0 260 115" style="display:inline-block">' +
    '<text x="65" y="14" font-size="11" font-weight="700" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">2D — Flat</text>' +
    '<circle cx="65" cy="65" r="40" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<text x="65" y="110" font-size="10" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">circle (flat)</text>' +
    '<line x1="130" y1="8" x2="130" y2="108" stroke="#ddd" stroke-width="1"/>' +
    '<text x="195" y="14" font-size="11" font-weight="700" fill="#F57F17" text-anchor="middle" font-family="Nunito,sans-serif">3D — Solid</text>' +
    '<circle cx="195" cy="62" r="38" fill="#FFD54F" opacity="0.35" stroke="#F57F17" stroke-width="3"/>' +
    '<ellipse cx="183" cy="48" rx="12" ry="8" fill="white" opacity="0.35"/>' +
    '<text x="195" y="110" font-size="10" fill="#F57F17" text-anchor="middle" font-family="Nunito,sans-serif">sphere (solid)</text>' +
    '</svg>',
    'Flat drawing = 2D shape     Solid object = 3D solid'
  );
}

// ── L5.3 intervention factories ───────────────────────────────────────────────

function _i53DA() {
  return {
    errorTag: _53DA,
    title: 'What defines a shape?',
    teachingSteps: [
      'A defining attribute is something that is ALWAYS true — no matter what.',
      'Number of sides and number of corners are defining attributes.',
      'A triangle ALWAYS has 3 sides. A square ALWAYS has 4 equal sides.',
      'Color, size, and direction are NOT defining attributes — they can change.'
    ],
    teachingVisualRaw: _tv53DefVsNon(),
    correctAnswerExplanation: 'Number of sides and corners define the shape.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53ND() {
  return {
    errorTag: _53ND,
    title: 'Color and size do not change the shape',
    teachingSteps: [
      'Non-defining attributes are things that can change WITHOUT changing the shape name.',
      'Color, size, and direction are non-defining.',
      'A red triangle and a blue triangle are BOTH triangles.',
      'A tiny square and a giant square are BOTH squares.'
    ],
    teachingVisualRaw: _tv53NonDefining(),
    correctAnswerExplanation: 'Color and size are non-defining — they do not change the shape name.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53WS() {
  return {
    errorTag: _53WS,
    title: 'Sorting shapes into groups',
    teachingSteps: [
      'When sorting by sides, count the straight sides of the shape.',
      'Triangle: 3 sides → goes in the 3-sides group.',
      'Square and rectangle: 4 sides → go in the 4-sides group.',
      'Hexagon: 6 sides → goes in the 6-sides group.',
      'Circle: 0 straight sides → goes in the curved group.'
    ],
    teachingVisualRaw: _tv53SortBySides(),
    correctAnswerExplanation: 'Count the sides to find the right sorting group.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53SC() {
  return {
    errorTag: _53SC,
    title: 'Count the sides carefully',
    teachingSteps: [
      'A side is one straight line on the outside of a shape.',
      'Touch each side as you count: 1, 2, 3 …',
      'A triangle has exactly 3 sides.',
      'A square and rectangle each have exactly 4 sides.',
      'A hexagon has exactly 6 sides.'
    ],
    teachingVisualRaw: _tv53SideCount(),
    correctAnswerExplanation: 'Count each straight side one at a time.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53VC() {
  return {
    errorTag: _53VC,
    title: 'Count the corners carefully',
    teachingSteps: [
      'A corner is a pointy spot where two sides meet.',
      'Touch each corner as you count: 1, 2, 3 …',
      'A triangle has 3 corners.',
      'A square and rectangle each have 4 corners.',
      'A hexagon has 6 corners.'
    ],
    teachingVisualRaw: _tv53CornerCount(),
    correctAnswerExplanation: 'Count each corner (pointy spot) one at a time.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53OR() {
  return {
    errorTag: _53OR,
    title: 'Direction does not change the shape name',
    teachingSteps: [
      'A triangle pointing up is still a triangle.',
      'A triangle pointing down is still a triangle.',
      'Turning, flipping, or tilting a shape does NOT give it a new name.',
      'Check the NUMBER OF SIDES — not which way it points.'
    ],
    teachingVisualRaw: _tv53Orientation(),
    correctAnswerExplanation: 'Orientation is non-defining — the shape name stays the same.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53CS() {
  return {
    errorTag: _53CS,
    title: 'Color and size are non-defining',
    teachingSteps: [
      'A big square and a tiny square are both called squares.',
      'A red hexagon and a blue hexagon are both called hexagons.',
      'Color and size can change — the shape name does NOT change.',
      'Count the sides to find the shape name.'
    ],
    teachingVisualRaw: _tv53ColorSize(),
    correctAnswerExplanation: 'Color and size do not define the shape.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i53TD() {
  return {
    errorTag: _53TD,
    title: '2D shapes are flat; 3D solids are solid',
    teachingSteps: [
      'A 2D shape is flat — like a drawing on paper.',
      'A 3D solid has depth — you can pick it up and hold it.',
      'A circle is a flat 2D shape. A sphere is a round 3D solid.',
      'A square is flat. A cube is a 3D solid with square faces.'
    ],
    teachingVisualRaw: _tv53FlatVsSolid(),
    correctAnswerExplanation: 'Flat = 2D shape. Solid object = 3D solid.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

// ── C1: Defining vs non-defining attributes (8E/8M/4H = 20) ──────────────────

var _l53C1 = [
  // Easy (8)
  {t:'A triangle ALWAYS has ___.', s:_svgTriangle(0), o:[{val:'3 sides'},{val:'blue color',tag:_53CS},{val:'big size',tag:_53CS},{val:'a pointy top',tag:_53OR}], a:0, e:'A triangle always has 3 sides — that is a defining attribute.', d:'e', h:'Count the sides. That number never changes.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Which tells you what kind of shape something is?', s:_svgSquare(), o:[{val:'number of sides'},{val:'the color',tag:_53CS},{val:'the size',tag:_53CS},{val:'which way it points',tag:_53OR}], a:0, e:'Number of sides is a defining attribute — it tells you the shape name.', d:'e', h:'Sides and corners define shapes. Color and size do not.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Does color tell you the name of a shape?', s:_svgHex(0), o:[{val:'No — color is not a defining attribute'},{val:'Yes — blue shapes are circles',tag:_53CS},{val:'Yes — red shapes are triangles',tag:_53CS}], a:0, e:'Color is non-defining. A blue hexagon and a red hexagon are both hexagons.', d:'e', h:'Color can change without changing the shape name.', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'ALL hexagons have ___.', s:_svgHex(0), o:[{val:'6 sides'},{val:'6 colors',tag:_53CS},{val:'6 sizes',tag:_53CS},{val:'6 dots',tag:_53CS}], a:0, e:'Every hexagon has exactly 6 sides — that is its defining attribute.', d:'e', h:'The number of sides is always the same for hexagons.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Which is a defining attribute of a circle?', s:_svgCircle(), o:[{val:'It has 0 straight sides'},{val:'It is always big',tag:_53CS},{val:'It is always blue',tag:_53CS},{val:'It always points up',tag:_53OR}], a:0, e:'A circle has no straight sides — that is always true no matter the color or size.', d:'e', h:'What is always true about a circle?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A square ALWAYS has ___.', s:_svgSquare(), o:[{val:'4 equal sides'},{val:'a red color',tag:_53CS},{val:'a big size',tag:_53CS},{val:'a right-side-up position',tag:_53OR}], a:0, e:'4 equal sides is the defining attribute of a square.', d:'e', h:'The sides of a square are all the same length — always.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Does changing the size change the shape\'s name?', s:_svgRow2('<svg width="100" height="63" viewBox="0 0 160 100"><rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>','<svg width="50" height="32" viewBox="0 0 160 100"><rect x="10" y="16" width="140" height="68" rx="2" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/></svg>'), o:[{val:'No — both are rectangles'},{val:'Yes — size changes the shape',tag:_53CS}], a:0, e:'Size is non-defining. A big rectangle and a tiny rectangle are both rectangles.', d:'e', h:'Can a square stay a square if you make it bigger?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'What tells you the name of a shape — its sides or its color?', s:_svgTriangle(0), o:[{val:'Its sides — that is the defining attribute'},{val:'Its color — red shapes are triangles',tag:_53CS},{val:'Its color — blue shapes are hexagons',tag:_53CS}], a:0, e:'Sides define the shape name. Color is non-defining and can change.', d:'e', h:'The number of sides is always the key clue.', sk:'sort_shape_attributes', i:_i53DA()},
  // Medium (8)
  {t:'Both a square and a rectangle have ___.', s:_svgRow2(_svgSquSm(),_svgRectSm()), o:[{val:'4 straight sides'},{val:'the same size',tag:_53CS},{val:'the same color',tag:_53CS},{val:'3 sides',tag:_53SC}], a:0, e:'Both a square and a rectangle have 4 straight sides — that is their shared defining attribute.', d:'m', h:'Count the sides on each shape.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Alex says: "This triangle is special because it is yellow." Is color a defining attribute?', s:_svgTriangle(0), o:[{val:'No — color is non-defining; all triangles have 3 sides regardless of color'},{val:'Yes — yellow triangles are a special group',tag:_53CS},{val:'Yes — yellow is a defining attribute',tag:_53CS},{val:'It depends on the shape',tag:_53DA}], a:0, e:'Color is non-defining. All triangles have 3 sides no matter what color they are.', d:'m', h:'Would a green triangle still be a triangle?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'Mia sorts shapes by their SIZE — big or small. Size is a ___ attribute.', s:_svgCircle(), o:[{val:'non-defining — size can change without changing the shape name'},{val:'defining — size tells you the shape',tag:_53CS},{val:'defining — big and small shapes have different names',tag:_53CS}], a:0, e:'Size is non-defining. A big circle and a tiny circle are both circles.', d:'m', h:'Does making a square bigger turn it into a different shape?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A rhombus has 4 sides. A square has 4 sides. Which defining attribute do they share?', s:_svgRow2(_svgRhSm(0),_svgSquSm()), o:[{val:'number of sides — both have 4'},{val:'color — both are the same color',tag:_53CS},{val:'size — both are the same size',tag:_53CS},{val:'direction — both face the same way',tag:_53OR}], a:0, e:'Both a rhombus and a square have 4 sides — that is their shared defining attribute.', d:'m', h:'Focus on the attribute that is always the same for both shapes.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Which attribute is DEFINING for ALL triangles?', s:_svgTriangle(0), o:[{val:'3 sides and 3 corners'},{val:'always green color',tag:_53CS},{val:'always small size',tag:_53CS},{val:'always pointing up',tag:_53OR}], a:0, e:'Every triangle has exactly 3 sides and 3 corners — those are defining attributes.', d:'m', h:'What is true of every single triangle, no matter what?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Shape A has 3 corners. Shape B has 3 corners. What do you know for sure about both?', s:_svgRow2(_svgTriSm(0),_svgTriSm(60)), o:[{val:'Both have 3 corners — that is a defining attribute they share'},{val:'Both are the same color',tag:_53CS},{val:'Both are the same size',tag:_53CS},{val:'Both point the same way',tag:_53OR}], a:0, e:'Having 3 corners is a defining attribute. Color, size, and direction can differ.', d:'m', h:'Focus on what is definitely true about both.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A big hexagon and a tiny hexagon both have ___.', s:_svgRow2(_svgHex(0), _svgHexSm(0)), o:[{val:'6 sides — always true of every hexagon'},{val:'the same color',tag:_53CS},{val:'the same height',tag:_53CS},{val:'4 sides',tag:_53SC}], a:0, e:'Every hexagon has 6 sides, no matter the size.', d:'m', h:'Does making a hexagon smaller change how many sides it has?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Which attribute can CHANGE without changing a triangle\'s name?', s:_svgTriangle(0), o:[{val:'color'},{val:'number of sides',tag:_53DA},{val:'number of corners',tag:_53DA},{val:'whether sides are straight',tag:_53DA}], a:0, e:'Color can change without changing the shape name. Sides and corners define the shape.', d:'m', h:'What is non-defining for a triangle?', sk:'sort_shape_attributes', i:_i53ND()},
  // Hard (4)
  {t:'A student says: "I can tell a square from a circle because of color." Is color a defining attribute?', s:_svgRow2(_svgSquSm(),_svgCircSm()), o:[{val:'No — sides and curves define shapes, not color'},{val:'Yes — squares are always one color',tag:_53CS},{val:'Yes — color is the most important attribute',tag:_53CS},{val:'It depends on the size',tag:_53CS}], a:0, e:'A square has 4 straight sides; a circle has none. Color is non-defining.', d:'h', h:'What really makes a square different from a circle?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Which two shapes share the defining attribute of having 4 sides?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgRhSm(0)), o:[{val:'Square and rhombus'},{val:'Triangle and circle',tag:_53SC},{val:'Circle and hexagon',tag:_53SC},{val:'Triangle and square',tag:_53SC}], a:0, e:'Both a square and a rhombus have 4 sides — that is their shared defining attribute.', d:'h', h:'Count the sides on each shape to find the pair.', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Emma has a red square. Tom has a blue square. Tom says they are different shapes because of color. What is wrong with his thinking?', s:_svgSquare(), o:[{val:'Color is non-defining — both are squares because of their 4 equal sides'},{val:'Tom is right — color defines shapes',tag:_53CS},{val:'Tom is right — red and blue shapes are different',tag:_53CS},{val:'It depends on their sizes',tag:_53CS}], a:0, e:'Both are squares. Color is non-defining — only the number and type of sides matter.', d:'h', h:'What actually defines a square?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A shape has 4 equal sides AND 4 right-angle corners. It is painted purple. A student writes "purple shape" as its name. What is the correct name?', s:_svgSquare(), o:[{val:'Square — 4 equal sides and 4 right-angle corners define a square, not its color'},{val:'Purple square — you must include the color',tag:_53CS},{val:'Diamond — purple shapes are diamonds',tag:_53CS},{val:'Rectangle — any 4-sided shape',tag:_53SC}], a:0, e:'The color is non-defining. 4 equal sides + 4 right-angle corners = square.', d:'h', h:'What are the defining attributes that make a square a square?', sk:'sort_shape_attributes', i:_i53DA()}
];

// ── C2: Non-defining attributes don't change shape name (5E/6M/4H = 15) ──────

var _l53C2 = [
  // Easy (5)
  {t:'A triangle is turned upside down. What is it now?', s:_svgTriangle(180), o:[{val:'Still a triangle'},{val:'An upside-down shape',tag:_53OR},{val:'A different shape',tag:_53OR},{val:'A rectangle',tag:_53OR}], a:0, e:'Turning a shape does not change its name. It still has 3 sides — it is still a triangle.', d:'e', h:'Count the sides. Does turning change that number?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A red square and a blue square are ___ shapes.', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'the same'},{val:'different',tag:_53CS},{val:'opposite',tag:_53CS}], a:0, e:'Color is non-defining. Both have 4 equal sides — both are squares.', d:'e', h:'Does color change the number of sides?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A tiny circle and a huge circle are both called ___.', s:_svgRow2(_svgCircle(), _svgCircSm()), o:[{val:'circles'},{val:'dots',tag:_53CS},{val:'rounds',tag:_53CS},{val:'different shapes',tag:_53CS}], a:0, e:'Size is non-defining. Both are perfectly round with 0 straight sides — both are circles.', d:'e', h:'Does making a circle bigger change what it is?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'Does rotating a hexagon change its name?', s:_svgHex(30), o:[{val:'No — it is still a hexagon with 6 sides'},{val:'Yes — rotated shapes have new names',tag:_53OR},{val:'Yes — the number of sides changes when you rotate',tag:_53OR}], a:0, e:'Rotating a hexagon does not change its name. It still has 6 sides.', d:'e', h:'Count the sides after rotating. Does that number change?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A big rhombus and a small rhombus both have 4 sides. True or false?', s:_svgRow2(_svgRhombus(0), _svgRhSm(0)), o:[{val:'True — size is non-defining; both have 4 sides'},{val:'False — different sizes have different sides',tag:_53CS}], a:0, e:'True. Size is non-defining. Every rhombus has 4 sides no matter how big or small.', d:'e', h:'Does shrinking a rhombus remove any sides?', sk:'sort_shape_attributes', i:_i53ND()},
  // Medium (6)
  {t:'Luis draws a triangle pointing right. Ana draws a triangle pointing left. Are they the same shape?', s:_svgRow2(_svgTriSm(90),_svgTriSm(270)), o:[{val:'Yes — both are triangles; direction does not change the name'},{val:'No — they point differently',tag:_53OR},{val:'No — direction changes the shape name',tag:_53OR},{val:'Maybe — it depends on the color',tag:_53CS}], a:0, e:'Both have 3 sides. Direction is non-defining — they are both triangles.', d:'m', h:'How many sides does each triangle have?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'You make a square bigger. Does it become a rectangle?', s:_svgSquare(), o:[{val:'No'},{val:'Yes',tag:_53CS}], a:0, e:'A square stays a square. Size is non-defining. A square still has 4 equal sides after growing.', d:'m', h:'Does making a square bigger change the lengths of its sides relative to each other?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A green hexagon is painted red. Does the number of sides change?', s:_svgHex(0), o:[{val:'No — color is non-defining; it still has 6 sides'},{val:'Yes — red shapes have 4 sides',tag:_53CS},{val:'Yes — the color changes the sides',tag:_53CS},{val:'It now has 5 sides',tag:_53SC}], a:0, e:'Color is non-defining. Painting a hexagon red does not change its 6 sides.', d:'m', h:'Can paint add or remove sides?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A square is tipped at an angle. What do we call it?', s:_svgRhombus(45), o:[{val:'A square — its 4 equal sides do not change when tilted'},{val:'A diamond — tipped squares become diamonds',tag:_53OR},{val:'A rhombus — any tipped square is a rhombus',tag:_53OR},{val:'A rectangle — tilted shapes become rectangles',tag:_53OR}], a:0, e:'Tipping a square does not change its 4 equal sides. It is still a square.', d:'m', h:'Does tilting change the number or length of the sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'Which of these would change a triangle into a different shape?', s:_svgTriangle(0), o:[{val:'Giving it a 4th side'},{val:'Painting it blue',tag:_53CS},{val:'Making it bigger',tag:_53CS},{val:'Flipping it upside down',tag:_53OR}], a:0, e:'Adding a side changes the shape. Painting, resizing, or flipping are non-defining.', d:'m', h:'What defines a triangle — a change to what would make it NOT a triangle?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A tiny red triangle and a big blue triangle are the same shape. They differ in their ___.', s:_svgRow2(_svgTriangle(0),_svgTriSm(0)), o:[{val:'color and size'},{val:'number of sides',tag:_53DA},{val:'number of corners',tag:_53DA},{val:'shape name',tag:_53DA}], a:0, e:'Color and size are non-defining. Both are triangles — same shape name, same number of sides.', d:'m', h:'What is the same? What is different?', sk:'sort_shape_attributes', i:_i53ND()},
  // Hard (4)
  {t:'A student sees a hexagon tilted at an angle and says: "That is NOT a hexagon because it looks different." What is wrong?', s:_svgHex(15), o:[{val:'Orientation is non-defining — a tilted hexagon is still a hexagon with 6 sides'},{val:'The student is correct — tilted shapes have new names',tag:_53OR},{val:'The shape changed when it tilted',tag:_53OR},{val:'Hexagons cannot be tilted',tag:_53OR}], a:0, e:'Orientation is non-defining. The hexagon still has 6 sides when tilted.', d:'h', h:'Does tilting change the number of sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'Pedro says: "If I paint a square yellow, it becomes a different shape." Is he right?', s:_svgSquare(), o:[{val:'No'},{val:'Yes',tag:_53ND}], a:0, e:'Color is non-defining. A yellow square is still a square with 4 equal sides.', d:'h', h:'What makes a square a square?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'Nia makes a big triangle. Kai makes a tiny triangle. Jade makes a medium triangle. How many triangles are there in all?', s:_svgRow3(_svgTriSm(0),_svgTriSm(0),_svgTriSm(0)), o:[{val:'3 — each shape has 3 sides; size is non-defining'},{val:'1 — only the big one counts',tag:_53CS},{val:'0 — they are all different sizes so different shapes',tag:_53CS},{val:'2 — only big and medium count',tag:_53CS}], a:0, e:'All three are triangles. Size is non-defining.', d:'h', h:'Does size change the name of a triangle?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A shape has 3 sides. It is flipped, painted orange, and shrunk. How many sides does it have now?', s:_svgTriangle(180), o:[{val:'3 — flipping, painting, and shrinking are non-defining'},{val:'0 — flipping removes the sides',tag:_53OR},{val:'4 — painting adds a side',tag:_53CS},{val:'6 — shrinking changes the sides',tag:_53CS}], a:0, e:'Flipping, painting, and changing size are all non-defining. The shape still has 3 sides.', d:'h', h:'Which of those changes is a defining attribute?', sk:'sort_shape_attributes', i:_i53ND()}
];

// ── C3: Sort by sides (7E/8M/5H = 20) ────────────────────────────────────────

var _l53C3 = [
  // Easy (7)
  {t:'Sam is sorting shapes into a 3-sides group. Which shape belongs?', s:_svgRow3(_svgTriSm(0),_svgSquSm(),_svgCircSm()), o:[{val:'Triangle'},{val:'Square',tag:_53SC},{val:'Circle',tag:_53SC},{val:'Hexagon',tag:_53SC}], a:0, e:'A triangle has 3 sides — it belongs in the 3-sides group.', d:'e', h:'Count the sides on each shape.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which shape goes in the 4-sides group?', s:_svgRow3(_svgTriSm(0),_svgRectSm(),_svgCircSm()), o:[{val:'Rectangle'},{val:'Triangle',tag:_53SC},{val:'Circle',tag:_53SC},{val:'Hexagon',tag:_53SC}], a:0, e:'A rectangle has 4 sides — it belongs in the 4-sides group.', d:'e', h:'Count the sides of each shape.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which shape does NOT belong in the all-straight-sides group?', s:_svgRow3(_svgSquSm(),_svgCircSm(),_svgTriSm(0)), o:[{val:'Circle — it has no straight sides'},{val:'Square — it has 4 straight sides',tag:_53WS},{val:'Triangle — it has 3 straight sides',tag:_53WS}], a:0, e:'A circle has no straight sides — it does not belong in the all-straight-sides group.', d:'e', h:'Which shape has a curved side instead of straight sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Max is sorting: shapes with 6 sides in one pile. Where does a hexagon go?', s:_svgHex(0), o:[{val:'6-sides pile — a hexagon has 6 sides'},{val:'All-others pile — hexagons have 4 sides',tag:_53SC},{val:'All-others pile — hexagons have 3 sides',tag:_53SC}], a:0, e:'A hexagon has 6 sides — it goes in the 6-sides pile.', d:'e', h:'Count the sides of a hexagon.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which shape goes in the 0-straight-sides group?', s:_svgRow3(_svgCircSm(),_svgSquSm(),_svgTriSm(0)), o:[{val:'Circle'},{val:'Square',tag:_53SC},{val:'Triangle',tag:_53SC},{val:'Hexagon',tag:_53SC}], a:0, e:'A circle has no straight sides — it belongs in the 0-straight-sides group.', d:'e', h:'Which shape is perfectly round with no straight sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Emma sorts shapes into 3-sides and 4-sides groups. Where does a triangle go?', s:_svgTriangle(0), o:[{val:'3-sides group — a triangle has 3 sides'},{val:'4-sides group — triangles have 4 sides',tag:_53SC},{val:'Neither group — triangles have 6 sides',tag:_53SC}], a:0, e:'A triangle has 3 sides — it goes in the 3-sides group.', d:'e', h:'How many sides does a triangle have?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A square has ___ sides. It belongs in the 4-sides group.', s:_svgSquare(), o:[{val:'4'},{val:'3',tag:_53SC},{val:'6',tag:_53SC},{val:'0',tag:_53SC}], a:0, e:'A square has 4 sides — so it belongs in the 4-sides group.', d:'e', h:'Count the sides of a square.', sk:'sort_shape_attributes', i:_i53SC()},
  // Medium (8)
  {t:'Kate has 3 groups: 3-sides, 4-sides, 6-sides. She looks at a rhombus. Where does it go?', s:_svgRhombus(0), o:[{val:'4-sides group — a rhombus has 4 sides'},{val:'3-sides group — rhombuses have 3 sides',tag:_53SC},{val:'6-sides group — rhombuses have 6 sides',tag:_53SC},{val:'It does not belong in any group',tag:_53WS}], a:0, e:'A rhombus has 4 sides — it goes in the 4-sides group.', d:'m', h:'Count the sides of a rhombus carefully.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort into "more than 4 sides" and "4 or fewer sides." Where does a hexagon go?', s:_svgHex(0), o:[{val:'More than 4 sides — a hexagon has 6 sides'},{val:'4 or fewer sides — hexagons have 4 sides',tag:_53SC},{val:'Neither group',tag:_53WS}], a:0, e:'A hexagon has 6 sides, which is more than 4.', d:'m', h:'Does a hexagon have more than 4 sides or 4 or fewer?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Ali has two groups: shapes with any curved sides, and shapes with all straight sides. Where does a triangle go?', s:_svgTriangle(0), o:[{val:'All-straight-sides group — a triangle has 3 straight sides'},{val:'Curved-sides group — triangles are curved',tag:_53WS},{val:'Both groups',tag:_53WS}], a:0, e:'A triangle has 3 straight sides — it goes in the all-straight-sides group.', d:'m', h:'Does a triangle have any curved sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which two shapes belong in the SAME sides group?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgRectSm()), o:[{val:'Square and rectangle — both have 4 sides'},{val:'Circle and hexagon — both are curved',tag:_53WS},{val:'Triangle and square — both have equal sides',tag:_53SC},{val:'Hexagon and triangle — both point up',tag:_53OR}], a:0, e:'Square and rectangle both have 4 sides — they go in the same group.', d:'m', h:'Which two shapes have the same number of sides?', sk:'sort_shape_attributes', i:_i53SC()},
  {t:'Which shape does NOT belong in the 4-sides group: square, rectangle, hexagon, or rhombus?', s:_svgRow3(_svgSquSm(),_svgHexSm(0),_svgRhSm(0)), o:[{val:'Hexagon — it has 6 sides'},{val:'Square — it has 4 equal sides',tag:_53SC},{val:'Rectangle — it has 4 sides',tag:_53SC},{val:'Rhombus — it has 4 sides',tag:_53SC}], a:0, e:'A hexagon has 6 sides — it does not belong in the 4-sides group.', d:'m', h:'Which shape has a DIFFERENT number of sides from the others?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student says a circle belongs in the 0-straight-sides group. Is the student right?', s:_svgCircle(), o:[{val:'Yes'},{val:'No',tag:_53SC}], a:0, e:'A circle has no straight sides — the student is correct.', d:'m', h:'Does a circle have any straight sides at all?', sk:'sort_shape_attributes', i:_i53SC()},
  {t:'Lucas sorts shapes with the same number of sides together. He puts a square with a rectangle. Is that correct?', s:_svgRow2(_svgSquSm(),_svgRectSm()), o:[{val:'Yes'},{val:'No',tag:_53SC}], a:0, e:'Yes — both a square and a rectangle have 4 sides. They belong in the same group.', d:'m', h:'Count the sides of each shape.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which shape does NOT belong in the all-straight-sides group?', s:_svgRow3(_svgHexSm(0),_svgCircSm(),_svgRhSm(0)), o:[{val:'Circle — it has a curved side, no straight sides'},{val:'Hexagon — it has 6 straight sides',tag:_53WS},{val:'Rhombus — it has 4 straight sides',tag:_53WS}], a:0, e:'A circle has no straight sides — it does not belong in the all-straight-sides group.', d:'m', h:'Which shape has NO straight sides?', sk:'sort_shape_attributes', i:_i53WS()},
  // Hard (5)
  {t:'A 4-sides group has: square, rectangle, rhombus. She wants to add one more shape. Which can she add?', s:_svgRow3(_svgSquSm(),_svgRectSm(),_svgRhSm(0)), o:[{val:'Another rhombus — it also has 4 sides'},{val:'Triangle — it has fewer sides',tag:_53SC},{val:'Hexagon — it has more sides',tag:_53SC},{val:'Circle — it has no sides',tag:_53SC}], a:0, e:'Any shape with 4 sides fits the group. A rhombus has 4 sides.', d:'h', h:'What is the rule for the group?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student removes one shape from the all-straight-sides group: circle, triangle, rectangle, hexagon. Which should she remove?', s:_svgRow3(_svgCircSm(),_svgTriSm(0),_svgRectSm()), o:[{val:'Circle — it has no straight sides'},{val:'Triangle — it has 3 straight sides',tag:_53WS},{val:'Rectangle — it has 4 straight sides',tag:_53WS},{val:'Hexagon — it has 6 straight sides',tag:_53WS}], a:0, e:'A circle has no straight sides — it does not belong in the all-straight-sides group.', d:'h', h:'Which shape breaks the all-straight-sides rule?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sorting rule: shapes with 4 or more sides. Which shapes fit the rule?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgHexSm(0)), o:[{val:'Square (4), rhombus (4), hexagon (6)'},{val:'Only hexagon (6)',tag:_53SC},{val:'Triangle (3) and circle (0)',tag:_53SC},{val:'All shapes',tag:_53SC}], a:0, e:'Shapes with 4 or more sides: square, rectangle, rhombus (4 each) and hexagon (6).', d:'h', h:'Which shapes have 4 or more sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A sort has two groups: 3-sides and 4-sides. A hexagon is left out. Is the hexagon sorted correctly?', s:_svgHex(0), o:[{val:'Yes — hexagon has 6 sides so it does not belong in either group'},{val:'No — hexagon should go in the 4-sides group',tag:_53SC},{val:'No — hexagon should go in the 3-sides group',tag:_53SC}], a:0, e:'A hexagon has 6 sides — it does not belong in the 3-sides OR 4-sides group.', d:'h', h:'How many sides does a hexagon have?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Mia puts a triangle and a hexagon in the same group, but not a square. What could be her sorting rule?', s:_svgRow3(_svgTriSm(0),_svgHexSm(0),_svgSquSm()), o:[{val:'Not a 4-sided shape — triangle has 3 sides, hexagon has 6, square has 4'},{val:'Shapes with even sides — but 3 is odd',tag:_53SC},{val:'Shapes with more than 6 sides — triangle has only 3',tag:_53SC},{val:'Shapes with curved sides — neither has curved sides',tag:_53WS}], a:0, e:'Triangle (3 sides) and hexagon (6 sides) both are NOT 4-sided shapes, but a square (4 sides) is.', d:'h', h:'What do triangle and hexagon have in common that a square does not?', sk:'sort_shape_attributes', i:_i53WS()}
];

// ── C4: Sort by corners/vertices (5E/6M/4H = 15) ─────────────────────────────

var _l53C4 = [
  // Easy (5)
  {t:'A student sorts shapes into a 3-corners group. Which shape belongs?', s:_svgRow3(_svgTriSm(0),_svgSquSm(),_svgCircSm()), o:[{val:'Triangle — it has 3 corners'},{val:'Square — it has 4 corners',tag:_53VC},{val:'Circle — it has 0 corners',tag:_53VC}], a:0, e:'A triangle has 3 corners — it belongs in the 3-corners group.', d:'e', h:'Count the corners (pointy spots) on each shape.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Which shape goes in the 0-corners group?', s:_svgRow3(_svgCircSm(),_svgTriSm(0),_svgSquSm()), o:[{val:'Circle — it has no corners'},{val:'Triangle — it has 3 corners',tag:_53VC},{val:'Square — it has 4 corners',tag:_53VC},{val:'Hexagon — it has 6 corners',tag:_53VC}], a:0, e:'A circle has no corners — it belongs in the 0-corners group.', d:'e', h:'Which shape has no pointy spots?', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Tom sorts shapes into a 4-corners group. Where does a rectangle go?', s:_svgRect(), o:[{val:'4-corners group — a rectangle has 4 corners'},{val:'3-corners group — rectangles have 3 corners',tag:_53VC},{val:'6-corners group — rectangles have 6 corners',tag:_53VC}], a:0, e:'A rectangle has 4 corners — it belongs in the 4-corners group.', d:'e', h:'Count the corners of a rectangle.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'A hexagon has ___ corners. It belongs in the 6-corners group.', s:_svgHex(0), o:[{val:'6'},{val:'4',tag:_53VC},{val:'3',tag:_53VC},{val:'0',tag:_53VC}], a:0, e:'A hexagon has 6 corners — it belongs in the 6-corners group.', d:'e', h:'Count the pointy spots on a hexagon.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Sara sorts shapes: shapes with corners and shapes without corners. Where does a circle go?', s:_svgCircle(), o:[{val:'Shapes without corners — a circle has 0 corners'},{val:'Shapes with corners — circles have 4 corners',tag:_53VC},{val:'Both groups',tag:_53WS}], a:0, e:'A circle has no corners — it belongs in the shapes-without-corners group.', d:'e', h:'Does a circle have any pointy spots?', sk:'sort_shape_attributes', i:_i53VC()},
  // Medium (6)
  {t:'A 4-corners group has: square, rectangle, rhombus. A student adds a triangle. Is the triangle in the right group?', s:_svgTriangle(0), o:[{val:'No'},{val:'Yes',tag:_53VC}], a:0, e:'A triangle has 3 corners — it does not belong in the 4-corners group.', d:'m', h:'How many corners does a triangle have?', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Which two shapes belong in the same corners group?', s:_svgRow3(_svgSquSm(),_svgHexSm(0),_svgRhSm(0)), o:[{val:'Square and rhombus — both have 4 corners'},{val:'Square and hexagon — both are colorful',tag:_53CS},{val:'Hexagon and triangle — both point up',tag:_53OR},{val:'Circle and square — both have no corners',tag:_53VC}], a:0, e:'Square and rhombus both have 4 corners — they go in the same group.', d:'m', h:'Count the corners on each shape. Which two match?', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Jake sorts by corners. He puts square, rectangle, and rhombus in one group. What is his sorting rule?', s:_svgRow3(_svgSquSm(),_svgRectSm(),_svgRhSm(0)), o:[{val:'Shapes with 4 corners'},{val:'Shapes with 6 corners',tag:_53VC},{val:'Shapes with 3 corners',tag:_53VC},{val:'Shapes with 0 corners',tag:_53VC}], a:0, e:'Square, rectangle, and rhombus each have 4 corners — the rule is shapes with 4 corners.', d:'m', h:'Count the corners of each shape in the group.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'A student says a rhombus has MORE corners than a triangle. Is that right?', s:_svgRow2(_svgRhSm(0),_svgTriSm(0)), o:[{val:'Yes'},{val:'No',tag:_53VC}], a:0, e:'A rhombus has 4 corners; a triangle has 3. So yes, a rhombus has more corners.', d:'m', h:'Count the corners on each shape.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Sort into "3 corners" and "not 3 corners." Where do a rhombus and a triangle go?', s:_svgRow2(_svgRhSm(0),_svgTriSm(0)), o:[{val:'Rhombus → not 3 corners (has 4); triangle → 3 corners'},{val:'Both in 3 corners',tag:_53VC},{val:'Both in not 3 corners',tag:_53VC},{val:'Rhombus → 3 corners; triangle → not 3 corners',tag:_53VC}], a:0, e:'A triangle has 3 corners; a rhombus has 4 corners (not 3).', d:'m', h:'Count the corners on each shape.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Which shape does NOT belong in the 4-corners group?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgRectSm()), o:[{val:'Triangle — it has 3 corners, not 4'},{val:'Square — it has 4 corners',tag:_53VC},{val:'Rectangle — it has 4 corners',tag:_53VC}], a:0, e:'A triangle has 3 corners — it does not belong in the 4-corners group.', d:'m', h:'Which shape has a different number of corners?', sk:'sort_shape_attributes', i:_i53VC()},
  // Hard (4)
  {t:'A corners group has: triangle (3), hexagon (6), circle (0). A student says they all share the same corner count. Is she right?', s:_svgRow3(_svgTriSm(0),_svgHexSm(0),_svgCircSm()), o:[{val:'No'},{val:'Yes',tag:_53VC}], a:0, e:'Triangle=3, hexagon=6, circle=0 — they are all different.', d:'h', h:'Count the corners on each shape separately.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Sorting rule: shapes with MORE than 3 corners. Which shapes fit the rule?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgHexSm(0)), o:[{val:'Square (4), rhombus (4), hexagon (6)'},{val:'Only hexagon (6)',tag:_53VC},{val:'Triangle (3)',tag:_53VC},{val:'Circle (0)',tag:_53VC}], a:0, e:'Square and rhombus have 4 corners; hexagon has 6 — all more than 3.', d:'h', h:'Which shapes have more than 3 corners?', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'A student sorts all 6 shapes (circle, triangle, rectangle, square, rhombus, hexagon) by corners. She makes 4 groups: 0, 3, 4, and 6. Which group has the MOST shapes?', s:_svgRow3(_svgSquSm(),_svgRectSm(),_svgRhSm(0)), o:[{val:'4 corners — square, rectangle, and rhombus all have 4 corners'},{val:'6 corners — hexagon, rhombus, and square all have 6',tag:_53VC},{val:'3 corners — triangle, circle, and hexagon all have 3',tag:_53VC}], a:0, e:'Square, rectangle, and rhombus each have 4 corners — the 4-corners group has 3 shapes.', d:'h', h:'Count how many shapes go in each group.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Gina says: "Square and hexagon cannot go in the same corners group because one has 4 corners and the other has 6." Is Gina right?', s:_svgRow2(_svgSquSm(),_svgHexSm(0)), o:[{val:'Yes'},{val:'No',tag:_53VC}], a:0, e:'A square has 4 corners; a hexagon has 6. Different counts → different groups.', d:'h', h:'Count the corners on each shape.', sk:'sort_shape_attributes', i:_i53VC()}
];

// ── C5: Straight vs curved sides (6E/5M/4H = 15) ─────────────────────────────

var _l53C5 = [
  // Easy (6)
  {t:'Which shape has NO straight sides?', s:_svgRow3(_svgCircSm(),_svgTriSm(0),_svgSquSm()), o:[{val:'Circle — it has only a curved side'},{val:'Triangle — it has 3 straight sides',tag:_53WS},{val:'Square — it has 4 straight sides',tag:_53WS}], a:0, e:'A circle has no straight sides — it is all curved.', d:'e', h:'Which shape is perfectly round?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which shape has ALL straight sides?', s:_svgRow3(_svgTriSm(0),_svgCircSm(),_svgRectSm()), o:[{val:'Triangle — all 3 sides are straight'},{val:'Circle — it has no straight sides',tag:_53WS},{val:'Triangle and circle — both have straight sides',tag:_53WS}], a:0, e:'A triangle has 3 straight sides. A circle has no straight sides at all.', d:'e', h:'Which shape has straight lines for all its sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A circle goes in the "curved sides" group. True or false?', s:_svgCircle(), o:[{val:'True — a circle has a curved side, no straight sides'},{val:'False — a circle has 4 straight sides',tag:_53SC}], a:0, e:'True. A circle has no straight sides — only a curved side.', d:'e', h:'Is any part of a circle straight?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A hexagon goes in the "all straight sides" group. True or false?', s:_svgHex(0), o:[{val:'True — a hexagon has 6 straight sides'},{val:'False — hexagons have curved sides',tag:_53WS}], a:0, e:'True. A hexagon has 6 straight sides — no curved sides.', d:'e', h:'Are the sides of a hexagon straight or curved?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which group does a square belong in: all-straight-sides or curved-sides?', s:_svgSquare(), o:[{val:'All-straight-sides — a square has 4 straight sides'},{val:'Curved-sides — squares have curved corners',tag:_53WS},{val:'Both groups — squares have mixed sides',tag:_53WS}], a:0, e:'A square has 4 straight sides — it belongs in the all-straight-sides group.', d:'e', h:'Trace the sides of a square with your finger. Are they straight?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which shape has BOTH a straight side AND a curved side?', s:_svgRow3(_svgCircSm(),_svgTriSm(0),_svgSquSm()), o:[{val:'None of these — circle has only curved, triangle and square have only straight'},{val:'Circle — it has one straight side and one curved side',tag:_53WS},{val:'Triangle — it has one curved side',tag:_53WS}], a:0, e:'None of these: circles have only curved sides; triangles and squares have only straight sides.', d:'e', h:'A circle has only curved. Triangles and squares have only straight.', sk:'sort_shape_attributes', i:_i53WS()},
  // Medium (5)
  {t:'A student sorts: "shapes with at least one straight side." Does a circle belong?', s:_svgCircle(), o:[{val:'No — a circle has no straight sides'},{val:'Yes — circles have 4 straight sides',tag:_53SC},{val:'Yes — circles have 1 straight side',tag:_53WS}], a:0, e:'A circle has no straight sides — it does not belong in the at-least-one-straight-side group.', d:'m', h:'Does a circle have even ONE straight side?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Which two shapes belong in the SAME straight-vs-curved group?', s:_svgRow3(_svgTriSm(0),_svgCircSm(),_svgHexSm(0)), o:[{val:'Triangle and hexagon — both have all straight sides'},{val:'Circle and triangle — both are round',tag:_53WS},{val:'Hexagon and circle — both are colorful',tag:_53CS}], a:0, e:'Triangle and hexagon both have all straight sides — they go in the same group.', d:'m', h:'Which shapes have only straight sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort rule: all straight sides. Which shapes fit: circle, triangle, hexagon, square?', s:_svgRow3(_svgTriSm(0),_svgCircSm(),_svgSquSm()), o:[{val:'Triangle, hexagon, and square — all have only straight sides'},{val:'Circle only — circles have straight sides',tag:_53WS},{val:'All of them',tag:_53WS}], a:0, e:'Circle has no straight sides. Triangle, hexagon, and square all have straight sides only.', d:'m', h:'Which shape is the odd one out?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A shape has 6 straight sides. Does it belong in the "curved sides" group?', s:_svgHex(0), o:[{val:'No'},{val:'Yes',tag:_53WS}], a:0, e:'A hexagon has 6 straight sides — it does not belong in the curved-sides group.', d:'m', h:'Are the sides of a hexagon straight or curved?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Two groups: "all straight" and "any curved." How many of these fit in "all straight": circle, square, rhombus, hexagon?', s:_svgRow3(_svgSquSm(),_svgCircSm(),_svgHexSm(0)), o:[{val:'3 — square, rhombus, and hexagon (circle does not fit)'},{val:'4 — all of them',tag:_53WS},{val:'1 — only hexagon',tag:_53WS}], a:0, e:'Square, rhombus, and hexagon all have straight sides. Circle has only a curved side.', d:'m', h:'Which one has a curved side?', sk:'sort_shape_attributes', i:_i53WS()},
  // Hard (4)
  {t:'A student says: "Triangle and rhombus go in the same straight-sides group, but circle does not." Is she right?', s:_svgRow3(_svgTriSm(0),_svgRhSm(0),_svgCircSm()), o:[{val:'Yes'},{val:'No',tag:_53WS}], a:0, e:'Triangle has 3 straight sides; rhombus has 4 straight sides. Circle has only a curved side.', d:'h', h:'Do triangle and rhombus have any curved sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort these into "curved" and "straight" groups: circle, square, hexagon, triangle. Which shape is in the "curved" group?', s:_svgRow3(_svgCircSm(),_svgSquSm(),_svgHexSm(0)), o:[{val:'Circle only'},{val:'Circle and hexagon',tag:_53WS},{val:'All four shapes',tag:_53WS},{val:'Square only',tag:_53WS}], a:0, e:'Only the circle has a curved side. Square, hexagon, and triangle all have straight sides.', d:'h', h:'Which shapes have only straight sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student says: "All shapes with more than 4 sides have curved sides." Is this true?', s:_svgHex(0), o:[{val:'No'},{val:'Yes',tag:_53WS}], a:0, e:'A hexagon has 6 straight sides — no curved sides. The student is wrong.', d:'h', h:'Look at a hexagon. Are its sides straight or curved?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Zoe sorts shapes: circle in the curved group, square in the straight group, rhombus in the straight group. She is unsure about a hexagon. Where should it go?', s:_svgHex(0), o:[{val:'Straight group — a hexagon has 6 straight sides'},{val:'Curved group — hexagons are round',tag:_53WS},{val:'Both groups — it is a mix',tag:_53WS}], a:0, e:'A hexagon has 6 straight sides — it goes in the all-straight-sides group.', d:'h', h:'Are the sides of a hexagon straight or curved?', sk:'sort_shape_attributes', i:_i53WS()}
];

// ── C6: Orientation doesn't change shape name (5E/6M/4H = 15) ────────────────

var _l53C6 = [
  // Easy (5)
  {t:'A triangle pointing left is still called a ___.', s:_svgTriangle(270), o:[{val:'triangle'},{val:'left-triangle',tag:_53OR},{val:'arrow shape',tag:_53OR},{val:'different shape',tag:_53OR}], a:0, e:'Orientation is non-defining. A triangle pointing left has 3 sides — it is still a triangle.', d:'e', h:'Count the sides. Does direction change that count?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'Does flipping a square upside down change what it is?', s:_svgSquare(), o:[{val:'No — it is still a square with 4 equal sides'},{val:'Yes — a flipped square is a diamond',tag:_53OR},{val:'Yes — it becomes a rhombus',tag:_53OR}], a:0, e:'Flipping is non-defining. A square flipped upside down still has 4 equal sides — it is still a square.', d:'e', h:'Does flipping change the lengths of the sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A hexagon is rotated. What is it now?', s:_svgHex(20), o:[{val:'Still a hexagon — rotating does not change the shape name'},{val:'A different shape — rotating changes the name',tag:_53OR},{val:'An octagon — rotated hexagons become octagons',tag:_53OR}], a:0, e:'Rotating a hexagon does not add or remove sides. It is still a hexagon.', d:'e', h:'Does rotating change the number of sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A rectangle is turned on its side. How many sides does it now have?', s:_svgRect(), o:[{val:'4 — turning does not change the number of sides'},{val:'2 — it only shows 2 sides now',tag:_53OR},{val:'6 — turning adds sides',tag:_53OR}], a:0, e:'Turning a rectangle does not add or remove sides. It still has 4 sides.', d:'e', h:'Can you add sides by turning a shape?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A rhombus is tipped at an angle. What do we call it?', s:_svgRhombus(30), o:[{val:'A rhombus — tipping does not change its 4 sides'},{val:'A square — tipped rhombuses become squares',tag:_53OR},{val:'A diamond — tipped shapes are called diamonds',tag:_53OR}], a:0, e:'Tipping a rhombus does not change its 4 sides. It is still a rhombus.', d:'e', h:'Does tipping change what a rhombus is?', sk:'sort_shape_attributes', i:_i53OR()},
  // Medium (6)
  {t:'A student sorts triangles by which way they point: up, down, or sideways. Is direction a valid sorting attribute?', s:_svgRow3(_svgTriSm(0),_svgTriSm(180),_svgTriSm(90)), o:[{val:'Yes — direction can be used for sorting, but it is non-defining for the shape name'},{val:'No — you cannot sort by direction at all',tag:_53WS},{val:'Yes — and direction changes the shape name',tag:_53OR}], a:0, e:'Direction can be used as a sorting attribute, but it does NOT change the shape name.', d:'m', h:'Can you sort by direction? Does sorting by direction change the shape name?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'Lily sees a hexagon turned 30 degrees and says it is a different shape. What is wrong?', s:_svgHex(30), o:[{val:'Orientation is non-defining — a turned hexagon is still a hexagon with 6 sides'},{val:'She is right — turned shapes have new names',tag:_53OR},{val:'She is right — turning changes the number of sides',tag:_53OR}], a:0, e:'Turning a hexagon does not change its 6 sides. Orientation is non-defining.', d:'m', h:'Count the sides of the turned hexagon.', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'Two triangles face opposite directions. A student puts them in different groups. What attribute is she sorting by?', s:_svgRow2(_svgTriSm(0),_svgTriSm(180)), o:[{val:'Orientation — she is sorting by which way they point'},{val:'Number of sides — she is sorting by sides',tag:_53DA},{val:'Color — she is sorting by color',tag:_53CS}], a:0, e:'She is sorting by orientation (which way they point). Both are still triangles.', d:'m', h:'What is different about the two triangles?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A square turned 45 degrees looks like a diamond. Is it still a square?', s:_svgSquare(), o:[{val:'Yes — turning does not change its 4 equal sides'},{val:'No — it becomes a diamond when turned 45 degrees',tag:_53OR},{val:'No — it becomes a rhombus when turned',tag:_53OR}], a:0, e:'Turning a square 45 degrees does not change its 4 equal sides. It is still a square.', d:'m', h:'Does rotating change the number or equality of the sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A teacher shows a triangle and says: "The pointy end goes to the left now. What is its new name?" What should students answer?', s:_svgTriangle(270), o:[{val:'It has no new name — it is still a triangle'},{val:'Left-triangle',tag:_53OR},{val:'Arrow',tag:_53OR},{val:'Rectangle',tag:_53OR}], a:0, e:'Orientation is non-defining. The shape still has 3 sides — it is still a triangle.', d:'m', h:'Does pointing left give a shape a new name?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A student sorts shapes into groups based on which direction they point. She puts all upward-pointing triangles in one group. All shapes in her groups are ___.', s:_svgRow3(_svgTriSm(0),_svgTriSm(0),_svgTriSm(0)), o:[{val:'still triangles — direction is non-defining'},{val:'different shapes because they point the same way',tag:_53OR},{val:'not triangles — grouped by direction',tag:_53OR}], a:0, e:'All are still triangles. She is sorting by direction (non-defining), not changing the shape name.', d:'m', h:'Does sorting by direction change what the shapes are called?', sk:'sort_shape_attributes', i:_i53OR()},
  // Hard (4)
  {t:'A student says: "A triangle pointing down is NOT a triangle. Triangles always point up." What defining attribute proves the student wrong?', s:_svgTriangle(180), o:[{val:'Number of sides — a downward triangle still has 3 sides'},{val:'Color — the color did not change',tag:_53CS},{val:'Size — the size did not change',tag:_53CS}], a:0, e:'A triangle is defined by its 3 sides, not its direction. Pointing down does not change the side count.', d:'h', h:'What defines a triangle?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Sorting rule: "shapes with the same number of sides go together." Triangles in three different orientations (up, down, left) — do they go in the same group?', s:_svgRow3(_svgTriSm(0),_svgTriSm(180),_svgTriSm(90)), o:[{val:'Yes — all three have 3 sides; direction is non-defining'},{val:'No — each direction is a different group',tag:_53OR},{val:'No — only upward triangles go together',tag:_53OR}], a:0, e:'All three triangles have 3 sides. When sorting by sides, they all go in the same group.', d:'h', h:'How many sides does each triangle have?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'Marco says: "A square tilted at 45 degrees belongs in the rhombus group." Bea says: "It belongs in the square group." Who is right?', s:_svgSquare(), o:[{val:'Bea — a tilted square still has 4 equal sides; tilting does not change the shape'},{val:'Marco — tilting 45 degrees turns a square into a rhombus',tag:_53OR},{val:'Both are right — tilted squares are squares AND rhombuses',tag:_53OR}], a:0, e:'Tilting is non-defining. A square tilted at 45 degrees still has 4 equal sides — it is still a square.', d:'h', h:'Does tilting change the lengths of a square\'s sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A student sees a hexagon at 0 degrees, 30 degrees, and 60 degrees and says each one is a different shape. What is wrong?', s:_svgRow3(_svgHexSm(0),_svgHexSm(30),_svgHexSm(60)), o:[{val:'Orientation is non-defining — all three are hexagons with 6 sides'},{val:'The student is right — each rotation creates a new shape',tag:_53OR},{val:'The student is right — each shape has a different name',tag:_53OR}], a:0, e:'All three are hexagons. Rotation does not change the number of sides.', d:'h', h:'Count the sides of each rotated shape.', sk:'sort_shape_attributes', i:_i53OR()}
];

// ── C7: Size doesn't change shape name (4E/3M/3H = 10) ───────────────────────

var _l53C7 = [
  // Easy (4)
  {t:'A tiny square and a giant square are both called ___.', s:_svgRow2(_svgSquare(), _svgSquSm()), o:[{val:'squares'},{val:'different shapes',tag:_53CS},{val:'rectangles',tag:_53CS}], a:0, e:'Size is non-defining. Both have 4 equal sides — both are squares.', d:'e', h:'Does size change the number of sides?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'Does making a triangle bigger change its shape name?', s:_svgRow2(_svgTriangle(0), _svgTriSm(0)), o:[{val:'No — it is still a triangle'},{val:'Yes — big triangles have a different name',tag:_53CS},{val:'Yes — it becomes a rectangle',tag:_53CS}], a:0, e:'Size is non-defining. A big triangle still has 3 sides — it is still a triangle.', d:'e', h:'Does size change the number of sides?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'A small circle and a big circle are ___.', s:_svgRow2(_svgCircle(), _svgCircSm()), o:[{val:'the same shape — both are circles'},{val:'different shapes — different sizes',tag:_53CS},{val:'one is a circle, one is an oval',tag:_53CS}], a:0, e:'Both are circles. Size is non-defining — it does not change the shape name.', d:'e', h:'Does growing a circle give it sides?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'Which is true: "A large hexagon and a tiny hexagon are both hexagons" or "Big hexagons have more sides than small hexagons"?', s:_svgRow2(_svgHex(0), _svgHexSm(0)), o:[{val:'A large hexagon and a tiny hexagon are both hexagons'},{val:'Big hexagons have more sides than small hexagons',tag:_53CS}], a:0, e:'Size is non-defining. Every hexagon has 6 sides no matter the size.', d:'e', h:'Does making a hexagon bigger add sides?', sk:'sort_shape_attributes', i:_i53CS()},
  // Medium (3)
  {t:'Ben draws a rhombus. Then he makes it 10 times bigger. He now has a ___.', s:_svgRow2(_svgRhSm(0), _svgRhombus(0)), o:[{val:'rhombus — size is non-defining'},{val:'square — big rhombuses become squares',tag:_53CS},{val:'rectangle — bigger shapes become rectangles',tag:_53CS}], a:0, e:'Making a rhombus bigger does not change its 4 sides. It is still a rhombus.', d:'m', h:'Does making a rhombus bigger change its 4 sides?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'A student sorts shapes by size: big and small. She puts a big circle and a small circle in different groups. Is she right to say they are different shapes?', s:_svgRow2(_svgCircle(), _svgCircSm()), o:[{val:'No'},{val:'Yes',tag:_53CS}], a:0, e:'Both are circles. She can sort by size, but they are still the same type of shape.', d:'m', h:'Does size change the shape name?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'Which attribute is NON-DEFINING for a square?', s:_svgSquare(), o:[{val:'size — you can change the size without changing its name'},{val:'number of sides — 4 sides is defining',tag:_53DA},{val:'equal sides — the sides being equal is defining',tag:_53DA}], a:0, e:'Size is non-defining. The number of sides and equal-length sides define a square.', d:'m', h:'What can change about a square without changing its name?', sk:'sort_shape_attributes', i:_i53ND()},
  // Hard (3)
  {t:'A student says: "I have two shapes. One is a big triangle and one is a small triangle. They are DIFFERENT shapes because they are different sizes." What is wrong?', s:_svgRow2(_svgTriangle(0),_svgTriSm(0)), o:[{val:'Size is non-defining — both are triangles with 3 sides'},{val:'The student is right — size defines shapes',tag:_53CS},{val:'The student is right — big triangles are trapezoids',tag:_53CS}], a:0, e:'Size is non-defining. Both are triangles with 3 sides.', d:'h', h:'What defines a triangle?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'Which defining attribute stays the same when you change the SIZE of a hexagon?', s:_svgHex(0), o:[{val:'6 sides and 6 corners — those are defining attributes that do not change'},{val:'The direction it faces — direction is a defining attribute',tag:_53OR},{val:'The color — color stays the same',tag:_53CS}], a:0, e:'No matter the size, a hexagon always has 6 sides and 6 corners.', d:'h', h:'What is always true about a hexagon, big or small?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A class makes a tiny square from cardboard and a giant square on the floor. A student says: "They cannot be in the same shape group." Is the student right?', s:_svgRow2(_svgSquare(), _svgSquSm()), o:[{val:'No'},{val:'Yes',tag:_53CS}], a:0, e:'Size is non-defining. Both have 4 equal sides — both are squares.', d:'h', h:'Does size change what makes a square a square?', sk:'sort_shape_attributes', i:_i53CS()}
];

// ── C8: 2D vs 3D sorting (3E/4M/3H = 10) ─────────────────────────────────────

var _l53C8 = [
  // Easy (3)
  {t:'A circle is a flat shape drawn on paper. What kind of shape is it?', s:_svgCircle(), o:[{val:'2D — flat shape'},{val:'3D — solid shape',tag:_53TD},{val:'4D — special shape',tag:_53TD}], a:0, e:'A circle is flat. Flat shapes drawn on paper are 2D shapes.', d:'e', h:'Can you pick up a circle drawn on paper?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'A sphere is a solid round ball you can hold. What kind of shape is it?', s:_svgCircle(), o:[{val:'3D — a solid you can hold'},{val:'2D — flat shape',tag:_53TD},{val:'A circle because it is round',tag:_53TD}], a:0, e:'A sphere is a 3D solid. You can pick it up and hold it.', d:'e', h:'Can you pick up a sphere?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'Which of these is a FLAT 2D shape?', s:_svgRow3(_svgCircSm(),_svgTriSm(0),_svgSquSm()), o:[{val:'Circle, triangle, and square — all are flat 2D shapes'},{val:'Only circle — the others are 3D',tag:_53TD},{val:'None — all shapes are 3D',tag:_53TD}], a:0, e:'Circle, triangle, and square are all flat 2D shapes.', d:'e', h:'Which ones are flat drawings?', sk:'sort_shape_attributes', i:_i53TD()},
  // Medium (4)
  {t:'A student sorts: circle in the 2D group, cube in the 3D group. She looks at a square. Where does it go?', s:_svgSquare(), o:[{val:'2D group — a square is a flat shape'},{val:'3D group — a square is a solid',tag:_53TD},{val:'Neither group',tag:_53TD}], a:0, e:'A square is a flat 2D shape — it goes in the 2D group.', d:'m', h:'Is a square flat or solid?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'A circle is 2D and a sphere is 3D. What is the key difference?', s:_svgCircle(), o:[{val:'A circle is flat (2D); a sphere is solid and round in every direction (3D)'},{val:'A circle is bigger than a sphere',tag:_53CS},{val:'They are the same shape, just different sizes',tag:_53CS}], a:0, e:'A circle is a flat 2D shape. A sphere is a solid 3D object you can hold.', d:'m', h:'Can you pick up a circle drawn on paper?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'Which two belong in the 2D-shapes group?', s:_svgRow3(_svgCircSm(),_svgSquSm(),_svgTriSm(0)), o:[{val:'All three — circle, square, and triangle are all flat 2D shapes'},{val:'Only circle — triangles and squares are 3D',tag:_53TD},{val:'None — all shapes are 3D if they are colorful',tag:_53TD}], a:0, e:'Circle, square, and triangle are all flat 2D shapes.', d:'m', h:'Which shapes are flat drawings?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'A cube has 6 square faces. Is a cube a 2D shape or a 3D solid?', s:_svgSquare(), o:[{val:'3D solid — a cube has depth and you can hold it'},{val:'2D shape — it is made of squares',tag:_53TD},{val:'2D shape — it has flat faces',tag:_53TD}], a:0, e:'A cube is a 3D solid. Even though its faces are squares (2D), the cube itself is 3D.', d:'m', h:'Can you pick up a cube?', sk:'sort_shape_attributes', i:_i53TD()},
  // Hard (3)
  {t:'A student says: "A rectangle and a rectangular prism are the same shape because they both have rectangles." What is wrong?', s:_svgRect(), o:[{val:'A rectangle is a flat 2D shape; a rectangular prism is a 3D solid — they are different'},{val:'The student is right — both have rectangles so they are the same',tag:_53TD},{val:'The student is right — 2D and 3D shapes have the same name',tag:_53TD}], a:0, e:'A rectangle is flat (2D). A rectangular prism is a 3D solid. They are related but not the same shape.', d:'h', h:'Is a rectangle flat or solid?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'Sort: flat 2D group vs solid 3D group. Where does a hexagon go?', s:_svgHex(0), o:[{val:'2D group — a hexagon is a flat shape'},{val:'3D group — hexagons are solid',tag:_53TD},{val:'Neither group — hexagons are special',tag:_53TD}], a:0, e:'A hexagon is a flat 2D shape — it goes in the 2D group.', d:'h', h:'Is a hexagon flat or solid?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'A teacher draws a circle on the board. A student holds a ball. They both have a round shape. Are they the same type of shape?', s:_svgCircle(), o:[{val:'No — the circle on the board is 2D (flat); the ball is a sphere, which is 3D (solid)'},{val:'Yes — both are round so they are the same type',tag:_53TD},{val:'Yes — circles and spheres are the same',tag:_53TD}], a:0, e:'The drawn circle is a 2D flat shape. The ball is a 3D sphere. Round but different types.', d:'h', h:'Is a drawing flat or solid?', sk:'sort_shape_attributes', i:_i53TD()}
];

// ── C9: Mixed sort — two attributes (6E/8M/6H = 20) ──────────────────────────

var _l53C9 = [
  // Easy (6)
  {t:'Sort by sides AND by straight vs curved. A triangle goes in which group?', s:_svgTriangle(0), o:[{val:'3-straight-sides group'},{val:'0-curved-sides group',tag:_53WS},{val:'4-straight-sides group',tag:_53SC}], a:0, e:'A triangle has 3 sides and they are all straight — it goes in the 3-straight-sides group.', d:'e', h:'How many sides? Are they straight or curved?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by size and by sides. A big triangle and a small triangle go in the ___ group when sorting by sides.', s:_svgRow2(_svgTriangle(0),_svgTriSm(0)), o:[{val:'same group — both have 3 sides'},{val:'different groups — big goes in one, small in another',tag:_53CS},{val:'different groups — bigger triangle has more sides',tag:_53SC}], a:0, e:'When sorting by sides, both go in the same group — both have 3 sides. Size is non-defining for this attribute.', d:'e', h:'When sorting by sides, does size matter?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by corners. A circle and a square go in ___ groups.', s:_svgRow2(_svgCircSm(),_svgSquSm()), o:[{val:'different groups — circle has 0 corners, square has 4'},{val:'the same group — both have 4 corners',tag:_53VC},{val:'the same group — both are shapes',tag:_53WS}], a:0, e:'A circle has 0 corners. A square has 4 corners. They go in different groups.', d:'e', h:'Count the corners of each shape.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Sort by straight vs curved, and by 2D vs 3D. A square is ___.', s:_svgSquare(), o:[{val:'flat 2D with all straight sides'},{val:'solid 3D with curved sides',tag:_53TD},{val:'flat 2D with curved sides',tag:_53WS}], a:0, e:'A square is a flat 2D shape with 4 straight sides.', d:'e', h:'Is a square flat or solid? Are its sides straight or curved?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by color AND by sides. A blue triangle and a red triangle go in the ___ sides group.', s:_svgRow2(_svgTriSm(0),_svgTriSm(0)), o:[{val:'same — both have 3 sides (color is non-defining)'},{val:'different — blue and red means different sides',tag:_53CS},{val:'different — different colors make different groups',tag:_53CS}], a:0, e:'Color is non-defining. When sorting by sides, both go in the 3-sides group.', d:'e', h:'Does color change the number of sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by corners and by orientation. A triangle pointing up and a triangle pointing down — do they share a corners group?', s:_svgRow2(_svgTriSm(0),_svgTriSm(180)), o:[{val:'Yes — both have 3 corners; orientation is non-defining for corners'},{val:'No — they point different ways so different corners group',tag:_53OR},{val:'No — pointing down gives extra corners',tag:_53OR}], a:0, e:'Orientation is non-defining. Both triangles have 3 corners — they share the 3-corners group.', d:'e', h:'Does orientation change the number of corners?', sk:'sort_shape_attributes', i:_i53OR()},
  // Medium (8)
  {t:'Two sort rules: by sides and by 2D vs 3D. A hexagon goes in which two groups?', s:_svgHex(0), o:[{val:'6-sides group and 2D group'},{val:'6-sides group and 3D group',tag:_53TD},{val:'4-sides group and 2D group',tag:_53SC}], a:0, e:'A hexagon has 6 sides (6-sides group) and is a flat shape (2D group).', d:'m', h:'How many sides does a hexagon have? Is it flat or solid?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student sorts by sides AND by straight vs curved. She puts square and rectangle together. What is her rule?', s:_svgRow2(_svgSquSm(),_svgRectSm()), o:[{val:'4 straight sides — both have 4 straight sides'},{val:'0 curved sides and 3 straight sides',tag:_53SC},{val:'6 straight sides — both have 6 sides',tag:_53SC}], a:0, e:'Square and rectangle both have 4 straight sides — that is the rule.', d:'m', h:'How many straight sides do both have?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by corners and by straight vs curved. A circle goes in ___.', s:_svgCircle(), o:[{val:'0-corners group and curved-sides group'},{val:'0-corners group and straight-sides group',tag:_53WS},{val:'4-corners group and curved-sides group',tag:_53VC}], a:0, e:'A circle has 0 corners and only a curved side — it goes in both the 0-corners group and curved-sides group.', d:'m', h:'How many corners? Straight or curved sides?', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'Sort by size and by 2D vs 3D. A tiny hexagon and a giant hexagon go in ___ groups.', s:_svgRow2(_svgHex(0), _svgHexSm(0)), o:[{val:'the same 2D group — size is non-defining for flat vs solid'},{val:'different groups — tiny is 2D and giant is 3D',tag:_53TD},{val:'different groups — giants are always 3D',tag:_53TD}], a:0, e:'Both are flat 2D shapes. Size does not determine 2D vs 3D.', d:'m', h:'Is size what makes a shape 2D or 3D?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'Three sort attributes: color, sides, and corners. Which two attributes are DEFINING for a triangle?', s:_svgTriangle(0), o:[{val:'sides (3) and corners (3)'},{val:'color and sides',tag:_53CS},{val:'color and corners',tag:_53CS}], a:0, e:'Sides and corners are defining. Color is non-defining.', d:'m', h:'Which attributes can NEVER change without changing the triangle into a different shape?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'Sort by orientation and by sides. A triangle pointing right has ___ sides and goes in the ___ group when sorting by sides.', s:_svgTriangle(90), o:[{val:'3 sides — goes in the 3-sides group (orientation is non-defining)'},{val:'2 sides — pointing right removes a side',tag:_53OR},{val:'4 sides — pointing sideways adds a side',tag:_53OR}], a:0, e:'A triangle pointing right still has 3 sides. Orientation does not change side count.', d:'m', h:'Does pointing right change the number of sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A student makes two groups: "4-sided shapes" and "not 4-sided shapes." She puts square, rectangle, and rhombus in the 4-sided group and triangle and hexagon in the not-4-sided group. Is she right?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgHexSm(0)), o:[{val:'Yes'},{val:'No',tag:_53SC}], a:0, e:'Square, rectangle, rhombus: 4 sides each. Triangle: 3 sides. Hexagon: 6 sides. The student is correct.', d:'m', h:'Count the sides of each shape.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by two attributes: number of sides AND orientation. Which two triangles go in the SAME sides group?', s:_svgRow3(_svgTriSm(0),_svgSquSm(),_svgTriSm(180)), o:[{val:'First triangle (pointing up) and third triangle (pointing down) — both have 3 sides'},{val:'First triangle and square — both point up',tag:_53OR},{val:'Square and third triangle — both are shapes',tag:_53WS}], a:0, e:'When sorting by sides, both triangles (pointing up and pointing down) go in the 3-sides group.', d:'m', h:'Which shapes have the same number of sides?', sk:'sort_shape_attributes', i:_i53WS()},
  // Hard (6)
  {t:'Sort by ALL THREE: sides, corners, and whether sides are straight or curved. A rhombus belongs in: ___.', s:_svgRhombus(0), o:[{val:'4-sides, 4-corners, all-straight-sides groups'},{val:'4-sides, 0-corners, curved-sides groups',tag:_53VC},{val:'3-sides, 3-corners, all-straight-sides groups',tag:_53SC}], a:0, e:'A rhombus has 4 straight sides and 4 corners.', d:'h', h:'Count sides, count corners, check if sides are straight.', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Two shapes share the 4-sides group AND the all-straight-sides group. Which pair is it?', s:_svgRow3(_svgSquSm(),_svgCircSm(),_svgRectSm()), o:[{val:'Square and rectangle — both have 4 straight sides'},{val:'Circle and square — both are shapes',tag:_53WS},{val:'Circle and rectangle — both have sides',tag:_53WS}], a:0, e:'Square and rectangle both have 4 straight sides — they share both groups.', d:'h', h:'Which shapes have 4 straight sides?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A sort rule is: "shapes with straight sides only AND more than 3 sides." Which shapes fit?', s:_svgRow3(_svgSquSm(),_svgTriSm(0),_svgHexSm(0)), o:[{val:'Square (4 straight), rhombus (4 straight), hexagon (6 straight)'},{val:'Triangle (3 straight)',tag:_53SC},{val:'Circle (no straight sides)',tag:_53WS}], a:0, e:'Square, rhombus, and hexagon have all straight sides and more than 3 sides. Triangle has only 3 sides.', d:'h', h:'Which shapes have straight sides AND more than 3 of them?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student sorts by sides and by 2D vs 3D and says: "circle (2D, 0 sides) and square (2D, 4 sides) go in the same group because both are 2D." Is her reasoning correct?', s:_svgRow2(_svgCircSm(),_svgSquSm()), o:[{val:'Yes'},{val:'No',tag:_53TD}], a:0, e:'Both are 2D shapes — they share the 2D group. But for sides, circle (0) and square (4) go in different groups.', d:'h', h:'What attribute does "both are flat" apply to?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Three students each sort the same 6 shapes differently: by sides, by corners, and by straight vs curved. Which student\'s groups will circle and square NEVER share?', s:_svgRow2(_svgCircSm(),_svgSquSm()), o:[{val:'Both sides groups AND corners groups — circle has 0, square has 4'},{val:'Only the corners group',tag:_53VC},{val:'Only the sides group',tag:_53SC}], a:0, e:'Circle has 0 sides and 0 corners. Square has 4 sides and 4 corners. They share no sides or corners group. They also differ on curved vs straight.', d:'h', h:'Count sides and corners for each. Do they ever match?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'Sort by: 2D vs 3D, number of sides, and orientation. A tilted hexagon (30°) compared to an upright hexagon — which groups do they share?', s:_svgRow2(_svgHexSm(0),_svgHexSm(30)), o:[{val:'Both share 2D and 6-sides groups; they differ only in orientation group'},{val:'They share no groups — orientation changes everything',tag:_53OR},{val:'They share only the orientation group',tag:_53OR}], a:0, e:'Both hexagons are 2D and both have 6 sides. They only differ in the orientation group.', d:'h', h:'What is the same between the two hexagons? What differs?', sk:'sort_shape_attributes', i:_i53OR()}
];

// ── C10: Error repair (1E/11M/8H = 20) ───────────────────────────────────────

var _l53C10 = [
  // Easy (1)
  {t:'A student says: "This is NOT a triangle because it is pointing down." What is wrong?', s:_svgTriangle(180), o:[{val:'Orientation is non-defining — a downward triangle is still a triangle'},{val:'The student is right — triangles always point up',tag:_53OR},{val:'The student is right — pointing down makes it a different shape',tag:_53OR}], a:0, e:'Orientation is non-defining. A triangle pointing down still has 3 sides.', d:'e', h:'Does pointing down change the number of sides?', sk:'sort_shape_attributes', i:_i53OR()},
  // Medium (11)
  {t:'A student says: "This shape has 3 corners so it goes in the 4-corners group." What error did the student make?', s:_svgTriangle(0), o:[{val:'Wrong sort category — 3 corners belongs in the 3-corners group, not the 4-corners group'},{val:'No error — 3 corners is close enough to 4',tag:_53VC},{val:'The shape should be in the 6-corners group',tag:_53VC}], a:0, e:'3 corners belongs in the 3-corners group — the student put it in the wrong group.', d:'m', h:'Does 3 corners match the 4-corners group?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student says: "Color is a defining attribute — all blue shapes are circles." What is wrong?', s:_svgCircle(), o:[{val:'Color is non-defining — the shape name comes from sides and corners, not color'},{val:'The student is right — color defines shapes',tag:_53CS},{val:'The student is right — blue shapes are always circles',tag:_53CS}], a:0, e:'Color is non-defining. A circle is defined by having 0 straight sides, not by being blue.', d:'m', h:'What defines a shape — sides or color?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A student puts a circle in the 4-sides group. What error did the student make?', s:_svgCircle(), o:[{val:'A circle has 0 straight sides — it belongs in the 0-sides or curved group, not the 4-sides group'},{val:'No error — circles have 4 curved sides',tag:_53SC},{val:'No error — circles are the same as squares',tag:_53WS}], a:0, e:'A circle has no straight sides. Putting it in the 4-sides group is a sorting error.', d:'m', h:'How many straight sides does a circle have?', sk:'sort_shape_attributes', i:_i53SC()},
  {t:'A student says: "I turned a triangle upside down and now it is an arrow." What error was made?', s:_svgTriangle(180), o:[{val:'Orientation error — turning a triangle upside down does not change its name; it is still a triangle'},{val:'No error — upside-down triangles are arrows',tag:_53OR},{val:'No error — arrows have 3 sides like triangles',tag:_53OR}], a:0, e:'Turning a triangle does not change its name. Orientation is non-defining.', d:'m', h:'What do we call a shape based on — orientation or number of sides?', sk:'sort_shape_attributes', i:_i53OR()},
  {t:'A student says a hexagon has 4 sides and puts it in the 4-sides group. What error did the student make?', s:_svgHex(0), o:[{val:'Counting error — a hexagon has 6 sides, not 4; it belongs in the 6-sides group'},{val:'No error — hexagons have 4 sides',tag:_53SC},{val:'No error — hexagons and squares are the same',tag:_53WS}], a:0, e:'A hexagon has 6 sides — not 4. It goes in the 6-sides group.', d:'m', h:'Count the sides of a hexagon carefully.', sk:'sort_shape_attributes', i:_i53SC()},
  {t:'A student puts a square and a circle in the same group and says: "both are 2D shapes." Is this correct?', s:_svgRow2(_svgSquSm(),_svgCircSm()), o:[{val:'Yes'},{val:'No',tag:_53TD}], a:0, e:'Both a square and a circle are flat 2D shapes — they correctly share the 2D group.', d:'m', h:'Is a square flat or solid? Is a circle flat or solid?', sk:'sort_shape_attributes', i:_i53TD()},
  {t:'A student says: "A big hexagon and a small hexagon are different shapes because they are different sizes." What is wrong?', s:_svgRow2(_svgHex(0), _svgHexSm(0)), o:[{val:'Size is non-defining — both are hexagons with 6 sides'},{val:'The student is right — size defines shapes',tag:_53CS},{val:'The student is right — big hexagons are heptagons',tag:_53CS}], a:0, e:'Size is non-defining. Both have 6 sides — both are hexagons.', d:'m', h:'Does size change the number of sides?', sk:'sort_shape_attributes', i:_i53CS()},
  {t:'A student sorts by corners and puts a triangle in the 4-corners group. What error was made?', s:_svgTriangle(0), o:[{val:'Counting error — a triangle has 3 corners, not 4'},{val:'Color error — the student sorted by color',tag:_53CS},{val:'Size error — the student sorted by size',tag:_53CS}], a:0, e:'A triangle has 3 corners — it belongs in the 3-corners group, not the 4-corners group.', d:'m', h:'Count the corners (pointy spots) of a triangle.', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'A student says: "This shape is special because it is the biggest in the group." Size is a ___ attribute.', s:_svgHex(0), o:[{val:'non-defining — size does not determine the shape name'},{val:'defining — the biggest shape is always a hexagon',tag:_53CS},{val:'defining — size tells you the shape',tag:_53CS}], a:0, e:'Size is non-defining. A shape\'s name comes from its sides and corners, not its size.', d:'m', h:'Does being the biggest change what a shape is called?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A student puts a rhombus in the 3-sides group because "it looks like it could be 3-sided." What error was made?', s:_svgRhombus(0), o:[{val:'Counting error — a rhombus has 4 sides, not 3; it belongs in the 4-sides group'},{val:'No error — rhombuses can have 3 sides',tag:_53SC},{val:'No error — "looks like" is good enough for sorting',tag:_53WS}], a:0, e:'A rhombus has 4 sides — it belongs in the 4-sides group, not the 3-sides group.', d:'m', h:'Count the sides of a rhombus carefully.', sk:'sort_shape_attributes', i:_i53SC()},
  {t:'A student says: "A square turned 45 degrees is a diamond — a different shape." What error was made?', s:_svgSquare(), o:[{val:'Orientation error — a tilted square is still a square; orientation is non-defining'},{val:'No error — tilted squares are called diamonds',tag:_53OR},{val:'No error — 45 degrees creates a new shape',tag:_53OR}], a:0, e:'Orientation is non-defining. A tilted square still has 4 equal sides — it is still a square.', d:'m', h:'Does tilting change the length of a square\'s sides?', sk:'sort_shape_attributes', i:_i53OR()},
  // Hard (8)
  {t:'A student says: "Rectangle and rhombus belong in the same group because they are both colorful." What is wrong with this reasoning?', s:_svgRow2(_svgRectSm(),_svgRhSm(0)), o:[{val:'Color is non-defining — while both do have 4 sides, "colorful" is not a valid sorting attribute'},{val:'No error — colorful is a valid attribute',tag:_53CS},{val:'No error — both are the same shape',tag:_53WS}], a:0, e:'Color is non-defining. "Colorful" is not a sorting attribute for shape groups. Though both have 4 sides, that would be the valid reason.', d:'h', h:'Is color a defining attribute?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A student puts hexagon in the 4-sides group and triangle in the 6-sides group. What two errors were made?', s:_svgRow2(_svgHexSm(0),_svgTriSm(0)), o:[{val:'Both are counting errors — hexagon has 6 sides (not 4); triangle has 3 sides (not 6)'},{val:'Only the hexagon is wrong',tag:_53SC},{val:'Only the triangle is wrong',tag:_53SC}], a:0, e:'Hexagon has 6 sides — wrong group. Triangle has 3 sides — wrong group. Both are in the wrong place.', d:'h', h:'Count the sides of each shape carefully.', sk:'sort_shape_attributes', i:_i53SC()},
  {t:'A student sorts shapes into defining and non-defining groups. She puts "3 sides" in the non-defining group. What is wrong?', s:_svgTriangle(0), o:[{val:'3 sides is a defining attribute — it always tells you a shape is a triangle'},{val:'No error — sides are non-defining',tag:_53DA},{val:'No error — defining and non-defining are the same thing',tag:_53DA}], a:0, e:'Number of sides is a defining attribute. It ALWAYS tells you the shape name.', d:'h', h:'Does the number of sides ever change for a triangle?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A student says: "I sorted correctly because I put all the blue shapes in the same group." A teacher asks: "But are the blue shapes all the same TYPE of shape?" The student says yes. Who is right?', s:_svgRow3(_svgTriSm(0),_svgSquSm(),_svgCircSm()), o:[{val:'The teacher is asking the right question — sorting by color does not mean shapes are the same type'},{val:'The student is right — all blue shapes are the same type',tag:_53CS},{val:'Both are wrong — color and type are both wrong',tag:_53CS}], a:0, e:'Sorting by color does not mean shapes are the same type. A blue triangle and a blue square are different types of shapes.', d:'h', h:'Does sharing a color mean shapes have the same name?', sk:'sort_shape_attributes', i:_i53ND()},
  {t:'A student puts a circle in the "3 corners" group because "it looks round and 3 is round." What errors were made?', s:_svgCircle(), o:[{val:'Counting error and wrong sort category — a circle has 0 corners, not 3; it belongs in the 0-corners group'},{val:'No error — 0 and 3 are both small numbers',tag:_53VC},{val:'No error — round shapes go in the 3-corners group',tag:_53VC}], a:0, e:'A circle has 0 corners — it must go in the 0-corners group. "Looks round" is not a valid counting reason.', d:'h', h:'How many corners does a circle actually have?', sk:'sort_shape_attributes', i:_i53VC()},
  {t:'A student claims: "Defining attributes include color, size, and direction." What is wrong?', s:_svgSquare(), o:[{val:'Color, size, and direction are NON-defining — only sides and corners are defining attributes'},{val:'The student is right — all three are defining',tag:_53DA},{val:'The student is partly right — only color is defining',tag:_53CS}], a:0, e:'Color, size, and direction are all non-defining. Sides and corners define shapes.', d:'h', h:'What actually defines a shape?', sk:'sort_shape_attributes', i:_i53DA()},
  {t:'A student sorts hexagons and rhombuses into the same group saying: "Both have more than 3 sides." A second student says they should be in different groups because hexagon has 6 sides and rhombus has 4. Who is right?', s:_svgRow2(_svgHexSm(0),_svgRhSm(0)), o:[{val:'Both students are right — it depends on the sorting rule: "more than 3 sides" makes them share a group; "exact side count" separates them'},{val:'Only first student is right',tag:_53SC},{val:'Only second student is right',tag:_53SC}], a:0, e:'With rule "more than 3 sides," both share a group. With rule "exact count," they separate. Both students are correct given their rules.', d:'h', h:'What is the exact sorting rule being used?', sk:'sort_shape_attributes', i:_i53WS()},
  {t:'A student makes a "same corners" group with circle (0), square (4), and hexagon (6). What error was made?', s:_svgRow3(_svgCircSm(),_svgSquSm(),_svgHexSm(0)), o:[{val:'Counting error — circle has 0, square has 4, and hexagon has 6; they all have different corner counts'},{val:'No error — all are the same',tag:_53VC},{val:'No error — they are all 2D shapes',tag:_53TD}], a:0, e:'Circle=0, square=4, hexagon=6 corners. Different counts — they do not belong in the same "same corners" group.', d:'h', h:'Count corners on each shape. Are they the same?', sk:'sort_shape_attributes', i:_i53VC()}
];

// ── L5.3 bank assembly ─────────────────────────────────────────────────────────

var _l53Bank = _colorizeQ([].concat(_l53C1, _l53C2, _l53C3, _l53C4, _l53C5, _l53C6, _l53C7, _l53C8, _l53C9, _l53C10));

// ── L5.3 worked examples ───────────────────────────────────────────────────────

var _l53Examples = [
  {
    id: 'g1-u5-l3-ex-1',
    title: 'Example 1: Defining vs non-defining',
    prompt: 'A student sees a red triangle and a blue triangle. Are they the same shape?',
    steps: [
      'Ask: what defines a shape? → the number of sides and corners.',
      'The red triangle has 3 sides. The blue triangle has 3 sides.',
      'Color is non-defining — it does not change the shape name.',
      'Both have 3 sides → both are triangles.'
    ],
    finalAnswer: 'Yes — both are triangles. Color is non-defining.'
  },
  {
    id: 'g1-u5-l3-ex-2',
    title: 'Example 2: Sort by sides',
    prompt: 'A student is sorting shapes into a 4-sides group. Does a rhombus belong?',
    steps: [
      'Count the sides of a rhombus: 1, 2, 3, 4.',
      'A rhombus has 4 sides.',
      'The sorting group is "4 sides."',
      '4 = 4 → yes, it belongs.'
    ],
    finalAnswer: 'Yes — a rhombus has 4 sides, so it belongs in the 4-sides group.'
  },
  {
    id: 'g1-u5-l3-ex-3',
    title: 'Example 3: Orientation error',
    prompt: 'A student says a triangle pointing down is a new shape. Is the student right?',
    steps: [
      'Count the sides of the pointing-down triangle: 3 sides.',
      'Orientation (which way it points) is non-defining.',
      'Turning, flipping, or rotating does not change the shape name.',
      'Still 3 sides → still a triangle.'
    ],
    finalAnswer: 'No — the student is wrong. A triangle pointing down is still a triangle.'
  },
  {
    id: 'g1-u5-l3-ex-4',
    title: 'Example 4: Sort by corners',
    prompt: 'A student sorts into a 0-corners group and a corners group. Where does a circle go?',
    steps: [
      'Check: does a circle have any corners (pointy spots)?',
      'A circle is perfectly round — no pointy spots anywhere.',
      'A circle has 0 corners.',
      '0 corners → it goes in the 0-corners group.'
    ],
    finalAnswer: 'A circle goes in the 0-corners group.'
  },
  {
    id: 'g1-u5-l3-ex-5',
    title: 'Example 5: Straight vs curved',
    prompt: 'A student sorts: "all straight sides" and "any curved sides." Where do a hexagon and a circle go?',
    steps: [
      'Hexagon: check each side. All 6 sides are straight lines.',
      'Hexagon → all-straight-sides group.',
      'Circle: its side is a curve — no straight lines anywhere.',
      'Circle → any-curved-sides group.'
    ],
    finalAnswer: 'Hexagon goes in all-straight-sides. Circle goes in any-curved-sides.'
  },
  {
    id: 'g1-u5-l3-ex-6',
    title: 'Example 6: 2D vs 3D',
    prompt: 'A square and a cube both have square shapes. How are they different types?',
    steps: [
      'A square is a flat 2D shape — like a drawing on paper.',
      'A cube is a 3D solid — it has depth and you can pick it up.',
      'The square\'s faces look like squares, but the cube itself is a 3D solid.',
      'Flat drawing = 2D. Solid object = 3D.'
    ],
    finalAnswer: 'A square is a flat 2D shape. A cube is a 3D solid.'
  }
];

// ── L5.3 key ideas ─────────────────────────────────────────────────────────────

var _l53KeyIdeas = [
  'A defining attribute is something that is ALWAYS true about a shape — like number of sides or number of corners.',
  'Non-defining attributes — like color, size, and orientation — can change without changing the shape name.',
  'A triangle is still a triangle when turned, flipped, painted, or resized — it always has 3 sides and 3 corners.',
  'Sort shapes by counting sides: triangle = 3, square/rectangle/rhombus = 4, hexagon = 6, circle = 0 straight sides.',
  'A circle has no corners and no straight sides — it is always in the "0 corners" and "curved" group.',
  'Flat shapes drawn on paper are 2D shapes. Solid objects you can pick up and hold are 3D solids.'
];

// ══════════════════════════════════════════════════════════════════════════════
//  Lesson 5.4 — Compose and Recognize 2D Shapes — Helpers
// ══════════════════════════════════════════════════════════════════════════════

// ── L5.4 error tag shorthands ─────────────────────────────────────────────────
var _54CS = 'err_wrong_composite_shape';
var _54CP = 'err_wrong_component_shape';
var _54MP = 'err_missing_piece_confusion';
var _54CN = 'err_count_pieces_confusion';
var _54OR = 'err_orientation_confusion';
var _54SZ = 'err_size_match_confusion';
var _54SA = 'err_shape_attribute_confusion';

// ── L5.4 piece SVG helpers ────────────────────────────────────────────────────
// Right isoceles triangle that is half of a square (80×80 viewBox).
// flip=false: ◣ shape (right angle at bottom-left), hypotenuse from top-left to bottom-right
// flip=true:  ◥ shape (right angle at top-right),    hypotenuse from top-left to bottom-right
// _svgRtTriSm(false) + _svgRtTriSm(true) together fit to form a square.
function _svgRtTriSm(flip) {
  var pts = flip ? '5,5 75,5 75,75' : '5,5 5,75 75,75';
  return '<svg width="80" height="80" viewBox="0 0 80 80">' +
    '<polygon points="' + pts + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

// Right triangle that is half of a 2:1 rectangle (matches _svgRectSm dimensions).
// flip=false: ◤ shape (right angle at top-left)
// flip=true:  ◢ shape (right angle at bottom-right)
function _svgRtTriRectSm(flip) {
  var pts = flip ? '150,16 150,84 10,84' : '10,16 150,16 10,84';
  return '<svg width="90" height="58" viewBox="0 0 160 100">' +
    '<polygon points="' + pts + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '</svg>';
}

// ── L5.4 composite SVG helpers (shape with interior dividing line) ───────────
// White interior line stroke-width=2.5 shows the join.
// _colorizeQ() preserves the white line (only replaces purple tokens #CE93D8/#7B1FA2).

function _svgComp2TriSq() {
  return '<svg width="96" height="96" viewBox="0 0 96 96">' +
    '<rect x="5" y="5" width="86" height="86" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="5" y1="5" x2="91" y2="91" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgComp2TriRect() {
  return '<svg width="140" height="80" viewBox="0 0 140 80">' +
    '<rect x="5" y="5" width="130" height="70" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="5" y1="5" x2="135" y2="75" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgComp2SqRect() {
  return '<svg width="170" height="90" viewBox="0 0 170 90">' +
    '<rect x="5" y="5" width="160" height="80" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="85" y1="5" x2="85" y2="85" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgComp2RectRect() {
  return '<svg width="140" height="90" viewBox="0 0 140 90">' +
    '<rect x="5" y="5" width="130" height="80" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="5" y1="45" x2="135" y2="45" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgComp3SqRect() {
  return '<svg width="250" height="90" viewBox="0 0 250 90">' +
    '<rect x="5" y="5" width="240" height="80" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="85" y1="5" x2="85" y2="85" stroke="white" stroke-width="2.5"/>' +
    '<line x1="165" y1="5" x2="165" y2="85" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgComp4SqSq() {
  return '<svg width="100" height="100" viewBox="0 0 100 100">' +
    '<rect x="5" y="5" width="90" height="90" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="50" y1="5" x2="50" y2="95" stroke="white" stroke-width="2.5"/>' +
    '<line x1="5" y1="50" x2="95" y2="50" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgComp2TriRh() {
  // Rhombus from 2 equilateral triangles (top apex + bottom apex), horizontal midline.
  return '<svg width="70" height="115" viewBox="0 0 70 115">' +
    '<polygon points="35,5 65,57 35,110 5,57" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="5" y1="57" x2="65" y2="57" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

function _svgCompSqTri() {
  // House: 80×80 square on bottom + triangle on top. Component-ID use only.
  return '<svg width="100" height="140" viewBox="0 0 100 140">' +
    '<polygon points="50,5 90,55 90,135 10,135 10,55" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<line x1="10" y1="55" x2="90" y2="55" stroke="white" stroke-width="2.5"/>' +
    '</svg>';
}

// ── L5.4 missing-piece variant helpers ───────────────────────────────────────
// One piece filled in normal color; missing slot outlined with neutral gray dashed border.
// Gray (#999999) is NOT colorized — kids see "this part is empty."

function _svgCompMiss2TriSq(side) {
  var leftPts = '5,5 5,91 91,91';
  var rightPts = '5,5 91,5 91,91';
  var filled = (side === 'left') ? leftPts : rightPts;
  var missing = (side === 'left') ? rightPts : leftPts;
  return '<svg width="96" height="96" viewBox="0 0 96 96">' +
    '<polygon points="' + filled + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="' + missing + '" fill="none" stroke="#999999" stroke-width="3" stroke-linejoin="round" stroke-dasharray="6,4"/>' +
    '</svg>';
}

function _svgCompMiss2SqRect(side) {
  var leftPts = '5,5 85,5 85,85 5,85';
  var rightPts = '85,5 165,5 165,85 85,85';
  var filled = (side === 'left') ? leftPts : rightPts;
  var missing = (side === 'left') ? rightPts : leftPts;
  return '<svg width="170" height="90" viewBox="0 0 170 90">' +
    '<polygon points="' + filled + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="' + missing + '" fill="none" stroke="#999999" stroke-width="3" stroke-linejoin="round" stroke-dasharray="6,4"/>' +
    '</svg>';
}

function _svgCompMiss2TriRect(side) {
  var upperPts = '5,5 135,5 5,75';
  var lowerPts = '135,5 135,75 5,75';
  var filled = (side === 'upper') ? upperPts : lowerPts;
  var missing = (side === 'upper') ? lowerPts : upperPts;
  return '<svg width="140" height="80" viewBox="0 0 140 80">' +
    '<polygon points="' + filled + '" fill="#CE93D8" stroke="#7B1FA2" stroke-width="5" stroke-linejoin="round"/>' +
    '<polygon points="' + missing + '" fill="none" stroke="#999999" stroke-width="3" stroke-linejoin="round" stroke-dasharray="6,4"/>' +
    '</svg>';
}

// ── L5.4 teaching visual helpers ─────────────────────────────────────────────
// All use _TVP (#9C27B0) for light-fill teaching style. _colorizeQ replaces #9C27B0 with stroke color.

function _tv54Outline() {
  // Two triangles → square; emphasizes the outer outline
  return _tvWrap(
    '<svg width="240" height="100" viewBox="0 0 240 100" style="display:inline-block">' +
    '<polygon points="10,15 10,85 80,85" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<polygon points="10,15 80,15 80,85" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="105" y="60" font-size="22" font-weight="bold" fill="' + _TVP + '" font-family="Nunito,sans-serif">→</text>' +
    '<rect x="140" y="15" width="70" height="70" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="4"/>' +
    '<line x1="140" y1="15" x2="210" y2="85" stroke="' + _TVP + '" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
    '</svg>',
    'Look at the OUTSIDE outline of the joined shape'
  );
}

function _tv54Pieces() {
  // Composite square with numbered pieces (1, 2)
  return _tvWrap(
    '<svg width="120" height="120" viewBox="0 0 120 120" style="display:inline-block">' +
    '<rect x="15" y="15" width="90" height="90" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="15" y1="15" x2="105" y2="105" stroke="' + _TVP + '" stroke-width="2" stroke-dasharray="5,3"/>' +
    _tvDot(38, 78, 1) +
    _tvDot(82, 42, 2) +
    '</svg>',
    'Look at each piece separately — count sides on each'
  );
}

function _tv54Missing() {
  // Missing piece with arrow to matching piece
  return _tvWrap(
    '<svg width="240" height="110" viewBox="0 0 240 110" style="display:inline-block">' +
    '<polygon points="15,15 15,95 95,95" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<polygon points="15,15 95,15 95,95" fill="none" stroke="#999" stroke-width="2.5" stroke-dasharray="6,4"/>' +
    '<text x="125" y="58" font-size="20" font-weight="bold" fill="' + _TVP + '" font-family="Nunito,sans-serif">→</text>' +
    '<polygon points="155,15 225,15 225,85" fill="' + _TVP + '" opacity="0.4" stroke="' + _TVP + '" stroke-width="3"/>' +
    '</svg>',
    'Trace the empty outline — find a piece that matches'
  );
}

function _tv54Count() {
  // Composite with arrow pointing to dividing line + "2 pieces" caption
  return _tvWrap(
    '<svg width="200" height="115" viewBox="0 0 200 115" style="display:inline-block">' +
    '<rect x="20" y="15" width="160" height="80" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="100" y1="15" x2="100" y2="95" stroke="' + _TVP + '" stroke-width="2.5" stroke-dasharray="5,3"/>' +
    _tvDot(60, 55, 1) +
    _tvDot(140, 55, 2) +
    '</svg>',
    '1 dividing line = 2 pieces'
  );
}

function _tv54Rotate() {
  // Triangle in two orientations with rotation arrow
  return _tvWrap(
    '<svg width="230" height="100" viewBox="0 0 230 100" style="display:inline-block">' +
    '<polygon points="40,15 75,85 5,85" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<path d="M 95,40 Q 115,30 135,40" fill="none" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<polygon points="135,40 128,35 130,46" fill="' + _TVP + '"/>' +
    '<polygon points="155,85 190,15 225,85" fill="' + _TVP + '" opacity="0.2" stroke="' + _TVP + '" stroke-width="3"/>' +
    '</svg>',
    'Turning a shape does not change its name'
  );
}

function _tv54Fit() {
  // Two square pieces fit edge-to-edge → larger rectangle that holds both
  return _tvWrap(
    '<svg width="280" height="90" viewBox="0 0 280 90" style="display:inline-block">' +
    '<rect x="10" y="15" width="55" height="60" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<rect x="65" y="15" width="55" height="60" fill="' + _TVP + '" opacity="0.25" stroke="' + _TVP + '" stroke-width="2"/>' +
    '<text x="138" y="52" font-size="20" font-weight="bold" fill="' + _TVP + '" font-family="Nunito,sans-serif">→</text>' +
    '<rect x="165" y="15" width="110" height="60" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="4"/>' +
    '<line x1="220" y1="15" x2="220" y2="75" stroke="' + _TVP + '" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>' +
    '</svg>',
    'Pieces fit edge-to-edge to fill the target'
  );
}

function _tv54Attr() {
  // Outer rectangle with side counts marked
  return _tvWrap(
    '<svg width="220" height="110" viewBox="0 0 220 110" style="display:inline-block">' +
    '<rect x="20" y="25" width="180" height="70" fill="' + _TVP + '" opacity="0.18" stroke="' + _TVP + '" stroke-width="3"/>' +
    '<line x1="110" y1="25" x2="110" y2="95" stroke="' + _TVP + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>' +
    '<text x="110" y="18" font-size="11" font-weight="bold" fill="' + _TVP + '" text-anchor="middle" font-family="Nunito,sans-serif">4 sides outside</text>' +
    _tvDot(20, 25, 1) + _tvDot(200, 25, 2) + _tvDot(200, 95, 3) + _tvDot(20, 95, 4) +
    '</svg>',
    'Count sides and corners of the OUTSIDE shape only'
  );
}

// ── L5.4 intervention factories ───────────────────────────────────────────────

function _i54CS() {
  return {
    errorTag: _54CS,
    title: 'Look at the outside outline',
    teachingSteps: [
      'When pieces are joined, look only at the OUTSIDE edge.',
      'Count the sides of the outside shape.',
      'Count the corners of the outside shape.',
      'Use those counts to name the joined shape.',
      'The interior dividing line does not add sides or corners.'
    ],
    teachingVisualRaw: _tv54Outline(),
    correctAnswerExplanation: 'Read the outer outline to name the joined shape.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i54CP() {
  return {
    errorTag: _54CP,
    title: 'Look at each piece, not the whole shape',
    teachingSteps: [
      'Find the dividing line inside the joined shape.',
      'Look at each piece separately — not the whole shape.',
      'Count the sides on each piece.',
      'Use the side count to name each piece.',
      '3 sides = triangle. 4 equal sides = square. 4 sides, 2 long + 2 short = rectangle.'
    ],
    teachingVisualRaw: _tv54Pieces(),
    correctAnswerExplanation: 'Name the pieces by counting sides on each piece, not the whole shape.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i54MP() {
  return {
    errorTag: _54MP,
    title: 'Trace the empty space',
    teachingSteps: [
      'Look at the shape of the empty space (the dashed outline).',
      'Trace its outline with your finger.',
      'Count the sides and corners of that empty outline.',
      'The missing piece must be that same shape — and the same size.',
      'Look at the choices and pick the one that matches the empty outline.'
    ],
    teachingVisualRaw: _tv54Missing(),
    correctAnswerExplanation: 'The missing piece matches the empty outline in shape and size.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i54CN() {
  return {
    errorTag: _54CN,
    title: 'Count the dividing lines',
    teachingSteps: [
      'Look at the interior lines inside the joined shape.',
      'Count those lines: each line splits the shape one more time.',
      'Number of pieces = number of dividing lines + 1.',
      '1 line inside = 2 pieces. 2 lines = 3 pieces. 3 lines = 4 pieces.'
    ],
    teachingVisualRaw: _tv54Count(),
    correctAnswerExplanation: 'Count the dividing lines, then add 1 for the number of pieces.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i54OR() {
  return {
    errorTag: _54OR,
    title: 'Turning a shape does not change its name',
    teachingSteps: [
      'A triangle with 3 sides is still a triangle when you flip or turn it.',
      'The NAME comes from sides and corners — not from direction.',
      'If the piece has 3 sides, it is a triangle, no matter how it points.',
      'A flipped triangle still fits to make the same composite shape.'
    ],
    teachingVisualRaw: _tv54Rotate(),
    correctAnswerExplanation: 'Orientation is non-defining — flipping or turning a piece does not change its name.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i54SZ() {
  return {
    errorTag: _54SZ,
    title: 'Pieces must fill the whole target',
    teachingSteps: [
      'The pieces must fit together perfectly — no gaps, no overlaps.',
      'Check that the pieces together match the outline of the target.',
      'If a piece is too big or too small, it is the wrong piece.',
      'Compare the size of each piece to the empty space it should fill.'
    ],
    teachingVisualRaw: _tv54Fit(),
    correctAnswerExplanation: 'The pieces must fit edge-to-edge and fill the whole target.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i54SA() {
  return {
    errorTag: _54SA,
    title: 'Count sides and corners of the result',
    teachingSteps: [
      'After joining the pieces, look at the OUTSIDE shape only.',
      'Count its sides and its corners.',
      '4 equal sides + 4 corners = square.',
      '4 sides (2 long + 2 short) + 4 corners = rectangle.',
      '4 equal sides + a leaning shape = rhombus.',
      'Use those rules to name the joined shape.'
    ],
    teachingVisualRaw: _tv54Attr(),
    correctAnswerExplanation: 'Count sides and corners of the outside shape to name it.',
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

// ── C1: Two pieces → target name (18E + 12M = 30) ────────────────────────────

var _l54C1 = [
  // Easy (18) — prototypical pairs ─────────────────────────────────────────────
  // 8 × right triangles → square
  {t:'These two triangles fit together. What shape do they make?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Triangle',tag:_54CP},{val:'Rectangle',tag:_54SA},{val:'Circle',tag:_54CS}], a:0, e:'Two right triangles join along their long edges to make a square with 4 equal sides and 4 corners.', d:'e', h:'Trace the OUTSIDE outline once the pieces are joined.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Put these two triangles together. What shape forms?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Triangle',tag:_54CP},{val:'Rhombus',tag:_54SA},{val:'Hexagon',tag:_54CS}], a:0, e:'The joined pieces make a square — 4 equal sides and 4 corners.', d:'e', h:'How many sides will the joined outline have?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Join these two triangles edge-to-edge. What shape is made?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Rectangle',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Circle',tag:_54CS}], a:0, e:'The triangles fit together to make a square — all 4 outside sides are the same length.', d:'e', h:'Are the 4 outside sides all the same length?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'These two pieces snap together. What shape do they form?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Pentagon',tag:_54CS},{val:'Triangle',tag:_54CP},{val:'Rhombus',tag:_54SA}], a:0, e:'Two matching triangles form a square with 4 equal sides.', d:'e', h:'Look at the OUTSIDE outline only — not the interior line.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Slide these triangles together. What shape appears?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Rectangle',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Triangle',tag:_54CP}], a:0, e:'The two right triangles slide together to make a square.', d:'e', h:'Will the four outside sides be the same length?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'What shape do two right triangles make when joined like this?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Rhombus',tag:_54SA},{val:'Pentagon',tag:_54CS},{val:'Triangle',tag:_54CP}], a:0, e:'Two right triangles join to form a square — 4 sides, all equal.', d:'e', h:'Count the corners of the joined outline.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'These two pieces fit together perfectly. What shape forms?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Circle',tag:_54CS},{val:'Rectangle',tag:_54SA},{val:'Triangle',tag:_54CP}], a:0, e:'The result is a square — 4 equal sides and 4 corners.', d:'e', h:'A circle has no corners — could the result be a circle?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Look at the two triangles. What larger shape can they build?', s:_svgRow2(_svgRtTriSm(false),_svgRtTriSm(true)), o:[{val:'Square'},{val:'Hexagon',tag:_54CS},{val:'Rhombus',tag:_54SA},{val:'Triangle',tag:_54CP}], a:0, e:'Two right triangles build a square when joined along their long edges.', d:'e', h:'How many corners will the new shape have?', sk:'compose_2d_shapes', i:_i54CS()},

  // 6 × squares → rectangle
  {t:'Place these two squares side by side. What shape do they make?', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CS},{val:'Circle',tag:_54CS}], a:0, e:'Two squares side by side make a rectangle — 2 long sides + 2 short sides.', d:'e', h:'Are the 4 outside sides all the same length now?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Two squares fit together. What is the new shape?', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'A square plus a square makes a rectangle — 2 long sides, 2 short sides.', d:'e', h:'Are all sides equal, or are two longer than the others?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'What shape do two equal squares make when joined?', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CS},{val:'Pentagon',tag:_54CS}], a:0, e:'The joined shape has 4 sides — 2 longer, 2 shorter — that is a rectangle.', d:'e', h:'A square has all equal sides; a rectangle has 2 long + 2 short.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Slide two squares together. What larger shape do they form?', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'Rectangle'},{val:'Bigger square',tag:_54SA},{val:'Rhombus',tag:_54SA},{val:'Circle',tag:_54CS}], a:0, e:'Two squares side-by-side make a longer shape — 2 long + 2 short sides = rectangle.', d:'e', h:'Are the sides all the same length, or are some longer?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Join two squares edge-to-edge. What shape results?', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Triangle',tag:_54CS}], a:0, e:'Two squares stuck together always make a rectangle.', d:'e', h:'Look at how long the top is compared to the side.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'These two squares meet edge-to-edge. What shape did they make?', s:_svgRow2(_svgSquSm(),_svgSquSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Oval',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'A rectangle has 4 sides with 2 long + 2 short — that is what two squares form together.', d:'e', h:'Are the corners pointy or curved?', sk:'compose_2d_shapes', i:_i54SA()},

  // 4 × rectangles → larger rectangle
  {t:'Two rectangles are placed side by side. What shape do they make?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'A larger rectangle'},{val:'A square',tag:_54SA},{val:'A triangle',tag:_54CS},{val:'A hexagon',tag:_54CS}], a:0, e:'Two rectangles next to each other still form a rectangle — 4 sides, 4 corners.', d:'e', h:'Count the sides of the new outline.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'What shape forms when you join two equal rectangles?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Rhombus',tag:_54SA},{val:'Circle',tag:_54CS}], a:0, e:'Two rectangles join to form a larger rectangle — 4 sides, 4 corners, no curves.', d:'e', h:'Will the result have curved sides?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Two rectangles snap together. What is the result?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'A bigger rectangle'},{val:'A square',tag:_54SA},{val:'A pentagon',tag:_54CS},{val:'A triangle',tag:_54CS}], a:0, e:'Joining two rectangles forms a longer rectangle. The outside still has 4 sides and 4 corners.', d:'e', h:'How many corners are on the new outline?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Slide two rectangles together. What larger shape do they form?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'Two rectangles end-to-end form a longer rectangle. Still 4 sides, 4 corners.', d:'e', h:'Look at the outside outline only.', sk:'compose_2d_shapes', i:_i54CS()},

  // Medium (12) ─────────────────────────────────────────────────────────────
  // 5 × right triangles → rectangle
  {t:'These wider right triangles fit together. What shape do they make?', s:_svgRow2(_svgRtTriRectSm(false),_svgRtTriRectSm(true)), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Rhombus',tag:_54SA}], a:0, e:'Two wider right triangles match up to form a rectangle — 2 long + 2 short sides.', d:'m', h:'Are the four outside sides all the same length?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Two long right triangles fit together. What larger shape do they make?', s:_svgRow2(_svgRtTriRectSm(false),_svgRtTriRectSm(true)), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Pentagon',tag:_54CS},{val:'Triangle',tag:_54CP}], a:0, e:'Two long right triangles meet at their long edges to form a rectangle.', d:'m', h:'The result has 2 long sides and 2 short sides.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'These two triangles meet at their long edges. What shape results?', s:_svgRow2(_svgRtTriRectSm(false),_svgRtTriRectSm(true)), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'The two long edges meet — the outside is a rectangle with 2 long and 2 short sides.', d:'m', h:'The four outside sides are not all the same length.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Join these wider triangles. The result has 4 sides — 2 long, 2 short. What is it?', s:_svgRow2(_svgRtTriRectSm(false),_svgRtTriRectSm(true)), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Rhombus',tag:_54SA}], a:0, e:'A 4-sided shape with 2 long + 2 short sides is a rectangle.', d:'m', h:'2 long + 2 short sides = which shape?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Two right triangles snap together along their long edges. What shape forms?', s:_svgRow2(_svgRtTriRectSm(false),_svgRtTriRectSm(true)), o:[{val:'Rectangle'},{val:'Pentagon',tag:_54CS},{val:'Hexagon',tag:_54CS},{val:'Square',tag:_54SA}], a:0, e:'Joining the two right triangles along their long edges forms a rectangle.', d:'m', h:'Trace the joined outline — count the sides.', sk:'compose_2d_shapes', i:_i54CS()},

  // 4 × rectangles → larger rectangle (medium phrasing)
  {t:'Two same-size rectangles are joined together. What is the new shape?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'Joining two equal rectangles end-to-end always forms a longer rectangle.', d:'m', h:'The outside still has 4 sides and 4 corners.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Place two equal rectangles next to each other. What shape do they form?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Pentagon',tag:_54CS},{val:'Circle',tag:_54CS}], a:0, e:'Two equal rectangles end-to-end form a larger rectangle.', d:'m', h:'Will the joined shape have curves?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Two rectangles join end-to-end. What shape is it called?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'Rectangle'},{val:'Rhombus',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Triangle',tag:_54CS}], a:0, e:'End-to-end rectangles form a longer rectangle — still 4 sides, 4 corners.', d:'m', h:'Count the corners of the outside outline.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'What shape forms when two rectangles are joined edge to edge?', s:_svgRow2(_svgRectSm(),_svgRectSm()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Pentagon',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'The joined shape is a longer rectangle with 4 sides and 4 corners.', d:'m', h:'Is the shape still 4-sided?', sk:'compose_2d_shapes', i:_i54CS()},

  // 3 × equilateral triangles → rhombus
  {t:'These two triangles point in opposite directions. Join them base-to-base. What shape forms?', s:_svgRow2(_svgTriSm(0),_svgTriSm(180)), o:[{val:'Rhombus'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Rectangle',tag:_54SA}], a:0, e:'Two triangles meeting base-to-base form a rhombus — 4 equal sides leaning like a diamond.', d:'m', h:'The result has 4 equal sides and looks like a diamond.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Put these two triangles together so they share a long edge. What shape do they make?', s:_svgRow2(_svgTriSm(0),_svgTriSm(180)), o:[{val:'Rhombus'},{val:'Square',tag:_54SA},{val:'Rectangle',tag:_54SA},{val:'Pentagon',tag:_54CS}], a:0, e:'Two triangles sharing a side form a rhombus — 4 equal sides, looks like a diamond.', d:'m', h:'4 equal sides with corners that lean = ?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'When these two triangles meet at their long edges, what 4-sided shape forms?', s:_svgRow2(_svgTriSm(0),_svgTriSm(180)), o:[{val:'Rhombus'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Rectangle',tag:_54SA}], a:0, e:'Joining the triangles at their shared edge makes a rhombus with 4 equal sides.', d:'m', h:'A 4-sided diamond shape with equal sides is called what?', sk:'compose_2d_shapes', i:_i54SA()}
];

// ── C2: Composite → name (8E + 10M = 18) ─────────────────────────────────────

var _l54C2 = [
  // Easy (8)
  {t:'This shape was made from two pieces. What is the joined shape called?', s:_svgComp2TriSq(), o:[{val:'Square'},{val:'Triangle',tag:_54CP},{val:'Rectangle',tag:_54SA},{val:'Circle',tag:_54CS}], a:0, e:'The outside has 4 equal sides and 4 corners — that is a square.', d:'e', h:'Count the sides on the OUTSIDE only.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Look at the outside outline. What shape is this?', s:_svgComp2TriSq(), o:[{val:'Square'},{val:'Rhombus',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Triangle',tag:_54CP}], a:0, e:'4 equal sides + square corners = square.', d:'e', h:'Ignore the diagonal line inside.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Trace the outside of this shape. What is it?', s:_svgComp2TriSq(), o:[{val:'Square'},{val:'Triangle',tag:_54CP},{val:'Pentagon',tag:_54CS},{val:'Rectangle',tag:_54SA}], a:0, e:'4 equal sides + 4 corners = square. The interior diagonal does not add sides.', d:'e', h:'The interior line is not a side of the shape.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'What shape did these two pieces make?', s:_svgComp2SqRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CS},{val:'Hexagon',tag:_54CS}], a:0, e:'The outside has 2 long sides + 2 short sides — that is a rectangle.', d:'e', h:'Look only at the outside outline.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Look at the outside of this shape. What is its name?', s:_svgComp2SqRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Rhombus',tag:_54SA},{val:'Circle',tag:_54CS}], a:0, e:'4 sides, 2 long + 2 short = rectangle.', d:'e', h:'Are all 4 sides the same length?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'What shape is the outside outline?', s:_svgComp2SqRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CS},{val:'Pentagon',tag:_54CS}], a:0, e:'2 long + 2 short sides + 4 corners = rectangle.', d:'e', h:'Count the sides on the outside.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'This shape is made from two pieces. What is the outside shape called?', s:_svgComp2RectRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'The outside still has 2 long + 2 short sides — it is a rectangle.', d:'e', h:'The interior line does not change the outside shape.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Look at this shape. What is the outside outline?', s:_svgComp2RectRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CS},{val:'Pentagon',tag:_54CS}], a:0, e:'4 sides with 2 long + 2 short = rectangle. The dividing line does not add corners.', d:'e', h:'How many corners are on the outside?', sk:'compose_2d_shapes', i:_i54CS()},

  // Medium (10)
  {t:'These two pieces fit together. What shape is the outside?', s:_svgComp2TriRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Rhombus',tag:_54SA}], a:0, e:'The diagonal interior shows two triangle pieces — the outside is a rectangle.', d:'m', h:'Look only at the outside outline.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'What shape did the two triangles make?', s:_svgComp2TriRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Pentagon',tag:_54CS},{val:'Triangle',tag:_54CP}], a:0, e:'The diagonal line shows the two triangle pieces — but the outside is a rectangle.', d:'m', h:'Count the sides of the outside outline.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Two triangles joined along their long edges. What is the outside shape?', s:_svgComp2TriRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Hexagon',tag:_54CS},{val:'Rhombus',tag:_54SA}], a:0, e:'Two triangles meeting at their long edges produce a rectangle — 4 sides, 4 corners.', d:'m', h:'Trace the outside edges, not the diagonal.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A diagonal divides this shape into two pieces. What is the outside shape called?', s:_svgComp2TriSq(), o:[{val:'Square'},{val:'Triangle',tag:_54CP},{val:'Rectangle',tag:_54SA},{val:'Rhombus',tag:_54SA}], a:0, e:'The 4 outside sides are all equal — that is a square, not a triangle.', d:'m', h:'Count only the outside sides.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Look at the OUTSIDE only. What shape is this?', s:_svgComp2TriSq(), o:[{val:'Square'},{val:'Two triangles',tag:_54CP},{val:'Rectangle',tag:_54SA},{val:'Hexagon',tag:_54CS}], a:0, e:'Outside view: 4 equal sides and 4 corners — a square. "Two triangles" describes the pieces, not the outside shape.', d:'m', h:'The question asks for the OUTSIDE shape, not the pieces.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Two pieces share a center line. What is the outside shape called?', s:_svgComp2SqRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Two squares',tag:_54CP},{val:'Rhombus',tag:_54SA}], a:0, e:'The pieces are two squares, but the OUTSIDE shape is a rectangle (2 long + 2 short sides).', d:'m', h:'The question asks for the outside, not the pieces.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Two equal pieces are joined. What is the outside shape?', s:_svgComp2RectRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Two rectangles',tag:_54CP},{val:'Hexagon',tag:_54CS}], a:0, e:'The outside is a rectangle — even though the pieces inside are rectangles too.', d:'m', h:'Outside = the outer edge only.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Two triangles join base-to-base. What is the outside shape called?', s:_svgComp2TriRh(), o:[{val:'Rhombus'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Rectangle',tag:_54SA}], a:0, e:'The outside has 4 equal sides that lean — that is a rhombus.', d:'m', h:'Does the outside look like a diamond?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Look at this shape. The outside has 4 equal sides that lean. What is it?', s:_svgComp2TriRh(), o:[{val:'Rhombus'},{val:'Square',tag:_54SA},{val:'Rectangle',tag:_54SA},{val:'Pentagon',tag:_54CS}], a:0, e:'4 equal sides + leaning corners = rhombus.', d:'m', h:'A square has square corners; this one leans.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Two triangles meet at their long edges. What is the outside outline?', s:_svgComp2TriRh(), o:[{val:'Rhombus'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Hexagon',tag:_54CS}], a:0, e:'The 4 outside sides are equal but lean — that is a rhombus (diamond shape).', d:'m', h:'How many sides does the outside have?', sk:'compose_2d_shapes', i:_i54SA()}
];

// ── C3: Identify components (5E + 10M + 5H = 20) ─────────────────────────────

var _l54C3 = [
  // Easy (5)
  {t:'This square is made from two pieces. What are the pieces?', s:_svgComp2TriSq(), o:[{val:'Two triangles'},{val:'Two squares',tag:_54CP},{val:'A triangle and a square',tag:_54CP},{val:'Two rectangles',tag:_54CP}], a:0, e:'The diagonal line shows the square was made from two triangles.', d:'e', h:'Look at each piece on either side of the diagonal.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'This rectangle is made from two pieces. What are the pieces?', s:_svgComp2SqRect(), o:[{val:'Two squares'},{val:'Two triangles',tag:_54CP},{val:'A circle and a square',tag:_54CP},{val:'Two rectangles',tag:_54CP}], a:0, e:'The vertical line divides the rectangle into two equal squares.', d:'e', h:'Look at each half — what shape is each piece?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'This larger rectangle is made from two pieces. What are the pieces?', s:_svgComp2RectRect(), o:[{val:'Two rectangles'},{val:'Two squares',tag:_54CP},{val:'Two triangles',tag:_54CP},{val:'A rectangle and a triangle',tag:_54CP}], a:0, e:'The horizontal line shows two equal rectangles stacked.', d:'e', h:'Each piece has 2 long sides + 2 short sides.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Look at the diagonal line inside. What two shapes were used to make this?', s:_svgComp2TriSq(), o:[{val:'Two triangles'},{val:'A triangle and a square',tag:_54CP},{val:'Two squares',tag:_54CP},{val:'A triangle and a circle',tag:_54CP}], a:0, e:'A diagonal line through a square creates two triangles.', d:'e', h:'Each side of the diagonal is a piece — how many sides does each piece have?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'What two pieces make up this rectangle?', s:_svgComp2SqRect(), o:[{val:'Two equal squares'},{val:'Two rectangles',tag:_54CP},{val:'Two triangles',tag:_54CP},{val:'A square and a triangle',tag:_54CP}], a:0, e:'The midline divides the rectangle into two equal squares.', d:'e', h:'Are both halves equal? Are their sides all the same length?', sk:'compose_2d_shapes', i:_i54CP()},

  // Medium (10)
  {t:'This rhombus is made from two pieces. What are the pieces?', s:_svgComp2TriRh(), o:[{val:'Two triangles'},{val:'Two squares',tag:_54CP},{val:'A square and a triangle',tag:_54CP},{val:'Two rectangles',tag:_54CP}], a:0, e:'The horizontal line splits the rhombus into two triangles.', d:'m', h:'Each piece has 3 corners.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'What two shapes were used to build this rhombus?', s:_svgComp2TriRh(), o:[{val:'Two triangles'},{val:'Two rhombuses',tag:_54CP},{val:'A triangle and a square',tag:_54CP},{val:'Two pentagons',tag:_54CP}], a:0, e:'Two triangles meet base-to-base to form the rhombus.', d:'m', h:'Look at each piece — how many sides does each have?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'This rectangle is split by a diagonal. What pieces was it built from?', s:_svgComp2TriRect(), o:[{val:'Two triangles'},{val:'Two rectangles',tag:_54CP},{val:'A triangle and a rectangle',tag:_54CP},{val:'Two squares',tag:_54CP}], a:0, e:'A diagonal across a rectangle creates two triangles.', d:'m', h:'Each piece has 3 corners.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'What two pieces were used to make this rectangle?', s:_svgComp2TriRect(), o:[{val:'Two right triangles'},{val:'Two squares',tag:_54CP},{val:'A square and a triangle',tag:_54CP},{val:'A rectangle and a triangle',tag:_54CP}], a:0, e:'The diagonal cuts the rectangle into two matching right triangles.', d:'m', h:'How many sides does each piece have? 3 sides = triangle.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'This "house" shape was built from two pieces. What are they?', s:_svgCompSqTri(), o:[{val:'A square and a triangle'},{val:'Two squares',tag:_54CP},{val:'Two triangles',tag:_54CP},{val:'A rectangle and a triangle',tag:_54CP}], a:0, e:'The bottom of the house is a square (4 equal sides) and the roof is a triangle (3 sides).', d:'m', h:'Look at the bottom and the top separately.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Look at the pieces inside this house picture. What are they called?', s:_svgCompSqTri(), o:[{val:'A square and a triangle'},{val:'A rectangle and a triangle',tag:_54CP},{val:'Two triangles',tag:_54CP},{val:'A square and a rectangle',tag:_54CP}], a:0, e:'A square (the body) plus a triangle (the roof) makes the house shape.', d:'m', h:'How many sides does each piece have?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'A diagonal divides this shape. The two pieces are matching. What are they?', s:_svgComp2TriSq(), o:[{val:'Two right triangles'},{val:'Two rectangles',tag:_54CP},{val:'Two squares',tag:_54CP},{val:'A triangle and a square',tag:_54CP}], a:0, e:'A diagonal through a square produces two matching right triangles.', d:'m', h:'Each piece has 3 sides.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'What two pieces make up this square?', s:_svgComp2TriSq(), o:[{val:'Two equal triangles'},{val:'Two equal squares',tag:_54CP},{val:'A triangle and a circle',tag:_54CP},{val:'Two rectangles',tag:_54CP}], a:0, e:'A diagonal divides the square into two equal triangles.', d:'m', h:'Each piece has 3 corners and 3 sides.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'A vertical line divides this rectangle. What two pieces were used?', s:_svgComp2SqRect(), o:[{val:'Two equal squares'},{val:'Two rectangles',tag:_54CP},{val:'Two triangles',tag:_54CP},{val:'A square and a rectangle',tag:_54CP}], a:0, e:'A vertical midline creates two equal squares with all sides matching.', d:'m', h:'Are the pieces equal in all directions?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Look closely. What are the two pieces inside this rectangle?', s:_svgComp2SqRect(), o:[{val:'Two squares'},{val:'Two long rectangles',tag:_54CP},{val:'A square and a rectangle',tag:_54CP},{val:'Two triangles',tag:_54CP}], a:0, e:'The midline divides the shape into two equal squares.', d:'m', h:'Each piece has 4 equal sides.', sk:'compose_2d_shapes', i:_i54CP()},

  // Hard (5)
  {t:'How many pieces are inside this composite shape?', s:_svgComp3SqRect(), o:[{val:'3'},{val:'2',tag:_54CN},{val:'4',tag:_54CN},{val:'1',tag:_54CN}], a:0, e:'There are 2 dividing lines, so there are 3 pieces.', d:'h', h:'Count the dividing lines, then add 1.', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'Which is NOT one of the pieces in this house shape?', s:_svgCompSqTri(), o:[{val:'Circle'},{val:'Square',tag:_54CP},{val:'Triangle',tag:_54CP},{val:'A 4-sided piece',tag:_54CP}], a:0, e:'The house is built from a square and a triangle — no circle is used.', d:'h', h:'Name each piece — is a circle one of them?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'This wider rectangle is built from 3 equal pieces. What are they?', s:_svgComp3SqRect(), o:[{val:'Three squares'},{val:'Three rectangles',tag:_54CP},{val:'Three triangles',tag:_54CP},{val:'A square and two rectangles',tag:_54CP}], a:0, e:'The two vertical lines split the shape into three equal squares.', d:'h', h:'Each piece has all 4 sides the same length.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'A student says this rhombus is made of two squares. Is that right?', s:_svgComp2TriRh(), o:[{val:'No — it is made of two triangles'},{val:'Yes — it is made of two squares',tag:_54CP},{val:'Yes — two rectangles',tag:_54CP},{val:'It is made of a square and a triangle',tag:_54CP}], a:0, e:'Each piece has 3 corners — that is a triangle, not a square.', d:'h', h:'Count the sides of each piece.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'In this house shape, what shape forms the bottom AND what shape forms the top?', s:_svgCompSqTri(), o:[{val:'Bottom: square. Top: triangle.'},{val:'Bottom: rectangle. Top: triangle.',tag:_54CP},{val:'Bottom: square. Top: rhombus.',tag:_54CP},{val:'Bottom: triangle. Top: square.',tag:_54CP}], a:0, e:'The bottom is a square (4 equal sides) and the top is a triangle (3 sides).', d:'h', h:'Look at each part separately — count its sides.', sk:'compose_2d_shapes', i:_i54CP()}
];

// ── C4: Missing piece (10M + 8H = 18) ────────────────────────────────────────

var _l54C4 = [
  // Medium (10)
  {t:'One piece is missing from this square. Which piece completes it?', s:_svgCompMiss2TriSq('left'), o:[{val:'A matching triangle'},{val:'A square',tag:_54MP},{val:'A rectangle',tag:_54MP},{val:'A circle',tag:_54MP}], a:0, e:'The empty outline is a triangle — only a matching triangle fills the space.', d:'m', h:'Trace the dashed outline — what shape is the empty space?', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'Which piece fits in the empty space to complete the square?', s:_svgCompMiss2TriSq('right'), o:[{val:'A triangle'},{val:'A square',tag:_54MP},{val:'A rhombus',tag:_54MP},{val:'A pentagon',tag:_54MP}], a:0, e:'The dashed empty outline shows a triangle — only a triangle fits.', d:'m', h:'Look at the dashed outline — how many sides does it have?', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'Which piece is missing from this rectangle?', s:_svgCompMiss2SqRect('left'), o:[{val:'A square'},{val:'A triangle',tag:_54MP},{val:'A rectangle',tag:_54MP},{val:'A circle',tag:_54MP}], a:0, e:'The empty outline has 4 equal sides — a square fits.', d:'m', h:'Trace the dashed outline. Are all sides equal?', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'A piece is missing on the right. Which piece completes the rectangle?', s:_svgCompMiss2SqRect('left'), o:[{val:'A square the same size as the left piece'},{val:'A triangle',tag:_54MP},{val:'A long rectangle',tag:_54SZ},{val:'A bigger square',tag:_54SZ}], a:0, e:'The empty space is the same shape and size as the left piece — a matching square.', d:'m', h:'The missing piece must MATCH the empty space.', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'Which piece fills the empty space here?', s:_svgCompMiss2SqRect('right'), o:[{val:'A square'},{val:'A triangle',tag:_54MP},{val:'A circle',tag:_54MP},{val:'A bigger square',tag:_54SZ}], a:0, e:'The dashed outline has 4 equal sides — a square of the same size fits.', d:'m', h:'How many sides does the empty space have?', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'A right triangle is missing from this rectangle. Which piece completes it?', s:_svgCompMiss2TriRect('upper'), o:[{val:'A matching right triangle'},{val:'A rectangle',tag:_54MP},{val:'A square',tag:_54MP},{val:'A different triangle',tag:_54SZ}], a:0, e:'The empty outline is a right triangle — a matching right triangle fits.', d:'m', h:'Count the sides of the empty space.', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'Which piece fits in the empty diagonal space?', s:_svgCompMiss2TriRect('lower'), o:[{val:'A triangle'},{val:'A square',tag:_54MP},{val:'A rectangle',tag:_54MP},{val:'A hexagon',tag:_54MP}], a:0, e:'The empty space has 3 sides — a triangle fills it.', d:'m', h:'Look at how many corners the empty outline has.', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'Which piece is missing to complete this rectangle?', s:_svgCompMiss2TriRect('upper'), o:[{val:'A triangle'},{val:'A rectangle',tag:_54MP},{val:'A square',tag:_54MP},{val:'A circle',tag:_54MP}], a:0, e:'The dashed outline has 3 corners and 3 sides — that is a triangle.', d:'m', h:'Trace the empty outline. How many corners?', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'A piece is missing on the left. Which piece completes the rectangle?', s:_svgCompMiss2SqRect('right'), o:[{val:'A matching square'},{val:'A triangle',tag:_54MP},{val:'A small rectangle',tag:_54SZ},{val:'A rhombus',tag:_54MP}], a:0, e:'The missing piece is a square the same size as the right piece.', d:'m', h:'The missing piece must fit exactly — same size, same shape.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'Which piece fits the empty triangular space?', s:_svgCompMiss2TriSq('left'), o:[{val:'A right triangle the same size'},{val:'A square the same size',tag:_54MP},{val:'A bigger triangle',tag:_54SZ},{val:'A circle',tag:_54MP}], a:0, e:'The empty outline is a right triangle of a specific size. A matching right triangle fits.', d:'m', h:'The missing piece must match BOTH the shape and the size.', sk:'compose_2d_shapes', i:_i54SZ()},

  // Hard (8)
  {t:'A student picks a square to fill the empty space here. Is that correct?', s:_svgCompMiss2TriSq('right'), o:[{val:'No — the empty space is a triangle, not a square'},{val:'Yes — a square fills any empty space',tag:_54MP},{val:'Yes — the space has 4 corners',tag:_54MP},{val:'No — the space needs a circle',tag:_54MP}], a:0, e:'The dashed outline has 3 corners. A triangle fits, not a square.', d:'h', h:'Count the corners of the empty outline.', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'What goes in the empty space to make a complete shape?', s:_svgCompMiss2SqRect('left'), o:[{val:'A square the same size as the left piece'},{val:'Any square — bigger or smaller is fine',tag:_54SZ},{val:'A triangle',tag:_54MP},{val:'A long rectangle',tag:_54MP}], a:0, e:'Only a square of the SAME SIZE fits — a bigger or smaller piece leaves gaps or overlaps.', d:'h', h:'The piece must fit exactly — no gaps, no overlaps.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'Look at the dashed outline. Which piece could complete the rectangle?', s:_svgCompMiss2TriRect('upper'), o:[{val:'A right triangle that mirrors the filled piece'},{val:'Any triangle of any size',tag:_54SZ},{val:'A square',tag:_54MP},{val:'A rectangle of the same size',tag:_54MP}], a:0, e:'The missing piece is a right triangle that mirrors the filled piece — same size, mirrored shape.', d:'h', h:'The piece must be the same size and the matching mirror of the filled half.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'What is wrong with putting a bigger triangle in the empty space?', s:_svgCompMiss2TriSq('left'), o:[{val:'It would not fit — too big, it would overlap or stick out'},{val:'Triangle is the wrong shape',tag:_54MP},{val:'Nothing is wrong',tag:_54SZ},{val:'It is the right shape but the wrong color',tag:_54SZ}], a:0, e:'The piece must be the SAME size as the empty space. A bigger triangle would not fit.', d:'h', h:'Pieces must fit exactly — same shape AND same size.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'Which piece would complete this rectangle EXACTLY?', s:_svgCompMiss2SqRect('right'), o:[{val:'A square the same size as the right piece'},{val:'A triangle',tag:_54MP},{val:'Any square',tag:_54SZ},{val:'A rectangle',tag:_54MP}], a:0, e:'Only a square of the same size fills the empty outline exactly.', d:'h', h:'Trace the dashed outline — match its size and shape exactly.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'A student says "any triangle will fit the empty diagonal space." Is that correct?', s:_svgCompMiss2TriRect('lower'), o:[{val:'No — only a triangle the same size and shape as the empty space fits'},{val:'Yes — any triangle works',tag:_54SZ},{val:'No — a square would fit better',tag:_54MP},{val:'Yes — triangles all match',tag:_54SZ}], a:0, e:'The piece must match the exact shape and size of the empty space.', d:'h', h:'Pieces must fit exactly.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'What is missing to complete this rectangle?', s:_svgCompMiss2TriRect('lower'), o:[{val:'A right triangle that mirrors the filled piece'},{val:'Any triangle',tag:_54SZ},{val:'A square',tag:_54MP},{val:'A small rectangle',tag:_54MP}], a:0, e:'The missing piece is a right triangle mirroring the filled one.', d:'h', h:'A right triangle has one square corner (90 degrees).', sk:'compose_2d_shapes', i:_i54MP()},
  {t:'If you put the wrong-shaped piece in the empty space, what happens?', s:_svgCompMiss2TriSq('right'), o:[{val:'The pieces will not fit — there will be gaps or overlaps'},{val:'The shape just looks bigger',tag:_54SZ},{val:'Nothing — any piece works',tag:_54SZ},{val:'The shape becomes a circle',tag:_54MP}], a:0, e:'Pieces must match the empty outline exactly. Wrong shape = gaps or overlaps.', d:'h', h:'Pieces must fit edge-to-edge.', sk:'compose_2d_shapes', i:_i54SZ()}
];

// ── C5: Same target, different pieces (5E + 8M + 5H = 18) ────────────────────

var _l54C5 = [
  // Easy (5)
  {t:'A rectangle can be made from two squares. Can it ALSO be made from two triangles?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'Yes — both make a rectangle'},{val:'No — only squares work',tag:_54CS},{val:'No — only triangles work',tag:_54CS},{val:'No — rectangles are not made from pieces',tag:_54CS}], a:0, e:'A rectangle can be made multiple ways — from squares, or from right triangles.', d:'e', h:'Look at both pictures — what is the OUTSIDE shape of each?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Both pictures show what shape on the outside?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Two different shapes',tag:_54CS}], a:0, e:'Both shapes are rectangles — even though their pieces are different.', d:'e', h:'Look at the outside outline of each picture.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Two squares make a rectangle. Two rectangles ALSO make a rectangle. True or false?', s:_svgRow2(_svgComp2SqRect(),_svgComp2RectRect()), o:[{val:'True'},{val:'False',tag:_54CS}], a:0, e:'True — both piece sets make a larger rectangle.', d:'e', h:'Look at both outside outlines.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'A square can be made from two triangles. Can it also be made from four small squares?', s:_svgRow2(_svgComp2TriSq(),_svgComp4SqSq()), o:[{val:'Yes — both can build a square'},{val:'No — only triangles work',tag:_54CS},{val:'No — small squares are too small',tag:_54SZ},{val:'No — you need a circle',tag:_54CS}], a:0, e:'Yes — a square can be built from 2 triangles OR from 4 small squares. Different pieces, same target.', d:'e', h:'Both pictures end up as a square on the outside.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'The same shape can be built different ways. What shape do BOTH pictures show?', s:_svgRow2(_svgComp2TriSq(),_svgComp4SqSq()), o:[{val:'Square'},{val:'Rectangle',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'They are different shapes',tag:_54CS}], a:0, e:'Both pictures show squares on the outside — they just used different pieces.', d:'e', h:'Look at the outside outline of each.', sk:'compose_2d_shapes', i:_i54CS()},

  // Medium (8)
  {t:'Two squares make a rectangle. Two triangles ALSO make a rectangle. Why is this possible?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'Different pieces can join to make the same outside shape'},{val:'The pieces must always be the same',tag:_54CP},{val:'Only squares can make rectangles',tag:_54CS},{val:'Only triangles can make rectangles',tag:_54CS}], a:0, e:'The same target shape can be built from different pieces, as long as the outside outline matches.', d:'m', h:'Look at what the OUTSIDE shape is for each picture.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Which target shape can be made BOTH from 2 squares AND from 2 right triangles?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Triangle',tag:_54CP},{val:'Hexagon',tag:_54CS}], a:0, e:'Both piece sets build a rectangle.', d:'m', h:'Trace each outside outline.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'A square can be built from two triangles. Which OTHER pieces can build a square?', s:_svgComp4SqSq(), o:[{val:'Four small equal squares'},{val:'Three triangles',tag:_54CP},{val:'Two rectangles',tag:_54CP},{val:'A circle and a square',tag:_54CP}], a:0, e:'Four equal squares in a 2×2 grid build a larger square.', d:'m', h:'Look at the picture — how many small pieces? What shape do they form?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Both pictures form rectangles. What is different between them?', s:_svgRow2(_svgComp2SqRect(),_svgComp2RectRect()), o:[{val:'The pieces inside are different shapes'},{val:'They are the same picture',tag:_54CS},{val:'The outside shape is different',tag:_54CS},{val:'One is a square, the other is a rectangle',tag:_54SA}], a:0, e:'Both outside outlines are rectangles, but the pieces inside differ (squares vs. rectangles).', d:'m', h:'Look at the OUTSIDE first, then the inside pieces.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Can a rectangle be built from two squares?', s:_svgComp2SqRect(), o:[{val:'Yes — two equal squares side by side form a rectangle'},{val:'No — squares cannot make rectangles',tag:_54CS},{val:'No — rectangles are always one piece',tag:_54CS},{val:'Yes — but only one square is needed',tag:_54CN}], a:0, e:'Yes — placing two equal squares side by side creates a rectangle.', d:'m', h:'The picture shows the answer.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Can a rectangle ALSO be built from two right triangles?', s:_svgComp2TriRect(), o:[{val:'Yes — two right triangles meet at a diagonal to form a rectangle'},{val:'No — triangles cannot make rectangles',tag:_54CS},{val:'No — you need 4 triangles',tag:_54CN},{val:'Only with circles',tag:_54CP}], a:0, e:'Yes — two right triangles meeting at the diagonal form a rectangle.', d:'m', h:'The picture shows the answer.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Which is TRUE about building a rectangle?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'A rectangle can be built different ways (from squares, or from triangles)'},{val:'A rectangle can ONLY be built from squares',tag:_54CS},{val:'A rectangle can ONLY be built from triangles',tag:_54CS},{val:'Rectangles cannot be built from pieces',tag:_54CS}], a:0, e:'A rectangle can be built from squares, from triangles, or from smaller rectangles. Many ways.', d:'m', h:'Look at both pictures — both make a rectangle.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Both shapes have a square on the outside. What is different about them?', s:_svgRow2(_svgComp2TriSq(),_svgComp4SqSq()), o:[{val:'One uses 2 triangles, the other uses 4 small squares'},{val:'They are the same',tag:_54CS},{val:'One is bigger than the other',tag:_54SZ},{val:'One is a rhombus',tag:_54SA}], a:0, e:'Both outside shapes are squares — the pieces inside differ (2 triangles vs 4 small squares).', d:'m', h:'Count the pieces inside each picture.', sk:'compose_2d_shapes', i:_i54CN()},

  // Hard (5)
  {t:'A student says "you can only build a rectangle one way." Why is this wrong?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'A rectangle can be built from many piece sets — different pieces, same outside shape'},{val:'A rectangle cannot be built at all',tag:_54CS},{val:'A rectangle always needs 3 pieces',tag:_54CN},{val:'A rectangle is the same as a square',tag:_54SA}], a:0, e:'A target shape can be built different ways — the outline matters, not the specific pieces.', d:'h', h:'Look at the pictures — how many ways?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'Which statement is TRUE?', s:_svgRow2(_svgComp2TriSq(),_svgComp4SqSq()), o:[{val:'The same shape (square) can be made from different pieces'},{val:'The two pictures show different shapes',tag:_54CS},{val:'A square always needs exactly 2 pieces',tag:_54CN},{val:'A square cannot be made from squares',tag:_54CS}], a:0, e:'Both pictures show squares — but the first uses 2 triangles and the second uses 4 small squares.', d:'h', h:'Trace the outside of each picture.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'A rectangle can be built from 2 squares. It can also be built from 3 squares. Which is true?', s:_svgRow2(_svgComp2SqRect(),_svgComp3SqRect()), o:[{val:'Both make rectangles — the pieces are different but the outside is the same'},{val:'Only 2 squares make a rectangle',tag:_54CN},{val:'Only 3 squares make a rectangle',tag:_54CN},{val:'3 squares make a different shape',tag:_54CS}], a:0, e:'Both 2 squares in a row and 3 squares in a row form rectangles — the longer the row, the longer the rectangle.', d:'h', h:'Look at the outside outline of each.', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'Two ways to build a square: from 2 triangles or from 4 small squares. What stays the same in both?', s:_svgRow2(_svgComp2TriSq(),_svgComp4SqSq()), o:[{val:'The outside shape — both are squares'},{val:'The number of pieces',tag:_54CN},{val:'The shape of the pieces',tag:_54CP},{val:'Nothing stays the same',tag:_54CS}], a:0, e:'Outside = square in both cases. The pieces and their count differ.', d:'h', h:'What is the same in both pictures?', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'A rectangle can be made from 2 squares OR from 2 triangles OR from 2 smaller rectangles. What does this teach us?', s:_svgRow2(_svgComp2SqRect(),_svgComp2RectRect()), o:[{val:'The same shape can be built from many different sets of pieces'},{val:'Only one piece set works',tag:_54CS},{val:'Pieces must always be the same shape as the target',tag:_54CP},{val:'A rectangle always needs 4 pieces',tag:_54CN}], a:0, e:'The same target shape can be built many ways. The pieces can vary; the outline does not.', d:'h', h:'Think about the outside vs. the pieces.', sk:'compose_2d_shapes', i:_i54CS()}
];

// ── C6: 3-piece composition (4E + 5M + 6H = 15) ──────────────────────────────

var _l54C6 = [
  // Easy (4)
  {t:'Three squares are placed in a row. What shape do they make?', s:_svgComp3SqRect(), o:[{val:'A long rectangle'},{val:'A bigger square',tag:_54SA},{val:'A triangle',tag:_54CS},{val:'A hexagon',tag:_54CS}], a:0, e:'Three equal squares in a row form a long rectangle.', d:'e', h:'Are the four outside sides all the same length?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'What shape do 3 squares in a row form?', s:_svgComp3SqRect(), o:[{val:'Rectangle'},{val:'Square',tag:_54SA},{val:'Pentagon',tag:_54CS},{val:'Hexagon',tag:_54CS}], a:0, e:'3 squares in a row form a longer rectangle.', d:'e', h:'Trace the outside outline.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'Three equal squares are joined in a row. How many pieces are inside?', s:_svgComp3SqRect(), o:[{val:'3'},{val:'2',tag:_54CN},{val:'4',tag:_54CN},{val:'1',tag:_54CN}], a:0, e:'Three squares = 3 pieces. Two dividing lines mean 3 pieces.', d:'e', h:'Count the dividing lines, then add 1.', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'A rectangle is built from 3 equal pieces. What are the pieces?', s:_svgComp3SqRect(), o:[{val:'Three squares'},{val:'Three triangles',tag:_54CP},{val:'Three rectangles',tag:_54CP},{val:'A square and 2 triangles',tag:_54CP}], a:0, e:'The three pieces each have 4 equal sides — they are squares.', d:'e', h:'Look at each piece — how many sides each?', sk:'compose_2d_shapes', i:_i54CP()},

  // Medium (5)
  {t:'Three identical squares form what kind of shape on the outside?', s:_svgComp3SqRect(), o:[{val:'A long rectangle'},{val:'A square',tag:_54SA},{val:'Three separate shapes',tag:_54CN},{val:'A hexagon',tag:_54CS}], a:0, e:'The 3 squares form a long rectangle when placed in a row.', d:'m', h:'The 3 pieces together form ONE outside shape.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'How many corners are on the OUTSIDE of this 3-piece composite?', s:_svgComp3SqRect(), o:[{val:'4'},{val:'8',tag:_54SA},{val:'12',tag:_54SA},{val:'3',tag:_54CN}], a:0, e:'The outside outline is a rectangle — 4 corners only.', d:'m', h:'Count the outside corners, not the dividing lines.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A rectangle is made from 3 pieces. All pieces have 4 equal sides. What pieces are they?', s:_svgComp3SqRect(), o:[{val:'Three squares'},{val:'Three triangles',tag:_54CP},{val:'A square and two rectangles',tag:_54CP},{val:'Three circles',tag:_54CP}], a:0, e:'Each piece has 4 equal sides — that is a square. So three squares.', d:'m', h:'4 equal sides on each piece = which shape?', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'Look at this 3-piece shape. What is the outside shape?', s:_svgComp3SqRect(), o:[{val:'Rectangle'},{val:'Three squares',tag:_54CP},{val:'Square',tag:_54SA},{val:'Pentagon',tag:_54CS}], a:0, e:'The OUTSIDE is a single rectangle, even though there are 3 pieces inside.', d:'m', h:'The outside is one shape, not three.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'How many dividing lines are inside this shape, and how many pieces?', s:_svgComp3SqRect(), o:[{val:'2 lines, 3 pieces'},{val:'3 lines, 2 pieces',tag:_54CN},{val:'1 line, 2 pieces',tag:_54CN},{val:'4 lines, 4 pieces',tag:_54CN}], a:0, e:'2 dividing lines = 3 pieces (each line splits the shape once more).', d:'m', h:'Number of pieces = number of dividing lines + 1.', sk:'compose_2d_shapes', i:_i54CN()},

  // Hard (6)
  {t:'A rectangle is made from 3 squares. Can it ALSO be made from 2 squares?', s:_svgRow2(_svgComp3SqRect(),_svgComp2SqRect()), o:[{val:'Yes — both work; a rectangle can be made from different numbers of pieces'},{val:'No — only 3 squares work',tag:_54CN},{val:'No — only 2 squares work',tag:_54CN},{val:'No — 2 squares make a square',tag:_54SA}], a:0, e:'Both 2-square and 3-square arrangements build rectangles (different sized rectangles).', d:'h', h:'Look at both pictures.', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'A student counts 3 squares but sees the outside shape and says "it must be a triangle." Why is this wrong?', s:_svgComp3SqRect(), o:[{val:'The outside has 4 sides — that is a rectangle, not a triangle'},{val:'It is a triangle because there are 3 pieces',tag:_54CN},{val:'You need to count the pieces, not the sides',tag:_54CP},{val:'It is actually a hexagon',tag:_54CS}], a:0, e:'Number of pieces is NOT the number of sides. The outside outline has 4 sides — a rectangle.', d:'h', h:'How many SIDES are on the OUTSIDE?', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'The 3-piece shape has how many sides on its outside outline?', s:_svgComp3SqRect(), o:[{val:'4 sides'},{val:'8 sides',tag:_54SA},{val:'12 sides',tag:_54SA},{val:'3 sides',tag:_54CN}], a:0, e:'The outside outline has only 4 sides — a rectangle.', d:'h', h:'Trace the outside only.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A rectangle is built with 3 squares. All squares are the SAME size. What does this tell us?', s:_svgComp3SqRect(), o:[{val:'Each piece is the same shape AND the same size'},{val:'The pieces can be different sizes',tag:_54SZ},{val:'There are 4 pieces',tag:_54CN},{val:'The pieces are triangles',tag:_54CP}], a:0, e:'All three squares are identical: same shape (square) and same size.', d:'h', h:'Same shape AND same size.', sk:'compose_2d_shapes', i:_i54SZ()},
  {t:'Three squares in a row make a long rectangle. Could three triangles in a row make the same shape?', s:_svgComp3SqRect(), o:[{val:'Not exactly — different pieces would change the outline'},{val:'Yes — pieces never matter',tag:_54CS},{val:'No — you need exactly 2 pieces for a rectangle',tag:_54CN},{val:'Yes — if the triangles are big enough',tag:_54SZ}], a:0, e:'Three triangles in a row form a different shape — usually not a clean rectangle. The pieces matter.', d:'h', h:'Think about what 3 triangles in a row would look like.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'A 3-piece shape has 3 squares. Which 4-piece shape ALSO makes a square?', s:_svgRow2(_svgComp3SqRect(),_svgComp4SqSq()), o:[{val:'The 2-by-2 arrangement of 4 squares'},{val:'A row of 4 squares would also work',tag:_54SA},{val:'A row of 4 triangles',tag:_54CP},{val:'None — only 3 squares work',tag:_54CN}], a:0, e:'4 squares arranged in 2-by-2 (a grid) form a square. A row of 4 squares forms a longer rectangle.', d:'h', h:'How are the 4 squares arranged in the second picture?', sk:'compose_2d_shapes', i:_i54SA()}
];

// ── C7: 4-piece composition (8H = 8) ──────────────────────────────────────────

var _l54C7 = [
  {t:'Four equal squares are arranged in a 2-by-2 grid. What shape do they make?', s:_svgComp4SqSq(), o:[{val:'A larger square'},{val:'A rectangle',tag:_54SA},{val:'A hexagon',tag:_54CS},{val:'A rhombus',tag:_54SA}], a:0, e:'Four equal squares in a 2-by-2 arrangement form a larger square — all 4 outside sides equal.', d:'h', h:'Are the four outside sides equal?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'How many pieces are inside this composite shape?', s:_svgComp4SqSq(), o:[{val:'4'},{val:'2',tag:_54CN},{val:'3',tag:_54CN},{val:'8',tag:_54CN}], a:0, e:'Two dividing lines (one horizontal, one vertical) cross to form 4 pieces.', d:'h', h:'Count the cells.', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'A 2-by-2 arrangement of 4 squares makes which shape on the outside?', s:_svgComp4SqSq(), o:[{val:'A bigger square'},{val:'A rectangle',tag:_54SA},{val:'Four separate squares',tag:_54CN},{val:'A hexagon',tag:_54CS}], a:0, e:'Outside has 4 equal sides → a bigger square.', d:'h', h:'Are top and bottom the same length as the sides?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A student says four squares always make a rectangle. Is that correct?', s:_svgComp4SqSq(), o:[{val:'Not always — four equal squares in a 2-by-2 grid make a SQUARE, not a rectangle'},{val:'Yes — four squares always make a rectangle',tag:_54SA},{val:'No — four squares make a triangle',tag:_54CS},{val:'No — four squares make a hexagon',tag:_54CS}], a:0, e:'4 squares in a 2-by-2 grid make a square. 4 squares in a row make a rectangle. The arrangement matters.', d:'h', h:'Are the outside sides all the same length?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A larger square is built from how many smaller squares?', s:_svgComp4SqSq(), o:[{val:'4'},{val:'2',tag:_54CN},{val:'8',tag:_54CN},{val:'6',tag:_54CN}], a:0, e:'4 small squares in a 2-by-2 grid build a larger square.', d:'h', h:'Count the cells.', sk:'compose_2d_shapes', i:_i54CN()},
  {t:'Which is TRUE about this 4-piece shape?', s:_svgComp4SqSq(), o:[{val:'The outside is a square because all 4 sides are equal'},{val:'The outside is a rectangle',tag:_54SA},{val:'There are 8 corners on the outside',tag:_54SA},{val:'The pieces are triangles',tag:_54CP}], a:0, e:'4 squares in a 2-by-2 grid form a larger SQUARE. Outside: 4 equal sides + 4 corners.', d:'h', h:'Read each statement carefully.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A bigger square is made from 4 small squares. How many corners does the BIG square have on its outside?', s:_svgComp4SqSq(), o:[{val:'4'},{val:'8',tag:_54SA},{val:'16',tag:_54SA},{val:'12',tag:_54SA}], a:0, e:'The big square has 4 outside corners — the inside cross of lines does not add outside corners.', d:'h', h:'Count only the OUTSIDE corners.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'In this 4-piece shape, what shape is EACH piece?', s:_svgComp4SqSq(), o:[{val:'Each piece is a small square'},{val:'Each piece is a triangle',tag:_54CP},{val:'Each piece is a rectangle',tag:_54CP},{val:'Each piece is a circle',tag:_54CP}], a:0, e:'Each of the 4 pieces is a small square (4 equal sides).', d:'h', h:'Look at one cell — how many sides does it have?', sk:'compose_2d_shapes', i:_i54CP()}
];

// ── C8: Error repair (8H = 8) ─────────────────────────────────────────────────

var _l54C8 = [
  {t:'A student says: "Two triangles CANNOT make a square." What is wrong with that idea?', s:_svgComp2TriSq(), o:[{val:'Two right triangles CAN make a square when joined along their long edges'},{val:'The student is correct',tag:_54CS},{val:'Two triangles make a circle, not a square',tag:_54CS},{val:'Triangles cannot fit together',tag:_54SZ}], a:0, e:'Two matching right triangles join to make a square — the picture shows exactly this.', d:'h', h:'The picture proves the student wrong.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'A student says: "If I rotate a triangle, it becomes a different shape." Is that right?', s:_svgRow2(_svgTriSm(0),_svgTriSm(120)), o:[{val:'No — turning a shape does not change its name'},{val:'Yes — direction changes the shape',tag:_54OR},{val:'Yes — a turned triangle is a square',tag:_54OR},{val:'Only if the triangle is small',tag:_54SZ}], a:0, e:'A turned, flipped, or tilted triangle is still a triangle.', d:'h', h:'Orientation is non-defining.', sk:'compose_2d_shapes', i:_i54OR()},
  {t:'A student looks at a square made from 2 triangles and says: "The composite has 5 sides because the diagonal counts." What is wrong?', s:_svgComp2TriSq(), o:[{val:'The diagonal is INSIDE — it is not part of the outside outline'},{val:'The composite really does have 5 sides',tag:_54SA},{val:'The composite is actually a pentagon',tag:_54CS},{val:'The diagonal is the only side that matters',tag:_54SA}], a:0, e:'Only OUTSIDE edges count. The interior line is just a piece divider.', d:'h', h:'Trace the outside only.', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A student says: "Pieces must always be the same shape as the target." Is this true?', s:_svgComp2TriSq(), o:[{val:'No — pieces can be different shapes from the target (triangles can make a square)'},{val:'Yes — pieces always match the target',tag:_54CP},{val:'Only if the target is small',tag:_54SZ},{val:'Yes — but only for circles',tag:_54CP}], a:0, e:'Pieces and target can have different shapes. Triangles can make squares.', d:'h', h:'Look at the picture.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'A student says: "Two squares are needed to make a rectangle." Is that the ONLY way?', s:_svgRow2(_svgComp2SqRect(),_svgComp2TriRect()), o:[{val:'No — you can also make a rectangle from 2 triangles, or from 2 smaller rectangles'},{val:'Yes — squares are the only way',tag:_54CS},{val:'Yes — but only the smallest squares',tag:_54SZ},{val:'No — you need exactly 4 pieces',tag:_54CN}], a:0, e:'A rectangle can be built many ways — from squares, triangles, or smaller rectangles.', d:'h', h:'There are many paths to the same shape.', sk:'compose_2d_shapes', i:_i54CS()},
  {t:'A student looks at a house picture and says: "It is a hexagon." Is that right?', s:_svgCompSqTri(), o:[{val:'The house has 5 outside corners — but it is not a Grade 1 named shape. We name the pieces (a square and a triangle).'},{val:'Yes — it is a hexagon',tag:_54SA},{val:'Yes — it has 6 sides',tag:_54SA},{val:'No — it is a pentagon (5 sides)',tag:_54SA}], a:0, e:'The house composite is not a Grade 1 named shape. We name the PIECES (square + triangle), not the whole.', d:'h', h:'Some composite shapes are not named single shapes.', sk:'compose_2d_shapes', i:_i54CP()},
  {t:'A student says: "Four squares always make a square." Is that right?', s:_svgComp4SqSq(), o:[{val:'Only if they are arranged in a 2-by-2 grid. In a row they make a long rectangle.'},{val:'Yes — always',tag:_54SA},{val:'No — four squares always make a rectangle',tag:_54SA},{val:'Yes — but only big squares',tag:_54SZ}], a:0, e:'The ARRANGEMENT matters. 4 squares in a 2-by-2 grid → square. In a 1-by-4 row → rectangle.', d:'h', h:'How are the 4 squares arranged here?', sk:'compose_2d_shapes', i:_i54SA()},
  {t:'A student says: "A small triangle can fit in a big triangle\'s spot." Why is this wrong for completing a shape?', s:_svgCompMiss2TriSq('left'), o:[{val:'The piece must match the SIZE of the empty space, not just the shape'},{val:'Triangles never fit',tag:_54MP},{val:'Small triangles never exist',tag:_54SZ},{val:'A square would work better',tag:_54MP}], a:0, e:'Same shape AND same size are both required for a piece to fit.', d:'h', h:'Pieces must fit edge-to-edge — exactly.', sk:'compose_2d_shapes', i:_i54SZ()}
];

// ── L5.4 bank assembly ────────────────────────────────────────────────────────

var _l54Bank = _colorizeQ([].concat(_l54C1, _l54C2, _l54C3, _l54C4, _l54C5, _l54C6, _l54C7, _l54C8));

// ── L5.4 worked examples ──────────────────────────────────────────────────────

var _l54Examples = [
  {
    id: 'g1-u5-l4-ex-1',
    title: 'Example 1: Two triangles → square',
    prompt: 'You have two matching right triangles. What shape do they make when joined along their long edges?',
    steps: [
      'Each piece is a triangle — 3 sides, 3 corners.',
      'Slide one triangle next to the other so the long edges (hypotenuses) match up.',
      'Look at the outside outline of the joined shape.',
      'The outside has 4 equal sides and 4 corners.',
      '4 equal sides + 4 corners = a square.'
    ],
    finalAnswer: 'Two matching right triangles make a square.'
  },
  {
    id: 'g1-u5-l4-ex-2',
    title: 'Example 2: Two squares → rectangle',
    prompt: 'Two equal squares are placed side by side. What shape do they form?',
    steps: [
      'Each piece is a square — 4 equal sides, 4 corners.',
      'Place one square right next to the other.',
      'Look at the outside outline — 4 sides, 4 corners.',
      'Two sides are now LONGER (top and bottom). Two are shorter (left and right).',
      'A 4-sided shape with 2 long + 2 short sides is a rectangle.'
    ],
    finalAnswer: 'Two equal squares side by side make a rectangle.'
  },
  {
    id: 'g1-u5-l4-ex-3',
    title: 'Example 3: Identify pieces inside a composite',
    prompt: 'A rectangle has a single vertical line down the middle. What pieces is it made from?',
    steps: [
      'A dividing line inside means the shape is made from pieces.',
      'Look at each half separately.',
      'Each half has 4 equal sides — that is a square.',
      'The rectangle is made from two equal squares.'
    ],
    finalAnswer: 'The two pieces are squares.'
  },
  {
    id: 'g1-u5-l4-ex-4',
    title: 'Example 4: Missing piece',
    prompt: 'A square has a triangle on the left, and an empty dashed outline on the right. Which piece completes the square?',
    steps: [
      'Trace the empty outline — it has 3 sides and 3 corners.',
      'That is a triangle shape.',
      'It must be the same SIZE as the empty space — not bigger or smaller.',
      'A matching right triangle (mirror of the left piece) fills the space.',
      'Slide it in: together the two triangles form a square.'
    ],
    finalAnswer: 'A matching right triangle (the mirror of the filled piece) completes the square.'
  },
  {
    id: 'g1-u5-l4-ex-5',
    title: 'Example 5: Same target, different pieces',
    prompt: 'A rectangle can be made from two squares. Can it ALSO be made from two right triangles?',
    steps: [
      'Look at the outside outline: a rectangle has 4 sides (2 long + 2 short) and 4 corners.',
      'Two squares side by side: the outside has 4 sides (2 long + 2 short) — that is a rectangle.',
      'Two right triangles meeting at a diagonal: the outside ALSO has 4 sides (2 long + 2 short) — also a rectangle.',
      'Same outside shape, different pieces.',
      'The same target can be built different ways.'
    ],
    finalAnswer: 'Yes — a rectangle can be made from two squares OR from two right triangles.'
  },
  {
    id: 'g1-u5-l4-ex-6',
    title: 'Example 6: Three squares in a row',
    prompt: 'Three equal squares are placed in a row. What shape do they form, and how many pieces?',
    steps: [
      'There are 3 pieces. Each is a square (4 equal sides).',
      'Place them in a row, touching edge-to-edge.',
      'Look at the outside outline: 4 sides — the top and bottom are LONG (3 squares wide), the left and right are SHORT (1 square tall).',
      '4 sides with 2 long + 2 short = a rectangle.',
      'So three squares in a row make a long rectangle.'
    ],
    finalAnswer: 'Three squares in a row make a long rectangle. There are 3 pieces.'
  }
];

// ── L5.4 key ideas ────────────────────────────────────────────────────────────

var _l54KeyIdeas = [
  'Small shapes can be joined together to make a larger shape.',
  'Two right triangles can fit together to make a square or a rectangle.',
  'Two squares placed side by side make a rectangle. Two rectangles side by side make a bigger rectangle.',
  'Turning or flipping a piece does not change its name — a flipped triangle is still a triangle.',
  'To name the joined shape, look at the OUTSIDE outline only — the interior dividing line does not add sides.',
  'The same target shape can be built in many ways — from different sets of pieces.'
];

// ══════════════════════════════════════════════════════════════════════════════
//  Lesson 5.5 — Equal Parts — Halves and Fourths — Helpers
// ══════════════════════════════════════════════════════════════════════════════

// ── L5.5 error tag shorthands ─────────────────────────────────────────────────
var _55WN = 'err_wrong_fraction_name';       // Named halves when fourths (or vice versa)
var _55PC = 'err_wrong_part_count';          // Counted parts wrong
var _55UP = 'err_unequal_parts';             // Accepted unequal parts as halves/fourths
var _55EQ = 'err_equal_parts_confusion';     // Rejected equal parts as not equal
var _55HF = 'err_halves_fourths_confusion';  // Confused halves with fourths specifically
var _55SP = 'err_shape_partition_confusion'; // Named the shape rather than the parts
var _55NE = 'err_nonexample_confusion';      // Accepted a non-example as halves/fourths

// ── L5.5 equal-partition question visual helpers ───────────────────────────────
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

// ── L5.5 unequal-partition question visual helpers ─────────────────────────────
function _svgUneqHalfCircle() {
  // Chord at x=42 (not center 60). Left slice ~33% width, right ~67%.
  // y bounds: 60 ± sqrt(52^2 - 18^2) ≈ 60 ± 48.8 → y1=11, y2=109
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

// ── L5.5 teaching visual helpers ─────────────────────────────────────────────
function _tv55Equal() {
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
    'Touch and count each piece: 1…2 (halves)   or   1…2…3…4 (fourths)'
  );
}

function _tv55HalvesFourths() {
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

// ── L5.5 intervention factories ───────────────────────────────────────────────
function _i55WN(exp) {
  return {
    errorTag: _55WN,
    title: 'Count the equal parts to choose the name',
    teachingSteps: [
      'Count the equal parts: touch each one.',
      '2 equal parts → the parts are called halves.',
      '4 equal parts → the parts are called fourths.',
      'The name tells you HOW MANY equal parts there are.',
      'Always count before you name.'
    ],
    teachingVisualRaw: _tv55HalvesFourths(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i55PC(exp) {
  return {
    errorTag: _55PC,
    title: 'Count each piece carefully',
    teachingSteps: [
      'Touch each piece one by one.',
      'Count: 1 … 2 … (or 1 … 2 … 3 … 4 …)',
      'Each separated region inside the shape is one part.',
      'Number of dividing lines + 1 = number of parts. (1 line = 2 parts. 3 lines = 4 parts.)',
      'Only count the pieces INSIDE the shape, not outside.'
    ],
    teachingVisualRaw: _tv55Count(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i55UP(exp) {
  return {
    errorTag: _55UP,
    title: 'Equal parts must be the SAME size',
    teachingSteps: [
      'Look at each piece — are they the same size?',
      'For halves: BOTH parts must be the same size.',
      'For fourths: ALL FOUR parts must be the same size.',
      'If any piece is bigger or smaller, the parts are NOT equal.',
      'Look at the dividing line — is it exactly in the middle?'
    ],
    teachingVisualRaw: _tv55Equal(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i55EQ(exp) {
  return {
    errorTag: _55EQ,
    title: 'If all parts look the same size, they are equal',
    teachingSteps: [
      'Equal means every piece is the same size.',
      'Check: do all pieces look the same?',
      'If yes → the parts are equal.',
      '2 equal parts = halves. 4 equal parts = fourths.',
      'Equal parts do not have to be the same shape — just the same size.'
    ],
    teachingVisualRaw: _tv55Equal(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i55HF(exp) {
  return {
    errorTag: _55HF,
    title: '2 equal parts = halves. 4 equal parts = fourths.',
    teachingSteps: [
      'Count the parts: 1 … 2 … (stop here → 2 parts → halves)',
      'Count the parts: 1 … 2 … 3 … 4 (4 parts → fourths)',
      '“Halves” and “fourths” sound alike — always COUNT first.',
      '2 parts = halves. 4 parts = fourths. They are different.'
    ],
    teachingVisualRaw: _tv55HalvesFourths(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i55SP(exp) {
  return {
    errorTag: _55SP,
    title: 'Name the PARTS, not the shape',
    teachingSteps: [
      'The question asks what the PARTS are called, not what shape it is.',
      'A circle split into 2 equal parts is still a circle.',
      'The name of the PARTS is “halves” — because there are 2 equal parts.',
      'A square split into 4 equal parts is still a square.',
      'The name of the PARTS is “fourths” — because there are 4 equal parts.'
    ],
    teachingVisualRaw: _tv55MultiWay(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

function _i55NE(exp) {
  return {
    errorTag: _55NE,
    title: 'Check: are the parts equal?',
    teachingSteps: [
      'Look at the dividing line — is it exactly in the center?',
      'If one part is bigger than the other, it is NOT halves.',
      'Halves = 2 parts, BOTH the same size.',
      'Fourths = 4 parts, ALL the same size.',
      'The number of parts alone is not enough — they MUST be equal.'
    ],
    teachingVisualRaw: _tv55Equal(),
    correctAnswerExplanation: exp,
    followUpRule: 'same_skill_new_numbers',
    doNotRepeatOriginalQuestion: true
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  Unit 5 Spec
// ══════════════════════════════════════════════════════════════════════════════


// ── L5.5 C1: Name the halves (18E + 8M = 26) ─────────────────────────────────
var _l55C1 = [
  // Easy 1-6 (circles and squares)
  {t:'What are the 2 equal parts of this circle called?', s:_svgHalfCircleV(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Two equal parts are called halves — half means one of 2 equal pieces.', d:'e', h:'How many equal parts are shown?', sk:'equal_parts_halves_fourths', i:_i55HF('There are 2 equal parts, so the parts are called halves, not fourths.')},
  {t:'A circle is split into 2 equal parts. The parts are called ___.', s:_svgHalfCircleH(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'When a shape is split into 2 equal parts, the parts are called halves.', d:'e', h:'Count the equal pieces. Are there 2 or 4?', sk:'equal_parts_halves_fourths', i:_i55HF('Count the parts: 1, 2. Two equal parts = halves.')},
  {t:'What are the 2 equal parts of this square called?', s:_svgHalfSquareV(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Halves'},{val:'Fourths',tag:_55HF}], a:2, e:'Two equal parts = halves. The word "halves" means 2 equal pieces.', d:'e', h:'The line goes right through the middle — how many pieces?', sk:'equal_parts_halves_fourths', i:_i55HF('There are 2 equal parts here. Two equal parts are called halves.')},
  {t:'A square is cut into 2 equal pieces. What are the pieces called?', s:_svgHalfSquareH(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Fourths',tag:_55HF},{val:'Halves'}], a:3, e:'A shape split into 2 equal pieces shows halves — each piece is one half.', d:'e', h:'Are there 2 equal pieces or 4 equal pieces?', sk:'equal_parts_halves_fourths', i:_i55HF('This square is cut into 2 equal pieces. Two equal parts = halves.')},
  {t:'What are the 2 equal parts of this rectangle called?', s:_svgHalfRectV(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Halves means 2 equal parts. Each part is one half of the whole shape.', d:'e', h:'How many equal parts do you see?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. Two equal parts are called halves.')},
  {t:'This rectangle shows 2 equal parts. The parts are called ___.', s:_svgHalfRectH(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'The 2 equal parts are halves. Two equal parts always make halves.', d:'e', h:'Touch each piece. How many are there?', sk:'equal_parts_halves_fourths', i:_i55HF('There are 2 equal parts. Two equal parts are called halves.')},
  // Easy 7-12 (varying shapes + wordings)
  {t:'The circle is split into 2 equal parts. What are they called?', s:_svgHalfCircleV(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Halves'},{val:'Fourths',tag:_55HF}], a:2, e:'Two equal parts are called halves. The line goes right through the middle.', d:'e', h:'Is the line in the middle? How many parts does it make?', sk:'equal_parts_halves_fourths', i:_i55HF('The line goes through the center making 2 equal parts. Two equal parts = halves.')},
  {t:'The square is cut into 2 equal pieces. What do you call these pieces?', s:_svgHalfSquareV(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Fourths',tag:_55HF},{val:'Halves'}], a:3, e:'These 2 equal pieces are halves — "halves" means 2 parts of equal size.', d:'e', h:'How many pieces are there?', sk:'equal_parts_halves_fourths', i:_i55WN('There are 2 equal pieces. Two equal pieces are called halves.')},
  {t:'A line cuts this rectangle into 2 equal parts. What are the parts called?', s:_svgHalfRectV(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'2 equal parts = halves. One cut makes 2 equal parts.', d:'e', h:'One line makes how many pieces?', sk:'equal_parts_halves_fourths', i:_i55HF('One line makes 2 equal parts. Two equal parts = halves.')},
  {t:'Two equal parts of a circle are called ___.', s:_svgHalfCircleH(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'Two equal parts of any shape are called halves.', d:'e', h:'Two equal parts are always called ___?', sk:'equal_parts_halves_fourths', i:_i55HF('Two equal parts are called halves. Fourths would need 4 equal parts.')},
  {t:'When a shape has 2 equal parts, the parts are called ___.', s:_svgHalfSquareH(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Halves'},{val:'Fourths',tag:_55HF}], a:2, e:'Two equal parts = halves. Count: 2 equal pieces → halves.', d:'e', h:'Count the pieces. Are they equal? How many?', sk:'equal_parts_halves_fourths', i:_i55HF('Two equal parts are called halves. Fourths would need 4 parts.')},
  {t:'Look at the 2 equal parts of this rectangle. What are they called?', s:_svgHalfRectH(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Fourths',tag:_55HF},{val:'Halves'}], a:3, e:'These are halves: 2 equal parts, both the same size.', d:'e', h:'Both pieces look the same size. How many pieces are there?', sk:'equal_parts_halves_fourths', i:_i55SP('The question asks what the PARTS are called. Two equal parts are halves.')},
  // Easy 13-18 (varied prompts)
  {t:'The dividing line makes 2 equal parts. The parts are called ___.', s:_svgHalfCircleV(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'The line goes through the center making 2 equal parts: halves.', d:'e', h:'The line is right in the middle — how many equal pieces does it make?', sk:'equal_parts_halves_fourths', i:_i55HF('The center line makes 2 equal parts. Two equal parts = halves.')},
  {t:'This shape is split into 2 equal pieces. What are the pieces called?', s:_svgHalfSquareV(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'2 equal pieces are called halves — each piece is one half.', d:'e', h:'How many pieces are there? Are they equal?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. Two equal parts are called halves, not fourths.')},
  {t:'2 equal parts of a shape are called ___.', s:_svgHalfRectV(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Halves'},{val:'Fourths',tag:_55HF}], a:2, e:'Two equal parts of a shape are called halves.', d:'e', h:'Two equal parts are always called what?', sk:'equal_parts_halves_fourths', i:_i55WN('Two equal parts = halves. Fourths means 4 equal parts.')},
  {t:'This circle shows 2 equal pieces. What are they called?', s:_svgHalfCircleH(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Fourths',tag:_55HF},{val:'Halves'}], a:3, e:'2 equal pieces = halves. Both pieces are the same size.', d:'e', h:'Are both pieces the same size? How many are there?', sk:'equal_parts_halves_fourths', i:_i55HF('Both pieces are equal and there are 2 of them. Two equal parts = halves.')},
  {t:'The square is cut into 2 equal parts. The parts are called ___.', s:_svgHalfSquareH(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'The two equal parts are called halves — two parts of equal size.', d:'e', h:'Count the equal parts.', sk:'equal_parts_halves_fourths', i:_i55HF('The square shows 2 equal parts. Two equal parts are called halves.')},
  {t:'What do you call the 2 equal pieces of this rectangle?', s:_svgHalfRectH(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'Two equal pieces are halves — both have the same size.', d:'e', h:'How many equal pieces do you see?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. Two equal pieces are called halves.')},
  // Medium 19-26
  {t:'A circle is cut into 2 parts. Both parts are the same size. Which word names these parts?', s:_svgHalfCircleV(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Halves'},{val:'Fourths',tag:_55HF}], a:2, e:'The 2 parts are the same size, so they are halves — not fourths (fourths means 4 parts).', d:'m', h:'Same size AND 2 parts. What is that called?', sk:'equal_parts_halves_fourths', i:_i55HF('2 parts, same size = halves. Fourths needs 4 equal parts.')},
  {t:'A friend says these 2 equal pieces are called "fourths." What is the correct name?', s:_svgHalfRectV(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Fourths',tag:_55HF},{val:'Halves'}], a:3, e:'Two equal pieces are halves, not fourths. Fourths means 4 equal parts.', d:'m', h:'Count the parts. Is it 2 or 4?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. There are only 2 parts. Two equal parts = halves, not fourths.')},
  {t:'A square is divided into 2 equal parts. Which word names what the equal parts are called?', s:_svgHalfSquareV(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Two equal parts = halves. Fourths would mean 4 equal parts.', d:'m', h:'Are there 2 equal parts or 4 equal parts?', sk:'equal_parts_halves_fourths', i:_i55HF('Two equal parts = halves. Fourths means 4 equal parts — count to check.')},
  {t:'Which word correctly names the equal parts shown?', s:_svgHalfCircleH(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'Two equal, same-size parts are halves.', d:'m', h:'How many parts? Are they equal?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. Two equal parts. Two equal parts are called halves.')},
  {t:'These two pieces make the whole rectangle. What are the equal parts called?', s:_svgHalfRectH(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Halves'},{val:'Fourths',tag:_55HF}], a:2, e:'Two equal parts are halves — the two pieces are the same size.', d:'m', h:'There are 2 equal pieces. 2 equal parts are called what?', sk:'equal_parts_halves_fourths', i:_i55HF('Two equal pieces make the whole. Two equal parts = halves.')},
  {t:'The line splits the square into 2 equal parts. What is the correct name for 2 equal parts of a shape?', s:_svgHalfSquareH(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Fourths',tag:_55HF},{val:'Halves'}], a:3, e:'Halves = 2 equal parts. Check: the line is in the middle, so the parts are equal.', d:'m', h:'Is the line in the middle? How many parts?', sk:'equal_parts_halves_fourths', i:_i55HF('The midline makes 2 equal parts. The name for 2 equal parts is halves.')},
  {t:'Which word best names the 2 equal parts of this circle?', s:_svgHalfCircleV(), o:[{val:'Halves'},{val:'Fourths',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'These 2 equal parts are halves. Always count the parts first.', d:'m', h:'Count the equal parts. Then choose the name.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. That is 2 equal parts — the name is halves.')},
  {t:'A rectangle is split into 2 equal parts by one line. What are the parts called?', s:_svgHalfRectV(), o:[{val:'Fourths',tag:_55HF},{val:'Halves'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'One dividing line makes 2 equal parts: those are halves.', d:'m', h:'One line makes how many pieces?', sk:'equal_parts_halves_fourths', i:_i55PC('One line makes 2 parts. Two equal parts = halves. Three lines would make 4 parts = fourths.')}
];

// ── L5.5 C2: Name the fourths (14E + 8M = 22) ────────────────────────────────
var _l55C2 = [
  // Easy 1-6
  {t:'What are the 4 equal parts of this circle called?', s:_svgFourthCircle(), o:[{val:'Fourths'},{val:'Halves',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Four equal parts are called fourths — each piece is one fourth.', d:'e', h:'How many equal parts are shown?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths.')},
  {t:'A square is split into 4 equal parts. The parts are called ___.', s:_svgFourthSquare(), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'When a shape is split into 4 equal parts, the parts are called fourths.', d:'e', h:'Count the equal pieces. Is it 2 or 4?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths, not halves.')},
  {t:'What are the 4 equal parts of this rectangle called?', s:_svgFourthRectV(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Fourths'},{val:'Halves',tag:_55HF}], a:2, e:'4 equal parts = fourths. Three lines make 4 equal columns.', d:'e', h:'Count the parts in this rectangle.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts are called fourths.')},
  {t:'A rectangle is divided into 4 equal parts. What are the parts called?', s:_svgFourthRectH(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Halves',tag:_55HF},{val:'Fourths'}], a:3, e:'The 4 equal parts are called fourths (also called quarters).', d:'e', h:'Are there 2 equal parts or 4 equal parts?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths, not halves.')},
  {t:'What are the 4 equal pieces of this circle called?', s:_svgFourthCircle(), o:[{val:'Fourths'},{val:'Halves',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Fourths means 4 equal parts. All 4 pieces are the same size.', d:'e', h:'Count each piece. How many are there?', sk:'equal_parts_halves_fourths', i:_i55HF('Count each piece: 1, 2, 3, 4. Four equal pieces = fourths.')},
  {t:'This square shows 4 equal parts. The parts are called ___.', s:_svgFourthSquare(), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'4 equal parts are called fourths. Each piece is one fourth.', d:'e', h:'Touch each piece and count. How many?', sk:'equal_parts_halves_fourths', i:_i55HF('There are 4 equal parts. Four equal parts = fourths.')},
  // Easy 7-14
  {t:'The circle is split into 4 equal parts. What are they called?', s:_svgFourthCircle(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Fourths'},{val:'Halves',tag:_55HF}], a:2, e:'Four equal parts are called fourths — the 2 lines cross in the center.', d:'e', h:'Count the sections in the circle.', sk:'equal_parts_halves_fourths', i:_i55HF('Four equal parts = fourths. Halves would only have 2 equal parts.')},
  {t:'4 equal parts of a shape are called ___.', s:_svgFourthSquare(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Halves',tag:_55HF},{val:'Fourths'}], a:3, e:'Four equal parts of any shape are called fourths.', d:'e', h:'Four equal parts are always called what?', sk:'equal_parts_halves_fourths', i:_i55HF('Four equal parts = fourths. Two equal parts = halves. Count first.')},
  {t:'A line splits this rectangle into 4 equal parts. What are the parts called?', s:_svgFourthRectV(), o:[{val:'Fourths'},{val:'Halves',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'The rectangle has 3 lines making 4 equal columns — those are fourths.', d:'e', h:'Count the equal columns.', sk:'equal_parts_halves_fourths', i:_i55PC('Count each column: 1, 2, 3, 4. Three lines make 4 parts = fourths.')},
  {t:'When a shape has 4 equal parts, the parts are called ___.', s:_svgFourthRectH(), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'Four equal parts = fourths. Count: 1, 2, 3, 4.', d:'e', h:'Count the pieces. Are there 2 or 4?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts are called fourths, not halves.')},
  {t:'What are the 4 equal pieces of this rectangle called?', s:_svgFourthRectV(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Fourths'},{val:'Halves',tag:_55HF}], a:2, e:'Four equal pieces in a row are fourths.', d:'e', h:'How many equal columns are in this rectangle?', sk:'equal_parts_halves_fourths', i:_i55HF('Count the columns: 1, 2, 3, 4. Four equal pieces = fourths.')},
  {t:'Look at the 4 equal parts of this square. What are they called?', s:_svgFourthSquare(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Halves',tag:_55HF},{val:'Fourths'}], a:3, e:'These are fourths: 4 equal parts, all the same size.', d:'e', h:'How many equal pieces are in this square?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths.')},
  {t:'The circle has 2 lines crossing it. What are the 4 equal parts called?', s:_svgFourthCircle(), o:[{val:'Fourths'},{val:'Halves',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Two crossing lines make 4 equal parts — those are fourths.', d:'e', h:'Two lines cross to make how many parts?', sk:'equal_parts_halves_fourths', i:_i55PC('Two crossing lines make 4 equal parts. Four equal parts = fourths.')},
  {t:'The 4 equal pieces of this rectangle are called ___.', s:_svgFourthRectH(), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'The 4 equal pieces are fourths — all four are the same size.', d:'e', h:'Count: how many equal pieces does this rectangle have?', sk:'equal_parts_halves_fourths', i:_i55HF('Four equal pieces = fourths. Halves would only have 2 equal pieces.')},
  // Medium 15-22
  {t:'A circle is cut into 4 parts. All parts are the same size. Which word names these parts?', s:_svgFourthCircle(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Fourths'},{val:'Halves',tag:_55HF}], a:2, e:'The 4 parts are the same size — they are fourths, not halves (halves only has 2 parts).', d:'m', h:'Same size AND 4 parts. What is that called?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths. Halves only has 2 parts.')},
  {t:'A friend says these 4 equal pieces are called "halves." What is the correct name?', s:_svgFourthSquare(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Halves',tag:_55HF},{val:'Fourths'}], a:3, e:'Four equal pieces are fourths, not halves. Halves means only 2 equal parts.', d:'m', h:'Count the parts. Is it 2 or 4?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. There are 4 parts. Four equal parts = fourths, not halves.')},
  {t:'A rectangle is divided into 4 equal parts. Which word names the parts?', s:_svgFourthRectV(), o:[{val:'Fourths'},{val:'Halves',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'Four equal parts = fourths. Halves would mean only 2 equal parts.', d:'m', h:'Are there 2 or 4 equal parts?', sk:'equal_parts_halves_fourths', i:_i55HF('Count the sections: 1, 2, 3, 4. Four equal parts = fourths.')},
  {t:'Which word correctly names the 4 equal parts shown?', s:_svgFourthRectH(), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'Four equal, same-size parts are fourths.', d:'m', h:'How many equal parts are shown? Count them.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths, not halves.')},
  {t:'These four pieces make the whole circle. What are the equal parts called?', s:_svgFourthCircle(), o:[{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP},{val:'Fourths'},{val:'Halves',tag:_55HF}], a:2, e:'Four equal parts are fourths — all four pieces are the same size.', d:'m', h:'There are 4 equal pieces. 4 equal parts are called what?', sk:'equal_parts_halves_fourths', i:_i55HF('Four equal pieces make the whole. Four equal parts = fourths.')},
  {t:'The lines split the square into 4 equal parts. What is the correct name for 4 equal parts of a shape?', s:_svgFourthSquare(), o:[{val:'Ones',tag:_55SP},{val:'Thirds',tag:_55WN},{val:'Halves',tag:_55HF},{val:'Fourths'}], a:3, e:'Fourths = 4 equal parts. Both midlines cross to make 4 equal sections.', d:'m', h:'Count the sections made by the two crossing lines.', sk:'equal_parts_halves_fourths', i:_i55PC('Two crossing lines make 4 equal parts. Four equal parts = fourths.')},
  {t:'Which word best names the 4 equal parts of this rectangle?', s:_svgFourthRectV(), o:[{val:'Fourths'},{val:'Halves',tag:_55HF},{val:'Thirds',tag:_55WN},{val:'Ones',tag:_55SP}], a:0, e:'These 4 equal parts are fourths. Always count the parts first.', d:'m', h:'Count the equal parts. Then choose the name.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. That is 4 equal parts — the name is fourths.')},
  {t:'A square is split into 4 equal parts by two lines. What are the parts called?', s:_svgFourthSquare(), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'Sixths',tag:_55PC}], a:1, e:'Two crossing lines make 4 equal parts: those are fourths.', d:'m', h:'Two lines make how many pieces?', sk:'equal_parts_halves_fourths', i:_i55PC('Two lines make 4 parts. Four equal parts = fourths. One line would make 2 parts = halves.')}
];

// ── L5.5 C3: Equal vs. unequal (10E + 8M + 4H = 22) ─────────────────────────
var _l55C3 = [
  // Easy 1-6: halves comparisons (same shape, equal vs unequal)
  {t:'Which circle shows 2 equal parts?', s:_svgRow2L(_svgHalfCircleV(),_svgUneqHalfCircle()), o:[{val:'Picture A'},{val:'Picture B',tag:_55UP},{val:'Both pictures show equal parts',tag:_55NE},{val:'Neither picture shows equal parts',tag:_55EQ}], a:0, e:'Picture A: the line goes through the center — both parts are equal. Picture B: the line is off-center, so one part is bigger.', d:'e', h:'Look at where the line is in each circle.', sk:'equal_parts_halves_fourths', i:_i55UP('In Picture A the line goes through the center, making 2 equal parts. Those are halves.')},
  {t:'Which square shows halves?', s:_svgRow2L(_svgUneqHalfSquare(),_svgHalfSquareV()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55EQ}], a:1, e:'Picture B: the line is in the middle — both parts are equal. Picture A: the line is off to one side.', d:'e', h:'Is the line in the middle or off to the side?', sk:'equal_parts_halves_fourths', i:_i55UP('The line must be in the middle for halves. Picture B has the line in the middle.')},
  {t:'Which rectangle shows 2 equal parts?', s:_svgRow2L(_svgHalfRectV(),_svgUneqHalfRect()), o:[{val:'Picture A'},{val:'Picture B',tag:_55UP},{val:'Both pictures show equal parts',tag:_55NE},{val:'Neither picture shows equal parts',tag:_55EQ}], a:0, e:'Picture A: the line is in the center making 2 equal parts. Picture B: the line is near one end.', d:'e', h:'Which rectangle has its line exactly in the middle?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A has the line in the center. Both parts are the same size — those are halves.')},
  {t:'Which circle shows halves?', s:_svgRow2L(_svgUneqHalfCircle(),_svgHalfCircleH()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55EQ}], a:1, e:'Picture B: a horizontal diameter makes 2 equal parts. Picture A: the line is off-center.', d:'e', h:'Look at where the line crosses the center.', sk:'equal_parts_halves_fourths', i:_i55UP('Picture B has the line through the center — 2 equal parts. That is halves.')},
  {t:'Which square shows equal parts?', s:_svgRow2L(_svgHalfSquareH(),_svgUneqHalfSquare()), o:[{val:'Picture A'},{val:'Picture B',tag:_55UP},{val:'Both pictures show equal parts',tag:_55NE},{val:'Neither picture shows equal parts',tag:_55EQ}], a:0, e:'Picture A: the horizontal midline makes 2 equal parts. Picture B: the line is off-center.', d:'e', h:'Is the dividing line exactly in the middle?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A: the line is in the middle. Both pieces are the same size — halves.')},
  {t:'Which rectangle shows halves?', s:_svgRow2L(_svgUneqHalfRect(),_svgHalfRectH()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55EQ}], a:1, e:'Picture B: the midline makes 2 equal rows. Picture A: the line is near one end.', d:'e', h:'Which one has the line in the middle?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture B: the midline divides the rectangle into 2 equal parts — halves.')},
  // Easy 7-10: fourths comparisons
  {t:'Which square shows 4 equal parts?', s:_svgRow2L(_svgFourthSquare(),_svgUneqFourthSquare()), o:[{val:'Picture A'},{val:'Picture B',tag:_55UP},{val:'Both pictures show 4 equal parts',tag:_55NE},{val:'Neither picture shows 4 equal parts',tag:_55EQ}], a:0, e:'Picture A: both lines cross in the center making 4 equal parts. Picture B: the lines are off-center.', d:'e', h:'Are all 4 parts the same size in each picture?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A: the lines cross in the middle making 4 equal parts — those are fourths.')},
  {t:'Which rectangle shows fourths?', s:_svgRow2L(_svgUneqFourthRect(),_svgFourthRectV()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Both pictures show fourths',tag:_55NE},{val:'Neither picture shows fourths',tag:_55EQ}], a:1, e:'Picture B: 3 evenly spaced lines make 4 equal columns. Picture A: the lines are unevenly spaced.', d:'e', h:'Are all 4 columns the same width?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture B: the 3 evenly spaced lines make 4 equal parts — fourths.')},
  {t:'Which picture shows 4 equal parts?', s:_svgRow2L(_svgFourthCircle(),_svgUneqFourthSquare()), o:[{val:'Picture A'},{val:'Picture B',tag:_55UP},{val:'Both pictures show 4 equal parts',tag:_55NE},{val:'Neither picture shows 4 equal parts',tag:_55EQ}], a:0, e:'Picture A: the 2 crossing diameters make 4 equal parts in the circle. Picture B: the lines are off-center.', d:'e', h:'Look at each picture — are all the pieces the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A has 4 equal parts — fourths. Picture B has unequal parts.')},
  {t:'Which square shows fourths?', s:_svgRow2L(_svgUneqFourthSquare(),_svgFourthSquare()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Both pictures show fourths',tag:_55NE},{val:'Neither picture shows fourths',tag:_55EQ}], a:1, e:'Picture B: the cross lines are centered, making 4 equal parts. Picture A: the lines are off-center.', d:'e', h:'Which square has its lines through the exact middle?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture B has the lines in the middle making 4 equal parts — fourths.')},
  // Medium 11-18
  {t:'Both squares show a dividing line. Which one shows halves?', s:_svgRow2L(_svgHalfSquareV(),_svgHalfSquareH()), o:[{val:'Picture A only',tag:_55EQ},{val:'Picture B only',tag:_55EQ},{val:'Both pictures show halves'},{val:'Neither picture shows halves',tag:_55EQ}], a:2, e:'Both squares have a midline making 2 equal parts — both show halves. Direction does not matter.', d:'m', h:'Are the parts equal in Picture A? In Picture B?', sk:'equal_parts_halves_fourths', i:_i55SP('Both cuts make 2 equal parts, so both show halves. The direction of the cut does not matter.')},
  {t:'One of these pictures does NOT show halves. Which one?', s:_svgRow2L(_svgUneqHalfSquare(),_svgHalfSquareV()), o:[{val:'Picture A'},{val:'Picture B',tag:_55EQ},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55UP}], a:0, e:'Picture A: the line is off-center — one part is bigger. Picture B: the line is in the middle — equal parts.', d:'m', h:'Which picture has a line that is NOT in the middle?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A has an off-center line — the parts are not equal. That is NOT halves.')},
  {t:'Both rectangles are split in different ways. Which shows halves?', s:_svgRow2L(_svgHalfRectH(),_svgHalfRectV()), o:[{val:'Picture A only',tag:_55EQ},{val:'Picture B only',tag:_55EQ},{val:'Both pictures show halves'},{val:'Neither picture shows halves',tag:_55EQ}], a:2, e:'Both rectangles have their midlines (horizontal or vertical), making 2 equal parts — both show halves.', d:'m', h:'Check both: is the dividing line in the middle of each?', sk:'equal_parts_halves_fourths', i:_i55SP('Both have a line through the middle. Both show 2 equal parts = halves. Direction does not matter.')},
  {t:'Look at both pictures. Which one shows halves?', s:_svgRow2L(_svgUneqHalfCircle(),_svgUneqHalfSquare()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B',tag:_55UP},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves'}], a:3, e:'Neither picture shows halves — both have off-center lines, so one part is bigger in each.', d:'m', h:'Look at the line in each shape. Is it in the middle?', sk:'equal_parts_halves_fourths', i:_i55NE('Both pictures have off-center lines — the parts are NOT equal. Neither shows halves.')},
  {t:'Which picture shows 4 equal parts?', s:_svgRow2L(_svgFourthSquare(),_svgHalfSquareH()), o:[{val:'Picture A'},{val:'Picture B',tag:_55HF},{val:'Both pictures show 4 equal parts',tag:_55NE},{val:'Neither picture shows 4 equal parts',tag:_55EQ}], a:0, e:'Picture A has 4 equal parts (fourths). Picture B has only 2 equal parts (halves), not 4.', d:'m', h:'Count the equal parts in each picture.', sk:'equal_parts_halves_fourths', i:_i55PC('Count Picture A: 1, 2, 3, 4 equal parts. Count Picture B: 1, 2 equal parts. Only A has 4.')},
  {t:'Both circles show parts. Which circles show fourths?', s:_svgRow2L(_svgFourthCircle(),_svgFourthCircle()), o:[{val:'Picture A only',tag:_55EQ},{val:'Picture B only',tag:_55EQ},{val:'Both pictures show fourths'},{val:'Neither picture shows fourths',tag:_55EQ}], a:2, e:'Both circles have 2 perpendicular diameters making 4 equal parts — both show fourths.', d:'m', h:'Count the parts in each circle. Are they equal?', sk:'equal_parts_halves_fourths', i:_i55SP('Both circles have 4 equal parts — both show fourths. They look the same here.')},
  {t:'Which picture shows fourths but NOT halves?', s:_svgRow2L(_svgUneqFourthSquare(),_svgFourthCircle()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Both pictures show fourths',tag:_55NE},{val:'Neither picture shows fourths',tag:_55EQ}], a:1, e:'Picture B has 4 equal parts = fourths. Picture A has 4 parts but they are not equal — not fourths.', d:'m', h:'Are the parts in Picture A all the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A has unequal parts — NOT fourths. Picture B has 4 equal parts — those are fourths.')},
  {t:'Which picture shows 2 equal parts?', s:_svgRow2L(_svgHalfRectV(),_svgFourthRectV()), o:[{val:'Picture A'},{val:'Picture B',tag:_55HF},{val:'Both pictures show 2 equal parts',tag:_55NE},{val:'Neither picture shows 2 equal parts',tag:_55EQ}], a:0, e:'Picture A has 2 equal parts (halves). Picture B has 4 equal parts (fourths) — not 2.', d:'m', h:'Count the parts in each rectangle.', sk:'equal_parts_halves_fourths', i:_i55PC('Count Picture A: 1, 2 parts. Count Picture B: 1, 2, 3, 4 parts. Only A shows 2 equal parts.')},
  // Hard 19-22
  {t:'Both squares are cut differently. A student says only the horizontal cut shows halves. Is the student right?', s:_svgRow2(_svgHalfSquareH(),_svgHalfSquareV()), o:[{val:'Yes — only the horizontal cut is correct',tag:_55SP},{val:'No — both cuts show halves because both are equal'},{val:'No — neither shows halves',tag:_55EQ},{val:'Yes — only vertical cuts show halves',tag:_55SP}], a:1, e:'Both cuts make 2 equal parts. The direction does not matter — only equal size matters.', d:'h', h:'Are the parts equal in BOTH pictures?', sk:'equal_parts_halves_fourths', i:_i55SP('Both cuts go through the middle — both make 2 equal parts. Both show halves. Direction does not change equality.')},
  {t:'Neither picture shows equal parts. What is wrong?', s:_svgRow2(_svgUneqFourthSquare(),_svgUneqFourthRect()), o:[{val:'The lines need to be in the center of each shape'},{val:'Both pictures actually show fourths',tag:_55NE},{val:'The shapes need to be circles',tag:_55SP},{val:'The parts look equal to me',tag:_55UP}], a:0, e:'In both pictures the dividing lines are off-center — the parts are not equal, so neither shows fourths.', d:'h', h:'What would make the parts equal?', sk:'equal_parts_halves_fourths', i:_i55UP('The lines must go through the exact center for the parts to be equal. Off-center lines make unequal parts.')},
  {t:'Which picture shows halves?', s:_svgRow2L(_svgFourthRectV(),_svgHalfRectV()), o:[{val:'Picture A',tag:_55HF},{val:'Picture B'},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55EQ}], a:1, e:'Picture B has 1 line making 2 equal parts = halves. Picture A has 3 lines making 4 equal parts = fourths.', d:'h', h:'Count the equal parts in each picture.', sk:'equal_parts_halves_fourths', i:_i55PC('Count Picture A: 1, 2, 3, 4 parts = fourths. Count Picture B: 1, 2 parts = halves. Only B shows halves.')},
  {t:'Which picture shows halves? (Be careful — one circle has more lines.)', s:_svgRow2L(_svgHalfCircleV(),_svgFourthCircle()), o:[{val:'Picture A'},{val:'Picture B',tag:_55HF},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55EQ}], a:0, e:'Picture A has 1 line making 2 equal parts = halves. Picture B has 2 lines making 4 equal parts = fourths.', d:'h', h:'Count the dividing lines in each circle.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: Picture A has 1 line → 2 equal parts → halves. Picture B has 2 lines → 4 equal parts → fourths.')}
];

// ── L5.5 C4: Non-examples of halves (4E + 8M + 4H = 16) ──────────────────────
var _l55C4 = [
  // Easy 1-4 (2-choice Yes/No)
  {t:'Is this halves?', s:_svgUneqHalfCircle(), o:[{val:'Yes — it shows 2 parts',tag:_55NE},{val:'No — the parts are not equal'}], a:1, e:'Halves means 2 EQUAL parts. The line is off-center here — one part is bigger.', d:'e', h:'Is the line in the middle of the circle?', sk:'equal_parts_halves_fourths', i:_i55NE('The line is not through the center. One part is bigger — these are NOT equal parts, so this is not halves.')},
  {t:'Does this square show halves?', s:_svgUneqHalfSquare(), o:[{val:'Yes — it has 2 pieces',tag:_55UP},{val:'No — one piece is bigger'}], a:1, e:'Halves needs 2 pieces of EQUAL size. One piece is bigger here — not halves.', d:'e', h:'Are both pieces the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('For halves, both pieces must be the same size. One piece here is bigger — NOT halves.')},
  {t:'Is this rectangle divided into halves?', s:_svgUneqHalfRect(), o:[{val:'Yes — it has a line dividing it',tag:_55NE},{val:'No — the line is not in the middle'}], a:1, e:'The line is near one end — one part is much bigger. Halves needs the line in the exact middle.', d:'e', h:'Where is the dividing line compared to the middle?', sk:'equal_parts_halves_fourths', i:_i55NE('The line is near one end. For halves, the line must be in the exact middle so both parts are equal.')},
  {t:'Does this circle show halves?', s:_svgUneqHalfCircle(), o:[{val:'Yes',tag:_55UP},{val:'No — both pieces must be the same size'}], a:1, e:'Halves = 2 equal parts. One part here is much larger than the other — not halves.', d:'e', h:'Are both pieces the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('Halves means EQUAL size. Look: one piece is much bigger. This is NOT halves.')},
  // Medium 5-12 (4-choice)
  {t:'This square is cut into 2 parts. Does it show halves? Why?', s:_svgUneqHalfSquare(), o:[{val:'Yes — it shows 2 parts and 2 parts = halves',tag:_55NE},{val:'No — the parts are not equal'},{val:'Yes — any 2 pieces from a cut are halves',tag:_55UP},{val:'No — a square cannot show halves',tag:_55SP}], a:1, e:'Two parts alone is not enough — both parts must be EQUAL. One part here is bigger.', d:'m', h:'Are the 2 parts the same size?', sk:'equal_parts_halves_fourths', i:_i55NE('Two parts is not enough. Both parts must be equal for halves. Here one part is bigger — NOT halves.')},
  {t:'A line splits this rectangle into 2 pieces. Is this halves?', s:_svgUneqHalfRect(), o:[{val:'Yes — because there are 2 pieces',tag:_55NE},{val:'No — the pieces are different sizes'},{val:'Yes — because rectangles always show halves',tag:_55SP},{val:'No — there are too many pieces',tag:_55PC}], a:1, e:'Two pieces of DIFFERENT sizes is not halves. The line must be centered to make equal pieces.', d:'m', h:'Are the 2 pieces the same size?', sk:'equal_parts_halves_fourths', i:_i55NE('The line is not in the middle. The pieces are different sizes — NOT halves.')},
  {t:'Does this circle show halves?', s:_svgUneqHalfCircle(), o:[{val:'Yes — it has 2 parts',tag:_55UP},{val:'No — the parts are different sizes'},{val:'Yes — the chord goes all the way across',tag:_55NE},{val:'No — circles cannot show halves',tag:_55SP}], a:1, e:'The chord does not go through the center — the pieces are different sizes. Halves = 2 EQUAL parts.', d:'m', h:'Does the line go through the center of the circle?', sk:'equal_parts_halves_fourths', i:_i55UP('For halves, the line must go through the CENTER. This line does not — so the parts are unequal.')},
  {t:'Is this halves? A student says yes because it has 2 parts. What is wrong with the student\'s thinking?', s:_svgUneqHalfSquare(), o:[{val:'Nothing — the student is right',tag:_55NE},{val:'Having 2 parts is not enough — the parts must also be equal'},{val:'The square needs more lines',tag:_55PC},{val:'Halves only works for circles',tag:_55SP}], a:1, e:'The student counted correctly (2 parts) but forgot to check size. Halves = 2 EQUAL parts.', d:'m', h:'What does "halves" require besides 2 parts?', sk:'equal_parts_halves_fourths', i:_i55NE('Two parts is not enough. The parts must also be EQUAL in size. Count + equal = halves.')},
  {t:'This rectangle has a line near one end. Does it show halves?', s:_svgUneqHalfRect(), o:[{val:'Yes — it shows 2 separate pieces',tag:_55UP},{val:'No — the bigger piece is not equal to the smaller piece'},{val:'Yes — close enough to halves',tag:_55NE},{val:'No — rectangles need 2 lines for halves',tag:_55PC}], a:1, e:'"Close enough" is not halves. The parts must be exactly equal — the line must be in the center.', d:'m', h:'Is "close enough to equal" the same as "equal"?', sk:'equal_parts_halves_fourths', i:_i55NE('Halves requires parts to be exactly equal. The line here is off-center — NOT halves.')},
  {t:'Is this circle showing halves? Explain why.', s:_svgUneqHalfCircle(), o:[{val:'Yes — any line across a circle makes halves',tag:_55NE},{val:'No — only a diameter (line through center) makes halves'},{val:'Yes — there are 2 parts',tag:_55UP},{val:'No — circles need 2 lines for halves',tag:_55PC}], a:1, e:'Only a diameter (through the center) makes 2 equal parts. This line is a chord, not a diameter.', d:'m', h:'Does this line go through the exact center?', sk:'equal_parts_halves_fourths', i:_i55NE('Only a line through the center makes 2 equal parts. This line is off-center — NOT halves.')},
  {t:'Does this shape show halves?', s:_svgUneqHalfSquare(), o:[{val:'Yes — 2 parts means halves',tag:_55NE},{val:'No — the 2 parts are different sizes'},{val:'Yes — any cut makes halves',tag:_55UP},{val:'No — this is a square not a circle',tag:_55SP}], a:1, e:'The line is off-center: one part is smaller and one is bigger. Both must be EQUAL for halves.', d:'m', h:'Check both pieces: are they the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('Both parts must be equal. Look: one part is much bigger. This is NOT halves.')},
  {t:'A student draws a line to make halves of this rectangle but places it near one end. Is it halves?', s:_svgUneqHalfRect(), o:[{val:'Yes — the student tried, so it counts',tag:_55NE},{val:'No — the line needs to be in the exact middle'},{val:'Yes — rectangles are flexible',tag:_55SP},{val:'No — rectangles cannot be cut into halves',tag:_55SP}], a:1, e:'The placement of the line determines whether parts are equal. Near one end makes unequal parts.', d:'m', h:'Where must the line be to make equal parts?', sk:'equal_parts_halves_fourths', i:_i55NE('The line must be in the exact middle. Off-center means unequal parts — NOT halves.')},
  // Hard 13-16 (error repair / deeper reasoning)
  {t:'This circle has 2 parts. Which statement explains why it does NOT show halves?', s:_svgUneqHalfCircle(), o:[{val:'The parts must be equal, and one part here is bigger'},{val:'It shows halves because it has 2 parts',tag:_55NE},{val:'Halves needs 4 parts, not 2',tag:_55PC},{val:'The shape is wrong — halves only works on squares',tag:_55SP}], a:0, e:'Halves = 2 equal parts. This circle has 2 parts but they are NOT equal — one is bigger.', d:'h', h:'What two things does halves require?', sk:'equal_parts_halves_fourths', i:_i55NE('Halves requires: (1) 2 parts AND (2) both parts are equal. The off-center line makes unequal parts.')},
  {t:'A student says: "The line makes 2 pieces, so it must be halves." What is missing from the student\'s reasoning?', s:_svgUneqHalfSquare(), o:[{val:'The student forgot to check that both pieces are the SAME size'},{val:'Nothing — the student is correct',tag:_55NE},{val:'The student needs to count to 4, not 2',tag:_55PC},{val:'The student used the wrong shape',tag:_55SP}], a:0, e:'Counting 2 parts is step 1. Step 2: checking that the parts are EQUAL. The student skipped step 2.', d:'h', h:'What must you check AFTER counting the parts?', sk:'equal_parts_halves_fourths', i:_i55NE('Two steps: count the parts AND check they are equal. Missing the equal check leads to wrong answers.')},
  {t:'Why does this rectangle NOT show halves?', s:_svgUneqHalfRect(), o:[{val:'Because the line is not in the center, so the parts are unequal'},{val:'Because rectangles cannot show halves',tag:_55SP},{val:'Because halves requires a circle',tag:_55SP},{val:'Because it only has 1 line',tag:_55PC}], a:0, e:'The line must be in the exact center. Off-center line = unequal parts = not halves.', d:'h', h:'What determines whether the parts are equal?', sk:'equal_parts_halves_fourths', i:_i55NE('Where the line is placed determines equal or unequal parts. Off-center = unequal = NOT halves.')},
  {t:'This looks "almost like halves." Why is it still NOT halves?', s:_svgUneqHalfCircle(), o:[{val:'"Almost equal" is not equal — for halves, both parts must be exactly the same size'},{val:'It is close enough — this counts as halves',tag:_55NE},{val:'Only squares can show exact halves',tag:_55SP},{val:'The line is the wrong color',tag:_55SP}], a:0, e:'Halves requires exactly equal parts — "almost equal" is still unequal. The line must go through the center.', d:'h', h:'Does "almost equal" count as "equal" for halves?', sk:'equal_parts_halves_fourths', i:_i55UP('"Almost equal" is still NOT equal. For halves, the parts must be exactly the same size. The line must go through the center.')}
];

// ── L5.5 C5: Non-examples of fourths (8M + 4H = 12) ─────────────────────────
var _l55C5 = [
  // Medium 1-8 (4-choice)
  {t:'This square is cut into 4 parts. Does it show fourths?', s:_svgUneqFourthSquare(), o:[{val:'Yes — it shows 4 parts',tag:_55NE},{val:'No — the parts are not all equal'},{val:'Yes — any 4 pieces are fourths',tag:_55UP},{val:'No — a square cannot show fourths',tag:_55SP}], a:1, e:'Four parts alone is not enough — all 4 must be EQUAL. The off-center lines make unequal parts here.', d:'m', h:'Are all 4 pieces exactly the same size?', sk:'equal_parts_halves_fourths', i:_i55NE('Four parts is not enough — all 4 must be equal. The lines are off-center here, so the parts are NOT equal.')},
  {t:'Does this rectangle show fourths?', s:_svgUneqFourthRect(), o:[{val:'Yes — there are 4 parts',tag:_55UP},{val:'No — the 4 parts are different sizes'},{val:'Yes — close enough to fourths',tag:_55NE},{val:'No — rectangles need 4 equal rows for fourths',tag:_55PC}], a:1, e:'The 3 lines are unevenly spaced — the 4 columns have different widths. Fourths = 4 EQUAL parts.', d:'m', h:'Are all 4 columns the same width?', sk:'equal_parts_halves_fourths', i:_i55UP('For fourths, all 4 parts must be equal. The uneven lines make unequal parts — NOT fourths.')},
  {t:'Is this fourths?', s:_svgUneqFourthSquare(), o:[{val:'Yes — 4 parts means fourths',tag:_55NE},{val:'No — not all 4 parts are the same size'},{val:'Yes — four is the right number',tag:_55UP},{val:'No — this is a square not a rectangle',tag:_55SP}], a:1, e:'The cross lines are off-center — the 4 regions are different sizes. All 4 must be equal for fourths.', d:'m', h:'Look at all 4 regions. Are they all the same size?', sk:'equal_parts_halves_fourths', i:_i55NE('Fourths = 4 EQUAL parts. The off-center lines make 4 UNEQUAL parts — NOT fourths.')},
  {t:'A student says this shows fourths because it has 4 parts. What is wrong?', s:_svgUneqFourthRect(), o:[{val:'Nothing — the student is right',tag:_55NE},{val:'Having 4 parts is not enough — all 4 must be equal'},{val:'Fourths needs more than 4 parts',tag:_55PC},{val:'Fourths is only for circles',tag:_55SP}], a:1, e:'Same mistake as halves: counting alone is not enough. All 4 parts must be EQUAL SIZE.', d:'m', h:'What is step 2 after counting 4 parts?', sk:'equal_parts_halves_fourths', i:_i55NE('Count 4 parts (step 1) AND check all are equal (step 2). Skipping step 2 leads to this error.')},
  {t:'Does this square show fourths?', s:_svgUneqFourthSquare(), o:[{val:'Yes — four lines make fourths',tag:_55PC},{val:'No — the parts are not all the same size'},{val:'Yes — it looks close enough',tag:_55NE},{val:'No — squares only show halves',tag:_55SP}], a:1, e:'The lines are off-center: the 4 regions are not the same size. Fourths requires ALL parts to be equal.', d:'m', h:'Are all 4 pieces the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('All 4 pieces must be equal. Compare them — they are clearly different sizes. NOT fourths.')},
  {t:'Is this rectangle divided into fourths?', s:_svgUneqFourthRect(), o:[{val:'Yes — 3 lines make 4 parts',tag:_55NE},{val:'No — the 3 lines are not evenly spaced'},{val:'Yes — there are 4 sections',tag:_55UP},{val:'No — a rectangle cannot show fourths',tag:_55SP}], a:1, e:'Three lines make 4 parts, but the lines must be EVENLY SPACED for equal parts. These are not evenly spaced.', d:'m', h:'Are the 3 dividing lines evenly spaced?', sk:'equal_parts_halves_fourths', i:_i55NE('For fourths, the 3 lines must be evenly spaced so all 4 parts are equal. Uneven spacing = unequal parts.')},
  {t:'Why does this NOT show fourths?', s:_svgUneqFourthSquare(), o:[{val:'Because the 4 parts are not all equal'},{val:'Because it has too many parts',tag:_55PC},{val:'Because fourths is only for circles',tag:_55SP},{val:'Actually it does show fourths',tag:_55NE}], a:0, e:'The crossing lines are off-center — some regions are bigger, some smaller. Fourths needs ALL 4 equal.', d:'m', h:'Look at all 4 regions. Are they equal?', sk:'equal_parts_halves_fourths', i:_i55UP('The off-center lines make 4 unequal regions. For fourths, all 4 must be the SAME SIZE.')},
  {t:'Which is the correct reason this does NOT show fourths?', s:_svgUneqFourthRect(), o:[{val:'Fourths needs a circle shape',tag:_55SP},{val:'The parts are different sizes, so this is NOT equal fourths'},{val:'There are too many dividing lines',tag:_55PC},{val:'This actually does show fourths',tag:_55NE}], a:1, e:'Shape does not matter — equal size does. The uneven columns make this NOT fourths.', d:'m', h:'What is the key requirement for fourths?', sk:'equal_parts_halves_fourths', i:_i55NE('Shape does not matter. What matters is equal size. Uneven parts = NOT fourths.')},
  // Hard 9-12 (deeper error repair)
  {t:'This square has 4 parts. A student says it shows fourths. What should you tell the student?', s:_svgUneqFourthSquare(), o:[{val:'The student is right — 4 parts is fourths',tag:_55NE},{val:'Fourths also requires all 4 parts to be equal — these parts are not equal'},{val:'Fourths requires exactly 2 lines, and this has them',tag:_55PC},{val:'The student is almost right — this is close to fourths',tag:_55UP}], a:1, e:'The student counted correctly but forgot the equal-size requirement. Both steps matter.', d:'h', h:'What two things are required for fourths?', sk:'equal_parts_halves_fourths', i:_i55NE('Fourths = 4 parts + all equal. The student only checked the count. The parts here are unequal — NOT fourths.')},
  {t:'What is the key difference between this picture and a correct picture of fourths?', s:_svgUneqFourthRect(), o:[{val:'This picture has 4 parts but they are not equal; correct fourths has 4 EQUAL parts'},{val:'This picture has too many parts',tag:_55PC},{val:'There is no difference — this picture shows fourths',tag:_55NE},{val:'The shape needs to be a circle for fourths',tag:_55SP}], a:0, e:'4 parts is right. Equal size is what is missing. That is the only difference from correct fourths.', d:'h', h:'What is the same and what is different compared to correct fourths?', sk:'equal_parts_halves_fourths', i:_i55UP('Correct fourths: 4 parts + all equal. This picture: 4 parts + NOT all equal. The missing piece is equal size.')},
  {t:'A student says this square "almost" shows fourths. Explain why "almost" is not good enough.', s:_svgUneqFourthSquare(), o:[{val:'"Almost equal" parts are still UNEQUAL — fourths requires exactly equal parts'},{val:'"Almost" is fine — fourths is flexible',tag:_55NE},{val:'The student should count again',tag:_55PC},{val:'Fourths does not apply to squares',tag:_55SP}], a:0, e:'Math requires exactness. "Almost equal" means some parts are bigger — that breaks the fourths rule.', d:'h', h:'Is "almost equal" the same as "equal"?', sk:'equal_parts_halves_fourths', i:_i55UP('"Almost equal" still means UNEQUAL. For fourths, all 4 parts must be exactly the same size — no exceptions.')},
  {t:'Both the count (4 parts) and the size matter for fourths. Which statement is correct?', s:_svgUneqFourthRect(), o:[{val:'Count: 4 parts ✓  Size: parts are not all equal ✗  — so this is NOT fourths'},{val:'Count: 4 parts ✓  Size: good enough ✓  — so this IS fourths',tag:_55NE},{val:'Count: 3 parts ✗  — not enough parts for fourths',tag:_55PC},{val:'This shows fourths — shape and count both look right',tag:_55UP}], a:0, e:'Count is 4 ✓ but the parts are not equal ✗ — both conditions must be met for fourths.', d:'h', h:'Which part of the two-step check fails here?', sk:'equal_parts_halves_fourths', i:_i55NE('Step 1 (4 parts) ✓. Step 2 (all equal) ✗. Both steps must pass. This fails step 2 — NOT fourths.')}
];

// ── L5.5 C6: Count the parts (2E + 6M + 4H = 12) ────────────────────────────
var _l55C6 = [
  // Easy 1-2
  {t:'How many equal parts does this circle show?', s:_svgHalfCircleV(), o:[{val:'2'},{val:'4',tag:_55PC},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'One line makes 2 equal parts.', d:'e', h:'Touch each piece and count.', sk:'equal_parts_halves_fourths', i:_i55PC('One line makes 2 equal parts. Count: 1, 2. The answer is 2.')},
  {t:'How many equal parts does this square show?', s:_svgFourthSquare(), o:[{val:'4'},{val:'2',tag:_55PC},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'Two crossing lines make 4 equal parts.', d:'e', h:'Touch each section and count them.', sk:'equal_parts_halves_fourths', i:_i55PC('Two lines cross to make 4 equal sections. Count: 1, 2, 3, 4. The answer is 4.')},
  // Medium 3-8
  {t:'Count the equal parts. How many equal parts does this rectangle show?', s:_svgHalfRectV(), o:[{val:'2'},{val:'4',tag:_55PC},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'One line splits the rectangle into 2 equal parts.', d:'m', h:'How many pieces does the single line make?', sk:'equal_parts_halves_fourths', i:_i55PC('One line makes 2 parts. Count: 1, 2. One dividing line always makes 2 parts.')},
  {t:'Count the equal parts in this circle. How many are there?', s:_svgFourthCircle(), o:[{val:'4'},{val:'2',tag:_55HF},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'Two crossing lines divide the circle into 4 equal parts.', d:'m', h:'Touch each section and count carefully.', sk:'equal_parts_halves_fourths', i:_i55PC('Two lines make 4 parts. Count each section: 1, 2, 3, 4. Not 2 — count again.')},
  {t:'How many equal parts does this rectangle show?', s:_svgFourthRectV(), o:[{val:'4'},{val:'2',tag:_55HF},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'Three evenly spaced lines make 4 equal columns.', d:'m', h:'Count each column from left to right.', sk:'equal_parts_halves_fourths', i:_i55PC('Count the columns: 1, 2, 3, 4. Three lines make 4 parts.')},
  {t:'How many equal parts does this square show?', s:_svgHalfSquareH(), o:[{val:'2'},{val:'4',tag:_55PC},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'One horizontal line makes 2 equal parts.', d:'m', h:'How many pieces does the line make?', sk:'equal_parts_halves_fourths', i:_i55PC('One line = 2 parts. Count: 1, 2. The square shows 2 equal parts.')},
  {t:'This rectangle is split into equal rows. How many equal rows are shown?', s:_svgFourthRectH(), o:[{val:'4'},{val:'2',tag:_55HF},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'Three horizontal lines make 4 equal rows.', d:'m', h:'Count the rows from top to bottom.', sk:'equal_parts_halves_fourths', i:_i55PC('Count the rows from top to bottom: 1, 2, 3, 4. Three lines make 4 rows.')},
  {t:'How many equal parts does this circle show?', s:_svgHalfCircleH(), o:[{val:'2'},{val:'4',tag:_55PC},{val:'3',tag:_55PC},{val:'1',tag:_55PC}], a:0, e:'The horizontal line goes through the center making 2 equal parts.', d:'m', h:'Count the pieces carefully.', sk:'equal_parts_halves_fourths', i:_i55PC('The diameter makes 2 equal parts. Count: top piece (1), bottom piece (2). That is 2.')},
  // Hard 9-12
  {t:'Picture A has ___ equal parts. Picture B has ___ equal parts.', s:_svgRow2L(_svgHalfCircleV(),_svgFourthCircle()), o:[{val:'A: 2,  B: 4'},{val:'A: 4,  B: 2',tag:_55PC},{val:'A: 2,  B: 2',tag:_55HF},{val:'A: 4,  B: 4',tag:_55HF}], a:0, e:'Picture A has 1 line → 2 equal parts. Picture B has 2 crossing lines → 4 equal parts.', d:'h', h:'Count each picture separately.', sk:'equal_parts_halves_fourths', i:_i55PC('Count A: 1 line → 2 parts. Count B: 2 lines → 4 parts. More lines = more parts.')},
  {t:'This rectangle has ___ dividing lines and ___ equal parts.', s:_svgFourthRectV(), o:[{val:'3 lines and 4 parts'},{val:'4 lines and 4 parts',tag:_55PC},{val:'3 lines and 3 parts',tag:_55PC},{val:'2 lines and 2 parts',tag:_55HF}], a:0, e:'Three vertical lines divide the rectangle into 4 equal columns. Lines + 1 = parts.', d:'h', h:'Count the lines, then count the columns.', sk:'equal_parts_halves_fourths', i:_i55PC('Count the lines: 1, 2, 3 lines. Then count the parts: 1, 2, 3, 4 parts. Number of lines + 1 = number of parts.')},
  {t:'Picture A has ___ equal parts. Picture B has ___ equal parts.', s:_svgRow2L(_svgHalfRectV(),_svgFourthRectV()), o:[{val:'A: 2,  B: 4'},{val:'A: 4,  B: 2',tag:_55PC},{val:'A: 2,  B: 2',tag:_55HF},{val:'A: 4,  B: 4',tag:_55PC}], a:0, e:'A has 1 line → 2 equal parts. B has 3 lines → 4 equal parts.', d:'h', h:'Count the dividing lines in each rectangle, then count the parts.', sk:'equal_parts_halves_fourths', i:_i55PC('Rectangle A: 1 line = 2 parts. Rectangle B: 3 lines = 4 parts. Count lines then add 1.')},
  {t:'True or false: a square with 2 lines crossing shows halves because it has 2 lines.', s:_svgFourthSquare(), o:[{val:'False — 2 crossing lines make 4 parts, which is fourths not halves'},{val:'True — 2 lines = halves',tag:_55PC},{val:'True — a square always shows halves',tag:_55SP},{val:'False — squares cannot be divided at all',tag:_55SP}], a:0, e:'Count the parts made by the lines, not the lines themselves. 2 crossing lines make 4 parts = fourths.', d:'h', h:'Count the PARTS, not the lines.', sk:'equal_parts_halves_fourths', i:_i55PC('2 lines cross to make 4 parts. Name comes from the number of PARTS (4 = fourths), not the number of lines.')}
];

// ── L5.5 C7: Match description to picture (8M + 5H = 13) ─────────────────────
var _l55C7 = [
  // Medium 1-8 (Row3 visual, pick the matching picture)
  {t:'Which picture shows halves?', s:_svgRow3L(_svgHalfCircleV(),_svgFourthSquare(),_svgUneqHalfRect()), o:[{val:'Picture A'},{val:'Picture B',tag:_55HF},{val:'Picture C',tag:_55NE},{val:'None of them',tag:_55EQ}], a:0, e:'Picture A has 1 line through the center making 2 equal parts — halves. B has 4 parts (fourths). C has unequal parts.', d:'m', h:'Which picture has exactly 2 equal parts?', sk:'equal_parts_halves_fourths', i:_i55HF('Look for 2 equal parts. Picture A: 1 center line → 2 equal parts → halves.')},
  {t:'Which picture shows fourths?', s:_svgRow3L(_svgFourthRectV(),_svgHalfSquareH(),_svgUneqFourthRect()), o:[{val:'Picture A'},{val:'Picture B',tag:_55HF},{val:'Picture C',tag:_55NE},{val:'None of them',tag:_55EQ}], a:0, e:'Picture A has 3 evenly spaced lines making 4 equal columns — fourths. B has 2 parts (halves). C has unequal parts.', d:'m', h:'Which picture has exactly 4 equal parts?', sk:'equal_parts_halves_fourths', i:_i55HF('Look for 4 equal parts. Picture A: 3 even lines → 4 equal parts → fourths.')},
  {t:'Which picture shows 2 equal parts?', s:_svgRow3L(_svgUneqHalfCircle(),_svgHalfRectV(),_svgFourthCircle()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Picture C',tag:_55HF},{val:'None of them',tag:_55EQ}], a:1, e:'Picture B has 1 center line making 2 equal parts. A has unequal parts. C has 4 parts.', d:'m', h:'Which picture has exactly 2 equal parts?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture A has unequal parts. Picture C has 4 parts. Picture B has 1 center line → 2 equal parts.')},
  {t:'Which picture shows halves?', s:_svgRow3L(_svgHalfSquareV(),_svgUneqHalfSquare(),_svgFourthRectH()), o:[{val:'Picture A'},{val:'Picture B',tag:_55UP},{val:'Picture C',tag:_55HF},{val:'None of them',tag:_55EQ}], a:0, e:'Picture A has the midline making 2 equal parts. B has an off-center line. C has 4 parts.', d:'m', h:'Which picture has a line exactly in the middle making 2 equal parts?', sk:'equal_parts_halves_fourths', i:_i55UP('Picture B: off-center line → unequal parts. Picture C: 4 parts. Picture A: midline → 2 equal parts → halves.')},
  {t:'Which picture shows fourths?', s:_svgRow3L(_svgUneqFourthSquare(),_svgFourthSquare(),_svgHalfCircleH()), o:[{val:'Picture A',tag:_55NE},{val:'Picture B'},{val:'Picture C',tag:_55HF},{val:'None of them',tag:_55EQ}], a:1, e:'Picture B has 2 center lines making 4 equal parts — fourths. A has unequal parts. C has 2 parts.', d:'m', h:'Which picture has 4 equal parts?', sk:'equal_parts_halves_fourths', i:_i55NE('Picture A has unequal parts — not fourths. Picture C has 2 parts — halves. Picture B has 4 equal parts → fourths.')},
  {t:'Which picture shows 4 equal parts?', s:_svgRow3L(_svgHalfRectH(),_svgFourthCircle(),_svgUneqHalfCircle()), o:[{val:'Picture A',tag:_55HF},{val:'Picture B'},{val:'Picture C',tag:_55NE},{val:'None of them',tag:_55EQ}], a:1, e:'Picture B has 2 crossing diameters making 4 equal parts. A has 2 parts. C has unequal parts.', d:'m', h:'Count the equal parts in each picture.', sk:'equal_parts_halves_fourths', i:_i55PC('Count each picture: A has 2 equal parts, B has 4 equal parts, C has unequal parts. 4 equal parts = fourths.')},
  {t:'Which picture shows equal parts? Pick the BEST answer.', s:_svgRow3L(_svgUneqFourthRect(),_svgUneqHalfSquare(),_svgFourthRectV()), o:[{val:'Picture A',tag:_55NE},{val:'Picture B',tag:_55UP},{val:'Picture C'},{val:'None of them',tag:_55EQ}], a:2, e:'Picture C has 3 evenly spaced lines making 4 equal parts. A and B both have unequal parts.', d:'m', h:'Check each picture: are the parts in each one equal?', sk:'equal_parts_halves_fourths', i:_i55UP('Check each: A has unequal parts. B has unequal parts. C has 3 even lines → 4 equal parts — that one shows equal parts.')},
  {t:'A shape is described as showing halves. Which picture matches?', s:_svgRow3L(_svgHalfCircleH(),_svgUneqFourthRect(),_svgFourthRectH()), o:[{val:'Picture A'},{val:'Picture B',tag:_55NE},{val:'Picture C',tag:_55HF},{val:'None of them',tag:_55EQ}], a:0, e:'Halves = 2 equal parts. Picture A has 1 center line → 2 equal parts → matches "halves." B has unequal parts. C has 4 parts.', d:'m', h:'Halves means 2 equal parts. Which picture has exactly that?', sk:'equal_parts_halves_fourths', i:_i55HF('Find 2 equal parts. Picture A: 1 center line → 2 equal parts → halves. That matches the description.')},
  // Hard 9-13
  {t:'Which pictures show halves? (More than one may be correct.)', s:_svgRow3L(_svgHalfRectV(),_svgFourthSquare(),_svgHalfSquareH()), o:[{val:'Picture A and Picture C'},{val:'Picture A only',tag:_55EQ},{val:'Picture B only',tag:_55HF},{val:'None show halves',tag:_55EQ}], a:0, e:'A has 2 equal parts (halves). C has 2 equal parts (halves). B has 4 equal parts (fourths).', d:'h', h:'Check each picture. Which ones have exactly 2 equal parts?', sk:'equal_parts_halves_fourths', i:_i55EQ('Check each: A has 2 equal parts ✓, B has 4 equal parts ✗, C has 2 equal parts ✓. Both A and C show halves.')},
  {t:'Which picture shows halves?', s:_svgRow3L(_svgUneqHalfCircle(),_svgHalfRectH(),_svgUneqFourthSquare()), o:[{val:'Picture A',tag:_55UP},{val:'Picture B'},{val:'Picture C',tag:_55NE},{val:'None of them',tag:_55EQ}], a:1, e:'Picture B has 2 equal parts (halves). A has unequal parts. C has unequal parts.', d:'h', h:'Which picture has exactly 2 EQUAL parts?', sk:'equal_parts_halves_fourths', i:_i55UP('A: off-center line → unequal. C: off-center cross → unequal. B: center line → 2 equal parts → halves.')},
  {t:'All three pictures show equal parts. Which word names ALL the equal parts shown?', s:_svgRow3(_svgFourthCircle(),_svgFourthRectV(),_svgFourthSquare()), o:[{val:'Halves',tag:_55HF},{val:'Fourths'},{val:'Thirds',tag:_55WN},{val:'They show different things',tag:_55WN}], a:1, e:'All three pictures show 4 equal parts — all three show fourths.', d:'h', h:'Count the equal parts in each picture. Are they all the same?', sk:'equal_parts_halves_fourths', i:_i55HF('Count each: circle = 4 parts, rectangle = 4 parts, square = 4 parts. All show fourths, not halves.')},
  {t:'A student needs a picture showing 4 equal parts. Which picture should they pick?', s:_svgRow3L(_svgHalfCircleV(),_svgUneqHalfRect(),_svgFourthRectH()), o:[{val:'Picture A',tag:_55HF},{val:'Picture B',tag:_55NE},{val:'Picture C'},{val:'Any of them',tag:_55NE}], a:2, e:'Picture C has 3 horizontal lines making 4 equal rows. A has 2 parts. B has unequal parts.', d:'h', h:'Which picture has exactly 4 EQUAL parts?', sk:'equal_parts_halves_fourths', i:_i55PC('Count: A has 2 parts, B has unequal parts, C has 4 equal parts. 4 equal parts = C.')},
  {t:'Which pictures have ALL parts equal? (More than one may be correct.)', s:_svgRow3L(_svgHalfSquareH(),_svgUneqFourthSquare(),_svgFourthRectV()), o:[{val:'Picture A and Picture C'},{val:'Picture A only',tag:_55EQ},{val:'Picture B only',tag:_55UP},{val:'None have equal parts',tag:_55EQ}], a:0, e:'A has 2 equal parts (halves ✓). C has 4 equal parts (fourths ✓). B has unequal parts ✗.', d:'h', h:'Check each picture: are the parts all the same size?', sk:'equal_parts_halves_fourths', i:_i55EQ('A: midline → 2 equal parts ✓. B: off-center cross → unequal ✗. C: 3 even lines → 4 equal parts ✓. A and C are correct.')}
];

// ── L5.5 C8: Same shape, different partitions (6M + 6H = 12) ─────────────────
var _l55C8 = [
  // Medium 1-6
  {t:'Do both of these squares show halves?', s:_svgRow2(_svgHalfSquareV(),_svgHalfSquareH()), o:[{val:'Yes — both have 2 equal parts'},{val:'No — only the vertical cut is halves',tag:_55SP},{val:'No — only the horizontal cut is halves',tag:_55SP},{val:'No — neither shows halves',tag:_55EQ}], a:0, e:'Both squares have a midline making 2 equal parts. Direction (vertical or horizontal) does not matter.', d:'m', h:'Are the parts equal in Picture A? In Picture B?', sk:'equal_parts_halves_fourths', i:_i55SP('Both cuts go through the middle. Both make 2 equal parts. Both show halves — direction does not matter.')},
  {t:'Both circles are cut differently. Do both show halves?', s:_svgRow2(_svgHalfCircleV(),_svgHalfCircleH()), o:[{val:'Yes — both have 2 equal parts'},{val:'No — only vertical cuts make halves',tag:_55SP},{val:'No — only horizontal cuts make halves',tag:_55SP},{val:'No — circles cannot show halves two ways',tag:_55SP}], a:0, e:'A vertical diameter and a horizontal diameter both make 2 equal parts — both show halves.', d:'m', h:'Are the parts equal in both circles?', sk:'equal_parts_halves_fourths', i:_i55SP('A diameter can go any direction. Any diameter through the center makes 2 equal parts = halves.')},
  {t:'This rectangle is cut two different ways. Which statement is correct?', s:_svgRow2L(_svgHalfRectV(),_svgHalfRectH()), o:[{val:'Both pictures show halves'},{val:'Only Picture A shows halves',tag:_55EQ},{val:'Only Picture B shows halves',tag:_55EQ},{val:'Neither picture shows halves',tag:_55EQ}], a:0, e:'Both rectangles have their midline (vertical or horizontal) making 2 equal parts — both are halves.', d:'m', h:'Check both: is each dividing line in the exact middle?', sk:'equal_parts_halves_fourths', i:_i55SP('The midline can be vertical OR horizontal. Both make 2 equal parts. Both show halves.')},
  {t:'Do both of these shapes show fourths?', s:_svgRow2(_svgFourthSquare(),_svgFourthCircle()), o:[{val:'Yes — both have 4 equal parts'},{val:'No — fourths only works for squares',tag:_55SP},{val:'No — fourths only works for circles',tag:_55SP},{val:'No — they are different shapes',tag:_55SP}], a:0, e:'Both show 4 equal parts — shape does not determine the name, equal parts count does.', d:'m', h:'Count the equal parts in each shape.', sk:'equal_parts_halves_fourths', i:_i55SP('The shape does not matter — what matters is equal parts. Both have 4 equal parts → both show fourths.')},
  {t:'A student says changing the cut direction changes the name from halves to something else. Is the student right?', s:_svgRow2(_svgHalfSquareH(),_svgHalfSquareV()), o:[{val:'No — both show halves because both have 2 equal parts'},{val:'Yes — the direction changes the name',tag:_55SP},{val:'Yes — horizontal is halves and vertical is fourths',tag:_55SP},{val:'No — but neither picture shows halves',tag:_55EQ}], a:0, e:'Direction does not change the name. Both cuts make 2 equal parts = halves.', d:'m', h:'What matters for the name — direction or equal parts?', sk:'equal_parts_halves_fourths', i:_i55SP('Equal parts — not direction — determines the name. Both cuts make 2 equal parts. Both = halves.')},
  {t:'Which pictures show halves? (There may be more than one.)', s:_svgRow2L(_svgHalfRectH(),_svgHalfRectV()), o:[{val:'Both pictures show halves'},{val:'Only Picture A',tag:_55EQ},{val:'Only Picture B',tag:_55EQ},{val:'Neither picture shows halves',tag:_55EQ}], a:0, e:'Both have a midline making 2 equal parts — horizontal or vertical, both are halves.', d:'m', h:'Check both rectangles: do both have equal parts?', sk:'equal_parts_halves_fourths', i:_i55SP('Both have a line in the exact middle. Both make 2 equal parts. Both show halves.')},
  // Hard 7-12
  {t:'What is the SAME about both circles?', s:_svgRow2L(_svgHalfCircleV(),_svgHalfCircleH()), o:[{val:'Both pictures show halves'},{val:'Both pictures show fourths',tag:_55HF},{val:'Picture A shows halves, Picture B shows fourths',tag:_55WN},{val:'Neither picture shows halves',tag:_55EQ}], a:0, e:'Both have a diameter (line through center) making 2 equal parts — both show halves. The direction differs but the name is the same.', d:'h', h:'Count the equal parts in each. Are they both the same?', sk:'equal_parts_halves_fourths', i:_i55SP('Both have 2 equal parts. The direction is different but the name is the same: both = halves.')},
  {t:'Do both rectangles show fourths? Explain.', s:_svgRow2(_svgFourthRectV(),_svgFourthRectH()), o:[{val:'Yes — both have 4 equal parts in different directions'},{val:'No — only vertical fourths is correct',tag:_55SP},{val:'No — only horizontal fourths is correct',tag:_55SP},{val:'No — they look too different',tag:_55SP}], a:0, e:'One is cut into vertical columns, one into horizontal rows — both make 4 equal parts = fourths.', d:'h', h:'Count the equal parts in both rectangles.', sk:'equal_parts_halves_fourths', i:_i55SP('Equal parts = fourths. Vertical columns or horizontal rows — both make 4 equal parts. Both = fourths.')},
  {t:'Both shapes are different, but do both show halves?', s:_svgRow2(_svgHalfSquareH(),_svgHalfRectH()), o:[{val:'Yes — both have 2 equal parts'},{val:'No — different shapes cannot both show halves',tag:_55SP},{val:'No — only the square shows halves',tag:_55EQ},{val:'No — only the rectangle shows halves',tag:_55EQ}], a:0, e:'Shape does not determine the name. Both have a midline making 2 equal parts — both show halves.', d:'h', h:'What matters for the name: the shape or the number of equal parts?', sk:'equal_parts_halves_fourths', i:_i55SP('Shape does not matter. Both have 2 equal parts. Both show halves.')},
  {t:'Which picture shows halves? (Be careful — one shows fourths.)', s:_svgRow2L(_svgHalfSquareV(),_svgFourthSquare()), o:[{val:'Picture A only'},{val:'Picture B only',tag:_55HF},{val:'Both pictures show halves',tag:_55NE},{val:'Neither picture shows halves',tag:_55EQ}], a:0, e:'Picture A has 1 line → 2 equal parts → halves. Picture B has 2 crossing lines → 4 equal parts → fourths.', d:'h', h:'Count the equal parts in each picture.', sk:'equal_parts_halves_fourths', i:_i55PC('Count A: 1 line → 2 parts → halves. Count B: 2 lines → 4 parts → fourths. Only A shows halves.')},
  {t:'Does adding more lines to a halves shape always change it to fourths?', s:_svgRow2(_svgHalfCircleV(),_svgFourthCircle()), o:[{val:'Yes — adding a 2nd line changes 2 parts to 4 parts, changing halves to fourths'},{val:'No — it is still halves with more lines',tag:_55PC},{val:'No — more lines just make more equal shapes',tag:_55SP},{val:'Yes — but only for circles',tag:_55SP}], a:0, e:'Adding a 2nd perpendicular line doubles the number of parts: 2 → 4. Halves becomes fourths.', d:'h', h:'How many parts does each circle have?', sk:'equal_parts_halves_fourths', i:_i55PC('Picture A: 1 line → 2 parts = halves. Picture B: 2 lines → 4 parts = fourths. More lines = more parts = new name.')},
  {t:'A teacher asks: "Can a square show halves in more than one way?" What is the answer?', s:_svgRow2(_svgHalfSquareH(),_svgHalfSquareV()), o:[{val:'Yes — vertical and horizontal cuts both make halves'},{val:'No — only one correct way exists',tag:_55SP},{val:'No — squares can only show fourths',tag:_55WN},{val:'Yes — but only one of these pictures shows halves',tag:_55EQ}], a:0, e:'Both cuts go through the center making 2 equal parts. Both show halves — direction does not matter.', d:'h', h:'Are both squares cut in the middle?', sk:'equal_parts_halves_fourths', i:_i55SP('Both cuts are through the center. Both make 2 equal parts. A square CAN show halves in more than one way.')}
];

// ── L5.5 C9: Error repair (8H = 8) ──────────────────────────────────────────
var _l55C9 = [
  {t:'A student sees this circle and says "It has 2 parts, so it must be halves." What is wrong?', s:_svgUneqHalfCircle(), o:[{val:'The student forgot to check that both parts are equal'},{val:'The student is right — 2 parts is all you need for halves',tag:_55NE},{val:'Halves needs more than 2 parts',tag:_55PC},{val:'Circles cannot show halves',tag:_55SP}], a:0, e:'Halves = 2 parts AND both equal. The student only checked the count, not the size.', d:'h', h:'What are the two requirements for halves?', sk:'equal_parts_halves_fourths', i:_i55NE('Two requirements for halves: (1) 2 parts, AND (2) both parts equal. The student missed requirement 2.')},
  {t:'A student says "The parts look almost equal, so this is halves." What is wrong?', s:_svgUneqHalfSquare(), o:[{val:'"Almost equal" is not the same as "equal" — the parts must be exactly the same size'},{val:'The student is right — almost equal is close enough',tag:_55NE},{val:'The student used the wrong shape',tag:_55SP},{val:'The student should count to 4, not 2',tag:_55PC}], a:0, e:'Halves requires parts to be exactly equal. "Almost" still means unequal.', d:'h', h:'Is "almost equal" the same as "equal"?', sk:'equal_parts_halves_fourths', i:_i55UP('"Almost equal" still means UNEQUAL. The line is off-center. For halves, both parts must be exactly the same size.')},
  {t:'A student says "A square can only show halves one way — the horizontal cut." What should you tell the student?', s:_svgRow2(_svgHalfSquareH(),_svgHalfSquareV()), o:[{val:'Both cuts show halves — equal parts matter, not direction'},{val:'The student is right — only horizontal cuts are halves',tag:_55SP},{val:'The student is right — only vertical cuts are halves',tag:_55SP},{val:'Neither cut shows halves',tag:_55EQ}], a:0, e:'Any cut through the center makes 2 equal parts. Direction does not change the name.', d:'h', h:'What determines the name — direction or equal parts?', sk:'equal_parts_halves_fourths', i:_i55SP('Direction does NOT matter. Any midline cut makes 2 equal parts = halves. Both pictures show halves.')},
  {t:'A student counts 4 parts in this square and says "These are fourths!" What might be wrong?', s:_svgUneqFourthSquare(), o:[{val:'The student needs to check that all 4 parts are equal — these parts are not equal'},{val:'Nothing — the student is correct',tag:_55NE},{val:'The student needs to count again — there are only 2 parts',tag:_55PC},{val:'Fourths is only for circles',tag:_55SP}], a:0, e:'The student counted correctly (4 parts) but forgot step 2: check that all 4 are equal. They are not.', d:'h', h:'What is step 2 after counting 4 parts?', sk:'equal_parts_halves_fourths', i:_i55NE('Count 4 parts (step 1) ✓. Check all are equal (step 2) ✗. The off-center lines make unequal parts — NOT fourths.')},
  {t:'A student says "To show fourths I need exactly 4 lines." Is the student right?', s:_svgFourthRectV(), o:[{val:'No — 3 lines make 4 equal parts; you need one fewer line than parts'},{val:'Yes — 4 lines make 4 parts',tag:_55PC},{val:'Yes — lines and parts are always the same number',tag:_55PC},{val:'No — you need 2 lines for fourths',tag:_55PC}], a:0, e:'Lines + 1 = parts. For 4 parts you need 3 lines. This rectangle shows 3 lines → 4 equal parts = fourths.', d:'h', h:'Count the lines in this rectangle. How many parts do they make?', sk:'equal_parts_halves_fourths', i:_i55PC('Count: 3 lines make 4 parts. Number of lines + 1 = number of parts. For fourths (4 parts), you need 3 lines.')},
  {t:'A student says "Halves and fourths are the same because both have equal parts." What is wrong?', s:_svgRow2(_svgHalfCircleV(),_svgFourthCircle()), o:[{val:'Both have equal parts, but halves has 2 equal parts and fourths has 4 — they are different'},{val:'The student is right — both are equal, so they are the same',tag:_55HF},{val:'Halves does not have equal parts',tag:_55EQ},{val:'Fourths does not have equal parts',tag:_55EQ}], a:0, e:'Both require equal parts — but the NUMBER of parts is different. 2 equal parts = halves. 4 equal parts = fourths.', d:'h', h:'What is different between halves and fourths?', sk:'equal_parts_halves_fourths', i:_i55HF('Both require equal parts — but count differs: halves = 2 equal parts, fourths = 4 equal parts. Count first.')},
  {t:'A student sees this rectangle and says "I cut it 4 times, so it shows fourths." What is the error?', s:_svgFourthRectV(), o:[{val:'The number of cuts (lines) is not the same as the number of parts — 3 lines make 4 parts'},{val:'The student is right — 4 cuts make fourths',tag:_55PC},{val:'Rectangles cannot show fourths',tag:_55SP},{val:'The student cut it too many times',tag:_55PC}], a:0, e:'The student confused lines with parts. Count the lines: 3. Count the parts: 4. Lines + 1 = parts.', d:'h', h:'Count the lines. How many parts do the lines make?', sk:'equal_parts_halves_fourths', i:_i55PC('The student counted lines but should count parts. 3 lines make 4 parts. Parts + not lines = the name.')},
  {t:'A student asks: "If I cut a rectangle into halves and then cut the halves again, do I still have halves?" What is the answer?', s:_svgRow2(_svgHalfRectV(),_svgFourthRectV()), o:[{val:'No — cutting the halves again makes fourths (4 equal parts)'},{val:'Yes — any cut makes halves',tag:_55NE},{val:'Yes — you doubled the halves so it is still halves',tag:_55PC},{val:'No — cutting again makes thirds',tag:_55WN}], a:0, e:'Picture A shows halves (2 equal parts). Cutting each half again makes Picture B: 4 equal parts = fourths.', d:'h', h:'Count the parts in Picture B. Is that still 2 equal parts?', sk:'equal_parts_halves_fourths', i:_i55PC('Cutting halves again doubles the parts: 2 → 4. Four equal parts is fourths, not halves.')}
];

// ── L5.5 C10: Mixed review (2E + 10H = 12) ───────────────────────────────────
var _l55C10 = [
  // Easy 1-2
  {t:'What does this circle show?', s:_svgHalfCircleV(), o:[{val:'Halves — 2 equal parts'},{val:'Fourths — 4 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'One line through the center makes 2 equal parts — halves.', d:'e', h:'Count the equal parts.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. Two equal parts = halves. Fourths would need 4 equal parts.')},
  {t:'What does this square show?', s:_svgFourthSquare(), o:[{val:'Fourths — 4 equal parts'},{val:'Halves — 2 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'Two crossing lines make 4 equal parts — fourths.', d:'e', h:'Count all the equal sections.', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2, 3, 4. Four equal parts = fourths. Halves would only have 2 equal parts.')},
  // Hard 3-12
  {t:'What does this circle show?', s:_svgUneqHalfCircle(), o:[{val:'Unequal parts — not halves or fourths'},{val:'Halves — 2 equal parts',tag:_55UP},{val:'Fourths — 4 equal parts',tag:_55PC},{val:'Halves and fourths',tag:_55NE}], a:0, e:'The line is off-center — one part is bigger. The parts are NOT equal, so this is not halves.', d:'h', h:'Is the line in the center? Are both parts the same size?', sk:'equal_parts_halves_fourths', i:_i55UP('The line is not through the center. One part is bigger. Unequal parts = NOT halves or fourths.')},
  {t:'What does this circle show?', s:_svgFourthCircle(), o:[{val:'Fourths — 4 equal parts'},{val:'Halves — 2 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'Two crossing diameters make 4 equal parts — fourths.', d:'h', h:'Count the equal sections.', sk:'equal_parts_halves_fourths', i:_i55HF('Two lines cross to make 4 equal parts. That is fourths, not halves.')},
  {t:'What does this square show?', s:_svgHalfSquareV(), o:[{val:'Halves — 2 equal parts'},{val:'Fourths — 4 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'One vertical midline makes 2 equal parts — halves.', d:'h', h:'Count the equal parts. Are they equal?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2. Two equal parts = halves. The midline goes through the center.')},
  {t:'What does this square show?', s:_svgUneqFourthSquare(), o:[{val:'Unequal parts — not halves or fourths'},{val:'Fourths — 4 equal parts',tag:_55NE},{val:'Halves — 2 equal parts',tag:_55PC},{val:'Halves and fourths',tag:_55NE}], a:0, e:'There are 4 parts but the lines are off-center — the parts are not all equal. Not fourths.', d:'h', h:'Are all 4 parts exactly the same size?', sk:'equal_parts_halves_fourths', i:_i55NE('Four parts but NOT all equal. Fourths needs 4 EQUAL parts. Off-center lines make unequal parts.')},
  {t:'What does this rectangle show?', s:_svgHalfRectH(), o:[{val:'Halves — 2 equal parts'},{val:'Fourths — 4 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'The midline divides the rectangle into 2 equal rows — halves.', d:'h', h:'How many equal parts are shown?', sk:'equal_parts_halves_fourths', i:_i55HF('Count: 1, 2 equal rows. Two equal parts = halves.')},
  {t:'What does this rectangle show?', s:_svgFourthRectV(), o:[{val:'Fourths — 4 equal parts'},{val:'Halves — 2 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'Three evenly spaced lines make 4 equal columns — fourths.', d:'h', h:'Count the equal columns.', sk:'equal_parts_halves_fourths', i:_i55HF('Count the columns: 1, 2, 3, 4. Three evenly spaced lines make 4 equal parts = fourths.')},
  {t:'What does this shape show?', s:_svgUneqHalfSquare(), o:[{val:'Unequal parts — not halves or fourths'},{val:'Halves — 2 equal parts',tag:_55UP},{val:'Fourths — 4 equal parts',tag:_55PC},{val:'Halves and fourths',tag:_55NE}], a:0, e:'The line is off to one side — one piece is bigger than the other. Unequal parts.', d:'h', h:'Is the dividing line in the middle?', sk:'equal_parts_halves_fourths', i:_i55UP('The line is NOT in the middle. One piece is bigger. Unequal parts = NOT halves or fourths.')},
  {t:'What does this shape show?', s:_svgUneqFourthRect(), o:[{val:'Unequal parts — not halves or fourths'},{val:'Fourths — 4 equal parts',tag:_55NE},{val:'Halves — 2 equal parts',tag:_55PC},{val:'Halves and fourths',tag:_55NE}], a:0, e:'Three lines make 4 parts, but the lines are unevenly spaced — the parts are different widths.', d:'h', h:'Are all 4 columns the same width?', sk:'equal_parts_halves_fourths', i:_i55NE('Four parts but the widths are different. Fourths needs 4 EQUAL parts. These are unequal parts.')},
  {t:'What does this square show?', s:_svgHalfSquareH(), o:[{val:'Halves — 2 equal parts'},{val:'Fourths — 4 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'A horizontal midline makes 2 equal parts — halves. Direction does not change the name.', d:'h', h:'Is the line in the middle? How many equal parts?', sk:'equal_parts_halves_fourths', i:_i55HF('The horizontal midline makes 2 equal parts = halves. The cut direction does not change the name.')},
  {t:'What does this rectangle show?', s:_svgFourthRectH(), o:[{val:'Fourths — 4 equal parts'},{val:'Halves — 2 equal parts',tag:_55HF},{val:'Unequal parts',tag:_55EQ},{val:'Halves and fourths',tag:_55NE}], a:0, e:'Three evenly spaced horizontal lines make 4 equal rows — fourths.', d:'h', h:'Count the equal rows.', sk:'equal_parts_halves_fourths', i:_i55HF('Count the rows: 1, 2, 3, 4. Three evenly spaced lines make 4 equal parts = fourths.')}
];

// ── L5.5 key ideas ────────────────────────────────────────────────────────────
var _l55KeyIdeas = [
  'Equal parts means every piece is the same size — no piece is bigger or smaller than any other piece.',
  'When a shape is split into 2 equal parts, the two parts are called halves. Each part is one half.',
  'When a shape is split into 4 equal parts, the four parts are called fourths (also called quarters). Each part is one fourth.',
  'To check if parts are equal, look at the dividing line — it must split the shape so that all pieces are the same size.',
  'A shape can be split into halves or fourths in more than one way. As long as all parts are equal, it shows halves or fourths.',
  'If a shape is split into 2 or 4 parts but the parts are NOT the same size, it does NOT show halves or fourths — those are unequal parts.'
];

// ── L5.5 worked examples ───────────────────────────────────────────────────────
var _l55Examples = [
  {
    id: 'g1-u5-l5-ex-1',
    title: 'Example 1: Name the halves',
    prompt: 'A circle is cut into 2 equal parts. What are the two parts called?',
    visual: {type: 'rawHtml', html: _svgHalfCircleV()},
    steps: [
      'Count the parts: touch each piece — 1 … 2.',
      'Are both parts the same size? Yes — the line goes through the center.',
      'When you have 2 equal parts of a shape, the parts are called halves.',
      'Two equal parts = halves.'
    ],
    finalAnswer: 'The two equal parts are called halves.'
  },
  {
    id: 'g1-u5-l5-ex-2',
    title: 'Example 2: Name the fourths',
    prompt: 'A rectangle is split into 4 equal parts. What are the parts called?',
    visual: {type: 'rawHtml', html: _svgFourthRectV()},
    steps: [
      'Count the parts: touch each column — 1, 2, 3, 4.',
      'Are all parts the same size? Yes — the 3 lines are evenly spaced.',
      'When you have 4 equal parts of a shape, the parts are called fourths.',
      'Four equal parts = fourths.'
    ],
    finalAnswer: 'The four equal parts are called fourths.'
  },
  {
    id: 'g1-u5-l5-ex-3',
    title: 'Example 3: Which square shows halves?',
    prompt: 'One square has a line in the middle. Another has a line off to the side. Which one shows halves?',
    visual: {type: 'rawHtml', html: _svgRow2L(_svgHalfSquareV(), _svgUneqHalfSquare())},
    steps: [
      'Look at Picture A: the line is in the MIDDLE — both parts are the same size. ✓',
      'Look at Picture B: the line is NOT in the middle — one part is bigger. ✗',
      'Equal parts = halves. Unequal parts ≠ halves.',
      'Picture A shows halves; Picture B does not.'
    ],
    finalAnswer: 'Picture A shows halves — the line is in the middle, so both parts are equal in size.'
  },
  {
    id: 'g1-u5-l5-ex-4',
    title: 'Example 4: Two parts but not halves',
    prompt: 'A circle is cut into 2 parts, but one part is bigger. Is this halves?',
    visual: {type: 'rawHtml', html: _svgUneqHalfCircle()},
    steps: [
      'Count the parts: 2 parts.',
      'Are the parts the same size? No — the line is off to one side. One part is bigger.',
      'Halves means the 2 parts MUST be the same size.',
      'These parts are not equal — this is NOT halves.'
    ],
    finalAnswer: 'No — the parts are not equal, so this is not halves.'
  },
  {
    id: 'g1-u5-l5-ex-5',
    title: 'Example 5: Count the parts on a square',
    prompt: 'A square has 2 lines crossing it. How many equal parts does it show?',
    visual: {type: 'rawHtml', html: _svgFourthSquare()},
    steps: [
      'Count each piece: 1, 2, 3, 4.',
      'There are 4 parts.',
      'Are all parts the same size? Yes — both lines cross in the center.',
      '4 equal parts = fourths.'
    ],
    finalAnswer: 'The square shows 4 equal parts — those are fourths.'
  },
  {
    id: 'g1-u5-l5-ex-6',
    title: 'Example 6: Two ways to make halves',
    prompt: 'A square can be split into halves with a vertical cut OR a horizontal cut. What matters most?',
    visual: {type: 'rawHtml', html: _svgRow2L(_svgHalfSquareH(), _svgHalfSquareV())},
    steps: [
      'Picture A: line goes across (horizontal). 2 equal parts.',
      'Picture B: line goes up-down (vertical). 2 equal parts.',
      'Both show halves — because BOTH have 2 parts that are the same size.',
      'The direction of the cut does not matter.',
      'What matters is that the parts are equal in size.'
    ],
    finalAnswer: 'Both show halves. Direction of the cut does not matter — equal size does.'
  }
];

// ── L5.5 bank assembly ────────────────────────────────────────────────────────
var _l55Bank = _colorizeQ([].concat(
  _l55C1, _l55C2, _l55C3, _l55C4, _l55C5,
  _l55C6, _l55C7, _l55C8, _l55C9, _l55C10
));


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
    //  Lesson 5.2 — 3D Shapes — Identify and Describe
    //  TEKS 1.6E | 132 questions (30E / 66M / 36H)
    //  C1 naming, C2 description, C3 real-world, C4 discrimination, C5 clues, C6 mixed
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l2',
      title: '3D Shapes — Identify and Describe',
      teks: ['1.6E'],
      skill: 'identify_3d_solids',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l52KeyIdeas,
      workedExamples: _l52Examples,
      quizBank: _l52Bank,
      diagnostics: {
        commonDistractors: [_3WS, _3DC, _3KP, _3CC, _3TS, _3SR],
        errorTags: [_3WS, _3DC, _3KP, _3CC, _3TS, _3SR],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.3 — Shape Attributes and Sorting
    //  TEKS 1.6A, 1.6B | 160 questions (50E / 65M / 45H)
    //  10 categories: C1 defining, C2 non-defining, C3 sides, C4 corners,
    //    C5 straight/curved, C6 orientation, C7 size, C8 2D/3D,
    //    C9 mixed sort, C10 error repair
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l3',
      title: 'Shape Attributes and Sorting',
      teks: ['1.6A', '1.6B'],
      skill: 'sort_shape_attributes',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l53KeyIdeas,
      workedExamples: _l53Examples,
      quizBank: _l53Bank,
      diagnostics: {
        commonDistractors: [_53DA, _53ND, _53WS, _53SC, _53VC, _53OR, _53CS, _53TD],
        errorTags: [_53DA, _53ND, _53WS, _53SC, _53VC, _53OR, _53CS, _53TD],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.4 — Compose and Recognize 2D Shapes
    //  TEKS 1.6C, 1.6F | 135 questions (40E / 55M / 40H)
    //  8 categories: C1 pieces→target, C2 composite→name, C3 components,
    //    C4 missing piece, C5 same target/diff pieces, C6 3-piece,
    //    C7 4-piece, C8 error repair
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l4',
      title: 'Compose and Recognize 2D Shapes',
      teks: ['1.6C', '1.6F'],
      skill: 'compose_2d_shapes',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l54KeyIdeas,
      workedExamples: _l54Examples,
      quizBank: _l54Bank,
      diagnostics: {
        commonDistractors: [_54CS, _54CP, _54MP, _54CN, _54OR, _54SZ, _54SA],
        errorTags: [_54CS, _54CP, _54MP, _54CN, _54OR, _54SZ, _54SA],
        interventionRules: []
      }
    },
    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.5 — Equal Parts — Halves and Fourths
    //  TEKS 1.6G, 1.6H | 155 questions (50E / 60M / 45H)
    //  10 categories: C1 name halves, C2 name fourths, C3 equal vs unequal,
    //    C4 non-examples halves, C5 non-examples fourths, C6 count parts,
    //    C7 match description, C8 same shape diff partition,
    //    C9 error repair, C10 mixed review
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l5',
      title: 'Equal Parts — Halves and Fourths',
      teks: ['1.6G', '1.6H'],
      skill: 'equal_parts_halves_fourths',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l55KeyIdeas,
      workedExamples: _l55Examples,
      quizBank: _l55Bank,
      diagnostics: {
        commonDistractors: [_55WN, _55PC, _55UP, _55EQ, _55HF, _55SP, _55NE],
        errorTags: [_55WN, _55PC, _55UP, _55EQ, _55HF, _55SP, _55NE],
        interventionRules: []
      }
    }

  ]
};

export default G1_U5_SPEC;
