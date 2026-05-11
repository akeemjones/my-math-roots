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
