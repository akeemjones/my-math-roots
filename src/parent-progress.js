// ════════════════════════════════════════
//  PARENT PROGRESS — pure data utilities
//
//  Relocated out of the standalone parent dashboard (removed in the
//  single-family-account pivot) so the compact Settings → Progress and the
//  Children section can compute recent results, quiz history, weak skills and
//  per-child grade WITHOUT the dashboard renderers.
//
//  Pure and Node-loadable: every function takes its data as arguments (or reads
//  only localStorage) and returns plain values — no DOM, no dashboard globals.
//  Concatenated by build.js BEFORE dashboard.js and included in the dashboard
//  test harness bundle slice, so in-bundle callers keep resolving these by name.
//  normalizeGrade (state.js) is read via a typeof guard with a local fallback.
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

// ── Grade-band helpers ────────────────────────────────────────────────────

// Short grade-band token used by score records and grade-scoped unlock
// settings ('k' | 'g1' | 'g2'). Returns null for unknown input.
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

// ── Settings parsers (pure, testable) ─────────────────────────────────────

function _emptyUnlockSlot() {
  return { freeMode: false, units: [], lessons: {} };
}

function _emptyByGrade() {
  return { k: _emptyUnlockSlot(), g1: _emptyUnlockSlot(), g2: _emptyUnlockSlot(), g3: _emptyUnlockSlot() };
}

// Parse unlock settings into the canonical schema-v2 shape with grade scoping.
function _parseUnlockSettings(raw, activeBand) {
  if (!raw || typeof raw !== 'object') raw = {};
  var out = { schemaVersion: 2, byGrade: _emptyByGrade() };

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

// Read a grade slot from a schema-v2 draft. Falls back to an empty slot when
// the band is missing — never returns undefined.
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

// ── Pure progress computations (testable — all take data as args) ─────────

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

// ── Last-7-days filters ───────────────────────────────────────────────────
function _last7DaysCutoffMs() { return Date.now() - 7 * 86400000; }

// Shared "last 7 days lesson-quiz scores" filter — single source of truth for
// the recent-lesson count and the recent-results detail.
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

// ── Spaced-review queue ───────────────────────────────────────────────────
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

// ── Per-profile grade selection ───────────────────────────────────────────
// A child profile's grade lives in Supabase (student_profiles.grade, source of
// truth) mirrored to a local cache (mmr_profile_grade_<id>).
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

// Resolve a profile's grade with precedence: profile.grade → local cache →
// mmr_grade → '2'. Mirrors the resolved value into the local cache.
function _dbResolveProfileGrade(profile, fallbackProfileId) {
  var _norm = (typeof normalizeGrade === 'function') ? normalizeGrade : function(v){
    if (v === null || v === undefined) return '2';
    var s = String(v).trim().toLowerCase();
    if (s === 'k' || s === 'kindergarten' || s === '0') return 'K';
    if (s === '1') return '1';
    if (s === '3') return '3';
    return '2';
  };

  if (profile && profile.grade != null && profile.grade !== '') {
    var fromProfile = _norm(profile.grade);
    if (profile.id) _dbWriteProfileGrade(profile.id, fromProfile);
    return fromProfile;
  }

  var id = (profile && profile.id) || fallbackProfileId;
  if (id) {
    try {
      var cached = localStorage.getItem(_dbProfileGradeKey(id));
      if (cached) return _norm(cached);
    } catch (_e) {}
  }

  try {
    var current = localStorage.getItem('mmr_grade');
    if (current) {
      var g = _norm(current);
      if (id) _dbWriteProfileGrade(id, g);
      return g;
    }
  } catch (_e) {}

  return '2';
}

// ── student_profiles row → streak / activity-date mappers ─────────────────
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

// Node/Jest bridge — guarded so the browser bundle (no module object) is
// unaffected. In the bundle these are plain globals used by name.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCategoryFromId, _gradeBand, _inferScoreGrade,
    _parseUnlockSettings, _parseTimerSettings, _isUnitUnlockedInDraft, _isLessonUnlockedInDraft,
    _computeOverallStats, _computeSkillBreakdown, _computeWeakAreas,
    _last7DaysCutoffMs, _getLast7DaysLessonQuizScores, _computeReviewQueue,
    _dbProfileGradeKey, _dbReadProfileGrade, _dbWriteProfileGrade, _dbGradeBadge, _dbResolveProfileGrade,
    _dbBuildStudentStreak, _dbBuildStudentActDates,
  };
}
