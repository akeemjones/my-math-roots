#!/usr/bin/env node
// scripts/add-question-ids.js
// Injects stable `id` fields into every question object in src/data/u1.js–u10.js.
// ID format: u{unitNum}-{category}-{NNN} (3-digit zero-padded index per category/unit).
// Safe to re-run: skips questions that already have an `id` field.

'use strict';

const fs   = require('fs');
const path = require('path');

// Category mapping: one entry per lesson (qBank section) in unit order.
// Derived from the lesson content/topic of each qBank in each unit file.
const UNIT_CATEGORIES = {
  1:  ['add', 'add', 'add', 'mixed'],
  2:  ['place', 'place', 'place', 'place'],
  3:  ['add', 'add', 'sub', 'sub'],
  4:  ['add', 'sub', 'word'],
  5:  ['dec', 'dec', 'dec', 'word'],
  6:  ['mixed', 'mixed', 'mixed', 'mixed'],
  7:  ['mixed', 'mixed', 'mixed'],
  8:  ['frac', 'frac', 'frac'],
  9:  ['mixed', 'mixed', 'mixed'],
  10: ['mul', 'mul', 'div'],
};

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const allIds = new Set();
let totalAdded = 0;

for (const [unitNum, categories] of Object.entries(UNIT_CATEGORIES)) {
  const filePath = path.join(DATA_DIR, `u${unitNum}.js`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Split on "qBank":[ to isolate each lesson's question bank.
  // Index 0 is the preamble (before first qBank), 1..N are lesson segments.
  const DELIM = '"qBank":[';
  const parts = content.split(DELIM);

  if (parts.length - 1 !== categories.length) {
    console.error(
      `u${unitNum}.js: expected ${categories.length} qBank sections, found ${parts.length - 1}. Aborting.`
    );
    process.exit(1);
  }

  // Per-(unit, category) counters — reset per unit, shared across lessons with the same category name.
  const catCounters = {};

  const newParts = [parts[0]]; // preamble unchanged

  for (let lessonIdx = 0; lessonIdx < categories.length; lessonIdx++) {
    const cat = categories[lessonIdx];
    if (!(cat in catCounters)) catCounters[cat] = 0;

    const segment = parts[lessonIdx + 1];

    // Replace each {"t": with {"id":"uN-cat-NNN","t": .
    // Re-run safe: once id is inserted the object starts with {"id": so {"t": won't match.
    const modified = segment.replace(/\{"t":/g, () => {
      catCounters[cat]++;
      const idx = String(catCounters[cat]).padStart(3, '0');
      const id = `u${unitNum}-${cat}-${idx}`;

      if (allIds.has(id)) {
        console.error(`Duplicate ID detected: ${id}. Aborting.`);
        process.exit(1);
      }
      allIds.add(id);
      totalAdded++;

      return `{"id":"${id}","t":`;
    });

    newParts.push(modified);
  }

  const newContent = newParts.join(DELIM);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`u${unitNum}.js: added IDs (categories: ${categories.join(', ')})`);
}

console.log(`\nDone. Added: ${totalAdded} IDs, Total unique: ${allIds.size}`);
