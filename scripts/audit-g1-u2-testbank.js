// =============================================================================
//  Runtime audit — load actual built G1 U2 data and inspect pool + attempt
//  Run: node scripts/audit-g1-u2-testbank.js
//
//  Verifies:
//    (a) testBank IS the full pool (530 for real U2)
//    (b) per-lesson pool sizes match (80, 170, 120, 160)
//    (c) source-lesson metadata is attached to every pool question
//    (d) _sampleUnitTestAttempt produces a 25-question attempt
//    (e) attempt has balanced lesson sizes (one of 7/6/6/6 permutations)
//    (f) attempt has 8E + 10M + 7H difficulty distribution
//    (g) repeated calls produce different attempts
// =============================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const sharedG1 = fs.readFileSync(path.join(ROOT, 'src', 'data', 'shared_g1.js'), 'utf8');
const u2Built  = fs.readFileSync(path.join(ROOT, 'dist', 'data', 'g1', 'u2.js'),  'utf8');

const sandbox = {
  document: { createElement: () => ({}), head: { appendChild: () => {} } },
  console:  console,
  window:   {},
  UNITS_DATA: [],
  Math: Math, Object: Object, Array: Array, String: String, Number: Number,
  Promise: Promise, Set: Set, Map: Map,
};
sandbox.global = sandbox;
vm.createContext(sandbox);

const sharedWithExport = sharedG1 + `
this.__UNITS_DATA_G1        = _UNITS_DATA_G1;
this.__assembleUnitTestBank = _assembleUnitTestBank;
this.__sampleUnitTestAttempt= _sampleUnitTestAttempt;
this.__apportion            = _apportion;
`;
vm.runInContext(sharedWithExport, sandbox);
vm.runInContext(u2Built, sandbox);

const u2 = sandbox.__UNITS_DATA_G1[1];
const sampleAttempt = sandbox.__sampleUnitTestAttempt;

console.log('=================================================================');
console.log('G1 U2 RUNTIME AUDIT — pool + attempt model');
console.log('=================================================================');
console.log('Unit id:            ', u2.id);
console.log('Unit name:          ', u2.name);
console.log('_loaded:            ', u2._loaded);
console.log('Lessons:            ', u2.lessons.length);
console.log();

console.log('=== unitTest config (from spec, exposed at runtime) ===');
console.log('  ', JSON.stringify(u2.unitTest, null, 2));
console.log();

console.log('=== Per-lesson qBank pool sizes ===');
u2.lessons.forEach((l, i) => {
  console.log(`  L${i+1} (${l.id || '?'}): qBank=${(l.qBank || []).length}, title="${l.title || '?'}"`);
});
const totalPool = u2.lessons.reduce((s, l) => s + (l.qBank || []).length, 0);
console.log(`  TOTAL POOL: ${totalPool}`);
console.log();

const pool = u2.testBank;
console.log('=== POOL (u.testBank) ===');
console.log('  Pool exists:     ', !!pool);
console.log('  Pool size:       ', pool ? pool.length : 'N/A');
console.log('  Matches TOTAL:   ', pool ? (pool.length === totalPool ? 'YES' : 'NO ❌') : 'N/A');
console.log();

if (pool) {
  console.log('=== Per-lesson distribution in POOL ===');
  const byLessonPool = { 0: 0, 1: 0, 2: 0, 3: 0 };
  pool.forEach(q => {
    if (byLessonPool[q.sourceLessonIndex] !== undefined) byLessonPool[q.sourceLessonIndex]++;
  });
  Object.keys(byLessonPool).forEach(k => {
    console.log(`  L${Number(k)+1}: ${byLessonPool[k]}`);
  });
  console.log();

  console.log('=== Sample pool question (first) ===');
  const fq = pool[0];
  console.log('  keys:               ', Object.keys(fq).join(','));
  console.log('  sourceLessonId:     ', fq.sourceLessonId);
  console.log('  sourceLessonTitle:  ', fq.sourceLessonTitle);
  console.log('  sourceLessonIndex:  ', fq.sourceLessonIndex);
  console.log('  sourceUnitId:       ', fq.sourceUnitId);
  console.log('  d (difficulty):     ', fq.d);
  console.log('  sk (subSkill):      ', fq.sk);
  console.log('  hint:               ', fq.e);
  console.log();

  // Take a single attempt
  console.log('=== ATTEMPT 1 (sampleUnitTestAttempt(pool, 25)) ===');
  const attemptSize = (u2.unitTest && u2.unitTest.totalQuestions) || 25;
  const a1 = sampleAttempt(pool, attemptSize);
  console.log('  Attempt size:    ', a1.length);
  const a1ByLesson = { 0: 0, 1: 0, 2: 0, 3: 0 };
  a1.forEach(q => { a1ByLesson[q.sourceLessonIndex]++; });
  console.log('  By lesson:        L1=' + a1ByLesson[0] + ', L2=' + a1ByLesson[1] +
              ', L3=' + a1ByLesson[2] + ', L4=' + a1ByLesson[3]);
  const a1Diff = { e: 0, m: 0, h: 0 };
  a1.forEach(q => { a1Diff[q.d] = (a1Diff[q.d] || 0) + 1; });
  console.log('  By difficulty:    E=' + a1Diff.e + ', M=' + a1Diff.m + ', H=' + a1Diff.h);
  console.log();

  // Take a different attempt
  console.log('=== ATTEMPT 2 (independent sample) ===');
  const a2 = sampleAttempt(pool, attemptSize);
  console.log('  Attempt size:    ', a2.length);
  const a2ByLesson = { 0: 0, 1: 0, 2: 0, 3: 0 };
  a2.forEach(q => { a2ByLesson[q.sourceLessonIndex]++; });
  console.log('  By lesson:        L1=' + a2ByLesson[0] + ', L2=' + a2ByLesson[1] +
              ', L3=' + a2ByLesson[2] + ', L4=' + a2ByLesson[3]);
  const a2Diff = { e: 0, m: 0, h: 0 };
  a2.forEach(q => { a2Diff[q.d] = (a2Diff[q.d] || 0) + 1; });
  console.log('  By difficulty:    E=' + a2Diff.e + ', M=' + a2Diff.m + ', H=' + a2Diff.h);

  // Compare attempts
  const a1Ids = a1.map(q => q.id || (q.sourceLessonIndex + ':' + q.sk + ':' + q.t)).sort().join('|');
  const a2Ids = a2.map(q => q.id || (q.sourceLessonIndex + ':' + q.sk + ':' + q.t)).sort().join('|');
  console.log('  Different from A1:', a1Ids !== a2Ids ? 'YES ✓' : 'NO ❌ (same set)');
  console.log();

  // Multiple attempts: distribution of which lesson gets the +1 bonus
  console.log('=== BONUS DISTRIBUTION across 30 attempts ===');
  const bonusCount = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const distinctSets = new Set();
  for (let i = 0; i < 30; i++) {
    const a = sampleAttempt(pool, attemptSize);
    const byL = { 0: 0, 1: 0, 2: 0, 3: 0 };
    a.forEach(q => { byL[q.sourceLessonIndex]++; });
    const bonusIdx = Object.keys(byL).find(k => byL[k] === 7);
    if (bonusIdx !== undefined) bonusCount[Number(bonusIdx)]++;
    distinctSets.add(a.map(q => q.t).sort().join('|'));
  }
  console.log('  L1 got bonus: ' + bonusCount[0] + ' / 30');
  console.log('  L2 got bonus: ' + bonusCount[1] + ' / 30');
  console.log('  L3 got bonus: ' + bonusCount[2] + ' / 30');
  console.log('  L4 got bonus: ' + bonusCount[3] + ' / 30');
  console.log('  Distinct attempt sets: ' + distinctSets.size + ' / 30');
}
