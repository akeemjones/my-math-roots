/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 2: Place Value
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.2A  Recognize and create sets of 10 and adjust for ones
 *    1.2B  Compose/decompose numbers to 120 as tens and ones
 *    1.2C  Represent numbers to 120 in standard, expanded, and word form
 *
 *  Lessons:
 *    L2.1  Groups of Ten      — 1.2B  compose_groups_of_ten       ← COMPLETE
 *    L2.2  Tens and Ones      — 1.2B  tens_and_ones               ← stub
 *    L2.3  Numbers to 120     — 1.2B  place_value_to_120          ← stub
 *    L2.4  Represent Numbers  — 1.2C  represent_numbers_to_120    ← stub
 * ════════════════════════════════════════════════════════════════════════════ */

// ── L2.1 factory ──────────────────────────────────────────────────────────────
function _l21Q(n, o) {
  return {
    id: 'g1-u2-l1-q-' + String(n).padStart(3, '0'),
    teks: ['1.2B'],
    lessonId: 'g1-u2-l1',
    skill: 'compose_groups_of_ten',
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

// ── L2.1 worked examples ──────────────────────────────────────────────────────
const _l21Examples = [
  {
    id: 'g1-u2-l1-ex-001',
    title: 'Example 1: 2 Tens and 4 Ones',
    prompt: 'How many? Count the tens rods and ones cubes.',
    visual: { type: 'base10', config: { tens: 2, ones: 4 } },
    steps: [
      'Count the rods: 1 rod, 2 rods. There are 2 tens.',
      'Count the cubes: 1, 2, 3, 4. There are 4 ones.',
      '2 tens and 4 ones = 24.'
    ],
    finalAnswer: '24',
    teachingNote: 'Count each denomination separately. Rods = tens, cubes = ones.',
    relatedKeyIdea: 'The tens digit comes first when you write a two-digit number.'
  },
  {
    id: 'g1-u2-l1-ex-002',
    title: 'Example 2: 5 Tens and 0 Ones',
    prompt: 'How many? Count the tens rods. Are there any ones cubes?',
    visual: { type: 'base10', config: { tens: 5, ones: 0 } },
    steps: [
      'Count the rods: 1, 2, 3, 4, 5. There are 5 tens.',
      'There are no cubes at all. The ones place is 0.',
      '5 tens and 0 ones = 50. The 0 must be written!'
    ],
    finalAnswer: '50',
    teachingNote: 'Zero ones is a common error point — students write 5 instead of 50.',
    relatedKeyIdea: 'If there are no ones cubes, the ones digit is 0.'
  },
  {
    id: 'g1-u2-l1-ex-003',
    title: 'Example 3: 3 Tens and 8 Ones',
    prompt: 'How many? Count the tens rods and ones cubes.',
    visual: { type: 'base10', config: { tens: 3, ones: 8 } },
    steps: [
      'Count the rods: 1, 2, 3. There are 3 tens.',
      'Count the cubes: 1, 2, 3, 4, 5, 6, 7, 8. There are 8 ones.',
      '3 tens and 8 ones = 38.'
    ],
    finalAnswer: '38',
    teachingNote: 'More ones than tens can tempt students to swap digits. Reinforce: rods first, tens first.',
    relatedKeyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.'
  }
];

// ── L2.1 quiz bank (17 questions: 6 easy · 7 medium · 4 hard) ─────────────────
const _l21QuizBank = [

  // ── Easy: read base10 model, count tens/ones, build from description ────────

  _l21Q(1, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 2, ones: 3 } },
    answer: '23',
    choices: [
      { value: '23', correct: true },
      { value: '32', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Swapped the tens and ones — wrote the ones digit first.' },
      { value: '20', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted tens rods only and ignored the ones cubes.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted ones cubes only and ignored the tens rods.' }
    ],
    hint: 'Count the rods first (tens), then the cubes (ones). Tens come first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens come first!',
      teachingSteps: [
        'Count the rods: there are 2 rods. Each rod = 10. That is 2 tens.',
        'Count the cubes: there are 3 cubes. Each cube = 1. That is 3 ones.',
        'Write the tens digit first, then the ones digit: 23.'
      ],
      correctAnswerExplanation: '2 tens and 3 ones = 23. The tens digit is always written first.'
    }
  }),

  _l21Q(2, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 4, ones: 1 } },
    answer: '41',
    choices: [
      { value: '41', correct: true },
      { value: '14', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '40', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted tens only and skipped the ones cube.' },
      { value: '1',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted ones only and ignored the tens rods.' }
    ],
    hint: 'Count the rods first. Count the cubes next. Tens go first when you write the number.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens come first!',
      teachingSteps: [
        'Count the rods: there are 4 rods. Each rod = 10. That is 4 tens.',
        'Count the cubes: there is 1 cube. That is 1 one.',
        'Write the tens first, then the ones: 41.'
      ],
      correctAnswerExplanation: '4 tens and 1 one = 41. Always write the tens digit first.'
    }
  }),

  _l21Q(3, {
    difficulty: 'easy',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'How many tens are shown?',
    visual: { type: 'base10', config: { tens: 3, ones: 5 } },
    answer: '3',
    choices: [
      { value: '3',  correct: true },
      { value: '5',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the ones cubes instead of the tens rods.' },
      { value: '35', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '8',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added tens and ones together instead of counting only the rods.' }
    ],
    hint: 'The rods show the tens. Count only the rods.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens — cubes are ones',
      teachingSteps: [
        'The rods show groups of ten. Count them: 1 rod, 2 rods, 3 rods.',
        'There are 3 rods, so there are 3 tens.',
        'The cubes are ones — but the question asked for tens, not ones.'
      ],
      correctAnswerExplanation: 'There are 3 rods. Each rod = 1 ten. So there are 3 tens.'
    }
  }),

  _l21Q(4, {
    difficulty: 'easy',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'How many ones are shown?',
    visual: { type: 'base10', config: { tens: 5, ones: 6 } },
    answer: '6',
    choices: [
      { value: '6',  correct: true },
      { value: '5',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the tens rods instead of the ones cubes.' },
      { value: '56', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '11', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added the tens and ones together.' }
    ],
    hint: 'The small cubes show the ones. Count only the cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Cubes are ones — count only the cubes',
      teachingSteps: [
        'The small cubes show ones. Count them: 1, 2, 3, 4, 5, 6.',
        'There are 6 cubes, so there are 6 ones.',
        'The rods are tens — but the question asked for ones, not tens.'
      ],
      correctAnswerExplanation: 'There are 6 cubes. Each cube = 1 one. So there are 6 ones.'
    }
  }),

  _l21Q(5, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 6, ones: 0 } },
    answer: '60',
    choices: [
      { value: '60', correct: true },
      { value: '6',  correct: false, errorTag: 'err_zero_ones_confusion',   misconceptionExplanation: 'Counted only the rods and forgot to write a 0 in the ones place.' },
      { value: '50', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Miscounted the tens rods.' }
    ],
    hint: 'Count the rods. No cubes means the ones digit is 0.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'When there are no cubes, write a 0',
      teachingSteps: [
        'Count the rods: there are 6 rods. That is 6 tens.',
        'There are no cubes. The ones place is empty, so write 0.',
        '6 tens and 0 ones = 60. The 0 must be written!'
      ],
      correctAnswerExplanation: '6 tens and 0 ones = 60. Always write a 0 in the ones place when there are no cubes.'
    }
  }),

  _l21Q(6, {
    difficulty: 'easy',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 2 tens and 3 ones?',
    visual: null,
    answer: '23',
    choices: [
      { value: '23', correct: true },
      { value: '32', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '20', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used the tens but forgot to include the ones.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used the ones but forgot the tens.' }
    ],
    hint: '2 tens come first. Then write 3 ones after. 2 then 3.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens come first',
      teachingSteps: [
        'We always write the tens digit first.',
        '2 tens → write 2 first.',
        '3 ones → write 3 second. The number is 23.'
      ],
      correctAnswerExplanation: '2 tens and 3 ones = 23. Tens digit first, then ones digit.'
    }
  }),

  // ── Medium: teen numbers, zero ones, text-only ──────────────────────────────

  _l21Q(7, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 7 } },
    answer: '17',
    choices: [
      { value: '17', correct: true },
      { value: '71', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits — wrote ones before tens.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Saw 1 rod and wrote 10, ignoring the 7 cubes.' },
      { value: '7',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the tens rod.' }
    ],
    hint: '1 rod = 1 ten. Count the 7 cubes for ones. Tens come first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Even with 1 rod, tens come first',
      teachingSteps: [
        'Count the rods: there is 1 rod. That is 1 ten.',
        'Count the cubes: there are 7 cubes. That is 7 ones.',
        'Write the tens first: 1 ten, then 7 ones = 17.'
      ],
      correctAnswerExplanation: '1 ten and 7 ones = 17. The tens digit (1) comes before the ones digit (7).'
    }
  }),

  _l21Q(8, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 7, ones: 0 } },
    answer: '70',
    choices: [
      { value: '70', correct: true },
      { value: '7',  correct: false, errorTag: 'err_zero_ones_confusion',   misconceptionExplanation: 'Counted rods only and did not write a 0 in the ones place.' },
      { value: '60', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Miscounted the tens rods.' }
    ],
    hint: 'Count the rods carefully. No cubes? Write 0 in the ones place.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'No cubes means write a 0',
      teachingSteps: [
        'Count the rods: there are 7 rods. That is 7 tens.',
        'There are no cubes at all. The ones place is 0.',
        '7 tens and 0 ones = 70. Do not forget the zero!'
      ],
      correctAnswerExplanation: '7 tens and 0 ones = 70. The 0 must be in the ones place.'
    }
  }),

  _l21Q(9, {
    difficulty: 'medium',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'The number is 47. How many tens does it have?',
    visual: null,
    answer: '4',
    choices: [
      { value: '4',  correct: true },
      { value: '7',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the ones digit instead of the tens digit.' },
      { value: '47', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '11', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 47, the first digit tells the tens.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The first digit is the tens',
      teachingSteps: [
        'In a two-digit number, the first digit on the left is the tens.',
        'In 47: the 4 is on the left. It is in the tens place.',
        'So 47 has 4 tens.'
      ],
      correctAnswerExplanation: '47 has 4 in the tens place. So it has 4 tens.'
    }
  }),

  _l21Q(10, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'The number is 73. How many ones does it have?',
    visual: null,
    answer: '3',
    choices: [
      { value: '3',  correct: true },
      { value: '7',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the tens digit instead of the ones digit.' },
      { value: '73', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '10', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 73, the second digit tells the ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The second digit is the ones',
      teachingSteps: [
        'In a two-digit number, the second digit on the right is the ones.',
        'In 73: the 3 is on the right. It is in the ones place.',
        'So 73 has 3 ones.'
      ],
      correctAnswerExplanation: '73 has 3 in the ones place. So it has 3 ones.'
    }
  }),

  _l21Q(11, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 3 tens and 9 ones?',
    visual: null,
    answer: '39',
    choices: [
      { value: '39', correct: true },
      { value: '93', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit first, then the tens digit.' },
      { value: '30', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '9',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '3 tens → write 3 first. 9 ones → write 9 second. Put them together.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens first — always',
      teachingSteps: [
        'Write the tens digit first. 3 tens → write 3.',
        'Write the ones digit second. 9 ones → write 9.',
        'The number is 39, not 93.'
      ],
      correctAnswerExplanation: '3 tens and 9 ones = 39. Tens digit (3) comes before ones digit (9).'
    }
  }),

  _l21Q(12, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 5 tens and 2 ones?',
    visual: null,
    answer: '52',
    choices: [
      { value: '52', correct: true },
      { value: '25', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Switched the tens and ones digits.' },
      { value: '50', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens part.' },
      { value: '2',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones part.' }
    ],
    hint: '5 tens is 50. Add 2 ones to get 52.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens digit goes first',
      teachingSteps: [
        '5 tens means the tens digit is 5.',
        '2 ones means the ones digit is 2.',
        'Write tens first: 5, then ones: 2. The number is 52.'
      ],
      correctAnswerExplanation: '5 tens and 2 ones = 52. The tens digit (5) always goes before the ones digit (2).'
    }
  }),

  _l21Q(13, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'How many ones are shown?',
    visual: { type: 'base10', config: { tens: 8, ones: 0 } },
    answer: '0',
    choices: [
      { value: '0',  correct: true },
      { value: '8',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the tens rods instead of looking for ones cubes.' },
      { value: '80', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the full number instead of just the ones count.' }
    ],
    hint: 'Look carefully at the cubes. If there are no cubes, the ones digit is 0.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'No cubes means 0 ones',
      teachingSteps: [
        'Look for the small cubes — those are the ones.',
        'There are no cubes here. That means 0 ones.',
        'The rods are tens, not ones.'
      ],
      correctAnswerExplanation: 'There are no cubes. The ones digit is 0.'
    }
  }),

  // ── Hard: reversal traps, reversed description order ───────────────────────

  _l21Q(14, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 4, ones: 2 } },
    answer: '42',
    choices: [
      { value: '42', correct: true },
      { value: '24', correct: false, errorTag: 'err_reversed_tens_ones',    misconceptionExplanation: 'Reversed the digits — wrote ones before tens.' },
      { value: '40', correct: false, errorTag: 'err_ignored_ones',          misconceptionExplanation: 'Saw 4 rods and wrote 40, ignoring the 2 cubes.' },
      { value: '6',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added 4 rods + 2 cubes = 6 instead of reading place value.' }
    ],
    hint: 'Count every rod carefully. Count every cube carefully. Which digit comes first?',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Count the rods, write tens first',
      teachingSteps: [
        'Count the rods: 1, 2, 3, 4. There are 4 tens.',
        'Count the cubes: 1, 2. There are 2 ones.',
        'Write tens first: 4. Then ones: 2. The number is 42, not 24.'
      ],
      correctAnswerExplanation: '4 tens and 2 ones = 42. The 4 comes first because it is the tens digit.'
    }
  }),

  _l21Q(15, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 2 tens and 8 ones?',
    visual: null,
    answer: '28',
    choices: [
      { value: '28', correct: true },
      { value: '82', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit (8) before the tens digit (2).' },
      { value: '20', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '8',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: 'Tens digit first. 2 tens → write 2 first. Then 8 ones → write 8.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'The tens digit always goes first',
      teachingSteps: [
        '2 tens → the tens digit is 2. Write it first.',
        '8 ones → the ones digit is 8. Write it second.',
        '28, not 82. Tens come before ones.'
      ],
      correctAnswerExplanation: '2 tens and 8 ones = 28. The tens digit (2) must come before the ones digit (8).'
    }
  }),

  _l21Q(16, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 6 tens and 3 ones?',
    visual: null,
    answer: '63',
    choices: [
      { value: '63', correct: true },
      { value: '36', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Switched the tens and ones digits.' },
      { value: '60', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and ignored the tens.' }
    ],
    hint: '6 tens = 60. Add 3 ones to get 63.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens are first — write them first',
      teachingSteps: [
        '6 tens means the tens digit is 6. Write 6 first.',
        '3 ones means the ones digit is 3. Write 3 after.',
        'The number is 63. If you wrote 36, you put ones before tens.'
      ],
      correctAnswerExplanation: '6 tens and 3 ones = 63. The tens digit (6) comes before the ones digit (3).'
    }
  }),

  _l21Q(17, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'I have 4 ones and 6 tens. What number am I?',
    visual: null,
    answer: '64',
    choices: [
      { value: '64', correct: true },
      { value: '46', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Read the digits in the order stated (4 first, then 6) instead of finding tens first.' },
      { value: '60', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens (6) and dropped the ones (4).' },
      { value: '4',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones (4) and ignored the tens (6).' }
    ],
    hint: 'Find the tens first, even if they are named second. 6 tens → the tens digit is 6.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Find tens first — no matter what order they are named',
      teachingSteps: [
        'The problem says "4 ones and 6 tens." Find the tens: it says 6 tens.',
        'Find the ones: it says 4 ones.',
        'Write tens first: 6. Then ones: 4. The number is 64, not 46.'
      ],
      correctAnswerExplanation: '6 tens and 4 ones = 64. Always write the tens digit first, even when ones are mentioned first.'
    }
  }),

  // ── Easy additions q18–q36 ────────────────────────────────────────────────

  _l21Q(18, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 4 } },
    answer: '14',
    choices: [
      { value: '14', correct: true },
      { value: '41', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted the rod only and ignored the 4 cubes.' },
      { value: '4',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted the cubes only and ignored the tens rod.' }
    ],
    hint: 'Count the rod first — that is 1 ten. Count the cubes — 4 ones. Tens come first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens come first — even for teen numbers',
      teachingSteps: [
        'Count the rods: there is 1 rod. That is 1 ten.',
        'Count the cubes: there are 4 cubes. That is 4 ones.',
        'Write the tens first: 1, then the ones: 4. The number is 14.'
      ],
      correctAnswerExplanation: '1 ten and 4 ones = 14. The tens digit (1) comes before the ones digit (4).'
    }
  }),

  _l21Q(19, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 3 } },
    answer: '13',
    choices: [
      { value: '13', correct: true },
      { value: '31', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits — wrote ones before tens.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Read only the rod and ignored the 3 cubes.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Read only the cubes and ignored the tens rod.' }
    ],
    hint: '1 rod = 1 ten. 3 cubes = 3 ones. Write tens first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens come first',
      teachingSteps: [
        'Count the rods: 1 rod. That is 1 ten.',
        'Count the cubes: 1, 2, 3. That is 3 ones.',
        'Write the ten first, then the ones: 13.'
      ],
      correctAnswerExplanation: '1 ten and 3 ones = 13. The tens digit comes before the ones digit.'
    }
  }),

  _l21Q(20, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 3, ones: 0 } },
    answer: '30',
    choices: [
      { value: '30', correct: true },
      { value: '3',  correct: false, errorTag: 'err_zero_ones_confusion',   misconceptionExplanation: 'Counted only the rods and forgot to write 0 in the ones place.' },
      { value: '20', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Miscounted the tens rods.' },
      { value: '40', correct: false, errorTag: 'err_off_by_ten',            misconceptionExplanation: 'Counted one too many tens rods.' }
    ],
    hint: 'Count the rods. No cubes means the ones digit is 0.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'No cubes — write a 0',
      teachingSteps: [
        'Count the rods: 1, 2, 3. That is 3 tens.',
        'There are no cubes at all. The ones place is empty — write 0.',
        '3 tens and 0 ones = 30. The 0 must be written!'
      ],
      correctAnswerExplanation: '3 tens and 0 ones = 30. Always write a 0 in the ones place when there are no cubes.'
    }
  }),

  _l21Q(21, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 5, ones: 4 } },
    answer: '54',
    choices: [
      { value: '54', correct: true },
      { value: '45', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Swapped the tens and ones digits.' },
      { value: '50', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and ignored the 4 cubes.' },
      { value: '4',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the tens rods.' }
    ],
    hint: 'Count the rods first (tens), then the cubes (ones). Write tens first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Rods are tens — write them first',
      teachingSteps: [
        'Count the rods: 1, 2, 3, 4, 5. There are 5 tens.',
        'Count the cubes: 1, 2, 3, 4. There are 4 ones.',
        'Write the tens digit first: 5. Then the ones: 4. The number is 54.'
      ],
      correctAnswerExplanation: '5 tens and 4 ones = 54. Tens digit (5) before ones digit (4).'
    }
  }),

  _l21Q(22, {
    difficulty: 'easy',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'How many tens are shown?',
    visual: { type: 'base10', config: { tens: 6, ones: 2 } },
    answer: '6',
    choices: [
      { value: '6',  correct: true },
      { value: '2',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the ones cubes instead of the tens rods.' },
      { value: '62', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '8',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together instead of counting only rods.' }
    ],
    hint: 'Only count the rods. Each rod is one ten.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the rods for tens',
      teachingSteps: [
        'The rods show tens. Count them: 1, 2, 3, 4, 5, 6.',
        'There are 6 rods. That is 6 tens.',
        'The cubes are ones — do not count them here.'
      ],
      correctAnswerExplanation: 'There are 6 rods. Each rod = 1 ten. So there are 6 tens.'
    }
  }),

  _l21Q(23, {
    difficulty: 'easy',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'How many ones are shown?',
    visual: { type: 'base10', config: { tens: 3, ones: 4 } },
    answer: '4',
    choices: [
      { value: '4',  correct: true },
      { value: '3',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the tens rods instead of the ones cubes.' },
      { value: '34', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '7',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together.' }
    ],
    hint: 'Only count the small cubes. Each cube is one.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the cubes for ones',
      teachingSteps: [
        'The cubes show ones. Count them: 1, 2, 3, 4.',
        'There are 4 cubes. That is 4 ones.',
        'The rods are tens — do not count them here.'
      ],
      correctAnswerExplanation: 'There are 4 cubes. Each cube = 1 one. So there are 4 ones.'
    }
  }),

  _l21Q(24, {
    difficulty: 'easy',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 4 tens and 5 ones?',
    visual: null,
    answer: '45',
    choices: [
      { value: '45', correct: true },
      { value: '54', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '40', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '5',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '4 tens → write 4 first. 5 ones → write 5 second.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens digit first, ones digit second',
      teachingSteps: [
        'We always write the tens digit first.',
        '4 tens → write 4 first.',
        '5 ones → write 5 after. The number is 45.'
      ],
      correctAnswerExplanation: '4 tens and 5 ones = 45. The tens digit (4) always comes first.'
    }
  }),

  _l21Q(25, {
    difficulty: 'easy',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'Which number has 7 tens and 0 ones?',
    visual: null,
    answer: '70',
    choices: [
      { value: '70', correct: true },
      { value: '7',  correct: false, errorTag: 'err_zero_ones_confusion', misconceptionExplanation: 'Forgot to write a 0 in the ones place.' },
      { value: '60', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Counted one fewer ten than stated.' },
      { value: '80', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Counted one extra ten.' }
    ],
    hint: '7 tens is written as 70. The 0 goes in the ones place.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'Zero ones needs a 0',
      teachingSteps: [
        '7 tens means the tens digit is 7.',
        '0 ones means the ones place is empty — write 0.',
        'The number is 70. Without the 0, it looks like just 7.'
      ],
      correctAnswerExplanation: '7 tens and 0 ones = 70. The 0 must fill the ones place.'
    }
  }),

  _l21Q(26, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 2, ones: 7 } },
    answer: '27',
    choices: [
      { value: '27', correct: true },
      { value: '72', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '20', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and ignored the 7 cubes.' },
      { value: '7',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the tens rods.' }
    ],
    hint: 'Count the rods: 2 tens. Count the cubes: 7 ones. Write tens first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'More cubes than rods — still write rods first',
      teachingSteps: [
        'Count the rods: 1, 2. There are 2 tens.',
        'Count the cubes: 1, 2, 3, 4, 5, 6, 7. There are 7 ones.',
        'Even though there are more cubes, write the tens first: 27.'
      ],
      correctAnswerExplanation: '2 tens and 7 ones = 27. Tens digit (2) comes before ones digit (7), no matter how many ones there are.'
    }
  }),

  _l21Q(27, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 9 } },
    answer: '19',
    choices: [
      { value: '19', correct: true },
      { value: '91', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Saw 1 rod and wrote 10, missing all 9 cubes.' },
      { value: '9',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes.' }
    ],
    hint: '1 rod = 1 ten. Count all 9 cubes. Tens first: 19.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Even with many cubes, write the rod first',
      teachingSteps: [
        'Count the rods: 1 rod. That is 1 ten.',
        'Count the cubes: 1 through 9. That is 9 ones.',
        'Write the tens first: 1, then the ones: 9. The number is 19.'
      ],
      correctAnswerExplanation: '1 ten and 9 ones = 19. Always write the tens digit (1) first.'
    }
  }),

  _l21Q(28, {
    difficulty: 'easy',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 1 ten and 6 ones?',
    visual: null,
    answer: '16',
    choices: [
      { value: '16', correct: true },
      { value: '61', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit (6) before the tens digit (1).' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '6',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '1 ten → write 1 first. 6 ones → write 6 after. 16.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens digit goes first',
      teachingSteps: [
        '1 ten → the tens digit is 1. Write 1 first.',
        '6 ones → the ones digit is 6. Write 6 second.',
        'The number is 16, not 61.'
      ],
      correctAnswerExplanation: '1 ten and 6 ones = 16. Tens always come first when writing the number.'
    }
  }),

  _l21Q(29, {
    difficulty: 'easy',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'How many tens are shown?',
    visual: { type: 'base10', config: { tens: 4, ones: 3 } },
    answer: '4',
    choices: [
      { value: '4',  correct: true },
      { value: '3',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the ones cubes instead of the tens rods.' },
      { value: '43', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of only the tens count.' },
      { value: '7',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together.' }
    ],
    hint: 'Only count the rods. Each rod is one ten.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods show tens — count only the rods',
      teachingSteps: [
        'The tall rods show tens. Count them: 1, 2, 3, 4.',
        'There are 4 rods. That is 4 tens.',
        'The question asked for tens, not ones. Do not count the cubes.'
      ],
      correctAnswerExplanation: 'There are 4 rods. Each rod = 1 ten. So the answer is 4 tens.'
    }
  }),

  _l21Q(30, {
    difficulty: 'easy',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'How many ones are shown?',
    visual: { type: 'base10', config: { tens: 2, ones: 8 } },
    answer: '8',
    choices: [
      { value: '8',  correct: true },
      { value: '2',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the tens rods instead of the ones cubes.' },
      { value: '28', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '10', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together.' }
    ],
    hint: 'Count only the small cubes. Each cube equals one.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the cubes for ones',
      teachingSteps: [
        'The small cubes show ones. Count them: 1, 2, 3, 4, 5, 6, 7, 8.',
        'There are 8 cubes. That is 8 ones.',
        'The question asked for ones. Do not count the rods.'
      ],
      correctAnswerExplanation: 'There are 8 cubes. Each cube = 1 one. So there are 8 ones.'
    }
  }),

  _l21Q(31, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 4, ones: 0 } },
    answer: '40',
    choices: [
      { value: '40', correct: true },
      { value: '4',  correct: false, errorTag: 'err_zero_ones_confusion', misconceptionExplanation: 'Counted only the rods and forgot to write 0 in the ones place.' },
      { value: '30', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Miscounted — counted one fewer rod than shown.' },
      { value: '50', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Miscounted — counted one extra rod.' }
    ],
    hint: 'Count the rods. No cubes means the ones digit is 0.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'No cubes — write a 0 in the ones place',
      teachingSteps: [
        'Count the rods: 1, 2, 3, 4. There are 4 tens.',
        'There are no cubes. The ones digit is 0.',
        '4 tens and 0 ones = 40. The 0 must be written!'
      ],
      correctAnswerExplanation: '4 tens and 0 ones = 40. When there are no cubes, always write 0 in the ones place.'
    }
  }),

  _l21Q(32, {
    difficulty: 'easy',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 3 tens and 6 ones?',
    visual: null,
    answer: '36',
    choices: [
      { value: '36', correct: true },
      { value: '63', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit (6) before the tens digit (3).' },
      { value: '30', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '6',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '3 tens → write 3 first. 6 ones → write 6 after.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Write tens first, then ones',
      teachingSteps: [
        'Start with the tens. 3 tens → write 3 first.',
        'Then the ones. 6 ones → write 6 second.',
        'The number is 36. Not 63 — that would be 6 tens and 3 ones.'
      ],
      correctAnswerExplanation: '3 tens and 6 ones = 36. The tens digit (3) goes before the ones digit (6).'
    }
  }),

  _l21Q(33, {
    difficulty: 'easy',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 8, ones: 3 } },
    answer: '83',
    choices: [
      { value: '83', correct: true },
      { value: '38', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '80', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and ignored the 3 cubes.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the tens rods.' }
    ],
    hint: 'Count all 8 rods first. Then count the 3 cubes. Tens first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Count rods, count cubes, write tens first',
      teachingSteps: [
        'Count the rods: 1 through 8. There are 8 tens.',
        'Count the cubes: 1, 2, 3. There are 3 ones.',
        'Write the tens first: 8, then the ones: 3. The number is 83.'
      ],
      correctAnswerExplanation: '8 tens and 3 ones = 83. The tens digit (8) comes before the ones digit (3).'
    }
  }),

  _l21Q(34, {
    difficulty: 'easy',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'The number is 36. How many ones does it have?',
    visual: null,
    answer: '6',
    choices: [
      { value: '6',  correct: true },
      { value: '3',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the tens digit (3) instead of the ones digit.' },
      { value: '36', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones digit.' },
      { value: '9',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 36, the second digit tells the ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The second digit is the ones',
      teachingSteps: [
        'In a two-digit number, the digit on the right is the ones digit.',
        'In 36: the 6 is on the right. It is in the ones place.',
        'So 36 has 6 ones.'
      ],
      correctAnswerExplanation: '36 has 6 in the ones place. So it has 6 ones.'
    }
  }),

  _l21Q(35, {
    difficulty: 'easy',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'The number is 25. How many tens does it have?',
    visual: null,
    answer: '2',
    choices: [
      { value: '2',  correct: true },
      { value: '5',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the ones digit (5) instead of the tens digit.' },
      { value: '25', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '7',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 25, the first digit tells the tens.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The first digit is the tens',
      teachingSteps: [
        'In a two-digit number, the digit on the left is the tens digit.',
        'In 25: the 2 is on the left. It is in the tens place.',
        'So 25 has 2 tens.'
      ],
      correctAnswerExplanation: '25 has 2 in the tens place. So it has 2 tens.'
    }
  }),

  _l21Q(36, {
    difficulty: 'easy',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'Which number has 8 tens and 0 ones?',
    visual: null,
    answer: '80',
    choices: [
      { value: '80', correct: true },
      { value: '8',  correct: false, errorTag: 'err_zero_ones_confusion', misconceptionExplanation: 'Forgot to write the 0 in the ones place.' },
      { value: '70', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Wrote one fewer ten than stated.' },
      { value: '90', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Wrote one extra ten.' }
    ],
    hint: '8 tens and no ones → the ones place must be 0. Write 80.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'Zero ones needs a 0 in the ones place',
      teachingSteps: [
        '8 tens → the tens digit is 8.',
        '0 ones → the ones place is empty. Write 0.',
        'The number is 80. Writing just 8 means 8 ones, not 8 tens!'
      ],
      correctAnswerExplanation: '8 tens and 0 ones = 80. The 0 is essential — it moves the 8 into the tens place.'
    }
  }),

  // ── Medium additions q37–q64 ──────────────────────────────────────────────

  _l21Q(37, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 6, ones: 5 } },
    answer: '65',
    choices: [
      { value: '65', correct: true },
      { value: '56', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits.' },
      { value: '60', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and ignored the 5 cubes.' },
      { value: '5',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the tens rods.' }
    ],
    hint: '6 rods = 6 tens. 5 cubes = 5 ones. Write tens first: 65.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Rods first, cubes second',
      teachingSteps: [
        'Count the rods: 6. That is 6 tens.',
        'Count the cubes: 5. That is 5 ones.',
        'Write the tens first: 6, then the ones: 5. The number is 65, not 56.'
      ],
      correctAnswerExplanation: '6 tens and 5 ones = 65. The tens digit (6) always comes before the ones digit (5).'
    }
  }),

  _l21Q(38, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 9, ones: 2 } },
    answer: '92',
    choices: [
      { value: '92', correct: true },
      { value: '29', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '90', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the 9 rods and missed the 2 cubes.' },
      { value: '2',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the 9 rods.' }
    ],
    hint: 'Count all 9 rods carefully. Then count the 2 cubes. Tens first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Nine rods means 9 tens — write 9 first',
      teachingSteps: [
        'Count the rods: 1 through 9. There are 9 tens.',
        'Count the cubes: 1, 2. There are 2 ones.',
        'Write the tens first: 9, then the ones: 2. The number is 92.'
      ],
      correctAnswerExplanation: '9 tens and 2 ones = 92. The tens digit (9) always comes before the ones digit (2).'
    }
  }),

  _l21Q(39, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 1 } },
    answer: '11',
    choices: [
      { value: '11', correct: true },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Saw 1 rod and wrote 10, ignoring the 1 cube.' },
      { value: '1',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cube and ignored the rod.' },
      { value: '21', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Counted one extra ten.' }
    ],
    hint: '1 rod = 1 ten. 1 cube = 1 one. Together: 11.',
    intervention: {
      errorTag: 'err_ignored_ones',
      title: 'Do not forget the ones cube',
      teachingSteps: [
        'Count the rods: 1 rod. That is 1 ten.',
        'Count the cubes: 1 cube. That is 1 one.',
        '1 ten and 1 one = 11. Both count!'
      ],
      correctAnswerExplanation: '1 ten and 1 one = 11. Always count both the rods AND the cubes.'
    }
  }),

  _l21Q(40, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 5 } },
    answer: '15',
    choices: [
      { value: '15', correct: true },
      { value: '51', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Saw 1 rod and stopped — did not count the 5 cubes.' },
      { value: '5',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes.' }
    ],
    hint: '1 rod = 10. Count the 5 cubes too. Write the tens digit (1) first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'The rod is tens — write it first',
      teachingSteps: [
        'Count the rods: 1 rod. That is 1 ten.',
        'Count the cubes: 1, 2, 3, 4, 5. That is 5 ones.',
        'Write the tens first: 15. Not 51.'
      ],
      correctAnswerExplanation: '1 ten and 5 ones = 15. The tens digit (1) must come before the ones digit (5).'
    }
  }),

  _l21Q(41, {
    difficulty: 'medium',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'How many tens are shown?',
    visual: { type: 'base10', config: { tens: 7, ones: 4 } },
    answer: '7',
    choices: [
      { value: '7',  correct: true },
      { value: '4',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the ones cubes instead of the tens rods.' },
      { value: '74', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '11', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together.' }
    ],
    hint: 'Count only the rods. Each rod is 1 ten.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the rods for tens',
      teachingSteps: [
        'The rods show tens. Count them: 1, 2, 3, 4, 5, 6, 7.',
        'There are 7 rods. That is 7 tens.',
        'The 4 cubes are ones — but the question asked for tens.'
      ],
      correctAnswerExplanation: 'There are 7 rods. Each rod = 1 ten. So there are 7 tens.'
    }
  }),

  _l21Q(42, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'How many ones are shown?',
    visual: { type: 'base10', config: { tens: 5, ones: 9 } },
    answer: '9',
    choices: [
      { value: '9',  correct: true },
      { value: '5',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the tens rods instead of the ones cubes.' },
      { value: '59', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '14', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together.' }
    ],
    hint: 'Count only the small cubes. There are 9 of them.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the cubes for ones',
      teachingSteps: [
        'The cubes show ones. Count them: 1 through 9.',
        'There are 9 cubes. That is 9 ones.',
        'Do not count the rods — the question asked for ones.'
      ],
      correctAnswerExplanation: 'There are 9 cubes. Each cube = 1 one. So there are 9 ones.'
    }
  }),

  _l21Q(43, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 6 tens and 8 ones?',
    visual: null,
    answer: '68',
    choices: [
      { value: '68', correct: true },
      { value: '86', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '60', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '8',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '6 tens → write 6 first. 8 ones → write 8 second. 68.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens digit first, always',
      teachingSteps: [
        '6 tens → the tens digit is 6. Write 6 first.',
        '8 ones → the ones digit is 8. Write 8 second.',
        'The number is 68, not 86.'
      ],
      correctAnswerExplanation: '6 tens and 8 ones = 68. Tens digit (6) before ones digit (8).'
    }
  }),

  _l21Q(44, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 9 tens and 1 one?',
    visual: null,
    answer: '91',
    choices: [
      { value: '91', correct: true },
      { value: '19', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits — wrote ones before tens.' },
      { value: '90', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the one.' },
      { value: '1',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the one and forgot the tens.' }
    ],
    hint: '9 tens → write 9 first. 1 one → write 1 after. 91.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens digit first',
      teachingSteps: [
        '9 tens → write 9 first. It goes in the tens place.',
        '1 one → write 1 second. It goes in the ones place.',
        'The number is 91, not 19.'
      ],
      correctAnswerExplanation: '9 tens and 1 one = 91. The tens digit (9) must come before the ones digit (1).'
    }
  }),

  _l21Q(45, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 1 ten and 2 ones?',
    visual: null,
    answer: '12',
    choices: [
      { value: '12', correct: true },
      { value: '21', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '2',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '1 ten → write 1 first. 2 ones → write 2 after. 12.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Write the tens digit first',
      teachingSteps: [
        '1 ten → the tens digit is 1. Write 1 first.',
        '2 ones → the ones digit is 2. Write 2 second.',
        'The number is 12, not 21.'
      ],
      correctAnswerExplanation: '1 ten and 2 ones = 12. Tens digit (1) comes before ones digit (2).'
    }
  }),

  _l21Q(46, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 8, ones: 7 } },
    answer: '87',
    choices: [
      { value: '87', correct: true },
      { value: '78', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '80', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and missed the 7 cubes.' },
      { value: '7',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the 8 rods.' }
    ],
    hint: 'Count all 8 rods. Count all 7 cubes. Write tens first: 87.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'More rods than cubes — rods are still tens',
      teachingSteps: [
        'Count the rods: 1 through 8. There are 8 tens.',
        'Count the cubes: 1 through 7. There are 7 ones.',
        'Write the tens first: 8, then the ones: 7. The number is 87.'
      ],
      correctAnswerExplanation: '8 tens and 7 ones = 87. Tens digit (8) comes before ones digit (7).'
    }
  }),

  _l21Q(47, {
    difficulty: 'medium',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'The number is 82. How many tens does it have?',
    visual: null,
    answer: '8',
    choices: [
      { value: '8',  correct: true },
      { value: '2',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the ones digit (2) instead of the tens digit.' },
      { value: '82', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '10', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 82, the first digit tells the tens.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The left digit is always tens',
      teachingSteps: [
        'In a two-digit number, the digit on the left is the tens.',
        'In 82: the 8 is on the left. It is in the tens place.',
        'So 82 has 8 tens.'
      ],
      correctAnswerExplanation: '82 has 8 in the tens place. So it has 8 tens.'
    }
  }),

  _l21Q(48, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'The number is 64. How many ones does it have?',
    visual: null,
    answer: '4',
    choices: [
      { value: '4',  correct: true },
      { value: '6',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the tens digit (6) instead of the ones digit.' },
      { value: '64', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '10', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 64, the second digit tells the ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The right digit is always ones',
      teachingSteps: [
        'In a two-digit number, the digit on the right is the ones.',
        'In 64: the 4 is on the right. It is in the ones place.',
        'So 64 has 4 ones.'
      ],
      correctAnswerExplanation: '64 has 4 in the ones place. So it has 4 ones.'
    }
  }),

  _l21Q(49, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 5, ones: 5 } },
    answer: '55',
    choices: [
      { value: '55', correct: true },
      { value: '50', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and missed the 5 cubes.' },
      { value: '5',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the rods.' },
      { value: '45', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Miscounted the rods by one.' }
    ],
    hint: 'Count the rods: 5. Count the cubes: 5. Both digits are 5 — write 55.',
    intervention: {
      errorTag: 'err_ignored_ones',
      title: 'Count both rods and cubes',
      teachingSteps: [
        'Count the rods: 1, 2, 3, 4, 5. There are 5 tens.',
        'Count the cubes: 1, 2, 3, 4, 5. There are 5 ones.',
        '5 tens and 5 ones = 55. Both digits are 5.'
      ],
      correctAnswerExplanation: '5 tens and 5 ones = 55. Count rods AND cubes — both groups matter.'
    }
  }),

  _l21Q(50, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'Which number has 5 tens and 0 ones?',
    visual: null,
    answer: '50',
    choices: [
      { value: '50', correct: true },
      { value: '5',  correct: false, errorTag: 'err_zero_ones_confusion', misconceptionExplanation: 'Forgot to write the 0 in the ones place.' },
      { value: '40', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Wrote one fewer ten than stated.' },
      { value: '60', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Wrote one extra ten.' }
    ],
    hint: '5 tens and no ones → write 50. The 0 holds the ones place.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: '0 ones — the 0 must be written',
      teachingSteps: [
        '5 tens → the tens digit is 5.',
        '0 ones → the ones place is empty. Write 0 there.',
        'The number is 50. Writing just 5 would mean 5 ones!'
      ],
      correctAnswerExplanation: '5 tens and 0 ones = 50. The 0 is needed to show 5 is in the tens place.'
    }
  }),

  _l21Q(51, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 4 tens and 7 ones?',
    visual: null,
    answer: '47',
    choices: [
      { value: '47', correct: true },
      { value: '74', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit before the tens digit.' },
      { value: '40', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '7',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '4 tens is written first. Then 7 ones. Together: 47.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens go in front',
      teachingSteps: [
        '4 tens → write 4 first.',
        '7 ones → write 7 after.',
        'The number is 47. If you wrote 74, you put ones before tens.'
      ],
      correctAnswerExplanation: '4 tens and 7 ones = 47. The tens digit (4) always comes before the ones digit (7).'
    }
  }),

  _l21Q(52, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'I have 3 ones and 5 tens. What number am I?',
    visual: null,
    answer: '53',
    choices: [
      { value: '53', correct: true },
      { value: '35', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Read the digits in the order they were named (3 first, then 5) instead of finding tens first.' },
      { value: '50', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and dropped the ones.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and ignored the tens.' }
    ],
    hint: 'Find the tens first, even if they are named second. 5 tens → tens digit is 5.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Find the tens first — no matter what order',
      teachingSteps: [
        'The problem says "3 ones and 5 tens." Find the tens: it says 5 tens.',
        'Find the ones: it says 3 ones.',
        'Write tens first: 5, then ones: 3. The number is 53, not 35.'
      ],
      correctAnswerExplanation: '5 tens and 3 ones = 53. Always write the tens digit first.'
    }
  }),

  _l21Q(53, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 7, ones: 6 } },
    answer: '76',
    choices: [
      { value: '76', correct: true },
      { value: '67', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '70', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the 7 rods and missed the 6 cubes.' },
      { value: '6',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the rods.' }
    ],
    hint: '7 rods = 7 tens. 6 cubes = 6 ones. Write tens first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Rods go first in the number',
      teachingSteps: [
        'Count the rods: 7. That is 7 tens.',
        'Count the cubes: 6. That is 6 ones.',
        'Write the tens first: 76. Not 67.'
      ],
      correctAnswerExplanation: '7 tens and 6 ones = 76. The tens digit (7) comes before the ones digit (6).'
    }
  }),

  _l21Q(54, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 7 tens and 3 ones?',
    visual: null,
    answer: '73',
    choices: [
      { value: '73', correct: true },
      { value: '37', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits.' },
      { value: '70', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: '7 tens → write 7 first. 3 ones → write 3 after. 73.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Write tens before ones',
      teachingSteps: [
        '7 tens → the tens digit is 7. Write 7 first.',
        '3 ones → the ones digit is 3. Write 3 after.',
        'The number is 73, not 37.'
      ],
      correctAnswerExplanation: '7 tens and 3 ones = 73. Tens digit (7) always comes before ones digit (3).'
    }
  }),

  _l21Q(55, {
    difficulty: 'medium',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'How many tens are shown?',
    visual: { type: 'base10', config: { tens: 9, ones: 4 } },
    answer: '9',
    choices: [
      { value: '9',  correct: true },
      { value: '4',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the ones cubes instead of the tens rods.' },
      { value: '94', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '13', correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added rods and cubes together.' }
    ],
    hint: 'Count only the rods. There are 9 of them.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the rods for tens',
      teachingSteps: [
        'The rods show tens. Count them carefully: 1 through 9.',
        'There are 9 rods. That is 9 tens.',
        'The 4 cubes are ones — do not count them here.'
      ],
      correctAnswerExplanation: 'There are 9 rods. Each rod = 1 ten. So there are 9 tens.'
    }
  }),

  _l21Q(56, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'How many ones are shown?',
    visual: { type: 'base10', config: { tens: 6, ones: 1 } },
    answer: '1',
    choices: [
      { value: '1',  correct: true },
      { value: '6',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Counted the tens rods instead of the ones cube.' },
      { value: '61', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '7',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added the rods and cube together.' }
    ],
    hint: 'Look for the small cubes. There is only 1 cube.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the cubes for ones',
      teachingSteps: [
        'Look for the cubes — those show ones.',
        'There is 1 cube. That is 1 one.',
        'The 6 rods are tens. The question asked for ones only.'
      ],
      correctAnswerExplanation: 'There is 1 cube. Each cube = 1 one. So there is 1 one.'
    }
  }),

  _l21Q(57, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 3, ones: 3 } },
    answer: '33',
    choices: [
      { value: '33', correct: true },
      { value: '3',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only one group and ignored the other.' },
      { value: '30', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Counted only the rods and ignored the 3 cubes.' },
      { value: '23', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Miscounted the rods.' }
    ],
    hint: '3 rods = 3 tens. 3 cubes = 3 ones. Write 33.',
    intervention: {
      errorTag: 'err_ignored_ones',
      title: 'Count both groups — even when they look the same',
      teachingSteps: [
        'Count the rods: 1, 2, 3. There are 3 tens.',
        'Count the cubes: 1, 2, 3. There are 3 ones.',
        '3 tens and 3 ones = 33. Both groups count!'
      ],
      correctAnswerExplanation: '3 tens and 3 ones = 33. Both the rods and the cubes must be counted.'
    }
  }),

  _l21Q(58, {
    difficulty: 'medium',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 8 } },
    answer: '18',
    choices: [
      { value: '18', correct: true },
      { value: '81', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits — wrote ones before tens.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Saw 1 rod and stopped — did not count all 8 cubes.' },
      { value: '8',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the rod.' }
    ],
    hint: '1 rod = 1 ten. Count all 8 cubes. Write the rod first: 18.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'The rod is still the tens digit',
      teachingSteps: [
        'Count the rods: 1 rod. That is 1 ten.',
        'Count the cubes: 1 through 8. That is 8 ones.',
        'Write the tens first: 1, then the ones: 8. The number is 18.'
      ],
      correctAnswerExplanation: '1 ten and 8 ones = 18. The tens digit (1) comes before the ones digit (8).'
    }
  }),

  _l21Q(59, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'The number is 90. How many ones does it have?',
    visual: null,
    answer: '0',
    choices: [
      { value: '0',  correct: true },
      { value: '9',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the tens digit instead of the ones digit.' },
      { value: '90', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '1',  correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Confused the ones digit with the position of the 9.' }
    ],
    hint: 'In 90, look at the second digit. What digit is in the ones place?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The second digit is ones — it is 0',
      teachingSteps: [
        'In 90: the 9 is the tens digit (on the left).',
        'The 0 is the ones digit (on the right).',
        '90 has 0 ones. The 0 shows there are no ones.'
      ],
      correctAnswerExplanation: '90 has 0 in the ones place. So it has 0 ones.'
    }
  }),

  _l21Q(60, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'Which number has 2 tens and 0 ones?',
    visual: null,
    answer: '20',
    choices: [
      { value: '20', correct: true },
      { value: '2',  correct: false, errorTag: 'err_zero_ones_confusion', misconceptionExplanation: 'Forgot to write a 0 in the ones place.' },
      { value: '10', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Wrote one fewer ten than stated.' },
      { value: '30', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Wrote one extra ten.' }
    ],
    hint: '2 tens is 20. The 0 fills the ones place.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'Write a 0 when there are no ones',
      teachingSteps: [
        '2 tens → the tens digit is 2.',
        '0 ones → the ones place is empty. Write 0 there.',
        'The number is 20. Writing just 2 would mean 2 ones!'
      ],
      correctAnswerExplanation: '2 tens and 0 ones = 20. The 0 is needed in the ones place.'
    }
  }),

  _l21Q(61, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 9 tens and 9 ones?',
    visual: null,
    answer: '99',
    choices: [
      { value: '99', correct: true },
      { value: '90', correct: false, errorTag: 'err_ignored_ones',   misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '9',  correct: false, errorTag: 'err_ignored_tens',   misconceptionExplanation: 'Used only the ones and forgot the tens.' },
      { value: '89', correct: false, errorTag: 'err_off_by_ten',     misconceptionExplanation: 'Miscounted the tens by one.' }
    ],
    hint: '9 tens → write 9 first. 9 ones → write 9 after. 99.',
    intervention: {
      errorTag: 'err_ignored_ones',
      title: 'Both digits are 9 — write both',
      teachingSteps: [
        '9 tens → write 9 in the tens place.',
        '9 ones → write 9 in the ones place.',
        'The number is 99. Both digits are 9.'
      ],
      correctAnswerExplanation: '9 tens and 9 ones = 99. Both the tens and ones digits must be written.'
    }
  }),

  _l21Q(62, {
    difficulty: 'medium',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'The number is 53. How many tens does it have?',
    visual: null,
    answer: '5',
    choices: [
      { value: '5',  correct: true },
      { value: '3',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the ones digit instead of the tens digit.' },
      { value: '53', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '8',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 53, which digit is on the left? That is the tens digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The left digit tells the tens',
      teachingSteps: [
        'In 53: the digit on the left is 5.',
        'The 5 is in the tens place. So there are 5 tens.',
        'The 3 is in the ones place — but the question asked for tens.'
      ],
      correctAnswerExplanation: '53 has 5 in the tens place. So it has 5 tens.'
    }
  }),

  _l21Q(63, {
    difficulty: 'medium',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'The number is 41. How many ones does it have?',
    visual: null,
    answer: '1',
    choices: [
      { value: '1',  correct: true },
      { value: '4',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the tens digit instead of the ones digit.' },
      { value: '41', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '5',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 41, the digit on the right is the ones digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The right digit tells the ones',
      teachingSteps: [
        'In 41: the digit on the right is 1.',
        'The 1 is in the ones place. So there is 1 one.',
        'The 4 is the tens digit — but the question asked for ones.'
      ],
      correctAnswerExplanation: '41 has 1 in the ones place. So it has 1 one.'
    }
  }),

  _l21Q(64, {
    difficulty: 'medium',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'I have 7 ones and 2 tens. What number am I?',
    visual: null,
    answer: '27',
    choices: [
      { value: '27', correct: true },
      { value: '72', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Read the digits in the order named (7 first, then 2) instead of tens first.' },
      { value: '20', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and dropped the ones.' },
      { value: '7',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and ignored the tens.' }
    ],
    hint: 'Find the tens first, even when named second. 2 tens → write 2 first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Always find the tens first',
      teachingSteps: [
        'The problem says "7 ones and 2 tens." Find the tens: 2 tens.',
        'Find the ones: 7 ones.',
        'Write tens first: 2, then ones: 7. The number is 27, not 72.'
      ],
      correctAnswerExplanation: '2 tens and 7 ones = 27. Tens digit (2) always comes before ones digit (7).'
    }
  }),

  // ── Hard additions q65–q80 ────────────────────────────────────────────────

  _l21Q(65, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 7, ones: 1 } },
    answer: '71',
    choices: [
      { value: '71', correct: true },
      { value: '17', correct: false, errorTag: 'err_reversed_tens_ones',    misconceptionExplanation: 'Reversed the digits — a classic teen-number trap.' },
      { value: '70', correct: false, errorTag: 'err_ignored_ones',          misconceptionExplanation: 'Counted only the rods and ignored the 1 cube.' },
      { value: '8',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added 7 rods + 1 cube = 8 instead of reading place value.' }
    ],
    hint: 'There are 7 rods — that means 7 tens, not 7 ones. Tens come first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '7 rods means 7 tens — write 7 first',
      teachingSteps: [
        'Count the rods: 7 rods. Each rod = 10. That is 7 tens.',
        'Count the cubes: 1 cube. That is 1 one.',
        'Write the tens first: 7, then the ones: 1. The number is 71, not 17.'
      ],
      correctAnswerExplanation: '7 tens and 1 one = 71. The tens digit (7) always comes before the ones digit (1).'
    }
  }),

  _l21Q(66, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 8 tens and 4 ones?',
    visual: null,
    answer: '84',
    choices: [
      { value: '84', correct: true },
      { value: '48', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '80', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and dropped the ones.' },
      { value: '4',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and ignored the tens.' }
    ],
    hint: '8 tens is a large number. Write 8 first, then 4. Not 48.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Eight tens goes in front',
      teachingSteps: [
        '8 tens → the tens digit is 8. Write 8 first.',
        '4 ones → the ones digit is 4. Write 4 second.',
        'The number is 84. If you wrote 48, you only have 4 tens — not 8.'
      ],
      correctAnswerExplanation: '8 tens and 4 ones = 84. Tens digit (8) before ones digit (4).'
    }
  }),

  _l21Q(67, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'I have 9 ones and 3 tens. What number am I?',
    visual: null,
    answer: '39',
    choices: [
      { value: '39', correct: true },
      { value: '93', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Read the digits in the order named (9 first, then 3) instead of tens first.' },
      { value: '30', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens (3) and dropped the ones (9).' },
      { value: '9',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones (9) and ignored the tens (3).' }
    ],
    hint: 'The question names ones first — but always find the tens first. 3 tens → write 3 first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Ones named first — but tens are still written first',
      teachingSteps: [
        'The problem says "9 ones and 3 tens." Find the tens: 3 tens.',
        'Find the ones: 9 ones.',
        'Write tens first: 3, then ones: 9. The number is 39, not 93.'
      ],
      correctAnswerExplanation: '3 tens and 9 ones = 39. No matter what order the problem lists them, tens are always written first.'
    }
  }),

  _l21Q(68, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 5, ones: 3 } },
    answer: '53',
    choices: [
      { value: '53', correct: true },
      { value: '43', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Undercounted the rods by 1 — counted 4 instead of 5.' },
      { value: '63', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Overcounted the rods by 1 — counted 6 instead of 5.' },
      { value: '35', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' }
    ],
    hint: 'Count every rod carefully. Count from 1 to the last rod.',
    intervention: {
      errorTag: 'err_off_by_ten',
      title: 'Count every rod — do not skip or double-count',
      teachingSteps: [
        'Point to each rod as you count: 1, 2, 3, 4, 5.',
        'There are exactly 5 rods. That is 5 tens.',
        'Count the cubes: 3. So the number is 53.'
      ],
      correctAnswerExplanation: 'There are 5 rods and 3 cubes. 5 tens and 3 ones = 53.'
    }
  }),

  _l21Q(69, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 1 ten and 9 ones?',
    visual: null,
    answer: '19',
    choices: [
      { value: '19', correct: true },
      { value: '91', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Wrote the ones digit (9) before the tens digit (1).' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '9',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' }
    ],
    hint: 'There is only 1 ten. Write 1 first. Then write 9 ones.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Even 1 ten is written first',
      teachingSteps: [
        '1 ten → the tens digit is 1. Write 1 first.',
        '9 ones → the ones digit is 9. Write 9 second.',
        'The number is 19, not 91. Having more ones than tens does not change the order.'
      ],
      correctAnswerExplanation: '1 ten and 9 ones = 19. The tens digit (1) always comes before the ones digit (9).'
    }
  }),

  _l21Q(70, {
    difficulty: 'hard',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'The number is 18. How many tens does it have?',
    visual: null,
    answer: '1',
    choices: [
      { value: '1',  correct: true },
      { value: '8',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the ones digit (8) instead of the tens digit — a common teen-number mistake.' },
      { value: '18', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '9',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 18, the first digit tells the tens. The 8 is the ones — do not confuse them.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'In teen numbers, the 1 is the tens digit',
      teachingSteps: [
        'In 18: the 1 is on the left. The left digit is always the tens digit.',
        'So 18 has 1 ten.',
        'The 8 is the ones digit — it is on the right. Do not swap them!'
      ],
      correctAnswerExplanation: '18 has 1 in the tens place. So it has 1 ten. The 8 is in the ones place.'
    }
  }),

  _l21Q(71, {
    difficulty: 'hard',
    subSkill: 'identify_ones_digit',
    keyIdea: 'Each ones cube stands for 1. Count the cubes to find the ones digit.',
    prompt: 'The number is 81. How many ones does it have?',
    visual: null,
    answer: '1',
    choices: [
      { value: '1',  correct: true },
      { value: '8',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the tens digit (8) instead of the ones digit — a reversal trap.' },
      { value: '81', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the ones count.' },
      { value: '9',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 81, the second digit tells the ones. Watch out — 8 is the tens digit, not the ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The right digit is ones — even when it is smaller',
      teachingSteps: [
        'In 81: the digit on the right is 1. The right digit is always the ones digit.',
        'So 81 has 1 one.',
        'The 8 is the tens digit — it is on the left. Do not swap them!'
      ],
      correctAnswerExplanation: '81 has 1 in the ones place. So it has 1 one. The 8 is in the tens place.'
    }
  }),

  _l21Q(72, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 6, ones: 9 } },
    answer: '69',
    choices: [
      { value: '69', correct: true },
      { value: '96', correct: false, errorTag: 'err_reversed_tens_ones',    misconceptionExplanation: 'Reversed the tens and ones digits.' },
      { value: '60', correct: false, errorTag: 'err_ignored_ones',          misconceptionExplanation: 'Counted only the 6 rods and missed all 9 cubes.' },
      { value: '9',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Counted only the cubes.' }
    ],
    hint: 'Count all 6 rods carefully. Count all 9 cubes. Rods are tens — write them first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'More cubes than rods — tens still go first',
      teachingSteps: [
        'Count the rods: 1 through 6. There are 6 tens.',
        'Count the cubes: 1 through 9. There are 9 ones.',
        'Write the tens first: 6, then the ones: 9. The number is 69, not 96.'
      ],
      correctAnswerExplanation: '6 tens and 9 ones = 69. Even when there are more ones than tens, tens are always written first.'
    }
  }),

  _l21Q(73, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'If there are no ones cubes, the ones digit is 0.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 9, ones: 0 } },
    answer: '90',
    choices: [
      { value: '90', correct: true },
      { value: '9',  correct: false, errorTag: 'err_zero_ones_confusion', misconceptionExplanation: 'Counted only the 9 rods and forgot to write 0 in the ones place.' },
      { value: '80', correct: false, errorTag: 'err_off_by_ten',          misconceptionExplanation: 'Miscounted the rods — counted 8 instead of 9.' },
      { value: '100', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Overcounted — added an extra ten.' }
    ],
    hint: 'Count all 9 rods. There are no cubes. Write 9 tens and 0 ones.',
    intervention: {
      errorTag: 'err_zero_ones_confusion',
      title: 'Nine rods and no cubes — write 90',
      teachingSteps: [
        'Count the rods carefully: 1, 2, 3, 4, 5, 6, 7, 8, 9. There are 9 tens.',
        'There are no cubes at all. The ones place is 0.',
        '9 tens and 0 ones = 90. Do not forget the zero!'
      ],
      correctAnswerExplanation: '9 tens and 0 ones = 90. The 0 must fill the ones place.'
    }
  }),

  _l21Q(74, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'I have 5 ones and 5 tens. What number am I?',
    visual: null,
    answer: '55',
    choices: [
      { value: '55', correct: true },
      { value: '50', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '5',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and forgot the tens.' },
      { value: '45', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Miscounted the tens.' }
    ],
    hint: 'Both the tens and the ones are 5. Write 5 in the tens place AND 5 in the ones place.',
    intervention: {
      errorTag: 'err_ignored_ones',
      title: 'Both digits are 5 — write both',
      teachingSteps: [
        '5 tens → write 5 in the tens place.',
        '5 ones → write 5 in the ones place.',
        'The number is 55. Both groups of 5 must be counted.'
      ],
      correctAnswerExplanation: '5 tens and 5 ones = 55. Both the tens digit and the ones digit are 5.'
    }
  }),

  _l21Q(75, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 3, ones: 7 } },
    answer: '37',
    choices: [
      { value: '37', correct: true },
      { value: '27', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Undercounted the rods — counted 2 instead of 3.' },
      { value: '47', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Overcounted the rods — counted 4 instead of 3.' },
      { value: '73', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' }
    ],
    hint: 'Point to each rod as you count to avoid skipping or double-counting.',
    intervention: {
      errorTag: 'err_off_by_ten',
      title: 'Count every rod carefully',
      teachingSteps: [
        'Touch each rod and count: 1 rod, 2 rods, 3 rods.',
        'There are exactly 3 rods. That is 3 tens.',
        'Count the cubes: 7. So the number is 37.'
      ],
      correctAnswerExplanation: '3 tens and 7 ones = 37. Counting carefully prevents off-by-ten mistakes.'
    }
  }),

  _l21Q(76, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 1, ones: 6 } },
    answer: '16',
    choices: [
      { value: '16', correct: true },
      { value: '61', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the digits — wrote the ones (6) before the tens (1).' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Saw 1 rod and stopped — ignored the 6 cubes.' },
      { value: '6',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Counted only the cubes and ignored the rod.' }
    ],
    hint: '1 rod = 1 ten. 6 cubes = 6 ones. Write tens first. Do not flip the digits!',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'One rod — but it is still the tens digit',
      teachingSteps: [
        'Count the rods: 1 rod. That is 1 ten.',
        'Count the cubes: 1, 2, 3, 4, 5, 6. That is 6 ones.',
        'Write the tens first: 1, then the ones: 6. The number is 16, not 61.'
      ],
      correctAnswerExplanation: '1 ten and 6 ones = 16. The tens digit (1) comes before the ones digit (6).'
    }
  }),

  _l21Q(77, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'I have 8 ones and 1 ten. What number am I?',
    visual: null,
    answer: '18',
    choices: [
      { value: '18', correct: true },
      { value: '81', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Read the digits in the order stated (8 first, then 1) instead of writing tens first.' },
      { value: '10', correct: false, errorTag: 'err_ignored_ones',       misconceptionExplanation: 'Used only the tens and dropped the ones (8).' },
      { value: '8',  correct: false, errorTag: 'err_ignored_tens',       misconceptionExplanation: 'Used only the ones and ignored the ten.' }
    ],
    hint: 'Ones are named first — but the tens digit is always written first. 1 ten → write 1 first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Tens digit always goes first — even when named last',
      teachingSteps: [
        'The problem says "8 ones and 1 ten." Find the tens: 1 ten.',
        'Find the ones: 8 ones.',
        'Write tens first: 1, then ones: 8. The number is 18, not 81.'
      ],
      correctAnswerExplanation: '1 ten and 8 ones = 18. Tens digit (1) must be written before ones digit (8).'
    }
  }),

  _l21Q(78, {
    difficulty: 'hard',
    subSkill: 'build_from_tens_ones',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    prompt: 'Which number has 7 tens and 7 ones?',
    visual: null,
    answer: '77',
    choices: [
      { value: '77', correct: true },
      { value: '70', correct: false, errorTag: 'err_ignored_ones',   misconceptionExplanation: 'Used only the tens and forgot the ones.' },
      { value: '7',  correct: false, errorTag: 'err_ignored_tens',   misconceptionExplanation: 'Used only the ones and forgot the tens.' },
      { value: '67', correct: false, errorTag: 'err_off_by_ten',     misconceptionExplanation: 'Miscounted the tens by one.' }
    ],
    hint: '7 tens → write 7 first. 7 ones → write 7 after. Both digits are 7: 77.',
    intervention: {
      errorTag: 'err_ignored_ones',
      title: 'Write both 7s — one for tens, one for ones',
      teachingSteps: [
        '7 tens → write 7 in the tens place.',
        '7 ones → write 7 in the ones place.',
        'The number is 77. Both digits are 7.'
      ],
      correctAnswerExplanation: '7 tens and 7 ones = 77. Both the tens and ones digits must be written.'
    }
  }),

  _l21Q(79, {
    difficulty: 'hard',
    subSkill: 'identify_tens_digit',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'The number is 17. How many tens does it have?',
    visual: null,
    answer: '1',
    choices: [
      { value: '1',  correct: true },
      { value: '7',  correct: false, errorTag: 'err_tens_ones_swap',        misconceptionExplanation: 'Read the ones digit (7) instead of the tens digit — a common teen-number error.' },
      { value: '17', correct: false, errorTag: 'err_place_value_confusion', misconceptionExplanation: 'Gave the whole number instead of just the tens count.' },
      { value: '8',  correct: false, errorTag: 'err_counted_all_not_group', misconceptionExplanation: 'Added both digits together.' }
    ],
    hint: 'In 17, the tens digit is on the left. The 7 is the ones digit — do not switch them.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The left digit is tens — even in teen numbers',
      teachingSteps: [
        'In 17: the digit on the left is 1. The left digit is always the tens digit.',
        'So 17 has 1 ten.',
        'The 7 is the ones digit. In teen numbers, students often swap 1 and the other digit — but tens always come first!'
      ],
      correctAnswerExplanation: '17 has 1 in the tens place. So it has 1 ten. The 7 is in the ones place.'
    }
  }),

  _l21Q(80, {
    difficulty: 'hard',
    subSkill: 'read_base10_model',
    keyIdea: 'Each tens rod stands for 10. Count the rods to find the tens digit.',
    prompt: 'What number do the blocks show?',
    visual: { type: 'base10', config: { tens: 4, ones: 6 } },
    answer: '46',
    choices: [
      { value: '46', correct: true },
      { value: '36', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Undercounted the rods — counted 3 instead of 4.' },
      { value: '56', correct: false, errorTag: 'err_off_by_ten',         misconceptionExplanation: 'Overcounted the rods — counted 5 instead of 4.' },
      { value: '64', correct: false, errorTag: 'err_reversed_tens_ones', misconceptionExplanation: 'Reversed the tens and ones digits.' }
    ],
    hint: 'Touch each rod as you count. Then count every cube. Write tens first.',
    intervention: {
      errorTag: 'err_off_by_ten',
      title: 'Count the rods one by one',
      teachingSteps: [
        'Touch each rod and count aloud: 1, 2, 3, 4.',
        'There are exactly 4 rods. That is 4 tens.',
        'Count the cubes: 6. So the number is 46.'
      ],
      correctAnswerExplanation: '4 tens and 6 ones = 46. Careful counting of the rods prevents off-by-ten mistakes.'
    }
  })

];

// ── L2.2 factory ─────────────────────────────────────────────────────────────
function _l22Q(n, o) {
  return {
    id: 'g1-u2-l2-q-' + String(n).padStart(3, '0'),
    teks: ['1.2B'],
    lessonId: 'g1-u2-l2',
    skill: 'tens_and_ones',
    subSkill: o.subSkill,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual || null,
    answer: o.answer,
    choices: o.choices.map(function(v) {
      return { value: String(v), correct: String(v) === String(o.answer) };
    }),
    hint: o.hint,
    intervention: Object.assign({
      followUpRule: 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: true
    }, o.intervention)
  };
}

// ── L2.2 worked examples ──────────────────────────────────────────────────────
const _l22Examples = [
  {
    title: 'Tens and Ones: 34',
    steps: [
      'Look at the base-10 blocks: 3 rods and 4 cubes.',
      'Each blue rod stands for 10. Three rods = 30.',
      'Each orange cube stands for 1. Four cubes = 4.',
      '34 = 30 + 4. Three tens and four ones.'
    ],
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 4 } }
  },
  {
    title: 'Tens and Ones: 50',
    steps: [
      'Look at the base-10 blocks: 5 rods and 0 cubes.',
      '5 rods = 50. Zero cubes = 0.',
      '50 = 50 + 0. Five tens and zero ones.',
      'When there are no ones, the ones digit is 0.'
    ],
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 0 } }
  },
  {
    title: 'Tens and Ones: 68',
    steps: [
      'Look at the base-10 blocks: 6 rods and 8 cubes.',
      '6 rods = 60. 8 cubes = 8.',
      '68 = 60 + 8. Six tens and eight ones.',
      'Tens value + ones value = the full number.'
    ],
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 8 } }
  }
];

// ── L2.2 quiz bank ────────────────────────────────────────────────────────────
const _l22QuizBank = [

  // ─── EASY (q001–q055) ──────────────────────────────────────────────────────
  // q001–q010  identify_tens  (visual)

  _l22Q(1, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 4 } },
    answer: '2',
    choices: ['2', '3', '4', '24'],
    hint: 'Count the blue rods. Each rod is one ten.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the blue rods',
      teachingSteps: [
        'The tall blue rods are the tens rods. Each one equals 10.',
        'The small orange cubes are the ones. Each cube equals 1.',
        'Count only the blue rods: 1, 2. There are 2 tens rods.',
        'The number 24 has 2 tens and 4 ones — not 4 tens.'
      ],
      correctAnswerExplanation: 'The picture shows 2 blue rods, so there are 2 tens.'
    }
  }),

  _l22Q(2, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 5 } },
    answer: '3',
    choices: ['2', '3', '5', '35'],
    hint: 'Count the blue rods from left to right.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the blue rods',
      teachingSteps: [
        'The tall blue rods are the tens. Count them: 1, 2, 3.',
        'The orange cubes are the ones — do not count those for this question.',
        '35 has 3 tens and 5 ones.'
      ],
      correctAnswerExplanation: 'Three blue rods = 3 tens.'
    }
  }),

  _l22Q(3, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 7 } },
    answer: '1',
    choices: ['1', '2', '7', '17'],
    hint: 'Count the blue rods. How many do you see?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'One rod means one ten',
      teachingSteps: [
        'Look for the tall blue rods — those are the tens.',
        'Count the rods: just 1.',
        '17 has 1 ten (one rod) and 7 ones (seven cubes).'
      ],
      correctAnswerExplanation: 'There is 1 blue rod, so there is 1 ten.'
    }
  }),

  _l22Q(4, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 0 } },
    answer: '4',
    choices: ['0', '3', '4', '40'],
    hint: 'No cubes means zero ones. Count just the rods.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones does not change the tens count',
      teachingSteps: [
        'Count the blue rods: 1, 2, 3, 4. There are 4 tens rods.',
        'There are no orange cubes, so the ones digit is 0.',
        '40 = 4 tens and 0 ones.'
      ],
      correctAnswerExplanation: 'Four blue rods = 4 tens. No cubes means 0 ones.'
    }
  }),

  _l22Q(5, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 2 } },
    answer: '5',
    choices: ['2', '5', '6', '52'],
    hint: 'Count the tall blue rods.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The blue rods are the tens',
      teachingSteps: [
        'Count only the blue rods: 1, 2, 3, 4, 5. Five rods.',
        'The 2 orange cubes are the ones — those are NOT the tens.',
        '52 has 5 tens and 2 ones.'
      ],
      correctAnswerExplanation: 'Five blue rods = 5 tens.'
    }
  }),

  _l22Q(6, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 3 } },
    answer: '1',
    choices: ['1', '2', '3', '13'],
    hint: 'Count the tall blue rods.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Find the tens rods',
      teachingSteps: [
        'The blue rods are tens. Count them: just 1 rod.',
        'The 3 orange cubes are the ones.',
        '13 = 1 ten and 3 ones.'
      ],
      correctAnswerExplanation: 'One blue rod = 1 ten.'
    }
  }),

  _l22Q(7, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 1 } },
    answer: '6',
    choices: ['1', '6', '7', '61'],
    hint: 'Count each blue rod: 1, 2, 3…',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens, cubes are ones',
      teachingSteps: [
        'Count the blue rods: 1, 2, 3, 4, 5, 6.',
        'The 1 orange cube is the ones digit.',
        '61 = 6 tens and 1 one.'
      ],
      correctAnswerExplanation: 'Six blue rods = 6 tens.'
    }
  }),

  _l22Q(8, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 8 } },
    answer: '2',
    choices: ['2', '3', '8', '28'],
    hint: 'Count the blue rods, not the orange cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count only the blue rods',
      teachingSteps: [
        'There are 8 orange cubes (ones) and 2 blue rods (tens).',
        'The question asks for tens, so count only the blue rods.',
        '28 = 2 tens and 8 ones.'
      ],
      correctAnswerExplanation: 'Two blue rods = 2 tens, not 8.'
    }
  }),

  _l22Q(9, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 5 } },
    answer: '4',
    choices: ['3', '4', '5', '45'],
    hint: 'Point to each blue rod and count.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens rods vs. ones cubes',
      teachingSteps: [
        'The question asks about tens.',
        'Count the tall blue rods: 1, 2, 3, 4.',
        '45 has 4 tens and 5 ones.'
      ],
      correctAnswerExplanation: 'Four blue rods = 4 tens.'
    }
  }),

  _l22Q(10, {
    subSkill: 'identify_tens',
    keyIdea: 'The tens digit tells how many groups of 10.',
    difficulty: 'easy',
    prompt: 'How many tens are in this number?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 0 } },
    answer: '7',
    choices: ['0', '7', '8', '70'],
    hint: 'Count the blue rods. There are no cubes to count.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones, but seven tens',
      teachingSteps: [
        'Count the blue rods: 1, 2, 3, 4, 5, 6, 7.',
        'There are no orange cubes, so ones = 0.',
        '70 = 7 tens and 0 ones. The answer is 7 tens.'
      ],
      correctAnswerExplanation: 'Seven blue rods = 7 tens.'
    }
  }),

  // q011–q015  identify_ones  (text)

  _l22Q(11, {
    subSkill: 'identify_ones',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'easy',
    prompt: 'The number 36 has how many ones?',
    visual: null,
    answer: '6',
    choices: ['3', '5', '6', '9'],
    hint: 'The ones digit is the last digit on the right.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The last digit is the ones',
      teachingSteps: [
        'In the number 36, the digit 3 is in the tens place.',
        'The digit 6 is in the ones place — it is the last digit.',
        '36 has 3 tens and 6 ones.'
      ],
      correctAnswerExplanation: '36 has 3 tens and 6 ones. The ones digit is 6.'
    }
  }),

  _l22Q(12, {
    subSkill: 'identify_ones',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'easy',
    prompt: 'How many ones are in 54?',
    visual: null,
    answer: '4',
    choices: ['4', '5', '9', '45'],
    hint: 'Look at the last digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones is the last digit',
      teachingSteps: [
        '54: the 5 is in the tens place, the 4 is in the ones place.',
        'The ones digit is 4.',
        'Always look at the digit on the right for ones.'
      ],
      correctAnswerExplanation: '54 has 5 tens and 4 ones. The ones digit is 4.'
    }
  }),

  _l22Q(13, {
    subSkill: 'identify_ones',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'easy',
    prompt: 'The number 23 — how many ones does it have?',
    visual: null,
    answer: '3',
    choices: ['2', '3', '5', '23'],
    hint: 'Which digit is in the ones place?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'The right-side digit is ones',
      teachingSteps: [
        'In 23, the 2 is the tens digit (left side).',
        'The 3 is the ones digit (right side).',
        '23 = 2 tens and 3 ones.'
      ],
      correctAnswerExplanation: '23 has 3 ones. The ones digit is always on the right.'
    }
  }),

  _l22Q(14, {
    subSkill: 'identify_ones',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'easy',
    prompt: 'How many ones are in 81?',
    visual: null,
    answer: '1',
    choices: ['1', '8', '9', '18'],
    hint: 'Look at the second digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Find the ones digit',
      teachingSteps: [
        '81: the 8 is in the tens place (left), the 1 is in the ones place (right).',
        'The ones digit is 1.',
        '81 = 8 tens and 1 one.'
      ],
      correctAnswerExplanation: '81 has 1 one. The last digit, 1, is in the ones place.'
    }
  }),

  _l22Q(15, {
    subSkill: 'identify_ones',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'easy',
    prompt: 'How many ones are in 19?',
    visual: null,
    answer: '9',
    choices: ['1', '9', '10', '19'],
    hint: 'The second digit tells you the ones.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers: ones come last',
      teachingSteps: [
        'In 19, the 1 is the tens digit and the 9 is the ones digit.',
        'Even though we say "nine-teen," the 9 is in the ones place.',
        '19 = 1 ten and 9 ones.'
      ],
      correctAnswerExplanation: '19 has 9 ones. The 9 is the last digit, which is the ones place.'
    }
  }),

  // q016–q025  tens_ones_to_number  (text)

  _l22Q(16, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '3 tens and 7 ones. What number is that?',
    visual: null,
    answer: '37',
    choices: ['37', '73', '30', '47'],
    hint: 'Put the tens digit first, then the ones digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit goes first',
      teachingSteps: [
        '3 tens → the tens digit is 3. It goes on the left.',
        '7 ones → the ones digit is 7. It goes on the right.',
        'Write the tens first, then the ones: 3 then 7 = 37.',
        '73 is wrong — that would be 7 tens and 3 ones.'
      ],
      correctAnswerExplanation: '3 tens + 7 ones = 37. The tens digit (3) comes first.'
    }
  }),

  _l22Q(17, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '5 tens and 2 ones. What number is that?',
    visual: null,
    answer: '52',
    choices: ['25', '52', '50', '57'],
    hint: 'Tens digit first, then ones digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Put tens first',
      teachingSteps: [
        '5 tens → write 5 first.',
        '2 ones → write 2 after the 5.',
        '52. Not 25 — that would be 2 tens and 5 ones.'
      ],
      correctAnswerExplanation: '5 tens and 2 ones = 52.'
    }
  }),

  _l22Q(18, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '1 ten and 8 ones. What number is that?',
    visual: null,
    answer: '18',
    choices: ['18', '81', '10', '19'],
    hint: 'The tens digit (1) goes first.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers: tens digit still goes first',
      teachingSteps: [
        '1 ten → the tens digit is 1.',
        '8 ones → the ones digit is 8.',
        'Write 1 then 8 = 18.',
        '81 is wrong — that is 8 tens and 1 one.'
      ],
      correctAnswerExplanation: '1 ten and 8 ones = 18.'
    }
  }),

  _l22Q(19, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: '4 tens and 0 ones. What number is that?',
    visual: null,
    answer: '40',
    choices: ['4', '14', '40', '44'],
    hint: 'Write 4 for the tens, then 0 for the ones.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones still needs a digit',
      teachingSteps: [
        '4 tens → write 4 in the tens place.',
        '0 ones → write 0 in the ones place.',
        'The number is 40, not just 4.',
        'We always need two digits for tens-and-ones numbers.'
      ],
      correctAnswerExplanation: '4 tens and 0 ones = 40. The 0 holds the ones place.'
    }
  }),

  _l22Q(20, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '6 tens and 3 ones. What number is that?',
    visual: null,
    answer: '63',
    choices: ['36', '63', '60', '69'],
    hint: 'Tens first, ones second.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit always goes first',
      teachingSteps: [
        '6 tens → the first digit is 6.',
        '3 ones → the second digit is 3.',
        '63. Not 36 — that would be 3 tens and 6 ones.'
      ],
      correctAnswerExplanation: '6 tens and 3 ones = 63.'
    }
  }),

  _l22Q(21, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '2 tens and 5 ones. What number is that?',
    visual: null,
    answer: '25',
    choices: ['25', '52', '20', '27'],
    hint: 'Write the tens digit, then the ones digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Write tens first',
      teachingSteps: [
        '2 tens, 5 ones → 25.',
        '52 would be 5 tens and 2 ones — that is different.'
      ],
      correctAnswerExplanation: '2 tens and 5 ones = 25.'
    }
  }),

  _l22Q(22, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '7 tens and 1 one. What number is that?',
    visual: null,
    answer: '71',
    choices: ['17', '71', '70', '72'],
    hint: 'Which digit is the tens? Write it first.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Tens always go first',
      teachingSteps: [
        '7 tens → write 7 first.',
        '1 one → write 1 after.',
        '71. Not 17 — that is 1 ten and 7 ones.'
      ],
      correctAnswerExplanation: '7 tens and 1 one = 71.'
    }
  }),

  _l22Q(23, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: '3 tens and 0 ones. What number is that?',
    visual: null,
    answer: '30',
    choices: ['3', '13', '30', '33'],
    hint: 'Write a 0 in the ones place.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Write a 0 for no ones',
      teachingSteps: [
        '3 tens → the tens digit is 3.',
        '0 ones → we write 0 in the ones place.',
        '30, not 3. We always fill both places.'
      ],
      correctAnswerExplanation: '3 tens and 0 ones = 30.'
    }
  }),

  _l22Q(24, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '8 tens and 4 ones. What number is that?',
    visual: null,
    answer: '84',
    choices: ['48', '84', '80', '88'],
    hint: 'The tens digit (8) goes first.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit first',
      teachingSteps: [
        '8 tens → write 8 first.',
        '4 ones → write 4 next.',
        '84. Not 48 — that is 4 tens and 8 ones.'
      ],
      correctAnswerExplanation: '8 tens and 4 ones = 84.'
    }
  }),

  _l22Q(25, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: '1 ten and 6 ones. What number is that?',
    visual: null,
    answer: '16',
    choices: ['16', '61', '10', '17'],
    hint: 'Put the 1 first, then the 6.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers go tens first',
      teachingSteps: [
        '1 ten → 1 is the tens digit.',
        '6 ones → 6 is the ones digit.',
        '16. Not 61 — that is 6 tens and 1 one.'
      ],
      correctAnswerExplanation: '1 ten and 6 ones = 16.'
    }
  }),

  // q026–q035  tens_ones_to_number  (visual)

  _l22Q(26, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 2 tens and 5 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 5 } },
    answer: '25',
    choices: ['25', '52', '20', '27'],
    hint: 'Tens first, then ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit goes first',
      teachingSteps: [
        '2 blue rods = 2 tens.',
        '5 orange cubes = 5 ones.',
        'Write the tens first: 2, then the ones: 5. That is 25.'
      ],
      correctAnswerExplanation: '2 tens and 5 ones = 25.'
    }
  }),

  _l22Q(27, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 7 tens and 1 one. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 1 } },
    answer: '71',
    choices: ['17', '71', '70', '72'],
    hint: 'The tens digit (7) comes before the ones digit (1).',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Tens come first',
      teachingSteps: [
        '7 blue rods = 7 tens.',
        '1 orange cube = 1 one.',
        '7 tens then 1 one = 71.'
      ],
      correctAnswerExplanation: '7 tens and 1 one = 71, not 17.'
    }
  }),

  _l22Q(28, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: 'The blocks show 3 tens and 0 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 0 } },
    answer: '30',
    choices: ['3', '13', '30', '33'],
    hint: 'No cubes means 0 ones. Write a 0 in the ones place.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones still needs a digit',
      teachingSteps: [
        '3 blue rods = 3 tens.',
        'No orange cubes = 0 ones.',
        '30: write 3 for tens and 0 for ones.'
      ],
      correctAnswerExplanation: '3 tens and 0 ones = 30.'
    }
  }),

  _l22Q(29, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 8 tens and 4 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 4 } },
    answer: '84',
    choices: ['48', '84', '80', '88'],
    hint: 'Count the rods (tens), then the cubes (ones).',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods first, cubes second',
      teachingSteps: [
        'Count rods: 8. Count cubes: 4.',
        'Write rods first: 8, then cubes: 4. That is 84.',
        '48 would be 4 rods and 8 cubes — the opposite.'
      ],
      correctAnswerExplanation: '8 tens and 4 ones = 84.'
    }
  }),

  _l22Q(30, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 1 ten and 6 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 6 } },
    answer: '16',
    choices: ['16', '61', '10', '17'],
    hint: 'Write the tens digit (1) first.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers go tens first',
      teachingSteps: [
        'There is 1 blue rod (1 ten) and 6 orange cubes (6 ones).',
        'Write 1 ten then 6 ones: 16.',
        '61 is 6 tens and 1 one — not the same.'
      ],
      correctAnswerExplanation: '1 ten and 6 ones = 16.'
    }
  }),

  _l22Q(31, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 3 tens and 4 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 4 } },
    answer: '34',
    choices: ['34', '43', '30', '37'],
    hint: 'Tens first, ones second.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Write tens before ones',
      teachingSteps: [
        '3 rods (tens) and 4 cubes (ones).',
        'Write 3 first, then 4: 34.'
      ],
      correctAnswerExplanation: '3 tens and 4 ones = 34.'
    }
  }),

  _l22Q(32, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 7 tens and 8 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 8 } },
    answer: '78',
    choices: ['78', '87', '70', '79'],
    hint: 'Count the rods first.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit is first',
      teachingSteps: [
        '7 rods = 7 tens. 8 cubes = 8 ones.',
        'Write 7 then 8: 78.',
        '87 is 8 tens and 7 ones — opposite.'
      ],
      correctAnswerExplanation: '7 tens and 8 ones = 78.'
    }
  }),

  _l22Q(33, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 4 tens and 6 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 6 } },
    answer: '46',
    choices: ['46', '64', '40', '47'],
    hint: 'Count the blue rods, then the orange cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens first, ones second',
      teachingSteps: [
        '4 blue rods = 4 tens. 6 orange cubes = 6 ones.',
        '46. Not 64 — that would be 6 tens and 4 ones.'
      ],
      correctAnswerExplanation: '4 tens and 6 ones = 46.'
    }
  }),

  _l22Q(34, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: 'The blocks show 8 tens and 0 ones. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 0 } },
    answer: '80',
    choices: ['8', '18', '80', '88'],
    hint: 'No cubes means 0 ones. Use 0 as the ones digit.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones needs the digit 0',
      teachingSteps: [
        '8 rods = 8 tens. No cubes = 0 ones.',
        '80: write 8 for tens, 0 for ones.',
        'Just writing 8 means only 8 ones — not 8 tens.'
      ],
      correctAnswerExplanation: '8 tens and 0 ones = 80.'
    }
  }),

  _l22Q(35, {
    subSkill: 'tens_ones_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'The blocks show 1 ten and 1 one. What number is that?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 1 } },
    answer: '11',
    choices: ['11', '2', '10', '21'],
    hint: '1 ten and 1 one — write both digits.',
    intervention: {
      errorTag: 'err_add_all_digits',
      title: 'Add the values, not just the digits',
      teachingSteps: [
        '1 ten = 10. 1 one = 1.',
        '10 + 1 = 11.',
        'The answer is not 2 (which is just 1 + 1 as single digits).'
      ],
      correctAnswerExplanation: '1 ten and 1 one = 11.'
    }
  }),

  // q036–q055  base10_to_number  (visual)

  _l22Q(36, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 3 } },
    answer: '23',
    choices: ['23', '32', '20', '25'],
    hint: 'Count the rods first, then the cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens, cubes are ones',
      teachingSteps: [
        'Count the blue rods: 2. That is 2 tens = 20.',
        'Count the orange cubes: 3. That is 3 ones.',
        '20 + 3 = 23.'
      ],
      correctAnswerExplanation: '2 rods and 3 cubes = 23.'
    }
  }),

  _l22Q(37, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 1 } },
    answer: '41',
    choices: ['14', '41', '40', '42'],
    hint: '4 rods and 1 cube.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Tens first in the number',
      teachingSteps: [
        '4 blue rods = 4 tens. 1 orange cube = 1 one.',
        'Write tens first: 41.',
        '14 would be 1 ten and 4 ones — the opposite.'
      ],
      correctAnswerExplanation: '4 rods and 1 cube = 41.'
    }
  }),

  _l22Q(38, {
    subSkill: 'base10_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 0 } },
    answer: '60',
    choices: ['6', '16', '60', '66'],
    hint: 'No cubes means 0 ones. Write 0 in the ones place.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones — write 60, not 6',
      teachingSteps: [
        '6 blue rods = 6 tens.',
        'No cubes = 0 ones.',
        '6 tens + 0 ones = 60.',
        'Writing just 6 would mean 6 ones, not 6 tens.'
      ],
      correctAnswerExplanation: '6 rods and 0 cubes = 60.'
    }
  }),

  _l22Q(39, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 5 } },
    answer: '15',
    choices: ['15', '51', '10', '16'],
    hint: '1 rod and 5 cubes.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers: 1 ten then ones',
      teachingSteps: [
        '1 blue rod = 1 ten. 5 orange cubes = 5 ones.',
        '1 ten and 5 ones = 15.',
        '51 would be 5 tens and 1 one — a much bigger number.'
      ],
      correctAnswerExplanation: '1 rod and 5 cubes = 15.'
    }
  }),

  _l22Q(40, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 2 } },
    answer: '32',
    choices: ['23', '32', '30', '33'],
    hint: 'Count rods for tens, cubes for ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens, cubes are ones',
      teachingSteps: [
        '3 blue rods = 3 tens.',
        '2 orange cubes = 2 ones.',
        '32. Not 23 — that is 2 rods and 3 cubes.'
      ],
      correctAnswerExplanation: '3 rods and 2 cubes = 32.'
    }
  }),

  _l22Q(41, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 4 } },
    answer: '54',
    choices: ['45', '54', '50', '55'],
    hint: 'Rods → tens, cubes → ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count rods first',
      teachingSteps: [
        '5 rods = 5 tens. 4 cubes = 4 ones.',
        '54. Not 45 — that flips tens and ones.'
      ],
      correctAnswerExplanation: '5 rods and 4 cubes = 54.'
    }
  }),

  _l22Q(42, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 3 } },
    answer: '73',
    choices: ['37', '73', '70', '76'],
    hint: 'How many rods? How many cubes?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit goes first',
      teachingSteps: [
        '7 rods = 7 tens. 3 cubes = 3 ones.',
        '73. Not 37 — that would be 3 rods and 7 cubes.'
      ],
      correctAnswerExplanation: '7 rods and 3 cubes = 73.'
    }
  }),

  _l22Q(43, {
    subSkill: 'base10_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 0 } },
    answer: '20',
    choices: ['2', '12', '20', '22'],
    hint: 'No cubes = 0 ones.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones makes it a round ten',
      teachingSteps: [
        '2 rods = 2 tens. No cubes = 0 ones.',
        '2 tens + 0 ones = 20.',
        'Writing just 2 means 2 ones, not 2 tens.'
      ],
      correctAnswerExplanation: '2 rods and 0 cubes = 20.'
    }
  }),

  _l22Q(44, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 6 } },
    answer: '86',
    choices: ['68', '86', '80', '89'],
    hint: 'Count the rods carefully.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are the tens',
      teachingSteps: [
        '8 rods = 8 tens. 6 cubes = 6 ones.',
        '86. Not 68 — that flips them.'
      ],
      correctAnswerExplanation: '8 rods and 6 cubes = 86.'
    }
  }),

  _l22Q(45, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 8 } },
    answer: '48',
    choices: ['48', '84', '40', '49'],
    hint: '4 rods and 8 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens',
      teachingSteps: [
        '4 rods = 4 tens. 8 cubes = 8 ones.',
        '48. Not 84 — that is 8 rods and 4 cubes.'
      ],
      correctAnswerExplanation: '4 rods and 8 cubes = 48.'
    }
  }),

  _l22Q(46, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 2 } },
    answer: '12',
    choices: ['12', '21', '10', '13'],
    hint: '1 rod and 2 cubes.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers: tens first',
      teachingSteps: [
        '1 rod = 1 ten. 2 cubes = 2 ones.',
        '12. Not 21 — that is 2 tens and 1 one.'
      ],
      correctAnswerExplanation: '1 rod and 2 cubes = 12.'
    }
  }),

  _l22Q(47, {
    subSkill: 'base10_to_number',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 9, ones: 0 } },
    answer: '90',
    choices: ['9', '19', '90', '99'],
    hint: 'No cubes at all — write 0 in the ones place.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Nine tens = 90',
      teachingSteps: [
        '9 rods = 9 tens. No cubes = 0 ones.',
        '90. Not 9 — that is only 9 ones.'
      ],
      correctAnswerExplanation: '9 rods and 0 cubes = 90.'
    }
  }),

  _l22Q(48, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 7 } },
    answer: '37',
    choices: ['37', '73', '30', '38'],
    hint: 'Count 3 rods and 7 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit first',
      teachingSteps: [
        '3 rods = 3 tens. 7 cubes = 7 ones.',
        '37. Not 73 — that flips tens and ones.'
      ],
      correctAnswerExplanation: '3 rods and 7 cubes = 37.'
    }
  }),

  _l22Q(49, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 1 } },
    answer: '51',
    choices: ['15', '51', '50', '52'],
    hint: '5 rods and 1 cube.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Tens digit before ones',
      teachingSteps: [
        '5 rods = 5 tens. 1 cube = 1 one.',
        '51. Not 15 — that is 1 ten and 5 ones.'
      ],
      correctAnswerExplanation: '5 rods and 1 cube = 51.'
    }
  }),

  _l22Q(50, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 4 } },
    answer: '64',
    choices: ['46', '64', '60', '65'],
    hint: '6 rods and 4 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens, cubes are ones',
      teachingSteps: [
        '6 rods = 6 tens. 4 cubes = 4 ones.',
        '64. Not 46 — that is 4 rods and 6 cubes.'
      ],
      correctAnswerExplanation: '6 rods and 4 cubes = 64.'
    }
  }),

  _l22Q(51, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 9 } },
    answer: '29',
    choices: ['29', '92', '20', '28'],
    hint: '2 rods and 9 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count rods first',
      teachingSteps: [
        '2 rods = 2 tens. 9 cubes = 9 ones.',
        '29. Not 92 — that is 9 rods and 2 cubes.'
      ],
      correctAnswerExplanation: '2 rods and 9 cubes = 29.'
    }
  }),

  _l22Q(52, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 5 } },
    answer: '75',
    choices: ['57', '75', '70', '76'],
    hint: '7 rods and 5 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens before ones',
      teachingSteps: [
        '7 rods = 7 tens. 5 cubes = 5 ones.',
        '75. Not 57 — that is 5 rods and 7 cubes.'
      ],
      correctAnswerExplanation: '7 rods and 5 cubes = 75.'
    }
  }),

  _l22Q(53, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 3 } },
    answer: '43',
    choices: ['34', '43', '40', '45'],
    hint: '4 rods and 3 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens',
      teachingSteps: [
        '4 rods = 4 tens. 3 cubes = 3 ones.',
        '43. Not 34 — that is 3 rods and 4 cubes.'
      ],
      correctAnswerExplanation: '4 rods and 3 cubes = 43.'
    }
  }),

  _l22Q(54, {
    subSkill: 'base10_to_number',
    keyIdea: 'Count the rods for tens and the cubes for ones to find the number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 2 } },
    answer: '82',
    choices: ['28', '82', '80', '83'],
    hint: '8 rods and 2 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit first',
      teachingSteps: [
        '8 rods = 8 tens. 2 cubes = 2 ones.',
        '82. Not 28 — that is 2 rods and 8 cubes.'
      ],
      correctAnswerExplanation: '8 rods and 2 cubes = 82.'
    }
  }),

  _l22Q(55, {
    subSkill: 'base10_to_number',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'easy',
    prompt: 'What number do these blocks show?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 0 } },
    answer: '10',
    choices: ['1', '10', '11', '100'],
    hint: '1 rod and no cubes.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'One ten = 10',
      teachingSteps: [
        '1 rod = 1 ten = 10.',
        'No cubes = 0 ones.',
        '10, not 1. Writing 1 means only 1 one.'
      ],
      correctAnswerExplanation: '1 rod and 0 cubes = 10.'
    }
  }),

  // ─── MEDIUM (q056–q130) ────────────────────────────────────────────────────
  // q056–q070  write_expanded_form  (text)

  _l22Q(56, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 34 in expanded form?',
    visual: null,
    answer: '30 + 4',
    choices: ['3 + 4', '30 + 4', '34 + 0', '20 + 4'],
    hint: 'The 3 is in the tens place. What is 3 tens worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Use the value, not just the digit',
      teachingSteps: [
        'In 34, the digit 3 is in the tens place.',
        '3 tens = 30. The digit 3 is worth 30, not 3.',
        'The digit 4 is in the ones place and is worth 4.',
        'So 34 = 30 + 4, not 3 + 4.'
      ],
      correctAnswerExplanation: '34 = 30 + 4. The 3 stands for 3 tens = 30.'
    }
  }),

  _l22Q(57, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 57 in expanded form?',
    visual: null,
    answer: '50 + 7',
    choices: ['5 + 7', '50 + 7', '57 + 0', '40 + 7'],
    hint: 'What is 5 tens worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens digit stands for tens',
      teachingSteps: [
        '57: the 5 is in the tens place. 5 tens = 50.',
        'The 7 is in the ones place. 7 ones = 7.',
        '57 = 50 + 7.'
      ],
      correctAnswerExplanation: '57 = 50 + 7. The tens digit 5 is worth 50.'
    }
  }),

  _l22Q(58, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 23 in expanded form?',
    visual: null,
    answer: '20 + 3',
    choices: ['2 + 3', '20 + 3', '23 + 0', '30 + 2'],
    hint: '2 tens is worth how much?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens digit value vs. digit',
      teachingSteps: [
        '23: the 2 is in the tens place. 2 tens = 20.',
        'The 3 is in the ones place. 3 ones = 3.',
        '23 = 20 + 3.'
      ],
      correctAnswerExplanation: '23 = 20 + 3.'
    }
  }),

  _l22Q(59, {
    subSkill: 'write_expanded_form',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: 'Which shows 60 in expanded form?',
    visual: null,
    answer: '60 + 0',
    choices: ['6 + 0', '60 + 0', '6 + 10', '50 + 0'],
    hint: '6 tens and 0 ones.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Six tens = 60, not 6',
      teachingSteps: [
        '60: the 6 is in the tens place. 6 tens = 60.',
        'The 0 is in the ones place. 0 ones = 0.',
        '60 = 60 + 0.'
      ],
      correctAnswerExplanation: '60 = 60 + 0.'
    }
  }),

  _l22Q(60, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 48 in expanded form?',
    visual: null,
    answer: '40 + 8',
    choices: ['4 + 8', '40 + 8', '48 + 0', '40 + 4'],
    hint: '4 tens is worth 40.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Four tens = 40',
      teachingSteps: [
        '48: the 4 is in the tens place. 4 tens = 40.',
        'The 8 is in the ones place. 8 ones = 8.',
        '48 = 40 + 8.'
      ],
      correctAnswerExplanation: '48 = 40 + 8.'
    }
  }),

  _l22Q(61, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 72 in expanded form?',
    visual: null,
    answer: '70 + 2',
    choices: ['7 + 2', '70 + 2', '72 + 0', '20 + 7'],
    hint: '7 tens = 70.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Seven tens = 70',
      teachingSteps: [
        '72: the 7 is worth 70 (7 tens).',
        'The 2 is worth 2 (2 ones).',
        '72 = 70 + 2.'
      ],
      correctAnswerExplanation: '72 = 70 + 2.'
    }
  }),

  _l22Q(62, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 15 in expanded form?',
    visual: null,
    answer: '10 + 5',
    choices: ['1 + 5', '10 + 5', '15 + 0', '5 + 10'],
    hint: '1 ten = 10.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'One ten = 10',
      teachingSteps: [
        '15: the 1 is in the tens place. 1 ten = 10.',
        'The 5 is in the ones place. 5 ones = 5.',
        '15 = 10 + 5.'
      ],
      correctAnswerExplanation: '15 = 10 + 5.'
    }
  }),

  _l22Q(63, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 91 in expanded form?',
    visual: null,
    answer: '90 + 1',
    choices: ['9 + 1', '90 + 1', '91 + 0', '90 + 9'],
    hint: '9 tens = 90.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Nine tens = 90',
      teachingSteps: [
        '91: the 9 is worth 90 (9 tens).',
        'The 1 is worth 1 (1 one).',
        '91 = 90 + 1.'
      ],
      correctAnswerExplanation: '91 = 90 + 1.'
    }
  }),

  _l22Q(64, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 83 in expanded form?',
    visual: null,
    answer: '80 + 3',
    choices: ['8 + 3', '80 + 3', '83 + 0', '30 + 8'],
    hint: '8 tens = 80.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Eight tens = 80',
      teachingSteps: [
        '83: the 8 is worth 80 (8 tens).',
        'The 3 is worth 3 (3 ones).',
        '83 = 80 + 3.'
      ],
      correctAnswerExplanation: '83 = 80 + 3.'
    }
  }),

  _l22Q(65, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 26 in expanded form?',
    visual: null,
    answer: '20 + 6',
    choices: ['2 + 6', '20 + 6', '26 + 0', '60 + 2'],
    hint: '2 tens = 20.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Two tens = 20',
      teachingSteps: [
        '26: the 2 is worth 20 (2 tens).',
        'The 6 is worth 6 (6 ones).',
        '26 = 20 + 6.'
      ],
      correctAnswerExplanation: '26 = 20 + 6.'
    }
  }),

  _l22Q(66, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 14 in expanded form?',
    visual: null,
    answer: '10 + 4',
    choices: ['1 + 4', '10 + 4', '14 + 0', '40 + 1'],
    hint: '1 ten = 10.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'One ten = 10',
      teachingSteps: [
        '14: the 1 is worth 10 (1 ten).',
        'The 4 is worth 4 (4 ones).',
        '14 = 10 + 4.'
      ],
      correctAnswerExplanation: '14 = 10 + 4.'
    }
  }),

  _l22Q(67, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 76 in expanded form?',
    visual: null,
    answer: '70 + 6',
    choices: ['7 + 6', '70 + 6', '76 + 0', '60 + 7'],
    hint: '7 tens = 70.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Seven tens = 70',
      teachingSteps: [
        '76: the 7 is worth 70 (7 tens).',
        'The 6 is worth 6 (6 ones).',
        '76 = 70 + 6.'
      ],
      correctAnswerExplanation: '76 = 70 + 6.'
    }
  }),

  _l22Q(68, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 52 in expanded form?',
    visual: null,
    answer: '50 + 2',
    choices: ['5 + 2', '50 + 2', '52 + 0', '20 + 5'],
    hint: '5 tens = 50.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Five tens = 50',
      teachingSteps: [
        '52: the 5 is worth 50 (5 tens).',
        'The 2 is worth 2 (2 ones).',
        '52 = 50 + 2.'
      ],
      correctAnswerExplanation: '52 = 50 + 2.'
    }
  }),

  _l22Q(69, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 93 in expanded form?',
    visual: null,
    answer: '90 + 3',
    choices: ['9 + 3', '90 + 3', '93 + 0', '30 + 9'],
    hint: '9 tens = 90.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Nine tens = 90',
      teachingSteps: [
        '93: the 9 is worth 90.',
        'The 3 is worth 3.',
        '93 = 90 + 3.'
      ],
      correctAnswerExplanation: '93 = 90 + 3.'
    }
  }),

  _l22Q(70, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Which shows 61 in expanded form?',
    visual: null,
    answer: '60 + 1',
    choices: ['6 + 1', '60 + 1', '61 + 0', '10 + 6'],
    hint: '6 tens = 60.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Six tens = 60',
      teachingSteps: [
        '61: the 6 is worth 60 (6 tens).',
        'The 1 is worth 1 (1 one).',
        '61 = 60 + 1.'
      ],
      correctAnswerExplanation: '61 = 60 + 1.'
    }
  }),

  // q071–q075  write_expanded_form  (visual)

  _l22Q(71, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Look at the blocks. Which expanded form matches?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 0 } },
    answer: '50 + 0',
    choices: ['5 + 0', '50 + 0', '5 + 10', '50 + 5'],
    hint: '5 rods = 50. No cubes = 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Each rod is worth 10',
      teachingSteps: [
        'Count the blue rods: 5. That is 5 tens = 50.',
        'There are no orange cubes. Ones = 0.',
        '50 + 0.'
      ],
      correctAnswerExplanation: '5 rods = 50. 0 cubes = 0. Expanded form: 50 + 0.'
    }
  }),

  _l22Q(72, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Look at the blocks. Which expanded form matches?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 8 } },
    answer: '60 + 8',
    choices: ['6 + 8', '60 + 8', '68 + 0', '80 + 6'],
    hint: '6 rods = 60. 8 cubes = 8.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Rods are worth 10 each',
      teachingSteps: [
        '6 blue rods = 6 tens = 60.',
        '8 orange cubes = 8 ones = 8.',
        '60 + 8.'
      ],
      correctAnswerExplanation: '6 rods and 8 cubes → 60 + 8.'
    }
  }),

  _l22Q(73, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Look at the blocks. Which expanded form matches?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 7 } },
    answer: '40 + 7',
    choices: ['4 + 7', '40 + 7', '47 + 0', '70 + 4'],
    hint: '4 rods = 40. 7 cubes = 7.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Four rods = 40',
      teachingSteps: [
        '4 blue rods = 40.',
        '7 orange cubes = 7.',
        '40 + 7.'
      ],
      correctAnswerExplanation: '4 rods and 7 cubes → 40 + 7.'
    }
  }),

  _l22Q(74, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Look at the blocks. Which expanded form matches?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 9 } },
    answer: '30 + 9',
    choices: ['3 + 9', '30 + 9', '39 + 0', '90 + 3'],
    hint: '3 rods = 30. 9 cubes = 9.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Three rods = 30',
      teachingSteps: [
        '3 blue rods = 30.',
        '9 orange cubes = 9.',
        '30 + 9.'
      ],
      correctAnswerExplanation: '3 rods and 9 cubes → 30 + 9.'
    }
  }),

  _l22Q(75, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'Look at the blocks. Which expanded form matches?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 5 } },
    answer: '80 + 5',
    choices: ['8 + 5', '80 + 5', '85 + 0', '50 + 8'],
    hint: '8 rods = 80. 5 cubes = 5.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Eight rods = 80',
      teachingSteps: [
        '8 blue rods = 80.',
        '5 orange cubes = 5.',
        '80 + 5.'
      ],
      correctAnswerExplanation: '8 rods and 5 cubes → 80 + 5.'
    }
  }),

  // q076–q090  read_expanded_form  (text)

  _l22Q(76, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 40 + 7?',
    visual: null,
    answer: '47',
    choices: ['47', '74', '11', '407'],
    hint: 'Add the tens value and ones value.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Read expanded form: tens first',
      teachingSteps: [
        '40 is the tens part (4 tens).',
        '7 is the ones part.',
        '40 + 7 = 47. Tens digit (4) comes first.'
      ],
      correctAnswerExplanation: '40 + 7 = 47.'
    }
  }),

  _l22Q(77, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 20 + 9?',
    visual: null,
    answer: '29',
    choices: ['29', '92', '11', '209'],
    hint: '20 is 2 tens. 9 is 9 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Add tens and ones',
      teachingSteps: [
        '20 + 9: the 20 is 2 tens, the 9 is 9 ones.',
        '2 tens and 9 ones = 29.'
      ],
      correctAnswerExplanation: '20 + 9 = 29.'
    }
  }),

  _l22Q(78, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 70 + 5?',
    visual: null,
    answer: '75',
    choices: ['75', '57', '12', '705'],
    hint: '70 is 7 tens. 5 is 5 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens value first in the number',
      teachingSteps: [
        '70 = 7 tens. 5 = 5 ones.',
        '7 tens and 5 ones = 75.'
      ],
      correctAnswerExplanation: '70 + 5 = 75.'
    }
  }),

  _l22Q(79, {
    subSkill: 'read_expanded_form',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: 'What number equals 30 + 0?',
    visual: null,
    answer: '30',
    choices: ['3', '13', '30', '300'],
    hint: '30 is 3 tens. 0 is 0 ones.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones gives a round ten',
      teachingSteps: [
        '30 + 0: the 30 is 3 tens, and 0 ones.',
        '3 tens = 30.'
      ],
      correctAnswerExplanation: '30 + 0 = 30.'
    }
  }),

  _l22Q(80, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 80 + 6?',
    visual: null,
    answer: '86',
    choices: ['68', '86', '14', '806'],
    hint: '80 is 8 tens. 6 is 6 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens value first',
      teachingSteps: [
        '80 = 8 tens. 6 = 6 ones.',
        '8 tens then 6 ones = 86.'
      ],
      correctAnswerExplanation: '80 + 6 = 86.'
    }
  }),

  _l22Q(81, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 10 + 3?',
    visual: null,
    answer: '13',
    choices: ['13', '31', '4', '103'],
    hint: '10 is 1 ten. 3 is 3 ones.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen number: 1 ten first',
      teachingSteps: [
        '10 = 1 ten. 3 = 3 ones.',
        '1 ten and 3 ones = 13.'
      ],
      correctAnswerExplanation: '10 + 3 = 13.'
    }
  }),

  _l22Q(82, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 60 + 4?',
    visual: null,
    answer: '64',
    choices: ['64', '46', '10', '604'],
    hint: '60 is 6 tens. 4 is 4 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens value determines the first digit',
      teachingSteps: [
        '60 = 6 tens. 4 = 4 ones.',
        '6 tens and 4 ones = 64.'
      ],
      correctAnswerExplanation: '60 + 4 = 64.'
    }
  }),

  _l22Q(83, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 90 + 8?',
    visual: null,
    answer: '98',
    choices: ['89', '98', '17', '908'],
    hint: '90 is 9 tens. 8 is 8 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens value comes first',
      teachingSteps: [
        '90 = 9 tens. 8 = 8 ones.',
        '9 tens and 8 ones = 98.'
      ],
      correctAnswerExplanation: '90 + 8 = 98.'
    }
  }),

  _l22Q(84, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 50 + 1?',
    visual: null,
    answer: '51',
    choices: ['15', '51', '6', '501'],
    hint: '50 is 5 tens. 1 is 1 one.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Tens value first',
      teachingSteps: [
        '50 = 5 tens. 1 = 1 one.',
        '5 tens and 1 one = 51, not 15.'
      ],
      correctAnswerExplanation: '50 + 1 = 51.'
    }
  }),

  _l22Q(85, {
    subSkill: 'read_expanded_form',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: 'What number equals 40 + 0?',
    visual: null,
    answer: '40',
    choices: ['4', '14', '40', '400'],
    hint: '40 is 4 tens. 0 ones.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones: the answer is a round ten',
      teachingSteps: [
        '40 + 0 = 40.',
        '4 tens and 0 ones = 40, not 4.'
      ],
      correctAnswerExplanation: '40 + 0 = 40.'
    }
  }),

  _l22Q(86, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 30 + 6?',
    visual: null,
    answer: '36',
    choices: ['36', '63', '9', '306'],
    hint: '30 is 3 tens. 6 is 6 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens first',
      teachingSteps: [
        '30 = 3 tens. 6 = 6 ones.',
        '3 tens and 6 ones = 36.'
      ],
      correctAnswerExplanation: '30 + 6 = 36.'
    }
  }),

  _l22Q(87, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 60 + 9?',
    visual: null,
    answer: '69',
    choices: ['69', '96', '15', '609'],
    hint: '60 is 6 tens. 9 is 9 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit first',
      teachingSteps: [
        '60 = 6 tens. 9 = 9 ones.',
        '6 tens and 9 ones = 69.'
      ],
      correctAnswerExplanation: '60 + 9 = 69.'
    }
  }),

  _l22Q(88, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 70 + 2?',
    visual: null,
    answer: '72',
    choices: ['27', '72', '9', '702'],
    hint: '70 is 7 tens. 2 is 2 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens first in the number',
      teachingSteps: [
        '70 = 7 tens. 2 = 2 ones.',
        '7 tens and 2 ones = 72.'
      ],
      correctAnswerExplanation: '70 + 2 = 72.'
    }
  }),

  _l22Q(89, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 50 + 5?',
    visual: null,
    answer: '55',
    choices: ['55', '10', '505', '50'],
    hint: '50 is 5 tens. 5 is 5 ones.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Add the tens and ones values',
      teachingSteps: [
        '50 = 5 tens. 5 = 5 ones.',
        '5 tens and 5 ones = 55.'
      ],
      correctAnswerExplanation: '50 + 5 = 55.'
    }
  }),

  _l22Q(90, {
    subSkill: 'read_expanded_form',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: 'What number equals 80 + 4?',
    visual: null,
    answer: '84',
    choices: ['48', '84', '12', '804'],
    hint: '80 is 8 tens. 4 is 4 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens first in the number',
      teachingSteps: [
        '80 = 8 tens. 4 = 4 ones.',
        '8 tens and 4 ones = 84.'
      ],
      correctAnswerExplanation: '80 + 4 = 84.'
    }
  }),

  // q091–q100  tens_value  (text)

  _l22Q(91, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 45, what is the value of the tens digit?',
    visual: null,
    answer: '40',
    choices: ['4', '40', '45', '50'],
    hint: 'The tens digit is 4. What is 4 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Tens digit value = digit × 10',
      teachingSteps: [
        'The tens digit in 45 is 4.',
        'But its VALUE is 4 tens = 40, not just 4.',
        'Think: 4 rods × 10 each = 40.'
      ],
      correctAnswerExplanation: 'In 45, the 4 is in the tens place. Its value is 40.'
    }
  }),

  _l22Q(92, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 73, what is the value of the tens digit?',
    visual: null,
    answer: '70',
    choices: ['7', '70', '73', '30'],
    hint: 'The tens digit is 7. What is 7 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Seven tens = 70',
      teachingSteps: [
        'The tens digit in 73 is 7.',
        '7 tens = 70.',
        'The value of the tens digit is 70, not 7.'
      ],
      correctAnswerExplanation: 'In 73, the 7 is worth 70 (7 tens).'
    }
  }),

  _l22Q(93, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 28, what is the value of the tens digit?',
    visual: null,
    answer: '20',
    choices: ['2', '20', '28', '80'],
    hint: '2 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Two tens = 20',
      teachingSteps: [
        'The tens digit in 28 is 2.',
        '2 tens = 20.',
        'The value is 20, not 2.'
      ],
      correctAnswerExplanation: 'In 28, the 2 is worth 20 (2 tens).'
    }
  }),

  _l22Q(94, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 56, the tens digit is worth ___.',
    visual: null,
    answer: '50',
    choices: ['5', '50', '56', '60'],
    hint: '5 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Five tens = 50',
      teachingSteps: [
        'The tens digit in 56 is 5.',
        '5 tens = 50.',
        'The value is 50.'
      ],
      correctAnswerExplanation: 'In 56, the 5 is worth 50.'
    }
  }),

  _l22Q(95, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 91, the tens digit is worth ___.',
    visual: null,
    answer: '90',
    choices: ['9', '90', '91', '10'],
    hint: '9 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Nine tens = 90',
      teachingSteps: [
        'The tens digit in 91 is 9.',
        '9 tens = 90.',
        'The value is 90.'
      ],
      correctAnswerExplanation: 'In 91, the 9 is worth 90.'
    }
  }),

  _l22Q(96, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 62, the tens digit is worth ___.',
    visual: null,
    answer: '60',
    choices: ['6', '60', '62', '20'],
    hint: '6 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Six tens = 60',
      teachingSteps: [
        'The tens digit in 62 is 6.',
        '6 tens = 60.'
      ],
      correctAnswerExplanation: 'In 62, the 6 is worth 60.'
    }
  }),

  _l22Q(97, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 37, the tens digit is worth ___.',
    visual: null,
    answer: '30',
    choices: ['3', '30', '37', '70'],
    hint: '3 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Three tens = 30',
      teachingSteps: [
        'The tens digit in 37 is 3.',
        '3 tens = 30.'
      ],
      correctAnswerExplanation: 'In 37, the 3 is worth 30.'
    }
  }),

  _l22Q(98, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 84, the tens digit is worth ___.',
    visual: null,
    answer: '80',
    choices: ['8', '80', '84', '40'],
    hint: '8 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Eight tens = 80',
      teachingSteps: [
        'The tens digit in 84 is 8.',
        '8 tens = 80.'
      ],
      correctAnswerExplanation: 'In 84, the 8 is worth 80.'
    }
  }),

  _l22Q(99, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 15, the tens digit is worth ___.',
    visual: null,
    answer: '10',
    choices: ['1', '10', '15', '50'],
    hint: '1 ten = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'One ten = 10',
      teachingSteps: [
        'The tens digit in 15 is 1.',
        '1 ten = 10.'
      ],
      correctAnswerExplanation: 'In 15, the 1 is worth 10.'
    }
  }),

  _l22Q(100, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'medium',
    prompt: 'In the number 79, the tens digit is worth ___.',
    visual: null,
    answer: '70',
    choices: ['7', '70', '79', '90'],
    hint: '7 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Seven tens = 70',
      teachingSteps: [
        'The tens digit in 79 is 7.',
        '7 tens = 70.'
      ],
      correctAnswerExplanation: 'In 79, the 7 is worth 70.'
    }
  }),

  // q101–q110  ones_value  (text)

  _l22Q(101, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'What digit is in the ones place of 45?',
    visual: null,
    answer: '5',
    choices: ['4', '5', '40', '45'],
    hint: 'The ones digit is on the right.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones digit is on the right',
      teachingSteps: [
        'In 45, the digits are: 4 (tens) and 5 (ones).',
        'The ones digit is the digit on the right: 5.'
      ],
      correctAnswerExplanation: 'The ones digit of 45 is 5.'
    }
  }),

  _l22Q(102, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'What digit is in the ones place of 73?',
    visual: null,
    answer: '3',
    choices: ['3', '7', '30', '73'],
    hint: 'Look at the last digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Last digit = ones digit',
      teachingSteps: [
        '73: the 7 is in tens, the 3 is in ones.',
        'The ones digit is 3.'
      ],
      correctAnswerExplanation: 'The ones digit of 73 is 3.'
    }
  }),

  _l22Q(103, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'What digit is in the ones place of 28?',
    visual: null,
    answer: '8',
    choices: ['2', '8', '20', '28'],
    hint: 'The ones digit is on the right side.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones is the right-side digit',
      teachingSteps: [
        '28: 2 is tens, 8 is ones.',
        'The ones digit is 8.'
      ],
      correctAnswerExplanation: 'The ones digit of 28 is 8.'
    }
  }),

  _l22Q(104, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'What digit is in the ones place of 56?',
    visual: null,
    answer: '6',
    choices: ['5', '6', '50', '56'],
    hint: 'The second digit is the ones digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones digit is on the right',
      teachingSteps: [
        '56: 5 is tens, 6 is ones.',
        'The ones digit is 6.'
      ],
      correctAnswerExplanation: 'The ones digit of 56 is 6.'
    }
  }),

  _l22Q(105, {
    subSkill: 'ones_value',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: 'What digit is in the ones place of 90?',
    visual: null,
    answer: '0',
    choices: ['0', '9', '90', '10'],
    hint: '90 ends in 0.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero is a valid ones digit',
      teachingSteps: [
        '90: the 9 is in tens, the 0 is in ones.',
        'The ones digit is 0.'
      ],
      correctAnswerExplanation: 'The ones digit of 90 is 0.'
    }
  }),

  _l22Q(106, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many ones are in 67?',
    visual: null,
    answer: '7',
    choices: ['6', '7', '60', '67'],
    hint: 'Look at the ones place.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones is the last digit',
      teachingSteps: [
        '67: the 6 is tens, the 7 is ones.',
        '67 has 7 ones.'
      ],
      correctAnswerExplanation: '67 has 7 ones.'
    }
  }),

  _l22Q(107, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many ones are in 43?',
    visual: null,
    answer: '3',
    choices: ['3', '4', '40', '43'],
    hint: 'Look at the last digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones is on the right',
      teachingSteps: [
        '43: 4 tens and 3 ones.',
        '43 has 3 ones.'
      ],
      correctAnswerExplanation: '43 has 3 ones.'
    }
  }),

  _l22Q(108, {
    subSkill: 'ones_value',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: 'How many ones are in 80?',
    visual: null,
    answer: '0',
    choices: ['0', '8', '18', '80'],
    hint: '80 ends in 0.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones',
      teachingSteps: [
        '80: 8 tens and 0 ones.',
        '80 has 0 ones.'
      ],
      correctAnswerExplanation: '80 has 0 ones. The 0 is in the ones place.'
    }
  }),

  _l22Q(109, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many ones are in 15?',
    visual: null,
    answer: '5',
    choices: ['1', '5', '10', '15'],
    hint: 'Look at the second digit of 15.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'Teen numbers: ones on the right',
      teachingSteps: [
        '15: 1 ten and 5 ones.',
        '15 has 5 ones, not 1.'
      ],
      correctAnswerExplanation: '15 has 5 ones.'
    }
  }),

  _l22Q(110, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many ones are in 92?',
    visual: null,
    answer: '2',
    choices: ['2', '9', '90', '92'],
    hint: 'Look at the last digit.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Last digit = ones',
      teachingSteps: [
        '92: 9 tens and 2 ones.',
        '92 has 2 ones.'
      ],
      correctAnswerExplanation: '92 has 2 ones.'
    }
  }),

  // q111–q120  missing_part  (text)

  _l22Q(111, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '34 = ___ + 4. What goes in the blank?',
    visual: null,
    answer: '30',
    choices: ['3', '30', '34', '40'],
    hint: '34 has 3 tens. What is 3 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Use the tens value',
      teachingSteps: [
        '34 = tens + ones.',
        '34 has 3 tens. 3 tens = 30.',
        '34 = 30 + 4.'
      ],
      correctAnswerExplanation: '34 = 30 + 4. The tens part is 30.'
    }
  }),

  _l22Q(112, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '57 = 50 + ___. What goes in the blank?',
    visual: null,
    answer: '7',
    choices: ['5', '7', '57', '50'],
    hint: '57 has how many ones?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Find the ones part',
      teachingSteps: [
        '57 = 50 + ones.',
        '57 has 7 ones.',
        '57 = 50 + 7.'
      ],
      correctAnswerExplanation: '57 = 50 + 7. The ones part is 7.'
    }
  }),

  _l22Q(113, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '23 = ___ + 3. What goes in the blank?',
    visual: null,
    answer: '20',
    choices: ['2', '20', '23', '30'],
    hint: '2 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Tens value in the blank',
      teachingSteps: [
        '23 has 2 tens. 2 tens = 20.',
        '23 = 20 + 3.'
      ],
      correctAnswerExplanation: '23 = 20 + 3.'
    }
  }),

  _l22Q(114, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '68 = 60 + ___. What goes in the blank?',
    visual: null,
    answer: '8',
    choices: ['6', '8', '60', '68'],
    hint: '68 has how many ones?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Find the ones',
      teachingSteps: [
        '68 has 8 ones.',
        '68 = 60 + 8.'
      ],
      correctAnswerExplanation: '68 = 60 + 8.'
    }
  }),

  _l22Q(115, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '45 = ___ + 5. What goes in the blank?',
    visual: null,
    answer: '40',
    choices: ['4', '40', '45', '50'],
    hint: '4 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Four tens = 40',
      teachingSteps: [
        '45 has 4 tens. 4 tens = 40.',
        '45 = 40 + 5.'
      ],
      correctAnswerExplanation: '45 = 40 + 5.'
    }
  }),

  _l22Q(116, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '72 = 70 + ___. What goes in the blank?',
    visual: null,
    answer: '2',
    choices: ['2', '7', '70', '72'],
    hint: '72 has how many ones?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Find the ones part',
      teachingSteps: [
        '72 has 2 ones.',
        '72 = 70 + 2.'
      ],
      correctAnswerExplanation: '72 = 70 + 2.'
    }
  }),

  _l22Q(117, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '91 = ___ + 1. What goes in the blank?',
    visual: null,
    answer: '90',
    choices: ['9', '90', '91', '10'],
    hint: '9 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Nine tens = 90',
      teachingSteps: [
        '91 has 9 tens. 9 tens = 90.',
        '91 = 90 + 1.'
      ],
      correctAnswerExplanation: '91 = 90 + 1.'
    }
  }),

  _l22Q(118, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '36 = 30 + ___. What goes in the blank?',
    visual: null,
    answer: '6',
    choices: ['3', '6', '30', '36'],
    hint: '36 has how many ones?',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Ones part of 36',
      teachingSteps: [
        '36 has 6 ones.',
        '36 = 30 + 6.'
      ],
      correctAnswerExplanation: '36 = 30 + 6.'
    }
  }),

  _l22Q(119, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'medium',
    prompt: '54 = ___ + 4. What goes in the blank?',
    visual: null,
    answer: '50',
    choices: ['5', '50', '54', '40'],
    hint: '5 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Five tens = 50',
      teachingSteps: [
        '54 has 5 tens. 5 tens = 50.',
        '54 = 50 + 4.'
      ],
      correctAnswerExplanation: '54 = 50 + 4.'
    }
  }),

  _l22Q(120, {
    subSkill: 'missing_part',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: '80 = ___ + 0. What goes in the blank?',
    visual: null,
    answer: '80',
    choices: ['8', '18', '80', '800'],
    hint: '80 has 8 tens. What is that worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Eight tens = 80',
      teachingSteps: [
        '80 has 8 tens. 8 tens = 80.',
        '80 = 80 + 0.'
      ],
      correctAnswerExplanation: '80 = 80 + 0.'
    }
  }),

  // q121–q130  number_to_tens_ones  (visual)

  _l22Q(121, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 7 } },
    answer: '4 tens and 7 ones',
    choices: ['4 tens and 7 ones', '7 tens and 4 ones', '4 tens and 0 ones', '47 tens and 0 ones'],
    hint: 'Count the blue rods for tens, orange cubes for ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods = tens, cubes = ones',
      teachingSteps: [
        'Count the blue rods: 4. That is 4 tens.',
        'Count the orange cubes: 7. That is 7 ones.',
        '4 tens and 7 ones.'
      ],
      correctAnswerExplanation: '4 rods and 7 cubes = 4 tens and 7 ones.'
    }
  }),

  _l22Q(122, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 3 } },
    answer: '6 tens and 3 ones',
    choices: ['6 tens and 3 ones', '3 tens and 6 ones', '6 tens and 0 ones', '63 tens and 0 ones'],
    hint: 'Count rods first.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods = tens',
      teachingSteps: [
        '6 blue rods = 6 tens. 3 orange cubes = 3 ones.',
        '6 tens and 3 ones.'
      ],
      correctAnswerExplanation: '6 rods and 3 cubes = 6 tens and 3 ones.'
    }
  }),

  _l22Q(123, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 5 } },
    answer: '2 tens and 5 ones',
    choices: ['2 tens and 5 ones', '5 tens and 2 ones', '2 tens and 0 ones', '25 tens and 0 ones'],
    hint: 'Count the rods and cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods for tens, cubes for ones',
      teachingSteps: [
        '2 rods = 2 tens. 5 cubes = 5 ones.',
        '2 tens and 5 ones.'
      ],
      correctAnswerExplanation: '2 rods and 5 cubes = 2 tens and 5 ones.'
    }
  }),

  _l22Q(124, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 9, ones: 0 } },
    answer: '9 tens and 0 ones',
    choices: ['9 tens and 0 ones', '0 tens and 9 ones', '9 tens and 9 ones', '90 tens and 0 ones'],
    hint: 'No cubes means 0 ones.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'No cubes = 0 ones',
      teachingSteps: [
        '9 rods = 9 tens. No cubes = 0 ones.',
        '9 tens and 0 ones.'
      ],
      correctAnswerExplanation: '9 rods and 0 cubes = 9 tens and 0 ones.'
    }
  }),

  _l22Q(125, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 8 } },
    answer: '3 tens and 8 ones',
    choices: ['3 tens and 8 ones', '8 tens and 3 ones', '3 tens and 0 ones', '38 tens and 0 ones'],
    hint: 'Count rods for tens, cubes for ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Count rods first',
      teachingSteps: [
        '3 rods = 3 tens. 8 cubes = 8 ones.',
        '3 tens and 8 ones.'
      ],
      correctAnswerExplanation: '3 rods and 8 cubes = 3 tens and 8 ones.'
    }
  }),

  _l22Q(126, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 4 } },
    answer: '7 tens and 4 ones',
    choices: ['7 tens and 4 ones', '4 tens and 7 ones', '7 tens and 0 ones', '74 tens and 0 ones'],
    hint: 'Count the blue rods.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods = tens',
      teachingSteps: [
        '7 rods = 7 tens. 4 cubes = 4 ones.',
        '7 tens and 4 ones.'
      ],
      correctAnswerExplanation: '7 rods and 4 cubes = 7 tens and 4 ones.'
    }
  }),

  _l22Q(127, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 6 } },
    answer: '5 tens and 6 ones',
    choices: ['5 tens and 6 ones', '6 tens and 5 ones', '5 tens and 0 ones', '56 tens and 0 ones'],
    hint: 'Count rods for tens, cubes for ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods and cubes',
      teachingSteps: [
        '5 rods = 5 tens. 6 cubes = 6 ones.',
        '5 tens and 6 ones.'
      ],
      correctAnswerExplanation: '5 rods and 6 cubes = 5 tens and 6 ones.'
    }
  }),

  _l22Q(128, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 9 } },
    answer: '1 ten and 9 ones',
    choices: ['1 ten and 9 ones', '9 tens and 1 one', '1 ten and 0 ones', '19 tens and 0 ones'],
    hint: 'Count the 1 rod and 9 cubes.',
    intervention: {
      errorTag: 'err_teens_reversal',
      title: 'One rod = 1 ten',
      teachingSteps: [
        '1 rod = 1 ten. 9 cubes = 9 ones.',
        '1 ten and 9 ones.'
      ],
      correctAnswerExplanation: '1 rod and 9 cubes = 1 ten and 9 ones.'
    }
  }),

  _l22Q(129, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 2 } },
    answer: '8 tens and 2 ones',
    choices: ['8 tens and 2 ones', '2 tens and 8 ones', '8 tens and 0 ones', '82 tens and 0 ones'],
    hint: 'Count the rods first.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods are tens',
      teachingSteps: [
        '8 rods = 8 tens. 2 cubes = 2 ones.',
        '8 tens and 2 ones.'
      ],
      correctAnswerExplanation: '8 rods and 2 cubes = 8 tens and 2 ones.'
    }
  }),

  _l22Q(130, {
    subSkill: 'number_to_tens_ones',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'medium',
    prompt: 'How many tens and ones does this number have?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 5 } },
    answer: '6 tens and 5 ones',
    choices: ['6 tens and 5 ones', '5 tens and 6 ones', '6 tens and 0 ones', '65 tens and 0 ones'],
    hint: '6 rods and 5 cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Rods and cubes',
      teachingSteps: [
        '6 rods = 6 tens. 5 cubes = 5 ones.',
        '6 tens and 5 ones.'
      ],
      correctAnswerExplanation: '6 rods and 5 cubes = 6 tens and 5 ones.'
    }
  }),

  // ─── HARD (q131–q170) ──────────────────────────────────────────────────────
  // q131–q145  compare_representations  (visual)

  _l22Q(131, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which expanded form is correct?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 3 } },
    answer: '60 + 3',
    choices: ['6 + 3', '60 + 3', '63 + 0', '30 + 6'],
    hint: '6 rods = 60. 3 cubes = 3.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Each rod is worth 10',
      teachingSteps: [
        '6 blue rods = 6 tens = 60.',
        '3 orange cubes = 3 ones = 3.',
        'Expanded form: 60 + 3.',
        '6 + 3 is wrong — that uses the digit 6, not the value 60.'
      ],
      correctAnswerExplanation: '6 rods and 3 cubes → 60 + 3.'
    }
  }),

  _l22Q(132, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which expanded form is correct?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 7 } },
    answer: '40 + 7',
    choices: ['4 + 7', '40 + 7', '47 + 0', '70 + 4'],
    hint: '4 rods = 40. 7 cubes = 7.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Rods are worth 10 each',
      teachingSteps: [
        '4 rods = 40. 7 cubes = 7.',
        'Expanded form: 40 + 7.',
        '4 + 7 uses the digit 4 instead of the value 40.'
      ],
      correctAnswerExplanation: '4 rods and 7 cubes → 40 + 7.'
    }
  }),

  _l22Q(133, {
    subSkill: 'compare_representations',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which expanded form is correct?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 0 } },
    answer: '80 + 0',
    choices: ['8 + 0', '80 + 0', '8 + 8', '0 + 80'],
    hint: '8 rods = 80. No cubes = 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Eight rods = 80',
      teachingSteps: [
        '8 rods = 80 (not 8).',
        'No cubes = 0.',
        '80 + 0.'
      ],
      correctAnswerExplanation: '8 rods and 0 cubes → 80 + 0.'
    }
  }),

  _l22Q(134, {
    subSkill: 'compare_representations',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. What is the value of the tens part?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 9 } },
    answer: '50',
    choices: ['5', '50', '9', '59'],
    hint: '5 rods = how much?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Five rods = 50',
      teachingSteps: [
        '5 blue rods = 5 tens = 50.',
        'The tens part is worth 50, not 5.'
      ],
      correctAnswerExplanation: '5 rods = 50. The tens part is worth 50.'
    }
  }),

  _l22Q(135, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which statement about these blocks is TRUE?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 2 } },
    answer: '70 + 2 = 72',
    choices: ['7 + 2 = 9', '70 + 2 = 72', '72 = 7 tens + 2 tens', '72 = 2 + 70 tens'],
    hint: '7 rods = 70. 2 cubes = 2.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The rods are worth 10 each',
      teachingSteps: [
        '7 rods = 70. 2 cubes = 2.',
        '70 + 2 = 72.',
        'Writing 7 + 2 = 9 ignores place value.'
      ],
      correctAnswerExplanation: '7 rods and 2 cubes → 70 + 2 = 72.'
    }
  }),

  _l22Q(136, {
    subSkill: 'compare_representations',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. The tens part is worth ___.',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 6 } },
    answer: '20',
    choices: ['2', '6', '20', '26'],
    hint: '2 rods = how much?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Two rods = 20',
      teachingSteps: [
        '2 blue rods = 2 tens = 20.',
        'The tens part is worth 20, not 2.'
      ],
      correctAnswerExplanation: '2 rods = 20. The tens part is worth 20.'
    }
  }),

  _l22Q(137, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. 90 + ___ equals the number shown.',
    visual: { type: 'base10', config: { hundreds: 0, tens: 9, ones: 4 } },
    answer: '4',
    choices: ['0', '4', '9', '94'],
    hint: 'The number shown is 94. 94 = 90 + ?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Find the ones part',
      teachingSteps: [
        '9 rods = 90. 4 cubes = 4.',
        '94 = 90 + 4.',
        'The missing part is 4.'
      ],
      correctAnswerExplanation: '9 rods and 4 cubes → 90 + 4 = 94.'
    }
  }),

  _l22Q(138, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which statement is TRUE?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 8 } },
    answer: '18 = 10 + 8',
    choices: ['18 = 1 + 8', '18 = 10 + 8', '18 = 80 + 1', '18 = 10 + 10'],
    hint: '1 rod = 10. 8 cubes = 8.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'One rod = 10, not 1',
      teachingSteps: [
        '1 rod = 10. 8 cubes = 8.',
        '18 = 10 + 8.',
        '1 + 8 is wrong — the rod is worth 10, not 1.'
      ],
      correctAnswerExplanation: '1 rod = 10. 8 cubes = 8. So 18 = 10 + 8.'
    }
  }),

  _l22Q(139, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which expanded form matches?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 5 } },
    answer: '50 + 5',
    choices: ['5 + 5', '50 + 5', '55 + 0', '5 + 50'],
    hint: '5 rods = 50. 5 cubes = 5.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Rods are worth 10 each',
      teachingSteps: [
        '5 rods = 50. 5 cubes = 5.',
        '50 + 5.',
        '5 + 5 uses digit 5 not value 50.'
      ],
      correctAnswerExplanation: '5 rods and 5 cubes → 50 + 5.'
    }
  }),

  _l22Q(140, {
    subSkill: 'compare_representations',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. The tens part is worth ___.',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 2 } },
    answer: '40',
    choices: ['4', '2', '40', '42'],
    hint: '4 rods = how much?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Four rods = 40',
      teachingSteps: [
        '4 rods = 4 tens = 40.',
        'The tens part is worth 40, not 4.'
      ],
      correctAnswerExplanation: '4 rods = 40.'
    }
  }),

  _l22Q(141, {
    subSkill: 'compare_representations',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which is a correct expanded form?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 0 } },
    answer: '60 + 0',
    choices: ['6 + 0', '60 + 0', '0 + 6', '6 + 60'],
    hint: '6 rods = 60. No cubes = 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Six rods = 60',
      teachingSteps: [
        '6 rods = 60.',
        'No cubes = 0.',
        '60 + 0.'
      ],
      correctAnswerExplanation: '6 rods = 60. 0 cubes = 0. So 60 + 0.'
    }
  }),

  _l22Q(142, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. ___ + ___ equals the number. Which fills in both blanks correctly?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 8 } },
    answer: '30 + 8',
    choices: ['3 + 8', '30 + 8', '38 + 0', '8 + 30'],
    hint: '3 rods = 30. 8 cubes = 8.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Three rods = 30',
      teachingSteps: [
        '3 rods = 30. 8 cubes = 8.',
        '30 + 8 = 38.',
        '3 + 8 uses digit 3, not value 30.'
      ],
      correctAnswerExplanation: '3 rods and 8 cubes → 30 + 8.'
    }
  }),

  _l22Q(143, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which equation about these blocks is TRUE?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 5 } },
    answer: '75 = 70 + 5',
    choices: ['75 = 7 + 5', '75 = 70 + 5', '75 = 7 + 50', '75 = 70 + 50'],
    hint: '7 rods = 70. 5 cubes = 5.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Rods = 10 each',
      teachingSteps: [
        '7 rods = 70. 5 cubes = 5.',
        '75 = 70 + 5.',
        '7 + 5 = 12, which is wrong — ignores place value.'
      ],
      correctAnswerExplanation: '7 rods and 5 cubes → 75 = 70 + 5.'
    }
  }),

  _l22Q(144, {
    subSkill: 'compare_representations',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. The ones part is worth ___.',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 3 } },
    answer: '3',
    choices: ['8', '3', '80', '83'],
    hint: 'Count the orange cubes.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Cubes = ones',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Count the cubes: 3.',
        'The ones part is worth 3.'
      ],
      correctAnswerExplanation: '3 orange cubes = ones worth 3.'
    }
  }),

  _l22Q(145, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Look at the blocks. Which pair of equations are BOTH true?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 6 } },
    answer: '46 = 40 + 6 and 4 tens + 6 ones',
    choices: ['46 = 4 + 6 and 4 tens', '46 = 40 + 6 and 4 tens + 6 ones', '46 = 40 + 60 and 4 tens', '46 = 4 + 6 and 46 tens'],
    hint: '4 rods = 40. 6 cubes = 6.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Both representations must be correct',
      teachingSteps: [
        '4 rods = 4 tens = 40. 6 cubes = 6 ones = 6.',
        '46 = 40 + 6.',
        '46 has 4 tens and 6 ones.'
      ],
      correctAnswerExplanation: '46 = 40 + 6 and 46 has 4 tens and 6 ones.'
    }
  }),

  // q146–q160  compare_representations  (text)

  _l22Q(146, {
    subSkill: 'compare_representations',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'hard',
    prompt: 'In 34, the tens digit is worth how much?',
    visual: null,
    answer: '30',
    choices: ['3', '4', '30', '34'],
    hint: 'The tens digit is 3. What is 3 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Tens digit value = digit × 10',
      teachingSteps: [
        'The tens digit in 34 is 3.',
        '3 is in the tens place, so it is worth 3 tens = 30.',
        'The value is 30, not just 3.'
      ],
      correctAnswerExplanation: 'In 34, the 3 is worth 30 (3 tens).'
    }
  }),

  _l22Q(147, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Emma writes "56 = 5 + 6." What mistake did she make?',
    visual: null,
    answer: 'She used the digit 5, not its value 50',
    choices: [
      'She used the digit 5, not its value 50',
      'She forgot to carry',
      'She wrote the digits in the wrong order',
      'She added an extra zero'
    ],
    hint: 'What is the 5 in 56 really worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Digit vs. value in expanded form',
      teachingSteps: [
        'In 56, the 5 is in the tens place.',
        '5 tens = 50, not just 5.',
        'Correct expanded form: 56 = 50 + 6, not 5 + 6.'
      ],
      correctAnswerExplanation: 'Emma used the digit 5 instead of its value 50. 56 = 50 + 6.'
    }
  }),

  _l22Q(148, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Which number has the same value as 40 + 7?',
    visual: null,
    answer: '47',
    choices: ['47', '74', '11', '407'],
    hint: '40 is the tens part. 7 is the ones part.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens first in the number',
      teachingSteps: [
        '40 = 4 tens. 7 = 7 ones.',
        '4 tens and 7 ones = 47.',
        'Not 74 — that would be 70 + 4.'
      ],
      correctAnswerExplanation: '40 + 7 = 47.'
    }
  }),

  _l22Q(149, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'In the number 68, the 6 is in the tens place. What is its value?',
    visual: null,
    answer: '60',
    choices: ['6', '60', '68', '600'],
    hint: '6 in the tens place means 6 tens.',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Tens digit value vs. tens digit',
      teachingSteps: [
        'The digit 6 is in the tens place of 68.',
        '6 tens = 60.',
        'Its value is 60, not 6.'
      ],
      correctAnswerExplanation: 'In 68, the 6 is worth 60 (6 tens).'
    }
  }),

  _l22Q(150, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: '7 tens and 3 ones. Which expanded form matches?',
    visual: null,
    answer: '70 + 3',
    choices: ['7 + 3', '70 + 3', '30 + 7', '73 + 0'],
    hint: '7 tens = 70. 3 ones = 3.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Seven tens = 70',
      teachingSteps: [
        '7 tens = 70. 3 ones = 3.',
        'Expanded form: 70 + 3.'
      ],
      correctAnswerExplanation: '7 tens and 3 ones → 70 + 3.'
    }
  }),

  _l22Q(151, {
    subSkill: 'compare_representations',
    keyIdea: 'When there are no ones, the ones digit is 0.',
    difficulty: 'hard',
    prompt: 'The number 50 = 50 + ___. What goes in the blank?',
    visual: null,
    answer: '0',
    choices: ['0', '5', '50', '10'],
    hint: '50 has 5 tens and how many ones?',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Zero ones completes the expanded form',
      teachingSteps: [
        '50 has 5 tens and 0 ones.',
        '50 = 50 + 0.',
        'The blank is 0.'
      ],
      correctAnswerExplanation: '50 = 50 + 0.'
    }
  }),

  _l22Q(152, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: '9 tens and 0 ones = ___',
    visual: null,
    answer: '90',
    choices: ['9', '19', '90', '900'],
    hint: '9 tens = 90. 0 ones = 0.',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Nine tens = 90',
      teachingSteps: [
        '9 tens = 90.',
        '0 ones = 0.',
        '9 tens + 0 ones = 90.'
      ],
      correctAnswerExplanation: '9 tens and 0 ones = 90.'
    }
  }),

  _l22Q(153, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: '___ + 8 = 78. What goes in the blank?',
    visual: null,
    answer: '70',
    choices: ['7', '70', '8', '78'],
    hint: '78 has 7 tens. What is 7 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Seven tens = 70',
      teachingSteps: [
        '78 = tens + 8.',
        '78 has 7 tens = 70.',
        '70 + 8 = 78.'
      ],
      correctAnswerExplanation: '70 + 8 = 78.'
    }
  }),

  _l22Q(154, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: '6 tens and 4 ones = ___ + 4. What goes in the blank?',
    visual: null,
    answer: '60',
    choices: ['6', '60', '40', '64'],
    hint: '6 tens = ?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Six tens = 60',
      teachingSteps: [
        '6 tens = 60.',
        '6 tens and 4 ones = 60 + 4.',
        'The blank is 60.'
      ],
      correctAnswerExplanation: '6 tens = 60. So 64 = 60 + 4.'
    }
  }),

  _l22Q(155, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Which two mean the same thing?',
    visual: null,
    answer: '"3 tens 5 ones" and "35"',
    choices: ['"3 + 5" and "35"', '"3 tens 5 ones" and "35"', '"35" and "53"', '"30" and "3 tens"'],
    hint: '3 tens and 5 ones = what number?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Multiple representations of the same number',
      teachingSteps: [
        '3 tens and 5 ones = 35.',
        'So "3 tens 5 ones" and "35" mean the same thing.',
        '"3 + 5" = 8, not 35 — that uses digits, not values.'
      ],
      correctAnswerExplanation: '3 tens 5 ones = 35. Both represent the same number.'
    }
  }),

  _l22Q(156, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'The number 47 = 40 + 7. So 40 is the value of which digit?',
    visual: null,
    answer: 'The tens digit',
    choices: ['The ones digit', 'The tens digit', 'The whole number', 'There is no digit worth 40'],
    hint: 'Which place is worth 40?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Tens place holds the 40',
      teachingSteps: [
        'In 47, the digit 4 is in the tens place.',
        '4 tens = 40.',
        'So 40 is the value of the tens digit.'
      ],
      correctAnswerExplanation: 'The tens digit (4) is worth 40.'
    }
  }),

  _l22Q(157, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'What is 50 + 7?',
    visual: null,
    answer: '57',
    choices: ['12', '57', '507', '75'],
    hint: '50 is 5 tens. 7 is 7 ones.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Add tens and ones',
      teachingSteps: [
        '50 is 5 tens. 7 is 7 ones.',
        '5 tens and 7 ones = 57.'
      ],
      correctAnswerExplanation: '50 + 7 = 57.'
    }
  }),

  _l22Q(158, {
    subSkill: 'compare_representations',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'hard',
    prompt: 'Jake has 3 tens rods and 9 ones cubes. What number does he have?',
    visual: null,
    answer: '39',
    choices: ['39', '93', '30', '9'],
    hint: 'The tens rods come first in the number.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit goes first',
      teachingSteps: [
        '3 tens rods → the tens digit is 3.',
        '9 ones cubes → the ones digit is 9.',
        'Write tens first: 3 then 9 = 39.',
        '93 would be 9 tens and 3 ones — Jake has 3 tens and 9 ones.'
      ],
      correctAnswerExplanation: '3 tens and 9 ones = 39.'
    }
  }),

  _l22Q(159, {
    subSkill: 'compare_representations',
    keyIdea: 'Expanded form shows a number as tens + ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'Which number has 8 tens and 0 ones?',
    visual: null,
    answer: '80',
    choices: ['8', '18', '80', '800'],
    hint: '8 tens = 80. 0 ones = 0.',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Eight tens and zero ones = 80',
      teachingSteps: [
        '8 tens = 80.',
        '0 ones = 0.',
        '8 tens + 0 ones = 80, not just 8.'
      ],
      correctAnswerExplanation: '8 tens and 0 ones = 80.'
    }
  }),

  _l22Q(160, {
    subSkill: 'compare_representations',
    keyIdea: 'The tens digit tells how many groups of 10, and the ones digit tells how many leftover ones.',
    difficulty: 'hard',
    prompt: 'Sam counts 4 tens rods and 6 ones cubes. Then he writes "64". Is he right?',
    visual: null,
    answer: 'No — the answer is 46',
    choices: ['Yes', 'No — the answer is 46', 'No — the answer is 40', 'No — the answer is 10'],
    hint: 'The tens digit goes first.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens digit comes first',
      teachingSteps: [
        '4 tens rods → tens digit is 4.',
        '6 ones cubes → ones digit is 6.',
        'Tens first: 46, not 64.',
        '64 would be 6 tens and 4 ones.'
      ],
      correctAnswerExplanation: '4 tens and 6 ones = 46. Sam swapped the digits.'
    }
  }),

  // q161–q170  place_value_to_120  (text)

  _l22Q(161, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '1 hundred, 1 ten, and 3 ones = ___',
    visual: null,
    answer: '113',
    choices: ['113', '131', '103', '1013'],
    hint: '100 + 10 + 3 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Hundreds, tens, and ones',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '3 ones = 3.',
        '100 + 10 + 3 = 113.'
      ],
      correctAnswerExplanation: '1 hundred + 1 ten + 3 ones = 100 + 10 + 3 = 113.'
    }
  }),

  _l22Q(162, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '100 + 20 + 0 = ___',
    visual: null,
    answer: '120',
    choices: ['12', '102', '120', '1020'],
    hint: '100 + 20 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Add hundreds, tens, and ones',
      teachingSteps: [
        '100 is 1 hundred.',
        '20 is 2 tens.',
        '0 is 0 ones.',
        '100 + 20 + 0 = 120.'
      ],
      correctAnswerExplanation: '100 + 20 + 0 = 120.'
    }
  }),

  _l22Q(163, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'What is the expanded form of 105?',
    visual: null,
    answer: '100 + 5',
    choices: ['10 + 5', '100 + 5', '1 + 0 + 5', '105 + 0'],
    hint: '105 = 1 hundred + 0 tens + 5 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '105 has a hundred and some ones',
      teachingSteps: [
        '105: the 1 is in the hundreds place = 100.',
        'The 0 is in the tens place = 0.',
        'The 5 is in the ones place = 5.',
        '105 = 100 + 0 + 5 = 100 + 5.'
      ],
      correctAnswerExplanation: '105 = 100 + 5.'
    }
  }),

  _l22Q(164, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '100 + 10 + 7 = ___',
    visual: null,
    answer: '117',
    choices: ['107', '117', '127', '1017'],
    hint: '100 + 10 = 110. 110 + 7 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Add all three parts',
      teachingSteps: [
        '100 + 10 = 110.',
        '110 + 7 = 117.'
      ],
      correctAnswerExplanation: '100 + 10 + 7 = 117.'
    }
  }),

  _l22Q(165, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'Which number has 1 hundred, 1 ten, and 0 ones?',
    visual: null,
    answer: '110',
    choices: ['11', '101', '110', '1010'],
    hint: '100 + 10 + 0 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Hundred + ten + zero ones',
      teachingSteps: [
        '1 hundred = 100. 1 ten = 10. 0 ones = 0.',
        '100 + 10 + 0 = 110.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 0 ones = 110.'
    }
  }),

  _l22Q(166, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '119 = 100 + 10 + ___',
    visual: null,
    answer: '9',
    choices: ['1', '9', '19', '90'],
    hint: '119 − 110 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Find the ones part',
      teachingSteps: [
        '119 = 100 + 10 + ones.',
        '100 + 10 = 110.',
        '119 − 110 = 9.',
        'The ones part is 9.'
      ],
      correctAnswerExplanation: '119 = 100 + 10 + 9.'
    }
  }),

  _l22Q(167, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '1 hundred and 2 tens is the same as ___',
    visual: null,
    answer: '120',
    choices: ['12', '102', '120', '210'],
    hint: '100 + 20 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'One hundred and two tens',
      teachingSteps: [
        '1 hundred = 100.',
        '2 tens = 20.',
        '100 + 20 = 120.'
      ],
      correctAnswerExplanation: '1 hundred and 2 tens = 120.'
    }
  }),

  _l22Q(168, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'Which is greater: 9 tens and 9 ones, or 1 hundred?',
    visual: null,
    answer: '1 hundred (100)',
    choices: ['9 tens and 9 ones (99)', '1 hundred (100)', 'They are equal', 'Cannot tell'],
    hint: '9 tens and 9 ones = 99. 1 hundred = 100.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Compare 99 and 100',
      teachingSteps: [
        '9 tens and 9 ones = 99.',
        '1 hundred = 100.',
        '100 > 99, so 1 hundred is greater.'
      ],
      correctAnswerExplanation: '99 < 100, so 1 hundred is greater.'
    }
  }),

  _l22Q(169, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '100 is the same as ___ tens',
    visual: null,
    answer: '10',
    choices: ['1', '10', '100', '0'],
    hint: '10 groups of 10 make 100.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'One hundred = ten tens',
      teachingSteps: [
        'Each ten is worth 10.',
        '10 tens = 100.',
        'So 100 = 10 tens.'
      ],
      correctAnswerExplanation: '100 = 10 tens.'
    }
  }),

  _l22Q(170, {
    subSkill: 'place_value_to_120',
    keyIdea: 'Numbers to 120 can have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '100 + 10 + 2 is the expanded form of ___',
    visual: null,
    answer: '112',
    choices: ['12', '102', '112', '1012'],
    hint: '100 + 10 = 110. 110 + 2 = ?',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: 'Three-part expanded form',
      teachingSteps: [
        '100 + 10 = 110.',
        '110 + 2 = 112.'
      ],
      correctAnswerExplanation: '100 + 10 + 2 = 112.'
    }
  })

];

// ════════════════════════════════════════════════════════════════════════════
//  Unit 2 Spec
// ════════════════════════════════════════════════════════════════════════════

export const G1_U2_SPEC = {
  unitId: 'g1u2',
  title: 'Place Value',
  teks: ['1.2A', '1.2B', '1.2C'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 32,
    perLessonCount: 8,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 2.1 — Groups of Ten
    //  TEKS 1.2B · compose_groups_of_ten
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l1',
      title: 'Groups of Ten',
      teks: ['1.2B'],
      skill: 'compose_groups_of_ten',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Each tens rod stands for 10. Count the rods to find the tens digit.',
        'Each ones cube stands for 1. Count the cubes to find the ones digit.',
        '10 ones is the same as 1 ten.',
        'The tens digit comes first when you write a two-digit number.',
        'If there are no ones cubes, the ones digit is 0.'
      ],
      workedExamples: _l21Examples,
      quizBank: _l21QuizBank
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 2.2 — Tens and Ones
    //  TEKS 1.2B · tens_and_ones
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l2',
      title: 'Tens and Ones',
      teks: ['1.2B'],
      skill: 'tens_and_ones',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'The tens digit tells how many groups of 10. The ones digit tells how many leftover ones.',
        'The value of the tens digit is the digit times 10 (e.g., the 3 in 34 is worth 30).',
        'Expanded form breaks a number into its tens and ones: 34 = 30 + 4.',
        'When there are no ones, the ones digit is 0 (e.g., 50 = 50 + 0).'
      ],
      workedExamples: _l22Examples,
      quizBank: _l22QuizBank
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 2.3 — Numbers to 120
    //  TEKS 1.2B · place_value_to_120  ← stub
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l3',
      title: 'Numbers to 120',
      teks: ['1.2B'],
      skill: 'place_value_to_120',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Numbers past 100 have a hundreds place, a tens place, and an ones place.',
        '115 = 1 hundred, 1 ten, and 5 ones.',
        'The pattern of tens and ones keeps going past 100.',
        'We can use blocks to show numbers all the way to 120.'
      ],
      workedExamples: [],
      quizBank: []
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 2.4 — Represent Numbers
    //  TEKS 1.2C · represent_numbers_to_120  ← stub
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l4',
      title: 'Represent Numbers',
      teks: ['1.2C'],
      skill: 'represent_numbers_to_120',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Numbers can be written in standard form: 47.',
        'Numbers can be written in expanded form: 40 + 7.',
        'Numbers can be written in word form: forty-seven.',
        'All three forms show the same amount in different ways.'
      ],
      workedExamples: [],
      quizBank: []
    }

  ]
};

export default G1_U2_SPEC;
