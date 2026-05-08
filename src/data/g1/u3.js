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
 *    L3.2  Subtract Within 20                   ← COMPLETE (170 questions)
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

// Plain number-line used for the QUESTION visual. Just ticks + a bold mark at
// the bigger addend (the count-on starting point). No solution annotations —
// the question itself should not visually reveal the answer.
function _l31VisNumberLine(start, count) {
  var min = Math.max(0, start - 1);
  var max = Math.min(20, start + count + 1);
  var ticks = [];
  for (var i = min; i <= max; i++) ticks.push(i);
  return { type: 'numberLine', min: min, max: max, ticks: ticks, mark: start };
}

// Teaching number-line used inside the intervention overlay's "Try it this way"
// panel. Adds the count-on hops as labeled +1 arcs and emphasizes the answer
// tick (endMark). This visual is attached to the intervention via
// teachingVisual; it never appears on the question screen.
//
// Produced directly in renderer-ready {type, config:{...}} form because the
// intervention object is not run through _g1VisToV during merge — it is
// consumed as-is by _buildInterventionContent → _buildVisualHTML.
function _l31TeachingNumberLine(start, count) {
  var min = Math.max(0, start - 1);
  var max = Math.min(20, start + count + 1);
  var ticks = [];
  for (var i = min; i <= max; i++) ticks.push(i);
  var jumps = [];
  for (var j = 0; j < count; j++) {
    jumps.push({ from: start + j, to: start + j + 1, label: '+1' });
  }
  return {
    type: 'numberLine',
    config: {
      min: min, max: max, ticks: ticks, jumps: jumps,
      mark: start,
      endMark: start + count
    }
  };
}

// Rotating emoji pool for visual variety in twoGroups questions
var _l31_EMOJI_POOL = ['⭐', '🍎', '🎈', '🐶', '🍪', '🌸'];
function _l31Emoji(seed) { return _l31_EMOJI_POOL[seed % _l31_EMOJI_POOL.length]; }

// ── Teaching ten-frame builders (intervention "Try it this way" only) ──────
//
// All produce renderer-ready {type, config:{...}} form. Intervention objects
// are not run through _g1VisToV during merge, so the wrapped form is required
// here. None of these visuals are attached to questions — only to interventions.

// "+0" teaching: same N filled, count labels show 1..N, caption reinforces
// that adding 0 doesn't change the count.
function _l31TeachingTenFrameAddZero(n) {
  return {
    type: 'tenFrame',
    config: {
      count: n,
      countLabels: true,
      caption: 'Adding 0 changes nothing — still ' + n + '.'
    }
  };
}

// "+1" teaching: renders count = sum with the new (sum-th) cell highlighted
// green, plus a caption "n + 1 = sum". Only valid when sum <= 10.
function _l31TeachingTenFrameAddOne(n, sum) {
  return {
    type: 'tenFrame',
    config: {
      count: sum,
      highlightFromIdx: n,
      caption: n + ' + 1 = ' + sum
    }
  };
}

// "Fill more" teaching: renders count = a+b with the b new cells highlighted
// green, plus a caption "a + b = sum". Only valid when sum <= 10.
function _l31TeachingTenFrameFill(a, b) {
  return {
    type: 'tenFrame',
    config: {
      count: a + b,
      highlightFromIdx: a,
      caption: a + ' + ' + b + ' = ' + (a + b)
    }
  };
}

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
    correctAnswerExplanation: 'Counting on from ' + bigger + ' gives ' + sum + '.',
    // Instructional visual rendered only inside the intervention's
    // "Try it this way" panel — never on the question screen.
    teachingVisual: _l31TeachingNumberLine(bigger, smaller)
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
  var intervention = _l31IntAddZero(nonZero);
  // Attach a guided ten-frame for the "Try it this way" panel when the count
  // fits in a single ten-frame.
  if (nonZero <= 10) intervention.teachingVisual = _l31TeachingTenFrameAddZero(nonZero);
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
    intervention: intervention
  });
}

function _l31MkAddOneQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var nonOne = a === 1 ? b : a;
  var intervention = _l31IntAddOne(nonOne, sum);
  // Teaching frame fits only when the result is at most 10 cells.
  if (sum <= 10) intervention.teachingVisual = _l31TeachingTenFrameAddOne(nonOne, sum);
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
    intervention: intervention
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
  var intervention = _l31IntCountAll(a, b, sum);
  // Teaching frame fits only when the result is at most 10 cells.
  if (sum <= 10) intervention.teachingVisual = _l31TeachingTenFrameFill(a, b);
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
    intervention: intervention
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
//  Lesson 3.2 — Subtract Within 20 — helpers, intervention templates, quizBank
//  Skill: subtract_within_20 · TEKS 1.3D, 1.3E (supporting 1.5F)
//  Target: 170 questions (55 easy / 70 medium / 45 hard)
// ════════════════════════════════════════════════════════════════════════════

function _l32Q(n, o) {
  return {
    id: 'g1-u3-l2-q-' + String(n).padStart(3, '0'),
    teks: ['1.3D', '1.3E', '1.5F'],
    lessonId: 'g1-u3-l2',
    skill: 'subtract_within_20',
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

// ── Visual builders (question side — clean, no solution annotations) ────────

function _l32VisTenFrame(n) { return { type: 'tenFrame', count: n }; }

function _l32VisTwoGroupsSubtract(a, b, emoji) {
  return {
    type: 'twoGroups',
    config: {
      leftCount: a, leftObj: emoji || '⭐',
      rightCount: b, rightObj: emoji || '⭐',
      op: 'subtract'
    }
  };
}

// Plain number-line for count-back questions: ticks span min..start, mark at
// the minuend. No backward jumps on the question side — those go in the
// teaching visual only.
function _l32VisNumberLine(start, count) {
  var min = Math.max(0, start - count - 1);
  var max = Math.min(20, start + 1);
  var ticks = [];
  for (var i = min; i <= max; i++) ticks.push(i);
  return { type: 'numberLine', min: min, max: max, ticks: ticks, mark: start };
}

function _l32VisObjectSet(n, emoji) {
  return { type: 'objectSet', count: n, layout: 'rows', emoji: emoji || '⭐' };
}

var _l32_EMOJI_POOL = ['🍎', '🍪', '🐶', '⭐', '🎈', '🌸'];
function _l32Emoji(seed) { return _l32_EMOJI_POOL[seed % _l32_EMOJI_POOL.length]; }

// ── Teaching visuals (intervention "Try it this way" only) ─────────────────
//
// Renderer-ready {type, config:{...}} form because intervention objects are
// not run through _g1VisToV during merge — they are consumed as-is by
// _buildInterventionContent → _buildVisualHTML.

function _l32TeachingTenFrameSubZero(n) {
  return {
    type: 'tenFrame',
    config: {
      count: n,
      countLabels: true,
      caption: "Subtracting 0 changes nothing — still " + n + "."
    }
  };
}

function _l32TeachingTenFrameSubOne(n, diff) {
  return {
    type: 'tenFrame',
    config: {
      count: diff,
      caption: n + " − 1 = " + diff + " (one less)."
    }
  };
}

function _l32TeachingTenFrameRemove(a, b) {
  // Show the result count + caption explaining what was removed.
  return {
    type: 'tenFrame',
    config: {
      count: a - b,
      caption: a + " − " + b + " = " + (a - b) + " left."
    }
  };
}

// Backward-jump number line: arcs go from start → start-1 → … → start-count.
// Use −1 labels for short jumps; drop labels for longer jumps to avoid clutter.
function _l32TeachingNumberLineBack(start, count) {
  var min = Math.max(0, start - count - 1);
  var max = Math.min(20, start + 1);
  var ticks = [];
  for (var i = min; i <= max; i++) ticks.push(i);
  var jumps = [];
  var includeLabels = count <= 4;
  for (var j = 0; j < count; j++) {
    var jump = { from: start - j, to: start - j - 1 };
    if (includeLabels) jump.label = '−1';
    jumps.push(jump);
  }
  return {
    type: 'numberLine',
    config: {
      min: min, max: max, ticks: ticks, jumps: jumps,
      mark: start,
      endMark: start - count
    }
  };
}

// objectSet teaching for take-away: cross out the LAST `removed` items, with caption.
function _l32TeachingObjectSetTakeAway(total, removed, emoji) {
  return {
    type: 'objectSet',
    config: {
      count: total,
      emoji: emoji || '⭐',
      layout: 'rows',
      crossedFromIdx: total - removed,
      caption: total + " − " + removed + " = " + (total - removed) + " left."
    }
  };
}

// objectSet teaching for subtract-all: cross out ALL items.
function _l32TeachingSubtractAll(n, emoji) {
  return {
    type: 'objectSet',
    config: {
      count: n,
      emoji: emoji || '⭐',
      layout: 'rows',
      crossedFromIdx: 0,
      caption: "Take away all " + n + " → 0 left."
    }
  };
}

// ── Intervention templates (one per error tag, parameterised) ──────────────

function _l32IntCountBack(a, b, diff) {
  var steps = [];
  var s = a;
  for (var k = 0; k < b; k++) { s--; steps.push(s); }
  return {
    errorTag: 'err_count_back_wrong',
    title: 'Start at the first number and count back',
    teachingSteps: [
      'Start at the first number: ' + a + '.',
      'Count back ' + b + ': ' + steps.join(', ') + '.',
      a + ' − ' + b + ' = ' + diff + '.'
    ],
    correctAnswerExplanation: 'Counting back from ' + a + ' gives ' + diff + '.'
  };
}

function _l32IntTakeAway(a, b, diff) {
  return {
    errorTag: 'err_takeaway_wrong',
    title: 'Take away to find what is left',
    teachingSteps: [
      'Start with ' + a + '.',
      'Take away ' + b + '. Cross them out.',
      a + ' − ' + b + ' = ' + diff + ' left.'
    ],
    correctAnswerExplanation: 'Starting with ' + a + ' and taking away ' + b + ' leaves ' + diff + '.'
  };
}

function _l32IntSubtractZero(n) {
  return {
    errorTag: 'err_subtract_zero_or_one',
    title: "Subtracting 0 doesn't change the number",
    teachingSteps: [
      'Zero means nothing was taken away.',
      n + ' stays the same: ' + n + ' − 0 = ' + n + '.',
      'Any number minus 0 is the same number.'
    ],
    correctAnswerExplanation: n + ' − 0 = ' + n + '.'
  };
}

function _l32IntSubtractOne(n, diff) {
  return {
    errorTag: 'err_subtract_zero_or_one',
    title: 'Subtracting 1 means one less',
    teachingSteps: [
      'Subtracting 1 gives the number just before ' + n + '.',
      'One less than ' + n + ' is ' + diff + '.',
      n + ' − 1 = ' + diff + '.'
    ],
    correctAnswerExplanation: 'One less than ' + n + ' is ' + diff + '.'
  };
}

function _l32IntSubtractAll(n) {
  return {
    errorTag: 'err_subtract_all_confusion',
    title: 'Take away all leaves nothing',
    teachingSteps: [
      'Start with ' + n + '.',
      'Take away all ' + n + ' of them.',
      'Nothing is left: ' + n + ' − ' + n + ' = 0.'
    ],
    correctAnswerExplanation: 'Taking all ' + n + ' away leaves 0.'
  };
}

function _l32IntStrategyChoice(a, b) {
  return {
    errorTag: 'err_start_number_confusion',
    title: 'Start with the first number',
    teachingSteps: [
      'In subtraction, the first number is what you have.',
      'For ' + a + ' − ' + b + ', start at ' + a + '.',
      'Then count back ' + b + '.'
    ],
    correctAnswerExplanation: 'Start at ' + a + ' (the first number) and count back ' + b + '.'
  };
}

// ── Question builders per category ─────────────────────────────────────────

function _l32MkSubZeroQ(n, opts) {
  var a = opts.a, diff = a;
  var intervention = _l32IntSubtractZero(a);
  if (a <= 10) intervention.teachingVisual = _l32TeachingTenFrameSubZero(a);
  return _l32Q(n, {
    difficulty: 'easy',
    subSkill: 'subtract_zero',
    keyIdea: "Subtracting 0 doesn't change the number.",
    prompt: a + ' − 0 = ?',
    visual: a <= 10 ? _l32VisTenFrame(a) : null,
    answer: String(diff),
    choices: [
      { value: String(diff),     correct: true },
      { value: String(diff - 1), correct: false, errorTag: 'err_subtract_zero_or_one', misconceptionExplanation: 'Student subtracted 1 instead of 0.' },
      { value: '0',              correct: false, errorTag: 'err_subtract_all_confusion', misconceptionExplanation: 'Student saw the 0 and ignored the first number.' }
    ],
    hint: 'Subtracting 0 keeps the number the same.',
    intervention: intervention
  });
}

function _l32MkSubOneQ(n, opts) {
  var a = opts.a, diff = a - 1;
  var intervention = _l32IntSubtractOne(a, diff);
  if (a <= 10) intervention.teachingVisual = _l32TeachingTenFrameSubOne(a, diff);
  return _l32Q(n, {
    difficulty: 'easy',
    subSkill: 'subtract_one',
    keyIdea: 'Subtracting 1 means one less.',
    prompt: a + ' − 1 = ?',
    visual: a <= 10 ? _l32VisTenFrame(a) : null,
    answer: String(diff),
    choices: [
      { value: String(diff),     correct: true },
      { value: String(a),        correct: false, errorTag: 'err_subtract_zero_or_one', misconceptionExplanation: 'Student forgot to subtract 1.' },
      { value: String(diff - 1), correct: false, errorTag: 'err_off_by_one',           misconceptionExplanation: 'Student subtracted 2 instead of 1.' }
    ],
    hint: 'One less than ' + a + '.',
    intervention: intervention
  });
}

function _l32MkTakeAwayQ(n, opts) {
  var a = opts.a, b = opts.b, diff = a - b;
  var emoji = _l32Emoji(n);
  var intervention = _l32IntTakeAway(a, b, diff);
  intervention.teachingVisual = _l32TeachingObjectSetTakeAway(a, b, emoji);
  return _l32Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: 'take_away_objects',
    keyIdea: 'Take away to find what is left.',
    prompt: 'Start with ' + a + '. Take away ' + b + '. How many are left?',
    visual: _l32VisTwoGroupsSubtract(a, b, emoji),
    answer: String(diff),
    choices: [
      { value: String(diff),     correct: true },
      { value: String(diff - 1), correct: false, errorTag: 'err_off_by_one',         misconceptionExplanation: 'Student counted one too few.' },
      { value: String(diff + 1), correct: false, errorTag: 'err_off_by_one',         misconceptionExplanation: 'Student counted one too many.' },
      { value: String(a + b),    correct: false, errorTag: 'err_subtract_as_add',    misconceptionExplanation: 'Student added instead of subtracted.' }
    ],
    hint: 'Cross out ' + b + ', then count what is left.',
    intervention: intervention
  });
}

function _l32MkCountBackQ(n, opts) {
  var a = opts.a, b = opts.b, diff = a - b;
  var intervention = _l32IntCountBack(a, b, diff);
  intervention.teachingVisual = _l32TeachingNumberLineBack(a, b);
  return _l32Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: 'count_back_from_minuend',
    keyIdea: 'Start at the first number and count back.',
    prompt: 'Use the number line. ' + a + ' − ' + b + ' = ?',
    visual: _l32VisNumberLine(a, b),
    answer: String(diff),
    choices: [
      { value: String(diff),     correct: true },
      { value: String(diff - 1), correct: false, errorTag: 'err_off_by_one',           misconceptionExplanation: 'Student counted one too far back.' },
      { value: String(diff + 1), correct: false, errorTag: 'err_off_by_one',           misconceptionExplanation: 'Student didn\'t count back far enough.' },
      { value: String(a),        correct: false, errorTag: 'err_count_back_wrong',     misconceptionExplanation: 'Student forgot to count back at all.' }
    ],
    hint: 'Start at ' + a + '. Count back ' + b + ' steps.',
    intervention: intervention
  });
}

function _l32MkTenFrameRemoveQ(n, opts) {
  var a = opts.a, b = opts.b, diff = a - b;
  var intervention = _l32IntTakeAway(a, b, diff);
  intervention.teachingVisual = _l32TeachingTenFrameRemove(a, b);
  return _l32Q(n, {
    difficulty: 'medium',
    subSkill: 'take_away_objects',
    keyIdea: 'Cross out the dots being taken away to see what is left.',
    prompt: 'The ten-frame shows ' + a + '. Take away ' + b + '. How many are left?',
    visual: _l32VisTenFrame(a),
    answer: String(diff),
    choices: [
      { value: String(diff),     correct: true },
      { value: String(diff - 1), correct: false, errorTag: 'err_off_by_one',     misconceptionExplanation: 'Student counted one too few left.' },
      { value: String(diff + 1), correct: false, errorTag: 'err_off_by_one',     misconceptionExplanation: 'Student counted one too many left.' },
      { value: String(a),        correct: false, errorTag: 'err_takeaway_wrong', misconceptionExplanation: 'Student forgot to take any away.' }
    ],
    hint: 'Imagine crossing out ' + b + ' dots. Count what stays.',
    intervention: intervention
  });
}

function _l32MkSubAllQ(n, opts) {
  var a = opts.a;
  var emoji = _l32Emoji(n);
  var intervention = _l32IntSubtractAll(a);
  intervention.teachingVisual = _l32TeachingSubtractAll(a, emoji);
  return _l32Q(n, {
    difficulty: 'medium',
    subSkill: 'subtract_all',
    keyIdea: 'Take away all leaves 0.',
    prompt: a + ' − ' + a + ' = ?',
    visual: _l32VisObjectSet(a, emoji),
    answer: '0',
    choices: [
      { value: '0',       correct: true },
      { value: String(a), correct: false, errorTag: 'err_subtract_all_confusion', misconceptionExplanation: 'Student kept the original number instead of taking it all away.' },
      { value: '1',       correct: false, errorTag: 'err_off_by_one',             misconceptionExplanation: 'Student left 1 by mistake.' }
    ],
    hint: 'Take away every single one. How many are left?',
    intervention: intervention
  });
}

function _l32MkAbstractQ(n, opts) {
  var a = opts.a, b = opts.b, diff = a - b;
  var seen = {}; seen[diff] = true;
  var distractors = [];
  function add(val, tag, me) {
    if (val < 0) return;
    if (seen[val]) return;
    seen[val] = true;
    distractors.push({ value: String(val), correct: false, errorTag: tag, misconceptionExplanation: me });
  }
  add(diff - 1, 'err_off_by_one',       'Student counted one too far back.');
  add(diff + 1, 'err_off_by_one',       "Student didn't count back far enough.");
  add(a + b,    'err_subtract_as_add',  'Student added instead of subtracted.');
  if (distractors.length < 3) add(diff + 2, 'err_count_back_wrong',      'Student lost count.');
  if (distractors.length < 3) add(b,        'err_start_number_confusion', 'Student picked the second number instead.');
  if (distractors.length < 3) add(a,        'err_count_back_wrong',      'Student forgot to count back at all.');
  return _l32Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: opts.subSkill || 'subtract_to_20',
    keyIdea: opts.keyIdea || 'Start at the first number and count back.',
    prompt: opts.prompt || (a + ' − ' + b + ' = ?'),
    visual: opts.visual || null,
    answer: String(diff),
    choices: [{ value: String(diff), correct: true }].concat(distractors.slice(0, 3)),
    hint: opts.hint || ('Start at ' + a + '. Count back ' + b + '.'),
    intervention: opts.intervention || _l32IntCountBack(a, b, diff)
  });
}

function _l32MkStrategyChoiceQ(n, opts) {
  var a = opts.a, b = opts.b;
  return _l32Q(n, {
    difficulty: 'hard',
    subSkill: 'count_back_from_minuend',
    keyIdea: 'For subtraction, always start at the first number.',
    prompt: 'For ' + a + ' − ' + b + ', which number should you start at to count back?',
    visual: null,
    answer: String(a),
    choices: [
      { value: String(a),     correct: true },
      { value: String(b),     correct: false, errorTag: 'err_start_number_confusion', misconceptionExplanation: 'In subtraction, you start with the first number, not the smaller one.' },
      { value: String(a - b), correct: false, errorTag: 'err_count_back_wrong',       misconceptionExplanation: 'That is the answer, not a starting number.' }
    ],
    hint: 'Pick the first number in the subtraction.',
    intervention: _l32IntStrategyChoice(a, b)
  });
}

// ── Worked examples ────────────────────────────────────────────────────────

const _l32Examples = [
  {
    id: 'g1-u3-l2-ex-001',
    title: 'Example 1: Take Away with Objects',
    prompt: 'Start with 7. Take away 3. How many are left?',
    visual: _l32VisTwoGroupsSubtract(7, 3, '🍪'),
    steps: [
      'Start with 7 cookies.',
      'Take away 3. Cross them out.',
      '7 − 3 = 4 cookies left.'
    ],
    finalAnswer: '4',
    teachingNote: 'Take-away models make subtraction concrete — students can literally cross out and recount.',
    relatedKeyIdea: 'Subtraction means take away. We find what is left.'
  },
  {
    id: 'g1-u3-l2-ex-002',
    title: 'Example 2: Subtracting Zero',
    prompt: 'What is 8 − 0?',
    visual: _l32VisTenFrame(8),
    steps: [
      'Subtracting 0 means nothing was taken away.',
      '8 stays the same.',
      '8 − 0 = 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'Reinforce that 0 is the "do nothing" number for subtraction too.',
    relatedKeyIdea: "Subtracting 0 doesn't change a number."
  },
  {
    id: 'g1-u3-l2-ex-003',
    title: 'Example 3: Subtracting One',
    prompt: 'What is 9 − 1?',
    visual: _l32VisTenFrame(9),
    steps: [
      'Subtracting 1 means one less.',
      'The number just before 9 is 8.',
      '9 − 1 = 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'Connect "−1" to the count sequence — the number just before.',
    relatedKeyIdea: 'Subtracting 1 means one less.'
  },
  {
    id: 'g1-u3-l2-ex-004',
    title: 'Example 4: Count Back on a Number Line',
    prompt: 'What is 12 − 3?',
    visual: _l32VisNumberLine(12, 3),
    steps: [
      'Start at the first number: 12.',
      'Count back 3 steps: 11, 10, 9.',
      '12 − 3 = 9.'
    ],
    finalAnswer: '9',
    teachingNote: 'Show that the number line jumps move LEFT for subtraction.',
    relatedKeyIdea: 'Start at the first number and count back.'
  },
  {
    id: 'g1-u3-l2-ex-005',
    title: 'Example 5: Subtract All',
    prompt: 'What is 6 − 6?',
    visual: _l32VisObjectSet(6, '🍎'),
    steps: [
      'Start with 6 apples.',
      'Take all 6 away.',
      'Nothing is left: 6 − 6 = 0.'
    ],
    finalAnswer: '0',
    teachingNote: 'Zero is a real answer — emphasise that "nothing left" is a valid amount.',
    relatedKeyIdea: 'Subtracting a number from itself leaves 0.'
  },
  {
    id: 'g1-u3-l2-ex-006',
    title: 'Example 6: Past Ten',
    prompt: 'What is 15 − 5?',
    visual: _l32VisNumberLine(15, 5),
    steps: [
      'Start at 15.',
      'Count back 5 steps: 14, 13, 12, 11, 10.',
      '15 − 5 = 10.'
    ],
    finalAnswer: '10',
    teachingNote: 'Counting back past 10 follows the same pattern as within 10.',
    relatedKeyIdea: 'Count back works for any first number up to 20.'
  }
];

// ── Question data (170 tuples) ─────────────────────────────────────────────

// EASY 55: E1 sub-zero (12), E2 sub-one (12), E3 take-away result≤5 (16), E4 count-back result≤9 (15)
var _l32_E1 = [5, 8, 10, 3, 12, 7, 15, 2, 9, 11, 6, 14];
var _l32_E2 = [6, 9, 12, 4, 7, 10, 3, 11, 5, 8, 14, 13];
var _l32_E3 = [
  [5,2], [6,3], [7,3], [4,2], [8,4], [5,3], [6,2], [7,4],
  [8,5], [9,5], [10,5], [9,6], [8,6], [10,6], [7,2], [10,7]
];
var _l32_E4 = [
  [7,2], [8,3], [9,4], [10,3], [11,2], [10,4], [9,3], [8,2],
  [11,3], [12,3], [10,2], [9,2], [11,4], [12,4], [10,5]
];

// MEDIUM 70: M1 take-away (15), M2 count-back 11-15 (20), M3 tenFrame-remove (10),
//            M4 subtract-all (10), M5 abstract within 10 (15)
var _l32_M1 = [
  [10,3], [11,4], [12,5], [13,6], [10,4], [11,5], [12,4], [13,5],
  [14,6], [11,3], [12,3], [13,4], [14,5], [15,5], [12,2]
];
var _l32_M2 = [
  [11,3], [12,4], [13,5], [14,6], [15,7], [11,4], [12,5], [13,6],
  [14,7], [15,8], [11,5], [12,6], [13,7], [14,8], [15,9],
  [11,6], [12,7], [13,8], [14,9], [15,10]
];
var _l32_M3 = [
  [10,3], [9,2], [10,4], [8,3], [10,5], [9,4], [8,2], [7,3], [10,2], [9,3]
];
var _l32_M4 = [4, 5, 6, 7, 8, 9, 10, 12, 14, 15];
var _l32_M5 = [
  [6,2], [7,3], [8,3], [9,4], [10,3], [9,2], [8,2], [10,4],
  [7,4], [9,5], [10,5], [8,5], [10,2], [9,3], [10,7]
];

// HARD 45: H1 count-back 16-20 (15), H2 strategy-choice (5), H3 close-difference (5), H4 mixed 11-20 (20)
var _l32_H1 = [
  [16,3], [17,4], [18,5], [19,6], [20,7], [16,4], [17,5], [18,6],
  [19,7], [20,8], [16,5], [17,6], [18,7], [19,8], [20,9]
];
var _l32_H2 = [
  [13,2], [15,4], [17,3], [12,5], [18,6]
];
var _l32_H3 = [
  [11,9], [13,11], [14,11], [12,9], [13,10]
];
var _l32_H4 = [
  [12,5], [13,4], [14,7], [15,6], [16,8], [17,9], [18,9], [19,10],
  [11,8], [13,8], [15,9], [17,8], [18,11], [19,12], [20,11],
  [16,9], [14,5], [12,8], [16,10], [20,15]
];

// ── Bank assembly ──────────────────────────────────────────────────────────

var _l32QuizBank = [];
var _l32N = 0;

// Easy
_l32_E1.forEach(function(a) { _l32N++; _l32QuizBank.push(_l32MkSubZeroQ(_l32N, { a: a })); });
_l32_E2.forEach(function(a) { _l32N++; _l32QuizBank.push(_l32MkSubOneQ(_l32N,  { a: a })); });
_l32_E3.forEach(function(t) { _l32N++; _l32QuizBank.push(_l32MkTakeAwayQ(_l32N, { a: t[0], b: t[1], difficulty: 'easy' })); });
_l32_E4.forEach(function(t) { _l32N++; _l32QuizBank.push(_l32MkCountBackQ(_l32N, { a: t[0], b: t[1], difficulty: 'easy' })); });

// Medium
_l32_M1.forEach(function(t) { _l32N++; _l32QuizBank.push(_l32MkTakeAwayQ(_l32N, { a: t[0], b: t[1], difficulty: 'medium' })); });
_l32_M2.forEach(function(t) { _l32N++; _l32QuizBank.push(_l32MkCountBackQ(_l32N, { a: t[0], b: t[1], difficulty: 'medium' })); });
_l32_M3.forEach(function(t) { _l32N++; _l32QuizBank.push(_l32MkTenFrameRemoveQ(_l32N, { a: t[0], b: t[1] })); });
_l32_M4.forEach(function(a) { _l32N++; _l32QuizBank.push(_l32MkSubAllQ(_l32N, { a: a })); });
_l32_M5.forEach(function(t) {
  _l32N++;
  _l32QuizBank.push(_l32MkAbstractQ(_l32N, {
    a: t[0], b: t[1], difficulty: 'medium', subSkill: 'subtract_within_10'
  }));
});

// Hard
_l32_H1.forEach(function(t) {
  _l32N++;
  _l32QuizBank.push(_l32MkAbstractQ(_l32N, {
    a: t[0], b: t[1], difficulty: 'hard', subSkill: 'count_back_from_minuend',
    prompt: 'Use counting back: ' + t[0] + ' − ' + t[1] + ' = ?'
  }));
});
_l32_H2.forEach(function(t) { _l32N++; _l32QuizBank.push(_l32MkStrategyChoiceQ(_l32N, { a: t[0], b: t[1] })); });
_l32_H3.forEach(function(t) {
  _l32N++;
  _l32QuizBank.push(_l32MkAbstractQ(_l32N, {
    a: t[0], b: t[1], difficulty: 'hard', subSkill: 'subtract_to_20',
    hint: 'The numbers are close — find the difference carefully.'
  }));
});
_l32_H4.forEach(function(t) {
  _l32N++;
  _l32QuizBank.push(_l32MkAbstractQ(_l32N, {
    a: t[0], b: t[1], difficulty: 'hard', subSkill: 'subtract_to_20'
  }));
});

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 3.3 — Doubles and Near Doubles — helpers, intervention templates, quizBank
//  Skill: doubles_and_near_doubles · TEKS 1.3D, 1.3E (supporting 1.5G)
//  Target: 165 questions (50 easy / 70 medium / 45 hard)
// ════════════════════════════════════════════════════════════════════════════

function _l33Q(n, o) {
  return {
    id: 'g1-u3-l3-q-' + String(n).padStart(3, '0'),
    teks: ['1.3D', '1.3E', '1.5G'],
    lessonId: 'g1-u3-l3',
    skill: 'doubles_and_near_doubles',
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

// ── Visual builders (question side — clean, no solution annotations) ────────

function _l33VisTwoGroups(a, b, emoji) {
  return {
    type: 'twoGroups',
    config: {
      leftCount: a, leftObj: emoji || '⭐',
      rightCount: b, rightObj: emoji || '⭐',
      op: 'add'
    }
  };
}

var _l33_EMOJI_POOL = ['🍎', '🍪', '🐶', '⭐', '🎈', '🌸'];
function _l33Emoji(seed) { return _l33_EMOJI_POOL[seed % _l33_EMOJI_POOL.length]; }

// ── Teaching visuals (intervention "Try it this way" only) ─────────────────
//
// Renderer-ready {type, config:{...}} form. Used in q.i.teachingVisual.

function _l33TeachingDouble(a, sum, emoji) {
  return {
    type: 'twoGroups',
    config: {
      leftCount: a, leftObj: emoji || '⭐',
      rightCount: a, rightObj: emoji || '⭐',
      op: 'add',
      caption: 'Both groups have ' + a + '. ' + a + ' + ' + a + ' = ' + sum + '.'
    }
  };
}

function _l33TeachingNearDouble(a, b, sum, emoji) {
  // a + b is a near double where |a - b| = 1. The teaching visual shows the
  // UNDERLYING DOUBLE (smaller + smaller) — that's the "anchor" the kid uses
  // to derive the near-double answer. Caption then explains "+1 more = sum",
  // matching the user-specified rule: top = original question, bottom = the
  // double, then one more.
  var smaller = a < b ? a : b;
  var doubleSum = smaller * 2;
  return {
    type: 'twoGroups',
    config: {
      leftCount: smaller, leftObj: emoji || '⭐',
      rightCount: smaller, rightObj: emoji || '⭐',
      op: 'add',
      caption: smaller + ' + ' + smaller + ' = ' + doubleSum + '. Add 1 more for ' + a + ' + ' + b + ' = ' + sum + '.'
    }
  };
}

function _l33TeachingMissingDouble(a, sum, emoji) {
  return {
    type: 'twoGroups',
    config: {
      leftCount: a, leftObj: emoji || '⭐',
      rightCount: a, rightObj: emoji || '⭐',
      op: 'add',
      caption: 'A double has two equal addends. ' + a + ' + ' + a + ' = ' + sum + '.'
    }
  };
}

function _l33TeachingMissingNearDouble(a, missing, sum, emoji) {
  return {
    type: 'twoGroups',
    config: {
      leftCount: a, leftObj: emoji || '⭐',
      rightCount: missing, rightObj: emoji || '⭐',
      op: 'add',
      caption: a + ' + ' + missing + ' = ' + sum + ' (' + (missing > a ? 'one more' : 'one less') + ' than ' + a + ' + ' + a + ' = ' + (a*2) + ').'
    }
  };
}

// ── Intervention templates (one per error tag, parameterised) ──────────────

function _l33IntDouble(a, sum) {
  return {
    errorTag: 'err_double_fact_recall',
    title: 'A double has two equal addends',
    teachingSteps: [
      'A double adds the same number twice.',
      a + ' + ' + a + ' means two groups of ' + a + '.',
      a + ' + ' + a + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'Both groups have ' + a + ', so ' + a + ' + ' + a + ' = ' + sum + '.'
  };
}

function _l33IntNearDouble(a, b, sum) {
  var smaller = a < b ? a : b;
  var doubleSum = smaller * 2;
  return {
    errorTag: 'err_near_double_off_by_one',
    title: 'A near double is one more than a double',
    teachingSteps: [
      a + ' and ' + b + ' are one apart, so this is a near double.',
      'Start with the smaller double: ' + smaller + ' + ' + smaller + ' = ' + doubleSum + '.',
      'Add 1 more: ' + doubleSum + ' + 1 = ' + sum + '. So ' + a + ' + ' + b + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: a + ' + ' + b + ' is one more than ' + smaller + ' + ' + smaller + ', so ' + a + ' + ' + b + ' = ' + sum + '.'
  };
}

function _l33IntUseKnownDouble(knownAddend, knownSum, targetA, targetB, targetSum) {
  // targetA + targetB where one of them = knownAddend, and the other = knownAddend +/- 1
  var smaller = targetA < targetB ? targetA : targetB;
  var diffFromKnown = targetSum - knownSum;
  var direction = diffFromKnown > 0 ? 'one more' : 'one less';
  return {
    errorTag: 'err_used_wrong_double',
    title: 'Use the known double, then add or subtract 1',
    teachingSteps: [
      'You know ' + knownAddend + ' + ' + knownAddend + ' = ' + knownSum + '.',
      targetA + ' + ' + targetB + ' is ' + direction + ' than that double.',
      knownSum + ' ' + (diffFromKnown > 0 ? '+' : '−') + ' 1 = ' + targetSum + '. So ' + targetA + ' + ' + targetB + ' = ' + targetSum + '.'
    ],
    correctAnswerExplanation: targetA + ' + ' + targetB + ' is ' + direction + ' than ' + knownAddend + ' + ' + knownAddend + ' = ' + knownSum + ', so ' + targetA + ' + ' + targetB + ' = ' + targetSum + '.'
  };
}

function _l33IntMissingAddendDouble(a, sum) {
  return {
    errorTag: 'err_missing_addend_confusion',
    title: 'For a double, both addends are the same',
    teachingSteps: [
      'A double has two equal addends.',
      'The first addend is ' + a + ', so the missing addend must also be ' + a + '.',
      a + ' + ' + a + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'For ' + a + ' + ? = ' + sum + ', the missing number is ' + a + ' (because ' + a + ' + ' + a + ' = ' + sum + ').'
  };
}

function _l33IntMissingAddendNearDouble(a, missing, sum) {
  var direction = missing > a ? 'one more' : 'one less';
  return {
    errorTag: 'err_missing_addend_confusion',
    title: 'For a near double, the addends are one apart',
    teachingSteps: [
      'The first addend is ' + a + '.',
      a + ' + ' + a + ' = ' + (a*2) + ' (the double).',
      'The sum is ' + sum + ', which is ' + direction + ' than ' + (a*2) + '.',
      'So the missing addend is ' + missing + '.'
    ],
    correctAnswerExplanation: a + ' + ' + missing + ' = ' + sum + ' (' + direction + ' than ' + a + ' + ' + a + ').'
  };
}

function _l33IntStrategyChoiceDouble(a, b) {
  // b = a + 1 (a is the smaller). The "one less" double is a+a.
  var sum = a + b;
  var doubleSum = a * 2;
  return {
    errorTag: 'err_used_wrong_double',
    title: 'The double of the smaller addend is one less',
    teachingSteps: [
      'For ' + a + ' + ' + b + ', the smaller addend is ' + a + '.',
      a + ' + ' + a + ' = ' + doubleSum + '.',
      doubleSum + ' is one less than ' + sum + '. So the double that is one less is ' + a + ' + ' + a + '.'
    ],
    correctAnswerExplanation: a + ' + ' + a + ' = ' + doubleSum + ', which is one less than ' + a + ' + ' + b + ' = ' + sum + '.'
  };
}

function _l33IntIdentifyDouble() {
  return {
    errorTag: 'err_double_fact_recall',
    title: 'A double has two equal addends',
    teachingSteps: [
      'In a double, both numbers are the same.',
      'Look for an addition fact like 3 + 3, 5 + 5, or 7 + 7.',
      'If the two addends are different, it is not a double.'
    ],
    correctAnswerExplanation: 'A double is an addition fact where both addends match.'
  };
}

function _l33IntIdentifyNearDouble() {
  return {
    errorTag: 'err_double_fact_recall',
    title: 'A near double has addends one apart',
    teachingSteps: [
      'A near double is almost a double — the addends differ by 1.',
      'Look for facts like 3 + 4, 5 + 6, or 8 + 9.',
      'If the addends are equal, it is a double, not a near double.'
    ],
    correctAnswerExplanation: 'A near double has two addends that differ by exactly 1.'
  };
}

// ── Question builders per category ─────────────────────────────────────────

// E1, E3, E4, M1: basic doubles (a + a = ?)
function _l33MkDoubleQ(n, opts) {
  var a = opts.a, sum = a * 2;
  var emoji = _l33Emoji(n);
  var intervention = _l33IntDouble(a, sum);
  if (opts.visual !== false) intervention.teachingVisual = _l33TeachingDouble(a, sum, emoji);
  return _l33Q(n, {
    difficulty: opts.difficulty || 'easy',
    subSkill: 'recall_double_fact',
    keyIdea: 'A double adds the same number twice.',
    prompt: a + ' + ' + a + ' = ?',
    visual: opts.visual === false ? null : _l33VisTwoGroups(a, a, emoji),
    answer: String(sum),
    choices: [
      { value: String(sum),     correct: true },
      { value: String(sum - 1), correct: false, errorTag: 'err_double_fact_recall', misconceptionExplanation: 'Off by one — recheck the count.' },
      { value: String(sum + 1), correct: false, errorTag: 'err_double_fact_recall', misconceptionExplanation: 'Off by one — recheck the count.' },
      { value: String(a),       correct: false, errorTag: 'err_count_all_wrong',    misconceptionExplanation: 'Student counted only one group.' }
    ],
    hint: 'Add ' + a + ' twice.',
    intervention: intervention
  });
}

// E2: identify a double from a set
function _l33MkRecognizeDoubleQ(n, opts) {
  // opts: { doubleAddend, distractor1: [a,b], distractor2: [a,b] }
  var d = opts.doubleAddend;
  var correct = d + ' + ' + d;
  var dist1 = opts.distractor1[0] + ' + ' + opts.distractor1[1];
  var dist2 = opts.distractor2[0] + ' + ' + opts.distractor2[1];
  return _l33Q(n, {
    difficulty: 'easy',
    subSkill: 'identify_double',
    keyIdea: 'A double has two equal addends.',
    prompt: 'Which one is a double?',
    visual: null,
    answer: correct,
    choices: [
      { value: correct, correct: true },
      { value: dist1,   correct: false, errorTag: 'err_double_fact_recall', misconceptionExplanation: 'The addends are different — not a double.' },
      { value: dist2,   correct: false, errorTag: 'err_double_fact_recall', misconceptionExplanation: 'The addends are different — not a double.' }
    ],
    hint: 'Look for two matching addends.',
    intervention: _l33IntIdentifyDouble()
  });
}

// E5, M2, M3: near double abstract or with twoGroups visual (a + b where |a-b|=1)
function _l33MkNearDoubleQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var emoji = _l33Emoji(n);
  var intervention = _l33IntNearDouble(a, b, sum);
  if (opts.visual !== false) intervention.teachingVisual = _l33TeachingNearDouble(a, b, sum, emoji);
  var smaller = a < b ? a : b;
  return _l33Q(n, {
    difficulty: opts.difficulty || 'medium',
    subSkill: a < b ? 'near_double_one_more' : 'near_double_one_less',
    keyIdea: 'A near double is one more than a double.',
    prompt: a + ' + ' + b + ' = ?',
    visual: opts.visual === false ? null : _l33VisTwoGroups(a, b, emoji),
    answer: String(sum),
    choices: [
      { value: String(sum),         correct: true },
      { value: String(smaller * 2), correct: false, errorTag: 'err_near_double_off_by_one', misconceptionExplanation: 'Student gave the smaller double — forgot to add 1.' },
      { value: String(sum + 1),     correct: false, errorTag: 'err_off_by_one',             misconceptionExplanation: 'Off by one — too high.' },
      { value: String(sum - 2),     correct: false, errorTag: 'err_near_double_off_by_one', misconceptionExplanation: 'Subtracted instead of adding 1.' }
    ],
    hint: 'Use ' + smaller + ' + ' + smaller + ' = ' + (smaller*2) + ', then add 1.',
    intervention: intervention
  });
}

// M4: use known double to solve near double
function _l33MkUseKnownDoubleQ(n, opts) {
  // opts: { knownAddend, targetA, targetB }  where targetA or targetB = knownAddend
  var ka = opts.knownAddend, ta = opts.targetA, tb = opts.targetB;
  var ks = ka * 2;
  var ts = ta + tb;
  var diff = ts - ks;  // typically +1 or -1
  return _l33Q(n, {
    difficulty: 'medium',
    subSkill: 'use_double_to_solve',
    keyIdea: 'Use a known double, then add 1 or subtract 1.',
    prompt: ka + ' + ' + ka + ' = ' + ks + '. So ' + ta + ' + ' + tb + ' = ?',
    visual: null,
    answer: String(ts),
    choices: [
      { value: String(ts),     correct: true },
      { value: String(ks),     correct: false, errorTag: 'err_used_wrong_double',     misconceptionExplanation: 'Student gave the known double, not the near double.' },
      { value: String(ts + 1), correct: false, errorTag: 'err_off_by_one',            misconceptionExplanation: 'Added too much.' },
      { value: String(ts - 2), correct: false, errorTag: 'err_near_double_off_by_one', misconceptionExplanation: 'Went the wrong direction from the known double.' }
    ],
    hint: 'You know ' + ka + ' + ' + ka + ' = ' + ks + '. Now ' + (diff > 0 ? 'add' : 'subtract') + ' 1.',
    intervention: _l33IntUseKnownDouble(ka, ks, ta, tb, ts)
  });
}

// M5: identify a near double from a set
function _l33MkRecognizeNearDoubleQ(n, opts) {
  // opts: { nearDoublePair: [a,b], distractor1: [a,b], distractor2: [a,b] }
  var nd = opts.nearDoublePair;
  var correct = nd[0] + ' + ' + nd[1];
  var dist1 = opts.distractor1[0] + ' + ' + opts.distractor1[1];
  var dist2 = opts.distractor2[0] + ' + ' + opts.distractor2[1];
  return _l33Q(n, {
    difficulty: 'medium',
    subSkill: 'identify_near_double',
    keyIdea: 'A near double has addends that are one apart.',
    prompt: 'Which one is a near double?',
    visual: null,
    answer: correct,
    choices: [
      { value: correct, correct: true },
      { value: dist1,   correct: false, errorTag: 'err_double_fact_recall', misconceptionExplanation: 'Not a near double — addends are not one apart.' },
      { value: dist2,   correct: false, errorTag: 'err_double_fact_recall', misconceptionExplanation: 'Not a near double — addends are not one apart.' }
    ],
    hint: 'Look for two addends that differ by exactly 1.',
    intervention: _l33IntIdentifyNearDouble()
  });
}

// M6: missing addend in a double (a + ? = sum where sum = 2a)
function _l33MkMissingDoubleQ(n, opts) {
  var a = opts.a, sum = a * 2;
  var emoji = _l33Emoji(n);
  var intervention = _l33IntMissingAddendDouble(a, sum);
  intervention.teachingVisual = _l33TeachingMissingDouble(a, sum, emoji);
  return _l33Q(n, {
    difficulty: 'medium',
    subSkill: 'missing_addend_double',
    keyIdea: 'A double has two equal addends.',
    prompt: a + ' + ? = ' + sum,
    visual: null,
    answer: String(a),
    choices: [
      { value: String(a),     correct: true },
      { value: String(a + 1), correct: false, errorTag: 'err_near_double_off_by_one', misconceptionExplanation: 'That would make a near double, not a double.' },
      { value: String(a - 1), correct: false, errorTag: 'err_near_double_off_by_one', misconceptionExplanation: 'That would make a near double, not a double.' },
      { value: String(sum),   correct: false, errorTag: 'err_missing_addend_confusion', misconceptionExplanation: 'Student picked the sum instead of the missing addend.' }
    ],
    hint: 'For a double, both addends are the same.',
    intervention: intervention
  });
}

// H2: strategy-choice "Which double is one less than a + b?"
function _l33MkStrategyChoiceQ(n, opts) {
  // opts: { a, b }  where b = a + 1 (a is the smaller). Answer = "a + a"
  var a = opts.a, b = opts.b, sum = a + b;
  var doubleSum = a * 2;
  var correct = a + ' + ' + a;
  var dist1 = b + ' + ' + b;            // one MORE than a+b — wrong direction
  var dist2 = (a-1) + ' + ' + (a-1);    // too far below
  var dist3 = String(sum);              // the sum itself
  return _l33Q(n, {
    difficulty: 'hard',
    subSkill: 'strategy_choice_double',
    keyIdea: 'The double of the smaller addend is one less than the near double.',
    prompt: 'Which double is one less than ' + a + ' + ' + b + '?',
    visual: null,
    answer: correct,
    choices: [
      { value: correct, correct: true },
      { value: dist1,   correct: false, errorTag: 'err_used_wrong_double',     misconceptionExplanation: b + ' + ' + b + ' is one MORE than ' + a + ' + ' + b + ', not one less.' },
      { value: dist2,   correct: false, errorTag: 'err_used_wrong_double',     misconceptionExplanation: 'That double is too far below.' },
      { value: dist3,   correct: false, errorTag: 'err_missing_addend_confusion', misconceptionExplanation: 'That is the sum, not a double.' }
    ],
    hint: 'Pick the smaller addend (' + a + ') and double it.',
    intervention: _l33IntStrategyChoiceDouble(a, b)
  });
}

// H3: missing addend in near double (a + ? = sum where ? = a+1 or a-1)
function _l33MkMissingNearDoubleQ(n, opts) {
  var a = opts.a, sum = opts.sum;
  var missing = sum - a;
  var emoji = _l33Emoji(n);
  var intervention = _l33IntMissingAddendNearDouble(a, missing, sum);
  intervention.teachingVisual = _l33TeachingMissingNearDouble(a, missing, sum, emoji);
  return _l33Q(n, {
    difficulty: 'hard',
    subSkill: 'missing_addend_near_double',
    keyIdea: 'For a near double, the addends are one apart.',
    prompt: a + ' + ? = ' + sum,
    visual: null,
    answer: String(missing),
    choices: [
      { value: String(missing),     correct: true },
      { value: String(a),           correct: false, errorTag: 'err_double_fact_recall',    misconceptionExplanation: 'That would make a double; the sum would be ' + (a*2) + ', not ' + sum + '.' },
      { value: String(missing + 1), correct: false, errorTag: 'err_off_by_one',            misconceptionExplanation: 'Off by one — too high.' },
      { value: String(missing - 1), correct: false, errorTag: 'err_off_by_one',            misconceptionExplanation: 'Off by one — too low.' }
    ],
    hint: 'Try adding 1 or subtracting 1 from ' + a + '.',
    intervention: intervention
  });
}

// H1, H4: abstract mixed (auto-detects double vs near-double from a, b)
function _l33MkAbstractMixedQ(n, opts) {
  var a = opts.a, b = opts.b, sum = a + b;
  var isDouble = (a === b);
  var emoji = _l33Emoji(n);
  var intervention;
  if (isDouble) {
    intervention = _l33IntDouble(a, sum);
  } else {
    intervention = _l33IntNearDouble(a, b, sum);
  }
  // No teachingVisual for abstract hard questions — text-only intervention.
  var seen = {}; seen[sum] = true;
  var distractors = [];
  function add(val, tag, me) {
    if (val < 0) return;
    if (seen[val]) return;
    seen[val] = true;
    distractors.push({ value: String(val), correct: false, errorTag: tag, misconceptionExplanation: me });
  }
  add(sum - 1, 'err_off_by_one',                  'Off by one — too low.');
  add(sum + 1, 'err_off_by_one',                  'Off by one — too high.');
  if (isDouble) {
    add(a + 1 + a + 1, 'err_double_fact_recall',  'Wrong double — used a different number.');
  } else {
    var smaller = a < b ? a : b;
    add(smaller * 2, 'err_near_double_off_by_one', 'Used the double instead of the near double.');
  }
  if (distractors.length < 3) add(sum + 2, 'err_off_by_one', 'Off by two.');
  return _l33Q(n, {
    difficulty: opts.difficulty || 'hard',
    subSkill: isDouble ? 'recall_double_fact' : 'near_double_one_more',
    keyIdea: opts.keyIdea || (isDouble ? 'A double has two equal addends.' : 'A near double is one more than a double.'),
    prompt: opts.prompt || (a + ' + ' + b + ' = ?'),
    visual: null,
    answer: String(sum),
    choices: [{ value: String(sum), correct: true }].concat(distractors.slice(0, 3)),
    hint: opts.hint || (isDouble ? ('Think: ' + a + ' + ' + a + '.') : ('Use a known double of ' + (a < b ? a : b) + '.')),
    intervention: intervention
  });
}

// ── Worked examples ────────────────────────────────────────────────────────

const _l33Examples = [
  {
    id: 'g1-u3-l3-ex-001',
    title: 'Example 1: Basic Double',
    prompt: 'What is 4 + 4?',
    visual: _l33VisTwoGroups(4, 4, '🍪'),
    steps: [
      'A double adds the same number twice.',
      '4 + 4 means two groups of 4 cookies.',
      '4 + 4 = 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'Doubles within 10 are foundational facts to memorize.',
    relatedKeyIdea: 'A double adds the same number twice.'
  },
  {
    id: 'g1-u3-l3-ex-002',
    title: 'Example 2: Recognize a Double',
    prompt: 'Which one is a double: 3 + 3, 3 + 4, or 5 + 6?',
    visual: null,
    steps: [
      'A double has two equal addends.',
      '3 + 3 has two 3s — that is a double.',
      '3 + 4 and 5 + 6 are not doubles (the addends are different).'
    ],
    finalAnswer: '3 + 3',
    teachingNote: 'Train pattern recognition: if both addends match, it is a double.',
    relatedKeyIdea: 'A double has two equal addends.'
  },
  {
    id: 'g1-u3-l3-ex-003',
    title: 'Example 3: Near Double',
    prompt: 'What is 6 + 7?',
    visual: _l33VisTwoGroups(6, 7, '🍎'),
    steps: [
      '6 and 7 are one apart — this is a near double.',
      'Start with the smaller double: 6 + 6 = 12.',
      'Add 1 more: 12 + 1 = 13. So 6 + 7 = 13.'
    ],
    finalAnswer: '13',
    teachingNote: 'Anchor near-doubles to the smaller addend\'s double, then add 1.',
    relatedKeyIdea: 'A near double is one more than a double.'
  },
  {
    id: 'g1-u3-l3-ex-004',
    title: 'Example 4: Use a Known Double',
    prompt: '8 + 8 = 16. So 8 + 9 = ?',
    visual: null,
    steps: [
      'You know 8 + 8 = 16.',
      '8 + 9 is one more than 8 + 8.',
      '16 + 1 = 17. So 8 + 9 = 17.'
    ],
    finalAnswer: '17',
    teachingNote: 'Bridge from a known double to the adjacent near double.',
    relatedKeyIdea: 'Use a known double, then add 1 or subtract 1.'
  },
  {
    id: 'g1-u3-l3-ex-005',
    title: 'Example 5: Either Order',
    prompt: 'Compare 5 + 6 and 6 + 5.',
    visual: _l33VisTwoGroups(5, 6, '🐶'),
    steps: [
      '5 + 6: count 5 then 6 more — total 11.',
      '6 + 5: count 6 then 5 more — total 11.',
      'Both equal 11. Order doesn\'t change the sum.'
    ],
    finalAnswer: '11',
    teachingNote: 'Reinforce commutativity in the context of near doubles.',
    relatedKeyIdea: 'Numbers can be added in any order.'
  },
  {
    id: 'g1-u3-l3-ex-006',
    title: 'Example 6: Missing Addend in a Double',
    prompt: '7 + ? = 14',
    visual: null,
    steps: [
      'For a double, both addends are the same.',
      'The first addend is 7.',
      'The missing number is also 7. (7 + 7 = 14.)'
    ],
    finalAnswer: '7',
    teachingNote: 'Missing-addend in doubles is a key bridge to L3.5 fact families.',
    relatedKeyIdea: 'A double has two equal addends.'
  }
];

// ── Question data (165 tuples) ─────────────────────────────────────────────

// EASY 50: E1 doubles 1-5 (15), E2 recognize (12), E3 doubles 6-8 (8), E4 doubles 9-10 (5), E5 near-double sum<=11 (10)
var _l33_E1 = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5];
var _l33_E2 = [
  // [doubleAddend, distractor1, distractor2]
  { d: 2, d1: [1,3], d2: [2,3] },
  { d: 3, d1: [2,4], d2: [3,4] },
  { d: 4, d1: [3,5], d2: [4,5] },
  { d: 5, d1: [4,6], d2: [5,6] },
  { d: 6, d1: [5,7], d2: [6,7] },
  { d: 7, d1: [6,8], d2: [7,8] },
  { d: 8, d1: [7,9], d2: [8,9] },
  { d: 9, d1: [8,10], d2: [9,10] },
  { d: 10, d1: [9,8], d2: [10,9] },
  { d: 3, d1: [1,4], d2: [3,2] },
  { d: 5, d1: [3,7], d2: [4,5] },
  { d: 7, d1: [5,9], d2: [6,8] }
];
var _l33_E3 = [6, 6, 6, 7, 7, 7, 8, 8];
var _l33_E4 = [9, 9, 9, 10, 10];
var _l33_E5 = [
  [1,2], [2,3], [3,4], [4,5], [5,6], [2,1], [3,2], [4,3], [5,4], [6,5]
];

// MEDIUM 70: M1 doubles abstract (10), M2 near-doubles +1more (15), M3 near-doubles -1less commutative (15),
//            M4 use known double (15), M5 identify near double (5), M6 missing addend in double (10)
var _l33_M1 = [5, 5, 6, 6, 7, 7, 8, 8, 9, 10];
var _l33_M2 = [
  [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,10],
  [2,3], [4,5], [5,6], [6,7], [7,8], [8,9]
];
var _l33_M3 = [
  [2,1], [3,2], [4,3], [5,4], [6,5], [7,6], [8,7], [9,8], [10,9],
  [3,2], [5,4], [6,5], [7,6], [8,7], [9,8]
];
var _l33_M4 = [
  // [knownAddend, targetA, targetB]
  { ka: 3, ta: 3, tb: 4 },
  { ka: 4, ta: 4, tb: 5 },
  { ka: 5, ta: 5, tb: 6 },
  { ka: 6, ta: 6, tb: 7 },
  { ka: 7, ta: 7, tb: 8 },
  { ka: 8, ta: 8, tb: 9 },
  { ka: 9, ta: 9, tb: 10 },
  { ka: 4, ta: 3, tb: 4 },
  { ka: 5, ta: 4, tb: 5 },
  { ka: 6, ta: 5, tb: 6 },
  { ka: 7, ta: 6, tb: 7 },
  { ka: 8, ta: 7, tb: 8 },
  { ka: 9, ta: 8, tb: 9 },
  { ka: 10, ta: 9, tb: 10 },
  { ka: 5, ta: 5, tb: 6 }
];
var _l33_M5 = [
  // [nearDoublePair, distractor1, distractor2]
  { nd: [3,4],  d1: [1,1], d2: [5,5] },
  { nd: [6,7],  d1: [3,5], d2: [4,9] },
  { nd: [8,9],  d1: [2,5], d2: [10,10] },
  { nd: [4,5],  d1: [6,8], d2: [1,3] },
  { nd: [7,8],  d1: [3,6], d2: [5,5] }
];
var _l33_M6 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// HARD 45: H1 mixed abstract (15), H2 strategy-choice (5), H3 missing addend in near double (10), H4 largest (15)
var _l33_H1 = [
  [5,5], [6,6], [7,7], [8,8], [9,9], [10,10],
  [5,6], [6,7], [7,8], [8,9], [9,10],
  [6,5], [7,6], [8,7], [9,8]
];
var _l33_H2 = [
  // [a, b] with b = a+1 (a is smaller). Question: "Which double is one less than a + b?" Answer: "a + a"
  { a: 5, b: 6 },
  { a: 6, b: 7 },
  { a: 7, b: 8 },
  { a: 8, b: 9 },
  { a: 9, b: 10 }
];
var _l33_H3 = [
  // [a, sum] where missing = sum - a, and missing = a±1
  { a: 3, sum: 7 },   // missing = 4 (a+1)
  { a: 4, sum: 9 },   // missing = 5 (a+1)
  { a: 5, sum: 11 },  // missing = 6 (a+1)
  { a: 6, sum: 13 },  // missing = 7 (a+1)
  { a: 7, sum: 15 },  // missing = 8 (a+1)
  { a: 8, sum: 17 },  // missing = 9 (a+1)
  { a: 9, sum: 19 },  // missing = 10 (a+1)
  { a: 4, sum: 7 },   // missing = 3 (a-1)
  { a: 5, sum: 9 },   // missing = 4 (a-1)
  { a: 6, sum: 11 }   // missing = 5 (a-1)
];
var _l33_H4 = [
  [8,9], [9,8], [9,9], [9,10], [10,9], [10,10],
  [8,9], [9,8], [9,9], [9,10], [10,9],
  [8,8], [9,9], [10,10], [8,9]
];

// ── Bank assembly ──────────────────────────────────────────────────────────

var _l33QuizBank = [];
var _l33N = 0;

// Easy
_l33_E1.forEach(function(a) { _l33N++; _l33QuizBank.push(_l33MkDoubleQ(_l33N, { a: a, difficulty: 'easy' })); });
_l33_E2.forEach(function(o) { _l33N++; _l33QuizBank.push(_l33MkRecognizeDoubleQ(_l33N, { doubleAddend: o.d, distractor1: o.d1, distractor2: o.d2 })); });
_l33_E3.forEach(function(a) { _l33N++; _l33QuizBank.push(_l33MkDoubleQ(_l33N, { a: a, difficulty: 'easy' })); });
_l33_E4.forEach(function(a) { _l33N++; _l33QuizBank.push(_l33MkDoubleQ(_l33N, { a: a, difficulty: 'easy', visual: false })); });
_l33_E5.forEach(function(t) { _l33N++; _l33QuizBank.push(_l33MkNearDoubleQ(_l33N, { a: t[0], b: t[1], difficulty: 'easy' })); });

// Medium
_l33_M1.forEach(function(a) { _l33N++; _l33QuizBank.push(_l33MkDoubleQ(_l33N, { a: a, difficulty: 'medium', visual: false })); });
_l33_M2.forEach(function(t) { _l33N++; _l33QuizBank.push(_l33MkNearDoubleQ(_l33N, { a: t[0], b: t[1], difficulty: 'medium' })); });
_l33_M3.forEach(function(t) { _l33N++; _l33QuizBank.push(_l33MkNearDoubleQ(_l33N, { a: t[0], b: t[1], difficulty: 'medium' })); });
_l33_M4.forEach(function(o) { _l33N++; _l33QuizBank.push(_l33MkUseKnownDoubleQ(_l33N, { knownAddend: o.ka, targetA: o.ta, targetB: o.tb })); });
_l33_M5.forEach(function(o) { _l33N++; _l33QuizBank.push(_l33MkRecognizeNearDoubleQ(_l33N, { nearDoublePair: o.nd, distractor1: o.d1, distractor2: o.d2 })); });
_l33_M6.forEach(function(a) { _l33N++; _l33QuizBank.push(_l33MkMissingDoubleQ(_l33N, { a: a })); });

// Hard
_l33_H1.forEach(function(t) { _l33N++; _l33QuizBank.push(_l33MkAbstractMixedQ(_l33N, { a: t[0], b: t[1], difficulty: 'hard' })); });
_l33_H2.forEach(function(o) { _l33N++; _l33QuizBank.push(_l33MkStrategyChoiceQ(_l33N, { a: o.a, b: o.b })); });
_l33_H3.forEach(function(o) { _l33N++; _l33QuizBank.push(_l33MkMissingNearDoubleQ(_l33N, { a: o.a, sum: o.sum })); });
_l33_H4.forEach(function(t) { _l33N++; _l33QuizBank.push(_l33MkAbstractMixedQ(_l33N, { a: t[0], b: t[1], difficulty: 'hard' })); });

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
    //  Lesson 3.2 — Subtract Within 20 (170 questions)
    //  TEKS 1.3D, 1.3E (supporting 1.5F)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l2',
      title: 'Subtract Within 20',
      teks: ['1.3D', '1.3E', '1.5F'],
      skill: 'subtract_within_20',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Subtraction means take away — we find what is left.',
        'Always start with the first number — that is the number you have.',
        'To count back, start at the first number and count down the smaller one.',
        "Subtracting 0 doesn't change a number. (8 − 0 = 8)",
        'Subtracting 1 means one less. (9 − 1 = 8)',
        'Subtracting a number from itself leaves 0. (6 − 6 = 0)'
      ],
      workedExamples: _l32Examples,
      quizBank: _l32QuizBank,
      diagnostics: {
        commonDistractors: [
          { value: 'off_by_one',          meaning: 'Counted one too many or too few.',                                       errorTag: 'err_off_by_one' },
          { value: 'count_back_wrong',    meaning: 'Lost track of the count or skipped the count-back entirely.',            errorTag: 'err_count_back_wrong' },
          { value: 'takeaway_wrong',      meaning: 'Miscounted the result of the take-away.',                                errorTag: 'err_takeaway_wrong' },
          { value: 'subtract_as_add',     meaning: 'Added instead of subtracted (gave a + b for a − b).',                    errorTag: 'err_subtract_as_add' },
          { value: 'subtract_zero_or_one',meaning: 'Mishandled −0 or −1 (e.g., gave n−1 for n−0, or n for n−1).',            errorTag: 'err_subtract_zero_or_one' },
          { value: 'subtract_all_confusion', meaning: 'Got n − n wrong — often picked n or 1 instead of 0.',                 errorTag: 'err_subtract_all_confusion' },
          { value: 'start_number_confusion', meaning: 'Started counting back from the wrong number (typically the smaller).', errorTag: 'err_start_number_confusion' }
        ],
        errorTags: ['err_off_by_one', 'err_count_back_wrong', 'err_takeaway_wrong', 'err_subtract_as_add', 'err_subtract_zero_or_one', 'err_subtract_all_confusion', 'err_start_number_confusion'],
        interventionRules: [
          { errorTag: 'err_off_by_one',              style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_count_back_wrong',        style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_takeaway_wrong',          style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_subtract_as_add',         style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_subtract_zero_or_one',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_subtract_all_confusion',  style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_start_number_confusion',  style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
        ]
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.3 — Doubles and Near Doubles (165 questions)
    //  TEKS 1.3D, 1.3E (supporting 1.5G)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l3',
      title: 'Doubles and Near Doubles',
      teks: ['1.3D', '1.3E', '1.5G'],
      skill: 'doubles_and_near_doubles',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'A double adds the same number twice. (4 + 4, 6 + 6)',
        'Doubles are easy to remember — once you know one, you know it forever.',
        'A near double is almost a double — the two numbers are exactly one apart. (6 + 7, 4 + 5)',
        'To solve a near double, start with a known double, then add 1 or subtract 1.',
        'Numbers can be added in any order, so 6 + 7 and 7 + 6 are both near doubles of 6 + 6.',
        'Doubles and near doubles within 20 cover most addition facts students need to memorize.'
      ],
      workedExamples: _l33Examples,
      quizBank: _l33QuizBank,
      diagnostics: {
        commonDistractors: [
          { value: 'double_fact_recall',     meaning: 'Got a basic double wrong (e.g., picked 11 for 6+6).',                                       errorTag: 'err_double_fact_recall' },
          { value: 'near_double_off_by_one', meaning: 'Got a near double off by 1 (e.g., picked 12 for 6+7).',                                     errorTag: 'err_near_double_off_by_one' },
          { value: 'used_wrong_double',      meaning: 'Used the wrong base double for a near-double calculation.',                                 errorTag: 'err_used_wrong_double' },
          { value: 'count_all_wrong',        meaning: 'Lost track miscounting both groups.',                                                       errorTag: 'err_count_all_wrong' },
          { value: 'missing_addend_confusion', meaning: 'Couldn\'t recognize the missing addend pattern in a double or near double.',              errorTag: 'err_missing_addend_confusion' },
          { value: 'commutative_confusion',  meaning: 'Didn\'t recognize that a+b and b+a give the same answer.',                                  errorTag: 'err_commutative_confusion' }
        ],
        errorTags: ['err_double_fact_recall', 'err_near_double_off_by_one', 'err_used_wrong_double', 'err_count_all_wrong', 'err_missing_addend_confusion', 'err_commutative_confusion'],
        interventionRules: [
          { errorTag: 'err_double_fact_recall',      style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_near_double_off_by_one',  style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_used_wrong_double',       style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_count_all_wrong',         style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_missing_addend_confusion', style: 'reteach',     followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_commutative_confusion',   style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
        ]
      }
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
