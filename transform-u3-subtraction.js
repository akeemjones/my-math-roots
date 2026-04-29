/**
 * Converts all applicable objectSet subtraction questions in src/data/k/u3.js
 * to twoGroups subtract (interactive BUILD manipulative).
 *
 * L2 qBank: changes BOTH t: (plain language) and v: (twoGroups subtract)
 * L3 qBank: changes v: only (keeps original emoji equation t:)
 * testBank L2+L3: changes v: only (keeps original emoji equation t:)
 * L4 questions: SKIP (sentence-form options incompatible with BUILD)
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'src/data/k/u3.js');
let src = fs.readFileSync(FILE, 'utf8');

const q  = '          ';  // 10 spaces (qBank indent)
const tb = '      ';      // 6 spaces (testBank indent)
const NL = '\r\n';        // CRLF

const REPS = [

  // ══════════════════════════════════════════════════════════════════════════
  // L2 qBank — change BOTH t: AND v:
  // ══════════════════════════════════════════════════════════════════════════

  // 1. 🍎 5-2=3
  [
    `${q}t: '🍎🍎🍎🍎🍎 \u2212 🍎🍎 = ?',${NL}${q}v: {type:'objectSet', config:{count:5, emoji:'🍎', layout:'line'}},`,
    `${q}t: '5 🍎, take away 2. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🍎', rightCount:2, rightObj:'🍎', op:'subtract'}},`
  ],

  // 2. 🧩 6-3=3
  [
    `${q}t: '🧩🧩🧩🧩🧩🧩 \u2212 🧩🧩🧩 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🧩', layout:'line'}},`,
    `${q}t: '6 🧩, take away 3. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🧩', rightCount:3, rightObj:'🧩', op:'subtract'}},`
  ],

  // 3. 🐦 8-3=5
  [
    `${q}t: '🐦🐦🐦🐦🐦🐦🐦🐦 \u2212 🐦🐦🐦 = ?',${NL}${q}v: {type:'objectSet', config:{count:8, emoji:'🐦', layout:'line'}},`,
    `${q}t: '8 🐦, take away 3. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐦', rightCount:3, rightObj:'🐦', op:'subtract'}},`
  ],

  // 4. 🌻 4-1=3
  [
    `${q}t: '🌻🌻🌻🌻 \u2212 🌻 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🌻', layout:'line'}},`,
    `${q}t: '4 🌻, take away 1. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🌻', rightCount:1, rightObj:'🌻', op:'subtract'}},`
  ],

  // 5. 🍪 7-4=3
  [
    `${q}t: '🍪🍪🍪🍪🍪🍪🍪 \u2212 🍪🍪🍪🍪 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🍪', layout:'grid'}},`,
    `${q}t: '7 🍪, take away 4. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🍪', rightCount:4, rightObj:'🍪', op:'subtract'}},`
  ],

  // 6. 🌟 10-5=5
  [
    `${q}t: '🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 \u2212 🌟🌟🌟🌟🌟 = ?',${NL}${q}v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},`,
    `${q}t: '10 🌟, take away 5. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🌟', rightCount:5, rightObj:'🌟', op:'subtract'}},`
  ],

  // 7. 🐝 9-2=7
  [
    `${q}t: '🐝🐝🐝🐝🐝🐝🐝🐝🐝 \u2212 🐝🐝 = ?',${NL}${q}v: {type:'objectSet', config:{count:9, emoji:'🐝', layout:'grid'}},`,
    `${q}t: '9 🐝, take away 2. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🐝', rightCount:2, rightObj:'🐝', op:'subtract'}},`
  ],

  // 8. 🍩 3-3=0 (subtract-all)
  [
    `${q}t: '🍩🍩🍩 \u2212 🍩🍩🍩 = ?',${NL}${q}v: {type:'objectSet', config:{count:3, emoji:'🍩', layout:'line'}},`,
    `${q}t: '3 🍩, take away all 3. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:3, leftObj:'🍩', rightCount:3, rightObj:'🍩', op:'subtract'}},`
  ],

  // 9. 🌮 6-2=4
  [
    `${q}t: '🌮🌮🌮🌮🌮🌮 \u2212 🌮🌮 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🌮', layout:'line'}},`,
    `${q}t: '6 🌮, take away 2. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🌮', rightCount:2, rightObj:'🌮', op:'subtract'}},`
  ],

  // 10. 🍒 8-6=2
  [
    `${q}t: '🍒🍒🍒🍒🍒🍒🍒🍒 \u2212 🍒🍒🍒🍒🍒🍒 = ?',${NL}${q}v: {type:'objectSet', config:{count:8, emoji:'🍒', layout:'grid'}},`,
    `${q}t: '8 🍒, take away 6. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🍒', rightCount:6, rightObj:'🍒', op:'subtract'}},`
  ],

  // 11. 🌟 5-3=2
  [
    `${q}t: '🌟🌟🌟🌟🌟 \u2212 🌟🌟🌟 = ?',${NL}${q}v: {type:'objectSet', config:{count:5, emoji:'🌟', layout:'line'}},`,
    `${q}t: '5 🌟, take away 3. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🌟', rightCount:3, rightObj:'🌟', op:'subtract'}},`
  ],

  // 12. 🍇 7-4=3
  [
    `${q}t: '🍇🍇🍇🍇🍇🍇🍇 \u2212 🍇🍇🍇🍇 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🍇', layout:'grid'}},`,
    `${q}t: '7 🍇, take away 4. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🍇', rightCount:4, rightObj:'🍇', op:'subtract'}},`
  ],

  // 13. 🎀 4-2=2
  [
    `${q}t: '🎀🎀🎀🎀 \u2212 🎀🎀 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🎀', layout:'line'}},`,
    `${q}t: '4 🎀, take away 2. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🎀', rightCount:2, rightObj:'🎀', op:'subtract'}},`
  ],

  // 14. 🏐 10-3=7
  [
    `${q}t: '🏐🏐🏐🏐🏐🏐🏐🏐🏐🏐 \u2212 🏐🏐🏐 = ?',${NL}${q}v: {type:'objectSet', config:{count:10, emoji:'🏐', layout:'grid'}},`,
    `${q}t: '10 🏐, take away 3. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🏐', rightCount:3, rightObj:'🏐', op:'subtract'}},`
  ],

  // 15. 🐠 6-6=0 (subtract-all)
  [
    `${q}t: '🐠🐠🐠🐠🐠🐠 \u2212 🐠🐠🐠🐠🐠🐠 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🐠', layout:'line'}},`,
    `${q}t: '6 🐠, take away all 6. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🐠', rightCount:6, rightObj:'🐠', op:'subtract'}},`
  ],

  // 16. 🐧 4-1=3
  [
    `${q}t: '🐧🐧🐧🐧 \u2212 🐧 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🐧', layout:'line'}},`,
    `${q}t: '4 🐧, take away 1. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🐧', rightCount:1, rightObj:'🐧', op:'subtract'}},`
  ],

  // 17. 🌼 3-1=2
  [
    `${q}t: '🌼🌼🌼 \u2212 🌼 = ?',${NL}${q}v: {type:'objectSet', config:{count:3, emoji:'🌼', layout:'line'}},`,
    `${q}t: '3 🌼, take away 1. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌼', rightCount:1, rightObj:'🌼', op:'subtract'}},`
  ],

  // 18. 🌈 2-1=1
  [
    `${q}t: '🌈🌈 \u2212 🌈 = ?',${NL}${q}v: {type:'objectSet', config:{count:2, emoji:'🌈', layout:'line'}},`,
    `${q}t: '2 🌈, take away 1. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:2, leftObj:'🌈', rightCount:1, rightObj:'🌈', op:'subtract'}},`
  ],

  // 19. 🎀 7-3=4
  [
    `${q}t: '🎀🎀🎀🎀🎀🎀🎀 \u2212 🎀🎀🎀 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🎀', layout:'grid'}},`,
    `${q}t: '7 🎀, take away 3. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🎀', rightCount:3, rightObj:'🎀', op:'subtract'}},`
  ],

  // 20. 🍦 8-4=4
  [
    `${q}t: '🍦🍦🍦🍦🍦🍦🍦🍦 \u2212 🍦🍦🍦🍦 = ?',${NL}${q}v: {type:'objectSet', config:{count:8, emoji:'🍦', layout:'grid'}},`,
    `${q}t: '8 🍦, take away 4. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🍦', rightCount:4, rightObj:'🍦', op:'subtract'}},`
  ],

  // 21. 🌺 9-5=4
  [
    `${q}t: '🌺🌺🌺🌺🌺🌺🌺🌺🌺 \u2212 🌺🌺🌺🌺🌺 = ?',${NL}${q}v: {type:'objectSet', config:{count:9, emoji:'🌺', layout:'grid'}},`,
    `${q}t: '9 🌺, take away 5. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌺', rightCount:5, rightObj:'🌺', op:'subtract'}},`
  ],

  // 22. 🐟 6-4=2
  [
    `${q}t: '🐟🐟🐟🐟🐟🐟 \u2212 🐟🐟🐟🐟 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🐟', layout:'line'}},`,
    `${q}t: '6 🐟, take away 4. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🐟', rightCount:4, rightObj:'🐟', op:'subtract'}},`
  ],

  // 23. 🧩 7-5=2
  [
    `${q}t: '🧩🧩🧩🧩🧩🧩🧩 \u2212 🧩🧩🧩🧩🧩 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🧩', layout:'grid'}},`,
    `${q}t: '7 🧩, take away 5. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🧩', rightCount:5, rightObj:'🧩', op:'subtract'}},`
  ],

  // 24. 🍎 10-8=2
  [
    `${q}t: '🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎 \u2212 🍎🍎🍎🍎🍎🍎🍎🍎 = ?',${NL}${q}v: {type:'objectSet', config:{count:10, emoji:'🍎', layout:'grid'}},`,
    `${q}t: '10 🍎, take away 8. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🍎', rightCount:8, rightObj:'🍎', op:'subtract'}},`
  ],

  // 25. 🌟 10-9=1
  [
    `${q}t: '🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 \u2212 🌟🌟🌟🌟🌟🌟🌟🌟🌟 = ?',${NL}${q}v: {type:'objectSet', config:{count:10, emoji:'🌟', layout:'grid'}},`,
    `${q}t: '10 🌟, take away 9. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🌟', rightCount:9, rightObj:'🌟', op:'subtract'}},`
  ],

  // 26. 🎈 9-8=1
  [
    `${q}t: '🎈🎈🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈🎈🎈🎈🎈🎈🎈 = ?',${NL}${q}v: {type:'objectSet', config:{count:9, emoji:'🎈', layout:'grid'}},`,
    `${q}t: '9 🎈, take away 8. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎈', rightCount:8, rightObj:'🎈', op:'subtract'}},`
  ],

  // 27. 🦋 4-4=0 (subtract-all)
  [
    `${q}t: '🦋🦋🦋🦋 \u2212 🦋🦋🦋🦋 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🦋', layout:'line'}},`,
    `${q}t: '4 🦋, take away all 4. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🦋', rightCount:4, rightObj:'🦋', op:'subtract'}},`
  ],

  // 28. 🐥 5-5=0 (subtract-all)
  [
    `${q}t: '🐥🐥🐥🐥🐥 \u2212 🐥🐥🐥🐥🐥 = ?',${NL}${q}v: {type:'objectSet', config:{count:5, emoji:'🐥', layout:'line'}},`,
    `${q}t: '5 🐥, take away all 5. How many are left?',${NL}${q}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🐥', rightCount:5, rightObj:'🐥', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // L3 qBank — change v: only (keep original t:)
  // ══════════════════════════════════════════════════════════════════════════

  // 29. 🐟 8-3=5
  [
    `${q}t: '🐟🐟🐟🐟🐟🐟🐟🐟 \u2212 🐟🐟🐟 = ?',${NL}${q}v: {type:'objectSet', config:{count:8, emoji:'🐟', layout:'grid'}},`,
    `${q}t: '🐟🐟🐟🐟🐟🐟🐟🐟 \u2212 🐟🐟🐟 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐟', rightCount:3, rightObj:'🐟', op:'subtract'}},`
  ],

  // 30. 🧁 6-2=4
  [
    `${q}t: '🧁🧁🧁🧁🧁🧁 \u2212 🧁🧁 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🧁', layout:'line'}},`,
    `${q}t: '🧁🧁🧁🧁🧁🧁 \u2212 🧁🧁 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🧁', rightCount:2, rightObj:'🧁', op:'subtract'}},`
  ],

  // 31. 🎈 7-2=5
  [
    `${q}t: '🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈 = ?',${NL}${q}v: {type:'objectSet', config:{count:7, emoji:'🎈', layout:'line'}},`,
    `${q}t: '🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🎈', rightCount:2, rightObj:'🎈', op:'subtract'}},`
  ],

  // 32. ⭐ 10-4=6
  [
    `${q}t: '\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50 \u2212 \u2b50\u2b50\u2b50\u2b50 = ?',${NL}${q}v: {type:'objectSet', config:{count:10, emoji:'\u2b50', layout:'grid'}},`,
    `${q}t: '\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50 \u2212 \u2b50\u2b50\u2b50\u2b50 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:10, leftObj:'\u2b50', rightCount:4, rightObj:'\u2b50', op:'subtract'}},`
  ],

  // 33. 🏊 9-6=3
  [
    `${q}t: '🏊🏊🏊🏊🏊🏊🏊🏊🏊 \u2212 🏊🏊🏊🏊🏊🏊 = ?',${NL}${q}v: {type:'objectSet', config:{count:9, emoji:'🏊', layout:'grid'}},`,
    `${q}t: '🏊🏊🏊🏊🏊🏊🏊🏊🏊 \u2212 🏊🏊🏊🏊🏊🏊 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🏊', rightCount:6, rightObj:'🏊', op:'subtract'}},`
  ],

  // 34. 🧒 6-2=4
  [
    `${q}t: '🧒🧒🧒🧒🧒🧒 \u2212 🧒🧒 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🧒', layout:'line'}},`,
    `${q}t: '🧒🧒🧒🧒🧒🧒 \u2212 🧒🧒 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🧒', rightCount:2, rightObj:'🧒', op:'subtract'}},`
  ],

  // 35. 🌸 4-2=2
  [
    `${q}t: '🌸🌸🌸🌸 \u2212 🌸🌸 = ?',${NL}${q}v: {type:'objectSet', config:{count:4, emoji:'🌸', layout:'line'}},`,
    `${q}t: '🌸🌸🌸🌸 \u2212 🌸🌸 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🌸', rightCount:2, rightObj:'🌸', op:'subtract'}},`
  ],

  // 36. 🦋 9-4=5
  [
    `${q}t: '🦋🦋🦋🦋🦋🦋🦋🦋🦋 \u2212 🦋🦋🦋🦋 = ?',${NL}${q}v: {type:'objectSet', config:{count:9, emoji:'🦋', layout:'grid'}},`,
    `${q}t: '🦋🦋🦋🦋🦋🦋🦋🦋🦋 \u2212 🦋🦋🦋🦋 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🦋', rightCount:4, rightObj:'🦋', op:'subtract'}},`
  ],

  // 37. 🔵 6-3=3
  [
    `${q}t: '🔵🔵🔵🔵🔵🔵 \u2212 🔵🔵🔵 = ?',${NL}${q}v: {type:'objectSet', config:{count:6, emoji:'🔵', layout:'line'}},`,
    `${q}t: '🔵🔵🔵🔵🔵🔵 \u2212 🔵🔵🔵 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🔵', rightCount:3, rightObj:'🔵', op:'subtract'}},`
  ],

  // 38. 🦆 10-7=3
  [
    `${q}t: '🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆 \u2212 🦆🦆🦆🦆🦆🦆🦆 = ?',${NL}${q}v: {type:'objectSet', config:{count:10, emoji:'🦆', layout:'grid'}},`,
    `${q}t: '🦆🦆🦆🦆🦆🦆🦆🦆🦆🦆 \u2212 🦆🦆🦆🦆🦆🦆🦆 = ?',${NL}${q}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🦆', rightCount:7, rightObj:'🦆', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank L2 original (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 39. 🌈 9-3=6
  [
    `${tb}t: '🌈🌈🌈🌈🌈🌈🌈🌈🌈 \u2212 🌈🌈🌈 = ?',${NL}${tb}v: {type:'objectSet', config:{count:9, emoji:'🌈', layout:'grid'}},`,
    `${tb}t: '🌈🌈🌈🌈🌈🌈🌈🌈🌈 \u2212 🌈🌈🌈 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🌈', rightCount:3, rightObj:'🌈', op:'subtract'}},`
  ],

  // 40. 🍦 7-5=2
  [
    `${tb}t: '🍦🍦🍦🍦🍦🍦🍦 \u2212 🍦🍦🍦🍦🍦 = ?',${NL}${tb}v: {type:'objectSet', config:{count:7, emoji:'🍦', layout:'line'}},`,
    `${tb}t: '🍦🍦🍦🍦🍦🍦🍦 \u2212 🍦🍦🍦🍦🍦 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🍦', rightCount:5, rightObj:'🍦', op:'subtract'}},`
  ],

  // 41. 🏀 10-7=3
  [
    `${tb}t: '🏀🏀🏀🏀🏀🏀🏀🏀🏀🏀 \u2212 🏀🏀🏀 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🏀', layout:'grid'}},`,
    `${tb}t: '🏀🏀🏀🏀🏀🏀🏀🏀🏀🏀 \u2212 🏀🏀🏀 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🏀', rightCount:7, rightObj:'🏀', op:'subtract'}},`
  ],

  // 42. 🎵 6-4=2
  [
    `${tb}t: '🎵🎵🎵🎵🎵🎵 \u2212 🎵🎵🎵🎵 = ?',${NL}${tb}v: {type:'objectSet', config:{count:6, emoji:'🎵', layout:'line'}},`,
    `${tb}t: '🎵🎵🎵🎵🎵🎵 \u2212 🎵🎵🎵🎵 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🎵', rightCount:4, rightObj:'🎵', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank L3 original (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 43. ☁️ 10-6=4
  [
    `${tb}t: '\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f \u2212 \u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'\u2601\ufe0f', layout:'grid'}},`,
    `${tb}t: '\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f \u2212 \u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f\u2601\ufe0f = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:10, leftObj:'\u2601\ufe0f', rightCount:6, rightObj:'\u2601\ufe0f', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank NEW L2 easy (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 44. 🍓 5-1=4
  [
    `${tb}t: '🍓🍓🍓🍓🍓 \u2212 🍓 = ?',${NL}${tb}v: {type:'objectSet', config:{count:5, emoji:'🍓', layout:'line'}},`,
    `${tb}t: '🍓🍓🍓🍓🍓 \u2212 🍓 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:5, leftObj:'🍓', rightCount:1, rightObj:'🍓', op:'subtract'}},`
  ],

  // 45. 🌼 4-2=2
  [
    `${tb}t: '🌼🌼🌼🌼 \u2212 🌼🌼 = ?',${NL}${tb}v: {type:'objectSet', config:{count:4, emoji:'🌼', layout:'line'}},`,
    `${tb}t: '🌼🌼🌼🌼 \u2212 🌼🌼 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:4, leftObj:'🌼', rightCount:2, rightObj:'🌼', op:'subtract'}},`
  ],

  // 46. 🐣 3-2=1
  [
    `${tb}t: '🐣🐣🐣 \u2212 🐣🐣 = ?',${NL}${tb}v: {type:'objectSet', config:{count:3, emoji:'🐣', layout:'line'}},`,
    `${tb}t: '🐣🐣🐣 \u2212 🐣🐣 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:3, leftObj:'🐣', rightCount:2, rightObj:'🐣', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank NEW L2 medium (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 47. 🍒 8-3=5
  [
    `${tb}t: '🍒🍒🍒🍒🍒🍒🍒🍒 \u2212 🍒🍒🍒 = ?',${NL}${tb}v: {type:'objectSet', config:{count:8, emoji:'🍒', layout:'grid'}},`,
    `${tb}t: '🍒🍒🍒🍒🍒🍒🍒🍒 \u2212 🍒🍒🍒 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🍒', rightCount:3, rightObj:'🍒', op:'subtract'}},`
  ],

  // 48. 🌺 7-4=3
  [
    `${tb}t: '🌺🌺🌺🌺🌺🌺🌺 \u2212 🌺🌺🌺🌺 = ?',${NL}${tb}v: {type:'objectSet', config:{count:7, emoji:'🌺', layout:'grid'}},`,
    `${tb}t: '🌺🌺🌺🌺🌺🌺🌺 \u2212 🌺🌺🌺🌺 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🌺', rightCount:4, rightObj:'🌺', op:'subtract'}},`
  ],

  // 49. 🦋 6-3=3
  [
    `${tb}t: '🦋🦋🦋🦋🦋🦋 \u2212 🦋🦋🦋 = ?',${NL}${tb}v: {type:'objectSet', config:{count:6, emoji:'🦋', layout:'line'}},`,
    `${tb}t: '🦋🦋🦋🦋🦋🦋 \u2212 🦋🦋🦋 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:6, leftObj:'🦋', rightCount:3, rightObj:'🦋', op:'subtract'}},`
  ],

  // 50. 🎈 9-6=3
  [
    `${tb}t: '🎈🎈🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈🎈🎈🎈🎈 = ?',${NL}${tb}v: {type:'objectSet', config:{count:9, emoji:'🎈', layout:'grid'}},`,
    `${tb}t: '🎈🎈🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈🎈🎈🎈🎈 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:9, leftObj:'🎈', rightCount:6, rightObj:'🎈', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank NEW L2 hard (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 51. 🍋 10-7=3
  [
    `${tb}t: '🍋🍋🍋🍋🍋🍋🍋🍋🍋🍋 \u2212 🍋🍋🍋 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🍋', layout:'grid'}},`,
    `${tb}t: '🍋🍋🍋🍋🍋🍋🍋🍋🍋🍋 \u2212 🍋🍋🍋 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🍋', rightCount:7, rightObj:'🍋', op:'subtract'}},`
  ],

  // 52. 🐧 8-8=0 (subtract-all, testBank — v: only, t: stays as emoji equation)
  [
    `${tb}t: '🐧🐧🐧🐧🐧🐧🐧🐧 \u2212 🐧🐧🐧🐧🐧🐧🐧🐧 = ?',${NL}${tb}v: {type:'objectSet', config:{count:8, emoji:'🐧', layout:'grid'}},`,
    `${tb}t: '🐧🐧🐧🐧🐧🐧🐧🐧 \u2212 🐧🐧🐧🐧🐧🐧🐧🐧 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🐧', rightCount:8, rightObj:'🐧', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank NEW L3 easy (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 53. 🌟 3-2=1
  [
    `${tb}t: '🌟🌟🌟 \u2212 🌟🌟 = ?',${NL}${tb}v: {type:'objectSet', config:{count:3, emoji:'🌟', layout:'line'}},`,
    `${tb}t: '🌟🌟🌟 \u2212 🌟🌟 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:3, leftObj:'🌟', rightCount:2, rightObj:'🌟', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank NEW L3 medium (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 54. 🍪 8-4=4
  [
    `${tb}t: '🍪🍪🍪🍪🍪🍪🍪🍪 \u2212 🍪🍪🍪🍪 = ?',${NL}${tb}v: {type:'objectSet', config:{count:8, emoji:'🍪', layout:'grid'}},`,
    `${tb}t: '🍪🍪🍪🍪🍪🍪🍪🍪 \u2212 🍪🍪🍪🍪 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:8, leftObj:'🍪', rightCount:4, rightObj:'🍪', op:'subtract'}},`
  ],

  // 55. 🎈 7-4=3
  [
    `${tb}t: '🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈🎈🎈 = ?',${NL}${tb}v: {type:'objectSet', config:{count:7, emoji:'🎈', layout:'grid'}},`,
    `${tb}t: '🎈🎈🎈🎈🎈🎈🎈 \u2212 🎈🎈🎈🎈 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:7, leftObj:'🎈', rightCount:4, rightObj:'🎈', op:'subtract'}},`
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // testBank NEW L3 hard (6-space indent, v: only)
  // ══════════════════════════════════════════════════════════════════════════

  // 56. 🖍 10-3=7
  [
    `${tb}t: '🖍🖍🖍🖍🖍🖍🖍🖍🖍🖍 \u2212 🖍🖍🖍 = ?',${NL}${tb}v: {type:'objectSet', config:{count:10, emoji:'🖍', layout:'grid'}},`,
    `${tb}t: '🖍🖍🖍🖍🖍🖍🖍🖍🖍🖍 \u2212 🖍🖍🖍 = ?',${NL}${tb}v: {type:'twoGroups', config:{leftCount:10, leftObj:'🖍', rightCount:3, rightObj:'🖍', op:'subtract'}},`
  ],
];

let applied = 0;
let missed  = 0;
for (const [oldStr, newStr] of REPS) {
  if (src.includes(oldStr)) {
    src = src.replace(oldStr, newStr);
    applied++;
  } else {
    console.warn('NOT FOUND:', JSON.stringify(oldStr.slice(0, 120)));
    missed++;
  }
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`Done. Applied ${applied} / ${REPS.length} replacements. Missed: ${missed}`);
