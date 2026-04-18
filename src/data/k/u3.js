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
        },
        // ── NEW L1 questions ─────────────────────────────────────────────────
        {
          t: '1 🦁 rests in the sun. 2 more 🦁 walk over. How many 🦁 are there?',
          v: {type:'twoGroups', config:{leftCount:1, leftObj:'🦁', rightCount:2, rightObj:'🦁', op:'add'}},
          o: [{val:'1',tag:'err_keep_start'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'1 + 2 = 3!', d:'e', s:null, h:'Count on from 1: two, three'
        },
        {
          t: '2 + 3 = ?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦒', rightCount:3, rightObj:'🦒', op:'add'}},
          o: [{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'2 + 3 = 5!', d:'e', s:null, h:'Count on from 2: three, four, five'
        },
        {
          t: '1 🦓 stands by a tree. 3 more 🦓 join it. How many 🦓 in all?',
          v: {type:'twoGroups', config:{leftCount:1, leftObj:'🦓', rightCount:3, rightObj:'🦓', op:'add'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_keep_start'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'1 + 3 = 4!', d:'e', s:null, h:'Count on from 1: two, three, four'
        },
        {
          t: '3 🐊 float in the river. 4 more 🐊 swim up. How many 🐊 altogether?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐊', rightCount:4, rightObj:'🐊', op:'add'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'3 + 4 = 7!', d:'m', s:null, h:'Count on from 3: four, five, six, seven'
        },
        {
          t: '4 + 3 = ? (show with 🦕)',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🦕', rightCount:3, rightObj:'🦕', op:'add'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'4 + 3 = 7!', d:'m', s:null, h:'Count on from 4: five, six, seven'
        },
        {
          t: '3 🌿 grow on one side. 5 🌿 grow on the other side. How many 🌿 in all?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌿', rightCount:5, rightObj:'🌿', op:'add'}},
          o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'3 + 5 = 8!', d:'m', s:null, h:'Count on from 3: four, five, six, seven, eight'
        },
        {
          t: '6 + 2 = ?',
          v: {type:'twoGroups', config:{leftCount:6, leftObj:'🎸', rightCount:2, rightObj:'🎸', op:'add'}},
          o: [{val:'6',tag:'err_keep_start'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'6 + 2 = 8!', d:'m', s:null, h:'Count on from 6: seven, eight'
        },
        {
          t: '2 🦁 nap under a tree. 6 more 🦁 arrive. How many 🦁 in the group?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦁', rightCount:6, rightObj:'🦁', op:'add'}},
          o: [{val:'6',tag:'err_keep_start'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'2 + 6 = 8!', d:'m', s:null, h:'Count on from 6: seven, eight'
        },
        {
          t: '8 + 2 = ?',
          v: {type:'twoGroups', config:{leftCount:8, leftObj:'🌻', rightCount:2, rightObj:'🌻', op:'add'}},
          o: [{val:'8',tag:'err_keep_start'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'8 + 2 = 10!', d:'h', s:null, h:'Count on from 8: nine, ten'
        },
        {
          t: '9 + 1 = ?',
          v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎵', rightCount:1, rightObj:'🎵', op:'add'}},
          o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_keep_start'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
          a:2, e:'9 + 1 = 10!', d:'h', s:null, h:'Count 1 more than 9'
        },
        {
          t: '7 + 0 = ?',
          v: null,
          o: [{val:'0',tag:'err_random'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'Adding zero keeps the number the same — 7 + 0 = 7!', d:'h', s:null, h:'Adding 0 changes nothing'
        },
        {
          t: '0 + 8 = ?',
          v: null,
          o: [{val:'0',tag:'err_keep_start'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
          a:2, e:'Adding zero to 8 still gives 8 — 0 + 8 = 8!', d:'h', s:null, h:'Zero plus a number equals that number'
        },
        {
          t: 'Which is the same as 3 + 7?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌸', rightCount:7, rightObj:'🌸', op:'add'}},
          o: [{val:'3 + 3 = 6',tag:'err_random'},{val:'7 + 3 = 10'},{val:'7 - 3 = 4',tag:'err_sub_instead'},{val:'3 + 6 = 9',tag:'err_off_by_one'}],
          a:1, e:'3 + 7 = 10 and 7 + 3 = 10 — you can add in any order!', d:'h', s:null, h:'Adding numbers in any order gives the same total'
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
        },
        // ── NEW L2 questions ─────────────────────────────────────────────────
        {
          t: '4 🐧 stand on the ice. 1 slides away. How many 🐧 are left?',
          v: {type:'objectSet', config:{count:4, emoji:'🐧', layout:'line'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_keep_start'},{val:'5',tag:'err_add_instead'}],
          a:1, e:'4 - 1 = 3!', d:'e', s:null, h:'1 less than 4 is 3'
        },
        {
          t: '3 🌼 bloom in a garden. 1 is picked. How many 🌼 are still there?',
          v: {type:'objectSet', config:{count:3, emoji:'🌼', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_add_instead'}],
          a:1, e:'3 - 1 = 2!', d:'e', s:null, h:'1 less than 3 is 2'
        },
        {
          t: '2 - 1 = ?',
          v: {type:'objectSet', config:{count:2, emoji:'🌈', layout:'line'}},
          o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'2',tag:'err_keep_start'},{val:'3',tag:'err_add_instead'}],
          a:1, e:'2 - 1 = 1!', d:'e', s:null, h:'1 less than 2 is 1'
        },
        {
          t: '7 - 3 = ?',
          v: {type:'objectSet', config:{count:7, emoji:'🎀', layout:'grid'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'7',tag:'err_keep_start'},{val:'10',tag:'err_add_instead'}],
          a:1, e:'7 - 3 = 4!', d:'m', s:null, h:'Count back 3 from 7: six, five, four'
        },
        {
          t: '8 🍦 are in the freezer. 4 are eaten. How many 🍦 are left?',
          v: {type:'objectSet', config:{count:8, emoji:'🍦', layout:'grid'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'8',tag:'err_keep_start'},{val:'12',tag:'err_add_instead'}],
          a:1, e:'8 - 4 = 4!', d:'m', s:null, h:'Count back 4 from 8: seven, six, five, four'
        },
        {
          t: '9 - 5 = ?',
          v: {type:'objectSet', config:{count:9, emoji:'🌺', layout:'grid'}},
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'9',tag:'err_keep_start'},{val:'14',tag:'err_add_instead'}],
          a:1, e:'9 - 5 = 4!', d:'m', s:null, h:'Count back 5 from 9: eight, seven, six, five, four'
        },
        {
          t: '6 🐟 swim in a pond. 4 swim away. How many 🐟 remain?',
          v: {type:'objectSet', config:{count:6, emoji:'🐟', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'6',tag:'err_keep_start'},{val:'10',tag:'err_add_instead'}],
          a:1, e:'6 - 4 = 2!', d:'m', s:null, h:'Count back 4 from 6: five, four, three, two'
        },
        {
          t: '7 🧩 are on the floor. 5 are put away. How many 🧩 are left?',
          v: {type:'objectSet', config:{count:7, emoji:'🧩', layout:'grid'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'7',tag:'err_keep_start'},{val:'12',tag:'err_add_instead'}],
          a:1, e:'7 - 5 = 2!', d:'m', s:null, h:'Count back 5 from 7: six, five, four, three, two'
        },
        {
          t: '10 - 8 = ?',
          v: {type:'objectSet', config:{count:10, emoji:'🍎', layout:'grid'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'10',tag:'err_keep_start'}],
          a:1, e:'10 - 8 = 2!', d:'h', s:null, h:'Count back 8 from 10: nine, eight, seven, six, five, four, three, two'
        },
        {
          t: '10 - 9 = ?',
          v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},
          o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'10',tag:'err_keep_start'}],
          a:1, e:'10 - 9 = 1!', d:'h', s:null, h:'Count back 9 from 10 — you land on 1'
        },
        {
          t: '9 - 8 = ?',
          v: {type:'objectSet', config:{count:9, emoji:'🎈', layout:'grid'}},
          o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'9',tag:'err_keep_start'}],
          a:1, e:'9 - 8 = 1!', d:'h', s:null, h:'Count back 8 from 9 — only 1 step away from 9'
        },
        {
          t: '4 - 4 = ?',
          v: {type:'objectSet', config:{count:4, emoji:'🦋', layout:'line'}},
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'4',tag:'err_keep_start'},{val:'8',tag:'err_add_instead'}],
          a:0, e:'When you take all away, none are left! 4 - 4 = 0', d:'h', s:null, h:'Taking away all leaves zero'
        },
        {
          t: '5 - 5 = ?',
          v: {type:'objectSet', config:{count:5, emoji:'🐥', layout:'line'}},
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'5',tag:'err_keep_start'},{val:'10',tag:'err_add_instead'}],
          a:0, e:'When you take all away, none are left! 5 - 5 = 0', d:'h', s:null, h:'A number minus itself always equals zero'
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
        },
        // ── NEW L3 questions ─────────────────────────────────────────────────
        {
          t: '2 🐇 hop in the garden. 3 more 🐇 join them. How many 🐇 are in the garden?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐇', rightCount:3, rightObj:'🐇', op:'add'}},
          o: [{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
          a:2, e:'2 + 3 = 5!', d:'e', s:null, h:'Join = add both groups'
        },
        {
          t: 'There were 4 🌸 in a vase. 2 flowers were taken out. How many 🌸 are left?',
          v: {type:'objectSet', config:{count:4, emoji:'🌸', layout:'line'}},
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'4',tag:'err_keep_start'},{val:'6',tag:'err_add_instead'}],
          a:1, e:'4 - 2 = 2!', d:'e', s:null, h:'Taken out = subtract'
        },
        {
          t: 'There are 5 🐢 on the rock. 1 more 🐢 climbs up. How many 🐢 in all?',
          v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐢', rightCount:1, rightObj:'🐢', op:'add'}},
          o: [{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_keep_start'},{val:'6'},{val:'7',tag:'err_off_by_one'}],
          a:2, e:'5 + 1 = 6!', d:'e', s:null, h:'One more = add 1'
        },
        {
          t: '4 🚂 are on the track. 3 🚛 join them. How many vehicles are there in all?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🚂', rightCount:3, rightObj:'🚛', op:'add'}},
          o: [{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'},{val:'8',tag:'err_off_by_one'}],
          a:2, e:'4 + 3 = 7!', d:'m', s:null, h:'In all = add both groups'
        },
        {
          t: '9 🦋 land on a flower. 4 fly away. How many 🦋 are left on the flower?',
          v: {type:'objectSet', config:{count:9, emoji:'🦋', layout:'grid'}},
          o: [{val:'4',tag:'err_keep_start'},{val:'5'},{val:'9',tag:'err_keep_total'},{val:'13',tag:'err_add_instead'}],
          a:1, e:'9 - 4 = 5!', d:'m', s:null, h:'Flew away = subtract'
        },
        {
          t: '6 beads are on a string. 3 fall off. How many beads are still on the string?',
          v: {type:'objectSet', config:{count:6, emoji:'🔵', layout:'line'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'6',tag:'err_keep_start'},{val:'9',tag:'err_add_instead'}],
          a:1, e:'6 - 3 = 3!', d:'m', s:null, h:'Fall off = subtract'
        },
        {
          t: 'Some frogs were on a lily pad. 5 more hopped on and now there are 8. How many were there before?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'5',tag:'err_count_all'},{val:'8',tag:'err_keep_total'}],
          a:1, e:'8 - 5 = 3, so 3 frogs were there before!', d:'m', s:null, h:'Think: ? + 5 = 8'
        },
        {
          t: 'Some ducklings swam in a pond. 3 waddled away and 5 are still swimming. How many were there at the start?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'5',tag:'err_keep_start'},{val:'8'},{val:'15',tag:'err_add_instead'}],
          a:2, e:'5 + 3 = 8, so there were 8 ducklings at the start!', d:'h', s:null, h:'Think: ? - 3 = 5'
        },
        {
          t: 'There are 10 🦆 by the pond. 7 fly away. How many 🦆 are left?',
          v: {type:'objectSet', config:{count:10, emoji:'🦆', layout:'grid'}},
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'10',tag:'err_keep_start'},{val:'17',tag:'err_add_instead'}],
          a:1, e:'10 - 7 = 3!', d:'h', s:null, h:'Fly away = subtract'
        },
        {
          t: 'A jar had some cookies. 4 were eaten and now there are 6 left. Were there more than 8 cookies at the start?',
          v: null,
          o: [{val:'Yes, there were 10 cookies at the start'},{val:'No, there were only 4 cookies',tag:'err_count_all'},{val:'No, there were exactly 6 cookies',tag:'err_keep_start'},{val:'Yes, there were 9 cookies',tag:'err_off_by_one'}],
          a:0, e:'6 + 4 = 10, so yes, there were 10 cookies — more than 8!', d:'h', s:null, h:'Think: ? - 4 = 6, then compare to 8'
        },
        {
          t: 'There are 7 🐠 in a tank. Some are orange and 3 are blue. How many are orange?',
          v: null,
          o: [{val:'3',tag:'err_keep_start'},{val:'4'},{val:'7',tag:'err_keep_total'},{val:'10',tag:'err_add_instead'}],
          a:1, e:'7 - 3 = 4, so 4 are orange!', d:'h', s:null, h:'Think: ? + 3 = 7'
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
        },
        // ── NEW L4 questions ─────────────────────────────────────────────────
        {
          t: 'Which picture shows 2 + 5?',
          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🟡', rightCount:5, rightObj:'🟡', op:'add'}},
          o: [{val:'5 dots on one side and 5 dots on the other',tag:'err_random'},{val:'2 dots on the left and 5 dots on the right'},{val:'5 dots on the left and 2 dots on the right',tag:'err_random'},{val:'2 dots on each side',tag:'err_random'}],
          a:1, e:'2 on the left and 5 on the right shows 2 + 5!', d:'e', s:null, h:'Look for 2 on one side and 5 on the other'
        },
        {
          t: 'Which picture shows 4 + 1?',
          v: {type:'twoGroups', config:{leftCount:4, leftObj:'🟠', rightCount:1, rightObj:'🟠', op:'add'}},
          o: [{val:'1 object on the left and 4 on the right',tag:'err_random'},{val:'4 objects on the left and 4 on the right',tag:'err_random'},{val:'4 objects on the left and 1 on the right'},{val:'4 objects on the left and 0 on the right',tag:'err_random'}],
          a:2, e:'4 on the left and 1 on the right shows 4 + 1 = 5!', d:'e', s:null, h:'Find the picture with 4 on one side and 1 on the other'
        },
        {
          t: 'Start at 6 and count back 2. Which number sentence does that show?',
          v: null,
          o: [{val:'6 + 2 = 8',tag:'err_add_instead'},{val:'6 - 2 = 4'},{val:'6 - 2 = 3',tag:'err_off_by_one'},{val:'2 + 6 = 8',tag:'err_add_instead'}],
          a:1, e:'Counting back 2 from 6 shows subtraction: 6 - 2 = 4!', d:'e', s:null, h:'Counting back means subtracting'
        },
        {
          t: 'Is 3 + 6 = 8 correct?',
          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🟢', rightCount:6, rightObj:'🟢', op:'add'}},
          o: [{val:'Yes, 3 + 6 = 8',tag:'err_random'},{val:'No, 3 + 6 = 9'},{val:'No, 3 + 6 = 7',tag:'err_off_by_one'},{val:'No, 3 + 6 = 10',tag:'err_off_by_one'}],
          a:1, e:'3 + 6 = 9, not 8! Count on from 3: four, five, six, seven, eight, nine', d:'m', s:null, h:'Count on from 3 six times'
        },
        {
          t: 'A story says: 8 birds sat in a tree and 3 flew away. Which number sentence fits best?',
          v: {type:'objectSet', config:{count:8, emoji:'🐦', layout:'grid'}},
          o: [{val:'3 + 8 = 11',tag:'err_add_instead'},{val:'8 - 3 = 5'},{val:'8 + 3 = 11',tag:'err_add_instead'},{val:'8 - 3 = 4',tag:'err_off_by_one'}],
          a:1, e:'Flew away = subtract: 8 - 3 = 5!', d:'m', s:null, h:'Flew away means subtract'
        },
        {
          t: 'What is the best strategy for finding 7 + 2?',
          v: null,
          o: [{val:'Count back 2 from 7',tag:'err_sub_instead'},{val:'Count on from the bigger number: start at 7 and count 2 more'},{val:'Add 7 + 7 instead',tag:'err_random'},{val:'Count all objects starting from 1',tag:'err_count_all'}],
          a:1, e:'Start at 7 (the bigger number) and count on 2: eight, nine — that is 9!', d:'m', s:null, h:'Start counting from the bigger number'
        },
        {
          t: 'Ava has 6 toys. She gives 4 away. Which number sentence shows this?',
          v: {type:'objectSet', config:{count:6, emoji:'🧸', layout:'line'}},
          o: [{val:'6 + 4 = 10',tag:'err_add_instead'},{val:'6 - 4 = 2'},{val:'6 - 4 = 3',tag:'err_off_by_one'},{val:'4 + 6 = 10',tag:'err_add_instead'}],
          a:1, e:'Gives away = subtract: 6 - 4 = 2!', d:'m', s:null, h:'Gives away = subtraction'
        },
        {
          t: 'Dan says 9 - 3 = 5. What is the correct answer?',
          v: {type:'objectSet', config:{count:9, emoji:'🍊', layout:'grid'}},
          o: [{val:'5 — Dan is right',tag:'err_random'},{val:'6 — count back 3 from 9: eight, seven, six'},{val:'7 — Dan is off by 2',tag:'err_off_by_one'},{val:'4 — count back 5 instead',tag:'err_random'}],
          a:1, e:'9 - 3 = 6! Count back 3 from 9: eight, seven, six. Dan got it wrong.', d:'h', s:null, h:'Count back 3 from 9 carefully'
        },
        {
          t: 'Which is the same as 6 + 2?',
          v: null,
          o: [{val:'6 - 2 = 4',tag:'err_sub_instead'},{val:'2 + 6 = 8'},{val:'6 + 3 = 9',tag:'err_off_by_one'},{val:'8 - 2 = 6',tag:'err_sub_instead'}],
          a:1, e:'2 + 6 = 8 is the same as 6 + 2 = 8 — you can flip the order!', d:'h', s:null, h:'Adding in any order gives the same answer'
        },
        {
          t: 'Why does 5 + 0 = 5?',
          v: null,
          o: [{val:'Because adding zero makes the number smaller',tag:'err_random'},{val:'Because zero means nothing is being added — so the total stays 5'},{val:'Because 5 + 0 is the same as 5 - 5',tag:'err_random'},{val:'Because zero is bigger than 5',tag:'err_random'}],
          a:1, e:'Adding zero means you are adding nothing, so the number stays the same — 5 + 0 = 5!', d:'h', s:null, h:'What happens when you add nothing?'
        },
        {
          t: 'Is 7 - 2 = 4 correct?',
          v: {type:'objectSet', config:{count:7, emoji:'🍋', layout:'line'}},
          o: [{val:'Yes, 7 - 2 = 4',tag:'err_random'},{val:'No, 7 - 2 = 5'},{val:'No, 7 - 2 = 6',tag:'err_off_by_one'},{val:'No, 7 - 2 = 3',tag:'err_off_by_one'}],
          a:1, e:'7 - 2 = 5, not 4! Count back 2 from 7: six, five.', d:'h', s:null, h:'Count back 2 from 7: six, five'
        },
        {
          t: 'Which has the same total as 8 + 1?',
          v: null,
          o: [{val:'8 + 2 = 10',tag:'err_off_by_one'},{val:'1 + 8 = 9'},{val:'8 - 1 = 7',tag:'err_sub_instead'},{val:'9 + 1 = 10',tag:'err_off_by_one'}],
          a:1, e:'1 + 8 = 9, the same as 8 + 1 = 9 — the order of adding does not change the total!', d:'h', s:null, h:'Flip the numbers — does the total change?'
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
    },
    // ── NEW testBank questions ───────────────────────────────────────────────
    // L1 easy (3)
    {
      t: '1 + 4 = ?',
      v: {type:'twoGroups', config:{leftCount:1, leftObj:'🌼', rightCount:4, rightObj:'🌼', op:'add'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_keep_start'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'1 + 4 = 5!', d:'e', s:null, h:'Count on from 1: two, three, four, five'
    },
    {
      t: '2 + 2 = ?',
      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐥', rightCount:2, rightObj:'🐥', op:'add'}},
      o: [{val:'2',tag:'err_keep_start'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'2 + 2 = 4!', d:'e', s:null, h:'Count on from 2: three, four'
    },
    {
      t: '3 + 2 = ?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🍦', rightCount:2, rightObj:'🍦', op:'add'}},
      o: [{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'3 + 2 = 5!', d:'e', s:null, h:'Count on from 3: four, five'
    },
    // L1 medium (4)
    {
      t: '3 + 5 = ?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌷', rightCount:5, rightObj:'🌷', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'3 + 5 = 8!', d:'m', s:null, h:'Count on from 3: four, five, six, seven, eight'
    },
    {
      t: '5 + 3 = ?',
      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐠', rightCount:3, rightObj:'🐠', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'5 + 3 = 8!', d:'m', s:null, h:'Count on from 5: six, seven, eight'
    },
    {
      t: '2 + 6 = ?',
      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🎶', rightCount:6, rightObj:'🎶', op:'add'}},
      o: [{val:'6',tag:'err_keep_start'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'2 + 6 = 8!', d:'m', s:null, h:'Count on from 6: seven, eight'
    },
    {
      t: '4 + 4 = ?',
      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🎀', rightCount:4, rightObj:'🎀', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'4 + 4 = 8!', d:'m', s:null, h:'Count on from 4: five, six, seven, eight'
    },
    // L1 hard (2)
    {
      t: '9 + 1 = ?',
      v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌻', rightCount:1, rightObj:'🌻', op:'add'}},
      o: [{val:'8',tag:'err_off_by_one'},{val:'9',tag:'err_keep_start'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'9 + 1 = 10!', d:'h', s:null, h:'Count 1 more than 9'
    },
    {
      t: '8 + 2 = ?',
      v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐝', rightCount:2, rightObj:'🐝', op:'add'}},
      o: [{val:'8',tag:'err_keep_start'},{val:'9',tag:'err_off_by_one'},{val:'10'},{val:'11',tag:'err_off_by_one'}],
      a:2, e:'8 + 2 = 10!', d:'h', s:null, h:'Count on from 8: nine, ten'
    },
    // L2 easy (3)
    {
      t: '5 - 1 = ?',
      v: {type:'objectSet', config:{count:5, emoji:'🍓', layout:'line'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_keep_start'},{val:'6',tag:'err_add_instead'}],
      a:1, e:'5 - 1 = 4!', d:'e', s:null, h:'1 less than 5 is 4'
    },
    {
      t: '4 - 2 = ?',
      v: {type:'objectSet', config:{count:4, emoji:'🌼', layout:'line'}},
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'4',tag:'err_keep_start'},{val:'6',tag:'err_add_instead'}],
      a:1, e:'4 - 2 = 2!', d:'e', s:null, h:'Count back 2 from 4: three, two'
    },
    {
      t: '3 - 2 = ?',
      v: {type:'objectSet', config:{count:3, emoji:'🐣', layout:'line'}},
      o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'3',tag:'err_keep_start'},{val:'5',tag:'err_add_instead'}],
      a:1, e:'3 - 2 = 1!', d:'e', s:null, h:'Count back 2 from 3: two, one'
    },
    // L2 medium (4)
    {
      t: '8 - 3 = ?',
      v: {type:'objectSet', config:{count:8, emoji:'🍒', layout:'grid'}},
      o: [{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'8',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
      a:1, e:'8 - 3 = 5!', d:'m', s:null, h:'Count back 3 from 8: seven, six, five'
    },
    {
      t: '7 - 4 = ?',
      v: {type:'objectSet', config:{count:7, emoji:'🌺', layout:'grid'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'7',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
      a:1, e:'7 - 4 = 3!', d:'m', s:null, h:'Count back 4 from 7'
    },
    {
      t: '6 - 3 = ?',
      v: {type:'objectSet', config:{count:6, emoji:'🦋', layout:'line'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'6',tag:'err_keep_start'},{val:'9',tag:'err_add_instead'}],
      a:1, e:'6 - 3 = 3!', d:'m', s:null, h:'Count back 3 from 6: five, four, three'
    },
    {
      t: '9 - 6 = ?',
      v: {type:'objectSet', config:{count:9, emoji:'🎈', layout:'grid'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'9',tag:'err_keep_start'},{val:'15',tag:'err_add_instead'}],
      a:1, e:'9 - 6 = 3!', d:'m', s:null, h:'Count back 6 from 9: eight, seven, six, five, four, three'
    },
    // L2 hard (2)
    {
      t: '10 - 7 = ?',
      v: {type:'objectSet', config:{count:10, emoji:'🍋', layout:'grid'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'10',tag:'err_keep_start'}],
      a:1, e:'10 - 7 = 3!', d:'h', s:null, h:'Count back 7 from 10: nine, eight, seven, six, five, four, three'
    },
    {
      t: '8 - 8 = ?',
      v: {type:'objectSet', config:{count:8, emoji:'🐧', layout:'grid'}},
      o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'8',tag:'err_keep_start'},{val:'16',tag:'err_add_instead'}],
      a:0, e:'When you take all away, none are left! 8 - 8 = 0', d:'h', s:null, h:'Taking away all leaves zero'
    },
    // L3 easy (2)
    {
      t: '2 🐸 sit on a rock. 3 more 🐸 jump on. How many 🐸 in all?',
      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐸', rightCount:3, rightObj:'🐸', op:'add'}},
      o: [{val:'3',tag:'err_keep_start'},{val:'4',tag:'err_off_by_one'},{val:'5'},{val:'6',tag:'err_off_by_one'}],
      a:2, e:'2 + 3 = 5!', d:'e', s:null, h:'Jump on = add'
    },
    {
      t: 'There are 3 🌟 in the sky. 2 fade away. How many 🌟 are left?',
      v: {type:'objectSet', config:{count:3, emoji:'🌟', layout:'line'}},
      o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'3',tag:'err_keep_start'},{val:'5',tag:'err_add_instead'}],
      a:1, e:'3 - 2 = 1!', d:'e', s:null, h:'Fade away = subtract'
    },
    // L3 medium (4)
    {
      t: '3 🐦 perch on a fence. 5 more 🐦 land. How many 🐦 are on the fence?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐦', rightCount:5, rightObj:'🐦', op:'add'}},
      o: [{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'},{val:'9',tag:'err_off_by_one'}],
      a:2, e:'3 + 5 = 8!', d:'m', s:null, h:'Land = add'
    },
    {
      t: 'There are 8 🍪 on a plate. 4 are eaten. How many 🍪 are left?',
      v: {type:'objectSet', config:{count:8, emoji:'🍪', layout:'grid'}},
      o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'8',tag:'err_keep_start'},{val:'12',tag:'err_add_instead'}],
      a:1, e:'8 - 4 = 4!', d:'m', s:null, h:'Eaten = subtract'
    },
    {
      t: 'There are 7 🎈 at a party. 4 pop. How many 🎈 are still there?',
      v: {type:'objectSet', config:{count:7, emoji:'🎈', layout:'grid'}},
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'7',tag:'err_keep_start'},{val:'11',tag:'err_add_instead'}],
      a:1, e:'7 - 4 = 3!', d:'m', s:null, h:'Pop = subtract'
    },
    {
      t: 'Some apples were in a bowl. 3 were eaten and 5 are left. How many apples were in the bowl at first?',
      v: null,
      o: [{val:'2',tag:'err_off_by_one'},{val:'5',tag:'err_keep_start'},{val:'8'},{val:'15',tag:'err_add_instead'}],
      a:2, e:'5 + 3 = 8, so there were 8 apples at first!', d:'m', s:null, h:'Think: ? - 3 = 5'
    },
    // L3 hard (2)
    {
      t: 'Some 🐣 were in a nest. 4 hatched and now there are 6 total. How many were there before any hatched?',
      v: null,
      o: [{val:'2'},{val:'4',tag:'err_count_all'},{val:'6',tag:'err_keep_total'},{val:'10',tag:'err_add_instead'}],
      a:0, e:'6 - 4 = 2, so there were 2 eggs before hatching!', d:'h', s:null, h:'Think: ? + 4 = 6'
    },
    {
      t: 'A box had 10 🖍 inside. Some were given to a friend and 3 are left. How many were given away?',
      v: {type:'objectSet', config:{count:10, emoji:'🖍', layout:'grid'}},
      o: [{val:'3',tag:'err_keep_start'},{val:'5',tag:'err_off_by_one'},{val:'7'},{val:'13',tag:'err_add_instead'}],
      a:2, e:'10 - 3 = 7, so 7 crayons were given away!', d:'h', s:null, h:'Think: 10 - ? = 3'
    },
    // L4 easy (2)
    {
      t: 'Which number sentence shows 3 + 4?',
      v: {type:'twoGroups', config:{leftCount:3, leftObj:'🔶', rightCount:4, rightObj:'🔶', op:'add'}},
      o: [{val:'3 - 4 = ?',tag:'err_sub_instead'},{val:'3 + 3 = 6',tag:'err_random'},{val:'3 + 4 = 7'},{val:'4 + 4 = 8',tag:'err_random'}],
      a:2, e:'3 + 4 = 7 matches the picture!', d:'e', s:null, h:'Count both groups together'
    },
    {
      t: 'Which shows 5 - 2?',
      v: {type:'objectSet', config:{count:5, emoji:'🍇', layout:'line'}},
      o: [{val:'5 + 2 = 7',tag:'err_add_instead'},{val:'5 - 2 = 2',tag:'err_off_by_one'},{val:'5 - 2 = 3'},{val:'5 - 2 = 4',tag:'err_off_by_one'}],
      a:2, e:'5 - 2 = 3! Count back 2 from 5: four, three', d:'e', s:null, h:'Count back 2 from 5'
    },
    // L4 medium (4)
    {
      t: 'Is 6 + 3 = 8 correct?',
      v: null,
      o: [{val:'Yes, 6 + 3 = 8',tag:'err_random'},{val:'No, 6 + 3 = 9'},{val:'No, 6 + 3 = 7',tag:'err_off_by_one'},{val:'No, 6 + 3 = 10',tag:'err_off_by_one'}],
      a:1, e:'6 + 3 = 9, not 8! Count on from 6: seven, eight, nine', d:'m', s:null, h:'Count on from 6 three times'
    },
    {
      t: 'A story says: 9 kittens played outside and 5 went inside. Which number sentence fits?',
      v: {type:'objectSet', config:{count:9, emoji:'🐱', layout:'grid'}},
      o: [{val:'9 + 5 = 14',tag:'err_add_instead'},{val:'9 - 5 = 4'},{val:'5 + 9 = 14',tag:'err_add_instead'},{val:'9 - 5 = 3',tag:'err_off_by_one'}],
      a:1, e:'Went inside = subtract: 9 - 5 = 4!', d:'m', s:null, h:'Went inside = subtraction'
    },
    {
      t: 'Which is the same as 5 + 4?',
      v: null,
      o: [{val:'4 - 5 = ?',tag:'err_sub_instead'},{val:'4 + 5 = 9'},{val:'5 + 5 = 10',tag:'err_off_by_one'},{val:'9 - 4 = 5',tag:'err_sub_instead'}],
      a:1, e:'4 + 5 = 9 is the same as 5 + 4 = 9 — the order does not change the total!', d:'m', s:null, h:'Flip the numbers — does the total change?'
    },
    {
      t: 'Zoe says the best way to find 7 + 3 is to start at 7 and count 3 more. Is she right?',
      v: null,
      o: [{val:'No, you should start at 3 and count 7 more',tag:'err_random'},{val:'Yes! Start at 7 and count: eight, nine, ten — that is 10'},{val:'No, you should subtract instead',tag:'err_sub_instead'},{val:'No, 7 + 3 is not 10',tag:'err_random'}],
      a:1, e:'Zoe is right! Starting at 7 and counting 3 more: eight, nine, ten = 10!', d:'m', s:null, h:'Start at the bigger number and count on'
    },
    // L4 hard (2)
    {
      t: 'Which is the same as 4 + 6?',
      v: null,
      o: [{val:'6 - 4 = 2',tag:'err_sub_instead'},{val:'6 + 4 = 10'},{val:'4 + 5 = 9',tag:'err_off_by_one'},{val:'10 - 4 = 6',tag:'err_sub_instead'}],
      a:1, e:'6 + 4 = 10 is the same as 4 + 6 = 10 — you can add in any order!', d:'h', s:null, h:'Flip the order — the total stays the same'
    },
    {
      t: 'Why does 8 + 0 = 8?',
      v: null,
      o: [{val:'Because zero is the same as 1',tag:'err_random'},{val:'Because adding zero means nothing is added — the total stays 8'},{val:'Because 8 + 0 is the same as 8 - 8',tag:'err_random'},{val:'Because 0 + 0 = 8',tag:'err_random'}],
      a:1, e:'Adding zero means nothing is added, so the number stays the same — 8 + 0 = 8!', d:'h', s:null, h:'What happens when you add nothing to a number?'
    }
  ]
});
