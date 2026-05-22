'use strict';

// Pure helpers used by Tier 1 cross-device sync. These mirror the
// implementations in src/auth.js (_shouldRunResumeSync, the paused-
// reconcile loop inside _pullStudentProgress, the done-merge and the
// score-merge) and src/dashboard.js (_dbProgressCacheKeysForReset), so
// the tests can exercise the logic without a full browser harness.

// Returns true when enough time has elapsed since the last resume sync.
function _shouldRunResumeSync(now, lastTime, throttleMs) {
  if (typeof now !== 'number' || typeof throttleMs !== 'number') return false;
  if (!lastTime) return true;
  return (now - lastTime) >= throttleMs;
}

// Returns the list of qids that should be cleared from local paused state
// because they are marked done=true in the merged DONE map.
function _reconcilePausedAgainstDone(done, pausedAll) {
  var out = [];
  if (!done || !pausedAll || typeof pausedAll !== 'object') return out;
  var keys = Object.keys(pausedAll);
  for (var i = 0; i < keys.length; i++) {
    var qid = keys[i];
    if (done[qid] === true) out.push(qid);
  }
  return out;
}

// Mirrors the Object.assign(DONE, safe) merge in _pullStudentProgress
// with the same key sanitization (length, prototype-pollution guard).
function _mergeRemoteDoneIntoLocal(localDone, remoteDoneJson) {
  var merged = Object.assign({}, localDone || {});
  if (remoteDoneJson && typeof remoteDoneJson === 'object' && !Array.isArray(remoteDoneJson)) {
    var keys = Object.keys(remoteDoneJson);
    for (var ki = 0; ki < keys.length; ki++) {
      var k = keys[ki];
      if (typeof k === 'string' && k.length < 100
          && k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
        merged[k] = !!remoteDoneJson[k];
      }
    }
  }
  return merged;
}

// Mirrors the SCORES append-only merge in _pullStudentProgress.
function _mergeRemoteScoresIntoLocal(localScores, remoteScores) {
  var out = Array.isArray(localScores) ? localScores.slice() : [];
  if (!Array.isArray(remoteScores) || !remoteScores.length) return out;
  var localIds = new Set(out.map(function (s) { return s.id; }));
  var incoming = remoteScores
    .filter(function (r) {
      return r && typeof r.local_id === 'number' && typeof r.qid === 'string'
        && typeof r.score === 'number' && typeof r.total === 'number'
        && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100
        && !localIds.has(r.local_id);
    })
    .map(function (r) {
      return {
        qid: r.qid, label: String(r.label || ''), type: String(r.type || ''),
        score: r.score, total: r.total, pct: r.pct, stars: String(r.stars || ''),
        unitIdx: typeof r.unit_idx === 'number' ? r.unit_idx : 0,
        color: String(r.color || ''),
        name: String(r.student_name || ''), id: r.local_id,
        timeTaken: r.time_taken || 0,
        grade: r.grade || null,
        answers: Array.isArray(r.answers) ? r.answers : [],
        date: String(r.date_str || ''), time: String(r.time_str || ''),
        quit: !!r.quit, abandoned: !!r.abandoned
      };
    });
  out.push.apply(out, incoming);
  out.sort(function (a, b) { return b.id - a.id; });
  return out;
}

// Mirror of src/dashboard.js _dbProgressCacheKeysForReset (Tier 1).
function _dbProgressCacheKeysForReset(gradeBand, sessionMatches) {
  var keys = [];
  if (gradeBand === 'K' || gradeBand === '1' || gradeBand === '2') {
    keys.push('wb_sc5_'         + gradeBand);
    keys.push('wb_done5_'       + gradeBand);
    keys.push('wb_mastery_'     + gradeBand);
    keys.push('mmr_mastery_v1_' + gradeBand);
  }
  keys.push('wb_paused_quiz');
  if (sessionMatches) {
    ['K', '1', '2'].forEach(function (g) {
      keys.push('wb_sc5_'         + g);
      keys.push('wb_done5_'       + g);
      keys.push('wb_mastery_'     + g);
      keys.push('mmr_mastery_v1_' + g);
    });
    keys.push('wb_streak');
    keys.push('wb_act_dates');
    keys.push('wb_apptime');
    keys.push('wb_sc5');
    keys.push('wb_done5');
    keys.push('wb_mastery');
  }
  var seen = {};
  var out = [];
  for (var i = 0; i < keys.length; i++) {
    if (!seen[keys[i]]) { seen[keys[i]] = true; out.push(keys[i]); }
  }
  return out;
}

// Unit-lessons-complete counter mirror — matches src/unit.js logic
// ("lessons whose lq_uXlY best pct >= 80").
function _computeUnitLessonsComplete(scores, unitIdx, totalLessons) {
  var done = 0;
  for (var l = 1; l <= totalLessons; l++) {
    var lqid = 'lq_u' + unitIdx + 'l' + l;
    var best = scores
      .filter(function (s) { return s.qid === lqid; })
      .sort(function (a, b) { return b.pct - a.pct; })[0];
    if (best && best.pct >= 80) done++;
  }
  return done;
}

module.exports = {
  _shouldRunResumeSync,
  _reconcilePausedAgainstDone,
  _mergeRemoteDoneIntoLocal,
  _mergeRemoteScoresIntoLocal,
  _dbProgressCacheKeysForReset,
  _computeUnitLessonsComplete,
};
