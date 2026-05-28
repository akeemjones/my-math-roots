// ════════════════════════════════════════
//  shared_g3.js — Grade 3 Grade Data
//
//  Mirrors the shared_g1.js / shared_k.js pattern:
//    1. _UNITS_DATA_G3        — 10 unit shells (lesson content filled by data/g3/u*.js)
//    2. _mergeG3UnitData()    — called by dist/data/g3/u*.js at parse time
//    3. _loadG3Unit()         — lazy-loads /data/g3/u{n}.js on demand
//    4. _applyGrade3Grade()   — splices UNITS_DATA and rebinds _loadUnit
//
//  IMPORTANT — schema choice: Grade 3 unit files author the LEGACY compact
//  shape (points / examples / practice / qBank), exactly like Grade 2 and the
//  K units — NOT the Grade 1 v0.2.0 spec (keyIdeas / workedExamples /
//  practiceQuestions / quizBank). So _mergeG3UnitData merges lesson fields
//  directly (Object.assign onto the shell) and does NOT run the G1 field
//  adapters. Only the unit-test assembly tail (sourceRule:'all_lesson_quizbanks')
//  is borrowed from the Grade 1 helpers so the unit testBank is sampled from
//  the combined lesson qBanks rather than a separate hand-maintained bank.
// ════════════════════════════════════════

// ── Grade 3 unit shells ───────────────────────────────────────────────────────
//  Lesson shells (id/title/icon/desc/teks + diagnostic metadata) are added in
//  the data-scaffold commit; this file currently ships the 10 unit shells. The
//  per-lesson CONTENT (points/examples/practice/qBank) merges in lazily from
//  data/g3/u{n}.js via _mergeG3UnitData.
const _UNITS_DATA_G3 = [
  {
    id: 'g3u1', name: 'Place Value to 100,000',
    icon: '🔢',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#0095FF" opacity="0.1"/><rect x="3" y="20" width="54" height="30" rx="5" fill="#0095FF" opacity="0.15" stroke="#0095FF" stroke-width="2"/><line x1="21" y1="20" x2="21" y2="50" stroke="#0095FF" stroke-width="2"/><line x1="39" y1="20" x2="39" y2="50" stroke="#0095FF" stroke-width="2"/></svg>',
    color: '#0095FF', gp: 1, teks: 'TEKS 3.2A, 3.2B, 3.2C, 3.2D',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u2', name: 'Addition, Subtraction, and Money',
    icon: '➕',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF2200" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF2200"/><rect x="13.5" y="21.5" width="7" height="18" rx="3.5" fill="#FF2200"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF2200" opacity="0.75"/></svg>',
    color: '#FF2200', gp: 1, teks: 'TEKS 3.4A, 3.4B, 3.4C, 3.5A',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u3', name: 'Multiplication Foundations',
    icon: '✖️',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#9C27B0" opacity="0.1"/><circle cx="20" cy="20" r="4" fill="#9C27B0"/><circle cx="30" cy="20" r="4" fill="#9C27B0"/><circle cx="40" cy="20" r="4" fill="#9C27B0"/><circle cx="20" cy="32" r="4" fill="#9C27B0"/><circle cx="30" cy="32" r="4" fill="#9C27B0"/><circle cx="40" cy="32" r="4" fill="#9C27B0"/></svg>',
    color: '#9C27B0', gp: 2, teks: 'TEKS 3.4D, 3.4E, 3.4F, 3.5C',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u4', name: 'Division Foundations',
    icon: '➗',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#00897B" opacity="0.1"/><line x1="14" y1="30" x2="46" y2="30" stroke="#00897B" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="20" r="3.5" fill="#00897B"/><circle cx="30" cy="40" r="3.5" fill="#00897B"/></svg>',
    color: '#00897B', gp: 2, teks: 'TEKS 3.4F, 3.4H, 3.4J, 3.5B, 3.5D',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u5', name: 'Multiplication and Division Problem Solving',
    icon: '🧩',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF6F00" opacity="0.1"/><rect x="12" y="22" width="36" height="16" rx="3" fill="none" stroke="#FF6F00" stroke-width="2.5"/><line x1="24" y1="22" x2="24" y2="38" stroke="#FF6F00" stroke-width="2"/><line x1="36" y1="22" x2="36" y2="38" stroke="#FF6F00" stroke-width="2"/></svg>',
    color: '#FF6F00', gp: 2, teks: 'TEKS 3.4G, 3.4I, 3.4K, 3.5B, 3.5D, 3.5E',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u6', name: 'Fractions as Numbers',
    icon: '🍕',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#E91E63" opacity="0.1"/><circle cx="30" cy="30" r="18" fill="none" stroke="#E91E63" stroke-width="2.5"/><line x1="30" y1="12" x2="30" y2="48" stroke="#E91E63" stroke-width="2"/><line x1="14" y1="30" x2="46" y2="30" stroke="#E91E63" stroke-width="2"/></svg>',
    color: '#E91E63', gp: 3, teks: 'TEKS 3.3A, 3.3B, 3.3C, 3.3D, 3.3E, 3.7A',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u7', name: 'Equivalent and Comparing Fractions',
    icon: '⚖️',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#3F51B5" opacity="0.1"/><line x1="30" y1="14" x2="30" y2="24" stroke="#3F51B5" stroke-width="2.5"/><line x1="12" y1="24" x2="48" y2="24" stroke="#3F51B5" stroke-width="2.5"/><circle cx="18" cy="38" r="7" fill="none" stroke="#3F51B5" stroke-width="2"/><circle cx="42" cy="38" r="7" fill="none" stroke="#3F51B5" stroke-width="2"/></svg>',
    color: '#3F51B5', gp: 3, teks: 'TEKS 3.3F, 3.3G, 3.3H, 3.6E',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u8', name: 'Geometry, Area, and Perimeter',
    icon: '🔷',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#43A047" opacity="0.1"/><rect x="14" y="18" width="32" height="24" rx="2" fill="none" stroke="#43A047" stroke-width="2.5"/><line x1="22" y1="18" x2="22" y2="42" stroke="#43A047" stroke-width="1.2"/><line x1="30" y1="18" x2="30" y2="42" stroke="#43A047" stroke-width="1.2"/><line x1="38" y1="18" x2="38" y2="42" stroke="#43A047" stroke-width="1.2"/></svg>',
    color: '#43A047', gp: 3, teks: 'TEKS 3.6A, 3.6B, 3.6C, 3.6D, 3.7B',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u9', name: 'Measurement, Time, and Data',
    icon: '📏',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#00ACC1" opacity="0.1"/><circle cx="30" cy="30" r="16" fill="none" stroke="#00ACC1" stroke-width="2.5"/><line x1="30" y1="30" x2="30" y2="20" stroke="#00ACC1" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="30" x2="38" y2="34" stroke="#00ACC1" stroke-width="2.5" stroke-linecap="round"/></svg>',
    color: '#00ACC1', gp: 4, teks: 'TEKS 3.7C, 3.7D, 3.7E, 3.8A, 3.8B',
    lessons: [], _loaded: false
  },
  {
    id: 'g3u10', name: 'Personal Financial Literacy and CBE Final Review',
    icon: '💰',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FBC02D" opacity="0.12"/><circle cx="30" cy="30" r="16" fill="none" stroke="#FBC02D" stroke-width="2.5"/><text x="30" y="36" text-anchor="middle" font-size="16" fill="#FBC02D">$</text></svg>',
    color: '#FBC02D', gp: 4, teks: 'TEKS 3.9A, 3.9B, 3.9C, 3.9D, 3.9E, 3.9F',
    lessons: [], _loaded: false
  }
];

// ── Load infrastructure ────────────────────────────────────────────────────────
const _g3UnitLoadPromises = {};

function _loadG3SourceFile(num){
  return new Promise(function(res){
    var s = document.createElement('script');
    s.src = '/data/g3/u' + num + '.js';
    s.onload = res;
    s.onerror = function(){ console.warn('[G3] data/g3/u' + num + '.js not found — unit will show empty'); res(); };
    document.head.appendChild(s);
  });
}

function _loadG3Unit(idx){
  var u = _UNITS_DATA_G3[idx];
  if(!u) return Promise.resolve();
  if(u._loaded) return Promise.resolve();
  if(_g3UnitLoadPromises[idx]) return _g3UnitLoadPromises[idx];

  // Units with data files: idx 0 → u1.js … idx 9 → u10.js. Any future
  // shell-only unit beyond idx 9 short-circuits so the loader does not try
  // to fetch a file that doesn't exist yet.
  if(idx > 9){
    u._loaded = true;
    return Promise.resolve();
  }

  var fileNum = idx + 1;
  _g3UnitLoadPromises[idx] = _loadG3SourceFile(fileNum).then(function(){
    if(!u._loaded) u._loaded = true; // fallback if the script didn't call _mergeG3UnitData
  });
  return _g3UnitLoadPromises[idx];
}

// ── Unit test bank assembly helpers ──────────────────────────────────────────
//  Self-contained (no dependency on util.js, which loads after this file).

function _g3Shuffle(arr){
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// Largest-remainder apportionment — distributes `total` across `weights`
// proportionally, returning integers that sum to `total`.
function _g3Apportion(total, weights){
  if (!weights || weights.length === 0) return [];
  var sumW = 0;
  for (var i = 0; i < weights.length; i++) sumW += weights[i];
  if (sumW === 0 || total === 0) return weights.map(function(){ return 0; });
  var quotas = weights.map(function(w){ return total * w / sumW; });
  var floors = quotas.map(function(q){ return Math.floor(q); });
  var allocated = 0;
  for (var k = 0; k < floors.length; k++) allocated += floors[k];
  var deficit = total - allocated;
  if (deficit <= 0) return floors;
  var indexed = quotas.map(function(q, i){ return { i: i, frac: q - Math.floor(q), tie: Math.random() }; });
  indexed.sort(function(a, b){ if (Math.abs(b.frac - a.frac) > 1e-9) return b.frac - a.frac; return a.tie - b.tie; });
  for (var d = 0; d < deficit && d < indexed.length; d++) floors[indexed[d].i]++;
  return floors;
}

// Assembles the FULL unit-test POOL from every lesson qBank question. Each
// returned question is a shallow clone tagged with source-lesson metadata
// (sourceLessonId/Title/Index, sourceUnitId). Original arrays are never
// mutated. Per-attempt sampling happens later via _sampleG3UnitTestAttempt.
function _assembleG3UnitTestBank(u){
  var result = [];
  (u.lessons || []).forEach(function(lesson, lessonIdx){
    var bank = lesson.qBank || [];
    for (var i = 0; i < bank.length; i++) {
      result.push(Object.assign({}, bank[i], {
        sourceLessonId:    lesson.id || null,
        sourceLessonTitle: lesson.title || null,
        sourceLessonIndex: lessonIdx,
        sourceUnitId:      u.id || null
      }));
    }
  });
  return result;
}

// Samples `n` questions from the full unit-test pool, balanced across lessons
// (as evenly as possible) and difficulty (target ~8E/10M/7H per 25, scaled).
// Never mutates `pool`. Mirrors the Grade 1 _sampleUnitTestAttempt behaviour.
function _sampleG3UnitTestAttempt(pool, n){
  if (!pool || pool.length === 0) return [];
  if (pool.length <= n) { var copy = pool.slice(); _g3Shuffle(copy); return copy; }

  var byLesson = {};
  for (var p = 0; p < pool.length; p++) {
    var idx = pool[p].sourceLessonIndex != null ? pool[p].sourceLessonIndex : 0;
    if (!byLesson[idx]) byLesson[idx] = [];
    byLesson[idx].push(pool[p]);
  }
  var lessonIndices = Object.keys(byLesson).map(Number).sort(function(a, b){ return a - b; });
  var numLessons = lessonIndices.length;
  if (numLessons === 0) return [];

  var base = Math.floor(n / numLessons);
  var bonus = n - base * numLessons;
  var lessonSizes = lessonIndices.map(function(){ return base; });
  if (bonus > 0) {
    var bonusOrder = lessonIndices.slice();
    _g3Shuffle(bonusOrder);
    for (var b = 0; b < bonus; b++) lessonSizes[lessonIndices.indexOf(bonusOrder[b])]++;
  }

  var eTotal = Math.round(n * 8 / 25);
  var mTotal = Math.round(n * 10 / 25);
  var hTotal = n - eTotal - mTotal;
  var ePerLesson = _g3Apportion(eTotal, lessonSizes);
  var afterE = lessonSizes.map(function(s, i){ return s - ePerLesson[i]; });
  var hPerLesson = _g3Apportion(hTotal, afterE);
  var mPerLesson = lessonSizes.map(function(s, i){ return afterE[i] - hPerLesson[i]; });

  var result = [];
  lessonIndices.forEach(function(lIdx, i){
    var lessonPool = byLesson[lIdx];
    var ePool = lessonPool.filter(function(q){ return q.d === 'e'; });
    var mPool = lessonPool.filter(function(q){ return q.d === 'm'; });
    var hPool = lessonPool.filter(function(q){ return q.d === 'h'; });
    _g3Shuffle(ePool); _g3Shuffle(mPool); _g3Shuffle(hPool);
    var picks = ePool.slice(0, ePerLesson[i]).concat(mPool.slice(0, mPerLesson[i])).concat(hPool.slice(0, hPerLesson[i]));
    var lessonTarget = lessonSizes[i];
    if (picks.length < lessonTarget) {
      var picked = picks.slice();
      var spillover = lessonPool.filter(function(q){ return picked.indexOf(q) === -1; });
      _g3Shuffle(spillover);
      var needed = lessonTarget - picks.length;
      for (var s = 0; s < needed && s < spillover.length; s++) picks.push(spillover[s]);
    }
    for (var pi = 0; pi < picks.length; pi++) result.push(picks[pi]);
  });
  _g3Shuffle(result);
  return result;
}

// ── Data merge (called by dist/data/g3/u{n}.js at parse time) ─────────────────
//  Grade 3 lessons are authored in the LEGACY compact shape. Merge fields
//  directly onto the shell (no v0.2.0 adapters), then assemble the unit-test
//  pool from the combined lesson qBanks when requested.
function _mergeG3UnitData(idx, spec){
  var u = _UNITS_DATA_G3[idx];
  if(!u){ console.error('[G3 merge] No unit at index', idx); return; }
  if(spec && Array.isArray(spec.lessons)){
    spec.lessons.forEach(function(ld, i){
      if(u.lessons[i]) Object.assign(u.lessons[i], ld);
      else u.lessons[i] = ld;
    });
  }
  if (spec && spec.unitTest) {
    u.unitTest = spec.unitTest;
    if (spec.unitTest.sourceRule === 'all_lesson_quizbanks') {
      u.testBank = _assembleG3UnitTestBank(u);
    } else if (Array.isArray(spec.unitTest.bank)) {
      u.testBank = spec.unitTest.bank;
    }
  }
  u._loaded = true;
}

// ── Grade swap ────────────────────────────────────────────────────────────────
//  Called from boot.js when localStorage.mmr_grade === '3'. Splices UNITS_DATA
//  in-place (same pattern as _applyKindergartenGrade / _applyGrade1Grade).
//  IMPORTANT: must NOT write mmr_grade — the student's selection is the source
//  of truth and is persisted elsewhere (switchGrade / enterStudentLearningSession).
function _applyGrade3Grade(){
  UNITS_DATA.splice(0, UNITS_DATA.length);
  _UNITS_DATA_G3.forEach(function(u){ UNITS_DATA.push(u); });
  window._loadUnit = _loadG3Unit;
}
