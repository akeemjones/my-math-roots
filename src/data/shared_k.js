// ════════════════════════════════════════
//  shared_k.js — Kindergarten Grade Data
//
//  Mirrors shared.js structure; bundled into app.js via SRC_FILES.
//  Must appear after data/shared.js in SRC_FILES (reads UNITS_DATA).
//  Completely isolated from Grade 2/3 — do not import or modify shared.js.
// ════════════════════════════════════════

// ── K metadata shell ─────────────────────────────────────────────────────────
//  Lesson content (points/examples/practice/qBank) and testBank are
//  lazy-loaded on demand via _loadKUnit(idx), matching the Grade 2 pattern.
const _UNITS_DATA_K = [
  {
    id: 'ku1',
    name: 'Counting & Cardinality',
    icon: '🔢',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#4CAF50" opacity="0.12"/><circle cx="18" cy="30" r="5" fill="#4CAF50"/><circle cx="30" cy="30" r="5" fill="#4CAF50"/><circle cx="42" cy="30" r="5" fill="#4CAF50"/></svg>',
    color: '#4CAF50',
    gp: 1,
    teks: 'TEKS K.2A, K.2B, K.2C',
    lessons: [
      {id:'ku1l1', title:'Counting to 10', icon:'🍎', desc:'Count objects up to 10 by touching each one'},
      {id:'ku1l2', title:'Quick Look',      icon:'👀', desc:'Recognize small groups without counting one by one'},
      {id:'ku1l3', title:'Counting to 20', icon:'🌟', desc:'Count objects all the way to 20'}
    ],
    _loaded: false
  }
  ,
  {
    id: 'ku2',
    name: 'Number Relationships',
    icon: '⚖️',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#0095FF" opacity="0.12"/><text x="30" y="40" text-anchor="middle" font-size="30" font-family="sans-serif">⚖️</text></svg>',
    color: '#0095FF',
    gp: 2,
    teks: 'TEKS K.2E, K.2F, K.2G, K.2H, K.2I',
    lessons: [
      {id:'ku2l1', title:'One More, One Less',    icon:'🔢', desc:'Find one more or one less than a number'},
      {id:'ku2l2', title:'Compare Sets',           icon:'⚖️', desc:'Compare groups to find more, fewer, or same'},
      {id:'ku2l3', title:'Compare Numbers',        icon:'🔍', desc:'Use greater than, less than, and equal'},
      {id:'ku2l4', title:'Compose & Decompose',    icon:'➕', desc:'Put numbers together and break them apart'}
    ],
    _loaded: false
  }
  ,
  {
    id: 'ku3',
    name: 'Addition & Subtraction',
    icon: '➕',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#E91E63" opacity="0.12"/><text x="30" y="40" text-anchor="middle" font-size="28" font-family="sans-serif">➕</text></svg>',
    color: '#E91E63',
    gp: 3,
    teks: 'TEKS K.3A, K.3B, K.3C, K.3D',
    lessons: [
      {id:'ku3l1', title:'Adding Numbers',     icon:'➕', desc:'Join two groups and count the total'},
      {id:'ku3l2', title:'Subtracting Numbers', icon:'➖', desc:'Take away from a group and find what is left'},
      {id:'ku3l3', title:'Word Problems',       icon:'📖', desc:'Solve joining, separating, and missing part stories'},
      {id:'ku3l4', title:'Explain Thinking',    icon:'💡', desc:'Choose the right operation and explain your reasoning'}
    ],
    _loaded: false
  }
  ,
  {
    id: 'ku4',
    name: 'Teen Numbers & Counting to 20',
    icon: '🔟',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF9800" opacity="0.12"/><text x="30" y="40" text-anchor="middle" font-size="20" font-family="sans-serif" fill="#FF9800" font-weight="bold">20</text></svg>',
    color: '#FF9800',
    gp: 4,
    teks: 'TEKS K.2A, K.2B, K.2E, K.2F',
    lessons: [
      {id:'ku4l1', title:'Count to 20',             icon:'🔢', desc:'Count forward and backward all the way to 20'},
      {id:'ku4l2', title:'Read and Represent 11–20', icon:'🌟', desc:'Match numerals 11–20 to sets and pictures'},
      {id:'ku4l3', title:'More, Less, and Equal',    icon:'⚖️', desc:'Compare groups and numbers within 20'},
      {id:'ku4l4', title:'One More / One Less',       icon:'➕', desc:'Find one more or one less for numbers up to 20'}
    ],
    _loaded: false
  }
  ,
  {
    id: 'ku5',
    name: 'Counting, Cardinality & Problem Solving',
    icon: '🧮',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#9C27B0" opacity="0.12"/><text x="30" y="40" text-anchor="middle" font-size="22" font-family="sans-serif" fill="#9C27B0" font-weight="bold">🧮</text></svg>',
    color: '#9C27B0',
    gp: 5,
    teks: 'TEKS K.2C, K.2D, K.3A, K.3B, K.3C',
    lessons: [
      {id:'ku5l1', title:'Counting Strategies',             icon:'👆', desc:'Use touch-counting and organized groups to count sets up to 20'},
      {id:'ku5l2', title:'Quick Look: Subitize',             icon:'👀', desc:'Instantly recognize how many — no counting needed!'},
      {id:'ku5l3', title:'Story Problems: Join & Separate',  icon:'📖', desc:'Solve joining and separating story problems within 10'},
      {id:'ku5l4', title:'Explain Your Math',                icon:'💬', desc:'Choose the right operation and explain your thinking'}
    ],
    _loaded: false
  }
  ,
  {
    id: 'ku6',
    name: 'Geometry — Shapes & Solids',
    icon: '🔺',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#2196F3" opacity="0.12"/><text x="30" y="40" text-anchor="middle" font-size="26" font-family="sans-serif" fill="#2196F3" font-weight="bold">🔺</text></svg>',
    color: '#2196F3',
    gp: 6,
    teks: 'TEKS K.6A, K.6B, K.6C, K.6D, K.6E, K.6F',
    lessons: [
      {id:'ku6l1', title:'Flat Shapes (2D)',          icon:'🔵', desc:'Identify circles, triangles, rectangles, and squares'},
      {id:'ku6l2', title:'Solid Shapes (3D)',          icon:'📦', desc:'Identify spheres, cones, cylinders, and cubes in the real world'},
      {id:'ku6l3', title:'Sides & Corners',            icon:'📐', desc:'Count and compare sides and corners of 2D shapes'},
      {id:'ku6l4', title:'Sort & Create Shapes',       icon:'🎨', desc:'Sort shapes by attributes and create your own shapes'}
    ],
    _loaded: false
  }
  ,
  {
    id: 'ku7',
    name: 'Measurement — Comparing & Ordering',
    icon: '📏',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF5722" opacity="0.12"/><text x="30" y="40" text-anchor="middle" font-size="26" font-family="sans-serif" fill="#FF5722" font-weight="bold">📏</text></svg>',
    color: '#FF5722',
    gp: 7,
    teks: 'TEKS K.7A, K.7B',
    lessons: [
      {id:'ku7l1', title:'Comparing Length & Height', icon:'📐', desc:'Find out which object is longer, shorter, taller, or the same'},
      {id:'ku7l2', title:'Comparing Weight & Capacity', icon:'⚖️', desc:'Compare how heavy things are and how much they hold'},
      {id:'ku7l3', title:'Ordering by Size',           icon:'🔢', desc:'Put objects in order from shortest to longest or lightest to heaviest'},
      {id:'ku7l4', title:'Measurable Attributes',      icon:'🔍', desc:'Name the attribute being measured: length, weight, or capacity'}
    ],
    _loaded: false
  }
];

// ── K lazy-load infrastructure ───────────────────────────────────────────────
const _kUnitLoadPromises = {};

function _mergeKUnitData(idx, data){
  var u = _UNITS_DATA_K[idx];
  data.lessons.forEach(function(ld, i){ Object.assign(u.lessons[i], ld); });
  if(data.testBank) u.testBank = data.testBank;
  u._loaded = true;
}

function _loadKUnit(idx){
  var u = _UNITS_DATA_K[idx];
  if(u._loaded) return Promise.resolve();
  if(_kUnitLoadPromises[idx]) return _kUnitLoadPromises[idx];
  _kUnitLoadPromises[idx] = new Promise(function(resolve, reject){
    var s = document.createElement('script');
    s.src = '/data/k/u' + (idx + 1) + '.js';
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('Failed to load K unit ' + (idx + 1))); };
    document.head.appendChild(s);
  });
  return _kUnitLoadPromises[idx];
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
