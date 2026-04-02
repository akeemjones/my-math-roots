#!/usr/bin/env node
// ════════════════════════════════════════
//  migrate_u6_svgs.js
//  Moves <svg> blocks from the "t" (question text) field
//  to a new "s" (svg) property in qBank question objects.
//
//  Operates on src/data source files (NOT the built dist/).
//  Creates a .bak backup of each file before modifying.
//
//  Usage: node scripts/migrate_u6_svgs.js
// ════════════════════════════════════════

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT  = path.join(__dirname, '..');
const FILES = [
  'src/data/u5.js',
  'src/data/u6.js',
  'src/data/u7.js',
  'src/data/u8.js',
  'src/data/u9.js',
];

// Match the FULL value of any "t":"..." JSON string field.
// Within each matched value, we extract ALL svg blocks (handles multi-SVG questions).
// Content uses \" for embedded quotes, \\ for backslashes.
const T_FIELD   = /"t":"((?:[^"\\]|\\.)*)"/g;
const SVG_BLOCK = /<svg(?:[^"\\]|\\.)*?<\/svg>/g;

let grand = 0;

for (const rel of FILES) {
  const filePath = path.join(ROOT, rel);

  if (!fs.existsSync(filePath)) {
    console.warn(`SKIP  ${rel} — file not found`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const bakPath  = filePath + '.bak';

  // Always write backup first — before any modification
  fs.writeFileSync(bakPath, original, 'utf8');

  let count = 0;

  const updated = original.replace(T_FIELD, (match, tValue) => {
    if (!tValue.includes('<svg')) return match; // no SVG — leave untouched

    // Collect all SVG blocks, remove them from the text
    const svgs = [];
    const cleanedT = tValue.replace(SVG_BLOCK, (svgMatch) => {
      svgs.push(svgMatch);
      return '';
    });

    const finalT = cleanedT.replace(/\s{2,}/g, ' ').trim();
    const finalS = svgs.join('');

    count++;
    return `"t":"${finalT}","s":"${finalS}"`;
  });

  if (count > 0) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`OK    ${rel}: ${count} question(s) migrated  →  backup at ${path.basename(bakPath)}`);
  } else {
    console.log(`SKIP  ${rel}: no SVG found in "t" fields — file unchanged`);
    // Remove backup if we didn't actually change anything
    fs.unlinkSync(bakPath);
  }

  grand += count;
}

console.log(`\nDone. Total SVGs migrated: ${grand}`);
