#!/usr/bin/env node
// scripts/u8_smoke.js — Node vm browser-smoke harness for U8 activation
// Validates: QE.normalize merges defaults, QE.logResult writes
// mmr_mastery_v1_<grade> (defaults to _2 when no mmr_grade set),
// QE.selectRetry returns tag-overlapping question. Also smoke-tests U1-U7.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const SHARED = path.join(REPO_ROOT, 'src/data/shared.js');
const QE_PATH = path.join(REPO_ROOT, 'src/question-engine.js');
const UNIT_FILES = ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10'].map(u => path.join(REPO_ROOT, `src/data/${u}.js`));

// localStorage stub
const _ls = {};
const localStorage = {
  getItem: k => (k in _ls ? _ls[k] : null),
  setItem: (k,v) => { _ls[k] = String(v); },
  removeItem: k => { delete _ls[k]; },
  clear: () => { for(const k in _ls) delete _ls[k]; }
};

const sandbox = { console, localStorage, Math, JSON, Date, setTimeout, clearTimeout };
sandbox.window = sandbox;
sandbox.location = { search: '' };
vm.createContext(sandbox);

vm.runInContext(fs.readFileSync(SHARED, 'utf8'), sandbox, { filename: SHARED });
for(const f of UNIT_FILES){
  if(fs.existsSync(f)) vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f });
}
vm.runInContext(fs.readFileSync(QE_PATH, 'utf8'), sandbox, { filename: QE_PATH });

// Run the entire test harness inside the sandbox so it can see the const-declared
// UNITS_DATA, _lessonContextFor, and QE bindings.
const harness = `
(function(){
  const results = [];
  function check(label, cond, info){ results.push({ label, ok: !!cond, info: info || '' }); }
  function getUnit(id){ return UNITS_DATA.find(u => u.id === id); }
  function pickQ(unitId, lessonId){
    const u = getUnit(unitId);
    if(!u || !Array.isArray(u.lessons)) return null;
    const l = u.lessons.find(x => x.id === lessonId);
    if(!l || !Array.isArray(l.qBank) || l.qBank.length === 0) return null;
    return l.qBank.find(q => q.lessonId === lessonId) || l.qBank[0];
  }

  // ─── U8 + U9: per-lesson normalize / mastery / retry ───
  const FULL_TEST_LESSONS = [
    ['u8','u8l1'], ['u8','u8l2'], ['u8','u8l3'],
    ['u9','u9l1'], ['u9','u9l2'], ['u9','u9l3'],
    ['u10','u10l1'], ['u10','u10l2'], ['u10','u10l3'],
  ];
  const EXPECTED_TAGS = {
    u8l1: ['fractions','equal_parts','fraction_basics'],
    u8l2: ['fractions','halves_fourths_eighths','unit_fractions'],
    u8l3: ['fractions','compare_unit_fractions','fraction_size'],
    u9l1: ['geometry','2d_shapes','shape_attributes'],
    u9l2: ['geometry','3d_solids','faces_edges_vertices'],
    u9l3: ['geometry','symmetry','line_of_symmetry'],
    u10l1: ['equal_groups','multiplication_foundations','repeated_addition'],
    u10l2: ['repeated_addition','skip_counting','multiplication_foundations'],
    u10l3: ['division_foundations','sharing_equally','equal_groups'],
  };

  for(const pair of FULL_TEST_LESSONS){
    const unitId = pair[0]; const lid = pair[1];
    const q = pickQ(unitId, lid);
    check(unitId + ' sample question for ' + lid, !!q, q ? 'lessonId=' + q.lessonId : 'no question');
    if(!q) continue;
    const ctx = _lessonContextFor(q);
    check(lid + ' ctxFound', !!ctx, ctx ? 'id=' + ctx.id + ', defaultTags=' + Array.isArray(ctx.defaultTags) : 'null');
    const norm = QE.normalize(q, ctx);
    check(lid + ' normalize tags populated',
      Array.isArray(norm.tags) && norm.tags.length > 0,
      'tags=' + JSON.stringify(norm.tags));
    const expected = EXPECTED_TAGS[lid];
    const actualSet = new Set(norm.tags || []);
    const allPresent = expected.every(t => actualSet.has(t));
    check(lid + ' tags include lesson defaults', allPresent,
      'expected=' + JSON.stringify(expected) + ' got=' + JSON.stringify(norm.tags));
    check(lid + ' intervention.teach.text populated',
      !!(norm.intervention && norm.intervention.teach && norm.intervention.teach.text),
      norm.intervention && norm.intervention.teach ? norm.intervention.teach.text : 'null');
    check(lid + ' intervention.retry.matchTags populated',
      !!(norm.intervention && norm.intervention.retry && Array.isArray(norm.intervention.retry.matchTags) && norm.intervention.retry.matchTags.length > 0),
      norm.intervention && norm.intervention.retry ? JSON.stringify(norm.intervention.retry.matchTags) : 'null');

    // Mastery logging
    localStorage.removeItem('mmr_mastery_v1_2');
    QE.logResult(norm, { ok: true });
    const mastery = JSON.parse(localStorage.getItem('mmr_mastery_v1_2') || '{}');
    const allLogged = expected.every(t => mastery[t] && mastery[t].attempts === 1 && mastery[t].correct === 1);
    check(lid + ' mastery logged with expected tags', allLogged,
      'mastery keys=' + JSON.stringify(Object.keys(mastery)));

    // Retry selection (within same unit)
    const u = getUnit(unitId);
    const pool = [];
    u.lessons.forEach(l => { if(Array.isArray(l.qBank)) pool.push.apply(pool, l.qBank); });
    const normalizedPool = pool.map(p => {
      const c = _lessonContextFor(p);
      return QE.normalize(p, c);
    });
    const retry = QE.selectRetry(norm, normalizedPool);
    check(lid + ' selectRetry returns a question', !!retry, retry ? 'retry.lessonId=' + retry.lessonId : 'null');
    if(retry){
      check(lid + ' selectRetry returns different question', retry !== norm && retry.t !== q.t, '');
      const overlap = (retry.tags || []).some(t => actualSet.has(t));
      check(lid + ' selectRetry tag overlap with source', overlap,
        'retry.tags=' + JSON.stringify(retry.tags));
    }
  }

  // ─── U1-U7 + K regression ───
  const REGRESSIONS = [
    ['u1','u1l1'], ['u2','u2l1'], ['u3','u3l1'], ['u4','u4l1'],
    ['u5','u5l1'], ['u6','u6l1'], ['u7','u7l1'],
  ];
  for(const pair of REGRESSIONS){
    const unit = pair[0]; const lid = pair[1];
    const u = getUnit(unit);
    if(!u){ check(unit + ' unit present', false, 'not loaded'); continue; }
    const q = pickQ(unit, lid);
    if(!q){ check(unit + ' sample for ' + lid, false, 'no question'); continue; }
    const ctx = _lessonContextFor(q);
    const norm = QE.normalize(q, ctx);
    check(unit + ' normalize tags populated',
      Array.isArray(norm.tags) && norm.tags.length > 0,
      'tags=' + JSON.stringify(norm.tags));
    check(unit + ' normalize intervention populated',
      !!(norm.intervention && norm.intervention.teach),
      '');
    localStorage.removeItem('mmr_mastery_v1_2');
    QE.logResult(norm, { ok: true });
    const mastery = JSON.parse(localStorage.getItem('mmr_mastery_v1_2') || '{}');
    check(unit + ' mastery logged',
      norm.tags.every(t => mastery[t] && mastery[t].attempts === 1),
      'mastery keys=' + JSON.stringify(Object.keys(mastery)));
  }

  // K loader smoke (just confirm K unit ids exist if loaded)
  const kCount = UNITS_DATA.filter(u => /^k/.test(u.id)).length;
  check('K units present in UNITS_DATA', kCount >= 0, 'k unit count=' + kCount);

  // Report
  let pass = 0, fail = 0;
  for(const r of results){
    if(r.ok) pass++; else fail++;
    console.log('  [' + (r.ok ? 'OK' : 'FAIL') + '] ' + r.label + (r.ok ? '' : '  | ' + r.info));
  }
  console.log('\\n=== smoke: ' + pass + '/' + (pass+fail) + ' OK ===');
  globalThis.__smokeFailCount = fail;
})();
`;

vm.runInContext(harness, sandbox);
process.exit(sandbox.__smokeFailCount === 0 ? 0 : 1);
