/**
 * Stage 2 verification — runs in Node (no DOM).
 * Simulates what src/dashboard.js helper functions produce from seeded Grade 2 data.
 * Exit 0 = all checks pass. Exit 1 = at least one failure.
 */

/* ── Inline the four analytics helpers from dashboard.js ── */
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

/* ── Simulated localStorage reader (mirrors _readLocalStudentData logic) ── */
function simulateRead(store) {
  function tryParse(key, fallback) {
    var v = store[key];
    if (v == null) return fallback;
    try { return JSON.parse(v); } catch(_) { return fallback; }
  }
  var activeGrade = store['mmr_grade'] || '2';
  var rawScores = tryParse('wb_sc5_' + activeGrade, null) || tryParse('wb_sc5', []);
  var scoresArr = Array.isArray(rawScores) ? rawScores : (rawScores.d || []);
  var masteryAgg = tryParse('mmr_mastery_v1', null);
  if (!masteryAgg || !Object.keys(masteryAgg).length) {
    masteryAgg = tryParse('wb_mastery_' + activeGrade, null) || tryParse('wb_mastery', {});
  }
  var actDoc = tryParse('mmr_activity_v1', null);
  var actEvents = (actDoc && actDoc.v === 1 && Array.isArray(actDoc.events)) ? actDoc.events : [];
  return { MASTERY: masteryAgg || {}, ACTIVITY: actEvents, SCORES: scoresArr };
}

/* ── Test harness ── */
var PASS = 0; var FAIL = 0;
function assert(label, condition, detail) {
  if (condition) {
    console.log('  PASS  ' + label);
    PASS++;
  } else {
    console.error('  FAIL  ' + label + (detail ? ' — ' + detail : ''));
    FAIL++;
  }
}

/* ════════════════════════════════════
   CHECK 1 — Seeded Grade 2 data
   ════════════════════════════════════ */
console.log('\n[1] Seeded Grade 2 data\n');
var now = Date.now();
var seededStore = {
  'mmr_grade': '2',
  'mmr_mastery_v1': JSON.stringify({
    place_value: { attempts: 10, correct: 8, lastSeen: now },
    regrouping:  { attempts: 10, correct: 5, lastSeen: now },
    fractions:   { attempts: 4,  correct: 4, lastSeen: now }
  }),
  'mmr_activity_v1': JSON.stringify({
    v: 1,
    events: [
      { ts: now-300000, grade:'2', unitId:'u2', lessonId:'u2l1', questionId:'q1',
        tags:['place_value'], correct:true,  errorType:null,                      patternTag:null },
      { ts: now-200000, grade:'2', unitId:'u3', lessonId:'u3l1', questionId:'q2',
        tags:['regrouping'],  correct:false, errorType:'err_no_regroup',           patternTag:'pattern_forgot_regroup' },
      { ts: now-100000, grade:'2', unitId:'u8', lessonId:'u8l2', questionId:'q3',
        tags:['fractions'],   correct:false, errorType:'err_denominator_confusion',patternTag:'pattern_counted_total_parts_wrong' }
    ]
  })
};

var student = simulateRead(seededStore);

// Tag stats
var tagStats = _computeTagStats(student.MASTERY);
assert('tagStats has 3 entries', tagStats.length === 3);
assert('weakest tag first (regrouping 50%)', tagStats[0].tag === 'regrouping');
assert('fractions accuracy = 1.0', tagStats.find(function(t){return t.tag==='fractions';}).accuracy === 1.0);
assert('place_value accuracy = 0.8', Math.abs(tagStats.find(function(t){return t.tag==='place_value';}).accuracy - 0.8) < 0.001);

// Status tiers (accuracy thresholds matching plan: ≥80% strong, 60-79% developing, <60% needs review)
var statusOf = function(tag) {
  var s = tagStats.find(function(t){return t.tag===tag;});
  if (!s) return null;
  return s.accuracy >= 0.8 ? 'strong' : s.accuracy >= 0.6 ? 'developing' : 'needs_review';
};
assert('regrouping = needs_review', statusOf('regrouping') === 'needs_review');
assert('place_value = strong', statusOf('place_value') === 'strong');
assert('fractions = strong (100%)', statusOf('fractions') === 'strong');

// Misconception counts
var misc = _computeMisconceptions(student.ACTIVITY);
assert('err_no_regroup count = 1', misc['err_no_regroup'] === 1);
assert('err_denominator_confusion count = 1', misc['err_denominator_confusion'] === 1);
assert('no count for correct event', !misc['null'] && Object.keys(misc).length === 2);

// patternTag counts from activity events
var patternCounts = {};
student.ACTIVITY.forEach(function(e){ if(e.patternTag) patternCounts[e.patternTag] = (patternCounts[e.patternTag]||0)+1; });
assert('pattern_forgot_regroup count = 1', patternCounts['pattern_forgot_regroup'] === 1);
assert('pattern_counted_total_parts_wrong count = 1', patternCounts['pattern_counted_total_parts_wrong'] === 1);

// Tag→lesson map
var tlMap = _buildTagLessonMap(student.ACTIVITY);
assert('regrouping maps to u3l1', tlMap['regrouping'] && tlMap['regrouping']['u3l1'] === 1);
assert('fractions maps to u8l2', tlMap['fractions'] && tlMap['fractions']['u8l2'] === 1);
assert('place_value maps to u2l1', tlMap['place_value'] && tlMap['place_value']['u2l1'] === 1);

// Review recommendations for weak tags
var weakTags = tagStats.filter(function(t){ return t.attempts >= 2 && t.accuracy < 0.6; });
assert('one weak tag (regrouping)', weakTags.length === 1 && weakTags[0].tag === 'regrouping');
var recs = _recommendReviewLessons(weakTags, tlMap, 5);
assert('rec for regrouping → u3l1', recs.length >= 1 && recs[0].lessonId === 'u3l1');
assert('rec accuracy = 0.5', Math.abs(recs[0].accuracy - 0.5) < 0.001);

// Recent activity
var recentLessons = {};
student.ACTIVITY.forEach(function(e){ if(e.lessonId) recentLessons[e.lessonId] = true; });
assert('3 distinct lessons in activity', Object.keys(recentLessons).length === 3);

/* ════════════════════════════════════
   CHECK 2 — Empty state
   ════════════════════════════════════ */
console.log('\n[2] Empty state (no mastery / no activity)\n');
var emptyStudent = simulateRead({ 'mmr_grade': '2' });
assert('MASTERY is {}', JSON.stringify(emptyStudent.MASTERY) === '{}');
assert('ACTIVITY is []', Array.isArray(emptyStudent.ACTIVITY) && emptyStudent.ACTIVITY.length === 0);
assert('SCORES is []', Array.isArray(emptyStudent.SCORES) && emptyStudent.SCORES.length === 0);

var emptyTagStats = _computeTagStats(emptyStudent.MASTERY);
assert('empty tagStats = []', emptyTagStats.length === 0);
var emptyMisc = _computeMisconceptions(emptyStudent.ACTIVITY);
assert('empty misconceptions = {}', Object.keys(emptyMisc).length === 0);
var emptyWeakTags = emptyTagStats.filter(function(t){ return t.attempts >= 2 && t.accuracy < 0.6; });
assert('no weak tags when empty', emptyWeakTags.length === 0);
// _renderPracticeSpotlight returns '' when weakTags.length === 0 — verified via code inspection

/* ════════════════════════════════════
   CHECK 3 — Legacy fallback (wb_mastery)
   ════════════════════════════════════ */
console.log('\n[3] Legacy fallback from wb_mastery\n');
var legacyStore = {
  'mmr_grade': '2',
  'wb_mastery': JSON.stringify({ old_skill: { attempts: 5, correct: 2, nextReview: now + 10000 } })
};
var legacyStudent = simulateRead(legacyStore);
assert('falls back to wb_mastery when mmr_mastery_v1 absent', legacyStudent.MASTERY && legacyStudent.MASTERY['old_skill']);
assert('wb_mastery fallback accuracy = 0.4', Math.abs(legacyStudent.MASTERY['old_skill'].correct / legacyStudent.MASTERY['old_skill'].attempts - 0.4) < 0.001);

/* ════════════════════════════════════
   CHECK 4 — Managed student activity_json safety
   ════════════════════════════════════ */
console.log('\n[4] Managed student activity_json merge safety\n');

// Simulate _loadManagedStudentScores merge logic
function simulateManagedMerge(progressBlob) {
  var student = { MASTERY: {}, ACTIVITY: [] };
  var masteryJson = progressBlob && progressBlob.mastery_json;
  if (masteryJson && typeof masteryJson === 'object') student.MASTERY = masteryJson;
  var activityJson = progressBlob && progressBlob.activity_json;
  if (activityJson && activityJson.v === 1 && Array.isArray(activityJson.events)) {
    student.ACTIVITY = activityJson.events;
  }
  return student;
}

// Case A: progress has both mastery_json and activity_json
var mergedA = simulateManagedMerge({
  mastery_json: { skip_count: { attempts: 6, correct: 3 } },
  activity_json: { v: 1, events: [{ ts: now, lessonId: 'u1l1', tags: ['skip_count'], correct: false, errorType: 'err_skip_count_error' }] }
});
assert('managed: MASTERY loaded from mastery_json', mergedA.MASTERY['skip_count'] && mergedA.MASTERY['skip_count'].attempts === 6);
assert('managed: ACTIVITY loaded from activity_json', mergedA.ACTIVITY.length === 1 && mergedA.ACTIVITY[0].lessonId === 'u1l1');

// Case B: missing activity_json — should not crash, ACTIVITY stays []
var mergedB = simulateManagedMerge({ mastery_json: { skip_count: { attempts: 3, correct: 2 } } });
assert('managed: missing activity_json → ACTIVITY = []', Array.isArray(mergedB.ACTIVITY) && mergedB.ACTIVITY.length === 0);

// Case C: malformed activity_json — should not crash
var mergedC = simulateManagedMerge({ mastery_json: {}, activity_json: { v: 99, events: 'bad' } });
assert('managed: malformed activity_json → ACTIVITY = []', Array.isArray(mergedC.ACTIVITY) && mergedC.ACTIVITY.length === 0);

// Case D: null progress blob — should not crash
var mergedD = simulateManagedMerge(null);
assert('managed: null progress → defaults', JSON.stringify(mergedD.MASTERY) === '{}' && mergedD.ACTIVITY.length === 0);

/* ════════════════════════════════════
   CHECK 5 — mmr_activity_v1 FIFO cap
   ════════════════════════════════════ */
console.log('\n[5] Activity event FIFO cap (1000 events)\n');
// Inline the cap logic from QE.logResult
function simulateEventAppend(existing, newEvent) {
  var doc = (existing && existing.v === 1 && Array.isArray(existing.events))
    ? { v: 1, events: existing.events.slice() }
    : { v: 1, events: [] };
  doc.events.push(newEvent);
  if (doc.events.length > 1000) doc.events = doc.events.slice(doc.events.length - 1000);
  return doc;
}

var bigDoc = { v: 1, events: [] };
for (var i = 0; i < 1001; i++) bigDoc.events.push({ ts: i, lessonId: 'u1l1', tags: [], correct: true, errorType: null });
var afterAppend = simulateEventAppend(bigDoc, { ts: 99999, lessonId: 'u2l1', tags: [], correct: false, errorType: 'err_x' });
assert('cap trims to 1000', afterAppend.events.length === 1000);
// 1001 seed events (ts 0–1000) + 1 appended = 1002; slice(2) drops ts=0 and ts=1
assert('oldest two events dropped', afterAppend.events[0].ts === 2);
assert('newest event present', afterAppend.events[999].ts === 99999);

/* ════════════════════════════════════
   Summary
   ════════════════════════════════════ */
console.log('\n' + '─'.repeat(50));
console.log('PASS: ' + PASS + '  FAIL: ' + FAIL);
if (FAIL > 0) { console.error('\nStage 2 verification FAILED'); process.exit(1); }
console.log('\nStage 2 verification PASSED');
process.exit(0);
