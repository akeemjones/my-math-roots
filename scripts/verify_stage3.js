/**
 * Stage 3 verification — runs in Node (no DOM, no Supabase connection).
 * Tests push payload shape, pull merge logic, and backward-compat cases.
 * Exit 0 = all checks pass. Exit 1 = failure.
 */

var PASS = 0; var FAIL = 0;
function assert(label, condition, detail) {
  if (condition) { console.log('  PASS  ' + label); PASS++; }
  else { console.error('  FAIL  ' + label + (detail ? ' — ' + detail : '')); FAIL++; }
}

/* ── Inline helpers from auth.js ── */
function _mergeActivityEvents(localEvents, remoteEvents) {
  var tsMap = {};
  (remoteEvents || []).forEach(function(e) { if (e && e.ts) tsMap[String(e.ts)] = e; });
  (localEvents  || []).forEach(function(e) { if (e && e.ts) tsMap[String(e.ts)] = e; });
  var merged = Object.keys(tsMap).map(function(k) { return tsMap[k]; });
  merged.sort(function(a, b) { return a.ts - b.ts; });
  if (merged.length > 1000) merged = merged.slice(merged.length - 1000);
  return { v: 1, events: merged };
}

/* ── Simulate the localStorage reads in _pushAll / _pushMasteryParent ── */
function buildPushPayload(store) {
  function read(key, fallback) {
    var v = store[key]; if (!v) return fallback;
    try { return JSON.parse(v); } catch(_) { return fallback; }
  }
  return {
    p_mastery_json:  (function(){ try{ return JSON.parse(store['mmr_mastery_v1']||'{}'); }catch(_){ return {}; } })(),
    p_activity_json: (function(){ try{ var d=JSON.parse(store['mmr_activity_v1']||'null'); return (d&&d.v===1)?d:{v:1,events:[]}; }catch(_){ return {v:1,events:[]}; } })(),
  };
}

/* ── Simulate mastery pull merge → mmr_mastery_v1 ── */
function simulateMasteryPull(localStore, remoteMasteryJson) {
  var store = Object.assign({}, localStore);
  if (remoteMasteryJson && typeof remoteMasteryJson === 'object') {
    try {
      var localAgg = JSON.parse(store['mmr_mastery_v1'] || '{}');
      Object.keys(remoteMasteryJson).forEach(function(k) {
        var cm = remoteMasteryJson[k];
        if (!cm || typeof cm.attempts !== 'number') return;
        var lm = localAgg[k];
        if (!lm || cm.attempts > lm.attempts ||
            (cm.attempts === lm.attempts && (cm.correct||0) > (lm.correct||0))) {
          localAgg[k] = { attempts: cm.attempts, correct: cm.correct||0, lastSeen: cm.lastSeen||0 };
        }
      });
      store['mmr_mastery_v1'] = JSON.stringify(localAgg);
    } catch (_) {}
  }
  return store;
}

/* ── Simulate activity pull merge → mmr_activity_v1 ── */
function simulateActivityPull(localStore, remoteActivityJson) {
  var store = Object.assign({}, localStore);
  if (remoteActivityJson && remoteActivityJson.v === 1 && Array.isArray(remoteActivityJson.events)) {
    try {
      var localActDoc = JSON.parse(store['mmr_activity_v1'] || 'null');
      var localEvts = (localActDoc && localActDoc.v === 1 && Array.isArray(localActDoc.events)) ? localActDoc.events : [];
      var mergedDoc = _mergeActivityEvents(localEvts, remoteActivityJson.events);
      store['mmr_activity_v1'] = JSON.stringify(mergedDoc);
    } catch (_) {}
  }
  return store;
}

var now = Date.now();

/* ════════════════════════════════════
   CHECK 1 — Push payload uses mmr_mastery_v1 (not legacy MASTERY global)
   ════════════════════════════════════ */
console.log('\n[1] Push payload reads mmr_mastery_v1\n');

// Store with canonical key populated
var storeA = {
  'mmr_mastery_v1': JSON.stringify({ place_value: { attempts: 10, correct: 8, lastSeen: now } }),
  'mmr_activity_v1': JSON.stringify({ v: 1, events: [
    { ts: now - 1000, grade:'2', unitId:'u2', lessonId:'u2l1', tags:['place_value'], correct:true, errorType:null, patternTag:null }
  ]})
};
var payloadA = buildPushPayload(storeA);
assert('mastery read from mmr_mastery_v1', payloadA.p_mastery_json['place_value'] && payloadA.p_mastery_json['place_value'].attempts === 10);
assert('activity read from mmr_activity_v1', payloadA.p_activity_json.v === 1 && payloadA.p_activity_json.events.length === 1);
assert('activity event has lessonId', payloadA.p_activity_json.events[0].lessonId === 'u2l1');

// Store with only legacy MASTERY key (mmr_mastery_v1 absent) — push should send {}
var storeB = {
  'wb_mastery': JSON.stringify({ old_skill: { attempts: 5, correct: 3 } })
  // No mmr_mastery_v1
};
var payloadB = buildPushPayload(storeB);
assert('no mmr_mastery_v1 → push sends {}', Object.keys(payloadB.p_mastery_json).length === 0);
assert('no activity → push sends {v:1,events:[]}', payloadB.p_activity_json.v === 1 && payloadB.p_activity_json.events.length === 0);

/* ════════════════════════════════════
   CHECK 2 — Pull merge writes mmr_mastery_v1 (not MASTERY global)
   ════════════════════════════════════ */
console.log('\n[2] Pull merge writes mmr_mastery_v1\n');

// Case A: empty local + remote has mastery → merge into mmr_mastery_v1
var storeC = {};
var remoteMasteryA = { regrouping: { attempts: 8, correct: 4, lastSeen: now } };
storeC = simulateMasteryPull(storeC, remoteMasteryA);
var merged1 = JSON.parse(storeC['mmr_mastery_v1'] || '{}');
assert('pull creates mmr_mastery_v1 from remote', merged1['regrouping'] && merged1['regrouping'].attempts === 8);

// Case B: local has more attempts → local wins (server is behind)
var storeD = { 'mmr_mastery_v1': JSON.stringify({ place_value: { attempts: 15, correct: 12, lastSeen: now } }) };
var remoteMasteryB = { place_value: { attempts: 10, correct: 8, lastSeen: now - 5000 } };
storeD = simulateMasteryPull(storeD, remoteMasteryB);
var merged2 = JSON.parse(storeD['mmr_mastery_v1'] || '{}');
assert('higher local attempts wins over remote', merged2['place_value'].attempts === 15);

// Case C: remote has more attempts → remote wins (device was offline)
var storeE = { 'mmr_mastery_v1': JSON.stringify({ skip_count: { attempts: 3, correct: 2, lastSeen: now - 3000 } }) };
var remoteMasteryC = { skip_count: { attempts: 9, correct: 7, lastSeen: now } };
storeE = simulateMasteryPull(storeE, remoteMasteryC);
var merged3 = JSON.parse(storeE['mmr_mastery_v1'] || '{}');
assert('higher remote attempts wins over local', merged3['skip_count'].attempts === 9);

// Case D: missing/null mastery_json → no crash, store unchanged
var storeF = { 'mmr_mastery_v1': JSON.stringify({ fractions: { attempts: 4, correct: 4, lastSeen: now } }) };
simulateMasteryPull(storeF, null);
simulateMasteryPull(storeF, undefined);
simulateMasteryPull(storeF, 'not_an_object');
assert('null/missing mastery_json handled safely', true); // no exception thrown

/* ════════════════════════════════════
   CHECK 3 — Activity merge (union by ts, local wins collision)
   ════════════════════════════════════ */
console.log('\n[3] Activity union merge\n');

// Case A: no overlap — all events from both sides appear
var local3 = [{ ts: 1000, lessonId: 'u1l1', tags: ['place_value'], correct: true, errorType: null }];
var remote3 = [{ ts: 2000, lessonId: 'u2l1', tags: ['regrouping'], correct: false, errorType: 'err_no_regroup' }];
var mergedDoc3 = _mergeActivityEvents(local3, remote3);
assert('union includes all events (no overlap)', mergedDoc3.events.length === 2);
assert('sorted by ts', mergedDoc3.events[0].ts === 1000 && mergedDoc3.events[1].ts === 2000);

// Case B: same ts collision — local wins
var localCol = [{ ts: 5000, lessonId: 'u1l1', tags: ['t1'], correct: true, errorType: null, source: 'local' }];
var remoteCol = [{ ts: 5000, lessonId: 'u1l1', tags: ['t1'], correct: false, errorType: 'err_x', source: 'remote' }];
var mergedCol = _mergeActivityEvents(localCol, remoteCol);
assert('ts collision: local wins', mergedCol.events.length === 1 && mergedCol.events[0].source === 'local');

// Case C: 1500 remote events + 200 local unique events → cap at 1000, newest kept
var bigRemote = [];
for (var i = 0; i < 1500; i++) bigRemote.push({ ts: i * 100, lessonId: 'u1l1', tags: [], correct: true, errorType: null });
var bigLocal = [];
for (var j = 0; j < 200; j++) bigLocal.push({ ts: 9900000 + j * 10, lessonId: 'u2l1', tags: [], correct: false, errorType: 'err_x' });
var mergedBig = _mergeActivityEvents(bigLocal, bigRemote);
assert('big merge capped at 1000', mergedBig.events.length === 1000);
assert('newest events kept', mergedBig.events[999].ts === 9900000 + 199 * 10);

// Case D: empty arrays on both sides
var mergedEmpty = _mergeActivityEvents([], []);
assert('empty+empty = {v:1,events:[]}', mergedEmpty.v === 1 && mergedEmpty.events.length === 0);

// Case E: one side empty
var mergedOneEmpty = _mergeActivityEvents([], [{ ts: 777, lessonId: 'u3l1', tags: [], correct: true, errorType: null }]);
assert('empty local + remote events = remote events', mergedOneEmpty.events.length === 1 && mergedOneEmpty.events[0].ts === 777);

/* ════════════════════════════════════
   CHECK 4 — Activity pull hydration
   ════════════════════════════════════ */
console.log('\n[4] Activity pull hydration\n');

// Case A: no prior local activity + remote has events → stored
var storeG = {};
storeG = simulateActivityPull(storeG, { v: 1, events: [
  { ts: now - 5000, lessonId: 'u3l2', tags: ['fractions'], correct: false, errorType: 'err_denominator_confusion' }
]});
var hydrated = JSON.parse(storeG['mmr_activity_v1'] || 'null');
assert('activity_json hydrated into mmr_activity_v1', hydrated && hydrated.v === 1 && hydrated.events.length === 1);
assert('hydrated event has errorType', hydrated.events[0].errorType === 'err_denominator_confusion');

// Case B: missing remote activity_json → local untouched
var storeH = { 'mmr_activity_v1': JSON.stringify({ v: 1, events: [{ ts: now, lessonId: 'u1l1', tags: [], correct: true, errorType: null }] }) };
storeH = simulateActivityPull(storeH, null);
var unchanged = JSON.parse(storeH['mmr_activity_v1']);
assert('missing remote activity_json → local untouched', unchanged.events.length === 1);

// Case C: malformed remote (wrong v field) → local untouched
storeH = simulateActivityPull(storeH, { v: 99, events: [] });
var unchangedB = JSON.parse(storeH['mmr_activity_v1']);
assert('wrong v in remote activity_json → local untouched', unchangedB.events.length === 1);

/* ════════════════════════════════════
   CHECK 5 — Backward compat: older accounts with mastery_json but no activity_json
   ════════════════════════════════════ */
console.log('\n[5] Backward compat — older accounts\n');

// Old account: has mastery_json, no activity_json in response
var oldAccountProgress = {
  mastery_json: { place_value: { attempts: 5, correct: 4, lastSeen: now - 10000 } }
  // no activity_json
};
var storeOld = {};
storeOld = simulateMasteryPull(storeOld, oldAccountProgress.mastery_json);
storeOld = simulateActivityPull(storeOld, oldAccountProgress.activity_json); // undefined
var oldMastery = JSON.parse(storeOld['mmr_mastery_v1'] || '{}');
var oldActivity = storeOld['mmr_activity_v1'];
assert('old account: mastery hydrated', oldMastery['place_value'] && oldMastery['place_value'].attempts === 5);
assert('old account: no activity_json → mmr_activity_v1 not written', oldActivity === undefined);

/* ════════════════════════════════════
   Summary
   ════════════════════════════════════ */
console.log('\n' + '─'.repeat(50));
console.log('PASS: ' + PASS + '  FAIL: ' + FAIL);
if (FAIL > 0) { console.error('\nStage 3 verification FAILED'); process.exit(1); }
console.log('\nStage 3 verification PASSED');
process.exit(0);
