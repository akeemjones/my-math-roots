#!/usr/bin/env node
// =============================================================================
//  audit-key-ideas.js
//
//  Walks every unit data file across K, G1, G2 and reports each lesson's
//  resolved Key Idea status — which path the new step-based modal takes for
//  that lesson:
//
//    custom-steps          lesson.keyIdeaSteps (author override) present
//    topic:<key>           topic detector matched, e.g. topic:pictograph
//    fallback-points       no topic match — per-point fallback over healthy points
//    fallback-synthesized  points missing/empty — defensive single-step from title
//    flag-no-points        lesson has no usable points AND no title
//    flag-possible-mismatch  topic matched but title strongly suggests mismatch
//
//  Reads SOURCE files (src/data/k/u*.js, src/data/g1/u*.js, src/data/u*.js).
//  G1 source uses ES module syntax which we strip the same way `build.js` does.
//
//  Usage:
//    node scripts/audit-key-ideas.js                  # writes TSV + summary
//    node scripts/audit-key-ideas.js --summary        # stderr-only (no TSV)
//    node scripts/audit-key-ideas.js --json           # JSON rows
// =============================================================================

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const MODE_SUMMARY = argv.includes('--summary');
const MODE_JSON    = argv.includes('--json');

// ── Topic detection rules — MUST stay in sync with src/key-ideas.js ──────────
const RULES = [
  ['regroup-sub',     /\bregroup.*subtract\b|\bsubtract.*regroup\b|\bborrow\b|trade\s+(a\s+)?ten\s+for|\btake[ -]?away\b.*\bregroup/],
  ['regroup-add',     /\bregroup\b|\bcarry(ing|\s+the\s+ten)?\b/],
  ['subitize',        /\bsubitiz(e|ing|ation)\b|\bquick\s+look(s)?\b|\binstant(ly)?\s+recogniz/],
  ['three-addends',   /\bthree\s+addends?\b|\badd\s+three\s+numbers?\b|\b3\s+addends?\b|\bthree[ -]number\s+sum|\bthree[ -]addend\b/],
  ['make-ten',        /\bmake[ -]?(a\s+)?(10|ten)\b|\bmake_a_ten\b|\bmake\s+ten\b/],
  ['doubles',         /\bnear[ -]doubles?\b|\bdoubles?\s+(and|or)\s+near\b|\bdoubles?\s+fact(s)?\b|\bdoubles!?\b/],
  ['bar-graph',       /\bbar[ -]?graph(s)?\b|\bbar\s+chart\b|\bbar[ -]?type\s+graph(s)?\b/],
  ['tally',           /\btally(\s+marks?|\s+chart)?\b|\bcross[ -]stroke\b/],
  ['line-plot',       /\bline\s+plot(s)?\b/],
  ['pictograph',      /\bpictograph(s)?\b|\bpicture\s+graph(s)?\b/],
  ['data-conclusion', /\bdraw(ing)?\s+conclusions?\b|\binterpret(ing)?\s+(the\s+)?data\b|\bconclusions?\s+from\s+(the\s+)?data\b/],
  ['compare-data',    /\bcompar(e|ing)\s+data\b|\bcompare\s+(the\s+)?(graphs?|tables?|results?)\b/],
  ['sort-groups',     /\bsort(ing)?\s+(into\s+)?(groups?|categor)|\bsort\s+by\b|\bsorting\b/],
  ['financial-literacy',
                      /\bearn(ing|ed)?\s+(income|money|jobs?)\b|\bgoods\s+and\s+services\b|\bspend(ing)?\s+(and|or)\s+sav(ing)?\b|\bsav(ing|e)\s+(and|or|,)\s+(spend|give)|\bsave[, ]+spend[, ]+(and\s+)?give\b|\bcharitable\s+giv(ing)?\b|\bwants?\s+(vs?\.?|and|or)\s+needs?\b|\bneeds?\s+(vs?\.?|and|or)\s+wants?\b|\bfinancial\s+liter/],
  ['symmetry',        /\bsymmetr(y|ic|ical)\b|\bline(s)?\s+of\s+symmetry\b|\bmirror\s+(shape|line|image)|\breflect(ion|ed)?\b.*\bshape\b/],
  ['fraction',        /\bfractions?\b|\b(equal|fair)\s+parts?\b|\bhalves?\b|\bthirds?\b|\bfourths?\b|\bquarters?\s+of\b|\bnumerator\b/],
  ['money',           /\bcoins?\b|\bpenny\b|\bpennies\b|\bnickel(s)?\b|\bdime(s)?\b|\bdollar(s)?\b|counting_coins/],
  ['time',            /\btell(ing)?\s+time\b|\bread\s+(the\s+)?clock\b|\bhour\s+hand\b|\bo['']clock\b|\bhalf[ -]past\b|\bwhat\s+time\b|\btime\s+(is|to\s+the)\b/],
  ['rounding',        /\bround(ing)?\s+(to|each|the|up|down|numbers?)\b|\bnearest\s+(10|ten|100|hundred)\b|\bestimat(e|ion|ing)\b|\bclose\s+enough\b|\breasonable(ness)?\b/],
  ['tens-addition',   /\b(add(ing)?|sum)\s+multiples\s+of\s+(10|ten)\b|\bmultiples\s+of\s+(10|ten)\b|\badd\s+(by\s+)?(10|tens)\b/],
  ['skip-count',      /\bskip[ -]count(ing)?\b|skip\s+by\s+\d|\b(count|skip)\s+by\s+(2|5|10)s?\b/],
  ['count-back',      /\b(subtract\w*|subtraction|take[ -]?away|minus)\b[\s\S]{0,200}\b(count\s+back|count\s+down|countback)\b|\b(count\s+back|count\s+down)\b[\s\S]{0,200}\b(subtract\w*|take[ -]?away|minus)\b/,
                      /\bcount\s+(on|up|forward(s)?)\b|count_on\b/],
  ['count-on',        /\bcount\s*-?\s*(on|forward(s)?|up|back(ward(s)?)?)\b|count_on|count_back|\bcounting\s+on\b/],
  ['number-line-add', /\bnumber\s*line\b.*\b(add|sum|plus|\+)\b|\b(add|sum|plus)\b.*\bnumber\s*line\b/],
  ['next-number',     /\bmissing\s+number(s)?\b|\bcomes\s+(before|after|next)\b|\bnumber\s+pattern(s)?\b|\bpattern.{0,40}blank\b|\bblank.{0,40}pattern\b|\bone\s+more.{0,40}one\s+less\b/],
  ['compare',         /\bcompar(e|ing|ison)\s+(numbers?|sets?)\b|\b(greater|less)\s+than\b|\bgreater_less_equal\b|\b[<>]\b|\bmore,?\s+less\b|\bmore\s+and\s+less\b/],
  ['place-value',     /\bplace\s+value\b|\btens?\s+and\s+ones?\b|\bhundreds?\b.*\btens?\b|\bbig\s+numbers\b|\bexpand(ed)?\s+form\b|\bgroups\s+of\s+ten\b/],
  ['equal-sharing',   /\bshar(e|ing)\s+equally\b|\bequal\s+shar(e|ing)\b|\bdivision\b|\bdivid(e|ing|ed)\b|÷|division_foundations|sharing_equally|\bsplit(ting)?\s+into\s+equal\s+groups\b/],
  ['number-bond',     /\bnumber\s+bond(s)?\b|\bpart-?part-?whole\b|\bfact\s+famil(y|ies)\b|fact_families|\bcompose\b.*\bdecompose\b|\bcompose\s+(and|&)\s+decompose\b|\bdecompose\b/],
  ['ten-frame',       /\bten[ -]frame(s)?\b|\bfiv(e)?[ -]frame\b/],
  ['story-problem',   /\b(word|story)\s+problem(s)?\b|\bjoin\s+(and|&)\s+separate\b|\bexplain\s+(your\s+)?(thinking|math|answer)\b|\bmath\s+stor(y|ies)\b|\bproblem[ -]solv/],
  ['shape',           /\b(2d|3d|flat|solid)\s+shapes?\b|\bsides?\s*(and|&)\s*corners?\b|\bgeometry\b|\bidentify\s+(the\s+)?shape\b/],
  ['measure',         /\bmeasure(ment|ing)?\b|\blength\b|\bheight\b|\bweight\b|\bcapacity\b/],
  ['counting',        /\bcount(ing)?\s+to\s+\d+|\bcount(ing)?\s+from\b|\bread\s+(and|&)\s+represent\b|\brepresent\s+(11|12|13|14|15|16|17|18|19|20|teen)/],
  ['array',           /\barrays?\b|\brepeated\s+addition\b|\bequal\s+groups?\b|\b\d\s*rows?\s+of\s+\d/]
];

function detect(lesson) {
  const lid    = String(lesson.id    || '').toLowerCase();
  const title  = String(lesson.title || '').toLowerCase();
  const pts    = (Array.isArray(lesson.points)      ? lesson.points      : []).join(' ').toLowerCase();
  const tags   = (Array.isArray(lesson.defaultTags) ? lesson.defaultTags : []).join(' ').toLowerCase();
  const blob   = lid + ' | ' + title + ' | ' + pts + ' | ' + tags;
  for (let i = 0; i < RULES.length; i++) {
    const rule = RULES[i];
    if (!rule[1].test(blob)) continue;
    if (rule[2] && rule[2].test(blob)) continue;  // exclusion regex
    return rule[0];
  }
  return null;
}

// ── Mismatch heuristic — flag suspicious topic matches ───────────────────────
// e.g. title says "Pictograph" but rules matched 'array' first (shouldn't happen
// with current ordering, but the audit double-checks).
function flagMismatch(lesson, topic) {
  if (!topic) return false;
  const title = String(lesson.title || '').toLowerCase();
  const conflicts = {
    'array':         /pictograph|picture\s+graph|bar\s+graph|tally/,
    'count-on':      /money|coin|fraction|time|shape/,
    'compare':       /money|coin|fraction|time|shape|pictograph|tally/,
  };
  const re = conflicts[topic];
  if (re && re.test(title)) return true;
  return false;
}

// ── Load all unit data via vm with shims ────────────────────────────────────
const sandbox = {
  console: { log: function(){}, warn: function(){}, error: function(){} },
  Date: Date, Math: Math, JSON: JSON, Object: Object, Array: Array,
  Number: Number, String: String, Boolean: Boolean, RegExp: RegExp,
  parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN, isFinite: isFinite,
  // Track which units the lazy-loader thinks are pending
  _unitLoadPromises: {},
  _kUnitLoadPromises: {},
  _g1UnitLoadPromises: {},
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
// Some bundles probe for these at top level
sandbox.document = { createElement: function(){return{};}, getElementById: function(){return null;} };
sandbox.localStorage = { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} };

vm.createContext(sandbox);

function loadFile(rel) {
  const p = path.join(ROOT, rel);
  let src = fs.readFileSync(p, 'utf8');
  // G1 sources use ES-module syntax — strip the same way build.js does.
  src = src.replace(/^export const /mg, 'const ').replace(/^export default\s+\S+;\s*$/m, '');
  // Top-level `const`/`let` are block-scoped in vm.runInContext and won't leak
  // onto sandbox. Promote a small set of well-known top-level identifiers we
  // need to inspect after load: UNITS_DATA, _UNITS_DATA_K, _UNITS_DATA_G1, the
  // *_SPEC variables, the merge functions, and the supporting factories the
  // unit files call (q, _ICO, etc.). We rewrite ONLY those identifiers, so we
  // don't risk colliding with arbitrary local consts inside function bodies.
  const PROMOTE = ['UNITS_DATA','_UNITS_DATA_K','_UNITS_DATA_G1',
                   '_mergeUnitData','_mergeKUnitData','_mergeG1UnitData',
                   '_unitLoadPromises','_kUnitLoadPromises','_g1UnitLoadPromises',
                   '_loadUnit','_loadKUnit','_loadG1Unit',
                   'q','_ICO','coinImg','coinSVG'];
  PROMOTE.forEach(function(name){
    // `^const NAME` or `^let NAME` or `^var NAME` or `^function NAME` at start of line
    src = src.replace(new RegExp('^(const|let|var)\\s+' + name + '\\b', 'mg'), 'var ' + name);
    src = src.replace(new RegExp('^function\\s+' + name + '\\b', 'mg'), 'var ' + name + ' = function ' + name);
  });
  // Also promote G1_U{n}_SPEC variants
  src = src.replace(/^const\s+(G1_U\d+_SPEC)\b/mg, 'var $1');
  vm.runInContext(src, sandbox, { filename: rel });
}

// Load shells first
loadFile('src/data/shared.js');
loadFile('src/data/shared_k.js');
loadFile('src/data/shared_g1.js');

// K Unit 10 references coinImg() from coin_assets.js. Load that helper too.
try { loadFile('src/data/k/coin_assets.js'); } catch (_e) {}
// Defensive stub if coin_assets didn't expose what's needed.
if (typeof sandbox.coinImg !== 'function') sandbox.coinImg = function(){ return ''; };
if (typeof sandbox.coinSVG !== 'function') sandbox.coinSVG = function(){ return ''; };

// Then each unit's content. For G1 source files we need the runtime merge call.
// The source file declares `const G1_U{n}_SPEC = {...}` but does NOT call
// `_mergeG1UnitData`. We invoke it manually here, same way build.js does.
const G1_UNIT_MAP = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 };

// G2 — src/data/u1..u10.js (already include _mergeUnitData calls)
for (let i = 1; i <= 10; i++) {
  loadFile('src/data/u' + i + '.js');
}

// K — src/data/k/u1..u10.js (excluding u9)
const K_UNIT_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 10];
for (const n of K_UNIT_NUMS) {
  loadFile('src/data/k/u' + n + '.js');
}

// G1 — src/data/g1/u1..u8.js, then call _mergeG1UnitData manually
for (const [fileNum, mergeIdx] of Object.entries(G1_UNIT_MAP)) {
  loadFile('src/data/g1/u' + fileNum + '.js');
  const specVar = 'G1_U' + fileNum + '_SPEC';
  if (sandbox[specVar]) {
    sandbox._mergeG1UnitData(mergeIdx, sandbox[specVar]);
  }
}

// ── Collect lessons across grades ────────────────────────────────────────────
const rows = [];

function appendLessons(grade, unitsArr) {
  if (!Array.isArray(unitsArr)) return;
  unitsArr.forEach(function(u){
    if (!u || !Array.isArray(u.lessons)) return;
    u.lessons.forEach(function(l){
      if (!l) return;
      rows.push({
        grade: grade,
        unitId: u.id || '',
        unitName: u.name || '',
        lessonId: l.id || '',
        title: l.title || '',
        points: Array.isArray(l.points) ? l.points : [],
        defaultTags: Array.isArray(l.defaultTags) ? l.defaultTags : [],
        hasKeyIdeaSteps: Array.isArray(l.keyIdeaSteps) && l.keyIdeaSteps.length > 0
      });
    });
  });
}

appendLessons('G2', sandbox.UNITS_DATA);
appendLessons('G1', sandbox._UNITS_DATA_G1);
appendLessons('K',  sandbox._UNITS_DATA_K);

// ── Resolve status per lesson ────────────────────────────────────────────────
// After the bullet-clicks refactor, the resolver always produces ONE STEP PER
// LESSON BULLET (lesson.points.length). The audit records:
//   - bulletCount  — number of lesson.points entries
//   - stepCount    — same as bulletCount after the refactor (or 1 when no points)
//   - alignment    — MATCHES when bulletCount > 0 (every bullet has a step);
//                    NO_POINTS when the lesson has no usable points
const resolved = rows.map(function(r){
  if (r.hasKeyIdeaSteps) {
    return Object.assign({}, r, { status: 'custom-steps', bulletCount: '?', stepCount: '?', alignment: 'CUSTOM' });
  }
  const usablePoints = r.points.filter(Boolean);
  const bulletCount = usablePoints.length;
  if (!usablePoints.length && !r.title) {
    return Object.assign({}, r, { status: 'flag-no-points', bulletCount: 0, stepCount: 0, alignment: 'NO_POINTS' });
  }
  const topic = detect(r);
  // Effective step count under the new resolver:
  //   - if a topic matched: stepCount = max(bulletCount, 1)  (per-point alignment)
  //   - if no topic:        stepCount = bulletCount or 1     (per-point fallback)
  const stepCount = bulletCount > 0 ? bulletCount : 1;
  const alignment = bulletCount > 0 ? 'MATCHES' : 'NO_POINTS';
  if (topic) {
    const status = flagMismatch(r, topic) ? 'flag-possible-mismatch' : ('topic:' + topic);
    return Object.assign({}, r, { status: status, detectedTopic: topic, bulletCount: bulletCount, stepCount: stepCount, alignment: alignment });
  }
  if (usablePoints.length) {
    return Object.assign({}, r, { status: 'fallback-points', bulletCount: bulletCount, stepCount: stepCount, alignment: alignment });
  }
  return Object.assign({}, r, { status: 'fallback-synthesized', bulletCount: 0, stepCount: 1, alignment: 'NO_POINTS' });
});

// ── Output ───────────────────────────────────────────────────────────────────
if (MODE_JSON) {
  process.stdout.write(JSON.stringify(resolved, null, 2));
} else if (!MODE_SUMMARY) {
  // TSV to stdout
  process.stdout.write('grade\tunitId\tlessonId\ttitle\tstatus\tbulletCount\tstepCount\talignment\n');
  for (const r of resolved) {
    process.stdout.write([r.grade, r.unitId, r.lessonId, r.title, r.status, r.bulletCount, r.stepCount, r.alignment].join('\t') + '\n');
  }
}

// ── Stderr summary (always written) ──────────────────────────────────────────
const counts = {};
const byGrade = { K: { total: 0, fallback: 0 }, G1: { total: 0, fallback: 0 }, G2: { total: 0, fallback: 0 } };
for (const r of resolved) {
  counts[r.status] = (counts[r.status] || 0) + 1;
  if (byGrade[r.grade]) {
    byGrade[r.grade].total++;
    if (r.status === 'fallback-points' || r.status === 'fallback-synthesized') byGrade[r.grade].fallback++;
  }
}

const total = resolved.length;
process.stderr.write('\n══ Key Idea Audit ══════════════════════════════════════════════════\n');
process.stderr.write('Total lessons audited: ' + total + '\n\n');

const orderedKeys = Object.keys(counts).sort(function(a, b){
  // sort: custom-steps, topic:*, fallback-*, flag-*
  function rank(k){
    if (k === 'custom-steps') return 0;
    if (k.startsWith('topic:')) return 1;
    if (k.startsWith('fallback-')) return 2;
    if (k.startsWith('flag-')) return 3;
    return 4;
  }
  const ra = rank(a), rb = rank(b);
  if (ra !== rb) return ra - rb;
  return a.localeCompare(b);
});

process.stderr.write('Status                       Count   Percent\n');
process.stderr.write('────────────────────────────  ─────  ───────\n');
for (const k of orderedKeys) {
  const n = counts[k];
  const pct = ((n / total) * 100).toFixed(1) + '%';
  process.stderr.write(k.padEnd(28) + '  ' + String(n).padStart(5) + '  ' + pct.padStart(7) + '\n');
}

process.stderr.write('\nPer-grade fallback rates:\n');
process.stderr.write('────────────────────────────  ─────  ───────\n');
for (const g of ['K', 'G1', 'G2']) {
  if (!byGrade[g].total) continue;
  const fb  = byGrade[g].fallback;
  const tot = byGrade[g].total;
  const pct = ((fb / tot) * 100).toFixed(1) + '%';
  process.stderr.write(g.padEnd(28) + '  ' + String(fb).padStart(5) + '/' + tot + '  fallback ' + pct + '\n');
}

// Flagged rows — full list
const flagged = resolved.filter(function(r){ return r.status.startsWith('flag-'); });
if (flagged.length) {
  process.stderr.write('\nFlagged for review (need manual fix or follow-up):\n');
  for (const r of flagged) {
    process.stderr.write('  [' + r.status + '] ' + r.grade + ' ' + r.lessonId + ' — ' + r.title + '\n');
  }
} else {
  process.stderr.write('\nNo lessons flagged.\n');
}

// ── Raw-markup scan ─────────────────────────────────────────────────────────
// Any lesson.points entry that carries raw <img>/<svg>/base64 markup needs the
// sanitizer in key-ideas.js so the modal step list and visual area never show
// raw HTML as text. This block lists every such case so a future regression is
// caught at audit time.
const RAW_MARKUP_RE = /<img\b|<svg\b|data:image|base64|data-coin|data-label\s*=|data-value\s*=/i;
const rawMarkupHits = [];
for (const r of resolved) {
  const dirty = (r.points || []).map(function(p, i){ return { i: i, p: String(p) }; })
    .filter(function(x){ return RAW_MARKUP_RE.test(x.p); });
  if (dirty.length) {
    rawMarkupHits.push({ grade: r.grade, lessonId: r.lessonId, title: r.title, count: dirty.length, status: r.status });
  }
}
process.stderr.write('\nLesson points containing raw HTML/base64 (handled by _sanitizeKeyIdeaPoint):\n');
if (rawMarkupHits.length) {
  for (const h of rawMarkupHits) {
    process.stderr.write('  ' + h.grade + ' ' + h.lessonId + ' — ' + h.title + ' (' + h.count + ' raw point(s), resolver status: ' + h.status + ')\n');
  }
} else {
  process.stderr.write('  None.\n');
}

process.stderr.write('═══════════════════════════════════════════════════════════════════\n');
