/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 3: Addition and Subtraction to 20
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    Primary:    1.3B, 1.3C, 1.3D, 1.3E, 1.3F
 *    Supporting: 1.5D, 1.5E, 1.5F, 1.5G
 *
 *  Lessons:
 *    L3.1  Add Within 20                        ← COMPLETE (170 questions)
 *    L3.2  Subtract Within 20                   ← stub
 *    L3.3  Doubles and Near Doubles             ← stub
 *    L3.4  Make 10                              ← stub
 *    L3.5  Fact Families and Word Problems      ← stub
 * ════════════════════════════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 3.1 — Add Within 20 — helpers, intervention templates, quizBank
//  Skill: add_within_20_counting_on · TEKS 1.3D, 1.3E (supporting 1.5G)
//  Target: 170 questions (55 easy / 70 medium / 45 hard)
// ════════════════════════════════════════════════════════════════════════════

function _l31Q(n, o) {
  return {
    id: 'g1-u3-l1-q-' + String(n).padStart(3, '0'),
    teks: ['1.3D', '1.3E', '1.5G'],
    lessonId: 'g1-u3-l1',
    skill: 'add_within_20_counting_on',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: o.answer,
    choices: o.choices,
    hint: o.hint,
    intervention: Object.assign({
      followUpRule: 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: true
    }, o.intervention)
  };
}

// ── Visual builders ─────────────────────────────────────────────────────────

function _l31VisTenFrame(n) { return { type: 'tenFrame', count: n }; }

function _l31VisTwoGroups(a, b, emoji) {
  return {
    type: 'twoGroups',
    config: {
      leftCount: a, leftObj:  emoji || '⭐',
      rightCount: b, rightObj: emoji || '⭐',
      op: 'add'
    }
  };
}

function _l31VisNumberLine(start, count) {
  var min = Math.max(0, start - 1);
  var max = Math.min(20, start + count + 1);
  var ticks = [];
  for (var i = min; i <= max; i++) ticks.push(i);
  var jumps = [];
  for (var j = 1; j <= count; j++) jumps.push(start + j);
  return { type: 'numberLine', min: min, max: max, ticks: ticks, jumps: jumps, mark: start };
}

// Rotating emoji pool for visual variety in twoGroups questions
var _l31_EMOJI_POOL = ['⭐', '🍎', '🎈', '🐶', '🍪', '🌸'];
function _l31Emoji(seed) { return _l31_EMOJI_POOL[seed % _l31_EMOJI_POOL.length]; }

// ── Intervention templates (one per error tag, parameterised) ───────────────

function _l31IntCountAll(a, b, sum) {
  return {
    errorTag: 'err_count_all_wrong',
    title: 'Count all the objects',
    teachingSteps: [
      'There are ' + a + ' in one group and ' + b + ' in the other.',
      'Count every single object: 1, 2, 3, ... up to ' + sum + '.',
      a + ' + ' + b + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'Joining ' + a + ' and ' + b + ' makes ' + sum + ' in all.'
  };
}

function _l31IntCountOn(a, b, sum) {
  var bigger  = a >= b ? a : b;
  var smaller = a >= b ? b : a;
  var steps = [];
  var s = bigger;
  for (var k = 0; k < smaller; k++) { s++; steps.push(s); }
  return {
    errorTag: 'err_count_from_smaller',
    title: 'Start with the bigger number, then count on',
    teachingSteps: [
      'Start at the bigger number: ' + bigger + '.',
      'Count on ' + smaller + ' more: ' + steps.join(', ') + '.',
      a + ' + ' + b + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'Counting on from ' + bigger + ' gives ' + sum + '.'
  };
}

function _l31IntAddZero(n) {
  return {
    errorTag: 'err_skip_zero_or_one',
    title: "Adding 0 doesn't change the number",
    teachingSteps: [
      'Zero means nothing was added.',
      n + ' stays the same: ' + n + ' + 0 = ' + n + '.',
      'Any number plus 0 is the same number.'
    ],
    correctAnswerExplanation: n + ' + 0 = ' + n + ' (and 0 + ' + n + ' = ' + n + ').'
  };
}

function _l31IntAddOne(n, sum) {
  return {
    errorTag: 'err_skip_zero_or_one',
    title: 'Adding 1 means one more',
    teachingSteps: [
      'Adding 1 gives the next number after ' + n + '.',
      'After ' + n + ' comes ' + sum + '.',
      n + ' + 1 = ' + sum + '.'
    ],
    correctAnswerExplanation: 'One more than ' + n + ' is ' + sum + '.'
  };
}

function _l31IntCommutative(a, b, sum) {
  return {
    errorTag: 'err_count_all_wrong',
    title: 'Numbers can be added in any order',
    teachingSteps: [
      a + ' + ' + b + ' and ' + b + ' + ' + a + ' both equal ' + sum + '.',
      'Switching the order does not change the total.',
      'This is called the "any-order" property.'
    ],
    correctAnswerExplanation: a + ' + ' + b + ' = ' + b + ' + ' + a + ' = ' + sum + '.'
  };
}

function _l31IntStrategyChoice(a, b) {
  var bigger  = a >= b ? a : b;
  var smaller = a >= b ? b : a;
  return {
    errorTag: 'err_count_from_smaller',
    title: 'Counting on works best from the bigger number',
    teachingSteps: [
      'When you add, you can start at either number.',
      'It is faster to start at the BIGGER number (' + bigger + ') and count up the smaller (' + smaller + ').',
      'That way you only count ' + smaller + ' steps instead of ' + bigger + '.'
    ],
    correctAnswerExplanation: 'Start at ' + bigger + ' (the bigger number) and count on ' + smaller + '.'
  };
}

// ── Question builders per category ──────────────────────────────────────────

// Standard 4-choice add question (correct + sum-1 + sum+1 + |a-b|)
function _l31MkAbstractQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var diff = a > b ? a - b : b - a;
  // Avoid duplicate distractor values
  var distractors = [];
  function addDistractor(val, tag, me) {
    if (val !== sum && distractors.findIndex(function(d){return d.value === String(val);}) === -1) {
      distractors.push({ value: String(val), correct: false, errorTag: tag, misconceptionExplanation: me });
    }
  }
  addDistractor(sum - 1, 'err_off_by_one',     'Student counted one too few.');
  addDistractor(sum + 1, 'err_off_by_one',     'Student counted one too many.');
  addDistractor(diff,    'err_add_as_subtract','Student subtracted instead of added.');
  // If diff matches sum-1 or sum+1, fill with another off-by-2
  if (distractors.length < 3) addDistractor(sum - 2, 'err_count_all_wrong', 'Student miscounted by 2.');
  if (distractors.length < 3) addDistractor(sum + 2, 'err_count_all_wrong', 'Student miscounted by 2.');
  return _l31Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: opts.subSkill || 'add_to_20',
    keyIdea: opts.keyIdea || 'You can count all the objects, or start at one number and count on.',
    prompt: opts.prompt || (a + ' + ' + b + ' = ?'),
    visual: opts.visual || null,
    answer: String(sum),
    choices: [{ value: String(sum), correct: true }].concat(distractors.slice(0, 3)),
    hint: opts.hint || ('Find the total of ' + a + ' and ' + b + '.'),
    intervention: opts.intervention || _l31IntCountOn(a, b, sum)
  });
}

function _l31MkAddZeroQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var nonZero = a === 0 ? b : a;
  return _l31Q(n, {
    difficulty: 'easy',
    subSkill: 'add_zero',
    keyIdea: "Adding 0 doesn't change the number.",
    prompt: a + ' + ' + b + ' = ?',
    visual: nonZero <= 10 ? _l31VisTenFrame(nonZero) : null,
    answer: String(sum),
    choices: [
      { value: String(sum), correct: true },
      { value: String(sum + 1), correct: false, errorTag: 'err_skip_zero_or_one', misconceptionExplanation: 'Student added 1 instead of 0.' },
      { value: '0',             correct: false, errorTag: 'err_count_all_wrong',  misconceptionExplanation: 'Student saw the 0 and ignored the other number.' }
    ],
    hint: 'Adding 0 keeps the number the same.',
    intervention: _l31IntAddZero(nonZero)
  });
}

function _l31MkAddOneQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var nonOne = a === 1 ? b : a;
  return _l31Q(n, {
    difficulty: 'easy',
    subSkill: 'add_one',
    keyIdea: 'Adding 1 means one more.',
    prompt: a + ' + ' + b + ' = ?',
    visual: nonOne <= 10 ? _l31VisTenFrame(nonOne) : null,
    answer: String(sum),
    choices: [
      { value: String(sum),     correct: true },
      { value: String(nonOne),  correct: false, errorTag: 'err_skip_zero_or_one', misconceptionExplanation: 'Student forgot to add the 1.' },
      { value: String(sum + 1), correct: false, errorTag: 'err_off_by_one',       misconceptionExplanation: 'Student added 2 instead of 1.' }
    ],
    hint: 'Adding 1 means the next number after ' + nonOne + '.',
    intervention: _l31IntAddOne(nonOne, sum)
  });
}

function _l31MkCountAllQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var emoji = _l31Emoji(n);
  return _l31Q(n, {
    difficulty: opts.difficulty || 'easy',
    subSkill: 'count_all_objects',
    keyIdea: 'You can count all the objects to find the total.',
    prompt: 'How many in all? ' + a + ' + ' + b + ' = ?',
    visual: _l31VisTwoGroups(a, b, emoji),
    answer: String(sum),
    choices: [
      { value: String(sum),     correct: true },
      { value: String(sum - 1), correct: false, errorTag: 'err_off_by_one',      misconceptionExplanation: 'Student counted one too few.' },
      { value: String(sum + 1), correct: false, errorTag: 'err_off_by_one',      misconceptionExplanation: 'Student counted one too many.' },
      { value: String(a),       correct: false, errorTag: 'err_count_all_wrong', misconceptionExplanation: 'Student only counted the first group.' }
    ],
    hint: 'Count every object in both groups.',
    intervention: _l31IntCountAll(a, b, sum)
  });
}

function _l31MkCountOnQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var bigger  = a >= b ? a : b;
  var smaller = a >= b ? b : a;
  // Build distractors with deduplication. When smaller === 1, `bigger` equals
  // `sum - 1` and would duplicate the off-by-one (less) distractor.
  var seen = { };
  seen[sum] = true;
  var distractors = [];
  function addDistractor(val, tag, me) {
    if (!seen[val]) {
      seen[val] = true;
      distractors.push({ value: String(val), correct: false, errorTag: tag, misconceptionExplanation: me });
    }
  }
  addDistractor(sum - 1,    'err_off_by_one',      'Student counted one too few.');
  addDistractor(sum + 1,    'err_off_by_one',      'Student counted one too many.');
  addDistractor(bigger,     'err_count_all_wrong', 'Student forgot to count on the smaller.');
  // Spillover when the bigger distractor duplicated sum-1 (smaller === 1)
  if (distractors.length < 3) addDistractor(sum + 2, 'err_count_all_wrong', 'Student miscounted by 2.');
  if (distractors.length < 3) addDistractor(smaller, 'err_count_all_wrong', 'Student picked the smaller addend.');
  return _l31Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: 'count_on_from_bigger',
    keyIdea: 'Start at the bigger number and count on the smaller.',
    prompt: 'Use the number line. ' + a + ' + ' + b + ' = ?',
    visual: _l31VisNumberLine(bigger, smaller),
    answer: String(sum),
    choices: [{ value: String(sum), correct: true }].concat(distractors.slice(0, 3)),
    hint: 'Start at ' + bigger + '. Count up ' + smaller + ' more.',
    intervention: _l31IntCountOn(a, b, sum)
  });
}

function _l31MkTenFrameQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  return _l31Q(n, {
    difficulty: 'medium',
    subSkill: 'count_all_objects',
    keyIdea: 'You can count all the dots in the ten-frame.',
    prompt: 'The ten-frame shows ' + a + '. Add ' + b + ' more. How many?',
    visual: _l31VisTenFrame(a),
    answer: String(sum),
    choices: [
      { value: String(sum),     correct: true },
      { value: String(sum - 1), correct: false, errorTag: 'err_off_by_one',      misconceptionExplanation: 'Student counted one too few.' },
      { value: String(sum + 1), correct: false, errorTag: 'err_off_by_one',      misconceptionExplanation: 'Student counted one too many.' },
      { value: String(a),       correct: false, errorTag: 'err_count_all_wrong', misconceptionExplanation: 'Student forgot to add the new dots.' }
    ],
    hint: 'Count the dots in the frame, then count ' + b + ' more.',
    intervention: _l31IntCountAll(a, b, sum)
  });
}

function _l31MkCommutativeQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  // Question: "Which is the same as a + b?"  Correct: b + a.  Distractors: off-by-one variants
  return _l31Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: 'commutative_property',
    keyIdea: 'Numbers can be added in any order.',
    prompt: 'Which is the same as ' + a + ' + ' + b + '?',
    visual: null,
    answer: b + ' + ' + a,
    choices: [
      { value: b + ' + ' + a,         correct: true },
      { value: a + ' + ' + (b + 1),   correct: false, errorTag: 'err_off_by_one',       misconceptionExplanation: 'Different total — off by one.' },
      { value: (a + 1) + ' + ' + b,   correct: false, errorTag: 'err_off_by_one',       misconceptionExplanation: 'Different total — off by one.' },
      { value: a + ' + ' + (b - 1),   correct: false, errorTag: 'err_off_by_one',       misconceptionExplanation: 'Different total — off by one.' }
    ],
    hint: 'Switching the order of two addends gives the same total.',
    intervention: _l31IntCommutative(a, b, sum)
  });
}

function _l31MkStrategyChoiceQ(n, opts) {
  var a = opts.a, b = opts.b;
  var bigger  = a >= b ? a : b;
  var smaller = a >= b ? b : a;
  return _l31Q(n, {
    difficulty: 'hard',
    subSkill: 'count_on_from_bigger',
    keyIdea: 'Counting on works best from the bigger number.',
    prompt: 'For ' + a + ' + ' + b + ', which number is the smart start to count on?',
    visual: null,
    answer: String(bigger),
    choices: [
      { value: String(bigger),  correct: true },
      { value: String(smaller), correct: false, errorTag: 'err_count_from_smaller', misconceptionExplanation: 'Counting on from the smaller takes more steps.' },
      { value: String(a + b),   correct: false, errorTag: 'err_count_all_wrong',    misconceptionExplanation: 'That is the total, not a starting number.' }
    ],
    hint: 'Pick the bigger of the two numbers.',
    intervention: _l31IntStrategyChoice(a, b)
  });
}

// ── Worked examples ─────────────────────────────────────────────────────────

const _l31Examples = [
  {
    id: 'g1-u3-l1-ex-001',
    title: 'Example 1: Count All',
    prompt: 'There are 3 stars and 2 stars. How many in all?',
    visual: _l31VisTwoGroups(3, 2, '⭐'),
    steps: [
      'Count every star in both groups.',
      '1, 2, 3 ... 4, 5.',
      'There are 5 stars in all.'
    ],
    finalAnswer: '5',
    teachingNote: 'Counting all is the most concrete strategy and a great starting point.',
    relatedKeyIdea: 'You can count all the objects, or start at one number and count on.'
  },
  {
    id: 'g1-u3-l1-ex-002',
    title: 'Example 2: Adding Zero',
    prompt: 'What is 8 + 0?',
    visual: _l31VisTenFrame(8),
    steps: [
      'Adding 0 means nothing was added.',
      '8 stays the same.',
      '8 + 0 = 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'Zero is a tricky idea — emphasise that adding 0 changes nothing.',
    relatedKeyIdea: "Adding 0 doesn't change a number."
  },
  {
    id: 'g1-u3-l1-ex-003',
    title: 'Example 3: Adding One',
    prompt: 'What is 9 + 1?',
    visual: _l31VisTenFrame(9),
    steps: [
      'Adding 1 means one more.',
      'The next number after 9 is 10.',
      '9 + 1 = 10.'
    ],
    finalAnswer: '10',
    teachingNote: 'Connect "+1" to the count sequence — the next number.',
    relatedKeyIdea: 'Adding 1 means one more.'
  },
  {
    id: 'g1-u3-l1-ex-004',
    title: 'Example 4: Count On from the Bigger Number',
    prompt: 'What is 2 + 8?',
    visual: _l31VisNumberLine(8, 2),
    steps: [
      '2 is the smaller number, 8 is the bigger number.',
      'Start at 8 and count on 2 more: 9, 10.',
      '2 + 8 = 10.'
    ],
    finalAnswer: '10',
    teachingNote: 'Show the efficiency of starting with the bigger addend.',
    relatedKeyIdea: 'Counting on works best if you start with the bigger number.'
  },
  {
    id: 'g1-u3-l1-ex-005',
    title: 'Example 5: Either Order',
    prompt: 'Compare 4 + 6 and 6 + 4.',
    visual: _l31VisTwoGroups(4, 6, '🍎'),
    steps: [
      '4 + 6: count 4 then 6 more — total 10.',
      '6 + 4: count 6 then 4 more — total 10.',
      'Both equal 10. The order does not matter.'
    ],
    finalAnswer: '10',
    teachingNote: 'Reinforce the "any-order" property without using the formal name.',
    relatedKeyIdea: 'Numbers can be added in any order.'
  },
  {
    id: 'g1-u3-l1-ex-006',
    title: 'Example 6: Sum Past Ten',
    prompt: 'What is 12 + 5?',
    visual: _l31VisNumberLine(12, 5),
    steps: [
      'Start at 12 (the bigger number).',
      'Count on 5 more: 13, 14, 15, 16, 17.',
      '12 + 5 = 17.'
    ],
    finalAnswer: '17',
    teachingNote: 'Counting on past 10 should feel just like counting on within 10.',
    relatedKeyIdea: 'Counting on works for sums past 10 too.'
  }
];

// ── Question data (170 tuples) ──────────────────────────────────────────────

// EASY 55: E1 add zero (12), E2 add one (12), E3 count all (16), E4 count on (15)
var _l31_E1 = [
  [7,0], [0,9], [3,0], [0,5], [10,0], [0,12], [6,0], [0,4], [8,0], [0,1], [11,0], [0,15]
];
var _l31_E2 = [
  [6,1], [1,8], [9,1], [1,4], [12,1], [1,7], [3,1], [1,11], [5,1], [1,9], [14,1], [1,18]
];
var _l31_E3 = [
  [3,2], [4,3], [2,5], [5,3], [4,4], [6,2], [2,6], [3,5], [5,4], [4,5], [6,3], [3,6], [4,6], [6,4], [5,5], [3,4]
];
var _l31_E4 = [
  [7,2], [8,2], [6,3], [7,3], [5,4], [4,4], [9,1], [4,3], [6,4], [3,5], [2,6], [5,2], [8,1], [4,2], [3,7]
];

// MEDIUM 70: M1 count all (15), M2 count on (20), M3 tenFrame (10), M4 commutative (10), M5 abstract (15)
var _l31_M1 = [
  [3,5], [6,3], [4,7], [5,6], [7,4], [3,9], [8,4], [6,6], [5,7], [4,9], [8,5], [9,4], [6,8], [9,5], [7,7]
];
var _l31_M2 = [
  [8,3], [3,8], [9,2], [2,9], [7,4], [8,4], [4,8], [9,3], [3,9], [10,2], [9,4], [4,9], [10,3], [3,10], [8,5], [10,4], [4,10], [9,5], [11,3], [10,5]
];
var _l31_M3 = [
  [7,3], [6,4], [8,2], [9,1], [5,5], [4,6], [3,7], [2,8], [1,9], [6,5]
];
var _l31_M4 = [
  [3,5], [4,6], [2,7], [5,4], [6,5], [7,3], [4,8], [5,7], [6,3], [8,4]
];
var _l31_M5 = [
  [4,2], [3,4], [5,3], [6,2], [4,5], [7,2], [5,5], [6,4], [8,3], [9,2], [7,4], [8,4], [6,6], [9,4], [10,5]
];

// HARD 45: H1 count on sums-16 (15), H2 strategy 5, H3 commutative 5, H4 abstract sums 17-20 (20)
var _l31_H1 = [
  [8,8], [9,7], [7,9], [10,6], [6,10], [11,5], [5,11], [12,4], [4,12], [13,3], [3,13], [14,2], [2,14], [15,1], [1,15]
];
var _l31_H2 = [
  [3,9], [4,7], [2,8], [5,11], [6,10]
];
var _l31_H3 = [
  [7,5], [8,6], [9,7], [10,8], [6,9]
];
var _l31_H4 = [
  [8,9], [9,8], [10,7], [7,10], [11,6], [6,11], [9,9], [10,8], [8,10], [11,7], [12,6], [13,5], [14,4], [9,10], [10,9], [11,8], [12,7], [10,10], [11,9], [12,8]
];

// ── Bank assembly ───────────────────────────────────────────────────────────

var _l31QuizBank = [];
var _l31N = 0;

// Easy
_l31_E1.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkAddZeroQ(_l31N,  { a:t[0], b:t[1] })); });
_l31_E2.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkAddOneQ(_l31N,   { a:t[0], b:t[1] })); });
_l31_E3.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkCountAllQ(_l31N, { a:t[0], b:t[1], difficulty:'easy' })); });
_l31_E4.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkCountOnQ(_l31N,  { a:t[0], b:t[1], difficulty:'easy'  })); });

// Medium
_l31_M1.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkCountAllQ(_l31N, { a:t[0], b:t[1], difficulty:'medium' })); });
_l31_M2.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkCountOnQ(_l31N,  { a:t[0], b:t[1], difficulty:'medium' })); });
_l31_M3.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkTenFrameQ(_l31N, { a:t[0], b:t[1] })); });
_l31_M4.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkCommutativeQ(_l31N,{ a:t[0], b:t[1], difficulty:'medium' })); });
_l31_M5.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkAbstractQ(_l31N, {
  a:t[0], b:t[1], difficulty:'medium', subSkill:'add_to_20',
  intervention: _l31IntCountOn(t[0], t[1], t[0]+t[1])
})); });

// Hard
_l31_H1.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkAbstractQ(_l31N, {
  a:t[0], b:t[1], difficulty:'hard', subSkill:'count_on_from_bigger',
  prompt: 'Use counting on: ' + t[0] + ' + ' + t[1] + ' = ?',
  intervention: _l31IntCountOn(t[0], t[1], t[0]+t[1])
})); });
_l31_H2.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkStrategyChoiceQ(_l31N, { a:t[0], b:t[1] })); });
_l31_H3.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkCommutativeQ(_l31N,{ a:t[0], b:t[1], difficulty:'hard' })); });
_l31_H4.forEach(function(t){ _l31N++; _l31QuizBank.push(_l31MkAbstractQ(_l31N, {
  a:t[0], b:t[1], difficulty:'hard', subSkill:'add_to_20',
  intervention: _l31IntCountOn(t[0], t[1], t[0]+t[1])
})); });

// ════════════════════════════════════════════════════════════════════════════
//  Spec
// ════════════════════════════════════════════════════════════════════════════

export const G1_U3_SPEC = {
  unitId: 'g1u3',
  title: 'Addition and Subtraction to 20',
  teks: ['1.3B', '1.3C', '1.3D', '1.3E', '1.3F', '1.5D', '1.5E', '1.5F', '1.5G'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.1 — Add Within 20 (170 questions)
    //  TEKS 1.3D, 1.3E (supporting 1.5G)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l1',
      title: 'Add Within 20',
      teks: ['1.3D', '1.3E', '1.5G'],
      skill: 'add_within_20_counting_on',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'To add, you find the total of two parts.',
        "Adding 0 doesn't change a number. (7 + 0 = 7)",
        'Adding 1 means one more. (6 + 1 = 7)',
        'You can count all the objects, or start at one number and count on.',
        'Counting on works best if you start with the bigger number and count up the smaller one.',
        'Numbers can be added in any order — 3 + 5 is the same as 5 + 3.'
      ],
      workedExamples: _l31Examples,
      quizBank: _l31QuizBank,
      diagnostics: {
        commonDistractors: [
          { value: 'off_by_one',         meaning: 'Counted one too many or too few.',                                         errorTag: 'err_off_by_one' },
          { value: 'count_all_wrong',    meaning: 'Lost track of the count or only counted one group.',                       errorTag: 'err_count_all_wrong' },
          { value: 'count_from_smaller', meaning: 'Started counting on from the smaller addend instead of the bigger.',       errorTag: 'err_count_from_smaller' },
          { value: 'add_as_subtract',    meaning: 'Picked the difference instead of the sum.',                                errorTag: 'err_add_as_subtract' },
          { value: 'skip_zero_or_one',   meaning: 'Mishandled +0 (got n+1) or +1 (got n-1 or n).',                            errorTag: 'err_skip_zero_or_one' }
        ],
        errorTags: ['err_off_by_one', 'err_count_all_wrong', 'err_count_from_smaller', 'err_add_as_subtract', 'err_skip_zero_or_one'],
        interventionRules: [
          { errorTag: 'err_off_by_one',         style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_count_all_wrong',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_count_from_smaller', style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_add_as_subtract',    style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_skip_zero_or_one',   style: 'visual_model', followUpRule: 'same_skill_new_numbers' }
        ]
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.2 — Subtract Within 20  ← stub (Phase 3)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l2',
      title: 'Subtract Within 20',
      teks: ['1.3D', '1.3E', '1.5F'],
      skill: 'subtract_within_20',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: []
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.3 — Doubles and Near Doubles  ← stub (Phase 4)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l3',
      title: 'Doubles and Near Doubles',
      teks: ['1.3D', '1.3E', '1.5G'],
      skill: 'doubles_and_near_doubles',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: []
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.4 — Make 10  ← stub (Phase 5)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l4',
      title: 'Make 10',
      teks: ['1.3C', '1.3D', '1.3E'],
      skill: 'make_ten_strategy',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: []
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.5 — Fact Families and Word Problems  ← stub (Phase 6)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l5',
      title: 'Fact Families and Word Problems',
      teks: ['1.3B', '1.3E', '1.3F', '1.5D', '1.5E', '1.5F'],
      skill: 'fact_families_and_word_problems',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: []
    }

  ]
};

export default G1_U3_SPEC;
