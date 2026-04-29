// scripts/u8_spotcheck.js — read-only sampler for U8 manual review (20 items)
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const sandbox = { console, Math, JSON, Date };
sandbox.window = sandbox;
sandbox.location = { search: '' };
const _ls = {};
sandbox.localStorage = {
  getItem: k => (k in _ls ? _ls[k] : null),
  setItem: (k,v) => { _ls[k] = String(v); },
  removeItem: k => { delete _ls[k]; },
  clear: () => {}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(REPO_ROOT,'src/data/shared.js'),'utf8'), sandbox);
['u1','u2','u3','u4','u5','u6','u7','u8'].forEach(u => {
  const f = path.join(REPO_ROOT,'src/data',u+'.js');
  if(fs.existsSync(f)) vm.runInContext(fs.readFileSync(f,'utf8'), sandbox);
});

const harness = `
const u8 = UNITS_DATA.find(u => u.id === 'u8');
const samples = [];
['u8l1','u8l2','u8l3'].forEach(lid => {
  const l = u8.lessons.find(x => x.id === lid);
  const seed = parseInt(lid.slice(-1)) * 17;
  const picks = [];
  for(let i=0;i<5; i++){
    const idx = (i*7 + seed) % l.qBank.length;
    if(l.qBank[idx]) picks.push(l.qBank[idx]);
  }
  samples.push({label: lid, items: picks});
});
const uq = u8.unitQuiz || [];
const uqPicks = [];
for(let i=0;i<5; i++){
  const idx = (i*5 + 1) % uq.length;
  if(uq[idx]) uqPicks.push(uq[idx]);
}
samples.push({label: 'unitQuiz', items: uqPicks});

let confusedCount = 0;
let total = 0;
samples.forEach(s => {
  console.log('\\n=== ' + s.label + ' ===');
  s.items.forEach((q,i) => {
    total++;
    console.log('[' + (i+1) + '] ' + (q.t || q.prompt || '').slice(0, 140));
    console.log('    lessonId=' + q.lessonId + ' tags=' + JSON.stringify(q.tags));
    const opts = q.o || q.options || [];
    let qConfused = false;
    opts.forEach((o, j) => {
      const correct = j === (q.a !== undefined ? q.a : -1);
      const tag = (typeof o === 'object' && o.tag) ? o.tag : '(plain)';
      const ptag = (typeof o === 'object' && o.patternTag) ? o.patternTag : '';
      const val = (typeof o === 'object') ? o.val : o;
      const mark = correct ? 'C' : ' ';
      console.log('    [' + mark + '] ' + JSON.stringify(val) + ' tag=' + tag + (ptag ? ' patternTag=' + ptag : ''));
      if(!correct && tag === 'err_confused') qConfused = true;
    });
    if(qConfused) confusedCount++;
  });
});
console.log('\\n--- Summary ---');
console.log('total=' + total + ' qWithErrConfused=' + confusedCount);
`;
vm.runInContext(harness, sandbox);
