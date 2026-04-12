// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════

// ── Integrity helpers (function declarations hoist — safe to use below) ──
function _signData(str){
  // DJB2 hash with app salt — tamper-detection, not crypto security
  const s = str + ':mymathroots_integrity_v1';
  let h = 0;
  for(let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0;
  return String(h >>> 0);
}
function safeLoadSigned(key, defaultVal){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return defaultVal;
    const w = JSON.parse(raw);
    if(w && typeof w.d === 'string' && typeof w.s === 'string'){
      // Signed format — verify integrity
      if(_signData(w.d) !== w.s){
        console.warn('[state] Integrity fail — resetting', key);
        localStorage.removeItem(key);
        return defaultVal;
      }
      return JSON.parse(w.d) || defaultVal;
    }
    // Legacy plain format — migrate transparently (no data loss for existing users)
    const migrated = JSON.stringify(w);
    localStorage.setItem(key, JSON.stringify({ d: migrated, s: _signData(migrated) }));
    return w || defaultVal;
  } catch(e){ return defaultVal; }
}
function saveSigned(key, value){
  const d = JSON.stringify(value);
  localStorage.setItem(key, JSON.stringify({ d, s: _signData(d) }));
}

const DONE   = safeLoadSigned('wb_done5', {});
const SCORES = safeLoadSigned('wb_sc5', []);
function safeLoad(k,d){ try{ return JSON.parse(localStorage.getItem(k)||'null')||d; } catch{ return d; } }
function saveDone(){ saveSigned('wb_done5', DONE); }
function saveSc(){ saveSigned('wb_sc5', SCORES); }

// ── SCORES validation wrapper ──
// Wrap push/unshift to validate entries and auto-cap at 200
const _SCORES_REQUIRED = ['qid','score','total','pct'];
(function _wrapScores(){
  const _origPush = SCORES.push.bind(SCORES);
  const _origUnshift = SCORES.unshift.bind(SCORES);

  function _validateEntry(entry, method){
    if(!entry || typeof entry !== 'object') {
      console.warn('[state] ' + method + ': ignoring non-object entry', entry);
      return false;
    }
    for(let i=0; i<_SCORES_REQUIRED.length; i++){
      if(!((_SCORES_REQUIRED[i]) in entry)){
        console.warn('[state] ' + method + ': entry missing field "' + _SCORES_REQUIRED[i] + '"', entry);
        return false;
      }
    }
    return true;
  }

  function _capScores(){
    while(SCORES.length > 200) SCORES.pop();
  }

  SCORES.push = function(){
    const result = _origPush.apply(null, Array.prototype.filter.call(arguments, function(e){ return _validateEntry(e, 'push'); }));
    _capScores();
    return result;
  };
  SCORES.unshift = function(){
    const result = _origUnshift.apply(null, Array.prototype.filter.call(arguments, function(e){ return _validateEntry(e, 'unshift'); }));
    _capScores();
    return result;
  };
})();

// ── MASTERY — per-question performance tracking (adaptive learning) ──
// Key: 31-hash of question text → base36 string
// Value: { attempts: N, correct: N, lastSeen: timestamp }
const MASTERY = safeLoad('wb_mastery', {});
function saveMastery(){ localStorage.setItem('wb_mastery', JSON.stringify(MASTERY)); }

function _qKey(text){
  let h = 0;
  for(let i = 0; i < text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  return h.toString(36);
}

function _updateMastery(answers){
  const now = Date.now();
  answers.forEach(function(a){
    if(!a || !a.t) return;
    const k = _qKey(a.t);
    const m = MASTERY[k] || { attempts:0, correct:0, lastSeen:0 };
    m.attempts++;
    if(a.ok) m.correct++;
    m.lastSeen = now;
    MASTERY[k] = m;
  });
  saveMastery();
}

// Streak — consecutive days of lesson activity (guests: localStorage; signed-in: also Supabase)
let STREAK = safeLoad('wb_streak', { current: 0, longest: 0, lastDate: null });

// ── STREAK shape freeze ──
// Prevent accidental addition of new properties to STREAK
const _STREAK_KEYS = Object.keys(STREAK);
STREAK = new Proxy(STREAK, {
  set: function(target, prop, value){
    if(_STREAK_KEYS.indexOf(prop) === -1){
      console.warn('[state] STREAK: blocked unknown property "' + prop + '"');
      return true; // silently ignore — don't throw
    }
    target[prop] = value;
    return true;
  }
});

// ── APP_TIME — cumulative foreground session tracking ──
// dailySecs: { "YYYY-MM-DD": seconds } — rolling 14-day window
const APP_TIME = safeLoad('wb_apptime', { totalSecs:0, sessions:0, dailySecs:{} });
function saveAppTime(){
  // Trim entries older than 14 days
  const cutoff = new Date(Date.now() - 14*86400000).toISOString().slice(0,10);
  Object.keys(APP_TIME.dailySecs).forEach(function(d){ if(d < cutoff) delete APP_TIME.dailySecs[d]; });
  localStorage.setItem('wb_apptime', JSON.stringify(APP_TIME));
}

// ── Debug helper ──
function _stateDebug(){
  // no-op in production
  void DONE; void SCORES; void STREAK;
}
