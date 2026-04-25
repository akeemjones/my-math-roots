// ════════════════════════════════════════
//  shared_k.js — Kindergarten Grade Data (TEKS-aligned 8-domain structure)
//
//  Structure reorganized 2026-04-23:
//    - 8 TEKS domains (K.2 C&C, K.2 Number Relationships, K.3 Add/Sub,
//      K.5 Algebraic, K.6 Geometry, K.7 Measurement, K.8 Data, K.4/K.9 Money)
//    - Old U4 (Teen Numbers) merged into new U1 (counting) + U2 (comparing)
//    - Old U5 (Counting/Problem Solving) split: L1–L2 → U1, L3–L4 → U3
//    - Geometry moved to new U5, Measurement to new U6
//    - Algebraic / Data / Financial added as empty shells ("coming soon")
//
//  Legacy u{N}.js source files remain unchanged. The _K_MERGE_MAP below
//  translates their old _mergeKUnitData(idx) calls to the new unit slots.
// ════════════════════════════════════════

// ── K metadata shell ─────────────────────────────────────────────────────────
const _UNITS_DATA_K = [
  {
    id: 'ku1',
    name: 'Counting & Cardinality',
    icon: '🔢',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#4CAF50" opacity="0.12"/><circle cx="18" cy="30" r="5" fill="#4CAF50"/><circle cx="30" cy="30" r="5" fill="#4CAF50"/><circle cx="42" cy="30" r="5" fill="#4CAF50"/></svg>',
    color: '#4CAF50',
    gp: 1,
    teks: 'TEKS K.2A, K.2B, K.2C, K.2D',
    quizBlueprint: { ku1l1:5, ku1l2:4, ku1l3:4, ku1l4:3, ku1l5:3, ku1l6:3, ku1l7:3 },
    lessons: [
      {id:'ku1l1', title:'Counting to 10',            icon:'🍎', desc:'Count objects up to 10 by touching each one'},
      {id:'ku1l2', title:'Quick Look',                icon:'👀', desc:'Recognize small groups without counting one by one'},
      {id:'ku1l3', title:'Counting to 20',            icon:'🌟', desc:'Count objects all the way to 20'},
      {id:'ku1l4', title:'Count to 20 — Review',      icon:'🔢', desc:'Count forward and backward all the way to 20'},
      {id:'ku1l5', title:'Read and Represent 11–20',  icon:'🌟', desc:'Match numerals 11–20 to sets and pictures'},
      {id:'ku1l6', title:'Counting Strategies',       icon:'👆', desc:'Use touch-counting and organized groups to count sets up to 20'},
      {id:'ku1l7', title:'Quick Look: Subitize',      icon:'👀', desc:'Instantly recognize how many — no counting needed!'}
    ],
    _loaded: false
  },
  {
    id: 'ku2',
    name: 'Number Relationships',
    icon: '⚖️',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#0095FF" opacity="0.12"/><circle cx="16" cy="22" r="5" fill="#0095FF"/><circle cx="30" cy="22" r="5" fill="#0095FF"/><circle cx="44" cy="22" r="5" fill="#0095FF"/><circle cx="9" cy="38" r="5" fill="#0095FF"/><circle cx="23" cy="38" r="5" fill="#0095FF"/><circle cx="37" cy="38" r="5" fill="#0095FF"/><circle cx="51" cy="38" r="5" fill="#0095FF"/></svg>',
    color: '#0095FF',
    gp: 2,
    teks: 'TEKS K.2E, K.2F, K.2G, K.2H, K.2I',
    quizBlueprint: { ku2l1:5, ku2l2:3, ku2l3:5, ku2l4:5, ku2l5:3, ku2l6:3 },
    lessons: [
      {id:'ku2l1', title:'One More, One Less',          icon:'🔢', desc:'Find one more or one less than a number'},
      {id:'ku2l2', title:'Compare Sets',                icon:'⚖️', desc:'Compare groups to find more, fewer, or same'},
      {id:'ku2l3', title:'Compare Numbers',             icon:'🔍', desc:'Use greater than, less than, and equal'},
      {id:'ku2l4', title:'Compose & Decompose',         icon:'➕', desc:'Put numbers together and break them apart'},
      {id:'ku2l5', title:'More, Less, and Equal',       icon:'⚖️', desc:'Compare groups and numbers within 20'},
      {id:'ku2l6', title:'One More / One Less — Review', icon:'➕', desc:'Find one more or one less for numbers up to 20'}
    ],
    _loaded: false
  },
  {
    id: 'ku3',
    name: 'Addition & Subtraction',
    icon: '➕',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#E91E63" opacity="0.12"/><rect x="26" y="14" width="8" height="32" rx="3" fill="#E91E63"/><rect x="14" y="26" width="32" height="8" rx="3" fill="#E91E63"/></svg>',
    color: '#E91E63',
    gp: 3,
    teks: 'TEKS K.3A, K.3B, K.3C, K.3D',
    quizBlueprint: { ku3l1:5, ku3l2:5, ku3l3:5, ku3l4:3, ku3l5:3, ku3l6:3 },
    lessons: [
      {id:'ku3l1', title:'Adding Numbers',                  icon:'➕', desc:'Join two groups and count the total'},
      {id:'ku3l2', title:'Subtracting Numbers',             icon:'➖', desc:'Take away from a group and find what is left'},
      {id:'ku3l3', title:'Word Problems',                   icon:'📖', desc:'Solve joining, separating, and missing part stories'},
      {id:'ku3l4', title:'Explain Thinking',                icon:'💡', desc:'Choose the right operation and explain your reasoning'},
      {id:'ku3l5', title:'Story Problems: Join & Separate', icon:'📖', desc:'Solve joining and separating story problems within 10'},
      {id:'ku3l6', title:'Explain Your Math',               icon:'💬', desc:'Choose the right operation and explain your thinking'}
    ],
    _loaded: false
  },
  {
    id: 'ku4',
    name: 'Counting Patterns',
    icon: '🧩',
    // Pattern dots: alternating colors to suggest an AB pattern
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#7E57C2" opacity="0.12"/><circle cx="14" cy="30" r="4" fill="#7E57C2"/><rect x="21" y="26" width="8" height="8" rx="1" fill="#7E57C2"/><circle cx="36" cy="30" r="4" fill="#7E57C2"/><rect x="43" y="26" width="8" height="8" rx="1" fill="#7E57C2"/></svg>',
    color: '#7E57C2',
    gp: 4,
    teks: 'TEKS K.5',
    lessons: [],
    comingSoon: true,
    _loaded: false
  },
  {
    id: 'ku5',
    name: 'Geometry — Shapes & Solids',
    icon: '🔺',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#2196F3" opacity="0.12"/><polygon points="30,12 46,44 14,44" fill="#2196F3"/></svg>',
    color: '#2196F3',
    gp: 5,
    teks: 'TEKS K.6A, K.6B, K.6C, K.6D, K.6E, K.6F',
    quizBlueprint: { ku5l1:7, ku5l2:7, ku5l3:5, ku5l4:5 },
    lessons: [
      {id:'ku5l1', title:'Flat Shapes (2D)',   icon:'🔵', desc:'Identify circles, triangles, rectangles, and squares'},
      {id:'ku5l2', title:'Solid Shapes (3D)',  icon:'📦', desc:'Identify spheres, cones, cylinders, and cubes in the real world'},
      {id:'ku5l3', title:'Sides & Corners',    icon:'📐', desc:'Count and compare sides and corners of 2D shapes'},
      {id:'ku5l4', title:'Sort & Create Shapes', icon:'🎨', desc:'Sort shapes by attributes and create your own shapes'}
    ],
    _loaded: false
  },
  {
    id: 'ku6',
    name: 'Measurement — Comparing & Ordering',
    icon: '📏',
    // Three vertical bars of ascending height suggest comparing size
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF5722" opacity="0.12"/><rect x="12" y="34" width="8" height="14" rx="1" fill="#FF5722"/><rect x="26" y="24" width="8" height="24" rx="1" fill="#FF5722"/><rect x="40" y="14" width="8" height="34" rx="1" fill="#FF5722"/></svg>',
    color: '#FF5722',
    gp: 6,
    teks: 'TEKS K.7A, K.7B',
    quizBlueprint: { ku6l1:7, ku6l2:7, ku6l3:5, ku6l4:5 },
    lessons: [
      {id:'ku6l1', title:'Comparing Length & Height',   icon:'📐', desc:'Find out which object is longer, shorter, taller, or the same'},
      {id:'ku6l2', title:'Comparing Weight & Capacity', icon:'⚖️', desc:'Compare how heavy things are and how much they hold'},
      {id:'ku6l3', title:'Ordering by Size',            icon:'🔢', desc:'Put objects in order from shortest to longest or lightest to heaviest'},
      {id:'ku6l4', title:'Measurable Attributes',       icon:'🔍', desc:'Name the attribute being measured: length, weight, or capacity'}
    ],
    _loaded: false
  },
  {
    id: 'ku7',
    name: 'Data Analysis',
    icon: '📊',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#009688" opacity="0.12"/><rect x="14" y="32" width="8" height="16" rx="1" fill="#009688"/><rect x="26" y="22" width="8" height="26" rx="1" fill="#009688"/><rect x="38" y="16" width="8" height="32" rx="1" fill="#009688"/></svg>',
    color: '#009688',
    gp: 7,
    teks: 'TEKS K.8A, K.8B, K.8C',
    quizBlueprint: { ku7l1:7, ku7l2:7, ku7l3:5, ku7l4:5 },
    lessons: [
      {id:'ku7l1', title:'Sort Into Groups',          icon:'🗂️',  desc:'Sort objects into categories and count each group'},
      {id:'ku7l2', title:'Build and Read Picture Graphs', icon:'📊', desc:'Use pictures to show information in a graph'},
      {id:'ku7l3', title:'Read Picture Graphs',        icon:'👀',  desc:'Read graphs to find totals and compare groups'},
      {id:'ku7l4', title:'Compare Data',               icon:'⚖️',  desc:'Find how many more or fewer between two groups'}
    ],
    _loaded: false
  },
  {
    id: 'ku8',
    name: 'Financial Literacy',
    icon: '💰',
    // Coin circle with $ suggestion (rects as a stylized dollar sign stroke)
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FFB300" opacity="0.12"/><circle cx="30" cy="30" r="14" fill="none" stroke="#FFB300" stroke-width="4"/><rect x="27" y="18" width="6" height="24" rx="1" fill="#FFB300"/></svg>',
    color: '#FFB300',
    gp: 8,
    teks: 'TEKS K.4, K.9',
    lessons: [],
    comingSoon: true,
    _loaded: false
  }
];

// ── TEKS realignment: map old _mergeKUnitData(idx) calls to new slots ────────
//  Each legacy u{N}.js file calls _mergeKUnitData(oldIdx, {lessons, testBank}).
//  The map below routes those calls into the new 8-unit layout. Entries with
//  `split` route different lesson ranges to different target units.
const _K_MERGE_MAP = {
  // Old u1.js — Counting & Cardinality → new U1 slots 0–2
  0: { target: 0, offset: 0 },
  // Old u2.js — Number Relationships → new U2 slots 0–3
  1: { target: 1, offset: 0 },
  // Old u3.js — Addition & Subtraction → new U3 slots 0–3
  2: { target: 2, offset: 0 },
  // Old u4.js — Teen Numbers: L1–L2 → new U1 slots 3–4, L3–L4 → new U2 slots 4–5
  3: { split: [
    { range: [0, 2], target: 0, offset: 3 },
    { range: [2, 4], target: 1, offset: 4 }
  ], testBankTarget: 0 },  // testBank → new U1 (teen-number focus)
  // Old u5.js — Counting/Problem Solving: L1–L2 → new U1 slots 5–6, L3–L4 → new U3 slots 4–5
  4: { split: [
    { range: [0, 2], target: 0, offset: 5 },
    { range: [2, 4], target: 2, offset: 4 }
  ], testBankTarget: 2 },  // testBank → new U3 (problem-solving heavy)
  // Old u6.js — Geometry → new U5 (index 4)
  5: { target: 4, offset: 0 },
  // Old u7.js — Measurement → new U6 (index 5)
  6: { target: 5, offset: 0 },
  // Old u8.js — Data Analysis → new U7 (index 6)
  7: { target: 6, offset: 0 }
};

// Which legacy source files each NEW unit index needs loaded
const _K_UNIT_SOURCES = {
  0: [1, 4, 5],  // new U1 (C&C) ← u1.js + u4.js + u5.js
  1: [2, 4],     // new U2 (Num Rel) ← u2.js + u4.js
  2: [3, 5],     // new U3 (Add/Sub) ← u3.js + u5.js
  3: [],         // new U4 (Algebraic) — empty shell
  4: [6],        // new U5 (Geometry) ← u6.js
  5: [7],        // new U6 (Measurement) ← u7.js
  6: [8],        // new U7 (Data Analysis) ← u8.js
  7: []          // new U8 (Financial) — empty shell
};

// ── K lazy-load infrastructure ───────────────────────────────────────────────
const _kUnitLoadPromises   = {};  // keyed by NEW unit idx
const _kSourceLoadPromises = {};  // keyed by LEGACY source file number

function _applyKMergeSlice(targetIdx, offset, lessons){
  var u = _UNITS_DATA_K[targetIdx];
  if(!u) return;
  lessons.forEach(function(ld, i){
    var slot = offset + i;
    u.lessons[slot] = Object.assign({}, u.lessons[slot] || {}, ld);
  });
}

// Maps a question's lessonId prefix ("ku1"/"ku2"/…) to the new unit index.
var _K_LESSON_PREFIX_TO_UNIT = { ku1:0, ku2:1, ku3:2, ku4:3, ku5:4, ku6:5, ku7:6, ku8:7 };

function _routeTestBankByLessonId(testBank){
  // Returns { targetIdx: [questions] }
  var byTarget = {};
  testBank.forEach(function(q){
    var lid = q && q.lessonId;
    if(!lid) return;
    var prefix = lid.slice(0, 3);
    var tgt = _K_LESSON_PREFIX_TO_UNIT[prefix];
    if(tgt == null) return;
    (byTarget[tgt] = byTarget[tgt] || []).push(q);
  });
  return byTarget;
}

function _appendTestBank(targetIdx, questions){
  var u = _UNITS_DATA_K[targetIdx];
  if(!u || !questions || !questions.length) return;
  u.testBank = (u.testBank || []).concat(questions);
}

function _mergeKUnitData(oldIdx, data){
  var m = _K_MERGE_MAP[oldIdx];
  if(!m){ console.error('[K merge] No map entry for old idx', oldIdx); return; }

  if(m.split){
    m.split.forEach(function(s){
      var slice = data.lessons.slice(s.range[0], s.range[1]);
      _applyKMergeSlice(s.target, s.offset, slice);
    });
  } else {
    _applyKMergeSlice(m.target, m.offset, data.lessons);
  }

  if(data.testBank){
    // Route each question to its correct target unit based on lessonId prefix.
    // Falls back to m.testBankTarget (or m.target) for any un-tagged question.
    var fallback = m.testBankTarget != null ? m.testBankTarget : m.target;
    var routed = _routeTestBankByLessonId(data.testBank);
    Object.keys(routed).forEach(function(k){ _appendTestBank(parseInt(k, 10), routed[k]); });
    var untagged = data.testBank.filter(function(q){ return !q || !q.lessonId; });
    if(untagged.length && fallback != null) _appendTestBank(fallback, untagged);
  }
}

function _loadKSourceFile(n){
  if(_kSourceLoadPromises[n]) return _kSourceLoadPromises[n];
  _kSourceLoadPromises[n] = new Promise(function(resolve, reject){
    var s = document.createElement('script');
    s.src = '/data/k/u' + n + '.js';
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('Failed to load K source u' + n + '.js')); };
    document.head.appendChild(s);
  });
  return _kSourceLoadPromises[n];
}

function _loadKUnit(newIdx){
  var u = _UNITS_DATA_K[newIdx];
  if(!u) return Promise.resolve();
  if(u._loaded) return Promise.resolve();
  if(_kUnitLoadPromises[newIdx]) return _kUnitLoadPromises[newIdx];

  var sources = _K_UNIT_SOURCES[newIdx] || [];
  if(sources.length === 0){
    u._loaded = true;
    return Promise.resolve();
  }
  _kUnitLoadPromises[newIdx] = Promise.all(sources.map(_loadKSourceFile))
    .then(function(){ u._loaded = true; });
  return _kUnitLoadPromises[newIdx];
}

// ── Unit-quiz blueprint sampler ──────────────────────────────────────────────
//  Groups u.testBank by each question's lessonId tag, shuffles each bucket,
//  takes the blueprint-specified count per lesson, then final-shuffles the
//  combined set so lesson order within the quiz is randomized.
function _buildKUnitQuiz(u){
  if(!u || !u.quizBlueprint || !u.testBank) return u && u.testBank ? u.testBank.slice() : [];
  var bp = u.quizBlueprint;
  var buckets = {};
  u.testBank.forEach(function(q){
    var lid = q.lessonId;
    if(!lid) return;
    (buckets[lid] = buckets[lid] || []).push(q);
  });
  function shuffle(arr){
    for(var i = arr.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  var out = [];
  Object.keys(bp).forEach(function(lid){
    var need = bp[lid];
    var pool = buckets[lid] ? buckets[lid].slice() : [];
    shuffle(pool);
    out = out.concat(pool.slice(0, need));
  });
  return shuffle(out);
}

// ── Grade swap ───────────────────────────────────────────────────────────────
//  Called from boot.js when localStorage.mmr_grade === 'K'.
//  Splices UNITS_DATA in-place so all existing nav, quiz, and lesson code
//  that indexes UNITS_DATA[idx] works without any modification.
//  Rebinds window._loadUnit to _loadKUnit so openUnit/quiz trigger K loader.
function _applyKindergartenGrade(){
  UNITS_DATA.splice(0, UNITS_DATA.length);
  _UNITS_DATA_K.forEach(function(u){ UNITS_DATA.push(u); });
  window._loadUnit = _loadKUnit;
}
