// scripts/u8_borderline_check.js — locate borderline "fraction equals 1 whole" item
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const sandbox = { console, Math, JSON, Date };
sandbox.window = sandbox;
sandbox.location = { search: '' };
sandbox.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(REPO_ROOT, 'src/data/shared.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(REPO_ROOT, 'src/data/u8.js'), 'utf8'), sandbox);

const harness = `
const u = UNITS_DATA.find(x => x.id === 'u8');
const matches = [];
function scan(arr, where){
  if(!Array.isArray(arr)) return;
  arr.forEach(q => {
    const t = q.t || q.prompt || '';
    const optStr = JSON.stringify(q.o || q.options || []);
    if(/2\\/2/.test(optStr) && /whole|equal/i.test(t)){
      matches.push({ where: where, t: t, lessonId: q.lessonId, a: q.a, opts: q.o || q.options });
    }
  });
}
u.lessons.forEach(l => scan(l.qBank, 'qBank/' + l.id));
scan(u.testBank, 'testBank');
scan(u.unitQuiz, 'unitQuiz');
console.log('matches=' + matches.length);
matches.slice(0, 10).forEach((r, i) => {
  console.log('\\n[' + (i+1) + '] ' + r.where + ' lessonId=' + r.lessonId);
  console.log('    prompt: ' + r.t.slice(0, 200));
  console.log('    correct index: ' + r.a);
  (r.opts || []).forEach((o, j) => {
    const correct = j === r.a;
    const val = (typeof o === 'object') ? o.val : o;
    const tag = (typeof o === 'object' && o.tag) ? o.tag : '(plain)';
    const ptag = (typeof o === 'object' && o.patternTag) ? o.patternTag : '';
    console.log('    [' + (correct ? 'C' : ' ') + '] ' + JSON.stringify(val) + ' tag=' + tag + (ptag ? ' patternTag=' + ptag : ''));
  });
});
`;
vm.runInContext(harness, sandbox);
