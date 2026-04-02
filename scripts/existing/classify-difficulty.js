const fs = require('fs');
const path = require('path');

const files = [
  'u4-l1-qbank.json',
  'u4-l2-qbank.json',
  'u4-l3-qbank.json',
  'u4-testbank.json',
  'u4-unitquiz.json',
  'u5-l1-qbank.json',
  'u5-l2-qbank.json',
  'u5-l3-qbank.json',
  'u5-l4-qbank.json',
  'u5-testbank.json',
  'u5-unitquiz.json',
  'u6-l1-qbank.json',
  'u6-l2-qbank.json',
  'u6-l3-qbank.json',
  'u6-l4-qbank.json',
  'u6-testbank.json',
];

function classify(q, fileName) {
  const t = q.t.toLowerCase();
  const unit = fileName.match(/u(\d)/)[1];

  // === UNIT 4: Addition/Subtraction/Rounding ===
  if (unit === '4') {
    // Conceptual/recall
    if (t.includes('true or false') || t.includes('is this true')) return 'e';
    if (t.includes('what is the first step')) return 'e';
    if (t.includes('how are estimates different')) return 'e';
    if (t.includes('always add the ones column first')) return 'e';
    if (t.includes('when your ones column adds up')) return 'e';
    if (t.includes('why is regrouping across a zero')) return 'm';
    if (t.includes('which number is hardest')) return 'h';
    if (t.includes('which addition problem requires regrouping')) return 'h';

    // Word problems
    if (t.includes('shop had') || t.includes('items and sold')) return 'h';
    if (t.includes('max has') || (t.includes('cards') && t.includes('how many'))) return 'h';

    // Estimation (round then compute = 2 steps)
    if (t.includes('best estimate')) return 'h';

    // Rounding (single-step rule application)
    if (t.includes('rounded to the nearest')) return 'e';

    // Subtraction from numbers ending in 00 or 000 (tricky regrouping across zeros)
    if (t.match(/what is (1000|[0-9]*00)\s*[\u2212\-\u2013]/)) return 'h';

    // Regular subtraction with regrouping
    if (t.match(/what is \d+\s*[\u2212\-\u2013]\s*\d+/)) return 'm';

    // Addition with regrouping
    if (t.match(/what is \d+\s*\+\s*\d+/)) return 'm';

    return 'm';
  }

  // === UNIT 5: Money ===
  if (unit === '5') {
    // Coin identification (direct recall)
    if (t.includes('how much is this coin worth')) return 'e';
    if (t.includes('which coin is the smallest')) return 'e';
    if (t.includes('which coin is the largest')) return 'e';
    if (t.includes('which coin has')) return 'e';
    if (t.includes('which coin is worth the most')) return 'e';
    if (t.includes('which coin is worth the least')) return 'e';
    if (t.includes('which coin is worth less than')) return 'e';
    if (t.includes('is a nickel worth 5 times')) return 'e';
    if (t.includes('is a dime worth more than')) return 'e';

    // Basic equivalences (direct recall)
    if (t.includes('how many pennies equal one nickel')) return 'e';
    if (t.includes('how many nickels equal one dime')) return 'e';
    if (t.includes('how many dimes equal') && t.includes('$1')) return 'e';
    if (t.includes('how many quarters equal') && t.includes('$1')) return 'e';
    if (t.includes('how many dimes does it take')) return 'e';
    if (t.includes('how many quarters does it take')) return 'e';
    if (t.includes('100 pennies')) return 'e';
    if (t.includes('how many pennies equal one dime')) return 'e';
    if (t.includes('how many cents are in half a dollar')) return 'e';
    if (t.includes('how many cents are in $')) return 'e';
    if (t.includes('what is half of one dollar')) return 'e';

    // Slightly harder equivalences (need to think/compute)
    if (t.includes('how many nickels equal one quarter')) return 'm';
    if (t.includes('how many nickels does it take to make 25')) return 'm';
    if (t.includes('how many pennies equal one quarter')) return 'm';
    if (t.includes('half of one dime')) return 'm';
    if (t.includes('how much is 20 nickels')) return 'm';
    if (t.includes('4 dimes = how many pennies')) return 'm';

    // Counting coins shown (visual)
    if (t.includes('how much money is shown') || (t.includes('how much money is') && t.includes('<svg'))) {
      const coinTypes = new Set();
      if (t.includes('penny')) coinTypes.add('penny');
      if (t.includes('nickel')) coinTypes.add('nickel');
      if (t.includes('dime')) coinTypes.add('dime');
      if (t.includes('quarter')) coinTypes.add('quarter');
      const hasDollar = t.includes('$1') && t.includes('rect');
      if (hasDollar) coinTypes.add('dollar');

      if (coinTypes.size >= 3) return 'h';
      if (coinTypes.size === 2) return 'm';
      const svgCount = (t.match(/<svg/g) || []).length;
      if (svgCount >= 5) return 'm';
      return 'e';
    }

    // Writing money notation
    if (t.includes('how do you write')) return 'e';

    // Simple money arithmetic (nearly trivial)
    if (t.includes('$0.50 + $0.50') || t.includes('$0.99 + $0.01') || t.includes('$1.99 + $0.01')) return 'e';

    // Money addition/subtraction
    if (t.match(/what is \$[\d.]+ [+] \$[\d.]+/)) return 'm';
    if (t.match(/what is \$[\d.]+ [\u2212\-\u2013] \$[\d.]+/)) return 'm';

    // Comparing amounts
    if (t.includes('which amount is greater') || t.includes('which is greater')) return 'm';

    // Change / multi-step word problems
    if (t.includes('change do you get') || t.includes('how much change')) return 'h';
    if (t.includes('costs') && t.includes('pay') && t.includes('how much')) return 'h';
    if (t.includes('costs') && t.includes('how much more do you need')) return 'm';
    if (t.includes('buy') && t.includes('total')) return 'h';
    if (t.includes('you have') && t.includes('find') && t.includes('more')) return 'm';
    if (t.includes('toy costs') && t.includes('how much more')) return 'm';

    // Needs vs Wants (direct identification)
    if (t.includes('need or a want')) return 'e';
    if (t.includes('which of these is a need')) return 'e';
    if (t.includes('which of these is a want')) return 'e';
    if (t.includes('what does saving money mean')) return 'e';
    if (t.includes('what does spending money mean')) return 'e';
    if (t.includes('what does giving money mean')) return 'e';
    if (t.includes('what is a budget')) return 'e';
    if (t.includes('which of these is an example of giving')) return 'e';

    // Financial literacy reasoning
    if (t.includes('why is saving money')) return 'm';
    if (t.includes('best order for making money')) return 'm';
    if (t.includes('best choice') || t.includes('what is the best')) return 'm';

    // Saving calculations (multiply)
    if (t.includes('save') && t.includes('every week') && t.includes('how much')) return 'm';
    if (t.includes('save $') && t.includes('week')) return 'm';

    // Multi-step money reasoning
    if (t.includes('can she buy both') || t.includes('can he buy both')) return 'h';
    if (t.includes('how much more money do you need')) return 'm';
    if ((t.includes('earn') || t.includes('have')) && t.includes('spend') && t.includes('left')) return 'm';
    if (t.includes('saved') && t.includes('spend') && t.includes('left')) return 'm';

    return 'm';
  }

  // === UNIT 6: Data & Graphs ===
  if (unit === '6') {
    // === Tally marks (L1) ===
    if (t.includes('how many tally marks are shown')) {
      const svgContent = q.t;
      const diagonals = (svgContent.match(/y1="27"[^/]*y2="3"/g) || []).length;
      if (diagonals >= 2) return 'm'; // 2+ groups = count by 5s then add
      return 'e'; // single group or just individual marks
    }
    if (t.includes('each single tally mark')) return 'e';
    if (t.includes('what number does this tally group equal')) return 'e';
    if (t.includes('why is the 5th mark drawn diagonally')) return 'e';
    if (t.includes('which group has more tally marks')) return 'm';
    if (t.includes('how many more marks does')) return 'm';
    if (t.includes('total of both rows')) return 'm';

    // === Pictographs (L3) ===
    // "who read the most/fewest" = visual scan, easy
    if (t.includes('who read the most') || t.includes('who read the fewest') ||
        t.includes('who earned the most') || t.includes('who earned the fewest') ||
        t.includes('who scored the most') || t.includes('who scored the fewest')) return 'e';
    if (t.includes('who ate the most') || t.includes('who ate the fewest')) return 'e';

    // Pictograph: read a single value with key (count icons x key = 1 multiply step)
    if (t.includes('key:') && t.includes('how many') && !t.includes('more') && !t.includes('fewer') && !t.includes('total') && !t.includes('altogether')) return 'm';

    // Pictograph: "how many more did X than Y" = read 2 values with key, subtract
    if (t.includes('key:') && (t.includes('how many more') || t.includes('how many fewer'))) return 'h';

    // Pictograph: total = read all values with key, add all
    if (t.includes('key:') && (t.includes('total') || t.includes('altogether') || t.includes('in all'))) return 'h';

    // === Bar graphs (L2) ===
    // Which is most/least popular = visual scan
    if (t.includes('which') && (t.includes('most popular') || t.includes('least popular') || t.includes('most votes') || t.includes('fewest'))) return 'e';
    if (t.includes('which pet is most') || t.includes('which pet is least')) return 'e';
    if (t.includes('which sport is most') || t.includes('which sport is least')) return 'e';
    if (t.includes('which fruit') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which color') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which season') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which flavor') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which snack') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which subject') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which day') && (t.includes('most') || t.includes('least'))) return 'e';
    if (t.includes('which') && t.includes('most') && !t.includes('more than')) return 'e';
    if (t.includes('which') && t.includes('least') && !t.includes('at least')) return 'e';

    // Bar graph: what does the axis show / what is the title
    if (t.includes('what is the title')) return 'e';
    if (t.includes('what does the') && t.includes('axis')) return 'e';
    if (t.includes('what does each picture stand for')) return 'e';
    if (t.includes('which bar is the tallest') || t.includes('which bar is the shortest')) return 'e';

    // Bar/line graph: simple value read ("how many students chose X" / "how many have X pets")
    if (t.match(/how many (students|people|children|kids|votes|chose)/) && !t.includes('more') && !t.includes('fewer') && !t.includes('total') && !t.includes('altogether') && !t.includes('combined') && !t.includes('in all') && !t.includes('or')) return 'e';
    if (t.includes('how many students have') && !t.includes('more') && !t.includes('fewer') && !t.includes('total') && !t.includes('or')) return 'e';

    // "Which number of pets is most/least common" = visual scan
    if (t.includes('which number') && (t.includes('most common') || t.includes('least common'))) return 'e';

    // Bar/line graph: compare two values ("how many more/fewer")
    if (t.includes('how many more') || t.includes('how many fewer')) return 'm';
    if (t.includes('difference between')) return 'm';

    // Bar/line graph: "X or Y" combined (read 2 + add)
    if (t.includes('how many') && t.includes(' or ')) return 'm';

    // Bar/line graph: total / altogether (read all + add)
    if (t.includes('total') || t.includes('altogether') || t.includes('in all') || t.includes('surveyed in total')) return 'm';
    if (t.includes('how many students were surveyed')) return 'm';
    if (t.includes('combined') || t.includes('together')) return 'm';

    // === Line plots (L4) ===
    // Conditional / hypothetical / multi-step
    if (t.includes('if') && (t.includes('more') || t.includes('added') || t.includes('joined') || t.includes('next week') || t.includes('changed'))) return 'h';
    if (t.includes('predict') || t.includes('if the pattern continues')) return 'h';
    if (t.includes('what can you conclude')) return 'h';
    if (t.includes('why might')) return 'h';
    if (t.includes('which statement is true')) return 'm';
    if (t.includes('true about the data')) return 'm';

    return 'm';
  }

  return 'm';
}

let totalProcessed = 0;

for (const fileName of files) {
  const filePath = path.join(__dirname, fileName);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);
    const counts = { e: 0, m: 0, h: 0 };

    for (const q of questions) {
      // Remove old d if present, reclassify
      q.d = classify(q, fileName);
      counts[q.d]++;
    }

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2) + '\n', 'utf8');

    totalProcessed += questions.length;
    console.log(fileName + ': ' + questions.length + ' questions (E:' + counts.e + ' M:' + counts.m + ' H:' + counts.h + ')');
  } catch (err) {
    console.error('ERROR ' + filePath + ': ' + err.message);
  }
}

console.log('\nTotal: ' + totalProcessed);
