/**
 * Fixes the 23 NOT FOUND replacements — file uses CRLF line endings.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'src/data/k/u3.js');
let src = fs.readFileSync(FILE, 'utf8');

// 10-space indent (qBank) + 6-space indent (testBank)
const q  = '          ';  // 10 spaces
const tb = '      ';      // 6 spaces
const NL = '\r\n';        // CRLF

const REPS = [
  // ── qBank (10-space) ─────────────────────────────────────────────────────

  [`${q}t: '2 + 4 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🍓'`,
   `${q}t: '🍓🍓 + 🍓🍓🍓🍓 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🍓'`],

  [`${q}t: '1 + 5 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:1, leftObj:'⭐'`,
   `${q}t: '⭐ + ⭐⭐⭐⭐⭐ = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:1, leftObj:'⭐'`],

  [`${q}t: '3 + 3 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌙'`,
   `${q}t: '🌙🌙🌙 + 🌙🌙🌙 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌙'`],

  [`${q}t: '2 + 2 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🎈'`,
   `${q}t: '🎈🎈 + 🎈🎈 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🎈'`],

  [`${q}t: '7 + 1 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🦋'`,
   `${q}t: '🦋🦋🦋🦋🦋🦋🦋 + 🦋 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🦋'`],

  [`${q}t: '2 + 3 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦒'`,
   `${q}t: '🦒🦒 + 🦒🦒🦒 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦒'`],

  [`${q}t: '6 + 2 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🎸'`,
   `${q}t: '🎸🎸🎸🎸🎸🎸 + 🎸🎸 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🎸'`],

  [`${q}t: '8 + 2 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🌻'`,
   `${q}t: '🌻🌻🌻🌻🌻🌻🌻🌻 + 🌻🌻 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🌻'`],

  [`${q}t: '9 + 1 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎵'`,
   `${q}t: '🎵🎵🎵🎵🎵🎵🎵🎵🎵 + 🎵 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎵'`],

  [`${q}t: '6 - 3 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🧩'`,
   `${q}t: '🧩🧩🧩🧩🧩🧩 − 🧩🧩🧩 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🧩'`],

  [`${q}t: '4 - 1 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🌻'`,
   `${q}t: '🌻🌻🌻🌻 − 🌻 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🌻'`],

  [`${q}t: '7 - 4 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🍇'`,
   `${q}t: '🍇🍇🍇🍇🍇🍇🍇 − 🍇🍇🍇🍇 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🍇'`],

  [`${q}t: '7 - 3 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🎀'`,
   `${q}t: '🎀🎀🎀🎀🎀🎀🎀 − 🎀🎀🎀 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🎀'`],

  // ── testBank (6-space) ────────────────────────────────────────────────────

  [`${tb}t: '4 + 3 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🍭'`,
   `${tb}t: '🍭🍭🍭🍭 + 🍭🍭🍭 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🍭'`],

  [`${tb}t: '5 + 3 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🎃'`,
   `${tb}t: '🎃🎃🎃🎃🎃 + 🎃🎃🎃 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🎃'`],

  [`${tb}t: '10 - 7 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🏀'`,
   `${tb}t: '🏀🏀🏀🏀🏀🏀🏀🏀🏀🏀 − 🏀🏀🏀 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🏀'`],

  [`${tb}t: '2 + 2 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐥'`,
   `${tb}t: '🐥🐥 + 🐥🐥 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐥'`],

  [`${tb}t: '5 + 3 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐠'`,
   `${tb}t: '🐠🐠🐠🐠🐠 + 🐠🐠🐠 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐠'`],

  [`${tb}t: '9 + 1 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌻'`,
   `${tb}t: '🌻🌻🌻🌻🌻🌻🌻🌻🌻 + 🌻 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌻'`],

  [`${tb}t: '8 + 2 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐝'`,
   `${tb}t: '🐝🐝🐝🐝🐝🐝🐝🐝 + 🐝🐝 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐝'`],

  [`${tb}t: '7 - 4 = ?',${NL}${tb}v: {type:'objectSet', config:{count:7, emoji:'🌺'`,
   `${tb}t: '🌺🌺🌺🌺🌺🌺🌺 − 🌺🌺🌺🌺 = ?',${NL}${tb}v: {type:'objectSet', config:{count:7, emoji:'🌺'`],

  [`${tb}t: '6 - 3 = ?',${NL}${tb}v: {type:'objectSet', config:{count:6, emoji:'🦋'`,
   `${tb}t: '🦋🦋🦋🦋🦋🦋 − 🦋🦋🦋 = ?',${NL}${tb}v: {type:'objectSet', config:{count:6, emoji:'🦋'`],

  [`${tb}t: '10 - 7 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🍋'`,
   `${tb}t: '🍋🍋🍋🍋🍋🍋🍋🍋🍋🍋 − 🍋🍋🍋 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🍋'`],
];

let count = 0;
for (const [oldStr, newStr] of REPS) {
  if (src.includes(oldStr)) {
    src = src.replace(oldStr, newStr);
    count++;
  } else {
    console.warn('STILL NOT FOUND:', JSON.stringify(oldStr.slice(0, 100)));
  }
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`Done. Applied ${count} / ${REPS.length} fixes.`);
