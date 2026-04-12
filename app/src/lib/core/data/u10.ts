// Auto-converted from src/data/u10.js
// Regenerate with: node scripts/convert-unit-data.js 10
// Do NOT edit manually — edit the source in src/data/u10.js then re-run.

import type { LessonContent, UnitQuiz, Question } from '$lib/core/types/content';

export const lessons: LessonContent[] = [
  {
    "points": [
      "EQUAL GROUPS have the same number of items in each group",
      "Count total by adding the groups together",
      "An ARRAY shows equal groups in rows and columns",
      "Rows go across (→), columns go up and down (↓)"
    ],
    "examples": [
      {
        "c": "#1a252f",
        "tag": "Equal Groups",
        "p": "3 groups of 4 apples:",
        "s": "Group 1: 🍎🍎🍎🍎\nGroup 2: 🍎🍎🍎🍎\nGroup 3: 🍎🍎🍎🍎\n\n4 + 4 + 4 = 12 apples total",
        "a": "3 groups of 4 = 12 ✅",
        "vis": "groups:🍎:3:4"
      },
      {
        "c": "#1a252f",
        "tag": "Arrays",
        "p": "A 3 × 4 array:",
        "s": "○ ○ ○ ○  (row 1)\n○ ○ ○ ○  (row 2)\n○ ○ ○ ○  (row 3)\n\n3 rows × 4 columns = 12 total",
        "a": "3 rows of 4 = 12 ✅",
        "vis": "array:⭐:3:4"
      },
      {
        "c": "#1a252f",
        "tag": "Equal or Not?",
        "p": "Which shows equal groups?",
        "s": "3+3+3 ✅ Equal! (all groups have 3)\n2+4+3 ❌ NOT equal (different sizes)\n\nAll groups must be the SAME size!",
        "a": "Equal groups all have the same amount ✅"
      }
    ],
    "practice": [
      {
        "q": "2 groups of 5 = ?",
        "a": "10",
        "h": "5 + 5 = 10! Two equal groups of 5.",
        "e": "Super job! You picked the right answer. Keep up the great thinking! 🌟"
      },
      {
        "q": "4 groups of 3 = ?",
        "a": "12",
        "h": "3 + 3 + 3 + 3 = 12! Four equal groups of 3.",
        "e": "Yes! You found the correct answer. You're doing great! 🎉"
      },
      {
        "q": "An array with 3 rows and 2 columns. Total?",
        "a": "6",
        "h": "3 rows of 2 = 2 + 2 + 2 = 6!",
        "e": "Awesome! That's the correct answer. Keep shining! ✨"
      }
    ],
    "qBank": [
      {
        "t": "How many are in 3 groups of 4?",
        "o": [
          "10",
          "11",
          "12",
          "13"
        ],
        "a": 2,
        "e": "You have 3 groups with 4 in each. Adding 4 three times (4+4+4) shows there are 12 in all! Good thinking! 🧠",
        "d": "e"
      },
      {
        "t": "An array has 3 rows and 4 columns. How many in all?",
        "o": [
          "7",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "Three groups of 4 means 3 multiplied by 4. This makes 12 in total. You got it! 🥳",
        "d": "m"
      },
      {
        "t": "Equal groups shown by 3+3+3+3?",
        "o": [
          "Yes",
          "No",
          "Sometimes",
          "Depends"
        ],
        "a": 0,
        "e": "That's right! Each group has exactly 3 items. This means they are all equal groups! ✅",
        "d": "m"
      },
      {
        "t": "How many are in 5 groups of 2?",
        "o": [
          "8",
          "9",
          "10",
          "11"
        ],
        "a": 2,
        "e": "There are 5 groups with 2 in each. When you add 2 five times, you get 10. That's correct! 🎉",
        "d": "e"
      },
      {
        "t": "An array has 4 rows and 6 columns. How many in all?",
        "o": [
          "16",
          "20",
          "24",
          "28"
        ],
        "a": 2,
        "e": "You have 4 groups with 6 in each. That's 4 times 6, which equals 24! Super work! ✨",
        "d": "m"
      },
      {
        "t": "How many are in 2 groups of 6?",
        "o": [
          "10",
          "11",
          "12",
          "13"
        ],
        "a": 2,
        "e": "There are 2 groups with 6 in each. When you add 6 + 6, you get 12. That's correct! ✅",
        "d": "m"
      },
      {
        "t": "An array has 5 rows and 4 columns. How many in all?",
        "o": [
          "15",
          "18",
          "20",
          "25"
        ],
        "a": 2,
        "e": "You have 5 groups with 4 in each. That's 5 times 4, which equals 20! Super work! ✨",
        "d": "m"
      },
      {
        "t": "How many are in 3 groups of 5?",
        "o": [
          "12",
          "13",
          "14",
          "15"
        ],
        "a": 3,
        "e": "There are 3 groups with 5 in each. When you add 5 three times, you get 15. That's correct! 🎉",
        "d": "e"
      },
      {
        "t": "An array has 2 rows and 7 columns. How many in all?",
        "o": [
          "12",
          "13",
          "14",
          "15"
        ],
        "a": 2,
        "e": "You have 2 groups with 7 in each. That's 2 times 7, which equals 14! Super work! ✨",
        "d": "m"
      },
      {
        "t": "How many are in 4 groups of 4?",
        "o": [
          "12",
          "14",
          "16",
          "18"
        ],
        "a": 2,
        "e": "There are 4 groups with 4 in each. When you add 4 four times, you get 16. That's correct! ✅",
        "d": "e"
      },
      {
        "t": "Is 3+4+3 equal groups?",
        "o": [
          "Yes",
          "No",
          "Sometimes",
          "Depends"
        ],
        "a": 1,
        "e": "You're right! For groups to be equal, they must all have the same number. 3, 4, and 3 are not all the same. 🚫",
        "d": "e"
      },
      {
        "t": "An array has 6 rows and 2 columns. How many in all?",
        "o": [
          "8",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "You have 6 groups with 2 in each. That's 6 times 2, which equals 12! Super work! ✨",
        "d": "m"
      },
      {
        "t": "How many are in 2 groups of 9?",
        "o": [
          "16",
          "17",
          "18",
          "19"
        ],
        "a": 2,
        "e": "There are 2 groups with 9 in each. When you add 9 + 9, you get 18. That's correct! ✅",
        "d": "m"
      },
      {
        "t": "An array has 3 rows and 3 columns. How many in all?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 3,
        "e": "You have 3 groups with 3 in each. That's 3 times 3, which equals 9! Super work! ✨",
        "d": "m"
      },
      {
        "t": "How many are in 5 groups of 5?",
        "o": [
          "20",
          "22",
          "24",
          "25"
        ],
        "a": 3,
        "e": "You have 5 groups with 5 in each. That's 5 times 5, which equals 25! Super work! ✨",
        "d": "e"
      },
      {
        "t": "What is an ARRAY?",
        "o": [
          "Type of subtraction",
          "Equal rows and columns",
          "Way to measure",
          "Type of fraction"
        ],
        "a": 1,
        "e": "That's right! An array has equal groups of items lined up in rows and columns. Super definition! 👍",
        "d": "e"
      },
      {
        "t": "How many are in 3 groups of 7?",
        "o": [
          "18",
          "19",
          "20",
          "21"
        ],
        "a": 3,
        "e": "There are 3 groups with 7 in each. When you add 7 three times, you get 21. That's correct! 🎉",
        "d": "m"
      },
      {
        "t": "An array has 4 rows and 5 columns. How many in all?",
        "o": [
          "16",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "You have 4 groups of 5. Count 5, 10, 15, 20! So, 4 × 5 = 20. Great job! ✨",
        "d": "m"
      },
      {
        "t": "How many are in 6 groups of 3?",
        "o": [
          "15",
          "16",
          "17",
          "18"
        ],
        "a": 3,
        "e": "You added 3, six times! That's 6 groups of 3, which makes 18. Super counting! 👍",
        "d": "m"
      },
      {
        "t": "An array has 4 rows. There are 12 items total. How many columns does it have?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "You have 4 rows across and 3 columns down. Count them all! 4 × 3 = 12 items. Awesome! ✅",
        "d": "h"
      },
      {
        "t": "Is 5+5+5+5 equal groups?",
        "o": [
          "Yes",
          "No",
          "Sometimes"
        ],
        "a": 0,
        "e": "For multiplication, each group must have the same number of items. All groups of 5 are equal! Yes! 🌟",
        "d": "e"
      },
      {
        "t": "An array has 10 rows and 2 columns. How many in all?",
        "o": [
          "16",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "You have 10 groups of 2. Count by 2s ten times: 2, 4, ... 20! So, 10 × 2 = 20. You got it! 🎉",
        "d": "h"
      },
      {
        "t": "How many are in 2 groups of 4?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 2,
        "e": "You added 4 two times. That's 2 groups of 4, which makes 8. Keep up the great work! 😄",
        "d": "e"
      },
      {
        "t": "An array has 3 rows and 6 columns. How many in all?",
        "o": [
          "15",
          "16",
          "17",
          "18"
        ],
        "a": 3,
        "e": "You have 3 groups of 6. Count 6, 12, 18! So, 3 × 6 = 18. Fantastic! ✨",
        "d": "h"
      },
      {
        "t": "How many are in 4 groups of 6?",
        "o": [
          "20",
          "22",
          "24",
          "26"
        ],
        "a": 2,
        "e": "You have 4 groups of 6. Count 6, 12, 18, 24! So, 4 × 6 = 24. Way to go! 🥳",
        "d": "m"
      },
      {
        "t": "How many items in 3 rows of 4?",
        "o": [
          "4",
          "8",
          "12",
          "16"
        ],
        "a": 2,
        "e": "You have 3 groups of 4. Count 4, 8, 12! So, 3 × 4 = 12. Super smart! 🧠",
        "d": "e"
      },
      {
        "t": "Array rows go which direction?",
        "o": [
          "Up and down",
          "Left to right",
          "Diagonal",
          "All directions"
        ],
        "a": 1,
        "e": "Rows are like lines that go across, from left to right. You're learning about arrays! 📏",
        "d": "e"
      },
      {
        "t": "How many are in 5 groups of 4?",
        "o": [
          "16",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "You added 4, five times! That's 5 groups of 4, which makes 20. Excellent! ⭐",
        "d": "e"
      },
      {
        "t": "An array has 2 rows and 10 columns. How many in all?",
        "o": [
          "15",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "You have 2 groups of 10. Count 10, 20! So, 2 × 10 = 20. You're a math whiz! 💡",
        "d": "h"
      },
      {
        "t": "How many are in 3 groups of 8?",
        "o": [
          "20",
          "22",
          "24",
          "26"
        ],
        "a": 2,
        "e": "You added 8, three times! That's 3 groups of 8, which makes 24. Amazing! 👏",
        "d": "m"
      },
      {
        "t": "3 bags with 5 apples each. Write as addition: 5+5+5 = ?",
        "o": [
          "10",
          "12",
          "15",
          "20"
        ],
        "a": 2,
        "e": "You have 3 groups, and each group has 5. That's 5 + 5 + 5 = 15. Great thinking! 🧠",
        "d": "m"
      },
      {
        "t": "Skip count by 10 four times starting at 0. What number do you reach?",
        "o": [
          "14",
          "40",
          "100",
          "410"
        ],
        "a": 1,
        "e": "You counted by tens four times: 10, 20, 30, 40! So, four tens make 40. Super smart! ✨",
        "d": "m"
      },
      {
        "t": "4 groups of 2 pencils. How many pencils in all? 2+2+2+2 = ?",
        "o": [
          "6",
          "7",
          "8",
          "10"
        ],
        "a": 2,
        "e": "You have 4 groups, and each group has 2 pencils. That's 2 + 2 + 2 + 2 = 8 pencils. Good job! ✏️",
        "d": "m"
      },
      {
        "t": "There are 3 bags with 2 apples each. How many apples in all?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 1,
        "e": "Each of the 3 bags has 2 apples. So, 2 + 2 + 2 = 6 apples in all. You counted them perfectly! 🍎",
        "d": "e"
      },
      {
        "t": "There are 4 cups with 5 straws each. How many straws in all?",
        "o": [
          "15",
          "20",
          "9",
          "25"
        ],
        "a": 1,
        "e": "Each of the 4 cups has 5 straws. So, 5 + 5 + 5 + 5 = 20 straws in all. Fantastic counting! 🥤",
        "d": "e"
      },
      {
        "t": "There are 2 plates with 3 cookies each. How many cookies in all?",
        "o": [
          "5",
          "6",
          "8",
          "3"
        ],
        "a": 1,
        "e": "Each of the 2 plates has 3 cookies. So, 3 + 3 = 6 cookies in all. Yum! You got it! 🍪",
        "d": "e"
      },
      {
        "t": "There are 5 trees with 2 birds each. How many birds in all?",
        "o": [
          "7",
          "8",
          "10",
          "12"
        ],
        "a": 2,
        "e": "Each of the 5 trees has 2 birds. So, 2 + 2 + 2 + 2 + 2 = 10 birds in all. Great job! 🐦",
        "d": "e"
      },
      {
        "t": "There are 3 boxes with 4 crayons each. How many crayons in all?",
        "o": [
          "7",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "You have 3 boxes with 4 crayons in each! That's 4 + 4 + 4 = 12 crayons. Great job! 🖍️",
        "d": "e"
      },
      {
        "t": "There are 2 tanks with 5 fish each. How many fish in all?",
        "o": [
          "7",
          "8",
          "10",
          "12"
        ],
        "a": 2,
        "e": "Two tanks with 5 fish each! Count them: 5 + 5 = 10 fish. You got it! 🐠",
        "d": "e"
      },
      {
        "t": "4 + 4 + 4 = ?",
        "o": [
          "8",
          "12",
          "16",
          "10"
        ],
        "a": 1,
        "e": "Start with 4 + 4 = 8. Then add 4 more! 8 + 4 = 12. Super adding! ✨",
        "d": "e"
      },
      {
        "t": "3 + 3 + 3 + 3 = ?",
        "o": [
          "9",
          "12",
          "15",
          "6"
        ],
        "a": 1,
        "e": "Counting by 3s helps! 3, 6, 9, 12. The answer is 12. You're a counting star! ⭐",
        "d": "e"
      },
      {
        "t": "There are 6 nests with 2 eggs each. How many eggs in all?",
        "o": [
          "8",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "Six nests, 2 eggs in each! Add them up: 2 + 2 + 2 + 2 + 2 + 2 = 12 eggs. Good job! 🥚",
        "d": "m"
      },
      {
        "t": "There are 2 hands. Each hand has 5 fingers. How many fingers in all?",
        "o": [
          "7",
          "10",
          "12",
          "5"
        ],
        "a": 1,
        "e": "You have 2 hands, and each has 5 fingers! That's 5 + 5 = 10 fingers. Amazing! 🖐️",
        "d": "m"
      },
      {
        "t": "5 + 5 + 5 = ?",
        "o": [
          "10",
          "15",
          "20",
          "12"
        ],
        "a": 1,
        "e": "Let's count by 5s! 5, 10, 15. The answer is 15. You're so good at this! 💯",
        "d": "e"
      },
      {
        "t": "There are 3 ponds with 3 ducks each. How many ducks in all?",
        "o": [
          "6",
          "9",
          "12",
          "3"
        ],
        "a": 1,
        "e": "Three ponds, 3 ducks in each! Add them: 3 + 3 + 3 = 9 ducks. You're super smart! 🦆",
        "d": "e"
      },
      {
        "t": "There are 4 vases with 2 flowers each. How many flowers in all?",
        "o": [
          "6",
          "8",
          "10",
          "4"
        ],
        "a": 1,
        "e": "Four vases with 2 flowers each! Add them: 2 + 2 + 2 + 2 = 8 flowers. Well done! 🌷",
        "d": "e"
      },
      {
        "t": "2 + 2 + 2 + 2 + 2 = ?",
        "o": [
          "8",
          "10",
          "12",
          "6"
        ],
        "a": 1,
        "e": "Count by 2s! 2, 4, 6, 8, 10. The answer is 10. You're a counting pro! ✌️",
        "d": "e"
      },
      {
        "t": "There are 3 tables with 5 books each. How many books in all?",
        "o": [
          "8",
          "12",
          "15",
          "18"
        ],
        "a": 2,
        "e": "Three tables, 5 books on each! Add them up: 5 + 5 + 5 = 15 books. Fantastic! 📚",
        "d": "e"
      },
      {
        "t": "There are 4 jars with 3 marbles each. How many marbles in all?",
        "o": [
          "7",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "Four jars with 3 marbles each! Add them: 3 + 3 + 3 + 3 = 12 marbles. You're a math whiz! 🤩",
        "d": "m"
      },
      {
        "t": "How many equal groups are there? OO OO OO (O = apple)",
        "o": [
          "2",
          "3",
          "4",
          "6"
        ],
        "a": 1,
        "e": "You have 3 groups, and each group has 2 apples. So, 2 + 2 + 2 = 6 apples! Good thinking! 🍎",
        "d": "e"
      },
      {
        "t": "There are 2 shelves with 4 toys each. How many toys in all?",
        "o": [
          "6",
          "8",
          "10",
          "4"
        ],
        "a": 1,
        "e": "Two shelves, 4 toys on each! Add them: 4 + 4 = 8 toys. You found them all! 🧸",
        "d": "e"
      },
      {
        "t": "10 + 10 = ?",
        "o": [
          "10",
          "15",
          "20",
          "25"
        ],
        "a": 2,
        "e": "10 + 10 = 20. This shows 2 groups of 10! You're great with tens! 👍",
        "d": "m"
      },
      {
        "t": "There are 5 baskets with 4 oranges each. How many oranges in all?",
        "o": [
          "16",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "Five baskets, 4 oranges in each! Add them up: 4 + 4 + 4 + 4 + 4 = 20 oranges. Yum! 🍊",
        "d": "m"
      },
      {
        "t": "5 + 5 + 5 is the same as __ groups of 5. What number goes in the blank?",
        "o": [
          "2",
          "3",
          "5",
          "15"
        ],
        "a": 1,
        "e": "When you add three 5s (5 + 5 + 5), it means you have 3 groups of 5! The answer is 15. Smart! 💡",
        "d": "m"
      },
      {
        "t": "Which shows 3 groups of 4?",
        "o": [
          "3 + 4",
          "4 + 4 + 4",
          "3 + 3 + 3 + 3",
          "4 + 3"
        ],
        "a": 1,
        "e": "3 groups of 4 means you add 4 three times: 4 + 4 + 4 = 12. You're a math master! 💪",
        "d": "e"
      },
      {
        "t": "There are 4 bags with the same number of toys. There are 20 toys in all. How many toys in each bag?",
        "o": [
          "4",
          "5",
          "6",
          "8"
        ],
        "a": 1,
        "e": "To make 20 with 4 equal numbers, you share 20 into 4 groups. Each group gets 5! 5 + 5 + 5 + 5 = 20. 🎉",
        "d": "h"
      },
      {
        "t": "Is 2 + 2 + 2 + 2 + 2 the same as 5 + 5?",
        "o": [
          "Yes, both equal 10",
          "No, the first is bigger",
          "No, the second is bigger",
          "Yes, both equal 8"
        ],
        "a": 0,
        "e": "Both 2 + 2 + 2 + 2 + 2 and 5 + 5 equal 10! They are the same. Great comparing! 🌟",
        "d": "m"
      },
      {
        "t": "Which picture shows 2 groups of 6? A) 3 groups of 4 stars  B) 2 groups of 6 stars",
        "o": [
          "A",
          "B",
          "Both",
          "Neither"
        ],
        "a": 1,
        "e": "Two groups of 6 means 6 items in each group. Picture B shows this perfectly! ✅",
        "d": "h"
      },
      {
        "t": "Riley puts stickers in 3 equal rows. Each row has 5 stickers. Which addition sentence matches?",
        "o": [
          "3 + 5",
          "5 + 5 + 5",
          "3 + 3 + 3 + 3 + 3",
          "5 + 3 + 5"
        ],
        "a": 1,
        "e": "3 rows of 5 means you have 3 groups with 5 in each. Add 5 three times: 5 + 5 + 5 = 15. Great job! ✨",
        "d": "h"
      },
      {
        "t": "__ + __ + __ = 15 (all the same number). What is each number?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "To share 15 into 3 equal groups, each group gets 5! 5 + 5 + 5 = 15. So, each number is 5. 👍",
        "d": "h"
      },
      {
        "t": "Which is another way to show 4 groups of 2?",
        "o": [
          "4 + 2",
          "2 + 2 + 2 + 2",
          "4 + 4",
          "2 + 4 + 2"
        ],
        "a": 1,
        "e": "4 groups of 2 means you have 4 sets of 2. Add 2 four times: 2 + 2 + 2 + 2 = 8. You got it! 🌟",
        "d": "e"
      },
      {
        "t": "Mia has some bags of marbles. Each bag has 3 marbles. She has 12 marbles in all. How many bags does she have?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "3 + 3 + 3 + 3 = 12. This shows 4 groups of 3! So, she has 4 bags. Fantastic work! 🎒",
        "d": "h"
      },
      {
        "t": "3 + 3 + 3 + 3 + 3 = ? How many groups of 3 is that?",
        "o": [
          "3 groups, total 9",
          "4 groups, total 12",
          "5 groups, total 15",
          "6 groups, total 18"
        ],
        "a": 2,
        "e": "The number 3 appears 5 times. This means you have 5 groups of 3, which equals 15. Super! ✨",
        "d": "m"
      },
      {
        "t": "Which two addition sentences give the same total? A) 3+3+3+3  B) 6+6  C) 4+4+4",
        "o": [
          "A and B",
          "A and C",
          "B and C",
          "All three"
        ],
        "a": 3,
        "e": "A, B, and C all show 12! They are all equal. Great job finding them! 🎉",
        "d": "h"
      },
      {
        "t": "There are 5 plates. Each plate has the same number of grapes. There are 10 grapes total. How many grapes on each plate?",
        "o": [
          "2",
          "3",
          "5",
          "10"
        ],
        "a": 0,
        "e": "2 + 2 + 2 + 2 + 2 = 10. This shows 5 groups of 2! So, each plate has 2 grapes. Well done! 🍇",
        "d": "h"
      },
      {
        "t": "Emma says 4 + 4 + 4 is the same as 3 groups of 4. Is she correct?",
        "o": [
          "Yes, it equals 12",
          "No, it equals 8",
          "No, it should be 4 groups of 3",
          "Yes, it equals 16"
        ],
        "a": 0,
        "e": "4 + 4 + 4 means 3 groups of 4. That equals 12! Emma is correct. You are a math star! ⭐",
        "d": "m"
      },
      {
        "t": "A box holds 4 pencils. How many pencils are in 5 boxes?",
        "o": [
          "9",
          "16",
          "20",
          "24"
        ],
        "a": 2,
        "e": "5 boxes with 4 pencils each means 5 groups of 4. Add 4 five times: 4 + 4 + 4 + 4 + 4 = 20 pencils. Awesome! ✏️",
        "d": "e"
      },
      {
        "t": "Which number sentence does NOT show equal groups?",
        "o": [
          "2 + 2 + 2 + 2",
          "5 + 5 + 5",
          "3 + 4 + 3",
          "10 + 10"
        ],
        "a": 2,
        "e": "For equal groups, all numbers must be the same. 3 + 4 + 3 has different numbers, so the groups are not equal. 🚫",
        "d": "e"
      },
      {
        "t": "__ + __ + __ + __ = 8 (all the same number). What is each number?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 1,
        "e": "To share 8 into 4 equal groups, each group gets 2! 2 + 2 + 2 + 2 = 8. So, each number is 2. Way to go! 🥳",
        "d": "h"
      },
      {
        "t": "Jake sees 3 fish tanks. Each tank has 4 fish. He writes 3 + 4 = 7 fish. What should he have written?",
        "o": [
          "3 + 3 + 3 + 3 = 12",
          "4 + 4 + 4 = 12",
          "3 + 4 = 7",
          "4 + 3 + 4 = 11"
        ],
        "a": 1,
        "e": "3 tanks with 4 fish each means 3 groups of 4. That is 4 + 4 + 4 = 12 fish, not 3 + 4. You found it! 🐠",
        "d": "h"
      },
      {
        "t": "6 + 6 is the same as __ groups of 6.",
        "o": [
          "1",
          "2",
          "3",
          "6"
        ],
        "a": 1,
        "e": "The number 6 appears 2 times in 6 + 6. This means 2 groups of 6, which equals 12. Super smart! 💡",
        "d": "m"
      },
      {
        "t": "A farmer has some rows of corn. Each row has 10 stalks. There are 30 stalks in all. How many rows?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "10 + 10 + 10 = 30. This shows 3 groups of 10! So, there are 3 rows. You're a math whiz! 💯",
        "d": "h"
      },
      {
        "t": "Which group has the MOST items? A) 2 groups of 5  B) 3 groups of 3  C) 4 groups of 2  D) 1 group of 9",
        "o": [
          "2 groups of 5",
          "3 groups of 3",
          "4 groups of 2",
          "1 group of 9"
        ],
        "a": 0,
        "e": "A = 10, B = 9, C = 8, D = 9. 2 groups of 5 is 10. This is the most! You picked the biggest! 🎉",
        "d": "h"
      },
      {
        "t": "A garden has 4 rows of flowers with 5 in each row. The gardener picks 3 flowers. How many flowers are left?",
        "o": [
          "15",
          "17",
          "18",
          "20"
        ],
        "a": 1,
        "e": "First, find the total: 5 + 5 + 5 + 5 = 20 flowers. Then, take 3 away: 20 - 3 = 17 flowers left. Good thinking! 🌸",
        "d": "h"
      },
      {
        "t": "Sam says 3 groups of 7 is 24. Is Sam correct? What is the right answer?",
        "o": [
          "Yes, 24 is correct",
          "No, the answer is 18",
          "No, the answer is 21",
          "No, the answer is 27"
        ],
        "a": 2,
        "e": "3 groups of 7 means 7 + 7 + 7 = 21. Sam said 24, but 21 is the correct answer. You got it! ✅",
        "d": "h"
      },
      {
        "t": "There are 5 fish tanks. Some have 3 fish and some have 4 fish. There are 17 fish total. How many tanks have 3 fish?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 2,
        "e": "We need 17 fish. If 3 tanks have 3 fish (3+3+3=9), then 2 tanks have 4 fish (4+4=8). 9+8=17. That works! 👍",
        "d": "h"
      },
      {
        "t": "Tom arranges 12 chairs in equal rows. Which is NOT a way he could do it?",
        "o": [
          "2 rows of 6",
          "3 rows of 4",
          "4 rows of 3",
          "5 rows of 2"
        ],
        "a": 3,
        "e": "2 groups of 6, 3 groups of 4, or 4 groups of 3 all make 12. But 5 groups of 2 is 10, not 12. So it doesn't work. ❌",
        "d": "m"
      },
      {
        "t": "18 oranges are shared equally among some friends. Each friend gets 3. How many friends are there?",
        "o": [
          "3",
          "5",
          "6",
          "9"
        ],
        "a": 2,
        "e": "Count groups of 3 until you reach 18. Six groups of 3 make 18. So, there are 6 friends! 🎉",
        "d": "h"
      },
      {
        "t": "Lily says 2 + 2 + 2 + 2 is the same as 4 groups of 4. What mistake did Lily make?",
        "o": [
          "She mixed up the group size and number of groups",
          "She added wrong",
          "She forgot a group",
          "She is correct"
        ],
        "a": 0,
        "e": "Adding 2 four times means 4 groups of 2. She swapped the numbers! Keep practicing! 👍",
        "d": "h"
      },
      {
        "t": "A baker makes 3 trays of muffins with 6 on each tray. He sells 10 muffins. How many does he have left?",
        "o": [
          "6",
          "8",
          "10",
          "12"
        ],
        "a": 1,
        "e": "First, find the total muffins: 6+6+6=18. Then, subtract the 10 sold. 18-10=8 muffins left! 🧁",
        "d": "h"
      },
      {
        "t": "20 stickers are put in equal groups. Which way is NOT possible?",
        "o": [
          "4 groups of 5",
          "5 groups of 4",
          "2 groups of 10",
          "3 groups of 7"
        ],
        "a": 3,
        "e": "We need groups that multiply to 20. 3x7=21, not 20. So that one doesn't work! Keep trying! ✨",
        "d": "m"
      },
      {
        "t": "A toy store has 4 shelves. Each shelf has 5 toys. 7 toys are sold in the morning. How many toys are on the shelves now?",
        "o": [
          "10",
          "12",
          "13",
          "15"
        ],
        "a": 2,
        "e": "First, find the total toys: 5+5+5+5=20. Then, subtract the 7 sold. 20-7=13 toys left! 🧸",
        "d": "h"
      },
      {
        "t": "Ryan has 24 baseball cards. He wants to put them in equal piles. Name two different ways he could do it.",
        "o": [
          "3 piles of 8 or 4 piles of 6",
          "3 piles of 7 or 5 piles of 5",
          "5 piles of 4 or 7 piles of 3",
          "2 piles of 10 or 3 piles of 9"
        ],
        "a": 0,
        "e": "We need groups that multiply to 24. Both 3x8=24 and 4x6=24 work! Great job! ✅",
        "d": "h"
      },
      {
        "t": "Maria says 5 groups of 3 equals 3 groups of 5. Is she right?",
        "o": [
          "Yes, both equal 15",
          "No, 5 groups of 3 is bigger",
          "No, 3 groups of 5 is bigger",
          "Yes, both equal 12"
        ],
        "a": 0,
        "e": "5 groups of 3 (15) is the same as 3 groups of 5 (15)! The order can change! Amazing! ⭐",
        "d": "m"
      },
      {
        "t": "Carlos has 4 bags of apples. Some bags have 3 apples and some have 5 apples. He has 14 apples total. How many bags have 5 apples?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 0,
        "e": "We need 14 apples. If one bag has 5, then 3 bags of 3 make 5+3+3+3=14. You found it! 🍎",
        "d": "h"
      },
      {
        "t": "A teacher has 15 pencils to share equally among 5 students. Then she finds 5 more pencils and shares those equally too. How many does each student have now?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "First, share 15 pencils among 5 friends (3 each). Then share the extra 5 (1 more each). 3+1=4 pencils! ✏️",
        "d": "h"
      },
      {
        "t": "Jake writes: 2 + 2 + 2 = 3 groups of 3. Find TWO mistakes Jake made.",
        "o": [
          "The total and the group size are both wrong",
          "Only the total is wrong",
          "Only the group size is wrong",
          "Jake is correct"
        ],
        "a": 0,
        "e": "2+2+2 equals 6, not 9. It's 3 groups of 2, not 3 groups of 3. Both were wrong! Try again! 🤔",
        "d": "h"
      },
      {
        "t": "A school bus has 6 rows of seats. Each row fits 4 students. 5 seats are empty. How many students are on the bus?",
        "o": [
          "17",
          "19",
          "21",
          "24"
        ],
        "a": 1,
        "e": "First, find total seats: 4+4+4+4+4+4=24. Then, subtract the 5 empty seats. 24-5=19 students! 🚌",
        "d": "h"
      },
      {
        "t": "16 apples are shared equally. Each person gets 4 apples. How many people shared?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "We need groups of 4 to make 16. 4+4+4+4=16. That's 4 groups of 4, so 4 people shared! 🙌",
        "d": "m"
      },
      {
        "t": "Which problem has the BIGGEST answer? A) 3 groups of 5  B) 5 groups of 4  C) 2 groups of 10  D) 4 groups of 6",
        "o": [
          "3 groups of 5",
          "5 groups of 4",
          "2 groups of 10",
          "4 groups of 6"
        ],
        "a": 3,
        "e": "Calculate each option: A=15, B=20, C=20, D=24. 4 groups of 6 is 24, which is the biggest! 🏆",
        "d": "h"
      },
      {
        "t": "A farmer collects eggs from 3 coops. Coop 1 has 2 groups of 4 eggs. Coop 2 has 3 groups of 2 eggs. Coop 3 has 1 group of 5 eggs. How many eggs in all?",
        "o": [
          "17",
          "19",
          "21",
          "23"
        ],
        "a": 1,
        "e": "Find eggs in each coop: 8, 6, and 5. Then add them all up: 8+6+5=19 total eggs! Good job! 🥚",
        "d": "h"
      },
      {
        "t": "Ava has between 15 and 20 stickers. She can put them in equal groups of 4 with none left over. How many stickers does she have?",
        "o": [
          "15",
          "16",
          "18",
          "20"
        ],
        "a": 1,
        "e": "We need a number between 15 and 20 that can be made with equal groups of 4. 4+4+4+4=16! Ava has 16 stickers! ✨",
        "d": "h"
      },
      {
        "t": "A store display has 3 rows of 4 toys on top and 2 rows of 5 toys on the bottom. How many toys are on the display?",
        "o": [
          "18",
          "20",
          "22",
          "24"
        ],
        "a": 2,
        "e": "Top shelf: 4+4+4=12 toys. Bottom shelf: 5+5=10 toys. Total: 12+10=22 toys! You got it! 🎁",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "How many are in 3 groups of 4?",
        "o": [
          "10",
          "11",
          "12",
          "13"
        ],
        "a": 2,
        "e": "You can add 4 three times (4+4+4=12) or multiply 3x4=12. Both ways work to find the total! 🌟"
      },
      {
        "t": "An array has 3 rows and 4 columns. How many in all?",
        "o": [
          "7",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "Multiply the number of groups (3) by the number in each group (4) to find the total. 3x4=12 items! 👍"
      },
      {
        "t": "Which shows equal groups?",
        "o": [
          "3+3+3+3",
          "2+4+3",
          "1+2+3",
          "5+3+1"
        ],
        "a": 0,
        "e": "Equal groups mean every group has the same number. 3+3+3+3 has all groups of 3! The others are unequal. ✅"
      },
      {
        "t": "5 groups of 2 stars = how many total?",
        "o": [
          "8",
          "9",
          "10",
          "11"
        ],
        "a": 2,
        "e": "Adding 2 five times (2+2+2+2+2) gives you a total of 10! You did it! 🎉"
      },
      {
        "t": "An array has 4 rows and 2 columns. How many in all?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 2,
        "e": "You have 4 groups with 2 items in each. Count them all! 4 x 2 = 8 items. ✅"
      },
      {
        "t": "What is an array?",
        "o": [
          "Type of subtraction",
          "Items in equal rows & columns",
          "Way to measure",
          "Type of fraction"
        ],
        "a": 1,
        "e": "An array shows equal groups in neat rows and columns. It helps us count them faster! 🖼️"
      }
    ]
  },
  {
    "points": [
      "Adding the same number over and over = REPEATED ADDITION",
      "This is the beginning of MULTIPLICATION",
      "5+5+5 = \"3 groups of 5\" = 3 × 5",
      "It equals the same thing!"
    ],
    "examples": [
      {
        "c": "#1a252f",
        "tag": "Two Ways to Write It",
        "p": "5 + 5 + 5 = 15",
        "s": "As repeated addition: 5 + 5 + 5 = 15\nAs multiplication: 3 × 5 = 15\nBoth mean 3 groups of 5!",
        "a": "They are the SAME! ✅",
        "vis": "groups:🍋:3:5"
      },
      {
        "c": "#1a252f",
        "tag": "Skip Counting Connection",
        "p": "Skip count by 4: 4, 8, 12, 16",
        "s": "That's 4+4+4+4 = 4 groups of 4\n= 4 × 4 = 16",
        "a": "Skip counting IS repeated addition! ✅",
        "vis": "groups:🍊:4:4"
      },
      {
        "c": "#1a252f",
        "tag": "Practice",
        "p": "Three ways to show 3 × 6:",
        "s": "Repeated addition: 6+6+6=18\nGroups: 3 groups of 6\nSkip counting by 6: 6,12,18",
        "a": "All give the same answer: 18 ✅",
        "vis": "groups:🍊:3:6"
      }
    ],
    "practice": [
      {
        "q": "3 + 3 + 3 + 3 = ? (4 groups of 3)",
        "a": "12",
        "h": "4 groups of 3 = 4 x 3 = 12!",
        "e": "You can multiply numbers in any order and still get the same answer! 3x4 is the same as 4x3. ✨"
      },
      {
        "q": "Write 5 + 5 + 5 as a multiplication",
        "a": "3 x 5",
        "h": "3 groups of 5 = 3 x 5!",
        "e": "The \"x\" sign means \"times\" or \"groups of.\" It tells us to multiply! 🔢"
      },
      {
        "q": "6 + 6 + 6 + 6 = ?",
        "a": "24",
        "h": "4 groups of 6 = 4 x 6 = 24!",
        "e": "You correctly identified the items we are counting! The answer is about lemons. Good thinking! 🍋"
      }
    ],
    "qBank": [
      {
        "t": "What is 4+4+4? (3 equal groups of 4)",
        "o": [
          "8",
          "10",
          "12",
          "16"
        ],
        "a": 2,
        "e": "You have 3 groups with 4 items in each. Count them all: 4 + 4 + 4 = 12. So, 3 x 4 = 12! 🎉",
        "d": "m"
      },
      {
        "t": "What is 2+2+2+2+2?",
        "o": [
          "5",
          "7",
          "10",
          "12"
        ],
        "a": 2,
        "e": "You have 5 groups with 2 items in each. Count them: 2 + 2 + 2 + 2 + 2 = 10. So, 5 x 2 = 10! 👍",
        "d": "e"
      },
      {
        "t": "Which matches 3×6?",
        "o": [
          "3+3+3",
          "6+6+6",
          "3+6",
          "6+3+1"
        ],
        "a": 1,
        "e": "3 x 6 means 3 groups of 6. We can add 6 three times: 6 + 6 + 6 = 18. You got it! ✨",
        "d": "e"
      },
      {
        "t": "Skip count by 3: 3, 6, 9, 12. How many groups of 3?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "Each jump is a group! 4 jumps of 3 means 4 groups of 3. That's 3 + 3 + 3 + 3 = 12. Great job! 🚀",
        "d": "m"
      },
      {
        "t": "What is 7+7+7?",
        "o": [
          "18",
          "19",
          "20",
          "21"
        ],
        "a": 3,
        "e": "You have 3 groups with 7 items in each. Count them: 7 + 7 + 7 = 21. So, 3 x 7 = 21! ⭐",
        "d": "m"
      },
      {
        "t": "Repeated addition and multiplication give?",
        "o": [
          "Different answers",
          "Same answer",
          "Estimate",
          "A fraction"
        ],
        "a": 1,
        "e": "When you multiply any number by 1, the answer is always that same number! It never changes. 👍",
        "d": "e"
      },
      {
        "t": "What is 5+5+5+5?",
        "o": [
          "15",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "You have 4 groups with 5 items in each. Count them: 5 + 5 + 5 + 5 = 20. So, 4 x 5 = 20! ✅",
        "d": "e"
      },
      {
        "t": "Which is 4×3?",
        "o": [
          "4+4+4",
          "3+3+3+3",
          "4+3",
          "4×4"
        ],
        "a": 1,
        "e": "\"4 groups of 3\" means you add 3 four times! 3 + 3 + 3 + 3 = 12. You're a math star! ⭐",
        "d": "e"
      },
      {
        "t": "Skip count by 6: 6, 12, 18. How many groups of 6?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "Each jump is a group! 3 jumps of 6 means 3 groups of 6. That's 6 + 6 + 6 = 18. Awesome! 🚀",
        "d": "m"
      },
      {
        "t": "What is 9+9?",
        "o": [
          "16",
          "17",
          "18",
          "19"
        ],
        "a": 2,
        "e": "You have 2 groups with 9 items in each. Count them: 9 + 9 = 18. So, 2 x 9 = 18! 👍",
        "d": "e"
      },
      {
        "t": "3×8 in repeated addition?",
        "o": [
          "8+8+8",
          "3+3+3+3+3+3+3+3",
          "3+8",
          "8×3"
        ],
        "a": 0,
        "e": "\"3 groups of 8\" means you have 3 sets, with 8 in each set. That's 8 + 8 + 8 = 24! You got it! ✨",
        "d": "e"
      },
      {
        "t": "Skip count by 2: 2, 4, 6, 8, 10. How many groups of 2?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "Each jump is a group! 5 jumps of 2 means 5 groups of 2. That's 2 + 2 + 2 + 2 + 2 = 10. Yes! 🚀",
        "d": "m"
      },
      {
        "t": "What is 6+6+6+6?",
        "o": [
          "20",
          "22",
          "24",
          "26"
        ],
        "a": 2,
        "e": "You have 4 groups with 6 items in each. Count them: 6 + 6 + 6 + 6 = 24. So, 4 x 6 = 24! 🎉",
        "d": "m"
      },
      {
        "t": "Skip count by 4: 4,8,12,16. That equals?",
        "o": [
          "3×4",
          "4×4",
          "5×4",
          "2×4"
        ],
        "a": 1,
        "e": "4 jumps of 4 means 4 groups of 4. We add 4 four times: 4 + 4 + 4 + 4 = 16. So, 4 x 4 = 16! 🌟",
        "d": "m"
      },
      {
        "t": "What is 3×3?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 3,
        "e": "You have 3 groups with 3 items in each. Count them: 3 + 3 + 3 = 9. So, 3 x 3 = 9! Great! 👍",
        "d": "e"
      },
      {
        "t": "Which shows 5 groups of 3?",
        "o": [
          "5+5+5",
          "3+3+3+3+3",
          "5×5",
          "3×5"
        ],
        "a": 1,
        "e": "5 groups of 3 means adding 3 five times! 3+3+3+3+3 = 15. You got it! ✨",
        "d": "e"
      },
      {
        "t": "What is 10+10+10?",
        "o": [
          "20",
          "25",
          "30",
          "35"
        ],
        "a": 2,
        "e": "3 groups of 10 means counting by 10s three times! 10, 20, 30. So, 3 × 10 = 30! Super! 🥳",
        "d": "m"
      },
      {
        "t": "Skip count by 2: 2,4,6,8. Equals?",
        "o": [
          "2×4",
          "3×2",
          "4×2",
          "5×2"
        ],
        "a": 2,
        "e": "4 groups of 2 means adding 2 four times! 2+2+2+2 = 8. So, 4 × 2 = 8. You got it! 👍",
        "d": "m"
      },
      {
        "t": "What is 8+8?",
        "o": [
          "14",
          "15",
          "16",
          "17"
        ],
        "a": 2,
        "e": "2 groups of 8 means adding 8 two times! 8+8 = 16. So, 2 × 8 = 16. Great job! ✨",
        "d": "e"
      },
      {
        "t": "3×5 in words?",
        "o": [
          "3 more than 5",
          "3 groups of 5",
          "5 groups of 3",
          "Either B or C"
        ],
        "a": 3,
        "e": "You can multiply numbers in any order and get the same answer! 3×5=15 and 5×3=15. Both work! Smart! 🧠",
        "d": "e"
      },
      {
        "t": "What is 4+4+4+4+4?",
        "o": [
          "16",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "5 groups of 4 means adding 4 five times! 4+4+4+4+4 = 20. So, 5 × 4 = 20. You got it! ✨",
        "d": "e"
      },
      {
        "t": "5×6 in repeated addition?",
        "o": [
          "5+5+5+5+5+5",
          "6+6+6+6+6",
          "5+6",
          "Both A and B"
        ],
        "a": 3,
        "e": "6 groups of 5 (5+5+5+5+5+5) is 30. And 5 groups of 6 (6+6+6+6+6) is also 30! Both are correct! ✅",
        "d": "e"
      },
      {
        "t": "Count by 3: 3,6,9,___,15",
        "o": [
          "10",
          "11",
          "12",
          "13"
        ],
        "a": 2,
        "e": "Start at 9 and count on 3 more: 10, 11, 12! So, 9 + 3 = 12. Great adding! 👍",
        "d": "m"
      },
      {
        "t": "What is 2×9?",
        "o": [
          "14",
          "16",
          "18",
          "20"
        ],
        "a": 2,
        "e": "This is a doubles fact! Adding 9 and 9 gives you 18. So, 9 + 9 = 18. You know your doubles! 🤩",
        "d": "e"
      },
      {
        "t": "What is 7+7+7+7?",
        "o": [
          "24",
          "26",
          "28",
          "30"
        ],
        "a": 2,
        "e": "4 groups of 7 means adding 7 four times! 7+7+7+7 = 28. So, 4 × 7 = 28. You're amazing! ⭐",
        "d": "m"
      },
      {
        "t": "Which means the same as 3+3+3+3+3?",
        "o": [
          "5×3",
          "3×5",
          "Both",
          "Neither"
        ],
        "a": 2,
        "e": "5 groups of 3 is 15. And 3 groups of 5 is also 15! You can multiply in any order. Both are 15! 👍",
        "d": "m"
      },
      {
        "t": "Count by 5: 5,10,15,20. Equals?",
        "o": [
          "3×5",
          "4×5",
          "5×5",
          "6×5"
        ],
        "a": 1,
        "e": "4 jumps of 5 means skip counting by 5s four times! 5, 10, 15, 20. So, 4 × 5 = 20. You got it! 🚀",
        "d": "h"
      },
      {
        "t": "What is 9+9+9?",
        "o": [
          "25",
          "26",
          "27",
          "28"
        ],
        "a": 2,
        "e": "3 groups of 9 means adding 9 three times! 9+9+9 = 27. So, 3 × 9 = 27. Fantastic work! ✨",
        "d": "m"
      },
      {
        "t": "Repeated addition ALWAYS gives same as multiplication?",
        "o": [
          "True",
          "False",
          "Sometimes",
          "Only for small numbers"
        ],
        "a": 0,
        "e": "Yes, always! 3 groups of 3 means adding 3 three times! 3+3+3 = 9. So, 3 × 3 = 9. Smart thinking! 🤔",
        "d": "e"
      },
      {
        "t": "6×4 in repeated addition?",
        "o": [
          "6+6+6+6",
          "4+4+4+4+4+4",
          "Either works",
          "Neither"
        ],
        "a": 2,
        "e": "4 groups of 6 (6+6+6+6) is 24. And 6 groups of 4 (4+4+4+4+4+4) is also 24! Both are correct! 👍",
        "d": "e"
      },
      {
        "t": "3 + 3 + 3 + 3 = ?",
        "o": [
          "9",
          "10",
          "12",
          "15"
        ],
        "a": 2,
        "e": "To find 4 groups of 3, count by 3s four times: 3, 6, 9, 12. The answer is 12! You're a skip-counting pro! 🚀",
        "d": "e"
      },
      {
        "t": "5 + 5 + 5 = ?",
        "o": [
          "10",
          "15",
          "20",
          "25"
        ],
        "a": 1,
        "e": "To find 3 groups of 5, count by 5s three times: 5, 10, 15. The answer is 15! Great counting! 🔢",
        "d": "e"
      },
      {
        "t": "2 + 2 + 2 + 2 + 2 + 2 = ?",
        "o": [
          "10",
          "12",
          "14",
          "8"
        ],
        "a": 1,
        "e": "To find 6 groups of 2, count by 2s six times: 2, 4, 6, 8, 10, 12. The answer is 12! You're a star! ⭐",
        "d": "e"
      },
      {
        "t": "4 + 4 + 4 = ?",
        "o": [
          "8",
          "10",
          "12",
          "16"
        ],
        "a": 2,
        "e": "This shows 3 groups of 4! First 4+4=8, then add another 4 to get 12. So, 3 × 4 = 12. Excellent! 👏",
        "d": "e"
      },
      {
        "t": "10 + 10 + 10 = ?",
        "o": [
          "20",
          "30",
          "40",
          "10"
        ],
        "a": 1,
        "e": "To find 3 groups of 10, count by 10s three times: 10, 20, 30. The answer is 30! Great counting! 🔢",
        "d": "m"
      },
      {
        "t": "A frog hops 2 feet each time. After 4 hops, how far did the frog go?",
        "o": [
          "4",
          "6",
          "8",
          "10"
        ],
        "a": 2,
        "e": "Each side is 2 feet. Add 2 four times: 2+2+2+2 = 8 feet. Great job! 📏",
        "d": "e"
      },
      {
        "t": "You take 3 steps. Each step is 5 feet. How far did you walk?",
        "o": [
          "8",
          "10",
          "15",
          "20"
        ],
        "a": 2,
        "e": "Each step is 5 feet. Add 5 three times: 5+5+5 = 15 feet. You got it! 🪜",
        "d": "e"
      },
      {
        "t": "6 + 6 = ?",
        "o": [
          "10",
          "11",
          "12",
          "14"
        ],
        "a": 2,
        "e": "You have 2 groups of 6. Add 6 two times: 6 + 6 = 12. Super work! 👍",
        "d": "e"
      },
      {
        "t": "2 + 2 + 2 = ?",
        "o": [
          "4",
          "6",
          "8",
          "10"
        ],
        "a": 1,
        "e": "Counting by 2s helps! 2 + 2 + 2 = 6. The answer is 6. You're a star! ✨",
        "d": "e"
      },
      {
        "t": "A kangaroo jumps 10 feet each time. After 2 jumps, how far?",
        "o": [
          "10",
          "12",
          "15",
          "20"
        ],
        "a": 3,
        "e": "Each jump is 10 feet. Add 10 two times: 10 + 10 = 20 feet. Way to go! 🐸",
        "d": "m"
      },
      {
        "t": "5 + 5 = ?",
        "o": [
          "5",
          "10",
          "15",
          "20"
        ],
        "a": 1,
        "e": "You have 2 groups of 5. Add 5 two times: 5 + 5 = 10. Fantastic! ⭐",
        "d": "e"
      },
      {
        "t": "3 + 3 + 3 = ?",
        "o": [
          "6",
          "9",
          "12",
          "3"
        ],
        "a": 1,
        "e": "Counting by 3s helps! 3 + 3 + 3 = 9. The answer is 9. Awesome work! 🥳",
        "d": "e"
      },
      {
        "t": "A snail moves 4 inches each minute. After 2 minutes, how far has it gone?",
        "o": [
          "4",
          "6",
          "8",
          "10"
        ],
        "a": 2,
        "e": "Each side is 4 inches. Add 4 two times: 4 + 4 = 8 inches. You're so smart! 📐",
        "d": "m"
      },
      {
        "t": "4 + 4 = ?",
        "o": [
          "4",
          "6",
          "8",
          "12"
        ],
        "a": 2,
        "e": "You have 2 groups of 4. Add 4 two times: 4 + 4 = 8. Keep up the great work! 💪",
        "d": "e"
      },
      {
        "t": "2 + 2 + 2 + 2 = ?",
        "o": [
          "6",
          "8",
          "10",
          "4"
        ],
        "a": 1,
        "e": "Counting by 2s helps! 2 + 2 + 2 + 2 = 8. The answer is 8. Amazing! 🌟",
        "d": "e"
      },
      {
        "t": "You clap 3 times every round. After 5 rounds, how many claps?",
        "o": [
          "8",
          "12",
          "15",
          "18"
        ],
        "a": 2,
        "e": "You clapped 3 five times. Add 3 five times: 3+3+3+3+3 = 15 claps. Excellent! 👏",
        "d": "h"
      },
      {
        "t": "5 + 5 + 5 + 5 = ?",
        "o": [
          "15",
          "20",
          "25",
          "10"
        ],
        "a": 1,
        "e": "Counting by 5s helps! 5 + 5 + 5 + 5 = 20. The answer is 20. You did it! 🎉",
        "d": "e"
      },
      {
        "t": "A rabbit hops 3 feet each time. After 3 hops, how far?",
        "o": [
          "6",
          "9",
          "12",
          "3"
        ],
        "a": 1,
        "e": "Each jump is 3 feet. Add 3 three times: 3 + 3 + 3 = 9 feet. Super smart! 🏃",
        "d": "e"
      },
      {
        "t": "10 + 10 = ?",
        "o": [
          "10",
          "15",
          "20",
          "25"
        ],
        "a": 2,
        "e": "You have 2 groups of 10. Add 10 two times: 10 + 10 = 20. Wonderful! 👍",
        "d": "m"
      },
      {
        "t": "You get 2 stickers every day for 5 days. How many stickers do you have?",
        "o": [
          "7",
          "8",
          "10",
          "12"
        ],
        "a": 2,
        "e": "You have 5 groups of 2 stickers. Add 2 five times: 2+2+2+2+2 = 10. Great! 🤩",
        "d": "m"
      },
      {
        "t": "5 + 5 + 5 = 3 groups of __. What goes in the blank?",
        "o": [
          "3",
          "5",
          "10",
          "15"
        ],
        "a": 1,
        "e": "5 + 5 + 5 means you add 5 three times. This is 3 groups of 5. You got it! ✅",
        "d": "m"
      },
      {
        "t": "A frog jumps 4 feet each time. After some jumps it has gone 16 feet. How many jumps did it take?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "The frog jumped 4 feet, 4 times! 4 + 4 + 4 + 4 = 16 feet. Good job! 🐸",
        "d": "h"
      },
      {
        "t": "Which repeated addition sentence equals 18?",
        "o": [
          "2 + 2 + 2 + 2 + 2",
          "3 + 3 + 3 + 3 + 3 + 3",
          "6 + 6 + 6 + 6",
          "4 + 4 + 4 + 4"
        ],
        "a": 1,
        "e": "You add 3 six times: 3+3+3+3+3+3 = 18. This is the correct total. Well done! ✨",
        "d": "m"
      },
      {
        "t": "__ + __ + __ + __ + __ = 25 (all the same number). What is each number?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "To make 25 with 5 equal numbers, each number must be 5. 5+5+5+5+5 = 25. Perfect! 💯",
        "d": "h"
      },
      {
        "t": "Ben counts by 3s: 3, 6, 9, 12. How many 3s did he add?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "Counting by 3s four times is like adding 3 four times: 3+3+3+3 = 12. You're amazing! 👏",
        "d": "h"
      },
      {
        "t": "Is 4 + 4 + 4 the same as 3 + 3 + 3 + 3?",
        "o": [
          "Yes, both equal 12",
          "No, the first is bigger",
          "No, the second is bigger",
          "Yes, both equal 9"
        ],
        "a": 0,
        "e": "3 groups of 4 makes 12. 4 groups of 3 also makes 12. They are both 12! ✨",
        "d": "m"
      },
      {
        "t": "A caterpillar moves 2 inches each minute. Which shows how far it goes in 7 minutes?",
        "o": [
          "2 + 7",
          "7 + 7",
          "2 + 2 + 2 + 2 + 2 + 2 + 2",
          "7 + 2 + 7"
        ],
        "a": 2,
        "e": "Each minute, add 2 inches. Do this 7 times: 2+2+2+2+2+2+2 = 14. Great job! 📏",
        "d": "m"
      },
      {
        "t": "Which number sentence does NOT equal 20?",
        "o": [
          "5 + 5 + 5 + 5",
          "4 + 4 + 4 + 4 + 4",
          "10 + 10",
          "2 + 2 + 2 + 2 + 2 + 2 + 2 + 2"
        ],
        "a": 3,
        "e": "5 groups of 4, 4 groups of 5, or 10 groups of 2 all make 20! But 8 groups of 2 is 16. 🤔",
        "d": "m"
      },
      {
        "t": "Sam skip-counts by 5s and says: 5, 10, 15, 20, 25, 35. What number did Sam skip?",
        "o": [
          "22",
          "28",
          "30",
          "32"
        ],
        "a": 2,
        "e": "Counting by 5s goes 5, 10, 15, 20, 25, 30, 35. Sam skipped 30! Keep practicing! 🖐️",
        "d": "h"
      },
      {
        "t": "Kira adds 3 + 3 + 3 + 3 and gets 9. Is she correct?",
        "o": [
          "Yes, 9 is correct",
          "No, the answer is 12",
          "No, the answer is 15",
          "No, the answer is 6"
        ],
        "a": 1,
        "e": "There are four groups of 3. So, 3 + 3 + 3 + 3 = 12. Kira only added three 3s. You got it! 👍",
        "d": "h"
      },
      {
        "t": "6 + 6 + 6 = __ groups of __. Fill in both blanks.",
        "o": [
          "3 groups of 6",
          "6 groups of 3",
          "2 groups of 9",
          "6 groups of 6"
        ],
        "a": 0,
        "e": "You see 6 three times! That means 3 groups of 6. 6 + 6 + 6 = 18. Super work! 🌟",
        "d": "m"
      },
      {
        "t": "A child takes 5 steps. Each step is the same length. She walked 20 feet total. How long is each step?",
        "o": [
          "2 feet",
          "3 feet",
          "4 feet",
          "5 feet"
        ],
        "a": 2,
        "e": "To make 20 with 5 equal numbers, each number must be 4. So, 4 + 4 + 4 + 4 + 4 = 20. Each step is 4 feet! 👣",
        "d": "h"
      },
      {
        "t": "Which has the same value as 2 + 2 + 2 + 2 + 2 + 2?",
        "o": [
          "4 + 4 + 4",
          "3 + 3 + 3 + 3",
          "6 + 6",
          "All of the above"
        ],
        "a": 3,
        "e": "Wow, so many ways to make 12! 6 groups of 2, 3 groups of 4, 4 groups of 3, or 2 groups of 6. All are 12! 🎉",
        "d": "h"
      },
      {
        "t": "You earn 10 points each round. After how many rounds will you have 40 points?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "You need to add 10 four times to get 40. 10 + 10 + 10 + 10 = 40. That's 4 rounds! Good counting! 🔟",
        "d": "h"
      },
      {
        "t": "__ + __ + __ = 12 (all the same number). What is each number?",
        "o": [
          "2",
          "3",
          "4",
          "6"
        ],
        "a": 2,
        "e": "To make 12 using 3 equal numbers, each number must be 4. So, 4 + 4 + 4 = 12. You found it! ✅",
        "d": "h"
      },
      {
        "t": "Maya counts by 4s starting at 4. What is the 5th number she says?",
        "o": [
          "16",
          "18",
          "20",
          "24"
        ],
        "a": 2,
        "e": "Let's count by 4s: 4, 8, 12, 16, 20. The 5th number is 20. You are a skip-counting pro! 🔢",
        "d": "m"
      },
      {
        "t": "Leo says 5 + 5 + 5 + 5 = 4 groups of 5 = 25. What is Leo's mistake?",
        "o": [
          "The groups are wrong",
          "The total should be 20, not 25",
          "It should be 5 groups of 4",
          "Leo is correct"
        ],
        "a": 1,
        "e": "4 groups of 5 is correct, but 5+5+5+5 = 20. Leo added one too many 5s! You got it right! 💡",
        "d": "h"
      },
      {
        "t": "A bird eats 3 worms each day. How many worms does it eat in 4 days?",
        "o": [
          "7",
          "9",
          "12",
          "15"
        ],
        "a": 2,
        "e": "Each day, 3 worms. For 4 days, that's 3 + 3 + 3 + 3 = 12 worms. You counted them all! 🪱",
        "d": "m"
      },
      {
        "t": "Which pair of repeated addition sentences gives the same total? A) 2+2+2+2+2 and 5+5  B) 3+3+3 and 4+4  C) 6+6 and 3+3+3+3",
        "o": [
          "A only",
          "B only",
          "C only",
          "A and C"
        ],
        "a": 3,
        "e": "Pair A (10 and 10) matches! Pair B (9 and 8) does not. Pair C (12 and 12) matches! So A and C are correct! ✔️",
        "d": "h"
      },
      {
        "t": "__ + __ = 14 (both the same number). What is each number?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 2,
        "e": "To make 14 with two equal numbers, each number must be 7. So, 7 + 7 = 14. You split it evenly! ✌️",
        "d": "h"
      },
      {
        "t": "A frog jumps 3 feet at a time. After 6 jumps, it rests. Then it jumps 3 more times. How many feet did the frog jump in all?",
        "o": [
          "18",
          "21",
          "24",
          "27"
        ],
        "a": 3,
        "e": "First, 6 groups of 3 is 18 feet. Then, 3 groups of 3 is 9 feet. Add them: 18 + 9 = 27 feet total! ➕",
        "d": "h"
      },
      {
        "t": "Noah says 4 + 4 + 4 + 4 + 4 = 16. Is Noah correct? What is the right answer?",
        "o": [
          "Yes, 16 is correct",
          "No, the answer is 18",
          "No, the answer is 20",
          "No, the answer is 24"
        ],
        "a": 2,
        "e": "You need 5 groups of 4 to make 20. 4 + 4 + 4 + 4 + 4 = 20. Noah only had 4 groups. Great counting! 💯",
        "d": "h"
      },
      {
        "t": "A snail moves 2 inches per minute. A beetle moves 5 inches per minute. After 4 minutes, how much farther has the beetle gone?",
        "o": [
          "8",
          "10",
          "12",
          "14"
        ],
        "a": 2,
        "e": "Snail: 4 groups of 2 makes 8. Beetle: 4 groups of 5 makes 20. The difference is 20 - 8 = 12 inches! 🐛",
        "d": "h"
      },
      {
        "t": "Kim counts by 5s and writes: 5, 10, 15, 25. What number did she skip?",
        "o": [
          "12",
          "18",
          "20",
          "22"
        ],
        "a": 2,
        "e": "Counting by 5s goes 5, 10, 15, 20, 25. Kim skipped 20! Remember to count every 5. 🖐️",
        "d": "h"
      },
      {
        "t": "You save 3 coins each day. You need 21 coins to buy a toy. How many days until you have enough?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 2,
        "e": "You need to add 3 seven times to get 21. 3+3+3+3+3+3+3 = 21. That's 7 days! Keep saving! 💰",
        "d": "h"
      },
      {
        "t": "Zoe writes: 6 + 6 + 6 = 3 groups of 3. Find her mistake.",
        "o": [
          "It should be 3 groups of 6, not 3 groups of 3",
          "It should be 6 groups of 3",
          "The total is wrong",
          "Zoe is correct"
        ],
        "a": 0,
        "e": "Adding 6 three times means we have 3 groups of 6. That's 18, not 3 groups of 3. Great job! 👍",
        "d": "h"
      },
      {
        "t": "A train has 5 cars. Each car has some seats. There are 30 seats total. The first car has 10 seats. The other 4 cars have equal seats. How many seats in each of those 4 cars?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "First, find seats left: 30 - 10 = 20. Then, share 20 seats among 4 cars. Each car gets 5 seats! 🚗",
        "d": "h"
      },
      {
        "t": "Which gives a bigger total: adding 3 six times, or adding 6 three times?",
        "o": [
          "Adding 3 six times is bigger",
          "Adding 6 three times is bigger",
          "They are the same",
          "Cannot tell"
        ],
        "a": 2,
        "e": "Both 6 groups of 3 and 3 groups of 6 make 18! They are the same. Amazing! ✨",
        "d": "m"
      },
      {
        "t": "A caterpillar moves 2 inches per minute. It needs to cross a leaf that is 15 inches long. Can it cross in exactly 7 minutes?",
        "o": [
          "Yes, 2 x 7 = 15",
          "No, 2 x 7 = 14, it needs 1 more inch",
          "No, 2 x 7 = 16, it goes too far",
          "Yes, 2 x 7 = 16"
        ],
        "a": 1,
        "e": "The caterpillar crawls 2 inches 7 times, making 14 inches. The leaf is 15 inches, so it's 1 inch short. Almost there! 🐛",
        "d": "h"
      },
      {
        "t": "Jada adds 5+5+5 and gets 20. Marcus adds 4+4+4+4 and gets 12. Who made an error?",
        "o": [
          "Only Jada",
          "Only Marcus",
          "Both made errors",
          "Neither made an error"
        ],
        "a": 2,
        "e": "Jada's 3 groups of 5 is 15, not 20. Marcus's 4 groups of 4 is 16, not 12. Both made a mistake. Keep trying! 🤔",
        "d": "h"
      },
      {
        "t": "You get 4 beads each day for 5 days, then give away 6 beads. How many beads do you have?",
        "o": [
          "12",
          "14",
          "16",
          "20"
        ],
        "a": 1,
        "e": "You earned 5 groups of 4 beads, which is 20. Then you gave 6 away. So, 20 - 6 = 14 beads left. Good job! 🌟",
        "d": "h"
      },
      {
        "t": "A number is added to itself 3 times and the total is 24. What is the number?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 2,
        "e": "We need 3 equal numbers that add to 24. If we try 8, 8+8+8 = 24. So, the number is 8! You found it! ✅",
        "d": "h"
      },
      {
        "t": "Three children each count by a different number. Amy counts by 2s and says 5 numbers. Ben counts by 3s and says 4 numbers. Cara counts by 5s and says 2 numbers. Who reached the highest number?",
        "o": [
          "Amy",
          "Ben",
          "Cara",
          "They all reached the same number"
        ],
        "a": 1,
        "e": "Amy counts by 2s to 10. Ben counts by 3s to 12. Cara counts by 5s to 10. Ben reached the highest number, 12! 🏆",
        "d": "h"
      },
      {
        "t": "Tyler has 5 jars. Some have 2 coins and some have 4 coins. He has 14 coins total. How many jars have 4 coins?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 1,
        "e": "We need 14 coins. If 2 jars have 4 coins (4+4=8) and 3 jars have 2 coins (2+2+2=6), then 8+6=14! Yes! 💰",
        "d": "h"
      },
      {
        "t": "A plant grows 3 inches each week. After 4 weeks, the gardener cuts 5 inches off the top. How tall did the plant grow?",
        "o": [
          "5",
          "7",
          "8",
          "12"
        ],
        "a": 1,
        "e": "The plant grew 4 times by 3 inches, making 12 inches. After cutting 5 inches, it's 12 - 5 = 7 inches tall. Good thinking! 🌱",
        "d": "m"
      },
      {
        "t": "What number can you add to itself to get 16?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 2,
        "e": "We need two equal numbers that add up to 16. If we try 8, 8 + 8 = 16. So the number is 8! You got it! ✔️",
        "d": "m"
      },
      {
        "t": "Emma skips 5 stones. Each stone bounces 3 times. She counts 5 + 3 = 8 bounces. What mistake did she make?",
        "o": [
          "She should have added 3+3+3+3+3 = 15",
          "She should have added 5+5+5 = 15",
          "She should have subtracted 5-3 = 2",
          "Her answer is correct"
        ],
        "a": 0,
        "e": "Each of the 5 stones bounces 3 times. So we add 3 five times: 3+3+3+3+3 = 15 bounces. Not 5+3. You did it! 🪨",
        "d": "h"
      },
      {
        "t": "Two friends each count by 2s and say 5 numbers each. Did they count the same total of numbers?",
        "o": [
          "Yes, each counted to 10",
          "No, the first counted higher",
          "No, the second counted higher",
          "Not enough information"
        ],
        "a": 0,
        "e": "Both count by 2s and say 5 numbers: 2, 4, 6, 8, 10. They both reach 10! What a team! 👯",
        "d": "m"
      },
      {
        "t": "A recipe needs 4 eggs. You want to make 3 batches but only have 10 eggs. Do you have enough?",
        "o": [
          "Yes, you need 10 eggs",
          "Yes, you need 8 eggs",
          "No, you need 12 eggs",
          "No, you need 14 eggs"
        ],
        "a": 2,
        "e": "For 3 batches, you need 3 groups of 4 eggs, which is 12 eggs. You only have 10, so you are 2 eggs short. Almost! 🥚",
        "d": "h"
      },
      {
        "t": "A secret number is added to itself 4 times. The total is between 15 and 20. What is the secret number?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "Let's try 4! 4 groups of 4 is 16. 16 is between 15 and 20. So the secret number is 4! You found it! 🕵️",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "What is 4+4+4? (3 equal groups of 4)",
        "o": [
          "8",
          "10",
          "12",
          "16"
        ],
        "a": 2,
        "e": "3 groups of 4 means we add 4 three times: 4+4+4 = 12. That's also 3 x 4 = 12. Super smart! 👍"
      },
      {
        "t": "What is 2+2+2+2+2? (5 equal groups of 2)",
        "o": [
          "5",
          "7",
          "10",
          "12"
        ],
        "a": 2,
        "e": "5 groups of 2 means we add 2 five times: 2+2+2+2+2 = 10. That's also 5 x 2 = 10. You got it! 👏"
      },
      {
        "t": "Which addition matches \"3 × 6\"?",
        "o": [
          "3+3+3",
          "6+6+6",
          "3+6",
          "6+3+1"
        ],
        "a": 1,
        "e": "3 x 6 means 3 groups of 6. We can add 6 three times: 6+6+6. That makes 18! Well done! ✅"
      },
      {
        "t": "Skip count by 3: 3,6,9,12. How many groups of 3?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "When you count 3, 6, 9, 12, you are making 4 jumps of 3. That means 4 groups of 3! Great counting! 🔢"
      },
      {
        "t": "What is 7+7+7? (3 equal groups of 7)",
        "o": [
          "18",
          "19",
          "20",
          "21"
        ],
        "a": 3,
        "e": "3 groups of 7 means we add 7 three times: 7+7+7 = 21. That's also 3 x 7 = 21. Fantastic! ⭐"
      },
      {
        "t": "Repeated addition and multiplication give?",
        "o": [
          "Different answers",
          "Same answer",
          "An estimate",
          "A fraction"
        ],
        "a": 1,
        "e": "When you add the same number many times, it's like multiplying! So, 3 groups of 3 is 9. Great job! 👍"
      }
    ]
  },
  {
    "points": [
      "DIVISION means splitting into EQUAL groups",
      "The ÷ symbol means \"shared equally among\"",
      "12 ÷ 4 = 3 means 12 split into 4 groups = 3 in each",
      "Multiplication and division are FACT FAMILIES"
    ],
    "examples": [
      {
        "c": "#1a252f",
        "tag": "Division",
        "p": "12 cookies ÷ 4 friends = ?",
        "s": "Give 1 cookie to each friend, repeat...\nEach friend gets: 3 cookies!\n12 ÷ 4 = 3",
        "a": "12 ÷ 4 = 3 each ✅",
        "vis": "share:🍪:12:4"
      },
      {
        "c": "#1a252f",
        "tag": "Fact Family Connection",
        "p": "3 × 4 = 12 means:",
        "s": "3 × 4 = 12  →  12 ÷ 3 = 4\n4 × 3 = 12  →  12 ÷ 4 = 3\nThey are all in the SAME fact family!",
        "a": "Mult and division are related! ✅"
      },
      {
        "c": "#1a252f",
        "tag": "Two Questions Division Answers",
        "p": "For 12 ÷ 3:",
        "s": "Question 1: How many IN EACH group?\n12 items, 3 groups → 4 in each group\n\nQuestion 2: How many GROUPS?\n12 items, 3 in each → 4 groups",
        "a": "12 ÷ 3 = 4 either way! ✅"
      }
    ],
    "practice": [
      {
        "q": "10 divided by 2 = ?",
        "a": "5",
        "h": "10 shared between 2 friends = 5 each! Check: 2 x 5 = 10",
        "e": "You got it! Keep up the amazing work! ✨"
      },
      {
        "q": "12 divided by 4 = ?",
        "a": "3",
        "h": "12 shared among 4 friends = 3 each! Check: 4 x 3 = 12",
        "e": "Super smart! You found the right answer. 🎉"
      },
      {
        "q": "15 shared equally among 5 friends. Each gets?",
        "a": "3 each",
        "h": "15 divided by 5 = 3. Check: 5 x 3 = 15",
        "e": "Awesome thinking! You're doing great! 🌟"
      }
    ],
    "qBank": [
      {
        "t": "What is 15 ÷ 3?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "When you share 15 things equally among 3 friends, each friend gets 5! Because 3 groups of 5 make 15. You got it! 👏",
        "d": "e"
      },
      {
        "t": "What is 20 ÷ 4?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "You're right! If you share 20 toys with 4 friends, each friend gets 5 toys. Great sharing! 🧸",
        "d": "e"
      },
      {
        "t": "8 apples are shared equally between 2 groups. How many in each?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "Perfect! When you put 8 items into groups of 2, you get 4 groups. Or 8 shared by 2 is 4. Way to go! ✅",
        "d": "e"
      },
      {
        "t": "What is 12 ÷ 4?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "Yes! If you have 12 cookies and share them with 4 friends, each friend gets 3 cookies. Yum! 🍪",
        "d": "e"
      },
      {
        "t": "What is 24 ÷ 4?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 2,
        "e": "Super! Sharing 24 treats equally among 4 people means each person gets 6 treats. You're a sharing expert! 🥳",
        "d": "e"
      },
      {
        "t": "What does the ÷ symbol mean?",
        "o": [
          "Add",
          "Subtract",
          "Multiply",
          "Share equally"
        ],
        "a": 3,
        "e": "That's it! Division is all about sharing things equally into groups. You understand! 💡",
        "d": "e"
      },
      {
        "t": "Which multiplication fact helps you solve 18 ÷ 3?",
        "o": [
          "3×4",
          "3×5",
          "3×6",
          "3×7"
        ],
        "a": 2,
        "e": "You got it! Multiplication and division are like best friends. If 3 groups of 6 make 18, then 18 shared by 3 is 6! 🌟",
        "d": "e"
      },
      {
        "t": "What is 10 ÷ 2?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "Correct! If you have 10 socks and pair them up (groups of 2), you get 5 pairs. Awesome! 🧦",
        "d": "e"
      },
      {
        "t": "What is 16 ÷ 4?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "You're right! When you share 16 stickers equally with 4 friends, each friend gets 4 stickers. Great job! ✨",
        "d": "e"
      },
      {
        "t": "4×3=12, so 12÷4=?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "Yes! This is part of a fact family. Since 4 groups of 3 make 12, then 12 shared by 4 is 3. Super smart! 🧠",
        "d": "e"
      },
      {
        "t": "12 cookies, 3 friends. Each gets?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "That's it! If you share 12 pencils equally among 3 students, each student gets 4 pencils. Well done! ✏️",
        "d": "e"
      },
      {
        "t": "What is 18 ÷ 6?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "You got it! When you share 18 items into 6 equal groups, there are 3 items in each group. Fantastic! 🥳",
        "d": "e"
      },
      {
        "t": "What is 20 ÷ 5?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "Perfect! If you have 20 flowers and put 5 flowers in each vase, you will fill 4 vases. Amazing! 🌷",
        "d": "e"
      },
      {
        "t": "5×4=20, so 20÷5=?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "You're right! In this fact family, because 5 groups of 4 make 20, then 20 shared by 5 is 4. Smart! 👍",
        "d": "m"
      },
      {
        "t": "What is 14 ÷ 2?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 2,
        "e": "Yes! When you share 14 candies between 2 friends, each friend gets 7 candies. Sweet thinking! 🍬",
        "d": "e"
      },
      {
        "t": "Division and multiplication are?",
        "o": [
          "Unrelated",
          "Fact families",
          "Always equal",
          "Neither"
        ],
        "a": 1,
        "e": "Exactly! Division and multiplication are always connected. They are part of the same fact family! You know your math! 🤩",
        "d": "e"
      },
      {
        "t": "What is 9 ÷ 3?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "When you share 9 things equally among 3 friends, each friend gets 3 things! So, 9 ÷ 3 = 3. ✨",
        "d": "e"
      },
      {
        "t": "6×3=18, so 18÷6=?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "Think about 3 groups of 6 making 18. So, if you share 18 among 6, each gets 3! 18 ÷ 6 = 3. 👍",
        "d": "e"
      },
      {
        "t": "What is 25 ÷ 5?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "If you have 25 cookies and share them with 5 friends, each friend gets 5 cookies! 25 ÷ 5 = 5. 🍪",
        "d": "e"
      },
      {
        "t": "What is 30 ÷ 6?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "Share 30 candies equally with 6 friends. Each friend gets 5 candies! 30 ÷ 6 = 5. Yum! 🍬",
        "d": "e"
      },
      {
        "t": "28 apples shared by 4. Each gets?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 2,
        "e": "If you put 28 toys into 4 equal boxes, each box will have 7 toys! 28 ÷ 4 = 7. Great job! 🧸",
        "d": "e"
      },
      {
        "t": "4×6=24, so 24÷4=?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 2,
        "e": "We know 6 groups of 4 make 24. So, if you share 24 into 4 groups, each group has 6! 24 ÷ 4 = 6. ✅",
        "d": "m"
      },
      {
        "t": "What is 27 ÷ 3?",
        "o": [
          "7",
          "8",
          "9",
          "10"
        ],
        "a": 2,
        "e": "Share 27 stickers equally with 3 friends. Each friend gets 9 stickers! 27 ÷ 3 = 9. Awesome! 🌟",
        "d": "e"
      },
      {
        "t": "Sharing 15 stickers equally among 5 kids. Each gets?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "If you have 15 balloons and give 5 friends an equal share, each gets 3 balloons! 15 ÷ 5 = 3. 🎉",
        "d": "e"
      },
      {
        "t": "3×8=24, so 24÷3=?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 2,
        "e": "We know 8 groups of 3 make 24. So, if you share 24 into 3 groups, each group has 8! 24 ÷ 3 = 8. 👍",
        "d": "m"
      },
      {
        "t": "What is 12 ÷ 2?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 2,
        "e": "When you share 12 apples equally with 2 friends, each friend gets 6 apples! 12 ÷ 2 = 6. Good job! 🍎",
        "d": "e"
      },
      {
        "t": "5×5=25, so 25÷5=?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "You have 25 pencils to share with 5 classmates. Each person gets 5 pencils! 25 ÷ 5 = 5. Way to go! ✏️",
        "d": "m"
      },
      {
        "t": "What is 18 ÷ 2?",
        "o": [
          "7",
          "8",
          "9",
          "10"
        ],
        "a": 2,
        "e": "Share 18 cookies equally between 2 plates. Each plate gets 9 cookies! 18 ÷ 2 = 9. Delicious! 🍪",
        "d": "e"
      },
      {
        "t": "What does 20 ÷ 4 ask?",
        "o": [
          "20 plus 4",
          "20 groups of 4",
          "20 shared into 4 equal groups",
          "20 times 4"
        ],
        "a": 2,
        "e": "Division is when you share a total number of things equally into groups. Each group has the same amount! 🤝",
        "d": "e"
      },
      {
        "t": "4×7=28, so 28÷7=?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "We know 4 groups of 7 make 28. So, if you share 28 into 7 groups, each group has 4! 28 ÷ 7 = 4. Great! ✔️",
        "d": "m"
      },
      {
        "t": "8 cookies shared equally by 2 friends. How many cookies does each friend get?",
        "o": [
          "2",
          "3",
          "4",
          "6"
        ],
        "a": 2,
        "e": "When you share 8 cookies equally with 2 friends, each friend gets 4 cookies! So, 8 ÷ 2 = 4. 🍪",
        "d": "m"
      },
      {
        "t": "6 grapes shared equally by 3 children. How many grapes does each child get?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 1,
        "e": "Share 6 grapes equally with 3 children. Each child gets 2 grapes! So, 6 ÷ 3 = 2. Good sharing! 🍇",
        "d": "m"
      },
      {
        "t": "10 stickers shared equally by 2 friends. How many stickers does each friend get?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "When you share 10 stickers equally with 2 friends, each friend gets 5 stickers! So, 10 ÷ 2 = 5. ✨",
        "d": "m"
      },
      {
        "t": "12 crayons shared equally by 4 children. How many crayons does each child get?",
        "o": [
          "2",
          "3",
          "4",
          "6"
        ],
        "a": 1,
        "e": "Share 12 crayons equally with 4 children. Each child gets 3 crayons! So, 12 ÷ 4 = 3. Well done! 🖍️",
        "d": "m"
      },
      {
        "t": "9 toys shared equally among 3 friends. How many toys does each friend get?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "When you share 9 toys equally with 3 friends, each friend gets 3 toys! So, 9 ÷ 3 = 3. Playtime! 🧸",
        "d": "m"
      },
      {
        "t": "4 bananas shared equally by 2 monkeys. How many bananas does each monkey get?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 1,
        "e": "Share 4 bananas equally with 2 monkeys. Each monkey gets 2 bananas! So, 4 ÷ 2 = 2. Yummy! 🍌",
        "d": "e"
      },
      {
        "t": "15 pencils shared equally among 5 students. How many pencils does each student get?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "When you share 15 pencils among 5 students, each student gets 3 pencils. Great sharing! ✏️",
        "d": "m"
      },
      {
        "t": "6 oranges shared equally by 2 friends. How many oranges does each friend get?",
        "o": [
          "2",
          "3",
          "4",
          "6"
        ],
        "a": 1,
        "e": "Sharing 6 oranges with 2 friends means each friend gets 3 oranges. Yum! 🍊",
        "d": "m"
      },
      {
        "t": "20 berries shared equally among 4 birds. How many berries does each bird get?",
        "o": [
          "4",
          "5",
          "6",
          "10"
        ],
        "a": 1,
        "e": "When 20 berries are shared among 4 birds, each bird gets 5 berries. Good job! 🐦",
        "d": "m"
      },
      {
        "t": "10 fish shared equally among 5 bowls. How many fish in each bowl?",
        "o": [
          "1",
          "2",
          "3",
          "5"
        ],
        "a": 1,
        "e": "If you put 10 fish into 5 bowls, put 2 fish in each bowl so they are equal. Each bowl gets 2 fish! 🐠",
        "d": "m"
      },
      {
        "t": "8 apples shared equally among 4 baskets. How many apples in each basket?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 1,
        "e": "To share 8 apples equally into 4 baskets, put 2 apples in each basket. You did it! 🍎",
        "d": "m"
      },
      {
        "t": "14 markers shared equally by 2 children. How many markers does each child get?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 2,
        "e": "Share 14 markers with 2 children. Each child gets 7 markers, so everyone has the same! 🖍️",
        "d": "m"
      },
      {
        "t": "16 beads shared equally among 4 bracelets. How many beads on each bracelet?",
        "o": [
          "2",
          "3",
          "4",
          "8"
        ],
        "a": 2,
        "e": "To make 4 bracelets with 16 beads, put 4 beads on each. They all look great! 🌟",
        "d": "m"
      },
      {
        "t": "12 muffins shared equally by 3 friends. How many muffins does each friend get?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "Sharing 12 muffins with 3 friends means each friend gets 4 muffins. Everyone gets a treat! 🧁",
        "d": "m"
      },
      {
        "t": "18 blocks shared equally among 3 towers. How many blocks in each tower?",
        "o": [
          "4",
          "5",
          "6",
          "9"
        ],
        "a": 2,
        "e": "To build 3 towers with 18 blocks, put 6 blocks in each tower. They are all the same height! 🏗️",
        "d": "m"
      },
      {
        "t": "10 carrots shared equally by 2 rabbits. How many carrots does each rabbit get?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "When 10 carrots are shared between 2 rabbits, each rabbit gets 5 carrots. Happy bunnies! 🥕",
        "d": "m"
      },
      {
        "t": "20 seeds shared equally among 5 pots. How many seeds in each pot?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "To plant 20 seeds in 5 pots, put 4 seeds in each pot. They will grow beautifully! 🌱",
        "d": "m"
      },
      {
        "t": "6 shoes shared equally into 3 pairs. How many shoes in each pair?",
        "o": [
          "1",
          "2",
          "3",
          "6"
        ],
        "a": 1,
        "e": "To make 3 pairs from 6 shoes, put 2 shoes in each pair. Every pair needs 2 shoes! 👟",
        "d": "m"
      },
      {
        "t": "12 eggs shared equally into 2 cartons. How many eggs in each carton?",
        "o": [
          "4",
          "5",
          "6",
          "8"
        ],
        "a": 2,
        "e": "To put 12 eggs into 2 cartons, put 6 eggs in each carton. Now they are equal! 🥚",
        "d": "m"
      },
      {
        "t": "15 flowers shared equally among 3 vases. How many flowers in each vase?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "If you have 15 flowers for 3 vases, put 5 flowers in each vase. They look lovely! 🌸",
        "d": "m"
      },
      {
        "t": "15 flowers are put in vases. Each vase gets 5 flowers. How many vases are there?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "You have 15 flowers and want 5 in each vase. Count groups of 5: 5, 10, 15. That's 3 groups! So, 3 vases. 🌷",
        "d": "m"
      },
      {
        "t": "Kai has 12 cards. He wants to give the same number to each of his 3 friends. How many does each friend get?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "When you share 12 cards with 3 friends, each friend gets 4 cards. 4 + 4 + 4 makes 12! Good sharing! 🃏",
        "d": "h"
      },
      {
        "t": "Which sharing is NOT equal? A) 10 split into 5 and 5  B) 9 split into 3, 3, 3  C) 8 split into 3, 3, 2  D) 12 split into 4, 4, 4",
        "o": [
          "A",
          "B",
          "C",
          "D"
        ],
        "a": 2,
        "e": "Groups must be the same size to be equal. 3, 3, and 2 are not the same, so it's not equal sharing. Try again! 🤔",
        "d": "h"
      },
      {
        "t": "20 markers are shared equally among some cups. Each cup gets 4 markers. How many cups are there?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "You have 20 items and want 4 in each cup. Count groups of 4: 4, 8, 12, 16, 20. That's 5 cups! ✨",
        "d": "h"
      },
      {
        "t": "Ava has 16 beads. She makes bracelets with 4 beads each. How many bracelets can she make?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "If she has 16 beads and puts 4 on each bracelet, she can make 4 bracelets. 4 + 4 + 4 + 4 = 16! 💖",
        "d": "h"
      },
      {
        "t": "Ben says 14 shared by 2 is 6. Is he right?",
        "o": [
          "Yes, 6 is correct",
          "No, the answer is 7",
          "No, the answer is 8",
          "No, the answer is 5"
        ],
        "a": 1,
        "e": "To split 14 into 2 equal groups, each group must have 7 (7 + 7 = 14). 6 is not correct. Keep trying! 👍",
        "d": "m"
      },
      {
        "t": "18 students sit at tables. Each table has 3 students. How many tables are needed?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 2,
        "e": "Count groups of 3 until you reach 18. You need 6 tables. Great job! 👍",
        "d": "h"
      },
      {
        "t": "A baker has 24 cupcakes and puts them equally on 4 trays. How many on each tray?",
        "o": [
          "4",
          "5",
          "6",
          "8"
        ],
        "a": 2,
        "e": "Share 24 cupcakes equally among 4 trays. Each tray gets 6 cupcakes! 🧁",
        "d": "h"
      },
      {
        "t": "Liam shares 10 grapes equally with his sister. How many does each person get?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 2,
        "e": "Share 10 grapes equally between 2 people. Each person gets 5 grapes. Yum! 🍇",
        "d": "e"
      },
      {
        "t": "__ pencils shared equally among 5 friends gives each friend 3 pencils. How many pencils were there?",
        "o": [
          "8",
          "12",
          "15",
          "18"
        ],
        "a": 2,
        "e": "5 friends each get 3 pencils. Count 3 five times: 3, 6, 9, 12, 15. That's 15 pencils total! ✏️",
        "d": "e"
      },
      {
        "t": "Sara has 12 crackers. Can she share them equally among 5 friends with none left over?",
        "o": [
          "Yes, each gets 2",
          "Yes, each gets 3",
          "No, there would be extras",
          "No, she needs more crackers"
        ],
        "a": 2,
        "e": "If you split 12 into groups of 5, you'll have 2 groups of 5 (10) and 2 left over. It doesn't split evenly! 🤷‍♀️",
        "d": "h"
      },
      {
        "t": "Which number CAN be shared equally among 3 with none left over?",
        "o": [
          "7",
          "10",
          "15",
          "16"
        ],
        "a": 2,
        "e": "Only 15 can be split into 3 equal groups of 5 (5+5+5=15). The other numbers leave leftovers! ✅",
        "d": "e"
      },
      {
        "t": "There are 8 mittens. How many pairs of mittens is that?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 2,
        "e": "Each pair has 2 mittens. Count by 2s: 2, 4, 6, 8. That's 4 pairs of mittens! 🧤",
        "d": "e"
      },
      {
        "t": "A pizza has 8 slices. 4 friends share it equally. How many slices does each friend eat?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 1,
        "e": "Share 8 slices of pizza equally among 4 friends. Each friend gets 2 slices! 🍕",
        "d": "h"
      },
      {
        "t": "Mom made 18 cookies. She puts them in bags of 6. How many bags does she use?",
        "o": [
          "2",
          "3",
          "4",
          "6"
        ],
        "a": 1,
        "e": "Count groups of 6 until you reach 18: 6, 12, 18. That's 3 groups, so she uses 3 bags! 🛍️",
        "d": "m"
      },
      {
        "t": "Jay has 20 toy cars. He puts them in 4 equal rows. He says each row has 4 cars. Is Jay right?",
        "o": [
          "Yes, 4 is correct",
          "No, each row has 5",
          "No, each row has 6",
          "No, each row has 3"
        ],
        "a": 1,
        "e": "If you split 20 into 4 equal rows, each row will have 5 items (5+5+5+5=20). Not 4! 🤔",
        "d": "h"
      },
      {
        "t": "Which gives each child MORE treats: 12 treats shared by 3 children, or 12 treats shared by 4 children?",
        "o": [
          "Shared by 3 (4 each)",
          "Shared by 4 (3 each)",
          "They get the same",
          "Cannot tell"
        ],
        "a": 0,
        "e": "When you share 12 with fewer people (3 instead of 4), each person gets more! 12 ÷ 3 = 4. 12 ÷ 4 = 3. ✨",
        "d": "h"
      },
      {
        "t": "A teacher has 15 books. She wants each student to get 5 books. How many students can she give books to?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "Count groups of 5 books until you reach 15: 5, 10, 15. She can give books to 3 students! 📚",
        "d": "h"
      },
      {
        "t": "There are 16 socks. Socks come in pairs of 2. How many pairs?",
        "o": [
          "4",
          "6",
          "8",
          "10"
        ],
        "a": 2,
        "e": "Each pair has 2 socks. Count by 2s until 16: 2, 4, 6, 8, 10, 12, 14, 16. That's 8 pairs! 🧦",
        "d": "m"
      },
      {
        "t": "A farmer picks 18 apples and puts 6 in each basket. He says he needs 4 baskets. Is he right?",
        "o": [
          "Yes, he needs 4",
          "No, he needs 2",
          "No, he needs 3",
          "No, he needs 6"
        ],
        "a": 2,
        "e": "Count groups of 6 until you reach 18: 6, 12, 18. He only needs 3 baskets, not 4! 🧺",
        "d": "h"
      },
      {
        "t": "18 oranges are shared equally among some friends. Each friend gets 3 oranges. How many friends are there?",
        "o": [
          "3",
          "5",
          "6",
          "9"
        ],
        "a": 2,
        "e": "Count groups of 3 until you reach 18: 3, 6, 9, 12, 15, 18. That's 6 groups, so there are 6 friends! 👫",
        "d": "m"
      },
      {
        "t": "Mom has 13 strawberries for 4 kids. She gives each kid the same number. How many does each kid get, and how many are left over?",
        "o": [
          "3 each, 1 left over",
          "4 each, 0 left over",
          "2 each, 5 left over",
          "3 each, 0 left over"
        ],
        "a": 0,
        "e": "You can make 4 groups of 3 strawberries (3+3+3+3=12). You'll have 1 strawberry left over! 🍓",
        "d": "h"
      },
      {
        "t": "Tom arranges 24 chairs in equal rows. Which is NOT a way he could do it?",
        "o": [
          "3 rows of 8",
          "4 rows of 6",
          "5 rows of 5",
          "6 rows of 4"
        ],
        "a": 2,
        "e": "To make 24, you can have 3x8, 4x6, or 6x4. But 5x5 is 25, not 24. So 5 rows of 5 won't work! ✖️",
        "d": "m"
      },
      {
        "t": "A teacher has 20 pencils. She gives 4 to each student. She says she can give pencils to 6 students. Is she right?",
        "o": [
          "Yes, she has enough",
          "No, she can only give to 5 students",
          "No, she can only give to 4 students",
          "No, she can give to 7 students"
        ],
        "a": 1,
        "e": "Count groups of 4 pencils until you reach 20: 4, 8, 12, 16, 20. That's 5 groups, not 6! 🖍️",
        "d": "h"
      },
      {
        "t": "Sam has 15 marbles. He shares them equally among 3 bags, then gives 1 bag away. How many marbles does Sam have left?",
        "o": [
          "5",
          "10",
          "12",
          "15"
        ],
        "a": 1,
        "e": "First, share 15 marbles into 3 bags (5 per bag). If he gives 1 bag (5 marbles) away, 10 marbles are left. 🎁",
        "d": "h"
      },
      {
        "t": "Ella says if you share 16 equally among 3, each person gets 5 with 1 left over. Is she correct?",
        "o": [
          "Yes, she is correct",
          "No, each gets 5 with 0 left",
          "No, each gets 4 with 4 left over",
          "No, each gets 5 with 2 left over"
        ],
        "a": 0,
        "e": "If you split 16 into groups of 5, you'll have 3 groups of 5 (15) and 1 left over. Ella is correct! 🎉",
        "d": "h"
      },
      {
        "t": "A librarian has 30 books. She puts 5 on each shelf. She says she needs 7 shelves. What is her mistake?",
        "o": [
          "She needs 5 shelves",
          "She needs 6 shelves",
          "She needs 8 shelves",
          "She is correct"
        ],
        "a": 1,
        "e": "You have 30 books, 5 on each shelf. Count 5s: 5, 10, 15, 20, 25, 30. That's 6 shelves! Not 7. ✨",
        "d": "h"
      },
      {
        "t": "24 students need to form teams of equal size. Which team size will NOT work with no students left over?",
        "o": [
          "Teams of 3",
          "Teams of 4",
          "Teams of 5",
          "Teams of 6"
        ],
        "a": 2,
        "e": "We need equal teams from 24 players. Teams of 5 leave 4 players out. They don't work! 🏈",
        "d": "h"
      },
      {
        "t": "A baker makes 18 cupcakes. He boxes them with 6 in each box, then sells 2 boxes. How many cupcakes did he sell?",
        "o": [
          "6",
          "8",
          "10",
          "12"
        ],
        "a": 3,
        "e": "18 cupcakes, 6 in each box means 3 boxes. He sold 2 boxes. That's 6 + 6 = 12 cupcakes sold! 🧁",
        "d": "h"
      },
      {
        "t": "Lily has 20 beads. She wants to make necklaces with 4 beads each. Her friend gives her 4 more beads. How many necklaces can Lily make now?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 2,
        "e": "You have 20 beads and get 4 more, so 24 beads! Each necklace needs 4. Count by 4s to 24. That's 6 necklaces! 💎",
        "d": "h"
      },
      {
        "t": "14 apples are shared equally among 3 friends. How many does each get, and how many are left?",
        "o": [
          "4 each, 2 left",
          "5 each, 0 left",
          "4 each, 1 left",
          "3 each, 5 left"
        ],
        "a": 0,
        "e": "Share 14 apples among 3 friends. Each gets 4 apples (4+4+4=12). You have 2 apples left over. 🍎",
        "d": "h"
      },
      {
        "t": "There are 4 tables at a party. Some have 3 chairs and some have 5 chairs. There are 14 chairs total. How many tables have 5 chairs?",
        "o": [
          "1",
          "2",
          "3",
          "4"
        ],
        "a": 0,
        "e": "We have 14 chairs for 4 tables. If 3 tables have 3 chairs (3+3+3=9), then 14-9=5 chairs for the last table! 🪑",
        "d": "h"
      },
      {
        "t": "Which sharing problem has the BIGGEST answer per person? A) 20 shared by 4  B) 15 shared by 3  C) 18 shared by 6  D) 12 shared by 2",
        "o": [
          "20 shared by 4",
          "15 shared by 3",
          "18 shared by 6",
          "12 shared by 2"
        ],
        "a": 3,
        "e": "To get the most, we share 12 by 2. That gives 6 each! Other choices give less. 🏆",
        "d": "h"
      },
      {
        "t": "A box has 25 crayons. You share them equally among 5 kids, and each kid gives 2 back. How many crayons are back in the box?",
        "o": [
          "5",
          "8",
          "10",
          "15"
        ],
        "a": 2,
        "e": "25 crayons shared by 5 friends means 5 each. If each gives back 2, that's 5 groups of 2. 2+2+2+2+2 = 10 crayons! 🖍️",
        "d": "h"
      },
      {
        "t": "Ryan says you can share 17 equally among 4 friends with none left over. Is he right?",
        "o": [
          "Yes, each gets 4",
          "No, each gets 4 with 1 left over",
          "No, each gets 3 with 5 left over",
          "Yes, each gets 5"
        ],
        "a": 1,
        "e": "Try to make groups of 4 from 17. 4+4+4+4 = 16. You have 1 left over. It does not divide evenly! 🙅‍♀️",
        "d": "h"
      },
      {
        "t": "A zookeeper feeds 3 fish to each penguin. She uses 21 fish. How many penguins did she feed?",
        "o": [
          "5",
          "6",
          "7",
          "8"
        ],
        "a": 2,
        "e": "You fed 21 fish, 3 to each penguin. Count by 3s: 3, 6, 9, 12, 15, 18, 21. That's 7 penguins! 🐧",
        "d": "h"
      },
      {
        "t": "A bag has 16 gumballs. Emma takes half, then shares her half equally with 1 friend. How many does each girl get?",
        "o": [
          "2",
          "3",
          "4",
          "8"
        ],
        "a": 2,
        "e": "Half of 16 gumballs is 8 for Emma. She shares her 8 gumballs with 1 friend. So, 8 ÷ 2 = 4 gumballs each! 🍬",
        "d": "h"
      },
      {
        "t": "3 friends share some stickers equally and each gets 6. Then they find 6 more stickers and share those equally too. How many does each friend have now?",
        "o": [
          "6",
          "7",
          "8",
          "9"
        ],
        "a": 2,
        "e": "First, each gets 6 stickers. Then, 6 more are shared by 3 friends, so 2 more each! 6 + 2 = 8 stickers each! 🌟",
        "d": "h"
      },
      {
        "t": "A number can be shared equally among 2 friends AND among 3 friends with nothing left over. The number is between 10 and 20. What is it?",
        "o": [
          "11",
          "12",
          "15",
          "16"
        ],
        "a": 1,
        "e": "We need a number that both 2 and 3 can divide evenly. Let's try 12! 12 ÷ 2 = 6 and 12 ÷ 3 = 4. It works! ✅",
        "d": "h"
      },
      {
        "t": "A farmer has 20 eggs. He puts 6 in each box. How many full boxes does he make, and how many eggs are left?",
        "o": [
          "2 boxes, 8 left",
          "3 boxes, 2 left",
          "3 boxes, 0 left",
          "4 boxes, 2 left"
        ],
        "a": 1,
        "e": "You have 20 eggs and put 6 in each box. 6+6+6 = 18 eggs in 3 boxes. You have 2 eggs left over. 🥚",
        "d": "h"
      }
    ],
    "quiz": [
      {
        "t": "15 grapes shared equally among 3 kids. Each gets?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "15 divided by 3 means 3 equal groups. Each group has 5! We know 3 x 5 = 15. So 15 ÷ 3 = 5. 👍"
      },
      {
        "t": "20 ÷ 4 = ?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 1,
        "e": "20 shared by 4 means 4 equal groups. Each group has 5! We know 4 x 5 = 20. So 20 ÷ 4 = 5. ✔️"
      },
      {
        "t": "8 apples in 2 equal groups. Each group has?",
        "o": [
          "3",
          "4",
          "5",
          "6"
        ],
        "a": 1,
        "e": "8 divided by 2 means 2 equal groups. Each group has 4! We know 2 x 4 = 8. So 8 ÷ 2 = 4. ✅"
      },
      {
        "t": "If 4 × 3 = 12, then 12 ÷ 4 = ?",
        "o": [
          "2",
          "3",
          "4",
          "5"
        ],
        "a": 1,
        "e": "This is a fact family! If 4 x 3 = 12, then 12 ÷ 4 = 3. They are related! 👨‍👩‍👧‍👦"
      },
      {
        "t": "24 shared equally into 4 groups. Each group has?",
        "o": [
          "4",
          "5",
          "6",
          "7"
        ],
        "a": 2,
        "e": "24 shared by 4 means 4 equal groups. Each group has 6! We know 4 x 6 = 24. So 24 ÷ 4 = 6. 👍"
      },
      {
        "t": "The ÷ symbol means?",
        "o": [
          "Add",
          "Subtract",
          "Multiply",
          "Share equally"
        ],
        "a": 3,
        "e": "Division (÷) means we split a total into equal groups. We share things fairly! ➗"
      },
      {
        "t": "Which multiplication fact helps solve 18 ÷ 3?",
        "o": [
          "3×4",
          "3×5",
          "3×6",
          "3×7"
        ],
        "a": 2,
        "e": "We know 3 groups of 6 make 18. So, if we share 18 into 3 equal groups, there are 6 in each group! The answer is 6. 🎉"
      }
    ]
  }
];

export const unitQuiz: UnitQuiz = {
  "qBank": [
    {
      "t": "How many are in 3 groups of 4?",
      "o": [
        "10",
        "11",
        "12",
        "13"
      ],
      "a": 2,
      "e": "We add 4 three times: 4 + 4 + 4 = 12. This means 3 groups of 4 is 12! The answer is 12. ✨",
      "d": "m"
    },
    {
      "t": "What is 5+5+5?",
      "o": [
        "10",
        "12",
        "15",
        "20"
      ],
      "a": 2,
      "e": "When we have 3 groups with 5 in each, we have 15 in all! The answer is 15. 👍",
      "d": "m"
    },
    {
      "t": "An array has 3 rows and 4 columns. How many in all?",
      "o": [
        "7",
        "10",
        "12",
        "14"
      ],
      "a": 2,
      "e": "Imagine 3 groups with 4 items in each. Count them all up! 3 x 4 = 12. The answer is 12. 🍎",
      "d": "m"
    },
    {
      "t": "What is 2+2+2+2?",
      "o": [
        "6",
        "7",
        "8",
        "9"
      ],
      "a": 2,
      "e": "If you have 4 groups with 2 in each group, you have 8 things in total! The answer is 8. 🎈",
      "d": "m"
    },
    {
      "t": "What is 15 ÷ 3?",
      "o": [
        "4",
        "5",
        "6",
        "7"
      ],
      "a": 1,
      "e": "Share 15 cookies equally among 3 friends. Each friend gets 5 cookies! The answer is 5. 🍪",
      "d": "e"
    },
    {
      "t": "How many are in 4 groups of 5?",
      "o": [
        "15",
        "18",
        "20",
        "25"
      ],
      "a": 2,
      "e": "When you have 4 groups with 5 in each, you have 20 altogether! The answer is 20. 🌟",
      "d": "m"
    },
    {
      "t": "What is 20 ÷ 4?",
      "o": [
        "4",
        "5",
        "6",
        "7"
      ],
      "a": 1,
      "e": "We have 20 toys and put them into 4 equal boxes. Each box gets 5 toys! The answer is 5. 🧸",
      "d": "e"
    },
    {
      "t": "What is 3×6?",
      "o": [
        "15",
        "16",
        "17",
        "18"
      ],
      "a": 3,
      "e": "If you have 3 rows of 6 chairs, you have 18 chairs in total! The answer is 18. 🪑",
      "d": "m"
    },
    {
      "t": "8 apples are shared equally between 2 groups. How many in each?",
      "o": [
        "3",
        "4",
        "5",
        "6"
      ],
      "a": 1,
      "e": "Share 8 candies equally between 2 friends. Each friend gets 4 candies! The answer is 4. 🍬",
      "d": "h"
    },
    {
      "t": "Which repeated addition matches 3×5?",
      "o": [
        "5+5+5+5",
        "3+3+3+3+3",
        "5+5+5",
        "3+5+3"
      ],
      "a": 2,
      "e": "\"3 groups of 5\" means adding 5 three times: 5 + 5 + 5 = 15. The answer is 15. ✅",
      "d": "m"
    },
    {
      "t": "How many are in 2 groups of 9?",
      "o": [
        "16",
        "17",
        "18",
        "19"
      ],
      "a": 2,
      "e": "If you have 2 groups with 9 items in each, you have 18 items altogether! The answer is 18. ⚽",
      "d": "h"
    },
    {
      "t": "What is 12 ÷ 3?",
      "o": [
        "3",
        "4",
        "5",
        "6"
      ],
      "a": 1,
      "e": "We share 12 stickers equally among 3 friends. Each friend gets 4 stickers! The answer is 4. 🥳",
      "d": "e"
    },
    {
      "t": "An array has 4 rows and 6 columns. How many in all?",
      "o": [
        "16",
        "20",
        "24",
        "28"
      ],
      "a": 2,
      "e": "Imagine 4 boxes, with 6 pencils in each. That's 24 pencils in all! The answer is 24. ✏️",
      "d": "h"
    },
    {
      "t": "What is 9+9+9?",
      "o": [
        "21",
        "24",
        "27",
        "30"
      ],
      "a": 2,
      "e": "If you have 3 rows of 9 flowers, you have 27 flowers in total! The answer is 27. 🌷",
      "d": "h"
    },
    {
      "t": "What is 18 ÷ 6?",
      "o": [
        "2",
        "3",
        "4",
        "5"
      ],
      "a": 1,
      "e": "You have 18 apples and put 6 in each bag. You will fill 3 bags! The answer is 3. 🍎",
      "d": "e"
    },
    {
      "t": "How many are in 5 groups of 3?",
      "o": [
        "12",
        "13",
        "14",
        "15"
      ],
      "a": 3,
      "e": "When you have 5 groups with 3 in each, you have 15 altogether! The answer is 15. 🥳",
      "d": "m"
    },
    {
      "t": "If 4×3=12, then what is 12÷4?",
      "o": [
        "2",
        "3",
        "4",
        "5"
      ],
      "a": 1,
      "e": "We know 3 x 4 = 12. So, if we share 12 into 4 equal groups, there are 3 in each group! The answer is 3. 💡",
      "d": "h"
    },
    {
      "t": "Skip count by 3: 3, 6, 9, 12, ___, 18. What is the missing number?",
      "o": [
        "13",
        "14",
        "15",
        "16"
      ],
      "a": 2,
      "e": "When you add 12 and 3 together, you get 15. Count up 3 from 12: 13, 14, 15! The answer is 15.➕",
      "d": "h"
    },
    {
      "t": "What is 24 ÷ 4?",
      "o": [
        "4",
        "5",
        "6",
        "7"
      ],
      "a": 2,
      "e": "We have 24 items and make 4 equal groups. Each group has 6 items! The answer is 6. ✅",
      "d": "e"
    },
    {
      "t": "What is 3×3?",
      "o": [
        "6",
        "7",
        "8",
        "9"
      ],
      "a": 3,
      "e": "When you have 3 groups with 3 in each, you have 9 total! That's 3 × 3 = 9. Great job! 👍",
      "d": "e"
    },
    {
      "t": "What is 10 ÷ 2?",
      "o": [
        "3",
        "4",
        "5",
        "6"
      ],
      "a": 2,
      "e": "Sharing 10 items equally between 2 friends means each friend gets 5! So, 10 ÷ 2 = 5. You got it! ✨",
      "d": "e"
    },
    {
      "t": "How many are in 2 groups of 7?",
      "o": [
        "12",
        "13",
        "14",
        "15"
      ],
      "a": 2,
      "e": "If you have 2 groups of 7, like 7+7, you have 14 in all! So, 2 × 7 = 14. Super work! 🚀",
      "d": "h"
    },
    {
      "t": "What is 5×2?",
      "o": [
        "5",
        "8",
        "10",
        "12"
      ],
      "a": 2,
      "e": "When you put 5 groups of 2 together, you get 10! That's 5 × 2 = 10. You're a math whiz! 🧠",
      "d": "e"
    },
    {
      "t": "What is 16 ÷ 4?",
      "o": [
        "2",
        "3",
        "4",
        "5"
      ],
      "a": 2,
      "e": "If you share 16 cookies with 4 friends, each friend gets 4! So, 16 ÷ 4 = 4. Way to go! 🍪",
      "d": "e"
    },
    {
      "t": "An array has 5 rows and 4 columns. How many in all?",
      "o": [
        "15",
        "18",
        "20",
        "25"
      ],
      "a": 2,
      "e": "Having 5 groups with 4 in each means 20 total! That's 5 × 4 = 20. Amazing job! ⭐",
      "d": "h"
    },
    {
      "t": "What is 7+7+7?",
      "o": [
        "19",
        "20",
        "21",
        "22"
      ],
      "a": 2,
      "e": "If you have 3 groups with 7 in each, you have 21 altogether! So, 3 × 7 = 21. Fantastic! 🎉",
      "d": "h"
    },
    {
      "t": "What does the ÷ symbol mean?",
      "o": [
        "Add",
        "Subtract",
        "Multiply",
        "Divide equally"
      ],
      "a": 3,
      "e": "Division is when you share a total amount into equal groups. Everyone gets the same! 🤝",
      "d": "e"
    },
    {
      "t": "What is 4×4?",
      "o": [
        "12",
        "14",
        "16",
        "18"
      ],
      "a": 2,
      "e": "When you put 4 groups of 4 together, you get 16! That's 4 × 4 = 16. You're doing great! 😄",
      "d": "m"
    },
    {
      "t": "What is 20 ÷ 5?",
      "o": [
        "3",
        "4",
        "5",
        "6"
      ],
      "a": 1,
      "e": "Sharing 20 items equally among 5 groups means 4 in each! So, 20 ÷ 5 = 4. Keep it up! 👍",
      "d": "m"
    },
    {
      "t": "Which shows equal groups: 3+3+3 or 3+4+2?",
      "o": [
        "3+3+3",
        "3+4+2",
        "Both",
        "Neither"
      ],
      "a": 0,
      "e": "When you add the same number again and again, like 3+3+3, you are making equal groups! That's multiplication! ✔️",
      "d": "h"
    }
  ]
};

export const testBank: Question[] = [
  {
    "t": "How many are in 3 groups of 4?",
    "o": [
      "10",
      "11",
      "12",
      "13"
    ],
    "a": 2,
    "e": "Adding 4 three times (4+4+4) means you have 3 equal groups of 4, which makes 12! Excellent! ➕",
    "d": "e"
  },
  {
    "t": "An array has 3 rows and 4 columns. How many in all?",
    "o": [
      "7",
      "10",
      "12",
      "14"
    ],
    "a": 2,
    "e": "When you have 3 groups with 4 in each, you have 12 total! So, 3 × 4 = 12. You're so smart! 💡",
    "d": "m"
  },
  {
    "t": "Equal groups shown by 3+3+3+3?",
    "o": [
      "Yes",
      "No",
      "Sometimes",
      "Depends"
    ],
    "a": 0,
    "e": "For groups to be equal, every group must have the exact same number of items. Like 3, 3, and 3! ✅",
    "d": "m"
  },
  {
    "t": "How many are in 5 groups of 2?",
    "o": [
      "8",
      "9",
      "10",
      "11"
    ],
    "a": 2,
    "e": "Adding 2 five times (2+2+2+2+2) means you have 5 equal groups of 2, which makes 10! Awesome! 🖐️",
    "d": "e"
  },
  {
    "t": "An array has 4 rows and 6 columns. How many in all?",
    "o": [
      "16",
      "20",
      "24",
      "28"
    ],
    "a": 2,
    "e": "If you have 4 groups with 6 in each, you have 24 altogether! So, 4 × 6 = 24. You're a star! ⭐",
    "d": "h"
  },
  {
    "t": "How many are in 2 groups of 6?",
    "o": [
      "10",
      "11",
      "12",
      "13"
    ],
    "a": 2,
    "e": "Adding two groups of 6 (6+6) means you have 2 equal groups of 6, which makes 12! Good thinking! 🤔",
    "d": "m"
  },
  {
    "t": "An array has 5 rows and 4 columns. How many in all?",
    "o": [
      "15",
      "18",
      "20",
      "25"
    ],
    "a": 2,
    "e": "Having 5 groups with 4 in each means 20 total! That's 5 × 4 = 20. You've got this! 💪",
    "d": "m"
  },
  {
    "t": "How many are in 3 groups of 5?",
    "o": [
      "12",
      "13",
      "14",
      "15"
    ],
    "a": 3,
    "e": "Adding 5 three times (5+5+5) means you have 3 equal groups of 5, which makes 15! Wonderful! 🥳",
    "d": "e"
  },
  {
    "t": "An array has 2 rows and 7 columns. How many in all?",
    "o": [
      "12",
      "13",
      "14",
      "15"
    ],
    "a": 2,
    "e": "If you have 2 groups with 7 in each, you have 14 in all! So, 2 × 7 = 14. You did it! ✨",
    "d": "h"
  },
  {
    "t": "How many are in 4 groups of 4?",
    "o": [
      "12",
      "14",
      "16",
      "18"
    ],
    "a": 2,
    "e": "You added 4 four times! Four groups of 4 make 16. You got it! 👍",
    "d": "e"
  },
  {
    "t": "Is 3+4+3 equal groups?",
    "o": [
      "Yes",
      "No",
      "Sometimes",
      "Depends"
    ],
    "a": 1,
    "e": "For equal groups, all numbers must be the same. 3, 4, and 3 are not all equal. Keep trying! ✨",
    "d": "e"
  },
  {
    "t": "An array has 6 rows and 2 columns. How many in all?",
    "o": [
      "8",
      "10",
      "12",
      "14"
    ],
    "a": 2,
    "e": "Two groups of 6 make 12. Or, 6 groups of 2 also make 12! You're a math star! ⭐",
    "d": "h"
  },
  {
    "t": "How many are in 2 groups of 9?",
    "o": [
      "16",
      "17",
      "18",
      "19"
    ],
    "a": 2,
    "e": "You added 9 two times! Two groups of 9 make 18. Fantastic work! 👏",
    "d": "m"
  },
  {
    "t": "An array has 3 rows and 3 columns. How many in all?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 3,
    "e": "Three groups of 3 make 9. Imagine 3 rows with 3 items each. Super! 🌟",
    "d": "m"
  },
  {
    "t": "How many are in 5 groups of 5?",
    "o": [
      "20",
      "22",
      "24",
      "25"
    ],
    "a": 3,
    "e": "Five groups of 5 make 25! It's like 5 rows of 5. You're doing great! 😄",
    "d": "e"
  },
  {
    "t": "What is an ARRAY?",
    "o": [
      "Type of subtraction",
      "Equal rows and columns",
      "Way to measure",
      "Type of fraction"
    ],
    "a": 1,
    "e": "An array shows items in equal rows and equal columns. Every group is the same! ✅",
    "d": "e"
  },
  {
    "t": "How many are in 3 groups of 7?",
    "o": [
      "18",
      "19",
      "20",
      "21"
    ],
    "a": 3,
    "e": "You added 7 three times! Three groups of 7 make 21. Awesome! 🎉",
    "d": "m"
  },
  {
    "t": "An array has 4 rows and 5 columns. How many in all?",
    "o": [
      "16",
      "18",
      "20",
      "22"
    ],
    "a": 2,
    "e": "Four groups of 5 make 20. Or, 5 groups of 4 also make 20! Wonderful! 🥳",
    "d": "m"
  },
  {
    "t": "How many are in 6 groups of 3?",
    "o": [
      "15",
      "16",
      "17",
      "18"
    ],
    "a": 3,
    "e": "You added 3 six times! Six groups of 3 make 18. You're a math whiz! 🧠",
    "d": "m"
  },
  {
    "t": "An array has 4 rows. There are 12 items total. How many columns does it have?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "Multiply the number of rows by the number of columns to find the total items. 4 × 3 = 12. Correct! ✔️",
    "d": "h"
  },
  {
    "t": "Is 5+5+5+5 equal groups?",
    "o": [
      "Yes",
      "No",
      "Sometimes"
    ],
    "a": 0,
    "e": "Equal groups mean every group has the exact same number of items, like all groups of 5. Yes! 👍",
    "d": "e"
  },
  {
    "t": "An array has 10 rows and 2 columns. How many in all?",
    "o": [
      "16",
      "18",
      "20",
      "22"
    ],
    "a": 2,
    "e": "Ten groups of 2 make 20. Or, 2 groups of 10 also make 20! Amazing! ✨",
    "d": "h"
  },
  {
    "t": "How many are in 2 groups of 4?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 2,
    "e": "You added 4 two times! Two groups of 4 make 8. Good job! 😊",
    "d": "e"
  },
  {
    "t": "An array has 3 rows and 6 columns. How many in all?",
    "o": [
      "15",
      "16",
      "17",
      "18"
    ],
    "a": 3,
    "e": "Three groups of 6 make 18. Or, 6 groups of 3 also make 18! You're so smart! 💡",
    "d": "h"
  },
  {
    "t": "How many are in 4 groups of 6?",
    "o": [
      "20",
      "22",
      "24",
      "26"
    ],
    "a": 2,
    "e": "Four groups of 6 make 24. Or, 6 groups of 4 also make 24! Way to go! 🚀",
    "d": "m"
  },
  {
    "t": "How many items in 3 rows of 4?",
    "o": [
      "4",
      "8",
      "12",
      "16"
    ],
    "a": 2,
    "e": "Three groups of 4 make 12. Or, 4 groups of 3 also make 12! Keep up the great work! 🌈",
    "d": "e"
  },
  {
    "t": "Array rows go which direction?",
    "o": [
      "Up and down",
      "Left to right",
      "Diagonal",
      "All directions"
    ],
    "a": 1,
    "e": "Rows are lines that go across, from left to right. Imagine a line of friends! 😄",
    "d": "e"
  },
  {
    "t": "How many are in 5 groups of 4?",
    "o": [
      "16",
      "18",
      "20",
      "22"
    ],
    "a": 2,
    "e": "You added 4 five times! Five groups of 4 make 20. Excellent! 🌟",
    "d": "e"
  },
  {
    "t": "An array has 2 rows and 10 columns. How many in all?",
    "o": [
      "15",
      "18",
      "20",
      "22"
    ],
    "a": 2,
    "e": "Two groups of 10 make 20. Or, 10 groups of 2 also make 20! You nailed it! 🎉",
    "d": "h"
  },
  {
    "t": "How many are in 3 groups of 8?",
    "o": [
      "20",
      "22",
      "24",
      "26"
    ],
    "a": 2,
    "e": "Three groups of 8 is 8 + 8 + 8. That makes 24! You got it! ✨",
    "d": "m"
  },
  {
    "t": "What is 4+4+4? (3 equal groups of 4)",
    "o": [
      "8",
      "10",
      "12",
      "16"
    ],
    "a": 2,
    "e": "Three groups of 4 means 4 + 4 + 4. That makes 12! You're a math star! ⭐",
    "d": "m"
  },
  {
    "t": "What is 2+2+2+2+2?",
    "o": [
      "5",
      "7",
      "10",
      "12"
    ],
    "a": 2,
    "e": "Five groups of 2 means 2 + 2 + 2 + 2 + 2. That makes 10! Fantastic! 🤩",
    "d": "e"
  },
  {
    "t": "Which matches 3×6?",
    "o": [
      "3+3+3",
      "6+6+6",
      "3+6",
      "6+3+1"
    ],
    "a": 1,
    "e": "Three groups of 6 is 6 + 6 + 6. That makes 18! You showed great thinking! 🧠",
    "d": "e"
  },
  {
    "t": "Skip count by 3: 3, 6, 9, 12. How many groups of 3?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "Four jumps of 3 means 4 groups of 3! That's 3 + 3 + 3 + 3, which is 12. Super! 🤸",
    "d": "h"
  },
  {
    "t": "What is 7+7+7?",
    "o": [
      "18",
      "19",
      "20",
      "21"
    ],
    "a": 3,
    "e": "Three groups of 7 means 7 + 7 + 7. That makes 21! Keep up the amazing work! 🌟",
    "d": "m"
  },
  {
    "t": "Repeated addition and multiplication give?",
    "o": [
      "Different answers",
      "Same answer",
      "Estimate",
      "A fraction"
    ],
    "a": 1,
    "e": "The order of the numbers doesn't change the answer when you multiply! 3x4 and 4x3 both equal 12. Super! 👍",
    "d": "e"
  },
  {
    "t": "What is 5+5+5+5?",
    "o": [
      "15",
      "18",
      "20",
      "22"
    ],
    "a": 2,
    "e": "Four groups of 5 means 5 + 5 + 5 + 5. That makes 20! You're a math whiz! 🥳",
    "d": "e"
  },
  {
    "t": "Which is 4×3?",
    "o": [
      "4+4+4",
      "3+3+3+3",
      "4+3",
      "4×4"
    ],
    "a": 1,
    "e": "Four groups of 3 means 3 + 3 + 3 + 3. That makes 12! You understood it perfectly! ✅",
    "d": "e"
  },
  {
    "t": "Skip count by 6: 6, 12, 18. How many groups of 6?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "Three jumps of 6 means 3 groups of 6! That's 6 + 6 + 6, which is 18. Fantastic! 🤸",
    "d": "h"
  },
  {
    "t": "What is 9+9?",
    "o": [
      "16",
      "17",
      "18",
      "19"
    ],
    "a": 2,
    "e": "Two groups of 9 means 9 + 9. That makes 18! You're a multiplication master! 💪",
    "d": "e"
  },
  {
    "t": "3×8 in repeated addition?",
    "o": [
      "8+8+8",
      "3+3+3+3+3+3+3+3",
      "3+8",
      "8×3"
    ],
    "a": 0,
    "e": "Three groups of 8 means 8 + 8 + 8. That makes 24! You're doing super well! ✨",
    "d": "e"
  },
  {
    "t": "Skip count by 2: 2, 4, 6, 8, 10. How many groups of 2?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 2,
    "e": "Five jumps of 2 means 5 groups of 2! That's 2 + 2 + 2 + 2 + 2, which is 10. Great! 🤸",
    "d": "h"
  },
  {
    "t": "What is 6+6+6+6?",
    "o": [
      "20",
      "22",
      "24",
      "26"
    ],
    "a": 2,
    "e": "Four groups of 6 means 6 + 6 + 6 + 6. That makes 24! You're a math genius! 🌟",
    "d": "m"
  },
  {
    "t": "Skip count by 4: 4,8,12,16. That equals?",
    "o": [
      "3×4",
      "4×4",
      "5×4",
      "2×4"
    ],
    "a": 1,
    "e": "Four jumps of 4 means 4 groups of 4! That's 4 + 4 + 4 + 4, which is 16. Awesome! 🤸",
    "d": "h"
  },
  {
    "t": "What is 3×3?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 3,
    "e": "Three groups of 3 means 3 + 3 + 3. That makes 9! You're a multiplication pro! 🏆",
    "d": "e"
  },
  {
    "t": "Which shows 5 groups of 3?",
    "o": [
      "5+5+5",
      "3+3+3+3+3",
      "5×5",
      "3×5"
    ],
    "a": 1,
    "e": "Five groups of 3 means 3 + 3 + 3 + 3 + 3. That makes 15! You showed great work! ✨",
    "d": "e"
  },
  {
    "t": "What is 10+10+10?",
    "o": [
      "20",
      "25",
      "30",
      "35"
    ],
    "a": 2,
    "e": "Three groups of 10 means 10 + 10 + 10. That makes 30! You're so good at this! 🤩",
    "d": "m"
  },
  {
    "t": "Skip count by 2: 2,4,6,8. Equals?",
    "o": [
      "2×4",
      "3×2",
      "4×2",
      "5×2"
    ],
    "a": 2,
    "e": "Four groups of 2 means 2 + 2 + 2 + 2. That makes 8! You're a math champion! 🏆",
    "d": "h"
  },
  {
    "t": "What is 8+8?",
    "o": [
      "14",
      "15",
      "16",
      "17"
    ],
    "a": 2,
    "e": "Two groups of 8 means 8 + 8. That makes 16! You're doing wonderfully! 🌈",
    "d": "e"
  },
  {
    "t": "3×5 in words?",
    "o": [
      "3 more than 5",
      "3 groups of 5",
      "5 groups of 3",
      "Either B or C"
    ],
    "a": 3,
    "e": "You can multiply numbers in any order and get the same answer! 3×5 is the same as 5×3. So B and C are both right! ✨",
    "d": "e"
  },
  {
    "t": "What is 4+4+4+4+4?",
    "o": [
      "16",
      "18",
      "20",
      "22"
    ],
    "a": 2,
    "e": "5 groups of 4 means 4+4+4+4+4, which equals 20! So 5×4=20. 👍",
    "d": "e"
  },
  {
    "t": "5×6 in repeated addition?",
    "o": [
      "5+5+5+5+5+5",
      "6+6+6+6+6",
      "5+6",
      "Both A and B"
    ],
    "a": 3,
    "e": "6 groups of 5 (5+5+5+5+5+5) makes 30. And 5 groups of 6 (6+6+6+6+6) also makes 30! Both are correct. ✅",
    "d": "e"
  },
  {
    "t": "Count by 3: 3,6,9,___,15",
    "o": [
      "10",
      "11",
      "12",
      "13"
    ],
    "a": 2,
    "e": "Start at 9 and count up 3 more: 10, 11, 12! So 9+3=12. Great job! ➕",
    "d": "m"
  },
  {
    "t": "What is 2×9?",
    "o": [
      "14",
      "16",
      "18",
      "20"
    ],
    "a": 2,
    "e": "When you add a number to itself, it's a double! 9+9 is a double fact that equals 18. You got it! 👯",
    "d": "m"
  },
  {
    "t": "What is 7+7+7+7?",
    "o": [
      "24",
      "26",
      "28",
      "30"
    ],
    "a": 2,
    "e": "4 groups of 7 means 7+7+7+7. That makes 28! So 4×7=28. Awesome! ⭐",
    "d": "m"
  },
  {
    "t": "Which means the same as 3+3+3+3+3?",
    "o": [
      "5×3",
      "3×5",
      "Both",
      "Neither"
    ],
    "a": 2,
    "e": "5 groups of 3 makes 15. And 3 groups of 5 also makes 15! The order doesn't change the total. Both are right! 🥳",
    "d": "m"
  },
  {
    "t": "Count by 5: 5,10,15,20. Equals?",
    "o": [
      "3×5",
      "4×5",
      "5×5",
      "6×5"
    ],
    "a": 1,
    "e": "Each jump is 5! If you make 4 jumps of 5, you land on 20. So 4×5=20. Keep jumping! 🐸",
    "d": "h"
  },
  {
    "t": "What is 9+9+9?",
    "o": [
      "25",
      "26",
      "27",
      "28"
    ],
    "a": 2,
    "e": "3 groups of 9 means 9+9+9. That equals 27! So 3×9=27. You're a math star! ✨",
    "d": "m"
  },
  {
    "t": "Repeated addition ALWAYS gives same as multiplication?",
    "o": [
      "True",
      "False",
      "Sometimes",
      "Only for small numbers"
    ],
    "a": 0,
    "e": "Yes! When you add the same number many times, it's multiplication! 3+3+3 is 3 groups of 3, which is 3×3=9. Always true! ✅",
    "d": "e"
  },
  {
    "t": "6×4 in repeated addition?",
    "o": [
      "6+6+6+6",
      "4+4+4+4+4+4",
      "Either works",
      "Neither"
    ],
    "a": 2,
    "e": "4 groups of 6 (6+6+6+6) makes 24. And 6 groups of 4 (4+4+4+4+4+4) also makes 24! Both are correct. 🎉",
    "d": "m"
  },
  {
    "t": "What is 15 ÷ 3?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "If you share 15 items equally among 3 friends, each friend gets 5! Because 3 groups of 5 makes 15. So 15÷3=5. 🍎",
    "d": "e"
  },
  {
    "t": "What is 20 ÷ 4?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "When you share 20 items equally into 4 groups, there are 5 in each group! So 20÷4=5. You did it! 🎁",
    "d": "e"
  },
  {
    "t": "8 apples are shared equally between 2 groups. How many in each?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "If you share 8 cookies with 2 friends, each friend gets 4 cookies! So 8÷2=4. Yum! 🍪",
    "d": "m"
  },
  {
    "t": "What is 12 ÷ 4?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "When you share 12 toys equally into 4 boxes, each box gets 3 toys! So 12÷4=3. Great sharing! 🧸",
    "d": "e"
  },
  {
    "t": "What is 24 ÷ 4?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 2,
    "e": "If you share 24 stickers equally among 4 friends, each friend gets 6 stickers! So 24÷4=6. Super! 🤩",
    "d": "e"
  },
  {
    "t": "What does the ÷ symbol mean?",
    "o": [
      "Add",
      "Subtract",
      "Multiply",
      "Share equally"
    ],
    "a": 3,
    "e": "Division means taking a total and sharing it into equal groups. Everyone gets the same amount! That's fair. 🤝",
    "d": "e"
  },
  {
    "t": "Which multiplication fact helps you solve 18 ÷ 3?",
    "o": [
      "3×4",
      "3×5",
      "3×6",
      "3×7"
    ],
    "a": 2,
    "e": "Multiplication and division are related! Since 3 groups of 6 makes 18, then 18 shared into 3 groups gives 6 in each. Smart! 💡",
    "d": "m"
  },
  {
    "t": "What is 10 ÷ 2?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 2,
    "e": "If you share 10 pencils equally between 2 cups, each cup gets 5 pencils! So 10÷2=5. Perfect! ✏️",
    "d": "e"
  },
  {
    "t": "What is 16 ÷ 4?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 2,
    "e": "When you share 16 apples equally into 4 baskets, each basket gets 4 apples! So 16÷4=4. Good job! 🍎",
    "d": "e"
  },
  {
    "t": "4×3=12, so 12÷4=?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "If you have 12 things and put them in 4 equal groups, there are 3 in each group! That's a fact family! 12 ÷ 4 = 3. 🎉",
    "d": "m"
  },
  {
    "t": "12 cookies, 3 friends. Each gets?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "Imagine 12 toys shared among 3 friends. Each friend gets 4 toys! So, 12 ÷ 3 = 4. You're a math whiz! 🌟",
    "d": "m"
  },
  {
    "t": "What is 18 ÷ 6?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "If you have 18 flowers and put 6 in each vase, you'll fill 3 vases! 18 ÷ 6 = 3. Fantastic work! 💐",
    "d": "e"
  },
  {
    "t": "What is 20 ÷ 5?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "20 stickers shared with 5 friends means each friend gets 4 stickers! 20 ÷ 5 = 4. Keep up the great work! ✨",
    "d": "e"
  },
  {
    "t": "5×4=20, so 20÷5=?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "This is a fact family! Knowing 5 x 4 = 20 helps us see that 20 ÷ 5 = 4. Super smart! 💡",
    "d": "h"
  },
  {
    "t": "What is 14 ÷ 2?",
    "o": [
      "5",
      "6",
      "7",
      "8"
    ],
    "a": 2,
    "e": "Sharing 14 cookies equally between 2 people means each gets 7! 14 ÷ 2 = 7. Yummy math! 🍪",
    "d": "e"
  },
  {
    "t": "Division and multiplication are?",
    "o": [
      "Unrelated",
      "Fact families",
      "Always equal",
      "Neither"
    ],
    "a": 1,
    "e": "Multiplication and division are like best friends! They use the same numbers in a fact family. They help each other! 🤝",
    "d": "e"
  },
  {
    "t": "What is 9 ÷ 3?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "If you have 9 pencils and put them in 3 equal groups, each group has 3 pencils! 9 ÷ 3 = 3. Awesome! ✏️",
    "d": "e"
  },
  {
    "t": "6×3=18, so 18÷6=?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "It's a fact family! Since 6 x 3 = 18, we know 18 ÷ 6 = 3. You're getting good at this! 👍",
    "d": "m"
  },
  {
    "t": "What is 25 ÷ 5?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 2,
    "e": "When you have 25 and make groups of 5, you get 5 groups! 25 ÷ 5 = 5. Way to go! ⭐",
    "d": "e"
  },
  {
    "t": "What is 30 ÷ 6?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "Sharing 30 candies among 6 friends means each friend gets 5 candies! 30 ÷ 6 = 5. Sweet math! 🍭",
    "d": "e"
  },
  {
    "t": "28 apples shared by 4. Each gets?",
    "o": [
      "5",
      "6",
      "7",
      "8"
    ],
    "a": 2,
    "e": "If you have 28 apples and put them in 4 baskets, each basket has 7 apples! 28 ÷ 4 = 7. Great job! 🍎",
    "d": "m"
  },
  {
    "t": "4×6=24, so 24÷4=?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 2,
    "e": "This is a fact family! Knowing 4 x 6 = 24 helps us see that 24 ÷ 4 = 6. Super smart! 🧠",
    "d": "h"
  },
  {
    "t": "What is 27 ÷ 3?",
    "o": [
      "7",
      "8",
      "9",
      "10"
    ],
    "a": 2,
    "e": "Sharing 27 toys with 3 kids means each kid gets 9 toys! 27 ÷ 3 = 9. You are a sharing pro! 🧸",
    "d": "e"
  },
  {
    "t": "Sharing 15 stickers equally among 5 kids. Each gets?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "If you have 15 fingers and count them in groups of 5, you get 3 groups! 15 ÷ 5 = 3. You're amazing! 👋",
    "d": "m"
  },
  {
    "t": "3×8=24, so 24÷3=?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 2,
    "e": "It's a fact family! Since 3 x 8 = 24, we know 24 ÷ 3 = 8. You're doing so well! 👍",
    "d": "h"
  },
  {
    "t": "What is 12 ÷ 2?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 2,
    "e": "Sharing 12 cookies equally between 2 people means each gets 6! 12 ÷ 2 = 6. Half is easy! 🍪",
    "d": "e"
  },
  {
    "t": "5×5=25, so 25÷5=?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "When you have 25 and make groups of 5, you get 5 groups! 25 ÷ 5 = 5. You nailed it! 🎯",
    "d": "h"
  },
  {
    "t": "What is 18 ÷ 2?",
    "o": [
      "7",
      "8",
      "9",
      "10"
    ],
    "a": 2,
    "e": "Sharing 18 items equally between 2 means each gets 9! 18 ÷ 2 = 9. You're a division star! ⭐",
    "d": "e"
  },
  {
    "t": "What does 20 ÷ 4 ask?",
    "o": [
      "20 plus 4",
      "20 groups of 4",
      "20 shared into 4 equal groups",
      "20 times 4"
    ],
    "a": 2,
    "e": "Division is when you share a total number of things into equal groups. Everyone gets the same amount! 🥳",
    "d": "m"
  },
  {
    "t": "4×7=28, so 28÷7=?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "When you share 28 into 7 equal groups, each group has 4. That's a fact family! So, 28 ÷ 7 = 4. 💡",
    "d": "h"
  },
  {
    "t": "3 groups of 4=?",
    "o": [
      "10",
      "11",
      "12",
      "13"
    ],
    "a": 2,
    "e": "Great job! You found that there are 12 in total when you count all the equal groups. ✨",
    "d": "e"
  },
  {
    "t": "5+5+5=?",
    "o": [
      "10",
      "12",
      "15",
      "20"
    ],
    "a": 2,
    "e": "You're a math star! There are 15 in all when you put the equal groups together. ⭐",
    "d": "e"
  },
  {
    "t": "Array 3r,4c=?",
    "o": [
      "7",
      "10",
      "12",
      "14"
    ],
    "a": 2,
    "e": "Fantastic! You counted all the items in the equal groups and found there are 12. 👍",
    "d": "e"
  },
  {
    "t": "2+2+2+2=?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 2,
    "e": "Super work! You figured out there are 8 in total when you combine the equal groups. 🎉",
    "d": "m"
  },
  {
    "t": "15÷3=?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "Yes! You correctly counted 5 items in each group or 5 groups in total. Way to go! 🥳",
    "d": "m"
  },
  {
    "t": "4 groups of 5=?",
    "o": [
      "15",
      "18",
      "20",
      "25"
    ],
    "a": 2,
    "e": "Awesome! You found the total is 20 by putting all the equal groups together. Keep it up! 🚀",
    "d": "e"
  },
  {
    "t": "20÷4=?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "That's right! You found 5 by thinking about how many are in each equal group. Good job! 👏",
    "d": "m"
  },
  {
    "t": "3×6=?",
    "o": [
      "15",
      "16",
      "17",
      "18"
    ],
    "a": 3,
    "e": "You got it! When you combine all the equal groups, the total is 18. You're so smart! 🧠",
    "d": "m"
  },
  {
    "t": "8 apples, 2 groups. Each?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "Exactly! You found there are 4 in each group, or 4 groups in all. You're doing great! ✨",
    "d": "m"
  },
  {
    "t": "Addition for 3×5?",
    "o": [
      "5+5+5+5",
      "3+3+3+3+3",
      "5+5+5",
      "3+5+3"
    ],
    "a": 2,
    "e": "You're showing equal groups! Adding 5 three times (5+5+5) helps you find the total. ✅",
    "d": "e"
  },
  {
    "t": "There are 3 bowls with 4 strawberries each. How many strawberries in all?",
    "o": [
      "7",
      "10",
      "12",
      "14"
    ],
    "a": 2,
    "e": "You're right! Three bowls with 4 strawberries each means you add 4+4+4. That's 12 strawberries! 🍓",
    "d": "m"
  },
  {
    "t": "2 + 2 + 2 + 2 + 2 = ?",
    "o": [
      "6",
      "8",
      "10",
      "12"
    ],
    "a": 2,
    "e": "Great job! Counting by 2s (2, 4, 6, 8, 10) helps you quickly find the total of 10. ✌️",
    "d": "m"
  },
  {
    "t": "12 grapes shared equally by 3 children. How many grapes does each child get?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 1,
    "e": "You got it! When you share 12 grapes equally among 3 children, each child gets 4. That's fair sharing! 🍇",
    "d": "m"
  },
  {
    "t": "There are 5 jars with 2 bugs each. How many bugs in all?",
    "o": [
      "7",
      "8",
      "10",
      "12"
    ],
    "a": 2,
    "e": "Excellent! Five jars with 2 bugs each means you add 2 five times. That's 10 bugs in total! 🐞",
    "d": "e"
  },
  {
    "t": "5 + 5 + 5 + 5 = ?",
    "o": [
      "15",
      "20",
      "25",
      "10"
    ],
    "a": 1,
    "e": "Super! Counting by 5s (5, 10, 15, 20) helps you quickly find the total of 20. You're a pro! 🖐️",
    "d": "m"
  },
  {
    "t": "8 markers shared equally by 2 friends. How many markers does each friend get?",
    "o": [
      "2",
      "3",
      "4",
      "6"
    ],
    "a": 2,
    "e": "That's right! When you share 8 markers equally between 2 friends, each friend gets 4. Good sharing! 🖍️",
    "d": "m"
  },
  {
    "t": "There are 4 nests with 3 eggs each. How many eggs in all?",
    "o": [
      "7",
      "10",
      "12",
      "15"
    ],
    "a": 2,
    "e": "You got it! Four nests with 3 eggs each means you add 3 four times. That's 12 eggs in all! 🥚",
    "d": "e"
  },
  {
    "t": "3 + 3 + 3 = ?",
    "o": [
      "6",
      "9",
      "12",
      "3"
    ],
    "a": 1,
    "e": "Awesome! Counting by 3s (3, 6, 9) helps you quickly find the total of 9. You're so smart! 🔢",
    "d": "e"
  },
  {
    "t": "10 toys shared equally among 5 children. How many toys does each child get?",
    "o": [
      "1",
      "2",
      "3",
      "5"
    ],
    "a": 1,
    "e": "Excellent! When you share 10 toys equally among 5 children, each child gets 2. That's fair! 🧸",
    "d": "m"
  },
  {
    "t": "There are 2 plates with 5 cookies each. How many cookies in all?",
    "o": [
      "7",
      "10",
      "12",
      "5"
    ],
    "a": 1,
    "e": "We add 5 cookies from each plate together. 5 + 5 = 10. There are 10 cookies in all! 🍪",
    "d": "m"
  },
  {
    "t": "4 + 4 + 4 + 4 = ?",
    "o": [
      "12",
      "14",
      "16",
      "8"
    ],
    "a": 2,
    "e": "We skip count by 4 four times to find the total. 4, 8, 12, 16. The answer is 16! ✨",
    "d": "m"
  },
  {
    "t": "6 apples shared equally by 2 friends. How many apples does each friend get?",
    "o": [
      "2",
      "3",
      "4",
      "6"
    ],
    "a": 1,
    "e": "To share 6 apples equally with 2 friends, each friend gets 3 apples. Great sharing! 🍎",
    "d": "m"
  },
  {
    "t": "There are 3 boxes with 5 pencils each. How many pencils in all?",
    "o": [
      "8",
      "10",
      "15",
      "20"
    ],
    "a": 2,
    "e": "We add 5 pencils from each of the 3 boxes. 5 + 5 + 5 = 15. That's 15 pencils! ✏️",
    "d": "m"
  },
  {
    "t": "10 + 10 + 10 = ?",
    "o": [
      "20",
      "25",
      "30",
      "40"
    ],
    "a": 2,
    "e": "We skip count by 10 three times to find the total. 10, 20, 30. The answer is 30! 🔟",
    "d": "m"
  },
  {
    "t": "9 crackers shared equally among 3 friends. How many crackers does each friend get?",
    "o": [
      "2",
      "3",
      "4",
      "6"
    ],
    "a": 1,
    "e": "To share 9 crackers equally with 3 friends, each friend gets 3 crackers. Yum! 🥨",
    "d": "m"
  },
  {
    "t": "There are 6 cups with 2 ice cubes each. How many ice cubes in all?",
    "o": [
      "8",
      "10",
      "12",
      "14"
    ],
    "a": 2,
    "e": "We add 2 ice cubes from each of the 6 cups. 2 + 2 + 2 + 2 + 2 + 2 = 12. That's 12 ice cubes! 🧊",
    "d": "m"
  },
  {
    "t": "A dog buries 2 bones each day. After 3 days, how many bones are buried?",
    "o": [
      "4",
      "5",
      "6",
      "8"
    ],
    "a": 2,
    "e": "Each dog buried 2 bones. We add them up: 2 + 2 + 2 = 6. There are 6 bones buried! 🦴",
    "d": "h"
  },
  {
    "t": "20 stickers shared equally among 4 friends. How many stickers does each friend get?",
    "o": [
      "3",
      "4",
      "5",
      "10"
    ],
    "a": 2,
    "e": "To share 20 stickers equally with 4 friends, each friend gets 5 stickers. Awesome! ⭐",
    "d": "h"
  },
  {
    "t": "There are 4 bags with 4 candies each. How many candies in all?",
    "o": [
      "8",
      "12",
      "16",
      "20"
    ],
    "a": 2,
    "e": "We add 4 candies from each of the 4 bags. 4 + 4 + 4 + 4 = 16. That's 16 candies! 🍬",
    "d": "m"
  },
  {
    "t": "14 crayons shared equally by 2 children. How many crayons does each child get?",
    "o": [
      "5",
      "6",
      "7",
      "8"
    ],
    "a": 2,
    "e": "To share 14 crayons equally with 2 children, each child gets 7 crayons. Good job! 🖍️",
    "d": "m"
  },
  {
    "t": "4 + 4 + 4 + 4 + 4 is the same as __ groups of 4. What number goes in the blank?",
    "o": [
      "3",
      "4",
      "5",
      "20"
    ],
    "a": 2,
    "e": "Five 4s means 5 groups of 4. We add 4 five times: 4+4+4+4+4 = 20. The total is 20! 👍",
    "d": "m"
  },
  {
    "t": "Which shows 4 groups of 3?",
    "o": [
      "4 + 3",
      "3 + 3 + 3 + 3",
      "4 + 4 + 4",
      "3 + 4 + 3 + 4"
    ],
    "a": 1,
    "e": "4 groups of 3 means we add 3 four times. 3 + 3 + 3 + 3 = 12. The total is 12! ✅",
    "d": "e"
  },
  {
    "t": "18 apples are put in bags with 6 in each bag. How many bags are there?",
    "o": [
      "2",
      "3",
      "4",
      "6"
    ],
    "a": 1,
    "e": "We have 18 items and want groups of 6. 6 + 6 + 6 = 18. That means 3 groups, so 3 bags! 🛍️",
    "d": "m"
  },
  {
    "t": "Is 3 + 3 + 3 + 3 the same as 4 + 4 + 4?",
    "o": [
      "Yes, both equal 12",
      "No, the first is bigger",
      "No, the second is bigger",
      "Yes, both equal 9"
    ],
    "a": 0,
    "e": "4 groups of 3 (3+3+3+3=12) and 3 groups of 4 (4+4+4=12) both equal 12. They are the same! ✨",
    "d": "m"
  },
  {
    "t": "__ + __ + __ + __ + __ = 20 (all the same number). What is each number?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 2,
    "e": "To make 20 with 5 equal numbers, each number must be 4. 4+4+4+4+4 = 20. Perfect! 🔢",
    "d": "h"
  },
  {
    "t": "A store has 16 balls. Each bin holds 4 balls. How many bins are needed?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 2,
    "e": "We have 16 items and want groups of 4. 4+4+4+4 = 16. That means 4 groups, so 4 bins! 📦",
    "d": "h"
  },
  {
    "t": "Noah says 2+2+2+2+2 = 5 groups of 5. What is Noah's mistake?",
    "o": [
      "It is 5 groups of 2, not 5 groups of 5",
      "It is 2 groups of 5",
      "The total is wrong",
      "Noah is correct"
    ],
    "a": 0,
    "e": "2+2+2+2+2 means 5 groups of 2, which is 10. Not 5 groups of 5. You got this! 👍",
    "d": "h"
  },
  {
    "t": "Which number sentence does NOT show equal groups?",
    "o": [
      "3 + 3 + 3",
      "5 + 5 + 5 + 5",
      "4 + 3 + 4",
      "10 + 10"
    ],
    "a": 2,
    "e": "For groups to be equal, all numbers must be the same. 4 + 3 + 4 has different numbers. No equal groups! 🚫",
    "d": "e"
  },
  {
    "t": "A girl earns 5 stars each day at school. After some days she has 25 stars. How many days?",
    "o": [
      "3",
      "4",
      "5",
      "6"
    ],
    "a": 2,
    "e": "Each day you earn 5 stars. 5+5+5+5+5 = 25. It takes 5 days to earn 25 stars! ⭐",
    "d": "h"
  },
  {
    "t": "Which gives each person MORE: 12 cookies for 4 people, or 10 cookies for 2 people?",
    "o": [
      "12 for 4 (3 each)",
      "10 for 2 (5 each)",
      "They are the same",
      "Cannot tell"
    ],
    "a": 1,
    "e": "Sharing 12 cookies among 4 friends gives 3 each. Sharing 10 cookies among 2 friends gives 5 each. 5 is more than 3! 🍪",
    "d": "h"
  },
  {
    "t": "Amy counts by 2s and writes: 2, 4, 6, 10. What number did she skip?",
    "o": [
      "5",
      "7",
      "8",
      "9"
    ],
    "a": 2,
    "e": "Let's count by 2s: 2, 4, 6, 8, 10. Amy skipped the number 8! You found it! ✨",
    "d": "h"
  },
  {
    "t": "15 books shared equally among 5 shelves. How many books on each shelf?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 1,
    "e": "To share 15 books on 5 shelves equally, each shelf gets 3 books. 3+3+3+3+3 makes 15! 📚",
    "d": "m"
  },
  {
    "t": "__ + __ = 18 (both the same number). What is each number?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 3,
    "e": "To make 18 with two equal numbers, we can add 9 + 9. So each number is 9! Great job! 👍",
    "d": "h"
  },
  {
    "t": "Leo says he can share 11 erasers equally among 3 friends with none left over. Is he right?",
    "o": [
      "Yes, each gets 3",
      "Yes, each gets 4",
      "No, there will be 2 left over",
      "No, there will be 1 left over"
    ],
    "a": 2,
    "e": "If we give 3 friends 3 apples each, that's 9 apples. With 11 apples, 2 are left over. It's not even! 🍎",
    "d": "h"
  },
  {
    "t": "A dog gets 2 treats after each walk. After 6 walks, how many treats has the dog eaten?",
    "o": [
      "8",
      "10",
      "12",
      "14"
    ],
    "a": 2,
    "e": "For each of 6 walks, the dog gets 2 treats. That's 2 + 2 + 2 + 2 + 2 + 2, which makes 12 treats! 🐕",
    "d": "h"
  },
  {
    "t": "Which has the same value as 6+6+6?",
    "o": [
      "3+3+3+3+3+3",
      "9+9",
      "2+2+2+2+2+2+2+2+2",
      "All of the above"
    ],
    "a": 3,
    "e": "Yes! 6+6+6 is 18. Also, 3+3+3+3+3+3 is 18. And 9+9 is 18! All these ways make 18! 🎉",
    "d": "h"
  },
  {
    "t": "A teacher puts 20 pencils in cups with 5 in each cup. She says she filled 3 cups. Is that right?",
    "o": [
      "Yes, 3 cups",
      "No, she filled 4 cups",
      "No, she filled 5 cups",
      "No, she filled 2 cups"
    ],
    "a": 1,
    "e": "To make 20, you need 5 + 5 + 5 + 5. That's 4 groups of 5. So she needs 4 cups! ☕",
    "d": "h"
  },
  {
    "t": "Jake has some boxes with 4 toys each. He has 16 toys total. How many boxes?",
    "o": [
      "2",
      "3",
      "4",
      "5"
    ],
    "a": 2,
    "e": "If each box has 4 toys, then 4+4+4+4 makes 16 toys. So he has 4 boxes! You got it! 🎁",
    "d": "h"
  },
  {
    "t": "Which number CAN be shared equally among 4 with none left over?",
    "o": [
      "9",
      "14",
      "16",
      "18"
    ],
    "a": 2,
    "e": "16 can be split into 4 equal groups of 4 with none left over. 9, 14, and 18 don't split evenly by 4. ✅",
    "d": "m"
  },
  {
    "t": "6 + 6 + 6 is __ groups of __. Fill in both blanks.",
    "o": [
      "3 groups of 6",
      "6 groups of 3",
      "2 groups of 9",
      "6 groups of 6"
    ],
    "a": 0,
    "e": "When you see 6 + 6 + 6, that means 6 appears 3 times! So it's 3 groups of 6, which is 18. ⭐",
    "d": "h"
  },
  {
    "t": "A garden has 3 rows of vegetables with 6 in each row. A rabbit eats 4 vegetables. How many are left?",
    "o": [
      "12",
      "14",
      "16",
      "18"
    ],
    "a": 1,
    "e": "First, 6+6+6 makes 18 vegetables. Then the rabbit eats 4! So, 18 - 4 leaves 14 vegetables. 🥕",
    "d": "h"
  },
  {
    "t": "Mia says 4 groups of 5 is 25. Is Mia correct? What is the right answer?",
    "o": [
      "Yes, 25 is correct",
      "No, the answer is 15",
      "No, the answer is 20",
      "No, the answer is 24"
    ],
    "a": 2,
    "e": "4 groups of 5 means 5+5+5+5, which is 20. Mia said 25, but that would be 5 groups of 5! 🤔",
    "d": "h"
  },
  {
    "t": "There are 6 bags. Some have 2 toys and some have 5 toys. There are 21 toys total. How many bags have 5 toys?",
    "o": [
      "1",
      "2",
      "3",
      "4"
    ],
    "a": 2,
    "e": "If 3 bags have 5 toys each, that's 5+5+5=15. If 3 bags have 2 toys each, that's 2+2+2=6. 15+6=21! 🎉",
    "d": "h"
  },
  {
    "t": "Tom has 18 trading cards. He can put them in equal stacks. Which is NOT a way he could stack them?",
    "o": [
      "2 stacks of 9",
      "3 stacks of 6",
      "4 stacks of 5",
      "6 stacks of 3"
    ],
    "a": 2,
    "e": "2 groups of 9 is 18. 3 groups of 6 is 18. But 4 groups of 5 is 20, not 18. So 4 stacks of 5 won't work! ✖️",
    "d": "h"
  },
  {
    "t": "A teacher shares 22 stickers among 5 students equally. How many does each get, and how many are left?",
    "o": [
      "4 each, 2 left",
      "5 each, 0 left",
      "4 each, 0 left",
      "3 each, 7 left"
    ],
    "a": 0,
    "e": "If each friend gets 4 stickers, 5 friends get 20 stickers (4+4+4+4+4). With 22 stickers, 2 are left over! 🌟",
    "d": "h"
  },
  {
    "t": "Alex writes 5+5+5 = 5 groups of 3. Find his mistake.",
    "o": [
      "It should be 3 groups of 5, not 5 groups of 3",
      "It should be 5 groups of 5",
      "The total is wrong",
      "Alex is correct"
    ],
    "a": 0,
    "e": "5+5+5 means you have 3 groups of 5. That makes 15! It's not 5 groups of 3, which is 3+3+3+3+3. 💡",
    "d": "h"
  },
  {
    "t": "A pet store has 4 tanks with 5 fish each. Someone buys 2 fish from one tank. Later, 3 new fish are added to another tank. How many fish are there now?",
    "o": [
      "19",
      "20",
      "21",
      "23"
    ],
    "a": 2,
    "e": "First, 5+5+5+5 gives 20 fish. Then you sell 2 (20-2=18). Then you buy 3 more (18+3=21)! 🐠",
    "d": "h"
  },
  {
    "t": "Which gives a bigger result: 5 groups of 3, or 3 groups of 5?",
    "o": [
      "5 groups of 3 is bigger",
      "3 groups of 5 is bigger",
      "They are the same (both 15)",
      "Cannot tell"
    ],
    "a": 2,
    "e": "5 groups of 3 (3+3+3+3+3) makes 15. 3 groups of 5 (5+5+5) also makes 15! They are the same! 🎉",
    "d": "h"
  },
  {
    "t": "You have 24 cookies. You eat 4, then share the rest equally among 4 friends. How many does each friend get?",
    "o": [
      "4",
      "5",
      "6",
      "7"
    ],
    "a": 1,
    "e": "First, 24 cookies minus 4 eaten means 20 cookies left. Sharing 20 cookies among 4 friends means each gets 5! 🍪",
    "d": "h"
  },
  {
    "t": "Zoe says she can split 15 evenly into groups of 4 with none left over. Is she right?",
    "o": [
      "Yes, she makes 3 groups",
      "Yes, she makes 4 groups",
      "No, she gets 3 groups with 3 left over",
      "No, she gets 4 groups with 1 left over"
    ],
    "a": 2,
    "e": "We can make 3 groups of 4 (12). There are 3 left. So, 15 cannot be split into equal groups of 4. 🍎",
    "d": "h"
  },
  {
    "t": "Ben earns 3 coins each chore. He does 5 chores, then spends 8 coins. How many coins does he have?",
    "o": [
      "5",
      "7",
      "8",
      "10"
    ],
    "a": 1,
    "e": "You earned 5 groups of 3 coins, which is 15. After spending 8, you have 7 coins left! Great job! 💰",
    "d": "h"
  },
  {
    "t": "A number is added to itself 4 times and the total is 20. What is the number?",
    "o": [
      "4",
      "5",
      "6",
      "10"
    ],
    "a": 1,
    "e": "If 4 equal groups make 20, each group must have 5! (5+5+5+5=20). The number is 5. ✨",
    "d": "h"
  },
  {
    "t": "Three students each solve a problem differently. Anna says 3 groups of 6 = 18. Bella says 6 groups of 3 = 18. Carlos says 9 groups of 2 = 18. Who is correct?",
    "o": [
      "Only Anna",
      "Only Bella",
      "Anna and Bella only",
      "All three are correct"
    ],
    "a": 3,
    "e": "All these multiplication facts make 18! 3 groups of 6, 6 groups of 3, and 9 groups of 2 all equal 18. 🎉",
    "d": "h"
  },
  {
    "t": "A class of 20 students forms groups. If groups have 3 students each, how many full groups form and how many students are left?",
    "o": [
      "5 groups, 5 left",
      "6 groups, 2 left",
      "7 groups, 0 left",
      "6 groups, 0 left"
    ],
    "a": 1,
    "e": "You can make 6 full groups of 3 students (18 total). There are 2 students left over from 20. 🧍‍♀️",
    "d": "h"
  },
  {
    "t": "Emma has between 20 and 30 stickers. She can share them equally among 5 friends with none left over AND among 3 friends with none left over. How many stickers does she have?",
    "o": [
      "20",
      "24",
      "25",
      "30"
    ],
    "a": 3,
    "e": "Only 30 can be split into equal groups of 3 AND 5, and it's between 20 and 30. (30÷5=6, 30÷3=10). ✅",
    "d": "h"
  },
  {
    "t": "A store display has 2 rows of 5 toys on top and 3 rows of 4 toys on the bottom. A customer buys 3 toys. How many are left?",
    "o": [
      "17",
      "19",
      "20",
      "22"
    ],
    "a": 1,
    "e": "You have 2 groups of 5 (10) + 3 groups of 4 (12) = 22 toys. After buying 3, you have 19 toys left! 🧸",
    "d": "h"
  },
  {
    "t": "Jada has 5 bags. Some hold 3 marbles and some hold 6 marbles. She has 21 marbles total. How many bags hold 6 marbles?",
    "o": [
      "1",
      "2",
      "3",
      "4"
    ],
    "a": 1,
    "e": "If 2 bags have 6 marbles each (12), and 3 bags have 3 marbles each (9), that makes 21 total! 🎒",
    "d": "h"
  },
  {
    "t": "Marcus puts 20 books on shelves with 4 on each shelf. He says there are 6 shelves. What is his mistake?",
    "o": [
      "He needs 4 shelves",
      "He needs 5 shelves",
      "He needs 7 shelves",
      "He is correct"
    ],
    "a": 1,
    "e": "5 groups of 4 make 20 (4+4+4+4+4=20). Marcus counted 6 shelves, but there are only 5. 🤔",
    "d": "h"
  },
  {
    "t": "A farm has 3 pens with 4 chickens each and 2 pens with 6 chickens each. How many chickens total?",
    "o": [
      "18",
      "20",
      "24",
      "26"
    ],
    "a": 2,
    "e": "3 pens of 4 chickens is 12. 2 pens of 6 chickens is 12. So, 12+12 = 24 chickens in all! 🐔",
    "d": "h"
  },
  {
    "t": "A secret number can be made by adding 2s together AND by adding 3s together. The number is less than 15. What are the TWO possible numbers?",
    "o": [
      "6 and 12",
      "4 and 9",
      "8 and 10",
      "6 and 10"
    ],
    "a": 0,
    "e": "Numbers that can be made by groups of 2 AND 3 (under 15) are 6 and 12! (2x3=6, 2x6=12). 👍",
    "d": "h"
  },
  {
    "t": "There are 3 bags with 5 apples in each bag. 5+5+5 = ?",
    "o": [
      "15",
      "8",
      "10",
      "20"
    ],
    "a": 0,
    "e": "Adding equal groups (5+5+5=15) is the same as multiplication! 3 groups of 5 is 3x5=15. So smart! 💡"
  },
  {
    "t": "There are 4 groups of 2 pencils. 2+2+2+2 = ?",
    "o": [
      "8",
      "6",
      "2",
      "4"
    ],
    "a": 0,
    "e": "Four equal groups of 2 means 2+2+2+2, which equals 8! You found the total. Great work! ✅"
  }
];
