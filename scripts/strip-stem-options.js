#!/usr/bin/env node
// =============================================================================
//  strip-stem-options.js
//
//  Removes the redundant `A) X  B) Y  C) Z  D) W` tail from question stems
//  in G2 data files (src/data/u*.js). These stems list the same answer choices
//  that are already rendered as buttons, which is confusing — the student sees
//  the choices twice, the screen feels cluttered, and screen readers read the
//  whole option list inside the question.
//
//  Heuristic: only strip when the stem ENDS with the A)/B)/C)/D) list. Stems
//  that reference A/B/C as identifiers (e.g. "Mr. Chen asks ... Three students
//  answer. A) ... B) ... Who is WRONG?") are NOT touched — those need the
//  inline labels to make sense.
//
//  Run: node scripts/strip-stem-options.js
// =============================================================================

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const FILES    = ['u1.js','u2.js','u3.js','u4.js','u5.js','u6.js','u7.js','u8.js','u9.js','u10.js'];

// Matches a trailing `... A) <opt> B) <opt> C) <opt> D) <opt>` (and the
// 3-option A/B/C variant). Allows any operator/digit/dot/comma/space inside an
// option, plus % and the literal chars common in money/decimal questions.
// Anchored to the closing `"` of the stem so a "Who is WRONG?" prompt that
// happens to enumerate examples earlier in the stem is left alone.
const OPT_RE  = /(\?|\.)\s*A\)\s*[^"]+?\s*B\)\s*[^"]+?\s*C\)\s*[^"]+?(\s*D\)\s*[^"]+?)?(?=")/g;

let totalEdits = 0;

FILES.forEach(function(f) {
  const p = path.join(DATA_DIR, f);
  if (!fs.existsSync(p)) return;
  const before = fs.readFileSync(p, 'utf8');
  let n = 0;
  const after = before.replace(OPT_RE, function(_, end) {
    // If the stem is the "students answer" pattern, the A)/B)/C) carry meaning.
    // Heuristic: if the stem contains the word "student" before the A) list
    // OR mentions "wrong" / "Who is", keep it as-is (we'll bail out below).
    n++;
    return end;
  });
  // Bail on stems that need the labels — re-do replacement with a guard.
  const guarded = before.replace(/"t":"([^"]*?)"/g, function(match, stem) {
    if (!/A\)\s/.test(stem)) return match;                                    // no A) at all
    if (/\bstudent(s)?\b|\bWho is\b|\bis WRONG\b|\bis RIGHT\b/i.test(stem))   // pedagogical-labels case
      return match;
    // Strip the trailing option list
    const stripped = stem.replace(/(\?|\.)\s*A\)\s*[^"]+?(?=$)/, '$1');
    if (stripped !== stem) n++;
    return '"t":"' + stripped + '"';
  });
  if (guarded !== before) {
    fs.writeFileSync(p, guarded, 'utf8');
    console.log('  ' + f + ': ' + n + ' stem(s) cleaned');
    totalEdits += n;
  }
});

console.log('\nTotal stems cleaned: ' + totalEdits);
