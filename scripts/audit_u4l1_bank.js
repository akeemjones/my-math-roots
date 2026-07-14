#!/usr/bin/env node
// scripts/audit_u4l1_bank.js
//
// Lesson-specific audit for the Grade-2 u4l1 "Adding Really Big Numbers"
// question bank (READ-ONLY). Loads src/data/u4.js in a sandbox and runs the
// composition, leakage, and misconception-reproducibility checks from
// scripts/lib/u4l1_addition.js against lessons[0].qBank.
//
//   node scripts/audit_u4l1_bank.js            # full report
//   node scripts/audit_u4l1_bank.js --quiet    # summary + flags only
//
// Exit 0 when the lesson passes with no flags, 1 when any flag is raised.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const lib = require('./lib/u4l1_addition.js');

const ROOT = path.resolve(__dirname, '..');
const QUIET = process.argv.includes('--quiet');

const cap = {};
const sandbox = { _mergeUnitData: (i, d) => { cap[i] = d; }, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'u4.js'), 'utf8'), sandbox, { filename: 'u4.js' });
const u4 = cap[3];
if (!u4 || !u4.lessons || !u4.lessons[0] || !Array.isArray(u4.lessons[0].qBank)) {
  console.error('Could not load u4l1 qBank from src/data/u4.js');
  process.exit(2);
}
const bank = u4.lessons[0].qBank;

const { stats, issues, flags } = lib.validateBank(bank);

console.log('u4l1 "Adding Really Big Numbers" — lesson bank audit');
console.log('====================================================');
console.log('Total questions:               ' + stats.total);
console.log('Full-calculation questions:    ' + stats.computational + ' (' + stats.nonComputational + ' non-computational)');
console.log('Two three-digit operands:      ' + stats.bothThreeDigit);
console.log('Word problems:                 ' + stats.wordProblems);
console.log('Regrouping — none:             ' + stats.regroup0 + ' (' + stats.noRegroupPct + '%)');
console.log('Regrouping — one column:       ' + stats.regroup1);
console.log('Regrouping — two columns:      ' + stats.regroup2);
console.log('Regrouping — three columns:    ' + stats.regroup3);
console.log('Multiple regrouping:           ' + (stats.regroup2 + stats.regroup3) + ' (' + stats.multiRegroupPct + '%)');
console.log('Four-digit sums (>= 1,000):    ' + stats.fourDigitSums + ' (' + stats.fourDigitPct + '%)');
console.log('Difficulty tiers (d):          e=' + stats.byD.e + ' m=' + stats.byD.m + ' h=' + stats.byD.h + (stats.byD.other ? ' other=' + stats.byD.other : ''));
console.log('Correct-answer positions:      ' + stats.correctPosition.join(' / '));
console.log('Correct-answer rank (1st-4th largest): ' + stats.correctRank.join(' / '));
console.log('Issue counts:                  ' + (Object.keys(stats.issueCounts).length ? JSON.stringify(stats.issueCounts) : 'none'));

if (!QUIET && issues.length) {
  console.log('\nIssues (' + issues.length + '):');
  issues.slice(0, 120).forEach((x) => console.log('  [#' + x.index + '] ' + x.type + ' — ' + x.detail + '  :: ' + x.t));
  if (issues.length > 120) console.log('  ...and ' + (issues.length - 120) + ' more');
}

if (flags.length) {
  console.log('\nLESSON FLAGGED:');
  flags.forEach((f) => console.log('  - ' + f));
  console.log('\nFAIL — ' + flags.length + ' flag(s).');
  process.exit(1);
}
console.log('\nPASS — lesson bank meets the "Adding Really Big Numbers" objective.');
process.exit(0);
