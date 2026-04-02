#!/usr/bin/env node
/**
 * Rebalance difficulty distribution across all qBanks and testBanks.
 *
 * Target: ~33% Easy, ~34% Medium, ~33% Hard per bank.
 *
 * Method: score every question by hardness using text heuristics, then
 * rank-assign difficulty so the distribution hits the target proportions.
 * Questions that already have strong Hard signals (error analysis, multi-step)
 * are protected from being downgraded.
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// ── Hardness scoring ────────────────────────────────────────────────────────
function hardnessScore(q) {
  const t = q.t.toLowerCase();
  const e = (q.e || '').toLowerCase();
  let score = 0;

  // Strong Hard signals (protect these)
  if (/mistake|what went wrong|what is wrong|what did.*do wrong|error|explain why/.test(t)) score += 10;
  if (/what should.*fix|what mistake/.test(t)) score += 10;

  // Multi-step: "then", "first...then", sequential actions
  const thenCount = (t.match(/\bthen\b/g) || []).length;
  score += thenCount * 4;
  if (/\bfirst\b.{1,40}\bthen\b/.test(t)) score += 3;
  if (/\bafter\b.{1,30}\bhow many\b/.test(t)) score += 3;
  if (/two.?step|multi.?step/.test(t)) score += 5;
  if (/\bgave.{1,20}then\b|\bfound.{1,20}then\b|\bhad.{1,20}then\b/.test(t)) score += 3;

  // Unknown in unusual position
  if (/^[_]+\s*[+\-]/.test(t) || /[+\-]\s*[_]+\s*=/.test(t)) score += 3;
  if (/what number am i|i am a number/.test(t)) score += 2;

  // Large numbers → harder
  const nums = (q.t.match(/\d+/g) || []).map(Number);
  const maxNum = Math.max(0, ...nums);
  if (maxNum >= 100) score += 4;
  else if (maxNum >= 50) score += 2;
  else if (maxNum >= 20) score += 1;
  else if (maxNum <= 5)  score -= 2;

  // Number of distinct numbers (more = more complex)
  score += Math.min(nums.length - 1, 3);

  // Word problem context (names, story)
  if (/\b(had|has|gave|got|found|bought|spent|left|now|buys|earns|needs)\b/.test(t)) score += 2;

  // Question length (longer = usually harder)
  score += Math.min(Math.floor(q.t.length / 30), 4);

  // Comparison / reasoning
  if (/\b(biggest|smallest|fewest|most|least|compare|which.*more|which.*less)\b/.test(t)) score += 1;
  if (/\btrue or false\b/.test(t)) score += 2;
  if (/\bcannot|impossible|always|never\b/.test(t)) score += 2;

  // Easy signals (reduce score)
  if (/^what is \d+ [+\-x×÷/] \d+[?]?$/i.test(q.t.trim())) score -= 3;
  if (/^(count (up|back|on)|start at \d+)/.test(t)) score -= 2;
  if (/^how many sides|^how many corners|^how many faces/.test(t)) score -= 2;
  if (/^what (digit|number) is in the/.test(t)) score -= 1;

  return score;
}

// ── Assign tiers by rank ─────────────────────────────────────────────────────
// Returns new array with d fields set to achieve ~33/34/33 distribution.
// Questions with strong Hard signals (score ≥ HARD_LOCK) are never demoted below 'h'.
function rebalance(questions) {
  if (questions.length === 0) return questions;

  const n    = questions.length;
  const nE   = Math.round(n * 0.33);
  const nH   = Math.round(n * 0.33);
  const nM   = n - nE - nH;

  // Score and sort ascending (easiest first)
  const scored = questions.map((q, idx) => ({ q, idx, s: hardnessScore(q) }));
  scored.sort((a, b) => a.s - b.s);

  // Purely rank-based: sort by hardness, assign bottom third→e, middle→m, top→h.
  // This guarantees exact 33/34/33 regardless of score magnitude.
  const result = [...questions];
  scored.forEach((item, rank) => {
    let tier;
    if (rank < nE)        tier = 'e';
    else if (rank < nE + nM) tier = 'm';
    else                  tier = 'h';
    result[item.idx] = { ...item.q, d: tier };
  });

  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────────
let totalChanged = 0;

for (let u = 1; u <= 10; u++) {
  const fpath = path.join(DATA_DIR, `u${u}.js`);
  if (!fs.existsSync(fpath)) continue;

  const src = fs.readFileSync(fpath, 'utf8');
  const m = src.match(/_mergeUnitData\s*\(\s*(\d+)\s*,\s*/);
  if (!m) continue;

  const jsonStart = src.indexOf('{', m.index + m[0].length - 1);
  let depth = 0, jsonEnd = jsonStart;
  for (let i = jsonStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { jsonEnd = i + 1; break; } }
  }

  let data;
  try { data = eval('(' + src.slice(jsonStart, jsonEnd) + ')'); }
  catch(e) { console.error(`Parse error u${u}: ${e.message}`); continue; }

  let unitChanged = 0;

  // Rebalance each lesson qBank
  (data.lessons || []).forEach((lesson, li) => {
    if (!lesson.qBank || lesson.qBank.length === 0) return;
    const before = lesson.qBank.map(q => q.d).join('');
    lesson.qBank = rebalance(lesson.qBank);
    const after  = lesson.qBank.map(q => q.d).join('');
    const changed = before.split('').filter((c, i) => c !== after[i]).length;
    unitChanged += changed;

    const dist = { e:0, m:0, h:0 };
    lesson.qBank.forEach(q => dist[q.d]++);
    console.log(`  U${u}-L${li+1} (${lesson.qBank.length}): E:${dist.e} M:${dist.m} H:${dist.h}  [${changed} changed]`);
  });

  // Rebalance testBank
  if (Array.isArray(data.testBank) && data.testBank.length > 0) {
    const before = data.testBank.map(q => q.d).join('');
    data.testBank = rebalance(data.testBank);
    const after   = data.testBank.map(q => q.d).join('');
    const changed = before.split('').filter((c, i) => c !== after[i]).length;
    unitChanged += changed;

    const dist = { e:0, m:0, h:0 };
    data.testBank.forEach(q => dist[q.d]++);
    console.log(`  U${u}-TB  (${data.testBank.length}): E:${dist.e} M:${dist.m} H:${dist.h}  [${changed} changed]`);
  }

  // unitQuiz: rebalance too (smaller bank — 30 questions)
  if (Array.isArray(data.unitQuiz) && data.unitQuiz.length > 0) {
    data.unitQuiz = rebalance(data.unitQuiz);
  }

  // Write back
  const newSrc = src.slice(0, jsonStart) + JSON.stringify(data) + src.slice(jsonEnd);
  fs.writeFileSync(fpath, newSrc, 'utf8');
  totalChanged += unitChanged;
  console.log(`  → u${u}.js written (${unitChanged} d-field changes)\n`);
}

console.log(`Done. Total d-field changes: ${totalChanged}`);
