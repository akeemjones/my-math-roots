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

// Short grade-band token used by score records and grade-scoped unlock
// settings ('k' | 'g1' | 'g2'). Returns null for unknown input. Mirror of
// _gradeBand in settings.js — duplicated so this file can be parsed by Jest
// without booting the full app (same pattern as normalizeGrade).
function _gradeBand(v) {
  if (v === null || v === undefined) return null;
  var s = String(v).trim().toLowerCase();
  if (s === 'k' || s === 'kindergarten' || s === '0') return 'k';
  if (s === '1' || s === 'g1' || s === 'grade1' || s === 'grade 1') return 'g1';
  if (s === '2' || s === 'g2' || s === 'grade2' || s === 'grade 2') return 'g2';
  return null;
}

// Determine the grade band for a single score record. Returns
// 'k' | 'g1' | 'g2' | 'legacy_unknown'. Callers filtering a grade-specific
// view should EXCLUDE 'legacy_unknown' per spec.
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
    if (/^(lq_)?g3/.test(t)) return 'g3';
    if (/^(lq_)?(ku|k\d)/.test(t)) return 'k';
    if (/^(lq_)?u\d/.test(t)) return 'g2';
  }
  return 'legacy_unknown';
}

// Single empty grade slot (defaults).
function _emptyUnlockSlot() {
  return { freeMode: false, units: [], lessons: {} };
}

// Empty byGrade scaffold — every grade band defaulted off.
function _emptyByGrade() {
  return { k: _emptyUnlockSlot(), g1: _emptyUnlockSlot(), g2: _emptyUnlockSlot(), g3: _emptyUnlockSlot() };
}

// Parse unlock settings into the canonical schema-v2 shape with grade scoping.
//
// Accepted inputs:
//   - schema-v2: { schemaVersion:2, byGrade:{k,g1,g2} } → use as-is
//   - legacy flat: { freeMode, units, lessons } (pre-grade-scope)
//   - empty / null → fully empty
//
// Legacy migration:
//   When a legacy flat shape is received, its values are inherited by the
//   activeBand slot (defaults to 'g2' if not provided). Other grade slots are
//   defaulted off. Read-only fallback only: the new dashboard write paths
//   replace this with a proper byGrade structure on first save.
function _parseUnlockSettings(raw, activeBand) {
  if (!raw || typeof raw !== 'object') raw = {};
  var out = { schemaVersion: 2, byGrade: _emptyByGrade() };

  // Schema v2 — copy known slots
  if (raw.byGrade && typeof raw.byGrade === 'object') {
    ['k','g1','g2','g3'].forEach(function(band){
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

  // Legacy flat shape — inherit into the active band's slot.
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

// Read a grade slot from a schema-v2 draft. Falls back to an empty slot when
// the band is missing — never returns undefined.
//
// Legacy-flat policy: matches src/settings.js _unlockSlotForBand — pre-v2
// flat shape applies to G2 only. K/G1 stay empty until first save in the
// new code path writes byGrade.
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
    if (s.pct == null || s.total <= 0) return;
    var k = _scoreDayKey(s);
    if (!k) return;
    countMap[k] = (countMap[k] || 0) + 1;
  });
  var result = [];
  for (var i = 0; i < (days || 7); i++) {
    var dt  = new Date(Date.now() - i * 86400000);
    var k   = _localDayKey(dt);
    var dow = dt.getDay();
    result.push({ date: k, dayLabel: DAY_ABBR[dow], quizCount: countMap[k] || 0 });
  }
  return result;
}

// ── Last-7-Days drill-down helpers ────────────────────────────────────────
function _last7DaysCutoffMs() { return Date.now() - 7 * 86400000; }

function _getLast7DaysScores(scores) {
  var c = _last7DaysCutoffMs();
  return scores.filter(function(s) { return typeof s.id === 'number' && s.id >= c; });
}

function _getLast7DaysAccuracyByUnit(scores) {
  var weekly = _getLast7DaysScores(scores).filter(function(s) {
    return s.pct != null && s.total > 0 && s.unitIdx != null;
  });
  var unitsMeta = _activeDashboardUnitsMeta();
  var map = {};
  weekly.forEach(function(s) {
    var k = s.unitIdx;
    if (!map[k]) map[k] = {
      unitIdx: k, name: (unitsMeta[k] && unitsMeta[k].name) || ('Unit ' + (k + 1)),
      correct: 0, total: 0, attempts: 0, sumPct: 0
    };
    map[k].correct  += (s.score || 0);
    map[k].total    += (s.total || 0);
    map[k].attempts += 1;
    map[k].sumPct   += s.pct;
  });
  return Object.keys(map).map(function(k) {
    var u = map[k];
    return {
      unitIdx: u.unitIdx, name: u.name,
      accuracy: Math.round(u.sumPct / u.attempts),
      correct: u.correct, total: u.total, attempts: u.attempts
    };
  }).sort(function(a, b) { return a.unitIdx - b.unitIdx; });
}

function _getLast7DaysTimeBreakdown(scores, appTime) {
  var weekly = _getLast7DaysScores(scores).filter(function(s) { return s.timeTaken; });
  var byType = { lesson: 0, unit: 0, final: 0 };
  weekly.forEach(function(s) {
    var t = s.type || 'lesson';
    if (byType[t] != null) byType[t] += _parseSecs(s.timeTaken);
  });
  // appTime.dailySecs uses UTC ISO keys (writer is boot.js). Sum the last 7 calendar days.
  var appWeek = 0;
  for (var i = 0; i < 7; i++) {
    var k = _utcDayKey(new Date(Date.now() - i * 86400000));
    appWeek += ((appTime.dailySecs || {})[k] || 0);
  }
  return {
    lessonQuizSecs: byType.lesson,
    unitTestSecs:   byType.unit,
    finalTestSecs:  byType.final,
    appTotalSecs:   appWeek
  };
}

// Shared "last 7 days lesson-quiz scores" filter — single source of truth
// for both the Activity Snapshot card count ("Lessons Last 7 Days") and
// the clicked detail view (_renderSnapLessons). Keeps the two consistent
// so the card never promises N lessons that the detail can't show.
function _getLast7DaysLessonQuizScores(scores) {
  if (!Array.isArray(scores)) return [];
  var cutoffMs = _last7DaysCutoffMs();
  return scores.filter(function(s) {
    return s
      && s.type === 'lesson'
      && s.pct != null
      && s.total > 0
      && typeof s.id === 'number'
      && s.id >= cutoffMs;
  });
}

function _getLast7DaysLessonActivity(activityEvents) {
  var cutoffMs = _last7DaysCutoffMs();
  var byLesson = {};
  (activityEvents || []).forEach(function(e) {
    if (!e || !e.lessonId || !e.ts || e.ts < cutoffMs) return;
    if (!byLesson[e.lessonId]) byLesson[e.lessonId] = {
      lessonId: e.lessonId, firstTs: e.ts, lastTs: e.ts, count: 0
    };
    var b = byLesson[e.lessonId];
    if (e.ts < b.firstTs) b.firstTs = e.ts;
    if (e.ts > b.lastTs)  b.lastTs  = e.ts;
    b.count++;
  });
  // Sort BEFORE mapping so lastTs is still on the comparator's input objects.
  return Object.keys(byLesson).map(function(k) { return byLesson[k]; })
    .sort(function(a, b) { return b.lastTs - a.lastTs; })
    .map(function(b) {
      var dn = _lessonDisplayName(b.lessonId);
      return {
        lessonId:  b.lessonId,
        lesson:    (dn ? dn.lesson : b.lessonId),
        unit:      (dn ? dn.unit : ''),
        firstDate: _localDayKey(new Date(b.firstTs)),
        lastDate:  _localDayKey(new Date(b.lastTs)),
        count:     b.count
      };
    });
}

function _getActivityForDay(dayKey, scores, activityEvents, appTime) {
  var dayQuizzes = scores.filter(function(s) {
    if (s.pct == null || s.total <= 0 || !s.type) return false;
    return _scoreDayKey(s) === dayKey;
  });
  var lessonsTouched = {};
  (activityEvents || []).forEach(function(e) {
    if (!e || !e.lessonId || !e.ts) return;
    if (_localDayKey(new Date(e.ts)) === dayKey) {
      lessonsTouched[e.lessonId] = (lessonsTouched[e.lessonId] || 0) + 1;
    }
  });
  var lessons = Object.keys(lessonsTouched).map(function(id) {
    var dn = _lessonDisplayName(id);
    return {
      lessonId: id,
      lesson:   (dn ? dn.lesson : id),
      unit:     (dn ? dn.unit : ''),
      count:    lessonsTouched[id]
    };
  });
  // appTime.dailySecs uses UTC ISO key — bar dayKey is local. Convert dayKey to UTC for lookup
  // by reconstructing the local-midnight Date and asking for its UTC ISO.
  var parts = dayKey.split('-');
  var localMidnight = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  var utcK = _utcDayKey(localMidnight);
  var secs = (appTime && appTime.dailySecs && appTime.dailySecs[utcK]) || 0;
  return { dayKey: dayKey, secs: secs, lessons: lessons, quizzes: dayQuizzes };
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
  // Active grade — canonical 'K' or '2'. normalizeGrade() lives in state.js
  // (loaded earlier in the bundle) but we keep a tiny local fallback in case
  // this file is ever evaluated on its own.
  var _norm = (typeof normalizeGrade === 'function') ? normalizeGrade : function(v){
    if (v === null || v === undefined) return '2';
    var s = String(v).trim().toLowerCase();
    if (s === 'k' || s === 'kindergarten' || s === '0') return 'K';
    if (s === '1') return '1';
    if (s === '3') return '3';
    return '2';
  };
  var activeGrade = _norm((function(){ try { return localStorage.getItem('mmr_grade'); } catch(_){ return null; } })());

  // Grade-namespaced scores (e.g. wb_sc5_2); fallback to legacy unnamespaced
  var rawScores  = tryParse('wb_sc5_' + activeGrade, null) || tryParse('wb_sc5', []);
  var scoresArr  = Array.isArray(rawScores) ? rawScores : (rawScores.d || []);
  var cfg        = tryParse('wb_settings', {});

  // Per-grade canonical mastery key (Phase 2). Falls back through the legacy
  // un-namespaced mmr_mastery_v1, then the wb_mastery_<grade> store. The
  // boot-time migration in state.js has already copied legacy data into
  // mmr_mastery_v1_2 for existing users.
  var masteryAgg = tryParse('mmr_mastery_v1_' + activeGrade, null);
  if (!masteryAgg || !Object.keys(masteryAgg).length) {
    masteryAgg = tryParse('mmr_mastery_v1', null);
  }
  if (!masteryAgg || !Object.keys(masteryAgg).length) {
    masteryAgg = tryParse('wb_mastery_' + activeGrade, null) || tryParse('wb_mastery', {});
  }

  // Activity event log (Phase 2 pipeline) — powers Practice Spotlight &
  // Intervention Insights. Filter by active grade at load time so every
  // downstream consumer (Unit Progress Map, Action Summary, Practice Next,
  // Mistake Patterns) automatically sees a single-grade slice.
  var actDoc    = tryParse('mmr_activity_v1', null);
  var allEvents = (actDoc && actDoc.v === 1 && Array.isArray(actDoc.events)) ? actDoc.events : [];
  var actEvents = allEvents.filter(function(e){
    if (!e) return false;
    if (e.grade == null) return true;        // unknown-grade events: keep so legacy data still appears
    return _norm(e.grade) === activeGrade;
  });
  return {
    id:       'local',
    name:     cfg.studentName || 'Student (This Device)',
    MASTERY:  masteryAgg,
    ACTIVITY: actEvents,
    SCORES:   scoresArr,
    STREAK:   tryParse('wb_streak',  { current: 0, longest: 0, lastDate: null }),
    APP_TIME: tryParse('wb_apptime', { totalSecs: 0, sessions: 0, dailySecs: {} }),
  };
}

// ── Per-profile grade selection ───────────────────────────────────────────
// A profile's grade lives in two places:
//   - Supabase: student_profiles.grade (Phase 3 column, source of truth)
//   - Local cache: mmr_profile_grade_<id> (mirror, used pre-fetch and
//     on student devices that don't query student_profiles directly)
function _dbProfileGradeKey(id) { return 'mmr_profile_grade_' + String(id); }
function _dbReadProfileGrade(id) {
  if (!id) return '2';
  try {
    var v = localStorage.getItem(_dbProfileGradeKey(id));
    return (typeof normalizeGrade === 'function') ? normalizeGrade(v) :
      (String(v || '').trim().toLowerCase() === 'k' ? 'K' : '2');
  } catch (_e) { return '2'; }
}
function _dbWriteProfileGrade(id, grade) {
  if (!id) return;
  try {
    var g = (typeof normalizeGrade === 'function') ? normalizeGrade(grade) :
      (String(grade || '').trim().toLowerCase() === 'k' ? 'K' : '2');
    localStorage.setItem(_dbProfileGradeKey(id), g);
  } catch (_e) {}
}
function _dbGradeBadge(g) {
  var n = (typeof normalizeGrade === 'function') ? normalizeGrade(g) : g;
  return n === 'K' ? 'Kindergarten' : 'Grade ' + n;
}

// Resolve a profile's grade with a clear precedence:
//   1. profile.grade  (Supabase-backed, freshest)
//   2. mmr_profile_grade_<id>  (local cache mirror)
//   3. localStorage.mmr_grade  (current global flag — last resort if
//      profile metadata is unavailable)
//   4. '2'  (final fallback)
// Whenever the resolver returns a value, it also mirrors it into the
// local cache so subsequent reads on this device are O(1).
function _dbResolveProfileGrade(profile, fallbackProfileId) {
  var _norm = (typeof normalizeGrade === 'function') ? normalizeGrade : function(v){
    if (v === null || v === undefined) return '2';
    var s = String(v).trim().toLowerCase();
    if (s === 'k' || s === 'kindergarten' || s === '0') return 'K';
    if (s === '1') return '1';
    if (s === '3') return '3';
    return '2';
  };

  // 1. Profile object carries grade from Supabase
  if (profile && profile.grade != null && profile.grade !== '') {
    var fromProfile = _norm(profile.grade);
    if (profile.id) _dbWriteProfileGrade(profile.id, fromProfile);
    return fromProfile;
  }

  // 2. Local cache by id
  var id = (profile && profile.id) || fallbackProfileId;
  if (id) {
    try {
      var cached = localStorage.getItem(_dbProfileGradeKey(id));
      if (cached) return _norm(cached);
    } catch (_e) {}
  }

  // 3. Current global flag (legacy single-grade callers)
  try {
    var current = localStorage.getItem('mmr_grade');
    if (current) {
      var g = _norm(current);
      if (id) _dbWriteProfileGrade(id, g);
      return g;
    }
  } catch (_e) {}

  // 4. Final fallback
  return '2';
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
  if (t == null || t === '') return 0;
  if (typeof t === 'number') return t > 0 ? t : 0;          // raw seconds
  var s = String(t);
  if (/^\d+$/.test(s)) return parseInt(s, 10) || 0;          // numeric string = raw seconds
  var p = s.split(':');
  return (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0); // mm:ss
}

function _fmtSecs(s) {
  if (!s) return '—';
  var m = Math.floor(s / 60), sec = Math.round(s % 60);
  return m + 'm ' + String(sec).padStart(2, '0') + 's';
}

// Local-time YYYY-MM-DD day key.
// NOTE: appTime.dailySecs uses UTC ISO keys (boot.js writes with toISOString().slice(0,10)).
// For appTime lookups specifically, use _utcDayKey instead. _localDayKey is for score-id /
// activity-event timestamps and bar-day grouping where local-day boundaries match the parent's
// expectation. s.date in scores is locale-formatted ("Apr 30, 2026"); to get a comparable
// key we use s.id (Date.now() at write time) → _localDayKey(new Date(s.id)).
function _localDayKey(d) {
  var dt = (d instanceof Date) ? d : new Date(d);
  var y = dt.getFullYear();
  var m = String(dt.getMonth() + 1).padStart(2, '0');
  var day = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function _utcDayKey(d) {
  var dt = (d instanceof Date) ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}
// Day key for a score record, anchored to the parent's local time zone via s.id timestamp.
function _scoreDayKey(s) {
  if (s && typeof s.id === 'number' && Number.isFinite(s.id)) return _localDayKey(new Date(s.id));
  if (s && s.date) {
    var p = Date.parse(s.date);
    if (!isNaN(p)) return _localDayKey(new Date(p));
  }
  return null;
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

// ── Tag / Activity analytics helpers ─────────────────────────────────────

function _computeTagStats(mastery) {
  return Object.keys(mastery || {}).map(function(tag) {
    var m = mastery[tag];
    var attempts = m.attempts || 0;
    return { tag: tag, attempts: attempts, correct: m.correct || 0,
             accuracy: attempts ? (m.correct || 0) / attempts : 0, lastSeen: m.lastSeen || 0 };
  }).sort(function(a, b) { return a.accuracy - b.accuracy; });
}

function _buildTagLessonMap(activityEvents) {
  var map = {};
  (activityEvents || []).forEach(function(e) {
    if (!e.lessonId) return;
    (e.tags || []).forEach(function(tag) {
      if (!map[tag]) map[tag] = {};
      map[tag][e.lessonId] = (map[tag][e.lessonId] || 0) + 1;
    });
  });
  return map;
}

function _computeMisconceptions(activityEvents) {
  var counts = {};
  (activityEvents || []).forEach(function(e) {
    if (e.errorType) counts[e.errorType] = (counts[e.errorType] || 0) + 1;
  });
  return counts;
}

function _recommendReviewLessons(weakTags, tagLessonMap, limit) {
  var recs = [], seen = {};
  weakTags.forEach(function(t) {
    var lessons = tagLessonMap[t.tag] || {};
    Object.keys(lessons)
      .sort(function(a, b) { return lessons[b] - lessons[a]; })
      .slice(0, 2)
      .forEach(function(lessonId) {
        if (!seen[lessonId]) {
          seen[lessonId] = true;
          recs.push({ lessonId: lessonId, weakTag: t.tag, accuracy: t.accuracy });
        }
      });
  });
  return recs.slice(0, limit || 5);
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

// ── Collapsible section system ─────────────────────────────────────────────
function _dbSectionState() {
  try { return JSON.parse(localStorage.getItem('mmr_db_section_state') || '{}'); } catch(_e) { return {}; }
}
function _dbSectionStateSet(key, open) {
  var state = _dbSectionState();
  state[key] = open;
  try { localStorage.setItem('mmr_db_section_state', JSON.stringify(state)); } catch(_e) {}
}
function _dbSection(key, titleHtml, bodyHtml, defaultOpen, extraClass) {
  var state = _dbSectionState();
  var open = (key in state) ? state[key] : !!defaultOpen;
  var cls = 'db-section' + (open ? ' is-open' : '') + (extraClass ? ' ' + extraClass : '');
  return '<section class="' + cls + '" data-section="' + key + '">'
    + '<button class="db-section-header" data-action="toggleDbSection" data-arg="' + key + '"'
    + ' aria-expanded="' + (open ? 'true' : 'false') + '">'
    + '<span class="db-sec-h" style="margin:0">' + titleHtml + '</span>'
    + '<span class="db-section-toggle">&#9662;</span>'
    + '</button>'
    + '<div class="db-section-body">' + bodyHtml + '</div>'
    + '</section>';
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

function _renderActivitySnapshot(stats, scores, appTime, activity, streak, activityEvents) {
  return _dbSection('stats', '&#x1F4CA; Activity Snapshot',
    '<div id="db-snap-wrap">' + _renderActivitySnapshotInner(stats, scores, appTime, activity, streak, activityEvents) + '</div>');
}

function _reRenderActivitySnapshot() {
  var st = _students[_activeId]; if (!st) return;
  var scores  = st.SCORES   || [];
  var appTime = st.APP_TIME || { totalSecs: 0, sessions: 0, dailySecs: {} };
  var streak  = st.STREAK   || { current: 0 };
  var activity = _computeActivityData(scores, 7);
  var stats    = _computeOverallStats(scores, streak, appTime);
  var wrap = document.getElementById('db-snap-wrap');
  if (wrap) wrap.innerHTML = _renderActivitySnapshotInner(stats, scores, appTime, activity, streak, _activityEvents);
}

function _statCardClickable(val, lbl, type, ariaLabel, valClass) {
  return '<div class="db-stat-card db-snap-card is-' + type + '"'
    + ' data-action="showActivityDetail" data-arg="' + type + '"'
    + ' role="button" tabindex="0" aria-label="' + _esc(ariaLabel) + '">'
    + '<div class="db-stat-val' + (valClass ? ' ' + valClass : '') + '">' + val + '</div>'
    + '<div class="db-stat-lbl">' + lbl + '</div>'
    + '</div>';
}

function _renderActivitySnapshotInner(stats, scores, appTime, activity, streak, activityEvents) {
  // ── Last-7-days time + lesson count (anchored to s.id timestamps, not s.date strings) ──
  var weekSecs = 0;
  for (var i = 0; i < 7; i++) {
    var k = _utcDayKey(new Date(Date.now() - i * 86400000));
    weekSecs += ((appTime.dailySecs || {})[k] || 0);
  }
  var weekMins = Math.round(weekSecs / 60);
  var timeStr = weekMins >= 60
    ? Math.floor(weekMins / 60) + 'h ' + String(weekMins % 60).padStart(2, '0') + 'm'
    : weekMins + 'm';

  var weekLessons = _getLast7DaysLessonQuizScores(scores).length;

  // Streak dots
  var cur = (streak && streak.current) || 0;
  var streakIcons = '';
  var dots = Math.min(cur, 7);
  for (var j = 0; j < 7; j++) {
    streakIcons += '<span class="ws-dot' + (j < dots ? ' ws-dot-lit' : '') + '"></span>';
  }
  if (cur > 7) streakIcons += '<span class="ws-streak-more">+' + (cur - 7) + '</span>';

  // ── Metric grid (4 clickable cards + streak full-width) ──
  var acClass = stats.accuracy >= 80 ? 'is-good' : stats.accuracy >= 60 ? 'is-ok' : 'is-bad';
  var body = '<div class="db-stat-grid">'
    + _statCardClickable(stats.accuracy + '%',         'Accuracy',           'accuracy', 'View accuracy details',    acClass)
    + _statCardClickable(String(stats.quizCount),      'Quizzes',            'quizzes',  'View this week’s quizzes')
    + _statCardClickable(weekMins > 0 ? timeStr : '—', 'Time Last 7 Days',   'time',     'View time breakdown')
    + _statCardClickable(String(weekLessons),           'Lessons Last 7 Days','lessons',  'View lessons')
    + '<div class="db-stat-card is-streak">'
    + '<div class="db-stat-val db-streak-val">' + cur + ' day' + (cur !== 1 ? 's' : '') + '</div>'
    + '<div class="ws-streak-row">' + streakIcons + '</div>'
    + '<div class="db-stat-lbl">Current Streak</div>'
    + '</div>'
    + '</div>'
    + (stats.lastActive ? '<p class="db-last-active">Last active: ' + stats.lastActive + '</p>' : '');

  // ── Activity bar chart — clickable days ──
  var max = 0;
  activity.forEach(function(d) { if (d.quizCount > max) max = d.quizCount; });
  var bars = activity.slice().reverse().map(function(d) {
    var pct = max > 0 ? Math.round((d.quizCount / max) * 100) : 0;
    var activeCls = (_activityDetailDay === d.date) ? ' db-act-col-active' : '';
    return '<button class="db-act-col' + activeCls + '" type="button"'
      + ' data-action="showActivityDay" data-arg="' + d.date + '"'
      + ' aria-label="Activity for ' + d.dayLabel + ', ' + (d.quizCount || 0) + ' quizzes">'
      + '<div class="db-act-bar-wrap">'
      + '<div class="db-act-bar" style="height:' + pct + '%;background:' + (d.quizCount > 0 ? '#1565C0' : 'rgba(0,0,0,.08)') + '"></div>'
      + '</div>'
      + '<div class="db-act-n">' + (d.quizCount || '') + '</div>'
      + '<div class="db-act-day">' + d.dayLabel + '</div>'
      + '</button>';
  }).join('');
  body += '<div class="db-time-sep" style="margin:14px 0 10px"></div>'
    + '<p style="font-size:.7rem;font-weight:700;color:var(--neutral-400);letter-spacing:.4px;text-transform:uppercase;margin:0 0 6px">Quizzes &#x2014; Last 7 Days</p>'
    + '<div class="db-act-chart">' + bars + '</div>';

  // ── Drill-down detail panel ──
  if (_activityDetailView) {
    body += '<div class="db-snap-detail">'
      + _renderSnapDetailHead(_activityDetailView, _activityDetailDay)
      + _renderSnapDetailBody(_activityDetailView, _activityDetailDay, scores, activityEvents, appTime)
      + '</div>';
  }

  // ── All-time time table (kept as-is; deferred for future cleanup once 7-day drill-down proves out) ──
  var completed = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  var withTime  = completed.filter(function(s) { return s.timeTaken && _parseSecs(s.timeTaken) > 0; });
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
  var hasTime = appTime.totalSecs > 0 || withTime.length > 0;

  if (hasTime) {
    function timeRow(lbl, val) {
      return '<div class="db-time-row"><span class="db-time-lbl">' + lbl + '</span>'
        + '<span class="db-time-val">' + val + '</span></div>';
    }
    var timeRows = '';
    if (appTime.totalSecs > 0) {
      timeRows += timeRow('Total time in app', _fmtSecs(appTime.totalSecs));
      timeRows += timeRow('Avg session length', _fmtSecs(avgSessionSecs));
    }
    if (withTime.length > 0) {
      if (timeRows) timeRows += '<div class="db-time-sep"></div>';
      var la = avgTime('lesson'), ua = avgTime('unit'), fa = avgTime('final');
      if (la) timeRows += timeRow('Avg lesson quiz time', _fmtSecs(la));
      if (ua) timeRows += timeRow('Avg unit test time', _fmtSecs(ua));
      if (fa) timeRows += timeRow('Avg final test time', _fmtSecs(fa));
    }
    if (avgQSecs > 0) {
      timeRows += '<div class="db-time-sep"></div>';
      timeRows += timeRow('Avg time per question', avgQSecs + 's');
    }
    body += '<div class="db-time-sep" style="margin:14px 0 10px"></div>'
      + '<p style="font-size:.7rem;font-weight:700;color:var(--neutral-400);letter-spacing:.4px;text-transform:uppercase;margin:0 0 6px">Time (all time)</p>'
      + '<div class="db-time-box">' + timeRows + '</div>';
  }

  return body;
}

function _renderSnapDetailHead(view, dayKey) {
  var title;
  if (view === 'accuracy') title = 'Accuracy &#x2014; Last 7 Days';
  else if (view === 'quizzes') title = 'Quizzes &#x2014; Last 7 Days';
  else if (view === 'time')    title = 'Time &#x2014; Last 7 Days';
  else if (view === 'lessons') title = 'Lessons &#x2014; Last 7 Days';
  else if (view === 'day') {
    var parts = (dayKey || '').split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    title = isNaN(d.getTime()) ? 'Day Activity'
      : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  } else title = '';
  return '<div class="db-snap-detail-head">'
    + '<div class="db-snap-detail-title">' + title + '</div>'
    + '<button class="db-snap-detail-close" data-action="hideActivityDetail" aria-label="Close details">&#x2715;</button>'
    + '</div>';
}

function _renderSnapDetailBody(view, dayKey, scores, activityEvents, appTime) {
  if (view === 'accuracy') return _renderSnapAccuracy(scores);
  if (view === 'quizzes')  return _renderSnapQuizzes(scores);
  if (view === 'time')     return _renderSnapTime(scores, appTime);
  if (view === 'lessons')  return _renderSnapLessons(scores, activityEvents);
  if (view === 'day')      return _renderSnapDay(dayKey, scores, activityEvents, appTime);
  return '';
}

function _renderSnapAccuracy(scores) {
  var rows = _getLast7DaysAccuracyByUnit(scores);
  if (!rows.length) return '<p class="db-snap-detail-empty">No quizzes recorded in the last 7 days.</p>';
  return rows.map(function(r) {
    var color = r.accuracy >= 80 ? '#2e7d32' : r.accuracy >= 60 ? '#e65100' : '#c62828';
    return '<div class="db-snap-detail-row">'
      + '<span>' + _esc(r.name) + '</span>'
      + '<span style="color:' + color + ';font-weight:700">' + r.accuracy + '% '
      + '<span style="color:var(--neutral-500);font-weight:500">(' + r.correct + '/' + r.total + ')</span></span>'
      + '</div>';
  }).join('');
}

// Build a quiz row HTML. Uses the stable `score.id` so openQuizReview can
// look up the right record across filters and re-renders (no positional
// index drift).
function _snapQuizRow(s, origIdx) {
  var pct = (s.pct == null) ? 0 : s.pct;
  var pctColor = pct >= 80 ? '#2e7d32' : pct >= 60 ? '#e65100' : '#c62828';
  var typeLabel = { lesson: 'Lesson Quiz', unit: 'Unit Test', final: 'Final Test' };
  var tLabel    = typeLabel[s.type] || s.type || '';
  var color     = _dbValidColor(s.color);
  return '<div class="db-quiz-row" data-action="openQuizReview" data-arg="' + s.id + '"'
    + ' role="button" tabindex="0">'
    + '<div class="db-quiz-bar" style="background:' + color + '"></div>'
    + '<div class="db-quiz-info">'
    + '<div class="db-quiz-label">' + _esc(s.label || tLabel) + '</div>'
    + '<div class="db-quiz-sub">' + _esc(s.date || '') + (s.date ? ' &bull; ' : '') + tLabel + '</div>'
    + '</div>'
    + '<div class="db-quiz-score" style="color:' + pctColor + '">' + pct + '%'
    + '<div class="db-quiz-frac">' + (s.score || 0) + '/' + (s.total || 0) + '</div>'
    + '</div>'
    + '</div>';
}

function _renderSnapQuizzes(scores) {
  var completed = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  var cutoffMs = _last7DaysCutoffMs();
  var rows = [];
  completed.forEach(function(s, origIdx) {
    if (typeof s.id === 'number' && s.id >= cutoffMs) rows.push(_snapQuizRow(s, origIdx));
  });
  if (!rows.length) return '<p class="db-snap-detail-empty">No quizzes taken in the last 7 days.</p>';
  return rows.join('');
}

function _renderSnapTime(scores, appTime) {
  var t = _getLast7DaysTimeBreakdown(scores, appTime);
  function row(lbl, val) {
    return '<div class="db-snap-detail-row"><span>' + lbl + '</span><span style="font-weight:700">' + val + '</span></div>';
  }
  var html = ''
    + row('Lesson Quizzes', _fmtSecs(t.lessonQuizSecs))
    + row('Unit Tests',     _fmtSecs(t.unitTestSecs))
    + row('Final Tests',    _fmtSecs(t.finalTestSecs))
    + row('Total app time', _fmtSecs(t.appTotalSecs));
  html += '<p class="db-snap-detail-note">Per-lesson reading time isn’t tracked separately. Only quiz/test duration and total app time are measured.</p>';
  return html;
}

// Detail view for the "Lessons Last 7 Days" snapshot card. Reads the same
// quiz_scores stream the card counts, via the shared
// _getLast7DaysLessonQuizScores helper, so detail row count always equals
// card count. The legacy activityEvents-based view drifted from the count
// (events stream is page-views, count is quiz completions) — see git
// history for the "show lesson-score details" fix.
//
// The _activityEvents arg is retained so _renderSnapDetailBody's dispatch
// table can stay uniform with the other detail renderers; it is unused.
function _renderSnapLessons(scores, _activityEvents) {
  var rows = _getLast7DaysLessonQuizScores(scores)
    .slice()
    .sort(function(a, b) { return b.id - a.id; });
  if (!rows.length) {
    return '<p class="db-snap-detail-empty">No lessons completed in the last 7 days.</p>';
  }
  return rows.map(function(s) {
    var pct      = (s.pct == null) ? 0 : s.pct;
    var pctColor = pct >= 80 ? '#2e7d32' : pct >= 60 ? '#e65100' : '#c62828';
    var label    = s.label || s.qid || 'Lesson Quiz';
    var dateStr  = s.date || '';
    var fraction = (s.score || 0) + '/' + (s.total || 0);
    return '<div class="db-snap-detail-row">'
      + '<span>' + _esc(label)
      + (dateStr
          ? ' <span style="color:var(--neutral-500);font-size:.78rem">&middot; ' + _esc(dateStr) + '</span>'
          : '')
      + '</span>'
      + '<span style="color:' + pctColor + ';font-weight:700">' + pct + '% '
      + '<span style="color:var(--neutral-500);font-weight:500">(' + fraction + ')</span>'
      + '</span>'
      + '</div>';
  }).join('');
}

function _renderSnapDay(dayKey, scores, activityEvents, appTime) {
  if (!dayKey) return '<p class="db-snap-detail-empty">Pick a day on the chart above.</p>';
  var d = _getActivityForDay(dayKey, scores, activityEvents, appTime);
  var nothing = (!d.secs && !d.lessons.length && !d.quizzes.length);
  if (nothing) return '<p class="db-snap-detail-empty">No activity recorded this day.</p>';
  var html = '';
  // Time row
  html += '<div class="db-snap-detail-row"><span>Time in app</span><span style="font-weight:700">'
    + (d.secs > 0 ? _fmtSecs(d.secs) : '&#x2014;') + '</span></div>';
  // Lessons
  if (d.lessons.length) {
    html += '<div class="db-snap-detail-row"><span style="font-weight:700">Lessons</span><span></span></div>';
    d.lessons.forEach(function(l) {
      html += '<div class="db-snap-detail-row" style="padding-left:12px">'
        + '<span>' + (l.unit ? _esc(l.unit) + ' &middot; ' : '') + _esc(l.lesson) + '</span>'
        + '<span style="color:var(--neutral-500);font-size:.78rem">' + l.count + ' event' + (l.count !== 1 ? 's' : '') + '</span>'
        + '</div>';
    });
  }
  // Quizzes
  if (d.quizzes.length) {
    html += '<div class="db-snap-detail-row"><span style="font-weight:700">Quizzes</span><span></span></div>';
    var completed = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
    d.quizzes.forEach(function(q) {
      var origIdx = completed.indexOf(q);
      if (origIdx >= 0) html += _snapQuizRow(q, origIdx);
    });
  }
  return html;
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

  var wsBody = '<div class="ws-grid">'

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

    + '</div>';
  return _dbSection('this-week', '&#x1F4C6; This Week', wsBody, false, 'ws-section');
}

// ── Unit progress map helpers ─────────────────────────────────────────────
// (also in dashboard/dashboard.js for testability)

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

    var errCounts = {};
    events.forEach(function(e) {
      if (e.errorType) errCounts[e.errorType] = (errCounts[e.errorType] || 0) + 1;
    });
    var topErrKey = null, topErrCount = 0;
    Object.keys(errCounts).forEach(function(t) {
      if (errCounts[t] > topErrCount) { topErrKey = t; topErrCount = errCounts[t]; }
    });

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

function _renderUnitProgressMap(scores, activityEvents) {
  var statusColor = {
    'needs-review': '#c62828', 'low-data': '#f57f17',
    'developing':   '#f57f17', 'strong':   '#2e7d32',
    'not-started':  '#cfd8dc',
  };
  var statusLabel = {
    'needs-review': 'Needs Review', 'low-data':    'Getting Started',
    'developing':   'Developing',   'strong':       'Strong',
    'not-started':  'Not Started',
  };

  var _niSvg = '<svg width="15" height="15" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">'
    + '<g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g>'
    + '<path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="#28a855" stroke-width="5.5" stroke-linecap="round" fill="none"/>'
    + '<path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="#f5a020"/>'
    + '<path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="#ee9010"/>'
    + '<path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="#5ad880"/>'
    + '</svg>';
  var statusIcon = {
    'needs-review': _niSvg, 'low-data':    '&#x1F331;',
    'developing':   '&#x1F33F;', 'strong': '&#x1F333;',
    'not-started':  '&#x1FAA8;',
  };

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

  var units = _computeUnitInsights({
    scores:         scores,
    activityEvents: activityEvents,
    unitsMeta:      _activeDashboardUnitsMeta(),
    tagLabels:      _TAG_LABEL_MAP,
    errLabels:      _ERR_LABEL_MAP,
    errHelpMap:     _ERR_HELP_MAP,
    lessonNameFn:   _lessonDisplayName,
  });

  var nodeHTML = units.map(function(u, i) {
    var col       = statusColor[u.status];
    var icon      = statusIcon[u.status];
    var lbl       = statusLabel[u.status];
    var isRight   = i % 2 === 0;
    var isStarted = u.status !== 'not-started';
    var pct       = u.accuracy != null ? ' &bull; ' + u.accuracy + '%' : '';

    var nodeEl = '<div class="rs-node-col">'
      + '<div class="rs-node' + (!isStarted ? ' rs-node-locked' : ' rs-node-tap') + '" style="border-color:' + col + ';background:' + (!isStarted ? '#f5f5f5' : col + '18') + '"'
      + (isStarted ? ' onclick="this.closest(\'.rs-row\').classList.toggle(\'rs-open\')"' : '') + '>'
      + '<span class="rs-node-num" style="color:' + col + '">' + (u.idx + 1) + '</span>'
      + '<span class="rs-node-icon">' + icon + '</span>'
      + '</div>'
      + (i < units.length - 1 ? '<div class="rs-spine' + (isStarted ? ' rs-spine-active" style="background:' + col + '60"' : '"') + '></div>' : '')
      + '</div>';

    var labelHeader = '<div class="rs-lbl-name">' + _esc(u.name) + '</div>'
      + '<div class="rs-lbl-sub" style="color:' + col + '">' + lbl + pct + '</div>';

    var labelEl;
    if (!isStarted) {
      labelEl = '<div class="rs-label rs-label-' + (isRight ? 'right' : 'left') + '">' + labelHeader + '</div>';
    } else {
      var dp = [];
      if (u.status === 'low-data') {
        dp.push('<p class="rs-det-hint">A few more practice questions will unlock skill-level insights.</p>');
      } else {
        var statLine = u.total + ' question' + (u.total !== 1 ? 's' : '') + ' answered';
        if (u.quizCount > 0) statLine += ' &bull; ' + u.quizCount + ' quiz' + (u.quizCount !== 1 ? 'zes' : '');
        dp.push('<p class="rs-det-stat">' + statLine + '</p>');
        if (u.weakTagLabel) dp.push('<div class="rs-det-row"><span class="rs-det-lbl">Weakest skill</span><span class="rs-det-val">' + _esc(u.weakTagLabel) + '</span></div>');
        if (u.topErrLabel)  dp.push('<div class="rs-det-row"><span class="rs-det-lbl">Common mistake</span><span class="rs-det-val">' + _esc(u.topErrLabel) + '</span></div>');
        if (u.topErrHelp)   dp.push('<p class="rs-det-hint">&#x1F4A1; ' + _esc(u.topErrHelp) + '</p>');
        if (u.lessonRec)    dp.push('<div class="rs-det-rec">&#x1F4CC; Review: <strong>' + _esc(u.lessonRec) + '</strong></div>');
      }
      var detailDiv = dp.length ? '<div class="rs-det" style="border-left:2px solid ' + col + '40">' + dp.join('') + '</div>' : '';
      labelEl = '<div class="rs-label rs-label-' + (isRight ? 'right' : 'left') + '">'
        + labelHeader + detailDiv + '</div>';
    }

    return '<div class="rs-row' + (isRight ? ' rs-row-right' : ' rs-row-left') + '">'
      + (isRight ? '' : labelEl)
      + nodeEl
      + (isRight ? labelEl : '')
      + '</div>';
  }).join('');

  var strong      = units.filter(function(u) { return u.status === 'strong'; }).length;
  var developing  = units.filter(function(u) { return u.status === 'developing' || u.status === 'low-data'; }).length;
  var needsReview = units.filter(function(u) { return u.status === 'needs-review'; }).length;
  var started     = units.filter(function(u) { return u.status !== 'not-started'; }).length;
  var notStarted  = units.length - started;

  var summaryParts = [started + ' of ' + units.length + ' units started'];
  if (strong)      summaryParts.push(strong + ' strong');
  if (developing)  summaryParts.push(developing + ' developing');
  if (needsReview) summaryParts.push('<span style="color:#c62828">' + needsReview + ' needs review</span>');
  if (notStarted)  summaryParts.push(notStarted + ' not started');

  // Insight panel — only show rows that have data
  var startedWithAcc = units.filter(function(u) { return u.status !== 'not-started' && u.accuracy != null; });
  var bestUnit  = startedWithAcc.slice().sort(function(a, b) { return b.accuracy - a.accuracy; })[0] || null;
  var focusUnit = startedWithAcc.slice().sort(function(a, b) { return a.accuracy - b.accuracy; })[0] || null;
  var nextUnit  = null;
  for (var ni = 0; ni < units.length; ni++) {
    if (units[ni].status === 'not-started') { nextUnit = units[ni]; break; }
  }

  var insightRows = '';
  if (bestUnit && focusUnit && bestUnit.idx !== focusUnit.idx) {
    insightRows += '<div class="rs-insight-row">'
      + '<span class="rs-insight-lbl">Strongest</span>'
      + '<span class="rs-insight-val">' + _esc(bestUnit.name) + ' &bull; ' + bestUnit.accuracy + '%</span>'
      + '</div>';
  }
  if (focusUnit && (focusUnit.status === 'needs-review' || focusUnit.status === 'developing')) {
    insightRows += '<div class="rs-insight-row">'
      + '<span class="rs-insight-lbl">Needs work</span>'
      + '<span class="rs-insight-val">' + _esc(focusUnit.name) + ' &bull; ' + focusUnit.accuracy + '%</span>'
      + '</div>';
  }
  if (nextUnit) {
    insightRows += '<div class="rs-insight-row">'
      + '<span class="rs-insight-lbl">Up next</span>'
      + '<span class="rs-insight-val">' + _esc(nextUnit.name) + '</span>'
      + '</div>';
  }
  var insightPanel = insightRows ? '<div class="rs-insights">' + insightRows + '</div>' : '';

  // Compact unit list — supporting detail below the visual
  var unitListRows = units.map(function(u) {
    var col  = statusColor[u.status];
    var lbl  = statusLabel[u.status];
    var stat = lbl;
    if (u.accuracy != null) stat += ' &bull; ' + u.accuracy + '%';
    if (u.total)            stat += ' &bull; ' + u.total + ' attempted';
    return '<div class="rs-unit-row">'
      + '<span class="rs-unit-name">' + _esc(u.name) + '</span>'
      + '<span class="rs-unit-stat" style="color:' + col + '">' + stat + '</span>'
      + '</div>';
  }).join('');

  var rsBody = '<div class="rs-legend">'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#2e7d32"></span>Strong</span>'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#f57f17"></span>Developing</span>'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#c62828"></span>Needs Review</span>'
    + '<span class="rs-leg-item"><span class="rs-leg-dot" style="background:#cfd8dc"></span>Not Started</span>'
    + '</div>'
    + '<p class="rs-summary">' + summaryParts.join(' &bull; ') + '</p>'
    + insightPanel
    + '<div class="rs-track">' + nodeHTML + '</div>'
    + '<div class="rs-unit-list">' + unitListRows + '</div>';

  return _dbSection('root-system', _sproutSvg + 'The Root System', rsBody, false);
}

function _renderPracticePlan(mastery, activityEvents, weak, review) {
  var studentName = (_students[_activeId] || {}).name || 'Your child';

  var tagList = Object.keys(mastery).map(function(tag) {
    var m = mastery[tag];
    var acc = m.attempts > 0 ? m.correct / m.attempts : 0;
    return { tag: tag, acc: acc, attempts: m.attempts };
  }).filter(function(t) { return t.attempts >= 2; });

  var seenTags = {};

  var attentionItems = tagList
    .filter(function(t) { return t.acc < 0.5; })
    .sort(function(a, b) { return a.acc - b.acc; })
    .slice(0, 5);
  attentionItems.forEach(function(t) { seenTags[_normTag(t.tag)] = true; });

  var practiceItems = tagList
    .filter(function(t) { return t.acc >= 0.5 && t.acc < 0.8 && !seenTags[_normTag(t.tag)]; })
    .sort(function(a, b) { return a.acc - b.acc; })
    .slice(0, 5);
  practiceItems.forEach(function(t) { seenTags[_normTag(t.tag)] = true; });

  if (!attentionItems.length && !practiceItems.length && weak.length) {
    weak.forEach(function(s) {
      var item = { tag: s.label, acc: s.accuracy / 100, attempts: s.total, isUnit: true };
      if (s.accuracy < 50) attentionItems.push(item);
      else practiceItems.push(item);
    });
  }

  var allWeakForRecs = attentionItems.concat(practiceItems).map(function(t) {
    return { tag: t.tag, accuracy: Math.round(t.acc * 100) };
  });
  var tagLessonMap = _buildTagLessonMap(activityEvents);
  var lessonRecs = allWeakForRecs.length ? _recommendReviewLessons(allWeakForRecs, tagLessonMap, 5) : [];
  var overdueReview = review.filter(function(r) { return r.overdue; }).slice(0, 3);

  var hasAny = attentionItems.length || practiceItems.length || lessonRecs.length || overdueReview.length;
  var defaultOpen = attentionItems.length > 0;
  var body = '';

  if (!hasAny) {
    body = '<p class="db-empty">' + _esc(studentName) + ' is on track right now.</p>'
      + '<p class="db-empty" style="margin-top:4px">Keep practicing this week to maintain progress.</p>';
    return _dbSection('practice-plan', '&#x1F9ED; Practice Plan', body, false);
  }

  if (attentionItems.length) {
    body += '<div class="db-pp-group db-pp-group--attention">'
      + '<div class="db-pp-group-title">&#x26A0; Needs Attention</div>';
    body += attentionItems.map(function(t) {
      var label = t.isUnit ? t.tag : ((_TAG_LABEL_MAP && _TAG_LABEL_MAP[t.tag]) || _toTitleCase(t.tag));
      var pct = Math.round(t.acc * 100);
      return '<div class="db-pp-item">'
        + '<div class="db-pp-item-name">' + _esc(label) + '</div>'
        + '<div class="db-pp-item-sub">' + pct + '% accuracy &bull; ' + t.attempts + ' attempts</div>'
        + '<div class="db-pp-item-action">Start here first this week.</div>'
        + '</div>';
    }).join('');
    body += '</div>';
  }

  if (practiceItems.length) {
    body += '<div class="db-pp-group db-pp-group--practice">'
      + '<div class="db-pp-group-title">&#x1F4DA; Needs Practice</div>';
    body += practiceItems.map(function(t) {
      var label = t.isUnit ? t.tag : ((_TAG_LABEL_MAP && _TAG_LABEL_MAP[t.tag]) || _toTitleCase(t.tag));
      var pct = Math.round(t.acc * 100);
      return '<div class="db-pp-item">'
        + '<div class="db-pp-item-name">' + _esc(label) + '</div>'
        + '<div class="db-pp-item-sub">' + pct + '% accuracy</div>'
        + '<div class="db-pp-item-action">A few more practice rounds will help.</div>'
        + '</div>';
    }).join('');
    body += '</div>';
  }

  var reviewLines = [];
  lessonRecs.forEach(function(r) {
    var names = _lessonDisplayName(r.lessonId);
    var display = names ? names.lesson + ' (' + names.unit + ')' : (r.lessonId || '');
    reviewLines.push('<div class="db-pp-item">'
      + '<div class="db-pp-item-name">&#x1F4CC; ' + _esc(display) + '</div>'
      + '<div class="db-pp-item-sub">Quiz next</div>'
      + '</div>');
  });
  overdueReview.forEach(function(r) {
    var txt = r.qText
      ? _esc(r.qText.length > 70 ? r.qText.slice(0, 67) + '...' : r.qText)
      : '(review item)';
    reviewLines.push('<div class="db-pp-item">'
      + '<span class="db-badge db-badge-red" style="margin-bottom:4px">Overdue</span>'
      + '<div class="db-pp-item-name">' + txt + '</div>'
      + '<div class="db-pp-item-sub">' + r.accuracy + '% correct</div>'
      + '</div>');
  });

  if (reviewLines.length) {
    body += '<div class="db-pp-group db-pp-group--review">'
      + '<div class="db-pp-group-title">&#x1F501; Recommended Review</div>'
      + reviewLines.join('')
      + '</div>';
  }

  return _dbSection('practice-plan', '&#x1F9ED; Practice Plan', body, defaultOpen);
}

// Dashboard pass/fail threshold defaults to 70% when no app-wide threshold is available.
var _QH_PASS_THRESHOLD = 70;

function _quizHistoryRangeCutoffMs(range) {
  var DAY = 86400000;
  var now = Date.now();
  switch (range) {
    case '7d':  return now -   7 * DAY;
    case '30d': return now -  30 * DAY;
    case '60d': return now -  60 * DAY;
    case '3m':  return now -  90 * DAY;
    case '6m':  return now - 180 * DAY;
    case '1y':  return now - 365 * DAY;
    default:    return 0; // 'lifetime'
  }
}

function _quizLessonKey(s) {
  // Returns a normalized lesson key (e.g. 'u1l2', 'ku3l4') from s.qid for lesson quizzes.
  // Returns null for unit/final tests.
  if (!s || !s.qid) return null;
  var m = String(s.qid).match(/^lq_(k?u\d+l\d+)$/i);
  return m ? m[1].toLowerCase() : null;
}

function _sortQuizHistory(rows, sort) {
  var copy = rows.slice();
  if (sort === 'date-desc')      copy.sort(function(a,b){ return (b.id||0) - (a.id||0); });
  else if (sort === 'date-asc')  copy.sort(function(a,b){ return (a.id||0) - (b.id||0); });
  else if (sort === 'accuracy-desc') copy.sort(function(a,b){ return (b.pct||0) - (a.pct||0) || (b.id||0) - (a.id||0); });
  else if (sort === 'accuracy-asc')  copy.sort(function(a,b){ return (a.pct||0) - (b.pct||0) || (b.id||0) - (a.id||0); });
  else if (sort === 'pass-first') copy.sort(function(a,b){
    var ap = (a.pct||0) >= _QH_PASS_THRESHOLD ? 1 : 0;
    var bp = (b.pct||0) >= _QH_PASS_THRESHOLD ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return (b.id||0) - (a.id||0);
  });
  else if (sort === 'fail-first') copy.sort(function(a,b){
    var ap = (a.pct||0) >= _QH_PASS_THRESHOLD ? 1 : 0;
    var bp = (b.pct||0) >= _QH_PASS_THRESHOLD ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return (b.id||0) - (a.id||0);
  });
  return copy;
}

function _getFilteredQuizHistory(scores) {
  var f = _quizHistoryFilters;
  // Build the canonical `completed` list — order MUST match what openQuizReview indexes into.
  var completed = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  // Tag each row with its index in `completed` so review opens the right quiz post-sort/filter.
  var rows = completed.map(function(s, idx) {
    var copy = {};
    for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) copy[k] = s[k];
    copy._originalIndex = idx;
    return copy;
  });
  // Date range
  if (f.range !== 'lifetime') {
    var cutoffMs = _quizHistoryRangeCutoffMs(f.range);
    rows = rows.filter(function(s) { return typeof s.id === 'number' && s.id >= cutoffMs; });
  }
  // Unit
  if (f.unit !== 'all') {
    var u = parseInt(f.unit, 10);
    if (!isNaN(u)) rows = rows.filter(function(s) { return s.unitIdx === u; });
  }
  // Lesson
  if (f.lesson !== 'all') {
    if (f.lesson === 'unit-test') {
      rows = rows.filter(function(s) { return s.type === 'unit' || s.type === 'final'; });
    } else {
      rows = rows.filter(function(s) { return _quizLessonKey(s) === f.lesson; });
    }
  }
  // Pass/fail
  if (f.result === 'pass') rows = rows.filter(function(s) { return (s.pct||0) >= _QH_PASS_THRESHOLD; });
  else if (f.result === 'fail') rows = rows.filter(function(s) { return (s.pct||0) < _QH_PASS_THRESHOLD; });
  // Sort
  rows = _sortQuizHistory(rows, f.sort);
  return { totalCount: completed.length, filtered: rows };
}

function _renderQuizHistoryControls(scores) {
  var f = _quizHistoryFilters;
  var unitsMeta = _activeDashboardUnitsMeta();

  // Date range chips
  var ranges = [
    { v: '7d',  l: '7d'  },
    { v: '30d', l: '30d' },
    { v: '60d', l: '60d' },
    { v: '3m',  l: '3m'  },
    { v: '6m',  l: '6m'  },
    { v: '1y',  l: '1y'  },
    { v: 'lifetime', l: 'All' }
  ];
  var chipHtml = ranges.map(function(r) {
    var on = (f.range === r.v);
    return '<button type="button" class="db-qh-chip' + (on ? ' is-active' : '') + '"'
      + ' data-action="setQuizHistoryFilter" data-arg="range" data-arg2="' + r.v + '"'
      + ' aria-pressed="' + (on ? 'true' : 'false') + '">' + r.l + '</button>';
  }).join('');

  // Unit options
  var unitOpts = '<option value="all"' + (f.unit === 'all' ? ' selected' : '') + '>All Units</option>';
  unitsMeta.forEach(function(u, i) {
    var sel = (f.unit === String(i)) ? ' selected' : '';
    unitOpts += '<option value="' + i + '"' + sel + '>Unit ' + (i + 1) + ': ' + _esc(u.name) + '</option>';
  });

  // Lesson options — depend on selected unit
  var lessonOpts = '<option value="all"' + (f.lesson === 'all' ? ' selected' : '') + '>All Lessons</option>';
  lessonOpts += '<option value="unit-test"' + (f.lesson === 'unit-test' ? ' selected' : '') + '>Unit Tests / Finals</option>';
  if (f.unit !== 'all') {
    var ui = parseInt(f.unit, 10);
    var u = unitsMeta[ui];
    if (u && Array.isArray(u.lessons)) {
      // Build lesson keys matching _quizLessonKey output. Per-grade key shapes:
      //   K  → "ku{n}l{m}"
      //   G1 → "g1-u{n}-l{m}"  (matches _lessonDisplayName's canonical form)
      //   G2 → "u{n}l{m}"
      // Drive this from the dashboard view-band (not mmr_grade) so the lesson
      // dropdown matches whatever grade the parent is currently filtering.
      var band = (typeof _getDashboardViewGrade === 'function')
        ? _getDashboardViewGrade()
        : 'g2';
      u.lessons.forEach(function(lName, li) {
        var key;
        if (band === 'k')        key = 'ku' + (ui + 1) + 'l' + (li + 1);
        else if (band === 'g1')  key = 'g1-u' + (ui + 1) + '-l' + (li + 1);
        else                     key = 'u'  + (ui + 1) + 'l' + (li + 1);
        var sel = (f.lesson === key) ? ' selected' : '';
        lessonOpts += '<option value="' + key + '"' + sel + '>Lesson ' + (li + 1) + ': ' + _esc(lName) + '</option>';
      });
    }
  }

  // Result options
  function resultOpt(v, l) {
    return '<option value="' + v + '"' + (f.result === v ? ' selected' : '') + '>' + l + '</option>';
  }
  var resultOpts = resultOpt('all', 'All Results') + resultOpt('pass', 'Pass') + resultOpt('fail', 'Fail');

  // Sort options
  function sortOpt(v, l) {
    return '<option value="' + v + '"' + (f.sort === v ? ' selected' : '') + '>' + l + '</option>';
  }
  var sortOpts = sortOpt('date-desc', 'Newest first')
    + sortOpt('date-asc', 'Oldest first')
    + sortOpt('accuracy-desc', 'Accuracy high → low')
    + sortOpt('accuracy-asc', 'Accuracy low → high')
    + sortOpt('pass-first', 'Pass first')
    + sortOpt('fail-first', 'Fail first');

  return '<div class="db-qh-controls">'
    + '<div class="db-qh-chip-row">' + chipHtml + '</div>'
    + '<div class="db-qh-filter-row">'
    +   '<select class="db-qh-select" data-action="setQuizHistoryFilter" data-arg="unit" aria-label="Filter by unit">' + unitOpts + '</select>'
    +   '<select class="db-qh-select" data-action="setQuizHistoryFilter" data-arg="lesson" aria-label="Filter by lesson">' + lessonOpts + '</select>'
    + '</div>'
    + '<div class="db-qh-filter-row">'
    +   '<select class="db-qh-select" data-action="setQuizHistoryFilter" data-arg="result" aria-label="Filter by pass/fail">' + resultOpts + '</select>'
    +   '<select class="db-qh-select" data-action="setQuizHistoryFilter" data-arg="sort" aria-label="Sort">' + sortOpts + '</select>'
    + '</div>'
    + '<button type="button" class="db-qh-reset" data-action="resetQuizHistoryFilters">Reset filters</button>'
    + '</div>';
}

function _renderQuizHistoryInner(scores) {
  var allCompleted = scores.filter(function(s) { return s.pct != null && s.total > 0 && s.type; });
  if (!allCompleted.length) return '<p class="db-empty">No quizzes recorded yet.</p>';

  var typeLabel = { lesson: 'Lesson Quiz', unit: 'Unit Test', final: 'Final Test' };
  var COLORS = ['#6c5ce7','#0984e3','#00b894','#e17055','#fdcb6e','#a29bfe','#fd79a8','#55efc4','#74b9ff','#fab1a0'];

  var result = _getFilteredQuizHistory(scores);
  var rows = result.filtered;

  var controls = _renderQuizHistoryControls(scores);
  var summary = '<p class="db-qh-summary">'
    + (rows.length === 0
        ? 'No quizzes match these filters.'
        : 'Showing ' + rows.length + ' of ' + result.totalCount + ' quizzes')
    + '</p>';

  if (rows.length === 0) {
    return controls + summary;
  }

  var items = rows.map(function(s) {
    var pctColor = (s.pct||0) >= 80 ? '#2e7d32' : (s.pct||0) >= 60 ? '#e65100' : '#c62828';
    var tLabel   = typeLabel[s.type] || s.type || '';
    var dispLabel = _esc(s.label || tLabel);
    var qAvg     = _quizAvgQSecs(s);
    var hasQTime = s.answers && s.answers.some(function(a) { return a.timeSecs != null; });
    var color    = s.color || COLORS[(s._originalIndex || 0) % COLORS.length];
    var pass     = (s.pct||0) >= _QH_PASS_THRESHOLD;
    var passBadge = '<span class="db-qh-badge db-qh-badge-' + (pass ? 'pass' : 'fail') + '">'
      + (pass ? 'Pass' : 'Fail') + '</span>';
    var dateTime = (s.date || '') + (s.time ? ' &bull; ' + _esc(s.time) : '');
    var dur = s.timeTaken ? _fmtSecs(_parseSecs(s.timeTaken)) : '';
    var sub = dateTime + (dateTime ? ' &bull; ' : '') + tLabel
      + (dur ? ' &bull; ' + dur : '')
      + (hasQTime ? ' &bull; &#x23F1; ' + qAvg + 's/q' : '')
      + ' &bull; ' + passBadge;
    return '<div class="db-quiz-row" data-action="openQuizReview" data-arg="' + s.id + '" role="button" tabindex="0">'
      + '<div class="db-quiz-bar" style="background:' + color + '"></div>'
      + '<div class="db-quiz-info"><div class="db-quiz-label">' + dispLabel + '</div>'
      + '<div class="db-quiz-sub">' + sub + '</div></div>'
      + '<div class="db-quiz-score" style="color:' + pctColor + '">' + (s.pct||0) + '%'
      + '<div class="db-quiz-frac">' + (s.score||0) + '/' + (s.total||0) + '</div></div>'
      + '</div>';
  }).join('');

  return controls + summary + '<div class="db-qh-list" role="list">' + items + '</div>';
}

function _renderRecentQuizzes(scores) {
  return _dbSection('recent-quizzes', '&#x1F4CB; Quiz History',
    '<div id="db-qh-wrap">' + _renderQuizHistoryInner(scores) + '</div>');
}

function _reRenderQuizHistory() {
  var st = _students[_activeId]; if (!st) return;
  var wrap = document.getElementById('db-qh-wrap');
  if (!wrap) return;
  // F3 fix: mirror the initial-render grade filter (src/dashboard.js:4611)
  // so toggling history filters doesn't re-introduce cross-grade rows.
  var viewBand = (typeof _getDashboardViewGrade === 'function') ? _getDashboardViewGrade() : null;
  var all = st.SCORES || [];
  var scoped = viewBand ? all.filter(function(s){ return _inferScoreGrade(s) === viewBand; }) : all;
  wrap.innerHTML = _renderQuizHistoryInner(scoped);
}

// ── Quiz review modal ─────────────────────────────────────────────────────

function openQuizReview(scoreId) {
  var student   = _students[_activeId];
  if (!student) return;
  // F3 fix: look up by stable score id rather than positional index. The
  // renderer's `_originalIndex` indexes into a grade-filtered list, but the
  // unfiltered student.SCORES has a different shape — opening by index
  // produced the wrong record (or undefined → silent no-op), making unit
  // quiz review behaviour look broken under non-default view-grades.
  var scores = student.SCORES || [];
  var s = null;
  if (scoreId != null) {
    var lookup = Number(scoreId);
    for (var i = 0; i < scores.length; i++) {
      if (scores[i] && scores[i].id === lookup) { s = scores[i]; break; }
    }
  }
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
          + '<div class="db-rev-your">Your answer: <span style="color:#c62828">' + _esc(_formatAnswerForReview(a.chosen)) + '</span></div>'
          + '<div class="db-rev-correct">&#x2705; Correct: <span style="color:#2e7d32">' + _esc(_formatAnswerForReview(a.correct)) + '</span></div>'
          + (a.timeSecs != null ? '<div class="db-rev-time">&#x23F1; ' + a.timeSecs + 's</div>' : '')
          + '</div>';
      }).join('');
    }
    if (right.length) {
      bodyHtml += '<div class="db-rev-sec" style="color:#2e7d32">&#x2705; Correct (' + right.length + ')</div>';
      bodyHtml += right.map(function(a) {
        return '<div class="db-rev-item db-rev-right">'
          + '<div class="db-rev-q">' + _esc(a.t || '') + '</div>'
          + '<div class="db-rev-correct" style="color:#2e7d32">&#x2705; ' + _esc(_formatAnswerForReview(a.correct)) + '</div>'
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
      + '<div class="db-review-handle" aria-hidden="true"></div>'
      + '<div class="db-review-head" id="db-review-head"></div>'
      + '<div class="db-review-body" id="db-review-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closeQuizReview(); });
    document.body.appendChild(modal);
    // Swipe-down-to-close touch handlers (sheet-level, created once)
    var _swipeSheet = modal.querySelector('.db-review-sheet');
    if (_swipeSheet) {
      var _drag = { active: false, startY: 0, startX: 0, dy: 0 };
      _swipeSheet.addEventListener('touchstart', function(e) {
        var body = document.getElementById('db-review-body');
        if (body && body.scrollTop > 0) { _drag.active = false; return; }
        _drag.active = true;
        _drag.startY = e.touches[0].clientY;
        _drag.startX = e.touches[0].clientX;
        _drag.dy = 0;
        _swipeSheet.classList.remove('is-dragging');
      }, { passive: true });
      _swipeSheet.addEventListener('touchmove', function(e) {
        if (!_drag.active) return;
        var touch = e.touches[0];
        var dy = touch.clientY - _drag.startY;
        var dx = Math.abs(touch.clientX - _drag.startX);
        if (dx > 20 && dx > dy) { _drag.active = false; return; }
        if (dy <= 0) { _drag.dy = 0; return; }
        _drag.dy = dy;
        _swipeSheet.classList.add('is-dragging');
        _swipeSheet.style.transform = 'translateY(' + dy + 'px)';
        _swipeSheet.style.opacity = String(Math.max(0.6, 1 - dy / 400));
      }, { passive: true });
      _swipeSheet.addEventListener('touchend', function() {
        if (!_drag.active) return;
        _drag.active = false;
        _swipeSheet.classList.remove('is-dragging');
        if (_drag.dy > 80) {
          _swipeSheet.style.transform = '';
          _swipeSheet.style.opacity = '';
          closeQuizReview();
        } else {
          _swipeSheet.style.transform = '';
          _swipeSheet.style.opacity = '';
        }
      }, { passive: true });
    }
  }

  var _rDateTime = _esc(s.date || '') + (s.time ? ' &bull; ' + _esc(s.time) : '');
  var _rDur = s.timeTaken ? _fmtSecs(_parseSecs(s.timeTaken)) : '';
  document.getElementById('db-review-head').innerHTML =
    '<button class="db-review-close" data-action="closeQuizReview">&#x2715;</button>'
    + '<div class="db-review-title">' + dispLabel + '</div>'
    + '<div class="db-review-meta">' + _rDateTime + (_rDateTime ? ' &bull; ' : '') + tLabel
      + (_rDur ? ' &bull; ' + _rDur : '') + '</div>'
    + '<div class="db-review-score" style="color:' + pctColor + '">' + s.pct + '%'
      + ' <span class="db-review-frac">' + (s.score||0) + '/' + (s.total||0) + '</span></div>';

  var bodyEl = document.getElementById('db-review-body');
  bodyEl.innerHTML = bodyHtml;
  bodyEl.scrollTop = 0;
  modal.classList.add('open');
}

function closeQuizReview() {
  var modal = document.getElementById('db-review-modal');
  if (!modal) return;
  modal.classList.remove('open');
  var sheet = document.getElementById('db-review-sheet');
  if (sheet) { sheet.style.transform = ''; sheet.style.opacity = ''; sheet.classList.remove('is-dragging'); }
}

// ── AI Report ─────────────────────────────────────────────────────────────

var _prStatsHtml  = '';
var _prReportText = '';

// Safe wrappers: _friendlyInterventionTag and _ERR_HELP_MAP live further down
// the file, so guard against ordering issues / unit tests where they are absent.
function _friendlyInterventionTagSafe(tag) {
  if (typeof _friendlyInterventionTag === 'function') {
    var label = _friendlyInterventionTag(tag);
    if (label) return label;
  }
  return _toTitleCase ? _toTitleCase(String(tag).replace(/^err_/, '')) : String(tag);
}
function _interventionHelpSafe(tag) {
  if (typeof _ERR_HELP_MAP === 'object' && _ERR_HELP_MAP) return _ERR_HELP_MAP[tag] || null;
  return null;
}

// Pure helper: turn raw intervention events + mastery into the parent-facing
// diagnostic shape Gemini sees. Kept pure so it can be unit-tested.
//
// events  : array from _getInterventionEvents() / _remoteInterventionEvents
//           shape: { type, errorTag, sessionId, resolvedCorrectly, timestamp }
// mastery : student.MASTERY map { qid → { attempts, correct } }
// labelFn : function(tag) → friendly label (parent-facing, no err_ prefix)
// helpFn  : function(tag) → short description / null
function _deriveReportDiagnostics(events, mastery, labelFn, helpFn) {
  events  = Array.isArray(events) ? events : [];
  mastery = mastery && typeof mastery === 'object' ? mastery : {};
  labelFn = typeof labelFn === 'function' ? labelFn : function(t){ return t; };
  helpFn  = typeof helpFn  === 'function' ? helpFn  : function(){ return null; };

  // ── interventionSummary + per-tag recovery from events ──
  var byTag = {};
  var totalTrig = 0;
  var totalResolved = 0;
  events.forEach(function(e) {
    if (!e || !e.errorTag) return;
    if (!byTag[e.errorTag]) byTag[e.errorTag] = { triggered: 0, resolved: 0 };
    if (e.type === 'triggered') { byTag[e.errorTag].triggered++; totalTrig++; }
    if (e.type === 'resolved' && e.resolvedCorrectly) {
      byTag[e.errorTag].resolved++; totalResolved++;
    }
  });

  function _clampPct(n) { return Math.max(0, Math.min(100, n)); }

  // Per-tag entries with raw tag preserved so misconceptionPatterns can look up
  // the right help text directly (avoids a fragile reverse lookup from label → tag).
  var taggedEntries = Object.keys(byTag)
    .map(function(t){ return { tag: t, label: labelFn(t), count: byTag[t].triggered }; })
    .filter(function(t){ return t.count > 0; })
    .sort(function(a,b){ return b.count - a.count; });

  // Dedupe by parent-facing label so two err_* tags that share a label don't
  // appear twice in the report. Counts sum; the first tag's identity is kept
  // for downstream help-text lookup.
  var dedupedByLabel = [];
  var labelIndex = {};
  taggedEntries.forEach(function(e){
    if (labelIndex[e.label] != null) {
      dedupedByLabel[labelIndex[e.label]].count += e.count;
    } else {
      labelIndex[e.label] = dedupedByLabel.length;
      dedupedByLabel.push({ tag: e.tag, label: e.label, count: e.count });
    }
  });

  var topErrorTags = dedupedByLabel.slice(0, 6).map(function(t){
    return { label: t.label, count: t.count };
  });

  var misconceptionPatterns = dedupedByLabel
    .filter(function(t){ return helpFn(t.tag); })
    .slice(0, 5)
    .map(function(t){
      return { label: t.label, description: helpFn(t.tag) };
    });

  var interventionSummary = totalTrig > 0
    ? { total: totalTrig, recoveryRate: _clampPct(Math.round((totalResolved / totalTrig) * 100)) }
    : null;

  var recoveryPatterns = Object.keys(byTag)
    .filter(function(t){ return byTag[t].triggered >= 2; })
    .map(function(t){
      return {
        label:        labelFn(t),
        attempts:     byTag[t].triggered,
        recoveryRate: _clampPct(Math.round((byTag[t].resolved / byTag[t].triggered) * 100)),
      };
    })
    .sort(function(a,b){ return b.attempts - a.attempts; })
    .slice(0, 6);

  // ── repeatedMistakes from MASTERY (qid wrong ≥2 times) ──
  var repeatedMistakes = Object.keys(mastery)
    .map(function(k){
      var m = mastery[k] || {};
      var wrong = (m.attempts || 0) - (m.correct || 0);
      return { label: k, wrongCount: wrong };
    })
    .filter(function(r){ return r.wrongCount >= 2; })
    .sort(function(a,b){ return b.wrongCount - a.wrongCount; })
    .slice(0, 8);

  return {
    topErrorTags:          topErrorTags,
    misconceptionPatterns: misconceptionPatterns,
    interventionSummary:   interventionSummary,
    recoveryPatterns:      recoveryPatterns,
    repeatedMistakes:      repeatedMistakes,
  };
}

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

  // Diagnostic fields — only included when intervention events exist.
  // Tries remote-synced events first, falls back to local events store.
  var rawEvents = (typeof _remoteInterventionEvents !== 'undefined' && _remoteInterventionEvents && _remoteInterventionEvents.length)
    ? _remoteInterventionEvents
    : _getInterventionEvents();
  var diagnostics = _deriveReportDiagnostics(
    rawEvents,
    mastery,
    _friendlyInterventionTagSafe,
    _interventionHelpSafe
  );

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
    topErrorTags:          diagnostics.topErrorTags,
    misconceptionPatterns: diagnostics.misconceptionPatterns,
    interventionSummary:   diagnostics.interventionSummary,
    recoveryPatterns:      diagnostics.recoveryPatterns,
    repeatedMistakes:      diagnostics.repeatedMistakes,
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

// Minimum signal threshold — prevents brand-new students from burning the
// 14-day cooldown on a thin report. Tunable: adjust as we learn.
function _hasEnoughDataForReport(scores, mastery, events) {
  var completedQuizzes = (scores || []).filter(function(s){ return s.pct != null && s.total > 0; }).length;
  if (completedQuizzes >= 3) return true;
  var totalQuestions = (scores || []).reduce(function(sum, s){ return sum + (s.total || 0); }, 0);
  if (totalQuestions >= 10) return true;
  var triggered = (events || []).filter(function(e){ return e && e.type === 'triggered'; }).length;
  if (triggered >= 3) return true;
  return false;
}

async function generateAIReport() {
  var footerEl = document.getElementById('db-ai-footer');
  var bodyEl   = document.getElementById('db-root');
  if (!footerEl) return;
  var student   = _students[_activeId];
  if (!student) return;
  var name      = student.name || 'Student';

  // Don't burn the 14-day cooldown if there's not enough data to write a useful report.
  var rawEvents = (typeof _remoteInterventionEvents !== 'undefined' && _remoteInterventionEvents && _remoteInterventionEvents.length)
    ? _remoteInterventionEvents
    : _getInterventionEvents();
  if (!_hasEnoughDataForReport(student.SCORES || [], student.MASTERY || {}, rawEvents)) {
    if (bodyEl) {
      _prStatsHtml = bodyEl.innerHTML;
      bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
        + '<div style="font-size:2rem;margin-bottom:14px">📚</div>'
        + '<div style="color:#37474f;font-weight:600;margin-bottom:8px">Not enough activity yet</div>'
        + '<div style="font-size:.9rem;color:#607d8b;max-width:320px;margin:0 auto">'
        + 'Complete a few lessons or quizzes first. Reports become useful after more activity is recorded.'
        + '</div></div>';
    }
    if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
      + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button></div>';
    return;
  }

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
    var _hdrs = { 'Content-Type': 'application/json' };
    try {
      var _sess = (typeof _supa !== 'undefined' && _supa)
        ? (await _supa.auth.getSession()).data.session
        : null;
      if (_sess && _sess.access_token) _hdrs['Authorization'] = 'Bearer ' + _sess.access_token;
    } catch (_e) {}
    var resp = await fetch('/.netlify/functions/gemini-report', {
      method: 'POST',
      headers: _hdrs,
      body: JSON.stringify({ studentName: name, reportData: payload, studentId: _activeId })
    });

    // Read body once, even on non-OK, so we can branch on the server's error type.
    var data = null;
    try { data = await resp.json(); } catch (e) { data = null; }

    // ── Cooldown 429: render the saved report (if any) and update the footer ──
    if (resp.status === 429 && data && data.error === 'cooldown') {
      // Mirror the server cooldown into local state so the footer renders correctly
      // without waiting for the next profile fetch.
      if (typeof data.nextAvailable === 'number') {
        var lastMs = data.nextAvailable - _REPORT_COOL_MS;
        localStorage.setItem(_reportCooldownKey(), String(lastMs));
        var _mp1 = _managedProfiles.find(function(p){ return p.id === _activeId; });
        if (_mp1) {
          _mp1.report_last_generated = new Date(lastMs).toISOString();
          if (data.report) _mp1.report_last_text = data.report;
        }
      }
      if (data.report) {
        _prReportText = data.report;
        _renderAIReportView(data.report, name);
      } else {
        // Cooldown active but no saved text — restore stats and show cooldown footer.
        if (bodyEl && _prStatsHtml) bodyEl.innerHTML = _prStatsHtml;
        if (footerEl) footerEl.innerHTML = _genReportFooter();
      }
      return;
    }

    // ── Rate-limit 429: friendly message, no cooldown burned ──
    if (resp.status === 429) {
      if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:44px 20px">'
        + '<div style="font-size:2rem;margin-bottom:14px">⏱️</div>'
        + '<div style="color:#37474f">Too many report requests. Please try again soon.</div></div>';
      if (footerEl) footerEl.innerHTML = '<div class="db-ai-footer-btns">'
        + '<button class="db-ai-back-btn" data-action="backToStats">← Back to Stats</button>'
        + '<button class="db-ai-pdf-btn" data-action="generateAIReport">↺ Try Again</button></div>';
      return;
    }

    if (!resp.ok) throw new Error('Server error ' + resp.status);
    if (!data || data.error) throw new Error((data && data.error) || 'Empty response');

    _prReportText = data.report;
    // Record successful generation locally too — server already wrote it,
    // but localStorage gives instant cooldown feedback before next profile fetch.
    var _nowIso = new Date().toISOString();
    localStorage.setItem(_reportCooldownKey(), String(Date.now()));
    var _mp2 = _managedProfiles.find(function(p){ return p.id === _activeId; });
    if (_mp2) {
      _mp2.report_last_generated = _nowIso;
      _mp2.report_last_text      = data.report;
    }
    try { _trackEvent('report_generated', _dbAnaMeta({})); } catch (_) {}
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

function viewLastReport() {
  var text = _savedReportText();
  if (!text) return;
  var student = _students[_activeId];
  var name    = student ? (student.name || 'Student') : 'Student';
  // Snapshot the current dashboard HTML so backToStats can restore it.
  // Guard: only capture when _prStatsHtml is empty — prevents overwriting the
  // stats snapshot with report HTML if viewLastReport is somehow re-invoked
  // from inside the report view.
  var bodyEl = document.getElementById('db-root');
  if (bodyEl && !_prStatsHtml) _prStatsHtml = bodyEl.innerHTML;
  _prReportText = text;
  _renderAIReportView(text, name);
}

function _savedReportText() {
  var profile = _managedProfiles.find(function(p){ return p.id === _activeId; });
  if (profile && profile.report_last_text) return profile.report_last_text;
  // Local mode — fall back to in-memory text from this session
  return _prReportText || null;
}

function _genReportFooter() {
  var nextAvail = _reportNextAvailable();
  var onCooldown = nextAvail && Date.now() < nextAvail;
  if (onCooldown) {
    var nextDate = new Date(nextAvail).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    var hasSaved = !!_savedReportText();
    return '<div style="text-align:center">'
      + (hasSaved
          ? '<button class="db-ai-gen-btn" data-action="viewLastReport">📋 View Last Report</button>'
          : '<button class="db-ai-gen-btn" disabled style="opacity:0.45;cursor:not-allowed">📋 Generate Report</button>')
      + '<div class="db-ai-powered">Next report available ' + nextDate + '</div></div>';
  }
  return '<div style="text-align:center">'
    + '<button class="db-ai-gen-btn" data-action="generateAIReport">📋 Generate Report</button>'
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
// null = not yet fetched; [] or array = fetched (may be empty). Populated by
// _loadRemoteInterventionData(); renderDashboard() prefers this over localStorage.
var _remoteInterventionEvents = null;
// Phase 2B static tag→lesson index. Loaded once per dashboard session via
// _loadTagLessonIndex(); null until the fetch resolves. The Learning Insights
// builder accepts a null index and degrades gracefully (no static-fallback
// lesson recommendations).
var _tagLessonIndex = null;
var _tagLessonIndexLoading = false;

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

// ── G1 lesson-name lookup table (Phase 2B) ────────────────────────────────
// Mirrors src/data/shared_g1.js; used by _lessonDisplayName() to convert a
// raw G1 lessonId (e.g. 'g1-u8-l3') into a human-readable name for parents.
// Index 0 = g1u1, index 1 = g1u2, …
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

// ── K lesson-name lookup table ────────────────────────────────────────────
// Mirrors src/data/shared_k.js; used by _lessonDisplayName() to convert a
// raw lessonId (e.g. "ku3l2") into a human-readable name for parents.
// Index 0 = ku1, index 1 = ku2, …
var _K_UNITS_META = [
  { name: 'Counting & Cardinality',            lessons: ['Counting to 10','Quick Look','Counting to 20','Count to 20 — Review','Read and Represent 11–20','Counting Strategies','Quick Look: Subitize'] },
  { name: 'Number Relationships',              lessons: ['One More, One Less','Compare Sets','Compare Numbers','Compose & Decompose','More, Less, and Equal','One More / One Less — Review'] },
  { name: 'Addition & Subtraction',            lessons: ['Adding Numbers','Subtracting Numbers','Word Problems','Explain Thinking','Story Problems: Join & Separate','Explain Your Math'] },
  { name: 'Counting Patterns',                 lessons: ['Count Forward by Ones','Count by Tens','Count from Any Number','Missing Numbers in Patterns'] },
  { name: 'Geometry — Shapes & Solids',   lessons: ['Flat Shapes (2D)','Solid Shapes (3D)','Sides & Corners','Sort & Create Shapes'] },
  { name: 'Measurement — Comparing & Ordering', lessons: ['Comparing Length & Height','Comparing Weight & Capacity','Ordering by Size','Measurable Attributes'] },
  { name: 'Data Analysis',                     lessons: ['Sort Into Groups','Build and Read Picture Graphs','Read Picture Graphs','Compare Data'] },
  { name: 'Financial Literacy & Money',        lessons: ['Earning Money & Jobs','Wants vs Needs','Identify Coins','Compare Coins'] },
];

// Pure helper: pick the unit metadata array for a given grade band
// ('k' | 'g1' | 'g2'). Defaults to Grade 2 for any unrecognized input so the
// dashboard never renders an empty unit grid. Exposed (and re-exported by the
// dashboard test mirror) so a single source of truth governs which unit names
// the parent sees in every view: unlock controls, quiz history, unit insights,
// and last-7-day accuracy.
// ── G3 lesson-name lookup table ───────────────────────────────────────────
// Mirrors src/data/shared_g3.js; used by _lessonDisplayName() to convert a
// raw G3 lessonId (e.g. 'g3-u1-l3') into a human-readable name for parents.
// Index 0 = g3u1, index 1 = g3u2, … Update both dashboards together.
var _G3_UNITS_META = [
  { name: 'Place Value to 100,000',
    lessons: ['Understand Numbers to 100,000','Ten Thousands to Ones','Compose From Place-Value Parts','Decompose Into Expanded Form','Base-10 Relationships','Benchmark Number Lines','Round Whole Numbers','Compare and Order Numbers'] },
  { name: 'Addition, Subtraction, and Money',
    lessons: ['Add Within 1,000','Subtract With Regrouping','Addition/Subtraction Relationships','Estimate Sums and Differences','Compatible Numbers','One-Step Word Problems','Two-Step Word Problems','Count Coins and Bills'] },
  { name: 'Multiplication Foundations',
    lessons: ['Equal Groups','Repeated Addition','Arrays','Skip Counting','Equal Jumps on a Number Line','Area Models','Facts: 0, 1, 2, 5, 10','Facts: 3, 4, 6','Facts: 7, 8, 9','Multiplication as Comparison'] },
  { name: 'Division Foundations',
    lessons: ['Equal Sharing','Equal Groups Division','Division With Arrays','Division as the Opposite of Multiplication','Fact Families','Quotients Using Multiplication','Missing Factors','Missing Products and Quotients'] },
  { name: 'Multiplication and Division Problem Solving',
    lessons: ['One-Step Multiplication','One-Step Division','Choose Multiplication or Division','Strip Diagrams','Write Equations','Two-Step Mult/Div Problems','Mixed Two-Step Problems','2-Digit × 1-Digit: Area Models','2-Digit × 1-Digit: Partial Products','2-Digit × 1-Digit: Standard Algorithm','Even and Odd Numbers'] },
  { name: 'Fractions as Numbers',
    lessons: ['Equal Parts of a Whole','Unit Fractions','Denominators 2, 3, 4, 6, 8','Fractions With Strip Diagrams','Fractions With Area Models','Fractions on a Number Line','Identify a Fraction From a Point','Fractions of a Set','Compose From Unit Fractions','Decompose Into Unit Fractions'] },
  { name: 'Equivalent and Comparing Fractions',
    lessons: ['Equivalent: Area Models','Equivalent: Strip Diagrams','Equivalent: Number Lines','Same Point, Same Value','Compare: Same Denominator','Compare: Same Numerator','Use >, <, and = With Fractions','Equal Shares, Different Shapes'] },
  { name: 'Geometry, Area, and Perimeter',
    lessons: ['Classify 2D Figures','Classify 3D Figures','Attributes of Shapes','Quadrilaterals','Special Quadrilaterals','Draw Other Quadrilaterals','Area With Unit Squares','Area: Rows and Columns','Area Using Multiplication','Composite Area','Perimeter','Missing Side With Perimeter'] },
  { name: 'Measurement, Time, and Data',
    lessons: ['Time Intervals in Minutes','Add Time Intervals','Subtract Time Intervals','Elapsed Time on Clocks & Number Lines','Choose Volume or Weight','Measure Liquid Volume','Measure Weight','Frequency Tables','Dot Plots','Pictographs','Scaled Bar Graphs','One- and Two-Step Data Problems'] },
  { name: 'Personal Financial Literacy and CBE Final Review',
    lessons: ['Labor, Human Capital, and Income','Scarcity and Cost','Planned Spending','Unplanned Spending','Credit and Borrowing','Interest and Paying Back','Reasons to Save','Savings Plans','Spending, Saving, Credit, Giving','Final Grade 3 CBE Review'] }
];

function _unitsMetaForBand(band) {
  var b = _gradeBand(band);
  if (b === 'k')  return _K_UNITS_META;
  if (b === 'g1') return _G1_UNITS_META;
  if (b === 'g3') return _G3_UNITS_META;
  return _UNITS_META; // 'g2' or unknown
}

// Pick the unit metadata array for the parent dashboard's CURRENT view-band.
// This previously read localStorage.mmr_grade (the student-side active grade)
// and ignored Grade 1 entirely — when the parent switched the dashboard view
// to G1, the unlock UI rendered the G2 unit list, and unlocks for indices
// 8–9 (which only exist in G2) silently dropped on the floor. The new
// implementation routes through the dashboard view-band so the rendered unit
// names always match the grade the parent is managing, and adds the missing
// G1 case.
function _activeDashboardUnitsMeta() {
  // The dashboard view-band is the source of truth for which grade the parent
  // is managing. _getDashboardViewGrade() handles the local/mock fallback to
  // mmr_grade for the unauthenticated case.
  var band = (typeof _getDashboardViewGrade === 'function')
    ? _getDashboardViewGrade()
    : _gradeBand(localStorage.getItem('mmr_grade')) || 'g2';
  return _unitsMetaForBand(band);
}

// Resolve a lessonId string to { lesson, unit } name objects.
// Handles K IDs (ku<n>l<m>), G1 IDs (g1-u<n>-l<m>), and grade-2 IDs (u<n>l<m>).
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
  // Phase 2B: G1 lessonId support — canonical form is 'g1-u<n>-l<m>' but we
  // also accept the no-hyphen variant 'g1u<n>l<m>' that some legacy probes use.
  var g1Match = s.match(/^g1[-]?u(\d+)[-]?l(\d+)$/i);
  if (g1Match) {
    var g1u = _G1_UNITS_META[parseInt(g1Match[1], 10) - 1];
    if (!g1u) return null;
    var g1l = g1u.lessons[parseInt(g1Match[2], 10) - 1];
    return g1l ? { lesson: g1l, unit: g1u.name } : null;
  }
  // Grade 3 lessonId support — canonical form 'g3-u<n>-l<m>'.
  var g3Match = s.match(/^g3[-]?u(\d+)[-]?l(\d+)$/i);
  if (g3Match) {
    var g3u = _G3_UNITS_META[parseInt(g3Match[1], 10) - 1];
    if (!g3u) return null;
    var g3l = g3u.lessons[parseInt(g3Match[2], 10) - 1];
    return g3l ? { lesson: g3l, unit: g3u.name } : null;
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

// Map a lessonId to its grade band ('k'|'g1'|'g2'|null). Used by Phase 2B
// to keep tagLessonIndex recommendations strictly grade-scoped.
function _lessonIdBand(lessonId) {
  if (!lessonId) return null;
  var s = String(lessonId).toLowerCase();
  if (/^g1[-]?u\d+[-]?l\d+$/.test(s)) return 'g1';
  if (/^g3[-]?u\d+[-]?l\d+$/.test(s)) return 'g3';
  if (/^ku\d+l\d+$/.test(s))          return 'k';
  if (/^u\d+l\d+$/.test(s))           return 'g2';
  return null;
}

// Convert a snake_case tag name to Title Case — fallback for tags not in _TAG_LABEL_MAP.
function _toTitleCase(s) {
  return String(s).replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}
function _normTag(tag) {
  return String(tag).toLowerCase()
    .replace(/\s*(practice|facts|skills?|basics?)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ── Skill tag labels ──────────────────────────────────────────────────────
// Maps tag names (from mmr_mastery_v1 / defaultTags) to parent-friendly labels.
// _toTitleCase() is the automatic fallback for any tag not listed here.
var _TAG_LABEL_MAP = {
  // ── K: Counting & Cardinality ─────────────────────────────────────────
  'counting':             'Counting',
  'count_to_10':          'Counting to 10',
  'count_to_20':          'Counting to 20',
  'count_backward':       'Counting Backward',
  'count_forward':        'Counting Forward',
  'count_from_any':       'Counting from Any Number',
  'count_strategy':       'Counting Strategies',
  'cardinality':          'How Many in All',
  'subitize':             'Quick Look (Subitize)',
  'recognize_groups':     'Recognizing Groups',
  'organize_groups':      'Organizing Groups',
  'numeral_recognition':  'Reading Numerals',
  'teen_numbers':         'Teen Numbers',
  'by_ones':              'Counting by Ones',
  'by_tens':              'Counting by Tens',
  'skip_count':           'Skip Counting',

  // ── K: Number Relationships ───────────────────────────────────────────
  'number_relationships': 'Number Relationships',
  'one_more':             'One More',
  'one_less':             'One Less',
  'compare':              'Comparing Numbers',
  'more_fewer_same':      'More, Fewer, or Same',
  'greater_less_equal':   'Greater, Less, or Equal',
  'more_less_equal':      'More, Less, or Equal',
  'more_fewer':           'More or Fewer',
  'compose':              'Putting Numbers Together',
  'decompose':            'Breaking Numbers Apart',
  'missing_number':       'Missing Numbers',
  'pattern':              'Number Patterns',

  // ── K: Addition & Subtraction ─────────────────────────────────────────
  'add_sub':              'Adding & Subtracting',
  'addition':             'Addition',
  'subtraction':          'Subtraction',
  'join':                 'Joining Groups',
  'take_away':            'Taking Away',
  'word_problem':         'Word Problems',
  'operation_choice':     'Choosing the Right Operation',
  'reasoning':            'Explaining Thinking',
  'join_separate':        'Joining & Separating',

  // ── K: Geometry ───────────────────────────────────────────────────────
  'shapes':               'Shapes',
  '2d':                   'Flat Shapes (2D)',
  '3d':                   'Solid Shapes (3D)',
  'sides':                'Sides of Shapes',
  'corners':              'Corners of Shapes',
  'identify':             'Identifying',
  'sort':                 'Sorting',
  'attributes':           'Shape Attributes',

  // ── K: Measurement ────────────────────────────────────────────────────
  'measurement':          'Measurement',
  'length':               'Length',
  'height':               'Height',
  'weight':               'Weight',
  'capacity':             'Capacity',
  'order':                'Ordering',
  'sequence':             'Ordering in Sequence',

  // ── K: Data Analysis ──────────────────────────────────────────────────
  'data':                 'Reading Data',
  'categorize':           'Sorting into Categories',
  'picture_graph':        'Picture Graphs',
  'build_read':           'Building & Reading Graphs',

  // ── K: Financial Literacy ─────────────────────────────────────────────
  'money':                'Money',
  'income':               'Earning Money',
  'jobs':                 'Jobs & Income',
  'wants':                'Wants',
  'needs':                'Needs',
  'coins':                'Coins',
  'penny':                'Pennies',
  'nickel':               'Nickels',
  'dime':                 'Dimes',
  'quarter':              'Quarters',

  // ── Grade 1/2: Basic Facts ────────────────────────────────────────────
  'basic_facts':          'Basic Math Facts',
  'doubles':              'Doubles',
  'make_ten':             'Make a 10',
  'count_up':             'Count Up',
  'count_back':           'Count Back',
  'number_families':      'Fact Families',

  // ── Grade 1/2: Place Value & Operations ───────────────────────────────
  'place_value':          'Place Value',
  'regrouping':           'Regrouping',
  'skip_counting':        'Skip Counting',
  'estimation':           'Estimating',
  'rounding':             'Rounding',
  'mental_math':          'Mental Math',

  // ── Grade 1/2: Other areas ────────────────────────────────────────────
  'fractions':            'Fractions',
  'geometry':             'Geometry',
  'time':                 'Telling Time',
  'multiplication':       'Multiplication',
  'division':             'Division',
  'financial_literacy':   'Financial Literacy',
};

// ── Dashboard view-grade state ────────────────────────────────────────────
// Persisted per active student in localStorage as mmr_dash_view_grade_<sid>.
// PURE VIEW FILTER — does NOT touch profile.grade or mmr_grade (the student
// app's active grade). Initialized from the student's profile.grade on first
// view of that student.
function _getDashboardViewGrade() {
  // No active student / preview / local mode → fall back to the app's grade.
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
  // Fall back to the student's profile.grade resolution.
  var profile = (typeof _managedProfiles !== 'undefined' && _managedProfiles)
    ? _managedProfiles.find(function(p){ return p.id === _activeId; })
    : null;
  if (typeof _dbResolveProfileGrade === 'function') {
    return _gradeBand(_dbResolveProfileGrade(profile, _activeId)) || 'g2';
  }
  return 'g2';
}

// ── Launch-grade gating helpers ───────────────────────────────────────────
//
// Grade availability is decided by app-config (LAUNCH_GRADES). Grade 3 ships
// hidden: 89 of its 97 lessons are empty shells, and the dashboard has never
// supported it — _gradeBand has no 'g3' branch, so a Grade 3 view silently
// degraded to Grade 2 and Grade 3 scores were dropped as 'legacy_unknown'.
// See tests/g3.test.js for the characterization of that defect.
//
// The unfinished content is NOT deleted; only its customer-facing entry points
// are closed, and a localhost dev override (mmr_flag_GRADE_3=1) reopens them.

// Grade tokens ('K'|'1'|'2'|'3') mapped to dashboard view bands.
var _DB_GRADE_TO_BAND = { 'K': 'k', '1': 'g1', '2': 'g2', '3': 'g3' };
var _DB_GRADE_LABEL   = { 'K': 'Kindergarten', '1': 'Grade 1', '2': 'Grade 2',
                          '3': 'Grade 3', '4': 'Grade 4', '5': 'Grade 5' };

// Is this profile sitting on a grade the product no longer offers?
function _dbIsUnsupportedGrade(grade) {
  if (grade === null || grade === undefined || grade === '') return false;
  if (typeof isGradeLaunched !== 'function') return false;
  return !isGradeLaunched(grade);
}

// Options for the "Viewing:" filter — launched grades only, plus the currently
// selected band if it is somehow unlaunched (so the control never lies about
// what it is showing).
function _dbViewGradeOptions(viewBand) {
  var grades = (typeof launchGrades === 'function') ? launchGrades() : ['K', '1', '2'];
  var out = '';
  grades.forEach(function(g) {
    var band = _DB_GRADE_TO_BAND[g];
    if (!band) return;
    out += '<option value="' + band + '"' + (viewBand === band ? ' selected' : '') + '>'
        +  _DB_GRADE_LABEL[g] + '</option>';
  });
  return out;
}

// Options for the Edit Student grade picker.
//
// Fixes a reversal that shipped on master: Grade 1 was marked "(coming soon)"
// despite being complete (40 lessons, 6,331 questions), while Grade 3 — 8%
// built — was selectable. Launch grades are now driven by config.
//
// A profile already on an unlaunched grade keeps a visible, SELECTED but
// DISABLED entry for it. Silently dropping the option would make the select
// default to Kindergarten, so a parent who opened the sheet to change the
// child's name and pressed Save would unknowingly move them to a different
// grade. The disabled entry states the situation and forces a deliberate
// choice; dbEditSave() refuses to persist an unlaunched grade regardless.
function _dbEditGradeOptions(currentGrade) {
  var grades = (typeof launchGrades === 'function') ? launchGrades() : ['K', '1', '2'];
  var out = '';
  if (_dbIsUnsupportedGrade(currentGrade)) {
    out += '<option value="' + _esc(String(currentGrade)) + '" selected disabled>'
        +  _esc(_DB_GRADE_LABEL[currentGrade] || ('Grade ' + currentGrade))
        +  ' — no longer available</option>';
  }
  grades.forEach(function(g) {
    out += '<option value="' + g + '"' + (currentGrade === g ? ' selected' : '') + '>'
        +  _DB_GRADE_LABEL[g] + '</option>';
  });
  ['4', '5'].forEach(function(g) {
    if (grades.indexOf(g) !== -1) return;
    out += '<option value="' + g + '" disabled>' + _DB_GRADE_LABEL[g] + ' (coming soon)</option>';
  });
  return out;
}

// Options for the Add Student grade picker: supported grades only, nothing
// pre-selected. Withdrawn and unbuilt grades are absent entirely — a new
// profile can never start on one.
function _dbAddGradeOptions() {
  var grades = (typeof launchGrades === 'function') ? launchGrades() : ['K', '1', '2'];
  return grades.map(function(g) {
    return '<option value="' + g + '">' + _DB_GRADE_LABEL[g] + '</option>';
  }).join('');
}

// Parent-facing explanation shown beside the grade picker when a child is on a
// withdrawn grade. States plainly that their work is kept, so nobody assumes
// changing grade discards it.
function _dbUnsupportedGradeNotice(currentGrade) {
  if (!_dbIsUnsupportedGrade(currentGrade)) return '';
  var label = _DB_GRADE_LABEL[currentGrade] || ('Grade ' + currentGrade);
  return '<div style="margin:6px 0 12px;padding:10px 12px;border-radius:8px;'
    + 'background:#fff8e1;border:1px solid #ffe082;font-size:.78rem;color:#5d4037;line-height:1.45">'
    + '<strong>' + _esc(label) + ' is not available right now.</strong> '
    + 'We are still finishing its lessons, so it is no longer offered. '
    + 'This student’s ' + _esc(label) + ' work is saved and is not deleted — '
    + 'choose a supported grade above to keep learning.'
    + '</div>';
}

function _setDashboardViewGrade(band) {
  var b = _gradeBand(band);
  if (!b) return;
  if (_activeId && _activeId !== 'local' && _activeId !== 'mock_1' && _activeId !== 'mock_2') {
    try { localStorage.setItem('mmr_dash_view_grade_' + _activeId, b); } catch (_e) {}
  }
  _activeDrawerUnit = -1;
  // Load unlock settings for the new view-grade slot is already covered by the
  // single byGrade draft — just re-render the dashboard against the new band.
  if (typeof renderDashboard === 'function') renderDashboard();
}

// ── Parent controls draft state ───────────────────────────────────────────
var _unlockDraft       = _parseUnlockSettings({});
var _unlockDirty       = false;
var _activeDrawerUnit  = -1;
var _unlockScores      = [];
var _activityEvents    = [];     // grade-filtered ACTIVITY events for active student
var _activityDetailView = null;  // 'accuracy' | 'quizzes' | 'time' | 'lessons' | 'day' | null
var _activityDetailDay = null;   // 'YYYY-MM-DD' when view === 'day'
var _quizHistoryFilters = {
  range:  'lifetime',  // '7d' | '30d' | '60d' | '3m' | '6m' | '1y' | 'lifetime'
  unit:   'all',       // 'all' | unitIdx as string ('0', '1', ...)
  lesson: 'all',       // 'all' | 'unit-test' | 'u1l2' (lesson key extracted from qid)
  result: 'all',       // 'all' | 'pass' | 'fail'
  sort:   'date-desc'  // 'date-desc' | 'date-asc' | 'accuracy-desc' | 'accuracy-asc' | 'pass-first' | 'fail-first'
};
var _timerDraft        = _parseTimerSettings({});
var _a11yDraft        = _parseA11ySettings({});
var _dbFbRating       = 0;
var _dbFbCategory     = '';
// Configurable quiz length — per active student. Draft holds the working
// selection; custom-mode tracks whether the Custom number input is showing for
// each scope. Loaded from localStorage (mmr_quiz_lengths_<sid>) on student
// switch. Preset chip values per scope drive the active-state highlight.
var _QLEN_PRESETS      = { lesson: [10, 15, 20], unit: [10, 15, 40] };
var _quizLenDraft      = { lesson: 'default', unit: 'default' };
var _quizLenCustomMode = { lesson: false, unit: false };
// Live text in each Custom input, preserved across in-place re-renders so a
// typed-but-unsaved custom number isn't wiped when the parent clicks a chip in
// the other group.
var _quizLenCustomText = { lesson: '', unit: '' };

// ── Settings load functions ───────────────────────────────────────────────

async function _loadUnlockSettings(studentId) {
  var viewBand = _getDashboardViewGrade();
  if (!_supa || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _unlockDraft = _parseUnlockSettings({}, viewBand);
    return;
  }
  try {
    var result = await _supa.rpc('get_unlock_settings', { p_student_id: studentId });
    _unlockDraft = _parseUnlockSettings(result.data || {}, viewBand);
  } catch(e) {
    _unlockDraft = _parseUnlockSettings({}, viewBand);
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

// Ensure the current view-grade slot exists on _unlockDraft and return it.
// Mutations target the slot directly so JSON.stringify(_unlockDraft) reflects
// the change for the Supabase + localStorage save.
function _activeUnlockSlot() {
  if (!_unlockDraft || !_unlockDraft.byGrade) {
    _unlockDraft = _parseUnlockSettings({}, _getDashboardViewGrade());
  }
  var band = _getDashboardViewGrade();
  if (!_unlockDraft.byGrade[band]) _unlockDraft.byGrade[band] = _emptyUnlockSlot();
  return _unlockDraft.byGrade[band];
}

// Phase C.1: attach the per-event student-id override for dashboard actions.
// Dashboard targets the student selected in the UI (`_activeId`), which may
// differ from `localStorage.mmr_active_student_id` (set by the last student
// session). The server still verifies parent ownership of the override —
// see analytics-ingest.js _perEventStudent. Local / mock placeholder ids
// stay out of the claim (server would reject them anyway).
function _dbAnaMeta(extra) {
  var meta = extra || {};
  if (_activeId && typeof _activeId === 'string'
      && _activeId !== 'local'
      && _activeId.indexOf('mock_') !== 0) {
    meta._override_student_id = _activeId;
  }
  return meta;
}

function _dbToggleFreeMode() {
  var slot = _activeUnlockSlot();
  var _prev = !!slot.freeMode;
  slot.freeMode = !slot.freeMode;
  _unlockDirty = true;
  _reRenderUnlock();
  try {
    _trackEvent('free_mode_changed', _dbAnaMeta({
      grade: _getDashboardViewGrade() || null,
      prev:  _prev,
      next:  !!slot.freeMode,
    }));
  } catch (_) {}
}

function _dbToggleUnitUnlock(unitIdx) {
  var slot = _activeUnlockSlot();
  var idx = slot.units.indexOf(unitIdx);
  var _action;
  if (idx === -1) { slot.units.push(unitIdx);     _action = 'unlock'; }
  else            { slot.units.splice(idx, 1);    _action = 'relock'; }
  _unlockDirty = true;
  _reRenderUnlock();
  try {
    _trackEvent('manual_unlock_changed', _dbAnaMeta({
      grade:   _getDashboardViewGrade() || null,
      scope:   'unit',
      unit_id: 'u' + unitIdx,
      action:  _action,
    }));
  } catch (_) {}
}

function _dbToggleLessonUnlock(unitIdx, lessonIdx) {
  var slot = _activeUnlockSlot();
  var key = unitIdx + '_' + lessonIdx;
  var _action;
  if (slot.lessons[key]) { delete slot.lessons[key]; _action = 'relock'; }
  else                   { slot.lessons[key] = true;  _action = 'unlock'; }
  _unlockDirty = true;
  _reRenderUnlock();
  try {
    var _l2 = UNITS_DATA[unitIdx] && UNITS_DATA[unitIdx].lessons[lessonIdx];
    _trackEvent('manual_unlock_changed', _dbAnaMeta({
      grade:     _getDashboardViewGrade() || null,
      scope:     'lesson',
      unit_id:   'u' + unitIdx,
      lesson_id: _l2 ? _l2.id : null,
      action:    _action,
    }));
  } catch (_) {}
}

function _dbToggleLessonDrawer(unitIdx) {
  _activeDrawerUnit = (_activeDrawerUnit === unitIdx) ? -1 : unitIdx;
  _reRenderUnlock();
}

function _isUnitNaturallyUnlocked(unitIdx, scores) {
  if (unitIdx === 0) return true;
  return scores.some(function(s) {
    return s.unitIdx === (unitIdx - 1) && s.type === 'unit' && s.pct >= 80;
  });
}

function _computePassedLessonQuizzes(scores) {
  var done = {};
  scores.forEach(function(s) {
    if (s.type !== 'lesson' || !s.qid || s.pct < 80) return;
    var m = String(s.qid).match(/^lq_u(\d+)l(\d+)$/i);
    if (!m) return;
    var ui = parseInt(m[1], 10) - 1;
    var li = parseInt(m[2], 10) - 1;
    if (!isNaN(ui) && !isNaN(li)) done[ui + '_' + li] = true;
  });
  return done;
}

function _isLessonNaturallyUnlocked(unitIdx, lessonIdx, passedLessons) {
  if (lessonIdx === 0) return true;
  return !!passedLessons[unitIdx + '_' + (lessonIdx - 1)];
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
  var label = viewBand === 'k' ? 'Kindergarten' : (viewBand === 'g1' ? 'Grade 1' : (viewBand === 'g3' ? 'Grade 3' : 'Grade 2'));
  if (!confirm('Remove all unit and lesson unlocks for ' + label + '?')) return;
  // Clear ONLY the current view-grade slot; other grades' settings stay.
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
  if (!_supa) { _reRenderUnlock(); return; }
  try {
    await _supa.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#37474f'; msg.textContent = '🔒 ' + label + ' locks restored.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) { /* silently ignore — draft was already reset */ }
  _reRenderUnlock();
}

// ── reset_epoch helpers ────────────────────────────────────────────────
// Per-student "last seen server reset revision" stored in localStorage.
// The student_profiles.reset_epoch column gets bumped every time
// reset_student_data fires (server returns the new epoch). On any pull
// or sync, the client compares server.reset_epoch with this local value
// and if the server is newer, wipes every grade-scoped progress cache
// before re-rendering. The push pipeline forwards this value as
// p_reset_epoch; the server rejects pushes whose local epoch is behind.

function _dbResetEpochKey(sid) { return 'mmr_reset_epoch_' + String(sid); }

function _dbReadLocalResetEpoch(sid) {
  if (!sid || sid === 'local') return 0;
  try {
    var raw = localStorage.getItem(_dbResetEpochKey(sid));
    var n = raw ? parseInt(raw, 10) : 0;
    return (Number.isFinite(n) && n >= 0) ? n : 0;
  } catch (_e) { return 0; }
}

function _dbWriteLocalResetEpoch(sid, epoch) {
  if (!sid || sid === 'local') return;
  if (typeof epoch !== 'number' || !Number.isFinite(epoch) || epoch < 0) return;
  try { localStorage.setItem(_dbResetEpochKey(sid), String(Math.floor(epoch))); } catch (_e) {}
}

// Pure decision helper: "should the client clear its local progress
// caches based on this server epoch?" Returns true iff the server epoch
// is a real, larger value than the local one.
//
//   serverEpoch > 0 AND serverEpoch > localEpoch → clear
//   otherwise → don't clear
//
// (serverEpoch == 0 means the server hasn't recorded a reset yet; that
// shouldn't trigger a wipe, even on a brand-new client with localEpoch=0.)
function _dbShouldClearForResetEpoch(localEpoch, serverEpoch) {
  if (typeof serverEpoch !== 'number' || !Number.isFinite(serverEpoch) || serverEpoch <= 0) return false;
  var le = (typeof localEpoch === 'number' && Number.isFinite(localEpoch) && localEpoch >= 0) ? localEpoch : 0;
  return serverEpoch > le;
}

// Apply the server's reset_epoch for a student: if it's newer than the
// local-stored value, wipe every grade-scoped local cache + the in-memory
// const globals (SCORES, DONE, MASTERY, STREAK, APP_TIME) when the
// device's active session belongs to this student. Returns true if a
// wipe ran. Always writes the new epoch on success.
function _dbApplyServerResetEpoch(sid, serverEpoch) {
  if (!sid || sid === 'local') return false;
  var localEpoch = _dbReadLocalResetEpoch(sid);
  if (!_dbShouldClearForResetEpoch(localEpoch, serverEpoch)) return false;
  var sessionMatches = false;
  try { sessionMatches = (localStorage.getItem('mmr_active_student_id') === sid); } catch (_e) {}
  // sessionMatches=true triggers the broad sweep (all grades + session
  // keys + in-memory consts) because this device's active student-app
  // session belongs to the student being invalidated.
  _dbWipeLocalProgressCaches('', sessionMatches);
  _dbWriteLocalResetEpoch(sid, serverEpoch);
  return true;
}

// Pure helper: returns the list of localStorage keys that Reset Student Data
// must remove so the student-side render (boot.js, home.js, isUnitUnlocked
// in nav.js) doesn't fall back to stale local progress after the server
// wipe.
//
// The bug this addresses: state.js loads SCORES/DONE/MASTERY from grade-
// scoped keys (wb_sc5_<grade>, wb_done5_<grade>, wb_mastery_<grade>,
// mmr_mastery_v1_<grade>). Those keys survive `reset_student_data` RPC,
// so on the very next render — including immediately after the parent
// taps "Go to <Name>'s App" — isUnitUnlocked reads the stale prior-unit
// quiz scores and unlocks Unit 2+ even though the server has been wiped.
//
// gradeBand: 'K' | '1' | '2' — the reset student's profile grade.
// sessionMatches: true when localStorage.mmr_active_student_id ===
//   _activeId. When it matches, the reset student IS the device's active
//   student-app session, so we wipe ALL grade caches — the student may
//   have practiced multiple grades on this device, and the server-side
//   reset_student_data RPC clears every quiz_scores row for them
//   regardless of grade. The student-app's `mmr_grade` can also differ
//   from the profile's official grade (the parent may have changed view
//   modes), so a profile-grade-only wipe was leaving `wb_sc5_<other>`
//   stale — which is exactly what reopened Unit 2/3 in the post-deploy
//   bug report.
//   We also clear the non-grade-scoped session caches (wb_streak,
//   wb_apptime, wb_act_dates, wb_paused_quiz) and the legacy un-namespaced
//   keys only when sessionMatches — otherwise we'd corrupt a different
//   student's active session.
function _dbProgressCacheKeysForReset(gradeBand, sessionMatches) {
  var keys = [];
  // Profile-grade caches always cleared (safe even when sessionMatches is
  // false: the grade-scoped cache only holds the last practitioner's data,
  // and the next sign-in pulls a fresh copy from Supabase).
  if (gradeBand === 'K' || gradeBand === '1' || gradeBand === '2' || gradeBand === '3') {
    keys.push('wb_sc5_'         + gradeBand);
    keys.push('wb_done5_'       + gradeBand);
    keys.push('wb_mastery_'     + gradeBand);
    keys.push('mmr_mastery_v1_' + gradeBand);
  }
  // Tier 1 cross-device sync: paused-quiz state must always be wiped on
  // student/profile switch — even when sessionMatches is false. The key
  // is a single global JSON map keyed by qid, so leaving it intact lets
  // a paused entry from Student A or another device's session surface
  // on the new student's first dashboard render.
  keys.push('wb_paused_quiz');
  if (sessionMatches) {
    // The reset student owns this device's active session — sweep every
    // grade cache so a cross-grade student-app view can't fall back to
    // pre-reset scores. Dedup against the profile-grade entries above.
    ['K', '1', '2', '3'].forEach(function(g) {
      keys.push('wb_sc5_'         + g);
      keys.push('wb_done5_'       + g);
      keys.push('wb_mastery_'     + g);
      keys.push('mmr_mastery_v1_' + g);
    });
    keys.push('wb_streak');
    keys.push('wb_act_dates');
    keys.push('wb_apptime');
    // Legacy un-namespaced keys (pre-grade-scoping). The Grade-2 migration
    // in state.js copies these into the namespaced slot on next boot, so
    // clearing them prevents a stale repopulation cycle.
    keys.push('wb_sc5');
    keys.push('wb_done5');
    keys.push('wb_mastery');
  }
  // Dedup: when sessionMatches=true and gradeBand is one of K/1/2, the
  // profile-grade key is also in the all-grades pass.
  var seen = {};
  var out = [];
  for (var i = 0; i < keys.length; i++) {
    if (!seen[keys[i]]) { seen[keys[i]] = true; out.push(keys[i]); }
  }
  return out;
}

// Imperative wipe: removes the local progress caches that survive the
// server reset, then mutates the in-memory consts the student-app
// renderer reads (SCORES/DONE/MASTERY/STREAK/APP_TIME). The const
// mutations only run when the device session belongs to the reset
// student; otherwise we'd corrupt a different student's active session.
//
// Safe to call when the const globals aren't defined (test harness) — the
// typeof guards short-circuit cleanly.
function _dbWipeLocalProgressCaches(gradeBand, sessionMatches) {
  var keys = _dbProgressCacheKeysForReset(gradeBand, sessionMatches);
  keys.forEach(function(k) {
    try { localStorage.removeItem(k); } catch (_e) {}
  });
  if (!sessionMatches) return;
  if (typeof SCORES !== 'undefined' && SCORES && typeof SCORES.length === 'number') {
    SCORES.length = 0;
  }
  if (typeof DONE !== 'undefined' && DONE && typeof DONE === 'object') {
    Object.keys(DONE).forEach(function(k) { delete DONE[k]; });
  }
  if (typeof MASTERY !== 'undefined' && MASTERY && typeof MASTERY === 'object') {
    Object.keys(MASTERY).forEach(function(k) { delete MASTERY[k]; });
  }
  if (typeof STREAK !== 'undefined' && STREAK) {
    STREAK.current = 0; STREAK.longest = 0; STREAK.lastDate = null;
  }
  if (typeof APP_TIME !== 'undefined' && APP_TIME) {
    APP_TIME.totalSecs = 0;
    APP_TIME.sessions  = 0;
    if (APP_TIME.dailySecs && typeof APP_TIME.dailySecs === 'object') {
      Object.keys(APP_TIME.dailySecs).forEach(function(k) { delete APP_TIME.dailySecs[k]; });
    }
  }
}

// Pure helper: clear every in-memory field on a student object that the
// server-side reset_student_data RPC clears server-side. Kept pure (no DOM,
// no Supabase, no globals) so it can be unit-tested directly through the
// production bundle harness (tests/dashboard-harness.js).
//
// Fields cleared mirror the SQL function exactly: quiz_scores + user_mastery
// + the seven progress columns on student_profiles (mastery_json,
// streak_*, apptime_json, done_json, act_dates_json, settings_json,
// onboarding_json). The student identity (name, grade, avatar, etc.) is
// preserved — Reset All is a progress wipe, not a profile deletion.
function _dbResetStudentInMemory(student) {
  if (!student) return;
  student.SCORES     = [];
  student.MASTERY    = {};
  student.ACTIVITY   = [];
  student.STREAK     = { current: 0, longest: 0, lastDate: null };
  student.APP_TIME   = { totalSecs: 0, sessions: 0, dailySecs: {} };
  student.DONE       = {};
  student.ACT_DATES  = [];
  student.SETTINGS   = {};
  student.ONBOARDING = null;
  student._scoresLoaded = false;
}

async function _dbFullReset() {
  if (!confirm('DELETE all quiz scores, mastery data, and streak for this student? This cannot be undone.')) return;
  if (!_supa) return;

  function _setResetMsg(text, color) {
    var el = document.getElementById('db-reset-msg');
    if (el) { el.style.color = color || ''; el.textContent = text || ''; }
  }

  _setResetMsg('Resetting…', '#37474f');

  // ── Phase 1: main RPC — the ONLY place that may report "Reset failed" ───
  // If this throws, no server data was touched, so it is safe to bail out.
  var _newResetEpoch = 0;
  try {
    var result = await _supa.rpc('reset_student_data', { p_student_id: _activeId });
    if (result.error) throw result.error;
    // The RPC now returns the new BIGINT epoch. Older deployments
    // returned void, in which case data is null — fall back to Date.now()
    // so we at least record a non-zero local marker.
    var _epochFromRpc = (result.data != null) ? Number(result.data) : 0;
    _newResetEpoch = (Number.isFinite(_epochFromRpc) && _epochFromRpc > 0)
      ? _epochFromRpc
      : Date.now();
  } catch(e) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Reset] reset_student_data RPC failed:', e);
    }
    _setResetMsg('❌ Reset failed — try again.', '#c62828');
    return;
  }

  // Phase B: record the successful reset for product analytics. Fires only
  // after the server confirms the wipe, so failed resets aren't counted.
  // Phase C.1: attribute to _activeId (the student the parent actually
  // reset), not whatever mmr_active_student_id happens to be — see
  // _dbAnaMeta + analytics-ingest.js _perEventStudent.
  try {
    var _resetGradeForAna = null;
    if (typeof _dbReadProfileGrade === 'function') {
      _resetGradeForAna = _dbReadProfileGrade(_activeId) || null;
    }
    _trackEvent('student_reset', _dbAnaMeta({ grade: _resetGradeForAna }));
  } catch (_) {}

  // ── Phase 2: post-reset cleanup (server data is ALREADY cleared) ────────
  // Each step is independently best-effort. A failure here MUST NOT surface
  // as "Reset failed" because that would lie to the user — the underlying
  // data is already gone on the server. Failures are logged for diagnosis.
  try {
    // Fire-and-forget — the RPC is ownership-checked server-side, so a
    // network blip here is non-fatal. The events table is also drained on
    // the next sync poll.
    _supa.rpc('clear_intervention_events', { p_student_id: _activeId })
      .catch(function(err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[Reset] clear_intervention_events failed (non-fatal):', err);
        }
      });

    // Clear in-memory state so renderDashboard reflects empty progress on
    // the very next paint — no page reload required.
    _dbResetStudentInMemory(_students[_activeId]);

    // Wipe the student-side local progress caches (wb_sc5_<grade>,
    // wb_done5_<grade>, wb_mastery_<grade>, mmr_mastery_v1_<grade>) and
    // their in-memory const mirrors (SCORES/DONE/MASTERY/STREAK/APP_TIME).
    // Without this step, the very next call to enterStudentLearningSession
    // — i.e. the parent tapping "Go to <Name>'s App" — re-hydrates SCORES
    // from the stale local cache and isUnitUnlocked re-opens Unit 2+ on
    // the strength of pre-reset prior-unit quiz scores.
    try {
      var _resetProfile = (_managedProfiles || []).find(function(p) { return p && p.id === _activeId; });
      var _resetGrade   = (typeof _dbResolveProfileGrade === 'function' && _resetProfile)
        ? _dbResolveProfileGrade(_resetProfile, _activeId)
        : ((typeof _dbReadProfileGrade === 'function') ? _dbReadProfileGrade(_activeId) : '2');
      var _sessionMatches = false;
      try { _sessionMatches = (localStorage.getItem('mmr_active_student_id') === _activeId); } catch (_e) {}
      _dbWipeLocalProgressCaches(_resetGrade, _sessionMatches);
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[Reset] local progress cache wipe failed (non-fatal):', e);
      }
    }

    // Record the new server reset epoch locally so the cross-device
    // invalidation pipeline knows this device has already absorbed the
    // reset and pushes can include the right p_reset_epoch going forward.
    _dbWriteLocalResetEpoch(_activeId, _newResetEpoch);

    // The dashboard prefers _remoteInterventionEvents over the legacy local
    // cache; resetting both prevents a renderDashboard fall-through to the
    // stale cache while the next sync is in flight.
    _remoteInterventionEvents = [];
    try { localStorage.removeItem('mmr_intervention_events_v1'); } catch (_e) {}

    renderDashboard();

    // Reload from Supabase async — will re-render with confirmed-empty data.
    _loadManagedStudentScores(_activeId);
  } catch(e) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Reset] post-reset cleanup error (server data IS cleared, UI may need refresh):', e);
    }
    // Intentionally fall through to the success message — the actual reset
    // succeeded; only the local refresh hit a snag. A page reload picks up
    // the empty state from the server.
  }

  _setResetMsg('✅ Student data cleared.', '#2e7d32');
  setTimeout(function() { _setResetMsg('', ''); }, 3000);
  _showDbToast('Student data cleared.', false);
}

// ── Access Controls — render ──────────────────────────────────────────────

function _renderUnlockInner() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  if (isMock) {
    return '<p class="db-empty">Unlock settings require a student profile connected to a parent account.</p>';
  }
  var viewBand = _getDashboardViewGrade();
  var gradeLabel = viewBand === 'k' ? 'Kindergarten' : (viewBand === 'g1' ? 'Grade 1' : (viewBand === 'g3' ? 'Grade 3' : 'Grade 2'));
  var slot = _draftSlot(_unlockDraft, viewBand);
  var fm = slot.freeMode;
  var passedLessons = _computePassedLessonQuizzes(_unlockScores);
  var unitsMeta = _activeDashboardUnitsMeta();
  var html = '';

  // Grade context — Free Mode is grade-specific.
  html += '<p class="db-unlock-grade-context" style="margin:0 0 12px;font-size:.8rem;color:#607d8b">'
    + 'Free Mode &amp; per-unit unlocks apply to <strong>' + _esc(gradeLabel) + '</strong> only. '
    + 'Switch grades using the dropdown above to manage other grades.</p>';

  // Free Mode toggle
  html += '<div class="db-toggle-row">'
    + '<div><strong>&#x1F31F; Free Mode &mdash; ' + _esc(gradeLabel) + '</strong><br>'
    + '<span class="db-toggle-sub">Unlock all ' + _esc(gradeLabel) + ' units and lessons at once</span></div>'
    + '<button class="db-toggle-btn' + (fm ? ' db-toggle-on' : '') + '" data-action="_dbToggleFreeMode">'
    + (fm ? 'ON' : 'OFF') + '</button>'
    + '</div>';

  if (fm) {
    html += '<p class="db-unlock-free-note">Free Mode is active for ' + _esc(gradeLabel) + ' — all units and lessons are accessible. Individual toggles are disabled.</p>';
  }

  // Unit cards grid — dims entirely when Free Mode is on
  html += '<div class="db-unit-grid"' + (fm ? ' style="opacity:.5;pointer-events:none"' : '') + '>';
  unitsMeta.forEach(function(u, i) {
    var parentUnlocked    = _isUnitUnlockedInDraft(_unlockDraft, i);
    var naturallyUnlocked = _isUnitNaturallyUnlocked(i, _unlockScores);
    var effective         = fm || parentUnlocked || naturallyUnlocked;

    if (i === 0) {
      // Unit 1: always available — no toggle
      html += '<div class="db-unit-card db-unit-unlocked">'
        + '<div class="db-unit-card-top">'
        + '<span class="db-unit-num">Unit 1</span>'
        + '<span class="db-unit-always-badge">Always Available</span>'
        + '</div>'
        + '<div class="db-unit-name">' + _esc(u.name) + '</div>'
        + '<button class="db-unit-lessons-link" data-action="_dbToggleLessonDrawer" data-arg="0">'
        + 'Manage lessons ' + (_activeDrawerUnit === 0 ? '▲' : '▼') + '</button>'
        + '</div>';
    } else {
      var progressBadge = (!parentUnlocked && naturallyUnlocked)
        ? '<span class="db-unit-progress-badge">&#x2713; Unlocked by progress</span>'
        : '';
      html += '<div class="db-unit-card' + (effective ? ' db-unit-unlocked' : '') + '">'
        + '<div class="db-unit-card-top">'
        + '<span class="db-unit-num">Unit ' + (i + 1) + '</span>'
        + '<button class="db-toggle-btn db-toggle-sm' + (parentUnlocked ? ' db-toggle-on' : '') + '" data-action="_dbToggleUnitUnlock" data-arg="' + i + '">'
        + (parentUnlocked ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div class="db-unit-name">' + _esc(u.name) + '</div>'
        + progressBadge
        + '<button class="db-unit-lessons-link" data-action="_dbToggleLessonDrawer" data-arg="' + i + '">'
        + 'Manage lessons ' + (_activeDrawerUnit === i ? '▲' : '▼') + '</button>'
        + '</div>';
    }

    // Lesson drawer — spans full grid width
    if (_activeDrawerUnit === i) {
      html += '</div><div class="db-lesson-drawer">';
      u.lessons.forEach(function(lName, li) {
        if (li === 0) {
          // First lesson: always available — no toggle
          html += '<div class="db-lesson-row">'
            + '<span class="db-lesson-name">' + _esc(lName) + '</span>'
            + '<span class="db-lesson-always-badge">Always Available</span>'
            + '</div>';
        } else {
          var lu = _isLessonUnlockedInDraft(_unlockDraft, i, li);
          var naturalLesson = _isLessonNaturallyUnlocked(i, li, passedLessons);
          var lProgBadge = (!lu && naturalLesson)
            ? ' <span class="db-unit-progress-inline">&#x2713; progress</span>'
            : '';
          html += '<div class="db-lesson-row">'
            + '<span class="db-lesson-name">' + _esc(lName) + lProgBadge + '</span>'
            + '<button class="db-toggle-btn db-toggle-sm' + (lu ? ' db-toggle-on' : '') + '" data-action="_dbToggleLessonUnlock" data-arg="' + i + '" data-arg2="' + li + '">'
            + (lu ? 'ON' : 'OFF') + '</button>'
            + '</div>';
        }
      });
      html += '</div><div class="db-unit-grid" style="margin-top:0">';
    }
  });
  html += '</div>'; // close db-unit-grid

  // Save + Re-lock All (Full Reset moved to Danger Zone)
  html += '<div id="db-unlock-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns">'
    + '<button id="db-unlock-save-btn" class="db-ctrl-save" data-action="_dbSaveUnlock">Save Changes</button>'
    + '<button class="db-ctrl-relock" data-action="_dbRelockAll">&#x1F512; Re-lock All</button>'
    + '</div>';

  return html;
}

function _renderUnlockSection() {
  return '<section class="db-section" id="db-unlock-section">'
    + '<h2 class="db-sec-h">&#x1F513; Access Controls</h2>'
    + '<div id="db-unlock-wrap">' + _renderUnlockInner() + '</div>'
    + '</section>';
}

function _renderDangerZoneSection() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  if (isMock) return '';
  return '<section class="db-section db-danger-zone">'
    + '<h2 class="db-sec-h db-danger-heading">&#x1F5D1;&#xFE0F; Profile Reset</h2>'
    + '<p class="db-danger-desc">Resetting student data permanently deletes quiz scores, mastery, streaks, and progress history. This cannot be undone.</p>'
    + '<div id="db-reset-msg" class="db-ctrl-msg" aria-live="polite" style="min-height:1em"></div>'
    + '<div class="db-ctrl-btns">'
    + '<button class="db-ctrl-reset" data-action="_dbFullReset">Reset Student Data</button>'
    + '</div>'
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

// ── Quiz length section (configurable lesson/unit quiz lengths) ─────────────

function _qlIsCustom(scope, val) {
  return (typeof val === 'number') && _QLEN_PRESETS[scope].indexOf(val) === -1;
}

// Loads the active student's saved quiz lengths into the working draft.
// Synchronous (localStorage only) — no Supabase, per the v1 scope.
function _loadQuizLenSettings(studentId) {
  var cfg = (typeof loadQuizLengths === 'function')
    ? loadQuizLengths(studentId)
    : { lesson: 'default', unit: 'default' };
  _quizLenDraft = { lesson: cfg.lesson, unit: cfg.unit };
  _quizLenCustomMode = {
    lesson: _qlIsCustom('lesson', cfg.lesson),
    unit:   _qlIsCustom('unit',   cfg.unit),
  };
  _quizLenCustomText = {
    lesson: _quizLenCustomMode.lesson ? String(cfg.lesson) : '',
    unit:   _quizLenCustomMode.unit   ? String(cfg.unit)   : '',
  };
}

function _qlChip(scope, label, value, active) {
  return '<button type="button" class="db-qlen-chip' + (active ? ' is-active' : '')
    + '" data-action="_dbSetQuizLen" data-arg="' + scope + '" data-arg2="' + value + '"'
    + (active ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + label + '</button>';
}

function _qlGroup(scope, title, defaultLabel, presets) {
  var draft = _quizLenDraft[scope];
  var custom = _quizLenCustomMode[scope];
  var chips = ''
    + _qlChip(scope, defaultLabel, 'default', !custom && draft === 'default');
  presets.forEach(function(p) {
    chips += _qlChip(scope, String(p), String(p), !custom && draft === p);
  });
  chips += _qlChip(scope, 'All', 'all', !custom && draft === 'all');
  chips += _qlChip(scope, 'Custom', 'custom', custom);

  var customVal = _quizLenCustomText[scope];
  var customBox = '<div class="db-qlen-custom" id="db-qlen-custombox-' + scope + '" style="'
    + (custom ? '' : 'display:none') + '">'
    + '<label class="db-qlen-custom-lbl" for="db-qlen-custom-' + scope + '">Custom amount</label>'
    + '<input type="number" min="1" step="1" inputmode="numeric" class="db-qlen-input" '
    + 'id="db-qlen-custom-' + scope + '" value="' + customVal + '" '
    + 'aria-describedby="db-qlen-msg-' + scope + '">'
    + '</div>';

  return '<div class="db-qlen-group">'
    + '<div class="db-qlen-title">' + title + '</div>'
    + '<div class="db-qlen-chips" role="group" aria-label="' + title + ' length">' + chips + '</div>'
    + customBox
    + '<div id="db-qlen-msg-' + scope + '" class="db-ctrl-msg db-qlen-msg"></div>'
    + '</div>';
}

// Inner body, re-rendered in place when a chip is clicked.
function _qlenInner() {
  return ''
    + _qlGroup('lesson', 'Lesson Quiz', 'Default (8)', _QLEN_PRESETS.lesson)
    + _qlGroup('unit',   'Unit Quiz',   'Default',     _QLEN_PRESETS.unit)
    + '<p class="db-qlen-help">Each quiz uses up to the selected amount. If that '
    + 'lesson or unit has fewer questions, it will use the available questions.</p>'
    + '<div class="db-ctrl-btns">'
    + '<button class="db-ctrl-save" data-action="_dbSaveQuizLen">Save Quiz Length</button>'
    + '</div>'
    + '<div id="db-qlen-save-msg" class="db-ctrl-msg"></div>';
}

function _renderQuizLengthSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">Quiz Length</h2>'
    + '<div id="db-qlen-root">' + _qlenInner() + '</div>'
    + '</section>';
}

function _reRenderQuizLengthSection() {
  var root = document.getElementById('db-qlen-root');
  if (root) root.innerHTML = _qlenInner();
}

function _setQlenMsg(scope, text, ok) {
  var el = document.getElementById('db-qlen-msg-' + scope);
  if (!el) return;
  el.style.color = ok ? '#2e7d32' : '#c62828';
  el.textContent = text || '';
}

// Chip click: update the draft / custom-mode for a scope, then re-render.
function _dbSetQuizLen(scope, value) {
  if (scope !== 'lesson' && scope !== 'unit') return;
  // Snapshot any live custom-input text first so an unsaved number in either
  // group survives the in-place re-render below.
  ['lesson', 'unit'].forEach(function(s) {
    var el = document.getElementById('db-qlen-custom-' + s);
    if (el) _quizLenCustomText[s] = el.value;
  });
  if (value === 'custom') {
    _quizLenCustomMode[scope] = true;
    if (_quizLenCustomText[scope] === '' && typeof _quizLenDraft[scope] === 'number') {
      _quizLenCustomText[scope] = String(_quizLenDraft[scope]);
    }
  } else if (value === 'default') {
    _quizLenCustomMode[scope] = false;
    _quizLenDraft[scope] = 'default';
  } else if (value === 'all') {
    _quizLenCustomMode[scope] = false;
    _quizLenDraft[scope] = 'all';
  } else {
    var n = parseInt(value, 10);
    _quizLenCustomMode[scope] = false;
    _quizLenDraft[scope] = (n >= 1) ? n : 'default';
  }
  _reRenderQuizLengthSection();
  if (_quizLenCustomMode[scope]) {
    var inp = document.getElementById('db-qlen-custom-' + scope);
    if (inp) inp.focus();
  }
}

// Live validation on blur of a custom input (does not save).
function _dbQuizLenCustomChanged(inp) {
  if (!inp || !inp.id) return;
  var scope = inp.id.replace('db-qlen-custom-', '');
  var raw = inp.value;
  _quizLenCustomText[scope] = raw;
  if (String(raw).trim() === '') { _setQlenMsg(scope, ''); return; }
  if (typeof isValidCustom === 'function' && !isValidCustom(raw)) {
    _setQlenMsg(scope, 'Enter a whole number of at least 1.');
  } else {
    _setQlenMsg(scope, '');
  }
}

// Save: validate any custom inputs, then persist per-student. Never stores
// "default" in place of an invalid custom number — it blocks the save instead.
function _dbSaveQuizLen() {
  var draft = { lesson: _quizLenDraft.lesson, unit: _quizLenDraft.unit };
  var ok = true;
  ['lesson', 'unit'].forEach(function(scope) {
    if (!_quizLenCustomMode[scope]) return;
    var inp = document.getElementById('db-qlen-custom-' + scope);
    var raw = inp ? inp.value : '';
    if (typeof isValidCustom === 'function' && isValidCustom(raw)) {
      draft[scope] = parseInt(String(raw).trim(), 10);
      _setQlenMsg(scope, '');
    } else {
      ok = false;
      _setQlenMsg(scope, 'Enter a whole number of at least 1.');
    }
  });
  var saveMsg = document.getElementById('db-qlen-save-msg');
  if (!ok) {
    if (saveMsg) { saveMsg.style.color = '#c62828'; saveMsg.textContent = 'Fix the custom amount above to save.'; }
    return;
  }
  if (typeof saveQuizLengths === 'function') saveQuizLengths(_activeId, draft);
  _quizLenDraft = draft;
  if (saveMsg) {
    saveMsg.style.color = '#2e7d32';
    saveMsg.textContent = 'Saved.';
    setTimeout(function() { if (saveMsg) saveMsg.textContent = ''; }, 2000);
  }
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
  // Removed from the product: this control never worked. It requested
  // notification permission, wrote wb_reminders, and told the parent
  // "will show at 15:30 when browser is open" -- but NOTHING anywhere reads
  // wb_reminders and no scheduler exists. It promised a daily reminder that
  // could never arrive.
  //
  // Returning '' unmounts the whole section, which also removes the permission
  // prompt and every write to the unused key, since _dbTogglePush is now
  // unreachable (and guards itself anyway). The dead code below goes in the
  // cleanup phase, once nothing references it.
  //
  // Reminders stay gone until a real notification system is deliberately built
  // -- natively, per the pivot's App Store direction.
  if (typeof isFeatureOn === 'function' && !isFeatureOn('REMINDERS')) return '';
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
  // Unreachable: _renderRemindersSection no longer mounts the toggle. Guarded
  // so the still-registered _dbTogglePush action cannot fire a notification
  // permission prompt for a feature that does not exist.
  if (typeof isFeatureOn === 'function' && !isFeatureOn('REMINDERS')) return;
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
    + '<h2 class="db-sec-h">🔒 Change Account Password</h2>'
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
    + '<li><strong>AI Progress Reports</strong> — Generate a detailed, personalised progress report for parents with one tap. The report covers overall accuracy, strengths, areas to work on, study habits, home activity suggestions, and a priority goal for the week. Available every 14 days.</li>'
    + '<li><strong>Balanced Final Test</strong> — A new final test mode that guarantees 5 questions from every unit, so no topic is skipped. Choose between the original Mastery test or the new Balanced test from the home screen.</li>'
    + '<li><strong>Premium Swipe Login</strong> — The login screen now has a smooth, finger-following swipe carousel to choose between Student and Parent sign-in — no more tap-only switching.</li>'
    + '<li><strong>Security Overhaul</strong> — PIN checking is now done entirely on the server with automatic lockout after failed attempts. Student quiz data is isolated per profile. All AI endpoints have rate limiting, input sanitization, and strict CORS.</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.34 — v5.27</div><ul class="list-body">'
    + '<li><strong>Glass UI</strong> — Complete visual overhaul with frosted-glass cards, transparent header, gradient buttons, and a new app icon across all screens.</li>'
    + '<li><strong>Dark Mode</strong> — Full dark mode support with auto-detection from system settings. Toggle manually in Settings → Appearance.</li>'
    + '<li><strong>Faster Loading</strong> — JavaScript split into a separate cacheable file — the main page loads 67% faster on repeat visits.</li>'
    + '<li><strong>Content Quality</strong> — 500+ answer-choice improvements across Units 2–8. "Carry/borrow" replaced with the correct term "regrouping" throughout. 19 spiral review questions added to connect earlier units to later ones.</li>'
    + '<li><strong>Pass Threshold</strong> — Unit quiz pass requirement lowered from 100% to 80% — more encouraging, still rigorous.</li>'
    + '<li><strong>Final Test Timer</strong> — Separate configurable timer for the Final Test. Tap the timer display to enter a custom time.</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.22 — v5.13</div><ul class="list-body">'
    + '<li><strong>Google Sign-In</strong> — Sign in with your Google account in one tap.</li>'
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

// ── Intervention Insights ─────────────────────────────────────────────────

// Parent-facing labels for every err_* tag used across K and Grade 1/2.
// _toTitleCase(tag.replace(/^err_/,'')) is the automatic fallback for unknowns.
var _ERR_LABEL_MAP = {
  // \u2500\u2500 Grade 1/2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_count_inclusive':       'Counted from wrong start',
  'err_off_by_one':            'Off by one',
  'err_wrong_operation':       'Used wrong operation (+/\u2212)',
  'err_forgot_carry':          'Forgot to carry',
  'err_forgot_borrow':         'Forgot to borrow',
  'err_no_regroup':            'Forgot to regroup',
  'err_place_value_confusion': 'Place value mix-up',
  'err_skip_count_error':      'Skip-count mistake',
  'err_double_count':          'Counted same thing twice',
  'err_magnitude_error':       'Answer size was off',
  'err_inverse_confusion':     'Add vs. subtract direction',

  // \u2500\u2500 K: Counting \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_under_count':           'Counted too few',
  'err_over_count':            'Counted too many',
  'err_count_all':             'Counted each one (no shortcut)',
  'err_teen':                  'Mixed up teen numbers',
  'err_subitize':              'Needed to count one by one',

  // \u2500\u2500 K: Comparison \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_more':                  'Chose more instead of less',
  'err_less':                  'Chose less instead of more',
  'err_same':                  'Said same when different',
  'err_not_equal':             'Said not equal when equal',
  'err_equal_confusion':       'Thought amounts were equal',

  // \u2500\u2500 K: Operations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_sub_instead':           'Subtracted instead of added',
  'err_add_instead':           'Added instead of subtracted',
  'err_keep_start':            'Used starting number as answer',
  'err_keep_total':            'Kept total instead of separating',
  'err_double_left':           'Doubled the first number',
  'err_double_right':          'Doubled the second number',

  // \u2500\u2500 K: Geometry \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_shape_confuse':         'Mixed up shape names',
  'err_shape_orient':          'Confused by shape rotation',
  'err_shape_sort':            'Sorted shapes incorrectly',
  'err_corner_count':          'Wrong corner count',
  'err_2d_3d_confuse':         'Flat vs. solid mix-up',
  'err_wrong_solid':           'Named wrong solid shape',
  'err_size_distractor':       'Distracted by size',
  'err_color_distractor':      'Confused by color',
  'err_visual_confusion':      'Visual mix-up',

  // \u2500\u2500 K: Measurement \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_size_confuse':          'Judged by size, not measurement',
  'err_size_confusion':        'Chose wrong size',
  'err_length_confuse':        'Length vs. height mix-up',
  'err_longer_shorter':        'Longer vs. shorter mix-up',
  'err_heavier_lighter':       'Heavier vs. lighter mix-up',
  'err_weight_confuse':        'Weight mix-up',
  'err_capacity_confuse':      'Which holds more \u2014 mix-up',

  // \u2500\u2500 K: Data Analysis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_wrong_category':        'Wrong group or category',
  'err_whole':                 'Chose total instead of one group',

  // \u2500\u2500 K: Money & Financial Literacy \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_coin_confusion':        'Mixed up coin names',
  'err_wrong_coin':            'Named the wrong coin',
  'err_confuses_want_need':    'Want vs. need mix-up',
  'err_picks_want_as_need':    'Chose a want as a need',
  'err_picks_need_as_want':    'Chose a need as a want',
  'err_not_income':            'Missed the income source',
  'err_confuses_gift_income':  'Gift vs. earned money mix-up',

  // \u2500\u2500 General \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_confused':              'General mix-up',
};

// One-sentence parent guidance shown as a help tip below the mistake label.
var _ERR_HELP_MAP = {
  // \u2500\u2500 Grade 1/2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_count_inclusive':       'When counting up, start from the next number \u2014 not the number itself.',
  'err_off_by_one':            'Use objects: one finger touch per count, stop on the very last one.',
  'err_wrong_operation':       'Read the question aloud \u2014 "altogether" means add; "left over" means subtract.',
  'err_forgot_carry':          'Try graph paper with one digit per box so carrying is easier to track.',
  'err_forgot_borrow':         'Stack the numbers and circle the column you are borrowing from before starting.',
  'err_no_regroup':            'Write out each step \u2014 show them to circle the tens and carry that amount over.',
  'err_place_value_confusion': 'Use physical tens-rods and ones-cubes so each digit has a visible value.',
  'err_skip_count_error':      'Chant the skip-count sequence together daily; clap on each number.',
  'err_double_count':          'After counting an object, push it aside so it cannot be counted again.',
  'err_magnitude_error':       'Ask first: "Should the answer be bigger or smaller than what we started with?"',
  'err_inverse_confusion':     'Draw a number line: adding slides right, subtracting slides left.',

  // \u2500\u2500 K: Counting \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_under_count':  'Slow the count down \u2014 touch each object once and say the number out loud.',
  'err_over_count':   'Stop counting the moment you run out of objects to touch.',
  'err_count_all':    'Show a group of 2 or 3 dots briefly and ask how many \u2014 practice without counting.',
  'err_teen':         'Use a number chart together \u2014 point to each teen number and say it aloud.',
  'err_subitize':     'Flash dot cards (1 to 5 dots) quickly; practice naming the group without counting.',

  // \u2500\u2500 K: Comparison \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_more':             'Reread the question \u2014 look for the word "fewer" or "less" to know the direction.',
  'err_less':             'Reread the question \u2014 look for the word "more" to know the direction.',
  'err_same':             'Line two groups side by side and count each \u2014 do the totals match?',
  'err_not_equal':        'Count both groups together; if the counts match, they are equal.',
  'err_equal_confusion':  'Put two groups side by side; count each and compare the totals out loud.',

  // \u2500\u2500 K: Operations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_sub_instead':  'The + sign means getting more \u2014 act it out by adding objects to a pile.',
  'err_add_instead':  'The minus sign means taking away \u2014 physically remove objects from a group.',
  'err_keep_start':   'Start at the first number and count on \u2014 use fingers for the second number.',
  'err_keep_total':   'Use objects: put the total in a pile, then take out the part you know.',
  'err_double_left':  'Put two separate groups on the table \u2014 make sure they are different amounts.',
  'err_double_right': 'Put two separate groups on the table \u2014 make sure they are different amounts.',

  // \u2500\u2500 K: Geometry \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_shape_confuse':    'Count corners together: triangle = 3, square = 4, rectangle = 4, circle = 0.',
  'err_shape_orient':     'A triangle upside down is still a triangle \u2014 its name comes from its corners.',
  'err_shape_sort':       'Sort shapes into two piles: "curved sides" and "straight sides."',
  'err_corner_count':     'Trace each corner with a finger and tap the table once per corner.',
  'err_2d_3d_confuse':    'Flat shapes can be drawn on paper; solid shapes can be picked up and rolled.',
  'err_wrong_solid':      'Hold real solid shapes and name each one by touching its faces and edges.',
  'err_size_distractor':  'Shape names do not change by size \u2014 a tiny triangle and a huge one are both triangles.',
  'err_color_distractor': 'Shape names do not change by color \u2014 a red square is still a square.',
  'err_visual_confusion': 'Focus on the key feature: flat or curved sides, and how many corners.',

  // \u2500\u2500 K: Measurement \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_size_confuse':     'Focus only on the attribute asked (length, weight) \u2014 ignore other differences.',
  'err_size_confusion':   'Bigger does not always mean heavier \u2014 focus on the attribute being measured.',
  'err_length_confuse':   'Length goes side to side; height goes up and down \u2014 use a ruler to show both.',
  'err_longer_shorter':   'Line objects up at one end; which sticks out further is longer.',
  'err_heavier_lighter':  'Hold one object in each hand and feel which pulls down more.',
  'err_weight_confuse':   'Hold one object in each hand and feel which pulls down more.',
  'err_capacity_confuse': 'Pour water into two containers \u2014 which one overflows first holds less.',

  // \u2500\u2500 K: Data \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_wrong_category':  'Point to the label of each column or group and read it together out loud.',
  'err_whole':           'Find the bar for just one category \u2014 do not add all groups together.',

  // \u2500\u2500 K: Money \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_coin_confusion':      'Sort real coins; say name and value: penny 1c, nickel 5c, dime 10c, quarter 25c.',
  'err_wrong_coin':          'Make a coin chart: penny = small copper, nickel = big silver, dime = small silver.',
  'err_confuses_want_need':  'Needs are things to survive (food, shelter); wants are extras we enjoy.',
  'err_picks_want_as_need':  'Ask: "Could you stay healthy without this?" If yes, it is probably a want.',
  'err_picks_need_as_want':  'Ask: "Do you need this to stay safe and healthy?" If yes, it is a need.',
  'err_not_income':          'Income is money earned by working \u2014 ask "is someone being paid for a job here?"',
  'err_confuses_gift_income': 'A gift is given freely; income is earned by working.',

  // \u2500\u2500 General \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  'err_confused': 'Work through one example together with real objects before trying on screen.',
};

// Return a parent-facing label for an err_* tag, or null if not in the map.
// Callers fall back to: _toTitleCase(tag.replace(/^err_/, ''))
function _friendlyInterventionTag(tag) {
  return _ERR_LABEL_MAP[tag] || null;
}

function _getInterventionEvents() {
  try {
    var raw = localStorage.getItem('mmr_intervention_events_v1');
    var parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

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

// ── Phase 1 Learning Insights: grade-filter helpers + builder ────────────
// This file IS the test surface: tests/dashboard.test.js loads it through
// tests/dashboard-harness.js, which evaluates the real bundle slice. The
// standalone dashboard/dashboard.js copy is not deployed and no longer backs
// any test; it is pending removal and must not be treated as authoritative.

// Infer the grade band of a single intervention event.
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
    if (/^(lq_)?g3/.test(t)) return 'g3';
    if (/^(lq_)?(ku|k\d)/.test(t)) return 'k';
    if (/^(lq_)?u\d/.test(t)) return 'g2';
  }
  return 'legacy_unknown';
}

function _filterInterventionsByGrade(events, viewBand) {
  if (!Array.isArray(events)) return [];
  var band = _gradeBand(viewBand);
  if (!band) return [];
  return events.filter(function(e) {
    return _inferInterventionGrade(e) === band;
  });
}

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
// grade-filtered) scores into an { errorType: count } map compatible with
// the Common Mistakes pipeline. Answers without errTag (legacy) or with
// errTag === null (correct answers, by convention) are ignored.
// ── Phase 2C: intervention_events.grade column helpers ──────────────────
// Pure builder used by _syncPendingInterventionEvents to construct the upsert
// row sent to Supabase. Mirrors dashboard/dashboard.js — see the standalone
// copy for the canonical version + test coverage.
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

// Phase 3A: Bucket per-answer accuracy by difficulty level. Input is
// assumed already-grade-filtered. Untagged or unrecognized difficulty
// values are skipped (NOT bucketed to medium). Pre-Phase-3A scores have
// no difficulty field and are tolerated as legacy.
function _aggregateDifficultyPerformance(scores) {
  var result = {
    easy:   { correct: 0, total: 0, accuracy: 0 },
    medium: { correct: 0, total: 0, accuracy: 0 },
    hard:   { correct: 0, total: 0, accuracy: 0 }
  };
  if (!Array.isArray(scores)) return result;
  scores.forEach(function(s) {
    if (!s || !Array.isArray(s.answers)) return;
    s.answers.forEach(function(a) {
      if (!a) return;
      var d = a.difficulty;
      if (d !== 'easy' && d !== 'medium' && d !== 'hard') return;
      result[d].total += 1;
      if (a.ok) result[d].correct += 1;
    });
  });
  ['easy', 'medium', 'hard'].forEach(function(k) {
    result[k].accuracy = result[k].total > 0
      ? result[k].correct / result[k].total
      : 0;
  });
  return result;
}

// Phase 3A: Cluster per-answer accuracy by (lessonId, difficulty). lessonId
// is extracted from score.qid via a flexible regex matching k/g1/g2 + uN-lM.
// Scores whose qid doesn't match (Unit Tests, Free Mode, legacy short qids)
// are skipped — the helper returns no entry for them.
function _aggregateDifficultyByLesson(scores) {
  var result = {};
  if (!Array.isArray(scores)) return result;
  var rx = /(k|g1|g2)u\d+-l\d+/i;
  scores.forEach(function(s) {
    if (!s || !s.qid || !Array.isArray(s.answers)) return;
    var m = String(s.qid).match(rx);
    if (!m) return;
    var lessonId = m[0].toLowerCase();
    if (!result[lessonId]) {
      result[lessonId] = {
        easy:   { correct: 0, total: 0, accuracy: 0 },
        medium: { correct: 0, total: 0, accuracy: 0 },
        hard:   { correct: 0, total: 0, accuracy: 0 }
      };
    }
    s.answers.forEach(function(a) {
      if (!a) return;
      var d = a.difficulty;
      if (d !== 'easy' && d !== 'medium' && d !== 'hard') return;
      result[lessonId][d].total += 1;
      if (a.ok) result[lessonId][d].correct += 1;
    });
  });
  Object.keys(result).forEach(function(lid) {
    ['easy', 'medium', 'hard'].forEach(function(k) {
      result[lid][k].accuracy = result[lid][k].total > 0
        ? result[lid][k].correct / result[lid][k].total
        : 0;
    });
  });
  return result;
}

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
  DIFF_MIN_TOTAL:           6,
  DIFF_MIN_PER_LEVEL:       3,
  DIFF_HARD_STRUGGLE_PCT:   0.60,
  DIFF_FOUNDATION_PCT:      0.70,
  DIFF_READY_PCT:           0.80,
  DIFF_READY_HARD_PCT:      0.70,
  DIFF_LESSON_CLUSTER_MIN:  3,
};

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

  var tagStats = Object.keys(mastery).map(function(tag) {
    var m = mastery[tag] || {};
    var attempts = m.attempts || 0;
    var correct  = m.correct  || 0;
    return {
      tag: tag, attempts: attempts, correct: correct,
      accuracy: attempts > 0 ? (correct / attempts) : 0,
    };
  });
  var weakTags = tagStats
    .filter(function(t) {
      return t.attempts >= _LI_THRESH.WEAK_MIN_ATTEMPTS
        && t.accuracy <  _LI_THRESH.WEAK_MAX_ACCURACY;
    })
    .sort(function(a, b) { return a.accuracy - b.accuracy; });

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
        tag: t.tag, label: label, accuracy: accuracyPct, attempts: t.attempts,
        lessonId: lessonId, lessonName: lessonName, unitName: unitName,
        why: why, recommendation: recommendation,
      };
    });

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

  var strengths = tagStats
    .filter(function(t) {
      return t.attempts  >= _LI_THRESH.STRONG_MIN_ATTEMPTS
        && t.accuracy >= _LI_THRESH.STRONG_MIN_ACCURACY;
    })
    .sort(function(a, b) { return b.accuracy - a.accuracy; })
    .slice(0, _LI_THRESH.STRENGTHS_LIMIT)
    .map(function(t) {
      return { tag: t.tag, label: tagLabel(t.tag),
               accuracy: Math.round(t.accuracy * 100), attempts: t.attempts };
    });

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
    var rState;
    if      (summary.recoveryRate >= 70) rState = 'good';
    else if (summary.recoveryRate >= 40) rState = 'ok';
    else                                 rState = 'needs-attention';
    return {
      state: rState, overallPct: summary.recoveryRate, total: summary.total,
      topTag: topTag,
      topTagLabel: topTag ? (errLabels[topTag] || errLabel(topTag)) : null,
      topTagPct: topTagPct,
    };
  })();

  var completedScores = scores.filter(function(s) { return s.pct != null && s.total > 0; });
  var totalQuestions = completedScores.reduce(function(a, s) { return a + (s.total || 0); }, 0);
  var overallAccuracy = completedScores.length > 0
    ? Math.round(completedScores.reduce(function(a, s) { return a + s.pct; }, 0) / completedScores.length)
    : 0;

  var nextStep;
  if (!hasAnyData || totalQuestions < 3) {
    nextStep = { kind: 'not-enough-data',
      label: 'Try a 5-question quiz to unlock insights.',
      why:   'A few more answers are needed before we can spot patterns.' };
  } else if (needsPractice.length > 0 && needsPractice[0].lessonName) {
    nextStep = { kind: 'lesson',
      lessonId:   needsPractice[0].lessonId,
      lessonName: needsPractice[0].lessonName,
      unitName:   needsPractice[0].unitName,
      skillLabel: needsPractice[0].label,
      label:      'Try ' + needsPractice[0].lessonName + ' again.',
      why:        needsPractice[0].why };
  } else if (needsPractice.length > 0) {
    nextStep = { kind: 'practice-skill',
      skillLabel: needsPractice[0].label,
      label:      'Spend a few minutes practicing ' + needsPractice[0].label + '.',
      why:        needsPractice[0].why };
  } else if (overallAccuracy >= 80 || strengths.length > 0) {
    nextStep = { kind: 'keep-going',
      label: 'Keep going — no major weak area yet.',
      why:   'Recent accuracy is ' + overallAccuracy + '% across ' + completedScores.length
              + ' quiz' + (completedScores.length !== 1 ? 'zes' : '') + '.' };
  } else {
    nextStep = { kind: 'practice-skill',
      label: 'Try one more quiz to build the streak.',
      why:   totalQuestions + ' question' + (totalQuestions !== 1 ? 's' : '') + ' answered so far.' };
  }

  var parentAction;
  if (!hasAnyData || totalQuestions < 3) {
    parentAction = { label: 'Try a 5-question quiz on any lesson.',
                     why:   'A few more answers will unlock skill-specific insights.' };
  } else if (commonMistakes.length > 0 && commonMistakes[0].helpText) {
    parentAction = { label: commonMistakes[0].helpText,
                     why:   'Most common mistake: ' + commonMistakes[0].label
                             + ' (' + commonMistakes[0].count + ' time'
                             + (commonMistakes[0].count !== 1 ? 's' : '') + ').' };
  } else if (needsPractice.length > 0 && needsPractice[0].lessonName) {
    parentAction = { label: 'Practice ' + needsPractice[0].lessonName + ' together.',
                     why:   needsPractice[0].why };
  } else if (needsPractice.length > 0) {
    parentAction = { label: 'Spend a few minutes on ' + needsPractice[0].label + ' this week.',
                     why:   needsPractice[0].why };
  } else if (strengths.length > 0) {
    parentAction = { label: 'Celebrate progress on ' + strengths[0].label + ' and try the next lesson.',
                     why:   strengths[0].label + ' is at ' + strengths[0].accuracy + '% across '
                             + strengths[0].attempts + ' attempts.' };
  } else {
    parentAction = { label: 'Try one more lesson quiz this week.',
                     why:   'Steady practice unlocks better insights.' };
  }

  // ── Difficulty Breakdown (Phase 3A) ─────────────────────────────────────
  var diffPerf = _aggregateDifficultyPerformance(scores);
  var diffByLesson = _aggregateDifficultyByLesson(scores);
  var diffTotal = diffPerf.easy.total + diffPerf.medium.total + diffPerf.hard.total;
  var diffState;
  if (diffTotal < _LI_THRESH.DIFF_MIN_TOTAL) {
    diffState = 'not-enough-data';
  } else {
    var hasEasy   = diffPerf.easy.total   >= _LI_THRESH.DIFF_MIN_PER_LEVEL;
    var hasMedium = diffPerf.medium.total >= _LI_THRESH.DIFF_MIN_PER_LEVEL;
    var hasHard   = diffPerf.hard.total   >= _LI_THRESH.DIFF_MIN_PER_LEVEL;
    if (!hasEasy && !hasMedium && !hasHard) {
      diffState = 'not-enough-data';
    } else if (hasHard && diffPerf.hard.accuracy < _LI_THRESH.DIFF_HARD_STRUGGLE_PCT) {
      diffState = 'hard-struggle';
    } else if (hasEasy && diffPerf.easy.accuracy < _LI_THRESH.DIFF_FOUNDATION_PCT) {
      diffState = 'foundation-review';
    } else if (hasEasy && hasMedium
               && diffPerf.easy.accuracy   >= _LI_THRESH.DIFF_READY_PCT
               && diffPerf.medium.accuracy >= _LI_THRESH.DIFF_READY_PCT
               && (!hasHard || diffPerf.hard.accuracy >= _LI_THRESH.DIFF_READY_HARD_PCT)) {
      diffState = 'ready-for-challenge';
    } else {
      diffState = 'balanced-progress';
    }
  }
  var topCluster = null;
  var bestHardWrong = 0;
  Object.keys(diffByLesson).forEach(function(lid) {
    var hw = diffByLesson[lid].hard.total - diffByLesson[lid].hard.correct;
    if (hw >= _LI_THRESH.DIFF_LESSON_CLUSTER_MIN && hw > bestHardWrong) {
      bestHardWrong = hw;
      topCluster = { lessonId: lid, hardWrong: hw };
    }
  });
  var difficultyBreakdown = {
    state:      diffState,
    perf:       diffPerf,
    byLesson:   diffByLesson,
    topCluster: topCluster,
  };

  return {
    viewBand: viewBand, studentName: studentName, hasAnyData: hasAnyData,
    overallAccuracy: overallAccuracy, totalQuestions: totalQuestions,
    needsPractice: needsPractice, commonMistakes: commonMistakes,
    strengths: strengths, trend: trend, nextStep: nextStep,
    interventionRecovery: interventionRecovery, parentAction: parentAction,
    difficultyBreakdown: difficultyBreakdown,
  };
}

// Phase 1 Learning Insights renderer. Takes the structured output of
// buildLearningInsights and turns it into a card-grid HTML body wrapped in
// the standard _dbSection('insights', ...) for collapse-state continuity.
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

  // Empty state
  if (!insights.hasAnyData) {
    var emptyBody = '<p style="margin:0;color:#546e7a;font-size:.85rem">Not enough data yet to spot patterns for this grade.</p>'
      + '<p style="margin:8px 0 0;font-size:.85rem"><strong>Try this:</strong> ' + _esc(insights.parentAction.label) + '</p>';
    return _dbSection('insights', '&#x1F9E0; Learning Insights' + gradeChip, emptyBody);
  }

  var sections = [];

  // A. Needs Practice
  if (insights.needsPractice.length) {
    var npRows = insights.needsPractice.map(function(np) {
      return '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #eceff1">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-weight:600;color:#263238">' + _esc(np.label) + '</span>'
        + '<span style="color:#c62828;font-weight:700">' + np.accuracy + '%</span>'
        + '</div>'
        + subLine(_esc(np.why))
        + (np.lessonName ? subLine('<strong>Try:</strong> ' + _esc(np.recommendation)) : '')
        + '</div>';
    }).join('');
    sections.push(card('li-needs-practice',
      '&#x1F4DD; Needs Practice',
      npRows.replace(/^<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #eceff1">/, '<div>')));
  }

  // B. Common Mistakes
  if (insights.commonMistakes.length) {
    var cmRows = insights.commonMistakes.map(function(cm, idx) {
      var sep = idx === 0 ? '' : 'border-top:1px dashed #eceff1;padding-top:6px;margin-top:6px;';
      // Phase 2B: surface "Most common in [Unit X Lesson Y: Title]" when the
      // lesson resolver returned both a band-matching lessonId and a name.
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

  // C. Strengths
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

  // D. Trend
  var trendBadge, trendText, trendColor;
  switch (insights.trend.state) {
    case 'improving':       trendBadge = '&#x2191; Improving'; trendText = 'Recent answers are getting more right.';   trendColor = '#2e7d32'; break;
    case 'declining':       trendBadge = '&#x2193; Needs attention'; trendText = 'Recent answers show more misses.';    trendColor = '#c62828'; break;
    case 'steady':          trendBadge = '&#x2192; Steady';    trendText = 'Accuracy is holding steady.';              trendColor = '#1565c0'; break;
    default:                trendBadge = 'Not enough data yet'; trendText = 'A few more quizzes will unlock the trend.'; trendColor = '#90a4ae';
  }
  sections.push(card('li-trend', '&#x1F4C8; Trend',
    '<div><span style="display:inline-block;padding:3px 8px;border-radius:999px;background:' + trendColor + '15;color:' + trendColor + ';font-weight:700;font-size:.78rem">'
    + trendBadge + '</span></div>' + subLine(_esc(trendText))));

  // D2. Difficulty Breakdown (Phase 3A)
  var diff = insights.difficultyBreakdown;
  if (diff && diff.state !== 'not-enough-data') {
    var diffCopyMap = {
      'hard-struggle':       'Strong foundation; hard questions need practice.',
      'foundation-review':   'Easier review first will help build confidence.',
      'ready-for-challenge': 'Ready for more challenge: easy and medium are strong.',
      'balanced-progress':   'Balanced progress across difficulty levels.'
    };
    var diffRow = function(label, bucket, color) {
      var pct = bucket.total > 0 ? Math.round(bucket.accuracy * 100) : null;
      var barW = pct == null ? 0 : pct;
      var rightLabel = bucket.total > 0
        ? (pct + '% (' + bucket.correct + '/' + bucket.total + ')')
        : '&mdash;';
      return '<div style="display:grid;grid-template-columns:60px 1fr 90px;gap:8px;align-items:center;margin:4px 0">'
        + '<div style="font-size:.82rem;color:#546e7a">' + label + '</div>'
        + '<div style="height:8px;border-radius:999px;background:#eceff1;overflow:hidden">'
        +   '<div style="height:100%;width:' + barW + '%;background:' + color + '"></div>'
        + '</div>'
        + '<div style="font-size:.78rem;color:#546e7a;text-align:right">' + rightLabel + '</div>'
        + '</div>';
    };
    var diffBars = diffRow('Easy',   diff.perf.easy,   '#2e7d32')
                 + diffRow('Medium', diff.perf.medium, '#f9a825')
                 + diffRow('Hard',   diff.perf.hard,   '#c62828');
    var diffCopy = diffCopyMap[diff.state] || '';
    var clusterLine = '';
    if (diff.topCluster && diff.topCluster.lessonId) {
      var clusterName = (typeof _lessonDisplayName === 'function')
        ? _lessonDisplayName(diff.topCluster.lessonId)
        : diff.topCluster.lessonId;
      // _lessonDisplayName returns { unit, lesson } when known, else null.
      var clusterText = clusterName && clusterName.lesson
        ? ((clusterName.unit ? clusterName.unit + ': ' : '') + clusterName.lesson)
        : String(diff.topCluster.lessonId);
      clusterLine = subLine('&#x1F4CD; Most common in ' + _esc(clusterText));
    }
    sections.push(card('li-difficulty', '&#x1F3AF; Difficulty Breakdown',
      diffBars
      + '<div style="margin-top:8px;color:#263238;font-size:.88rem">' + _esc(diffCopy) + '</div>'
      + clusterLine));
  }

  // E. Recommended Next Step
  sections.push(card('li-next-step', '&#x1F3AF; Recommended Next Step',
    '<div style="font-weight:700;color:#263238;font-size:.92rem">' + _esc(insights.nextStep.label) + '</div>'
    + subLine(_esc(insights.nextStep.why))));

  // F. Intervention Recovery
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

  // G. Parent Action
  sections.push(card('li-parent-action', '&#x1F44B; Parent Action',
    '<div style="font-weight:700;color:#263238;font-size:.92rem">' + _esc(insights.parentAction.label) + '</div>'
    + subLine(_esc(insights.parentAction.why))));

  var body = '<button class="db-info-btn" tabindex="0" aria-label="About Learning Insights"'
    + ' data-tip="Insights below reflect only the selected grade. Cards appear when there is enough recent activity to be useful.">ⓘ</button>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:6px">'
    + sections.join('') + '</div>';
  return _dbSection('insights', '&#x1F9E0; Learning Insights' + gradeChip, body);
}

// ── Insight engine helpers (also in dashboard/dashboard.js for testability) ─

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

// ── Parent Action Summary ─────────────────────────────────────────────────
function _renderParentActionSummary(stats, mastery, activityEvents, name, scores) {
  var insight = buildParentInsight({
    mastery:        mastery        || {},
    activityEvents: activityEvents || [],
    scores:         scores         || [],
    studentName:    name,
    tagLabels:      _TAG_LABEL_MAP,
    errLabels:      _ERR_LABEL_MAP,
    lessonNameFn:   _lessonDisplayName,
  });
  var tierColors = {
    'no-data':      '#607d8b',
    'needs-review': '#c62828',
    'developing':   '#e65100',
    'strong':       '#2e7d32',
  };
  var color = tierColors[insight.cssTier] || '#607d8b';
  var dasBody = '<div class="das-pill" style="background:' + color + '15;color:' + color
    + ';border:1px solid ' + color + '">' + _esc(insight.headline) + '</div>'
    + '<p class="das-summary">' + _esc(insight.summary) + '</p>'
    + '<p class="das-action"><strong>Action:</strong> ' + _esc(insight.actionLabel) + '</p>'
    + '<p class="das-why">' + _esc(insight.why) + '</p>';
  return _dbSection('action-summary', _esc(insight.headline), dasBody, true,
    'db-action-summary das-' + insight.cssTier);
}

// ── Profiles & Settings sections ──────────────────────────────────────────
function _renderThemeSection() {
  var stored = localStorage.getItem('wb_theme') || 'auto';
  function btn(mode, label) {
    var active = mode === 'auto' ? !localStorage.getItem('wb_theme') : stored === mode;
    return '<button id="db-theme-' + mode + '" class="db-theme-btn' + (active ? ' on' : '') + '"'
      + ' data-action="setDashboardTheme" data-arg="' + mode + '"'
      + ' aria-pressed="' + (active ? 'true' : 'false') + '">' + label + '</button>';
  }
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">&#x1F313; Appearance</h2>'
    + '<div class="db-theme-row">'
    + btn('light', '&#x2600;&#xFE0F; Light')
    + btn('dark',  '&#x1F319; Dark')
    + btn('auto',  '&#x1F4F1; Auto')
    + '</div>'
    + '</section>';
}

function _renderProfilesSection() {
  var body = _renderManageProfiles()
    + _renderUnlockSection()
    + _renderPasswordSection()
    + _renderDangerZoneSection();
  return _dbSection('profiles', '&#x1F465; Profiles &amp; Account', body, false);
}

function _renderSettingsSection() {
  var body = _renderThemeSection()
    + _renderTimerSection()
    + _renderQuizLengthSection()
    + _renderA11ySection()
    + _renderRemindersSection()
    + _renderFeedbackSection()
    + _renderChangelogSection();
  return _dbSection('settings', '&#x2699;&#xFE0F; Settings', body, false);
}

function renderDashboard() {
  var root = document.getElementById('db-root');
  if (!root) return;

  var student = _students[_activeId];
  if (!student) {
    root.innerHTML = '<p class="db-empty">No student data found.</p>';
    return;
  }

  // ── View-grade resolution ────────────────────────────────────────────────
  // The dashboard's view grade is a PURE FILTER. It is INDEPENDENT of the
  // student's profile.grade and the student-app's `mmr_grade` (the
  // learning-side active grade). Stored per active student in localStorage as
  // `mmr_dash_view_grade_<sid>`; initialized from `_dbResolveProfileGrade`
  // (profile.grade → local cache → mmr_grade → '2') on first view.
  //
  // Hard rule: this function MUST NOT write `mmr_grade`. Doing so would
  // overwrite the student's learning-side grade selection just by opening the
  // dashboard — exactly the bug v6.0.30 fixed. Helpers that need the current
  // view grade must read `_getDashboardViewGrade()` / `_activeDashboardUnitsMeta()`
  // directly (both already wired to consult the view-band, never `mmr_grade`).
  var viewBand = _getDashboardViewGrade();                       // 'k'|'g1'|'g2'

  // ── Score & activity filtering — grade-specific ─────────────────────────
  // Filter every grade-specific section by inferring each score's grade from
  // either a direct `grade` field (new) or qid/sourceLessonId prefix (legacy).
  // Records that cannot be confidently inferred ('legacy_unknown') are
  // excluded from all grade-specific stats per spec.
  var allScores = student.SCORES || [];
  var scores = allScores.filter(function(s) { return _inferScoreGrade(s) === viewBand; });
  _unlockScores = scores;
  // Filter activity events to the active grade (existing logic — events
  // already carry a `grade` field). Unknown-grade events are kept for
  // backwards compatibility with the activity-event log.
  var activityEvents = (student.ACTIVITY || []).filter(function(e) {
    if (!e) return false;
    if (e.grade == null) return true;
    var eb = _gradeBand(e.grade);
    return eb === viewBand;
  });
  _activityEvents = activityEvents;
  // Mastery: student.MASTERY is global (not grade-scoped on the dashboard
  // side). For the Learning Insights section we derive a grade-scoped
  // mastery from the grade-filtered activity events. The legacy unscoped
  // mastery is still passed to existing renderers (Practice Plan etc.) for
  // backwards compat — Phase 2 will retire those.
  var rawMastery     = student.MASTERY || {};
  var gradeMastery   = _deriveMasteryFromActivity(activityEvents);
  // Use the derived mastery when it has signal; otherwise fall back to the
  // unscoped mastery so the legacy renderers still find tags.
  var mastery        = Object.keys(gradeMastery).length ? gradeMastery : rawMastery;
  var streak        = student.STREAK   || { current: 0 };
  var appTime       = student.APP_TIME || { totalSecs: 0, sessions: 0, dailySecs: {} };

  // Build qTextMap for review queue
  var qTextMap = {};
  scores.forEach(function(s) {
    if (s.answers) s.answers.forEach(function(a) {
      if (a.t && !qTextMap['_' + a.t.length]) qTextMap['_' + a.t.length] = a.t;
    });
  });

  // Grade-appropriate unit names for skill labelling. Driven by the dashboard
  // view-band (not mmr_grade) so the labels match the grade the parent is
  // managing without depending on the student-app's active grade.
  var _activeUnitNames = (viewBand === 'k')
    ? (_K_UNITS_META || []).map(function(u) { return u.name; })
    : (viewBand === 'g1')
      ? (_G1_UNITS_META || []).map(function(u) { return u.name; })
      : _unitNames();

  var stats    = _computeOverallStats(scores, streak, appTime);
  var skills   = _computeSkillBreakdown(scores, _activeUnitNames);
  var weak     = _computeWeakAreas(skills);
  var activity = _computeActivityData(scores, 7);
  var review   = _computeReviewQueue(mastery, qTextMap);
  // Prefer Supabase-fetched events (cross-device); fall back to localStorage.
  // Then filter the result to the dashboard's view-band so Learning Insights
  // never mixes grades. legacy_unknown events are dropped by the filter.
  var allInterventionEvents = _remoteInterventionEvents !== null
    ? _remoteInterventionEvents
    : _getInterventionEvents();
  var interventionEvents = _filterInterventionsByGrade(allInterventionEvents, viewBand);
  // Phase 2B: kick off the static index fetch on first render. Subsequent
  // renders see a populated _tagLessonIndex and use it for fallback lesson
  // resolution. Initial render is fast; the index arrives within a tick and
  // re-renders.
  if (_tagLessonIndex === null && !_tagLessonIndexLoading) _loadTagLessonIndex();

  // Build the Phase 1 Learning Insights bundle from already-grade-filtered
  // data only. The mastery passed here is the grade-derived dict (see above).
  var learningInsights = buildLearningInsights({
    viewBand:           viewBand,
    studentName:        student.name,
    scores:             scores,
    activityEvents:     activityEvents,
    interventionEvents: interventionEvents,
    mastery:            gradeMastery,
    tagLabels:          (typeof _TAG_LABEL_MAP !== 'undefined') ? _TAG_LABEL_MAP : {},
    errLabels:          _ERR_LABEL_MAP,
    errHelpMap:         _ERR_HELP_MAP,
    lessonNameFn:       (typeof _lessonDisplayName === 'function') ? _lessonDisplayName : function(){ return null; },
    tagLessonIndex:     _tagLessonIndex,
  });

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

  // Phase 2: parent-actionable content first; admin/settings collapsed
  // into a closed-by-default Settings & Management accordion at the bottom.
  // _renderManageProfiles() now lives inside _renderSettingsAccordion().
  root.innerHTML =
    _renderStudentSelector(_students, _activeId) +
    '<h1 class="db-student-name">' + _esc(student.name) + '</h1>' +
    '<div class="db-grade-context" style="margin:2px 0 16px;display:flex;align-items:center;gap:8px;font-size:.85rem;color:#37474f">'
    + '<label for="db-view-grade-select" style="margin:0">Viewing:</label>'
    + '<select id="db-view-grade-select" class="db-view-grade-select" data-action="_setDashboardViewGrade"'
    + ' style="font-family:inherit;font-size:.9rem;padding:4px 8px;border:1px solid #cfd8dc;border-radius:6px;background:#fff;cursor:pointer">'
    +   _dbViewGradeOptions(viewBand)
    + '</select>'
    + '<span style="color:#90a4ae;font-size:.75rem">(view filter only &mdash; does not change student\'s enrollment)</span>'
    + '</div>' +
    _renderParentActionSummary(stats, mastery, activityEvents, student.name, scores) +
    _renderPracticePlan(mastery, activityEvents, weak, review) +
    _renderLearningInsightsV2(learningInsights) +
    _renderUnitProgressMap(scores, activityEvents) +
    _renderRecentQuizzes(scores) +
    _renderActivitySnapshot(stats, scores, appTime, activity, streak, activityEvents) +
    _renderProfilesSection() +
    _renderSettingsSection();

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
  _remoteInterventionEvents = null;
  // If this is a managed profile whose scores haven't loaded yet, fetch them now
  if (id !== 'local' && _students[id] && !_students[id]._scoresLoaded) {
    _loadManagedStudentScores(id);
  }
  _loadQuizLenSettings(id);
  Promise.all([
    _loadUnlockSettings(id),
    _loadTimerSettings(id),
    _loadA11ySettings(id),
  ]).then(function() {
    renderDashboard();
    if (id !== 'local') _loadRemoteInterventionData(id);
  });
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
  if (typeof _lsInitCarousel === 'function') { _lsInitCarousel(); _lsCarouselGo(0); }
}

// ── Managed-profile helpers ──────────────────────────────────────────────
// Pure mappers from a `student_profiles` row (as returned by
// _fetchManagedProfiles' .select(…)) into the STREAK and ACT_DATES shapes
// the parent dashboard's per-student _students[id] cache expects. Before
// this, _fetchManagedProfiles omitted the streak/act-dates columns and
// _students[id].STREAK was hard-coded to {0,0,null} forever, so the
// parent Activity Snapshot always showed "0 days" current streak for
// every managed student regardless of real progress.
function _dbBuildStudentStreak(profile) {
  var p = (profile && typeof profile === 'object') ? profile : {};
  return {
    current:  (typeof p.streak_current === 'number' && p.streak_current >= 0) ? p.streak_current : 0,
    longest:  (typeof p.streak_longest === 'number' && p.streak_longest >= 0) ? p.streak_longest : 0,
    lastDate: (typeof p.streak_last_date === 'string' && p.streak_last_date !== '') ? p.streak_last_date : null,
  };
}

function _dbBuildStudentActDates(profile) {
  var p = (profile && typeof profile === 'object') ? profile : {};
  if (!Array.isArray(p.act_dates_json)) return [];
  return p.act_dates_json.filter(function(d) {
    return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  });
}

// ── Manage Profiles ───────────────────────────────────────────────────────

async function _fetchManagedProfiles() {
  if (typeof _supa === 'undefined' || !_supa) return;
  try {
    var result = await Promise.race([
      _supa
        .from('student_profiles')
        .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, username, updated_at, report_last_generated, report_last_text, grade, streak_current, streak_longest, streak_last_date, act_dates_json')
        .order('created_at', { ascending: true }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;
    _managedProfiles = result.data || [];
    // Mirror Supabase grade into the per-profile local cache so the
    // grade resolver and student-side reads work without re-fetching.
    _managedProfiles.forEach(function(p) {
      if (p && p.id && p.grade) _dbWriteProfileGrade(p.id, p.grade);
    });
    localStorage.setItem('mmr_family_profiles',
      JSON.stringify(_managedProfiles.map(function(p) {
        return { id: p.id, display_name: p.display_name, age: p.age,
          avatar_emoji: p.avatar_emoji, avatar_color_from: p.avatar_color_from,
          avatar_color_to: p.avatar_color_to, username: p.username, pin_hash: '',
          grade: p.grade || null };
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
    var gradeLabel = _dbGradeBadge(_dbResolveProfileGrade(p));
    var displayName = p.display_name || p.name || '';
    var avatarEmoji = p.avatar_emoji || (displayName ? displayName.charAt(0).toUpperCase() : '?');
    return '<div class="db-profile-row">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,' + _dbValidColor(p.avatar_color_from) + ',' + _dbValidColor(p.avatar_color_to) + ');display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">' + _esc(avatarEmoji) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-weight:700;font-size:.88rem;color:#263238">' + _esc(displayName) + (p.age ? ' <span style="font-weight:400;color:#90a4ae;font-size:.75rem">Age ' + _esc(String(p.age)) + '</span>' : '') + '</div>'
      + '<div style="font-size:.72rem;color:#90a4ae">' + _esc(gradeLabel) + ' &middot; Last active ' + _esc(lastActive) + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-shrink:0">'
      + '<button class="db-profile-edit-btn" data-action="openEditProfileSheet" data-arg="' + _esc(p.id) + '">Edit</button>'
      + '<button class="db-profile-pin-btn" data-action="openPinResetSheet" data-arg="' + _esc(p.id) + '">PIN</button>'
      + '</div>'
      + '</div>';
  }).join('');

  var familyCodeHtml = _parentFamilyCode
    ? '<div style="margin-bottom:10px;padding:8px 12px;background:#e8f5e9;border-radius:8px;font-size:.8rem;color:#2e7d32;display:flex;flex-wrap:wrap;align-items:center;gap:8px">'
      + '<span>&#x1F511; <strong>Family Code:</strong> <span id="db-family-code-display" style="font-family:monospace;letter-spacing:1px">' + _esc(_parentFamilyCode) + '</span></span>'
      + '<button type="button" data-action="_dbCopyFamilyCode" aria-label="Copy family code digits" style="background:#43a047;color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:.75rem;cursor:pointer;font-weight:600">Copy Code</button>'
      + '<span id="db-family-code-copied" role="status" aria-live="polite" style="color:#2e7d32;font-size:.75rem;display:none">Copied&nbsp;&#x2713;</span>'
      + '<span style="color:#66bb6a;flex-basis:100%">— share this with your child\'s device to link profiles</span>'
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

// Copy the 8-digit suffix of the parent's family code to the clipboard.
// Strips the "MMR-" prefix so the parent can paste just the digits into
// the child device's family-code input (which now shows "MMR-" as a
// fixed visual prefix). Uses navigator.clipboard with a textarea
// fallback for older browsers / restricted contexts.
function _dbCopyFamilyCode() {
  if (!_parentFamilyCode) return;
  var suffix = String(_parentFamilyCode).replace(/^MMR-/i, '');
  var notify = document.getElementById('db-family-code-copied');
  function _ok() {
    if (!notify) return;
    notify.style.display = '';
    setTimeout(function() {
      if (notify) notify.style.display = 'none';
    }, 2000);
  }
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(suffix).then(_ok).catch(function() {
        if (typeof _copyFallback === 'function') _copyFallback(suffix);
        _ok();
      });
      return;
    }
  } catch (_e) {}
  if (typeof _copyFallback === 'function') _copyFallback(suffix);
  _ok();
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

  var currentGrade = _dbResolveProfileGrade(profile, studentId);
  document.getElementById('db-edit-profile-body').innerHTML =
    '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Name</label>'
    + '<input id="db-edit-name" type="text" maxlength="20" value="' + _esc(profile.display_name) + '" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="db-edit-age" type="number" min="4" max="18" value="' + _esc(String(profile.age || '')) + '" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Grade level</label>'
    + '<select id="db-edit-grade" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:4px;background:#fff">'
    +   _dbEditGradeOptions(currentGrade)
    + '</select>'
    + _dbUnsupportedGradeNotice(currentGrade)
    + '<div style="font-size:.72rem;color:#90a4ae;margin-bottom:12px">What level of math is this student working on?</div>'
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
  var gradeInp = document.getElementById('db-edit-grade');
  if (!nameInp || !msg) return;

  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Name is required.'; return; }
  if (!_supa) { msg.textContent = 'Not connected.'; return; }

  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  var emoji = _dbEditSelectedEmoji || (profile ? profile.avatar_emoji : '🦁');
  var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
  var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
  var ageVal = ageInp ? parseInt(ageInp.value) || null : null;
  var newGrade = gradeInp ? gradeInp.value : null;
  var oldGrade = _dbResolveProfileGrade(profile, studentId);
  var nNew = (typeof normalizeGrade === 'function') ? normalizeGrade(newGrade) : newGrade;

  // Refuse to persist a grade the product does not offer. Guards the write
  // itself, so no UI path (or a stale sheet left open across a config change)
  // can put a child back onto a withdrawn grade. A child already on one keeps
  // that grade until the parent actively picks a supported one — this rejects
  // the save rather than silently rewriting their enrollment.
  if (_dbIsUnsupportedGrade(nNew)) {
    msg.textContent = (_DB_GRADE_LABEL[nNew] || ('Grade ' + nNew))
      + ' is not available. Please choose a supported grade.';
    return;
  }

  try {
    var result = await Promise.race([
      _supa.from('student_profiles').update({
        display_name: name, age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        grade: nNew || '2',
        updated_at: new Date().toISOString(),
      }).eq('id', studentId),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;

    // Persist grade locally so subsequent reads stay consistent without
    // waiting for the next _fetchManagedProfiles pull.
    if (newGrade) _dbWriteProfileGrade(studentId, newGrade);
    var nOld = (typeof normalizeGrade === 'function') ? normalizeGrade(oldGrade) : oldGrade;

    await _fetchManagedProfiles();
    closeEditProfileSheet();
    _reRenderManageProfiles();

    // If we're viewing this student in the parent dashboard, refresh the grade
    // context line and stats immediately; reload Supabase data if grade changed.
    if (_activeId === studentId) {
      renderDashboard();
      if (nNew && nNew !== nOld) { _loadManagedStudentScores(studentId); }
    }

    // If we just changed the grade of the *currently active* profile, mirror
    // it to mmr_grade and reload so boot.js / state.js pick up the new
    // UNITS_DATA and key namespacing.
    if (nNew && nNew !== nOld) {
      var activeId = (function(){ try { return localStorage.getItem('mmr_active_student_id'); } catch(_){ return null; } })();
      if (activeId === studentId) {
        try { localStorage.setItem('mmr_grade', nNew); } catch(_){}
        try { location.reload(); } catch(_){}
      }
    }
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
    // Grade is an explicit, required choice. It used to be hardcoded to Grade 2
    // for every new profile, silently, with the parent only discovering it by
    // opening the Edit sheet afterwards. The placeholder option below is
    // selected and disabled so nothing is pre-chosen and the parent has to
    // decide; dbAddSave() refuses to submit until they do.
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Grade level *</label>'
    + '<select id="db-add-grade" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:4px;background:#fff">'
    +   '<option value="" selected disabled>Choose a grade…</option>'
    +   _dbAddGradeOptions()
    + '</select>'
    + '<div style="font-size:.72rem;color:#90a4ae;margin-bottom:12px">What level of math is this student working on? You can change this later.</div>'
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
  var gradeInp = document.getElementById('db-add-grade');
  if (!nameInp || !msg) return;
  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Name is required.'; return; }

  // Grade: an explicit parent choice, validated against launchGrades(). This is
  // the write path, so it rejects unsupported values on its own — a tampered
  // <option>, a stale sheet, or a direct call cannot create a profile on
  // withdrawn or nonexistent curriculum.
  var addGrade = gradeInp ? String(gradeInp.value || '').trim() : '';
  if (!addGrade) { msg.textContent = 'Choose a grade level.'; return; }
  if (typeof isGradeLaunched === 'function' && !isGradeLaunched(addGrade)) {
    msg.textContent = 'That grade is not available. Choose Kindergarten, Grade 1 or Grade 2.';
    return;
  }
  var addGradeNorm = (typeof normalizeGradeToken === 'function')
    ? normalizeGradeToken(addGrade) : addGrade;
  if (!addGradeNorm) { msg.textContent = 'Choose a grade level.'; return; }

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
        grade: addGradeNorm,                       // explicit parent choice, validated above
      }).select(),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (result.error) throw result.error;

    // Mirror the new profile's grade into the per-profile local cache so
    // the resolver returns the right value before the next fetch lands.
    var newRows = (result && result.data) || [];
    if (newRows.length && newRows[0].id) {
      _dbWriteProfileGrade(newRows[0].id, newRows[0].grade || '2');
    }

    await _fetchManagedProfiles();
    closeAddStudentSheet();
    _reRenderManageProfiles();
  } catch(e) {
    if (msg) {
      const errMsg = (e && e.message) ? String(e.message) : '';
      if (errMsg.indexOf('profile_limit_reached') !== -1) {
        // Launch Gate: BEFORE INSERT trigger enforces max_students_per_parent.
        const cap = (errMsg.match(/max (\d+) students/) || [])[1];
        msg.textContent = cap
          ? 'During beta, accounts can have up to ' + cap + ' student profiles.'
          : 'Maximum student profiles reached for this account.';
      } else if (errMsg.includes('unique')) {
        msg.textContent = 'A student with that name already exists.';
      } else {
        msg.textContent = 'Error saving. Try again.';
      }
    }
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

      // Cross-device reset invalidation: if the server's reset_epoch is
      // newer than what this device last absorbed, wipe the grade-scoped
      // local progress caches before we merge anything from the pull.
      // Otherwise stale local SCORES/DONE could survive a reset that
      // happened on another device.
      try {
        var serverEpoch = (data.reset_epoch != null) ? Number(data.reset_epoch) : 0;
        if (_dbApplyServerResetEpoch(studentId, serverEpoch)) {
          // Also wipe this dashboard's in-memory view for the student
          _dbResetStudentInMemory(student);
        }
      } catch (_e) {}

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
              timeTaken: r.time_taken || 0,
              // F5: round-trip `grade` so grade-filtered quiz history works
              // for managed profiles loaded from Supabase. NULL grades fall
              // back to qid-pattern inference via _inferScoreGrade on the
              // grade-filter pass.
              grade: r.grade || null,
              answers: Array.isArray(r.answers) ? r.answers : [],
              date: String(r.date_str || ''), time: String(r.time_str || ''),
              quit: !!r.quit, abandoned: !!r.abandoned
            };
          });
        student.SCORES.sort(function(a, b) { return b.id - a.id; });
      }

      // Merge mastery (canonical key from Phase 2 pipeline)
      var masteryJson = data.progress && data.progress.mastery_json;
      if (masteryJson && typeof masteryJson === 'object') {
        student.MASTERY = masteryJson;
      }

      // Merge activity events (Phase 2 pipeline — may be absent on older accounts)
      var activityJson = data.progress && data.progress.activity_json;
      if (activityJson && activityJson.v === 1 && Array.isArray(activityJson.events)) {
        student.ACTIVITY = activityJson.events;
      }

      student._scoresLoaded = true;

      // Re-render if this student is currently being viewed
      if (_activeId === studentId) {
        renderDashboard();
      }
    })
    .catch(function() { /* offline — leave empty */ });
}

// ── Intervention Telemetry Sync ───────────────────────────────────────────
// Upload unsynced events → Supabase, then mark them synced in localStorage.
// Fire-and-forget; never throws; safe to call when offline.
async function _syncPendingInterventionEvents(studentId) {
  if (!_supa || !studentId || studentId === 'local') return;
  var events = _readInterventionEvents();
  var pending = events.filter(function(e) { return !e.synced && e.clientId; });
  if (!pending.length) return;
  try {
    // Phase 2C: row construction extracted into _buildInterventionRowForSync
    // so the new `grade` column round-trips and is testable from jest.
    var rows = pending.map(function(e) { return _buildInterventionRowForSync(e, studentId); });
    var result = await _supa
      .from('intervention_events')
      .upsert(rows, { onConflict: 'client_id', ignoreDuplicates: true });
    if (result.error) return; // silent — will retry next session
    // Mark uploaded events as synced in localStorage
    var syncedIds = {};
    pending.forEach(function(e) { syncedIds[e.clientId] = true; });
    var updated = _readInterventionEvents().map(function(e) {
      if (e.clientId && syncedIds[e.clientId]) e.synced = true;
      return e;
    });
    _writeInterventionEvents(updated);
  } catch(e) { /* network failure — will retry next session */ }
}

// Fetch all intervention events for a student from Supabase.
// Returns normalized array on success, null on failure (caller falls back to localStorage).
async function _fetchInterventionEventsFromSupabase(studentId) {
  if (!_supa || !studentId || studentId === 'local') return null;
  try {
    var result = await Promise.race([
      _supa
        .from('intervention_events')
        // Phase 2C: select the new `grade` column so the filter uses the
        // authoritative server value when present. Legacy rows where the
        // column is null fall through to session-id inference downstream.
        .select('event_type, error_tag, session_id, resolved_correctly, occurred_at, grade')
        .eq('student_id', studentId)
        .order('occurred_at', { ascending: false })
        .limit(500),
      new Promise(function(_, rej) { setTimeout(function() { rej(new Error('timeout')); }, 5000); })
    ]);
    if (result.error || !result.data) return null;
    return result.data.map(_normalizeInterventionRow);
  } catch(e) { return null; }
}

// Phase 2B: lazily fetch the static tag→lesson index emitted by build.js.
// Caches once per dashboard session. Re-renders the dashboard when the index
// arrives so any Common Mistakes / Recommended Next Step that lacked a live
// lesson can pick one up. Safe to call repeatedly — only fetches once.
function _loadTagLessonIndex() {
  if (_tagLessonIndex !== null || _tagLessonIndexLoading) return;
  _tagLessonIndexLoading = true;
  try {
    fetch('data/tag_lesson_index.json', { cache: 'force-cache' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(json) {
        _tagLessonIndexLoading = false;
        if (json && json.byTag) {
          _tagLessonIndex = json;
          // Re-render so Learning Insights picks up the new fallback resolver.
          if (typeof renderDashboard === 'function' && document.getElementById('db-root')) {
            renderDashboard();
          }
        }
      })
      .catch(function() { _tagLessonIndexLoading = false; });
  } catch (_e) { _tagLessonIndexLoading = false; }
}

// Sync unsynced local events then fetch remote events for the given student.
// On success, updates _remoteInterventionEvents and re-renders the dashboard.
function _loadRemoteInterventionData(studentId) {
  _syncPendingInterventionEvents(studentId);
  _fetchInterventionEventsFromSupabase(studentId).then(function(events) {
    if (events !== null) {
      _remoteInterventionEvents = events;
      renderDashboard();
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────

// Called by auth.js after show('dashboard-screen') — _supa is already initialized.
function _dbInit() {
  _students = getAllStudents();
  _activeId = 'local';
  _managedProfiles = [];
  _parentFamilyCode = null;
  _remoteInterventionEvents = null;
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
              STREAK: _dbBuildStudentStreak(p),
              ACT_DATES: _dbBuildStudentActDates(p),
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
          // Sync + fetch intervention telemetry for the active student
          if (_activeId !== 'local') _loadRemoteInterventionData(_activeId);
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
  _loadQuizLenSettings(_activeId);
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
    dbGoToApp:               function()     {
      _devLog('[MMR DASHBOARD] dbGoToApp', {activeId: _activeId, managedCount: (_managedProfiles||[]).length, hasShared: typeof enterStudentLearningSession});
      if (_activeId === 'local' || !_activeId) {
        _devWarn('[MMR DASHBOARD] dbGoToApp aborted (no real student selected)');
        return;
      }
      var profile = (_managedProfiles || []).find(function(p){ return p.id === _activeId; });
      if (!profile) {
        _devWarn('[MMR DASHBOARD] dbGoToApp aborted (profile not found in _managedProfiles)', _activeId);
        return;
      }
      if (typeof enterStudentLearningSession !== 'function') {
        console.error('[MMR DASHBOARD] dbGoToApp aborted (enterStudentLearningSession not available — bundle issue)');
        return;
      }
      enterStudentLearningSession({
        studentProfileId: _activeId,
        profile:          profile,
        sessionToken:     null,
        source:           'parent-dashboard'
      });
    },
    dbSignOut:               function()     { dbSignOut(); },
    openQuizReview:          function(a)    { openQuizReview(Number(a)); },
    closeQuizReview:         function()     { closeQuizReview(); },
    backToStats:             function()     { backToStats(); },
    generateAIReport:        function()     { generateAIReport(); },
    viewLastReport:          function()     { viewLastReport(); },
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
    _dbSetQuizLen:           function(a, b) { _dbSetQuizLen(a, b); },
    _dbSaveQuizLen:          function()     { _dbSaveQuizLen(); },
    _dbSavePin:              function()     { _dbSavePin(); },
    _dbTogglePush:           function()     { _dbTogglePush(); },
    _dbSaveReminderTime:     function()     { _dbSaveReminderTime(); },
    _dbSavePassword:         function()     { _dbSavePassword(); },
    _dbSetFbRating:          function(a)    { _dbSetFbRating(Number(a)); },
    _dbSetFbCat:             function(a)    { _dbSetFbCat(a); },
    _dbSubmitFeedback:       function()     { _dbSubmitFeedback(); },
    openAddStudentSheet:     function()     { openAddStudentSheet(); },
    _dbCopyFamilyCode:       function()     { _dbCopyFamilyCode(); },
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
    setDashboardTheme:       function(mode)  { setTheme(mode); },
    showActivityDetail:      function(type)  { _activityDetailView = type; _activityDetailDay = null; _reRenderActivitySnapshot(); },
    showActivityDay:         function(day)   { _activityDetailView = 'day'; _activityDetailDay = day; _reRenderActivitySnapshot(); },
    hideActivityDetail:      function()      { _activityDetailView = null; _activityDetailDay = null; _reRenderActivitySnapshot(); },
    setQuizHistoryFilter:    function(field, value) {
      if (!_quizHistoryFilters || !field || value == null) return;
      _quizHistoryFilters[field] = value;
      // Reset lesson when unit changes — selected lesson may no longer apply
      if (field === 'unit') _quizHistoryFilters.lesson = 'all';
      _reRenderQuizHistory();
    },
    resetQuizHistoryFilters: function() {
      _quizHistoryFilters = { range:'lifetime', unit:'all', lesson:'all', result:'all', sort:'date-desc' };
      _reRenderQuizHistory();
    },
    toggleDbSection:         function(_a, _a2, el) {
      var sec = el.closest('.db-section[data-section]');
      if (!sec) return;
      var open = sec.classList.toggle('is-open');
      var btn = sec.querySelector('.db-section-header');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      _dbSectionStateSet(sec.dataset.section, open);
    },
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

  // Student selector change + delegated select-change actions (data-action on <select>)
  document.addEventListener('change', function(e) {
    var t = e.target;
    if (!t) return;
    if (t.id === 'db-student-select') { switchStudent(t.value); return; }
    if (t.id && t.id.indexOf('db-qlen-custom-') === 0) { _dbQuizLenCustomChanged(t); return; }
    if (t.tagName === 'SELECT' && t.dataset && t.dataset.action) {
      var fn = _DB_ACTIONS[t.dataset.action];
      if (fn) fn(t.dataset.arg !== undefined ? t.dataset.arg : null, t.value, t);
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
    _deriveReportDiagnostics,
    _gradeBand,
    _inferScoreGrade,
    _last7DaysCutoffMs,
    _getLast7DaysLessonQuizScores,
    _renderSnapLessons,
    _dbBuildStudentStreak,
    _dbBuildStudentActDates,
    _renderActivitySnapshotInner,
  };
}

// ── Dev-only mock quiz history injector ──────────────────────────────────
// Browser console: window._injectMockQuizHistory(70)
//                  window._clearMockQuizHistory()
// Never called from production code — only for manual QA / scroll stress tests.
if (typeof window !== 'undefined') {
  var _MOCK_UNITS = [
    { idx: 0, lessons: 4 },
    { idx: 1, lessons: 4 },
    { idx: 2, lessons: 4 },
    { idx: 3, lessons: 3 },
    { idx: 4, lessons: 4 },
    { idx: 5, lessons: 4 },
    { idx: 6, lessons: 3 },
    { idx: 7, lessons: 3 },
    { idx: 8, lessons: 3 },
    { idx: 9, lessons: 3 },
  ];
  var _MOCK_COLORS = ['#4caf50','#2196f3','#ff9800','#e91e63','#9c27b0','#00bcd4','#8bc34a','#ff5722','#607d8b','#795548'];

  window._injectMockQuizHistory = function(count) {
    count = Math.max(1, Math.min(count || 70, 300));
    var st = _students[_activeId];
    if (!st) { console.warn('[MMR] No active student — open the parent dashboard first.'); return; }
    if (!st.SCORES) st.SCORES = [];

    var now = Date.now();
    var entries = [];

    for (var i = 0; i < count; i++) {
      // Spread across last 400 days so all date-range chips get coverage
      var daysBack = Math.floor(Math.random() * 400);
      var ts = now - daysBack * 86400000 - Math.floor(Math.random() * 43200000);

      var typeRoll = Math.random();
      var type = typeRoll < 0.65 ? 'lesson' : (typeRoll < 0.85 ? 'unit' : 'final');
      var unit = _MOCK_UNITS[Math.floor(Math.random() * _MOCK_UNITS.length)];

      var qid;
      if (type === 'lesson') {
        var li = Math.floor(Math.random() * unit.lessons) + 1;
        qid = 'lq_u' + (unit.idx + 1) + 'l' + li;
      } else if (type === 'unit') {
        qid = 'ut_u' + (unit.idx + 1);
      } else {
        qid = 'ft';
      }

      var total = type === 'lesson' ? 10 : (type === 'unit' ? 20 : 30);
      // Skew toward mid-range to produce realistic pass/fail mix
      var pct = Math.min(100, Math.max(0, Math.round(35 + Math.random() * 70)));
      var score = Math.round(total * pct / 100);

      var rawSecs = type === 'lesson' ? (60 + Math.floor(Math.random() * 300))
                  : type === 'unit'   ? (120 + Math.floor(Math.random() * 600))
                                      : (180 + Math.floor(Math.random() * 900));
      var mm = Math.floor(rawSecs / 60);
      var ss = rawSecs % 60;
      var timeTaken = mm + ':' + (ss < 10 ? '0' : '') + ss;

      var dt = new Date(ts);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var dateStr = months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
      var hr = dt.getHours(); var mn = dt.getMinutes();
      var timeStr = (hr % 12 || 12) + ':' + (mn < 10 ? '0' : '') + mn + ' ' + (hr < 12 ? 'AM' : 'PM');

      entries.push({
        _mock:     true,
        id:        ts,
        qid:       qid,
        label:     type === 'lesson' ? 'Lesson Quiz' : (type === 'unit' ? 'Unit Test' : 'Final Test'),
        type:      type,
        score:     score,
        total:     total,
        pct:       pct,
        stars:     pct >= 90 ? '★★★' : (pct >= 70 ? '★★' : '★'),
        unitIdx:   unit.idx,
        color:     _MOCK_COLORS[unit.idx % _MOCK_COLORS.length],
        name:      'Mock Student',
        timeTaken: timeTaken,
        answers:   [],
        date:      dateStr,
        time:      timeStr,
        quit:      false,
        abandoned: false,
      });
    }

    // Merge with existing scores, keep sorted newest-first
    st.SCORES = st.SCORES.concat(entries);
    st.SCORES.sort(function(a, b) { return (b.id || 0) - (a.id || 0); });

    if (typeof _reRenderQuizHistory      === 'function') _reRenderQuizHistory();
    if (typeof _reRenderActivitySnapshot === 'function') _reRenderActivitySnapshot();

    console.log('[MMR] Injected ' + count + ' mock quiz entries. Total SCORES: ' + st.SCORES.length);
    console.log('[MMR] Clear with: window._clearMockQuizHistory()');
  };

  window._clearMockQuizHistory = function() {
    var st = _students[_activeId];
    if (!st || !st.SCORES) { console.warn('[MMR] No active student.'); return; }
    var before = st.SCORES.length;
    st.SCORES = st.SCORES.filter(function(s) { return !s._mock; });
    if (typeof _reRenderQuizHistory      === 'function') _reRenderQuizHistory();
    if (typeof _reRenderActivitySnapshot === 'function') _reRenderActivitySnapshot();
    console.log('[MMR] Cleared ' + (before - st.SCORES.length) + ' mock entries. Remaining: ' + st.SCORES.length);
  };
}
