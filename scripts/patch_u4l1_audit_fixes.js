#!/usr/bin/env node
// scripts/patch_u4l1_audit_fixes.js
// Applies the 2 confirmed adversarial-audit fixes to u4l1, after a full deterministic
// sweep for (a) any correct sum > 1,000 and (b) any garbled/non-numeric option in
// computational "What is A + B?" items. DRY RUN unless --apply.
const fs=require('fs'),path=require('path'),vm=require('vm');
const REPO_ROOT=path.resolve(__dirname,'..');
const APPLY=process.argv.includes('--apply');
const sandbox={console,globalThis:null,document:{createElement:()=>({style:{},appendChild(){},setAttribute(){}}),head:{appendChild(){}}}};
sandbox.location={search:''};sandbox.localStorage={getItem:()=>null,setItem(){}};sandbox.window={};
Object.assign(sandbox,{Promise,Array,Object,String,Number,Boolean,JSON,Math,RegExp,Date,Error,parseInt,parseFloat,isNaN,isFinite});
sandbox.globalThis=sandbox;sandbox.window=sandbox;
const ctx=vm.createContext(sandbox);
function L(rel,ex){let s=fs.readFileSync(path.join(REPO_ROOT,rel),'utf8');if(ex)s+='\n'+ex.map(n=>`try{globalThis.${n}=${n};}catch(e){}`).join('\n');vm.runInContext(s,ctx,{filename:rel});}
L('src/question-engine.js',['QE']);L('src/data/shared.js',['UNITS_DATA','_mergeUnitData']);
sandbox._capturedUnits={};const om=sandbox._mergeUnitData;sandbox._mergeUnitData=function(i,d){sandbox._capturedUnits[i]=d;return om(i,d);};
L('src/data/u4.js');
const u4=sandbox._capturedUnits[3];
const bank=u4.lessons[0].qBank;
const val=o=>typeof o==='object'?o.val:o;
const num=s=>{const m=String(s).replace(/,/g,'').match(/^-?\d+$/);return m?parseInt(m[0],10):null;};

// ---- DETERMINISTIC SWEEP ----
console.log('=== SWEEP: sum>1000 and garbled options ===');
let sweepHits=0;
bank.forEach((q,i)=>{
  const cv=num(val(q.o[q.a]));
  // sum>1000 on computational + any keyed correct value >1000
  const m=String(q.t).replace(/,/g,'').match(/(\d+)\s*\+\s*(\d+)(?!\s*\+)/);
  if(m){const s=+m[1]+ +m[2]; if(s>1000){console.log('  SUM>1000 i='+i+': '+q.t+' = '+s);sweepHits++;}}
  if(cv!==null && cv>1000 && /^What is/.test(q.t)){console.log('  CORRECT>1000 i='+i+': '+q.t+' correct='+cv);sweepHits++;}
  // garbled option: for "What is A+B?" all options should be pure integers
  if(/^What is \d+ \+ \d+\?$/.test(String(q.t).replace(/,/g,''))){
    q.o.forEach((o,oi)=>{ if(num(val(o))===null){console.log('  GARBLED-NUM-OPT i='+i+' opt'+oi+': "'+val(o)+'"');sweepHits++;} });
  }
  // generic garbled: any option val containing a digit immediately after a letter word like "ten4"
  q.o.forEach((o,oi)=>{ if(/[a-z]\d/i.test(String(val(o)))){console.log('  GARBLED-OPT i='+i+' opt'+oi+': "'+val(o)+'"');sweepHits++;} });
});
console.log('sweep hits:',sweepHits);

// ---- FIX 1: garbled distractor on the "adds up to 14" question ----
const q20=bank.find(q=>/ones column adds up to 14/i.test(q.t));
console.log('\n=== FIX 1: garbled distractor ===');
if(q20){
  console.log('  BEFORE opts:', q20.o.map(o=>JSON.stringify(val(o))).join(' | '));
  const bad=q20.o.find(o=>/ten4/i.test(String(val(o))));
  if(bad){ bad.val='0, regroup 1 ten'; }
  console.log('  AFTER  opts:', q20.o.map(o=>JSON.stringify(val(o))).join(' | '));
  // distinctness guard
  const vals=q20.o.map(o=>val(o)); if(new Set(vals).size!==vals.length){console.error('  FATAL: dup option after fix');process.exit(1);}
} else console.log('  (question not found!)');

// ---- FIX 2: replace 871+254 (=1125, out of range) with in-bound 3d+3d ----
console.log('\n=== FIX 2: replace out-of-range 871 + 254 ===');
function build3d3d(A,B){
  const S=A+B; if(S>1000) throw new Error('still >1000');
  const a0=A%10,b0=B%10,c1=(a0+b0)>=10?1:0;
  const a1=Math.floor(A/10)%10,b1=Math.floor(B/10)%10,tsum=a1+b1+c1,c2=tsum>=10?1:0;
  const a2=Math.floor(A/100)%10,b2=Math.floor(B/100)%10,hsum=a2+b2+c2;
  const low=S-100, mid=S-10, wrongOp=A-B;
  const set=new Set([S,low,mid,wrongOp]); if(set.size!==4)throw new Error('opt collision');
  if([low,mid,wrongOp].some(v=>v<=0))throw new Error('non-positive');
  const o=[
    {val:String(S),tag:null,patternTag:null},
    {val:String(low),tag:'err_under_count',patternTag:'pattern_too_low'},
    {val:String(mid),tag:'err_no_regroup',patternTag:'pattern_forgot_regroup'},
    {val:String(wrongOp),tag:'err_wrong_operation',patternTag:'pattern_wrong_operation'},
  ];
  let e='Ones: '+a0+' + '+b0+' = '+(a0+b0)+(c1?' → write '+((a0+b0)%10)+', regroup 1 ten':'')+'. ';
  e+='Tens: '+a1+' + '+b1+(c1?' + 1':'')+' = '+tsum+(c2?' → write '+(tsum%10)+', regroup 1 hundred':'')+'. ';
  e+='Hundreds: '+a2+' + '+b2+(c2?' + 1':'')+' = '+hsum+'. The answer is '+S+'! ✅';
  return {t:'What is '+A+' + '+B+'?',o,a:0,e,d:'m',
    h:'Add one column at a time, starting with the ones. Carry to the next place whenever a column makes 10 or more.',
    lessonId:'u4l1'};
}
const idx33=bank.findIndex(q=>/^What is 871 \+ 254\?$/.test(q.t));
if(idx33>=0){
  const existing=new Set(bank.map(q=>String(q.t).toLowerCase()));
  const candidates=[[486,357],[567,358],[671,254],[378,485],[259,476]];
  let repl=null;
  for(const [A,B] of candidates){ const t=('what is '+A+' + '+B+'?'); if(!existing.has(t)){ repl=build3d3d(A,B); break; } }
  if(!repl){console.error('  FATAL: no non-dup replacement');process.exit(1);}
  console.log('  BEFORE: '+bank[idx33].t+'  correct='+val(bank[idx33].o[bank[idx33].a])+'  (opts: '+bank[idx33].o.map(o=>val(o)).join(', ')+')');
  bank[idx33]=repl;
  console.log('  AFTER : '+repl.t+'  correct='+repl.o[0].val+'  (opts: '+repl.o.map(o=>o.val).join(', ')+')');
  console.log('  EXPL  : '+repl.e);
} else console.log('  (871+254 not found!)');

if(!APPLY){console.log('\n[DRY RUN] nothing written. Re-run with --apply.');process.exit(0);}
fs.writeFileSync(path.join(REPO_ROOT,'src','data','u4.js'),'// Unit 4: Add & Subtract to 1,000\n'+'_mergeUnitData(3, '+JSON.stringify(u4)+');\n','utf8');
console.log('\nWrote src/data/u4.js');
