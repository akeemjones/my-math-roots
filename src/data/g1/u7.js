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
 *    L7.2  Picture Graphs                    ← SCAFFOLD (0 questions)
 *    L7.3  Bar-Type Graphs                   ← SCAFFOLD (0 questions)
 *    L7.4  Drawing Conclusions from Data     ← SCAFFOLD (0 questions)
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
    //  Lesson 7.2 — Picture Graphs   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l2',
      title: 'Picture Graphs',
      teks: ['1.8B'],
      skill: 'read_build_picture_graphs',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.3 — Bar-Type Graphs   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l3',
      title: 'Bar-Type Graphs',
      teks: ['1.8B'],
      skill: 'read_build_bar_graphs',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.4 — Drawing Conclusions from Data   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l4',
      title: 'Drawing Conclusions from Data',
      teks: ['1.8C'],
      skill: 'draw_conclusions_from_data',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    }

  ]
};

export default G1_U7_SPEC;
