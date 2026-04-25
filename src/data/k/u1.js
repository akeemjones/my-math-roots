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
        // ── ORIGINAL 12 questions (preserved verbatim) ──────────────────────
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
        },

        // ── NEW easy questions (d:'e') — counts 2–6, 8 with fresh emojis ────
        {
          t: 'How many 🐙 do you see?',
          v: {type:'objectSet', config:{count:2, emoji:'🐙', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}],
          a:1, e:'Just 2 octopuses! Count: 1, 2!', d:'e', s:null, h:'Count: 1, 2'
        },
        {
          t: 'How many 🦁 do you see?',
          v: {type:'objectSet', config:{count:3, emoji:'🦁', layout:'line'}},
          o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3 lions!', d:'e', s:null, h:'Touch each lion as you count'
        },
        {
          t: 'How many 🐬 do you see?',
          v: {type:'objectSet', config:{count:4, emoji:'🐬', layout:'grid'}},
          o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4 dolphins!', d:'e', s:null, h:'Count each dolphin'
        },
        {
          t: 'How many 🎃 do you see?',
          v: {type:'objectSet', config:{count:5, emoji:'🎃', layout:'line'}},
          o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5 pumpkins!', d:'e', s:null, h:'Touch each pumpkin'
        },
        {
          t: 'How many 🍒 do you see?',
          v: {type:'objectSet', config:{count:6, emoji:'🍒', layout:'grid'}},
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6 cherries!', d:'e', s:null, h:'Count in rows'
        },
        {
          t: 'How many 🦊 do you see?',
          v: {type:'objectSet', config:{count:8, emoji:'🦊', layout:'grid'}},
          o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6, 7, 8 foxes!', d:'e', s:null, h:'Go row by row'
        },

        // ── NEW medium questions (d:'m') — counts 7–10, ±1 distractors ──────
        {
          t: 'How many 🌊 do you see?',
          v: {type:'objectSet', config:{count:7, emoji:'🌊', layout:'grid'}},
          o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'Count carefully: 1, 2, 3, 4, 5, 6, 7!', d:'m', s:null, h:'There are more than 6!'
        },
        {
          t: 'How many 🍉 do you see?',
          v: {type:'objectSet', config:{count:8, emoji:'🍉', layout:'grid'}},
          o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6, 7, 8 watermelons!', d:'m', s:null, h:'Go slowly — there are 8!'
        },
        {
          t: 'How many 🐧 do you see?',
          v: {type:'objectSet', config:{count:9, emoji:'🐧', layout:'grid'}},
          o: [{val:'7',tag:'err_under_count'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6, 7, 8, 9 penguins!', d:'m', s:null, h:'More than 8!'
        },
        {
          t: 'How many 🦄 do you see?',
          v: {type:'objectSet', config:{count:10, emoji:'🦄', layout:'grid'}},
          o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'Count all the way to 10 unicorns!', d:'m', s:null, h:'Count every unicorn'
        },
        {
          t: 'How many 🌵 do you see?',
          v: {type:'objectSet', config:{count:7, emoji:'🌵', layout:'line'}},
          o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'Count left to right: 1, 2, 3, 4, 5, 6, 7!', d:'m', s:null, h:'Touch each cactus'
        },
        {
          t: 'How many 🐻 do you see?',
          v: {type:'objectSet', config:{count:9, emoji:'🐻', layout:'grid'}},
          o: [{val:'7',tag:'err_under_count'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'Count: 1, 2, 3, 4, 5, 6, 7, 8, 9 bears!', d:'m', s:null, h:'Go row by row'
        },

        // ── NEW hard questions (d:'h') — ±1 distractors only, counts 8–10 ───
        {
          t: 'How many 🍄 do you see?',
          v: {type:'objectSet', config:{count:8, emoji:'🍄', layout:'grid'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'Count carefully: 1, 2, 3, 4, 5, 6, 7, 8!', d:'h', s:null, h:'Count every mushroom — do not skip any!'
        },
        {
          t: 'How many 🦀 do you see?',
          v: {type:'objectSet', config:{count:10, emoji:'🦀', layout:'grid'}},
          o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'10 crabs — you counted all the way to 10!', d:'h', s:null, h:'Count every single crab'
        },
        {
          t: 'Which number comes after 9?',
          v: null,
          o: [{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_off_by_one'},{val:'10'}],
          a:3, e:'10 comes right after 9!', d:'h', s:null, h:'Count up: ...8, 9, ___'
        },
        {
          t: 'How many 🌻 do you see?',
          v: {type:'objectSet', config:{count:9, emoji:'🌻', layout:'grid'}},
          o: [{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'Count every sunflower: 1, 2, 3, 4, 5, 6, 7, 8, 9!', d:'h', s:null, h:'Go very slowly — count each row'
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

        // ── ORIGINAL 10 questions (preserved verbatim) ──────────────────────
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
        },

        // ── NEW easy questions (d:'e') — subitize 1–4, fresh emojis ─────────
        {
          t: 'Quick Look! How many 🐥?',
          v: {type:'objectSet', config:{count:1, emoji:'🐥', layout:'dice'}},
          o: [{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'},{val:'4',tag:'err_subitize'}],
          a:0, e:'Just 1 chick — your brain saw it!', d:'e', s:null, h:'Just one little chick'
        },
        {
          t: 'Quick Look! How many 🍓?',
          v: {type:'objectSet', config:{count:2, emoji:'🍓', layout:'dice'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
          a:1, e:'2 strawberries — one on each side!', d:'e', s:null, h:'Look — two strawberries'
        },
        {
          t: 'Quick Look! How many 🌈?',
          v: {type:'objectSet', config:{count:3, emoji:'🌈', layout:'dice'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_subitize'}],
          a:1, e:'3 rainbows — a diagonal line!', d:'e', s:null, h:'Three in a row'
        },
        {
          t: 'Quick Look! How many 🐠?',
          v: {type:'objectSet', config:{count:4, emoji:'🐠', layout:'dice'}},
          o: [{val:'2',tag:'err_subitize'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 fish — one in each corner!', d:'e', s:null, h:'4 corners = 4 fish'
        },

        // ── NEW medium questions (d:'m') — subitize 4–6, closer distractors ─
        {
          t: 'Quick Look! How many 🦄?',
          v: {type:'objectSet', config:{count:4, emoji:'🦄', layout:'grid'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_subitize'}],
          a:1, e:'4 unicorns — see the 4 corners!', d:'m', s:null, h:'Look for the pattern of 4'
        },
        {
          t: 'Quick Look! How many 🌙?',
          v: {type:'objectSet', config:{count:5, emoji:'🌙', layout:'dice'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'}],
          a:1, e:'5 moons — 4 corners plus 1 middle!', d:'m', s:null, h:'4 around the edge, 1 in the center'
        },
        {
          t: 'Quick Look! How many 🎵?',
          v: {type:'objectSet', config:{count:5, emoji:'🎵', layout:'grid'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'}],
          a:1, e:'5 music notes — corners plus the middle!', d:'m', s:null, h:'Is it 4 or 5? Count if you need to!'
        },
        {
          t: 'Quick Look! How many 🌺?',
          v: {type:'objectSet', config:{count:6, emoji:'🌺', layout:'dice'}},
          o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 hibiscus — two rows of 3!', d:'m', s:null, h:'3 on the left side, 3 on the right side'
        },
        {
          t: 'Quick Look! How many 🐡?',
          v: {type:'objectSet', config:{count:4, emoji:'🐡', layout:'line'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'2',tag:'err_subitize'}],
          a:1, e:'4 puffer fish — can you see all 4 at once?', d:'m', s:null, h:'Is it 3 or 4? Look carefully!'
        },
        {
          t: 'Quick Look! How many 🍋?',
          v: {type:'objectSet', config:{count:6, emoji:'🍋', layout:'grid'}},
          o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 lemons — see the two groups of 3!', d:'m', s:null, h:'Look for the groups'
        },

        // ── NEW hard questions (d:'h') — subitize 5–6, tricky distractors ───
        {
          t: 'Quick Look! How many 🔷?',
          v: {type:'objectSet', config:{count:5, emoji:'🔷', layout:'dice'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'}],
          a:1, e:'5 diamonds — trust the pattern!', d:'h', s:null, h:'Focus on the whole shape — is it 4 or 5?'
        },
        {
          t: 'Quick Look! How many 🐢?',
          v: {type:'objectSet', config:{count:6, emoji:'🐢', layout:'dice'}},
          o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 turtles — 3 on top, 3 on the bottom!', d:'h', s:null, h:'Two rows — how many in each row?'
        },
        {
          t: 'Quick Look! How many 🏀?',
          v: {type:'objectSet', config:{count:6, emoji:'🏀', layout:'grid'}},
          o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 basketballs — 2 columns of 3!', d:'h', s:null, h:'How many columns? How many in each?'
        },
        {
          t: 'Quick Look! How many 🦋?',
          v: {type:'objectSet', config:{count:5, emoji:'🦋', layout:'grid'}},
          o: [{val:'3',tag:'err_subitize'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'5 butterflies — 4 corners plus 1 in the middle!', d:'h', s:null, h:'Look for 4 corners and the center'
        },
        {
          t: 'Quick Look! How many 🌟?',
          v: {type:'objectSet', config:{count:6, emoji:'🌟', layout:'line'}},
          o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'6 stars in a line — is it 5 or 6? Count to check!', d:'h', s:null, h:'A line of stars — more than 5?'
        },
        {
          t: 'Quick Look! How many 🐟?',
          v: {type:'objectSet', config:{count:5, emoji:'🐟', layout:'line'}},
          o: [{val:'3',tag:'err_subitize'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'5 fish in a line — your brain is getting fast!', d:'h', s:null, h:'More than 4 fish?'
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
        {q:'How many more than 10 to make 13?',     a:'3',  h:'10 + ___ = 13',               e:'3 more! Great number thinking! 🧠'}
      ],

      qBank: [
        // ── ORIGINAL 10 questions (preserved verbatim) ──────────────────────
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
          t: 'How many more than 10 to make 13?',
          v: null,
          o: [{val:'1',tag:'err_teen'},{val:'2',tag:'err_teen'},{val:'3'},{val:'4',tag:'err_teen'}],
          a:2, e:'13 = 10 + 3 — ten and THREE more!', d:'m', s:null, h:'10 + ___ = 13'
        },
        {
          t: 'Which number is between 17 and 19?',
          v: null,
          o: [{val:'16',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'18 is between 17 and 19!', d:'m', s:null, h:'Count: 17, ___, 19'
        },

        // ── NEW easy questions (d:'e') — counts 11–13, "what comes after", ──
        //    "How many more to make N?"
        {
          t: 'How many 🌼 do you see?',
          v: {type:'objectSet', config:{count:11, emoji:'🌼', layout:'grid'}},
          o: [{val:'9',tag:'err_under_count'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'11! Ten and one more!', d:'e', s:null, h:'Count past 10'
        },
        {
          t: 'How many 🐱 do you see?',
          v: {type:'objectSet', config:{count:13, emoji:'🐱', layout:'grid'}},
          o: [{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
          a:2, e:'13! Ten and three more!', d:'e', s:null, h:'Count carefully past 10'
        },
        {
          t: 'What number comes after 12?',
          v: null,
          o: [{val:'11',tag:'err_off_by_one'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_over_count'}],
          a:2, e:'13 comes right after 12!', d:'e', s:null, h:'Count on from 12: 12, ___'
        },
        {
          t: 'How many more than 10 to make 11?',
          v: null,
          o: [{val:'1'},{val:'2',tag:'err_teen'},{val:'3',tag:'err_teen'},{val:'4',tag:'err_teen'}],
          a:0, e:'11 = 10 + 1 — ten and ONE more!', d:'e', s:null, h:'10 + ___ = 11'
        },
        {
          t: 'How many more than 10 to make 14?',
          v: null,
          o: [{val:'3',tag:'err_teen'},{val:'4'},{val:'5',tag:'err_teen'},{val:'6',tag:'err_teen'}],
          a:1, e:'14 = 10 + 4 — ten and FOUR more!', d:'e', s:null, h:'10 + ___ = 14'
        },

        // ── NEW medium questions (d:'m') — counts 14–17, 16=10+? sequences ─
        {
          t: 'How many 🐶 do you see?',
          v: {type:'objectSet', config:{count:14, emoji:'🐶', layout:'grid'}},
          o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'14! Count carefully past 10!', d:'m', s:null, h:'More than 13!'
        },
        {
          t: 'How many 🐰 do you see?',
          v: {type:'objectSet', config:{count:16, emoji:'🐰', layout:'grid'}},
          o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
          a:2, e:'16! Count past 15!', d:'m', s:null, h:'More than 15!'
        },
        {
          t: 'How many more than 10 to make 16?',
          v: null,
          o: [{val:'5',tag:'err_teen'},{val:'6'},{val:'7',tag:'err_teen'},{val:'8',tag:'err_teen'}],
          a:1, e:'16 = 10 + 6 — ten and SIX more!', d:'m', s:null, h:'10 + ___ = 16'
        },
        {
          t: 'What number comes after 14?',
          v: null,
          o: [{val:'13',tag:'err_off_by_one'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_over_count'}],
          a:2, e:'15 comes right after 14!', d:'m', s:null, h:'Count on from 14: 14, ___'
        },
        {
          t: 'How many 🐼 do you see?',
          v: {type:'objectSet', config:{count:15, emoji:'🐼', layout:'grid'}},
          o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
          a:2, e:'15! Ten and five more!', d:'m', s:null, h:'Count past 14'
        },
        {
          t: 'Which number goes in the blank? 15, 16, ___, 18',
          v: null,
          o: [{val:'14',tag:'err_off_by_one'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'19',tag:'err_off_by_one'}],
          a:2, e:'17! The sequence goes 15, 16, 17, 18!', d:'m', s:null, h:'Count on from 16: 16, ___'
        },
        {
          t: 'How many 🦊 do you see?',
          v: {type:'objectSet', config:{count:17, emoji:'🦊', layout:'grid'}},
          o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'17! Count carefully to 17!', d:'m', s:null, h:'More than 16!'
        },

        // ── NEW hard questions (d:'h') — counts 18–20, 19=10+?, sequences ───
        {
          t: 'How many 🦋 do you see?',
          v: {type:'objectSet', config:{count:19, emoji:'🦋', layout:'grid'}},
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'19! Almost all the way to 20!', d:'h', s:null, h:'Count carefully — more than 18!'
        },
        {
          t: 'How many more than 10 to make 19?',
          v: null,
          o: [{val:'8',tag:'err_teen'},{val:'9'},{val:'10',tag:'err_teen'},{val:'11',tag:'err_teen'}],
          a:1, e:'19 = 10 + 9 — ten and NINE more!', d:'h', s:null, h:'10 + ___ = 19'
        },
        {
          t: 'Which number goes in the blank? 17, ___, 19',
          v: null,
          o: [{val:'16',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'18! Count: 17, 18, 19!', d:'h', s:null, h:'What comes between 17 and 19?'
        },
        {
          t: 'How many 🌴 do you see?',
          v: {type:'objectSet', config:{count:20, emoji:'🌴', layout:'grid'}},
          o: [{val:'18',tag:'err_off_by_one'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_off_by_one'}],
          a:2, e:'20! You counted all the way to 20!', d:'h', s:null, h:'Count every palm tree — all the way to 20!'
        }
      ]
    },

    // ── Lesson 4: Count to 20 — migrated from u4.js (→ ku1l4) ────────────────
    {
      points: [
        'Count forward: 1, 2, 3 … all the way to 20!',
        'Count backward: start at a number and go down — 20, 19, 18 …',
        'What comes BEFORE and AFTER a number? Use the counting order!'
      ],
      examples: [
        {c:'#FF9800', tag:'Count Forward', p:'Count all the ⭐ below. How many are there?', v:{type:'objectSet', config:{count:15, emoji:'⭐', layout:'grid'}}, s:'Touch each star and count: 1, 2, 3 … 15', a:'15 stars ✅'},
        {c:'#FB8C00', tag:'What Comes Next?', p:'16, 17, __ — what number comes after 17?', v:null, s:'Count on one more from 17: 18', a:'18 ✅'},
        {c:'#E65100', tag:'Count Backward', p:'Start at 14 and count back. What comes before 14?', v:null, s:'Count back one step from 14: 13', a:'13 ✅'}
      ],
      practice: [
        {q:'Count forward: 11, 12, 13, __, 15', a:'14', h:'What number comes after 13?', e:'14 comes after 13! ✅'},
        {q:'What comes after 19?', a:'20', h:'Count on from 19: twenty!', e:'20 comes after 19! ✅'},
        {q:'What comes before 16?', a:'15', h:'Count back one step from 16', e:'15 comes before 16! ✅'}
      ],
      qBank: [
        {t:'How many 🌟 are there?', v:{type:'objectSet', config:{count:11, emoji:'🌟', layout:'grid'}}, o:[{val:'10',tag:'err_under_count'},{val:'11'},{val:'12',tag:'err_off_by_one'},{val:'13',tag:'err_over_count'}], a:1, e:'Count: 1 … 11!', d:'e', s:null, h:'Count every star one by one'},
        {t:'How many 🐝 do you see?', v:{type:'objectSet', config:{count:13, emoji:'🐝', layout:'grid'}}, o:[{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}], a:2, e:'Count carefully: 1 … 13!', d:'e', s:null, h:'Touch each bee as you count'},
        {t:'How many 🦋 are in the garden?', v:{type:'objectSet', config:{count:16, emoji:'🦋', layout:'grid'}}, o:[{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}], a:2, e:'16 butterflies!', d:'m', s:null, h:'Count row by row'},
        {t:'Count the 🌸 flowers. How many?', v:{type:'objectSet', config:{count:18, emoji:'🌸', layout:'grid'}}, o:[{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}], a:2, e:'18 flowers!', d:'m', s:null, h:'Count carefully — do not skip any'},
        {t:'How many ⭐ are here?', v:{type:'objectSet', config:{count:20, emoji:'⭐', layout:'grid'}}, o:[{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}], a:2, e:'20 stars — all the way to 20!', d:'m', s:null, h:'Count all the way to the last one'},
        {t:'What number comes after 10?', v:null, o:[{val:'9',tag:'err_under_count'},{val:'10',tag:'err_same'},{val:'11'},{val:'12',tag:'err_off_by_one'}], a:2, e:'11 comes right after 10!', d:'e', s:null, h:'Count on one more from 10'},
        {t:'What number comes after 14?', v:null, o:[{val:'13',tag:'err_under_count'},{val:'14',tag:'err_same'},{val:'15'},{val:'16',tag:'err_off_by_one'}], a:2, e:'15 comes after 14!', d:'e', s:null, h:'Count forward one step from 14'},
        {t:'What number comes after 17?', v:null, o:[{val:'16',tag:'err_under_count'},{val:'17',tag:'err_same'},{val:'18'},{val:'20',tag:'err_over_count'}], a:2, e:'18 comes after 17!', d:'e', s:null, h:'Say 17 … then the next number'},
        {t:'What number comes after 19?', v:null, o:[{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}], a:2, e:'20 comes after 19 — that is the biggest!', d:'m', s:null, h:'Count on from 19'},
        {t:'11, 12, 13, __ — what comes next?', v:null, o:[{val:'12',tag:'err_under_count'},{val:'13',tag:'err_same'},{val:'14'},{val:'15',tag:'err_off_by_one'}], a:2, e:'14 comes next!', d:'e', s:null, h:'Count on from 13'},
        {t:'What number comes before 12?', v:null, o:[{val:'10',tag:'err_under_count'},{val:'11'},{val:'12',tag:'err_same'},{val:'13',tag:'err_off_by_one'}], a:1, e:'11 comes before 12!', d:'e', s:null, h:'Count back one step from 12'},
        {t:'What number comes before 15?', v:null, o:[{val:'13',tag:'err_under_count'},{val:'14'},{val:'15',tag:'err_same'},{val:'16',tag:'err_off_by_one'}], a:1, e:'14 comes before 15!', d:'e', s:null, h:'Say 15 and count back one'},
        {t:'What number comes before 20?', v:null, o:[{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_same'}], a:2, e:'19 comes before 20!', d:'m', s:null, h:'Count back one step from 20'},
        {t:'__, 16, 17 — what number comes before 16?', v:null, o:[{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_same'}], a:2, e:'15 comes before 16!', d:'m', s:null, h:'Count back one from 16'},
        {t:'What number comes before 18?', v:null, o:[{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_same'}], a:2, e:'17 comes before 18!', d:'m', s:null, h:'Count back from 18'},
        {t:'How many 🦊 are here?', v:{type:'objectSet', config:{count:12, emoji:'🦊', layout:'grid'}}, o:[{val:'10',tag:'err_under_count'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}], a:2, e:'12 foxes!', d:'e', s:null, h:'Count every fox — do not skip any'},
        {t:'What number comes after 11?', v:null, o:[{val:'10',tag:'err_under_count'},{val:'11',tag:'err_same'},{val:'12'},{val:'13',tag:'err_off_by_one'}], a:2, e:'12 comes after 11!', d:'e', s:null, h:'Count on one step from 11'},
        {t:'17, 18, __ — what comes next?', v:null, o:[{val:'17',tag:'err_under_count'},{val:'18',tag:'err_same'},{val:'19'},{val:'20',tag:'err_off_by_one'}], a:2, e:'19 comes after 18!', d:'m', s:null, h:'Count forward from 18'},
        {t:'What comes after 15?', v:null, o:[{val:'14',tag:'err_under_count'},{val:'15',tag:'err_same'},{val:'16'},{val:'17',tag:'err_off_by_one'}], a:2, e:'16 comes after 15!', d:'m', s:null, h:'Count forward one step from 15'},
        {t:'What comes before 17?', v:null, o:[{val:'15',tag:'err_under_count'},{val:'16'},{val:'17',tag:'err_same'},{val:'18',tag:'err_off_by_one'}], a:1, e:'16 comes before 17!', d:'m', s:null, h:'Count back one step from 17'},
        {t:'How many 🦕 are there?', v:{type:'objectSet', config:{count:17, emoji:'🦕', layout:'grid'}}, o:[{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'},{val:'19',tag:'err_over_count'}], a:1, e:'17 dinosaurs — count every one!', d:'h', s:null, h:'Count carefully — do not skip any'},
        {t:'How many 🐳 do you see?', v:{type:'objectSet', config:{count:19, emoji:'🐳', layout:'grid'}}, o:[{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'},{val:'17',tag:'err_under_count'}], a:1, e:'19 whales!', d:'h', s:null, h:'Count row by row — stay focused!'},
        {t:'How many 🌵 are in the desert?', v:{type:'objectSet', config:{count:20, emoji:'🌵', layout:'grid'}}, o:[{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}], a:2, e:'20 cacti — all the way to 20!', d:'h', s:null, h:'Count every cactus one by one'},
        {t:'How many 🎸 are here?', v:{type:'objectSet', config:{count:18, emoji:'🎸', layout:'grid'}}, o:[{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'},{val:'16',tag:'err_under_count'}], a:1, e:'18 guitars!', d:'h', s:null, h:'Count carefully — do not miss any'},
        {t:'18, 19, __ — what comes next?', v:null, o:[{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}], a:2, e:'20 comes after 19!', d:'h', s:null, h:'Count forward from 19'},
        {t:'__, 18, 19 — what number is missing?', v:null, o:[{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_same'},{val:'20',tag:'err_off_by_one'}], a:1, e:'17 goes right before 18!', d:'h', s:null, h:'What comes just before 18?'},
        {t:'16, __, 18 — what number is missing?', v:null, o:[{val:'16',tag:'err_same'},{val:'17'},{val:'18',tag:'err_same'},{val:'19',tag:'err_off_by_one'}], a:1, e:'17 goes between 16 and 18!', d:'h', s:null, h:'What comes after 16?'},
        {t:'20, __, 18 — what is missing when counting back?', v:null, o:[{val:'17',tag:'err_off_by_one'},{val:'18',tag:'err_same'},{val:'19'},{val:'20',tag:'err_same'}], a:2, e:'19 goes between 20 and 18 when counting back!', d:'h', s:null, h:'Count backward from 20'}
      ]
    },

    // ── Lesson 5: Read and Represent 11–20 — migrated from u4.js (→ ku1l5) ───
    {
      points: [
        'Teen numbers are made of 10 and some MORE — like 10 + 4 = 14',
        '11 = 10 + 1, 12 = 10 + 2, all the way to 19 = 10 + 9',
        'Match the numeral to the right group of objects!'
      ],
      examples: [
        {c:'#FF9800', tag:'10 + Extras', p:'Here are 14 ⭐. Count the group of 10 — then count the 4 extras!', v:{type:'objectSet', config:{count:14, emoji:'⭐', layout:'grid'}}, s:'10 in the full rows, then 1, 2, 3, 4 more = 14', a:'14 ✅ — ten and four more'},
        {c:'#FB8C00', tag:'Name the Set', p:'How many 🌙 are there? Pick the numeral.', v:{type:'objectSet', config:{count:16, emoji:'🌙', layout:'grid'}}, s:'Count all: 1 … 16. The numeral is 16.', a:'16 ✅'},
        {c:'#E65100', tag:'Count the Extras', p:'13 objects = 10 + how many extras?', v:{type:'objectSet', config:{count:13, emoji:'🍎', layout:'grid'}}, s:'Count beyond 10: 11, 12, 13 — that is 3 extras', a:'3 extras ✅ — 10 + 3 = 13'}
      ],
      practice: [
        {q:'Show 12 using 10 + extras. How many extras?', a:'2', h:'12 = 10 + ?', e:'12 = 10 + 2! ✅'},
        {q:'15 = 10 + ?', a:'5', h:'Count past 10 to 15', e:'15 = 10 + 5! ✅'},
        {q:'Which numeral matches 10 + 8?', a:'18', h:'10 + 8 = …', e:'18! Ten and eight more ✅'}
      ],
      qBank: [
        {t:'How many 🍎 are there?', v:{type:'objectSet', config:{count:11, emoji:'🍎', layout:'grid'}}, o:[{val:'9',tag:'err_teen'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}], a:2, e:'11 = ten and one more!', d:'e', s:null, h:'Count all — 10 then 1 more'},
        {t:'How many 🌙 do you see?', v:{type:'objectSet', config:{count:12, emoji:'🌙', layout:'grid'}}, o:[{val:'10',tag:'err_teen'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}], a:2, e:'12 = ten and two more!', d:'e', s:null, h:'Count the ten, then the extras'},
        {t:'How many 🐸 are here?', v:{type:'objectSet', config:{count:14, emoji:'🐸', layout:'grid'}}, o:[{val:'12',tag:'err_teen'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}], a:2, e:'14 = ten and four more!', d:'e', s:null, h:'Count on past 10'},
        {t:'Count the 🌺 flowers. How many?', v:{type:'objectSet', config:{count:17, emoji:'🌺', layout:'grid'}}, o:[{val:'15',tag:'err_teen'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}], a:2, e:'17 = ten and seven more!', d:'m', s:null, h:'Count carefully past 16'},
        {t:'How many 🐠 fish are there?', v:{type:'objectSet', config:{count:19, emoji:'🐠', layout:'grid'}}, o:[{val:'17',tag:'err_teen'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}], a:2, e:'19 = ten and nine more!', d:'m', s:null, h:'Count all the fish'},
        {t:'How many ⭐ stars are here?', v:{type:'objectSet', config:{count:20, emoji:'⭐', layout:'grid'}}, o:[{val:'18',tag:'err_teen'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_off_by_one'}], a:2, e:'20! That is our biggest number!', d:'m', s:null, h:'Count all the way to the end'},
        {t:'13 = 10 + how many extras?', v:{type:'objectSet', config:{count:13, emoji:'🍋', layout:'grid'}}, o:[{val:'1',tag:'err_teen'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'13 = 10 + 3!', d:'e', s:null, h:'Count past 10: 11, 12, 13 — that is 3 extras'},
        {t:'15 = 10 + how many extras?', v:{type:'objectSet', config:{count:15, emoji:'🌟', layout:'grid'}}, o:[{val:'3',tag:'err_teen'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}], a:2, e:'15 = 10 + 5!', d:'e', s:null, h:'Count beyond 10 to reach 15'},
        {t:'18 = 10 + how many extras?', v:{type:'objectSet', config:{count:18, emoji:'🐥', layout:'grid'}}, o:[{val:'6',tag:'err_teen'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'18 = 10 + 8!', d:'m', s:null, h:'Count how many are past the 10'},
        {t:'16 = 10 + how many extras?', v:{type:'objectSet', config:{count:16, emoji:'🍇', layout:'grid'}}, o:[{val:'4',tag:'err_teen'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'16 = 10 + 6!', d:'m', s:null, h:'Count the extras after the first 10'},
        {t:'19 = 10 + how many extras?', v:{type:'objectSet', config:{count:19, emoji:'🐣', layout:'grid'}}, o:[{val:'7',tag:'err_teen'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}], a:2, e:'19 = 10 + 9!', d:'m', s:null, h:'Count the extras after 10'},
        {t:'Which number is "twelve"?', v:null, o:[{val:'10',tag:'err_teen'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'20',tag:'err_teen'}], a:2, e:'Twelve = 12!', d:'e', s:null, h:'Twelve has a 1 and a 2'},
        {t:'Which number is "fifteen"?', v:null, o:[{val:'5',tag:'err_teen'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}], a:2, e:'Fifteen = 15!', d:'e', s:null, h:'Fifteen: ten and five more'},
        {t:'Which number is "seventeen"?', v:null, o:[{val:'7',tag:'err_teen'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}], a:2, e:'Seventeen = 17!', d:'m', s:null, h:'Seventeen: ten and seven more'},
        {t:'Which number is "nineteen"?', v:null, o:[{val:'9',tag:'err_teen'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}], a:2, e:'Nineteen = 19!', d:'m', s:null, h:'Nineteen: ten and nine more'},
        {t:'12 = 10 + how many extras?', v:{type:'objectSet', config:{count:12, emoji:'🐢', layout:'grid'}}, o:[{val:'0',tag:'err_teen'},{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'}], a:2, e:'12 = 10 + 2!', d:'e', s:null, h:'Count how many come after 10'},
        {t:'14 = 10 + how many extras?', v:{type:'objectSet', config:{count:14, emoji:'🐛', layout:'grid'}}, o:[{val:'2',tag:'err_teen'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'14 = 10 + 4!', d:'m', s:null, h:'Count the extras past the first 10'},
        {t:'Which number is "thirteen"?', v:null, o:[{val:'3',tag:'err_teen'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'30',tag:'err_teen'}], a:2, e:'Thirteen = 13!', d:'e', s:null, h:'Thirteen: ten and three more'},
        {t:'Which number is "eleven"?', v:null, o:[{val:'10',tag:'err_teen'},{val:'11'},{val:'12',tag:'err_teen'},{val:'20',tag:'err_teen'}], a:1, e:'Eleven = 11!', d:'e', s:null, h:'Eleven: ten and one more'},
        {t:'12 = 10 + how many extras? Count the 🦜.', v:{type:'objectSet', config:{count:12, emoji:'🦜', layout:'grid'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_teen'}], a:1, e:'12 = 10 + 2!', d:'e', s:null, h:'Count how many come after the first 10'},
        {t:'How many 🚂 are there?', v:{type:'objectSet', config:{count:15, emoji:'🚂', layout:'grid'}}, o:[{val:'13',tag:'err_teen'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}], a:2, e:'15 trains — ten and five more!', d:'m', s:null, h:'Count every train'},
        {t:'How many 🎠 do you see?', v:{type:'objectSet', config:{count:16, emoji:'🎠', layout:'grid'}}, o:[{val:'14',tag:'err_teen'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}], a:2, e:'16 carousels — ten and six more!', d:'m', s:null, h:'Count carefully past 15'},
        {t:'How many 🦁 are in the group?', v:{type:'objectSet', config:{count:17, emoji:'🦁', layout:'grid'}}, o:[{val:'15',tag:'err_teen'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}], a:2, e:'17 lions — ten and seven more!', d:'m', s:null, h:'Count row by row past 16'},
        {t:'Which number is "sixteen"?', v:null, o:[{val:'14',tag:'err_teen'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}], a:2, e:'Sixteen = 16!', d:'m', s:null, h:'Sixteen: ten and six more'},
        {t:'Which number is "eighteen"?', v:null, o:[{val:'16',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}], a:2, e:'Eighteen = 18!', d:'h', s:null, h:'Eighteen: ten and eight more'},
        {t:'Which number is "twenty"?', v:null, o:[{val:'18',tag:'err_off_by_one'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'2',tag:'err_teen'}], a:2, e:'Twenty = 20 — our biggest number!', d:'h', s:null, h:'Twenty comes after nineteen'},
        {t:'How many 🦩 are there?', v:{type:'objectSet', config:{count:18, emoji:'🦩', layout:'grid'}}, o:[{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'},{val:'16',tag:'err_under_count'}], a:1, e:'18 flamingos — count every one!', d:'h', s:null, h:'Count carefully — close numbers!'},
        {t:'How many 🧩 pieces are here?', v:{type:'objectSet', config:{count:19, emoji:'🧩', layout:'grid'}}, o:[{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'},{val:'17',tag:'err_under_count'}], a:1, e:'19 puzzle pieces!', d:'h', s:null, h:'Count row by row — stay focused!'}
      ]
    }

  ],

  // ── Unit 1 Test Bank ──────────────────────────────────────────────────────
  // 50 questions mixing all three lesson topics. ku1l4/ku1l5 migrated from u4.js.
  testBank: [
    // ── ORIGINAL 15 questions (preserved verbatim) ──────────────────────────

    // L1 — Counting to 10
    {lessonId:'ku1l1', 
      t: 'How many 🍎 do you see?',
      v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'grid'}},
      o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'Count: 1, 2, 3, 4, 5!', d:'e', s:null, h:'Touch each apple'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🐦 do you see?',
      v: {type:'objectSet', config:{count:8, emoji:'🐦', layout:'grid'}},
      o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'Count carefully: 8 birds!', d:'e', s:null, h:'Go row by row'
    },
    {lessonId:'ku1l1', 
      t: 'Which number comes after 7?',
      v: null,
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_over_count'}],
      a:2, e:'8 comes after 7!', d:'e', s:null, h:'Count up from 7: 7, ___'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🌸 do you see?',
      v: {type:'objectSet', config:{count:3, emoji:'🌸', layout:'line'}},
      o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'Count: 1, 2, 3!', d:'e', s:null, h:'Count left to right'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🌟 do you see?',
      v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},
      o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'All the way to 10!', d:'m', s:null, h:'Count carefully to 10'
    },
    // L2 — Quick Look
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many dots?',
      v: {type:'objectSet', config:{count:2, emoji:'●', layout:'dice'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
      a:1, e:'2 dots!', d:'e', s:null, h:'Look without counting'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🌟?',
      v: {type:'objectSet', config:{count:4, emoji:'🌟', layout:'dice'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'2',tag:'err_subitize'}],
      a:1, e:'4 stars — one in each corner!', d:'e', s:null, h:'4 corners = 4 stars'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🌸?',
      v: {type:'objectSet', config:{count:6, emoji:'🌸', layout:'dice'}},
      o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 flowers — two columns of 3!', d:'e', s:null, h:'3 on each side'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🐝?',
      v: {type:'objectSet', config:{count:3, emoji:'🐝', layout:'dice'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_subitize'}],
      a:1, e:'3 bees — a diagonal line!', d:'e', s:null, h:'Look — a line of 3'
    },
    // L3 — Counting to 20
    {lessonId:'ku1l3', 
      t: 'How many 🌺 do you see?',
      v: {type:'objectSet', config:{count:12, emoji:'🌺', layout:'grid'}},
      o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
      a:2, e:'12! Ten and two more!', d:'e', s:null, h:'Count past 10'
    },
    {lessonId:'ku1l3', 
      t: 'How many ⭐ do you see?',
      v: {type:'objectSet', config:{count:15, emoji:'⭐', layout:'grid'}},
      o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
      a:2, e:'15! Ten and five more!', d:'e', s:null, h:'Keep counting past 10'
    },
    {lessonId:'ku1l3', 
      t: 'What number comes after 13?',
      v: null,
      o: [{val:'12',tag:'err_off_by_one'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_over_count'}],
      a:2, e:'14 comes right after 13!', d:'e', s:null, h:'Count on from 13: 13, ___'
    },
    {lessonId:'ku1l3', 
      t: 'How many 🐢 do you see?',
      v: {type:'objectSet', config:{count:18, emoji:'🐢', layout:'grid'}},
      o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}],
      a:2, e:'18! Almost to 20!', d:'m', s:null, h:'Count past 17'
    },
    {lessonId:'ku1l3', 
      t: 'How many 🎈 do you see?',
      v: {type:'objectSet', config:{count:6, emoji:'🎈', layout:'grid'}},
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'Count the balloons: 6!', d:'e', s:null, h:'Count in rows'
    },
    {lessonId:'ku1l3', 
      t: 'How many more than 10 to make 15?',
      v: null,
      o: [{val:'4',tag:'err_teen'},{val:'5'},{val:'6',tag:'err_teen'},{val:'7',tag:'err_teen'}],
      a:1, e:'15 = 10 + 5 — ten and FIVE more!', d:'m', s:null, h:'10 + ___ = 15'
    },

    // ── NEW testBank questions — 35 additions ────────────────────────────────

    // L1 easy — 5 new questions, fresh emojis, counts 2–7
    {lessonId:'ku1l1', 
      t: 'How many 🐊 do you see?',
      v: {type:'objectSet', config:{count:2, emoji:'🐊', layout:'line'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}],
      a:1, e:'Count: 1, 2 alligators!', d:'e', s:null, h:'Touch each alligator'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🦒 do you see?',
      v: {type:'objectSet', config:{count:4, emoji:'🦒', layout:'line'}},
      o: [{val:'2',tag:'err_under_count'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'Count: 1, 2, 3, 4 giraffes!', d:'e', s:null, h:'Count left to right'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🐿 do you see?',
      v: {type:'objectSet', config:{count:5, emoji:'🐿', layout:'grid'}},
      o: [{val:'3',tag:'err_under_count'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'Count: 1, 2, 3, 4, 5 squirrels!', d:'e', s:null, h:'Touch each squirrel'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🍇 do you see?',
      v: {type:'objectSet', config:{count:6, emoji:'🍇', layout:'grid'}},
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'Count the grapes: 1, 2, 3, 4, 5, 6!', d:'e', s:null, h:'Count in rows'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🐮 do you see?',
      v: {type:'objectSet', config:{count:7, emoji:'🐮', layout:'grid'}},
      o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'Count carefully: 1, 2, 3, 4, 5, 6, 7!', d:'e', s:null, h:'Go row by row'
    },

    // L1 medium — 5 new questions, counts 7–10, ±1 distractors
    {lessonId:'ku1l1', 
      t: 'How many 🐯 do you see?',
      v: {type:'objectSet', config:{count:7, emoji:'🐯', layout:'grid'}},
      o: [{val:'5',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'7 tigers — count every one!', d:'m', s:null, h:'More than 6!'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🐴 do you see?',
      v: {type:'objectSet', config:{count:8, emoji:'🐴', layout:'grid'}},
      o: [{val:'6',tag:'err_under_count'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'8 horses — go row by row!', d:'m', s:null, h:'There are 8 — count carefully'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🐨 do you see?',
      v: {type:'objectSet', config:{count:9, emoji:'🐨', layout:'grid'}},
      o: [{val:'7',tag:'err_under_count'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
      a:2, e:'9 koalas — count every koala!', d:'m', s:null, h:'More than 8!'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🦅 do you see?',
      v: {type:'objectSet', config:{count:10, emoji:'🦅', layout:'grid'}},
      o: [{val:'8',tag:'err_under_count'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'10 eagles — all the way to 10!', d:'m', s:null, h:'Count every eagle'
    },
    {lessonId:'ku1l1', 
      t: 'Which number comes after 8?',
      v: null,
      o: [{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_over_count'}],
      a:2, e:'9 comes right after 8!', d:'m', s:null, h:'Count up: ...7, 8, ___'
    },

    // L1 hard — 3 new questions, count 9–10 with ±1 distractors + after 9
    {lessonId:'ku1l1', 
      t: 'How many 🦜 do you see?',
      v: {type:'objectSet', config:{count:9, emoji:'🦜', layout:'grid'}},
      o: [{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
      a:2, e:'9 parrots — count every feather!', d:'h', s:null, h:'Is it 8 or 9? Count again!'
    },
    {lessonId:'ku1l1', 
      t: 'How many 🦩 do you see?',
      v: {type:'objectSet', config:{count:10, emoji:'🦩', layout:'grid'}},
      o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'10 flamingos — great counting to 10!', d:'h', s:null, h:'Count every flamingo carefully'
    },
    {lessonId:'ku1l1', 
      t: 'Which number comes after 9?',
      v: null,
      o: [{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_off_by_one'},{val:'10'}],
      a:3, e:'10 comes right after 9!', d:'h', s:null, h:'Count up: ...8, 9, ___'
    },

    // L2 easy — 5 new questions, subitize 1–4
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🐦?',
      v: {type:'objectSet', config:{count:1, emoji:'🐦', layout:'dice'}},
      o: [{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'},{val:'4',tag:'err_subitize'}],
      a:0, e:'Just 1 bird — your brain saw it instantly!', d:'e', s:null, h:'Just one'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🍊?',
      v: {type:'objectSet', config:{count:2, emoji:'🍊', layout:'dice'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
      a:1, e:'2 oranges — one on each side!', d:'e', s:null, h:'Look without counting'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🐸?',
      v: {type:'objectSet', config:{count:3, emoji:'🐸', layout:'dice'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_subitize'}],
      a:1, e:'3 frogs — a diagonal line!', d:'e', s:null, h:'Three in a row'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🌻?',
      v: {type:'objectSet', config:{count:4, emoji:'🌻', layout:'dice'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'2',tag:'err_subitize'}],
      a:1, e:'4 sunflowers — one in each corner!', d:'e', s:null, h:'4 corners = 4'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🐹?',
      v: {type:'objectSet', config:{count:2, emoji:'🐹', layout:'line'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_subitize'}],
      a:1, e:'2 hamsters — you saw both at once!', d:'e', s:null, h:'Look — two hamsters'
    },

    // L2 medium — 4 new questions, subitize 4–6
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🍔?',
      v: {type:'objectSet', config:{count:4, emoji:'🍔', layout:'grid'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_subitize'}],
      a:1, e:'4 burgers — 4 corners!', d:'m', s:null, h:'Is it 3 or 4? Look for corners!'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🎈?',
      v: {type:'objectSet', config:{count:5, emoji:'🎈', layout:'dice'}},
      o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'}],
      a:1, e:'5 balloons — corners plus the middle!', d:'m', s:null, h:'4 around the edge plus 1 center'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🌍?',
      v: {type:'objectSet', config:{count:6, emoji:'🌍', layout:'dice'}},
      o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 globes — two rows of 3!', d:'m', s:null, h:'3 on top, 3 on the bottom'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🍩?',
      v: {type:'objectSet', config:{count:5, emoji:'🍩', layout:'grid'}},
      o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'},{val:'3',tag:'err_subitize'}],
      a:1, e:'5 donuts — 4 corners plus 1 middle!', d:'m', s:null, h:'Is it 4 or 5?'
    },

    // L2 hard — 3 new questions, subitize 5–6 with tricky distractors
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🌮?',
      v: {type:'objectSet', config:{count:6, emoji:'🌮', layout:'grid'}},
      o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 tacos — 2 columns of 3!', d:'h', s:null, h:'Count the columns — how many in each?'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🎯?',
      v: {type:'objectSet', config:{count:5, emoji:'🎯', layout:'grid'}},
      o: [{val:'3',tag:'err_subitize'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'5 targets — corners plus the middle one!', d:'h', s:null, h:'Look for the center one'
    },
    {lessonId:'ku1l2', 
      t: 'Quick Look! How many 🦊?',
      v: {type:'objectSet', config:{count:6, emoji:'🦊', layout:'line'}},
      o: [{val:'4',tag:'err_subitize'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
      a:2, e:'6 foxes in a line — trust your Quick Look!', d:'h', s:null, h:'Is it 5 or 6? Look carefully!'
    },

    // L3 easy — 4 new questions, counts 11–13, after 12
    {lessonId:'ku1l3', 
      t: 'How many 🐝 do you see?',
      v: {type:'objectSet', config:{count:11, emoji:'🐝', layout:'grid'}},
      o: [{val:'9',tag:'err_under_count'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
      a:2, e:'11! Ten and one more!', d:'e', s:null, h:'Count all the way past 10'
    },
    {lessonId:'ku1l3', 
      t: 'How many 🌷 do you see?',
      v: {type:'objectSet', config:{count:12, emoji:'🌷', layout:'grid'}},
      o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
      a:2, e:'12! Ten and two more!', d:'e', s:null, h:'Count past 10'
    },
    {lessonId:'ku1l3', 
      t: 'How many 🦆 do you see?',
      v: {type:'objectSet', config:{count:13, emoji:'🦆', layout:'grid'}},
      o: [{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
      a:2, e:'13! Ten and three more!', d:'e', s:null, h:'Keep counting past 10'
    },
    {lessonId:'ku1l3', 
      t: 'What number comes after 12?',
      v: null,
      o: [{val:'11',tag:'err_off_by_one'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_over_count'}],
      a:2, e:'13 comes right after 12!', d:'e', s:null, h:'Count on from 12: 12, ___'
    },

    // L3 medium — 4 new questions, counts 14–17, sequences, "15 = 10 + ?"
    {lessonId:'ku1l3', 
      t: 'How many 🐡 do you see?',
      v: {type:'objectSet', config:{count:14, emoji:'🐡', layout:'grid'}},
      o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
      a:2, e:'14! Keep counting past 10!', d:'m', s:null, h:'More than 13!'
    },
    {lessonId:'ku1l3', 
      t: 'How many 🦋 do you see?',
      v: {type:'objectSet', config:{count:16, emoji:'🦋', layout:'grid'}},
      o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'16! Count past 15!', d:'m', s:null, h:'More than 15!'
    },
    {lessonId:'ku1l3', 
      t: 'Which number goes in the blank? 14, ___, 16',
      v: null,
      o: [{val:'13',tag:'err_off_by_one'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'15! Count: 14, 15, 16!', d:'m', s:null, h:'What comes between 14 and 16?'
    },
    {lessonId:'ku1l3', 
      t: 'How many more than 10 to make 12?',
      v: null,
      o: [{val:'1',tag:'err_teen'},{val:'2'},{val:'3',tag:'err_teen'},{val:'4',tag:'err_teen'}],
      a:1, e:'12 = 10 + 2 — ten and TWO more!', d:'m', s:null, h:'10 + ___ = 12'
    },

    // L3 hard — 2 new questions, count 18–19, "18 = 10 + ?"
    {lessonId:'ku1l3', 
      t: 'How many 🦁 do you see?',
      v: {type:'objectSet', config:{count:19, emoji:'🦁', layout:'grid'}},
      o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
      a:2, e:'19! One away from 20!', d:'h', s:null, h:'Count carefully past 18!'
    },
    {lessonId:'ku1l3',
      t: 'How many more than 10 to make 18?',
      v: null,
      o: [{val:'7',tag:'err_teen'},{val:'8'},{val:'9',tag:'err_teen'},{val:'10',tag:'err_teen'}],
      a:1, e:'18 = 10 + 8 — ten and EIGHT more!', d:'h', s:null, h:'10 + ___ = 18'
    },

    // ── ku1l4 testBank (migrated from u4.js) ────────────────────────────────
    {lessonId:'ku1l4', t:'What number comes after 13?', v:null,
      o:[{val:'12',tag:'err_under_count'},{val:'13',tag:'err_same'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
      a:2, e:'14 comes after 13!', d:'e', s:null, h:'Count forward from 13'},
    {lessonId:'ku1l4', t:'Count the 🍎 apples. How many?',
      v:{type:'objectSet', config:{count:17, emoji:'🍎', layout:'grid'}},
      o:[{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
      a:2, e:'17 apples!', d:'m', s:null, h:'Count carefully row by row'},
    {lessonId:'ku1l4', t:'19, __, 17 — what number is missing?', v:null,
      o:[{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'18'},{val:'20',tag:'err_same'}],
      a:2, e:'18 goes between 19 and 17 when counting back!', d:'m', s:null, h:'Count backward from 19'},
    {lessonId:'ku1l4', t:'15, 16, __, 18 — what number is missing?', v:null,
      o:[{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'17'},{val:'19',tag:'err_off_by_one'}],
      a:2, e:'17 goes between 16 and 18!', d:'m', s:null, h:'What comes after 16?'},
    {lessonId:'ku1l4', t:'How many 🌈 are there?',
      v:{type:'objectSet', config:{count:11, emoji:'🌈', layout:'grid'}},
      o:[{val:'9',tag:'err_under_count'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
      a:2, e:'11 rainbows!', d:'e', s:null, h:'Count every one'},
    {lessonId:'ku1l4', t:'How many 🎈 balloons do you see?',
      v:{type:'objectSet', config:{count:13, emoji:'🎈', layout:'grid'}},
      o:[{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
      a:2, e:'13 balloons!', d:'e', s:null, h:'Touch each balloon as you count'},
    {lessonId:'ku1l4', t:'What number comes right after 10?', v:null,
      o:[{val:'9',tag:'err_under_count'},{val:'10',tag:'err_same'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
      a:2, e:'11 comes right after 10!', d:'e', s:null, h:'Count on one step from 10'},
    {lessonId:'ku1l4', t:'How many 🦄 are in the group?',
      v:{type:'objectSet', config:{count:14, emoji:'🦄', layout:'grid'}},
      o:[{val:'12',tag:'err_under_count'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
      a:2, e:'14 unicorns!', d:'m', s:null, h:'Count row by row'},
    {lessonId:'ku1l4', t:'How many 🌍 do you see?',
      v:{type:'objectSet', config:{count:16, emoji:'🌍', layout:'grid'}},
      o:[{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'16 globes!', d:'m', s:null, h:'Count carefully past 15'},
    {lessonId:'ku1l4', t:'12, 13, __, 15 — what number is missing?', v:null,
      o:[{val:'11',tag:'err_under_count'},{val:'13',tag:'err_same'},{val:'14'},{val:'16',tag:'err_off_by_one'}],
      a:2, e:'14 goes between 13 and 15!', d:'m', s:null, h:'What comes after 13?'},
    {lessonId:'ku1l4', t:'What number comes before 14?', v:null,
      o:[{val:'12',tag:'err_under_count'},{val:'13'},{val:'14',tag:'err_same'},{val:'15',tag:'err_off_by_one'}],
      a:1, e:'13 comes before 14!', d:'m', s:null, h:'Count back one step from 14'},
    {lessonId:'ku1l4', t:'13, 14, 15, __, 17 — what number is missing?', v:null,
      o:[{val:'14',tag:'err_under_count'},{val:'15',tag:'err_same'},{val:'16'},{val:'18',tag:'err_off_by_one'}],
      a:2, e:'16 goes between 15 and 17!', d:'m', s:null, h:'What comes after 15?'},
    {lessonId:'ku1l4', t:'How many 🐗 are there?',
      v:{type:'objectSet', config:{count:17, emoji:'🐗', layout:'grid'}},
      o:[{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'},{val:'15',tag:'err_under_count'}],
      a:1, e:'17 boars — count every one!', d:'h', s:null, h:'Count carefully — do not miss any'},
    {lessonId:'ku1l4', t:'How many 🎯 targets are here?',
      v:{type:'objectSet', config:{count:20, emoji:'🎯', layout:'grid'}},
      o:[{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}],
      a:2, e:'20 targets — all the way to 20!', d:'h', s:null, h:'Count all the way to the end'},
    {lessonId:'ku1l4', t:'17, 18, 19, __ — what comes next?', v:null,
      o:[{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}],
      a:2, e:'20 comes after 19!', d:'h', s:null, h:'Count forward from 19'},
    {lessonId:'ku1l4', t:'20, 19, __, 17 — what is missing counting back?', v:null,
      o:[{val:'17',tag:'err_same'},{val:'18'},{val:'19',tag:'err_off_by_one'},{val:'20',tag:'err_same'}],
      a:1, e:'18 goes between 19 and 17 when counting back!', d:'h', s:null, h:'Count backward from 19'},

    // ── ku1l5 testBank (migrated from u4.js) ────────────────────────────────
    {lessonId:'ku1l5', t:'Count the 🌟 stars. How many?',
      v:{type:'objectSet', config:{count:15, emoji:'🌟', layout:'grid'}},
      o:[{val:'13',tag:'err_teen'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
      a:2, e:'15 stars — ten and five more!', d:'e', s:null, h:'Count past 10'},
    {lessonId:'ku1l5', t:'11 = 10 + how many extras?',
      v:{type:'objectSet', config:{count:11, emoji:'🌙', layout:'grid'}},
      o:[{val:'0',tag:'err_teen'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'11',tag:'err_teen'}],
      a:1, e:'11 = 10 + 1!', d:'e', s:null, h:'Count past the first 10'},
    {lessonId:'ku1l5', t:'Which number is "fourteen"?', v:null,
      o:[{val:'4',tag:'err_teen'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'40',tag:'err_teen'}],
      a:2, e:'Fourteen = 14!', d:'m', s:null, h:'Fourteen: ten and four more'},
    {lessonId:'ku1l5', t:'17 = 10 + how many extras?', v:null,
      o:[{val:'5',tag:'err_teen'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'17 = 10 + 7!', d:'m', s:null, h:'How many beyond 10?'},
    {lessonId:'ku1l5', t:'13 = 10 + how many extras? Count the 🌴.',
      v:{type:'objectSet', config:{count:13, emoji:'🌴', layout:'grid'}},
      o:[{val:'1',tag:'err_teen'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'13 = 10 + 3!', d:'e', s:null, h:'Count past 10 to 13'},
    {lessonId:'ku1l5', t:'Which numeral is "thirteen"?', v:null,
      o:[{val:'3',tag:'err_teen'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'30',tag:'err_teen'}],
      a:2, e:'Thirteen = 13!', d:'e', s:null, h:'Thirteen: ten and three more'},
    {lessonId:'ku1l5', t:'12 = 10 + how many extras? Count the 🍭.',
      v:{type:'objectSet', config:{count:12, emoji:'🍭', layout:'grid'}},
      o:[{val:'0',tag:'err_teen'},{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'}],
      a:2, e:'12 = 10 + 2!', d:'e', s:null, h:'Count how many come after 10'},
    {lessonId:'ku1l5', t:'How many 🌮 are there?',
      v:{type:'objectSet', config:{count:14, emoji:'🌮', layout:'grid'}},
      o:[{val:'12',tag:'err_teen'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
      a:2, e:'14 tacos — ten and four more!', d:'m', s:null, h:'Count past 10'},
    {lessonId:'ku1l5', t:'How many 🐘 elephants are here?',
      v:{type:'objectSet', config:{count:16, emoji:'🐘', layout:'grid'}},
      o:[{val:'14',tag:'err_teen'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'16 elephants — ten and six more!', d:'m', s:null, h:'Count carefully past 15'},
    {lessonId:'ku1l5', t:'Which number is "sixteen"?', v:null,
      o:[{val:'6',tag:'err_teen'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
      a:2, e:'Sixteen = 16!', d:'m', s:null, h:'Sixteen: ten and six more'},
    {lessonId:'ku1l5', t:'15 = 10 + how many extras?', v:null,
      o:[{val:'3',tag:'err_teen'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'15 = 10 + 5!', d:'m', s:null, h:'Count how many beyond 10'},
    {lessonId:'ku1l5', t:'How many 🌾 are in the group?',
      v:{type:'objectSet', config:{count:15, emoji:'🌾', layout:'grid'}},
      o:[{val:'13',tag:'err_teen'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
      a:2, e:'15 wheat stalks — ten and five more!', d:'m', s:null, h:'Count every stalk'},
    {lessonId:'ku1l5', t:'18 = 10 + how many extras?', v:null,
      o:[{val:'6',tag:'err_teen'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'18 = 10 + 8!', d:'h', s:null, h:'Count how many beyond 10'},
    {lessonId:'ku1l5', t:'How many 🦚 peacocks are here?',
      v:{type:'objectSet', config:{count:18, emoji:'🦚', layout:'grid'}},
      o:[{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'},{val:'16',tag:'err_under_count'}],
      a:1, e:'18 peacocks — count every one!', d:'h', s:null, h:'Count carefully — close numbers!'},
    {lessonId:'ku1l5', t:'Which number is "nineteen"?', v:null,
      o:[{val:'9',tag:'err_teen'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
      a:2, e:'Nineteen = 19!', d:'h', s:null, h:'Nineteen: ten and nine more'}
  ]
});
