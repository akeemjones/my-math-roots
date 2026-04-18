// Kindergarten Unit 7: Measurement — Comparing & Ordering
// Covers TEKS K.7A (measurable attributes: length, capacity, weight)
//         TEKS K.7B (compare two objects with a common measurable attribute)
// Calls _mergeKUnitData — available globally from shared_k.js in the app bundle.
_mergeKUnitData(6, {
  lessons: [

    // ── Lesson 1: Comparing Length & Height — K.7A, K.7B ────────────────────
    {
      points: [
        'LENGTH tells you how long something is — compare by putting objects side by side',
        'The LONGER object sticks out farther at one end — the SHORTER one does not reach as far',
        'HEIGHT is how TALL something is — taller objects reach higher up'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Longer vs Shorter',
          p: 'A pencil and a ruler are placed side by side. The ruler sticks out much farther. Which is LONGER?',
          v: null,
          s: 'Line them up at one end. The ruler goes farther — so the ruler is LONGER!',
          a: 'Ruler ✅'
        },
        {
          c: '#1976D2',
          tag: 'Taller vs Shorter',
          p: 'A giraffe and a dog stand next to each other. The giraffe\'s head reaches much higher. Which is TALLER?',
          v: null,
          s: 'Taller means it reaches higher up. The giraffe\'s head is way up high — so the giraffe is TALLER!',
          a: 'Giraffe ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Indirect Comparison',
          p: 'A is longer than B. B is longer than C. Which is SHORTEST?',
          v: null,
          s: 'C is shorter than B, and B is shorter than A — so C is the SHORTEST!',
          a: 'C ✅'
        }
      ],
      practice: [
        {q:'Which is longer — a school bus or a pencil?', a:'School bus', h:'Think about how big each one is in real life', e:'School bus! It is much longer than a pencil ✅'},
        {q:'A dog is taller than a cat. Which is SHORTER?', a:'Cat', h:'Shorter means it does not reach as high', e:'The cat is shorter — it does not reach as high as the dog ✅'},
        {q:'A is longer than B. B is longer than C. Which is LONGEST?', a:'A', h:'A is longer than everything else in the list', e:'A is the longest — it is longer than B and B is longer than C ✅'}
      ],
      qBank: [
        // ── easy — basic longer/shorter/taller/shorter ───────────────────────
        {
          t: 'Which is longer?',
          v: {type:'comparison',config:{left:{label:'🚌 bus',barLen:9,color:'#f59e0b'},right:{label:'✏️ pencil',barLen:2,color:'#8b5cf6'}}},
          o: [{val:'bus'},{val:'pencil',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Bus! The bus bar is much longer.', d:'e', s:null, h:'Which bar goes farther to the right?'
        },
        {
          t: 'Which is shorter?',
          v: {type:'comparison',config:{left:{label:'🐘 elephant',barLen:9,color:'#94a3b8'},right:{label:'🐜 ant',barLen:1,color:'#10b981'}}},
          o: [{val:'elephant',tag:'err_longer_shorter'},{val:'ant'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Ant! The ant bar is much shorter.', d:'e', s:null, h:'Which bar is smaller?'
        },
        {
          t: 'Which is longer?',
          v: {type:'comparison',config:{left:{label:'📏 ruler',barLen:8,color:'#6366f1'},right:{label:'🖍️ crayon',barLen:3,color:'#ec4899'}}},
          o: [{val:'crayon',tag:'err_longer_shorter'},{val:'ruler'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Ruler! The ruler bar goes farther.', d:'e', s:null, h:'Which bar reaches farther?'
        },
        {
          t: 'Which is shorter?',
          v: {type:'comparison',config:{left:{label:'🐕 dog',barLen:7,color:'#d97706'},right:{label:'🐈 cat',barLen:4,color:'#06b6d4'}}},
          o: [{val:'dog',tag:'err_longer_shorter'},{val:'cat'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Cat! The cat bar is shorter.', d:'e', s:null, h:'Which bar is shorter?'
        },
        {
          t: 'Which is taller?',
          v: {type:'comparison',config:{left:{label:'🏠 house',barLen:9,color:'#ef4444'},right:{label:'🌸 flower',barLen:2,color:'#84cc16'}}},
          o: [{val:'house'},{val:'flower',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'House! The house bar is much taller.', d:'e', s:null, h:'Which bar goes higher?'
        },
        {
          t: 'Which is longer?',
          v: {type:'comparison',config:{left:{label:'🍴 fork',barLen:7,color:'#7c3aed'},right:{label:'🥄 spoon',barLen:4,color:'#f97316'}}},
          o: [{val:'fork'},{val:'spoon',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Fork! The fork bar goes farther.', d:'e', s:null, h:'Which bar is longer?'
        },
        {
          t: 'Which is longer?',
          v: {type:'comparison',config:{left:{label:'💪 arm',barLen:9,color:'#f59e0b'},right:{label:'☝️ finger',barLen:2,color:'#06b6d4'}}},
          o: [{val:'arm'},{val:'finger',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Arm! The arm bar is much longer.', d:'e', s:null, h:'Which bar stretches farther?'
        },
        {
          t: 'Which is taller?',
          v: {type:'comparison',config:{left:{label:'🌳 tree',barLen:8,color:'#22c55e'},right:{label:'🌿 bush',barLen:3,color:'#86efac'}}},
          o: [{val:'tree'},{val:'bush',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Tree! The tree bar is taller.', d:'e', s:null, h:'Which bar reaches higher?'
        },
        {
          t: 'Which is shorter?',
          v: {type:'comparison',config:{left:{label:'🐍 snake',barLen:8,color:'#16a34a'},right:{label:'🪱 worm',barLen:2,color:'#ca8a04'}}},
          o: [{val:'snake',tag:'err_longer_shorter'},{val:'worm'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Worm! The worm bar is much shorter.', d:'e', s:null, h:'Which bar is shorter?'
        },
        {
          t: 'Which is shorter?',
          v: {type:'comparison',config:{left:{label:'🚌 school bus',barLen:9,color:'#f59e0b'},right:{label:'🚗 car',barLen:5,color:'#3b82f6'}}},
          o: [{val:'school bus',tag:'err_longer_shorter'},{val:'car'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Car! The car bar is shorter.', d:'e', s:null, h:'Which bar is shorter?'
        },
        // ── medium — comparisons in context ─────────────────────────────────
        {
          t: 'Which ribbon is longer?',
          v: {type:'comparison',config:{left:{label:'🔴 red ribbon',barLen:8,color:'#ef4444'},right:{label:'🔵 blue ribbon',barLen:4,color:'#3b82f6'}}},
          o: [{val:'red ribbon'},{val:'blue ribbon',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Red ribbon! The red bar is longer.', d:'m', s:null, h:'Which bar goes farther?'
        },
        {
          t: 'A cat is shorter than a dog. A dog is shorter than a horse. Which is TALLEST?',
          v: null,
          o: [{val:'cat',tag:'err_longer_shorter'},{val:'dog',tag:'err_longer_shorter'},{val:'horse'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Horse! Dog is taller than cat, and horse is taller than dog — so horse is tallest.', d:'m', s:null, h:'Which one is taller than ALL the others?'
        },
        {
          t: 'Which is shorter?',
          v: {type:'comparison',config:{left:{label:'📚 bookshelf',barLen:8,color:'#7c3aed'},right:{label:'🪑 chair',barLen:5,color:'#d97706'}}},
          o: [{val:'bookshelf',tag:'err_longer_shorter'},{val:'chair'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Chair! The chair bar is shorter.', d:'m', s:null, h:'Which bar is shorter?'
        },
        {
          t: 'A building is taller than a tree. A tree is taller than a bush. Which is SHORTEST?',
          v: null,
          o: [{val:'building',tag:'err_longer_shorter'},{val:'tree',tag:'err_longer_shorter'},{val:'bush'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Bush! Tree is taller than bush, building is taller than tree — bush is the shortest.', d:'m', s:null, h:'Which one is shorter than ALL the others?'
        },
        {
          t: 'Which straw is shorter?',
          v: {type:'comparison',config:{left:{label:'🔴 red straw',barLen:4,color:'#ef4444'},right:{label:'🔵 blue straw',barLen:7,color:'#3b82f6'}}},
          o: [{val:'red straw'},{val:'blue straw',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Red straw! The red bar is shorter.', d:'m', s:null, h:'Which bar is shorter?'
        },
        {
          t: 'Which straw is longer?',
          v: {type:'comparison',config:{left:{label:'🔴 red straw',barLen:4,color:'#ef4444'},right:{label:'🔵 blue straw',barLen:7,color:'#3b82f6'}}},
          o: [{val:'red straw',tag:'err_longer_shorter'},{val:'blue straw'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Blue straw! The blue bar goes farther.', d:'m', s:null, h:'Which bar goes farther?'
        },
        {
          t: 'Which is shorter?',
          v: {type:'comparison',config:{left:{label:'✏️ pencil',barLen:7,color:'#f59e0b'},right:{label:'🖍️ crayon',barLen:4,color:'#ec4899'}}},
          o: [{val:'pencil',tag:'err_longer_shorter'},{val:'crayon'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Crayon! The crayon bar is shorter.', d:'m', s:null, h:'Which bar is shorter?'
        },
        {
          t: 'Tom is taller than Sue. Sue is taller than Ben. Who is the SHORTEST?',
          v: null,
          o: [{val:'Tom',tag:'err_longer_shorter'},{val:'Sue',tag:'err_longer_shorter'},{val:'Ben'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Ben! Ben is shorter than Sue, and Sue is shorter than Tom.', d:'m', s:null, h:'Who is shorter than everyone else?'
        },
        {
          t: 'A nail and a screw are placed side by side. They reach the exact same spot. What can you say?',
          v: null,
          o: [{val:'the nail is longer',tag:'err_random'},{val:'the screw is longer',tag:'err_random'},{val:'they are the same length'},{val:'cannot compare them',tag:'err_random'}],
          a:2, e:'Same length! When two objects line up exactly, they are the same length.', d:'m', s:null, h:'If they reach the exact same spot, what does that tell you?'
        },
        {
          t: 'A paper clip and an eraser are placed end to end. They reach the same spot. Are they the same length?',
          v: null,
          o: [{val:'yes — they are the same length'},{val:'no — the paper clip is longer',tag:'err_random'},{val:'no — the eraser is longer',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Yes! If they reach the same spot, they are the same length.', d:'m', s:null, h:'Same spot = same length'
        },
        // ── hard — indirect comparison, multi-step reasoning ─────────────────
        {
          t: 'If A is longer than B, and B is longer than C, which is LONGEST?',
          v: null,
          o: [{val:'A'},{val:'B',tag:'err_random'},{val:'C',tag:'err_random'},{val:'they are all the same',tag:'err_random'}],
          a:0, e:'A! A is longer than B, and B is already longer than C — so A is the longest of all.', d:'h', s:null, h:'A is longer than B. B is longer than C. So A is longer than both!'
        },
        {
          t: 'If A is shorter than B, and B is shorter than C, which is SHORTEST?',
          v: null,
          o: [{val:'A'},{val:'B',tag:'err_random'},{val:'C',tag:'err_longer_shorter'},{val:'they are all the same',tag:'err_random'}],
          a:0, e:'A! A is shorter than B, and B is shorter than C — so A is the shortest.', d:'h', s:null, h:'A is shorter than B. B is shorter than C. So A is shorter than both!'
        },
        {
          t: 'Rod 1 is longer than Rod 2. Rod 2 is the same length as Rod 3. Is Rod 1 longer or shorter than Rod 3?',
          v: null,
          o: [{val:'longer'},{val:'shorter',tag:'err_longer_shorter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Longer! Rod 2 = Rod 3, and Rod 1 is longer than Rod 2 — so Rod 1 is longer than Rod 3 too.', d:'h', s:null, h:'If Rod 1 > Rod 2, and Rod 2 = Rod 3, then Rod 1 is ___ than Rod 3?'
        },
        {
          t: 'A plant grows a little taller every week. Is it taller or shorter than it was before?',
          v: null,
          o: [{val:'taller'},{val:'shorter',tag:'err_longer_shorter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Taller! Growing means it gets taller each week.', d:'h', s:null, h:'Growing means getting taller — not shorter'
        },
        {
          t: 'Ali is shorter than Sam. Sam is shorter than Pat. Who is the TALLEST?',
          v: null,
          o: [{val:'Ali',tag:'err_longer_shorter'},{val:'Sam',tag:'err_longer_shorter'},{val:'Pat'},{val:'they are all the same',tag:'err_random'}],
          a:2, e:'Pat! Sam is taller than Ali, and Pat is taller than Sam — Pat is tallest.', d:'h', s:null, h:'Who is taller than everyone else in the list?'
        },
        {
          t: 'A string is cut in half. Is each piece longer or shorter than the whole string?',
          v: null,
          o: [{val:'longer',tag:'err_longer_shorter'},{val:'shorter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Shorter! Half of something is always shorter than the whole.', d:'h', s:null, h:'If you cut something in half, is each piece bigger or smaller than the original?'
        },
        {
          t: 'Two towers: Tower A is taller than Tower B. Which tower would you see from farther away?',
          v: null,
          o: [{val:'Tower A'},{val:'Tower B',tag:'err_longer_shorter'},{val:'both the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Tower A! Taller towers can be seen from farther away.', d:'h', s:null, h:'Which tower reaches higher — and can be spotted from a distance?'
        },
        {
          t: 'Zoe is taller than Yara. Yara is taller than Xena. Who is the SHORTEST?',
          v: null,
          o: [{val:'Zoe',tag:'err_longer_shorter'},{val:'Yara',tag:'err_longer_shorter'},{val:'Xena'},{val:'they are all the same',tag:'err_random'}],
          a:2, e:'Xena! Xena is shorter than Yara, and Yara is shorter than Zoe.', d:'h', s:null, h:'Who is shorter than everyone else?'
        }
      ]
    },

    // ── Lesson 2: Comparing Weight & Capacity — K.7A, K.7B ─────────────────
    {
      points: [
        'WEIGHT tells you how HEAVY something is — heavier things are harder to lift',
        'CAPACITY tells you how MUCH something holds — a bigger container holds more',
        'Compare weight by picking objects up; compare capacity by filling with water'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Heavier vs Lighter',
          p: 'A bowling ball and a balloon. Which is HEAVIER?',
          v: null,
          s: 'Pick up each one in your mind. The bowling ball would pull your arm way down — it is HEAVIER. The balloon floats up — it is LIGHTER!',
          a: 'Bowling ball ✅'
        },
        {
          c: '#1976D2',
          tag: 'Holds More vs Holds Less',
          p: 'A bucket and a cup — which holds MORE water?',
          v: null,
          s: 'A bucket is much bigger inside. You can pour MANY cups of water into a bucket — so a bucket holds MORE!',
          a: 'Bucket ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Balance Scale',
          p: 'You put a book on one side of a balance scale. That side goes DOWN. Which is HEAVIER?',
          v: null,
          s: 'The side that goes DOWN is heavier — the book pushed it down because the book is HEAVIER.',
          a: 'Book side ✅'
        }
      ],
      practice: [
        {q:'Which is heavier — an elephant or a feather?', a:'Elephant', h:'Which would be impossible to lift?', e:'Elephant! It weighs thousands of pounds — much heavier than a feather ✅'},
        {q:'Which holds more — a swimming pool or a glass?', a:'Swimming pool', h:'Which is much bigger on the inside?', e:'Swimming pool! You can fill it with thousands of glasses of water ✅'},
        {q:'A brick is heavier than a sponge. Which is LIGHTER?', a:'Sponge', h:'If A is heavier, the other one is lighter', e:'Sponge — it is light and soft! The brick is heavier ✅'}
      ],
      qBank: [
        // ── easy — basic heavier/lighter, holds more/less ────────────────────
        {
          t: 'Which is heavier — an elephant or a feather?',
          v: null,
          o: [{val:'elephant'},{val:'feather',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Elephant! It weighs thousands of pounds — much heavier than a feather.', d:'e', s:null, h:'Which would be impossible for you to lift?'
        },
        {
          t: 'Which is lighter — a book or a piece of paper?',
          v: null,
          o: [{val:'book',tag:'err_heavier_lighter'},{val:'piece of paper'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Piece of paper! A single sheet of paper is much lighter than a whole book.', d:'e', s:null, h:'Which one could you blow with a puff of air?'
        },
        {
          t: 'A watermelon is heavier than an apple. Which is LIGHTER?',
          v: null,
          o: [{val:'watermelon',tag:'err_heavier_lighter'},{val:'apple'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Apple! The watermelon is heavier, so the apple is lighter.', d:'e', s:null, h:'If A is heavier, the other one must be lighter'
        },
        {
          t: 'Which holds MORE water — a bucket or a cup?',
          v: null,
          o: [{val:'bucket'},{val:'cup',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Bucket! A bucket is much bigger inside — it holds far more water.', d:'e', s:null, h:'Which is much bigger on the inside?'
        },
        {
          t: 'Which holds LESS — a bathtub or a teaspoon?',
          v: null,
          o: [{val:'bathtub',tag:'err_random'},{val:'teaspoon'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Teaspoon! A teaspoon only holds a tiny amount — much less than a bathtub.', d:'e', s:null, h:'Which one is tiny and can only hold a little?'
        },
        {
          t: 'A truck is heavier than a bicycle. Which is HEAVIER?',
          v: null,
          o: [{val:'truck'},{val:'bicycle',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Truck! The question already says the truck is heavier.', d:'e', s:null, h:'Re-read — it tells you which one is heavier'
        },
        {
          t: 'Which is lighter — a balloon or a rock?',
          v: null,
          o: [{val:'balloon'},{val:'rock',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Balloon! A balloon is so light it floats in the air.', d:'e', s:null, h:'Which one floats up into the air?'
        },
        {
          t: 'Which holds more — a swimming pool or a glass?',
          v: null,
          o: [{val:'swimming pool'},{val:'glass',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Swimming pool! You can fill it with thousands of glasses of water.', d:'e', s:null, h:'Which one is enormous and takes hours to fill?'
        },
        {
          t: 'A brick is heavier than a sponge. Which is LIGHTER?',
          v: null,
          o: [{val:'brick',tag:'err_heavier_lighter'},{val:'sponge'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Sponge! The brick is heavier, so the sponge is lighter.', d:'e', s:null, h:'If A is heavier, what does that make the other one?'
        },
        {
          t: 'Which holds less — a spoon or a pot?',
          v: null,
          o: [{val:'spoon'},{val:'pot',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Spoon! A spoon can only hold a tiny amount — much less than a pot.', d:'e', s:null, h:'Which one is tiny and can only scoop a little?'
        },
        // ── medium — context, balance scale, capacity reasoning ──────────────
        {
          t: 'A bag of apples and a bag of cotton balls are the same size. Which bag is HEAVIER?',
          v: null,
          o: [{val:'bag of apples'},{val:'bag of cotton balls',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Bag of apples! Apples are much denser and heavier than fluffy cotton balls.', d:'m', s:null, h:'Even same-size bags can weigh differently — which feels harder to lift?'
        },
        {
          t: 'A pitcher is much bigger than a glass. Which holds MORE?',
          v: null,
          o: [{val:'pitcher'},{val:'glass',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Pitcher! A bigger container holds more.', d:'m', s:null, h:'Which container is bigger on the inside?'
        },
        {
          t: 'You put a book on one side of a balance scale. The book side goes DOWN. Which is HEAVIER?',
          v: null,
          o: [{val:'book side'},{val:'empty side',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Book side! The heavier side pushes the scale DOWN.', d:'m', s:null, h:'On a balance scale, which side goes down — the heavier or lighter side?'
        },
        {
          t: 'A pillow and a bowling ball. Which is LIGHTER?',
          v: null,
          o: [{val:'pillow'},{val:'bowling ball',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Pillow! A pillow is soft and light — a bowling ball is heavy.', d:'m', s:null, h:'Which one could you carry in one finger?'
        },
        {
          t: 'Mia\'s backpack is heavier than Tom\'s. Who has the LIGHTER backpack?',
          v: null,
          o: [{val:'Mia',tag:'err_heavier_lighter'},{val:'Tom'},{val:'they are the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Tom! Mia\'s is heavier, so Tom\'s must be lighter.', d:'m', s:null, h:'If Mia\'s is heavier, what does that make Tom\'s?'
        },
        {
          t: 'A large bottle and a small bottle of water. Which bottle holds MORE?',
          v: null,
          o: [{val:'large bottle'},{val:'small bottle',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Large bottle! A bigger container holds more.', d:'m', s:null, h:'Which bottle is bigger on the inside?'
        },
        {
          t: 'You hold a rock in one hand and a leaf in the other. Which hand feels HEAVIER?',
          v: null,
          o: [{val:'rock hand'},{val:'leaf hand',tag:'err_heavier_lighter'},{val:'they feel the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Rock hand! Rocks are much heavier than leaves.', d:'m', s:null, h:'Which object would pull your hand down more?'
        },
        {
          t: 'A coin is heavier than a piece of paper. Which is LIGHTER?',
          v: null,
          o: [{val:'coin',tag:'err_heavier_lighter'},{val:'piece of paper'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Piece of paper! It is so light you can blow it across a table.', d:'m', s:null, h:'If the coin is heavier, the paper must be ___?'
        },
        {
          t: 'A pot is much bigger than a bowl. Which holds LESS?',
          v: null,
          o: [{val:'pot',tag:'err_random'},{val:'bowl'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Bowl! A smaller container holds less.', d:'m', s:null, h:'Which container is smaller on the inside?'
        },
        {
          t: 'Two balance pans: the left side has a toy car, the right side has a crayon. The left side goes DOWN. Which is HEAVIER?',
          v: null,
          o: [{val:'toy car'},{val:'crayon',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Toy car! The left side went down — the toy car is heavier.', d:'m', s:null, h:'The side that goes DOWN on a balance has the heavier object'
        },
        // ── hard — indirect weight/capacity reasoning ────────────────────────
        {
          t: 'A watermelon is heavier than a mango. A mango is heavier than a grape. Which is LIGHTEST?',
          v: null,
          o: [{val:'watermelon',tag:'err_heavier_lighter'},{val:'mango',tag:'err_heavier_lighter'},{val:'grape'},{val:'they all weigh the same',tag:'err_random'}],
          a:2, e:'Grape! Mango is heavier than grape, watermelon is heavier than mango — grape is lightest.', d:'h', s:null, h:'Which one is lighter than all the others?'
        },
        {
          t: 'Box A weighs more than Box B. Box B weighs more than Box C. Which is HEAVIEST?',
          v: null,
          o: [{val:'Box A'},{val:'Box B',tag:'err_heavier_lighter'},{val:'Box C',tag:'err_heavier_lighter'},{val:'they all weigh the same',tag:'err_random'}],
          a:0, e:'Box A! A is heavier than B, and B is heavier than C — so A is heaviest.', d:'h', s:null, h:'Which box is heavier than all the others?'
        },
        {
          t: 'Container A holds more than Container B. Container B holds more than Container C. Which holds LEAST?',
          v: null,
          o: [{val:'Container A',tag:'err_random'},{val:'Container B',tag:'err_random'},{val:'Container C'},{val:'they all hold the same',tag:'err_random'}],
          a:2, e:'Container C! It holds less than B, and B already holds less than A.', d:'h', s:null, h:'Which container holds less than ALL the others?'
        },
        {
          t: 'Three containers: a bucket (very big), a jug (medium), a glass (tiny). Which holds the MOST?',
          v: null,
          o: [{val:'bucket'},{val:'jug',tag:'err_random'},{val:'glass',tag:'err_random'},{val:'they hold the same',tag:'err_random'}],
          a:0, e:'Bucket! The biggest container holds the most.', d:'h', s:null, h:'Which container is biggest on the inside?'
        },
        {
          t: 'A full water bottle is heavier than an empty one. Which is LIGHTER?',
          v: null,
          o: [{val:'full bottle',tag:'err_heavier_lighter'},{val:'empty bottle'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Empty bottle! The water adds weight — without water, the bottle is lighter.', d:'h', s:null, h:'Which bottle has nothing heavy inside it?'
        },
        {
          t: 'Tom\'s bag of rocks weighs more than Sam\'s bag of feathers. Which bag is LIGHTER?',
          v: null,
          o: [{val:'Tom\'s bag of rocks',tag:'err_heavier_lighter'},{val:'Sam\'s bag of feathers'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Sam\'s bag of feathers! Feathers are much lighter than rocks.', d:'h', s:null, h:'If Tom\'s bag is heavier, Sam\'s bag must be ___?'
        },
        {
          t: 'Three jugs: Jug A holds the least, Jug B holds the most, Jug C holds the middle amount. Which jug holds LESS than Jug C?',
          v: null,
          o: [{val:'Jug A'},{val:'Jug B',tag:'err_random'},{val:'Jug C',tag:'err_random'},{val:'none of them',tag:'err_random'}],
          a:0, e:'Jug A! Jug A holds the least — less than Jug C and Jug B.', d:'h', s:null, h:'Jug A holds the LEAST — is that more or less than the middle?'
        },
        {
          t: 'A backpack with 5 books is heavier than a backpack with 1 book. Which backpack is LIGHTER?',
          v: null,
          o: [{val:'backpack with 5 books',tag:'err_heavier_lighter'},{val:'backpack with 1 book'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Backpack with 1 book! Fewer books means less weight — it is lighter.', d:'h', s:null, h:'Which backpack has fewer books — and so less weight?'
        }
      ]
    },

    // ── Lesson 3: Ordering by Size — K.7B ────────────────────────────────────
    {
      points: [
        'You can put objects in ORDER from shortest to longest, or from lightest to heaviest',
        'SHORTEST comes FIRST when ordering from shortest to longest',
        'The object in the MIDDLE is longer than the shortest but shorter than the longest'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Order Three Objects',
          p: 'Three crayons: red (long), blue (short), green (medium). Order from SHORTEST to LONGEST.',
          v: null,
          s: 'Shortest first, then middle, then longest: blue → green → red!',
          a: 'Blue, green, red ✅'
        },
        {
          c: '#1976D2',
          tag: 'Find the Middle',
          p: 'Three objects in order: short plant, medium table, tall wall. Which is in the MIDDLE?',
          v: null,
          s: 'The table is taller than the plant but shorter than the wall — it is in the MIDDLE!',
          a: 'Table ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Four in Order',
          p: 'Four friends from tallest to shortest: Pat, Sam, Lia, Tom. Who is the SECOND shortest?',
          v: null,
          s: 'Shortest is Tom (4th), second shortest is Lia (3rd) — counting from the shortest end!',
          a: 'Lia ✅'
        }
      ],
      practice: [
        {q:'Three crayons: red (long), blue (short), green (medium). Which is the SHORTEST?', a:'Blue', h:'Which crayon is smallest?', e:'Blue! It is the shortest crayon of the three ✅'},
        {q:'Three friends: Ana is tallest, Bob is shortest, Carol is in the middle. Who is SHORTEST?', a:'Bob', h:'Which friend is smaller than both others?', e:'Bob — he is shorter than both Ana and Carol ✅'},
        {q:'Objects from lightest to heaviest: feather, apple, brick. Which is HEAVIEST?', a:'Brick', h:'Which comes LAST in the order lightest to heaviest?', e:'Brick — it is at the heavy end of the order ✅'}
      ],
      qBank: [
        // ── easy — identify first/last in a three-object order ───────────────
        {
          t: 'Three objects from shortest to longest: worm, pencil, snake. Which comes FIRST?',
          v: null,
          o: [{val:'worm'},{val:'pencil',tag:'err_random'},{val:'snake',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Worm! The shortest object comes first when ordering shortest to longest.', d:'e', s:null, h:'First in order shortest→longest = the shortest one'
        },
        {
          t: 'Three objects from shortest to longest: worm, pencil, snake. Which comes LAST?',
          v: null,
          o: [{val:'worm',tag:'err_longer_shorter'},{val:'pencil',tag:'err_random'},{val:'snake'},{val:'cannot tell',tag:'err_random'}],
          a:2, e:'Snake! The longest object comes last when ordering shortest to longest.', d:'e', s:null, h:'Last in order shortest→longest = the longest one'
        },
        {
          t: 'Three crayons: red (long), blue (short), green (medium). Which is SHORTEST?',
          v: null,
          o: [{val:'red',tag:'err_longer_shorter'},{val:'blue'},{val:'green',tag:'err_random'},{val:'they are the same',tag:'err_random'}],
          a:1, e:'Blue! The problem says blue is short — it is the shortest.', d:'e', s:null, h:'The problem names one crayon as short — which one?'
        },
        {
          t: 'Three crayons: red (long), blue (short), green (medium). Which is LONGEST?',
          v: null,
          o: [{val:'red'},{val:'blue',tag:'err_longer_shorter'},{val:'green',tag:'err_random'},{val:'they are the same',tag:'err_random'}],
          a:0, e:'Red! The problem says red is long — it is the longest.', d:'e', s:null, h:'The problem names one crayon as long — which one?'
        },
        {
          t: 'Three children: Ana is tallest, Bob is shortest, Carol is middle. Who is SHORTEST?',
          v: null,
          o: [{val:'Ana',tag:'err_longer_shorter'},{val:'Bob'},{val:'Carol',tag:'err_random'},{val:'they are the same',tag:'err_random'}],
          a:1, e:'Bob! The problem says Bob is shortest.', d:'e', s:null, h:'The problem names who is shortest — which child?'
        },
        {
          t: 'A tree, a bush, and a flower. Tree is tallest, flower is shortest. Which is in the MIDDLE?',
          v: null,
          o: [{val:'tree',tag:'err_random'},{val:'bush'},{val:'flower',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Bush! The tree is tallest and the flower is shortest — the bush is in the middle.', d:'e', s:null, h:'If tallest and shortest are taken, which one is left?'
        },
        {
          t: 'Three pencils in order from shortest to longest: small, medium, large. Which is LONGEST?',
          v: null,
          o: [{val:'small',tag:'err_longer_shorter'},{val:'medium',tag:'err_random'},{val:'large'},{val:'cannot tell',tag:'err_random'}],
          a:2, e:'Large! It is at the end of the order — longest comes last.', d:'e', s:null, h:'Longest comes LAST in shortest→longest order'
        },
        {
          t: 'Three pencils: pink (short), green (medium), yellow (long). Which is SHORTEST?',
          v: null,
          o: [{val:'pink'},{val:'green',tag:'err_random'},{val:'yellow',tag:'err_longer_shorter'},{val:'they are the same',tag:'err_random'}],
          a:0, e:'Pink! The problem says pink is short — it is the shortest.', d:'e', s:null, h:'The problem names one pencil as short — which one?'
        },
        {
          t: 'Three pencils: pink (short), green (medium), yellow (long). Which is LONGEST?',
          v: null,
          o: [{val:'pink',tag:'err_longer_shorter'},{val:'green',tag:'err_random'},{val:'yellow'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Yellow! The problem says yellow is long — it is the longest.', d:'e', s:null, h:'The problem names one pencil as long — which one?'
        },
        {
          t: 'Order from tallest to shortest: building, person, ant. What comes FIRST?',
          v: null,
          o: [{val:'building'},{val:'person',tag:'err_random'},{val:'ant',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Building! First in tallest→shortest order = the tallest one.', d:'e', s:null, h:'First in tallest→shortest order = the tallest one'
        },
        // ── medium — middle position, ordering with numbers, 4 objects ───────
        {
          t: 'Three scarves: red (long), green (middle), blue (short). Which is LONGEST?',
          v: null,
          o: [{val:'red'},{val:'green',tag:'err_random'},{val:'blue',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Red! The problem says red is long — it is the longest.', d:'m', s:null, h:'The problem names one scarf as long — which one?'
        },
        {
          t: 'Three scarves: red (long), green (middle), blue (short). Which is in the MIDDLE?',
          v: null,
          o: [{val:'red',tag:'err_random'},{val:'green'},{val:'blue',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Green! Green is longer than blue but shorter than red — it is in the middle.', d:'m', s:null, h:'Which scarf is between the longest and shortest?'
        },
        {
          t: 'Three scarves: red (long), green (middle), blue (short). Order shortest to longest. Which goes SECOND?',
          v: null,
          o: [{val:'red',tag:'err_random'},{val:'green'},{val:'blue',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Green! Order is: blue (short), green (middle), red (long) — green is second.', d:'m', s:null, h:'Shortest first, then middle, then longest — which is second?'
        },
        {
          t: 'Four friends from tallest to shortest: Pat, Sam, Lia, Tom. Who is the SECOND tallest?',
          v: null,
          o: [{val:'Pat',tag:'err_random'},{val:'Sam'},{val:'Lia',tag:'err_random'},{val:'Tom',tag:'err_random'}],
          a:1, e:'Sam! Pat is 1st tallest, Sam is 2nd tallest, Lia is 3rd, Tom is 4th.', d:'m', s:null, h:'First is Pat, so who is second on the list?'
        },
        {
          t: 'Four friends from tallest to shortest: Pat, Sam, Lia, Tom. Who is the SECOND shortest?',
          v: null,
          o: [{val:'Pat',tag:'err_random'},{val:'Sam',tag:'err_random'},{val:'Lia'},{val:'Tom',tag:'err_random'}],
          a:2, e:'Lia! Counting from shortest: Tom is shortest (4th), Lia is 2nd shortest (3rd).', d:'m', s:null, h:'Count from the shortest end: Tom is 1st shortest, who is 2nd?'
        },
        {
          t: 'Objects from lightest to heaviest: feather, apple, brick. Which is in the MIDDLE?',
          v: null,
          o: [{val:'feather',tag:'err_heavier_lighter'},{val:'apple'},{val:'brick',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Apple! It is heavier than a feather but lighter than a brick.', d:'m', s:null, h:'Which object is between the lightest and the heaviest?'
        },
        {
          t: 'Three cups from smallest to largest. You fill them all the way. Which takes the MOST water?',
          v: null,
          o: [{val:'smallest cup',tag:'err_random'},{val:'medium cup',tag:'err_random'},{val:'largest cup'},{val:'they hold the same',tag:'err_random'}],
          a:2, e:'Largest cup! The biggest cup holds the most water.', d:'m', s:null, h:'A bigger cup holds more — which cup is biggest?'
        },
        {
          t: 'Three cups from smallest to largest. You fill them all the way. Which takes the LEAST water?',
          v: null,
          o: [{val:'smallest cup'},{val:'medium cup',tag:'err_random'},{val:'largest cup',tag:'err_random'},{val:'they hold the same',tag:'err_random'}],
          a:0, e:'Smallest cup! The tiniest cup holds the least water.', d:'m', s:null, h:'A smaller cup holds less — which cup is smallest?'
        },
        {
          t: 'A is longer than B. B is longer than C. Put in order from SHORTEST to LONGEST. Which is in the MIDDLE?',
          v: null,
          o: [{val:'A',tag:'err_random'},{val:'B'},{val:'C',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'B! Order is: C (shortest), B (middle), A (longest).', d:'m', s:null, h:'C is shortest, A is longest — B must be in the middle'
        },
        {
          t: 'Order from tallest to shortest: ant, person, building. What comes LAST?',
          v: null,
          o: [{val:'ant'},{val:'person',tag:'err_random'},{val:'building',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Ant! Last in tallest→shortest order = the shortest one.', d:'m', s:null, h:'Last in tallest→shortest order = the shortest one'
        },
        // ── hard — four objects, indirect ordering, position reasoning ────────
        {
          t: 'If you order 4 ropes from longest to shortest, which position does the SHORTEST rope go in?',
          v: null,
          o: [{val:'1st',tag:'err_longer_shorter'},{val:'2nd',tag:'err_random'},{val:'3rd',tag:'err_random'},{val:'4th'}],
          a:3, e:'4th! When ordering longest to shortest, the shortest rope goes LAST — in 4th position.', d:'h', s:null, h:'Longest→shortest: the shortest one is LAST'
        },
        {
          t: 'Anna is taller than Bob. Bob is taller than Cal. Cal is taller than Dan. Who is the TALLEST?',
          v: null,
          o: [{val:'Anna'},{val:'Bob',tag:'err_random'},{val:'Cal',tag:'err_random'},{val:'Dan',tag:'err_longer_shorter'}],
          a:0, e:'Anna! Anna is taller than everyone — she is at the top of the list.', d:'h', s:null, h:'Anna is taller than Bob, who is taller than Cal, who is taller than Dan — so Anna is taller than all!'
        },
        {
          t: 'Anna is taller than Bob. Bob is taller than Cal. Cal is taller than Dan. Who is SECOND tallest?',
          v: null,
          o: [{val:'Anna',tag:'err_random'},{val:'Bob'},{val:'Cal',tag:'err_random'},{val:'Dan',tag:'err_random'}],
          a:1, e:'Bob! Anna is tallest, Bob is 2nd — he is taller than Cal and Dan.', d:'h', s:null, h:'Anna is 1st tallest — who comes right after Anna?'
        },
        {
          t: 'Yellow rope is shorter than orange rope. Orange rope is shorter than purple rope. Order shortest to longest. Which comes FIRST?',
          v: null,
          o: [{val:'yellow'},{val:'orange',tag:'err_random'},{val:'purple',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Yellow! Yellow is shorter than orange and purple — it is shortest, so it comes first.', d:'h', s:null, h:'First in shortest→longest = the shortest one'
        },
        {
          t: 'Yellow rope is shorter than orange rope. Orange rope is shorter than purple rope. Order shortest to longest. Which comes SECOND?',
          v: null,
          o: [{val:'yellow',tag:'err_random'},{val:'orange'},{val:'purple',tag:'err_longer_shorter'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Orange! Order is: yellow (shortest), orange (middle), purple (longest) — orange is second.', d:'h', s:null, h:'Yellow is first, purple is last — which one goes in the middle?'
        },
        {
          t: 'In order from shortest to tallest: plant, shelf, table, wall. A new box is taller than the shelf but shorter than the table. Where does the box go?',
          v: null,
          o: [{val:'between plant and shelf',tag:'err_random'},{val:'between shelf and table'},{val:'between table and wall',tag:'err_random'},{val:'after wall',tag:'err_random'}],
          a:1, e:'Between shelf and table! The box is taller than the shelf but shorter than the table.', d:'h', s:null, h:'Taller than shelf but shorter than table — where does that fit?'
        },
        {
          t: 'Five friends in height order from tallest (1st) to shortest (5th). Friend C is 3rd. Is Friend C taller than Friend D?',
          v: null,
          o: [{val:'yes — 3rd is taller than 4th'},{val:'no — 3rd is shorter than 4th',tag:'err_longer_shorter'},{val:'they are the same height',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:0, e:'Yes! In tallest→shortest order, 3rd is taller than 4th — closer to the top means taller.', d:'h', s:null, h:'In tallest→shortest order, does a smaller number position mean taller or shorter?'
        },
        {
          t: 'Three containers: Bucket A holds the most, Bucket C holds the least, Bucket B is in the middle. Order least to most. Which goes in the MIDDLE?',
          v: null,
          o: [{val:'Bucket A',tag:'err_random'},{val:'Bucket B'},{val:'Bucket C',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
          a:1, e:'Bucket B! It holds more than C but less than A — it is in the middle.', d:'h', s:null, h:'Which bucket is between the most and the least?'
        }
      ]
    },

    // ── Lesson 4: Measurable Attributes — K.7A ──────────────────────────────
    {
      points: [
        'LENGTH is how long or tall something is — measure it by lining objects up',
        'WEIGHT is how heavy something is — compare by picking objects up or using a balance scale',
        'CAPACITY is how much something holds — compare by filling with water or sand'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Name the Attribute',
          p: 'You want to find out which pencil is longer. What attribute are you comparing?',
          v: null,
          s: 'Longer and shorter describe LENGTH — you are comparing the length of the pencils!',
          a: 'Length ✅'
        },
        {
          c: '#1976D2',
          tag: 'Right Tool, Right Attribute',
          p: 'You put two apples on a balance scale. What attribute are you comparing?',
          v: null,
          s: 'A balance scale compares WEIGHT — you are finding out which apple is heavier or lighter!',
          a: 'Weight ✅'
        },
        {
          c: '#0D47A1',
          tag: 'How to Compare Capacity',
          p: 'You fill a jar with water, then pour it into a bottle. The water overflows. What does that tell you?',
          v: null,
          s: 'If water overflows, the bottle holds LESS than the jar — so the jar has a greater CAPACITY!',
          a: 'The jar holds more ✅'
        }
      ],
      practice: [
        {q:'You compare two scarves by stretching them next to each other. What attribute are you comparing?', a:'Length', h:'Stretching next to each other tells you how long each one is', e:'Length! You are finding out which scarf is longer or shorter ✅'},
        {q:'Which attribute tells you how heavy something is?', a:'Weight', h:'This attribute uses words like heavier and lighter', e:'Weight! Heavier and lighter describe weight ✅'},
        {q:'You fill two containers with water to compare them. What attribute are you comparing?', a:'Capacity', h:'Filling with water to compare = capacity', e:'Capacity! Filling with water shows which container holds more or less ✅'}
      ],
      qBank: [
        // ── easy — identify the attribute ─────────────────────────────────────
        {
          t: 'You want to find out which book is heavier. What attribute do you compare?',
          v: null,
          o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Weight! Heavier and lighter describe weight.', d:'e', s:null, h:'Heavier and lighter are words that describe which attribute?'
        },
        {
          t: 'You want to find out which pencil is longer. What attribute do you compare?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:1, e:'Length! Longer and shorter describe length.', d:'e', s:null, h:'Longer and shorter are words that describe which attribute?'
        },
        {
          t: 'You want to find out which jar holds more juice. What attribute do you compare?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'color',tag:'err_random'}],
          a:2, e:'Capacity! Holds more and holds less describe capacity.', d:'e', s:null, h:'Holds more and holds less are words that describe which attribute?'
        },
        {
          t: 'A ruler is used to measure ___?',
          v: null,
          o: [{val:'length'},{val:'weight',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'temperature',tag:'err_random'}],
          a:0, e:'Length! A ruler measures how long or tall something is.', d:'e', s:null, h:'A ruler shows you how long things are — which attribute is that?'
        },
        {
          t: 'A balance scale is used to compare ___?',
          v: null,
          o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'temperature',tag:'err_random'}],
          a:0, e:'Weight! A balance scale tips toward the heavier side.', d:'e', s:null, h:'A balance scale tips toward the heavier object — which attribute?'
        },
        {
          t: 'Which attribute tells you how LONG something is?',
          v: null,
          o: [{val:'length'},{val:'weight',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Length! Long and short describe length.', d:'e', s:null, h:'Long and short are words for which attribute?'
        },
        {
          t: 'Which attribute tells you how HEAVY something is?',
          v: null,
          o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Weight! Heavy and light describe weight.', d:'e', s:null, h:'Heavy and light are words for which attribute?'
        },
        {
          t: 'Which attribute tells you how MUCH something holds?',
          v: null,
          o: [{val:'capacity'},{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Capacity! Holds more and holds less describe capacity.', d:'e', s:null, h:'Holds more and holds less are words for which attribute?'
        },
        {
          t: 'You place two straws side by side to compare them. What are you comparing?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:1, e:'Length! Placing objects side by side compares their length.', d:'e', s:null, h:'Side by side — which attribute tells you which reaches farther?'
        },
        {
          t: 'You put two toy cars on a balance scale. What attribute are you comparing?',
          v: null,
          o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Weight! A balance scale compares weight.', d:'e', s:null, h:'A balance scale compares which attribute?'
        },
        // ── medium — choosing right method, applying attributes ───────────────
        {
          t: 'You want to know if a bottle or a can holds more. You compare their ___?',
          v: null,
          o: [{val:'capacity'},{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Capacity! Holds more and holds less describe capacity.', d:'m', s:null, h:'Holds more vs holds less — which attribute is that?'
        },
        {
          t: 'You compare two backpacks by picking them up. What attribute are you comparing?',
          v: null,
          o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Weight! Picking something up tells you how heavy it is.', d:'m', s:null, h:'Picking things up to compare — which attribute does that reveal?'
        },
        {
          t: 'You compare two scarves by stretching them next to each other. What attribute are you comparing?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:1, e:'Length! Stretching next to each other shows which scarf goes farther — that is length.', d:'m', s:null, h:'Stretching side by side to see which goes farther — which attribute?'
        },
        {
          t: 'Two towers of blocks — you compare which is taller. You are comparing their ___?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'height (length)'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:1, e:'Height (length)! Taller and shorter describe height, which is a type of length.', d:'m', s:null, h:'Taller and shorter — which attribute do those words describe?'
        },
        {
          t: 'A swimming pool and a bathtub — you compare which holds more water. This is a comparison of ___?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'color',tag:'err_random'}],
          a:2, e:'Capacity! Which holds more water describes capacity.', d:'m', s:null, h:'Holds more water — which attribute is that?'
        },
        {
          t: 'Two bags of sand — you pick them up to compare. You are comparing their ___?',
          v: null,
          o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:0, e:'Weight! Picking things up to compare tells you which is heavier.', d:'m', s:null, h:'Picking up to compare — heavier or lighter — which attribute?'
        },
        {
          t: 'You want to know if two sticks are the same length. What is the best way?',
          v: null,
          o: [{val:'place them side by side, lining up one end'},{val:'put them on a balance scale',tag:'err_random'},{val:'fill them with water',tag:'err_random'},{val:'weigh them',tag:'err_random'}],
          a:0, e:'Place them side by side! Lining them up at one end lets you see which goes farther.', d:'m', s:null, h:'To compare length, you need to see which object reaches farther'
        },
        {
          t: 'A fish tank and a bowl — you fill them with water to compare. You are comparing ___?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'color',tag:'err_random'}],
          a:2, e:'Capacity! Filling with water to see which holds more is comparing capacity.', d:'m', s:null, h:'Filling to compare holds more/holds less — which attribute?'
        },
        {
          t: 'You compare two objects by picking them up in each hand. You CANNOT compare their ___?',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length'},{val:'heaviness',tag:'err_random'},{val:'how heavy they are',tag:'err_random'}],
          a:1, e:'Length! Picking things up tells you about weight — not how long they are.', d:'m', s:null, h:'Holding something in your hand tells you about weight, not ___?'
        },
        {
          t: 'Comparing length uses the words longer and shorter. Comparing weight uses the words ___?',
          v: null,
          o: [{val:'taller and shorter',tag:'err_random'},{val:'more and less',tag:'err_random'},{val:'heavier and lighter'},{val:'longer and wider',tag:'err_random'}],
          a:2, e:'Heavier and lighter! Those words describe weight.', d:'m', s:null, h:'Which pair of words describes how heavy or light things are?'
        },
        // ── hard — applying attributes, multi-attribute, pouring reasoning ────
        {
          t: 'Two rocks look the same size but one is much heavier. Which attribute is DIFFERENT between them?',
          v: null,
          o: [{val:'length',tag:'err_random'},{val:'weight'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
          a:1, e:'Weight! They look the same size (length), but their weight is different.', d:'h', s:null, h:'Same size means same length — but which attribute can still be different?'
        },
        {
          t: 'You pour water from Container A into Container B. Water overflows. What does this tell you?',
          v: null,
          o: [{val:'Container A holds less',tag:'err_random'},{val:'Container B holds less'},{val:'they hold the same',tag:'err_random'},{val:'Container A is heavier',tag:'err_random'}],
          a:1, e:'Container B holds less! If water overflows when poured into B, B cannot hold as much as A.', d:'h', s:null, h:'If water overflows, does the new container hold MORE or LESS than what you poured?'
        },
        {
          t: 'A can and a bottle hold the exact same amount of juice. Their ___ is the same.',
          v: null,
          o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'color',tag:'err_random'}],
          a:2, e:'Capacity! Same amount = same capacity.', d:'h', s:null, h:'Hold the same amount — which attribute is that?'
        },
        {
          t: 'Mia wants to know if her ribbon is long enough to tie around a gift box. She should compare the ___?',
          v: null,
          o: [{val:'weight of the ribbon',tag:'err_random'},{val:'length of the ribbon vs. distance around the box'},{val:'capacity of the box',tag:'err_random'},{val:'color of the ribbon',tag:'err_random'}],
          a:1, e:'Length! She needs to check if the ribbon is long enough — that is a length comparison.', d:'h', s:null, h:'Is this about how long the ribbon is, or how heavy it is?'
        },
        {
          t: 'You want to compare which of two cups holds more. You fill one cup and pour it into the other. The best result that tells you they hold the SAME is ___?',
          v: null,
          o: [{val:'water overflows',tag:'err_random'},{val:'water exactly fills the second cup'},{val:'the second cup is still half empty',tag:'err_random'},{val:'you cannot tell',tag:'err_random'}],
          a:1, e:'Water exactly fills the second cup! If it fills exactly, both cups hold the same amount.', d:'h', s:null, h:'If both hold the same, what happens when you pour one into the other?'
        },
        {
          t: 'A suitcase and a pillow are the same size. The suitcase is heavier. What does this show?',
          v: null,
          o: [{val:'same size means same weight',tag:'err_random'},{val:'length and weight are different attributes'},{val:'bigger things are always heavier',tag:'err_random'},{val:'capacity is the same',tag:'err_random'}],
          a:1, e:'Length and weight are different attributes! Two things can be the same size but have very different weights.', d:'h', s:null, h:'Same size but different weight — what does that tell you about length and weight?'
        },
        {
          t: 'You want to find out which of three ropes is longest. What is the best strategy?',
          v: null,
          o: [{val:'pick them up and feel which is heaviest',tag:'err_random'},{val:'fill them with water',tag:'err_random'},{val:'place them all side by side lined up at one end'},{val:'put them on a balance scale',tag:'err_random'}],
          a:2, e:'Place them side by side! Lining up one end lets you see which rope reaches the farthest.', d:'h', s:null, h:'To compare length, you look at which object reaches ___?'
        },
        {
          t: 'To compare the capacity of two buckets, the best strategy is ___?',
          v: null,
          o: [{val:'place them side by side',tag:'err_random'},{val:'pick them up to feel the weight',tag:'err_random'},{val:'fill one with water then pour it into the other'},{val:'put them on a ruler',tag:'err_random'}],
          a:2, e:'Fill and pour! Pouring from one to the other shows which holds more or less.', d:'h', s:null, h:'To compare capacity, fill one and see if it fits in the other'
        }
      ]
    }

  ],

  testBank: [
    // ── Length & Height (K.7B) ────────────────────────────────────────────────
    {
      t: 'Which is longer?',
      v: {type:'comparison',config:{left:{label:'✏️ pencil',barLen:7,color:'#f59e0b'},right:{label:'🖍️ crayon',barLen:4,color:'#ec4899'}}},
      o: [{val:'pencil'},{val:'crayon',tag:'err_longer_shorter'},{val:'same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Pencil! The pencil bar is longer.', d:'e', s:null, h:'Which bar goes farther?'
    },
    {
      t: 'A giraffe is taller than a horse. Which is SHORTER?',
      v: null,
      o: [{val:'giraffe',tag:'err_longer_shorter'},{val:'horse'},{val:'they are the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Horse! The giraffe is taller, so the horse is shorter.', d:'e', s:null, h:'If A is taller, the other must be ___?'
    },
    {
      t: 'Which is shorter — a worm or a ruler?',
      v: null,
      o: [{val:'worm'},{val:'ruler',tag:'err_longer_shorter'},{val:'they are the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Worm! A worm is tiny — much shorter than a ruler.', d:'e', s:null, h:'Which one is tiny and wiggly?'
    },
    {
      t: 'A is longer than B. B is longer than C. Which is LONGEST?',
      v: null,
      o: [{val:'A'},{val:'B',tag:'err_random'},{val:'C',tag:'err_longer_shorter'},{val:'they are all the same',tag:'err_random'}],
      a:0, e:'A! A is longer than B and B is longer than C — A is the longest.', d:'e', s:null, h:'A is longer than both B and C'
    },
    {
      t: 'Two ribbons side by side. The green ribbon sticks out farther. Which is LONGER?',
      v: null,
      o: [{val:'green ribbon'},{val:'red ribbon',tag:'err_longer_shorter'},{val:'they are the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Green ribbon! Sticks out farther = longer.', d:'e', s:null, h:'The ribbon that sticks out farther is ___?'
    },
    {
      t: 'Pat is taller than Sam. Sam is taller than Lee. Who is SHORTEST?',
      v: null,
      o: [{val:'Pat',tag:'err_longer_shorter'},{val:'Sam',tag:'err_random'},{val:'Lee'},{val:'they are all the same',tag:'err_random'}],
      a:2, e:'Lee! Lee is shorter than Sam, and Sam is shorter than Pat.', d:'m', s:null, h:'Who is shorter than everyone else?'
    },
    {
      t: 'Rope X is shorter than Rope Z. Rope Z is shorter than Rope Y. Which is LONGEST?',
      v: null,
      o: [{val:'Rope X',tag:'err_longer_shorter'},{val:'Rope Y'},{val:'Rope Z',tag:'err_random'},{val:'they are the same',tag:'err_random'}],
      a:1, e:'Rope Y! Rope Y is longer than Z, and Z is longer than X — Y is longest.', d:'m', s:null, h:'Which rope is longer than all the others?'
    },
    {
      t: 'Rope X is shorter than Rope Z. Rope Z is shorter than Rope Y. Which is SHORTEST?',
      v: null,
      o: [{val:'Rope X'},{val:'Rope Y',tag:'err_longer_shorter'},{val:'Rope Z',tag:'err_random'},{val:'they are the same',tag:'err_random'}],
      a:0, e:'Rope X! Rope X is shorter than Z, and Z is shorter than Y — X is shortest.', d:'m', s:null, h:'Which rope is shorter than all the others?'
    },
    {
      t: 'If A is shorter than B, and B is shorter than C, which is LONGEST?',
      v: null,
      o: [{val:'A',tag:'err_longer_shorter'},{val:'B',tag:'err_random'},{val:'C'},{val:'they are all the same',tag:'err_random'}],
      a:2, e:'C! C is longer than B, and B is longer than A — C is the longest.', d:'m', s:null, h:'Who is longer than everyone else?'
    },
    {
      t: 'A sunflower keeps growing taller every day. Is it now taller or shorter than it was last week?',
      v: null,
      o: [{val:'taller'},{val:'shorter',tag:'err_longer_shorter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Taller! Growing means getting taller — not shorter.', d:'m', s:null, h:'If something grows, does it get taller or shorter?'
    },
    {
      t: 'Rod 1 is longer than Rod 2. Rod 2 equals Rod 3 in length. Is Rod 1 longer or shorter than Rod 3?',
      v: null,
      o: [{val:'longer'},{val:'shorter',tag:'err_longer_shorter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Longer! Rod 2 = Rod 3, and Rod 1 is longer than Rod 2 — so Rod 1 is longer than Rod 3 too.', d:'h', s:null, h:'Rod 1 > Rod 2 = Rod 3 — what does that mean for Rod 1 vs Rod 3?'
    },
    {
      t: 'Five friends tallest to shortest: 1st, 2nd, 3rd, 4th, 5th. Friend B is 2nd. Is B taller or shorter than Friend D (4th)?',
      v: null,
      o: [{val:'taller'},{val:'shorter',tag:'err_longer_shorter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Taller! In tallest→shortest order, 2nd is taller than 4th.', d:'h', s:null, h:'In tallest→shortest, does a smaller number mean taller?'
    },
    // ── Weight (K.7B) ─────────────────────────────────────────────────────────
    {
      t: 'Which is heavier — a bowling ball or a feather?',
      v: null,
      o: [{val:'bowling ball'},{val:'feather',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Bowling ball! It is very heavy — a feather floats in the air.', d:'e', s:null, h:'Which one would you need two hands to carry?'
    },
    {
      t: 'Which is lighter — a pillow or a brick?',
      v: null,
      o: [{val:'pillow'},{val:'brick',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Pillow! A pillow is soft and light — a brick is heavy.', d:'e', s:null, h:'Which one is soft, fluffy, and easy to carry?'
    },
    {
      t: 'A truck is heavier than a car. A car is heavier than a bicycle. Which is LIGHTEST?',
      v: null,
      o: [{val:'truck',tag:'err_heavier_lighter'},{val:'car',tag:'err_random'},{val:'bicycle'},{val:'they all weigh the same',tag:'err_random'}],
      a:2, e:'Bicycle! It is lighter than a car, which is lighter than a truck.', d:'e', s:null, h:'Which is lighter than all the others?'
    },
    {
      t: 'On a balance scale, the left side goes DOWN. Which side has the HEAVIER object?',
      v: null,
      o: [{val:'left side'},{val:'right side',tag:'err_heavier_lighter'},{val:'both sides are equal',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Left side! The heavier side pushes the balance down.', d:'e', s:null, h:'The heavier side of a balance always goes ___?'
    },
    {
      t: 'A watermelon is heavier than a mango. A mango is heavier than a plum. Which is HEAVIEST?',
      v: null,
      o: [{val:'watermelon'},{val:'mango',tag:'err_random'},{val:'plum',tag:'err_heavier_lighter'},{val:'they all weigh the same',tag:'err_random'}],
      a:0, e:'Watermelon! It is heavier than mango, which is heavier than plum.', d:'m', s:null, h:'Which is heavier than all the others?'
    },
    {
      t: 'Box A weighs more than Box B. Box B weighs more than Box C. Which is LIGHTEST?',
      v: null,
      o: [{val:'Box A',tag:'err_heavier_lighter'},{val:'Box B',tag:'err_random'},{val:'Box C'},{val:'they all weigh the same',tag:'err_random'}],
      a:2, e:'Box C! It is lighter than B, which is lighter than A.', d:'m', s:null, h:'Which box is lighter than all the others?'
    },
    {
      t: 'An empty lunchbox is lighter than a full one. Which is HEAVIER?',
      v: null,
      o: [{val:'empty lunchbox',tag:'err_heavier_lighter'},{val:'full lunchbox'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Full lunchbox! Food adds weight — the full one is heavier.', d:'m', s:null, h:'Which one has food inside that adds weight?'
    },
    {
      t: 'Bag 1 has 5 rocks. Bag 2 has 1 rock. Which bag is LIGHTER?',
      v: null,
      o: [{val:'Bag 1 (5 rocks)',tag:'err_heavier_lighter'},{val:'Bag 2 (1 rock)'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Bag 2! Fewer rocks = less weight — Bag 2 is lighter.', d:'m', s:null, h:'Fewer rocks means less weight — which bag has fewer?'
    },
    {
      t: 'Apple A weighs more than Apple B. Apple B weighs the same as Apple C. Is Apple A heavier or lighter than Apple C?',
      v: null,
      o: [{val:'heavier'},{val:'lighter',tag:'err_heavier_lighter'},{val:'the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Heavier! Apple B = Apple C, and A is heavier than B — so A is heavier than C too.', d:'h', s:null, h:'A > B = C, so how does A compare to C?'
    },
    // ── Capacity (K.7B) ───────────────────────────────────────────────────────
    {
      t: 'Which holds more — a bathtub or a cup?',
      v: null,
      o: [{val:'bathtub'},{val:'cup',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Bathtub! It is enormous — it holds much more than a cup.', d:'e', s:null, h:'Which is much bigger on the inside?'
    },
    {
      t: 'Which holds less — a teacup or a swimming pool?',
      v: null,
      o: [{val:'teacup'},{val:'swimming pool',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Teacup! It only holds a small amount — much less than a pool.', d:'e', s:null, h:'Which one is tiny compared to the other?'
    },
    {
      t: 'Jug A is much bigger than Jug B. Which holds MORE?',
      v: null,
      o: [{val:'Jug A'},{val:'Jug B',tag:'err_random'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Jug A! A bigger container holds more.', d:'m', s:null, h:'Which jug is bigger on the inside?'
    },
    {
      t: 'You pour water from Container A into Container B and it overflows. Which holds LESS?',
      v: null,
      o: [{val:'Container A',tag:'err_random'},{val:'Container B'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Container B! Water overflowed because B cannot hold as much as A.', d:'m', s:null, h:'If water overflows, the new container holds LESS than what was poured'
    },
    {
      t: 'Three containers: a big bucket, a medium bowl, and a tiny cup. Which holds the MOST?',
      v: null,
      o: [{val:'big bucket'},{val:'medium bowl',tag:'err_random'},{val:'tiny cup',tag:'err_random'},{val:'they hold the same',tag:'err_random'}],
      a:0, e:'Big bucket! The biggest container holds the most.', d:'m', s:null, h:'Which container is biggest on the inside?'
    },
    // ── Ordering (K.7B) ───────────────────────────────────────────────────────
    {
      t: 'Three children: Kim is tallest, Jay is in the middle, Ava is shortest. Who is in the MIDDLE?',
      v: null,
      o: [{val:'Kim',tag:'err_random'},{val:'Jay'},{val:'Ava',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Jay! The problem says Jay is in the middle.', d:'e', s:null, h:'The problem names who is in the middle — which child?'
    },
    {
      t: 'Three sticks: D is shortest, E is longest, F is in the middle. Order from shortest to longest. Which is SECOND?',
      v: null,
      o: [{val:'D',tag:'err_random'},{val:'E',tag:'err_longer_shorter'},{val:'F'},{val:'cannot tell',tag:'err_random'}],
      a:2, e:'F! Order is: D (shortest), F (middle), E (longest) — F is second.', d:'m', s:null, h:'D is first, E is last — which stick goes in the middle?'
    },
    {
      t: 'Objects from lightest to heaviest: cotton ball, apple, rock. Which is HEAVIEST?',
      v: null,
      o: [{val:'cotton ball',tag:'err_heavier_lighter'},{val:'apple',tag:'err_random'},{val:'rock'},{val:'cannot tell',tag:'err_random'}],
      a:2, e:'Rock! It comes last in lightest→heaviest order — it is the heaviest.', d:'m', s:null, h:'Last in lightest→heaviest order is the ___?'
    },
    {
      t: 'Four pencils from longest to shortest: W, X, Y, Z. Which is the SHORTEST?',
      v: null,
      o: [{val:'W',tag:'err_longer_shorter'},{val:'X',tag:'err_random'},{val:'Y',tag:'err_random'},{val:'Z'}],
      a:3, e:'Z! Last in longest→shortest order = the shortest.', d:'m', s:null, h:'Last in longest→shortest order = the shortest one'
    },
    {
      t: 'Three buckets: P holds the least, Q holds the most, R holds the middle amount. Order holds-least to holds-most. Which is LAST?',
      v: null,
      o: [{val:'P',tag:'err_random'},{val:'Q'},{val:'R',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Q! Q holds the most — it comes LAST in least-to-most order.', d:'m', s:null, h:'Last in holds-least→holds-most = the one that holds the MOST'
    },
    // ── Attributes (K.7A) ─────────────────────────────────────────────────────
    {
      t: 'You line two scarves up end to end to compare. What attribute are you comparing?',
      v: null,
      o: [{val:'weight',tag:'err_random'},{val:'length'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
      a:1, e:'Length! Lining up end to end compares length.', d:'e', s:null, h:'End to end — which attribute tells you which reaches farther?'
    },
    {
      t: 'You fill two jars with water to compare which holds more. What attribute are you comparing?',
      v: null,
      o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'color',tag:'err_random'}],
      a:2, e:'Capacity! Filling with water to compare holds more/less describes capacity.', d:'e', s:null, h:'Holds more or less — which attribute is that?'
    },
    {
      t: 'You use a balance scale to find which toy is heavier. What attribute are you comparing?',
      v: null,
      o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
      a:0, e:'Weight! A balance scale compares weight.', d:'e', s:null, h:'A balance scale tips toward the heavier side — which attribute?'
    },
    {
      t: 'Two boxes look the same size. One is much heavier. Which attribute is DIFFERENT?',
      v: null,
      o: [{val:'weight'},{val:'length',tag:'err_random'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
      a:0, e:'Weight! Same size but different weight — weight is the attribute that differs.', d:'m', s:null, h:'Same size means same length. Which attribute can still be different?'
    },
    {
      t: 'Comparing "taller" and "shorter" is a comparison of ___?',
      v: null,
      o: [{val:'weight',tag:'err_random'},{val:'height (length)'},{val:'capacity',tag:'err_random'},{val:'color',tag:'err_random'}],
      a:1, e:'Height (length)! Taller and shorter describe height, which is a type of length.', d:'m', s:null, h:'Taller and shorter — do those words describe how long/tall or how heavy?'
    },
    {
      t: 'To compare which of two bags is heavier, the BEST strategy is ___?',
      v: null,
      o: [{val:'place them side by side',tag:'err_random'},{val:'fill them with water',tag:'err_random'},{val:'pick each one up'},{val:'look at their color',tag:'err_random'}],
      a:2, e:'Pick each one up! You can feel which is heavier when you lift them.', d:'m', s:null, h:'To compare weight, you need to feel how heavy each one is'
    },
    {
      t: 'You pour a full small cup into a large jug. The jug is still not full. The jug\'s ___ is greater than the cup\'s.',
      v: null,
      o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'color',tag:'err_random'}],
      a:2, e:'Capacity! The jug holds more — it has a greater capacity than the cup.', d:'h', s:null, h:'The jug holds more water — which attribute describes how much something holds?'
    },
    {
      t: 'Which attribute is described by "holds more" and "holds less"?',
      v: null,
      o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'height',tag:'err_random'}],
      a:2, e:'Capacity! Holds more/holds less describe how much a container can hold — that is capacity.', d:'h', s:null, h:'Holds more and holds less — what attribute is being measured?'
    },
    {
      t: 'A scientist compares two fish tanks by filling them and seeing how much water each holds. She is comparing their ___?',
      v: null,
      o: [{val:'weight',tag:'err_random'},{val:'length',tag:'err_random'},{val:'capacity'},{val:'height',tag:'err_random'}],
      a:2, e:'Capacity! Filling to compare how much water they hold measures capacity.', d:'h', s:null, h:'Filling to measure how much fits inside — which attribute is that?'
    },
    {
      t: 'Which is longer — a river or a swimming pool?',
      v: null,
      o: [{val:'river'},{val:'swimming pool',tag:'err_longer_shorter'},{val:'they are the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'River! A river stretches for miles — much longer than a swimming pool.', d:'e', s:null, h:'Which one stretches on and on for miles?'
    },
    {
      t: 'A finger is shorter than an arm. An arm is shorter than a leg. Which is LONGEST?',
      v: null,
      o: [{val:'finger',tag:'err_longer_shorter'},{val:'arm',tag:'err_random'},{val:'leg'},{val:'they are all the same',tag:'err_random'}],
      a:2, e:'Leg! A leg is longer than an arm, which is longer than a finger.', d:'m', s:null, h:'Which body part is longer than all the others?'
    },
    {
      t: 'Which is heavier — a car or a bicycle?',
      v: null,
      o: [{val:'car'},{val:'bicycle',tag:'err_heavier_lighter'},{val:'they weigh the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Car! A car weighs thousands of pounds — a bicycle is much lighter.', d:'e', s:null, h:'Which one would you need a huge crane to lift?'
    },
    {
      t: 'Three containers: a tiny cup, a big pitcher, and a medium bottle. Which holds the LEAST?',
      v: null,
      o: [{val:'tiny cup'},{val:'big pitcher',tag:'err_random'},{val:'medium bottle',tag:'err_random'},{val:'they hold the same',tag:'err_random'}],
      a:0, e:'Tiny cup! The smallest container holds the least.', d:'m', s:null, h:'Which container is smallest on the inside?'
    },
    {
      t: 'Four towers from shortest to tallest: A, B, C, D. Which tower is TALLEST?',
      v: null,
      o: [{val:'A',tag:'err_longer_shorter'},{val:'B',tag:'err_random'},{val:'C',tag:'err_random'},{val:'D'}],
      a:3, e:'D! Last in shortest→tallest order = the tallest one.', d:'m', s:null, h:'Last in shortest→tallest order = the tallest one'
    },
    {
      t: 'You compare two jars by pouring water into each one. The first jar is full but the second is not. Which holds MORE?',
      v: null,
      o: [{val:'first jar',tag:'err_random'},{val:'second jar'},{val:'they hold the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:1, e:'Second jar! It was not full — it can hold even more water than the first jar.', d:'h', s:null, h:'The jar that is NOT full still has room — which one holds more?'
    },
    {
      t: 'Sam is shorter than Robin. Robin is shorter than Morgan. Put them in order from TALLEST to SHORTEST.',
      v: null,
      o: [{val:'Morgan, Robin, Sam'},{val:'Sam, Robin, Morgan',tag:'err_longer_shorter'},{val:'Robin, Sam, Morgan',tag:'err_random'},{val:'Morgan, Sam, Robin',tag:'err_random'}],
      a:0, e:'Morgan, Robin, Sam! Morgan is tallest, then Robin, then Sam is shortest.', d:'h', s:null, h:'Morgan is tallest — who comes after Morgan in tallest→shortest order?'
    },
    {
      t: 'A thin rod and a thick rod are the same LENGTH. Are they the same or different?',
      v: null,
      o: [{val:'same length'},{val:'the thin one is longer',tag:'err_random'},{val:'the thick one is longer',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Same length! Thick or thin does not change how long they are — they reach the same spot.', d:'h', s:null, h:'Length is about how far they reach — not how thick they are'
    },
    {
      t: 'A marble weighs more than a cotton ball. A cotton ball weighs more than a feather. Which is LIGHTEST?',
      v: null,
      o: [{val:'marble',tag:'err_heavier_lighter'},{val:'cotton ball',tag:'err_random'},{val:'feather'},{val:'they all weigh the same',tag:'err_random'}],
      a:2, e:'Feather! It is lighter than cotton ball, which is lighter than the marble.', d:'m', s:null, h:'Which is lighter than all the others?'
    },
    {
      t: 'Two children: Nia is taller than all other students. Ko is shorter than all other students. Who is TALLEST?',
      v: null,
      o: [{val:'Nia'},{val:'Ko',tag:'err_longer_shorter'},{val:'they are the same',tag:'err_random'},{val:'cannot tell',tag:'err_random'}],
      a:0, e:'Nia! The problem says Nia is taller than all other students.', d:'e', s:null, h:'Re-read — who is taller than ALL other students?'
    }
  ]
});
