// Auto-converted from src/data/u3.js
// Regenerate with: node scripts/convert-unit-data.js 3
// Do NOT edit manually — edit the source in src/data/u3.js then re-run.

import type { LessonContent, UnitQuiz, Question } from '$lib/core/types/content';

export const lessons: LessonContent[] = [
  {
    "points": [
      "Line up ones and tens",
      "Add ONES first, then tens",
      "If ones add to 10 or more, REGROUP (move 1 ten)"
    ],
    "examples": [
      {
        "c": "#e67e22",
        "tag": "No Regrouping",
        "p": "23 + 45 = ?",
        "s": "<table class=\"col-math\"><tr><td></td><td>2</td><td>3</td></tr><tr class=\"cm-bottom\"><td class=\"cm-op\">+</td><td>4</td><td>5</td></tr><tr class=\"cm-line\"><td colspan=\"3\"><hr></td></tr><tr class=\"cm-result\"><td></td><td>6</td><td>8</td></tr></table><br>Ones: 3 + 5 = 8<br>Tens: 2 + 4 = 6<br><br><button data-action=\"playCarryAnim\" data-arg=\"[2,3]\" data-arg2=\"[4,5]\" class=\"cca-btn\" style=\"background:#e67e22\">🎬 Watch Step by Step</button>",
        "a": "23 + 45 = 68 ✅"
      },
      {
        "c": "#e67e22",
        "tag": "With Regrouping",
        "p": "47 + 36 = ?",
        "s": "<table class=\"col-math\"><tr class=\"cm-regroup\"><td></td><td>1</td><td></td></tr><tr><td></td><td>4</td><td>7</td></tr><tr class=\"cm-bottom\"><td class=\"cm-op\">+</td><td>3</td><td>6</td></tr><tr class=\"cm-line\"><td colspan=\"3\"><hr></td></tr><tr class=\"cm-result\"><td></td><td>8</td><td>3</td></tr></table><br>Ones: 7 + 6 = 13 → write <b>3</b>, regroup <b>1</b> ten<br>Tens: 4 + 3 + 1(carried) = <b>8</b><br><br><button data-action=\"playCarryAnim\" class=\"cca-btn\" style=\"background:#e67e22\">🎬 Watch Step by Step</button>",
        "a": "47 + 36 = 83 ✅"
      },
      {
        "c": "#e67e22",
        "tag": "With Regrouping",
        "p": "58 + 27 = ?",
        "s": "<table class=\"col-math\"><tr class=\"cm-regroup\"><td></td><td>1</td><td></td></tr><tr><td></td><td>5</td><td>8</td></tr><tr class=\"cm-bottom\"><td class=\"cm-op\">+</td><td>2</td><td>7</td></tr><tr class=\"cm-line\"><td colspan=\"3\"><hr></td></tr><tr class=\"cm-result\"><td></td><td>8</td><td>5</td></tr></table><br>Ones: 8 + 7 = 15 → write <b>5</b>, regroup <b>1</b> ten<br>Tens: 5 + 2 + 1(carried) = <b>8</b><br><br><button data-action=\"playCarryAnim\" data-arg=\"[5,8]\" data-arg2=\"[2,7]\" class=\"cca-btn\" style=\"background:#e67e22\">🎬 Watch Step by Step</button>",
        "a": "58 + 27 = 85 ✅"
      }
    ],
    "practice": [
      {
        "q": "34 + 25 = ?",
        "a": "59",
        "h": "Ones: 4+5=9. Tens: 3+2=5. No regrouping!",
        "e": "You know addition helps find the total when groups join. That's why your answer is right! ➕"
      },
      {
        "q": "46 + 37 = ?",
        "a": "83",
        "h": "Ones: 6+7=13, write 3 regroup 1 ten. Tens: 4+3+1=8",
        "e": "You counted all the items to find the total. Your answer is correct! 🍎"
      },
      {
        "q": "55 + 28 = ?",
        "a": "83",
        "h": "Ones: 5+8=13, write 3 regroup 1 ten. Tens: 5+2+1=8",
        "e": "You counted all the items to find the total. Your answer is correct! 🍊"
      }
    ],
    "qBank": [
      {
        "t": "What is 34 + 25?",
        "o": [
          "42",
          "69",
          "59",
          "85"
        ],
        "a": 2,
        "e": "You added the ones (9) and tens (50) correctly. No regrouping was needed! The total is 59! 🎉",
        "d": "e"
      },
      {
        "t": "What is 47 + 36?",
        "o": [
          "83",
          "56",
          "93",
          "40"
        ],
        "a": 0,
        "e": "7 ones + 6 ones makes 13 ones. You regrouped 10 ones for 1 ten, leaving 3 ones. Then you added the tens. The total is 83! ✨",
        "d": "e"
      },
      {
        "t": "What is 58 + 27?",
        "o": [
          "70",
          "95",
          "50",
          "85"
        ],
        "a": 3,
        "e": "8 ones + 7 ones makes 15 ones. You regrouped 10 ones for 1 ten, leaving 5 ones. Then you added the tens. The total is 85! 👍",
        "d": "e"
      },
      {
        "t": "What is 39 + 45?",
        "o": [
          "64",
          "94",
          "84",
          "50"
        ],
        "a": 2,
        "e": "9 ones + 5 ones makes 14 ones. You regrouped 10 ones for 1 ten, leaving 4 ones. Then you added the tens. The total is 84! ✅",
        "d": "e"
      },
      {
        "t": "What is 62 + 79?",
        "o": [
          "141",
          "120",
          "151",
          "100"
        ],
        "a": 0,
        "e": "2 ones + 9 ones makes 11 ones. You regrouped 10 ones for 1 ten, leaving 1 one. Then you added all the tens and hundreds. The total is 141! 🚀",
        "d": "e"
      },
      {
        "t": "What is 55 + 38?",
        "o": [
          "40",
          "83",
          "93",
          "150"
        ],
        "a": 2,
        "e": "5 ones + 8 ones makes 13 ones. You regrouped 10 ones for 1 ten, leaving 3 ones. Then you added the tens. The total is 93! 🎉",
        "d": "e"
      },
      {
        "t": "What is 46 + 54?",
        "o": [
          "90",
          "100",
          "91",
          "101"
        ],
        "a": 1,
        "e": "6 ones + 4 ones makes 10 ones. You regrouped all 10 ones for 1 ten. This means you have 0 ones and a new ten. The total is 100! 💯",
        "d": "e"
      },
      {
        "t": "What is 73 + 19?",
        "o": [
          "92",
          "75",
          "102",
          "60"
        ],
        "a": 0,
        "e": "3 ones + 9 ones makes 12 ones. You regrouped 10 ones for 1 ten, leaving 2 ones. Then you added the tens. The total is 92! ✨",
        "d": "e"
      },
      {
        "t": "What is 28 + 65?",
        "o": [
          "50",
          "140",
          "93",
          "82"
        ],
        "a": 2,
        "e": "8 ones + 5 ones makes 13 ones. You regrouped 10 ones for 1 ten, leaving 3 ones. Then you added the tens. The total is 93! 👍",
        "d": "e"
      },
      {
        "t": "What is 57 + 34?",
        "o": [
          "71",
          "45",
          "130",
          "91"
        ],
        "a": 3,
        "e": "7 ones + 4 ones makes 11 ones. You regrouped 10 ones for 1 ten, leaving 1 one. Then you added the tens. The total is 91! ✅",
        "d": "e"
      },
      {
        "t": "What does REGROUP mean?",
        "o": [
          "Regroup 10 ones as 1 ten",
          "Start over",
          "Subtract instead",
          "Skip to next"
        ],
        "a": 0,
        "e": "You know regrouping means trading 10 ones for 1 ten. It helps us add bigger numbers easily! 🤝",
        "d": "e"
      },
      {
        "t": "What is 66 + 27?",
        "o": [
          "50",
          "93",
          "83",
          "145"
        ],
        "a": 1,
        "e": "6 ones + 7 ones makes 13 ones. You regrouped 10 ones for 1 ten, leaving 3 ones. Then you added the tens. The total is 93! 🎉",
        "d": "e"
      },
      {
        "t": "What is 45 + 48?",
        "o": [
          "78",
          "83",
          "140",
          "93"
        ],
        "a": 3,
        "e": "5 ones + 8 ones makes 13 ones. You regrouped 10 ones for 1 ten, leaving 3 ones. Then you added the tens. The total is 93! 👍",
        "d": "e"
      },
      {
        "t": "What is 83 + 9?",
        "o": [
          "80",
          "102",
          "92",
          "65"
        ],
        "a": 2,
        "e": "3 ones + 9 ones makes 12 ones. You regrouped 10 ones for 1 ten, leaving 2 ones. Then you added the tens. The total is 92! ✨",
        "d": "e"
      },
      {
        "t": "What is 37 + 46?",
        "o": [
          "56",
          "83",
          "93",
          "40"
        ],
        "a": 1,
        "e": "7 ones + 6 ones makes 13 ones. You regrouped 10 ones for 1 ten, leaving 3 ones. Then you added the tens. The total is 83! ✅",
        "d": "e"
      },
      {
        "t": "When do you regroup in addition?",
        "o": [
          "When ones column is 10+",
          "Always",
          "When tens column is 10+",
          "Never"
        ],
        "a": 0,
        "e": "You regroup when you have 10 or more ones. Trading 10 ones for 1 ten makes adding easier! Your answer is correct! 🧠",
        "d": "e"
      },
      {
        "t": "What is 54 + 37?",
        "o": [
          "80",
          "45",
          "140",
          "91"
        ],
        "a": 3,
        "e": "4 ones + 7 ones makes 11 ones. You regrouped 10 ones for 1 ten, leaving 1 one. Then you added the tens. The total is 91! 🎉",
        "d": "e"
      },
      {
        "t": "What is 68 + 25?",
        "o": [
          "78",
          "83",
          "93",
          "150"
        ],
        "a": 2,
        "e": "Add the ones: 8+5=13. That's 3 ones and 1 regrouped ten. Add the tens: 6+2+1=9 tens. So, 68+25=93! 🎉",
        "d": "e"
      },
      {
        "t": "What is 75 + 16?",
        "o": [
          "80",
          "55",
          "130",
          "91"
        ],
        "a": 3,
        "e": "Add the ones: 5+6=11. That's 1 one and 1 regrouped ten. Add the tens: 7+1+1=9 tens. So, 75+16=91! ✨",
        "d": "e"
      },
      {
        "t": "What is 49 + 44?",
        "o": [
          "77",
          "93",
          "83",
          "150"
        ],
        "a": 1,
        "e": "Add the ones: 9+4=13. That's 3 ones and 1 regrouped ten. Add the tens: 4+4+1=9 tens. So, 49+44=93! 💯",
        "d": "e"
      },
      {
        "t": "Which addition problem requires regrouping?",
        "o": [
          "31+24",
          "42+37",
          "56+38",
          "61+15"
        ],
        "a": 2,
        "e": "Add the ones: 6+8=14. That's 4 ones and 1 regrouped ten. Add the tens: 5+3+1=9 tens. So, 56+38=94! ✅",
        "d": "e"
      },
      {
        "t": "What is 86 + 7?",
        "o": [
          "79",
          "93",
          "83",
          "150"
        ],
        "a": 1,
        "e": "Add the ones: 6+7=13. That's 3 ones and 1 regrouped ten. Add the tens: 8+0+1=9 tens. So, 86+7=93! 🌟",
        "d": "e"
      },
      {
        "t": "What is 23 + 79?",
        "o": [
          "102",
          "92",
          "80",
          "60"
        ],
        "a": 0,
        "e": "Add the ones: 3+9=12. That's 2 ones and 1 regrouped ten. Add the tens: 2+7+1=10 tens. So, 23+79=102! 🚀",
        "d": "e"
      },
      {
        "t": "What is 64 + 27?",
        "o": [
          "80",
          "55",
          "91",
          "130"
        ],
        "a": 2,
        "e": "Add the ones: 4+7=11. That's 1 one and 1 regrouped ten. Add the tens: 6+2+1=9 tens. So, 64+27=91! 👍",
        "d": "e"
      },
      {
        "t": "What is 78 + 16?",
        "o": [
          "84",
          "60",
          "130",
          "94"
        ],
        "a": 3,
        "e": "Add the ones: 8+6=14. That's 4 ones and 1 regrouped ten. Add the tens: 7+1+1=9 tens. So, 78+16=94! ✨",
        "d": "e"
      },
      {
        "t": "What is 35 + 58?",
        "o": [
          "70",
          "93",
          "83",
          "140"
        ],
        "a": 1,
        "e": "Add the ones: 5+8=13. That's 3 ones and 1 regrouped ten. Add the tens: 3+5+1=9 tens. So, 35+58=93! ✅",
        "d": "m"
      },
      {
        "t": "Add ones first, then tens. In 47 + 36, what is 7 + 6?",
        "o": [
          "11",
          "12",
          "13",
          "14"
        ],
        "a": 2,
        "e": "7 ones + 6 ones = 13 ones. That's 1 ten and 3 ones! We regroup the 1 ten. So, 7+6=13! Good job! 👍",
        "d": "h"
      },
      {
        "t": "What is 94 + 7?",
        "o": [
          "101",
          "90",
          "111",
          "75"
        ],
        "a": 0,
        "e": "Add the ones: 4+7=11. That's 1 one and 1 regrouped ten. Add the tens: 9+0+1=10 tens. So, 94+7=101! 🌟",
        "d": "m"
      },
      {
        "t": "What is 26 + 37?",
        "o": [
          "50",
          "73",
          "40",
          "63"
        ],
        "a": 3,
        "e": "Add the ones: 6+7=13. That's 3 ones and 1 regrouped ten. Add the tens: 2+3+1=6 tens. So, 26+37=63! 🎉",
        "d": "e"
      },
      {
        "t": "What is 88 + 5?",
        "o": [
          "79",
          "93",
          "83",
          "150"
        ],
        "a": 1,
        "e": "Add the ones: 8+5=13. That's 3 ones and 1 regrouped ten. Add the tens: 8+0+1=9 tens. So, 88+5=93! 👍",
        "d": "m"
      },
      {
        "t": "What is 52 + 36?",
        "o": [
          "78",
          "88",
          "86",
          "98"
        ],
        "a": 1,
        "e": "Add the ones: 2+6=8. Add the tens: 50+30=80. Put them together: 80+8=88! You found 8 tens and 8 ones! 👏",
        "d": "m"
      },
      {
        "t": "What is 41 + 18?",
        "o": [
          "69",
          "59",
          "49",
          "58"
        ],
        "a": 1,
        "e": "Add the ones: 1+8=9. Add the tens: 40+10=50. Put them together: 50+9=59! You found 5 tens and 9 ones! ✅",
        "d": "e"
      },
      {
        "t": "What is 63 + 24?",
        "o": [
          "97",
          "77",
          "87",
          "89"
        ],
        "a": 2,
        "e": "Add the ones: 3+4=7. Add the tens: 60+20=80. Put them together: 80+7=87! You found 8 tens and 7 ones! 🌟",
        "d": "m"
      },
      {
        "t": "What is 70 + 45?",
        "o": [
          "105",
          "125",
          "115",
          "95"
        ],
        "a": 2,
        "e": "Add the ones: 0+5=5. Add the tens: 70+40=110. Put them together: 110+5=115! That's 11 tens and 5 ones! 🚀",
        "d": "m"
      },
      {
        "t": "What is 50 + 82?",
        "o": [
          "122",
          "132",
          "142",
          "112"
        ],
        "a": 1,
        "e": "Add the ones: 0+2=2. Add the tens: 50+80=130. Put them together: 130+2=132! That's 13 tens and 2 ones! 👍",
        "d": "m"
      },
      {
        "t": "What is 23 + 45?",
        "o": [
          "78",
          "68",
          "58",
          "88"
        ],
        "a": 1,
        "e": "Add the ones: 3+5=8. Add the tens: 20+40=60. Put them together: 60+8=68! You found 6 tens and 8 ones! ✨",
        "d": "e"
      },
      {
        "t": "What is 91 + 8?",
        "o": [
          "98",
          "89",
          "99",
          "100"
        ],
        "a": 2,
        "e": "Add the ones: 1+8=9. Add the tens: 90+0=90. Put them together: 90+9=99! You found 9 tens and 9 ones! 🎉",
        "d": "m"
      },
      {
        "t": "Leo has 35 marbles. He finds 14 more. How many marbles does Leo have now?",
        "o": [
          "59",
          "49",
          "39",
          "48"
        ],
        "a": 1,
        "e": "We add the ones (5+4=9) and the tens (30+10=40) separately. Then we put them together: 40 + 9 = 49! Great job! ✨",
        "d": "m"
      },
      {
        "t": "What is 60 + 31?",
        "o": [
          "81",
          "91",
          "71",
          "101"
        ],
        "a": 1,
        "e": "Add the ones (0+1=1) and the tens (60+30=90). Put your tens and ones together: 90 + 1 = 91! Super! 👍",
        "d": "m"
      },
      {
        "t": "What is 44 + 33?",
        "o": [
          "67",
          "87",
          "77",
          "78"
        ],
        "a": 2,
        "e": "Add the ones (4+3=7) and the tens (40+30=70). Putting them together gives you 70 + 7 = 77! You did it! ✅",
        "d": "e"
      },
      {
        "t": "A store has 72 red apples and 15 green apples. How many apples in all?",
        "o": [
          "97",
          "87",
          "77",
          "86"
        ],
        "a": 1,
        "e": "Add the ones (2+5=7) and the tens (70+10=80). Putting your tens and ones together makes 80 + 7 = 87! Super! 🌟",
        "d": "m"
      },
      {
        "t": "What is 80 + 16?",
        "o": [
          "86",
          "106",
          "96",
          "90"
        ],
        "a": 2,
        "e": "Add the ones (0+6=6) and the tens (80+10=90). Putting them together gives you 90 + 6 = 96! Awesome! 🎉",
        "d": "m"
      },
      {
        "t": "Which sum is greater: 42 + 31 or 50 + 20?",
        "o": [
          "42 + 31",
          "50 + 20",
          "They are the same",
          "Cannot tell"
        ],
        "a": 0,
        "e": "We found 42 + 31 = 73. And 50 + 20 = 70. Since 73 is more than 70, the first sum is greater! You compared them! 🧠",
        "d": "m"
      },
      {
        "t": "What is 55 + 34?",
        "o": [
          "79",
          "99",
          "89",
          "88"
        ],
        "a": 2,
        "e": "Add the ones (5+4=9) and the tens (50+30=80). Putting your tens and ones together makes 80 + 9 = 89! Good job! ✨",
        "d": "m"
      },
      {
        "t": "What is 27 + 51?",
        "o": [
          "78",
          "88",
          "68",
          "77"
        ],
        "a": 0,
        "e": "Add the ones (7+1=8) and the tens (20+50=70). Putting them together gives you 70 + 8 = 78! Way to go! 👍",
        "d": "m"
      },
      {
        "t": "There are 46 birds on a wire. 23 more land. How many birds are there now?",
        "o": [
          "59",
          "79",
          "69",
          "68"
        ],
        "a": 2,
        "e": "Add the ones (6+3=9) and the tens (40+20=60). Putting your tens and ones together makes 60 + 9 = 69! You're a math star! ⭐",
        "d": "m"
      },
      {
        "t": "What is 13 + 62?",
        "o": [
          "85",
          "65",
          "75",
          "74"
        ],
        "a": 2,
        "e": "Add the ones (3+2=5) and the tens (10+60=70). Putting them together gives you 70 + 5 = 75! Excellent! ✅",
        "d": "m"
      },
      {
        "t": "Which is the correct answer for 81 + 14?",
        "o": [
          "94",
          "85",
          "95",
          "96"
        ],
        "a": 2,
        "e": "Add the ones (1+4=5) and the tens (80+10=90). Putting your tens and ones together makes 90 + 5 = 95! You got it! 🎉",
        "d": "m"
      },
      {
        "t": "What is 30 + 64?",
        "o": [
          "84",
          "94",
          "104",
          "74"
        ],
        "a": 1,
        "e": "Add the ones (0+4=4) and the tens (30+60=90). Putting them together gives you 90 + 4 = 94! Smart thinking! 💡",
        "d": "m"
      },
      {
        "t": "47 + 35 = ? Use regrouping to solve.",
        "o": [
          "72",
          "82",
          "81",
          "92"
        ],
        "a": 1,
        "e": "Add ones: 7+5=12. That's 1 ten, 2 ones! Regroup the 1 ten to the tens place. Add tens: 4+3+1=8. The sum is 82! ✅",
        "d": "m"
      },
      {
        "t": "Maria has 45 stickers. She gets 28 more. How many stickers does Maria have now?",
        "o": [
          "63",
          "73",
          "83",
          "62"
        ],
        "a": 1,
        "e": "Add ones: 5+8=13. That's 1 ten, 3 ones! Regroup the 1 ten to the tens place. Add tens: 4+2+1=7. The sum is 73! 👍",
        "d": "m"
      },
      {
        "t": "Which problem needs regrouping? A) 34 + 25  B) 47 + 38  C) 51 + 23  D) 62 + 15",
        "o": [
          "34 + 25",
          "47 + 38",
          "51 + 23",
          "62 + 15"
        ],
        "a": 1,
        "e": "For 47 + 38, 7 + 8 = 15 ones. Since 15 is more than 9, we regroup 1 ten to the tens place! Other problems don't need it. ✨",
        "d": "h"
      },
      {
        "t": "__ + 36 = 73. What is the missing number?",
        "o": [
          "47",
          "37",
          "27",
          "43"
        ],
        "a": 1,
        "e": "To find the missing number, we subtract! 73 - 36 = 37. We can check by adding: 37 + 36 = 73. You found it! 🔍",
        "d": "h"
      },
      {
        "t": "58 + 67 = ?",
        "o": [
          "115",
          "135",
          "125",
          "105"
        ],
        "a": 2,
        "e": "Add ones: 8+7=15. Regroup 1 ten to the tens place. Add tens: 5+6+1=12. 12 tens and 5 ones make 125! Great job! 🎉",
        "d": "m"
      },
      {
        "t": "A box has 76 crayons. Another box has 49 crayons. How many crayons altogether?",
        "o": [
          "115",
          "135",
          "125",
          "145"
        ],
        "a": 2,
        "e": "Add ones: 6+9=15. Regroup 1 ten to the tens place. Add tens: 7+4+1=12. 12 tens and 5 ones make 125! You did it! ✅",
        "d": "h"
      },
      {
        "t": "__ + 55 = 112. What is the missing number?",
        "o": [
          "67",
          "47",
          "57",
          "77"
        ],
        "a": 2,
        "e": "To find the missing number, we subtract! 112 - 55 = 57. We can check by adding: 57 + 55 = 112. Great job! 💡",
        "d": "h"
      },
      {
        "t": "64 + 78 = ?",
        "o": [
          "132",
          "152",
          "142",
          "122"
        ],
        "a": 2,
        "e": "Add ones: 4+8=12. Regroup 1 ten to the tens place. Add tens: 6+7+1=14. 14 tens and 2 ones make 142! Super! 🌟",
        "d": "m"
      },
      {
        "t": "Which strategy helps solve 89 + 46?",
        "o": [
          "Count back from 89",
          "Break apart: 89 + 40 + 6",
          "Subtract 46 from 89",
          "Round 89 down to 80"
        ],
        "a": 1,
        "e": "We add 40 to 89 first, making 129. Then add the 6 ones. So, 89 + 46 = 135! Great job! 🤩",
        "d": "m"
      },
      {
        "t": "There are 53 kids on a bus. At the next stop, 39 more get on. How many kids are on the bus?",
        "o": [
          "82",
          "92",
          "102",
          "72"
        ],
        "a": 1,
        "e": "3 ones + 9 ones is 12 ones. Regroup 10 ones as 1 ten. Then add the tens: 5 + 3 + 1 = 9 tens. 53 + 39 = 92! ✨",
        "d": "m"
      },
      {
        "t": "Which answer is correct for 86 + 37?",
        "o": [
          "113",
          "133",
          "123",
          "103"
        ],
        "a": 2,
        "e": "6 ones + 7 ones is 13 ones. Regroup 10 ones as 1 ten. Then add the tens: 8 + 3 + 1 = 12 tens. 86 + 37 = 123! 👍",
        "d": "m"
      },
      {
        "t": "29 + __ = 81. What is the missing number?",
        "o": [
          "62",
          "52",
          "42",
          "58"
        ],
        "a": 1,
        "e": "To find the missing part, we subtract! 81 - 29 = 52. We can check by adding 29 + 52 = 81. The missing number is 52! ✅",
        "d": "h"
      },
      {
        "t": "Which problem does NOT need regrouping? A) 56 + 27  B) 43 + 52  C) 68 + 45  D) 79 + 14",
        "o": [
          "56 + 27",
          "43 + 52",
          "68 + 45",
          "79 + 14"
        ],
        "a": 1,
        "e": "For 43 + 52, 3 ones + 2 ones = 5 ones. No regrouping needed for the ones! Then add the tens. So, 43 + 52 = 95! 🥳",
        "d": "h"
      },
      {
        "t": "A farm has 67 chickens and 85 ducks. How many birds does the farm have?",
        "o": [
          "142",
          "162",
          "152",
          "132"
        ],
        "a": 2,
        "e": "7 ones + 5 ones is 12 ones. Regroup 10 ones as 1 ten. Then add the tens: 6 + 8 + 1 = 15 tens. 67 + 85 = 152! ⭐",
        "d": "h"
      },
      {
        "t": "73 + 48 = ?",
        "o": [
          "111",
          "131",
          "121",
          "101"
        ],
        "a": 2,
        "e": "3 ones + 8 ones is 11 ones. Regroup 10 ones as 1 ten. Then add the tens: 7 + 4 + 1 = 12 tens. 73 + 48 = 121! 😄",
        "d": "m"
      },
      {
        "t": "Jada had some stickers. She got 44 more and now has 91. How many did she start with?",
        "o": [
          "57",
          "47",
          "37",
          "53"
        ],
        "a": 1,
        "e": "Jada had 91 stickers after getting 44 more. To find what she started with, subtract 91 - 44 = 47. She started with 47 stickers! 👏",
        "d": "h"
      },
      {
        "t": "55 + 86 = ?",
        "o": [
          "131",
          "151",
          "141",
          "121"
        ],
        "a": 2,
        "e": "5 ones + 6 ones is 11 ones. Regroup 10 ones as 1 ten. Then add the tens: 5 + 8 + 1 = 14 tens. 55 + 86 = 141! 💯",
        "d": "m"
      },
      {
        "t": "Which is greater: 65 + 48 or 59 + 57?",
        "o": [
          "65 + 48",
          "59 + 57",
          "They are equal",
          "Cannot tell"
        ],
        "a": 1,
        "e": "First, 65 + 48 = 113. Then, 59 + 57 = 116. Since 116 is more than 113, 59 + 57 is greater! Good comparing! 👍",
        "d": "m"
      },
      {
        "t": "A library has 94 fiction books and 68 nonfiction books. How many books in all?",
        "o": [
          "152",
          "172",
          "162",
          "142"
        ],
        "a": 2,
        "e": "4 ones + 8 ones is 12 ones. Regroup 10 ones as 1 ten. Then add the tens: 9 + 6 + 1 = 16 tens. 94 + 68 = 162! 🧠",
        "d": "h"
      },
      {
        "t": "38 + 95 = ?",
        "o": [
          "123",
          "143",
          "133",
          "113"
        ],
        "a": 2,
        "e": "8 ones + 5 ones is 13 ones. Regroup 10 ones as 1 ten. Then add the tens: 3 + 9 + 1 = 13 tens. 38 + 95 = 133! ✨",
        "d": "m"
      },
      {
        "t": "Tom has 85 baseball cards. He gets 27 more from Kim and 15 more from Dad. How many cards does he have now?",
        "o": [
          "141",
          "115",
          "127",
          "100"
        ],
        "a": 2,
        "e": "85 + 27 = 112, then 112 + 15 = 127. Adding in two steps is a great strategy! The answer is 127! 🎉",
        "d": "h"
      },
      {
        "t": "A student solved 63 + 29 = 82. What mistake did the student make?",
        "o": [
          "Added the tens wrong",
          "Forgot to regroup",
          "Added the ones wrong",
          "No mistake, 82 is correct"
        ],
        "a": 1,
        "e": "For 63 + 29, 3 ones + 9 ones = 12 ones. We must regroup 10 ones as 1 ten! Then add the tens. The answer is 92. Remember to regroup! ✏️",
        "d": "h"
      },
      {
        "t": "__ + 67 = 143. What is the missing number?",
        "o": [
          "86",
          "66",
          "76",
          "96"
        ],
        "a": 2,
        "e": "To find the missing part, we subtract! 143 - 67 = 76. We can check by adding 76 + 67 = 143. The missing number is 76! 👍",
        "d": "h"
      },
      {
        "t": "Mia added 78 + 56 and got 124. Is she correct? What should the answer be?",
        "o": [
          "Yes, 124 is correct",
          "No, it should be 134",
          "No, it should be 144",
          "No, it should be 114"
        ],
        "a": 1,
        "e": "For 78 + 56, 8 ones + 6 ones = 14 ones. We must regroup 10 ones as 1 ten! Mia forgot this step. The answer is 134! 🧐",
        "d": "h"
      },
      {
        "t": "Sam needs to buy items costing 67 cents and 54 cents. He has 110 cents. Does he have enough? How do you know?",
        "o": [
          "Yes, because 67 + 54 = 121 and 121 < 110",
          "No, because 67 + 54 = 121 and 121 > 110",
          "Yes, because 67 + 54 = 111 and 111 > 110",
          "No, because 67 + 54 = 131 and 131 > 110"
        ],
        "a": 1,
        "e": "First, add 67 + 54 = 121. Sam needs $121. Since 121 is more than $110, Sam does not have enough money. Good comparing! 💰",
        "d": "h"
      },
      {
        "t": "A student wrote 95 + 48 = 133. Check the work. Is the answer correct?",
        "o": [
          "No, the answer is 143",
          "Yes, 133 is correct",
          "No, the answer is 153",
          "No, the answer is 123"
        ],
        "a": 0,
        "e": "For 95 + 48, 5 ones + 8 ones = 13 ones. Regroup 10 ones as 1 ten! Then add the tens: 9 + 4 + 1 = 14 tens. The answer is 143! 👀",
        "d": "h"
      },
      {
        "t": "Rosa had 58 stickers. She gets 35 more on Monday and 27 more on Tuesday. How many stickers does she have now?",
        "o": [
          "110",
          "93",
          "120",
          "105"
        ],
        "a": 2,
        "e": "58 + 35 = 93, then 93 + 27 = 120. Rosa gets stickers on two days and we add them all together! The answer is 120! ✨",
        "d": "h"
      },
      {
        "t": "__ + 38 = 117. What is the missing number?",
        "o": [
          "69",
          "79",
          "89",
          "99"
        ],
        "a": 1,
        "e": "Think: what + 38 = 117? Try 79 + 38: 9 + 8 = 17, regroup! 7 + 3 + 1 = 11. So 79 + 38 = 117. The missing number is 79! ➕",
        "d": "h"
      },
      {
        "t": "Which problem will give an answer greater than 150? A) 88 + 59  B) 72 + 65  C) 91 + 63  D) 80 + 68",
        "o": [
          "88 + 59",
          "72 + 65",
          "91 + 63",
          "80 + 68"
        ],
        "a": 2,
        "e": "91 + 63 = 154. This sum is bigger than 150! You found the largest sum. Great job! 👍",
        "d": "h"
      },
      {
        "t": "Jake had 74 toy cars. He bought 38 more on Monday and 29 more on Tuesday. How many toy cars does he have now?",
        "o": [
          "131",
          "151",
          "141",
          "121"
        ],
        "a": 2,
        "e": "Jake started with 74+38=112 cars. Then he added 29 more! So, 112+29=141 cars in total. 🚗",
        "d": "h"
      },
      {
        "t": "A student solved 86 + 47 = 123. Find the error.",
        "o": [
          "No error, 123 is correct",
          "The student forgot to regroup the ones",
          "The student added the tens incorrectly",
          "The student added the ones incorrectly"
        ],
        "a": 2,
        "e": "We add 6+7=13 ones, so we regroup 1 ten. Then 8+4+1=13 tens. The sum is 133! Good regrouping! ✅",
        "d": "h"
      },
      {
        "t": "Ella has 65 beads. Kai has 48 beads. They want to combine their beads. Do they have more or fewer than 120?",
        "o": [
          "More, because 65 + 48 = 123",
          "Fewer, because 65 + 48 = 113",
          "Exactly 120",
          "More, because 65 + 48 = 133"
        ],
        "a": 1,
        "e": "65 + 48 = 113. We regrouped 1 ten from 13 ones. Yes, 113 is less than 120! Super adding! 💯",
        "d": "h"
      },
      {
        "t": "__ + 89 = 165. What is the missing number?",
        "o": [
          "86",
          "66",
          "76",
          "96"
        ],
        "a": 2,
        "e": "To find the missing number, we subtract! 165 - 89 = 76. So, 76 + 89 = 165. The missing number is 76! 💡",
        "d": "h"
      },
      {
        "t": "A class collected 97 cans in Week 1 and 86 cans in Week 2. How many cans did they collect in all?",
        "o": [
          "173",
          "183",
          "193",
          "163"
        ],
        "a": 1,
        "e": "7 + 6 = 13 ones, regroup! 9 + 8 + 1 = 18 tens. 97 + 86 = 183. Great adding! 🧫",
        "d": "h"
      },
      {
        "t": "Which addition strategy works best for 99 + 67? Why?",
        "o": [
          "Break apart 67 into 60 + 7",
          "Make a friendly number: 100 + 66",
          "Count up from 99 by ones",
          "Subtract 67 from 99"
        ],
        "a": 1,
        "e": "99 is almost 100! Take 1 from 67 to make 100 + 66 = 166. Friendly numbers make adding easy! ➕",
        "d": "m"
      },
      {
        "t": "A student says 57 + 86 = 133. Another says it is 143. Who is correct?",
        "o": [
          "The first student (133)",
          "The second student (143)",
          "Neither, it is 153",
          "Neither, it is 123"
        ],
        "a": 1,
        "e": "When we add 57 + 86, we regroup 1 ten from 13 ones. Then 5+8+1=14 tens. The sum is 143! ✅",
        "d": "h"
      },
      {
        "t": "Ava scored 78 points in Game 1 and 64 in Game 2. Ben scored 86 in Game 1 and 53 in Game 2. Who scored more total points?",
        "o": [
          "Ava, with 142 points",
          "Ben, with 142 points",
          "They tied with 142 points",
          "Ben, with 139 points"
        ],
        "a": 0,
        "e": "Ava scored 78+64=142 points. Ben scored 86+53=139 points. Ava scored more! Great comparing! 🎉",
        "d": "h"
      },
      {
        "t": "__ + __ = 130, and both numbers are between 50 and 90. Which pair works?",
        "o": [
          "45 and 85",
          "62 and 68",
          "91 and 39",
          "75 and 65"
        ],
        "a": 1,
        "e": "We need two numbers between 50 and 90 that add to 130. 62 + 68 = 130! You found them! 👍",
        "d": "h"
      },
      {
        "t": "Liam added 69 + 74 and got 133. Is he right? If not, what is the correct answer?",
        "o": [
          "Yes, 133 is correct",
          "No, it should be 143",
          "No, it should be 153",
          "No, it should be 123"
        ],
        "a": 1,
        "e": "For 69 + 74, we regroup 1 ten from 13 ones. Then 6+7+1=14 tens. The sum is 143! Good job! ✨",
        "d": "h"
      },
      {
        "t": "There are 88 red balloons and 76 blue balloons at the party. How many balloons are there in all?",
        "o": [
          "154",
          "174",
          "164",
          "144"
        ],
        "a": 2,
        "e": "8 + 6 = 14 ones, regroup! 8 + 7 + 1 = 16 tens. 88 + 76 = 164 balloons at the party! 🎈",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "What is 47 + 36?",
        "o": [
          "56",
          "83",
          "93",
          "40"
        ],
        "a": 1,
        "e": "We add 7+6=13 ones, so we regroup 1 ten. Then 4+3+1=8 tens. The sum is 83! You did it! ✏️"
      },
      {
        "t": "What is 58 + 27?",
        "o": [
          "70",
          "85",
          "95",
          "50"
        ],
        "a": 1,
        "e": "We add 8+7=15 ones, so we regroup 1 ten. Then 5+2+1=8 tens. The sum is 85! Super adding! 👍"
      },
      {
        "t": "What is 39 + 45?",
        "o": [
          "64",
          "84",
          "94",
          "50"
        ],
        "a": 1,
        "e": "We add 9+5=14 ones, so we regroup 1 ten. Then 3+4+1=8 tens. The sum is 84! Great work! ⭐"
      },
      {
        "t": "What does REGROUP mean in addition?",
        "o": [
          "Start over",
          "Regroup 1 ten when ones reach 10+",
          "Subtract instead",
          "Skip ones"
        ],
        "a": 1,
        "e": "Regrouping means changing 10 ones into 1 ten. We do this when we have more than 9 ones! Smart! 🧠"
      },
      {
        "t": "What is 35 + 48?",
        "o": [
          "56",
          "83",
          "93",
          "40"
        ],
        "a": 1,
        "e": "We add 5+8=13 ones, so we regroup 1 ten. Then 3+4+1=8 tens. The sum is 83! Math star! ⭐"
      },
      {
        "t": "What is 62 + 79?",
        "o": [
          "120",
          "141",
          "151",
          "100"
        ],
        "a": 1,
        "e": "We add 2+9=11 ones, so we regroup 1 ten. Then 6+7+1=14 tens. The sum is 141! Fantastic! 👏"
      }
    ]
  },
  {
    "points": [
      "Subtract ONES first, then tens",
      "If the top ones digit is too small, REGROUP 1 ten from the tens column",
      "Regrouping: cross out tens digit, subtract 1, add 10 to ones"
    ],
    "examples": [
      {
        "c": "#e67e22",
        "tag": "No Regrouping",
        "p": "58 − 34 = ?",
        "s": "<table class=\"col-math\"><tr><td></td><td>5</td><td>8</td></tr><tr class=\"cm-bottom\"><td class=\"cm-op\">−</td><td>3</td><td>4</td></tr><tr class=\"cm-line\"><td colspan=\"3\"><hr></td></tr><tr class=\"cm-result\"><td></td><td>2</td><td>4</td></tr></table><br>Ones: 8 − 4 = 4<br>Tens: 5 − 3 = 2",
        "a": "58 − 34 = 24 ✅"
      },
      {
        "c": "#e67e22",
        "tag": "With Regrouping",
        "p": "73 − 28 = ?",
        "s": "<table class=\"col-math\"><tr class=\"cm-regroup\"><td></td><td>6</td><td>13</td></tr><tr><td></td><td>7</td><td>3</td></tr><tr class=\"cm-bottom\"><td class=\"cm-op\">−</td><td>2</td><td>8</td></tr><tr class=\"cm-line\"><td colspan=\"3\"><hr></td></tr><tr class=\"cm-result\"><td></td><td>4</td><td>5</td></tr></table><br>Ones: 3 &lt; 8, regroup 1 ten → <b>13</b> − 8 = <b>5</b><br>Tens: 7 becomes 6 → 6 − 2 = <b>4</b><br><br><button data-action=\"playBorrowAnim\" class=\"cca-btn\" style=\"background:#e67e22\">🎬 Watch Step by Step</button>",
        "a": "73 − 28 = 45 ✅"
      },
      {
        "c": "#e67e22",
        "tag": "With Regrouping",
        "p": "91 − 47 = ?",
        "s": "<table class=\"col-math\"><tr class=\"cm-regroup\"><td></td><td>8</td><td>11</td></tr><tr><td></td><td>9</td><td>1</td></tr><tr class=\"cm-bottom\"><td class=\"cm-op\">−</td><td>4</td><td>7</td></tr><tr class=\"cm-line\"><td colspan=\"3\"><hr></td></tr><tr class=\"cm-result\"><td></td><td>4</td><td>4</td></tr></table><br>Ones: 1 &lt; 7, regroup 1 ten → <b>11</b> − 7 = <b>4</b><br>Tens: 9 becomes 8 → 8 − 4 = <b>4</b>",
        "a": "91 − 47 = 44 ✅"
      }
    ],
    "practice": [
      {
        "q": "67 - 23 = ?",
        "a": "44",
        "h": "Ones: 7-3=4. Tens: 6-2=4. No regrouping needed!",
        "e": "The minus sign means to subtract! We take away one number from another to find the difference. ➖"
      },
      {
        "q": "82 - 45 = ?",
        "a": "37",
        "h": "Ones: 2<5, regroup! 12-5=7. Tens: 7-4=3",
        "e": "This is a word problem! Read carefully to know if you add or subtract. You can do it! 🍎"
      },
      {
        "q": "74 - 36 = ?",
        "a": "38",
        "h": "Ones: 4<6, regroup! 14-6=8. Tens: 6-3=3",
        "e": "Great job! You understood the math perfectly. Keep up the amazing work! 🌟"
      }
    ],
    "qBank": [
      {
        "t": "What is 73 − 28?",
        "o": [
          "45",
          "30",
          "55",
          "10"
        ],
        "a": 0,
        "e": "You regrouped because 3 ones is less than 8 ones. This helped you subtract to get 45! 👍",
        "d": "e"
      },
      {
        "t": "What is 91 − 47?",
        "o": [
          "44",
          "54",
          "30",
          "80"
        ],
        "a": 0,
        "e": "You regrouped because 1 one is less than 7 ones. This helped you subtract correctly to get 44! ✅",
        "d": "e"
      },
      {
        "t": "What is 84 − 37?",
        "o": [
          "47",
          "57",
          "20",
          "90"
        ],
        "a": 0,
        "e": "You regrouped because 4 ones is less than 7 ones. That helped you subtract to find 47! ✨",
        "d": "e"
      },
      {
        "t": "What is 62 − 45?",
        "o": [
          "17",
          "30",
          "27",
          "5"
        ],
        "a": 0,
        "e": "You regrouped because 2 ones is less than 5 ones. That helped you subtract to find 17! 🚀",
        "d": "e"
      },
      {
        "t": "What is 50 − 23?",
        "o": [
          "27",
          "37",
          "10",
          "60"
        ],
        "a": 0,
        "e": "You regrouped because 0 ones is less than 3 ones. That helped you subtract to find 27! 💯",
        "d": "e"
      },
      {
        "t": "What is 76 − 39?",
        "o": [
          "37",
          "47",
          "20",
          "80"
        ],
        "a": 0,
        "e": "You regrouped because 6 ones is less than 9 ones. That helped you subtract to find 37! 🎉",
        "d": "e"
      },
      {
        "t": "What is 83 − 56?",
        "o": [
          "27",
          "37",
          "10",
          "60"
        ],
        "a": 0,
        "e": "You regrouped because 3 ones is less than 6 ones. That helped you subtract to find 27! 🌟",
        "d": "e"
      },
      {
        "t": "What is 95 − 48?",
        "o": [
          "57",
          "20",
          "47",
          "90"
        ],
        "a": 2,
        "e": "You regrouped because 5 ones is less than 8 ones. That helped you subtract to find 47! 👍",
        "d": "e"
      },
      {
        "t": "What is 64 − 28?",
        "o": [
          "46",
          "10",
          "36",
          "70"
        ],
        "a": 2,
        "e": "You regrouped because 4 ones is less than 8 ones. That helped you subtract to find 36! ✅",
        "d": "e"
      },
      {
        "t": "What is 71 − 35?",
        "o": [
          "46",
          "10",
          "36",
          "70"
        ],
        "a": 2,
        "e": "You regrouped because 1 one is less than 5 ones. That helped you subtract to find 36! ✨",
        "d": "e"
      },
      {
        "t": "When do you REGROUP in subtraction?",
        "o": [
          "Always",
          "When numbers are large",
          "When top ones digit is smaller",
          "Never"
        ],
        "a": 2,
        "e": "That's right! You regroup when the top ones digit is smaller. This helps you subtract! Keep it up! 💡",
        "d": "e"
      },
      {
        "t": "What is 85 − 47?",
        "o": [
          "48",
          "20",
          "38",
          "70"
        ],
        "a": 2,
        "e": "You regrouped because 5 ones is less than 7 ones. That helped you subtract to find 38! 🚀",
        "d": "e"
      },
      {
        "t": "What is 52 − 27?",
        "o": [
          "35",
          "10",
          "25",
          "60"
        ],
        "a": 2,
        "e": "You regrouped because 2 ones is less than 7 ones. That helped you subtract to find 25! 💯",
        "d": "e"
      },
      {
        "t": "What is 90 − 34?",
        "o": [
          "66",
          "20",
          "56",
          "100"
        ],
        "a": 2,
        "e": "You regrouped because 0 ones is less than 4 ones. That helped you subtract to find 56! 🎉",
        "d": "e"
      },
      {
        "t": "What is 67 − 29?",
        "o": [
          "48",
          "20",
          "80",
          "38"
        ],
        "a": 3,
        "e": "You regrouped because 7 ones is less than 9 ones. That helped you subtract to find 38! 🌟",
        "d": "m"
      },
      {
        "t": "Which subtraction problem requires regrouping (regrouping)?",
        "o": [
          "75-32",
          "84-21",
          "63-47",
          "51-20"
        ],
        "a": 2,
        "e": "Yes! For 63-47, you regrouped because 3 ones is less than 7 ones. The answer is 16! Great job! 👍",
        "d": "e"
      },
      {
        "t": "What is 78 − 53?",
        "o": [
          "35",
          "10",
          "60",
          "25"
        ],
        "a": 3,
        "e": "No regrouping needed! The top ones digit was bigger, so you could subtract easily to get 25! ✅",
        "d": "m"
      },
      {
        "t": "What is 86 − 58?",
        "o": [
          "38",
          "10",
          "60",
          "28"
        ],
        "a": 3,
        "e": "You regrouped because 6 ones is less than 8 ones. That helped you subtract to find 28! ✨",
        "d": "m"
      },
      {
        "t": "What is 74 − 36?",
        "o": [
          "48",
          "20",
          "80",
          "38"
        ],
        "a": 3,
        "e": "You regrouped because 4 ones is less than 6 ones. That helped you subtract to find 38! 🚀",
        "d": "m"
      },
      {
        "t": "What is 93 − 67?",
        "o": [
          "36",
          "10",
          "60",
          "26"
        ],
        "a": 3,
        "e": "We need more ones! Regroup a ten to make 13 ones. 13-7=6. Then 7 tens - 5 tens = 2 tens. The answer is 26! 🎉",
        "d": "m"
      },
      {
        "t": "What is 60 − 42?",
        "o": [
          "28",
          "5",
          "50",
          "18"
        ],
        "a": 3,
        "e": "We need more ones! Regroup a ten to make 10 ones. 10-2=8. Then 5 tens - 4 tens = 1 ten. The answer is 18! ✨",
        "d": "m"
      },
      {
        "t": "What is 55 − 28?",
        "o": [
          "37",
          "10",
          "60",
          "27"
        ],
        "a": 3,
        "e": "We need more ones! Regroup a ten to make 15 ones. 15-8=7. Then 4 tens - 2 tens = 2 tens. The answer is 27! 👍",
        "d": "m"
      },
      {
        "t": "What is 81 − 44?",
        "o": [
          "47",
          "10",
          "70",
          "37"
        ],
        "a": 3,
        "e": "We need more ones! Regroup a ten to make 11 ones. 11-4=7. Then 7 tens - 4 tens = 3 tens. The answer is 37! 🚀",
        "d": "m"
      },
      {
        "t": "What is 70 − 36?",
        "o": [
          "44",
          "34",
          "10",
          "60"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 10 ones. 10-6=4. Then 6 tens - 3 tens = 3 tens. The answer is 34! 🌟",
        "d": "m"
      },
      {
        "t": "What is 96 − 49?",
        "o": [
          "57",
          "47",
          "20",
          "90"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 16 ones. 16-9=7. Then 8 tens - 4 tens = 4 tens. The answer is 47! 🥳",
        "d": "m"
      },
      {
        "t": "What is 43 − 18?",
        "o": [
          "35",
          "25",
          "10",
          "60"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 13 ones. 13-8=5. Then 3 tens - 1 ten = 2 tens. The answer is 25! 🌈",
        "d": "e"
      },
      {
        "t": "What is 82 − 65?",
        "o": [
          "27",
          "17",
          "5",
          "50"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 12 ones. 12-5=7. Then 7 tens - 6 tens = 1 ten. The answer is 17! ✅",
        "d": "m"
      },
      {
        "t": "What is 77 − 38?",
        "o": [
          "49",
          "39",
          "20",
          "80"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 17 ones. 17-8=9. Then 6 tens - 3 tens = 3 tens. The answer is 39! 🤩",
        "d": "m"
      },
      {
        "t": "What is 61 − 27?",
        "o": [
          "44",
          "34",
          "10",
          "70"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 11 ones. 11-7=4. Then 5 tens - 2 tens = 3 tens. The answer is 34! 👏",
        "d": "m"
      },
      {
        "t": "What is 54 − 19?",
        "o": [
          "45",
          "35",
          "10",
          "65"
        ],
        "a": 1,
        "e": "We need more ones! Regroup a ten to make 14 ones. 14-9=5. Then 4 tens - 1 ten = 3 tens. The answer is 35! 💪",
        "d": "m"
      },
      {
        "t": "What is 58 - 23?",
        "o": [
          "45",
          "35",
          "25",
          "34"
        ],
        "a": 1,
        "e": "Subtract the ones: 8-3=5. Then subtract the tens: 5 tens - 2 tens = 3 tens. So, 30+5=35! ✨",
        "d": "e"
      },
      {
        "t": "What is 87 - 42?",
        "o": [
          "55",
          "45",
          "35",
          "44"
        ],
        "a": 1,
        "e": "Subtract the ones: 7-2=5. Then subtract the tens: 8 tens - 4 tens = 4 tens. So, 40+5=45! 👍",
        "d": "e"
      },
      {
        "t": "What is 96 - 31?",
        "o": [
          "55",
          "75",
          "65",
          "64"
        ],
        "a": 2,
        "e": "Subtract the ones: 6-1=5. Then subtract the tens: 9 tens - 3 tens = 6 tens. So, 60+5=65! 🎉",
        "d": "e"
      },
      {
        "t": "What is 74 - 50?",
        "o": [
          "34",
          "24",
          "14",
          "44"
        ],
        "a": 1,
        "e": "We subtract only tens! 7 tens - 5 tens = 2 tens. The ones stay the same (4). So, 20+4=24! ✅",
        "d": "e"
      },
      {
        "t": "A shelf has 69 books. 25 are taken. How many books are left?",
        "o": [
          "54",
          "44",
          "34",
          "43"
        ],
        "a": 1,
        "e": "Subtract the ones: 9-5=4. Then subtract the tens: 6 tens - 2 tens = 4 tens. So, 40+4=44! 🥳",
        "d": "m"
      },
      {
        "t": "What is 145 - 30?",
        "o": [
          "125",
          "115",
          "105",
          "135"
        ],
        "a": 1,
        "e": "We subtract only tens! 14 tens - 3 tens = 11 tens. The ones stay the same (5). So, 110+5=115! 🚀",
        "d": "e"
      },
      {
        "t": "What is 83 - 41?",
        "o": [
          "52",
          "42",
          "32",
          "43"
        ],
        "a": 1,
        "e": "Subtract the ones: 3-1=2. Then subtract the tens: 8 tens - 4 tens = 4 tens. So, 40+2=42! 🌟",
        "d": "e"
      },
      {
        "t": "What is 99 - 66?",
        "o": [
          "43",
          "33",
          "23",
          "32"
        ],
        "a": 1,
        "e": "Subtract the ones: 9-6=3. Then subtract the tens: 9 tens - 6 tens = 3 tens. So, 30+3=33! 🌈",
        "d": "e"
      },
      {
        "t": "There are 78 cookies. 34 are eaten. How many are left?",
        "o": [
          "54",
          "44",
          "34",
          "43"
        ],
        "a": 1,
        "e": "Subtract the ones: 8-4=4. Then subtract the tens: 7 tens - 3 tens = 4 tens. So, 40+4=44! ✅",
        "d": "m"
      },
      {
        "t": "What is 127 - 15?",
        "o": [
          "102",
          "122",
          "112",
          "132"
        ],
        "a": 2,
        "e": "We find the difference in the ones: 7-5=2. Then, the tens: 12-1=11. The answer is 112! ✨",
        "d": "e"
      },
      {
        "t": "What is 56 - 24?",
        "o": [
          "42",
          "32",
          "22",
          "31"
        ],
        "a": 1,
        "e": "First, find the difference in the ones: 6-4=2. Then, the tens: 5-2=3. So, 32 is correct! 👍",
        "d": "e"
      },
      {
        "t": "Which difference is greater: 89 - 43 or 75 - 31?",
        "o": [
          "89 - 43",
          "75 - 31",
          "They are the same",
          "Cannot tell"
        ],
        "a": 0,
        "e": "Find both differences! 89-43=46 and 75-31=44. Since 46 is more than 44, the first one is greater! ✅",
        "d": "m"
      },
      {
        "t": "What is 160 - 40?",
        "o": [
          "110",
          "130",
          "120",
          "140"
        ],
        "a": 2,
        "e": "There are no ones to subtract! Just take away the tens: 16 tens - 4 tens = 12 tens. So, 120 is right! 🎉",
        "d": "e"
      },
      {
        "t": "A jar has 48 candies. 16 are given away. How many candies are left?",
        "o": [
          "42",
          "32",
          "22",
          "31"
        ],
        "a": 1,
        "e": "Start with the ones: 8-6=2. Then subtract the tens: 4-1=3. So, 32 is the difference! Great job! ⭐",
        "d": "m"
      },
      {
        "t": "What is 95 - 63?",
        "o": [
          "42",
          "32",
          "22",
          "31"
        ],
        "a": 1,
        "e": "First, subtract the ones: 5-3=2. Then, subtract the tens: 9-6=3. So, 32 is the answer! You got it! 😄",
        "d": "e"
      },
      {
        "t": "Which is the correct answer for 138 - 26?",
        "o": [
          "102",
          "122",
          "112",
          "132"
        ],
        "a": 2,
        "e": "First, subtract the ones: 8-6=2. Then, subtract the tens: 13-2=11. So, 112 is the answer! Well done! 💯",
        "d": "m"
      },
      {
        "t": "What is 67 - 35?",
        "o": [
          "42",
          "32",
          "22",
          "31"
        ],
        "a": 1,
        "e": "Subtract the ones: 7-5=2. Then subtract the tens: 6-3=3. So, 32 is the answer! Super work! 👍",
        "d": "e"
      },
      {
        "t": "A park has 84 trees. 21 are cut down. How many trees are left?",
        "o": [
          "73",
          "63",
          "53",
          "62"
        ],
        "a": 1,
        "e": "Subtract the ones: 4-1=3. Then subtract the tens: 8-2=6. So, 63 is the answer! You're a math star! ⭐",
        "d": "m"
      },
      {
        "t": "What is 179 - 54?",
        "o": [
          "115",
          "135",
          "125",
          "145"
        ],
        "a": 2,
        "e": "Subtract the ones: 9-4=5. Then subtract the tens: 17-5=12. So, 125 is the answer! Fantastic! ✨",
        "d": "e"
      },
      {
        "t": "What is 46 - 13?",
        "o": [
          "43",
          "33",
          "23",
          "32"
        ],
        "a": 1,
        "e": "First, subtract the ones: 6-3=3. Then subtract the tens: 4-1=3. So, 33 is the answer! Good job! 😄",
        "d": "e"
      },
      {
        "t": "73 - 48 = ? Use regrouping to solve.",
        "o": [
          "35",
          "25",
          "15",
          "45"
        ],
        "a": 1,
        "e": "We can't subtract 8 from 3 ones. Regroup a ten to make 13 ones! 13-8=5. Then 6-4=2 tens. The answer is 25! ✅",
        "d": "m"
      },
      {
        "t": "Diego has 82 marbles. He gives 37 to his friend. How many does he have left?",
        "o": [
          "55",
          "45",
          "35",
          "54"
        ],
        "a": 1,
        "e": "We can't subtract 7 from 2 ones. Regroup a ten to make 12 ones! 12-7=5. Then 7-3=4 tens. The answer is 45! 👍",
        "d": "m"
      },
      {
        "t": "Which problem needs regrouping? A) 86 - 42  B) 65 - 38  C) 97 - 51  D) 74 - 23",
        "o": [
          "86 - 42",
          "65 - 38",
          "97 - 51",
          "74 - 23"
        ],
        "a": 1,
        "e": "For 65-38, we need more ones! 5 is less than 8, so we must regroup a ten. That's why! 💡",
        "d": "h"
      },
      {
        "t": "91 - __ = 56. What is the missing number?",
        "o": [
          "45",
          "35",
          "25",
          "33"
        ],
        "a": 1,
        "e": "To find the missing number, we subtract! 91-56=35. So, 35 is the answer! You found the missing part! 🧩",
        "d": "h"
      },
      {
        "t": "134 - 58 = ?",
        "o": [
          "86",
          "76",
          "66",
          "96"
        ],
        "a": 1,
        "e": "We can't subtract 8 from 4 ones. Regroup a ten to make 14 ones! 14-8=6. Then 12-5=7 tens. The answer is 76! ✨",
        "d": "m"
      },
      {
        "t": "A store had 120 apples. 47 were sold. How many are left?",
        "o": [
          "83",
          "73",
          "63",
          "77"
        ],
        "a": 1,
        "e": "We can't subtract 7 from 0 ones. Regroup a ten to make 10 ones! 10-7=3. Then 11-4=7 tens. The answer is 73! ✅",
        "d": "h"
      },
      {
        "t": "__ - 29 = 47. What is the missing number?",
        "o": [
          "66",
          "86",
          "76",
          "56"
        ],
        "a": 2,
        "e": "To find the missing number, we add! 47+29=76. So, 76 is the answer! You found the whole! ➕",
        "d": "m"
      },
      {
        "t": "Which strategy helps solve 100 - 63?",
        "o": [
          "Add up from 63 to 100",
          "Subtract 100 from 63",
          "Round 63 to 70 first",
          "Count back by ones"
        ],
        "a": 0,
        "e": "Count up from 63 to 100! 63+7=70, then 70+30=100. So, 7+30=37. The answer is 37! Great strategy! ⬆️",
        "d": "m"
      },
      {
        "t": "156 - 79 = ?",
        "o": [
          "87",
          "77",
          "67",
          "97"
        ],
        "a": 1,
        "e": "We can't subtract 9 from 6 ones. Regroup a ten to make 16 ones! 16-9=7. Then 14-7=7 tens. The answer is 77! ⭐",
        "d": "m"
      },
      {
        "t": "A bus has 95 passengers. At the first stop, 38 get off. How many are still on the bus?",
        "o": [
          "67",
          "57",
          "47",
          "63"
        ],
        "a": 1,
        "e": "We can't take 8 ones from 5! Regroup a ten to make 15 ones. 15-8=7. Then 8 tens - 3 tens = 5 tens. 95-38=57. Great! 👍",
        "d": "h"
      },
      {
        "t": "Which answer is correct for 143 - 67?",
        "o": [
          "86",
          "76",
          "66",
          "96"
        ],
        "a": 1,
        "e": "Not enough ones! Regroup a ten from 14 tens to make 13 ones. 13-7=6. Then 13 tens - 6 tens = 7 tens. 143-67=76. You got it! ✅",
        "d": "m"
      },
      {
        "t": "Which problem does NOT need regrouping? A) 52 - 37  B) 81 - 45  C) 96 - 52  D) 63 - 28",
        "o": [
          "52 - 37",
          "81 - 45",
          "96 - 52",
          "63 - 28"
        ],
        "a": 2,
        "e": "We have enough ones! Subtract ones: 6-2=4. Then subtract tens: 9-5=4. So, 96-52=44. Easy peasy! ✨",
        "d": "h"
      },
      {
        "t": "115 - __ = 68. What is the missing number?",
        "o": [
          "57",
          "47",
          "37",
          "53"
        ],
        "a": 1,
        "e": "To find the missing part, subtract the part you know from the whole. 115 - 68 = 47. The missing number is 47! 💡",
        "d": "h"
      },
      {
        "t": "A farmer had 162 eggs. 85 broke. How many eggs are left?",
        "o": [
          "87",
          "77",
          "67",
          "83"
        ],
        "a": 1,
        "e": "Not enough ones! Regroup a ten from 16 tens to make 12 ones. 12-5=7. Then 15 tens - 8 tens = 7 tens. 162-85=77. Awesome! 🌟",
        "d": "h"
      },
      {
        "t": "Which is greater: 130 - 56 or 115 - 48?",
        "o": [
          "130 - 56",
          "115 - 48",
          "They are equal",
          "Cannot tell"
        ],
        "a": 0,
        "e": "First, find the answer to 130-56, which is 74. Then find 115-48, which is 67. 74 is bigger than 67! 🤔",
        "d": "h"
      },
      {
        "t": "61 - 34 = ?",
        "o": [
          "37",
          "27",
          "17",
          "33"
        ],
        "a": 1,
        "e": "Not enough ones! Regroup a ten from 6 tens to make 11 ones. 11-4=7. Then 5 tens - 3 tens = 2 tens. 61-34=27. Way to go! 🚀",
        "d": "m"
      },
      {
        "t": "A school has 148 students. 59 go home early. How many remain?",
        "o": [
          "99",
          "89",
          "79",
          "91"
        ],
        "a": 1,
        "e": "Not enough ones! Regroup a ten from 14 tens to make 18 ones. 18-9=9. Then 13 tens - 5 tens = 8 tens. 148-59=89. Super! 🥳",
        "d": "h"
      },
      {
        "t": "__ - 45 = 88. What is the missing number?",
        "o": [
          "123",
          "143",
          "133",
          "113"
        ],
        "a": 2,
        "e": "To find the missing whole, add the two parts you know. 88 + 45 = 133. The missing number is 133! ✨",
        "d": "h"
      },
      {
        "t": "A piggy bank has 107 coins. 39 coins are spent. How many are left?",
        "o": [
          "78",
          "68",
          "58",
          "72"
        ],
        "a": 1,
        "e": "Not enough ones! Regroup a ten from 10 tens to make 17 ones. 17-9=8. Then 9 tens - 3 tens = 6 tens. 107-39=68. Fantastic! 💯",
        "d": "h"
      },
      {
        "t": "85 - 47 = ?",
        "o": [
          "48",
          "38",
          "28",
          "42"
        ],
        "a": 1,
        "e": "Not enough ones! Regroup a ten from 8 tens to make 15 ones. 15-7=8. Then 7 tens - 4 tens = 3 tens. 85-47=38. Keep it up! 💪",
        "d": "m"
      },
      {
        "t": "A student solved 132 - 57 = 85. What mistake did the student make?",
        "o": [
          "Subtracted the ones wrong",
          "Forgot to regroup",
          "Subtracted the tens wrong",
          "No mistake, 85 is correct"
        ],
        "a": 2,
        "e": "You regrouped ones well! But for tens, 12 tens - 5 tens = 7 tens, not 8. 132 - 57 = 75. Keep practicing! 😊",
        "d": "h"
      },
      {
        "t": "Nora had 145 stickers. She gave 58 to Ava and 39 to Ben. How many does she have left?",
        "o": [
          "58",
          "48",
          "38",
          "52"
        ],
        "a": 1,
        "e": "Nora started with 145. First, 145 - 58 = 87. Then, 87 - 39 = 48. Nora has 48 stickers left! 💖",
        "d": "h"
      },
      {
        "t": "__ - 67 = 89. What is the missing number?",
        "o": [
          "146",
          "166",
          "156",
          "136"
        ],
        "a": 2,
        "e": "To find the missing whole, add the two parts you know. 89 + 67 = 156. The missing number is 156! ➕",
        "d": "h"
      },
      {
        "t": "Leo subtracted 163 - 78 and got 95. Is he correct?",
        "o": [
          "Yes, 95 is correct",
          "No, it should be 85",
          "No, it should be 75",
          "No, it should be 105"
        ],
        "a": 1,
        "e": "You regrouped ones well! But for tens, 15 tens - 7 tens = 8 tens, not 9. 163 - 78 = 85. You'll get it! 👍",
        "d": "h"
      },
      {
        "t": "A school had 180 pencils. Monday they gave out 45. Tuesday they gave out 68. How many are left?",
        "o": [
          "77",
          "67",
          "57",
          "87"
        ],
        "a": 1,
        "e": "The school had 180 pencils. First, 180 - 45 = 135. Then, 135 - 68 = 67. They have 67 pencils left! ✏️",
        "d": "h"
      },
      {
        "t": "Which subtraction will give a result less than 50? A) 134 - 79  B) 121 - 68  C) 142 - 85  D) 113 - 69",
        "o": [
          "134 - 79",
          "121 - 68",
          "142 - 85",
          "113 - 69"
        ],
        "a": 3,
        "e": "Find each answer: A) 55, B) 53, C) 57, D) 44. Only 44 is smaller than 50! 🎉",
        "d": "h"
      },
      {
        "t": "A student wrote 150 - 73 = 87. Find the error.",
        "o": [
          "No error, 87 is correct",
          "Forgot to regroup the ones",
          "Subtracted the tens wrong",
          "Subtracted the ones wrong"
        ],
        "a": 2,
        "e": "You regrouped ones well! But for tens, 14 tens - 7 tens = 7 tens, not 8. 150 - 73 = 77. Keep trying! ⭐",
        "d": "h"
      },
      {
        "t": "__ - 86 = 57. What is the missing number?",
        "o": [
          "133",
          "153",
          "143",
          "123"
        ],
        "a": 2,
        "e": "To find the missing whole, add the two parts you know. 57 + 86 = 143. The missing number is 143! 🔢",
        "d": "h"
      },
      {
        "t": "Mia has 126 beads. She uses 48 for a bracelet and 35 for a necklace. How many beads are left?",
        "o": [
          "53",
          "43",
          "33",
          "47"
        ],
        "a": 1,
        "e": "Mia had 126 beads. First, 126 - 48 = 78. Then, 78 - 35 = 43. Mia has 43 beads left! 🎀",
        "d": "h"
      },
      {
        "t": "A store had 200 items. They sold 94 on Saturday and 67 on Sunday. How many items are left?",
        "o": [
          "49",
          "39",
          "29",
          "59"
        ],
        "a": 1,
        "e": "We start with 200. We take away 94, then take away 67 more. 39 items are still there! 📦",
        "d": "h"
      },
      {
        "t": "Sam says 141 - 65 = 86. Kai says it is 76. Who is correct?",
        "o": [
          "Sam (86)",
          "Kai (76)",
          "Neither, it is 66",
          "Neither, it is 96"
        ],
        "a": 1,
        "e": "When you can't take 5 from 1, you regroup a ten to make 11 ones. Then you subtract. Kai is correct, it's 76! 👍",
        "d": "h"
      },
      {
        "t": "Which subtraction strategy works best for 200 - 87?",
        "o": [
          "Count back by ones from 200",
          "Add up from 87 to 200",
          "Round 87 to 100 and adjust",
          "Subtract 200 - 80 - 7"
        ],
        "a": 1,
        "e": "To find the difference from 87 to 200, we count up! 87 + 13 = 100. Then 100 + 100 = 200. The total is 113! ➕",
        "d": "m"
      },
      {
        "t": "A library had 175 books. Some were checked out, leaving 98. Then 24 books were returned. How many are in the library now?",
        "o": [
          "112",
          "132",
          "122",
          "102"
        ],
        "a": 2,
        "e": "First, we find how many books stayed: 175 - 77 = 98. Then we add 24 new books. Now there are 122 books! 📚",
        "d": "h"
      },
      {
        "t": "__ - __ = 45, where the first number is between 100 and 150. Which pair works?",
        "o": [
          "130 and 85",
          "140 and 85",
          "120 and 85",
          "110 and 85"
        ],
        "a": 0,
        "e": "To find the number we started with, we add 85 and 45 together! 85 + 45 = 130. You found the right number! ✔️",
        "d": "h"
      },
      {
        "t": "A student solved 114 - 47 = 77. Check the work.",
        "o": [
          "Correct, 77 is right",
          "Wrong, it should be 67",
          "Wrong, it should be 57",
          "Wrong, it should be 87"
        ],
        "a": 1,
        "e": "When you can't take 7 from 4, you regroup a ten to make 14 ones. Then subtract. The answer is 67! 💡",
        "d": "h"
      },
      {
        "t": "Ella had 168 stickers. She gave away some and has 79 left. How many did she give away?",
        "o": [
          "99",
          "89",
          "79",
          "91"
        ],
        "a": 1,
        "e": "To find how many Ella gave away, we subtract! 168 - 79 = 89. You can check by adding. Great work! ✅",
        "d": "h"
      },
      {
        "t": "A farmer picks 156 apples. He sells 68 at the market and gives 49 to neighbors. How many does he keep?",
        "o": [
          "49",
          "39",
          "29",
          "43"
        ],
        "a": 1,
        "e": "We start with 156 apples. We take away 68, then take away 49 more. 39 apples are left! 🍎",
        "d": "h"
      },
      {
        "t": "There are 193 students. 87 go to lunch first. Of the remaining, 56 go next. How many are still waiting?",
        "o": [
          "60",
          "50",
          "40",
          "55"
        ],
        "a": 1,
        "e": "We start with 193. We take away 87, then take away 56 more. 50 are still waiting! ⏳",
        "d": "h"
      },
      {
        "t": "A student says 160 - 84 = 86. Another says it equals 76. Who is right?",
        "o": [
          "First student (86)",
          "Second student (76)",
          "Neither, it is 66",
          "Neither, it is 96"
        ],
        "a": 1,
        "e": "When you can't take 4 from 0, you regroup a ten to make 10 ones. Then subtract. The answer is 76! 🎉",
        "d": "h"
      },
      {
        "t": "__ - 95 = 78. What is the missing number?",
        "o": [
          "163",
          "183",
          "173",
          "153"
        ],
        "a": 2,
        "e": "To find the missing number, we add 78 and 95 together! 78 + 95 = 173. Remember to regroup! ➕",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "What is 73 − 28?",
        "o": [
          "30",
          "45",
          "55",
          "10"
        ],
        "a": 1,
        "e": "When you can't take 8 from 3, you regroup a ten to make 13 ones. Then subtract. The answer is 45! 👍"
      },
      {
        "t": "What is 91 − 47?",
        "o": [
          "54",
          "44",
          "30",
          "80"
        ],
        "a": 1,
        "e": "When you can't take 7 from 1, you regroup a ten to make 11 ones. Then subtract. The answer is 44! ✨"
      },
      {
        "t": "What is 84 − 37?",
        "o": [
          "57",
          "47",
          "20",
          "90"
        ],
        "a": 1,
        "e": "When you can't take 7 from 4, you regroup a ten to make 14 ones. Then subtract. The answer is 47! 💯"
      },
      {
        "t": "When do you REGROUP in subtraction?",
        "o": [
          "Always",
          "When top ones digit is too small",
          "When numbers are large",
          "Never"
        ],
        "a": 1,
        "e": "When the top ones digit is smaller, you regroup a ten to the ones place! This helps you subtract! 💪"
      },
      {
        "t": "What is 62 − 45?",
        "o": [
          "30",
          "17",
          "27",
          "5"
        ],
        "a": 1,
        "e": "When you can't take 5 from 2, you regroup a ten to make 12 ones. Then subtract. The answer is 17! ✅"
      },
      {
        "t": "What is 50 − 23?",
        "o": [
          "37",
          "27",
          "10",
          "60"
        ],
        "a": 1,
        "e": "When you can't take 3 from 0, you regroup a ten to make 10 ones. Then subtract. The answer is 27! 🌟"
      }
    ]
  },
  {
    "points": [
      "Look for DOUBLES or MAKE-A-TEN pairs first",
      "Add those two numbers, then add the third",
      "You can add in any order — pick the easiest!"
    ],
    "examples": [
      {
        "c": "#e67e22",
        "tag": "Make a Ten First",
        "p": "4 + 6 + 8 = ?",
        "s": "4+6=10 (make a ten!). Then 10+8=18.",
        "a": "4 + 6 + 8 = 18 ✅",
        "vis": "add3:🌟:4:6:8"
      },
      {
        "c": "#e67e22",
        "tag": "Doubles First",
        "p": "7 + 7 + 5 = ?",
        "s": "7+7=14 (doubles!). Then 14+5=19.",
        "a": "7 + 7 + 5 = 19 ✅",
        "vis": "add3:🍋:7:7:5"
      },
      {
        "c": "#e67e22",
        "tag": "Look for pairs",
        "p": "3 + 8 + 7 = ?",
        "s": "3+7=10 (make a ten!). Then 10+8=18.",
        "a": "3 + 8 + 7 = 18 ✅",
        "vis": "add3:🍊:3:8:7"
      }
    ],
    "practice": [
      {
        "q": "3 + 7 + 5 = ?",
        "a": "15",
        "h": "3+7=10 first (make a ten!), then 10+5=15",
        "e": "When you can't take 6 from 3, you regroup a ten to make 13 ones. Then subtract. The answer is 47! ✨"
      },
      {
        "q": "6 + 6 + 4 = ?",
        "a": "16",
        "h": "6+6=12 (doubles!), then 12+4=16",
        "e": "When you can't take 8 from 0, you regroup a ten to make 10 ones. Then subtract. The answer is 62! 💯"
      },
      {
        "q": "8 + 2 + 9 = ?",
        "a": "19",
        "h": "8+2=10 first (make a ten!), then 10+9=19",
        "e": "When you can't take 8 from 5, you regroup a ten to make 15 ones. Then subtract. The answer is 87! 🍊"
      }
    ],
    "qBank": [
      {
        "t": "What is 5 + 5 + 8?",
        "o": [
          "18",
          "11",
          "22",
          "25"
        ],
        "a": 0,
        "e": "We make a ten with 5 + 5. Adding 8 more to 10 is easy! 10 + 8 = 18. Great job! 👍",
        "d": "e"
      },
      {
        "t": "What is 4 + 6 + 9?",
        "o": [
          "12",
          "24",
          "27",
          "19"
        ],
        "a": 3,
        "e": "It's easy to add when you make a ten! 4 + 6 = 10. Then 10 + 9 = 19. You got it! ✨",
        "d": "e"
      },
      {
        "t": "What is 7 + 7 + 5?",
        "o": [
          "19",
          "12",
          "25",
          "27"
        ],
        "a": 0,
        "e": "Doubles help! 7 + 7 = 14. Then we add 5 more. 14 + 5 = 19. Super work! 🚀",
        "d": "e"
      },
      {
        "t": "What is 3 + 7 + 8?",
        "o": [
          "11",
          "23",
          "26",
          "18"
        ],
        "a": 3,
        "e": "Make a ten first! 3 + 7 = 10. Then adding 8 to 10 is 18. You're a math star! ⭐",
        "d": "e"
      },
      {
        "t": "What is 6 + 4 + 12?",
        "o": [
          "14",
          "22",
          "28",
          "31"
        ],
        "a": 1,
        "e": "Make a ten with 6 + 4 = 10. Adding 12 to 10 is simple! 10 + 12 = 22. Awesome thinking! 🧠",
        "d": "e"
      },
      {
        "t": "What is 8 + 2 + 7?",
        "o": [
          "17",
          "10",
          "22",
          "25"
        ],
        "a": 0,
        "e": "We make a ten with 8 + 2. Adding 7 more to 10 is easy! 10 + 7 = 17. Keep it up! 👏",
        "d": "e"
      },
      {
        "t": "What is 9 + 9 + 4?",
        "o": [
          "22",
          "14",
          "28",
          "31"
        ],
        "a": 0,
        "e": "Use doubles! 9 + 9 = 18. Then we add 4 more. 18 + 4 = 22. Fantastic! 🥳",
        "d": "e"
      },
      {
        "t": "What is 5 + 6 + 5?",
        "o": [
          "9",
          "16",
          "21",
          "24"
        ],
        "a": 1,
        "e": "Doubles are fun! 5 + 5 = 10. Adding 6 more to 10 is 16. You're so smart! 💡",
        "d": "e"
      },
      {
        "t": "What is 3 + 8 + 7?",
        "o": [
          "11",
          "23",
          "26",
          "18"
        ],
        "a": 3,
        "e": "Make a ten first! 3 + 7 = 10. Then adding 8 to 10 is 18. Super job! 🌟",
        "d": "e"
      },
      {
        "t": "What is 6 + 6 + 9?",
        "o": [
          "13",
          "21",
          "27",
          "30"
        ],
        "a": 1,
        "e": "Doubles help! 6 + 6 = 12. Then we add 9 more. 12 + 9 = 21. You're amazing! 🤩",
        "d": "e"
      },
      {
        "t": "What is 2 + 8 + 14?",
        "o": [
          "16",
          "24",
          "31",
          "38"
        ],
        "a": 1,
        "e": "Make a ten with 2 + 8 = 10. Adding 14 to 10 is simple! 10 + 14 = 24. Way to go! 🎉",
        "d": "e"
      },
      {
        "t": "What is 4 + 4 + 9?",
        "o": [
          "10",
          "17",
          "22",
          "25"
        ],
        "a": 1,
        "e": "Doubles are quick! 4 + 4 = 8. Then we add 9 more. 8 + 9 = 17. You're great! 👍",
        "d": "e"
      },
      {
        "t": "What is 7 + 3 + 15?",
        "o": [
          "15",
          "31",
          "34",
          "25"
        ],
        "a": 3,
        "e": "Make a ten with 7 + 3 = 10. Adding 15 to 10 is simple! 10 + 15 = 25. Keep up the good work! 💯",
        "d": "e"
      },
      {
        "t": "What is 8 + 8 + 6?",
        "o": [
          "13",
          "22",
          "27",
          "31"
        ],
        "a": 1,
        "e": "Doubles are helpful! 8 + 8 = 16. Then we add 6 more. 16 + 6 = 22. You're doing great! 😄",
        "d": "e"
      },
      {
        "t": "What is 5 + 5 + 12?",
        "o": [
          "13",
          "28",
          "22",
          "31"
        ],
        "a": 2,
        "e": "Doubles first! 5 + 5 = 10. Adding 12 to 10 is simple! 10 + 12 = 22. Good thinking! 🤔",
        "d": "e"
      },
      {
        "t": "In 2 + 9 + 8, which pair should you add first to make a ten?",
        "o": [
          "2+8",
          "2+9",
          "9+8",
          "9+2"
        ],
        "a": 0,
        "e": "We make a ten with 2 + 8. Knowing this math fact helps us add! 2 + 8 = 10. That's right! ➕",
        "d": "m"
      },
      {
        "t": "In 5 + 7 + 5, which pair should you add first?",
        "o": [
          "5+5",
          "5+7",
          "7+5",
          "7+7"
        ],
        "a": 0,
        "e": "Doubles make it easy! 5 + 5 = 10. Knowing your doubles helps you make a ten! 🖐️",
        "d": "m"
      },
      {
        "t": "What is 9 + 1 + 16?",
        "o": [
          "15",
          "31",
          "26",
          "34"
        ],
        "a": 2,
        "e": "Make a ten with 9 + 1 = 10. Adding 16 to 10 is simple! 10 + 16 = 26. You're a pro! 🏆",
        "d": "e"
      },
      {
        "t": "What is 6 + 4 + 18?",
        "o": [
          "17",
          "33",
          "36",
          "28"
        ],
        "a": 3,
        "e": "Make a ten first! 6 + 4 = 10. Adding 18 to 10 is simple! 10 + 18 = 28. Keep learning! 📚",
        "d": "e"
      },
      {
        "t": "What is 3 + 3 + 14?",
        "o": [
          "11",
          "20",
          "25",
          "29"
        ],
        "a": 1,
        "e": "Doubles are helpful! 3 + 3 = 6. Then we add 14 more. 6 + 14 = 20. Amazing! ✨",
        "d": "e"
      },
      {
        "t": "What is 7 + 7 + 9?",
        "o": [
          "13",
          "28",
          "32",
          "23"
        ],
        "a": 3,
        "e": "We know 7 + 7 = 14! Then we count on 9 more. 14 + 9 = 23. Great job! ✨",
        "d": "e"
      },
      {
        "t": "What is 4 + 6 + 7?",
        "o": [
          "9",
          "22",
          "25",
          "17"
        ],
        "a": 3,
        "e": "It's smart to make a ten! 4 + 6 = 10. Then add 7 more. 10 + 7 = 17. Super work! 👍",
        "d": "e"
      },
      {
        "t": "What is 8 + 2 + 9?",
        "o": [
          "11",
          "24",
          "19",
          "27"
        ],
        "a": 2,
        "e": "Make a ten first! 8 + 2 = 10. Adding 9 more makes 19. You're a math star! 🚀",
        "d": "e"
      },
      {
        "t": "What is 5 + 5 + 5?",
        "o": [
          "8",
          "20",
          "15",
          "23"
        ],
        "a": 2,
        "e": "Use a double! 5 + 5 = 10. Then add 5 more to get 15. You're so smart! ⭐",
        "d": "e"
      },
      {
        "t": "Is it true that you can add 3 numbers in any order?",
        "o": [
          "True",
          "False",
          "Sometimes",
          "Never"
        ],
        "a": 0,
        "e": "The order of numbers doesn't change the sum! You can add them in any order. The answer is the same! Awesome! ➕",
        "d": "e"
      },
      {
        "t": "What is 6 + 6 + 6?",
        "o": [
          "10",
          "23",
          "18",
          "26"
        ],
        "a": 2,
        "e": "Start with a double! 6 + 6 = 12. Then add 6 more. 12 + 6 = 18. Fantastic adding! 🎉",
        "d": "e"
      },
      {
        "t": "What is 3 + 9 + 7?",
        "o": [
          "11",
          "24",
          "19",
          "27"
        ],
        "a": 2,
        "e": "Make a ten first! 3 + 7 = 10. Adding 9 more makes 19. You're so smart! ��",
        "d": "e"
      },
      {
        "t": "What is 4 + 8 + 8?",
        "o": [
          "12",
          "25",
          "20",
          "29"
        ],
        "a": 2,
        "e": "Use a double! 8 + 8 = 16. Then add 4 more. 16 + 4 = 20. You did it! ✅",
        "d": "e"
      },
      {
        "t": "What is 1 + 9 + 18?",
        "o": [
          "17",
          "34",
          "28",
          "36"
        ],
        "a": 2,
        "e": "Make a ten first! 1 + 9 = 10. Then add 18 more. 10 + 18 = 28. Great work! 🌟",
        "d": "e"
      },
      {
        "t": "What is 5 + 8 + 5?",
        "o": [
          "10",
          "23",
          "18",
          "26"
        ],
        "a": 2,
        "e": "Use a double! 5 + 5 = 10. Then add 8 more. 10 + 8 = 18. Fantastic! ✨",
        "d": "e"
      },
      {
        "t": "What is 4 + 3 + 6?",
        "o": [
          "12",
          "13",
          "14",
          "11"
        ],
        "a": 1,
        "e": "Make a ten first! 4 + 6 = 10. Then add 3 more. 10 + 3 = 13. Smart thinking! 🧠",
        "d": "m"
      },
      {
        "t": "What is 5 + 5 + 7?",
        "o": [
          "15",
          "16",
          "17",
          "18"
        ],
        "a": 2,
        "e": "Start with a double! 5 + 5 = 10. Then add 7 more. 10 + 7 = 17. You're a pro! 🏆",
        "d": "m"
      },
      {
        "t": "What is 20 + 30 + 10?",
        "o": [
          "50",
          "60",
          "70",
          "40"
        ],
        "a": 1,
        "e": "Add the tens together! 20 + 30 = 50. Then add 10 more. 50 + 10 = 60. Wonderful! 💯",
        "d": "m"
      },
      {
        "t": "What is 6 + 4 + 5?",
        "o": [
          "14",
          "15",
          "16",
          "13"
        ],
        "a": 1,
        "e": "Make a ten first! 6 + 4 = 10. Then add 5 more. 10 + 5 = 15. You're amazing! ✨",
        "d": "m"
      },
      {
        "t": "What is 7 + 3 + 8?",
        "o": [
          "16",
          "17",
          "18",
          "19"
        ],
        "a": 2,
        "e": "Make a ten first! 7 + 3 = 10. Then add 8 more. 10 + 8 = 18. Super! 👍",
        "d": "m"
      },
      {
        "t": "A basket has 3 red, 5 blue, and 7 green balls. How many balls in all?",
        "o": [
          "14",
          "15",
          "16",
          "13"
        ],
        "a": 1,
        "e": "Make a ten first! 3 + 7 = 10. Then add 5 more. That's 15 balls! Great counting! ⚽",
        "d": "h"
      },
      {
        "t": "What is 9 + 1 + 4?",
        "o": [
          "13",
          "14",
          "15",
          "12"
        ],
        "a": 1,
        "e": "Make a ten first! 9 + 1 = 10. Then add 4 more. 10 + 4 = 14. Keep up the good work! 🌟",
        "d": "m"
      },
      {
        "t": "What is 10 + 20 + 40?",
        "o": [
          "60",
          "70",
          "80",
          "50"
        ],
        "a": 1,
        "e": "Add the tens together! 10 + 20 = 30. Then add 40 more. 30 + 40 = 70. You're a whiz! 🧠",
        "d": "m"
      },
      {
        "t": "What is 2 + 8 + 6?",
        "o": [
          "14",
          "15",
          "16",
          "17"
        ],
        "a": 2,
        "e": "Make a ten first! 2 + 8 = 10. Then add 6 more. 10 + 6 = 16. You're doing great! 🎉",
        "d": "m"
      },
      {
        "t": "What is 5 + 3 + 5?",
        "o": [
          "12",
          "13",
          "14",
          "11"
        ],
        "a": 1,
        "e": "Start with a double! 5 + 5 = 10. Then add 3 more. 10 + 3 = 13. Excellent! 👍",
        "d": "e"
      },
      {
        "t": "Dan scored 6 points, then 4, then 3. How many points total?",
        "o": [
          "12",
          "13",
          "14",
          "11"
        ],
        "a": 1,
        "e": "Make a ten first! 6 + 4 is 10. It's easier to add 10 + 3. So, the answer is 13! ✨",
        "d": "h"
      },
      {
        "t": "What is 30 + 40 + 20?",
        "o": [
          "80",
          "90",
          "100",
          "70"
        ],
        "a": 1,
        "e": "Adding tens is like counting! 3 + 4 is 7, so 30 + 40 is 70. Then 70 + 20 is 90. Great job! 👍",
        "d": "m"
      },
      {
        "t": "Which pair of numbers makes a ten? A) 3 and 5  B) 6 and 4  C) 7 and 2  D) 8 and 3",
        "o": [
          "3 and 5",
          "6 and 4",
          "7 and 2",
          "8 and 3"
        ],
        "a": 1,
        "e": "Yes! 6 + 4 makes a perfect 10! Knowing these 'make ten' pairs helps you add super fast! 🎉",
        "d": "m"
      },
      {
        "t": "What is 1 + 9 + 7?",
        "o": [
          "15",
          "16",
          "17",
          "18"
        ],
        "a": 2,
        "e": "Find the ten first! 1 + 9 is 10. It's easy to add 10 + 7. So, the answer is 17! Awesome! ⭐",
        "d": "m"
      },
      {
        "t": "What is 50 + 20 + 30?",
        "o": [
          "90",
          "100",
          "110",
          "80"
        ],
        "a": 1,
        "e": "Add the tens! 50 + 30 is 80. Then 80 + 20 makes 100. You can add in any order to find 100! 💯",
        "d": "m"
      },
      {
        "t": "Amy picked 4 flowers, then 6, then 8. How many flowers in all?",
        "o": [
          "16",
          "17",
          "18",
          "19"
        ],
        "a": 2,
        "e": "Make a ten first! 4 + 6 is 10. It's easier to add 10 + 8. So, that's 18 flowers! You got it! 🌻",
        "d": "h"
      },
      {
        "t": "What is 3 + 7 + 2?",
        "o": [
          "11",
          "12",
          "13",
          "10"
        ],
        "a": 1,
        "e": "Look for the ten! 3 + 7 makes 10. It's easier to add 10 + 2. So, the answer is 12! Great job! 👍",
        "d": "m"
      },
      {
        "t": "What is 6 + 6 + 3?",
        "o": [
          "14",
          "15",
          "16",
          "13"
        ],
        "a": 1,
        "e": "Using doubles is super smart! 6 + 6 is 12. Then count on 3 more to get 15. Way to go! 🚀",
        "d": "m"
      },
      {
        "t": "What is 40 + 10 + 50?",
        "o": [
          "90",
          "100",
          "110",
          "80"
        ],
        "a": 1,
        "e": "Add the tens! 40 + 10 is 50. Then 50 + 50 makes 100. You're a math whiz at adding tens! 💯",
        "d": "m"
      },
      {
        "t": "What is 24 + 35 + 16?",
        "o": [
          "65",
          "75",
          "85",
          "55"
        ],
        "a": 1,
        "e": "Look for ones that make a ten! 4 + 6 is 10. So 24 + 16 is 40. Then 40 + 35 is 75. Great thinking! 🧠",
        "d": "m"
      },
      {
        "t": "Which strategy helps add 18 + 32 + 25?",
        "o": [
          "Add all ones first",
          "Make a ten: 18 + 32 = 50",
          "Start with the largest number",
          "Count by ones"
        ],
        "a": 1,
        "e": "The ones, 8 + 2, make a ten! This makes 18 + 32 easy: 50. Then 50 + 25 is 75. Super efficient! 💡",
        "d": "m"
      },
      {
        "t": "Sam collected 37 shells on Monday, 28 on Tuesday, and 13 on Wednesday. How many in all?",
        "o": [
          "68",
          "78",
          "88",
          "58"
        ],
        "a": 1,
        "e": "Look for ones that make a ten! 7 + 3 is 10. So 37 + 13 is 50. Then 50 + 28 is 78. You're so smart! 🌟",
        "d": "m"
      },
      {
        "t": "__ + 25 + 19 = 80. What is the missing number?",
        "o": [
          "46",
          "36",
          "26",
          "42"
        ],
        "a": 1,
        "e": "First, add 25 + 19 to get 44. To find the missing part, subtract 44 from 80. The answer is 36! ✔️",
        "d": "h"
      },
      {
        "t": "What is 45 + 27 + 18?",
        "o": [
          "80",
          "90",
          "100",
          "70"
        ],
        "a": 1,
        "e": "First, 45 + 27 is 72 (regroup the ones!). Then 72 + 18 is 90 (regroup again!). Great math! ➕",
        "d": "m"
      },
      {
        "t": "A toy store sells 42 cars, 38 trucks, and 15 planes. How many toys sold in all?",
        "o": [
          "85",
          "95",
          "105",
          "75"
        ],
        "a": 1,
        "e": "The ones, 2 + 8, make a ten! This makes 42 + 38 easy: 80. Then 80 + 15 is 95 toys. So easy! 😊",
        "d": "m"
      },
      {
        "t": "Which two numbers should you add first to make a ten? 17 + 24 + 33",
        "o": [
          "17 and 24",
          "24 and 33",
          "17 and 33",
          "Add in order"
        ],
        "a": 2,
        "e": "Look at the ones! 7 + 3 makes a ten! This makes 17 + 33 easy: 50. Then 50 + 24 is 74. Smart! 🥳",
        "d": "m"
      },
      {
        "t": "What is 56 + 14 + 23?",
        "o": [
          "83",
          "93",
          "103",
          "73"
        ],
        "a": 1,
        "e": "Make a ten with the ones! 6 + 4 is 10. So 56 + 14 is 70. Then 70 + 23 is 93. Great! ✅",
        "d": "m"
      },
      {
        "t": "Which is the correct sum: 31 + 49 + 22?",
        "o": [
          "92",
          "102",
          "112",
          "82"
        ],
        "a": 1,
        "e": "The ones, 1 + 9, make a ten! This makes 31 + 49 easy: 80. Then 80 + 22 is 102. Super helpful! ✨",
        "d": "m"
      },
      {
        "t": "15 + __ + 28 = 73. What is the missing number?",
        "o": [
          "40",
          "30",
          "20",
          "35"
        ],
        "a": 1,
        "e": "First, add 15 + 28 to get 43. To find the missing part, subtract 43 from 73. The answer is 30! 🤩",
        "d": "m"
      },
      {
        "t": "A garden has 29 red flowers, 41 yellow flowers, and 18 pink flowers. How many flowers total?",
        "o": [
          "78",
          "88",
          "98",
          "68"
        ],
        "a": 1,
        "e": "The ones, 9 + 1, make a ten! This makes 29 + 41 easy: 70. Then 70 + 18 is 88. You're a pro! 🏆",
        "d": "h"
      },
      {
        "t": "What is 33 + 47 + 26?",
        "o": [
          "96",
          "106",
          "116",
          "86"
        ],
        "a": 1,
        "e": "We add 33 + 47 first. The ones (3+7) make 10, so 33+47=80. Then 80+26=106. You found the sum! 👍",
        "d": "m"
      },
      {
        "t": "Which is greater: 25 + 36 + 14 or 43 + 28 + 12?",
        "o": [
          "25 + 36 + 14",
          "43 + 28 + 12",
          "They are equal",
          "Cannot tell"
        ],
        "a": 1,
        "e": "First sum: 25+36+14=75. Second sum: 43+28+12=83. Since 83 is more than 75, the second sum is greater! ✨",
        "d": "h"
      },
      {
        "t": "What is 62 + 19 + 11?",
        "o": [
          "82",
          "92",
          "102",
          "72"
        ],
        "a": 1,
        "e": "Look for numbers that make a 10! 19 + 11 = 30 (9+1=10). Then 62 + 30 = 92. You're a super adder! 💯",
        "d": "m"
      },
      {
        "t": "A class read 26 books in January, 34 in February, and 22 in March. How many books total?",
        "o": [
          "72",
          "82",
          "92",
          "62"
        ],
        "a": 1,
        "e": "Let's make a ten! 26 + 34 = 60 (6+4=10). Then 60 + 22 = 82 books. You found the total! 📚",
        "d": "h"
      },
      {
        "t": "38 + 22 + __ = 100. What is the missing number?",
        "o": [
          "50",
          "40",
          "30",
          "45"
        ],
        "a": 1,
        "e": "First, 38 + 22 = 60 (8+2=10). To get to 100, we need 40 more. So, the missing number is 40! 🔍",
        "d": "h"
      },
      {
        "t": "What is 51 + 39 + 17?",
        "o": [
          "97",
          "107",
          "117",
          "87"
        ],
        "a": 1,
        "e": "Make a ten first! 51 + 39 = 90 (1+9=10). Then 90 + 17 = 107. You're an awesome math whiz! ✨",
        "d": "m"
      },
      {
        "t": "Which pair makes adding 27 + 46 + 13 easier?",
        "o": [
          "27 and 46",
          "46 and 13",
          "27 and 13",
          "No pair helps"
        ],
        "a": 2,
        "e": "Look at the ones! 7 + 3 makes 10, so 27 + 13 = 40. Then 40 + 46 = 86. Smart thinking! 💡",
        "d": "m"
      },
      {
        "t": "A pet shop has 44 fish, 31 hamsters, and 16 birds. How many pets in all?",
        "o": [
          "81",
          "91",
          "101",
          "71"
        ],
        "a": 1,
        "e": "Find numbers that make a 10! 44 + 16 = 60 (4+6=10). Then 60 + 31 = 91 pets. Great work! 🐾",
        "d": "h"
      },
      {
        "t": "What is 28 + 35 + 42?",
        "o": [
          "95",
          "105",
          "115",
          "85"
        ],
        "a": 1,
        "e": "Make a ten! 28 + 42 = 70 (8+2=10). Then 70 + 35 = 105. You're a math whiz! 🌟",
        "d": "m"
      },
      {
        "t": "Jake scored 47 points in Round 1, 38 in Round 2, and 29 in Round 3. He needs 120 to win. Does he have enough?",
        "o": [
          "Yes, he has 124",
          "Yes, he has exactly 120",
          "No, he has 114",
          "No, he has 104"
        ],
        "a": 2,
        "e": "Add all numbers: 47 + 38 + 29 = 114. Since 114 is less than 120, Jake does not have enough. You got this! 👍",
        "d": "h"
      },
      {
        "t": "A student added 36 + 45 + 24 and got 95. Find the error.",
        "o": [
          "No error, 95 is correct",
          "Forgot to regroup, answer is 105",
          "Added ones wrong, answer is 115",
          "Added tens wrong, answer is 85"
        ],
        "a": 1,
        "e": "First, 36+24=60 (6+4=10!). Then 60+45=105. Remember to regroup the tens when you add! You did great! 👍",
        "d": "h"
      },
      {
        "t": "__ + 37 + 28 = 112. What is the missing number?",
        "o": [
          "57",
          "47",
          "37",
          "53"
        ],
        "a": 1,
        "e": "First, 37 + 28 = 65. To find the missing number, subtract 65 from 112. 112 - 65 = 47. Great work! 🕵️‍♀️",
        "d": "h"
      },
      {
        "t": "Mia has 53 red beads, 39 blue beads, and 48 green beads. She uses 25 for a project. How many are left?",
        "o": [
          "115",
          "105",
          "125",
          "95"
        ],
        "a": 0,
        "e": "Add all the numbers: 53 + 39 + 48 = 140. Then subtract 25 from 140. 140 - 25 = 115. You did great! ✅",
        "d": "h"
      },
      {
        "t": "A student says 28 + 34 + 19 = 71. Another says 81. Who is correct?",
        "o": [
          "First student (71)",
          "Second student (81)",
          "Neither, it is 91",
          "Neither, it is 61"
        ],
        "a": 1,
        "e": "First, 28 + 34 = 62 (remember to regroup!). Then 62 + 19 = 81 (regroup again!). The second student is correct! ⭐",
        "d": "h"
      },
      {
        "t": "Which set of three numbers adds to more than 120? A) 35+42+28  B) 46+38+41  C) 29+33+47  D) 31+44+36",
        "o": [
          "35+42+28",
          "46+38+41",
          "29+33+47",
          "31+44+36"
        ],
        "a": 1,
        "e": "Group A=105, B=125, C=109, D=111. Only B (125) is greater than 120. You found the biggest sum! 🏆",
        "d": "h"
      },
      {
        "t": "A baker made 45 muffins in the morning, 38 at noon, and 27 in the evening. He sold 65. How many are left?",
        "o": [
          "55",
          "45",
          "35",
          "50"
        ],
        "a": 1,
        "e": "Add all muffins: 45 + 38 + 27 = 110. Then subtract the 65 eaten. 110 - 65 = 45 muffins left. Yum! 🧁",
        "d": "h"
      },
      {
        "t": "__ + 56 + __ = 140, and both missing numbers are the same. What is each number?",
        "o": [
          "52",
          "42",
          "32",
          "46"
        ],
        "a": 1,
        "e": "Two numbers + 56 = 140. 140 - 56 = 84. Since two numbers are the same, half of 84 is 42. So it's 42! 🎉",
        "d": "h"
      },
      {
        "t": "Three friends scored: Ana 67, Ben 45, Cal 38. What is the difference between the highest total of two friends and the lowest total of two friends?",
        "o": [
          "29",
          "39",
          "19",
          "49"
        ],
        "a": 0,
        "e": "Highest sum: Ana+Ben = 112. Lowest sum: Ben+Cal = 83. The difference is 112 - 83 = 29. You found it! ↔️",
        "d": "h"
      },
      {
        "t": "A student checked 52 + 29 + 41 = 112. Is this correct?",
        "o": [
          "No, it should be 122",
          "Yes, 112 is correct",
          "No, it should be 132",
          "No, it should be 102"
        ],
        "a": 0,
        "e": "First, 52 + 29 = 81 (remember to regroup!). Then 81 + 41 = 122. The student forgot to regroup. You got it! 💪",
        "d": "h"
      },
      {
        "t": "Rosa picked 34 apples, 46 oranges, and 28 bananas. She gave away 50 pieces of fruit. How many are left?",
        "o": [
          "68",
          "58",
          "48",
          "78"
        ],
        "a": 1,
        "e": "First, add all the numbers: 34 + 46 + 28 = 108. Then subtract 50. 108 - 50 = 58. You solved it! 🥳",
        "d": "h"
      },
      {
        "t": "Which strategy is best for adding 63 + 17 + 25?",
        "o": [
          "Add left to right",
          "Make a ten: 63 + 17 = 80, then + 25",
          "Add all ones, then all tens",
          "Round each number first"
        ],
        "a": 1,
        "e": "Look for numbers that make a 10! 3 + 7 = 10. This makes adding 63 + 17 = 80 easy! Then 80 + 25 = 105. You're a math star! ✨",
        "d": "h"
      },
      {
        "t": "A class needs 150 cans. Group A collected 43, Group B collected 58, Group C collected 37. Do they have enough?",
        "o": [
          "Yes, they have 148",
          "Yes, they have 138",
          "No, they have 138",
          "No, they have 128"
        ],
        "a": 2,
        "e": "Group 43 + 37 first because 3 + 7 makes a 10! That's 80. Then 80 + 58 = 138. Since 138 < 150, they don't have enough! 💰",
        "d": "h"
      },
      {
        "t": "25 + __ + 48 = 130. What is the missing number?",
        "o": [
          "67",
          "57",
          "47",
          "63"
        ],
        "a": 1,
        "e": "First, add the parts you know: 25 + 48 = 73. To find the missing part, we subtract the sum from the total: 130 - 73 = 57. Great job! 👍",
        "d": "h"
      },
      {
        "t": "A student added 39 + 52 + 18 and got 99. Check the work and find the mistake.",
        "o": [
          "No mistake, 99 is correct",
          "Forgot to regroup, answer is 109",
          "Added ones wrong, answer is 119",
          "Added tens wrong, answer is 89"
        ],
        "a": 1,
        "e": "When 9 + 2 makes 11 ones, we regroup 10 ones for 1 ten! So, 39 + 52 = 91. Then 91 + 18 = 109. You got it! ✅",
        "d": "h"
      },
      {
        "t": "Three boxes hold 55, 47, and 36 items. If 40 items are removed, how many remain?",
        "o": [
          "108",
          "98",
          "88",
          "78"
        ],
        "a": 1,
        "e": "First, add all three numbers to find the total: 55 + 47 + 36 = 138. Then, subtract 40 from your total: 138 - 40 = 98. Super work! 👏",
        "d": "h"
      },
      {
        "t": "Is 44 + 38 + 26 greater or less than 29 + 55 + 31?",
        "o": [
          "First is greater (108 vs 115)",
          "Second is greater (108 vs 115)",
          "They are equal",
          "First is greater (118 vs 105)"
        ],
        "a": 1,
        "e": "We find each sum to compare! Sum 1 is 44 + 38 + 26 = 108. Sum 2 is 29 + 55 + 31 = 115. Since 115 > 108, the second sum is greater! 🎉",
        "d": "h"
      },
      {
        "t": "__ + 43 + 29 = 119. What is the missing number?",
        "o": [
          "57",
          "47",
          "37",
          "53"
        ],
        "a": 1,
        "e": "First, add the parts you know: 43 + 29 = 72. To find the missing part, we subtract the sum from the total: 119 - 72 = 47. You got it! 👍",
        "d": "h"
      },
      {
        "t": "A zoo has 41 monkeys, 59 birds, and 33 snakes. 20 animals are moved. How many remain?",
        "o": [
          "123",
          "113",
          "103",
          "93"
        ],
        "a": 1,
        "e": "Look for numbers that make a 100! 41 + 59 = 100. This makes 100 + 33 = 133 easy! Then 133 - 20 = 113. Awesome thinking! 🧠",
        "d": "h"
      },
      {
        "t": "A student says the best way to add 76 + 24 + 53 is to add left to right. Is there a better strategy?",
        "o": [
          "No, left to right is best",
          "Yes, add 76 + 24 = 100 first",
          "Yes, add 24 + 53 first",
          "Yes, round all numbers first"
        ],
        "a": 1,
        "e": "Look for numbers that make a 100! 76 + 24 = 100. This makes adding 100 + 53 = 153 super easy! You're so smart! 💯",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "What is 5 + 5 + 8?",
        "o": [
          "11",
          "22",
          "18",
          "25"
        ],
        "a": 2,
        "e": "Using doubles facts helps you add fast! 5 + 5 = 10. Then 10 + 8 = 18. You are a math whiz! ➕"
      },
      {
        "t": "What is 4 + 6 + 9?",
        "o": [
          "12",
          "24",
          "19",
          "27"
        ],
        "a": 2,
        "e": "Look for numbers that make a 10! 4 + 6 = 10. This makes adding 10 + 9 = 19 easy! You're so smart! 🔟"
      },
      {
        "t": "What is 7 + 7 + 5?",
        "o": [
          "12",
          "25",
          "19",
          "27"
        ],
        "a": 2,
        "e": "Using doubles facts helps you add fast! 7 + 7 = 14. Then 14 + 5 = 19. You're doing great! ✌️"
      },
      {
        "t": "What is 3 + 7 + 8?",
        "o": [
          "11",
          "23",
          "18",
          "26"
        ],
        "a": 2,
        "e": "Look for numbers that make a 10! 3 + 7 = 10. This makes adding 10 + 8 = 18 easy! You're so smart! 🔟"
      },
      {
        "t": "When adding 3 numbers, look for:",
        "o": [
          "The biggest number",
          "Make-a-ten or doubles pairs",
          "Add left to right always",
          "Skip the middle"
        ],
        "a": 1,
        "e": "Looking for numbers that make a ten or doubles facts makes adding much easier and faster! You're learning great strategies! 👍"
      },
      {
        "t": "What is 6 + 4 + 12?",
        "o": [
          "14",
          "28",
          "22",
          "31"
        ],
        "a": 2,
        "e": "Look for numbers that make a 10! 6 + 4 = 10. This makes adding 10 + 12 = 22 easy! You're so smart! 🔟"
      }
    ]
  },
  {
    "points": [
      "Step 1: Read carefully",
      "Step 2: Find the numbers",
      "Step 3: Add or subtract?",
      "Step 4: Solve and check",
      "ADD words: total, altogether, in all, combined",
      "SUBTRACT words: left, fewer, difference, gave away"
    ],
    "examples": [
      {
        "c": "#e67e22",
        "tag": "Addition Problem",
        "p": "Mia has 56 red and 78 green apples. How many total?",
        "s": "\"Total\" = add! 56 + 78 =",
        "a": "134 apples ✅"
      },
      {
        "c": "#e67e22",
        "tag": "Subtraction Problem",
        "p": "Jake had 143 coins. He gave away 68. How many left?",
        "s": "\"Left\" = subtract! 143 - 68 =",
        "a": "75 coins ✅"
      },
      {
        "c": "#e67e22",
        "tag": "Read Carefully!",
        "p": "There were 85 students. 37 went home. How many stayed?",
        "s": "\"Went home\" means subtract. 85 - 37 =",
        "a": "48 students stayed ✅"
      }
    ],
    "practice": [
      {
        "q": "Tom has 45 stickers and gets 38 more. Total?",
        "a": "83 stickers",
        "h": "\"Gets more\" = ADD! 45+38=83",
        "e": "Keep up the great work! Using smart strategies helps you solve problems like a math star! You're doing awesome! ⭐"
      },
      {
        "q": "92 birds in a tree. 47 flew away. How many left?",
        "a": "45 birds",
        "h": "\"Flew away\" = SUBTRACT! 92-47=45",
        "e": "You're learning so much! Keep flying high with your math skills and smart strategies! You're a math pro! 🐦"
      },
      {
        "q": "Sam has 67 cards, Ana has 85. How many more for Ana?",
        "a": "18 more",
        "h": "\"How many more\" = SUBTRACT! 85-67=18",
        "e": "You're a math master! Keep playing with numbers and learning new addition tricks! You're doing great! 🃏"
      }
    ],
    "qBank": [
      {
        "t": "Tom had 45 stickers and got 38 more. How many does he have in all?",
        "o": [
          "83",
          "56",
          "93",
          "40"
        ],
        "a": 0,
        "e": "The words 'got more' mean to add! So, we combine 45 and 38. 45 + 38 = 83. You found the total! ➕",
        "d": "e"
      },
      {
        "t": "There were 92 birds in a tree and 47 flew away. How many are left?",
        "o": [
          "45",
          "25",
          "55",
          "10"
        ],
        "a": 0,
        "e": "The words 'flew away' mean to subtract! So, we take away 47 from 92. 92 - 47 = 45. You found what's left! ➖",
        "d": "m"
      },
      {
        "t": "Sam has 67 cards and Ana has 85. How many more cards does Ana have?",
        "o": [
          "18",
          "8",
          "30",
          "50"
        ],
        "a": 0,
        "e": "When we want to know \"how many more,\" we subtract to find the difference. 85 - 67 = 18. There are 18 more! ✨",
        "d": "m"
      },
      {
        "t": "What does the word \"altogether\" tell you to do?",
        "o": [
          "Subtract",
          "Multiply",
          "Add",
          "Divide"
        ],
        "a": 2,
        "e": "\"Altogether\" means we add to find the total amount. You're super! ➕",
        "d": "e"
      },
      {
        "t": "Lily had 143 coins and gave away 68. How many coins does she have left?",
        "o": [
          "75",
          "55",
          "85",
          "30"
        ],
        "a": 0,
        "e": "When some are \"given away,\" we subtract to find what is left. 143 - 68 = 75. You got it! 👍",
        "d": "h"
      },
      {
        "t": "There are 56 red apples and 78 green apples. How many apples are there in all?",
        "o": [
          "134",
          "104",
          "144",
          "90"
        ],
        "a": 0,
        "e": "To find the \"total,\" we add all the numbers together. 56 + 78 = 134. Super adding! ✅",
        "d": "e"
      },
      {
        "t": "There are 165 crayons and 78 are broken. How many good crayons are there?",
        "o": [
          "87",
          "97",
          "50",
          "130"
        ],
        "a": 0,
        "e": "If some are \"broken,\" we subtract them to find how many are left. 165 - 78 = 87. Nice work! 👏",
        "d": "m"
      },
      {
        "t": "What does the phrase \"how many left\" tell you to do?",
        "o": [
          "Subtract",
          "Add",
          "Multiply",
          "Count up"
        ],
        "a": 0,
        "e": "\"Left\" means we subtract to find how many are still there. You're a math star! ⭐",
        "d": "e"
      },
      {
        "t": "There are 82 students in one class and 59 in another. How many students are there combined?",
        "o": [
          "120",
          "151",
          "141",
          "100"
        ],
        "a": 2,
        "e": "\"Combined\" means we add groups together to find the total. 82 + 59 = 141. Awesome! 🥳",
        "d": "e"
      },
      {
        "t": "What is the first step when solving a word problem?",
        "o": [
          "Guess the answer",
          "Write numbers first",
          "Read carefully",
          "Add everything"
        ],
        "a": 2,
        "e": "Always read the problem carefully first to know if you add or subtract! You've got this! 🤔",
        "d": "e"
      },
      {
        "t": "The park had 175 people and 89 left. How many people are still at the park?",
        "o": [
          "76",
          "50",
          "86",
          "130"
        ],
        "a": 2,
        "e": "To find what's \"left,\" we subtract. 175 - 89 = 86. You regrouped well to find the answer! ➖",
        "d": "h"
      },
      {
        "t": "What does the phrase \"in all\" mean in a math story?",
        "o": [
          "Subtract",
          "Divide",
          "Add",
          "None"
        ],
        "a": 2,
        "e": "\"In all\" means we add everything up to find the total amount. Super smart! 💡",
        "d": "e"
      },
      {
        "t": "The store had 136 apples and sold 78. How many apples are left?",
        "o": [
          "38",
          "68",
          "58",
          "20"
        ],
        "a": 2,
        "e": "When items are \"sold,\" we subtract to find how many are left. 136 - 78 = 58. Great! 💰",
        "d": "h"
      },
      {
        "t": "There are 63 boys and 74 girls at school. How many students are there altogether?",
        "o": [
          "107",
          "147",
          "90",
          "137"
        ],
        "a": 3,
        "e": "To find the total of \"boys + girls,\" we add them together. 63 + 74 = 137. Fantastic! 👫",
        "d": "e"
      },
      {
        "t": "What does the word \"difference\" mean in a math problem?",
        "o": [
          "Add two numbers",
          "Multiply",
          "Count on",
          "Subtract to find gap"
        ],
        "a": 3,
        "e": "\"Difference\" always means we subtract to find how much more or less. You're a math whiz! 🧠",
        "d": "e"
      },
      {
        "t": "Mia has 95 stickers and gives 47 away. How many stickers does she have left?",
        "o": [
          "38",
          "20",
          "80",
          "48"
        ],
        "a": 3,
        "e": "If someone \"gives away\" some, we subtract to find what is left. 95 - 47 = 48. Good thinking! 🎁",
        "d": "m"
      },
      {
        "t": "There are 74 pencils and 58 more pencils. How many are there altogether?",
        "o": [
          "102",
          "142",
          "90",
          "132"
        ],
        "a": 3,
        "e": "\"Altogether\" means we add everything up to find the total. 74 + 58 = 132. You're a pro! ✨",
        "d": "e"
      },
      {
        "t": "The school had 183 books and 96 were checked out. How many books are still there?",
        "o": [
          "97",
          "50",
          "130",
          "87"
        ],
        "a": 3,
        "e": "When books are \"checked out,\" we subtract to see how many are left. 183 - 96 = 87. Well done! 📚",
        "d": "h"
      },
      {
        "t": "Which word tells you to SUBTRACT in a math story?",
        "o": [
          "total",
          "altogether",
          "in all",
          "fewer"
        ],
        "a": 3,
        "e": "\"Fewer\" means less. We subtract to find the difference between numbers. Keep up the great work! 👇",
        "d": "e"
      },
      {
        "t": "There are 27 girls, 38 boys, and 15 teachers. How many people are there in all?",
        "o": [
          "45",
          "90",
          "55",
          "80"
        ],
        "a": 3,
        "e": "To find how many people are \"in all,\" we add all the numbers. 27 + 38 + 15 = 80. You got it! 🥳",
        "d": "e"
      },
      {
        "t": "A book has 152 pages and Maria has read 67 pages. How many pages are left?",
        "o": [
          "75",
          "55",
          "120",
          "85"
        ],
        "a": 3,
        "e": "To find what is left, we subtract. 152 - 67 = 85. You regrouped to solve it! Awesome! 👏",
        "d": "h"
      },
      {
        "t": "Sam scored 86 points and Ben scored 74 points. How many more points did Sam score?",
        "o": [
          "10",
          "12",
          "14",
          "16"
        ],
        "a": 1,
        "e": "\"How many more\" means we subtract to find the difference. 86 - 74 = 12. Super job! 👍",
        "d": "e"
      },
      {
        "t": "Which word tells you to ADD in a math story?",
        "o": [
          "left",
          "fewer",
          "combined",
          "gave away"
        ],
        "a": 2,
        "e": "When we combine things, we put them together to find the total. That's why we add! Great job! ➕",
        "d": "e"
      },
      {
        "t": "There are 125 students and 46 more joined. How many students are there in all?",
        "o": [
          "151",
          "171",
          "181",
          "120"
        ],
        "a": 1,
        "e": "To find how many in all, we add 125 and 46. Regroup if you need to! The total is 171. You got it! ✨",
        "d": "m"
      },
      {
        "t": "There are 200 apples and 87 were sold. How many apples are remaining?",
        "o": [
          "93",
          "113",
          "123",
          "80"
        ],
        "a": 1,
        "e": "When we take 87 away from 200, we subtract to find what's left. Remember to regroup! The difference is 113. Super work! ➖",
        "d": "m"
      },
      {
        "t": "Which word means SUBTRACT?",
        "o": [
          "total",
          "sum",
          "difference",
          "combined"
        ],
        "a": 2,
        "e": "To find the difference, we subtract! This tells us how many more one group has. Keep it up! 💡",
        "d": "e"
      },
      {
        "t": "A bag had 134 grapes and 58 were eaten. How many grapes are left?",
        "o": [
          "56",
          "76",
          "86",
          "30"
        ],
        "a": 1,
        "e": "When we take 58 away from 134, we subtract to find what's left. Remember to regroup! The answer is 76. Awesome job! 🎉",
        "d": "h"
      },
      {
        "t": "There are 43 red balloons and 59 blue balloons. How many balloons are there in all?",
        "o": [
          "82",
          "102",
          "112",
          "70"
        ],
        "a": 1,
        "e": "To find how many in all, we add 43 and 59. Remember to regroup the ones! The sum is 102. Way to go! ➕",
        "d": "e"
      },
      {
        "t": "There were 175 people at a game and 88 left early. How many people are still at the game?",
        "o": [
          "97",
          "87",
          "50",
          "130"
        ],
        "a": 1,
        "e": "When we take 88 away from 175, we subtract to find what's left. Regroup carefully! The difference is 87. Fantastic! 🌟",
        "d": "h"
      },
      {
        "t": "Jen had 95 cards, gave away 38, then got 27 more. How many cards does she have now?",
        "o": [
          "64",
          "84",
          "94",
          "50"
        ],
        "a": 1,
        "e": "First, subtract 38 from 95 to find what's left. Then, add 27 more to find the new total. The answer is 84. Smart! 🤔",
        "d": "h"
      },
      {
        "t": "Zoe has 34 crayons. She gets 25 more. How many crayons does she have now?",
        "o": [
          "49",
          "59",
          "69",
          "58"
        ],
        "a": 1,
        "e": "To find how many in all, we add 34 and 25. Put the numbers together! The total is 59. You did it! 👍",
        "d": "e"
      },
      {
        "t": "A class had 47 pencils. They used 23. How many are left?",
        "o": [
          "34",
          "24",
          "14",
          "23"
        ],
        "a": 1,
        "e": "When we take 23 away from 47, we subtract to find what's left. The answer is 24. Way to go! 🥳",
        "d": "e"
      },
      {
        "t": "There are 56 birds in a tree. 12 fly away. How many birds are still in the tree?",
        "o": [
          "54",
          "44",
          "34",
          "43"
        ],
        "a": 1,
        "e": "When birds fly away, we subtract to find how many are left. 56 - 12 = 44. You're a math whiz! 🐦",
        "d": "e"
      },
      {
        "t": "Mia read 31 pages on Monday and 48 pages on Tuesday. How many pages did she read in all?",
        "o": [
          "69",
          "89",
          "79",
          "78"
        ],
        "a": 2,
        "e": "\"How many in all\" means we add! We put 31 and 48 together. The total is 79. Excellent thinking! 💯",
        "d": "e"
      },
      {
        "t": "A shop has 83 toys. 41 are sold. How many toys are left?",
        "o": [
          "52",
          "42",
          "32",
          "43"
        ],
        "a": 1,
        "e": "When items are sold, they are gone! We subtract to find how many are left. 83 - 41 = 42. Super smart! 💰",
        "d": "m"
      },
      {
        "t": "Sam picked 45 apples. Ava picked 32 apples. How many apples did they pick altogether?",
        "o": [
          "67",
          "87",
          "77",
          "78"
        ],
        "a": 2,
        "e": "\"Altogether\" means we add! We combine 45 and 32 to find the total. The answer is 77. Wonderful! ✨",
        "d": "e"
      },
      {
        "t": "There were 68 fish in a pond. 24 swam away. How many fish are still in the pond?",
        "o": [
          "54",
          "44",
          "34",
          "43"
        ],
        "a": 1,
        "e": "When fish swim away, we subtract to find how many are left. 68 - 24 = 44. You're doing great! 🐠",
        "d": "e"
      },
      {
        "t": "A farm has 52 cows and 36 horses. How many animals in all?",
        "o": [
          "78",
          "98",
          "88",
          "86"
        ],
        "a": 2,
        "e": "\"In all\" means we add! We put 52 and 36 together to find the total. The answer is 88. Keep it up! ���",
        "d": "m"
      },
      {
        "t": "Which operation do you use? 'Leo had 75 cards. He gave 33 to a friend.'",
        "o": [
          "Addition",
          "Subtraction",
          "Both",
          "Neither"
        ],
        "a": 1,
        "e": "When you give things away, they are removed! We subtract to find what's left. 75 - 33 = 42. Awesome! 🎁",
        "d": "m"
      },
      {
        "t": "Rosa has 29 stickers. She finds 40 more. How many stickers does she have now?",
        "o": [
          "59",
          "79",
          "69",
          "49"
        ],
        "a": 2,
        "e": "When you find more, you add them to what you already have! 29 + 40 = 69. You're so good at this! 🤩",
        "d": "m"
      },
      {
        "t": "A box has 97 markers. 55 are taken out. How many are left in the box?",
        "o": [
          "52",
          "42",
          "32",
          "43"
        ],
        "a": 1,
        "e": "When things are taken out, they are gone! We subtract to find how many are left. 97 - 55 = 42. Great job! 👋",
        "d": "m"
      },
      {
        "t": "Kai collected 43 rocks. His sister collected 35 rocks. How many rocks do they have together?",
        "o": [
          "68",
          "88",
          "78",
          "77"
        ],
        "a": 2,
        "e": "\"Together\" means we add! We put 43 and 35 together to find the total. The answer is 78. You're amazing! 🤗",
        "d": "e"
      },
      {
        "t": "Which operation do you use? 'A bakery made 84 cookies. They sold 51.'",
        "o": [
          "Addition",
          "Subtraction",
          "Both",
          "Neither"
        ],
        "a": 1,
        "e": "When items are sold, they are taken away! Subtract 84 - 51. You have 33 left. Great job! ➖",
        "d": "e"
      },
      {
        "t": "A library has 62 books on one shelf and 26 on another. How many books on both shelves?",
        "o": [
          "78",
          "98",
          "88",
          "86"
        ],
        "a": 2,
        "e": "To find both together, we add! 62 + 26 = 88. The total is 88. You got it! ✨",
        "d": "m"
      },
      {
        "t": "There are 75 students. 43 go outside. How many are still inside?",
        "o": [
          "42",
          "32",
          "22",
          "33"
        ],
        "a": 1,
        "e": "When some leave, we subtract! 75 - 43 = 32. There are 32 left. Super! 🚶‍♀️",
        "d": "e"
      },
      {
        "t": "A bus had 38 passengers. At the stop, 21 more got on. How many passengers now?",
        "o": [
          "49",
          "69",
          "59",
          "57"
        ],
        "a": 2,
        "e": "When more got on, the group grew! Add 38 + 21 = 59. The total is 59. Way to go! ➕",
        "d": "m"
      },
      {
        "t": "Ella has 54 beads. She uses 31 for a necklace. How many beads are left?",
        "o": [
          "33",
          "23",
          "13",
          "22"
        ],
        "a": 1,
        "e": "When you use something, it's taken away! Subtract 54 - 31 = 23. You have 23 left. Awesome! 👍",
        "d": "m"
      },
      {
        "t": "A garden has 41 roses and 37 tulips. How many flowers are there in all?",
        "o": [
          "68",
          "88",
          "78",
          "77"
        ],
        "a": 2,
        "e": "To find in all, we add! 41 + 37 = 78. The total is 78. You're a star! ⭐",
        "d": "m"
      },
      {
        "t": "There are 86 balloons. 44 pop. How many balloons are left?",
        "o": [
          "52",
          "42",
          "32",
          "43"
        ],
        "a": 1,
        "e": "When balloons pop, they are gone! Subtract 86 - 44 = 42. You have 42 left. Nice work! 🎈",
        "d": "m"
      },
      {
        "t": "Which is a correct answer? 'A store has 63 hats and 25 scarves. How many items in all?'",
        "o": [
          "78",
          "98",
          "88",
          "38"
        ],
        "a": 2,
        "e": "To find in all, we add! 63 + 25 = 88. The total is 88. Keep it up! 💪",
        "d": "m"
      },
      {
        "t": "Maya has 67 stickers. She buys 45 more. How many does she have now?",
        "o": [
          "102",
          "122",
          "112",
          "92"
        ],
        "a": 2,
        "e": "To add 67 + 45, add the ones. Regroup 1 ten. Then add the tens. The total is 112. Smart! 🧠",
        "d": "m"
      },
      {
        "t": "A tank has 134 fish. 58 are moved to another tank. How many fish are left?",
        "o": [
          "86",
          "76",
          "66",
          "82"
        ],
        "a": 1,
        "e": "To subtract 134 - 58, you need to regroup! The answer is 76. You did it! ✅",
        "d": "h"
      },
      {
        "t": "Ben has 83 baseball cards. He gives away 47. How many does he have left?",
        "o": [
          "46",
          "36",
          "26",
          "42"
        ],
        "a": 1,
        "e": "To subtract 83 - 47, you need to regroup! The answer is 36. Fantastic! ✨",
        "d": "m"
      },
      {
        "t": "A store sold 78 ice cream cones in the morning and 56 in the afternoon. How many were sold in all?",
        "o": [
          "124",
          "144",
          "134",
          "114"
        ],
        "a": 2,
        "e": "To add 78 + 56, add the ones. Regroup 1 ten. Then add the tens. The total is 134. Amazing! 🤩",
        "d": "m"
      },
      {
        "t": "There were __ students in a gym. 38 left and now there are 57. How many were there at first?",
        "o": [
          "85",
          "105",
          "95",
          "75"
        ],
        "a": 2,
        "e": "If some left, add them back to find the start! 57 + 38 = 95. There were 95 students. Great thinking! 💡",
        "d": "m"
      },
      {
        "t": "Which operation do you use? 'A jar had some marbles. 29 were added and now there are 86.'",
        "o": [
          "Add 86 + 29",
          "Subtract 86 - 29",
          "Add 29 + 29",
          "Subtract 29 - 86"
        ],
        "a": 1,
        "e": "When you know the total and one part, subtract to find the other part! 86 - 29 = 57. Good job! 🧩",
        "d": "m"
      },
      {
        "t": "Ava has 95 beads. She uses 67 for a bracelet. How many are left?",
        "o": [
          "38",
          "28",
          "18",
          "32"
        ],
        "a": 1,
        "e": "To subtract 95 - 67, you need to regroup! The answer is 28. Keep practicing! 👍",
        "d": "m"
      },
      {
        "t": "A school collected 89 cans one week and 74 cans the next. How many cans in all?",
        "o": [
          "153",
          "173",
          "163",
          "143"
        ],
        "a": 2,
        "e": "To add 89 + 74, add the ones. Regroup 1 ten. Then add the tens. The total is 163. You're great! 🌟",
        "d": "e"
      },
      {
        "t": "Leo had some coins. He spent 43 and has 68 left. How many did he start with?",
        "o": [
          "101",
          "121",
          "111",
          "91"
        ],
        "a": 2,
        "e": "If some were taken, add them back to find the start! 68 + 43 = 111. Leo started with 111. Smart! 💰",
        "d": "m"
      },
      {
        "t": "Which is greater: 'a bag with 93 - 47 marbles' or 'a bag with 85 - 36 marbles'?",
        "o": [
          "First bag (46 marbles)",
          "Second bag (49 marbles)",
          "They are equal",
          "Cannot tell"
        ],
        "a": 1,
        "e": "Find what's left in each bag. Bag 1: 46. Bag 2: 49. Bag 2 has more because 49 > 46! 🎉",
        "d": "m"
      },
      {
        "t": "A bakery made 126 muffins. They sold 79. How many are left?",
        "o": [
          "57",
          "47",
          "37",
          "53"
        ],
        "a": 1,
        "e": "To subtract 126 - 79, you need to regroup! The answer is 47. You got this! ✨",
        "d": "m"
      },
      {
        "t": "Sam found 58 shells at the beach. His friend found 75 shells. How many shells did they find together?",
        "o": [
          "123",
          "143",
          "133",
          "113"
        ],
        "a": 2,
        "e": "To add 58 + 75, add the ones. Regroup 1 ten. Then add the tens. The total is 133. Well done! 👏",
        "d": "m"
      },
      {
        "t": "Rosa has __ stickers. She gets 56 more and now has 123. How many did she start with?",
        "o": [
          "77",
          "67",
          "57",
          "73"
        ],
        "a": 1,
        "e": "We know the total and one part. To find the missing part, we subtract! 123 - 56 = 67. Rosa had 67 stickers! ✨",
        "d": "h"
      },
      {
        "t": "A farmer had 143 eggs. He sold 85 at the market. How many eggs does he have left?",
        "o": [
          "68",
          "58",
          "48",
          "62"
        ],
        "a": 1,
        "e": "'Difference' means subtract! We take 85 from 143. Regroup to help! 143 - 85 = 58. You found it! 👍",
        "d": "h"
      },
      {
        "t": "Two classes collect bottles: Class A gets 76, Class B gets 88. How many altogether?",
        "o": [
          "154",
          "174",
          "164",
          "144"
        ],
        "a": 2,
        "e": "'Total' means put parts together! Add 76 + 88. Regroup the ones! 76 + 88 = 164. Great adding! ➕",
        "d": "e"
      },
      {
        "t": "Which word problem needs subtraction? A) 'How many in all?' B) 'How many are left?' C) 'How many together?' D) 'What is the total?'",
        "o": [
          "How many in all?",
          "How many are left?",
          "How many together?",
          "What is the total?"
        ],
        "a": 1,
        "e": "'How many are left?' means we take away, so we subtract! That's how we find what remains. Good job! 🧠",
        "d": "e"
      },
      {
        "t": "A zoo has 97 animals. 39 are in one area. How many are in the other area?",
        "o": [
          "68",
          "58",
          "48",
          "62"
        ],
        "a": 1,
        "e": "To find the 'difference,' we subtract! Take 39 from 97. Remember to regroup! 97 - 39 = 58. Super! 🚀",
        "d": "m"
      },
      {
        "t": "Kai walks 48 steps to school and 65 steps to the park. How many steps total?",
        "o": [
          "103",
          "123",
          "113",
          "93"
        ],
        "a": 2,
        "e": "To find the 'total,' we add all parts together! Add 48 + 65. Regroup the ones! 48 + 65 = 113. Yes! 👍",
        "d": "e"
      },
      {
        "t": "A box had __ crackers. 46 were eaten and 59 are left. How many were there at first?",
        "o": [
          "95",
          "115",
          "105",
          "85"
        ],
        "a": 2,
        "e": "We know what's left and what was taken. To find the start, add them back! 59 + 46 = 105. There were 105 crackers. 🍪",
        "d": "m"
      },
      {
        "t": "Ella scored 86 points. Ana scored 69 points. How many more points did Ella score?",
        "o": [
          "27",
          "17",
          "7",
          "23"
        ],
        "a": 1,
        "e": "'How many more' means we compare by subtracting! Take 69 from 86. Regroup! 86 - 69 = 17. Awesome! 🌟",
        "d": "e"
      },
      {
        "t": "A store had 165 toys. They sold 78 on Monday and 49 on Tuesday. How many toys are left?",
        "o": [
          "48",
          "38",
          "28",
          "42"
        ],
        "a": 1,
        "e": "We take away twice! First, 78 from 165. Then, 49 from what's left. 165 - 78 = 87. 87 - 49 = 38. 38 toys left! 🧸",
        "d": "h"
      },
      {
        "t": "A student solved this: 'Ben had 132 cards. He gave away 65 and has 77 left.' Is this correct?",
        "o": [
          "Yes, 77 is correct",
          "No, he should have 67",
          "No, he should have 57",
          "No, he should have 87"
        ],
        "a": 1,
        "e": "To subtract 132 - 65, regroup the tens and hundreds! 12 - 5 = 7. Then 12 - 6 = 6. The answer is 67. You'll get it! ✅",
        "d": "h"
      },
      {
        "t": "Mia earned 57 points in Game 1 and 84 in Game 2. She needs 150 to win a prize. Does she have enough? How many more does she need?",
        "o": [
          "Yes, she has enough",
          "No, she needs 9 more",
          "No, she needs 19 more",
          "No, she needs 29 more"
        ],
        "a": 1,
        "e": "First, find the total: 57 + 84 = 141. Then, compare to 150 to find what's missing: 150 - 141 = 9. You got it! 🎯",
        "d": "h"
      },
      {
        "t": "A farmer picked 96 apples and 87 oranges. He sold 135 fruits. How many does he have left?",
        "o": [
          "58",
          "48",
          "38",
          "52"
        ],
        "a": 1,
        "e": "First, add to find the total fruits: 96 + 87 = 183. Then, subtract to find how many are left: 183 - 135 = 48. Great! 🍎",
        "d": "h"
      },
      {
        "t": "__ children were at the park. 36 went home, then 28 more came. Now there are 75. How many were there at first?",
        "o": [
          "73",
          "93",
          "83",
          "63"
        ],
        "a": 2,
        "e": "We work backward! First, 75 - 28 = 47. Then, add back the 36 that left: 47 + 36 = 83. There were 83 at first! ⏪",
        "d": "h"
      },
      {
        "t": "A student wrote: '147 - 89 = 68.' Find the error and give the correct answer.",
        "o": [
          "No error",
          "Should be 58",
          "Should be 78",
          "Should be 48"
        ],
        "a": 1,
        "e": "To subtract 147 - 89, regroup the tens and hundreds! 17 - 9 = 8. Then 13 - 8 = 5. The answer is 58. Keep trying! 👍",
        "d": "h"
      },
      {
        "t": "Team A scored 76 and 68. Team B scored 89 and 52. Which team scored more total points, and by how much?",
        "o": [
          "Team A by 3",
          "Team B by 3",
          "They tied",
          "Team A by 13"
        ],
        "a": 0,
        "e": "First, find each team's total. Team A: 144. Team B: 141. To find 'how many more,' subtract! 144 - 141 = 3. Go team! 🎉",
        "d": "h"
      },
      {
        "t": "A library had 200 books. Monday: 43 checked out. Tuesday: 67 checked out. Wednesday: 25 returned. How many are in the library now?",
        "o": [
          "125",
          "115",
          "105",
          "135"
        ],
        "a": 1,
        "e": "Follow the steps! Take away 43: 200 - 43 = 157. Take away 67: 157 - 67 = 90. Then add 25: 90 + 25 = 115. You did it! ✅",
        "d": "h"
      },
      {
        "t": "A student solved 95 - 48 this way: '9-4=5, 8-5=3, so the answer is 53.' What did the student do wrong?",
        "o": [
          "Subtracted ones digits backward instead of regrouping",
          "Added instead of subtracted",
          "Subtracted tens wrong",
          "Nothing, 53 is correct"
        ],
        "a": 0,
        "e": "When subtracting 95 - 48, you must regroup! 15 - 8 = 7. Then 8 - 4 = 4. The answer is 47. You'll get it! 👍",
        "d": "h"
      },
      {
        "t": "A class needs 175 cans for a project. They collected 89 in Week 1 and 64 in Week 2. How many more do they need?",
        "o": [
          "32",
          "22",
          "12",
          "42"
        ],
        "a": 1,
        "e": "First, find the total cans: 89 + 64 = 153. Then, compare to 175 to find what's missing: 175 - 153 = 22. Great! ♻️",
        "d": "h"
      },
      {
        "t": "Sam had 118 coins. He spent 45 on a toy and 36 on a book. He then found 13 coins. How many does he have?",
        "o": [
          "60",
          "50",
          "40",
          "55"
        ],
        "a": 1,
        "e": "Follow the steps! Take away 45: 118 - 45 = 73. Take away 36: 73 - 36 = 37. Then add 13: 37 + 13 = 50. Math star! ⭐",
        "d": "h"
      },
      {
        "t": "Which problem has the greatest answer? A) 143-67  B) 98+59  C) 175-88  D) 76+68",
        "o": [
          "143 - 67 = 76",
          "98 + 59 = 157",
          "175 - 88 = 87",
          "76 + 68 = 144"
        ],
        "a": 1,
        "e": "We need to find the biggest number! Calculate each option. 98 + 59 = 157. This is the greatest answer! You found it! 🏆",
        "d": "h"
      },
      {
        "t": "A baker made 85 cookies. He sold 39 and then baked 47 more. How many does he have now?",
        "o": [
          "83",
          "103",
          "93",
          "73"
        ],
        "a": 2,
        "e": "We take away what's eaten, then add what's new to find the total. 93 cookies! Great! 🍪",
        "d": "h"
      },
      {
        "t": "Ella had some money. She spent 78 cents on a pencil and 45 cents on an eraser. She has 27 cents left. How much did she start with?",
        "o": [
          "140 cents",
          "150 cents",
          "160 cents",
          "130 cents"
        ],
        "a": 1,
        "e": "To find what Ella had before, we add back the money she spent. 150 cents! You got it! 💰",
        "d": "h"
      },
      {
        "t": "A student checked: 'There are 156 chairs. 79 are used. 77 are empty.' Is this correct?",
        "o": [
          "Yes, 77 is correct",
          "No, it should be 87",
          "No, it should be 67",
          "No, it should be 97"
        ],
        "a": 0,
        "e": "You regrouped to subtract! Taking away 79 from 156 leaves 77. Super subtracting! 👍",
        "d": "h"
      },
      {
        "t": "Two friends share 164 stickers equally. How many does each friend get? What operation do you use?",
        "o": [
          "82 each, use repeated subtraction",
          "74 each, use subtraction",
          "92 each, use addition",
          "164 each, no operation needed"
        ],
        "a": 0,
        "e": "To find half, you share 164 into 2 equal groups. Each group gets 82! Great sharing! 🤝",
        "d": "m"
      },
      {
        "t": "A toy store received 97 dolls and 86 cars. They sold 125 total toys. How many toys are still in the store?",
        "o": [
          "68",
          "58",
          "48",
          "78"
        ],
        "a": 1,
        "e": "You added new toys, then took away some. There are 58 toys left! Good job! 🧸",
        "d": "h"
      },
      {
        "t": "__ kids played outside. 47 went inside for lunch. After lunch, 33 came back out. Now 52 are outside. How many started outside?",
        "o": [
          "56",
          "76",
          "66",
          "86"
        ],
        "a": 2,
        "e": "To find who started outside, we work backward! You found 66 children! Awesome! 🏃‍♀️",
        "d": "h"
      },
      {
        "t": "Ana says 87 + 65 = 142. Ben says 87 + 65 = 152. Check both and explain who is right.",
        "o": [
          "Ana (142)",
          "Ben (152)",
          "Neither, it is 162",
          "Neither, it is 132"
        ],
        "a": 1,
        "e": "You regrouped a ten when adding, so Ben is right! The total is 152. Super adding! 👍",
        "d": "h"
      },
      {
        "t": "A garden has 143 flowers. A storm knocks down 67. The gardener plants 45 new ones. How many flowers are there now?",
        "o": [
          "131",
          "121",
          "111",
          "141"
        ],
        "a": 1,
        "e": "You took away some flowers, then added new ones. There are 121 flowers! Great! 🌸",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "Mia had 85 stickers and gave away 37. How many stickers does she have left?",
        "o": [
          "38",
          "48",
          "20",
          "80"
        ],
        "a": 1,
        "e": "'Gave away' means you subtract to find what's left. 85 - 37 = 48! Good job! ✨"
      },
      {
        "t": "There are 56 red apples and 78 green apples. How many apples are there in all?",
        "o": [
          "104",
          "134",
          "144",
          "90"
        ],
        "a": 1,
        "e": "To find the 'total,' you add all the parts together. 56 + 78 = 134! You got it! ✅"
      },
      {
        "t": "What does the word \"altogether\" usually mean in a math problem?",
        "o": [
          "Subtract",
          "Multiply",
          "Add",
          "Divide"
        ],
        "a": 2,
        "e": "'Altogether' and 'total' mean you add! You're a word problem pro! ➕"
      },
      {
        "t": "A team scored 72 points and another scored 85 points combined. How many points are there in all?",
        "o": [
          "140",
          "157",
          "167",
          "110"
        ],
        "a": 1,
        "e": "To 'combine' means to put things together. That means you add! 72 + 85 = 157. Super! ⭐"
      },
      {
        "t": "There are 165 crayons and 78 are broken. How many good crayons are there?",
        "o": [
          "97",
          "87",
          "50",
          "130"
        ],
        "a": 1,
        "e": "If some are 'broken,' you subtract to find what's left. 165 - 78 = 87! Nice! 👍"
      },
      {
        "t": "What does the question \"How many more?\" ask you to find?",
        "o": [
          "Add",
          "Subtract",
          "Multiply",
          "Cannot tell"
        ],
        "a": 1,
        "e": "'How many more?' means you subtract to find the difference. Great thinking! ➖"
      }
    ]
  }
];

export const unitQuiz: UnitQuiz = {
  "qBank": [
    {
      "t": "What is 47 + 36?",
      "o": [
        "56",
        "93",
        "83",
        "40"
      ],
      "a": 2,
      "e": "You added the ones and regrouped a ten! Remember to add it. The answer is 83! Correct! ✅",
      "d": "e"
    },
    {
      "t": "What is 58 + 27?",
      "o": [
        "70",
        "95",
        "50",
        "85"
      ],
      "a": 3,
      "e": "You added the ones and regrouped a ten! Remember to add it. The answer is 85! You got it! ✨",
      "d": "e"
    },
    {
      "t": "What is 73 − 28?",
      "o": [
        "45",
        "30",
        "55",
        "10"
      ],
      "a": 0,
      "e": "You regrouped a ten so you could subtract the ones. 45 is correct! Super job! 👍",
      "d": "m"
    },
    {
      "t": "What is 91 − 47?",
      "o": [
        "54",
        "30",
        "44",
        "80"
      ],
      "a": 2,
      "e": "You regrouped a ten so you could subtract the ones. 44 is correct! Great work! ⭐",
      "d": "m"
    },
    {
      "t": "What is 5 + 5 + 8?",
      "o": [
        "18",
        "11",
        "22",
        "25"
      ],
      "a": 0,
      "e": "You added numbers! Making 5+5=10 first helps you find 18. Smart adding! 🎉",
      "d": "e"
    },
    {
      "t": "What is 62 + 79?",
      "o": [
        "120",
        "151",
        "100",
        "141"
      ],
      "a": 3,
      "e": "You added the ones and regrouped a ten! Remember to add it. The answer is 141! Awesome! 🚀",
      "d": "e"
    },
    {
      "t": "What is 84 − 37?",
      "o": [
        "57",
        "20",
        "47",
        "90"
      ],
      "a": 2,
      "e": "You can't take 8 from 5! Regroup a ten to make 15 ones. Now subtract. The answer is 47! 🎉",
      "d": "m"
    },
    {
      "t": "What is 4 + 6 + 9?",
      "o": [
        "12",
        "24",
        "27",
        "19"
      ],
      "a": 3,
      "e": "It's easier to make a ten first! 4 + 6 = 10. Then add 9 more. You get 19! ✨",
      "d": "e"
    },
    {
      "t": "A student had 85 stickers and gave away 37. How many stickers are left?",
      "o": [
        "48",
        "38",
        "20",
        "80"
      ],
      "a": 0,
      "e": "You need more ones! Regroup a ten to make 14 ones. Now you can subtract. The answer is 48! 👍",
      "d": "h"
    },
    {
      "t": "What is 56 + 78?",
      "o": [
        "104",
        "144",
        "90",
        "134"
      ],
      "a": 3,
      "e": "When you add 5 + 9, you get 14 ones! Regroup 10 ones for 1 ten. Then add the tens. It's 134! ➕",
      "d": "e"
    },
    {
      "t": "What is 100 − 63?",
      "o": [
        "37",
        "47",
        "20",
        "80"
      ],
      "a": 0,
      "e": "To find 100 - 63, count up from 63 to 100. How many jumps? It's 37! 💯",
      "d": "h"
    },
    {
      "t": "What is 7 + 7 + 5?",
      "o": [
        "12",
        "25",
        "19",
        "27"
      ],
      "a": 2,
      "e": "Use your doubles fact! 7 + 7 = 14. Then add 5 more to get 19! Great job! 💪",
      "d": "m"
    },
    {
      "t": "What is 92 − 54?",
      "o": [
        "48",
        "38",
        "20",
        "80"
      ],
      "a": 1,
      "e": "You can't take 9 from 7! Regroup a ten to make 17 ones. Now subtract. The answer is 38! 🎉",
      "d": "m"
    },
    {
      "t": "What is 35 + 48?",
      "o": [
        "83",
        "56",
        "93",
        "40"
      ],
      "a": 0,
      "e": "When you add 7 + 6, you get 13 ones! Regroup 10 ones for 1 ten. Then add the tens. It's 83! ✨",
      "d": "e"
    },
    {
      "t": "What is the missing number? 67 + ___ = 100",
      "o": [
        "23",
        "50",
        "33",
        "60"
      ],
      "a": 2,
      "e": "To find 100 - 67, count up from 67 to 100. How many jumps? It's 33! 💯",
      "d": "h"
    },
    {
      "t": "What is 143 + 68?",
      "o": [
        "190",
        "221",
        "170",
        "211"
      ],
      "a": 3,
      "e": "Add the ones and regroup a ten. Add the tens and regroup a hundred. Then add the hundreds! It's 211! ✨",
      "d": "m"
    },
    {
      "t": "What is 76 − 49?",
      "o": [
        "37",
        "27",
        "10",
        "60"
      ],
      "a": 1,
      "e": "You need more ones! Regroup a ten to make 16 ones. Now you can subtract. The answer is 27! 🎉",
      "d": "m"
    },
    {
      "t": "What is 23 + 14 + 36?",
      "o": [
        "52",
        "86",
        "73",
        "41"
      ],
      "a": 2,
      "e": "When adding three numbers, you can add any two first. Then add the last one. The sum is 73! 👍",
      "d": "m"
    },
    {
      "t": "What is 145 + 37?",
      "o": [
        "162",
        "182",
        "192",
        "140"
      ],
      "a": 1,
      "e": "Add the ones and regroup a ten. Then add the tens, remembering your regrouped ten. It's 182! ✨",
      "d": "m"
    },
    {
      "t": "What is 200 − 76?",
      "o": [
        "124",
        "104",
        "134",
        "90"
      ],
      "a": 0,
      "e": "To find 200 - 76, count up from 76 to 200. How many jumps? It's 124! 💯",
      "d": "h"
    },
    {
      "t": "What is 19 + 13 + 7?",
      "o": [
        "26",
        "51",
        "63",
        "39"
      ],
      "a": 3,
      "e": "Add the first two numbers together. Then add the last number to your sum. The answer is 39! 💪",
      "d": "m"
    },
    {
      "t": "What is 178 − 94?",
      "o": [
        "94",
        "50",
        "130",
        "84"
      ],
      "a": 3,
      "e": "Subtract the ones. You need more tens! Regroup a hundred to make 10 tens. Now subtract. It's 84! 👍",
      "d": "h"
    },
    {
      "t": "What is 65 + 58?",
      "o": [
        "103",
        "133",
        "90",
        "123"
      ],
      "a": 3,
      "e": "When you add 7 + 6, you get 13 ones! Regroup 10 ones for 1 ten. Then add the tens. It's 123! ➕",
      "d": "e"
    },
    {
      "t": "What is 147 rounded to the nearest ten?",
      "o": [
        "130",
        "140",
        "150",
        "200"
      ],
      "a": 2,
      "e": "Look at the ones digit. Since 7 is 5 or more, it tells us to round up to the next ten. That's 150! ⬆️",
      "d": "h"
    },
    {
      "t": "What is 150 − 63?",
      "o": [
        "87",
        "97",
        "50",
        "130"
      ],
      "a": 0,
      "e": "To find 150 - 63, count up from 63 to 150. How many jumps? It's 87! 💯",
      "d": "h"
    },
    {
      "t": "What is 85 + 72?",
      "o": [
        "140",
        "157",
        "167",
        "100"
      ],
      "a": 1,
      "e": "Add the ones. Then add the tens and regroup a hundred. Don't forget to add the hundreds! It's 157! ✨",
      "d": "e"
    },
    {
      "t": "What is 42 + 39?",
      "o": [
        "70",
        "91",
        "81",
        "50"
      ],
      "a": 2,
      "e": "2 ones + 9 ones is 11 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! 42 + 39 = 81! ✨",
      "d": "e"
    },
    {
      "t": "What is 165 − 78?",
      "o": [
        "97",
        "87",
        "50",
        "130"
      ],
      "a": 1,
      "e": "Taking 78 from 165 finds the difference. It's like finding how much more 165 is! The answer is 87! 👍",
      "d": "h"
    },
    {
      "t": "What is 99 − 45?",
      "o": [
        "44",
        "54",
        "30",
        "80"
      ],
      "a": 1,
      "e": "To find how many are left when you take 45 from 99, you subtract! The difference is 54! You got it! 🎉",
      "d": "h"
    },
    {
      "t": "What is the best estimate for 48 + 53?",
      "o": [
        "90",
        "100",
        "110",
        "80"
      ],
      "a": 1,
      "e": "Putting two groups of 50 together makes 100! You made a whole hundred. That's awesome! 💯",
      "d": "h"
    }
  ]
};

export const testBank: Question[] = [
  {
    "t": "What is 34 + 25?",
    "o": [
      "42",
      "69",
      "59",
      "85"
    ],
    "a": 2,
    "e": "4 ones + 5 ones = 9 ones. No regrouping needed because 9 is less than 10! Then add the tens. 34 + 25 = 59! ✅",
    "d": "e"
  },
  {
    "t": "What is 47 + 36?",
    "o": [
      "83",
      "56",
      "93",
      "40"
    ],
    "a": 0,
    "e": "7 ones + 6 ones is 13 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 83! ⭐",
    "d": "e"
  },
  {
    "t": "What is 58 + 27?",
    "o": [
      "70",
      "95",
      "50",
      "85"
    ],
    "a": 3,
    "e": "8 ones + 7 ones is 15 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 85! ✨",
    "d": "e"
  },
  {
    "t": "What is 39 + 45?",
    "o": [
      "64",
      "94",
      "84",
      "50"
    ],
    "a": 2,
    "e": "9 ones + 5 ones is 14 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 84! 🚀",
    "d": "e"
  },
  {
    "t": "What is 62 + 79?",
    "o": [
      "141",
      "120",
      "151",
      "100"
    ],
    "a": 0,
    "e": "2 ones + 9 ones is 11 ones. Regroup 10 ones for 1 ten. Then add the tens! 6 + 7 + 1 = 14 tens! That's 141! 💡",
    "d": "e"
  },
  {
    "t": "What is 55 + 38?",
    "o": [
      "40",
      "83",
      "93",
      "150"
    ],
    "a": 2,
    "e": "5 ones + 8 ones is 13 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 93! 🧠",
    "d": "e"
  },
  {
    "t": "What is 46 + 54?",
    "o": [
      "90",
      "100",
      "91",
      "101"
    ],
    "a": 1,
    "e": "6 ones + 4 ones = 10 ones. Regroup 10 ones for 1 ten. Then add the tens! 4 + 5 + 1 = 10 tens! That's 100! 🤩",
    "d": "e"
  },
  {
    "t": "What is 73 + 19?",
    "o": [
      "92",
      "75",
      "102",
      "60"
    ],
    "a": 0,
    "e": "3 ones + 9 ones is 12 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 92! 👍",
    "d": "e"
  },
  {
    "t": "What is 28 + 65?",
    "o": [
      "50",
      "140",
      "93",
      "82"
    ],
    "a": 2,
    "e": "8 ones + 5 ones is 13 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 93! 🌟",
    "d": "e"
  },
  {
    "t": "What is 57 + 34?",
    "o": [
      "71",
      "45",
      "130",
      "91"
    ],
    "a": 3,
    "e": "7 ones + 4 ones is 11 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 91! 👏",
    "d": "e"
  },
  {
    "t": "What does REGROUP mean?",
    "o": [
      "Regroup 10 ones as 1 ten",
      "Start over",
      "Subtract instead",
      "Skip to next"
    ],
    "a": 0,
    "e": "Regrouping means trading 10 ones for 1 ten, or 10 tens for 1 hundred. It helps us add and subtract! 💡",
    "d": "e"
  },
  {
    "t": "What is 66 + 27?",
    "o": [
      "50",
      "93",
      "83",
      "145"
    ],
    "a": 1,
    "e": "6 ones + 7 ones is 13 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 93! 🥳",
    "d": "e"
  },
  {
    "t": "What is 45 + 48?",
    "o": [
      "78",
      "83",
      "140",
      "93"
    ],
    "a": 3,
    "e": "5 ones + 8 ones is 13 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 93! 🤩",
    "d": "e"
  },
  {
    "t": "What is 83 + 9?",
    "o": [
      "80",
      "102",
      "92",
      "65"
    ],
    "a": 2,
    "e": "3 ones + 9 ones is 12 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 92! 🎉",
    "d": "e"
  },
  {
    "t": "What is 37 + 46?",
    "o": [
      "56",
      "83",
      "93",
      "40"
    ],
    "a": 1,
    "e": "7 ones + 6 ones is 13 ones. We regroup 10 ones to make 1 new ten. Then add all the tens! The answer is 83! ✨",
    "d": "e"
  },
  {
    "t": "When do you regroup in addition?",
    "o": [
      "When ones column is 10+",
      "Always",
      "When tens column is 10+",
      "Never"
    ],
    "a": 0,
    "e": "You regroup when you have 10 or more ones because 10 ones make 1 ten! You trade them to the tens column. Smart! 🧠",
    "d": "e"
  },
  {
    "t": "What is 54 + 37?",
    "o": [
      "80",
      "45",
      "140",
      "91"
    ],
    "a": 3,
    "e": "4+7 makes 11 ones! That's 1 one and 1 new ten. Write 1, regroup the 1 ten. Add the tens: 5+3+1=9. So, 54+37=91! ✨",
    "d": "e"
  },
  {
    "t": "What is 68 + 25?",
    "o": [
      "78",
      "83",
      "93",
      "150"
    ],
    "a": 2,
    "e": "8+5 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 6+2+1=9. So, 68+25=93! 🎉",
    "d": "e"
  },
  {
    "t": "What is 75 + 16?",
    "o": [
      "80",
      "55",
      "130",
      "91"
    ],
    "a": 3,
    "e": "5+6 makes 11 ones! That's 1 one and 1 new ten. Write 1, regroup the 1 ten. Add the tens: 7+1+1=9. So, 75+16=91! 👍",
    "d": "e"
  },
  {
    "t": "What is 49 + 44?",
    "o": [
      "77",
      "93",
      "83",
      "150"
    ],
    "a": 1,
    "e": "9+4 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 4+4+1=9. So, 49+44=93! 😊",
    "d": "e"
  },
  {
    "t": "Which addition problem requires regrouping?",
    "o": [
      "31+24",
      "42+37",
      "56+38",
      "61+15"
    ],
    "a": 2,
    "e": "6+8 makes 14 ones! That's 4 ones and 1 new ten. Write 4, regroup the 1 ten. Add the tens: 5+3+1=9. So, 56+38=94! ✅",
    "d": "e"
  },
  {
    "t": "What is 86 + 7?",
    "o": [
      "79",
      "93",
      "83",
      "150"
    ],
    "a": 1,
    "e": "6+7 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 8+0+1=9. So, 86+7=93! 🌟",
    "d": "e"
  },
  {
    "t": "What is 23 + 79?",
    "o": [
      "102",
      "92",
      "80",
      "60"
    ],
    "a": 0,
    "e": "3+9 makes 12 ones! That's 2 ones and 1 new ten. Write 2, regroup the 1 ten. Add the tens: 2+7+1=10. So, 23+79=102! 💯",
    "d": "e"
  },
  {
    "t": "What is 64 + 27?",
    "o": [
      "80",
      "55",
      "91",
      "130"
    ],
    "a": 2,
    "e": "4+7 makes 11 ones! That's 1 one and 1 new ten. Write 1, regroup the 1 ten. Add the tens: 6+2+1=9. So, 64+27=91! ➕",
    "d": "e"
  },
  {
    "t": "What is 78 + 16?",
    "o": [
      "84",
      "60",
      "130",
      "94"
    ],
    "a": 3,
    "e": "8+6 makes 14 ones! That's 4 ones and 1 new ten. Write 4, regroup the 1 ten. Add the tens: 7+1+1=9. So, 78+16=94! 😄",
    "d": "e"
  },
  {
    "t": "What is 35 + 58?",
    "o": [
      "70",
      "93",
      "83",
      "140"
    ],
    "a": 1,
    "e": "5+8 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 3+5+1=9. So, 35+58=93! 🥳",
    "d": "e"
  },
  {
    "t": "Add ones first, then tens. In 47 + 36, what is 7 + 6?",
    "o": [
      "11",
      "12",
      "13",
      "14"
    ],
    "a": 2,
    "e": "7+6 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 2+3+1=6. So, 27+36=63! 💡",
    "d": "h"
  },
  {
    "t": "What is 94 + 7?",
    "o": [
      "101",
      "90",
      "111",
      "75"
    ],
    "a": 0,
    "e": "4+7 makes 11 ones! That's 1 one and 1 new ten. Write 1, regroup the 1 ten. Add the tens: 9+0+1=10. So, 94+7=101! 👏",
    "d": "e"
  },
  {
    "t": "What is 26 + 37?",
    "o": [
      "50",
      "73",
      "40",
      "63"
    ],
    "a": 3,
    "e": "6+7 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 2+3+1=6. So, 26+37=63! 👍",
    "d": "e"
  },
  {
    "t": "What is 88 + 5?",
    "o": [
      "79",
      "93",
      "83",
      "150"
    ],
    "a": 1,
    "e": "8+5 makes 13 ones! That's 3 ones and 1 new ten. Write 3, regroup the 1 ten. Add the tens: 8+0+1=9. So, 88+5=93! 😄",
    "d": "e"
  },
  {
    "t": "What is 73 − 28?",
    "o": [
      "45",
      "30",
      "55",
      "10"
    ],
    "a": 0,
    "e": "We can't take 8 from 3 ones! Regroup 1 ten to make 13 ones. Now, 13-8=5. Then, 6 tens - 2 tens = 4 tens. So, 73-28=45! ➖",
    "d": "m"
  },
  {
    "t": "What is 91 − 47?",
    "o": [
      "44",
      "54",
      "30",
      "80"
    ],
    "a": 0,
    "e": "We can't take 7 from 1 one! Regroup 1 ten to make 11 ones. Now, 11-7=4. Then, 8 tens - 4 tens = 4 tens. So, 91-47=44! ✨",
    "d": "m"
  },
  {
    "t": "What is 84 − 37?",
    "o": [
      "47",
      "57",
      "20",
      "90"
    ],
    "a": 0,
    "e": "We can't take 7 from 4 ones! Regroup 1 ten to make 14 ones. Now, 14-7=7. Then, 7 tens - 3 tens = 4 tens. So, 84-37=47! 👍",
    "d": "m"
  },
  {
    "t": "What is 62 − 45?",
    "o": [
      "17",
      "30",
      "27",
      "5"
    ],
    "a": 0,
    "e": "We can't take 5 from 2 ones! Regroup 1 ten to make 12 ones. Now, 12-5=7. Then, 5 tens - 4 tens = 1 ten. So, 62-45=17! ✅",
    "d": "m"
  },
  {
    "t": "What is 50 − 23?",
    "o": [
      "27",
      "37",
      "10",
      "60"
    ],
    "a": 0,
    "e": "We can't take 3 from 0 ones! Regroup 1 ten to make 10 ones. Now, 10-3=7. Then, 4 tens - 2 tens = 2 tens. So, 50-23=27! 🤩",
    "d": "m"
  },
  {
    "t": "What is 76 − 39?",
    "o": [
      "37",
      "47",
      "20",
      "80"
    ],
    "a": 0,
    "e": "We can't take 9 from 6 ones! Regroup 1 ten to make 16 ones. Now, 16-9=7. Then, 6 tens - 3 tens = 3 tens. So, 76-39=37! 🎉",
    "d": "m"
  },
  {
    "t": "What is 83 − 56?",
    "o": [
      "27",
      "37",
      "10",
      "60"
    ],
    "a": 0,
    "e": "We regrouped a ten to make 13 ones, because we needed more ones! 13-6=7. Then 7-5=2. So, the answer is 27! Great job! 🎉",
    "d": "m"
  },
  {
    "t": "What is 95 − 48?",
    "o": [
      "57",
      "20",
      "47",
      "90"
    ],
    "a": 2,
    "e": "We regrouped a ten to get 15 ones, because 5 is too small for 8! 15-8=7. Then 8-4=4. The answer is 47! You got it! ✨",
    "d": "m"
  },
  {
    "t": "What is 64 − 28?",
    "o": [
      "46",
      "10",
      "36",
      "70"
    ],
    "a": 2,
    "e": "We regrouped a ten to make 14 ones, as we needed more ones to subtract! 14-8=6. Then 5-2=3. The answer is 36! Keep it up! 👏",
    "d": "m"
  },
  {
    "t": "What is 71 − 35?",
    "o": [
      "46",
      "10",
      "36",
      "70"
    ],
    "a": 2,
    "e": "We regrouped a ten to make 11 ones, so we had enough to subtract 5! 11-5=6. Then 6-3=3. The answer is 36! Well done! ⭐",
    "d": "m"
  },
  {
    "t": "When do you REGROUP in subtraction?",
    "o": [
      "Always",
      "When numbers are large",
      "When top ones digit is smaller",
      "Never"
    ],
    "a": 2,
    "e": "We regroup when we don't have enough ones to subtract. We take a ten and turn it into 10 ones! Smart! 💡",
    "d": "e"
  },
  {
    "t": "What is 85 − 47?",
    "o": [
      "48",
      "20",
      "38",
      "70"
    ],
    "a": 2,
    "e": "We regrouped a ten to make 15 ones, so we could subtract 7! 15-7=8. Then 7-4=3. The answer is 38! Fantastic! 🥳",
    "d": "m"
  },
  {
    "t": "What is 52 − 27?",
    "o": [
      "35",
      "10",
      "25",
      "60"
    ],
    "a": 2,
    "e": "We regrouped a ten to make 12 ones, because we needed more ones to subtract! 12-7=5. Then 4-2=2. The answer is 25! Super work! 💪",
    "d": "m"
  },
  {
    "t": "What is 90 − 34?",
    "o": [
      "66",
      "20",
      "56",
      "100"
    ],
    "a": 2,
    "e": "We regrouped a ten to make 10 ones, so we had enough to subtract 4! 10-4=6. Then 8-3=5. The answer is 56! You're a math whiz! 🧠",
    "d": "m"
  },
  {
    "t": "What is 67 − 29?",
    "o": [
      "48",
      "20",
      "80",
      "38"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 17 ones, because we needed more ones to subtract! 17-9=8. Then 5-2=3. The answer is 38! Awesome job! 🤩",
    "d": "m"
  },
  {
    "t": "Which subtraction problem requires regrouping (regrouping)?",
    "o": [
      "75-32",
      "84-21",
      "63-47",
      "51-20"
    ],
    "a": 2,
    "e": "For 63-47, we need more ones! We regroup a ten from 60 to make 13 ones. 13-7=6. Then 5-4=1. The answer is 16! You got this! 👍",
    "d": "e"
  },
  {
    "t": "What is 78 − 53?",
    "o": [
      "35",
      "10",
      "60",
      "25"
    ],
    "a": 3,
    "e": "No regroup needed here! We have enough ones to subtract. 8-3=5. Then 7-5=2. The answer is 25! Easy peasy! 😄",
    "d": "m"
  },
  {
    "t": "What is 86 − 58?",
    "o": [
      "38",
      "10",
      "60",
      "28"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 16 ones, so we could subtract 8! 16-8=8. Then 7-5=2. The answer is 28! Fantastic work! 🥳",
    "d": "m"
  },
  {
    "t": "What is 74 − 36?",
    "o": [
      "48",
      "20",
      "80",
      "38"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 14 ones, because we needed more ones to subtract! 14-6=8. Then 6-3=3. The answer is 38! You're a star! ⭐",
    "d": "m"
  },
  {
    "t": "What is 93 − 67?",
    "o": [
      "36",
      "10",
      "60",
      "26"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 13 ones, so we had enough to subtract 7! 13-7=6. Then 8-6=2. The answer is 26! Keep shining! ✨",
    "d": "m"
  },
  {
    "t": "What is 60 − 42?",
    "o": [
      "28",
      "5",
      "50",
      "18"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 10 ones, because we needed more ones to subtract! 10-2=8. Then 5-4=1. The answer is 18! Amazing job! 🚀",
    "d": "m"
  },
  {
    "t": "What is 55 − 28?",
    "o": [
      "37",
      "10",
      "60",
      "27"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 15 ones, so we could subtract 8! 15-8=7. Then 4-2=2. The answer is 27! You're so smart! 🤓",
    "d": "m"
  },
  {
    "t": "What is 81 − 44?",
    "o": [
      "47",
      "10",
      "70",
      "37"
    ],
    "a": 3,
    "e": "We regrouped a ten to make 11 ones, because we needed more ones to subtract! 11-4=7. Then 7-4=3. The answer is 37! Brilliant! 🌟",
    "d": "m"
  },
  {
    "t": "What is 70 − 36?",
    "o": [
      "44",
      "34",
      "10",
      "60"
    ],
    "a": 1,
    "e": "We regrouped a ten to make 10 ones, so we had enough to subtract 6! 10-6=4. Then 6-3=3. The answer is 34! Way to go! 🎉",
    "d": "m"
  },
  {
    "t": "What is 96 − 49?",
    "o": [
      "57",
      "47",
      "20",
      "90"
    ],
    "a": 1,
    "e": "We regrouped a ten to make 16 ones, because we needed more ones to subtract! 16-9=7. Then 8-4=4. The answer is 47! You're a pro! 🏆",
    "d": "m"
  },
  {
    "t": "What is 43 − 18?",
    "o": [
      "35",
      "25",
      "10",
      "60"
    ],
    "a": 1,
    "e": "We regrouped a ten to make 13 ones, so we could subtract 8! 13-8=5. Then 3-1=2. The answer is 25! Excellent work! 💯",
    "d": "e"
  },
  {
    "t": "What is 82 − 65?",
    "o": [
      "27",
      "17",
      "5",
      "50"
    ],
    "a": 1,
    "e": "We regroup a ten to make 12 ones because 2 is less than 5. 12 - 5 = 7. 7 tens - 6 tens = 1 ten. The answer is 17! ✨",
    "d": "m"
  },
  {
    "t": "What is 77 − 38?",
    "o": [
      "49",
      "39",
      "20",
      "80"
    ],
    "a": 1,
    "e": "We regroup a ten to make 17 ones because 7 is less than 8. 17 - 8 = 9. 6 tens - 3 tens = 3 tens. So, 39! 🚀",
    "d": "m"
  },
  {
    "t": "What is 61 − 27?",
    "o": [
      "44",
      "34",
      "10",
      "70"
    ],
    "a": 1,
    "e": "We regroup a ten to make 11 ones because 1 is less than 7. 11 - 7 = 4. 5 tens - 2 tens = 3 tens. So, 34! 🎉",
    "d": "m"
  },
  {
    "t": "What is 54 − 19?",
    "o": [
      "45",
      "35",
      "10",
      "65"
    ],
    "a": 1,
    "e": "We regroup a ten to make 14 ones because 4 is less than 9. 14 - 9 = 5. 4 tens - 1 ten = 3 tens. So, 35! 👍",
    "d": "m"
  },
  {
    "t": "What is 5 + 5 + 8?",
    "o": [
      "18",
      "11",
      "22",
      "25"
    ],
    "a": 0,
    "e": "Making a ten helps you add faster! 5 + 5 = 10. Then add 8 more: 10 + 8 = 18. The answer is 18! 😄",
    "d": "e"
  },
  {
    "t": "What is 4 + 6 + 9?",
    "o": [
      "12",
      "24",
      "27",
      "19"
    ],
    "a": 3,
    "e": "Making a ten makes adding easy! 4 + 6 = 10. Then add 9 more: 10 + 9 = 19. The answer is 19! ✨",
    "d": "e"
  },
  {
    "t": "What is 7 + 7 + 5?",
    "o": [
      "19",
      "12",
      "25",
      "27"
    ],
    "a": 0,
    "e": "Using doubles helps you add! 7 + 7 = 14. Then add 5 more: 14 + 5 = 19. The answer is 19! 🌟",
    "d": "e"
  },
  {
    "t": "What is 3 + 7 + 8?",
    "o": [
      "11",
      "23",
      "26",
      "18"
    ],
    "a": 3,
    "e": "Making a ten makes adding easy! 3 + 7 = 10. Then 10 + 8 = 18. The answer is 18! 🥳",
    "d": "e"
  },
  {
    "t": "What is 6 + 4 + 12?",
    "o": [
      "14",
      "22",
      "28",
      "31"
    ],
    "a": 1,
    "e": "Making a ten helps you add faster! 6 + 4 = 10. Then add 12 more: 10 + 12 = 22. The answer is 22! 👍",
    "d": "e"
  },
  {
    "t": "What is 8 + 2 + 7?",
    "o": [
      "17",
      "10",
      "22",
      "25"
    ],
    "a": 0,
    "e": "Making a ten makes adding easy! 8 + 2 = 10. Then 10 + 7 = 17. The answer is 17! 🤩",
    "d": "e"
  },
  {
    "t": "What is 9 + 9 + 4?",
    "o": [
      "22",
      "14",
      "28",
      "31"
    ],
    "a": 0,
    "e": "Using doubles helps you add! 9 + 9 = 18. Then add 4 more: 18 + 4 = 22. The answer is 22! 🧠",
    "d": "e"
  },
  {
    "t": "What is 5 + 6 + 5?",
    "o": [
      "9",
      "16",
      "21",
      "24"
    ],
    "a": 1,
    "e": "Making a ten helps you add faster! 5 + 5 = 10. Then add 6 more: 10 + 6 = 16. The answer is 16! ⭐",
    "d": "e"
  },
  {
    "t": "What is 3 + 8 + 7?",
    "o": [
      "11",
      "23",
      "26",
      "18"
    ],
    "a": 3,
    "e": "Making a ten makes adding easy! 3 + 7 = 10. Then 10 + 8 = 18. The answer is 18! 🥳",
    "d": "e"
  },
  {
    "t": "What is 6 + 6 + 9?",
    "o": [
      "13",
      "21",
      "27",
      "30"
    ],
    "a": 1,
    "e": "Using doubles helps you add! 6 + 6 = 12. Then add 9 more: 12 + 9 = 21. The answer is 21! ✨",
    "d": "e"
  },
  {
    "t": "What is 2 + 8 + 14?",
    "o": [
      "16",
      "24",
      "31",
      "38"
    ],
    "a": 1,
    "e": "Making a ten helps you add faster! 2 + 8 = 10. Then add 14 more: 10 + 14 = 24. The answer is 24! 💡",
    "d": "m"
  },
  {
    "t": "What is 4 + 4 + 9?",
    "o": [
      "10",
      "17",
      "22",
      "25"
    ],
    "a": 1,
    "e": "Using doubles helps you add! 4 + 4 = 8. Then add 9 more: 8 + 9 = 17. The answer is 17! 🎉",
    "d": "m"
  },
  {
    "t": "What is 7 + 3 + 15?",
    "o": [
      "15",
      "31",
      "34",
      "25"
    ],
    "a": 3,
    "e": "Making a ten makes adding easy! 7 + 3 = 10. Then 10 + 15 = 25. The answer is 25! 👏",
    "d": "m"
  },
  {
    "t": "What is 8 + 8 + 6?",
    "o": [
      "13",
      "22",
      "27",
      "31"
    ],
    "a": 1,
    "e": "Using doubles helps you add! 8 + 8 = 16. Then add 6 more: 16 + 6 = 22. The answer is 22! 😎",
    "d": "m"
  },
  {
    "t": "What is 5 + 5 + 12?",
    "o": [
      "13",
      "28",
      "22",
      "31"
    ],
    "a": 2,
    "e": "Making a ten helps you add faster! 5 + 5 = 10. Then add 12 more: 10 + 12 = 22. The answer is 22! 👍",
    "d": "m"
  },
  {
    "t": "In 2 + 9 + 8, which pair should you add first to make a ten?",
    "o": [
      "2+8",
      "2+9",
      "9+8",
      "9+2"
    ],
    "a": 0,
    "e": "Making a ten makes adding easy! 2 + 8 = 10. The answer is 10! 🥳",
    "d": "m"
  },
  {
    "t": "In 5 + 7 + 5, which pair should you add first?",
    "o": [
      "5+5",
      "5+7",
      "7+5",
      "7+7"
    ],
    "a": 0,
    "e": "Knowing 5 + 5 = 10 helps you add doubles super fast! The answer is 10. 👍",
    "d": "m"
  },
  {
    "t": "What is 9 + 1 + 16?",
    "o": [
      "15",
      "31",
      "26",
      "34"
    ],
    "a": 2,
    "e": "It's easier to add when you make a ten! 9 + 1 = 10, then add 16 more to get 26. Great! ➕",
    "d": "m"
  },
  {
    "t": "What is 6 + 4 + 18?",
    "o": [
      "17",
      "33",
      "36",
      "28"
    ],
    "a": 3,
    "e": "Making a ten helps you add! 6 + 4 = 10, then add 18 more. The total is 28. Super work! 🔟",
    "d": "m"
  },
  {
    "t": "What is 3 + 3 + 14?",
    "o": [
      "11",
      "20",
      "25",
      "29"
    ],
    "a": 1,
    "e": "Use your doubles! 3 + 3 = 6. Then add 14 more to find the total: 20. Awesome! ✨",
    "d": "m"
  },
  {
    "t": "What is 7 + 7 + 9?",
    "o": [
      "13",
      "28",
      "32",
      "23"
    ],
    "a": 3,
    "e": "Doubles help you start! 7 + 7 = 14. Add 9 more to get 23. You're a math star! ⭐",
    "d": "m"
  },
  {
    "t": "What is 4 + 6 + 7?",
    "o": [
      "9",
      "22",
      "25",
      "17"
    ],
    "a": 3,
    "e": "Make a ten to add easily! 4 + 6 = 10. Then add 7 more. The total is 17. Fantastic! 🚀",
    "d": "m"
  },
  {
    "t": "What is 8 + 2 + 9?",
    "o": [
      "11",
      "24",
      "19",
      "27"
    ],
    "a": 2,
    "e": "Making a ten makes adding simple! 8 + 2 = 10. Add 9 more to get 19. Way to go! 🥳",
    "d": "m"
  },
  {
    "t": "What is 5 + 5 + 5?",
    "o": [
      "8",
      "20",
      "15",
      "23"
    ],
    "a": 2,
    "e": "Start with your doubles! 5 + 5 = 10. Then add 5 more to find 15. You're so smart! 🧠",
    "d": "e"
  },
  {
    "t": "Is it true that you can add 3 numbers in any order?",
    "o": [
      "True",
      "False",
      "Sometimes",
      "Never"
    ],
    "a": 0,
    "e": "The order of numbers doesn't change the total! 3+5 is the same as 5+3. That's a math rule! 😄",
    "d": "e"
  },
  {
    "t": "What is 6 + 6 + 6?",
    "o": [
      "10",
      "23",
      "18",
      "26"
    ],
    "a": 2,
    "e": "Doubles help you add! 6 + 6 = 12. Then add 6 more to get 18. You're doing great! 👍",
    "d": "m"
  },
  {
    "t": "What is 3 + 9 + 7?",
    "o": [
      "11",
      "24",
      "19",
      "27"
    ],
    "a": 2,
    "e": "Make a ten to add easily! 3 + 7 = 10. Then add 9 more. The total is 19. Good work! 😊",
    "d": "m"
  },
  {
    "t": "What is 4 + 8 + 8?",
    "o": [
      "12",
      "25",
      "20",
      "29"
    ],
    "a": 2,
    "e": "Doubles help you start! 8 + 8 = 16. Add 4 more to find the total: 20. You rock! 🤘",
    "d": "m"
  },
  {
    "t": "What is 1 + 9 + 18?",
    "o": [
      "17",
      "34",
      "28",
      "36"
    ],
    "a": 2,
    "e": "Making a ten makes adding simple! 1 + 9 = 10. Add 18 more to get 28. Excellent! 💯",
    "d": "m"
  },
  {
    "t": "What is 5 + 8 + 5?",
    "o": [
      "10",
      "23",
      "18",
      "26"
    ],
    "a": 2,
    "e": "Doubles help you add! 5 + 5 = 10. Then add 8 more. The total is 18. So close to 20! 👍",
    "d": "m"
  },
  {
    "t": "Tom had 45 stickers and got 38 more. How many does he have in all?",
    "o": [
      "83",
      "56",
      "93",
      "40"
    ],
    "a": 0,
    "e": "'Got more' means add! Add ones (5+8=13), regroup. Add tens (4+3+1=8). So, 45+38=83! Great adding! ➕",
    "d": "h"
  },
  {
    "t": "There were 92 birds in a tree and 47 flew away. How many are left?",
    "o": [
      "45",
      "25",
      "55",
      "10"
    ],
    "a": 0,
    "e": "'Flew away' means subtract! Regroup to subtract 2-7. Then subtract tens. 92 - 47 = 45. Good thinking! ➖",
    "d": "h"
  },
  {
    "t": "Sam has 67 cards and Ana has 85. How many more cards does Ana have?",
    "o": [
      "18",
      "8",
      "30",
      "50"
    ],
    "a": 0,
    "e": "'How many more' means subtract! Regroup to subtract 5-7. Subtract tens. 85 - 67 = 18. You did it! 🎉",
    "d": "h"
  },
  {
    "t": "What does the word \"altogether\" tell you to do?",
    "o": [
      "Subtract",
      "Multiply",
      "Add",
      "Divide"
    ],
    "a": 2,
    "e": "'Altogether' tells us to add! You're finding the total. Great job finding the keywords! ➕",
    "d": "e"
  },
  {
    "t": "Lily had 143 coins and gave away 68. How many coins does she have left?",
    "o": [
      "75",
      "55",
      "85",
      "30"
    ],
    "a": 0,
    "e": "'Gave away' means subtract! Regroup twice to find 143 - 68 = 75. You're so good at this! ➖",
    "d": "h"
  },
  {
    "t": "There are 56 red apples and 78 green apples. How many apples are there in all?",
    "o": [
      "134",
      "104",
      "144",
      "90"
    ],
    "a": 0,
    "e": "'Total' means add! Add ones (6+8=14), regroup. Add tens (5+7+1=13). So, 56+78=134! Great! 👍",
    "d": "h"
  },
  {
    "t": "There are 165 crayons and 78 are broken. How many good crayons are there?",
    "o": [
      "87",
      "97",
      "50",
      "130"
    ],
    "a": 0,
    "e": "\"Broken\" means some are gone! We subtract to find the difference. 165 - 78 = 87. You did great! ➖",
    "d": "h"
  },
  {
    "t": "What does the phrase \"how many left\" tell you to do?",
    "o": [
      "Subtract",
      "Add",
      "Multiply",
      "Count up"
    ],
    "a": 0,
    "e": "\"Left\" means how many are still there after some are taken away. We subtract to find out! Great thinking! 🖐️",
    "d": "e"
  },
  {
    "t": "There are 82 students in one class and 59 in another. How many students are there combined?",
    "o": [
      "120",
      "151",
      "141",
      "100"
    ],
    "a": 2,
    "e": "\"Combine\" means putting things together! We add to find the total. 82 + 59 = 141. Super job! ➕",
    "d": "h"
  },
  {
    "t": "What is the first step when solving a word problem?",
    "o": [
      "Guess the answer",
      "Write numbers first",
      "Read carefully",
      "Add everything"
    ],
    "a": 2,
    "e": "Always read carefully! It helps you know if you add or subtract. You can do it! 🤔",
    "d": "e"
  },
  {
    "t": "What is 43 + 35?",
    "o": [
      "68",
      "88",
      "78",
      "79"
    ],
    "a": 2,
    "e": "We add ones with ones (3+5=8) and tens with tens (40+30=70). Then we combine them! 70+8=78. Awesome! 🎉",
    "d": "e"
  },
  {
    "t": "What is 86 - 52?",
    "o": [
      "44",
      "34",
      "24",
      "33"
    ],
    "a": 1,
    "e": "We subtract ones from ones (6-2=4) and tens from tens (80-50=30). Then we combine them! 30+4=34. Super! ✨",
    "d": "e"
  },
  {
    "t": "What is 7 + 3 + 5?",
    "o": [
      "14",
      "15",
      "16",
      "13"
    ],
    "a": 1,
    "e": "Making a ten helps us add fast! We know 7 + 3 = 10. Then 10 + 5 = 15. You're a math whiz! 🔟",
    "d": "m"
  },
  {
    "t": "A bag has 61 marbles. 20 are removed. How many are left?",
    "o": [
      "51",
      "41",
      "31",
      "40"
    ],
    "a": 1,
    "e": "When subtracting tens, the ones stay the same! 6 tens - 2 tens = 4 tens. So, 61 - 20 = 41. Smart! 💡",
    "d": "h"
  },
  {
    "t": "What is 72 + 16?",
    "o": [
      "78",
      "98",
      "88",
      "86"
    ],
    "a": 2,
    "e": "We add ones with ones (2+6=8) and tens with tens (70+10=80). Then we combine them! 80+8=88. You got it! ✅",
    "d": "e"
  },
  {
    "t": "What is 95 - 43?",
    "o": [
      "62",
      "52",
      "42",
      "51"
    ],
    "a": 1,
    "e": "We subtract ones from ones (5-3=2) and tens from tens (90-40=50). Then we combine them! 50+2=52. Well done! 👍",
    "d": "e"
  },
  {
    "t": "What is 8 + 2 + 4?",
    "o": [
      "12",
      "13",
      "14",
      "15"
    ],
    "a": 2,
    "e": "Making a ten helps us add fast! We know 8 + 2 = 10. Then 10 + 4 = 14. Super adding! 💯",
    "d": "m"
  },
  {
    "t": "There are 54 apples and 33 oranges. How many fruits in all?",
    "o": [
      "77",
      "97",
      "87",
      "88"
    ],
    "a": 2,
    "e": "We add ones with ones (4+3=7) and tens with tens (50+30=80). Then we combine them! 80+7=87. Awesome! 🤩",
    "d": "m"
  },
  {
    "t": "What is 148 - 36?",
    "o": [
      "102",
      "122",
      "112",
      "132"
    ],
    "a": 2,
    "e": "We subtract ones from ones (8-6=2) and tens from tens (140-30=110). Then we combine them! 110+2=112. Yes! ✨",
    "d": "m"
  },
  {
    "t": "Which is the correct answer for 37 + 52?",
    "o": [
      "79",
      "99",
      "89",
      "88"
    ],
    "a": 2,
    "e": "We add ones with ones (7+2=9) and tens with tens (30+50=80). Then we combine them! 80+9=89. Nicely done! 👍",
    "d": "h"
  },
  {
    "t": "What is 20 + 30 + 40?",
    "o": [
      "80",
      "90",
      "100",
      "70"
    ],
    "a": 1,
    "e": "When adding tens, think of adding the numbers first! 2+3=5, so 20+30=50. Then 50+40=90. Keep it up! 🚀",
    "d": "m"
  },
  {
    "t": "A class has 76 books. 44 are checked out. How many are on the shelf?",
    "o": [
      "42",
      "32",
      "22",
      "33"
    ],
    "a": 1,
    "e": "We subtract ones from ones (6-4=2) and tens from tens (70-40=30). Then we combine them! 30+2=32. Fantastic! ⭐",
    "d": "h"
  },
  {
    "t": "What is 65 + 24?",
    "o": [
      "79",
      "99",
      "89",
      "88"
    ],
    "a": 2,
    "e": "We add ones with ones (5+4=9) and tens with tens (60+20=80). Then we combine them! 80+9=89. Amazing! 🥳",
    "d": "e"
  },
  {
    "t": "Sam has 48 stickers. He gets 31 more. How many does he have?",
    "o": [
      "69",
      "89",
      "79",
      "77"
    ],
    "a": 2,
    "e": "We add ones with ones (8+1=9) and tens with tens (40+30=70). Then we combine them! 70+9=79. You're a star! ✨",
    "d": "h"
  },
  {
    "t": "Which difference is greater: 67 - 23 or 58 - 15?",
    "o": [
      "67 - 23",
      "58 - 15",
      "They are the same",
      "Cannot tell"
    ],
    "a": 0,
    "e": "We solve both problems: 67-23=44 and 58-15=43. Then we compare! 44 is greater than 43. Good job! 😄",
    "d": "h"
  },
  {
    "t": "What is 6 + 4 + 9?",
    "o": [
      "17",
      "18",
      "19",
      "20"
    ],
    "a": 2,
    "e": "Making a ten helps us add fast! We know 6 + 4 = 10. Then 10 + 9 = 19. Super smart! 🧠",
    "d": "m"
  },
  {
    "t": "A box has 83 crayons. 51 are used. How many are left?",
    "o": [
      "42",
      "32",
      "22",
      "31"
    ],
    "a": 1,
    "e": "We subtract the ones first, then the tens. 83 - 51 = 32! You found the difference! ✨",
    "d": "h"
  },
  {
    "t": "What is 110 + 45?",
    "o": [
      "145",
      "165",
      "155",
      "150"
    ],
    "a": 2,
    "e": "Add the ones, then the tens! 110 + 45 = 155. You put the parts together! 👍",
    "d": "m"
  },
  {
    "t": "There are 39 red cars and 50 blue cars in a lot. How many cars in all?",
    "o": [
      "79",
      "99",
      "89",
      "88"
    ],
    "a": 2,
    "e": "Add the ones, then the tens! 39 + 50 = 89. You combined the numbers! 👏",
    "d": "h"
  },
  {
    "t": "56 + 78 = ? Use regrouping to solve.",
    "o": [
      "124",
      "144",
      "134",
      "114"
    ],
    "a": 2,
    "e": "When ones make a new ten (6+8=14), we regroup! Then add all the tens. 56 + 78 = 134! ✅",
    "d": "h"
  },
  {
    "t": "A pool has 152 gallons of water. 76 gallons drain out. How many gallons are left?",
    "o": [
      "86",
      "76",
      "66",
      "82"
    ],
    "a": 1,
    "e": "We regroup a ten to make more ones (12)! Then we can subtract. 152 - 76 = 76! You did it! 👍",
    "d": "h"
  },
  {
    "t": "Which problem needs regrouping? A) 73 - 41  B) 85 - 27  C) 96 - 53  D) 64 - 32",
    "o": [
      "73 - 41",
      "85 - 27",
      "96 - 53",
      "64 - 32"
    ],
    "a": 1,
    "e": "We need more ones to subtract 7 from 5! Regroup a ten from 80 to make 15 ones. Now you can subtract! 🧐",
    "d": "h"
  },
  {
    "t": "__ + 48 = 125. What is the missing number?",
    "o": [
      "87",
      "77",
      "67",
      "83"
    ],
    "a": 1,
    "e": "Addition can check subtraction! 77 + 48 = 125. So, 125 - 48 = 77 is correct! ✔️",
    "d": "h"
  },
  {
    "t": "What is 37 + 46 + 23?",
    "o": [
      "96",
      "106",
      "116",
      "86"
    ],
    "a": 1,
    "e": "Make a ten first (37+23=60)! It makes adding easier. Then 60 + 46 = 106. Smart strategy! 💡",
    "d": "m"
  },
  {
    "t": "A bakery made 94 cupcakes. They sold 57. How many are left?",
    "o": [
      "47",
      "37",
      "27",
      "43"
    ],
    "a": 1,
    "e": "We regroup a ten to make more ones (14)! Then we can subtract. 94 - 57 = 37! You're a pro! ✨",
    "d": "h"
  },
  {
    "t": "Kai has some cards. He gets 63 more and now has 141. How many did he start with?",
    "o": [
      "88",
      "78",
      "68",
      "84"
    ],
    "a": 1,
    "e": "To find the missing part, we subtract! 141 - 63 = 78. So, 78 + 63 = 141! Great thinking! 🧩",
    "d": "h"
  },
  {
    "t": "Which strategy helps solve 98 + 56?",
    "o": [
      "Count back from 98",
      "Make a friendly number: 100 + 54",
      "Subtract 56 from 98",
      "Round both down"
    ],
    "a": 1,
    "e": "Make 98 a 100 by taking 2 from 56! Then 100 + 54 = 154. Adding 100 is easy! 🧠",
    "d": "h"
  },
  {
    "t": "A garden has 82 tomatoes and 69 peppers. How many vegetables total?",
    "o": [
      "141",
      "161",
      "151",
      "131"
    ],
    "a": 2,
    "e": "When ones make a new ten (2+9=11), we regroup! Then add all the tens. 82 + 69 = 151! ⭐",
    "d": "h"
  },
  {
    "t": "161 - __ = 84. What is the missing number?",
    "o": [
      "87",
      "77",
      "67",
      "83"
    ],
    "a": 1,
    "e": "Another way to check subtraction! 161 - 77 = 84. So, 161 - 84 = 77 is correct! ✔️",
    "d": "h"
  },
  {
    "t": "Which is greater: 89 + 47 or 75 + 58?",
    "o": [
      "89 + 47",
      "75 + 58",
      "They are equal",
      "Cannot tell"
    ],
    "a": 0,
    "e": "Find both sums! 89 + 47 = 136 and 75 + 58 = 133. 136 is bigger than 133! 👍",
    "d": "h"
  },
  {
    "t": "A school bus has 115 seats. 68 students are seated. How many empty seats?",
    "o": [
      "57",
      "47",
      "37",
      "53"
    ],
    "a": 1,
    "e": "We regroup a ten to make more ones (15)! Then we can subtract. 115 - 68 = 47! You're brilliant! ✨",
    "d": "h"
  },
  {
    "t": "What is 44 + 29 + 16?",
    "o": [
      "79",
      "89",
      "99",
      "69"
    ],
    "a": 1,
    "e": "Make a ten first (44+16=60)! It makes adding easier. Then 60 + 29 = 89. Great strategy! 💡",
    "d": "m"
  },
  {
    "t": "Which problem does NOT need regrouping for addition? A) 57+36  B) 84+49  C) 62+25  D) 78+43",
    "o": [
      "57 + 36",
      "84 + 49",
      "62 + 25",
      "78 + 43"
    ],
    "a": 2,
    "e": "The ones (2+5=7) don't make a new ten! So, no regrouping needed. 62 + 25 = 87! Super easy! 🥳",
    "d": "h"
  },
  {
    "t": "__ - 56 = 79. What is the missing number?",
    "o": [
      "125",
      "145",
      "135",
      "115"
    ],
    "a": 2,
    "e": "Subtraction can check addition! 135 - 56 = 79. So, 79 + 56 = 135 is correct! ✔️",
    "d": "h"
  },
  {
    "t": "A farmer collected 73 eggs on Monday and 88 on Tuesday. How many altogether?",
    "o": [
      "151",
      "171",
      "161",
      "141"
    ],
    "a": 2,
    "e": "When ones make a new ten (3+8=11), we regroup! Then add all the tens. 73 + 88 = 161! 🤩",
    "d": "h"
  },
  {
    "t": "Rosa had 143 beads. She used 65 for a craft. How many are left?",
    "o": [
      "88",
      "78",
      "68",
      "82"
    ],
    "a": 1,
    "e": "We regroup a ten to make more ones (13)! Then we can subtract. 143 - 65 = 78! You got it! ✨",
    "d": "h"
  },
  {
    "t": "Which word problem needs addition? A) 'How many are left?' B) 'How many more?' C) 'What is the total?' D) 'How many fewer?'",
    "o": [
      "How many are left?",
      "How many more?",
      "What is the total?",
      "How many fewer?"
    ],
    "a": 2,
    "e": "'Total' means you add! You combine groups to find how many altogether. Other words mean subtract. 👍",
    "d": "h"
  },
  {
    "t": "A toy box has 58 small toys, 31 medium toys, and 19 large toys. How many toys in all?",
    "o": [
      "98",
      "108",
      "118",
      "88"
    ],
    "a": 1,
    "e": "Make a friendly 10 first! 31 + 19 makes 50. Then 50 + 58 is 108. It makes adding much easier! ✨",
    "d": "h"
  },
  {
    "t": "67 + 85 = ?",
    "o": [
      "142",
      "162",
      "152",
      "132"
    ],
    "a": 2,
    "e": "Add the ones: 7+5=12. Regroup 1 ten to the tens place! Then add the tens. The total is 152. ✅",
    "d": "m"
  },
  {
    "t": "A student solved 145 - 68 = 87. Find the error and give the correct answer.",
    "o": [
      "No error, 87 is correct",
      "Should be 77",
      "Should be 67",
      "Should be 97"
    ],
    "a": 1,
    "e": "Regroup to subtract! You need more ones and tens. 145 - 68 is 77. You got this! 👍",
    "d": "h"
  },
  {
    "t": "Ava had 178 stickers. She gave 59 to Maya and 43 to Leo. How many stickers does Ava have left?",
    "o": [
      "86",
      "76",
      "66",
      "82"
    ],
    "a": 1,
    "e": "Subtract the first group, then the second. 178 - 59 = 119. Then 119 - 43 = 76. You have 76 stickers left! 🎉",
    "d": "h"
  },
  {
    "t": "__ + 79 = 163. What is the missing number?",
    "o": [
      "94",
      "74",
      "84",
      "64"
    ],
    "a": 2,
    "e": "To find a missing part, use subtraction! 163 - 79 = 84. Regroup to solve. The missing number is 84. ✨",
    "d": "h"
  },
  {
    "t": "Ben scored 68, 75, and 49 in three games. He needs 200 total to earn a trophy. Does he have enough? How many more does he need?",
    "o": [
      "Yes, he has enough",
      "No, he needs 8 more",
      "No, he needs 18 more",
      "No, he needs 28 more"
    ],
    "a": 1,
    "e": "Add his points to find his total: 192. Then subtract from 200 to find how many more he needs. He needs 8 more points! 🏆",
    "d": "h"
  },
  {
    "t": "A student added 87 + 65 and got 142. Is the student correct?",
    "o": [
      "No, it should be 152",
      "Yes, 142 is correct",
      "No, it should be 162",
      "No, it should be 132"
    ],
    "a": 0,
    "e": "Don't forget to add the regrouped ten! 7+5=12 (regroup). Then 8+6+1=15. The answer is 152. ✅",
    "d": "h"
  },
  {
    "t": "A bakery made 95 muffins in the morning and 78 in the afternoon. They sold 136. How many are left?",
    "o": [
      "47",
      "37",
      "27",
      "42"
    ],
    "a": 1,
    "e": "Add to find the total muffins: 173. Then subtract the 136 eaten. There are 37 muffins left! 🧁",
    "d": "h"
  },
  {
    "t": "__ children were on a playground. 48 went inside, then 35 came out. Now there are 62. How many started on the playground?",
    "o": [
      "85",
      "65",
      "75",
      "95"
    ],
    "a": 2,
    "e": "Work backward! Undo the changes. Subtract 35, then add 48. The starting number was 75. Smart! 🧠",
    "d": "h"
  },
  {
    "t": "Which has a greater answer: 156 - 89 or 143 - 68?",
    "o": [
      "156 - 89 = 67",
      "143 - 68 = 75",
      "They are equal",
      "156 - 89 = 77"
    ],
    "a": 1,
    "e": "Solve both! 156-89=67. 143-68=75. Compare the answers. 75 is greater than 67! ✨",
    "d": "h"
  },
  {
    "t": "A class collected 53 cans in Week 1, 67 in Week 2, and 44 in Week 3. They need 175. How many more do they need?",
    "o": [
      "21",
      "11",
      "1",
      "31"
    ],
    "a": 1,
    "e": "Add their cans to find the total: 164. Subtract from 175 to find how many more they need. They need 11 more cans! 🥫",
    "d": "h"
  },
  {
    "t": "Sam says 93 - 47 = 56. Mia says it equals 46. Who is correct?",
    "o": [
      "Sam (56)",
      "Mia (46)",
      "Neither, it is 36",
      "Neither, it is 66"
    ],
    "a": 1,
    "e": "To subtract 93-47, you must regroup! 13-7=6 ones. 8-4=4 tens. The answer is 46. Mia is correct! ✅",
    "d": "h"
  },
  {
    "t": "__ - 58 = 94. What is the missing number?",
    "o": [
      "142",
      "162",
      "152",
      "132"
    ],
    "a": 2,
    "e": "To find the missing whole, use addition! 94 + 58 = 152. Add ones, regroup, then add tens. It's 152! ✨",
    "d": "h"
  },
  {
    "t": "A toy store had 200 items. Monday sold 67. Tuesday sold 54. Wednesday received 38 new items. How many items now?",
    "o": [
      "127",
      "117",
      "107",
      "137"
    ],
    "a": 1,
    "e": "Follow the steps in order! 200-67=133. Then 133-54=79. Finally, 79+38=117. You did it! 🎉",
    "d": "h"
  },
  {
    "t": "Which addition strategy is most efficient for 97 + 88?",
    "o": [
      "Add ones then tens",
      "Make a friendly number: 100 + 85",
      "Count up from 97 by ones",
      "Break apart both numbers"
    ],
    "a": 1,
    "e": "Make a friendly 100! Take 3 from 88 and give it to 97. Now it's 100 + 85 = 185. So easy! 👍",
    "d": "h"
  },
  {
    "t": "Team A: 89 + 67 = ? Team B: 78 + 74 = ? Which team has a higher total, and by how much?",
    "o": [
      "Team A by 4",
      "Team B by 4",
      "They are tied",
      "Team A by 14"
    ],
    "a": 0,
    "e": "Find each team's total points. Team A has 156, Team B has 152. Team A wins by 4 points! 🏆",
    "d": "h"
  },
  {
    "t": "A student checked: 'I had 134 coins, spent 67, and have 77 left.' Is this correct?",
    "o": [
      "No, should have 67 left",
      "Yes, 77 is correct",
      "No, should have 57 left",
      "No, should have 87 left"
    ],
    "a": 0,
    "e": "Regroup to subtract! You need more ones and tens. 134 - 67 is 67. You're a math star! ⭐",
    "d": "h"
  },
  {
    "t": "Rosa had 85 beads. She bought 47 more, then used 63 for a craft. How many does she have?",
    "o": [
      "79",
      "69",
      "59",
      "89"
    ],
    "a": 1,
    "e": "Add to find the total beads: 132. Then subtract the 63 used. You have 69 beads left! 📿",
    "d": "h"
  },
  {
    "t": "Three friends have 56, 43, and 38 marbles. If they combine all marbles and split equally among 3 friends, about how many does each get?",
    "o": [
      "About 45 each",
      "About 55 each",
      "About 35 each",
      "About 65 each"
    ],
    "a": 0,
    "e": "Add them all to get 137. To split 3 ways, think: 137 is about 135. 135 ÷ 3 = 45. About 45 each! 💡",
    "d": "h"
  },
  {
    "t": "A farmer had __ eggs. He sold 89 at the market and gave 34 to a neighbor. He has 52 left. How many did he start with?",
    "o": [
      "165",
      "185",
      "175",
      "155"
    ],
    "a": 2,
    "e": "To find how many eggs the farmer started with, add the eggs left (52) to all the eggs sold (34 and 89). The farmer started with 175 eggs! 🎉",
    "d": "h"
  },
  {
    "t": "A student solved 38 + 54 + 27 = 109. Check the work.",
    "o": [
      "Correct, 109 is right",
      "Wrong, should be 119",
      "Wrong, should be 129",
      "Wrong, should be 99"
    ],
    "a": 1,
    "e": "To find the total of 38, 54, and 27, add them all together! Remember to regroup when you add. The total is 119. Great job! 👍",
    "d": "h"
  },
  {
    "t": "A school has 186 students. 97 eat in the cafeteria. Of the rest, 45 eat outside. How many bring lunch from home and eat in their classroom?",
    "o": [
      "54",
      "44",
      "34",
      "48"
    ],
    "a": 1,
    "e": "Start with all 186 students. Subtract the 97 in the cafeteria, then subtract the 45 in the library. 44 students eat in their classroom! ✨",
    "d": "h"
  }
];
