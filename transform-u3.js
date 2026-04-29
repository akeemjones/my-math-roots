/**
 * Transforms all `t:` (question text) fields in k/u3.js to emoji-only format.
 * Rules:
 *   twoGroups add:  emoji×left + emoji×right = ?
 *   objectSet sub:  emoji×count − emoji×removed = ?  (removed = count − answer_val)
 *   v:null:         numeric form  N + M = ?  or  N − M = ?
 *   L3/L4 meta:     simplified to show the core equation
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'src/data/k/u3.js');
let src = fs.readFileSync(FILE, 'utf8');

function rep(e, n) { return e.repeat(Math.max(0, n)); }

// Each replacement: [exactOldString, exactNewString]
// For duplicate t: strings we include the surrounding v: line as discriminator.
const REPS = [

  // ── L1 qBank ─────────────────────────────────────────────────────────────
  ["t: '3 🐦 sit on a branch. 2 more 🐦 land. How many 🐦 in all?'",
   "t: '🐦🐦🐦 + 🐦🐦 = ?'"],

  // '2 + 4 = ?' — unique in qBank (v uses 🍓)
  ["t: '2 + 4 = ?',\n          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🍓'",
   "t: '🍓🍓 + 🍓🍓🍓🍓 = ?',\n          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🍓'"],

  ["t: '4 🐞 land on a leaf. 3 more join them. How many 🐞 are there?'",
   "t: '🐞🐞🐞🐞 + 🐞🐞🐞 = ?'"],

  // '1 + 5 = ?' — unique (⭐)
  ["t: '1 + 5 = ?',\n          v: {type:'twoGroups', config:{leftCount:1, leftObj:'⭐'",
   "t: '⭐ + ⭐⭐⭐⭐⭐ = ?',\n          v: {type:'twoGroups', config:{leftCount:1, leftObj:'⭐'"],

  ["t: '5 🐠 swim in a tank. 2 more swim in. How many 🐠 in total?'",
   "t: '🐠🐠🐠🐠🐠 + 🐠🐠 = ?'"],

  // '0 + 6 = ?' — v:null, keep numbers
  // No change needed

  ["t: '6 🌺 are in a vase. 4 more 🌺 are added. How many 🌺 are in the vase now?'",
   "t: '🌺🌺🌺🌺🌺🌺 + 🌺🌺🌺🌺 = ?'"],

  // '3 + 3 = ?' — unique (🌙)
  ["t: '3 + 3 = ?',\n          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌙'",
   "t: '🌙🌙🌙 + 🌙🌙🌙 = ?',\n          v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌙'"],

  ["t: 'You have 4 🍬 in one hand and 3 🍬 in the other. How many 🍬 do you have?'",
   "t: '🍬🍬🍬🍬 + 🍬🍬🍬 = ?'"],

  // '2 + 2 = ?' DUPLICATE: L1 qBank uses 🎈, testBank uses 🐥
  ["t: '2 + 2 = ?',\n          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🎈'",
   "t: '🎈🎈 + 🎈🎈 = ?',\n          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🎈'"],

  ["t: '5 🐣 are in a nest. 5 more 🐣 hatch. How many 🐣 are there now?'",
   "t: '🐣🐣🐣🐣🐣 + 🐣🐣🐣🐣🐣 = ?'"],

  // '7 + 1 = ?' — unique (🦋)
  ["t: '7 + 1 = ?',\n          v: {type:'twoGroups', config:{leftCount:7, leftObj:'🦋'",
   "t: '🦋🦋🦋🦋🦋🦋🦋 + 🦋 = ?',\n          v: {type:'twoGroups', config:{leftCount:7, leftObj:'🦋'"],

  ["t: '4 🐸 sit on a log. 4 more 🐸 hop on. How many 🐸 are on the log?'",
   "t: '🐸🐸🐸🐸 + 🐸🐸🐸🐸 = ?'"],

  // '3 + 0 = ?' — v:null, keep numbers
  // No change needed

  ["t: '2 🌟 are on the left. 8 🌟 are on the right. How many 🌟 altogether?'",
   "t: '🌟🌟 + 🌟🌟🌟🌟🌟🌟🌟🌟 = ?'"],

  ["t: '1 🦁 rests in the sun. 2 more 🦁 walk over. How many 🦁 are there?'",
   "t: '🦁 + 🦁🦁 = ?'"],

  // '2 + 3 = ?' — unique (🦒)
  ["t: '2 + 3 = ?',\n          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦒'",
   "t: '🦒🦒 + 🦒🦒🦒 = ?',\n          v: {type:'twoGroups', config:{leftCount:2, leftObj:'🦒'"],

  ["t: '1 🦓 stands by a tree. 3 more 🦓 join it. How many 🦓 in all?'",
   "t: '🦓 + 🦓🦓🦓 = ?'"],

  ["t: '3 🐊 float in the river. 4 more 🐊 swim up. How many 🐊 altogether?'",
   "t: '🐊🐊🐊 + 🐊🐊🐊🐊 = ?'"],

  ["t: '4 + 3 = ? (show with 🦕)'",
   "t: '🦕🦕🦕🦕 + 🦕🦕🦕 = ?'"],

  ["t: '3 🌿 grow on one side. 5 🌿 grow on the other side. How many 🌿 in all?'",
   "t: '🌿🌿🌿 + 🌿🌿🌿🌿🌿 = ?'"],

  // '6 + 2 = ?' — unique (🎸)
  ["t: '6 + 2 = ?',\n          v: {type:'twoGroups', config:{leftCount:6, leftObj:'🎸'",
   "t: '🎸🎸🎸🎸🎸🎸 + 🎸🎸 = ?',\n          v: {type:'twoGroups', config:{leftCount:6, leftObj:'🎸'"],

  ["t: '2 🦁 nap under a tree. 6 more 🦁 arrive. How many 🦁 in the group?'",
   "t: '🦁🦁 + 🦁🦁🦁🦁🦁🦁 = ?'"],

  // '8 + 2 = ?' DUPLICATE: L1 qBank uses 🌻, testBank uses 🐝
  ["t: '8 + 2 = ?',\n          v: {type:'twoGroups', config:{leftCount:8, leftObj:'🌻'",
   "t: '🌻🌻🌻🌻🌻🌻🌻🌻 + 🌻🌻 = ?',\n          v: {type:'twoGroups', config:{leftCount:8, leftObj:'🌻'"],

  // '9 + 1 = ?' DUPLICATE: L1 qBank uses 🎵, testBank uses 🌻
  ["t: '9 + 1 = ?',\n          v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎵'",
   "t: '🎵🎵🎵🎵🎵🎵🎵🎵🎵 + 🎵 = ?',\n          v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎵'"],

  // '7 + 0 = ?' — v:null, keep numbers
  // No change needed

  // '0 + 8 = ?' — v:null, keep numbers
  // No change needed

  ["t: 'Which is the same as 3 + 7?'",
   "t: '🌸🌸🌸 + 🌸🌸🌸🌸🌸🌸🌸 = ?'"],

  // ── L2 qBank ─────────────────────────────────────────────────────────────
  // removed = count − answer_val

  ["t: '5 🍎 are on a plate. You eat 2. How many 🍎 are left?'",
   "t: '🍎🍎🍎🍎🍎 − 🍎🍎 = ?'"],

  // '6 - 3 = ?' DUPLICATE: L2 qBank uses 🧩, testBank uses 🦋
  ["t: '6 - 3 = ?',\n          v: {type:'objectSet', config:{count:6, emoji:'🧩'",
   "t: '🧩🧩🧩🧩🧩🧩 − 🧩🧩🧩 = ?',\n          v: {type:'objectSet', config:{count:6, emoji:'🧩'"],

  ["t: '8 🐦 sit on a wire. 3 fly away. How many 🐦 stay?'",
   "t: '🐦🐦🐦🐦🐦🐦🐦🐦 − 🐦🐦🐦 = ?'"],

  // '4 - 1 = ?' — unique (🌻)
  ["t: '4 - 1 = ?',\n          v: {type:'objectSet', config:{count:4, emoji:'🌻'",
   "t: '🌻🌻🌻🌻 − 🌻 = ?',\n          v: {type:'objectSet', config:{count:4, emoji:'🌻'"],

  ["t: 'There are 7 🍪 in the jar. You take out 4. How many 🍪 are left?'",
   "t: '🍪🍪🍪🍪🍪🍪🍪 − 🍪🍪🍪🍪 = ?'"],

  ["t: '10 - 5 = ?'",
   "t: '🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 − 🌟🌟🌟🌟🌟 = ?'"],

  ["t: '9 🐝 are in a hive. 2 fly out. How many 🐝 are still inside?'",
   "t: '🐝🐝🐝🐝🐝🐝🐝🐝🐝 − 🐝🐝 = ?'"],

  ["t: '3 - 3 = ?'",
   "t: '🍩🍩🍩 − 🍩🍩🍩 = ?'"],

  ["t: '6 🌮 are on the table. 2 are eaten. How many 🌮 remain?'",
   "t: '🌮🌮🌮🌮🌮🌮 − 🌮🌮 = ?'"],

  ["t: '8 - 6 = ?'",
   "t: '🍒🍒🍒🍒🍒🍒🍒🍒 − 🍒🍒🍒🍒🍒🍒 = ?'"],

  ["t: '5 stars shine in the sky. 3 clouds cover them. How many stars can you still see?'",
   "t: '🌟🌟🌟🌟🌟 − 🌟🌟🌟 = ?'"],

  // '7 - 4 = ?' DUPLICATE: L2 qBank uses 🍇, testBank uses 🌺
  ["t: '7 - 4 = ?',\n          v: {type:'objectSet', config:{count:7, emoji:'🍇'",
   "t: '🍇🍇🍇🍇🍇🍇🍇 − 🍇🍇🍇🍇 = ?',\n          v: {type:'objectSet', config:{count:7, emoji:'🍇'"],

  ["t: 'There are 4 🎀 on the table. You give 2 away. How many 🎀 are left?'",
   "t: '🎀🎀🎀🎀 − 🎀🎀 = ?'"],

  ["t: '10 - 3 = ?'",
   "t: '🏐🏐🏐🏐🏐🏐🏐🏐🏐🏐 − 🏐🏐🏐 = ?'"],

  ["t: '6 🐠 are in a bowl. 6 are taken out. How many 🐠 are left?'",
   "t: '🐠🐠🐠🐠🐠🐠 − 🐠🐠🐠🐠🐠🐠 = ?'"],

  ["t: '4 🐧 stand on the ice. 1 slides away. How many 🐧 are left?'",
   "t: '🐧🐧🐧🐧 − 🐧 = ?'"],

  ["t: '3 🌼 bloom in a garden. 1 is picked. How many 🌼 are still there?'",
   "t: '🌼🌼🌼 − 🌼 = ?'"],

  ["t: '2 - 1 = ?'",
   "t: '🌈🌈 − 🌈 = ?'"],

  // '7 - 3 = ?' — unique (🎀 grid)
  ["t: '7 - 3 = ?',\n          v: {type:'objectSet', config:{count:7, emoji:'🎀'",
   "t: '🎀🎀🎀🎀🎀🎀🎀 − 🎀🎀🎀 = ?',\n          v: {type:'objectSet', config:{count:7, emoji:'🎀'"],

  ["t: '8 🍦 are in the freezer. 4 are eaten. How many 🍦 are left?'",
   "t: '🍦🍦🍦🍦🍦🍦🍦🍦 − 🍦🍦🍦🍦 = ?'"],

  ["t: '9 - 5 = ?'",
   "t: '🌺🌺🌺🌺🌺🌺🌺🌺🌺 − 🌺🌺🌺🌺🌺 = ?'"],

  ["t: '6 🐟 swim in a pond. 4 swim away. How many 🐟 remain?'",
   "t: '🐟🐟🐟🐟🐟🐟 − 🐟🐟🐟🐟 = ?'"],

  ["t: '7 🧩 are on the floor. 5 are put away. How many 🧩 are left?'",
   "t: '🧩🧩🧩🧩🧩🧩🧩 − 🧩🧩🧩🧩🧩 = ?'"],

  ["t: '10 - 8 = ?'",
   "t: '🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎 − 🍎🍎🍎🍎🍎🍎🍎🍎 = ?'"],

  ["t: '10 - 9 = ?'",
   "t: '🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 − 🌟🌟🌟🌟🌟🌟🌟🌟🌟 = ?'"],

  ["t: '9 - 8 = ?'",
   "t: '🎈🎈🎈🎈🎈🎈🎈🎈🎈 − 🎈🎈🎈🎈🎈🎈🎈🎈 = ?'"],

  ["t: '4 - 4 = ?'",
   "t: '🦋🦋🦋🦋 − 🦋🦋🦋🦋 = ?'"],

  ["t: '5 - 5 = ?'",
   "t: '🐥🐥🐥🐥🐥 − 🐥🐥🐥🐥🐥 = ?'"],

  // ── L3 qBank ─────────────────────────────────────────────────────────────

  ["t: 'There were 3 dogs at the park. 4 more dogs came. How many dogs are there now?'",
   "t: '🐶🐶🐶 + 🐶🐶🐶🐶 = ?'"],

  ["t: 'You had 5 apples. Your friend gave you 3 more. How many apples do you have?'",
   "t: '🍎🍎🍎🍎🍎 + 🍎🍎🍎 = ?'"],

  ["t: 'A bird had 2 eggs. She laid 4 more. How many eggs does she have?'",
   "t: '🥚🥚 + 🥚🥚🥚🥚 = ?'"],

  ["t: 'There were 8 fish in the pond. 3 swam away. How many fish are left in the pond?'",
   "t: '🐟🐟🐟🐟🐟🐟🐟🐟 − 🐟🐟🐟 = ?'"],

  ["t: 'Mom baked 6 muffins. The family ate 2. How many muffins are left?'",
   "t: '🧁🧁🧁🧁🧁🧁 − 🧁🧁 = ?'"],

  ["t: 'There are 4 cats napping. 4 more cats join them. How many cats are there now?'",
   "t: '🐱🐱🐱🐱 + 🐱🐱🐱🐱 = ?'"],

  ["t: 'Ben had 7 balloons. 2 popped. How many balloons does Ben have left?'",
   "t: '🎈🎈🎈🎈🎈🎈🎈 − 🎈🎈 = ?'"],

  ["t: 'A bag has 5 red blocks and 3 blue blocks. How many blocks are in the bag?'",
   "t: '🟥🟥🟥🟥🟥 + 🟦🟦🟦 = ?'"],

  ["t: 'Mia had 10 stickers. She gave 4 to her friend. How many stickers does Mia have?'",
   "t: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ − ⭐⭐⭐⭐ = ?'"],

  ["t: 'There are 9 crayons in the box. Some are red and 4 are blue. How many are red?'",
   "t: '9 − 4 = ?'"],

  ["t: 'Some birds were on a wire. 3 flew away and 7 are left. How many were there at the start?'",
   "t: '7 + 3 = ?'"],

  ["t: 'Sam collected 3 shells on Monday and 5 shells on Tuesday. How many shells in all?'",
   "t: '🐚🐚🐚 + 🐚🐚🐚🐚🐚 = ?'"],

  ["t: 'There were 9 kids in the pool. 6 got out. How many kids are still in the pool?'",
   "t: '🏊🏊🏊🏊🏊🏊🏊🏊🏊 − 🏊🏊🏊🏊🏊🏊 = ?'"],

  ["t: 'A tree had some apples. 2 fell down and 6 are still on the tree. How many apples at first?'",
   "t: '6 + 2 = ?'"],

  ["t: 'Leo had 1 toy car. His grandma gave him 8 more. How many toy cars does Leo have now?'",
   "t: '🚗 + 🚗🚗🚗🚗🚗🚗🚗🚗 = ?'"],

  ["t: 'A farmer had some chickens. 3 hatched and now there are 8 total. How many were there before?'",
   "t: '8 − 3 = ?'"],

  ["t: 'There were 6 children at lunch. 2 went to recess. How many children are still at lunch?'",
   "t: '🧒🧒🧒🧒🧒🧒 − 🧒🧒 = ?'"],

  ["t: '2 🐇 hop in the garden. 3 more 🐇 join them. How many 🐇 are in the garden?'",
   "t: '🐇🐇 + 🐇🐇🐇 = ?'"],

  ["t: 'There were 4 🌸 in a vase. 2 flowers were taken out. How many 🌸 are left?'",
   "t: '🌸🌸🌸🌸 − 🌸🌸 = ?'"],

  ["t: 'There are 5 🐢 on the rock. 1 more 🐢 climbs up. How many 🐢 in all?'",
   "t: '🐢🐢🐢🐢🐢 + 🐢 = ?'"],

  ["t: '4 🚂 are on the track. 3 🚛 join them. How many vehicles are there in all?'",
   "t: '🚂🚂🚂🚂 + 🚛🚛🚛 = ?'"],

  ["t: '9 🦋 land on a flower. 4 fly away. How many 🦋 are left on the flower?'",
   "t: '🦋🦋🦋🦋🦋🦋🦋🦋🦋 − 🦋🦋🦋🦋 = ?'"],

  ["t: '6 beads are on a string. 3 fall off. How many beads are still on the string?'",
   "t: '🔵🔵🔵🔵🔵🔵 − 🔵🔵🔵 = ?'"],

  ["t: 'Some frogs were on a lily pad. 5 more hopped on and now there are 8. How many were there before?'",
   "t: '8 − 5 = ?'"],

  ["t: 'Some ducklings swam in a pond. 3 waddled away and 5 are still swimming. How many were there at the start?'",
   "t: '5 + 3 = ?'"],

  ["t: 'There are 10 🦆 by the pond. 7 fly away. How many 🦆 are left?'",
   "t: '🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆 − 🦆🦆🦆🦆🦆🦆🦆 = ?'"],

  ["t: 'A jar had some cookies. 4 were eaten and now there are 6 left. Were there more than 8 cookies at the start?'",
   "t: '6 + 4 = ?'"],

  ["t: 'There are 7 🐠 in a tank. Some are orange and 3 are blue. How many are orange?'",
   "t: '7 − 3 = ?'"],

  // ── L4 qBank ─────────────────────────────────────────────────────────────

  ["t: 'Which number sentence shows 3 + 2?'",
   "t: '🔵🔵🔵 + 🔵🔵 = ?'"],

  ["t: 'Maria says 4 + 2 = 7. Is she right?'",
   "t: '4 + 2 = 7 ?'"],

  ["t: 'Which is the best way to find 6 - 2?'",
   "t: '6 − 2 = ?'"],

  ["t: 'Sam has 5 blocks. He gets more. Now he has 9. Which number sentence fits?'",
   "t: '5 + ? = 9'"],

  ["t: 'Which shows 7 - 3?'",
   "t: '🍕🍕🍕🍕🍕🍕🍕 − 🍕🍕🍕 = ?'"],

  ["t: 'How do you know that 5 + 5 = 10?'",
   "t: '5 + 5 = ?'"],

  ["t: 'Lily has 8 grapes. She eats some and has 3 left. Which number sentence fits?'",
   "t: '8 − ? = 3'"],

  ["t: 'Which is the same as 4 + 3?'",
   "t: '🔷🔷🔷🔷 + 🔷🔷🔷 = ?'"],

  ["t: 'Start at 3. Count up 5 more. Where do you land?'",
   "t: '3 + 5 = ?'"],

  ["t: 'Which tells you how many are left after 9 - 4?'",
   "t: '🎯🎯🎯🎯🎯🎯🎯🎯🎯 − 🎯🎯🎯🎯 = ?'"],

  ["t: 'Tom says counting all of the objects gives you 3 + 4. Is he right?'",
   "t: '🔴🔴🔴 + 🔵🔵🔵🔵 = ?'"],

  ["t: 'Which is the best way to check that 6 + 3 = 9?'",
   "t: '6 + 3 = 9 ?'"],

  ["t: 'Which number sentence matches: A pond had 7 frogs. 4 jumped away. How many remain?'",
   "t: '🐸🐸🐸🐸🐸🐸🐸 − 🐸🐸🐸🐸 = ?'"],

  ["t: 'Emma counts back from 10 to find 10 - 4. She lands on 6. Is she right?'",
   "t: '10 − 4 = 6 ?'"],

  ["t: 'Which picture shows 2 + 5?'",
   "t: '🟡🟡 + 🟡🟡🟡🟡🟡 = ?'"],

  ["t: 'Which picture shows 4 + 1?'",
   "t: '🟠🟠🟠🟠 + 🟠 = ?'"],

  ["t: 'Start at 6 and count back 2. Which number sentence does that show?'",
   "t: '6 − 2 = ?'"],

  ["t: 'Is 3 + 6 = 8 correct?'",
   "t: '🟢🟢🟢 + 🟢🟢🟢🟢🟢🟢 = 8 ?'"],

  ["t: 'A story says: 8 birds sat in a tree and 3 flew away. Which number sentence fits best?'",
   "t: '🐦🐦🐦🐦🐦🐦🐦🐦 − 🐦🐦🐦 = ?'"],

  ["t: 'What is the best strategy for finding 7 + 2?'",
   "t: '7 + 2 = ?'"],

  ["t: 'Ava has 6 toys. She gives 4 away. Which number sentence shows this?'",
   "t: '🧸🧸🧸🧸🧸🧸 − 🧸🧸🧸🧸 = ?'"],

  ["t: 'Dan says 9 - 3 = 5. What is the correct answer?'",
   "t: '🍊🍊🍊🍊🍊🍊🍊🍊🍊 − 🍊🍊🍊 = ?'"],

  ["t: 'Which is the same as 6 + 2?'",
   "t: '6 + 2 = ?'"],

  ["t: 'Why does 5 + 0 = 5?'",
   "t: '5 + 0 = ?'"],

  ["t: 'Is 7 - 2 = 4 correct?'",
   "t: '🍋🍋🍋🍋🍋🍋🍋 − 🍋🍋 = ?'"],

  ["t: 'Which has the same total as 8 + 1?'",
   "t: '8 + 1 = ?'"],

  // ── testBank ─────────────────────────────────────────────────────────────

  // '4 + 3 = ?' — unique in testBank (🍭)
  ["t: '4 + 3 = ?',\n      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🍭'",
   "t: '🍭🍭🍭🍭 + 🍭🍭🍭 = ?',\n      v: {type:'twoGroups', config:{leftCount:4, leftObj:'🍭'"],

  ["t: 'There are 2 🦄 on the hill. 6 more join them. How many 🦄 are there?'",
   "t: '🦄🦄 + 🦄🦄🦄🦄🦄🦄 = ?'"],

  // '1 + 9 = ?' — v:null, keep numbers

  // '5 + 3 = ?' DUPLICATE in testBank: line ~858 uses 🎃, line ~966 uses 🐠
  ["t: '5 + 3 = ?',\n      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🎃'",
   "t: '🎃🎃🎃🎃🎃 + 🎃🎃🎃 = ?',\n      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🎃'"],

  // L2 subtraction testBank originals
  ["t: '9 - 3 = ?'",
   "t: '🌈🌈🌈🌈🌈🌈🌈🌈🌈 − 🌈🌈🌈 = ?'"],

  ["t: 'There are 7 🍦 in the freezer. 5 are eaten. How many 🍦 are left?'",
   "t: '🍦🍦🍦🍦🍦🍦🍦 − 🍦🍦🍦🍦🍦 = ?'"],

  // '10 - 7 = ?' DUPLICATE: original testBank uses 🏀, new testBank section uses 🍋
  ["t: '10 - 7 = ?',\n      v: {type:'objectSet', config:{count:10, emoji:'🏀'",
   "t: '🏀🏀🏀🏀🏀🏀🏀🏀🏀🏀 − 🏀🏀🏀 = ?',\n      v: {type:'objectSet', config:{count:10, emoji:'🏀'"],

  ["t: '6 notes are on the board. 4 are erased. How many notes are left?'",
   "t: '🎵🎵🎵🎵🎵🎵 − 🎵🎵🎵🎵 = ?'"],

  // L3 word problems testBank
  ["t: 'Ana had 3 ribbons. Her mom gave her 5 more. How many ribbons does Ana have?'",
   "t: '🎀🎀🎀 + 🎀🎀🎀🎀🎀 = ?'"],

  ["t: 'There were 10 clouds. 6 blew away. How many clouds are in the sky?'",
   "t: '☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️ − ☁️☁️☁️☁️☁️☁️ = ?'"],

  ["t: 'A basket had some oranges. 4 were given away and 3 are left. How many were in the basket?'",
   "t: '3 + 4 = ?'"],

  ["t: 'Jake sees 4 🐘 at the zoo. Later he sees 4 more. How many 🐘 in all?'",
   "t: '🐘🐘🐘🐘 + 🐘🐘🐘🐘 = ?'"],

  // L4 testBank
  ["t: 'Which number sentence shows 5 + 4?'",
   "t: '⭐⭐⭐⭐⭐ + ⭐⭐⭐⭐ = ?'"],

  ["t: 'Joe says 8 - 5 = 4. Is he right?'",
   "t: '8 − 5 = 4 ?'"],

  ["t: 'Which is the same as 2 + 8?'",
   "t: '2 + 8 = ?'"],

  ["t: 'Which number sentence matches: 7 boats sail away from 10 boats?'",
   "t: '⛵⛵⛵⛵⛵⛵⛵⛵⛵⛵ − ⛵⛵⛵⛵⛵⛵⛵ = ?'"],

  // NEW testBank additions
  ["t: '1 + 4 = ?'",
   "t: '🌼 + 🌼🌼🌼🌼 = ?'"],

  // '2 + 2 = ?' in testBank uses 🐥
  ["t: '2 + 2 = ?',\n      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐥'",
   "t: '🐥🐥 + 🐥🐥 = ?',\n      v: {type:'twoGroups', config:{leftCount:2, leftObj:'🐥'"],

  ["t: '3 + 2 = ?'",
   "t: '🍦🍦🍦 + 🍦🍦 = ?'"],

  ["t: '3 + 5 = ?'",
   "t: '🌷🌷🌷 + 🌷🌷🌷🌷🌷 = ?'"],

  // '5 + 3 = ?' testBank new section uses 🐠
  ["t: '5 + 3 = ?',\n      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐠'",
   "t: '🐠🐠🐠🐠🐠 + 🐠🐠🐠 = ?',\n      v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐠'"],

  ["t: '2 + 6 = ?'",
   "t: '🎶🎶 + 🎶🎶🎶🎶🎶🎶 = ?'"],

  ["t: '4 + 4 = ?'",
   "t: '🎀🎀🎀🎀 + 🎀🎀🎀🎀 = ?'"],

  // '9 + 1 = ?' testBank uses 🌻
  ["t: '9 + 1 = ?',\n      v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌻'",
   "t: '🌻🌻🌻🌻🌻🌻🌻🌻🌻 + 🌻 = ?',\n      v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌻'"],

  // '8 + 2 = ?' testBank uses 🐝
  ["t: '8 + 2 = ?',\n      v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐝'",
   "t: '🐝🐝🐝🐝🐝🐝🐝🐝 + 🐝🐝 = ?',\n      v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐝'"],

  ["t: '5 - 1 = ?'",
   "t: '🍓🍓🍓🍓🍓 − 🍓 = ?'"],

  ["t: '4 - 2 = ?'",
   "t: '🌼🌼🌼🌼 − 🌼🌼 = ?'"],

  ["t: '3 - 2 = ?'",
   "t: '🐣🐣🐣 − 🐣🐣 = ?'"],

  ["t: '8 - 3 = ?'",
   "t: '🍒🍒🍒🍒🍒🍒🍒🍒 − 🍒🍒🍒 = ?'"],

  // '7 - 4 = ?' testBank uses 🌺
  ["t: '7 - 4 = ?',\n      v: {type:'objectSet', config:{count:7, emoji:'🌺'",
   "t: '🌺🌺🌺🌺🌺🌺🌺 − 🌺🌺🌺🌺 = ?',\n      v: {type:'objectSet', config:{count:7, emoji:'🌺'"],

  // '6 - 3 = ?' testBank uses 🦋
  ["t: '6 - 3 = ?',\n      v: {type:'objectSet', config:{count:6, emoji:'🦋'",
   "t: '🦋🦋🦋🦋🦋🦋 − 🦋🦋🦋 = ?',\n      v: {type:'objectSet', config:{count:6, emoji:'🦋'"],

  ["t: '9 - 6 = ?'",
   "t: '🎈🎈🎈🎈🎈🎈🎈🎈🎈 − 🎈🎈🎈🎈🎈🎈 = ?'"],

  // '10 - 7 = ?' testBank new section uses 🍋
  ["t: '10 - 7 = ?',\n      v: {type:'objectSet', config:{count:10, emoji:'🍋'",
   "t: '🍋🍋🍋🍋🍋🍋🍋🍋🍋🍋 − 🍋🍋🍋 = ?',\n      v: {type:'objectSet', config:{count:10, emoji:'🍋'"],

  ["t: '8 - 8 = ?'",
   "t: '🐧🐧🐧🐧🐧🐧🐧🐧 − 🐧🐧🐧🐧🐧🐧🐧🐧 = ?'"],

  // L3 testBank word problems
  ["t: '2 🐸 sit on a rock. 3 more 🐸 jump on. How many 🐸 in all?'",
   "t: '🐸🐸 + 🐸🐸🐸 = ?'"],

  ["t: 'There are 3 🌟 in the sky. 2 fade away. How many 🌟 are left?'",
   "t: '🌟🌟🌟 − 🌟🌟 = ?'"],

  ["t: '3 🐦 perch on a fence. 5 more 🐦 land. How many 🐦 are on the fence?'",
   "t: '🐦🐦🐦 + 🐦🐦🐦🐦🐦 = ?'"],

  ["t: 'There are 8 🍪 on a plate. 4 are eaten. How many 🍪 are left?'",
   "t: '🍪🍪🍪🍪🍪🍪🍪🍪 − 🍪🍪🍪🍪 = ?'"],

  ["t: 'There are 7 🎈 at a party. 4 pop. How many 🎈 are still there?'",
   "t: '🎈🎈🎈🎈🎈🎈🎈 − 🎈🎈🎈🎈 = ?'"],

  ["t: 'Some apples were in a bowl. 3 were eaten and 5 are left. How many apples were in the bowl at first?'",
   "t: '5 + 3 = ?'"],

  ["t: 'Some 🐣 were in a nest. 4 hatched and now there are 6 total. How many were there before any hatched?'",
   "t: '6 − 4 = ?'"],

  ["t: 'A box had 10 🖍 inside. Some were given to a friend and 3 are left. How many were given away?'",
   "t: '🖍🖍🖍🖍🖍🖍🖍🖍🖍🖍 − 🖍🖍🖍 = ?'"],

  // L4 testBank
  ["t: 'Which number sentence shows 3 + 4?'",
   "t: '🔶🔶🔶 + 🔶🔶🔶🔶 = ?'"],

  ["t: 'Which shows 5 - 2?'",
   "t: '🍇🍇🍇🍇🍇 − 🍇🍇 = ?'"],

  ["t: 'Is 6 + 3 = 8 correct?'",
   "t: '6 + 3 = 8 ?'"],

  ["t: 'A story says: 9 kittens played outside and 5 went inside. Which number sentence fits?'",
   "t: '🐱🐱🐱🐱🐱🐱🐱🐱🐱 − 🐱🐱🐱🐱🐱 = ?'"],

  ["t: 'Which is the same as 5 + 4?'",
   "t: '5 + 4 = ?'"],

  ["t: 'Zoe says the best way to find 7 + 3 is to start at 7 and count 3 more. Is she right?'",
   "t: '7 + 3 = ?'"],

  ["t: 'Which is the same as 4 + 6?'",
   "t: '4 + 6 = ?'"],

  ["t: 'Why does 8 + 0 = 8?'",
   "t: '8 + 0 = ?'"],
];

let count = 0;
for (const [oldStr, newStr] of REPS) {
  if (src.includes(oldStr)) {
    src = src.replace(oldStr, newStr);
    count++;
  } else {
    console.warn('NOT FOUND:', oldStr.slice(0, 60));
  }
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`Done. Applied ${count} / ${REPS.length} replacements.`);
