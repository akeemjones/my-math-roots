#!/usr/bin/env node
// scripts/generate_staging_changelog.js
// Generates MY-MATH-ROOTS-STAGING-CHANGELOG.pdf from docs/CHANGELOG.md
// Uses pdfkit (already a devDependency)

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'docs', 'CHANGELOG.md');
const OUTPUT = path.join(ROOT, 'MY-MATH-ROOTS-STAGING-CHANGELOG.pdf');

const md = fs.readFileSync(INPUT, 'utf8');
const lines = md.split('\n');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  info: {
    Title: 'My Math Roots — Internal Staging Changelog',
    Author: 'My Math Roots Dev Team',
    Subject: 'Technical changelog v1.0 → v6.0',
    Keywords: 'changelog, release notes, internal',
  },
});

doc.pipe(fs.createWriteStream(OUTPUT));

// ── Colour palette ────────────────────────────────────────────
const C = {
  brand:     '#1565C0',
  brandDark: '#0d3d6e',
  h2:        '#1e3a5f',
  h3:        '#2e5c8a',
  h4:        '#3a7ab8',
  body:      '#1a1a2e',
  dim:       '#555577',
  badge:     '#e8f0fe',
  badgeBdr:  '#1565C0',
  rule:      '#cbd5e1',
  tableHead: '#e8f0fe',
  tableRow:  '#f8fafc',
  tableAlt:  '#ffffff',
  code:      '#f1f5f9',
  codeText:  '#1e293b',
  staging:   '#dc2626',
};

// ── State ─────────────────────────────────────────────────────
let y = doc.y;
const PAGE_BOTTOM = doc.page.height - doc.page.margins.bottom;
const LEFT = doc.page.margins.left;
const WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function ensureSpace(needed) {
  if (doc.y + needed > PAGE_BOTTOM) doc.addPage();
}

function rule(color = C.rule, weight = 0.5) {
  ensureSpace(8);
  doc.moveTo(LEFT, doc.y).lineTo(LEFT + WIDTH, doc.y).lineWidth(weight).strokeColor(color).stroke();
  doc.moveDown(0.4);
}

function spacer(n = 0.5) { doc.moveDown(n); }

// ── Cover page ────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0d1b2a');

// Staging banner
doc.fontSize(11).fillColor('#ef4444').font('Helvetica-Bold')
  .text('⚠  STAGING / INTERNAL RELEASE — NOT FOR PUBLIC DISTRIBUTION', LEFT, 38, { width: WIDTH, align: 'center' });

// App name
doc.fontSize(36).fillColor('#ffffff').font('Helvetica-Bold')
  .text('My Math Roots', LEFT, 120, { width: WIDTH, align: 'center' });

// Subtitle
doc.fontSize(16).fillColor('#93c5fd').font('Helvetica')
  .text('Internal Technical Changelog', LEFT, 170, { width: WIDTH, align: 'center' });

// Version badge area
const badgeY = 220;
doc.roundedRect(LEFT + WIDTH/2 - 80, badgeY, 160, 42, 8).fill('#1565C0');
doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold')
  .text('v6.0', LEFT, badgeY + 10, { width: WIDTH, align: 'center' });

// Staging label
doc.fontSize(13).fillColor('#fbbf24').font('Helvetica-Bold')
  .text('STAGING RELEASE', LEFT, badgeY + 56, { width: WIDTH, align: 'center' });

// Date
doc.fontSize(12).fillColor('#94a3b8').font('Helvetica')
  .text('Generated: ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), LEFT, badgeY + 80, { width: WIDTH, align: 'center' });

// Divider line
doc.moveTo(LEFT + 60, badgeY + 108).lineTo(LEFT + WIDTH - 60, badgeY + 108)
  .lineWidth(1).strokeColor('#334155').stroke();

// Description
doc.fontSize(11).fillColor('#94a3b8').font('Helvetica')
  .text(
    'This document is a comprehensive record of all technical changes,\n' +
    'bug fixes, new features, and infrastructure updates across every version\n' +
    'of My Math Roots from v1.0 through v6.0.',
    LEFT + 40, badgeY + 120, { width: WIDTH - 80, align: 'center', lineGap: 2 }
  );

// Scope summary boxes
const boxes = [
  { label: '10', sub: 'Math Units' },
  { label: '35', sub: 'Lessons' },
  { label: '900+', sub: 'Questions' },
  { label: 'v1→v6', sub: 'History' },
];
const bw = (WIDTH - 30) / 4;
let bx = LEFT;
const by = badgeY + 205;
boxes.forEach(b => {
  doc.roundedRect(bx, by, bw, 56, 6).fill('#1e3a5f');
  doc.fontSize(18).fillColor('#60a5fa').font('Helvetica-Bold').text(b.label, bx, by + 8, { width: bw, align: 'center' });
  doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text(b.sub, bx, by + 34, { width: bw, align: 'center' });
  bx += bw + 10;
});

// Footer
doc.fontSize(9).fillColor('#475569').font('Helvetica')
  .text('My Math Roots — Confidential Internal Document — mymathroots.com', LEFT, doc.page.height - 40, { width: WIDTH, align: 'center' });

// ── Content pages ─────────────────────────────────────────────
doc.addPage();

// Reset to white
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff').fillColor(C.body);

// Inline table-of-contents approximation then render body
function renderHeader1(text) {
  ensureSpace(55);
  // Full-width bar
  doc.rect(LEFT - 4, doc.y - 2, WIDTH + 8, 32).fill(C.brand);
  doc.fontSize(16).fillColor('#ffffff').font('Helvetica-Bold')
    .text(text, LEFT + 4, doc.y - 28, { width: WIDTH - 8 });
  doc.moveDown(0.6);
}

function renderHeader2(text) {
  ensureSpace(50);
  spacer(0.8);
  // Is this the v6.0 staging entry?
  const isV6 = text.includes('v6.0');
  const bgColor = isV6 ? '#fff1f2' : C.badge;
  const borderColor = isV6 ? C.staging : C.brandDark;
  const textColor = isV6 ? C.staging : C.brandDark;

  doc.rect(LEFT, doc.y, WIDTH, 28).fill(bgColor);
  doc.moveTo(LEFT, doc.y).lineTo(LEFT, doc.y + 28).lineWidth(4).strokeColor(borderColor).stroke();
  if (isV6) {
    // Staging badge
    doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold');
    const badgeW = 58;
    doc.rect(LEFT + WIDTH - badgeW - 4, doc.y + 7, badgeW, 14).fill(C.staging);
    doc.text('STAGING', LEFT + WIDTH - badgeW - 1, doc.y - 15, { width: badgeW, align: 'center' });
  }
  doc.fontSize(14).fillColor(textColor).font('Helvetica-Bold')
    .text(text, LEFT + 10, doc.y - 22, { width: WIDTH - 70 });
  doc.moveDown(0.5);
}

function renderHeader3(text) {
  ensureSpace(30);
  spacer(0.6);
  doc.fontSize(11).fillColor(C.h3).font('Helvetica-Bold').text(text, LEFT, doc.y);
  doc.moveDown(0.1);
  doc.moveTo(LEFT, doc.y).lineTo(LEFT + WIDTH * 0.5, doc.y).lineWidth(0.75).strokeColor(C.h3).stroke();
  doc.moveDown(0.3);
}

function renderHeader4(text) {
  ensureSpace(22);
  spacer(0.3);
  doc.fontSize(10).fillColor(C.h4).font('Helvetica-Bold').text(text, LEFT + 8, doc.y);
  doc.moveDown(0.2);
}

function renderBullet(text, depth = 0) {
  ensureSpace(14);
  const indent = LEFT + 10 + depth * 16;
  const bullet = depth === 0 ? '•' : depth === 1 ? '◦' : '▸';
  const bWidth = WIDTH - 10 - depth * 16;
  const savedY = doc.y;

  // Bold segments between ** **
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  doc.text(bullet + '  ', indent, savedY, { continued: true, width: 20 });
  parts.forEach((p, i) => {
    const isBold = p.startsWith('**') && p.endsWith('**');
    const content = isBold ? p.slice(2, -2) : p;
    if (!content) return;
    doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
       .fontSize(9)
       .fillColor(C.body)
       .text(content, { continued: i < parts.length - 1, width: bWidth - 20 });
  });
  if (!text.endsWith('\n')) doc.moveDown(0.1);
}

function renderCodeLine(text) {
  ensureSpace(16);
  doc.rect(LEFT + 8, doc.y - 1, WIDTH - 16, 14).fill(C.code);
  doc.fontSize(8).fillColor(C.codeText).font('Courier')
    .text(text.trim(), LEFT + 12, doc.y - 13, { width: WIDTH - 24 });
  doc.moveDown(0.15);
}

function renderParagraph(text) {
  if (!text.trim()) return;
  ensureSpace(14);
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  const firstY = doc.y;
  parts.forEach((p, i) => {
    const isBold = p.startsWith('**') && p.endsWith('**');
    const isCode = p.startsWith('`') && p.endsWith('`');
    const content = isBold ? p.slice(2, -2) : isCode ? p.slice(1, -1) : p;
    if (!content) return;
    const continued = i < parts.length - 1;
    if (isCode) {
      doc.font('Courier').fontSize(8.5).fillColor(C.codeText)
        .text(content, { continued, width: WIDTH });
    } else {
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5).fillColor(C.body)
        .text(content, { continued, width: WIDTH });
    }
  });
  doc.moveDown(0.25);
}

// Render markdown table row
function renderTableRow(cells, isHeader) {
  ensureSpace(18);
  const cw = WIDTH / cells.length;
  const rowH = 16;
  const rowY = doc.y;
  doc.rect(LEFT, rowY, WIDTH, rowH).fill(isHeader ? C.tableHead : C.tableRow);
  cells.forEach((cell, i) => {
    doc.fontSize(isHeader ? 8.5 : 8)
       .fillColor(isHeader ? C.brandDark : C.body)
       .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
       .text(cell.trim(), LEFT + i * cw + 4, rowY + 4, { width: cw - 8, lineBreak: false });
  });
  doc.rect(LEFT, rowY, WIDTH, rowH).lineWidth(0.3).strokeColor(C.rule).stroke();
  doc.y = rowY + rowH;
}

// ── Parse and render ──────────────────────────────────────────
let inTable = false;
let tableHeaderDone = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const raw = line.trimEnd();

  // Skip pure HR lines
  if (/^---+$/.test(raw.trim())) { rule(); continue; }
  if (/^===+$/.test(raw.trim())) { rule(C.brand, 1); continue; }

  // Note block
  if (raw.startsWith('> ')) {
    ensureSpace(18);
    doc.rect(LEFT, doc.y - 1, 3, 14).fill('#f59e0b');
    doc.fontSize(8.5).fillColor('#92400e').font('Helvetica-Oblique')
       .text(raw.slice(2), LEFT + 8, doc.y - 13, { width: WIDTH - 12 });
    doc.moveDown(0.3);
    continue;
  }

  // Table
  if (raw.startsWith('|')) {
    const cells = raw.split('|').slice(1, -1);
    if (cells.every(c => /^[-: ]+$/.test(c))) {
      // separator row — next is data
      tableHeaderDone = true;
      inTable = true;
      continue;
    }
    if (!tableHeaderDone) {
      renderTableRow(cells, true);
    } else {
      renderTableRow(cells, false);
    }
    inTable = true;
    continue;
  } else {
    inTable = false;
    tableHeaderDone = false;
  }

  // Headers
  if (raw.startsWith('#### ')) { renderHeader4(raw.slice(5)); continue; }
  if (raw.startsWith('### '))  { renderHeader3(raw.slice(4)); continue; }
  if (raw.startsWith('## '))   { renderHeader2(raw.slice(3)); continue; }
  if (raw.startsWith('# '))    { renderHeader1(raw.slice(2)); continue; }

  // Bullets
  const bulletMatch = raw.match(/^(\s*)[-*]\s+(.*)/);
  if (bulletMatch) {
    const depth = Math.floor(bulletMatch[1].length / 2);
    renderBullet(bulletMatch[2], depth);
    continue;
  }

  // Numbered list
  const numMatch = raw.match(/^(\s*)\d+\.\s+(.*)/);
  if (numMatch) {
    renderBullet(numMatch[2], Math.floor(numMatch[1].length / 2));
    continue;
  }

  // Code block line (indented 4 spaces or inside ```)
  if (raw.startsWith('    ') || raw.startsWith('\t')) {
    renderCodeLine(raw);
    continue;
  }

  // Empty line
  if (!raw.trim()) { spacer(0.3); continue; }

  // Default paragraph
  renderParagraph(raw);
}

doc.end();

doc.on('end', () => {
  console.log('✅  PDF written to: ' + OUTPUT);
});
