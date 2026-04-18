// Kindergarten Unit 4: Teen Numbers & Counting to 20
// Calls _mergeKUnitData — available globally from shared_k.js in the app bundle.
_mergeKUnitData(3, {
  lessons: [

    // ── Lesson 1: Count to 20 ────────────────────────────────────────────────
    {
      points: [
        'Count forward: 1, 2, 3 … all the way to 20!',
        'Count backward: start at a number and go down — 20, 19, 18 …',
        'What comes BEFORE and AFTER a number? Use the counting order!'
      ],
      examples: [
        {
          c: '#FF9800',
          tag: 'Count Forward',
          p: 'Count all the ⭐ below. How many are there?',
          v: {type:'objectSet', config:{count:15, emoji:'⭐', layout:'grid'}},
          s: 'Touch each star and count: 1, 2, 3 … 15',
          a: '15 stars ✅'
        },
        {
          c: '#FB8C00',
          tag: 'What Comes Next?',
          p: '16, 17, __ — what number comes after 17?',
          v: null,
          s: 'Count on one more from 17: 18',
          a: '18 ✅'
        },
        {
          c: '#E65100',
          tag: 'Count Backward',
          p: 'Start at 14 and count back. What comes before 14?',
          v: null,
          s: 'Count back one step from 14: 13',
          a: '13 ✅'
        }
      ],
      practice: [
        {q:'Count forward: 11, 12, 13, __, 15', a:'14', h:'What number comes after 13?', e:'14 comes after 13! ✅'},
        {q:'What comes after 19?', a:'20', h:'Count on from 19: twenty!', e:'20 comes after 19! ✅'},
        {q:'What comes before 16?', a:'15', h:'Count back one step from 16', e:'15 comes before 16! ✅'}
      ],
      qBank: [
        // ── Count objectSet (11–20) ──────────────────────────────────────────
        {
          t: 'How many 🌟 are there?',
          v: {type:'objectSet', config:{count:11, emoji:'🌟', layout:'grid'}},
          o: [{val:'10',tag:'err_under_count'},{val:'11'},{val:'12',tag:'err_off_by_one'},{val:'13',tag:'err_over_count'}],
          a:1, e:'Count: 1 … 11!', d:'e', s:null, h:'Count every star one by one'
        },
        {
          t: 'How many 🐝 do you see?',
          v: {type:'objectSet', config:{count:13, emoji:'🐝', layout:'grid'}},
          o: [{val:'11',tag:'err_under_count'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
          a:2, e:'Count carefully: 1 … 13!', d:'e', s:null, h:'Touch each bee as you count'
        },
        {
          t: 'How many 🦋 are in the garden?',
          v: {type:'objectSet', config:{count:16, emoji:'🦋', layout:'grid'}},
          o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
          a:2, e:'16 butterflies!', d:'m', s:null, h:'Count row by row'
        },
        {
          t: 'Count the 🌸 flowers. How many?',
          v: {type:'objectSet', config:{count:18, emoji:'🌸', layout:'grid'}},
          o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_off_by_one'},{val:'18'},{val:'19',tag:'err_off_by_one'}],
          a:2, e:'18 flowers!', d:'m', s:null, h:'Count carefully — do not skip any'
        },
        {
          t: 'How many ⭐ are here?',
          v: {type:'objectSet', config:{count:20, emoji:'⭐', layout:'grid'}},
          o: [{val:'18',tag:'err_under_count'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}],
          a:2, e:'20 stars — all the way to 20!', d:'m', s:null, h:'Count all the way to the last one'
        },
        // ── What comes after N? ──────────────────────────────────────────────
        {
          t: 'What number comes after 10?',
          v: null,
          o: [{val:'9',tag:'err_under_count'},{val:'10',tag:'err_same'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'11 comes right after 10!', d:'e', s:null, h:'Count on one more from 10'
        },
        {
          t: 'What number comes after 14?',
          v: null,
          o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_same'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
          a:2, e:'15 comes after 14!', d:'e', s:null, h:'Count forward one step from 14'
        },
        {
          t: 'What number comes after 17?',
          v: null,
          o: [{val:'16',tag:'err_under_count'},{val:'17',tag:'err_same'},{val:'18'},{val:'20',tag:'err_over_count'}],
          a:2, e:'18 comes after 17!', d:'e', s:null, h:'Say 17 … then the next number'
        },
        {
          t: 'What number comes after 19?',
          v: null,
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_over_count'}],
          a:2, e:'20 comes after 19 — that is the biggest!', d:'m', s:null, h:'Count on from 19'
        },
        {
          t: '11, 12, 13, __ — what comes next?',
          v: null,
          o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_same'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'14 comes next!', d:'e', s:null, h:'Count on from 13'
        },
        // ── What comes before N? ─────────────────────────────────────────────
        {
          t: 'What number comes before 12?',
          v: null,
          o: [{val:'10',tag:'err_under_count'},{val:'11'},{val:'12',tag:'err_same'},{val:'13',tag:'err_off_by_one'}],
          a:1, e:'11 comes before 12!', d:'e', s:null, h:'Count back one step from 12'
        },
        {
          t: 'What number comes before 15?',
          v: null,
          o: [{val:'13',tag:'err_under_count'},{val:'14'},{val:'15',tag:'err_same'},{val:'16',tag:'err_off_by_one'}],
          a:1, e:'14 comes before 15!', d:'e', s:null, h:'Say 15 and count back one'
        },
        {
          t: 'What number comes before 20?',
          v: null,
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_same'}],
          a:2, e:'19 comes before 20!', d:'m', s:null, h:'Count back one step from 20'
        },
        {
          t: '__, 16, 17 — what number comes before 16?',
          v: null,
          o: [{val:'13',tag:'err_under_count'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_same'}],
          a:2, e:'15 comes before 16!', d:'m', s:null, h:'Count back one from 16'
        },
        {
          t: 'What number comes before 18?',
          v: null,
          o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_same'}],
          a:2, e:'17 comes before 18!', d:'m', s:null, h:'Count back from 18'
        },
        {
          t: 'How many 🦊 are here?',
          v: {type:'objectSet', config:{count:12, emoji:'🦊', layout:'grid'}},
          o: [{val:'10',tag:'err_under_count'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'12 foxes!', d:'e', s:null, h:'Count every fox — do not skip any'
        },
        {
          t: 'What number comes after 11?',
          v: null,
          o: [{val:'10',tag:'err_under_count'},{val:'11',tag:'err_same'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'12 comes after 11!', d:'e', s:null, h:'Count on one step from 11'
        },
        {
          t: '17, 18, __ — what comes next?',
          v: null,
          o: [{val:'17',tag:'err_under_count'},{val:'18',tag:'err_same'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'19 comes after 18!', d:'m', s:null, h:'Count forward from 18'
        }
      ]
    },

    // ── Lesson 2: Read and Represent 11–20 ──────────────────────────────────
    {
      points: [
        'Teen numbers are made of 10 and some MORE — like 10 + 4 = 14',
        '11 = 10 + 1, 12 = 10 + 2, all the way to 19 = 10 + 9',
        'Match the numeral to the right group of objects!'
      ],
      examples: [
        {
          c: '#FF9800',
          tag: '10 + Extras',
          p: 'Here are 14 ⭐. Count the group of 10 — then count the 4 extras!',
          v: {type:'objectSet', config:{count:14, emoji:'⭐', layout:'grid'}},
          s: '10 in the full rows, then 1, 2, 3, 4 more = 14',
          a: '14 ✅ — ten and four more'
        },
        {
          c: '#FB8C00',
          tag: 'Name the Set',
          p: 'How many 🌙 are there? Pick the numeral.',
          v: {type:'objectSet', config:{count:16, emoji:'🌙', layout:'grid'}},
          s: 'Count all: 1 … 16. The numeral is 16.',
          a: '16 ✅'
        },
        {
          c: '#E65100',
          tag: 'Count the Extras',
          p: '13 objects = 10 + how many extras?',
          v: {type:'objectSet', config:{count:13, emoji:'🍎', layout:'grid'}},
          s: 'Count beyond 10: 11, 12, 13 — that is 3 extras',
          a: '3 extras ✅ — 10 + 3 = 13'
        }
      ],
      practice: [
        {q:'Show 12 using 10 + extras. How many extras?', a:'2', h:'12 = 10 + ?', e:'12 = 10 + 2! ✅'},
        {q:'15 = 10 + ?', a:'5', h:'Count past 10 to 15', e:'15 = 10 + 5! ✅'},
        {q:'Which numeral matches 10 + 8?', a:'18', h:'10 + 8 = …', e:'18! Ten and eight more ✅'}
      ],
      qBank: [
        // ── objectSet → identify numeral ─────────────────────────────────────
        {
          t: 'How many 🍎 are there?',
          v: {type:'objectSet', config:{count:11, emoji:'🍎', layout:'grid'}},
          o: [{val:'9',tag:'err_teen'},{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'11 = ten and one more!', d:'e', s:null, h:'Count all — 10 then 1 more'
        },
        {
          t: 'How many 🌙 do you see?',
          v: {type:'objectSet', config:{count:12, emoji:'🌙', layout:'grid'}},
          o: [{val:'10',tag:'err_teen'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'12 = ten and two more!', d:'e', s:null, h:'Count the ten, then the extras'
        },
        {
          t: 'How many 🐸 are here?',
          v: {type:'objectSet', config:{count:14, emoji:'🐸', layout:'grid'}},
          o: [{val:'12',tag:'err_teen'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'14 = ten and four more!', d:'e', s:null, h:'Count on past 10'
        },
        {
          t: 'Count the 🌺 flowers. How many?',
          v: {type:'objectSet', config:{count:17, emoji:'🌺', layout:'grid'}},
          o: [{val:'15',tag:'err_teen'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'17 = ten and seven more!', d:'m', s:null, h:'Count carefully past 16'
        },
        {
          t: 'How many 🐠 fish are there?',
          v: {type:'objectSet', config:{count:19, emoji:'🐠', layout:'grid'}},
          o: [{val:'17',tag:'err_teen'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'19 = ten and nine more!', d:'m', s:null, h:'Count all the fish'
        },
        {
          t: 'How many ⭐ stars are here?',
          v: {type:'objectSet', config:{count:20, emoji:'⭐', layout:'grid'}},
          o: [{val:'18',tag:'err_teen'},{val:'19',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_off_by_one'}],
          a:2, e:'20! That is our biggest number!', d:'m', s:null, h:'Count all the way to the end'
        },
        // ── How many extras beyond 10? ───────────────────────────────────────
        {
          t: '13 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:13, emoji:'🍋', layout:'grid'}},
          o: [{val:'1',tag:'err_teen'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'13 = 10 + 3!', d:'e', s:null, h:'Count past 10: 11, 12, 13 — that is 3 extras'
        },
        {
          t: '15 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:15, emoji:'🌟', layout:'grid'}},
          o: [{val:'3',tag:'err_teen'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'15 = 10 + 5!', d:'e', s:null, h:'Count beyond 10 to reach 15'
        },
        {
          t: '18 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:18, emoji:'🐥', layout:'grid'}},
          o: [{val:'6',tag:'err_teen'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'18 = 10 + 8!', d:'m', s:null, h:'Count how many are past the 10'
        },
        {
          t: '16 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:16, emoji:'🍇', layout:'grid'}},
          o: [{val:'4',tag:'err_teen'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'16 = 10 + 6!', d:'m', s:null, h:'Count the extras after the first 10'
        },
        {
          t: '19 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:19, emoji:'🐣', layout:'grid'}},
          o: [{val:'7',tag:'err_teen'},{val:'8',tag:'err_off_by_one'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'19 = 10 + 9!', d:'m', s:null, h:'Count the extras after 10'
        },
        // ── Given numeral, which count? ──────────────────────────────────────
        {
          t: 'Which number is "twelve"?',
          v: null,
          o: [{val:'10',tag:'err_teen'},{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'20',tag:'err_teen'}],
          a:2, e:'Twelve = 12!', d:'e', s:null, h:'Twelve has a 1 and a 2'
        },
        {
          t: 'Which number is "fifteen"?',
          v: null,
          o: [{val:'5',tag:'err_teen'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
          a:2, e:'Fifteen = 15!', d:'e', s:null, h:'Fifteen: ten and five more'
        },
        {
          t: 'Which number is "seventeen"?',
          v: null,
          o: [{val:'7',tag:'err_teen'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'Seventeen = 17!', d:'m', s:null, h:'Seventeen: ten and seven more'
        },
        {
          t: 'Which number is "nineteen"?',
          v: null,
          o: [{val:'9',tag:'err_teen'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'Nineteen = 19!', d:'m', s:null, h:'Nineteen: ten and nine more'
        },
        {
          t: '12 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:12, emoji:'🐢', layout:'grid'}},
          o: [{val:'0',tag:'err_teen'},{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'}],
          a:2, e:'12 = 10 + 2!', d:'e', s:null, h:'Count how many come after 10'
        },
        {
          t: '14 = 10 + how many extras?',
          v: {type:'objectSet', config:{count:14, emoji:'🐛', layout:'grid'}},
          o: [{val:'2',tag:'err_teen'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'14 = 10 + 4!', d:'m', s:null, h:'Count the extras past the first 10'
        },
        {
          t: 'Which number is "thirteen"?',
          v: null,
          o: [{val:'3',tag:'err_teen'},{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'30',tag:'err_teen'}],
          a:2, e:'Thirteen = 13!', d:'e', s:null, h:'Thirteen: ten and three more'
        }
      ]
    },

    // ── Lesson 3: More, Less, and Equal Within 20 ────────────────────────────
    {
      points: [
        'MORE means the bigger amount — the group with more objects',
        'LESS means the smaller amount — the group with fewer objects',
        'EQUAL means both groups have the same amount'
      ],
      examples: [
        {
          c: '#0095FF',
          tag: 'Compare Groups',
          p: 'Which group has MORE — 13 🌻 or 8 🌻?',
          v: {type:'twoGroups', config:{leftCount:13, leftObj:'🌻', rightCount:8, rightObj:'🌻', op:'compare'}},
          s: 'Count both: 13 is bigger than 8',
          a: '13 🌻 has MORE ✅'
        },
        {
          c: '#0072CE',
          tag: 'Compare Numbers',
          p: 'Is 17 more than, less than, or equal to 11?',
          v: null,
          s: '17 comes later in counting — it is greater than 11',
          a: '17 is MORE than 11 ✅'
        },
        {
          c: '#005BB5',
          tag: 'Equal Groups',
          p: 'Are 14 🌸 and 14 🌸 equal?',
          v: {type:'twoGroups', config:{leftCount:14, leftObj:'🌸', rightCount:14, rightObj:'🌸', op:'compare'}},
          s: 'Both groups have 14 — they are equal!',
          a: 'Yes, equal! ✅'
        }
      ],
      practice: [
        {q:'Circle the group with more: 15 or 9', a:'15', h:'Which number is bigger?', e:'15 is more than 9! ✅'},
        {q:'Is 12 more or less than 18?', a:'less', h:'12 comes before 18 when you count', e:'12 is less than 18! ✅'},
        {q:'Are 16 and 16 equal?', a:'yes', h:'Count both — same number?', e:'Yes! Both are 16, so they are equal ✅'}
      ],
      qBank: [
        // ── twoGroups compare, which is MORE? ────────────────────────────────
        {
          t: 'Which group has MORE — 🐶 or 🐱?',
          v: {type:'twoGroups', config:{leftCount:11, leftObj:'🐶', rightCount:6, rightObj:'🐱', op:'compare'}},
          o: [{val:'6',tag:'err_less'},{val:'11'},{val:'8',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'}],
          a:1, e:'11 is more than 6!', d:'e', s:null, h:'Count each group — which is bigger?'
        },
        {
          t: 'Which group has MORE — 🍕 or 🌮?',
          v: {type:'twoGroups', config:{leftCount:7, leftObj:'🍕', rightCount:14, rightObj:'🌮', op:'compare'}},
          o: [{val:'7',tag:'err_less'},{val:'14'},{val:'11',tag:'err_off_by_one'},{val:'21',tag:'err_off_by_one'}],
          a:1, e:'14 is more than 7!', d:'e', s:null, h:'Which side has more objects?'
        },
        {
          t: 'Which group has MORE — 🌟 or 🌙?',
          v: {type:'twoGroups', config:{leftCount:15, leftObj:'🌟', rightCount:12, rightObj:'🌙', op:'compare'}},
          o: [{val:'12',tag:'err_less'},{val:'15'},{val:'13',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'}],
          a:1, e:'15 is more than 12!', d:'m', s:null, h:'Count carefully — they are close!'
        },
        {
          t: 'Which group has MORE — 🐸 or 🦋?',
          v: {type:'twoGroups', config:{leftCount:9, leftObj:'🐸', rightCount:18, rightObj:'🦋', op:'compare'}},
          o: [{val:'9',tag:'err_less'},{val:'18'},{val:'14',tag:'err_off_by_one'},{val:'27',tag:'err_off_by_one'}],
          a:1, e:'18 is more than 9!', d:'e', s:null, h:'Count both sides'
        },
        {
          t: 'Which group has MORE — 🍎 or 🍊?',
          v: {type:'twoGroups', config:{leftCount:16, leftObj:'🍎', rightCount:13, rightObj:'🍊', op:'compare'}},
          o: [{val:'13',tag:'err_less'},{val:'16'},{val:'14',tag:'err_off_by_one'},{val:'17',tag:'err_off_by_one'}],
          a:1, e:'16 is more than 13!', d:'m', s:null, h:'Count each group — close numbers!'
        },
        // ── twoGroups compare, which is FEWER? ───────────────────────────────
        {
          t: 'Which group has FEWER — 🐦 or 🐠?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐦', rightCount:14, rightObj:'🐠', op:'compare'}},
          o: [{val:'14',tag:'err_more'},{val:'5'},{val:'9',tag:'err_same'},{val:'19',tag:'err_off_by_one'}],
          a:1, e:'5 is fewer than 14!', d:'e', s:null, h:'Fewer means less — the smaller group'
        },
        {
          t: 'Which group has FEWER — 🌺 or 🌻?',
          v: {type:'twoGroups', config:{leftCount:17, leftObj:'🌺', rightCount:8, rightObj:'🌻', op:'compare'}},
          o: [{val:'17',tag:'err_more'},{val:'8'},{val:'12',tag:'err_same'},{val:'25',tag:'err_off_by_one'}],
          a:1, e:'8 is fewer than 17!', d:'e', s:null, h:'Fewer = the smaller group'
        },
        {
          t: 'Which group has FEWER — 🍇 or 🍋?',
          v: {type:'twoGroups', config:{leftCount:11, leftObj:'🍇', rightCount:19, rightObj:'🍋', op:'compare'}},
          o: [{val:'19',tag:'err_more'},{val:'11'},{val:'15',tag:'err_same'},{val:'30',tag:'err_off_by_one'}],
          a:1, e:'11 is fewer than 19!', d:'m', s:null, h:'Which side has fewer objects?'
        },
        {
          t: 'Which group has FEWER — 🐥 or 🐣?',
          v: {type:'twoGroups', config:{leftCount:13, leftObj:'🐥', rightCount:20, rightObj:'🐣', op:'compare'}},
          o: [{val:'20',tag:'err_more'},{val:'13'},{val:'16',tag:'err_same'},{val:'33',tag:'err_off_by_one'}],
          a:1, e:'13 is fewer than 20!', d:'m', s:null, h:'Fewer = smaller count'
        },
        // ── Abstract comparison (v:null) ─────────────────────────────────────
        {
          t: 'Which is greater: 11 or 19?',
          v: null,
          o: [{val:'11',tag:'err_less'},{val:'19'},{val:'15',tag:'err_same'},{val:'8',tag:'err_off_by_one'}],
          a:1, e:'19 is greater — it comes later when you count!', d:'e', s:null, h:'Which number comes later when you count?'
        },
        {
          t: 'Which is less: 20 or 14?',
          v: null,
          o: [{val:'20',tag:'err_more'},{val:'14'},{val:'17',tag:'err_same'},{val:'7',tag:'err_off_by_one'}],
          a:1, e:'14 is less — it comes before 20!', d:'e', s:null, h:'Less = comes earlier in counting'
        },
        {
          t: 'Which is greater: 13 or 16?',
          v: null,
          o: [{val:'13',tag:'err_less'},{val:'16'},{val:'14',tag:'err_off_by_one'},{val:'29',tag:'err_off_by_one'}],
          a:1, e:'16 is greater than 13!', d:'m', s:null, h:'13 or 16 — which comes later?'
        },
        {
          t: 'Which is less: 18 or 12?',
          v: null,
          o: [{val:'18',tag:'err_more'},{val:'12'},{val:'15',tag:'err_same'},{val:'30',tag:'err_off_by_one'}],
          a:1, e:'12 is less than 18!', d:'m', s:null, h:'12 comes earlier in counting'
        },
        // ── Equal sets ───────────────────────────────────────────────────────
        {
          t: 'Are 15 and 15 equal?',
          v: null,
          o: [{val:'No, 15 is more',tag:'err_same'},{val:'Yes, they are equal'},{val:'No, 15 is less',tag:'err_same'},{val:'No, one is bigger',tag:'err_same'}],
          a:1, e:'15 = 15 — equal means the same amount!', d:'e', s:null, h:'Same number = equal'
        },
        {
          t: 'Which two numbers are EQUAL?',
          v: null,
          o: [{val:'12 and 14',tag:'err_off_by_one'},{val:'17 and 17'},{val:'18 and 16',tag:'err_off_by_one'},{val:'11 and 13',tag:'err_off_by_one'}],
          a:1, e:'17 and 17 are equal — same number!', d:'m', s:null, h:'Equal means both sides are the same'
        },
        {
          t: '🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶 vs 🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱 — are the groups equal?',
          v: {type:'twoGroups', config:{leftCount:13, leftObj:'🐶', rightCount:13, rightObj:'🐱', op:'compare'}},
          o: [{val:'No, 🐶 has more',tag:'err_same'},{val:'Yes, both have 13'},{val:'No, 🐱 has more',tag:'err_same'},{val:'No, they are different',tag:'err_same'}],
          a:1, e:'Both groups have 13 — they are equal!', d:'m', s:null, h:'Count each group — are they the same?'
        },
        {
          t: 'Which is greater: 14 or 20?',
          v: null,
          o: [{val:'14',tag:'err_less'},{val:'20'},{val:'17',tag:'err_same'},{val:'34',tag:'err_off_by_one'}],
          a:1, e:'20 is greater — it comes later when you count!', d:'e', s:null, h:'Which number is bigger?'
        },
        {
          t: 'Which group has MORE — 🐙 or 🦈?',
          v: {type:'twoGroups', config:{leftCount:20, leftObj:'🐙', rightCount:11, rightObj:'🦈', op:'compare'}},
          o: [{val:'11',tag:'err_less'},{val:'20'},{val:'15',tag:'err_same'},{val:'31',tag:'err_off_by_one'}],
          a:1, e:'20 is more than 11!', d:'m', s:null, h:'Count each side carefully'
        },
        {
          t: 'Which is less: 15 or 19?',
          v: null,
          o: [{val:'19',tag:'err_more'},{val:'15'},{val:'17',tag:'err_same'},{val:'4',tag:'err_off_by_one'}],
          a:1, e:'15 is less — it comes before 19!', d:'m', s:null, h:'Which comes earlier in counting?'
        }
      ]
    },

    // ── Lesson 4: One More / One Less Within 20 ──────────────────────────────
    {
      points: [
        'ONE MORE means count up one step — add 1 to the number',
        'ONE LESS means count back one step — subtract 1',
        'This works for ALL numbers up to 20!'
      ],
      examples: [
        {
          c: '#E91E63',
          tag: 'One More',
          p: 'There are 14 ⭐. If we add 1 more, how many will there be?',
          v: {type:'objectSet', config:{count:14, emoji:'⭐', layout:'grid'}},
          s: 'Count on one from 14: 15',
          a: '15 ✅ — one more than 14'
        },
        {
          c: '#C2185B',
          tag: 'One Less',
          p: 'One less than 19 is…?',
          v: null,
          s: 'Count back one step from 19: 18',
          a: '18 ✅ — one less than 19'
        },
        {
          c: '#AD1457',
          tag: 'At the Edge',
          p: 'One more than 20 is…?',
          v: null,
          s: '20 is our biggest number — we stop at 20 in this unit!',
          a: '20 is the top! ✅'
        }
      ],
      practice: [
        {q:'One more than 13 is…?', a:'14', h:'Count on from 13', e:'14! 13 + 1 = 14 ✅'},
        {q:'One less than 17 is…?', a:'16', h:'Count back from 17', e:'16! 17 - 1 = 16 ✅'},
        {q:'One more than 19 is…?', a:'20', h:'Count on from 19', e:'20! 19 + 1 = 20 ✅'}
      ],
      qBank: [
        // ── One more, objectSet ───────────────────────────────────────────────
        {
          t: 'There are 10 🌟. One more joins. How many now?',
          v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},
          o: [{val:'9',tag:'err_off_by_one'},{val:'10',tag:'err_same'},{val:'11'},{val:'12',tag:'err_off_by_one'}],
          a:2, e:'10 + 1 = 11!', d:'e', s:null, h:'Count on one from 10'
        },
        {
          t: 'Here are 12 🐦. One more flies in. How many?',
          v: {type:'objectSet', config:{count:12, emoji:'🐦', layout:'grid'}},
          o: [{val:'11',tag:'err_off_by_one'},{val:'12',tag:'err_same'},{val:'13'},{val:'14',tag:'err_off_by_one'}],
          a:2, e:'12 + 1 = 13!', d:'e', s:null, h:'Add one more bird'
        },
        {
          t: 'There are 13 🍎. Add 1 more. How many?',
          v: {type:'objectSet', config:{count:13, emoji:'🍎', layout:'grid'}},
          o: [{val:'12',tag:'err_off_by_one'},{val:'13',tag:'err_same'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
          a:2, e:'13 + 1 = 14!', d:'m', s:null, h:'One more means add 1'
        },
        {
          t: '14 🌸 in a vase. One more is added. How many now?',
          v: {type:'objectSet', config:{count:14, emoji:'🌸', layout:'grid'}},
          o: [{val:'13',tag:'err_off_by_one'},{val:'14',tag:'err_same'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
          a:2, e:'14 + 1 = 15!', d:'m', s:null, h:'Count the flowers then add one more'
        },
        // ── One more, v:null ─────────────────────────────────────────────────
        {
          t: 'One more than 15 is…?',
          v: null,
          o: [{val:'14',tag:'err_off_by_one'},{val:'15',tag:'err_same'},{val:'16'},{val:'17',tag:'err_off_by_one'}],
          a:2, e:'15 + 1 = 16!', d:'e', s:null, h:'Count forward one step from 15'
        },
        {
          t: 'One more than 16 is…?',
          v: null,
          o: [{val:'15',tag:'err_off_by_one'},{val:'16',tag:'err_same'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
          a:2, e:'16 + 1 = 17!', d:'e', s:null, h:'What comes right after 16?'
        },
        {
          t: 'One more than 18 is…?',
          v: null,
          o: [{val:'17',tag:'err_off_by_one'},{val:'18',tag:'err_same'},{val:'19'},{val:'20',tag:'err_off_by_one'}],
          a:2, e:'18 + 1 = 19!', d:'m', s:null, h:'Count on from 18'
        },
        {
          t: 'One more than 19 is…?',
          v: null,
          o: [{val:'17',tag:'err_teen'},{val:'18',tag:'err_off_by_one'},{val:'20'},{val:'21',tag:'err_off_by_one'}],
          a:2, e:'19 + 1 = 20 — all the way to 20!', d:'m', s:null, h:'Count on from 19'
        },
        // ── One less, v:null ─────────────────────────────────────────────────
        {
          t: 'One less than 12 is…?',
          v: null,
          o: [{val:'10',tag:'err_off_by_one'},{val:'11'},{val:'12',tag:'err_same'},{val:'13',tag:'err_off_by_one'}],
          a:1, e:'12 - 1 = 11!', d:'e', s:null, h:'Count back one step from 12'
        },
        {
          t: 'One less than 14 is…?',
          v: null,
          o: [{val:'12',tag:'err_off_by_one'},{val:'13'},{val:'14',tag:'err_same'},{val:'15',tag:'err_off_by_one'}],
          a:1, e:'14 - 1 = 13!', d:'e', s:null, h:'What comes just before 14?'
        },
        {
          t: 'One less than 16 is…?',
          v: null,
          o: [{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_same'},{val:'17',tag:'err_off_by_one'}],
          a:1, e:'16 - 1 = 15!', d:'m', s:null, h:'Count back from 16'
        },
        {
          t: 'One less than 20 is…?',
          v: null,
          o: [{val:'17',tag:'err_off_by_one'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_same'}],
          a:2, e:'20 - 1 = 19!', d:'m', s:null, h:'Count back one step from 20'
        },
        // ── One less, higher teen range ──────────────────────────────────────
        {
          t: 'One less than 17 is…?',
          v: null,
          o: [{val:'15',tag:'err_off_by_one'},{val:'16'},{val:'17',tag:'err_same'},{val:'18',tag:'err_teen'}],
          a:1, e:'17 - 1 = 16!', d:'m', s:null, h:'Go back one from 17'
        },
        {
          t: 'One less than 18 is…?',
          v: null,
          o: [{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_same'},{val:'19',tag:'err_teen'}],
          a:1, e:'18 - 1 = 17!', d:'m', s:null, h:'Go back one from 18'
        },
        {
          t: 'One less than 13 is…?',
          v: null,
          o: [{val:'11',tag:'err_off_by_one'},{val:'12'},{val:'13',tag:'err_same'},{val:'14',tag:'err_teen'}],
          a:1, e:'13 - 1 = 12!', d:'e', s:null, h:'Count back one from 13'
        },
        {
          t: 'There are 11 🌺. One more blooms. How many now?',
          v: {type:'objectSet', config:{count:11, emoji:'🌺', layout:'grid'}},
          o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_same'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
          a:2, e:'11 + 1 = 12!', d:'e', s:null, h:'Add one more flower'
        },
        {
          t: 'There are 15 🐦. One flies away. How many are left?',
          v: {type:'objectSet', config:{count:15, emoji:'🐦', layout:'grid'}},
          o: [{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_same'},{val:'16',tag:'err_off_by_one'}],
          a:1, e:'15 - 1 = 14!', d:'m', s:null, h:'One flies away — count back one'
        },
        {
          t: 'One more than 17 is…?',
          v: null,
          o: [{val:'16',tag:'err_off_by_one'},{val:'17',tag:'err_same'},{val:'18'},{val:'19',tag:'err_off_by_one'}],
          a:2, e:'17 + 1 = 18!', d:'m', s:null, h:'Count forward one step from 17'
        }
      ]
    }
  ],

  testBank: [
    // ── L1: Count to 20 ──────────────────────────────────────────────────────
    {
      t: 'What number comes after 13?',
      v: null,
      o: [{val:'12',tag:'err_under_count'},{val:'13',tag:'err_same'},{val:'14'},{val:'15',tag:'err_off_by_one'}],
      a:2, e:'14 comes after 13!', d:'e', s:null, h:'Count forward from 13'
    },
    {
      t: 'Count the 🍎 apples. How many?',
      v: {type:'objectSet', config:{count:17, emoji:'🍎', layout:'grid'}},
      o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
      a:2, e:'17 apples!', d:'m', s:null, h:'Count carefully row by row'
    },
    {
      t: '19, __, 17 — what number is missing?',
      v: null,
      o: [{val:'15',tag:'err_under_count'},{val:'16',tag:'err_off_by_one'},{val:'18'},{val:'20',tag:'err_same'}],
      a:2, e:'18 goes between 19 and 17 when counting back!', d:'m', s:null, h:'Count backward from 19'
    },
    {
      t: '15, 16, __, 18 — what number is missing?',
      v: null,
      o: [{val:'14',tag:'err_under_count'},{val:'15',tag:'err_off_by_one'},{val:'17'},{val:'19',tag:'err_off_by_one'}],
      a:2, e:'17 goes between 16 and 18!', d:'m', s:null, h:'What comes after 16?'
    },
    // ── L2: Read and Represent 11–20 ─────────────────────────────────────────
    {
      t: 'Count the 🌟 stars. How many?',
      v: {type:'objectSet', config:{count:15, emoji:'🌟', layout:'grid'}},
      o: [{val:'13',tag:'err_teen'},{val:'14',tag:'err_off_by_one'},{val:'15'},{val:'16',tag:'err_off_by_one'}],
      a:2, e:'15 stars — ten and five more!', d:'e', s:null, h:'Count past 10'
    },
    {
      t: '11 = 10 + how many extras?',
      v: {type:'objectSet', config:{count:11, emoji:'🌙', layout:'grid'}},
      o: [{val:'0',tag:'err_teen'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'11',tag:'err_teen'}],
      a:1, e:'11 = 10 + 1!', d:'e', s:null, h:'Count past the first 10'
    },
    {
      t: 'Which number is "fourteen"?',
      v: null,
      o: [{val:'4',tag:'err_teen'},{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'40',tag:'err_teen'}],
      a:2, e:'Fourteen = 14!', d:'m', s:null, h:'Fourteen: ten and four more'
    },
    {
      t: '17 = 10 + how many extras?',
      v: null,
      o: [{val:'5',tag:'err_teen'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'17 = 10 + 7!', d:'m', s:null, h:'How many beyond 10?'
    },
    // ── L3: More, Less, and Equal ─────────────────────────────────────────────
    {
      t: 'Which side has MORE — 🐶 or 🐱?',
      v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐶', rightCount:15, rightObj:'🐱', op:'compare'}},
      o: [{val:'8',tag:'err_less'},{val:'15'},{val:'11',tag:'err_same'},{val:'23',tag:'err_off_by_one'}],
      a:1, e:'15 is more than 8!', d:'e', s:null, h:'Count each group'
    },
    {
      t: 'Which is less: 17 or 11?',
      v: null,
      o: [{val:'17',tag:'err_more'},{val:'11'},{val:'14',tag:'err_same'},{val:'28',tag:'err_off_by_one'}],
      a:1, e:'11 is less than 17!', d:'e', s:null, h:'Which comes earlier in counting?'
    },
    {
      t: 'Which group has FEWER — 🦋 or 🐝?',
      v: {type:'twoGroups', config:{leftCount:12, leftObj:'🦋', rightCount:18, rightObj:'🐝', op:'compare'}},
      o: [{val:'18',tag:'err_more'},{val:'12'},{val:'15',tag:'err_same'},{val:'6',tag:'err_off_by_one'}],
      a:1, e:'12 is fewer than 18!', d:'m', s:null, h:'Fewer = the smaller group'
    },
    {
      t: 'Are 14 🌺 and 14 🌻 equal?',
      v: {type:'twoGroups', config:{leftCount:14, leftObj:'🌺', rightCount:14, rightObj:'🌻', op:'compare'}},
      o: [{val:'No, left has more',tag:'err_same'},{val:'Yes, both have 14'},{val:'No, right has more',tag:'err_same'},{val:'No, they are different',tag:'err_same'}],
      a:1, e:'Both are 14 — equal!', d:'m', s:null, h:'Count each group'
    },
    // ── L4: One More / One Less ───────────────────────────────────────────────
    {
      t: 'One more than 11 is…?',
      v: null,
      o: [{val:'10',tag:'err_off_by_one'},{val:'11',tag:'err_same'},{val:'12'},{val:'13',tag:'err_off_by_one'}],
      a:2, e:'11 + 1 = 12!', d:'e', s:null, h:'Count forward from 11'
    },
    {
      t: 'One less than 15 is…?',
      v: null,
      o: [{val:'13',tag:'err_off_by_one'},{val:'14'},{val:'15',tag:'err_same'},{val:'16',tag:'err_off_by_one'}],
      a:1, e:'15 - 1 = 14!', d:'e', s:null, h:'Count back one from 15'
    },
    {
      t: 'There are 16 🌟. One more joins. How many now?',
      v: {type:'objectSet', config:{count:16, emoji:'🌟', layout:'grid'}},
      o: [{val:'15',tag:'err_off_by_one'},{val:'16',tag:'err_same'},{val:'17'},{val:'18',tag:'err_off_by_one'}],
      a:2, e:'16 + 1 = 17!', d:'m', s:null, h:'Add one more to the group'
    },
    {
      t: 'What is one less than 20?',
      v: null,
      o: [{val:'17',tag:'err_off_by_one'},{val:'18',tag:'err_off_by_one'},{val:'19'},{val:'20',tag:'err_same'}],
      a:2, e:'20 - 1 = 19!', d:'m', s:null, h:'Count back one from 20'
    }
  ]
});
