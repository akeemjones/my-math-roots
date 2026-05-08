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
