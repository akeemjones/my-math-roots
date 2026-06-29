#!/usr/bin/env node
// scripts/retighten_u4l1_addition.js
// Tighten Grade-2 u4l1 "Adding Really Big Numbers" to addition-only (TEKS 2.4B/C/D).
//   - MOVE off-topic questions into their natural sibling lessons (de-duped):
//       place-value "how many hundreds" -> u2l1 ; rounding/estimation -> u4l3 ; subtraction -> u4l2
//   - REMOVE exact duplicates already present in the destination (base-10 "blocks show?",
//       "expanded form", the 155 rounding) instead of moving them.
//   - FIX the [113] "between 50 and 90" constraint bug.
//   - ADD new verified 3-digit + 2-digit addition questions (the under-served bucket).
// Re-emits src/data/u4.js (and src/data/u2.js if any place-value survive de-dup).
//
// DRY RUN by default (prints the action plan, writes nothing). Pass --apply to write.
// Backups + git tag are run as EXPLICIT terminal commands BEFORE --apply.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

// ---- sandbox load (capture _mergeUnitData payloads) ----
const sandbox = { console, globalThis: null,
  document: { createElement: () => ({ style:{}, appendChild(){}, setAttribute(){} }), head: { appendChild(){} } },
  location: { search: '' }, localStorage: { getItem: () => null, setItem(){} }, window: {} };
Object.assign(sandbox, { Promise, Array, Object, String, Number, Boolean, JSON, Math, RegExp, Date, Error, parseInt, parseFloat, isNaN, isFinite });
sandbox.globalThis = sandbox; sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);
function loadFile(rel, ex){ let src = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
  if (Array.isArray(ex) && ex.length) src += '\n' + ex.map(n=>`try{globalThis.${n}=${n};}catch(e){}`).join('\n') + '\n';
  vm.runInContext(src, ctx, { filename: rel }); }
loadFile('src/question-engine.js', ['QE']);
loadFile('src/data/shared.js', ['UNITS_DATA','_mergeUnitData','_loadUnit','_lessonContextFor','q','_ICO']);
sandbox._capturedUnits = {};
const om = sandbox._mergeUnitData;
sandbox._mergeUnitData = function(i,d){ sandbox._capturedUnits[i]=d; return om(i,d); };
loadFile('src/data/u2.js');
loadFile('src/data/u4.js');
const u2 = sandbox._capturedUnits[1];
const u4 = sandbox._capturedUnits[3];

const u4l1 = u4.lessons[0].qBank;       // lessonId u4l1
const u4l2 = u4.lessons[1].qBank;       // lessonId u4l2 (subtraction)
const u4l3 = u4.lessons[2].qBank;       // lessonId u4l3 (rounding/estimation)
const u2l1 = u2.lessons[0].qBank;       // lessonId u2l1 (place value)

const norm = s => String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const destHas = (pool, t) => pool.some(q => norm(q.t) === norm(t));

// ---- classify each u4l1 question into an action ----
function classify(qq){
  const t = String(qq.t||''); const e = String(qq.e||'');
  // place value
  if (/expanded form/i.test(t)) return { act:'REMOVE_DUP', why:'expanded form -> already in u2l2' };
  if (/base-?10 blocks show/i.test(t) || /what number do these base-?10 blocks show/i.test(t))
    return { act:'REMOVE_DUP', why:'base-10 blocks identify -> already in u2l1' };
  if (/how many hundreds are shown/i.test(t))
    return { act:'MOVE', dest:'u2l1', why:'place-value identification' };
  // rounding / estimation
  if (/\bround(s|ed|ing)?\b/i.test(t) || /nearest\s+(ten|hundred)/i.test(t))
    return destHas(u4l3, t) ? { act:'REMOVE_DUP', why:'rounding -> already in u4l3' }
                            : { act:'MOVE', dest:'u4l3', why:'rounding' };
  if (/without solving/i.test(t) && /(closer to|greater than|less than|more than)/i.test(t))
    return { act:'MOVE', dest:'u4l3', why:'estimation' };
  if (/closer to\s+\d/i.test(t))
    return { act:'MOVE', dest:'u4l3', why:'estimation' };
  // subtraction word problems (explanation literally subtracts) + give-away multi-step
  if (/subtract the (ones|tens)/i.test(e))
    return { act:'MOVE', dest:'u4l2', why:'subtraction word problem' };
  if (/add back/i.test(e) && /(gave|gives)/i.test(t))
    return { act:'MOVE', dest:'u4l2', why:'give-away multi-step (subtraction framing)' };
  // [113] constraint bug
  if (/between 50 and 90/i.test(t)) return { act:'FIX_113' };
  return { act:'KEEP' };
}

// ---- new 3d+2d addition questions (deterministic, verified) ----
// pairs chosen to span: no-regroup, ones-regroup, tens-regroup, double-regroup.
const NEW_PAIRS = [
  [234,52],[145,23],[612,45],[503,41],[720,35],   // no regroup
  [247,36],[358,27],[419,65],[526,48],            // ones regroup
  [174,92],[283,91],[167,85],[239,84],[462,79],   // tens / double regroup
];
function digitsOnes(n){return n%10;}
function buildAddQ(A,B){
  const S=A+B;
  const onesCarry=(A%10)+(B%10)>=10;
  const tensCarry=(Math.floor(A/10)%10)+(B%10>=0?Math.floor(B/10)%10:0)+(onesCarry?1:0)>=10;
  const regroup=onesCarry||tensCarry;
  const diff='e'; // refined below
  const low=S-10, high=S+10, wrongOp=A-B;
  // distinctness guard
  const vals=new Set([S,low,high,wrongOp]);
  if(vals.size!==4) throw new Error('option collision for '+A+'+'+B);
  if([low,high,wrongOp].some(v=>v<=0)) throw new Error('non-positive distractor for '+A+'+'+B);
  const o=[
    { val:String(S), tag:null, patternTag:null },
    { val:String(low),  tag: regroup?'err_no_regroup':'err_under_count', patternTag: regroup?'pattern_forgot_regroup':'pattern_too_low' },
    { val:String(high), tag:'err_over_count', patternTag:'pattern_too_high' },
    { val:String(wrongOp), tag:'err_wrong_operation', patternTag:'pattern_wrong_operation' },
  ];
  // explanation
  const o1=A%10, o2=B%10, onesSum=o1+o2;
  const t1=Math.floor(A/10)%10, t2=Math.floor(B/10)%10, tensSum=t1+t2+(onesCarry?1:0);
  const h=Math.floor(A/100)%10 + (tensCarry?1:0);
  const hA=Math.floor(A/100)%10;
  let e='First, add the ones: '+o1+' + '+o2+' = '+onesSum+(onesCarry?', so write '+(onesSum%10)+' and carry 1 ten':'')+'. ';
  e+='Next, add the tens: '+t1+' + '+t2+(onesCarry?' + 1':'')+' = '+tensSum+(tensCarry?', so write '+(tensSum%10)+' and carry 1 hundred':'')+'. ';
  e+=tensCarry
      ? 'Then the hundreds: '+hA+' + 1 = '+h+'. '
      : 'Finally, bring down the hundreds: '+hA+'. ';
  e+='The answer is '+S+'! 🧠';
  return { t:'What is '+A+' + '+B+'?', o, a:0, e, d: regroup?'m':'e',
    h:'Line up the numbers by place value and add from the ones column. Carry to the next place whenever a column makes 10 or more!',
    lessonId:'u4l1' };
}

// ---- execute classification ----
const tally={REMOVE_DUP:0,MOVE:0,FIX_113:0,KEEP:0};
const moves={u2l1:[],u4l3:[],u4l2:[]};
const removed=[];
const kept=[];
let fix113=null;
u4l1.forEach((qq,i)=>{
  const c=classify(qq);
  tally[c.act==='MOVE'?'MOVE':c.act]++;
  if(c.act==='KEEP'){ kept.push(qq); }
  else if(c.act==='FIX_113'){ fix113=qq; kept.push(qq); }
  else if(c.act==='REMOVE_DUP'){ removed.push({i,t:qq.t,why:c.why}); }
  else if(c.act==='MOVE'){ moves[c.dest].push(qq); }
  console.log(`[${String(i).padStart(3)}] ${c.act}${c.dest?'->'+c.dest:''}  ${c.why||''}  :: ${String(qq.t).replace(/\s+/g,' ').slice(0,72)}`);
});

console.log('\n=== ACTION TALLY ===', JSON.stringify(tally));
console.log('kept u4l1:', kept.length, '| move->u2l1:', moves.u2l1.length, '| move->u4l3:', moves.u4l3.length, '| move->u4l2:', moves.u4l2.length, '| removed dup:', removed.length);

// fix [113]
if(fix113){
  const before=fix113.t;
  fix113.t='__ + __ = 83. Which pair of numbers works?';
  console.log('\nFIX [113]:\n  BEFORE: '+before+'\n  AFTER : '+fix113.t);
}

// build new 3d+2d, skipping any prompt already present in the kept bank
const existingT=new Set(kept.map(q=>norm(q.t)));
const newQs=[];
NEW_PAIRS.forEach(([A,B])=>{ const q=buildAddQ(A,B); if(existingT.has(norm(q.t))){console.log('skip dup new:',q.t);return;} newQs.push(q); });
console.log('\n=== NEW 3d+2d QUESTIONS ('+newQs.length+') ===');
newQs.forEach(q=>console.log('  '+q.t+'  => '+q.o[0].val+'   (d='+q.d+')  distractors: '+q.o.slice(1).map(o=>o.val).join(', ')));
if(!APPLY){
  console.log('\n--- sample explanations (no-regroup / ones-regroup / double-regroup) ---');
  [0,5,9].forEach(k=>console.log('  ['+newQs[k].t+'] '+newQs[k].e));
}

// assemble final u4l1 = kept + new
const finalU4l1 = kept.concat(newQs);
// set moved questions' lessonId to destination + append
moves.u2l1.forEach(q=>q.lessonId='u2l1');
moves.u4l3.forEach(q=>q.lessonId='u4l3');
moves.u4l2.forEach(q=>q.lessonId='u4l2');

console.log('\n=== FINAL COUNTS ===');
console.log('u4l1:', u4l1.length, '->', finalU4l1.length);
console.log('u4l2:', u4l2.length, '->', u4l2.length+moves.u4l2.length);
console.log('u4l3:', u4l3.length, '->', u4l3.length+moves.u4l3.length);
console.log('u2l1:', u2l1.length, '->', u2l1.length+moves.u2l1.length);

if(!APPLY){ console.log('\n[DRY RUN] no files written. Re-run with --apply to write.'); process.exit(0); }

// ---- APPLY: mutate arrays and re-emit ----
u4.lessons[0].qBank = finalU4l1;
moves.u4l2.forEach(q=>u4l2.push(q));
moves.u4l3.forEach(q=>u4l3.push(q));
moves.u2l1.forEach(q=>u2l1.push(q));

const u4Header='// Unit 4: Add & Subtract to 1,000\n';
fs.writeFileSync(path.join(REPO_ROOT,'src','data','u4.js'), u4Header+'_mergeUnitData(3, '+JSON.stringify(u4)+');\n','utf8');
if(moves.u2l1.length){
  const u2Header='// Unit 2: Place Value\n';
  fs.writeFileSync(path.join(REPO_ROOT,'src','data','u2.js'), u2Header+'_mergeUnitData(1, '+JSON.stringify(u2)+');\n','utf8');
  console.log('Wrote src/data/u2.js (+'+moves.u2l1.length+' place-value)');
}
console.log('Wrote src/data/u4.js');
