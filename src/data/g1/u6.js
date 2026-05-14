/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 6: Measurement & Time
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.7A  Use measuring tools (non-standard units) to measure the length of objects
 *    1.7B  Same-size units, end-to-end, no gaps/overlaps    (L6.2 — not in this file yet)
 *    1.7C  Same object measured with two different-size units   (L6.3 — scaffold)
 *    1.7D  Describe length to the nearest whole unit              (L6.4 — scaffold)
 *    1.7E  Tell time to the hour and half-hour                    (L6.5 — scaffold)
 *
 *  Lessons:
 *    L6.1  Measuring with Non-Standard Units      ← 145 questions (50E / 55M / 40H)
 *    L6.2  Understanding Units of Length          ← SCAFFOLD (0 questions)
 *    L6.3  Comparing Measurements                 ← SCAFFOLD (0 questions)
 *    L6.4  Describing Length                      ← SCAFFOLD (0 questions)
 *    L6.5  Telling Time                           ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - Length: non-standard units ONLY (paper clips, cubes, tiles, blocks).
 *      Standard units (inches, centimeters, feet, meters, yards) are Grade 2.
 *    - L6.1: no placement-judgment questions; visuals always show clean alignment.
 *    - L6.2: gaps/overlaps/same-size-rule reasoning (when authored).
 *    - L6.3: compare unit counts when unit SIZE changes — same object only.
 *    - L6.4: nearest WHOLE unit only — no half-units, no fractions.
 *    - L6.5: hour and half-hour ONLY (no minutes, no AM/PM, no elapsed time).
 * ════════════════════════════════════════════════════════════════════════════ */

// ── L6.1 error tags ──────────────────────────────────────────────────────────
var _61CW = 'err_count_units_wrong';
var _61SK = 'err_skip_unit';
var _61DC = 'err_double_count_unit';
var _61WN = 'err_wrong_unit_name';
var _61LC = 'err_length_comparison_confusion';
var _61MS = 'err_measurement_statement_confusion';

// ── L6.1 SVG helpers: single units ───────────────────────────────────────────
// Each unit is 28px wide for consistent train alignment; height varies by unit.
// Colors are baked in (cube=blue, paperclip=gray, tile=tan, block=orange) so
// students can recognize the unit type visually in C7 ("identify the unit").

function _u6Cube(x, y) {
  return '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="26" height="26" rx="3" ' +
    'fill="#BBDEFB" stroke="#1976D2" stroke-width="2"/>';
}
function _u6Clip(x, y) {
  // Paper clip: classic Gem-clip silhouette as two stroked rounded rectangles.
  // The inner rectangle extends ~4 units above the outer rectangle's top to
  // signal the iconic "wire crosses over at the top" detail — this is the
  // universally recognized paper-clip icon shape and reads instantly at
  // mobile sizes.
  // Outer: 18 wide × 22 tall, rounded corners (rx 7)
  // Inner: 8 wide × 22 tall, rounded corners (rx 3), shifted up by 4 units
  // Clip occupies x+5..x+23, y+2..y+28 within a 28-wide unit slot.
  return '<g stroke="#37474F" stroke-width="2.3" fill="none" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="' + (x + 5)  + '" y="' + (y + 6) + '" width="18" height="22" rx="7" ry="7"/>' +
    '<rect x="' + (x + 10) + '" y="' + (y + 2) + '" width="8"  height="22" rx="3" ry="3"/>' +
    '</g>';
}
function _u6Tile(x, y) {
  return '<rect x="' + (x + 1) + '" y="' + (y + 4) + '" width="26" height="20" rx="2" ' +
    'fill="#D7CCC8" stroke="#6D4C41" stroke-width="2"/>';
}
function _u6Block(x, y) {
  return '<rect x="' + (x + 2) + '" y="' + (y - 2) + '" width="24" height="32" rx="3" ' +
    'fill="#FFCCBC" stroke="#E64A19" stroke-width="2"/>';
}

var _u6UnitDrawers = { cube: _u6Cube, clip: _u6Clip, tile: _u6Tile, block: _u6Block };
var _u6UnitMeta = {
  cube:  { sing: 'cube',       plur: 'cubes',       label: 'cubes' },
  clip:  { sing: 'paper clip', plur: 'paper clips', label: 'paper clips' },
  tile:  { sing: 'tile',       plur: 'tiles',       label: 'tiles' },
  block: { sing: 'block',      plur: 'blocks',      label: 'blocks' }
};

// ── L6.1 SVG helpers: unit trains ────────────────────────────────────────────
function _u6Train(unit, n) {
  var draw = _u6UnitDrawers[unit];
  var s = '';
  for (var i = 0; i < n; i++) s += draw(8 + i * 28, 38);
  return s;
}

function _u6TrainLabeled(unit, n) {
  var draw = _u6UnitDrawers[unit];
  var s = '';
  for (var i = 0; i < n; i++) {
    s += '<text x="' + (8 + i * 28 + 14) + '" y="30" font-size="13" font-weight="800" ' +
      'fill="#37474F" text-anchor="middle" font-family="Nunito,sans-serif">' + (i + 1) + '</text>';
    s += draw(8 + i * 28, 38);
  }
  return s;
}

// ── L6.1 SVG helpers: object pictograms ──────────────────────────────────────
// Each takes (n) → returns inner SVG for an object that spans n × 28px width.

function _u6Pencil(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + (x + 8) + '" y="6" width="' + (w - 22) + '" height="16" fill="#FDD835" stroke="#F9A825" stroke-width="1.5"/>' +
    '<polygon points="' + (x + w - 14) + ',6 ' + (x + w - 2) + ',14 ' + (x + w - 14) + ',22" fill="#90A4AE" stroke="#455A64" stroke-width="1.5"/>' +
    '<polygon points="' + (x + w - 8) + ',12 ' + (x + w - 2) + ',14 ' + (x + w - 8) + ',16" fill="#37474F"/>' +
    '<rect x="' + x + '" y="6" width="9" height="16" fill="#EF9A9A" stroke="#C62828" stroke-width="1.5"/>' +
    '<rect x="' + (x + 8) + '" y="6" width="3" height="16" fill="#B0BEC5" stroke="#546E7A" stroke-width="1"/>';
}
function _u6Crayon(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + (x + 2) + '" y="5" width="' + (w - 16) + '" height="18" rx="2" fill="#E53935" stroke="#B71C1C" stroke-width="1.5"/>' +
    '<polygon points="' + (x + w - 14) + ',5 ' + (x + w - 2) + ',14 ' + (x + w - 14) + ',23" fill="#EF9A9A" stroke="#B71C1C" stroke-width="1.5"/>' +
    '<rect x="' + (x + 6) + '" y="5" width="' + Math.max(8, w - 30) + '" height="18" fill="#FFCDD2" stroke="#B71C1C" stroke-width="1"/>';
}
function _u6Marker(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + (x + 8) + '" y="6" width="' + (w - 22) + '" height="16" rx="2" fill="#1E88E5" stroke="#0D47A1" stroke-width="1.5"/>' +
    '<rect x="' + (x + w - 12) + '" y="9" width="8" height="10" rx="1" fill="#0D47A1"/>' +
    '<polygon points="' + (x + w - 4) + ',11 ' + (x + w) + ',14 ' + (x + w - 4) + ',17" fill="#37474F"/>' +
    '<rect x="' + x + '" y="6" width="9" height="16" rx="2" fill="#42A5F5" stroke="#0D47A1" stroke-width="1.5"/>';
}
function _u6Pen(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + (x + 6) + '" y="9" width="' + (w - 18) + '" height="11" rx="2" fill="#3949AB" stroke="#1A237E" stroke-width="1.5"/>' +
    '<polygon points="' + (x + w - 12) + ',9 ' + (x + w - 2) + ',14 ' + (x + w - 12) + ',20" fill="#90A4AE" stroke="#37474F" stroke-width="1.5"/>' +
    '<rect x="' + x + '" y="7" width="8" height="15" rx="2" fill="#1A237E" stroke="#0D47A1" stroke-width="1.5"/>';
}
function _u6Eraser(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + x + '" y="7" width="' + (w - 8) + '" height="14" rx="2" fill="#F8BBD0" stroke="#C2185B" stroke-width="1.5"/>' +
    '<rect x="' + (x + 3) + '" y="7" width="' + Math.max(4, w - 14) + '" height="5" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/>';
}
function _u6Stick(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + x + '" y="11" width="' + (w - 8) + '" height="7" rx="3.5" fill="#A1887F" stroke="#5D4037" stroke-width="1.5"/>';
}
function _u6Ribbon(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + x + '" y="9" width="' + (w - 14) + '" height="10" fill="#CE93D8" stroke="#7B1FA2" stroke-width="1.5"/>' +
    '<polygon points="' + (x + w - 14) + ',9 ' + (x + w - 2) + ',14 ' + (x + w - 14) + ',19 ' + (x + w - 8) + ',14" fill="#CE93D8" stroke="#7B1FA2" stroke-width="1.5"/>';
}
function _u6Book(n) {
  var w = n * 28; var x = 8;
  return '<rect x="' + x + '" y="5" width="' + (w - 8) + '" height="19" rx="1" fill="#388E3C" stroke="#1B5E20" stroke-width="1.5"/>' +
    '<line x1="' + (x + 3) + '" y1="9" x2="' + (x + w - 11) + '" y2="9" stroke="#FFFDE7" stroke-width="1"/>' +
    '<line x1="' + (x + 3) + '" y1="13" x2="' + (x + w - 11) + '" y2="13" stroke="#FFFDE7" stroke-width="1"/>' +
    '<line x1="' + (x + 3) + '" y1="17" x2="' + (x + w - 11) + '" y2="17" stroke="#FFFDE7" stroke-width="1"/>' +
    '<line x1="' + (x + 3) + '" y1="21" x2="' + (x + w - 11) + '" y2="21" stroke="#FFFDE7" stroke-width="1"/>';
}
function _u6Key(n) {
  var w = n * 28; var x = 8;
  return '<circle cx="' + (x + 8) + '" cy="14" r="8" fill="none" stroke="#FFB300" stroke-width="3"/>' +
    '<rect x="' + (x + 15) + '" y="11" width="' + (w - 22) + '" height="6" fill="#FFB300" stroke="#E65100" stroke-width="1.5"/>' +
    '<rect x="' + (x + w - 14) + '" y="11" width="3" height="9" fill="#FFB300" stroke="#E65100" stroke-width="1"/>' +
    '<rect x="' + (x + w - 8) + '" y="11" width="3" height="6" fill="#FFB300" stroke="#E65100" stroke-width="1"/>';
}
function _u6Leaf(n) {
  var w = n * 28; var x = 8;
  return '<path d="M' + (x + 2) + ' 14 Q ' + (x + w / 2) + ' 2, ' + (x + w - 4) + ' 14 Q ' + (x + w / 2) + ' 26, ' + (x + 2) + ' 14 Z" ' +
    'fill="#A5D6A7" stroke="#2E7D32" stroke-width="1.5"/>' +
    '<line x1="' + (x + 2) + '" y1="14" x2="' + (x + w - 4) + '" y2="14" stroke="#2E7D32" stroke-width="1.5"/>';
}

var _u6ObjDrawers = {
  pencil: _u6Pencil, crayon: _u6Crayon, marker: _u6Marker, pen: _u6Pen, eraser: _u6Eraser,
  stick:  _u6Stick,  ribbon: _u6Ribbon, book:   _u6Book,   key: _u6Key,  leaf: _u6Leaf
};
var _u6ObjName = {
  pencil: 'pencil', crayon: 'crayon', marker: 'marker', pen: 'pen', eraser: 'eraser',
  stick:  'stick',  ribbon: 'ribbon', book:   'book',   key: 'key',  leaf: 'leaf'
};
var _u6ObjArt = {
  pencil: 'a', crayon: 'a', marker: 'a', pen: 'a', eraser: 'an',
  stick:  'a', ribbon: 'a', book:   'a', key: 'a',  leaf: 'a'
};

// ── L6.1 SVG helpers: composite measurement picture ──────────────────────────
function _u6Pic(obj, unit, n) {
  var w = n * 28 + 16;
  return '<svg viewBox="0 0 ' + w + ' 72" width="100%" style="max-width:' + w + 'px;display:block;margin:0 auto">' +
    _u6ObjDrawers[obj](n) + _u6Train(unit, n) + '</svg>';
}
function _u6TwoPic(obj1, unit1, n1, obj2, unit2, n2) {
  var maxN = Math.max(n1, n2);
  var w = maxN * 28 + 16;
  return '<svg viewBox="0 0 ' + w + ' 156" width="100%" style="max-width:' + w + 'px;display:block;margin:0 auto">' +
    '<g transform="translate(0,0)">' + _u6ObjDrawers[obj1](n1) + _u6Train(unit1, n1) + '</g>' +
    '<g transform="translate(0,84)">' + _u6ObjDrawers[obj2](n2) + _u6Train(unit2, n2) + '</g>' +
    '</svg>';
}
function _u6PicLabeled(obj, unit, n) {
  var w = n * 28 + 16;
  return '<svg viewBox="0 0 ' + w + ' 80" width="100%" style="max-width:' + w + 'px;display:block;margin:0 auto">' +
    '<g transform="translate(0,8)">' + _u6ObjDrawers[obj](n) + '</g>' +
    _u6TrainLabeled(unit, n) + '</svg>';
}

// _u6FourPic — 4 labeled mini-pictures (A B / C D) for "Which picture shows..." questions.
// Used by C3 (match length to unit count). Each cell shows obj+unitTrain at the given count.
function _u6FourPic(obj, unit, counts) {
  var labels = ['A', 'B', 'C', 'D'];
  var cells = '';
  for (var i = 0; i < 4; i++) {
    cells += '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
      'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:140px;vertical-align:top">' +
      '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:3px">' + labels[i] + '</div>' +
      _u6Pic(obj, unit, counts[i]) +
      '</div>';
  }
  return '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;padding:4px 0">' + cells + '</div>';
}

// ── L6.1 teaching visuals (for intervention overlays) ────────────────────────
function _u6TvWrap(svg, cap) {
  return '<div style="text-align:center;padding:4px 0">' + svg +
    (cap ? '<div style="font-size:0.8rem;color:#5a7080;font-family:\'Nunito\',sans-serif;margin-top:6px;line-height:1.35">' + cap + '</div>' : '') +
    '</div>';
}
function _u6TvCountCarefully() {
  return _u6TvWrap(_u6PicLabeled('pencil', 'cube', 5),
    'Point to each cube and say a number: 1, 2, 3, 4, 5.');
}
function _u6TvUnitName() {
  return _u6TvWrap(_u6Pic('crayon', 'clip', 4),
    'These are paper clips, not cubes. Always say the unit name you see.');
}
function _u6TvCompare() {
  return _u6TvWrap(_u6TwoPic('marker', 'cube', 8, 'pencil', 'cube', 5),
    'More cubes (8) = longer. Fewer cubes (5) = shorter. Same kind of unit on both.');
}
function _u6TvStatement() {
  return _u6TvWrap(_u6Pic('pencil', 'cube', 5),
    'Count first → 5. Then pick the sentence that says "5 cubes long."');
}
function _u6TvRepair() {
  return _u6TvWrap(_u6PicLabeled('stick', 'block', 6),
    'Do not trust the question — count it yourself, one unit at a time.');
}

// ── L6.1 intervention factories ──────────────────────────────────────────────
function _i61CW() { return {
  errorTag: _61CW, title: 'Count the units carefully',
  teachingSteps: [
    'Start at one end of the object.',
    'Point to each unit and say a number: 1, 2, 3...',
    'The last number you say is how many units long the object is.',
    'Then say it with the number AND the unit name.'
  ],
  teachingVisualRaw: _u6TvCountCarefully(),
  correctAnswerExplanation: 'Count each unit one time, in order. The total is the length.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i61SK() { return {
  errorTag: _61SK, title: 'Do not skip a unit',
  teachingSteps: [
    'It is easy to skip a unit if you go too fast.',
    'Touch each unit as you say its number.',
    'Make sure every unit gets exactly one number.',
    'Try counting again — slowly.'
  ],
  teachingVisualRaw: _u6TvCountCarefully(),
  correctAnswerExplanation: 'Touch each unit so you do not skip any.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i61DC() { return {
  errorTag: _61DC, title: 'Do not count a unit twice',
  teachingSteps: [
    'It is easy to count a unit two times if you forget where you started.',
    'Touch each unit one time as you count: 1, 2, 3...',
    'Move from one end to the other — do not go back.',
    'Try counting again — once per unit.'
  ],
  teachingVisualRaw: _u6TvCountCarefully(),
  correctAnswerExplanation: 'Count each unit exactly once. Move steadily across.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i61WN() { return {
  errorTag: _61WN, title: 'Use the right unit name',
  teachingSteps: [
    'The picture shows the units that were used.',
    'Look at the shape: cube, paper clip, tile, or block?',
    'Say the unit name that matches the picture.',
    'A measurement needs a number AND the correct unit name.'
  ],
  teachingVisualRaw: _u6TvUnitName(),
  correctAnswerExplanation: 'The number is one part. The unit name has to match the picture.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i61LC() { return {
  errorTag: _61LC, title: 'More units = longer',
  teachingSteps: [
    'Both objects were measured with the same kind of unit.',
    'Count the units under each object.',
    'The object with more units is longer.',
    'The object with fewer units is shorter.'
  ],
  teachingVisualRaw: _u6TvCompare(),
  correctAnswerExplanation: 'Same unit → more units means longer. Fewer units means shorter.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i61MS() { return {
  errorTag: _61MS, title: 'Match the number AND the unit',
  teachingSteps: [
    'Count the units in the picture first.',
    'Now pick the sentence that has the same number.',
    'Make sure the unit name in the sentence matches the picture too.',
    'Both the number AND the unit name have to be right.'
  ],
  teachingVisualRaw: _u6TvStatement(),
  correctAnswerExplanation: 'A correct statement has the right number AND the right unit name.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i61Repair() { return {
  errorTag: _61CW, title: 'Check the count yourself',
  teachingSteps: [
    'Do not trust the number in the question.',
    'Look at the picture and count the units yourself.',
    'Touch each unit as you go: 1, 2, 3...',
    'The correct answer is what you counted, not what someone else said.'
  ],
  teachingVisualRaw: _u6TvRepair(),
  correctAnswerExplanation: 'Always count from the picture. The picture is the truth.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L6.1 question factory functions ──────────────────────────────────────────
// Helper: place the correct option (always opts[0]) into slot aIdx, shifting
// distractors. Returns a new 4-element array.
function _u6Place(opts, aIdx) {
  var correct = opts[0];
  var rest = opts.slice(1);
  var out = rest.slice();
  out.splice(aIdx, 0, correct);
  return out;
}

// _q1Count — "How many <unit>s long is the <obj>?"  (C1, C2, C6)
function _q1Count(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var art = _u6ObjArt[obj];
  var skip = Math.max(1, n - 1);
  var dbl  = n + 1;
  var other = (n >= 5) ? n - 2 : n + 2;
  var opts = [
    {val: n + ' ' + um.plur},
    {val: skip + ' ' + um.plur,  tag: _61SK},
    {val: dbl  + ' ' + um.plur,  tag: _61DC},
    {val: other + ' ' + um.plur, tag: _61CW}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'How many ' + um.plur + ' long is ' + art + ' ' + oname + ' that looks like this?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'Count the ' + um.plur + ': there are ' + n + '. The ' + oname + ' is ' + n + ' ' + um.plur + ' long.',
    d: diff,
    h: 'Touch each ' + um.sing + ' as you count.',
    sk: 'measure_nonstandard_units',
    i: _i61CW()
  };
}

// _q1Match — "Which picture shows a <obj> that is <n> <unit>s long?"  (C3)
// 4 labeled pictures (A/B/C/D). Correct picture shows count n; distractors show
// n-1 (skip), n+1 (double), n+2 (count wrong). aIdx is the slot of the correct.
function _q1Match(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var art = _u6ObjArt[obj];
  var wrongs = [Math.max(1, n - 1), n + 1, n + 2];
  var wrongTags = [_61SK, _61DC, _61CW];
  // Build slot arrays with the correct count at aIdx
  var slotCounts = wrongs.slice();
  slotCounts.splice(aIdx, 0, n);
  var slotTags = wrongTags.slice();
  slotTags.splice(aIdx, 0, null);
  var letters = ['A', 'B', 'C', 'D'];
  var opts = [];
  for (var i = 0; i < 4; i++) {
    if (i === aIdx) opts.push({val: 'Picture ' + letters[i]});
    else opts.push({val: 'Picture ' + letters[i], tag: slotTags[i]});
  }
  return {
    t: 'Which picture shows ' + art + ' ' + oname + ' that is ' + n + ' ' + um.plur + ' long?',
    s: _u6FourPic(obj, unit, slotCounts),
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' has exactly ' + n + ' ' + um.plur + ' under the ' + oname + '.',
    d: diff,
    h: 'Count the ' + um.plur + ' in each picture. Pick the one with ' + n + '.',
    sk: 'measure_nonstandard_units',
    i: _i61CW()
  };
}

// _q1Statement — picture given; pick the matching "X is N units long" sentence  (C4)
function _q1Statement(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var unitList = ['cube', 'clip', 'tile', 'block'];
  var others = unitList.filter(function(u){ return u !== unit; });
  var wrongUnit = _u6UnitMeta[others[n % others.length]].plur;
  var opts = [
    {val: 'The ' + oname + ' is ' + n + ' ' + um.plur + ' long.'},
    {val: 'The ' + oname + ' is ' + n + ' ' + wrongUnit + ' long.', tag: _61WN},
    {val: 'The ' + oname + ' is ' + (n + 1) + ' ' + um.plur + ' long.', tag: _61MS},
    {val: 'The ' + oname + ' is ' + Math.max(1, n - 1) + ' ' + um.plur + ' long.', tag: _61MS}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. Which sentence tells how long the ' + oname + ' is?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'There are ' + n + ' ' + um.plur + ' under the ' + oname + ', so it is ' + n + ' ' + um.plur + ' long.',
    d: diff,
    h: 'First count. Then pick the sentence with the right number AND the right unit name.',
    sk: 'measure_nonstandard_units',
    i: _i61MS()
  };
}

// _q1Compare — two objects, same unit type; pick longer or shorter  (C5)
function _q1Compare(obj1, n1, obj2, n2, unit, ask, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var o1 = _u6ObjName[obj1];
  var o2 = _u6ObjName[obj2];
  var longer  = (n1 > n2) ? o1 : o2;
  var shorter = (n1 > n2) ? o2 : o1;
  var correctName = (ask === 'longer') ? longer : shorter;
  var wrongName   = (ask === 'longer') ? shorter : longer;
  var opts = [
    {val: 'The ' + correctName },
    {val: 'The ' + wrongName, tag: _61LC},
    {val: 'They are the same length', tag: _61LC},
    {val: 'You cannot tell', tag: _61MS}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the two pictures. Which is ' + ask + '?',
    s: _u6TwoPic(obj1, unit, n1, obj2, unit, n2),
    o: opts, a: aIdx,
    e: 'The ' + o1 + ' is ' + n1 + ' ' + um.plur + '. The ' + o2 + ' is ' + n2 + ' ' + um.plur + '. ' +
       (ask === 'longer' ? 'More ' + um.plur + ' = longer.' : 'Fewer ' + um.plur + ' = shorter.') +
       ' So the ' + correctName + ' is ' + ask + '.',
    d: diff,
    h: 'Count the ' + um.plur + ' under each. More = longer; fewer = shorter.',
    sk: 'measure_nonstandard_units',
    i: _i61LC()
  };
}

// _q1IdentifyUnit — picture given; pick which unit name was used  (C7)
function _q1IdentifyUnit(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var others = ['cube', 'clip', 'tile', 'block'].filter(function(u){ return u !== unit; });
  var opts = [
    {val: um.plur },
    {val: _u6UnitMeta[others[0]].plur, tag: _61WN},
    {val: _u6UnitMeta[others[1]].plur, tag: _61WN},
    {val: _u6UnitMeta[others[2]].plur, tag: _61WN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. What unit was used to measure the ' + oname + '?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'The shapes under the ' + oname + ' are ' + um.plur + '.',
    d: diff,
    h: 'Look at the shape of each unit. Is it a cube, a paper clip, a tile, or a block?',
    sk: 'measure_nonstandard_units',
    i: _i61WN()
  };
}

// _q1Repair — someone claimed a wrong count; find the right one from the picture  (C8)
function _q1Repair(obj, unit, n, wrongN, person, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var opts = [
    {val: n + ' ' + um.plur},
    {val: wrongN + ' ' + um.plur, tag: _61CW},
    {val: (n + 2) + ' ' + um.plur, tag: _61CW},
    {val: Math.max(1, n - 2) + ' ' + um.plur, tag: _61CW}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: person + ' said the ' + oname + ' is ' + wrongN + ' ' + um.plur + ' long, but ' +
       person + ' was wrong. Look at the picture. What is the correct answer?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'Count for yourself: there are ' + n + ' ' + um.plur + '. The correct answer is ' + n + ' ' + um.plur + '.',
    d: diff,
    h: 'Do not trust the number in the question. Count the picture yourself.',
    sk: 'measure_nonstandard_units',
    i: _i61Repair()
  };
}

// ── L6.1 key ideas ────────────────────────────────────────────────────────────
var _l61KeyIdeas = [
  'We measure how long something is by counting units lined up under it.',
  'Start at one end of the object and count each unit one time.',
  'The answer has both a number AND a unit name — like "5 cubes long."',
  'Paper clips, cubes, tiles, and blocks are all units we can use to measure length.',
  'With the same kind of unit, more units = longer; fewer units = shorter.',
  'We can compare two objects by counting the units under each.'
];

// ── L6.1 worked examples ──────────────────────────────────────────────────────
var _l61Examples = [
  {
    id: 'g1-u6-l1-ex-1',
    title: 'Example 1: Counting cubes under a pencil',
    prompt: 'How many cubes long is the pencil?',
    visual: {type: 'rawHtml', html: _u6Pic('pencil', 'cube', 5)},
    steps: [
      'Start at one end of the pencil (the eraser end works).',
      'Point to each cube and count: 1, 2, 3, 4, 5.',
      'The last number you said is the length.',
      'Say the answer with a number AND a unit name: "5 cubes long."'
    ],
    finalAnswer: 'The pencil is 5 cubes long.'
  },
  {
    id: 'g1-u6-l1-ex-2',
    title: 'Example 2: Counting paper clips under a crayon',
    prompt: 'How many paper clips long is the crayon?',
    visual: {type: 'rawHtml', html: _u6Pic('crayon', 'clip', 3)},
    steps: [
      'Start at one end of the crayon.',
      'Touch each paper clip and count: 1, 2, 3.',
      'The crayon is as long as 3 paper clips.',
      'Answer with the number AND the unit name.'
    ],
    finalAnswer: 'The crayon is 3 paper clips long.'
  },
  {
    id: 'g1-u6-l1-ex-3',
    title: 'Example 3: Comparing two objects with the same kind of unit',
    prompt: 'Which is longer, the marker or the pencil?',
    visual: {type: 'rawHtml', html: _u6TwoPic('marker', 'cube', 8, 'pencil', 'cube', 5)},
    steps: [
      'Count the cubes under the marker: 8.',
      'Count the cubes under the pencil: 5.',
      '8 is more than 5.',
      'More cubes means longer.'
    ],
    finalAnswer: 'The marker is longer (8 cubes) than the pencil (5 cubes).'
  },
  {
    id: 'g1-u6-l1-ex-4',
    title: 'Example 4: Measuring a book with tiles',
    prompt: 'How many tiles long is the book?',
    visual: {type: 'rawHtml', html: _u6Pic('book', 'tile', 4)},
    steps: [
      'Start at one edge of the book.',
      'Count tiles one at a time: 1, 2, 3, 4.',
      'The book is as long as 4 tiles.',
      'Write the answer with a number AND a unit name.'
    ],
    finalAnswer: 'The book is 4 tiles long.'
  },
  {
    id: 'g1-u6-l1-ex-5',
    title: 'Example 5: Counting carefully — do not skip or double-count',
    prompt: 'How many blocks long is the stick? Look at the numbers above each block.',
    visual: {type: 'rawHtml', html: _u6PicLabeled('stick', 'block', 6)},
    steps: [
      'Start at one end. Point to it.',
      'Each block gets one number — do not skip any block.',
      'Do not count the same block two times.',
      'The last number you say is the length.'
    ],
    finalAnswer: 'The stick is 6 blocks long.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L6.1 question banks (8 categories, 145 total)
//  Difficulty:  E = small count (1-5),  M = medium count (4-7),  H = large or multi-step
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Count cubes (25 = 8E / 10M / 7H) ─────────────────────────────────────
var _l61C1 = [
  _q1Count('pencil','cube',3,'e',0), _q1Count('crayon','cube',4,'e',1),
  _q1Count('marker','cube',5,'e',2), _q1Count('pen',   'cube',2,'e',3),
  _q1Count('eraser','cube',2,'e',0), _q1Count('stick', 'cube',4,'e',1),
  _q1Count('ribbon','cube',5,'e',2), _q1Count('book',  'cube',3,'e',3),
  _q1Count('pencil','cube',6,'m',0), _q1Count('crayon','cube',5,'m',1),
  _q1Count('marker','cube',7,'m',2), _q1Count('pen',   'cube',4,'m',3),
  _q1Count('eraser','cube',4,'m',0), _q1Count('stick', 'cube',6,'m',1),
  _q1Count('ribbon','cube',7,'m',2), _q1Count('book',  'cube',5,'m',3),
  _q1Count('key',   'cube',4,'m',0), _q1Count('leaf',  'cube',5,'m',1),
  _q1Count('pencil','cube',8, 'h',2), _q1Count('crayon','cube',7,'h',3),
  _q1Count('marker','cube',9, 'h',0), _q1Count('stick', 'cube',8,'h',1),
  _q1Count('ribbon','cube',10,'h',2), _q1Count('book',  'cube',7,'h',3),
  _q1Count('pen',   'cube',9, 'h',0)
];

// ── C2: Count paper clips (25 = 9E / 10M / 6H) ───────────────────────────────
var _l61C2 = [
  _q1Count('pencil','clip',2,'e',0), _q1Count('crayon','clip',3,'e',1),
  _q1Count('marker','clip',4,'e',2), _q1Count('pen',   'clip',3,'e',3),
  _q1Count('eraser','clip',2,'e',0), _q1Count('stick', 'clip',5,'e',1),
  _q1Count('ribbon','clip',4,'e',2), _q1Count('book',  'clip',3,'e',3),
  _q1Count('key',   'clip',2,'e',0),
  _q1Count('pencil','clip',5,'m',1), _q1Count('crayon','clip',6,'m',2),
  _q1Count('marker','clip',7,'m',3), _q1Count('pen',   'clip',5,'m',0),
  _q1Count('eraser','clip',4,'m',1), _q1Count('stick', 'clip',6,'m',2),
  _q1Count('ribbon','clip',7,'m',3), _q1Count('book',  'clip',5,'m',0),
  _q1Count('key',   'clip',4,'m',1), _q1Count('leaf',  'clip',6,'m',2),
  _q1Count('pencil','clip',8, 'h',3), _q1Count('crayon','clip',9,'h',0),
  _q1Count('marker','clip',8, 'h',1), _q1Count('stick', 'clip',9,'h',2),
  _q1Count('ribbon','clip',10,'h',3), _q1Count('book',  'clip',7,'h',0)
];

// ── C3: Match length to unit count (18 = 7E / 7M / 4H) ───────────────────────
var _l61C3 = [
  _q1Match('pencil','cube',3,'e',0), _q1Match('crayon','clip',2,'e',1),
  _q1Match('marker','cube',4,'e',2), _q1Match('pen',   'clip',3,'e',3),
  _q1Match('eraser','cube',2,'e',0), _q1Match('stick', 'cube',5,'e',1),
  _q1Match('ribbon','clip',4,'e',2),
  _q1Match('book',  'tile', 5,'m',3), _q1Match('pencil','clip', 6,'m',0),
  _q1Match('crayon','cube', 6,'m',1), _q1Match('marker','block',5,'m',2),
  _q1Match('stick', 'cube', 7,'m',3), _q1Match('ribbon','tile', 5,'m',0),
  _q1Match('key',   'cube', 4,'m',1),
  _q1Match('pencil','block',7,'h',2), _q1Match('book',  'cube', 8,'h',3),
  _q1Match('stick', 'tile', 6,'h',0), _q1Match('ribbon','cube', 9,'h',1)
];

// ── C4: Correct measurement statement (20 = 8E / 7M / 5H) ────────────────────
var _l61C4 = [
  _q1Statement('pencil','cube',3,'e',0), _q1Statement('crayon','clip',3,'e',1),
  _q1Statement('marker','cube',4,'e',2), _q1Statement('pen',   'clip',2,'e',3),
  _q1Statement('eraser','cube',2,'e',0), _q1Statement('stick', 'clip',5,'e',1),
  _q1Statement('book',  'tile',3,'e',2), _q1Statement('ribbon','cube',4,'e',3),
  _q1Statement('pencil','block',5,'m',0), _q1Statement('crayon','cube', 5,'m',1),
  _q1Statement('marker','clip', 6,'m',2), _q1Statement('stick', 'tile', 6,'m',3),
  _q1Statement('ribbon','block',5,'m',0), _q1Statement('key',   'cube', 4,'m',1),
  _q1Statement('leaf',  'clip', 5,'m',2),
  _q1Statement('pencil','tile', 7,'h',3), _q1Statement('book',  'block',6,'h',0),
  _q1Statement('stick', 'clip', 8,'h',1), _q1Statement('ribbon','cube', 9,'h',2),
  _q1Statement('marker','block',7,'h',3)
];

// ── C5: Longer / shorter from counts (18 = 5E / 8M / 5H) ─────────────────────
var _l61C5 = [
  _q1Compare('marker',6,'pencil',4,'cube','longer','e',0),
  _q1Compare('pencil',3,'crayon',5,'cube','shorter','e',1),
  _q1Compare('ribbon',7,'eraser',2,'clip','longer','e',2),
  _q1Compare('pen',   2,'stick', 6,'clip','shorter','e',3),
  _q1Compare('book',  5,'key',   3,'cube','longer','e',0),
  _q1Compare('marker',7,'pencil',5,'clip', 'longer','m',1),
  _q1Compare('crayon',4,'stick', 8,'cube', 'shorter','m',2),
  _q1Compare('ribbon',9,'book',  6,'tile', 'longer','m',3),
  _q1Compare('pen',   3,'marker',7,'block','shorter','m',0),
  _q1Compare('eraser',2,'pencil',6,'cube', 'shorter','m',1),
  _q1Compare('stick', 8,'crayon',5,'clip', 'longer','m',2),
  _q1Compare('leaf',  4,'ribbon',7,'cube', 'shorter','m',3),
  _q1Compare('book',  6,'pen',   4,'tile', 'longer','m',0),
  _q1Compare('marker',9,'stick', 7,'cube', 'longer','h',1),
  _q1Compare('crayon',6,'ribbon',9,'clip', 'shorter','h',2),
  _q1Compare('pencil',8,'pen',   5,'block','longer','h',3),
  _q1Compare('eraser',3,'book',  8,'tile', 'shorter','h',0),
  _q1Compare('stick',10,'leaf',  6,'cube', 'longer','h',1)
];

// ── C6: Measure with tiles / blocks (18 = 7E / 8M / 3H) ──────────────────────
var _l61C6 = [
  _q1Count('book',  'tile', 3,'e',0), _q1Count('eraser','tile', 2,'e',1),
  _q1Count('pencil','tile', 4,'e',2), _q1Count('ribbon','tile', 5,'e',3),
  _q1Count('crayon','block',3,'e',0), _q1Count('marker','block',4,'e',1),
  _q1Count('stick', 'block',5,'e',2),
  _q1Count('pencil','tile', 6,'m',3), _q1Count('book',  'tile', 5,'m',0),
  _q1Count('ribbon','tile', 7,'m',1), _q1Count('stick', 'tile', 6,'m',2),
  _q1Count('crayon','block',6,'m',3), _q1Count('pen',   'block',5,'m',0),
  _q1Count('marker','block',7,'m',1), _q1Count('key',   'block',4,'m',2),
  _q1Count('pencil','tile', 8,'h',0), _q1Count('stick', 'block',9,'h',1),
  _q1Count('ribbon','tile', 9,'h',2)
];

// ── C7: Identify the unit used (12 = 6E / 4M / 2H) ───────────────────────────
var _l61C7 = [
  _q1IdentifyUnit('pencil','cube', 4,'e',0), _q1IdentifyUnit('crayon','clip', 3,'e',1),
  _q1IdentifyUnit('book',  'tile', 4,'e',2), _q1IdentifyUnit('stick', 'block',5,'e',3),
  _q1IdentifyUnit('marker','cube', 5,'e',0), _q1IdentifyUnit('ribbon','clip', 6,'e',1),
  _q1IdentifyUnit('pen',   'tile', 5,'m',2), _q1IdentifyUnit('eraser','block',3,'m',3),
  _q1IdentifyUnit('leaf',  'cube', 4,'m',0), _q1IdentifyUnit('key',   'clip', 3,'m',1),
  _q1IdentifyUnit('pencil','block',7,'h',2), _q1IdentifyUnit('book',  'tile', 6,'h',3)
];

// ── C8: Error repair (9 = 0E / 1M / 8H) ──────────────────────────────────────
var _l61C8 = [
  _q1Repair('pencil','cube', 5,6,'Maya', 'm',0),
  _q1Repair('crayon','clip', 4,3,'Sam',  'h',1),
  _q1Repair('marker','cube', 7,5,'Leo',  'h',2),
  _q1Repair('stick', 'block',6,8,'Mia',  'h',3),
  _q1Repair('ribbon','tile', 5,7,'Aiden','h',0),
  _q1Repair('book',  'cube', 6,4,'Zoe',  'h',1),
  _q1Repair('pen',   'clip', 4,6,'Eli',  'h',2),
  _q1Repair('eraser','tile', 3,5,'Lily', 'h',3),
  _q1Repair('key',   'cube', 4,2,'Noah', 'h',0)
];

// ── L6.1 combined bank ───────────────────────────────────────────────────────
var _l61Bank = [].concat(_l61C1, _l61C2, _l61C3, _l61C4, _l61C5, _l61C6, _l61C7, _l61C8);


// ════════════════════════════════════════════════════════════════════════════
//  L6.2 — Understanding Units of Length
//  TEKS 1.7B | 135 questions (45E / 55M / 35H)
//  Scope: judge measurement-picture validity. NO clean counting (that's L6.1).
//  NO comparing valid measurements with different unit sizes (that's L6.3).
// ════════════════════════════════════════════════════════════════════════════

// ── L6.2 error tags ──────────────────────────────────────────────────────────
var _62GP = 'err_gap_between_units';
var _62OV = 'err_units_overlap';
var _62MX = 'err_mixed_unit_sizes';
var _62BS = 'err_bad_start_alignment';
var _62BE = 'err_bad_end_alignment';
var _62WP = 'err_wrong_measurement_picture';
var _62RC = 'err_reason_confusion';
var _62CW = 'err_count_without_checking_units';

// ── L6.2 SVG helpers: width-aware unit drawer (for mixed-size visuals) ───────
// Renders a single unit at a custom width, with the bottom aligned to the
// same y-baseline as the standard 28-wide drawers (so mixed sizes still
// sit on a common floor).
function _u6UnitWide(unit, x, y, w) {
  if (unit === 'cube') {
    var topY = y + 29 - w;  // bottom-align with full-size cube (28x28)
    return '<rect x="' + (x + 1) + '" y="' + topY + '" width="' + (w - 2) + '" height="' + (w - 2) +
      '" rx="3" fill="#BBDEFB" stroke="#1976D2" stroke-width="2"/>';
  }
  if (unit === 'tile') {
    return '<rect x="' + (x + 1) + '" y="' + (y + 4) + '" width="' + (w - 2) + '" height="20" rx="2" ' +
      'fill="#D7CCC8" stroke="#6D4C41" stroke-width="2"/>';
  }
  if (unit === 'block') {
    return '<rect x="' + (x + 2) + '" y="' + (y - 2) + '" width="' + (w - 4) + '" height="32" rx="3" ' +
      'fill="#FFCCBC" stroke="#E64A19" stroke-width="2"/>';
  }
  return _u6Clip(x, y);  // paper clips don't scale gracefully — use fixed width
}

// ── L6.2 SVG helpers: object renderer at arbitrary total width ───────────────
// Lets us render an object that spans a non-standard width (e.g., when the
// train has gaps/overlaps/mixed sizes that change the effective length).
function _u6ObjAtW(obj, totalW) {
  return _u6ObjDrawers[obj](totalW / 28);
}

// ── L6.2 SVG helpers: "bad" measurement pictures ─────────────────────────────
// All bad-picture helpers return a full <svg>...</svg> string. Object always
// matches the train's effective span so the relationship between object edge
// and train placement is unambiguous.

// _u6PicGap — train with gaps inserted after specified unit indices.
function _u6PicGap(obj, unit, n, gapAt) {
  var gapSize = 14;
  var totalW = n * 28 + gapAt.length * gapSize;
  var canvasW = totalW + 16;
  var trainSvg = '';
  var x = 8;
  for (var i = 0; i < n; i++) {
    trainSvg += _u6UnitDrawers[unit](x, 38);
    x += 28;
    if (gapAt.indexOf(i) !== -1) x += gapSize;
  }
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, totalW) + trainSvg + '</svg>';
}

// _u6PicOverlap — train where specified unit indices overlap the previous unit.
function _u6PicOverlap(obj, unit, n, overlapAt) {
  var overlapSize = 12;
  var totalW = n * 28 - overlapAt.length * overlapSize;
  var canvasW = totalW + 16;
  var trainSvg = '';
  var x = 8;
  for (var i = 0; i < n; i++) {
    if (overlapAt.indexOf(i) !== -1) x -= overlapSize;
    trainSvg += _u6UnitDrawers[unit](x, 38);
    x += 28;
  }
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, totalW) + trainSvg + '</svg>';
}

// _u6PicMixedSize — train with units of varying widths.
// `sizes` is an array of unit widths (mix big=28 with small=18).
function _u6PicMixedSize(obj, unit, sizes) {
  var totalW = 0;
  for (var k = 0; k < sizes.length; k++) totalW += sizes[k];
  var canvasW = totalW + 16;
  var trainSvg = '';
  var x = 8;
  for (var i = 0; i < sizes.length; i++) {
    trainSvg += _u6UnitWide(unit, x, 38, sizes[i]);
    x += sizes[i];
  }
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, totalW) + trainSvg + '</svg>';
}

// _u6PicBadStart — train shifted right by `offset`, NOT starting at object edge.
// Object spans the full distance from x=8 to the train's right edge.
function _u6PicBadStart(obj, unit, n, offset) {
  var objW = n * 28 + offset;
  var canvasW = objW + 16;
  var trainSvg = '';
  for (var i = 0; i < n; i++) {
    trainSvg += _u6UnitDrawers[unit](8 + offset + i * 28, 38);
  }
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, objW) + trainSvg + '</svg>';
}

// _u6PicShortTrain — train starts at edge but ends before object's other end.
function _u6PicShortTrain(obj, unit, n, shortBy) {
  var objW = n * 28 + shortBy;
  var canvasW = objW + 16;
  var trainSvg = '';
  for (var i = 0; i < n; i++) {
    trainSvg += _u6UnitDrawers[unit](8 + i * 28, 38);
  }
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, objW) + trainSvg + '</svg>';
}

// _u6PicLongTrain — train extends past the object's right edge.
function _u6PicLongTrain(obj, unit, n, longBy) {
  var objW = Math.max(28, n * 28 - longBy);
  var trainW = n * 28;
  var canvasW = trainW + 16;
  var trainSvg = '';
  for (var i = 0; i < n; i++) {
    trainSvg += _u6UnitDrawers[unit](8 + i * 28, 38);
  }
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, objW) + trainSvg + '</svg>';
}

// _u6PicCompare — side-by-side two pictures with A / B labels.
function _u6PicCompare(svgLeft, svgRight) {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding:4px">' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:4px">A</div>' + svgLeft + '</div>' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:4px">B</div>' + svgRight + '</div>' +
    '</div>';
}

// _u6FourMixedPic — 4 mini-pictures with A/B/C/D labels for picking the
// correct one. Each picture is provided as a pre-built SVG string.
function _u6FourMixedPic(svgs) {
  var labels = ['A', 'B', 'C', 'D'];
  var cells = '';
  for (var i = 0; i < 4; i++) {
    cells += '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
      'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:150px;vertical-align:top">' +
      '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:3px">' + labels[i] + '</div>' +
      svgs[i] + '</div>';
  }
  return '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;padding:4px 0">' + cells + '</div>';
}

// ── L6.2 teaching visuals (for intervention overlays) ────────────────────────
function _u6TvGap() {
  return _u6TvWrap(
    _u6PicCompare(_u6Pic('pencil', 'cube', 5), _u6PicGap('pencil', 'cube', 5, [1, 3])),
    'A: units touch — fair. B: there are gaps — not fair.'
  );
}
function _u6TvOverlap() {
  return _u6TvWrap(
    _u6PicCompare(_u6Pic('crayon', 'clip', 4), _u6PicOverlap('crayon', 'clip', 4, [1, 2])),
    'A: clips touch end-to-end — fair. B: clips overlap — not fair.'
  );
}
function _u6TvMixedSize() {
  return _u6TvWrap(
    _u6PicCompare(_u6Pic('marker', 'cube', 5), _u6PicMixedSize('marker', 'cube', [28, 18, 28, 18, 28])),
    'A: same-size cubes — fair. B: different-size cubes — not fair.'
  );
}
function _u6TvBadStart() {
  return _u6TvWrap(
    _u6PicCompare(_u6Pic('book', 'tile', 4), _u6PicBadStart('book', 'tile', 4, 18)),
    'A: train starts at the edge — fair. B: train starts past the edge — not fair.'
  );
}
function _u6TvBadEnd() {
  return _u6TvWrap(
    _u6PicCompare(_u6Pic('stick', 'block', 5), _u6PicShortTrain('stick', 'block', 4, 28)),
    'A: train reaches the end — fair. B: train stops short — not fair.'
  );
}
function _u6TvReason() {
  return _u6TvWrap(_u6Pic('pencil', 'cube', 5),
    'Check 4 things: starts at edge? same size? no gaps? no overlaps?');
}
function _u6TvCheckFirst() {
  return _u6TvWrap(_u6PicGap('pencil', 'cube', 5, [2]),
    'Always check the picture before counting. A bad placement gives a wrong count.');
}

// ── L6.2 intervention factories ──────────────────────────────────────────────
function _i62Gap() { return {
  errorTag: _62GP, title: 'Units must touch — no gaps',
  teachingSteps: [
    'Look at the units in the picture.',
    'Are there empty spaces between any of them?',
    'Spaces between units are called gaps. Gaps make the object look longer than it really is.',
    'A fair measurement has no gaps between units.'
  ],
  teachingVisualRaw: _u6TvGap(),
  correctAnswerExplanation: 'Units must touch end-to-end. Gaps between them make the measurement wrong.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i62Overlap() { return {
  errorTag: _62OV, title: 'Units must not overlap',
  teachingSteps: [
    'Look at the units in the picture.',
    'Are any of them on top of each other?',
    'When units overlap, the count is too high — they cover the same space twice.',
    'A fair measurement has units touching but not overlapping.'
  ],
  teachingVisualRaw: _u6TvOverlap(),
  correctAnswerExplanation: 'Units must touch end-to-end but never overlap each other.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i62MixedSize() { return {
  errorTag: _62MX, title: 'All units must be the same size',
  teachingSteps: [
    'Look at the units in the picture.',
    'Are they all the same size, or are some bigger and some smaller?',
    'When units are different sizes, the count is not fair.',
    'A fair measurement uses units that are all the same size.'
  ],
  teachingVisualRaw: _u6TvMixedSize(),
  correctAnswerExplanation: 'Every unit in the train must be the same size for the measurement to be fair.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i62BadStart() { return {
  errorTag: _62BS, title: 'Start at the edge of the object',
  teachingSteps: [
    'Look at where the train begins.',
    'Does the first unit start right at the edge of the object?',
    'If the train starts past the edge, part of the object is not being measured.',
    'A fair measurement starts at one end of the object.'
  ],
  teachingVisualRaw: _u6TvBadStart(),
  correctAnswerExplanation: 'The first unit must start at one end of the object — no space before it.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i62BadEnd() { return {
  errorTag: _62BE, title: 'Reach the other end of the object',
  teachingSteps: [
    'Look at where the train ends.',
    'Does the last unit reach the other end of the object?',
    'If the train stops short, part of the object is not measured.',
    'A fair measurement reaches all the way to the other end.'
  ],
  teachingVisualRaw: _u6TvBadEnd(),
  correctAnswerExplanation: 'The last unit must reach all the way to the other end of the object.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i62Reason() { return {
  errorTag: _62RC, title: 'Check 4 things before you trust a measurement',
  teachingSteps: [
    'Step 1: Does the train start at the edge of the object?',
    'Step 2: Are all the units the same size?',
    'Step 3: Do the units touch with no gaps?',
    'Step 4: Are the units NOT overlapping?'
  ],
  teachingVisualRaw: _u6TvReason(),
  correctAnswerExplanation: 'A fair measurement passes all 4 checks. If even one fails, the measurement is wrong.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i62CheckFirst() { return {
  errorTag: _62CW, title: 'Check the picture before counting',
  teachingSteps: [
    'Before you count the units, look at the picture carefully.',
    'Are the units placed correctly?',
    'If there are gaps, overlaps, or different sizes, the count will be wrong.',
    'Only count when the units are placed in a fair way.'
  ],
  teachingVisualRaw: _u6TvCheckFirst(),
  correctAnswerExplanation: 'A count is only meaningful when the units are placed correctly. Always check first.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// Maps errorType to intervention factory (for question factories below).
function _i62For(errorType) {
  if (errorType === 'gap')      return _i62Gap();
  if (errorType === 'overlap')  return _i62Overlap();
  if (errorType === 'mixed')    return _i62MixedSize();
  if (errorType === 'badStart') return _i62BadStart();
  if (errorType === 'badEnd')   return _i62BadEnd();
  return _i62Reason();
}

// ── L6.2 question factory functions ──────────────────────────────────────────

// _q62IsFair — show a picture (possibly with an error) and ask if it's fair.
// errorType: 'gap'|'overlap'|'mixed'|'badStart'|'badEnd'|null (null=fair picture)
function _q62IsFair(picSvg, errorType, diff, aIdx) {
  var reasons = {
    fair:     'Yes — this is a fair measurement',
    gap:      'No — there are gaps between the units',
    overlap:  'No — the units overlap each other',
    mixed:    'No — the units are different sizes',
    badStart: 'No — the train does not start at the edge of the object',
    badEnd:   'No — the train does not reach the other end of the object'
  };
  var correctKey = errorType || 'fair';
  // Pick 3 distractors that are different from the correct
  var distractorKeys = ['fair','gap','overlap','mixed','badStart','badEnd']
    .filter(function(k){ return k !== correctKey; }).slice(0, 3);
  var opts = [
    {val: reasons[correctKey]},
    {val: reasons[distractorKeys[0]], tag: (correctKey === 'fair' ? _62CW : _62RC)},
    {val: reasons[distractorKeys[1]], tag: (correctKey === 'fair' ? _62CW : _62RC)},
    {val: reasons[distractorKeys[2]], tag: (correctKey === 'fair' ? _62CW : _62RC)}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. Is this a fair measurement?',
    s: picSvg,
    o: opts, a: aIdx,
    e: (correctKey === 'fair'
        ? 'The units touch end-to-end, are the same size, and span the whole object.'
        : 'It is not fair: ' + reasons[correctKey].slice(5).toLowerCase() + '.'),
    d: diff,
    h: 'Check 4 things: start at edge, same size, no gaps, no overlaps.',
    sk: 'understand_length_units',
    i: _i62For(errorType)
  };
}

// _q62PickCorrect — 4 labeled pictures (A/B/C/D); pick the one that is a fair
// measurement. `slotConfigs` is array of 4 strings: 'fair' or an errorType.
function _q62PickCorrect(obj, unit, n, slotConfigs, aIdx, diff) {
  // Build 4 SVGs based on slotConfigs
  var svgs = slotConfigs.map(function(cfg) {
    if (cfg === 'fair')      return _u6Pic(obj, unit, n);
    if (cfg === 'gap')       return _u6PicGap(obj, unit, n, [1]);
    if (cfg === 'overlap')   return _u6PicOverlap(obj, unit, n, [1]);
    if (cfg === 'mixed')     return _u6PicMixedSize(obj, unit,
      Array.from({length: n}, function(_, k) { return k % 2 === 0 ? 28 : 18; }));
    if (cfg === 'badStart')  return _u6PicBadStart(obj, unit, n - 1, 18);
    if (cfg === 'shortEnd')  return _u6PicShortTrain(obj, unit, n - 1, 28);
    if (cfg === 'longEnd')   return _u6PicLongTrain(obj, unit, n + 1, 28);
    return _u6Pic(obj, unit, n);
  });
  var letters = ['A', 'B', 'C', 'D'];
  var tagFor = { gap: _62GP, overlap: _62OV, mixed: _62MX, badStart: _62BS, shortEnd: _62BE, longEnd: _62BE };
  var opts = letters.map(function(L, i) {
    if (i === aIdx) return {val: 'Picture ' + L};
    // Use _62WP for the *first* distractor (broad "wrong picture" diagnosis);
    // specific defect tags for the other two so the data is still diagnostic.
    var firstDistractorIdx = (aIdx + 1) % 4;
    var tag = (i === firstDistractorIdx) ? _62WP : (tagFor[slotConfigs[i]] || _62WP);
    return {val: 'Picture ' + L, tag: tag};
  });
  // Pick the most prominent error for the intervention
  var wrongCfg = slotConfigs[(aIdx + 1) % 4];
  return {
    t: 'Which picture shows a fair measurement of the ' + _u6ObjName[obj] + '?',
    s: _u6FourMixedPic(svgs),
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' is a fair measurement: units start at the edge, are the same size, touch with no gaps, and do not overlap.',
    d: diff,
    h: 'Find the picture where the units are all correct.',
    sk: 'understand_length_units',
    i: _i62For(wrongCfg)
  };
}

// _q62Repair — show a bad picture; ask "What is wrong?". 4 long-form reasons.
function _q62Repair(picSvg, errorType, obj, unit, diff, aIdx) {
  var oname = _u6ObjName[obj];
  var um = _u6UnitMeta[unit];
  var reasons = {
    gap:      'The ' + um.plur + ' have gaps between them.',
    overlap:  'The ' + um.plur + ' overlap each other.',
    mixed:    'The ' + um.plur + ' are different sizes.',
    badStart: 'The train does not start at the edge of the ' + oname + '.',
    badEnd:   'The train does not reach the end of the ' + oname + '.'
  };
  var distractorKeys = ['gap','overlap','mixed','badStart','badEnd']
    .filter(function(k){ return k !== errorType; }).slice(0, 3);
  var opts = [
    {val: reasons[errorType]},
    {val: reasons[distractorKeys[0]], tag: _62RC},
    {val: reasons[distractorKeys[1]], tag: _62RC},
    {val: reasons[distractorKeys[2]], tag: _62RC}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. What is wrong with this measurement?',
    s: picSvg,
    o: opts, a: aIdx,
    e: 'The mistake is: ' + reasons[errorType].toLowerCase(),
    d: diff,
    h: 'Look closely at the units. Check size, spacing, and where the train begins and ends.',
    sk: 'understand_length_units',
    i: _i62For(errorType)
  };
}

// _q62MatchReason — show a bad picture; pick the type-name of the error.
// Terser than _q62Repair — taxonomic category names rather than full sentences.
function _q62MatchReason(picSvg, errorType, diff, aIdx) {
  var labels = {
    gap:      'Gaps between units',
    overlap:  'Units overlap',
    mixed:    'Different-size units',
    badStart: 'Train does not start at the edge',
    badEnd:   'Train does not reach the end'
  };
  var distractorKeys = ['gap','overlap','mixed','badStart','badEnd']
    .filter(function(k){ return k !== errorType; }).slice(0, 3);
  var opts = [
    {val: labels[errorType]},
    {val: labels[distractorKeys[0]], tag: _62RC},
    {val: labels[distractorKeys[1]], tag: _62RC},
    {val: labels[distractorKeys[2]], tag: _62RC}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'What kind of mistake is in this measurement?',
    s: picSvg,
    o: opts, a: aIdx,
    e: 'This is a "' + labels[errorType].toLowerCase() + '" mistake.',
    d: diff,
    h: 'Identify the specific type of placement error.',
    sk: 'understand_length_units',
    i: _i62For(errorType)
  };
}

// _q62WhySameSize — reasoning question about why units must be same size.
function _q62WhySameSize(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var sizes = Array.from({length: n}, function(_, k) { return k % 2 === 0 ? 28 : 18; });
  var opts = [
    {val: 'So the count is fair and we can trust the number.'},
    {val: 'So the ' + um.plur + ' look pretty.', tag: _62RC},
    {val: 'So the ' + um.plur + ' fit on the page.', tag: _62RC},
    {val: 'It does not matter — any sizes work.', tag: _62MX}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Why should all the ' + um.plur + ' be the same size when we measure?',
    s: _u6PicCompare(_u6Pic(obj, unit, n), _u6PicMixedSize(obj, unit, sizes)),
    o: opts, a: aIdx,
    e: 'Same-size units give a fair count. Different sizes make the number unreliable.',
    d: diff,
    h: 'Picture A has same-size units. Picture B has mixed sizes. Which one gives a count we can trust?',
    sk: 'understand_length_units',
    i: _i62MixedSize()
  };
}

// ── L6.2 key ideas ────────────────────────────────────────────────────────────
var _l62KeyIdeas = [
  'To measure correctly, units must touch end-to-end with no spaces in between.',
  'All the units must be the same size for the count to be fair.',
  'The unit train must start right at one end of the object.',
  'The unit train must reach all the way to the other end of the object.',
  'Gaps, overlaps, or different-size units make a measurement wrong — even if you can count units.',
  'Always check the picture first. Only count when the units are placed correctly.'
];

// ── L6.2 worked examples ──────────────────────────────────────────────────────
var _l62Examples = [
  {
    id: 'g1-u6-l2-ex-1',
    title: 'Example 1: Gaps make a measurement wrong',
    prompt: 'Picture A and Picture B both try to measure the same pencil. Which is fair?',
    visual: {type: 'rawHtml', html: _u6PicCompare(
      _u6Pic('pencil', 'cube', 5),
      _u6PicGap('pencil', 'cube', 5, [1, 3])
    )},
    steps: [
      'Picture A: the cubes touch — no spaces between them.',
      'Picture B: there are spaces between some cubes. Those are gaps.',
      'Gaps make the count wrong — the object looks longer than it really measures.',
      'Rule: Units must touch end-to-end with no gaps.'
    ],
    finalAnswer: 'Picture A is a fair measurement. Picture B is wrong because of the gaps.'
  },
  {
    id: 'g1-u6-l2-ex-2',
    title: 'Example 2: Overlapping units are not fair',
    prompt: 'Picture A and Picture B both try to measure the same crayon. Which is fair?',
    visual: {type: 'rawHtml', html: _u6PicCompare(
      _u6Pic('crayon', 'clip', 4),
      _u6PicOverlap('crayon', 'clip', 4, [1, 2])
    )},
    steps: [
      'Picture A: each paper clip starts right where the one before ends.',
      'Picture B: the paper clips overlap — they cover the same space twice.',
      'Overlapping units make the count too high for the real length.',
      'Rule: Units must touch but not overlap.'
    ],
    finalAnswer: 'Picture A is a fair measurement. Picture B is wrong because the units overlap.'
  },
  {
    id: 'g1-u6-l2-ex-3',
    title: 'Example 3: Units must all be the same size',
    prompt: 'Picture A and Picture B both try to measure the same marker. Which is fair?',
    visual: {type: 'rawHtml', html: _u6PicCompare(
      _u6Pic('marker', 'cube', 5),
      _u6PicMixedSize('marker', 'cube', [28, 18, 28, 18, 28])
    )},
    steps: [
      'Picture A: every cube is the same size.',
      'Picture B: some cubes are bigger and some are smaller.',
      'When units are different sizes, the count is not fair — you cannot trust the number.',
      'Rule: All units must be the same size.'
    ],
    finalAnswer: 'Picture A is a fair measurement. Picture B is wrong because the cubes are different sizes.'
  },
  {
    id: 'g1-u6-l2-ex-4',
    title: 'Example 4: Start at the edge of the object',
    prompt: 'Picture A and Picture B both try to measure the same book. Which is fair?',
    visual: {type: 'rawHtml', html: _u6PicCompare(
      _u6Pic('book', 'tile', 4),
      _u6PicBadStart('book', 'tile', 4, 18)
    )},
    steps: [
      'Picture A: the first tile starts right at the edge of the book.',
      'Picture B: there is a space before the first tile — the train starts past the edge.',
      'The train must start at the edge so the whole object is measured.',
      'Rule: Start at one end of the object.'
    ],
    finalAnswer: 'Picture A is a fair measurement. Picture B is wrong because the train does not start at the edge.'
  },
  {
    id: 'g1-u6-l2-ex-5',
    title: 'Example 5: The four checks',
    prompt: 'Use four checks every time you look at a measurement picture.',
    visual: {type: 'rawHtml', html: _u6Pic('pencil', 'cube', 5)},
    steps: [
      'Check 1: Does the train start at the edge of the object?',
      'Check 2: Are all the units the same size?',
      'Check 3: Do the units touch with no gaps?',
      'Check 4: Do the units NOT overlap?'
    ],
    finalAnswer: 'If all 4 checks pass, the measurement is fair. If any one fails, it is wrong.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L6.2 question banks (8 categories, 135 total)
//  C1 picks (20) + C2 gaps (18) + C3 overlaps (18) + C4 mixed (16) +
//  C5 start/end (16) + C6 why same (12) + C7 repair (20) + C8 match (15)
//  Difficulty target: 45E / 55M / 35H
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Pick the correct measurement picture (20 = 8E / 8M / 4H) ─────────────
// Each question shows 4 labeled mini-pictures: 1 fair + 3 with different defects.
var _l62C1 = [
  // Easy (8) — 1 fair + 3 obvious defects, count 3-4
  _q62PickCorrect('pencil','cube',  4, ['fair','gap','overlap','mixed'],     0, 'e'),
  _q62PickCorrect('crayon','clip',  3, ['gap','fair','overlap','mixed'],     1, 'e'),
  _q62PickCorrect('marker','cube',  5, ['gap','overlap','fair','mixed'],     2, 'e'),
  _q62PickCorrect('pen',   'clip',  4, ['gap','overlap','mixed','fair'],     3, 'e'),
  _q62PickCorrect('eraser','cube',  3, ['fair','mixed','gap','overlap'],     0, 'e'),
  _q62PickCorrect('stick', 'cube',  5, ['overlap','fair','mixed','gap'],     1, 'e'),
  _q62PickCorrect('ribbon','tile',  4, ['mixed','gap','fair','overlap'],     2, 'e'),
  _q62PickCorrect('book',  'tile',  3, ['mixed','overlap','gap','fair'],     3, 'e'),
  // Medium (8) — varied defects, count 5-6
  _q62PickCorrect('pencil','cube',  6, ['fair','badStart','shortEnd','gap'],  0, 'm'),
  _q62PickCorrect('marker','clip',  5, ['overlap','fair','mixed','badStart'], 1, 'm'),
  _q62PickCorrect('stick', 'block', 5, ['gap','shortEnd','fair','overlap'],   2, 'm'),
  _q62PickCorrect('ribbon','cube',  6, ['mixed','overlap','badStart','fair'], 3, 'm'),
  _q62PickCorrect('book',  'tile',  5, ['fair','gap','mixed','shortEnd'],     0, 'm'),
  _q62PickCorrect('crayon','clip',  6, ['shortEnd','fair','badStart','gap'],  1, 'm'),
  _q62PickCorrect('pen',   'cube',  5, ['mixed','overlap','fair','badStart'], 2, 'm'),
  _q62PickCorrect('leaf',  'cube',  5, ['gap','mixed','overlap','fair'],      3, 'm'),
  // Hard (4) — subtle distinctions, count 6-8
  _q62PickCorrect('pencil','block', 7, ['shortEnd','badStart','fair','mixed'], 2, 'h'),
  _q62PickCorrect('stick', 'tile',  7, ['fair','mixed','overlap','badStart'],  0, 'h'),
  _q62PickCorrect('ribbon','clip',  7, ['badStart','shortEnd','gap','fair'],   3, 'h'),
  _q62PickCorrect('book',  'cube',  8, ['gap','fair','mixed','shortEnd'],      1, 'h')
];

// ── C2: Gaps between units (18 = 6E / 8M / 4H) ───────────────────────────────
// Show a gappy picture; ask "Is this fair?"
var _l62C2 = [
  // Easy (6) — single gap, small count
  _q62IsFair(_u6PicGap('pencil','cube',3,  [1]),   'gap', 'e', 0),
  _q62IsFair(_u6PicGap('crayon','clip',4,  [2]),   'gap', 'e', 1),
  _q62IsFair(_u6PicGap('marker','cube',4,  [1]),   'gap', 'e', 2),
  _q62IsFair(_u6PicGap('eraser','cube',3,  [1]),   'gap', 'e', 3),
  _q62IsFair(_u6PicGap('stick', 'cube',4,  [2]),   'gap', 'e', 0),
  _q62IsFair(_u6PicGap('book',  'tile',4,  [1]),   'gap', 'e', 1),
  // Medium (8) — multiple gaps, count 4-6
  _q62IsFair(_u6PicGap('pencil','cube',5,  [1,3]), 'gap', 'm', 2),
  _q62IsFair(_u6PicGap('marker','clip',5,  [1,3]), 'gap', 'm', 3),
  _q62IsFair(_u6PicGap('ribbon','cube',6,  [2,4]), 'gap', 'm', 0),
  _q62IsFair(_u6PicGap('stick', 'block',5, [1,3]), 'gap', 'm', 1),
  _q62IsFair(_u6PicGap('pen',   'tile',5,  [2,3]), 'gap', 'm', 2),
  _q62IsFair(_u6PicGap('crayon','cube',6,  [1,4]), 'gap', 'm', 3),
  _q62IsFair(_u6PicGap('key',   'clip',4,  [1,2]), 'gap', 'm', 0),
  _q62IsFair(_u6PicGap('leaf',  'cube',5,  [2,3]), 'gap', 'm', 1),
  // Hard (4) — control: mix in fair pictures for "Is this fair? YES" answers
  _q62IsFair(_u6Pic('pencil','cube',6), null,       'h', 0),
  _q62IsFair(_u6PicGap('book','tile',6, [1,2,4]), 'gap',  'h', 2),
  _q62IsFair(_u6Pic('stick','block',5), null,       'h', 1),
  _q62IsFair(_u6PicGap('ribbon','cube',7, [1,3,5]), 'gap', 'h', 3)
];

// ── C3: Overlapping units (18 = 6E / 8M / 4H) ────────────────────────────────
var _l62C3 = [
  // Easy (6)
  _q62IsFair(_u6PicOverlap('pencil','cube',3,  [1]),   'overlap', 'e', 0),
  _q62IsFair(_u6PicOverlap('crayon','clip',4,  [2]),   'overlap', 'e', 1),
  _q62IsFair(_u6PicOverlap('marker','cube',4,  [1]),   'overlap', 'e', 2),
  _q62IsFair(_u6PicOverlap('eraser','cube',3,  [1]),   'overlap', 'e', 3),
  _q62IsFair(_u6PicOverlap('stick', 'cube',4,  [2]),   'overlap', 'e', 0),
  _q62IsFair(_u6PicOverlap('book',  'tile',4,  [1]),   'overlap', 'e', 1),
  // Medium (8)
  _q62IsFair(_u6PicOverlap('pencil','cube',5,  [1,3]), 'overlap', 'm', 2),
  _q62IsFair(_u6PicOverlap('marker','clip',5,  [1,3]), 'overlap', 'm', 3),
  _q62IsFair(_u6PicOverlap('ribbon','cube',6,  [2,4]), 'overlap', 'm', 0),
  _q62IsFair(_u6PicOverlap('stick', 'block',5, [1,3]), 'overlap', 'm', 1),
  _q62IsFair(_u6PicOverlap('pen',   'tile',5,  [2,3]), 'overlap', 'm', 2),
  _q62IsFair(_u6PicOverlap('crayon','cube',6,  [1,4]), 'overlap', 'm', 3),
  _q62IsFair(_u6PicOverlap('key',   'clip',4,  [1,2]), 'overlap', 'm', 0),
  _q62IsFair(_u6PicOverlap('leaf',  'cube',5,  [2,3]), 'overlap', 'm', 1),
  // Hard (4) — mix with fair controls
  _q62IsFair(_u6Pic('crayon','clip',6), null,            'h', 0),
  _q62IsFair(_u6PicOverlap('book','tile',6, [1,2,4]),    'overlap', 'h', 2),
  _q62IsFair(_u6Pic('marker','cube',7), null,            'h', 1),
  _q62IsFair(_u6PicOverlap('ribbon','cube',7, [1,3,5]),  'overlap', 'h', 3)
];

// ── C4: Different-size units (16 = 6E / 7M / 3H) ─────────────────────────────
var _l62C4 = [
  // Easy (6) — clear size variation
  _q62IsFair(_u6PicMixedSize('pencil','cube', [28,18,28,18]),       'mixed', 'e', 0),
  _q62IsFair(_u6PicMixedSize('crayon','cube', [18,28,18,28]),       'mixed', 'e', 1),
  _q62IsFair(_u6PicMixedSize('marker','tile', [28,18,28,18,28]),    'mixed', 'e', 2),
  _q62IsFair(_u6PicMixedSize('book',  'cube', [28,28,18,28]),       'mixed', 'e', 3),
  _q62IsFair(_u6PicMixedSize('stick', 'tile', [18,28,18,28]),       'mixed', 'e', 0),
  _q62IsFair(_u6PicMixedSize('ribbon','cube', [28,18,18,28,18]),    'mixed', 'e', 1),
  // Medium (7)
  _q62IsFair(_u6PicMixedSize('pencil','cube', [28,18,28,18,28,18]), 'mixed', 'm', 2),
  _q62IsFair(_u6PicMixedSize('marker','block',[28,18,28,18,28]),    'mixed', 'm', 3),
  _q62IsFair(_u6PicMixedSize('crayon','cube', [18,28,28,18,28]),    'mixed', 'm', 0),
  _q62IsFair(_u6PicMixedSize('pen',   'tile', [28,18,28,18]),       'mixed', 'm', 1),
  _q62IsFair(_u6PicMixedSize('eraser','cube', [28,18,28]),          'mixed', 'm', 2),
  _q62IsFair(_u6PicMixedSize('leaf',  'cube', [18,28,18,28,18]),    'mixed', 'm', 3),
  _q62IsFair(_u6PicMixedSize('book',  'tile', [28,18,28,18,28,18]), 'mixed', 'm', 0),
  // Hard (3) — mix with fair controls
  _q62IsFair(_u6Pic('pencil','cube',5),                              null,    'h', 1),
  _q62IsFair(_u6PicMixedSize('stick','cube', [28,18,28,18,28,18,28]),'mixed', 'h', 2),
  _q62IsFair(_u6Pic('marker','tile',5),                              null,    'h', 3)
];

// ── C5: Start / end alignment (16 = 6E / 7M / 3H) ────────────────────────────
// Mix of "Pick correct from 4" (start/end variations) and "Is this fair?" (single picture).
var _l62C5 = [
  // Easy (6) — single-picture Yes/No about start/end
  _q62IsFair(_u6PicBadStart('pencil','cube',4, 18),  'badStart', 'e', 0),
  _q62IsFair(_u6PicBadStart('crayon','clip',3, 16),  'badStart', 'e', 1),
  _q62IsFair(_u6PicShortTrain('marker','cube',4, 24),'badEnd',   'e', 2),
  _q62IsFair(_u6PicShortTrain('stick','tile',4, 24), 'badEnd',   'e', 3),
  _q62IsFair(_u6PicBadStart('book','tile',4, 20),    'badStart', 'e', 0),
  _q62IsFair(_u6PicShortTrain('ribbon','cube',4, 28),'badEnd',   'e', 1),
  // Medium (7) — Pick-correct from 4 with start/end defects
  _q62PickCorrect('pencil','cube',  5, ['fair','badStart','shortEnd','longEnd'], 0, 'm'),
  _q62PickCorrect('marker','cube',  5, ['badStart','fair','shortEnd','longEnd'], 1, 'm'),
  _q62PickCorrect('stick', 'tile',  4, ['shortEnd','longEnd','fair','badStart'], 2, 'm'),
  _q62PickCorrect('ribbon','block', 5, ['longEnd','shortEnd','badStart','fair'], 3, 'm'),
  _q62IsFair(_u6PicBadStart('crayon','cube',5, 22),  'badStart', 'm', 0),
  _q62IsFair(_u6PicShortTrain('pen','clip',5, 30),   'badEnd',   'm', 1),
  _q62IsFair(_u6Pic('book','tile',5),                 null,       'm', 2),
  // Hard (3)
  _q62PickCorrect('pencil','cube',  6, ['shortEnd','longEnd','fair','badStart'], 2, 'h'),
  _q62IsFair(_u6PicShortTrain('stick','block',6, 32),'badEnd',   'h', 0),
  _q62IsFair(_u6PicBadStart('marker','clip',7, 28),  'badStart', 'h', 3)
];

// ── C6: Why same-size units (12 = 4E / 5M / 3H) ──────────────────────────────
var _l62C6 = [
  // Easy (4)
  _q62WhySameSize('pencil','cube', 4, 'e', 0),
  _q62WhySameSize('crayon','cube', 4, 'e', 1),
  _q62WhySameSize('marker','tile', 5, 'e', 2),
  _q62WhySameSize('stick', 'cube', 4, 'e', 3),
  // Medium (5)
  _q62WhySameSize('book',  'tile', 5, 'm', 0),
  _q62WhySameSize('ribbon','cube', 5, 'm', 1),
  _q62WhySameSize('pen',   'block',4, 'm', 2),
  _q62WhySameSize('eraser','cube', 3, 'm', 3),
  _q62WhySameSize('leaf',  'cube', 5, 'm', 0),
  // Hard (3)
  _q62WhySameSize('pencil','cube', 6, 'h', 1),
  _q62WhySameSize('stick', 'tile', 6, 'h', 2),
  _q62WhySameSize('ribbon','cube', 7, 'h', 3)
];

// ── C7: Error repair — "What is wrong with this measurement?" (20 = 5E / 8M / 7H) ──
var _l62C7 = [
  // Easy (5)
  _q62Repair(_u6PicGap('pencil','cube',4, [1]),     'gap',      'pencil','cube', 'e', 0),
  _q62Repair(_u6PicOverlap('crayon','clip',4,[1]),  'overlap',  'crayon','clip', 'e', 1),
  _q62Repair(_u6PicMixedSize('marker','cube',[28,18,28,18]), 'mixed', 'marker','cube', 'e', 2),
  _q62Repair(_u6PicBadStart('book','tile',4, 18),   'badStart', 'book',  'tile', 'e', 3),
  _q62Repair(_u6PicShortTrain('stick','block',4, 28),'badEnd',  'stick', 'block','e', 0),
  // Medium (8)
  _q62Repair(_u6PicGap('ribbon','cube',5, [1,3]),   'gap',      'ribbon','cube', 'm', 1),
  _q62Repair(_u6PicOverlap('pen','clip',5, [1,3]),  'overlap',  'pen',   'clip', 'm', 2),
  _q62Repair(_u6PicMixedSize('eraser','cube',[18,28,18,28]), 'mixed', 'eraser','cube', 'm', 3),
  _q62Repair(_u6PicBadStart('leaf','cube',5, 18),   'badStart', 'leaf',  'cube', 'm', 0),
  _q62Repair(_u6PicShortTrain('marker','tile',5, 32),'badEnd',  'marker','tile', 'm', 1),
  _q62Repair(_u6PicGap('pencil','clip',5, [1,3]),   'gap',      'pencil','clip', 'm', 2),
  _q62Repair(_u6PicOverlap('book','cube',5, [2]),   'overlap',  'book',  'cube', 'm', 3),
  _q62Repair(_u6PicMixedSize('crayon','tile',[28,18,28,18,28]),'mixed','crayon','tile','m', 0),
  // Hard (7) — longer trains, subtler distinctions
  _q62Repair(_u6PicGap('stick','cube',6, [1,3,5]),  'gap',      'stick', 'cube', 'h', 1),
  _q62Repair(_u6PicOverlap('ribbon','block',6, [1,3,5]),'overlap','ribbon','block','h',2),
  _q62Repair(_u6PicMixedSize('pencil','cube',[28,18,28,18,28,18]),'mixed','pencil','cube','h',3),
  _q62Repair(_u6PicBadStart('book','tile',6, 24),   'badStart', 'book',  'tile', 'h', 0),
  _q62Repair(_u6PicShortTrain('pen','clip',6, 36),  'badEnd',   'pen',   'clip', 'h', 1),
  _q62Repair(_u6PicGap('marker','tile',7, [2,4,6]), 'gap',      'marker','tile', 'h', 2),
  _q62Repair(_u6PicMixedSize('key','cube',[18,28,18,28]), 'mixed', 'key','cube', 'h', 3)
];

// ── C8: Match the reason — pick taxonomic error name (15 = 4E / 4M / 7H) ─────
var _l62C8 = [
  // Easy (4)
  _q62MatchReason(_u6PicGap('pencil','cube',4, [1]),     'gap',      'e', 0),
  _q62MatchReason(_u6PicOverlap('crayon','clip',4,[2]),  'overlap',  'e', 1),
  _q62MatchReason(_u6PicMixedSize('marker','cube',[28,18,28,18]),'mixed','e',2),
  _q62MatchReason(_u6PicBadStart('book','tile',4, 18),   'badStart', 'e', 3),
  // Medium (4)
  _q62MatchReason(_u6PicShortTrain('stick','block',4,28),'badEnd',   'm', 0),
  _q62MatchReason(_u6PicGap('ribbon','cube',5,[1,3]),    'gap',      'm', 1),
  _q62MatchReason(_u6PicOverlap('pen','clip',5,[1,3]),   'overlap',  'm', 2),
  _q62MatchReason(_u6PicMixedSize('crayon','tile',[28,18,28,18]),'mixed','m',3),
  // Hard (7)
  _q62MatchReason(_u6PicBadStart('leaf','cube',5,22),    'badStart', 'h', 0),
  _q62MatchReason(_u6PicShortTrain('marker','tile',5,30),'badEnd',   'h', 1),
  _q62MatchReason(_u6PicGap('book','cube',6,[1,3,4]),    'gap',      'h', 2),
  _q62MatchReason(_u6PicOverlap('stick','clip',6,[1,3]), 'overlap',  'h', 3),
  _q62MatchReason(_u6PicMixedSize('pencil','cube',[28,18,28,18,28,18,28]),'mixed','h',0),
  _q62MatchReason(_u6PicBadStart('ribbon','tile',7,28),  'badStart', 'h', 1),
  _q62MatchReason(_u6PicShortTrain('marker','cube',7,32),'badEnd',   'h', 2)
];

// ── L6.2 combined bank ───────────────────────────────────────────────────────
var _l62Bank = [].concat(_l62C1, _l62C2, _l62C3, _l62C4, _l62C5, _l62C6, _l62C7, _l62C8);


// ════════════════════════════════════════════════════════════════════════════
//  L6.3 — Comparing Measurements
//  TEKS 1.7C | 135 questions (45E / 55M / 35H)
//  Scope: same object measured with two different-size units; both fair.
//  No fraction/ratio language in student-facing strings (no "half", "twice",
//  "1:2") — use only "bigger", "smaller", "more", "fewer".
// ════════════════════════════════════════════════════════════════════════════

// ── L6.3 error tags ──────────────────────────────────────────────────────────
var _63BF = 'err_bigger_unit_fewer_count';
var _63SM = 'err_smaller_unit_more_count';
var _63TW = 'err_thinks_different_counts_wrong';
var _63CN = 'err_compares_numbers_only';
var _63US = 'err_unit_size_confusion';
var _63SO = 'err_same_object_confusion';
var _63PD = 'err_prediction_direction_confusion';
var _63EX = 'err_explanation_confusion';

// ── L6.3 SVG helpers: small (half-width) unit drawers ────────────────────────
// Each small unit is 14px wide (half of standard 28px). Bottom-aligned with
// the standard train baseline so big and small units rest on the same floor.
function _u6SmallCube(x, y) {
  return '<rect x="' + (x + 1) + '" y="' + (y + 15) + '" width="12" height="12" rx="2" ' +
    'fill="#BBDEFB" stroke="#1976D2" stroke-width="2"/>';
}
function _u6SmallClip(x, y) {
  return '<g stroke="#37474F" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="' + (x + 2)  + '" y="' + (y + 14) + '" width="10" height="14" rx="4" ry="4"/>' +
    '<rect x="' + (x + 4)  + '" y="' + (y + 10) + '" width="6"  height="14" rx="2" ry="2"/>' +
    '</g>';
}
function _u6SmallTile(x, y) {
  return '<rect x="' + (x + 1) + '" y="' + (y + 14) + '" width="12" height="10" rx="2" ' +
    'fill="#D7CCC8" stroke="#6D4C41" stroke-width="2"/>';
}
function _u6SmallBlock(x, y) {
  return '<rect x="' + (x + 1) + '" y="' + (y - 2) + '" width="12" height="32" rx="3" ' +
    'fill="#FFCCBC" stroke="#E64A19" stroke-width="2"/>';
}
var _u6SmallUnitDrawers = {
  cube: _u6SmallCube, clip: _u6SmallClip, tile: _u6SmallTile, block: _u6SmallBlock
};

// _u6SmallTrain(unit, n) — row of n small units, 14px wide each, starting x=8.
function _u6SmallTrain(unit, n) {
  var draw = _u6SmallUnitDrawers[unit];
  var s = '';
  for (var i = 0; i < n; i++) s += draw(8 + i * 14, 38);
  return s;
}

// _u6SmallPic(obj, unit, smallN) — object + small-unit train; canvas matches
// what _u6Pic would produce for bigN = smallN/2 (so widths align).
function _u6SmallPic(obj, unit, smallN) {
  var objW = smallN * 14;
  var canvasW = objW + 16;
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, objW) + _u6SmallTrain(unit, smallN) + '</svg>';
}

// ── L6.3 SVG helpers: composite "same object, two unit sizes" ────────────────
// _u6TwoSizeMeasure shows the SAME object measured two ways: top row uses big
// units (28px); bottom row uses small units (14px). bigN big units = 2*bigN
// small units; both rows span the identical object length.
function _u6TwoSizeMeasure(obj, unit, bigN) {
  var smallN = bigN * 2;
  var um = _u6UnitMeta[unit];
  var topSvg = _u6Pic(obj, unit, bigN);
  var bottomSvg = _u6SmallPic(obj, unit, smallN);
  return '<div style="display:flex;flex-direction:column;gap:8px;padding:4px">' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:13px;color:#5a7080;margin-bottom:4px;font-weight:700">Big ' + um.plur + ': ' + bigN + '</div>' +
    topSvg + '</div>' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:13px;color:#5a7080;margin-bottom:4px;font-weight:700">Small ' + um.plur + ': ' + smallN + '</div>' +
    bottomSvg + '</div>' +
    '</div>';
}

// _u6TwoSizeMeasureAB — same visual but with A/B labels (for C6 questions
// where the student must DEDUCE which has bigger units from the counts).
function _u6TwoSizeMeasureAB(obj, unit, bigN, swap) {
  var smallN = bigN * 2;
  var topSvg = _u6Pic(obj, unit, bigN);
  var bottomSvg = _u6SmallPic(obj, unit, smallN);
  // If swap is true, put the small train on top (Picture A = small, B = big)
  var aSvg = swap ? bottomSvg : topSvg;
  var bSvg = swap ? topSvg : bottomSvg;
  var aCount = swap ? smallN : bigN;
  var bCount = swap ? bigN : smallN;
  return '<div style="display:flex;flex-direction:column;gap:8px;padding:4px">' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:15px;color:#333;margin-bottom:4px;font-weight:800">A — ' + aCount + ' units</div>' +
    aSvg + '</div>' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:15px;color:#333;margin-bottom:4px;font-weight:800">B — ' + bCount + ' units</div>' +
    bSvg + '</div>' +
    '</div>';
}

// _u6UnitSizePair — inset showing one big unit and one small unit side-by-side
// with "Big" / "Small" labels. Used by C2/C3 (unit-only choice questions).
function _u6UnitSizePair(unit) {
  var bigSvg = _u6UnitDrawers[unit](8, 38);
  var smallSvg = _u6SmallUnitDrawers[unit](56, 38);
  return '<svg viewBox="0 0 84 78" width="100%" style="max-width:240px;display:block;margin:0 auto">' +
    bigSvg + smallSvg +
    '<text x="22" y="74" font-size="11" font-weight="700" fill="#37474F" text-anchor="middle" font-family="Nunito,sans-serif">Big</text>' +
    '<text x="63" y="74" font-size="11" font-weight="700" fill="#37474F" text-anchor="middle" font-family="Nunito,sans-serif">Small</text>' +
    '</svg>';
}

// _u6PredictPic — original measurement on top + instruction strip about which
// kind of unit to switch to. Used by C8 (predict count direction).
function _u6PredictPic(obj, unit, bigN, switchTo) {
  var um = _u6UnitMeta[unit];
  var origLabel = switchTo === 'smaller'
    ? 'Now switch to <b>SMALLER</b> ' + um.plur + '. Will the count go UP or DOWN?'
    : 'Now switch to <b>BIGGER</b> ' + um.plur + '. Will the count go UP or DOWN?';
  return '<div style="padding:4px">' +
    '<div style="text-align:center;padding:6px;border:2px solid #B0BEC5;border-radius:6px;background:#fff">' +
    '<div style="font-size:13px;color:#5a7080;margin-bottom:4px;font-weight:700">' + bigN + ' ' + um.plur + ' long</div>' +
    _u6Pic(obj, unit, bigN) + '</div>' +
    '<div style="text-align:center;font-size:13px;color:#37474F;margin-top:8px;padding:6px;background:#FFF8E1;border-radius:6px;line-height:1.4">' +
    origLabel + '</div>' +
    '</div>';
}

// ── L6.3 teaching visuals (for intervention overlays) ────────────────────────
function _u6TvBiggerFewer() {
  return _u6TvWrap(_u6TwoSizeMeasure('pencil', 'cube', 3),
    'Top: 3 big cubes. Bottom: 6 small cubes. Bigger units, fewer needed.');
}
function _u6TvSmallerMore() {
  return _u6TvWrap(_u6TwoSizeMeasure('ribbon', 'cube', 4),
    'Top: 4 big cubes. Bottom: 8 small cubes. Smaller units, more needed.');
}
function _u6TvBothCorrect() {
  return _u6TvWrap(_u6TwoSizeMeasure('marker', 'tile', 3),
    'Same marker, different units. Both counts are correct.');
}
function _u6TvLookAtUnits() {
  return _u6TvWrap(_u6TwoSizeMeasure('stick', 'block', 4),
    'A bigger count means the units are smaller — not that the object is bigger.');
}
function _u6TvSameObj() {
  return _u6TvWrap(_u6TwoSizeMeasure('book', 'tile', 3),
    'The book is the same in both rows. Only the units changed.');
}
function _u6TvInverse() {
  return _u6TvWrap(_u6TwoSizeMeasure('crayon', 'cube', 3),
    'Bigger units → fewer count. Smaller units → more count.');
}
function _u6TvPredict() {
  return _u6TvWrap(_u6UnitSizePair('cube'),
    'If the new unit is bigger, count goes DOWN. If smaller, count goes UP.');
}

// ── L6.3 intervention factories ──────────────────────────────────────────────
function _i63BF() { return {
  errorTag: _63BF, title: 'Bigger units, fewer of them',
  teachingSteps: [
    'A bigger unit covers more space.',
    'So you only need a few of them to cover the object.',
    'With bigger units, the count goes DOWN.',
    'Look at the unit size first, then look at the count.'
  ],
  teachingVisualRaw: _u6TvBiggerFewer(),
  correctAnswerExplanation: 'Bigger units cover more space, so fewer are needed to measure the same object.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i63SM() { return {
  errorTag: _63SM, title: 'Smaller units, more of them',
  teachingSteps: [
    'A smaller unit covers less space.',
    'So you need more of them to cover the object.',
    'With smaller units, the count goes UP.',
    'Look at the unit size first, then look at the count.'
  ],
  teachingVisualRaw: _u6TvSmallerMore(),
  correctAnswerExplanation: 'Smaller units cover less space, so more are needed to measure the same object.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i63Both() { return {
  errorTag: _63TW, title: 'Both can be correct',
  teachingSteps: [
    'Look at the object — it is the same in both rows.',
    'Both measurements are fair: same-size units in each row, no gaps, no overlaps.',
    'The unit sizes are different, so the counts are different.',
    'Both numbers are correct for what they measure.'
  ],
  teachingVisualRaw: _u6TvBothCorrect(),
  correctAnswerExplanation: 'Different counts can both be correct when the units are different sizes.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i63Units() { return {
  errorTag: _63CN, title: 'Compare the units, not just the numbers',
  teachingSteps: [
    'A bigger count does NOT mean the object is bigger.',
    'It means the units are smaller.',
    'A smaller count does NOT mean the object is smaller.',
    'It means the units are bigger.'
  ],
  teachingVisualRaw: _u6TvLookAtUnits(),
  correctAnswerExplanation: 'Compare the unit sizes too — not just the numbers.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i63SameObj() { return {
  errorTag: _63SO, title: 'Same object — different units',
  teachingSteps: [
    'Look closely: the object is the same in both pictures.',
    'Only the units changed — bigger in one row, smaller in the other.',
    'The object did not grow or shrink.',
    'Different units give different counts for the same object.'
  ],
  teachingVisualRaw: _u6TvSameObj(),
  correctAnswerExplanation: 'The object stays the same. Different units cause different counts.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i63Inverse() { return {
  errorTag: _63US, title: 'Bigger count means smaller units',
  teachingSteps: [
    'Two measurements of the same object.',
    'The picture with MORE units is using SMALLER units.',
    'The picture with FEWER units is using BIGGER units.',
    'You can tell the unit size from the count.'
  ],
  teachingVisualRaw: _u6TvInverse(),
  correctAnswerExplanation: 'For the same object, a bigger count means smaller units; a smaller count means bigger units.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}
function _i63Predict() { return {
  errorTag: _63PD, title: 'Predict the count direction',
  teachingSteps: [
    'Decide if the new unit is BIGGER or SMALLER than the old one.',
    'Bigger unit → count goes DOWN (fewer needed).',
    'Smaller unit → count goes UP (more needed).',
    'Match the unit size change to the count direction.'
  ],
  teachingVisualRaw: _u6TvPredict(),
  correctAnswerExplanation: 'Bigger new units make the count smaller. Smaller new units make the count bigger.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// Maps L6.3 error type to intervention factory.
function _i63For(errorType) {
  if (errorType === 'BF')       return _i63BF();
  if (errorType === 'SM')       return _i63SM();
  if (errorType === 'TW')       return _i63Both();
  if (errorType === 'CN')       return _i63Units();
  if (errorType === 'SO')       return _i63SameObj();
  if (errorType === 'US')       return _i63Inverse();
  if (errorType === 'PD')       return _i63Predict();
  return _i63Both();
}

// ── L6.3 question factory functions ──────────────────────────────────────────

// _q63WhyDiffer — C1: show 2-row picture; ask why the counts differ.
function _q63WhyDiffer(obj, unit, bigN, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var smallN = bigN * 2;
  var opts = [
    {val: 'The bottom row uses smaller ' + um.plur + ', so more of them are needed.'},
    {val: 'The bottom measurement is wrong.', tag: _63TW},
    {val: 'The objects are different lengths.', tag: _63SO},
    {val: 'The bottom row counted some ' + um.plur + ' two times.', tag: _63EX}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'The same ' + oname + ' was measured two ways. Why are the counts different?',
    s: _u6TwoSizeMeasure(obj, unit, bigN),
    o: opts, a: aIdx,
    e: 'The bottom ' + um.plur + ' are smaller, so more are needed to cover the same ' + oname + '. Both counts are correct.',
    d: diff,
    h: 'The ' + oname + ' is the same in both rows. Look at the unit sizes.',
    sk: 'compare_measurements',
    i: _i63SM()
  };
}

// _q63BiggerFewer — C2: pick which unit needs FEWER to measure.
function _q63BiggerFewer(unit, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var opts = [
    {val: 'The bigger ' + um.sing },
    {val: 'The smaller ' + um.sing,        tag: _63BF},
    {val: 'They need the same number',     tag: _63US},
    {val: 'It depends on the object',      tag: _63CN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the two ' + um.plur + '. Which one would need FEWER to measure the same object?',
    s: _u6UnitSizePair(unit),
    o: opts, a: aIdx,
    e: 'A bigger ' + um.sing + ' covers more space, so fewer are needed.',
    d: diff,
    h: 'A bigger unit covers more space.',
    sk: 'compare_measurements',
    i: _i63BF()
  };
}

// _q63SmallerMore — C3: pick which unit needs MORE to measure.
function _q63SmallerMore(unit, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var opts = [
    {val: 'The smaller ' + um.sing },
    {val: 'The bigger ' + um.sing,         tag: _63SM},
    {val: 'They need the same number',     tag: _63US},
    {val: 'It depends on the object',      tag: _63CN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the two ' + um.plur + '. Which one would need MORE to measure the same object?',
    s: _u6UnitSizePair(unit),
    o: opts, a: aIdx,
    e: 'A smaller ' + um.sing + ' covers less space, so more are needed.',
    d: diff,
    h: 'A smaller unit covers less space.',
    sk: 'compare_measurements',
    i: _i63SM()
  };
}

// _q63MatchExpl — C4: match the explanation sentence to the 2-row picture.
function _q63MatchExpl(obj, unit, bigN, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var smallN = bigN * 2;
  var opts = [
    {val: 'The bigger ' + um.plur + ' cover more space, so fewer are needed.'},
    {val: 'The smaller ' + um.plur + ' are wrong because there are more of them.', tag: _63TW},
    {val: 'The bigger ' + um.plur + ' should always be used to measure.',          tag: _63CN},
    {val: 'The ' + oname + ' must be different lengths in the two pictures.',      tag: _63SO}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'The same ' + oname + ' is measured with big ' + um.plur + ' and small ' + um.plur + '. Which sentence explains the picture?',
    s: _u6TwoSizeMeasure(obj, unit, bigN),
    o: opts, a: aIdx,
    e: 'Bigger ' + um.plur + ' cover more space, so the top row needs fewer of them. Both counts are correct.',
    d: diff,
    h: 'Think about how big each unit is.',
    sk: 'compare_measurements',
    i: _i63BF()
  };
}

// _q63TrueStatement — C5: choose the TRUE sentence about two measurements.
function _q63TrueStatement(obj, unit, bigN, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var opts = [
    {val: 'Both measurements can be correct because the units are different sizes.'},
    {val: 'The first measurement is wrong because there are fewer ' + um.plur + '.', tag: _63TW},
    {val: 'The bigger count is always more accurate.',                                tag: _63CN},
    {val: 'One of them must be wrong.',                                               tag: _63TW}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Which sentence about the two measurements is true?',
    s: _u6TwoSizeMeasure(obj, unit, bigN),
    o: opts, a: aIdx,
    e: 'Both measurements are correct. Each row uses same-size units, and the two unit sizes are different.',
    d: diff,
    h: 'Both rows are fair on their own.',
    sk: 'compare_measurements',
    i: _i63Both()
  };
}

// _q63DeduceSize — C6: given two counts of the same object, deduce which has
// bigger units.
function _q63DeduceSize(obj, unit, bigN, swap, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var smallN = bigN * 2;
  var aCount = swap ? smallN : bigN;
  var bCount = swap ? bigN : smallN;
  // The picture with FEWER units has BIGGER units
  var correctLetter = (aCount < bCount) ? 'A' : 'B';
  var wrongLetter = (aCount < bCount) ? 'B' : 'A';
  var opts = [
    {val: 'Picture ' + correctLetter + ' — fewer ' + um.plur + ' means bigger ' + um.plur + '.'},
    {val: 'Picture ' + wrongLetter + ' — more ' + um.plur + ' means bigger ' + um.plur + '.', tag: _63US},
    {val: 'They use the same ' + um.plur + '.',                                                tag: _63US},
    {val: 'We cannot tell from this picture.',                                                 tag: _63CN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Both pictures show the same object measured with different ' + um.plur + '. Which picture uses BIGGER ' + um.plur + '?',
    s: _u6TwoSizeMeasureAB(obj, unit, bigN, swap),
    o: opts, a: aIdx,
    e: 'The picture with FEWER ' + um.plur + ' uses BIGGER ' + um.plur + ' (fewer needed to cover the object).',
    d: diff,
    h: 'Fewer units = bigger units.',
    sk: 'compare_measurements',
    i: _i63Inverse()
  };
}

// _q63ErrorRepair — C7: someone says one measurement must be wrong.
function _q63ErrorRepair(obj, unit, bigN, person, otherPerson, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var smallN = bigN * 2;
  var opts = [
    {val: 'Both can be right when the units are different sizes.'},
    {val: 'The bigger number is always wrong.',  tag: _63CN},
    {val: 'The smaller number is always wrong.', tag: _63CN},
    {val: 'They should count again.',            tag: _63TW}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: person + ' measured a ' + oname + ' with big ' + um.plur + ' and got ' + bigN + '. ' +
       otherPerson + ' measured the same ' + oname + ' with small ' + um.plur + ' and got ' + smallN + '. ' +
       person + ' says ' + otherPerson + ' must be wrong. What should we tell ' + person + '?',
    s: _u6TwoSizeMeasure(obj, unit, bigN),
    o: opts, a: aIdx,
    e: 'Both can be right. ' + otherPerson + ' used smaller ' + um.plur + ', so more were needed. The ' + oname + ' is the same in both.',
    d: diff,
    h: 'Look at the unit sizes, not just the counts.',
    sk: 'compare_measurements',
    i: _i63Both()
  };
}

// _q63Predict — C8: predict whether count goes UP or DOWN with new unit size.
function _q63Predict(obj, unit, bigN, switchTo, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  // switchTo: 'smaller' → count goes UP; 'bigger' → count goes DOWN
  var correctText, wrongText;
  if (switchTo === 'smaller') {
    correctText = 'UP — you need more ' + um.plur + ' because they are smaller.';
    wrongText   = 'DOWN — you need fewer ' + um.plur + ' because they are smaller.';
  } else {
    correctText = 'DOWN — you need fewer ' + um.plur + ' because they are bigger.';
    wrongText   = 'UP — you need more ' + um.plur + ' because they are bigger.';
  }
  var opts = [
    {val: correctText},
    {val: wrongText,                                                           tag: _63PD},
    {val: 'The count stays the same.',                                         tag: _63US},
    {val: 'It depends on the object.',                                         tag: _63CN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'A ' + _u6ObjName[obj] + ' is ' + bigN + ' big ' + um.plur + ' long. If you measure it with ' +
       (switchTo === 'smaller' ? 'SMALLER' : 'BIGGER') + ' ' + um.plur + ', will the count go UP or DOWN?',
    s: _u6PredictPic(obj, unit, bigN, switchTo),
    o: opts, a: aIdx,
    e: switchTo === 'smaller'
       ? 'Smaller ' + um.plur + ' cover less space, so you need more of them — the count goes UP.'
       : 'Bigger ' + um.plur + ' cover more space, so you need fewer of them — the count goes DOWN.',
    d: diff,
    h: 'Smaller units → more needed. Bigger units → fewer needed.',
    sk: 'compare_measurements',
    i: _i63Predict()
  };
}

// ── L6.3 key ideas ────────────────────────────────────────────────────────────
var _l63KeyIdeas = [
  'The same object can be measured two ways — each row uses its own same-size units.',
  'Bigger units cover more space, so fewer of them are needed.',
  'Smaller units cover less space, so more of them are needed.',
  'Both counts are correct when each measurement is fair on its own.',
  'To compare two measurements, look at the units — not just the numbers.',
  'If the count is bigger, the units are smaller. If the count is smaller, the units are bigger.'
];

// ── L6.3 worked examples ──────────────────────────────────────────────────────
var _l63Examples = [
  {
    id: 'g1-u6-l3-ex-1',
    title: 'Example 1: Same ribbon, big blocks vs small blocks',
    prompt: 'A ribbon is measured with big blocks AND with small blocks. Why are the counts different?',
    visual: {type: 'rawHtml', html: _u6TwoSizeMeasure('ribbon', 'block', 4)},
    steps: [
      'The ribbon is the same in both pictures — same length.',
      'Top row: 4 big blocks fit along the ribbon.',
      'Bottom row: 8 small blocks fit along the same ribbon.',
      'The small blocks are smaller, so more of them are needed.'
    ],
    finalAnswer: 'Both counts are correct. Smaller units cover less space, so more are needed.'
  },
  {
    id: 'g1-u6-l3-ex-2',
    title: 'Example 2: Bigger unit, fewer needed',
    prompt: 'How does the unit size change the count?',
    visual: {type: 'rawHtml', html: _u6TwoSizeMeasure('pencil', 'cube', 3)},
    steps: [
      'Look at the pencil — it is the same in both rows.',
      'Top row uses big cubes: 3 of them fit.',
      'Bottom row uses small cubes: 6 of them fit.',
      'Bigger cubes cover more space, so fewer are needed.'
    ],
    finalAnswer: 'Bigger units, fewer needed. The pencil did not change — only the unit size did.'
  },
  {
    id: 'g1-u6-l3-ex-3',
    title: 'Example 3: Smaller unit, more needed',
    prompt: 'Why does the count go up when the units get smaller?',
    visual: {type: 'rawHtml', html: _u6TwoSizeMeasure('book', 'tile', 3)},
    steps: [
      'The book is the same in both rows.',
      'Top row: 3 big tiles fit along the book.',
      'Bottom row: 6 small tiles fit along the same book.',
      'Smaller tiles cover less space — more are needed.'
    ],
    finalAnswer: 'Smaller units, more needed. Both measurements of the book are correct.'
  },
  {
    id: 'g1-u6-l3-ex-4',
    title: 'Example 4: Both measurements can be correct',
    prompt: 'A marker was measured by Maya and by Sam. They got different counts. Who is right?',
    visual: {type: 'rawHtml', html: _u6TwoSizeMeasure('marker', 'cube', 4)},
    steps: [
      'Maya used big cubes and counted 4.',
      'Sam used small cubes and counted 8.',
      'Each measurement is fair on its own — same-size units in each row.',
      'The unit sizes are different, so the counts are different.'
    ],
    finalAnswer: 'Both Maya and Sam are correct. Different unit sizes give different counts for the same object.'
  },
  {
    id: 'g1-u6-l3-ex-5',
    title: 'Example 5: Use the count to find the unit size',
    prompt: 'Two measurements of the same stick — A has fewer units, B has more. Which uses bigger units?',
    visual: {type: 'rawHtml', html: _u6TwoSizeMeasureAB('stick', 'block', 4, false)},
    steps: [
      'Both pictures show the same stick.',
      'Picture A has fewer units; Picture B has more.',
      'For the same object, fewer units means each unit is bigger.',
      'So Picture A uses bigger units, and Picture B uses smaller units.'
    ],
    finalAnswer: 'Picture A uses bigger units (fewer needed). Picture B uses smaller units (more needed).'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L6.3 question banks (8 categories, 135 total)
//  Target: 45E / 55M / 35H
//  Per-category: 18 + 16 + 16 + 16 + 16 + 16 + 18 + 19 = 135
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Same object, large vs small — why differ? (18 = 6E / 8M / 4H) ────────
var _l63C1 = [
  // Easy (6)
  _q63WhyDiffer('pencil','cube', 3, 'e', 0),
  _q63WhyDiffer('crayon','clip', 3, 'e', 1),
  _q63WhyDiffer('marker','tile', 4, 'e', 2),
  _q63WhyDiffer('stick', 'block',3, 'e', 3),
  _q63WhyDiffer('ribbon','cube', 4, 'e', 0),
  _q63WhyDiffer('book',  'tile', 3, 'e', 1),
  // Medium (8)
  _q63WhyDiffer('pencil','cube', 4, 'm', 2),
  _q63WhyDiffer('marker','clip', 5, 'm', 3),
  _q63WhyDiffer('ribbon','block',4, 'm', 0),
  _q63WhyDiffer('book',  'cube', 5, 'm', 1),
  _q63WhyDiffer('stick', 'tile', 5, 'm', 2),
  _q63WhyDiffer('crayon','block',4, 'm', 3),
  _q63WhyDiffer('pen',   'clip', 5, 'm', 0),
  _q63WhyDiffer('leaf',  'cube', 4, 'm', 1),
  // Hard (4)
  _q63WhyDiffer('pencil','tile', 6, 'h', 2),
  _q63WhyDiffer('book',  'block',5, 'h', 3),
  _q63WhyDiffer('stick', 'cube', 6, 'h', 0),
  _q63WhyDiffer('ribbon','clip', 6, 'h', 1)
];

// ── C2: Bigger unit → fewer count (16 = 6E / 6M / 4H) ────────────────────────
var _l63C2 = [
  _q63BiggerFewer('cube',  'e', 0), _q63BiggerFewer('clip',  'e', 1),
  _q63BiggerFewer('tile',  'e', 2), _q63BiggerFewer('block', 'e', 3),
  _q63BiggerFewer('cube',  'e', 1), _q63BiggerFewer('clip',  'e', 2),
  _q63BiggerFewer('tile',  'm', 3), _q63BiggerFewer('block', 'm', 0),
  _q63BiggerFewer('cube',  'm', 2), _q63BiggerFewer('clip',  'm', 3),
  _q63BiggerFewer('tile',  'm', 0), _q63BiggerFewer('block', 'm', 1),
  _q63BiggerFewer('cube',  'h', 3), _q63BiggerFewer('clip',  'h', 0),
  _q63BiggerFewer('tile',  'h', 1), _q63BiggerFewer('block', 'h', 2)
];

// ── C3: Smaller unit → more count (16 = 6E / 6M / 4H) ────────────────────────
var _l63C3 = [
  _q63SmallerMore('cube',  'e', 0), _q63SmallerMore('clip',  'e', 1),
  _q63SmallerMore('tile',  'e', 2), _q63SmallerMore('block', 'e', 3),
  _q63SmallerMore('cube',  'e', 1), _q63SmallerMore('clip',  'e', 2),
  _q63SmallerMore('tile',  'm', 3), _q63SmallerMore('block', 'm', 0),
  _q63SmallerMore('cube',  'm', 2), _q63SmallerMore('clip',  'm', 3),
  _q63SmallerMore('tile',  'm', 0), _q63SmallerMore('block', 'm', 1),
  _q63SmallerMore('cube',  'h', 3), _q63SmallerMore('clip',  'h', 0),
  _q63SmallerMore('tile',  'h', 1), _q63SmallerMore('block', 'h', 2)
];

// ── C4: Match explanation to picture (16 = 5E / 7M / 4H) ─────────────────────
var _l63C4 = [
  // Easy (5)
  _q63MatchExpl('pencil','cube', 3, 'e', 0),
  _q63MatchExpl('crayon','tile', 3, 'e', 1),
  _q63MatchExpl('marker','clip', 4, 'e', 2),
  _q63MatchExpl('stick', 'block',3, 'e', 3),
  _q63MatchExpl('book',  'cube', 4, 'e', 0),
  // Medium (7)
  _q63MatchExpl('ribbon','tile', 4, 'm', 1),
  _q63MatchExpl('pencil','block',4, 'm', 2),
  _q63MatchExpl('pen',   'cube', 5, 'm', 3),
  _q63MatchExpl('crayon','clip', 5, 'm', 0),
  _q63MatchExpl('marker','tile', 5, 'm', 1),
  _q63MatchExpl('leaf',  'cube', 4, 'm', 2),
  _q63MatchExpl('book',  'block',4, 'm', 3),
  // Hard (4)
  _q63MatchExpl('stick', 'clip', 6, 'h', 0),
  _q63MatchExpl('ribbon','cube', 6, 'h', 1),
  _q63MatchExpl('pencil','tile', 6, 'h', 2),
  _q63MatchExpl('book',  'block',6, 'h', 3)
];

// ── C5: Choose the true statement (16 = 6E / 7M / 3H) ────────────────────────
var _l63C5 = [
  // Easy (6)
  _q63TrueStatement('pencil','cube', 3, 'e', 0),
  _q63TrueStatement('crayon','clip', 3, 'e', 1),
  _q63TrueStatement('marker','tile', 4, 'e', 2),
  _q63TrueStatement('stick', 'block',3, 'e', 3),
  _q63TrueStatement('ribbon','cube', 4, 'e', 0),
  _q63TrueStatement('book',  'tile', 3, 'e', 1),
  // Medium (7)
  _q63TrueStatement('pencil','clip', 4, 'm', 2),
  _q63TrueStatement('marker','block',5, 'm', 3),
  _q63TrueStatement('ribbon','tile', 4, 'm', 0),
  _q63TrueStatement('book',  'cube', 5, 'm', 1),
  _q63TrueStatement('stick', 'clip', 5, 'm', 2),
  _q63TrueStatement('crayon','block',4, 'm', 3),
  _q63TrueStatement('pen',   'tile', 5, 'm', 0),
  // Hard (3)
  _q63TrueStatement('pencil','block',6, 'h', 1),
  _q63TrueStatement('ribbon','cube', 6, 'h', 2),
  _q63TrueStatement('stick', 'tile', 6, 'h', 3)
];

// ── C6: Deduce unit size from counts (16 = 5E / 7M / 4H) ─────────────────────
// `swap` flips whether the smaller-unit picture is on top.
var _l63C6 = [
  // Easy (5)
  _q63DeduceSize('pencil','cube', 3, false, 'e', 0),
  _q63DeduceSize('ribbon','tile', 3, true,  'e', 1),
  _q63DeduceSize('marker','block',4, false, 'e', 2),
  _q63DeduceSize('book',  'clip', 3, true,  'e', 3),
  _q63DeduceSize('stick', 'cube', 4, false, 'e', 0),
  // Medium (7)
  _q63DeduceSize('crayon','tile', 4, true,  'm', 1),
  _q63DeduceSize('pen',   'block',4, false, 'm', 2),
  _q63DeduceSize('pencil','clip', 5, true,  'm', 3),
  _q63DeduceSize('ribbon','cube', 5, false, 'm', 0),
  _q63DeduceSize('book',  'tile', 5, true,  'm', 1),
  _q63DeduceSize('leaf',  'block',4, false, 'm', 2),
  _q63DeduceSize('marker','cube', 5, true,  'm', 3),
  // Hard (4)
  _q63DeduceSize('stick', 'tile', 6, false, 'h', 0),
  _q63DeduceSize('pencil','block',6, true,  'h', 1),
  _q63DeduceSize('ribbon','clip', 6, false, 'h', 2),
  _q63DeduceSize('book',  'cube', 6, true,  'h', 3)
];

// ── C7: Error repair (18 = 4E / 8M / 6H) ─────────────────────────────────────
var _l63C7 = [
  // Easy (4)
  _q63ErrorRepair('pencil','cube', 3, 'Maya', 'Sam',  'e', 0),
  _q63ErrorRepair('ribbon','tile', 3, 'Leo',  'Mia',  'e', 1),
  _q63ErrorRepair('marker','clip', 4, 'Aiden','Zoe',  'e', 2),
  _q63ErrorRepair('book',  'block',3, 'Eli',  'Lily', 'e', 3),
  // Medium (8)
  _q63ErrorRepair('stick', 'cube', 4, 'Noah', 'Ava',  'm', 0),
  _q63ErrorRepair('crayon','tile', 5, 'Mia',  'Leo',  'm', 1),
  _q63ErrorRepair('pen',   'clip', 4, 'Sam',  'Maya', 'm', 2),
  _q63ErrorRepair('ribbon','block',4, 'Lily', 'Eli',  'm', 3),
  _q63ErrorRepair('pencil','tile', 5, 'Zoe',  'Aiden','m', 0),
  _q63ErrorRepair('book',  'cube', 5, 'Ava',  'Noah', 'm', 1),
  _q63ErrorRepair('marker','block',5, 'Leo',  'Sam',  'm', 2),
  _q63ErrorRepair('leaf',  'clip', 4, 'Maya', 'Mia',  'm', 3),
  // Hard (6)
  _q63ErrorRepair('stick', 'tile', 6, 'Eli',  'Zoe',  'h', 0),
  _q63ErrorRepair('pencil','block',6, 'Lily', 'Noah', 'h', 1),
  _q63ErrorRepair('crayon','cube', 6, 'Aiden','Maya', 'h', 2),
  _q63ErrorRepair('ribbon','clip', 6, 'Sam',  'Ava',  'h', 3),
  _q63ErrorRepair('book',  'tile', 6, 'Mia',  'Leo',  'h', 0),
  _q63ErrorRepair('pen',   'cube', 6, 'Noah', 'Eli',  'h', 1)
];

// ── C8: Predict count direction (19 = 7E / 6M / 6H) ──────────────────────────
var _l63C8 = [
  // Easy (7) — alternate smaller/bigger
  _q63Predict('pencil','cube', 3, 'smaller','e', 0),
  _q63Predict('ribbon','tile', 4, 'bigger', 'e', 1),
  _q63Predict('marker','clip', 4, 'smaller','e', 2),
  _q63Predict('stick', 'block',3, 'bigger', 'e', 3),
  _q63Predict('book',  'cube', 4, 'smaller','e', 0),
  _q63Predict('crayon','tile', 3, 'bigger', 'e', 1),
  _q63Predict('pen',   'cube', 4, 'smaller','e', 2),
  // Medium (6)
  _q63Predict('pencil','tile', 5, 'bigger', 'm', 3),
  _q63Predict('ribbon','clip', 5, 'smaller','m', 0),
  _q63Predict('book',  'block',5, 'bigger', 'm', 1),
  _q63Predict('marker','cube', 5, 'smaller','m', 2),
  _q63Predict('leaf',  'tile', 4, 'bigger', 'm', 3),
  _q63Predict('stick', 'clip', 5, 'smaller','m', 0),
  // Hard (6)
  _q63Predict('pencil','block',6, 'bigger', 'h', 1),
  _q63Predict('ribbon','cube', 6, 'smaller','h', 2),
  _q63Predict('book',  'tile', 6, 'bigger', 'h', 3),
  _q63Predict('crayon','clip', 6, 'smaller','h', 0),
  _q63Predict('marker','block',6, 'bigger', 'h', 1),
  _q63Predict('stick', 'cube', 6, 'smaller','h', 2)
];

// ── L6.3 combined bank ───────────────────────────────────────────────────────
var _l63Bank = [].concat(_l63C1, _l63C2, _l63C3, _l63C4, _l63C5, _l63C6, _l63C7, _l63C8);


// ── Unit spec ─────────────────────────────────────────────────────────────────
export const G1_U6_SPEC = {
  unitId: 'g1u6',
  title: 'Measurement & Time',
  teks: ['1.7A', '1.7B', '1.7C', '1.7D', '1.7E'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.1 — Measuring with Non-Standard Units
    //  TEKS 1.7A | 145 questions (50E / 55M / 40H)
    //  8 categories: C1 cubes, C2 clips, C3 match, C4 statement,
    //  C5 compare, C6 tiles/blocks, C7 identify unit, C8 error repair
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l1',
      title: 'Measuring with Non-Standard Units',
      teks: ['1.7A'],
      skill: 'measure_nonstandard_units',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l61KeyIdeas,
      workedExamples: _l61Examples,
      quizBank: _l61Bank,
      diagnostics: {
        commonDistractors: [_61CW, _61SK, _61DC, _61WN, _61LC, _61MS],
        errorTags: [_61CW, _61SK, _61DC, _61WN, _61LC, _61MS],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.2 — Understanding Units of Length
    //  TEKS 1.7B | 135 questions (45E / 55M / 35H)
    //  8 categories: C1 pick-correct, C2 gaps, C3 overlaps, C4 mixed-size,
    //  C5 start/end, C6 why same-size, C7 error repair, C8 match the reason
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l2',
      title: 'Understanding Units of Length',
      teks: ['1.7B'],
      skill: 'understand_length_units',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l62KeyIdeas,
      workedExamples: _l62Examples,
      quizBank: _l62Bank,
      diagnostics: {
        commonDistractors: [_62GP, _62OV, _62MX, _62BS, _62BE, _62WP, _62RC, _62CW],
        errorTags:         [_62GP, _62OV, _62MX, _62BS, _62BE, _62WP, _62RC, _62CW],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.3 — Comparing Measurements
    //  TEKS 1.7C | 135 questions (45E / 55M / 35H)
    //  8 categories: C1 why-differ, C2 bigger-fewer, C3 smaller-more,
    //  C4 match-explanation, C5 true-statement, C6 deduce-size,
    //  C7 error-repair, C8 predict-direction
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l3',
      title: 'Comparing Measurements',
      teks: ['1.7C'],
      skill: 'compare_measurements',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l63KeyIdeas,
      workedExamples: _l63Examples,
      quizBank: _l63Bank,
      diagnostics: {
        commonDistractors: [_63BF, _63SM, _63TW, _63CN, _63US, _63SO, _63PD, _63EX],
        errorTags:         [_63BF, _63SM, _63TW, _63CN, _63US, _63SO, _63PD, _63EX],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.4 — Describing Length   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l4',
      title: 'Describing Length',
      teks: ['1.7D'],
      skill: 'describe_length',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.5 — Telling Time   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l5',
      title: 'Telling Time',
      teks: ['1.7E'],
      skill: 'tell_time_hour_half_hour',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    }

  ]
};

export default G1_U6_SPEC;
