#!/usr/bin/env node
// scripts/audit_grade2_phase2.js
// Validates Grade 2 Phase 2 activation gates against NORMALIZED questions.
// Usage: node scripts/audit_grade2_phase2.js --unit u1
//        node scripts/audit_grade2_phase2.js --unit u2
// Unit-aware: loads src/data/<unit>.js and reads scripts/<unit>_review.txt.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const unitArg = (args.find(a => a.startsWith('--unit=')) || '').split('=')[1]
              || (args[args.indexOf('--unit') + 1] || 'u1');

// ───── Build a sandbox and load the engine + data ─────
const sandbox = {
  console,
  globalThis: null,
  document: { createElement: () => ({}), head: { appendChild: () => {} } },
  location: { search: '' },
  localStorage: { getItem: () => null, setItem: () => {} },
  window: {},
  Promise,
  Array, Object, String, Number, Boolean, JSON, Math, RegExp, Date, Error,
  parseInt, parseFloat, isNaN, isFinite,
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);

function loadFile(rel, exportNames){
  let src = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
  if(Array.isArray(exportNames) && exportNames.length){
    // Re-export const/let bindings to globalThis so subsequent runInContext can see them
    src += '\n' + exportNames.map(n => `try{globalThis.${n}=${n};}catch(e){}`).join('\n') + '\n';
  }
  vm.runInContext(src, ctx, { filename: rel });
}

loadFile('src/question-engine.js', ['QE']);
loadFile('src/data/shared.js', ['UNITS_DATA','_mergeUnitData','_loadUnit','_lessonContextFor','q','_ICO']);

// Capture u1 payload via _mergeUnitData
sandbox._capturedUnits = {};
const origMerge = sandbox._mergeUnitData;
sandbox._mergeUnitData = function(idx, data){
  sandbox._capturedUnits[idx] = data;
  return origMerge(idx, data);
};
loadFile('src/data/' + unitArg + '.js');

const unitIdx = parseInt(unitArg.replace(/^u/, ''), 10) - 1;
const unitData = sandbox._capturedUnits[unitIdx];
const unitMeta = sandbox.UNITS_DATA[unitIdx];
if(!unitData || !unitMeta){ console.error('FATAL: unit', unitArg, 'not loaded'); process.exit(1); }

// ───── Gate counters ─────
const gates = {
  missingLessonId: 0,
  malformedLessonId: 0,
  unmappedLessonId: 0,
  missingTagsAfterNormalize: 0,
  emptyTagsAfterNormalize: 0,
  errStarInTags: 0,
  missingIntervention: 0,
  missingTeachText: 0,
  emptyRetryMatchTags: 0,
  wrongOptionMissingErrStar: 0,
  correctOptionWithErrStar: 0,
  duplicateOptions: 0,
  outOfRangeAnswerIndex: 0,
  errRandomFound: 0,
  bareStringOptionArrays: 0,
  negativeDistractors: 0, // Hard-fail: any negative-integer distractor in u2+ Place Value
};
const reports = {
  ambiguousLessonIds: 0,
  errConfusedCount: 0,
  errSkipCountErrorCount: 0,
  errMagnitudeErrorCount: 0,
  totalQuestions: 0,
  totalWrongOptions: 0,
  totalErrTagCounts: {},
  totalPatternTagCounts: {},
  questionsByLesson: {},
  optionObjectsTotal: 0,
};

const errors = [];
function fail(where, msg){ errors.push(where + ': ' + msg); }

// ───── Build valid lessonId set ─────
const validLessonIds = new Set();
unitMeta.lessons.forEach(l => validLessonIds.add(l.id));

// ───── Walk each pool ─────
function walkPool(pool, where){
  if(!Array.isArray(pool)) return;
  pool.forEach((raw, i) => {
    reports.totalQuestions++;
    const tag0 = `${where}[${i}]`;

    // lessonId checks
    if(!raw.lessonId){ gates.missingLessonId++; fail(tag0, 'missing lessonId'); }
    else if(!/^k?u\d+l\d+$/.test(raw.lessonId)){ gates.malformedLessonId++; fail(tag0, 'malformed lessonId: ' + raw.lessonId); }
    else if(!validLessonIds.has(raw.lessonId)){ gates.unmappedLessonId++; fail(tag0, 'unmapped lessonId: ' + raw.lessonId); }

    // Per-lesson count
    if(raw.lessonId){
      reports.questionsByLesson[raw.lessonId] = (reports.questionsByLesson[raw.lessonId] || 0) + 1;
    }

    // Bare-string options gate (must be 0)
    if(Array.isArray(raw.o)){
      const anyBare = raw.o.some(x => typeof x === 'string' || typeof x === 'number');
      if(anyBare){
        gates.bareStringOptionArrays++;
        fail(tag0, 'bare-string options remain');
      } else {
        reports.optionObjectsTotal += raw.o.length;
      }
    }

    // Answer index gate
    if(!Array.isArray(raw.o) || !Number.isInteger(raw.a) || raw.a < 0 || raw.a >= raw.o.length){
      gates.outOfRangeAnswerIndex++;
      fail(tag0, 'out-of-range answer index a=' + raw.a);
    }

    // Duplicate options
    if(Array.isArray(raw.o)){
      const vals = raw.o.map(x => typeof x === 'object' && x !== null ? x.val : String(x));
      const seen = new Set();
      let dup = false;
      vals.forEach(v => { if(seen.has(v)) dup = true; seen.add(v); });
      if(dup){ gates.duplicateOptions++; fail(tag0, 'duplicate options: ' + vals.join('|')); }
    }

    // Option-level err_* checks
    if(Array.isArray(raw.o)){
      raw.o.forEach((opt, oi) => {
        if(typeof opt !== 'object' || opt === null) return;
        const isCorrect = (oi === raw.a);
        if(isCorrect && typeof opt.tag === 'string' && opt.tag.startsWith('err_')){
          gates.correctOptionWithErrStar++;
          fail(tag0+'.o['+oi+']', 'correct answer has err_* tag: ' + opt.tag);
        }
        if(!isCorrect){
          reports.totalWrongOptions++;
          if(!opt.tag || typeof opt.tag !== 'string' || !opt.tag.startsWith('err_')){
            gates.wrongOptionMissingErrStar++;
            fail(tag0+'.o['+oi+']', 'wrong option missing err_* tag');
          } else if(opt.tag === 'err_random'){
            gates.errRandomFound++;
            fail(tag0+'.o['+oi+']', 'err_random forbidden');
          } else {
            reports.totalErrTagCounts[opt.tag] = (reports.totalErrTagCounts[opt.tag] || 0) + 1;
          }
          if(opt.patternTag && typeof opt.patternTag === 'string'){
            reports.totalPatternTagCounts[opt.patternTag] = (reports.totalPatternTagCounts[opt.patternTag] || 0) + 1;
          }
          // Negative-distractor hard-fail check (Place Value u2+ never asks negatives)
          const valStr = typeof opt.val === 'string' ? opt.val : String(opt.val);
          if(/^-\d+$/.test(valStr.trim())){
            gates.negativeDistractors++;
            fail(tag0+'.o['+oi+']', 'negative distractor: ' + valStr);
          }
        }
        if(opt.tag === 'err_confused') reports.errConfusedCount++;
        if(opt.tag === 'err_skip_count_error') reports.errSkipCountErrorCount++;
        if(opt.tag === 'err_magnitude_error') reports.errMagnitudeErrorCount++;
      });
    }

    // ── Normalize and check post-normalize gates ──
    const lessonCtx = sandbox._lessonContextFor(raw);
    const norm = sandbox.QE.normalize(raw, lessonCtx);

    if(!Array.isArray(norm.tags)){ gates.missingTagsAfterNormalize++; fail(tag0, 'missing tags[] after normalize'); }
    else if(norm.tags.length === 0){ gates.emptyTagsAfterNormalize++; fail(tag0, 'empty tags[] after normalize'); }
    else if(norm.tags.some(t => typeof t === 'string' && t.startsWith('err_'))){
      gates.errStarInTags++; fail(tag0, 'err_* found inside tags[]');
    }

    if(!norm.intervention){ gates.missingIntervention++; fail(tag0, 'missing intervention after normalize'); }
    else {
      if(!norm.intervention.teach || !norm.intervention.teach.text){
        gates.missingTeachText++; fail(tag0, 'missing intervention.teach.text');
      }
      if(!norm.intervention.retry || !Array.isArray(norm.intervention.retry.matchTags) || norm.intervention.retry.matchTags.length === 0){
        gates.emptyRetryMatchTags++; fail(tag0, 'empty retry.matchTags');
      }
    }
  });
}

unitData.lessons.forEach(l => walkPool(l.qBank, 'qBank.' + l.id));
walkPool(unitData.testBank, 'testBank');
walkPool(unitData.unitQuiz, 'unitQuiz');

// Read review file for ambiguous count
const reviewPath = path.join(REPO_ROOT, 'scripts', unitArg + '_review.txt');
if(fs.existsSync(reviewPath)){
  reports.ambiguousLessonIds = fs.readFileSync(reviewPath, 'utf8').split('\n').filter(l => l.trim()).length;
}

// ───── Output ─────
const totalGateFailures = Object.values(gates).reduce((s,v) => s+v, 0);
console.log('=== audit_grade2_phase2 unit:', unitArg, '===');
console.log('Lesson IDs valid:', Array.from(validLessonIds).join(', '));
console.log('Total questions:', reports.totalQuestions);
console.log('Questions by lesson:', JSON.stringify(reports.questionsByLesson));
console.log('Total option objects validated:', reports.optionObjectsTotal);
console.log('');
console.log('--- GATES (must all be 0) ---');
Object.entries(gates).forEach(([k, v]) => {
  const flag = v === 0 ? 'OK' : 'FAIL';
  console.log(`  [${flag}] ${k}: ${v}`);
});
console.log('');
console.log('--- REPORTS (informational) ---');
console.log('  ambiguousLessonIds (low-confidence classification):', reports.ambiguousLessonIds);
console.log('  Total wrong options:', reports.totalWrongOptions);
console.log('  err_confused count (fallback, needs review):', reports.errConfusedCount);
const confusedPct = reports.totalWrongOptions > 0
  ? (reports.errConfusedCount / reports.totalWrongOptions * 100)
  : 0;
console.log('  err_confused percent:', confusedPct.toFixed(2) + '%');
const CONFUSED_THRESHOLD_PCT = 15;
const overThreshold = confusedPct > CONFUSED_THRESHOLD_PCT;
console.log('  err_confused threshold (≤' + CONFUSED_THRESHOLD_PCT + '%):',
  overThreshold ? 'OVER (review required)' : 'OK');
console.log('  err_skip_count_error count:', reports.errSkipCountErrorCount);
console.log('  err_magnitude_error count:', reports.errMagnitudeErrorCount);
console.log('');
console.log('--- err_* TAG TALLIES (wrong options) ---');
Object.entries(reports.totalErrTagCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
  console.log('  ' + k + ': ' + v);
});
console.log('');
console.log('--- patternTag TALLIES (wrong options) ---');
Object.entries(reports.totalPatternTagCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
  console.log('  ' + k + ': ' + v);
});
console.log('');
if(totalGateFailures === 0 && !overThreshold){
  console.log('STATUS: PASS');
  process.exit(0);
} else if(totalGateFailures === 0 && overThreshold){
  console.log('STATUS: REVIEW  (gates pass, but err_confused ' + confusedPct.toFixed(2) +
    '% exceeds ' + CONFUSED_THRESHOLD_PCT + '% threshold — strengthen heuristics or document acceptance)');
  process.exit(2);
} else {
  console.log('STATUS: FAIL  (' + totalGateFailures + ' gate violations)');
  console.log('First 20 errors:');
  errors.slice(0, 20).forEach(e => console.log('  ', e));
  process.exit(1);
}
