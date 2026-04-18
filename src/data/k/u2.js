// Kindergarten Unit 2: Number Relationships
// Lazy-loaded as /data/k/u2.js
// Calls _mergeKUnitData — available globally from shared_k.js in the app bundle.
_mergeKUnitData(1, {
  lessons: [

    // ── L1: One More, One Less (ku2l1) ──────────────────────────────────────
    {
      points: [
        "ONE MORE means the next number when you count forward",
        "ONE LESS means the number that comes just before",
        "To find one more: count up 1.  To find one less: count back 1"
      ],

      examples: [
        {
          c: '#f59e0b',
          tag: 'One More',
          p: 'There are 3 🐶. One more dog joins the group.',
          v: {type:'objectSet', config:{count:3, emoji:'🐶', layout:'line'}},
          s: '3 dogs … then 1 MORE joins\n3 → 4',
          a: 'One more than 3 is 4 ✅'
        },
        {
          c: '#d97706',
          tag: 'One Less',
          p: 'There are 5 🐱. One cat walks away.',
          v: {type:'objectSet', config:{count:5, emoji:'🐱', layout:'line'}},
          s: '5 cats … then 1 walks away\n5 → 4',
          a: 'One less than 5 is 4 ✅'
        },
        {
          c: '#b45309',
          tag: 'One More — bigger number',
          p: 'A group of 7 🐴. One more horse arrives.',
          v: {type:'objectSet', config:{count:7, emoji:'🐴', layout:'grid'}},
          s: '7 horses … then 1 MORE arrives\n7 → 8',
          a: 'One more than 7 is 8 ✅'
        }
      ],

      practice: [
        {q:'One more than 4 is ___.', a:'5', h:'Count on from 4: 4, ___', e:'5! One more means the next number! ⭐'},
        {q:'One less than 6 is ___.', a:'5', h:'Count back from 6: 6, ___', e:'5! One less is the number just before! 🌟'},
        {q:'One more than 9 is ___.', a:'10', h:'What number comes right after 9?', e:'10! You counted all the way to 10! 🎉'}
      ],

      qBank: [
        // Easy — one more, counts 1–5
        {t:'One more than 1 🐶 is how many?',  v:{type:'objectSet',config:{count:1,emoji:'🐶',layout:'line'}}, o:[{val:'1',tag:'err_same'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}], a:1, e:'1 + 1 more = 2!', d:'e', s:null, h:'Count the dog, then add one more'},
        {t:'One more than 2 🐱 is how many?',  v:{type:'objectSet',config:{count:2,emoji:'🐱',layout:'line'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_same'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'2 + 1 more = 3!', d:'e', s:null, h:'Count on from 2'},
        {t:'One more than 3 🐰 is how many?',  v:{type:'objectSet',config:{count:3,emoji:'🐰',layout:'line'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_same'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'3 + 1 more = 4!', d:'e', s:null, h:'Count on from 3'},
        {t:'One more than 4 🐯 is how many?',  v:{type:'objectSet',config:{count:4,emoji:'🐯',layout:'line'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_same'},{val:'5'},{val:'6',tag:'err_off_by_one'}], a:2, e:'4 + 1 more = 5!', d:'e', s:null, h:'Count on from 4'},
        {t:'One more than 5 🦊 is how many?',  v:{type:'objectSet',config:{count:5,emoji:'🦊',layout:'line'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_same'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'5 + 1 more = 6!', d:'e', s:null, h:'Count on from 5'},
        // Easy — one less, counts 2–4
        {t:'One less than 2 🐷 is how many?',  v:{type:'objectSet',config:{count:2,emoji:'🐷',layout:'line'}}, o:[{val:'1'},{val:'2',tag:'err_same'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}], a:0, e:'2 take away 1 = 1!', d:'e', s:null, h:'Count back from 2'},
        {t:'One less than 3 🧸 is how many?',  v:{type:'objectSet',config:{count:3,emoji:'🧸',layout:'line'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_same'},{val:'4',tag:'err_off_by_one'}], a:1, e:'3 take away 1 = 2!', d:'e', s:null, h:'Count back from 3'},
        {t:'One less than 4 🦆 is how many?',  v:{type:'objectSet',config:{count:4,emoji:'🦆',layout:'line'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_same'},{val:'5',tag:'err_off_by_one'}], a:1, e:'4 take away 1 = 3!', d:'e', s:null, h:'Count back from 4'},
        // Medium — one more, counts 6 and 8
        {t:'One more than 6 🍊 is how many?',  v:{type:'objectSet',config:{count:6,emoji:'🍊',layout:'grid'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_same'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'6 + 1 more = 7!', d:'m', s:null, h:'Count on one more from 6'},
        {t:'One more than 8 🍋 is how many?',  v:{type:'objectSet',config:{count:8,emoji:'🍋',layout:'grid'}}, o:[{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_same'},{val:'9'},{val:'10',tag:'err_off_by_one'}], a:2, e:'8 + 1 more = 9!', d:'m', s:null, h:'Count on one more from 8'},
        // Medium — one less, counts 7 and 9
        {t:'One less than 7 🍇 is how many?',  v:{type:'objectSet',config:{count:7,emoji:'🍇',layout:'grid'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_same'},{val:'8',tag:'err_off_by_one'}], a:1, e:'7 take away 1 = 6!', d:'m', s:null, h:'Count back one from 7'},
        {t:'One less than 9 🍒 is how many?',  v:{type:'objectSet',config:{count:9,emoji:'🍒',layout:'grid'}}, o:[{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_same'},{val:'10',tag:'err_off_by_one'}], a:1, e:'9 take away 1 = 8!', d:'m', s:null, h:'Count back one from 9'},
        {t:'One less than 8 🐻 is how many?',  v:{type:'objectSet',config:{count:8,emoji:'🐻',layout:'grid'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_same'},{val:'9',tag:'err_off_by_one'}], a:1, e:'8 take away 1 = 7!', d:'m', s:null, h:'Count back one from 8'},
        {t:'One more than 9 🐼 is how many?',  v:{type:'objectSet',config:{count:9,emoji:'🐼',layout:'grid'}}, o:[{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_same'},{val:'10'},{val:'11',tag:'err_off_by_one'}], a:2, e:'9 + 1 more = 10!', d:'m', s:null, h:'Count on from 9 — you reach 10!'},
        {t:'One less than 10 🐮 is how many?', v:{type:'objectSet',config:{count:10,emoji:'🐮',layout:'grid'}}, o:[{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_same'},{val:'11',tag:'err_off_by_one'}], a:1, e:'10 take away 1 = 9!', d:'m', s:null, h:'Count back one from 10'},
        // NEW — Easy: one more/less for small numbers 1–4
        {t:'One more than 1 🦁 is how many?',  v:{type:'objectSet',config:{count:1,emoji:'🦁',layout:'line'}}, o:[{val:'1',tag:'err_same'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}], a:1, e:'1 + 1 more = 2!', d:'e', s:null, h:'Count the lion, then add one more'},
        {t:'One less than 4 🐙 is how many?',  v:{type:'objectSet',config:{count:4,emoji:'🐙',layout:'line'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_same'},{val:'5',tag:'err_off_by_one'}], a:1, e:'4 take away 1 = 3!', d:'e', s:null, h:'Count back from 4'},
        {t:'One more than 2 🎃 is how many?',  v:{type:'objectSet',config:{count:2,emoji:'🎃',layout:'line'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_same'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'2 + 1 more = 3!', d:'e', s:null, h:'Count on from 2'},
        // NEW — Medium: one more/less for 5–8
        {t:'One more than 5 🦋 is how many?',  v:{type:'objectSet',config:{count:5,emoji:'🦋',layout:'grid'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_same'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'5 + 1 more = 6!', d:'m', s:null, h:'Count on one more from 5'},
        {t:'One less than 7 🐸 is how many?',  v:{type:'objectSet',config:{count:7,emoji:'🐸',layout:'grid'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_same'},{val:'8',tag:'err_off_by_one'}], a:1, e:'7 take away 1 = 6!', d:'m', s:null, h:'Count back one from 7'},
        {t:'One more than 6 🌸 is how many?',  v:{type:'objectSet',config:{count:6,emoji:'🌸',layout:'grid'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_same'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'6 + 1 more = 7!', d:'m', s:null, h:'Count on one more from 6'},
        {t:'One less than 8 🎈 is how many?',  v:{type:'objectSet',config:{count:8,emoji:'🎈',layout:'grid'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_same'},{val:'9',tag:'err_off_by_one'}], a:1, e:'8 take away 1 = 7!', d:'m', s:null, h:'Count back one from 8'},
        {t:'One more than 7 🦊 is how many?',  v:{type:'objectSet',config:{count:7,emoji:'🦊',layout:'grid'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_same'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'7 + 1 more = 8!', d:'m', s:null, h:'Count on one more from 7'},
        // NEW — Hard: one more/less for 9–10, all ±1 distractors
        {t:'One more than 9 🦄 is how many?',  v:{type:'objectSet',config:{count:9,emoji:'🦄',layout:'grid'}}, o:[{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_same'},{val:'10'},{val:'11',tag:'err_off_by_one'}], a:2, e:'9 + 1 more = 10!', d:'h', s:null, h:'What number comes right after 9?'},
        {t:'One less than 10 🌈 is how many?', v:{type:'objectSet',config:{count:10,emoji:'🌈',layout:'grid'}}, o:[{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_same'},{val:'11',tag:'err_off_by_one'}], a:1, e:'10 take away 1 = 9!', d:'h', s:null, h:'Count back one step from 10'},
        {t:'One more than 10 🦁 is how many?', v:{type:'objectSet',config:{count:10,emoji:'🦁',layout:'grid'}}, o:[{val:'9',tag:'err_off_by_one'},{val:'10',tag:'err_same'},{val:'11'},{val:'12',tag:'err_off_by_one'}], a:2, e:'10 + 1 more = 11!', d:'h', s:null, h:'Count on one more from 10'},
        {t:'One less than 9 🎃 is how many?',  v:{type:'objectSet',config:{count:9,emoji:'🎃',layout:'grid'}}, o:[{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_same'},{val:'10',tag:'err_off_by_one'}], a:1, e:'9 take away 1 = 8!', d:'h', s:null, h:'Count back one step from 9'},
        {t:'One more than 10 🐙 is how many?', v:{type:'objectSet',config:{count:10,emoji:'🐙',layout:'grid'}}, o:[{val:'9',tag:'err_off_by_one'},{val:'10',tag:'err_same'},{val:'11'},{val:'12',tag:'err_off_by_one'}], a:2, e:'10 + 1 more = 11!', d:'h', s:null, h:'Count on from 10 — what comes next?'}
      ]
    },

    // ── L2: Compare Sets (ku2l2) ──────────────────────────────────────────────
    {
      points: [
        "MORE means a bigger group — it has a higher number",
        "FEWER means a smaller group — it has a lower number",
        "SAME (equal) means both groups have exactly the same count"
      ],

      examples: [
        {
          c: '#8b5cf6',
          tag: 'Which Has More',
          p: 'Which group has more — 2 🌷 or 5 🌻?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🌷', rightCount:5, rightObj:'🌻', op:'compare'}},
          s: 'Count: 2 tulips … 5 sunflowers\n5 > 2 — the sunflowers have more!',
          a: 'The 🌻 sunflowers have more ✅'
        },
        {
          c: '#6d28d9',
          tag: 'Which Has Fewer',
          p: 'Which group has fewer — 4 🥕 or 2 🧩?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🥕', rightCount:2, rightObj:'🧩', op:'compare'}},
          s: 'Count: 4 carrots … 2 puzzles\n2 < 4 — the puzzles are fewer!',
          a: 'The 🧩 puzzles have fewer ✅'
        },
        {
          c: '#4c1d95',
          tag: 'Same Amount',
          p: 'Do these groups have the same amount? 3 🐶 and 3 🐱',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐶', rightCount:3, rightObj:'🐱', op:'compare'}},
          s: 'Count: 3 dogs … 3 cats\nBoth groups = 3. They match!',
          a: 'Same! Both have 3 ✅'
        }
      ],

      practice: [
        {q:'Which is more: 3 or 7?',   a:'7',   h:'Count both — which number is bigger?', e:'7! Seven is more than three! 🎉'},
        {q:'Which is fewer: 5 or 2?',  a:'2',   h:'Which number is smaller?',             e:'2! Two is fewer than five! ⭐'},
        {q:'Are 4 and 4 the same?',    a:'yes', h:'Count each — do they match?',           e:'Yes! 4 and 4 are the same! 🌟'}
      ],

      qBank: [
        // Easy — more, big gap
        {t:'Which shows more: 2 🌷 or 6 🌻?',       v:{type:'twoGroups',config:{leftCount:2,leftObj:'🌷',rightCount:6,rightObj:'🌻',op:'compare'}}, o:[{val:'2',tag:'err_less'},{val:'6'},{val:'4',tag:'err_random'},{val:'8',tag:'err_random'}], a:1, e:'6 is more than 2!', d:'e', s:null, h:'Count each group — which is bigger?'},
        {t:'Which shows more: 1 🐶 or 5 🐱?',       v:{type:'twoGroups',config:{leftCount:1,leftObj:'🐶',rightCount:5,rightObj:'🐱',op:'compare'}}, o:[{val:'1',tag:'err_less'},{val:'3',tag:'err_random'},{val:'5'},{val:'6',tag:'err_random'}], a:2, e:'5 is more than 1!', d:'e', s:null, h:'Which group has more?'},
        {t:'Which shows more: 3 🥕 or 7 🧩?',       v:{type:'twoGroups',config:{leftCount:3,leftObj:'🥕',rightCount:7,rightObj:'🧩',op:'compare'}}, o:[{val:'3',tag:'err_less'},{val:'5',tag:'err_random'},{val:'7'},{val:'9',tag:'err_random'}], a:2, e:'7 is more than 3!', d:'e', s:null, h:'Count: which is bigger?'},
        // Easy — fewer, big gap
        {t:'Which shows fewer: 2 🐰 or 8 🐯?',      v:{type:'twoGroups',config:{leftCount:2,leftObj:'🐰',rightCount:8,rightObj:'🐯',op:'compare'}}, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'8',tag:'err_more'},{val:'4',tag:'err_random'}], a:1, e:'2 is fewer than 8!', d:'e', s:null, h:'Fewer means the smaller number'},
        {t:'Which shows fewer: 4 🦊 or 1 🐴?',      v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦊',rightCount:1,rightObj:'🐴',op:'compare'}}, o:[{val:'4',tag:'err_more'},{val:'1'},{val:'3',tag:'err_random'},{val:'5',tag:'err_random'}], a:1, e:'1 is fewer than 4!', d:'e', s:null, h:'Which group is smaller?'},
        // Medium — smaller differences
        {t:'Which shows more: 4 🌷 or 6 🌻?',       v:{type:'twoGroups',config:{leftCount:4,leftObj:'🌷',rightCount:6,rightObj:'🌻',op:'compare'}}, o:[{val:'4',tag:'err_less'},{val:'5',tag:'err_random'},{val:'6'},{val:'7',tag:'err_random'}], a:2, e:'6 is more than 4!', d:'m', s:null, h:'Count carefully — these are close!'},
        {t:'Which shows fewer: 5 🐷 or 3 🧸?',      v:{type:'twoGroups',config:{leftCount:5,leftObj:'🐷',rightCount:3,rightObj:'🧸',op:'compare'}}, o:[{val:'2',tag:'err_random'},{val:'3'},{val:'5',tag:'err_more'},{val:'6',tag:'err_random'}], a:1, e:'3 is fewer than 5!', d:'m', s:null, h:'Fewer means smaller count'},
        {t:'Which shows more: 7 🦆 or 5 🍊?',       v:{type:'twoGroups',config:{leftCount:7,leftObj:'🦆',rightCount:5,rightObj:'🍊',op:'compare'}}, o:[{val:'5',tag:'err_less'},{val:'6',tag:'err_random'},{val:'7'},{val:'8',tag:'err_random'}], a:2, e:'7 is more than 5!', d:'m', s:null, h:'Which number is bigger?'},
        // Medium — same/equal
        {t:'Do 3 🍇 and 3 🍒 show the same amount?', v:{type:'twoGroups',config:{leftCount:3,leftObj:'🍇',rightCount:3,rightObj:'🍒',op:'compare'}}, o:[{val:'yes — same'},{val:'no — grapes more',tag:'err_not_equal'},{val:'no — cherries more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Both groups have 3 — they\'re the same!', d:'m', s:null, h:'Count each group — do they match?'},
        {t:'Do 5 🐶 and 4 🐱 show the same amount?', v:{type:'twoGroups',config:{leftCount:5,leftObj:'🐶',rightCount:4,rightObj:'🐱',op:'compare'}}, o:[{val:'yes — same',tag:'err_not_equal'},{val:'no — dogs more'},{val:'no — cats more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:1, e:'5 dogs is more than 4 cats — not the same!', d:'m', s:null, h:'5 and 4 — do these numbers match?'},
        {t:'Which shows fewer: 6 🥕 or 9 🧩?',      v:{type:'twoGroups',config:{leftCount:6,leftObj:'🥕',rightCount:9,rightObj:'🧩',op:'compare'}}, o:[{val:'5',tag:'err_random'},{val:'6'},{val:'9',tag:'err_more'},{val:'7',tag:'err_random'}], a:1, e:'6 is fewer than 9!', d:'m', s:null, h:'Count carefully — which is smaller?'},
        {t:'Do 7 🌷 and 7 🌻 show the same amount?', v:{type:'twoGroups',config:{leftCount:7,leftObj:'🌷',rightCount:7,rightObj:'🌻',op:'compare'}}, o:[{val:'yes — same'},{val:'no — tulips more',tag:'err_not_equal'},{val:'no — sunflowers more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Both groups have 7 — same!', d:'m', s:null, h:'Count each carefully: 7 and 7'},
        // NEW — Easy: big-gap comparisons
        {t:'Which shows more: 2 🦁 or 8 🐊?',       v:{type:'twoGroups',config:{leftCount:2,leftObj:'🦁',rightCount:8,rightObj:'🐊',op:'compare'}}, o:[{val:'2',tag:'err_less'},{val:'5',tag:'err_random'},{val:'8'},{val:'9',tag:'err_random'}], a:2, e:'8 is more than 2!', d:'e', s:null, h:'Count each group — which is bigger?'},
        {t:'Which shows fewer: 1 🦓 or 6 🦒?',      v:{type:'twoGroups',config:{leftCount:1,leftObj:'🦓',rightCount:6,rightObj:'🦒',op:'compare'}}, o:[{val:'1'},{val:'3',tag:'err_random'},{val:'6',tag:'err_more'},{val:'7',tag:'err_random'}], a:0, e:'1 is fewer than 6!', d:'e', s:null, h:'Fewer means the smaller group'},
        {t:'Which shows more: 1 🐊 or 7 🦕?',       v:{type:'twoGroups',config:{leftCount:1,leftObj:'🐊',rightCount:7,rightObj:'🦕',op:'compare'}}, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'7'},{val:'8',tag:'err_random'}], a:2, e:'7 is more than 1!', d:'e', s:null, h:'Count each — which group is bigger?'},
        {t:'Which shows fewer: 3 🦏 or 9 🦛?',      v:{type:'twoGroups',config:{leftCount:3,leftObj:'🦏',rightCount:9,rightObj:'🦛',op:'compare'}}, o:[{val:'2',tag:'err_random'},{val:'3'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1, e:'3 is fewer than 9!', d:'e', s:null, h:'Which group has fewer?'},
        // NEW — Medium: smaller-gap comparisons 4–7 range
        {t:'Which shows more: 4 🦋 or 6 🐸?',       v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦋',rightCount:6,rightObj:'🐸',op:'compare'}}, o:[{val:'4',tag:'err_less'},{val:'5',tag:'err_random'},{val:'6'},{val:'7',tag:'err_random'}], a:2, e:'6 is more than 4!', d:'m', s:null, h:'Count carefully — which group is bigger?'},
        {t:'Which shows fewer: 4 🌸 or 7 🎈?',      v:{type:'twoGroups',config:{leftCount:4,leftObj:'🌸',rightCount:7,rightObj:'🎈',op:'compare'}}, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'7',tag:'err_more'},{val:'8',tag:'err_random'}], a:1, e:'4 is fewer than 7!', d:'m', s:null, h:'Which group has fewer?'},
        {t:'Which shows more: 5 🦁 or 7 🐊?',       v:{type:'twoGroups',config:{leftCount:5,leftObj:'🦁',rightCount:7,rightObj:'🐊',op:'compare'}}, o:[{val:'5',tag:'err_less'},{val:'6',tag:'err_random'},{val:'7'},{val:'8',tag:'err_random'}], a:2, e:'7 is more than 5!', d:'m', s:null, h:'Count carefully — which is bigger?'},
        {t:'Do 4 🦓 and 4 🦒 show the same amount?', v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦓',rightCount:4,rightObj:'🦒',op:'compare'}}, o:[{val:'yes — same'},{val:'no — zebras more',tag:'err_not_equal'},{val:'no — giraffes more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Both groups have 4 — same!', d:'m', s:null, h:'Count each: 4 and 4 — do they match?'},
        {t:'Do 6 🐊 and 6 🦕 show the same amount?', v:{type:'twoGroups',config:{leftCount:6,leftObj:'🐊',rightCount:6,rightObj:'🦕',op:'compare'}}, o:[{val:'yes — same'},{val:'no — crocs more',tag:'err_not_equal'},{val:'no — dinos more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Both groups have 6 — same!', d:'m', s:null, h:'Count each carefully: 6 and 6'},
        // NEW — Hard: counts differing by exactly 1
        {t:'Which shows more: 7 🦁 or 8 🐊?',       v:{type:'twoGroups',config:{leftCount:7,leftObj:'🦁',rightCount:8,rightObj:'🐊',op:'compare'}}, o:[{val:'6',tag:'err_less'},{val:'7',tag:'err_less'},{val:'8'},{val:'9',tag:'err_more'}], a:2, e:'8 is more than 7 — just by 1!', d:'h', s:null, h:'These are very close — count each carefully'},
        {t:'Which shows fewer: 6 🦋 or 7 🐸?',      v:{type:'twoGroups',config:{leftCount:6,leftObj:'🦋',rightCount:7,rightObj:'🐸',op:'compare'}}, o:[{val:'5',tag:'err_less'},{val:'6'},{val:'7',tag:'err_more'},{val:'8',tag:'err_more'}], a:1, e:'6 is fewer than 7 — just by 1!', d:'h', s:null, h:'Count carefully — which is smaller?'},
        {t:'Which shows more: 8 🌸 or 9 🎈?',       v:{type:'twoGroups',config:{leftCount:8,leftObj:'🌸',rightCount:9,rightObj:'🎈',op:'compare'}}, o:[{val:'7',tag:'err_less'},{val:'8',tag:'err_less'},{val:'9'},{val:'10',tag:'err_more'}], a:2, e:'9 is more than 8 — just by 1!', d:'h', s:null, h:'These are very close — count each one'},
        {t:'Which shows fewer: 9 🦏 or 10 🦛?',     v:{type:'twoGroups',config:{leftCount:9,leftObj:'🦏',rightCount:10,rightObj:'🦛',op:'compare'}}, o:[{val:'8',tag:'err_less'},{val:'9'},{val:'10',tag:'err_more'},{val:'11',tag:'err_more'}], a:1, e:'9 is fewer than 10 — just by 1!', d:'h', s:null, h:'Count each carefully — very close!'},
        {t:'Which shows more: 10 🦁 or 11 🦒?',     v:{type:'twoGroups',config:{leftCount:10,leftObj:'🦁',rightCount:11,rightObj:'🦒',op:'compare'}}, o:[{val:'9',tag:'err_less'},{val:'10',tag:'err_less'},{val:'11'},{val:'12',tag:'err_more'}], a:2, e:'11 is more than 10 — just by 1!', d:'h', s:null, h:'Count each group — which has one more?'}
      ]
    },

    // ── L3: Compare Numbers (ku2l3) ───────────────────────────────────────────
    {
      points: [
        "GREATER THAN means a bigger number (8 is greater than 5)",
        "LESS THAN means a smaller number (3 is less than 7)",
        "EQUAL means the same number (4 = 4)"
      ],

      examples: [
        {
          c: '#059669',
          tag: 'Greater Than',
          p: 'Which is greater: 3 or 8?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐶', rightCount:8, rightObj:'🐱', op:'compare'}},
          s: 'Count: 3 and 8\n8 is bigger — 8 is greater than 3!',
          a: '8 is greater than 3 ✅'
        },
        {
          c: '#047857',
          tag: 'Less Than',
          p: 'Which is less: 2 or 7?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🌷', rightCount:7, rightObj:'🌻', op:'compare'}},
          s: 'Count: 2 and 7\n2 is smaller — 2 is less than 7!',
          a: '2 is less than 7 ✅'
        },
        {
          c: '#065f46',
          tag: 'Equal',
          p: 'Are 5 and 5 equal?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🥕', rightCount:5, rightObj:'🧩', op:'compare'}},
          s: 'Count: 5 and 5\nBoth are 5 — they are equal!',
          a: '5 equals 5 ✅'
        }
      ],

      practice: [
        {q:'Which is greater: 4 or 9?',  a:'9',   h:'Count to 9 — it comes after 4!', e:'9! Nine is greater than four! ⭐'},
        {q:'Which is less: 8 or 3?',     a:'3',   h:'Which number is smaller?',        e:'3! Three is less than eight! 🌟'},
        {q:'Is 6 equal to 6?',           a:'yes', h:'Are both numbers the same?',      e:'Yes! Six equals six! 🎉'}
      ],

      qBank: [
        // Easy — greater than, clear gap
        {t:'Which is greater: 2 or 8?',  v:null, o:[{val:'2',tag:'err_less'},{val:'4',tag:'err_random'},{val:'8'},{val:'10',tag:'err_random'}], a:2, e:'8 is greater than 2!', d:'e', s:null, h:'8 is bigger — it comes later when you count'},
        {t:'Which is greater: 1 or 6?',  v:null, o:[{val:'1',tag:'err_less'},{val:'3',tag:'err_random'},{val:'6'},{val:'9',tag:'err_random'}], a:2, e:'6 is greater than 1!', d:'e', s:null, h:'6 comes after 1 when counting'},
        {t:'Which is greater: 3 or 9?',  v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'7',tag:'err_random'},{val:'9'}],   a:3, e:'9 is greater than 3!', d:'e', s:null, h:'Which number is bigger?'},
        // Easy — less than, clear gap
        {t:'Which is less: 7 or 2?',     v:null, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'5',tag:'err_random'},{val:'7',tag:'err_more'}], a:1, e:'2 is less than 7!', d:'e', s:null, h:'2 is smaller'},
        {t:'Which is less: 5 or 9?',     v:null, o:[{val:'3',tag:'err_random'},{val:'5'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1, e:'5 is less than 9!', d:'e', s:null, h:'Which number is smaller?'},
        {t:'Which is less: 4 or 1?',     v:null, o:[{val:'1'},{val:'2',tag:'err_random'},{val:'4',tag:'err_more'},{val:'6',tag:'err_random'}], a:0, e:'1 is less than 4!', d:'e', s:null, h:'1 comes before 4 when counting'},
        // Medium — closer numbers
        {t:'Which is greater: 5 or 7?',  v:null, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'7'},{val:'8',tag:'err_random'}], a:2, e:'7 is greater than 5!', d:'m', s:null, h:'These are close — which comes later?'},
        {t:'Which is less: 6 or 8?',     v:null, o:[{val:'4',tag:'err_random'},{val:'6'},{val:'8',tag:'err_more'},{val:'9',tag:'err_random'}], a:1, e:'6 is less than 8!', d:'m', s:null, h:'6 and 8 — which is smaller?'},
        {t:'Which is greater: 4 or 6?',  v:null, o:[{val:'3',tag:'err_random'},{val:'4',tag:'err_less'},{val:'6'},{val:'7',tag:'err_random'}], a:2, e:'6 is greater than 4!', d:'m', s:null, h:'4 or 6 — which comes later?'},
        // Medium — equal
        {t:'Is 5 greater than, less than, or equal to 5?', v:null, o:[{val:'greater than',tag:'err_not_equal'},{val:'less than',tag:'err_not_equal'},{val:'equal to'},{val:'not sure',tag:'err_confused'}], a:2, e:'5 = 5 — they are equal!', d:'m', s:null, h:'Are both numbers the same?'},
        {t:'Which is greater: 1 or 8?',  v:null, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'8'},{val:'9',tag:'err_random'}], a:2, e:'8 is greater than 1!', d:'e', s:null, h:'8 comes much later when you count'},
        {t:'Which is less: 3 or 6?',     v:null, o:[{val:'1',tag:'err_random'},{val:'3'},{val:'6',tag:'err_more'},{val:'8',tag:'err_random'}], a:1, e:'3 is less than 6!', d:'e', s:null, h:'Which number is smaller?'},
        {t:'Which is less: 2 or 9?',     v:null, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1, e:'2 is less than 9!', d:'e', s:null, h:'2 comes before 9 when counting'},
        {t:'Are 4 and 4 equal?',         v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'4 = 4 — they are equal!', d:'e', s:null, h:'Count each — are they the same?'},
        {t:'Which is greater: 6 or 9?',  v:null, o:[{val:'5',tag:'err_random'},{val:'6',tag:'err_less'},{val:'9'},{val:'10',tag:'err_random'}], a:2, e:'9 is greater than 6!', d:'m', s:null, h:'6 and 9 — which comes later?'},
        {t:'Are 6 and 7 equal?',         v:null, o:[{val:'yes — equal',tag:'err_not_equal'},{val:'no — 6 is less'},{val:'no — 7 is less',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:1, e:'6 and 7 are not equal — 6 is less!', d:'m', s:null, h:'Count: 6 and 7 — do they match?'},
        // NEW — Easy: clear gaps, fresh number pairs
        {t:'Which is greater: 2 or 7?',  v:null, o:[{val:'1',tag:'err_random'},{val:'2',tag:'err_less'},{val:'7'},{val:'9',tag:'err_random'}], a:2, e:'7 is greater than 2!', d:'e', s:null, h:'7 comes after 2 when counting'},
        {t:'Which is less: 9 or 4?',     v:null, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1, e:'4 is less than 9!', d:'e', s:null, h:'Which number is smaller?'},
        {t:'Is 3 equal to 3?',           v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'3 = 3 — they are equal!', d:'e', s:null, h:'Both say 3 — are they the same?'},
        // NEW — Medium: 4 vs 7, 5 vs 8, equal 7, 2 vs 5 fewer, 7 vs 4 fewer
        {t:'Which is greater: 4 or 7?',  v:null, o:[{val:'3',tag:'err_random'},{val:'4',tag:'err_less'},{val:'7'},{val:'8',tag:'err_random'}], a:2, e:'7 is greater than 4!', d:'m', s:null, h:'4 or 7 — which comes later?'},
        {t:'Which is greater: 5 or 8?',  v:null, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'8'},{val:'9',tag:'err_random'}], a:2, e:'8 is greater than 5!', d:'m', s:null, h:'5 or 8 — which is bigger?'},
        {t:'Is 7 equal to 7?',           v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'7 = 7 — they are equal!', d:'m', s:null, h:'Both say 7 — do they match?'},
        {t:'Which is less: 2 or 5?',     v:null, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'5',tag:'err_more'},{val:'6',tag:'err_random'}], a:1, e:'2 is less than 5!', d:'m', s:null, h:'2 or 5 — which is smaller?'},
        {t:'Which is less: 7 or 4?',     v:null, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'7',tag:'err_more'},{val:'8',tag:'err_random'}], a:1, e:'4 is less than 7!', d:'m', s:null, h:'Which number comes earlier?'},
        // NEW — Hard: numbers differ by 1
        {t:'Which is less: 7 or 8?',     v:null, o:[{val:'6',tag:'err_random'},{val:'7'},{val:'8',tag:'err_more'},{val:'9',tag:'err_random'}], a:1, e:'7 is less than 8 — just by 1!', d:'h', s:null, h:'These are very close — which comes first?'},
        {t:'Is 9 greater than 8?',       v:null, o:[{val:'yes — 9 is greater'},{val:'no — 8 is greater',tag:'err_not_equal'},{val:'they are equal',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'Yes! 9 is greater than 8 by 1!', d:'h', s:null, h:'9 comes right after 8 when you count'},
        {t:'Which is greater: 5 or 6?',  v:null, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'6'},{val:'7',tag:'err_random'}], a:2, e:'6 is greater than 5 — just by 1!', d:'h', s:null, h:'5 or 6 — which comes later?'},
        {t:'Are 8 and 9 equal?',         v:null, o:[{val:'yes — equal',tag:'err_not_equal'},{val:'no — 8 is less'},{val:'no — 9 is less',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:1, e:'8 and 9 are not equal — 8 is less!', d:'h', s:null, h:'8 and 9 — are they the same number?'}
      ]
    },

    // ── L4: Compose & Decompose (ku2l4) ──────────────────────────────────────
    {
      points: [
        "COMPOSE means putting two parts together to make a whole",
        "DECOMPOSE means breaking a number into two parts",
        "The same number can be made in different ways! (5 = 3+2 or 4+1)"
      ],

      examples: [
        {
          c: '#dc2626',
          tag: 'Compose — Put Together',
          p: 'There are 3 🐶 and 2 🐱. How many animals in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐶', rightCount:2, rightObj:'🐱', op:'add'}},
          s: 'Put the groups together:\n3 + 2 = 5 animals in all!',
          a: '5 animals in all ✅'
        },
        {
          c: '#b91c1c',
          tag: 'Compose — Bigger Numbers',
          p: 'There are 4 🌷 and 3 🌻. How many flowers in all?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🌷', rightCount:3, rightObj:'🌻', op:'add'}},
          s: 'Put together:\n4 + 3 = 7 flowers in all!',
          a: '7 flowers in all ✅'
        },
        {
          c: '#991b1b',
          tag: 'Decompose — Find the Parts',
          p: '5 is made of 2 parts. 2 + ___ = 5',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🥕', rightCount:3, rightObj:'🧩', op:'add'}},
          s: 'Count the right group:\n2 + ? = 5 … the missing part is 3!',
          a: '2 + 3 = 5 ✅'
        }
      ],

      practice: [
        {q:'2 + 3 = ___', a:'5',  h:'Count on from 2: 3, 4, 5',   e:'5! Two and three make five! 🎉'},
        {q:'4 + 2 = ___', a:'6',  h:'Count on from 4: 5, 6',       e:'6! Four and two make six! ⭐'},
        {q:'___ + 2 = 5', a:'3',  h:'What plus 2 equals 5?',        e:'3! Three plus two equals five! 🌟'}
      ],

      qBank: [
        // Easy — compose small sums ≤ 5
        {t:'2 🐶 and 1 🐱 — how many in all?',   v:{type:'twoGroups',config:{leftCount:2,leftObj:'🐶',rightCount:1,rightObj:'🐱',op:'add'}}, o:[{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'2 + 1 = 3 in all!', d:'e', s:null, h:'Count both groups together'},
        {t:'1 🌷 and 3 🌻 — how many in all?',   v:{type:'twoGroups',config:{leftCount:1,leftObj:'🌷',rightCount:3,rightObj:'🌻',op:'add'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'1 + 3 = 4 in all!', d:'e', s:null, h:'1 and 3 together make how many?'},
        {t:'2 🥕 and 2 🧩 — how many in all?',   v:{type:'twoGroups',config:{leftCount:2,leftObj:'🥕',rightCount:2,rightObj:'🧩',op:'add'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'2 + 2 = 4 in all!', d:'e', s:null, h:'Count: 1, 2 … then 3, 4'},
        {t:'3 🐰 and 2 🐯 — how many in all?',   v:{type:'twoGroups',config:{leftCount:3,leftObj:'🐰',rightCount:2,rightObj:'🐯',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}], a:2, e:'3 + 2 = 5 in all!', d:'e', s:null, h:'Count all together'},
        {t:'1 🦊 and 1 🐴 — how many in all?',   v:{type:'twoGroups',config:{leftCount:1,leftObj:'🦊',rightCount:1,rightObj:'🐴',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_over_count'}], a:1, e:'1 + 1 = 2 in all!', d:'e', s:null, h:'One and one more makes two'},
        // Medium — sums 6–8
        {t:'3 🐷 and 3 🧸 — how many in all?',   v:{type:'twoGroups',config:{leftCount:3,leftObj:'🐷',rightCount:3,rightObj:'🧸',op:'add'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'3 + 3 = 6 in all!', d:'m', s:null, h:'Count on from 3: 4, 5, 6'},
        {t:'4 🦆 and 2 🍊 — how many in all?',   v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦆',rightCount:2,rightObj:'🍊',op:'add'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'4 + 2 = 6 in all!', d:'m', s:null, h:'Count on from 4: 5, 6'},
        {t:'5 🍋 and 2 🍇 — how many in all?',   v:{type:'twoGroups',config:{leftCount:5,leftObj:'🍋',rightCount:2,rightObj:'🍇',op:'add'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'5 + 2 = 7 in all!', d:'m', s:null, h:'Count on from 5: 6, 7'},
        {t:'4 🍒 and 4 🌷 — how many in all?',   v:{type:'twoGroups',config:{leftCount:4,leftObj:'🍒',rightCount:4,rightObj:'🌷',op:'add'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'4 + 4 = 8 in all!', d:'m', s:null, h:'Count on from 4: 5, 6, 7, 8'},
        // Medium — decompose / missing part
        {t:'___ + 2 = 4. What is the missing part?', v:{type:'twoGroups',config:{leftCount:2,leftObj:'🐶',rightCount:2,rightObj:'🐱',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_whole'}], a:1, e:'2 + 2 = 4 — the missing part is 2!', d:'m', s:null, h:'What plus 2 equals 4?'},
        {t:'3 + ___ = 5. What is the missing part?', v:{type:'twoGroups',config:{leftCount:3,leftObj:'🌷',rightCount:2,rightObj:'🌻',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'5',tag:'err_whole'}], a:1, e:'3 + 2 = 5 — the missing part is 2!', d:'m', s:null, h:'3 plus what equals 5?'},
        {t:'4 + ___ = 6. What is the missing part?', v:{type:'twoGroups',config:{leftCount:4,leftObj:'🥕',rightCount:2,rightObj:'🧩',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_whole'}], a:1, e:'4 + 2 = 6 — the missing part is 2!', d:'m', s:null, h:'4 plus what equals 6?'},
        // NEW — Easy: compose small sums ≤ 5, fresh emoji pairs
        {t:'1 🦁 and 2 🐙 — how many in all?',   v:{type:'twoGroups',config:{leftCount:1,leftObj:'🦁',rightCount:2,rightObj:'🐙',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'1 + 2 = 3 in all!', d:'e', s:null, h:'Count both groups together'},
        {t:'2 🎃 and 1 🦊 — how many in all?',   v:{type:'twoGroups',config:{leftCount:2,leftObj:'🎃',rightCount:1,rightObj:'🦊',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'2 + 1 = 3 in all!', d:'e', s:null, h:'2 and 1 together make how many?'},
        {t:'1 🦄 and 3 🌈 — how many in all?',   v:{type:'twoGroups',config:{leftCount:1,leftObj:'🦄',rightCount:3,rightObj:'🌈',op:'add'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'1 + 3 = 4 in all!', d:'e', s:null, h:'1 and 3 together make how many?'},
        {t:'2 🦋 and 3 🐸 — how many in all?',   v:{type:'twoGroups',config:{leftCount:2,leftObj:'🦋',rightCount:3,rightObj:'🐸',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}], a:2, e:'2 + 3 = 5 in all!', d:'e', s:null, h:'Count all together: 1, 2, 3, 4, 5'},
        // NEW — Medium: sums 6–9
        {t:'2 🌸 and 4 🎈 — how many in all?',   v:{type:'twoGroups',config:{leftCount:2,leftObj:'🌸',rightCount:4,rightObj:'🎈',op:'add'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'2 + 4 = 6 in all!', d:'m', s:null, h:'Count on from 2: 3, 4, 5, 6'},
        {t:'3 🦁 and 4 🐊 — how many in all?',   v:{type:'twoGroups',config:{leftCount:3,leftObj:'🦁',rightCount:4,rightObj:'🐊',op:'add'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'3 + 4 = 7 in all!', d:'m', s:null, h:'Count on from 3: 4, 5, 6, 7'},
        {t:'5 🦓 and 3 🦒 — how many in all?',   v:{type:'twoGroups',config:{leftCount:5,leftObj:'🦓',rightCount:3,rightObj:'🦒',op:'add'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'5 + 3 = 8 in all!', d:'m', s:null, h:'Count on from 5: 6, 7, 8'},
        {t:'4 🦏 and 5 🦛 — how many in all?',   v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦏',rightCount:5,rightObj:'🦛',op:'add'}}, o:[{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}], a:2, e:'4 + 5 = 9 in all!', d:'m', s:null, h:'Count on from 4: 5, 6, 7, 8, 9'},
        {t:'6 🦋 and 2 🐸 — how many in all?',   v:{type:'twoGroups',config:{leftCount:6,leftObj:'🦋',rightCount:2,rightObj:'🐸',op:'add'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'6 + 2 = 8 in all!', d:'m', s:null, h:'Count on from 6: 7, 8'},
        // NEW — Hard: missing-part problems
        {t:'5 + ___ = 9. What is the missing part?', v:{type:'twoGroups',config:{leftCount:5,leftObj:'🦁',rightCount:4,rightObj:'🐙',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_whole'},{val:'9',tag:'err_whole'}], a:1, e:'5 + 4 = 9 — the missing part is 4!', d:'h', s:null, h:'5 plus what equals 9? Count on from 5'},
        {t:'3 + ___ = 7. What is the missing part?', v:{type:'twoGroups',config:{leftCount:3,leftObj:'🎃',rightCount:4,rightObj:'🦊',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'7',tag:'err_whole'},{val:'5',tag:'err_off_by_one'}], a:1, e:'3 + 4 = 7 — the missing part is 4!', d:'h', s:null, h:'3 plus what equals 7? Count on from 3'},
        {t:'If 3 + 4 = 7, then 4 + 3 = ___?',       v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦄',rightCount:3,rightObj:'🌈',op:'add'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'},{val:'1',tag:'err_random'}], a:1, e:'4 + 3 = 7 too! Switching the parts does not change the total!', d:'h', s:null, h:'The order does not matter — the total stays the same'},
        {t:'6 + ___ = 10. What is the missing part?', v:{type:'twoGroups',config:{leftCount:6,leftObj:'🦋',rightCount:4,rightObj:'🐸',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_whole'},{val:'10',tag:'err_whole'}], a:1, e:'6 + 4 = 10 — the missing part is 4!', d:'h', s:null, h:'6 plus what makes 10? Count on from 6'},
        {t:'___ + 3 = 8. What is the missing part?', v:{type:'twoGroups',config:{leftCount:5,leftObj:'🌸',rightCount:3,rightObj:'🎈',op:'add'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'8',tag:'err_whole'},{val:'6',tag:'err_off_by_one'}], a:1, e:'5 + 3 = 8 — the missing part is 5!', d:'h', s:null, h:'What plus 3 equals 8? Think: 3 + ? = 8'}
      ]
    }

  ],

  // ── Unit 2 Test Bank ──────────────────────────────────────────────────────
  // 50 questions — expanded from original 16. All t values unique.
  testBank: [
    // L1 — One More, One Less (unique emojis vs qBank)
    {t:'One more than 3 🐴 is how many?',  v:{type:'objectSet',config:{count:3,emoji:'🐴',layout:'line'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_same'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'3 + 1 more = 4!', d:'e', s:null, h:'Count on from 3'},
    {t:'One less than 5 🦊 is how many?',  v:{type:'objectSet',config:{count:5,emoji:'🦊',layout:'line'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_same'},{val:'6',tag:'err_off_by_one'}], a:1, e:'5 take away 1 = 4!', d:'e', s:null, h:'Count back from 5'},
    {t:'One more than 7 🍇 is how many?',  v:{type:'objectSet',config:{count:7,emoji:'🍇',layout:'grid'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_same'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'7 + 1 more = 8!', d:'m', s:null, h:'Count on from 7'},
    {t:'One less than 6 🍊 is how many?',  v:{type:'objectSet',config:{count:6,emoji:'🍊',layout:'grid'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_same'},{val:'7',tag:'err_off_by_one'}], a:1, e:'6 take away 1 = 5!', d:'m', s:null, h:'Count back from 6'},
    // L2 — Compare Sets (unique count+emoji combos vs qBank)
    {t:'Which shows more: 1 🐰 or 7 🐯?',       v:{type:'twoGroups',config:{leftCount:1,leftObj:'🐰',rightCount:7,rightObj:'🐯',op:'compare'}}, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'7'},{val:'9',tag:'err_random'}], a:2, e:'7 is more than 1!', d:'e', s:null, h:'Count each — which is bigger?'},
    {t:'Which shows fewer: 2 🦆 or 9 🍋?',      v:{type:'twoGroups',config:{leftCount:2,leftObj:'🦆',rightCount:9,rightObj:'🍋',op:'compare'}}, o:[{val:'2'},{val:'4',tag:'err_random'},{val:'9',tag:'err_more'},{val:'11',tag:'err_random'}], a:0, e:'2 is fewer than 9!', d:'e', s:null, h:'Fewer means the smaller number'},
    {t:'Which shows more: 5 🐷 or 8 🧸?',       v:{type:'twoGroups',config:{leftCount:5,leftObj:'🐷',rightCount:8,rightObj:'🧸',op:'compare'}}, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'7',tag:'err_random'},{val:'8'}], a:3, e:'8 is more than 5!', d:'m', s:null, h:'Count carefully — which is bigger?'},
    {t:'Do 4 🍒 and 4 🌷 show the same amount?', v:{type:'twoGroups',config:{leftCount:4,leftObj:'🍒',rightCount:4,rightObj:'🌷',op:'compare'}}, o:[{val:'yes — same'},{val:'no — cherries more',tag:'err_not_equal'},{val:'no — tulips more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Both groups have 4 — they\'re the same!', d:'m', s:null, h:'Count each — do they match?'},
    // L3 — Compare Numbers (unique number pairs vs qBank)
    {t:'Which is greater: 1 or 9?',  v:null, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'9'},{val:'10',tag:'err_random'}], a:2, e:'9 is greater than 1!', d:'e', s:null, h:'Which number is bigger?'},
    {t:'Which is less: 8 or 3?',     v:null, o:[{val:'1',tag:'err_random'},{val:'3'},{val:'5',tag:'err_random'},{val:'8',tag:'err_more'}], a:1, e:'3 is less than 8!', d:'e', s:null, h:'Which number is smaller?'},
    {t:'Which is greater: 3 or 7?',  v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'7'},{val:'9',tag:'err_random'}], a:2, e:'7 is greater than 3!', d:'m', s:null, h:'3 or 7 — which is bigger?'},
    {t:'Is 5 equal to 5?',           v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'5 = 5 — they are equal!', d:'m', s:null, h:'Are both numbers the same?'},
    // L4 — Compose & Decompose (unique combos vs qBank)
    {t:'2 🐶 and 3 🐱 — how many in all?',      v:{type:'twoGroups',config:{leftCount:2,leftObj:'🐶',rightCount:3,rightObj:'🐱',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}], a:2, e:'2 + 3 = 5 in all!', d:'e', s:null, h:'Count both groups together'},
    {t:'4 🌷 and 1 🌻 — how many in all?',      v:{type:'twoGroups',config:{leftCount:4,leftObj:'🌷',rightCount:1,rightObj:'🌻',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}], a:2, e:'4 + 1 = 5 in all!', d:'e', s:null, h:'Count on from 4: 5'},
    {t:'3 🥕 and 4 🧩 — how many in all?',      v:{type:'twoGroups',config:{leftCount:3,leftObj:'🥕',rightCount:4,rightObj:'🧩',op:'add'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'3 + 4 = 7 in all!', d:'m', s:null, h:'Count on from 3: 4, 5, 6, 7'},
    {t:'5 + ___ = 7. What is the missing part?', v:{type:'twoGroups',config:{leftCount:5,leftObj:'🍋',rightCount:2,rightObj:'🍒',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'5',tag:'err_whole'}], a:1, e:'5 + 2 = 7 — the missing part is 2!', d:'m', s:null, h:'5 plus what equals 7?'},
    // NEW EASY — one per lesson, fresh scenarios (8-9 total easy)
    {t:'One more than 2 🦁 is how many?',        v:{type:'objectSet',config:{count:2,emoji:'🦁',layout:'line'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_same'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'2 + 1 more = 3!', d:'e', s:null, h:'Count on from 2'},
    {t:'Which shows more: 1 🦓 or 8 🦒?',        v:{type:'twoGroups',config:{leftCount:1,leftObj:'🦓',rightCount:8,rightObj:'🦒',op:'compare'}}, o:[{val:'1',tag:'err_less'},{val:'4',tag:'err_random'},{val:'8'},{val:'9',tag:'err_random'}], a:2, e:'8 is more than 1!', d:'e', s:null, h:'Count each — which group is bigger?'},
    {t:'Which is greater: 4 or 9?',              v:null, o:[{val:'3',tag:'err_random'},{val:'4',tag:'err_less'},{val:'9'},{val:'10',tag:'err_random'}], a:2, e:'9 is greater than 4!', d:'e', s:null, h:'Which number is bigger?'},
    {t:'1 🎃 and 2 🌈 — how many in all?',        v:{type:'twoGroups',config:{leftCount:1,leftObj:'🎃',rightCount:2,rightObj:'🌈',op:'add'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}], a:2, e:'1 + 2 = 3 in all!', d:'e', s:null, h:'Count both groups together'},
    {t:'One less than 3 🐙 is how many?',         v:{type:'objectSet',config:{count:3,emoji:'🐙',layout:'line'}}, o:[{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_same'},{val:'4',tag:'err_off_by_one'}], a:1, e:'3 take away 1 = 2!', d:'e', s:null, h:'Count back from 3'},
    {t:'Which shows fewer: 2 🦏 or 9 🦛?',        v:{type:'twoGroups',config:{leftCount:2,leftObj:'🦏',rightCount:9,rightObj:'🦛',op:'compare'}}, o:[{val:'1',tag:'err_random'},{val:'2'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1, e:'2 is fewer than 9!', d:'e', s:null, h:'Fewer means the smaller group'},
    {t:'Which is less: 1 or 8?',                  v:null, o:[{val:'1'},{val:'4',tag:'err_random'},{val:'8',tag:'err_more'},{val:'9',tag:'err_random'}], a:0, e:'1 is less than 8!', d:'e', s:null, h:'1 comes before 8 when counting'},
    {t:'2 🌸 and 2 🎈 — how many in all?',        v:{type:'twoGroups',config:{leftCount:2,leftObj:'🌸',rightCount:2,rightObj:'🎈',op:'add'}}, o:[{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}], a:2, e:'2 + 2 = 4 in all!', d:'e', s:null, h:'Count: 1, 2 … then 3, 4'},
    // NEW MEDIUM — one more/less 6–8, compare 5–7, greater/less 5–8, sums 5–7 (14-15 total medium)
    {t:'One more than 6 🦋 is how many?',          v:{type:'objectSet',config:{count:6,emoji:'🦋',layout:'grid'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_same'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'6 + 1 more = 7!', d:'m', s:null, h:'Count on one more from 6'},
    {t:'One less than 8 🦁 is how many?',          v:{type:'objectSet',config:{count:8,emoji:'🦁',layout:'grid'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_same'},{val:'9',tag:'err_off_by_one'}], a:1, e:'8 take away 1 = 7!', d:'m', s:null, h:'Count back one from 8'},
    {t:'Which shows more: 5 🦄 or 7 🌈?',          v:{type:'twoGroups',config:{leftCount:5,leftObj:'🦄',rightCount:7,rightObj:'🌈',op:'compare'}}, o:[{val:'4',tag:'err_random'},{val:'5',tag:'err_less'},{val:'7'},{val:'8',tag:'err_random'}], a:2, e:'7 is more than 5!', d:'m', s:null, h:'Count carefully — which is bigger?'},
    {t:'Which shows fewer: 4 🦋 or 6 🌸?',         v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦋',rightCount:6,rightObj:'🌸',op:'compare'}}, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'6',tag:'err_more'},{val:'7',tag:'err_random'}], a:1, e:'4 is fewer than 6!', d:'m', s:null, h:'Which group has fewer?'},
    {t:'Do 5 🦁 and 5 🐊 show the same amount?',   v:{type:'twoGroups',config:{leftCount:5,leftObj:'🦁',rightCount:5,rightObj:'🐊',op:'compare'}}, o:[{val:'yes — same'},{val:'no — lions more',tag:'err_not_equal'},{val:'no — crocs more',tag:'err_not_equal'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Both groups have 5 — same!', d:'m', s:null, h:'Count each: 5 and 5 — do they match?'},
    {t:'Which is greater: 3 or 8?',                v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'8'},{val:'9',tag:'err_random'}], a:2, e:'8 is greater than 3!', d:'m', s:null, h:'3 or 8 — which comes later?'},
    {t:'Which is less: 4 or 7?',                   v:null, o:[{val:'3',tag:'err_random'},{val:'4'},{val:'7',tag:'err_more'},{val:'8',tag:'err_random'}], a:1, e:'4 is less than 7!', d:'m', s:null, h:'Which number comes first?'},
    {t:'Is 6 equal to 6?',                         v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'6 = 6 — they are equal!', d:'m', s:null, h:'Both say 6 — are they the same?'},
    {t:'3 🦓 and 3 🦒 — how many in all?',          v:{type:'twoGroups',config:{leftCount:3,leftObj:'🦓',rightCount:3,rightObj:'🦒',op:'add'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'3 + 3 = 6 in all!', d:'m', s:null, h:'Count on from 3: 4, 5, 6'},
    {t:'4 🦏 and 3 🦛 — how many in all?',          v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦏',rightCount:3,rightObj:'🦛',op:'add'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'4 + 3 = 7 in all!', d:'m', s:null, h:'Count on from 4: 5, 6, 7'},
    {t:'One more than 8 🎃 is how many?',           v:{type:'objectSet',config:{count:8,emoji:'🎃',layout:'grid'}}, o:[{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_same'},{val:'9'},{val:'10',tag:'err_off_by_one'}], a:2, e:'8 + 1 more = 9!', d:'m', s:null, h:'Count on one more from 8'},
    {t:'Which is greater: 3 or 6?',                v:null, o:[{val:'2',tag:'err_random'},{val:'3',tag:'err_less'},{val:'6'},{val:'7',tag:'err_random'}], a:2, e:'6 is greater than 3!', d:'m', s:null, h:'3 or 6 — which comes later?'},
    {t:'2 🐊 and 5 🦕 — how many in all?',          v:{type:'twoGroups',config:{leftCount:2,leftObj:'🐊',rightCount:5,rightObj:'🦕',op:'add'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}], a:2, e:'2 + 5 = 7 in all!', d:'m', s:null, h:'Count on from 2: 3, 4, 5, 6, 7'},
    // NEW HARD — one more/less 9–10, compare by 1, compare numbers differ by 1, missing sum 8–9
    {t:'One more than 9 🦓 is how many?',           v:{type:'objectSet',config:{count:9,emoji:'🦓',layout:'grid'}}, o:[{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_same'},{val:'10'},{val:'11',tag:'err_off_by_one'}], a:2, e:'9 + 1 more = 10!', d:'h', s:null, h:'What number comes right after 9?'},
    {t:'One less than 10 🦋 is how many?',          v:{type:'objectSet',config:{count:10,emoji:'🦋',layout:'grid'}}, o:[{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_same'},{val:'11',tag:'err_off_by_one'}], a:1, e:'10 take away 1 = 9!', d:'h', s:null, h:'Count back one step from 10'},
    {t:'Which shows more: 7 🐙 or 8 🎃?',           v:{type:'twoGroups',config:{leftCount:7,leftObj:'🐙',rightCount:8,rightObj:'🎃',op:'compare'}}, o:[{val:'6',tag:'err_less'},{val:'7',tag:'err_less'},{val:'8'},{val:'9',tag:'err_more'}], a:2, e:'8 is more than 7 — just by 1!', d:'h', s:null, h:'Count each carefully — very close!'},
    {t:'Is 8 greater than 9?',                     v:null, o:[{val:'yes — 8 is greater',tag:'err_not_equal'},{val:'no — 9 is greater'},{val:'they are equal',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:1, e:'No! 9 is greater than 8 by 1!', d:'h', s:null, h:'8 or 9 — which comes later when you count?'},
    {t:'Which is less: 8 or 9?',                   v:null, o:[{val:'7',tag:'err_random'},{val:'8'},{val:'9',tag:'err_more'},{val:'10',tag:'err_random'}], a:1, e:'8 is less than 9 — just by 1!', d:'h', s:null, h:'These are very close — which comes first?'},
    {t:'4 + ___ = 8. What is the missing part?',   v:{type:'twoGroups',config:{leftCount:4,leftObj:'🦁',rightCount:4,rightObj:'🐊',op:'add'}}, o:[{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'8',tag:'err_whole'},{val:'5',tag:'err_off_by_one'}], a:1, e:'4 + 4 = 8 — the missing part is 4!', d:'h', s:null, h:'4 plus what equals 8? Count on from 4'},
    {t:'___ + 4 = 9. What is the missing part?',   v:{type:'twoGroups',config:{leftCount:5,leftObj:'🦓',rightCount:4,rightObj:'🦒',op:'add'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'9',tag:'err_whole'},{val:'6',tag:'err_off_by_one'}], a:1, e:'5 + 4 = 9 — the missing part is 5!', d:'h', s:null, h:'What plus 4 equals 9? Think carefully'},
    // Additional medium questions to reach 50 total
    {t:'One more than 5 🐸 is how many?',           v:{type:'objectSet',config:{count:5,emoji:'🐸',layout:'grid'}}, o:[{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_same'},{val:'6'},{val:'7',tag:'err_off_by_one'}], a:2, e:'5 + 1 more = 6!', d:'m', s:null, h:'Count on one more from 5'},
    {t:'Which is greater: 2 or 6?',                v:null, o:[{val:'1',tag:'err_random'},{val:'2',tag:'err_less'},{val:'6'},{val:'8',tag:'err_random'}], a:2, e:'6 is greater than 2!', d:'m', s:null, h:'2 or 6 — which comes later?'},
    {t:'Which shows fewer: 3 🌸 or 7 🎈?',          v:{type:'twoGroups',config:{leftCount:3,leftObj:'🌸',rightCount:7,rightObj:'🎈',op:'compare'}}, o:[{val:'2',tag:'err_random'},{val:'3'},{val:'7',tag:'err_more'},{val:'8',tag:'err_random'}], a:1, e:'3 is fewer than 7!', d:'m', s:null, h:'Which group has fewer?'},
    {t:'3 🦋 and 5 🐸 — how many in all?',          v:{type:'twoGroups',config:{leftCount:3,leftObj:'🦋',rightCount:5,rightObj:'🐸',op:'add'}}, o:[{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}], a:2, e:'3 + 5 = 8 in all!', d:'m', s:null, h:'Count on from 3: 4, 5, 6, 7, 8'},
    {t:'One less than 7 🦄 is how many?',           v:{type:'objectSet',config:{count:7,emoji:'🦄',layout:'grid'}}, o:[{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_same'},{val:'8',tag:'err_off_by_one'}], a:1, e:'7 take away 1 = 6!', d:'m', s:null, h:'Count back one from 7'},
    {t:'Is 8 equal to 8?',                         v:null, o:[{val:'yes — equal'},{val:'no — first is more',tag:'err_not_equal'},{val:'no — second is more',tag:'err_not_equal'},{val:'not sure',tag:'err_confused'}], a:0, e:'8 = 8 — they are equal!', d:'m', s:null, h:'Both say 8 — are they the same?'}
  ]
});
