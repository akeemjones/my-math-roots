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

// ── Settings parsers (pure, testable) ────────────────────────────────────

// Short grade-band token used by score records and grade-scoped unlock
// settings ('k' | 'g1' | 'g2'). Returns null for unknown input. Mirror of
// _gradeBand in src/settings.js — duplicated so this file can be parsed by
// Jest without booting the full app.
function _gradeBand(v) {
  if (v === null || v === undefined) return null;
  var s = String(v).trim().toLowerCase();
  if (s === 'k' || s === 'kindergarten' || s === '0') return 'k';
  if (s === '1' || s === 'g1' || s === 'grade1' || s === 'grade 1') return 'g1';
  if (s === '2' || s === 'g2' || s === 'grade2' || s === 'grade 2') return 'g2';
  return null;
}

// Determine the grade band for a single score record. Returns
// 'k' | 'g1' | 'g2' | 'legacy_unknown'.
function _inferScoreGrade(s) {
  if (!s) return 'legacy_unknown';
  if (s.grade) {
    var b = _gradeBand(s.grade);
    return b || 'legacy_unknown';
  }
  var probes = [s.qid, s.sourceLessonId, s.sourceUnitId].filter(function(p){ return p; });
  for (var i = 0; i < probes.length; i++) {
    var t = String(probes[i]).toLowerCase();
    if (/^(lq_)?g1/.test(t)) return 'g1';
    if (/^(lq_)?(ku|k\d)/.test(t)) return 'k';
    if (/^(lq_)?u\d/.test(t)) return 'g2';
  }
  return 'legacy_unknown';
}

function _emptyUnlockSlot() {
  return { freeMode: false, units: [], lessons: {} };
}

function _emptyByGrade() {
  return { k: _emptyUnlockSlot(), g1: _emptyUnlockSlot(), g2: _emptyUnlockSlot() };
}

// Parse unlock settings into the canonical schema-v2 byGrade shape. Legacy
// flat shape is migrated into the activeBand slot (read-only fallback). See
// design doc 2026-05-18-parent-dashboard-grade-scoped-state-design.md.
function _parseUnlockSettings(raw, activeBand) {
  if (!raw || typeof raw !== 'object') raw = {};
  var out = { schemaVersion: 2, byGrade: _emptyByGrade() };

  if (raw.byGrade && typeof raw.byGrade === 'object') {
    ['k','g1','g2'].forEach(function(band){
      var src = raw.byGrade[band];
      if (src && typeof src === 'object') {
        out.byGrade[band] = {
          freeMode: src.freeMode === true,
          units:    Array.isArray(src.units) ? src.units.slice() : [],
          lessons:  (src.lessons && typeof src.lessons === 'object') ? Object.assign({}, src.lessons) : {}
        };
      }
    });
    return out;
  }

  if (raw.freeMode === true || (Array.isArray(raw.units) && raw.units.length)
      || (raw.lessons && typeof raw.lessons === 'object' && Object.keys(raw.lessons).length)) {
    var band = _gradeBand(activeBand) || 'g2';
    out.byGrade[band] = {
      freeMode: raw.freeMode === true,
      units:    Array.isArray(raw.units) ? raw.units.slice() : [],
      lessons:  (raw.lessons && typeof raw.lessons === 'object') ? Object.assign({}, raw.lessons) : {}
    };
  }
  return out;
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

// Legacy flat shape applies to G2 only (historical default). See src/dashboard.js
// for the rationale.
function _draftSlot(draft, band) {
  if (!draft) return _emptyUnlockSlot();
  if (draft.byGrade && draft.byGrade[band]) return draft.byGrade[band];
  if (draft.byGrade) return _emptyUnlockSlot();
  if (band !== 'g2') return _emptyUnlockSlot();
  if (typeof draft.freeMode === 'boolean' || Array.isArray(draft.units) || (draft.lessons && typeof draft.lessons === 'object')) {
    return {
      freeMode: draft.freeMode === true,
      units:    Array.isArray(draft.units) ? draft.units : [],
      lessons:  (draft.lessons && typeof draft.lessons === 'object') ? draft.lessons : {}
    };
  }
  return _emptyUnlockSlot();
}

function _isUnitUnlockedInDraft(draft, unitIdx, band) {
  var slot = _draftSlot(draft, band || (typeof _getDashboardViewGrade === 'function' ? _getDashboardViewGrade() : 'g2'));
  if (slot.freeMode) return true;
  return slot.units.indexOf(unitIdx) !== -1;
}

function _isLessonUnlockedInDraft(draft, unitIdx, lessonIdx, band) {
  var slot = _draftSlot(draft, band || (typeof _getDashboardViewGrade === 'function' ? _getDashboardViewGrade() : 'g2'));
  if (slot.freeMode) return true;
  return !!slot.lessons[unitIdx + '_' + lessonIdx];
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
  // localStorage role is a UX hint only — real gate is the Supabase session below.
  // We do a quick redirect for clearly-logged-out guests, but the async session
  // check is the authoritative gate.
  var role = localStorage.getItem('mmr_user_role');
  if (!role || role === 'student') {
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
      thisWeek:          weekSecs>0    ? Math.round(weekSecs/60)+' min'        : 'not tracked',
      total:             (appTime.totalSecs||0)>0 ? Math.round(appTime.totalSecs/60)+' min' : 'not tracked',
      avgSessionMins:    avgSessionSecs>0 ? Math.round(avgSessionSecs/60)+' min' : null,
      avgSecsPerQuestion: qCount>0 ? Math.round(qSum/qCount) : null,
      sessions:          appTime.sessions||0
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
    var nextDate = new Date(nextAvail).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
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
      body: JSON.stringify({ studentName: name, reportData: payload })
    });
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    var data = await resp.json();
    if (data.error) throw new Error(data.error);
    _prReportText = data.report;
    // Record successful generation — localStorage for speed, Supabase for cross-device sync
    var _nowIso = new Date().toISOString();
    localStorage.setItem(_reportCooldownKey(), String(Date.now()));
    if (typeof _supaDb !== 'undefined' && _supaDb && _activeId !== 'local') {
      _supaDb.from('student_profiles')
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
  // Use Blob URL instead of document.write — avoids CSP bypass in new window
  var blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  var blobUrl = URL.createObjectURL(blob);
  var win = window.open(blobUrl, '_blank');
  // Revoke after a short delay to free memory once the browser has loaded it
  if (win) { setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 10000); }
}

// ── App state ─────────────────────────────────────────────────────────────

var _students    = {};
var _activeId    = 'local';
var _supaDb = null;
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
  var viewBand = (typeof _getDashboardViewGrade === 'function') ? _getDashboardViewGrade() : 'g2';
  if (!_supaDb || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _unlockDraft = _parseUnlockSettings({}, viewBand);
    return;
  }
  try {
    var result = await _supaDb.rpc('get_unlock_settings', { p_student_id: studentId });
    _unlockDraft = _parseUnlockSettings(result.data || {}, viewBand);
  } catch(e) {
    _unlockDraft = _parseUnlockSettings({}, viewBand);
    _showDbToast('⚠️ Could not load unlock settings — showing defaults', true);
  }
  _unlockDirty = false;
}

async function _loadTimerSettings(studentId) {
  if (!_supaDb || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _timerDraft = _parseTimerSettings({});
    return;
  }
  try {
    var result = await _supaDb.rpc('get_timer_settings', { p_student_id: studentId });
    _timerDraft = _parseTimerSettings(result.data || {});
  } catch(e) {
    _timerDraft = _parseTimerSettings({});
    _showDbToast('⚠️ Could not load timer settings — showing defaults', true);
  }
}

async function _loadA11ySettings(studentId) {
  if (!_supaDb || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _a11yDraft = _parseA11ySettings({});
    return;
  }
  try {
    var result = await _supaDb.rpc('get_a11y_settings', { p_student_id: studentId });
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

// ── Dashboard view-grade state (standalone) ──────────────────────────────
// Pure view filter; see src/dashboard.js for design notes. Persisted in
// localStorage as mmr_dash_view_grade_<sid>.
function _getDashboardViewGrade() {
  if (!_activeId || _activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2') {
    return _gradeBand(localStorage.getItem('mmr_grade')) || 'g2';
  }
  try {
    var saved = localStorage.getItem('mmr_dash_view_grade_' + _activeId);
    if (saved) {
      var b = _gradeBand(saved);
      if (b) return b;
    }
  } catch (_e) {}
  return 'g2';
}

function _setDashboardViewGrade(band) {
  var b = _gradeBand(band);
  if (!b) return;
  if (_activeId && _activeId !== 'local' && _activeId !== 'mock_1' && _activeId !== 'mock_2') {
    try { localStorage.setItem('mmr_dash_view_grade_' + _activeId, b); } catch (_e) {}
  }
  _activeDrawerUnit = -1;
  if (typeof renderDashboard === 'function') renderDashboard();
}

// ── Access Controls — mutation helpers ───────────────────────────────────

function _activeUnlockSlot() {
  if (!_unlockDraft || !_unlockDraft.byGrade) {
    _unlockDraft = _parseUnlockSettings({}, _getDashboardViewGrade());
  }
  var band = _getDashboardViewGrade();
  if (!_unlockDraft.byGrade[band]) _unlockDraft.byGrade[band] = _emptyUnlockSlot();
  return _unlockDraft.byGrade[band];
}

function _dbToggleFreeMode() {
  var slot = _activeUnlockSlot();
  slot.freeMode = !slot.freeMode;
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleUnitUnlock(unitIdx) {
  var slot = _activeUnlockSlot();
  var idx = slot.units.indexOf(unitIdx);
  if (idx === -1) { slot.units.push(unitIdx); }
  else { slot.units.splice(idx, 1); }
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleLessonUnlock(unitIdx, lessonIdx) {
  var slot = _activeUnlockSlot();
  var key = unitIdx + '_' + lessonIdx;
  if (slot.lessons[key]) { delete slot.lessons[key]; }
  else { slot.lessons[key] = true; }
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
  if (!_supaDb) { if (msg) msg.textContent = 'Not connected.'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try {
    var result = await _supaDb.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    if (result.error) throw result.error;
    _unlockDirty = false;
    // Mirror to local cache so the student-side lock gates (which read
    // wb_unlock_<sid> via _readUnlockCache) see the change on the very next
    // navigation, instead of waiting up to 3 minutes for the next sync poll.
    if (_activeId && _activeId !== 'local') {
      try { localStorage.setItem('wb_unlock_' + _activeId, JSON.stringify(_unlockDraft)); } catch (_e) {}
    }
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed — check connection.'; }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
}

async function _dbRelockAll() {
  var viewBand = _getDashboardViewGrade();
  var label = viewBand === 'k' ? 'Kindergarten' : (viewBand === 'g1' ? 'Grade 1' : 'Grade 2');
  if (!confirm('Remove all unit and lesson unlocks for ' + label + '?')) return;
  if (!_unlockDraft || !_unlockDraft.byGrade) {
    _unlockDraft = _parseUnlockSettings({}, viewBand);
  }
  _unlockDraft.byGrade[viewBand] = _emptyUnlockSlot();
  _unlockDirty = false;
  _activeDrawerUnit = -1;
  // Mirror to local cache so re-lock takes effect on the next student-side navigation.
  if (_activeId && _activeId !== 'local') {
    try { localStorage.setItem('wb_unlock_' + _activeId, JSON.stringify(_unlockDraft)); } catch (_e) {}
  }
  if (!_supaDb) { _reRenderUnlock(); return; }
  try {
    await _supaDb.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#37474f'; msg.textContent = '🔒 ' + label + ' locks restored.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) { /* silently ignore — draft was already reset */ }
  _reRenderUnlock();
}

// Friendly error messages — never expose raw Supabase internals to the UI
function _dbFriendlyError(e) {
  if (!e) return 'An error occurred.';
  var m = (e.message || '').toLowerCase();
  if (m.includes('not_owner'))          return 'Permission denied.';
  if (m.includes('jwt') || m.includes('auth')) return 'Session expired — please sign in again.';
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) return 'Connection error — check your internet.';
  if (m.includes('timeout'))            return 'Request timed out — try again.';
  if (m.includes('unique') || m.includes('duplicate')) return 'That value is already taken.';
  return 'Something went wrong — please try again.';
}

async function _dbFullReset() {
  if (!confirm('DELETE all quiz scores and mastery data for this student? This cannot be undone.')) return;
  if (!_supaDb || !_activeId || _activeId === 'local') return;
  var msg = document.getElementById('db-unlock-msg');
  try {
    var result = await Promise.race([
      _supaDb.rpc('reset_student_data', { p_student_id: _activeId }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (result.error) throw result.error;
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '🗑 Student data cleared.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 3000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ ' + _dbFriendlyError(e); }
  }
}

// ── Access Controls — render ──────────────────────────────────────────────

function _renderUnlockInner() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  if (isMock) {
    return '<p class="db-empty">Unlock settings require a student profile connected to a parent account.</p>';
  }
  var viewBand = _getDashboardViewGrade();
  var gradeLabel = viewBand === 'k' ? 'Kindergarten' : (viewBand === 'g1' ? 'Grade 1' : 'Grade 2');
  var slot = _draftSlot(_unlockDraft, viewBand);
  var fm = slot.freeMode;
  var html = '';

  html += '<p class="db-unlock-grade-context" style="margin:0 0 12px;font-size:.8rem;color:#607d8b">'
    + 'Free Mode &amp; per-unit unlocks apply to <strong>' + _esc(gradeLabel) + '</strong> only.</p>';

  // Free Mode toggle
  html += '<div class="db-toggle-row">'
    + '<div><strong>🌟 Free Mode &mdash; ' + _esc(gradeLabel) + '</strong><br>'
    + '<span class="db-toggle-sub">Unlock all ' + _esc(gradeLabel) + ' units and lessons at once</span></div>'
    + '<button class="db-toggle-btn' + (fm ? ' db-toggle-on' : '') + '" data-action="_dbToggleFreeMode">'
    + (fm ? 'ON' : 'OFF') + '</button>'
    + '</div>';

  // Unit cards grid
  html += '<div class="db-unit-grid"' + (fm ? ' style="opacity:.5;pointer-events:none"' : '') + '>';
  _UNITS_META.forEach(function(u, i) {
    var unlocked = _isUnitUnlockedInDraft(_unlockDraft, i, viewBand);
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
        var lu = _isLessonUnlockedInDraft(_unlockDraft, i, li, viewBand);
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
  if (!_supaDb) { if (msg) msg.textContent = 'Not connected.'; return; }
  try {
    var result = await _supaDb.rpc('update_timer_settings', {
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
  if (!_supaDb) { if (msg) msg.textContent = 'Not connected.'; return; }
  try {
    var result = await _supaDb.rpc('update_a11y_settings', {
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
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  var inner = isMock
    ? '<p class="db-empty">Accessibility settings require a connected student profile.</p>'
    : '<div class="db-toggle-row">'
        + '<div><strong>Aa Large Text</strong><br><span class="db-toggle-sub">Increases font size for the student</span></div>'
        + '<button id="db-a11y-largeText-btn" class="db-toggle-btn' + (_a11yDraft.largeText ? ' db-toggle-on' : '') + '" data-action="_dbToggleA11y" data-arg="largeText">'
        + (_a11yDraft.largeText ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div class="db-toggle-row">'
        + '<div><strong>◑ High Contrast</strong><br><span class="db-toggle-sub">Increases color contrast for readability</span></div>'
        + '<button id="db-a11y-highContrast-btn" class="db-toggle-btn' + (_a11yDraft.highContrast ? ' db-toggle-on' : '') + '" data-action="_dbToggleA11y" data-arg="highContrast">'
        + (_a11yDraft.highContrast ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div id="db-a11y-msg" class="db-ctrl-msg"></div>'
        + '<div class="db-ctrl-btns"><button class="db-ctrl-save" data-action="_dbSaveA11y">Save Accessibility</button></div>';
  return '<section class="db-section"><h2 class="db-sec-h">♿ Accessibility</h2>' + inner + '</section>';
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
  if (!_supaDb) { msg.textContent='Not connected.'; return; }
  msg.style.color='#546e7a'; msg.textContent='Saving…';
  try {
    var hash = await _dbHashPin(newPin);
    var result = await _supaDb.rpc('update_pin_hash', { p_hash: hash });
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
  if (!_supaDb) { msg.textContent='Not connected.'; return; }
  msg.style.color='#546e7a'; msg.textContent='Saving…';
  var result = await _supaDb.auth.updateUser({ password: pw });
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
  if (!_supaDb) { msg.textContent='Not connected.'; return; }
  var comment = (document.getElementById('db-fb-comment').value || '').slice(0, 500);
  msg.style.color='#546e7a'; msg.textContent='Sending…';
  try {
    var user = (await _supaDb.auth.getUser()).data.user;
    var result = await _supaDb.from('feedback').insert({
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
  return '<div class="mb-14"><div class="cl-version-brand">v5.33 — Current</div><ul class="list-body">'
    + '<li><strong>Parent Dashboard</strong> — All parent controls moved to the dashboard for remote management</li>'
    + '<li><strong>Balanced Final Test</strong> — 50-question final test with guaranteed 5 questions per unit</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.32</div><ul class="list-body">'
    + '<li><strong>Security hardening</strong> — PBKDF2 PIN hashing, HMAC-SHA256 score signing, SWR service worker</li>'
    + '<li><strong>Stable question IDs</strong> — 5,073 unique IDs injected across all 10 units</li>'
    + '<li><strong>Student Profiles</strong> — Multi-student support with family code and PIN login</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.22</div><ul class="list-body">'
    + '<li><strong>Self-hosted fonts</strong> — Boogaloo + Nunito base64 woff2 inline</li>'
    + '<li><strong>Google Sign-In</strong> — Fixed Client Secret and CSP</li>'
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

  // View-grade filter — see design doc 2026-05-18-parent-dashboard-grade-scoped-state-design.md
  var viewBand = _getDashboardViewGrade();           // 'k'|'g1'|'g2'
  var allScores = student.SCORES  || [];
  var scores  = allScores.filter(function(s){ return _inferScoreGrade(s) === viewBand; });
  // Activity events: filter to selected grade (untagged legacy events kept).
  var activityEvents = (student.ACTIVITY || []).filter(function(e){
    if (!e) return false;
    if (e.grade == null) return true;
    return (_gradeBand(e.grade) === viewBand);
  });
  // Derive a grade-scoped mastery from grade-filtered activity events so the
  // Learning Insights section does not leak tags across grades. The legacy
  // unscoped mastery is still passed to existing sections for backwards compat.
  var rawMastery   = student.MASTERY || {};
  var gradeMastery = _deriveMasteryFromActivity(activityEvents);
  var mastery      = Object.keys(gradeMastery).length ? gradeMastery : rawMastery;
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
  // Phase 1 Learning Insights: build from already-grade-filtered inputs.
  var interventionEvents = _filterInterventionsByGrade(_getInterventionEvents(), viewBand);
  var learningInsights = buildLearningInsights({
    viewBand:           viewBand,
    studentName:        student.name,
    scores:             scores,
    activityEvents:     activityEvents,
    interventionEvents: interventionEvents,
    mastery:            gradeMastery,
    tagLabels:          _TAG_LABEL_MAP,
    errLabels:          _ERR_LABEL_MAP,
    errHelpMap:         _ERR_HELP_MAP,
    lessonNameFn:       function(){ return null; },
  });

  _prStatsHtml  = '';
  _prReportText = '';

  // Reset header title in case we came back from AI report
  var hdrTitle = document.querySelector('.db-header-title');
  if (hdrTitle) hdrTitle.textContent = '📊 Parent Dashboard';

  var gradeLabel = viewBand === 'k' ? 'Kindergarten' : (viewBand === 'g1' ? 'Grade 1' : 'Grade 2');
  var gradeDropdown = ''
    + '<div class="db-grade-context" style="margin:2px 0 16px;display:flex;align-items:center;gap:8px;font-size:.85rem;color:#37474f">'
    +   '<label for="db-view-grade-select" style="margin:0">Viewing:</label>'
    +   '<select id="db-view-grade-select" class="db-view-grade-select" data-action="_setDashboardViewGrade"'
    +     ' style="font-family:inherit;font-size:.9rem;padding:4px 8px;border:1px solid #cfd8dc;border-radius:6px;background:#fff;cursor:pointer">'
    +     '<option value="k"'  + (viewBand === 'k'  ? ' selected' : '') + '>Kindergarten</option>'
    +     '<option value="g1"' + (viewBand === 'g1' ? ' selected' : '') + '>Grade 1</option>'
    +     '<option value="g2"' + (viewBand === 'g2' ? ' selected' : '') + '>Grade 2</option>'
    +   '</select>'
    +   '<span style="color:#90a4ae;font-size:.75rem">(view filter only)</span>'
    + '</div>';

  root.innerHTML =
    _renderStudentSelector(_students, _activeId) +
    '<h1 class="db-student-name">' + _esc(student.name) + '</h1>' +
    gradeDropdown +
    _renderLearningInsightsV2(learningInsights) +
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
    _renderPinSection() +
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
  Promise.all([
    _loadUnlockSettings(id),
    _loadTimerSettings(id),
    _loadA11ySettings(id),
  ]).then(function() { renderDashboard(); });
}

function signOut() {
  // Nuclear clear — wipes all sessions, all student profiles, all local progress.
  // Ensures no profile data leaks across sessions regardless of who was logged in.
  localStorage.clear();
  sessionStorage.clear();
  // Best-effort graceful Supabase sign-out (fire-and-forget)
  if (typeof _supaDb !== 'undefined' && _supaDb) {
    _supaDb.auth.signOut().catch(function(){});
  }
  window.location.href = '../index.html';
}

// ── Manage Profiles ───────────────────────────────────────────────────────

async function _fetchManagedProfiles() {
  if (typeof _supaDb === 'undefined' || !_supaDb) return;
  try {
    var result = await Promise.race([
      _supaDb
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
  if (!_supaDb || !_pinResetStudentId) { if (msg) msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-pin-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    var encoder = new TextEncoder();
    var hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(_pinResetBuffer.join('') + 'mymathroots_pin_salt_2025'));
    var newHash = Array.from(new Uint8Array(hashBuf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');

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
  if (!_supaDb) { msg.textContent = 'Not connected.'; return; }

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
  // Prevent iOS swipe-back to splash screen
  history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', function() {
    history.pushState(null, '', window.location.href);
  });
  var _SUPA_URL = '%%SUPA_URL%%';
  var _SUPA_KEY = '%%SUPA_KEY%%';
  if (typeof supabase !== 'undefined' && _SUPA_URL && !_SUPA_URL.includes('%%')) {
    window._supaDb = supabase.createClient(_SUPA_URL, _SUPA_KEY);
    _supaDb = window._supaDb;
  }
  _students = getAllStudents();
  if (_supaDb) {
    // Authoritative session gate — localStorage role is just a UX hint.
    // If there is no valid Supabase session, redirect immediately.
    _supaDb.auth.getSession().then(function(sessionResult) {
      var session = sessionResult.data && sessionResult.data.session;
      if (!session) {
        localStorage.removeItem('mmr_user_role');
        window.location.href = '../index.html';
        return;
      }
      var userId = session.user.id;
      Promise.all([
        _supaDb.from('profiles').select('family_code').eq('id', userId).single(),
        _fetchManagedProfiles()
      ]).then(function(results) {
        var fcResult = results[0];
        if (!fcResult.error && fcResult.data) {
          _parentFamilyCode = fcResult.data.family_code || null;
        }
        var profilesSection = document.getElementById('db-manage-profiles-section');
        if (profilesSection) profilesSection.outerHTML = _renderManageProfiles();
      });
    });
  }
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
    signOut:                 function()     { signOut(); },
    openQuizReview:          function(a)    { openQuizReview(Number(a)); },
    closeQuizReview:         function()     { closeQuizReview(); },
    backToStats:             function()     { backToStats(); },
    generateAIReport:        function()     { generateAIReport(); },
    downloadReportPDF:       function()     { downloadReportPDF(); },
    windowPrint:             function()     { window.print(); },
    _dbToggleFreeMode:       function()     { _dbToggleFreeMode(); },
    _setDashboardViewGrade:  function(_a, val) { _setDashboardViewGrade(val); },
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
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var fn = _DB_ACTIONS[el.dataset.action];
    if (!fn) return;
    var arg  = el.dataset.arg  !== undefined ? el.dataset.arg  : null;
    var arg2 = el.dataset.arg2 !== undefined ? el.dataset.arg2 : null;
    fn(arg, arg2, el);
  }, true);

  // Student selector change + delegated select-change actions
  document.addEventListener('change', function(e) {
    var t = e.target;
    if (!t) return;
    if (t.id === 'db-student-select') { switchStudent(t.value); return; }
    if (t.tagName === 'SELECT' && t.dataset && t.dataset.action) {
      var fn = _DB_ACTIONS[t.dataset.action];
      if (fn) fn(t.dataset.arg !== undefined ? t.dataset.arg : null, t.value, t);
    }
  });
}

// ── Phase 1 Learning Insights: label maps + intervention event helpers ───
// Mirrors src/dashboard.js. Copies kept in lockstep — see the in-app file
// for the canonical version. Update both whenever a new tag is added.

var _TAG_LABEL_MAP = {
  // K: Counting & Cardinality
  'counting':'Counting','count_to_10':'Counting to 10','count_to_20':'Counting to 20',
  'count_backward':'Counting Backward','count_forward':'Counting Forward',
  'count_from_any':'Counting from Any Number','count_strategy':'Counting Strategies',
  'cardinality':'How Many in All','subitize':'Quick Look (Subitize)',
  'recognize_groups':'Recognizing Groups','organize_groups':'Organizing Groups',
  'numeral_recognition':'Reading Numerals','teen_numbers':'Teen Numbers',
  'by_ones':'Counting by Ones','by_tens':'Counting by Tens','skip_count':'Skip Counting',
  // K: Number Relationships
  'number_relationships':'Number Relationships','one_more':'One More','one_less':'One Less',
  'compare':'Comparing Numbers','more_fewer_same':'More, Fewer, or Same',
  'greater_less_equal':'Greater, Less, or Equal','more_less_equal':'More, Less, or Equal',
  'more_fewer':'More or Fewer','compose':'Putting Numbers Together',
  'decompose':'Breaking Numbers Apart','missing_number':'Missing Numbers','pattern':'Number Patterns',
  // K: Addition & Subtraction
  'add_sub':'Adding & Subtracting','addition':'Addition','subtraction':'Subtraction',
  'join':'Joining Groups','take_away':'Taking Away','word_problem':'Word Problems',
  'operation_choice':'Choosing the Right Operation','reasoning':'Explaining Thinking',
  'join_separate':'Joining & Separating',
  // K: Geometry
  'shapes':'Shapes','2d':'Flat Shapes (2D)','3d':'Solid Shapes (3D)',
  'sides':'Sides of Shapes','corners':'Corners of Shapes','identify':'Identifying',
  'sort':'Sorting','attributes':'Shape Attributes',
  // K: Measurement
  'measurement':'Measurement','length':'Length','height':'Height',
  'weight':'Weight','capacity':'Capacity','order':'Ordering','sequence':'Ordering in Sequence',
  // K: Data Analysis
  'data':'Reading Data','categorize':'Sorting into Categories',
  'picture_graph':'Picture Graphs','build_read':'Building & Reading Graphs',
  // K: Financial Literacy
  'money':'Money','income':'Earning Money','jobs':'Jobs & Income',
  'wants':'Wants','needs':'Needs','coins':'Coins',
  'penny':'Pennies','nickel':'Nickels','dime':'Dimes','quarter':'Quarters',
  // Grade 1/2: Basic Facts
  'basic_facts':'Basic Math Facts','doubles':'Doubles','make_ten':'Make a 10',
  'count_up':'Count Up','count_back':'Count Back','number_families':'Fact Families',
  // Grade 1/2: Place Value & Operations
  'place_value':'Place Value','regrouping':'Regrouping','skip_counting':'Skip Counting',
  'estimation':'Estimating','rounding':'Rounding','mental_math':'Mental Math',
  // Grade 1/2: Other
  'fractions':'Fractions','geometry':'Geometry','time':'Telling Time',
  'multiplication':'Multiplication','division':'Division','financial_literacy':'Financial Literacy',
};

// Parent-facing labels for every err_* tag used across K and Grade 1/2.
var _ERR_LABEL_MAP = {
  'err_count_inclusive':'Counted from wrong start','err_off_by_one':'Off by one',
  'err_wrong_operation':'Used wrong operation (+/−)','err_forgot_carry':'Forgot to carry',
  'err_forgot_borrow':'Forgot to borrow','err_no_regroup':'Forgot to regroup',
  'err_place_value_confusion':'Place value mix-up','err_skip_count_error':'Skip-count mistake',
  'err_double_count':'Counted same thing twice','err_magnitude_error':'Answer size was off',
  'err_inverse_confusion':'Add vs. subtract direction',
  'err_under_count':'Counted too few','err_over_count':'Counted too many',
  'err_count_all':'Counted each one (no shortcut)','err_teen':'Mixed up teen numbers',
  'err_subitize':'Needed to count one by one',
  'err_more':'Chose more instead of less','err_less':'Chose less instead of more',
  'err_same':'Said same when different','err_not_equal':'Said not equal when equal',
  'err_equal_confusion':'Thought amounts were equal',
  'err_sub_instead':'Subtracted instead of added','err_add_instead':'Added instead of subtracted',
  'err_keep_start':'Used starting number as answer','err_keep_total':'Kept total instead of separating',
  'err_double_left':'Doubled the first number','err_double_right':'Doubled the second number',
  'err_shape_confuse':'Mixed up shape names','err_shape_orient':'Confused by shape rotation',
  'err_shape_sort':'Sorted shapes incorrectly','err_corner_count':'Wrong corner count',
  'err_2d_3d_confuse':'Flat vs. solid mix-up','err_wrong_solid':'Named wrong solid shape',
  'err_size_distractor':'Distracted by size','err_color_distractor':'Confused by color',
  'err_visual_confusion':'Visual mix-up',
  'err_size_confuse':'Judged by size, not measurement','err_size_confusion':'Chose wrong size',
  'err_length_confuse':'Length vs. height mix-up','err_longer_shorter':'Longer vs. shorter mix-up',
  'err_heavier_lighter':'Heavier vs. lighter mix-up','err_weight_confuse':'Weight mix-up',
  'err_capacity_confuse':'Which holds more — mix-up',
  'err_wrong_category':'Wrong group or category','err_whole':'Chose total instead of one group',
  'err_coin_confusion':'Mixed up coin names','err_wrong_coin':'Named the wrong coin',
  'err_confuses_want_need':'Want vs. need mix-up','err_picks_want_as_need':'Chose a want as a need',
  'err_picks_need_as_want':'Chose a need as a want','err_not_income':'Missed the income source',
  'err_confuses_gift_income':'Gift vs. earned money mix-up',
  'err_confused':'General mix-up',
};

// One-sentence parent guidance shown below each mistake label.
var _ERR_HELP_MAP = {
  'err_count_inclusive':'When counting up, start from the next number — not the number itself.',
  'err_off_by_one':'Use objects: one finger touch per count, stop on the very last one.',
  'err_wrong_operation':'Read the question aloud — "altogether" means add; "left over" means subtract.',
  'err_forgot_carry':'Try graph paper with one digit per box so carrying is easier to track.',
  'err_forgot_borrow':'Stack the numbers and circle the column you are borrowing from before starting.',
  'err_no_regroup':'Write out each step — show them to circle the tens and carry that amount over.',
  'err_place_value_confusion':'Use physical tens-rods and ones-cubes so each digit has a visible value.',
  'err_skip_count_error':'Chant the skip-count sequence together daily; clap on each number.',
  'err_double_count':'After counting an object, push it aside so it cannot be counted again.',
  'err_magnitude_error':'Ask first: "Should the answer be bigger or smaller than what we started with?"',
  'err_inverse_confusion':'Draw a number line: adding slides right, subtracting slides left.',
  'err_under_count':'Slow the count down — touch each object once and say the number out loud.',
  'err_over_count':'Stop counting the moment you run out of objects to touch.',
  'err_count_all':'Show a group of 2 or 3 dots briefly and ask how many — practice without counting.',
  'err_teen':'Use a number chart together — point to each teen number and say it aloud.',
  'err_subitize':'Flash dot cards (1 to 5 dots) quickly; practice naming the group without counting.',
  'err_more':'Reread the question — look for the word "fewer" or "less" to know the direction.',
  'err_less':'Reread the question — look for the word "more" to know the direction.',
  'err_same':'Line two groups side by side and count each — do the totals match?',
  'err_not_equal':'Count both groups together; if the counts match, they are equal.',
  'err_equal_confusion':'Put two groups side by side; count each and compare the totals out loud.',
  'err_sub_instead':'The + sign means getting more — act it out by adding objects to a pile.',
  'err_add_instead':'The minus sign means taking away — physically remove objects from a group.',
  'err_keep_start':'Start at the first number and count on — use fingers for the second number.',
  'err_keep_total':'Use objects: put the total in a pile, then take out the part you know.',
  'err_double_left':'Put two separate groups on the table — make sure they are different amounts.',
  'err_double_right':'Put two separate groups on the table — make sure they are different amounts.',
  'err_shape_confuse':'Count corners together: triangle = 3, square = 4, rectangle = 4, circle = 0.',
  'err_shape_orient':'A triangle upside down is still a triangle — its name comes from its corners.',
  'err_shape_sort':'Sort shapes into two piles: "curved sides" and "straight sides."',
  'err_corner_count':'Trace each corner with a finger and tap the table once per corner.',
  'err_2d_3d_confuse':'Flat shapes can be drawn on paper; solid shapes can be picked up and rolled.',
  'err_wrong_solid':'Hold real solid shapes and name each one by touching its faces and edges.',
  'err_size_distractor':'Shape names do not change by size — a tiny triangle and a huge one are both triangles.',
  'err_color_distractor':'Shape names do not change by color — a red square is still a square.',
  'err_visual_confusion':'Focus on the key feature: flat or curved sides, and how many corners.',
  'err_size_confuse':'Focus only on the attribute asked (length, weight) — ignore other differences.',
  'err_size_confusion':'Bigger does not always mean heavier — focus on the attribute being measured.',
  'err_length_confuse':'Length goes side to side; height goes up and down — use a ruler to show both.',
  'err_longer_shorter':'Line objects up at one end; which sticks out further is longer.',
  'err_heavier_lighter':'Hold one object in each hand and feel which pulls down more.',
  'err_weight_confuse':'Hold one object in each hand and feel which pulls down more.',
  'err_capacity_confuse':'Pour water into two containers — which one overflows first holds less.',
  'err_wrong_category':'Point to the label of each column or group and read it together out loud.',
  'err_whole':'Find the bar for just one category — do not add all groups together.',
  'err_coin_confusion':'Sort real coins; say name and value: penny 1c, nickel 5c, dime 10c, quarter 25c.',
  'err_wrong_coin':'Make a coin chart: penny = small copper, nickel = big silver, dime = small silver.',
  'err_confuses_want_need':'Needs are things to survive (food, shelter); wants are extras we enjoy.',
  'err_picks_want_as_need':'Ask: "Could you stay healthy without this?" If yes, it is probably a want.',
  'err_picks_need_as_want':'Ask: "Do you need this to stay safe and healthy?" If yes, it is a need.',
  'err_not_income':'Income is money earned by working — ask "is someone being paid for a job here?"',
  'err_confuses_gift_income':'A gift is given freely; income is earned by working.',
  'err_confused':'Work through one example together with real objects before trying on screen.',
};

// Read intervention events from localStorage. Phase 1 standalone reads only
// from the local key; cross-device Supabase fetch is in the in-app dashboard
// (see _loadRemoteInterventionData in src/dashboard.js) and remains a Phase 2
// follow-up on the standalone surface.
function _getInterventionEvents() {
  try {
    var raw = (typeof localStorage !== 'undefined') ? localStorage.getItem('mmr_intervention_events_v1') : null;
    var parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

// Phase 1 Learning Insights renderer. Mirrors src/dashboard.js. Returns the
// section HTML wrapped in _dbSection('insights', ...) so collapse state is
// shared across the dashboard's sections.
function _renderLearningInsightsV2(insights) {
  if (!insights) return '';

  var card = function(cssClass, headerHtml, bodyHtml) {
    return '<div class="li-card ' + cssClass + '" '
      + 'style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:12px 14px;margin:0;">'
      + '<div class="li-card-h" style="font-size:.85rem;font-weight:700;color:#37474f;margin:0 0 8px;display:flex;align-items:center;gap:6px">'
      + headerHtml + '</div>'
      + bodyHtml
      + '</div>';
  };
  var subLine = function(txt) {
    return '<div class="li-sub" style="font-size:.78rem;color:#546e7a;margin-top:4px;line-height:1.35">' + txt + '</div>';
  };

  var gradeChip = '<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#eceff1;color:#37474f;font-size:.7rem;font-weight:600;letter-spacing:.04em">'
    + (insights.viewBand === 'k' ? 'KINDERGARTEN' : insights.viewBand === 'g1' ? 'GRADE 1' : 'GRADE 2')
    + '</span>';

  if (!insights.hasAnyData) {
    var emptyBody = '<p style="margin:0;color:#546e7a;font-size:.85rem">Not enough data yet to spot patterns for this grade.</p>'
      + '<p style="margin:8px 0 0;font-size:.85rem"><strong>Try this:</strong> ' + _esc(insights.parentAction.label) + '</p>';
    return _dbSection('insights', '&#x1F9E0; Learning Insights' + gradeChip, emptyBody);
  }

  var sections = [];

  if (insights.needsPractice.length) {
    var npRows = insights.needsPractice.map(function(np, idx) {
      var sep = idx === 0 ? '' : 'border-top:1px dashed #eceff1;padding-top:6px;margin-top:6px;';
      return '<div style="' + sep + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-weight:600;color:#263238">' + _esc(np.label) + '</span>'
        + '<span style="color:#c62828;font-weight:700">' + np.accuracy + '%</span>'
        + '</div>'
        + subLine(_esc(np.why))
        + (np.lessonName ? subLine('<strong>Try:</strong> ' + _esc(np.recommendation)) : '')
        + '</div>';
    }).join('');
    sections.push(card('li-needs-practice', '&#x1F4DD; Needs Practice', npRows));
  }

  if (insights.commonMistakes.length) {
    var cmRows = insights.commonMistakes.map(function(cm, idx) {
      var sep = idx === 0 ? '' : 'border-top:1px dashed #eceff1;padding-top:6px;margin-top:6px;';
      var lessonLine = '';
      if (cm.lessonId && cm.lessonName) {
        var um = String(cm.lessonId).match(/u(\d+)[-]?l(\d+)$/i);
        var prefix = um ? ('Unit ' + um[1] + ' Lesson ' + um[2] + ': ') : '';
        lessonLine = subLine('&#x1F4CD; Most common in ' + _esc(prefix + cm.lessonName));
      }
      return '<div style="' + sep + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-weight:600;color:#263238">' + _esc(cm.label) + '</span>'
        + '<span style="color:#e65100;font-weight:700">' + cm.count + '&#xD7;</span>'
        + '</div>'
        + lessonLine
        + (cm.helpText ? subLine('&#x1F4A1; ' + _esc(cm.helpText)) : '')
        + '</div>';
    }).join('');
    sections.push(card('li-common-mistakes', '&#x26A0;&#xFE0F; Common Mistakes', cmRows));
  }

  if (insights.strengths.length) {
    var stRows = insights.strengths.map(function(st, idx) {
      var sep = idx === 0 ? '' : 'border-top:1px dashed #eceff1;padding-top:6px;margin-top:6px;';
      return '<div style="' + sep + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-weight:600;color:#263238">' + _esc(st.label) + '</span>'
        + '<span style="color:#2e7d32;font-weight:700">' + st.accuracy + '%</span>'
        + '</div>'
        + subLine(st.attempts + ' attempt' + (st.attempts !== 1 ? 's' : '') + ' &mdash; strong.')
        + '</div>';
    }).join('');
    sections.push(card('li-strengths', '&#x2B50; Strengths', stRows));
  }

  var trendBadge, trendText, trendColor;
  switch (insights.trend.state) {
    case 'improving': trendBadge = '&#x2191; Improving';       trendText = 'Recent answers are getting more right.'; trendColor = '#2e7d32'; break;
    case 'declining': trendBadge = '&#x2193; Needs attention'; trendText = 'Recent answers show more misses.';        trendColor = '#c62828'; break;
    case 'steady':    trendBadge = '&#x2192; Steady';          trendText = 'Accuracy is holding steady.';            trendColor = '#1565c0'; break;
    default:          trendBadge = 'Not enough data yet';      trendText = 'A few more quizzes will unlock the trend.'; trendColor = '#90a4ae';
  }
  sections.push(card('li-trend', '&#x1F4C8; Trend',
    '<div><span style="display:inline-block;padding:3px 8px;border-radius:999px;background:' + trendColor + '15;color:' + trendColor + ';font-weight:700;font-size:.78rem">'
    + trendBadge + '</span></div>' + subLine(_esc(trendText))));

  sections.push(card('li-next-step', '&#x1F3AF; Recommended Next Step',
    '<div style="font-weight:700;color:#263238;font-size:.92rem">' + _esc(insights.nextStep.label) + '</div>'
    + subLine(_esc(insights.nextStep.why))));

  if (insights.interventionRecovery.state === 'not-enough-data') {
    sections.push(card('li-recovery li-recovery-empty', '&#x1F501; Intervention Recovery',
      '<div style="color:#90a4ae;font-size:.85rem">Not enough intervention data yet.</div>'));
  } else {
    var rec = insights.interventionRecovery;
    var recColor = rec.state === 'good' ? '#2e7d32' : rec.state === 'ok' ? '#e65100' : '#c62828';
    var perTag = (rec.topTag && rec.topTagPct != null)
      ? subLine(_esc(rec.topTagLabel) + ': ' + rec.topTagPct + '% corrected on next try.')
      : '';
    sections.push(card('li-recovery', '&#x1F501; Intervention Recovery',
      '<div style="font-size:1.4rem;font-weight:700;color:' + recColor + '">' + rec.overallPct + '%</div>'
      + subLine(rec.total + ' extra-help moment' + (rec.total !== 1 ? 's' : '') + '.')
      + perTag));
  }

  sections.push(card('li-parent-action', '&#x1F44B; Parent Action',
    '<div style="font-weight:700;color:#263238;font-size:.92rem">' + _esc(insights.parentAction.label) + '</div>'
    + subLine(_esc(insights.parentAction.why))));

  var body = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:6px">'
    + sections.join('') + '</div>';
  return _dbSection('insights', '&#x1F9E0; Learning Insights' + gradeChip, body);
}

// ── Insight engine helpers (duplicated here for testability) ─────────────

function _bie_computeTagStats(mastery) {
  return Object.keys(mastery || {}).map(function(tag) {
    var m = mastery[tag];
    var attempts = m.attempts || 0;
    return { tag: tag, attempts: attempts, correct: m.correct || 0,
             accuracy: attempts ? (m.correct || 0) / attempts : 0 };
  }).sort(function(a, b) { return a.accuracy - b.accuracy; });
}

function _bie_computeMisconceptions(events) {
  var counts = {};
  (events || []).forEach(function(e) {
    if (e.errorType) counts[e.errorType] = (counts[e.errorType] || 0) + 1;
  });
  return counts;
}

function _bie_buildTagLessonMap(events) {
  var map = {};
  (events || []).forEach(function(e) {
    if (!e.lessonId) return;
    (e.tags || []).forEach(function(tag) {
      if (!map[tag]) map[tag] = {};
      map[tag][e.lessonId] = (map[tag][e.lessonId] || 0) + 1;
    });
  });
  return map;
}

function _bie_recommendLesson(weakTags, tagLessonMap) {
  var recs = [], seen = {};
  weakTags.forEach(function(t) {
    var lessons = tagLessonMap[t.tag] || {};
    Object.keys(lessons).sort(function(a, b) { return lessons[b] - lessons[a]; })
      .slice(0, 2).forEach(function(lessonId) {
        if (!seen[lessonId]) { seen[lessonId] = true; recs.push({ lessonId: lessonId, weakTag: t.tag }); }
      });
  });
  return recs[0] || null;
}

function _bie_computeTrend(activityEvents) {
  var sorted = (activityEvents || [])
    .filter(function(e) { return e.ts && typeof e.correct === 'boolean'; })
    .sort(function(a, b) { return a.ts - b.ts; })
    .slice(-10);
  if (sorted.length < 6) return 'steady';
  var first5 = sorted.slice(0, 5);
  var last5  = sorted.slice(-5);
  var acc5first = first5.filter(function(e) { return e.correct; }).length / 5;
  var acc5last  = last5.filter(function(e)  { return e.correct; }).length / 5;
  var delta = acc5last - acc5first;
  if (delta >=  0.20) return 'improving';
  if (delta <= -0.20) return 'declining';
  return 'steady';
}

var _BIE_CSS_TIER = {
  'no-data': 'no-data', 'low-data': 'no-data',
  'needs-review': 'needs-review', 'declining': 'needs-review',
  'improving': 'developing', 'mixed': 'developing', 'developing': 'developing',
  'strong': 'strong',
};

function buildParentInsight(opts) {
  var mastery        = opts.mastery        || {};
  var activityEvents = opts.activityEvents || [];
  var scores         = opts.scores         || [];
  var studentName    = opts.studentName    || 'Your child';
  var tagLabels      = opts.tagLabels      || {};
  var errLabels      = opts.errLabels      || {};
  var lessonNameFn   = opts.lessonNameFn   || function() { return null; };

  var tagStats   = _bie_computeTagStats(mastery);
  var weakTags   = tagStats.filter(function(t) { return t.attempts >= 3 && t.accuracy < 0.60; });
  var strongTags = tagStats.filter(function(t) { return t.attempts >= 3 && t.accuracy >= 0.80; });
  var topWeakTag   = weakTags[0]   || null;
  var topStrongTag = strongTags[strongTags.length - 1] || null;

  var completedScores = scores.filter(function(s) { return s.pct != null && s.total > 0; });
  var totalQuestionsAnswered = completedScores.reduce(function(a, s) { return a + (s.total || 0); }, 0);
  var overallAccuracy = completedScores.length > 0
    ? Math.round(completedScores.reduce(function(a, s) { return a + s.pct; }, 0) / completedScores.length)
    : 0;

  var confidence;
  if (totalQuestionsAnswered < 3)       confidence = 'none';
  else if (totalQuestionsAnswered < 10) confidence = 'low';
  else if (totalQuestionsAnswered < 30) confidence = 'medium';
  else                                  confidence = 'high';

  var trend = _bie_computeTrend(activityEvents);

  var errCounts = _bie_computeMisconceptions(activityEvents);
  var topErr = null, topErrCount = 0;
  Object.keys(errCounts).forEach(function(t) {
    if (errCounts[t] > topErrCount) { topErr = t; topErrCount = errCounts[t]; }
  });

  var topRec = topWeakTag
    ? _bie_recommendLesson(weakTags, _bie_buildTagLessonMap(activityEvents))
    : null;
  var actionLessonId   = topRec ? topRec.lessonId : null;
  var actionLessonName = null;
  if (actionLessonId) {
    var ldn = lessonNameFn(actionLessonId);
    actionLessonName = ldn ? ldn.lesson : null;
  }

  var _toTitle = function(s) {
    return s ? s.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }) : s;
  };
  var weakTagLabel   = topWeakTag   ? (tagLabels[topWeakTag.tag]   || _toTitle(topWeakTag.tag))   : null;
  var strongTagLabel = topStrongTag ? (tagLabels[topStrongTag.tag] || _toTitle(topStrongTag.tag)) : null;
  var commonErrorLabel = topErr ? (errLabels[topErr] || null) : null;

  var tier;
  var isMixed = weakTags.length > 0 && strongTags.length > 0;
  if (confidence === 'none') {
    tier = 'no-data';
  } else if (confidence === 'low' && weakTags.length === 0) {
    tier = 'low-data';
  } else if (weakTags.length > 0) {
    if      (trend === 'improving') tier = 'improving';
    else if (trend === 'declining') tier = 'declining';
    else if (isMixed)               tier = 'mixed';
    else                            tier = 'needs-review';
  } else if (overallAccuracy >= 80 || strongTags.length >= 2) {
    tier = 'strong';
  } else {
    tier = 'developing';
  }

  var n = studentName;
  var wpct = topWeakTag ? Math.round(topWeakTag.accuracy * 100) : 0;
  var wattempts = topWeakTag ? topWeakTag.attempts : 0;
  var errSuffix = commonErrorLabel ? ' Most common mistake: ' + commonErrorLabel + '.' : '';
  var headline, summary, actionLabel, why;

  switch (tier) {
    case 'no-data':
      headline    = 'Not enough data';
      summary     = n + ' needs a few more practice questions before we can spot patterns.';
      actionLabel = 'Complete one more lesson quiz to unlock better insights.';
      why         = 'There is not enough activity yet to identify a weak skill.';
      break;
    case 'low-data':
      headline    = 'Getting started';
      summary     = n + ' has started practicing. A few more questions will unlock skill-level insights.';
      actionLabel = 'Try a 5-question quiz on any lesson.';
      why         = 'We have ' + totalQuestionsAnswered + ' answer' + (totalQuestionsAnswered !== 1 ? 's' : '') + ' so far — a few more will unlock skill-level insights.';
      break;
    case 'needs-review':
      headline    = 'Needs review';
      summary     = n + ' is struggling most with ' + weakTagLabel + '. ' + wpct + '% accuracy across ' + wattempts + ' question' + (wattempts !== 1 ? 's' : '') + (commonErrorLabel ? ', most common mistake: ' + commonErrorLabel + '.' : '.');
      actionLabel = actionLessonName ? 'Review: ' + actionLessonName + '.' : 'Spend a few minutes practicing ' + weakTagLabel + '.';
      why         = weakTagLabel + ' is at ' + wpct + '% accuracy across ' + wattempts + ' attempt' + (wattempts !== 1 ? 's' : '') + '.' + errSuffix;
      break;
    case 'improving':
      headline    = 'Improving';
      summary     = n + ' still needs work on ' + weakTagLabel + ', but recent answers are improving. Keep going.';
      actionLabel = actionLessonName ? 'Continue: ' + actionLessonName + '.' : 'Keep practicing ' + weakTagLabel + '.';
      why         = wpct + '% accuracy on ' + weakTagLabel + ' across ' + wattempts + ' attempt' + (wattempts !== 1 ? 's' : '') + '. Recent answers show improvement.';
      break;
    case 'declining':
      headline    = 'Needs attention';
      summary     = n + '\'s recent answers show more misses in ' + weakTagLabel + '. A short review now can help.';
      actionLabel = actionLessonName ? 'Review ' + actionLessonName + ' before moving ahead.' : 'Review ' + weakTagLabel + ' before the next lesson.';
      why         = wpct + '% accuracy on ' + weakTagLabel + '. Recent trend: more misses.' + errSuffix;
      break;
    case 'mixed':
      headline    = 'Mixed';
      summary     = n + ' is strong in ' + strongTagLabel + ' but needs review in ' + weakTagLabel + '.';
      actionLabel = actionLessonName ? 'Focus on ' + actionLessonName + ' this week.' : 'Spend a few minutes on ' + weakTagLabel + ' this week.';
      why         = weakTagLabel + ' is at ' + wpct + '% accuracy (' + wattempts + ' attempt' + (wattempts !== 1 ? 's' : '') + ').' + errSuffix;
      break;
    case 'strong':
      headline    = 'Strong';
      summary     = n + ' is doing well overall. Keep practicing to stay sharp.';
      actionLabel = 'Try a new lesson to keep growing.';
      why         = strongTags.length + ' skill' + (strongTags.length !== 1 ? 's' : '') + ' at 80%+ accuracy.';
      break;
    case 'developing':
    default:
      headline    = 'Developing';
      summary     = n + ' is developing in math. Steady practice is making a difference.';
      actionLabel = 'Continue with the recommended lessons below.';
      why         = totalQuestionsAnswered + ' question' + (totalQuestionsAnswered !== 1 ? 's' : '') + ' answered. Keep building the streak.';
      break;
  }

  return {
    tier:             tier,
    cssTier:          _BIE_CSS_TIER[tier] || 'developing',
    headline:         headline,
    summary:          summary,
    actionLabel:      actionLabel,
    actionLessonId:   actionLessonId,
    actionLessonName: actionLessonName,
    why:              why,
    confidence:       confidence,
    weakTag:          topWeakTag   ? topWeakTag.tag   : null,
    weakTagLabel:     weakTagLabel,
    weakTagAccuracy:  topWeakTag   ? topWeakTag.accuracy   : null,
    weakTagAttempts:  topWeakTag   ? topWeakTag.attempts   : null,
    strongTag:        topStrongTag ? topStrongTag.tag : null,
    strongTagLabel:   strongTagLabel,
    commonErrorType:  topErr,
    commonErrorLabel: commonErrorLabel,
    trend:            trend,
  };
}

// ── Canonical grade normalizer (also defined in src/state.js) ────────────
// Map any grade-ish input to canonical 'K', '1', or '2'. Duplicated here so
// Jest can call it without booting the full app.
function normalizeGrade(value) {
  if (value === null || value === undefined) return '2';
  var s = String(value).trim().toLowerCase();
  if (s === 'k' || s === 'kindergarten' || s === '0') return 'K';
  if (s === '1') return '1';
  return '2';
}

// Summarise intervention events into total, recoveryRate and per-tag counts.
// Mirrors src/dashboard.js _summarizeInterventions.
function _summarizeInterventions(events) {
  var byTag = {};
  var total = 0;
  var resolved = 0;
  (events || []).forEach(function(e) {
    if (e.type === 'triggered') {
      total++;
      if (!byTag[e.errorTag]) byTag[e.errorTag] = { count: 0, resolved: 0 };
      byTag[e.errorTag].count++;
    }
    if (e.type === 'resolved') {
      if (e.resolvedCorrectly) resolved++;
      if (byTag[e.errorTag] && e.resolvedCorrectly) byTag[e.errorTag].resolved++;
    }
  });
  return {
    total: total,
    recoveryRate: total ? Math.round((resolved / total) * 100) : 0,
    byTag: byTag,
  };
}

// Filter activity events to only those matching the active grade. Events
// without a grade field are kept (legacy / un-tagged data). Active grade is
// passed in by the caller after running through normalizeGrade().
function _filterActivityByGrade(events, activeGrade) {
  var g = normalizeGrade(activeGrade);
  return (events || []).filter(function(e) {
    if (!e) return false;
    if (e.grade == null) return true;
    return normalizeGrade(e.grade) === g;
  });
}

// Resolve the localStorage key for grade-scoped mastery aggregates.
function _masteryKeyFor(grade) {
  return 'mmr_mastery_v1_' + normalizeGrade(grade);
}

// ── Per-profile grade resolver (mirrors src/dashboard.js) ────────────────
function _dbProfileGradeKey(id) { return 'mmr_profile_grade_' + String(id); }

function _dbReadProfileGrade(id) {
  if (!id) return '2';
  try {
    var v = (typeof localStorage !== 'undefined') ? localStorage.getItem(_dbProfileGradeKey(id)) : null;
    return normalizeGrade(v);
  } catch (_e) { return '2'; }
}

function _dbWriteProfileGrade(id, grade) {
  if (!id) return;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(_dbProfileGradeKey(id), normalizeGrade(grade));
    }
  } catch (_e) {}
}

// Resolver precedence: profile.grade → mmr_profile_grade_<id> → mmr_grade → '2'
function _dbResolveProfileGrade(profile, fallbackProfileId) {
  if (profile && profile.grade != null && profile.grade !== '') {
    var fromProfile = normalizeGrade(profile.grade);
    if (profile.id) _dbWriteProfileGrade(profile.id, fromProfile);
    return fromProfile;
  }

  var id = (profile && profile.id) || fallbackProfileId;
  if (id) {
    try {
      var cached = (typeof localStorage !== 'undefined') ? localStorage.getItem(_dbProfileGradeKey(id)) : null;
      if (cached) return normalizeGrade(cached);
    } catch (_e) {}
  }

  try {
    var current = (typeof localStorage !== 'undefined') ? localStorage.getItem('mmr_grade') : null;
    if (current) {
      var g = normalizeGrade(current);
      if (id) _dbWriteProfileGrade(id, g);
      return g;
    }
  } catch (_e) {}

  return '2';
}

// ── Unit progress map helper (duplicated here for testability) ───────────

// Normalize a unit identifier to a zero-based unitsMeta index.
// QE.normalize emits unitId as 'u3' / 'ku3' (1-based), but scores carry a
// raw integer unitIdx. Accept either so activity events can be matched
// against the same map keys as scores.
function _unitIndexFromId(unitId) {
  if (unitId == null) return null;
  if (typeof unitId === 'number' && Number.isFinite(unitId)) return unitId;
  var s = String(unitId);
  var m = s.match(/^k?u(\d+)$/i);
  if (m) return Number(m[1]) - 1;
  if (/^\d+$/.test(s)) return Number(s);
  return null;
}

function _computeUnitInsights(opts) {
  var scores         = opts.scores         || [];
  var activityEvents = opts.activityEvents || [];
  var unitsMeta      = opts.unitsMeta      || [];
  var tagLabels      = opts.tagLabels      || {};
  var errLabels      = opts.errLabels      || {};
  var errHelpMap     = opts.errHelpMap     || {};
  var lessonNameFn   = opts.lessonNameFn   || function() { return null; };

  var _toTitle = function(s) {
    return s ? s.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }) : s;
  };

  // Group scores by unitIdx
  var scoreMap = {};
  scores.forEach(function(s) {
    if (s.unitIdx == null || s.pct == null || s.total <= 0) return;
    var k = s.unitIdx;
    if (!scoreMap[k]) scoreMap[k] = { sumPct: 0, count: 0, correct: 0, total: 0 };
    scoreMap[k].sumPct  += s.pct;
    scoreMap[k].count   += 1;
    scoreMap[k].correct += (s.score  || 0);
    scoreMap[k].total   += (s.total  || 0);
  });

  // Group activity events by normalized unit index. Accepts both raw integer
  // unitIdx and string unitId ('u3' / 'ku3') from QE.normalize.
  var actMap = {};
  activityEvents.forEach(function(e) {
    var k = _unitIndexFromId(e.unitId);
    if (k == null) return;
    if (!actMap[k]) actMap[k] = [];
    actMap[k].push(e);
  });

  return unitsMeta.map(function(unit, idx) {
    var sd     = scoreMap[idx];
    var events = actMap[idx] || [];

    if (!sd) {
      return {
        idx: idx, name: unit.name, lessons: unit.lessons || [],
        status: 'not-started', accuracy: null, total: 0,
        correct: 0, quizCount: 0,
        weakTagLabel: null, topErrLabel: null, topErrHelp: null, lessonRec: null,
      };
    }

    var accuracy = Math.round(sd.sumPct / sd.count);

    // Tag-level accuracy from unit activity events
    var tagBucket = {};
    events.forEach(function(e) {
      (e.tags || []).forEach(function(tag) {
        if (!tagBucket[tag]) tagBucket[tag] = { attempts: 0, correct: 0 };
        tagBucket[tag].attempts++;
        if (e.correct) tagBucket[tag].correct++;
      });
    });
    var weakTagKey = null, weakTagAcc = 1;
    Object.keys(tagBucket).forEach(function(tag) {
      var t = tagBucket[tag];
      if (t.attempts < 3) return;
      var acc = t.correct / t.attempts;
      if (acc < 0.60 && acc < weakTagAcc) { weakTagKey = tag; weakTagAcc = acc; }
    });

    // Most common error in unit activity
    var errCounts = {};
    events.forEach(function(e) {
      if (e.errorType) errCounts[e.errorType] = (errCounts[e.errorType] || 0) + 1;
    });
    var topErrKey = null, topErrCount = 0;
    Object.keys(errCounts).forEach(function(t) {
      if (errCounts[t] > topErrCount) { topErrKey = t; topErrCount = errCounts[t]; }
    });

    // Lesson recommendation: most practiced lesson for the weak tag
    var lessonRec = null;
    if (weakTagKey) {
      var lessonCounts = {};
      events.forEach(function(e) {
        if (e.lessonId && (e.tags || []).indexOf(weakTagKey) !== -1) {
          lessonCounts[e.lessonId] = (lessonCounts[e.lessonId] || 0) + 1;
        }
      });
      var topLessonId = Object.keys(lessonCounts)
        .sort(function(a, b) { return lessonCounts[b] - lessonCounts[a]; })[0] || null;
      if (topLessonId) {
        var ldn = lessonNameFn(topLessonId);
        lessonRec = ldn ? ldn.lesson : null;
      }
    }

    var status;
    if (sd.total < 5)                      status = 'low-data';
    else if (weakTagKey || accuracy < 60)  status = 'needs-review';
    else if (accuracy < 80)                status = 'developing';
    else                                   status = 'strong';

    return {
      idx:          idx,
      name:         unit.name,
      lessons:      unit.lessons || [],
      status:       status,
      accuracy:     accuracy,
      total:        sd.total,
      correct:      sd.correct,
      quizCount:    sd.count,
      weakTagLabel: weakTagKey ? (tagLabels[weakTagKey] || _toTitle(weakTagKey)) : null,
      topErrLabel:  topErrKey  ? (errLabels[topErrKey]  || null) : null,
      topErrHelp:   topErrKey  ? (errHelpMap[topErrKey] || null) : null,
      lessonRec:    lessonRec,
    };
  });
}

// ── Lesson-name resolution (Phase 2B) ────────────────────────────────────
// Per-grade unit/lesson-title metadata. Mirrors src/dashboard.js so the
// standalone surface can resolve G1 lesson IDs in tests. Update both files
// together when content changes.

var _K_UNITS_META = [
  { name: 'Counting & Cardinality',             lessons: ['Counting to 10','Quick Look','Counting to 20','Count to 20 — Review','Read and Represent 11–20','Counting Strategies','Quick Look: Subitize'] },
  { name: 'Number Relationships',               lessons: ['One More, One Less','Compare Sets','Compare Numbers','Compose & Decompose','More, Less, and Equal','One More / One Less — Review'] },
  { name: 'Addition & Subtraction',             lessons: ['Adding Numbers','Subtracting Numbers','Word Problems','Explain Thinking','Story Problems: Join & Separate','Explain Your Math'] },
  { name: 'Counting Patterns',                  lessons: ['Count Forward by Ones','Count by Tens','Count from Any Number','Missing Numbers in Patterns'] },
  { name: 'Geometry — Shapes & Solids',         lessons: ['Flat Shapes (2D)','Solid Shapes (3D)','Sides & Corners','Sort & Create Shapes'] },
  { name: 'Measurement — Comparing & Ordering', lessons: ['Comparing Length & Height','Comparing Weight & Capacity','Ordering by Size','Measurable Attributes'] },
  { name: 'Data Analysis',                      lessons: ['Sort Into Groups','Build and Read Picture Graphs','Read Picture Graphs','Compare Data'] },
  { name: 'Financial Literacy & Money',         lessons: ['Earning Money & Jobs','Wants vs Needs','Identify Coins','Compare Coins'] },
];

var _G1_UNITS_META = [
  { name: 'Counting and Number Relationships to 120',
    lessons: ['Quick Looks','Count Forward','Count Backward','Skip Count by 2s, 5s, and 10s','One More and One Less','Ten More and Ten Less','Order Numbers','Compare Numbers'] },
  { name: 'Place Value',
    lessons: ['Groups of Ten','Tens and Ones','Numbers to 120','Represent Numbers'] },
  { name: 'Addition and Subtraction to 20',
    lessons: ['Add Within 20','Subtract Within 20','Doubles and Near Doubles','Make 10','Fact Families and Word Problems'] },
  { name: 'Tens and Ones Operations',
    lessons: ['Add Tens and Ones','10 More and 10 Less','Add Multiples of 10','Add Tens to Two-Digit Numbers','Tens and Ones Word Problems'] },
  { name: 'Geometry',
    lessons: ['2D Shapes — Identify and Describe','3D Shapes — Identify and Describe','Shape Attributes and Sorting','Compose and Recognize 2D Shapes','Equal Parts — Halves and Fourths'] },
  { name: 'Measurement & Time',
    lessons: ['Measuring with Non-Standard Units','Understanding Units of Length','Comparing Measurements','Describing Length','Telling Time'] },
  { name: 'Data Analysis',
    lessons: ['Sorting and Organizing Data','Picture Graphs','Bar-Type Graphs','Drawing Conclusions from Data'] },
  { name: 'Financial Literacy',
    lessons: ['Earning Income','Goods and Services','Spending and Saving','Charitable Giving'] },
];

// Resolve a lessonId string to { lesson, unit }. Supported formats:
//   - K:  'ku<n>l<m>'      e.g. 'ku3l2'
//   - G1: 'g1-u<n>-l<m>'   e.g. 'g1-u8-l3' (also accepts 'g1u<n>-l<m>' / 'g1u<n>l<m>')
//   - G2: 'u<n>l<m>'       e.g. 'u3l2'
// Returns null when unresolvable.
function _lessonDisplayName(lessonId) {
  if (!lessonId) return null;
  var s = String(lessonId);
  var kMatch = s.match(/^ku(\d+)l(\d+)$/i);
  if (kMatch) {
    var ku = _K_UNITS_META[parseInt(kMatch[1], 10) - 1];
    if (!ku) return null;
    var kl = ku.lessons[parseInt(kMatch[2], 10) - 1];
    return kl ? { lesson: kl, unit: ku.name } : null;
  }
  var g1Match = s.match(/^g1[-]?u(\d+)[-]?l(\d+)$/i);
  if (g1Match) {
    var g1u = _G1_UNITS_META[parseInt(g1Match[1], 10) - 1];
    if (!g1u) return null;
    var g1l = g1u.lessons[parseInt(g1Match[2], 10) - 1];
    return g1l ? { lesson: g1l, unit: g1u.name } : null;
  }
  var g2Match = s.match(/^u(\d+)l(\d+)$/i);
  if (g2Match) {
    var g2u = _UNITS_META[parseInt(g2Match[1], 10) - 1];
    if (!g2u) return null;
    var g2l = g2u.lessons[parseInt(g2Match[2], 10) - 1];
    return g2l ? { lesson: g2l, unit: g2u.name } : null;
  }
  return null;
}

// Map a lessonId prefix to a viewBand ('k'|'g1'|'g2'|null). Used by Phase 2B
// to keep static-index lesson recommendations grade-strict.
function _lessonIdBand(lessonId) {
  if (!lessonId) return null;
  var s = String(lessonId).toLowerCase();
  if (/^g1[-]?u\d+[-]?l\d+$/.test(s)) return 'g1';
  if (/^ku\d+l\d+$/.test(s))          return 'k';
  if (/^u\d+l\d+$/.test(s))           return 'g2';
  return null;
}

// ── Phase 1 Learning Insights: grade-filter helpers + builder ────────────
// These power the redesigned Learning Insights section that lives on both
// the in-app dashboard (src/dashboard.js) and the standalone dashboard
// (dashboard/dashboard.js). All inputs to buildLearningInsights are assumed
// to have already been filtered to the selected dashboard view-band.

// Infer the grade band of a single intervention event. Mirrors
// _inferScoreGrade's probe order but reads intervention-shaped fields.
// Returns 'k'|'g1'|'g2'|'legacy_unknown'.
function _inferInterventionGrade(e) {
  if (!e) return 'legacy_unknown';
  if (e.grade) {
    return _gradeBand(e.grade) || 'legacy_unknown';
  }
  var probes = [e.sessionId, e.questionId, e.lessonId, e.unitId]
    .filter(function(p) { return p; });
  for (var i = 0; i < probes.length; i++) {
    var t = String(probes[i]).toLowerCase();
    if (/^(lq_)?g1/.test(t)) return 'g1';
    if (/^(lq_)?(ku|k\d)/.test(t)) return 'k';
    if (/^(lq_)?u\d/.test(t)) return 'g2';
  }
  return 'legacy_unknown';
}

// Filter intervention events to the selected view-band. Records that cannot
// be confidently inferred ('legacy_unknown') are excluded — see audit spec.
function _filterInterventionsByGrade(events, viewBand) {
  if (!Array.isArray(events)) return [];
  var band = _gradeBand(viewBand);
  if (!band) return [];
  return events.filter(function(e) {
    return _inferInterventionGrade(e) === band;
  });
}

// Rebuild a mastery dictionary from already-grade-filtered activity events.
// Avoids leaking student.MASTERY (which is global) into a grade-specific
// view. Each tag accumulates { attempts, correct, lastSeen }.
function _deriveMasteryFromActivity(activityEvents) {
  var out = {};
  if (!Array.isArray(activityEvents)) return out;
  activityEvents.forEach(function(e) {
    if (!e || typeof e.correct !== 'boolean') return;
    var tags = Array.isArray(e.tags) ? e.tags : [];
    tags.forEach(function(tag) {
      if (!tag) return;
      if (!out[tag]) out[tag] = { attempts: 0, correct: 0, lastSeen: 0 };
      out[tag].attempts++;
      if (e.correct) out[tag].correct++;
      if (typeof e.ts === 'number' && e.ts > out[tag].lastSeen) {
        out[tag].lastSeen = e.ts;
      }
    });
  });
  return out;
}

// Phase 2A: per-question diagnostic error tags now ride along on
// score.answers[].errTag. This aggregator turns a list of (already
// grade-filtered) scores into an { errorType: count } map compatible with the
// Common Mistakes pipeline. Answers without errTag (legacy) or with
// errTag === null (correct answers, by convention) are ignored.
// ── Phase 2C: intervention_events.grade column helpers ──────────────────
// Pure builder used by _syncPendingInterventionEvents to construct the upsert
// row sent to Supabase. Extracted so jest can verify the new `grade` field
// round-trips without booting the full app.
function _buildInterventionRowForSync(e, studentId) {
  e = e || {};
  return {
    client_id:          e.clientId,
    student_id:         studentId,
    session_id:         e.sessionId  || '',
    event_type:         e.type       || '',
    error_tag:          e.errorTag   || null,
    question_id:        e.questionId || null,
    resolved_correctly: e.resolvedCorrectly != null ? e.resolvedCorrectly : null,
    occurred_at:        new Date(e.timestamp || Date.now()).toISOString(),
    // Phase 2C: explicit grade tagging. Null on legacy events; the server-side
    // backfill (in the Supabase migration) infers a grade from session_id /
    // question_id for the rows that have null at write time. Future fetches
    // from new clients always include grade.
    grade:              e.grade || null,
  };
}

// Normalize a Supabase intervention_events row into the in-memory event shape
// consumed by _filterInterventionsByGrade / _summarizeInterventions. Phase 2C
// adds `grade` to the projection — older rows (where the column is missing or
// null) fall back to session-id inference downstream.
function _normalizeInterventionRow(r) {
  r = r || {};
  return {
    type:              r.event_type,
    errorTag:          r.error_tag,
    sessionId:         r.session_id,
    resolvedCorrectly: r.resolved_correctly,
    timestamp:         r.occurred_at ? new Date(r.occurred_at).getTime() : null,
    grade:             r.grade || null,
  };
}

// Phase 3A: Normalize a question's difficulty into the canonical long-form
// value used by saved answers and dashboard aggregators. Accepts both
// short-form (q.d = 'e'|'m'|'h') and long-form (q.difficulty = 'easy'|...).
// Untagged or unrecognized values resolve to null (NOT 'medium').
function _normalizeAnswerDifficulty(q) {
  var d = (q && (q.difficulty || q.d)) || null;
  if (d === 'easy'   || d === 'e') return 'easy';
  if (d === 'medium' || d === 'm') return 'medium';
  if (d === 'hard'   || d === 'h') return 'hard';
  return null;
}

function _aggregateMistakesFromScoreAnswers(scores) {
  var counts = {};
  if (!Array.isArray(scores)) return counts;
  scores.forEach(function(s) {
    if (!s || !Array.isArray(s.answers)) return;
    s.answers.forEach(function(a) {
      if (!a) return;
      var tag = a.errTag;
      if (!tag) return;
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}

// Thresholds — kept in one place so the renderer and parent-action text can
// reference them consistently.
var _LI_THRESH = {
  WEAK_MIN_ATTEMPTS:        3,
  WEAK_MAX_ACCURACY:        0.60,
  STRONG_MIN_ATTEMPTS:      5,
  STRONG_MIN_ACCURACY:      0.85,
  MISTAKE_MIN_COUNT:        3,
  TREND_MIN_EVENTS:         6,
  RECOVERY_MIN_TOTAL:       2,
  NEEDS_PRACTICE_LIMIT:     3,
  COMMON_MISTAKES_LIMIT:    3,
  STRENGTHS_LIMIT:          3,
};

// Build the Phase 1 Learning Insights bundle. All inputs are assumed to be
// pre-filtered to opts.viewBand by the caller. The output is a structured
// object describing each card; the renderer turns it into HTML.
function buildLearningInsights(opts) {
  opts = opts || {};
  var viewBand           = opts.viewBand           || 'g2';
  var scores             = opts.scores             || [];
  var activityEvents     = opts.activityEvents     || [];
  var interventionEvents = opts.interventionEvents || [];
  var mastery            = opts.mastery            || {};
  var studentName        = opts.studentName        || 'Your child';
  var tagLabels          = opts.tagLabels          || {};
  var errLabels          = opts.errLabels          || {};
  var errHelpMap         = opts.errHelpMap         || {};
  var lessonNameFn       = opts.lessonNameFn       || function() { return null; };
  // Phase 2B: static tag→lesson index emitted by build.js. Used as a fallback
  // when live activity events don't already include a lessonId for the tag.
  var tagLessonIndex     = opts.tagLessonIndex     || null;

  function toTitle(s) {
    return s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }) : s;
  }
  function tagLabel(t) { return tagLabels[t] || toTitle(t); }
  function errLabel(t) { return errLabels[t] || toTitle(String(t || '').replace(/^err_/, '')); }

  var hasAnyData =
    (Array.isArray(scores) && scores.length > 0) ||
    (Array.isArray(activityEvents) && activityEvents.length > 0) ||
    (Array.isArray(interventionEvents) && interventionEvents.length > 0) ||
    (mastery && Object.keys(mastery).length > 0);

  // ── Needs Practice ──────────────────────────────────────────────────────
  var tagStats = Object.keys(mastery).map(function(tag) {
    var m = mastery[tag] || {};
    var attempts = m.attempts || 0;
    var correct  = m.correct  || 0;
    return {
      tag: tag,
      attempts: attempts,
      correct: correct,
      accuracy: attempts > 0 ? (correct / attempts) : 0,
    };
  });
  var weakTags = tagStats
    .filter(function(t) {
      return t.attempts >= _LI_THRESH.WEAK_MIN_ATTEMPTS
        && t.accuracy <  _LI_THRESH.WEAK_MAX_ACCURACY;
    })
    .sort(function(a, b) { return a.accuracy - b.accuracy; });

  // Build a tag → lessonId frequency map from grade-filtered activity events.
  var tagLessonMap = {};
  activityEvents.forEach(function(e) {
    if (!e || !e.lessonId || !Array.isArray(e.tags)) return;
    e.tags.forEach(function(tg) {
      if (!tg) return;
      if (!tagLessonMap[tg]) tagLessonMap[tg] = {};
      tagLessonMap[tg][e.lessonId] = (tagLessonMap[tg][e.lessonId] || 0) + 1;
    });
  });

  // Phase 2B: prefer the lesson with the most live attempts for this tag, but
  // restrict to lessons that match the active viewBand. If no live lesson
  // qualifies, fall through to the static tag→lesson index. Returns null when
  // neither source has a band-matching lesson.
  function topLessonForTag(tag) {
    var liveLessons = tagLessonMap[tag] || {};
    var liveKeys = Object.keys(liveLessons).filter(function(id) {
      return _lessonIdBand(id) === viewBand;
    });
    if (liveKeys.length) {
      liveKeys.sort(function(a, b) { return liveLessons[b] - liveLessons[a]; });
      return liveKeys[0];
    }
    if (tagLessonIndex && tagLessonIndex.byTag && tagLessonIndex.byTag[tag]) {
      var staticLessons = tagLessonIndex.byTag[tag];
      var staticKeys = Object.keys(staticLessons).filter(function(id) {
        return _lessonIdBand(id) === viewBand;
      });
      if (staticKeys.length) {
        staticKeys.sort(function(a, b) { return staticLessons[b] - staticLessons[a]; });
        return staticKeys[0];
      }
    }
    return null;
  }

  var needsPractice = weakTags
    .slice(0, _LI_THRESH.NEEDS_PRACTICE_LIMIT)
    .map(function(t) {
      var lessonId   = topLessonForTag(t.tag);
      var ldn        = lessonId ? lessonNameFn(lessonId) : null;
      var lessonName = ldn && ldn.lesson ? ldn.lesson : null;
      var unitName   = ldn && ldn.unit   ? ldn.unit   : null;
      var label      = tagLabel(t.tag);
      var accuracyPct = Math.round(t.accuracy * 100);
      var why = accuracyPct + '% on ' + label + ' across ' + t.attempts
        + ' attempt' + (t.attempts !== 1 ? 's' : '') + '.';
      var recommendation = lessonName
        ? 'Try ' + lessonName + ' again.'
        : 'Spend a few minutes practicing ' + label + '.';
      return {
        tag:            t.tag,
        label:          label,
        accuracy:       accuracyPct,
        attempts:       t.attempts,
        lessonId:       lessonId,
        lessonName:     lessonName,
        unitName:       unitName,
        why:            why,
        recommendation: recommendation,
      };
    });

  // ── Common Mistakes ─────────────────────────────────────────────────────
  var errCounts = {};
  var errLastTs = {};
  activityEvents.forEach(function(e) {
    if (!e || !e.errorType) return;
    errCounts[e.errorType] = (errCounts[e.errorType] || 0) + 1;
    if (typeof e.ts === 'number' && (!errLastTs[e.errorType] || e.ts > errLastTs[e.errorType])) {
      errLastTs[e.errorType] = e.ts;
    }
  });
  // Phase 2A: merge score.answers[].errTag counts. A single attempt produces
  // BOTH an activity-event errorType AND a score.answers errTag for the same
  // mistake, so summing would double-count. Take Math.max per tag — whichever
  // source has higher coverage wins. Legacy attempts (no errTag) contribute
  // nothing here and continue to rely on activity events.
  var scoreErrCounts = _aggregateMistakesFromScoreAnswers(scores);
  Object.keys(scoreErrCounts).forEach(function(t) {
    if (!errCounts[t] || scoreErrCounts[t] > errCounts[t]) {
      errCounts[t] = scoreErrCounts[t];
    }
  });
  var commonMistakes = Object.keys(errCounts)
    .filter(function(t) { return errCounts[t] >= _LI_THRESH.MISTAKE_MIN_COUNT; })
    .sort(function(a, b) { return errCounts[b] - errCounts[a]; })
    .slice(0, _LI_THRESH.COMMON_MISTAKES_LIMIT)
    .map(function(t) {
      // Phase 2B: resolve a band-matching lesson for this err_* tag. Live
      // activity wins; static index falls in when live data lacks coverage.
      var lessonId   = topLessonForTag(t);
      var ldn        = lessonId ? lessonNameFn(lessonId) : null;
      var lessonName = ldn && ldn.lesson ? ldn.lesson : null;
      var unitName   = ldn && ldn.unit   ? ldn.unit   : null;
      return {
        errorType:  t,
        label:      errLabels[t] || errLabel(t),
        helpText:   errHelpMap[t] || null,
        count:      errCounts[t],
        lastTs:     errLastTs[t] || null,
        lessonId:   lessonId,
        lessonName: lessonName,
        unitName:   unitName,
      };
    });

  // ── Strengths ───────────────────────────────────────────────────────────
  var strengths = tagStats
    .filter(function(t) {
      return t.attempts  >= _LI_THRESH.STRONG_MIN_ATTEMPTS
        && t.accuracy >= _LI_THRESH.STRONG_MIN_ACCURACY;
    })
    .sort(function(a, b) { return b.accuracy - a.accuracy; })
    .slice(0, _LI_THRESH.STRENGTHS_LIMIT)
    .map(function(t) {
      return {
        tag:      t.tag,
        label:    tagLabel(t.tag),
        accuracy: Math.round(t.accuracy * 100),
        attempts: t.attempts,
      };
    });

  // ── Trend ───────────────────────────────────────────────────────────────
  var sortedGraded = activityEvents
    .filter(function(e) { return e && typeof e.correct === 'boolean'; })
    .sort(function(a, b) { return (a.ts || 0) - (b.ts || 0); });
  var trend;
  if (sortedGraded.length < _LI_THRESH.TREND_MIN_EVENTS) {
    trend = { state: 'not-enough-data', sampleSize: sortedGraded.length };
  } else {
    var slice = sortedGraded.slice(-10);
    var first5 = slice.slice(0, 5);
    var last5  = slice.slice(-5);
    var acc5first = first5.filter(function(e) { return e.correct; }).length / 5;
    var acc5last  = last5.filter(function(e)  { return e.correct; }).length / 5;
    var delta = acc5last - acc5first;
    var state = 'steady';
    if (delta >=  0.20) state = 'improving';
    else if (delta <= -0.20) state = 'declining';
    trend = { state: state, sampleSize: slice.length };
  }

  // ── Intervention Recovery ───────────────────────────────────────────────
  var interventionRecovery = (function() {
    if (!interventionEvents || !interventionEvents.length) {
      return { state: 'not-enough-data' };
    }
    var summary = _summarizeInterventions(interventionEvents);
    if (summary.total < _LI_THRESH.RECOVERY_MIN_TOTAL) {
      return { state: 'not-enough-data', total: summary.total };
    }
    var topTag = null, topCount = 0;
    Object.keys(summary.byTag).forEach(function(t) {
      if (summary.byTag[t].count > topCount) { topTag = t; topCount = summary.byTag[t].count; }
    });
    var topTagPct = null;
    if (topTag && summary.byTag[topTag].count > 0) {
      topTagPct = Math.round((summary.byTag[topTag].resolved / summary.byTag[topTag].count) * 100);
    }
    var state;
    if      (summary.recoveryRate >= 70) state = 'good';
    else if (summary.recoveryRate >= 40) state = 'ok';
    else                                 state = 'needs-attention';
    return {
      state:        state,
      overallPct:   summary.recoveryRate,
      total:        summary.total,
      topTag:       topTag,
      topTagLabel:  topTag ? (errLabels[topTag] || errLabel(topTag)) : null,
      topTagPct:    topTagPct,
    };
  })();

  // ── Next Step ───────────────────────────────────────────────────────────
  var completedScores = scores.filter(function(s) { return s.pct != null && s.total > 0; });
  var totalQuestions = completedScores.reduce(function(a, s) { return a + (s.total || 0); }, 0);
  var overallAccuracy = completedScores.length > 0
    ? Math.round(completedScores.reduce(function(a, s) { return a + s.pct; }, 0) / completedScores.length)
    : 0;

  var nextStep;
  if (!hasAnyData || totalQuestions < 3) {
    nextStep = {
      kind:  'not-enough-data',
      label: 'Try a 5-question quiz to unlock insights.',
      why:   'A few more answers are needed before we can spot patterns.',
    };
  } else if (needsPractice.length > 0 && needsPractice[0].lessonName) {
    nextStep = {
      kind:       'lesson',
      lessonId:   needsPractice[0].lessonId,
      lessonName: needsPractice[0].lessonName,
      unitName:   needsPractice[0].unitName,
      skillLabel: needsPractice[0].label,
      label:      'Try ' + needsPractice[0].lessonName + ' again.',
      why:        needsPractice[0].why,
    };
  } else if (needsPractice.length > 0) {
    nextStep = {
      kind:       'practice-skill',
      skillLabel: needsPractice[0].label,
      label:      'Spend a few minutes practicing ' + needsPractice[0].label + '.',
      why:        needsPractice[0].why,
    };
  } else if (overallAccuracy >= 80 || strengths.length > 0) {
    nextStep = {
      kind:  'keep-going',
      label: 'Keep going — no major weak area yet.',
      why:   'Recent accuracy is ' + overallAccuracy + '% across ' + completedScores.length
              + ' quiz' + (completedScores.length !== 1 ? 'zes' : '') + '.',
    };
  } else {
    nextStep = {
      kind:  'practice-skill',
      label: 'Try one more quiz to build the streak.',
      why:   totalQuestions + ' question' + (totalQuestions !== 1 ? 's' : '') + ' answered so far.',
    };
  }

  // ── Parent Action ───────────────────────────────────────────────────────
  // One simple takeaway, sourced from the highest-priority signal.
  var parentAction;
  if (!hasAnyData || totalQuestions < 3) {
    parentAction = {
      label: 'Try a 5-question quiz on any lesson.',
      why:   'A few more answers will unlock skill-specific insights.',
    };
  } else if (commonMistakes.length > 0 && commonMistakes[0].helpText) {
    parentAction = {
      label: commonMistakes[0].helpText,
      why:   'Most common mistake: ' + commonMistakes[0].label
              + ' (' + commonMistakes[0].count + ' time'
              + (commonMistakes[0].count !== 1 ? 's' : '') + ').',
    };
  } else if (needsPractice.length > 0 && needsPractice[0].lessonName) {
    parentAction = {
      label: 'Practice ' + needsPractice[0].lessonName + ' together.',
      why:   needsPractice[0].why,
    };
  } else if (needsPractice.length > 0) {
    parentAction = {
      label: 'Spend a few minutes on ' + needsPractice[0].label + ' this week.',
      why:   needsPractice[0].why,
    };
  } else if (strengths.length > 0) {
    parentAction = {
      label: 'Celebrate progress on ' + strengths[0].label + ' and try the next lesson.',
      why:   strengths[0].label + ' is at ' + strengths[0].accuracy + '% across '
              + strengths[0].attempts + ' attempts.',
    };
  } else {
    parentAction = {
      label: 'Try one more lesson quiz this week.',
      why:   'Steady practice unlocks better insights.',
    };
  }

  return {
    viewBand:             viewBand,
    studentName:          studentName,
    hasAnyData:           hasAnyData,
    overallAccuracy:      overallAccuracy,
    totalQuestions:       totalQuestions,
    needsPractice:        needsPractice,
    commonMistakes:       commonMistakes,
    strengths:            strengths,
    trend:                trend,
    nextStep:             nextStep,
    interventionRecovery: interventionRecovery,
    parentAction:         parentAction,
  };
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
    buildParentInsight,
    _computeUnitInsights,
    _unitIndexFromId,
    normalizeGrade,
    _filterActivityByGrade,
    _masteryKeyFor,
    _summarizeInterventions,
    _dbResolveProfileGrade,
    _dbProfileGradeKey,
    _dbReadProfileGrade,
    _dbWriteProfileGrade,
    _gradeBand,
    _inferScoreGrade,
    _filterInterventionsByGrade,
    _deriveMasteryFromActivity,
    buildLearningInsights,
    _aggregateMistakesFromScoreAnswers,
    _normalizeAnswerDifficulty,
    _lessonDisplayName,
    _lessonIdBand,
    _buildInterventionRowForSync,
    _normalizeInterventionRow,
  };
}
