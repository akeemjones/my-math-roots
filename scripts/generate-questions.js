#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//  generate-questions.js
//  Uses Gemini API to generate new Easy/Medium/Hard questions for
//  every lesson and testBank in my-math-roots.
//
//  Usage:
//    GEMINI_API_KEY=xxx node scripts/generate-questions.js --unit=all
//    GEMINI_API_KEY=xxx node scripts/generate-questions.js --unit=1
//    GEMINI_API_KEY=xxx node scripts/generate-questions.js --unit=1 --lesson=2
//
//  Output: scripts/generated/u{N}-l{N}-{e|m|h}.json  (lesson banks)
//          scripts/generated/u{N}-testbank-{e|m|h}.json  (unit test banks)
//
//  Idempotent: skips files that already exist (delete to regenerate).
// ════════════════════════════════════════════════════════════════════

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Unit / Lesson metadata ───────────────────────────────────────────
const UNIT_META = [
  {
    n: 1, id: 'u1', name: 'Basic Fact Strategies', teks: 'TEKS 2.4A, 2.7A',
    testDesc: 'Basic addition and subtraction facts within 20, counting strategies, doubles, make-a-10, and related fact families',
    lessons: [
      { id: 'u1l1', title: 'Count Up & Count Back',  teks: '2.4A', desc: 'Count forward to add, backward to subtract' },
      { id: 'u1l2', title: 'Doubles!',               teks: '2.4A', desc: 'Use doubles facts to add quickly (e.g., 6+6=12)' },
      { id: 'u1l3', title: 'Make a 10',              teks: '2.4A', desc: 'Break apart numbers to reach 10 first before adding' },
      { id: 'u1l4', title: 'Number Families',        teks: '2.7A', desc: 'Related addition and subtraction facts using 3 numbers (fact families)' },
    ]
  },
  {
    n: 2, id: 'u2', name: 'Place Value', teks: 'TEKS 2.2A-F, 2.7B, 2.9C',
    testDesc: 'Place value of digits in 2- and 3-digit numbers, standard/word/expanded forms, comparing and ordering numbers up to 1,200, number lines, skip counting',
    lessons: [
      { id: 'u2l1', title: 'Big Numbers',                       teks: '2.2A-B', desc: 'Hundreds, tens, ones place value; each digit has a place and a value' },
      { id: 'u2l2', title: 'Different Ways to Write Numbers',   teks: '2.2B',   desc: 'Standard form, word form, and expanded form for numbers up to 1,200' },
      { id: 'u2l3', title: 'Bigger or Smaller?',                teks: '2.2C-D', desc: 'Compare and order whole numbers using >, <, = up to 1,200' },
      { id: 'u2l4', title: 'Skip Counting',                     teks: '2.7B',   desc: 'Count by 2s, 5s, 10s, and 100s; find 10 or 100 more/less than a number' },
    ]
  },
  {
    n: 3, id: 'u3', name: 'Add & Subtract to 200', teks: 'TEKS 2.4A-D, 2.7B-C',
    testDesc: 'Multi-digit addition and subtraction up to 200 using place value strategies and regrouping; adding three numbers; one- and two-step word problems',
    lessons: [
      { id: 'u3l1', title: 'Adding Bigger Numbers',        teks: '2.4B', desc: 'Add two-digit numbers with and without regrouping' },
      { id: 'u3l2', title: 'Taking Away Bigger Numbers',   teks: '2.4B', desc: 'Subtract two-digit numbers with and without regrouping' },
      { id: 'u3l3', title: 'Add Three Numbers',            teks: '2.4B', desc: 'Find clever ways to add 3 numbers (look for doubles, make 10)' },
      { id: 'u3l4', title: 'Math Stories',                 teks: '2.4C', desc: 'Solve one- and two-step addition and subtraction word problems within 200' },
    ]
  },
  {
    n: 4, id: 'u4', name: 'Add & Subtract to 1,000', teks: 'TEKS 2.4A-D, 2.7B-C',
    testDesc: 'Addition and subtraction with 3-digit numbers up to 1,000 including multiple regroupings; estimation and rounding; multi-step word problems',
    lessons: [
      { id: 'u4l1', title: 'Adding Really Big Numbers',      teks: '2.4B-C', desc: 'Add hundreds, tens, and ones with regrouping across columns' },
      { id: 'u4l2', title: 'Taking Away Really Big Numbers', teks: '2.4B-C', desc: 'Subtract 3-digit numbers with regrouping across columns' },
      { id: 'u4l3', title: 'Close Enough Counts!',           teks: '2.7B',   desc: 'Round numbers to nearest 10 or 100 to estimate sums and differences' },
    ]
  },
  {
    n: 5, id: 'u5', name: 'Money & Financial Literacy', teks: 'TEKS 2.5A-B, 2.11A-F',
    testDesc: 'Identifying and counting coins and bills; using cent symbol, dollar sign, and decimal point; simple money word problems; saving, spending, and financial concepts',
    lessons: [
      { id: 'u5l1', title: 'All About Coins',       teks: '2.5A',   desc: 'Identify penny, nickel, dime, quarter and their values' },
      { id: 'u5l2', title: 'Count Your Coins',      teks: '2.5A',   desc: 'Add coin values from greatest to least to find totals up to $1.00' },
      { id: 'u5l3', title: 'Dollars and Cents',     teks: '2.5B',   desc: 'Use cent symbol (¢), dollar sign ($), and decimal point to write money amounts' },
      { id: 'u5l4', title: 'Save, Spend and Give',  teks: '2.11A-F', desc: 'Saving vs. spending, deposits and withdrawals, borrowing, producers and consumers' },
    ]
  },
  {
    n: 6, id: 'u6', name: 'Data Analysis', teks: 'TEKS 2.10A-D',
    testDesc: 'Reading and interpreting tally charts, bar graphs, pictographs, and line plots; solving one-step word problems from data; drawing conclusions',
    lessons: [
      { id: 'u6l1', title: 'Tally Marks',    teks: '2.10A-B', desc: 'Record and read data with tally marks; organize into a tally chart' },
      { id: 'u6l2', title: 'Bar Graphs',     teks: '2.10A-C', desc: 'Read and interpret bar graphs; solve word problems using bar graph data' },
      { id: 'u6l3', title: 'Picture Graphs', teks: '2.10A-C', desc: 'Use pictures/symbols to represent data; interpret pictograph keys and scales' },
      { id: 'u6l4', title: 'Line Plots',     teks: '2.10A-D', desc: 'Show measurement data on a number line; draw conclusions from line plots' },
    ]
  },
  {
    n: 7, id: 'u7', name: 'Measurement & Time', teks: 'TEKS 2.9A-G',
    testDesc: 'Measuring length in inches, feet, centimeters, meters; reading analog and digital clocks to 1-minute increments; AM vs PM; area using square units; estimating lengths',
    lessons: [
      { id: 'u7l1', title: 'How Long Is It?',    teks: '2.9A-E', desc: 'Measure in inches, feet, centimeters; use rulers; estimate and compare lengths' },
      { id: 'u7l2', title: 'What Time Is It?',   teks: '2.9G',   desc: 'Read analog and digital clocks to 1-minute increments; AM vs PM' },
      { id: 'u7l3', title: 'Hot, Cold and Full', teks: '2.9F',   desc: 'Find area by counting square units; cover a rectangle with no gaps or overlaps' },
    ]
  },
  {
    n: 8, id: 'u8', name: 'Fractions', teks: 'TEKS 2.3A-D',
    testDesc: 'Partitioning shapes into equal parts; naming halves, fourths, eighths; comparing fractions; counting fractional parts beyond one whole; identifying examples and non-examples',
    lessons: [
      { id: 'u8l1', title: 'What is a Fraction?',          teks: '2.3A',   desc: 'Partition shapes into equal parts; name the parts using words (halves, fourths, eighths)' },
      { id: 'u8l2', title: 'Halves, Fourths and Eighths',  teks: '2.3A-D', desc: 'Identify, name, and draw halves, fourths, and eighths; more parts = smaller pieces' },
      { id: 'u8l3', title: 'Which Piece is Bigger?',       teks: '2.3B-C', desc: 'Compare fractions; count fractional parts beyond one whole' },
    ]
  },
  {
    n: 9, id: 'u9', name: 'Geometry', teks: 'TEKS 2.8A-E',
    testDesc: '2D shapes (sides, vertices, polygons); 3D solids (sphere, cone, cylinder, prism); composing and decomposing shapes; lines of symmetry',
    lessons: [
      { id: 'u9l1', title: 'Flat Shapes',    teks: '2.8A, 2.8C', desc: '2D polygons — count sides and vertices; classify triangles, quadrilaterals, pentagons, hexagons' },
      { id: 'u9l2', title: 'Solid Shapes',   teks: '2.8B',       desc: '3D solids — sphere, cone, cylinder, rectangular prism, triangular prism; faces, edges, vertices' },
      { id: 'u9l3', title: 'Mirror Shapes',  teks: '2.8D-E',     desc: 'Lines of symmetry; compose and decompose 2D shapes' },
    ]
  },
  {
    n: 10, id: 'u10', name: 'Multiplication & Division', teks: 'TEKS 2.6A-B',
    testDesc: 'Equal groups, repeated addition, skip counting as foundations for multiplication; sharing equally as foundation for division; contextual multiplication and division situations',
    lessons: [
      { id: 'u10l1', title: 'Equal Groups',             teks: '2.6A', desc: 'Identify and create equal groups of objects; describe as multiplication situations' },
      { id: 'u10l2', title: 'Adding the Same Number',   teks: '2.6A', desc: 'Repeated addition of equal groups; connect to multiplication number sentences' },
      { id: 'u10l3', title: 'Sharing Equally',          teks: '2.6B', desc: 'Divide a set into equal shares; describe as division situations' },
    ]
  },
];

// ── Difficulty descriptions ──────────────────────────────────────────
const DIFF_DESC = {
  e: 'EASY — single-step recall with small or familiar numbers, directly mirrors a basic worked example. A typical 2nd grader who just learned this should get it right.',
  m: 'MEDIUM — single-step application with slightly larger numbers or a familiar concept presented in a new context. Requires understanding, not just memory.',
  h: 'HARD — multi-step reasoning, larger numbers, a word problem that requires reading and choosing the operation, or two concepts combined. Challenges strong 2nd graders.',
};

// ── Gemini API call ─────────────────────────────────────────────────
function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('GEMINI_API_KEY environment variable is not set'));

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error('Gemini error: ' + JSON.stringify(json.error)));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Empty Gemini response: ' + data.slice(0, 300)));
          // Strip markdown fences if present
          const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          resolve(JSON.parse(cleaned));
        } catch (e) {
          reject(new Error('JSON parse failed: ' + e.message + '\nRaw: ' + data.slice(0, 500)));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Build lesson-level prompt ────────────────────────────────────────
function buildLessonPrompt(unit, lesson, difficulty, existingTexts) {
  const avoid = existingTexts.length > 0
    ? '\n\nDo NOT duplicate any of these existing questions:\n' +
      existingTexts.slice(0, 60).map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '';

  return `You are a Texas Grade 2 math curriculum expert creating questions for an educational app.

Unit: ${unit.name} (${unit.teks})
Lesson: "${lesson.title}" — ${lesson.desc}
Specific TEKS standard: ${lesson.teks}

Difficulty level: ${DIFF_DESC[difficulty]}

Generate exactly 20 multiple-choice questions for this lesson at the specified difficulty level.

Requirements:
- Each question must have exactly 4 answer choices
- Wrong answers must be COMMON Grade 2 mistakes (not random numbers)
- Question text must be at Grade 2 reading level (age 7–8), clear and simple
- Explanation must be 1–2 sentences a 7-year-old can understand
- All questions must be about "${lesson.title}" — stay focused on this lesson topic
- Do NOT include questions about other units or unrelated topics${avoid}

Return ONLY a valid JSON array with exactly 20 objects in this format:
[
  {
    "t": "question text here",
    "o": ["choice A", "choice B", "choice C", "choice D"],
    "a": 0,
    "e": "explanation here",
    "d": "${difficulty}"
  }
]

The "a" field is the 0-based index (0–3) of the correct answer in "o".`;
}

// ── Build testBank-level prompt ──────────────────────────────────────
function buildTestBankPrompt(unit, difficulty, existingTexts) {
  const avoid = existingTexts.length > 0
    ? '\n\nDo NOT duplicate any of these existing questions:\n' +
      existingTexts.slice(0, 60).map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '';

  return `You are a Texas Grade 2 math curriculum expert creating unit test questions for an educational app.

Unit: ${unit.name} (${unit.teks})
Unit test coverage: ${unit.testDesc}

Difficulty level: ${DIFF_DESC[difficulty]}

Generate exactly 10 multiple-choice unit test questions that assess overall understanding of this unit.
The questions should span the full unit — mix topics from all lessons.

Requirements:
- Each question must have exactly 4 answer choices
- Wrong answers must be COMMON Grade 2 mistakes
- Question text must be at Grade 2 reading level (age 7–8)
- Explanation must be 1–2 sentences a 7-year-old can understand
- Questions must cover the breadth of the unit, not just one lesson${avoid}

Return ONLY a valid JSON array with exactly 10 objects:
[
  {
    "t": "question text here",
    "o": ["choice A", "choice B", "choice C", "choice D"],
    "a": 0,
    "e": "explanation here",
    "d": "${difficulty}"
  }
]`;
}

// ── Validate generated questions ─────────────────────────────────────
function validate(questions, minCount, source) {
  if (!Array.isArray(questions)) throw new Error(`${source}: expected array, got ${typeof questions}`);
  if (questions.length < minCount) throw new Error(`${source}: expected >= ${minCount} questions, got ${questions.length}`);
  questions.forEach((q, i) => {
    if (!q.t || typeof q.t !== 'string') throw new Error(`${source}[${i}]: missing or invalid "t"`);
    if (!Array.isArray(q.o) || q.o.length !== 4) throw new Error(`${source}[${i}]: "o" must be array of 4`);
    if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) throw new Error(`${source}[${i}]: "a" must be 0-3`);
    if (!q.e || typeof q.e !== 'string') throw new Error(`${source}[${i}]: missing or invalid "e"`);
  });
}

// ── Load existing question texts from a data file ────────────────────
function getExistingTexts(unitN) {
  const p = path.join(__dirname, '..', 'src', 'data', `u${unitN}.js`);
  if (!fs.existsSync(p)) return [];
  const src = fs.readFileSync(p, 'utf8');
  return [...src.matchAll(/"t":"([^"]+)"/g)].map(m => m[1]);
}

// ── Sleep ────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const args = {};
  process.argv.slice(2).forEach(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    args[k] = v;
  });

  const OUT = path.join(__dirname, 'generated');
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: Set GEMINI_API_KEY before running.');
    console.error('  Windows:  set GEMINI_API_KEY=your_key_here');
    console.error('  Mac/Linux: export GEMINI_API_KEY=your_key_here');
    process.exit(1);
  }

  // Which units to process
  const unitNs = args.unit === 'all' || !args.unit
    ? UNIT_META.map(u => u.n)
    : [parseInt(args.unit, 10)];

  let totalGenerated = 0;
  let totalSkipped = 0;
  let errors = [];

  for (const unitN of unitNs) {
    const unit = UNIT_META[unitN - 1];
    if (!unit) { console.warn(`Unit ${unitN} not found`); continue; }

    const existing = getExistingTexts(unitN);
    console.log(`\n── Unit ${unitN}: ${unit.name} (${existing.length} existing questions) ──`);

    // Which lessons to process
    const lessonIdxs = args.lesson && args.lesson !== 'all'
      ? [parseInt(args.lesson, 10) - 1]
      : unit.lessons.map((_, i) => i);

    for (const li of lessonIdxs) {
      const lesson = unit.lessons[li];
      if (!lesson) continue;

      console.log(`  Lesson ${li + 1}: "${lesson.title}"`);

      for (const d of ['e', 'm', 'h']) {
        const label = d === 'e' ? 'Easy' : d === 'm' ? 'Medium' : 'Hard';
        const outFile = path.join(OUT, `u${unitN}-l${li + 1}-${d}.json`);

        if (fs.existsSync(outFile)) {
          const existing_count = JSON.parse(fs.readFileSync(outFile, 'utf8')).length;
          console.log(`    [${label}] SKIP — already exists (${existing_count} questions)`);
          totalSkipped++;
          continue;
        }

        process.stdout.write(`    [${label}] Generating...`);
        try {
          const prompt = buildLessonPrompt(unit, lesson, d, existing);
          const questions = await callGemini(prompt);
          validate(questions, 18, `u${unitN}-l${li + 1}-${d}`);
          // Ensure d field is set
          questions.forEach(q => { q.d = d; });
          fs.writeFileSync(outFile, JSON.stringify(questions, null, 2), 'utf8');
          console.log(` ${questions.length} questions → ${path.basename(outFile)}`);
          totalGenerated++;
          await sleep(4200); // rate limit
        } catch (err) {
          console.log(` ERROR: ${err.message}`);
          errors.push({ file: `u${unitN}-l${li + 1}-${d}`, error: err.message });
          await sleep(2000);
        }
      }
    }

    // TestBank (only if no lesson filter)
    if (!args.lesson || args.lesson === 'all') {
      console.log(`  Test Bank:`);
      for (const d of ['e', 'm', 'h']) {
        const label = d === 'e' ? 'Easy' : d === 'm' ? 'Medium' : 'Hard';
        const outFile = path.join(OUT, `u${unitN}-testbank-${d}.json`);

        if (fs.existsSync(outFile)) {
          const existing_count = JSON.parse(fs.readFileSync(outFile, 'utf8')).length;
          console.log(`    [${label}] SKIP — already exists (${existing_count} questions)`);
          totalSkipped++;
          continue;
        }

        process.stdout.write(`    [${label}] Generating...`);
        try {
          const prompt = buildTestBankPrompt(unit, d, existing);
          const questions = await callGemini(prompt);
          validate(questions, 8, `u${unitN}-testbank-${d}`);
          questions.forEach(q => { q.d = d; });
          fs.writeFileSync(outFile, JSON.stringify(questions, null, 2), 'utf8');
          console.log(` ${questions.length} questions → ${path.basename(outFile)}`);
          totalGenerated++;
          await sleep(4200);
        } catch (err) {
          console.log(` ERROR: ${err.message}`);
          errors.push({ file: `u${unitN}-testbank-${d}`, error: err.message });
          await sleep(2000);
        }
      }
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`Done. Generated: ${totalGenerated} files | Skipped: ${totalSkipped} | Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('\nFailed files (re-run to retry):');
    errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
  }
  console.log('\nNext step: node scripts/generate-review-html.js');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
