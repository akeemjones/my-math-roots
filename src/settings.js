// ════════════════════════════════════════
//  ACCESSIBILITY SETTINGS
// ════════════════════════════════════════
const A11Y_KEY = 'wb_a11y';
function getA11y(){ try{ return JSON.parse(localStorage.getItem(A11Y_KEY)||'{}'); }catch{ return {}; } }
function applyA11y(){
  const cfg = getA11y();
  document.body.classList.toggle('a11y-colorblind',   !!cfg.colorblind);
  document.body.classList.toggle('a11y-haptic',       !!cfg.haptic);
  document.body.classList.toggle('a11y-reduce-motion',!!cfg.reduceMotion);
  document.body.classList.toggle('a11y-text-select',  !!cfg.textSelect);
  document.body.classList.toggle('a11y-focus',        !!cfg.focus);
  document.body.classList.toggle('a11y-screenreader', !!cfg.screenreader);
  _applyFocusListeners(!!cfg.focus);
}
// Focus indicators: add/remove .a11y-focused class via focus + touch/click
// iOS Safari doesn't fire focusin on button taps, so we also listen for click
let _focusListenersOn = false;
function _a11yFocusIn(e){ if(!_focusListenersOn) return; const t = e.target; if(t && t.classList) t.classList.add('a11y-focused'); }
function _a11yFocusOut(e){ const t = e.target; if(t && t.classList) t.classList.remove('a11y-focused'); }
function _a11yClick(e){
  if(!_focusListenersOn) return;
  const t = e.target.closest('button, a, [tabindex], input, select, textarea, .abtn');
  if(!t) return;
  document.querySelectorAll('.a11y-focused').forEach(el => el.classList.remove('a11y-focused'));
  t.classList.add('a11y-focused');
}
function _applyFocusListeners(on){
  if(on && !_focusListenersOn){
    document.addEventListener('focusin', _a11yFocusIn, true);
    document.addEventListener('focusout', _a11yFocusOut, true);
    document.addEventListener('click', _a11yClick, true);
    _focusListenersOn = true;
  } else if(!on && _focusListenersOn){
    document.removeEventListener('focusin', _a11yFocusIn, true);
    document.removeEventListener('focusout', _a11yFocusOut, true);
    document.removeEventListener('click', _a11yClick, true);
    document.querySelectorAll('.a11y-focused').forEach(el => el.classList.remove('a11y-focused'));
    _focusListenersOn = false;
  }
}
function toggleA11y(key){
  const cfg = getA11y();
  if(cfg[key]) delete cfg[key]; else cfg[key]=true;
  localStorage.setItem(A11Y_KEY, JSON.stringify(cfg));
  applyA11y();
  _syncA11yUI();
  // Re-render home so ARIA attributes update immediately
  if(key === 'screenreader' && typeof buildHome === 'function') buildHome(true);
}
function openAccessModal(){
  if(!_supaUser){ _showSignupNudge(); return; }
  const m = document.getElementById('access-modal');
  if(!m) return;
  m.style.display = 'flex';
  _animateModalOpen('access-modal');
  _lockScroll();
  history.pushState({mmrModal:'access-modal'}, '');
}
function closeAccessModal(){
  _animateModalClose('access-modal', ()=>{
    const m=document.getElementById('access-modal'); if(m) m.style.display='none';
    // Reset to options view for next open
    var opts=document.getElementById('access-options'), conf=document.getElementById('access-confirm');
    if(opts) opts.style.display='flex';
    if(conf) conf.style.display='none';
    _unlockScroll();
  });
}

function openPrReview(scoreId){
  const s = (typeof SCORES !== 'undefined') ? SCORES.find(function(x){ return x.id === scoreId; }) : null;
  if(!s || typeof _buildScReviewHtml !== 'function') return;
  const r = _buildScReviewHtml(s);
  const lb = document.getElementById('sc-lightbox');
  document.getElementById('sc-lightbox-head').innerHTML = r.headHtml;
  document.getElementById('sc-lightbox-body').innerHTML = r.bodyHtml;
  document.getElementById('sc-lightbox-body').scrollTop = 0;
  lb.classList.add('open', 'pr-above');
  if(typeof _animateModalOpen === 'function') _animateModalOpen('sc-lightbox');
  // Strip pr-above when lightbox closes so z-index returns to normal
  const _origClose = document.querySelector('#sc-lightbox .sc-lightbox-close');
  if(_origClose && !_origClose._prPatched){
    _origClose._prPatched = true;
    const _base = _origClose.getAttribute('onclick');
    _origClose.addEventListener('click', function(){ lb.classList.remove('pr-above'); _origClose._prPatched = false; }, {once:true});
  }
}

function openProgressReport(){
  // Require a signed-in account — guests see the signup prompt
  if(typeof _supaUser === 'undefined' || !_supaUser){
    if(typeof openAuthModal === 'function') openAuthModal();
    if(typeof _switchAuthTab === 'function') _switchAuthTab('signup');
    const titleEl = document.getElementById('auth-modal-title');
    if(titleEl) titleEl.textContent = 'Create a Free Account';
    const subEl = document.getElementById('auth-modal-sub');
    if(subEl) subEl.textContent = 'Sign up to unlock Progress Reports and save your student\'s data.';
    return;
  }

  const modal = document.getElementById('progress-report-modal');
  const body  = document.getElementById('progress-report-body');
  if(!modal || !body) return;

  const scores   = (typeof SCORES   !== 'undefined') ? SCORES   : [];
  const mastery  = (typeof MASTERY  !== 'undefined') ? MASTERY  : {};
  const appTime  = (typeof APP_TIME !== 'undefined') ? APP_TIME : { totalSecs:0, sessions:0, dailySecs:{} };
  const cfg      = (typeof loadSettings === 'function') ? loadSettings() : {};
  const streak   = (typeof STREAK   !== 'undefined') ? STREAK   : { current: 0 };
  const studentName = cfg.studentName || 'Student';

  // App time — this week (last 7 days)
  const todayStr = new Date().toISOString().slice(0,10);
  const weekSecs = (function(){
    let s = 0;
    for(let i=0; i<7; i++){
      const d = new Date(Date.now() - i*86400000).toISOString().slice(0,10);
      s += ((appTime.dailySecs||{})[d]||0);
    }
    return s;
  })();
  const avgSessionSecs = appTime.sessions > 0 ? Math.round(appTime.totalSecs / appTime.sessions) : 0;

  // Completed quizzes only (type known, pct numeric)
  const completed = scores.filter(function(s){ return s.pct != null && s.total > 0 && s.type; });
  const totalQuizzes = completed.length;
  const overallPct = totalQuizzes > 0
    ? Math.round(completed.reduce(function(sum,s){ return sum + s.pct; }, 0) / totalQuizzes)
    : 0;

  // Unit accuracy map: unitIdx → { total, sumPct }
  const unitMap = {};
  completed.forEach(function(s){
    if(s.unitIdx != null){
      const k = s.unitIdx;
      if(!unitMap[k]) unitMap[k] = { total:0, sumPct:0 };
      unitMap[k].total++;
      unitMap[k].sumPct += s.pct;
    }
  });

  // Reverse lookup: mastery key → question text (from SCORES answer history)
  const qTextMap = {};
  scores.forEach(function(s){
    if(s.answers) s.answers.forEach(function(a){
      if(a.t){
        const k = (typeof _qKey === 'function') ? _qKey(a.t) : null;
        if(k && !qTextMap[k]) qTextMap[k] = a.t;
      }
    });
  });

  // Weakness spotlight: < 60% accuracy, ≥ 2 attempts
  const weak = Object.entries(mastery)
    .filter(function(e){ const m=e[1]; return m.attempts >= 2 && (m.correct/m.attempts) < 0.6; })
    .sort(function(a,b){ return (a[1].correct/a[1].attempts) - (b[1].correct/b[1].attempts); })
    .slice(0, 5);

  // Time analysis — parse "M:SS" timeTaken strings into seconds
  function _parseSecs(t){ if(!t) return 0; const p=String(t).split(':'); return (parseInt(p[0])||0)*60+(parseInt(p[1])||0); }
  function _fmtSecs(s){ if(!s) return '—'; const m=Math.floor(s/60),sec=Math.round(s%60); return m+'m '+String(sec).padStart(2,'0')+'s'; }
  const withTime = completed.filter(function(s){ return s.timeTaken && _parseSecs(s.timeTaken) > 0; });
  const totalSecs = withTime.reduce(function(sum,s){ return sum+_parseSecs(s.timeTaken); }, 0);
  // Averages by type
  const timeByType = {};
  withTime.forEach(function(s){
    const tp = s.type || 'lesson';
    if(!timeByType[tp]) timeByType[tp] = { sum:0, n:0 };
    timeByType[tp].sum += _parseSecs(s.timeTaken);
    timeByType[tp].n++;
  });
  function _avgTime(type){ const t=timeByType[type]; return t && t.n ? Math.round(t.sum/t.n) : 0; }

  // Per-question time — aggregate timeSecs from answer records
  var _qTimeSumAll = 0, _qTimeCountAll = 0;
  completed.forEach(function(s){
    if(s.answers) s.answers.forEach(function(a){
      if(a.timeSecs != null && a.timeSecs < 300){
        _qTimeSumAll += a.timeSecs;
        _qTimeCountAll++;
      }
    });
  });
  const avgQSecs = _qTimeCountAll > 0 ? Math.round(_qTimeSumAll / _qTimeCountAll) : 0;

  // Per-quiz avg question time helper
  function _quizAvgQSecs(s){
    if(!s.answers) return 0;
    var sum=0, n=0;
    s.answers.forEach(function(a){ if(a.timeSecs != null && a.timeSecs < 300){ sum+=a.timeSecs; n++; } });
    return n > 0 ? Math.round(sum/n) : 0;
  }

  const recent = completed.slice(0, 10);
  const typeLabel = { lesson:'Lesson Quiz', unit:'Unit Test', final:'Final Test' };
  const unitNames = (typeof UNITS_DATA !== 'undefined')
    ? UNITS_DATA.map(function(u){ return u.name; })
    : Array.from({length:10}, function(_,i){ return 'Unit '+(i+1); });

  var h = '';

  // Student name + date
  h += '<div style="text-align:center;margin-bottom:16px">'
     + '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-lg);color:#1565C0">'+studentName+'</div>'
     + '<div style="font-size:var(--fs-sm);color:var(--txt2)">'+new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</div>'
     + '</div>';

  // Summary stats
  const accColor = overallPct >= 80 ? '#2e7d32' : overallPct >= 60 ? '#e65100' : '#c62828';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">'
     + '<div style="background:#e3f2fd;border-radius:14px;padding:12px 6px;text-align:center">'
     +   '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-xl);color:#1565C0">'+totalQuizzes+'</div>'
     +   '<div style="font-size:var(--fs-xs);color:#1565C0;opacity:.85;line-height:1.3">Quizzes<br>Taken</div></div>'
     + '<div style="background:#e8f5e9;border-radius:14px;padding:12px 6px;text-align:center">'
     +   '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-xl);color:'+accColor+'">'+overallPct+'%</div>'
     +   '<div style="font-size:var(--fs-xs);color:'+accColor+';opacity:.85;line-height:1.3">Overall<br>Accuracy</div></div>'
     + '<div style="background:#fff8e1;border-radius:14px;padding:12px 6px;text-align:center">'
     +   '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-xl);color:#f57f17">'+streak.current+'🔥</div>'
     +   '<div style="font-size:var(--fs-xs);color:#f57f17;opacity:.85;line-height:1.3">Day<br>Streak</div></div>'
     + '</div>';

  if(totalQuizzes === 0){
    h += '<div style="text-align:center;color:var(--txt2);font-size:var(--fs-base);padding:24px 0 8px">No quizzes completed yet.<br>Finish some lessons to see progress here!</div>';
    body.innerHTML = h;
    modal.style.display = 'flex';
    _lockScroll();
    return;
  }

  // Time section — app time + quiz time combined
  var hasAnyTime = appTime.totalSecs > 0 || withTime.length > 0;
  if(hasAnyTime){
    const lessonAvg = _avgTime('lesson');
    const unitAvg   = _avgTime('unit');
    const finalAvg  = _avgTime('final');
    h += '<div style="margin-bottom:20px">'
       + '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#37474f;margin-bottom:10px">⏱ Time</div>'
       + '<div style="background:rgba(103,58,183,.06);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:10px">';
    if(appTime.totalSecs > 0){
      h += '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">This week in app</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+_fmtSecs(weekSecs)+'</span></div>'
         + '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">Total time in app</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+_fmtSecs(appTime.totalSecs)+'</span></div>'
         + '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">Avg session length</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+_fmtSecs(avgSessionSecs)+'</span></div>';
    }
    if(withTime.length > 0){
      h += '<div style="height:1px;background:rgba(0,0,0,.07);margin:2px 0"></div>';
      if(lessonAvg){ h += '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">Avg lesson quiz time</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+_fmtSecs(lessonAvg)+'</span></div>'; }
      if(unitAvg){ h += '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">Avg unit test time</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+_fmtSecs(unitAvg)+'</span></div>'; }
      if(finalAvg){ h += '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">Avg final test time</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+_fmtSecs(finalAvg)+'</span></div>'; }
    }
    if(_qTimeCountAll > 0){
      if(withTime.length > 0) h += '<div style="height:1px;background:rgba(0,0,0,.07);margin:2px 0"></div>';
      h += '<div style="display:flex;justify-content:space-between;align-items:center">'
         +   '<span style="font-size:var(--fs-sm);color:var(--txt2)">Avg time per question</span>'
         +   '<span style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#673ab7">'+avgQSecs+'s</span></div>';
    }
    h += '</div></div>';
  }

  // Recent quizzes
  if(recent.length > 0){
    h += '<div style="margin-bottom:20px">'
       + '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#37474f;margin-bottom:10px">📋 Recent Quizzes</div>'
       + '<div style="display:flex;flex-direction:column;gap:6px">';
    recent.forEach(function(s){
      const color = s.color || '#6c5ce7';
      const pctColor = s.pct >= 80 ? '#2e7d32' : s.pct >= 60 ? '#e65100' : '#c62828';
      const tLabel = typeLabel[s.type] || s.type || '';
      const dispLabel = s.label || tLabel;
      const qAvg = _quizAvgQSecs(s);
      const hasQTime = s.answers && s.answers.some(function(a){ return a.timeSecs != null; });
      h += '<div style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.03);border-radius:10px;padding:8px 10px;cursor:pointer"'
         +   ' data-action="openPrReview" data-arg="'+s.id+'" role="button">'
         + '<div style="width:6px;height:36px;border-radius:3px;background:'+color+';flex-shrink:0"></div>'
         + '<div style="flex:1;min-width:0">'
         +   '<div style="font-size:var(--fs-sm);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+dispLabel+'</div>'
         +   '<div style="font-size:var(--fs-xs);color:var(--txt2)">'+(s.date||'')+(s.date?' · ':'')+tLabel+(hasQTime?' · ⏱ '+qAvg+'s/q':'')+' · <span style="color:'+color+'">View details →</span></div></div>'
         + '<div style="text-align:right;flex-shrink:0">'
         +   '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:'+pctColor+'">'+s.pct+'%</div>'
         +   '<div style="font-size:var(--fs-xs);color:var(--txt2)">'+s.score+'/'+s.total+'</div></div>'
         + '</div>';
    });
    h += '</div></div>';
  }

  // Unit accuracy bars
  const unitEntries = Object.entries(unitMap).filter(function(e){ return e[1].total > 0; });
  if(unitEntries.length > 0){
    h += '<div style="margin-bottom:20px">'
       + '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#37474f;margin-bottom:10px">📚 Unit Accuracy</div>'
       + '<div style="display:flex;flex-direction:column;gap:8px">';
    unitEntries.sort(function(a,b){ return parseInt(a[0])-parseInt(b[0]); }).forEach(function(e){
      const k = parseInt(e[0]);
      const v = e[1];
      const avg = Math.round(v.sumPct / v.total);
      const barColor = avg >= 80 ? '#2e7d32' : avg >= 60 ? '#f57f17' : '#c62828';
      const uName = unitNames[k] || ('Unit '+(k+1));
      h += '<div>'
         + '<div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);margin-bottom:3px">'
         +   '<span style="font-weight:600">'+uName+'</span>'
         +   '<span style="color:'+barColor+';font-weight:700">'+avg+'%</span></div>'
         + '<div style="height:8px;border-radius:4px;background:rgba(0,0,0,.08);overflow:hidden">'
         +   '<div style="height:100%;width:'+avg+'%;background:'+barColor+';border-radius:4px"></div></div>'
         + '</div>';
    });
    h += '</div></div>';
  }

  // Weakness spotlight
  if(weak.length > 0){
    h += '<div>'
       + '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);color:#37474f;margin-bottom:10px">⚠️ Needs More Practice</div>'
       + '<div style="display:flex;flex-direction:column;gap:6px">';
    weak.forEach(function(e){
      const k = e[0]; const m = e[1];
      const acc = Math.round((m.correct / m.attempts) * 100);
      var qText = qTextMap[k] || '';
      if(!qText){
        // skip entries with no text lookup
        return;
      }
      const shortText = qText.length > 90 ? qText.slice(0,87)+'...' : qText;
      h += '<div style="background:#fff3e0;border-left:3px solid #e65100;border-radius:0 10px 10px 0;padding:8px 10px">'
         + '<div style="font-size:var(--fs-sm);color:#37474f;margin-bottom:3px">'+shortText+'</div>'
         + '<div style="font-size:var(--fs-xs);color:#e65100">'+acc+'% correct · '+m.attempts+' attempts</div>'
         + '</div>';
    });
    h += '</div></div>';
  }

  body.innerHTML = h;
  modal.style.display = 'flex';
  _lockScroll();
  _renderPRFooter();
  history.pushState({mmrModal:'progress-report-modal'}, '');
}

function closeProgressReport(){
  const modal = document.getElementById('progress-report-modal');
  if(modal) modal.style.display = 'none';
  _unlockScroll();
}

// ═══════════════════════════════════════════════════════════════════
//  AI PARENT REPORT
//  Builds a structured payload from localStorage data, sends to
//  the gemini-report Netlify function, and renders a formatted
//  narrative report inside the progress report modal.
// ═══════════════════════════════════════════════════════════════════

var _prStatsHtml   = '';   // cached stats view HTML
var _prReportText  = '';   // cached AI report text
var _prStudentName = '';   // student name for PDF filename

// ── Footer renderer ─────────────────────────────────────────────
function _renderPRFooter(){
  var el = document.getElementById('progress-report-footer');
  if(!el) return;
  el.innerHTML =
    '<div style="text-align:center">'
    + '<button class="ai-report-gen-btn" data-action="generateAIReport">📋 Generate Report</button>'
    + '<div style="font-size:var(--fs-xs);color:var(--txt2);margin-top:6px">Powered by Gemini</div>'
    + '</div>';
}

// ── Build compact payload from SCORES / APP_TIME ─────────────────
function _buildReportPayload(days){
  var scores   = (typeof SCORES   !== 'undefined') ? SCORES   : [];
  var appTime  = (typeof APP_TIME !== 'undefined') ? APP_TIME : { totalSecs:0, sessions:0, dailySecs:{} };
  var streak   = (typeof STREAK   !== 'undefined') ? STREAK   : { current:0 };
  var unitNames = (typeof UNITS_DATA !== 'undefined')
    ? UNITS_DATA.map(function(u){ return u.name; })
    : Array.from({length:10}, function(_,i){ return 'Unit '+(i+1); });

  var cutoff   = Date.now() - days * 86400000;
  var startStr = new Date(cutoff).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  var endStr   = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

  var period = scores.filter(function(s){
    return s.pct != null && s.total > 0 && s.id && s.id > cutoff;
  });

  var totalAttempts = period.length;
  var overallAvg = totalAttempts > 0
    ? Math.round(period.reduce(function(acc,s){ return acc+s.pct; },0) / totalAttempts)
    : 0;

  // This week's app time
  var weekSecs = 0;
  for(var i=0; i<7; i++){
    var d = new Date(Date.now() - i*86400000).toISOString().slice(0,10);
    weekSecs += ((appTime.dailySecs||{})[d]||0);
  }
  var weekMins = Math.round(weekSecs / 60);

  // Avg secs per question (from answer records in period)
  var qSum = 0, qCount = 0;
  period.forEach(function(s){
    if(s.answers) s.answers.forEach(function(a){
      if(a.timeSecs != null && a.timeSecs < 300){ qSum += a.timeSecs; qCount++; }
    });
  });
  var avgSecsPerQ = qCount > 0 ? Math.round(qSum / qCount) : 0;

  // Per-unit stats
  var unitMap = {};
  period.forEach(function(s){
    if(s.unitIdx == null) return;
    var k = s.unitIdx;
    if(!unitMap[k]) unitMap[k] = { name: unitNames[k] || ('Unit '+(k+1)), rows:[] };
    unitMap[k].rows.push({ pct: s.pct, id: s.id, type: s.type });
  });

  var units = Object.values(unitMap).map(function(u){
    var rows = u.rows.slice().sort(function(a,b){ return a.id - b.id; });
    var avg  = Math.round(rows.reduce(function(s,r){ return s+r.pct; },0) / rows.length);
    var best = Math.max.apply(null, rows.map(function(r){ return r.pct; }));
    var trend = null;
    if(rows.length >= 3){
      var diff = rows[rows.length-1].pct - rows[0].pct;
      trend = diff > 8 ? 'improving (+'+diff+'%)' : diff < -8 ? 'declining ('+diff+'%)' : 'stable';
    }
    return { name: u.name, attempts: rows.length, avgPct: avg, bestPct: best, trend: trend };
  }).sort(function(a,b){ return b.attempts - a.attempts; });

  var strengths  = units.filter(function(u){ return u.avgPct >= 80; }).map(function(u){ return u.name+' (avg '+u.avgPct+'%)'; });
  var weaknesses = units.filter(function(u){ return u.avgPct < 70 && u.attempts >= 2; }).map(function(u){ return u.name+' (avg '+u.avgPct+'%'+( u.trend ? ', '+u.trend : '')+')'; });

  var recent = period.slice(0,5).map(function(s){
    return { quiz: s.label || s.qid, date: s.date || '', pct: s.pct, time: s.timeTaken || '' };
  });

  return {
    period: 'Last '+days+' days ('+startStr+' – '+endStr+')',
    totalAttempts: totalAttempts,
    overallAvg: overallAvg,
    streak: streak.current || 0,
    timeThisWeek: weekMins > 0 ? weekMins+' min' : 'not tracked',
    avgSecsPerQuestion: avgSecsPerQ > 0 ? avgSecsPerQ+'s' : 'not tracked',
    units: units,
    strengths:  strengths.length  ? strengths  : ['No units at 80%+ average yet'],
    weaknesses: weaknesses.length ? weaknesses : ['No major weaknesses identified'],
    recentActivity: recent
  };
}

// ── Loading / error states ───────────────────────────────────────
function _showPRLoading(){
  var bodyEl   = document.getElementById('progress-report-body');
  var titleEl  = document.getElementById('pr-modal-title');
  var footerEl = document.getElementById('progress-report-footer');
  if(bodyEl) bodyEl.innerHTML =
    '<div style="text-align:center;padding:52px 20px">'
    + '<div class="ai-report-spinner"></div>'
    + '<div style="font-size:var(--fs-base);color:var(--txt2);margin-top:20px">Analysing '+_prStudentName+'\'s progress…</div>'
    + '<div style="font-size:var(--fs-xs);color:var(--txt2);margin-top:6px;opacity:.7">This takes about 5 seconds</div>'
    + '</div>';
  if(titleEl)  titleEl.textContent = '📋 Generating Report…';
  if(footerEl) footerEl.innerHTML  = '';
}

function _showPRError(msg){
  var bodyEl   = document.getElementById('progress-report-body');
  var titleEl  = document.getElementById('pr-modal-title');
  var footerEl = document.getElementById('progress-report-footer');
  if(bodyEl) bodyEl.innerHTML =
    '<div style="text-align:center;padding:44px 20px">'
    + '<div style="font-size:var(--fs-3xl);margin-bottom:14px">⚠️</div>'
    + '<div style="font-size:var(--fs-base);color:var(--txt2)">Couldn\'t generate the report.</div>'
    + '<div style="font-size:var(--fs-xs);color:var(--txt2);margin-top:6px;opacity:.7">'+(msg||'Check your connection and try again.')+'</div>'
    + '</div>';
  if(titleEl) titleEl.textContent = '📊 Progress Report';
  if(footerEl) footerEl.innerHTML =
    '<div style="display:flex;gap:10px">'
    + '<button class="ai-report-back-btn" data-action="_backToProgressStats">← Back to Stats</button>'
    + '<button class="ai-report-pdf-btn"  data-action="generateAIReport">↺ Try Again</button>'
    + '</div>';
}

// ── Render the AI report inside the modal ───────────────────────
function _renderAIReportView(text){
  // Section colours (one per section, cycling)
  var colours = ['#1565C0','#2e7d32','#e65100','#673ab7','#00838f','#b71c1c'];
  var parts = text.split(/^## /m).filter(Boolean);

  var html = '<div class="ai-report-sections">';
  parts.forEach(function(part, idx){
    var nl     = part.indexOf('\n');
    var header = nl > -1 ? part.slice(0, nl).trim() : part.trim();
    var body   = nl > -1 ? part.slice(nl+1).trim()  : '';
    var col    = colours[idx % colours.length];
    html +=
      '<div class="ai-report-section" style="border-left:3px solid '+col+'">'
      + '<div class="ai-report-section-title" style="color:'+col+'">'+header+'</div>'
      + '<div class="ai-report-section-body">'+body.replace(/\n/g,'<br>')+'</div>'
      + '</div>';
  });
  html += '</div>';

  var bodyEl   = document.getElementById('progress-report-body');
  var titleEl  = document.getElementById('pr-modal-title');
  var footerEl = document.getElementById('progress-report-footer');

  if(bodyEl)  { bodyEl.innerHTML = html; bodyEl.scrollTop = 0; }
  if(titleEl) titleEl.textContent = '📋 Progress Report';
  if(footerEl) footerEl.innerHTML =
    '<div style="display:flex;gap:10px">'
    + '<button class="ai-report-back-btn" data-action="_backToProgressStats">← Back to Stats</button>'
    + '<button class="ai-report-pdf-btn"  data-action="downloadReportPDF">💾 Download PDF</button>'
    + '</div>';
}

// ── Back button ──────────────────────────────────────────────────
function _backToProgressStats(){
  var bodyEl   = document.getElementById('progress-report-body');
  var titleEl  = document.getElementById('pr-modal-title');
  if(bodyEl && _prStatsHtml){ bodyEl.innerHTML = _prStatsHtml; bodyEl.scrollTop = 0; }
  if(titleEl) titleEl.textContent = '📊 Progress Report';
  _renderPRFooter();
}

// ── Main entry point ─────────────────────────────────────────────
async function generateAIReport(){
  var bodyEl = document.getElementById('progress-report-body');
  if(!bodyEl) return;

  var cfg = (typeof loadSettings === 'function') ? loadSettings() : {};
  _prStudentName = cfg.studentName || 'Student';

  // Cache stats HTML so we can go back
  _prStatsHtml = bodyEl.innerHTML;

  _showPRLoading();

  var payload = _buildReportPayload(30);

  try{
    var resp = await fetch('/.netlify/functions/gemini-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: _prStudentName, reportData: payload })
    });
    if(!resp.ok) throw new Error('Server error '+resp.status);
    var data = await resp.json();
    if(data.error) throw new Error(data.error);
    _prReportText = data.report;
    _renderAIReportView(data.report);
  } catch(e){
    _showPRError(e.message);
  }
}

// ── PDF download ─────────────────────────────────────────────────
function downloadReportPDF(){
  if(!_prReportText) return;

  var colours = ['#1565C0','#2e7d32','#e65100','#673ab7','#00838f','#b71c1c'];
  var date    = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  var parts   = _prReportText.split(/^## /m).filter(Boolean);

  var sectionsHtml = '';
  parts.forEach(function(part, idx){
    var nl     = part.indexOf('\n');
    var header = nl > -1 ? part.slice(0,nl).trim()  : part.trim();
    var body   = nl > -1 ? part.slice(nl+1).trim()  : '';
    var col    = colours[idx % colours.length];
    sectionsHtml +=
      '<div style="margin-bottom:22px;page-break-inside:avoid;padding-left:14px;border-left:4px solid '+col+'">'
      + '<div style="font-size:var(--fs-base);font-weight:700;color:'+col+';margin-bottom:8px;font-family:Georgia,serif">'+header+'</div>'
      + '<div style="font-size:var(--fs-sm);line-height:1.9;color:#333">'+body.replace(/\n/g,'<br>')+'</div>'
      + '</div>';
  });

  var payload = _buildReportPayload(30);
  var name    = _prStudentName || 'Student';

  var doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
    + '<meta charset="utf-8">\n'
    + '<title>My Math Roots \u2014 Progress Report: '+name+'</title>\n'
    + '<style>\n'
    + '*{box-sizing:border-box;margin:0;padding:0}\n'
    + 'body{font-family:Georgia,serif;max-width:780px;margin:0 auto;padding:40px 32px;color:#222}\n'
    + '.no-print{text-align:center;margin-bottom:30px;padding:16px;background:#f5f8ff;border-radius:10px;border:1px solid #dce8ff}\n'
    + '.no-print button{background:#1565C0;color:#fff;border:none;padding:11px 30px;border-radius:8px;font-size:var(--fs-sm);cursor:pointer;font-family:inherit}\n'
    + '.no-print p{font-size:var(--fs-xs);color:#888;margin-top:8px}\n'
    + '.rpt-header{text-align:center;padding-bottom:22px;margin-bottom:30px;border-bottom:2px solid #1565C0}\n'
    + '.rpt-app{font-size:var(--fs-lg);font-weight:700;color:#1565C0;letter-spacing:.3px}\n'
    + '.rpt-sub{font-size:var(--fs-base);color:#444;margin-top:6px}\n'
    + '.rpt-date{font-size:var(--fs-xs);color:#999;margin-top:4px}\n'
    + '.rpt-stats{display:flex;gap:20px;justify-content:center;margin-bottom:28px;flex-wrap:wrap}\n'
    + '.rpt-stat{text-align:center;padding:12px 20px;background:#f5f8ff;border-radius:10px;min-width:100px}\n'
    + '.rpt-stat-val{font-size:var(--fs-md);font-weight:700;color:#1565C0}\n'
    + '.rpt-stat-lbl{font-size:var(--fs-xs);color:#888;margin-top:3px}\n'
    + '.rpt-footer{text-align:center;font-size:var(--fs-xs);color:#bbb;margin-top:40px;padding-top:16px;border-top:1px solid #eee}\n'
    + '@media print{.no-print{display:none}body{padding:20px}}\n'
    + '</style>\n</head>\n<body>\n'
    + '<div class="no-print">\n'
    + '  <button data-action="windowPrint">💾 Save as PDF</button>\n'
    + '  <p>In the print dialog, choose <strong>Save as PDF</strong> as the destination</p>\n'
    + '</div>\n'
    + '<div class="rpt-header">\n'
    + '  <div class="rpt-app">\uD83C\uDF31 My Math Roots</div>\n'
    + '  <div class="rpt-sub">Progress Report &mdash; '+name+'</div>\n'
    + '  <div class="rpt-date">Generated '+date+' &nbsp;&middot;&nbsp; '+payload.period+'</div>\n'
    + '</div>\n'
    + '<div class="rpt-stats">\n'
    + '  <div class="rpt-stat"><div class="rpt-stat-val">'+payload.totalAttempts+'</div><div class="rpt-stat-lbl">Quizzes taken</div></div>\n'
    + '  <div class="rpt-stat"><div class="rpt-stat-val">'+payload.overallAvg+'%</div><div class="rpt-stat-lbl">Overall accuracy</div></div>\n'
    + '  <div class="rpt-stat"><div class="rpt-stat-val">'+payload.streak+'\uD83D\uDD25</div><div class="rpt-stat-lbl">Day streak</div></div>\n'
    + '  <div class="rpt-stat"><div class="rpt-stat-val">'+payload.timeThisWeek+'</div><div class="rpt-stat-lbl">This week</div></div>\n'
    + '</div>\n'
    + sectionsHtml
    + '<div class="rpt-footer">Generated by My Math Roots &nbsp;&middot;&nbsp; Your child\'s Grade 2 math companion</div>\n'
    + '</body>\n</html>';

  var blob = new Blob([doc], { type: 'text/html' });
  var url  = URL.createObjectURL(blob);
  var win  = window.open(url, '_blank');
  if(!win){
    // Popup blocked — download as HTML file instead
    var a = document.createElement('a');
    a.href = url;
    a.download = name.replace(/\s+/g,'-').toLowerCase()+'-progress-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  setTimeout(function(){ URL.revokeObjectURL(url); }, 30000);
}

var _accessConfirmType = '';
function _showAccessConfirm(type){
  if(type !== 'relock' && !isParentUnlocked()){ showLockToast(_ICO.lock + ' Parent PIN required.'); return; }
  _accessConfirmType = type;
  var opts=document.getElementById('access-options'), conf=document.getElementById('access-confirm');
  var title=document.getElementById('ac-title'), msg=document.getElementById('ac-msg'), btn=document.getElementById('ac-confirm-btn');
  if(type==='unlock'){
    title.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.93-1"/></svg> Unlock Everything?';
    msg.innerHTML='This will unlock <strong>all lessons and units</strong> so the student can access any content right away.<br><br>Progress and scores already earned will not be affected.';
    btn.textContent='Unlock All';
    btn.style.background='linear-gradient(135deg,#27ae60,#1abc9c)';
    btn.style.boxShadow='0 4px 0 #1a7a45';
  } else if(type==='relock'){
    title.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg> Re-Lock All?';
    msg.innerHTML='This will reset <strong>all progress, scores, and lesson unlocks</strong>. Students will start from the beginning.<br><br>This cannot be undone.';
    btn.textContent='Re-Lock All';
    btn.style.background='linear-gradient(135deg,#e74c3c,#c0392b)';
    btn.style.boxShadow='0 4px 0 #922b21';
  } else {
    title.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Clear Score History?';
    msg.innerHTML='This will permanently delete <strong>all saved quiz scores</strong>. This cannot be undone.';
    btn.textContent='Clear History';
    btn.style.background='linear-gradient(135deg,#636e72,#2d3436)';
    btn.style.boxShadow='0 4px 0 #1a1a1a';
  }
  btn.style.color='#fff';
  opts.style.display='none';
  conf.style.display='block';
}
function _cancelAccessConfirm(){
  var opts=document.getElementById('access-options'), conf=document.getElementById('access-confirm');
  if(conf) conf.style.display='none';
  if(opts) opts.style.display='flex';
}
function _executeAccessConfirm(){
  var type = _accessConfirmType;
  if(type==='unlock'){
    // Write a signed token so the unlock can't be forged by typing 'all' in DevTools
    const _ulToken = crypto.randomUUID();
    localStorage.setItem(PARENT_UNLOCK_KEY, JSON.stringify({ v: _ulToken, s: _signUnlockToken(_ulToken) }));
    _parentSessionTs = Date.now(); // keep in-memory session active too
    updateParentStatus();
    showLockToast('All units, lessons & Final Test unlocked!');
    buildHome();
  } else if(type==='relock'){
    _clearParentSession();
    localStorage.removeItem(UNIT_UNLOCK_KEY);
    localStorage.removeItem(LESSON_UNLOCK_KEY);
    localStorage.removeItem(QUIZ_PAUSE_KEY);
    Object.keys(DONE).forEach(function(k){ delete DONE[k]; });
    saveDone();
    SCORES.length = 0;
    saveSc();
    _cloudDeleteAllScores();
    updateParentStatus();
    buildHome();
    showLockToast('Progress reset. All lessons re-locked.');
  } else if(type==='clear'){
    SCORES.length = 0;
    saveSc();
    Object.keys(DONE).forEach(function(k){ delete DONE[k]; });
    saveDone();
    _cloudDeleteAllScores();
    updateParentStatus();
    showLockToast('All scores cleared.');
    buildHome();
  }
  closeAccessModal();
}
function openPinModal(){
  var m = document.getElementById('pin-modal');
  if(!m) return;
  // Show default PIN warning if applicable
  var notice = document.getElementById('default-pin-notice-modal');
  if(notice) notice.style.display = localStorage.getItem(PIN_CHANGED_KEY) ? 'none' : 'block';
  document.getElementById('new-pin-inp').value = '';
  document.getElementById('pin-change-msg').textContent = '';
  m.style.display = 'flex';
  _animateModalOpen('pin-modal');
  _lockScroll();
  history.pushState({mmrModal:'pin-modal'}, '');
  setTimeout(function(){ document.getElementById('new-pin-inp').focus(); }, 350);
}
function closePinModal(){
  // Reset setup-mode state in case the user cancelled first-time setup
  _pinModalMode = 'change';
  _pinModalCallback = null;
  // Restore title if it was changed by _openFirstTimePinSetup
  const _pmTitle = document.querySelector('#pin-modal .modal-title');
  if(_pmTitle && _pmTitle.dataset.origHtml){ _pmTitle.innerHTML = _pmTitle.dataset.origHtml; delete _pmTitle.dataset.origHtml; }
  _animateModalClose('pin-modal', function(){ var m=document.getElementById('pin-modal'); if(m) m.style.display='none'; _unlockScroll(); });
}
function openTimerModal(){
  const m = document.getElementById('timer-modal');
  if(!m) return;
  m.style.display = 'flex';
  _animateModalOpen('timer-modal');
  _lockScroll();
  history.pushState({mmrModal:'timer-modal'}, '');
}
function closeTimerModal(){
  _animateModalClose('timer-modal', ()=>{ const m=document.getElementById('timer-modal'); if(m) m.style.display='none'; _unlockScroll(); });
}
function openA11yModal(){
  const m = document.getElementById('a11y-modal');
  if(!m) return;
  _syncA11yUI();
  m.style.display = 'flex';
  _animateModalOpen('a11y-modal');
  _lockScroll();
  history.pushState({mmrModal:'a11y-modal'}, '');
}
function closeA11yModal(){
  _animateModalClose('a11y-modal', ()=>{ const m=document.getElementById('a11y-modal'); if(m) m.style.display='none'; _unlockScroll(); });
}
function _syncA11yUI(){
  const cfg = getA11y();
  ['colorblind','haptic','reduceMotion','textSelect','focus','screenreader'].forEach(k=>{
    const el = document.getElementById('a11y-'+k);
    if(el){ el.classList.toggle('active', !!cfg[k]); el.setAttribute('aria-pressed', !!cfg[k]); }
  });
}

// ════════════════════════════════════════
//  THEME (LIGHT / DARK)
// ════════════════════════════════════════
function setSound(mode){
  localStorage.setItem(SOUND_KEY, mode);
  document.getElementById('sound-on').classList.toggle('active', mode==='on');
  document.getElementById('sound-off').classList.toggle('active', mode==='off');
}

function setTheme(mode){
  const effectiveDark = mode==='dark' || (mode==='auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark', effectiveDark);
  // Update active button state if settings screen is open
  const lb = document.getElementById('theme-light');
  const db = document.getElementById('theme-dark');
  const ab = document.getElementById('theme-auto');
  if(lb && db && ab){
    lb.classList.toggle('active', mode==='light');
    db.classList.toggle('active', mode==='dark');
    ab.classList.toggle('active', mode==='auto');
  }
  if(mode==='auto'){ localStorage.removeItem('wb_theme'); }
  else { localStorage.setItem('wb_theme', mode); }
}

function applyStoredTheme(){
  const mode = localStorage.getItem('wb_theme') || 'auto';
  setTheme(mode);
}

// Follow system theme changes in real-time when set to Auto
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{
  if(!localStorage.getItem('wb_theme')) setTheme('auto');
});

// ════════════════════════════════════════
//  PARENT CONTROLS
// ════════════════════════════════════════
const APP_VERSION = 'v5.32';
const TIMER_KEY = 'wb_quiz_timer';
const QUIZ_PAUSE_KEY = 'wb_paused_quiz';
const SOUND_KEY = 'wb_sound';
function isSoundEnabled(){ return localStorage.getItem(SOUND_KEY) !== 'off'; }
const LESSON_TIMER_KEY = 'wb_lesson_timer_secs';
const UNIT_TIMER_KEY   = 'wb_unit_timer_secs';
const FINAL_TIMER_KEY  = 'wb_final_timer_secs';
const PIN_CHANGED_KEY  = 'wb_pin_changed';

function getLessonTimerSecs(){
  const v = localStorage.getItem(LESSON_TIMER_KEY);
  if(v) return parseInt(v);
  const old = localStorage.getItem('wb_lesson_timer_mins');
  return old ? parseInt(old)*60 : 480;
}
function getUnitTimerSecs(){
  const v = localStorage.getItem(UNIT_TIMER_KEY);
  if(v) return parseInt(v);
  const old = localStorage.getItem('wb_unit_timer_mins');
  return old ? parseInt(old)*60 : 1800;
}
function getFinalTimerSecs(){ return parseInt(localStorage.getItem(FINAL_TIMER_KEY)||'3600'); }
// Legacy minute getters (used by display/toast)
function getLessonTimerMins(){ return Math.round(getLessonTimerSecs()/60); }
function getUnitTimerMins(){   return Math.round(getUnitTimerSecs()/60); }
function _timerSecsLbl(s){ if(s<60) return s+' sec'; const m=Math.floor(s/60),r=s%60; return r?m+'m '+r+'s':m+(m===1?' minute':' min'); }
function isTimerEnabled(){ return localStorage.getItem(TIMER_KEY) !== 'off'; }
const PARENT_PIN_KEY = 'wb_parent_pin';
const PARENT_UNLOCK_KEY = 'wb_parent_unlock';
const UNIT_UNLOCK_KEY    = 'wb_unit_unlocks';    // JSON array of individually unlocked unit indices
const LESSON_UNLOCK_KEY = 'wb_lesson_unlocks'; // JSON object {unitIdx_lessonIdx: true}

function getUnitUnlocks(){ return safeLoadSigned(UNIT_UNLOCK_KEY, []); }
function saveUnitUnlocks(arr){ saveSigned(UNIT_UNLOCK_KEY, arr); }
function isUnitIndividuallyUnlocked(idx){ return getUnitUnlocks().includes(idx); }

function getLessonUnlocks(){ return safeLoadSigned(LESSON_UNLOCK_KEY, {}); }
function saveLessonUnlocks(obj){ saveSigned(LESSON_UNLOCK_KEY, obj); }
function isLessonIndividuallyUnlocked(unitIdx, lessonIdx){ return !!getLessonUnlocks()[unitIdx+'_'+lessonIdx]; }

function isParentUnlocked(){
  const limit = PARENT_SESSION_MINS * 60 * 1000;
  // Check in-memory first — immune to localStorage async issues
  if(_parentSessionTs > 0 && (Date.now() - _parentSessionTs) < limit) return true;
  const stored = localStorage.getItem(PARENT_UNLOCK_KEY);
  if(!stored) return false;
  // Check for signed "Unlock All" token
  try{
    const obj = JSON.parse(stored);
    if(obj && typeof obj.v === 'string' && _signUnlockToken(obj.v) === obj.s) return true;
  } catch(e){ /* not a signed token — fall through to timestamp check */ }
  const ts = parseInt(stored);
  return !isNaN(ts) && (Date.now() - ts) < limit;
}
function _setParentSession(){
  _parentSessionTs = Date.now();
  localStorage.setItem(PARENT_UNLOCK_KEY, String(_parentSessionTs));
}
function _clearParentSession(){
  _parentSessionTs = 0;
  localStorage.removeItem(PARENT_UNLOCK_KEY);
}

const _PIN_FAIL_KEY = 'pin_fail_ts';
const _PIN_FAIL_COUNT_KEY = 'pin_fail_count';
const _PIN_LOCKOUT_SIG_KEY = 'pin_lockout_sig';
const _PIN_MAX_ATTEMPTS = 5;
const _PIN_LOCKOUT_MS = 30000; // 30 seconds

// Tamper-resistant lockout: sign count+ts so clearing localStorage doesn't bypass
function _lockoutSig(count, ts){
  const secret = localStorage.getItem('wb_app_secret') || 'fallback';
  const str = count + ':' + ts + ':mymathroots_lockout_v2:' + secret;
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}
// Sign the "Unlock All" token so it can't be forged by writing 'all' to localStorage
function _signUnlockToken(token){
  const str = token + ':mymathroots_unlock_v1';
  let h = 0;
  for(let i = 0; i < str.length; i++) h = ((h<<5)-h+str.charCodeAt(i))|0;
  return String(h >>> 0);
}
function _verifyLockout(){
  const count = parseInt(localStorage.getItem(_PIN_FAIL_COUNT_KEY) || '0');
  const ts = parseInt(localStorage.getItem(_PIN_FAIL_KEY) || '0');
  const sig = localStorage.getItem(_PIN_LOCKOUT_SIG_KEY);
  if(count >= _PIN_MAX_ATTEMPTS && sig === _lockoutSig(count, ts)) return { count, ts, valid: true };
  if(count >= _PIN_MAX_ATTEMPTS && sig !== _lockoutSig(count, ts)){
    // Tampered — re-lock with fresh timestamp
    const now = Date.now();
    localStorage.setItem(_PIN_FAIL_KEY, String(now));
    localStorage.setItem(_PIN_LOCKOUT_SIG_KEY, _lockoutSig(count, now));
    return { count, ts: now, valid: true };
  }
  return { count, ts, valid: false };
}

async function checkParentPin(){
  const msg = document.getElementById('pin-msg');

  // ── Brute-force lockout check ──
  const lockout = _verifyLockout();
  const failCount = lockout.count;
  if(lockout.valid){
    const elapsed = Date.now() - lockout.ts;
    if(elapsed < _PIN_LOCKOUT_MS){
      const secs = Math.ceil((_PIN_LOCKOUT_MS - elapsed) / 1000);
      msg.textContent = 'Too many wrong attempts. Try again in ' + secs + 's.';
      msg.style.color = '#e74c3c';
      return;
    } else {
      // Lockout expired — reset counter
      localStorage.removeItem(_PIN_FAIL_COUNT_KEY);
      localStorage.removeItem(_PIN_FAIL_KEY);
      localStorage.removeItem(_PIN_LOCKOUT_SIG_KEY);
    }
  }

  const entered = document.getElementById('parent-pin-inp').value;
  if(await _verifyPin(entered)){
    // Success — clear fail counter
    localStorage.removeItem(_PIN_FAIL_COUNT_KEY);
    localStorage.removeItem(_PIN_FAIL_KEY);
    localStorage.removeItem(_PIN_LOCKOUT_SIG_KEY);
    // Remove blur listener immediately so it doesn't race with the success animation
    document.getElementById('parent-pin-inp').removeEventListener('blur', _authPinBlurHandler);
    _animateModalClose('parent-auth-modal', ()=>{
      _closeParentAuth();
      playSwooshForward();
      // Save settings scroll position so we can restore it on back navigation
      const _settingsEl = document.getElementById('settings-screen');
      if(_settingsEl) _settingsEl._savedScrollTop = _settingsEl.scrollTop;
      // Stamp session start time
      _setParentSession();
      show('parent-screen');
      document.getElementById('parent-panel').style.display = 'block';
      updateAccountUI();
      _startParentSession();
      // Show first-time PIN change prompt if still using default
      const isDefault = !localStorage.getItem(PIN_CHANGED_KEY);
      if(isDefault){
        msg.textContent = '⚠️ You are using the default PIN. Please set a custom PIN below for security!';
        msg.style.color = '#e67e22';
        setTimeout(()=>{
          document.getElementById('pin-change-area').style.display='block';
          document.getElementById('new-pin-inp').focus();
        }, 400);
      } else {
        msg.textContent = '✅ Parent controls unlocked!';
        msg.style.color = '#27ae60';
      }
      updateParentStatus();
    });
  } else {
    // Failed — increment counter and record timestamp
    const newCount = failCount + 1;
    const nowTs = Date.now();
    localStorage.setItem(_PIN_FAIL_COUNT_KEY, String(newCount));
    localStorage.setItem(_PIN_FAIL_KEY, String(nowTs));
    if(newCount >= _PIN_MAX_ATTEMPTS) localStorage.setItem(_PIN_LOCKOUT_SIG_KEY, _lockoutSig(newCount, nowTs));
    const remaining = _PIN_MAX_ATTEMPTS - newCount;
    if(remaining > 0){
      msg.textContent = `❌ Wrong PIN. ${remaining} attempt${remaining===1?'':'s'} left before lockout.`;
    } else {
      msg.textContent = 'Too many wrong attempts. Locked for 30 seconds.';
    }
    msg.style.color = '#e74c3c';
    // Clear the field and restart the poll so the next attempt is detected
    const _pinInp = document.getElementById('parent-pin-inp');
    if(_pinInp){ _pinInp.value = ''; _pinInp.focus(); }
    _startPinPoll();
  }
}

function updateParentStatus(){
  updateTimerToggleBtn();
  // Sync push notification toggle + hide on unsupported browsers
  _updatePushToggleUI();
  const pushSec = document.getElementById('push-notif-section');
  if(pushSec) pushSec.style.display = ('PushManager' in window) ? '' : 'none';
  // Show default PIN warning notice if PIN hasn't been changed
  const notice = document.getElementById('default-pin-notice');
  if(notice) notice.style.display = localStorage.getItem(PIN_CHANGED_KEY) ? 'none' : 'block';
  const lbl = document.getElementById('parent-status-lbl');
  if(!lbl) return;
  if(isParentUnlocked()){
    lbl.innerHTML = _ICO.unlock + ' <strong>Override Active</strong> — all lessons and units are unlocked';
    lbl.style.color = '#27ae60';
  } else {
    lbl.innerHTML = _ICO.lock + ' <strong>Normal Mode</strong> — students must earn each unlock';
    lbl.style.color = 'var(--txt2)';
  }
}


function updateTimerToggleBtn(){
  const btn = document.getElementById('timer-toggle-btn');
  if(!btn) return;
  const on = isTimerEnabled();
  btn.textContent = on ? '✅ On' : '❌ Off';
  btn.style.background = on ? '#27ae60' : '#e74c3c';
  btn.style.color = '#fff';
  // Show/hide controls based on timer on/off
  const ctrl = document.getElementById('timer-duration-controls');
  if(ctrl) ctrl.style.display = on ? 'flex' : 'none';
  // Build / refresh drum-roll pickers
  if(on) _initTimerPickers();
}

function toggleQuizTimer(){
  const on = isTimerEnabled();
  localStorage.setItem(TIMER_KEY, on ? 'off' : 'on');
  updateTimerToggleBtn();
  showLockToast(on ? 'Timer disabled — no time limit.' : 'Timer enabled.');
}

function adjustTimer(type, delta){
  const key = type==='final' ? FINAL_TIMER_KEY : type==='unit' ? UNIT_TIMER_KEY : LESSON_TIMER_KEY;
  const current = type==='final' ? getFinalTimerSecs() : type==='unit' ? getUnitTimerSecs() : getLessonTimerSecs();
  const maxSecs = type==='final' ? 7200 : type==='unit' ? 7200 : 3600;
  // Smart step: 1s below 1 min, 60s at 1 min+
  let newVal;
  if(delta > 0){
    newVal = current < 60 ? Math.min(60, current + 1) : current + 60;
  } else {
    newVal = current <= 60 ? Math.max(1, current - 1) : current - 60;
  }
  newVal = Math.min(maxSecs, Math.max(1, newVal));
  localStorage.setItem(key, String(newVal));
  updateTimerToggleBtn();
  const name = type==='final'?'Final test':type==='unit'?'Unit':'Lesson';
  showLockToast(name+' timer set to '+_timerSecsLbl(newVal)+'.');
}

function _setTimerDirect(type, rawVal){
  const key = type==='final' ? FINAL_TIMER_KEY : type==='unit' ? UNIT_TIMER_KEY : LESSON_TIMER_KEY;
  const maxSecs = type==='final' ? 7200 : type==='unit' ? 7200 : 3600;
  const secs = Math.min(maxSecs, Math.max(1, parseInt(rawVal)||1));
  localStorage.setItem(key, String(secs));
  updateTimerToggleBtn();
  const name = type==='final'?'Final test':type==='unit'?'Unit':'Lesson';
  showLockToast(name+' timer set to '+_timerSecsLbl(secs)+'.');
}

// ── Drum-roll time picker ──────────────────────────────────────────
const _TP_SEC_STEPS = Array.from({length:60},(_,i)=>i);
const _TP_ITEM_H = 36;

function _buildTimePicker(containerId, type, maxMins){
  const wrap = document.getElementById(containerId);
  if(!wrap) return;

  const getSecs = type==='final' ? getFinalTimerSecs : type==='unit' ? getUnitTimerSecs : getLessonTimerSecs;
  const key = type==='final' ? FINAL_TIMER_KEY : type==='unit' ? UNIT_TIMER_KEY : LESSON_TIMER_KEY;
  const maxSecs = maxMins * 60;

  const totalSecs = getSecs();
  const initMins = Math.floor(totalSecs / 60);
  const initSecIdx = Math.min(59, totalSecs % 60);

  // Build minute items 0..maxMins
  let minItems = '';
  for(let i=0;i<=maxMins;i++) minItems += `<div class="tp-item">${i}</div>`;
  // Build second items (00, 05 … 55)
  let secItems = _TP_SEC_STEPS.map(s=>`<div class="tp-item">${String(s).padStart(2,'0')}</div>`).join('');

  wrap.innerHTML =
    `<div class="tp-col-wrap">` +
      `<div class="tp-drum">` +
        `<div class="tp-sel"></div>` +
        `<div class="tp-fade-t"></div>` +
        `<div class="tp-fade-b"></div>` +
        `<div class="tp-scroll" id="${containerId}-ms">` +
          `<div class="tp-pad"></div>${minItems}<div class="tp-pad"></div>` +
        `</div>` +
      `</div>` +
      `<div class="tp-col-lbl">min</div>` +
    `</div>` +
    `<div class="tp-colon">:</div>` +
    `<div class="tp-col-wrap">` +
      `<div class="tp-drum">` +
        `<div class="tp-sel"></div>` +
        `<div class="tp-fade-t"></div>` +
        `<div class="tp-fade-b"></div>` +
        `<div class="tp-scroll" id="${containerId}-ss">` +
          `<div class="tp-pad"></div>${secItems}<div class="tp-pad"></div>` +
        `</div>` +
      `</div>` +
      `<div class="tp-col-lbl">sec</div>` +
    `</div>`;

  const msEl = document.getElementById(containerId+'-ms');
  const ssEl = document.getElementById(containerId+'-ss');

  // Set initial scroll positions (no animation)
  msEl.scrollTop = initMins * _TP_ITEM_H;
  ssEl.scrollTop = initSecIdx * _TP_ITEM_H;

  // Debounced save
  let _saveTimer;
  function _save(){
    const mins = Math.min(maxMins, Math.max(0, Math.round(msEl.scrollTop / _TP_ITEM_H)));
    const secIdx = Math.min(_TP_SEC_STEPS.length-1, Math.max(0, Math.round(ssEl.scrollTop / _TP_ITEM_H)));
    const secs = _TP_SEC_STEPS[secIdx];
    let total = Math.min(maxSecs, mins*60 + secs);
    if(total < 1) total = 1;
    localStorage.setItem(key, String(total));
    const name = type==='final'?'Final test':type==='unit'?'Unit':'Lesson';
    showLockToast(name+' timer set to '+_timerSecsLbl(total)+'.');
  }

  // Attach listeners after a short delay so the init scrollTop assignment
  // (and any scroll-snap settle) cannot accidentally trigger a save + toast
  function _onScroll(){ clearTimeout(_saveTimer); _saveTimer = setTimeout(_save, 350); }
  setTimeout(()=>{
    msEl.addEventListener('scroll', _onScroll, {passive:true});
    ssEl.addEventListener('scroll', _onScroll, {passive:true});
  }, 600);

  // Store cleanup function for later removal
  if(!window._tpCleanups) window._tpCleanups = [];
  window._tpCleanups.push(()=>{
    msEl.removeEventListener('scroll', _onScroll);
    ssEl.removeEventListener('scroll', _onScroll);
    clearTimeout(_saveTimer);
  });
}

function _initTimerPickers(){
  _buildTimePicker('tp-lesson', 'lesson', 60);
  _buildTimePicker('tp-unit',   'unit',   120);
  _buildTimePicker('tp-final',  'final',  120);
  // Setting scrollTop on child drums can cause Safari to scroll the parent
  // screen into view — re-zero it after paint to counteract
  requestAnimationFrame(()=>{
    const ps = document.getElementById('parent-screen');
    if(ps) ps.scrollTop = 0;
  });
}
// ── end drum-roll picker ───────────────────────────────────────────

async function changePin(){
  var newPin = document.getElementById('new-pin-inp').value.trim();
  var msg = document.getElementById('pin-change-msg');
  if(newPin.length < 4){ msg.textContent='PIN must be at least 4 digits'; msg.style.color='#e74c3c'; return; }
  try{ await _savePin(newPin); } catch(e){ console.warn('_savePin error',e); }
  localStorage.setItem(PIN_CHANGED_KEY, '1');
  // Hide default PIN notices everywhere
  document.querySelectorAll('#pin-default-hint,#default-pin-notice,#default-pin-notice-modal').forEach(function(el){ if(el) el.style.display='none'; });
  document.getElementById('new-pin-inp').value = '';
  const _mode = _pinModalMode;
  closePinModal(); // also resets _pinModalMode to 'change' and clears _pinModalCallback
  if(_mode === 'setup'){
    // First-time setup: open parent controls immediately (callback was cleared by closePinModal)
    _setParentSession();
    show('parent-screen');
    document.getElementById('parent-panel').style.display = 'block';
    updateAccountUI();
    _startParentSession();
    updateParentStatus();
    return;
  }
  showLockToast('PIN saved!');
}

async function _pcChangePassword(){
  const inp = document.getElementById('pc-new-pw');
  const msg = document.getElementById('pc-pw-msg');
  const pw = inp.value;
  if(pw.length < 8){ msg.textContent='⚠️ Password must be at least 8 characters'; msg.style.color='#e74c3c'; return; }
  msg.textContent='Saving…'; msg.style.color='var(--txt2)';
  const { error } = await _supa.auth.updateUser({ password: pw });
  if(error){ msg.textContent='❌ '+error.message; msg.style.color='#e74c3c'; return; }
  inp.value='';
  msg.textContent='✅ Password changed!'; msg.style.color='#27ae60';
  setTimeout(()=>{ msg.textContent=''; document.getElementById('pc-pw-area').style.display='none'; }, 1800);
}

// ════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════
const SETTINGS_KEY = 'wb_settings_v1';

function loadSettings(){
  try{ return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'); } catch{ return {}; }
}
function saveSettings(){
  const cfg = {
    studentName: document.getElementById('set-student').value.trim(),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(cfg));
}

function autoSaveSettings(){
  saveSettings();
}

// ── PUSH NOTIFICATIONS ────────────────────
const VAPID_PUBLIC_KEY = 'BDkU4IqFN7kmL3moX-1KTabm6SEKOUjlJRq94z2PXgAsyfGhltAGB7y2XzLa2x1ZaigD3HQOXH4HLpUmUA9OLJk';
const PUSH_PREF_KEY = 'wb_push_enabled';

function _urlBase64ToUint8Array(b64){
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const raw = atob((b64 + pad).replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function _savePushSubscription(sub){
  if(!_supa) return;
  const payload = {
    endpoint: sub.endpoint,
    p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))).replace(/\+/g,'-').replace(/\//g,'_'),
    auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))).replace(/\+/g,'-').replace(/\//g,'_'),
    user_id: _supaUser ? _supaUser.id : null,
    last_seen: new Date().toISOString()
  };
  await _supa.from('push_subscriptions').upsert(payload, { onConflict: 'endpoint' });
}

async function _deletePushSubscription(endpoint){
  if(!_supa) return;
  await _supa.from('push_subscriptions').delete().eq('endpoint', endpoint);
}

async function enablePushNotifications(){
  try {
    if(!('serviceWorker' in navigator) || !('PushManager' in window)){
      showLockToast('Push notifications not supported on this browser.'); return;
    }
    const permission = await Notification.requestPermission();
    if(permission !== 'granted'){
      localStorage.setItem(PUSH_PREF_KEY, 'denied');
      _updatePushToggleUI();
      showLockToast('Notifications blocked. Enable them in browser settings.'); return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    await _savePushSubscription(sub);
    localStorage.setItem(PUSH_PREF_KEY, 'enabled');
    _updatePushToggleUI();
    showLockToast('✅ Reminders enabled!');
  } catch(err){
    _logError('push_subscribe', err);
    showLockToast('Could not enable notifications.');
  }
}

async function disablePushNotifications(){
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if(sub){
      await _deletePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    localStorage.setItem(PUSH_PREF_KEY, 'disabled');
    _updatePushToggleUI();
    showLockToast('Reminders turned off.');
  } catch(err){
    _logError('push_unsubscribe', err);
  }
}

async function togglePushNotifications(){
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if(sub && localStorage.getItem(PUSH_PREF_KEY) === 'enabled'){
    await disablePushNotifications();
  } else {
    await enablePushNotifications();
  }
}

function _updatePushToggleUI(){
  const btn = document.getElementById('push-toggle-btn');
  const lbl = document.getElementById('push-toggle-lbl');
  if(!btn) return;
  const enabled = localStorage.getItem(PUSH_PREF_KEY) === 'enabled';
  btn.textContent = enabled ? '🔔 On' : '🔕 Off';
  btn.style.background = enabled ? 'linear-gradient(135deg,#27ae60,#2ecc71)' : '';
  if(lbl) lbl.textContent = enabled ? 'Tap to turn off reminders' : 'Tap to get daily reminders';
}

// Auto-prompt after 3rd visit if not yet decided
function _maybePushPrompt(){
  if(!('PushManager' in window)) return;
  if(localStorage.getItem(PUSH_PREF_KEY)) return;
  const visits = parseInt(localStorage.getItem('wb_visit_count') || '0') + 1;
  localStorage.setItem('wb_visit_count', visits);
  if(visits === 3){
    setTimeout(() => {
      if(Notification.permission === 'default'){
        showLockToast('💡 Want daily math reminders? Enable in Settings → Notifications!');
      }
    }, 3000);
  }
}

// ── FEEDBACK ─────────────────────────────
let _fbRating = 0;
let _fbCategory = '';

function _fbSetRating(v){
  // Tapping the already-active star (or star 1 when rating is 1) clears the rating
  if(v === _fbRating) v = 0;
  _fbRating = v;
  document.querySelectorAll('.fb-star').forEach(s => {
    s.textContent = parseInt(s.dataset.v) <= v ? '★' : '☆';
    s.style.color  = parseInt(s.dataset.v) <= v ? '#f1c40f' : '';
  });
}

function _fbSetCat(el, cat){
  if(cat === _fbCategory){ _fbCategory = ''; document.querySelectorAll('.fb-cat-btn').forEach(b => b.classList.remove('active')); return; }
  _fbCategory = cat;
  document.querySelectorAll('.fb-cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

async function _submitFeedback(){
  const msg = document.getElementById('fb-msg');
  if(!_fbRating){ msg.style.color='#e74c3c'; msg.textContent='Please select a star rating.'; return; }
  if(!_fbCategory){ msg.style.color='#e74c3c'; msg.textContent='Please select a category.'; return; }
  // Rate limit — max 3 feedback submissions per minute
  if(!_rateLimit('feedback', 3)){
    msg.style.color='#e74c3c'; msg.textContent='Please wait before submitting again.'; return;
  }
  const comment = _sanitize(document.getElementById('fb-comment').value, 500);
  msg.style.color='var(--txt2)'; msg.textContent='Sending…';

  if(_supa){
    const { error } = await _supa.from('feedback').insert({
      rating: _fbRating,
      category: _fbCategory,
      comment: comment || null,
      app_version: APP_VERSION,
      user_id: _supaUser ? _supaUser.id : null
    });
    if(error){ _logError('feedback', error); msg.style.color='#e74c3c'; msg.textContent='⚠️ ' + _friendlyError(error); return; }
  }

  // Reset form
  _fbRating = 0; _fbCategory = '';
  _fbSetRating(0);
  document.querySelectorAll('.fb-cat-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('fb-comment').value = '';
  msg.style.color='#27ae60'; msg.textContent='✅ Thank you for your feedback!';
  setTimeout(()=>{ msg.textContent=''; }, 4000);
}

// ── PIN modal mode state ──────────────────────────────────────────────────────
// 'change'  = normal Change PIN flow (default)
// 'setup'   = first-time PIN creation; opens parent-screen on success
let _pinModalMode = 'change';
let _pinModalCallback = null;

function goParentControls(){
  playTap();
  if(isParentUnlocked()){
    // Session still active — skip PIN and go straight in
    const _settingsEl = document.getElementById('settings-screen');
    if(_settingsEl) _settingsEl._savedScrollTop = _settingsEl.scrollTop;
    _setParentSession(); // refresh timestamp
    show('parent-screen');
    document.getElementById('parent-panel').style.display = 'block';
    updateAccountUI();
    _startParentSession();
    updateParentStatus();
    return;
  }
  // If no PIN has ever been set, guide the parent through first-time setup
  if(!isPinSetup()){ _openFirstTimePinSetup(); return; }
  _openParentAuth();
}

function _openFirstTimePinSetup(){
  _pinModalMode = 'setup';
  _pinModalCallback = function(){
    _setParentSession();
    show('parent-screen');
    document.getElementById('parent-panel').style.display = 'block';
    updateAccountUI();
    _startParentSession();
    updateParentStatus();
  };
  // Reuse the existing pin-modal — retitle it for first-time setup
  const _pmTitle = document.querySelector('#pin-modal .modal-title');
  if(_pmTitle && !_pmTitle.dataset.origHtml){
    _pmTitle.dataset.origHtml = _pmTitle.innerHTML;
    _pmTitle.innerHTML = '🔑 Create Your Parent PIN';
  }
  document.getElementById('new-pin-inp').value = '';
  document.getElementById('pin-change-msg').textContent = '';
  const m = document.getElementById('pin-modal');
  m.style.display = 'flex';
  _animateModalOpen('pin-modal');
  _lockScroll();
  history.pushState({mmrModal:'pin-modal'}, '');
  setTimeout(()=>document.getElementById('new-pin-inp').focus(), 200);
}

let _pinPoll = null;
function _startPinPoll(){
  if(_pinPoll) clearInterval(_pinPoll);
  _pinPoll = setInterval(()=>{
    const inp = document.getElementById('parent-pin-inp');
    if(!inp) return;
    const v = inp.value.replace(/[^0-9]/g,'').slice(0,4);
    if(v !== inp.value) inp.value = v;
    if(v.length === 4){ clearInterval(_pinPoll); _pinPoll = null; checkParentPin(); }
  }, 50);
}
function _stopPinPoll(){ if(_pinPoll){ clearInterval(_pinPoll); _pinPoll = null; } }

// ── Scroll lock + visual-viewport centering ───────────────────────────────
// Uses both position:fixed (CSS) and a touchmove trap (JS) because iOS Safari
// allows background scroll when the keyboard is open even with position:fixed.
// Also listens to visualViewport so modals stay centred in the visible area
// above the keyboard — iOS doesn't resize the layout viewport when the
// software keyboard appears, so fixed overlays must be nudged manually.
let _scrollLockCount = 0;
let _scrollLockY = 0;
const _MODAL_IDS = ['parent-auth-modal','forgot-pin-modal','unit-pin-modal','install-modal','auth-modal'];

function _scrollTrap(e){
  // Progress report uses the outer overlay as its scroll container — allow all touches inside it
  if(e.target.closest('#progress-report-modal')){ return; }
  const box = e.target.closest('.install-box, .pin-box, #access-modal > div, #timer-modal > div, #a11y-modal > div, #pin-modal > div, #scal-modal > div');
  if(!box){ e.preventDefault(); return; }
  // Inside the modal box — only pass the event through if a scrollable
  // ancestor between the touch target and the box can still scroll.
  // Prevents background-page scroll from leaking out through the modal.
  let el = e.target;
  while(el && el !== box){
    const ov = getComputedStyle(el).overflowY;
    if((ov === 'auto' || ov === 'scroll') && el.scrollHeight > el.clientHeight) return;
    el = el.parentElement;
  }
  e.preventDefault();
}

// _animateModalClose — slides the modal box down in sync with the iOS keyboard
// dismiss animation (~260ms ease-in), then calls the close function.
// Uses rAF first so any button click that already called close() can cancel us.
function _animateModalClose(id, closeFn){
  requestAnimationFrame(()=>{
    const overlay = document.getElementById(id);
    // Support both display:none and classList 'open' patterns
    if(!overlay) return;
    const isOpen = overlay.classList.contains('open') || getComputedStyle(overlay).display !== 'none';
    if(!isOpen) return; // already closed by another handler
    // Find the inner content box — try known classes first, fall back to first child
    const box = overlay.querySelector(
      '.pin-box,.install-box,.restart-modal-box,.sc-lightbox-box,.scratch-box,.coin-lightbox-inner'
    ) || overlay.firstElementChild;
    if(!box){ closeFn(); return; }
    const ease = 'cubic-bezier(0.4, 0, 0.6, 1)';
    const dur  = 300;
    box.style.transition = `transform ${dur}ms ${ease}, opacity ${dur}ms ${ease}, scale ${dur}ms ${ease}`;
    box.style.transform  = 'translateY(100%)';
    box.style.opacity    = '0';
    box.style.scale      = '0.97';
    setTimeout(()=>{
      box.style.transition = '';
      box.style.transform  = '';
      box.style.opacity    = '';
      box.style.scale      = '';
      closeFn();
    }, dur);
  });
}

// _animateModalOpen — reverse of _animateModalClose.
// Box slides up from below, fades in, and scales to full size.
function _animateModalOpen(id){
  const overlay = document.getElementById(id);
  if(!overlay) return;
  const box = overlay.querySelector(
    '.pin-box,.install-box,.restart-modal-box,.sc-lightbox-box,.scratch-box,.coin-lightbox-inner'
  ) || overlay.firstElementChild;
  if(!box) return;
  const ease = 'cubic-bezier(0, 0, 0.2, 1)'; // ease-out — mirror of dismiss ease-in
  const dur  = 300;
  // Backdrop appears instantly — eye follows the box, not the dim
  // Box starts from dismissed position
  box.style.transition = 'none';
  box.style.transform  = 'translateY(100%)';
  box.style.opacity    = '0';
  box.style.scale      = '0.97';
  // Force reflow so starting state is painted before the transition begins
  box.offsetHeight;
  // Animate box to resting state
  box.style.transition = `transform ${dur}ms ${ease}, opacity ${dur}ms ${ease}, scale ${dur}ms ${ease}`;
  box.style.transform  = 'translateY(0)';
  box.style.opacity    = '1';
  box.style.scale      = '1';
  setTimeout(()=>{
    box.style.transition = '';
    box.style.transform  = '';
    box.style.opacity    = '';
    box.style.scale      = '';
  }, dur);
}

// Backdrop taps are always allowed — dismissing the keyboard now closes the
// modal with an animation, so no suppress logic needed.
let _backdropCloseAllowed = true;
function _suppressBackdropClose(){ /* no-op — kept so open/close callers don't break */ }

function _vpSync(){
  const vv = window.visualViewport;
  if(!vv) return;
  _MODAL_IDS.forEach(id=>{
    const el = document.getElementById(id);
    if(!el || getComputedStyle(el).display === 'none') return;
    el.style.top    = vv.offsetTop + 'px';
    el.style.height = vv.height + 'px';
  });
}

function _vpReset(){
  _MODAL_IDS.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.style.top    = '';
    el.style.height = '';
  });
}

function _lockScroll(){
  if(++_scrollLockCount > 1) return;
  _scrollLockY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top      = `-${_scrollLockY}px`;
  document.body.style.width    = '100%';
  document.addEventListener('touchmove', _scrollTrap, { passive: false });
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', _vpSync);
    window.visualViewport.addEventListener('scroll', _vpSync);
    _vpSync(); // run once immediately in case keyboard is already up
  }
}

function _unlockScroll(){
  if(--_scrollLockCount > 0) return;
  _scrollLockCount = 0;
  document.body.style.overflow  = '';
  document.body.style.position  = '';
  document.body.style.top       = '';
  document.body.style.width     = '';
  window.scrollTo(0, _scrollLockY);
  document.removeEventListener('touchmove', _scrollTrap);
  if(window.visualViewport){
    window.visualViewport.removeEventListener('resize', _vpSync);
    window.visualViewport.removeEventListener('scroll', _vpSync);
  }
  _vpReset();
}

let _authClosing = false;
function _authPinBlurHandler(){
  if(_authClosing) return; // prevent double-close race
  _authClosing = true;
  _animateModalClose('parent-auth-modal', ()=>{ _closeParentAuth(); _authClosing = false; });
  // Safety: reset flag after animation max duration in case callback doesn't fire
  setTimeout(()=>{ _authClosing = false; }, 500);
}
function _openParentAuth(){
  _authClosing = false;
  const modal = document.getElementById('parent-auth-modal');
  const inp   = document.getElementById('parent-pin-inp');
  modal.style.display = '';
  inp.value = '';
  document.getElementById('pin-msg').textContent = '';
  _stopPinPoll();
  _startPinPoll();
  inp.addEventListener('blur', _authPinBlurHandler);
  inp.focus();
  requestAnimationFrame(()=>{ inp.focus(); });
  _lockScroll();
}

function _closeParentAuth(){
  _stopPinPoll();
  const inp = document.getElementById('parent-pin-inp');
  if(inp) inp.removeEventListener('blur', _authPinBlurHandler);
  document.getElementById('parent-auth-modal').style.display = 'none';
  _unlockScroll();
}


function goSettings(){
  playTap();
  updateAccountUI();
  const cfg = loadSettings();
  document.getElementById('set-student').value = cfg.studentName || '';
  const mode = localStorage.getItem('wb_theme') || 'auto';
  document.getElementById('theme-light').classList.toggle('active', mode==='light');
  document.getElementById('theme-dark').classList.toggle('active', mode==='dark');
  document.getElementById('theme-auto').classList.toggle('active', mode==='auto');
  const snd = isSoundEnabled() ? 'on' : 'off';
  document.getElementById('sound-on').classList.toggle('active', snd==='on');
  document.getElementById('sound-off').classList.toggle('active', snd==='off');
  // Reset parent panel (PIN entry is now in the modal)
  const ppanel = document.getElementById('parent-panel');
  if(ppanel) ppanel.style.display = 'none';
  // Clean up timer picker scroll listeners
  if(window._tpCleanups){ window._tpCleanups.forEach(fn=>fn()); window._tpCleanups = []; }
  _syncA11yUI();
  show('settings-screen');
}




// ════════════════════════════════════════
//  INSTALL MODAL
// ════════════════════════════════════════
// ── FORGOT PIN ──────────────────────────────
let _fpAnswer = 0;

function _gen5thGradeProblem(){
  const type = Math.floor(Math.random()*6);
  let q, hint, answer;
  const r = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  if(type===0){
    // Simple multiplication within 10×10
    const a=r(2,10), b=r(2,10);
    q=`${a} × ${b} = ?`;
    hint='Multiply the two numbers together';
    answer=a*b;
  } else if(type===1){
    // Simple division (no remainders)
    const b=r(2,10), a=b*r(2,10);
    q=`${a} ÷ ${b} = ?`;
    hint='How many times does '+b+' go into '+a+'?';
    answer=a/b;
  } else if(type===2){
    // 2-digit + 2-digit addition
    const a=r(11,99), b=r(11,99);
    q=`${a} + ${b} = ?`;
    hint='Add the ones column first, then the tens';
    answer=a+b;
  } else if(type===3){
    // 2-digit subtraction
    const b=r(11,49), a=b+r(10,50);
    q=`${a} − ${b} = ?`;
    hint='Subtract the smaller number from the larger';
    answer=a-b;
  } else if(type===4){
    // Simple word problem — equal groups
    const groups=r(2,9), each=r(2,9);
    q=`${groups} groups of ${each} = ?`;
    hint=`Multiply ${groups} × ${each}`;
    answer=groups*each;
  } else {
    // Missing number: A + ? = B
    const a=r(10,50), add=r(5,30), total=a+add;
    q=`${a} + ? = ${total}`;
    hint=`What number do you add to ${a} to get ${total}?`;
    answer=add;
  }
  return {q, hint, answer, isDecimal:false};
}

let _fpProblem = null;

function _fpBlurHandler(){ _animateModalClose('forgot-pin-modal', closeForgotPin); }
function openForgotPin(){
  document.getElementById('forgot-pin-modal').style.display='flex';
  const finp = document.getElementById('fp-answer-inp');
  finp.value='';
  document.getElementById('fp-msg').textContent='';
  finp.addEventListener('blur', _fpBlurHandler);
  refreshForgotProblem();
  _lockScroll();
}

function closeForgotPin(){
  const finp = document.getElementById('fp-answer-inp');
  finp.removeEventListener('blur', _fpBlurHandler);
  document.getElementById('forgot-pin-modal').style.display='none';
  _unlockScroll();
}

function refreshForgotProblem(){
  _fpProblem = _gen5thGradeProblem();
  document.getElementById('fp-question').textContent = _fpProblem.q;
  document.getElementById('fp-hint').innerHTML = _ICO.lightbulb + ' Hint: ' + _escHtml(_fpProblem.hint);
  document.getElementById('fp-answer-inp').value='';
  document.getElementById('fp-msg').textContent='';
  document.getElementById('fp-answer-inp').focus();
}

function checkForgotAnswer(){
  if(!_fpProblem) return;
  const raw = document.getElementById('fp-answer-inp').value.trim();
  const entered = parseFloat(raw);
  const msg = document.getElementById('fp-msg');
  if(isNaN(entered)){ msg.textContent='⚠️ Please enter a number'; msg.style.color='#e67e22'; return; }

  const correct = _fpProblem.answer;
  const isRight = Math.abs(entered - correct) < 0.01;

  if(isRight){
    msg.textContent='🎉 Correct! Please create a new PIN.';
    msg.style.color='#27ae60';
    // Clear PIN so the first-setup flow triggers next
    localStorage.removeItem(PARENT_PIN_KEY);
    localStorage.removeItem(PIN_CHANGED_KEY);
    if(isSoundEnabled()) playCorrect();
    document.getElementById('fp-answer-inp').removeEventListener('blur', _fpBlurHandler);
    setTimeout(()=>{ _animateModalClose('forgot-pin-modal', ()=>{ closeForgotPin(); _openFirstTimePinSetup(); }); }, 1200);
    return;
  } else {
    msg.textContent='❌ Not quite — try again!';
    msg.style.color='#e74c3c';
    if(isSoundEnabled()) playWrong();
    document.getElementById('fp-answer-inp').select();
  }
}

function showInstall(){
  document.getElementById('install-modal').style.display='flex';
  // Auto-select tab based on device
  const isIPad = /iPad/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  switchInstallTab(isIPad ? 'ipad' : 'iphone');
}
// ── UNIT PIN UNLOCK ──────────────────────────────
let _upmUnitIdx = -1;
let _upmMode = 'unit'; // 'unit' or 'lesson'
function _upmCheck(){ _upmMode === 'lesson' ? checkLessonPinUnlock() : checkUnitPinUnlock(); }
let _upmPoll = null;
function _startUpmPoll(){
  if(_upmPoll) clearInterval(_upmPoll);
  _upmPoll = setInterval(()=>{
    const inp = document.getElementById('upm-pin-inp');
    if(!inp) return;
    const v = inp.value.replace(/[^0-9]/g,'').slice(0,4);
    if(v !== inp.value) inp.value = v;
    if(v.length === 4){ clearInterval(_upmPoll); _upmPoll = null; _upmCheck(); }
  }, 50);
}
function _stopUpmPoll(){ if(_upmPoll){ clearInterval(_upmPoll); _upmPoll = null; } }
function _upmBind(){ _stopUpmPoll(); _startUpmPoll(); }

// ── LESSON PIN UNLOCK ──────────────────────────────
let _lpmUnitIdx = -1, _lpmLessonIdx = -1;

function openLessonPinUnlock(unitIdx, lessonIdx){
  _lpmUnitIdx = unitIdx;
  _lpmLessonIdx = lessonIdx;
  const u = UNITS_DATA[unitIdx];
  const l = u.lessons[lessonIdx];
  document.getElementById('upm-icon').innerHTML = l.icon;
  document.getElementById('upm-title').textContent = 'Unlock Lesson '+(lessonIdx+1);
  document.getElementById('upm-sub').textContent = 'Enter your parent PIN to unlock "'+l.title+'" for your student.';
  const linp = document.getElementById('upm-pin-inp');
  linp.value = '';
  linp.addEventListener('blur', _upmBlurHandler);
  document.getElementById('upm-msg').textContent = '';
  _upmMode = 'lesson';
  _upmBind();
  document.getElementById('unit-pin-modal').style.display = 'flex';
  setTimeout(()=>linp.focus(), 200);
}

async function checkLessonPinUnlock(){
  const entered = document.getElementById('upm-pin-inp').value;
  const msg = document.getElementById('upm-msg');
  if(!(await _verifyPin(entered))){
    msg.textContent = '❌ Wrong PIN — try again.';
    msg.style.color = '#e74c3c';
    if(isSoundEnabled()) playWrong();
    document.getElementById('upm-pin-inp').value = '';
    document.getElementById('upm-pin-inp').focus();
    return;
  }
  if(_lpmUnitIdx < 0 || _lpmLessonIdx < 0) return;
  const unlocks = getLessonUnlocks();
  unlocks[_lpmUnitIdx+'_'+_lpmLessonIdx] = true;
  saveLessonUnlocks(unlocks);
  msg.textContent = '✅ Lesson unlocked!';
  msg.style.color = '#27ae60';
  if(isSoundEnabled()) playCorrect();
  document.getElementById('upm-pin-inp').removeEventListener('blur', _upmBlurHandler);
  setTimeout(()=>{
    _animateModalClose('unit-pin-modal', ()=>{ closeUnitPinModal(); openUnit(_lpmUnitIdx); });
  }, 1200);
}

function _upmBlurHandler(){ _animateModalClose('unit-pin-modal', closeUnitPinModal); }
function openUnitPinUnlock(unitIdx){
  if(!_supaUser){ showLockToast('🔒 Unit unlocking is only available to account holders — create a free account!'); return; }
  _upmUnitIdx = unitIdx;
  const u = UNITS_DATA[unitIdx];
  document.getElementById('upm-icon').innerHTML = u.svg||u.icon;
  document.getElementById('upm-title').textContent = 'Unlock '+u.name;
  document.getElementById('upm-sub').textContent = 'Enter your parent PIN to unlock Unit '+(unitIdx+1)+' for your student.';
  const uinp = document.getElementById('upm-pin-inp');
  uinp.value = '';
  uinp.addEventListener('blur', _upmBlurHandler);
  _lockScroll();
  document.getElementById('upm-msg').textContent = '';
  _upmMode = 'unit';
  _upmBind();
  document.getElementById('unit-pin-modal').style.display = 'flex';
  setTimeout(()=>uinp.focus(), 200);
}

function closeUnitPinModal(){
  _stopUpmPoll();
  const uinp = document.getElementById('upm-pin-inp');
  uinp.removeEventListener('blur', _upmBlurHandler);
  document.getElementById('unit-pin-modal').style.display = 'none';
  _upmUnitIdx = -1;
  _unlockScroll();
}

async function checkUnitPinUnlock(){
  const entered = document.getElementById('upm-pin-inp').value;
  const msg = document.getElementById('upm-msg');
  if(!(await _verifyPin(entered))){
    msg.textContent = '❌ Wrong PIN — try again.';
    msg.style.color = '#e74c3c';
    if(isSoundEnabled()) playWrong();
    document.getElementById('upm-pin-inp').value = '';
    document.getElementById('upm-pin-inp').focus();
    return;
  }
  if(_upmUnitIdx < 0) return;
  // Save individual unit unlock
  const unlocks = getUnitUnlocks();
  if(!unlocks.includes(_upmUnitIdx)){
    unlocks.push(_upmUnitIdx);
    saveUnitUnlocks(unlocks);
  }
  msg.textContent = '✅ Unit unlocked!';
  msg.style.color = '#27ae60';
  if(isSoundEnabled()) playCorrect();
  document.getElementById('upm-pin-inp').removeEventListener('blur', _upmBlurHandler);
  setTimeout(()=>{
    _animateModalClose('unit-pin-modal', ()=>{ closeUnitPinModal(); buildHome(); });
  }, 1200);
}

function switchInstallTab(device){
  document.getElementById('install-iphone').style.display = device==='iphone' ? 'block' : 'none';
  document.getElementById('install-ipad').style.display   = device==='ipad'   ? 'block' : 'none';
  const iph = document.getElementById('tab-iphone');
  const ipd = document.getElementById('tab-ipad');
  if(iph && ipd){
    if(device==='iphone'){
      iph.style.background='#4a90d9'; iph.style.color='#fff'; iph.style.borderColor='#4a90d9';
      ipd.style.background='transparent'; ipd.style.color='var(--txt2)'; ipd.style.borderColor='var(--border2)';
    } else {
      ipd.style.background='#4a90d9'; ipd.style.color='#fff'; ipd.style.borderColor='#4a90d9';
      iph.style.background='transparent'; iph.style.color='var(--txt2)'; iph.style.borderColor='var(--border2)';
    }
  }
}

function closeInstall(){
  _animateModalClose('install-modal', ()=>{ document.getElementById('install-modal').style.display='none'; });
  const firstTime = !localStorage.getItem('install_seen');
  localStorage.setItem('install_seen','1');
  // If first-open onboarding: fire tutorial immediately after install prompt closes
  if(firstTime && !localStorage.getItem('wb_tutorial_v2')){
    setTimeout(_startTutorial, 400);
  } else {
    _onboardingActive = false;
    document.body.classList.remove('tut-active');
  }
}
// Install hint removed — available via Settings > How to Install button only
