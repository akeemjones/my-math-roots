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

// ── Render helpers (return HTML strings) ─────────────────────────────────

function _esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
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

// ── App state ─────────────────────────────────────────────────────────────

var _students    = {};
var _activeId    = 'local';

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

  root.innerHTML =
    _renderStudentSelector(_students, _activeId) +
    '<h1 class="db-student-name">' + _esc(student.name) + '</h1>' +
    _renderOverview(stats) +
    _renderSkills(skills) +
    _renderWeak(weak) +
    _renderReview(review) +
    _renderActivity(activity);
}

function switchStudent(id) {
  _activeId = id;
  renderDashboard();
}

function signOut() {
  localStorage.removeItem('mmr_user_role');
  window.location.href = '../index.html';
}

// ── Init ──────────────────────────────────────────────────────────────────

function initDashboard() {
  if (!_checkAccess()) return;
  _students = getAllStudents();
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
