// ════════════════════════════════════════
//  shared_g1.js — Grade 1 Grade Data
//
//  Mirrors the shared_k.js pattern:
//    1. _UNITS_DATA_G1        — 8 unit shells (only U1 is data-loaded)
//    2. _mergeG1UnitData()    — called by dist/data/g1/u1.js at parse time
//    3. _loadG1Unit()         — lazy-loads /data/g1/u{n}.js on demand
//    4. _applyGrade1Grade()   — splices UNITS_DATA and rebinds _loadUnit
//
//  v0.2.0 compat layer: maps rich spec fields (keyIdeas, workedExamples,
//  practiceQuestions, quizBank, lessonId) to the legacy renderer's expected
//  names (points, examples, practice, qBank, id) so the existing UI works.
// ════════════════════════════════════════

// ── Unit 1 lesson shells ─────────────────────────────────────────────────────
const _G1_U1_LESSONS = [
  { id:'g1-u1-l1', title:'Quick Looks',                         icon:'👀', desc:'Recognize quantities in structured arrangements without counting one by one', teks:'TEKS 1.2A' },
  { id:'g1-u1-l2', title:'Count Forward',                       icon:'➡️', desc:'Count forward from any number up to 120',                                    teks:'TEKS 1.5A' },
  { id:'g1-u1-l3', title:'Count Backward',                      icon:'⬅️', desc:'Count backward from any number up to 120',                                   teks:'TEKS 1.5A' },
  { id:'g1-u1-l4', title:'Skip Count by 2s, 5s, and 10s',       icon:'⏭️', desc:'Skip count to find totals and recognize patterns',                           teks:'TEKS 1.5B' },
  { id:'g1-u1-l5', title:'One More and One Less',                icon:'1️⃣', desc:'Find numbers that are one more or one less',                                 teks:'TEKS 1.2D' },
  { id:'g1-u1-l6', title:'Ten More and Ten Less',                icon:'🔟', desc:'Find numbers that are ten more or ten less',                                 teks:'TEKS 1.5C' },
  { id:'g1-u1-l7', title:'Order Numbers',                        icon:'📈', desc:'Place numbers in order from least to greatest and greatest to least',         teks:'TEKS 1.2F' },
  { id:'g1-u1-l8', title:'Compare Numbers',                      icon:'⚖️', desc:'Compare two numbers using greater than, less than, or equal to',             teks:'TEKS 1.2D, 1.2E, 1.2G' }
];

// ── Unit 2 lesson shells ─────────────────────────────────────────────────────
const _G1_U2_LESSONS = [
  { id:'g1-u2-l1', title:'Groups of Ten',     icon:'📦', desc:'Make groups of ten to understand place value',              teks:'TEKS 1.2B' },
  { id:'g1-u2-l2', title:'Tens and Ones',     icon:'🔢', desc:'Represent two-digit numbers as tens and ones',              teks:'TEKS 1.2B' },
  { id:'g1-u2-l3', title:'Numbers to 120',    icon:'🔭', desc:'Extend place value understanding past 99 to 120',           teks:'TEKS 1.2B' },
  { id:'g1-u2-l4', title:'Represent Numbers', icon:'✏️', desc:'Write numbers in standard, expanded, and word form',        teks:'TEKS 1.2C' }
];

// ── Unit 3 lesson shells ─────────────────────────────────────────────────────
const _G1_U3_LESSONS = [
  { id:'g1-u3-l1', title:'Add Within 20',                  icon:'➕', desc:'Add within 20 using counting-on and modeling',                       teks:'TEKS 1.3D, 1.3E' },
  { id:'g1-u3-l2', title:'Subtract Within 20',             icon:'➖', desc:'Subtract within 20 using take-away and counting-back',                teks:'TEKS 1.3D, 1.3E' },
  { id:'g1-u3-l3', title:'Doubles and Near Doubles',       icon:'👯', desc:'Use doubles and near-doubles to add fluently within 20',              teks:'TEKS 1.3D, 1.3E' },
  { id:'g1-u3-l4', title:'Make 10',                        icon:'🔟', desc:'Compose 10 and decompose to a 10 to add and subtract within 20',     teks:'TEKS 1.3C, 1.3D' },
  { id:'g1-u3-l5', title:'Fact Families and Word Problems',icon:'📖', desc:'Relate addition and subtraction; solve word problems within 20',      teks:'TEKS 1.3B, 1.3E, 1.3F' }
];

// ── Unit 4 lesson shells ─────────────────────────────────────────────────────
//  Scope: Tens and Ones Operations — multiples of 10, multiple-of-10 + one-digit,
//  and adding tens to a two-digit number. NO regrouping, carrying, borrowing,
//  or vertical algorithm. NO three-digit operations. NO 27 + 18, NO 53 - 27.
const _G1_U4_LESSONS = [
  { id:'g1-u4-l1', title:'Add Tens and Ones',             icon:'🔢', desc:'Add a multiple of 10 and a one-digit number',                          teks:'TEKS 1.3A' },
  { id:'g1-u4-l2', title:'10 More and 10 Less',           icon:'↕️', desc:'Find numbers that are 10 more or 10 less to 120',                       teks:'TEKS 1.5C' },
  { id:'g1-u4-l3', title:'Add Multiples of 10',           icon:'📦', desc:'Add multiples of 10 using base-10 models — no regrouping',             teks:'TEKS 1.3A' },
  { id:'g1-u4-l4', title:'Add Tens to Two-Digit Numbers', icon:'➕', desc:'Add tens to a two-digit number — no regrouping or carrying',           teks:'TEKS 1.3A' },
  { id:'g1-u4-l5', title:'Tens and Ones Word Problems',   icon:'📖', desc:'Solve single-step word problems with tens and ones',                   teks:'TEKS 1.3A, 1.5D' }
];

// ── Unit 5 lesson shells ─────────────────────────────────────────────────────
//  Scope guardrails:
//    2D: circle, triangle, rectangle, square, rhombus, hexagon (pentagon/octagon = distractors only)
//    3D: sphere, cone, cylinder, cube, rectangular prism, triangular prism (no square pyramid)
//    No symmetry. No face/edge/vertex counting in L5.2. No polygon/quadrilateral vocabulary.
const _G1_U5_LESSONS = [
  { id:'g1-u5-l1', title:'2D Shapes — Identify and Describe',  icon:'🔷', desc:'Identify and describe 2D shapes: circle, triangle, rectangle, square, rhombus, hexagon',                    teks:'TEKS 1.6C, 1.6D' },
  { id:'g1-u5-l2', title:'3D Shapes — Identify and Describe',  icon:'📦', desc:'Identify and describe 3D solids: sphere, cone, cylinder, cube, rectangular prism, triangular prism',       teks:'TEKS 1.6E' },
  { id:'g1-u5-l3', title:'Shape Attributes and Sorting',       icon:'🔲', desc:'Classify and sort shapes by attributes using informal geometric language',                                   teks:'TEKS 1.6A, 1.6B' },
  { id:'g1-u5-l4', title:'Compose and Recognize 2D Shapes',    icon:'🧩', desc:'Join two or more 2D shapes to produce a new shape',                                                         teks:'TEKS 1.6F' },
  { id:'g1-u5-l5', title:'Equal Parts — Halves and Fourths',   icon:'🍕', desc:'Partition shapes into two or four equal parts; identify halves and fourths',                                teks:'TEKS 1.6G, 1.6H' }
];

// ── Grade 1 unit shells ───────────────────────────────────────────────────────
const _UNITS_DATA_G1 = [
  {
    id: 'g1u1',
    name: 'Counting and Number Relationships to 120',
    icon: '🔢',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#4CAF50" opacity="0.12"/><rect x="10" y="22" width="12" height="16" rx="3" fill="#4CAF50" opacity="0.7"/><rect x="25" y="16" width="12" height="22" rx="3" fill="#4CAF50" opacity="0.7"/><rect x="40" y="26" width="12" height="12" rx="3" fill="#4CAF50" opacity="0.7"/></svg>',
    color: '#4CAF50',
    gp: 1,
    teks: 'TEKS 1.2A, 1.2D-G, 1.5A-C',
    lessons: _G1_U1_LESSONS.map(function(l){ return Object.assign({}, l); }),
    _loaded: false
  },
  {
    id: 'g1u2', name: 'Place Value',
    icon: '📦',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#0095FF" opacity="0.1"/><rect x="3" y="20" width="54" height="30" rx="5" fill="#0095FF" opacity="0.15" stroke="#0095FF" stroke-width="2"/><line x1="21" y1="20" x2="21" y2="50" stroke="#0095FF" stroke-width="2"/><line x1="39" y1="20" x2="39" y2="50" stroke="#0095FF" stroke-width="2"/></svg>',
    color: '#0095FF', gp: 1, teks: 'TEKS 1.2A, 1.2B, 1.2C',
    lessons: _G1_U2_LESSONS.map(function(l){ return Object.assign({}, l); }),
    _loaded: false
  },
  {
    id: 'g1u3', name: 'Addition and Subtraction to 20',
    icon: '➕',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF2200" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF2200"/><rect x="13.5" y="21.5" width="7" height="18" rx="3.5" fill="#FF2200"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF2200" opacity="0.75"/></svg>',
    color: '#FF2200', gp: 1, teks: 'TEKS 1.3B-F, 1.5D-G',
    lessons: _G1_U3_LESSONS.map(function(l){ return Object.assign({}, l); }),
    _loaded: false
  },
  {
    id: 'g1u4', name: 'Tens and Ones Operations',
    icon: '🔢',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF8C00" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF8C00"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF8C00" opacity="0.75"/></svg>',
    color: '#FF8C00', gp: 1, teks: 'TEKS 1.3A, 1.5C, 1.5D, 1.5G',
    lessons: _G1_U4_LESSONS.map(function(l){ return Object.assign({}, l); }),
    _loaded: false
  },
  {
    id: 'g1u5', name: 'Geometry',
    icon: '🔷',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#9C27B0" opacity="0.1"/><polygon points="30,10 54,48 6,48" fill="none" stroke="#9C27B0" stroke-width="2.5"/></svg>',
    color: '#9C27B0', gp: 1, teks: 'TEKS 1.6A–H',
    lessons: _G1_U5_LESSONS.map(function(l){ return Object.assign({}, l); }),
    _loaded: false
  },
  {
    id: 'g1u6', name: 'Measurement & Time',
    icon: '📏',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#009688" opacity="0.1"/><rect x="8" y="22" width="44" height="16" rx="3" fill="none" stroke="#009688" stroke-width="2.5"/><line x1="16" y1="22" x2="16" y2="38" stroke="#009688" stroke-width="1.5"/><line x1="24" y1="22" x2="24" y2="33" stroke="#009688" stroke-width="1.5"/><line x1="32" y1="22" x2="32" y2="38" stroke="#009688" stroke-width="1.5"/><line x1="40" y1="22" x2="40" y2="33" stroke="#009688" stroke-width="1.5"/></svg>',
    color: '#009688', gp: 1, teks: 'TEKS 1.7A–E',
    lessons: [
      { id:'g1-u6-l1', title:'Measuring with Non-Standard Units', icon:'📏', desc:'Measure length using paper clips, cubes, and tiles',                          teks:'TEKS 1.7A' },
      { id:'g1-u6-l2', title:'Understanding Units of Length',     icon:'📐', desc:'Use same-size units end-to-end with no gaps or overlaps',                    teks:'TEKS 1.7B' },
      { id:'g1-u6-l3', title:'Comparing Measurements',           icon:'🔢', desc:'Measure the same object with different-size units and compare counts',        teks:'TEKS 1.7C' },
      { id:'g1-u6-l4', title:'Describing Length',                icon:'✏️', desc:'Describe length to the nearest whole unit using a number and a unit name',   teks:'TEKS 1.7D' },
      { id:'g1-u6-l5', title:'Telling Time',                     icon:'🕐', desc:'Tell time to the hour and half-hour using analog and digital clocks',         teks:'TEKS 1.7E' }
    ],
    _loaded: false
  },
  {
    id: 'g1u7', name: 'Data Analysis',
    icon: '📊',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF9800" opacity="0.1"/><rect x="8" y="38" width="10" height="12" rx="2" fill="#FF9800" opacity="0.6"/><rect x="22" y="28" width="10" height="22" rx="2" fill="#FF9800" opacity="0.8"/><rect x="36" y="18" width="10" height="32" rx="2" fill="#FF9800"/></svg>',
    color: '#FF9800', gp: 1, teks: 'TEKS 1.8A–C',
    lessons: [
      { id:'g1-u7-l1', title:'Sorting and Organizing Data', icon:'🗂️', desc:'Sort objects into categories; record with tally marks and T-charts',                 teks:'TEKS 1.8A' },
      { id:'g1-u7-l2', title:'Picture Graphs',              icon:'🖼️', desc:'Read and build picture graphs where 1 picture = 1 data point',                      teks:'TEKS 1.8B' },
      { id:'g1-u7-l3', title:'Bar-Type Graphs',             icon:'📊', desc:'Read and build bar graphs where each cell stands for 1 data point',               teks:'TEKS 1.8B' },
      { id:'g1-u7-l4', title:'Drawing Conclusions from Data', icon:'🔎', desc:'Answer questions from a graph: most, fewest, how many in all, how many more/fewer', teks:'TEKS 1.8C' }
    ],
    _loaded: false
  },
  {
    id: 'g1u8', name: 'Financial Literacy',
    icon: '💰',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#4CAF50" opacity="0.08"/><circle cx="30" cy="30" r="16" fill="none" stroke="#4CAF50" stroke-width="2.5"/><text x="30" y="36" text-anchor="middle" font-size="16" fill="#4CAF50">$</text></svg>',
    color: '#4CAF50', gp: 1, teks: 'TEKS 1.9',
    lessons: [
      { id:'g1u8l1', title:'Earning and Spending', icon:'💰', desc:'Understand income, saving, and spending' }
    ],
    _loaded: true
  }
];

// ── Load infrastructure ────────────────────────────────────────────────────────
const _g1UnitLoadPromises = {};

function _loadG1SourceFile(num){
  return new Promise(function(res, rej){
    var s = document.createElement('script');
    s.src = '/data/g1/u' + num + '.js';
    s.onload = res;
    s.onerror = function(){ console.warn('[G1] data/g1/u' + num + '.js not found — unit will show empty'); res(); };
    document.head.appendChild(s);
  });
}

function _loadG1Unit(idx){
  var u = _UNITS_DATA_G1[idx];
  if(!u) return Promise.resolve();
  if(u._loaded) return Promise.resolve();
  if(_g1UnitLoadPromises[idx]) return _g1UnitLoadPromises[idx];

  // Units with data files: idx 0 → u1.js … idx 6 → u7.js.
  // Unit 8 (idx 7) is still shell-only — short-circuit so the loader
  // does not try to fetch a file that doesn't exist yet.
  if(idx > 6){
    u._loaded = true;
    return Promise.resolve();
  }

  var fileNum = idx + 1; // idx 0 → u1.js, idx 1 → u2.js, idx 2 → u3.js, idx 3 → u4.js
  _g1UnitLoadPromises[idx] = _loadG1SourceFile(fileNum).then(function(){
    if(!u._loaded) u._loaded = true;  // fallback if script didn't call _mergeG1UnitData
  });
  return _g1UnitLoadPromises[idx];
}

// ── v0.2.0 visual → legacy {type, config} adapter ────────────────────────────
//  Converts the structured v0.2.0 visual object stored on each quizBank/practice
//  question to the {type, config} format that _buildVisualHTML (visuals.js) uses.
//
//  Supported G1 U1 visual types:
//    tenFrame    { count:N }             → 2×5 grid, N filled cells
//    fivFrame    { count:N }             → 1×5 row,  N filled cells
//    dicePattern { face:N }              → standard dice dot pattern, face 1–6
//    domino      { left:L, right:R }     → two dice halves side by side
//    objectSet   { count:N, layout:?, emoji:?, groups:?, groupSize:? }  → organized dot rows
//    numberLine  { min,max,ticks,jumps,mark } → SVG number line (L1.2+)
function _g1VisToV(vis) {
  if (!vis || !vis.type) return null;
  switch (vis.type) {
    case 'tenFrame':    return { type: 'tenFrame',    config: { count: vis.count } };
    case 'fivFrame':    return { type: 'fivFrame',    config: { count: vis.count } };
    case 'dicePattern': return { type: 'dicePattern', config: { face:  vis.face  } };
    case 'domino':      return { type: 'domino',      config: { left:  vis.left, right: vis.right } };
    case 'objectSet': {
      const cfg = { count: vis.count, layout: vis.layout || 'rows', emoji: vis.emoji || '●' };
      if (vis.groups    != null) cfg.groups    = vis.groups;
      if (vis.groupSize != null) cfg.groupSize = vis.groupSize;
      return { type: 'objectSet', config: cfg };
    }
    case 'numberLine': {
      const nlCfg = { min: vis.min, max: vis.max, ticks: vis.ticks || [], jumps: vis.jumps || [], mark: vis.mark != null ? vis.mark : null };
      if (vis.mode       != null) nlCfg.mode       = vis.mode;
      if (vis.labels     != null) nlCfg.labels     = vis.labels;
      if (vis.hideLabels != null) nlCfg.hideLabels = vis.hideLabels;
      if (vis.endMark    != null) nlCfg.endMark    = vis.endMark;
      return { type: 'numberLine', config: nlCfg };
    }
    case 'numberCards': {
      return { type: 'numberCards', config: { cards: vis.cards || [], layout: vis.layout || 'input' } };
    }
    case 'comparison':  return { type: 'comparison', config: vis.config };
    case 'base10':      return { type: 'base10', config: vis.config || { hundreds: vis.hundreds || 0, tens: vis.tens || 0, ones: vis.ones || 0 } };
    case 'twoGroups':   return { type: 'twoGroups', config: vis.config || {
                          leftCount:  vis.leftCount,
                          leftObj:    vis.leftObj  || '●',
                          rightCount: vis.rightCount,
                          rightObj:   vis.rightObj || '●',
                          op:         vis.op       || 'add'
                        }};
    case 'rawHtml':     return { type: 'rawHtml',  config: { html: vis.html || '' } };
    default:            return null;
  }
}

// ── Unit test bank assembly helpers ──────────────────────────────────────────

// Local Fisher-Yates shuffle — self-contained so shared_g1.js has no
// dependency on _shuffle from util.js (which loads after this file in bundle).
function _g1Shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// Returns up to `count` questions sampled from `bank`.
// When `balanced` is true, targets ~25% hard / ~37.5% medium / ~37.5% easy
// (formula: tH = round(count*0.25), tE = round((count-tH)/2), tM = rest).
// If any tier is short, the deficit is filled from remaining questions.
// Never mutates `bank`.
function _sampleFromBank(bank, count, balanced) {
  if (!bank || bank.length === 0) return [];
  count = Math.min(count, bank.length);

  if (!balanced) {
    var pool = bank.slice();
    _g1Shuffle(pool);
    return pool.slice(0, count);
  }

  var easy   = bank.filter(function(q) { return q.d === 'e'; });
  var medium = bank.filter(function(q) { return q.d === 'm'; });
  var hard   = bank.filter(function(q) { return q.d === 'h'; });

  _g1Shuffle(easy); _g1Shuffle(medium); _g1Shuffle(hard);

  var tH = Math.round(count * 0.25);
  var tE = Math.round((count - tH) / 2);
  var tM = count - tH - tE;

  var usedE = easy.slice(0, tE);
  var usedM = medium.slice(0, tM);
  var usedH = hard.slice(0, tH);
  var selected = usedE.concat(usedM).concat(usedH);

  if (selected.length < count) {
    var spillover = easy.slice(tE).concat(medium.slice(tM)).concat(hard.slice(tH));
    _g1Shuffle(spillover);
    var needed = count - selected.length;
    for (var j = 0; j < needed && j < spillover.length; j++) {
      selected.push(spillover[j]);
    }
  }

  return selected;
}

// Largest-remainder apportionment.
// Returns an array of integers summing to `total`, distributed across
// `weights` proportional to each weight. Random tie-break for fairness.
// Used to apportion difficulty quotas (8E, 10M, 7H) across lessons in a way
// that preserves both per-difficulty totals and per-lesson totals.
function _apportion(total, weights) {
  if (!weights || weights.length === 0) return [];
  var sumW = 0;
  for (var i = 0; i < weights.length; i++) sumW += weights[i];
  if (sumW === 0 || total === 0) return weights.map(function() { return 0; });

  var quotas = weights.map(function(w) { return total * w / sumW; });
  var floors = quotas.map(function(q) { return Math.floor(q); });
  var allocated = 0;
  for (var k = 0; k < floors.length; k++) allocated += floors[k];
  var deficit = total - allocated;
  if (deficit <= 0) return floors;

  var indexed = quotas.map(function(q, i) {
    return { i: i, frac: q - Math.floor(q), tie: Math.random() };
  });
  indexed.sort(function(a, b) {
    if (Math.abs(b.frac - a.frac) > 1e-9) return b.frac - a.frac;
    return a.tie - b.tie;
  });
  for (var d = 0; d < deficit && d < indexed.length; d++) {
    floors[indexed[d].i]++;
  }
  return floors;
}

// Assembles the FULL unit test POOL from every lesson quizBank question.
// Called when spec.unitTest.sourceRule === 'all_lesson_quizbanks'.
// u.lessons must already be fully merged before this runs.
//
// Returns the full pool (no sampling). Each returned question is a SHALLOW
// CLONE of the lesson question, with source-lesson metadata attached:
//   sourceLessonId, sourceLessonTitle, sourceLessonIndex, sourceUnitId
// The original lesson qBank arrays and question objects are never mutated.
//
// Per-attempt sampling happens later in startUnitQuiz via
// _sampleUnitTestAttempt(pool, n).
function _assembleUnitTestBank(u, utSpec) {
  var result = [];
  u.lessons.forEach(function(lesson, lessonIdx) {
    var bank = lesson.qBank || [];
    for (var i = 0; i < bank.length; i++) {
      var tagged = Object.assign({}, bank[i], {
        sourceLessonId:    lesson.id || null,
        sourceLessonTitle: lesson.title || null,
        sourceLessonIndex: lessonIdx,
        sourceUnitId:      u.id || null
      });
      result.push(tagged);
    }
  });
  return result;
}

// Samples `n` questions from the full unit test pool, balanced across
// lessons (as evenly as possible) and difficulty (target 8E + 10M + 7H
// for n=25, scaled for other n).
//
// Lesson distribution: floor(n / numLessons) per lesson, with the
// remainder randomly assigned to single lessons (e.g., n=25, 4 lessons →
// 6,6,6,6 base + 1 random bonus → one of 7/6/6/6, 6/7/6/6, 6/6/7/6, 6/6/6/7).
//
// Difficulty distribution: globally apportioned across lessons via
// _apportion, so per-difficulty totals match the target exactly while
// per-lesson totals match the chosen lesson sizes.
//
// Spillover: if a (lesson, difficulty) bucket is short, the deficit is
// filled from remaining questions in that lesson regardless of difficulty.
//
// Never mutates `pool`.
function _sampleUnitTestAttempt(pool, n) {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= n) {
    var copy = pool.slice();
    _g1Shuffle(copy);
    return copy;
  }

  // Group by sourceLessonIndex. Use a sparse-array approach because indices
  // come from lesson positions and should be sortable as integers.
  var byLesson = {};
  for (var p = 0; p < pool.length; p++) {
    var idx = pool[p].sourceLessonIndex != null ? pool[p].sourceLessonIndex : 0;
    if (!byLesson[idx]) byLesson[idx] = [];
    byLesson[idx].push(pool[p]);
  }
  var lessonIndices = Object.keys(byLesson).map(Number).sort(function(a, b) { return a - b; });
  var numLessons = lessonIndices.length;
  if (numLessons === 0) return [];

  // Step 1: Pick lesson sizes (base + random bonus).
  var base  = Math.floor(n / numLessons);
  var bonus = n - base * numLessons;
  var lessonSizes = lessonIndices.map(function() { return base; });
  if (bonus > 0) {
    var bonusOrder = lessonIndices.slice();
    _g1Shuffle(bonusOrder);
    for (var b = 0; b < bonus; b++) {
      lessonSizes[lessonIndices.indexOf(bonusOrder[b])]++;
    }
  }

  // Step 2: Difficulty targets (8E + 10M + 7H for n=25, scaled by ratio).
  var eTotal = Math.round(n * 8 / 25);
  var mTotal = Math.round(n * 10 / 25);
  var hTotal = n - eTotal - mTotal;

  // Step 3: Apportion E across lessons proportional to lesson size.
  var ePerLesson = _apportion(eTotal, lessonSizes);

  // Step 4: Remaining capacity (M + H) per lesson after E.
  var afterE = lessonSizes.map(function(s, i) { return s - ePerLesson[i]; });

  // Step 5: Apportion H across lessons proportional to remaining capacity.
  var hPerLesson = _apportion(hTotal, afterE);

  // Step 6: M fills the gap per lesson (so per-lesson totals match exactly).
  var mPerLesson = lessonSizes.map(function(s, i) { return afterE[i] - hPerLesson[i]; });

  // Step 7: Sample from each (lesson, difficulty) bucket.
  var result = [];
  lessonIndices.forEach(function(lIdx, i) {
    var lessonPool = byLesson[lIdx];
    var ePool = lessonPool.filter(function(q) { return q.d === 'e'; });
    var mPool = lessonPool.filter(function(q) { return q.d === 'm'; });
    var hPool = lessonPool.filter(function(q) { return q.d === 'h'; });

    _g1Shuffle(ePool); _g1Shuffle(mPool); _g1Shuffle(hPool);

    var ePicks = ePool.slice(0, ePerLesson[i]);
    var mPicks = mPool.slice(0, mPerLesson[i]);
    var hPicks = hPool.slice(0, hPerLesson[i]);
    var picks  = ePicks.concat(mPicks).concat(hPicks);

    // Spillover: if any difficulty tier was short, fill from remaining
    // questions in this lesson.
    var lessonTarget = lessonSizes[i];
    if (picks.length < lessonTarget) {
      var picked = picks.slice();
      var spillover = lessonPool.filter(function(q) {
        return picked.indexOf(q) === -1;
      });
      _g1Shuffle(spillover);
      var needed = lessonTarget - picks.length;
      for (var s = 0; s < needed && s < spillover.length; s++) {
        picks.push(spillover[s]);
      }
    }

    for (var pi = 0; pi < picks.length; pi++) result.push(picks[pi]);
  });

  // Final shuffle so questions don't appear in lesson order.
  _g1Shuffle(result);
  return result;
}

// ── Data merge (called by dist/data/g1/u1.js at parse time) ──────────────────
function _mergeG1UnitData(idx, spec){
  var u = _UNITS_DATA_G1[idx];
  if(!u){ console.error('[G1 merge] No unit at index', idx); return; }
  if(!spec || !Array.isArray(spec.lessons)) return;

  spec.lessons.forEach(function(ld, i){
    var shell = u.lessons[i] || {};

    // ── v0.2.0 → legacy field adapters ────────────────────────────────────────

    // keyIdeas: array of {id,content,relatedSkill} → array of plain strings
    var _points = (ld.keyIdeas || shell.points || []).map(function(k){
      return typeof k === 'string' ? k : (k.content || String(k));
    });

    // workedExamples: v0.2.0 {id,title,prompt,visual,steps[],finalAnswer}
    //                 → legacy {c,tag,p,s,a,vis} expected by renderEx()
    // makeVis() expects a colon-delimited string ("tenframe:5").
    // tenFrame visual is the only type with a makeVis handler; others → null.
    var _examples = (ld.workedExamples || shell.examples || []).map(function(we){
      if(!we || typeof we !== 'object') return we;
      if(we.tag !== undefined) return we; // already legacy
      var visStr = null;
      var visObj = null;   // {type,config} for _buildVisualHTML (non-tenFrame visuals)
      if(we.visual && we.visual.type === 'tenFrame'){
        visStr = 'tenframe:' + we.visual.count;
      } else if(we.visual && we.visual.type) {
        visObj = _g1VisToV(we.visual);  // converts v0.2.0 visual → {type,config}
      }
      // Strip leading "Example N: " so renderEx's own "Example N:" prefix isn't doubled
      var tagText = (we.title || '').replace(/^Example\s+\d+:\s*/i, '');
      return {
        c:   u.color,
        tag: tagText,
        p:   we.prompt  || '',
        s:   Array.isArray(we.steps) ? we.steps.join('\n') : (we.steps || ''),
        a:   we.finalAnswer || '',
        vis: visStr,
        v:   visObj     // renderEx checks ex.v first → _buildVisualHTML(ex.v)
      };
    });

    // quizBank: v0.2.0 {id,prompt,visual,choices[{value,correct,...}],hint,...}
    //           → legacy {t,o,a,e} expected by buildPracticeQ()
    var _qBank = (ld.quizBank || shell.qBank || []).map(function(q){
      if(!q || typeof q !== 'object') return q;
      if(q.o !== undefined) return q; // already legacy
      var choices = Array.isArray(q.choices) ? q.choices : [];
      var correctIdx = 0;
      for(var ci = 0; ci < choices.length; ci++){
        if(choices[ci].correct){ correctIdx = ci; break; }
      }
      return {
        t: q.prompt || '',
        o: choices.map(function(c){
          if (!c.correct && c.errorTag) {
            return { val: String(c.value), tag: c.errorTag, me: c.misconceptionExplanation || null };
          }
          return String(c.value);
        }),
        a: correctIdx,
        e: q.hint   || '',
        v: _g1VisToV(q.visual),  // converts v0.2.0 visual → {type,config} for _buildVisualHTML
        i: q.intervention || null,
        sk: q.subSkill || null,
        d: q.difficulty ? q.difficulty[0] : null,   // 'e','m','h'
        pt: q.promptTemplate || null
      };
    });

    u.lessons[i] = Object.assign({}, shell, ld, {
      id:       ld.lessonId  || shell.id,
      points:   _points,
      examples: _examples,
      practice: ld.practiceQuestions || shell.practice || [],
      qBank:    _qBank
    });
  });

  // Unit test bank assembly
  if (spec.unitTest) {
    // Expose unitTest config to runtime (totalQuestions, sourceRule, etc.) so
    // startUnitQuiz can size attempts and unit.js can label the quiz button.
    u.unitTest = spec.unitTest;
    if (spec.unitTest.sourceRule === 'all_lesson_quizbanks') {
      // testBank holds the FULL POOL of every lesson question, cloned and
      // tagged with source-lesson metadata. Per-attempt sampling happens in
      // startUnitQuiz via _sampleUnitTestAttempt.
      u.testBank = _assembleUnitTestBank(u, spec.unitTest);
    } else if (Array.isArray(spec.unitTest.bank)) {
      u.testBank = spec.unitTest.bank;
    }
  }
  u._loaded = true;
}

// ── Grade swap ────────────────────────────────────────────────────────────────
//  Called from boot.js when localStorage.mmr_grade === '1'.
//  Splices UNITS_DATA in-place (same pattern as _applyKindergartenGrade).
function _applyGrade1Grade(){
  UNITS_DATA.splice(0, UNITS_DATA.length);
  _UNITS_DATA_G1.forEach(function(u){ UNITS_DATA.push(u); });
  window._loadUnit = _loadG1Unit;
}
