const fs = require('fs');
const path = require('path');

function classify(q) {
  const t = q.t.toLowerCase();
  const tRaw = q.t;

  // === HARD ===

  // Multi-step word problems (2+ operations)
  if (t.includes('gave away') && t.includes('then')) return 'h';
  if (t.includes('gave away') && t.includes('got')) return 'h';

  // Error analysis / "does NOT belong"
  if (t.includes('does not belong') || t.includes('not belong')) return 'h';

  // Ordering 3+ numbers
  if (t.includes('order from least') || t.includes('order from greatest') || t.includes('in the middle when ordered')) return 'h';

  // "Which problem requires regrouping" - analysis/comparison
  if (t.includes('requires regrouping') || t.includes('require regrouping')) return 'h';

  // Missing number to 100 (inverse with larger target)
  if (/67 \+ _+ = 100/.test(t)) return 'h';

  // Word problems detection
  const wpNouns = ['sticker', 'coin', 'crayon', 'apple', 'balloon', 'bird', 'grape', 'card', 'pencil', 'page', 'book', 'people', 'student', 'boy', 'girl', 'teacher'];
  const wpVerbs = ['had', 'gave', 'got', 'sold', 'flew', 'checked out', 'broke', 'joined', 'ate', 'eaten', 'read '];
  const wpResults = ['how many', 'how much', 'left', 'in all', 'altogether', 'combined', 'remaining', 'still'];
  const hasNoun = wpNouns.some(n => t.includes(n));
  const hasVerb = wpVerbs.some(v => t.includes(v));
  const hasResult = wpResults.some(r => t.includes(r));
  const isWordProblem = (hasNoun || hasVerb) && hasResult;

  if (isWordProblem) {
    const nums = t.match(/\d+/g);
    if (nums && nums.length >= 3) return 'h'; // multi-step
    if (nums && nums.some(n => parseInt(n) >= 100)) return 'h'; // 3-digit numbers
    // "How many more" comparison word problems
    if (t.includes('how many more')) return 'h';
    // Single-step word problem with 2-digit numbers and regrouping
    return 'h';
  }

  // 3-digit pure arithmetic (not place value composition)
  if (/what is \d{3}\s*[\+\-\u2212]\s*\d{2,3}/.test(t) && !t.includes('hundreds') && !t.includes('tens') && !t.includes('ones') && !t.includes('expanded') && !t.includes('word form') && !t.includes('standard') && !t.includes('value') && !t.includes('place') && !t.includes('more than') && !t.includes('less than') && !t.includes('rounded')) {
    return 'h';
  }

  // Estimate questions
  if (t.includes('best estimate')) return 'h';

  // === MEDIUM ===

  // Rounded
  if (t.includes('rounded')) return 'm';

  // 3-number addition (multi-step)
  if (/\d+\s*\+\s*\d+\s*\+\s*\d+/.test(t) && !t.includes('hundreds') && !t.includes('tens') && !t.includes('ones')) return 'm';

  // Conceptual/definition questions
  if (t.includes('what does') && (t.includes('mean') || t.includes('tell you'))) return 'm';
  if (t.includes('what is the first step')) return 'm';
  if (t.includes('when do you')) return 'm';
  if (t.includes('which word')) return 'm';
  if (t.includes('is it true')) return 'm';

  // Strategy selection questions
  if (t.includes('which strategy') || t.includes('which helps solve')) return 'm';

  // Near doubles with computation
  if (t.includes('near-doubles') || t.includes('near double')) return 'm';

  // Make-ten: "why do we make ten" = conceptual = medium
  if (t.includes('why do we')) return 'm';

  // Make-ten strategy with computation
  if (t.includes('make-ten') || t.includes('make ten')) return 'm';

  // Fact family questions
  if (t.includes('fact family') || t.includes('fact is in family')) return 'm';
  if (/if \d+ \+ \d+ = \d+, what is/.test(t)) return 'm';

  // Missing number (inverse thinking)
  if (t.includes('missing number') || (t.includes('___') && !t.includes('skip count'))) return 'm';

  // Comparing/ordering
  if (t.includes('symbol') && t.includes('blank')) return 'm';
  if (t.includes('which is greater') || t.includes('which is less')) return 'm';
  if (t.includes('true or false')) return 'm';
  if (t.includes('greatest') || t.includes('least')) return 'm';

  // More than / Less than
  if (t.includes('more than') || t.includes('less than')) return 'm';

  // Expanded form / word form / standard form
  if (t.includes('expanded form') || t.includes('word form') || t.includes('standard form')) return 'm';

  // Value of digit
  if (t.includes('value of')) return 'm';

  // Composing numbers H+T+O
  if (/\d+ hundreds? \+ \d+ tens? \+ \d+ ones?/.test(t) || t.includes('which number has')) return 'm';

  // Which place has zero
  if (t.includes('which place has')) return 'm';

  // Between numbers
  if (t.includes('comes between')) return 'm';

  // Counting rule identification
  if (t.includes('counting rule')) return 'm';
  if (t.includes('which skips by')) return 'm';

  // "Which is a doubles fact"
  if (t.includes('which is a doubles')) return 'm';

  // "In X+Y, which pair"
  if (t.includes('which pair')) return 'm';

  // "Add ones first" partial step
  if (t.includes('add ones first')) return 'm';

  // 2-digit add/subtract (check for regrouping)
  const twoDigitMatch = t.match(/what is (\d{2})\s*[\+\-\u2212]\s*(\d{1,2})/);
  if (twoDigitMatch && !t.includes('strategy') && !t.includes('count')) {
    const a = parseInt(twoDigitMatch[1]);
    const b = parseInt(twoDigitMatch[2]);
    const isAdd = tRaw.includes('+');
    const isSub = tRaw.includes('\u2212') || tRaw.includes('-');
    if (isAdd && (a % 10 + b % 10 >= 10)) return 'm';
    if (isSub && (a % 10 < b % 10)) return 'm';
    // No regrouping, simple 2-digit
    return 'e';
  }

  // === EASY ===
  // Count-on/count-back
  if (t.includes('count-on') || t.includes('count on') || t.includes('count-back') || t.includes('count back')) return 'e';

  // Doubles facts (direct recall)
  if (t.includes('doubles') || t.includes('double of') || t.includes('double')) return 'e';

  // Simple digit identification
  if (t.includes('digit') || t.includes('which digit')) return 'e';
  if (/in \d+,/.test(t) && !t.includes('value')) return 'e';
  if (t.includes('how many hundreds') || t.includes('how many tens')) return 'e';

  // Skip counting - next number
  if (t.includes('skip count') || t.includes('what number comes next')) return 'e';

  // "What does count on mean"
  if (t.includes('what does count')) return 'e';

  // Place value addition (200+40+7 type)
  if (/what is \d{2,3}\s*\+\s*\d{1,2}\s*\+\s*\d\s*\?/.test(t)) return 'e';

  // Default
  return 'm';
}

const files = [
  'u1-l1-qbank.json', 'u1-l2-qbank.json', 'u1-l3-qbank.json', 'u1-l4-qbank.json',
  'u1-testbank.json', 'u1-unitquiz.json',
  'u2-l1-qbank.json', 'u2-l2-qbank.json', 'u2-l3-qbank.json', 'u2-l4-qbank.json',
  'u2-testbank.json', 'u2-unitquiz.json',
  'u3-l1-qbank.json', 'u3-l2-qbank.json', 'u3-l3-qbank.json', 'u3-l4-qbank.json',
  'u3-testbank.json', 'u3-unitquiz.json'
];

const dir = path.join(__dirname);
let totalQ = 0;
let counts = {e: 0, m: 0, h: 0};

for (const file of files) {
  const fp = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let fc = {e: 0, m: 0, h: 0};

  for (const q of data) {
    const d = classify(q);
    q.d = d;
    counts[d]++;
    fc[d]++;
    totalQ++;
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
  console.log(file + ': ' + data.length + ' qs (e:' + fc.e + ' m:' + fc.m + ' h:' + fc.h + ')');
}

console.log('\nTotal: ' + totalQ + ' questions');
console.log('Easy: ' + counts.e + ', Medium: ' + counts.m + ', Hard: ' + counts.h);
