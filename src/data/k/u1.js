// Kindergarten Unit 1: Counting & Cardinality
// Lazy-loaded as /data/k/u1.js
// Calls _mergeKUnitData — available globally from shared_k.js in the app bundle.
_mergeKUnitData(0, {
  lessons: [

    // ── L1: Counting to 10 (ku1l1) ───────────────────────────────────────────
    {
      // ── Key Ideas (rendered as bullet list in Step 1) ──────────────────────
      points: [
        "Touch each object one time — count as you touch!",
        "The LAST number you say tells you how many there are",
        "Count in order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
      ],

      // ── Worked Examples (Step 2 — renderEx reads c,tag,p,v,s,a) ───────────
      // Using v (not vis): objectSet has no makeVis string handler.
      // renderEx checks ex.v first → _buildVisualHTML → drawObjectSet.
      examples: [
        {
          c: '#4CAF50',
          tag: 'Count the Apples',
          p: 'How many 🍎 are here?',
          v: {type:'objectSet', config:{count:6, emoji:'🍎', layout:'grid'}},
          s: 'Touch and count each apple:\n1 → 2 → 3 → 4 → 5 → 6',
          a: '6 apples ✅'
        },
        {
          c: '#2E7D32',
          tag: 'Count the Birds',
          p: 'How many 🐦 do you see?',
          v: {type:'objectSet', config:{count:4, emoji:'🐦', layout:'line'}},
          s: 'Count left to right:\n1 → 2 → 3 → 4',
          a: '4 birds ✅'
        },
        {
          c: '#388E3C',
          tag: 'Count the Frogs',
          p: 'How many 🐸 are jumping?',
          v: {type:'objectSet', config:{count:9, emoji:'🐸', layout:'grid'}},
          s: 'Go row by row:\n1, 2, 3, 4, 5 → 6, 7, 8, 9',
          a: '9 frogs ✅'
        }
      ],

      // ── Practice (stored for Grade 2 format parity; NOT rendered by the UI) ─
      // The rendered practice drills section samples from qBank below.
      practice: [
        {q:'Count: 🌸🌸🌸 — how many flowers?',          a:'3', h:'Point to each flower as you count!',   e:'Yes! 1, 2, 3 flowers! 🌟'},
        {q:'Count: ⭐⭐⭐⭐⭐ — how many stars?',          a:'5', h:'Touch each star: 1, 2, 3, 4, 5',       e:'5 stars — you\'re shining! ⭐'},
        {q:'Count: 🐸🐸🐸🐸🐸🐸🐸 — how many frogs?',    a:'7', h:'Count slowly, one frog at a time!',     e:'7 frogs! Incredible counting! 🐸'}
      ],

      // ── qBank — drives both practice drills (Step 3) and lesson quiz (Step 4)
      // Strict schema: 4 options, wrong answers tagged, correct untagged.
      qBank: [
        {
          t: 'How many 🌸 do you see?',
          v: {type:'objectSet', config:{count:3, emoji:'🌸', layout:'line'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_over_count'}],
          a:1, e:'Count: 1, 2, 3!', d:'e', s:null, h:'Count from left to right'
        },
        {
          t: 'How many 🐦 do you see?',
          v: {type:'objectSet', config:{count:5, emoji:'🐦', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5!', d:'e', s:null, h:'Touch each bird as you count'
        },
        {
          t: 'How many 🍎 do you see?',
          v: {type:'objectSet', config:{count:7, emoji:'🍎', layout:'grid'}},
          o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'Count carefully: 1, 2, 3, 4, 5, 6, 7!', d:'e', s:null, h:'Go row by row'
        },
        {
          t: 'How many 🐝 do you see?',
          v: {type:'objectSet', config:{count:2, emoji:'🐝', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}],
          a:1, e:'Just 2 bees! Count: 1, 2!', d:'e', s:null, h:'Count: 1, 2'
        },
        {
          t: 'How many 🐸 do you see?',
          v: {type:'objectSet', config:{count:9, emoji:'🐸', layout:'grid'}},
          o: [{val:'7',tag:'err_under_count'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6, 7, 8, 9!', d:'m', s:null, h:'There are more than 8!'
        },
        {
          t: 'How many 🦋 do you see?',
          v: {type:'objectSet', config:{count:1, emoji:'🦋', layout:'line'}},
          o: [{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_over_count'},{val:'4',tag:'err_over_count'}],
          a:0, e:'Just 1 butterfly!', d:'e', s:null, h:'Count: 1'
        },
        {
          t: 'How many ⭐ do you see?',
          v: {type:'objectSet', config:{count:6, emoji:'⭐', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'Count the stars: 1, 2, 3, 4, 5, 6!', d:'e', s:null, h:'Count in rows'
        },
        {
          t: 'How many 🐠 do you see?',
          v: {type:'objectSet', config:{count:4, emoji:'🐠', layout:'line'}},
          o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4!', d:'e', s:null, h:'Count left to right'
        },
        {
          t: 'How many 🐢 do you see?',
          v: {type:'objectSet', config:{count:8, emoji:'🐢', layout:'grid'}},
          o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6, 7, 8!', d:'m', s:null, h:'Go slowly — there are 8!'
        },
        {
          t: 'How many 🌟 do you see?',
          v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},
          o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'All the way to 10!', d:'m', s:null, h:'Count all the way to 10'
        },
        {
          t: 'How many 🌺 do you see?',
          v: {type:'objectSet', config:{count:5, emoji:'🌺', layout:'dice'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'5 flowers — like 5 on a die!', d:'e', s:null, h:'Count the flowers in the pattern'
        },
        {
          t: 'Which number comes after 6?',
          v: null,
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_over_count'}],
          a:2, e:'7 comes right after 6!', d:'e', s:null, h:'Count up: ...5, 6, ___'
        }
      ]
    },

    // ── L2: Quick Look — Subitizing (ku1l2) ──────────────────────────────────
    {
      points: [
        "Quick Look — see HOW MANY without counting one by one",
        "Small groups of 1, 2, or 3 you can see all at once",
        "Dot patterns on a die help your brain know numbers fast"
      ],

      examples: [
        {
          c: '#2196F3',
          tag: 'Quick Look — 3',
          p: 'Quick! How many dots without counting?',
          v: {type:'objectSet', config:{count:3, emoji:'●', layout:'dice'}},
          s: '3 dots — your brain can see 3 all at once!\nNo counting needed.',
          a: '3 ✅'
        },
        {
          c: '#1565C0',
          tag: 'Quick Look — 5',
          p: 'Flash! How many?',
          v: {type:'objectSet', config:{count:5, emoji:'●', layout:'dice'}},
          s: '5 dots — 4 corners plus 1 in the middle!\nYou know this pattern from a die.',
          a: '5 ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Quick Look — 2',
          p: 'Just look — how many?',
          v: {type:'objectSet', config:{count:2, emoji:'●', layout:'dice'}},
          s: '2 dots — one in each corner!\nYour brain sees 2 instantly.',
          a: '2 ✅'
        }
      ],

      practice: [
        {q:'Quick look — how many? ●●',     a:'2', h:'Don\'t count — just look!',         e:'Yes! 2! Your brain knew instantly! 🧠'},
        {q:'Quick look — how many? ●●●●',   a:'4', h:'See the pairs: 2 and 2 make 4',     e:'4! You\'re getting faster! 🚀'},
        {q:'Quick look — how many? ●',      a:'1', h:'Just one dot!',                      e:'1! Easy Quick Look! 👀'}
      ],

      qBank: [
        // Distractor tagging rule for Quick Look:
        //   adjacent values (±1) → err_off_by_one  (close miss, not a pattern failure)
        //   non-adjacent values  → err_subitize     (wrong pattern recognition)
        {
          t: 'Quick Look! How many dots?',
          v: {type:'objectSet', config:{count:1, emoji:'●', layout:'dice'}},
          o: [{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'},{val:'4',tag:'err_subitize'}],
          a:0, e:'Just 1 dot!', d:'e', s:null, h:'Look — just one dot'
        },
        {
          t: 'Quick Look! How many 🟡?',
          v: {type:'objectSet', config:{count:2, emoji:'🟡', layout:'dice'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
          a:1, e:'2 — one in each corner!', d:'e', s:null, h:'Look at the two corners'
        },
        {
          t: 'Quick Look! How many 🔴?',
          v: {type:'objectSet', config:{count:3, emoji:'🔴', layout:'dice'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_subitize'}],
          a:1, e:'3 — a diagonal line!', d:'e', s:null, h:'A line from corner to corner'
        },
        {
          t: 'Quick Look! How many 🟢?',
          v: {type:'objectSet', config:{count:4, emoji:'🟢', layout:'dice'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_subitize'}],
          a:1, e:'4 — one in each corner!', d:'e', s:null, h:'4 corners = 4'
        },
        {
          t: 'Quick Look! How many 🔵?',
          v: {type:'objectSet', config:{count:5, emoji:'🔵', layout:'dice'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'}],
          a:1, e:'5 — corners plus the middle!', d:'e', s:null, h:'4 corners plus 1 in the middle'
        },
        {
          t: 'Quick Look! How many 🟠?',
          v: {type:'objectSet', config:{count:6, emoji:'🟠', layout:'dice'}},
          o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 — two columns of 3!', d:'e', s:null, h:'3 on the left, 3 on the right'
        },
        {
          t: 'Quick Look! How many 🐝?',
          v: {type:'objectSet', config:{count:2, emoji:'🐝', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
          a:1, e:'2 bees — you can see them both!', d:'e', s:null, h:'Just look — how many?'
        },
        {
          t: 'Quick Look! How many 🌸?',
          v: {type:'objectSet', config:{count:3, emoji:'🌸', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_subitize'}],
          a:1, e:'3 flowers without counting!', d:'e', s:null, h:'Can you see all 3 at once?'
        },
        {
          t: 'Quick Look! How many ⭐?',
          v: {type:'objectSet', config:{count:4, emoji:'⭐', layout:'dice'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'2',tag:'err_subitize'}],
          a:1, e:'4 stars — one in each corner!', d:'e', s:null, h:'4 corners = 4 stars'
        },
        {
          t: 'Quick Look! How many 🍎?',
          v: {type:'objectSet', config:{count:1, emoji:'🍎', layout:'line'}},
          o: [{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'},{val:'4',tag:'err_subitize'}],
          a:0, e:'Just 1 apple!', d:'e', s:null, h:'Look — just one'
        }
      ]
    },

    // ── L3: Counting to 20 (ku1l3) ───────────────────────────────────────────
    {
      points: [
        "After 10 comes 11, 12, 13 … all the way to 20!",
        "Numbers 11–19 are TEN and some more (13 = ten and 3 more)",
        "Keep counting past 10 — you already know how!"
      ],

      examples: [
        {
          c: '#FF9800',
          tag: 'Count to 13',
          p: 'How many 🌟 are there?',
          v: {type:'objectSet', config:{count:13, emoji:'🌟', layout:'grid'}},
          s: 'Count past 10:\n…9 → 10 → 11 → 12 → 13',
          a: '13 stars ✅'
        },
        {
          c: '#E65100',
          tag: 'Count to 16',
          p: 'How many 🐠 do you see?',
          v: {type:'objectSet', config:{count:16, emoji:'🐠', layout:'grid'}},
          s: 'Keep going past 10:\n11, 12, 13, 14, 15, 16',
          a: '16 fish ✅'
        },
        {
          c: '#BF360C',
          tag: 'Count to 20',
          p: 'How many 🐢 are there?',
          v: {type:'objectSet', config:{count:20, emoji:'🐢', layout:'grid'}},
          s: 'Count all the way:\n…17, 18, 19, 20!',
          a: '20 turtles ✅'
        }
      ],

      practice: [
        {q:'What number comes after 10?',     a:'11', h:'Ten, then … 11!',              e:'11! The teen numbers start here! 🎉'},
        {q:'What number comes after 15?',     a:'16', h:'Count on: …14, 15, ___',       e:'16! You\'re counting to 20! 🔢'},
        {q:'13 is 10 and how many more?',     a:'3',  h:'10 + ___ = 13',               e:'3 more! Great number thinking! 🧠'}
      ],

      qBank: [
        {
          t: 'How many 🎈 do you see?',
          v: {type:'objectSet', config:{count:11, emoji:'🎈', layout:'grid'}},
          o: [{val:'9',tag:'err_under_count'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'Count past 10: 11!', d:'e', s:null, h:'Count all the way past 10'
        },
        {
          t: 'How many 🐙 do you see?',
          v: {type:'objectSet', config:{count:14, emoji:'🐙', layout:'grid'}},
          o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'Count: …11, 12, 13, 14!', d:'e', s:null, h:'Keep counting past 10'
        },
        {
          t: 'How many 🍓 do you see?',
          v: {type:'objectSet', config:{count:12, emoji:'🍓', layout:'grid'}},
          o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'12! Ten and two more!', d:'e', s:null, h:'How many past 10?'
        },
        {
          t: 'How many 🌞 do you see?',
          v: {type:'objectSet', config:{count:17, emoji:'🌞', layout:'grid'}},
          o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'17! Count carefully past 15!', d:'m', s:null, h:'More than 16!'
        },
        {
          t: 'How many 🦁 do you see?',
          v: {type:'objectSet', config:{count:15, emoji:'🦁', layout:'grid'}},
          o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
          a:2, e:'15! Ten and five more!', d:'e', s:null, h:'Count past 14'
        },
        {
          t: 'How many 🐬 do you see?',
          v: {type:'objectSet', config:{count:18, emoji:'🐬', layout:'grid'}},
          o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}],
          a:2, e:'18! Almost to 20!', d:'m', s:null, h:'Count past 17'
        },
        {
          t: 'How many 🐘 do you see?',
          v: {type:'objectSet', config:{count:20, emoji:'🐘', layout:'grid'}},
          o: [{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_off_by_one'}],
          a:2, e:'20! You counted all the way to 20!', d:'m', s:null, h:'All the way to 20!'
        },
        {
          t: 'What number comes after 11?',
          v: null,
          o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_over_count'}],
          a:2, e:'12 comes right after 11!', d:'e', s:null, h:'Count on from 11: 11, ___'
        },
        {
          t: '13 is 10 and how many more?',
          v: null,
          o: [{val:'1',tag:'err_teen'},{val:'2',tag:'err_teen'},{val:'3'},{val:'4',tag:'err_teen'}],
          a:2, e:'13 = 10 + 3 — ten and THREE more!', d:'m', s:null, h:'10 + ___ = 13'
        },
        {
          t: 'Which number is between 17 and 19?',
          v: null,
          o: [{val:'16',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'18 is between 17 and 19!', d:'m', s:null, h:'Count: 17, ___, 19'
        }
      ]
    }

  ],

  // ── Unit 1 Test Bank ──────────────────────────────────────────────────────
  // 15 questions mixing all three lesson topics.
  // Integration set — replace with full authored bank after render path is confirmed.
  testBank: [
    // L1 — Counting to 10
    {
      t: 'How many 🍎 do you see?',
      v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'grid'}},
      o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'Count: 1, 2, 3, 4, 5!', d:'e', s:null, h:'Touch each apple'
    },
    {
      t: 'How many 🐦 do you see?',
      v: {type:'objectSet', config:{count:8, emoji:'🐦', layout:'grid'}},
      o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'Count carefully: 8 birds!', d:'e', s:null, h:'Go row by row'
    },
    {
      t: 'Which number comes after 7?',
      v: null,
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_over_count'}],
      a:2, e:'8 comes after 7!', d:'e', s:null, h:'Count up from 7: 7, ___'
    },
    {
      t: 'How many 🌸 do you see?',
      v: {type:'objectSet', config:{count:3, emoji:'🌸', layout:'line'}},
      o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'Count: 1, 2, 3!', d:'e', s:null, h:'Count left to right'
    },
    {
      t: 'How many 🌟 do you see?',
      v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},
      o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'All the way to 10!', d:'m', s:null, h:'Count carefully to 10'
    },
    // L2 — Quick Look
    {
      t: 'Quick Look! How many dots?',
      v: {type:'objectSet', config:{count:2, emoji:'●', layout:'dice'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
      a:1, e:'2 dots!', d:'e', s:null, h:'Look without counting'
    },
    {
      t: 'Quick Look! How many 🌟?',
      v: {type:'objectSet', config:{count:4, emoji:'🌟', layout:'dice'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'2',tag:'err_subitize'}],
      a:1, e:'4 stars — one in each corner!', d:'e', s:null, h:'4 corners = 4 stars'
    },
    {
      t: 'Quick Look! How many 🌸?',
      v: {type:'objectSet', config:{count:6, emoji:'🌸', layout:'dice'}},
      o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 flowers — two columns of 3!', d:'e', s:null, h:'3 on each side'
    },
    {
      t: 'Quick Look! How many 🐝?',
      v: {type:'objectSet', config:{count:3, emoji:'🐝', layout:'dice'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_subitize'}],
      a:1, e:'3 bees — a diagonal line!', d:'e', s:null, h:'Look — a line of 3'
    },
    // L3 — Counting to 20
    {
      t: 'How many 🌺 do you see?',
      v: {type:'objectSet', config:{count:12, emoji:'🌺', layout:'grid'}},
      o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
      a:2, e:'12! Ten and two more!', d:'e', s:null, h:'Count past 10'
    },
    {
      t: 'How many ⭐ do you see?',
      v: {type:'objectSet', config:{count:15, emoji:'⭐', layout:'grid'}},
      o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
      a:2, e:'15! Ten and five more!', d:'e', s:null, h:'Keep counting past 10'
    },
    {
      t: 'What number comes after 13?',
      v: null,
      o: [{val:'12',tag:'err_off_by_one'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_over_count'}],
      a:2, e:'14 comes right after 13!', d:'e', s:null, h:'Count on from 13: 13, ___'
    },
    {
      t: 'How many 🐢 do you see?',
      v: {type:'objectSet', config:{count:18, emoji:'🐢', layout:'grid'}},
      o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}],
      a:2, e:'18! Almost to 20!', d:'m', s:null, h:'Count past 17'
    },
    {
      t: 'How many 🎈 do you see?',
      v: {type:'objectSet', config:{count:6, emoji:'🎈', layout:'grid'}},
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'Count the balloons: 6!', d:'e', s:null, h:'Count in rows'
    },
    {
      t: '15 is 10 and how many more?',
      v: null,
      o: [{val:'4',tag:'err_teen'},{val:'5'},{val:'6',tag:'err_teen'},{val:'7',tag:'err_teen'}],
      a:1, e:'15 = 10 + 5 — ten and FIVE more!', d:'m', s:null, h:'10 + ___ = 15'
    }
  ]
});
