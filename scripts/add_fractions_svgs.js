#!/usr/bin/env node
// scripts/add_fractions_svgs.js
// Adds fraction diagram SVGs to unit 8 (Fractions) practice questions.
// Run: node scripts/add_fractions_svgs.js
// Run: node scripts/add_fractions_svgs.js --preview
// Backs up src/data/u8.js → src/data/u8.js.bak2 before writing.

'use strict';
const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, '../src/data/u8.js');
const BAK  = SRC + '.bak2';

// ── SVG generators ────────────────────────────────────────────────────────────

/** Fraction circle (pie chart). total slices, shaded of them filled. */
function fractionCircleSVG(total, shaded) {
  const cx = 55, cy = 55, r = 44;
  const W = 110, H = 110;
  const FILL   = '#4e9af1';
  const EMPTY  = '#e8f0ff';
  const STROKE = '#3a5fa0';

  let slices = '';

  if (total === 1) {
    // Full circle
    slices = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${shaded ? FILL : EMPTY}" stroke="${STROKE}" stroke-width="1.5"/>`;
  } else {
    for (let i = 0; i < total; i++) {
      const a1 = (i / total) * 2 * Math.PI - Math.PI / 2;
      const a2 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
      const x1 = +(cx + r * Math.cos(a1)).toFixed(2);
      const y1 = +(cy + r * Math.sin(a1)).toFixed(2);
      const x2 = +(cx + r * Math.cos(a2)).toFixed(2);
      const y2 = +(cy + r * Math.sin(a2)).toFixed(2);
      const large = (1 / total) > 0.5 ? 1 : 0;
      const fill = i < shaded ? FILL : EMPTY;
      slices += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" fill="${fill}" stroke="${STROKE}" stroke-width="1.2"/>`;
    }
  }

  const label = `${shaded}/${total}`;
  return `<svg width="120" height="130" viewBox="0 0 ${W} 120" style="display:block;margin:8px auto">`
    + slices
    + `<text x="${cx}" y="108" font-size="10" fill="#333" text-anchor="middle" font-weight="bold">${label}</text>`
    + `</svg>`;
}

/** Fraction rectangle. total cells in a row, shaded of them filled. */
function fractionRectSVG(total, shaded) {
  const W = 20, H = 28;
  const PAD = 4;
  const totalW = total * W + PAD * 2;
  const FILL   = '#f4a540';
  const EMPTY  = '#fff7e6';
  const STROKE = '#b07020';

  let cells = '';
  for (let i = 0; i < total; i++) {
    const x = PAD + i * W;
    const fill = i < shaded ? FILL : EMPTY;
    cells += `<rect x="${x}" y="${PAD}" width="${W}" height="${H}" fill="${fill}" stroke="${STROKE}" stroke-width="1.2" rx="2"/>`;
  }

  const label = `${shaded}/${total}`;
  return `<svg width="${Math.min(totalW * 2, 280)}" height="60" viewBox="0 0 ${totalW} ${H + PAD * 2 + 12}" style="display:block;margin:8px auto">`
    + cells
    + `<text x="${totalW / 2}" y="${H + PAD * 2 + 10}" font-size="8" fill="#333" text-anchor="middle" font-weight="bold">${label}</text>`
    + `</svg>`;
}

// ── Parser ────────────────────────────────────────────────────────────────────

const WORD_TO_NUM = {
  half: 2, halves: 2, second: 2, seconds: 2,
  third: 3, thirds: 3,
  quarter: 4, quarters: 4, fourth: 4, fourths: 4,
  fifth: 5, fifths: 5,
  sixth: 6, sixths: 6,
  seventh: 7, sevenths: 7,
  eighth: 8, eighths: 8,
};

function parseFractionQ(text) {
  const t = text.toLowerCase();

  // ── 1. Find total (denominator) ──────────────────────────────────────────

  let total = null;

  // "(\d+) equal (parts|slices|pieces|halves|squares|sections|pieces|parts)"
  const totalRe = /(\d+)\s+equal\s+(?:parts?|slices?|pieces?|halves?|squares?|sections?|boxes?)/;
  const mTotal  = t.match(totalRe);
  if (mTotal) total = parseInt(mTotal[1]);

  // Word forms: "halves", "eighths", etc.
  if (!total) {
    for (const [word, num] of Object.entries(WORD_TO_NUM)) {
      if (new RegExp('\\b' + word + '\\b').test(t)) { total = num; break; }
    }
  }

  // "divided/split/cut into (\d+)"
  if (!total) {
    const m = t.match(/(?:divided|split|cut|broken)\s+into\s+(\d+)/);
    if (m) total = parseInt(m[1]);
  }

  // Explicit fraction denominator: "(\d+)/(\d+)" — use denominator
  if (!total) {
    const m = t.match(/\b\d+\/(\d+)\b/);
    if (m) total = parseInt(m[1]);
  }

  if (!total || total < 2 || total > 12) return null;

  // ── 2. Find shaded (numerator) ───────────────────────────────────────────

  let shaded = null;
  let askingForLeft = /left\b|remain|not\s+(?:used|eaten|colored|shaded)|not\s+color/i.test(text);

  // "(\d+) (parts?|slices?|pieces?) (are|is) (shaded|colored|red|blue|...)"
  const shadedRe = /(\d+)\s+(?:parts?|slices?|pieces?|boxes?)\s+(?:are|is)\s+(?:shaded|colored|red|blue|green|purple|orange|yellow|pepperoni)/i;
  const mShaded  = text.match(shadedRe);
  if (mShaded) shaded = parseInt(mShaded[1]);

  // "all (\d+) parts are shaded" / "all parts"
  if (!shaded && /\ball\s+(?:\d+\s+)?parts?\s+(?:are\s+)?shaded/i.test(text)) shaded = total;

  // "you eat (\d+)" / "eats (\d+) (slices|pieces)" / "ate (\d+)"
  if (!shaded) {
    const m = text.match(/(?:you\s+eat|eats?|ate|uses?|used)\s+(\d+)/i);
    if (m) shaded = parseInt(m[1]);
  }

  // "gives? away (\d+)"
  if (!shaded) {
    const m = text.match(/gives?\s+away\s+(\d+)/i);
    if (m) shaded = parseInt(m[1]);
  }

  // "colored (\d+)" / "shade (\d+)"
  if (!shaded) {
    const m = text.match(/(?:shaded?|colored?)\s+(\d+)/i);
    if (m) shaded = parseInt(m[1]);
  }

  // Explicit fraction numerator: "(\d+)/N" where N = total
  if (!shaded) {
    const re = new RegExp('\\b(\\d+)\\/' + total + '\\b');
    const m  = text.match(re);
    if (m) shaded = parseInt(m[1]);
  }

  // "(\d+) out of N"
  if (!shaded) {
    const re = new RegExp('(\\d+)\\s+out\\s+of\\s+' + total);
    const m  = text.match(re);
    if (m) shaded = parseInt(m[1]);
  }

  if (shaded === null) return null;

  // "left/remaining" → reverse shaded
  if (askingForLeft) shaded = total - shaded;

  if (shaded < 0 || shaded > total) return null;

  // ── 3. Shape ─────────────────────────────────────────────────────────────

  const isCircle = /circle|pie|pizza|cookie|pancake|brownie|cake|coin|wheel|donut/i.test(text);
  const shape    = isCircle ? 'circle' : 'rect';

  return { total, shaded, shape };
}

// ── Main processing ───────────────────────────────────────────────────────────

function addSVGToQuestion(q, previews) {
  const t = q.t;
  if (!t || t.includes('<svg') || q.s) return q;

  const parsed = parseFractionQ(t);
  if (!parsed) return q;

  const { total, shaded, shape } = parsed;
  const svg = shape === 'circle'
    ? fractionCircleSVG(total, shaded)
    : fractionRectSVG(total, shaded);

  if (previews) previews.push({ type: shape === 'circle' ? 'Circle' : 'Rectangle', total, shaded, text: t, svg });

  return { ...q, s: svg };
}

function processUnit(data, previews) {
  let added = 0, skipped = 0;

  function processArray(arr) {
    return (arr || []).map(q => {
      const updated = addSVGToQuestion(q, previews);
      if (updated !== q) added++;
      else if (q.t && !q.t.includes('<svg') && !q.s) skipped++;
      return updated;
    });
  }

  const lessons = data.lessons.map(l => ({
    ...l,
    qBank:    processArray(l.qBank),
    quiz:     processArray(l.quiz),
    practice: processArray(l.practice),
  }));
  const testBank = processArray(data.testBank);

  return { data: { ...data, lessons, testBank }, added, skipped };
}

// ── Run ───────────────────────────────────────────────────────────────────────

const src   = fs.readFileSync(SRC, 'utf8');
const match = src.match(/(_mergeUnitData\(\d+,\s*)(\{[\s\S]*\})(\s*\);?\s*)$/);
if (!match) { console.error('Could not parse u8.js structure'); process.exit(1); }

let unitData;
try { unitData = JSON.parse(match[2]); }
catch (e) { console.error('JSON parse error:', e.message); process.exit(1); }

const isPreview = process.argv.includes('--preview');
const previews  = isPreview ? [] : null;

const { data: updated, added, skipped } = processUnit(unitData, previews);
console.log(`SVGs added : ${added}`);
console.log(`Unparseable: ${skipped}`);

if (isPreview) {
  // Group by chart type for easier review
  const byType = {};
  previews.forEach(p => { (byType[p.type] = byType[p.type] || []).push(p); });

  const sections = Object.entries(byType).map(([type, items]) => {
    const cards = items.map((p, i) => `
      <div class="card">
        <div class="tag">${type} · ${p.shaded}/${p.total}</div>
        <div class="svg-box">${p.svg}</div>
        <div class="q-text">${p.text.replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0,200)}</div>
      </div>`).join('');
    return `<h2>${type} (${items.length})</h2>` + cards;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Fractions SVG Preview (${previews.length} charts)</title>
<style>
  body{font-family:sans-serif;background:#f5f7ff;padding:24px}
  h1,h2{color:#333}
  .summary{margin-bottom:24px;color:#555}
  .card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .tag{font-size:12px;font-weight:700;color:#4e9af1;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
  .svg-box{display:flex;justify-content:center;padding:10px;background:rgba(0,0,0,.025);border-radius:8px;margin-bottom:10px}
  .q-text{font-size:13px;color:#444}
</style></head><body>
<h1>Fractions SVG Preview</h1>
<div class="summary">${previews.length} diagrams to be added. Run without --preview to apply.</div>
${sections}
</body></html>`;

  const out = path.join(__dirname, '../preview.html');
  fs.writeFileSync(out, html, 'utf8');
  console.log(`Preview written to ${out}`);
  process.exit(0);
}

fs.copyFileSync(SRC, BAK);
console.log(`Backed up to ${BAK}`);

const newSrc = match[1] + JSON.stringify(updated) + match[3];
fs.writeFileSync(SRC, newSrc, 'utf8');
console.log(`Written to ${SRC} (${(fs.statSync(SRC).size / 1024).toFixed(0)}KB)`);
