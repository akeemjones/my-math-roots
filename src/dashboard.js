// ════════════════════════════════════════
//  DASHBOARD — Parent Dashboard (SPA screen)
//  Bundled into main app.js — uses shared _supa client from auth.js
// ════════════════════════════════════════

// ── Category mapping ──────────────────────────────────────────────────────

var _CATEGORY_LABELS = {
  add:  'Addition',
  sub:  'Subtraction',
  mul:  'Multiplication',
  mult: 'Multiplication',
  div:  'Division',
  frac: 'Fractions',
  dec:  'Decimals',
  word: 'Word Problems',
  geo:  'Geometry',
  meas: 'Measurement',
};

function getCategoryFromId(qId) {
  if (!qId) return { key: 'unknown', label: 'Unknown' };
  var match = String(qId).match(/^u\d+-([a-z]+)-\d+$/);
  if (!match) return { key: 'unknown', label: 'Unknown' };
  var key = match[1];
  return { key: key, label: _CATEGORY_LABELS[key] || key };
}

// ── Settings parsers (pure, testable) ────────────────────────────────────

function _parseUnlockSettings(raw) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    freeMode: raw.freeMode === true,
    units:    Array.isArray(raw.units) ? raw.units.slice() : [],
    lessons:  (raw.lessons && typeof raw.lessons === 'object') ? Object.assign({}, raw.lessons) : {},
  };
}

function _parseTimerSettings(raw) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    enabled:    raw.enabled !== false,
    lessonSecs: typeof raw.lessonSecs === 'number' ? raw.lessonSecs : 300,
    unitSecs:   typeof raw.unitSecs   === 'number' ? raw.unitSecs   : 600,
    finalSecs:  typeof raw.finalSecs  === 'number' ? raw.finalSecs  : 3600,
  };
}

function _parseA11ySettings(raw) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    largeText:    raw.largeText    === true,
    highContrast: raw.highContrast === true,
  };
}

function _isUnitUnlockedInDraft(draft, unitIdx) {
  if (draft.freeMode) return true;
  return draft.units.indexOf(unitIdx) !== -1;
}

function _isLessonUnlockedInDraft(draft, unitIdx, lessonIdx) {
  if (draft.freeMode) return true;
  return !!draft.lessons[unitIdx + '_' + lessonIdx];
}

// ── Pure data functions (testable — all take data as args) ────────────────

function _computeOverallStats(scores, streak, appTime) {
  var completed = scores.filter(function(s) { return s.pct != null && s.total > 0; });
  var quizCount = completed.length;
  var totalCorrect = 0, totalAttempted = 0, sumPct = 0;
  completed.forEach(function(s) {
    sumPct         += s.pct;
    totalCorrect   += (s.score || 0);
    totalAttempted += (s.total || 0);
  });
  var accuracy = quizCount > 0 ? Math.round(sumPct / quizCount) : 0;

  var dailySecs = (appTime && appTime.dailySecs) ? appTime.dailySecs : {};
  var weekSecs  = 0;
  for (var i = 0; i < 7; i++) {
    var d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    weekSecs += (dailySecs[d] || 0);
  }

  var lastActive = null;
  for (var j = 0; j < completed.length; j++) {
    if (completed[j].date) { lastActive = completed[j].date; break; }
  }

  return {
    accuracy: accuracy,
    quizCount: quizCount,
    totalAttempted: totalAttempted,
    totalCorrect: totalCorrect,
    streak: (streak && streak.current != null) ? streak.current : 0,
    weekSecs: weekSecs,
    lastActive: lastActive,
  };
}

function _computeSkillBreakdown(scores, unitNames) {
  var completed = scores.filter(function(s) {
    return s.pct != null && s.total > 0 && s.unitIdx != null;
  });
  var map = {};
  completed.forEach(function(s) {
    var k = s.unitIdx;
    if (!map[k]) { map[k] = { sumPct: 0, correct: 0, total: 0, count: 0 }; }
    map[k].sumPct  += s.pct;
    map[k].correct += (s.score  || 0);
    map[k].total   += (s.total  || 0);
    map[k].count   += 1;
  });
  return Object.keys(map)
    .map(function(k) {
      var idx = parseInt(k, 10);
      var v   = map[k];
      return {
        unitIdx:  idx,
        label:    (unitNames && unitNames[idx]) ? unitNames[idx] : ('Unit ' + (idx + 1)),
        accuracy: Math.round(v.sumPct / v.count),
        correct:  v.correct,
        total:    v.total,
      };
    })
    .sort(function(a, b) { return a.unitIdx - b.unitIdx; });
}

function _computeWeakAreas(skillBreakdown) {
  return skillBreakdown
    .filter(function(s) { return s.total >= 5 && s.accuracy < 70; })
    .sort(function(a, b) { return a.accuracy - b.accuracy; })
    .slice(0, 5);
}

function _computeActivityData(scores, days) {
  var DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var countMap = {};
  scores.forEach(function(s) {
    if (s.pct != null && s.total > 0 && s.date) {
      countMap[s.date] = (countMap[s.date] || 0) + 1;
    }
  });
  var result = [];
  for (var i = 0; i < (days || 7); i++) {
    var ts  = Date.now() - i * 86400000;
    var d   = new Date(ts).toISOString().slice(0, 10);
    var dow = new Date(ts).getUTCDay();
    result.push({ date: d, dayLabel: DAY_ABBR[dow], quizCount: countMap[d] || 0 });
  }
  return result;
}

function _computeReviewQueue(mastery, qTextMap) {
  var now    = Date.now();
  var result = [];
  Object.keys(mastery).forEach(function(k) {
    var m = mastery[k];
    if (m.nextReview == null) return;
    result.push({
      key:        k,
      qText:      (qTextMap && qTextMap[k]) ? qTextMap[k] : '',
      accuracy:   m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0,
      overdue:    m.nextReview <= now,
      nextReview: m.nextReview,
    });
  });
  result.sort(function(a, b) {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return a.nextReview - b.nextReview;
  });
  return result;
}

// ── Data access layer ─────────────────────────────────────────────────────
// Abstracts localStorage reads. Future: swap for Supabase fetch.

var _STUDENTS_KEY = 'mmr_students_v1';

function _readLocalStudentData() {
  // Read from the keys the student app writes to
  function tryParse(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  }
  var rawScores  = tryParse('wb_sc5', []);
  var scoresArr  = Array.isArray(rawScores) ? rawScores : (rawScores.d || []);
  var cfg        = tryParse('wb_settings', {});
  return {
    id:      'local',
    name:    cfg.studentName || 'Student (This Device)',
    MASTERY: tryParse('wb_mastery', {}),
    SCORES:  scoresArr,
    STREAK:  tryParse('wb_streak',  { current: 0, longest: 0, lastDate: null }),
    APP_TIME: tryParse('wb_app_time', { totalSecs: 0, sessions: 0, dailySecs: {} }),
  };
}

function getAllStudents() {
  // Only real local student — no demo/mock data
  return { 'local': _readLocalStudentData() };
}

function getStudentData(studentId) {
  return getAllStudents()[studentId] || null;
}

function saveStudentData(studentId, data) {
  // Guard: never overwrite local student app keys
  if (studentId === 'local') return;
  var stored = {};
  try { var raw = localStorage.getItem(_STUDENTS_KEY); if (raw) stored = JSON.parse(raw); } catch(e) {}
  stored[studentId] = data;
  localStorage.setItem(_STUDENTS_KEY, JSON.stringify(stored));
}

// ── Time/quiz helpers ─────────────────────────────────────────────────────

function _parseSecs(t) {
  if (!t) return 0;
  var p = String(t).split(':');
  return (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0);
}

function _fmtSecs(s) {
  if (!s) return '—';
  var m = Math.floor(s / 60), sec = Math.round(s % 60);
  return m + 'm ' + String(sec).padStart(2, '0') + 's';
}

function _quizAvgQSecs(s) {
  if (!s.answers) return 0;
  var sum = 0, n = 0;
  s.answers.forEach(function(a) { if (a.timeSecs != null && a.timeSecs < 300) { sum += a.timeSecs; n++; } });
  return n > 0 ? Math.round(sum / n) : 0;
}

function _buildQTextMap(scores) {
  var map = {};
  scores.forEach(function(s) {
    if (s.answers) s.answers.forEach(function(a) {
      if (a.t) {
        // Use a simple hash: length + first chars as key approximation
        var k = String(a.t).length + '_' + String(a.t).slice(0, 12);
        if (!map[k]) map[k] = a.t;
      }
    });
  });
  return map;
}

// ── Render helpers (return HTML strings) ─────────────────────────────────

function _esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function _showDbToast(msg, isError) {
  var toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);'
    + 'padding:10px 20px;border-radius:50px;font-size:.85rem;z-index:9999;white-space:nowrap;'
    + 'box-shadow:0 4px 12px rgba(0,0,0,.2);pointer-events:none;'
    + (isError
        ? 'background:#c62828;color:#fff;'
        : 'background:#263238;color:#fff;');
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3500);
}

function _dbValidColor(val) {
  if (typeof val !== 'string') return '#f59e0b';
  var v = val.trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#f59e0b';
}

function _renderStudentSelector(students, activeId) {
  var opts = Object.values(students).map(function(s) {
    return '<option value="' + _esc(s.id) + '"' + (s.id === activeId ? ' selected' : '') + '>'
      + _esc(s.name) + '</option>';
  }).join('');
  return '<div class="db-selector-wrap">'
    + '<label class="db-selector-label">Viewing:</label>'
    + '<select class="db-selector" id="db-student-select">'
    + opts + '</select>'
    + '</div>';
}

function _statCard(bg, color, val, lbl) {
  return '<div class="db-stat-card" style="background:' + bg + '">'
    + '<div class="db-stat-val" style="color:' + color + '">' + val + '</div>'
    + '<div class="db-stat-lbl" style="color:' + color + '">' + lbl + '</div>'
    + '</div>';
}

function _renderOverview(stats) {
  var ac = stats.accuracy >= 80 ? '#2e7d32' : stats.accuracy >= 60 ? '#e65100' : '#c62828';
  var wm = Math.round(stats.weekSecs / 60);
  var tl = wm >= 60 ? Math.floor(wm/60)+'h '+String(wm%60).padStart(2,'0')+'m' : wm+'m';
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">Overview</h2>'
    + '<div class="db-stat-grid">'
    + _statCard('#e8f5e9', ac,        stats.accuracy+'%',       'Accuracy')
    + _statCard('#e3f2fd', '#1565C0', String(stats.quizCount),  'Quizzes')
    + _statCard('#fff8e1', '#f57f17', stats.streak+'&#x1F525;', 'Streak')
    + _statCard('#ede7f6', '#512da8', tl,                       'This Week')
    + '</div>'
    + (stats.lastActive ? '<p class="db-last-active">Last active: '+stats.lastActive+'</p>' : '')
    + '</section>';
}

function _renderWeeklySnapshot(scores, appTime, streak) {
  // Time this week
  var weekSecs = 0;
  for (var i = 0; i < 7; i++) {
    var d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    weekSecs += ((appTime.dailySecs || {})[d] || 0);
  }
  var weekMins = Math.round(weekSecs / 60);
  var timeStr = weekMins >= 60
    ? Math.floor(weekMins/60) + 'h ' + String(weekMins % 60).padStart(2,'0') + 'm'
    : weekMins + 'm';

  // Lessons completed this week (type=lesson, date within 7 days)
  var cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  var weekLessons = scores.filter(function(s) {
    return s.type === 'lesson' && s.pct != null && s.total > 0 && s.date && s.date >= cutoff;
  }).length;

  // Streak display — dot row (up to 7)
  var cur = (streak && streak.current) || 0;
  var streakIcons = '';
  var dots = Math.min(cur, 7);
  for (var j = 0; j < 7; j++) {
    streakIcons += '<span class="ws-dot' + (j < dots ? ' ws-dot-lit' : '') + '"></span>';
  }
  if (cur > 7) streakIcons += '<span class="ws-streak-more">+' + (cur - 7) + '</span>';

  return '<section class="db-section ws-section">'
    + '<h2 class="db-sec-h">&#x1F4C6; This Week</h2>'
    + '<div class="ws-grid">'

    // Time spent
    + '<div class="ws-widget ws-widget-time">'
    + '<div class="ws-widget-icon">⏱</div>'
    + '<div class="ws-widget-val">' + (weekMins > 0 ? timeStr : '—') + '</div>'
    + '<div class="ws-widget-lbl">Time Practiced</div>'
    + '</div>'

    // Streak
    + '<div class="ws-widget">'
    + '<div class="ws-widget-icon">🔥</div>'
    + '<div class="ws-widget-val">' + cur + ' day' + (cur !== 1 ? 's' : '') + '</div>'
    + '<div class="ws-streak-row">' + streakIcons + '</div>'
    + '<div class="ws-widget-lbl">Streak</div>'
    + '</div>'

    // Lessons
    + '<div class="ws-widget ws-widget-lessons">'
    + '<div class="ws-widget-icon">📖</div>'
    + '<div class="ws-widget-val">' + weekLessons + '</div>'
    + '<div class="ws-widget-lbl">Lessons This Week</div>'
    + '</div>'

    + '</div>'
    + '</section>';
}

function _renderRootSystem(scores, unitNames) {
  // Per-unit: best pct, attempt count, whether unit quiz was passed (>=80)
  var unitMap = {};
  scores.forEach(function(s) {
    if (s.unitIdx == null || s.pct == null || s.total <= 0) return;
    var k = s.unitIdx;
    if (!unitMap[k]) unitMap[k] = { sumPct: 0, count: 0, best: 0 };
    unitMap[k].sumPct += s.pct;
    unitMap[k].count++;
    if (s.pct > unitMap[k].best) unitMap[k].best = s.pct;
  });

  // Find the highest unit with any attempt (current progress frontier)
  var maxTouched = -1;
  Object.keys(unitMap).forEach(function(k) { var n = parseInt(k,10); if (n > maxTouched) maxTouched = n; });

  var nodes = unitNames.map(function(name, idx) {
    var data = unitMap[idx];
    if (!data) return { name: name, idx: idx, state: 'locked', avg: 0 };
    var avg = Math.round(data.sumPct / data.count);
    var state = avg >= 80 ? 'mastered' : avg >= 60 ? 'growing' : 'struggling';
    return { name: name, idx: idx, state: state, avg: avg };
  });

  var stateColor = { mastered: '#2e7d32', growing: '#f57f17', struggling: '#c62828', locked: '#cfd8dc' };
  var _niSvg = '<svg width="15" height="15" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">'
    + '<g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g>'
    + '<path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="#28a855" stroke-width="5.5" stroke-linecap="round" fill="none"/>'
    + '<path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="#f5a020"/>'
    + '<path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="#ee9010"/>'
    + '<path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="#5ad880"/>'
    + '</svg>';
  var stateIcon  = { mastered: '🌳', growing: '🌿', struggling: _niSvg, locked: '🪨' };
  var stateLbl   = { mastered: 'Mastered', growing: 'In Progress', struggling: 'Needs Work', locked: 'Not Started' };

  // Build SVG step-tracker: vertical spine with 10 nodes, alternating left/right labels
  var nodeHTML = nodes.map(function(n, i) {
    var col  = stateColor[n.state];
    var icon = stateIcon[n.state];
    var lbl  = stateLbl[n.state];
    var isRight = i % 2 === 0;
    var pct  = n.avg > 0 ? ' &bull; ' + n.avg + '%' : '';
    return '<div class="rs-row' + (isRight ? ' rs-row-right' : ' rs-row-left') + '">'
      + (isRight ? '' : '<div class="rs-label rs-label-left"><div class="rs-lbl-name">' + _esc(n.name) + '</div><div class="rs-lbl-sub" style="color:' + col + '">' + lbl + pct + '</div></div>')
      + '<div class="rs-node-col">'
      + '<div class="rs-node' + (n.state === 'locked' ? ' rs-node-locked' : '') + '" style="border-color:' + col + ';background:' + (n.state === 'locked' ? '#f5f5f5' : col + '18') + '">'
      + '<span class="rs-node-num" style="color:' + col + '">' + (i + 1) + '</span>'
      + '<span class="rs-node-icon">' + icon + '</span>'
      + '</div>'
      + (i < nodes.length - 1 ? '<div class="rs-spine' + (n.state !== 'locked' ? ' rs-spine-active" style="background:' + col + '"' : '"') + '></div>' : '')
      + '</div>'
      + (isRight ? '<div class="rs-label rs-label-right"><div class="rs-lbl-name">' + _esc(n.name) + '</div><div class="rs-lbl-sub" style="color:' + col + '">' + lbl + pct + '</div></div>' : '')
      + '</div>';
  }).join('');

  var mastered = nodes.filter(function(n){ return n.state === 'mastered'; }).length;
  var touched  = nodes.filter(function(n){ return n.state !== 'locked'; }).length;

  var _sproutSvg = '<svg width="22" height="22" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:6px;filter:drop-shadow(0 1px 3px rgba(0,80,20,0.18))">'
    + '<defs>'
    + '<linearGradient id="rs-l1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient>'
    + '<linearGradient id="rs-l2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient>'
    + '<linearGradient id="rs-ls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient>'
    + '<linearGradient id="rs-lb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient>'
    + '</defs>'
    + '<g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3.0"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3.0"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g>'
    + '<path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#rs-ls)" stroke-width="5.5" stroke-linecap="round" fill="none"/>'
    + '<path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#rs-l1)"/>'
    + '<path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#rs-l2)"/>'
    + '<path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#rs-lb)"/>'
    + '</svg>';

  return '<section class="db-section">'
    + '<h2 class="db-sec-h">' + _sproutSvg + 'The Root System</h2>'
    + '<div class="rs-legend">'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#2e7d32"></span>Mastered</span>'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#f57f17"></span>In Progress</span>'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#c62828"></span>Needs Work</span>'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#cfd8dc"></span>Not Started</span>'
    + '</div>'
    + '<div class="rs-summary">' + mastered + ' of 10 units mastered &bull; ' + touched + ' started</div>'
    + '<div class="rs-track">' + nodeHTML + '</div>'
    + '</section>';
}

function _renderSkills(skills) {
  if (!skills.length) {
    return '<section class="db-section"><h2 class="db-sec-h">Skills by Unit</h2>'
      + '<p class="db-empty">No unit quizzes completed yet.</p></section>';
  }
  var rows = skills.map(function(s) {
    var c  = s.accuracy >= 80 ? '#2e7d32' : s.accuracy >= 60 ? '#f57f17' : '#c62828';
    var lbl = s.accuracy >= 80 ? '&#x2705; Strong' : s.accuracy >= 60 ? '&#x26A0;&#xFE0F; Developing' : '&#x274C; Needs Work';
    return '<div class="db-skill-row">'
      + '<div class="db-skill-top">'
      + '<span class="db-skill-name">'+_esc(s.label)+'</span>'
      + '<span class="db-skill-badge" style="color:'+c+'">'+lbl+'</span>'
      + '</div>'
      + '<div class="db-bar-bg"><div class="db-bar-fill" style="width:'+s.accuracy+'%;background:'+c+'"></div></div>'
      + '<div class="db-skill-sub">'+s.accuracy+'% &bull; '+s.correct+' correct / '+s.total+' attempted</div>'
      + '</div>';
  }).join('');
  return '<section class="db-section"><h2 class="db-sec-h">Skills by Unit</h2>'+rows+'</section>';
}

function _renderWeak(weak) {
  if (!weak.length) {
    return '<section class="db-section"><h2 class="db-sec-h">&#x26A0;&#xFE0F; Needs Attention</h2>'
      + '<p class="db-empty">No weak areas — great work! &#x1F389;</p></section>';
  }
  var items = weak.map(function(s) {
    return '<div class="db-weak-item">'
      + '<span class="db-weak-name">'+_esc(s.label)+'</span>'
      + '<span class="db-weak-pct">'+s.accuracy+'% &bull; '+s.total+' questions</span>'
      + '</div>';
  }).join('');
  return '<section class="db-section"><h2 class="db-sec-h">&#x26A0;&#xFE0F; Needs Attention</h2>'
    + items + '</section>';
}

function _renderReview(review) {
  if (!review.length) {
    return '<section class="db-section"><h2 class="db-sec-h">&#x1F501; Review Queue</h2>'
      + '<p class="db-empty">No items scheduled for review yet.</p></section>';
  }
  var overdue  = review.filter(function(r){ return r.overdue; }).length;
  var upcoming = review.length - overdue;
  var items = review.slice(0,10).map(function(r) {
    var badge = r.overdue
      ? '<span class="db-badge db-badge-red">Overdue</span>'
      : '<span class="db-badge db-badge-blue">Upcoming</span>';
    var txt = r.qText
      ? _esc(r.qText.length > 80 ? r.qText.slice(0,77)+'...' : r.qText)
      : '(unknown question)';
    return '<div class="db-review-item">'+badge
      + '<div class="db-review-txt">'+txt+'</div>'
      + '<div class="db-review-acc">'+r.accuracy+'% correct</div>'
      + '</div>';
  }).join('');
  return '<section class="db-section"><h2 class="db-sec-h">&#x1F501; Review Queue</h2>'
    + '<div class="db-review-summary">'
    + (overdue  ? '<span class="db-badge db-badge-red">&#x23F0; '+overdue+' overdue</span> ' : '')
    + (upcoming ? '<span class="db-badge db-badge-blue">&#x1F4C5; '+upcoming+' upcoming</span>' : '')
    + '</div>'
    + items + '</section>';
}

function _renderTime(scores, appTime) {
  var completed = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  var withTime  = completed.filter(function(s) { return s.timeTaken && _parseSecs(s.timeTaken) > 0; });
  var weekSecs  = 0;
  for (var i = 0; i < 7; i++) {
    var d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    weekSecs += ((appTime.dailySecs || {})[d] || 0);
  }
  var avgSessionSecs = appTime.sessions > 0 ? Math.round(appTime.totalSecs / appTime.sessions) : 0;
  var timeByType = {};
  withTime.forEach(function(s) {
    var tp = s.type || 'lesson';
    if (!timeByType[tp]) timeByType[tp] = { sum: 0, n: 0 };
    timeByType[tp].sum += _parseSecs(s.timeTaken);
    timeByType[tp].n++;
  });
  function avgTime(type) { var t = timeByType[type]; return t && t.n ? Math.round(t.sum / t.n) : 0; }
  var qSum = 0, qCount = 0;
  completed.forEach(function(s) {
    if (s.answers) s.answers.forEach(function(a) {
      if (a.timeSecs != null && a.timeSecs < 300) { qSum += a.timeSecs; qCount++; }
    });
  });
  var avgQSecs = qCount > 0 ? Math.round(qSum / qCount) : 0;
  var hasAny = appTime.totalSecs > 0 || withTime.length > 0;
  if (!hasAny) return '';

  var col = '#673ab7';
  var rows = '';
  function row(lbl, val) {
    return '<div class="db-time-row"><span class="db-time-lbl">' + lbl + '</span>'
      + '<span class="db-time-val">' + val + '</span></div>';
  }
  if (appTime.totalSecs > 0) {
    rows += row('This week in app', _fmtSecs(weekSecs));
    rows += row('Total time in app', _fmtSecs(appTime.totalSecs));
    rows += row('Avg session length', _fmtSecs(avgSessionSecs));
  }
  if (withTime.length > 0) {
    rows += '<div class="db-time-sep"></div>';
    var la = avgTime('lesson'), ua = avgTime('unit'), fa = avgTime('final');
    if (la) rows += row('Avg lesson quiz time', _fmtSecs(la));
    if (ua) rows += row('Avg unit test time', _fmtSecs(ua));
    if (fa) rows += row('Avg final test time', _fmtSecs(fa));
  }
  if (avgQSecs > 0) {
    rows += '<div class="db-time-sep"></div>';
    rows += row('Avg time per question', avgQSecs + 's');
  }
  return '<section class="db-section"><h2 class="db-sec-h">&#x23F1; Time</h2>'
    + '<div class="db-time-box">' + rows + '</div></section>';
}

function _renderRecentQuizzes(scores) {
  var completed = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  if (!completed.length) return '';
  var recent = completed.slice(0, 10);
  var typeLabel = { lesson: 'Lesson Quiz', unit: 'Unit Test', final: 'Final Test' };
  var COLORS = ['#6c5ce7','#0984e3','#00b894','#e17055','#fdcb6e','#a29bfe','#fd79a8','#55efc4','#74b9ff','#fab1a0'];
  var items = recent.map(function(s, idx) {
    var pctColor = s.pct >= 80 ? '#2e7d32' : s.pct >= 60 ? '#e65100' : '#c62828';
    var tLabel   = typeLabel[s.type] || s.type || '';
    var dispLabel = _esc(s.label || tLabel);
    var qAvg     = _quizAvgQSecs(s);
    var hasQTime = s.answers && s.answers.some(function(a) { return a.timeSecs != null; });
    var color    = s.color || COLORS[idx % COLORS.length];
    var sub = (s.date || '') + (s.date ? ' &bull; ' : '') + tLabel + (hasQTime ? ' &bull; &#x23F1; ' + qAvg + 's/q' : '')
      + ' &bull; <span style="color:' + color + '">View details →</span>';
    return '<div class="db-quiz-row" data-action="openQuizReview" data-arg="' + idx + '" role="button" tabindex="0">'
      + '<div class="db-quiz-bar" style="background:' + color + '"></div>'
      + '<div class="db-quiz-info"><div class="db-quiz-label">' + dispLabel + '</div>'
      + '<div class="db-quiz-sub">' + sub + '</div></div>'
      + '<div class="db-quiz-score" style="color:' + pctColor + '">' + s.pct + '%'
      + '<div class="db-quiz-frac">' + (s.score||0) + '/' + (s.total||0) + '</div></div>'
      + '</div>';
  }).join('');
  return '<section class="db-section"><h2 class="db-sec-h">&#x1F4CB; Recent Quizzes</h2>'
    + '<div class="db-quiz-list">' + items + '</div></section>';
}

// ── Quiz review modal ─────────────────────────────────────────────────────

function openQuizReview(idx) {
  var student   = _students[_activeId];
  if (!student) return;
  var completed = (student.SCORES || []).filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  var s = completed[idx];
  if (!s) return;

  var typeLabel = { lesson: 'Lesson Quiz', unit: 'Unit Test', final: 'Final Test' };
  var tLabel    = typeLabel[s.type] || s.type || '';
  var dispLabel = _esc(s.label || tLabel);
  var pctColor  = s.pct >= 80 ? '#2e7d32' : s.pct >= 60 ? '#e65100' : '#c62828';

  var bodyHtml = '';
  if (s.answers && s.answers.length) {
    var wrong = s.answers.filter(function(a) { return !a.ok; });
    var right  = s.answers.filter(function(a) { return  a.ok; });
    if (wrong.length) {
      bodyHtml += '<div class="db-rev-sec" style="color:#c62828">&#x274C; Incorrect (' + wrong.length + ')</div>';
      bodyHtml += wrong.map(function(a) {
        return '<div class="db-rev-item db-rev-wrong">'
          + '<div class="db-rev-q">' + _esc(a.t || '') + '</div>'
          + '<div class="db-rev-your">Your answer: <span style="color:#c62828">' + _esc(a.chosen || '') + '</span></div>'
          + '<div class="db-rev-correct">&#x2705; Correct: <span style="color:#2e7d32">' + _esc(a.correct || '') + '</span></div>'
          + (a.timeSecs != null ? '<div class="db-rev-time">&#x23F1; ' + a.timeSecs + 's</div>' : '')
          + '</div>';
      }).join('');
    }
    if (right.length) {
      bodyHtml += '<div class="db-rev-sec" style="color:#2e7d32">&#x2705; Correct (' + right.length + ')</div>';
      bodyHtml += right.map(function(a) {
        return '<div class="db-rev-item db-rev-right">'
          + '<div class="db-rev-q">' + _esc(a.t || '') + '</div>'
          + '<div class="db-rev-correct" style="color:#2e7d32">&#x2705; ' + _esc(a.correct || '') + '</div>'
          + (a.timeSecs != null ? '<div class="db-rev-time">&#x23F1; ' + a.timeSecs + 's</div>' : '')
          + '</div>';
      }).join('');
    }
  } else {
    bodyHtml = '<div class="db-rev-empty">No question detail available for this attempt.</div>';
  }

  var modal = document.getElementById('db-review-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-review-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet" id="db-review-sheet">'
      + '<div class="db-review-head" id="db-review-head"></div>'
      + '<div class="db-review-body" id="db-review-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closeQuizReview(); });
    document.body.appendChild(modal);
  }

  document.getElementById('db-review-head').innerHTML =
    '<button class="db-review-close" data-action="closeQuizReview">&#x2715;</button>'
    + '<div class="db-review-title">' + dispLabel + '</div>'
    + '<div class="db-review-meta">' + _esc(s.date || '') + (s.date ? ' &bull; ' : '') + tLabel
      + (s.timeTaken ? ' &bull; &#x23F1; ' + _esc(s.timeTaken) + ' mins' : '') + '</div>'
    + '<div class="db-review-score" style="color:' + pctColor + '">' + s.pct + '%'
      + ' <span class="db-review-frac">' + (s.score||0) + '/' + (s.total||0) + '</span></div>';

  var bodyEl = document.getElementById('db-review-body');
  bodyEl.innerHTML = bodyHtml;
  bodyEl.scrollTop = 0;
  modal.classList.add('open');
}

function closeQuizReview() {
  var modal = document.getElementById('db-review-modal');
  if (modal) modal.classList.remove('open');
}

function _renderPracticeSpotlight(mastery, scores) {
  // Question-level weaknesses: < 60% accuracy, >= 2 attempts
  var qTextMap = _buildQTextMap(scores);
  var weak = Object.keys(mastery)
    .map(function(k) { return { k: k, m: mastery[k] }; })
    .filter(function(e) { return e.m.attempts >= 2 && (e.m.correct / e.m.attempts) < 0.6; })
    .sort(function(a, b) { return (a.m.correct / a.m.attempts) - (b.m.correct / b.m.attempts); })
    .slice(0, 5);

  if (!weak.length) return '';

  var items = weak.map(function(e) {
    var acc  = Math.round((e.m.correct / e.m.attempts) * 100);
    var kLen = e.k.split('_')[0];
    // Try to find matching qText by key length prefix
    var qText = '';
    Object.keys(qTextMap).forEach(function(mk) {
      if (!qText && mk.startsWith(kLen + '_')) qText = qTextMap[mk];
    });
    if (!qText) qText = e.k; // fallback to raw key
    var short = qText.length > 90 ? qText.slice(0, 87) + '…' : qText;
    return '<div class="db-practice-item">'
      + '<div class="db-practice-txt">' + _esc(short) + '</div>'
      + '<div class="db-practice-sub">' + acc + '% correct &bull; ' + e.m.attempts + ' attempts</div>'
      + '</div>';
  }).join('');

  return '<section class="db-section"><h2 class="db-sec-h">&#x1F4DD; Needs More Practice</h2>'
    + '<div class="db-practice-list">' + items + '</div></section>';
}

function _renderActivity(activity) {
  var max = 0;
  activity.forEach(function(d){ if(d.quizCount > max) max = d.quizCount; });
  var bars = activity.slice().reverse().map(function(d) {
    var pct = max > 0 ? Math.round((d.quizCount / max) * 100) : 0;
    return '<div class="db-act-col">'
      + '<div class="db-act-bar-wrap">'
      + '<div class="db-act-bar" style="height:'+pct+'%;background:'+(d.quizCount > 0 ? '#1565C0' : 'rgba(0,0,0,.08)')+'"></div>'
      + '</div>'
      + '<div class="db-act-n">'+(d.quizCount || '')+'</div>'
      + '<div class="db-act-day">'+d.dayLabel+'</div>'
      + '</div>';
  }).join('');
  return '<section class="db-section"><h2 class="db-sec-h">&#x1F4C5; Activity — Last 7 Days</h2>'
    + '<div class="db-act-chart">'+bars+'</div></section>';
}

// ── AI Report ─────────────────────────────────────────────────────────────

var _prStatsHtml  = '';
var _prReportText = '';

function _buildDashboardPayload(scores, appTime, streak, mastery, days) {
  var cutoff = Date.now() - days * 86400000;
  var period = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.id && s.id > cutoff; });
  var avg    = period.length > 0 ? Math.round(period.reduce(function(a,s){return a+s.pct;},0)/period.length) : 0;

  // Time data
  var weekSecs = 0;
  for (var i = 0; i < 7; i++) {
    var wd = new Date(Date.now() - i*86400000).toISOString().slice(0,10);
    weekSecs += ((appTime.dailySecs||{})[wd]||0);
  }
  var avgSessionSecs = appTime.sessions > 0 ? Math.round((appTime.totalSecs||0) / appTime.sessions) : 0;

  // Active days in period
  var activeDaysSet = {};
  period.forEach(function(s){ if(s.date) activeDaysSet[s.date] = true; });
  var activeDays = Object.keys(activeDaysSet).length;

  // Daily activity last 14 days (only days with activity)
  var activityMap = {};
  scores.forEach(function(s){ if(s.pct!=null&&s.total>0&&s.date) activityMap[s.date]=(activityMap[s.date]||0)+1; });
  var recentActivity = [];
  for (var j = 0; j < 14; j++) {
    var ad = new Date(Date.now()-j*86400000).toISOString().slice(0,10);
    if(activityMap[ad]) recentActivity.push({ date: ad, quizzes: activityMap[ad] });
  }

  // Unit breakdown with raw correct/total counts and mastery label
  var unitNames = ['Basic Fact Strategies','Place Value','Addition & Subtraction','Subtraction','Multiplication','Division','Fractions','Decimals','Geometry','Measurement'];
  var unitMap = {};
  period.forEach(function(s) {
    if (s.unitIdx == null) return;
    var k = s.unitIdx;
    if (!unitMap[k]) unitMap[k] = { name: unitNames[k]||('Unit '+(k+1)), rows:[], correct:0, total:0 };
    unitMap[k].rows.push({ pct: s.pct, id: s.id, type: s.type });
    unitMap[k].correct += (s.score||0);
    unitMap[k].total   += (s.total||0);
  });
  var units = Object.values(unitMap).map(function(u) {
    var rows = u.rows.slice().sort(function(a,b){return a.id-b.id;});
    var uAvg = Math.round(rows.reduce(function(a,r){return a+r.pct;},0)/rows.length);
    var trend = null;
    if (rows.length >= 3) {
      var diff = rows[rows.length-1].pct - rows[0].pct;
      trend = diff > 8 ? 'improving (+'+diff+'%)' : diff < -8 ? 'declining ('+diff+'%)' : 'stable';
    }
    return {
      name: u.name,
      attempts: rows.length,
      avgPct: uAvg,
      correctOfTotal: u.correct+'/'+u.total+' questions correct',
      trend: trend,
      mastery: uAvg >= 80 ? 'mastered' : uAvg >= 60 ? 'developing' : 'needs work'
    };
  }).sort(function(a,b){return b.attempts-a.attempts;});

  var strengths  = units.filter(function(u){return u.avgPct>=80;}).map(function(u){return u.name+' (avg '+u.avgPct+'%, '+u.attempts+' quizzes)';});
  var weaknesses = units.filter(function(u){return u.avgPct<70&&u.attempts>=2;}).map(function(u){return u.name+' (avg '+u.avgPct+'%'+(u.trend?', '+u.trend:'')+', '+u.attempts+' quizzes)';});

  // Quiz type breakdown
  var typeMap = {};
  period.forEach(function(s){
    var t = s.type||'lesson';
    if(!typeMap[t]) typeMap[t]={count:0,sumPct:0};
    typeMap[t].count++; typeMap[t].sumPct+=s.pct;
  });
  var quizTypeBreakdown = Object.keys(typeMap).map(function(t){
    return { type:t, count:typeMap[t].count, avgPct:Math.round(typeMap[t].sumPct/typeMap[t].count) };
  });

  // Avg secs per question from answer timings
  var qSum=0, qCount=0;
  period.forEach(function(s){
    if(s.answers) s.answers.forEach(function(a){
      if(a.timeSecs!=null&&a.timeSecs<300){ qSum+=a.timeSecs; qCount++; }
    });
  });

  // Mastery stats (spaced repetition data)
  var masteryStats = null;
  if (mastery && Object.keys(mastery).length > 0) {
    var mKeys = Object.keys(mastery);
    var mastered  = mKeys.filter(function(k){ var m=mastery[k]; return m.attempts>=3 && m.correct/m.attempts>=0.8; }).length;
    var needsWork = mKeys.filter(function(k){ var m=mastery[k]; return m.attempts>=2 && m.correct/m.attempts<0.6; }).length;
    masteryStats = { totalQsPracticed: mKeys.length, mastered: mastered, needsWork: needsWork };
  }

  // Recent quizzes (last 8)
  var recentQuizzes = period.slice(0, 8).map(function(s){
    return { label: s.label||s.type||'Quiz', date: s.date||null, type: s.type||null, pct: s.pct, score: (s.score||0)+'/'+s.total };
  });

  return {
    reportDate: new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
    period: 'Last '+days+' days',
    totalAttempts: period.length,
    overallAvg: avg,
    streak: { current: (streak&&streak.current)||0, longest: (streak&&streak.longest)||0 },
    activeDaysInPeriod: activeDays,
    timeInApp: {
      thisWeek:           weekSecs>0              ? Math.round(weekSecs/60)+' min'        : 'not tracked',
      total:              (appTime.totalSecs||0)>0 ? Math.round(appTime.totalSecs/60)+' min' : 'not tracked',
      avgSessionMins:     avgSessionSecs>0         ? Math.round(avgSessionSecs/60)+' min' : null,
      avgSecsPerQuestion: qCount>0                 ? Math.round(qSum/qCount)               : null,
      sessions:           appTime.sessions||0
    },
    recentActivity: recentActivity,
    units: units,
    strengths:  strengths.length  ? strengths  : ['No units at 80%+ yet'],
    weaknesses: weaknesses.length ? weaknesses : ['No weak areas identified'],
    quizTypeBreakdown: quizTypeBreakdown,
    recentQuizzes: recentQuizzes,
    masteryStats: masteryStats,
  };
}

var _REPORT_COOL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function _reportCooldownKey() { return 'mmr_report_ts_' + (_activeId || 'default'); }

function _reportNextAvailable() {
  // Prefer Supabase value from _managedProfiles — synced across devices
  var profile = _managedProfiles.find(function(p){ return p.id === _activeId; });
  if (profile && profile.report_last_generated) {
    var ts = new Date(profile.report_last_generated).getTime();
    if (ts) return ts + _REPORT_COOL_MS;
  }
  // Fall back to localStorage (demo/local mode, or before Supabase profile loads)
  var last = parseInt(localStorage.getItem(_reportCooldownKey()) || '0', 10);
  return last ? last + _REPORT_COOL_MS : 0;
}

async function generateAIReport() {
  var footerEl = document.getElementById('db-ai-footer');
  var bodyEl   = document.getElementById('db-root');
  if (!footerEl) return;
  var student   = _students[_activeId];
  if (!student) return;
  var name      = student.name || 'Student';

  // Enforce 2-week cooldown
  var nextAvail = _reportNextAvailable();
  if (nextAvail && Date.now() < nextAvail) {
    if (footerEl) footerEl.innerHTML = _genReportFooter();
    return;
  }

  _prStatsHtml  = bodyEl ? bodyEl.innerHTML : '';

  // Show loading
  if (bodyEl) bodyEl.innerHTML = '<div class="db-ai-loading"><div class="db-ai-spinner"></div>'
    + '<div class="db-ai-loading-txt">Analysing ' + _esc(name) + '\'s progress…</div>'
    + '<div class="db-ai-loading-sub">This takes about 5 seconds</div></div>';
  footerEl.innerHTML = '';

  var payload = _buildDashboardPayload(student.SCORES||[], student.APP_TIME||{totalSecs:0,sessions:0,dailySecs:{}}, student.STREAK||{current:0,longest:0}, student.MASTERY||{}, 30);

  try {
    var resp = await fetch('/.netlify/functions/gemini-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: name, reportData: payload, studentId: _activeId })
    });
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    var data = await resp.json();
    if (data.error) throw new Error(data.error);
    _prReportText = data.report;
    // Record successful generation — localStorage for speed, Supabase for cross-device sync
    var _nowIso = new Date().toISOString();
    localStorage.setItem(_reportCooldownKey(), String(Date.now()));
    if (typeof _supa !== 'undefined' && _supa && _activeId !== 'local') {
      _supa.from('student_profiles')
        .update({ report_last_generated: _nowIso })
        .eq('id', _activeId);
      // Update in-memory profile so the footer re-renders correctly without a refetch
      var _mp = _managedProfiles.find(function(p){ return p.id === _activeId; });
      if (_mp) _mp.report_last_generated = _nowIso;
    }
    _renderAIReportView(data.report, name);
  } catch(e) {
    if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
      + '<div style="font-size:2rem;margin-bottom:14px">⚠️</div>'
      + '<div style="color:#37474f">Couldn\'t generate the report.</div>'
      + '<div style="font-size:.85rem;color:#90a4ae;margin-top:6px">' + _esc(e.message||'Check your connection.') + '</div></div>';
    if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
      + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button>'
      + '<button class="db-ai-pdf-btn" data-action="generateAIReport">↺ Try Again</button></div>';
  }
}

function _renderAIReportView(text, name) {
  // Name-keyed colours: robust against LLM heading re-ordering or extra headings.
  // Fallback array covers any unexpected sections Gemini might emit.
  var SECTION_COLOURS = {
    'Overview':               '#1565C0',
    'Strengths':              '#2e7d32',
    'Areas to Grow':          '#e65100',
    'Recommended Next Steps': '#673ab7',
  };
  var FALLBACK_COLOURS = ['#1565C0','#2e7d32','#e65100','#673ab7','#00838f','#b71c1c'];
  var parts = text.split(/^## /m).filter(Boolean);
  var html  = '<div class="db-ai-sections">';
  parts.forEach(function(part, idx) {
    var nl  = part.indexOf('\n');
    var hdr = nl > -1 ? part.slice(0, nl).trim() : part.trim();
    var bod = nl > -1 ? part.slice(nl + 1).trim() : '';
    var col = SECTION_COLOURS[hdr] || FALLBACK_COLOURS[idx % FALLBACK_COLOURS.length];
    html += '<div class="db-ai-section" style="border-left:3px solid ' + col + '">'
      + '<div class="db-ai-section-title" style="color:' + col + '">' + _esc(hdr) + '</div>'
      + '<div class="db-ai-section-body">' + bod.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div>'
      + '</div>';
  });
  html += '</div>';

  var bodyEl   = document.getElementById('db-root');
  var footerEl = document.getElementById('db-ai-footer');
  var hdrTitle = document.querySelector('.db-header-title');
  if (bodyEl)   { bodyEl.innerHTML = html; bodyEl.scrollTop = 0; }
  if (hdrTitle) hdrTitle.textContent = '📋 AI Report — ' + name;
  if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
    + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button>'
    + '<button class="db-ai-pdf-btn" data-action="downloadReportPDF">💾 Download PDF</button></div>';
}

function backToStats() {
  var bodyEl   = document.getElementById('db-root');
  var hdrTitle = document.querySelector('.db-header-title');
  var footerEl = document.getElementById('db-ai-footer');
  if (bodyEl && _prStatsHtml) { bodyEl.innerHTML = _prStatsHtml; bodyEl.scrollTop = 0; }
  if (hdrTitle) hdrTitle.textContent = '📊 Parent Dashboard';
  if (footerEl) footerEl.innerHTML = _genReportFooter();
}

function _genReportFooter() {
  var nextAvail = _reportNextAvailable();
  var onCooldown = nextAvail && Date.now() < nextAvail;
  if (onCooldown) {
    var nextDate = new Date(nextAvail).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return '<div style="text-align:center">'
      + '<button class="db-ai-gen-btn" disabled style="opacity:0.45;cursor:not-allowed">📋 Generate AI Report</button>'
      + '<div class="db-ai-powered">Next report available ' + nextDate + '</div></div>';
  }
  return '<div style="text-align:center">'
    + '<button class="db-ai-gen-btn" data-action="generateAIReport">📋 Generate AI Report</button>'
    + '<div class="db-ai-powered">Powered by Gemini</div></div>';
}

function downloadReportPDF() {
  if (!_prReportText) return;
  var student  = _students[_activeId];
  var name     = student ? student.name : 'Student';
  var colours  = ['#1565C0','#2e7d32','#e65100','#673ab7','#00838f','#b71c1c'];
  var date     = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  var parts    = _prReportText.split(/^## /m).filter(Boolean);
  var sections = '';
  parts.forEach(function(part, idx) {
    var nl  = part.indexOf('\n');
    var hdr = nl > -1 ? part.slice(0, nl).trim() : part.trim();
    var bod = nl > -1 ? part.slice(nl+1).trim()  : '';
    var col = colours[idx % colours.length];
    sections += '<div style="margin-bottom:22px;page-break-inside:avoid;padding-left:14px;border-left:4px solid '+col+'">'
      + '<div style="font-size:1rem;font-weight:700;color:'+col+';margin-bottom:8px;font-family:Georgia,serif">'+hdr+'</div>'
      + '<div style="font-size:.9rem;line-height:1.9;color:#333">'+bod.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div></div>';
  });
  var doc = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>My Math Roots — Progress Report: '+name+'</title>'
    + '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;max-width:780px;margin:0 auto;padding:40px 32px;color:#222}'
    + '.np{text-align:center;margin-bottom:30px;padding:16px;background:#f5f8ff;border-radius:10px;border:1px solid #dce8ff}'
    + '.np button{background:#1565C0;color:#fff;border:none;padding:11px 30px;border-radius:8px;font-size:.9rem;cursor:pointer}'
    + '.np p{font-size:.78rem;color:#888;margin-top:8px}'
    + '.hd{text-align:center;padding-bottom:22px;margin-bottom:30px;border-bottom:2px solid #1565C0}'
    + '@media print{.np{display:none}}</style></head><body>'
    + '<div class="np"><button data-action="windowPrint">💾 Save as PDF</button>'
    + '<p>In the print dialog, choose <strong>Save as PDF</strong></p></div>'
    + '<div class="hd"><div style="font-size:1.2rem;font-weight:700;color:#1565C0"><svg width="20" height="20" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:5px"><defs><linearGradient id="rp-l1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient><linearGradient id="rp-l2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient><linearGradient id="rp-ls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient><linearGradient id="rp-lb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient></defs><g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g><path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#rp-ls)" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#rp-l1)"/><path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#rp-l2)"/><path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#rp-lb)"/></svg>My Math Roots</div>'
    + '<div style="font-size:1rem;color:#444;margin-top:6px">Progress Report — '+name+'</div>'
    + '<div style="font-size:.78rem;color:#999;margin-top:4px">Generated '+date+'</div></div>'
    + sections
    + '<div style="text-align:center;font-size:.75rem;color:#bbb;margin-top:40px;padding-top:16px;border-top:1px solid #eee">My Math Roots — mymathroots.com</div>'
    + '</body></html>';
  var blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  var blobUrl = URL.createObjectURL(blob);
  var win = window.open(blobUrl, '_blank');
  if (win) { setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 10000); }
}

// ── App state ─────────────────────────────────────────────────────────────

var _students    = {};
var _activeId    = 'local';
// _supa is the shared Supabase client from auth.js — do NOT redeclare it here
var _managedProfiles = [];
var _parentFamilyCode = null;
var _pinResetStudentId = null;
var _pinResetBuffer = [];

// ── Units metadata (for Access Controls lesson drawer) ────────────────────
var _UNITS_META = [
  { name: 'Basic Fact Strategies',    lessons: ['Count Up & Count Back','Doubles!','Make a 10','Number Families'] },
  { name: 'Place Value',              lessons: ['Big Numbers','Different Ways to Write Numbers','Bigger or Smaller?','Skip Counting'] },
  { name: 'Add & Subtract to 200',    lessons: ['Adding Bigger Numbers','Taking Away Bigger Numbers','Add Three Numbers','Math Stories'] },
  { name: 'Add & Subtract to 1,000',  lessons: ['Adding Really Big Numbers','Taking Away Really Big Numbers','Close Enough Counts!'] },
  { name: 'Money & Financial Literacy', lessons: ['All About Coins','Count Your Coins','Dollars and Cents','Save, Spend and Give'] },
  { name: 'Data Analysis',            lessons: ['Tally Marks','Bar Graphs','Picture Graphs','Line Plots'] },
  { name: 'Measurement & Time',       lessons: ['How Long Is It?','What Time Is It?','Hot, Cold and Full'] },
  { name: 'Fractions',                lessons: ['What is a Fraction?','Halves, Fourths and Eighths','Which Piece is Bigger?'] },
  { name: 'Geometry',                 lessons: ['Flat Shapes','Solid Shapes','Mirror Shapes'] },
  { name: 'Multiplication & Division', lessons: ['Equal Groups','Adding the Same Number','Sharing Equally'] },
];

// ── Parent controls draft state ───────────────────────────────────────────
var _unlockDraft      = _parseUnlockSettings({});
var _unlockDirty      = false;
var _activeDrawerUnit = -1;
var _timerDraft       = _parseTimerSettings({});
var _a11yDraft        = _parseA11ySettings({});
var _dbFbRating       = 0;
var _dbFbCategory     = '';

// ── Settings load functions ───────────────────────────────────────────────

async function _loadUnlockSettings(studentId) {
  if (!_supa || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _unlockDraft = _parseUnlockSettings({});
    return;
  }
  try {
    var result = await _supa.rpc('get_unlock_settings', { p_student_id: studentId });
    _unlockDraft = _parseUnlockSettings(result.data || {});
  } catch(e) {
    _unlockDraft = _parseUnlockSettings({});
    _showDbToast('⚠️ Could not load unlock settings — showing defaults', true);
  }
  _unlockDirty = false;
}

async function _loadTimerSettings(studentId) {
  if (!_supa || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _timerDraft = _parseTimerSettings({});
    return;
  }
  try {
    var result = await _supa.rpc('get_timer_settings', { p_student_id: studentId });
    _timerDraft = _parseTimerSettings(result.data || {});
  } catch(e) {
    _timerDraft = _parseTimerSettings({});
    _showDbToast('⚠️ Could not load timer settings — showing defaults', true);
  }
}

async function _loadA11ySettings(studentId) {
  if (!_supa || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _a11yDraft = _parseA11ySettings({});
    return;
  }
  try {
    var result = await _supa.rpc('get_a11y_settings', { p_student_id: studentId });
    _a11yDraft = _parseA11ySettings(result.data || {});
  } catch(e) {
    _a11yDraft = _parseA11ySettings({});
    _showDbToast('⚠️ Could not load accessibility settings — showing defaults', true);
  }
}

function _unitNames() {
  // Fallback labels for 10 units
  return [
    'Basic Fact Strategies','Place Value','Addition & Subtraction',
    'Subtraction','Multiplication','Division',
    'Fractions','Decimals','Geometry','Measurement',
  ];
}

// ── Access Controls — mutation helpers ───────────────────────────────────

function _dbToggleFreeMode() {
  _unlockDraft.freeMode = !_unlockDraft.freeMode;
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleUnitUnlock(unitIdx) {
  var idx = _unlockDraft.units.indexOf(unitIdx);
  if (idx === -1) { _unlockDraft.units.push(unitIdx); }
  else { _unlockDraft.units.splice(idx, 1); }
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleLessonUnlock(unitIdx, lessonIdx) {
  var key = unitIdx + '_' + lessonIdx;
  if (_unlockDraft.lessons[key]) { delete _unlockDraft.lessons[key]; }
  else { _unlockDraft.lessons[key] = true; }
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleLessonDrawer(unitIdx) {
  _activeDrawerUnit = (_activeDrawerUnit === unitIdx) ? -1 : unitIdx;
  _reRenderUnlock();
}

function _reRenderUnlock() {
  var wrap = document.getElementById('db-unlock-wrap');
  if (wrap) wrap.innerHTML = _renderUnlockInner();
}

async function _dbSaveUnlock() {
  var btn  = document.getElementById('db-unlock-save-btn');
  var msg  = document.getElementById('db-unlock-msg');
  if (!_supa) { if (msg) msg.textContent = 'Not connected.'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try {
    var result = await _supa.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    if (result.error) throw result.error;
    _unlockDirty = false;
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed — check connection.'; }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
}

async function _dbRelockAll() {
  if (!confirm('Remove all unit and lesson unlocks for this student?')) return;
  _unlockDraft = _parseUnlockSettings({ freeMode: false, units: [], lessons: {} });
  _unlockDirty = false;
  _activeDrawerUnit = -1;
  if (!_supa) { _reRenderUnlock(); return; }
  try {
    await _supa.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#37474f'; msg.textContent = '🔒 All locks restored.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) { /* silently ignore — draft was already reset */ }
  _reRenderUnlock();
}

async function _dbFullReset() {
  if (!confirm('DELETE all quiz scores, mastery data, and streak for this student? This cannot be undone.')) return;
  if (!_supa) return;
  try {
    var result = await _supa.rpc('reset_student_data', { p_student_id: _activeId });
    if (result.error) throw result.error;
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '🗑 Student data cleared.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 3000);
  } catch(e) {
    var msg2 = document.getElementById('db-unlock-msg');
    if (msg2) { msg2.style.color = '#c62828'; msg2.textContent = '❌ Reset failed.'; }
  }
}

// ── Access Controls — render ──────────────────────────────────────────────

function _renderUnlockInner() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  if (isMock) {
    return '<p class="db-empty">Unlock settings require a student profile connected to a parent account.</p>';
  }
  var fm = _unlockDraft.freeMode;
  var html = '';

  // Free Mode toggle
  html += '<div class="db-toggle-row">'
    + '<div><strong>🌟 Free Mode</strong><br>'
    + '<span class="db-toggle-sub">Unlock all units and lessons at once</span></div>'
    + '<button class="db-toggle-btn' + (fm ? ' db-toggle-on' : '') + '" data-action="_dbToggleFreeMode">'
    + (fm ? 'ON' : 'OFF') + '</button>'
    + '</div>';

  // Unit cards grid
  html += '<div class="db-unit-grid"' + (fm ? ' style="opacity:.5;pointer-events:none"' : '') + '>';
  _UNITS_META.forEach(function(u, i) {
    var unlocked = _isUnitUnlockedInDraft(_unlockDraft, i);
    html += '<div class="db-unit-card' + (unlocked ? ' db-unit-unlocked' : '') + '">'
      + '<div class="db-unit-card-top">'
      + '<span class="db-unit-num">Unit ' + (i+1) + '</span>'
      + '<button class="db-toggle-btn db-toggle-sm' + (unlocked ? ' db-toggle-on' : '') + '" data-action="_dbToggleUnitUnlock" data-arg="' + i + '">'
      + (unlocked ? 'ON' : 'OFF') + '</button>'
      + '</div>'
      + '<div class="db-unit-name">' + _esc(u.name) + '</div>'
      + '<button class="db-unit-lessons-link" data-action="_dbToggleLessonDrawer" data-arg="' + i + '">'
      + 'Manage lessons ' + (_activeDrawerUnit === i ? '▲' : '▼') + '</button>'
      + '</div>';

    // Lesson drawer — spans full grid width after card row
    if (_activeDrawerUnit === i) {
      html += '</div><div class="db-lesson-drawer">';
      u.lessons.forEach(function(lName, li) {
        var lu = _isLessonUnlockedInDraft(_unlockDraft, i, li);
        html += '<div class="db-lesson-row">'
          + '<span class="db-lesson-name">' + _esc(lName) + '</span>'
          + '<button class="db-toggle-btn db-toggle-sm' + (lu ? ' db-toggle-on' : '') + '" data-action="_dbToggleLessonUnlock" data-arg="' + i + '" data-arg2="' + li + '">'
          + (lu ? 'ON' : 'OFF') + '</button>'
          + '</div>';
      });
      html += '</div><div class="db-unit-grid" style="margin-top:0">';
    }
  });
  html += '</div>'; // close db-unit-grid

  // Save + Relock + Full Reset
  html += '<div id="db-unlock-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns">'
    + '<button id="db-unlock-save-btn" class="db-ctrl-save" data-action="_dbSaveUnlock">Save Changes</button>'
    + '<button class="db-ctrl-relock" data-action="_dbRelockAll">🔒 Re-lock All</button>'
    + '<button class="db-ctrl-reset" data-action="_dbFullReset">🗑 Full Reset</button>'
    + '</div>';

  return html;
}

function _renderUnlockSection() {
  return '<section class="db-section" id="db-unlock-section">'
    + '<h2 class="db-sec-h">🔓 Access Controls</h2>'
    + '<div id="db-unlock-wrap">' + _renderUnlockInner() + '</div>'
    + '</section>';
}

// ── Timer Settings section ────────────────────────────────────────────────

async function _dbSaveTimer() {
  var msg = document.getElementById('db-timer-msg');
  if (!_supa) { if (msg) msg.textContent = 'Not connected.'; return; }
  try {
    var result = await _supa.rpc('update_timer_settings', {
      p_student_id: _activeId,
      p_settings:   _timerDraft,
    });
    if (result.error) throw result.error;
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed.'; }
  }
}

function _dbAdjustTimer(type, delta) {
  var key = type === 'final' ? 'finalSecs' : type === 'unit' ? 'unitSecs' : 'lessonSecs';
  var cur = _timerDraft[key];
  var newV;
  if (delta > 0) { newV = cur < 60 ? Math.min(60, cur + 1) : cur + 60; }
  else            { newV = cur <= 60 ? Math.max(1, cur - 1) : cur - 60; }
  _timerDraft[key] = Math.min(7200, Math.max(1, newV));
  var el = document.getElementById('db-timer-' + type + '-val');
  if (el) el.textContent = _dbTimerLbl(_timerDraft[key]);
}

function _dbTimerLbl(s) {
  if (s < 60) return s + ' sec';
  var m = Math.floor(s / 60), r = s % 60;
  return r ? m + 'm ' + r + 's' : m + (m === 1 ? ' min' : ' mins');
}

function _dbToggleTimer() {
  _timerDraft.enabled = !_timerDraft.enabled;
  var el = document.getElementById('db-timer-toggle-btn');
  if (el) {
    el.textContent = _timerDraft.enabled ? 'ON' : 'OFF';
    el.className = 'db-toggle-btn' + (_timerDraft.enabled ? ' db-toggle-on' : '');
  }
  var controls = document.getElementById('db-timer-controls');
  if (controls) controls.style.display = _timerDraft.enabled ? '' : 'none';
}

function _timerRow(type, label, secs) {
  return '<div class="db-timer-row">'
    + '<span class="db-timer-lbl">' + label + '</span>'
    + '<div class="db-timer-adj">'
    + '<button class="db-adj-btn" data-action="_dbAdjustTimer" data-arg="' + type + '" data-arg2="-1">−</button>'
    + '<span id="db-timer-' + type + '-val" class="db-timer-val">' + _dbTimerLbl(secs) + '</span>'
    + '<button class="db-adj-btn" data-action="_dbAdjustTimer" data-arg="' + type + '" data-arg2="1">+</button>'
    + '</div></div>';
}

function _renderTimerSection() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  var inner = isMock
    ? '<p class="db-empty">Timer settings require a connected student profile.</p>'
    : '<div class="db-toggle-row">'
        + '<div><strong>⏱ Quiz Timer</strong></div>'
        + '<button id="db-timer-toggle-btn" class="db-toggle-btn' + (_timerDraft.enabled ? ' db-toggle-on' : '') + '" data-action="_dbToggleTimer">'
        + (_timerDraft.enabled ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div id="db-timer-controls" style="' + (_timerDraft.enabled ? '' : 'display:none') + '">'
        + _timerRow('lesson', 'Lesson Quiz', _timerDraft.lessonSecs)
        + _timerRow('unit',   'Unit Quiz',   _timerDraft.unitSecs)
        + _timerRow('final',  'Final Test',  _timerDraft.finalSecs)
        + '</div>'
        + '<div id="db-timer-msg" class="db-ctrl-msg"></div>'
        + '<div class="db-ctrl-btns">'
        + '<button class="db-ctrl-save" data-action="_dbSaveTimer">Save Timer Settings</button>'
        + '</div>';
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">⏱ Quiz Timer</h2>'
    + inner + '</section>';
}

// ── Accessibility section ─────────────────────────────────────────────────

async function _dbSaveA11y() {
  var msg = document.getElementById('db-a11y-msg');
  if (!_supa) { if (msg) msg.textContent = 'Not connected.'; return; }
  try {
    var result = await _supa.rpc('update_a11y_settings', {
      p_student_id: _activeId,
      p_settings:   _a11yDraft,
    });
    if (result.error) throw result.error;
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed.'; }
  }
}

function _dbToggleA11y(key) {
  _a11yDraft[key] = !_a11yDraft[key];
  var btn = document.getElementById('db-a11y-' + key + '-btn');
  if (btn) {
    btn.textContent = _a11yDraft[key] ? 'ON' : 'OFF';
    btn.className = 'db-toggle-btn' + (_a11yDraft[key] ? ' db-toggle-on' : '');
  }
}

function _renderA11ySection() {
  var _a11yCfg = (function(){ try{ return JSON.parse(localStorage.getItem('wb_a11y')||'{}'); }catch(e){ return {}; }})();
  var _cbOn  = !!_a11yCfg.colorblind;
  var _rmOn  = !!_a11yCfg.reduceMotion;
  var _tsOn  = !!_a11yCfg.textSelect;
  var _fcOn  = !!_a11yCfg.focus;
  var _srOn  = !!_a11yCfg.screenreader;
  var inner =
    '<div class="db-toggle-row">'
      + '<div><strong>Colorblind-friendly answers</strong><br><span class="db-toggle-sub">Adds \u2713/\u2717 symbols and border patterns to quiz answers (not just color)</span></div>'
      + '<button class="db-toggle-btn' + (_cbOn ? ' db-toggle-on' : '') + '" data-action="toggleA11y" data-arg="colorblind">' + (_cbOn ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div class="db-toggle-row">'
      + '<div><strong>Reduce motion</strong><br><span class="db-toggle-sub">Turns off slide animations, bouncing, and transitions</span></div>'
      + '<button class="db-toggle-btn' + (_rmOn ? ' db-toggle-on' : '') + '" data-action="toggleA11y" data-arg="reduceMotion">' + (_rmOn ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div class="db-toggle-row">'
      + '<div><strong>Text selection</strong><br><span class="db-toggle-sub">Allows selecting quiz question and answer text (helpful for dyslexia tools)</span></div>'
      + '<button class="db-toggle-btn' + (_tsOn ? ' db-toggle-on' : '') + '" data-action="toggleA11y" data-arg="textSelect">' + (_tsOn ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div class="db-toggle-row">'
      + '<div><strong>Focus indicators</strong><br><span class="db-toggle-sub">Shows visible outlines when navigating with a keyboard</span></div>'
      + '<button class="db-toggle-btn' + (_fcOn ? ' db-toggle-on' : '') + '" data-action="toggleA11y" data-arg="focus">' + (_fcOn ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div class="db-toggle-row">'
      + '<div><strong>Screen reader support</strong><br><span class="db-toggle-sub">Adds descriptive labels and live announcements for VoiceOver / TalkBack</span></div>'
      + '<button class="db-toggle-btn' + (_srOn ? ' db-toggle-on' : '') + '" data-action="toggleA11y" data-arg="screenreader">' + (_srOn ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div class="db-toggle-row">'
      + '<div><strong>Aa Large Text</strong><br><span class="db-toggle-sub">Increases font size for the student</span></div>'
      + '<button id="db-a11y-largeText-btn" class="db-toggle-btn' + (_a11yDraft.largeText ? ' db-toggle-on' : '') + '" data-action="_dbToggleA11y" data-arg="largeText">' + (_a11yDraft.largeText ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div class="db-toggle-row">'
      + '<div><strong>&#9681; High Contrast</strong><br><span class="db-toggle-sub">Increases color contrast for readability</span></div>'
      + '<button id="db-a11y-highContrast-btn" class="db-toggle-btn' + (_a11yDraft.highContrast ? ' db-toggle-on' : '') + '" data-action="_dbToggleA11y" data-arg="highContrast">' + (_a11yDraft.highContrast ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div id="db-a11y-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" data-action="_dbSaveA11y">Save Accessibility</button></div>';
  return '<section class="db-section"><h2 class="db-sec-h">&#9855; Accessibility</h2>' + inner + '</section>';
}

// ── Change PIN section ────────────────────────────────────────────────────

async function _dbHashPin(pin) {
  var enc  = new TextEncoder();
  var key  = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  var salt = enc.encode('mymathroots_pin_v2');
  var bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', hash:'SHA-256', salt:salt, iterations:100000 }, key, 256
  );
  return Array.from(new Uint8Array(bits)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
}

async function _dbSavePin() {
  var inp1 = document.getElementById('db-pin-inp1');
  var inp2 = document.getElementById('db-pin-inp2');
  var msg  = document.getElementById('db-pin-msg');
  var newPin = inp1.value.trim();
  if (newPin.length < 4) { msg.style.color='#c62828'; msg.textContent='PIN must be at least 4 digits.'; return; }
  if (newPin !== inp2.value.trim()) { msg.style.color='#c62828'; msg.textContent='PINs do not match.'; return; }
  if (!_supa) { msg.textContent='Not connected.'; return; }
  msg.style.color='#546e7a'; msg.textContent='Saving…';
  try {
    var hash = await _dbHashPin(newPin);
    var result = await _supa.rpc('update_pin_hash', { p_hash: hash });
    if (result.error) throw result.error;
    inp1.value = ''; inp2.value = '';
    msg.style.color='#2e7d32'; msg.textContent='✅ PIN updated — takes effect on next device sync.';
    setTimeout(function(){ msg.textContent=''; }, 4000);
  } catch(e) {
    msg.style.color='#c62828'; msg.textContent='❌ Save failed — check connection.';
  }
}

function _renderPinSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🔑 Change Parent PIN</h2>'
    + '<p class="db-sec-body">Your PIN is used as the local escape hatch on student devices. Changes sync to all devices on next sign-in.</p>'
    + '<div class="db-form-row"><label class="db-form-lbl">New PIN</label>'
    + '<input id="db-pin-inp1" type="password" inputmode="numeric" class="db-form-inp" placeholder="New PIN (min 4 digits)"></div>'
    + '<div class="db-form-row"><label class="db-form-lbl">Confirm PIN</label>'
    + '<input id="db-pin-inp2" type="password" inputmode="numeric" class="db-form-inp" placeholder="Repeat PIN"></div>'
    + '<div id="db-pin-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" data-action="_dbSavePin">Update PIN</button></div>'
    + '</section>';
}

// ── Reminders section ─────────────────────────────────────────────────────

var _REMINDERS_KEY = 'wb_reminders';

function _loadReminders() {
  try { return JSON.parse(localStorage.getItem(_REMINDERS_KEY)) || {}; } catch(e) { return {}; }
}

function _saveReminders(obj) {
  localStorage.setItem(_REMINDERS_KEY, JSON.stringify(obj));
}

function _renderRemindersSection() {
  var r   = _loadReminders();
  var on  = r.enabled === true;
  var t   = r.time || '15:30';
  var sup = 'Notification' in window;
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🔔 Reminders</h2>'
    + '<p class="db-sec-body">Daily practice reminders shown when this device\'s browser is open.</p>'
    + (sup ? '' : '<p style="color:#c62828;font-size:.82rem;margin-bottom:8px">⚠️ Notifications not supported on this browser.</p>')
    + '<div class="db-toggle-row">'
    + '<div><strong>Daily reminder</strong><br><span class="db-toggle-sub">Asks ' + t + ' each day</span></div>'
    + '<button id="db-push-btn" class="db-toggle-btn' + (on ? ' db-toggle-on' : '') + '" data-action="_dbTogglePush">'
    + (on ? 'ON' : 'OFF') + '</button>'
    + '</div>'
    + '<div id="db-push-time-row" style="' + (on ? '' : 'display:none') + '">'
    + '<div class="db-form-row" style="margin-top:10px"><label class="db-form-lbl">Reminder time</label>'
    + '<input id="db-push-time" type="time" class="db-form-inp" value="' + t + '" style="max-width:140px"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" data-action="_dbSaveReminderTime">Save Time</button></div>'
    + '</div>'
    + '<div id="db-push-msg" class="db-ctrl-msg"></div>'
    + '</section>';
}

function _dbInitPushBtn() {
  var btn = document.getElementById('db-push-btn');
  if (!btn) return;
  if (!('Notification' in window)) {
    btn.textContent = 'Not supported'; btn.disabled = true;
    return;
  }
  var r = _loadReminders();
  if (r.enabled && Notification.permission === 'granted') {
    btn.textContent = 'ON'; btn.classList.add('db-toggle-on');
  } else if (r.enabled && Notification.permission !== 'granted') {
    // Permission was revoked — clear saved state
    _saveReminders(Object.assign(r, { enabled: false }));
    btn.textContent = 'OFF'; btn.classList.remove('db-toggle-on');
    var tr = document.getElementById('db-push-time-row');
    if (tr) tr.style.display = 'none';
  } else {
    btn.textContent = 'OFF';
  }
}

async function _dbTogglePush() {
  var btn = document.getElementById('db-push-btn');
  var msg = document.getElementById('db-push-msg');
  var tr  = document.getElementById('db-push-time-row');
  if (!('Notification' in window)) {
    if (msg) { msg.style.color='#c62828'; msg.textContent='Not supported on this browser.'; }
    return;
  }
  var r  = _loadReminders();
  var on = r.enabled === true && Notification.permission === 'granted';
  if (on) {
    // Turn off
    _saveReminders(Object.assign(r, { enabled: false }));
    if (btn) { btn.textContent = 'OFF'; btn.classList.remove('db-toggle-on'); }
    if (tr)  tr.style.display = 'none';
    if (msg) { msg.style.color='#546e7a'; msg.textContent='Reminders disabled.'; }
    setTimeout(function() { if (msg) msg.textContent=''; }, 2000);
  } else {
    // Turn on — request permission first
    if (msg) { msg.style.color='#546e7a'; msg.textContent='Requesting permission…'; }
    var perm = await Notification.requestPermission();
    if (perm === 'granted') {
      var t = r.time || '15:30';
      _saveReminders(Object.assign(r, { enabled: true, time: t }));
      if (btn) { btn.textContent = 'ON'; btn.classList.add('db-toggle-on'); }
      if (tr)  tr.style.display = '';
      if (msg) { msg.style.color='#2e7d32'; msg.textContent='✅ Reminders on — will show at ' + t + ' when browser is open.'; }
    } else {
      if (btn) { btn.textContent = 'OFF'; btn.classList.remove('db-toggle-on'); }
      if (msg) { msg.style.color='#c62828'; msg.textContent='Permission denied — enable in browser settings.'; }
    }
    setTimeout(function() { if (msg) msg.textContent=''; }, 4000);
  }
}

function _dbSaveReminderTime() {
  var inp = document.getElementById('db-push-time');
  var msg = document.getElementById('db-push-msg');
  if (!inp) return;
  var t = inp.value || '15:30';
  var r = _loadReminders();
  _saveReminders(Object.assign(r, { time: t }));
  // Update the subtitle in toggle row
  var sub = document.querySelector('#db-push-btn')?.previousElementSibling?.querySelector('.db-toggle-sub');
  if (sub) sub.textContent = 'Asks ' + t + ' each day';
  if (msg) { msg.style.color='#2e7d32'; msg.textContent='✅ Reminder time saved.'; }
  setTimeout(function() { if (msg) msg.textContent=''; }, 2000);
}

// ── Change Password section ───────────────────────────────────────────────

async function _dbSavePassword() {
  var inp = document.getElementById('db-pw-inp');
  var msg = document.getElementById('db-pw-msg');
  var pw  = inp.value;
  if (pw.length < 8) { msg.style.color='#c62828'; msg.textContent='Password must be at least 8 characters.'; return; }
  if (!_supa) { msg.textContent='Not connected.'; return; }
  msg.style.color='#546e7a'; msg.textContent='Saving…';
  var result = await _supa.auth.updateUser({ password: pw });
  if (result.error) { msg.style.color='#c62828'; msg.textContent='❌ ' + result.error.message; return; }
  inp.value = '';
  msg.style.color = '#2e7d32'; msg.textContent = '✅ Password changed!';
  setTimeout(function(){ msg.textContent=''; }, 2000);
}

function _renderPasswordSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🔒 Change Password</h2>'
    + '<div class="db-form-row"><label class="db-form-lbl">New Password</label>'
    + '<input id="db-pw-inp" type="password" class="db-form-inp" placeholder="Min 8 characters" autocomplete="new-password"></div>'
    + '<div id="db-pw-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" data-action="_dbSavePassword">Change Password</button></div>'
    + '</section>';
}

// ── Feedback section ──────────────────────────────────────────────────────

function _dbSetFbRating(v) {
  if (v === _dbFbRating) v = 0;
  _dbFbRating = v;
  for (var i = 1; i <= 5; i++) {
    var s = document.getElementById('db-fb-star-' + i);
    if (s) { s.textContent = i <= v ? '★' : '☆'; s.style.color = i <= v ? '#f1c40f' : ''; }
  }
}

function _dbSetFbCat(cat) {
  if (cat === _dbFbCategory) { _dbFbCategory = ''; }
  else { _dbFbCategory = cat; }
  document.querySelectorAll('.db-fb-cat').forEach(function(b) {
    b.classList.toggle('active', b.dataset.cat === _dbFbCategory);
  });
}

async function _dbSubmitFeedback() {
  var msg = document.getElementById('db-fb-msg');
  if (!_dbFbRating) { msg.style.color='#c62828'; msg.textContent='Please select a star rating.'; return; }
  if (!_dbFbCategory) { msg.style.color='#c62828'; msg.textContent='Please select a category.'; return; }
  if (!_supa) { msg.textContent='Not connected.'; return; }
  var comment = (document.getElementById('db-fb-comment').value || '').slice(0, 500);
  msg.style.color='#546e7a'; msg.textContent='Sending…';
  try {
    var user = (await _supa.auth.getUser()).data.user;
    var result = await _supa.from('feedback').insert({
      rating: _dbFbRating, category: _dbFbCategory,
      comment: comment || null,
      user_id: user ? user.id : null,
    });
    if (result.error) throw result.error;
    _dbFbRating = 0; _dbFbCategory = '';
    document.getElementById('db-fb-comment').value = '';
    document.querySelectorAll('.db-fb-star').forEach(function(s){ s.textContent='☆'; s.style.color=''; });
    document.querySelectorAll('.db-fb-cat').forEach(function(b){ b.classList.remove('active'); });
    msg.style.color='#2e7d32'; msg.textContent='✅ Thank you for your feedback!';
    setTimeout(function(){ msg.textContent=''; }, 3000);
  } catch(e) {
    msg.style.color='#c62828'; msg.textContent='❌ Could not send — check connection.';
  }
}

function _renderFeedbackSection() {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<button id="db-fb-star-' + i + '" class="db-fb-star" data-action="_dbSetFbRating" data-arg="' + i + '">☆</button>';
  }
  var cats = ['General','Bug Report','Feature Request','Content Issue'];
  var catBtns = cats.map(function(c) {
    return '<button class="db-fb-cat" data-cat="' + _esc(c) + '" data-action="_dbSetFbCat" data-arg="' + _esc(c) + '">' + _esc(c) + '</button>';
  }).join('');
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">💬 Send Feedback</h2>'
    + '<div class="db-fb-stars">' + stars + '</div>'
    + '<div class="db-fb-cats">' + catBtns + '</div>'
    + '<textarea id="db-fb-comment" class="db-fb-comment" maxlength="500" rows="3" placeholder="Comments (optional)"></textarea>'
    + '<div id="db-fb-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" data-action="_dbSubmitFeedback">Send Feedback</button></div>'
    + '</section>';
}

// ── Changelog section ─────────────────────────────────────────────────────

function _renderChangelogSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">📋 What\'s New</h2>'
    + '<div style="max-height:320px;overflow-y:auto">'
    + _changelogHtml()
    + '</div></section>';
}

function _changelogHtml() {
  return '<div class="mb-14"><div class="cl-version-brand">v6.0 — Current</div><ul class="list-body">'
    + '<li><strong>Student Profiles & PIN Login</strong> — Each child gets their own profile with a custom avatar and 4-digit PIN. Switch between students instantly from any screen. Parents share a Family Code so kids can log in without needing the parent\'s email or password.</li>'
    + '<li><strong>Parent Dashboard</strong> — A complete progress hub for parents. See weekly quiz scores, accuracy trends, streak data, and time spent by unit — all in one place. Manage access, timers, and accessibility settings remotely from any device.</li>'
    + '<li><strong>AI Hints</strong> — When a student gets a question wrong, a friendly AI tutor (powered by Gemini) gives a short, personalised explanation in plain English. Students can also tap a Hint button mid-quiz for an extra nudge without revealing the answer.</li>'
    + '<li><strong>AI Progress Reports</strong> — Generate a detailed, personalised progress report for parents with one tap. The report covers overall accuracy, strengths, areas to work on, study habits, home activity suggestions, and a priority goal for the week. Available every 14 days.</li>'
    + '<li><strong>Balanced Final Test</strong> — A new final test mode that guarantees 5 questions from every unit, so no topic is skipped. Choose between the original Mastery test or the new Balanced test from the home screen.</li>'
    + '<li><strong>Premium Swipe Login</strong> — The login screen now has a smooth, finger-following swipe carousel to choose between Student and Parent sign-in — no more tap-only switching.</li>'
    + '<li><strong>Security Overhaul</strong> — PIN checking is now done entirely on the server with automatic lockout after failed attempts. Student quiz data is isolated per profile. All AI endpoints have rate limiting, input sanitization, and strict CORS.</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.34 — v5.27</div><ul class="list-body">'
    + '<li><strong>Glass UI</strong> — Complete visual overhaul with frosted-glass cards, transparent header, gradient buttons, and a new app icon across all screens.</li>'
    + '<li><strong>Dark Mode</strong> — Full dark mode support with auto-detection from system settings. Toggle manually in Settings → Appearance.</li>'
    + '<li><strong>Push Notifications</strong> — Opt-in daily practice reminders and streak celebration alerts ("5-day streak! 🔥").</li>'
    + '<li><strong>Faster Loading</strong> — JavaScript split into a separate cacheable file — the main page loads 67% faster on repeat visits.</li>'
    + '<li><strong>Content Quality</strong> — 500+ answer-choice improvements across Units 2–8. "Carry/borrow" replaced with the correct term "regrouping" throughout. 19 spiral review questions added to connect earlier units to later ones.</li>'
    + '<li><strong>Pass Threshold</strong> — Unit quiz pass requirement lowered from 100% to 80% — more encouraging, still rigorous.</li>'
    + '<li><strong>Final Test Timer</strong> — Separate configurable timer for the Final Test. Tap the timer display to enter a custom time.</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.22 — v5.13</div><ul class="list-body">'
    + '<li><strong>Google Sign-In</strong> — Sign in with your Google account in one tap.</li>'
    + '<li><strong>Spotlight Tutorial</strong> — Interactive guided tour on first launch walks through every feature.</li>'
    + '<li><strong>Cloudflare CAPTCHA</strong> — Protects sign-up from bots.</li>'
    + '<li><strong>Session Splash Screen</strong> — Animated app intro on launch.</li>'
    + '<li><strong>Feedback</strong> — Send a star rating and message directly from settings.</li>'
    + '<li><strong>Parent Controls</strong> — Lock/unlock units and lessons, set quiz timers, change PIN, manage accessibility options.</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.10 — v1.0</div><ul class="list-body">'
    + '<li><strong>10 Math Units</strong> — Full Texas TEKS Grade 2 curriculum: Basic Facts, Place Value, Addition & Subtraction (to 200 and 1,000), Money, Data Analysis, Measurement & Time, Fractions, Geometry, and Multiplication & Division.</li>'
    + '<li><strong>35 Lessons</strong> — Every lesson includes key concept points, three worked examples with animated visuals, three warm-up practice problems, and a randomized quiz bank of 25–30 questions.</li>'
    + '<li><strong>900+ Quiz Questions</strong> — Across all lessons and unit quizzes, with educational explanations after every answer.</li>'
    + '<li><strong>Spaced Repetition</strong> — The app tracks which question types a student struggles with and shows them more often.</li>'
    + '<li><strong>Streak Tracker</strong> — Daily practice streak counter with a longest-streak record.</li>'
    + '<li><strong>Offline Support</strong> — Full PWA with service worker — works without an internet connection once loaded.</li>'
    + '<li><strong>Installable</strong> — Add to Home Screen on iOS and Android for a native app feel.</li>'
    + '</ul></div>';
}

function renderDashboard() {
  var root = document.getElementById('db-root');
  if (!root) return;

  var student = _students[_activeId];
  if (!student) {
    root.innerHTML = '<p class="db-empty">No student data found.</p>';
    return;
  }

  var scores   = student.SCORES  || [];
  var mastery  = student.MASTERY || {};
  var streak   = student.STREAK  || { current: 0 };
  var appTime  = student.APP_TIME || { totalSecs: 0, sessions: 0, dailySecs: {} };

  // Build qTextMap for review queue
  var qTextMap = {};
  scores.forEach(function(s) {
    if (s.answers) s.answers.forEach(function(a) {
      if (a.t && !qTextMap['_' + a.t.length]) qTextMap['_' + a.t.length] = a.t;
    });
  });

  var stats    = _computeOverallStats(scores, streak, appTime);
  var skills   = _computeSkillBreakdown(scores, _unitNames());
  var weak     = _computeWeakAreas(skills);
  var activity = _computeActivityData(scores, 7);
  var review   = _computeReviewQueue(mastery, qTextMap);

  _prStatsHtml  = '';
  _prReportText = '';

  // Reset header title in case we came back from AI report
  var hdrTitle = document.querySelector('.db-header-title');
  if (hdrTitle) hdrTitle.textContent = '📊 Parent Dashboard';

  // Show "Go to [name]'s App" button in header
  var appBtn = document.getElementById('db-app-btn');
  if (appBtn) {
    appBtn.textContent = '▶ ' + _esc(student.name) + '\u2019s App';
    appBtn.style.display = '';
  }

  root.innerHTML =
    _renderStudentSelector(_students, _activeId) +
    '<h1 class="db-student-name">' + _esc(student.name) + '</h1>' +
    _renderManageProfiles() +
    _renderWeeklySnapshot(scores, appTime, streak) +
    _renderRootSystem(scores, _unitNames()) +
    _renderOverview(stats) +
    _renderTime(scores, appTime) +
    _renderRecentQuizzes(scores) +
    _renderSkills(skills) +
    _renderWeak(weak) +
    _renderPracticeSpotlight(mastery, scores) +
    _renderReview(review) +
    _renderActivity(activity) +
    _renderUnlockSection() +
    _renderTimerSection() +
    _renderA11ySection() +
    _renderRemindersSection() +
    _renderPasswordSection() +
    _renderFeedbackSection() +
    _renderChangelogSection();

  // Render AI report footer
  var footerEl = document.getElementById('db-ai-footer');
  if (footerEl) footerEl.innerHTML = _genReportFooter();
}

function switchStudent(id) {
  if (_unlockDirty) {
    if (!confirm('You have unsaved unlock changes. Discard them?')) return;
  }
  _activeId = id;
  _unlockDirty = false;
  _activeDrawerUnit = -1;
  // If this is a managed profile whose scores haven't loaded yet, fetch them now
  if (id !== 'local' && _students[id] && !_students[id]._scoresLoaded) {
    _loadManagedStudentScores(id);
  }
  Promise.all([
    _loadUnlockSettings(id),
    _loadTimerSettings(id),
    _loadA11ySettings(id),
  ]).then(function() { renderDashboard(); });
}

function dbSignOut() {
  // Nuclear clear — wipes all sessions, student profiles, and local progress.
  localStorage.clear();
  sessionStorage.clear();
  // Best-effort graceful Supabase sign-out (fire-and-forget)
  if (typeof _supa !== 'undefined' && _supa) {
    _supa.auth.signOut().catch(function(){});
  }
  // SPA navigation — no page reload needed; SIGNED_OUT event in auth.js shows login screen
  show('login-screen');
  if (typeof _lsInitCarousel === 'function') _lsInitCarousel();
  if (typeof _lsRenderStudentCard === 'function') _lsRenderStudentCard();
}

// ── Manage Profiles ───────────────────────────────────────────────────────

async function _fetchManagedProfiles() {
  if (typeof _supa === 'undefined' || !_supa) return;
  try {
    var result = await Promise.race([
      _supa
        .from('student_profiles')
        .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, username, updated_at, report_last_generated')
        .order('created_at', { ascending: true }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;
    _managedProfiles = result.data || [];
    localStorage.setItem('mmr_family_profiles',
      JSON.stringify(_managedProfiles.map(function(p) {
        return { id: p.id, display_name: p.display_name, age: p.age,
          avatar_emoji: p.avatar_emoji, avatar_color_from: p.avatar_color_from,
          avatar_color_to: p.avatar_color_to, username: p.username, pin_hash: '' };
      }))
    );
  } catch(e) {
    try { _managedProfiles = JSON.parse(localStorage.getItem('mmr_family_profiles') || '[]'); }
    catch(e2) { _managedProfiles = []; }
  }
}

function _renderManageProfiles() {
  if (!_managedProfiles.length) {
    return '<section class="db-section db-profiles-section" id="db-manage-profiles-section">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      + '<h2 class="db-sec-h" style="margin:0">&#x1F464; Manage Profiles</h2>'
      + '<button class="db-add-student-btn" data-action="openAddStudentSheet">+ Add Student</button>'
      + '</div>'
      + '<p class="db-empty">No student profiles yet. Add your first student above.</p>'
      + '</section>';
  }

  var rows = _managedProfiles.map(function(p) {
    var lastActive = p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never';
    return '<div class="db-profile-row">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,' + _dbValidColor(p.avatar_color_from) + ',' + _dbValidColor(p.avatar_color_to) + ');display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">' + _esc(p.avatar_emoji) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-weight:700;font-size:.88rem;color:#263238">' + _esc(p.display_name) + (p.age ? ' <span style="font-weight:400;color:#90a4ae;font-size:.75rem">Age ' + _esc(String(p.age)) + '</span>' : '') + '</div>'
      + '<div style="font-size:.72rem;color:#90a4ae">Last active ' + _esc(lastActive) + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-shrink:0">'
      + '<button class="db-profile-edit-btn" data-action="openEditProfileSheet" data-arg="' + _esc(p.id) + '">Edit</button>'
      + '<button class="db-profile-pin-btn" data-action="openPinResetSheet" data-arg="' + _esc(p.id) + '">PIN</button>'
      + '</div>'
      + '</div>';
  }).join('');

  var familyCodeHtml = _parentFamilyCode
    ? '<div style="margin-bottom:10px;padding:8px 12px;background:#e8f5e9;border-radius:8px;font-size:.8rem;color:#2e7d32">'
      + '&#x1F511; <strong>Family Code:</strong> <span style="font-family:monospace;letter-spacing:1px">' + _esc(_parentFamilyCode) + '</span>'
      + '<span style="color:#66bb6a;margin-left:8px">— share this with your child\'s device to link profiles</span>'
      + '</div>'
    : '';

  return '<section class="db-section db-profiles-section" id="db-manage-profiles-section">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    + '<h2 class="db-sec-h" style="margin:0">&#x1F464; Manage Profiles</h2>'
    + '<button class="db-add-student-btn" data-action="openAddStudentSheet">+ Add Student</button>'
    + '</div>'
    + familyCodeHtml
    + '<div class="db-profiles-list">' + rows + '</div>'
    + '</section>';
}

function openPinResetSheet(studentId) {
  _pinResetStudentId = studentId;
  _pinResetBuffer = [];
  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  if (!profile) return;

  var modal = document.getElementById('db-pin-reset-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-pin-reset-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet" id="db-pin-reset-sheet">'
      + '<div class="db-review-head" id="db-pin-reset-head"></div>'
      + '<div class="db-review-body" id="db-pin-reset-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closePinResetSheet(); });
    document.body.appendChild(modal);
  }

  document.getElementById('db-pin-reset-head').innerHTML =
    '<button class="db-review-close" data-action="closePinResetSheet">&#x2715;</button>'
    + '<div class="db-review-title">Reset PIN for ' + _esc(profile.display_name) + '</div>'
    + '<div class="db-review-meta">Enter a new 4-digit PIN</div>';

  var keys = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(function(d) {
    keys += '<button class="db-pin-key" data-action="dbPinKey" data-arg="' + d + '">' + d + '</button>';
  });
  keys += '<div></div>'
    + '<button class="db-pin-key" data-action="dbPinKey" data-arg="0">0</button>'
    + '<button class="db-pin-key db-pin-key-back" data-action="dbPinBack">&#x232B;</button>';

  document.getElementById('db-pin-reset-body').innerHTML =
    '<div id="db-pin-reset-dots" style="display:flex;gap:10px;justify-content:center;margin:16px 0 12px"></div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;padding:0 2px">' + keys + '</div>'
    + '<div id="db-pin-reset-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button id="db-pin-save-btn" data-action="dbPinSave" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Save New PIN</button>';

  _lsDbRenderPinDots();
  modal.classList.add('open');
}

function _lsDbRenderPinDots() {
  var dotsEl = document.getElementById('db-pin-reset-dots');
  if (!dotsEl) return;
  var html = '';
  for (var i = 0; i < 4; i++) {
    html += i < _pinResetBuffer.length
      ? '<div style="width:16px;height:16px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)"></div>'
      : '<div style="width:16px;height:16px;border-radius:50%;background:#f0f4f8;border:2px solid #e0e0e0"></div>';
  }
  dotsEl.innerHTML = html;
}

function dbPinKey(digit) {
  if (_pinResetBuffer.length >= 4) return;
  _pinResetBuffer.push(String(digit));
  _lsDbRenderPinDots();
  if (_pinResetBuffer.length === 4) {
    var btn = document.getElementById('db-pin-save-btn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
  }
}

function dbPinBack() {
  if (!_pinResetBuffer.length) return;
  _pinResetBuffer.pop();
  _lsDbRenderPinDots();
  var btn = document.getElementById('db-pin-save-btn');
  if (btn && _pinResetBuffer.length < 4) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

async function dbPinSave() {
  var msg = document.getElementById('db-pin-reset-msg');
  if (_pinResetBuffer.length < 4) return;
  if (!_supa || !_pinResetStudentId) { if (msg) msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-pin-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    // Server bcrypt-hashes the new PIN and invalidates existing sessions
    var result = await Promise.race([
      _supa.rpc('reset_student_pin', { p_student_id: _pinResetStudentId, p_new_pin: _pinResetBuffer.join('') }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;

    var profile = _managedProfiles.find(function(p) { return p.id === _pinResetStudentId; });
    var profileName = profile ? profile.display_name : 'student';

    closePinResetSheet();
    var toast = document.createElement('div');
    toast.textContent = 'PIN updated for ' + profileName;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#263238;color:#fff;padding:10px 20px;border-radius:50px;font-size:.85rem;z-index:9999;white-space:nowrap';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
  } catch(e) {
    if (msg) msg.textContent = 'Error saving PIN. Try again.';
    if (btn) btn.textContent = 'Save New PIN';
  }
}

function closePinResetSheet() {
  var modal = document.getElementById('db-pin-reset-modal');
  if (modal) modal.classList.remove('open');
  _pinResetBuffer = [];
  _pinResetStudentId = null;
}

function openEditProfileSheet(studentId) {
  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  if (!profile) return;

  var modal = document.getElementById('db-edit-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-edit-profile-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet" id="db-edit-profile-sheet">'
      + '<div class="db-review-head" id="db-edit-profile-head"></div>'
      + '<div class="db-review-body" id="db-edit-profile-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closeEditProfileSheet(); });
    document.body.appendChild(modal);
  }

  document.getElementById('db-edit-profile-head').innerHTML =
    '<button class="db-review-close" data-action="closeEditProfileSheet">&#x2715;</button>'
    + '<div class="db-review-title">Edit Profile</div>';

  var AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
  var AVATAR_COLORS = {'🦁':'#f59e0b,#f97316','🦋':'#8b5cf6,#ec4899','🐉':'#06b6d4,#3b82f6','🦊':'#ef4444,#f97316','🐬':'#10b981,#0ea5e9','🌟':'#f59e0b,#eab308'};

  document.getElementById('db-edit-profile-body').innerHTML =
    '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Name</label>'
    + '<input id="db-edit-name" type="text" maxlength="20" value="' + _esc(profile.display_name) + '" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="db-edit-age" type="number" min="4" max="18" value="' + _esc(String(profile.age || '')) + '" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Avatar</label>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:16px">'
    + AVATAR_EMOJIS.map(function(e) {
        var colors = AVATAR_COLORS[e] || '#f59e0b,#f97316';
        var isSelected = e === profile.avatar_emoji;
        return '<div id="db-av-' + e.codePointAt(0) + '" data-action="dbEditSelectEmoji" data-arg="' + _esc(e) + '"'
          + ' style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + colors + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:' + (isSelected ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<div id="db-edit-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button data-action="dbEditSave" data-arg="' + _esc(studentId) + '" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer">Save Changes</button>';

  modal.classList.add('open');
}

var _dbEditSelectedEmoji = null;

function dbEditSelectEmoji(emoji) {
  _dbEditSelectedEmoji = emoji;
  ['🦁','🦋','🐉','🦊','🐬','🌟'].forEach(function(e) {
    var el = document.getElementById('db-av-' + e.codePointAt(0));
    if (el) el.style.border = e === emoji ? '3px solid #1565C0' : '3px solid transparent';
  });
}

async function dbEditSave(studentId) {
  var msg = document.getElementById('db-edit-msg');
  var nameInp = document.getElementById('db-edit-name');
  var ageInp  = document.getElementById('db-edit-age');
  if (!nameInp || !msg) return;

  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Name is required.'; return; }
  if (!_supa) { msg.textContent = 'Not connected.'; return; }

  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  var emoji = _dbEditSelectedEmoji || (profile ? profile.avatar_emoji : '🦁');
  var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
  var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
  var ageVal = ageInp ? parseInt(ageInp.value) || null : null;

  try {
    var result = await Promise.race([
      _supa.from('student_profiles').update({
        display_name: name, age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        updated_at: new Date().toISOString(),
      }).eq('id', studentId),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;

    await _fetchManagedProfiles();
    closeEditProfileSheet();
    _reRenderManageProfiles();
  } catch(e) {
    if (msg) msg.textContent = 'Error saving. Try again.';
  }
}

function closeEditProfileSheet() {
  var modal = document.getElementById('db-edit-profile-modal');
  if (modal) modal.classList.remove('open');
  _dbEditSelectedEmoji = null;
}

function openAddStudentSheet() {
  var modal = document.getElementById('db-add-student-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-add-student-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet">'
      + '<div class="db-review-head"><button class="db-review-close" data-action="closeAddStudentSheet">&#x2715;</button>'
      + '<div class="db-review-title">Add Student</div></div>'
      + '<div class="db-review-body" id="db-add-student-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closeAddStudentSheet(); });
    document.body.appendChild(modal);
  }

  window._dbAddPinBuffer = [];
  window._dbAddSelectedEmoji = '🦁';
  var AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
  var AVATAR_COLORS = {'🦁':'#f59e0b,#f97316','🦋':'#8b5cf6,#ec4899','🐉':'#06b6d4,#3b82f6','🦊':'#ef4444,#f97316','🐬':'#10b981,#0ea5e9','🌟':'#f59e0b,#eab308'};

  document.getElementById('db-add-student-body').innerHTML =
    '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Student Name *</label>'
    + '<input id="db-add-name" type="text" maxlength="20" placeholder="e.g. Maya" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="db-add-age" type="number" min="4" max="18" placeholder="e.g. 9" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Avatar</label>'
    + '<div id="db-add-avatars" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">'
    + AVATAR_EMOJIS.map(function(e) {
        var colors = AVATAR_COLORS[e] || '#f59e0b,#f97316';
        return '<div id="db-addav-' + e.codePointAt(0) + '"'
          + ' data-action="dbAddSelectEmoji" data-arg="' + _esc(e) + '"'
          + ' style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + colors + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:' + (e === '🦁' ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Create a 4-digit PIN</label>'
    + '<div id="db-add-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px">'
    + '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>'.repeat(4)
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">'
    + ['1','2','3','4','5','6','7','8','9'].map(function(d){ return '<button data-action="dbAddPinKey" data-arg="' + d + '" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;cursor:pointer">' + d + '</button>'; }).join('')
    + '<div></div>'
    + '<button data-action="dbAddPinKey" data-arg="0" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;cursor:pointer">0</button>'
    + '<button data-action="dbAddPinBack" style="background:#fce4ec;border:1px solid #ffcdd2;border-radius:10px;padding:12px 0;font-size:1rem;color:#c62828;cursor:pointer">&#x232B;</button>'
    + '</div>'
    + '<div id="db-add-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button id="db-add-save-btn" data-action="dbAddSave" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Add Student</button>';

  modal.classList.add('open');
}

function dbAddSelectEmoji(emoji) {
  window._dbAddSelectedEmoji = emoji;
  ['🦁','🦋','🐉','🦊','🐬','🌟'].forEach(function(e) {
    var el = document.getElementById('db-addav-' + e.codePointAt(0));
    if (el) el.style.border = e === emoji ? '3px solid #1565C0' : '3px solid transparent';
  });
}

function dbAddPinKey(digit) {
  if ((window._dbAddPinBuffer || []).length >= 4) return;
  window._dbAddPinBuffer = (window._dbAddPinBuffer || []).concat([String(digit)]);
  var dotsEl = document.getElementById('db-add-dots');
  if (dotsEl) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < window._dbAddPinBuffer.length
        ? '<div style="width:14px;height:14px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)"></div>'
        : '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>';
    }
    dotsEl.innerHTML = html;
  }
  if (window._dbAddPinBuffer.length === 4) {
    var btn = document.getElementById('db-add-save-btn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
  }
}

function dbAddPinBack() {
  window._dbAddPinBuffer = (window._dbAddPinBuffer || []).slice(0, -1);
  var dotsEl = document.getElementById('db-add-dots');
  if (dotsEl) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < window._dbAddPinBuffer.length
        ? '<div style="width:14px;height:14px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)"></div>'
        : '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>';
    }
    dotsEl.innerHTML = html;
  }
  var btn = document.getElementById('db-add-save-btn');
  if (btn && window._dbAddPinBuffer.length < 4) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

async function dbAddSave() {
  var msg = document.getElementById('db-add-msg');
  var nameInp = document.getElementById('db-add-name');
  var ageInp  = document.getElementById('db-add-age');
  if (!nameInp || !msg) return;
  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Name is required.'; return; }
  if ((window._dbAddPinBuffer || []).length < 4) { msg.textContent = 'Enter a 4-digit PIN.'; return; }
  if (!_supa) { msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-add-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    var encoder = new TextEncoder();
    var pinHashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(window._dbAddPinBuffer.join('') + 'mymathroots_pin_salt_2025'));
    var pinHash = Array.from(new Uint8Array(pinHashBuf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');

    var emoji = window._dbAddSelectedEmoji || '🦁';
    var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
    var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
    var ageVal = ageInp ? parseInt(ageInp.value) || null : null;
    var username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'student';

    // Get parent_id from Supabase session
    var sessionResult = await _supa.auth.getUser();
    var parentId = sessionResult && sessionResult.data && sessionResult.data.user ? sessionResult.data.user.id : null;

    if (!parentId) {
      if (msg) msg.textContent = 'Session expired — please sign out and sign in again.';
      if (btn) btn.textContent = 'Add Student';
      return;
    }

    var result = await Promise.race([
      _supa.from('student_profiles').insert({
        parent_id: parentId,
        username: username, display_name: name, age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        pin_hash: pinHash,
      }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (result.error) throw result.error;

    await _fetchManagedProfiles();
    closeAddStudentSheet();
    _reRenderManageProfiles();
  } catch(e) {
    if (msg) msg.textContent = e.message && e.message.includes('unique') ? 'A student with that name already exists.' : 'Error saving. Try again.';
    if (btn) btn.textContent = 'Add Student';
  }
}

function closeAddStudentSheet() {
  var modal = document.getElementById('db-add-student-modal');
  if (modal) modal.classList.remove('open');
  window._dbAddPinBuffer = [];
  window._dbAddSelectedEmoji = '🦁';
}

function _reRenderManageProfiles() {
  var el = document.getElementById('db-manage-profiles-section');
  if (el) el.outerHTML = _renderManageProfiles();
}

// Load quiz scores + progress for a managed (Supabase-backed) student profile.
// Uses the same SECURITY DEFINER RPC as the student PIN login flow.
// Re-renders the dashboard if this student is still active when the data arrives.
function _loadManagedStudentScores(studentId) {
  if (!_supa || !studentId || studentId === 'local') return;
  _supa.rpc('get_student_progress_by_pin', { p_student_id: studentId })
    .then(function(result) {
      if (result.error || !result.data) return;
      var data = result.data;
      var student = _students[studentId];
      if (!student) return;

      // Merge quiz scores into the student object
      var remoteScores = data.scores;
      if (Array.isArray(remoteScores) && remoteScores.length) {
        student.SCORES = remoteScores
          .filter(function(r) {
            return r && typeof r.local_id === 'number' && typeof r.qid === 'string'
              && typeof r.score === 'number' && typeof r.total === 'number'
              && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100;
          })
          .map(function(r) {
            return {
              qid: r.qid, label: String(r.label || ''), type: String(r.type || ''),
              score: r.score, total: r.total, pct: r.pct, stars: String(r.stars || ''),
              unitIdx: typeof r.unit_idx === 'number' ? r.unit_idx : 0,
              color: String(r.color || ''),
              name: String(r.student_name || ''), id: r.local_id,
              timeTaken: typeof r.time_taken === 'number' ? r.time_taken : 0,
              answers: Array.isArray(r.answers) ? r.answers : [],
              date: String(r.date_str || ''), time: String(r.time_str || ''),
              quit: !!r.quit, abandoned: !!r.abandoned
            };
          });
        student.SCORES.sort(function(a, b) { return b.id - a.id; });
      }

      // Merge mastery
      var masteryJson = data.progress && data.progress.mastery_json;
      if (masteryJson && typeof masteryJson === 'object') {
        student.MASTERY = masteryJson;
      }

      student._scoresLoaded = true;

      // Re-render if this student is currently being viewed
      if (_activeId === studentId) {
        renderDashboard();
      }
    })
    .catch(function() { /* offline — leave empty */ });
}

// ── Init ──────────────────────────────────────────────────────────────────

// Called by auth.js after show('dashboard-screen') — _supa is already initialized.
function _dbInit() {
  _students = getAllStudents();
  _activeId = 'local';
  _managedProfiles = [];
  _parentFamilyCode = null;
  // Reset UI to loading state
  var root = document.getElementById('db-root');
  if (root) root.innerHTML = '<p class="db-empty" style="margin-top:40px;text-align:center">Loading\u2026</p>';
  var footer = document.getElementById('db-ai-footer');
  if (footer) footer.innerHTML = '';

  if (_supa) {
    // Hard 10-second fallback — if any network call hangs, render anyway
    var _dbInitTimer = setTimeout(function() { _renderDashboardOnly(); }, 10000);

    _supa.auth.getSession().then(function(sessionResult) {
      var session = sessionResult.data && sessionResult.data.session;
      if (!session) {
        clearTimeout(_dbInitTimer);
        _renderDashboardOnly();
        return;
      }
      var userId = session.user.id;

      var familyCodeQuery = Promise.race([
        _supa.from('profiles').select('family_code').eq('id', userId).maybeSingle(),
        new Promise(function(res){ setTimeout(function(){ res({data:null,error:null}); }, 8000); })
      ]);

      Promise.all([familyCodeQuery, _fetchManagedProfiles()])
        .then(function(results) {
          clearTimeout(_dbInitTimer);
          var fcResult = results[0];
          if (fcResult && !fcResult.error && fcResult.data) {
            _parentFamilyCode = fcResult.data.family_code || null;
          }
          // Add managed profiles to _students so they appear in the dropdown
          _managedProfiles.forEach(function(p) {
            _students[p.id] = {
              id: p.id,
              name: p.display_name,
              MASTERY: {},
              SCORES: [],
              STREAK: { current: 0, longest: 0, lastDate: null },
              APP_TIME: { totalSecs: 0, sessions: 0, dailySecs: {} },
              _scoresLoaded: false
            };
          });
          // Default to first managed profile if available
          if (_managedProfiles.length) {
            _activeId = _managedProfiles[0].id;
          }
          _renderDashboardOnly();
          // Load scores for each managed profile in the background; re-render when done
          _managedProfiles.forEach(function(p) {
            _loadManagedStudentScores(p.id);
          });
        })
        .catch(function() {
          clearTimeout(_dbInitTimer);
          _renderDashboardOnly();
        });
    }).catch(function() {
      clearTimeout(_dbInitTimer);
      _renderDashboardOnly();
    });
  } else {
    _renderDashboardOnly();
  }
}

function _renderDashboardOnly() {
  Promise.all([
    _loadUnlockSettings(_activeId),
    _loadTimerSettings(_activeId),
    _loadA11ySettings(_activeId),
  ]).then(function() { renderDashboard(); });
}

// ── Dashboard event dispatcher ────────────────────────────────────────────
// Replaces all onclick= attributes; keeps dashboard CSP-compliant.
// data-action="fnName"  data-arg="val"  data-arg2="val2"
if (typeof document !== 'undefined') {
  var _DB_ACTIONS = {
    dbGoToApp:               function()     { show('home'); },
    dbSignOut:               function()     { dbSignOut(); },
    openQuizReview:          function(a)    { openQuizReview(Number(a)); },
    closeQuizReview:         function()     { closeQuizReview(); },
    backToStats:             function()     { backToStats(); },
    generateAIReport:        function()     { generateAIReport(); },
    downloadReportPDF:       function()     { downloadReportPDF(); },
    windowPrint:             function()     { window.print(); },
    _dbToggleFreeMode:       function()     { _dbToggleFreeMode(); },
    _dbToggleUnitUnlock:     function(a)    { _dbToggleUnitUnlock(Number(a)); },
    _dbToggleLessonDrawer:   function(a)    { _dbToggleLessonDrawer(Number(a)); },
    _dbToggleLessonUnlock:   function(a,b)  { _dbToggleLessonUnlock(Number(a), Number(b)); },
    _dbSaveUnlock:           function()     { _dbSaveUnlock(); },
    _dbRelockAll:            function()     { _dbRelockAll(); },
    _dbFullReset:            function()     { _dbFullReset(); },
    _dbAdjustTimer:          function(a,b)  { _dbAdjustTimer(a, Number(b)); },
    _dbToggleTimer:          function()     { _dbToggleTimer(); },
    _dbSaveTimer:            function()     { _dbSaveTimer(); },
    _dbToggleA11y:           function(a)    { _dbToggleA11y(a); },
    _dbSaveA11y:             function()     { _dbSaveA11y(); },
    _dbSavePin:              function()     { _dbSavePin(); },
    _dbTogglePush:           function()     { _dbTogglePush(); },
    _dbSaveReminderTime:     function()     { _dbSaveReminderTime(); },
    _dbSavePassword:         function()     { _dbSavePassword(); },
    _dbSetFbRating:          function(a)    { _dbSetFbRating(Number(a)); },
    _dbSetFbCat:             function(a)    { _dbSetFbCat(a); },
    _dbSubmitFeedback:       function()     { _dbSubmitFeedback(); },
    openAddStudentSheet:     function()     { openAddStudentSheet(); },
    openEditProfileSheet:    function(a)    { openEditProfileSheet(a); },
    openPinResetSheet:       function(a)    { openPinResetSheet(a); },
    closePinResetSheet:      function()     { closePinResetSheet(); },
    closeEditProfileSheet:   function()     { closeEditProfileSheet(); },
    closeAddStudentSheet:    function()     { closeAddStudentSheet(); },
    dbPinKey:                function(a)    { dbPinKey(a); },
    dbPinBack:               function()     { dbPinBack(); },
    dbPinSave:               function()     { dbPinSave(); },
    dbAddPinKey:             function(a)    { dbAddPinKey(a); },
    dbAddPinBack:            function()     { dbAddPinBack(); },
    dbAddSave:               function()     { dbAddSave(); },
    dbEditSelectEmoji:       function(a)    { dbEditSelectEmoji(a); },
    dbEditSave:              function(a)    { dbEditSave(a); },
    dbAddSelectEmoji:        function(a)    { dbAddSelectEmoji(a); },
  };

  document.addEventListener('click', function(e) {
    // Only handle clicks inside #dashboard-screen or its dynamically-appended modals
    var dashEl = document.getElementById('dashboard-screen');
    var inDash = dashEl && dashEl.contains(e.target);
    // Modals are appended to body but belong to the dashboard
    var inModal = e.target.closest('.db-review-modal, .db-review-sheet');
    if (!inDash && !inModal) return;
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var fn = _DB_ACTIONS[el.dataset.action];
    if (!fn) return;
    var arg  = el.dataset.arg  !== undefined ? el.dataset.arg  : null;
    var arg2 = el.dataset.arg2 !== undefined ? el.dataset.arg2 : null;
    fn(arg, arg2, el);
  }, true);

  // Student selector change
  document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'db-student-select') {
      switchStudent(e.target.value);
    }
  });
}

// ── Jest bridge ───────────────────────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = {
    getCategoryFromId,
    _computeOverallStats,
    _computeSkillBreakdown,
    _computeWeakAreas,
    _computeActivityData,
    _computeReviewQueue,
    _parseUnlockSettings,
    _parseTimerSettings,
    _isUnitUnlockedInDraft,
    _isLessonUnlockedInDraft,
  };
}
