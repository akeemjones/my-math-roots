// =============================================================================
//  Runtime audit — load actual built G1 U2 data and inspect testBank
//  Run: node scripts/audit-g1-u2-testbank.js
// =============================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const sharedG1 = fs.readFileSync(path.join(ROOT, 'src', 'data', 'shared_g1.js'), 'utf8');
const u2Built  = fs.readFileSync(path.join(ROOT, 'dist', 'data', 'g1', 'u2.js'),  'utf8');

// Simulate browser globals expected by shared_g1.js / data file
const sandbox = {
  document:       { createElement: () => ({}), head: { appendChild: () => {} } },
  console:        console,
  window:         {},
  UNITS_DATA:     [],
  Math:           Math,
  Object:         Object,
  Array:          Array,
  String:         String,
  Number:         Number,
  Promise:        Promise,
  Set:            Set,
  Map:            Map,
};
sandbox.global = sandbox;

vm.createContext(sandbox);

// Load shared_g1.js (defines _UNITS_DATA_G1, _mergeG1UnitData, _assembleUnitTestBank)
// Append a global-export so we can pull the const out of the VM context
const sharedWithExport = sharedG1 + '\nthis.__UNITS_DATA_G1 = _UNITS_DATA_G1;\nthis.__mergeG1UnitData = _mergeG1UnitData;\nthis.__assembleUnitTestBank = _assembleUnitTestBank;\n';
vm.runInContext(sharedWithExport, sandbox);

// Load the built U2 data file (calls _mergeG1UnitData(1, G1_U2_SPEC))
vm.runInContext(u2Built, sandbox);

const u2 = sandbox.__UNITS_DATA_G1[1];

console.log('=================================================================');
console.log('G1 U2 RUNTIME AUDIT');
console.log('=================================================================');
console.log('Unit id:    ', u2.id);
console.log('Unit name:  ', u2.name);
console.log('_loaded:    ', u2._loaded);
console.log('Lessons:    ', u2.lessons.length);
console.log();

console.log('Per-lesson qBank sizes:');
u2.lessons.forEach((l, i) => {
  console.log(`  L${i+1} (${l.id || '?'}): qBank=${(l.qBank || []).length}, title="${l.title || '?'}"`);
});
console.log();

const tb = u2.testBank;
console.log('testBank exists:    ', !!tb);
console.log('testBank length:    ', tb ? tb.length : 'N/A');
console.log();

if (tb) {
  console.log('=== TESTBANK QUESTION SAMPLE (first 3) ===');
  tb.slice(0, 3).forEach((q, i) => {
    console.log(`  [${i}] keys=${Object.keys(q).join(',')}`);
    console.log(`      d=${q.d}, sk=${q.sk}, t="${(q.t || '').slice(0, 50)}..."`);
    console.log(`      sourceLessonId=${q.sourceLessonId || 'MISSING'}`);
    console.log(`      sourceLessonTitle=${q.sourceLessonTitle || 'MISSING'}`);
    console.log(`      sourceLessonIndex=${q.sourceLessonIndex !== undefined ? q.sourceLessonIndex : 'MISSING'}`);
  });
  console.log();

  console.log('=== DIFFICULTY DISTRIBUTION ===');
  const easy   = tb.filter(q => q.d === 'e').length;
  const medium = tb.filter(q => q.d === 'm').length;
  const hard   = tb.filter(q => q.d === 'h').length;
  const other  = tb.length - easy - medium - hard;
  console.log(`  easy   (d='e'): ${easy}`);
  console.log(`  medium (d='m'): ${medium}`);
  console.log(`  hard   (d='h'): ${hard}`);
  console.log(`  other (no d):   ${other}`);
  console.log();

  console.log('=== PER-LESSON DISTRIBUTION (via sourceLessonId metadata) ===');
  const bySource = {};
  tb.forEach(q => {
    const lid = q.sourceLessonId || 'NO_SOURCE_METADATA';
    bySource[lid] = (bySource[lid] || 0) + 1;
  });
  Object.entries(bySource).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log();

  console.log('=== PER-LESSON DISTRIBUTION (via reference equality with lesson qBanks) ===');
  // Try to match each testBank question back to its source lesson by reference
  const lessonMatch = { l1: 0, l2: 0, l3: 0, l4: 0, unknown: 0 };
  tb.forEach(q => {
    let matched = false;
    u2.lessons.forEach((l, idx) => {
      if (matched) return;
      if ((l.qBank || []).some(lq => lq === q || (lq.t === q.t && lq.sk === q.sk && lq.d === q.d))) {
        lessonMatch['l' + (idx + 1)]++;
        matched = true;
      }
    });
    if (!matched) lessonMatch.unknown++;
  });
  Object.entries(lessonMatch).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log();

  // Difficulty per lesson (using whichever metadata works)
  console.log('=== DIFFICULTY-PER-LESSON (via reference matching) ===');
  u2.lessons.forEach((l, idx) => {
    const inLesson = tb.filter(q => (l.qBank || []).some(lq =>
      lq === q || (lq.t === q.t && lq.sk === q.sk && lq.d === q.d)
    ));
    const e = inLesson.filter(q => q.d === 'e').length;
    const m = inLesson.filter(q => q.d === 'm').length;
    const h = inLesson.filter(q => q.d === 'h').length;
    console.log(`  L${idx+1}: ${inLesson.length} questions (E=${e}, M=${m}, H=${h})`);
  });
}
