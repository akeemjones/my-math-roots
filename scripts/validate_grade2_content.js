#!/usr/bin/env node
/**
 * Grade 2 content validator (READ-ONLY).
 *
 * Loads the Grade 2 question data (src/data/u1.js .. u10.js, merged via _mergeUnitData,
 * with lesson metadata from src/data/shared.js UNITS_DATA) in a sandbox and runs structural
 * + content checks. Does NOT modify any file and is NOT imported by the app — purely a CLI
 * guard for content quality.
 *
 *   node scripts/validate_grade2_content.js          # full report
 *   node scripts/validate_grade2_content.js --quiet   # summary + criticals only
 *
 * Exit code 1 if any CRITICAL issue is found (wrong answer / impossible question /
 * single-skill wrong-operation / unknown tag / cross-unit leakage), else 0.
 *
 * Checks:
 *  - answer index valid and the correct option exists in the choices
 *  - no duplicate option values
 *  - exactly one correct (untagged) option; every distractor carries an err_* tag (+ pattern_*)
 *  - arithmetic correctness for machine-parseable "What is A op B?", "A + B + C", missing-number,
 *    expanded-form and rounding questions
 *  - operation matches the lesson objective for SINGLE-SKILL computation lessons
 *    (an addition-only lesson must not contain subtraction, and vice-versa)
 *  - every err_/pattern_ tag is in the known Grade-2 vocabulary
 *  - every unitQuiz / testBank question's lessonId belongs to that unit (no cross-unit leakage)
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const QUIET = process.argv.includes('--quiet');

// ---- load metadata + unit data in a sandbox ----
const shared = fs.readFileSync(path.join(DATA, 'shared.js'), 'utf8');
const metaMatch = shared.match(/const UNITS_DATA = (\[[\s\S]*?\n\]);/);
if (!metaMatch) { console.error('Could not parse UNITS_DATA from shared.js'); process.exit(2); }
const meta = eval('(' + metaMatch[1] + ')'); // eslint-disable-line no-eval
const cap = {};
const sandbox = { _mergeUnitData: (i, d) => { cap[i] = d; }, console };
vm.createContext(sandbox);
for (let n = 1; n <= 10; n++) {
  const f = path.join(DATA, `u${n}.js`);
  vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: `u${n}.js` });
}

// ---- lesson objective contract (single-skill computation lessons) ----
// op: 'add' | 'sub' ; only listed lessons get an operation-alignment check.
const OP = {
  u1l2: 'add', u1l3: 'add',
  u3l1: 'add', u3l2: 'sub', u3l3: 'add',
  u4l1: 'add', u4l2: 'sub',
  u10l2: 'add',
};
// u4l1 sums intentionally cross 1,000 (three-digit + three-digit with a
// regrouped thousands place, per the lesson objective and CBE expectations).
// The ceiling covers the largest correct sum (~1,464) plus the highest
// over-count misconception distractor (~1,564) without relying on the check's
// 10% tolerance band.
const RANGE = { u1l2: 24, u1l3: 20, u3l1: 200, u3l2: 200, u3l3: 200, u4l1: 1600, u4l2: 1000, u10l2: 50 };

// ---- known Grade-2 tag vocabulary ----
const KNOWN_ERR = new Set(('err_over_count err_off_by_one err_under_count err_confused err_skip_count_error ' +
 'err_shape_name_confusion err_wrong_category err_counting_coins_error err_compare_place_value err_symmetry_confusion ' +
 'err_sharing_equally_confusion err_more_less_confusion err_fraction_size_confusion err_magnitude_error err_expanded_form_confusion ' +
 'err_coin_value_confusion err_counting_total_error err_line_plot_confusion err_repeated_addition_confusion err_side_count_confusion ' +
 'err_numerator_confusion err_graph_reading_confusion err_extra_regroup err_length_confusion err_denominator_confusion ' +
 'err_fraction_equal_parts_confusion err_tens_ones_swap err_three_number_strategy err_dollars_cents_confusion err_want_need_confusion ' +
 'err_rounding_error err_more_less_money_confusion err_equal_groups_confusion err_left_only err_place_value_confusion ' +
 'err_coin_name_confusion err_concept_confusion err_hundreds_tens_swap err_face_edge_vertex_confusion err_counted_symbols_not_key_value ' +
 'err_wrong_operation err_fact_family_confusion err_financial_literacy_confusion err_doubles_confusion err_measurement_reading_error ' +
 'err_wrong_fraction_name err_temperature_confusion err_digit_value_confusion err_reversed_digits err_rounds_wrong_place ' +
 'err_inverse_confusion err_counted_shaded_wrong err_right_only err_counted_coins_not_value err_picture_key_confusion ' +
 'err_vertex_count_confusion err_save_spend_give_confusion err_clock_hour_hand_confusion err_more_pieces_bigger_confusion ' +
 'err_rows_columns_confusion err_make_ten_confusion err_borrow_error err_estimate_exact_answer err_clock_minute_hand_confusion ' +
 'err_sub_instead err_capacity_confusion err_2d_3d_confusion err_add_instead err_attribute_confusion err_total_category_confusion ' +
 'err_tally_group_confusion err_groups_items_confusion err_unit_fraction_confusion err_word_problem_operation err_no_regroup ' +
 'err_reasonableness_confusion').split(/\s+/));

// ---- helpers ----
const numOf = (v) => { const m = String(v == null ? '' : v).replace(/[, ]/g, '').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
function classifyOp(t) {
  const s = String(t || ''); const tl = s.toLowerCase();
  if (/\baddition problem\b|\bwhich addition\b|sum (?:that is |of )?(?:greater|less|more|bigger|smaller)|greatest sum|smallest sum/.test(tl)) return 'add';
  const symSub = /\d\s*[−–-]\s*\d/.test(s), symAdd = /\d\s*\+\s*\d/.test(s);
  if (symSub && !symAdd) return 'sub';
  if (symAdd && !symSub) return 'add';
  if (symAdd && symSub) return 'mixed';
  if (/(?:_+|\d+)\s*[−–-]\s*(?:_+|\d+)\s*=/.test(s)) return 'sub';
  if (/(?:_+|\d+)\s*\+\s*(?:_+|\d+)\s*=/.test(s)) return 'add';
  const subKW = /(take away|taken away|gave away|gives away|give away|how many (?:are )?left|are left|how many remain|remain\b|fewer|how many more|how much more|spent|sold|drive away|fly away|flew away|hopped away|difference|subtract|borrow|minus|smaller number)/.test(tl);
  const addKW = /(in all|altogether|in total|total of|combined?|put (?:them )?together|sum of|how many.*together|add(ed|ing)?|plus|join)/.test(tl);
  const compKW = /(more or fewer|greater or less|more or less|greater than|less than)/.test(tl);
  if (addKW && compKW && !/take away|gave away|spent|sold|left|remain|difference/.test(tl)) return 'add';
  if (subKW && !addKW) return 'sub';
  if (subKW && addKW) {
    // a question whose RESULT is a total ("in all"/"altogether") with no subtraction-result phrase is addition
    const subResult = /(left|remain|how many more|how much more|difference|fewer|gave away|give away|gives away|fly away|flew away|drive away|spent|taken away)/.test(tl);
    const totalResult = /(in all|altogether|in total)/.test(tl);
    if (totalResult && !subResult) return 'add';
    return 'add-then-sub';
  }
  if (addKW) return 'add';
  if (/subtraction|borrow/.test(tl)) return 'sub';
  return 'unknown';
}
function arithExpected(t) {
  const s = String(t || '');
  if (/\b(wrong|mistake|is (?:he|she|it) right|who is right|says|right\?|correct\?)\b/i.test(s)) return null;
  if ((s.match(/_+/g) || []).length > 1) return null;
  if ((s.match(/=/g) || []).length > 1) return null;
  let m;
  if (!/_/.test(s) && (m = s.match(/(\d+(?:\s*\+\s*\d+)+)\s*=\s*\??\s*$/))) return m[1].match(/\d+/g).map(Number).reduce((a, b) => a + b, 0);
  if (m = s.match(/what is(?: the standard form of)?\s+(\d+(?:\s*\+\s*\d+)+)\s*\?\s*$/i)) return m[1].match(/\d+/g).map(Number).reduce((a, b) => a + b, 0);
  if (m = s.match(/what is\s+(\d+)\s*([+−–-])\s*(\d+)\s*\?\s*$/i)) { const A = +m[1], B = +m[3]; return /[+]/.test(m[2]) ? A + B : A - B; }
  if (m = s.match(/^\s*(\d+)\s*([+−–-])\s*(\d+)\s*=\s*\??\s*$/)) { const A = +m[1], B = +m[3]; return /[+]/.test(m[2]) ? A + B : A - B; }
  if (m = s.match(/^\s*(\d+)\s*([+−–-])\s*_+\s*=\s*(\d+)\s*\??\s*$/)) { const A = +m[1], C = +m[3]; return /[+]/.test(m[2]) ? C - A : A - C; }
  if (m = s.match(/^\s*_+\s*([+−–-])\s*(\d+)\s*=\s*(\d+)\s*\??\s*$/)) { const B = +m[2], C = +m[3]; return /[+]/.test(m[1]) ? C - B : C + B; }
  if (m = s.match(/round\s+(\d+)\s+to the nearest\s+(ten|hundred)/i)) { const A = +m[1], base = /hundred/i.test(m[2]) ? 100 : 10; return Math.round(A / base) * base; }
  return null;
}

// ---- run checks ----
const issues = []; // {sev:'CRITICAL'|'WARN', type, id, msg}
let scanned = 0;
function add(sev, type, id, msg) { issues.push({ sev, type, id, msg }); }

function checkQuestion(q, lessonId, where) {
  scanned++;
  const o = q.o || [], a = q.a;
  if (!Array.isArray(o) || o.length < 2) { add('CRITICAL', 'schema', where, 'fewer than 2 options'); return; }
  if (typeof a !== 'number' || a < 0 || a >= o.length) { add('CRITICAL', 'schema', where, `answer index ${a} out of range`); return; }
  const correct = o[a];
  if (!correct || correct.val == null || String(correct.val) === '') add('CRITICAL', 'answer_missing', where, 'correct option empty/missing');
  // duplicate values
  const vals = o.map((x) => String(x && x.val).trim().toLowerCase());
  const seen = {}; vals.forEach((v) => { if (v !== '') { if (seen[v]) add('CRITICAL', 'duplicate_choices', where, `duplicate option "${v}"`); seen[v] = 1; } });
  // tags
  if (correct.tag) add('WARN', 'correct_tagged', where, `correct option carries err tag "${correct.tag}"`);
  o.forEach((x, i) => {
    if (i === a || !x) return;
    if (!x.tag) add('CRITICAL', 'distractor_untagged', where, `distractor[${i}] "${x.val}" has no err tag`);
    else if (!/^err_/.test(x.tag)) add('CRITICAL', 'tag_prefix', where, `tag "${x.tag}" lacks err_ prefix`);
    else if (!KNOWN_ERR.has(x.tag)) add('CRITICAL', 'unknown_tag', where, `unknown error tag "${x.tag}"`);
    if (x.patternTag && !/^pattern_/.test(x.patternTag)) add('WARN', 'pattern_prefix', where, `patternTag "${x.patternTag}" lacks pattern_ prefix`);
  });
  // arithmetic
  const want = arithExpected(q.t);
  if (want != null) { const got = numOf(correct.val); if (got !== want) add('CRITICAL', 'incorrect_answer', where, `key=${got} but "${String(q.t).slice(0, 50)}" computes ${want}`); }
  // operation alignment
  const op = OP[lessonId];
  if (op) {
    const c = classifyOp(q.t);
    if ((c === 'sub' && op === 'add') || (c === 'add' && op === 'sub') || (c === 'add-then-sub' && op === 'add')) {
      add('CRITICAL', 'wrong_operation', where, `single-skill ${op.toUpperCase()} lesson contains ${c.toUpperCase()}: "${String(q.t).slice(0, 60)}"`);
    }
    const max = RANGE[lessonId];
    if (max && (op === 'add' || op === 'sub')) {
      const nums = (String(q.t).match(/\d+/g) || []).map(Number).concat(o.map((x) => numOf(x.val)).filter((v) => v != null));
      const mx = Math.max(0, ...nums); if (mx > max * 1.1) add('WARN', 'grade_range', where, `number ${mx} exceeds lesson ceiling ~${max}`);
    }
  }
}

for (let i = 0; i < meta.length; i++) {
  const u = meta[i], c = cap[i]; if (!c) continue;
  const unitId = u.id;
  u.lessons.forEach((les, j) => {
    const ld = (c.lessons || [])[j] || {};
    (ld.qBank || []).forEach((q, k) => checkQuestion(q, les.id, `${unitId}/${les.id}/qBank#${k}`));
  });
  const banks = [['unitQuiz', c.unitQuiz], ['testBank', c.testBank]];
  banks.forEach(([name, arr]) => {
    (arr || []).forEach((q, k) => {
      const lid = q.lessonId || '';
      const where = `${unitId}/${name}#${k}[${lid}]`;
      // leakage: lessonId must belong to this unit
      if (lid && !lid.startsWith(unitId + 'l')) add('CRITICAL', 'unit_quiz_leakage', where, `lessonId ${lid} not in unit ${unitId}`);
      checkQuestion(q, lid, where);
    });
  });
}

// ---- report ----
const byType = {}; const bySev = { CRITICAL: 0, WARN: 0 };
issues.forEach((x) => { byType[x.type] = (byType[x.type] || 0) + 1; bySev[x.sev]++; });
console.log(`Grade 2 content validation — ${scanned} questions scanned`);
console.log(`  CRITICAL: ${bySev.CRITICAL}   WARN: ${bySev.WARN}`);
console.log('  by type:', JSON.stringify(byType));
const crit = issues.filter((x) => x.sev === 'CRITICAL');
const warn = issues.filter((x) => x.sev === 'WARN');
if (crit.length) { console.log('\nCRITICAL issues:'); crit.forEach((x) => console.log(`  [${x.type}] ${x.id}: ${x.msg}`)); }
if (!QUIET && warn.length) { console.log(`\nWARN issues (${warn.length}):`); warn.slice(0, 60).forEach((x) => console.log(`  [${x.type}] ${x.id}: ${x.msg}`)); if (warn.length > 60) console.log(`  ...and ${warn.length - 60} more`); }
console.log(crit.length ? `\nFAIL — ${crit.length} critical issue(s).` : '\nPASS — no critical issues.');
process.exit(crit.length ? 1 : 0);
