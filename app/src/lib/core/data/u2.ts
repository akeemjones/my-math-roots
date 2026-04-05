// Auto-converted from src/data/u2.js
// Regenerate with: node scripts/convert-unit-data.js 2
// Do NOT edit manually — edit the source in src/data/u2.js then re-run.

import type { LessonContent, UnitQuiz, Question } from '$lib/core/types/content';

export const lessons: LessonContent[] = [
  {
    "points": [
      "Every digit in a number has a PLACE that tells its VALUE",
      "Hundreds place → Tens place → Ones place",
      "The number 347 has 3 hundreds, 4 tens, and 7 ones"
    ],
    "examples": [
      {
        "c": "#c0392b",
        "tag": "Example",
        "p": "The number 347",
        "s": "<div class=\"pv-row\"><div class=\"pv\" style=\"border-color:#8e44ad;background:#f5eef8\"><div class=\"pv-lbl\" style=\"color:#8e44ad\">Hundreds</div><div class=\"pv-val\" style=\"color:#8e44ad\">3</div><div class=\"pv-sub\" style=\"color:#8e44ad\">= 300</div></div><div class=\"pv\" style=\"border-color:#e67e22;background:#fef5ec\"><div class=\"pv-lbl\" style=\"color:#e67e22\">Tens</div><div class=\"pv-val\" style=\"color:#e67e22\">4</div><div class=\"pv-sub\" style=\"color:#e67e22\">= 40</div></div><div class=\"pv\" style=\"border-color:#c0392b;background:#fdecea\"><div class=\"pv-lbl\" style=\"color:#c0392b\">Ones</div><div class=\"pv-val\" style=\"color:#c0392b\">7</div><div class=\"pv-sub\" style=\"color:#c0392b\">= 7</div></div></div>",
        "a": "300 + 40 + 7 = 347 ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Example",
        "p": "The number 562",
        "s": "<div class=\"pv-row\"><div class=\"pv\" style=\"border-color:#8e44ad;background:#f5eef8\"><div class=\"pv-lbl\" style=\"color:#8e44ad\">Hundreds</div><div class=\"pv-val\" style=\"color:#8e44ad\">5</div><div class=\"pv-sub\" style=\"color:#8e44ad\">= 500</div></div><div class=\"pv\" style=\"border-color:#e67e22;background:#fef5ec\"><div class=\"pv-lbl\" style=\"color:#e67e22\">Tens</div><div class=\"pv-val\" style=\"color:#e67e22\">6</div><div class=\"pv-sub\" style=\"color:#e67e22\">= 60</div></div><div class=\"pv\" style=\"border-color:#c0392b;background:#fdecea\"><div class=\"pv-lbl\" style=\"color:#c0392b\">Ones</div><div class=\"pv-val\" style=\"color:#c0392b\">2</div><div class=\"pv-sub\" style=\"color:#c0392b\">= 2</div></div></div>",
        "a": "500 + 60 + 2 = 562 ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Tricky! Zeros",
        "p": "The number 809",
        "s": "<div class=\"pv-row\"><div class=\"pv\" style=\"border-color:#8e44ad;background:#f5eef8\"><div class=\"pv-lbl\" style=\"color:#8e44ad\">Hundreds</div><div class=\"pv-val\" style=\"color:#8e44ad\">8</div><div class=\"pv-sub\" style=\"color:#8e44ad\">= 800</div></div><div class=\"pv\" style=\"border-color:#e67e22;background:#fef5ec\"><div class=\"pv-lbl\" style=\"color:#e67e22\">Tens</div><div class=\"pv-val\" style=\"color:#e67e22\">0</div><div class=\"pv-sub\" style=\"color:#e67e22\">= 0</div></div><div class=\"pv\" style=\"border-color:#c0392b;background:#fdecea\"><div class=\"pv-lbl\" style=\"color:#c0392b\">Ones</div><div class=\"pv-val\" style=\"color:#c0392b\">9</div><div class=\"pv-sub\" style=\"color:#c0392b\">= 9</div></div></div>",
        "a": "800 + 0 + 9 = 809 ✅"
      }
    ],
    "practice": [
      {
        "q": "What is the tens digit in 456?",
        "a": "5",
        "h": "Hundreds - Tens - Ones. 4 is hundreds, 5 is tens, 6 is ones!",
        "e": "We group items into bundles of ten and then bundles of one hundred to count them easily! 📦"
      },
      {
        "q": "What is the value of 3 in 370?",
        "a": "300",
        "h": "3 is in the hundreds place, so its value is 300!",
        "e": "Each digit has a special value based on its place. Let's find it! 💎"
      },
      {
        "q": "4 hundreds + 2 tens + 8 ones = ?",
        "a": "428",
        "h": "400 + 20 + 8 = 428",
        "e": "Numbers are made of digits, and each digit tells us how many hundreds, tens, or ones there are! 🔢"
      }
    ],
    "qBank": [
      {
        "t": "In 347, what is the HUNDREDS digit?",
        "o": [
          "3",
          "4",
          "7",
          "34"
        ],
        "a": 0,
        "e": "In 347, the 3 means 3 hundreds, the 4 means 4 tens, and the 7 means 7 ones. You got it! ✨",
        "d": "m"
      },
      {
        "t": "In 562, what is the TENS digit?",
        "o": [
          "2",
          "5",
          "6",
          "56"
        ],
        "a": 2,
        "e": "For 562, the 5 is 5 hundreds, the 6 is 6 tens, and the 2 is 2 ones. Great job! 👍",
        "d": "m"
      },
      {
        "t": "What is the value of 4 in 347?",
        "o": [
          "4",
          "40",
          "400",
          "4000"
        ],
        "a": 1,
        "e": "The digit 4 in the tens place means we have 4 groups of ten. That makes 40! You're a math star! ⭐",
        "d": "m"
      },
      {
        "t": "What is the value of 5 in 562?",
        "o": [
          "5",
          "50",
          "500",
          "5000"
        ],
        "a": 2,
        "e": "The digit 5 in the hundreds place means we have 5 groups of one hundred. That's 500! Amazing! 💯",
        "d": "m"
      },
      {
        "t": "What is 3 hundreds + 4 tens + 7 ones?",
        "o": [
          "347",
          "374",
          "437",
          "473"
        ],
        "a": 0,
        "e": "When we add 3 hundreds (300), 4 tens (40), and 7 ones (7) together, we get the number 347! You did it! ✅",
        "d": "e"
      },
      {
        "t": "What is 5 hundreds + 6 tens + 2 ones?",
        "o": [
          "526",
          "625",
          "652",
          "562"
        ],
        "a": 3,
        "e": "Adding 5 hundreds (500), 6 tens (60), and 2 ones (2) gives us the number 562! Super work! 🎉",
        "d": "e"
      },
      {
        "t": "In 809, what digit is in the TENS place?",
        "o": [
          "0",
          "8",
          "9",
          "80"
        ],
        "a": 0,
        "e": "In 809, the 8 means 8 hundreds, the 0 means zero tens, and the 9 means 9 ones. You understand! 💡",
        "d": "m"
      },
      {
        "t": "What is the value of 9 in 903?",
        "o": [
          "9",
          "90",
          "900",
          "9000"
        ],
        "a": 2,
        "e": "The digit 9 in the hundreds place means 9 groups of one hundred. That's 900! Fantastic! 🌟",
        "d": "m"
      },
      {
        "t": "What digit is in the tens place in 450?",
        "o": [
          "4",
          "0",
          "45",
          "5"
        ],
        "a": 3,
        "e": "For 450, the 4 is 4 hundreds, the 5 is 5 tens, and the 0 means zero ones. You're so smart! 🧠",
        "d": "e"
      },
      {
        "t": "What is the ones digit in 738?",
        "o": [
          "3",
          "7",
          "8",
          "73"
        ],
        "a": 2,
        "e": "In 738, the 7 means 7 hundreds, the 3 means 3 tens, and the 8 means 8 ones. Awesome thinking! 😄",
        "d": "m"
      },
      {
        "t": "In 206, what is in the tens place?",
        "o": [
          "0",
          "2",
          "6",
          "20"
        ],
        "a": 0,
        "e": "For 206, the 2 is 2 hundreds, the 0 means zero tens, and the 6 is 6 ones. Keep up the great work! 💪",
        "d": "m"
      },
      {
        "t": "What is the value of 7 in 735?",
        "o": [
          "7",
          "70",
          "700",
          "7000"
        ],
        "a": 2,
        "e": "The digit 7 in the hundreds place means 7 groups of one hundred. That's 700! You're doing great! 🥳",
        "d": "m"
      },
      {
        "t": "What is 8 hundreds + 0 tens + 5 ones?",
        "o": [
          "850",
          "508",
          "580",
          "805"
        ],
        "a": 3,
        "e": "Adding 8 hundreds (800), zero tens (0), and 5 ones (5) gives us the number 805! Fantastic! ✨",
        "d": "e"
      },
      {
        "t": "In 614, what is the tens digit?",
        "o": [
          "4",
          "6",
          "61",
          "1"
        ],
        "a": 3,
        "e": "In 614, the 6 means 6 hundreds, the 1 means 1 ten, and the 4 means 4 ones. You've got this! 👍",
        "d": "m"
      },
      {
        "t": "What is the value of 3 in 370?",
        "o": [
          "3",
          "30",
          "300",
          "3000"
        ],
        "a": 2,
        "e": "The digit 3 in the hundreds place means 3 groups of one hundred. That's 300! Wonderful! 🌈",
        "d": "m"
      },
      {
        "t": "In 528, how many hundreds?",
        "o": [
          "2",
          "5",
          "8",
          "52"
        ],
        "a": 1,
        "e": "For 528, the 5 is 5 hundreds, the 2 is 2 tens, and the 8 is 8 ones. You're a math whiz! 🤩",
        "d": "e"
      },
      {
        "t": "Which number has 4 hundreds, 3 tens, 6 ones?",
        "o": [
          "346",
          "364",
          "436",
          "634"
        ],
        "a": 2,
        "e": "Adding 4 hundreds (400), 3 tens (30), and 6 ones (6) together makes the number 436! You rock! 🚀",
        "d": "m"
      },
      {
        "t": "In 901, which place has a zero?",
        "o": [
          "Ones",
          "Tens",
          "Hundreds",
          "All places"
        ],
        "a": 1,
        "e": "The number 901 has 9 hundreds, 0 tens, and 1 one. Each digit tells us its value! ✨",
        "d": "h"
      },
      {
        "t": "What is the value of 6 in 164?",
        "o": [
          "6",
          "600",
          "160",
          "60"
        ],
        "a": 3,
        "e": "The 6 is in the tens place! That means 6 groups of ten, which is 60. Great job! 👍",
        "d": "m"
      },
      {
        "t": "In 777, all three digits are the same. What is the value of the hundreds digit?",
        "o": [
          "7",
          "70",
          "700",
          "7000"
        ],
        "a": 2,
        "e": "The 7 is in the hundreds place! That means 7 groups of one hundred, which is 700. You got it! 💯",
        "d": "m"
      },
      {
        "t": "Which digit is in the ONES place in 493?",
        "o": [
          "3",
          "4",
          "9",
          "49"
        ],
        "a": 0,
        "e": "The number 493 has 4 hundreds, 9 tens, and 3 ones. Each digit shows its value! You're a star! ⭐",
        "d": "m"
      },
      {
        "t": "What is 7 hundreds + 2 tens + 0 ones?",
        "o": [
          "702",
          "720",
          "270",
          "207"
        ],
        "a": 1,
        "e": "When we add 7 hundreds (700), 2 tens (20), and 0 ones (0), we get 720. That's expanded form! ➕",
        "d": "e"
      },
      {
        "t": "In 315, what is the value of the 3?",
        "o": [
          "3",
          "30",
          "300",
          "3000"
        ],
        "a": 2,
        "e": "The 3 is in the hundreds place! This means 3 groups of one hundred, which is 300. Super! 🤩",
        "d": "m"
      },
      {
        "t": "In 615, what is the value of 1?",
        "o": [
          "1",
          "100",
          "1000",
          "10"
        ],
        "a": 3,
        "e": "The 1 is in the tens place! This means 1 group of ten, which is 10. You're so smart! 🧠",
        "d": "m"
      },
      {
        "t": "Which number has 0 in the tens place?",
        "o": [
          "305",
          "350",
          "253",
          "530"
        ],
        "a": 0,
        "e": "The number 305 has 3 hundreds, 0 tens, and 5 ones. Each digit tells us its special value! ✨",
        "d": "e"
      },
      {
        "t": "What is the value of 8 in 284?",
        "o": [
          "8",
          "80",
          "800",
          "8000"
        ],
        "a": 1,
        "e": "The 8 is in the tens place! This means 8 groups of ten, which is 80. You're doing great! 👍",
        "d": "m"
      },
      {
        "t": "In 799, what digit is in hundreds place?",
        "o": [
          "9",
          "99",
          "79",
          "7"
        ],
        "a": 3,
        "e": "The number 799 has 7 hundreds, 9 tens, and 9 ones. Each digit shows its value! Keep up the good work! 🌟",
        "d": "m"
      },
      {
        "t": "What is 4 hundreds + 0 tens + 4 ones?",
        "o": [
          "404",
          "440",
          "400",
          "44"
        ],
        "a": 0,
        "e": "When we add 4 hundreds (400), 0 tens (0), and 4 ones (4), we get 404. You're a math whiz! 💡",
        "d": "e"
      },
      {
        "t": "In 863, how many tens are there?",
        "o": [
          "3",
          "6",
          "8",
          "63"
        ],
        "a": 1,
        "e": "The number 863 has 8 hundreds, 6 tens, and 3 ones. Each digit tells us its value! Awesome! 🥳",
        "d": "m"
      },
      {
        "t": "What is the value of 5 in 857?",
        "o": [
          "5",
          "50",
          "500",
          "5000"
        ],
        "a": 1,
        "e": "The 5 is in the tens place! This means 5 groups of ten, which is 50. Fantastic! ✨",
        "d": "m"
      },
      {
        "t": "What digit is in the tens place of 374?",
        "o": [
          "3",
          "7",
          "4",
          "37"
        ],
        "a": 1,
        "e": "In 374, the 7 is in the tens place. It's the middle digit, between the hundreds and ones! You got it! 👍",
        "d": "e"
      },
      {
        "t": "What digit is in the hundreds place of 851?",
        "o": [
          "1",
          "5",
          "8",
          "85"
        ],
        "a": 2,
        "e": "The hundreds place is always the first digit on the left. In 851, the 8 is in the hundreds place! Great! 🏡",
        "d": "e"
      },
      {
        "t": "What digit is in the ones place of 639?",
        "o": [
          "6",
          "3",
          "9",
          "39"
        ],
        "a": 2,
        "e": "The ones place is always the last digit on the right. In 639, the 9 is in the ones place! So easy! ☝️",
        "d": "e"
      },
      {
        "t": "How many hundreds are in 400?",
        "o": [
          "40",
          "4",
          "0",
          "400"
        ],
        "a": 1,
        "e": "The number 400 has 4 hundreds. Each hundred is worth 100, so 4 groups of 100 equals 400! Wow! 🤩",
        "d": "e"
      },
      {
        "t": "Which number has a 6 in the tens place?",
        "o": [
          "602",
          "296",
          "326",
          "463"
        ],
        "a": 3,
        "e": "In 463, the 6 is in the tens place. It's the middle digit, or the second digit from the right! Smart! 🤓",
        "d": "e"
      },
      {
        "t": "What digit is in the hundreds place of 207?",
        "o": [
          "7",
          "0",
          "2",
          "20"
        ],
        "a": 2,
        "e": "The hundreds digit is always the one on the far left. In 207, the hundreds digit is 2. You found it! 🔍",
        "d": "e"
      },
      {
        "t": "How many tens are in 90?",
        "o": [
          "90",
          "0",
          "9",
          "900"
        ],
        "a": 2,
        "e": "The number 90 has 9 tens. Each ten is worth 10, so 9 groups of 10 equals 90! Amazing! ✨",
        "d": "e"
      },
      {
        "t": "Jake has 3 hundreds blocks, 2 tens blocks, and 5 ones blocks. What number did he make?",
        "o": [
          "235",
          "352",
          "325",
          "532"
        ],
        "a": 2,
        "e": "3 hundreds is 300, 2 tens is 20, 5 ones is 5. Adding them together makes 325! ✨",
        "d": "e"
      },
      {
        "t": "What digit is in the tens place of 148?",
        "o": [
          "1",
          "4",
          "8",
          "48"
        ],
        "a": 1,
        "e": "The tens digit is the middle one. In 148, the 4 is in the tens place, showing 4 tens! 👍",
        "d": "e"
      },
      {
        "t": "Which number has a 9 in the ones place?",
        "o": [
          "952",
          "295",
          "529",
          "590"
        ],
        "a": 2,
        "e": "The ones digit is always the last digit on the right. In 529, the 9 is in the ones place! 😊",
        "d": "e"
      },
      {
        "t": "How many ones are in the number 47?",
        "o": [
          "4",
          "7",
          "47",
          "0"
        ],
        "a": 1,
        "e": "The ones digit is the last digit. In 47, the 7 is in the ones place, so there are 7 ones! ✅",
        "d": "e"
      },
      {
        "t": "Maria put 5 hundreds blocks on the table. What number do just those blocks show?",
        "o": [
          "5",
          "50",
          "500",
          "505"
        ],
        "a": 2,
        "e": "Each hundreds block is worth 100. If you have 5 blocks, you have 5 groups of 100, which is 500! 💯",
        "d": "e"
      },
      {
        "t": "What digit is in the hundreds place of 999?",
        "o": [
          "9",
          "99",
          "999",
          "90"
        ],
        "a": 0,
        "e": "In 999, the hundreds digit is the first 9 on the left. It shows how many hundreds there are! 🤩",
        "d": "e"
      },
      {
        "t": "Which place is the 3 in for the number 735?",
        "o": [
          "Hundreds",
          "Tens",
          "Ones",
          "Thousands"
        ],
        "a": 1,
        "e": "In 735, the 3 is the middle digit. The middle digit is always in the tens place, so it means 3 tens! 👍",
        "d": "m"
      },
      {
        "t": "A number has 0 hundreds, 6 tens, and 2 ones. What is the number?",
        "o": [
          "620",
          "602",
          "62",
          "260"
        ],
        "a": 2,
        "e": "0 hundreds means no hundreds. 6 tens is 60, and 2 ones is 2. Put them together to make 62! 🔢",
        "d": "m"
      },
      {
        "t": "What digit is in the ones place of 810?",
        "o": [
          "8",
          "1",
          "0",
          "10"
        ],
        "a": 2,
        "e": "The ones place is always the last digit on the right. In 810, the ones digit is 0, meaning zero ones! 🧐",
        "d": "e"
      },
      {
        "t": "How many hundreds are in 700?",
        "o": [
          "70",
          "7",
          "0",
          "700"
        ],
        "a": 1,
        "e": "700 means you have 7 groups of 100. So, 700 is the same as 7 hundreds! Great job! 🌟",
        "d": "e"
      },
      {
        "t": "Tom has base-ten blocks: 1 hundred, 4 tens, 3 ones. What number is that?",
        "o": [
          "134",
          "413",
          "143",
          "314"
        ],
        "a": 2,
        "e": "1 hundred is 100, 4 tens is 40, and 3 ones is 3. Add them up, and you get 143! 🎉",
        "d": "e"
      },
      {
        "t": "Which number has a 2 in the hundreds place?",
        "o": [
          "832",
          "328",
          "283",
          "238"
        ],
        "a": 3,
        "e": "The hundreds place is always the first digit on the left. In 238, the 2 is in the hundreds place! 💡",
        "d": "e"
      },
      {
        "t": "What digit is in the tens place of 506?",
        "o": [
          "5",
          "0",
          "6",
          "50"
        ],
        "a": 1,
        "e": "In 506, the tens digit is 0. This means there are zero tens, so we don't count any groups of ten! 😉",
        "d": "e"
      },
      {
        "t": "In the number 358, what is the VALUE of the digit 5?",
        "o": [
          "5",
          "50",
          "500",
          "58"
        ],
        "a": 1,
        "e": "The 5 is in the tens place. Its value is 50 because 5 tens means 5 groups of 10. That's 50! 👏",
        "d": "m"
      },
      {
        "t": "Which number has a 4 in the hundreds place AND a 7 in the ones place?",
        "o": [
          "470",
          "407",
          "740",
          "347"
        ],
        "a": 1,
        "e": "We need 4 hundreds, 0 tens, and 7 ones. Put them in order: hundreds, tens, ones. That makes 407! ✨",
        "d": "m"
      },
      {
        "t": "Rosa has 2 hundreds blocks, 14 ones blocks, and no tens blocks. What number did she build?",
        "o": [
          "214",
          "240",
          "200",
          "2,014"
        ],
        "a": 0,
        "e": "2 hundreds is 200. 14 ones is 1 ten and 4 ones. So, 200 + 10 + 4 makes 214! You regrouped! 🥳",
        "d": "h"
      },
      {
        "t": "Which shows how to break apart 745 into hundreds, tens, and ones?",
        "o": [
          "700 + 40 + 5",
          "7 + 4 + 5",
          "74 + 5",
          "700 + 45"
        ],
        "a": 0,
        "e": "745 can be broken down! The 7 is 700, the 4 is 40, and the 5 is 5. It's the expanded form! 🚀",
        "d": "h"
      },
      {
        "t": "A number has 6 hundreds and 3 ones but NO tens. What is the number?",
        "o": [
          "630",
          "603",
          "63",
          "360"
        ],
        "a": 1,
        "e": "6 hundreds is 600, 0 tens, and 3 ones. The 0 is important! It holds the tens place, making 603. ✔️",
        "d": "m"
      },
      {
        "t": "What is the value of the digit 9 in 492?",
        "o": [
          "9",
          "90",
          "900",
          "92"
        ],
        "a": 1,
        "e": "The 9 is in the tens place. This means it represents 9 groups of ten. So its value is 90! Super! 🌟",
        "d": "h"
      },
      {
        "t": "Ben says the number 830 has 83 tens. Is he right?",
        "o": [
          "Yes, 83 tens = 830",
          "No, it has 3 tens",
          "No, it has 8 tens",
          "No, it has 30 tens"
        ],
        "a": 0,
        "e": "This is tricky! 8 hundreds is 80 tens. Add the 3 tens, and you have 83 tens in total in 830! Wow! 🤯",
        "d": "h"
      },
      {
        "t": "___ hundreds + 2 tens + 9 ones = 529. What goes in the blank?",
        "o": [
          "2",
          "5",
          "9",
          "52"
        ],
        "a": 1,
        "e": "529 has 5 hundreds, 2 tens, and 9 ones. The 5 shows how many hundreds! So the blank is 5. ✨",
        "d": "h"
      },
      {
        "t": "Mia says the value of the 6 in 612 is 6. What should the value be?",
        "o": [
          "6",
          "60",
          "600",
          "612"
        ],
        "a": 2,
        "e": "The 6 is in the hundreds house, so it's worth 600! Mia thought it was just 6. 🏠",
        "d": "h"
      },
      {
        "t": "Which number shows 4 hundreds, 0 tens, and 8 ones?",
        "o": [
          "480",
          "408",
          "48",
          "840"
        ],
        "a": 1,
        "e": "4 hundreds is 400. 0 tens means no tens. 8 ones is 8. Put them together: 408! 🔢",
        "d": "e"
      },
      {
        "t": "Carlos built 562 with base-ten blocks. He lost 1 tens block. What number does he have now?",
        "o": [
          "552",
          "462",
          "561",
          "542"
        ],
        "a": 0,
        "e": "562 has 6 tens. When you take away 1 ten, you have 5 tens left. The new number is 552. 👇",
        "d": "h"
      },
      {
        "t": "In the number 444, which digit has the GREATEST value?",
        "o": [
          "They are all the same",
          "The first 4",
          "The middle 4",
          "The last 4"
        ],
        "a": 1,
        "e": "Each 4 is in a different place! The first 4 is 400. The middle 4 is 40. The last 4 is 4. 400 is the biggest! 🏆",
        "d": "h"
      },
      {
        "t": "What number has 9 in the ones place and 1 in the hundreds place?",
        "o": [
          "Only 109",
          "Only 119",
          "Only 199",
          "There are many answers"
        ],
        "a": 3,
        "e": "The tens digit can be any number from 0 to 9! So, many numbers like 109, 119, 129 work. Lots of answers! 🤔",
        "d": "m"
      },
      {
        "t": "Kira added 1 hundreds block to 348. What is her new number?",
        "o": [
          "349",
          "358",
          "448",
          "1,348"
        ],
        "a": 2,
        "e": "Adding 1 hundreds block means adding 100. So, 3 hundreds becomes 4 hundreds! 348 + 100 = 448. ➕",
        "d": "h"
      },
      {
        "t": "Which digit in 276 has a value of 200?",
        "o": [
          "2",
          "7",
          "6",
          "27"
        ],
        "a": 0,
        "e": "The 2 is in the hundreds place! That means it's worth 2 groups of 100, which is 200. Good job! 👍",
        "d": "h"
      },
      {
        "t": "Omar has 3 hundreds blocks and 15 ones cubes. He trades 10 ones for 1 tens block. What number does he have?",
        "o": [
          "315",
          "305",
          "3,015",
          "350"
        ],
        "a": 0,
        "e": "3 hundreds is 300. 10 ones can regroup into 1 ten! So, 300 + 1 ten + 5 ones = 315. Smart regrouping! 💡",
        "d": "h"
      },
      {
        "t": "The value of the digit 8 in which number is 800?",
        "o": [
          "380",
          "108",
          "821",
          "488"
        ],
        "a": 2,
        "e": "In 821, the 8 is in the hundreds place, so it's worth 800! That's bigger than 8 in the tens or ones place. ⬆️",
        "d": "h"
      },
      {
        "t": "7 hundreds + ___ tens + 4 ones = 764. What goes in the blank?",
        "o": [
          "4",
          "6",
          "7",
          "64"
        ],
        "a": 1,
        "e": "764 has 7 hundreds, 6 tens, and 4 ones. The 6 shows how many tens! So the blank is 6. ✏️",
        "d": "h"
      },
      {
        "t": "Lucy says 305 has 3 hundreds and 5 ones. Did she describe it fully?",
        "o": [
          "Yes, she is correct",
          "No, she forgot 0 tens",
          "No, she forgot 5 tens",
          "No, she forgot 3 tens"
        ],
        "a": 1,
        "e": "305 has 3 hundreds, 0 tens, and 5 ones. The 0 is important! It holds the tens place. Lucy forgot the 0 tens. 🤫",
        "d": "h"
      },
      {
        "t": "Which pair of numbers have the SAME digit in the tens place?",
        "o": [
          "345 and 543",
          "291 and 198",
          "672 and 478",
          "456 and 853"
        ],
        "a": 2,
        "e": "Both 672 and 478 have a 7 in the tens place! That means they both have 7 tens. They share a 7! 👋",
        "d": "e"
      },
      {
        "t": "What number has 3 hundreds, 15 tens, and 7 ones?",
        "o": [
          "3,157",
          "457",
          "307",
          "1,507"
        ],
        "a": 1,
        "e": "15 tens is 1 hundred and 5 tens! Regroup the 10 tens. So, 3 hundreds + 1 hundred + 5 tens + 7 ones = 457. 🎉",
        "d": "m"
      },
      {
        "t": "Jada wrote 600 + 40 + 15 in standard form as 6,415. What mistake did she make?",
        "o": [
          "She added wrong",
          "She put digits side by side instead of adding",
          "She forgot the zero",
          "She switched hundreds and tens"
        ],
        "a": 1,
        "e": "Jada put the numbers next to each other! We need to add them: 600 + 40 + 15 = 655. You got this! 👍",
        "d": "h"
      },
      {
        "t": "Sam says 452 > 459 because 5 > 4. Is Sam right?",
        "o": [
          "Yes, 5 is bigger than 4",
          "No, the hundreds are different",
          "No, both start with 45 so check ones: 2 < 9",
          "No, you cannot compare these numbers"
        ],
        "a": 2,
        "e": "Both have 4 hundreds and 5 tens. Look at the ones! 2 is less than 9, so 452 is less than 459. Sam looked at the wrong spot! 👀",
        "d": "h"
      },
      {
        "t": "A mystery number has the same digit in every place. The digit values add up to 666. What is the number?",
        "o": [
          "222",
          "666",
          "333",
          "999"
        ],
        "a": 1,
        "e": "If every digit is 6, it means 6 hundreds, 6 tens, and 6 ones! That makes the number 666. Easy peasy! 😄",
        "d": "h"
      },
      {
        "t": "___ is 100 more than 867 and 10 less than 977. What is ___?",
        "o": [
          "877",
          "967",
          "957",
          "857"
        ],
        "a": 1,
        "e": "100 more than 867 is 967. 10 less than 977 is also 967! Both clues point to 967. Great detective work! 🔍",
        "d": "h"
      },
      {
        "t": "Dev says 709 has 7 hundreds and 9 tens. Find his mistake.",
        "o": [
          "The 9 is in the ones place, not tens",
          "The 7 is in the tens place",
          "709 has 70 tens",
          "There is no mistake"
        ],
        "a": 0,
        "e": "In 709, the 0 is in the tens place and the 9 is in the ones place. Dev mixed them up! The 9 is in the ones place. 🧐",
        "d": "h"
      },
      {
        "t": "I am a 3-digit number. My hundreds digit is double my ones digit. My tens digit is 0. My ones digit is 3. What number am I?",
        "o": [
          "603",
          "306",
          "630",
          "360"
        ],
        "a": 0,
        "e": "The ones digit is 3. Double 3 is 6, so hundreds is 6. Tens is 0. Put them in order: 603! ✅",
        "d": "h"
      },
      {
        "t": "Ava shows 524 three different ways. Which is NOT correct?",
        "o": [
          "500 + 20 + 4",
          "5 hundreds, 2 tens, 4 ones",
          "50 tens and 24 ones",
          "500 + 20 + 40"
        ],
        "a": 3,
        "e": "50 tens is 500. 24 ones is 2 tens and 4 ones. So 500 + 2 tens + 4 ones makes 524. The wrong one adds too many tens! ✨",
        "d": "m"
      },
      {
        "t": "What number has 5 hundreds, 2 tens, and 7 ones?",
        "o": [
          "572",
          "527",
          "725",
          "275"
        ],
        "a": 1,
        "e": "5 hundreds is 500. 2 tens is 20. 7 ones is 7. Add them up: 500 + 20 + 7 = 527! Great work! ✨",
        "d": "m"
      },
      {
        "t": "Eli says that in 380, the value of 8 is greater than the value of 3. Is he right? Why?",
        "o": [
          "Yes, because 8 > 3",
          "No, 3 is in hundreds so 300 > 80",
          "Yes, because 80 > 30",
          "No, they are equal"
        ],
        "a": 1,
        "e": "The digit 3 is in the hundreds place, so its value is 300. The digit 8 is in the tens place, value 80. 300 is much bigger than 80! ✅",
        "d": "h"
      },
      {
        "t": "Two students build the same number. Ana uses 4 hundreds and 23 ones. Ben uses 3 hundreds and 12 tens. Who has a leftover, and how many ones?",
        "o": [
          "Ana, 3 ones left over",
          "Ben, 3 ones left over",
          "Ana has 423, Ben has 420, so Ana has 3 extra ones",
          "They both have 423"
        ],
        "a": 2,
        "e": "Ana made 423. Ben made 300 + 120, which is 420. Ana's number is 3 more! They are not the same. 🙅‍♀️",
        "d": "h"
      },
      {
        "t": "I am thinking of a number. It has a 0 in the tens place. The hundreds digit is 2 more than the ones digit. The ones digit is 5. What is my number?",
        "o": [
          "705",
          "507",
          "750",
          "570"
        ],
        "a": 0,
        "e": "The ones digit is 5. The hundreds digit is 5 + 2 = 7. The tens digit is 0. Put it together: 7 hundreds, 0 tens, 5 ones. That's 705! 🔢",
        "d": "h"
      },
      {
        "t": "Kai wrote 300 + 50 + 17 = 3,517. What should the answer really be?",
        "o": [
          "367",
          "857",
          "3,517",
          "350"
        ],
        "a": 0,
        "e": "We add the parts: 300 + 50 = 350. Then 350 + 17 = 367. Kai put the numbers next to each other, not added! ➕",
        "d": "h"
      },
      {
        "t": "Which number does NOT have 4 in a place where its value is 40?",
        "o": [
          "241",
          "843",
          "540",
          "142"
        ],
        "a": 2,
        "e": "For the digit 4 to have a value of 40, it must be in the tens place. In 540, the 4 is in the ones place, so its value is 4. Not 40! 🧐",
        "d": "e"
      },
      {
        "t": "Maya traded 1 hundreds block for 10 tens blocks. She started with 3 hundreds, 2 tens, 5 ones. How many tens blocks does she have now?",
        "o": [
          "10",
          "12",
          "102",
          "32"
        ],
        "a": 1,
        "e": "She regroups 1 hundred for 10 tens. Now she has 2 hundreds, 12 tens (2+10), and 5 ones. The total value is still 325! 💯",
        "d": "h"
      },
      {
        "t": "What 3-digit number has digits that add up to 20, a 9 in the tens place, and an even ones digit?",
        "o": [
          "596",
          "894",
          "498",
          "698"
        ],
        "a": 0,
        "e": "The tens digit is 9. The ones digit must be even. 596 has 9 tens and 6 ones (even). Its digits add to 20. Perfect! ✅",
        "d": "h"
      },
      {
        "t": "Zoe built a number with 2 hundreds blocks, 0 tens blocks, and 18 ones cubes. Her teacher said to regroup. What is the standard form?",
        "o": [
          "218",
          "2,018",
          "228",
          "318"
        ],
        "a": 0,
        "e": "2 hundreds is 200. 18 ones is 18. Together, that's 218! We can regroup 18 ones into 1 ten and 8 ones. So, 2 hundreds, 1 ten, 8 ones. 🌟",
        "d": "h"
      },
      {
        "t": "A number has more hundreds than tens and more tens than ones. Which could it be?",
        "o": [
          "321",
          "123",
          "213",
          "231"
        ],
        "a": 0,
        "e": "We need hundreds > tens > ones. In 321, 3 is greater than 2, and 2 is greater than 1. So 3 > 2 > 1. That's it! 👍",
        "d": "e"
      },
      {
        "t": "Pedro says 500 + 0 + 8 = 58. What is wrong?",
        "o": [
          "He dropped the hundreds",
          "He forgot the zero in the tens place",
          "He added wrong",
          "Nothing, he is correct"
        ],
        "a": 1,
        "e": "5 hundreds and 8 ones is 508. The 0 in the tens place is important! Without it, 508 looks like 58, which is much smaller. 😮",
        "d": "h"
      },
      {
        "t": "Use these clues to find the number: It is between 550 and 600. The tens digit is 3 more than the ones digit. The ones digit is 2.",
        "o": [
          "552",
          "572",
          "582",
          "523"
        ],
        "a": 0,
        "e": "The number is between 550 and 600, so it starts with 5 hundreds. Ones digit is 2. Tens digit is 2+3=5. So it's 552! 🎉",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "In 347, what digit is in the TENS place?",
        "o": [
          "3",
          "4",
          "7",
          "34"
        ],
        "a": 1,
        "e": "In the number 347, the 4 is in the tens place. It means we have 4 tens, which has a value of 40. Keep up the great work! ✨"
      },
      {
        "t": "What is the value of 5 in 562?",
        "o": [
          "5",
          "50",
          "500",
          "5000"
        ],
        "a": 2,
        "e": "The digit 5 is in the hundreds place. This means its value is 5 hundreds, or 500. You got it! 💯"
      },
      {
        "t": "Which number has 6 hundreds, 2 tens, 5 ones?",
        "o": [
          "265",
          "526",
          "625",
          "652"
        ],
        "a": 2,
        "e": "We have 6 hundreds, 2 tens, and 5 ones. Put them together to make the number 625. Great job! 🥳"
      },
      {
        "t": "In 809, what digit is in the TENS place?",
        "o": [
          "0",
          "8",
          "9",
          "80"
        ],
        "a": 0,
        "e": "In 809, we have 8 hundreds, 0 tens, and 9 ones. The tens digit is 0. That's why there's a zero in the middle! 💡"
      },
      {
        "t": "What is the ones digit in 738?",
        "o": [
          "3",
          "7",
          "8",
          "73"
        ],
        "a": 2,
        "e": "In 738, the digit 8 is in the ones place. So, the ones digit is 8. You found it! ✨"
      },
      {
        "t": "What is the value of 4 in the number 435?",
        "o": [
          "4",
          "40",
          "400",
          "4000"
        ],
        "a": 2,
        "e": "The digit 4 is in the hundreds place. This means its value is 4 hundreds, or 400. Super work! 🌟"
      }
    ]
  },
  {
    "points": [
      "STANDARD form: the regular number (835)",
      "EXPANDED form: break apart by place value (800+30+5)",
      "WORD form: spell it out (eight hundred thirty-five)"
    ],
    "examples": [
      {
        "c": "#c0392b",
        "tag": "Number: 483",
        "p": "Three ways to write 483:",
        "s": "Standard: 483\nExpanded: 400 + 80 + 3\nWord: four hundred eighty-three",
        "a": "All three mean the same number! ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Number: 204",
        "p": "Watch for the zero!",
        "s": "Standard: 204\nExpanded: 200 + 0 + 4\nWord: two hundred four",
        "a": "We keep the zero in expanded form! ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Number: 750",
        "p": "Three ways to write 750:",
        "s": "Standard: 750\nExpanded: 700 + 50 + 0\nWord: seven hundred fifty",
        "a": "750 in all three forms! ✅"
      }
    ],
    "practice": [
      {
        "q": "300 + 60 + 4 = ?",
        "a": "364",
        "h": "3 hundreds, 6 tens, 4 ones put together!",
        "e": "Great job understanding place value! Knowing hundreds, tens, and ones helps you build and compare numbers. Keep learning! 🧠"
      },
      {
        "q": "Expanded form of 527?",
        "a": "500 + 20 + 7",
        "h": "5 hundreds = 500, 2 tens = 20, 7 ones = 7",
        "e": "We use hundreds, tens, and ones to build numbers. This helps us understand what each digit means! 💯"
      },
      {
        "q": "Word form of 150?",
        "a": "one hundred fifty",
        "h": "1 hundred and 5 tens = one hundred fifty",
        "e": "Remember, the place a digit holds tells us its value. It's like a special address! ✨"
      }
    ],
    "qBank": [
      {
        "t": "What is the expanded form of 352?",
        "o": [
          "300+50+2",
          "300+5+2",
          "30+50+2",
          "350+2"
        ],
        "a": 0,
        "e": "3 Hundreds is 300, 5 Tens is 50, and 2 Ones is 2. Add them up! So, 352. 👍",
        "d": "e"
      },
      {
        "t": "What is 200 + 40 + 7?",
        "o": [
          "247",
          "274",
          "427",
          "742"
        ],
        "a": 0,
        "e": "2 Hundreds, 4 Tens, and 7 Ones come together to make the number 247. Great job! 🥳",
        "d": "m"
      },
      {
        "t": "What is the expanded form of 806?",
        "o": [
          "800+6",
          "80+6",
          "8+0+6",
          "800+0+6"
        ],
        "a": 3,
        "e": "8 Hundreds is 800. 0 Tens means no tens. 6 Ones is 6. So, 800 + 0 + 6 makes 806! ✅",
        "d": "e"
      },
      {
        "t": "What is 500 + 30 + 1?",
        "o": [
          "531",
          "513",
          "315",
          "135"
        ],
        "a": 0,
        "e": "5 Hundreds (500), 3 Tens (30), and 1 One (1) make the number 531. You got it! 🌟",
        "d": "m"
      },
      {
        "t": "What is the word form of 425?",
        "o": [
          "four hundred twenty-five",
          "four twenty-five",
          "four hundred fifty-two",
          "four hundred two"
        ],
        "a": 0,
        "e": "400 is four hundred, 20 is twenty, and 5 is five. Put them together to say four hundred twenty-five! 🎉",
        "d": "e"
      },
      {
        "t": "What is 400 + 0 + 9?",
        "o": [
          "490",
          "904",
          "940",
          "409"
        ],
        "a": 3,
        "e": "4 Hundreds, 0 Tens, and 9 Ones means 400 and 9. The zero holds the tens place. So, 409! 👍",
        "d": "m"
      },
      {
        "t": "What is the expanded form of 671?",
        "o": [
          "600+71",
          "600+7+1",
          "600+70+1",
          "67+1"
        ],
        "a": 2,
        "e": "6 Hundreds is 600, 7 Tens is 70, and 1 One is 1. We show each part added together! So, 600+70+1. ✨",
        "d": "e"
      },
      {
        "t": "What is 300 + 80 + 0?",
        "o": [
          "308",
          "830",
          "803",
          "380"
        ],
        "a": 3,
        "e": "3 Hundreds, 8 Tens, and 0 Ones make 380. The zero holds the ones place, so no ones are added! 🥳",
        "d": "m"
      },
      {
        "t": "What is the word form of 250?",
        "o": [
          "two hundred five",
          "two hundred fifty",
          "two fifty",
          "two hundred fifteen"
        ],
        "a": 1,
        "e": "200 is two hundred and 50 is fifty. Put them together to say two hundred fifty! You're a star! ⭐",
        "d": "e"
      },
      {
        "t": "What is 700 + 60 + 4?",
        "o": [
          "746",
          "674",
          "467",
          "764"
        ],
        "a": 3,
        "e": "7 Hundreds (700), 6 Tens (60), and 4 Ones (4) make the number 764. Awesome work! 🤩",
        "d": "m"
      },
      {
        "t": "What is the expanded form of 103?",
        "o": [
          "100+3",
          "100+0+3",
          "10+3",
          "1+0+3"
        ],
        "a": 1,
        "e": "1 Hundred is 100. 0 Tens is 0. 3 Ones is 3. We show each part added together. So, 100+0+3! ✅",
        "d": "e"
      },
      {
        "t": "What is 900 + 0 + 0?",
        "o": [
          "9",
          "90",
          "900",
          "9000"
        ],
        "a": 2,
        "e": "9 Hundreds is 900. 0 Tens and 0 Ones mean no tens or ones. The zeros hold their places. So, 900! ✨",
        "d": "m"
      },
      {
        "t": "What is the standard form of 600 + 50 + 8?",
        "o": [
          "568",
          "658",
          "685",
          "865"
        ],
        "a": 1,
        "e": "When you add 600, 50, and 8, you get 6 hundreds, 5 tens, and 8 ones. That makes the number 658! 💯",
        "d": "h"
      },
      {
        "t": "What is the word form of 317?",
        "o": [
          "thirty-one seven",
          "three hundred seventy-one",
          "three hundred seventeen",
          "thirty-seventeen"
        ],
        "a": 2,
        "e": "300 is three hundred. 10 and 7 make seventeen. Put them together to say three hundred seventeen! 🎉",
        "d": "e"
      },
      {
        "t": "What is the expanded form of 480?",
        "o": [
          "400+80",
          "400+8+0",
          "400+80+0",
          "48+0"
        ],
        "a": 2,
        "e": "4 Hundreds is 400. 8 Tens is 80. 0 Ones is 0. We show each part added together. So, 400+80+0! ✅",
        "d": "e"
      },
      {
        "t": "What is 100 + 20 + 3?",
        "o": [
          "123",
          "132",
          "213",
          "321"
        ],
        "a": 0,
        "e": "1 Hundred (100), 2 Tens (20), and 3 Ones (3) make the number 123. Super work! 🌟",
        "d": "m"
      },
      {
        "t": "What is the standard form of five hundred sixty-two?",
        "o": [
          "526",
          "562",
          "625",
          "652"
        ],
        "a": 1,
        "e": "When you add 500, 60, and 2, you get 5 hundreds, 6 tens, and 2 ones. That makes the number 562! 🥳",
        "d": "e"
      },
      {
        "t": "What is 200 + 90 + 5?",
        "o": [
          "259",
          "295",
          "529",
          "952"
        ],
        "a": 1,
        "e": "2 Hundreds (200), 9 Tens (90), and 5 Ones (5) make the number 295. You're so smart! 😎",
        "d": "m"
      },
      {
        "t": "What is the expanded form of 900?",
        "o": [
          "9+0+0",
          "90+0",
          "900+0+0",
          "9+00+0"
        ],
        "a": 2,
        "e": "\"H\" means hundreds. 9 hundreds is 900. The tens and ones are zero. So it's 900! ✨",
        "d": "e"
      },
      {
        "t": "What is 400 + 60 + 0?",
        "o": [
          "406",
          "460",
          "604",
          "640"
        ],
        "a": 1,
        "e": "4 hundreds is 400. 6 tens is 60. 0 ones is 0. Put them together: 460! 👍",
        "d": "m"
      },
      {
        "t": "What is the word form of 708?",
        "o": [
          "seventy-eight",
          "seven hundred eighty",
          "seven hundred eight",
          "seventy hundred eight"
        ],
        "a": 2,
        "e": "700 has 7 hundreds. Adding 8 ones means you have 7 hundreds, 0 tens, 8 ones. That's seven hundred eight! 🔢",
        "d": "e"
      },
      {
        "t": "What is the expanded form of 535?",
        "o": [
          "500+35",
          "500+3+5",
          "500+30+5",
          "530+5"
        ],
        "a": 2,
        "e": "\"H\" means hundreds (500). \"T\" means tens (30). \"O\" means ones (5). We show the value of each part! 💡",
        "d": "m"
      },
      {
        "t": "What is 800 + 70 + 0?",
        "o": [
          "807",
          "870",
          "780",
          "708"
        ],
        "a": 1,
        "e": "8 hundreds is 800. 7 tens is 70. 0 ones is 0. Combine them to get 870! Great job! 🎉",
        "d": "m"
      },
      {
        "t": "What is the standard form of three hundred forty?",
        "o": [
          "304",
          "430",
          "403",
          "340"
        ],
        "a": 3,
        "e": "300 has 3 hundreds. 40 has 4 tens. Together, you have 3 hundreds, 4 tens, 0 ones. That's 340! ✅",
        "d": "e"
      },
      {
        "t": "What is 100 + 0 + 7?",
        "o": [
          "107",
          "170",
          "710",
          "701"
        ],
        "a": 0,
        "e": "1 hundred is 100. 0 tens means no tens, so we use a 0. 7 ones is 7. Put it together: 107! 🌟",
        "d": "m"
      },
      {
        "t": "What is the expanded form of 999?",
        "o": [
          "900+9+9",
          "900+99",
          "900+90+9",
          "9+90+900"
        ],
        "a": 2,
        "e": "\"H\" means hundreds (900). \"T\" means tens (90). \"O\" means ones (9). We show what each part is worth! 👍",
        "d": "m"
      },
      {
        "t": "What is 600 + 0 + 3?",
        "o": [
          "603",
          "630",
          "360",
          "306"
        ],
        "a": 0,
        "e": "6 hundreds is 600. 0 tens means no tens, so we write a 0 in that spot. 3 ones is 3. So it's 603! ✨",
        "d": "m"
      },
      {
        "t": "What is the word form of 840?",
        "o": [
          "eighty-four",
          "eight hundred four",
          "eight hundred forty",
          "eight four zero"
        ],
        "a": 2,
        "e": "800 and 40 make 840. To write it, say the hundreds part (eight hundred), then the tens (forty)! ✍️",
        "d": "e"
      },
      {
        "t": "What is 300 + 50 + 0?",
        "o": [
          "305",
          "530",
          "503",
          "350"
        ],
        "a": 3,
        "e": "3 hundreds is 300. 5 tens is 50. 0 ones is 0. When you put them together, you get 350! Good job! 😊",
        "d": "m"
      },
      {
        "t": "What is the expanded form of 762?",
        "o": [
          "700+6+2",
          "70+60+2",
          "762",
          "700+60+2"
        ],
        "a": 3,
        "e": "\"H\" means hundreds (700). \"T\" means tens (60). \"O\" means ones (2). We show the value of each place! 💯",
        "d": "m"
      },
      {
        "t": "How do you write 245 in words?",
        "o": [
          "Two hundred forty-five",
          "Two hundred fifty-four",
          "Two forty-five",
          "Twenty-four five"
        ],
        "a": 0,
        "e": "Start with the hundreds (two hundred). Then say the tens and ones together (forty-five). So it's two hundred forty-five! 🗣️",
        "d": "m"
      },
      {
        "t": "What is the standard form of three hundred twelve?",
        "o": [
          "3,012",
          "312",
          "321",
          "213"
        ],
        "a": 1,
        "e": "\"Three hundred\" is 3 in the hundreds place. \"Twelve\" is 1 ten and 2 ones. So it's 312 in standard form! ✅",
        "d": "e"
      },
      {
        "t": "What is 400 + 30 + 7?",
        "o": [
          "437",
          "4,307",
          "473",
          "347"
        ],
        "a": 0,
        "e": "400 is 4 hundreds. 30 is 3 tens. 7 is 7 ones. Put them together to make 437! You're doing great! ✨",
        "d": "m"
      },
      {
        "t": "How do you write 860 in expanded form?",
        "o": [
          "800 + 60",
          "800 + 60 + 0",
          "86 + 0",
          "8 + 6 + 0"
        ],
        "a": 1,
        "e": "8 hundreds is 800. 6 tens is 60. 0 ones is 0. Expanded form shows the value of each digit! 📝",
        "d": "m"
      },
      {
        "t": "Which is the word form of 519?",
        "o": [
          "Five nineteen",
          "Five hundred nineteen",
          "Fifty-one nine",
          "Five hundred ninety-one"
        ],
        "a": 1,
        "e": "Start with the hundreds (five hundred). Then say the tens and ones together (nineteen). So it's five hundred nineteen! 📚",
        "d": "m"
      },
      {
        "t": "What is the standard form of 200 + 50 + 3?",
        "o": [
          "253",
          "2,503",
          "235",
          "523"
        ],
        "a": 0,
        "e": "200 is 2 hundreds. 50 is 5 tens. 3 is 3 ones. Add them up to get 253! You got it! 🎉",
        "d": "h"
      },
      {
        "t": "How do you write seven hundred four?",
        "o": [
          "740",
          "704",
          "74",
          "7,004"
        ],
        "a": 1,
        "e": "\"Seven hundred\" is 7 in the hundreds place. \"Four\" is 4 ones. Since there are no tens, we put a 0 in the tens place! 💡",
        "d": "e"
      },
      {
        "t": "Which shows 651 in expanded form?",
        "o": [
          "600 + 50 + 1",
          "6 + 5 + 1",
          "650 + 1",
          "65 + 1"
        ],
        "a": 0,
        "e": "6 hundreds is 600. 5 tens is 50. 1 one is 1. We show the value of each digit in expanded form! ➕",
        "d": "m"
      },
      {
        "t": "Amy wrote five hundred thirty. Which number is that?",
        "o": [
          "513",
          "530",
          "503",
          "5,030"
        ],
        "a": 1,
        "e": "530 is correct! Five hundreds (500) and thirty (3 tens, 0 ones) combine to make 530. Great job! 💯",
        "d": "e"
      },
      {
        "t": "What is 100 + 90 + 2?",
        "o": [
          "912",
          "192",
          "129",
          "1,092"
        ],
        "a": 1,
        "e": "100 (1 hundred) + 90 (9 tens) + 2 (2 ones) makes 192. Each part fills a place! You got it! ✅",
        "d": "m"
      },
      {
        "t": "How do you write 408 in words?",
        "o": [
          "Four hundred eight",
          "Four hundred eighty",
          "Forty-eight",
          "Four zero eight"
        ],
        "a": 0,
        "e": "408 is 'four hundred eight.' The 0 means zero tens. We don't say the 0, but it holds the tens place! 💡",
        "d": "m"
      },
      {
        "t": "Which is the expanded form of 370?",
        "o": [
          "37 + 0",
          "300 + 70 + 0",
          "300 + 7",
          "3 + 7 + 0"
        ],
        "a": 1,
        "e": "Yes! 370 breaks into 300 (3 hundreds), 70 (7 tens), and 0 (0 ones). Each digit shows its value! 🥳",
        "d": "m"
      },
      {
        "t": "Jake says nine hundred sixteen is 960. Is he right?",
        "o": [
          "Yes",
          "No, it is 916",
          "No, it is 906",
          "No, it is 196"
        ],
        "a": 1,
        "e": "916 is correct! Sixteen (16) is 1 ten and 6 ones. Sixty (60) is 6 tens. Listen carefully to the words! 👂",
        "d": "m"
      },
      {
        "t": "What is the standard form of 700 + 8?",
        "o": [
          "78",
          "780",
          "708",
          "7,008"
        ],
        "a": 2,
        "e": "700 + 8 = 708. We have 0 tens, so a 0 goes in the tens place. It holds the spot between hundreds and ones! 🔢",
        "d": "h"
      },
      {
        "t": "Which number is written in word form?",
        "o": [
          "452",
          "400 + 50 + 2",
          "Four hundred fifty-two",
          "4 hundreds 5 tens 2 ones"
        ],
        "a": 2,
        "e": "'Four hundred fifty-two' is word form. We use words to write the number, like we say it. You got it! ✍️",
        "d": "e"
      },
      {
        "t": "How do you write 999 in expanded form?",
        "o": [
          "900 + 90 + 9",
          "9 + 9 + 9",
          "999",
          "99 + 9"
        ],
        "a": 0,
        "e": "999 = 900 + 90 + 9. Each 9 has a different value because of its place. The hundreds 9 is bigger! 👍",
        "d": "m"
      },
      {
        "t": "What is the word form of 110?",
        "o": [
          "One hundred ten",
          "One hundred one",
          "Eleven",
          "One ten"
        ],
        "a": 0,
        "e": "110 is 'one hundred ten.' It means 1 hundred, 1 ten, and 0 ones. Each digit fills a place! You're a pro! ✨",
        "d": "e"
      },
      {
        "t": "Maria wrote 300 + 20 + 6. What number is that?",
        "o": [
          "326",
          "362",
          "236",
          "3,206"
        ],
        "a": 0,
        "e": "300 + 20 + 6 = 326. Add the hundreds, tens, and ones. They combine to make the standard form! Good job! ➕",
        "d": "h"
      },
      {
        "t": "Which is the expanded form of 205?",
        "o": [
          "200 + 5",
          "200 + 0 + 5",
          "20 + 5",
          "2 + 0 + 5"
        ],
        "a": 1,
        "e": "205 = 200 + 0 + 5. Even if there are 0 tens, we show it in expanded form. Every place value has a spot! ✔️",
        "d": "m"
      },
      {
        "t": "What number is six hundred one?",
        "o": [
          "610",
          "601",
          "61",
          "6,001"
        ],
        "a": 1,
        "e": "601 is correct! Six hundred one means 6 hundreds, 0 tens, 1 one. Don't mix it up with sixty-one (610)! 🧐",
        "d": "e"
      },
      {
        "t": "What is 600 + 30 + 8 in standard form?",
        "o": [
          "6,308",
          "6,038",
          "638",
          "368"
        ],
        "a": 2,
        "e": "600 + 30 + 8 = 638. When you add the parts, they combine to make the standard form, written with digits! ✅",
        "d": "h"
      },
      {
        "t": "Which number is shown in expanded form?",
        "o": [
          "523",
          "500 + 20 + 3",
          "Five hundred twenty-three",
          "5 hundreds 2 tens 3 ones"
        ],
        "a": 1,
        "e": "500 + 20 + 3 is expanded form. It breaks the number into its hundreds, tens, and ones parts with addition! 👏",
        "d": "e"
      },
      {
        "t": "Is 400 + 20 + 8 the same as 428?",
        "o": [
          "Yes, they are equal",
          "No, 400 + 20 + 8 = 4,208",
          "No, 400 + 20 + 8 = 482",
          "No, they are close but not the same"
        ],
        "a": 0,
        "e": "400 + 20 + 8 = 428. Expanded form and standard form are just two ways to show the same number. You got it! 👍",
        "d": "h"
      },
      {
        "t": "300 + __ + 6 = 376. What goes in the blank?",
        "o": [
          "7",
          "70",
          "76",
          "700"
        ],
        "a": 1,
        "e": "376 = 300 + 70 + 6. The 7 is in the tens place, so its value is 70. You found the missing tens part! 🤩",
        "d": "h"
      },
      {
        "t": "Leo writes the word form of 802 as 'eight hundred twenty.' What should it be?",
        "o": [
          "Eight hundred twenty",
          "Eight hundred two",
          "Eighty-two",
          "Eight hundred twelve"
        ],
        "a": 1,
        "e": "802 is 'eight hundred two.' The 0 means zero tens. Leo heard 'two' and thought 'twenty.' Good catch! 💯",
        "d": "h"
      },
      {
        "t": "Which two ways show the SAME number?",
        "o": [
          "306 and 300 + 60",
          "490 and 400 + 90 + 0",
          "715 and 700 + 50 + 1",
          "243 and 200 + 40 + 30"
        ],
        "a": 1,
        "e": "400 + 90 + 0 = 490. This expanded form matches the standard form perfectly. Each part finds its place! 🎉",
        "d": "e"
      },
      {
        "t": "Nora wrote 1,052 in expanded form as 1,000 + 52. Is there a better way?",
        "o": [
          "No, that is correct",
          "Yes: 1,000 + 50 + 2",
          "Yes: 1,000 + 500 + 2",
          "Yes: 100 + 50 + 2"
        ],
        "a": 1,
        "e": "1,052 = 1,000 + 50 + 2. Expanded form breaks apart each value. We don't need to write +0 when there are zero tens! 💡",
        "d": "h"
      },
      {
        "t": "How do you write one thousand two hundred in standard form?",
        "o": [
          "1,200",
          "1,002",
          "12,000",
          "120"
        ],
        "a": 0,
        "e": "1,200 is correct! One thousand (1,000) plus two hundred (200) combine to make the number. You're a math whiz! 🌟",
        "d": "e"
      },
      {
        "t": "__ + 40 + 5 = 945. What goes in the blank?",
        "o": [
          "9",
          "90",
          "900",
          "9,000"
        ],
        "a": 2,
        "e": "You took away the tens (40) and ones (5) from 945. Only the hundreds (900) are left! Correct. ✨",
        "d": "h"
      },
      {
        "t": "Ella says 700 + 15 is the same as 715. Is she correct?",
        "o": [
          "Yes, 700 + 15 = 715",
          "No, it equals 7,015",
          "No, it equals 850",
          "No, it equals 7,150"
        ],
        "a": 0,
        "e": "700 has no tens or ones. Adding 15 gives you 7 hundreds, 1 ten, and 5 ones. So, 715. Great job! 👍",
        "d": "h"
      },
      {
        "t": "Which is NOT a correct way to write 358?",
        "o": [
          "300 + 50 + 8",
          "Three hundred fifty-eight",
          "35 tens and 8 ones",
          "300 + 80 + 5"
        ],
        "a": 3,
        "e": "300 + 80 + 5 means 3 hundreds, 8 tens, 5 ones. That's 385. The others make 358. Careful with tens! 🤔",
        "d": "m"
      },
      {
        "t": "Write the number that is the same as nine hundred forty in expanded form.",
        "o": [
          "900 + 40",
          "900 + 4",
          "90 + 40",
          "9 + 4 + 0"
        ],
        "a": 0,
        "e": "\"Nine hundred forty\" means 9 hundreds (900) and 4 tens (40). So, 900 + 40 is the right expanded form! ✅",
        "d": "e"
      },
      {
        "t": "Kevin wrote 'five hundred sixty-three' as 500603. What did he do wrong?",
        "o": [
          "He wrote each part separately instead of combining",
          "He put too many zeros",
          "He switched the digits",
          "Nothing, he is right"
        ],
        "a": 0,
        "e": "You need to add place values together! 500 + 60 + 3 makes 563. Just putting them side by side is tricky. 👍",
        "d": "h"
      },
      {
        "t": "What is the expanded form of 1,006?",
        "o": [
          "1,000 + 6",
          "1,000 + 60",
          "100 + 6",
          "1,000 + 0 + 0 + 6"
        ],
        "a": 3,
        "e": "Expanded form shows each place value. 1,006 is 1 thousand and 6 ones. You can show the zero tens and hundreds or skip them! ✨",
        "d": "e"
      },
      {
        "t": "Sara says 260 in word form is 'two hundred and six.' What is the correct word form?",
        "o": [
          "Two hundred six",
          "Two hundred sixty",
          "Twenty-six",
          "Two sixty"
        ],
        "a": 1,
        "e": "\"Sixty\" means 6 tens, so the 6 goes in the tens place (260). \"Six\" means 6 ones (206). Listen for the place! 👂",
        "d": "h"
      },
      {
        "t": "Which expanded form equals 809?",
        "o": [
          "800 + 90",
          "800 + 0 + 9",
          "80 + 9",
          "800 + 9 + 0"
        ],
        "a": 1,
        "e": "The zero in 809 is important! It shows there are no tens, just 8 hundreds and 9 ones. It holds the tens place. 🔢",
        "d": "m"
      },
      {
        "t": "Tom says 500 + 30 + 12 is not in proper expanded form. Why?",
        "o": [
          "Because 12 has two digits",
          "Because you cannot add three numbers",
          "Because 500 is too big",
          "Tom is wrong, it is fine"
        ],
        "a": 0,
        "e": "Expanded form breaks a number into *each* place value. 12 is 1 ten and 2 ones. So, 500 + 40 + 2 makes 542! ✨",
        "d": "h"
      },
      {
        "t": "What number does this show: 1,000 + 100 + 20 + 5?",
        "o": [
          "1,125",
          "11,025",
          "1,000,125",
          "10,125"
        ],
        "a": 0,
        "e": "You are building the number by adding each place value. 1 thousand + 1 hundred + 2 tens + 5 ones = 1,125. Super! ✅",
        "d": "h"
      },
      {
        "t": "Which shows the same number as eight hundred five?",
        "o": [
          "850",
          "805",
          "800 + 50",
          "8,005"
        ],
        "a": 1,
        "e": "\"Five\" means 5 ones (805). \"Fifty\" means 5 tens (850). Listen carefully to the word for the tens place! 👂",
        "d": "e"
      },
      {
        "t": "Fill in the blank: 147 = ___ + 40 + 7",
        "o": [
          "1",
          "10",
          "100",
          "140"
        ],
        "a": 2,
        "e": "The digit 1 is in the hundreds place. So, its value is 1 hundred, which is 100. Easy peasy! ✨",
        "d": "h"
      },
      {
        "t": "Lily wrote 600 + 40 + 15 in standard form as 6,415. What mistake did she make?",
        "o": [
          "She added wrong",
          "She put digits side by side instead of adding",
          "She forgot to regroup",
          "She switched the tens and ones"
        ],
        "a": 1,
        "e": "6 hundreds, 4 tens, and 15 ones means 600 + 40 + 15. Regroup 15 ones to 1 ten and 5 ones. So, 655! ✅",
        "d": "h"
      },
      {
        "t": "Marcus wrote 1,072 three ways. Which one is WRONG?",
        "o": [
          "1,000 + 70 + 2",
          "One thousand seventy-two",
          "1,000 + 700 + 2",
          "10 hundreds + 7 tens + 2 ones"
        ],
        "a": 2,
        "e": "700 means 7 hundreds. So, 1,000 + 700 + 2 makes 1,702. 70 means 7 tens. Big difference! 🧐",
        "d": "e"
      },
      {
        "t": "Ava wrote 'four hundred sixteen' as 4016. What should the correct number be?",
        "o": [
          "4,016",
          "416",
          "4,160",
          "460"
        ],
        "a": 1,
        "e": "\"Sixteen\" is 1 ten and 6 ones (16). You add it to 400. So, 400 + 16 = 416. Don't write them side by side! 👍",
        "d": "h"
      },
      {
        "t": "Which number can be written as 11 hundreds + 5 tens + 3 ones?",
        "o": [
          "1,153",
          "1,503",
          "11,053",
          "153"
        ],
        "a": 0,
        "e": "11 hundreds is 1,100. You regroup 10 hundreds to make 1 thousand. Then add 50 + 3. So, 1,100 + 53 = 1,153! ✨",
        "d": "e"
      },
      {
        "t": "Two students write 837 in expanded form. Kai writes 800 + 30 + 7. Zoe writes 800 + 37. Who is correct?",
        "o": [
          "Only Kai",
          "Only Zoe",
          "Both are correct",
          "Neither is correct"
        ],
        "a": 2,
        "e": "Both ways show 8 hundreds, 3 tens, and 7 ones! 30 + 7 is the same as 37. They both make 837. Good thinking! 🧠",
        "d": "h"
      },
      {
        "t": "Write 500 + 130 + 4 in standard form.",
        "o": [
          "5,134",
          "634",
          "504",
          "513"
        ],
        "a": 1,
        "e": "130 has 1 hundred and 3 tens. Regroup the extra hundred with 500. So, 500 + 100 + 30 + 4 = 634. You got it! ✅",
        "d": "h"
      },
      {
        "t": "Eli says the expanded form of 1,200 is 1,000 + 200. His teacher says he can also write it as 12 hundreds. Are both right?",
        "o": [
          "Only Eli is right",
          "Only the teacher is right",
          "Both are right",
          "Neither is right"
        ],
        "a": 2,
        "e": "12 hundreds means 1 thousand and 2 hundreds, which is 1,200. 1,000 + 200 also makes 1,200. Both are right! 🎉",
        "d": "h"
      },
      {
        "t": "Dani writes the word form of 1,108 as 'one thousand one hundred eight.' Her friend writes 'one thousand one hundred and eight.' Who is correct?",
        "o": [
          "Only Dani",
          "Only her friend",
          "Both are correct",
          "Neither is correct"
        ],
        "a": 2,
        "e": "Adding \"and\" or not doesn't change the number! Both ways mean 1 thousand, 1 hundred, and 8 ones. It's 1,108. Good job! 👍",
        "d": "h"
      },
      {
        "t": "900 + __ + 14 = 964. What goes in the blank?",
        "o": [
          "50",
          "64",
          "5",
          "54"
        ],
        "a": 0,
        "e": "We know 900 + 50 + 14 = 964. The missing part is 50 because 964 - 900 = 64, and 64 - 14 = 50. Great job! 👍",
        "d": "h"
      },
      {
        "t": "Mr. Chen asks: 'Write 708 in expanded form.' Three students answer. Who is WRONG?\nA) 700 + 8\nB) 700 + 0 + 8\nC) 70 + 8",
        "o": [
          "A is wrong",
          "B is wrong",
          "C is wrong",
          "They are all correct"
        ],
        "a": 2,
        "e": "708 means 7 hundreds, 0 tens, and 8 ones. 70 + 8 is 78. We need 700! Both A and B show 700 + 8 = 708. So they are correct! 💯",
        "d": "h"
      },
      {
        "t": "A number in expanded form is 1,000 + 100 + 50 + 12. What is it in standard form?",
        "o": [
          "1,1512",
          "1,162",
          "11,512",
          "1,152"
        ],
        "a": 1,
        "e": "To find the total, we add each part. 1,000 + 100 + 50 + 12 = 1,162. Remember to regroup 12 ones as 1 ten and 2 ones! Great work! 👍",
        "d": "h"
      },
      {
        "t": "Rosa writes three hundred nine as 3009. Oscar writes it as 309. Who is correct and why?",
        "o": [
          "Rosa, because three hundred = 300 and nine = 09",
          "Oscar, because 300 + 9 = 309",
          "Both are correct",
          "Neither is correct"
        ],
        "a": 1,
        "e": "Three hundred nine means 3 hundreds, 0 tens, and 9 ones. That's 309! Oscar is correct. Rosa forgot the 0 in the tens place. ✍️",
        "d": "h"
      },
      {
        "t": "Which expanded form is WRONG for 555?",
        "o": [
          "500 + 50 + 5",
          "5 hundreds + 5 tens + 5 ones",
          "55 tens + 5 ones",
          "500 + 55 + 5"
        ],
        "a": 3,
        "e": "500 + 55 + 5 = 560. This is not 555. The other options correctly show 555. Remember 55 tens is 550! You got this! 💪",
        "d": "m"
      },
      {
        "t": "Tyler says he can write 476 as 4 hundreds + 7 tens + 6 ones OR as 3 hundreds + 17 tens + 6 ones. Is the second way correct?",
        "o": [
          "No, you cannot have 17 tens",
          "Yes, 300 + 170 + 6 = 476",
          "No, that equals 376",
          "Yes, but only the first way is proper"
        ],
        "a": 1,
        "e": "300 + 170 + 6 = 476. This is correct! Remember, 17 tens is the same as 170. We can add hundreds, tens, and ones together. ✔️",
        "d": "h"
      },
      {
        "t": "What is wrong with this: 'Two hundred thirteen = 200 + 30 + 1'?",
        "o": [
          "Nothing, it is correct",
          "The tens and ones are switched: should be 200 + 10 + 3",
          "It should be 2,013",
          "Thirteen means 30, not 13"
        ],
        "a": 1,
        "e": "Thirteen is 1 ten and 3 ones (13). So 213 is 200 + 10 + 3. The student mixed up the tens and ones for thirteen. Keep practicing! 🧐",
        "d": "h"
      },
      {
        "t": "Write the number: 'The thousands digit is 1, the hundreds digit is the same as the ones digit, the tens digit is 0, and the ones digit is 3.'",
        "o": [
          "1,303",
          "1,003",
          "1,030",
          "1,330"
        ],
        "a": 0,
        "e": "Let's build the number! 1 thousand, 3 hundreds, 0 tens, and 3 ones. That makes 1,303. Each digit has its own place! 🔢",
        "d": "e"
      },
      {
        "t": "Mia says 200 + 60 + 18 = 278. Is she right?",
        "o": [
          "Yes",
          "No, it equals 268",
          "No, it equals 2,618",
          "No, it equals 878"
        ],
        "a": 0,
        "e": "We add the hundreds, tens, and ones. 200 + 60 = 260. Then 260 + 18 = 278. Mia is correct because her sum is right! ✅",
        "d": "h"
      },
      {
        "t": "A number has these clues: In expanded form, the hundreds part is 900. The word form ends with 'eleven.' What is the number?",
        "o": [
          "911",
          "901",
          "9,011",
          "9,110"
        ],
        "a": 0,
        "e": "Nine hundred eleven means 9 hundreds and 11 ones. 11 ones is 1 ten and 1 one. So the number is 911. You got it! ✨",
        "d": "h"
      },
      {
        "t": "Which is the correct expanded form of 1,050?",
        "o": [
          "1,000 + 50",
          "1,000 + 500",
          "100 + 50",
          "1,000 + 0 + 50 + 0"
        ],
        "a": 3,
        "e": "Expanded form shows the value of each digit. 1,050 has 1 thousand, 0 hundreds, 5 tens, and 0 ones. So 1,000 + 0 + 50 + 0 is the fullest form. 📝",
        "d": "e"
      },
      {
        "t": "James says 'twelve hundred' and 'one thousand two hundred' are different numbers. Is he right?",
        "o": [
          "Yes, twelve hundred = 1,200 and one thousand two hundred = 12,000",
          "Yes, they sound different so they must be different",
          "No, both equal 1,200",
          "No, both equal 12,000"
        ],
        "a": 2,
        "e": "Twelve hundred means 12 groups of 100, which is 1,200. One thousand two hundred is also 1,200. They are the same number! 💡",
        "d": "e"
      }
    ],
    "quiz": [
      {
        "t": "What is the expanded form of 294?",
        "o": [
          "200+90+4",
          "200+9+4",
          "20+90+4",
          "200+94"
        ],
        "a": 0,
        "e": "294 means 2 hundreds, 9 tens, and 4 ones. We can write this as 200 + 90 + 4. It's how we break apart the number! 🧩"
      },
      {
        "t": "What is 200 + 30 + 7?",
        "o": [
          "237",
          "327",
          "273",
          "372"
        ],
        "a": 0,
        "e": "When we put 2 hundreds, 3 tens, and 7 ones together, we get the number 237. Each digit has its own special place! 🏗️"
      },
      {
        "t": "What is 400 + 50 + 1?",
        "o": [
          "541",
          "415",
          "451",
          "514"
        ],
        "a": 2,
        "e": "Combine 4 hundreds, 5 tens, and 1 one to make the number 451. Each digit tells us its value in the number! 🔢"
      },
      {
        "t": "What is the word form of 315?",
        "o": [
          "thirty-one five",
          "three fifteen",
          "three hundred fifteen",
          "three hundred fifty-one"
        ],
        "a": 2,
        "e": "The number 315 is read as \"three hundred fifteen.\" We say the hundreds, then the tens and ones together! 🗣️"
      },
      {
        "t": "Which standard form matches \"five hundred sixty-eight\"?",
        "o": [
          "586",
          "568",
          "856",
          "685"
        ],
        "a": 1,
        "e": "Five hundred sixty-eight means 5 hundreds, 6 tens, and 8 ones. Put them together to make 568! You wrote it perfectly. ✍️"
      },
      {
        "t": "What is the expanded form of 709?",
        "o": [
          "700+9",
          "700+0+9",
          "70+09",
          "700+90+9"
        ],
        "a": 1,
        "e": "709 has 7 hundreds, 0 tens, and 9 ones. So we write it as 700 + 0 + 9. The 0 shows there are no tens! 🧐"
      }
    ]
  },
  {
    "points": [
      "< means LESS THAN (smaller number on the left)",
      "> means GREATER THAN (bigger number on the left)",
      "Compare HUNDREDS first, then tens, then ones"
    ],
    "examples": [
      {
        "c": "#c0392b",
        "tag": "Compare",
        "p": "342 vs 367",
        "s": "Hundreds are the same (3=3). Compare tens: 4 vs 6. Since 4 < 6...",
        "a": "342 < 367 ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Compare",
        "p": "519 vs 491",
        "s": "Compare hundreds first: 5 vs 4. Since 5 > 4, we are done!",
        "a": "519 > 491 ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Order 3 numbers",
        "p": "Put in order: 342, 234, 423",
        "s": "Compare hundreds: 2 < 3 < 4. So least is 234, then 342, then 423.",
        "a": "234 < 342 < 423 ✅"
      }
    ],
    "practice": [
      {
        "q": "345 ___ 354 (use < or >)",
        "a": "<",
        "h": "Hundreds are the same. Tens: 4 < 5, so 345 is less!",
        "e": "Always read the question carefully to understand what it's asking. Think about the numbers and what you need to do! 🤔"
      },
      {
        "q": "621 ___ 612 (use < or >)",
        "a": ">",
        "h": "Hundreds are the same. Tens: 2 > 1, so 621 is greater!",
        "e": "It's important to check your answer! Does it make sense? You are doing great work! ✨"
      },
      {
        "q": "Order least to greatest: 415, 451, 145",
        "a": "145, 415, 451",
        "h": "Look at hundreds first: 1 < 4 = 4. Then check tens for the 400s!",
        "e": "You compared the numbers carefully! You're learning so much! ✨"
      }
    ],
    "qBank": [
      {
        "t": "Which symbol goes in the blank? 527 ___ 572",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 0,
        "e": "Hundreds are the same! So, look at the tens. 2 tens is less than 7 tens. That means 527 < 572. Great thinking! 👍",
        "d": "e"
      },
      {
        "t": "Which is greater: 384 or 438?",
        "o": [
          "384",
          "438",
          "Equal",
          "Cannot tell"
        ],
        "a": 1,
        "e": "We compare hundreds first! 3 hundreds is less than 4 hundreds. So, 438 is greater. You got it! ✅",
        "d": "e"
      },
      {
        "t": "Is this true or false? 650 > 605",
        "o": [
          "True",
          "False",
          "Maybe",
          "Cannot tell"
        ],
        "a": 0,
        "e": "The hundreds are the same! Now look at the tens. 5 tens is more than 0 tens. So, it's true! Nice work! ⭐",
        "d": "m"
      },
      {
        "t": "Put these numbers in order from least to greatest: 312, 132, 231",
        "o": [
          "132,231,312",
          "312,132,231",
          "231,132,312",
          "132,312,231"
        ],
        "a": 0,
        "e": "To put numbers in order, look at the hundreds! 1 hundred, then 2, then 3. You ordered them perfectly! 🥳",
        "d": "h"
      },
      {
        "t": "Which symbol goes in the blank? 760 ___ 760",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 2,
        "e": "When numbers are exactly the same, they are equal! You matched them up. Super smart! 🙌",
        "d": "e"
      },
      {
        "t": "What is 100 more than 523?",
        "o": [
          "524",
          "533",
          "613",
          "623"
        ],
        "a": 3,
        "e": "When you add 100, only the hundreds digit changes! 5 hundreds + 1 hundred makes 6 hundreds. So, 623. Awesome! ➕",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 199 ___ 200",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 0,
        "e": "199 is just one step back from 200. You know your numbers so well! Keep counting! 🔢",
        "d": "e"
      },
      {
        "t": "Which number is the greatest? 456, 546, or 465?",
        "o": [
          "456",
          "465",
          "546",
          "Equal"
        ],
        "a": 2,
        "e": "To find the greatest number, look at the hundreds first! 5 hundreds is more than 4 hundreds. So, 546 is greatest. Way to go! 🏆",
        "d": "m"
      },
      {
        "t": "What is 10 less than 350?",
        "o": [
          "349",
          "340",
          "360",
          "351"
        ],
        "a": 1,
        "e": "When you take away 10, only the tens digit changes! 5 tens - 1 ten makes 4 tens. So, 340. You got it! ➖",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 408 ___ 480",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 0,
        "e": "The hundreds are the same! So, look at the tens. 0 tens is less than 8 tens. You compared them perfectly! 👀",
        "d": "e"
      },
      {
        "t": "Put these numbers in order from greatest to least: 528, 258, 825",
        "o": [
          "825,528,258",
          "528,258,825",
          "258,528,825",
          "825,258,528"
        ],
        "a": 0,
        "e": "To put numbers in order from greatest, look at the hundreds! 8 hundreds, then 5, then 2. You ordered them so well! ✨",
        "d": "h"
      },
      {
        "t": "What is 100 less than 756?",
        "o": [
          "646",
          "656",
          "756",
          "856"
        ],
        "a": 1,
        "e": "When you take away 100, only the hundreds digit changes! 7 hundreds - 1 hundred makes 6 hundreds. So, 656. Great job! 📉",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 900 ___ 90",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 1,
        "e": "900 has 9 hundreds, but 90 has 0 hundreds. More hundreds means a bigger number! So, 900 > 90. Super smart! 🧠",
        "d": "e"
      },
      {
        "t": "Which is less: 742 or 724?",
        "o": [
          "742",
          "724",
          "Equal",
          "Cannot tell"
        ],
        "a": 1,
        "e": "The hundreds are the same! So, look at the tens. 2 tens is less than 4 tens. That means 724 is less. You got it! 👇",
        "d": "e"
      },
      {
        "t": "What is 10 more than 690?",
        "o": [
          "600",
          "691",
          "700",
          "790"
        ],
        "a": 2,
        "e": "Adding 10 to 690 means you have 10 tens, which is 1 hundred! You regrouped to make 700. Fantastic! 💯",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 335 ___ 353",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 0,
        "e": "The hundreds are the same! So, look at the tens. 3 tens is less than 5 tens. You compared them perfectly! 👍",
        "d": "e"
      },
      {
        "t": "Which number is in the middle when ordered least to greatest? 410, 401, 140",
        "o": [
          "140",
          "401",
          "410",
          "Equal"
        ],
        "a": 1,
        "e": "First, compare the hundreds! Then, if hundreds are the same, compare the tens. 401 is the middle number. Great job ordering! ↔️",
        "d": "h"
      },
      {
        "t": "What is 1 more than 399?",
        "o": [
          "300",
          "389",
          "398",
          "400"
        ],
        "a": 3,
        "e": "Adding 1 to 399 means you regroup all the way to the hundreds! 9+1 makes 10, so 399 + 1 = 400. Wow! ✨",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 807 ___ 780",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 1,
        "e": "Always compare hundreds first! 8 hundreds is more than 7 hundreds. So, 807 is greater than 780. You're a math star! 🌟",
        "d": "m"
      },
      {
        "t": "Which number is the least? 605, 506, or 650?",
        "o": [
          "605",
          "506",
          "650",
          "Equal"
        ],
        "a": 1,
        "e": "Look at the hundreds place first. 5 hundreds is less than 6 hundreds. So, 506 is the least number! 👍",
        "d": "m"
      },
      {
        "t": "Which symbol goes in the blank? 500 ___ 499",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 1,
        "e": "500 has 5 hundreds. 499 has 4 hundreds. 5 hundreds is more than 4 hundreds. So, 500 > 499! ✨",
        "d": "m"
      },
      {
        "t": "What is 100 more than 899?",
        "o": [
          "800",
          "900",
          "989",
          "999"
        ],
        "a": 3,
        "e": "Adding 100 means we add 1 to the hundreds place. 8 hundreds + 1 hundred = 9 hundreds. So, 899 + 100 = 999! ➕",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 234 ___ 243",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 0,
        "e": "Both numbers have the same hundreds. So, compare the tens! 3 tens is less than 4 tens. 👍",
        "d": "m"
      },
      {
        "t": "Put these numbers in order from least to greatest: 901, 190, 910",
        "o": [
          "190,901,910",
          "901,910,190",
          "910,901,190",
          "190,910,901"
        ],
        "a": 0,
        "e": "First, compare hundreds. 1 hundred is smallest. Then, compare tens for 901 and 910. 0 tens < 1 ten. So, 190 < 901 < 910!🔢",
        "d": "h"
      },
      {
        "t": "What is 10 less than 400?",
        "o": [
          "300",
          "390",
          "410",
          "490"
        ],
        "a": 1,
        "e": "When we subtract 10 from 400, we regroup 1 hundred into 10 tens. Then, 10 tens - 1 ten = 9 tens. So, 400 - 10 = 390! ➖",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 673 ___ 637",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 1,
        "e": "Both numbers have the same hundreds. So, compare the tens! 7 tens is more than 3 tens. ✨",
        "d": "m"
      },
      {
        "t": "Which number is the greatest? 289, 298, or 928?",
        "o": [
          "289",
          "298",
          "928",
          "Equal"
        ],
        "a": 2,
        "e": "Look at the hundreds place first. 9 hundreds is more than 2 hundreds. So, 928 is the greatest number! 👑",
        "d": "m"
      },
      {
        "t": "What is 1 less than 700?",
        "o": [
          "600",
          "699",
          "701",
          "709"
        ],
        "a": 1,
        "e": "When we subtract 1 from 700, we regroup 1 hundred into 10 tens, then 1 ten into 10 ones. So, 700 - 1 = 699! 🔢",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 415 ___ 415",
        "o": [
          "<",
          ">",
          "=",
          "≠"
        ],
        "a": 2,
        "e": "Both numbers have the same hundreds, tens, and ones. They are exactly the same! So, they are equal. 🤝",
        "d": "m"
      },
      {
        "t": "What is 100 more than 450?",
        "o": [
          "350",
          "451",
          "540",
          "550"
        ],
        "a": 3,
        "e": "Adding 100 means we add 1 to the hundreds place. 4 hundreds + 1 hundred = 5 hundreds. So, 450 + 100 = 550! ➕",
        "d": "e"
      },
      {
        "t": "Which is greater: 47 or 74?",
        "o": [
          "47",
          "74",
          "They are equal",
          "You cannot tell"
        ],
        "a": 1,
        "e": "Compare the tens place first. 7 tens is more than 4 tens. So, 74 is greater than 47! ✨",
        "d": "e"
      },
      {
        "t": "Which symbol goes in the blank? 385 ___ 583",
        "o": [
          ">",
          "<",
          "=",
          "+"
        ],
        "a": 1,
        "e": "Always compare the hundreds place first. 3 hundreds is less than 5 hundreds. So, 385 < 583! 🔢",
        "d": "m"
      },
      {
        "t": "Which number is the smallest: 216, 621, 162?",
        "o": [
          "216",
          "621",
          "162",
          "They are all equal"
        ],
        "a": 2,
        "e": "Compare the hundreds place first. 1 hundred is the smallest. So, 162 is the smallest number! 👇",
        "d": "m"
      },
      {
        "t": "Is 500 greater than, less than, or equal to 499?",
        "o": [
          "Greater than",
          "Less than",
          "Equal to",
          "You cannot tell"
        ],
        "a": 0,
        "e": "Compare the hundreds place first. 5 hundreds is more than 4 hundreds. So, 500 > 499! ✨",
        "d": "m"
      },
      {
        "t": "Which symbol goes in the blank? 250 ___ 250",
        "o": [
          ">",
          "<",
          "=",
          "None"
        ],
        "a": 2,
        "e": "Both numbers have the same hundreds, tens, and ones. They are exactly the same! So, 250 = 250. 🤝",
        "d": "m"
      },
      {
        "t": "Which is greater: 892 or 829?",
        "o": [
          "892",
          "829",
          "They are equal",
          "You cannot tell"
        ],
        "a": 0,
        "e": "Both have 8 hundreds. Compare the tens! 9 tens is more than 2 tens. So, 892 > 829! ✨",
        "d": "e"
      },
      {
        "t": "Put in order from least to greatest: 100, 10, 1",
        "o": [
          "100, 10, 1",
          "1, 10, 100",
          "10, 1, 100",
          "1, 100, 10"
        ],
        "a": 1,
        "e": "Compare numbers by how many digits they have. 1 has 1 digit, 10 has 2, 100 has 3. So, 1, 10, 100 is correct! 🔢",
        "d": "m"
      },
      {
        "t": "Which number is the greatest: 345, 354, 435?",
        "o": [
          "345",
          "354",
          "435",
          "They are all equal"
        ],
        "a": 2,
        "e": "Compare the hundreds place first. 4 hundreds is more than 3 hundreds. So, 435 is the greatest number! 👑",
        "d": "m"
      },
      {
        "t": "Which symbol goes in the blank? 607 ___ 670",
        "o": [
          ">",
          "<",
          "=",
          "+"
        ],
        "a": 1,
        "e": "Both have 6 hundreds. Compare the tens! 0 tens is less than 7 tens. So, 607 < 670! 🔢",
        "d": "m"
      },
      {
        "t": "Is 1,000 greater than 999?",
        "o": [
          "Yes",
          "No",
          "They are equal",
          "You cannot compare them"
        ],
        "a": 0,
        "e": "1,000 has 4 digits, 999 has 3. More digits means a bigger number! So, 1,000 > 999. ✨",
        "d": "m"
      },
      {
        "t": "Which number is less: 418 or 481?",
        "o": [
          "418",
          "481",
          "They are equal",
          "You cannot tell"
        ],
        "a": 0,
        "e": "Hundreds are the same! Look at the tens. 1 ten is less than 8 tens. So, 418 < 481. 👍",
        "d": "m"
      },
      {
        "t": "Sara has 312 stickers. Tom has 321 stickers. Who has more?",
        "o": [
          "Sara",
          "Tom",
          "They have the same",
          "You cannot tell"
        ],
        "a": 1,
        "e": "Hundreds are the same! Compare the tens. 2 tens is more than 1 ten. Tom has more. Great job! 🥳",
        "d": "h"
      },
      {
        "t": "Which symbol goes in the blank? 755 ___ 575",
        "o": [
          ">",
          "<",
          "=",
          "+"
        ],
        "a": 0,
        "e": "Start with hundreds! 7 hundreds is more than 5 hundreds. So, 755 > 575. You got it! ✅",
        "d": "m"
      },
      {
        "t": "Which is the greatest number: 199, 200, 188?",
        "o": [
          "199",
          "200",
          "188",
          "They are all equal"
        ],
        "a": 1,
        "e": "Look for the most hundreds! 200 has 2 hundreds. 199 and 188 only have 1. 200 is the greatest! ⭐",
        "d": "m"
      },
      {
        "t": "Is 340 greater than or less than 304?",
        "o": [
          "Greater than",
          "Less than",
          "Equal to",
          "You cannot tell"
        ],
        "a": 0,
        "e": "Hundreds are the same! Look at the tens. 4 tens is more than 0 tens. So, 340 > 304. Good thinking! 🤔",
        "d": "m"
      },
      {
        "t": "Which number comes just BEFORE 600?",
        "o": [
          "601",
          "599",
          "500",
          "610"
        ],
        "a": 1,
        "e": "Counting backwards, 599 comes right before 600. You're a counting pro! 🔢",
        "d": "e"
      },
      {
        "t": "Which number comes just AFTER 999?",
        "o": [
          "998",
          "1,000",
          "990",
          "9,910"
        ],
        "a": 1,
        "e": "Counting forward, 1,000 comes right after 999. We regroup all the way to a 4-digit number! 🎉",
        "d": "e"
      },
      {
        "t": "Leo picked a number between 450 and 460. Which could it be?",
        "o": [
          "449",
          "455",
          "461",
          "445"
        ],
        "a": 1,
        "e": "Between 450 and 460 means numbers like 451 to 459. 455 fits right in the middle! 😄",
        "d": "m"
      },
      {
        "t": "Which is less: 1,100 or 1,010?",
        "o": [
          "1,100",
          "1,010",
          "They are equal",
          "You cannot tell"
        ],
        "a": 1,
        "e": "Thousands are the same! Look at hundreds. 0 hundreds is less than 1 hundred. So, 1,010 < 1,100. 👍",
        "d": "h"
      },
      {
        "t": "Which symbol goes in the blank? 900 ___ 900",
        "o": [
          ">",
          "<",
          "=",
          "+"
        ],
        "a": 2,
        "e": "When two numbers are exactly the same, they are equal! So, 900 = 900. Perfect match! 🤝",
        "d": "m"
      },
      {
        "t": "Which symbol goes between 358 ___ 385?",
        "o": [
          ">",
          "<",
          "=",
          "+"
        ],
        "a": 1,
        "e": "Hundreds are the same! Look at the tens. 5 tens is less than 8 tens. So, 358 < 385. You're smart! 🧠",
        "d": "m"
      },
      {
        "t": "Put these in order from least to greatest: 512, 521, 215",
        "o": [
          "512, 521, 215",
          "215, 512, 521",
          "521, 512, 215",
          "215, 521, 512"
        ],
        "a": 1,
        "e": "Start with hundreds to find the smallest. Then compare tens for the others. Order: 215, 512, 521. Nicely done! ✨",
        "d": "h"
      },
      {
        "t": "Which number is closest to 800?",
        "o": [
          "750",
          "810",
          "780",
          "850"
        ],
        "a": 1,
        "e": "Closest means the smallest difference! 810 is only 10 away from 800. That's the closest! 🎯",
        "d": "e"
      },
      {
        "t": "Amy says 609 > 690 because 6 hundreds is the same and 9 > 0. What is wrong?",
        "o": [
          "Nothing, she is right",
          "She compared ones before tens",
          "She should compare tens first: 0 < 9",
          "The hundreds are different"
        ],
        "a": 2,
        "e": "Hundreds are the same, so compare tens next! 0 tens is less than 9 tens. 609 < 690. Amy needs to check her tens! 🧐",
        "d": "h"
      },
      {
        "t": "Which number is between 475 and 500?",
        "o": [
          "470",
          "505",
          "483",
          "475"
        ],
        "a": 2,
        "e": "We need a number bigger than 475 but smaller than 500. 483 fits perfectly! You found it! 🔍",
        "d": "m"
      },
      {
        "t": "Write <, >, or = for: 1,100 ___ 1,010",
        "o": [
          ">",
          "<",
          "=",
          "Cannot compare"
        ],
        "a": 0,
        "e": "Thousands are the same! Look at hundreds. 1 hundred is more than 0 hundreds. So, 1,100 > 1,010. Way to go! 🚀",
        "d": "h"
      },
      {
        "t": "Jake picked a number. It is greater than 350 but less than 360. The ones digit is 7. What is his number?",
        "o": [
          "347",
          "357",
          "367",
          "307"
        ],
        "a": 1,
        "e": "Between 350 and 360, with a 7 in the ones place, means the number is 357. You solved the puzzle! 🧩",
        "d": "h"
      },
      {
        "t": "Which list is in order from greatest to least?",
        "o": [
          "410, 401, 140",
          "140, 401, 410",
          "401, 410, 140",
          "140, 410, 401"
        ],
        "a": 0,
        "e": "Greatest to least means biggest first! Compare hundreds, then tens. The order is 410, 401, 140. Awesome! 🏆",
        "d": "e"
      },
      {
        "t": "Which number makes this true? 628 < ___",
        "o": [
          "618",
          "620",
          "627",
          "631"
        ],
        "a": 3,
        "e": "We need a number bigger than 628. Only 631 is greater than 628. You picked the right one! ✅",
        "d": "e"
      },
      {
        "t": "Rosa compared 845 and 854. She said they are equal because they use the same digits. Is she right?",
        "o": [
          "Yes, same digits means same number",
          "No, the digits are in different places so the values differ",
          "Yes, because both have 8 hundreds",
          "No, because 845 has more hundreds"
        ],
        "a": 1,
        "e": "Place value matters! In 845, 4 is 4 tens. In 854, 5 is 5 tens. 5 tens is more than 4 tens. So, 845 is less than 854. 👍",
        "d": "h"
      },
      {
        "t": "Which is greater: 1,200 or 999?",
        "o": [
          "999, because 9 > 1",
          "1,200, because it has more digits",
          "They are equal",
          "999, because all digits are bigger"
        ],
        "a": 1,
        "e": "More digits mean a bigger number! 1,200 has 4 digits. 999 has 3 digits. So, 1,200 is greater than 999. ✨",
        "d": "m"
      },
      {
        "t": "Sam has 467 baseball cards. He wants to have more than Mia, who has 476. How many more does he need?",
        "o": [
          "At least 9 more",
          "At least 10 more",
          "At least 1 more",
          "He already has more"
        ],
        "a": 1,
        "e": "Mia has 476. Sam has 467. To have more than Mia, Sam needs at least 477. That's 10 more. Sam needs 10 more! 🚀",
        "d": "h"
      },
      {
        "t": "Put these numbers on a number line. Which is farthest right? 305, 350, 503",
        "o": [
          "305",
          "350",
          "503",
          "They are all the same distance"
        ],
        "a": 2,
        "e": "On a number line, bigger numbers are on the right. Compare hundreds: 503 has 5. It's the biggest! So, 503 is farthest right. 👉",
        "d": "h"
      },
      {
        "t": "Which comparison is TRUE?",
        "o": [
          "312 > 321",
          "489 < 498",
          "756 = 765",
          "200 > 1,000"
        ],
        "a": 1,
        "e": "Let's compare 489 and 498. Both have 4 hundreds. Look at the tens: 8 tens is less than 9 tens. So, 489 is less than 498. ✅",
        "d": "e"
      },
      {
        "t": "What is the greatest 3-digit number you can make with the digits 3, 7, and 1?",
        "o": [
          "137",
          "371",
          "713",
          "731"
        ],
        "a": 3,
        "e": "To make the greatest number, put the biggest digit (7) in the hundreds place. Then 3 in tens, 1 in ones. The greatest number is 731! 🏆",
        "d": "e"
      },
      {
        "t": "Which number is 1 less than 800?",
        "o": [
          "700",
          "801",
          "799",
          "810"
        ],
        "a": 2,
        "e": "When you take 1 away from 800, you get 799. Think of counting backward one step from 800. The answer is 799! ⬅️",
        "d": "m"
      },
      {
        "t": "Eli has these numbers on cards: 490, 409, 940. Put them in order from least to greatest.",
        "o": [
          "409, 490, 940",
          "490, 409, 940",
          "940, 490, 409",
          "409, 940, 490"
        ],
        "a": 0,
        "e": "First, compare hundreds. 940 has 9, so it's biggest. Then compare 409 and 490. 0 tens is less than 9 tens. So, 409 < 490 < 940! 👍",
        "d": "h"
      },
      {
        "t": "Which statement is correct?",
        "o": [
          "450 > 540",
          "199 > 200",
          "1,050 > 1,005",
          "387 = 378"
        ],
        "a": 2,
        "e": "Let's compare 1,050 and 1,005. Both have 1 thousand, 0 hundreds. Look at the tens: 5 tens is more than 0 tens. So, 1,050 is greater than 1,005! ✅",
        "d": "e"
      },
      {
        "t": "Which number could go in the blank to make this true? ___ > 567",
        "o": [
          "560",
          "557",
          "566",
          "570"
        ],
        "a": 3,
        "e": "We need a number bigger than 567. Let's check! 570 has 7 tens, which is more than 6 tens in 567. So, 570 is greater than 567! ✨",
        "d": "m"
      },
      {
        "t": "Ava says 100 is greater than 99 because it has more digits. Is her reasoning correct?",
        "o": [
          "Yes, more digits always means greater",
          "No, you must compare each digit",
          "Yes, but only for these numbers",
          "No, 99 is greater"
        ],
        "a": 0,
        "e": "Ava is right! A number with more digits is always bigger. 100 has 3 digits. 99 has 2 digits. So, 100 is greater than 99! 🎉",
        "d": "h"
      },
      {
        "t": "Put these in order from least to greatest: 899, 908, 890, 981",
        "o": [
          "899, 890, 908, 981",
          "890, 899, 908, 981",
          "908, 899, 890, 981",
          "981, 908, 899, 890"
        ],
        "a": 1,
        "e": "Compare hundreds first! 890 and 899 have 8. 908 and 981 have 9. Then compare tens. The correct order is 890, 899, 908, 981! ✅",
        "d": "h"
      },
      {
        "t": "Sam says 452 > 459 because 5 > 4. Is Sam right? What did he do wrong?",
        "o": [
          "He is right",
          "He compared hundreds instead of ones",
          "He compared random digits instead of going place by place",
          "He compared tens when he should compare ones"
        ],
        "a": 3,
        "e": "Both 452 and 459 have 4 hundreds and 5 tens. Sam should compare the ones place! 2 ones is less than 9 ones. So, 452 is less than 459. 👍",
        "d": "h"
      },
      {
        "t": "Nina made the greatest 3-digit number and the least 3-digit number using digits 5, 0, and 8 (each once). What is the difference?",
        "o": [
          "342",
          "750",
          "392",
          "508"
        ],
        "a": 0,
        "e": "Greatest: 8 in hundreds, then 5, then 0. So 850. Least (3-digit): 5 in hundreds (not 0!), then 0, then 8. So 508. The difference is 342! 🔢",
        "d": "h"
      },
      {
        "t": "Which shows the numbers in order from greatest to least?",
        "o": [
          "1,102 > 1,120 > 1,012",
          "1,120 > 1,102 > 1,012",
          "1,012 > 1,102 > 1,120",
          "1,120 > 1,012 > 1,102"
        ],
        "a": 1,
        "e": "Compare thousands, then hundreds, then tens. 1,120 has 1 hundred, 2 tens. 1,102 has 1 hundred, 0 tens. 1,012 has 0 hundreds. So, 1,120 > 1,102 > 1,012! ✔️",
        "d": "e"
      },
      {
        "t": "Kai says 399 is greater than 400 because 3 + 9 + 9 = 21 and 4 + 0 + 0 = 4. What is wrong with his thinking?",
        "o": [
          "Nothing, he is right",
          "You compare place by place, not add digits",
          "You should multiply digits, not add",
          "The digits are too big to add"
        ],
        "a": 1,
        "e": "Adding digits doesn't work! Always compare place by place. 399 has 3 hundreds. 400 has 4 hundreds. Since 3 is less than 4, 399 is less than 400! 💡",
        "d": "h"
      },
      {
        "t": "Using the digits 6, 2, and 9 (each used once), what is the LEAST 3-digit number you can make?",
        "o": [
          "269",
          "296",
          "629",
          "926"
        ],
        "a": 0,
        "e": "To make the least number, put the smallest digit (2) in the hundreds place. Then 6 in tens, 9 in ones. The least number is 269! 🌟",
        "d": "m"
      },
      {
        "t": "Three friends measured their jumps. Ava: 108 cm, Ben: 180 cm, Cal: 118 cm. Put them in order from shortest to longest jump.",
        "o": [
          "Ava, Cal, Ben",
          "Ben, Cal, Ava",
          "Cal, Ava, Ben",
          "Ava, Ben, Cal"
        ],
        "a": 0,
        "e": "Compare hundreds, then tens, then ones. 108 (Ava) < 118 (Cal) < 180 (Ben). So the order from shortest to longest is Ava, Cal, Ben! 📏",
        "d": "h"
      },
      {
        "t": "Mia says that since 59 > 51, then 598 > 519 is also true. Is her reasoning correct?",
        "o": [
          "Yes, comparing the first two digits works",
          "No, you must compare all three digits starting from hundreds",
          "No, 598 < 519",
          "Yes, but only by luck"
        ],
        "a": 0,
        "e": "Both 598 and 519 have 5 hundreds. Mia compared the tens correctly! 9 tens is more than 1 ten. So, 598 is greater than 519. Great job! 👍",
        "d": "h"
      },
      {
        "t": "What is the smallest number that is greater than 1,199?",
        "o": [
          "1,200",
          "1,100",
          "1,198",
          "1,201"
        ],
        "a": 0,
        "e": "To find the next number after 1,199, we add 1. 1,199 + 1 = 1,200. This is the smallest number greater than 1,199. You got it! ➕",
        "d": "m"
      },
      {
        "t": "Tyler has cards showing 4, 7, and 0. He wants to make a 3-digit number between 400 and 500. Which numbers can he make?",
        "o": [
          "Only 407",
          "Only 470",
          "407 and 470",
          "400 and 470"
        ],
        "a": 2,
        "e": "A number between 400 and 500 starts with 4. Use 0 and 7 to make 407 or 470. Both work! ✨",
        "d": "h"
      },
      {
        "t": "Put these in order from least to greatest: 1,200, 1,020, 1,002, 1,100",
        "o": [
          "1,002, 1,020, 1,100, 1,200",
          "1,200, 1,100, 1,020, 1,002",
          "1,020, 1,002, 1,100, 1,200",
          "1,002, 1,100, 1,020, 1,200"
        ],
        "a": 0,
        "e": "Compare numbers from left to right! First thousands, then hundreds, tens, and ones. The order is 1,002, 1,020, 1,100, 1,200. ✅",
        "d": "h"
      },
      {
        "t": "Eva says 789 < 798 < 879 < 897. Is she correct?",
        "o": [
          "Yes, all comparisons are right",
          "No, 798 > 879",
          "No, 789 > 798",
          "No, 879 > 897"
        ],
        "a": 0,
        "e": "Great job! Compare hundreds first. If they're the same, compare tens. If those are same, compare ones. All are correct! 👍",
        "d": "h"
      },
      {
        "t": "A number is greater than 550 but less than 560. Its ones digit is odd. Its digits add up to 13. What is it?",
        "o": [
          "551",
          "553",
          "555",
          "557"
        ],
        "a": 1,
        "e": "Find numbers between 550 and 560 with an odd ones digit. Then add the digits for each. Only 553 has digits that add to 13! 🎉",
        "d": "h"
      },
      {
        "t": "Leo and Zoe each made a 3-digit number. Leo's number has 8 hundreds and is less than 830. Zoe's has 8 hundreds and is greater than 870. Whose number is greater?",
        "o": [
          "Leo's",
          "Zoe's",
          "They are equal",
          "You cannot tell"
        ],
        "a": 1,
        "e": "Leo's number is less than 830. Zoe's number is greater than 870. So, Zoe's number is always bigger than Leo's! ✨",
        "d": "h"
      },
      {
        "t": "Which set of numbers is in order from GREATEST to LEAST?",
        "o": [
          "345, 435, 543",
          "543, 435, 345",
          "435, 345, 543",
          "345, 543, 435"
        ],
        "a": 1,
        "e": "To order greatest to least, start with the biggest number! Compare hundreds: 5 > 4 > 3. So it's 543, 435, 345. Nice! 👍",
        "d": "e"
      },
      {
        "t": "Dana says you only need to look at the hundreds digit to compare 738 and 742. Is she right?",
        "o": [
          "Yes, hundreds tells you everything",
          "No, both have 7 hundreds so you must check tens too",
          "No, you always check ones first",
          "Yes, because 7 = 7 means they are equal"
        ],
        "a": 1,
        "e": "The hundreds are equal! So, look at the tens. 3 tens is less than 4 tens. So, 738 is less than 742. You got it! ✨",
        "d": "h"
      },
      {
        "t": "What is the greatest 3-digit number where no digit repeats and the hundreds digit is even?",
        "o": [
          "987",
          "897",
          "896",
          "986"
        ],
        "a": 1,
        "e": "To make the biggest number, use the biggest digits! Hundreds must be even, so 8. Then 9 and 7. The number is 897! 🎉",
        "d": "e"
      },
      {
        "t": "Nora wrote: 401 < 410 < 400. Find the error.",
        "o": [
          "401 should be greater than 410",
          "400 should come first since it is least",
          "400 < 401 < 410 is the correct order",
          "There is no error"
        ],
        "a": 2,
        "e": "Nora put the numbers in the wrong order! 400 is the smallest, not the biggest. The correct order is 400, 401, 410. Keep trying! 💡",
        "d": "h"
      },
      {
        "t": "I am between 990 and 1,010. I am an even number. My digits add up to 9. What number am I?",
        "o": [
          "990",
          "1,008",
          "1,000",
          "1,002"
        ],
        "a": 1,
        "e": "List even numbers between 990 and 1,010. Then add the digits for each one. Only 1,008 has digits that add up to 9! ✨",
        "d": "h"
      },
      {
        "t": "Three kids ran a race. Times: Ava 1,050 seconds, Ben 1,005 seconds, Cho 1,500 seconds. Who was fastest (least time)?",
        "o": [
          "Ava",
          "Ben",
          "Cho",
          "They tied"
        ],
        "a": 1,
        "e": "Fastest means the least amount of time! Compare the times. 1,005 seconds is the smallest. So Ben was the fastest! 🏃",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "Which symbol goes in the blank? 527 ___ 572",
        "o": [
          "<",
          ">",
          "=",
          "+"
        ],
        "a": 0,
        "e": "The hundreds are equal! Look at the tens. 2 tens is less than 7 tens. So, 527 is less than 572. You got it! 👍"
      },
      {
        "t": "Which is greater: 489 or 498?",
        "o": [
          "489",
          "498",
          "Equal",
          "Cannot tell"
        ],
        "a": 1,
        "e": "The hundreds are equal! Compare the tens. 9 tens is greater than 8 tens. So, 498 is greater than 489. Good thinking! 🧠"
      },
      {
        "t": "Is this true or false? 350 > 305",
        "o": [
          "True",
          "False",
          "Maybe",
          "Cannot tell"
        ],
        "a": 0,
        "e": "The hundreds are equal! Compare the tens. 5 tens is greater than 0 tens. So, 350 is greater than 305. That's true! ✅"
      },
      {
        "t": "Put these numbers in order from least to greatest: 342, 234, 423",
        "o": [
          "342,234,423",
          "234,342,423",
          "423,342,234",
          "234,423,342"
        ],
        "a": 1,
        "e": "To order numbers from least to greatest, compare the hundreds first. 2 < 3 < 4. So it's 234, 342, 423. Great job! ⭐"
      },
      {
        "t": "Which symbol goes in the blank? 760 ___ 760",
        "o": [
          "<",
          ">",
          "=",
          "not equal"
        ],
        "a": 2,
        "e": "Both numbers have the same hundreds, tens, and ones digits. When all digits are the same, the numbers are equal! (=) ✨"
      },
      {
        "t": "What is 100 more than 623?",
        "o": [
          "523",
          "633",
          "713",
          "723"
        ],
        "a": 3,
        "e": "Adding 100 makes the hundreds digit go up by 1. The tens and ones stay the same. So, 623 + 100 = 723. You got it! 💯"
      }
    ]
  },
  {
    "points": [
      "Skip counting means jumping by the SAME number each time",
      "By 2s: 2, 4, 6, 8, 10, 12...",
      "By 5s: 5, 10, 15, 20, 25, 30...",
      "By 10s: 10, 20, 30, 40, 50...",
      "By 100s: 100, 200, 300..."
    ],
    "examples": [
      {
        "c": "#c0392b",
        "tag": "Skip Count by 2s",
        "p": "2, 4, 6, 8, 10, 12, 14, 16, 18, 20",
        "s": "Each number increases by 2. Even numbers!",
        "a": "Keep adding 2 each time ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Skip Count by 5s",
        "p": "5, 10, 15, 20, 25, 30, 35, 40, 45, 50",
        "s": "Each number increases by 5. Ends in 0 or 5!",
        "a": "Keep adding 5 each time ✅"
      },
      {
        "c": "#c0392b",
        "tag": "Skip Count by 10s",
        "p": "10, 20, 30, 40, 50, 60, 70, 80, 90, 100",
        "s": "Each number increases by 10. Tens digit goes up!",
        "a": "Keep adding 10 each time ✅"
      }
    ],
    "practice": [
      {
        "q": "Skip by 5s: 20, 25, ___",
        "a": "30",
        "h": "25 + 5 = 30!",
        "e": "To find 10 less, subtract 1 from the tens digit. 350 has 5 tens. 5 - 1 = 4 tens. So, 10 less than 350 is 340! ➖"
      },
      {
        "q": "Skip by 10s: 50, 60, ___",
        "a": "70",
        "h": "60 + 10 = 70!",
        "e": "An odd number has a 1, 3, 5, 7, or 9 in the ones place. 357 has a 7 in the ones place, so it is odd! ✨"
      },
      {
        "q": "Skip by 2s: 8, 10, ___",
        "a": "12",
        "h": "10 + 2 = 12!",
        "e": "The 6 is in the hundreds place. That means its value is 6 hundreds, or 600. You know your place value! 💯"
      }
    ],
    "qBank": [
      {
        "t": "What number comes next? Skip count by 2s: 14, 16, ___",
        "o": [
          "17",
          "18",
          "19",
          "20"
        ],
        "a": 1,
        "e": "Start at 16, count up 2 more. You land on 18! 👍",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 5s: 25, 30, ___",
        "o": [
          "32",
          "33",
          "34",
          "35"
        ],
        "a": 3,
        "e": "3 tens and 5 ones make 35! You got it! ✨",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 10s: 40, 50, ___",
        "o": [
          "60",
          "55",
          "58",
          "65"
        ],
        "a": 0,
        "e": "5 tens plus 1 more ten makes 6 tens. That's 60! Great job! 🤩",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 100s: 200, 300, ___",
        "o": [
          "400",
          "350",
          "380",
          "500"
        ],
        "a": 0,
        "e": "3 hundreds plus 1 more hundred makes 4 hundreds. That's 400! Super! 💯",
        "d": "m"
      },
      {
        "t": "What is the counting rule? 6, 12, 18, 24...",
        "o": [
          "Add 4",
          "Add 5",
          "Add 6",
          "Add 7"
        ],
        "a": 2,
        "e": "Look closely! Each number gets bigger by 6. The pattern is +6! ➕",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 2s: 20, 22, 24, ___",
        "o": [
          "25",
          "26",
          "27",
          "28"
        ],
        "a": 1,
        "e": "Start at 24 and count up 2 more. You land on 26! Fantastic! 👍",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 5s: 40, 45, 50, ___",
        "o": [
          "55",
          "52",
          "54",
          "60"
        ],
        "a": 0,
        "e": "5 tens and 5 ones make 55! You're doing great! ✨",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 10s: 70, 80, 90, ___",
        "o": [
          "95",
          "105",
          "110",
          "100"
        ],
        "a": 3,
        "e": "9 tens plus 1 more ten makes 10 tens. That's 100! You regrouped to make a hundred! 🤩",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 100s: 500, 600, 700, ___",
        "o": [
          "800",
          "750",
          "780",
          "900"
        ],
        "a": 0,
        "e": "7 hundreds plus 1 more hundred makes 8 hundreds. That's 800! Awesome! 💯",
        "d": "h"
      },
      {
        "t": "What is the counting rule? 4, 8, 12, 16...",
        "o": [
          "Add 4",
          "Add 2",
          "Add 3",
          "Add 5"
        ],
        "a": 0,
        "e": "Look closely! Each number gets bigger by 4. The pattern is +4! ➕",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 2s: 8, 10, 12, ___",
        "o": [
          "13",
          "15",
          "16",
          "14"
        ],
        "a": 3,
        "e": "Start at 12, count up 2 more. You land on 14! Good thinking! 👍",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 5s: 15, 20, 25, ___",
        "o": [
          "27",
          "28",
          "29",
          "30"
        ],
        "a": 3,
        "e": "Start at 25 and count up 5 more. You land on 30! You regrouped to make a new ten! 🌟",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 10s: 130, 140, 150, ___",
        "o": [
          "160",
          "155",
          "158",
          "165"
        ],
        "a": 0,
        "e": "150 has 1 hundred and 5 tens. Add 1 more ten to get 1 hundred and 6 tens. That's 160! 🤩",
        "d": "h"
      },
      {
        "t": "What is the missing number? 3, 6, ___, 12, 15",
        "o": [
          "9",
          "7",
          "8",
          "10"
        ],
        "a": 0,
        "e": "You're skip counting by 3s! After 6, add 3 more to get 9. Keep going! 👣",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 2s: 96, 98, 100, ___",
        "o": [
          "101",
          "103",
          "104",
          "102"
        ],
        "a": 3,
        "e": "1 hundred and 2 ones make 102! You're a math whiz! ✨",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 5s: 80, 85, 90, ___",
        "o": [
          "95",
          "92",
          "94",
          "97"
        ],
        "a": 0,
        "e": "9 tens and 5 ones make 95! You're doing great! ✨",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 10s: 860, 870, 880, ___",
        "o": [
          "885",
          "888",
          "890",
          "900"
        ],
        "a": 2,
        "e": "880 has 8 hundreds and 8 tens. Add 1 more ten to get 8 hundreds and 9 tens. That's 890! 🤩",
        "d": "h"
      },
      {
        "t": "What is the counting rule? 100, 200, 300, 400...",
        "o": [
          "Add 10",
          "Add 50",
          "Add 100",
          "Add 200"
        ],
        "a": 2,
        "e": "Look closely! Each number gets bigger by 100. The pattern is +100! ➕",
        "d": "m"
      },
      {
        "t": "What is the missing number? 10, 20, ___, 40, 50",
        "o": [
          "25",
          "28",
          "30",
          "35"
        ],
        "a": 2,
        "e": "You're skip counting by 10s! After 20, add 10 more to get 30. Super! 👣",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 2s: 88, 90, 92, ___",
        "o": [
          "93",
          "94",
          "95",
          "96"
        ],
        "a": 1,
        "e": "Start at 92, count up 2 more. You land on 94! You did it! 👍",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 5s: 50, 55, 60, ___",
        "o": [
          "62",
          "64",
          "65",
          "70"
        ],
        "a": 2,
        "e": "You have 6 tens and 0 ones. Add 5 ones, and you get 6 tens and 5 ones. That's 65! ✨",
        "d": "m"
      },
      {
        "t": "Which skips by 10s?",
        "o": [
          "5,10,15,20",
          "10,20,30,40",
          "2,4,6,8",
          "25,30,35,40"
        ],
        "a": 1,
        "e": "Each number goes up by 10. You are counting by tens! The next number is 50. 🔟",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 100s: 300, 400, 500, ___",
        "o": [
          "550",
          "580",
          "600",
          "700"
        ],
        "a": 2,
        "e": "You have 5 hundreds. When you add 1 more hundred, you get 6 hundreds! That's 600. 💯",
        "d": "h"
      },
      {
        "t": "What is the missing number? 50, ___, 70, 80",
        "o": [
          "55",
          "58",
          "60",
          "65"
        ],
        "a": 2,
        "e": "Each number adds 10! You are counting by tens. The next number is 90. Keep going! 🚀",
        "d": "e"
      },
      {
        "t": "What is the counting rule? 5, 10, 15, 20...",
        "o": [
          "Add 2",
          "Add 4",
          "Add 5",
          "Add 10"
        ],
        "a": 2,
        "e": "When you count by 5s, you add 5 each time. So, 20 + 5 = 25! 🌟",
        "d": "e"
      },
      {
        "t": "What number comes next? Skip count by 2s: 72, 74, 76, ___",
        "o": [
          "77",
          "79",
          "80",
          "78"
        ],
        "a": 3,
        "e": "You have 7 tens and 6 ones. Add 2 more ones, and you get 7 tens and 8 ones. That's 78! ✅",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 5s: 95, 100, 105, ___",
        "o": [
          "108",
          "112",
          "115",
          "110"
        ],
        "a": 3,
        "e": "You have 105. Add 5 ones to the 5 ones you have. That makes 10 ones, which is 1 ten! So, 105 + 5 = 110. 🥳",
        "d": "m"
      },
      {
        "t": "What is the missing number? 200, 400, ___, 800",
        "o": [
          "500",
          "550",
          "600",
          "650"
        ],
        "a": 2,
        "e": "You are counting by 200s! Start at 400. Add 2 more hundreds, and you get 6 hundreds. That's 600! ⬆️",
        "d": "m"
      },
      {
        "t": "What number comes next? Skip count by 10s: 990, 1000, ___",
        "o": [
          "1001",
          "1005",
          "1010",
          "1100"
        ],
        "a": 2,
        "e": "You have 1 thousand and 0 tens. Add 1 more ten, and you get 1 thousand and 1 ten. That's 1010! 🔢",
        "d": "m"
      },
      {
        "t": "What is the counting rule? 25, 50, 75, 100...",
        "o": [
          "Add 20",
          "Add 25",
          "Add 30",
          "Add 50"
        ],
        "a": 1,
        "e": "When you count by 25s, you add 25 each time. So, 50 + 25 = 75! Great job! 💰",
        "d": "h"
      },
      {
        "t": "Count by 5s: 10, 15, 20, __",
        "o": [
          "21",
          "22",
          "25",
          "30"
        ],
        "a": 2,
        "e": "When you count by 5s, you add 5 to the number each time. So, 20 + 5 makes 25! Super counting! 🖐️",
        "d": "e"
      },
      {
        "t": "Count by 10s: 30, 40, 50, __",
        "o": [
          "51",
          "55",
          "60",
          "100"
        ],
        "a": 2,
        "e": "When you count by 10s, you add 10 to the number each time. So, 50 + 10 makes 60! Good job! 🔟",
        "d": "e"
      },
      {
        "t": "What is 10 more than 237?",
        "o": [
          "238",
          "337",
          "247",
          "227"
        ],
        "a": 2,
        "e": "Adding 10 means you add 1 to the tens place. The 3 tens become 4 tens. So, 237 + 10 = 247! 👍",
        "d": "e"
      },
      {
        "t": "What is 100 more than 450?",
        "o": [
          "460",
          "550",
          "451",
          "350"
        ],
        "a": 1,
        "e": "Adding 100 means you add 1 to the hundreds place. The 4 hundreds become 5 hundreds. So, 450 + 100 = 550! 💯",
        "d": "e"
      },
      {
        "t": "Count by 2s: 16, 18, 20, __",
        "o": [
          "21",
          "22",
          "24",
          "30"
        ],
        "a": 1,
        "e": "When you count by 2s, you add 2 to the number each time. So, 20 + 2 makes 22! Keep counting! ✌️",
        "d": "e"
      },
      {
        "t": "What is 10 less than 380?",
        "o": [
          "280",
          "370",
          "381",
          "379"
        ],
        "a": 1,
        "e": "Taking away 10 means you subtract 1 from the tens place. The 8 tens become 7 tens. So, 380 - 10 = 370! 👇",
        "d": "e"
      },
      {
        "t": "What is 100 less than 600?",
        "o": [
          "500",
          "590",
          "601",
          "700"
        ],
        "a": 0,
        "e": "Taking away 100 means you subtract 1 from the hundreds place. The 6 hundreds become 5 hundreds. So, 600 - 100 = 500! 📉",
        "d": "e"
      },
      {
        "t": "Count by 100s: 200, 300, 400, __",
        "o": [
          "410",
          "450",
          "500",
          "900"
        ],
        "a": 2,
        "e": "When you count by 100s, you add 100 each time. So, 400 + 100 makes 500! You're a pro! 💯",
        "d": "h"
      },
      {
        "t": "What number is 10 more than 590?",
        "o": [
          "591",
          "600",
          "690",
          "500"
        ],
        "a": 1,
        "e": "You have 5 hundreds and 9 tens. Add 1 more ten, and you regroup 10 tens to make 1 new hundred! So, 590 + 10 = 600! 🤩",
        "d": "m"
      },
      {
        "t": "Count by 5s: 45, 50, 55, __",
        "o": [
          "56",
          "60",
          "65",
          "70"
        ],
        "a": 1,
        "e": "You have 55. Add 5 ones to the 5 ones you have. That makes 10 ones, which is 1 ten! So, 55 + 5 = 60! 🥳",
        "d": "e"
      },
      {
        "t": "What is 100 more than 900?",
        "o": [
          "910",
          "990",
          "1,000",
          "800"
        ],
        "a": 2,
        "e": "Adding 1 more hundred to 9 hundreds makes 10 hundreds, which is 1,000! So, 900 + 100 = 1,000. ✨",
        "d": "e"
      },
      {
        "t": "Count by 10s: 270, 280, 290, __",
        "o": [
          "291",
          "295",
          "300",
          "390"
        ],
        "a": 2,
        "e": "When you add 10 to 290, the tens place becomes 10 tens, which is 1 hundred! So, 290 + 10 = 300. 👍",
        "d": "h"
      },
      {
        "t": "Liam counts by 2s starting at 4. What are the next 3 numbers?",
        "o": [
          "5, 6, 7",
          "6, 8, 10",
          "6, 7, 8",
          "8, 12, 16"
        ],
        "a": 1,
        "e": "Counting by 2s means adding 2 each time. The pattern is 4, 6, 8, 10. Keep going! 🚀",
        "d": "e"
      },
      {
        "t": "What is 10 less than 500?",
        "o": [
          "400",
          "490",
          "499",
          "510"
        ],
        "a": 1,
        "e": "To subtract 10 from 500, we regroup 1 hundred into 10 tens. Then 10 tens - 1 ten = 9 tens. 500 - 10 = 490. ✅",
        "d": "e"
      },
      {
        "t": "Count by 100s: 700, 800, 900, __",
        "o": [
          "910",
          "950",
          "990",
          "1,000"
        ],
        "a": 3,
        "e": "Adding 100 each time means the hundreds digit increases. 9 hundreds + 1 hundred = 10 hundreds, or 1,000! So, 900 + 100 = 1,000. 🎉",
        "d": "h"
      },
      {
        "t": "What is 100 less than 350?",
        "o": [
          "250",
          "340",
          "349",
          "450"
        ],
        "a": 0,
        "e": "100 less means subtract 100. Only the hundreds digit changes because we take away 1 hundred. 350 - 100 = 250. ➖",
        "d": "e"
      },
      {
        "t": "Count by 5s: 75, 80, 85, __",
        "o": [
          "86",
          "90",
          "95",
          "100"
        ],
        "a": 1,
        "e": "Adding 5 each time means the ones digit increases by 5. 85 + 5 = 90. We made a new group of ten! 🖐️",
        "d": "e"
      },
      {
        "t": "Maya has 163 blocks. She gets 10 more. How many does she have now?",
        "o": [
          "164",
          "173",
          "263",
          "153"
        ],
        "a": 1,
        "e": "Adding 10 means we add 1 to the tens place. The hundreds and ones stay the same! So, 163 + 10 = 173. ✨",
        "d": "h"
      },
      {
        "t": "What number is 10 more than 195?",
        "o": [
          "196",
          "200",
          "205",
          "295"
        ],
        "a": 2,
        "e": "When you add 10 to 195, the 9 tens become 10 tens, which is 1 hundred! So, 195 + 10 = 205. Great regrouping! 👏",
        "d": "m"
      },
      {
        "t": "Count by 2s: 48, 50, 52, __",
        "o": [
          "53",
          "54",
          "56",
          "62"
        ],
        "a": 1,
        "e": "Adding 2 each time means the number increases by 2. The pattern is 52, 54. Keep counting! ⬆️",
        "d": "e"
      },
      {
        "t": "What is 100 more than 567?",
        "o": [
          "577",
          "667",
          "568",
          "467"
        ],
        "a": 1,
        "e": "100 more means add 100. Only the hundreds digit changes because we add 1 hundred. 567 + 100 = 667. ✅",
        "d": "m"
      },
      {
        "t": "Jada counts by 5s starting at 280. What are the next 3 numbers?",
        "o": [
          "285, 290, 295",
          "285, 295, 300",
          "290, 300, 310",
          "281, 282, 283"
        ],
        "a": 0,
        "e": "Counting by 5s means adding 5 each time. From 280, we go 285, 290, 295. We cross a new ten! 🖐️",
        "d": "h"
      },
      {
        "t": "What number is 10 less than 403?",
        "o": [
          "303",
          "402",
          "393",
          "413"
        ],
        "a": 2,
        "e": "To subtract 10 from 403, we regroup 1 hundred into 10 tens. Then 10 tens - 1 ten = 9 tens. 403 - 10 = 393. Smart! 🧠",
        "d": "m"
      },
      {
        "t": "Skip count by 10s: 970, 980, 990, ___. What comes next?",
        "o": [
          "991",
          "999",
          "1,000",
          "1,100"
        ],
        "a": 2,
        "e": "Adding 10 to 990 means 9 tens + 1 ten = 10 tens, which is 1 hundred! This makes 10 hundreds, or 1,000! 🌟",
        "d": "h"
      },
      {
        "t": "Leo started at 450 and counted by 100s. Which number did he NOT say?",
        "o": [
          "550",
          "650",
          "700",
          "750"
        ],
        "a": 2,
        "e": "Counting by 100s means adding 100. From 650, adding 100 makes 750. So, 700 is skipped in this pattern! 🔢",
        "d": "m"
      },
      {
        "t": "What is 10 more than 996?",
        "o": [
          "997",
          "1,006",
          "1,096",
          "906"
        ],
        "a": 1,
        "e": "Adding 10 to 996 means we regroup! 9 tens + 1 ten = 10 tens, which is 1 hundred. This makes 1,000 and 6 ones! 🥳",
        "d": "m"
      },
      {
        "t": "Mia has 835 stickers. She gives away 100. How many does she have now?",
        "o": [
          "735",
          "825",
          "935",
          "834"
        ],
        "a": 0,
        "e": "Giving away 100 means subtracting 100. Only the hundreds digit changes because we take away 1 hundred. 835 - 100 = 735. 👍",
        "d": "h"
      },
      {
        "t": "Count by 2s from 394. What are the next 3 numbers?",
        "o": [
          "395, 396, 397",
          "396, 398, 400",
          "394, 396, 398",
          "404, 414, 424"
        ],
        "a": 1,
        "e": "Counting by 2s from 394 means adding 2 each time. We go 396, 398, then regroup to 400! You did it! 🤩",
        "d": "m"
      },
      {
        "t": "What number is 100 less than 1,050?",
        "o": [
          "1,040",
          "950",
          "1,150",
          "50"
        ],
        "a": 1,
        "e": "Subtracting 100 from 1,050 means taking away 1 hundred. We go from 10 hundreds to 9 hundreds. So, 1,050 - 100 = 950. ✨",
        "d": "m"
      },
      {
        "t": "Eli skip counts: 625, 650, 675, ___. What is he counting by?",
        "o": [
          "2s",
          "5s",
          "10s",
          "25s"
        ],
        "a": 3,
        "e": "Eli is counting by 25s! Each jump adds 25. From 675, adding 25 makes 700. Keep up the great counting! 🥳",
        "d": "h"
      },
      {
        "t": "Which is the same as adding 100? Starting number: 347",
        "o": [
          "Change ones digit: 348",
          "Change tens digit: 357",
          "Change hundreds digit: 447",
          "Change all digits: 448"
        ],
        "a": 2,
        "e": "When you add 100, only the hundreds digit changes! 347 + 100 = 447. The 3 becomes a 4. ✨",
        "d": "m"
      },
      {
        "t": "Sara starts at 100 and counts by 10s. Will she say 155?",
        "o": [
          "Yes",
          "No, she will skip it",
          "Yes, after 150",
          "No, 155 is not a multiple of 10"
        ],
        "a": 3,
        "e": "When counting by 10s, the ones digit is always 0. 155 has a 5, so she won't say it! 🔟",
        "d": "m"
      },
      {
        "t": "What is 10 more than 1,090?",
        "o": [
          "1,091",
          "1,100",
          "1,190",
          "2,090"
        ],
        "a": 1,
        "e": "1,090 + 10 = 1,100. The 9 tens and 1 more ten regroup to make a new hundred! So cool! 💯",
        "d": "e"
      },
      {
        "t": "Tom counts backward by 5s: 120, 115, 110, ___. What comes next?",
        "o": [
          "100",
          "105",
          "109",
          "95"
        ],
        "a": 1,
        "e": "Counting backward by 5s means you subtract 5 each time. 110 - 5 = 105. Great job! 🖐️",
        "d": "h"
      },
      {
        "t": "Ava says 10 less than 200 is 100. Is she right?",
        "o": [
          "Yes",
          "No, it is 190",
          "No, it is 199",
          "No, it is 210"
        ],
        "a": 1,
        "e": "200 - 10 = 190. Ava subtracted 100 instead of 10. Taking away 10 changes the tens place! 🤔",
        "d": "m"
      },
      {
        "t": "Fill in the pattern: 480, ___, 500, 510, 520",
        "o": [
          "481",
          "485",
          "490",
          "495"
        ],
        "a": 2,
        "e": "The pattern adds 10 each time! 480 + 10 = 490. Then 490 + 10 = 500. The missing number is 490. 👍",
        "d": "h"
      },
      {
        "t": "What is 100 more than 908?",
        "o": [
          "918",
          "998",
          "1,008",
          "808"
        ],
        "a": 2,
        "e": "908 + 100 = 1,008. When you add 100 to 908, you cross over 1,000! You did it! 🚀",
        "d": "m"
      },
      {
        "t": "Kai starts at 72 and counts by 10s. Which number will he say?",
        "o": [
          "80",
          "100",
          "132",
          "170"
        ],
        "a": 2,
        "e": "When counting by 10s, the ones digit always stays the same! From 72, the ones digit is always 2. So 132 is correct! ✅",
        "d": "m"
      },
      {
        "t": "Rosa had 1,200 points. She lost 100 points twice. How many does she have now?",
        "o": [
          "1,100",
          "1,000",
          "900",
          "1,199"
        ],
        "a": 1,
        "e": "Losing 100 twice means you subtract 100, then subtract 100 again. 1,200 - 200 = 1,000. Great thinking! 🧠",
        "d": "h"
      },
      {
        "t": "Which pattern shows counting by 100s?",
        "o": [
          "150, 160, 170, 180",
          "150, 250, 350, 450",
          "150, 200, 250, 300",
          "150, 155, 160, 165"
        ],
        "a": 1,
        "e": "Look! 150, 250, 350, 450. The hundreds digit goes up by 1 each time. That's counting by 100s! 🔢",
        "d": "m"
      },
      {
        "t": "Amy counts by 5s starting at 280. She says 280, 285, 290, 300. What mistake did she make?",
        "o": [
          "She skipped 295",
          "She started at the wrong number",
          "She counted by 10s at the end",
          "There is no mistake"
        ],
        "a": 0,
        "e": "Counting by 5s means numbers end in 0 or 5. From 290, you say 295, then 300. Amy skipped 295! 🧐",
        "d": "h"
      },
      {
        "t": "___ is 100 more than 867 and 10 less than 977. What is ___?",
        "o": [
          "877",
          "957",
          "967",
          "987"
        ],
        "a": 2,
        "e": "100 more than 867 is 967. 10 less than 977 is also 967! Both clues point to 967. Smart! 💡",
        "d": "h"
      },
      {
        "t": "Kai counts by 10s from 8. Which number will he NOT land on?",
        "o": [
          "18",
          "48",
          "50",
          "98"
        ],
        "a": 2,
        "e": "When counting by 10s from 8, the ones digit always stays 8! 50 has a 0, so he will never land on 50. 🙅",
        "d": "e"
      },
      {
        "t": "Dani starts at 1,200 and counts backward by 100s. Which number will she say third?",
        "o": [
          "1,100",
          "1,000",
          "900",
          "800"
        ],
        "a": 2,
        "e": "Start at 1,200. Count backward by 100s three times: 1,100, 1,000, 900. You got it! ⬅️",
        "d": "h"
      },
      {
        "t": "Zoe says: '10 less than 305 is 295.' Her teacher says: '10 less than 305 is 304.' Who is right?",
        "o": [
          "Zoe",
          "The teacher",
          "Neither",
          "Both"
        ],
        "a": 0,
        "e": "305 - 10 = 295. Zoe is right! When you take away 10 from 305, you regroup from the hundreds. Awesome! 🌟",
        "d": "h"
      },
      {
        "t": "Sam starts at 250 and adds 100 four times. Then he subtracts 10 three times. Where does he end up?",
        "o": [
          "620",
          "650",
          "680",
          "350"
        ],
        "a": 0,
        "e": "Start at 250. Add 100 four times to get 650. Then subtract 10 three times to get 620. The end is 620! 🎉",
        "d": "h"
      },
      {
        "t": "Eva counts by 5s from 0. Max counts by 2s from 0. What is the first number greater than 10 that BOTH will say?",
        "o": [
          "12",
          "15",
          "20",
          "10"
        ],
        "a": 2,
        "e": "Count by 5s: 5, 10, 15, 20. Count by 2s: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20. Both say 20! ✨",
        "d": "m"
      },
      {
        "t": "Mia writes: 10 more than 498 is 508. Is she correct?",
        "o": [
          "Yes",
          "No, it is 499",
          "No, it is 598",
          "No, it is 408"
        ],
        "a": 0,
        "e": "498 + 10 = 508. The 9 tens and 1 more ten regroup to make a new hundred! So the 4 becomes 5. Hooray! 🥳",
        "d": "m"
      },
      {
        "t": "Leo counts by 100s: 150, 250, 350, ___, 550. What is the missing number?",
        "o": [
          "400",
          "450",
          "500",
          "355"
        ],
        "a": 1,
        "e": "This pattern adds 100 each time! 350 + 100 = 450. Then 450 + 100 = 550. The missing number is 450. Great! ➕",
        "d": "h"
      },
      {
        "t": "Nora says that 10 more than 990 is 1,000, and 10 more than 1,000 is 1,100. Find her error.",
        "o": [
          "Both are wrong",
          "990 + 10 is wrong",
          "1,000 + 10 should be 1,010, not 1,100",
          "There is no error"
        ],
        "a": 2,
        "e": "990 + 10 = 1,000. Then 1,000 + 10 = 1,010. Nora added 100 instead of 10 the second time! Oops! 😬",
        "d": "h"
      },
      {
        "t": "Fill in BOTH blanks: 10 more than ___ is 600. 100 less than ___ is 600.",
        "o": [
          "590 and 700",
          "610 and 500",
          "590 and 500",
          "610 and 700"
        ],
        "a": 0,
        "e": "To get to 600, you need 10 more than 590. To get 600, you need 100 less than 700. So, 590 and 700! 🤔",
        "d": "h"
      },
      {
        "t": "Tyler counts by 2s from 1. Will he ever say 48?",
        "o": [
          "Yes, because 48 is even",
          "No, because he starts on an odd number",
          "Yes, after 47",
          "No, because 48 is too big"
        ],
        "a": 1,
        "e": "Counting by 2s from 1 (an odd number) means you only say odd numbers! 48 is an even number, so he won't say it. 🚫",
        "d": "e"
      },
      {
        "t": "Ava has 780. She adds 10 three times and then adds 100 once. What does she have now?",
        "o": [
          "810",
          "880",
          "910",
          "890"
        ],
        "a": 2,
        "e": "Add 10 three times to 780 to get 810. Then add 100 to 810. The hundreds place changes! The answer is 910. ➕",
        "d": "h"
      },
      {
        "t": "Pedro says 100 less than 1,005 is 905. Ben says it is 995. Who is right?",
        "o": [
          "Pedro",
          "Ben",
          "Both",
          "Neither"
        ],
        "a": 0,
        "e": "When you subtract 100 from 1,005, only the hundreds place changes. 1,005 - 100 = 905. Pedro is right! ✅",
        "d": "h"
      },
      {
        "t": "Look at the pattern: 1,200, 1,100, 1,000, 900, ___. What rule does this follow, and what comes next?",
        "o": [
          "Subtract 10; next is 890",
          "Subtract 100; next is 800",
          "Subtract 100; next is 890",
          "Subtract 200; next is 700"
        ],
        "a": 1,
        "e": "Look at how the numbers change! Each number is 100 less than the one before it. The rule is subtract 100. 📉",
        "d": "h"
      },
      {
        "t": "Rosa starts at 50. She counts by 10s to 100, then counts by 100s from there. Which number will she NOT say?",
        "o": [
          "70",
          "100",
          "200",
          "150"
        ],
        "a": 3,
        "e": "She counts by 10s, then by 100s. After 100, she jumps right to 200! She never says 150 because it's in between. 🙅‍♀️",
        "d": "h"
      },
      {
        "t": "What number is 10 more than 10 more than 10 more than 770?",
        "o": [
          "780",
          "790",
          "800",
          "870"
        ],
        "a": 2,
        "e": "Adding 10 three times is the same as adding 30! So, 770 + 30 = 800. The tens place changes and regroups! 👍",
        "d": "h"
      },
      {
        "t": "Jada says skip counting by 5s will land on every number that ends in 0. Is she right?",
        "o": [
          "Yes, always",
          "No, it also lands on numbers ending in 5",
          "No, it only lands on even numbers",
          "No, it skips some numbers ending in 0"
        ],
        "a": 1,
        "e": "When you count by 5s, you say numbers that end in 0 AND numbers that end in 5. Jada forgot about the numbers ending in 5! 🖐️",
        "d": "e"
      },
      {
        "t": "Omar starts at 340. He subtracts 10 five times. Then adds 100 twice. Where is he?",
        "o": [
          "490",
          "440",
          "390",
          "540"
        ],
        "a": 0,
        "e": "Subtract 10 five times from 340 to get 290. Then add 100 two times to 290. The final answer is 490! 🔢",
        "d": "h"
      },
      {
        "t": "Which strategy finds 10 less than 800 fastest?",
        "o": [
          "Count backward by 1s ten times",
          "Change the tens digit from 0 to 9 and hundreds from 8 to 7",
          "Subtract 100 and add 90",
          "All give the same answer but B is fastest"
        ],
        "a": 3,
        "e": "Changing the tens and hundreds digits directly uses place value! It's a quick way to add or subtract 10 or 100. The answer is 790. ✨",
        "d": "m"
      }
    ],
    "quiz": [
      {
        "t": "What number comes next? Skip count by 5s: 35, 40, 45, ___",
        "o": [
          "48",
          "50",
          "52",
          "55"
        ],
        "a": 1,
        "e": "You are skip counting by 5s! Start at 35 and add 5 three times. 35, 40, 45, 50. The answer is 50. 🖐️"
      },
      {
        "t": "What number comes next? Skip count by 10s: 60, 70, 80, ___",
        "o": [
          "85",
          "88",
          "90",
          "100"
        ],
        "a": 2,
        "e": "Look at the pattern! Each number is 10 more than the one before it. You are skip counting by 10s! 🔟"
      },
      {
        "t": "What number comes next? Skip count by 2s: 14, 16, 18, ___",
        "o": [
          "19",
          "20",
          "21",
          "22"
        ],
        "a": 1,
        "e": "You are skip counting by 2s! Start at 14 and add 2 three times. 14, 16, 18, 20. The answer is 20. ✌️"
      },
      {
        "t": "What number comes next? Skip count by 100s: 400, 500, 600, ___",
        "o": [
          "650",
          "690",
          "700",
          "800"
        ],
        "a": 2,
        "e": "Look at the pattern! Each number is 100 more than the one before it. You are skip counting by 100s! 💯"
      },
      {
        "t": "What is the rule? 3, 6, 9, 12, 15...",
        "o": [
          "Add 2",
          "Add 3",
          "Add 4",
          "Add 5"
        ],
        "a": 1,
        "e": "Look closely at the numbers! Each number is 3 more than the one before it. The rule is to add 3 each time. ➕"
      },
      {
        "t": "Skip by 5s: 95, 100, 105, ___",
        "o": [
          "108",
          "110",
          "112",
          "115"
        ],
        "a": 1,
        "e": "You are skip counting by 5s! Start at 100 and add 5 two times. 100, 105, 110. The answer is 110. 🖐️"
      }
    ]
  }
];

export const unitQuiz: UnitQuiz = {
  "qBank": [
    {
      "t": "In 347, what digit is in the tens place?",
      "o": [
        "3",
        "4",
        "7",
        "34"
      ],
      "a": 1,
      "e": "This number has 3 hundreds, 4 tens, and 7 ones. You are showing the value of each digit by its place! 🧠",
      "d": "e"
    },
    {
      "t": "What is the value of 5 in 562?",
      "o": [
        "5",
        "50",
        "500",
        "5000"
      ],
      "a": 2,
      "e": "The digit 5 is in the hundreds place. That means its value is 5 hundreds, which is 500. Great job! 💡",
      "d": "m"
    },
    {
      "t": "What is 6 hundreds + 2 tens + 5 ones?",
      "o": [
        "265",
        "526",
        "625",
        "652"
      ],
      "a": 2,
      "e": "You are putting the hundreds, tens, and ones together! 600 + 20 + 5 makes the number 625. You got it! 👍",
      "d": "e"
    },
    {
      "t": "What is the expanded form of 483?",
      "o": [
        "400+8+3",
        "40+80+3",
        "400+80+3",
        "48+3"
      ],
      "a": 2,
      "e": "4H means 4 hundreds, which is 400. 8T means 8 tens, which is 80. 3O means 3 ones, which is 3. 🧩",
      "d": "e"
    },
    {
      "t": "What is 200 + 30 + 7?",
      "o": [
        "237",
        "327",
        "273",
        "372"
      ],
      "a": 0,
      "e": "Two hundreds, three tens, and seven ones make the number 237. Great job! ✨",
      "d": "m"
    },
    {
      "t": "Which symbol goes in the blank? 527 ___ 572",
      "o": [
        "<",
        ">",
        "=",
        "≠"
      ],
      "a": 0,
      "e": "Both have 5 hundreds. Look at the tens! 2 tens is less than 7 tens. So, 527 < 572. You got it! 👍",
      "d": "m"
    },
    {
      "t": "What is 327 rounded to the nearest hundred?",
      "o": [
        "200",
        "330",
        "400",
        "300"
      ],
      "a": 3,
      "e": "The tens digit is 2. Since 2 is less than 5, we round down to 300. Super rounding! 🥳",
      "d": "e"
    },
    {
      "t": "What number comes next? Skip count by 5s: 35, 40, 45, ___",
      "o": [
        "48",
        "52",
        "55",
        "50"
      ],
      "a": 3,
      "e": "Adding 5 to 45 helps us reach the next friendly number, 50. Keep counting! 🚀",
      "d": "e"
    },
    {
      "t": "What is the word form of 204?",
      "o": [
        "twenty-four",
        "two hundred forty",
        "twenty hundred four",
        "two hundred four"
      ],
      "a": 3,
      "e": "200 and 4 together make the number two hundred four. You read numbers so well! 📖",
      "d": "e"
    },
    {
      "t": "What number comes next? Skip count by 10s: 70, 80, 90, ___",
      "o": [
        "95",
        "105",
        "110",
        "100"
      ],
      "a": 3,
      "e": "When you add 10 to 90, you get a full group of 100! Awesome adding! ✅",
      "d": "m"
    },
    {
      "t": "What is 400 + 60 + 9?",
      "o": [
        "469",
        "496",
        "649",
        "946"
      ],
      "a": 0,
      "e": "Four hundreds, six tens, and nine ones make the number 469. You know your places! ⭐",
      "d": "m"
    },
    {
      "t": "What is 100 less than 756?",
      "o": [
        "646",
        "656",
        "756",
        "856"
      ],
      "a": 1,
      "e": "Taking away 100 means one less hundred. So, 7 hundreds becomes 6 hundreds: 656. Easy peasy! 💯",
      "d": "e"
    },
    {
      "t": "Put these numbers in order from least to greatest: 342, 234, 423",
      "o": [
        "234,342,423",
        "342,234,423",
        "423,342,234",
        "234,423,342"
      ],
      "a": 0,
      "e": "Look at the hundreds place first! 2 is less than 3, and 3 is less than 4. So, 234 < 342 < 423. Smart! 🧠",
      "d": "h"
    },
    {
      "t": "What is the value of 0 in 908?",
      "o": [
        "0",
        "10",
        "90",
        "900"
      ],
      "a": 0,
      "e": "The 0 is in the tens place. It means there are zero tens, so its value is 0. You understand zero! 💡",
      "d": "m"
    },
    {
      "t": "What number comes next? Skip count by 2s: 18, 20, 22, ___",
      "o": [
        "23",
        "25",
        "26",
        "24"
      ],
      "a": 3,
      "e": "Just count on 2 from 22! 22... 23, 24. So, 22 + 2 = 24. Great counting! ➕",
      "d": "e"
    },
    {
      "t": "What is 700 + 0 + 3?",
      "o": [
        "73",
        "703",
        "730",
        "7003"
      ],
      "a": 1,
      "e": "Seven hundreds, zero tens, and three ones make the number 703. You got it! 👏",
      "d": "h"
    },
    {
      "t": "What is 10 more than 482?",
      "o": [
        "472",
        "483",
        "492",
        "582"
      ],
      "a": 2,
      "e": "Adding 10 means one more ten. So, 8 tens becomes 9 tens: 492. You're a math whiz! ➕",
      "d": "e"
    },
    {
      "t": "What is 562 rounded to the nearest ten?",
      "o": [
        "562",
        "560",
        "570",
        "600"
      ],
      "a": 1,
      "e": "The ones digit is 2. Since 2 is less than 5, we round down to 560. You're a rounding pro! 🎯",
      "d": "m"
    },
    {
      "t": "What number comes next? Skip count by 100s: 400, 500, 600, ___",
      "o": [
        "650",
        "690",
        "700",
        "800"
      ],
      "a": 2,
      "e": "When you add 100 to 600, you just add one more hundred. That makes 700! Fantastic! 💯",
      "d": "h"
    },
    {
      "t": "Which symbol goes in the blank? 899 ___ 901",
      "o": [
        "<",
        ">",
        "=",
        "≠"
      ],
      "a": 0,
      "e": "Look at the hundreds place! 8 hundreds is less than 9 hundreds. So, 899 < 901. You're a comparison champ! 🏆",
      "d": "h"
    },
    {
      "t": "Which digit is in the hundreds place of 735?",
      "o": [
        "3",
        "5",
        "7",
        "73"
      ],
      "a": 2,
      "e": "The digit 7 is in the hundreds place. It means it has a value of 700. Good job! 👍",
      "d": "m"
    },
    {
      "t": "Which number comes between 349 and 351?",
      "o": [
        "348",
        "350",
        "352",
        "300"
      ],
      "a": 1,
      "e": "These numbers are counting up by one! 349, then 350, then 351. Keep counting! 🔢",
      "d": "h"
    },
    {
      "t": "What is the word form of 519?",
      "o": [
        "five hundred ninety-one",
        "five hundred nineteen",
        "fifty nineteen",
        "five nineteen"
      ],
      "a": 1,
      "e": "500 and 19 together make the number five hundred nineteen. You're a word master! ✍️",
      "d": "e"
    },
    {
      "t": "What is the standard form of 200 + 40 + 7?",
      "o": [
        "247",
        "274",
        "427",
        "742"
      ],
      "a": 0,
      "e": "Two hundreds, four tens, and seven ones make the number 247. You know your numbers! ✨",
      "d": "h"
    },
    {
      "t": "What number comes next? Skip count by 5s: 95, 100, 105, ___",
      "o": [
        "108",
        "112",
        "115",
        "110"
      ],
      "a": 3,
      "e": "Start at 105 and count up 5 more! You land on 110. Great job! 👍",
      "d": "h"
    },
    {
      "t": "What is 100 more than 623?",
      "o": [
        "523",
        "633",
        "713",
        "723"
      ],
      "a": 3,
      "e": "Adding 100 makes the hundreds digit go up by one! 6 becomes 7. So, 623 + 100 = 723! 🎉",
      "d": "m"
    },
    {
      "t": "What is 10 less than 390?",
      "o": [
        "380",
        "381",
        "389",
        "400"
      ],
      "a": 0,
      "e": "Taking away 10 makes the tens digit go down by one! 9 becomes 8. So, 390 - 10 = 380! You got it! ✨",
      "d": "m"
    },
    {
      "t": "Put these numbers in order from greatest to least: 528, 825, 258",
      "o": [
        "825,528,258",
        "528,825,258",
        "258,528,825",
        "258,825,528"
      ],
      "a": 0,
      "e": "Compare the hundreds digit first! 8 is the biggest, then 5, then 2. So, 825 > 528 > 258. Super smart! 🧠",
      "d": "h"
    },
    {
      "t": "What is 300 + 70 + 0?",
      "o": [
        "307",
        "370",
        "3070",
        "37"
      ],
      "a": 1,
      "e": "3 hundreds is 300, 7 tens is 70, and 0 ones is 0. Put them together to make 370! Nicely done! 😊",
      "d": "h"
    },
    {
      "t": "Which symbol goes in the blank? 760 ___ 760",
      "o": [
        "<",
        ">",
        "=",
        "≠"
      ],
      "a": 2,
      "e": "When two numbers are exactly the same, we say they are equal! That's what \"=\" means. You're a math whiz! ⭐",
      "d": "h"
    }
  ]
};

export const testBank: Question[] = [
  {
    "t": "In 347, what is the HUNDREDS digit?",
    "o": [
      "3",
      "4",
      "7",
      "34"
    ],
    "a": 0,
    "e": "In 347, the 3 is in the hundreds place, 4 is in the tens place, and 7 is in the ones place! Good job! ✅",
    "d": "e"
  },
  {
    "t": "In 562, what is the TENS digit?",
    "o": [
      "2",
      "5",
      "6",
      "56"
    ],
    "a": 2,
    "e": "For 562, the 5 is hundreds, the 6 is tens, and the 2 is ones. You know your place values! 👍",
    "d": "e"
  },
  {
    "t": "What is the value of 4 in 347?",
    "o": [
      "4",
      "40",
      "400",
      "4000"
    ],
    "a": 1,
    "e": "A 4 in the tens place means you have 4 groups of ten, which makes 40! You got it! ✨",
    "d": "m"
  },
  {
    "t": "What is the value of 5 in 562?",
    "o": [
      "5",
      "50",
      "500",
      "5000"
    ],
    "a": 2,
    "e": "A 5 in the hundreds place means you have 5 groups of one hundred, which makes 500! Amazing! 💯",
    "d": "m"
  },
  {
    "t": "What is 3 hundreds + 4 tens + 7 ones?",
    "o": [
      "347",
      "374",
      "437",
      "473"
    ],
    "a": 0,
    "e": "When you add 300 (3 hundreds), 40 (4 tens), and 7 (7 ones), you build the number 347! Awesome! 🏗️",
    "d": "e"
  },
  {
    "t": "What is 5 hundreds + 6 tens + 2 ones?",
    "o": [
      "526",
      "625",
      "652",
      "562"
    ],
    "a": 3,
    "e": "Add 500 (5 hundreds), 60 (6 tens), and 2 (2 ones) to make the number 562! You're a number builder! 🧱",
    "d": "e"
  },
  {
    "t": "In 809, what digit is in the TENS place?",
    "o": [
      "0",
      "8",
      "9",
      "80"
    ],
    "a": 0,
    "e": "In 809, there are 8 hundreds, 0 tens (a placeholder!), and 9 ones. You found them all! ⭐",
    "d": "e"
  },
  {
    "t": "What is the value of 9 in 903?",
    "o": [
      "9",
      "90",
      "900",
      "9000"
    ],
    "a": 2,
    "e": "A 9 in the hundreds place means you have 9 groups of one hundred, which makes 900! Super! 💯",
    "d": "m"
  },
  {
    "t": "What digit is in the tens place in 450?",
    "o": [
      "4",
      "0",
      "45",
      "5"
    ],
    "a": 3,
    "e": "For 450, there are 4 hundreds, 5 tens, and 0 ones. You know your place values! Good job! ✅",
    "d": "e"
  },
  {
    "t": "What is the ones digit in 738?",
    "o": [
      "3",
      "7",
      "8",
      "73"
    ],
    "a": 2,
    "e": "In 738, the 7 is hundreds, the 3 is tens, and the 8 is ones. You're a place value pro! ✨",
    "d": "e"
  },
  {
    "t": "In 206, what is in the tens place?",
    "o": [
      "0",
      "2",
      "6",
      "20"
    ],
    "a": 0,
    "e": "In 206, there are 2 hundreds, 0 tens (a placeholder!), and 6 ones. You got it! 👍",
    "d": "e"
  },
  {
    "t": "What is the value of 7 in 735?",
    "o": [
      "7",
      "70",
      "700",
      "7000"
    ],
    "a": 2,
    "e": "A 7 in the hundreds place means you have 7 groups of one hundred, which makes 700! Fantastic! 💯",
    "d": "m"
  },
  {
    "t": "What is 8 hundreds + 0 tens + 5 ones?",
    "o": [
      "850",
      "508",
      "580",
      "805"
    ],
    "a": 3,
    "e": "Add 800 (8 hundreds), 0 (0 tens), and 5 (5 ones) to build the number 805! You're a math star! ⭐",
    "d": "e"
  },
  {
    "t": "In 614, what is the tens digit?",
    "o": [
      "4",
      "6",
      "61",
      "1"
    ],
    "a": 3,
    "e": "For 614, the 6 is hundreds, the 1 is tens, and the 4 is ones. You know your numbers! 🎉",
    "d": "e"
  },
  {
    "t": "What is the value of 3 in 370?",
    "o": [
      "3",
      "30",
      "300",
      "3000"
    ],
    "a": 2,
    "e": "The digit 3 is in the hundreds place, so it means 3 hundreds, which is 300! ✨",
    "d": "m"
  },
  {
    "t": "In 528, how many hundreds?",
    "o": [
      "2",
      "5",
      "8",
      "52"
    ],
    "a": 1,
    "e": "In 528, the 5 is 5 hundreds, the 2 is 2 tens, and the 8 is 8 ones. Great job! 👍",
    "d": "e"
  },
  {
    "t": "Which number has 4 hundreds, 3 tens, 6 ones?",
    "o": [
      "346",
      "364",
      "436",
      "634"
    ],
    "a": 2,
    "e": "When you put 4 hundreds, 3 tens, and 6 ones together, you get 436! You got it! 💯",
    "d": "e"
  },
  {
    "t": "In 901, which place has a zero?",
    "o": [
      "Ones",
      "Tens",
      "Hundreds",
      "All places"
    ],
    "a": 1,
    "e": "In 901, 9 is hundreds, 0 is tens (no tens!), and 1 is ones. Zero holds the tens place! 🌟",
    "d": "h"
  },
  {
    "t": "What is the value of 6 in 164?",
    "o": [
      "6",
      "600",
      "160",
      "60"
    ],
    "a": 3,
    "e": "The digit 6 is in the tens place, so it means 6 tens, which is 60! You're a star! ⭐",
    "d": "m"
  },
  {
    "t": "In 777, all three digits are the same. What is the value of the hundreds digit?",
    "o": [
      "7",
      "70",
      "700",
      "7000"
    ],
    "a": 2,
    "e": "The digit 7 is in the hundreds place, so it means 7 hundreds, which is 700! Super! 🚀",
    "d": "m"
  },
  {
    "t": "Which digit is in the ONES place in 493?",
    "o": [
      "3",
      "4",
      "9",
      "49"
    ],
    "a": 0,
    "e": "In 493, the 4 is 4 hundreds, the 9 is 9 tens, and the 3 is 3 ones. Awesome work! 😄",
    "d": "e"
  },
  {
    "t": "What is 7 hundreds + 2 tens + 0 ones?",
    "o": [
      "702",
      "720",
      "270",
      "207"
    ],
    "a": 1,
    "e": "Putting 7 hundreds, 2 tens, and 0 ones together makes 720! You're so smart! 💡",
    "d": "e"
  },
  {
    "t": "In 315, what is the value of the 3?",
    "o": [
      "3",
      "30",
      "300",
      "3000"
    ],
    "a": 2,
    "e": "The 3 is in the hundreds place, so its value is 3 hundreds, or 300! You got it right! 🎉",
    "d": "m"
  },
  {
    "t": "In 615, what is the value of 1?",
    "o": [
      "1",
      "100",
      "1000",
      "10"
    ],
    "a": 3,
    "e": "The digit 1 is in the tens place, so it means 1 ten, which is 10! Fantastic! ✨",
    "d": "m"
  },
  {
    "t": "Which number has 0 in the tens place?",
    "o": [
      "305",
      "350",
      "253",
      "530"
    ],
    "a": 0,
    "e": "In 305, 3 is hundreds, 0 is tens (no tens!), and 5 is ones. Zero holds the tens place! 👍",
    "d": "e"
  },
  {
    "t": "What is the value of 8 in 284?",
    "o": [
      "8",
      "80",
      "800",
      "8000"
    ],
    "a": 1,
    "e": "The digit 8 is in the tens place, so it means 8 tens, which is 80! Way to go! 🥳",
    "d": "m"
  },
  {
    "t": "In 799, what digit is in hundreds place?",
    "o": [
      "9",
      "99",
      "79",
      "7"
    ],
    "a": 3,
    "e": "In 799, the 7 is 7 hundreds, the 9 is 9 tens, and the other 9 is 9 ones. You're a pro! 🌟",
    "d": "e"
  },
  {
    "t": "What is 4 hundreds + 0 tens + 4 ones?",
    "o": [
      "404",
      "440",
      "400",
      "44"
    ],
    "a": 0,
    "e": "When you put 4 hundreds, 0 tens, and 4 ones together, you get 404! Excellent! ✅",
    "d": "e"
  },
  {
    "t": "In 863, how many tens are there?",
    "o": [
      "3",
      "6",
      "8",
      "63"
    ],
    "a": 1,
    "e": "In 863, the 8 is 8 hundreds, the 6 is 6 tens, and the 3 is 3 ones. You're amazing! 🤩",
    "d": "e"
  },
  {
    "t": "What is the value of 5 in 857?",
    "o": [
      "5",
      "50",
      "500",
      "5000"
    ],
    "a": 1,
    "e": "The digit 5 is in the tens place, so it means 5 tens, which is 50! Keep up the great work! 👍",
    "d": "m"
  },
  {
    "t": "What is the expanded form of 352?",
    "o": [
      "300+50+2",
      "300+5+2",
      "30+50+2",
      "350+2"
    ],
    "a": 0,
    "e": "3H means 3 hundreds (300), 5T means 5 tens (50), and 2O means 2 ones (2). You got it! 🎉",
    "d": "e"
  },
  {
    "t": "What is 200 + 40 + 7?",
    "o": [
      "247",
      "274",
      "427",
      "742"
    ],
    "a": 0,
    "e": "2 hundreds, 4 tens, and 7 ones come together to make the number 247! Super smart! 🧠",
    "d": "m"
  },
  {
    "t": "What is the expanded form of 806?",
    "o": [
      "800+6",
      "80+6",
      "8+0+6",
      "800+0+6"
    ],
    "a": 3,
    "e": "8H is 800, 0T is 0 tens (0), and 6O is 6 ones (6). You showed the value of each part! 👏",
    "d": "e"
  },
  {
    "t": "What is 500 + 30 + 1?",
    "o": [
      "531",
      "513",
      "315",
      "135"
    ],
    "a": 0,
    "e": "5 hundreds, 3 tens, and 1 one come together to make the number 531! You're a math whiz! 🤩",
    "d": "m"
  },
  {
    "t": "What is the word form of 425?",
    "o": [
      "four hundred twenty-five",
      "four twenty-five",
      "four hundred fifty-two",
      "four hundred two"
    ],
    "a": 0,
    "e": "You added 4 hundreds, 2 tens, and 5 ones! That makes four hundred twenty-five. You put the number parts together! ✨",
    "d": "e"
  },
  {
    "t": "What is 400 + 0 + 9?",
    "o": [
      "490",
      "904",
      "940",
      "409"
    ],
    "a": 3,
    "e": "4 hundreds, 0 tens, and 9 ones means there are no tens! So the number is 409. You got it! 👍",
    "d": "m"
  },
  {
    "t": "What is the expanded form of 671?",
    "o": [
      "600+71",
      "600+7+1",
      "600+70+1",
      "67+1"
    ],
    "a": 2,
    "e": "6H means 600, 7T means 70, and 1O means 1! You broke the number into its place value parts. Super! 💡",
    "d": "e"
  },
  {
    "t": "What is 300 + 80 + 0?",
    "o": [
      "308",
      "830",
      "803",
      "380"
    ],
    "a": 3,
    "e": "3 hundreds, 8 tens, and 0 ones make 380! The 0 means there are no ones. You wrote the number! ✅",
    "d": "m"
  },
  {
    "t": "What is the word form of 250?",
    "o": [
      "two hundred five",
      "two hundred fifty",
      "two fifty",
      "two hundred fifteen"
    ],
    "a": 1,
    "e": "You added 2 hundreds and 5 tens! That makes two hundred fifty. You found the number word! 🥳",
    "d": "e"
  },
  {
    "t": "What is 700 + 60 + 4?",
    "o": [
      "746",
      "674",
      "467",
      "764"
    ],
    "a": 3,
    "e": "7 hundreds, 6 tens, and 4 ones make 764! You put the digits in the right place. Awesome! ⭐",
    "d": "m"
  },
  {
    "t": "What is the expanded form of 103?",
    "o": [
      "100+3",
      "100+0+3",
      "10+3",
      "1+0+3"
    ],
    "a": 1,
    "e": "1H means 100, 0T means 0, and 3O means 3! You wrote the number in expanded form. Great job! 🧠",
    "d": "e"
  },
  {
    "t": "What is 900 + 0 + 0?",
    "o": [
      "9",
      "90",
      "900",
      "9000"
    ],
    "a": 2,
    "e": "9 hundreds, 0 tens, and 0 ones make 900! The zeroes show there are no tens or ones. Fantastic! 🎉",
    "d": "m"
  },
  {
    "t": "What is the standard form of 600 + 50 + 8?",
    "o": [
      "568",
      "658",
      "685",
      "865"
    ],
    "a": 1,
    "e": "You added 6 hundreds, 5 tens, and 8 ones! That makes 658. You put the number parts together. Good job! 👍",
    "d": "h"
  },
  {
    "t": "What is the word form of 317?",
    "o": [
      "thirty-one seven",
      "three hundred seventy-one",
      "three hundred seventeen",
      "thirty-seventeen"
    ],
    "a": 2,
    "e": "You added 3 hundreds, 1 ten, and 7 ones! That makes three hundred seventeen. You found the number word! ✨",
    "d": "e"
  },
  {
    "t": "What is the expanded form of 480?",
    "o": [
      "400+80",
      "400+8+0",
      "400+80+0",
      "48+0"
    ],
    "a": 2,
    "e": "4H means 400, 8T means 80, and 0O means 0! You wrote the number in expanded form. Excellent! 🥳",
    "d": "e"
  },
  {
    "t": "What is 100 + 20 + 3?",
    "o": [
      "123",
      "132",
      "213",
      "321"
    ],
    "a": 0,
    "e": "1 hundred, 2 tens, and 3 ones make 123! You put the digits in the right place. You're a star! ⭐",
    "d": "m"
  },
  {
    "t": "What is the standard form of five hundred sixty-two?",
    "o": [
      "526",
      "562",
      "625",
      "652"
    ],
    "a": 1,
    "e": "You added 5 hundreds, 6 tens, and 2 ones! That makes 562. You put the number parts together. Good job! ✅",
    "d": "e"
  },
  {
    "t": "What is 200 + 90 + 5?",
    "o": [
      "259",
      "295",
      "529",
      "952"
    ],
    "a": 1,
    "e": "2 hundreds, 9 tens, and 5 ones make 295! You put the digits in the right place. Super! 👍",
    "d": "m"
  },
  {
    "t": "What is the expanded form of 900?",
    "o": [
      "9+0+0",
      "90+0",
      "900+0+0",
      "9+00+0"
    ],
    "a": 2,
    "e": "9H means 900, 0T means 0, and 0O means 0! You wrote the number in expanded form. Excellent! 🧠",
    "d": "e"
  },
  {
    "t": "What is 400 + 60 + 0?",
    "o": [
      "406",
      "460",
      "604",
      "640"
    ],
    "a": 1,
    "e": "4 hundreds, 6 tens, and 0 ones make 460! The 0 means there are no ones. You wrote the number! ✅",
    "d": "m"
  },
  {
    "t": "What is the word form of 708?",
    "o": [
      "seventy-eight",
      "seven hundred eighty",
      "seven hundred eight",
      "seventy hundred eight"
    ],
    "a": 2,
    "e": "You added 7 hundreds and 8 ones! That makes seven hundred eight. You found the number word! ✨",
    "d": "e"
  },
  {
    "t": "What is the expanded form of 535?",
    "o": [
      "500+35",
      "500+3+5",
      "500+30+5",
      "530+5"
    ],
    "a": 2,
    "e": "5H means 500, 3T means 30, and 5O means 5! You wrote the number in expanded form. Keep it up! 💡",
    "d": "e"
  },
  {
    "t": "What is 800 + 70 + 0?",
    "o": [
      "807",
      "870",
      "780",
      "708"
    ],
    "a": 1,
    "e": "8 hundreds, 7 tens, and 0 ones make 870! The 0 means there are no ones. You wrote the number! 🎉",
    "d": "m"
  },
  {
    "t": "What is the standard form of three hundred forty?",
    "o": [
      "304",
      "430",
      "403",
      "340"
    ],
    "a": 3,
    "e": "You added 3 hundreds and 4 tens! That makes 340. You put the number parts together. Super! ⭐",
    "d": "e"
  },
  {
    "t": "What is 100 + 0 + 7?",
    "o": [
      "107",
      "170",
      "710",
      "701"
    ],
    "a": 0,
    "e": "1 hundred, 0 tens, and 7 ones make the number 107. Great job! 👍",
    "d": "m"
  },
  {
    "t": "What is the expanded form of 999?",
    "o": [
      "900+9+9",
      "900+99",
      "900+90+9",
      "9+90+900"
    ],
    "a": 2,
    "e": "9 hundreds is 900, 9 tens is 90, and 9 ones is 9. So, 900 + 90 + 9 is correct! ✨",
    "d": "e"
  },
  {
    "t": "What is 600 + 0 + 3?",
    "o": [
      "603",
      "630",
      "360",
      "306"
    ],
    "a": 0,
    "e": "6 hundreds, 0 tens, and 3 ones combine to make the number 603. You got it! ✅",
    "d": "h"
  },
  {
    "t": "What is the word form of 840?",
    "o": [
      "eighty-four",
      "eight hundred four",
      "eight hundred forty",
      "eight four zero"
    ],
    "a": 2,
    "e": "800 means 8 hundreds. 40 means 4 tens. Together, they make eight hundred forty! Super! 🌟",
    "d": "e"
  },
  {
    "t": "What is 300 + 50 + 0?",
    "o": [
      "305",
      "530",
      "503",
      "350"
    ],
    "a": 3,
    "e": "3 hundreds, 5 tens, and 0 ones form the number 350. Well done! 👍",
    "d": "h"
  },
  {
    "t": "What is the expanded form of 762?",
    "o": [
      "700+6+2",
      "70+60+2",
      "762",
      "700+60+2"
    ],
    "a": 3,
    "e": "7 hundreds is 700, 6 tens is 60, and 2 ones is 2. So, 700 + 60 + 2 is right! 🎉",
    "d": "e"
  },
  {
    "t": "Which symbol goes in the blank? 527 ___ 572",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 0,
    "e": "Both numbers have 5 hundreds. Look at the tens! 2 tens is less than 7 tens, so 527 < 572. You compared them! 🥳",
    "d": "h"
  },
  {
    "t": "Which is greater: 384 or 438?",
    "o": [
      "384",
      "438",
      "Equal",
      "Cannot tell"
    ],
    "a": 1,
    "e": "Look at the hundreds place first! 3 hundreds is less than 4 hundreds, so 438 is greater. Good job! ✨",
    "d": "e"
  },
  {
    "t": "Is this true or false? 650 > 605",
    "o": [
      "True",
      "False",
      "Maybe",
      "Cannot tell"
    ],
    "a": 0,
    "e": "The hundreds are the same! Now look at the tens. 5 tens is greater than 0 tens. That's TRUE! ✅",
    "d": "h"
  },
  {
    "t": "Put these numbers in order from least to greatest: 312, 132, 231",
    "o": [
      "132,231,312",
      "312,132,231",
      "231,132,312",
      "132,312,231"
    ],
    "a": 0,
    "e": "Compare the hundreds place! 1 hundred is smallest, then 2 hundreds, then 3 hundreds. Perfect order! 💯",
    "d": "h"
  },
  {
    "t": "Which symbol goes in the blank? 760 ___ 760",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 2,
    "e": "When two numbers are exactly the same, they are equal! So simple! = 😊",
    "d": "h"
  },
  {
    "t": "What is 100 more than 523?",
    "o": [
      "524",
      "533",
      "613",
      "623"
    ],
    "a": 3,
    "e": "Adding 100 means you add 1 to the hundreds place. So, 5 hundreds + 1 hundred = 6 hundreds! 523 + 100 = 623. 🎉",
    "d": "e"
  },
  {
    "t": "Which symbol goes in the blank? 199 ___ 200",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 0,
    "e": "Counting back just one from 200 brings you to 199. It's one less! Good counting! 🔢",
    "d": "h"
  },
  {
    "t": "Which number is the greatest? 456, 546, or 465?",
    "o": [
      "456",
      "465",
      "546",
      "Equal"
    ],
    "a": 2,
    "e": "Compare the hundreds! 5 hundreds is more than 4 hundreds, so 546 is the greatest number. Awesome! 🏆",
    "d": "h"
  },
  {
    "t": "What is 10 less than 350?",
    "o": [
      "349",
      "340",
      "360",
      "351"
    ],
    "a": 1,
    "e": "Subtracting 10 means you take away 1 from the tens place. 5 tens - 1 ten = 4 tens. So, 350 - 10 = 340. Smart! 🧠",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 408 ___ 480",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 0,
    "e": "The hundreds are the same! Look at the tens. 0 tens is less than 8 tens. You found it! 👍",
    "d": "h"
  },
  {
    "t": "Put these numbers in order from greatest to least: 528, 258, 825",
    "o": [
      "825,528,258",
      "528,258,825",
      "258,528,825",
      "825,258,528"
    ],
    "a": 0,
    "e": "Look at the hundreds place! 8 hundreds is largest, then 5 hundreds, then 2 hundreds. Great ordering! 🌟",
    "d": "h"
  },
  {
    "t": "What is 100 less than 756?",
    "o": [
      "646",
      "656",
      "756",
      "856"
    ],
    "a": 1,
    "e": "Subtracting 100 means you take away 1 from the hundreds place. 7 hundreds - 1 hundred = 6 hundreds! 756 - 100 = 656. ✅",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 900 ___ 90",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 1,
    "e": "900 has 9 hundreds, but 90 has 0 hundreds. 9 hundreds is much more than 0 hundreds! So 900 > 90. Awesome! 🤩",
    "d": "h"
  },
  {
    "t": "Which is less: 742 or 724?",
    "o": [
      "742",
      "724",
      "Equal",
      "Cannot tell"
    ],
    "a": 1,
    "e": "The hundreds are the same! Look at the tens. 2 tens is less than 4 tens. So, 724 is less. You're a pro! 🌟",
    "d": "h"
  },
  {
    "t": "What is 10 more than 690?",
    "o": [
      "600",
      "691",
      "700",
      "790"
    ],
    "a": 2,
    "e": "Adding 10 to 690 means you regroup the tens to make a new hundred! So, 690 + 10 = 700! ✨",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 335 ___ 353",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 0,
    "e": "When hundreds are the same, look at the tens! 3 tens is less than 5 tens. That number is smaller. 👍",
    "d": "h"
  },
  {
    "t": "Which number is in the middle when ordered least to greatest? 410, 401, 140",
    "o": [
      "140",
      "401",
      "410",
      "Equal"
    ],
    "a": 1,
    "e": "Compare hundreds first! Then compare tens. 401 is bigger than 140, but smaller than 410. It's in the middle! 🌈",
    "d": "h"
  },
  {
    "t": "What is 1 more than 399?",
    "o": [
      "300",
      "389",
      "398",
      "400"
    ],
    "a": 3,
    "e": "Adding 1 to 399 means you regroup the ones and tens to make a new hundred! So, 399 + 1 = 400. 🎉",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 807 ___ 780",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 1,
    "e": "Start by looking at the hundreds place! 8 hundreds is more than 7 hundreds. So, 807 is greater than 780! 💪",
    "d": "h"
  },
  {
    "t": "Which number is the least? 605, 506, or 650?",
    "o": [
      "605",
      "506",
      "650",
      "Equal"
    ],
    "a": 1,
    "e": "Look at the hundreds place first! 5 hundreds is less than 6 hundreds. That means 506 is the least number! 👇",
    "d": "h"
  },
  {
    "t": "Which symbol goes in the blank? 500 ___ 499",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 1,
    "e": "500 has 5 hundreds, but 499 only has 4 hundreds. So, 500 is greater than 499! ✨",
    "d": "h"
  },
  {
    "t": "What is 100 more than 899?",
    "o": [
      "800",
      "900",
      "989",
      "999"
    ],
    "a": 3,
    "e": "When you add 100, only the hundreds digit changes! 8 hundreds + 1 hundred = 9 hundreds. So, 899 + 100 = 999. ✅",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 234 ___ 243",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 0,
    "e": "If the hundreds are the same, look at the tens place! 3 tens is less than 4 tens. So, that number is smaller. 🤏",
    "d": "h"
  },
  {
    "t": "Put these numbers in order from least to greatest: 901, 190, 910",
    "o": [
      "190,901,910",
      "901,910,190",
      "910,901,190",
      "190,910,901"
    ],
    "a": 0,
    "e": "Compare hundreds first! Then compare tens. 190 is the smallest, and 910 is the biggest. You did it! 🎉",
    "d": "h"
  },
  {
    "t": "What is 10 less than 400?",
    "o": [
      "300",
      "390",
      "410",
      "490"
    ],
    "a": 1,
    "e": "To subtract 10 from 400, you need to regroup a hundred into tens. Then you get 390! So, 400 - 10 = 390. 📉",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 673 ___ 637",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 1,
    "e": "When hundreds are the same, look at the tens place! 7 tens is more than 3 tens. So, that number is greater! ✨",
    "d": "h"
  },
  {
    "t": "Which number is the greatest? 289, 298, or 928?",
    "o": [
      "289",
      "298",
      "928",
      "Equal"
    ],
    "a": 2,
    "e": "Look at the hundreds place first! 9 hundreds is more than 2 hundreds. That means 928 is the greatest number! ⬆️",
    "d": "h"
  },
  {
    "t": "What is 1 less than 700?",
    "o": [
      "600",
      "699",
      "701",
      "709"
    ],
    "a": 1,
    "e": "To subtract 1 from 700, you need to regroup a hundred and a ten. You get 699! So, 700 - 1 = 699. ➖",
    "d": "m"
  },
  {
    "t": "Which symbol goes in the blank? 415 ___ 415",
    "o": [
      "<",
      ">",
      "=",
      "≠"
    ],
    "a": 2,
    "e": "Both numbers have the same hundreds, tens, and ones. They are exactly the same! Great job! 🎉",
    "d": "h"
  },
  {
    "t": "What is 100 more than 450?",
    "o": [
      "350",
      "451",
      "540",
      "550"
    ],
    "a": 3,
    "e": "When you add 100, only the hundreds digit changes! 4 hundreds + 1 hundred = 5 hundreds. So, 450 + 100 = 550. ✔️",
    "d": "m"
  },
  {
    "t": "What number comes next? Skip count by 2s: 14, 16, ___",
    "o": [
      "17",
      "18",
      "19",
      "20"
    ],
    "a": 1,
    "e": "Just add the ones together! 6 ones + 2 ones = 8 ones. The tens stay the same. So, 16 + 2 = 18. 👍",
    "d": "e"
  },
  {
    "t": "What number comes next? Skip count by 5s: 25, 30, ___",
    "o": [
      "32",
      "33",
      "34",
      "35"
    ],
    "a": 3,
    "e": "When you add 5 to 30, the 5 ones just join the 3 tens. It makes 35! So, 30 + 5 = 35. 😊",
    "d": "e"
  },
  {
    "t": "What number comes next? Skip count by 10s: 40, 50, ___",
    "o": [
      "60",
      "55",
      "58",
      "65"
    ],
    "a": 0,
    "e": "When you add 10, you are adding one more group of ten! 5 tens + 1 ten = 6 tens. So, 50 + 10 = 60. ➕",
    "d": "m"
  },
  {
    "t": "What number comes next? Skip count by 100s: 200, 300, ___",
    "o": [
      "400",
      "350",
      "380",
      "500"
    ],
    "a": 0,
    "e": "When you add 100 to 300, you are just adding one more hundred! 3 hundreds + 1 hundred = 4 hundreds. So, 300 + 100 = 400. ✅",
    "d": "h"
  },
  {
    "t": "What is the counting rule? 6, 12, 18, 24...",
    "o": [
      "Add 4",
      "Add 5",
      "Add 6",
      "Add 7"
    ],
    "a": 2,
    "e": "You're counting on by 6! Each number grows by 6 more. Keep adding 6 to find the next. ✨",
    "d": "m"
  },
  {
    "t": "What number comes next? Skip count by 2s: 20, 22, 24, ___",
    "o": [
      "25",
      "26",
      "27",
      "28"
    ],
    "a": 1,
    "e": "Start at 24 and count up 2! 24, 25, 26. So, 24 + 2 = 26. Great job! 👍",
    "d": "m"
  },
  {
    "t": "What number comes next? Skip count by 5s: 40, 45, 50, ___",
    "o": [
      "55",
      "52",
      "54",
      "60"
    ],
    "a": 0,
    "e": "When you add 5 to 50, the 0 ones become 5 ones. The 5 tens stay the same! 50 + 5 = 55. 🎉",
    "d": "h"
  },
  {
    "t": "What number comes next? Skip count by 10s: 70, 80, 90, ___",
    "o": [
      "95",
      "105",
      "110",
      "100"
    ],
    "a": 3,
    "e": "You have 9 tens (90). Add 1 more ten. Now you have 10 tens, which is 100! 90 + 10 = 100. 💯",
    "d": "h"
  },
  {
    "t": "What number comes next? Skip count by 100s: 500, 600, 700, ___",
    "o": [
      "800",
      "750",
      "780",
      "900"
    ],
    "a": 0,
    "e": "When you add 100 to 700, only the hundreds digit changes. 7 hundreds + 1 hundred = 8 hundreds! 700 + 100 = 800. ✅",
    "d": "h"
  },
  {
    "t": "What is the counting rule? 4, 8, 12, 16...",
    "o": [
      "Add 4",
      "Add 2",
      "Add 3",
      "Add 5"
    ],
    "a": 0,
    "e": "Look for the pattern! Each number gets bigger by 4. You are counting on by 4. Keep adding 4! ➕",
    "d": "e"
  },
  {
    "t": "What digit is in the hundreds place of 847?",
    "o": [
      "4",
      "7",
      "8",
      "84"
    ],
    "a": 2,
    "e": "The hundreds place is the digit on the far left! It tells you how many hundreds. In 847, the 8 is in the hundreds place. ✨",
    "d": "e"
  },
  {
    "t": "How do you write 362 in expanded form?",
    "o": [
      "300 + 60 + 2",
      "3 + 6 + 2",
      "360 + 2",
      "36 + 2"
    ],
    "a": 0,
    "e": "Expanded form shows the value of each digit! 3 hundreds is 300, 6 tens is 60, 2 ones is 2. So, 362 = 300 + 60 + 2. 👍",
    "d": "m"
  },
  {
    "t": "Which is greater: 519 or 591?",
    "o": [
      "519",
      "591",
      "They are equal",
      "You cannot tell"
    ],
    "a": 1,
    "e": "Both have 5 hundreds! So, compare the tens. 519 has 1 ten, 591 has 9 tens. Since 1 < 9, 519 is smaller than 591. ✅",
    "d": "m"
  },
  {
    "t": "Count by 10s: 460, 470, 480, ___",
    "o": [
      "481",
      "485",
      "490",
      "500"
    ],
    "a": 2,
    "e": "Look at the tens place! When you add 10, the tens digit goes up by 1. 480 + 10 = 490. You got it! 🌟",
    "d": "h"
  },
  {
    "t": "What is the standard form of five hundred nine?",
    "o": [
      "590",
      "509",
      "59",
      "5,009"
    ],
    "a": 1,
    "e": "\"Five hundred nine\" means 5 hundreds, 0 tens, and 9 ones. The 0 in the tens place is a placeholder! So it's 509. 👍",
    "d": "e"
  },
  {
    "t": "What is 100 more than 723?",
    "o": [
      "733",
      "823",
      "724",
      "623"
    ],
    "a": 1,
    "e": "Adding 100 is easy! Only the hundreds digit changes. 7 hundreds + 1 hundred = 8 hundreds. So, 723 + 100 = 823. 🎉",
    "d": "m"
  },
  {
    "t": "How many tens are in 60?",
    "o": [
      "0",
      "6",
      "60",
      "600"
    ],
    "a": 1,
    "e": "The number 60 means you have 6 groups of ten. Count by tens 6 times: 10, 20, 30, 40, 50, 60! So, 60 has 6 tens. ✨",
    "d": "e"
  },
  {
    "t": "Which symbol goes in the blank? 300 ___ 299",
    "o": [
      ">",
      "<",
      "=",
      "+"
    ],
    "a": 0,
    "e": "Always compare the hundreds first! 300 has 3 hundreds, and 299 has 2 hundreds. Since 3 > 2, 300 is bigger! ✅",
    "d": "h"
  },
  {
    "t": "Count by 5s: 85, 90, 95, ___",
    "o": [
      "96",
      "100",
      "105",
      "110"
    ],
    "a": 1,
    "e": "You are counting on by 5! Look for the pattern. Keep adding 5 to each number. 95 + 5 = 100. You're doing great! 🌟",
    "d": "m"
  },
  {
    "t": "Ben has 4 hundreds blocks and 6 ones blocks. What number did he make?",
    "o": [
      "46",
      "406",
      "460",
      "604"
    ],
    "a": 1,
    "e": "4 hundreds is 400. 0 tens means no tens, so we put a 0. 6 ones is 6. Put it all together: 406! 🎉",
    "d": "m"
  },
  {
    "t": "In the number 637, what is the value of the digit 3?",
    "o": [
      "3",
      "30",
      "300",
      "37"
    ],
    "a": 1,
    "e": "The place of a digit tells its value! The 3 is in the tens place, so it means 3 tens. That's 30, not just 3. Super! ✨",
    "d": "h"
  },
  {
    "t": "Which shows the same number as 400 + 90 + 6?",
    "o": [
      "946",
      "496",
      "469",
      "4,906"
    ],
    "a": 1,
    "e": "Put the hundreds, tens, and ones together! 400 + 90 + 6 makes 496. This is the standard form of the number. Great! 👍",
    "d": "h"
  },
  {
    "t": "Put these in order from least to greatest: 703, 730, 307",
    "o": [
      "307, 703, 730",
      "703, 730, 307",
      "730, 703, 307",
      "307, 730, 703"
    ],
    "a": 0,
    "e": "Compare hundreds first! Then compare tens. 307 (3 hundreds) is smallest. For 703 vs 730, 0 tens < 3 tens. So, 307, 703, 730. ✅",
    "d": "h"
  },
  {
    "t": "What is 10 less than 602?",
    "o": [
      "502",
      "601",
      "592",
      "612"
    ],
    "a": 2,
    "e": "You can't take 10 from 0 tens! Regroup 1 hundred (100) into 10 tens. Now you have 5 hundreds, 10 tens. Take away 1 ten. 602 - 10 = 592. ✨",
    "d": "m"
  },
  {
    "t": "500 + ___ + 8 = 578. What goes in the blank?",
    "o": [
      "7",
      "70",
      "78",
      "700"
    ],
    "a": 1,
    "e": "578 is 500 + 70 + 8. The 7 is in the tens place, so its value is 70. ✅",
    "d": "h"
  },
  {
    "t": "Nora says eight hundred twelve is 8012. What should it be?",
    "o": [
      "812",
      "8,012",
      "8,120",
      "821"
    ],
    "a": 0,
    "e": "Eight hundred twelve is 800 + 12. Nora put the numbers side by side. Add them to get 812! 💡",
    "d": "m"
  },
  {
    "t": "Which number could go in the blank? ___ > 465",
    "o": [
      "460",
      "456",
      "465",
      "470"
    ],
    "a": 3,
    "e": "To be greater than 465, the number must be bigger! 470 is the only choice that is bigger. ⬆️",
    "d": "m"
  },
  {
    "t": "What is 100 more than 950?",
    "o": [
      "960",
      "1,050",
      "850",
      "951"
    ],
    "a": 1,
    "e": "Adding 100 to 950 means one more hundred. That makes 10 hundreds, which is 1,000, plus 50! So, 1,050. 💯",
    "d": "m"
  },
  {
    "t": "Count by 5s from 375. What are the next 3 numbers?",
    "o": [
      "380, 385, 390",
      "376, 377, 378",
      "385, 395, 405",
      "380, 390, 400"
    ],
    "a": 0,
    "e": "Counting by 5s means adding 5 each time. 375 + 5 = 380, + 5 = 385, + 5 = 390. Keep adding 5! 🖐️",
    "d": "h"
  },
  {
    "t": "In the number 555, which 5 has the greatest value?",
    "o": [
      "They are all the same value",
      "The first 5 (hundreds)",
      "The middle 5 (tens)",
      "The last 5 (ones)"
    ],
    "a": 1,
    "e": "The 5 in the hundreds place is 500. The 5 in the tens place is 50. The 5 in the ones place is 5. Place makes the value! 🏆",
    "d": "h"
  },
  {
    "t": "What number has 7 hundreds, 0 tens, and 14 ones?",
    "o": [
      "7,014",
      "704",
      "714",
      "7,140"
    ],
    "a": 2,
    "e": "14 ones means 1 ten and 4 ones. We regroup the 10 ones to make 1 ten. So, 7 hundreds, 1 ten, 4 ones makes 714. ✨",
    "d": "m"
  },
  {
    "t": "Maya wrote 300 + 50 + 18 = 3,518. What should the answer be?",
    "o": [
      "368",
      "3,518",
      "358",
      "850"
    ],
    "a": 0,
    "e": "Maya put the numbers side by side. We must add the parts! 300 + 50 + 18 = 368. Great job adding! 👍",
    "d": "h"
  },
  {
    "t": "Put these in order from least to greatest: 1,010, 1,100, 1,001, 1,011",
    "o": [
      "1,001, 1,010, 1,011, 1,100",
      "1,100, 1,011, 1,010, 1,001",
      "1,001, 1,011, 1,010, 1,100",
      "1,010, 1,001, 1,011, 1,100"
    ],
    "a": 0,
    "e": "To order numbers, compare thousands, then hundreds, then tens, then ones. The order is 1,001, 1,010, 1,011, 1,100. You got it! ✅",
    "d": "h"
  },
  {
    "t": "Omar starts at 485. He adds 10 twice, then 100 once. Where does he end?",
    "o": [
      "595",
      "605",
      "685",
      "505"
    ],
    "a": 1,
    "e": "Start at 485. Add 10 to get 495. Add 10 more to get 505. Then add 100 to get 605! Keep counting! ➕",
    "d": "h"
  },
  {
    "t": "Jake says 998 > 1,002 because 9 > 1. What is wrong with his thinking?",
    "o": [
      "Nothing, he is right",
      "He should compare digit by digit, but 1,002 has more digits so it is greater",
      "He should add the digits instead",
      "998 and 1,002 are equal"
    ],
    "a": 1,
    "e": "A 4-digit number is always greater than a 3-digit number! 1,002 has 4 digits, 998 has 3. So 1,002 > 998. ✨",
    "d": "h"
  },
  {
    "t": "Ella counts by 5s from 7. Will she ever say 52?",
    "o": [
      "Yes, the ones digit alternates 2 and 7, and 52 ends in 2",
      "No, because 52 does not end in 5 or 0",
      "No, she only says odd numbers",
      "Yes, but only if she counts past 100"
    ],
    "a": 0,
    "e": "Counting by 5s from 7 means the ones digit will always be a 2 or a 7. Since 52 ends in 2, she will say it! 🥳",
    "d": "m"
  },
  {
    "t": "Two students wrote 946 in expanded form. Ava: 900 + 40 + 6. Ben: 9 hundreds + 4 tens + 6 ones. Who is correct?",
    "o": [
      "Only Ava",
      "Only Ben",
      "Both are correct",
      "Neither is correct"
    ],
    "a": 2,
    "e": "900 + 40 + 6 is expanded form. 9 hundreds + 4 tens + 6 ones is place-value form. Both show 946! Both are correct! 🌟",
    "d": "h"
  },
  {
    "t": "What is the greatest 3-digit number with a 5 in the tens place?",
    "o": [
      "959",
      "950",
      "955",
      "859"
    ],
    "a": 0,
    "e": "To make the greatest number, put the biggest digit (9) in the hundreds and ones places. The tens digit is 5. So, 959! 🤩",
    "d": "e"
  },
  {
    "t": "___ is 10 less than 1,000 and 100 more than 890. What is ___?",
    "o": [
      "900",
      "990",
      "890",
      "1,010"
    ],
    "a": 1,
    "e": "10 less than 1,000 is 990. 100 more than 890 is also 990. Both clues point to the same number! Great job! 🎉",
    "d": "h"
  },
  {
    "t": "Kai says 400 + 60 + 13 = 4,613. His sister says it equals 473. Who is right and why?",
    "o": [
      "Kai, because you put digits together",
      "His sister, because 400 + 60 + 13 = 473",
      "Neither, it equals 4,063",
      "Neither, it equals 463"
    ],
    "a": 1,
    "e": "Kai put the numbers side by side. We need to add the parts! 400 + 60 + 13 = 473. His sister is correct! 👏",
    "d": "h"
  }
];
