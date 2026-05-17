/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 7: Data Analysis
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.8A  Collect, sort, and organize data in up to three categories
 *          using models/representations such as tally marks or T-charts
 *    1.8B  Use data to create picture and bar-type graphs
 *    1.8C  Draw conclusions and generate/answer questions from data
 *
 *  Lessons:
 *    L7.1  Sorting and Organizing Data       ← 150 questions (50E / 60M / 40H)
 *    L7.2  Picture Graphs                    ← 140 questions (45E / 55M / 40H)
 *    L7.3  Bar-Type Graphs                   ← 140 questions (45E / 55M / 40H)
 *    L7.4  Drawing Conclusions from Data     ← 135 questions (40E / 55M / 40H)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - Picture graphs: 1 picture = 1 data point ONLY (no scaled keys).
 *    - Bar graphs: each unit/cell = 1 (no skip-count scales).
 *    - No line plots, histograms, frequency tables, mean/median/mode.
 *    - Up to 3 categories at L7.1; up to 4 categories at L7.2–L7.4.
 *    - Individual category counts capped at ~10 for legibility.
 *    - L7.4 differences framed as graph-reading, not equations
 *      (no '+' or '−' symbols in prompts).
 *    - Grade 2's "u6" Data Analysis content (tally groups of 5, scaled
 *      picture graphs, line plots) is OUT OF SCOPE — different namespace,
 *      different file, different progression.
 *
 *  Cross-grade name note: Grade 2 default Data Analysis lives at
 *  src/data/u6.js with unit id "u6" (Grade 2 numbers it as Unit 6).
 *  This file is Grade 1's separate Unit 7 namespace (g1u7).
 * ════════════════════════════════════════════════════════════════════════════ */


// ════════════════════════════════════════════════════════════════════════════
//  L7.1 — Sorting and Organizing Data
//  TEKS 1.8A | 150 questions (50E / 60M / 40H)
//  Scope: sort items into 2 or 3 categories, count groups, read tally
//  marks (1–10), read T-charts, identify sorting rules, repair mistakes.
//
//  Hard guardrails: NO picture graphs as primary skill (L7.2). NO bar
//  graphs as primary skill (L7.3). NO "how many more / fewer" (L7.4).
//  NO scaled keys. NO skip-count scales. NO line plots. NO mean/median/
//  mode. NO Grade 2 tally-groups-of-5 emphasis (4-plus-slash visual is
//  shown, but the lesson does NOT make skip-counting by 5s the main
//  skill). Per-category counts capped at 10.
// ════════════════════════════════════════════════════════════════════════════

// ── L7.1 error tags ──────────────────────────────────────────────────────────
var _71WC = 'err_wrong_category';
var _71CC = 'err_count_category_wrong';
var _71TC = 'err_tally_count_wrong';
var _71TG = 'err_tally_group_confusion';
var _71SR = 'err_sorting_rule_confusion';
var _71TX = 'err_tchart_column_confusion';
var _71IM = 'err_item_category_mismatch';
var _71DR = 'err_data_representation_mismatch';

// ── L7.1 item / category master data ─────────────────────────────────────────
// 16 items across 4 unambiguous categories. Every item belongs to exactly
// one category; the assignment is visually clear from the emoji.
var _U7_ICONS = {
  apple:  '🍎', banana: '🍌', orange: '🍊', grapes: '🍇',
  cat:    '🐱', dog:    '🐶', fish:   '🐟', rabbit: '🐰',
  ball:   '⚽', car:    '🚗', kite:   '🪁', die:    '🎲',
  flower: '🌸', star:   '⭐', sun:    '☀️', leaf:   '🍃'
};
var _U7_ITEM_CAT = {
  apple: 'Fruit',   banana: 'Fruit',   orange: 'Fruit',   grapes: 'Fruit',
  cat:   'Animals', dog:    'Animals', fish:   'Animals', rabbit: 'Animals',
  ball:  'Toys',    car:    'Toys',    kite:   'Toys',    die:    'Toys',
  flower:'Nature',  star:   'Nature',  sun:    'Nature',  leaf:   'Nature'
};
var _U7_CATEGORIES = ['Fruit', 'Animals', 'Toys', 'Nature'];
var _U7_CAT_ITEMS = {
  Fruit:   ['apple', 'banana', 'orange', 'grapes'],
  Animals: ['cat',   'dog',    'fish',   'rabbit'],
  Toys:    ['ball',  'car',    'kite',   'die'],
  Nature:  ['flower','star',   'sun',    'leaf']
};
var _U7_ITEM_NAME = {
  apple: 'apple', banana: 'banana', orange: 'orange', grapes: 'grapes',
  cat: 'cat', dog: 'dog', fish: 'fish', rabbit: 'rabbit',
  ball: 'ball', car: 'car', kite: 'kite', die: 'die',
  flower: 'flower', star: 'star', sun: 'sun', leaf: 'leaf'
};

// ── L7.1 visual helpers ──────────────────────────────────────────────────────
// Fixed 32×32 cell with the emoji centered. line-height:1 keeps the row
// baseline consistent regardless of which emoji is in the cell.
function _u7IconCell(name) {
  var glyph = _U7_ICONS[name] || '?';
  return '<span style="display:inline-flex;align-items:center;justify-content:center;' +
    'width:32px;height:32px;font-size:22px;line-height:1;vertical-align:middle">' + glyph + '</span>';
}

// Horizontal row of icon cells.
function _u7ItemRow(items) {
  return '<div style="display:flex;gap:4px;justify-content:center;align-items:center;' +
    'flex-wrap:wrap;min-height:32px">' +
    (items || []).map(_u7IconCell).join('') + '</div>';
}

// Labeled category box with header + a row of icons.
function _u7Group(items, label) {
  return '<div style="display:inline-block;border:2px solid #B0BEC5;border-radius:8px;' +
    'padding:8px 10px;margin:4px;background:#FAFAFA;min-width:108px;' +
    'vertical-align:top;text-align:center">' +
    '<div style="font-size:13px;font-weight:bold;color:#37474F;margin-bottom:6px;' +
    'font-family:Nunito,sans-serif">' + label + '</div>' +
    _u7ItemRow(items) +
    '</div>';
}

// Multi-group sorting mat (2 or 3 categories).
function _u7SortingMat(groups) {
  return '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:6px;padding:6px 0">' +
    groups.map(function(g){ return _u7Group(g.items, g.label); }).join('') +
    '</div>';
}

// Mixed (unsorted) pile of items — single bordered box with no category label.
function _u7Pile(items) {
  return '<div style="display:inline-block;border:2px dashed #B0BEC5;border-radius:8px;' +
    'padding:8px 12px;margin:4px auto;background:#FFF;min-width:140px;' +
    'text-align:center">' +
    '<div style="font-size:13px;font-weight:bold;color:#5a7080;margin-bottom:6px;' +
    'font-family:Nunito,sans-serif">A mixed pile</div>' +
    _u7ItemRow(items) +
    '</div>';
}

// _u7TallyN — N tally marks. Groups of 5 = 4 vertical strokes + 1 diagonal
// slash across them. Extras (n%5) follow as plain vertical strokes.
// Capped at 10 to match L7.1 scope.
function _u7TallyN(n) {
  if (n < 1) return '<span style="display:inline-block;width:50px;color:#888">(0)</span>';
  if (n > 10) n = 10;
  var groups = Math.floor(n / 5);
  var extras = n % 5;
  var groupW = 26;   // width allotted per group of 5
  var extraStep = 6; // px between extra strokes
  var totalW = groups * groupW + (groups > 0 && extras > 0 ? 8 : 0) + extras * extraStep + 4;
  var w = Math.max(56, totalW + 6);
  var svg = '<svg viewBox="0 0 ' + w + ' 28" width="' + w + '" height="28" ' +
    'style="display:inline-block;vertical-align:middle">';
  var x = 4;
  for (var g = 0; g < groups; g++) {
    for (var i = 0; i < 4; i++) {
      svg += '<line x1="' + (x + i * 5) + '" y1="3" x2="' + (x + i * 5) + '" y2="25" ' +
        'stroke="#1976D2" stroke-width="2.5" stroke-linecap="round"/>';
    }
    // diagonal slash across the four verticals
    svg += '<line x1="' + (x - 2) + '" y1="25" x2="' + (x + 4 * 5 + 1) + '" y2="3" ' +
      'stroke="#1976D2" stroke-width="2.5" stroke-linecap="round"/>';
    x += groupW;
    if (g === groups - 1 && extras > 0) x += 4; // small gap before extras
  }
  for (var j = 0; j < extras; j++) {
    svg += '<line x1="' + (x + j * extraStep) + '" y1="3" x2="' + (x + j * extraStep) + '" y2="25" ' +
      'stroke="#1976D2" stroke-width="2.5" stroke-linecap="round"/>';
  }
  svg += '</svg>';
  return svg;
}

// Multi-row tally chart with category labels.
// rows: [{label, count}]
function _u7TallyChart(rows) {
  var html = '<table style="border-collapse:collapse;margin:6px auto;border:2px solid #37474F;' +
    'background:#fff;font-family:Nunito,sans-serif">';
  html += '<tbody>';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    html += '<tr>' +
      '<td style="border:1px solid #B0BEC5;padding:6px 12px;text-align:left;' +
        'font-weight:bold;font-size:14px;color:#37474F;min-width:84px">' + r.label + '</td>' +
      '<td style="border:1px solid #B0BEC5;padding:6px 10px;text-align:left;' +
        'background:#FAFAFA;min-width:80px">' + _u7TallyN(r.count) + '</td>' +
      '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// Compact variant used inside imgChoice cards — no fixed min-width so the
// chart can scale to fill the card. Smaller font/padding for fit.
function _u7TallyChartForChoice(rows) {
  var html = '<table style="border-collapse:collapse;margin:0 auto;border:2px solid #37474F;' +
    'background:#fff;font-family:Nunito,sans-serif;max-width:100%">';
  html += '<tbody>';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    html += '<tr>' +
      '<td style="border:1px solid #B0BEC5;padding:3px 6px;text-align:left;' +
        'font-weight:bold;font-size:12px;color:#37474F">' + r.label + '</td>' +
      '<td style="border:1px solid #B0BEC5;padding:3px 6px;text-align:left;background:#FAFAFA">' +
        _u7TallyN(r.count) + '</td>' +
      '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// Two-column T-chart with bold headers and a dividing line.
function _u7TChart(leftLabel, rightLabel, leftItems, rightItems) {
  return '<table style="border-collapse:collapse;margin:6px auto;border:2px solid #37474F;' +
    'background:#fff;font-family:Nunito,sans-serif;min-width:240px">' +
    '<thead><tr>' +
    '<th style="border-bottom:3px solid #37474F;padding:8px 12px;font-size:14px;' +
      'font-weight:bold;color:#1976D2">' + leftLabel + '</th>' +
    '<th style="border-bottom:3px solid #37474F;border-left:3px solid #37474F;' +
      'padding:8px 12px;font-size:14px;font-weight:bold;color:#1976D2">' + rightLabel + '</th>' +
    '</tr></thead>' +
    '<tbody><tr>' +
    '<td style="padding:8px 12px;text-align:center;vertical-align:top;min-width:104px">' +
      _u7ItemRow(leftItems) + '</td>' +
    '<td style="padding:8px 12px;text-align:center;vertical-align:top;' +
      'border-left:3px solid #37474F;min-width:104px">' + _u7ItemRow(rightItems) + '</td>' +
    '</tr></tbody>' +
    '</table>';
}

// Three-column category table — labels at top, item rows below.
function _u7ThreeColChart(labels, itemsByCol) {
  var thead = '<tr>';
  for (var i = 0; i < 3; i++) {
    thead += '<th style="border-bottom:3px solid #37474F;' +
      (i > 0 ? 'border-left:2px solid #37474F;' : '') +
      'padding:6px 10px;font-size:14px;font-weight:bold;color:#1976D2;' +
      'font-family:Nunito,sans-serif">' + labels[i] + '</th>';
  }
  thead += '</tr>';
  var tbody = '<tr>';
  for (var j = 0; j < 3; j++) {
    tbody += '<td style="padding:8px 10px;text-align:center;vertical-align:top;' +
      (j > 0 ? 'border-left:2px solid #37474F;' : '') +
      'min-width:88px">' + _u7ItemRow(itemsByCol[j]) + '</td>';
  }
  tbody += '</tr>';
  return '<table style="border-collapse:collapse;margin:6px auto;border:2px solid #37474F;' +
    'background:#fff">' +
    '<thead>' + thead + '</thead>' +
    '<tbody>' + tbody + '</tbody>' +
    '</table>';
}

// Single category-card (used by C3 — pick which category an item belongs to).
function _u7ItemFocus(itemName) {
  return '<div style="text-align:center;padding:10px 0">' +
    '<div style="font-size:56px;line-height:1">' + (_U7_ICONS[itemName] || '?') + '</div>' +
    '<div style="font-size:14px;color:#37474F;margin-top:4px;font-family:Nunito,sans-serif;' +
      'font-weight:bold">' + _U7_ITEM_NAME[itemName] + '</div>' +
    '</div>';
}

// ── L7.1 teaching visuals (for intervention overlays) ────────────────────────
function _u7TvWrap(html, cap) {
  return '<div style="text-align:center;padding:4px 0">' + html +
    (cap ? '<div style="font-size:0.8rem;color:#5a7080;font-family:Nunito,sans-serif;' +
      'margin-top:6px;line-height:1.35">' + cap + '</div>' : '') +
    '</div>';
}
function _u7TvMatchCategory() {
  return _u7TvWrap(_u7SortingMat([
    {label: 'Fruit',   items: ['apple', 'banana']},
    {label: 'Animals', items: ['cat',   'dog']}
  ]), 'Look at the item. Find the label that matches what it IS.');
}
function _u7TvCountCategory() {
  return _u7TvWrap(_u7Group(['apple', 'apple', 'banana', 'orange'], 'Fruit'),
    'Touch each item once and count. There are 4 fruits.');
}
function _u7TvReadTally() {
  return _u7TvWrap(_u7TallyN(7),
    'Four straight marks and one slash make five. Then add two more: five, six, seven.');
}
function _u7TvTallyChartMatch() {
  return _u7TvWrap(_u7TallyChart([
    {label: 'Fruit',   count: 3},
    {label: 'Animals', count: 2}
  ]), 'Count the tally marks in each row. Find the chart where every row matches the items.');
}
function _u7TvTChartColumns() {
  return _u7TvWrap(_u7TChart('Fruit', 'Toys', ['apple', 'banana'], ['ball', 'car']),
    'Read the column heading. Put the item in the column that matches what it is.');
}
function _u7TvSortingRule() {
  return _u7TvWrap(_u7SortingMat([
    {label: 'Red', items: ['apple']},
    {label: 'Yellow', items: ['banana', 'sun']}
  ]), 'Look at every item in a group. What do they all share? That is the rule.');
}
function _u7TvGeneralSort() {
  return _u7TvWrap(_u7TallyChart([
    {label: 'Fruit',   count: 4},
    {label: 'Animals', count: 3},
    {label: 'Toys',    count: 2}
  ]), 'Organized data lets you read each group quickly. Check the label, then count the row.');
}

// ── L7.1 intervention factories ──────────────────────────────────────────────
function _i71MatchCategory() { return {
  errorTag: _71WC, title: 'Match the item to its category',
  teachingSteps: [
    'Look at the item — what is it?',
    'Read each category label.',
    'Find the label that describes what the item IS.',
    'Put the item under that label.'
  ],
  teachingVisualRaw: _u7TvMatchCategory(),
  correctAnswerExplanation: 'The category label describes the item — match what the item IS.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i71CountCategory() { return {
  errorTag: _71CC, title: 'Count each group carefully',
  teachingSteps: [
    'Pick one group at a time.',
    'Touch each item one time as you count.',
    'Do not count the same item twice.',
    'Do not skip any item.'
  ],
  teachingVisualRaw: _u7TvCountCategory(),
  correctAnswerExplanation: 'Count each item once. The total for the group is the count.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i71ReadTally() { return {
  errorTag: _71TC, title: 'Count the tally marks carefully',
  teachingSteps: [
    'Look at the marks one at a time.',
    'Each straight line is 1.',
    'Four straight marks and one slash make 5.',
    'Count each whole 5, then add any extra straight marks.'
  ],
  teachingVisualRaw: _u7TvReadTally(),
  correctAnswerExplanation: 'Count each mark once: every straight line is 1, and a slash across 4 lines makes 5.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i71TallyChartMatch() { return {
  errorTag: _71DR, title: 'Match the tally chart to the items',
  teachingSteps: [
    'Look at the items. Count each group.',
    'Look at each chart row — count the tally marks.',
    'Find the chart where every row has the same count as the items.',
    'Each row must match — not just one.'
  ],
  teachingVisualRaw: _u7TvTallyChartMatch(),
  correctAnswerExplanation: 'A matching chart has the same count for every category — not just one.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i71TChartColumns() { return {
  errorTag: _71TX, title: 'Read the T-chart heading first',
  teachingSteps: [
    'A T-chart has two columns. Each column has its own heading.',
    'Read the LEFT heading. Read the RIGHT heading.',
    'Look at the item.',
    'Put the item under the heading that matches what it IS.'
  ],
  teachingVisualRaw: _u7TvTChartColumns(),
  correctAnswerExplanation: 'Match the item to the column heading that describes it.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i71SortingRule() { return {
  errorTag: _71SR, title: 'Find what every item shares',
  teachingSteps: [
    'Look at the first group. What is the same about every item there?',
    'Look at the next group. The items are different from group 1 — but the SAME as each other.',
    'The thing that changes between groups is the sorting rule.',
    'A rule that does not describe every item in a group is not the right rule.'
  ],
  teachingVisualRaw: _u7TvSortingRule(),
  correctAnswerExplanation: 'The sorting rule is the feature every item in a group shares — and the next group has a different version of that feature.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i71GeneralSort() { return {
  errorTag: _71IM, title: 'Check the item, the count, and the rule',
  teachingSteps: [
    'Check 1: is each item in the right group?',
    'Check 2: is each group counted right?',
    'Check 3: does the rule fit every item in every group?',
    'If even one check fails, the answer is wrong.'
  ],
  teachingVisualRaw: _u7TvGeneralSort(),
  correctAnswerExplanation: 'A correct sort has every item in the right group, every count correct, and a rule that fits all groups.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L7.1 question factory helpers ────────────────────────────────────────────
// Place the correct option at slot aIdx, distractors fill the rest (preserves
// distractor order). Returns a fresh 4-element array. (Mirrors _u6Place.)
function _u7Place(opts, aIdx) {
  var correct = opts[0];
  var rest = opts.slice(1);
  var out = rest.slice();
  out.splice(aIdx, 0, correct);
  return out;
}

// Pick the 3 categories that are NOT the target.
function _u7OtherCats(targetCat) {
  return _U7_CATEGORIES.filter(function(c){ return c !== targetCat; });
}

// ── L7.1 question factory functions ──────────────────────────────────────────

// _q71Sort2Cat — C1: 4 items shown sorted into 2 mats. Ask the count of one category.
// items: { catA: [itemNames], catB: [itemNames] }
// askCat: which category's count is being asked
function _q71Sort2Cat(catA, catB, itemsA, itemsB, askCat, diff, aIdx) {
  var groups = [
    {label: catA, items: itemsA},
    {label: catB, items: itemsB}
  ];
  var correct = (askCat === catA) ? itemsA.length : itemsB.length;
  var other   = (askCat === catA) ? itemsB.length : itemsA.length;
  var total   = itemsA.length + itemsB.length;
  var opts = [
    {val: String(correct)},
    {val: String(other),         tag: _71WC},
    {val: String(total),         tag: _71CC},
    {val: String(Math.max(0, correct - 1)), tag: _71CC}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the sorted items. How many ' + askCat + ' are there?',
    s: _u7SortingMat(groups),
    o: opts, a: aIdx,
    e: 'The ' + askCat + ' group has ' + correct + ' items. Touch each one and count: 1, 2, 3...',
    d: diff,
    h: 'Find the ' + askCat + ' label, then count just the items under that label.',
    sk: 'sort_and_organize_data',
    i: _i71CountCategory()
  };
}

// _q71Sort3Cat — C2: 3-category variant. Same skill, larger mat.
function _q71Sort3Cat(catA, catB, catC, itemsA, itemsB, itemsC, askCat, diff, aIdx) {
  var groups = [
    {label: catA, items: itemsA},
    {label: catB, items: itemsB},
    {label: catC, items: itemsC}
  ];
  var counts = {};
  counts[catA] = itemsA.length;
  counts[catB] = itemsB.length;
  counts[catC] = itemsC.length;
  var correct = counts[askCat];
  var others  = Object.keys(counts).filter(function(c){ return c !== askCat; });
  var total = itemsA.length + itemsB.length + itemsC.length;
  var opts = [
    {val: String(correct)},
    {val: String(counts[others[0]]), tag: _71WC},
    {val: String(counts[others[1]]), tag: _71WC},
    {val: String(total),             tag: _71CC}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the sorted items. How many ' + askCat + ' are there?',
    s: _u7SortingMat(groups),
    o: opts, a: aIdx,
    e: 'The ' + askCat + ' group has ' + correct + ' items. The other groups belong to different categories.',
    d: diff,
    h: 'Find the ' + askCat + ' label, then count only the items under that label.',
    sk: 'sort_and_organize_data',
    i: _i71CountCategory()
  };
}

// _q71MatchItemToCategory — C3: single item + 4 category options.
function _q71MatchItemToCategory(itemName, diff, aIdx) {
  var correctCat = _U7_ITEM_CAT[itemName];
  var others = _u7OtherCats(correctCat);
  var opts = [
    {val: correctCat},
    {val: others[0], tag: _71WC},
    {val: others[1], tag: _71WC},
    {val: others[2], tag: _71IM}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Where does this item belong? Pick its category.',
    s: _u7ItemFocus(itemName),
    o: opts, a: aIdx,
    e: 'A ' + _U7_ITEM_NAME[itemName] + ' belongs in the ' + correctCat + ' category.',
    d: diff,
    h: 'Think about what kind of thing the item is. Then pick the category that describes it.',
    sk: 'sort_and_organize_data',
    i: _i71MatchCategory()
  };
}

// _q71CountInCategory — C4: pre-sorted mat shown; pick the count of one category.
function _q71CountInCategory(groups, askCat, diff, aIdx) {
  var target = groups.find(function(g){ return g.label === askCat; });
  var correct = target.items.length;
  // Distractors: other group counts + an off-by-one
  var otherCounts = groups.filter(function(g){ return g.label !== askCat; })
    .map(function(g){ return g.items.length; });
  var off = Math.max(0, correct + (correct >= 2 ? -1 : 1));
  var distractors = [];
  for (var i = 0; i < otherCounts.length && distractors.length < 2; i++) {
    if (otherCounts[i] !== correct) distractors.push(otherCounts[i]);
  }
  while (distractors.length < 2) distractors.push(correct + 2);
  var opts = [
    {val: String(correct)},
    {val: String(distractors[0]), tag: _71WC},
    {val: String(distractors[1]), tag: _71WC},
    {val: String(off),            tag: _71CC}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the sorted chart. How many items are in the ' + askCat + ' group?',
    s: _u7SortingMat(groups),
    o: opts, a: aIdx,
    e: 'Touch each item under the ' + askCat + ' label. There are ' + correct + '.',
    d: diff,
    h: 'Find the row labeled ' + askCat + '. Count the items there one at a time.',
    sk: 'sort_and_organize_data',
    i: _i71CountCategory()
  };
}

// _q71ReadTally — C5: tally marks shown; pick the number.
function _q71ReadTally(n, diff, aIdx) {
  var off = (n > 1) ? n - 1 : n + 1;
  var groupErr = (n >= 5) ? n - 1 : n + 1;  // forgot to count the slash, or counted it twice
  var farOff = (n >= 4) ? Math.max(1, n - 3) : n + 3;
  var opts = [
    {val: String(n)},
    {val: String(off),     tag: _71TC},
    {val: String(groupErr), tag: _71TG},
    {val: String(farOff),  tag: _71TC}
  ];
  // De-duplicate (rare when small n)
  var seen = {};
  opts = opts.filter(function(o){
    if (seen[o.val]) return false;
    seen[o.val] = true;
    return true;
  });
  while (opts.length < 4) {
    var fill = String(n + opts.length + 2);
    if (!seen[fill]) { opts.push({val: fill, tag: _71TC}); seen[fill] = true; }
    else opts.push({val: String(parseInt(fill) + 5), tag: _71TC});
  }
  opts = _u7Place(opts, aIdx);
  return {
    t: 'How many tally marks are shown?',
    s: '<div style="text-align:center;padding:10px 0">' + _u7TallyN(n) + '</div>',
    o: opts, a: aIdx,
    e: 'There are ' + n + ' tally marks. ' + (n >= 5
        ? 'Four straight marks and one slash make 5; ' + (n === 5 ? 'that is the whole count.'
          : 'then add ' + (n - 5) + ' more — that makes ' + n + '.')
        : 'Count each straight mark: ' + n + ' in all.'),
    d: diff,
    h: 'Four lines with a slash across them = 5. Add any extra lines after.',
    sk: 'sort_and_organize_data',
    i: _i71ReadTally()
  };
}

// _q71MatchTallyChart — C6: imgChoice. Given a sorted item set, pick the tally
// chart that matches. Cards are equal-size (reuses L6.4's imgChoice engine).
//
// Source data (the sorted items themselves) is rendered as a "Sorted items"
// card embedded INSIDE the prompt via _qText's raw-HTML escape hatch — without
// this, imgChoice would only show the 4 picture choices with no source data to
// compare (q.s is discarded by quiz.js's imgChoice render path). A hidden
// <svg> sentinel in the prompt triggers raw-HTML mode (_qText returns the
// string as-is when it contains the literal substring "<svg"). q.s also
// includes the source card for review-mode and the no-imgChoice fallback.
function _q71MatchTallyChart(catA, catB, itemsA, itemsB, diff, aIdx) {
  var groups = [
    {label: catA, items: itemsA},
    {label: catB, items: itemsB}
  ];
  var correctRows = [
    {label: catA, count: itemsA.length},
    {label: catB, count: itemsB.length}
  ];
  // Build 4 chart options: correct + 3 distractors with subtle wrong counts.
  // All counts stay ≥ 1 so no tally row renders as "(0)".
  var alts = [
    [{label: catA, count: itemsA.length + 1}, {label: catB, count: itemsB.length}],     // catA count off by +1
    [{label: catA, count: itemsA.length},     {label: catB, count: itemsB.length + 1}], // catB count off by +1
    [{label: catB, count: itemsA.length},     {label: catA, count: itemsB.length}]      // labels swapped
  ];
  var slotRows = alts.slice();
  slotRows.splice(aIdx, 0, correctRows);
  var letters = ['A', 'B', 'C', 'D'];
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var svgs   = slotRows.map(function(rows){ return _u7TallyChartForChoice(rows); });

  // ── Source-data card ───────────────────────────────────────────────────────
  // Shown above the 4 tappable tally-chart cards. Uses _u7SortingMat (the
  // same widget used by C2/C8 source visuals) so the visual language is
  // consistent across the lesson: bordered category boxes, labeled header,
  // emoji item row. The amber wrapper distinguishes "source data" from the
  // white tally-chart answer cards below.
  var sourceCard =
    '<div style="background:#FFF8E1;border:2px solid #FFB300;border-radius:10px;' +
      'padding:8px 8px 6px;margin:8px auto 4px;max-width:520px">' +
      '<div style="font-size:13px;font-weight:bold;color:#5a7080;text-align:center;' +
        'margin-bottom:4px;font-family:Nunito,sans-serif">⭐ Sorted items</div>' +
      _u7SortingMat(groups) +
    '</div>';

  // Fallback (review mode / no imgChoice): inline 4 mini-charts side-by-side
  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:6px;padding:4px 0">' +
    slotRows.map(function(rows, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:160px;' +
        'vertical-align:top">' +
        '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:3px">' +
          letters[i] + '</div>' +
        _u7TallyChartForChoice(rows) +
      '</div>';
    }).join('') +
  '</div>';
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _71DR};
  });

  // Prompt: question text + hidden <svg> sentinel + source-data card. The
  // sentinel (display:none, 0×0) is the trigger that makes _qText() return
  // the string as raw HTML instead of escaping it; without the literal
  // substring "<svg" the sortingmat below would render as visible angle-
  // bracket text. The sentinel itself never paints anything.
  var promptHtml =
    'Which tally chart matches these sorted items? Tap a picture.' +
    '<svg width="0" height="0" aria-hidden="true" focusable="false" ' +
      'style="display:none;width:0;height:0"></svg>' +
    sourceCard;

  return {
    t: promptHtml,
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: sourceCard + fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + itemsA.length + ' tally marks for ' + catA +
       ' and ' + itemsB.length + ' for ' + catB + ' — matching the items exactly.',
    d: diff,
    h: 'Count the items in each group. Find the chart where each row has the same count.',
    sk: 'sort_and_organize_data',
    i: _i71TallyChartMatch()
  };
}

// _q71MatchTallyChart3 — 3-category C6 variant. Same source-data card + imgChoice
// design as the 2-category factory, but the sorting mat shows three groups and
// every tally-chart option has three rows. Distractors keep two rows correct
// and bump exactly one row by +1, so each wrong card differs from the correct
// card in a single locatable place (no label swaps — three labels would make a
// swap distractor too easy to spot).
function _q71MatchTallyChart3(catA, catB, catC, itemsA, itemsB, itemsC, diff, aIdx) {
  var groups = [
    {label: catA, items: itemsA},
    {label: catB, items: itemsB},
    {label: catC, items: itemsC}
  ];
  var correctRows = [
    {label: catA, count: itemsA.length},
    {label: catB, count: itemsB.length},
    {label: catC, count: itemsC.length}
  ];
  // 3 distractors: each bumps a different category by +1; the other two rows
  // stay correct. Counts stay ≥ 1 so no tally row renders as "(0)".
  var alts = [
    [{label: catA, count: itemsA.length + 1}, {label: catB, count: itemsB.length},     {label: catC, count: itemsC.length}],
    [{label: catA, count: itemsA.length},     {label: catB, count: itemsB.length + 1}, {label: catC, count: itemsC.length}],
    [{label: catA, count: itemsA.length},     {label: catB, count: itemsB.length},     {label: catC, count: itemsC.length + 1}]
  ];
  var slotRows = alts.slice();
  slotRows.splice(aIdx, 0, correctRows);
  var letters = ['A', 'B', 'C', 'D'];
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var svgs   = slotRows.map(function(rows){ return _u7TallyChartForChoice(rows); });

  var sourceCard =
    '<div style="background:#FFF8E1;border:2px solid #FFB300;border-radius:10px;' +
      'padding:8px 8px 6px;margin:8px auto 4px;max-width:520px">' +
      '<div style="font-size:13px;font-weight:bold;color:#5a7080;text-align:center;' +
        'margin-bottom:4px;font-family:Nunito,sans-serif">⭐ Sorted items</div>' +
      _u7SortingMat(groups) +
    '</div>';

  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:6px;padding:4px 0">' +
    slotRows.map(function(rows, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:160px;' +
        'vertical-align:top">' +
        '<div style="font-size:15px;font-weight:800;color:#333;margin-bottom:3px">' +
          letters[i] + '</div>' +
        _u7TallyChartForChoice(rows) +
      '</div>';
    }).join('') +
  '</div>';
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _71DR};
  });

  var promptHtml =
    'Which tally chart matches these sorted items? Tap a picture.' +
    '<svg width="0" height="0" aria-hidden="true" focusable="false" ' +
      'style="display:none;width:0;height:0"></svg>' +
    sourceCard;

  return {
    t: promptHtml,
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: sourceCard + fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + itemsA.length + ' for ' + catA + ', ' +
       itemsB.length + ' for ' + catB + ', and ' + itemsC.length + ' for ' + catC +
       ' — every row matches the items.',
    d: diff,
    h: 'Count the items in each group. Find the chart where every row matches.',
    sk: 'sort_and_organize_data',
    i: _i71TallyChartMatch()
  };
}

// _q71CompleteTChart — C7: T-chart with headings + items already placed. Ask
// which column a new item belongs in.
function _q71CompleteTChart(leftLabel, rightLabel, leftItems, rightItems, newItem, diff, aIdx) {
  var newItemCat = _U7_ITEM_CAT[newItem];
  var correctSide = (newItemCat === leftLabel) ? 'left' : 'right';
  var correctLabel = (correctSide === 'left') ? leftLabel : rightLabel;
  var wrongLabel   = (correctSide === 'left') ? rightLabel : leftLabel;
  var opts = [
    {val: 'The ' + correctLabel + ' column'},
    {val: 'The ' + wrongLabel + ' column', tag: _71TX},
    {val: 'Both columns',                  tag: _71WC},
    {val: 'Neither column',                tag: _71WC}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the T-chart. Where should the ' + _U7_ITEM_NAME[newItem] + ' ' +
       (_U7_ICONS[newItem] || '') + ' go?',
    s: _u7TChart(leftLabel, rightLabel, leftItems, rightItems),
    o: opts, a: aIdx,
    e: 'A ' + _U7_ITEM_NAME[newItem] + ' belongs in the ' + correctLabel + ' column because it is a ' + correctLabel.toLowerCase() + '-type item.',
    d: diff,
    h: 'Read both column headings. Decide which one describes the new item.',
    sk: 'sort_and_organize_data',
    i: _i71TChartColumns()
  };
}

// _q71IdentifyRule — C8: groups already sorted; pick what rule was used.
// Supports two rule modes: 'category' (Fruit/Animals/etc.) or 'color' (Red/Yellow/etc.)
function _q71IdentifyRule(groups, rule, ruleOptions, diff, aIdx) {
  // groups: [{label,items}] (visual)
  // rule: the correct rule string (e.g., "category", "color")
  // ruleOptions: 4 strings to show as choices, with the correct one at index 0
  var opts = [
    {val: ruleOptions[0]},
    {val: ruleOptions[1], tag: _71SR},
    {val: ruleOptions[2], tag: _71SR},
    {val: ruleOptions[3], tag: _71SR}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at how these items are grouped. What rule was used to sort them?',
    s: _u7SortingMat(groups),
    o: opts, a: aIdx,
    e: 'Every item in a group shares this feature: ' + ruleOptions[0].toLowerCase() + '. That is the sorting rule.',
    d: diff,
    h: 'Look at every item in one group. What do they ALL share? Then check the other group.',
    sk: 'sort_and_organize_data',
    i: _i71SortingRule()
  };
}

// _q71ErrorRepair — C9: a sorted mat with ONE misplaced item; pick the wrong one.
// groups: 2 or 3 groups; misplaced item is at the END of one group's items list.
function _q71ErrorRepair(groups, misplacedItem, supposedCat, actualCat, diff, aIdx) {
  // Build 4 item choices — the misplaced item + 3 correctly-placed items.
  // Correct answer: misplaced item.
  var correctItems = [];
  groups.forEach(function(g){
    g.items.forEach(function(it){
      if (it !== misplacedItem) correctItems.push(it);
    });
  });
  // Pick 3 distractor items at random-ish (use first 3 correct items).
  var distractors = correctItems.slice(0, 3);
  while (distractors.length < 3) distractors.push(correctItems[0] || 'apple');
  var labelFor = function(it){
    return _U7_ICONS[it] + ' ' + _U7_ITEM_NAME[it];
  };
  var opts = [
    {val: labelFor(misplacedItem)},
    {val: labelFor(distractors[0]), tag: _71IM},
    {val: labelFor(distractors[1]), tag: _71IM},
    {val: labelFor(distractors[2]), tag: _71IM}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'One item is in the wrong group. Which item is in the wrong place?',
    s: _u7SortingMat(groups),
    o: opts, a: aIdx,
    e: 'The ' + _U7_ITEM_NAME[misplacedItem] + ' is in the ' + supposedCat +
       ' group, but it is really a ' + actualCat.toLowerCase() + ' item.',
    d: diff,
    h: 'Read each group label. Check every item — does it really belong under that label?',
    sk: 'sort_and_organize_data',
    i: _i71MatchCategory()
  };
}

// _q71MixedReview — C10: tally chart shown; pick the count for a named category.
function _q71MixedReview(rows, askCat, diff, aIdx) {
  var target = rows.find(function(r){ return r.label === askCat; });
  var correct = target.count;
  var otherCounts = rows.filter(function(r){ return r.label !== askCat; })
    .map(function(r){ return r.count; });
  var off = Math.max(0, correct + (correct >= 2 ? -1 : 1));
  var distractors = [];
  for (var i = 0; i < otherCounts.length && distractors.length < 2; i++) {
    if (otherCounts[i] !== correct) distractors.push(otherCounts[i]);
  }
  while (distractors.length < 2) distractors.push(correct + 2);
  var opts = [
    {val: String(correct)},
    {val: String(distractors[0]), tag: _71DR},
    {val: String(distractors[1]), tag: _71CC},
    {val: String(off),            tag: _71TC}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the tally chart. How many ' + askCat + ' are there?',
    s: _u7TallyChart(rows),
    o: opts, a: aIdx,
    e: 'Find the ' + askCat + ' row. Count the tally marks: ' + correct + '.',
    d: diff,
    h: 'Find the row labeled ' + askCat + '. Read the tally marks: 4 lines with a slash = 5, then add the extras.',
    sk: 'sort_and_organize_data',
    i: _i71ReadTally()
  };
}

// ── L7.1 key ideas ────────────────────────────────────────────────────────────
var _l71KeyIdeas = [
  'Sorting means putting things into groups where everything in a group is alike in some way.',
  'The sorting rule tells you what makes a group — color, animal type, food type, sport, and so on.',
  'After sorting, count each group to know how many items it has.',
  'Tally marks are a quick way to count: one straight mark stands for 1, and four marks with a slash across them stand for 5.',
  'A T-chart has two columns; a three-column chart has three. Each column gets its own label for one category.',
  'Organized data is easier to read and answer questions about than a messy pile of items.'
];

// ── L7.1 worked examples ──────────────────────────────────────────────────────
var _l71Examples = [
  {
    id: 'g1-u7-l1-ex-1',
    title: 'Example 1: Sort into 2 categories',
    prompt: 'Sort these items into Fruit and Animals.',
    visual: {type: 'rawHtml', html: _u7Pile(['apple', 'cat', 'banana', 'dog']) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ sort ↓</div>' +
      _u7SortingMat([
        {label: 'Fruit',   items: ['apple', 'banana']},
        {label: 'Animals', items: ['cat',   'dog']}
      ])},
    steps: [
      'Look at each item.',
      'Apple and banana are fruit — put them under Fruit.',
      'Cat and dog are animals — put them under Animals.',
      'Now count each group: 2 fruits and 2 animals.'
    ],
    finalAnswer: '2 Fruit + 2 Animals — sorted.'
  },
  {
    id: 'g1-u7-l1-ex-2',
    title: 'Example 2: Sort into 3 categories',
    prompt: 'Sort these items into Animals, Toys, and Nature.',
    visual: {type: 'rawHtml', html: _u7Pile(['cat', 'ball', 'star', 'dog', 'car', 'sun']) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ sort ↓</div>' +
      _u7SortingMat([
        {label: 'Animals', items: ['cat', 'dog']},
        {label: 'Toys',    items: ['ball', 'car']},
        {label: 'Nature',  items: ['star', 'sun']}
      ])},
    steps: [
      'Each item fits one of three groups.',
      'Cat and dog go in Animals.',
      'Ball and car go in Toys.',
      'Star and sun go in Nature.',
      'Each group has 2 items.'
    ],
    finalAnswer: '2 in each group: Animals = 2, Toys = 2, Nature = 2.'
  },
  {
    id: 'g1-u7-l1-ex-3',
    title: 'Example 3: Make a tally chart',
    prompt: 'Make a tally chart from sorted items.',
    visual: {type: 'rawHtml', html: _u7SortingMat([
      {label: 'Fruit',   items: ['apple','apple','banana']},
      {label: 'Animals', items: ['cat','dog']}
    ]) + '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ tally ↓</div>' +
      _u7TallyChart([
        {label: 'Fruit',   count: 3},
        {label: 'Animals', count: 2}
      ])},
    steps: [
      'Count each group of items first.',
      'Fruit has 3 items — draw 3 tally marks in the Fruit row.',
      'Animals has 2 items — draw 2 tally marks in the Animals row.',
      'Each tally mark stands for one item.'
    ],
    finalAnswer: 'Fruit row: 3 tallies. Animals row: 2 tallies.'
  },
  {
    id: 'g1-u7-l1-ex-4',
    title: 'Example 4: Complete a T-chart',
    prompt: 'The T-chart has headings Fruit and Toys. Where does the orange go?',
    visual: {type: 'rawHtml', html: _u7TChart('Fruit', 'Toys', ['apple', 'banana'], ['ball', 'car']) +
      '<div style="text-align:center;margin-top:8px;font-size:14px;color:#37474F">New item: ' +
      _u7ItemFocus('orange') + '</div>'},
    steps: [
      'Read the LEFT heading: Fruit.',
      'Read the RIGHT heading: Toys.',
      'An orange is a fruit, not a toy.',
      'Put the orange in the Fruit column.'
    ],
    finalAnswer: 'Orange goes in the Fruit column.'
  },
  {
    id: 'g1-u7-l1-ex-5',
    title: 'Example 5: Find the sorting rule',
    prompt: 'How were these items sorted?',
    visual: {type: 'rawHtml', html: _u7SortingMat([
      {label: 'Fruit',   items: ['apple','banana','orange']},
      {label: 'Animals', items: ['cat','dog','fish']}
    ])},
    steps: [
      'Look at the first group: apple, banana, orange — all fruit.',
      'Look at the second group: cat, dog, fish — all animals.',
      'Every item in a group is the same kind of thing.',
      'The rule is: sort by category (what kind of thing each item is).'
    ],
    finalAnswer: 'Sorted by category (Fruit vs. Animals).'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L7.1 question banks (10 categories, 150 total)
//  Target: 50E / 60M / 40H
//  C1 sort-2(15) + C2 sort-3(16) + C3 match-item(18) + C4 count(15) +
//  C5 tally-read(18) + C6 chart-match(15) + C7 t-chart(15) +
//  C8 rule(14) + C9 repair(12) + C10 mixed(12)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Sort into 2 categories — count one (15 = 8E / 5M / 2H) ───────────────
var _l71C1 = [
  // Easy (8) — 2 items per group, simple counts
  _q71Sort2Cat('Fruit','Animals',  ['apple','banana'],          ['cat','dog'],          'Fruit',  'e', 0),
  _q71Sort2Cat('Fruit','Toys',     ['apple','banana','orange'], ['ball','car'],         'Toys',   'e', 1),
  _q71Sort2Cat('Animals','Toys',   ['cat','dog'],               ['ball','car','kite'],  'Animals','e', 2),
  _q71Sort2Cat('Fruit','Nature',   ['apple','banana'],          ['flower','star','sun'],'Nature', 'e', 3),
  _q71Sort2Cat('Toys','Nature',    ['car','kite'],              ['flower','leaf'],      'Toys',   'e', 0),
  _q71Sort2Cat('Animals','Nature', ['cat','dog','fish'],        ['sun','leaf'],         'Animals','e', 1),
  _q71Sort2Cat('Fruit','Animals',  ['grapes','orange'],         ['rabbit','fish'],      'Fruit',  'e', 2),
  _q71Sort2Cat('Toys','Animals',   ['die','ball'],              ['cat','rabbit','dog'], 'Animals','e', 3),
  // Medium (5) — 3 items per group
  _q71Sort2Cat('Fruit','Toys',     ['apple','banana','grapes'], ['ball','kite','die'],  'Fruit',  'm', 0),
  _q71Sort2Cat('Animals','Nature', ['cat','dog','rabbit'],      ['flower','star','sun'],'Nature', 'm', 1),
  _q71Sort2Cat('Fruit','Nature',   ['apple','orange','grapes'], ['leaf','sun','flower'],'Fruit',  'm', 2),
  _q71Sort2Cat('Toys','Animals',   ['car','kite','die','ball'], ['fish','rabbit'],      'Toys',   'm', 3),
  _q71Sort2Cat('Fruit','Animals',  ['apple','grapes'],          ['cat','dog','rabbit','fish'], 'Animals','m', 0),
  // Hard (2)
  _q71Sort2Cat('Fruit','Toys',     ['apple','banana','orange','grapes'], ['ball','car','kite','die'],'Fruit','h', 3),
  _q71Sort2Cat('Animals','Nature', ['cat','dog','fish','rabbit'],        ['flower','star','sun','leaf'],'Nature','h', 0)
];

// ── C2: Sort into 3 categories — count one (16 = 5E / 8M / 3H) ───────────────
var _l71C2 = [
  // Easy (5)
  _q71Sort3Cat('Fruit','Animals','Toys',  ['apple','banana'],['cat','dog'],['ball','car'],            'Fruit',  'e', 0),
  _q71Sort3Cat('Fruit','Animals','Nature',['apple'],['cat','dog','fish'],['sun','leaf'],              'Animals','e', 1),
  _q71Sort3Cat('Toys','Nature','Animals', ['ball','car'],['flower','star'],['rabbit','cat'],         'Nature', 'e', 2),
  _q71Sort3Cat('Fruit','Toys','Nature',   ['grapes','orange'],['kite','die','ball'],['leaf','sun'],   'Toys',   'e', 3),
  _q71Sort3Cat('Animals','Toys','Fruit',  ['cat','dog'],['ball','kite'],['apple','grapes'],           'Animals','e', 0),
  // Medium (8)
  _q71Sort3Cat('Fruit','Animals','Toys',  ['apple','banana','orange'],['cat','dog'],['ball','car','kite'],'Animals','m', 1),
  _q71Sort3Cat('Fruit','Nature','Toys',   ['grapes','apple'],['sun','star','leaf'],['die','car'],     'Nature', 'm', 2),
  _q71Sort3Cat('Animals','Nature','Fruit',['cat','rabbit','dog'],['flower','leaf'],['banana','orange'],'Animals','m',3),
  _q71Sort3Cat('Toys','Animals','Nature', ['ball','car','kite'],['fish','dog'],['sun','flower','star'],'Nature','m',0),
  _q71Sort3Cat('Fruit','Toys','Animals',  ['apple','banana','grapes'],['die','ball'],['cat','rabbit','fish'],'Fruit','m',1),
  _q71Sort3Cat('Animals','Toys','Nature', ['dog','fish'],['kite','die','car'],['leaf','flower','sun'],'Toys','m', 2),
  _q71Sort3Cat('Fruit','Animals','Nature',['orange','grapes','apple'],['cat','dog'],['leaf','flower','sun'],'Animals','m', 3),
  _q71Sort3Cat('Toys','Nature','Fruit',   ['ball','kite'],['flower','star','leaf'],['banana','apple'],'Fruit','m',0),
  // Hard (3)
  _q71Sort3Cat('Fruit','Animals','Toys',  ['apple','banana','orange','grapes'],['cat','dog','rabbit'],['ball','car','kite','die'],'Fruit','h',2),
  _q71Sort3Cat('Animals','Nature','Toys', ['cat','dog','rabbit','fish'],['sun','flower','leaf'],['die','ball','car'],'Animals','h',1),
  _q71Sort3Cat('Fruit','Toys','Nature',   ['banana','apple'],['ball','car','kite','die'],['flower','star','sun','leaf'],'Nature','h',0)
];

// ── C3: Match item to category (18 = 10E / 6M / 2H) ──────────────────────────
var _l71C3 = [
  // Easy (10) — one per item across the 16 items + 2 favorites
  _q71MatchItemToCategory('apple',  'e', 0), _q71MatchItemToCategory('cat',    'e', 1),
  _q71MatchItemToCategory('ball',   'e', 2), _q71MatchItemToCategory('flower', 'e', 3),
  _q71MatchItemToCategory('banana', 'e', 0), _q71MatchItemToCategory('dog',    'e', 1),
  _q71MatchItemToCategory('car',    'e', 2), _q71MatchItemToCategory('star',   'e', 3),
  _q71MatchItemToCategory('orange', 'e', 0), _q71MatchItemToCategory('fish',   'e', 1),
  // Medium (6)
  _q71MatchItemToCategory('grapes', 'm', 2), _q71MatchItemToCategory('rabbit', 'm', 3),
  _q71MatchItemToCategory('kite',   'm', 0), _q71MatchItemToCategory('sun',    'm', 1),
  _q71MatchItemToCategory('die',    'm', 2), _q71MatchItemToCategory('leaf',   'm', 3),
  // Hard (2)
  _q71MatchItemToCategory('rabbit', 'h', 1), _q71MatchItemToCategory('die',    'h', 0)
];

// ── C4: Count items in a category (15 = 8E / 5M / 2H) ────────────────────────
var _l71C4 = [
  // Easy (8)
  _q71CountInCategory([{label:'Fruit',items:['apple','banana']},{label:'Animals',items:['cat']}],          'Fruit',  'e', 0),
  _q71CountInCategory([{label:'Fruit',items:['apple']},          {label:'Toys',   items:['ball','car']}],   'Toys',   'e', 1),
  _q71CountInCategory([{label:'Animals',items:['cat','dog']},    {label:'Nature', items:['leaf']}],         'Animals','e', 2),
  _q71CountInCategory([{label:'Toys',items:['kite','die']},      {label:'Fruit',  items:['orange']}],       'Toys',   'e', 3),
  _q71CountInCategory([{label:'Nature',items:['sun','flower']},  {label:'Animals',items:['fish','rabbit']}],'Nature', 'e', 0),
  _q71CountInCategory([{label:'Fruit',items:['apple','grapes','banana']},{label:'Toys',items:['ball']}],    'Fruit',  'e', 1),
  _q71CountInCategory([{label:'Animals',items:['rabbit']},       {label:'Nature', items:['leaf','star']}],  'Nature', 'e', 2),
  _q71CountInCategory([{label:'Toys',items:['car','die']},       {label:'Animals',items:['dog','fish','cat']}],'Animals','e', 3),
  // Medium (5)
  _q71CountInCategory([{label:'Fruit',items:['apple','banana','orange','grapes']},{label:'Toys',items:['ball','car']}],'Fruit','m', 0),
  _q71CountInCategory([{label:'Animals',items:['cat','dog','rabbit','fish']},{label:'Nature',items:['sun','leaf']}],   'Animals','m', 1),
  _q71CountInCategory([{label:'Toys',items:['ball','car','kite','die']},      {label:'Fruit', items:['apple','banana']}],'Toys','m', 2),
  _q71CountInCategory([{label:'Nature',items:['flower','star','sun','leaf']}, {label:'Animals',items:['cat','dog']}],   'Nature','m', 3),
  _q71CountInCategory([{label:'Fruit',items:['orange','apple']},              {label:'Animals',items:['rabbit','dog','fish']}],'Animals','m', 0),
  // Hard (2)
  _q71CountInCategory([{label:'Fruit',items:['apple','banana','orange','grapes']},{label:'Animals',items:['cat','dog','rabbit','fish']}],'Fruit','h', 2),
  _q71CountInCategory([{label:'Toys',items:['ball','car','kite','die']},{label:'Nature',items:['sun','star','flower','leaf']}],'Nature','h', 3)
];

// ── C5: Read tally marks (18 = 8E / 8M / 2H) ─────────────────────────────────
var _l71C5 = [
  // Easy (8) — counts 1-4 (no slash yet) and 5 (one full group)
  _q71ReadTally(1, 'e', 0), _q71ReadTally(2, 'e', 1),
  _q71ReadTally(3, 'e', 2), _q71ReadTally(4, 'e', 3),
  _q71ReadTally(2, 'e', 0), _q71ReadTally(3, 'e', 1),
  _q71ReadTally(4, 'e', 2), _q71ReadTally(5, 'e', 3),
  // Medium (8) — counts 5-9 (one full group + extras)
  _q71ReadTally(5, 'm', 0), _q71ReadTally(6, 'm', 1),
  _q71ReadTally(7, 'm', 2), _q71ReadTally(8, 'm', 3),
  _q71ReadTally(6, 'm', 0), _q71ReadTally(7, 'm', 1),
  _q71ReadTally(8, 'm', 2), _q71ReadTally(9, 'm', 3),
  // Hard (2) — counts 9-10
  _q71ReadTally(9,  'h', 0), _q71ReadTally(10, 'h', 1)
];

// ── C6: Match tally chart to sorted objects (imgChoice) (15 = 4E / 7M / 4H) ──
var _l71C6 = [
  // Easy (4)
  _q71MatchTallyChart('Fruit','Animals',['apple','banana'],['cat'],                 'e', 0),
  _q71MatchTallyChart('Toys','Nature',  ['ball','car'],     ['sun','leaf'],         'e', 1),
  _q71MatchTallyChart('Animals','Fruit',['cat','dog','rabbit'],['orange'],          'e', 2),
  _q71MatchTallyChart('Fruit','Toys',   ['apple'],          ['ball','kite'],        'e', 3),
  // Medium (7)
  _q71MatchTallyChart('Fruit','Animals',['apple','banana','orange'],['cat','dog'],  'm', 0),
  _q71MatchTallyChart('Toys','Nature',  ['ball','car','kite'],      ['sun','star'], 'm', 1),
  _q71MatchTallyChart('Animals','Toys', ['cat','dog'],              ['kite','die','ball'],'m', 2),
  _q71MatchTallyChart('Nature','Fruit', ['flower','sun','leaf'],    ['banana','grapes'],  'm', 3),
  _q71MatchTallyChart('Fruit','Animals',['apple','banana','grapes','orange'],['rabbit','fish'],'m', 0),
  _q71MatchTallyChart('Toys','Nature',  ['die','car'],              ['flower','star','sun','leaf'],'m', 1),
  // 3-category Medium: 2+1+2 items across Fruit/Animals/Toys.
  _q71MatchTallyChart3('Fruit','Animals','Toys',
    ['apple','banana'], ['cat'], ['ball','car'],
    'm', 2),
  // Hard (4)
  _q71MatchTallyChart('Fruit','Toys',   ['apple','banana','orange','grapes'],['ball','car','kite'],'h', 3),
  _q71MatchTallyChart('Animals','Nature',['cat','dog','rabbit','fish'],['flower','star','sun','leaf'],'h', 0),
  _q71MatchTallyChart('Toys','Animals', ['ball','car','kite','die'],['cat','dog','rabbit','fish'],'h', 1),
  // 3-category Hard: 3+2+2 items across Animals/Fruit/Nature.
  _q71MatchTallyChart3('Animals','Fruit','Nature',
    ['cat','dog','rabbit'], ['apple','banana'], ['flower','sun'],
    'h', 2)
];

// ── C7: Complete a T-chart (15 = 3E / 7M / 5H) ───────────────────────────────
var _l71C7 = [
  // Easy (3)
  _q71CompleteTChart('Fruit','Animals',  ['apple','banana'], ['cat'],         'orange', 'e', 0),
  _q71CompleteTChart('Toys','Nature',    ['ball','car'],     ['sun'],         'flower', 'e', 1),
  _q71CompleteTChart('Animals','Fruit',  ['cat','dog'],      ['apple'],       'rabbit', 'e', 2),
  // Medium (7)
  _q71CompleteTChart('Fruit','Toys',     ['apple','grapes'], ['ball','kite'], 'banana', 'm', 3),
  _q71CompleteTChart('Animals','Nature', ['dog','fish'],     ['star','leaf'], 'flower', 'm', 0),
  _q71CompleteTChart('Toys','Fruit',     ['car','die'],      ['banana'],      'kite',   'm', 1),
  _q71CompleteTChart('Nature','Animals', ['sun','flower'],   ['cat','fish'],  'leaf',   'm', 2),
  _q71CompleteTChart('Fruit','Animals',  ['orange','apple'], ['rabbit','dog'],'banana', 'm', 3),
  _q71CompleteTChart('Toys','Nature',    ['ball','kite'],    ['leaf','star'], 'die',    'm', 0),
  _q71CompleteTChart('Animals','Toys',   ['cat','rabbit'],   ['car','die'],   'ball',   'm', 1),
  // Hard (5)
  _q71CompleteTChart('Fruit','Animals',  ['apple','banana','orange'],['cat','dog','rabbit'],'grapes','h', 2),
  _q71CompleteTChart('Toys','Nature',    ['ball','car','kite'],      ['sun','flower','star'],'leaf', 'h', 3),
  _q71CompleteTChart('Animals','Fruit',  ['cat','dog','fish'],       ['apple','banana','grapes'],'rabbit','h', 0),
  _q71CompleteTChart('Nature','Toys',    ['flower','star','sun'],    ['ball','car','die'],   'kite', 'h', 1),
  _q71CompleteTChart('Fruit','Nature',   ['apple','grapes','orange'],['leaf','star','sun'],  'flower','h', 2)
];

// ── C8: Identify sorting rule (14 = 2E / 6M / 6H) ────────────────────────────
// All groups in this category are sorted by "what kind of thing" each item is.
// Rule options vary so the student must reason about which one DESCRIBES every item.
var _l71C8 = [
  // Easy (2) — two clearly distinct categories
  _q71IdentifyRule(
    [{label:'Fruit',items:['apple','banana','orange']},{label:'Animals',items:['cat','dog','rabbit']}],
    'category',
    ['By kind of thing (food vs. animal)','By color','By size','By how many'],
    'e', 0
  ),
  _q71IdentifyRule(
    [{label:'Toys',items:['ball','car','kite']},{label:'Nature',items:['flower','sun','leaf']}],
    'category',
    ['By kind of thing (toy vs. nature)','By color','By shape','By weight'],
    'e', 1
  ),
  // Medium (6)
  _q71IdentifyRule(
    [{label:'Animals',items:['cat','dog','fish']},{label:'Toys',items:['ball','car','kite']}],
    'category',
    ['By kind of thing (animal vs. toy)','By color','By size','By how many letters'],
    'm', 2
  ),
  _q71IdentifyRule(
    [{label:'Fruit',items:['apple','banana','grapes']},{label:'Nature',items:['flower','star','leaf']}],
    'category',
    ['By kind of thing (fruit vs. nature)','By color','By shape','By age'],
    'm', 3
  ),
  _q71IdentifyRule(
    [{label:'Animals',items:['cat','rabbit']},{label:'Fruit',items:['apple','grapes']},{label:'Toys',items:['ball','car']}],
    'category',
    ['By kind of thing (animal, fruit, toy)','By color','By size','By how loud'],
    'm', 0
  ),
  _q71IdentifyRule(
    [{label:'Nature',items:['sun','leaf','star']},{label:'Toys',items:['die','kite','car']}],
    'category',
    ['By kind of thing (nature vs. toy)','By number of corners','By color','By smell'],
    'm', 1
  ),
  _q71IdentifyRule(
    [{label:'Fruit',items:['orange','grapes']},{label:'Animals',items:['fish','rabbit']}],
    'category',
    ['By kind of thing (fruit vs. animal)','By size','By color','By how heavy'],
    'm', 2
  ),
  _q71IdentifyRule(
    [{label:'Toys',items:['ball','die','kite']},{label:'Animals',items:['cat','dog','fish']},{label:'Fruit',items:['apple','banana','orange']}],
    'category',
    ['By kind of thing (toy, animal, fruit)','By color','By size','By age'],
    'm', 3
  ),
  // Hard (6)
  _q71IdentifyRule(
    [{label:'Fruit',items:['apple','banana','orange','grapes']},{label:'Animals',items:['cat','dog','rabbit','fish']}],
    'category',
    ['By kind of thing (fruit vs. animal)','By color','By size','By letter the name starts with'],
    'h', 0
  ),
  _q71IdentifyRule(
    [{label:'Toys',items:['ball','car','kite','die']},{label:'Nature',items:['flower','star','sun','leaf']}],
    'category',
    ['By kind of thing (toy vs. nature)','By how many corners','By color','By how heavy'],
    'h', 1
  ),
  _q71IdentifyRule(
    [{label:'Animals',items:['cat','dog','rabbit','fish']},{label:'Nature',items:['flower','star','sun','leaf']}],
    'category',
    ['By kind of thing (animal vs. nature)','By color','By age','By size'],
    'h', 2
  ),
  _q71IdentifyRule(
    [{label:'Fruit',items:['banana','orange','grapes']},{label:'Toys',items:['ball','car','die']},{label:'Animals',items:['cat','dog','fish']}],
    'category',
    ['By kind of thing (fruit, toy, animal)','By size','By color','By smell'],
    'h', 3
  ),
  _q71IdentifyRule(
    [{label:'Animals',items:['cat','dog','rabbit']},{label:'Nature',items:['flower','star','leaf']},{label:'Toys',items:['ball','die','kite']}],
    'category',
    ['By kind of thing (animal, nature, toy)','By color','By letter','By how loud'],
    'h', 0
  ),
  _q71IdentifyRule(
    [{label:'Fruit',items:['apple','banana','orange']},{label:'Animals',items:['cat','dog','rabbit']},{label:'Nature',items:['sun','flower','leaf']}],
    'category',
    ['By kind of thing (fruit, animal, nature)','By color','By how many corners','By size'],
    'h', 1
  )
];

// ── C9: Error repair — one item in the wrong group (12 = 1E / 4M / 7H) ───────
// In each question, the LAST item in one group is misplaced (belongs to a
// different category). Student picks the misplaced item from the visible set.
var _l71C9 = [
  // Easy (1) — only 2 items in the off group, very clear error
  _q71ErrorRepair(
    [{label:'Fruit',items:['apple','banana','cat']},{label:'Animals',items:['dog']}],
    'cat', 'Fruit', 'Animals', 'e', 0
  ),
  // Medium (4)
  _q71ErrorRepair(
    [{label:'Animals',items:['cat','dog','ball']},{label:'Toys',items:['car','kite']}],
    'ball', 'Animals', 'Toys', 'm', 1
  ),
  _q71ErrorRepair(
    [{label:'Fruit',items:['apple','grapes','sun']},{label:'Nature',items:['flower','leaf']}],
    'sun', 'Fruit', 'Nature', 'm', 2
  ),
  _q71ErrorRepair(
    [{label:'Toys',items:['ball','die','rabbit']},{label:'Animals',items:['cat','dog']}],
    'rabbit', 'Toys', 'Animals', 'm', 3
  ),
  _q71ErrorRepair(
    [{label:'Nature',items:['flower','star','orange']},{label:'Fruit',items:['apple','banana']}],
    'orange', 'Nature', 'Fruit', 'm', 0
  ),
  // Hard (7)
  _q71ErrorRepair(
    [{label:'Fruit',items:['apple','banana','orange','dog']},{label:'Animals',items:['cat','rabbit']}],
    'dog', 'Fruit', 'Animals', 'h', 3
  ),
  _q71ErrorRepair(
    [{label:'Toys',items:['ball','car','kite','sun']},{label:'Nature',items:['leaf','flower']}],
    'sun', 'Toys', 'Nature', 'h', 0
  ),
  _q71ErrorRepair(
    [{label:'Animals',items:['cat','dog','rabbit','grapes']},{label:'Fruit',items:['apple','banana']}],
    'grapes', 'Animals', 'Fruit', 'h', 1
  ),
  _q71ErrorRepair(
    [{label:'Nature',items:['flower','star','leaf','die']},{label:'Toys',items:['ball','car']}],
    'die', 'Nature', 'Toys', 'h', 2
  ),
  _q71ErrorRepair(
    [{label:'Fruit',items:['apple','orange','fish']},{label:'Animals',items:['cat','dog','rabbit']}],
    'fish', 'Fruit', 'Animals', 'h', 3
  ),
  _q71ErrorRepair(
    [{label:'Toys',items:['ball','die','flower']},{label:'Nature',items:['sun','star','leaf']}],
    'flower', 'Toys', 'Nature', 'h', 0
  ),
  _q71ErrorRepair(
    [{label:'Animals',items:['cat','rabbit','banana']},{label:'Fruit',items:['apple','grapes','orange']}],
    'banana', 'Animals', 'Fruit', 'h', 1
  )
];

// ── C10: Mixed review — read tally chart (12 = 1E / 4M / 7H) ─────────────────
var _l71C10 = [
  // Easy (1)
  _q71MixedReview([{label:'Fruit',count:2},{label:'Animals',count:3}],'Animals','e', 0),
  // Medium (4)
  _q71MixedReview([{label:'Fruit',count:4},{label:'Animals',count:2},{label:'Toys',count:3}],'Fruit',  'm', 1),
  _q71MixedReview([{label:'Animals',count:5},{label:'Nature',count:3}],                       'Animals','m', 2),
  _q71MixedReview([{label:'Toys',count:4},{label:'Fruit',count:5},{label:'Nature',count:2}],  'Fruit',  'm', 3),
  _q71MixedReview([{label:'Nature',count:6},{label:'Animals',count:4}],                       'Nature', 'm', 0),
  // Hard (7)
  _q71MixedReview([{label:'Fruit',count:7},{label:'Toys',count:3}],                           'Fruit',  'h', 1),
  _q71MixedReview([{label:'Animals',count:8},{label:'Nature',count:5},{label:'Toys',count:2}],'Animals','h', 2),
  _q71MixedReview([{label:'Toys',count:6},{label:'Fruit',count:9}],                           'Fruit',  'h', 3),
  _q71MixedReview([{label:'Nature',count:7},{label:'Animals',count:6},{label:'Fruit',count:4}],'Nature','h', 0),
  _q71MixedReview([{label:'Fruit',count:10},{label:'Animals',count:6}],                       'Fruit',  'h', 1),
  _q71MixedReview([{label:'Toys',count:8},{label:'Nature',count:9},{label:'Animals',count:5}],'Nature', 'h', 2),
  _q71MixedReview([{label:'Animals',count:9},{label:'Fruit',count:8}],                        'Animals','h', 3)
];

// ── L7.1 combined bank ───────────────────────────────────────────────────────
var _l71Bank = [].concat(_l71C1, _l71C2, _l71C3, _l71C4, _l71C5, _l71C6, _l71C7, _l71C8, _l71C9, _l71C10);


// ════════════════════════════════════════════════════════════════════════════
//  L7.2 — Picture Graphs
//  TEKS 1.8B (picture-graph half) | 140 questions (45E / 55M / 40H)
//
//  Scope: read scale-of-1 picture graphs, identify most/fewest, match data
//  to graphs (imgChoice both directions), complete a row, identify labels,
//  fix simple errors, read total visible pictures.
//
//  HARD RULE: one picture means one item. Always. Grade 1 picture graphs
//  in this lesson never use scaled keys.
//
//  HARD GUARDRAILS:
//    - NO scaled picture graphs, NO graph keys, NO skip-count scales
//    - NO bar graphs as primary skill (reserved for L7.3)
//    - NO "how many more / fewer" (reserved for L7.4)
//    - NO multi-step graph reasoning, NO line plots, NO mean/median/mode
//    - NO drag-and-drop interaction
//    - NO graph questions where the source data is missing
//    - Max 6 pictures per row, max ~10 visible pictures for C9 totals
//
//  No err_scaled_key_confusion tag in either q.o[].tag or q.i.errorTag —
//  L7.2 teaches "one picture means one item" without ever surfacing the
//  scaled-key misconception to the student.
// ════════════════════════════════════════════════════════════════════════════

// ── L7.2 error tags ──────────────────────────────────────────────────────────
var _72PC = 'err_picture_count_wrong';
var _72MP = 'err_misses_picture';
var _72DC = 'err_double_counts_picture';
var _72WR = 'err_wrong_category_row';
var _72MF = 'err_most_fewest_confusion';
var _72DM = 'err_picture_graph_data_mismatch';
var _72MG = 'err_missing_picture_in_graph';
var _72TC = 'err_total_vs_category_confusion';

// ── L7.2 visual helpers ──────────────────────────────────────────────────────

// _u7PictureGraph — main picture-graph visual.
// rows: [{label, items:[iconKey,...]}]  iconKey ∈ keys of _U7_ICONS.
// Bordered card with one row per category. Each row: bold label (right-
// aligned, fixed-width column) + icon row using _u7IconCell. Max 6 icons
// per row should be enforced by the caller — 7+ wraps and looks bad.
function _u7PictureGraph(rows) {
  var html = '<div style="display:inline-block;border:2px solid #37474F;border-radius:8px;' +
    'background:#fff;padding:8px 10px;margin:6px auto;font-family:Nunito,sans-serif">';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;' +
      (i < rows.length - 1 ? 'border-bottom:1px dashed #B0BEC5;' : '') + '">' +
      '<div style="min-width:80px;max-width:80px;font-size:14px;font-weight:bold;color:#37474F;' +
        'text-align:right;padding-right:8px;border-right:2px solid #37474F">' + r.label + '</div>' +
      '<div style="display:flex;gap:4px;align-items:center;flex-wrap:nowrap;min-height:32px">' +
        (r.items || []).map(_u7IconCell).join('') +
      '</div>' +
      '</div>';
  }
  html += '</div>';
  return '<div style="text-align:center;margin:8px 0">' + html + '</div>';
}

// Compact variant for imgChoice cards. Smaller icons (22px) and label
// column (54px) so 4 cards fit in the standard imgChoice grid at 414px.
function _u7PictureGraphForChoice(rows) {
  var html = '<div style="display:inline-block;border:2px solid #37474F;border-radius:6px;' +
    'background:#fff;padding:4px 6px;margin:2px auto;font-family:Nunito,sans-serif;max-width:100%">';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    html += '<div style="display:flex;align-items:center;gap:4px;padding:2px 0;' +
      (i < rows.length - 1 ? 'border-bottom:1px dashed #B0BEC5;' : '') + '">' +
      '<div style="min-width:54px;max-width:54px;font-size:11px;font-weight:bold;color:#37474F;' +
        'text-align:right;padding-right:4px;border-right:2px solid #37474F">' + r.label + '</div>' +
      '<div style="display:flex;gap:2px;align-items:center;flex-wrap:nowrap;min-height:22px">' +
        (r.items || []).map(function(it){
          var glyph = _U7_ICONS[it] || '?';
          return '<span style="display:inline-flex;align-items:center;justify-content:center;' +
            'width:22px;height:22px;font-size:16px;line-height:1;vertical-align:middle">' + glyph + '</span>';
        }).join('') +
      '</div>' +
      '</div>';
  }
  html += '</div>';
  return html;
}

// _u7DataTable — 2-column source data table (Category | Count).
// Used as source data above C4 / C6 / C8 answer cards.
function _u7DataTable(rows) {
  var html = '<table style="border-collapse:collapse;margin:4px auto;border:2px solid #37474F;' +
    'background:#fff;font-family:Nunito,sans-serif">';
  html += '<thead><tr>' +
    '<th style="border-bottom:2px solid #37474F;padding:4px 12px;font-size:13px;color:#1976D2">Category</th>' +
    '<th style="border-bottom:2px solid #37474F;border-left:2px solid #37474F;padding:4px 12px;font-size:13px;color:#1976D2">Count</th>' +
    '</tr></thead><tbody>';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    html += '<tr>' +
      '<td style="border:1px solid #B0BEC5;padding:4px 10px;font-weight:bold;font-size:13px;color:#37474F">' + r.label + '</td>' +
      '<td style="border:1px solid #B0BEC5;padding:4px 10px;text-align:center;font-size:14px;color:#37474F">' + r.count + '</td>' +
      '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// _u7SourceDataCard — amber-wrapped source data block (same visual language
// as L7.1 C6's "Sorted items" card). When this card lives inside q.t, the
// _u7PromptWithSource helper inserts a hidden <svg> sentinel so _qText()
// returns the prompt as raw HTML instead of escaping it.
function _u7SourceDataCard(innerHtml, label) {
  return '<div style="background:#FFF8E1;border:2px solid #FFB300;border-radius:10px;' +
    'padding:6px 8px 8px;margin:8px auto 4px;max-width:520px">' +
    '<div style="font-size:13px;font-weight:bold;color:#5a7080;text-align:center;' +
      'margin-bottom:4px;font-family:Nunito,sans-serif">⭐ ' + (label || 'Data') + '</div>' +
    innerHtml + '</div>';
}

// Wrap a plain-text question prompt with an inline source-data card. The
// hidden <svg> sentinel is what triggers _qText() raw-HTML rendering — the
// SVG itself paints nothing (display:none, 0×0).
function _u7PromptWithSource(questionText, sourceCard) {
  return questionText +
    '<svg width="0" height="0" aria-hidden="true" focusable="false" ' +
      'style="display:none;width:0;height:0"></svg>' +
    sourceCard;
}

// ── L7.2 teaching visuals (intervention overlays) ────────────────────────────
function _u72TvCountRow() {
  return _u7TvWrap(_u7PictureGraph([
    {label: 'Apples', items: ['apple','apple','apple']}
  ]), 'Touch each picture once and count: 1, 2, 3.');
}
function _u72TvWholeGraph() {
  return _u7TvWrap(_u7PictureGraph([
    {label: 'Fruit',   items: ['apple','apple','banana']},
    {label: 'Animals', items: ['cat','dog']}
  ]), 'A picture graph shows each category in its own row. One picture means one item.');
}
function _u72TvMostFewest() {
  return _u7TvWrap(_u7PictureGraph([
    {label: 'Toys',    items: ['ball','car','kite','die']},
    {label: 'Fruit',   items: ['apple']}
  ]), 'Toys has the longest row (most). Fruit has the shortest row (fewest).');
}
function _u72TvDataMatch() {
  return _u7TvWrap(
    _u7DataTable([{label:'Fruit',count:2},{label:'Animals',count:1}]) +
    '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ matches ↓</div>' +
    _u7PictureGraph([
      {label: 'Fruit',   items: ['apple','banana']},
      {label: 'Animals', items: ['cat']}
    ]),
    'Every row in the graph has the same count as the data.');
}
function _u72TvWrongRow() {
  return _u7TvWrap(_u7PictureGraph([
    {label: 'Fruit',   items: ['apple','banana']},
    {label: 'Animals', items: ['cat','dog','rabbit']}
  ]), 'For "How many animals?" — find the Animals row and count only that row.');
}
function _u72TvBuildRow() {
  return _u7TvWrap(
    _u7DataTable([{label:'Toys',count:4},{label:'Fruit',count:2}]) +
    '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ build ↓</div>' +
    _u7PictureGraph([
      {label: 'Toys',  items: ['ball','car','kite','die']},
      {label: 'Fruit', items: ['apple','banana']}
    ]),
    'Make each row match the data: the Toys row needs 4 pictures, the Fruit row needs 2.');
}
function _u72TvFixError() {
  return _u7TvWrap(
    _u7DataTable([{label:'Fruit',count:3},{label:'Animals',count:2}]) +
    '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ but graph says ↓</div>' +
    _u7PictureGraph([
      {label: 'Fruit',   items: ['apple','banana','orange']},
      {label: 'Animals', items: ['cat']}
    ]),
    'Compare every row. The Animals row is missing one picture.');
}
function _u72TvCountTotal() {
  return _u7TvWrap(_u7PictureGraph([
    {label: 'Fruit',   items: ['apple','banana']},
    {label: 'Animals', items: ['cat','dog','rabbit']}
  ]), 'For the total, touch each picture in every row one time. Count them all.');
}

// ── L7.2 intervention factories ──────────────────────────────────────────────
function _i72PictureCount() { return {
  errorTag: _72PC, title: 'Count each picture once',
  teachingSteps: [
    'Find the right row.',
    'Touch each picture as you count.',
    'Stop when you reach the last picture in that row.',
    'Each picture stands for one item.'
  ],
  teachingVisualRaw: _u72TvCountRow(),
  correctAnswerExplanation: 'Each picture counts as 1. The total for the row is the count.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72MissesPicture() { return {
  errorTag: _72MP, title: 'Do not skip any pictures',
  teachingSteps: [
    'Start at the left side of the row.',
    'Touch every picture as you move right.',
    'End on the last picture.',
    'If you skip one, your count will be too low.'
  ],
  teachingVisualRaw: _u72TvCountRow(),
  correctAnswerExplanation: 'Count every picture in the row — do not leave any out.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72DoubleCounts() { return {
  errorTag: _72DC, title: 'Each picture counts as one',
  teachingSteps: [
    'Touch each picture one time only.',
    'Move your finger left to right.',
    'Do not count the same picture twice.',
    'Stop when you reach the last picture.'
  ],
  teachingVisualRaw: _u72TvCountRow(),
  correctAnswerExplanation: 'Each picture stands for one item. Counting it twice makes the count too high.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72WrongRow() { return {
  errorTag: _72WR, title: 'Read the row label first',
  teachingSteps: [
    'Read the question — what category does it ask about?',
    'Find the row with that label.',
    'Stay on that row.',
    'Count only the pictures in that row.'
  ],
  teachingVisualRaw: _u72TvWrongRow(),
  correctAnswerExplanation: 'Match the row label to the category in the question.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72MostFewest() { return {
  errorTag: _72MF, title: 'Most is the longest row; fewest is the shortest',
  teachingSteps: [
    '"Most" means the row with the biggest count — the longest row.',
    '"Fewest" means the row with the smallest count — the shortest row.',
    'Compare every row before you choose.',
    'Do not pick the opposite of what is asked.'
  ],
  teachingVisualRaw: _u72TvMostFewest(),
  correctAnswerExplanation: 'Most = longest row. Fewest = shortest row.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72DataMismatch() { return {
  errorTag: _72DM, title: 'Every row must match the data',
  teachingSteps: [
    'Read the count next to each category in the data.',
    'Count the pictures in the matching row of the graph.',
    'A graph matches only when every row count is the same as the data.',
    'Check every row — not just one.'
  ],
  teachingVisualRaw: _u72TvDataMatch(),
  correctAnswerExplanation: 'A matching graph has the same count for every category.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72MissingPicture() { return {
  errorTag: _72MG, title: 'Compare graph to data',
  teachingSteps: [
    'Read the data target for each category.',
    'Count the pictures in the matching row.',
    'If the graph row is shorter than the target, it is missing pictures.',
    'If it is longer, it has too many.'
  ],
  teachingVisualRaw: _u72TvFixError(),
  correctAnswerExplanation: 'A row needs pictures added when its count is less than the data target.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72TotalVsCategory() { return {
  errorTag: _72TC, title: 'Read the question carefully',
  teachingSteps: [
    'If the question names one category — count only that row.',
    'If the question asks about the whole graph — count every picture in every row.',
    'Re-read the prompt before counting.',
    'Do not mix the two.'
  ],
  teachingVisualRaw: _u72TvCountTotal(),
  correctAnswerExplanation: 'One category = one row. The whole graph = every picture across every row.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72BuildRow() { return {
  errorTag: _72MG, title: 'Build the row to match the data',
  teachingSteps: [
    'Read the data target for each row.',
    'Count the pictures already in the graph row.',
    'A row that is shorter than its target needs more pictures.',
    'Each picture you add stands for one item.'
  ],
  teachingVisualRaw: _u72TvBuildRow(),
  correctAnswerExplanation: 'Add pictures one at a time until the row count equals the data target.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i72LabelMatch() { return {
  errorTag: _72WR, title: 'Match the row to its category',
  teachingSteps: [
    'Look at the pictures in the row.',
    'Find a label that describes what those pictures are.',
    'Apples, bananas, oranges → Fruit.',
    'Cats, dogs, fish → Animals.'
  ],
  teachingVisualRaw: _u72TvWholeGraph(),
  correctAnswerExplanation: 'The row label describes what the pictures stand for.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L7.2 question factory functions ──────────────────────────────────────────

// _q72ReadCategoryCount — C1: graph + ask the count of one named category row.
// rows: [{label, items:[iconKey,...]}]   askCat: label of the row to count.
function _q72ReadCategoryCount(rows, askCat, diff, aIdx) {
  var target = rows.filter(function(r){ return r.label === askCat; })[0];
  var n = target.items.length;
  var otherRow = rows.filter(function(r){ return r.label !== askCat; })[0];
  var otherN = otherRow ? otherRow.items.length : 0;
  var wrong1 = Math.max(0, n - 1);                  // missed one (off-by-one low)
  var wrong2 = n + 1;                               // double-counted (off-by-one high)
  var wrong3 = (otherN !== n && otherN > 0) ? otherN : n + 2;  // wrong row count
  var seen = {}; seen[String(n)] = true;
  var picks = [wrong1, wrong2, wrong3].filter(function(w){
    if (seen[String(w)]) return false; seen[String(w)] = true; return true;
  });
  var bump = 2;
  while (picks.length < 3) {
    var f = n + bump++;
    if (!seen[String(f)]) { picks.push(f); seen[String(f)] = true; }
  }
  var opts = [
    {val: String(n)},
    {val: String(picks[0]), tag: _72MP},
    {val: String(picks[1]), tag: _72DC},
    {val: String(picks[2]), tag: _72WR}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the picture graph. How many ' + askCat + ' are there?',
    s: _u7PictureGraph(rows),
    o: opts, a: aIdx,
    e: 'Count the pictures in the ' + askCat + ' row: there are ' + n + '. Each picture stands for one item.',
    d: diff,
    h: 'Find the row labeled ' + askCat + '. Count each picture in that row one time.',
    sk: 'read_build_picture_graphs',
    i: _i72PictureCount()
  };
}

// _q72IdentifyMost — C2: graph + "which has the most?" (longest row).
// Input rows must have a clear winner (no ties for max).
function _q72IdentifyMost(rows, diff, aIdx) {
  var counts = rows.map(function(r){ return {label: r.label, n: r.items.length}; });
  var sorted = counts.slice().sort(function(a,b){ return b.n - a.n; });
  var winner = sorted[0].label;
  var fewest = sorted[sorted.length - 1].label;
  var middle = sorted.length >= 3 ? sorted[1].label : null;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var distractors = [
    {val: fewest, tag: _72MF},
    {val: middle || notInGraph[0] || fewest, tag: _72WR},
    {val: notInGraph[middle ? 0 : 1] || notInGraph[0] || fewest, tag: _72WR}
  ];
  var opts = [{val: winner}].concat(distractors);
  var seen = {}; var unique = [];
  opts.forEach(function(o){ if (!seen[o.val]) { seen[o.val] = true; unique.push(o); } });
  var fill = notInGraph.slice();
  while (unique.length < 4 && fill.length) {
    var c = fill.shift();
    if (!seen[c]) { unique.push({val: c, tag: _72WR}); seen[c] = true; }
  }
  opts = _u7Place(unique.slice(0, 4), aIdx);
  return {
    t: 'Look at the picture graph. Which category has the most?',
    s: _u7PictureGraph(rows),
    o: opts, a: aIdx,
    e: winner + ' has the most pictures — its row is the longest, with ' + sorted[0].n + ' pictures.',
    d: diff,
    h: 'The longest row has the most. Count each row and pick the biggest count.',
    sk: 'read_build_picture_graphs',
    i: _i72MostFewest()
  };
}

// _q72IdentifyFewest — C3: graph + "which has the fewest?" (shortest row).
function _q72IdentifyFewest(rows, diff, aIdx) {
  var counts = rows.map(function(r){ return {label: r.label, n: r.items.length}; });
  var sorted = counts.slice().sort(function(a,b){ return a.n - b.n; });
  var winner = sorted[0].label;
  var most = sorted[sorted.length - 1].label;
  var middle = sorted.length >= 3 ? sorted[1].label : null;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var distractors = [
    {val: most, tag: _72MF},
    {val: middle || notInGraph[0] || most, tag: _72WR},
    {val: notInGraph[middle ? 0 : 1] || notInGraph[0] || most, tag: _72WR}
  ];
  var opts = [{val: winner}].concat(distractors);
  var seen = {}; var unique = [];
  opts.forEach(function(o){ if (!seen[o.val]) { seen[o.val] = true; unique.push(o); } });
  var fill = notInGraph.slice();
  while (unique.length < 4 && fill.length) {
    var c = fill.shift();
    if (!seen[c]) { unique.push({val: c, tag: _72WR}); seen[c] = true; }
  }
  opts = _u7Place(unique.slice(0, 4), aIdx);
  return {
    t: 'Look at the picture graph. Which category has the fewest?',
    s: _u7PictureGraph(rows),
    o: opts, a: aIdx,
    e: winner + ' has the fewest pictures — its row is the shortest, with ' + sorted[0].n + ' pictures.',
    d: diff,
    h: 'The shortest row has the fewest. Count each row and pick the smallest count.',
    sk: 'read_build_picture_graphs',
    i: _i72MostFewest()
  };
}

// _q72MatchDataToGraph — C4: imgChoice. Show data table, 4 graph cards.
// Distractors: (1) row[0] +1, (2) row[1] -1 (or +1 if length<=1), (3) swap
// labels (2-cat) or row[2] off-by-one (3-cat).
function _q72MatchDataToGraph(rows, diff, aIdx) {
  function bumpRow(r, delta) {
    if (delta > 0) {
      var fill = r.items[0] || 'apple';
      return {label: r.label, items: r.items.concat(new Array(delta).fill(fill)).slice(0, 6)};
    }
    return {label: r.label, items: r.items.slice(0, Math.max(0, r.items.length + delta))};
  }
  var d1Rows = rows.map(function(r, i){ return i === 0 ? bumpRow(r, +1) : r; });
  var d2Rows = rows.map(function(r, i){
    if (i === 1) return bumpRow(r, r.items.length > 1 ? -1 : +1);
    return r;
  });
  var d3Rows;
  if (rows.length === 2) {
    d3Rows = [
      {label: rows[1].label, items: rows[0].items},
      {label: rows[0].label, items: rows[1].items}
    ];
  } else {
    d3Rows = rows.map(function(r, i){
      if (i === 2) return bumpRow(r, r.items.length > 1 ? -1 : +1);
      return r;
    });
  }
  var slot = [d1Rows, d2Rows, d3Rows];
  slot.splice(aIdx, 0, rows);
  var letters = ['A','B','C','D'];
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var svgs = slot.map(function(r){ return _u7PictureGraphForChoice(r); });
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _72DM};
  });
  var dataRows = rows.map(function(r){ return {label: r.label, count: r.items.length}; });
  var sourceCard = _u7SourceDataCard(_u7DataTable(dataRows), 'Data');
  var promptHtml = _u7PromptWithSource(
    'Which picture graph matches these data? Tap a picture.', sourceCard);
  return {
    t: promptHtml,
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: sourceCard,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' matches every row: ' +
       dataRows.map(function(d){ return d.label + ' = ' + d.count; }).join(', ') + '.',
    d: diff,
    h: 'Read each count in the data. Count the pictures in each row of each graph. Pick the one where every row matches.',
    sk: 'read_build_picture_graphs',
    i: _i72DataMismatch()
  };
}

// _q72MatchGraphToData — C5: graph shown, 4 text data-table options.
function _q72MatchGraphToData(rows, diff, aIdx) {
  function fmt(r){ return r.map(function(x){ return x.label + ' ' + x.count; }).join(', '); }
  var correctRows = rows.map(function(r){ return {label: r.label, count: r.items.length}; });
  var d1Rows = correctRows.map(function(r, i){
    return i === 0 ? {label: r.label, count: r.count + 1} : r;
  });
  var d2Rows = correctRows.map(function(r, i){
    return i === 1 ? {label: r.label, count: Math.max(0, r.count - 1)} : r;
  });
  var d3Rows;
  if (rows.length === 2) {
    d3Rows = [
      {label: correctRows[1].label, count: correctRows[0].count},
      {label: correctRows[0].label, count: correctRows[1].count}
    ];
  } else {
    d3Rows = correctRows.map(function(r, i){
      return i === 2 ? {label: r.label, count: r.count + 1} : r;
    });
  }
  var opts = [
    {val: fmt(correctRows)},
    {val: fmt(d1Rows), tag: _72DM},
    {val: fmt(d2Rows), tag: _72DM},
    {val: fmt(d3Rows), tag: _72DM}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the picture graph. Which data set matches?',
    s: _u7PictureGraph(rows),
    o: opts, a: aIdx,
    e: 'The graph shows ' + fmt(correctRows) + ' — every row count matches that data.',
    d: diff,
    h: 'Count each row in the graph. Find the data set with the same counts.',
    sk: 'read_build_picture_graphs',
    i: _i72DataMismatch()
  };
}

// _q72BuildRow — C6: source data above + partial graph. Which row needs more?
// shortRowIdx: which row in targetRows is rendered short (by 1–2 pictures).
function _q72BuildRow(targetRows, shortRowIdx, diff, aIdx) {
  var shortBy = targetRows[shortRowIdx].items.length >= 3 ? 2 : 1;
  var currentRows = targetRows.map(function(r, i){
    if (i === shortRowIdx) {
      return {label: r.label, items: r.items.slice(0, Math.max(0, r.items.length - shortBy))};
    }
    return r;
  });
  var shortLabel = targetRows[shortRowIdx].label;
  var inGraphOthers = targetRows.filter(function(r, i){ return i !== shortRowIdx; });
  var nonExistent = _U7_CATEGORIES.filter(function(c){
    return !targetRows.some(function(r){ return r.label === c; });
  })[0] || 'Other';
  var distractors = [
    {val: 'The ' + (inGraphOthers[0] ? inGraphOthers[0].label : nonExistent) + ' row', tag: _72WR},
    {val: 'The ' + (inGraphOthers[1] ? inGraphOthers[1].label : nonExistent) + ' row', tag: _72WR},
    {val: 'No row needs more pictures', tag: _72MG}
  ];
  // Dedup
  var seen = {}; seen['The ' + shortLabel + ' row'] = true;
  var unique = [];
  distractors.forEach(function(d){ if (!seen[d.val]) { seen[d.val] = true; unique.push(d); } });
  // Fill if dedup left fewer (happens with 2-cat where inGraphOthers has 1 row)
  var fill = _U7_CATEGORIES.filter(function(c){
    return !targetRows.some(function(r){ return r.label === c; });
  });
  for (var i = 0; i < fill.length && unique.length < 3; i++) {
    var v = 'The ' + fill[i] + ' row';
    if (!seen[v]) { unique.push({val: v, tag: _72WR}); seen[v] = true; }
  }
  while (unique.length < 3) unique.push({val: 'No row needs more pictures', tag: _72MG});
  var opts = [{val: 'The ' + shortLabel + ' row'}].concat(unique.slice(0, 3));
  opts = _u7Place(opts, aIdx);
  var dataRows = targetRows.map(function(r){ return {label: r.label, count: r.items.length}; });
  var sourceCard = _u7SourceDataCard(_u7DataTable(dataRows), 'Data');
  return {
    t: 'The graph below should match the data above. Which row needs more pictures?',
    s: sourceCard + _u7PictureGraph(currentRows),
    o: opts, a: aIdx,
    e: 'The ' + shortLabel + ' row has ' + currentRows[shortRowIdx].items.length +
       ' pictures, but the data says ' + targetRows[shortRowIdx].items.length + ' — that row needs more.',
    d: diff,
    h: 'Count each row in the graph. Compare to the data. The shorter row is the one that needs more.',
    sk: 'read_build_picture_graphs',
    i: _i72BuildRow()
  };
}

// _q72IdentifyLabel — C7: graph with one row's label hidden as "???".
// hiddenIdx: which row has the hidden label. All items in that row must
// belong to the same category (so the correct label is unambiguous).
function _q72IdentifyLabel(rows, hiddenIdx, diff, aIdx) {
  var hiddenRow = rows[hiddenIdx];
  var firstItem = hiddenRow.items[0];
  var correctLabel = _U7_ITEM_CAT[firstItem];
  var displayRows = rows.map(function(r, i){
    if (i === hiddenIdx) return {label: '???', items: r.items};
    return r;
  });
  var distractors = _U7_CATEGORIES.filter(function(c){ return c !== correctLabel; }).slice(0, 3);
  var opts = [
    {val: correctLabel},
    {val: distractors[0], tag: _72WR},
    {val: distractors[1], tag: _72WR},
    {val: distractors[2], tag: _72WR}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the picture graph. What category goes in the "???" row?',
    s: _u7PictureGraph(displayRows),
    o: opts, a: aIdx,
    e: 'The "???" row shows ' + hiddenRow.items.map(function(it){ return _U7_ITEM_NAME[it]; }).join(', ') +
       ' — all are ' + correctLabel + '.',
    d: diff,
    h: 'Look at the pictures in the "???" row. Find the label that describes what they are.',
    sk: 'read_build_picture_graphs',
    i: _i72LabelMatch()
  };
}

// _q72FixError — C8: source data above + graph with one wrong row.
// errorDelta: −1 means the graph row is short by 1; +1 means it has one extra.
function _q72FixError(targetRows, errorRowIdx, errorDelta, diff, aIdx) {
  var graphRows = targetRows.map(function(r, i){
    if (i === errorRowIdx) {
      if (errorDelta < 0) {
        return {label: r.label, items: r.items.slice(0, Math.max(0, r.items.length + errorDelta))};
      }
      var extra = r.items[0] || 'apple';
      return {label: r.label, items: r.items.concat(new Array(errorDelta).fill(extra)).slice(0, 6)};
    }
    return r;
  });
  var errorLabel = targetRows[errorRowIdx].label;
  var rightRow = targetRows.filter(function(r, i){ return i !== errorRowIdx; })[0];
  var nonExistent = _U7_CATEGORIES.filter(function(c){
    return !targetRows.some(function(r){ return r.label === c; });
  })[0] || 'Other';
  var opts = [
    {val: 'The ' + errorLabel + ' row is wrong'},
    {val: 'The ' + (rightRow ? rightRow.label : nonExistent) + ' row is wrong', tag: _72MG},
    {val: 'The ' + nonExistent + ' row is wrong', tag: _72WR},
    {val: 'Every row is correct', tag: _72DM}
  ];
  opts = _u7Place(opts, aIdx);
  var dataRows = targetRows.map(function(r){ return {label: r.label, count: r.items.length}; });
  var sourceCard = _u7SourceDataCard(_u7DataTable(dataRows), 'Data');
  return {
    t: 'The data above shows the right counts. The graph below has a mistake. Where is the mistake?',
    s: sourceCard + _u7PictureGraph(graphRows),
    o: opts, a: aIdx,
    e: 'The ' + errorLabel + ' row in the graph has ' + graphRows[errorRowIdx].items.length +
       ' pictures, but the data says ' + targetRows[errorRowIdx].items.length + '. That row is wrong.',
    d: diff,
    h: 'Compare every row to the data. Find the row whose count does not match.',
    sk: 'read_build_picture_graphs',
    i: _i72MissingPicture()
  };
}

// _q72CountTotal — C9: graph + "how many pictures are in the whole graph?"
// Caller must keep total ≤ 10 (visible-count cap).
function _q72CountTotal(rows, diff, aIdx) {
  var total = rows.reduce(function(s, r){ return s + r.items.length; }, 0);
  var firstRow = rows[0].items.length;
  var opts = [
    {val: String(total)},
    {val: String(firstRow), tag: _72TC},
    {val: String(Math.max(0, total - 1)), tag: _72MP},
    {val: String(total + 1), tag: _72DC}
  ];
  var seen = {}; var unique = [];
  opts.forEach(function(o){ if (!seen[o.val]) { seen[o.val] = true; unique.push(o); } });
  var bump = 2;
  while (unique.length < 4) {
    var f = String(total + bump++);
    if (!seen[f]) { unique.push({val: f, tag: _72PC}); seen[f] = true; }
  }
  opts = _u7Place(unique.slice(0, 4), aIdx);
  return {
    t: 'How many pictures are in the whole graph? Count all the pictures.',
    s: _u7PictureGraph(rows),
    o: opts, a: aIdx,
    e: 'Count every picture across every row: there are ' + total + ' pictures in the whole graph.',
    d: diff,
    h: 'Touch each picture in every row one time. Count them all together.',
    sk: 'read_build_picture_graphs',
    i: _i72TotalVsCategory()
  };
}

// _q72MixedReview — C10: pick the TRUE statement about the graph.
// statementType: 'count' | 'most' | 'fewest' | 'total' | 'label'
// All distractors are simple graph-reading mistakes — NO comparisons /
// differences (those belong to L7.4).
function _q72MixedReview(rows, statementType, diff, aIdx) {
  var truthful;
  var falsy = [];
  var tagFor = {};
  var counts = rows.map(function(r){ return {label: r.label, n: r.items.length}; });
  var maxRow = counts.reduce(function(a,b){ return a.n >= b.n ? a : b; });
  var minRow = counts.reduce(function(a,b){ return a.n <= b.n ? a : b; });
  var total = counts.reduce(function(s,c){ return s + c.n; }, 0);
  var allLabels = counts.map(function(c){ return c.label; });
  var notInGraph = _U7_CATEGORIES.filter(function(c){ return allLabels.indexOf(c) === -1; });

  if (statementType === 'count') {
    var rowForStmt = counts[0];
    truthful = 'There are exactly ' + rowForStmt.n + ' ' + rowForStmt.label;
    var otherRow = counts[1] || rowForStmt;
    falsy = [
      'There are exactly ' + (rowForStmt.n + 1) + ' ' + rowForStmt.label,
      'There are exactly ' + otherRow.n + ' ' + (notInGraph[0] || rowForStmt.label),
      'There are exactly ' + Math.max(0, rowForStmt.n - 1) + ' ' + rowForStmt.label
    ];
    tagFor[falsy[0]] = _72DC; tagFor[falsy[1]] = _72WR; tagFor[falsy[2]] = _72MP;
  } else if (statementType === 'most') {
    truthful = maxRow.label + ' has the most';
    falsy = [
      minRow.label + ' has the most',
      (counts.filter(function(c){ return c.label !== maxRow.label && c.label !== minRow.label; })[0] || minRow).label + ' has the most',
      (notInGraph[0] || maxRow.label) + ' has the most'
    ];
    tagFor[falsy[0]] = _72MF; tagFor[falsy[1]] = _72WR; tagFor[falsy[2]] = _72WR;
  } else if (statementType === 'fewest') {
    truthful = minRow.label + ' has the fewest';
    falsy = [
      maxRow.label + ' has the fewest',
      (counts.filter(function(c){ return c.label !== maxRow.label && c.label !== minRow.label; })[0] || maxRow).label + ' has the fewest',
      (notInGraph[0] || minRow.label) + ' has the fewest'
    ];
    tagFor[falsy[0]] = _72MF; tagFor[falsy[1]] = _72WR; tagFor[falsy[2]] = _72WR;
  } else if (statementType === 'total') {
    truthful = 'There are ' + total + ' pictures in the whole graph';
    falsy = [
      'There are ' + counts[0].n + ' pictures in the whole graph',
      'There are ' + (total + 1) + ' pictures in the whole graph',
      'There are ' + Math.max(0, total - 1) + ' pictures in the whole graph'
    ];
    tagFor[falsy[0]] = _72TC; tagFor[falsy[1]] = _72DC; tagFor[falsy[2]] = _72MP;
  } else {
    // 'label'
    truthful = maxRow.label + ' is one of the categories in the graph';
    falsy = [
      (notInGraph[0] || 'Toys') + ' is one of the categories in the graph',
      (notInGraph[1] || notInGraph[0] || 'Nature') + ' is one of the categories in the graph',
      minRow.label + ' is not in the graph'
    ];
    tagFor[falsy[0]] = _72WR; tagFor[falsy[1]] = _72WR; tagFor[falsy[2]] = _72WR;
  }
  var seen = {}; seen[truthful] = true;
  var unique = [];
  falsy.forEach(function(s){ if (!seen[s]) { seen[s] = true; unique.push(s); } });
  var bump = 5;
  while (unique.length < 3) {
    var fb = 'There are exactly ' + (total + bump++) + ' pictures in the whole graph';
    if (!seen[fb]) { unique.push(fb); seen[fb] = true; }
  }
  var opts = [
    {val: truthful},
    {val: unique[0], tag: tagFor[unique[0]] || _72WR},
    {val: unique[1], tag: tagFor[unique[1]] || _72WR},
    {val: unique[2], tag: tagFor[unique[2]] || _72WR}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the picture graph. Which statement is true?',
    s: _u7PictureGraph(rows),
    o: opts, a: aIdx,
    e: 'The true statement is: "' + truthful + '." Check each statement against the graph.',
    d: diff,
    h: 'Read each statement. Check it against the graph. Pick the one that matches.',
    sk: 'read_build_picture_graphs',
    i: _i72TotalVsCategory()
  };
}

// ── L7.2 key ideas ────────────────────────────────────────────────────────────
var _l72KeyIdeas = [
  'A picture graph organizes data into rows. Each row shows one category, and each picture in the row stands for one item.',
  'One picture means one item. To find how many, count the pictures in that row one at a time.',
  'Every row has a label. The label tells you what category the pictures stand for.',
  'The longest row has the most. The shortest row has the fewest. Compare row lengths to see which is most or fewest.',
  'A picture graph and a data set match only when every row count in the graph equals the count for the same category in the data.',
  'The total is the count of all pictures across every row. Touch each picture once and count them all.'
];

// ── L7.2 worked examples ──────────────────────────────────────────────────────
var _l72Examples = [
  {
    id: 'g1-u7-l2-ex-1',
    title: 'Example 1: Read a row',
    prompt: 'How many students chose Toys?',
    visual: {type: 'rawHtml', html: _u7PictureGraph([
      {label: 'Fruit',   items: ['apple','apple','apple','apple']},
      {label: 'Animals', items: ['cat','cat']},
      {label: 'Toys',    items: ['ball','car','kite','die','ball']}
    ])},
    steps: [
      'Find the row labeled Toys.',
      'Touch each picture in the Toys row one at a time.',
      'Count: 1, 2, 3, 4, 5.',
      'There are 5 pictures in the Toys row.'
    ],
    finalAnswer: '5 students chose Toys.'
  },
  {
    id: 'g1-u7-l2-ex-2',
    title: 'Example 2: Most and fewest',
    prompt: 'Which category has the most? Which has the fewest?',
    visual: {type: 'rawHtml', html: _u7PictureGraph([
      {label: 'Fruit',   items: ['apple','apple','apple']},
      {label: 'Animals', items: ['cat']},
      {label: 'Toys',    items: ['ball','car','kite','die']}
    ])},
    steps: [
      'Look at every row.',
      'The Toys row is the longest — 4 pictures.',
      'The Animals row is the shortest — 1 picture.',
      'Most = Toys. Fewest = Animals.'
    ],
    finalAnswer: 'Toys has the most. Animals has the fewest.'
  },
  {
    id: 'g1-u7-l2-ex-3',
    title: 'Example 3: Match data to a graph',
    prompt: 'Which picture graph matches: Fruit 3, Animals 2?',
    visual: {type: 'rawHtml', html:
      _u7DataTable([{label:'Fruit',count:3},{label:'Animals',count:2}]) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ which one matches? ↓</div>' +
      _u7PictureGraph([
        {label:'Fruit',  items:['apple','banana','orange']},
        {label:'Animals',items:['cat','dog']}
      ])},
    steps: [
      'Read the data: Fruit needs 3, Animals needs 2.',
      'Count the Fruit row in the graph — 3 pictures.',
      'Count the Animals row in the graph — 2 pictures.',
      'Every row matches the data.'
    ],
    finalAnswer: 'The graph above matches: Fruit = 3, Animals = 2.'
  },
  {
    id: 'g1-u7-l2-ex-4',
    title: 'Example 4: Complete a row',
    prompt: 'The data says Toys = 4. The graph row has 2. What is needed?',
    visual: {type: 'rawHtml', html:
      _u7DataTable([{label:'Toys',count:4},{label:'Fruit',count:2}]) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ partial graph ↓</div>' +
      _u7PictureGraph([
        {label:'Toys',  items:['ball','car']},
        {label:'Fruit', items:['apple','banana']}
      ])},
    steps: [
      'Read the data target for Toys: 4.',
      'Count the Toys row in the graph: 2.',
      'The Toys row needs more pictures.',
      'Add pictures until the row has 4 in all.'
    ],
    finalAnswer: 'The Toys row needs more pictures to reach 4.'
  },
  {
    id: 'g1-u7-l2-ex-5',
    title: 'Example 5: Fix a graph error',
    prompt: 'Find the mistake. Data says Fruit 3, Animals 2. What does the graph show?',
    visual: {type: 'rawHtml', html:
      _u7DataTable([{label:'Fruit',count:3},{label:'Animals',count:2}]) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ but the graph shows ↓</div>' +
      _u7PictureGraph([
        {label:'Fruit',  items:['apple','banana','orange']},
        {label:'Animals',items:['cat']}
      ])},
    steps: [
      'Compare each row of the graph to the data.',
      'Fruit: graph has 3, data says 3 — match.',
      'Animals: graph has 1, data says 2 — mismatch.',
      'The Animals row is wrong — it is missing one picture.'
    ],
    finalAnswer: 'The Animals row is missing one picture.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L7.2 question banks (10 categories, 140 total)
//  Target: 45E / 55M / 40H
//  C1 read-count(18) + C2 most(14) + C3 fewest(14) + C4 data→graph(15) +
//  C5 graph→data(15) + C6 build-row(14) + C7 label(11) + C8 fix-error(13) +
//  C9 total(13) + C10 mixed(13)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Read category count (18 = 6E / 8M / 4H) ──────────────────────────────
var _l72C1 = [
  // Easy (6) — 2 categories, 1–3 items per row
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat']}
  ], 'Fruit', 'e', 0),
  _q72ReadCategoryCount([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','leaf','star']}
  ], 'Nature', 'e', 1),
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 'Animals', 'e', 2),
  _q72ReadCategoryCount([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana']}
  ], 'Toys', 'e', 3),
  _q72ReadCategoryCount([
    {label:'Animals', items:['cat','dog']},
    {label:'Toys',    items:['ball']}
  ], 'Animals', 'e', 0),
  _q72ReadCategoryCount([
    {label:'Nature',  items:['sun','flower']},
    {label:'Fruit',   items:['apple','orange','grapes']}
  ], 'Fruit', 'e', 2),
  // Medium (8) — bigger 2-cat counts or 3-cat with clear gap
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog']}
  ], 'Fruit', 'm', 1),
  _q72ReadCategoryCount([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 'Toys', 'm', 2),
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit','fish']}
  ], 'Animals', 'm', 0),
  _q72ReadCategoryCount([
    {label:'Toys',    items:['ball','kite','die']},
    {label:'Fruit',   items:['apple','banana','grapes','orange']},
    {label:'Animals', items:['cat']}
  ], 'Fruit', 'm', 3),
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Nature',  items:['sun','flower']}
  ], 'Animals', 'm', 0),
  _q72ReadCategoryCount([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','star','leaf','flower']},
    {label:'Fruit',   items:['apple']}
  ], 'Nature', 'm', 1),
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'Toys', 'm', 2),
  _q72ReadCategoryCount([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Nature',  items:['sun','flower']}
  ], 'Animals', 'm', 0),
  // Hard (4) — 3-cat with similar counts
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'Animals', 'h', 1),
  _q72ReadCategoryCount([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower','leaf','star']},
    {label:'Fruit',   items:['apple','banana','orange']}
  ], 'Nature', 'h', 0),
  _q72ReadCategoryCount([
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Nature',  items:['sun','flower','star']}
  ], 'Fruit', 'h', 2),
  _q72ReadCategoryCount([
    {label:'Fruit',   items:['apple','banana','grapes']},
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Animals', items:['cat','dog']}
  ], 'Toys', 'h', 3)
];

// ── C2: Identify most (14 = 5E / 5M / 4H) ────────────────────────────────────
var _l72C2 = [
  // Easy (5)
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat']}
  ], 'e', 0),
  _q72IdentifyMost([
    {label:'Toys',    items:['ball']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 'e', 1),
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog','rabbit','fish']}
  ], 'e', 2),
  _q72IdentifyMost([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Fruit',   items:['apple']}
  ], 'e', 3),
  _q72IdentifyMost([
    {label:'Animals', items:['cat','dog']},
    {label:'Nature',  items:['sun','flower','star','leaf']}
  ], 'e', 0),
  // Medium (5)
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'm', 1),
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit','fish']}
  ], 'm', 2),
  _q72IdentifyMost([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower']}
  ], 'm', 3),
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Toys',    items:['ball','car']},
    {label:'Animals', items:['cat']}
  ], 'm', 0),
  _q72IdentifyMost([
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog']}
  ], 'm', 0),
  // Hard (4) — 3-cat with close counts
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car']}
  ], 'h', 0),
  _q72IdentifyMost([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']}
  ], 'h', 2),
  _q72IdentifyMost([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Nature',  items:['sun','flower','star','leaf','grapes']}
  ], 'h', 1),
  _q72IdentifyMost([
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog','rabbit','fish','cat']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'h', 3)
];

// ── C3: Identify fewest (14 = 5E / 5M / 4H) ──────────────────────────────────
var _l72C3 = [
  // Easy (5)
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat']}
  ], 'e', 1),
  _q72IdentifyFewest([
    {label:'Toys',    items:['ball']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 'e', 0),
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog','rabbit','fish']}
  ], 'e', 0),
  _q72IdentifyFewest([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Fruit',   items:['apple']}
  ], 'e', 2),
  _q72IdentifyFewest([
    {label:'Animals', items:['cat','dog']},
    {label:'Nature',  items:['sun','flower','star','leaf']}
  ], 'e', 3),
  // Medium (5)
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'm', 0),
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit','fish']}
  ], 'm', 1),
  _q72IdentifyFewest([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower']}
  ], 'm', 2),
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Toys',    items:['ball','car']},
    {label:'Animals', items:['cat']}
  ], 'm', 3),
  _q72IdentifyFewest([
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog']}
  ], 'm', 0),
  // Hard (4) — 3-cat with close counts
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car']}
  ], 'h', 1),
  _q72IdentifyFewest([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']}
  ], 'h', 0),
  _q72IdentifyFewest([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana']},
    {label:'Nature',  items:['sun','flower','star','leaf','grapes']}
  ], 'h', 2),
  _q72IdentifyFewest([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Toys',    items:['ball']}
  ], 'h', 3)
];

// ── C4: Match data → graph (imgChoice) (15 = 4E / 7M / 4H) ───────────────────
var _l72C4 = [
  // Easy (4)
  _q72MatchDataToGraph([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat']}
  ], 'e', 0),
  _q72MatchDataToGraph([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 'e', 1),
  _q72MatchDataToGraph([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']}
  ], 'e', 2),
  _q72MatchDataToGraph([
    {label:'Toys',    items:['ball']},
    {label:'Fruit',   items:['apple','banana','orange']}
  ], 'e', 3),
  // Medium (7)
  _q72MatchDataToGraph([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog']}
  ], 'm', 0),
  _q72MatchDataToGraph([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower','leaf','star']}
  ], 'm', 1),
  _q72MatchDataToGraph([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana']}
  ], 'm', 2),
  _q72MatchDataToGraph([
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'm', 3),
  _q72MatchDataToGraph([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat','dog']},
    {label:'Toys',    items:['ball']}
  ], 'm', 0),
  _q72MatchDataToGraph([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower']},
    {label:'Fruit',   items:['apple']}
  ], 'm', 1),
  _q72MatchDataToGraph([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat']},
    {label:'Nature',  items:['sun','flower']}
  ], 'm', 2),
  // Hard (4) — 3-cat with bigger counts
  _q72MatchDataToGraph([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car']}
  ], 'h', 3),
  _q72MatchDataToGraph([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower','leaf']},
    {label:'Animals', items:['cat','dog']}
  ], 'h', 0),
  _q72MatchDataToGraph([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Nature',  items:['sun','flower']}
  ], 'h', 1),
  _q72MatchDataToGraph([
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana']}
  ], 'h', 2)
];

// ── C5: Match graph → data table (15 = 4E / 7M / 4H) ─────────────────────────
var _l72C5 = [
  // Easy (4)
  _q72MatchGraphToData([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat']}
  ], 'e', 0),
  _q72MatchGraphToData([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun']}
  ], 'e', 1),
  _q72MatchGraphToData([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']}
  ], 'e', 2),
  _q72MatchGraphToData([
    {label:'Toys',    items:['ball','car']},
    {label:'Fruit',   items:['apple','banana','orange']}
  ], 'e', 3),
  // Medium (7)
  _q72MatchGraphToData([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 'm', 0),
  _q72MatchGraphToData([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower']}
  ], 'm', 1),
  _q72MatchGraphToData([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']}
  ], 'm', 2),
  _q72MatchGraphToData([
    {label:'Nature',  items:['sun','flower','leaf']},
    {label:'Toys',    items:['ball','car']}
  ], 'm', 3),
  _q72MatchGraphToData([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']},
    {label:'Toys',    items:['ball']}
  ], 'm', 0),
  _q72MatchGraphToData([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower']},
    {label:'Fruit',   items:['apple','banana']}
  ], 'm', 1),
  _q72MatchGraphToData([
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Fruit',   items:['apple','banana']},
    {label:'Toys',    items:['ball']}
  ], 'm', 2),
  // Hard (4)
  _q72MatchGraphToData([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'h', 3),
  _q72MatchGraphToData([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Animals', items:['cat','dog']}
  ], 'h', 0),
  _q72MatchGraphToData([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 'h', 1),
  _q72MatchGraphToData([
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Toys',    items:['ball','car']},
    {label:'Fruit',   items:['apple','banana','orange']}
  ], 'h', 2)
];

// ── C6: Build / complete a row (14 = 4E / 5M / 5H) ───────────────────────────
var _l72C6 = [
  // Easy (4) — 2-cat, one row short by 1–2
  _q72BuildRow([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']}
  ], 0, 'e', 0),
  _q72BuildRow([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower','leaf','star']}
  ], 1, 'e', 1),
  _q72BuildRow([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana']}
  ], 0, 'e', 0),
  _q72BuildRow([
    {label:'Nature',  items:['sun','flower']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 1, 'e', 1),
  // Medium (5) — 2-cat with bigger counts or 3-cat
  _q72BuildRow([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog']}
  ], 0, 'm', 0),
  _q72BuildRow([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower','star']}
  ], 1, 'm', 2),
  _q72BuildRow([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball']}
  ], 1, 'm', 1),
  _q72BuildRow([
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Toys',    items:['ball','car']},
    {label:'Fruit',   items:['apple','banana']}
  ], 0, 'm', 0),
  _q72BuildRow([
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Fruit',   items:['apple','banana']},
    {label:'Nature',  items:['sun']}
  ], 0, 'm', 2),
  // Hard (5) — 3-cat with similar counts
  _q72BuildRow([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car']}
  ], 1, 'h', 0),
  _q72BuildRow([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Animals', items:['cat','dog']}
  ], 2, 'h', 1),
  _q72BuildRow([
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Nature',  items:['sun','flower']}
  ], 0, 'h', 2),
  _q72BuildRow([
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana']}
  ], 2, 'h', 0),
  _q72BuildRow([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 1, 'h', 1)
];

// ── C7: Identify category labels (11 = 4E / 4M / 3H) ─────────────────────────
// Each row's items must all be from the same category so the hidden label
// is unambiguously determined by _U7_ITEM_CAT.
var _l72C7 = [
  // Easy (4) — 2-cat, hide one row
  _q72IdentifyLabel([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']}
  ], 0, 'e', 0),
  _q72IdentifyLabel([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower']}
  ], 1, 'e', 1),
  _q72IdentifyLabel([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana']}
  ], 0, 'e', 2),
  _q72IdentifyLabel([
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Toys',    items:['ball','car']}
  ], 1, 'e', 3),
  // Medium (4) — 3-cat, hide one row
  _q72IdentifyLabel([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']},
    {label:'Toys',    items:['ball','car']}
  ], 2, 'm', 0),
  _q72IdentifyLabel([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Animals', items:['cat','dog']}
  ], 1, 'm', 1),
  _q72IdentifyLabel([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana']},
    {label:'Nature',  items:['sun','flower']}
  ], 0, 'm', 2),
  _q72IdentifyLabel([
    {label:'Nature',  items:['sun','flower','leaf']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana']}
  ], 0, 'm', 3),
  // Hard (3) — 3-cat with 1-item row (less info for guessing)
  _q72IdentifyLabel([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat']},
    {label:'Toys',    items:['ball','car']}
  ], 1, 'h', 0),
  _q72IdentifyLabel([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun']},
    {label:'Animals', items:['cat','dog']}
  ], 1, 'h', 1),
  _q72IdentifyLabel([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Nature',  items:['sun']}
  ], 2, 'h', 2)
];

// ── C8: Fix error (13 = 3E / 5M / 5H) ────────────────────────────────────────
var _l72C8 = [
  // Easy (3) — 2-cat, one row off by 1
  _q72FixError([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']}
  ], 1, -1, 'e', 0),
  _q72FixError([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 0, 1, 'e', 1),
  _q72FixError([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Fruit',   items:['apple','banana']}
  ], 0, -1, 'e', 2),
  // Medium (5) — 2-cat or 3-cat with off-by-1
  _q72FixError([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 1, -1, 'm', 1),
  _q72FixError([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower']}
  ], 0, 1, 'm', 0),
  _q72FixError([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball']}
  ], 1, -1, 'm', 2),
  _q72FixError([
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Toys',    items:['ball','car']},
    {label:'Fruit',   items:['apple','banana']}
  ], 2, 1, 'm', 3),
  _q72FixError([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Nature',  items:['sun','flower']}
  ], 0, 1, 'm', 0),
  // Hard (5) — 3-cat with off-by-1 in middle row
  _q72FixError([
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car']}
  ], 1, -1, 'h', 1),
  _q72FixError([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Animals', items:['cat','dog']}
  ], 2, 1, 'h', 2),
  _q72FixError([
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Nature',  items:['sun','flower']}
  ], 0, -1, 'h', 0),
  _q72FixError([
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana']}
  ], 1, -1, 'h', 3),
  _q72FixError([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 2, 1, 'h', 2)
];

// ── C9: Read total pictures (13 = 4E / 5M / 4H) — totals ≤ 10 ────────────────
var _l72C9 = [
  // Easy (4) — total ≤ 5
  _q72CountTotal([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat']}
  ], 'e', 0),
  _q72CountTotal([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower']}
  ], 'e', 1),
  _q72CountTotal([
    {label:'Fruit',   items:['apple']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 'e', 2),
  _q72CountTotal([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana']}
  ], 'e', 3),
  // Medium (5) — total 6–8
  _q72CountTotal([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 'm', 0),
  _q72CountTotal([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower']}
  ], 'm', 1),
  _q72CountTotal([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']}
  ], 'm', 2),
  _q72CountTotal([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat','dog']},
    {label:'Toys',    items:['ball','car']}
  ], 'm', 3),
  _q72CountTotal([
    {label:'Nature',  items:['sun','flower']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana','orange']}
  ], 'm', 0),
  // Hard (4) — total 9–10, 3-cat
  _q72CountTotal([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car','kite']}
  ], 'h', 1),
  _q72CountTotal([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 'h', 2),
  _q72CountTotal([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Nature',  items:['sun','flower','star','leaf']}
  ], 'h', 0),
  _q72CountTotal([
    {label:'Nature',  items:['sun','flower','star']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']}
  ], 'h', 3)
];

// ── C10: Mixed review (13 = 6E / 4M / 3H) ────────────────────────────────────
// Statement types are graph-reading only: count, most, fewest, total, label.
// NO comparison/difference statements (those are L7.4).
var _l72C10 = [
  // Easy (6)
  _q72MixedReview([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat']}
  ], 'most', 'e', 0),
  _q72MixedReview([
    {label:'Toys',    items:['ball']},
    {label:'Nature',  items:['sun','flower','leaf']}
  ], 'fewest', 'e', 1),
  _q72MixedReview([
    {label:'Fruit',   items:['apple','banana']},
    {label:'Animals', items:['cat','dog']}
  ], 'count', 'e', 2),
  _q72MixedReview([
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball']}
  ], 'most', 'e', 3),
  _q72MixedReview([
    {label:'Nature',  items:['sun']},
    {label:'Fruit',   items:['apple','banana','orange']}
  ], 'fewest', 'e', 0),
  _q72MixedReview([
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple']}
  ], 'label', 'e', 1),
  // Medium (4)
  _q72MixedReview([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog']}
  ], 'total', 'm', 0),
  _q72MixedReview([
    {label:'Toys',    items:['ball','car','kite','die']},
    {label:'Nature',  items:['sun','flower']}
  ], 'count', 'm', 2),
  _q72MixedReview([
    {label:'Animals', items:['cat','dog','rabbit','fish']},
    {label:'Fruit',   items:['apple','banana']},
    {label:'Toys',    items:['ball']}
  ], 'most', 'm', 1),
  _q72MixedReview([
    {label:'Nature',  items:['sun','flower']},
    {label:'Toys',    items:['ball','car','kite']},
    {label:'Fruit',   items:['apple']}
  ], 'fewest', 'm', 3),
  // Hard (3) — 3-cat with various statement types
  _q72MixedReview([
    {label:'Fruit',   items:['apple','banana','orange']},
    {label:'Animals', items:['cat','dog','rabbit']},
    {label:'Toys',    items:['ball','car','kite','die']}
  ], 'total', 'h', 0),
  _q72MixedReview([
    {label:'Toys',    items:['ball','car']},
    {label:'Nature',  items:['sun','flower','star','leaf']},
    {label:'Animals', items:['cat','dog','rabbit']}
  ], 'most', 'h', 2),
  _q72MixedReview([
    {label:'Animals', items:['cat','dog']},
    {label:'Fruit',   items:['apple','banana','orange','grapes']},
    {label:'Nature',  items:['sun']}
  ], 'fewest', 'h', 1)
];

// ── L7.2 combined bank ───────────────────────────────────────────────────────
var _l72Bank = [].concat(_l72C1, _l72C2, _l72C3, _l72C4, _l72C5, _l72C6, _l72C7, _l72C8, _l72C9, _l72C10);


// ════════════════════════════════════════════════════════════════════════════
//  L7.3 — Bar-Type Graphs
//  TEKS 1.8B (bar-graph half) | 140 questions (45E / 55M / 40H)
//
//  Scope: read scale-of-1 horizontal bar-type graphs with discrete filled
//  cells, identify most/fewest, match data to graphs (imgChoice both
//  directions), complete a bar, identify labels, fix simple errors, read
//  total visible cells.
//
//  HARD RULE: one cell means one item. Always. Grade 1 bar graphs in this
//  lesson never use scaled cells, axes, tick marks, or skip-count scales.
//
//  HARD GUARDRAILS:
//    - NO scaled bar graphs, NO skip-count scales
//    - NO axis / y-axis / tick marks / scale labels
//    - NO count-by-2 / count-by-5 language anywhere
//    - NO picture graphs as primary skill (L7.2)
//    - NO tally charts as primary skill (L7.1)
//    - NO "how many more / fewer" (reserved for L7.4)
//    - NO multi-step graph reasoning, NO line plots, NO mean/median/mode
//    - NO drag-and-drop interaction, NO vertical bars, NO partial cells
//    - NO graph questions where source data is missing
//    - Max 6 cells per bar, max ~10 visible cells for C9 totals
//
//  No err_scale_confusion tag exists in this lesson — not declared, not
//  used in q.o[].tag, not used in q.i.errorTag, not in diagnostics. L7.3
//  consistently teaches "each cell means 1" without ever surfacing the
//  scaled-cell misconception to the student.
// ════════════════════════════════════════════════════════════════════════════

// ── L7.3 error tags ──────────────────────────────────────────────────────────
var _73BC = 'err_bar_count_wrong';
var _73MB = 'err_misses_bar_cell';
var _73DB = 'err_double_counts_bar_cell';
var _73WB = 'err_wrong_category_bar';
var _73MF = 'err_most_fewest_confusion';
var _73DM = 'err_bar_graph_data_mismatch';
var _73MC = 'err_missing_bar_cell';
var _73TC = 'err_total_vs_category_confusion';

// ── L7.3 category color map ──────────────────────────────────────────────────
// Each category gets a distinct fill color for its bar cells. Colors stay
// consistent across every L7.3 question so students implicitly learn the
// color↔category mapping (red = Fruit, blue = Animals, amber = Toys, green
// = Nature). Cells also carry a dark outline so colorblind users see the
// shape and count, not only the fill.
var _U7_BAR_COLORS = {
  Fruit:   { fill: '#EF4444', stroke: '#7F1D1D' },   // red-500 / red-900
  Animals: { fill: '#3B82F6', stroke: '#1E3A8A' },   // blue-500 / blue-900
  Toys:    { fill: '#F59E0B', stroke: '#92400E' },   // amber-500 / amber-800
  Nature:  { fill: '#10B981', stroke: '#065F46' }    // emerald-500 / emerald-900
};
var _U7_BAR_NEUTRAL = { fill: '#9CA3AF', stroke: '#374151' };  // gray-400 / gray-700

// ── L7.3 visual helpers ──────────────────────────────────────────────────────

// _u7BarCell — single filled cell. size: 24 main / 16 imgChoice. category
// determines fill color; falls back to neutral gray for unknown labels.
function _u7BarCell(label, size) {
  var s = size || 24;
  var c = _U7_BAR_COLORS[label] || _U7_BAR_NEUTRAL;
  return '<span style="display:inline-block;width:' + s + 'px;height:' + s + 'px;' +
    'background:' + c.fill + ';border:2px solid ' + c.stroke + ';border-radius:3px;' +
    'vertical-align:middle"></span>';
}

// _u7BarTypeGraph — main bar-type graph visual.
// rows: [{label, count}]
// Bordered card with one row per category. Each row: label cell (right-
// aligned, fixed-width column) + a horizontal strip of N filled cells.
// No axis, no tick marks. Caller must cap count at 6 (one row width).
function _u7BarTypeGraph(rows) {
  var html = '<div style="display:inline-block;border:2px solid #37474F;border-radius:8px;' +
    'background:#fff;padding:8px 10px;margin:6px auto;font-family:Nunito,sans-serif">';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var n = r.count || 0;
    var cells = '';
    for (var j = 0; j < n; j++) cells += _u7BarCell(r.label, 24);
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;' +
      (i < rows.length - 1 ? 'border-bottom:1px dashed #B0BEC5;' : '') + '">' +
      '<div style="min-width:80px;max-width:80px;font-size:14px;font-weight:bold;color:#37474F;' +
        'text-align:right;padding-right:8px;border-right:2px solid #37474F">' + r.label + '</div>' +
      '<div style="display:flex;gap:2px;align-items:center;flex-wrap:nowrap;min-height:28px">' +
        cells +
      '</div>' +
      '</div>';
  }
  html += '</div>';
  return '<div style="text-align:center;margin:8px 0">' + html + '</div>';
}

// Compact variant for imgChoice cards. Smaller cells (16px) and label
// column (54px) so 4 cards fit in the imgChoice grid at 414px viewport.
function _u7BarTypeGraphForChoice(rows) {
  var html = '<div style="display:inline-block;border:2px solid #37474F;border-radius:6px;' +
    'background:#fff;padding:4px 6px;margin:2px auto;font-family:Nunito,sans-serif;max-width:100%">';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var n = r.count || 0;
    var cells = '';
    for (var j = 0; j < n; j++) cells += _u7BarCell(r.label, 16);
    html += '<div style="display:flex;align-items:center;gap:4px;padding:2px 0;' +
      (i < rows.length - 1 ? 'border-bottom:1px dashed #B0BEC5;' : '') + '">' +
      '<div style="min-width:54px;max-width:54px;font-size:11px;font-weight:bold;color:#37474F;' +
        'text-align:right;padding-right:4px;border-right:2px solid #37474F">' + r.label + '</div>' +
      '<div style="display:flex;gap:2px;align-items:center;flex-wrap:nowrap;min-height:20px">' +
        cells +
      '</div>' +
      '</div>';
  }
  html += '</div>';
  return html;
}

// ── L7.3 teaching visuals (intervention overlays) ────────────────────────────
function _u73TvBarCount() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Fruit', count: 3}
  ]), 'Touch each cell once and count: 1, 2, 3.');
}
function _u73TvWholeGraph() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Fruit',   count: 3},
    {label: 'Animals', count: 2}
  ]), 'Each bar shows one category. Each cell stands for one item.');
}
function _u73TvMostFewest() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Toys',  count: 4},
    {label: 'Fruit', count: 1}
  ]), 'Toys is the longest bar (most). Fruit is the shortest bar (fewest).');
}
function _u73TvDataMatch() {
  return _u7TvWrap(
    _u7DataTable([{label:'Fruit',count:2},{label:'Animals',count:1}]) +
    '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ matches ↓</div>' +
    _u7BarTypeGraph([
      {label: 'Fruit',   count: 2},
      {label: 'Animals', count: 1}
    ]),
    'Every bar in the graph has the same count as the data.');
}
function _u73TvWrongBar() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Fruit',   count: 2},
    {label: 'Animals', count: 3}
  ]), 'For a question about Animals — find the Animals bar and count only that bar.');
}
function _u73TvBuildBar() {
  return _u7TvWrap(
    _u7DataTable([{label:'Toys',count:4},{label:'Fruit',count:2}]) +
    '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ build ↓</div>' +
    _u7BarTypeGraph([
      {label: 'Toys',  count: 4},
      {label: 'Fruit', count: 2}
    ]),
    'Each bar should have the same number of cells as its data target.');
}
function _u73TvFixError() {
  return _u7TvWrap(
    _u7DataTable([{label:'Fruit',count:3},{label:'Animals',count:2}]) +
    '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ but the graph shows ↓</div>' +
    _u7BarTypeGraph([
      {label: 'Fruit',   count: 3},
      {label: 'Animals', count: 1}
    ]),
    'Compare every bar to the data. The Animals bar is short one cell.');
}
function _u73TvCountTotal() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Fruit',   count: 2},
    {label: 'Animals', count: 3}
  ]), 'For the total, touch each cell in every bar one time. Count them all.');
}

// ── L7.3 intervention factories ──────────────────────────────────────────────
function _i73BarCount() { return {
  errorTag: _73BC, title: 'Count each cell once',
  teachingSteps: [
    'Find the right bar.',
    'Touch each cell as you count.',
    'Stop at the last cell.',
    'Each cell stands for one item.'
  ],
  teachingVisualRaw: _u73TvBarCount(),
  correctAnswerExplanation: 'Each cell counts as 1. The total for the bar is the count.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73MissesCell() { return {
  errorTag: _73MB, title: 'Do not skip any cells',
  teachingSteps: [
    'Start at the label end of the bar.',
    'Touch every cell as you move along.',
    'End on the last cell.',
    'If you skip one, your count will be too low.'
  ],
  teachingVisualRaw: _u73TvBarCount(),
  correctAnswerExplanation: 'Count every cell in the bar — do not leave any out.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73DoubleCounts() { return {
  errorTag: _73DB, title: 'Each cell counts as one',
  teachingSteps: [
    'Touch each cell one time only.',
    'Move along the bar without going back.',
    'Do not count the same cell twice.',
    'Stop when you reach the last cell.'
  ],
  teachingVisualRaw: _u73TvBarCount(),
  correctAnswerExplanation: 'Each cell stands for one item. Counting it twice makes the count too high.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73WrongBar() { return {
  errorTag: _73WB, title: 'Read the bar label first',
  teachingSteps: [
    'Read the question — what category does it ask about?',
    'Find the bar with that label.',
    'Stay on that bar.',
    'Count only the cells in that bar.'
  ],
  teachingVisualRaw: _u73TvWrongBar(),
  correctAnswerExplanation: 'Match the bar label to the category in the question.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73MostFewest() { return {
  errorTag: _73MF, title: 'Most is the longest bar; fewest is the shortest',
  teachingSteps: [
    '"Most" means the bar with the biggest count — the longest bar.',
    '"Fewest" means the bar with the smallest count — the shortest bar.',
    'Compare every bar before you choose.',
    'Do not pick the opposite of what is asked.'
  ],
  teachingVisualRaw: _u73TvMostFewest(),
  correctAnswerExplanation: 'Most = longest bar. Fewest = shortest bar.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73DataMismatch() { return {
  errorTag: _73DM, title: 'Every bar must match the data',
  teachingSteps: [
    'Read the count next to each category in the data.',
    'Count the cells in the matching bar of the graph.',
    'A graph matches only when every bar has the same count as the data.',
    'Check every bar — not just one.'
  ],
  teachingVisualRaw: _u73TvDataMatch(),
  correctAnswerExplanation: 'A matching graph has the same count for every category.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73MissingCell() { return {
  errorTag: _73MC, title: 'Compare bar to data',
  teachingSteps: [
    'Read the data target for each category.',
    'Count the cells in the matching bar.',
    'If the bar is shorter than the target, it needs cells added.',
    'If it is longer, it has too many cells.'
  ],
  teachingVisualRaw: _u73TvFixError(),
  correctAnswerExplanation: 'A bar needs cells added when its count is less than the data target.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73TotalVsCategory() { return {
  errorTag: _73TC, title: 'Read the question carefully',
  teachingSteps: [
    'If the question names one category — count only that bar.',
    'If the question asks about the whole graph — count every cell across every bar.',
    'Re-read the prompt before counting.',
    'Do not mix the two.'
  ],
  teachingVisualRaw: _u73TvCountTotal(),
  correctAnswerExplanation: 'One category = one bar. The whole graph = every cell across every bar.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73BuildBar() { return {
  errorTag: _73MC, title: 'Build the bar to match the data',
  teachingSteps: [
    'Read the data target for each bar.',
    'Count the cells already in the graph bar.',
    'A bar that is shorter than its target needs cells added.',
    'Each cell you add stands for one item.'
  ],
  teachingVisualRaw: _u73TvBuildBar(),
  correctAnswerExplanation: 'A bar matches the data when its cell count equals the data target.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i73LabelMatch() { return {
  errorTag: _73WB, title: 'Match the bar to its category',
  teachingSteps: [
    'Look at the bar — the color of its cells hints at the category.',
    'Find a label that describes the category.',
    'Each cell still counts as one item, no matter the color.'
  ],
  teachingVisualRaw: _u73TvWholeGraph(),
  correctAnswerExplanation: 'The bar label describes the category, and the cell color matches that category.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L7.3 question factory functions ──────────────────────────────────────────

// _q73ReadCategoryCount — C1: bar graph + ask the count of one named bar.
function _q73ReadCategoryCount(rows, askCat, diff, aIdx) {
  var target = rows.filter(function(r){ return r.label === askCat; })[0];
  var n = target.count;
  var otherRow = rows.filter(function(r){ return r.label !== askCat; })[0];
  var otherN = otherRow ? otherRow.count : 0;
  var wrong1 = Math.max(0, n - 1);                  // missed one
  var wrong2 = n + 1;                               // double-counted
  var wrong3 = (otherN !== n && otherN > 0) ? otherN : n + 2;  // wrong bar count
  var seen = {}; seen[String(n)] = true;
  var picks = [wrong1, wrong2, wrong3].filter(function(w){
    if (seen[String(w)]) return false; seen[String(w)] = true; return true;
  });
  var bump = 2;
  while (picks.length < 3) {
    var f = n + bump++;
    if (!seen[String(f)]) { picks.push(f); seen[String(f)] = true; }
  }
  var opts = [
    {val: String(n)},
    {val: String(picks[0]), tag: _73MB},
    {val: String(picks[1]), tag: _73DB},
    {val: String(picks[2]), tag: _73WB}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the bar graph. How many ' + askCat + ' are there?',
    s: _u7BarTypeGraph(rows),
    o: opts, a: aIdx,
    e: 'Count the cells in the ' + askCat + ' bar: there are ' + n + '. Each cell stands for one item.',
    d: diff,
    h: 'Find the bar labeled ' + askCat + '. Count each cell in that bar one time.',
    sk: 'read_build_bar_graphs',
    i: _i73BarCount()
  };
}

// _q73IdentifyMost — C2: bar graph + "which is longest?"
function _q73IdentifyMost(rows, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return b.count - a.count; });
  var winner = sorted[0].label;
  var fewest = sorted[sorted.length - 1].label;
  var middle = sorted.length >= 3 ? sorted[1].label : null;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var distractors = [
    {val: fewest, tag: _73MF},
    {val: middle || notInGraph[0] || fewest, tag: _73WB},
    {val: notInGraph[middle ? 0 : 1] || notInGraph[0] || fewest, tag: _73WB}
  ];
  var opts = [{val: winner}].concat(distractors);
  var seen = {}; var unique = [];
  opts.forEach(function(o){ if (!seen[o.val]) { seen[o.val] = true; unique.push(o); } });
  var fill = notInGraph.slice();
  while (unique.length < 4 && fill.length) {
    var c = fill.shift();
    if (!seen[c]) { unique.push({val: c, tag: _73WB}); seen[c] = true; }
  }
  opts = _u7Place(unique.slice(0, 4), aIdx);
  return {
    t: 'Look at the bar graph. Which category has the most?',
    s: _u7BarTypeGraph(rows),
    o: opts, a: aIdx,
    e: winner + ' has the most — its bar is the longest, with ' + sorted[0].count + ' cells.',
    d: diff,
    h: 'The longest bar has the most. Count each bar and pick the biggest count.',
    sk: 'read_build_bar_graphs',
    i: _i73MostFewest()
  };
}

// _q73IdentifyFewest — C3: bar graph + "which is shortest?"
function _q73IdentifyFewest(rows, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return a.count - b.count; });
  var winner = sorted[0].label;
  var most = sorted[sorted.length - 1].label;
  var middle = sorted.length >= 3 ? sorted[1].label : null;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var distractors = [
    {val: most, tag: _73MF},
    {val: middle || notInGraph[0] || most, tag: _73WB},
    {val: notInGraph[middle ? 0 : 1] || notInGraph[0] || most, tag: _73WB}
  ];
  var opts = [{val: winner}].concat(distractors);
  var seen = {}; var unique = [];
  opts.forEach(function(o){ if (!seen[o.val]) { seen[o.val] = true; unique.push(o); } });
  var fill = notInGraph.slice();
  while (unique.length < 4 && fill.length) {
    var c = fill.shift();
    if (!seen[c]) { unique.push({val: c, tag: _73WB}); seen[c] = true; }
  }
  opts = _u7Place(unique.slice(0, 4), aIdx);
  return {
    t: 'Look at the bar graph. Which category has the fewest?',
    s: _u7BarTypeGraph(rows),
    o: opts, a: aIdx,
    e: winner + ' has the fewest — its bar is the shortest, with ' + sorted[0].count + ' cells.',
    d: diff,
    h: 'The shortest bar has the fewest. Count each bar and pick the smallest count.',
    sk: 'read_build_bar_graphs',
    i: _i73MostFewest()
  };
}

// _q73MatchDataToGraph — C4: imgChoice. Source data table, 4 bar-graph cards.
function _q73MatchDataToGraph(rows, diff, aIdx) {
  function bumpRow(r, delta) {
    return {label: r.label, count: Math.max(0, Math.min(6, r.count + delta))};
  }
  var d1Rows = rows.map(function(r, i){ return i === 0 ? bumpRow(r, +1) : r; });
  var d2Rows = rows.map(function(r, i){
    if (i === 1) return bumpRow(r, r.count > 1 ? -1 : +1);
    return r;
  });
  var d3Rows;
  if (rows.length === 2) {
    d3Rows = [
      {label: rows[1].label, count: rows[0].count},
      {label: rows[0].label, count: rows[1].count}
    ];
  } else {
    d3Rows = rows.map(function(r, i){
      if (i === 2) return bumpRow(r, r.count > 1 ? -1 : +1);
      return r;
    });
  }
  var slot = [d1Rows, d2Rows, d3Rows];
  slot.splice(aIdx, 0, rows);
  var letters = ['A','B','C','D'];
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var svgs = slot.map(function(r){ return _u7BarTypeGraphForChoice(r); });
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _73DM};
  });
  var dataRows = rows.map(function(r){ return {label: r.label, count: r.count}; });
  var sourceCard = _u7SourceDataCard(_u7DataTable(dataRows), 'Data');
  var promptHtml = _u7PromptWithSource(
    'Which bar graph matches these data? Tap a picture.', sourceCard);
  return {
    t: promptHtml,
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: sourceCard,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' matches every bar: ' +
       dataRows.map(function(d){ return d.label + ' = ' + d.count; }).join(', ') + '.',
    d: diff,
    h: 'Read each count in the data. Count the cells in each bar of each graph. Pick the one where every bar matches.',
    sk: 'read_build_bar_graphs',
    i: _i73DataMismatch()
  };
}

// _q73MatchGraphToData — C5: bar graph + 4 text data-table options.
function _q73MatchGraphToData(rows, diff, aIdx) {
  function fmt(r){ return r.map(function(x){ return x.label + ' ' + x.count; }).join(', '); }
  var correctRows = rows.map(function(r){ return {label: r.label, count: r.count}; });
  var d1Rows = correctRows.map(function(r, i){
    return i === 0 ? {label: r.label, count: r.count + 1} : r;
  });
  var d2Rows = correctRows.map(function(r, i){
    return i === 1 ? {label: r.label, count: Math.max(0, r.count - 1)} : r;
  });
  var d3Rows;
  if (rows.length === 2) {
    d3Rows = [
      {label: correctRows[1].label, count: correctRows[0].count},
      {label: correctRows[0].label, count: correctRows[1].count}
    ];
  } else {
    d3Rows = correctRows.map(function(r, i){
      return i === 2 ? {label: r.label, count: r.count + 1} : r;
    });
  }
  var opts = [
    {val: fmt(correctRows)},
    {val: fmt(d1Rows), tag: _73DM},
    {val: fmt(d2Rows), tag: _73DM},
    {val: fmt(d3Rows), tag: _73DM}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the bar graph. Which data set matches?',
    s: _u7BarTypeGraph(rows),
    o: opts, a: aIdx,
    e: 'The graph shows ' + fmt(correctRows) + ' — every bar matches that data.',
    d: diff,
    h: 'Count each bar in the graph. Find the data set with the same counts.',
    sk: 'read_build_bar_graphs',
    i: _i73DataMismatch()
  };
}

// _q73BuildBar — C6: source data above + partial graph. Pick the unfinished bar.
// Approved wording: "Which bar needs cells added to match the data?" — NOT
// "how many more cells does X need?" (that wording belongs to L7.4).
function _q73BuildBar(targetRows, shortRowIdx, diff, aIdx) {
  var shortBy = targetRows[shortRowIdx].count >= 3 ? 2 : 1;
  var currentRows = targetRows.map(function(r, i){
    if (i === shortRowIdx) {
      return {label: r.label, count: Math.max(0, r.count - shortBy)};
    }
    return r;
  });
  var shortLabel = targetRows[shortRowIdx].label;
  var inGraphOthers = targetRows.filter(function(r, i){ return i !== shortRowIdx; });
  var nonExistent = _U7_CATEGORIES.filter(function(c){
    return !targetRows.some(function(r){ return r.label === c; });
  })[0] || 'Other';
  var distractors = [
    {val: 'The ' + (inGraphOthers[0] ? inGraphOthers[0].label : nonExistent) + ' bar', tag: _73WB},
    {val: 'The ' + (inGraphOthers[1] ? inGraphOthers[1].label : nonExistent) + ' bar', tag: _73WB},
    {val: 'No bar needs cells added', tag: _73MC}
  ];
  var seen = {}; seen['The ' + shortLabel + ' bar'] = true;
  var unique = [];
  distractors.forEach(function(d){ if (!seen[d.val]) { seen[d.val] = true; unique.push(d); } });
  var fill = _U7_CATEGORIES.filter(function(c){
    return !targetRows.some(function(r){ return r.label === c; });
  });
  for (var i = 0; i < fill.length && unique.length < 3; i++) {
    var v = 'The ' + fill[i] + ' bar';
    if (!seen[v]) { unique.push({val: v, tag: _73WB}); seen[v] = true; }
  }
  while (unique.length < 3) unique.push({val: 'No bar needs cells added', tag: _73MC});
  var opts = [{val: 'The ' + shortLabel + ' bar'}].concat(unique.slice(0, 3));
  opts = _u7Place(opts, aIdx);
  var dataRows = targetRows.map(function(r){ return {label: r.label, count: r.count}; });
  var sourceCard = _u7SourceDataCard(_u7DataTable(dataRows), 'Data');
  return {
    t: 'The graph below should match the data above. Which bar needs cells added to match the data?',
    s: sourceCard + _u7BarTypeGraph(currentRows),
    o: opts, a: aIdx,
    e: 'The ' + shortLabel + ' bar has ' + currentRows[shortRowIdx].count +
       ' cells, but the data says ' + targetRows[shortRowIdx].count + ' — that bar needs cells added.',
    d: diff,
    h: 'Count each bar in the graph. Compare to the data. The shorter bar is the one that needs cells added.',
    sk: 'read_build_bar_graphs',
    i: _i73BuildBar()
  };
}

// _q73IdentifyLabel — C7: bar graph with one row's label hidden as "???".
// hiddenIdx: which row has the hidden label. The cell color (category-themed)
// is the primary visual cue for the correct label.
function _q73IdentifyLabel(rows, hiddenIdx, diff, aIdx) {
  var hiddenRow = rows[hiddenIdx];
  var correctLabel = hiddenRow.label;
  // Render the row with "???" but keep the original color (via a hidden-label flag)
  // Use displayLabel field to pass through; _u7BarTypeGraph uses r.label for both
  // text and color, so we need a custom render here.
  var displayHtml = (function(){
    var html = '<div style="display:inline-block;border:2px solid #37474F;border-radius:8px;' +
      'background:#fff;padding:8px 10px;margin:6px auto;font-family:Nunito,sans-serif">';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var n = r.count || 0;
      var cells = '';
      // For the hidden row, keep using r.label internally for color (so color hint shows)
      for (var j = 0; j < n; j++) cells += _u7BarCell(r.label, 24);
      var labelText = (i === hiddenIdx) ? '???' : r.label;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;' +
        (i < rows.length - 1 ? 'border-bottom:1px dashed #B0BEC5;' : '') + '">' +
        '<div style="min-width:80px;max-width:80px;font-size:14px;font-weight:bold;color:#37474F;' +
          'text-align:right;padding-right:8px;border-right:2px solid #37474F">' + labelText + '</div>' +
        '<div style="display:flex;gap:2px;align-items:center;flex-wrap:nowrap;min-height:28px">' +
          cells +
        '</div>' +
        '</div>';
    }
    html += '</div>';
    return '<div style="text-align:center;margin:8px 0">' + html + '</div>';
  })();
  var distractors = _U7_CATEGORIES.filter(function(c){ return c !== correctLabel; }).slice(0, 3);
  var opts = [
    {val: correctLabel},
    {val: distractors[0], tag: _73WB},
    {val: distractors[1], tag: _73WB},
    {val: distractors[2], tag: _73WB}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the bar graph. What category goes in the "???" bar?',
    s: displayHtml,
    o: opts, a: aIdx,
    e: 'The "???" bar has ' + hiddenRow.count + ' cells and the color matches the ' + correctLabel + ' category.',
    d: diff,
    h: 'Look at the cells in the "???" bar. The color of the cells is a hint about the category.',
    sk: 'read_build_bar_graphs',
    i: _i73LabelMatch()
  };
}

// _q73FixError — C8: source data above + bar graph with one wrong row.
// errorDelta: −1 means the graph bar is short by 1; +1 means it has one extra cell.
function _q73FixError(targetRows, errorRowIdx, errorDelta, diff, aIdx) {
  var graphRows = targetRows.map(function(r, i){
    if (i === errorRowIdx) {
      return {label: r.label, count: Math.max(0, Math.min(6, r.count + errorDelta))};
    }
    return r;
  });
  var errorLabel = targetRows[errorRowIdx].label;
  var rightRow = targetRows.filter(function(r, i){ return i !== errorRowIdx; })[0];
  var nonExistent = _U7_CATEGORIES.filter(function(c){
    return !targetRows.some(function(r){ return r.label === c; });
  })[0] || 'Other';
  var opts = [
    {val: 'The ' + errorLabel + ' bar is wrong'},
    {val: 'The ' + (rightRow ? rightRow.label : nonExistent) + ' bar is wrong', tag: _73MC},
    {val: 'The ' + nonExistent + ' bar is wrong', tag: _73WB},
    {val: 'Every bar is correct', tag: _73DM}
  ];
  opts = _u7Place(opts, aIdx);
  var dataRows = targetRows.map(function(r){ return {label: r.label, count: r.count}; });
  var sourceCard = _u7SourceDataCard(_u7DataTable(dataRows), 'Data');
  return {
    t: 'The data above shows the right counts. The bar graph below has a mistake. Where is the mistake?',
    s: sourceCard + _u7BarTypeGraph(graphRows),
    o: opts, a: aIdx,
    e: 'The ' + errorLabel + ' bar in the graph has ' + graphRows[errorRowIdx].count +
       ' cells, but the data says ' + targetRows[errorRowIdx].count + '. That bar is wrong.',
    d: diff,
    h: 'Compare every bar to the data. Find the bar whose count does not match.',
    sk: 'read_build_bar_graphs',
    i: _i73MissingCell()
  };
}

// _q73CountTotal — C9: graph + "how many cells in the whole graph?"
// Caller must keep total ≤ 10 (visible-count cap).
function _q73CountTotal(rows, diff, aIdx) {
  var total = rows.reduce(function(s, r){ return s + r.count; }, 0);
  var firstRow = rows[0].count;
  var opts = [
    {val: String(total)},
    {val: String(firstRow), tag: _73TC},
    {val: String(Math.max(0, total - 1)), tag: _73MB},
    {val: String(total + 1), tag: _73DB}
  ];
  var seen = {}; var unique = [];
  opts.forEach(function(o){ if (!seen[o.val]) { seen[o.val] = true; unique.push(o); } });
  var bump = 2;
  while (unique.length < 4) {
    var f = String(total + bump++);
    if (!seen[f]) { unique.push({val: f, tag: _73BC}); seen[f] = true; }
  }
  opts = _u7Place(unique.slice(0, 4), aIdx);
  return {
    t: 'How many filled cells are in the whole bar graph? Count all the cells.',
    s: _u7BarTypeGraph(rows),
    o: opts, a: aIdx,
    e: 'Count every cell across every bar: there are ' + total + ' cells in all.',
    d: diff,
    h: 'Touch each cell in every bar one time. Count them all together.',
    sk: 'read_build_bar_graphs',
    i: _i73TotalVsCategory()
  };
}

// _q73MixedReview — C10: pick the TRUE statement about the bar graph.
// statementType: 'count' | 'most' | 'fewest' | 'total' | 'label'
// Graph-reading only — NO comparison/difference statements (those are L7.4).
function _q73MixedReview(rows, statementType, diff, aIdx) {
  var truthful;
  var falsy = [];
  var tagFor = {};
  var maxRow = rows.reduce(function(a,b){ return a.count >= b.count ? a : b; });
  var minRow = rows.reduce(function(a,b){ return a.count <= b.count ? a : b; });
  var total = rows.reduce(function(s,r){ return s + r.count; }, 0);
  var allLabels = rows.map(function(r){ return r.label; });
  var notInGraph = _U7_CATEGORIES.filter(function(c){ return allLabels.indexOf(c) === -1; });

  if (statementType === 'count') {
    var rowForStmt = rows[0];
    truthful = 'There are exactly ' + rowForStmt.count + ' ' + rowForStmt.label;
    var otherRow = rows[1] || rowForStmt;
    falsy = [
      'There are exactly ' + (rowForStmt.count + 1) + ' ' + rowForStmt.label,
      'There are exactly ' + otherRow.count + ' ' + (notInGraph[0] || rowForStmt.label),
      'There are exactly ' + Math.max(0, rowForStmt.count - 1) + ' ' + rowForStmt.label
    ];
    tagFor[falsy[0]] = _73DB; tagFor[falsy[1]] = _73WB; tagFor[falsy[2]] = _73MB;
  } else if (statementType === 'most') {
    truthful = maxRow.label + ' has the most';
    falsy = [
      minRow.label + ' has the most',
      (rows.filter(function(r){ return r.label !== maxRow.label && r.label !== minRow.label; })[0] || minRow).label + ' has the most',
      (notInGraph[0] || maxRow.label) + ' has the most'
    ];
    tagFor[falsy[0]] = _73MF; tagFor[falsy[1]] = _73WB; tagFor[falsy[2]] = _73WB;
  } else if (statementType === 'fewest') {
    truthful = minRow.label + ' has the fewest';
    falsy = [
      maxRow.label + ' has the fewest',
      (rows.filter(function(r){ return r.label !== maxRow.label && r.label !== minRow.label; })[0] || maxRow).label + ' has the fewest',
      (notInGraph[0] || minRow.label) + ' has the fewest'
    ];
    tagFor[falsy[0]] = _73MF; tagFor[falsy[1]] = _73WB; tagFor[falsy[2]] = _73WB;
  } else if (statementType === 'total') {
    truthful = 'There are ' + total + ' filled cells in the whole graph';
    falsy = [
      'There are ' + rows[0].count + ' filled cells in the whole graph',
      'There are ' + (total + 1) + ' filled cells in the whole graph',
      'There are ' + Math.max(0, total - 1) + ' filled cells in the whole graph'
    ];
    tagFor[falsy[0]] = _73TC; tagFor[falsy[1]] = _73DB; tagFor[falsy[2]] = _73MB;
  } else {
    // 'label'
    truthful = maxRow.label + ' is one of the categories in the graph';
    falsy = [
      (notInGraph[0] || 'Toys') + ' is one of the categories in the graph',
      (notInGraph[1] || notInGraph[0] || 'Nature') + ' is one of the categories in the graph',
      minRow.label + ' is not in the graph'
    ];
    tagFor[falsy[0]] = _73WB; tagFor[falsy[1]] = _73WB; tagFor[falsy[2]] = _73WB;
  }
  var seen = {}; seen[truthful] = true;
  var unique = [];
  falsy.forEach(function(s){ if (!seen[s]) { seen[s] = true; unique.push(s); } });
  var bump = 5;
  while (unique.length < 3) {
    var fb = 'There are exactly ' + (total + bump++) + ' filled cells in the whole graph';
    if (!seen[fb]) { unique.push(fb); seen[fb] = true; }
  }
  var opts = [
    {val: truthful},
    {val: unique[0], tag: tagFor[unique[0]] || _73WB},
    {val: unique[1], tag: tagFor[unique[1]] || _73WB},
    {val: unique[2], tag: tagFor[unique[2]] || _73WB}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the bar graph. Which statement is true?',
    s: _u7BarTypeGraph(rows),
    o: opts, a: aIdx,
    e: 'The true statement is: "' + truthful + '." Check each statement against the graph.',
    d: diff,
    h: 'Read each statement. Check it against the graph. Pick the one that matches.',
    sk: 'read_build_bar_graphs',
    i: _i73TotalVsCategory()
  };
}

// ── L7.3 key ideas ────────────────────────────────────────────────────────────
var _l73KeyIdeas = [
  'A bar-type graph shows data as bars made of cells. Each bar is one category, and each cell in a bar is one item from that category.',
  'One cell means one item. To find how many, count the cells in that bar one at a time.',
  'Every bar has a label. The label tells you what category the bar stands for.',
  'The longest bar has the most. The shortest bar has the fewest. Compare bar lengths to see which is most or fewest.',
  'A bar-type graph and a data set match only when every bar has the same number of cells as the count for that category in the data.',
  'The total is the count of all filled cells across every bar. Touch each cell once and count them all.'
];

// ── L7.3 worked examples ──────────────────────────────────────────────────────
var _l73Examples = [
  {
    id: 'g1-u7-l3-ex-1',
    title: 'Example 1: Read a bar',
    prompt: 'How many votes does the Toys bar show?',
    visual: {type: 'rawHtml', html: _u7BarTypeGraph([
      {label: 'Fruit',   count: 4},
      {label: 'Animals', count: 2},
      {label: 'Toys',    count: 5}
    ])},
    steps: [
      'Find the bar labeled Toys.',
      'Touch each cell in the Toys bar one at a time.',
      'Count: 1, 2, 3, 4, 5.',
      'There are 5 cells in the Toys bar.'
    ],
    finalAnswer: 'The Toys bar shows 5.'
  },
  {
    id: 'g1-u7-l3-ex-2',
    title: 'Example 2: Most and fewest',
    prompt: 'Which category has the most? Which has the fewest?',
    visual: {type: 'rawHtml', html: _u7BarTypeGraph([
      {label: 'Fruit',   count: 3},
      {label: 'Animals', count: 1},
      {label: 'Toys',    count: 4}
    ])},
    steps: [
      'Look at every bar.',
      'The Toys bar is the longest — 4 cells.',
      'The Animals bar is the shortest — 1 cell.',
      'Most = Toys. Fewest = Animals.'
    ],
    finalAnswer: 'Toys has the most. Animals has the fewest.'
  },
  {
    id: 'g1-u7-l3-ex-3',
    title: 'Example 3: Match data to a bar graph',
    prompt: 'Which bar graph matches: Fruit 3, Animals 2?',
    visual: {type: 'rawHtml', html:
      _u7DataTable([{label:'Fruit',count:3},{label:'Animals',count:2}]) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ which one matches? ↓</div>' +
      _u7BarTypeGraph([
        {label:'Fruit',  count:3},
        {label:'Animals',count:2}
      ])},
    steps: [
      'Read the data: Fruit needs 3, Animals needs 2.',
      'Count the Fruit bar in the graph — 3 cells.',
      'Count the Animals bar in the graph — 2 cells.',
      'Every bar matches the data.'
    ],
    finalAnswer: 'The graph above matches: Fruit = 3, Animals = 2.'
  },
  {
    id: 'g1-u7-l3-ex-4',
    title: 'Example 4: Complete a bar',
    prompt: 'Which bar should have 4 cells to match the data?',
    visual: {type: 'rawHtml', html:
      _u7DataTable([{label:'Toys',count:4},{label:'Fruit',count:2}]) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ partial graph ↓</div>' +
      _u7BarTypeGraph([
        {label:'Toys',  count:2},
        {label:'Fruit', count:2}
      ])},
    steps: [
      'Read the data: Toys needs 4 and Fruit needs 2.',
      'Count each bar in the graph.',
      'The Toys bar has 2 cells, but the data says 4. That bar is short.',
      'The Fruit bar has 2 cells and the data says 2. That bar matches.',
      'The Toys bar is the one that should have 4 cells.'
    ],
    finalAnswer: 'The Toys bar should have 4 cells.'
  },
  {
    id: 'g1-u7-l3-ex-5',
    title: 'Example 5: Fix a bar graph error',
    prompt: 'Find the mistake. Data says Fruit 3, Animals 2.',
    visual: {type: 'rawHtml', html:
      _u7DataTable([{label:'Fruit',count:3},{label:'Animals',count:2}]) +
      '<div style="text-align:center;color:#5a7080;font-size:13px;margin:6px 0">↓ but the graph shows ↓</div>' +
      _u7BarTypeGraph([
        {label:'Fruit',  count:3},
        {label:'Animals',count:1}
      ])},
    steps: [
      'Compare each bar of the graph to the data.',
      'Fruit: graph has 3, data says 3 — match.',
      'Animals: graph has 1, data says 2 — mismatch.',
      'The Animals bar is wrong — it is short one cell.'
    ],
    finalAnswer: 'The Animals bar is wrong (short one cell).'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L7.3 question banks (10 categories, 140 total)
//  Target: 45E / 55M / 40H
//  C1 read-count(18) + C2 most(14) + C3 fewest(14) + C4 data→graph(15) +
//  C5 graph→data(15) + C6 build-bar(14) + C7 label(11) + C8 fix-error(13) +
//  C9 total(13) + C10 mixed(13)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Read category count (18 = 6E / 8M / 4H) ──────────────────────────────
var _l73C1 = [
  // Easy (6)
  _q73ReadCategoryCount([
    {label:'Fruit', count:2}, {label:'Animals', count:1}
  ], 'Fruit', 'e', 0),
  _q73ReadCategoryCount([
    {label:'Toys', count:2}, {label:'Nature', count:3}
  ], 'Nature', 'e', 1),
  _q73ReadCategoryCount([
    {label:'Fruit', count:1}, {label:'Animals', count:3}
  ], 'Animals', 'e', 2),
  _q73ReadCategoryCount([
    {label:'Toys', count:3}, {label:'Fruit', count:2}
  ], 'Toys', 'e', 3),
  _q73ReadCategoryCount([
    {label:'Animals', count:2}, {label:'Toys', count:1}
  ], 'Animals', 'e', 0),
  _q73ReadCategoryCount([
    {label:'Nature', count:2}, {label:'Fruit', count:3}
  ], 'Fruit', 'e', 2),
  // Medium (8)
  _q73ReadCategoryCount([
    {label:'Fruit', count:4}, {label:'Animals', count:2}
  ], 'Fruit', 'm', 1),
  _q73ReadCategoryCount([
    {label:'Toys', count:4}, {label:'Nature', count:3}
  ], 'Toys', 'm', 2),
  _q73ReadCategoryCount([
    {label:'Fruit', count:3}, {label:'Animals', count:4}
  ], 'Animals', 'm', 0),
  _q73ReadCategoryCount([
    {label:'Toys', count:3}, {label:'Fruit', count:4}, {label:'Animals', count:1}
  ], 'Fruit', 'm', 3),
  _q73ReadCategoryCount([
    {label:'Fruit', count:2}, {label:'Animals', count:3}, {label:'Nature', count:2}
  ], 'Animals', 'm', 0),
  _q73ReadCategoryCount([
    {label:'Toys', count:2}, {label:'Nature', count:4}, {label:'Fruit', count:1}
  ], 'Nature', 'm', 1),
  _q73ReadCategoryCount([
    {label:'Fruit', count:2}, {label:'Toys', count:3}
  ], 'Toys', 'm', 2),
  _q73ReadCategoryCount([
    {label:'Animals', count:3}, {label:'Nature', count:2}
  ], 'Animals', 'm', 0),
  // Hard (4)
  _q73ReadCategoryCount([
    {label:'Fruit', count:4}, {label:'Animals', count:4}, {label:'Toys', count:3}
  ], 'Animals', 'h', 1),
  _q73ReadCategoryCount([
    {label:'Toys', count:3}, {label:'Nature', count:4}, {label:'Fruit', count:3}
  ], 'Nature', 'h', 0),
  _q73ReadCategoryCount([
    {label:'Animals', count:4}, {label:'Fruit', count:4}, {label:'Nature', count:3}
  ], 'Fruit', 'h', 2),
  _q73ReadCategoryCount([
    {label:'Fruit', count:3}, {label:'Toys', count:4}, {label:'Animals', count:2}
  ], 'Toys', 'h', 3)
];

// ── C2: Identify most (14 = 5E / 5M / 4H) ────────────────────────────────────
var _l73C2 = [
  // Easy (5)
  _q73IdentifyMost([
    {label:'Fruit', count:3}, {label:'Animals', count:1}
  ], 'e', 0),
  _q73IdentifyMost([
    {label:'Toys', count:1}, {label:'Nature', count:3}
  ], 'e', 1),
  _q73IdentifyMost([
    {label:'Fruit', count:1}, {label:'Animals', count:4}
  ], 'e', 2),
  _q73IdentifyMost([
    {label:'Toys', count:4}, {label:'Fruit', count:1}
  ], 'e', 3),
  _q73IdentifyMost([
    {label:'Animals', count:2}, {label:'Nature', count:4}
  ], 'e', 0),
  // Medium (5)
  _q73IdentifyMost([
    {label:'Fruit', count:2}, {label:'Toys', count:3}
  ], 'm', 1),
  _q73IdentifyMost([
    {label:'Fruit', count:3}, {label:'Animals', count:4}
  ], 'm', 2),
  _q73IdentifyMost([
    {label:'Toys', count:4}, {label:'Nature', count:2}
  ], 'm', 3),
  _q73IdentifyMost([
    {label:'Fruit', count:4}, {label:'Toys', count:2}, {label:'Animals', count:1}
  ], 'm', 0),
  _q73IdentifyMost([
    {label:'Nature', count:4}, {label:'Fruit', count:1}, {label:'Animals', count:2}
  ], 'm', 0),
  // Hard (4)
  _q73IdentifyMost([
    {label:'Fruit', count:4}, {label:'Animals', count:3}, {label:'Toys', count:2}
  ], 'h', 0),
  _q73IdentifyMost([
    {label:'Toys', count:2}, {label:'Nature', count:3}, {label:'Fruit', count:4}
  ], 'h', 2),
  _q73IdentifyMost([
    {label:'Animals', count:2}, {label:'Fruit', count:3}, {label:'Nature', count:5}
  ], 'h', 1),
  _q73IdentifyMost([
    {label:'Fruit', count:1}, {label:'Animals', count:5}, {label:'Toys', count:3}
  ], 'h', 3)
];

// ── C3: Identify fewest (14 = 5E / 5M / 4H) ──────────────────────────────────
var _l73C3 = [
  // Easy (5)
  _q73IdentifyFewest([
    {label:'Fruit', count:3}, {label:'Animals', count:1}
  ], 'e', 1),
  _q73IdentifyFewest([
    {label:'Toys', count:1}, {label:'Nature', count:3}
  ], 'e', 0),
  _q73IdentifyFewest([
    {label:'Fruit', count:1}, {label:'Animals', count:4}
  ], 'e', 0),
  _q73IdentifyFewest([
    {label:'Toys', count:4}, {label:'Fruit', count:1}
  ], 'e', 2),
  _q73IdentifyFewest([
    {label:'Animals', count:2}, {label:'Nature', count:4}
  ], 'e', 3),
  // Medium (5)
  _q73IdentifyFewest([
    {label:'Fruit', count:2}, {label:'Toys', count:3}
  ], 'm', 0),
  _q73IdentifyFewest([
    {label:'Fruit', count:3}, {label:'Animals', count:4}
  ], 'm', 1),
  _q73IdentifyFewest([
    {label:'Toys', count:4}, {label:'Nature', count:2}
  ], 'm', 2),
  _q73IdentifyFewest([
    {label:'Fruit', count:4}, {label:'Toys', count:2}, {label:'Animals', count:1}
  ], 'm', 3),
  _q73IdentifyFewest([
    {label:'Nature', count:4}, {label:'Fruit', count:1}, {label:'Animals', count:2}
  ], 'm', 0),
  // Hard (4)
  _q73IdentifyFewest([
    {label:'Fruit', count:4}, {label:'Animals', count:3}, {label:'Toys', count:2}
  ], 'h', 1),
  _q73IdentifyFewest([
    {label:'Toys', count:2}, {label:'Nature', count:3}, {label:'Fruit', count:4}
  ], 'h', 0),
  _q73IdentifyFewest([
    {label:'Animals', count:3}, {label:'Fruit', count:2}, {label:'Nature', count:5}
  ], 'h', 2),
  _q73IdentifyFewest([
    {label:'Fruit', count:2}, {label:'Animals', count:4}, {label:'Toys', count:1}
  ], 'h', 3)
];

// ── C4: Match data → graph (imgChoice) (15 = 4E / 7M / 4H) ───────────────────
var _l73C4 = [
  // Easy (4)
  _q73MatchDataToGraph([
    {label:'Fruit', count:2}, {label:'Animals', count:1}
  ], 'e', 0),
  _q73MatchDataToGraph([
    {label:'Toys', count:2}, {label:'Nature', count:3}
  ], 'e', 1),
  _q73MatchDataToGraph([
    {label:'Fruit', count:3}, {label:'Animals', count:2}
  ], 'e', 2),
  _q73MatchDataToGraph([
    {label:'Toys', count:1}, {label:'Fruit', count:3}
  ], 'e', 3),
  // Medium (7)
  _q73MatchDataToGraph([
    {label:'Fruit', count:4}, {label:'Animals', count:2}
  ], 'm', 0),
  _q73MatchDataToGraph([
    {label:'Toys', count:3}, {label:'Nature', count:4}
  ], 'm', 1),
  _q73MatchDataToGraph([
    {label:'Animals', count:3}, {label:'Fruit', count:2}
  ], 'm', 2),
  _q73MatchDataToGraph([
    {label:'Nature', count:3}, {label:'Toys', count:3}
  ], 'm', 3),
  _q73MatchDataToGraph([
    {label:'Fruit', count:2}, {label:'Animals', count:2}, {label:'Toys', count:1}
  ], 'm', 0),
  _q73MatchDataToGraph([
    {label:'Toys', count:2}, {label:'Nature', count:2}, {label:'Fruit', count:1}
  ], 'm', 1),
  _q73MatchDataToGraph([
    {label:'Fruit', count:3}, {label:'Animals', count:1}, {label:'Nature', count:2}
  ], 'm', 2),
  // Hard (4)
  _q73MatchDataToGraph([
    {label:'Fruit', count:4}, {label:'Animals', count:3}, {label:'Toys', count:2}
  ], 'h', 3),
  _q73MatchDataToGraph([
    {label:'Toys', count:4}, {label:'Nature', count:3}, {label:'Animals', count:2}
  ], 'h', 0),
  _q73MatchDataToGraph([
    {label:'Animals', count:3}, {label:'Fruit', count:4}, {label:'Nature', count:2}
  ], 'h', 1),
  _q73MatchDataToGraph([
    {label:'Nature', count:4}, {label:'Toys', count:3}, {label:'Fruit', count:2}
  ], 'h', 2)
];

// ── C5: Match graph → data table (15 = 4E / 7M / 4H) ─────────────────────────
var _l73C5 = [
  // Easy (4)
  _q73MatchGraphToData([
    {label:'Fruit', count:2}, {label:'Animals', count:1}
  ], 'e', 0),
  _q73MatchGraphToData([
    {label:'Toys', count:3}, {label:'Nature', count:1}
  ], 'e', 1),
  _q73MatchGraphToData([
    {label:'Fruit', count:3}, {label:'Animals', count:2}
  ], 'e', 2),
  _q73MatchGraphToData([
    {label:'Toys', count:2}, {label:'Fruit', count:3}
  ], 'e', 3),
  // Medium (7)
  _q73MatchGraphToData([
    {label:'Fruit', count:4}, {label:'Animals', count:3}
  ], 'm', 0),
  _q73MatchGraphToData([
    {label:'Toys', count:4}, {label:'Nature', count:2}
  ], 'm', 1),
  _q73MatchGraphToData([
    {label:'Animals', count:2}, {label:'Fruit', count:4}
  ], 'm', 2),
  _q73MatchGraphToData([
    {label:'Nature', count:3}, {label:'Toys', count:2}
  ], 'm', 3),
  _q73MatchGraphToData([
    {label:'Fruit', count:3}, {label:'Animals', count:2}, {label:'Toys', count:1}
  ], 'm', 0),
  _q73MatchGraphToData([
    {label:'Toys', count:3}, {label:'Nature', count:2}, {label:'Fruit', count:2}
  ], 'm', 1),
  _q73MatchGraphToData([
    {label:'Animals', count:4}, {label:'Fruit', count:2}, {label:'Toys', count:1}
  ], 'm', 2),
  // Hard (4)
  _q73MatchGraphToData([
    {label:'Fruit', count:4}, {label:'Animals', count:3}, {label:'Toys', count:3}
  ], 'h', 3),
  _q73MatchGraphToData([
    {label:'Toys', count:4}, {label:'Nature', count:3}, {label:'Animals', count:2}
  ], 'h', 0),
  _q73MatchGraphToData([
    {label:'Animals', count:2}, {label:'Fruit', count:4}, {label:'Nature', count:3}
  ], 'h', 1),
  _q73MatchGraphToData([
    {label:'Nature', count:4}, {label:'Toys', count:2}, {label:'Fruit', count:3}
  ], 'h', 2)
];

// ── C6: Build / complete a bar (14 = 4E / 5M / 5H) ───────────────────────────
var _l73C6 = [
  // Easy (4)
  _q73BuildBar([
    {label:'Fruit', count:3}, {label:'Animals', count:2}
  ], 0, 'e', 0),
  _q73BuildBar([
    {label:'Toys', count:2}, {label:'Nature', count:4}
  ], 1, 'e', 1),
  _q73BuildBar([
    {label:'Animals', count:3}, {label:'Fruit', count:2}
  ], 0, 'e', 0),
  _q73BuildBar([
    {label:'Nature', count:2}, {label:'Toys', count:3}
  ], 1, 'e', 1),
  // Medium (5)
  _q73BuildBar([
    {label:'Fruit', count:4}, {label:'Animals', count:2}
  ], 0, 'm', 0),
  _q73BuildBar([
    {label:'Toys', count:4}, {label:'Nature', count:3}
  ], 1, 'm', 2),
  _q73BuildBar([
    {label:'Fruit', count:2}, {label:'Animals', count:3}, {label:'Toys', count:1}
  ], 1, 'm', 1),
  _q73BuildBar([
    {label:'Nature', count:3}, {label:'Toys', count:2}, {label:'Fruit', count:2}
  ], 0, 'm', 0),
  _q73BuildBar([
    {label:'Animals', count:4}, {label:'Fruit', count:2}, {label:'Nature', count:1}
  ], 0, 'm', 2),
  // Hard (5)
  _q73BuildBar([
    {label:'Fruit', count:4}, {label:'Animals', count:3}, {label:'Toys', count:2}
  ], 1, 'h', 0),
  _q73BuildBar([
    {label:'Toys', count:3}, {label:'Nature', count:4}, {label:'Animals', count:2}
  ], 2, 'h', 1),
  _q73BuildBar([
    {label:'Animals', count:4}, {label:'Fruit', count:3}, {label:'Nature', count:2}
  ], 0, 'h', 2),
  _q73BuildBar([
    {label:'Nature', count:4}, {label:'Toys', count:3}, {label:'Fruit', count:2}
  ], 2, 'h', 0),
  _q73BuildBar([
    {label:'Fruit', count:3}, {label:'Animals', count:4}, {label:'Toys', count:3}
  ], 1, 'h', 1)
];

// ── C7: Identify category labels (11 = 4E / 4M / 3H) ─────────────────────────
var _l73C7 = [
  // Easy (4)
  _q73IdentifyLabel([
    {label:'Fruit', count:3}, {label:'Animals', count:2}
  ], 0, 'e', 0),
  _q73IdentifyLabel([
    {label:'Toys', count:3}, {label:'Nature', count:2}
  ], 1, 'e', 1),
  _q73IdentifyLabel([
    {label:'Animals', count:3}, {label:'Fruit', count:2}
  ], 0, 'e', 2),
  _q73IdentifyLabel([
    {label:'Nature', count:3}, {label:'Toys', count:2}
  ], 1, 'e', 3),
  // Medium (4)
  _q73IdentifyLabel([
    {label:'Fruit', count:3}, {label:'Animals', count:2}, {label:'Toys', count:2}
  ], 2, 'm', 0),
  _q73IdentifyLabel([
    {label:'Toys', count:3}, {label:'Nature', count:3}, {label:'Animals', count:2}
  ], 1, 'm', 1),
  _q73IdentifyLabel([
    {label:'Animals', count:3}, {label:'Fruit', count:2}, {label:'Nature', count:2}
  ], 0, 'm', 2),
  _q73IdentifyLabel([
    {label:'Nature', count:3}, {label:'Toys', count:3}, {label:'Fruit', count:2}
  ], 0, 'm', 3),
  // Hard (3)
  _q73IdentifyLabel([
    {label:'Fruit', count:4}, {label:'Animals', count:1}, {label:'Toys', count:2}
  ], 1, 'h', 0),
  _q73IdentifyLabel([
    {label:'Toys', count:4}, {label:'Nature', count:1}, {label:'Animals', count:2}
  ], 1, 'h', 1),
  _q73IdentifyLabel([
    {label:'Animals', count:3}, {label:'Fruit', count:3}, {label:'Nature', count:1}
  ], 2, 'h', 2)
];

// ── C8: Fix error (13 = 3E / 5M / 5H) ────────────────────────────────────────
var _l73C8 = [
  // Easy (3)
  _q73FixError([
    {label:'Fruit', count:3}, {label:'Animals', count:2}
  ], 1, -1, 'e', 0),
  _q73FixError([
    {label:'Toys', count:2}, {label:'Nature', count:3}
  ], 0, 1, 'e', 1),
  _q73FixError([
    {label:'Animals', count:3}, {label:'Fruit', count:2}
  ], 0, -1, 'e', 2),
  // Medium (5)
  _q73FixError([
    {label:'Fruit', count:4}, {label:'Animals', count:3}
  ], 1, -1, 'm', 1),
  _q73FixError([
    {label:'Toys', count:3}, {label:'Nature', count:2}
  ], 0, 1, 'm', 0),
  _q73FixError([
    {label:'Fruit', count:2}, {label:'Animals', count:3}, {label:'Toys', count:1}
  ], 1, -1, 'm', 2),
  _q73FixError([
    {label:'Nature', count:3}, {label:'Toys', count:2}, {label:'Fruit', count:2}
  ], 2, 1, 'm', 3),
  _q73FixError([
    {label:'Animals', count:2}, {label:'Fruit', count:3}, {label:'Nature', count:2}
  ], 0, 1, 'm', 0),
  // Hard (5)
  _q73FixError([
    {label:'Fruit', count:4}, {label:'Animals', count:3}, {label:'Toys', count:2}
  ], 1, -1, 'h', 1),
  _q73FixError([
    {label:'Toys', count:3}, {label:'Nature', count:4}, {label:'Animals', count:2}
  ], 2, 1, 'h', 2),
  _q73FixError([
    {label:'Animals', count:4}, {label:'Fruit', count:3}, {label:'Nature', count:2}
  ], 0, -1, 'h', 0),
  _q73FixError([
    {label:'Nature', count:4}, {label:'Toys', count:3}, {label:'Fruit', count:2}
  ], 1, -1, 'h', 3),
  _q73FixError([
    {label:'Fruit', count:3}, {label:'Animals', count:3}, {label:'Toys', count:3}
  ], 2, 1, 'h', 2)
];

// ── C9: Read total cells (13 = 4E / 5M / 4H) — totals ≤ 10 ───────────────────
var _l73C9 = [
  // Easy (4) — total ≤ 5
  _q73CountTotal([
    {label:'Fruit', count:2}, {label:'Animals', count:1}
  ], 'e', 0),
  _q73CountTotal([
    {label:'Toys', count:2}, {label:'Nature', count:2}
  ], 'e', 1),
  _q73CountTotal([
    {label:'Fruit', count:1}, {label:'Animals', count:3}
  ], 'e', 2),
  _q73CountTotal([
    {label:'Toys', count:3}, {label:'Fruit', count:2}
  ], 'e', 3),
  // Medium (5) — total 6–8
  _q73CountTotal([
    {label:'Fruit', count:3}, {label:'Animals', count:3}
  ], 'm', 0),
  _q73CountTotal([
    {label:'Toys', count:4}, {label:'Nature', count:2}
  ], 'm', 1),
  _q73CountTotal([
    {label:'Animals', count:2}, {label:'Fruit', count:4}
  ], 'm', 2),
  _q73CountTotal([
    {label:'Fruit', count:2}, {label:'Animals', count:2}, {label:'Toys', count:2}
  ], 'm', 3),
  _q73CountTotal([
    {label:'Nature', count:2}, {label:'Toys', count:3}, {label:'Fruit', count:3}
  ], 'm', 0),
  // Hard (4) — total 9–10
  _q73CountTotal([
    {label:'Fruit', count:3}, {label:'Animals', count:3}, {label:'Toys', count:3}
  ], 'h', 1),
  _q73CountTotal([
    {label:'Toys', count:3}, {label:'Nature', count:4}, {label:'Animals', count:3}
  ], 'h', 2),
  _q73CountTotal([
    {label:'Animals', count:2}, {label:'Fruit', count:4}, {label:'Nature', count:4}
  ], 'h', 0),
  _q73CountTotal([
    {label:'Nature', count:3}, {label:'Toys', count:3}, {label:'Fruit', count:4}
  ], 'h', 3)
];

// ── C10: Mixed review (13 = 6E / 4M / 3H) — graph-reading only ───────────────
var _l73C10 = [
  // Easy (6)
  _q73MixedReview([
    {label:'Fruit', count:3}, {label:'Animals', count:1}
  ], 'most', 'e', 0),
  _q73MixedReview([
    {label:'Toys', count:1}, {label:'Nature', count:3}
  ], 'fewest', 'e', 1),
  _q73MixedReview([
    {label:'Fruit', count:2}, {label:'Animals', count:2}
  ], 'count', 'e', 2),
  _q73MixedReview([
    {label:'Animals', count:3}, {label:'Toys', count:1}
  ], 'most', 'e', 3),
  _q73MixedReview([
    {label:'Nature', count:1}, {label:'Fruit', count:3}
  ], 'fewest', 'e', 0),
  _q73MixedReview([
    {label:'Toys', count:3}, {label:'Fruit', count:1}
  ], 'label', 'e', 1),
  // Medium (4)
  _q73MixedReview([
    {label:'Fruit', count:3}, {label:'Animals', count:2}
  ], 'total', 'm', 0),
  _q73MixedReview([
    {label:'Toys', count:4}, {label:'Nature', count:2}
  ], 'count', 'm', 2),
  _q73MixedReview([
    {label:'Animals', count:4}, {label:'Fruit', count:2}, {label:'Toys', count:1}
  ], 'most', 'm', 1),
  _q73MixedReview([
    {label:'Nature', count:2}, {label:'Toys', count:3}, {label:'Fruit', count:1}
  ], 'fewest', 'm', 3),
  // Hard (3)
  _q73MixedReview([
    {label:'Fruit', count:3}, {label:'Animals', count:3}, {label:'Toys', count:4}
  ], 'total', 'h', 0),
  _q73MixedReview([
    {label:'Toys', count:2}, {label:'Nature', count:4}, {label:'Animals', count:3}
  ], 'most', 'h', 2),
  _q73MixedReview([
    {label:'Animals', count:2}, {label:'Fruit', count:4}, {label:'Nature', count:1}
  ], 'fewest', 'h', 1)
];

// ── L7.3 combined bank ───────────────────────────────────────────────────────
var _l73Bank = [].concat(_l73C1, _l73C2, _l73C3, _l73C4, _l73C5, _l73C6, _l73C7, _l73C8, _l73C9, _l73C10);


// ════════════════════════════════════════════════════════════════════════════
//  L7.4 — Drawing Conclusions from Data
//  TEKS 1.8C | 135 questions (40E / 55M / 40H)
//  Students arrive with 280 fluent graph reads (140 picture from L7.2,
//  140 bar from L7.3). L7.4 puts those graphs to work answering simple
//  conclusion questions.
//
//  10 categories: C1 most, C2 fewest, C3 in-all, C4 more, C5 fewer,
//  C6 compare-two, C7 true-conclusion, C8 false-conclusion,
//  C9 match-question-to-answer, C10 error-repair.
//
//  Hard guardrails (verified by scope scans before lock):
//    NO scaled picture graphs. NO scaled bar graphs. NO graph keys.
//    NO skip-count scales. NO axes, tick marks, or y-axis labels.
//    NO line plots, dot plots, mean, median, mode, histograms.
//    NO multi-step problems, NO more than one operation per question.
//    NO Grade 2 data-analysis content.
//    NO drag-and-drop, NO imgChoice (multipleChoice only).
//    NO more than 3 graph categories per question.
//    NO equation symbols (+, -, −, =) anywhere in student-facing strings.
//    Per-category counts capped at 6 (5 in 3-cat). Differences 1–4.
//    Total visible items ≤ 10 for "how many in all" questions.
// ════════════════════════════════════════════════════════════════════════════

// ── L7.4 error tags ──────────────────────────────────────────────────────────
var _74MF  = 'err_most_fewest_confusion';
var _74TC  = 'err_total_vs_category_confusion';
var _74HMM = 'err_how_many_more_confusion';
var _74HMF = 'err_how_many_fewer_confusion';
var _74CW  = 'err_compares_wrong_categories';
var _74SD  = 'err_subtracts_wrong_direction';
var _74CG  = 'err_counts_graph_wrong';
var _74TS  = 'err_true_statement_confusion';
var _74FS  = 'err_false_statement_confusion';
var _74NS  = 'err_conclusion_not_supported';

// ── L7.4 visual helpers ──────────────────────────────────────────────────────
// Convert {label, count} row defs into picture-graph row defs by cycling
// through the category's item pool. Used by _u74Graph below.
function _u74PicRows(rows) {
  return rows.map(function(r){
    var pool = _U7_CAT_ITEMS[r.label] || [];
    var items = [];
    for (var i = 0; i < r.count; i++) items.push(pool[i % pool.length] || 'flower');
    return {label: r.label, items: items};
  });
}

// _u74Graph — render rows as either a picture graph or a bar graph. Every
// L7.4 question takes a graph-type flag ('pic' or 'bar') so each category
// can alternate between the two and reinforce that the conclusion skill
// works the same on either kind of graph.
function _u74Graph(rows, g) {
  if (g === 'bar') return _u7BarTypeGraph(rows);
  return _u7PictureGraph(_u74PicRows(rows));
}

// ── L7.4 teaching visuals (intervention overlays) ────────────────────────────
function _u74TvMost() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Toys',  count: 4},
    {label: 'Fruit', count: 1}
  ]), 'Toys has the longest bar. Toys has the most.');
}
function _u74TvFewest() {
  return _u7TvWrap(_u7PictureGraph(_u74PicRows([
    {label: 'Fruit',   count: 4},
    {label: 'Animals', count: 1}
  ])), 'Animals has the shortest row. Animals has the fewest.');
}
function _u74TvTotal() {
  return _u7TvWrap(_u7PictureGraph(_u74PicRows([
    {label: 'Fruit',   count: 2},
    {label: 'Animals', count: 3}
  ])), 'For the total, touch each picture in every row one time. Count them all: 1, 2, 3, 4, 5.');
}
function _u74TvHowManyMore() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Animals', count: 5},
    {label: 'Fruit',   count: 3}
  ]), 'Animals has 5. Fruit has 3. The gap is 2. There are 2 more Animals than Fruit.');
}
function _u74TvHowManyFewer() {
  return _u7TvWrap(_u7PictureGraph(_u74PicRows([
    {label: 'Toys',    count: 2},
    {label: 'Fruit',   count: 5}
  ])), 'Fruit has 5. Toys has 2. The gap is 3. There are 3 fewer Toys than Fruit.');
}
function _u74TvCompare() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Fruit',   count: 4},
    {label: 'Animals', count: 2}
  ]), 'A sentence about two categories is true only when the numbers in it match the graph.');
}
function _u74TvTrueSentence() {
  return _u7TvWrap(_u7PictureGraph(_u74PicRows([
    {label: 'Animals', count: 3},
    {label: 'Toys',    count: 1}
  ])), 'A statement is true only when every number in it matches the graph.');
}
function _u74TvFalseSentence() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Fruit',   count: 2},
    {label: 'Animals', count: 4}
  ]), 'A false statement has at least one number that does not match the graph. Check every sentence.');
}
function _u74TvMatchQA() {
  return _u7TvWrap(_u7BarTypeGraph([
    {label: 'Toys',  count: 5},
    {label: 'Fruit', count: 2}
  ]), 'Read the question. Find the rows it names. Use the graph to answer.');
}
function _u74TvErrorRepair() {
  return _u7TvWrap(_u7PictureGraph(_u74PicRows([
    {label: 'Animals', count: 5},
    {label: 'Fruit',   count: 3}
  ])), 'The graph shows Animals has 5 and Fruit has 3. The gap is 2. The correct fix names the right gap.');
}

// ── L7.4 intervention factories ──────────────────────────────────────────────
function _i74MostFewest() { return {
  errorTag: _74MF, title: 'Most is the longest. Fewest is the shortest.',
  teachingSteps: [
    '"Most" means the biggest count. That is the longest row or bar.',
    '"Fewest" means the smallest count. That is the shortest row or bar.',
    'Compare every category before you choose.',
    'Do not pick the opposite of what is asked.'
  ],
  teachingVisualRaw: _u74TvMost(),
  correctAnswerExplanation: 'Most is the longest. Fewest is the shortest.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74TotalVsCategory() { return {
  errorTag: _74TC, title: 'In all means the whole graph',
  teachingSteps: [
    '"In all" asks about the whole graph.',
    'Touch every picture or cell in every row one time.',
    'Count them all.',
    'Do not stop at one category.'
  ],
  teachingVisualRaw: _u74TvTotal(),
  correctAnswerExplanation: 'For "in all," count every picture or every cell across every row.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74HowManyMore() { return {
  errorTag: _74HMM, title: 'Find the gap',
  teachingSteps: [
    'Find the two rows the question names.',
    'Count the bigger row and the smaller row.',
    'The answer is the gap between them.',
    'Start from the bigger count and find how many extra it has.'
  ],
  teachingVisualRaw: _u74TvHowManyMore(),
  correctAnswerExplanation: '"How many more" is the gap between the bigger count and the smaller count.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74HowManyFewer() { return {
  errorTag: _74HMF, title: 'How many fewer is also the gap',
  teachingSteps: [
    'Find the two rows the question names.',
    '"How many fewer" asks for the same gap as "how many more."',
    'Start from the bigger count and find how many extra it has.',
    'That gap is your answer.'
  ],
  teachingVisualRaw: _u74TvHowManyFewer(),
  correctAnswerExplanation: '"How many fewer" asks for the same gap, from the other side.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74CompareWrong() { return {
  errorTag: _74CW, title: 'Use only the categories named',
  teachingSteps: [
    'Read the question slowly. Which two categories does it name?',
    'Find those two rows in the graph.',
    'Do not drift to a different pair.',
    'Do not use a category the graph does not show.'
  ],
  teachingVisualRaw: _u74TvCompare(),
  correctAnswerExplanation: 'Compare only the two categories the question names — nothing else.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74SubtractDirection() { return {
  errorTag: _74SD, title: 'Start from the bigger count',
  teachingSteps: [
    'Find the bigger row and the smaller row.',
    'Start at the bigger count.',
    'Find how many extra cells it has beyond the smaller row.',
    'That gap is the answer — not the smaller count itself.'
  ],
  teachingVisualRaw: _u74TvHowManyMore(),
  correctAnswerExplanation: 'Always work from the bigger count. The gap is the extra it has beyond the smaller one.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74CountsWrong() { return {
  errorTag: _74CG, title: 'Count each one carefully',
  teachingSteps: [
    'Touch each picture or cell one time as you count.',
    'Do not skip any.',
    'Do not count the same one twice.',
    'Stop at the last one.'
  ],
  teachingVisualRaw: _u74TvTotal(),
  correctAnswerExplanation: 'Touch each picture or cell once. Do not skip, do not double-count.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74TrueSentence() { return {
  errorTag: _74TS, title: 'Every number must match',
  teachingSteps: [
    'Read each sentence carefully.',
    'Check every number in the sentence against the graph.',
    'A sentence is true only when all of its numbers match.',
    'If even one number is wrong, the sentence is false.'
  ],
  teachingVisualRaw: _u74TvTrueSentence(),
  correctAnswerExplanation: 'A true sentence has every number matching what the graph shows.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74FalseSentence() { return {
  errorTag: _74FS, title: 'Find the one that does not match',
  teachingSteps: [
    'The question asks for the sentence that does not match.',
    'Check every sentence against the graph.',
    'Three of them are true.',
    'Pick the one with at least one number that does not match.'
  ],
  teachingVisualRaw: _u74TvFalseSentence(),
  correctAnswerExplanation: 'The false sentence has at least one number that does not match the graph.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i74Unsupported() { return {
  errorTag: _74NS, title: 'Use only what the graph shows',
  teachingSteps: [
    'A conclusion must come from the graph in front of you.',
    'If a sentence names a category the graph does not show, it cannot be true.',
    'Stick to the rows the graph has.',
    'Do not invent new categories.'
  ],
  teachingVisualRaw: _u74TvCompare(),
  correctAnswerExplanation: 'A supported conclusion uses only categories the graph actually shows.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L7.4 question factory functions ──────────────────────────────────────────

// _q74IdentifyMost — C1: graph + "Which has the most?" with 4 category names.
// rows: [{label, count}]  g: 'pic' | 'bar'
function _q74IdentifyMost(rows, g, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return b.count - a.count; });
  var winner = sorted[0].label;
  var fewest = sorted[sorted.length - 1].label;
  var middle = sorted.length >= 3 ? sorted[1].label : null;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var raw = [
    {val: fewest,                                   tag: _74MF},
    {val: middle || notInGraph[0] || fewest,        tag: _74CG},
    {val: notInGraph[middle ? 0 : 1] || notInGraph[0] || fewest, tag: _74NS}
  ];
  var seen = {}; seen[winner] = true;
  var clean = [];
  for (var i = 0; i < raw.length; i++) {
    if (raw[i].val && !seen[raw[i].val]) { seen[raw[i].val] = true; clean.push(raw[i]); }
  }
  for (var k = 0; k < _U7_CATEGORIES.length && clean.length < 3; k++) {
    var c = _U7_CATEGORIES[k];
    if (!seen[c]) { seen[c] = true; clean.push({val: c, tag: _74NS}); }
  }
  var opts = [{val: winner}].concat(clean.slice(0,3));
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. Which category has the most?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: 'The ' + winner + ' row is the longest. ' + winner + ' has the most.',
    d: diff,
    h: 'Find the longest row or bar. That category has the most.',
    sk: 'draw_conclusions_from_data',
    i: _i74MostFewest()
  };
}

// _q74IdentifyFewest — C2: graph + "Which has the fewest?" with 4 category names.
function _q74IdentifyFewest(rows, g, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return a.count - b.count; });
  var fewest = sorted[0].label;
  var most = sorted[sorted.length - 1].label;
  var middle = sorted.length >= 3 ? sorted[1].label : null;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var raw = [
    {val: most,                                     tag: _74MF},
    {val: middle || notInGraph[0] || most,          tag: _74CG},
    {val: notInGraph[middle ? 0 : 1] || notInGraph[0] || most, tag: _74NS}
  ];
  var seen = {}; seen[fewest] = true;
  var clean = [];
  for (var i = 0; i < raw.length; i++) {
    if (raw[i].val && !seen[raw[i].val]) { seen[raw[i].val] = true; clean.push(raw[i]); }
  }
  for (var k = 0; k < _U7_CATEGORIES.length && clean.length < 3; k++) {
    var c = _U7_CATEGORIES[k];
    if (!seen[c]) { seen[c] = true; clean.push({val: c, tag: _74NS}); }
  }
  var opts = [{val: fewest}].concat(clean.slice(0,3));
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. Which category has the fewest?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: 'The ' + fewest + ' row is the shortest. ' + fewest + ' has the fewest.',
    d: diff,
    h: 'Find the shortest row or bar. That category has the fewest.',
    sk: 'draw_conclusions_from_data',
    i: _i74MostFewest()
  };
}

// _q74HowManyInAll — C3: graph + "How many in all?" Total visible ≤ 10.
function _q74HowManyInAll(rows, g, diff, aIdx) {
  var total = rows.reduce(function(s,r){ return s + r.count; }, 0);
  var biggestRow = rows.reduce(function(a,b){ return a.count >= b.count ? a : b; });
  var seen = {}; seen[String(total)] = true;
  var wrongs = [];
  function tryAdd(val, tag) {
    var v = String(val);
    if (val < 0 || seen[v]) return;
    seen[v] = true;
    wrongs.push({val: v, tag: tag});
  }
  tryAdd(biggestRow.count, _74TC);    // counts only one category
  tryAdd(total + 1, _74CG);            // off by one (double-count)
  tryAdd(Math.max(0, total - 1), _74CG); // off by one (missed)
  tryAdd(rows[0].count, _74TC);        // counts only first row
  var bump = 2;
  while (wrongs.length < 3) {
    var f = total + bump++;
    if (!seen[String(f)]) { seen[String(f)] = true; wrongs.push({val: String(f), tag: _74CG}); }
  }
  var opts = [{val: String(total)}].concat(wrongs.slice(0,3));
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. How many in all?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: 'Count every picture or cell across every row. There are ' + total + ' in all.',
    d: diff,
    h: 'Count every picture or cell in every row. Do not stop at one row.',
    sk: 'draw_conclusions_from_data',
    i: _i74TotalVsCategory()
  };
}

// _q74HowManyMore — C4: graph + "How many more X than Y?" X > Y, gap 1–4.
function _q74HowManyMore(rows, biggerCat, smallerCat, g, diff, aIdx) {
  var bigger = rows.filter(function(r){ return r.label === biggerCat; })[0].count;
  var smaller = rows.filter(function(r){ return r.label === smallerCat; })[0].count;
  var gap = bigger - smaller;
  var seen = {}; seen[String(gap)] = true;
  var wrongs = [];
  function tryAdd(val, tag) {
    var v = String(val);
    if (val < 0 || seen[v]) return;
    seen[v] = true;
    wrongs.push({val: v, tag: tag});
  }
  tryAdd(bigger,                     _74HMM); // picks the bigger raw count
  tryAdd(smaller,                    _74SD);  // picks the smaller raw count
  tryAdd(gap + 1,                    _74CG);  // off by one
  tryAdd(Math.max(0, gap - 1),       _74CG);  // off by one (under)
  tryAdd(bigger + smaller,           _74TC);  // total
  var bump = 2;
  while (wrongs.length < 3) {
    var f = gap + bump++;
    if (!seen[String(f)]) { seen[String(f)] = true; wrongs.push({val: String(f), tag: _74CG}); }
  }
  var opts = [{val: String(gap)}].concat(wrongs.slice(0,3));
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. How many more ' + biggerCat + ' than ' + smallerCat + '?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: biggerCat + ' has ' + bigger + '. ' + smallerCat + ' has ' + smaller + '. The gap is ' + gap + '. There are ' + gap + ' more ' + biggerCat + ' than ' + smallerCat + '.',
    d: diff,
    h: 'Find the ' + biggerCat + ' row and the ' + smallerCat + ' row. The gap between them is the answer.',
    sk: 'draw_conclusions_from_data',
    i: _i74HowManyMore()
  };
}

// _q74HowManyFewer — C5: graph + "How many fewer X than Y?" X < Y, gap 1–4.
function _q74HowManyFewer(rows, smallerCat, biggerCat, g, diff, aIdx) {
  var bigger = rows.filter(function(r){ return r.label === biggerCat; })[0].count;
  var smaller = rows.filter(function(r){ return r.label === smallerCat; })[0].count;
  var gap = bigger - smaller;
  var seen = {}; seen[String(gap)] = true;
  var wrongs = [];
  function tryAdd(val, tag) {
    var v = String(val);
    if (val < 0 || seen[v]) return;
    seen[v] = true;
    wrongs.push({val: v, tag: tag});
  }
  tryAdd(smaller,                    _74HMF); // picks the smaller raw count
  tryAdd(bigger,                     _74SD);  // picks the bigger raw count
  tryAdd(gap + 1,                    _74CG);
  tryAdd(Math.max(0, gap - 1),       _74CG);
  tryAdd(bigger + smaller,           _74TC);
  var bump = 2;
  while (wrongs.length < 3) {
    var f = gap + bump++;
    if (!seen[String(f)]) { seen[String(f)] = true; wrongs.push({val: String(f), tag: _74CG}); }
  }
  var opts = [{val: String(gap)}].concat(wrongs.slice(0,3));
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. How many fewer ' + smallerCat + ' than ' + biggerCat + '?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: biggerCat + ' has ' + bigger + '. ' + smallerCat + ' has ' + smaller + '. The gap is ' + gap + '. There are ' + gap + ' fewer ' + smallerCat + ' than ' + biggerCat + '.',
    d: diff,
    h: 'Find the two rows. The gap between the bigger and the smaller is the answer.',
    sk: 'draw_conclusions_from_data',
    i: _i74HowManyFewer()
  };
}

// _q74CompareTwo — C6: graph + 4 candidate comparison sentences. Caller
// passes biggerCat (X) and smallerCat (Y), with X > Y by gap ≥ 1.
function _q74CompareTwo(rows, biggerCat, smallerCat, g, diff, aIdx) {
  var bigger = rows.filter(function(r){ return r.label === biggerCat; })[0].count;
  var smaller = rows.filter(function(r){ return r.label === smallerCat; })[0].count;
  var gap = bigger - smaller;
  var correctSentence = biggerCat + ' has ' + gap + ' more than ' + smallerCat;
  var wrongDir = smallerCat + ' has ' + gap + ' more than ' + biggerCat;
  var sameClaim = biggerCat + ' and ' + smallerCat + ' are the same';
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var ng = notInGraph[0] || 'Nature';
  var unrelated = ng + ' has the most';
  var opts = [
    {val: correctSentence},
    {val: wrongDir,  tag: _74SD},
    {val: sameClaim, tag: _74CW},
    {val: unrelated, tag: _74NS}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. Which sentence is true?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: biggerCat + ' has ' + bigger + '. ' + smallerCat + ' has ' + smaller + '. The gap is ' + gap + '. So ' + biggerCat + ' has ' + gap + ' more than ' + smallerCat + '.',
    d: diff,
    h: 'Compare the two rows the sentence names. Find the gap.',
    sk: 'draw_conclusions_from_data',
    i: _i74CompareWrong()
  };
}

// _q74TrueConclusion — C7: graph + 4 sentences, one is true. Sentence mix
// includes "X has the most," "Y has the fewest," "X has K more than Y,"
// "X has K." Distractors flip numbers, categories, or use unsupported cats.
function _q74TrueConclusion(rows, sentenceType, g, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return b.count - a.count; });
  var most = sorted[0];
  var fewest = sorted[sorted.length - 1];
  var gap = most.count - fewest.count;
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var ng = notInGraph[0] || 'Nature';

  var correctSentence, wrong1, wrong2, wrong3;
  var t1, t2, t3;
  if (sentenceType === 'most') {
    correctSentence = most.label + ' has the most';
    wrong1 = fewest.label + ' has the most';
    wrong2 = ng + ' has the most';
    wrong3 = most.label + ' has the fewest';
    t1 = _74MF; t2 = _74NS; t3 = _74TS;
  } else if (sentenceType === 'fewest') {
    correctSentence = fewest.label + ' has the fewest';
    wrong1 = most.label + ' has the fewest';
    wrong2 = ng + ' has the fewest';
    wrong3 = fewest.label + ' has the most';
    t1 = _74MF; t2 = _74NS; t3 = _74TS;
  } else if (sentenceType === 'gap') {
    correctSentence = most.label + ' has ' + gap + ' more than ' + fewest.label;
    wrong1 = fewest.label + ' has ' + gap + ' more than ' + most.label;
    wrong2 = most.label + ' has ' + (gap + 1) + ' more than ' + fewest.label;
    wrong3 = ng + ' has ' + gap + ' more than ' + fewest.label;
    t1 = _74SD; t2 = _74CG; t3 = _74NS;
  } else {
    // 'count' — "X has K" sentence
    correctSentence = most.label + ' has ' + most.count;
    wrong1 = most.label + ' has ' + (most.count + 1);
    wrong2 = most.label + ' has ' + Math.max(0, most.count - 1);
    wrong3 = ng + ' has ' + most.count;
    t1 = _74CG; t2 = _74CG; t3 = _74NS;
  }
  var opts = [
    {val: correctSentence},
    {val: wrong1, tag: t1},
    {val: wrong2, tag: t2},
    {val: wrong3, tag: t3}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. Which sentence is true?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: 'True: "' + correctSentence + '." The others have at least one number or category that does not match the graph.',
    d: diff,
    h: 'Check every sentence against the graph. Pick the one where all the numbers match.',
    sk: 'draw_conclusions_from_data',
    i: _i74TrueSentence()
  };
}

// _q74FalseConclusion — C8: graph + 4 sentences, three are true, one is false.
// The student picks the false one. Sentence types are mixed.
function _q74FalseConclusion(rows, g, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return b.count - a.count; });
  var most = sorted[0];
  var fewest = sorted[sorted.length - 1];
  var gap = most.count - fewest.count;
  var total = rows.reduce(function(s,r){ return s + r.count; }, 0);

  // Three true sentences
  var trueA = most.label + ' has the most';
  var trueB = fewest.label + ' has the fewest';
  var trueC = 'There are ' + total + ' in all';
  // One false sentence (the correct answer to "which does NOT match")
  // Use a wrong-direction gap claim
  var falseSentence = fewest.label + ' has ' + gap + ' more than ' + most.label;

  // Build options: false answer first (correct slot), then the three true ones as distractors
  var opts = [
    {val: falseSentence},
    {val: trueA, tag: _74FS},
    {val: trueB, tag: _74FS},
    {val: trueC, tag: _74FS}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. Which sentence does NOT match?',
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: '"' + falseSentence + '" is false. ' + most.label + ' has more than ' + fewest.label + ', not the other way. The other three sentences all match the graph.',
    d: diff,
    h: 'Three sentences are true. One has a number or direction that does not match. Pick the wrong one.',
    sk: 'draw_conclusions_from_data',
    i: _i74FalseSentence()
  };
}

// _q74MatchQA — C9: graph + a stated question + 4 numeric options.
// mode: 'inAll' | 'more' | 'fewer' | 'count' | 'most' | 'fewest'
function _q74MatchQA(rows, mode, askA, askB, g, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return b.count - a.count; });
  var most = sorted[0];
  var fewest = sorted[sorted.length - 1];
  var total = rows.reduce(function(s,r){ return s + r.count; }, 0);
  var questionText, correctVal, interventionFn;
  var distractorVals = [];
  var distractorTags = [];

  if (mode === 'inAll') {
    questionText = 'How many in all?';
    correctVal = total;
    distractorVals = [most.count, total + 1, Math.max(0, total - 1)];
    distractorTags = [_74TC, _74CG, _74CG];
    interventionFn = _i74TotalVsCategory;
  } else if (mode === 'more') {
    var biggerR = rows.filter(function(r){ return r.label === askA; })[0];
    var smallerR = rows.filter(function(r){ return r.label === askB; })[0];
    var bigA = biggerR.count, smA = smallerR.count, gapA = bigA - smA;
    questionText = 'How many more ' + askA + ' than ' + askB + '?';
    correctVal = gapA;
    distractorVals = [bigA, smA, gapA + 1];
    distractorTags = [_74HMM, _74SD, _74CG];
    interventionFn = _i74HowManyMore;
  } else if (mode === 'fewer') {
    var bigR = rows.filter(function(r){ return r.label === askB; })[0];
    var smR = rows.filter(function(r){ return r.label === askA; })[0];
    var bigF = bigR.count, smF = smR.count, gapF = bigF - smF;
    questionText = 'How many fewer ' + askA + ' than ' + askB + '?';
    correctVal = gapF;
    distractorVals = [smF, bigF, gapF + 1];
    distractorTags = [_74HMF, _74SD, _74CG];
    interventionFn = _i74HowManyFewer;
  } else if (mode === 'count') {
    var target = rows.filter(function(r){ return r.label === askA; })[0];
    questionText = 'How many ' + askA + '?';
    correctVal = target.count;
    distractorVals = [target.count + 1, Math.max(0, target.count - 1), total];
    distractorTags = [_74CG, _74CG, _74TC];
    interventionFn = _i74CountsWrong;
  } else if (mode === 'most') {
    // numeric answer = max count
    questionText = 'How many does ' + most.label + ' have?';
    correctVal = most.count;
    distractorVals = [fewest.count, most.count + 1, Math.max(0, most.count - 1)];
    distractorTags = [_74MF, _74CG, _74CG];
    interventionFn = _i74CountsWrong;
  } else {
    // 'fewest' — numeric answer = min count
    questionText = 'How many does ' + fewest.label + ' have?';
    correctVal = fewest.count;
    distractorVals = [most.count, fewest.count + 1, Math.max(0, fewest.count - 1)];
    distractorTags = [_74MF, _74CG, _74CG];
    interventionFn = _i74CountsWrong;
  }

  // Dedupe numeric distractors
  var seen = {}; seen[String(correctVal)] = true;
  var wrongs = [];
  for (var i = 0; i < distractorVals.length; i++) {
    var v = String(distractorVals[i]);
    if (distractorVals[i] >= 0 && !seen[v]) { seen[v] = true; wrongs.push({val: v, tag: distractorTags[i]}); }
  }
  var bump = 2;
  while (wrongs.length < 3) {
    var f = correctVal + bump++;
    if (!seen[String(f)]) { seen[String(f)] = true; wrongs.push({val: String(f), tag: _74CG}); }
  }
  var opts = [{val: String(correctVal)}].concat(wrongs.slice(0,3));
  opts = _u7Place(opts, aIdx);
  return {
    t: 'Look at the graph. ' + questionText,
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: 'The graph answers the question with ' + correctVal + '. Read the rows the question names.',
    d: diff,
    h: 'Read the question. Use the graph to find the answer.',
    sk: 'draw_conclusions_from_data',
    i: interventionFn()
  };
}

// _q74ErrorRepair — C10: graph + a student's wrong statement + 4 fix choices.
// mistakeType: 'wrongMost' | 'wrongGap' | 'wrongCount'
function _q74ErrorRepair(rows, mistakeType, askA, askB, g, diff, aIdx) {
  var sorted = rows.slice().sort(function(a,b){ return b.count - a.count; });
  var most = sorted[0];
  var fewest = sorted[sorted.length - 1];
  var notInGraph = _U7_CATEGORIES.filter(function(c){
    return !rows.some(function(r){ return r.label === c; });
  });
  var ng = notInGraph[0] || 'Nature';

  var studentClaim, correctFix, wrong1, wrong2, wrong3;
  var t1, t2, t3;
  if (mistakeType === 'wrongMost') {
    // Student wrongly says fewest has the most
    studentClaim = 'A student says ' + fewest.label + ' has the most. What is the correct fix?';
    correctFix = most.label + ' has the most, not ' + fewest.label;
    wrong1 = fewest.label + ' has the fewest, not the most';      // close-but-still-not-the-fix
    wrong2 = ng + ' has the most';                                // wrong category
    wrong3 = most.label + ' and ' + fewest.label + ' are the same'; // wrong sameness
    t1 = _74TS; t2 = _74NS; t3 = _74CW;
  } else if (mistakeType === 'wrongGap') {
    // Student names the wrong gap between most and fewest
    var actualGap = most.count - fewest.count;
    var wrongGap = actualGap + 2;
    studentClaim = 'A student says ' + most.label + ' has ' + wrongGap + ' more than ' + fewest.label + '. What is the correct fix?';
    correctFix = most.label + ' has ' + actualGap + ' more, not ' + wrongGap + ' more';
    wrong1 = fewest.label + ' has ' + actualGap + ' more than ' + most.label;        // wrong direction
    wrong2 = most.label + ' and ' + fewest.label + ' are the same';                   // sameness
    wrong3 = ng + ' has ' + actualGap + ' more than ' + most.label;                   // wrong cat
    t1 = _74SD; t2 = _74CW; t3 = _74NS;
  } else {
    // 'wrongCount' — student names the wrong count for one category
    var target = askA ? rows.filter(function(r){ return r.label === askA; })[0] : most;
    var wrongCount = target.count + 2;
    studentClaim = 'A student says ' + target.label + ' has ' + wrongCount + '. What is the correct fix?';
    correctFix = target.label + ' has ' + target.count + ', not ' + wrongCount;
    wrong1 = target.label + ' has ' + (target.count + 1);          // close miss
    wrong2 = ng + ' has ' + target.count;                           // wrong cat
    wrong3 = target.label + ' has the most';                         // off-topic
    t1 = _74CG; t2 = _74NS; t3 = _74TS;
  }

  var opts = [
    {val: correctFix},
    {val: wrong1, tag: t1},
    {val: wrong2, tag: t2},
    {val: wrong3, tag: t3}
  ];
  opts = _u7Place(opts, aIdx);
  return {
    t: studentClaim,
    s: _u74Graph(rows, g),
    o: opts, a: aIdx,
    e: 'The graph supports: "' + correctFix + '." Compare every number in the student claim to the graph.',
    d: diff,
    h: 'Check every number in the student claim against the graph. Pick the option that names the right fix.',
    sk: 'draw_conclusions_from_data',
    i: _i74Unsupported()
  };
}

// ── L7.4 key ideas (6) ───────────────────────────────────────────────────────
var _l74KeyIdeas = [
  'A graph can answer questions. Read the graph carefully, then answer.',
  '"Most" means the longest row of pictures or the longest bar. "Fewest" means the shortest.',
  '"How many in all" means count every picture or every cell across every row.',
  '"How many more" means compare two rows. Find the bigger count and the smaller count. The gap between them is the answer.',
  '"How many fewer" asks for the same gap, from the other side.',
  'A statement is true when every number in it matches what the graph shows. If even one number is wrong, the statement is false.'
];

// ── L7.4 worked examples (5) ─────────────────────────────────────────────────
var _l74Examples = [
  {
    id: 'g1-u7-l4-ex-1',
    title: 'Example 1: Find the most',
    prompt: 'Which category has the most?',
    visual: {type: 'rawHtml', html: _u7PictureGraph(_u74PicRows([
      {label: 'Fruit',   count: 3},
      {label: 'Animals', count: 1},
      {label: 'Toys',    count: 4}
    ]))},
    steps: [
      'Look at every row.',
      'The Fruit row has 3 pictures.',
      'The Animals row has 1 picture.',
      'The Toys row has 4 pictures — that is the longest row.'
    ],
    finalAnswer: 'Toys has the longest row. Toys has the most.'
  },
  {
    id: 'g1-u7-l4-ex-2',
    title: 'Example 2: Find the fewest',
    prompt: 'Which category has the fewest?',
    visual: {type: 'rawHtml', html: _u7BarTypeGraph([
      {label: 'Fruit',   count: 2},
      {label: 'Animals', count: 4},
      {label: 'Toys',    count: 1}
    ])},
    steps: [
      'Look at every bar.',
      'The Fruit bar has 2 cells.',
      'The Animals bar has 4 cells.',
      'The Toys bar has 1 cell — that is the shortest bar.'
    ],
    finalAnswer: 'Toys has the shortest bar. Toys has the fewest.'
  },
  {
    id: 'g1-u7-l4-ex-3',
    title: 'Example 3: How many in all',
    prompt: 'How many pictures are in the whole graph?',
    visual: {type: 'rawHtml', html: _u7PictureGraph(_u74PicRows([
      {label: 'Fruit',   count: 2},
      {label: 'Animals', count: 3}
    ]))},
    steps: [
      'Touch each picture in the Fruit row: 1, 2.',
      'Then keep counting in the Animals row: 3, 4, 5.',
      'Count every picture across every row.'
    ],
    finalAnswer: 'There are 5 pictures in all.'
  },
  {
    id: 'g1-u7-l4-ex-4',
    title: 'Example 4: How many more',
    prompt: 'How many more Animals than Fruit?',
    visual: {type: 'rawHtml', html: _u7BarTypeGraph([
      {label: 'Fruit',   count: 3},
      {label: 'Animals', count: 5}
    ])},
    steps: [
      'Find the Fruit bar. It has 3 cells.',
      'Find the Animals bar. It has 5 cells.',
      'Start from the bigger count. Animals has 5.',
      'Fruit has 3. The gap between 5 and 3 is 2.'
    ],
    finalAnswer: 'There are 2 more Animals than Fruit.'
  },
  {
    id: 'g1-u7-l4-ex-5',
    title: 'Example 5: True or false conclusion',
    prompt: 'Which sentence is true about the graph?',
    visual: {type: 'rawHtml', html: _u7PictureGraph(_u74PicRows([
      {label: 'Fruit',   count: 4},
      {label: 'Animals', count: 2}
    ]))},
    steps: [
      'Fruit has 4. Animals has 2. The gap is 2.',
      'Sentence A: "Fruit has 2 more than Animals." Check: yes, the gap is 2 and Fruit is bigger. True.',
      'Sentence B: "Animals has 2 more than Fruit." Wrong direction. False.',
      'Sentence C: "Fruit and Animals are the same." Their counts are not the same. False.'
    ],
    finalAnswer: 'Sentence A is true: Fruit has 2 more than Animals.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L7.4 question banks (10 categories, 135 total)
//  Target: 40E / 55M / 40H
//  C1 most(14) + C2 fewest(14) + C3 inAll(12) + C4 more(16) + C5 fewer(16) +
//  C6 compare-two(14) + C7 true-conclusion(14) + C8 false-conclusion(12) +
//  C9 match-Q-A(12) + C10 error-repair(11)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Identify Most (14 = 5E / 5M / 4H) ────────────────────────────────────
var _l74C1 = [
  // Easy (5) — 2-cat, counts 1–4
  _q74IdentifyMost([{label:'Fruit',count:3},{label:'Animals',count:1}],            'pic', 'e', 0),
  _q74IdentifyMost([{label:'Toys',count:1},{label:'Nature',count:3}],              'bar', 'e', 1),
  _q74IdentifyMost([{label:'Animals',count:4},{label:'Fruit',count:2}],            'pic', 'e', 2),
  _q74IdentifyMost([{label:'Nature',count:2},{label:'Toys',count:4}],              'bar', 'e', 3),
  _q74IdentifyMost([{label:'Fruit',count:1},{label:'Animals',count:3}],            'pic', 'e', 0),
  // Medium (5) — 2-cat bigger counts or 3-cat small counts
  _q74IdentifyMost([{label:'Fruit',count:5},{label:'Animals',count:2}],            'bar', 'm', 1),
  _q74IdentifyMost([{label:'Toys',count:6},{label:'Nature',count:1}],              'pic', 'm', 2),
  _q74IdentifyMost([{label:'Fruit',count:2},{label:'Animals',count:4},{label:'Toys',count:1}],  'bar', 'm', 0),
  _q74IdentifyMost([{label:'Nature',count:3},{label:'Toys',count:1},{label:'Fruit',count:4}],   'pic', 'm', 3),
  _q74IdentifyMost([{label:'Toys',count:3},{label:'Animals',count:6}],             'bar', 'm', 1),
  // Hard (4) — 3-cat near-equal counts
  _q74IdentifyMost([{label:'Fruit',count:4},{label:'Animals',count:3},{label:'Toys',count:5}],  'bar', 'h', 2),
  _q74IdentifyMost([{label:'Nature',count:5},{label:'Toys',count:4},{label:'Animals',count:3}], 'pic', 'h', 0),
  _q74IdentifyMost([{label:'Animals',count:3},{label:'Fruit',count:4},{label:'Nature',count:5}],'bar', 'h', 3),
  _q74IdentifyMost([{label:'Toys',count:4},{label:'Fruit',count:5},{label:'Nature',count:3}],   'pic', 'h', 1)
];

// ── C2: Identify Fewest (14 = 5E / 5M / 4H) ──────────────────────────────────
var _l74C2 = [
  // Easy (5)
  _q74IdentifyFewest([{label:'Fruit',count:3},{label:'Animals',count:1}],          'pic', 'e', 0),
  _q74IdentifyFewest([{label:'Toys',count:1},{label:'Nature',count:3}],            'bar', 'e', 1),
  _q74IdentifyFewest([{label:'Animals',count:4},{label:'Fruit',count:2}],          'pic', 'e', 2),
  _q74IdentifyFewest([{label:'Nature',count:2},{label:'Toys',count:4}],            'bar', 'e', 3),
  _q74IdentifyFewest([{label:'Fruit',count:1},{label:'Animals',count:3}],          'pic', 'e', 0),
  // Medium (5)
  _q74IdentifyFewest([{label:'Fruit',count:5},{label:'Animals',count:2}],          'bar', 'm', 1),
  _q74IdentifyFewest([{label:'Toys',count:6},{label:'Nature',count:1}],            'pic', 'm', 2),
  _q74IdentifyFewest([{label:'Fruit',count:2},{label:'Animals',count:4},{label:'Toys',count:1}], 'bar', 'm', 0),
  _q74IdentifyFewest([{label:'Nature',count:3},{label:'Toys',count:1},{label:'Fruit',count:4}],  'pic', 'm', 3),
  _q74IdentifyFewest([{label:'Toys',count:3},{label:'Animals',count:6}],           'bar', 'm', 1),
  // Hard (4)
  _q74IdentifyFewest([{label:'Fruit',count:4},{label:'Animals',count:3},{label:'Toys',count:5}], 'bar', 'h', 2),
  _q74IdentifyFewest([{label:'Nature',count:5},{label:'Toys',count:4},{label:'Animals',count:3}],'pic', 'h', 0),
  _q74IdentifyFewest([{label:'Animals',count:3},{label:'Fruit',count:4},{label:'Nature',count:5}],'bar', 'h', 3),
  _q74IdentifyFewest([{label:'Toys',count:4},{label:'Fruit',count:5},{label:'Nature',count:3}],  'pic', 'h', 1)
];

// ── C3: How Many In All (12 = 3E / 5M / 4H) ──────────────────────────────────
// Constraint: every row's count cap, and the SUM across rows ≤ 10.
var _l74C3 = [
  // Easy (3) — small totals
  _q74HowManyInAll([{label:'Fruit',count:2},{label:'Animals',count:1}],            'pic', 'e', 0),
  _q74HowManyInAll([{label:'Toys',count:2},{label:'Nature',count:2}],              'bar', 'e', 1),
  _q74HowManyInAll([{label:'Fruit',count:3},{label:'Animals',count:1}],            'pic', 'e', 2),
  // Medium (5)
  _q74HowManyInAll([{label:'Toys',count:3},{label:'Nature',count:4}],              'bar', 'm', 0),
  _q74HowManyInAll([{label:'Animals',count:2},{label:'Fruit',count:5}],            'pic', 'm', 1),
  _q74HowManyInAll([{label:'Toys',count:4},{label:'Nature',count:4}],              'bar', 'm', 2),
  _q74HowManyInAll([{label:'Fruit',count:3},{label:'Animals',count:2},{label:'Toys',count:1}],   'pic', 'm', 3),
  _q74HowManyInAll([{label:'Nature',count:2},{label:'Toys',count:2},{label:'Fruit',count:3}],    'bar', 'm', 0),
  // Hard (4) — 3-cat, totals up to 10
  _q74HowManyInAll([{label:'Fruit',count:4},{label:'Animals',count:2},{label:'Toys',count:3}],   'bar', 'h', 1),
  _q74HowManyInAll([{label:'Nature',count:3},{label:'Toys',count:3},{label:'Animals',count:4}],  'pic', 'h', 2),
  _q74HowManyInAll([{label:'Fruit',count:2},{label:'Animals',count:3},{label:'Nature',count:5}], 'bar', 'h', 3),
  _q74HowManyInAll([{label:'Toys',count:3},{label:'Fruit',count:4},{label:'Animals',count:3}],   'pic', 'h', 0)
];

// ── C4: How Many More (16 = 4E / 7M / 5H) ────────────────────────────────────
// Format: rows + (biggerCat, smallerCat). gap = bigger.count - smaller.count.
var _l74C4 = [
  // Easy (4) — 2-cat, gap 1–3
  _q74HowManyMore([{label:'Fruit',count:3},{label:'Animals',count:1}],   'Fruit',   'Animals', 'pic', 'e', 0),
  _q74HowManyMore([{label:'Toys',count:4},{label:'Nature',count:2}],     'Toys',    'Nature',  'bar', 'e', 1),
  _q74HowManyMore([{label:'Animals',count:4},{label:'Fruit',count:1}],   'Animals', 'Fruit',   'pic', 'e', 2),
  _q74HowManyMore([{label:'Nature',count:3},{label:'Toys',count:2}],     'Nature',  'Toys',    'bar', 'e', 3),
  // Medium (7)
  _q74HowManyMore([{label:'Fruit',count:5},{label:'Animals',count:2}],   'Fruit',   'Animals', 'pic', 'm', 0),
  _q74HowManyMore([{label:'Toys',count:6},{label:'Nature',count:3}],     'Toys',    'Nature',  'bar', 'm', 1),
  _q74HowManyMore([{label:'Animals',count:6},{label:'Fruit',count:2}],   'Animals', 'Fruit',   'pic', 'm', 2),
  _q74HowManyMore([{label:'Nature',count:5},{label:'Toys',count:1}],     'Nature',  'Toys',    'bar', 'm', 3),
  _q74HowManyMore([{label:'Fruit',count:4},{label:'Animals',count:2},{label:'Toys',count:1}],   'Fruit',   'Animals', 'bar', 'm', 0),
  _q74HowManyMore([{label:'Toys',count:5},{label:'Nature',count:3},{label:'Fruit',count:1}],    'Toys',    'Nature',  'pic', 'm', 1),
  _q74HowManyMore([{label:'Animals',count:4},{label:'Fruit',count:3},{label:'Nature',count:2}], 'Animals', 'Fruit',   'bar', 'm', 2),
  // Hard (5) — 3-cat, near-equal counts
  _q74HowManyMore([{label:'Fruit',count:5},{label:'Animals',count:4},{label:'Toys',count:3}],   'Fruit',   'Animals', 'pic', 'h', 0),
  _q74HowManyMore([{label:'Toys',count:5},{label:'Nature',count:2},{label:'Fruit',count:3}],    'Toys',    'Fruit',   'bar', 'h', 1),
  _q74HowManyMore([{label:'Animals',count:5},{label:'Toys',count:2},{label:'Nature',count:4}],  'Animals', 'Toys',    'pic', 'h', 2),
  _q74HowManyMore([{label:'Fruit',count:5},{label:'Animals',count:1},{label:'Nature',count:4}], 'Fruit',   'Animals', 'bar', 'h', 3),
  _q74HowManyMore([{label:'Toys',count:4},{label:'Fruit',count:3},{label:'Nature',count:5}],    'Nature',  'Fruit',   'pic', 'h', 0)
];

// ── C5: How Many Fewer (16 = 4E / 7M / 5H) ───────────────────────────────────
// Format: rows + (smallerCat, biggerCat). gap = bigger.count - smaller.count.
var _l74C5 = [
  // Easy (4)
  _q74HowManyFewer([{label:'Animals',count:1},{label:'Fruit',count:3}],  'Animals', 'Fruit',  'pic', 'e', 0),
  _q74HowManyFewer([{label:'Nature',count:2},{label:'Toys',count:4}],    'Nature',  'Toys',   'bar', 'e', 1),
  _q74HowManyFewer([{label:'Fruit',count:1},{label:'Animals',count:4}],  'Fruit',   'Animals','pic', 'e', 2),
  _q74HowManyFewer([{label:'Toys',count:2},{label:'Nature',count:3}],    'Toys',    'Nature', 'bar', 'e', 3),
  // Medium (7)
  _q74HowManyFewer([{label:'Animals',count:2},{label:'Fruit',count:5}],  'Animals', 'Fruit',  'pic', 'm', 0),
  _q74HowManyFewer([{label:'Nature',count:3},{label:'Toys',count:6}],    'Nature',  'Toys',   'bar', 'm', 1),
  _q74HowManyFewer([{label:'Fruit',count:2},{label:'Animals',count:6}],  'Fruit',   'Animals','pic', 'm', 2),
  _q74HowManyFewer([{label:'Toys',count:1},{label:'Nature',count:5}],    'Toys',    'Nature', 'bar', 'm', 3),
  _q74HowManyFewer([{label:'Animals',count:2},{label:'Fruit',count:4},{label:'Toys',count:1}], 'Animals', 'Fruit',  'bar', 'm', 0),
  _q74HowManyFewer([{label:'Nature',count:3},{label:'Toys',count:5},{label:'Fruit',count:1}],  'Nature',  'Toys',   'pic', 'm', 1),
  _q74HowManyFewer([{label:'Fruit',count:3},{label:'Animals',count:4},{label:'Nature',count:2}],'Fruit',  'Animals','bar', 'm', 2),
  // Hard (5)
  _q74HowManyFewer([{label:'Animals',count:4},{label:'Fruit',count:5},{label:'Toys',count:3}], 'Animals', 'Fruit',  'pic', 'h', 0),
  _q74HowManyFewer([{label:'Nature',count:2},{label:'Toys',count:5},{label:'Fruit',count:3}],  'Nature',  'Toys',   'bar', 'h', 1),
  _q74HowManyFewer([{label:'Toys',count:2},{label:'Animals',count:5},{label:'Nature',count:4}],'Toys',    'Animals','pic', 'h', 2),
  _q74HowManyFewer([{label:'Animals',count:1},{label:'Fruit',count:5},{label:'Nature',count:4}],'Animals','Fruit',  'bar', 'h', 3),
  _q74HowManyFewer([{label:'Fruit',count:3},{label:'Toys',count:4},{label:'Nature',count:5}],  'Fruit',   'Nature', 'pic', 'h', 0)
];

// ── C6: Compare Two Categories (14 = 4E / 6M / 4H) ───────────────────────────
// Correct sentence form: "X has N more than Y." Always X > Y.
var _l74C6 = [
  // Easy (4)
  _q74CompareTwo([{label:'Fruit',count:3},{label:'Animals',count:1}],   'Fruit',   'Animals', 'pic', 'e', 0),
  _q74CompareTwo([{label:'Toys',count:4},{label:'Nature',count:2}],     'Toys',    'Nature',  'bar', 'e', 1),
  _q74CompareTwo([{label:'Animals',count:4},{label:'Fruit',count:1}],   'Animals', 'Fruit',   'pic', 'e', 2),
  _q74CompareTwo([{label:'Nature',count:3},{label:'Toys',count:2}],     'Nature',  'Toys',    'bar', 'e', 3),
  // Medium (6)
  _q74CompareTwo([{label:'Fruit',count:5},{label:'Animals',count:2}],   'Fruit',   'Animals', 'pic', 'm', 0),
  _q74CompareTwo([{label:'Toys',count:6},{label:'Nature',count:3}],     'Toys',    'Nature',  'bar', 'm', 1),
  _q74CompareTwo([{label:'Animals',count:4},{label:'Fruit',count:2},{label:'Toys',count:1}],   'Animals', 'Fruit',   'pic', 'm', 2),
  _q74CompareTwo([{label:'Nature',count:5},{label:'Toys',count:1},{label:'Animals',count:3}],  'Nature',  'Toys',    'bar', 'm', 3),
  _q74CompareTwo([{label:'Fruit',count:6},{label:'Animals',count:2}],   'Fruit',   'Animals', 'pic', 'm', 0),
  _q74CompareTwo([{label:'Toys',count:5},{label:'Nature',count:4}],     'Toys',    'Nature',  'bar', 'm', 1),
  // Hard (4) — 3-cat
  _q74CompareTwo([{label:'Fruit',count:5},{label:'Animals',count:4},{label:'Toys',count:3}],   'Fruit',   'Animals', 'bar', 'h', 0),
  _q74CompareTwo([{label:'Nature',count:5},{label:'Toys',count:2},{label:'Fruit',count:3}],    'Nature',  'Fruit',   'pic', 'h', 1),
  _q74CompareTwo([{label:'Animals',count:4},{label:'Fruit',count:5},{label:'Nature',count:2}], 'Fruit',   'Nature',  'bar', 'h', 2),
  _q74CompareTwo([{label:'Toys',count:5},{label:'Fruit',count:3},{label:'Nature',count:1}],    'Toys',    'Fruit',   'pic', 'h', 3)
];

// ── C7: Choose True Conclusion (14 = 4E / 6M / 4H) ───────────────────────────
// sentenceType cycles: 'most', 'fewest', 'gap', 'count'
var _l74C7 = [
  // Easy (4)
  _q74TrueConclusion([{label:'Fruit',count:3},{label:'Animals',count:1}], 'most',   'pic', 'e', 0),
  _q74TrueConclusion([{label:'Toys',count:4},{label:'Nature',count:2}],   'fewest', 'bar', 'e', 1),
  _q74TrueConclusion([{label:'Animals',count:4},{label:'Fruit',count:1}], 'gap',    'pic', 'e', 2),
  _q74TrueConclusion([{label:'Nature',count:3},{label:'Toys',count:2}],   'count',  'bar', 'e', 3),
  // Medium (6)
  _q74TrueConclusion([{label:'Fruit',count:5},{label:'Animals',count:2}], 'most',   'pic', 'm', 0),
  _q74TrueConclusion([{label:'Toys',count:6},{label:'Nature',count:1}],   'fewest', 'bar', 'm', 1),
  _q74TrueConclusion([{label:'Fruit',count:3},{label:'Animals',count:4},{label:'Toys',count:1}], 'gap',   'pic', 'm', 2),
  _q74TrueConclusion([{label:'Nature',count:2},{label:'Toys',count:5},{label:'Animals',count:3}],'count', 'bar', 'm', 3),
  _q74TrueConclusion([{label:'Fruit',count:2},{label:'Animals',count:6}], 'gap',    'pic', 'm', 0),
  _q74TrueConclusion([{label:'Toys',count:3},{label:'Nature',count:5}],   'most',   'bar', 'm', 1),
  // Hard (4) — 3-cat
  _q74TrueConclusion([{label:'Fruit',count:5},{label:'Animals',count:4},{label:'Toys',count:3}], 'fewest', 'bar', 'h', 0),
  _q74TrueConclusion([{label:'Nature',count:5},{label:'Toys',count:2},{label:'Animals',count:3}],'gap',    'pic', 'h', 1),
  _q74TrueConclusion([{label:'Animals',count:4},{label:'Fruit',count:5},{label:'Nature',count:3}],'count', 'bar', 'h', 2),
  _q74TrueConclusion([{label:'Toys',count:5},{label:'Fruit',count:3},{label:'Nature',count:1}],   'most',  'pic', 'h', 3)
];

// ── C8: Find False Conclusion (12 = 4E / 4M / 4H) ────────────────────────────
// Three sentences are true, one is false (wrong-direction gap claim). Student picks the false one.
var _l74C8 = [
  // Easy (4)
  _q74FalseConclusion([{label:'Fruit',count:3},{label:'Animals',count:1}], 'pic', 'e', 0),
  _q74FalseConclusion([{label:'Toys',count:4},{label:'Nature',count:2}],   'bar', 'e', 1),
  _q74FalseConclusion([{label:'Animals',count:4},{label:'Fruit',count:1}], 'pic', 'e', 2),
  _q74FalseConclusion([{label:'Nature',count:3},{label:'Toys',count:2}],   'bar', 'e', 3),
  // Medium (4)
  _q74FalseConclusion([{label:'Fruit',count:5},{label:'Animals',count:2}], 'pic', 'm', 0),
  _q74FalseConclusion([{label:'Toys',count:6},{label:'Nature',count:1}],   'bar', 'm', 1),
  _q74FalseConclusion([{label:'Fruit',count:3},{label:'Animals',count:4},{label:'Toys',count:1}], 'pic', 'm', 2),
  _q74FalseConclusion([{label:'Nature',count:5},{label:'Toys',count:1},{label:'Animals',count:3}],'bar', 'm', 3),
  // Hard (4)
  _q74FalseConclusion([{label:'Fruit',count:5},{label:'Animals',count:4},{label:'Toys',count:3}], 'bar', 'h', 0),
  _q74FalseConclusion([{label:'Nature',count:4},{label:'Toys',count:5},{label:'Animals',count:3}],'pic', 'h', 1),
  _q74FalseConclusion([{label:'Animals',count:4},{label:'Fruit',count:5},{label:'Nature',count:3}],'bar', 'h', 2),
  _q74FalseConclusion([{label:'Toys',count:5},{label:'Fruit',count:3},{label:'Nature',count:1}],   'pic', 'h', 3)
];

// ── C9: Match Question to Answer (12 = 4E / 5M / 3H) ─────────────────────────
// Graph + stated question + 4 numeric options. mode cycles across question types.
var _l74C9 = [
  // Easy (4)
  _q74MatchQA([{label:'Fruit',count:3},{label:'Animals',count:1}], 'most',  null,       null,       'pic', 'e', 0),
  _q74MatchQA([{label:'Toys',count:4},{label:'Nature',count:2}],   'inAll', null,       null,       'bar', 'e', 1),
  _q74MatchQA([{label:'Animals',count:4},{label:'Fruit',count:1}], 'more',  'Animals',  'Fruit',    'pic', 'e', 2),
  _q74MatchQA([{label:'Nature',count:3},{label:'Toys',count:2}],   'count', 'Nature',   null,       'bar', 'e', 3),
  // Medium (5)
  _q74MatchQA([{label:'Fruit',count:5},{label:'Animals',count:2}], 'inAll', null,       null,       'pic', 'm', 0),
  _q74MatchQA([{label:'Toys',count:5},{label:'Fruit',count:2}],    'more',  'Toys',     'Fruit',    'bar', 'm', 1),
  _q74MatchQA([{label:'Animals',count:6},{label:'Fruit',count:2}], 'fewer', 'Fruit',    'Animals',  'pic', 'm', 2),
  _q74MatchQA([{label:'Nature',count:5},{label:'Toys',count:1},{label:'Animals',count:3}], 'fewest', null, null, 'bar', 'm', 3),
  _q74MatchQA([{label:'Fruit',count:4},{label:'Animals',count:2},{label:'Toys',count:1}],  'inAll',  null, null, 'pic', 'm', 0),
  // Hard (3)
  _q74MatchQA([{label:'Fruit',count:5},{label:'Animals',count:4},{label:'Toys',count:3}], 'more',  'Fruit',  'Toys',   'bar', 'h', 1),
  _q74MatchQA([{label:'Nature',count:5},{label:'Toys',count:2},{label:'Animals',count:3}],'fewer', 'Toys',   'Nature', 'pic', 'h', 2),
  _q74MatchQA([{label:'Fruit',count:3},{label:'Animals',count:4},{label:'Toys',count:2}], 'count', 'Animals',null,     'bar', 'h', 0)
];

// ── C10: Error Repair (11 = 3E / 5M / 3H) ────────────────────────────────────
// Student's wrong statement + 4 fix options. mistakeType cycles.
var _l74C10 = [
  // Easy (3)
  _q74ErrorRepair([{label:'Fruit',count:3},{label:'Animals',count:1}], 'wrongMost',  null,      null, 'pic', 'e', 0),
  _q74ErrorRepair([{label:'Toys',count:4},{label:'Nature',count:2}],   'wrongGap',   null,      null, 'bar', 'e', 1),
  _q74ErrorRepair([{label:'Animals',count:4},{label:'Fruit',count:1}], 'wrongCount', 'Animals', null, 'pic', 'e', 2),
  // Medium (5)
  _q74ErrorRepair([{label:'Fruit',count:5},{label:'Animals',count:2}], 'wrongMost',  null,      null, 'bar', 'm', 0),
  _q74ErrorRepair([{label:'Toys',count:6},{label:'Nature',count:1}],   'wrongGap',   null,      null, 'pic', 'm', 1),
  _q74ErrorRepair([{label:'Fruit',count:2},{label:'Animals',count:4},{label:'Toys',count:1}],   'wrongMost',  null,    null, 'bar', 'm', 2),
  _q74ErrorRepair([{label:'Nature',count:3},{label:'Toys',count:2},{label:'Animals',count:1}],  'wrongCount', 'Toys',  null, 'pic', 'm', 3),
  _q74ErrorRepair([{label:'Fruit',count:5},{label:'Animals',count:1}], 'wrongGap',   null,      null, 'bar', 'm', 0),
  // Hard (3)
  _q74ErrorRepair([{label:'Fruit',count:4},{label:'Animals',count:3},{label:'Toys',count:5}],   'wrongMost', null,        null, 'bar', 'h', 1),
  _q74ErrorRepair([{label:'Nature',count:5},{label:'Toys',count:2},{label:'Animals',count:3}],  'wrongGap',  null,        null, 'pic', 'h', 2),
  _q74ErrorRepair([{label:'Fruit',count:5},{label:'Animals',count:3},{label:'Toys',count:4}],   'wrongCount','Animals',   null, 'bar', 'h', 0)
];

// ── L7.4 combined bank ───────────────────────────────────────────────────────
var _l74Bank = [].concat(_l74C1, _l74C2, _l74C3, _l74C4, _l74C5, _l74C6, _l74C7, _l74C8, _l74C9, _l74C10);


// ── Unit spec ────────────────────────────────────────────────────────────────
export const G1_U7_SPEC = {
  unitId: 'g1u7',
  title: 'Data Analysis',
  teks: ['1.8A', '1.8B', '1.8C'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.1 — Sorting and Organizing Data
    //  TEKS 1.8A | 150 questions (50E / 60M / 40H)
    //  10 categories: C1 sort-2cat, C2 sort-3cat, C3 match-item, C4 count,
    //  C5 read-tally, C6 chart-match (imgChoice), C7 t-chart, C8 rule,
    //  C9 error-repair, C10 mixed-review
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l1',
      title: 'Sorting and Organizing Data',
      teks: ['1.8A'],
      skill: 'sort_and_organize_data',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l71KeyIdeas,
      workedExamples: _l71Examples,
      quizBank: _l71Bank,
      diagnostics: {
        commonDistractors: [_71WC, _71CC, _71TC, _71TG, _71SR, _71TX, _71IM, _71DR],
        errorTags:         [_71WC, _71CC, _71TC, _71TG, _71SR, _71TX, _71IM, _71DR],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.2 — Picture Graphs
    //  TEKS 1.8B (picture-graph half) | 140 questions (45E / 55M / 40H)
    //  10 categories: C1 read-count, C2 most, C3 fewest, C4 data→graph
    //  (imgChoice), C5 graph→data, C6 build-row, C7 label, C8 fix-error,
    //  C9 total (≤10 visible pictures), C10 mixed review.
    //  Scale of 1 always: one picture = one item. No scaled keys.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l2',
      title: 'Picture Graphs',
      teks: ['1.8B'],
      skill: 'read_build_picture_graphs',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l72KeyIdeas,
      workedExamples: _l72Examples,
      quizBank: _l72Bank,
      diagnostics: {
        commonDistractors: [_72PC, _72MP, _72DC, _72WR, _72MF, _72DM, _72MG, _72TC],
        errorTags:         [_72PC, _72MP, _72DC, _72WR, _72MF, _72DM, _72MG, _72TC],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.3 — Bar-Type Graphs
    //  TEKS 1.8B (bar-graph half) | 140 questions (45E / 55M / 40H)
    //  10 categories: C1 read-count, C2 most, C3 fewest, C4 data→graph
    //  (imgChoice), C5 graph→data, C6 build-bar, C7 label, C8 fix-error,
    //  C9 total (≤10 visible cells), C10 mixed review.
    //  Scale of 1 always: one cell = one item. No axes, no scaled cells.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l3',
      title: 'Bar-Type Graphs',
      teks: ['1.8B'],
      skill: 'read_build_bar_graphs',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l73KeyIdeas,
      workedExamples: _l73Examples,
      quizBank: _l73Bank,
      diagnostics: {
        commonDistractors: [_73BC, _73MB, _73DB, _73WB, _73MF, _73DM, _73MC, _73TC],
        errorTags:         [_73BC, _73MB, _73DB, _73WB, _73MF, _73DM, _73MC, _73TC],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.4 — Drawing Conclusions from Data
    //  TEKS 1.8C | 135 questions (40E / 55M / 40H)
    //  10 categories: C1 most, C2 fewest, C3 in-all, C4 more, C5 fewer,
    //  C6 compare-two, C7 true-conclusion, C8 false-conclusion,
    //  C9 match-question-to-answer, C10 error-repair.
    //  Picture and bar-type graphs interleaved. Scale of 1 always. No
    //  equation symbols in student-facing strings.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l4',
      title: 'Drawing Conclusions from Data',
      teks: ['1.8C'],
      skill: 'draw_conclusions_from_data',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l74KeyIdeas,
      workedExamples: _l74Examples,
      quizBank: _l74Bank,
      diagnostics: {
        commonDistractors: [_74MF, _74TC, _74HMM, _74HMF, _74CW, _74SD, _74CG, _74TS, _74FS, _74NS],
        errorTags:         [_74MF, _74TC, _74HMM, _74HMF, _74CW, _74SD, _74CG, _74TS, _74FS, _74NS],
        interventionRules: []
      }
    }

  ]
};

export default G1_U7_SPEC;
