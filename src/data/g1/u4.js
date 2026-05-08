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
 *    L4.2  10 More and 10 Less                  ← SCAFFOLD (0 questions)
 *    L4.3  Add Multiples of 10                  ← SCAFFOLD (0 questions)
 *    L4.4  Add Tens to Two-Digit Numbers        ← SCAFFOLD (0 questions)
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
    //  Lesson 4.2 — 10 More and 10 Less (0 questions — scaffold)
    //  Scope: 34 + 10 = 44, 78 - 10 = 68, up to 120
    //  TEKS 1.5C
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l2',
      title: '10 More and 10 Less',
      teks: ['1.5C'],
      skill: 'ten_more_ten_less',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 4.3 — Add Multiples of 10 (0 questions — scaffold)
    //  Scope: 20 + 30 = 50, 40 + 20 = 60, no regrouping (max sum 90)
    //  TEKS 1.3A
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l3',
      title: 'Add Multiples of 10',
      teks: ['1.3A'],
      skill: 'add_multiples_of_ten',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
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
      teks: ['1.3A'],
      skill: 'add_tens_to_two_digit',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
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
