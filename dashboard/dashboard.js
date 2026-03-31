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
    + '<div class="hd"><div style="font-size:1.2rem;font-weight:700;color:#1565C0">🌱 My Math Roots</div>'
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
