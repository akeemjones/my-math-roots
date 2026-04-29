/**
 * Fixes ALL K comparison questions:
 *  1. v:null "greater/less" → add twoGroups visual + 2 options (left/right values only)
 *  2. Equality text questions → reduce 4 text options to 2
 * Files: src/data/k/u2.js, src/data/k/u4.js
 */
const fs   = require('fs');
const path = require('path');

const U2 = path.join(__dirname, 'src/data/k/u2.js');
const U4 = path.join(__dirname, 'src/data/k/u4.js');

const NL = '\r\n';  // CRLF for multi-line blocks
const tb = '          '; // 10-space indent for u4.js qBank entries

// Helper — build compact twoGroups visual for a "greater/less" number comparison
function tg(l, r) {
  return `{type:'twoGroups',config:{leftCount:${l},leftObj:'\uD83D\uDD35',rightCount:${r},rightObj:'\uD83D\uDD35',op:'compare'}}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// u2.js changes
// ─────────────────────────────────────────────────────────────────────────────
let u2 = fs.readFileSync(U2, 'utf8');

const U2_REPS = [

  // ── L2 qBank equality text options: 4 → 2 ──────────────────────────────────

  // "Do 3 🍇 and 3 🍒 show the same amount?" (equal)
  [
    `o:[{val:'yes — same'},{val:'no — grapes more',tag:'err_not_equal'},{val:'no — cherries more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0`,
    `o:[{val:'yes — same'},{val:'no — not the same',tag:'err_not_equal'}], a:0`
  ],
  // "Do 5 🐶 and 4 🐱 show the same amount?" (not equal)
  [
    `o:[{val:'yes — same',tag:'err_not_equal'},{val:'no — dogs more'},{val:'no — cats more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:1`,
    `o:[{val:'yes — same',tag:'err_not_equal'},{val:'no — not the same'}], a:1`
  ],
  // "Do 4 🦓 and 4 🦒 show the same amount?" (equal)
  [
    `o:[{val:'yes — same'},{val:'no — zebras more',tag:'err_not_equal'},{val:'no — giraffes more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0`,
    `o:[{val:'yes — same'},{val:'no — not the same',tag:'err_not_equal'}], a:0`
  ],
  // "Do 6 🐊 and 6 🦕 show the same amount?" (equal)
  [
    `o:[{val:'yes — same'},{val:'no — crocs more',tag:'err_not_equal'},{val:'no — dinos more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0`,
    `o:[{val:'yes — same'},{val:'no — not the same',tag:'err_not_equal'}], a:0`
  ],

  // ── L3 qBank: v:null + 4 opts → twoGroups + 2 opts ────────────────────────

  // "Which is greater: 2 or 8?"
  [
    `v:null, o:[{val:'2',tag:'err_less'},{val:'4',tag:'err_random'},{val:'8'},{val:'10',tag:'err_random'}], a:2`,
    `v:${tg(2,8)}, o:[{val:'2',tag:'err_less'},{val:'8'}], a:1`
  ],
  // "Which is greater: 1 or 6?"
  [
    `v:null, o:[{val:'1',tag:'err_less'},{val:'3',tag:'err_random'},{val:'6'},{val:'9',tag:'err_random'}], a:2`,
    `v:${tg(1,6)}, o:[{val:'1',tag:'err_less'},{val:'6'}], a:1`
  ],
  // "Which is greater: 3 or 9?"
  [
    `v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'7',tag:'err_random'},{val:'9'}],   a:3`,
    `v:${tg(3,9)}, o:[{val:'3',tag:'err_less'},{val:'9'}], a:1`
  ],
  // "Which is less: 7 or 2?"
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'5',tag:'err_random'},{val:'7',tag:'err_more'}], a:1`,
    `v:${tg(7,2)}, o:[{val:'7',tag:'err_more'},{val:'2'}], a:1`
  ],
  // "Which is less: 5 or 9?"
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'5'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1`,
    `v:${tg(5,9)}, o:[{val:'5'},{val:'9',tag:'err_more'}], a:0`
  ],
  // "Which is less: 4 or 1?"
  [
    `v:null, o:[{val:'1'},{val:'2',tag:'err_random'},{val:'4',tag:'err_more'},{val:'6',tag:'err_random'}], a:0`,
    `v:${tg(4,1)}, o:[{val:'4',tag:'err_more'},{val:'1'}], a:1`
  ],
  // "Which is greater: 5 or 7?"
  [
    `v:null, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'7'},{val:'8',tag:'err_random'}], a:2`,
    `v:${tg(5,7)}, o:[{val:'5',tag:'err_less'},{val:'7'}], a:1`
  ],
  // "Which is less: 6 or 8?"
  [
    `v:null, o:[{val:'4',tag:'err_random'},{val:'6'},{val:'8',tag:'err_more'},{val:'9',tag:'err_random'}], a:1`,
    `v:${tg(6,8)}, o:[{val:'6'},{val:'8',tag:'err_more'}], a:0`
  ],
  // "Which is greater: 4 or 6?"
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'4',tag:'err_less'},{val:'6'},{val:'7',tag:'err_random'}], a:2`,
    `v:${tg(4,6)}, o:[{val:'4',tag:'err_less'},{val:'6'}], a:1`
  ],
  // "Is 5 greater than, less than, or equal to 5?" → equal question
  [
    `v:null, o:[{val:'greater than',tag:'err_not_equal'},{val:'less than',tag:'err_not_equal'},{val:'equal to'},{val:'not sure',tag:'err_confused'}], a:2`,
    `v:${tg(5,5)}, o:[{val:'equal to'},{val:'not equal to',tag:'err_not_equal'}], a:0`
  ],
  // "Which is greater: 1 or 8?"
  [
    `v:null, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'8'},{val:'9',tag:'err_random'}], a:2`,
    `v:${tg(1,8)}, o:[{val:'1',tag:'err_less'},{val:'8'}], a:1`
  ],
  // "Which is less: 3 or 6?"
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'3'},{val:'6',tag:'err_more'},{val:'8',tag:'err_random'}], a:1`,
    `v:${tg(3,6)}, o:[{val:'3'},{val:'6',tag:'err_more'}], a:0`
  ],
  // "Which is less: 2 or 9?"
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1`,
    `v:${tg(2,9)}, o:[{val:'2'},{val:'9',tag:'err_more'}], a:0`
  ],
  // "Are 4 and 4 equal?"
  [
    `v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'4 = 4`,
    `v:${tg(4,4)}, o:[{val:'yes — equal'},{val:'no — not equal',tag:'err_not_equal'}], a:0, e:'4 = 4`
  ],
  // "Which is greater: 6 or 9?"
  [
    `v:null, o:[{val:'5',tag:'err_random'},{val:'6',tag:'err_less'},{val:'9'},{val:'10',tag:'err_random'}], a:2`,
    `v:${tg(6,9)}, o:[{val:'6',tag:'err_less'},{val:'9'}], a:1`
  ],
  // "Are 6 and 7 equal?"
  [
    `v:null, o:[{val:'yes — equal',tag:'err_not_equal'},{val:'no — 6 is less'},{val:'no — 7 is less',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:1`,
    `v:${tg(6,7)}, o:[{val:'yes — equal',tag:'err_not_equal'},{val:'no — not equal'}], a:1`
  ],
  // "Which is greater: 2 or 7?"
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'2',tag:'err_less'},{val:'7'},{val:'9',tag:'err_random'}], a:2`,
    `v:${tg(2,7)}, o:[{val:'2',tag:'err_less'},{val:'7'}], a:1`
  ],
  // "Which is less: 9 or 4?"
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1`,
    `v:${tg(9,4)}, o:[{val:'9',tag:'err_more'},{val:'4'}], a:1`
  ],
  // "Is 3 equal to 3?"
  [
    `v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'3 = 3`,
    `v:${tg(3,3)}, o:[{val:'yes — equal'},{val:'no — not equal',tag:'err_not_equal'}], a:0, e:'3 = 3`
  ],
  // "Which is greater: 4 or 7?" ← the reported example
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'4',tag:'err_less'},{val:'7'},{val:'8',tag:'err_random'}], a:2`,
    `v:${tg(4,7)}, o:[{val:'4',tag:'err_less'},{val:'7'}], a:1`
  ],
  // "Which is greater: 5 or 8?"
  [
    `v:null, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'8'},{val:'9',tag:'err_random'}], a:2`,
    `v:${tg(5,8)}, o:[{val:'5',tag:'err_less'},{val:'8'}], a:1`
  ],
  // "Is 7 equal to 7?"
  [
    `v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'7 = 7`,
    `v:${tg(7,7)}, o:[{val:'yes — equal'},{val:'no — not equal',tag:'err_not_equal'}], a:0, e:'7 = 7`
  ],
  // "Which is less: 2 or 5?"
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'5',tag:'err_more'},{val:'6',tag:'err_random'}], a:1`,
    `v:${tg(2,5)}, o:[{val:'2'},{val:'5',tag:'err_more'}], a:0`
  ],
  // "Which is less: 7 or 4?"
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'7',tag:'err_more'},{val:'8',tag:'err_random'}], a:1`,
    `v:${tg(7,4)}, o:[{val:'7',tag:'err_more'},{val:'4'}], a:1`
  ],
  // "Which is less: 7 or 8?"
  [
    `v:null, o:[{val:'6',tag:'err_random'},{val:'7'},{val:'8',tag:'err_more'},{val:'9',tag:'err_random'}], a:1`,
    `v:${tg(7,8)}, o:[{val:'7'},{val:'8',tag:'err_more'}], a:0`
  ],
  // "Is 9 greater than 8?"
  [
    `v:null, o:[{val:'yes — 9 is greater'},{val:'no — 8 is greater',tag:'err_not_equal'},{val:'they are equal',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0`,
    `v:${tg(9,8)}, o:[{val:'yes — 9 is greater'},{val:'no — 8 is greater',tag:'err_not_equal'}], a:0`
  ],
  // "Which is greater: 5 or 6?"
  [
    `v:null, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'6'},{val:'7',tag:'err_random'}], a:2`,
    `v:${tg(5,6)}, o:[{val:'5',tag:'err_less'},{val:'6'}], a:1`
  ],
  // "Are 8 and 9 equal?"
  [
    `v:null, o:[{val:'yes — equal',tag:'err_not_equal'},{val:'no — 8 is less'},{val:'no — 9 is less',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:1`,
    `v:${tg(8,9)}, o:[{val:'yes — equal',tag:'err_not_equal'},{val:'no — not equal'}], a:1`
  ],

  // ── testBank L2 equality text options: 4 → 2 ───────────────────────────────

  // "Do 4 🍒 and 4 🌷 show the same amount?" (equal)
  [
    `o:[{val:'yes — same'},{val:'no — cherries more',tag:'err_not_equal'},{val:'no — tulips more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0`,
    `o:[{val:'yes — same'},{val:'no — not the same',tag:'err_not_equal'}], a:0`
  ],
  // "Do 5 🦁 and 5 🐊 show the same amount?" (equal)
  [
    `o:[{val:'yes — same'},{val:'no — lions more',tag:'err_not_equal'},{val:'no — crocs more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0`,
    `o:[{val:'yes — same'},{val:'no — not the same',tag:'err_not_equal'}], a:0`
  ],

  // ── testBank L3: v:null + 4 opts → twoGroups + 2 opts ─────────────────────

  // "Which is greater: 1 or 9?"
  [
    `v:null, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'9'},{val:'10',tag:'err_random'}], a:2`,
    `v:${tg(1,9)}, o:[{val:'1',tag:'err_less'},{val:'9'}], a:1`
  ],
  // "Which is less: 8 or 3?"
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'3'},{val:'5',tag:'err_random'},{val:'8',tag:'err_more'}], a:1`,
    `v:${tg(8,3)}, o:[{val:'8',tag:'err_more'},{val:'3'}], a:1`
  ],
  // "Which is greater: 3 or 7?" (testBank)
  [
    `v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'7'},{val:'9',tag:'err_random'}], a:2`,
    `v:${tg(3,7)}, o:[{val:'3',tag:'err_less'},{val:'7'}], a:1`
  ],
  // "Is 5 equal to 5?" (testBank)
  [
    `v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'5 = 5`,
    `v:${tg(5,5)}, o:[{val:'yes — equal'},{val:'no — not equal',tag:'err_not_equal'}], a:0, e:'5 = 5`
  ],
  // "Which is greater: 4 or 9?" (testBank)
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'4',tag:'err_less'},{val:'9'},{val:'10',tag:'err_random'}], a:2`,
    `v:${tg(4,9)}, o:[{val:'4',tag:'err_less'},{val:'9'}], a:1`
  ],
  // "Which is less: 1 or 8?"
  [
    `v:null, o:[{val:'1'},{val:'4',tag:'err_random'},{val:'8',tag:'err_more'},{val:'9',tag:'err_random'}], a:0`,
    `v:${tg(1,8)}, o:[{val:'1'},{val:'8',tag:'err_more'}], a:0`
  ],
  // "Which is greater: 3 or 8?"
  [
    `v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'8'},{val:'9',tag:'err_random'}], a:2`,
    `v:${tg(3,8)}, o:[{val:'3',tag:'err_less'},{val:'8'}], a:1`
  ],
  // "Which is less: 4 or 7?"
  [
    `v:null, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'7',tag:'err_more'},{val:'8',tag:'err_random'}], a:1`,
    `v:${tg(4,7)}, o:[{val:'4'},{val:'7',tag:'err_more'}], a:0`
  ],
  // "Is 6 equal to 6?"
  [
    `v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'6 = 6`,
    `v:${tg(6,6)}, o:[{val:'yes — equal'},{val:'no — not equal',tag:'err_not_equal'}], a:0, e:'6 = 6`
  ],
  // "Which is greater: 3 or 6?" (testBank medium)
  [
    `v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'6'},{val:'7',tag:'err_random'}], a:2`,
    `v:${tg(3,6)}, o:[{val:'3',tag:'err_less'},{val:'6'}], a:1`
  ],
  // "Is 8 greater than 9?" (testBank)
  [
    `v:null, o:[{val:'yes — 8 is greater',tag:'err_not_equal'},{val:'no — 9 is greater'},{val:'they are equal',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:1`,
    `v:${tg(8,9)}, o:[{val:'yes — 8 is greater',tag:'err_not_equal'},{val:'no — 9 is greater'}], a:1`
  ],
  // "Which is less: 8 or 9?" (testBank)
  [
    `v:null, o:[{val:'7',tag:'err_random'},{val:'8'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1`,
    `v:${tg(8,9)}, o:[{val:'8'},{val:'9',tag:'err_more'}], a:0`
  ],
  // "Which is greater: 2 or 6?" (testBank medium additional)
  [
    `v:null, o:[{val:'1',tag:'err_random'},{val:'2',tag:'err_less'},{val:'6'},{val:'8',tag:'err_random'}], a:2`,
    `v:${tg(2,6)}, o:[{val:'2',tag:'err_less'},{val:'6'}], a:1`
  ],
  // "Is 8 equal to 8?"
  [
    `v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'8 = 8`,
    `v:${tg(8,8)}, o:[{val:'yes — equal'},{val:'no — not equal',tag:'err_not_equal'}], a:0, e:'8 = 8`
  ],
];

let u2Applied = 0, u2Missed = 0;
for (const [o, n] of U2_REPS) {
  if (u2.includes(o)) {
    u2 = u2.replace(o, n);
    u2Applied++;
  } else {
    console.warn('U2 NOT FOUND:', JSON.stringify(o.slice(0, 100)));
    u2Missed++;
  }
}
fs.writeFileSync(U2, u2, 'utf8');
console.log(`u2.js: ${u2Applied}/${U2_REPS.length} applied, ${u2Missed} missed`);

// ─────────────────────────────────────────────────────────────────────────────
// u4.js changes (multi-line format, CRLF)
// ─────────────────────────────────────────────────────────────────────────────
let u4 = fs.readFileSync(U4, 'utf8');

const U4_REPS = [

  // "Which is greater: 11 or 19?"
  [
    `${tb}t: 'Which is greater: 11 or 19?',${NL}${tb}v: null,${NL}${tb}o: [{val:'11',tag:'err_less'},{val:'19'},{val:'15',tag:'err_same'},{val:'8',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is greater: 11 or 19?',${NL}${tb}v: ${tg(11,19)},${NL}${tb}o: [{val:'11',tag:'err_less'},{val:'19'}],${NL}${tb}a:1`
  ],

  // "Which is less: 20 or 14?"
  [
    `${tb}t: 'Which is less: 20 or 14?',${NL}${tb}v: null,${NL}${tb}o: [{val:'20',tag:'err_more'},{val:'14'},{val:'17',tag:'err_same'},{val:'7',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is less: 20 or 14?',${NL}${tb}v: ${tg(20,14)},${NL}${tb}o: [{val:'20',tag:'err_more'},{val:'14'}],${NL}${tb}a:1`
  ],

  // "Which is greater: 13 or 16?"
  [
    `${tb}t: 'Which is greater: 13 or 16?',${NL}${tb}v: null,${NL}${tb}o: [{val:'13',tag:'err_less'},{val:'16'},{val:'14',tag:'err_off_by_one'},{val:'29',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is greater: 13 or 16?',${NL}${tb}v: ${tg(13,16)},${NL}${tb}o: [{val:'13',tag:'err_less'},{val:'16'}],${NL}${tb}a:1`
  ],

  // "Which is less: 18 or 12?"
  [
    `${tb}t: 'Which is less: 18 or 12?',${NL}${tb}v: null,${NL}${tb}o: [{val:'18',tag:'err_more'},{val:'12'},{val:'15',tag:'err_same'},{val:'30',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is less: 18 or 12?',${NL}${tb}v: ${tg(18,12)},${NL}${tb}o: [{val:'18',tag:'err_more'},{val:'12'}],${NL}${tb}a:1`
  ],

  // "Are 15 and 15 equal?" (currently a:1 "Yes, they are equal")
  [
    `${tb}t: 'Are 15 and 15 equal?',${NL}${tb}v: null,${NL}${tb}o: [{val:'No, 15 is more',tag:'err_same'},{val:'Yes, they are equal'},{val:'No, 15 is less',tag:'err_same'},{val:'No, one is bigger',tag:'err_same'}],${NL}${tb}a:1`,
    `${tb}t: 'Are 15 and 15 equal?',${NL}${tb}v: ${tg(15,15)},${NL}${tb}o: [{val:'Yes, they are equal'},{val:'No, not equal',tag:'err_not_equal'}],${NL}${tb}a:0`
  ],

  // "🐶🐶🐶...vs 🐱🐱🐱... — are the groups equal?" (already has twoGroups, trim opts, currently a:1)
  [
    `o: [{val:'No, \uD83D\uDC36 has more',tag:'err_same'},{val:'Yes, both have 13'},{val:'No, \uD83D\uDC31 has more',tag:'err_same'},{val:'No, they are different',tag:'err_same'}],${NL}${tb}a:1`,
    `o: [{val:'Yes, both have 13'},{val:'No, not equal',tag:'err_not_equal'}],${NL}${tb}a:0`
  ],

  // "Which is greater: 14 or 20?"
  [
    `${tb}t: 'Which is greater: 14 or 20?',${NL}${tb}v: null,${NL}${tb}o: [{val:'14',tag:'err_less'},{val:'20'},{val:'17',tag:'err_same'},{val:'34',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is greater: 14 or 20?',${NL}${tb}v: ${tg(14,20)},${NL}${tb}o: [{val:'14',tag:'err_less'},{val:'20'}],${NL}${tb}a:1`
  ],

  // "Which is less: 15 or 19?" (correct = 15 at leftOptIdx=0)
  [
    `${tb}t: 'Which is less: 15 or 19?',${NL}${tb}v: null,${NL}${tb}o: [{val:'19',tag:'err_more'},{val:'15'},{val:'17',tag:'err_same'},{val:'4',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is less: 15 or 19?',${NL}${tb}v: ${tg(15,19)},${NL}${tb}o: [{val:'15'},{val:'19',tag:'err_more'}],${NL}${tb}a:0`
  ],

  // "Which is greater: 16 or 17?"
  [
    `${tb}t: 'Which is greater: 16 or 17?',${NL}${tb}v: null,${NL}${tb}o: [{val:'16',tag:'err_less'},{val:'17'},{val:'16 and 17 are equal',tag:'err_same'},{val:'Not sure',tag:'err_off_by_one'}],${NL}${tb}a:1`,
    `${tb}t: 'Which is greater: 16 or 17?',${NL}${tb}v: ${tg(16,17)},${NL}${tb}o: [{val:'16',tag:'err_less'},{val:'17'}],${NL}${tb}a:1`
  ],
];

let u4Applied = 0, u4Missed = 0;
for (const [o, n] of U4_REPS) {
  if (u4.includes(o)) {
    u4 = u4.replace(o, n);
    u4Applied++;
  } else {
    console.warn('U4 NOT FOUND:', JSON.stringify(o.slice(0, 100)));
    u4Missed++;
  }
}
fs.writeFileSync(U4, u4, 'utf8');
console.log(`u4.js: ${u4Applied}/${U4_REPS.length} applied, ${u4Missed} missed`);
console.log(`Total: ${u2Applied + u4Applied}/${U2_REPS.length + U4_REPS.length} applied`);
