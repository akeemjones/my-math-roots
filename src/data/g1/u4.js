/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 4: Tens and Ones Operations
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    Primary:    1.3A
 *    Supporting: 1.5C, 1.5D, 1.5G
 *
 *  Lessons:
 *    L4.1  Add Tens and Ones                    ← COMPLETE (170 questions)
 *    L4.2  10 More and 10 Less                  ← COMPLETE (165 questions)
 *    L4.3  Add Multiples of 10                  ← COMPLETE (170 questions)
 *    L4.4  Add Tens to Two-Digit Numbers        ← COMPLETE (170 questions)
 *    L4.5  Tens and Ones Word Problems          ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every future question added to this unit):
 *    - No regrouping. No carrying. No borrowing.
 *    - No vertical algorithm / column addition.
 *    - No 27 + 18, 53 - 27, or any addition crossing a tens boundary by carry.
 *    - No three-digit operation problems (those are Grade 4).
 *    - No reuse of legacy src/data/u4.js content (that file is Grade 4).
 *    - L4.5 word problems are SINGLE-STEP only — no two-step problems.
 *
 *  Allowed problem shapes:
 *    - Multiple of 10 + multiple of 10  (10+20, 30+40, ..., max sum 90)
 *    - Multiple of 10 + one-digit       (40+5, 60+8, ..., max sum 99)
 *    - Two-digit + 10 / +20 / etc.      (24+10, 36+20, no regrouping)
 *    - 10 more / 10 less                (34→44, 78→68, up to 120)
 * ════════════════════════════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 4.1 — Add Tens and Ones — helpers, intervention templates, quizBank
//  Skill: add_tens_and_ones · TEKS 1.3A (supporting 1.5G)
//  Target: 170 questions (55 easy / 70 medium / 45 hard)
//
//  Question categories:
//    C1 Basic M + d              25E + 20M           = 45
//    C2 Commutative form (d+M)   10E                 = 10
//    C3 Model → equation         12E + 15M           = 27
//    C4 Equation → number         8E + 15M           = 23
//    C5 Missing ones                  10M + 10H      = 20
//    C6 Missing tens                       12H       = 12
//    C7 Error repair                       13H       = 13
//    C8 Commutative recognition       10M + 10H      = 20
//    ────────────────────────────────────────────────────
//    TOTAL                       55E + 70M + 45H     = 170
//
//  Error tag policy (8 tags, used DISTINCTLY per the L4.1 plan):
//    err_added_digits_only  — kid added the digits, ignored place value (40+5→9)
//    err_dropped_zero       — kid dropped the 0 from a place-value VALUE
//                              (e.g., chose 4 instead of 40 for missing tens)
//    err_ones_in_tens_place — kid put the ones digit in the tens slot (40+5→54)
//    err_reversed_tens_ones — kid reversed digit order (read 45 as 54)
//    err_missing_tens_value — for ☐+d=sum, answered the digit not the value
//    err_missing_ones_value — for M+☐=sum, answered M instead of d
//    err_off_by_one         — counted ±1 from correct
//    err_place_value_confusion — generic catch-all for place-value errors
// ════════════════════════════════════════════════════════════════════════════

function _l41Q(n, o) {
  return {
    id: 'g1-u4-l1-q-' + String(n).padStart(3, '0'),
    teks: o.teks || ['1.3A'],
    lessonId: 'g1-u4-l1',
    skill: 'add_tens_and_ones',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: String(o.answer),
    choices: o.choices,
    hint: o.hint,
    intervention: Object.assign({
      followUpRule: 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: true
    }, o.intervention)
  };
}

// ── Question visual builder ──────────────────────────────────────────────────
//
// Produces the {type, tens, ones} form expected by _g1VisToV (which wraps it
// into {type:'base10', config:{tens, ones}}). Question-time visuals only —
// not used inside intervention objects.
function _l41VisBase10(t, o) {
  return { type: 'base10', tens: t, ones: o };
}

// ── Choice helper ────────────────────────────────────────────────────────────
function _l41Choice(value, errorTag, misconception) {
  if (errorTag == null) {
    return { value: value, correct: true };
  }
  return {
    value: value,
    correct: false,
    errorTag: errorTag,
    misconceptionExplanation: misconception || null
  };
}

// ── Teaching base-10 visual (intervention "Try it this way" panel only) ─────
//
// Produced in renderer-ready {type, config:{...}} form because intervention
// objects are consumed as-is by _buildVisualHTML (NOT run through _g1VisToV
// during merge — same convention as u3.js teaching visuals).
function _l41TeachingBase10(t, o, label) {
  return {
    type: 'base10',
    config: {
      tens: t,
      ones: o,
      label: label
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  Intervention templates (one per error tag, parameterised)
// ════════════════════════════════════════════════════════════════════════════

function _l41IntAddedDigitsOnly(M, d, sum) {
  var tens = M / 10;
  return {
    errorTag: 'err_added_digits_only',
    title: 'Tens and ones live in different places',
    teachingSteps: [
      M + ' is not ' + tens + ' — it means ' + tens + ' tens, which is ' + M + '.',
      d + ' means ' + d + ' ones.',
      'Tens go in the tens place. Ones go in the ones place.',
      M + ' + ' + d + ' = ' + sum + ', not ' + (tens + d) + '.'
    ],
    correctAnswerExplanation: M + ' + ' + d + ' = ' + sum + ' because ' + tens + ' tens and ' + d + ' ones make ' + sum + '.',
    teachingVisual: _l41TeachingBase10(tens, d, tens + ' tens (' + M + ') + ' + d + ' ones = ' + sum)
  };
}

function _l41IntDroppedZero(sumTens, d, sum) {
  // For missing-tens questions (☐ + d = sum) where the kid wrote the digit
  // (e.g., 8) instead of the value (80). The "value" they should have written
  // is sumTens × 10.
  var tensValue = sumTens * 10;
  return {
    errorTag: 'err_dropped_zero',
    title: "Don't drop the zero",
    teachingSteps: [
      'The blank stands for ' + sumTens + ' tens.',
      sumTens + ' tens means ' + tensValue + ', not ' + sumTens + '.',
      'When you write the value of the tens, keep the zero: ' + tensValue + '.',
      'The missing number is ' + tensValue + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + tensValue + ' because ' + sumTens + ' tens equals ' + tensValue + '.',
    teachingVisual: _l41TeachingBase10(sumTens, 0, sumTens + ' tens = ' + tensValue + ' (not ' + sumTens + ')')
  };
}

function _l41IntOnesInTensPlace(M, d, sum) {
  var tens = M / 10;
  var swapped = d * 10 + tens;
  return {
    errorTag: 'err_ones_in_tens_place',
    title: 'Be careful where each digit goes',
    teachingSteps: [
      'The TENS digit shows how many groups of ten.',
      'The ONES digit shows how many leftover ones.',
      'For ' + M + ' + ' + d + ': tens digit is ' + tens + ', ones digit is ' + d + '.',
      'The answer is ' + sum + ' — not ' + swapped + '.'
    ],
    correctAnswerExplanation: sum + ' has ' + tens + ' in the tens place and ' + d + ' in the ones place.',
    teachingVisual: _l41TeachingBase10(tens, d, 'Tens place: ' + tens + ' · Ones place: ' + d + ' · Total: ' + sum)
  };
}

function _l41IntReversedTensOnes(M, d, sum) {
  var tens = M / 10;
  return {
    errorTag: 'err_reversed_tens_ones',
    title: 'Read the digits in the right order',
    teachingSteps: [
      'When you write a number, the tens digit comes first, then the ones digit.',
      'For ' + M + ' + ' + d + ': tens = ' + tens + ', ones = ' + d + '.',
      'Write the tens digit (' + tens + '), then the ones digit (' + d + '): ' + sum + '.',
      'Reading the digits backwards gives a different number.'
    ],
    correctAnswerExplanation: M + ' + ' + d + ' = ' + sum + ' (tens digit ' + tens + ', ones digit ' + d + ').',
    teachingVisual: _l41TeachingBase10(tens, d, 'Tens: ' + tens + ' · Ones: ' + d + ' · Number: ' + sum)
  };
}

function _l41IntMissingTensValue(d, sumTens, sum) {
  // For ☐ + d = sum: the blank is the multiple of 10 (sumTens * 10),
  // but the kid answered with the whole sum or just the digit.
  var tensValue = sumTens * 10;
  return {
    errorTag: 'err_missing_tens_value',
    title: 'The blank goes in the tens place',
    teachingSteps: [
      'The answer is ' + sum + ', which has ' + sumTens + ' tens and ' + d + ' ones.',
      'We already have ' + d + ' (the ones).',
      'The blank stands for the TENS — that is ' + sumTens + ' tens.',
      sumTens + ' tens = ' + tensValue + '.',
      tensValue + ' + ' + d + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + tensValue + ', not ' + sum + '.',
    teachingVisual: _l41TeachingBase10(sumTens, d, 'Missing piece = ' + sumTens + ' tens = ' + tensValue)
  };
}

function _l41IntMissingOnesValue(M, d, sum) {
  // For M + ☐ = sum: the blank is d (the ones), but the kid answered with M.
  var tens = M / 10;
  return {
    errorTag: 'err_missing_ones_value',
    title: 'The blank goes in the ones place',
    teachingSteps: [
      'The answer is ' + sum + '.',
      'We already have ' + M + ' (' + tens + ' tens).',
      'The blank stands for the ONES — count the ones digit of ' + sum + '.',
      sum + ' has ' + d + ' ones.',
      M + ' + ' + d + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + d + ' (the ones), not ' + M + '.',
    teachingVisual: _l41TeachingBase10(tens, d, 'Missing piece = ' + d + ' ones')
  };
}

function _l41IntOffByOne(M, d, sum) {
  var tens = M / 10;
  return {
    errorTag: 'err_off_by_one',
    title: 'Count carefully',
    teachingSteps: [
      M + ' stays as ' + M + '. Don\'t change the tens.',
      'Add ' + d + ' ones.',
      M + ' + ' + d + ' = ' + sum + ' — exactly ' + sum + '.'
    ],
    correctAnswerExplanation: M + ' + ' + d + ' = ' + sum + '.',
    teachingVisual: _l41TeachingBase10(tens, d, M + ' + ' + d + ' = ' + sum)
  };
}

function _l41IntPlaceValueConfusion(M, d, sum) {
  var tens = M / 10;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Tens and ones live in different places',
    teachingSteps: [
      'The tens digit shows groups of ten.',
      'The ones digit shows the leftovers (1–9).',
      'For ' + M + ' + ' + d + ': tens = ' + tens + ', ones = ' + d + ', total = ' + sum + '.'
    ],
    correctAnswerExplanation: M + ' + ' + d + ' = ' + sum + '.',
    teachingVisual: _l41TeachingBase10(tens, d, 'Tens place · Ones place')
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  Builder helpers (one per category) — produce a fully-formed question
// ════════════════════════════════════════════════════════════════════════════

// Compute a safe digit-swap distractor for "M + d" questions. If the swap
// collides with the correct sum (M/10 == d) or with another distractor,
// returns a place-value-confusion fallback (sum ± 10).
function _l41SafeSwapDistractor(M, d, sum, addedOnly, offByOne) {
  var tens = M / 10;
  var swapped = d * 10 + tens;
  if (swapped === sum || swapped === addedOnly || swapped === offByOne) {
    var alt = sum + 10 <= 99 ? sum + 10 : sum - 10;
    if (alt === addedOnly || alt === offByOne || alt === sum) {
      alt = sum >= 20 ? sum - 10 : sum + 20;
    }
    return { value: alt, tag: 'err_place_value_confusion', message: 'Place value confused — answer is in the wrong tens range.' };
  }
  return { value: swapped, tag: 'err_ones_in_tens_place', message: 'Swapped tens and ones digits.' };
}

// ── C1: Basic M + d = ? ─────────────────────────────────────────────────────
function _l41MkBasic(M, d, qNum, difficulty, useVisual) {
  var tens = M / 10;
  var sum = M + d;
  var addedOnly = tens + d;
  var offByOne = sum < 99 ? sum + 1 : sum - 1;
  var swap = _l41SafeSwapDistractor(M, d, sum, addedOnly, offByOne);
  return _l41Q(qNum, {
    subSkill: 'basic_mult_of_ten_plus_one_digit',
    keyIdea: 'Tens go in the tens place; ones go in the ones place.',
    difficulty: difficulty,
    prompt: 'What is ' + M + ' + ' + d + '?',
    visual: useVisual ? _l41VisBase10(tens, d) : null,
    answer: sum,
    choices: [
      _l41Choice(sum),
      _l41Choice(addedOnly, 'err_added_digits_only', 'Added only the digits — ignored place value.'),
      _l41Choice(swap.value, swap.tag, swap.message),
      _l41Choice(offByOne, 'err_off_by_one', 'Off by one when counting.')
    ],
    hint: 'Keep the ' + tens + ' tens and add ' + d + ' ones.',
    intervention: _l41IntAddedDigitsOnly(M, d, sum)
  });
}

// ── C2: Commutative form d + M = ? ───────────────────────────────────────────
function _l41MkCommutative(M, d, qNum, difficulty, useVisual) {
  var tens = M / 10;
  var sum = M + d;
  var addedOnly = tens + d;
  var offByOne = sum < 99 ? sum + 1 : sum - 1;
  var swap = _l41SafeSwapDistractor(M, d, sum, addedOnly, offByOne);
  return _l41Q(qNum, {
    subSkill: 'commutative_one_digit_plus_mult_of_ten',
    keyIdea: 'You can add in either order: a + b = b + a.',
    difficulty: difficulty,
    prompt: 'What is ' + d + ' + ' + M + '?',
    visual: useVisual ? _l41VisBase10(tens, d) : null,
    answer: sum,
    choices: [
      _l41Choice(sum),
      _l41Choice(addedOnly, 'err_added_digits_only', 'Added only the digits — ignored place value.'),
      _l41Choice(swap.value, swap.tag, swap.message),
      _l41Choice(offByOne, 'err_off_by_one', 'Off by one when counting.')
    ],
    hint: 'Switch the order: ' + d + ' + ' + M + ' is the same as ' + M + ' + ' + d + '.',
    intervention: _l41IntAddedDigitsOnly(M, d, sum)
  });
}

// ── C3: Model → equation (visual base10(t,o); pick the addition expression) ─
function _l41MkModelToEq(M, d, qNum, difficulty) {
  var tens = M / 10;
  // Constraint: tens !== d (else swap distractor collides with correct).
  // Caller is responsible for not passing M/10 === d pairs.
  var correctExpr = M + ' + ' + d;        // e.g., "40 + 5"
  var droppedZero = tens + ' + ' + d;     // e.g., "4 + 5"  → 9
  var swapped     = (d * 10) + ' + ' + tens; // e.g., "50 + 4" → 54
  var reversed    = tens + ' + ' + (d * 10); // e.g., "4 + 50" → 54
  return _l41Q(qNum, {
    subSkill: 'model_to_equation',
    keyIdea: 'A base-10 model shows tens (rods) and ones (cubes).',
    difficulty: difficulty,
    prompt: 'Which addition does this picture show?',
    visual: _l41VisBase10(tens, d),
    answer: correctExpr,
    choices: [
      _l41Choice(correctExpr),
      _l41Choice(droppedZero, 'err_dropped_zero', 'Read the rods as ones — dropped the zero from each ten.'),
      _l41Choice(swapped, 'err_ones_in_tens_place', 'Used ones digit as tens.'),
      _l41Choice(reversed, 'err_reversed_tens_ones', 'Reversed the roles of tens and ones.')
    ],
    hint: 'Count the rods (each rod is 10) and the cubes (each cube is 1).',
    intervention: _l41IntDroppedZero(tens, d, M + d)
  });
}

// ── C4: Equation → standard number (text only) ──────────────────────────────
function _l41MkEqToNumber(M, d, qNum, difficulty) {
  var tens = M / 10;
  var sum = M + d;
  var addedOnly = tens + d;
  var offByOne = sum < 99 ? sum + 1 : sum - 1;
  var swap = _l41SafeSwapDistractor(M, d, sum, addedOnly, offByOne);
  return _l41Q(qNum, {
    subSkill: 'equation_to_standard_number',
    keyIdea: 'To add a multiple of 10 and a one-digit number, keep the tens digit and fill in the ones.',
    difficulty: difficulty,
    prompt: M + ' + ' + d + ' = ?',
    visual: null,
    answer: sum,
    choices: [
      _l41Choice(sum),
      _l41Choice(addedOnly, 'err_added_digits_only', 'Added only the digits.'),
      _l41Choice(swap.value, swap.tag, swap.message),
      _l41Choice(offByOne, 'err_off_by_one', 'Off by one.')
    ],
    hint: 'Tens digit: ' + tens + '. Ones digit: ' + d + '.',
    intervention: _l41IntAddedDigitsOnly(M, d, sum)
  });
}

// ── C5: Missing ones (M + ☐ = sum) ──────────────────────────────────────────
function _l41MkMissingOnes(M, d, qNum, difficulty, useVisual) {
  var tens = M / 10;
  var sum = M + d;
  var off = d < 9 ? d + 1 : d - 1;
  // Distractors: M (kid wrote multiple of 10), sum (wrote total), off-by-one
  return _l41Q(qNum, {
    subSkill: 'missing_ones',
    keyIdea: 'The blank can be in the ones place — find the ones digit of the total.',
    difficulty: difficulty,
    prompt: M + ' + ☐ = ' + sum + '. What goes in the box?',
    visual: useVisual ? _l41VisBase10(tens, d) : null,
    answer: d,
    choices: [
      _l41Choice(d),
      _l41Choice(M, 'err_missing_ones_value', 'Wrote the multiple of 10 instead of the ones.'),
      _l41Choice(sum, 'err_place_value_confusion', 'Wrote the total instead of the missing ones.'),
      _l41Choice(off, 'err_off_by_one', 'Off by one.')
    ],
    hint: 'Look at the ones digit of ' + sum + '.',
    intervention: _l41IntMissingOnesValue(M, d, sum)
  });
}

// ── C6: Missing tens (☐ + d = sum) ──────────────────────────────────────────
function _l41MkMissingTens(M, d, qNum, difficulty, useVisual) {
  var tens = M / 10;
  var sum = M + d;
  var droppedZero = tens; // kid wrote 8 instead of 80
  // Distractor 3: shifted tens (off by one ten)
  var offTens = M >= 20 ? M - 10 : M + 10;
  return _l41Q(qNum, {
    subSkill: 'missing_tens',
    keyIdea: 'The blank can be in the tens place — find the tens VALUE (with the zero).',
    difficulty: difficulty,
    prompt: '☐ + ' + d + ' = ' + sum + '. What goes in the box?',
    visual: useVisual ? _l41VisBase10(tens, d) : null,
    answer: M,
    choices: [
      _l41Choice(M),
      _l41Choice(droppedZero, 'err_dropped_zero', 'Dropped the zero — wrote ' + tens + ' instead of ' + M + '.'),
      _l41Choice(sum, 'err_missing_tens_value', 'Wrote the total instead of the missing tens.'),
      _l41Choice(offTens, 'err_off_by_one', 'Off by ten in the tens place.')
    ],
    hint: 'The tens digit of ' + sum + ' is ' + tens + ' — and ' + tens + ' tens means ' + M + '.',
    intervention: _l41IntDroppedZero(tens, d, sum)
  });
}

// ── C7: Error repair (friend's wrong reasoning shown) ───────────────────────
//
// errorType: 'added_only' or 'swapped'
//   'added_only' — friend says M + d = (M/10 + d), e.g., 30 + 6 = 9 because 3+6=9
//   'swapped'    — friend says M + d = (d*10 + M/10), e.g., 40 + 5 = 54 (digits swapped)
function _l41MkErrorRepair(M, d, qNum, errorType) {
  var tens = M / 10;
  var sum = M + d;
  var addedOnly = tens + d;
  var swapped = d * 10 + tens;
  var off = sum < 99 ? sum + 1 : sum - 1;

  var promptText, primaryWrong, primaryTag, primaryMsg, intervention;
  if (errorType === 'swapped') {
    promptText = 'A friend says ' + M + ' + ' + d + ' = ' + swapped +
                 ' because they put the ' + d + ' in the tens place. What is the correct answer?';
    primaryWrong = swapped;
    primaryTag = 'err_ones_in_tens_place';
    primaryMsg = 'The friend put the ones digit in the tens place.';
    intervention = _l41IntOnesInTensPlace(M, d, sum);
  } else {
    promptText = 'A friend says ' + M + ' + ' + d + ' = ' + addedOnly +
                 ' because ' + tens + ' + ' + d + ' = ' + addedOnly + '. What is the correct answer?';
    primaryWrong = addedOnly;
    primaryTag = 'err_added_digits_only';
    primaryMsg = 'The friend ignored place value — added only the digits.';
    intervention = _l41IntAddedDigitsOnly(M, d, sum);
  }

  // Build 4 distinct choices: correct sum + primary wrong + 2 additional
  var alt;
  if (errorType === 'swapped') {
    // additional distractors: addedOnly and off-by-one
    alt = [
      _l41Choice(addedOnly, 'err_added_digits_only', 'Added only the digits.'),
      _l41Choice(off, 'err_off_by_one', 'Off by one.')
    ];
  } else {
    alt = [
      _l41Choice(swapped !== sum ? swapped : (sum + 10 <= 99 ? sum + 10 : sum - 10),
                 swapped !== sum ? 'err_ones_in_tens_place' : 'err_place_value_confusion',
                 swapped !== sum ? 'Swapped digits.' : 'Place value confused.'),
      _l41Choice(off, 'err_off_by_one', 'Off by one.')
    ];
  }

  // Ensure correct sum is not duplicated by alt distractors
  var choices = [_l41Choice(sum), _l41Choice(primaryWrong, primaryTag, primaryMsg)].concat(alt);

  return _l41Q(qNum, {
    subSkill: 'error_repair',
    keyIdea: 'Adding the digits without place value gives the wrong answer.',
    difficulty: 'hard',
    prompt: promptText,
    visual: null,
    answer: sum,
    choices: choices,
    hint: 'The friend ignored the tens place. What does ' + M + ' really mean?',
    intervention: intervention
  });
}

// ── C8: Commutative recognition ─────────────────────────────────────────────
//
// Format: "Is X + Y the same as Y + X?" with yes/no + correct/incorrect-sum
// branches. Always includes the right-arithmetic-right-conclusion option as
// correct, plus three plausible wrong options.
function _l41MkCommutativeRecog(M, d, qNum, difficulty) {
  var tens = M / 10;
  var sum = M + d;
  var addedOnly = tens + d;
  var swapped = d * 10 + tens;
  // For pairs where M/10 == d, swap == sum — pick a non-collision wrong sum.
  var wrongSum = (swapped !== sum) ? swapped : (sum + 10 <= 99 ? sum + 10 : sum - 10);
  return _l41Q(qNum, {
    subSkill: 'commutative_recognition',
    keyIdea: 'You can add in either order: a + b = b + a.',
    difficulty: difficulty,
    prompt: 'Is ' + d + ' + ' + M + ' the same as ' + M + ' + ' + d + '?',
    visual: null,
    answer: 'Yes — both equal ' + sum + '.',
    choices: [
      _l41Choice('Yes — both equal ' + sum + '.'),
      _l41Choice('No — ' + d + ' + ' + M + ' = ' + addedOnly + '.', 'err_added_digits_only', 'Added only the digits.'),
      _l41Choice('Yes — both equal ' + wrongSum + '.', 'err_ones_in_tens_place', 'Right idea, wrong sum.'),
      _l41Choice('No — ' + d + ' + ' + M + ' is more than ' + M + ' + ' + d + '.', 'err_place_value_confusion', 'Order does not change the total.')
    ],
    hint: 'Order does not matter when adding.',
    intervention: _l41IntAddedDigitsOnly(M, d, sum)
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  Data arrays — (M, d[, useVisual]) tuples per category × difficulty
//
//  Within each (category, difficulty) bucket, all (M, d) pairs are unique.
//  Across categories OR across difficulties, pairs may overlap (different
//  cognitive task → not perceived as repetition).
//
//  Visual flag (useVisual) is the third element where applicable. Total
//  question-level visuals: ~64 of 170 (~38%) — close to the ~40% target.
// ════════════════════════════════════════════════════════════════════════════

// ── Easy 1–25: C1 Basic M + d (M ∈ {10..40}) ───────────────────────────────
var _l41_E_C1 = [
  [10, 1, true ], [10, 2, false], [10, 3, true ], [10, 4, false], [10, 5, true ],
  [10, 7, false], [10, 9, true ], [20, 1, false], [20, 3, true ], [20, 4, false],
  [20, 5, true ], [20, 7, false], [20, 9, true ], [30, 1, false], [30, 2, true ],
  [30, 4, false], [30, 6, true ], [30, 8, false], [30, 9, true ], [40, 1, false],
  [40, 2, true ], [40, 3, false], [40, 5, true ], [40, 7, false], [40, 8, true ]
];

// ── Easy 26–35: C2 Commutative form d + M ──────────────────────────────────
var _l41_E_C2 = [
  [10, 6, true ], [10, 8, false], [20, 2, true ], [20, 6, false], [20, 8, true ],
  [30, 3, false], [30, 5, true ], [30, 7, false], [40, 4, true ], [40, 6, false]
];

// ── Easy 36–47: C3 Model → equation (always visual; T ≠ O enforced) ────────
var _l41_E_C3 = [
  [50, 3], [50, 6], [50, 9], [60, 1], [60, 4], [60, 7],
  [70, 2], [70, 5], [70, 8], [80, 1], [80, 4], [80, 7]
];

// ── Easy 48–55: C4 Equation → number (text only) ───────────────────────────
var _l41_E_C4 = [
  [50, 1], [50, 2], [60, 3], [60, 5], [70, 1], [70, 4], [80, 2], [80, 5]
];

// ── Medium 56–75: C1 Basic M + d (full M range) ────────────────────────────
var _l41_M_C1 = [
  [10, 6, true ], [10, 8, false], [20, 6, false], [30, 3, true ], [30, 5, false],
  [30, 7, false], [40, 4, false], [40, 6, true ], [50, 4, false], [50, 6, false],
  [50, 8, true ], [60, 3, false], [60, 5, false], [60, 7, true ], [70, 3, false],
  [70, 6, false], [70, 9, true ], [80, 3, false], [80, 6, false], [80, 9, false]
];

// ── Medium 76–90: C3 Model → equation (T ≠ O enforced) ─────────────────────
var _l41_M_C3 = [
  [50, 2], [50, 8], [60, 2], [60, 4], [60, 9],
  [70, 1], [70, 7], [80, 3], [80, 5], [80, 9],
  [90, 1], [90, 2], [90, 3], [90, 6], [90, 8]
];

// ── Medium 91–105: C4 Equation → number ────────────────────────────────────
var _l41_M_C4 = [
  [10, 5], [20, 4], [30, 7], [40, 3], [40, 9],
  [50, 7], [60, 4], [60, 8], [70, 2], [70, 5],
  [80, 1], [80, 7], [90, 4], [90, 7], [90, 8]
];

// ── Medium 106–115: C5 Missing ones (M + ☐ = sum) ──────────────────────────
var _l41_M_C5 = [
  [20, 3, true ], [30, 6, false], [40, 9, true ], [50, 5, false], [60, 1, true ],
  [60, 7, false], [70, 4, true ], [80, 2, false], [80, 9, true ], [90, 3, false]
];

// ── Medium 116–125: C8 Commutative recognition ─────────────────────────────
var _l41_M_C8 = [
  [10, 4], [20, 5], [30, 4], [40, 5], [50, 3],
  [60, 6], [70, 8], [80, 4], [90, 5], [90, 6]
];

// ── Hard 126–135: C5 Missing ones (harder pairs) ───────────────────────────
var _l41_H_C5 = [
  [10, 7, false], [30, 9, true ], [40, 1, false], [50, 4, true ], [50, 9, false],
  [70, 7, true ], [80, 5, false], [80, 8, true ], [90, 1, false], [90, 8, true ]
];

// ── Hard 136–147: C6 Missing tens (☐ + d = sum) ────────────────────────────
var _l41_H_C6 = [
  [10, 2, true ], [20, 7, false], [30, 4, true ], [40, 3, false], [50, 6, true ],
  [60, 5, false], [70, 8, true ], [80, 7, false], [80, 3, true ], [90, 5, false],
  [90, 7, true ], [90, 9, false]
];

// ── Hard 148–160: C7 Error repair ──────────────────────────────────────────
//   Tuple: [M, d, errorType] where errorType ∈ {'added_only', 'swapped'}
var _l41_H_C7 = [
  [20, 8, 'added_only'], [30, 2, 'added_only'], [40, 7, 'added_only'],
  [60, 9, 'added_only'], [50, 3, 'swapped'   ], [70, 3, 'swapped'   ],
  [10, 4, 'added_only'], [10, 6, 'swapped'   ], [40, 9, 'swapped'   ],
  [60, 2, 'added_only'], [60, 7, 'swapped'   ], [70, 4, 'added_only'],
  [80, 4, 'swapped'   ]
];

// ── Hard 161–170: C8 Commutative recognition (harder pairs) ────────────────
var _l41_H_C8 = [
  [20, 9], [30, 8], [40, 3], [50, 2], [60, 6],
  [70, 5], [80, 2], [80, 8], [90, 3], [90, 8]
];

// ════════════════════════════════════════════════════════════════════════════
//  Build quiz bank — assembled in numbered order (questions 1..170)
// ════════════════════════════════════════════════════════════════════════════

var _l41QuizBank = [];
var _l41N = 0;

// Easy 1–25
_l41_E_C1.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkBasic(p[0], p[1], _l41N, 'easy', p[2])); });
// Easy 26–35
_l41_E_C2.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkCommutative(p[0], p[1], _l41N, 'easy', p[2])); });
// Easy 36–47
_l41_E_C3.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkModelToEq(p[0], p[1], _l41N, 'easy')); });
// Easy 48–55
_l41_E_C4.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkEqToNumber(p[0], p[1], _l41N, 'easy')); });

// Medium 56–75
_l41_M_C1.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkBasic(p[0], p[1], _l41N, 'medium', p[2])); });
// Medium 76–90
_l41_M_C3.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkModelToEq(p[0], p[1], _l41N, 'medium')); });
// Medium 91–105
_l41_M_C4.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkEqToNumber(p[0], p[1], _l41N, 'medium')); });
// Medium 106–115
_l41_M_C5.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkMissingOnes(p[0], p[1], _l41N, 'medium', p[2])); });
// Medium 116–125
_l41_M_C8.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkCommutativeRecog(p[0], p[1], _l41N, 'medium')); });

// Hard 126–135
_l41_H_C5.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkMissingOnes(p[0], p[1], _l41N, 'hard', p[2])); });
// Hard 136–147
_l41_H_C6.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkMissingTens(p[0], p[1], _l41N, 'hard', p[2])); });
// Hard 148–160
_l41_H_C7.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkErrorRepair(p[0], p[1], _l41N, p[2])); });
// Hard 161–170
_l41_H_C8.forEach(function(p) { _l41N++; _l41QuizBank.push(_l41MkCommutativeRecog(p[0], p[1], _l41N, 'hard')); });

// ════════════════════════════════════════════════════════════════════════════
//  Worked examples (rendered in the lesson "Worked Examples" carousel)
// ════════════════════════════════════════════════════════════════════════════

var _l41Examples = [
  {
    id: 'g1-u4-l1-ex-1',
    title: 'Example 1: Adding tens and ones with a model',
    prompt: 'What is 40 + 5?',
    visual: { type: 'base10', tens: 4, ones: 5 },
    steps: [
      '40 means 4 tens.',
      '5 means 5 ones.',
      'Put the tens in the tens place: 4.',
      'Put the ones in the ones place: 5.',
      'The number is 45.'
    ],
    finalAnswer: '40 + 5 = 45'
  },
  {
    id: 'g1-u4-l1-ex-2',
    title: 'Example 2: One-digit number first',
    prompt: 'What is 6 + 30?',
    visual: { type: 'base10', tens: 3, ones: 6 },
    steps: [
      '6 + 30 is the same as 30 + 6 — order doesn\'t matter.',
      '30 means 3 tens.',
      '6 means 6 ones.',
      'Tens in the tens place (3), ones in the ones place (6).',
      'The number is 36.'
    ],
    finalAnswer: '6 + 30 = 36'
  },
  {
    id: 'g1-u4-l1-ex-3',
    title: 'Example 3: Reading a base-10 model',
    prompt: 'What addition does this picture show?',
    visual: { type: 'base10', tens: 7, ones: 8 },
    steps: [
      'Count the tens rods: 7. That is 70.',
      'Count the ones cubes: 8. That is 8.',
      '70 + 8 = 78.'
    ],
    finalAnswer: '70 + 8 = 78'
  },
  {
    id: 'g1-u4-l1-ex-4',
    title: 'Example 4: Avoiding the digit-only mistake',
    prompt: 'Why is 30 + 6 NOT 9?',
    visual: { type: 'base10', tens: 3, ones: 6 },
    steps: [
      '30 is not 3 ones — it is 3 TENS.',
      'If you only count digits and get 9, you ignored place value.',
      '30 + 6 = 36, not 9.',
      'Tens stay in the tens place. Ones stay in the ones place.'
    ],
    finalAnswer: '30 + 6 = 36'
  },
  {
    id: 'g1-u4-l1-ex-5',
    title: 'Example 5: Finding a missing one',
    prompt: '50 + ☐ = 57. What goes in the box?',
    visual: { type: 'base10', tens: 5, ones: 7 },
    steps: [
      'The total is 57.',
      '57 is 5 tens and 7 ones.',
      'We already have 50 (the 5 tens).',
      'We need 7 more ones.',
      '50 + 7 = 57.'
    ],
    finalAnswer: '50 + 7 = 57'
  },
  {
    id: 'g1-u4-l1-ex-6',
    title: 'Example 6: Order doesn\'t matter (commutative)',
    prompt: 'Is 8 + 60 the same as 60 + 8?',
    visual: { type: 'base10', tens: 6, ones: 8 },
    steps: [
      'When you add, you can switch the order.',
      '8 + 60 = 68.',
      '60 + 8 = 68.',
      'Both give 68 because the tens (6) and ones (8) are the same.'
    ],
    finalAnswer: 'Yes — both equal 68.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 4.2 — 10 More and 10 Less
//  Skill: ten_more_ten_less · TEKS 1.5C
//  Target: 165 questions (55E / 65M / 45H)
//
//  C1  10 more, find answer         20E   q001–q020
//  C2  10 less, find answer         20E   q021–q040
//  C3  Equation form +10            15E   q041–q055
//  C4  Equation form −10            15M   q056–q070
//  C5  Direction identification     15M   q071–q085
//  C6  Ones digit stays             20M   q086–q105
//  C7  Tens digit changes           15M   q106–q120
//  C8  Error repair                 15H   q121–q135
//  C9  Boundary (90↔100↔120)        15H   q136–q150
//  C10 Reverse (find N given R)     15H   q151–q165
// ════════════════════════════════════════════════════════════════════════════

function _l42Q(n, o) {
  return {
    id: 'g1-u4-l2-q-' + String(n).padStart(3, '0'),
    teks: ['1.5C'],
    lessonId: 'g1-u4-l2',
    skill: 'ten_more_ten_less',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: String(o.answer),
    choices: o.choices,
    hint: o.hint,
    intervention: Object.assign({ followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true }, o.intervention)
  };
}

// Question-time visual — goes through _g1VisToV adapter
function _l42VisN(n) {
  if (n >= 100) {
    var h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), oo = n % 10;
    return { type: 'base10', hundreds: h, tens: t, ones: oo };
  }
  return { type: 'base10', tens: Math.floor(n / 10), ones: n % 10 };
}

// Teaching visual (intervention panels only) — canonical config form, NOT run through adapter
function _l42TV(n, label) {
  var h = n >= 100 ? Math.floor(n / 100) : 0;
  return { type: 'base10', config: { hundreds: h, tens: Math.floor((n % 100) / 10), ones: n % 10, label: label || null } };
}

function _l42C(val, tag, msg) {
  return tag == null
    ? { value: String(val), correct: true }
    : { value: String(val), correct: false, errorTag: tag, misconceptionExplanation: msg || null };
}

// ── Intervention templates ────────────────────────────────────────────────

function _l42IntWrongDir(N, dir) {
  var correct = dir === '+' ? N + 10 : N - 10;
  var wrong = dir === '+' ? N - 10 : N + 10;
  var word = dir === '+' ? 'more' : 'less';
  var op = dir === '+' ? 'add' : 'subtract';
  return {
    errorTag: 'err_wrong_direction',
    title: '10 ' + word + ' means ' + op + ' 10',
    teachingSteps: [
      '10 MORE means add 10. 10 LESS means subtract 10.',
      'You need 10 ' + word + ' than ' + N + ', so ' + op + ' 10.',
      N + ' ' + (dir === '+' ? '+' : '−') + ' 10 = ' + correct + '.',
      wrong + ' is what you get going the wrong way.'
    ],
    correctAnswerExplanation: '10 ' + word + ' than ' + N + ' is ' + correct + ', not ' + wrong + '.',
    teachingVisual: _l42TV(N, '10 ' + word + ' than ' + N + ' = ' + correct)
  };
}

function _l42IntTensNotChanged(N, dir) {
  var correct = dir === '+' ? N + 10 : N - 10;
  var tN = Math.floor(N / 10), oN = N % 10, tC = Math.floor(correct / 10);
  var word = dir === '+' ? 'more' : 'less';
  return {
    errorTag: 'err_tens_not_changed',
    title: 'Adding 10 changes the tens digit',
    teachingSteps: [
      N + ' has ' + tN + ' in the tens place.',
      'Adding or subtracting 10 changes the tens digit by 1.',
      'New tens digit: ' + tC + '. Ones digit stays: ' + oN + '.',
      '10 ' + word + ' than ' + N + ' is ' + correct + '.'
    ],
    correctAnswerExplanation: N + ' → tens ' + tN + ' → ' + tC + ' → answer ' + correct + '.',
    teachingVisual: _l42TV(N, N + ': tens=' + tN + ', ones=' + oN)
  };
}

function _l42IntOnesChanged(N, dir) {
  var correct = dir === '+' ? N + 10 : N - 10;
  var oN = N % 10;
  var word = dir === '+' ? 'more' : 'less';
  return {
    errorTag: 'err_ones_changed',
    title: 'Only the tens digit changes',
    teachingSteps: [
      'Adding or subtracting 10 never changes the ones digit.',
      N + ' has ' + oN + ' ones. The answer also has ' + oN + ' ones.',
      'Count by 10 from ' + N + ': ' + N + ', ' + correct + '.',
      'Ones stay at ' + oN + ' — always.'
    ],
    correctAnswerExplanation: '10 ' + word + ' than ' + N + ' is ' + correct + '. Ones (' + oN + ') do not change.',
    teachingVisual: _l42TV(N, 'ones stay at ' + oN)
  };
}

function _l42IntOffByTen(N, dir) {
  var correct = dir === '+' ? N + 10 : N - 10;
  var word = dir === '+' ? 'more' : 'less';
  var op = dir === '+' ? 'add' : 'subtract';
  return {
    errorTag: 'err_off_by_ten',
    title: 'Move the tens digit by exactly 1',
    teachingSteps: [
      '10 ' + word + ' means ' + op + ' exactly one ten.',
      'Count by 10: ' + N + ' → ' + correct + '.',
      'The tens digit moves by exactly 1, not 2.'
    ],
    correctAnswerExplanation: '10 ' + word + ' than ' + N + ' is ' + correct + ' (one ten, not two).',
    teachingVisual: _l42TV(correct, '10 ' + word + ' than ' + N)
  };
}

function _l42IntBoundary(N, dir) {
  var correct = dir === '+' ? N + 10 : N - 10;
  var word = dir === '+' ? 'more' : 'less';
  var h = Math.floor(correct / 100), t = Math.floor((correct % 100) / 10), oo = correct % 10;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: 'Count by 10 past 100',
    teachingSteps: [
      'The count-by-10 pattern keeps going past 100.',
      N + ' ' + (dir === '+' ? '+' : '−') + ' 10 = ' + correct + '.',
      correct >= 100
        ? 'Write: ' + h + ' hundred, ' + t + ' tens, ' + oo + ' ones = ' + correct + '.'
        : 'After crossing 100, subtracting 10 gives ' + correct + '.'
    ],
    correctAnswerExplanation: '10 ' + word + ' than ' + N + ' is ' + correct + '.',
    teachingVisual: _l42TV(correct, '10 ' + word + ' than ' + N + ' = ' + correct)
  };
}

function _l42IntErrRepair(N, dir, wrongVal) {
  var correct = dir === '+' ? N + 10 : N - 10;
  var word = dir === '+' ? 'more' : 'less';
  return {
    errorTag: 'err_wrong_direction',
    title: 'Identify the correct direction',
    teachingSteps: [
      '10 ' + word + ' means ' + (dir === '+' ? 'add' : 'subtract') + ' 10.',
      wrongVal + ' is wrong — check the direction.',
      N + ' ' + (dir === '+' ? '+' : '−') + ' 10 = ' + correct + '.'
    ],
    correctAnswerExplanation: '10 ' + word + ' than ' + N + ' is ' + correct + ', not ' + wrongVal + '.',
    teachingVisual: _l42TV(N, '10 ' + word + ' than ' + N + ' = ' + correct)
  };
}

// ── Factory functions ─────────────────────────────────────────────────────

function _l42MkC1(N, qNum) {
  var c = N + 10, d1 = N - 10, d2 = N, d3 = N + 20;
  return _l42Q(qNum, {
    subSkill: 'find_ten_more',
    keyIdea: '10 more means add 1 ten. Only the tens digit changes.',
    difficulty: 'easy',
    prompt: 'What is 10 more than ' + N + '?',
    visual: _l42VisN(N),
    answer: c,
    choices: [_l42C(c), _l42C(d1, 'err_wrong_direction', 'Subtracted 10.'), _l42C(d2, 'err_tens_not_changed', 'No change.'), _l42C(d3, 'err_off_by_ten', 'Added 20.')],
    hint: 'Count on by 10 from ' + N + '.',
    intervention: _l42IntWrongDir(N, '+')
  });
}

function _l42MkC2(N, qNum) {
  var c = N - 10, d1 = N + 10, d2 = N, d3 = N - 20;
  return _l42Q(qNum, {
    subSkill: 'find_ten_less',
    keyIdea: '10 less means subtract 1 ten. Only the tens digit changes.',
    difficulty: 'easy',
    prompt: 'What is 10 less than ' + N + '?',
    visual: _l42VisN(N),
    answer: c,
    choices: [_l42C(c), _l42C(d1, 'err_wrong_direction', 'Added 10.'), _l42C(d2, 'err_tens_not_changed', 'No change.'), _l42C(d3, 'err_off_by_ten', 'Subtracted 20.')],
    hint: 'Count back by 10 from ' + N + '.',
    intervention: _l42IntWrongDir(N, '-')
  });
}

function _l42MkC3(N, qNum) {
  var c = N + 10, d1 = N - 10, d2 = N + 1, d3 = N + 20;
  return _l42Q(qNum, {
    subSkill: 'equation_ten_more',
    keyIdea: 'Adding 10 moves the tens digit up by 1.',
    difficulty: 'easy',
    prompt: N + ' + 10 = ?',
    visual: null,
    answer: c,
    choices: [_l42C(c), _l42C(d1, 'err_wrong_direction', 'Subtracted.'), _l42C(d2, 'err_ones_changed', 'Added 1 to ones.'), _l42C(d3, 'err_off_by_ten', 'Added 20.')],
    hint: 'Add 10: count forward by 10.',
    intervention: _l42IntTensNotChanged(N, '+')
  });
}

function _l42MkC4(N, qNum) {
  var c = N - 10, d1 = N + 10, d2 = N - 1, d3 = N - 20;
  return _l42Q(qNum, {
    subSkill: 'equation_ten_less',
    keyIdea: 'Subtracting 10 moves the tens digit down by 1.',
    difficulty: 'medium',
    prompt: N + ' − 10 = ?',
    visual: null,
    answer: c,
    choices: [_l42C(c), _l42C(d1, 'err_wrong_direction', 'Added 10.'), _l42C(d2, 'err_ones_changed', 'Subtracted 1 from ones.'), _l42C(d3, 'err_off_by_ten', 'Subtracted 20.')],
    hint: 'Subtract 10: count back by 10.',
    intervention: _l42IntWrongDir(N, '-')
  });
}

function _l42MkC5(N, dir, qNum) {
  var c = dir === '+' ? N + 10 : N - 10;
  var word = dir === '+' ? 'more' : 'less';
  var d1 = dir === '+' ? N - 10 : N + 10, d2 = N, d3 = dir === '+' ? N + 20 : N - 20;
  return _l42Q(qNum, {
    subSkill: 'direction_identification',
    keyIdea: '10 more = add 10. 10 less = subtract 10.',
    difficulty: 'medium',
    prompt: 'What is 10 ' + word + ' than ' + N + '?',
    visual: _l42VisN(N),
    answer: c,
    choices: [_l42C(c), _l42C(d1, 'err_wrong_direction', 'Wrong direction.'), _l42C(d2, 'err_tens_not_changed', 'No change.'), _l42C(d3, 'err_off_by_ten', 'Changed by 20.')],
    hint: '10 ' + word + ' means ' + (dir === '+' ? 'add' : 'subtract') + ' 10.',
    intervention: _l42IntWrongDir(N, dir)
  });
}

function _l42MkC6(N, dir, qNum) {
  var c = dir === '+' ? N + 10 : N - 10;
  var oN = N % 10, tC = Math.floor(c / 10);
  var word = dir === '+' ? 'more' : 'less';
  var wrongDir = dir === '+' ? N - 10 : N + 10;
  var op1 = tC * 10 + (oN < 9 ? oN + 1 : oN - 1);
  var op2 = tC * 10 + (oN > 0 ? oN - 1 : oN + 1);
  if (op1 === op2) op2 = tC * 10 + (oN > 1 ? oN - 2 : oN + 2);
  if (op1 === c) op1 = tC * 10 + (oN > 1 ? oN - 2 : oN + 2);
  if (op2 === c) op2 = c + (oN < 8 ? 1 : -1);
  return _l42Q(qNum, {
    subSkill: 'ones_digit_stays',
    keyIdea: 'Only the tens digit changes when you add or subtract 10.',
    difficulty: 'medium',
    prompt: 'What is 10 ' + word + ' than ' + N + '?',
    visual: _l42VisN(N),
    answer: c,
    choices: [_l42C(c), _l42C(wrongDir, 'err_wrong_direction', 'Wrong direction.'), _l42C(op1, 'err_ones_changed', 'Changed the ones.'), _l42C(op2, 'err_ones_changed', 'Changed the ones.')],
    hint: 'The ones digit of ' + N + ' is ' + oN + '. It stays the same.',
    intervention: _l42IntOnesChanged(N, dir)
  });
}

function _l42MkC7(N, dir, qNum) {
  var c = dir === '+' ? N + 10 : N - 10;
  var tN = Math.floor(N / 10), oN = N % 10, tC = Math.floor(c / 10);
  var wrongDir = dir === '+' ? N - 10 : N + 10;
  var onesOnly = tN * 10 + (oN < 9 ? oN + 1 : oN - 1);
  var offByTen = dir === '+' ? c + 10 : c - 10;
  return _l42Q(qNum, {
    subSkill: 'tens_digit_changes',
    keyIdea: 'When you add or subtract 10, only the tens digit changes.',
    difficulty: 'medium',
    prompt: N + ' ' + (dir === '+' ? '+' : '−') + ' 10 = ?',
    visual: _l42VisN(N),
    answer: c,
    choices: [_l42C(c), _l42C(wrongDir, 'err_wrong_direction', 'Wrong direction.'), _l42C(onesOnly, 'err_ones_changed', 'Changed ones instead of tens.'), _l42C(offByTen, 'err_off_by_ten', 'Changed by 20.')],
    hint: 'Tens digit of ' + N + ' is ' + tN + '. It becomes ' + tC + '.',
    intervention: _l42IntTensNotChanged(N, dir)
  });
}

function _l42MkC8(N, dir, wrongVal, qNum) {
  var c = dir === '+' ? N + 10 : N - 10;
  var word = dir === '+' ? 'more' : 'less';
  var d2 = dir === '+' ? N - 10 : N + 10;
  if (d2 === wrongVal || d2 === c) d2 = dir === '+' ? N + 20 : N - 20;
  var d3 = N;
  if (d3 === wrongVal || d3 === d2 || d3 === c) d3 = c + 1;
  return _l42Q(qNum, {
    subSkill: 'error_repair',
    keyIdea: 'Check the direction and the size of the change.',
    difficulty: 'hard',
    prompt: 'A student says 10 ' + word + ' than ' + N + ' is ' + wrongVal + '. What is the correct answer?',
    visual: null,
    answer: c,
    choices: [_l42C(c), _l42C(wrongVal, 'err_wrong_direction', 'The wrong answer from the prompt.'), _l42C(d2, 'err_wrong_direction', 'Wrong direction.'), _l42C(d3, 'err_tens_not_changed', 'No change.')],
    hint: '10 ' + word + ' means ' + (dir === '+' ? 'add' : 'subtract') + ' 10 from ' + N + '.',
    intervention: _l42IntErrRepair(N, dir, wrongVal)
  });
}

function _l42MkC9(N, dir, qNum) {
  var c = dir === '+' ? N + 10 : N - 10;
  var word = dir === '+' ? 'more' : 'less';
  var d1 = dir === '+' ? N - 10 : N + 10;
  if (d1 > 120) d1 = c - 1;
  var d2 = N, d3 = c + 1;
  if (d3 > 120) d3 = c - 1;
  if (d3 === d1) d3 = c - 2;
  if (d3 === d2) d3 = c + 2;
  return _l42Q(qNum, {
    subSkill: 'boundary_100',
    keyIdea: 'The count-by-10 pattern continues past 100.',
    difficulty: 'hard',
    prompt: 'What is 10 ' + word + ' than ' + N + '?',
    visual: _l42VisN(N),
    answer: c,
    choices: [_l42C(c), _l42C(d1, 'err_wrong_direction', 'Wrong direction.'), _l42C(d2, 'err_tens_not_changed', 'No change.'), _l42C(d3, 'err_boundary_100_confusion', 'Off by 1 near 100.')],
    hint: N + ' ' + (dir === '+' ? '+' : '−') + ' 10 = ' + c + '. Count by 10.',
    intervention: _l42IntBoundary(N, dir)
  });
}

function _l42MkC10(R, dir, qNum) {
  var N = dir === '+' ? R - 10 : R + 10;
  var word = dir === '+' ? 'more' : 'less';
  var d1 = R, d2 = dir === '+' ? R + 10 : R - 10, d3 = N + 1;
  if (d3 === d1 || d3 === d2) d3 = N - 1;
  return _l42Q(qNum, {
    subSkill: 'find_start_number',
    keyIdea: 'To undo "10 more," subtract 10. To undo "10 less," add 10.',
    difficulty: 'hard',
    prompt: 'If 10 ' + word + ' than a number is ' + R + ', what is the number?',
    visual: null,
    answer: N,
    choices: [_l42C(N), _l42C(d1, 'err_wrong_direction', 'Used the result, not the starting number.'), _l42C(d2, 'err_wrong_direction', 'Wrong direction.'), _l42C(d3, 'err_place_value_confusion', 'Off by one from the starting number.')],
    hint: 'Go backwards: ' + (dir === '+' ? R + ' − 10 = ' + N : R + ' + 10 = ' + N) + '.',
    intervention: _l42IntWrongDir(N, dir === '+' ? '-' : '+')
  });
}

// ── Data arrays ───────────────────────────────────────────────────────────

var _l42_E_C1  = [11,13,15,17,22,24,26,28,31,34,36,38,43,45,47,52,54,61,63,72];
var _l42_E_C2  = [21,23,25,27,32,35,37,39,41,44,46,48,53,56,58,62,64,67,71,74];
var _l42_E_C3  = [16,18,23,29,33,37,41,49,55,58,61,64,19,27,43];
var _l42_M_C4  = [29,33,38,42,47,51,54,59,63,68,72,75,77,24,57];
var _l42_M_C5  = [[47,'+'],[85,'-'],[32,'+'],[63,'-'],[16,'+'],[78,'-'],[55,'+'],[44,'-'],[67,'+'],[52,'-'],[23,'+'],[76,'-'],[38,'+'],[61,'-'],[49,'+']];
var _l42_M_C6  = [
  [36,'+'],[25,'+'],[58,'+'],[41,'+'],[64,'+'],[17,'+'],[52,'+'],[85,'+'],[74,'+'],[38,'+'],
  [74,'-'],[27,'-'],[39,'-'],[46,'-'],[58,'-'],[71,'-'],[83,'-'],[64,'-'],[37,'-'],[75,'-']
];
var _l42_M_C7  = [[52,'+'],[31,'+'],[47,'+'],[28,'+'],[61,'+'],[14,'+'],[59,'+'],[74,'-'],[46,'-'],[83,'-'],[62,'-'],[59,'-'],[37,'-'],[78,'-'],[91,'-']];
var _l42_H_C8  = [
  [34,'+',35],[47,'-',46],[23,'+',13],[56,'-',66],[65,'+',55],
  [38,'-',48],[72,'+',73],[49,'+',39],[84,'-',83],[27,'+',47],
  [61,'-',41],[53,'+',54],[78,'-',77],[45,'+',35],[36,'-',46]
];
var _l42_H_C9  = [[90,'+'],[100,'-'],[100,'+'],[110,'-'],[110,'+'],[120,'-'],[91,'+'],[101,'-'],[95,'+'],[105,'-'],[98,'+'],[108,'-'],[102,'+'],[112,'-'],[109,'+']];
var _l42_H_C10 = [[58,'+'],[62,'+'],[35,'+'],[74,'+'],[47,'+'],[83,'+'],[91,'+'],[66,'+'],[43,'-'],[27,'-'],[54,'-'],[31,'-'],[68,'-'],[45,'-'],[57,'-']];

// ── Quiz bank assembly ────────────────────────────────────────────────────

var _l42QuizBank = [];
var _l42N = 0;

_l42_E_C1.forEach(function(N)    { _l42N++; _l42QuizBank.push(_l42MkC1(N, _l42N)); });
_l42_E_C2.forEach(function(N)    { _l42N++; _l42QuizBank.push(_l42MkC2(N, _l42N)); });
_l42_E_C3.forEach(function(N)    { _l42N++; _l42QuizBank.push(_l42MkC3(N, _l42N)); });
_l42_M_C4.forEach(function(N)    { _l42N++; _l42QuizBank.push(_l42MkC4(N, _l42N)); });
_l42_M_C5.forEach(function(p)    { _l42N++; _l42QuizBank.push(_l42MkC5(p[0], p[1], _l42N)); });
_l42_M_C6.forEach(function(p)    { _l42N++; _l42QuizBank.push(_l42MkC6(p[0], p[1], _l42N)); });
_l42_M_C7.forEach(function(p)    { _l42N++; _l42QuizBank.push(_l42MkC7(p[0], p[1], _l42N)); });
_l42_H_C8.forEach(function(p)    { _l42N++; _l42QuizBank.push(_l42MkC8(p[0], p[1], p[2], _l42N)); });
_l42_H_C9.forEach(function(p)    { _l42N++; _l42QuizBank.push(_l42MkC9(p[0], p[1], _l42N)); });
_l42_H_C10.forEach(function(p)   { _l42N++; _l42QuizBank.push(_l42MkC10(p[0], p[1], _l42N)); });

// ── Worked examples ───────────────────────────────────────────────────────

var _l42Examples = [
  {
    id: 'g1-u4-l2-ex-1',
    title: 'Example 1: Find 10 more',
    prompt: 'What is 10 more than 34?',
    visual: { type: 'base10', tens: 3, ones: 4 },
    steps: [
      '34 has 3 tens and 4 ones.',
      'Adding 10 means adding 1 more ten.',
      '3 tens + 1 ten = 4 tens.',
      'The ones digit stays the same: 4.',
      '4 tens and 4 ones = 44.'
    ],
    finalAnswer: '10 more than 34 is 44.'
  },
  {
    id: 'g1-u4-l2-ex-2',
    title: 'Example 2: Find 10 less',
    prompt: 'What is 10 less than 78?',
    visual: { type: 'base10', tens: 7, ones: 8 },
    steps: [
      '78 has 7 tens and 8 ones.',
      'Subtracting 10 means removing 1 ten.',
      '7 tens − 1 ten = 6 tens.',
      'The ones digit stays the same: 8.',
      '6 tens and 8 ones = 68.'
    ],
    finalAnswer: '10 less than 78 is 68.'
  },
  {
    id: 'g1-u4-l2-ex-3',
    title: 'Example 3: Equation form',
    prompt: '52 + 10 = ?',
    visual: { type: 'base10', tens: 5, ones: 2 },
    steps: [
      '52 = 5 tens + 2 ones.',
      'Add 10 → 1 more ten.',
      '5 + 1 = 6 tens. Ones stay at 2.',
      '6 tens + 2 ones = 62.'
    ],
    finalAnswer: '52 + 10 = 62.'
  },
  {
    id: 'g1-u4-l2-ex-4',
    title: 'Example 4: Subtract 10',
    prompt: '68 − 10 = ?',
    visual: { type: 'base10', tens: 6, ones: 8 },
    steps: [
      '68 = 6 tens + 8 ones.',
      'Subtract 10 → remove 1 ten.',
      '6 − 1 = 5 tens. Ones stay at 8.',
      '5 tens + 8 ones = 58.'
    ],
    finalAnswer: '68 − 10 = 58.'
  },
  {
    id: 'g1-u4-l2-ex-5',
    title: 'Example 5: Cross 100',
    prompt: '90 + 10 = ?',
    visual: { type: 'base10', tens: 9, ones: 0 },
    steps: [
      '90 = 9 tens.',
      '9 tens + 1 ten = 10 tens.',
      '10 tens = 1 hundred = 100.',
      'Write 1 in the hundreds place: 100.'
    ],
    finalAnswer: '90 + 10 = 100.'
  },
  {
    id: 'g1-u4-l2-ex-6',
    title: 'Example 6: Find the starting number',
    prompt: 'If 10 more than a number is 54, what is the number?',
    visual: null,
    steps: [
      '"10 more" means 10 was added to get 54.',
      'To go back, subtract 10 from 54.',
      '54 − 10 = 44.'
    ],
    finalAnswer: 'The number is 44.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 4.3 — Add Multiples of 10
//  Skill: add_multiples_of_ten · TEKS 1.3A
//  Target: 170 questions (55 easy / 70 medium / 45 hard)
//
//  C1  Direct equation A + B = ?           25E + 15M        = 40   q001–q040
//  C2  Commutative recognition              5E +  5M +  5H  = 15   q041–q055
//  C3  Model → equation                    10E +  5M        = 15   q056–q070
//  C4  Model → answer                      15E + 10M        = 25   q071–q095
//  C5  Missing addend A + __ = sum               15M + 10H  = 25   q096–q120
//  C6  Missing first addend __ + B = sum         10M +  5H  = 15   q121–q135
//  C7  Tens-language                             10M +  5H  = 15   q136–q150
//  C8  Error repair                                    10H  = 10   q151–q160
//  C9  Boundary: sum = 100                             10H  = 10   q161–q170
//  ────────────────────────────────────────────────────────────────────────────
//  TOTAL                                   55E + 70M + 45H  = 170
// ════════════════════════════════════════════════════════════════════════════

function _l43Q(n, o) {
  return {
    id: 'g1-u4-l3-q-' + String(n).padStart(3, '0'),
    teks: o.teks || ['1.3A'],
    lessonId: 'g1-u4-l3',
    skill: 'add_multiples_of_ten',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: String(o.answer),
    choices: o.choices,
    hint: o.hint,
    intervention: Object.assign({ followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true }, o.intervention)
  };
}

function _l43VisT(t) {
  if (t >= 10) return { type: 'base10', hundreds: Math.floor(t / 10), tens: t % 10, ones: 0 };
  return { type: 'base10', tens: t, ones: 0 };
}

function _l43TV(t, label) {
  var h = t >= 10 ? Math.floor(t / 10) : 0;
  return { type: 'base10', config: { hundreds: h, tens: t % 10, ones: 0, label: label || null } };
}

function _l43C(val, tag, msg) {
  return tag == null
    ? { value: String(val), correct: true }
    : { value: String(val), correct: false, errorTag: tag, misconceptionExplanation: msg || null };
}

// ── Intervention factories ────────────────────────────────────────────────

function _l43IntAddedDigitsOnly(A, B, sum) {
  var a = A / 10, b = B / 10, digitSum = a + b;
  return {
    errorTag: 'err_added_digits_only',
    title: "Don't forget the zeros — " + A + " is not " + a,
    teachingSteps: [
      A + ' is not ' + a + '. It means ' + a + ' tens, which is ' + A + '.',
      B + ' is not ' + b + '. It means ' + b + ' tens, which is ' + B + '.',
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens.',
      (a + b) + ' tens = ' + sum + ', not ' + digitSum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum + ' because ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
    teachingVisual: _l43TV(a + b, a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}

function _l43IntDroppedZero(missing, other, sum) {
  var mTens = missing / 10;
  return {
    errorTag: 'err_dropped_zero',
    title: 'The missing number is a tens number — keep the zero',
    teachingSteps: [
      'The blank stands for a TENS number, not a single digit.',
      sum + ' has ' + (sum / 10) + ' tens. We already have ' + other + ' (' + (other / 10) + ' tens).',
      'Missing tens: ' + (sum / 10) + ' − ' + (other / 10) + ' = ' + mTens + ' tens.',
      mTens + ' tens = ' + missing + ', not ' + mTens + '.',
      other + ' + ' + missing + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + missing + ' (not ' + mTens + ') because ' + mTens + ' tens = ' + missing + '.',
    teachingVisual: _l43TV(sum / 10, mTens + ' tens = ' + missing + ' (not ' + mTens + ')')
  };
}

function _l43IntOffByTen(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_off_by_ten',
    title: 'Count the tens carefully',
    teachingSteps: [
      A + ' has ' + a + ' tens. ' + B + ' has ' + b + ' tens.',
      'Count all tens together: ' + a + ' + ' + b + ' = ' + (a + b) + ' tens.',
      (a + b) + ' tens = ' + sum + '.',
      'Not ' + (sum - 10) + ' and not ' + (sum + 10) + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum + ' because ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
    teachingVisual: _l43TV(a + b, a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}

function _l43IntMissingTensValue(missing, other, sum) {
  var mTens = missing / 10, oTens = other / 10, sTens = sum / 10;
  return {
    errorTag: 'err_missing_tens_value',
    title: 'The blank is a tens number, not a count of rods',
    teachingSteps: [
      sum + ' = ' + sTens + ' tens. We know ' + other + ' = ' + oTens + ' tens.',
      'Missing tens: ' + sTens + ' − ' + oTens + ' = ' + mTens + ' tens.',
      mTens + ' tens = ' + missing + '.',
      'Write ' + missing + ' in the blank — not just the digit ' + mTens + '.',
      other + ' + ' + missing + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: 'The missing number is ' + missing + ' (' + mTens + ' tens), not the digit ' + mTens + '.',
    teachingVisual: _l43TV(sTens, 'Missing piece = ' + mTens + ' tens = ' + missing)
  };
}

function _l43IntPlaceValueConfusion(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Each number tells you how many tens',
    teachingSteps: [
      A + ' means ' + a + ' tens rods.',
      B + ' means ' + b + ' tens rods.',
      'Count all rods together: ' + a + ' + ' + b + ' = ' + (a + b) + ' rods.',
      (a + b) + ' rods = ' + sum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = ' + sum + ' (' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens).',
    teachingVisual: _l43TV(a + b, a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum)
  };
}

function _l43IntBoundary100(A, B) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: '10 tens = 100 — crossing into the hundreds is okay',
    teachingSteps: [
      A + ' = ' + a + ' tens. ' + B + ' = ' + b + ' tens.',
      a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens.',
      (a + b) + ' tens = 100 — that is 1 hundred, 0 tens, 0 ones.',
      '100 is not 10. It is a whole new group: one hundred.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' = 100 because ' + a + ' tens + ' + b + ' tens = 10 tens = 1 hundred.',
    teachingVisual: _l43TV(10, a + ' tens + ' + b + ' tens = 10 tens = 100')
  };
}

function _l43IntCommutativeConfusion(A, B, sum) {
  var a = A / 10, b = B / 10;
  return {
    errorTag: 'err_commutative_confusion',
    title: 'You can add in either order — the answer stays the same',
    teachingSteps: [
      A + ' + ' + B + ': ' + a + ' tens + ' + b + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
      B + ' + ' + A + ': ' + b + ' tens + ' + a + ' tens = ' + (a + b) + ' tens = ' + sum + '.',
      'Addition does not care which number comes first.',
      A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: A + ' + ' + B + ' and ' + B + ' + ' + A + ' both equal ' + sum + '. Order does not change the sum.',
    teachingVisual: _l43TV(a + b, A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum)
  };
}

function _l43IntModelToAnswer(T) {
  var answer = T * 10;
  return {
    errorTag: 'err_added_digits_only',
    title: T + ' tens rods = ' + answer + ', not ' + T,
    teachingSteps: [
      'Each tens rod is worth 10, not 1.',
      'You see ' + T + ' rods — that means ' + T + ' tens.',
      T + ' tens = ' + answer + '.',
      'Always keep the zero when you count tens rods.'
    ],
    correctAnswerExplanation: T + ' tens rods = ' + answer + '. Each rod is 10, so ' + T + ' × 10 = ' + answer + '.',
    teachingVisual: _l43TV(T, T + ' tens rods = ' + answer)
  };
}

// ── Category maker functions ──────────────────────────────────────────────

function _l43MkC1(A, B, n, diff, hasVis) {
  var a = A / 10, b = B / 10, sum = A + B, digitSum = a + b;
  var off = (sum + 10 <= 100) ? sum + 10 : sum - 10;
  var used = [sum, digitSum, off], pvc;
  var cands = [sum - 20, sum + 20, sum - 30, A, B];
  for (var ci = 0; ci < cands.length; ci++) {
    var cv = cands[ci];
    if (cv > 0 && cv <= 100 && used.indexOf(cv) === -1) { pvc = cv; break; }
  }
  if (pvc === undefined) pvc = (sum > 50) ? 10 : 90;
  return _l43Q(n, {
    subSkill: 'basic_tens_addition',
    keyIdea: 'To add ' + A + ' + ' + B + ', count the tens: ' + a + ' + ' + b + ' = ' + (a + b) + ' tens = ' + sum + '.',
    difficulty: diff,
    prompt: 'What is ' + A + ' + ' + B + '?',
    visual: hasVis ? _l43VisT(a) : null,
    answer: sum,
    choices: [
      _l43C(sum),
      _l43C(digitSum, 'err_added_digits_only', 'Added ' + a + ' + ' + b + ' and forgot the zeros.'),
      _l43C(off, 'err_off_by_ten', 'Off by one ten.'),
      _l43C(pvc, 'err_place_value_confusion', 'Mixed up the place values.')
    ],
    hint: A + ' = ' + a + ' tens. ' + B + ' = ' + b + ' tens. ' + a + ' + ' + b + ' = ' + (a + b) + ' tens = ' + sum + '.',
    intervention: _l43IntAddedDigitsOnly(A, B, sum)
  });
}

function _l43MkC2(A, B, n, diff) {
  var a = A / 10, b = B / 10, sum = A + B, digitSum = a + b;
  var off = (sum + 10 <= 100) ? sum + 10 : sum - 10;
  var d4 = (A !== sum && A !== digitSum && A !== off) ? A : B;
  return _l43Q(n, {
    subSkill: 'commutative_tens',
    keyIdea: 'You can add in either order: ' + A + ' + ' + B + ' = ' + B + ' + ' + A + ' = ' + sum + '.',
    difficulty: diff,
    prompt: A + ' + ' + B + ' = ' + B + ' + ' + A + '. What is the answer?',
    visual: null,
    answer: sum,
    choices: [
      _l43C(sum),
      _l43C(digitSum, 'err_added_digits_only', 'Added ' + a + ' + ' + b + ' — forgot the zeros.'),
      _l43C(off, 'err_off_by_ten', 'Off by ten.'),
      _l43C(d4, 'err_commutative_confusion', 'Stopped at one addend instead of finding the sum.')
    ],
    hint: A + ' + ' + B + ' is the same as ' + B + ' + ' + A + '. Find the total.',
    intervention: _l43IntCommutativeConfusion(A, B, sum)
  });
}

function _l43MkC3(A, B, n, diff) {
  var a = A / 10, b = B / 10, sum = A + B;
  var correctExpr = A + ' + ' + B + ' = ' + sum;
  var droppedZeros = a + ' + ' + b + ' = ' + (a + b);
  var missingB = A + ' + ' + b + ' = ' + (A + b);
  var wrongSum = A + ' + ' + B + ' = ' + (sum - 10);
  return _l43Q(n, {
    subSkill: 'model_to_equation',
    keyIdea: 'Each rod in a base-10 model stands for 10.',
    difficulty: diff,
    prompt: 'This model shows ' + A + '. A student adds ' + B + ' more. Which equation shows this?',
    visual: _l43VisT(a),
    answer: correctExpr,
    choices: [
      _l43C(correctExpr),
      _l43C(droppedZeros, 'err_added_digits_only', 'Used the digits ' + a + ' and ' + b + ' instead of the tens numbers.'),
      _l43C(missingB, 'err_missing_tens_value', 'Used the digit ' + b + ' for ' + B + ' — dropped its zero.'),
      _l43C(wrongSum, 'err_off_by_ten', 'Right addends but sum is off by 10.')
    ],
    hint: 'The model shows ' + a + ' rods = ' + A + '. Add ' + B + ' more rods.',
    intervention: _l43IntAddedDigitsOnly(A, B, sum)
  });
}

function _l43MkC4(T, n, diff, pStyle) {
  var answer = T * 10, digitOnly = T;
  var offLow = (T - 1) * 10, offHigh = (T + 1) * 10;
  var prompts = [
    'This model shows ' + T + ' tens rods. What number is this?',
    'Count the tens rods. What number do they show?',
    'A base-10 model has ' + T + ' tens rods. What number does it represent?',
    'How many is ' + T + ' tens?'
  ];
  return _l43Q(n, {
    subSkill: 'model_to_answer',
    keyIdea: 'Each tens rod is worth 10. Count the rods to find the number.',
    difficulty: diff,
    prompt: prompts[pStyle] || prompts[0],
    visual: _l43VisT(T),
    answer: answer,
    choices: [
      _l43C(answer),
      _l43C(digitOnly, 'err_added_digits_only', 'Counted ' + T + ' rods and wrote ' + T + ' — forgot the zero.'),
      _l43C(offLow, 'err_off_by_ten', 'Off by one ten (one rod too few).'),
      _l43C(offHigh, 'err_off_by_ten', 'Off by one ten (one rod too many).')
    ],
    hint: 'Each rod = 10. ' + T + ' rods = ' + T + ' × 10 = ' + answer + '.',
    intervention: _l43IntModelToAnswer(T)
  });
}

function _l43MkC5(A, sum, n, diff, hasVis) {
  var missing = sum - A, mTens = missing / 10, droppedZero = mTens;
  var off = (missing + 10 < sum && missing + 10 <= 90) ? missing + 10 : missing - 10;
  if (off <= 0) off = missing + 10;
  var d4val = (A !== missing) ? A : sum;
  var d4tag = (A !== missing) ? 'err_missing_tens_value' : 'err_place_value_confusion';
  var d4msg = (A !== missing) ? 'Wrote the known addend (' + A + ') instead of the missing one.' : 'Wrote the total instead of the missing addend.';
  return _l43Q(n, {
    subSkill: 'missing_addend',
    keyIdea: 'Count how many more tens are needed to reach the total.',
    difficulty: diff,
    prompt: A + ' + ___ = ' + sum + '. What is the missing number?',
    visual: hasVis ? _l43VisT(sum / 10) : null,
    answer: missing,
    choices: [
      _l43C(missing),
      _l43C(droppedZero, 'err_dropped_zero', 'Found ' + mTens + ' tens but dropped the zero — should be ' + missing + '.'),
      _l43C(off, 'err_off_by_ten', 'Off by one ten.'),
      _l43C(d4val, d4tag, d4msg)
    ],
    hint: sum + ' has ' + (sum / 10) + ' tens. ' + A + ' has ' + (A / 10) + ' tens. ' + (sum / 10) + ' − ' + (A / 10) + ' = ' + mTens + ' tens = ' + missing + '.',
    intervention: _l43IntDroppedZero(missing, A, sum)
  });
}

function _l43MkC6(B, sum, n, diff, hasVis) {
  var missing = sum - B, mTens = missing / 10, droppedZero = mTens;
  var off = (missing + 10 < sum && missing + 10 <= 90) ? missing + 10 : missing - 10;
  if (off <= 0) off = missing + 10;
  var d4val = (B !== missing) ? B : sum;
  var d4tag = (B !== missing) ? 'err_missing_tens_value' : 'err_place_value_confusion';
  var d4msg = (B !== missing) ? 'Wrote the known addend (' + B + ') instead of the missing one.' : 'Wrote the total instead of the missing addend.';
  return _l43Q(n, {
    subSkill: 'missing_first_addend',
    keyIdea: 'The blank comes first — subtract the known addend from the total to find it.',
    difficulty: diff,
    prompt: '___ + ' + B + ' = ' + sum + '. What is the missing number?',
    visual: hasVis ? _l43VisT(sum / 10) : null,
    answer: missing,
    choices: [
      _l43C(missing),
      _l43C(droppedZero, 'err_dropped_zero', 'Found ' + mTens + ' tens but dropped the zero — should be ' + missing + '.'),
      _l43C(off, 'err_off_by_ten', 'Off by one ten.'),
      _l43C(d4val, d4tag, d4msg)
    ],
    hint: sum + ' has ' + (sum / 10) + ' tens. ' + B + ' has ' + (B / 10) + ' tens. ' + (sum / 10) + ' − ' + (B / 10) + ' = ' + mTens + ' tens = ' + missing + '.',
    intervention: _l43IntDroppedZero(missing, B, sum)
  });
}

function _l43MkC7(X, Y, n) {
  var tensSum = X + Y, answer = tensSum * 10, digitOnly = tensSum, oneAddend = X * 10;
  var off = (answer + 10 <= 100) ? answer + 10 : answer - 10;
  return _l43Q(n, {
    subSkill: 'tens_language',
    keyIdea: X + ' tens + ' + Y + ' tens = ' + tensSum + ' tens = ' + answer + '.',
    difficulty: 'medium',
    prompt: X + ' tens + ' + Y + ' tens = ___ tens. What number is that?',
    visual: null,
    answer: answer,
    choices: [
      _l43C(answer),
      _l43C(digitOnly, 'err_added_digits_only', 'Counted ' + tensSum + ' tens but wrote ' + tensSum + ' — not ' + answer + '.'),
      _l43C(oneAddend, 'err_missing_tens_value', 'Stopped at the first group — used ' + X + ' tens = ' + oneAddend + '.'),
      _l43C(off, 'err_off_by_ten', 'Off by one ten.')
    ],
    hint: X + ' + ' + Y + ' = ' + tensSum + ' tens. ' + tensSum + ' tens = ' + answer + '.',
    intervention: _l43IntAddedDigitsOnly(X * 10, Y * 10, answer)
  });
}

function _l43MkC7Hard(X, Y, n) {
  var tensSum = X + Y, answer = X * 10, digitOnly = X;
  var off = (answer + 10 <= 90) ? answer + 10 : answer - 10;
  var other = Y * 10;
  if (other === answer || other === off || other <= 0) {
    other = (answer + 20 <= 90) ? answer + 20 : answer - 20;
  }
  if (other === answer || other === off || other <= 0 || other > 100) other = 10;
  return _l43Q(n, {
    subSkill: 'tens_language',
    keyIdea: 'Find the missing tens: total minus the known tens gives the blank.',
    difficulty: 'hard',
    prompt: '___ tens + ' + Y + ' tens = ' + tensSum + ' tens. What number fills the blank?',
    visual: null,
    answer: answer,
    choices: [
      _l43C(answer),
      _l43C(digitOnly, 'err_added_digits_only', 'Wrote the digit ' + X + ' instead of ' + X + ' tens (' + answer + ').'),
      _l43C(off, 'err_off_by_ten', 'Off by one ten.'),
      _l43C(other, 'err_place_value_confusion', 'Used the other addend\'s value instead.')
    ],
    hint: tensSum + ' tens total minus ' + Y + ' tens = ' + X + ' tens = ' + answer + '.',
    intervention: _l43IntAddedDigitsOnly(answer, Y * 10, tensSum * 10)
  });
}

function _l43MkC8(A, B, n) {
  var a = A / 10, b = B / 10, sum = A + B, digitSum = a + b;
  var off = sum - 10;
  var alt = (sum - 20 > 0 && sum - 20 !== off && sum - 20 !== digitSum) ? sum - 20 : sum + 20;
  if (alt > 100 || alt === sum || alt === off || alt === digitSum) alt = (sum > 50) ? 20 : 80;
  return _l43Q(n, {
    subSkill: 'error_repair',
    keyIdea: 'Adding only the digits gives the wrong answer. Keep the zeros.',
    difficulty: 'hard',
    prompt: 'A student says ' + A + ' + ' + B + ' = ' + digitSum + ' because ' + a + ' + ' + b + ' = ' + digitSum + '. What is the correct answer?',
    visual: null,
    answer: sum,
    choices: [
      _l43C(sum),
      _l43C(digitSum, 'err_added_digits_only', 'This is the student\'s wrong answer — they dropped the zeros.'),
      _l43C(off, 'err_off_by_ten', 'Off by ten.'),
      _l43C(alt, 'err_place_value_confusion', 'Another incorrect answer.')
    ],
    hint: A + ' = ' + a + ' tens. ' + B + ' = ' + b + ' tens. The answer must end in zero.',
    intervention: _l43IntAddedDigitsOnly(A, B, sum)
  });
}

function _l43MkC9(A, B, n, showSumVis) {
  var a = A / 10, b = B / 10;
  var d4val = A;
  if (d4val === 10 || d4val === 90 || d4val === 100) {
    d4val = (A > 50) ? A - 20 : A + 20;
  }
  if (d4val === 10 || d4val === 90 || d4val === 100 || d4val <= 0) d4val = 20;
  return _l43Q(n, {
    subSkill: 'boundary_sum_100',
    keyIdea: '10 tens = 100. Crossing into the hundreds is okay.',
    difficulty: 'hard',
    prompt: 'What is ' + A + ' + ' + B + '?',
    visual: showSumVis ? _l43VisT(10) : _l43VisT(a),
    answer: 100,
    choices: [
      _l43C(100),
      _l43C(10, 'err_boundary_100_confusion', 'Confused 1 hundred with 1 ten — 100 is not 10.'),
      _l43C(90, 'err_off_by_ten', 'Off by one ten — 9 tens, not 10.'),
      _l43C(d4val, 'err_missing_tens_value', 'Stopped after the first group instead of adding both.')
    ],
    hint: A + ' = ' + a + ' tens. ' + B + ' = ' + b + ' tens. ' + a + ' + ' + b + ' = 10 tens = 100.',
    intervention: _l43IntBoundary100(A, B)
  });
}

// ── Data arrays ───────────────────────────────────────────────────────────

// C1 easy: [A, B, hasVis] — both A,B ∈ {10..50}, sum ≤ 80
var _l43_E_C1 = [
  [10,10,false],[10,20,false],[10,30,false],[10,40,false],[10,50,false],
  [20,10,false],[20,20,false],[20,30,false],[20,40,false],[20,50,false],
  [30,10,false],[30,20,false],[30,30,false],[30,40,false],[30,50,false],
  [40,10,false],[40,20,false],[40,30,false],[40,40,false],
  [50,10,false],[50,20,false],[50,30,false],
  [10,20,true],[20,30,true],[30,20,true]
];

// C1 medium: [A, B, hasVis] — at least one ≥ 50, sum 60–90
var _l43_M_C1 = [
  [50,10,false],[50,20,false],[50,30,false],[50,40,false],
  [60,10,false],[60,20,false],[60,30,false],
  [70,10,false],[70,20,false],[80,10,false],
  [10,60,false],[20,60,false],[30,60,false],
  [20,70,false],[10,80,false]
];

// C2: [A, B]
var _l43_E_C2 = [[10,20],[20,30],[10,40],[30,20],[20,40]];
var _l43_M_C2 = [[30,60],[50,20],[40,50],[20,70],[60,20]];
var _l43_H_C2 = [[50,30],[40,40],[60,30],[70,20],[80,10]];

// C3: [A, B]
var _l43_E_C3 = [
  [10,20],[10,30],[20,10],[20,20],[20,30],
  [20,40],[30,10],[30,20],[30,40],[40,20]
];
var _l43_M_C3 = [[30,40],[40,30],[50,20],[60,20],[40,40]];

// C4: [T, pStyle]
var _l43_E_C4 = [
  [2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],
  [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,0]
];
var _l43_M_C4 = [
  [3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
  [9,1],[5,3],[7,3]
];

// C5: [A, sum, hasVis]
var _l43_M_C5 = [
  [20,50,false],[30,60,false],[40,70,false],[10,40,false],
  [20,60,false],[30,70,false],[40,80,false],
  [20,70,false],[30,80,false],[40,90,false],[10,60,false],
  [20,80,true],[30,90,false],[10,70,true],[10,80,false]
];
var _l43_H_C5 = [
  [20,90,false],[50,90,false],[60,90,false],[70,90,false],
  [10,90,false],[40,90,false],[30,90,false],
  [40,80,false],[50,80,false],[60,80,false]
];

// C6: [B, sum, hasVis]
var _l43_M_C6 = [
  [20,50,false],[30,60,false],[40,70,false],[10,50,false],
  [20,60,false],[30,70,false],[40,80,false],
  [20,70,false],[30,80,false],[10,60,false]
];
var _l43_H_C6 = [
  [30,90,false],[40,90,false],[20,80,false],[10,80,false],[20,90,false]
];

// C7 medium: [X, Y]
var _l43_M_C7 = [
  [2,3],[3,4],[1,4],[2,4],[1,5],[2,5],[3,5],[1,6],[2,6],[4,4]
];
// C7 hard: [X, Y] — "___ tens + Y tens = (X+Y) tens. What number fills the blank?"
var _l43_H_C7 = [[5,4],[6,3],[5,3],[7,2],[6,2]];

// C8 hard: [A, B]
var _l43_H_C8 = [
  [10,20],[10,30],[20,30],[20,40],[30,40],
  [30,50],[40,50],[10,60],[20,60],[30,60]
];

// C9 hard: [A, B, showSumVis]
var _l43_H_C9 = [
  [50,50,false],[40,60,false],[60,40,false],[30,70,false],[70,30,false],
  [20,80,false],[80,20,false],[10,90,false],[90,10,false],[40,60,true]
];

// ── Build quiz bank ───────────────────────────────────────────────────────

var _l43QuizBank = [];
var _l43N = 0;

_l43_E_C1.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC1(p[0], p[1], _l43N, 'easy',   p[2])); });
_l43_M_C1.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC1(p[0], p[1], _l43N, 'medium', p[2])); });
_l43_E_C2.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC2(p[0], p[1], _l43N, 'easy')); });
_l43_M_C2.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC2(p[0], p[1], _l43N, 'medium')); });
_l43_H_C2.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC2(p[0], p[1], _l43N, 'hard')); });
_l43_E_C3.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC3(p[0], p[1], _l43N, 'easy')); });
_l43_M_C3.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC3(p[0], p[1], _l43N, 'medium')); });
_l43_E_C4.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC4(p[0], _l43N, 'easy',   p[1])); });
_l43_M_C4.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC4(p[0], _l43N, 'medium', p[1])); });
_l43_M_C5.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC5(p[0], p[1], _l43N, 'medium', p[2])); });
_l43_H_C5.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC5(p[0], p[1], _l43N, 'hard',   false)); });
_l43_M_C6.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC6(p[0], p[1], _l43N, 'medium', p[2])); });
_l43_H_C6.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC6(p[0], p[1], _l43N, 'hard',   false)); });
_l43_M_C7.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC7(p[0], p[1], _l43N)); });
_l43_H_C7.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC7Hard(p[0], p[1], _l43N)); });
_l43_H_C8.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC8(p[0], p[1], _l43N)); });
_l43_H_C9.forEach(function(p) { _l43N++; _l43QuizBank.push(_l43MkC9(p[0], p[1], _l43N, p[2])); });

// ── Worked examples ───────────────────────────────────────────────────────

var _l43Examples = [
  {
    id: 'g1-u4-l3-ex-1',
    title: 'Example 1: Add two tens numbers',
    prompt: 'What is 30 + 40?',
    visual: { type: 'base10', tens: 7, ones: 0 },
    steps: [
      '30 means 3 tens.',
      '40 means 4 tens.',
      'Count all tens together: 3 tens + 4 tens = 7 tens.',
      '7 tens = 70.',
      '30 + 40 = 70.'
    ],
    finalAnswer: '30 + 40 = 70.'
  },
  {
    id: 'g1-u4-l3-ex-2',
    title: 'Example 2: Order does not matter',
    prompt: 'What is 40 + 30?',
    visual: { type: 'base10', tens: 7, ones: 0 },
    steps: [
      '40 + 30 has the same numbers as 30 + 40, just in a different order.',
      '4 tens + 3 tens = 7 tens, no matter which comes first.',
      '40 + 30 = 70.'
    ],
    finalAnswer: '40 + 30 = 70.'
  },
  {
    id: 'g1-u4-l3-ex-3',
    title: 'Example 3: Reading a base-10 model',
    prompt: 'A model shows 5 tens rods. A student adds 2 more. How many tens rods are there? What number is that?',
    visual: { type: 'base10', tens: 5, ones: 0 },
    steps: [
      'Count the first group: 5 tens rods = 50.',
      'Add 2 more tens rods: 5 + 2 = 7 tens rods.',
      '7 tens rods = 70.',
      '50 + 20 = 70.'
    ],
    finalAnswer: '50 + 20 = 70.'
  },
  {
    id: 'g1-u4-l3-ex-4',
    title: 'Example 4: Missing addend',
    prompt: '30 + ___ = 80. What is the missing number?',
    visual: null,
    steps: [
      '80 has 8 tens.',
      'We already have 30 — that is 3 tens.',
      'How many more tens do we need? 8 − 3 = 5 tens.',
      '5 tens = 50.',
      '30 + 50 = 80.'
    ],
    finalAnswer: 'The missing number is 50.'
  },
  {
    id: 'g1-u4-l3-ex-5',
    title: 'Example 5: Tens language',
    prompt: '4 tens + 3 tens = ___ tens. What number is that?',
    visual: null,
    steps: [
      '4 tens is 40. 3 tens is 30.',
      '4 tens + 3 tens = 7 tens.',
      '7 tens = 70.'
    ],
    finalAnswer: '4 tens + 3 tens = 7 tens = 70.'
  },
  {
    id: 'g1-u4-l3-ex-6',
    title: 'Example 6: Error repair',
    prompt: 'A student says 20 + 50 = 7. What is the mistake?',
    visual: null,
    steps: [
      'The student did 2 + 5 = 7 — they forgot the zeros!',
      '20 means 2 tens. 50 means 5 tens.',
      '2 tens + 5 tens = 7 tens = 70.',
      'The correct answer is 70, not 7.'
    ],
    finalAnswer: '20 + 50 = 70.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 4.4 — Add Tens to Two-Digit Numbers
//  Skill: add_tens_to_two_digit · TEKS 1.3A, 1.5C
//  Target: 170 questions (55 easy / 70 medium / 45 hard)
//
//  C1  Add exactly 10 to two-digit N            15E + 10M        = 25   q001–q025
//  C2  Add 20, 30, or 40 to two-digit N         12E +  8M        = 20   q026–q045
//  C3  Mixed equation to answer (text only)       8E + 12M +  5H  = 25   q046–q070
//  C4  Base-10 model → result                     8E +  7M        = 15   q071–q085
//  C5  Missing tens addend: N + __ = sum               10M + 10H  = 20   q086–q105
//  C6  Missing starting number: __ + M = sum            5M + 10H  = 15   q106–q120
//  C7  Ones-stay-same identification              5E +  5M        = 10   q121–q130
//  C8  Tens-change identification                 5E +  5M        = 10   q131–q140
//  C9  Error repair                                          15H  = 15   q141–q155
//  C10 Boundary high-sum (sums 90–99)             2E +  8M +  5H = 15   q156–q170
//  ────────────────────────────────────────────────────────────────────────────
//  TOTAL                                          55E + 70M + 45H = 170
//
//  Scope guardrails:
//    - N is always two-digit with ones digit ≠ 0
//    - M ∈ {10, 20, 30, 40} only
//    - All sums ≤ 99 (100 appears only as a distractor in C10 hard)
//    - No adding ones to ones (that is L4.1); no mult-of-10+mult-of-10 (L4.3)
//
//  Error tags (8):
//    err_ten_as_one          — treated M as ones (47+20=49)
//    err_ones_changed        — changed ones digit instead of tens
//    err_tens_not_changed    — left tens digit unchanged
//    err_off_by_ten          — answer off by exactly one ten
//    err_missing_tens_value  — found digit not value (3 not 30)
//    err_start_number_confusion — used wrong starting number
//    err_place_value_confusion  — generic place value error
//    err_boundary_100_confusion — went to 100 when answer is ≤99
// ════════════════════════════════════════════════════════════════════════════

// ── Core factory ─────────────────────────────────────────────────────────────

function _l44Q(n, o) {
  return {
    id: 'g1-u4-l4-q-' + String(n).padStart(3, '0'),
    teks: o.teks || ['1.3A', '1.5C'],
    lessonId: 'g1-u4-l4',
    skill: 'add_tens_to_two_digit',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: String(o.answer),
    choices: o.choices,
    hint: o.hint,
    intervention: Object.assign({ followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true }, o.intervention)
  };
}

function _l44VisBase10(t, o) { return { type: 'base10', tens: t, ones: o }; }

function _l44TV(t, o, label) {
  return { type: 'base10', config: { tens: t, ones: o, label: label || null } };
}

function _l44C(val, tag, msg) {
  return tag == null
    ? { value: String(val), correct: true }
    : { value: String(val), correct: false, errorTag: tag, misconceptionExplanation: msg || null };
}

// ── Intervention factories ────────────────────────────────────────────────────

function _l44IntTenAsOne(N, M, sum, wrong) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  return {
    errorTag: 'err_ten_as_one',
    title: M + ' is ' + addT + ' tens — not ' + addT + ' ones',
    teachingSteps: [
      N + ' has ' + nT + ' tens and ' + nO + ' ones.',
      'We are adding ' + M + '. That is ' + addT + ' tens — not ' + addT + ' ones.',
      'Add the tens: ' + nT + ' tens + ' + addT + ' tens = ' + newT + ' tens.',
      'The ones stay the same: ' + nO + '.',
      N + ' + ' + M + ' = ' + sum + ', not ' + wrong + '.'
    ],
    correctAnswerExplanation: N + ' + ' + M + ' = ' + sum + ' because ' + M + ' means ' + addT + ' tens, so the tens go from ' + nT + ' to ' + newT + '.',
    teachingVisual: _l44TV(newT, nO, N + ' + ' + M + ' = ' + sum)
  };
}

function _l44IntOnesChanged(N, M, sum) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  return {
    errorTag: 'err_ones_changed',
    title: 'The ones digit never changes when you add tens',
    teachingSteps: [
      N + ' has ' + nO + ' ones. Adding ' + M + ' does not change the ones.',
      M + ' is tens only — it has no ones.',
      'Tens change: ' + nT + ' → ' + newT + '. Ones stay: ' + nO + '.',
      N + ' + ' + M + ' = ' + sum + '.'
    ],
    correctAnswerExplanation: N + ' + ' + M + ' = ' + sum + '. The ones digit stays ' + nO + ' because adding tens never touches the ones place.',
    teachingVisual: _l44TV(newT, nO, 'Ones stay ' + nO)
  };
}

function _l44IntTensNotChanged(N, M, sum) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  return {
    errorTag: 'err_tens_not_changed',
    title: 'Adding tens must change the tens digit',
    teachingSteps: [
      'We are adding ' + M + ' to ' + N + '.',
      M + ' means ' + addT + ' tens. The tens digit must go up by ' + addT + '.',
      N + ' has ' + nT + ' tens. After adding: ' + nT + ' + ' + addT + ' = ' + newT + ' tens.',
      'The answer is ' + newT + ' tens and ' + nO + ' ones = ' + sum + '.'
    ],
    correctAnswerExplanation: N + ' + ' + M + ' = ' + sum + '. The tens digit changes from ' + nT + ' to ' + newT + '.',
    teachingVisual: _l44TV(newT, nO, nT + ' tens → ' + newT + ' tens')
  };
}

function _l44IntOffByTen(N, M, sum) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  return {
    errorTag: 'err_off_by_ten',
    title: 'Count the tens carefully — you were off by one ten',
    teachingSteps: [
      N + ' has ' + nT + ' tens and ' + nO + ' ones.',
      'We are adding ' + M + '. That is exactly ' + addT + ' tens.',
      'Count up: ' + nT + ' + ' + addT + ' = ' + newT + ' tens.',
      'The ones stay ' + nO + '. So the answer is ' + sum + '.'
    ],
    correctAnswerExplanation: N + ' + ' + M + ' = ' + sum + '. Count the added tens carefully: ' + nT + ' + ' + addT + ' = ' + newT + '.',
    teachingVisual: _l44TV(newT, nO, 'Count ' + addT + ' new tens')
  };
}

function _l44IntMissingTensValue(N, missing, sum) {
  var nT = Math.floor(N / 10), nO = N % 10, sumT = Math.floor(sum / 10);
  return {
    errorTag: 'err_missing_tens_value',
    title: 'Find the missing tens by comparing the tens digits',
    teachingSteps: [
      sum + ' has ' + sumT + ' tens. ' + N + ' has ' + nT + ' tens.',
      'The ones are the same (' + nO + ' = ' + nO + ') — only the tens differ.',
      'How many tens were added? ' + sumT + ' − ' + nT + ' = ' + (sumT - nT) + ' tens.',
      (sumT - nT) + ' tens = ' + missing + '. The missing number is ' + missing + '.'
    ],
    correctAnswerExplanation: N + ' + ' + missing + ' = ' + sum + '. The tens went from ' + nT + ' to ' + sumT + ', a difference of ' + (sumT - nT) + ' tens = ' + missing + '.',
    teachingVisual: _l44TV(sumT, nO, N + ' + ' + missing + ' = ' + sum)
  };
}

function _l44IntStartNumConfusion(N, M, sum) {
  var nT = Math.floor(N / 10), nO = N % 10;
  return {
    errorTag: 'err_start_number_confusion',
    title: 'The starting number is the answer minus the tens added',
    teachingSteps: [
      'The answer is ' + sum + '. We added ' + M + '.',
      'To find where we started: ' + sum + ' − ' + M + ' = ' + N + '.',
      N + ' has ' + nT + ' tens and ' + nO + ' ones.',
      'Check: ' + N + ' + ' + M + ' = ' + sum + '. Correct!'
    ],
    correctAnswerExplanation: 'The missing starting number is ' + N + '. ' + N + ' + ' + M + ' = ' + sum + '.',
    teachingVisual: _l44TV(nT, nO, 'Start: ' + N)
  };
}

function _l44IntPlaceValueConfusion(N, M, sum) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  return {
    errorTag: 'err_place_value_confusion',
    title: 'Tens and ones live in different places — keep them separate',
    teachingSteps: [
      N + ': the ' + nT + ' is in the tens place (worth ' + (nT * 10) + '). The ' + nO + ' is in the ones place.',
      'We are adding ' + M + '. That goes in the tens place.',
      'Tens: ' + nT + ' + ' + addT + ' = ' + newT + '. Ones: ' + nO + ' + 0 = ' + nO + '.',
      newT + ' tens and ' + nO + ' ones = ' + sum + '.'
    ],
    correctAnswerExplanation: N + ' + ' + M + ' = ' + sum + '. Add only the tens; the ones digit stays ' + nO + '.',
    teachingVisual: _l44TV(newT, nO, N + ' + ' + M + ' = ' + sum)
  };
}

function _l44IntBoundary100(N, M, sum) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  return {
    errorTag: 'err_boundary_100_confusion',
    title: sum + ' is the answer — it is less than 100',
    teachingSteps: [
      N + ' has ' + nT + ' tens and ' + nO + ' ones.',
      'Adding ' + M + ': ' + nT + ' + ' + addT + ' = ' + newT + ' tens.',
      newT + ' tens and ' + nO + ' ones = ' + sum + '.',
      sum + ' is less than 100 — we do not reach 100 here.'
    ],
    correctAnswerExplanation: N + ' + ' + M + ' = ' + sum + '. ' + newT + ' tens and ' + nO + ' ones = ' + sum + ', which is still less than 100.',
    teachingVisual: _l44TV(newT, nO, sum + ' — still less than 100')
  };
}

// ── Category builders ─────────────────────────────────────────────────────────

function _l44MkC1(N, n, diff, useVisual) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + 10;
  var w1 = N + 1;
  var w2 = N + 20 <= 99 ? N + 20 : N;
  if (w2 === sum) w2 = sum - 20 > 0 ? sum - 20 : sum + 11;
  var w3 = sum + 10 <= 99 ? sum + 10 : sum - 20;
  if (w3 === w2 || w3 === w1 || w3 === sum) w3 = sum - 11 > 0 ? sum - 11 : sum + 21;
  return _l44Q(n, {
    subSkill: 'add_ten_direct',
    keyIdea: 'Adding 10 increases the tens digit by 1. The ones digit stays the same.',
    difficulty: diff,
    prompt: 'What is ' + N + ' + 10?',
    visual: useVisual ? _l44VisBase10(nT, nO) : null,
    answer: sum,
    choices: [
      _l44C(sum),
      _l44C(w1, 'err_ten_as_one', 'Added 10 as 1 one instead of 1 ten.'),
      _l44C(w2, 'err_off_by_ten', 'Added 2 tens instead of 1.'),
      _l44C(w3, 'err_place_value_confusion', 'Place value error.')
    ],
    hint: N + ' has ' + nT + ' tens. Add 1 ten: ' + (nT + 1) + ' tens and ' + nO + ' ones = ' + sum + '.',
    intervention: _l44IntTenAsOne(N, 10, sum, w1)
  });
}

function _l44MkC2(N, M, n, diff, useVisual) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + M, addT = M / 10;
  var w1 = (nO + addT < 10) ? nT * 10 + (nO + addT) : N + addT;
  var w2 = sum + 10 <= 99 ? sum + 10 : sum - 10;
  if (w2 === w1 || w2 === sum || w2 <= 0) w2 = sum - 10 > 0 ? sum - 10 : sum + 20;
  var w3 = sum - 20 > 0 && sum - 20 !== w1 && sum - 20 !== w2 ? sum - 20 : sum + 20;
  if (w3 > 99 || w3 === sum || w3 === w1 || w3 === w2) w3 = nT * 10 + nO + addT * 2;
  if (w3 > 99 || w3 === sum || w3 === w1 || w3 === w2) w3 = sum - 30 > 0 ? sum - 30 : 10;
  return _l44Q(n, {
    subSkill: 'add_tens_direct',
    keyIdea: 'Adding ' + M + ' increases the tens digit by ' + addT + '. The ones digit stays the same.',
    difficulty: diff,
    prompt: 'What is ' + N + ' + ' + M + '?',
    visual: useVisual ? _l44VisBase10(nT, nO) : null,
    answer: sum,
    choices: [
      _l44C(sum),
      _l44C(w1, 'err_ten_as_one', 'Added ' + addT + ' ones instead of ' + addT + ' tens.'),
      _l44C(w2, 'err_off_by_ten', 'Off by one ten.'),
      _l44C(w3, 'err_place_value_confusion', 'Place value error.')
    ],
    hint: N + ' has ' + nT + ' tens. Add ' + addT + ' tens: ' + (nT + addT) + ' tens and ' + nO + ' ones = ' + sum + '.',
    intervention: _l44IntTenAsOne(N, M, sum, w1)
  });
}

function _l44MkC3(N, M, n, diff) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + M, addT = M / 10;
  var w1 = (nO + addT < 10) ? nT * 10 + (nO + addT) : N + addT;
  var w2 = sum - 10 > 0 ? sum - 10 : sum + 10;
  if (w2 === w1 || w2 === sum) w2 = sum + 10 <= 99 ? sum + 10 : sum - 20;
  var w3 = sum + 10 <= 99 && sum + 10 !== w2 ? sum + 10 : sum - 20;
  if (w3 <= 0 || w3 === sum || w3 === w1 || w3 === w2) w3 = N + (M / 5);
  if (w3 === sum || w3 === w1 || w3 === w2) w3 = sum + 11 <= 99 ? sum + 11 : sum - 11;
  return _l44Q(n, {
    subSkill: 'equation_to_answer',
    keyIdea: 'Adding tens only changes the tens digit. The ones digit stays the same.',
    difficulty: diff,
    prompt: 'What is ' + N + ' + ' + M + '?',
    visual: null,
    answer: sum,
    choices: [
      _l44C(sum),
      _l44C(w1, 'err_ten_as_one', 'Added ' + addT + ' ones instead of ' + addT + ' tens.'),
      _l44C(w2, 'err_off_by_ten', 'Off by one ten.'),
      _l44C(w3, 'err_place_value_confusion', 'Place value error.')
    ],
    hint: 'The ones digit of ' + N + ' stays ' + nO + '. Only the tens digit changes.',
    intervention: _l44IntTenAsOne(N, M, sum, w1)
  });
}

function _l44MkC4(N, M, n, diff) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + M, addT = M / 10;
  var w1 = (nO + addT < 10) ? nT * 10 + (nO + addT) : N + addT;
  var w2 = sum - 10 > 0 ? sum - 10 : sum + 10;
  if (w2 === w1 || w2 === sum) w2 = sum + 10 <= 99 ? sum + 10 : sum - 20;
  var w3 = sum + 10 <= 99 && sum + 10 !== w2 ? sum + 10 : sum - 20;
  if (w3 <= 0 || w3 === sum || w3 === w1 || w3 === w2) w3 = nT * 10 + nO + M;
  if (w3 > 99 || w3 === sum || w3 === w1 || w3 === w2) w3 = sum - 21 > 0 ? sum - 21 : sum + 21;
  return _l44Q(n, {
    subSkill: 'model_to_result',
    keyIdea: 'Adding tens rods increases the tens digit. The ones cubes stay the same.',
    difficulty: diff,
    prompt: 'The model shows ' + N + '. You add ' + addT + ' tens rod' + (addT > 1 ? 's' : '') + '. What is the total?',
    visual: _l44VisBase10(nT, nO),
    answer: sum,
    choices: [
      _l44C(sum),
      _l44C(w1, 'err_ten_as_one', 'Added the rod count as ones instead of tens.'),
      _l44C(w2, 'err_off_by_ten', 'Off by one ten.'),
      _l44C(w3, 'err_place_value_confusion', 'Miscounted the rods.')
    ],
    hint: 'Count new total tens: ' + nT + ' + ' + addT + ' = ' + (nT + addT) + ' tens. Keep the ' + nO + ' ones cubes.',
    intervention: _l44IntTenAsOne(N, M, sum, w1)
  });
}

function _l44MkC5(N, sum, n, diff, useVisual) {
  var nT = Math.floor(N / 10), nO = N % 10, missing = sum - N, sumT = Math.floor(sum / 10);
  var w1 = missing / 10;
  var w2 = missing + 10 <= 40 ? missing + 10 : missing - 10;
  if (w2 <= 0 || w2 === missing) w2 = missing + 10;
  var w3 = N !== missing ? N : sum;
  return _l44Q(n, {
    subSkill: 'missing_tens_addend',
    keyIdea: 'Find the missing tens by comparing the tens digits of the two numbers.',
    difficulty: diff,
    prompt: N + ' + ___ = ' + sum + '. What is the missing number?',
    visual: useVisual ? _l44VisBase10(sumT, nO) : null,
    answer: missing,
    choices: [
      _l44C(missing),
      _l44C(w1, 'err_missing_tens_value', 'Found the digit (' + w1 + ') but forgot the zero.'),
      _l44C(w2, 'err_off_by_ten', 'Off by one ten from the missing number.'),
      _l44C(w3, 'err_start_number_confusion', 'Used the starting number instead of the missing addend.')
    ],
    hint: sum + ' has ' + sumT + ' tens, ' + N + ' has ' + nT + ' tens. Missing tens: ' + sumT + ' − ' + nT + ' = ' + (sumT - nT) + ' = ' + missing + '.',
    intervention: _l44IntMissingTensValue(N, missing, sum)
  });
}

function _l44MkC6(startN, M, sum, n, diff) {
  var sT = Math.floor(startN / 10), sO = startN % 10;
  var w1 = sum;
  var w2 = startN + 10 <= 99 ? startN + 10 : startN - 10;
  if (w2 === startN || w2 === w1) w2 = startN - 10 > 0 ? startN - 10 : startN + 20;
  var w3 = M !== startN && M !== w2 ? M : Math.floor(sum / 10) * 10;
  if (w3 === startN || w3 === w1 || w3 === w2) w3 = sum - startN;
  return _l44Q(n, {
    subSkill: 'missing_start_number',
    keyIdea: 'To find the starting number, subtract the added tens from the answer.',
    difficulty: diff,
    prompt: '___ + ' + M + ' = ' + sum + '. What is the missing number?',
    visual: null,
    answer: startN,
    choices: [
      _l44C(startN),
      _l44C(w1, 'err_start_number_confusion', 'Used the answer instead of working backwards.'),
      _l44C(w2, 'err_off_by_ten', 'Off by one ten.'),
      _l44C(w3, 'err_start_number_confusion', 'Used the added amount or digit instead of the start.')
    ],
    hint: sum + ' − ' + M + ' = ' + startN + '.',
    intervention: _l44IntStartNumConfusion(startN, M, sum)
  });
}

function _l44MkC7(N, M, n, diff) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + M, addT = M / 10;
  var wrongOnes = nO + addT < 10 ? nO + addT : nO + 1;
  return _l44Q(n, {
    subSkill: 'ones_stay_same',
    keyIdea: 'The ones digit stays the same when you add tens to a number.',
    difficulty: diff,
    prompt: 'In ' + N + ' + ' + M + ', what happens to the ones digit?',
    visual: null,
    answer: 'It stays ' + nO,
    choices: [
      _l44C('It stays ' + nO),
      _l44C('It becomes ' + wrongOnes, 'err_ten_as_one', 'Added the tens count to the ones digit.'),
      _l44C('It becomes 0', 'err_ones_changed', 'Cleared the ones digit when adding tens.'),
      _l44C('It changes to match the tens', 'err_place_value_confusion', 'Confused tens and ones behavior.')
    ],
    hint: 'Adding ' + M + ' only changes the tens digit. The ones digit (' + nO + ') stays the same.',
    intervention: _l44IntOnesChanged(N, M, sum)
  });
}

function _l44MkC8(N, M, n, diff) {
  var nT = Math.floor(N / 10), nO = N % 10, addT = M / 10, newT = nT + addT;
  var w1 = nT;
  var w2 = addT;
  if (w2 === newT || w2 === w1) w2 = addT + 1 <= 9 ? addT + 1 : addT - 1;
  var w3 = nT + M > 9 ? nT + 1 : nT + M;
  if (w3 === newT || w3 === w1 || w3 === w2) w3 = newT + 1 <= 9 ? newT + 1 : newT - 1;
  if (w3 === newT || w3 === w1 || w3 === w2 || w3 < 1) w3 = 1;
  return _l44Q(n, {
    subSkill: 'tens_change',
    keyIdea: 'Adding tens increases the tens digit by the number of tens added.',
    difficulty: diff,
    prompt: N + ' + ' + M + ' = ?. How many tens does the answer have?',
    visual: null,
    answer: String(newT),
    choices: [
      _l44C(String(newT)),
      _l44C(String(w1), 'err_tens_not_changed', 'Kept the same number of tens — did not add ' + addT + '.'),
      _l44C(String(w2), 'err_start_number_confusion', 'Only counted the added tens, not the starting tens.'),
      _l44C(String(w3), 'err_ten_as_one', 'Miscounted the total tens.')
    ],
    hint: N + ' has ' + nT + ' tens. Add ' + addT + ' more: ' + nT + ' + ' + addT + ' = ' + newT + ' tens.',
    intervention: _l44IntTensNotChanged(N, M, N + M)
  });
}

function _l44MkC9(N, M, wrong, n) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + M;
  var off = sum - 10 > 0 && sum - 10 !== wrong ? sum - 10 : sum + 10;
  if (off > 99 || off === sum || off === wrong) off = sum - 20 > 0 ? sum - 20 : sum + 20;
  var alt = sum + 10 <= 99 && sum + 10 !== off ? sum + 10 : nT * 10;
  if (alt === sum || alt === wrong || alt === off) alt = wrong + 10 <= 99 ? wrong + 10 : wrong - 10;
  return _l44Q(n, {
    subSkill: 'error_repair',
    keyIdea: 'Adding ' + M + ' means adding ' + (M / 10) + ' tens — not ' + (M / 10) + ' ones.',
    difficulty: 'hard',
    prompt: 'A student says ' + N + ' + ' + M + ' = ' + wrong + '. What is the correct answer?',
    visual: null,
    answer: sum,
    choices: [
      _l44C(sum),
      _l44C(wrong, 'err_ten_as_one', 'The student added ' + (M / 10) + ' ones instead of ' + (M / 10) + ' tens.'),
      _l44C(off, 'err_off_by_ten', 'Off by one ten.'),
      _l44C(alt, 'err_place_value_confusion', 'Another place value error.')
    ],
    hint: M + ' means ' + (M / 10) + ' tens. ' + nT + ' tens + ' + (M / 10) + ' tens = ' + (nT + M / 10) + ' tens. Ones stay ' + nO + '.',
    intervention: _l44IntTenAsOne(N, M, sum, wrong)
  });
}

function _l44MkC10(N, M, n, diff) {
  var nT = Math.floor(N / 10), nO = N % 10, sum = N + M, addT = M / 10, newT = nT + addT;
  var w1 = (nO + addT < 10) ? nT * 10 + (nO + addT) : N + addT;
  var w2 = sum - 10 > 0 ? sum - 10 : sum - 11;
  if (w2 === w1 || w2 === sum || w2 <= 0) w2 = sum - 11 > 0 ? sum - 11 : sum + 10;
  var w3 = (sum === 99) ? 100 : (sum + 1 <= 99 ? sum + 1 : sum - 1);
  var tag3 = (sum === 99) ? 'err_boundary_100_confusion' : 'err_off_by_ten';
  var msg3 = (sum === 99) ? 'Went to 100 — the answer is still 99.' : 'Off by one.';
  if (w3 === w1 || w3 === w2 || w3 === sum) w3 = sum - 12 > 0 ? sum - 12 : 100;
  return _l44Q(n, {
    subSkill: 'boundary_high_sum',
    keyIdea: 'Adding tens can bring you close to 99. Count the tens carefully.',
    difficulty: diff,
    prompt: 'What is ' + N + ' + ' + M + '?',
    visual: _l44VisBase10(nT, nO),
    answer: sum,
    choices: [
      _l44C(sum),
      _l44C(w1, 'err_ten_as_one', 'Added ' + addT + ' ones instead of ' + addT + ' tens.'),
      _l44C(w2, 'err_off_by_ten', 'Off by one ten.'),
      _l44C(w3, tag3, msg3)
    ],
    hint: nT + ' tens + ' + addT + ' tens = ' + newT + ' tens. Keep the ' + nO + ' ones. Answer: ' + sum + '.',
    intervention: (sum === 99) ? _l44IntBoundary100(N, M, sum) : _l44IntOffByTen(N, M, sum)
  });
}

// ── Data arrays ───────────────────────────────────────────────────────────────

// C1: [N, useVisual] — add exactly 10
var _l44_E_C1 = [
  [24,true],[31,true],[45,true],[53,false],[14,false],
  [23,false],[41,false],[35,false],[52,false],[16,false],
  [33,false],[42,true],[21,false],[13,false],[25,true]
];
var _l44_M_C1 = [
  [51,false],[63,false],[74,false],[57,true],[65,false],
  [71,false],[76,true],[58,false],[72,false],[67,false]
];

// C2: [N, M, useVisual]
var _l44_E_C2 = [
  [36,20,true],[47,30,false],[23,20,false],[15,30,false],[42,20,false],
  [34,30,true],[21,20,false],[26,30,false],[13,20,false],[44,30,false],
  [52,20,true],[16,30,false]
];
var _l44_M_C2 = [
  [46,20,false],[37,30,false],[54,20,false],[28,40,false],
  [43,30,true],[62,20,false],[53,30,false],[44,40,false]
];

// C3: [N, M] — text only
var _l44_E_C3 = [[24,10],[36,20],[45,10],[13,30],[52,20],[31,10],[25,30],[42,20]];
var _l44_M_C3 = [[47,30],[62,20],[35,40],[53,30],[24,40],[43,20],[56,30],[16,40],[64,20],[38,30],[21,40],[57,20]];
var _l44_H_C3 = [[74,20],[63,30],[55,40],[76,20],[48,40]];

// C4: [N, M]
var _l44_E_C4 = [[24,10],[31,20],[15,30],[42,10],[23,20],[32,30],[14,10],[41,20]];
var _l44_M_C4 = [[46,20],[37,30],[53,20],[44,30],[52,30],[35,40],[63,20]];

// C5: [N, sum, useVisual]
var _l44_M_C5 = [
  [35,65,true],[24,44,true],[42,72,false],[53,83,true],[16,36,false],
  [27,57,false],[48,78,false],[31,61,false],[22,52,true],[44,64,false]
];
var _l44_H_C5 = [
  [59,89,false],[49,79,false],[39,69,false],[58,88,false],[47,77,false],
  [36,76,false],[19,59,false],[28,68,false],[67,97,false],[18,58,false]
];

// C6: [startN, M, sum]
var _l44_M_C6 = [[54,20,74],[53,10,63],[52,30,82],[37,20,57],[46,30,76]];
var _l44_H_C6 = [
  [67,30,97],[69,20,89],[54,40,94],[53,30,83],[58,20,78],
  [46,40,86],[41,30,71],[73,20,93],[59,40,99],[62,30,92]
];

// C7: [N, M]
var _l44_E_C7 = [[24,10],[36,20],[47,30],[53,20],[62,10]];
var _l44_M_C7 = [[45,30],[67,20],[58,40],[71,20],[34,40]];

// C8: [N, M]
var _l44_E_C8 = [[24,10],[36,20],[53,30],[42,20],[31,10]];
var _l44_M_C8 = [[47,30],[62,20],[55,40],[73,20],[64,30]];

// C9: [N, M, wrong] — wrong = ten-as-one error (add M/10 to ones digit)
var _l44_H_C9 = [
  [47,20,49],[36,30,39],[53,20,55],[62,30,65],[24,20,26],
  [41,30,44],[73,20,75],[34,40,38],[56,30,59],[22,40,26],
  [45,20,47],[63,30,66],[71,20,73],[38,40,42],[27,30,30]
];

// C10: [N, M, diff] — boundary high-sum (sums 90–99)
var _l44_C10 = [
  [81,10,'easy'],[73,20,'easy'],
  [61,30,'medium'],[72,20,'medium'],[63,30,'medium'],[54,40,'medium'],
  [75,20,'medium'],[66,30,'medium'],[57,40,'medium'],[78,20,'medium'],
  [89,10,'hard'],[79,20,'hard'],[69,30,'hard'],[59,40,'hard'],[58,40,'hard']
];

// ── QuizBank assembly ─────────────────────────────────────────────────────────

var _l44QuizBank = [];
var _l44N = 0;

// C1 q001–q025
_l44_E_C1.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC1(p[0], _l44N, 'easy',   p[1])); });
_l44_M_C1.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC1(p[0], _l44N, 'medium', p[1])); });

// C2 q026–q045
_l44_E_C2.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC2(p[0], p[1], _l44N, 'easy',   p[2])); });
_l44_M_C2.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC2(p[0], p[1], _l44N, 'medium', p[2])); });

// C3 q046–q070
_l44_E_C3.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC3(p[0], p[1], _l44N, 'easy'  )); });
_l44_M_C3.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC3(p[0], p[1], _l44N, 'medium')); });
_l44_H_C3.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC3(p[0], p[1], _l44N, 'hard'  )); });

// C4 q071–q085
_l44_E_C4.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC4(p[0], p[1], _l44N, 'easy'  )); });
_l44_M_C4.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC4(p[0], p[1], _l44N, 'medium')); });

// C5 q086–q105
_l44_M_C5.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC5(p[0], p[1], _l44N, 'medium', p[2])); });
_l44_H_C5.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC5(p[0], p[1], _l44N, 'hard',   false)); });

// C6 q106–q120
_l44_M_C6.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC6(p[0], p[1], p[2], _l44N, 'medium')); });
_l44_H_C6.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC6(p[0], p[1], p[2], _l44N, 'hard'  )); });

// C7 q121–q130
_l44_E_C7.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC7(p[0], p[1], _l44N, 'easy'  )); });
_l44_M_C7.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC7(p[0], p[1], _l44N, 'medium')); });

// C8 q131–q140
_l44_E_C8.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC8(p[0], p[1], _l44N, 'easy'  )); });
_l44_M_C8.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC8(p[0], p[1], _l44N, 'medium')); });

// C9 q141–q155
_l44_H_C9.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC9(p[0], p[1], p[2], _l44N)); });

// C10 q156–q170
_l44_C10.forEach(function(p) { _l44N++; _l44QuizBank.push(_l44MkC10(p[0], p[1], _l44N, p[2])); });

// ── Worked examples ───────────────────────────────────────────────────────────

var _l44Examples = [
  {
    id: 'g1-u4-l4-ex-1',
    title: 'Example 1: Add 10 to a two-digit number',
    prompt: 'What is 24 + 10?',
    visual: { type: 'base10', tens: 2, ones: 4 },
    steps: [
      '24 has 2 tens and 4 ones.',
      'We are adding 10 — that is 1 ten.',
      '2 tens + 1 ten = 3 tens. The ones stay: 4 ones.',
      '3 tens and 4 ones = 34.',
      '24 + 10 = 34.'
    ],
    finalAnswer: '24 + 10 = 34.'
  },
  {
    id: 'g1-u4-l4-ex-2',
    title: 'Example 2: Add 20 to a two-digit number',
    prompt: 'What is 36 + 20?',
    visual: { type: 'base10', tens: 3, ones: 6 },
    steps: [
      '36 has 3 tens and 6 ones.',
      'We are adding 20 — that is 2 tens.',
      '3 tens + 2 tens = 5 tens. The ones stay: 6 ones.',
      '5 tens and 6 ones = 56.',
      '36 + 20 = 56.'
    ],
    finalAnswer: '36 + 20 = 56.'
  },
  {
    id: 'g1-u4-l4-ex-3',
    title: 'Example 3: Add 30 to a two-digit number',
    prompt: 'What is 47 + 30?',
    visual: { type: 'base10', tens: 4, ones: 7 },
    steps: [
      '47 has 4 tens and 7 ones.',
      'We are adding 30 — that is 3 tens.',
      '4 tens + 3 tens = 7 tens. The ones stay: 7 ones.',
      '7 tens and 7 ones = 77.',
      '47 + 30 = 77.'
    ],
    finalAnswer: '47 + 30 = 77.'
  },
  {
    id: 'g1-u4-l4-ex-4',
    title: 'Example 4: Finding the missing tens addend',
    prompt: '35 + ___ = 65. What is the missing number?',
    visual: null,
    steps: [
      '65 has 6 tens and 5 ones.',
      'We started with 35 — that is 3 tens and 5 ones.',
      'The ones are the same (5 = 5), so only the tens changed.',
      '6 tens − 3 tens = 3 tens.',
      '3 tens = 30. The missing number is 30.'
    ],
    finalAnswer: 'The missing number is 30.'
  },
  {
    id: 'g1-u4-l4-ex-5',
    title: 'Example 5: Fixing a common mistake',
    prompt: 'A student says 47 + 20 = 49. What is the correct answer?',
    visual: null,
    steps: [
      'The student added 20 as if it were 2 ones: 7 + 2 = 9.',
      '20 is not 2 ones — it is 2 tens.',
      '47 has 4 tens. Add 2 more tens: 4 + 2 = 6 tens.',
      '6 tens and 7 ones = 67.',
      'The correct answer is 67, not 49.'
    ],
    finalAnswer: '47 + 20 = 67.'
  },
  {
    id: 'g1-u4-l4-ex-6',
    title: 'Example 6: Ones stay, tens change',
    prompt: '62 + 20: what digit stays the same? What digit changes?',
    visual: null,
    steps: [
      '62 + 20: look at the ones digit. It is 2.',
      'Adding 20 (2 tens) never touches the ones place.',
      'The ones digit stays 2.',
      '62 has 6 tens. Adding 20 gives 6 + 2 = 8 tens.',
      'The tens digit changes from 6 to 8. Answer: 82.'
    ],
    finalAnswer: '62 + 20 = 82. Ones digit (2) stays. Tens digit changes (6 → 8).'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  Spec
// ════════════════════════════════════════════════════════════════════════════

export const G1_U4_SPEC = {
  unitId: 'g1u4',
  title: 'Tens and Ones Operations',
  teks: ['1.3A', '1.5C', '1.5D', '1.5G'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 4.1 — Add Tens and Ones (170 questions)
    //  TEKS 1.3A (supporting 1.5G)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l1',
      title: 'Add Tens and Ones',
      teks: ['1.3A', '1.5G'],
      skill: 'add_tens_and_ones',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'A number like 40 means "4 tens" — that is 4 groups of ten.',
        'A number like 5 means "5 ones" — five single units.',
        'To add a multiple of 10 and a one-digit number, keep the tens in the tens place and the ones in the ones place.',
        'The tens digit comes from how many tens you have. The ones digit comes from how many ones you have. (40 + 5 → 4 in the tens place, 5 in the ones place → 45.)',
        'Numbers can be added in any order, so 40 + 5 and 5 + 40 give the same answer.',
        'When you add a one-digit number to a multiple of 10, the tens digit doesn\'t change — you only fill in the ones place.'
      ],
      workedExamples: _l41Examples,
      quizBank: _l41QuizBank,
      diagnostics: {
        commonDistractors: [
          { value: 'added_digits_only',  meaning: 'Added only the digits, ignoring place value (40 + 5 → 9).',                       errorTag: 'err_added_digits_only' },
          { value: 'dropped_zero',       meaning: 'Dropped the zero from a place-value VALUE (chose 4 instead of 40).',              errorTag: 'err_dropped_zero' },
          { value: 'ones_in_tens_place', meaning: 'Put the ones digit in the tens slot (40 + 5 → 54).',                              errorTag: 'err_ones_in_tens_place' },
          { value: 'reversed_tens_ones', meaning: 'Reversed the digit order in the answer (read 45 as 54).',                         errorTag: 'err_reversed_tens_ones' },
          { value: 'missing_tens_value', meaning: 'For ☐ + d = sum, answered with the digit instead of the tens value.',              errorTag: 'err_missing_tens_value' },
          { value: 'missing_ones_value', meaning: 'For M + ☐ = sum, answered with M instead of the ones digit.',                       errorTag: 'err_missing_ones_value' },
          { value: 'off_by_one',         meaning: 'Counted ±1 from the correct answer.',                                              errorTag: 'err_off_by_one' },
          { value: 'place_value_confusion', meaning: 'Generic place-value error not fitting the more specific tags.',                 errorTag: 'err_place_value_confusion' }
        ],
        errorTags: [
          'err_added_digits_only', 'err_dropped_zero', 'err_ones_in_tens_place',
          'err_reversed_tens_ones', 'err_missing_tens_value', 'err_missing_ones_value',
          'err_off_by_one', 'err_place_value_confusion'
        ],
        interventionRules: [
          { errorTag: 'err_added_digits_only',     style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_dropped_zero',          style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_ones_in_tens_place',    style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_reversed_tens_ones',    style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_missing_tens_value',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_missing_ones_value',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_off_by_one',            style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_place_value_confusion', style: 'visual_model', followUpRule: 'same_skill_new_numbers' }
        ]
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 4.2 — 10 More and 10 Less (165 questions)
    //  Scope: 34 + 10 = 44, 78 − 10 = 68, up to 120
    //  TEKS 1.5C
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l2',
      title: '10 More and 10 Less',
      teks: ['1.5C'],
      skill: 'ten_more_ten_less',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        '10 more than a number means add 10 — count forward one group of ten.',
        '10 less than a number means subtract 10 — count back one group of ten.',
        'When you add or subtract 10, only the tens digit changes. The ones digit stays the same.',
        'The count-by-10 pattern continues past 100: 90 → 100 → 110 → 120.',
        'To find the starting number when you know the result, reverse the operation: subtract 10 if "10 more," add 10 if "10 less."'
      ],
      workedExamples: _l42Examples,
      quizBank: _l42QuizBank,
      diagnostics: {
        commonDistractors: [
          { value: 'err_wrong_direction',    meaning: 'Subtracted when should add, or vice versa.',      errorTag: 'err_wrong_direction' },
          { value: 'err_tens_not_changed',   meaning: 'Did not change the tens digit at all.',            errorTag: 'err_tens_not_changed' },
          { value: 'err_ones_changed',       meaning: 'Changed the ones digit instead of (or as well as) the tens.', errorTag: 'err_ones_changed' },
          { value: 'err_off_by_ten',         meaning: 'Changed by 20 instead of 10.',                    errorTag: 'err_off_by_ten' },
          { value: 'err_place_value_confusion',  meaning: 'Generic place-value error, including off-by-one on starting number.', errorTag: 'err_place_value_confusion' },
          { value: 'err_boundary_100_confusion', meaning: 'Error specifically at the 90↔100↔120 boundary.',                       errorTag: 'err_boundary_100_confusion' }
        ],
        errorTags: [
          'err_wrong_direction', 'err_tens_not_changed', 'err_ones_changed',
          'err_off_by_ten', 'err_place_value_confusion', 'err_boundary_100_confusion'
        ],
        interventionRules: [
          { errorTag: 'err_wrong_direction',       style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_tens_not_changed',      style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_ones_changed',          style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_off_by_ten',            style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_place_value_confusion', style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_boundary_100_confusion',style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
        ]
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 4.3 — Add Multiples of 10 (170 questions)
    //  Scope: 20 + 30 = 50, 40 + 60 = 100, no ones digits, no regrouping
    //  TEKS 1.3A
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l3',
      title: 'Add Multiples of 10',
      teks: ['1.3A'],
      skill: 'add_multiples_of_ten',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        '30 means 3 tens — not 3. 40 means 4 tens — not 4.',
        'To add 30 + 40, add the tens: 3 tens + 4 tens = 7 tens.',
        '7 tens = 70. Always keep the zero — it shows this is a tens number.',
        'You can add in any order: 30 + 40 = 40 + 30 = 70.',
        'A base-10 model for 30 + 40 shows 7 tens rods — count them to find 70.',
        '50 + 50 = 100 because 5 tens + 5 tens = 10 tens, and 10 tens make 1 hundred.'
      ],
      workedExamples: _l43Examples,
      quizBank: _l43QuizBank,
      diagnostics: {
        commonDistractors: [
          { value: 'err_added_digits_only',      meaning: 'Treated tens as singles — dropped both zeros (30+40=7).', errorTag: 'err_added_digits_only' },
          { value: 'err_dropped_zero',            meaning: 'Missing addend: found the digit count but dropped the zero (chose 4 not 40).', errorTag: 'err_dropped_zero' },
          { value: 'err_off_by_ten',              meaning: 'Answer is ±10 from correct — miscounted tens.', errorTag: 'err_off_by_ten' },
          { value: 'err_missing_tens_value',      meaning: 'Gave the digit count instead of the tens value (3 instead of 30).', errorTag: 'err_missing_tens_value' },
          { value: 'err_place_value_confusion',   meaning: 'Generic place-value error — wrong tens range or digits scrambled.', errorTag: 'err_place_value_confusion' },
          { value: 'err_boundary_100_confusion',  meaning: 'Error at the 90→100 crossing (50+50=10).', errorTag: 'err_boundary_100_confusion' },
          { value: 'err_commutative_confusion',   meaning: 'Thinks order matters; chose wrong equation as the commutative pair.', errorTag: 'err_commutative_confusion' }
        ],
        errorTags: [
          'err_added_digits_only', 'err_dropped_zero', 'err_off_by_ten',
          'err_missing_tens_value', 'err_place_value_confusion',
          'err_boundary_100_confusion', 'err_commutative_confusion'
        ],
        interventionRules: [
          { errorTag: 'err_added_digits_only',     style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_dropped_zero',          style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_off_by_ten',            style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_missing_tens_value',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_place_value_confusion', style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_boundary_100_confusion',style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
          { errorTag: 'err_commutative_confusion', style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
        ]
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 4.4 — Add Tens to Two-Digit Numbers (0 questions — scaffold)
    //  Scope: 24 + 10 = 34, 36 + 20 = 56, no regrouping or carrying
    //  TEKS 1.3A
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l4',
      title: 'Add Tens to Two-Digit Numbers',
      teks: ['1.3A', '1.5C'],
      skill: 'add_tens_to_two_digit',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Adding tens only changes the tens digit — the ones digit stays the same.',
        'In 47 + 20, the 7 stays. Only the tens change: 4 tens + 2 tens = 6 tens.',
        '47 + 20 = 67, not 49. Adding 20 means adding 2 tens, not 2 ones.',
        'Adding 10 moves the tens digit up by 1. Adding 20 moves it up by 2. Adding 30 moves it up by 3.',
        'To add tens to a two-digit number, count up the tens rods and keep the ones cubes exactly as they were.',
        'The ones digit in the answer always matches the ones digit in the starting number.'
      ],
      workedExamples: _l44Examples,
      quizBank: _l44QuizBank,
      diagnostics: {
        commonDistractors: [],
        errorTags: [
          'err_ten_as_one', 'err_ones_changed', 'err_tens_not_changed',
          'err_off_by_ten', 'err_missing_tens_value', 'err_start_number_confusion',
          'err_place_value_confusion', 'err_boundary_100_confusion'
        ],
        interventionRules: [
          { tag: 'err_ten_as_one',             followUp: 'same_skill_new_numbers' },
          { tag: 'err_ones_changed',            followUp: 'same_skill_new_numbers' },
          { tag: 'err_tens_not_changed',        followUp: 'same_skill_new_numbers' },
          { tag: 'err_off_by_ten',              followUp: 'same_skill_new_numbers' },
          { tag: 'err_missing_tens_value',      followUp: 'same_skill_new_numbers' },
          { tag: 'err_start_number_confusion',   followUp: 'same_skill_new_numbers' },
          { tag: 'err_place_value_confusion',   followUp: 'same_skill_new_numbers' },
          { tag: 'err_boundary_100_confusion',  followUp: 'same_skill_new_numbers' }
        ]
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 4.5 — Tens and Ones Word Problems (0 questions — scaffold)
    //  Scope: SINGLE-STEP word problems only — no two-step, no regrouping
    //  TEKS 1.3A, 1.5D
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l5',
      title: 'Tens and Ones Word Problems',
      teks: ['1.3A', '1.5D'],
      skill: 'tens_and_ones_word_problems',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    }

  ]
};

export default G1_U4_SPEC;
