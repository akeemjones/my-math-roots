// add-spiral-review.js — injects spiral review questions into testBank of U5–U10
// Run: node scripts/add-spiral-review.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');

const SPIRAL = {
  u5: [
    {t:"You have 25¢ and find 18¢ more. How much do you have now?",o:["43¢","33¢","53¢","38¢"],a:0,e:"Add: 25+18=43. Count on from 25 — you now have 43¢!"},
    {t:"A toy costs 50¢. You have 35¢. How much more do you need?",o:["15¢","25¢","85¢","20¢"],a:0,e:"Subtract: 50−35=15. You still need 15¢ more!"},
    {t:"4 dimes is the same as how many pennies?",o:["40","14","4","44"],a:0,e:"Each dime equals 10 pennies. 4 dimes = 4×10 = 40 pennies!"},
    {t:"You buy a pencil for 37¢ and an eraser for 24¢. How much do you spend in all?",o:["61¢","51¢","71¢","57¢"],a:0,e:"Add with regrouping: ones 7+4=11, write 1 regroup 1 ten; tens 3+2+1=6. Total: 61¢!"}
  ],
  u6: [
    {t:"A bar graph shows 12 apples and 18 oranges. How many fruits are there in all?",o:["30","6","12","18"],a:0,e:"Add the two bars: 12+18=30 fruits in all!"},
    {t:"A tally chart shows 25 votes for cats and 13 votes for dogs. How many more students chose cats?",o:["12","38","25","13"],a:0,e:"Subtract: 25−13=12. Twelve more students chose cats!"},
    {t:"In a pictograph each picture stands for 2 students. There are 5 pictures. How many students is that?",o:["10","5","2","7"],a:0,e:"Count by 2s: 2, 4, 6, 8, 10. Five pictures × 2 = 10 students!"}
  ],
  u7: [
    {t:"A pencil is 7 inches long. An eraser is 3 inches long. Laid end-to-end, how long are they together?",o:["10 inches","4 inches","21 inches","73 inches"],a:0,e:"Add the lengths: 7+3=10 inches total!"},
    {t:"A desk is 36 inches long. A shelf is 24 inches long. How much longer is the desk?",o:["12 inches","60 inches","14 inches","10 inches"],a:0,e:"Subtract: 36−24=12. The desk is 12 inches longer!"},
    {t:"A ribbon is 48 inches long. You cut off 19 inches. How much ribbon is left?",o:["29 inches","67 inches","31 inches","38 inches"],a:0,e:"Subtract with regrouping: 48−19. Regroup 1 ten → 18−9=9, tens: 3−1=2. Answer: 29 inches!"}
  ],
  u8: [
    {t:"8 cookies are shared equally among 2 friends. How many cookies does each friend get?",o:["4","2","8","6"],a:0,e:"Share equally: 8÷2=4. Each friend gets 4 cookies!"},
    {t:"A pizza has 4 equal slices. You eat 1 slice. How many slices are left?",o:["3","1","4","2"],a:0,e:"Subtract: 4−1=3 slices left. The pizza had 4 equal parts!"},
    {t:"You have 2 halves of one sandwich and 2 halves of another. How many whole sandwiches do you have?",o:["2","4","1","3"],a:0,e:"Two halves make 1 whole. You have 4 halves total = 2 whole sandwiches!"}
  ],
  u9: [
    {t:"A triangle has 3 sides. A pentagon has 5 sides. How many sides do they have altogether?",o:["8","15","35","2"],a:0,e:"Add the sides: 3+5=8 sides altogether!"},
    {t:"A rectangle has two sides of 5 inches and two sides of 3 inches. What is the total distance around it?",o:["16 inches","15 inches","8 inches","10 inches"],a:0,e:"Add all 4 sides: 5+3+5+3=16 inches all the way around!"},
    {t:"A square has 4 corners (vertices). A triangle has 3 corners. How many corners in all?",o:["7","5","9","12"],a:0,e:"Add the vertices: 4+3=7 corners in all!"}
  ],
  u10: [
    {t:"There are 3 bags with 5 apples in each bag. 5+5+5 = ?",o:["15","8","10","20"],a:0,e:"Add equal groups: 5+5+5=15. Three groups of 5 is the same as 3×5!"},
    {t:"Skip count by 10 four times starting at 0. What number do you land on?",o:["40","14","4","44"],a:0,e:"0, 10, 20, 30, 40 — four jumps of 10 lands you on 40!"},
    {t:"There are 4 groups of 2 pencils. 2+2+2+2 = ?",o:["8","6","2","4"],a:0,e:"Add 2 four times: 2+2+2+2=8. Four equal groups of 2 makes 8!"}
  ]
};

let changed = 0;

for (const [unit, questions] of Object.entries(SPIRAL)) {
  const file = path.join(DATA_DIR, `${unit}.js`);
  let src = fs.readFileSync(file, 'utf8');

  // Find the testBank array — we need to append before its closing ]
  // testBank is followed by optional whitespace then ]}  or ]}); etc.
  // Strategy: find last occurrence of "testBank":[...] and insert before the final ]
  const tbStart = src.lastIndexOf('"testBank":[');
  if (tbStart === -1) { console.warn(`No testBank in ${unit}`); continue; }

  // Walk from tbStart to find the matching closing ]
  let depth = 0;
  let i = tbStart + '"testBank":'.length;
  let closeIdx = -1;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) { closeIdx = i; break; }
    }
  }
  if (closeIdx === -1) { console.warn(`Could not find testBank end in ${unit}`); continue; }

  // Check for duplicates by question text
  const newQs = questions.filter(q => !src.includes(q.t.substring(0, 30)));
  if (newQs.length === 0) { console.log(`${unit}: all spiral questions already present`); continue; }

  const insert = ',' + newQs.map(q => JSON.stringify(q)).join(',');
  src = src.slice(0, closeIdx) + insert + src.slice(closeIdx);
  fs.writeFileSync(file, src, 'utf8');
  console.log(`${unit}: added ${newQs.length} spiral review questions`);
  changed++;
}

console.log(`\nDone — ${changed} files updated.`);
