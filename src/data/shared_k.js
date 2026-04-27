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
      {id:'ku1l1', title:'Counting to 10',            icon:'🍎', desc:'Count objects up to 10 by touching each one',
        defaultTags: ['counting','count_to_10','cardinality'],
        defaultIntervention: {
          teach: { text:'Touch each object and count: 1, 2, 3 ...' },
          retry: { strategy:'similar', matchTags:['counting','count_to_10','cardinality'] }
        }},
      {id:'ku1l2', title:'Quick Look',                icon:'👀', desc:'Recognize small groups without counting one by one',
        defaultTags: ['counting','subitize','recognize_groups'],
        defaultIntervention: {
          teach: { text:'Look quickly. How many do you see?' },
          retry: { strategy:'similar', matchTags:['counting','subitize','recognize_groups'] }
        }},
      {id:'ku1l3', title:'Counting to 20',            icon:'🌟', desc:'Count objects all the way to 20',
        defaultTags: ['counting','count_to_20','cardinality'],
        defaultIntervention: {
          teach: { text:'Count one by one to 20.' },
          retry: { strategy:'similar', matchTags:['counting','count_to_20','cardinality'] }
        }},
      {id:'ku1l4', title:'Count to 20 — Review',      icon:'🔢', desc:'Count forward and backward all the way to 20',
        defaultTags: ['counting','count_to_20','count_backward'],
        defaultIntervention: {
          teach: { text:'Count up. Count back. Try both!' },
          retry: { strategy:'similar', matchTags:['counting','count_to_20','count_backward'] }
        }},
      {id:'ku1l5', title:'Read and Represent 11–20',  icon:'🌟', desc:'Match numerals 11–20 to sets and pictures',
        defaultTags: ['counting','teen_numbers','numeral_recognition','cardinality'],
        defaultIntervention: {
          teach: { text:'Match the numeral to the right number of objects.' },
          retry: { strategy:'similar', matchTags:['counting','teen_numbers','numeral_recognition','cardinality'] }
        }},
      {id:'ku1l6', title:'Counting Strategies',       icon:'👆', desc:'Use touch-counting and organized groups to count sets up to 20',
        defaultTags: ['counting','count_strategy','organize_groups'],
        defaultIntervention: {
          teach: { text:'Touch each one. Group by tens. Then count.' },
          retry: { strategy:'similar', matchTags:['counting','count_strategy','organize_groups'] }
        }},
      {id:'ku1l7', title:'Quick Look: Subitize',      icon:'👀', desc:'Instantly recognize how many — no counting needed!',
        defaultTags: ['counting','subitize','recognize_groups'],
        defaultIntervention: {
          teach: { text:'See it. Know it. No counting!' },
          retry: { strategy:'similar', matchTags:['counting','subitize','recognize_groups'] }
        }}
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
      {id:'ku2l1', title:'One More, One Less',          icon:'🔢', desc:'Find one more or one less than a number',
        defaultTags: ['number_relationships','one_more','one_less'],
        defaultIntervention: {
          teach: { text:'Add 1 for one more. Take 1 for one less.' },
          retry: { strategy:'similar', matchTags:['number_relationships','one_more','one_less'] }
        }},
      {id:'ku2l2', title:'Compare Sets',                icon:'⚖️', desc:'Compare groups to find more, fewer, or same',
        defaultTags: ['number_relationships','compare','more_fewer_same'],
        defaultIntervention: {
          teach: { text:'Match each one. The bigger set has extras.' },
          retry: { strategy:'similar', matchTags:['number_relationships','compare','more_fewer_same'] }
        }},
      {id:'ku2l3', title:'Compare Numbers',             icon:'🔍', desc:'Use greater than, less than, and equal',
        defaultTags: ['number_relationships','compare','greater_less_equal'],
        defaultIntervention: {
          teach: { text:'Bigger number is greater. Smaller is less.' },
          retry: { strategy:'similar', matchTags:['number_relationships','compare','greater_less_equal'] }
        }},
      {id:'ku2l4', title:'Compose & Decompose',         icon:'➕', desc:'Put numbers together and break them apart',
        defaultTags: ['number_relationships','compose','decompose'],
        defaultIntervention: {
          teach: { text:'Break the number into two parts. Or put parts together.' },
          retry: { strategy:'similar', matchTags:['number_relationships','compose','decompose'] }
        }},
      {id:'ku2l5', title:'More, Less, and Equal',       icon:'⚖️', desc:'Compare groups and numbers within 20',
        defaultTags: ['number_relationships','compare','more_less_equal'],
        defaultIntervention: {
          teach: { text:'Count both. Bigger is more. Same is equal.' },
          retry: { strategy:'similar', matchTags:['number_relationships','compare','more_less_equal'] }
        }},
      {id:'ku2l6', title:'One More / One Less — Review', icon:'➕', desc:'Find one more or one less for numbers up to 20',
        defaultTags: ['number_relationships','one_more','one_less'],
        defaultIntervention: {
          teach: { text:'Add 1 for one more. Take 1 for one less.' },
          retry: { strategy:'similar', matchTags:['number_relationships','one_more','one_less'] }
        }}
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
      {id:'ku3l1', title:'Adding Numbers',                  icon:'➕', desc:'Join two groups and count the total',
        defaultTags: ['add_sub','addition','join'],
        defaultIntervention: {
          teach: { text:'Put the groups together. Count all.' },
          retry: { strategy:'similar', matchTags:['add_sub','addition','join'] }
        }},
      {id:'ku3l2', title:'Subtracting Numbers',             icon:'➖', desc:'Take away from a group and find what is left',
        defaultTags: ['add_sub','subtraction','take_away'],
        defaultIntervention: {
          teach: { text:'Start with the big number. Take away. Count what is left.' },
          retry: { strategy:'similar', matchTags:['add_sub','subtraction','take_away'] }
        }},
      {id:'ku3l3', title:'Word Problems',                   icon:'📖', desc:'Solve joining, separating, and missing part stories',
        defaultTags: ['add_sub','word_problem','operation_choice'],
        defaultIntervention: {
          teach: { text:'Read the story. Add to join. Take away to separate.' },
          retry: { strategy:'similar', matchTags:['add_sub','word_problem','operation_choice'] }
        }},
      {id:'ku3l4', title:'Explain Thinking',                icon:'💡', desc:'Choose the right operation and explain your reasoning',
        defaultTags: ['add_sub','word_problem','operation_choice','reasoning'],
        defaultIntervention: {
          teach: { text:'Choose add or subtract. Tell why.' },
          retry: { strategy:'similar', matchTags:['add_sub','word_problem','operation_choice','reasoning'] }
        }},
      {id:'ku3l5', title:'Story Problems: Join & Separate', icon:'📖', desc:'Solve joining and separating story problems within 10',
        defaultTags: ['add_sub','word_problem','join_separate'],
        defaultIntervention: {
          teach: { text:'Join means add. Separate means subtract.' },
          retry: { strategy:'similar', matchTags:['add_sub','word_problem','join_separate'] }
        }},
      {id:'ku3l6', title:'Explain Your Math',               icon:'💬', desc:'Choose the right operation and explain your thinking',
        defaultTags: ['add_sub','word_problem','reasoning'],
        defaultIntervention: {
          teach: { text:'Choose your operation. Show your thinking.' },
          retry: { strategy:'similar', matchTags:['add_sub','word_problem','reasoning'] }
        }}
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
    teks: 'TEKS K.5A',
    quizBlueprint: { ku4l1:7, ku4l2:7, ku4l3:5, ku4l4:5 },
    lessons: [
      {id:'ku4l1', title:'Count Forward by Ones',        icon:'1️⃣', desc:'Say numbers in order — each number is one more',
        defaultTags: ['pattern','count_forward','by_ones'],
        defaultIntervention: {
          teach: { text:'Each number is one more than the last.' },
          retry: { strategy:'similar', matchTags:['pattern','count_forward','by_ones'] }
        }},
      {id:'ku4l2', title:'Count by Tens',                icon:'🔟', desc:'Skip-count by tens: 10, 20, 30 ...',
        defaultTags: ['pattern','skip_count','by_tens'],
        defaultIntervention: {
          teach: { text:'Count by tens: 10, 20, 30 ...' },
          retry: { strategy:'similar', matchTags:['pattern','skip_count','by_tens'] }
        }},
      {id:'ku4l3', title:'Count from Any Number',        icon:'🎯', desc:'Start counting from any number, not just 1',
        defaultTags: ['pattern','count_from_any'],
        defaultIntervention: {
          teach: { text:'Start with the number given. Count up from there.' },
          retry: { strategy:'similar', matchTags:['pattern','count_from_any'] }
        }},
      {id:'ku4l4', title:'Missing Numbers in Patterns',  icon:'❓', desc:'Find the missing number using the pattern',
        defaultTags: ['pattern','missing_number'],
        defaultIntervention: {
          teach: { text:'Look at the pattern. What number fits?' },
          retry: { strategy:'similar', matchTags:['pattern','missing_number'] }
        }}
    ],
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
      {id:'ku5l1', title:'Flat Shapes (2D)',   icon:'🔵', desc:'Identify circles, triangles, rectangles, and squares',
        defaultTags: ['shapes','2d','identify'],
        defaultIntervention: {
          teach: { text:'Look at the shape. Name it.' },
          retry: { strategy:'similar', matchTags:['shapes','2d','identify'] }
        }},
      {id:'ku5l2', title:'Solid Shapes (3D)',  icon:'📦', desc:'Identify spheres, cones, cylinders, and cubes in the real world',
        defaultTags: ['shapes','3d','identify'],
        defaultIntervention: {
          teach: { text:'Find the 3D shape that matches.' },
          retry: { strategy:'similar', matchTags:['shapes','3d','identify'] }
        }},
      {id:'ku5l3', title:'Sides & Corners',    icon:'📐', desc:'Count and compare sides and corners of 2D shapes',
        defaultTags: ['shapes','sides','corners','identify'],
        defaultIntervention: {
          teach: { text:'Count the sides and corners. What shape?' },
          retry: { strategy:'similar', matchTags:['shapes','sides','corners','identify'] }
        }},
      {id:'ku5l4', title:'Sort & Create Shapes', icon:'🎨', desc:'Sort shapes by attributes and create your own shapes',
        defaultTags: ['shapes','sort','attributes'],
        defaultIntervention: {
          teach: { text:'Sort by sides, corners, or shape.' },
          retry: { strategy:'similar', matchTags:['shapes','sort','attributes'] }
        }}
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
      {id:'ku6l1', title:'Comparing Length & Height',   icon:'📐', desc:'Find out which object is longer, shorter, taller, or the same',
        defaultTags: ['measurement','length','height','compare'],
        defaultIntervention: {
          teach: { text:'Line them up. Which is longer? Which is taller?' },
          retry: { strategy:'similar', matchTags:['measurement','length','height','compare'] }
        }},
      {id:'ku6l2', title:'Comparing Weight & Capacity', icon:'⚖️', desc:'Compare how heavy things are and how much they hold',
        defaultTags: ['measurement','weight','capacity','compare'],
        defaultIntervention: {
          teach: { text:'Heavier holds more weight. Capacity is how much it holds.' },
          retry: { strategy:'similar', matchTags:['measurement','weight','capacity','compare'] }
        }},
      {id:'ku6l3', title:'Ordering by Size',            icon:'🔢', desc:'Put objects in order from shortest to longest or lightest to heaviest',
        defaultTags: ['measurement','order','sequence'],
        defaultIntervention: {
          teach: { text:'Smallest to biggest. Or biggest to smallest.' },
          retry: { strategy:'similar', matchTags:['measurement','order','sequence'] }
        }},
      {id:'ku6l4', title:'Measurable Attributes',       icon:'🔍', desc:'Name the attribute being measured: length, weight, or capacity',
        defaultTags: ['measurement','attributes','identify'],
        defaultIntervention: {
          teach: { text:'Length, weight, or capacity? Name the attribute.' },
          retry: { strategy:'similar', matchTags:['measurement','attributes','identify'] }
        }}
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
      {id:'ku7l1', title:'Sort Into Groups',          icon:'🗂️',  desc:'Sort objects into categories and count each group',
        defaultTags: ['data','sort','categorize'],
        defaultIntervention: {
          teach: { text:'Put like things together. Then count.' },
          retry: { strategy:'similar', matchTags:['data','sort','categorize'] }
        }},
      {id:'ku7l2', title:'Build and Read Picture Graphs', icon:'📊', desc:'Use pictures to show information in a graph',
        defaultTags: ['data','picture_graph','build_read'],
        defaultIntervention: {
          teach: { text:'Each picture stands for one thing.' },
          retry: { strategy:'similar', matchTags:['data','picture_graph','build_read'] }
        }},
      {id:'ku7l3', title:'Read Picture Graphs',        icon:'👀',  desc:'Read graphs to find totals and compare groups',
        defaultTags: ['data','picture_graph','read'],
        defaultIntervention: {
          teach: { text:'Count the pictures in each row.' },
          retry: { strategy:'similar', matchTags:['data','picture_graph','read'] }
        }},
      {id:'ku7l4', title:'Compare Data',               icon:'⚖️',  desc:'Find how many more or fewer between two groups',
        defaultTags: ['data','compare','more_fewer'],
        defaultIntervention: {
          teach: { text:'Which has more? Which has fewer?' },
          retry: { strategy:'similar', matchTags:['data','compare','more_fewer'] }
        }}
    ],
    _loaded: false
  },
  {
    id: 'ku8',
    name: 'Financial Literacy & Money',
    icon: '💰',
    // Coin circle with $ suggestion (rects as a stylized dollar sign stroke)
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FFB300" opacity="0.12"/><circle cx="30" cy="30" r="14" fill="none" stroke="#FFB300" stroke-width="4"/><rect x="27" y="18" width="6" height="24" rx="1" fill="#FFB300"/></svg>',
    color: '#FFB300',
    gp: 8,
    teks: 'TEKS K.4A, K.9A, K.9B, K.9C, K.9D',
    quizBlueprint: { ku8l1:7, ku8l2:7, ku8l3:5, ku8l4:5 },
    lessons: [
      {id:'ku8l1', title:'Earning Money & Jobs',  icon:'💼', desc:'Learn how people earn money by working at different jobs',
        defaultTags: ['money','income','jobs'],
        defaultIntervention: {
          teach: { text:'People work at jobs to earn money.' },
          retry: { strategy:'similar', matchTags:['money','income','jobs'] }
        }},
      {id:'ku8l2', title:'Wants vs Needs',        icon:'🛒', desc:'Tell the difference between things we need and things we want',
        defaultTags: ['money','wants','needs'],
        defaultIntervention: {
          teach: { text:'Need = must have. Want = nice to have.' },
          retry: { strategy:'similar', matchTags:['money','wants','needs'] }
        }},
      {id:'ku8l3', title:'Identify Coins',        icon:'🪙', desc:'Name the penny, nickel, dime, and quarter',
        defaultTags: ['money','coins','penny','nickel','dime','quarter','identify'],
        defaultIntervention: {
          teach: { text:'Name the penny, nickel, dime, quarter.' },
          retry: { strategy:'similar', matchTags:['money','coins','penny','nickel','dime','quarter','identify'] }
        }},
      {id:'ku8l4', title:'Compare Coins',         icon:'⚖️', desc:'Compare coins by size and look — find the matching coin',
        defaultTags: ['money','coins','compare'],
        defaultIntervention: {
          teach: { text:'Look at the size and color to find the right coin.' },
          retry: { strategy:'similar', matchTags:['money','coins','compare'] }
        }}
    ],
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
  // Old u4.js — now Counting Patterns → new U4 (index 3)
  3: { target: 3, offset: 0 },
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
  7: { target: 6, offset: 0 },
  // u10.js — Financial Literacy & Money → new U8 (index 7)
  9: { target: 7, offset: 0 }
};

// Which legacy source files each NEW unit index needs loaded
const _K_UNIT_SOURCES = {
  0: [1, 5],     // new U1 (C&C) ← u1.js + u5.js
  1: [2],        // new U2 (Num Rel) ← u2.js
  2: [3, 5],     // new U3 (Add/Sub) ← u3.js + u5.js
  3: [4],        // new U4 (Counting Patterns) ← u4.js
  4: [6],        // new U5 (Geometry) ← u6.js
  5: [7],        // new U6 (Measurement) ← u7.js
  6: [8],        // new U7 (Data Analysis) ← u8.js
  7: [10]        // new U8 (Financial Literacy & Money) ← u10.js
};

// Named-file dependencies that must load BEFORE numeric source files.
// Loaded sequentially so global side effects (e.g. window.COIN_*) are
// guaranteed available when the unit's source(s) parse.
const _K_UNIT_DEPS = {
  7: ['coin_assets']  // u10.js needs window.COIN_* + window.coinImg
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

// Resolves the lesson object for a question via its lessonId. Used by quiz.js
// QE.normalize call sites and the _loadKUnit audit hook so lesson-level
// defaultTags / defaultIntervention can be merged at normalize time.
// Regex-based to survive split/merge unit routing — never derive unit id by
// string slicing or array index.
function _lessonContextFor(q){
  if(!q || !q.lessonId || !Array.isArray(UNITS_DATA)) return null;
  var match = q.lessonId.match(/^(k?u\d+)/);
  if(!match) return null;
  var unit = UNITS_DATA.find(function(u){ return u.id === match[1]; });
  if(!unit || !Array.isArray(unit.lessons)) return null;
  return unit.lessons.find(function(l){ return l.id === q.lessonId; }) || null;
}

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

// Accepts either a number (legacy u<N>.js) or a string (named file like
// 'coin_assets' → /data/k/coin_assets.js). Caches by stringified key so the
// two namespaces never collide.
function _loadKSourceFile(n){
  var key = String(n);
  if(_kSourceLoadPromises[key]) return _kSourceLoadPromises[key];
  var fileName = (typeof n === 'number') ? ('u' + n) : n;
  _kSourceLoadPromises[key] = new Promise(function(resolve, reject){
    var s = document.createElement('script');
    s.src = '/data/k/' + fileName + '.js';
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('Failed to load K source ' + s.src)); };
    document.head.appendChild(s);
  });
  return _kSourceLoadPromises[key];
}

function _loadKUnit(newIdx){
  var u = _UNITS_DATA_K[newIdx];
  if(!u) return Promise.resolve();
  if(u._loaded) return Promise.resolve();
  if(_kUnitLoadPromises[newIdx]) return _kUnitLoadPromises[newIdx];

  var deps    = _K_UNIT_DEPS[newIdx] || [];
  var sources = _K_UNIT_SOURCES[newIdx] || [];
  if(deps.length === 0 && sources.length === 0){
    u._loaded = true;
    return Promise.resolve();
  }

  // Deps load sequentially BEFORE sources so window.* globals (e.g. coin
  // assets) exist by the time the unit's source files parse.
  var depChain = deps.reduce(function(p, dep){
    return p.then(function(){ return _loadKSourceFile(dep); });
  }, Promise.resolve());

  _kUnitLoadPromises[newIdx] = depChain
    .then(function(){ return Promise.all(sources.map(_loadKSourceFile)); })
    .then(function(){
      u._loaded = true;
      // Audit hook — pre-normalizes every K question with its lesson context so
      // lesson-level defaultTags / defaultIntervention are visible to the audit.
      // Self-gates inside QE.auditPool (preview=1 OR localStorage.mmr_audit==='1').
      if(typeof QE !== 'undefined' && QE.auditPool){
        var auditList = [];
        (u.lessons || []).forEach(function(lesson){
          var bank = lesson.qBank || lesson.quiz || [];
          bank.forEach(function(q){ auditList.push(QE.normalize(q, lesson)); });
        });
        (u.testBank || []).forEach(function(q){
          auditList.push(QE.normalize(q, _lessonContextFor(q)));
        });
        QE.auditPool(auditList, u.id);
      }
    });
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
