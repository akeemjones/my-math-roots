#!/usr/bin/env node
// scripts/add_u6_svgs.js
// Adds SVG visuals to the ~112 questions in u6.js that only have plain text.
// Run: node scripts/add_u6_svgs.js
// Backs up src/data/u6.js → src/data/u6.js.bak2 before writing.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src/data/u6.js');
const BAK = SRC + '.bak2';

// ── SVG generators ────────────────────────────────────────────────────────────

const COLORS = ['#4e9af1','#f4a540','#e05a5a','#4ec98a','#a270d4'];
const PICTO_SYMBOLS = ['★','●','♥','■','▲'];

/** Compact bar chart SVG (~360 chars).
 *  items: [{label, value}], title: string (optional) */
function barChartSVG(items, title) {
  const W = 140, H = 80;
  const maxV = Math.max(...items.map(i => i.value), 1);
  const barW = Math.max(14, Math.floor((W - 20) / items.length) - 4);
  const gap = Math.floor((W - 20 - barW * items.length) / (items.length + 1));
  const axisY = H - 14;

  let bars = '';
  items.forEach((item, idx) => {
    const bh = Math.round((item.value / maxV) * (axisY - 10));
    const x = 10 + gap + idx * (barW + gap);
    const y = axisY - bh;
    const color = COLORS[idx % COLORS.length];
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${color}" rx="2"/>`;
    bars += `<text x="${x + barW/2}" y="${y - 2}" font-size="5.5" fill="#333" text-anchor="middle">${item.value}</text>`;
    // Label: truncate to 5 chars to fit
    const lbl = item.label.length > 5 ? item.label.slice(0, 4) + '…' : item.label;
    bars += `<text x="${x + barW/2}" y="${axisY + 8}" font-size="5" fill="#555" text-anchor="middle">${lbl}</text>`;
  });

  const titleEl = title
    ? `<text x="${W/2}" y="7" font-size="5.5" fill="#333" text-anchor="middle" font-weight="bold">${title.slice(0,28)}</text>`
    : '';

  return `<svg width="280" height="160" viewBox="0 0 ${W} ${H}" style="display:block;margin:8px auto">`
    + titleEl
    + `<line x1="10" y1="10" x2="10" y2="${axisY}" stroke="#555" stroke-width="1.2"/>`
    + `<line x1="10" y1="${axisY}" x2="${W-4}" y2="${axisY}" stroke="#555" stroke-width="1.2"/>`
    + bars
    + `</svg>`;
}

/** Compact pictograph SVG.
 *  items: [{label, value}], key: number (value per symbol), symbol index */
function pictographSVG(items, keyValue, symbolIdx) {
  const sym = PICTO_SYMBOLS[symbolIdx % PICTO_SYMBOLS.length];
  const color = COLORS[symbolIdx % COLORS.length];
  const rowH = 14;
  const H = items.length * rowH + 18;
  const W = 130;

  let rows = '';
  items.forEach((item, idx) => {
    const y = 14 + idx * rowH;
    // Label column (40px wide)
    const lbl = item.label.length > 7 ? item.label.slice(0, 6) + '…' : item.label;
    rows += `<text x="2" y="${y + 9}" font-size="6" fill="#333">${lbl}</text>`;
    // item.value is always the explicit symbol count from the question text
    // (e.g. "The blue row has 5 stars" → value=5 → draw 5 symbols).
    // Do NOT divide by keyValue — the key exists only for answering the question,
    // not for determining how many symbols to render.
    const count = item.value;
    for (let s = 0; s < Math.min(count, 12); s++) {
      rows += `<text x="${44 + s * 8}" y="${y + 9}" font-size="8" fill="${color}">${sym}</text>`;
    }
  });

  const keyLabel = `Key: ${sym} = ${keyValue}`;
  return `<svg width="260" height="${H*2}" viewBox="0 0 ${W} ${H}" style="display:block;margin:8px auto">`
    + `<text x="2" y="8" font-size="5.5" fill="#666" font-style="italic">${keyLabel}</text>`
    + `<line x1="42" y1="10" x2="42" y2="${H-4}" stroke="#ccc" stroke-width="0.8"/>`
    + rows
    + `</svg>`;
}

/** Compact tally table SVG */
function tallySVG(items) {
  const rowH = 14;
  const H = items.length * rowH + 14;
  const W = 120;

  let rows = '';
  items.forEach((item, idx) => {
    const y = 12 + idx * rowH;
    const bg = idx % 2 === 0 ? '#f8f9ff' : '#fff';
    rows += `<rect x="2" y="${y}" width="${W-4}" height="${rowH}" fill="${bg}" rx="2"/>`;
    const lbl = item.label.length > 8 ? item.label.slice(0, 7) + '…' : item.label;
    rows += `<text x="6" y="${y + 9}" font-size="6.5" fill="#333">${lbl}</text>`;
    rows += `<text x="56" y="${y + 9}" font-size="6.5" fill="#333">${item.value}</text>`;
    // Draw tally marks
    const n = Math.min(item.value, 15);
    for (let i = 0; i < n; i++) {
      const gx = 72 + Math.floor(i / 5) * 16 + (i % 5) * 3;
      if (i % 5 === 4) {
        // diagonal cross stroke
        rows += `<line x1="${gx-9}" y1="${y+2}" x2="${gx+2}" y2="${y+12}" stroke="#444" stroke-width="1.2" stroke-linecap="round"/>`;
      } else {
        rows += `<line x1="${gx}" y1="${y+3}" x2="${gx}" y2="${y+11}" stroke="#444" stroke-width="1.5" stroke-linecap="round"/>`;
      }
    }
  });

  return `<svg width="240" height="${H*2}" viewBox="0 0 ${W} ${H}" style="display:block;margin:8px auto">`
    + `<rect x="2" y="2" width="${W-4}" height="${H-4}" fill="#f0f4ff" rx="4" stroke="#c8d4ff" stroke-width="0.8"/>`
    + `<text x="6" y="9" font-size="5.5" fill="#666" font-weight="bold">Category</text>`
    + `<text x="56" y="9" font-size="5.5" fill="#666" font-weight="bold">Count</text>`
    + `<text x="72" y="9" font-size="5.5" fill="#666" font-weight="bold">Tally</text>`
    + `<line x1="2" y1="11" x2="${W-2}" y2="11" stroke="#c8d4ff" stroke-width="0.8"/>`
    + rows
    + `</svg>`;
}

/** Compact line plot SVG.
 *  points: [{value: number, count: number}] — value on the number line, count = × marks */
function linePlotSVG(points) {
  points.sort((a, b) => a.value - b.value);
  const minV  = points[0].value;
  const maxV  = points[points.length - 1].value;
  const range = maxV - minV;
  const maxCount = Math.max(...points.map(p => p.count));

  const W       = 130;
  const xPad    = 12;
  const spacing = range > 0 ? Math.min(20, Math.floor((W - xPad * 2) / range)) : 20;
  const axisY   = 8 + maxCount * 9 + 2;
  const H       = axisY + 16;

  const countMap = {};
  points.forEach(p => { countMap[p.value] = p.count; });

  let marks = '';
  for (let v = minV; v <= maxV; v++) {
    const x = xPad + (v - minV) * spacing;
    // Tick + label
    marks += `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 4}" stroke="#555" stroke-width="0.8"/>`;
    marks += `<text x="${x}" y="${axisY + 11}" font-size="6" fill="#333" text-anchor="middle">${v}</text>`;
    // × marks stacked upward
    const n = countMap[v] || 0;
    for (let i = 0; i < n; i++) {
      const markY = axisY - 2 - i * 9;
      marks += `<text x="${x}" y="${markY}" font-size="8" fill="#4e9af1" text-anchor="middle">×</text>`;
    }
  }

  return `<svg width="260" height="${H * 2}" viewBox="0 0 ${W} ${H}" style="display:block;margin:8px auto">`
    + `<line x1="${xPad - 6}" y1="${axisY}" x2="${W - 4}" y2="${axisY}" stroke="#555" stroke-width="1.2"/>`
    + marks
    + `</svg>`;
}

// ── Parsers ───────────────────────────────────────────────────────────────────

/** Parse "Label=N" pairs from a question string.
 *  Returns [{label, value}] or null */
function parseKeyValues(text) {
  const pairs = [];

  // Pattern 1: Word=number (e.g. "Pizza=9, Tacos=4")
  const re1 = /([A-Za-z][A-Za-z ]{0,14}?)=(\d+)/g;
  let m;
  while ((m = re1.exec(text)) !== null) {
    const lbl = m[1].trim();
    if (lbl && !/^(each|star|picture|symbol|key|vote|student|kids?|marks?|count|total|row|bar)$/i.test(lbl)) {
      pairs.push({ label: lbl, value: parseInt(m[2]) });
    }
  }
  if (pairs.length >= 2) return pairs;

  // Pattern 2: "X has N" or "X: N" (case-insensitive label start)
  const re2 = /\b([A-Za-z][a-zA-Z]{1,14})\s+has\s+(\d+)/g;
  while ((m = re2.exec(text)) !== null) {
    const lbl = m[1].trim();
    if (!/^(each|the|this|that|a|an|row|bar)$/i.test(lbl)) {
      pairs.push({ label: lbl, value: parseInt(m[2]) });
    }
  }
  if (pairs.length >= 2) return pairs;

  // Pattern 3: "The X row has N" style
  const re3 = /[Tt]he\s+([A-Za-z][a-zA-Z]{1,14})\s+row\s+has\s+(\d+)/g;
  while ((m = re3.exec(text)) !== null) {
    pairs.push({ label: m[1].trim(), value: parseInt(m[2]) });
  }
  if (pairs.length >= 1) return pairs; // single-row is OK for pictographs

  return null;
}

/** Parse pictograph: returns {items:[{label,count}], keyValue, symbolIdx} or null */
function parsePictograph(text) {
  const items = parseKeyValues(text);
  if (!items) return null;

  // Extract key value: "each star = 2" or "each picture = 5"
  const keyMatch = text.match(/each\s+\S+\s*=\s*(\d+)/i);
  const keyValue = keyMatch ? parseInt(keyMatch[1]) : 1;

  // Symbol index based on what symbol word is used
  const symWords = ['star','heart','circle','square','smiley','ball','picture'];
  const symIdx = symWords.findIndex(w => text.toLowerCase().includes(w));

  return { items, keyValue, symbolIdx: Math.max(0, symIdx) };
}

/** Parse bar/generic graph: returns [{label,value}] or null */
function parseBarGraph(text) {
  return parseKeyValues(text);
}

/** Parse line plot data. Handles two formats:
 *  • "Above N: X X X" / "Above N: XXX"  (with or without spaces between X/×)
 *  • "N:×××" / "N: × × ×"              (no 'Above' prefix)
 *  Returns [{value, count}] with ≥2 points, or null. */
function parseLinePlot(text) {
  const points = [];
  // Combined regex: optional "Above " before the number
  const re = /(?:[Aa]bove\s+)?(\d+)\s*:\s*([X×]+(?:\s+[X×]+)*)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const val   = parseInt(m[1]);
    const count = (m[2].match(/[X×]/g) || []).length;
    if (count > 0) points.push({ value: val, count });
  }
  // Deduplicate by value (keep first occurrence)
  const seen = new Set();
  const unique = points.filter(p => { if (seen.has(p.value)) return false; seen.add(p.value); return true; });
  return unique.length >= 2 ? unique : null;
}

/** Parse tally: returns [{label,value}] or null */
function parseTally(text) {
  const items = [];

  // Pattern: "X=N votes" or "X IIII" (tally notation)
  const re = /([A-Z][a-zA-Z ]{1,14}?)\s+(?:has\s+)?(\d+)\s*(?:votes?|marks?|tally)?/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    items.push({ label: m[1].trim(), value: parseInt(m[2]) });
  }
  if (items.length >= 2) return items;

  return parseKeyValues(text);
}

// ── Main processing ───────────────────────────────────────────────────────────

function addSVGToQuestion(q, previews) {
  const t = q.t;
  if (!t || t.includes('<svg')) return q; // inline SVG in t — leave untouched

  const isPicto = /pictograph|each\s+\S+\s*=/i.test(t);

  if (q.s) {
    if (!isPicto) return q; // non-pictograph already has SVG — skip
    // Pictograph: only regenerate if existing SVG has no symbol glyphs (old bug left them empty)
    const hasSymbols = /<text[^>]*font-size="8"/.test(q.s);
    if (hasSymbols) return q; // already correct — skip
    // Falls through to regenerate empty pictograph
  }

  let svg = null;
  let chartType = null;

  if (isPicto) {
    const parsed = parsePictograph(t);
    if (parsed && parsed.items.length >= 1) {
      svg = pictographSVG(parsed.items, parsed.keyValue, parsed.symbolIdx);
      chartType = 'Pictograph';
    }
  } else if (/line plot/i.test(t)) {
    const points = parseLinePlot(t);
    if (points) {
      svg = linePlotSVG(points);
      chartType = 'Line Plot';
    }
    // "Use the line plot below" questions have no data in the text — skip gracefully
  } else if (/tally/i.test(t)) {
    const items = parseTally(t);
    if (items && items.length >= 2) {
      svg = tallySVG(items);
      chartType = 'Tally';
    }
  } else if (/bar graph|a graph shows|the data shows/i.test(t)) {
    const items = parseBarGraph(t);
    if (items && items.length >= 2) {
      svg = barChartSVG(items);
      chartType = 'Bar Chart';
    }
  }

  if (!svg) return q; // can't parse — leave as-is

  if (previews) previews.push({ type: chartType, text: t, svg });

  // If q.s already existed (empty pictograph repair): keep t clean, just update s.
  // If q.s didn't exist: prepend svg to t so migrate_u6_svgs.js can extract it.
  if (q.s !== undefined) {
    return { ...q, s: svg };
  }
  return { ...q, t: svg + t };
}

function processUnit(data, previews) {
  let added = 0, skipped = 0;

  function processArray(arr) {
    return arr.map(q => {
      const updated = addSVGToQuestion(q, previews);
      if (updated !== q) added++;
      else if (q.t && !q.t.includes('<svg') && !q.s) skipped++;
      return updated;
    });
  }

  const lessons = data.lessons.map(l => ({
    ...l,
    qBank: processArray(l.qBank || []),
    quiz: processArray(l.quiz || []),
    practice: processArray(l.practice || []),
  }));

  const testBank = processArray(data.testBank || []);

  return { data: { ...data, lessons, testBank }, added, skipped };
}

// ── Run ───────────────────────────────────────────────────────────────────────

const src = fs.readFileSync(SRC, 'utf8');
const match = src.match(/(_mergeUnitData\(5,\s*)(\{[\s\S]*\})(\s*\);?\s*)$/);
if (!match) {
  console.error('Could not parse u6.js structure');
  process.exit(1);
}

let unitData;
try {
  unitData = JSON.parse(match[2]);
} catch (e) {
  console.error('JSON parse error:', e.message);
  process.exit(1);
}

const isPreview = process.argv.includes('--preview');
const previews = isPreview ? [] : null;

const { data: updated, added, skipped } = processUnit(unitData, previews);
console.log(`SVGs added: ${added}`);
console.log(`Still plain text (unparseable): ${skipped}`);

if (isPreview) {
  // Build a standalone HTML file to visually verify each generated chart
  const rows = previews.map((p, i) => `
    <div class="card">
      <div class="tag">#${i + 1} — ${p.type}</div>
      <div class="svg-box">${p.svg}</div>
      <div class="q-text">${p.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SVG Preview (${previews.length} charts)</title>
<style>
  body { font-family: sans-serif; background:#f5f7ff; padding:24px; }
  h1 { color:#333; }
  .summary { margin-bottom:24px; color:#555; }
  .card { background:#fff; border-radius:12px; padding:20px; margin-bottom:20px;
          box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .tag { font-size:12px; font-weight:700; color:#4e9af1; text-transform:uppercase;
         letter-spacing:.5px; margin-bottom:12px; }
  .svg-box { display:flex; justify-content:center; padding:12px;
             background:rgba(0,0,0,.025); border-radius:8px; margin-bottom:12px; }
  .q-text { font-size:13px; color:#444; white-space:pre-wrap; }
</style>
</head>
<body>
<h1>SVG Preview</h1>
<div class="summary">${previews.length} new chart(s) would be added to u6.js. Run without --preview to apply.</div>
${rows}
</body>
</html>`;

  const outPath = path.join(__dirname, '../preview.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Preview written to ${outPath}`);
  console.log('Open preview.html in a browser to verify charts, then run without --preview to apply.');
  process.exit(0);
}

// Back up
fs.copyFileSync(SRC, BAK);
console.log(`Backed up to ${BAK}`);

// Write
const newSrc = match[1] + JSON.stringify(updated) + match[3];
fs.writeFileSync(SRC, newSrc, 'utf8');
console.log(`Written to ${SRC} (${(fs.statSync(SRC).size / 1024).toFixed(0)}KB)`);
