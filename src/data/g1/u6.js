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
 *    L6.2  Understanding Units of Length          ← 135 questions (45E / 55M / 35H)
 *    L6.3  Comparing Measurements                 ← 135 questions (45E / 55M / 35H)
 *    L6.4  Describing Length                      ← 135 questions (45E / 55M / 35H)
 *    L6.5  Telling Time                           ← 155 questions (50E / 60M / 45H)
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
// Canvas is sized tight to content (50 tall, not 78) so there is no wasted
// vertical space at the top of the SVG. Per-unit y-baseline keeps unit
// bottoms aligned at y=34 across all four unit types.
function _u6UnitSizePair(unit) {
  var yBase = { cube: 7, clip: 6, tile: 10, block: 4 }[unit];
  var bigSvg = _u6UnitDrawers[unit](8, yBase);
  var smallSvg = _u6SmallUnitDrawers[unit](56, yBase);
  return '<svg viewBox="0 0 84 50" width="100%" style="max-width:200px;display:block;margin:0 auto">' +
    bigSvg + smallSvg +
    '<text x="22" y="46" font-size="11" font-weight="700" fill="#37474F" text-anchor="middle" font-family="Nunito,sans-serif">Big</text>' +
    '<text x="63" y="46" font-size="11" font-weight="700" fill="#37474F" text-anchor="middle" font-family="Nunito,sans-serif">Small</text>' +
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

// _q63TrueStatement — C5: judge a single claim about the two measurements.
// Binary True/False format (2-option multipleChoice) — kid-friendly and forces
// students to read each statement rather than picking the longest sentence.
// Cycles through a small pool of true AND false statements so students can't
// pattern-match a single correct answer.
function _q63TrueStatement(obj, unit, bigN, diff, aIdx) {
  // Two parallel pools (4 each) so we can force ~50/50 True/False balance
  // across the 16 C5 questions: even aIdx → True statement, odd → False.
  var truePool = [
    'Both measurements can be correct because the units are different sizes.',
    'Bigger units cover more space, so fewer of them are needed.',
    'Smaller units cover less space, so more of them are needed.',
    'The same object can have two correct counts when the units are different sizes.'
  ];
  var falsePool = [
    'When the counts are different, one of the measurements must be wrong.',
    'The bigger number is always the correct measurement.',
    'Two measurements of the same object always give the same count.',
    'A bigger count always means the object is bigger.'
  ];
  var useTrue = (aIdx % 2 === 0);
  var pool = useTrue ? truePool : falsePool;
  // Cycle within the chosen pool using a deterministic mix of params
  var idx = (bigN * 3 + obj.length + unit.length) % pool.length;
  var stmt = { text: pool[idx], isTrue: useTrue };
  var correctVal = stmt.isTrue ? 'True' : 'False';
  var wrongVal   = stmt.isTrue ? 'False' : 'True';
  var opts = [
    {val: correctVal},
    {val: wrongVal, tag: _63TW}
  ];
  return {
    t: 'True or false: ' + stmt.text,
    s: _u6TwoSizeMeasure(obj, unit, bigN),
    o: opts, a: 0,
    e: stmt.isTrue
      ? 'True. ' + stmt.text + ' The same object can have different counts when the units are different sizes.'
      : 'False. Both measurements of the same object can be correct when the units are different sizes — bigger units need fewer, smaller units need more.',
    d: diff,
    h: 'The object is the same in both rows. Look at the unit sizes, not just the numbers.',
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

// _q63ErrorRepair — C7: judge whether a student's claim is correct.
// Binary Yes/No format (2-option multipleChoice). The wording is intentionally
// tight: "Is X right?" (rather than "Is X correct?") to make it unambiguous
// that the student is judging X's STATEMENT, not X's measurement. The visual
// shows both measurement rows, so the measurement narrative is dropped from
// the prompt to keep reading load low. To prevent always-No pattern-matching,
// ~1 in 3 questions presents a CORRECT claim where the student is right
// (correct answer = Yes); the rest present the standard misconception
// (correct answer = No).
function _q63ErrorRepair(obj, unit, bigN, person, otherPerson, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var smallN = bigN * 2;
  var isCorrectClaim = (aIdx % 3 === 0);  // ~33% of C7 questions
  var prompt, explanation;
  if (isCorrectClaim) {
    prompt = person + ' says both measurements of the ' + oname +
             ' can be right because the units are different sizes. Is ' + person + ' right?';
    explanation = 'Yes. Both can be right. Bigger units need fewer; smaller units need more.';
  } else {
    prompt = person + ' says ' + otherPerson + ' must be wrong because the count is different. Is ' +
             person + ' right?';
    explanation = 'No. ' + otherPerson + ' can also be right. ' + otherPerson +
                  ' used smaller ' + um.plur + ', so more ' + um.plur + ' were needed.';
  }
  var correctVal = isCorrectClaim ? 'Yes' : 'No';
  var wrongVal   = isCorrectClaim ? 'No' : 'Yes';
  var opts = [
    {val: correctVal},
    {val: wrongVal, tag: _63TW}
  ];
  return {
    t: prompt,
    s: _u6TwoSizeMeasure(obj, unit, bigN),
    o: opts, a: 0,
    e: explanation,
    d: diff,
    h: 'Both measurements of the same object can be correct when the units are different sizes.',
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


// ════════════════════════════════════════════════════════════════════════════
//  L6.4 — Describing Length
//  TEKS 1.7D | 135 questions (45E / 55M / 35H)
//  Scope: describe length using number + unit name, including "about" for
//  visually obvious nearest-whole cases. NO half-units, NO fractions, NO
//  "between N and N+1" language, NO standard units, NO clocks.
// ════════════════════════════════════════════════════════════════════════════

// ── L6.4 error tags ──────────────────────────────────────────────────────────
var _64MN = 'err_missing_unit_name';
var _64WN = 'err_wrong_unit_name';
var _64WC = 'err_wrong_length_count';
var _64AC = 'err_about_length_confusion';
var _64NW = 'err_nearest_whole_confusion';
var _64SP = 'err_statement_picture_mismatch';
var _64CO = 'err_count_without_unit';
var _64DC = 'err_measurement_description_confusion';

// ── L6.4 SVG helper: "about" measurement picture ─────────────────────────────
// Object's right edge sits 6px before the train's right edge — i.e., the
// object visibly ends ~22/28 (~79%) across unit N. Visually unambiguous:
// the object is well past unit (N-1)'s right edge AND clearly short of
// unit N's right edge. The closest whole count is always N. Never produces
// a "between" visual.
function _u6PicAbout(obj, unit, n) {
  var trainW = n * 28;
  var objW = trainW - 6;
  var canvasW = trainW + 16;
  return '<svg viewBox="0 0 ' + canvasW + ' 72" width="100%" style="max-width:' + canvasW +
    'px;display:block;margin:0 auto">' + _u6ObjAtW(obj, objW) + _u6Train(unit, n) + '</svg>';
}

// ── L6.4 teaching visuals (for intervention overlays) ────────────────────────
function _u6TvFullStatement() {
  return _u6TvWrap(_u6Pic('pencil', 'cube', 5),
    'Number: 5. Unit name: cubes. Together: "5 cubes long."');
}
function _u6TvCountUnits64() {
  return _u6TvWrap(_u6PicLabeled('crayon', 'clip', 4),
    'Touch each paper clip and count: 1, 2, 3, 4. The crayon is 4 paper clips long.');
}
function _u6TvUnitName64() {
  return _u6TvWrap(_u6Pic('book', 'tile', 4),
    'The units are tiles. The answer says "tiles" — not cubes, not paper clips, not blocks.');
}
function _u6TvAboutChoice() {
  return _u6TvWrap(_u6PicAbout('pencil', 'cube', 5),
    'The pencil ends inside the 5th cube — closer to 5 than to 4. So we say "about 5 cubes long."');
}
function _u6TvNearestWhole() {
  return _u6TvWrap(_u6PicAbout('crayon', 'clip', 4),
    'The crayon ends near the end of clip 4. Closest whole = 4. Say "about 4 paper clips long."');
}
function _u6TvStatementMatch() {
  return _u6TvWrap(_u6Pic('stick', 'block', 5),
    'Statement: "The stick is 5 blocks long." Picture has 5 blocks. Match!');
}
function _u6TvGeneralDescribe() {
  return _u6TvWrap(_u6Pic('marker', 'cube', 5),
    'Right number (5). Right unit name (cubes). Exact, so no "about." → "5 cubes long."');
}

// ── L6.4 intervention factories ──────────────────────────────────────────────
function _i64FullStatement() { return {
  errorTag: _64MN, title: 'A length has two parts',
  teachingSteps: [
    'A length has TWO parts: a NUMBER and a UNIT NAME.',
    'The number tells how many.',
    'The unit name tells what you used (cubes, paper clips, tiles, or blocks).',
    'Both together: "5 cubes long" or "3 paper clips long."'
  ],
  teachingVisualRaw: _u6TvFullStatement(),
  correctAnswerExplanation: 'Always include both the number and the unit name when describing length.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i64CountUnits() { return {
  errorTag: _64WC, title: 'Count the units carefully',
  teachingSteps: [
    'Look at the train under the object.',
    'Point to each unit and say a number: 1, 2, 3...',
    'Stop where the object ends.',
    'That number is the count for your answer.'
  ],
  teachingVisualRaw: _u6TvCountUnits64(),
  correctAnswerExplanation: 'The count is the number of units that fit along the object.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i64UnitName() { return {
  errorTag: _64WN, title: 'Name the unit you see',
  teachingSteps: [
    'Look at the picture.',
    'What shape are the units? Cubes? Paper clips? Tiles? Blocks?',
    'The unit name in your answer must match the picture.',
    'Wrong unit name means a wrong description, even if the number is right.'
  ],
  teachingVisualRaw: _u6TvUnitName64(),
  correctAnswerExplanation: 'Match the unit name in your answer to the shapes shown in the picture.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i64AboutChoice() { return {
  errorTag: _64AC, title: 'Use "about" only when not exact',
  teachingSteps: [
    'Look at where the object ends.',
    'If it ends right at a unit\'s edge, use a plain number ("5 cubes long").',
    'If it ends past a unit\'s edge but not all the way to the next one, use "about" ("about 5 cubes long").',
    'Pick "about" only when the object is close to a whole count but not exact.'
  ],
  teachingVisualRaw: _u6TvAboutChoice(),
  correctAnswerExplanation: 'Use "about" when the object ends near a whole unit count but not exactly at it.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i64NearestWhole() { return {
  errorTag: _64NW, title: 'Pick the closest whole number',
  teachingSteps: [
    'Look at where the object ends.',
    'Which whole count is it closest to?',
    'If it ends near the end of unit 5, the closest whole is 5.',
    'Say "about 5" — not "about 4" or "about 6."'
  ],
  teachingVisualRaw: _u6TvNearestWhole(),
  correctAnswerExplanation: 'Choose the whole count the object is closest to.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i64StatementMatch() { return {
  errorTag: _64SP, title: 'Match the statement to the picture',
  teachingSteps: [
    'Read the statement. Find the number and the unit name.',
    'Look at each picture.',
    'Find the picture that has the SAME number AND the SAME unit name.',
    'Both must match.'
  ],
  teachingVisualRaw: _u6TvStatementMatch(),
  correctAnswerExplanation: 'A statement matches its picture when the number and the unit name both match.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i64GeneralDescribe() { return {
  errorTag: _64DC, title: 'A good description has three things',
  teachingSteps: [
    'Right NUMBER — count the units carefully.',
    'Right UNIT NAME — match what you see in the picture.',
    'Right WORDS — use "about" only when the object is close to a whole count, not exact.',
    'Always include BOTH the number AND the unit name.'
  ],
  teachingVisualRaw: _u6TvGeneralDescribe(),
  correctAnswerExplanation: 'A good length description has the right number, the right unit name, and the right word ("about" only when not exact).',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L6.4 question factory functions ──────────────────────────────────────────

// _q64Statement — C1: pick the correct "X is N units long" sentence.
function _q64Statement(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var unitList = ['cube', 'clip', 'tile', 'block'];
  var others = unitList.filter(function(u){ return u !== unit; });
  var wrongUnit = _u6UnitMeta[others[n % others.length]].plur;
  var opts = [
    {val: 'The ' + oname + ' is ' + n + ' ' + um.plur + ' long.'},
    {val: 'The ' + oname + ' is ' + n + ' ' + wrongUnit + ' long.', tag: _64WN},
    {val: 'The ' + oname + ' is ' + (n + 1) + ' ' + um.plur + ' long.', tag: _64WC},
    {val: 'The ' + oname + ' is ' + Math.max(1, n - 1) + ' ' + um.plur + ' long.', tag: _64WC}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. Which sentence tells the length of the ' + oname + '?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'There are ' + n + ' ' + um.plur + ' under the ' + oname + ', so the ' + oname + ' is ' + n + ' ' + um.plur + ' long.',
    d: diff,
    h: 'Count the units, then pick the sentence with the right number AND the right unit name.',
    sk: 'describe_length',
    i: _i64StatementMatch()
  };
}

// _q64NumberUnit — C2: pick the answer that has BOTH a number AND a unit name.
function _q64NumberUnit(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var unitList = ['cube', 'clip', 'tile', 'block'];
  var others = unitList.filter(function(u){ return u !== unit; });
  var wrongUnit = _u6UnitMeta[others[n % others.length]].plur;
  var opts = [
    {val: n + ' ' + um.plur + ' long'},
    {val: String(n), tag: _64CO},
    {val: 'About ' + n + ' ' + um.plur + ' long', tag: _64AC},
    {val: n + ' ' + wrongUnit + ' long', tag: _64WN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'How long is the ' + oname + '? Pick the answer with BOTH a number and the right unit name.',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'A length needs a number (' + n + ') AND a unit name (' + um.plur + '). The ' + oname + ' is ' + n + ' ' + um.plur + ' long.',
    d: diff,
    h: 'A number alone is not a length. Pick the answer that has both parts and matches the picture.',
    sk: 'describe_length',
    i: _i64FullStatement()
  };
}

// _u6PicForChoice — same content as _u6Pic, but WITHOUT the inline
// `max-width:Xpx` constraint so the SVG can scale freely to fill a
// fixed-size choice card. CSS (.vimg-svg > svg) controls the display
// size, so different unit counts produce visually equal-size cards.
// This is the visual key for L6.4 C3: card size never reveals the answer.
function _u6PicForChoice(obj, unit, n) {
  var w = n * 28 + 16;
  return '<svg viewBox="0 0 ' + w + ' 72" width="100%" style="display:block;margin:0 auto" preserveAspectRatio="xMidYMid meet">' +
    _u6ObjDrawers[obj](n) + _u6Train(unit, n) + '</svg>';
}

// _q64MatchStatement — C3: given a sentence, pick the picture that matches.
// Uses the engine's imgChoice visual type so each picture card IS the
// answer choice (student taps the picture directly). The four cards are
// rendered at equal outer size via .vimg-card CSS, so the number of
// units never leaks the answer through card geometry.
// `o` ("Picture A/B/C/D") is preserved as the data-level label and a
// fallback for review-mode / a11y; the active flow renders image cards.
function _q64MatchStatement(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var wrongs = [Math.max(1, n - 1), n + 1, n + 2];
  var slotCounts = wrongs.slice();
  slotCounts.splice(aIdx, 0, n);
  var letters = ['A', 'B', 'C', 'D'];
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var svgs   = slotCounts.map(function(c){ return _u6PicForChoice(obj, unit, c); });
  var opts = letters.map(function(L, i) {
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _64SP};
  });
  return {
    t: 'Which picture shows: "The ' + oname + ' is ' + n + ' ' + um.plur + ' long"? Tap a picture.',
    v: { type: 'imgChoice', config: { items: labels, svgs: svgs } },
    s: _u6FourPic(obj, unit, slotCounts),  // legacy fallback if v isn't rendered
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' has exactly ' + n + ' ' + um.plur + ' under the ' + oname + ', matching the statement.',
    d: diff,
    h: 'Read the statement: ' + n + ' ' + um.plur + '. Find the picture with that count.',
    sk: 'describe_length',
    i: _i64StatementMatch()
  };
}

// _q64About — C4: object ends inside unit N (clearly closer to N than N-1).
// Pick "About N <unit> long". Distractors: about N+1, about N-1, exactly N.
function _q64About(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var opts = [
    {val: 'About ' + n + ' ' + um.plur + ' long'},
    {val: 'About ' + (n + 1) + ' ' + um.plur + ' long', tag: _64NW},
    {val: 'About ' + Math.max(1, n - 1) + ' ' + um.plur + ' long', tag: _64NW},
    {val: 'Exactly ' + n + ' ' + um.plur + ' long', tag: _64AC}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. The ' + oname + ' is close to a whole count. Which is the best description?',
    s: _u6PicAbout(obj, unit, n),
    o: opts, a: aIdx,
    e: 'The ' + oname + ' ends inside the ' + n + 'th ' + um.sing + ', much closer to its end than to the start. The closest whole count is ' + n + ', so we say "about ' + n + ' ' + um.plur + ' long."',
    d: diff,
    h: 'Look at where the object ends. Which whole count is it closest to? Use "about" plus that number.',
    sk: 'describe_length',
    i: _i64AboutChoice()
  };
}

// _q64TooShortLong — C5: distractors are wrong-count claims (too short / too long).
function _q64TooShortLong(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var tooLong = n + 2;
  var tooShort = Math.max(1, n - 2);
  var opts = [
    {val: 'The ' + oname + ' is ' + n + ' ' + um.plur + ' long.'},
    {val: 'The ' + oname + ' is ' + (n + 1) + ' ' + um.plur + ' long.', tag: _64WC},
    {val: 'The ' + oname + ' is ' + Math.max(1, n - 1) + ' ' + um.plur + ' long.', tag: _64WC},
    {val: 'The ' + oname + ' is ' + tooLong + ' ' + um.plur + ' long.', tag: _64WC}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. Which sentence has the RIGHT count?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'Count the ' + um.plur + ' carefully: there are ' + n + '. The ' + oname + ' is ' + n + ' ' + um.plur + ' long.',
    d: diff,
    h: 'One sentence has the right count and three have the wrong count. Check by counting.',
    sk: 'describe_length',
    i: _i64CountUnits()
  };
}

// _q64UnitMismatch — C6: same count, different unit names. Pick the right one.
function _q64UnitMismatch(obj, unit, n, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var unitList = ['cube', 'clip', 'tile', 'block'];
  var others = unitList.filter(function(u){ return u !== unit; });
  var opts = [
    {val: 'The ' + oname + ' is ' + n + ' ' + um.plur + ' long.'},
    {val: 'The ' + oname + ' is ' + n + ' ' + _u6UnitMeta[others[0]].plur + ' long.', tag: _64WN},
    {val: 'The ' + oname + ' is ' + n + ' ' + _u6UnitMeta[others[1]].plur + ' long.', tag: _64WN},
    {val: 'The ' + oname + ' is ' + n + ' ' + _u6UnitMeta[others[2]].plur + ' long.', tag: _64WN}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. All four sentences say ' + n + '. Pick the one with the RIGHT unit name.',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'The picture shows ' + um.plur + '. The right answer says "' + um.plur + '" — not other unit names.',
    d: diff,
    h: 'Look at the shapes in the picture. Are they cubes, paper clips, tiles, or blocks?',
    sk: 'describe_length',
    i: _i64UnitName()
  };
}

// _q64ErrorRepair — C7: a student wrote a wrong description. Find the mistake.
// errorType: 'missing' | 'wrongUnit' | 'wrongCount'
function _q64ErrorRepair(obj, unit, n, person, errorType, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var unitList = ['cube', 'clip', 'tile', 'block'];
  var wrongU = unitList.filter(function(u){ return u !== unit; })[0];

  var stmt, correctFix;
  if (errorType === 'missing') {
    stmt = '"The ' + oname + ' is ' + n + '."';
    correctFix = 'The unit name is missing.';
  } else if (errorType === 'wrongUnit') {
    stmt = '"The ' + oname + ' is ' + n + ' ' + _u6UnitMeta[wrongU].plur + ' long."';
    correctFix = 'The unit name is wrong.';
  } else {
    stmt = '"The ' + oname + ' is ' + (n + 1) + ' ' + um.plur + ' long."';
    correctFix = 'The number is wrong.';
  }

  var allFixes = [
    'The unit name is missing.',
    'The unit name is wrong.',
    'The number is wrong.',
    'Both the number and the unit are wrong.'
  ];
  var distractors = allFixes.filter(function(f){ return f !== correctFix; });

  var opts = [
    {val: correctFix},
    {val: distractors[0], tag: _64DC},
    {val: distractors[1], tag: _64DC},
    {val: distractors[2], tag: _64DC}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: person + ' looked at the picture and wrote: ' + stmt + ' What is wrong with the answer?',
    s: _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'The correct answer is "The ' + oname + ' is ' + n + ' ' + um.plur + ' long." ' + correctFix,
    d: diff,
    h: 'Compare the answer to the picture: right number? right unit name? both included?',
    sk: 'describe_length',
    i: _i64GeneralDescribe()
  };
}

// _q64MixedReview — C8: pick the BEST description. Mix of exact and "about".
// isAbout=true → use the "about" picture; isAbout=false → use the exact picture.
function _q64MixedReview(obj, unit, n, isAbout, diff, aIdx) {
  var um = _u6UnitMeta[unit];
  var oname = _u6ObjName[obj];
  var unitList = ['cube', 'clip', 'tile', 'block'];
  var wrongU = unitList.filter(function(u){ return u !== unit; })[0];

  var correct, opts;
  if (isAbout) {
    correct = 'The ' + oname + ' is about ' + n + ' ' + um.plur + ' long.';
    opts = [
      {val: correct},
      {val: 'The ' + oname + ' is exactly ' + n + ' ' + um.plur + ' long.', tag: _64AC},
      {val: 'The ' + oname + ' is about ' + n + ' ' + _u6UnitMeta[wrongU].plur + ' long.', tag: _64WN},
      {val: 'The ' + oname + ' is about ' + n + '.', tag: _64MN}
    ];
  } else {
    correct = 'The ' + oname + ' is ' + n + ' ' + um.plur + ' long.';
    opts = [
      {val: correct},
      {val: 'The ' + oname + ' is about ' + n + ' ' + um.plur + ' long.', tag: _64AC},
      {val: 'The ' + oname + ' is ' + n + ' ' + _u6UnitMeta[wrongU].plur + ' long.', tag: _64WN},
      {val: 'The ' + oname + ' is ' + (n + 1) + ' ' + um.plur + ' long.', tag: _64WC}
    ];
  }
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Look at the picture. Pick the BEST description of the ' + oname + '.',
    s: isAbout ? _u6PicAbout(obj, unit, n) : _u6Pic(obj, unit, n),
    o: opts, a: aIdx,
    e: 'A good description has the right number, the right unit name, and the right word ("about" only when not exact). Correct: "' + correct + '"',
    d: diff,
    h: 'Check three things: right number, right unit name, "about" only when not exact.',
    sk: 'describe_length',
    i: _i64GeneralDescribe()
  };
}

// ── L6.4 key ideas ────────────────────────────────────────────────────────────
var _l64KeyIdeas = [
  'A length has two parts: a number AND a unit name. "5" is a count. "5 cubes long" is a length.',
  'The unit name in your answer matches the units in the picture — cubes, paper clips, tiles, or blocks.',
  'Count the units in the train under the object. That number is how many units long the object is.',
  'When an object ends very close to a whole unit, you can say "about" — like "about 5 cubes long."',
  'Always choose the closest whole count. L6.4 never uses partial numbers in the answer.',
  'A length statement matches its picture when the number AND the unit name both match.'
];

// ── L6.4 worked examples ──────────────────────────────────────────────────────
var _l64Examples = [
  {
    id: 'g1-u6-l4-ex-1',
    title: 'Example 1: Describe with a number AND a unit name',
    prompt: 'How long is the pencil? Give a full length description.',
    visual: {type: 'rawHtml', html: _u6Pic('pencil', 'cube', 6)},
    steps: [
      'Count the cubes under the pencil: 1, 2, 3, 4, 5, 6.',
      'The number is 6.',
      'The unit name is cubes (look at the picture — those are cubes).',
      'Put them together with "long."'
    ],
    finalAnswer: 'The pencil is 6 cubes long.'
  },
  {
    id: 'g1-u6-l4-ex-2',
    title: 'Example 2: Use the unit name you see',
    prompt: 'How long is the ribbon?',
    visual: {type: 'rawHtml', html: _u6Pic('ribbon', 'clip', 5)},
    steps: [
      'Count the paper clips under the ribbon: 1, 2, 3, 4, 5.',
      'The number is 5.',
      'The unit name is paper clips — not cubes, not tiles, not blocks.',
      'Say it with both parts.'
    ],
    finalAnswer: 'The ribbon is 5 paper clips long.'
  },
  {
    id: 'g1-u6-l4-ex-3',
    title: 'Example 3: Use "about" when the object is close to a whole count',
    prompt: 'How long is the crayon? It ends just inside the 5th paper clip.',
    visual: {type: 'rawHtml', html: _u6PicAbout('crayon', 'clip', 5)},
    steps: [
      'The crayon ends past the end of clip 4.',
      'But it does NOT reach all the way to the end of clip 5.',
      'It is closer to the end of clip 5 than to the end of clip 4.',
      'Use "about" plus the closest whole count.'
    ],
    finalAnswer: 'The crayon is about 5 paper clips long.'
  },
  {
    id: 'g1-u6-l4-ex-4',
    title: 'Example 4: A number alone is not a length',
    prompt: 'A student writes "The book is 4." What is wrong?',
    visual: {type: 'rawHtml', html: _u6Pic('book', 'tile', 4)},
    steps: [
      'The student counted the tiles — 4 is correct.',
      'But they left out the unit name.',
      'A length needs BOTH a number AND a unit name.',
      'Add "tiles long" to make it a length.'
    ],
    finalAnswer: 'The book is 4 tiles long. The unit name was missing.'
  },
  {
    id: 'g1-u6-l4-ex-5',
    title: 'Example 5: The unit name must match the picture',
    prompt: 'A student writes "The stick is 5 cubes long." Look at the picture and fix the answer.',
    visual: {type: 'rawHtml', html: _u6Pic('stick', 'block', 5)},
    steps: [
      'The student got the number right: 5.',
      'But the picture shows blocks, not cubes.',
      'The unit name in the answer must match the picture.',
      'Change "cubes" to "blocks."'
    ],
    finalAnswer: 'The stick is 5 blocks long. The unit name was wrong.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L6.4 question banks (8 categories, 135 total)
//  Target: 45E / 55M / 35H
//  C1 statement (18) + C2 number+unit (17) + C3 match (18) + C4 about (22) +
//  C5 too-short/too-long (16) + C6 unit-mismatch (14) + C7 repair (14) +
//  C8 mixed (16)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Choose the correct length statement (18 = 10E / 6M / 2H) ─────────────
var _l64C1 = [
  // Easy (10)
  _q64Statement('pencil','cube', 3,'e',0), _q64Statement('crayon','clip', 3,'e',1),
  _q64Statement('marker','tile', 4,'e',2), _q64Statement('pen',   'cube', 2,'e',3),
  _q64Statement('eraser','cube', 2,'e',0), _q64Statement('stick', 'clip', 5,'e',1),
  _q64Statement('book',  'tile', 3,'e',2), _q64Statement('ribbon','cube', 4,'e',3),
  _q64Statement('key',   'cube', 3,'e',0), _q64Statement('leaf',  'clip', 4,'e',1),
  // Medium (6)
  _q64Statement('pencil','clip', 5,'m',2), _q64Statement('crayon','tile', 6,'m',3),
  _q64Statement('marker','block',5,'m',0), _q64Statement('stick', 'cube', 7,'m',1),
  _q64Statement('book',  'clip', 6,'m',2), _q64Statement('ribbon','block',5,'m',3),
  // Hard (2)
  _q64Statement('pencil','block',7,'h',0), _q64Statement('stick', 'tile', 8,'h',1)
];

// ── C2: Number + unit name (17 = 10E / 5M / 2H) ──────────────────────────────
var _l64C2 = [
  // Easy (10)
  _q64NumberUnit('pencil','cube', 3,'e',0), _q64NumberUnit('crayon','clip', 4,'e',1),
  _q64NumberUnit('marker','tile', 4,'e',2), _q64NumberUnit('pen',   'cube', 3,'e',3),
  _q64NumberUnit('eraser','clip', 2,'e',0), _q64NumberUnit('stick', 'block',4,'e',1),
  _q64NumberUnit('book',  'tile', 3,'e',2), _q64NumberUnit('ribbon','cube', 5,'e',3),
  _q64NumberUnit('key',   'cube', 2,'e',0), _q64NumberUnit('leaf',  'clip', 3,'e',1),
  // Medium (5)
  _q64NumberUnit('pencil','tile', 6,'m',2), _q64NumberUnit('crayon','block',5,'m',3),
  _q64NumberUnit('marker','clip', 6,'m',0), _q64NumberUnit('stick', 'cube', 6,'m',1),
  _q64NumberUnit('book',  'block',5,'m',2),
  // Hard (2)
  _q64NumberUnit('pencil','cube', 8,'h',3), _q64NumberUnit('ribbon','tile', 7,'h',0)
];

// ── C3: Match statement to picture (4-pic grid) (18 = 6E / 8M / 4H) ──────────
var _l64C3 = [
  // Easy (6)
  _q64MatchStatement('pencil','cube', 3,'e',0), _q64MatchStatement('crayon','clip', 4,'e',1),
  _q64MatchStatement('marker','tile', 3,'e',2), _q64MatchStatement('pen',   'cube', 4,'e',3),
  _q64MatchStatement('eraser','clip', 2,'e',0), _q64MatchStatement('stick', 'block',4,'e',1),
  // Medium (8)
  _q64MatchStatement('book',  'tile', 5,'m',2), _q64MatchStatement('ribbon','cube', 5,'m',3),
  _q64MatchStatement('key',   'clip', 4,'m',0), _q64MatchStatement('leaf',  'cube', 4,'m',1),
  _q64MatchStatement('pencil','block',5,'m',2), _q64MatchStatement('crayon','cube', 6,'m',3),
  _q64MatchStatement('marker','clip', 5,'m',0), _q64MatchStatement('stick', 'tile', 5,'m',1),
  // Hard (4)
  _q64MatchStatement('pencil','tile', 6,'h',2), _q64MatchStatement('book',  'cube', 7,'h',3),
  _q64MatchStatement('stick', 'clip', 7,'h',0), _q64MatchStatement('ribbon','block',6,'h',1)
];

// ── C4: "About" nearest whole (22 = 4E / 12M / 6H) ───────────────────────────
var _l64C4 = [
  // Easy (4)
  _q64About('pencil','cube', 3,'e',0), _q64About('crayon','clip', 4,'e',1),
  _q64About('marker','tile', 4,'e',2), _q64About('book',  'block',3,'e',3),
  // Medium (12)
  _q64About('pen',   'cube', 4,'m',0), _q64About('eraser','clip', 3,'m',1),
  _q64About('stick', 'tile', 5,'m',2), _q64About('ribbon','block',4,'m',3),
  _q64About('key',   'cube', 4,'m',0), _q64About('leaf',  'clip', 5,'m',1),
  _q64About('pencil','tile', 5,'m',2), _q64About('crayon','block',5,'m',3),
  _q64About('marker','cube', 6,'m',0), _q64About('book',  'clip', 5,'m',1),
  _q64About('stick', 'cube', 6,'m',2), _q64About('ribbon','tile', 6,'m',3),
  // Hard (6)
  _q64About('pencil','clip', 7,'h',0), _q64About('marker','block',6,'h',1),
  _q64About('stick', 'tile', 7,'h',2), _q64About('book',  'cube', 7,'h',3),
  _q64About('ribbon','clip', 7,'h',0), _q64About('leaf',  'block',6,'h',1)
];

// ── C5: Too short / too long descriptions (16 = 4E / 8M / 4H) ────────────────
var _l64C5 = [
  // Easy (4)
  _q64TooShortLong('pencil','cube', 3,'e',0), _q64TooShortLong('crayon','clip', 4,'e',1),
  _q64TooShortLong('marker','tile', 4,'e',2), _q64TooShortLong('stick', 'block',4,'e',3),
  // Medium (8)
  _q64TooShortLong('book',  'cube', 5,'m',0), _q64TooShortLong('ribbon','tile', 5,'m',1),
  _q64TooShortLong('pen',   'clip', 5,'m',2), _q64TooShortLong('eraser','cube', 4,'m',3),
  _q64TooShortLong('pencil','block',5,'m',0), _q64TooShortLong('crayon','tile', 6,'m',1),
  _q64TooShortLong('marker','cube', 6,'m',2), _q64TooShortLong('stick', 'clip', 6,'m',3),
  // Hard (4)
  _q64TooShortLong('book',  'block',6,'h',0), _q64TooShortLong('ribbon','cube', 7,'h',1),
  _q64TooShortLong('stick', 'tile', 7,'h',2), _q64TooShortLong('pencil','clip', 8,'h',3)
];

// ── C6: Unit-name mismatch (14 = 5E / 6M / 3H) ───────────────────────────────
var _l64C6 = [
  // Easy (5)
  _q64UnitMismatch('pencil','cube', 3,'e',0), _q64UnitMismatch('crayon','clip', 4,'e',1),
  _q64UnitMismatch('marker','tile', 4,'e',2), _q64UnitMismatch('book',  'block',3,'e',3),
  _q64UnitMismatch('stick', 'cube', 4,'e',0),
  // Medium (6)
  _q64UnitMismatch('ribbon','clip', 5,'m',1), _q64UnitMismatch('pen',   'tile', 5,'m',2),
  _q64UnitMismatch('eraser','block',3,'m',3), _q64UnitMismatch('key',   'cube', 4,'m',0),
  _q64UnitMismatch('leaf',  'clip', 5,'m',1), _q64UnitMismatch('pencil','tile', 6,'m',2),
  // Hard (3)
  _q64UnitMismatch('crayon','block',6,'h',3), _q64UnitMismatch('book',  'cube', 7,'h',0),
  _q64UnitMismatch('stick', 'tile', 7,'h',1)
];

// ── C7: Error repair (14 = 3E / 5M / 6H) ─────────────────────────────────────
var _l64C7 = [
  // Easy (3)
  _q64ErrorRepair('pencil','cube', 4,'Maya','missing',  'e', 0),
  _q64ErrorRepair('crayon','clip', 3,'Sam', 'missing',  'e', 1),
  _q64ErrorRepair('marker','tile', 4,'Leo', 'missing',  'e', 2),
  // Medium (5)
  _q64ErrorRepair('book',  'cube', 5,'Mia',  'wrongUnit', 'm', 3),
  _q64ErrorRepair('stick', 'block',5,'Aiden','wrongUnit', 'm', 0),
  _q64ErrorRepair('ribbon','clip', 5,'Zoe',  'wrongCount','m', 1),
  _q64ErrorRepair('pen',   'tile', 4,'Eli',  'missing',   'm', 2),
  _q64ErrorRepair('eraser','cube', 3,'Lily', 'wrongCount','m', 3),
  // Hard (6)
  _q64ErrorRepair('pencil','block',6,'Noah', 'wrongUnit', 'h', 0),
  _q64ErrorRepair('crayon','cube', 6,'Ava',  'wrongCount','h', 1),
  _q64ErrorRepair('book',  'tile', 6,'Maya', 'missing',   'h', 2),
  _q64ErrorRepair('marker','clip', 6,'Sam',  'wrongUnit', 'h', 3),
  _q64ErrorRepair('stick', 'cube', 7,'Mia',  'wrongCount','h', 0),
  _q64ErrorRepair('ribbon','tile', 7,'Leo',  'missing',   'h', 1)
];

// ── C8: Mixed review (16 = 3E / 5M / 8H) ─────────────────────────────────────
var _l64C8 = [
  // Easy (3)
  _q64MixedReview('pencil','cube', 3,false,'e',0),
  _q64MixedReview('crayon','clip', 4,true, 'e',1),
  _q64MixedReview('marker','tile', 4,false,'e',2),
  // Medium (5)
  _q64MixedReview('book',  'block',5,true, 'm',3),
  _q64MixedReview('stick', 'cube', 5,false,'m',0),
  _q64MixedReview('ribbon','clip', 5,true, 'm',1),
  _q64MixedReview('pen',   'tile', 5,false,'m',2),
  _q64MixedReview('eraser','cube', 4,true, 'm',3),
  // Hard (8)
  _q64MixedReview('pencil','block',6,false,'h',0),
  _q64MixedReview('crayon','cube', 6,true, 'h',1),
  _q64MixedReview('book',  'tile', 6,false,'h',2),
  _q64MixedReview('marker','clip', 6,true, 'h',3),
  _q64MixedReview('stick', 'tile', 7,false,'h',0),
  _q64MixedReview('ribbon','block',6,true, 'h',1),
  _q64MixedReview('leaf',  'clip', 6,false,'h',2),
  _q64MixedReview('key',   'cube', 5,true, 'h',3)
];

// ── L6.4 combined bank ───────────────────────────────────────────────────────
var _l64Bank = [].concat(_l64C1, _l64C2, _l64C3, _l64C4, _l64C5, _l64C6, _l64C7, _l64C8);


// ════════════════════════════════════════════════════════════════════════════
//  L6.5 — Telling Time
//  TEKS 1.7E | 155 questions (50E / 60M / 45H)
//  Scope: tell time to the hour and half-hour ONLY. Analog + digital +
//  match + identify hands + interactive clock (Ex5).
//
//  Hard guardrails: NO minutes other than :00 and :30. NO AM/PM. NO
//  quarter-hour. NO 5-minute increments. NO elapsed time. NO calendar.
//
//  All clocks built by G1-only helpers in this file — Grade 2's ui.js
//  static renderer and u7.js inline interactive clock are NOT touched.
//  Hand-color convention (matches Grade 2 interactive): hour hand blue
//  (#2980b9, short, thick), minute hand black (#333, long, thin), pivot
//  red (#e74c3c).
// ════════════════════════════════════════════════════════════════════════════

// ── L6.5 error tags ──────────────────────────────────────────────────────────
var _65HHC = 'err_hour_hand_confusion';
var _65MHC = 'err_minute_hand_confusion';
var _65OH  = 'err_oclock_halfhour_confusion';
var _65WH  = 'err_wrong_hour';
var _65WHH = 'err_wrong_half_hour';
var _65AD  = 'err_analog_digital_mismatch';
var _65RM  = 'err_reads_minute_hand_as_hour';
var _65TF  = 'err_time_format_confusion';

// ── L6.5 SVG helpers: static clock face ──────────────────────────────────────
// G1-only static clock. Always uses minutes = 0 or 30 (Grade 1 scope).
// Hand colors match Grade 2 interactive clock convention:
//   hour hand   blue   #2980b9 (short, stroke 4.5)
//   minute hand black  #333    (long,  stroke 2.5)
//   pivot       red    #e74c3c (r=3)
//
// viewBox 0 0 100 100; rendered at `size` px (default 200) for inline use.
function _u6L5ClockBody(h, m) {
  var ha = ((h % 12) + m / 60) * 30;
  var ma = m * 6;
  var nums = '';
  for (var k = 1; k <= 12; k++) {
    var ang = (k / 12) * 360 - 90;
    var rad = ang * Math.PI / 180;
    var x = (50 + 36 * Math.cos(rad)).toFixed(1);
    var y = (50 + 36 * Math.sin(rad)).toFixed(1);
    nums += '<text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="central" ' +
      'font-size="11" font-weight="bold" fill="#1a2535" font-family="Boogaloo,cursive">' + k + '</text>';
  }
  var ticks = '';
  for (var t = 0; t < 60; t++) {
    var tAng = (t / 60) * 360 - 90;
    var tRad = tAng * Math.PI / 180;
    var inner = t % 5 === 0 ? 42 : 44;
    var outer = 46;
    var x1 = (50 + inner * Math.cos(tRad)).toFixed(1);
    var y1 = (50 + inner * Math.sin(tRad)).toFixed(1);
    var x2 = (50 + outer * Math.cos(tRad)).toFixed(1);
    var y2 = (50 + outer * Math.sin(tRad)).toFixed(1);
    var wd = t % 5 === 0 ? 1.2 : 0.6;
    ticks += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="#666" stroke-width="' + wd + '"/>';
  }
  return '<circle cx="50" cy="50" r="48" fill="#fffef5" stroke="#888" stroke-width="1.5"/>' +
    ticks + nums +
    '<line x1="50" y1="50" x2="50" y2="14" stroke="#333" stroke-width="2.5" ' +
       'stroke-linecap="round" transform="rotate(' + ma.toFixed(1) + ',50,50)"/>' +
    '<line x1="50" y1="50" x2="50" y2="26" stroke="#2980b9" stroke-width="4.5" ' +
       'stroke-linecap="round" transform="rotate(' + ha.toFixed(1) + ',50,50)"/>' +
    '<circle cx="50" cy="50" r="3" fill="#e74c3c"/>';
}

function _u6L5Clock(h, m, size) {
  size = size || 200;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" ' +
    'style="display:block;margin:0 auto">' + _u6L5ClockBody(h, m) + '</svg>';
}

// _u6L5ClockForChoice — same SVG content, but no fixed pixel size; scales to
// fill its parent (used by imgChoice cards in C4). preserveAspectRatio keeps
// the clock circular regardless of card aspect ratio.
function _u6L5ClockForChoice(h, m) {
  return '<svg viewBox="0 0 100 100" width="100%" ' +
    'style="display:block;margin:0 auto" preserveAspectRatio="xMidYMid meet">' +
    _u6L5ClockBody(h, m) + '</svg>';
}

// ── L6.5 SVG helpers: digital display ────────────────────────────────────────
// Only H:00 or H:30 are valid; values outside Grade 1 scope produce a clean
// "H:00" fallback so an accidental call cannot leak forbidden time strings.
function _u6L5DigitalText(h, m) {
  var hh = (h >= 1 && h <= 12) ? h : 12;
  var mm = (m === 30) ? '30' : '00';
  return hh + ':' + mm;
}

function _u6L5Digital(h, m, opts) {
  opts = opts || {};
  var size = opts.size || 28;
  return '<div style="font-size:' + size + 'px;font-weight:bold;color:#2980b9;' +
    'text-align:center;margin:8px 0;font-family:\'Boogaloo\',sans-serif;' +
    'letter-spacing:1px">' + _u6L5DigitalText(h, m) + '</div>';
}

// ── L6.5 SVG helpers: clock + digital pair ───────────────────────────────────
// Used by some C3/C9 visuals when both representations should be shown.
function _u6L5ClockAndDigital(h, m) {
  return '<div style="text-align:center;padding:4px 0">' +
    _u6L5Clock(h, m, 180) + _u6L5Digital(h, m, 24) + '</div>';
}

// ── L6.5 SVG helpers: interactive clock ──────────────────────────────────────
// Used in Worked Example 5. Self-contained: hour slider (1–12) + two big
// buttons (O'clock / Half past) update the clock and digital display via
// inline IIFE handlers, mirroring the Grade 2 inline pattern. All DOM ids
// are prefixed `g1ic-` so they don't collide with Grade 2's `ic-*` ids if
// both lessons render on the same page.
//
// Active button is highlighted by toggling the `.g1ic-active` class
// (single rule in styles.css).
function _u6L5InteractiveClock(initH, initMode) {
  if (initH < 1 || initH > 12) initH = 3;
  if (initMode !== 0 && initMode !== 30) initMode = 0;
  var ha = ((initH % 12) + initMode / 60) * 30;
  var ma = initMode * 6;

  // Build clock face (same content as _u6L5ClockBody, but with hand ids).
  var nums = '';
  for (var k = 1; k <= 12; k++) {
    var ang = (k / 12) * 360 - 90;
    var rad = ang * Math.PI / 180;
    var x = (50 + 36 * Math.cos(rad)).toFixed(1);
    var y = (50 + 36 * Math.sin(rad)).toFixed(1);
    nums += '<text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="central" ' +
      'font-size="11" font-weight="bold" fill="#1a2535" font-family="Boogaloo,cursive">' + k + '</text>';
  }
  var ticks = '';
  for (var t = 0; t < 60; t++) {
    var tAng = (t / 60) * 360 - 90;
    var tRad = tAng * Math.PI / 180;
    var inner = t % 5 === 0 ? 42 : 44;
    var outer = 46;
    var x1 = (50 + inner * Math.cos(tRad)).toFixed(1);
    var y1 = (50 + inner * Math.sin(tRad)).toFixed(1);
    var x2 = (50 + outer * Math.cos(tRad)).toFixed(1);
    var y2 = (50 + outer * Math.sin(tRad)).toFixed(1);
    var wd = t % 5 === 0 ? 1.2 : 0.6;
    ticks += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="#666" stroke-width="' + wd + '"/>';
  }

  // Inline update IIFE — reads slider + mode, repaints hands + digital.
  var updJs =
    "(function(){" +
      "var h=+document.getElementById('g1ic-hs').value;" +
      "var c=document.getElementById('g1ic-clock');" +
      "var m=+c.getAttribute('data-mode');" +
      "var ha=((h%12)+m/60)*30;" +
      "var ma=m*6;" +
      "document.getElementById('g1ic-hh').setAttribute('transform','rotate('+ha+',50,50)');" +
      "document.getElementById('g1ic-mh').setAttribute('transform','rotate('+ma+',50,50)');" +
      "var mm=m===30?'30':'00';" +
      "document.getElementById('g1ic-dt').textContent=h+':'+mm;" +
    "}).call(this)";

  var oClickJs =
    "document.getElementById('g1ic-clock').setAttribute('data-mode','0');" +
    "document.getElementById('g1ic-oclock').classList.add('g1ic-active');" +
    "document.getElementById('g1ic-half').classList.remove('g1ic-active');" +
    updJs;

  var hClickJs =
    "document.getElementById('g1ic-clock').setAttribute('data-mode','30');" +
    "document.getElementById('g1ic-half').classList.add('g1ic-active');" +
    "document.getElementById('g1ic-oclock').classList.remove('g1ic-active');" +
    updJs;

  var btnBase = "padding:10px 18px;font-size:16px;border:2px solid #1976D2;border-radius:10px;" +
    "background:#fff;color:#1976D2;cursor:pointer;font-weight:bold;" +
    "font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;margin:4px;min-width:120px";

  return '<div style="text-align:center;padding:6px 0">' +
    '<svg id="g1ic-clock" data-mode="' + initMode + '" width="220" height="220" ' +
      'viewBox="0 0 100 100" style="display:block;margin:6px auto">' +
      '<circle cx="50" cy="50" r="48" fill="#fffef5" stroke="#888" stroke-width="1.5"/>' +
      ticks + nums +
      '<line id="g1ic-mh" x1="50" y1="50" x2="50" y2="14" stroke="#333" stroke-width="2.5" ' +
         'stroke-linecap="round" transform="rotate(' + ma.toFixed(1) + ',50,50)"/>' +
      '<line id="g1ic-hh" x1="50" y1="50" x2="50" y2="26" stroke="#2980b9" stroke-width="4.5" ' +
         'stroke-linecap="round" transform="rotate(' + ha.toFixed(1) + ',50,50)"/>' +
      '<circle cx="50" cy="50" r="3" fill="#e74c3c"/>' +
    '</svg>' +
    '<div id="g1ic-dt" style="font-size:28px;font-weight:bold;color:#2980b9;' +
      'margin:6px 0;font-family:\'Boogaloo\',sans-serif;letter-spacing:1px">' +
      initH + ':' + (initMode === 30 ? '30' : '00') + '</div>' +
    '<div style="font-size:12px;color:#37474F;margin:4px 0 10px;line-height:1.4">' +
      'Hour hand — <span style="color:#2980b9;font-weight:bold">short blue</span>. ' +
      'Minute hand — <span style="color:#333;font-weight:bold">long black</span>.' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px;align-items:center;padding:4px">' +
      '<label style="font-size:14px;font-weight:bold;color:#333">Hour:' +
        '<input id="g1ic-hs" type="range" min="1" max="12" value="' + initH + '" step="1" ' +
          'style="width:180px;margin-left:8px;vertical-align:middle" ' +
          'oninput="' + updJs + '">' +
      '</label>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:6px">' +
        '<button id="g1ic-oclock" type="button" style="' + btnBase + '"' +
          (initMode === 0 ? ' class="g1ic-active"' : '') +
          ' onclick="' + oClickJs + '">O’clock</button>' +
        '<button id="g1ic-half" type="button" style="' + btnBase + '"' +
          (initMode === 30 ? ' class="g1ic-active"' : '') +
          ' onclick="' + hClickJs + '">Half past</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ── L6.5 teaching visuals (for intervention overlays) ────────────────────────
function _u6TvL5Hour() {
  return _u6TvWrap(_u6L5Clock(3, 0, 150),
    'The hour hand is the SHORT, blue one. It points at 3 — so the hour is 3.');
}
function _u6TvL5Minute() {
  return _u6TvWrap(_u6L5Clock(3, 0, 150),
    'The minute hand is the LONG, black one. On 12 means o’clock (:00).');
}
function _u6TvL5OClockVHalf() {
  return _u6TvWrap(_u6L5ClockAndDigital(4, 0) + _u6L5ClockAndDigital(4, 30),
    'Long hand on 12 = o’clock (:00). Long hand on 6 = half past (:30).');
}
function _u6TvL5WrongHour() {
  return _u6TvWrap(_u6L5Clock(7, 0, 150),
    'Look at the SHORT hand. It points at 7 — so the hour is 7. The time is 7:00.');
}
function _u6TvL5HalfPastSmaller() {
  return _u6TvWrap(_u6L5Clock(4, 30, 150),
    'At half past, the short hand is between 4 and 5. Always say the SMALLER number: 4. The time is 4:30.');
}
function _u6TvL5AnalogDigital() {
  return _u6TvWrap(_u6L5ClockAndDigital(8, 30),
    'Match the hour AND the long-hand position. 8:30 = short hand between 8 and 9, long hand on 6.');
}
function _u6TvL5General() {
  return _u6TvWrap(_u6L5ClockAndDigital(6, 0),
    'Read in two parts: long hand (12 = :00, 6 = :30) and short hand (the hour number).');
}

// ── L6.5 intervention factories ──────────────────────────────────────────────
function _i65HourHand() { return {
  errorTag: _65HHC, title: 'The hour hand is the SHORT one',
  teachingSteps: [
    'A clock has two hands: a short one and a long one.',
    'The HOUR hand is the SHORTER hand — the blue one in our clocks.',
    'It points at the hour number.',
    'The longer hand is the minute hand — that one tells the minutes.'
  ],
  teachingVisualRaw: _u6TvL5Hour(),
  correctAnswerExplanation: 'Short hand = hour. Long hand = minutes.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i65MinuteHand() { return {
  errorTag: _65MHC, title: 'The minute hand is the LONG one',
  teachingSteps: [
    'A clock has two hands: a short one and a long one.',
    'The MINUTE hand is the LONGER hand — the black one in our clocks.',
    'It tells the minutes — on 12 means :00, on 6 means :30.',
    'The shorter hand is the hour hand — that one tells the hour.'
  ],
  teachingVisualRaw: _u6TvL5Minute(),
  correctAnswerExplanation: 'Long hand = minutes. Short hand = hour.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i65OClockVHalfPast() { return {
  errorTag: _65OH, title: 'Long hand on 12 or 6?',
  teachingSteps: [
    'Look at the LONG hand (the minute hand).',
    'If the long hand is on 12, it is o’clock — the digital says :00.',
    'If the long hand is on 6, it is half past — the digital says :30.',
    'Always check the long hand first to know if it is :00 or :30.'
  ],
  teachingVisualRaw: _u6TvL5OClockVHalf(),
  correctAnswerExplanation: 'Long hand on 12 = :00 (o’clock). Long hand on 6 = :30 (half past).',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i65WrongHour() { return {
  errorTag: _65WH, title: 'Read the short hand for the hour',
  teachingSteps: [
    'The hour is shown by the SHORT hand.',
    'At o’clock, the short hand points right at an hour number.',
    'Find the number the short hand points at.',
    'That number is the hour.'
  ],
  teachingVisualRaw: _u6TvL5WrongHour(),
  correctAnswerExplanation: 'The hour is the number the short hand is pointing at.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i65HalfPastSmaller() { return {
  errorTag: _65WHH, title: 'At half past, use the SMALLER number',
  teachingSteps: [
    'At half past, the short hand is BETWEEN two hour numbers.',
    'Always say the SMALLER number.',
    'Example: between 4 and 5 → say "half past 4" → 4:30.',
    'The smaller number is the hour we already finished — the next number has not started yet.'
  ],
  teachingVisualRaw: _u6TvL5HalfPastSmaller(),
  correctAnswerExplanation: 'At half past, the hour is the SMALLER of the two numbers the short hand is between.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i65AnalogDigitalMatch() { return {
  errorTag: _65AD, title: 'Match the analog and the digital',
  teachingSteps: [
    'Read the analog clock first: hour (short hand) and :00 or :30 (long hand on 12 or 6).',
    'Now read the digital: the number before the colon is the hour; after the colon is :00 or :30.',
    'Both must match — same hour AND same minute part.',
    'If even one is different, it is not the same time.'
  ],
  teachingVisualRaw: _u6TvL5AnalogDigital(),
  correctAnswerExplanation: 'Analog and digital match when the hour and the minute part (:00 or :30) are both the same.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i65GeneralTime() { return {
  errorTag: _65RM, title: 'Read in two parts',
  teachingSteps: [
    'Part 1: Look at the LONG hand. On 12 = :00. On 6 = :30.',
    'Part 2: Look at the SHORT hand. Read the hour number it points at — at half past, use the smaller of the two numbers it sits between.',
    'Put it together: hour + (:00 or :30).',
    'Always check the long hand first, then the short hand.'
  ],
  teachingVisualRaw: _u6TvL5General(),
  correctAnswerExplanation: 'Read the long hand for :00 or :30, then the short hand for the hour.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L6.5 question factory functions ──────────────────────────────────────────

// _q65ReadOClock — C1: clock at H:00; pick the digital time.
function _q65ReadOClock(h, diff, aIdx) {
  var actual = _u6L5DigitalText(h, 0);
  var nextH = (h === 12) ? 1 : h + 1;
  var prevH = (h === 1) ? 12 : h - 1;
  var opts = [
    {val: actual},
    {val: _u6L5DigitalText(h, 30),       tag: _65OH},
    {val: _u6L5DigitalText(nextH, 0),    tag: _65WH},
    {val: _u6L5DigitalText(prevH, 0),    tag: _65WH}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'What time is shown on the clock?',
    s: _u6L5Clock(h, 0),
    o: opts, a: aIdx,
    e: 'The long hand is on 12, so it is o’clock. The short hand points at ' + h + '. The time is ' + actual + '.',
    d: diff,
    h: 'Long hand on 12 means o’clock. Read the short hand for the hour.',
    sk: 'tell_time_hour_half_hour',
    i: _i65WrongHour()
  };
}

// _q65ReadHalfPast — C2: clock at H:30; pick the digital time.
function _q65ReadHalfPast(h, diff, aIdx) {
  var actual = _u6L5DigitalText(h, 30);
  var nextH = (h === 12) ? 1 : h + 1;
  var opts = [
    {val: actual},
    {val: _u6L5DigitalText(nextH, 30), tag: _65WHH},
    {val: _u6L5DigitalText(h, 0),      tag: _65OH},
    {val: _u6L5DigitalText(nextH, 0),  tag: _65RM}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'What time is shown on the clock?',
    s: _u6L5Clock(h, 30),
    o: opts, a: aIdx,
    e: 'The long hand is on 6, so it is half past. The short hand is between ' + h + ' and ' + nextH +
       ' — say the smaller, ' + h + '. The time is ' + actual + '.',
    d: diff,
    h: 'Long hand on 6 means half past. Short hand between two numbers — say the smaller one.',
    sk: 'tell_time_hour_half_hour',
    i: _i65HalfPastSmaller()
  };
}

// _q65MatchAnalogToDigital — C3: analog clock; pick the digital (mix of hour + half).
function _q65MatchAnalogToDigital(h, m, diff, aIdx) {
  var actual = _u6L5DigitalText(h, m);
  var nextH = (h === 12) ? 1 : h + 1;
  var prevH = (h === 1) ? 12 : h - 1;
  var otherM = (m === 0) ? 30 : 0;
  var opts;
  if (m === 0) {
    opts = [
      {val: actual},
      {val: _u6L5DigitalText(h, 30),      tag: _65OH},
      {val: _u6L5DigitalText(nextH, 0),   tag: _65WH},
      {val: _u6L5DigitalText(prevH, 0),   tag: _65AD}
    ];
  } else {
    opts = [
      {val: actual},
      {val: _u6L5DigitalText(nextH, 30),  tag: _65WHH},
      {val: _u6L5DigitalText(h, 0),       tag: _65OH},
      {val: _u6L5DigitalText(prevH, 30),  tag: _65AD}
    ];
  }
  opts = _u6Place(opts, aIdx);
  return {
    t: 'Which digital time matches the clock?',
    s: _u6L5Clock(h, m),
    o: opts, a: aIdx,
    e: 'The clock shows ' + actual + '. ' + (m === 0
        ? 'Long hand on 12 = :00; short hand on ' + h + '.'
        : 'Long hand on 6 = :30; short hand between ' + h + ' and ' + nextH + ', so the hour is ' + h + '.'),
    d: diff,
    h: 'Read the analog: long hand (12 or 6) then short hand. Find the matching digital.',
    sk: 'tell_time_hour_half_hour',
    i: _i65AnalogDigitalMatch()
  };
}

// _q65MatchDigitalToAnalog — C4: digital; pick the clock face from 4 images (imgChoice).
function _q65MatchDigitalToAnalog(h, m, diff, aIdx) {
  var actual = _u6L5DigitalText(h, m);
  var nextH = (h === 12) ? 1 : h + 1;
  var prevH = (h === 1) ? 12 : h - 1;
  var otherM = (m === 0) ? 30 : 0;
  var others = [
    {h: nextH, m: m},        // wrong hour, right minute
    {h: h,     m: otherM},   // right hour, wrong minute
    {h: prevH, m: otherM}    // wrong both
  ];
  var slotTimes = others.slice();
  slotTimes.splice(aIdx, 0, {h: h, m: m});
  var letters = ['A', 'B', 'C', 'D'];
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var svgs = slotTimes.map(function(tt){ return _u6L5ClockForChoice(tt.h, tt.m); });
  // Fallback (review-mode / no-imgChoice): inline 4 mini-clocks side-by-side.
  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;padding:4px 0">' +
    slotTimes.map(function(tt, i) {
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;border-radius:6px;' +
        'padding:4px;margin:3px;background:#fff;min-width:130px;vertical-align:top">' +
        '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u6L5Clock(tt.h, tt.m, 110) + '</div>';
    }).join('') + '</div>';
  var opts = letters.map(function(L, i) {
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _65AD};
  });
  return {
    t: 'Which clock shows ' + actual + '? Tap a picture.',
    v: { type: 'imgChoice', config: { items: labels, svgs: svgs } },
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + actual + ': ' + (m === 0
        ? 'long hand on 12, short hand on ' + h + '.'
        : 'long hand on 6, short hand between ' + h + ' and ' + nextH + '.'),
    d: diff,
    h: 'Digital ' + actual + ': hour ' + h + ', ' + (m === 0 ? 'long hand on 12' : 'long hand on 6') + '.',
    sk: 'tell_time_hour_half_hour',
    i: _i65AnalogDigitalMatch()
  };
}

// _q65IdentifyHand — C5: which hand is the hour/minute hand?
// askHourHand: true → ask which is the hour hand; false → which is the minute hand.
function _q65IdentifyHand(h, askHourHand, diff, aIdx) {
  var correct = askHourHand ? 'The short blue hand' : 'The long black hand';
  var wrong   = askHourHand ? 'The long black hand' : 'The short blue hand';
  var wrongTag = askHourHand ? _65HHC : _65MHC;
  var swap     = askHourHand ? _65HHC : _65MHC;
  var opts = [
    {val: correct},
    {val: wrong,                                tag: wrongTag},
    {val: 'The red center dot',                 tag: swap},
    {val: 'The number ' + (askHourHand ? '12' : '6'), tag: _65RM}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: askHourHand ? 'Which hand on the clock is the hour hand?' : 'Which hand on the clock is the minute hand?',
    s: _u6L5Clock(h, 0),
    o: opts, a: aIdx,
    e: askHourHand
      ? 'The hour hand is the SHORTER hand. In our clocks it is the blue one. It tells which hour.'
      : 'The minute hand is the LONGER hand. In our clocks it is the black one. It tells the minutes (:00 or :30).',
    d: diff,
    h: askHourHand ? 'The hour hand is shorter (and blue in our clocks).'
                   : 'The minute hand is longer (and black in our clocks).',
    sk: 'tell_time_hour_half_hour',
    i: askHourHand ? _i65HourHand() : _i65MinuteHand()
  };
}

// _q65LongHandOnTwelve — C6: long hand on 12 means o'clock.
function _q65LongHandOnTwelve(h, diff, aIdx) {
  var actual = _u6L5DigitalText(h, 0);
  var opts = [
    {val: 'It is ' + h + ' o’clock — ' + actual + '.'},
    {val: 'It is half past ' + h + ' — ' + _u6L5DigitalText(h, 30) + '.', tag: _65OH},
    {val: 'It is 12 o’clock.',                                       tag: _65RM},
    {val: 'It is ' + h + ' minutes past 12.',                              tag: _65TF}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'The long hand is on 12. What time is it?',
    s: _u6L5Clock(h, 0),
    o: opts, a: aIdx,
    e: 'When the long hand is on 12, it is o’clock — the minutes are :00. The short hand points at ' + h +
       ', so the time is ' + actual + '.',
    d: diff,
    h: 'Long hand on 12 = o’clock = :00. Read the short hand for the hour.',
    sk: 'tell_time_hour_half_hour',
    i: _i65OClockVHalfPast()
  };
}

// _q65LongHandOnSix — C7: long hand on 6 means half past.
function _q65LongHandOnSix(h, diff, aIdx) {
  var actual = _u6L5DigitalText(h, 30);
  var nextH = (h === 12) ? 1 : h + 1;
  var opts = [
    {val: 'It is half past ' + h + ' — ' + actual + '.'},
    {val: 'It is ' + h + ' o’clock — ' + _u6L5DigitalText(h, 0) + '.',     tag: _65OH},
    {val: 'It is half past ' + nextH + ' — ' + _u6L5DigitalText(nextH, 30) + '.', tag: _65WHH},
    {val: 'It is 6 o’clock.',                                              tag: _65RM}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: 'The long hand is on 6. What time is it?',
    s: _u6L5Clock(h, 30),
    o: opts, a: aIdx,
    e: 'When the long hand is on 6, it is half past — the minutes are :30. The short hand is between ' + h +
       ' and ' + nextH + ', so we say the smaller, ' + h + '. The time is ' + actual + '.',
    d: diff,
    h: 'Long hand on 6 = half past = :30. Short hand between two numbers — say the smaller.',
    sk: 'tell_time_hour_half_hour',
    i: _i65HalfPastSmaller()
  };
}

// _q65ErrorRepair — C8: a student wrote a wrong time. Find what's wrong.
// errorType: 'wrongHour' | 'wrongMinute' | 'wrongHand' | 'wrongFormat'
function _q65ErrorRepair(h, m, errorType, person, diff, aIdx) {
  var actual = _u6L5DigitalText(h, m);
  var nextH = (h === 12) ? 1 : h + 1;
  var prevH = (h === 1) ? 12 : h - 1;
  var otherM = (m === 0) ? 30 : 0;
  var minPos = (m === 0) ? 12 : 6;
  // claim is restricted so even malformed cases stay in H:00/H:30 space.
  // Each errorType picks a claim that breaks exactly one rule.
  var claim, fix, fixTag;
  if (errorType === 'wrongHour') {
    claim = _u6L5DigitalText(nextH, m);
    fix   = 'They read the wrong hour.';
    fixTag = _65WH;
  } else if (errorType === 'wrongMinute') {
    claim = _u6L5DigitalText(h, otherM);
    fix   = 'They got the :00 or :30 part wrong.';
    fixTag = _65OH;
  } else if (errorType === 'wrongHand') {
    // Student read the long hand's number as if it were the hour.
    claim = _u6L5DigitalText(minPos, m);
    fix   = 'They read the long hand instead of the short hand.';
    fixTag = _65RM;
  } else {  // wrongFormat — at half past, picked the LARGER number.
    claim = _u6L5DigitalText(nextH, 30);
    fix   = 'At half past, they used the bigger number instead of the smaller one.';
    fixTag = _65WHH;
  }
  var allFixes = [
    'They read the wrong hour.',
    'They got the :00 or :30 part wrong.',
    'They read the long hand instead of the short hand.',
    'At half past, they used the bigger number instead of the smaller one.'
  ];
  var distractors = allFixes.filter(function(f){ return f !== fix; });
  var distractorTags = [_65WH, _65OH, _65RM, _65WHH].filter(function(t){ return t !== fixTag; });
  var opts = [
    {val: fix},
    {val: distractors[0], tag: distractorTags[0]},
    {val: distractors[1], tag: distractorTags[1]},
    {val: distractors[2], tag: distractorTags[2]}
  ];
  opts = _u6Place(opts, aIdx);
  return {
    t: person + ' looked at the clock and said: "' + claim + '." But the clock shows ' + actual +
       '. What did ' + person + ' get wrong?',
    s: _u6L5Clock(h, m),
    o: opts, a: aIdx,
    e: 'The clock shows ' + actual + '. ' + fix,
    d: diff,
    h: 'Compare the claim to the clock. Check the hour, check the long hand, check that you used the right hand.',
    sk: 'tell_time_hour_half_hour',
    i: _i65GeneralTime()
  };
}

// _q65MixedReview — C9: "what time?" with hard distractor sets covering multiple
// error tags. Hardest tier; uses both hour and half-past mixed.
function _q65MixedReview(h, m, diff, aIdx) {
  var actual = _u6L5DigitalText(h, m);
  var nextH = (h === 12) ? 1 : h + 1;
  var prevH = (h === 1) ? 12 : h - 1;
  var otherM = (m === 0) ? 30 : 0;
  // Distractors chosen so each option breaks ONE specific rule.
  var opts;
  if (m === 0) {
    opts = [
      {val: actual},
      {val: _u6L5DigitalText(h, 30),     tag: _65OH},
      {val: _u6L5DigitalText(nextH, 0),  tag: _65WH},
      {val: _u6L5DigitalText(12, 0),     tag: _65RM}  // read long hand (on 12) as hour
    ];
  } else {
    opts = [
      {val: actual},
      {val: _u6L5DigitalText(nextH, 30), tag: _65WHH},  // at half past, picked bigger
      {val: _u6L5DigitalText(h, 0),      tag: _65OH},
      {val: _u6L5DigitalText(6, 30),     tag: _65RM}  // read long hand (on 6) as hour
    ];
  }
  opts = _u6Place(opts, aIdx);
  return {
    t: 'What time does the clock show?',
    s: _u6L5Clock(h, m),
    o: opts, a: aIdx,
    e: 'Long hand on ' + (m === 0 ? '12 → o’clock (:00). Short hand on ' + h
        : '6 → half past (:30). Short hand between ' + h + ' and ' + nextH + ', so the hour is the smaller, ' + h) +
       '. The time is ' + actual + '.',
    d: diff,
    h: 'Long hand first (12 = :00, 6 = :30), then short hand for the hour.',
    sk: 'tell_time_hour_half_hour',
    i: _i65GeneralTime()
  };
}

// ── L6.5 key ideas ────────────────────────────────────────────────────────────
var _l65KeyIdeas = [
  'A clock has two hands. The SHORT hand tells the hour. The LONG hand tells the minutes.',
  'When the long hand points to 12, it is "o’clock" — the digital says :00.',
  'When the long hand points to 6, it is "half past" — the digital says :30.',
  'To read the hour, look at the SHORT hand. At o’clock it points right at the hour number.',
  'At half past, the short hand is BETWEEN two hour numbers. Always say the SMALLER number — "half past 4" means between 4 and 5.',
  'A digital time like 7:30 has two parts: 7 is the hour, and :30 is the minutes part. Only :00 (o’clock) and :30 (half past) appear in this lesson.'
];

// ── L6.5 worked examples ──────────────────────────────────────────────────────
var _l65Examples = [
  {
    id: 'g1-u6-l5-ex-1',
    title: 'Example 1: Reading "o’clock"',
    prompt: 'What time does this clock show?',
    visual: {type: 'rawHtml', html: _u6L5ClockAndDigital(4, 0)},
    steps: [
      'Look at the LONG hand first. It is on 12, so it is o’clock.',
      'That means the digital ends in :00.',
      'Now look at the SHORT hand. It points right at 4, so the hour is 4.',
      'Put it together: 4 o’clock — 4:00.'
    ],
    finalAnswer: 'The time is 4:00 — "four o’clock."'
  },
  {
    id: 'g1-u6-l5-ex-2',
    title: 'Example 2: Reading "half past"',
    prompt: 'What time does this clock show?',
    visual: {type: 'rawHtml', html: _u6L5ClockAndDigital(7, 30)},
    steps: [
      'Look at the LONG hand first. It is on 6, so it is half past.',
      'That means the digital ends in :30.',
      'Now look at the SHORT hand. It is between 7 and 8 — always say the SMALLER number, 7.',
      'Put it together: half past 7 — 7:30.'
    ],
    finalAnswer: 'The time is 7:30 — "half past 7."'
  },
  {
    id: 'g1-u6-l5-ex-3',
    title: 'Example 3: Match the analog to the digital',
    prompt: 'Which digital time matches this clock?',
    visual: {type: 'rawHtml', html: _u6L5Clock(9, 0, 180) +
      '<div style="text-align:center;margin-top:8px;font-size:18px;color:#37474F">' +
      '<span style="margin:0 8px">3:30</span>' +
      '<span style="margin:0 8px;background:#E8F5E9;padding:2px 8px;border-radius:6px;font-weight:bold;color:#1B5E20">9:00 ✓</span>' +
      '<span style="margin:0 8px">9:30</span>' +
      '<span style="margin:0 8px">12:00</span>' +
      '</div>'},
    steps: [
      'Long hand: on 12 → :00.',
      'Short hand: on 9 → hour is 9.',
      'Combine: 9:00.',
      'Find the digital with the same number AND :00. Match!'
    ],
    finalAnswer: 'The matching digital is 9:00.'
  },
  {
    id: 'g1-u6-l5-ex-4',
    title: 'Example 4: Which hand is which?',
    prompt: 'The two hands look different. Each one has a job.',
    visual: {type: 'rawHtml', html: _u6L5Clock(3, 0, 180) +
      '<div style="text-align:center;margin-top:8px;font-size:14px;line-height:1.6;color:#37474F">' +
      '<div><span style="display:inline-block;width:14px;height:4px;background:#2980b9;vertical-align:middle"></span>' +
      ' &nbsp;<b>Short, blue</b> = HOUR hand (tells which hour)</div>' +
      '<div style="margin-top:4px"><span style="display:inline-block;width:22px;height:2.5px;background:#333;vertical-align:middle"></span>' +
      ' &nbsp;<b>Long, black</b> = MINUTE hand (tells :00 or :30)</div>' +
      '</div>'},
    steps: [
      'The two hands are different lengths and colors.',
      'The SHORT blue hand is the hour hand. It tells which hour.',
      'The LONG black hand is the minute hand. On 12 = :00; on 6 = :30.',
      'Always check both — one for the hour, one for the :00 or :30 part.'
    ],
    finalAnswer: 'Short blue = HOUR. Long black = MINUTE.'
  },
  {
    id: 'g1-u6-l5-ex-5',
    title: 'Example 5: Try it! Set the clock',
    prompt: 'Move the hour slider, then tap O’clock or Half past. Watch the clock change.',
    visual: {type: 'rawHtml', html: _u6L5InteractiveClock(3, 0)},
    steps: [
      'Move the Hour slider to pick an hour from 1 to 12. The short hand follows.',
      'Tap O’clock to set the long hand to 12 — the digital ends in :00.',
      'Tap Half past to set the long hand to 6 — the digital ends in :30 and the short hand slides between two numbers.',
      'Try: set the slider to 5, then tap Half past. The clock shows 5:30.'
    ],
    finalAnswer: 'Hour slider + O’clock/Half past buttons → make any time on the hour or half-hour.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L6.5 question banks (9 categories, 155 total)
//  Target: 50E / 60M / 45H
//  C1 oclock(22) + C2 halfpast(22) + C3 a→d(18) + C4 d→a(18) +
//  C5 identify(14) + C6 long12(14) + C7 long6(14) + C8 repair(16) + C9 mixed(17)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Read analog (on the hour) (22 = 12E / 8M / 2H) ───────────────────────
var _l65C1 = [
  // Easy (12) — small / familiar hours
  _q65ReadOClock(1, 'e', 0), _q65ReadOClock(2, 'e', 1),
  _q65ReadOClock(3, 'e', 2), _q65ReadOClock(4, 'e', 3),
  _q65ReadOClock(5, 'e', 0), _q65ReadOClock(6, 'e', 1),
  _q65ReadOClock(7, 'e', 2), _q65ReadOClock(8, 'e', 3),
  _q65ReadOClock(9, 'e', 0), _q65ReadOClock(10,'e', 1),
  _q65ReadOClock(11,'e', 2), _q65ReadOClock(12,'e', 3),
  // Medium (8) — second pass through hours, different correct slots
  _q65ReadOClock(2, 'm', 3), _q65ReadOClock(4, 'm', 0),
  _q65ReadOClock(6, 'm', 1), _q65ReadOClock(8, 'm', 2),
  _q65ReadOClock(10,'m', 3), _q65ReadOClock(12,'m', 0),
  _q65ReadOClock(3, 'm', 1), _q65ReadOClock(9, 'm', 2),
  // Hard (2) — tricky / 12 edge case
  _q65ReadOClock(11,'h', 3), _q65ReadOClock(12,'h', 0)
];

// ── C2: Read analog (half past) (22 = 10E / 10M / 2H) ────────────────────────
var _l65C2 = [
  // Easy (10)
  _q65ReadHalfPast(1, 'e', 0), _q65ReadHalfPast(2, 'e', 1),
  _q65ReadHalfPast(3, 'e', 2), _q65ReadHalfPast(4, 'e', 3),
  _q65ReadHalfPast(5, 'e', 0), _q65ReadHalfPast(6, 'e', 1),
  _q65ReadHalfPast(7, 'e', 2), _q65ReadHalfPast(8, 'e', 3),
  _q65ReadHalfPast(9, 'e', 0), _q65ReadHalfPast(10,'e', 1),
  // Medium (10)
  _q65ReadHalfPast(11,'m', 2), _q65ReadHalfPast(12,'m', 3),
  _q65ReadHalfPast(2, 'm', 0), _q65ReadHalfPast(5, 'm', 1),
  _q65ReadHalfPast(7, 'm', 2), _q65ReadHalfPast(9, 'm', 3),
  _q65ReadHalfPast(3, 'm', 0), _q65ReadHalfPast(8, 'm', 1),
  _q65ReadHalfPast(4, 'm', 2), _q65ReadHalfPast(6, 'm', 3),
  // Hard (2) — 11→12 and 12→1 edge cases
  _q65ReadHalfPast(11,'h', 0), _q65ReadHalfPast(12,'h', 1)
];

// ── C3: Match analog → digital (mixed) (18 = 8E / 8M / 2H) ───────────────────
var _l65C3 = [
  // Easy (8) — mix of :00 and :30 across varied hours
  _q65MatchAnalogToDigital(2, 0,  'e', 0), _q65MatchAnalogToDigital(3, 30, 'e', 1),
  _q65MatchAnalogToDigital(5, 0,  'e', 2), _q65MatchAnalogToDigital(6, 30, 'e', 3),
  _q65MatchAnalogToDigital(8, 0,  'e', 0), _q65MatchAnalogToDigital(9, 30, 'e', 1),
  _q65MatchAnalogToDigital(10,0,  'e', 2), _q65MatchAnalogToDigital(4, 30, 'e', 3),
  // Medium (8)
  _q65MatchAnalogToDigital(1, 30, 'm', 0), _q65MatchAnalogToDigital(7, 0,  'm', 1),
  _q65MatchAnalogToDigital(11,30, 'm', 2), _q65MatchAnalogToDigital(12,0,  'm', 3),
  _q65MatchAnalogToDigital(2, 30, 'm', 0), _q65MatchAnalogToDigital(5, 30, 'm', 1),
  _q65MatchAnalogToDigital(9, 0,  'm', 2), _q65MatchAnalogToDigital(8, 30, 'm', 3),
  // Hard (2)
  _q65MatchAnalogToDigital(12,30, 'h', 1), _q65MatchAnalogToDigital(11,0,  'h', 2)
];

// ── C4: Match digital → analog (imgChoice) (18 = 6E / 8M / 4H) ───────────────
var _l65C4 = [
  // Easy (6)
  _q65MatchDigitalToAnalog(3, 0,  'e', 0), _q65MatchDigitalToAnalog(4, 30, 'e', 1),
  _q65MatchDigitalToAnalog(6, 0,  'e', 2), _q65MatchDigitalToAnalog(8, 30, 'e', 3),
  _q65MatchDigitalToAnalog(2, 0,  'e', 0), _q65MatchDigitalToAnalog(9, 30, 'e', 1),
  // Medium (8)
  _q65MatchDigitalToAnalog(1, 0,  'm', 2), _q65MatchDigitalToAnalog(5, 30, 'm', 3),
  _q65MatchDigitalToAnalog(7, 0,  'm', 0), _q65MatchDigitalToAnalog(10,30, 'm', 1),
  _q65MatchDigitalToAnalog(11,0,  'm', 2), _q65MatchDigitalToAnalog(12,30, 'm', 3),
  _q65MatchDigitalToAnalog(4, 0,  'm', 0), _q65MatchDigitalToAnalog(8, 0,  'm', 1),
  // Hard (4)
  _q65MatchDigitalToAnalog(11,30, 'h', 2), _q65MatchDigitalToAnalog(12,0,  'h', 3),
  _q65MatchDigitalToAnalog(1, 30, 'h', 0), _q65MatchDigitalToAnalog(6, 30, 'h', 1)
];

// ── C5: Identify hour vs. minute hand (14 = 8E / 4M / 2H) ────────────────────
var _l65C5 = [
  // Easy (8) — even split between hour-hand and minute-hand at clear hours
  _q65IdentifyHand(3, true,  'e', 0), _q65IdentifyHand(3, false, 'e', 1),
  _q65IdentifyHand(6, true,  'e', 2), _q65IdentifyHand(6, false, 'e', 3),
  _q65IdentifyHand(9, true,  'e', 0), _q65IdentifyHand(9, false, 'e', 1),
  _q65IdentifyHand(12,true,  'e', 2), _q65IdentifyHand(12,false, 'e', 3),
  // Medium (4)
  _q65IdentifyHand(2, true,  'm', 0), _q65IdentifyHand(5, false, 'm', 1),
  _q65IdentifyHand(8, true,  'm', 2), _q65IdentifyHand(11,false, 'm', 3),
  // Hard (2)
  _q65IdentifyHand(7, false, 'h', 0), _q65IdentifyHand(4, true,  'h', 1)
];

// ── C6: Long hand on 12 = o'clock (14 = 4E / 6M / 4H) ────────────────────────
var _l65C6 = [
  // Easy (4)
  _q65LongHandOnTwelve(2,  'e', 0), _q65LongHandOnTwelve(5,  'e', 1),
  _q65LongHandOnTwelve(8,  'e', 2), _q65LongHandOnTwelve(11, 'e', 3),
  // Medium (6)
  _q65LongHandOnTwelve(1,  'm', 0), _q65LongHandOnTwelve(3,  'm', 1),
  _q65LongHandOnTwelve(6,  'm', 2), _q65LongHandOnTwelve(9,  'm', 3),
  _q65LongHandOnTwelve(10, 'm', 0), _q65LongHandOnTwelve(4,  'm', 1),
  // Hard (4)
  _q65LongHandOnTwelve(12, 'h', 2), _q65LongHandOnTwelve(7,  'h', 3),
  _q65LongHandOnTwelve(11, 'h', 0), _q65LongHandOnTwelve(2,  'h', 1)
];

// ── C7: Long hand on 6 = half past (14 = 2E / 6M / 6H) ───────────────────────
var _l65C7 = [
  // Easy (2)
  _q65LongHandOnSix(2,  'e', 0), _q65LongHandOnSix(7,  'e', 1),
  // Medium (6)
  _q65LongHandOnSix(3,  'm', 2), _q65LongHandOnSix(5,  'm', 3),
  _q65LongHandOnSix(8,  'm', 0), _q65LongHandOnSix(10, 'm', 1),
  _q65LongHandOnSix(1,  'm', 2), _q65LongHandOnSix(4,  'm', 3),
  // Hard (6) — including 11 and 12 edge cases
  _q65LongHandOnSix(11, 'h', 0), _q65LongHandOnSix(12, 'h', 1),
  _q65LongHandOnSix(6,  'h', 2), _q65LongHandOnSix(9,  'h', 3),
  _q65LongHandOnSix(11, 'h', 1), _q65LongHandOnSix(12, 'h', 2)
];

// ── C8: Error repair (16 = 0E / 6M / 10H) ────────────────────────────────────
var _l65C8 = [
  // Medium (6)
  _q65ErrorRepair(3, 0,  'wrongHour',   'Maya', 'm', 0),
  _q65ErrorRepair(7, 30, 'wrongHour',   'Sam',  'm', 1),
  _q65ErrorRepair(4, 0,  'wrongMinute', 'Leo',  'm', 2),
  _q65ErrorRepair(8, 30, 'wrongMinute', 'Mia',  'm', 3),
  _q65ErrorRepair(5, 0,  'wrongHand',   'Aiden','m', 0),
  _q65ErrorRepair(2, 30, 'wrongFormat', 'Zoe',  'm', 1),
  // Hard (10)
  _q65ErrorRepair(11,0,  'wrongHour',   'Eli',  'h', 2),
  _q65ErrorRepair(12,30, 'wrongHour',   'Lily', 'h', 3),
  _q65ErrorRepair(6, 0,  'wrongMinute', 'Noah', 'h', 0),
  _q65ErrorRepair(10,30, 'wrongMinute', 'Ava',  'h', 1),
  _q65ErrorRepair(9, 0,  'wrongHand',   'Maya', 'h', 2),
  _q65ErrorRepair(4, 30, 'wrongHand',   'Sam',  'h', 3),
  _q65ErrorRepair(5, 30, 'wrongFormat', 'Mia',  'h', 0),
  _q65ErrorRepair(8, 30, 'wrongFormat', 'Leo',  'h', 1),
  _q65ErrorRepair(11,30, 'wrongFormat', 'Eli',  'h', 2),
  _q65ErrorRepair(3, 30, 'wrongHand',   'Lily', 'h', 3)
];

// ── C9: Mixed review (17 = 0E / 4M / 13H) ────────────────────────────────────
var _l65C9 = [
  // Medium (4)
  _q65MixedReview(2,  0,  'm', 0), _q65MixedReview(5,  30, 'm', 1),
  _q65MixedReview(9,  0,  'm', 2), _q65MixedReview(11, 30, 'm', 3),
  // Hard (13)
  _q65MixedReview(1,  0,  'h', 0), _q65MixedReview(3,  30, 'h', 1),
  _q65MixedReview(4,  0,  'h', 2), _q65MixedReview(6,  30, 'h', 3),
  _q65MixedReview(7,  0,  'h', 0), _q65MixedReview(8,  30, 'h', 1),
  _q65MixedReview(10, 0,  'h', 2), _q65MixedReview(12, 30, 'h', 3),
  _q65MixedReview(11, 0,  'h', 0), _q65MixedReview(2,  30, 'h', 1),
  _q65MixedReview(5,  0,  'h', 2), _q65MixedReview(8,  0,  'h', 3),
  _q65MixedReview(12, 0,  'h', 0)
];

// ── L6.5 combined bank ───────────────────────────────────────────────────────
var _l65Bank = [].concat(_l65C1, _l65C2, _l65C3, _l65C4, _l65C5, _l65C6, _l65C7, _l65C8, _l65C9);


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
    //  Lesson 6.4 — Describing Length
    //  TEKS 1.7D | 135 questions (45E / 55M / 35H)
    //  8 categories: C1 statement, C2 number+unit, C3 match, C4 about,
    //  C5 too-short/too-long, C6 unit-mismatch, C7 error repair, C8 mixed
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l4',
      title: 'Describing Length',
      teks: ['1.7D'],
      skill: 'describe_length',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l64KeyIdeas,
      workedExamples: _l64Examples,
      quizBank: _l64Bank,
      diagnostics: {
        commonDistractors: [_64MN, _64WN, _64WC, _64AC, _64NW, _64SP, _64CO, _64DC],
        errorTags:         [_64MN, _64WN, _64WC, _64AC, _64NW, _64SP, _64CO, _64DC],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.5 — Telling Time
    //  TEKS 1.7E | 155 questions (50E / 60M / 45H)
    //  9 categories: C1 read-oclock, C2 read-half, C3 analog→digital,
    //  C4 digital→analog (imgChoice), C5 identify hands, C6 long-on-12,
    //  C7 long-on-6, C8 error repair, C9 mixed review
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l5',
      title: 'Telling Time',
      teks: ['1.7E'],
      skill: 'tell_time_hour_half_hour',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l65KeyIdeas,
      workedExamples: _l65Examples,
      quizBank: _l65Bank,
      diagnostics: {
        commonDistractors: [_65HHC, _65MHC, _65OH, _65WH, _65WHH, _65AD, _65RM, _65TF],
        errorTags:         [_65HHC, _65MHC, _65OH, _65WH, _65WHH, _65AD, _65RM, _65TF],
        interventionRules: []
      }
    }

  ]
};

export default G1_U6_SPEC;
