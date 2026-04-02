#!/usr/bin/env node
/**
 * convert-unit-data.js
 * Converts src/data/u{N}.js (_mergeUnitData format) into
 * app/src/lib/data/u{N}.ts (ES module export format).
 *
 * Usage:
 *   node scripts/convert-unit-data.js 1          # convert u1
 *   node scripts/convert-unit-data.js 1 2 3      # convert u1, u2, u3
 *   node scripts/convert-unit-data.js all        # convert all 10 units
 *
 * Safe to re-run — overwrites existing output files.
 * Does NOT modify any file in src/data/.
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'src', 'data');
const OUTPUT_DIR = path.join(ROOT, 'app', 'src', 'lib', 'data');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Resolve which units to convert
let targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Usage: node scripts/convert-unit-data.js <unit_num|all> [...]');
  process.exit(1);
}
if (targets[0] === 'all') targets = ['1','2','3','4','5','6','7','8','9','10'];

for (const t of targets) {
  const n = parseInt(t, 10);
  if (isNaN(n) || n < 1 || n > 10) {
    console.error(`Skipping invalid unit number: ${t}`);
    continue;
  }
  convertUnit(n);
}

function convertUnit(n) {
  const inputPath = path.join(INPUT_DIR, `u${n}.js`);
  const outputPath = path.join(OUTPUT_DIR, `u${n}.ts`);

  if (!fs.existsSync(inputPath)) {
    console.error(`  ✗ u${n}: source not found at ${inputPath}`);
    return;
  }

  const code = fs.readFileSync(inputPath, 'utf8');

  // Execute the file in a sandbox that intercepts _mergeUnitData
  let captured = null;
  const sandbox = {
    _mergeUnitData: (_idx, data) => { captured = data; },
  };
  vm.createContext(sandbox);

  try {
    vm.runInContext(code, sandbox, { timeout: 5000 });
  } catch (err) {
    console.error(`  ✗ u${n}: execution error — ${err.message}`);
    return;
  }

  if (!captured) {
    console.error(`  ✗ u${n}: _mergeUnitData was not called`);
    return;
  }

  const lines = [
    `// Auto-converted from src/data/u${n}.js`,
    `// Regenerate with: node scripts/convert-unit-data.js ${n}`,
    `// Do NOT edit manually — edit the source in src/data/u${n}.js then re-run.`,
    ``,
    `import type { LessonContent, UnitQuiz, Question } from '$lib/types/content';`,
    ``,
    `export const lessons: LessonContent[] = ${JSON.stringify(captured.lessons, null, 2)};`,
  ];

  if (captured.unitQuiz) {
    // Some units store unitQuiz as a bare Question[] instead of { qBank: Question[] }.
    // Normalise to { qBank } so it always matches the UnitQuiz interface.
    const uq = Array.isArray(captured.unitQuiz)
      ? { qBank: captured.unitQuiz }
      : captured.unitQuiz;
    lines.push(``, `export const unitQuiz: UnitQuiz = ${JSON.stringify(uq, null, 2)};`);
  }

  if (captured.testBank && captured.testBank.length > 0) {
    lines.push(``, `export const testBank: Question[] = ${JSON.stringify(captured.testBank, null, 2)};`);
  }

  lines.push(''); // trailing newline
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  const qCount = captured.lessons.reduce((s, l) => s + (l.qBank?.length ?? 0), 0);
  const uqCount = captured.unitQuiz?.qBank?.length ?? 0;
  const tbCount = captured.testBank?.length ?? 0;
  console.log(`  ✓ u${n}: ${captured.lessons.length} lessons, ${qCount} qBank Qs, ${uqCount} unit quiz Qs, ${tbCount} test bank Qs → ${path.relative(ROOT, outputPath)}`);
}
