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
    color: '#0095FF', gp: 1, teks: 'TEKS 1.2A-C, 1.2B',
    lessons: [
      { id:'g1u2l1', title:'Tens and Ones', icon:'📦', desc:'Understand tens and ones up to 120' }
    ],
    _loaded: true
  },
  {
    id: 'g1u3', name: 'Addition and Subtraction to 20',
    icon: '➕',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF2200" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF2200"/><rect x="13.5" y="21.5" width="7" height="18" rx="3.5" fill="#FF2200"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF2200" opacity="0.75"/></svg>',
    color: '#FF2200', gp: 1, teks: 'TEKS 1.3A-D, 1.4',
    lessons: [
      { id:'g1u3l1', title:'Add Within 20', icon:'➕', desc:'Use strategies to add within 20' },
      { id:'g1u3l2', title:'Subtract Within 20', icon:'➖', desc:'Use strategies to subtract within 20' }
    ],
    _loaded: true
  },
  {
    id: 'g1u4', name: 'Two-Digit Addition and Subtraction',
    icon: '🔢',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF8C00" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF8C00"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF8C00" opacity="0.75"/></svg>',
    color: '#FF8C00', gp: 1, teks: 'TEKS 1.3A-C',
    lessons: [
      { id:'g1u4l1', title:'Add Two-Digit Numbers', icon:'➕', desc:'Add two-digit numbers using models' }
    ],
    _loaded: true
  },
  {
    id: 'g1u5', name: 'Geometry',
    icon: '🔷',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#9C27B0" opacity="0.1"/><polygon points="30,10 54,48 6,48" fill="none" stroke="#9C27B0" stroke-width="2.5"/></svg>',
    color: '#9C27B0', gp: 1, teks: 'TEKS 1.6',
    lessons: [
      { id:'g1u5l1', title:'2D and 3D Shapes', icon:'🔷', desc:'Identify and sort 2D and 3D shapes' }
    ],
    _loaded: true
  },
  {
    id: 'g1u6', name: 'Measurement',
    icon: '📏',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#009688" opacity="0.1"/><rect x="8" y="22" width="44" height="16" rx="3" fill="none" stroke="#009688" stroke-width="2.5"/><line x1="16" y1="22" x2="16" y2="38" stroke="#009688" stroke-width="1.5"/><line x1="24" y1="22" x2="24" y2="33" stroke="#009688" stroke-width="1.5"/><line x1="32" y1="22" x2="32" y2="38" stroke="#009688" stroke-width="1.5"/><line x1="40" y1="22" x2="40" y2="33" stroke="#009688" stroke-width="1.5"/></svg>',
    color: '#009688', gp: 1, teks: 'TEKS 1.7',
    lessons: [
      { id:'g1u6l1', title:'Measure Length', icon:'📏', desc:'Measure using non-standard and standard units' }
    ],
    _loaded: true
  },
  {
    id: 'g1u7', name: 'Data Analysis',
    icon: '📊',
    svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF9800" opacity="0.1"/><rect x="8" y="38" width="10" height="12" rx="2" fill="#FF9800" opacity="0.6"/><rect x="22" y="28" width="10" height="22" rx="2" fill="#FF9800" opacity="0.8"/><rect x="36" y="18" width="10" height="32" rx="2" fill="#FF9800"/></svg>',
    color: '#FF9800', gp: 1, teks: 'TEKS 1.8',
    lessons: [
      { id:'g1u7l1', title:'Graphs and Charts', icon:'📊', desc:'Collect and organize data in graphs' }
    ],
    _loaded: true
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

  // Only Unit 0 (U1) has a data file right now
  if(idx !== 0){
    u._loaded = true;
    return Promise.resolve();
  }

  _g1UnitLoadPromises[idx] = _loadG1SourceFile(1).then(function(){
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
//    objectSet   { count:N, layout:? }   → organized dot rows (existing renderer)
//    numberLine  { min,max,ticks,jumps,mark } → SVG number line (L1.2+)
function _g1VisToV(vis) {
  if (!vis || !vis.type) return null;
  switch (vis.type) {
    case 'tenFrame':    return { type: 'tenFrame',    config: { count: vis.count } };
    case 'fivFrame':    return { type: 'fivFrame',    config: { count: vis.count } };
    case 'dicePattern': return { type: 'dicePattern', config: { face:  vis.face  } };
    case 'domino':      return { type: 'domino',      config: { left:  vis.left, right: vis.right } };
    case 'objectSet':   return { type: 'objectSet',   config: { count: vis.count, layout: vis.layout || 'rows', emoji: '●' } };
    case 'numberLine': {
      const nlCfg = { min: vis.min, max: vis.max, ticks: vis.ticks || [], jumps: vis.jumps || [], mark: vis.mark != null ? vis.mark : null };
      if (vis.mode       != null) nlCfg.mode       = vis.mode;
      if (vis.labels     != null) nlCfg.labels     = vis.labels;
      if (vis.hideLabels != null) nlCfg.hideLabels = vis.hideLabels;
      return { type: 'numberLine', config: nlCfg };
    }
    default:            return null;
  }
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
        o: choices.map(function(c){ return String(c.value); }),
        a: correctIdx,
        e: q.hint   || '',
        v: _g1VisToV(q.visual)   // converts v0.2.0 visual → {type,config} for _buildVisualHTML
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

  // Unit test bank — pull from spec.unitTest if wired in future
  if(spec.unitTest && Array.isArray(spec.unitTest.bank)){
    u.testBank = spec.unitTest.bank;
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
