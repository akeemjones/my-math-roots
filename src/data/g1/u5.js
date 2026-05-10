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
    teachingVisualRaw: _tv3dConeVsCylinder(),
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

  // Sphere mixed
  {t:'Which solid can roll in ANY direction?', s:_svg3dSphere(), o:[{val:'Cylinder',tag:_3SR},{val:'Sphere'},{val:'Cube',tag:_3WS},{val:'Cone',tag:_3WS}], a:1, e:'A sphere is round everywhere — it rolls in any direction.', d:'h', h:'Only a perfectly round solid rolls in any direction.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'A globe shows the Earth. The Earth is shaped like which solid?', s:_svg3dSphere(), o:[{val:'Sphere'},{val:'Cylinder',tag:_3SR},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS}], a:0, e:'The Earth is round in every direction — it is a sphere.', d:'h', h:'The Earth is perfectly round like a ball.', sk:'identify_3d_solids', i:_i3WS('sphere')},
  {t:'Which solid has NO flat faces AND no edges?', s:_svg3dSphere(), o:[{val:'Cube',tag:_3WS},{val:'Cylinder',tag:_3SR},{val:'Sphere'},{val:'Cone',tag:_3WS}], a:2, e:'Only a sphere has no flat faces and no edges — it is smooth all the way around.', d:'h', h:'No flat parts, no edges anywhere.', sk:'identify_3d_solids', i:_i3DC()},

  // Cone mixed
  {t:'Which solid would you use to make an ice cream cone shape?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3WS},{val:'Cone'}], a:3, e:'An ice cream cone shape has a point at the top — it is a cone.', d:'h', h:'Which solid has a pointed top?', sk:'identify_3d_solids', i:_i3WS('cone')},
  {t:'Which solid has one curved face and one flat face?', s:_svg3dCone(), o:[{val:'Cone'},{val:'Rectangular prism',tag:_3WS},{val:'Cube',tag:_3WS},{val:'Triangular prism',tag:_3WS}], a:0, e:'A cone has one curved surface (the side) and one flat circular base.', d:'h', h:'One curved part, one flat part.', sk:'identify_3d_solids', i:_i3CC()},
  {t:'A traffic cone keeps cars away. Which solid matches its shape?', s:_svg3dCone(), o:[{val:'Cylinder',tag:_3CC},{val:'Cone'},{val:'Sphere',tag:_3WS},{val:'Cube',tag:_3WS}], a:1, e:'A traffic cone has a point at the top — it is a cone.', d:'h', h:'A traffic cone has a pointed top and a wide round base.', sk:'identify_3d_solids', i:_i3WS('cone')},

  // Cylinder mixed
  {t:'Which solid can roll but only in one direction?', s:_svg3dCylinder(), o:[{val:'Cube',tag:_3WS},{val:'Rectangular prism',tag:_3WS},{val:'Cylinder'},{val:'Sphere',tag:_3SR}], a:2, e:'A cylinder rolls on its curved side but only forward and backward — not sideways like a sphere.', d:'h', h:'It rolls, but not in every direction like a sphere.', sk:'identify_3d_solids', i:_i3SR()},
  {t:'Which solid has the same circular cross-section all the way from top to bottom?', s:_svg3dCylinder(), o:[{val:'Cone',tag:_3CC},{val:'Sphere',tag:_3SR},{val:'Cylinder'},{val:'Triangular prism',tag:_3WS}], a:2, e:'A cylinder is the same circle shape all the way through.', d:'h', h:'The same shape all the way through — top matches bottom exactly.', sk:'identify_3d_solids', i:_i3WS('cylinder')},
  {t:'A battery powers a flashlight. Which solid matches the shape of a battery?', s:_svg3dCylinder(), o:[{val:'Cube',tag:_3WS},{val:'Sphere',tag:_3SR},{val:'Cone',tag:_3CC},{val:'Cylinder'}], a:3, e:'A battery is round at both ends — it is a cylinder.', d:'h', h:'A battery has two round flat ends.', sk:'identify_3d_solids', i:_i3WS('cylinder')},

  // Cube mixed
  {t:'A Rubik\'s cube is a famous puzzle toy. Which solid matches its shape?', s:_svg3dCube(), o:[{val:'Rectangular prism',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Triangular prism',tag:_3WS}], a:2, e:'A Rubik\'s cube has equal square faces on all sides — it is a cube.', d:'h', h:'All six faces are equal squares.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'Which solid stacks perfectly on top of another identical solid?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS},{val:'Cube'},{val:'Cylinder',tag:_3WS}], a:2, e:'A cube has flat faces — it stacks perfectly on another cube.', d:'h', h:'Flat faces stack evenly — which solid has flat faces on all sides?', sk:'identify_3d_solids', i:_i3WS('cube')},
  {t:'Which solid could a builder stack to build a perfect flat wall with no gaps?', s:_svg3dCube(), o:[{val:'Sphere',tag:_3WS},{val:'Cube'},{val:'Cylinder',tag:_3WS},{val:'Cone',tag:_3WS}], a:1, e:'A cube has flat square faces that fit together with no gaps.', d:'h', h:'Flat faces on all sides stack with no gaps.', sk:'identify_3d_solids', i:_i3KP()},

  // Rectangular prism mixed
  {t:'You want to stack books flat on a shelf. Which solid matches the shape of a book?', s:_svg3dRectPrism(), o:[{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS},{val:'Rectangular prism'},{val:'Cylinder',tag:_3WS}], a:2, e:'A book has flat rectangle faces — it is a rectangular prism.', d:'h', h:'A book has rectangle faces on all sides.', sk:'identify_3d_solids', i:_i3WS('rect-prism')},
  {t:'Which solid is used as a building block in most houses and walls?', s:_svg3dRectPrism(), o:[{val:'Rectangular prism'},{val:'Cube',tag:_3KP},{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3WS}], a:0, e:'A brick is a rectangular prism — it has rectangle faces and stacks well.', d:'h', h:'Bricks are rectangular prisms.', sk:'identify_3d_solids', i:_i3KP()},
  {t:'A cereal box is a rectangular prism. How is it different from a cube?', s:_svg3dRectPrism(), o:[{val:'It is taller than it is wide — faces are rectangles, not all equal squares'},{val:'It has fewer faces than a cube',tag:_3KP},{val:'It has curved faces',tag:_3WS},{val:'They are the same solid',tag:_3KP}], a:0, e:'A rectangular prism has rectangle faces — a cube has equal square faces. Both have 6 faces.', d:'h', h:'The faces are the key difference.', sk:'identify_3d_solids', i:_i3KP()},

  // Triangular prism mixed
  {t:'Which solid would you get if you cut a rectangular prism diagonally from top to bottom?', s:_svg3dTriPrism(), o:[{val:'Sphere',tag:_3WS},{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Cube',tag:_3WS}], a:2, e:'Cutting a box diagonally gives you a triangular prism with triangle ends.', d:'h', h:'Cutting a box diagonally creates a solid with triangle ends.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'A tent is set up in the backyard. The front and back are triangles. Which solid matches the tent shape?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Triangular prism'},{val:'Rectangular prism',tag:_3WS},{val:'Sphere',tag:_3WS}], a:1, e:'Triangle front and back + rectangle sides = triangular prism.', d:'h', h:'Triangle at the front AND back = triangular prism.', sk:'identify_3d_solids', i:_i3WS('tri-prism')},
  {t:'A wedge of cheese has triangle sides and flat rectangle faces. Which solid matches?', s:_svg3dTriPrism(), o:[{val:'Cone',tag:_3TS},{val:'Rectangular prism',tag:_3WS},{val:'Triangular prism'},{val:'Cube',tag:_3WS}], a:2, e:'A wedge of cheese has triangle ends and flat rectangle sides — it is a triangular prism.', d:'h', h:'Triangle ends and rectangle sides — triangular prism.', sk:'identify_3d_solids', i:_i3TS()}

];

// ── L5.2 bank assembly ────────────────────────────────────────────────────────

var _l52Bank = _colorizeQ([].concat(_l52C1, _l52C2, _l52C3, _l52C4, _l52C5, _l52C6));

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
