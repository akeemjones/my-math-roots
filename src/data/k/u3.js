_mergeKUnitData(2, {
  lessons: [

    // ── Lesson 1: Adding Numbers ─────────────────────────────────────────────
    {
      points: [
        'Adding means putting two groups together to find the total',
        'You can count all objects or count on from the bigger number',
        'The plus sign (+) means we are joining groups together'
      ],
      examples: [
        {
          c: '#FF7043',
          tag: 'Count All',
          p: 'There are 3 🍓 and 2 more 🍓. How many in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🍓', rightCount:2, rightObj:'🍓', op:'add'}},
          s: 'Count all of them: 1, 2, 3 … 4, 5',
          a: '5 strawberries ✅'
        },
        {
          c: '#FF5722',
          tag: 'Count On',
          p: '6 + 2 = ?',
          v: {type:'twoGroups', config:{leftCount:6, leftObj:'🌙', rightCount:2, rightObj:'🌙', op:'add'}},
          s: 'Start at 6 and count on 2 more: 7, 8',
          a: '8 ✅'
        },
        {
          c: '#E64A19',
          tag: 'Zero Added',
          p: '5 + 0 = ?',
          v: null,
          s: 'Adding zero changes nothing — still 5',
          a: '5 ✅'
        }
      ],
      practice: [
        {q:'3 + 4 = ?', a:'7', h:'Count on from 3: four, five, six, seven', e:'3 + 4 = 7! ✅'},
        {q:'2 + 5 = ?', a:'7', h:'Start at 5 and count 2 more', e:'2 + 5 = 7! ✅'},
        {q:'4 + 6 = ?', a:'10', h:'Count on from 6: seven, eight, nine, ten', e:'4 + 6 = 10! ✅'}
      ],
      qBank: [
        {
          t: '3 🐦 sit on a branch. 2 more 🐦 land. How many 🐦 in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐦', rightCount:2, rightObj:'🐦', op:'add'}},
          o: [{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_over_count'}],
          a:2, e:'3 + 2 = 5!', d:'e', s:null, h:'Count all the birds'
        },
        {
          t: '2 + 4 = ?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🍓', rightCount:4, rightObj:'🍓', op:'add'}},
          o: [{val:'4',tag:'err_keep_start'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'2 + 4 = 6!', d:'e', s:null, h:'Count on from 4: five, six'
        },
        {
          t: '4 🐞 land on a leaf. 3 more join them. How many 🐞 are there?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐞', rightCount:3, rightObj:'🐞', op:'add'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'4 + 3 = 7!', d:'m', s:null, h:'Count on from 4: five, six, seven'
        },
        {
          t: '1 + 5 = ?',
          v: {type:'twoGroups', config:{leftCount:1, leftObj:'⭐', rightCount:5, rightObj:'⭐', op:'add'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_keep_start'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'1 + 5 = 6!', d:'e', s:null, h:'Start at 5 and count 1 more'
        },
        {
          t: '5 🐠 swim in a tank. 2 more swim in. How many 🐠 in total?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐠', rightCount:2, rightObj:'🐠', op:'add'}},
          o: [{val:'5',tag:'err_keep_start'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'5 + 2 = 7!', d:'e', s:null, h:'Count on from 5: six, seven'
        },
        {
          t: '0 + 6 = ?',
          v: null,
          o: [{val:'0',tag:'err_keep_start'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'Adding zero gives you 6!', d:'e', s:null, h:'Adding 0 changes nothing'
        },
        {
          t: '6 🌺 are in a vase. 4 more 🌺 are added. How many 🌺 are in the vase now?',
          v: {type:'twoGroups', config:{leftCount:6, leftObj:'🌺', rightCount:4, rightObj:'🌺', op:'add'}},
          o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'6 + 4 = 10!', d:'m', s:null, h:'Count on from 6: seven, eight, nine, ten'
        },
        {
          t: '3 + 3 = ?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌙', rightCount:3, rightObj:'🌙', op:'add'}},
          o: [{val:'3',tag:'err_keep_start'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'3 + 3 = 6!', d:'e', s:null, h:'Count on from 3: four, five, six'
        },
        {
          t: 'You have 4 🍬 in one hand and 3 🍬 in the other. How many 🍬 do you have?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🍬', rightCount:3, rightObj:'🍬', op:'add'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'4 + 3 = 7!', d:'m', s:null, h:'Count on from 4: five, six, seven'
        },
        {
          t: '2 + 2 = ?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🎈', rightCount:2, rightObj:'🎈', op:'add'}},
          o: [{val:'2',tag:'err_keep_start'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'2 + 2 = 4!', d:'e', s:null, h:'Count on from 2: three, four'
        },
        {
          t: '5 🐣 are in a nest. 5 more 🐣 hatch. How many 🐣 are there now?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐣', rightCount:5, rightObj:'🐣', op:'add'}},
          o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'5 + 5 = 10!', d:'m', s:null, h:'Count on from 5: six, seven, eight, nine, ten'
        },
        {
          t: '7 + 1 = ?',
          v: {type:'twoGroups', config:{leftCount:7, leftObj:'🦋', rightCount:1, rightObj:'🦋', op:'add'}},
          o: [{val:'7',tag:'err_keep_start'},{val:'8'},{val:'9',tag:'err_off_by_one'},{val:'10',tag:'err_random'}],
          a:1, e:'7 + 1 = 8!', d:'e', s:null, h:'Count 1 more than 7'
        },
        {
          t: '4 🐸 sit on a log. 4 more 🐸 hop on. How many 🐸 are on the log?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐸', rightCount:4, rightObj:'🐸', op:'add'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'4 + 4 = 8!', d:'m', s:null, h:'Count on from 4: five, six, seven, eight'
        },
        {
          t: '3 + 0 = ?',
          v: null,
          o: [{val:'0',tag:'err_random'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'Adding 0 keeps the number the same — 3 + 0 = 3!', d:'e', s:null, h:'Adding 0 changes nothing'
        },
        {
          t: '2 🌟 are on the left. 8 🌟 are on the right. How many 🌟 altogether?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🌟', rightCount:8, rightObj:'🌟', op:'add'}},
          o: [{val:'8',tag:'err_keep_start'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'2 + 8 = 10!', d:'m', s:null, h:'Count on from 8: nine, ten'
        }
      ]
    },

    // ── Lesson 2: Subtracting Numbers ────────────────────────────────────────
    {
      points: [
        'Subtracting means taking away from a group to find what is left',
        'Start with the total and count back to find the answer',
        'The minus sign (-) means we are taking something away'
      ],
      examples: [
        {
          c: '#1565C0',
          tag: 'Take Away',
          p: '5 🍎 on a plate. You eat 2. How many are left?',
          v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'line'}},
          s: 'Start at 5 and count back 2: 4, 3',
          a: '3 apples ✅'
        },
        {
          c: '#1976D2',
          tag: 'Subtract Zero',
          p: '7 - 0 = ?',
          v: null,
          s: 'Subtracting zero changes nothing — still 7',
          a: '7 ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Subtract All',
          p: '4 - 4 = ?',
          v: {type:'objectSet', config:{count:4, emoji:'🍪', layout:'line'}},
          s: 'Take all 4 away from 4 — nothing is left!',
          a: '0 ✅'
        }
      ],
      practice: [
        {q:'6 - 2 = ?', a:'4', h:'Start at 6, count back 2: five, four', e:'6 - 2 = 4! ✅'},
        {q:'8 - 3 = ?', a:'5', h:'Start at 8, count back 3: seven, six, five', e:'8 - 3 = 5! ✅'},
        {q:'10 - 6 = ?', a:'4', h:'Count back 6 from 10', e:'10 - 6 = 4! ✅'}
      ],
      qBank: [
        {
          t: '5 🍎 are on a plate. You eat 2. How many 🍎 are left?',
          v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'line'}},
          o: [{val:'2',tag:'err_count_all'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_keep_start'}],
          a:1, e:'5 - 2 = 3!', d:'e', s:null, h:'Start at 5 and count back 2'
        },
        {
          t: '6 - 3 = ?',
          v: {type:'objectSet', config:{count:6, emoji:'🧩', layout:'line'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'6',tag:'err_keep_start'},{val:'9',tag:'err_add_instead'}],
          a:1, e:'6 - 3 = 3!', d:'e', s:null, h:'Start at 6 and count back 3'
        },
        {
          t: '8 🐦 sit on a wire. 3 fly away. How many 🐦 stay?',
          v: {type:'objectSet', config:{count:8, emoji:'🐦', layout:'line'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'8',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
          a:1, e:'8 - 3 = 5!', d:'m', s:null, h:'Start at 8 and count back 3: seven, six, five'
        },
        {
          t: '4 - 1 = ?',
          v: {type:'objectSet', config:{count:4, emoji:'🌻', layout:'line'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_keep_start'},{val:'5',tag:'err_add_instead'}],
          a:1, e:'4 - 1 = 3!', d:'e', s:null, h:'1 less than 4 is 3'
        },
        {
          t: 'There are 7 🍪 in the jar. You take out 4. How many 🍪 are left?',
          v: {type:'objectSet', config:{count:7, emoji:'🍪', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'7',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
          a:1, e:'7 - 4 = 3!', d:'m', s:null, h:'Count back 4 from 7'
        },
        {
          t: '10 - 5 = ?',
          v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'10',tag:'err_keep_start'},{val:'15',tag:'err_add_instead'}],
          a:1, e:'10 - 5 = 5!', d:'m', s:null, h:'Count back 5 from 10: nine, eight, seven, six, five'
        },
        {
          t: '9 🐝 are in a hive. 2 fly out. How many 🐝 are still inside?',
          v: {type:'objectSet', config:{count:9, emoji:'🐝', layout:'grid'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'9',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
          a:1, e:'9 - 2 = 7!', d:'m', s:null, h:'Count back 2 from 9: eight, seven'
        },
        {
          t: '3 - 3 = ?',
          v: {type:'objectSet', config:{count:3, emoji:'🍩', layout:'line'}},
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'3',tag:'err_keep_start'},{val:'6',tag:'err_add_instead'}],
          a:0, e:'When you take all away, 0 are left! 3 - 3 = 0', d:'m', s:null, h:'Take away all 3 from 3'
        },
        {
          t: '6 🌮 are on the table. 2 are eaten. How many 🌮 remain?',
          v: {type:'objectSet', config:{count:6, emoji:'🌮', layout:'line'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_keep_start'},{val:'8',tag:'err_add_instead'}],
          a:1, e:'6 - 2 = 4!', d:'e', s:null, h:'Count back 2 from 6: five, four'
        },
        {
          t: '8 - 6 = ?',
          v: {type:'objectSet', config:{count:8, emoji:'🍒', layout:'grid'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'8',tag:'err_keep_start'},{val:'14',tag:'err_add_instead'}],
          a:1, e:'8 - 6 = 2!', d:'m', s:null, h:'Count back 6 from 8: seven, six, five, four, three, two'
        },
        {
          t: '5 stars shine in the sky. 3 clouds cover them. How many stars can you still see?',
          v: {type:'objectSet', config:{count:5, emoji:'🌟', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'5',tag:'err_keep_start'},{val:'8',tag:'err_add_instead'}],
          a:1, e:'5 - 3 = 2!', d:'e', s:null, h:'Count back 3 from 5: four, three, two'
        },
        {
          t: '7 - 4 = ?',
          v: {type:'objectSet', config:{count:7, emoji:'🍇', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'7',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
          a:1, e:'7 - 4 = 3!', d:'m', s:null, h:'Count back 4 from 7'
        },
        {
          t: 'There are 4 🎀 on the table. You give 2 away. How many 🎀 are left?',
          v: {type:'objectSet', config:{count:4, emoji:'🎀', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'4',tag:'err_keep_start'},{val:'6',tag:'err_add_instead'}],
          a:1, e:'4 - 2 = 2!', d:'e', s:null, h:'Count back 2 from 4: three, two'
        },
        {
          t: '10 - 3 = ?',
          v: {type:'objectSet', config:{count:10, emoji:'🏐', layout:'grid'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'10',tag:'err_keep_start'},{val:'13',tag:'err_add_instead'}],
          a:1, e:'10 - 3 = 7!', d:'m', s:null, h:'Count back 3 from 10: nine, eight, seven'
        },
        {
          t: '6 🐠 are in a bowl. 6 are taken out. How many 🐠 are left?',
          v: {type:'objectSet', config:{count:6, emoji:'🐠', layout:'line'}},
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'6',tag:'err_keep_start'},{val:'12',tag:'err_add_instead'}],
          a:0, e:'When all are taken out, 0 are left! 6 - 6 = 0', d:'m', s:null, h:'Take all 6 away from 6'
        }
      ]
    },

    // ── Lesson 3: Word Problems ──────────────────────────────────────────────
    {
      points: [
        'Word problems tell a story — figure out if you join (add) or take away (subtract)',
        'Clue words: "more", "join", "in all" mean add; "away", "left", "remain" mean subtract',
        'Missing part problems: find the unknown number using what you know'
      ],
      examples: [
        {
          c: '#7B1FA2',
          tag: 'Joining Story',
          p: 'There were 3 dogs at the park. 4 more came. How many dogs in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐶', rightCount:4, rightObj:'🐶', op:'add'}},
          s: '"In all" means add. 3 + 4 = 7',
          a: '7 dogs ✅'
        },
        {
          c: '#8E24AA',
          tag: 'Separating Story',
          p: '8 fish swam in the pond. 5 swam away. How many fish are left?',
          v: {type:'objectSet', config:{count:8, emoji:'🐟', layout:'line'}},
          s: '"Swam away" means subtract. 8 - 5 = 3',
          a: '3 fish ✅'
        },
        {
          c: '#6A1B9A',
          tag: 'Missing Part',
          p: 'Some flew away and 4 are still there. There were 9 total. How many flew away?',
          v: null,
          s: '9 - ? = 4 → think: what + 4 = 9? → 5 flew away',
          a: '5 ✅'
        }
      ],
      practice: [
        {q:'There were 5 cats. 2 cats went home. How many cats are still there?', a:'3', h:'Went home = take away', e:'5 - 2 = 3! ✅'},
        {q:'Kim has 3 red blocks and 6 blue blocks. How many blocks total?', a:'9', h:'Total = add them together', e:'3 + 6 = 9! ✅'},
        {q:'A bag had some marbles. 4 fell out and 5 are left. How many were in the bag?', a:'9', h:'Think: ? - 4 = 5', e:'9 - 4 = 5, so there were 9 marbles! ✅'}
      ],
      qBank: [
        {
          t: 'There were 3 dogs at the park. 4 more dogs came. How many dogs are there now?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐶', rightCount:4, rightObj:'🐶', op:'add'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'3 + 4 = 7!', d:'e', s:null, h:'Dogs came = add'
        },
        {
          t: 'You had 5 apples. Your friend gave you 3 more. How many apples do you have?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🍎', rightCount:3, rightObj:'🍎', op:'add'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'5 + 3 = 8!', d:'e', s:null, h:'Gave you more = add'
        },
        {
          t: 'A bird had 2 eggs. She laid 4 more. How many eggs does she have?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🥚', rightCount:4, rightObj:'🥚', op:'add'}},
          o: [{val:'4',tag:'err_keep_start'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'2 + 4 = 6!', d:'e', s:null, h:'Laid more eggs = add'
        },
        {
          t: 'There were 8 fish in the pond. 3 swam away. How many fish are left in the pond?',
          v: {type:'objectSet', config:{count:8, emoji:'🐟', layout:'grid'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'8',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
          a:1, e:'8 - 3 = 5!', d:'e', s:null, h:'Swam away = subtract'
        },
        {
          t: 'Mom baked 6 muffins. The family ate 2. How many muffins are left?',
          v: {type:'objectSet', config:{count:6, emoji:'🧁', layout:'line'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_keep_start'},{val:'8',tag:'err_add_instead'}],
          a:1, e:'6 - 2 = 4!', d:'e', s:null, h:'Ate = subtract'
        },
        {
          t: 'There are 4 cats napping. 4 more cats join them. How many cats are there now?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐱', rightCount:4, rightObj:'🐱', op:'add'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'4 + 4 = 8!', d:'e', s:null, h:'Join = add'
        },
        {
          t: 'Ben had 7 balloons. 2 popped. How many balloons does Ben have left?',
          v: {type:'objectSet', config:{count:7, emoji:'🎈', layout:'line'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'7',tag:'err_keep_start'},{val:'9',tag:'err_add_instead'}],
          a:1, e:'7 - 2 = 5!', d:'e', s:null, h:'Popped = subtract'
        },
        {
          t: 'A bag has 5 red blocks and 3 blue blocks. How many blocks are in the bag?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🟥', rightCount:3, rightObj:'🟦', op:'add'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'5 + 3 = 8!', d:'m', s:null, h:'Count both groups together'
        },
        {
          t: 'Mia had 10 stickers. She gave 4 to her friend. How many stickers does Mia have?',
          v: {type:'objectSet', config:{count:10, emoji:'⭐', layout:'grid'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'10',tag:'err_keep_start'},{val:'14',tag:'err_add_instead'}],
          a:1, e:'10 - 4 = 6!', d:'m', s:null, h:'Gave away = subtract'
        },
        {
          t: 'There are 9 crayons in the box. Some are red and 4 are blue. How many are red?',
          v: null,
          o: [{val:'4',tag:'err_keep_start'},{val:'5'},{val:'9',tag:'err_keep_total'},{val:'13',tag:'err_add_instead'}],
          a:1, e:'9 - 4 = 5, so 5 are red!', d:'m', s:null, h:'Think: ? + 4 = 9'
        },
        {
          t: 'Some birds were on a wire. 3 flew away and 7 are left. How many were there at the start?',
          v: null,
          o: [{val:'4',tag:'err_off_by_one'},{val:'7',tag:'err_keep_start'},{val:'10'},{val:'21',tag:'err_random'}],
          a:2, e:'7 + 3 = 10, so there were 10 birds!', d:'m', s:null, h:'Think: ? - 3 = 7'
        },
        {
          t: 'Sam collected 3 shells on Monday and 5 shells on Tuesday. How many shells in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐚', rightCount:5, rightObj:'🐚', op:'add'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'3 + 5 = 8!', d:'m', s:null, h:'In all = add both days together'
        },
        {
          t: 'There were 9 kids in the pool. 6 got out. How many kids are still in the pool?',
          v: {type:'objectSet', config:{count:9, emoji:'🏊', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'9',tag:'err_keep_start'},{val:'15',tag:'err_add_instead'}],
          a:1, e:'9 - 6 = 3!', d:'m', s:null, h:'Got out = subtract'
        },
        {
          t: 'A tree had some apples. 2 fell down and 6 are still on the tree. How many apples at first?',
          v: null,
          o: [{val:'4',tag:'err_off_by_one'},{val:'6',tag:'err_keep_start'},{val:'8'},{val:'12',tag:'err_add_instead'}],
          a:2, e:'6 + 2 = 8, so there were 8 apples at first!', d:'m', s:null, h:'Think: ? - 2 = 6'
        },
        {
          t: 'Leo had 1 toy car. His grandma gave him 8 more. How many toy cars does Leo have now?',
          v: {type:'twoGroups', config:{leftCount:1, leftObj:'🚗', rightCount:8, rightObj:'🚗', op:'add'}},
          o: [{val:'7',tag:'err_off_by_one'},{val:'8',tag:'err_keep_start'},{val:'9'},{val:'10',tag:'err_off_by_one'}],
          a:2, e:'1 + 8 = 9!', d:'m', s:null, h:'Gave him more = add'
        },
        {
          t: 'A farmer had some chickens. 3 hatched and now there are 8 total. How many were there before?',
          v: null,
          o: [{val:'3',tag:'err_count_all'},{val:'5'},{val:'8',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
          a:1, e:'8 - 3 = 5, so there were 5 chickens before!', d:'m', s:null, h:'Think: ? + 3 = 8'
        },
        {
          t: 'There were 6 children at lunch. 2 went to recess. How many children are still at lunch?',
          v: {type:'objectSet', config:{count:6, emoji:'🧒', layout:'line'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_keep_start'},{val:'8',tag:'err_add_instead'}],
          a:1, e:'6 - 2 = 4!', d:'e', s:null, h:'Went to recess = subtract'
        }
      ]
    },

    // ── Lesson 4: Explain Thinking ───────────────────────────────────────────
    {
      points: [
        'Being able to explain your thinking shows you really understand math',
        'Use words like "I added because..." or "I counted back from..."',
        'Check your work: add to check subtraction, subtract to check addition'
      ],
      examples: [
        {
          c: '#00796B',
          tag: 'Explain Adding',
          p: 'How do you know 4 + 3 = 7?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🔵', rightCount:3, rightObj:'🔵', op:'add'}},
          s: 'I started at 4 and counted on 3 more: 5, 6, 7 — that is 3 steps, so 4 + 3 = 7',
          a: '7 ✅'
        },
        {
          c: '#00897B',
          tag: 'Explain Subtracting',
          p: 'How do you know 9 - 4 = 5?',
          v: {type:'objectSet', config:{count:9, emoji:'🎯', layout:'grid'}},
          s: 'I started at 9 and counted back 4: 8, 7, 6, 5 — that is 4 steps back, so 9 - 4 = 5',
          a: '5 ✅'
        },
        {
          c: '#004D40',
          tag: 'Choose the Operation',
          p: 'You have 6 pencils and get 2 more. Which operation do you use?',
          v: null,
          s: '"Get more" means joining, so I add: 6 + 2 = 8',
          a: 'Addition — 6 + 2 = 8 ✅'
        }
      ],
      practice: [
        {q:'Which number sentence shows 5 + 3?', a:'5 + 3 = 8', h:'Look for the sentence that joins 5 and 3', e:'5 + 3 = 8 is the correct number sentence! ✅'},
        {q:'Is 7 - 2 = 6 correct? Explain.', a:'No, 7 - 2 = 5', h:'Count back 2 from 7: six, five', e:'Count back 2 from 7 — you land on 5, not 6! ✅'},
        {q:'Which shows the best strategy for 8 - 5?', a:'Start at 8 and count back 5', h:'Think about what strategy makes subtracting easier', e:'Count back from 8: seven, six, five, four, three — that is 5 steps! ✅'}
      ],
      qBank: [
        {
          t: 'Which number sentence shows 3 + 2?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🔵', rightCount:2, rightObj:'🔵', op:'add'}},
          o: [{val:'3 - 2 = 1',tag:'err_sub_instead'},{val:'2 + 2 = 4',tag:'err_random'},{val:'3 + 2 = 5'},{val:'3 + 3 = 6',tag:'err_random'}],
          a:2, e:'3 + 2 = 5 matches the picture!', d:'e', s:null, h:'Count both groups to check'
        },
        {
          t: 'Maria says 4 + 2 = 7. Is she right?',
          v: null,
          o: [{val:'Yes, she is right',tag:'err_random'},{val:'No, 4 + 2 = 6'},{val:'No, 4 + 2 = 5',tag:'err_off_by_one'},{val:'No, 4 + 2 = 8',tag:'err_random'}],
          a:1, e:'4 + 2 = 6, not 7. Count on from 4: five, six!', d:'m', s:null, h:'Count on from 4: five, six'
        },
        {
          t: 'Which is the best way to find 6 - 2?',
          v: null,
          o: [{val:'Count all: 1, 2, 3, 4, 5, 6',tag:'err_count_all'},{val:'Start at 6 and count back 2: 5, 4'},{val:'Add 6 + 2',tag:'err_add_instead'},{val:'Start at 2 and count up to 6',tag:'err_random'}],
          a:1, e:'Start at 6 and count back 2 — you land on 4!', d:'m', s:null, h:'Subtracting = counting back'
        },
        {
          t: 'Sam has 5 blocks. He gets more. Now he has 9. Which number sentence fits?',
          v: null,
          o: [{val:'5 - 4 = 1',tag:'err_sub_instead'},{val:'9 - 5 = 4',tag:'err_sub_instead'},{val:'5 + 4 = 9'},{val:'5 + 5 = 10',tag:'err_random'}],
          a:2, e:'He gets more, so we add: 5 + 4 = 9!', d:'m', s:null, h:'Gets more = addition'
        },
        {
          t: 'Which shows 7 - 3?',
          v: {type:'objectSet', config:{count:7, emoji:'🍕', layout:'line'}},
          o: [{val:'7 + 3 = 10',tag:'err_add_instead'},{val:'7 - 3 = 3',tag:'err_off_by_one'},{val:'7 - 3 = 4'},{val:'7 - 3 = 5',tag:'err_off_by_one'}],
          a:2, e:'7 - 3 = 4! Count back 3 from 7: six, five, four', d:'e', s:null, h:'Count back 3 from 7'
        },
        {
          t: 'How do you know that 5 + 5 = 10?',
          v: null,
          o: [{val:'Because 5 + 5 is more than 10',tag:'err_random'},{val:'Count on from 5 five more times: six, seven, eight, nine, ten'},{val:'Because 5 + 4 = 9',tag:'err_off_by_one'},{val:'Because you subtract 5 from 10',tag:'err_sub_instead'}],
          a:1, e:'Counting on from 5 five more times gives you 10!', d:'m', s:null, h:'Start at 5 and count 5 more'
        },
        {
          t: 'Lily has 8 grapes. She eats some and has 3 left. Which number sentence fits?',
          v: null,
          o: [{val:'8 + 3 = 11',tag:'err_add_instead'},{val:'3 + 5 = 8',tag:'err_random'},{val:'8 - 5 = 3'},{val:'8 - 3 = 5',tag:'err_random'}],
          a:2, e:'She eats some and 3 are left: 8 - 5 = 3!', d:'m', s:null, h:'Ate some = subtraction'
        },
        {
          t: 'Which is the same as 4 + 3?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🔷', rightCount:3, rightObj:'🔷', op:'add'}},
          o: [{val:'3 + 3 = 6',tag:'err_random'},{val:'3 + 4 = 7'},{val:'4 + 4 = 8',tag:'err_random'},{val:'7 - 3 = 4',tag:'err_sub_instead'}],
          a:1, e:'3 + 4 = 7 is the same as 4 + 3 = 7 — order does not matter!', d:'m', s:null, h:'Adding in any order gives the same total'
        },
        {
          t: 'Start at 3. Count up 5 more. Where do you land?',
          v: null,
          o: [{val:'5',tag:'err_random'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'3 + 5 = 8! Count: four, five, six, seven, eight', d:'e', s:null, h:'Count on from 3 five times'
        },
        {
          t: 'Which tells you how many are left after 9 - 4?',
          v: {type:'objectSet', config:{count:9, emoji:'🎯', layout:'grid'}},
          o: [{val:'4',tag:'err_keep_start'},{val:'5'},{val:'9',tag:'err_keep_total'},{val:'13',tag:'err_add_instead'}],
          a:1, e:'9 - 4 = 5! Count back 4 from 9: eight, seven, six, five', d:'m', s:null, h:'Count back 4 from 9'
        },
        {
          t: 'Tom says counting all of the objects gives you 3 + 4. Is he right?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🔴', rightCount:4, rightObj:'🔵', op:'add'}},
          o: [{val:'No, you must subtract',tag:'err_sub_instead'},{val:'Yes, counting all of them gives you 7'},{val:'No, counting all gives 6',tag:'err_off_by_one'},{val:'Yes, but only if the groups are equal',tag:'err_random'}],
          a:1, e:'Counting all objects in both groups: 1, 2, 3, 4, 5, 6, 7 — yes, that is 7!', d:'m', s:null, h:'Count every object in both groups'
        },
        {
          t: 'Which is the best way to check that 6 + 3 = 9?',
          v: null,
          o: [{val:'Guess and check',tag:'err_random'},{val:'Count only the second group',tag:'err_count_all'},{val:'Count on from 6: seven, eight, nine — yes, 3 more'},{val:'Subtract 9 - 6, which gives a different answer',tag:'err_random'}],
          a:2, e:'Counting on from 6 three times lands on 9 — correct!', d:'m', s:null, h:'Start at 6 and count 3 more'
        },
        {
          t: 'Which number sentence matches: A pond had 7 frogs. 4 jumped away. How many remain?',
          v: {type:'objectSet', config:{count:7, emoji:'🐸', layout:'line'}},
          o: [{val:'7 + 4 = 11',tag:'err_add_instead'},{val:'4 - 7 = ?',tag:'err_random'},{val:'7 - 4 = 3'},{val:'7 - 3 = 4',tag:'err_random'}],
          a:2, e:'Jumped away = subtract: 7 - 4 = 3!', d:'m', s:null, h:'Jumped away = subtraction'
        },
        {
          t: 'Emma counts back from 10 to find 10 - 4. She lands on 6. Is she right?',
          v: null,
          o: [{val:'No, she should get 5',tag:'err_off_by_one'},{val:'Yes! 10, 9, 8, 7 — that is 4 back, landing on 6'},{val:'No, 10 - 4 = 7',tag:'err_off_by_one'},{val:'No, you cannot count back from 10',tag:'err_random'}],
          a:1, e:'10 - 4: count back 4 steps from 10 → nine, eight, seven, six. Yes, she lands on 6!', d:'m', s:null, h:'Count back 4 steps from 10'
        }
      ]
    }
  ],

  testBank: [
    // ── L1 Addition (4) ──────────────────────────────────────────────────────
    {
      t: '4 + 3 = ?',
      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🍭', rightCount:3, rightObj:'🍭', op:'add'}},
      o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
      a:2, e:'4 + 3 = 7!', d:'e', s:null, h:'Count on from 4: five, six, seven'
    },
    {
      t: 'There are 2 🦄 on the hill. 6 more join them. How many 🦄 are there?',
      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦄', rightCount:6, rightObj:'🦄', op:'add'}},
      o: [{val:'6',tag:'err_keep_start'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'2 + 6 = 8!', d:'m', s:null, h:'Count on from 6: seven, eight'
    },
    {
      t: '1 + 9 = ?',
      v: null,
      o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_keep_start'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'1 + 9 = 10!', d:'m', s:null, h:'Count on from 9: ten'
    },
    {
      t: '5 + 3 = ?',
      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🎃', rightCount:3, rightObj:'🎃', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'5 + 3 = 8!', d:'e', s:null, h:'Count on from 5: six, seven, eight'
    },
    // ── L2 Subtraction (4) ───────────────────────────────────────────────────
    {
      t: '9 - 3 = ?',
      v: {type:'objectSet', config:{count:9, emoji:'🌈', layout:'grid'}},
      o: [{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'9',tag:'err_keep_start'},{val:'12',tag:'err_add_instead'}],
      a:1, e:'9 - 3 = 6!', d:'m', s:null, h:'Count back 3 from 9'
    },
    {
      t: 'There are 7 🍦 in the freezer. 5 are eaten. How many 🍦 are left?',
      v: {type:'objectSet', config:{count:7, emoji:'🍦', layout:'line'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'7',tag:'err_keep_start'},{val:'12',tag:'err_add_instead'}],
      a:1, e:'7 - 5 = 2!', d:'e', s:null, h:'Eaten = subtract'
    },
    {
      t: '10 - 7 = ?',
      v: {type:'objectSet', config:{count:10, emoji:'🏀', layout:'grid'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'7',tag:'err_count_all'},{val:'10',tag:'err_keep_start'}],
      a:1, e:'10 - 7 = 3!', d:'m', s:null, h:'Count back 7 from 10'
    },
    {
      t: '6 notes are on the board. 4 are erased. How many notes are left?',
      v: {type:'objectSet', config:{count:6, emoji:'🎵', layout:'line'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'6',tag:'err_keep_start'},{val:'10',tag:'err_add_instead'}],
      a:1, e:'6 - 4 = 2!', d:'e', s:null, h:'Erased = subtract'
    },
    // ── L3 Word Problems (4) ─────────────────────────────────────────────────
    {
      t: 'Ana had 3 ribbons. Her mom gave her 5 more. How many ribbons does Ana have?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🎀', rightCount:5, rightObj:'🎀', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'3 + 5 = 8!', d:'e', s:null, h:'Gave more = add'
    },
    {
      t: 'There were 10 clouds. 6 blew away. How many clouds are in the sky?',
      v: {type:'objectSet', config:{count:10, emoji:'☁️', layout:'grid'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'10',tag:'err_keep_start'},{val:'16',tag:'err_add_instead'}],
      a:1, e:'10 - 6 = 4!', d:'m', s:null, h:'Blew away = subtract'
    },
    {
      t: 'A basket had some oranges. 4 were given away and 3 are left. How many were in the basket?',
      v: null,
      o: [{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_count_all'},{val:'7'},{val:'12',tag:'err_add_instead'}],
      a:2, e:'3 + 4 = 7, so there were 7 oranges at first!', d:'m', s:null, h:'Think: ? - 4 = 3'
    },
    {
      t: 'Jake sees 4 🐘 at the zoo. Later he sees 4 more. How many 🐘 in all?',
      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐘', rightCount:4, rightObj:'🐘', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'4 + 4 = 8!', d:'m', s:null, h:'In all = add'
    },
    // ── L4 Explain Thinking (4) ──────────────────────────────────────────────
    {
      t: 'Which number sentence shows 5 + 4?',
      v: {type:'twoGroups', config:{leftCount:5, leftObj:'⭐', rightCount:4, rightObj:'⭐', op:'add'}},
      o: [{val:'5 - 4 = 1',tag:'err_sub_instead'},{val:'5 + 3 = 8',tag:'err_random'},{val:'5 + 4 = 9'},{val:'4 + 4 = 8',tag:'err_random'}],
      a:2, e:'5 + 4 = 9 matches the picture!', d:'e', s:null, h:'Count both groups'
    },
    {
      t: 'Joe says 8 - 5 = 4. Is he right?',
      v: null,
      o: [{val:'Yes, 8 - 5 = 4',tag:'err_random'},{val:'No, 8 - 5 = 3'},{val:'No, 8 - 5 = 2',tag:'err_off_by_one'},{val:'Yes, because 5 + 4 = 9',tag:'err_random'}],
      a:1, e:'8 - 5 = 3, not 4! Count back 5 from 8: seven, six, five, four, three', d:'m', s:null, h:'Count back 5 from 8'
    },
    {
      t: 'Which is the same as 2 + 8?',
      v: null,
      o: [{val:'8 + 3 = 11',tag:'err_random'},{val:'8 + 2 = 10'},{val:'2 + 2 = 4',tag:'err_random'},{val:'10 - 2 = 8',tag:'err_sub_instead'}],
      a:1, e:'8 + 2 = 10 is the same as 2 + 8 = 10!', d:'m', s:null, h:'Adding in any order gives the same answer'
    },
    {
      t: 'Which number sentence matches: 7 boats sail away from 10 boats?',
      v: {type:'objectSet', config:{count:10, emoji:'⛵', layout:'grid'}},
      o: [{val:'10 + 7 = 17',tag:'err_add_instead'},{val:'10 - 7 = 3'},{val:'7 - 10 = ?',tag:'err_random'},{val:'10 - 3 = 7',tag:'err_random'}],
      a:1, e:'Sail away = subtract: 10 - 7 = 3!', d:'m', s:null, h:'Sail away = subtraction'
    }
  ]
});
