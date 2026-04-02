#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//  generate-review-html.js
//  Reads all generated question JSON files and writes a printable
//  HTML review document organized by Unit → Lesson → Difficulty.
//
//  Usage:
//    node scripts/generate-review-html.js
//
//  Output: scripts/review/questions-review.html
//          Open in browser → Ctrl+P → Save as PDF
// ════════════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');

const GEN_DIR    = path.join(__dirname, 'generated');
const REVIEW_DIR = path.join(__dirname, 'review');
const OUT_FILE   = path.join(REVIEW_DIR, 'questions-review.html');

// ── Unit / Lesson metadata ───────────────────────────────────────────
const UNIT_META = [
  {
    n: 1, name: 'Basic Fact Strategies', teks: 'TEKS 2.4A, 2.7A', color: '#FF2200',
    lessons: ['Count Up & Count Back', 'Doubles!', 'Make a 10', 'Number Families']
  },
  {
    n: 2, name: 'Place Value', teks: 'TEKS 2.2A-F, 2.7B, 2.9C', color: '#0095FF',
    lessons: ['Big Numbers', 'Different Ways to Write Numbers', 'Bigger or Smaller?', 'Skip Counting']
  },
  {
    n: 3, name: 'Add & Subtract to 200', teks: 'TEKS 2.4A-D, 2.7B-C', color: '#FF6600',
    lessons: ['Adding Bigger Numbers', 'Taking Away Bigger Numbers', 'Add Three Numbers', 'Math Stories']
  },
  {
    n: 4, name: 'Add & Subtract to 1,000', teks: 'TEKS 2.4A-D, 2.7B-C', color: '#9B59B6',
    lessons: ['Adding Really Big Numbers', 'Taking Away Really Big Numbers', 'Close Enough Counts!']
  },
  {
    n: 5, name: 'Money & Financial Literacy', teks: 'TEKS 2.5A-B, 2.11A-F', color: '#27AE60',
    lessons: ['All About Coins', 'Count Your Coins', 'Dollars and Cents', 'Save, Spend and Give']
  },
  {
    n: 6, name: 'Data Analysis', teks: 'TEKS 2.10A-D', color: '#E67E22',
    lessons: ['Tally Marks', 'Bar Graphs', 'Picture Graphs', 'Line Plots']
  },
  {
    n: 7, name: 'Measurement & Time', teks: 'TEKS 2.9A-G', color: '#16A085',
    lessons: ['How Long Is It?', 'What Time Is It?', 'Hot, Cold and Full']
  },
  {
    n: 8, name: 'Fractions', teks: 'TEKS 2.3A-D', color: '#E74C3C',
    lessons: ['What is a Fraction?', 'Halves, Fourths and Eighths', 'Which Piece is Bigger?']
  },
  {
    n: 9, name: 'Geometry', teks: 'TEKS 2.8A-E', color: '#8E44AD',
    lessons: ['Flat Shapes', 'Solid Shapes', 'Mirror Shapes']
  },
  {
    n: 10, name: 'Multiplication & Division', teks: 'TEKS 2.6A-B', color: '#2980B9',
    lessons: ['Equal Groups', 'Adding the Same Number', 'Sharing Equally']
  },
];

const DIFF_LABEL  = { e: 'Easy', m: 'Medium', h: 'Hard' };
const DIFF_COLOR  = { e: '#27ae60', m: '#e67e22', h: '#e74c3c' };
const DIFF_BG     = { e: '#eafaf1', m: '#fef9f0', h: '#fdf2f2' };
const ALPHA       = ['A', 'B', 'C', 'D'];

function loadQuestions(unitN, lessonN, d) {
  const f = path.join(GEN_DIR, `u${unitN}-l${lessonN}-${d}.json`);
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}

function loadTestBank(unitN, d) {
  const f = path.join(GEN_DIR, `u${unitN}-testbank-${d}.json`);
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderQuestions(questions, startNum) {
  if (!questions || questions.length === 0) return '<p class="no-data">No questions generated yet.</p>';
  let html = '';
  questions.forEach((q, i) => {
    const num = startNum + i;
    const correctLetter = ALPHA[q.a] || '?';
    html += `
      <div class="question">
        <div class="q-num-text"><span class="q-num">${num}.</span> ${escHtml(q.t)}</div>
        <div class="options">
          ${q.o.map((opt, oi) => `
            <span class="opt ${oi === q.a ? 'correct-opt' : ''}">
              <strong>${ALPHA[oi]})</strong> ${escHtml(opt)}${oi === q.a ? ' ✓' : ''}
            </span>
          `).join('')}
        </div>
        <div class="explanation"><strong>Explanation:</strong> ${escHtml(q.e)}</div>
      </div>`;
  });
  return html;
}

function renderDiffSection(questions, d, startNum) {
  const count = questions ? questions.length : 0;
  return `
    <div class="diff-section" style="border-left: 4px solid ${DIFF_COLOR[d]}; background:${DIFF_BG[d]}">
      <div class="diff-header" style="color:${DIFF_COLOR[d]}">
        ${DIFF_LABEL[d].toUpperCase()} (${count} questions)
      </div>
      ${renderQuestions(questions, startNum)}
    </div>`;
}

function countAll() {
  let total = 0;
  UNIT_META.forEach(unit => {
    unit.lessons.forEach((_, li) => {
      ['e', 'm', 'h'].forEach(d => {
        const qs = loadQuestions(unit.n, li + 1, d);
        if (qs) total += qs.length;
      });
    });
    ['e', 'm', 'h'].forEach(d => {
      const qs = loadTestBank(unit.n, d);
      if (qs) total += qs.length;
    });
  });
  return total;
}

function main() {
  if (!fs.existsSync(GEN_DIR)) {
    console.error('No generated/ directory found. Run generate-questions.js first.');
    process.exit(1);
  }

  if (!fs.existsSync(REVIEW_DIR)) fs.mkdirSync(REVIEW_DIR, { recursive: true });

  const totalQuestions = countAll();
  const generatedDate  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let body = '';
  let questionCounter = 1;

  UNIT_META.forEach(unit => {
    let unitHasContent = false;
    let unitHtml = '';

    unit.lessons.forEach((lessonTitle, li) => {
      let lessonHtml = '';
      let lessonHasContent = false;

      ['e', 'm', 'h'].forEach(d => {
        const qs = loadQuestions(unit.n, li + 1, d);
        if (qs && qs.length > 0) {
          lessonHasContent = true;
          unitHasContent   = true;
          lessonHtml += renderDiffSection(qs, d, questionCounter);
          questionCounter += qs.length;
        } else {
          lessonHtml += `
            <div class="diff-section" style="border-left:4px solid #ccc; background:#f9f9f9">
              <div class="diff-header" style="color:#999">${DIFF_LABEL[d].toUpperCase()} — not yet generated</div>
            </div>`;
        }
      });

      unitHtml += `
        <div class="lesson-block">
          <div class="lesson-title">Lesson ${li + 1}: ${escHtml(lessonTitle)}</div>
          ${lessonHtml}
        </div>`;
    });

    // TestBank
    let tbHtml = '';
    let tbHasContent = false;
    ['e', 'm', 'h'].forEach(d => {
      const qs = loadTestBank(unit.n, d);
      if (qs && qs.length > 0) {
        tbHasContent   = true;
        unitHasContent = true;
        tbHtml += renderDiffSection(qs, d, questionCounter);
        questionCounter += qs.length;
      } else {
        tbHtml += `
          <div class="diff-section" style="border-left:4px solid #ccc; background:#f9f9f9">
            <div class="diff-header" style="color:#999">${DIFF_LABEL[d].toUpperCase()} — not yet generated</div>
          </div>`;
      }
    });

    unitHtml += `
      <div class="lesson-block testbank">
        <div class="lesson-title">Unit ${unit.n} Test Bank</div>
        ${tbHtml}
      </div>`;

    body += `
      <div class="unit-block">
        <div class="unit-header" style="background:${unit.color}">
          <div class="unit-title">Unit ${unit.n}: ${escHtml(unit.name)}</div>
          <div class="unit-teks">${escHtml(unit.teks)}</div>
        </div>
        ${unitHtml}
      </div>`;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Math Roots — Question Bank Review</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 12px;
    color: #222;
    background: #fff;
    padding: 20px;
  }

  /* ── Cover page ── */
  .cover {
    text-align: center;
    padding: 60px 40px;
    margin-bottom: 40px;
    border-bottom: 3px solid #333;
  }
  .cover h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 8px; }
  .cover h2 { font-size: 18px; color: #555; font-weight: normal; margin-bottom: 20px; }
  .cover .meta { font-size: 13px; color: #777; line-height: 1.8; }
  .cover .badge {
    display: inline-block;
    background: #f0f4f8;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px 18px;
    margin: 6px;
    font-size: 12px;
  }
  .cover .badge strong { color: #333; }

  /* ── TOC ── */
  .toc { page-break-after: always; padding: 20px 0 40px; }
  .toc h2 { font-size: 18px; margin-bottom: 16px; color: #333; }
  .toc-unit { margin-bottom: 10px; }
  .toc-unit-name { font-size: 13px; font-weight: bold; color: #444; }
  .toc-lessons { margin-left: 16px; font-size: 11px; color: #666; line-height: 1.8; }

  /* ── Unit block ── */
  .unit-block { page-break-before: always; margin-bottom: 40px; }
  .unit-header {
    color: #fff;
    padding: 14px 18px;
    border-radius: 6px 6px 0 0;
    margin-bottom: 12px;
  }
  .unit-title { font-size: 18px; font-weight: bold; }
  .unit-teks  { font-size: 11px; opacity: 0.85; margin-top: 3px; }

  /* ── Lesson block ── */
  .lesson-block { margin-bottom: 24px; }
  .lesson-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    padding: 8px 12px;
    background: #f0f4f8;
    border-radius: 4px;
    margin-bottom: 8px;
    border-left: 4px solid #555;
  }
  .testbank .lesson-title { border-left-color: #8e44ad; background: #f5f0fa; }

  /* ── Difficulty section ── */
  .diff-section {
    margin-bottom: 12px;
    padding: 10px 14px;
    border-radius: 0 4px 4px 0;
  }
  .diff-header {
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }

  /* ── Question ── */
  .question {
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #ddd;
  }
  .question:last-child { border-bottom: none; margin-bottom: 0; }
  .q-num-text { font-size: 12px; color: #222; margin-bottom: 5px; line-height: 1.5; }
  .q-num { font-weight: bold; color: #555; }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 20px;
    margin: 4px 0 5px 16px;
    font-size: 11px;
  }
  .opt { white-space: nowrap; }
  .correct-opt { font-weight: bold; }
  .explanation {
    font-size: 11px;
    color: #555;
    margin-left: 16px;
    font-style: italic;
  }
  .no-data { font-size: 11px; color: #aaa; font-style: italic; padding: 4px 0; }

  /* ── Print styles ── */
  @media print {
    body { padding: 10px; font-size: 11px; }
    .unit-block { page-break-before: always; }
    .lesson-block { page-break-inside: avoid; }
    .question { page-break-inside: avoid; }
    .cover { page-break-after: always; }
    .toc { page-break-after: always; }
  }
</style>
</head>
<body>

<!-- Cover Page -->
<div class="cover">
  <h1>My Math Roots</h1>
  <h2>Question Bank Review — Grade 2 TEKS §111.4</h2>
  <p class="meta">
    Generated: ${generatedDate}<br>
    Total new questions: <strong>${totalQuestions.toLocaleString()}</strong>
  </p>
  <br>
  <div>
    <div class="badge"><strong>Easy</strong> — Single-step recall</div>
    <div class="badge"><strong>Medium</strong> — Applied understanding</div>
    <div class="badge"><strong>Hard</strong> — Multi-step / word problems</div>
  </div>
  <br>
  <p class="meta" style="color:#999; font-size:11px">
    Review all questions below before approving for injection into the app.<br>
    Each lesson has 20 easy + 20 medium + 20 hard questions.<br>
    Each unit test bank has 10 easy + 10 medium + 10 hard questions.
  </p>
</div>

<!-- Table of Contents -->
<div class="toc">
  <h2>Table of Contents</h2>
  ${UNIT_META.map(unit => `
    <div class="toc-unit">
      <div class="toc-unit-name">Unit ${unit.n}: ${escHtml(unit.name)} <span style="color:#888;font-weight:normal">(${unit.teks})</span></div>
      <div class="toc-lessons">
        ${unit.lessons.map((l, i) => `Lesson ${i + 1}: ${escHtml(l)}`).join('  ·  ')}
        &nbsp;·&nbsp; Unit Test Bank
      </div>
    </div>
  `).join('')}
</div>

<!-- Question Content -->
${body}

</body>
</html>`;

  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log(`\nReview document written to:\n  ${OUT_FILE}`);
  console.log(`\nTotal new questions included: ${questionCounter - 1}`);
  console.log('\nOpen the file in a browser, then print (Ctrl+P) → Save as PDF.');
  console.log('\nNext step (after approval): node scripts/merge-questions.js --unit=all');
}

main();
