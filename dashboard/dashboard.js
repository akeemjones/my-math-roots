// ════════════════════════════════════════
//  DASHBOARD.JS — Parent/Teacher Dashboard
//  Standalone app: data access + pure functions + render + app init
// ════════════════════════════════════════
'use strict';

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

function _getMockStudents() {
  // Demo students so parent can see multi-student selector in action
  return {
    'mock_1': {
      id: 'mock_1',
      name: 'Alex (Demo)',
      MASTERY: {},
      SCORES: [
        { qid:'lq_add_01', pct:90, score:9,  total:10, unitIdx:0, date:'2026-03-28', type:'lesson', answers:[] },
        { qid:'lq_add_02', pct:80, score:8,  total:10, unitIdx:0, date:'2026-03-29', type:'lesson', answers:[] },
        { qid:'u1_uq',     pct:75, score:15, total:20, unitIdx:0, date:'2026-03-30', type:'unit',   answers:[] },
        { qid:'lq_sub_01', pct:55, score:11, total:20, unitIdx:3, date:'2026-03-30', type:'lesson', answers:[] },
      ],
      STREAK:   { current: 3, longest: 5, lastDate: '2026-03-30' },
      APP_TIME: { totalSecs: 1800, sessions: 6, dailySecs: { '2026-03-30': 600, '2026-03-29': 400, '2026-03-28': 800 } },
    },
    'mock_2': {
      id: 'mock_2',
      name: 'Jordan (Demo)',
      MASTERY: {},
      SCORES: [
        { qid:'lq_add_01', pct:70,  score:7,  total:10, unitIdx:0, date:'2026-03-25', type:'lesson', answers:[] },
        { qid:'lq_mul_01', pct:45,  score:9,  total:20, unitIdx:4, date:'2026-03-26', type:'lesson', answers:[] },
        { qid:'lq_mul_02', pct:50,  score:10, total:20, unitIdx:4, date:'2026-03-27', type:'lesson', answers:[] },
        { qid:'lq_div_01', pct:40,  score:8,  total:20, unitIdx:5, date:'2026-03-28', type:'lesson', answers:[] },
      ],
      STREAK:   { current: 1, longest: 4, lastDate: '2026-03-28' },
      APP_TIME: { totalSecs: 900, sessions: 4, dailySecs: { '2026-03-28': 300 } },
    },
  };
}

function getAllStudents() {
  var students = { 'local': _readLocalStudentData() };
  var mock = _getMockStudents();
  Object.keys(mock).forEach(function(k) { students[k] = mock[k]; });
  return students;
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

// ── Access control ────────────────────────────────────────────────────────

function _checkAccess() {
  var role = localStorage.getItem('mmr_user_role');
  if (role !== 'parent') {
    window.location.href = '../index.html';
    return false;
  }
  return true;
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
    + '<select class="db-selector" id="db-student-select" onchange="switchStudent(this.value)">'
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
    return '<div class="db-quiz-row" onclick="openQuizReview(' + JSON.stringify(idx) + ')" role="button" tabindex="0">'
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
    '<button class="db-review-close" onclick="closeQuizReview()">&#x2715;</button>'
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

function _buildDashboardPayload(scores, appTime, streak, days) {
  var cutoff  = Date.now() - days * 86400000;
  var period  = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.id && s.id > cutoff; });
  var avg     = period.length > 0 ? Math.round(period.reduce(function(a,s){return a+s.pct;},0)/period.length) : 0;
  var weekSecs = 0;
  for (var i = 0; i < 7; i++) {
    var d = new Date(Date.now() - i*86400000).toISOString().slice(0,10);
    weekSecs += ((appTime.dailySecs||{})[d]||0);
  }
  var unitNames = ['Basic Fact Strategies','Place Value','Addition & Subtraction','Subtraction','Multiplication','Division','Fractions','Decimals','Geometry','Measurement'];
  var unitMap = {};
  period.forEach(function(s) {
    if (s.unitIdx == null) return;
    var k = s.unitIdx;
    if (!unitMap[k]) unitMap[k] = { name: unitNames[k]||('Unit '+(k+1)), rows:[] };
    unitMap[k].rows.push({ pct: s.pct, id: s.id });
  });
  var units = Object.values(unitMap).map(function(u) {
    var rows = u.rows.slice().sort(function(a,b){return a.id-b.id;});
    var uAvg = Math.round(rows.reduce(function(a,r){return a+r.pct;},0)/rows.length);
    var trend = null;
    if (rows.length >= 3) {
      var diff = rows[rows.length-1].pct - rows[0].pct;
      trend = diff > 8 ? 'improving (+'+diff+'%)' : diff < -8 ? 'declining ('+diff+'%)' : 'stable';
    }
    return { name: u.name, attempts: rows.length, avgPct: uAvg, trend: trend };
  }).sort(function(a,b){return b.attempts-a.attempts;});
  var strengths  = units.filter(function(u){return u.avgPct>=80;}).map(function(u){return u.name+' (avg '+u.avgPct+'%)';});
  var weaknesses = units.filter(function(u){return u.avgPct<70&&u.attempts>=2;}).map(function(u){return u.name+' (avg '+u.avgPct+'%'+(u.trend?', '+u.trend:'')+')';});
  return {
    period: 'Last '+days+' days',
    totalAttempts: period.length,
    overallAvg: avg,
    streak: (streak&&streak.current)||0,
    timeThisWeek: weekSecs>0 ? Math.round(weekSecs/60)+' min' : 'not tracked',
    units: units,
    strengths:  strengths.length  ? strengths  : ['No units at 80%+ yet'],
    weaknesses: weaknesses.length ? weaknesses : ['No major weaknesses identified'],
  };
}

async function generateAIReport() {
  var footerEl = document.getElementById('db-ai-footer');
  var bodyEl   = document.getElementById('db-root');
  if (!footerEl) return;
  var student   = _students[_activeId];
  if (!student) return;
  var name      = student.name || 'Student';
  _prStatsHtml  = bodyEl ? bodyEl.innerHTML : '';

  // Show loading
  if (bodyEl) bodyEl.innerHTML = '<div class="db-ai-loading"><div class="db-ai-spinner"></div>'
    + '<div class="db-ai-loading-txt">Analysing ' + _esc(name) + '\'s progress…</div>'
    + '<div class="db-ai-loading-sub">This takes about 5 seconds</div></div>';
  footerEl.innerHTML = '';

  var payload = _buildDashboardPayload(student.SCORES||[], student.APP_TIME||{totalSecs:0,sessions:0,dailySecs:{}}, student.STREAK||{current:0}, 30);

  try {
    var resp = await fetch('/.netlify/functions/gemini-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: name, reportData: payload })
    });
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    var data = await resp.json();
    if (data.error) throw new Error(data.error);
    _prReportText = data.report;
    _renderAIReportView(data.report, name);
  } catch(e) {
    if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
      + '<div style="font-size:2rem;margin-bottom:14px">⚠️</div>'
      + '<div style="color:#37474f">Couldn\'t generate the report.</div>'
      + '<div style="font-size:.85rem;color:#90a4ae;margin-top:6px">' + _esc(e.message||'Check your connection.') + '</div></div>';
    if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
      + '<button class="db-ai-back-btn" onclick="backToStats()">← Back to Stats</button>'
      + '<button class="db-ai-pdf-btn" onclick="generateAIReport()">↺ Try Again</button></div>';
  }
}

function _renderAIReportView(text, name) {
  var colours = ['#1565C0','#2e7d32','#e65100','#673ab7','#00838f','#b71c1c'];
  var parts   = text.split(/^## /m).filter(Boolean);
  var html    = '<div class="db-ai-sections">';
  parts.forEach(function(part, idx) {
    var nl  = part.indexOf('\n');
    var hdr = nl > -1 ? part.slice(0, nl).trim() : part.trim();
    var bod = nl > -1 ? part.slice(nl+1).trim()  : '';
    var col = colours[idx % colours.length];
    html += '<div class="db-ai-section" style="border-left:3px solid '+col+'">'
      + '<div class="db-ai-section-title" style="color:'+col+'">'+_esc(hdr)+'</div>'
      + '<div class="db-ai-section-body">'+bod.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>'
      + '</div>';
  });
  html += '</div>';

  var bodyEl   = document.getElementById('db-root');
  var footerEl = document.getElementById('db-ai-footer');
  var hdrTitle = document.querySelector('.db-header-title');
  if (bodyEl)   { bodyEl.innerHTML = html; bodyEl.scrollTop = 0; }
  if (hdrTitle) hdrTitle.textContent = '📋 AI Report — ' + name;
  if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
    + '<button class="db-ai-back-btn" onclick="backToStats()">← Back to Stats</button>'
    + '<button class="db-ai-pdf-btn" onclick="downloadReportPDF()">💾 Download PDF</button></div>';
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
  return '<div style="text-align:center">'
    + '<button class="db-ai-gen-btn" onclick="generateAIReport()">📋 Generate AI Report</button>'
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
    + '<div class="np"><button onclick="window.print()">💾 Save as PDF</button>'
    + '<p>In the print dialog, choose <strong>Save as PDF</strong></p></div>'
    + '<div class="hd"><div style="font-size:1.2rem;font-weight:700;color:#1565C0"><svg width="20" height="20" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:5px"><defs><linearGradient id="rp-l1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient><linearGradient id="rp-l2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient><linearGradient id="rp-ls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient><linearGradient id="rp-lb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient></defs><g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g><path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#rp-ls)" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#rp-l1)"/><path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#rp-l2)"/><path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#rp-lb)"/></svg>My Math Roots</div>'
    + '<div style="font-size:1rem;color:#444;margin-top:6px">Progress Report — '+name+'</div>'
    + '<div style="font-size:.78rem;color:#999;margin-top:4px">Generated '+date+'</div></div>'
    + sections
    + '<div style="text-align:center;font-size:.75rem;color:#bbb;margin-top:40px;padding-top:16px;border-top:1px solid #eee">My Math Roots — mymathroots.com</div>'
    + '</body></html>';
  var win = window.open('', '_blank');
  if (win) { win.document.write(doc); win.document.close(); }
}

// ── App state ─────────────────────────────────────────────────────────────

var _students    = {};
var _activeId    = 'local';
var _supaDb = null;
var _managedProfiles = [];
var _pinResetStudentId = null;
var _pinResetBuffer = [];

function _unitNames() {
  // Fallback labels for 10 units
  return [
    'Basic Fact Strategies','Place Value','Addition & Subtraction',
    'Subtraction','Multiplication','Division',
    'Fractions','Decimals','Geometry','Measurement',
  ];
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
    _renderActivity(activity);

  // Render AI report footer
  var footerEl = document.getElementById('db-ai-footer');
  if (footerEl) footerEl.innerHTML = _genReportFooter();
}

function switchStudent(id) {
  _activeId = id;
  renderDashboard();
}

function signOut() {
  localStorage.removeItem('mmr_user_role');
  window.location.href = '../index.html';
}

// ── Manage Profiles ───────────────────────────────────────────────────────

async function _fetchManagedProfiles() {
  if (typeof _supaDb === 'undefined' || !_supaDb) return;
  try {
    var result = await Promise.race([
      _supaDb
        .from('student_profiles')
        .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, username, updated_at')
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
      + '<button class="db-add-student-btn" onclick="openAddStudentSheet()">+ Add Student</button>'
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
      + '<button class="db-profile-edit-btn" onclick="openEditProfileSheet(\'' + _esc(p.id) + '\')">Edit</button>'
      + '<button class="db-profile-pin-btn" onclick="openPinResetSheet(\'' + _esc(p.id) + '\')">PIN</button>'
      + '</div>'
      + '</div>';
  }).join('');

  return '<section class="db-section db-profiles-section" id="db-manage-profiles-section">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    + '<h2 class="db-sec-h" style="margin:0">&#x1F464; Manage Profiles</h2>'
    + '<button class="db-add-student-btn" onclick="openAddStudentSheet()">+ Add Student</button>'
    + '</div>'
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
    '<button class="db-review-close" onclick="closePinResetSheet()">&#x2715;</button>'
    + '<div class="db-review-title">Reset PIN for ' + _esc(profile.display_name) + '</div>'
    + '<div class="db-review-meta">Enter a new 4-digit PIN</div>';

  var keys = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(function(d) {
    keys += '<button class="db-pin-key" onclick="dbPinKey(\'' + d + '\')">' + d + '</button>';
  });
  keys += '<div></div>'
    + '<button class="db-pin-key" onclick="dbPinKey(\'0\')">0</button>'
    + '<button class="db-pin-key db-pin-key-back" onclick="dbPinBack()">&#x232B;</button>';

  document.getElementById('db-pin-reset-body').innerHTML =
    '<div id="db-pin-reset-dots" style="display:flex;gap:10px;justify-content:center;margin:16px 0 12px"></div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;padding:0 2px">' + keys + '</div>'
    + '<div id="db-pin-reset-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button id="db-pin-save-btn" onclick="dbPinSave()" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Save New PIN</button>';

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
  if (!_supaDb || !_pinResetStudentId) { if (msg) msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-pin-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    var encoder = new TextEncoder();
    var data = encoder.encode(_pinResetBuffer.join('') + 'mymathroots_pin_salt_2025');
    var keyMaterial = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
    var salt = encoder.encode('mymathroots_pin_salt_2025');
    var derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
    var newHash = Array.from(new Uint8Array(derived)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');

    var result = await Promise.race([
      _supaDb.from('student_profiles').update({ pin_hash: newHash, updated_at: new Date().toISOString() }).eq('id', _pinResetStudentId),
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
    '<button class="db-review-close" onclick="closeEditProfileSheet()">&#x2715;</button>'
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
        return '<div id="db-av-' + e.codePointAt(0) + '" onclick="dbEditSelectEmoji(\'' + _esc(e) + '\')"'
          + ' style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + colors + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:' + (isSelected ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<div id="db-edit-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button onclick="dbEditSave(\'' + _esc(studentId) + '\')" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer">Save Changes</button>';

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
  if (!_supaDb) { msg.textContent = 'Not connected.'; return; }

  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  var emoji = _dbEditSelectedEmoji || (profile ? profile.avatar_emoji : '🦁');
  var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
  var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
  var ageVal = ageInp ? parseInt(ageInp.value) || null : null;

  try {
    var result = await Promise.race([
      _supaDb.from('student_profiles').update({
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
      + '<div class="db-review-head"><button class="db-review-close" onclick="closeAddStudentSheet()">&#x2715;</button>'
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
          + ' style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + colors + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:' + (e === '🦁' ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box" onclick="dbAddSelectEmoji(\'' + _esc(e) + '\')">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Create a 4-digit PIN</label>'
    + '<div id="db-add-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px">'
    + '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>'.repeat(4)
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">'
    + ['1','2','3','4','5','6','7','8','9'].map(function(d){ return '<button onclick="dbAddPinKey(\'' + d + '\')" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;cursor:pointer">' + d + '</button>'; }).join('')
    + '<div></div>'
    + '<button onclick="dbAddPinKey(\'0\')" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;cursor:pointer">0</button>'
    + '<button onclick="dbAddPinBack()" style="background:#fce4ec;border:1px solid #ffcdd2;border-radius:10px;padding:12px 0;font-size:1rem;color:#c62828;cursor:pointer">&#x232B;</button>'
    + '</div>'
    + '<div id="db-add-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button id="db-add-save-btn" onclick="dbAddSave()" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Add Student</button>';

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
  if (!_supaDb) { msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-add-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    var encoder = new TextEncoder();
    var pinData = encoder.encode(window._dbAddPinBuffer.join('') + 'mymathroots_pin_salt_2025');
    var keyMaterial = await crypto.subtle.importKey('raw', pinData, 'PBKDF2', false, ['deriveBits']);
    var salt = encoder.encode('mymathroots_pin_salt_2025');
    var derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
    var pinHash = Array.from(new Uint8Array(derived)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');

    var emoji = window._dbAddSelectedEmoji || '🦁';
    var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
    var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
    var ageVal = ageInp ? parseInt(ageInp.value) || null : null;
    var username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'student';

    // Get parent_id from Supabase session
    var sessionResult = await _supaDb.auth.getUser();
    var parentId = sessionResult && sessionResult.data && sessionResult.data.user ? sessionResult.data.user.id : null;

    if (!parentId) {
      if (msg) msg.textContent = 'Session expired — please sign out and sign in again.';
      if (btn) btn.textContent = 'Add Student';
      return;
    }

    var result = await Promise.race([
      _supaDb.from('student_profiles').insert({
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

// ── Init ──────────────────────────────────────────────────────────────────

function initDashboard() {
  if (!_checkAccess()) return;
  var _SUPA_URL = '%%SUPA_URL%%';
  var _SUPA_KEY = '%%SUPA_KEY%%';
  if (typeof supabase !== 'undefined' && _SUPA_URL && !_SUPA_URL.includes('%%')) {
    window._supaDb = supabase.createClient(_SUPA_URL, _SUPA_KEY);
    _supaDb = window._supaDb;
  }
  _students = getAllStudents();
  if (_supaDb) {
    _fetchManagedProfiles().then(function() {
      var profilesSection = document.getElementById('db-manage-profiles-section');
      if (profilesSection) profilesSection.outerHTML = _renderManageProfiles();
    });
  }
  renderDashboard();
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
  };
}
