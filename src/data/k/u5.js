// Kindergarten Unit 5: Counting, Cardinality & Problem Solving
// Calls _mergeKUnitData — available globally from shared_k.js in the app bundle.
_mergeKUnitData(4, {
  lessons: [

    // ── Lesson 1: Counting Strategies ───────────────────────────────────────
    {
      points: [
        'Touch each object and say a number — one touch, one number!',
        'Organize objects into rows or groups so you don\'t miss any',
        'Count forward: start at 1 and go up. Count backward: start at the big number and go down'
      ],
      examples: [
        {
          c: '#9C27B0',
          tag: 'Touch and Count',
          p: 'Count each 🐝 by touching it. How many are there?',
          v: {type:'objectSet', config:{count:14, emoji:'🐝', layout:'grid'}},
          s: 'Touch each bee: 1, 2, 3 … 14',
          a: '14 bees ✅'
        },
        {
          c: '#7B1FA2',
          tag: 'Count Forward',
          p: '16, 17, __ — what number comes next?',
          v: null,
          s: 'Count on one more from 17: 18',
          a: '18 ✅'
        },
        {
          c: '#6A1B9A',
          tag: 'Count Back',
          p: '13, 12, __ — what number comes next when counting back?',
          v: null,
          s: 'Count back one step from 12: 11',
          a: '11 ✅'
        }
      ],
      practice: [
        {q:'Count these 🐢 in rows of 5. How many in all?', a:'Use rows to keep track!', h:'Organize before you count', e:'Organizing helps you count without losing your place ✅'},
        {q:'12, 13, 14, __, 16 — what number is missing?', a:'15', h:'What comes after 14?', e:'15 comes after 14! ✅'},
        {q:'18, __, 16 — what number is missing?', a:'17', h:'Count back from 18', e:'17 comes between 18 and 16! ✅'}
      ],
      qBank: [
        // ── objectSet count — easy (counts 6–10) ────────────────────────────
        {
          t: 'How many 🌸 flowers are there?',
          v: {type:'objectSet', config:{count:6, emoji:'🌸', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 flowers!', d:'e', s:null, h:'Touch every flower as you count'
        },
        {
          t: 'Count the 🐛. How many?',
          v: {type:'objectSet', config:{count:8, emoji:'🐛', layout:'grid'}},
          o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'8 caterpillars!', d:'e', s:null, h:'Count every caterpillar'
        },
        {
          t: 'How many 🍄 mushrooms do you see?',
          v: {type:'objectSet', config:{count:10, emoji:'🍄', layout:'grid'}},
          o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'10 mushrooms!', d:'e', s:null, h:'Count row by row'
        },
        {
          t: 'How many 🐞 ladybugs?',
          v: {type:'objectSet', config:{count:7, emoji:'🐞', layout:'grid'}},
          o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'7 ladybugs!', d:'e', s:null, h:'Touch each ladybug'
        },
        {
          t: 'Count the 🐟 fish. How many?',
          v: {type:'objectSet', config:{count:9, emoji:'🐟', layout:'grid'}},
          o: [{val:'7',tag:'err_under_count'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'9 fish!', d:'e', s:null, h:'Touch each fish as you count'
        },
        // ── objectSet count — medium (counts 11–15) ──────────────────────────
        {
          t: 'How many 🌺 flowers do you see?',
          v: {type:'objectSet', config:{count:11, emoji:'🌺', layout:'grid'}},
          o: [{val:'9',tag:'err_under_count'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'11 flowers!', d:'m', s:null, h:'Count carefully past 10'
        },
        {
          t: 'Count the 🦎 lizards. How many?',
          v: {type:'objectSet', config:{count:13, emoji:'🦎', layout:'grid'}},
          o: [{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
          a:2, e:'13 lizards!', d:'m', s:null, h:'Touch each lizard'
        },
        {
          t: 'How many 🐠 are in the tank?',
          v: {type:'objectSet', config:{count:15, emoji:'🐠', layout:'grid'}},
          o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_over_count'}],
          a:2, e:'15 fish!', d:'m', s:null, h:'Count every fish'
        },
        {
          t: 'Count the 🍋 lemons. How many?',
          v: {type:'objectSet', config:{count:12, emoji:'🍋', layout:'grid'}},
          o: [{val:'10',tag:'err_under_count'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'12 lemons!', d:'m', s:null, h:'Count in organized rows'
        },
        {
          t: 'How many 🐢 turtles are here?',
          v: {type:'objectSet', config:{count:14, emoji:'🐢', layout:'grid'}},
          o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'14 turtles!', d:'m', s:null, h:'Touch each turtle carefully'
        },
        // ── objectSet count — harder (counts 16–20) ──────────────────────────
        {
          t: 'Count the 🌟 stars. How many?',
          v: {type:'objectSet', config:{count:16, emoji:'🌟', layout:'grid'}},
          o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'18',tag:'err_over_count'}],
          a:2, e:'16 stars!', d:'m', s:null, h:'Count row by row — don\'t skip any'
        },
        {
          t: 'How many 🦋 butterflies?',
          v: {type:'objectSet', config:{count:18, emoji:'🦋', layout:'grid'}},
          o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'20',tag:'err_over_count'}],
          a:2, e:'18 butterflies!', d:'m', s:null, h:'Count carefully to the last one'
        },
        {
          t: 'Count the ⭐ stars. How many?',
          v: {type:'objectSet', config:{count:20, emoji:'⭐', layout:'grid'}},
          o: [{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'22',tag:'err_over_count'}],
          a:2, e:'20 stars — all the way to 20!', d:'h', s:null, h:'Count every star to the very last one'
        },
        {
          t: 'How many 🐝 bees are here?',
          v: {type:'objectSet', config:{count:17, emoji:'🐝', layout:'grid'}},
          o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'19',tag:'err_over_count'}],
          a:2, e:'17 bees!', d:'h', s:null, h:'Don\'t stop early — count to the end'
        },
        {
          t: 'Count the 🍒 cherries carefully. How many?',
          v: {type:'objectSet', config:{count:19, emoji:'🍒', layout:'grid'}},
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'21',tag:'err_over_count'}],
          a:2, e:'19 cherries!', d:'h', s:null, h:'Touch and count every cherry'
        },
        // ── What comes after N? ──────────────────────────────────────────────
        {
          t: 'What number comes after 4?',
          v: null,
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'5 comes after 4!', d:'e', s:null, h:'Count on one from 4'
        },
        {
          t: 'What number comes after 7?',
          v: null,
          o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'8 comes after 7!', d:'e', s:null, h:'Say 7 … then the next number'
        },
        {
          t: '10, 11, __ — what comes next?',
          v: null,
          o: [{val:'10',tag:'err_under_count'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'12 comes after 11!', d:'e', s:null, h:'Count on from 11'
        },
        {
          t: 'What number comes after 13?',
          v: null,
          o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'14 comes after 13!', d:'e', s:null, h:'Count forward one step from 13'
        },
        {
          t: '15, 16, __ — what comes next?',
          v: null,
          o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'17 comes after 16!', d:'m', s:null, h:'Count on from 16'
        },
        {
          t: 'What number comes after 18?',
          v: null,
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'19 comes after 18!', d:'h', s:null, h:'Count forward one step from 18'
        },
        {
          t: '6, 7, 8, __ — what comes next?',
          v: null,
          o: [{val:'7',tag:'err_under_count'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'9 comes after 8!', d:'e', s:null, h:'Count on from 8'
        },
        // ── What comes before N? ─────────────────────────────────────────────
        {
          t: 'What number comes before 6?',
          v: null,
          o: [{val:'4',tag:'err_under_count'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'}],
          a:1, e:'5 comes before 6!', d:'e', s:null, h:'Count back one step from 6'
        },
        {
          t: 'What number comes before 9?',
          v: null,
          o: [{val:'7',tag:'err_under_count'},{val:'8'},{val:'9',tag:'err_off_by_one'},{val:'10',tag:'err_off_by_one'}],
          a:1, e:'8 comes before 9!', d:'e', s:null, h:'Say 9 and count back one'
        },
        {
          t: '__, 12, 13 — what number comes before 12?',
          v: null,
          o: [{val:'10',tag:'err_under_count'},{val:'11'},{val:'12',tag:'err_off_by_one'},{val:'13',tag:'err_off_by_one'}],
          a:1, e:'11 comes before 12!', d:'e', s:null, h:'Count back from 12'
        },
        {
          t: 'What number comes before 17?',
          v: null,
          o: [{val:'15',tag:'err_under_count'},{val:'16'},{val:'17',tag:'err_off_by_one'},{val:'18',tag:'err_off_by_one'}],
          a:1, e:'16 comes before 17!', d:'h', s:null, h:'Count back one step from 17'
        },
        {
          t: '__, 19, 20 — what number comes before 19?',
          v: null,
          o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}],
          a:2, e:'18 comes before 19!', d:'h', s:null, h:'Count back one from 19'
        },
        {
          t: 'What number comes before 11?',
          v: null,
          o: [{val:'9',tag:'err_under_count'},{val:'10'},{val:'11',tag:'err_off_by_one'},{val:'12',tag:'err_off_by_one'}],
          a:1, e:'10 comes before 11!', d:'e', s:null, h:'Count back from 11'
        },
        // ── Sequence gaps ────────────────────────────────────────────────────
        {
          t: '3, 4, __, 6 — what number is missing?',
          v: null,
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'5 goes between 4 and 6!', d:'e', s:null, h:'What comes after 4?'
        },
        {
          t: '9, __, 11 — what number is missing?',
          v: null,
          o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'10 goes between 9 and 11!', d:'e', s:null, h:'What comes after 9?'
        },
        {
          t: '14, 15, __, 17 — what number is missing?',
          v: null,
          o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'16 goes between 15 and 17!', d:'h', s:null, h:'Count forward from 15'
        },
        {
          t: '20, __, 18 — what number is missing when counting back?',
          v: null,
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'19 goes between 20 and 18!', d:'h', s:null, h:'Count back from 20'
        }
      ]
    },

    // ── Lesson 2: Quick Look — Subitize ─────────────────────────────────────
    {
      points: [
        'Subitize means SEE the amount right away — no counting needed!',
        'Patterns help: 3 dots in a triangle, 4 dots in a square, 5 in a die pattern',
        'Practice looking at small groups until you KNOW them instantly'
      ],
      examples: [
        {
          c: '#9C27B0',
          tag: 'Quick Look',
          p: 'Look at the dots below. How many do you see — without counting!',
          v: {type:'objectSet', config:{count:4, emoji:'●', layout:'grid'}},
          s: 'Four dots form a square pattern — that\'s 4!',
          a: '4 ✅ — four in a square'
        },
        {
          c: '#7B1FA2',
          tag: 'Dot Pattern',
          p: 'How many ⭐ do you see?',
          v: {type:'objectSet', config:{count:3, emoji:'⭐', layout:'grid'}},
          s: 'Three stars in a triangle shape — that\'s 3!',
          a: '3 ✅'
        },
        {
          c: '#6A1B9A',
          tag: 'Recognize Instantly',
          p: 'How many 🍎 are there? Try to see the total at once!',
          v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'grid'}},
          s: 'Five apples — like the five on a die!',
          a: '5 ✅'
        }
      ],
      practice: [
        {q:'Quick look — how many dots?', a:'See the pattern, don\'t count one by one', h:'Look at the whole group', e:'Practice seeing small amounts instantly ✅'},
        {q:'Flash 2 fingers — how many?', a:'2', h:'Two fingers = 2', e:'2! You can see it without counting ✅'},
        {q:'Quick look at 6 dots in two rows of 3. How many?', a:'6', h:'Two rows of 3: 3 + 3 = 6', e:'6! Two groups of 3 = 6 ✅'}
      ],
      qBank: [
        // ── Single group — count 1 ───────────────────────────────────────────
        {
          t: 'Quick look! How many 🔴 dots?',
          v: {type:'objectSet', config:{count:1, emoji:'🔴', layout:'grid'}},
          o: [{val:'1'},{val:'2',tag:'err_over_count'},{val:'3',tag:'err_over_count'},{val:'0',tag:'err_under_count'}],
          a:0, e:'Just 1 dot!', d:'e', s:null, h:'One dot — easy to see!'
        },
        {
          t: 'Quick look! How many 🌙 moons?',
          v: {type:'objectSet', config:{count:1, emoji:'🌙', layout:'grid'}},
          o: [{val:'1'},{val:'2',tag:'err_over_count'},{val:'0',tag:'err_under_count'},{val:'3',tag:'err_over_count'}],
          a:0, e:'Just 1 moon!', d:'e', s:null, h:'One — just one object'
        },
        // ── Single group — count 2 ───────────────────────────────────────────
        {
          t: 'Quick look! How many 🟡 dots?',
          v: {type:'objectSet', config:{count:2, emoji:'🟡', layout:'grid'}},
          o: [{val:'1',tag:'err_under_count'},{val:'2'},{val:'3',tag:'err_over_count'},{val:'4',tag:'err_over_count'}],
          a:1, e:'2 dots!', d:'e', s:null, h:'Two dots — a pair'
        },
        {
          t: 'Quick look! How many 🦋 butterflies?',
          v: {type:'objectSet', config:{count:2, emoji:'🦋', layout:'grid'}},
          o: [{val:'1',tag:'err_under_count'},{val:'2'},{val:'3',tag:'err_over_count'},{val:'4',tag:'err_over_count'}],
          a:1, e:'2 butterflies!', d:'e', s:null, h:'Two — easy to see!'
        },
        // ── Single group — count 3 ───────────────────────────────────────────
        {
          t: 'How many 🟢 dots? Look without counting!',
          v: {type:'objectSet', config:{count:3, emoji:'🟢', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_over_count'}],
          a:1, e:'3 dots in a triangle!', d:'e', s:null, h:'Three dots — triangle pattern'
        },
        {
          t: 'Quick look! How many 🐟 fish?',
          v: {type:'objectSet', config:{count:3, emoji:'🐟', layout:'grid'}},
          o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'3 fish!', d:'e', s:null, h:'Three — triangle pattern'
        },
        {
          t: 'Quick look! How many 🌸 flowers?',
          v: {type:'objectSet', config:{count:3, emoji:'🌸', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_over_count'}],
          a:1, e:'3 flowers!', d:'e', s:null, h:'Three in a row or triangle'
        },
        // ── Single group — count 4 ───────────────────────────────────────────
        {
          t: 'Quick look! How many 🔵 dots?',
          v: {type:'objectSet', config:{count:4, emoji:'🔵', layout:'grid'}},
          o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 dots in a square!', d:'e', s:null, h:'Four dots — square pattern'
        },
        {
          t: 'Quick look! How many 🐞 ladybugs?',
          v: {type:'objectSet', config:{count:4, emoji:'🐞', layout:'grid'}},
          o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_over_count'}],
          a:2, e:'4 ladybugs — square pattern!', d:'m', s:null, h:'Four in a square'
        },
        {
          t: 'Quick look! How many 🍎 apples?',
          v: {type:'objectSet', config:{count:4, emoji:'🍎', layout:'grid'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_over_count'}],
          a:1, e:'4 apples!', d:'e', s:null, h:'Four — like corners of a square'
        },
        // ── Single group — count 5 ───────────────────────────────────────────
        {
          t: 'How many 🌟 stars? Try not to count!',
          v: {type:'objectSet', config:{count:5, emoji:'🌟', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'5 stars — like a die face!', d:'e', s:null, h:'Five — like the middle of a dice'
        },
        {
          t: 'Quick look! How many 🍋 lemons?',
          v: {type:'objectSet', config:{count:5, emoji:'🍋', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'5 lemons!', d:'m', s:null, h:'Five — like the dice!'
        },
        {
          t: 'Quick look! How many 🐸 frogs?',
          v: {type:'objectSet', config:{count:5, emoji:'🐸', layout:'grid'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_over_count'}],
          a:1, e:'5 frogs!', d:'m', s:null, h:'Five — die pattern'
        },
        // ── Single group — count 6 ───────────────────────────────────────────
        {
          t: 'Quick look! How many 🍎 apples? (two rows)',
          v: {type:'objectSet', config:{count:6, emoji:'🍎', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 apples — two rows of 3!', d:'e', s:null, h:'Six — two rows of three'
        },
        {
          t: 'Quick look! How many 🐦 birds?',
          v: {type:'objectSet', config:{count:6, emoji:'🐦', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'8',tag:'err_over_count'}],
          a:2, e:'6 birds — two rows of 3!', d:'h', s:null, h:'Six in two rows'
        },
        {
          t: 'Quick look! How many 🌺 flowers?',
          v: {type:'objectSet', config:{count:6, emoji:'🌺', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 flowers!', d:'h', s:null, h:'Two rows of three = 6'
        },
        // ── Two groups combined (sums ≤ 6) ───────────────────────────────────
        {
          t: 'Quick look! 1 🌟 and 1 🌟. How many altogether?',
          v: {type:'objectSet', config:{count:2, emoji:'🌟', layout:'grid'}},
          o: [{val:'1',tag:'err_under_count'},{val:'2'},{val:'3',tag:'err_over_count'},{val:'4',tag:'err_over_count'}],
          a:1, e:'1 and 1 = 2!', d:'e', s:null, h:'One plus one equals two'
        },
        {
          t: 'Quick look! 2 🌟 and 1 🌟. How many altogether?',
          v: {type:'objectSet', config:{count:3, emoji:'🌟', layout:'grid'}},
          o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'2 and 1 more = 3!', d:'e', s:null, h:'See both groups together'
        },
        {
          t: 'Quick look! 2 🔵 and 2 🔵. How many in all?',
          v: {type:'objectSet', config:{count:4, emoji:'🔵', layout:'grid'}},
          o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'2 and 2 = 4!', d:'e', s:null, h:'Two groups of 2 = 4'
        },
        {
          t: 'Quick look! 1 🍎 and 3 🍎. How many altogether?',
          v: {type:'objectSet', config:{count:4, emoji:'🍎', layout:'grid'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'2',tag:'err_under_count'}],
          a:1, e:'1 and 3 = 4!', d:'e', s:null, h:'One plus three equals four'
        },
        {
          t: 'Quick look! 3 🍎 and 2 🍎. How many altogether?',
          v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'3 and 2 = 5!', d:'m', s:null, h:'See both groups at once'
        },
        {
          t: 'Quick look! 1 🌸 and 4 🌸. How many altogether?',
          v: {type:'objectSet', config:{count:5, emoji:'🌸', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'1 and 4 = 5!', d:'m', s:null, h:'One plus four equals five'
        },
        {
          t: 'Quick look! 3 🐸 and 3 🐸. How many in all?',
          v: {type:'objectSet', config:{count:6, emoji:'🐸', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'}],
          a:3, e:'3 and 3 = 6!', d:'h', s:null, h:'Two rows of 3 = 6'
        },
        {
          t: 'Quick look! 2 🐝 and 4 🐝. How many in all?',
          v: {type:'objectSet', config:{count:6, emoji:'🐝', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'2 and 4 = 6!', d:'h', s:null, h:'Two plus four equals six'
        },
        {
          t: 'Quick look! 5 ⭐ and 1 ⭐. How many in all?',
          v: {type:'objectSet', config:{count:6, emoji:'⭐', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'5 and 1 = 6!', d:'h', s:null, h:'Five plus one equals six'
        },
        {
          t: 'Quick look! 4 🌙 and 1 🌙. How many altogether?',
          v: {type:'objectSet', config:{count:5, emoji:'🌙', layout:'grid'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'4 and 1 = 5!', d:'h', s:null, h:'Four plus one equals five'
        }
      ]
    },

    // ── Lesson 3: Story Problems — Join & Separate ───────────────────────────
    {
      points: [
        'JOIN words: "and", "gave", "joined", "in all" → ADD the groups together',
        'SEPARATE words: "ate", "flew away", "left", "popped" → TAKE AWAY to find what is left',
        'Act it out: show both groups, then join them OR take some away'
      ],
      examples: [
        {
          c: '#9C27B0',
          tag: 'Join Story',
          p: '3 frogs are on a log. 4 more frogs jump on. How many frogs in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐸', rightCount:4, rightObj:'🐸', op:'compare'}},
          s: 'Join the groups: 3 + 4 = 7',
          a: '7 frogs ✅'
        },
        {
          c: '#7B1FA2',
          tag: 'Separate Story',
          p: '8 birds are on a branch. 3 fly away. How many birds are left?',
          v: {type:'objectSet', config:{count:8, emoji:'🐦', layout:'grid'}},
          s: 'Take away 3: 8 − 3 = 5',
          a: '5 birds ✅'
        },
        {
          c: '#6A1B9A',
          tag: 'Word Problem',
          p: 'Mia has 5 apples. She gets 2 more. How many apples does she have now?',
          v: null,
          s: 'She gets MORE — that means join! 5 + 2 = 7',
          a: '7 apples ✅'
        }
      ],
      practice: [
        {q:'2 dogs and 3 more dogs run in. How many dogs in all?', a:'5', h:'Join the groups: 2 + 3', e:'2 + 3 = 5 dogs! ✅'},
        {q:'6 balloons. 2 pop. How many are left?', a:'4', h:'Take away: 6 − 2', e:'6 − 2 = 4 balloons! ✅'},
        {q:'Tom has 4 stickers. He gives away 1. How many left?', a:'3', h:'"Gives away" = take away', e:'4 − 1 = 3 stickers! ✅'}
      ],
      qBank: [
        // ── Join stories ─────────────────────────────────────────────────────
        {
          t: '1 🐝 and 2 more 🐝 join. How many bees in all?',
          v: {type:'twoGroups', config:{leftCount:1, leftObj:'🐝', rightCount:2, rightObj:'🐝', op:'compare'}},
          o: [{val:'1',tag:'err_sub_instead'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'1 + 2 = 3 bees!', d:'e', s:null, h:'Join both groups together'
        },
        {
          t: '2 🐱 cats and 2 more 🐱 join. How many cats in all?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐱', rightCount:2, rightObj:'🐱', op:'compare'}},
          o: [{val:'0',tag:'err_sub_instead'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'2 + 2 = 4 cats!', d:'e', s:null, h:'Two groups of 2 join together'
        },
        {
          t: '3 🦊 foxes and 2 more 🦊 join. How many foxes in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🦊', rightCount:2, rightObj:'🦊', op:'compare'}},
          o: [{val:'1',tag:'err_sub_instead'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'3 + 2 = 5 foxes!', d:'e', s:null, h:'Count both groups together'
        },
        {
          t: 'There are 4 🌟 stars. 3 more appear. How many stars now?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🌟', rightCount:3, rightObj:'🌟', op:'compare'}},
          o: [{val:'1',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'4 + 3 = 7 stars!', d:'e', s:null, h:'Join both groups'
        },
        {
          t: 'Ana has 5 🍭 lollipops. Her mom gives her 2 more. How many now?',
          v: {type:'objectSet', config:{count:5, emoji:'🍭', layout:'grid'}},
          o: [{val:'3',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'5 + 2 = 7 lollipops!', d:'m', s:null, h:'"Gives more" means join!'
        },
        {
          t: '3 🐢 turtles and 4 more 🐢 crawl over. How many in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐢', rightCount:4, rightObj:'🐢', op:'compare'}},
          o: [{val:'1',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'3 + 4 = 7 turtles!', d:'m', s:null, h:'Add both groups together'
        },
        {
          t: 'There are 2 🐱 cats. 6 more come in. How many cats now?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐱', rightCount:6, rightObj:'🐱', op:'compare'}},
          o: [{val:'4',tag:'err_sub_instead'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'2 + 6 = 8 cats!', d:'m', s:null, h:'More cats join — add them!'
        },
        {
          t: '1 🐶 puppy and 8 more 🐶 run in. How many puppies in all?',
          v: {type:'twoGroups', config:{leftCount:1, leftObj:'🐶', rightCount:8, rightObj:'🐶', op:'compare'}},
          o: [{val:'7',tag:'err_sub_instead'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'1 + 8 = 9 puppies!', d:'m', s:null, h:'Join: 1 and 8 more'
        },
        {
          t: '4 🐠 fish and 6 more 🐠 swim in. How many fish in all?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐠', rightCount:6, rightObj:'🐠', op:'compare'}},
          o: [{val:'2',tag:'err_sub_instead'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'4 + 6 = 10 fish!', d:'m', s:null, h:'Join: 4 and 6 more'
        },
        {
          t: 'Lily has 3 🌸 flowers. She picks 5 more. How many flowers now?',
          v: {type:'objectSet', config:{count:3, emoji:'🌸', layout:'grid'}},
          o: [{val:'2',tag:'err_sub_instead'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'3 + 5 = 8 flowers!', d:'m', s:null, h:'"Picks more" = join!'
        },
        {
          t: '5 🐦 birds and 5 more 🐦 land. How many birds now?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐦', rightCount:5, rightObj:'🐦', op:'compare'}},
          o: [{val:'0',tag:'err_sub_instead'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'5 + 5 = 10 birds!', d:'m', s:null, h:'Two equal groups — join them!'
        },
        {
          t: 'There are 7 🎈 balloons. 2 more are added. How many now?',
          v: {type:'objectSet', config:{count:7, emoji:'🎈', layout:'grid'}},
          o: [{val:'5',tag:'err_sub_instead'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'7 + 2 = 9 balloons!', d:'m', s:null, h:'"More are added" = join!'
        },
        // ── Separate stories ─────────────────────────────────────────────────
        {
          t: '3 🍪 cookies on a plate. Tim eats 1. How many cookies are left?',
          v: {type:'objectSet', config:{count:3, emoji:'🍪', layout:'grid'}},
          o: [{val:'4',tag:'err_add_instead'},{val:'3',tag:'err_count_all'},{val:'2'},{val:'1',tag:'err_off_by_one'}],
          a:2, e:'3 − 1 = 2 cookies!', d:'e', s:null, h:'"Eats" = take away'
        },
        {
          t: '5 🍪 cookies. Tia eats 2. How many are left?',
          v: {type:'objectSet', config:{count:5, emoji:'🍪', layout:'grid'}},
          o: [{val:'7',tag:'err_add_instead'},{val:'5',tag:'err_count_all'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'5 − 2 = 3 cookies!', d:'e', s:null, h:'"Eats" = take away'
        },
        {
          t: '8 🎈 balloons. 3 pop. How many are left?',
          v: {type:'objectSet', config:{count:8, emoji:'🎈', layout:'grid'}},
          o: [{val:'11',tag:'err_add_instead'},{val:'8',tag:'err_count_all'},{val:'5'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'8 − 3 = 5 balloons!', d:'e', s:null, h:'"Pop" = take away'
        },
        {
          t: '7 🐦 birds on a branch. 4 fly away. How many birds are left?',
          v: {type:'objectSet', config:{count:7, emoji:'🐦', layout:'grid'}},
          o: [{val:'11',tag:'err_add_instead'},{val:'7',tag:'err_count_all'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'7 − 4 = 3 birds!', d:'m', s:null, h:'"Fly away" = take away'
        },
        {
          t: '6 🌸 flowers in a vase. 1 is removed. How many remain?',
          v: {type:'objectSet', config:{count:6, emoji:'🌸', layout:'grid'}},
          o: [{val:'7',tag:'err_add_instead'},{val:'6',tag:'err_count_all'},{val:'5'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'6 − 1 = 5 flowers!', d:'e', s:null, h:'"Removed" = take away'
        },
        {
          t: '10 🍬 candies in a bag. 3 are eaten. How many are left?',
          v: {type:'objectSet', config:{count:10, emoji:'🍬', layout:'grid'}},
          o: [{val:'13',tag:'err_add_instead'},{val:'10',tag:'err_count_all'},{val:'7'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'10 − 3 = 7 candies!', d:'h', s:null, h:'"Eaten" = subtract'
        },
        {
          t: '9 🐠 fish in a tank. 4 are moved away. How many are left?',
          v: {type:'objectSet', config:{count:9, emoji:'🐠', layout:'grid'}},
          o: [{val:'13',tag:'err_add_instead'},{val:'9',tag:'err_count_all'},{val:'5'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'9 − 4 = 5 fish!', d:'h', s:null, h:'"Moved away" = take away'
        },
        {
          t: '4 🐢 turtles on a rock. 2 slide off. How many are left?',
          v: {type:'objectSet', config:{count:4, emoji:'🐢', layout:'grid'}},
          o: [{val:'6',tag:'err_add_instead'},{val:'4',tag:'err_count_all'},{val:'2'},{val:'3',tag:'err_off_by_one'}],
          a:2, e:'4 − 2 = 2 turtles!', d:'h', s:null, h:'"Slide off" = take away'
        },
        {
          t: '10 🍓 strawberries. Eli eats 4. How many are left?',
          v: {type:'objectSet', config:{count:10, emoji:'🍓', layout:'grid'}},
          o: [{val:'14',tag:'err_add_instead'},{val:'10',tag:'err_count_all'},{val:'6'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'10 − 4 = 6 strawberries!', d:'h', s:null, h:'"Eats" = take away'
        },
        // ── Mixed stories (v:null) ───────────────────────────────────────────
        {
          t: '4 ducks are in a pond. 2 more swim in. How many ducks now?',
          v: null,
          o: [{val:'2',tag:'err_sub_instead'},{val:'6'},{val:'5',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'}],
          a:1, e:'"More swim in" means join! 4 + 2 = 6!', d:'e', s:null, h:'Did the group get bigger or smaller?'
        },
        {
          t: '8 grapes on a plate. Leo eats 5. How many are left?',
          v: null,
          o: [{val:'13',tag:'err_add_instead'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'}],
          a:1, e:'"Eats" = take away! 8 − 5 = 3!', d:'e', s:null, h:'Did the group get bigger or smaller?'
        },
        {
          t: '3 frogs and 4 frogs sit on a log. How many frogs in all?',
          v: null,
          o: [{val:'1',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'"In all" means join! 3 + 4 = 7!', d:'m', s:null, h:'"In all" is a joining word'
        },
        {
          t: '10 crayons in a box. 6 fall out. How many are left?',
          v: null,
          o: [{val:'16',tag:'err_add_instead'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'"Fall out" = take away! 10 − 6 = 4!', d:'m', s:null, h:'"Fall out" = go away'
        },
        {
          t: '2 dogs and 7 dogs run in the park. How many dogs in all?',
          v: null,
          o: [{val:'5',tag:'err_sub_instead'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'"In all" means join! 2 + 7 = 9!', d:'m', s:null, h:'"In all" means add'
        },
        {
          t: '7 apples on a tree. 2 fall down and roll away. How many are left on the tree?',
          v: null,
          o: [{val:'9',tag:'err_add_instead'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'"Roll away" = take away! 7 − 2 = 5!', d:'m', s:null, h:'"Roll away" = take away'
        },
        {
          t: '6 children on a slide. 3 more come to play. How many children now?',
          v: null,
          o: [{val:'3',tag:'err_sub_instead'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'"More come" = join! 6 + 3 = 9!', d:'m', s:null, h:'"More come" = groups get bigger'
        },
        {
          t: '9 crayons in a box. 5 break. How many unbroken crayons are left?',
          v: null,
          o: [{val:'14',tag:'err_add_instead'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'"Break" = take away! 9 − 5 = 4!', d:'h', s:null, h:'"Break" and go away = subtract'
        },
        {
          t: '1 cat and 9 more cats come to the yard. How many cats in all?',
          v: null,
          o: [{val:'8',tag:'err_sub_instead'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'"More come" = join! 1 + 9 = 10!', d:'h', s:null, h:'"More come" = add'
        },
        {
          t: '5 children on a playground. 4 more arrive. How many children now?',
          v: null,
          o: [{val:'1',tag:'err_sub_instead'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'"Arrive" = join! 5 + 4 = 9!', d:'h', s:null, h:'"Arrive" = more come = add'
        }
      ]
    },

    // ── Lesson 4: Explain Your Math ──────────────────────────────────────────
    {
      points: [
        'ADD when groups come TOGETHER — the total gets bigger',
        'SUBTRACT when something goes AWAY — the amount gets smaller',
        'You can use objects, draw a picture, or count to check your thinking!'
      ],
      examples: [
        {
          c: '#9C27B0',
          tag: 'Match Equation',
          p: 'Which story matches 4 + 3 = 7?',
          v: null,
          s: 'Addition means joining — look for a story where groups come together',
          a: '"4 children and 3 more join them. How many in all?" ✅'
        },
        {
          c: '#7B1FA2',
          tag: 'Choose Equation',
          p: 'Lily has 9 cookies. She eats 4. Which number sentence tells this story?',
          v: null,
          s: '"Eats" is a taking-away word — that means subtraction: 9 − 4',
          a: '9 − 4 = 5 ✅'
        },
        {
          c: '#6A1B9A',
          tag: 'Explain Thinking',
          p: 'Sam has 6 stickers. He gets 2 more. Should you add or subtract?',
          v: null,
          s: '"Gets more" means the number gets bigger — that is addition!',
          a: 'Add! 6 + 2 = 8 ✅'
        }
      ],
      practice: [
        {q:'Which story matches 5 − 3 = 2?', a:'"5 birds, 3 fly away. How many left?"', h:'Subtraction = something goes away', e:'"Fly away" is a take-away word — that\'s subtraction! ✅'},
        {q:'3 cats and 2 more come. Add or subtract?', a:'Add', h:'"More come" = join', e:'Groups joining = addition! 3 + 2 = 5 ✅'},
        {q:'There are 8 apples. 3 are eaten. Write the number sentence.', a:'8 − 3 = 5', h:'"Eaten" = take away', e:'8 − 3 = 5 apples left ✅'}
      ],
      qBank: [
        // ── Which equation matches the story? ────────────────────────────────
        {
          t: '5 children are playing. 3 more join them. Which number sentence matches?',
          v: null,
          o: [{val:'5 − 3 = 2',tag:'err_sub_instead'},{val:'5 + 3 = 8'},{val:'5 + 2 = 7',tag:'err_off_by_one'},{val:'8 − 3 = 5',tag:'err_sub_instead'}],
          a:1, e:'"More join" = add! 5 + 3 = 8 ✅', d:'e', s:null, h:'Join = addition'
        },
        {
          t: '10 fish in a tank. 4 swim out. Which number sentence matches?',
          v: null,
          o: [{val:'10 + 4 = 14',tag:'err_add_instead'},{val:'10 − 4 = 6'},{val:'10 − 6 = 4',tag:'err_off_by_one'},{val:'4 + 6 = 10',tag:'err_add_instead'}],
          a:1, e:'"Swim out" = take away! 10 − 4 = 6 ✅', d:'e', s:null, h:'"Swim out" = subtract'
        },
        {
          t: '2 apples and 4 more apples in a bowl. Which number sentence matches?',
          v: null,
          o: [{val:'4 − 2 = 2',tag:'err_sub_instead'},{val:'2 + 4 = 6'},{val:'2 + 5 = 7',tag:'err_off_by_one'},{val:'6 − 4 = 2',tag:'err_sub_instead'}],
          a:1, e:'"And more" = add! 2 + 4 = 6 ✅', d:'e', s:null, h:'Two groups joining = add'
        },
        {
          t: '7 birds on a wire. 3 fly away. Which number sentence matches?',
          v: null,
          o: [{val:'7 + 3 = 10',tag:'err_add_instead'},{val:'7 − 3 = 4'},{val:'7 − 2 = 5',tag:'err_off_by_one'},{val:'3 + 4 = 7',tag:'err_add_instead'}],
          a:1, e:'"Fly away" = subtract! 7 − 3 = 4 ✅', d:'m', s:null, h:'"Fly away" is a take-away word'
        },
        {
          t: '3 red balls and 5 blue balls. How many in all? Which matches?',
          v: null,
          o: [{val:'5 − 3 = 2',tag:'err_sub_instead'},{val:'3 + 5 = 8'},{val:'3 + 4 = 7',tag:'err_off_by_one'},{val:'8 − 5 = 3',tag:'err_sub_instead'}],
          a:1, e:'"In all" = add! 3 + 5 = 8 ✅', d:'m', s:null, h:'"In all" = join all groups'
        },
        {
          t: '8 pencils on a desk. 4 fall off. Which number sentence matches?',
          v: null,
          o: [{val:'8 + 4 = 12',tag:'err_add_instead'},{val:'8 − 4 = 4'},{val:'8 − 3 = 5',tag:'err_off_by_one'},{val:'4 + 4 = 8',tag:'err_add_instead'}],
          a:1, e:'"Fall off" = subtract! 8 − 4 = 4 ✅', d:'m', s:null, h:'"Fall off" = take away'
        },
        {
          t: '1 puppy and 6 more puppies arrive. Which number sentence matches?',
          v: null,
          o: [{val:'6 − 1 = 5',tag:'err_sub_instead'},{val:'1 + 6 = 7'},{val:'1 + 5 = 6',tag:'err_off_by_one'},{val:'7 − 6 = 1',tag:'err_sub_instead'}],
          a:1, e:'"Arrive" = join! 1 + 6 = 7 ✅', d:'m', s:null, h:'"Arrive" = more come = add'
        },
        {
          t: '9 crayons in a box. 3 break. Which number sentence matches?',
          v: null,
          o: [{val:'9 + 3 = 12',tag:'err_add_instead'},{val:'9 − 3 = 6'},{val:'9 − 2 = 7',tag:'err_off_by_one'},{val:'3 + 6 = 9',tag:'err_add_instead'}],
          a:1, e:'"Break" = take away! 9 − 3 = 6 ✅', d:'m', s:null, h:'"Break" = go away = subtract'
        },
        // ── Should you add or subtract? ──────────────────────────────────────
        {
          t: 'Rosa has 4 flowers. She picks 3 more. Should she add or subtract?',
          v: null,
          o: [{val:'Subtract — she has fewer',tag:'err_sub_instead'},{val:'Add — she has more flowers now'},{val:'It does not matter',tag:'err_sub_instead'},{val:'Subtract — she gave them away',tag:'err_sub_instead'}],
          a:1, e:'"Picks more" = more flowers! Add: 4 + 3 = 7 ✅', d:'e', s:null, h:'Did her amount get bigger or smaller?'
        },
        {
          t: 'Jake has 8 grapes. He eats 2. Should he add or subtract?',
          v: null,
          o: [{val:'Add — he has more grapes',tag:'err_add_instead'},{val:'Subtract — he has fewer grapes'},{val:'Add — eating makes more',tag:'err_add_instead'},{val:'It does not matter',tag:'err_add_instead'}],
          a:1, e:'"Eats" means less! Subtract: 8 − 2 = 6 ✅', d:'e', s:null, h:'Eating = fewer = subtract'
        },
        {
          t: 'There are 6 cats. 2 more come to the house. Should you add or subtract?',
          v: null,
          o: [{val:'Subtract — some left',tag:'err_sub_instead'},{val:'Add — more cats came'},{val:'Subtract — the total is 6',tag:'err_sub_instead'},{val:'It does not matter',tag:'err_sub_instead'}],
          a:1, e:'"More come" = add! 6 + 2 = 8 ✅', d:'m', s:null, h:'More animals came — group gets bigger'
        },
        {
          t: 'There are 9 balloons. 4 pop. Should you add or subtract?',
          v: null,
          o: [{val:'Add — more balloons',tag:'err_add_instead'},{val:'Subtract — balloons are gone'},{val:'Add — 9 + 4',tag:'err_add_instead'},{val:'It does not matter',tag:'err_add_instead'}],
          a:1, e:'"Pop" means gone! Subtract: 9 − 4 = 5 ✅', d:'m', s:null, h:'Popping = going away = subtract'
        },
        {
          t: 'Kai has 3 toy cars. His friend gives him 4 more. Should Kai add or subtract?',
          v: null,
          o: [{val:'Subtract — some went away',tag:'err_sub_instead'},{val:'Add — he received more cars'},{val:'Subtract — 4 − 3 = 1',tag:'err_sub_instead'},{val:'It does not matter',tag:'err_sub_instead'}],
          a:1, e:'"Gives more" = add! 3 + 4 = 7 ✅', d:'e', s:null, h:'Receiving = more = add'
        },
        {
          t: 'There are 10 birds. 6 fly away. Should you add or subtract?',
          v: null,
          o: [{val:'Add — more birds are here',tag:'err_add_instead'},{val:'Subtract — some flew away'},{val:'Add — 10 + 6',tag:'err_add_instead'},{val:'It does not matter',tag:'err_add_instead'}],
          a:1, e:'"Fly away" = gone! Subtract: 10 − 6 = 4 ✅', d:'m', s:null, h:'"Fly away" = leaving = subtract'
        },
        // ── Solve and match number sentence ──────────────────────────────────
        {
          t: 'Ben has 3 toy cars. He gets 2 more. Which number sentence and answer?',
          v: null,
          o: [{val:'3 − 2 = 1',tag:'err_sub_instead'},{val:'3 + 2 = 5'},{val:'3 + 3 = 6',tag:'err_off_by_one'},{val:'2 + 2 = 4',tag:'err_off_by_one'}],
          a:1, e:'Gets more = add! 3 + 2 = 5 ✅', d:'e', s:null, h:'Gets more = join'
        },
        {
          t: '6 crayons in a box. 3 break. Which number sentence and answer?',
          v: null,
          o: [{val:'6 + 3 = 9',tag:'err_add_instead'},{val:'6 − 3 = 3'},{val:'6 − 2 = 4',tag:'err_off_by_one'},{val:'3 + 3 = 6',tag:'err_add_instead'}],
          a:1, e:'Break = subtract! 6 − 3 = 3 ✅', d:'h', s:null, h:'"Break" = take away'
        },
        {
          t: '5 children on a playground. 4 more arrive. Which is correct?',
          v: null,
          o: [{val:'5 − 4 = 1',tag:'err_sub_instead'},{val:'5 + 3 = 8',tag:'err_off_by_one'},{val:'5 + 4 = 9'},{val:'4 + 3 = 7',tag:'err_off_by_one'}],
          a:2, e:'More arrive = join! 5 + 4 = 9 ✅', d:'h', s:null, h:'More arrive = groups joining'
        },
        {
          t: '8 🍓 on a plate. 3 are eaten. Which number sentence and answer?',
          v: null,
          o: [{val:'8 + 3 = 11',tag:'err_add_instead'},{val:'8 − 3 = 5'},{val:'8 − 4 = 4',tag:'err_off_by_one'},{val:'3 + 5 = 8',tag:'err_add_instead'}],
          a:1, e:'"Eaten" = subtract! 8 − 3 = 5 ✅', d:'h', s:null, h:'"Eaten" is a take-away word'
        },
        {
          t: '4 dogs in the park. 5 more come to play. Which number sentence and answer?',
          v: null,
          o: [{val:'4 − 5 = ?',tag:'err_sub_instead'},{val:'4 + 5 = 9'},{val:'4 + 4 = 8',tag:'err_off_by_one'},{val:'5 − 4 = 1',tag:'err_sub_instead'}],
          a:1, e:'More come = join! 4 + 5 = 9 ✅', d:'h', s:null, h:'More come to play = add'
        },
        {
          t: '10 🎈 at a party. 7 pop. Which number sentence and answer?',
          v: null,
          o: [{val:'10 + 7 = 17',tag:'err_add_instead'},{val:'10 − 7 = 3'},{val:'10 − 8 = 2',tag:'err_off_by_one'},{val:'7 + 3 = 10',tag:'err_add_instead'}],
          a:1, e:'"Pop" = gone! 10 − 7 = 3 ✅', d:'h', s:null, h:'"Pop" = take away'
        },
        // ── NEW L4 additions (d:'h') ─────────────────────────────────────────
        {
          t: 'Tom has 5 🎯 targets. He hits 4 of them. Which number sentence and answer is correct?',
          v: null,
          o: [{val:'5 − 4 = 1'},{val:'5 + 4 = 9',tag:'err_add_instead'},{val:'5 − 3 = 2',tag:'err_off_by_one'},{val:'4 − 1 = 3',tag:'err_off_by_one'}],
          a:0, e:'He hits some = subtract! 5 − 4 = 1 ✅', d:'h', s:null, h:'"Hits" = takes away = subtract'
        },
        {
          t: 'There are 6 🐔 hens. 3 chicks hatch. How many birds in all? Which matches?',
          v: null,
          o: [{val:'6 − 3 = 3',tag:'err_sub_instead'},{val:'6 + 3 = 9'},{val:'6 + 2 = 8',tag:'err_off_by_one'},{val:'9 − 6 = 3',tag:'err_sub_instead'}],
          a:1, e:'"Hatch" = more birds! 6 + 3 = 9 ✅', d:'h', s:null, h:'"In all" = join = add'
        },
        {
          t: 'Lucy picked 8 🌻 sunflowers. She gave 3 away. Which number sentence and answer?',
          v: null,
          o: [{val:'8 + 3 = 11',tag:'err_add_instead'},{val:'8 − 4 = 4',tag:'err_off_by_one'},{val:'8 − 3 = 5'},{val:'3 + 5 = 8',tag:'err_add_instead'}],
          a:2, e:'"Gave away" = subtract! 8 − 3 = 5 ✅', d:'h', s:null, h:'"Gave away" is a take-away word'
        },
        {
          t: 'Carlos had 2 🚀 rockets. He built 7 more. Which is correct?',
          v: null,
          o: [{val:'7 − 2 = 5',tag:'err_sub_instead'},{val:'2 + 6 = 8',tag:'err_off_by_one'},{val:'9 − 7 = 2',tag:'err_sub_instead'},{val:'2 + 7 = 9'}],
          a:3, e:'"Built more" = add! 2 + 7 = 9 ✅', d:'h', s:null, h:'"More" = join = add'
        },
        {
          t: 'Sam says 9 − 5 = 5. Is he right?',
          v: null,
          o: [{val:'No, 9 − 5 = 3',tag:'err_off_by_one'},{val:'No, 9 − 5 = 4'},{val:'Yes, that is correct',tag:'err_add_instead'},{val:'Yes, 9 − 4 = 5 too',tag:'err_add_instead'}],
          a:1, e:'Count back 5 from 9: 8,7,6,5,4 — the answer is 4, not 5!', d:'h', s:null, h:'Count back 5 steps from 9'
        },
        {
          t: '10 🎪 tents are set up. 4 are taken down. Which number sentence and answer?',
          v: null,
          o: [{val:'10 + 4 = 14',tag:'err_add_instead'},{val:'10 − 5 = 5',tag:'err_off_by_one'},{val:'10 − 4 = 6'},{val:'4 + 6 = 10',tag:'err_add_instead'}],
          a:2, e:'"Taken down" = subtract! 10 − 4 = 6 ✅', d:'h', s:null, h:'"Taken down" = go away = subtract'
        },
        {
          t: 'A pond has 3 🐊 crocodiles. 6 more arrive. Which number sentence?',
          v: null,
          o: [{val:'6 − 3 = 3',tag:'err_sub_instead'},{val:'3 + 5 = 8',tag:'err_off_by_one'},{val:'3 + 6 = 9'},{val:'9 − 6 = 3',tag:'err_sub_instead'}],
          a:2, e:'"Arrive" = join! 3 + 6 = 9 ✅', d:'h', s:null, h:'"Arrive" = more come = add'
        },
        {
          t: '7 kites are flying. 2 get tangled and fall down. Which is correct?',
          v: null,
          o: [{val:'7 + 2 = 9',tag:'err_add_instead'},{val:'7 − 3 = 4',tag:'err_off_by_one'},{val:'2 + 5 = 7',tag:'err_add_instead'},{val:'7 − 2 = 5'}],
          a:3, e:'"Fall down" = take away! 7 − 2 = 5 ✅', d:'h', s:null, h:'"Fall down" is a take-away word'
        }
      ]
    }
  ],

  testBank: [
    // ── L1: Counting Strategies ───────────────────────────────────────────────
    {
      t: 'Count the 🍒 cherries. How many?',
      v: {type:'objectSet', config:{count:13, emoji:'🍒', layout:'grid'}},
      o: [{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
      a:2, e:'13 cherries!', d:'m', s:null, h:'Touch each cherry as you count'
    },
    {
      t: 'What number comes after 16?',
      v: null,
      o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
      a:2, e:'17 comes after 16!', d:'e', s:null, h:'Count on one step from 16'
    },
    {
      t: '9, 10, __, 12 — what number is missing?',
      v: null,
      o: [{val:'9',tag:'err_under_count'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'13',tag:'err_off_by_one'}],
      a:2, e:'11 goes between 10 and 12!', d:'m', s:null, h:'Count from 10'
    },
    {
      t: 'What number comes before 15?',
      v: null,
      o: [{val:'13',tag:'err_under_count'},{val:'14'},{val:'15',tag:'err_off_by_one'},{val:'16',tag:'err_off_by_one'}],
      a:1, e:'14 comes before 15!', d:'e', s:null, h:'Count back one step from 15'
    },
    {
      t: 'How many 🌺 flowers?',
      v: {type:'objectSet', config:{count:16, emoji:'🌺', layout:'grid'}},
      o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'16 flowers!', d:'m', s:null, h:'Touch every flower as you count'
    },
    // ── L2: Subitize ─────────────────────────────────────────────────────────
    {
      t: 'Quick look! How many 🔴 dots?',
      v: {type:'objectSet', config:{count:3, emoji:'🔴', layout:'grid'}},
      o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'3 dots — triangle pattern!', d:'e', s:null, h:'Three in a triangle'
    },
    {
      t: 'Quick look! How many 🌟 stars?',
      v: {type:'objectSet', config:{count:5, emoji:'🌟', layout:'grid'}},
      o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'5 stars — like a die face!', d:'e', s:null, h:'Five — dice pattern'
    },
    {
      t: 'Quick look! 2 🐸 and 3 🐸. How many in all?',
      v: {type:'objectSet', config:{count:5, emoji:'🐸', layout:'grid'}},
      o: [{val:'2',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'2 + 3 = 5 frogs!', d:'h', s:null, h:'See both groups together'
    },
    {
      t: 'Quick look! How many 🔵 dots?',
      v: {type:'objectSet', config:{count:6, emoji:'🔵', layout:'grid'}},
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 dots — two rows of 3!', d:'m', s:null, h:'Two rows of three = 6'
    },
    {
      t: 'Quick look! How many 🌙 moons?',
      v: {type:'objectSet', config:{count:4, emoji:'🌙', layout:'grid'}},
      o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'4 moons — square pattern!', d:'e', s:null, h:'Four in a square'
    },
    // ── L3: Story Problems ────────────────────────────────────────────────────
    {
      t: '4 🐠 are in a pond. 3 more swim in. How many fish in all?',
      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐠', rightCount:3, rightObj:'🐠', op:'compare'}},
      o: [{val:'1',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'4 + 3 = 7 fish!', d:'e', s:null, h:'"Swim in" = join'
    },
    {
      t: '8 🍕 slices on a tray. 5 are eaten. How many are left?',
      v: {type:'objectSet', config:{count:8, emoji:'🍕', layout:'grid'}},
      o: [{val:'13',tag:'err_add_instead'},{val:'8',tag:'err_count_all'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'8 − 5 = 3 slices!', d:'h', s:null, h:'"Eaten" = take away'
    },
    {
      t: '5 children on a slide. 2 go home. How many children are left?',
      v: null,
      o: [{val:'7',tag:'err_add_instead'},{val:'2',tag:'err_count_all'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'5 − 2 = 3 children!', d:'h', s:null, h:'"Go home" = take away'
    },
    {
      t: '6 🐦 birds and 4 more 🐦 land on the fence. How many in all?',
      v: null,
      o: [{val:'2',tag:'err_sub_instead'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'6 + 4 = 10 birds!', d:'m', s:null, h:'"Land on" = join'
    },
    {
      t: '3 🍰 cakes and 5 more 🍰 are baked. How many cakes in all?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🍰', rightCount:5, rightObj:'🍰', op:'compare'}},
      o: [{val:'2',tag:'err_sub_instead'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'3 + 5 = 8 cakes!', d:'e', s:null, h:'Join both groups'
    },
    // ── L4: Explain Your Math ─────────────────────────────────────────────────
    {
      t: 'Maya has 5 pencils. She gets 3 more. Which number sentence matches?',
      v: null,
      o: [{val:'5 − 3 = 2',tag:'err_sub_instead'},{val:'5 + 3 = 8'},{val:'5 + 2 = 7',tag:'err_off_by_one'},{val:'3 − 5',tag:'err_sub_instead'}],
      a:1, e:'"Gets more" = add! 5 + 3 = 8 ✅', d:'e', s:null, h:'"Gets more" = join'
    },
    {
      t: '9 birds on a fence. 3 fly off. Should you add or subtract?',
      v: null,
      o: [{val:'Add — 9 + 3 = 12',tag:'err_add_instead'},{val:'Subtract — 9 − 3 = 6'},{val:'Add — more birds',tag:'err_add_instead'},{val:'Subtract — 9 − 6 = 3',tag:'err_off_by_one'}],
      a:1, e:'"Fly off" = take away! 9 − 3 = 6 ✅', d:'e', s:null, h:'"Fly off" = subtract'
    },
    {
      t: '4 red fish and 5 blue fish in a tank. Which is correct?',
      v: null,
      o: [{val:'5 − 4 = 1',tag:'err_sub_instead'},{val:'4 + 5 = 9'},{val:'4 + 4 = 8',tag:'err_off_by_one'},{val:'9 − 5 = 4',tag:'err_sub_instead'}],
      a:1, e:'Two groups together = add! 4 + 5 = 9 ✅', d:'h', s:null, h:'Two groups in the tank = join'
    },
    {
      t: '10 🍓 strawberries. Eli eats 4. Which number sentence and answer?',
      v: null,
      o: [{val:'10 + 4 = 14',tag:'err_add_instead'},{val:'10 − 4 = 6'},{val:'10 − 5 = 5',tag:'err_off_by_one'},{val:'4 + 6 = 10',tag:'err_add_instead'}],
      a:1, e:'"Eats" = subtract! 10 − 4 = 6 ✅', d:'h', s:null, h:'"Eats" is a take-away word'
    },
    {
      t: '7 kites in the sky. 2 float away. Which is correct?',
      v: null,
      o: [{val:'7 + 2 = 9',tag:'err_add_instead'},{val:'7 − 2 = 5'},{val:'7 − 3 = 4',tag:'err_off_by_one'},{val:'2 + 5 = 7',tag:'err_add_instead'}],
      a:1, e:'"Float away" = subtract! 7 − 2 = 5 ✅', d:'h', s:null, h:'"Float away" = take away'
    },

    // ── NEW testBank additions ────────────────────────────────────────────────

    // ── L1 Counting Strategies — 8 new ──────────────────────────────────────
    {
      t: 'Count the 🦀 crabs. How many?',
      v: {type:'objectSet', config:{count:7, emoji:'🦀', layout:'grid'}},
      o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'7 crabs!', d:'e', s:null, h:'Touch each crab as you count'
    },
    {
      t: 'What number comes after 5?',
      v: null,
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 comes after 5!', d:'e', s:null, h:'Count on one step from 5'
    },
    {
      t: 'Count the 🌵 cacti. How many?',
      v: {type:'objectSet', config:{count:12, emoji:'🌵', layout:'grid'}},
      o: [{val:'10',tag:'err_under_count'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
      a:2, e:'12 cacti!', d:'m', s:null, h:'Count in rows — do not skip any'
    },
    {
      t: 'Count the 🎃 pumpkins. How many?',
      v: {type:'objectSet', config:{count:14, emoji:'🎃', layout:'grid'}},
      o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
      a:2, e:'14 pumpkins!', d:'m', s:null, h:'Touch each pumpkin carefully'
    },
    {
      t: '13, 14, __, 16 — what number is missing?',
      v: null,
      o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'15 goes between 14 and 16!', d:'m', s:null, h:'Count forward from 14'
    },
    {
      t: 'Count the 🎸 guitars. How many?',
      v: {type:'objectSet', config:{count:15, emoji:'🎸', layout:'grid'}},
      o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_over_count'}],
      a:2, e:'15 guitars!', d:'m', s:null, h:'Count row by row to the end'
    },
    {
      t: 'Count the 🦕 dinosaurs. How many?',
      v: {type:'objectSet', config:{count:17, emoji:'🦕', layout:'grid'}},
      o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'19',tag:'err_over_count'}],
      a:2, e:'17 dinosaurs!', d:'h', s:null, h:'Count every dinosaur — do not stop early'
    },
    {
      t: '__, 18, 19 — what number is missing?',
      v: null,
      o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
      a:2, e:'17 comes before 18!', d:'h', s:null, h:'Count back one step from 18'
    },

    // ── L2 Subitize — 8 new ──────────────────────────────────────────────────
    {
      t: 'Quick look! How many 🟠?',
      v: {type:'objectSet', config:{count:2, emoji:'🟠', layout:'grid'}},
      o: [{val:'1',tag:'err_under_count'},{val:'2'},{val:'3',tag:'err_over_count'},{val:'4',tag:'err_over_count'}],
      a:1, e:'2 orange circles!', d:'e', s:null, h:'Two — a pair'
    },
    {
      t: 'Quick look! How many 🐱?',
      v: {type:'objectSet', config:{count:3, emoji:'🐱', layout:'grid'}},
      o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'3 cats — triangle pattern!', d:'e', s:null, h:'Three — see the triangle'
    },
    {
      t: 'Quick look! How many 🌈?',
      v: {type:'objectSet', config:{count:1, emoji:'🌈', layout:'grid'}},
      o: [{val:'1'},{val:'2',tag:'err_over_count'},{val:'3',tag:'err_over_count'},{val:'0',tag:'err_under_count'}],
      a:0, e:'Just 1 rainbow!', d:'e', s:null, h:'One — just one object'
    },
    {
      t: 'Quick look! How many 🍉?',
      v: {type:'objectSet', config:{count:4, emoji:'🍉', layout:'grid'}},
      o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'4 watermelons — square pattern!', d:'m', s:null, h:'Four — like corners of a square'
    },
    {
      t: 'Quick look! How many 🌊?',
      v: {type:'objectSet', config:{count:5, emoji:'🌊', layout:'grid'}},
      o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'5 waves — die pattern!', d:'m', s:null, h:'Five — like the middle of a dice'
    },
    {
      t: 'Quick look! 🎀 — how many?',
      v: {type:'objectSet', config:{count:4, emoji:'🎀', layout:'grid'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_over_count'}],
      a:1, e:'4 bows!', d:'m', s:null, h:'Four in a square pattern'
    },
    {
      t: 'Quick look! How many 🍇?',
      v: {type:'objectSet', config:{count:6, emoji:'🍇', layout:'grid'}},
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 grapes — two rows of 3!', d:'h', s:null, h:'Six — two rows of three'
    },
    {
      t: 'Quick look! 🦆 — how many in all? (two rows)',
      v: {type:'objectSet', config:{count:6, emoji:'🦆', layout:'grid'}},
      o: [{val:'3',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'8',tag:'err_over_count'}],
      a:2, e:'6 ducks — two rows of 3!', d:'h', s:null, h:'Count both rows together'
    },

    // ── L3 Story Problems — 8 new ────────────────────────────────────────────
    {
      t: '2 🐶 and 3 more 🐶 run in. How many dogs?',
      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐶', rightCount:3, rightObj:'🐶', op:'compare'}},
      o: [{val:'1',tag:'err_sub_instead'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'2 + 3 = 5 dogs!', d:'e', s:null, h:'Join both groups'
    },
    {
      t: '4 🍓 on a plate. 1 is eaten. How many left?',
      v: {type:'objectSet', config:{count:4, emoji:'🍓', layout:'grid'}},
      o: [{val:'5',tag:'err_add_instead'},{val:'4',tag:'err_count_all'},{val:'3'},{val:'2',tag:'err_off_by_one'}],
      a:2, e:'4 − 1 = 3 strawberries!', d:'e', s:null, h:'"Eaten" = take away'
    },
    {
      t: '3 🌼 flowers and 4 more grow. How many in all?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌼', rightCount:4, rightObj:'🌼', op:'compare'}},
      o: [{val:'1',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'3 + 4 = 7 flowers!', d:'m', s:null, h:'"More grow" = join'
    },
    {
      t: '6 🐠 in a bowl. 2 swim out. How many left?',
      v: {type:'objectSet', config:{count:6, emoji:'🐠', layout:'grid'}},
      o: [{val:'8',tag:'err_add_instead'},{val:'6',tag:'err_count_all'},{val:'4'},{val:'3',tag:'err_off_by_one'}],
      a:2, e:'6 − 2 = 4 fish!', d:'m', s:null, h:'"Swim out" = take away'
    },
    {
      t: '2 🦁 lions and 5 more join. How many in all?',
      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦁', rightCount:5, rightObj:'🦁', op:'compare'}},
      o: [{val:'3',tag:'err_sub_instead'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'2 + 5 = 7 lions!', d:'m', s:null, h:'"Join" = add'
    },
    {
      t: '8 🍇 on a vine. 3 fall off. How many left?',
      v: {type:'objectSet', config:{count:8, emoji:'🍇', layout:'grid'}},
      o: [{val:'11',tag:'err_add_instead'},{val:'8',tag:'err_count_all'},{val:'5'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'8 − 3 = 5 grapes!', d:'m', s:null, h:'"Fall off" = take away'
    },
    {
      t: '5 🌙 moons and 4 more appear. How many in all?',
      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🌙', rightCount:4, rightObj:'🌙', op:'compare'}},
      o: [{val:'1',tag:'err_sub_instead'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
      a:2, e:'5 + 4 = 9 moons!', d:'h', s:null, h:'"More appear" = join'
    },
    {
      t: '10 🎈 at a party. 6 pop. How many are left?',
      v: {type:'objectSet', config:{count:10, emoji:'🎈', layout:'grid'}},
      o: [{val:'16',tag:'err_add_instead'},{val:'10',tag:'err_count_all'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'10 − 6 = 4 balloons!', d:'h', s:null, h:'"Pop" = take away'
    },

    // ── L4 Explain Your Math — 8 new ─────────────────────────────────────────
    {
      t: 'Rosa has 3 stickers. She gets 2 more. Should she add or subtract?',
      v: null,
      o: [{val:'Subtract — she gives some away',tag:'err_sub_instead'},{val:'Add — she has more stickers now'},{val:'It does not matter',tag:'err_sub_instead'},{val:'Subtract — 3 − 2',tag:'err_sub_instead'}],
      a:1, e:'"Gets more" = bigger amount! Add: 3 + 2 = 5 ✅', d:'e', s:null, h:'"Gets more" = join = add'
    },
    {
      t: 'Jack has 7 grapes. He eats 3. Should he add or subtract?',
      v: null,
      o: [{val:'Add — 7 + 3 = 10',tag:'err_add_instead'},{val:'Subtract — he has fewer grapes'},{val:'Add — more grapes',tag:'err_add_instead'},{val:'It does not matter',tag:'err_add_instead'}],
      a:1, e:'"Eats" = fewer! Subtract: 7 − 3 = 4 ✅', d:'e', s:null, h:'Eating = going away = subtract'
    },
    {
      t: '4 🎨 cans and 3 more are added. Which sentence?',
      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🎨', rightCount:3, rightObj:'🎨', op:'compare'}},
      o: [{val:'4 − 3 = 1',tag:'err_sub_instead'},{val:'4 + 3 = 7'},{val:'4 + 2 = 6',tag:'err_off_by_one'},{val:'7 − 4 = 3',tag:'err_sub_instead'}],
      a:1, e:'"Added" = join! 4 + 3 = 7 ✅', d:'m', s:null, h:'"Added" = more = add'
    },
    {
      t: '6 🐟 in a tank. 2 swim out. Which sentence?',
      v: {type:'objectSet', config:{count:6, emoji:'🐟', layout:'grid'}},
      o: [{val:'6 + 2 = 8',tag:'err_add_instead'},{val:'6 − 2 = 4'},{val:'6 − 3 = 3',tag:'err_off_by_one'},{val:'2 + 4 = 6',tag:'err_add_instead'}],
      a:1, e:'"Swim out" = take away! 6 − 2 = 4 ✅', d:'m', s:null, h:'"Swim out" = go away = subtract'
    },
    {
      t: '3 🐸 frogs and 1 more jumps in. Which sentence?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐸', rightCount:1, rightObj:'🐸', op:'compare'}},
      o: [{val:'3 − 1 = 2',tag:'err_sub_instead'},{val:'3 + 1 = 4'},{val:'3 + 2 = 5',tag:'err_off_by_one'},{val:'4 − 3 = 1',tag:'err_sub_instead'}],
      a:1, e:'"Jumps in" = join! 3 + 1 = 4 ✅', d:'m', s:null, h:'"Jumps in" = more come = add'
    },
    {
      t: 'Zoe says 5 + 3 = 7. Is she right?',
      v: null,
      o: [{val:'Yes, that is correct',tag:'err_add_instead'},{val:'No, 5 + 3 = 8'},{val:'No, 5 + 3 = 6',tag:'err_off_by_one'},{val:'Yes, 4 + 3 = 7 too',tag:'err_add_instead'}],
      a:1, e:'Count on 3 from 5: 6, 7, 8 — the answer is 8, not 7!', d:'m', s:null, h:'Count on 3 steps from 5'
    },
    {
      t: '9 🍪 cookies. 4 are eaten. Which sentence and answer?',
      v: null,
      o: [{val:'9 + 4 = 13',tag:'err_add_instead'},{val:'9 − 5 = 4',tag:'err_off_by_one'},{val:'9 − 4 = 5'},{val:'4 + 5 = 9',tag:'err_add_instead'}],
      a:2, e:'"Eaten" = subtract! 9 − 4 = 5 ✅', d:'h', s:null, h:'"Eaten" is a take-away word'
    },
    {
      t: '3 🚂 trains. 6 more arrive. Which is correct?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🚂', rightCount:6, rightObj:'🚂', op:'compare'}},
      o: [{val:'6 − 3 = 3',tag:'err_sub_instead'},{val:'3 + 5 = 8',tag:'err_off_by_one'},{val:'9 − 6 = 3',tag:'err_sub_instead'},{val:'3 + 6 = 9'}],
      a:3, e:'"Arrive" = join! 3 + 6 = 9 ✅', d:'h', s:null, h:'"Arrive" = more come = add'
    }
  ]
});
