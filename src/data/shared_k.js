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
