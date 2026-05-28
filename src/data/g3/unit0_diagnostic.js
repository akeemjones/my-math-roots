// data/g3/unit0_diagnostic.js — Grade 3 Readiness Diagnostic ("Unit 0")
//
// Checks readiness for Grade 3 by sampling Grade-2 EXIT skills across the seven
// prerequisite areas: addition/subtraction within 1,000, skip counting by 2/5/10,
// equal groups, basic graphs, halves & fourths, money basics, and time to 5
// minutes. Multiple-choice items only.
//
// This is intentionally NOT pushed into _UNITS_DATA_G3, so it never appears in
// the normal instructional unit grid (the grid only iterates UNITS_DATA, which
// _applyGrade3Grade fills from _UNITS_DATA_G3). It is a data scaffold ready for a
// future placement flow.
//
// TODO(g3-routing): wire a placement flow that runs _G3_UNIT0_DIAGNOSTIC on first
// Grade-3 entry and, based on per-area scores, suggests a starting unit / unlocks.
// Not surfaced in the unit grid; invoke from a future "Readiness Check" entry
// point. The app has no diagnostic routing pattern yet, so this is deferred.
var _G3_UNIT0_DIAGNOSTIC = {
  id: 'g3-u0-diagnostic',
  name: 'Grade 3 Readiness Check',
  desc: 'A quick check of the Grade 2 skills Grade 3 builds on.',
  // Per-area readiness items. `area` lets a future router score each strand
  // and recommend review before the matching Grade 3 unit.
  items: [
    // addition / subtraction within 1,000  → readiness for Unit 2
    { area:'add_sub_1000', t:'What is 250 + 300?', o:[{val:'550'},{val:'530'},{val:'850'},{val:'500'}], a:0, e:'250 + 300 = 550.' },
    { area:'add_sub_1000', t:'What is 700 − 400?', o:[{val:'300'},{val:'1,100'},{val:'340'},{val:'30'}], a:0, e:'700 − 400 = 300.' },
    // skip counting by 2, 5, 10  → readiness for Unit 3
    { area:'skip_count', t:'Skip count by 2: 2, 4, 6, ___', o:[{val:'8'},{val:'7'},{val:'10'},{val:'9'}], a:0, e:'Add 2: 6 + 2 = 8.' },
    { area:'skip_count', t:'Skip count by 5: 5, 10, 15, ___', o:[{val:'20'},{val:'16'},{val:'25'},{val:'18'}], a:0, e:'Add 5: 15 + 5 = 20.' },
    { area:'skip_count', t:'Skip count by 10: 10, 20, 30, ___', o:[{val:'40'},{val:'31'},{val:'50'},{val:'35'}], a:0, e:'Add 10: 30 + 10 = 40.' },
    // equal groups  → readiness for Units 3 and 4
    { area:'equal_groups', t:'3 groups of 5 is how many in all?', o:[{val:'15'},{val:'8'},{val:'35'},{val:'12'}], a:0, e:'3 fives = 15.' },
    { area:'equal_groups', t:'4 plates each have 2 cookies. How many cookies?', o:[{val:'8'},{val:'6'},{val:'42'},{val:'24'}], a:0, e:'4 twos = 8.' },
    // basic graphs  → readiness for Unit 9
    { area:'graphs', t:'A bar graph shows 5 cats and 3 dogs. How many more cats than dogs?', o:[{val:'2'},{val:'8'},{val:'5'},{val:'3'}], a:0, e:'5 − 3 = 2 more cats.' },
    { area:'graphs', t:'A picture graph has 4 stars for apples (1 star = 1 apple). How many apples?', o:[{val:'4'},{val:'1'},{val:'8'},{val:'5'}], a:0, e:'4 stars = 4 apples.' },
    // halves and fourths  → readiness for Units 6 and 7
    { area:'fractions', t:'A shape is split into 2 equal parts. One part is ___', o:[{val:'one half'},{val:'one fourth'},{val:'one third'},{val:'a whole'}], a:0, e:'2 equal parts → each is one half.' },
    { area:'fractions', t:'A square is split into 4 equal parts. One part is ___', o:[{val:'one fourth'},{val:'one half'},{val:'one third'},{val:'four'}], a:0, e:'4 equal parts → each is one fourth.' },
    // money basics  → readiness for Unit 2 and Unit 10
    { area:'money', t:'How much is 1 dime and 1 nickel?', o:[{val:'15¢'},{val:'10¢'},{val:'6¢'},{val:'11¢'}], a:0, e:'10¢ + 5¢ = 15¢.' },
    { area:'money', t:'How much is 2 quarters?', o:[{val:'50¢'},{val:'25¢'},{val:'10¢'},{val:'75¢'}], a:0, e:'25¢ + 25¢ = 50¢.' },
    // time to 5 minutes  → readiness for Unit 9
    { area:'time', t:'The hour hand is on 3 and the minute hand is on 12. What time is it?', o:[{val:'3:00'},{val:'12:03'},{val:'3:30'},{val:'3:15'}], a:0, e:'Minute hand on 12 means o\'clock: 3:00.' },
    { area:'time', t:'A clock shows 4:30. How do you say it?', o:[{val:'half past four'},{val:'four o\'clock'},{val:'quarter past four'},{val:'half past three'}], a:0, e:'30 minutes past 4 is "half past four".' }
  ]
};
