#!/usr/bin/env node
// scripts/rebuild_u4l1_addition_bank.js
//
// Rebuild the Grade-2 u4l1 "Adding Really Big Numbers" lesson qBank so the
// content matches the lesson objective: three-digit + three-digit addition
// with multiple regrouping, sums frequently crossing 1,000, and
// misconception-derived distractors (see scripts/lib/u4l1_addition.js).
//
// Replaces ONLY lessons[0].qBank in src/data/u4.js. Everything else in the
// unit (u4l2/u4l3 qBanks, legacy quiz arrays, points/examples/practice,
// unitQuiz, testBank) is re-emitted byte-identically (asserted before write).
//
// DRY RUN by default: prints the before/after audit and writes nothing.
// Pass --apply to write src/data/u4.js.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const lib = require('./lib/u4l1_addition.js');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const FILE = path.join(ROOT, 'src', 'data', 'u4.js');
const HEADER = '// Unit 4: Add & Subtract to 1,000\n';

// ---- load current unit data ----
const original = fs.readFileSync(FILE, 'utf8');
const cap = {};
const sandbox = { _mergeUnitData: (i, d) => { cap[i] = d; }, console };
vm.createContext(sandbox);
vm.runInContext(original, sandbox, { filename: 'u4.js' });
const u4 = cap[3];
if (!u4 || !Array.isArray(u4.lessons) || u4.lessons.length !== 3) {
  console.error('Unexpected u4.js structure — aborting.');
  process.exit(2);
}

// Round-trip safety: re-emitting the UNMODIFIED data must reproduce the file
// exactly, proving the swap below cannot disturb u4l2/u4l3/unitQuiz/testBank.
// The file on disk uses CRLF between the header/payload/EOF — keep it.
const EOL = original.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
const emit = (data) => HEADER.replace('\n', EOL) + '_mergeUnitData(3, ' + JSON.stringify(data) + ');' + EOL;
if (emit(u4) !== original) {
  console.error('Round-trip emit does not match src/data/u4.js — aborting to avoid corrupting untouched banks.');
  process.exit(2);
}
console.log('Round-trip emit check: OK (untouched unit data re-serializes byte-identically)');

// ---- before audit ----
const oldBank = u4.lessons[0].qBank;
const before = lib.validateBank(oldBank);
console.log('\n=== BEFORE (current bank, ' + oldBank.length + ' questions) ===');
printSummary(before);

// ---- generate + audit new bank ----
const newBank = lib.generateBank();
const after = lib.validateBank(newBank);
console.log('\n=== AFTER (generated bank, ' + newBank.length + ' questions) ===');
printSummary(after);

if (after.issues.length || after.flags.length) {
  console.error('\nGenerated bank has issues/flags — refusing to apply.');
  after.issues.slice(0, 40).forEach((x) => console.error('  [#' + x.index + '] ' + x.type + ' — ' + x.detail));
  after.flags.forEach((f) => console.error('  FLAG: ' + f));
  process.exit(1);
}

if (!APPLY) {
  console.log('\n[DRY RUN] no files written. Re-run with --apply to write src/data/u4.js.');
  process.exit(0);
}

u4.lessons[0].qBank = newBank;
fs.writeFileSync(FILE, emit(u4), 'utf8');
console.log('\nWrote src/data/u4.js (u4l1 qBank: ' + oldBank.length + ' -> ' + newBank.length + ' questions).');
console.log('Remember to rebuild dist (node build.js) before serving.');

function printSummary(r) {
  const s = r.stats;
  console.log('  computational: ' + s.computational + '/' + s.total + ' | both 3-digit: ' + s.bothThreeDigit +
    ' | regroup 0/1/2/3: ' + s.regroup0 + '/' + s.regroup1 + '/' + s.regroup2 + '/' + s.regroup3);
  console.log('  multiple regrouping: ' + s.multiRegroupPct + '% | four-digit sums: ' + s.fourDigitSums +
    ' (' + s.fourDigitPct + '%) | no regrouping: ' + s.noRegroupPct + '%');
  console.log('  d tiers e/m/h: ' + s.byD.e + '/' + s.byD.m + '/' + s.byD.h +
    ' | correct positions: ' + s.correctPosition.join('/') + ' | correct rank: ' + s.correctRank.join('/'));
  console.log('  issues: ' + r.issues.length + ' ' + (Object.keys(s.issueCounts).length ? JSON.stringify(s.issueCounts) : '') +
    ' | flags: ' + (r.flags.length ? r.flags.join('; ') : 'none'));
}
