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

  // q161–q170  hard in-scope replacements (two-digit, expanded form / tens-ones)

  _l22Q(161, {
    subSkill: 'missing_part',
    keyIdea: 'Expanded form breaks a number into its tens and ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: '86 = ___ + 6',
    visual: null,
    answer: '80',
    choices: ['8', '60', '80', '86'],
    hint: '86 has 8 tens. What is 8 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Tens part = tens digit × 10',
      teachingSteps: [
        '86 = tens part + ones part.',
        'The ones part is 6.',
        'The tens part: 86 − 6 = 80.',
        '8 tens = 80, not just 8.'
      ],
      correctAnswerExplanation: '86 = 80 + 6. The tens part is 80.'
    }
  }),

  _l22Q(162, {
    subSkill: 'missing_part',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'hard',
    prompt: '53 = 50 + ___',
    visual: null,
    answer: '3',
    choices: ['5', '3', '53', '50'],
    hint: '53 has 5 tens and how many ones?',
    intervention: {
      errorTag: 'err_ones_missing',
      title: 'Find the ones part',
      teachingSteps: [
        '53 = 50 + ones.',
        '53 − 50 = 3.',
        'The ones part is 3.'
      ],
      correctAnswerExplanation: '53 = 50 + 3. The ones digit is 3.'
    }
  }),

  _l22Q(163, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form breaks a number into its tens and ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'What is 74 in expanded form?',
    visual: null,
    answer: '70 + 4',
    choices: ['7 + 4', '70 + 4', '40 + 7', '70 + 0'],
    hint: '74 has 7 tens. What is 7 tens worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens digit vs. tens value',
      teachingSteps: [
        'The 7 in 74 is in the tens place.',
        '7 tens = 70, not 7.',
        'The 4 is in the ones place = 4.',
        '74 = 70 + 4.'
      ],
      correctAnswerExplanation: '74 = 70 + 4. The 7 is worth 70, not 7.'
    }
  }),

  _l22Q(164, {
    subSkill: 'read_expanded_form',
    keyIdea: 'The tens digit comes first when you write a two-digit number.',
    difficulty: 'hard',
    prompt: '60 + 8 = ___',
    visual: null,
    answer: '68',
    choices: ['86', '68', '14', '60'],
    hint: '60 is the tens part. 8 is the ones part.',
    intervention: {
      errorTag: 'err_tens_ones_swap',
      title: 'Tens first, then ones',
      teachingSteps: [
        '60 = 6 tens. 8 = 8 ones.',
        '6 tens and 8 ones → write 6 first, then 8.',
        '60 + 8 = 68.',
        '86 would be 80 + 6 — the tens and ones are swapped.'
      ],
      correctAnswerExplanation: '60 + 8 = 68. The tens digit comes first.'
    }
  }),

  _l22Q(165, {
    subSkill: 'tens_value',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'hard',
    prompt: 'In 92, the 9 means ___',
    visual: null,
    answer: '90',
    choices: ['9', '2', '20', '90'],
    hint: '9 is in the tens place. What is 9 tens worth?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'The 9 is in the tens place',
      teachingSteps: [
        'In 92, the 9 is in the tens place.',
        '9 tens = 90.',
        'The 9 means 90, not 9.'
      ],
      correctAnswerExplanation: 'In 92, the 9 is worth 90 (9 tens).'
    }
  }),

  _l22Q(166, {
    subSkill: 'ones_value',
    keyIdea: 'The ones digit tells how many leftover ones.',
    difficulty: 'hard',
    prompt: 'In 92, the 2 means ___',
    visual: null,
    answer: '2',
    choices: ['20', '90', '9', '2'],
    hint: '2 is in the ones place.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The 2 is in the ones place',
      teachingSteps: [
        'In 92, the 2 is in the ones place.',
        'The ones place tells how many single ones.',
        'The 2 means 2 ones = 2.'
      ],
      correctAnswerExplanation: 'In 92, the 2 is worth 2 (2 ones).'
    }
  }),

  _l22Q(167, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form breaks a number into its tens and ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'A student says 53 = 5 + 3. What should it be?',
    visual: null,
    answer: '50 + 3',
    choices: ['5 + 3', '50 + 3', '53 + 0', '30 + 5'],
    hint: 'What is the 5 in 53 really worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The digit 5 is worth 50 here',
      teachingSteps: [
        'In 53, the 5 is in the tens place.',
        '5 tens = 50, not just 5.',
        'The 3 is in the ones place = 3.',
        'Correct expanded form: 50 + 3.'
      ],
      correctAnswerExplanation: '53 = 50 + 3. The student wrote the digit 5 instead of its value 50.'
    }
  }),

  _l22Q(168, {
    subSkill: 'missing_part',
    keyIdea: 'The value of the tens digit is the digit times 10.',
    difficulty: 'hard',
    prompt: '47 = ___ + 7',
    visual: null,
    answer: '40',
    choices: ['4', '70', '47', '40'],
    hint: 'What is the tens part of 47?',
    intervention: {
      errorTag: 'err_tens_digit_not_value',
      title: 'Four tens = 40',
      teachingSteps: [
        '47 = tens part + 7.',
        'The tens digit is 4.',
        '4 tens = 40, not 4.',
        '47 = 40 + 7.'
      ],
      correctAnswerExplanation: '47 = 40 + 7. The tens part is 40.'
    }
  }),

  _l22Q(169, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form breaks a number into its tens and ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'What is 29 in expanded form?',
    visual: null,
    answer: '20 + 9',
    choices: ['2 + 9', '90 + 2', '20 + 9', '20 + 0'],
    hint: '29 has 2 tens. What is 2 tens worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Two tens = 20',
      teachingSteps: [
        'The 2 in 29 is in the tens place.',
        '2 tens = 20.',
        'The 9 is in the ones place = 9.',
        '29 = 20 + 9.'
      ],
      correctAnswerExplanation: '29 = 20 + 9. The 2 is worth 20, not 2.'
    }
  }),

  _l22Q(170, {
    subSkill: 'write_expanded_form',
    keyIdea: 'Expanded form breaks a number into its tens and ones: 34 = 30 + 4.',
    difficulty: 'hard',
    prompt: 'A student says 61 = 6 + 1. What is the correct expanded form?',
    visual: null,
    answer: '60 + 1',
    choices: ['6 + 1', '60 + 1', '10 + 6', '61 + 0'],
    hint: 'What is the 6 in 61 really worth?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The digit 6 is worth 60 here',
      teachingSteps: [
        'In 61, the 6 is in the tens place.',
        '6 tens = 60, not just 6.',
        'The 1 is in the ones place = 1.',
        'Correct expanded form: 60 + 1.'
      ],
      correctAnswerExplanation: '61 = 60 + 1. The student wrote the digit 6 instead of its value 60.'
    }
  })

];

// ── L2.3 factory ──────────────────────────────────────────────────────────────
function _l23Q(n, o) {
  return {
    id: 'g1-u2-l3-q-' + String(n).padStart(3, '0'),
    teks: ['1.2B'],
    lessonId: 'g1-u2-l3',
    skill: 'place_value_to_120',
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

// ── L2.3 worked examples ──────────────────────────────────────────────────────
const _l23Examples = [
  {
    title: '100 = 1 Hundred',
    steps: [
      'The large blue square is a hundreds flat. It shows 100.',
      '100 has 1 hundred, 0 tens, and 0 ones.',
      '10 tens make 1 hundred. The hundreds flat = 10 rods.',
      '100 is the first three-digit number.'
    ],
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 0 } }
  },
  {
    title: '113 = 1 Hundred, 1 Ten, 3 Ones',
    steps: [
      'The blue flat shows 1 hundred = 100.',
      'The blue rod shows 1 ten = 10.',
      'The three orange cubes show 3 ones = 3.',
      '100 + 10 + 3 = 113. We write it as 1 hundred, 1 ten, and 3 ones.'
    ],
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 3 } }
  },
  {
    title: '120 = 1 Hundred, 2 Tens, 0 Ones',
    steps: [
      'The blue flat shows 1 hundred = 100.',
      'Two blue rods show 2 tens = 20.',
      'No orange cubes — 0 ones.',
      '100 + 20 + 0 = 120. 120 is the largest number in our range.'
    ],
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } }
  }
];

// ── L2.3 quiz bank ────────────────────────────────────────────────────────────
const _l23QuizBank = [

  // ── Easy (q1–q40) ──────────────────────────────────────────────────────────
  // Category A: ten_tens_is_hundred (q1–q6)

  _l23Q(1, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'easy',
    prompt: '10 tens = ___',
    visual: null,
    answer: '100',
    choices: ['10', '100', '110', '1000'],
    hint: 'Count 10 groups of 10. What is the total?',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '10 tens make 100',
      teachingSteps: [
        '1 ten = 10.',
        '2 tens = 20.',
        '10 tens = 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10.',
        '10 tens = 100.'
      ],
      correctAnswerExplanation: '10 tens make 100. That is one hundred.'
    }
  }),

  _l23Q(2, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'easy',
    prompt: '100 = ___ tens',
    visual: null,
    answer: '10',
    choices: ['1', '10', '20', '100'],
    hint: 'How many rods would you need to build 100?',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '100 equals 10 tens',
      teachingSteps: [
        'Each tens rod is worth 10.',
        'To get to 100, you need 10 rods.',
        '10 × 10 = 100.',
        '100 = 10 tens.'
      ],
      correctAnswerExplanation: '100 equals 10 tens. You need 10 rods to make 100.'
    }
  }),

  _l23Q(3, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'easy',
    prompt: 'How many tens equal 100?',
    visual: null,
    answer: '10',
    choices: ['1', '10', '20', '100'],
    hint: 'Think about how many groups of 10 fit in 100.',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '10 tens equal 100',
      teachingSteps: [
        '10 + 10 = 20. That is 2 tens.',
        'Keep adding tens: 30, 40, 50, 60, 70, 80, 90, 100.',
        'You added 10 tens to reach 100.',
        '10 tens = 100.'
      ],
      correctAnswerExplanation: '10 tens equal 100. Count up by 10s: 10, 20, 30 ... 100.'
    }
  }),

  _l23Q(4, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'easy',
    prompt: '1 hundred is the same as ___ tens',
    visual: null,
    answer: '10',
    choices: ['1', '10', '100', '20'],
    hint: 'A hundreds flat is made from exactly 10 tens rods.',
    intervention: {
      errorTag: 'err_hundred_is_one_ten',
      title: '1 hundred = 10 tens',
      teachingSteps: [
        '1 hundred = 100.',
        'One tens rod = 10.',
        '100 ÷ 10 = 10.',
        '1 hundred = 10 tens.'
      ],
      correctAnswerExplanation: '1 hundred equals 10 tens. The hundreds flat is made from 10 rods.'
    }
  }),

  _l23Q(5, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'easy',
    prompt: '10 groups of 10 = ___',
    visual: null,
    answer: '100',
    choices: ['10', '100', '110', '1000'],
    hint: 'Count by 10s ten times: 10, 20, 30 ...',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '10 groups of 10 make 100',
      teachingSteps: [
        'Count by tens: 10, 20, 30, 40, 50.',
        'Keep going: 60, 70, 80, 90, 100.',
        'That is 10 jumps of 10.',
        '10 groups of 10 = 100.'
      ],
      correctAnswerExplanation: '10 groups of 10 equal 100.'
    }
  }),

  _l23Q(6, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'easy',
    prompt: 'A hundreds flat is made of ___ tens rods.',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 0 } },
    answer: '10',
    choices: ['1', '5', '10', '100'],
    hint: 'Count the rows inside the hundreds flat. Each row is one rod.',
    intervention: {
      errorTag: 'err_hundred_is_one_ten',
      title: 'The flat equals 10 rods',
      teachingSteps: [
        'Look at the hundreds flat.',
        'It has 10 rows of 10.',
        'Each row equals 1 rod (10).',
        '10 rows = 10 rods = 100.'
      ],
      correctAnswerExplanation: 'A hundreds flat is made of 10 tens rods.'
    }
  }),

  // Category B: count_hundreds (q7–q12)

  _l23Q(7, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'How many hundreds are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 0 } },
    answer: '1',
    choices: ['0', '1', '10', '100'],
    hint: 'Count the large blue squares.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Count the hundreds flat',
      teachingSteps: [
        'The large blue square is 1 hundreds flat.',
        '1 flat = 1 hundred.',
        'There is 1 flat, so there is 1 hundred.'
      ],
      correctAnswerExplanation: 'One hundreds flat means 1 hundred.'
    }
  }),

  _l23Q(8, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'In 105, how many hundreds?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '5', '10'],
    hint: '105 has three digits. The first digit tells the hundreds.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'The first digit in 105 is hundreds',
      teachingSteps: [
        '105 has three digits: 1, 0, 5.',
        'The first digit (1) is in the hundreds place.',
        'The hundreds digit is 1.',
        '105 has 1 hundred.'
      ],
      correctAnswerExplanation: '105 has 1 hundred. The first digit tells you.'
    }
  }),

  _l23Q(9, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'How many hundreds are in this model?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 3 } },
    answer: '1',
    choices: ['0', '1', '10', '13'],
    hint: 'Count only the large blue flat, not the rods or cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'One flat = one hundred',
      teachingSteps: [
        'The large blue square is the hundreds flat.',
        'Count only the flats: there is 1.',
        'Rods and cubes are tens and ones — not hundreds.',
        '1 flat = 1 hundred.'
      ],
      correctAnswerExplanation: 'This model has 1 hundreds flat, so 1 hundred.'
    }
  }),

  _l23Q(10, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'In 120, how many hundreds?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '2', '12'],
    hint: 'Look at the first digit of 120.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '120 has 1 hundred',
      teachingSteps: [
        '120 has three digits: 1, 2, 0.',
        'The 1 is in the hundreds place.',
        'So 120 has 1 hundred.',
        'The 2 and 0 are tens and ones, not hundreds.'
      ],
      correctAnswerExplanation: '120 has 1 hundred. The digit 1 is in the hundreds place.'
    }
  }),

  _l23Q(11, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'How many hundreds does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 7 } },
    answer: '1',
    choices: ['0', '1', '7', '17'],
    hint: 'Find the large blue square. That is 1 hundred.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'The flat shows hundreds',
      teachingSteps: [
        'Count only the large blue squares.',
        'There is 1 large square = 1 hundred.',
        'The small orange cubes are ones, not hundreds.'
      ],
      correctAnswerExplanation: 'There is 1 hundreds flat, so the model shows 1 hundred.'
    }
  }),

  _l23Q(12, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'In 100, how many hundreds?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '10', '100'],
    hint: '100 starts with the digit 1 in the hundreds place.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '100 has 1 hundred',
      teachingSteps: [
        '100 has the digit 1 in the hundreds place.',
        '100 = 1 hundred, 0 tens, 0 ones.',
        'Even though tens and ones are both 0, there is still 1 hundred.'
      ],
      correctAnswerExplanation: '100 has 1 hundred. The digit 1 is in the hundreds place.'
    }
  }),

  // Category C: read_base10_model easy (q13–q24)

  _l23Q(13, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 0 } },
    answer: '100',
    choices: ['10', '100', '1000', '110'],
    hint: '1 flat, 0 rods, 0 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat = 100',
      teachingSteps: [
        'Count: 1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '0 ones cubes = 0.',
        '100 + 0 + 0 = 100.'
      ],
      correctAnswerExplanation: '1 flat and nothing else = 100.'
    }
  }),

  _l23Q(14, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 1 } },
    answer: '101',
    choices: ['11', '100', '101', '110'],
    hint: '1 flat, 0 rods, 1 cube. Start with 100.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 cube = 101',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '1 ones cube = 1.',
        '100 + 0 + 1 = 101.'
      ],
      correctAnswerExplanation: '1 flat and 1 cube = 100 + 1 = 101.'
    }
  }),

  _l23Q(15, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 2 } },
    answer: '102',
    choices: ['12', '100', '102', '120'],
    hint: '1 flat, 0 rods, 2 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 2 cubes = 102',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '2 ones cubes = 2.',
        '100 + 0 + 2 = 102.'
      ],
      correctAnswerExplanation: '1 flat and 2 cubes = 100 + 2 = 102.'
    }
  }),

  _l23Q(16, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 5 } },
    answer: '105',
    choices: ['15', '100', '105', '115'],
    hint: '1 flat, 0 rods, 5 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 5 cubes = 105',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '5 ones cubes = 5.',
        '100 + 0 + 5 = 105.'
      ],
      correctAnswerExplanation: '1 flat and 5 cubes = 100 + 5 = 105.'
    }
  }),

  _l23Q(17, {
    subSkill: 'read_base10_model',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 0 } },
    answer: '110',
    choices: ['11', '10', '100', '110'],
    hint: '1 flat, 1 rod, 0 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod = 110',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '0 ones cubes = 0.',
        '100 + 10 + 0 = 110.'
      ],
      correctAnswerExplanation: '1 flat and 1 rod = 100 + 10 = 110.'
    }
  }),

  _l23Q(18, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 2 } },
    answer: '112',
    choices: ['12', '102', '112', '121'],
    hint: '1 flat, 1 rod, 2 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 2 cubes = 112',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '2 ones cubes = 2.',
        '100 + 10 + 2 = 112.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 2 cubes = 100 + 10 + 2 = 112.'
    }
  }),

  _l23Q(19, {
    subSkill: 'read_base10_model',
    keyIdea: '115 means 1 hundred, 1 ten, and 5 ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 5 } },
    answer: '115',
    choices: ['15', '105', '115', '151'],
    hint: '1 flat, 1 rod, 5 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 5 cubes = 115',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '5 ones cubes = 5.',
        '100 + 10 + 5 = 115.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 5 cubes = 100 + 10 + 5 = 115.'
    }
  }),

  _l23Q(20, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 7 } },
    answer: '117',
    choices: ['17', '107', '117', '171'],
    hint: '1 flat, 1 rod, 7 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 7 cubes = 117',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '7 ones cubes = 7.',
        '100 + 10 + 7 = 117.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 7 cubes = 100 + 10 + 7 = 117.'
    }
  }),

  _l23Q(21, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 8 } },
    answer: '118',
    choices: ['18', '108', '118', '181'],
    hint: '1 flat, 1 rod, 8 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 8 cubes = 118',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '8 ones cubes = 8.',
        '100 + 10 + 8 = 118.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 8 cubes = 100 + 10 + 8 = 118.'
    }
  }),

  _l23Q(22, {
    subSkill: 'read_base10_model',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: '120',
    choices: ['20', '102', '120', '210'],
    hint: '1 flat, 2 rods, 0 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 2 rods = 120',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '2 tens rods = 20.',
        '0 ones cubes = 0.',
        '100 + 20 + 0 = 120.'
      ],
      correctAnswerExplanation: '1 flat and 2 rods = 100 + 20 = 120.'
    }
  }),

  _l23Q(23, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 3 } },
    answer: '103',
    choices: ['13', '30', '100', '103'],
    hint: '1 flat, 0 rods, 3 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 3 cubes = 103',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '3 ones cubes = 3.',
        '100 + 0 + 3 = 103.'
      ],
      correctAnswerExplanation: '1 flat and 3 cubes = 100 + 3 = 103.'
    }
  }),

  _l23Q(24, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'What number is shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 8 } },
    answer: '108',
    choices: ['18', '80', '100', '108'],
    hint: '1 flat, 0 rods, 8 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 8 cubes = 108',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '8 ones cubes = 8.',
        '100 + 0 + 8 = 108.'
      ],
      correctAnswerExplanation: '1 flat and 8 cubes = 100 + 8 = 108.'
    }
  }),

  // Category D: build_from_parts easy (q25–q34)

  _l23Q(25, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 0 tens, and 0 ones = ___',
    visual: null,
    answer: '100',
    choices: ['10', '100', '1000', '110'],
    hint: '1 hundred = 100. No tens or ones to add.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '1 hundred = 100',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '0 ones = 0.',
        '100 + 0 + 0 = 100.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 0 ones = 100.'
    }
  }),

  _l23Q(26, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 0 tens, and 1 one = ___',
    visual: null,
    answer: '101',
    choices: ['11', '100', '101', '111'],
    hint: 'Start at 100. Add 1 one.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 1 = 101',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '1 one = 1.',
        '100 + 0 + 1 = 101.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 1 one = 101.'
    }
  }),

  _l23Q(27, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 0 tens, and 5 ones = ___',
    visual: null,
    answer: '105',
    choices: ['15', '100', '105', '150'],
    hint: 'Start at 100. Add 5 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 5 = 105',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '5 ones = 5.',
        '100 + 0 + 5 = 105.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 5 ones = 105.'
    }
  }),

  _l23Q(28, {
    subSkill: 'build_from_parts',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 1 ten, and 0 ones = ___',
    visual: null,
    answer: '110',
    choices: ['10', '11', '100', '110'],
    hint: 'Start at 100. Add 10.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 = 110',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '0 ones = 0.',
        '100 + 10 + 0 = 110.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 0 ones = 110.'
    }
  }),

  _l23Q(29, {
    subSkill: 'build_from_parts',
    keyIdea: '115 means 1 hundred, 1 ten, and 5 ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 1 ten, and 3 ones = ___',
    visual: null,
    answer: '113',
    choices: ['13', '103', '113', '131'],
    hint: 'Start at 100. Add 10. Then add 3.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 3 = 113',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '3 ones = 3.',
        '100 + 10 + 3 = 113.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 3 ones = 113.'
    }
  }),

  _l23Q(30, {
    subSkill: 'build_from_parts',
    keyIdea: '115 means 1 hundred, 1 ten, and 5 ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 1 ten, and 5 ones = ___',
    visual: null,
    answer: '115',
    choices: ['15', '105', '115', '151'],
    hint: 'Start at 100. Add 10. Then add 5.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 5 = 115',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '5 ones = 5.',
        '100 + 10 + 5 = 115.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 5 ones = 115.'
    }
  }),

  _l23Q(31, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 1 ten, and 7 ones = ___',
    visual: null,
    answer: '117',
    choices: ['17', '107', '117', '170'],
    hint: 'Start at 100. Add 10. Then add 7.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 7 = 117',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '7 ones = 7.',
        '100 + 10 + 7 = 117.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 7 ones = 117.'
    }
  }),

  _l23Q(32, {
    subSkill: 'build_from_parts',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 2 tens, and 0 ones = ___',
    visual: null,
    answer: '120',
    choices: ['20', '102', '120', '200'],
    hint: 'Start at 100. Add 20.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 20 = 120',
      teachingSteps: [
        '1 hundred = 100.',
        '2 tens = 20.',
        '0 ones = 0.',
        '100 + 20 + 0 = 120.'
      ],
      correctAnswerExplanation: '1 hundred, 2 tens, 0 ones = 120.'
    }
  }),

  _l23Q(33, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 0 tens, and 8 ones = ___',
    visual: null,
    answer: '108',
    choices: ['18', '80', '100', '108'],
    hint: 'Start at 100. Add 8 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 8 = 108',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '8 ones = 8.',
        '100 + 0 + 8 = 108.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 8 ones = 108.'
    }
  }),

  _l23Q(34, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: '1 hundred, 1 ten, and 2 ones = ___',
    visual: null,
    answer: '112',
    choices: ['12', '102', '112', '121'],
    hint: 'Start at 100. Add 10. Then add 2.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 2 = 112',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '2 ones = 2.',
        '100 + 10 + 2 = 112.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 2 ones = 112.'
    }
  }),

  // Category E: count_ones_in_120range easy (q35–q40)

  _l23Q(35, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'easy',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 5 } },
    answer: '5',
    choices: ['1', '5', '10', '105'],
    hint: 'Count only the small orange cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the ones cubes',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Do not count the flat or rods.',
        'Count the cubes: 1, 2, 3, 4, 5.',
        'There are 5 ones.'
      ],
      correctAnswerExplanation: '5 orange cubes = 5 ones.'
    }
  }),

  _l23Q(36, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'easy',
    prompt: 'In 113, how many ones?',
    visual: null,
    answer: '3',
    choices: ['1', '3', '10', '13'],
    hint: 'The last digit of 113 tells the ones.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'The last digit is the ones',
      teachingSteps: [
        '113 has three digits: 1, 1, 3.',
        'The last digit (3) is in the ones place.',
        '113 has 3 ones.'
      ],
      correctAnswerExplanation: '113 has 3 in the ones place, so 3 ones.'
    }
  }),

  _l23Q(37, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'easy',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 7 } },
    answer: '7',
    choices: ['1', '7', '10', '17'],
    hint: 'Count only the small orange cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the ones cubes',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Do not count the flat or rods.',
        'Count the cubes: 1, 2, 3, 4, 5, 6, 7.',
        'There are 7 ones.'
      ],
      correctAnswerExplanation: '7 orange cubes = 7 ones.'
    }
  }),

  _l23Q(38, {
    subSkill: 'count_ones_in_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'easy',
    prompt: 'In 120, how many ones?',
    visual: null,
    answer: '0',
    choices: ['0', '2', '10', '20'],
    hint: 'Look at the last digit of 120.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '120 has 0 ones',
      teachingSteps: [
        '120 has three digits: 1, 2, 0.',
        'The last digit (0) is in the ones place.',
        '120 has 0 ones.'
      ],
      correctAnswerExplanation: '120 ends in 0, so it has 0 ones.'
    }
  }),

  _l23Q(39, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'easy',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 8 } },
    answer: '8',
    choices: ['1', '8', '10', '108'],
    hint: 'Count only the small orange cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the ones cubes',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Do not count the flat.',
        'Count the cubes: 1, 2, 3, 4, 5, 6, 7, 8.',
        'There are 8 ones.'
      ],
      correctAnswerExplanation: '8 orange cubes = 8 ones.'
    }
  }),

  _l23Q(40, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'easy',
    prompt: 'In 100, how many ones?',
    visual: null,
    answer: '0',
    choices: ['0', '1', '10', '100'],
    hint: 'Look at the last digit of 100.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '100 has 0 ones',
      teachingSteps: [
        '100 has three digits: 1, 0, 0.',
        'The last digit (0) is in the ones place.',
        '100 has 0 ones.'
      ],
      correctAnswerExplanation: '100 ends in 0, so it has 0 ones.'
    }
  }),

  // ── Medium (q41–q90) ───────────────────────────────────────────────────────
  // Group 1: count_tens_in_120range (q41–q52)

  _l23Q(41, {
    subSkill: 'count_tens_in_120range',
    keyIdea: '115 means 1 hundred, 1 ten, and 5 ones.',
    difficulty: 'medium',
    prompt: 'How many tens rods are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 5 } },
    answer: '1',
    choices: ['0', '1', '5', '15'],
    hint: 'Count only the blue rods — not the flat and not the cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the tens rods',
      teachingSteps: [
        'The blue rods are the tens.',
        'Do not count the large flat or the small cubes.',
        'Count the rods: there is 1.',
        '1 rod = 1 ten.'
      ],
      correctAnswerExplanation: '1 blue rod = 1 ten.'
    }
  }),

  _l23Q(42, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 114, how many tens?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '4', '14'],
    hint: 'Look at the tens digit — the middle digit of 114.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'The middle digit is tens',
      teachingSteps: [
        '114 has three digits: 1, 1, 4.',
        'The middle digit (1) is in the tens place.',
        '114 has 1 ten.'
      ],
      correctAnswerExplanation: '114 has 1 in the tens place, so 1 ten.'
    }
  }),

  _l23Q(43, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'How many tens rods are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 9 } },
    answer: '0',
    choices: ['0', '1', '9', '10'],
    hint: 'Look for blue rods. If there are none, the answer is 0.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'No rods means 0 tens',
      teachingSteps: [
        'Count the blue rods.',
        'There are no rods in this model.',
        '0 rods = 0 tens.'
      ],
      correctAnswerExplanation: 'No blue rods means 0 tens.'
    }
  }),

  _l23Q(44, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 109, how many tens?',
    visual: null,
    answer: '0',
    choices: ['0', '1', '9', '10'],
    hint: 'Look at the tens digit — the middle digit of 109.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'The middle digit of 109 is 0',
      teachingSteps: [
        '109 has three digits: 1, 0, 9.',
        'The middle digit (0) is in the tens place.',
        '109 has 0 tens.'
      ],
      correctAnswerExplanation: '109 has 0 in the tens place, so 0 tens.'
    }
  }),

  _l23Q(45, {
    subSkill: 'count_tens_in_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'medium',
    prompt: 'How many tens rods are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: '2',
    choices: ['0', '1', '2', '20'],
    hint: 'Count only the blue rods, not the flat.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count the rods: there are 2',
      teachingSteps: [
        'The blue rods are the tens.',
        'Count them: 1, 2.',
        '2 rods = 2 tens.'
      ],
      correctAnswerExplanation: '2 blue rods = 2 tens.'
    }
  }),

  _l23Q(46, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 116, how many tens?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '6', '16'],
    hint: 'Find the tens digit — the middle digit of 116.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'Middle digit of 116 is tens',
      teachingSteps: [
        '116 has three digits: 1, 1, 6.',
        'The middle digit (1) is in the tens place.',
        '116 has 1 ten.'
      ],
      correctAnswerExplanation: '116 has 1 in the tens place, so 1 ten.'
    }
  }),

  _l23Q(47, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'How many tens rods are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 4 } },
    answer: '1',
    choices: ['0', '1', '4', '14'],
    hint: 'Count only the blue rods.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the tens rods',
      teachingSteps: [
        'The blue rods are the tens.',
        'Do not count the flat or the orange cubes.',
        'There is 1 rod.',
        '1 rod = 1 ten.'
      ],
      correctAnswerExplanation: '1 blue rod = 1 ten.'
    }
  }),

  _l23Q(48, {
    subSkill: 'count_tens_in_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'medium',
    prompt: 'In 120, how many tens?',
    visual: null,
    answer: '2',
    choices: ['0', '1', '2', '20'],
    hint: 'Look at the tens digit — the middle digit of 120.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'Middle digit of 120 is tens',
      teachingSteps: [
        '120 has three digits: 1, 2, 0.',
        'The middle digit (2) is in the tens place.',
        '120 has 2 tens.'
      ],
      correctAnswerExplanation: '120 has 2 in the tens place, so 2 tens.'
    }
  }),

  _l23Q(49, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'How many tens rods are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 6 } },
    answer: '0',
    choices: ['0', '1', '6', '10'],
    hint: 'Look for blue rods. Count only those.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'No rods means 0 tens',
      teachingSteps: [
        'The blue rods are the tens.',
        'There are no rods in this model.',
        '0 rods = 0 tens.'
      ],
      correctAnswerExplanation: 'No blue rods = 0 tens.'
    }
  }),

  _l23Q(50, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 102, how many tens?',
    visual: null,
    answer: '0',
    choices: ['0', '1', '2', '10'],
    hint: 'The middle digit of 102 is in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'Middle digit of 102 is 0',
      teachingSteps: [
        '102 has three digits: 1, 0, 2.',
        'The middle digit (0) is in the tens place.',
        '102 has 0 tens.'
      ],
      correctAnswerExplanation: '102 has 0 in the tens place, so 0 tens.'
    }
  }),

  _l23Q(51, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'How many tens rods are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 9 } },
    answer: '1',
    choices: ['0', '1', '9', '19'],
    hint: 'Count only the blue rods.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the tens rods',
      teachingSteps: [
        'The blue rods are the tens.',
        'Do not count the flat or the cubes.',
        'There is 1 rod.',
        '1 rod = 1 ten.'
      ],
      correctAnswerExplanation: '1 blue rod = 1 ten.'
    }
  }),

  _l23Q(52, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 110, how many tens?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '10', '11'],
    hint: 'Look at the tens digit — the middle digit of 110.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'Middle digit of 110 is 1',
      teachingSteps: [
        '110 has three digits: 1, 1, 0.',
        'The middle digit (1) is in the tens place.',
        '110 has 1 ten.'
      ],
      correctAnswerExplanation: '110 has 1 in the tens place, so 1 ten.'
    }
  }),

  // Group 2: count_ones_in_120range medium (q53–q60)

  _l23Q(53, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 4 } },
    answer: '4',
    choices: ['1', '4', '10', '14'],
    hint: 'Count only the small orange cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the ones cubes',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Do not count the flat or the rods.',
        'Count the cubes: 1, 2, 3, 4.',
        'There are 4 ones.'
      ],
      correctAnswerExplanation: '4 orange cubes = 4 ones.'
    }
  }),

  _l23Q(54, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 116, how many ones?',
    visual: null,
    answer: '6',
    choices: ['1', '6', '10', '16'],
    hint: 'The last digit of 116 tells the ones.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'Last digit of 116 is ones',
      teachingSteps: [
        '116 has three digits: 1, 1, 6.',
        'The last digit (6) is in the ones place.',
        '116 has 6 ones.'
      ],
      correctAnswerExplanation: '116 has 6 in the ones place, so 6 ones.'
    }
  }),

  _l23Q(55, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 9 } },
    answer: '9',
    choices: ['0', '1', '9', '19'],
    hint: 'Count only the small orange cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the ones cubes',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Count them: 1, 2, 3, 4, 5, 6, 7, 8, 9.',
        'There are 9 ones.'
      ],
      correctAnswerExplanation: '9 orange cubes = 9 ones.'
    }
  }),

  _l23Q(56, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 110, how many ones?',
    visual: null,
    answer: '0',
    choices: ['0', '1', '10', '11'],
    hint: 'Look at the last digit of 110.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '110 has 0 ones',
      teachingSteps: [
        '110 has three digits: 1, 1, 0.',
        'The last digit (0) is in the ones place.',
        '110 has 0 ones.'
      ],
      correctAnswerExplanation: '110 ends in 0, so it has 0 ones.'
    }
  }),

  _l23Q(57, {
    subSkill: 'count_ones_in_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'medium',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: '0',
    choices: ['0', '2', '10', '20'],
    hint: 'Look for orange cubes. If there are none, the answer is 0.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'No cubes means 0 ones',
      teachingSteps: [
        'Count the orange cubes.',
        'There are no orange cubes in this model.',
        '0 cubes = 0 ones.'
      ],
      correctAnswerExplanation: 'No orange cubes = 0 ones.'
    }
  }),

  _l23Q(58, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 119, how many ones?',
    visual: null,
    answer: '9',
    choices: ['1', '9', '10', '19'],
    hint: 'The last digit of 119 tells the ones.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'Last digit of 119 is ones',
      teachingSteps: [
        '119 has three digits: 1, 1, 9.',
        'The last digit (9) is in the ones place.',
        '119 has 9 ones.'
      ],
      correctAnswerExplanation: '119 has 9 in the ones place, so 9 ones.'
    }
  }),

  _l23Q(59, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'How many ones cubes are shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 6 } },
    answer: '6',
    choices: ['1', '6', '10', '16'],
    hint: 'Count only the small orange cubes.',
    intervention: {
      errorTag: 'err_count_all_not_group',
      title: 'Count only the ones cubes',
      teachingSteps: [
        'The orange cubes are the ones.',
        'Do not count the flat or the rod.',
        'Count the cubes: 1, 2, 3, 4, 5, 6.',
        'There are 6 ones.'
      ],
      correctAnswerExplanation: '6 orange cubes = 6 ones.'
    }
  }),

  _l23Q(60, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: 'In 104, how many ones?',
    visual: null,
    answer: '4',
    choices: ['0', '1', '4', '14'],
    hint: 'The last digit of 104 tells the ones.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'Last digit of 104 is ones',
      teachingSteps: [
        '104 has three digits: 1, 0, 4.',
        'The last digit (4) is in the ones place.',
        '104 has 4 ones.'
      ],
      correctAnswerExplanation: '104 has 4 in the ones place, so 4 ones.'
    }
  }),

  // Group 3: read_base10_model medium — fresh number configs (q61–q69)

  _l23Q(61, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 4 } },
    answer: '104',
    choices: ['14', '40', '100', '104'],
    hint: 'Start with the flat: 100. Then count the cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 4 cubes = 104',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '4 ones cubes = 4.',
        '100 + 0 + 4 = 104.'
      ],
      correctAnswerExplanation: '1 flat and 4 cubes = 100 + 4 = 104.'
    }
  }),

  _l23Q(62, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 6 } },
    answer: '106',
    choices: ['16', '60', '100', '106'],
    hint: 'Start with the flat: 100. Then count the cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 6 cubes = 106',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '6 ones cubes = 6.',
        '100 + 0 + 6 = 106.'
      ],
      correctAnswerExplanation: '1 flat and 6 cubes = 100 + 6 = 106.'
    }
  }),

  _l23Q(63, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 7 } },
    answer: '107',
    choices: ['17', '70', '100', '107'],
    hint: '1 flat, 0 rods, 7 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 7 cubes = 107',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '7 ones cubes = 7.',
        '100 + 0 + 7 = 107.'
      ],
      correctAnswerExplanation: '1 flat and 7 cubes = 100 + 7 = 107.'
    }
  }),

  _l23Q(64, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 9 } },
    answer: '109',
    choices: ['19', '90', '100', '109'],
    hint: '1 flat, 0 rods, 9 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 9 cubes = 109',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '0 tens rods = 0.',
        '9 ones cubes = 9.',
        '100 + 0 + 9 = 109.'
      ],
      correctAnswerExplanation: '1 flat and 9 cubes = 100 + 9 = 109.'
    }
  }),

  _l23Q(65, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 1 } },
    answer: '111',
    choices: ['11', '101', '111', '121'],
    hint: '1 flat, 1 rod, 1 cube.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 1 cube = 111',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '1 ones cube = 1.',
        '100 + 10 + 1 = 111.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 1 cube = 100 + 10 + 1 = 111.'
    }
  }),

  _l23Q(66, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 3 } },
    answer: '113',
    choices: ['13', '103', '113', '130'],
    hint: '1 flat, 1 rod, 3 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 3 cubes = 113',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '3 ones cubes = 3.',
        '100 + 10 + 3 = 113.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 3 cubes = 100 + 10 + 3 = 113.'
    }
  }),

  _l23Q(67, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 4 } },
    answer: '114',
    choices: ['14', '104', '114', '141'],
    hint: '1 flat, 1 rod, 4 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 4 cubes = 114',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '4 ones cubes = 4.',
        '100 + 10 + 4 = 114.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 4 cubes = 100 + 10 + 4 = 114.'
    }
  }),

  _l23Q(68, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 6 } },
    answer: '116',
    choices: ['16', '106', '116', '160'],
    hint: '1 flat, 1 rod, 6 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 6 cubes = 116',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '6 ones cubes = 6.',
        '100 + 10 + 6 = 116.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 6 cubes = 100 + 10 + 6 = 116.'
    }
  }),

  _l23Q(69, {
    subSkill: 'read_base10_model',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: 'What number does this model show?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 9 } },
    answer: '119',
    choices: ['19', '109', '119', '191'],
    hint: '1 flat, 1 rod, 9 cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '1 flat + 1 rod + 9 cubes = 119',
      teachingSteps: [
        '1 hundreds flat = 100.',
        '1 tens rod = 10.',
        '9 ones cubes = 9.',
        '100 + 10 + 9 = 119.'
      ],
      correctAnswerExplanation: '1 flat, 1 rod, 9 cubes = 100 + 10 + 9 = 119.'
    }
  }),

  // Group 4: missing_part_120range (q70–q81)

  _l23Q(70, {
    subSkill: 'missing_part_120range',
    keyIdea: '115 means 1 hundred, 1 ten, and 5 ones.',
    difficulty: 'medium',
    prompt: '1 hundred, ___ tens, and 5 ones = 115',
    visual: null,
    answer: '1',
    choices: ['0', '1', '5', '10'],
    hint: '115 has 1 in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '115 has 1 ten',
      teachingSteps: [
        '115 = 1 hundred + ? tens + 5 ones.',
        'Look at the tens digit of 115: it is 1.',
        '1 hundred, 1 ten, 5 ones = 115.'
      ],
      correctAnswerExplanation: '115 = 1 hundred, 1 ten, 5 ones. The missing tens is 1.'
    }
  }),

  _l23Q(71, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and ___ ones = 117',
    visual: null,
    answer: '7',
    choices: ['1', '7', '10', '17'],
    hint: '117 has 7 in the ones place.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '117 has 7 ones',
      teachingSteps: [
        '117 = 1 hundred + 1 ten + ? ones.',
        'Look at the ones digit of 117: it is 7.',
        '1 hundred, 1 ten, 7 ones = 117.'
      ],
      correctAnswerExplanation: '117 = 1 hundred, 1 ten, 7 ones. The missing ones is 7.'
    }
  }),

  _l23Q(72, {
    subSkill: 'missing_part_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'medium',
    prompt: '1 hundred, ___ tens, and 0 ones = 110',
    visual: null,
    answer: '1',
    choices: ['0', '1', '2', '10'],
    hint: '110 has 1 in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '110 has 1 ten',
      teachingSteps: [
        '110 = 1 hundred + ? tens + 0 ones.',
        'Look at the tens digit of 110: it is 1.',
        '1 hundred, 1 ten, 0 ones = 110.'
      ],
      correctAnswerExplanation: '110 = 1 hundred, 1 ten, 0 ones. The missing tens is 1.'
    }
  }),

  _l23Q(73, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and ___ ones = 113',
    visual: null,
    answer: '3',
    choices: ['0', '1', '3', '13'],
    hint: '113 has 3 in the ones place.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '113 has 3 ones',
      teachingSteps: [
        '113 = 1 hundred + 1 ten + ? ones.',
        'Look at the ones digit of 113: it is 3.',
        '1 hundred, 1 ten, 3 ones = 113.'
      ],
      correctAnswerExplanation: '113 = 1 hundred, 1 ten, 3 ones. The missing ones is 3.'
    }
  }),

  _l23Q(74, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, ___ tens, and 8 ones = 118',
    visual: null,
    answer: '1',
    choices: ['0', '1', '8', '10'],
    hint: '118 has 1 in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '118 has 1 ten',
      teachingSteps: [
        '118 = 1 hundred + ? tens + 8 ones.',
        'Look at the tens digit of 118: it is 1.',
        '1 hundred, 1 ten, 8 ones = 118.'
      ],
      correctAnswerExplanation: '118 = 1 hundred, 1 ten, 8 ones. The missing tens is 1.'
    }
  }),

  _l23Q(75, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 0 tens, and ___ ones = 107',
    visual: null,
    answer: '7',
    choices: ['0', '1', '7', '17'],
    hint: '107 has 7 in the ones place.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '107 has 7 ones',
      teachingSteps: [
        '107 = 1 hundred + 0 tens + ? ones.',
        'Look at the ones digit of 107: it is 7.',
        '1 hundred, 0 tens, 7 ones = 107.'
      ],
      correctAnswerExplanation: '107 = 1 hundred, 0 tens, 7 ones. The missing ones is 7.'
    }
  }),

  _l23Q(76, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, ___ tens, and 9 ones = 119',
    visual: null,
    answer: '1',
    choices: ['0', '1', '9', '10'],
    hint: '119 has 1 in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '119 has 1 ten',
      teachingSteps: [
        '119 = 1 hundred + ? tens + 9 ones.',
        'Look at the tens digit of 119: it is 1.',
        '1 hundred, 1 ten, 9 ones = 119.'
      ],
      correctAnswerExplanation: '119 = 1 hundred, 1 ten, 9 ones. The missing tens is 1.'
    }
  }),

  _l23Q(77, {
    subSkill: 'missing_part_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 2 tens, and ___ ones = 120',
    visual: null,
    answer: '0',
    choices: ['0', '2', '10', '20'],
    hint: '120 has 0 in the ones place.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '120 has 0 ones',
      teachingSteps: [
        '120 = 1 hundred + 2 tens + ? ones.',
        'Look at the ones digit of 120: it is 0.',
        '1 hundred, 2 tens, 0 ones = 120.'
      ],
      correctAnswerExplanation: '120 = 1 hundred, 2 tens, 0 ones. The missing ones is 0.'
    }
  }),

  _l23Q(78, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, ___ tens, and 4 ones = 114',
    visual: null,
    answer: '1',
    choices: ['0', '1', '4', '14'],
    hint: '114 has 1 in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '114 has 1 ten',
      teachingSteps: [
        '114 = 1 hundred + ? tens + 4 ones.',
        'Look at the tens digit of 114: it is 1.',
        '1 hundred, 1 ten, 4 ones = 114.'
      ],
      correctAnswerExplanation: '114 = 1 hundred, 1 ten, 4 ones. The missing tens is 1.'
    }
  }),

  _l23Q(79, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and ___ ones = 116',
    visual: null,
    answer: '6',
    choices: ['0', '1', '6', '16'],
    hint: '116 has 6 in the ones place.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '116 has 6 ones',
      teachingSteps: [
        '116 = 1 hundred + 1 ten + ? ones.',
        'Look at the ones digit of 116: it is 6.',
        '1 hundred, 1 ten, 6 ones = 116.'
      ],
      correctAnswerExplanation: '116 = 1 hundred, 1 ten, 6 ones. The missing ones is 6.'
    }
  }),

  _l23Q(80, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, ___ tens, and 3 ones = 103',
    visual: null,
    answer: '0',
    choices: ['0', '1', '3', '10'],
    hint: '103 has 0 in the tens place.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '103 has 0 tens',
      teachingSteps: [
        '103 = 1 hundred + ? tens + 3 ones.',
        'Look at the tens digit of 103: it is 0.',
        '1 hundred, 0 tens, 3 ones = 103.'
      ],
      correctAnswerExplanation: '103 = 1 hundred, 0 tens, 3 ones. The missing tens is 0.'
    }
  }),

  _l23Q(81, {
    subSkill: 'missing_part_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 0 tens, and ___ ones = 109',
    visual: null,
    answer: '9',
    choices: ['0', '1', '9', '19'],
    hint: '109 has 9 in the ones place.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: '109 has 9 ones',
      teachingSteps: [
        '109 = 1 hundred + 0 tens + ? ones.',
        'Look at the ones digit of 109: it is 9.',
        '1 hundred, 0 tens, 9 ones = 109.'
      ],
      correctAnswerExplanation: '109 = 1 hundred, 0 tens, 9 ones. The missing ones is 9.'
    }
  }),

  // Group 5: build_from_parts medium — fresh numbers (q82–q90)

  _l23Q(82, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 0 tens, and 4 ones = ___',
    visual: null,
    answer: '104',
    choices: ['14', '40', '100', '104'],
    hint: 'Start at 100. Add 4 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 4 = 104',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '4 ones = 4.',
        '100 + 0 + 4 = 104.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 4 ones = 104.'
    }
  }),

  _l23Q(83, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 0 tens, and 6 ones = ___',
    visual: null,
    answer: '106',
    choices: ['16', '60', '100', '106'],
    hint: 'Start at 100. Add 6 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 6 = 106',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '6 ones = 6.',
        '100 + 0 + 6 = 106.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 6 ones = 106.'
    }
  }),

  _l23Q(84, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 0 tens, and 7 ones = ___',
    visual: null,
    answer: '107',
    choices: ['17', '70', '100', '107'],
    hint: 'Start at 100. Add 7 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 7 = 107',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '7 ones = 7.',
        '100 + 0 + 7 = 107.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 7 ones = 107.'
    }
  }),

  _l23Q(85, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 0 tens, and 9 ones = ___',
    visual: null,
    answer: '109',
    choices: ['19', '90', '100', '109'],
    hint: 'Start at 100. Add 9 ones.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 9 = 109',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '9 ones = 9.',
        '100 + 0 + 9 = 109.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 9 ones = 109.'
    }
  }),

  _l23Q(86, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and 1 one = ___',
    visual: null,
    answer: '111',
    choices: ['11', '101', '111', '121'],
    hint: 'Start at 100. Add 10. Then add 1.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 1 = 111',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '1 one = 1.',
        '100 + 10 + 1 = 111.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 1 one = 111.'
    }
  }),

  _l23Q(87, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and 4 ones = ___',
    visual: null,
    answer: '114',
    choices: ['14', '104', '114', '141'],
    hint: 'Start at 100. Add 10. Then add 4.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 4 = 114',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '4 ones = 4.',
        '100 + 10 + 4 = 114.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 4 ones = 114.'
    }
  }),

  _l23Q(88, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and 6 ones = ___',
    visual: null,
    answer: '116',
    choices: ['16', '106', '116', '160'],
    hint: 'Start at 100. Add 10. Then add 6.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 6 = 116',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '6 ones = 6.',
        '100 + 10 + 6 = 116.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 6 ones = 116.'
    }
  }),

  _l23Q(89, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and 8 ones = ___',
    visual: null,
    answer: '118',
    choices: ['18', '108', '118', '181'],
    hint: 'Start at 100. Add 10. Then add 8.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 8 = 118',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '8 ones = 8.',
        '100 + 10 + 8 = 118.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 8 ones = 118.'
    }
  }),

  _l23Q(90, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'medium',
    prompt: '1 hundred, 1 ten, and 9 ones = ___',
    visual: null,
    answer: '119',
    choices: ['19', '109', '119', '191'],
    hint: 'Start at 100. Add 10. Then add 9.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '100 + 10 + 9 = 119',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '9 ones = 9.',
        '100 + 10 + 9 = 119.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 9 ones = 119.'
    }
  }),

  // ── Hard (q91–q120) ────────────────────────────────────────────────────────
  // Group 1: hundreds_digit_value (q91–q98)

  _l23Q(91, {
    subSkill: 'hundreds_digit_value',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: 'In 112, what is the value of the hundreds digit?',
    visual: null,
    answer: '100',
    choices: ['1', '10', '100', '12'],
    hint: 'The hundreds digit is 1. What is 1 hundred worth?',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'The hundreds digit is worth 100',
      teachingSteps: [
        'In 112, the first digit (1) is in the hundreds place.',
        'The hundreds digit means how many hundreds.',
        '1 hundred = 100.',
        'The 1 in 112 is worth 100, not 1.'
      ],
      correctAnswerExplanation: 'In 112, the hundreds digit (1) is worth 100.'
    }
  }),

  _l23Q(92, {
    subSkill: 'hundreds_digit_value',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: 'In 107, what does the first digit stand for?',
    visual: null,
    answer: '100',
    choices: ['1', '7', '10', '100'],
    hint: 'The first digit in 107 is in the hundreds place.',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'First digit of 107 stands for 100',
      teachingSteps: [
        'In 107, the first digit (1) is in the hundreds place.',
        '1 hundred = 100.',
        'The first digit stands for 100, not 1.'
      ],
      correctAnswerExplanation: 'The first digit in 107 is the hundreds digit, worth 100.'
    }
  }),

  _l23Q(93, {
    subSkill: 'hundreds_digit_value',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'In 115, the digit 1 in the hundreds place is worth ___',
    visual: null,
    answer: '100',
    choices: ['1', '5', '10', '100'],
    hint: '1 in the hundreds place = 1 hundred = 100.',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'Hundreds digit worth 100',
      teachingSteps: [
        'In 115, the first 1 is in the hundreds place.',
        'The hundreds place holds groups of 100.',
        '1 group of 100 = 100.',
        'The 1 is worth 100, not 1 or 10.'
      ],
      correctAnswerExplanation: 'In 115, the hundreds digit (1) is worth 100.'
    }
  }),

  _l23Q(94, {
    subSkill: 'hundreds_digit_value',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'In 120, what is the value of the hundreds digit?',
    visual: null,
    answer: '100',
    choices: ['1', '12', '20', '100'],
    hint: '120 has 1 in the hundreds place. What is 1 hundred worth?',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'Hundreds digit in 120 is worth 100',
      teachingSteps: [
        'In 120, the first digit (1) is in the hundreds place.',
        '1 hundred = 100.',
        'The 1 is worth 100, not 1 or 12.'
      ],
      correctAnswerExplanation: 'In 120, the hundreds digit (1) is worth 100.'
    }
  }),

  _l23Q(95, {
    subSkill: 'hundreds_digit_value',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'In 103, the 1 means ___',
    visual: null,
    answer: '100',
    choices: ['1', '3', '10', '100'],
    hint: 'The 1 is the hundreds digit. What is 1 hundred worth?',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'The 1 in 103 means 100',
      teachingSteps: [
        'In 103, the first digit (1) is in the hundreds place.',
        '1 hundred = 100.',
        'So the 1 means 100.'
      ],
      correctAnswerExplanation: 'In 103, the digit 1 is in the hundreds place and means 100.'
    }
  }),

  _l23Q(96, {
    subSkill: 'hundreds_digit_value',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: 'In 119, the hundreds digit is worth ___',
    visual: null,
    answer: '100',
    choices: ['1', '10', '19', '100'],
    hint: 'The hundreds digit of 119 is 1. That means 1 hundred.',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'Hundreds digit of 119 worth 100',
      teachingSteps: [
        'In 119, the digits are 1, 1, 9.',
        'The first 1 is in the hundreds place.',
        '1 hundred = 100.',
        'The hundreds digit is worth 100.'
      ],
      correctAnswerExplanation: 'In 119, the hundreds digit (1) is worth 100.'
    }
  }),

  _l23Q(97, {
    subSkill: 'hundreds_digit_value',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: 'In 110, the digit 1 in the hundreds place stands for ___',
    visual: null,
    answer: '100',
    choices: ['1', '10', '11', '100'],
    hint: 'The first 1 in 110 is in the hundreds place, not the tens place.',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'First 1 in 110 stands for 100',
      teachingSteps: [
        'In 110, the digits are 1, 1, 0.',
        'The first 1 is in the hundreds place.',
        'The second 1 is in the tens place (worth 10).',
        'The hundreds 1 stands for 100.'
      ],
      correctAnswerExplanation: 'In 110, the first digit (hundreds place) stands for 100.'
    }
  }),

  _l23Q(98, {
    subSkill: 'hundreds_digit_value',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'In 117, what does the first digit (1) stand for?',
    visual: null,
    answer: '100',
    choices: ['1', '7', '10', '100'],
    hint: 'The first digit in any three-digit number is the hundreds digit.',
    intervention: {
      errorTag: 'err_hundreds_digit_not_value',
      title: 'First digit of 117 stands for 100',
      teachingSteps: [
        'In 117, the first digit (1) is in the hundreds place.',
        '1 hundred = 100.',
        'The first digit stands for 100.'
      ],
      correctAnswerExplanation: 'In 117, the first digit is the hundreds digit, worth 100.'
    }
  }),

  // Group 2: ten_tens_misconception traps (q99–q102)

  _l23Q(99, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: 'A student says 10 tens = 10. What should 10 tens equal?',
    visual: null,
    answer: '100',
    choices: ['10', '100', '110', '1000'],
    hint: 'Count up by 10s ten times.',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '10 tens = 100, not 10',
      teachingSteps: [
        'The student confused 10 tens with 1 ten.',
        '1 ten = 10. 10 tens = 10 × 10.',
        '10 × 10 = 100.',
        '10 tens = 100.'
      ],
      correctAnswerExplanation: '10 tens equals 100. The student forgot to multiply by 10.'
    }
  }),

  _l23Q(100, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: '10 tens rods bundled together make ___',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 0 } },
    answer: '100',
    choices: ['10', '100', '110', '1000'],
    hint: 'The flat shown is made from exactly 10 rods.',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '10 rods bundled = 1 flat = 100',
      teachingSteps: [
        'Each rod = 10.',
        '10 rods = 10 × 10 = 100.',
        'When you bundle 10 rods, you get 1 hundreds flat.',
        '10 tens rods = 100.'
      ],
      correctAnswerExplanation: '10 tens rods bundled together make 100 (1 hundreds flat).'
    }
  }),

  _l23Q(101, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: 'Which is the same as 1 hundred?',
    visual: null,
    answer: '10 tens',
    choices: ['1 ten', '10 ones', '10 tens', '100 tens'],
    hint: '100 = 10 × 10. How many tens is that?',
    intervention: {
      errorTag: 'err_ten_tens_confusion',
      title: '1 hundred = 10 tens',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '100 ÷ 10 = 10.',
        '1 hundred = 10 tens.'
      ],
      correctAnswerExplanation: '1 hundred equals 10 tens.'
    }
  }),

  _l23Q(102, {
    subSkill: 'ten_tens_is_hundred',
    keyIdea: '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
    difficulty: 'hard',
    prompt: '1 hundred = ___ tens. Which number completes this correctly?',
    visual: null,
    answer: '10',
    choices: ['1', '10', '100', '1000'],
    hint: 'How many tens rods fit inside a hundreds flat?',
    intervention: {
      errorTag: 'err_hundred_is_one_ten',
      title: '1 hundred = 10 tens',
      teachingSteps: [
        '1 hundred = 100.',
        'A tens rod = 10.',
        'How many tens fit in 100? 100 ÷ 10 = 10.',
        '1 hundred = 10 tens.'
      ],
      correctAnswerExplanation: '1 hundred equals 10 tens. The answer is 10.'
    }
  }),

  // Group 3: reversed_tens_ones_trap (q103–q108)

  _l23Q(103, {
    subSkill: 'build_from_parts',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'hard',
    prompt: '1 hundred, 2 tens, and 0 ones = ___',
    visual: null,
    answer: '120',
    choices: ['20', '102', '120', '200'],
    hint: '2 tens = 20. Add that to 100.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '2 tens goes in the tens place',
      teachingSteps: [
        '1 hundred = 100.',
        '2 tens = 20 (not 2).',
        '0 ones = 0.',
        '100 + 20 + 0 = 120, not 102.'
      ],
      correctAnswerExplanation: '1 hundred, 2 tens, 0 ones = 120. The 2 is in the tens place.'
    }
  }),

  _l23Q(104, {
    subSkill: 'build_from_parts',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'hard',
    prompt: '1 hundred, 1 ten, and 0 ones = ___',
    visual: null,
    answer: '110',
    choices: ['11', '101', '110', '111'],
    hint: '1 ten = 10. Add 10 to 100.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '1 ten means add 10, not 1',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '0 ones = 0.',
        '100 + 10 + 0 = 110, not 101.'
      ],
      correctAnswerExplanation: '1 hundred, 1 ten, 0 ones = 110. The 1 in tens is worth 10.'
    }
  }),

  _l23Q(105, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '1 hundred, 0 tens, and 2 ones = ___',
    visual: null,
    answer: '102',
    choices: ['20', '102', '120', '200'],
    hint: '0 tens means no rods. 2 ones means 2 cubes.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '0 tens, 2 ones = 102, not 120',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '2 ones = 2.',
        '100 + 0 + 2 = 102, not 120.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 2 ones = 102. The 2 is in the ones place.'
    }
  }),

  _l23Q(106, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: '1 hundred, 0 tens, and 1 one = ___',
    visual: null,
    answer: '101',
    choices: ['11', '101', '110', '111'],
    hint: '0 tens and 1 one. The 1 one goes in the ones place.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '0 tens, 1 one = 101, not 110',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '1 one = 1.',
        '100 + 0 + 1 = 101, not 110.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 1 one = 101. The 1 one is in the ones place.'
    }
  }),

  _l23Q(107, {
    subSkill: 'build_from_parts',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'hard',
    prompt: 'A student says 1 hundred, 2 tens, 0 ones = 102. What should it be?',
    visual: null,
    answer: '120',
    choices: ['20', '102', '120', '200'],
    hint: '2 tens = 20. The 2 goes in the tens place.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '2 in tens place makes 120',
      teachingSteps: [
        'The student put the 2 in the ones place.',
        '2 tens means the 2 goes in the tens place.',
        '1 hundred, 2 tens, 0 ones = 120.',
        '102 would be 1 hundred, 0 tens, 2 ones.'
      ],
      correctAnswerExplanation: '1 hundred, 2 tens, 0 ones = 120, not 102.'
    }
  }),

  _l23Q(108, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'A student says 1 hundred, 0 tens, 5 ones = 150. What should it be?',
    visual: null,
    answer: '105',
    choices: ['15', '105', '150', '500'],
    hint: '0 tens means no tens. 5 ones means the 5 is in the ones place.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '5 ones is in the ones place: 105',
      teachingSteps: [
        'The student put the 5 in the tens place.',
        '5 ones means the 5 goes in the ones place.',
        '1 hundred, 0 tens, 5 ones = 105.',
        '150 would be 1 hundred, 5 tens, 0 ones.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 5 ones = 105, not 150.'
    }
  }),

  // Group 4: zero_confusion hard (q109–q113)

  _l23Q(109, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'How many tens does 105 have?',
    visual: null,
    answer: '0',
    choices: ['0', '1', '5', '10'],
    hint: 'Look at the middle digit of 105.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '105 has 0 tens',
      teachingSteps: [
        '105 has three digits: 1, 0, 5.',
        'The middle digit (0) is in the tens place.',
        '0 in the tens place means 0 tens.',
        '105 = 1 hundred, 0 tens, 5 ones.'
      ],
      correctAnswerExplanation: '105 has 0 in the tens place, so 0 tens.'
    }
  }),

  _l23Q(110, {
    subSkill: 'count_ones_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'hard',
    prompt: 'Which number has 0 ones?',
    visual: null,
    answer: '110',
    choices: ['105', '107', '110', '115'],
    hint: 'Look for a number that ends in 0.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'A number ending in 0 has 0 ones',
      teachingSteps: [
        'The ones digit is the last digit.',
        '105 ends in 5 — has 5 ones.',
        '107 ends in 7 — has 7 ones.',
        '110 ends in 0 — has 0 ones.'
      ],
      correctAnswerExplanation: '110 ends in 0, so it has 0 ones.'
    }
  }),

  _l23Q(111, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'Which number has 0 tens?',
    visual: null,
    answer: '105',
    choices: ['110', '115', '105', '120'],
    hint: 'Look for a number with 0 in the tens place (the middle digit).',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'A 0 in the middle means 0 tens',
      teachingSteps: [
        'The tens digit is the middle digit.',
        '110: middle digit is 1 — has 1 ten.',
        '115: middle digit is 1 — has 1 ten.',
        '105: middle digit is 0 — has 0 tens.'
      ],
      correctAnswerExplanation: '105 has 0 in the tens place, so 0 tens.'
    }
  }),

  _l23Q(112, {
    subSkill: 'count_ones_in_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'hard',
    prompt: 'A model shows 1 flat and 2 rods. How many ones cubes are there?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: '0',
    choices: ['0', '2', '10', '20'],
    hint: 'Look for orange cubes. If there are none, the answer is 0.',
    intervention: {
      errorTag: 'err_ignore_ones',
      title: 'No cubes means 0 ones',
      teachingSteps: [
        'Count the orange cubes in the model.',
        'There are no orange cubes.',
        '0 cubes = 0 ones.',
        'This model shows 120 = 1 hundred, 2 tens, 0 ones.'
      ],
      correctAnswerExplanation: 'No orange cubes in this model means 0 ones.'
    }
  }),

  _l23Q(113, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'A model shows 1 flat and 5 cubes. How many tens rods are there?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 5 } },
    answer: '0',
    choices: ['0', '1', '5', '15'],
    hint: 'Look for blue rods. If there are none, the answer is 0.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: 'No rods means 0 tens',
      teachingSteps: [
        'Count the blue rods in the model.',
        'There are no blue rods.',
        '0 rods = 0 tens.',
        'This model shows 105 = 1 hundred, 0 tens, 5 ones.'
      ],
      correctAnswerExplanation: 'No blue rods in this model means 0 tens.'
    }
  }),

  // Group 5: error_repair (q114–q120)

  _l23Q(114, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'hard',
    prompt: 'A student says 114 has 4 tens. What is the correct number of tens in 114?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '4', '14'],
    hint: 'The middle digit of 114 is the tens digit.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '114 has 1 ten, not 4',
      teachingSteps: [
        'In 114, the digits are 1, 1, 4.',
        'The middle digit (1) is in the tens place.',
        'The last digit (4) is in the ones place.',
        '114 has 1 ten and 4 ones.'
      ],
      correctAnswerExplanation: '114 has 1 in the tens place, so 1 ten. The 4 is in the ones place.'
    }
  }),

  _l23Q(115, {
    subSkill: 'count_hundreds',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'A student says 110 has 0 hundreds. How many hundreds does 110 really have?',
    visual: null,
    answer: '1',
    choices: ['0', '1', '10', '11'],
    hint: 'The first digit of 110 tells you the hundreds.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '110 has 1 hundred',
      teachingSteps: [
        'The student ignored the hundreds digit.',
        'In 110, the first digit (1) is in the hundreds place.',
        '1 in the hundreds place = 1 hundred.',
        '110 has 1 hundred.'
      ],
      correctAnswerExplanation: '110 has 1 in the hundreds place, so 1 hundred.'
    }
  }),

  _l23Q(116, {
    subSkill: 'build_from_parts',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'A student writes 1 hundred, 0 tens, 5 ones = 150. What is the correct answer?',
    visual: null,
    answer: '105',
    choices: ['15', '105', '150', '500'],
    hint: '0 tens means no tens. 5 ones goes in the ones place.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '0 tens + 5 ones = 105, not 150',
      teachingSteps: [
        '1 hundred = 100.',
        '0 tens = 0.',
        '5 ones = 5.',
        '100 + 0 + 5 = 105.'
      ],
      correctAnswerExplanation: '1 hundred, 0 tens, 5 ones = 105. The 5 is in the ones place.'
    }
  }),

  _l23Q(117, {
    subSkill: 'count_tens_in_120range',
    keyIdea: 'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
    difficulty: 'hard',
    prompt: 'A student says 105 = 1 hundred and 5 tens. How many tens does 105 really have?',
    visual: null,
    answer: '0',
    choices: ['0', '1', '5', '10'],
    hint: 'The middle digit of 105 is the tens digit.',
    intervention: {
      errorTag: 'err_ignore_tens',
      title: '105 has 0 tens, not 5',
      teachingSteps: [
        'In 105, the digits are 1, 0, 5.',
        'The middle digit (0) is in the tens place.',
        'The 5 is in the ones place, not tens.',
        '105 = 1 hundred, 0 tens, 5 ones.'
      ],
      correctAnswerExplanation: '105 has 0 tens. The student mistook the ones digit (5) for tens.'
    }
  }),

  _l23Q(118, {
    subSkill: 'read_base10_model',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'hard',
    prompt: 'A model shows 1 flat and 2 rods. A student says the number is 102. What is the correct number?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: '120',
    choices: ['20', '102', '120', '200'],
    hint: '2 rods = 2 tens = 20. Add 20 to 100.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '1 flat + 2 rods = 120, not 102',
      teachingSteps: [
        'The student confused the rods with ones.',
        'Each rod is a ten, not a one.',
        '1 flat = 100. 2 rods = 20.',
        '100 + 20 = 120.'
      ],
      correctAnswerExplanation: '1 flat and 2 rods = 100 + 20 = 120. Rods are tens, not ones.'
    }
  }),

  _l23Q(119, {
    subSkill: 'build_from_parts',
    keyIdea: 'After 100, tens and ones still work the same way.',
    difficulty: 'hard',
    prompt: 'A student says 1 hundred + 1 ten = 11. What should it equal?',
    visual: null,
    answer: '110',
    choices: ['11', '101', '110', '111'],
    hint: '1 ten = 10. Add 10 to 100.',
    intervention: {
      errorTag: 'err_hundred_confusion',
      title: '1 hundred + 1 ten = 110',
      teachingSteps: [
        '1 hundred = 100.',
        '1 ten = 10.',
        '100 + 10 = 110.',
        'The student forgot that 1 hundred = 100, not 1.'
      ],
      correctAnswerExplanation: '1 hundred + 1 ten = 100 + 10 = 110.'
    }
  }),

  _l23Q(120, {
    subSkill: 'count_ones_in_120range',
    keyIdea: '120 means 1 hundred, 2 tens, and 0 ones.',
    difficulty: 'hard',
    prompt: 'A student says 120 = 1 hundred, 0 tens, and 2 ones. How many ones does 120 really have?',
    visual: null,
    answer: '0',
    choices: ['0', '2', '10', '20'],
    hint: 'Look at the last digit of 120.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '120 has 0 ones, not 2',
      teachingSteps: [
        'In 120, the digits are 1, 2, 0.',
        'The last digit (0) is in the ones place.',
        'The 2 is in the tens place, not ones.',
        '120 = 1 hundred, 2 tens, 0 ones.'
      ],
      correctAnswerExplanation: '120 has 0 in the ones place. The 2 is in the tens place.'
    }
  })

];

// ── L2.4 helpers ──────────────────────────────────────────────────────────────
var _w24ones = [
  'zero','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
  'seventeen','eighteen','nineteen'
];
var _w24tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function _numToWord24(n) {
  if (n < 20) return _w24ones[n];
  if (n < 100) {
    var t = _w24tens[Math.floor(n / 10)];
    var o = n % 10;
    return o === 0 ? t : (t + '-' + _w24ones[o]);
  }
  var r = n - 100;
  return r === 0 ? 'one hundred' : ('one hundred ' + _numToWord24(r));
}
function _numToExp24(n) {
  if (n < 100) return (Math.floor(n / 10) * 10) + ' + ' + (n % 10);
  var r = n - 100;
  return '100 + ' + (Math.floor(r / 10) * 10) + ' + ' + (r % 10);
}

// ── L2.4 factory ──────────────────────────────────────────────────────────────
function _l24Q(n, o) {
  return {
    id: 'g1-u2-l4-q-' + String(n).padStart(3, '0'),
    teks: ['1.2C'],
    lessonId: 'g1-u2-l4',
    skill: 'represent_numbers_to_120',
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

// ── L2.4 worked examples ──────────────────────────────────────────────────────
const _l24Examples = [
  {
    title: '47 in Three Forms',
    steps: [
      'Standard form uses digits: 47.',
      'Expanded form shows each place value: 40 + 7.',
      'Word form writes it in words: forty-seven.',
      '4 tens rods and 7 ones cubes show the same amount.'
    ],
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 7 } }
  },
  {
    title: '50 in Three Forms',
    steps: [
      'Standard form: 50.',
      'Expanded form: 50 + 0. The + 0 shows the ones place is empty.',
      'Word form: fifty.',
      '5 tens rods and 0 ones cubes in the base-10 model.'
    ],
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 0 } }
  },
  {
    title: '113 in Three Forms',
    steps: [
      'Standard form: 113.',
      'Expanded form: 100 + 10 + 3. Each place shown as its value.',
      'Word form: one hundred thirteen.',
      '1 hundreds flat, 1 tens rod, and 3 ones cubes.'
    ],
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 3 } }
  }
];

// ── L2.4 quiz bank ────────────────────────────────────────────────────────────
const _l24QuizBank = [
  // ── easy (q1–q50) ─────────────────────────────────────────────────────────

  // Cat 1: standard → expanded, 2-digit (q1–q10)
  _l24Q(1, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 24?',
    answer: '20 + 4',
    choices: ['20 + 4', '2 + 4', '40 + 2', '20 + 40'],
    hint: 'The 2 is in the tens place. 2 tens = 20.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens place means tens, not the digit',
      teachingSteps: [
        '24 has 2 in the tens place and 4 in the ones place.',
        '2 tens is worth 20, not just 2.',
        'Expanded form: 20 + 4.'
      ],
      correctAnswerExplanation: '24 = 20 + 4. The digit 2 means 2 tens = 20.'
    }
  }),
  _l24Q(2, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 31?',
    answer: '30 + 1',
    choices: ['30 + 1', '3 + 1', '10 + 3', '30 + 10'],
    hint: 'The 3 is in the tens place. 3 tens = 30.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens digit names tens, not ones',
      teachingSteps: [
        '31 has 3 in the tens place and 1 in the ones place.',
        '3 tens is worth 30.',
        'Expanded form: 30 + 1.'
      ],
      correctAnswerExplanation: '31 = 30 + 1. The 3 means 3 tens = 30.'
    }
  }),
  _l24Q(3, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 43?',
    answer: '40 + 3',
    choices: ['40 + 3', '4 + 3', '30 + 4', '40 + 30'],
    hint: 'The 4 is in the tens place. 4 tens = 40.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens digit shows tens value',
      teachingSteps: [
        '43 has 4 in the tens place and 3 in the ones place.',
        '4 tens is worth 40, not just 4.',
        'Expanded form: 40 + 3.'
      ],
      correctAnswerExplanation: '43 = 40 + 3. The 4 means 4 tens = 40.'
    }
  }),
  _l24Q(4, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 62?',
    answer: '60 + 2',
    choices: ['60 + 2', '6 + 2', '20 + 6', '60 + 20'],
    hint: 'The 6 is in the tens place. 6 tens = 60.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens place value is larger than the digit',
      teachingSteps: [
        '62 has 6 in the tens place and 2 in the ones place.',
        '6 tens is 60, not 6.',
        'Expanded form: 60 + 2.'
      ],
      correctAnswerExplanation: '62 = 60 + 2. The digit 6 means 6 tens = 60.'
    }
  }),
  _l24Q(5, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 75?',
    answer: '70 + 5',
    choices: ['70 + 5', '7 + 5', '50 + 7', '70 + 50'],
    hint: 'The 7 is in the tens place. 7 tens = 70.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Expanded form uses place values, not digits',
      teachingSteps: [
        '75 has 7 in the tens place and 5 in the ones place.',
        '7 tens is worth 70.',
        'Expanded form: 70 + 5.'
      ],
      correctAnswerExplanation: '75 = 70 + 5. The 7 means 7 tens = 70.'
    }
  }),
  _l24Q(6, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 86?',
    answer: '80 + 6',
    choices: ['80 + 6', '8 + 6', '60 + 8', '80 + 60'],
    hint: 'The 8 is in the tens place. 8 tens = 80.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens digit value is 10 times the digit',
      teachingSteps: [
        '86 has 8 in the tens place and 6 in the ones place.',
        '8 tens is worth 80.',
        'Expanded form: 80 + 6.'
      ],
      correctAnswerExplanation: '86 = 80 + 6. The 8 means 8 tens = 80.'
    }
  }),
  _l24Q(7, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: 'What is the expanded form of 93?',
    answer: '90 + 3',
    choices: ['90 + 3', '9 + 3', '30 + 9', '90 + 30'],
    hint: 'The 9 is in the tens place. 9 tens = 90.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens place is worth ten times the digit',
      teachingSteps: [
        '93 has 9 in the tens place and 3 in the ones place.',
        '9 tens is worth 90, not just 9.',
        'Expanded form: 90 + 3.'
      ],
      correctAnswerExplanation: '93 = 90 + 3. The 9 means 9 tens = 90.'
    }
  }),
  _l24Q(8, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: 'What is the expanded form of 30?',
    answer: '30 + 0',
    choices: ['30 + 0', '3 + 0', '30 + 3', '20 + 0'],
    hint: '30 has 3 tens and 0 ones. Write 30 + 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Show the ones place even when it is zero',
      teachingSteps: [
        '30 has 3 in the tens place and 0 in the ones place.',
        'We write + 0 to show the ones place is empty.',
        'Expanded form: 30 + 0.'
      ],
      correctAnswerExplanation: '30 = 30 + 0. The + 0 shows the ones place is empty.'
    }
  }),
  _l24Q(9, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: 'What is the expanded form of 60?',
    answer: '60 + 0',
    choices: ['60 + 0', '6 + 0', '60 + 6', '70 + 0'],
    hint: '60 has 6 tens and 0 ones. Write 60 + 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Show every place value, even empty ones',
      teachingSteps: [
        '60 has 6 in the tens place and 0 in the ones place.',
        'We still write the + 0 to show the ones place is empty.',
        'Expanded form: 60 + 0.'
      ],
      correctAnswerExplanation: '60 = 60 + 0. The + 0 shows the ones place is empty.'
    }
  }),
  _l24Q(10, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: 'What is the expanded form of 80?',
    answer: '80 + 0',
    choices: ['80 + 0', '8 + 0', '80 + 8', '70 + 0'],
    hint: '80 has 8 tens and 0 ones. The ones place is empty.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Zero ones still gets written in expanded form',
      teachingSteps: [
        '80 has 8 tens and 0 ones.',
        'We write 80 + 0 to show both places.',
        'The + 0 reminds us the ones place has nothing in it.'
      ],
      correctAnswerExplanation: '80 = 80 + 0. We include the + 0 to show the ones place is empty.'
    }
  }),

  // Cat 2: expanded → standard, 2-digit (q11–q20)
  _l24Q(11, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '20 + 5 = ___',
    answer: '25',
    choices: ['25', '52', '205', '20'],
    hint: '20 is 2 tens. Add 5 ones. Tens come first.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens come first, then ones',
      teachingSteps: [
        '20 + 5 means 2 tens and 5 ones.',
        'In standard form, tens come first: 25.',
        '52 would mean 5 tens and 2 ones — that is different.'
      ],
      correctAnswerExplanation: '20 + 5 = 25. Two tens and five ones make 25.'
    }
  }),
  _l24Q(12, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: '30 + 0 = ___',
    answer: '30',
    choices: ['30', '3', '300', '31'],
    hint: '30 is 3 tens. Plus 0 ones. The number is 30.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: '3 tens is 30, not 3',
      teachingSteps: [
        '30 + 0 means 3 tens and 0 ones.',
        '3 tens is the number 30, not just 3.',
        'Standard form: 30.'
      ],
      correctAnswerExplanation: '30 + 0 = 30. Three tens and zero ones is 30.'
    }
  }),
  _l24Q(13, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '40 + 6 = ___',
    answer: '46',
    choices: ['46', '64', '406', '40'],
    hint: '40 is 4 tens. Add 6 ones. Write the tens digit first.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'The tens digit comes before the ones digit',
      teachingSteps: [
        '40 + 6 means 4 tens and 6 ones.',
        'Write the tens digit first: 4, then the ones digit: 6.',
        'Standard form: 46, not 64.'
      ],
      correctAnswerExplanation: '40 + 6 = 46. Four tens and six ones is 46.'
    }
  }),
  _l24Q(14, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '50 + 3 = ___',
    answer: '53',
    choices: ['53', '35', '503', '50'],
    hint: '50 is 5 tens. Add 3 ones. The tens digit goes first.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens digit before ones digit in standard form',
      teachingSteps: [
        '50 + 3 means 5 tens and 3 ones.',
        'Standard form: 53. The 5 goes in the tens place.',
        '35 would be 3 tens and 5 ones — the opposite.'
      ],
      correctAnswerExplanation: '50 + 3 = 53. Five tens and three ones make 53.'
    }
  }),
  _l24Q(15, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: '60 + 0 = ___',
    answer: '60',
    choices: ['60', '6', '600', '61'],
    hint: '60 is 6 tens. Plus 0 ones. What is the number?',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Six tens is 60, not just 6',
      teachingSteps: [
        '60 + 0 means 6 tens and 0 ones.',
        '6 tens makes the number 60.',
        'Standard form: 60.'
      ],
      correctAnswerExplanation: '60 + 0 = 60. Six tens and zero ones is 60.'
    }
  }),
  _l24Q(16, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '70 + 8 = ___',
    answer: '78',
    choices: ['78', '87', '708', '70'],
    hint: '70 is 7 tens. Add 8 ones. Write tens first.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens come before ones in the number',
      teachingSteps: [
        '70 + 8 means 7 tens and 8 ones.',
        'Write the 7 first (tens place), then 8 (ones place).',
        'Standard form: 78.'
      ],
      correctAnswerExplanation: '70 + 8 = 78. Seven tens and eight ones make 78.'
    }
  }),
  _l24Q(17, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '80 + 4 = ___',
    answer: '84',
    choices: ['84', '48', '804', '80'],
    hint: '80 is 8 tens. Add 4 ones. The 8 goes in the tens place.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'The larger value goes first',
      teachingSteps: [
        '80 + 4 means 8 tens and 4 ones.',
        'Standard form: 84. The 8 goes in the tens place.',
        '48 would be 4 tens and 8 ones — a different number.'
      ],
      correctAnswerExplanation: '80 + 4 = 84. Eight tens and four ones make 84.'
    }
  }),
  _l24Q(18, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '90 + 1 = ___',
    answer: '91',
    choices: ['91', '19', '901', '90'],
    hint: '90 is 9 tens. Add 1 one. Write 9 first, then 1.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens go first in standard form',
      teachingSteps: [
        '90 + 1 means 9 tens and 1 one.',
        'Standard form: 91. The 9 goes in the tens place.',
        '19 is a different number — it has 1 ten and 9 ones.'
      ],
      correctAnswerExplanation: '90 + 1 = 91. Nine tens and one one make 91.'
    }
  }),
  _l24Q(19, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: '20 + 0 = ___',
    answer: '20',
    choices: ['20', '2', '200', '22'],
    hint: '20 is 2 tens. Plus 0 ones. The number is 20.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Two tens is 20, not 2',
      teachingSteps: [
        '20 + 0 means 2 tens and 0 ones.',
        '2 tens makes the number 20, not just 2.',
        'Standard form: 20.'
      ],
      correctAnswerExplanation: '20 + 0 = 20. Two tens and zero ones is the number 20.'
    }
  }),
  _l24Q(20, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'easy',
    prompt: '30 + 7 = ___',
    answer: '37',
    choices: ['37', '73', '307', '30'],
    hint: '30 is 3 tens. Add 7 ones. Write tens first, then ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens digit goes in the tens place',
      teachingSteps: [
        '30 + 7 means 3 tens and 7 ones.',
        'Standard form: 37. The 3 is in the tens place.',
        '73 would be 7 tens and 3 ones — different from 37.'
      ],
      correctAnswerExplanation: '30 + 7 = 37. Three tens and seven ones make 37.'
    }
  }),

  // Cat 5: visual → expanded, 2-digit (q21–q30)
  _l24Q(21, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 3 } },
    answer: '20 + 3',
    choices: ['20 + 3', '2 + 3', '30 + 2', '20 + 30'],
    hint: 'Count the rods (tens) and cubes (ones). Write their values.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Each rod is worth 10, not 1',
      teachingSteps: [
        '2 blue rods = 2 tens = 20.',
        '3 orange cubes = 3 ones = 3.',
        'Expanded form: 20 + 3.'
      ],
      correctAnswerExplanation: '2 rods (20) + 3 cubes (3) = 20 + 3.'
    }
  }),
  _l24Q(22, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 1 } },
    answer: '40 + 1',
    choices: ['40 + 1', '4 + 1', '10 + 4', '40 + 10'],
    hint: 'Count the tens rods first, then the ones cubes.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Rods show tens, cubes show ones',
      teachingSteps: [
        '4 blue rods = 4 tens = 40.',
        '1 orange cube = 1 one = 1.',
        'Expanded form: 40 + 1.'
      ],
      correctAnswerExplanation: '4 rods (40) + 1 cube (1) = 40 + 1.'
    }
  }),
  _l24Q(23, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 2 } },
    answer: '50 + 2',
    choices: ['50 + 2', '5 + 2', '20 + 5', '50 + 20'],
    hint: '5 rods = 50. 2 cubes = 2.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Place value tells you the worth, not the count',
      teachingSteps: [
        '5 blue rods = 5 tens = 50.',
        '2 orange cubes = 2 ones = 2.',
        'Expanded form: 50 + 2.'
      ],
      correctAnswerExplanation: '5 rods (50) + 2 cubes (2) = 50 + 2.'
    }
  }),
  _l24Q(24, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 3, ones: 4 } },
    answer: '30 + 4',
    choices: ['30 + 4', '3 + 4', '40 + 3', '30 + 40'],
    hint: '3 rods = 30. 4 cubes = 4. Write the tens first.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Rods are worth 10 each',
      teachingSteps: [
        '3 blue rods = 3 tens = 30.',
        '4 orange cubes = 4 ones = 4.',
        'Expanded form: 30 + 4.'
      ],
      correctAnswerExplanation: '3 rods (30) + 4 cubes (4) = 30 + 4.'
    }
  }),
  _l24Q(25, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 6, ones: 1 } },
    answer: '60 + 1',
    choices: ['60 + 1', '6 + 1', '10 + 6', '60 + 10'],
    hint: '6 rods = 60. 1 cube = 1.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Each tens rod equals 10',
      teachingSteps: [
        '6 blue rods = 6 tens = 60.',
        '1 orange cube = 1 one = 1.',
        'Expanded form: 60 + 1.'
      ],
      correctAnswerExplanation: '6 rods (60) + 1 cube (1) = 60 + 1.'
    }
  }),
  _l24Q(26, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 7, ones: 3 } },
    answer: '70 + 3',
    choices: ['70 + 3', '7 + 3', '30 + 7', '70 + 30'],
    hint: '7 rods = 70. 3 cubes = 3.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Count rods as tens, cubes as ones',
      teachingSteps: [
        '7 blue rods = 7 tens = 70.',
        '3 orange cubes = 3 ones = 3.',
        'Expanded form: 70 + 3.'
      ],
      correctAnswerExplanation: '7 rods (70) + 3 cubes (3) = 70 + 3.'
    }
  }),
  _l24Q(27, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 8, ones: 5 } },
    answer: '80 + 5',
    choices: ['80 + 5', '8 + 5', '50 + 8', '80 + 50'],
    hint: '8 rods = 80. 5 cubes = 5.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens rods show the tens value',
      teachingSteps: [
        '8 blue rods = 8 tens = 80.',
        '5 orange cubes = 5 ones = 5.',
        'Expanded form: 80 + 5.'
      ],
      correctAnswerExplanation: '8 rods (80) + 5 cubes (5) = 80 + 5.'
    }
  }),
  _l24Q(28, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 9, ones: 2 } },
    answer: '90 + 2',
    choices: ['90 + 2', '9 + 2', '20 + 9', '90 + 20'],
    hint: '9 rods = 90. 2 cubes = 2.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Each rod stands for ten, not one',
      teachingSteps: [
        '9 blue rods = 9 tens = 90.',
        '2 orange cubes = 2 ones = 2.',
        'Expanded form: 90 + 2.'
      ],
      correctAnswerExplanation: '9 rods (90) + 2 cubes (2) = 90 + 2.'
    }
  }),
  _l24Q(29, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 2, ones: 0 } },
    answer: '20 + 0',
    choices: ['20 + 0', '2 + 0', '20', '20 + 2'],
    hint: 'There are no ones cubes. Write + 0 for the empty ones place.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Show the empty ones place with + 0',
      teachingSteps: [
        '2 blue rods = 2 tens = 20.',
        'No orange cubes means 0 ones.',
        'Expanded form: 20 + 0.'
      ],
      correctAnswerExplanation: '2 rods (20) + 0 cubes (0) = 20 + 0.'
    }
  }),
  _l24Q(30, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 5, difficulty: 'easy',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 4, ones: 0 } },
    answer: '40 + 0',
    choices: ['40 + 0', '4 + 0', '40', '40 + 4'],
    hint: 'Count the rods. There are no cubes — write + 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Always include the ones place in expanded form',
      teachingSteps: [
        '4 blue rods = 4 tens = 40.',
        'No orange cubes = 0 ones.',
        'Expanded form: 40 + 0. We include the + 0.'
      ],
      correctAnswerExplanation: '4 rods (40) + 0 cubes (0) = 40 + 0.'
    }
  }),

  // Cat 3: standard → word, 2-digit (q31–q40)
  _l24Q(31, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 20 in word form.',
    answer: 'twenty',
    choices: ['twenty', 'two', 'twenty-zero', 'two-zero'],
    hint: '20 is a decade number. It has a special word.',
    intervention: {
      errorTag: 'err_word_form_digit_not_word',
      title: '20 is called twenty',
      teachingSteps: [
        '20 is a decade: 2 tens and 0 ones.',
        'The word for 20 is "twenty," not "two."',
        'Decade words are special: twenty, thirty, forty, fifty...'
      ],
      correctAnswerExplanation: '20 in word form is "twenty."'
    }
  }),
  _l24Q(32, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 30 in word form.',
    answer: 'thirty',
    choices: ['thirty', 'three', 'thirty-zero', 'three-zero'],
    hint: '30 is a decade number. The -ty ending signals a decade.',
    intervention: {
      errorTag: 'err_word_form_digit_not_word',
      title: '30 is called thirty',
      teachingSteps: [
        '30 is a decade: 3 tens and 0 ones.',
        'The word for 30 is "thirty," not "three."',
        'The -ty ending signals a decade number.'
      ],
      correctAnswerExplanation: '30 in word form is "thirty."'
    }
  }),
  _l24Q(33, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 40 in word form.',
    answer: 'forty',
    choices: ['forty', 'fourty', 'four', 'four-zero'],
    hint: '40 is forty — watch the spelling: f-o-r-t-y.',
    intervention: {
      errorTag: 'err_word_form_spelling',
      title: '40 is "forty" — no u after the o',
      teachingSteps: [
        '40 is a decade number: 4 tens.',
        'The word is "forty" — spelled f-o-r-t-y.',
        '"Fourty" is a common misspelling. The correct word has no u.'
      ],
      correctAnswerExplanation: '40 in word form is "forty." Spelled f-o-r-t-y.'
    }
  }),
  _l24Q(34, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 50 in word form.',
    answer: 'fifty',
    choices: ['fifty', 'fivety', 'five', 'five-zero'],
    hint: '50 is fifty — it uses "fif," not "five."',
    intervention: {
      errorTag: 'err_word_form_spelling',
      title: '50 is "fifty" — not "fivety"',
      teachingSteps: [
        '50 is a decade number: 5 tens.',
        'The word is "fifty," spelled f-i-f-t-y.',
        '"Fivety" is not a word — the correct word is "fifty."'
      ],
      correctAnswerExplanation: '50 in word form is "fifty."'
    }
  }),
  _l24Q(35, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 60 in word form.',
    answer: 'sixty',
    choices: ['sixty', 'sixteen', 'six', 'sixty-zero'],
    hint: '60 is sixty — not sixteen. Sixty has 6 tens.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Sixty (60) is not sixteen (16)',
      teachingSteps: [
        '60 has 6 tens. The word is "sixty."',
        '"Sixteen" is the word for 16, which has only 1 ten.',
        'Sixty = 60; sixteen = 16.'
      ],
      correctAnswerExplanation: '60 in word form is "sixty." Sixteen is the word for 16.'
    }
  }),
  _l24Q(36, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 70 in word form.',
    answer: 'seventy',
    choices: ['seventy', 'seventeen', 'seven', 'seventy-zero'],
    hint: '70 is seventy. Seventeen is a different number (17).',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Seventy (70) is not seventeen (17)',
      teachingSteps: [
        '70 has 7 tens. The word is "seventy."',
        '"Seventeen" is the word for 17, a teen number.',
        'Seventy = 70; seventeen = 17.'
      ],
      correctAnswerExplanation: '70 in word form is "seventy."'
    }
  }),
  _l24Q(37, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 80 in word form.',
    answer: 'eighty',
    choices: ['eighty', 'eighteen', 'eight', 'eighty-zero'],
    hint: '80 is eighty. Eighteen is 18.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Eighty (80) is not eighteen (18)',
      teachingSteps: [
        '80 has 8 tens. The word is "eighty."',
        '"Eighteen" is 18, a teen number with 1 ten.',
        'Eighty = 80; eighteen = 18.'
      ],
      correctAnswerExplanation: '80 in word form is "eighty."'
    }
  }),
  _l24Q(38, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 90 in word form.',
    answer: 'ninety',
    choices: ['ninety', 'nineteen', 'nine', 'ninety-zero'],
    hint: '90 is ninety. Nineteen is 19.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Ninety (90) is not nineteen (19)',
      teachingSteps: [
        '90 has 9 tens. The word is "ninety."',
        '"Nineteen" is 19, a teen number.',
        'Ninety = 90; nineteen = 19.'
      ],
      correctAnswerExplanation: '90 in word form is "ninety."'
    }
  }),
  _l24Q(39, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 21 in word form.',
    answer: 'twenty-one',
    choices: ['twenty-one', 'twelve', 'one-twenty', 'twenty-ten'],
    hint: '21 = 2 tens and 1 one. Say the tens first: twenty-one.',
    intervention: {
      errorTag: 'err_word_form_reversed',
      title: 'Say tens first: twenty-one, not twelve',
      teachingSteps: [
        '21 has 2 tens and 1 one.',
        'Word form: say the tens first — "twenty," then the ones — "one."',
        '21 = "twenty-one." Twelve (12) is a different number.'
      ],
      correctAnswerExplanation: '21 in word form is "twenty-one." Twelve is the word for 12.'
    }
  }),
  _l24Q(40, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'Write 32 in word form.',
    answer: 'thirty-two',
    choices: ['thirty-two', 'twenty-three', 'two-thirty', 'thirty'],
    hint: '32 = 3 tens and 2 ones. Tens word first, then ones word.',
    intervention: {
      errorTag: 'err_word_form_reversed',
      title: 'Tens word comes before ones word',
      teachingSteps: [
        '32 has 3 tens and 2 ones.',
        'Word form: "thirty" (for 3 tens) then "two" (for 2 ones).',
        '32 = "thirty-two." Twenty-three is 23, a different number.'
      ],
      correctAnswerExplanation: '32 in word form is "thirty-two."'
    }
  }),

  // Cat 4: word → standard, 2-digit (q41–q50)
  _l24Q(41, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "twenty"?',
    answer: '20',
    choices: ['20', '2', '200', '12'],
    hint: 'Twenty is a decade. It has 2 tens and 0 ones.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Twenty means 2 tens = 20',
      teachingSteps: [
        '"Twenty" means 2 tens.',
        '2 tens is the number 20, not just 2.',
        'Standard form: 20.'
      ],
      correctAnswerExplanation: '"Twenty" = 20. Two tens is the number 20.'
    }
  }),
  _l24Q(42, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "thirty"?',
    answer: '30',
    choices: ['30', '3', '300', '13'],
    hint: 'Thirty means 3 tens. What is 3 tens as a number?',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Thirty means 3 tens = 30',
      teachingSteps: [
        '"Thirty" means 3 tens.',
        '3 tens is 30.',
        'Standard form: 30.'
      ],
      correctAnswerExplanation: '"Thirty" = 30. Three tens is the number 30.'
    }
  }),
  _l24Q(43, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "forty"?',
    answer: '40',
    choices: ['40', '4', '400', '14'],
    hint: 'Forty means 4 tens. That is the number 40.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Forty means 4 tens = 40',
      teachingSteps: [
        '"Forty" means 4 tens.',
        '4 tens is 40.',
        'Standard form: 40.'
      ],
      correctAnswerExplanation: '"Forty" = 40. Four tens is the number 40.'
    }
  }),
  _l24Q(44, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "fifty"?',
    answer: '50',
    choices: ['50', '5', '500', '15'],
    hint: 'Fifty means 5 tens. That is 50.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Fifty means 5 tens = 50',
      teachingSteps: [
        '"Fifty" means 5 tens.',
        '5 tens is 50.',
        'Standard form: 50.'
      ],
      correctAnswerExplanation: '"Fifty" = 50. Five tens is the number 50.'
    }
  }),
  _l24Q(45, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "sixty"?',
    answer: '60',
    choices: ['60', '6', '600', '16'],
    hint: 'Sixty means 6 tens. That is 60.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Sixty means 6 tens = 60',
      teachingSteps: [
        '"Sixty" means 6 tens.',
        '6 tens is 60.',
        'Standard form: 60.'
      ],
      correctAnswerExplanation: '"Sixty" = 60. Six tens is the number 60.'
    }
  }),
  _l24Q(46, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "seventy"?',
    answer: '70',
    choices: ['70', '7', '700', '17'],
    hint: 'Seventy means 7 tens. That is 70.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Seventy means 7 tens = 70',
      teachingSteps: [
        '"Seventy" means 7 tens.',
        '7 tens is 70.',
        'Standard form: 70.'
      ],
      correctAnswerExplanation: '"Seventy" = 70. Seven tens is the number 70.'
    }
  }),
  _l24Q(47, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "eighty"?',
    answer: '80',
    choices: ['80', '8', '800', '18'],
    hint: 'Eighty means 8 tens. That is 80.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Eighty means 8 tens = 80',
      teachingSteps: [
        '"Eighty" means 8 tens.',
        '8 tens is 80.',
        'Standard form: 80.'
      ],
      correctAnswerExplanation: '"Eighty" = 80. Eight tens is the number 80.'
    }
  }),
  _l24Q(48, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "ninety"?',
    answer: '90',
    choices: ['90', '9', '900', '19'],
    hint: 'Ninety means 9 tens. That is 90.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Ninety means 9 tens = 90',
      teachingSteps: [
        '"Ninety" means 9 tens.',
        '9 tens is 90.',
        'Standard form: 90.'
      ],
      correctAnswerExplanation: '"Ninety" = 90. Nine tens is the number 90.'
    }
  }),
  _l24Q(49, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "twenty-one"?',
    answer: '21',
    choices: ['21', '12', '201', '120'],
    hint: 'Twenty is 2 tens. One is 1 one. Tens digit goes first.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Tens digit goes first in standard form',
      teachingSteps: [
        '"Twenty-one" means 2 tens and 1 one.',
        'The tens digit (2) goes first, then the ones digit (1).',
        'Standard form: 21. (Not 12 — that would be twelve.)'
      ],
      correctAnswerExplanation: '"Twenty-one" = 21. The 2 is in the tens place.'
    }
  }),
  _l24Q(50, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'easy',
    prompt: 'What is the standard form of "thirty-two"?',
    answer: '32',
    choices: ['32', '23', '302', '320'],
    hint: 'Thirty is 3 tens. Two is 2 ones. Tens come first.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Read the tens part first',
      teachingSteps: [
        '"Thirty-two" means 3 tens and 2 ones.',
        'The tens digit (3) goes first: 32.',
        '23 would be "twenty-three," which is different.'
      ],
      correctAnswerExplanation: '"Thirty-two" = 32. The 3 is in the tens place.'
    }
  }),

  // ── easy end

  // ── medium (q51–q110) ─────────────────────────────────────────────────────

  // Cat 1 medium: standard → expanded, full 2-digit range (q51–q62)
  _l24Q(51, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 47?',
    answer: '40 + 7',
    choices: ['40 + 7', '4 + 7', '70 + 4', '40 + 70'],
    hint: 'The 4 is in the tens place. 4 tens = 40.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Expanded form uses place values',
      teachingSteps: [
        '47 has 4 in the tens place and 7 in the ones place.',
        '4 tens is worth 40.',
        'Expanded form: 40 + 7.'
      ],
      correctAnswerExplanation: '47 = 40 + 7. The 4 means 4 tens = 40.'
    }
  }),
  _l24Q(52, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 58?',
    answer: '50 + 8',
    choices: ['50 + 8', '5 + 8', '80 + 5', '50 + 80'],
    hint: 'The 5 is in the tens place. 5 tens = 50.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens digit × 10 gives the tens value',
      teachingSteps: [
        '58 has 5 in the tens place and 8 in the ones place.',
        '5 tens = 50.',
        'Expanded form: 50 + 8.'
      ],
      correctAnswerExplanation: '58 = 50 + 8.'
    }
  }),
  _l24Q(53, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 64?',
    answer: '60 + 4',
    choices: ['60 + 4', '6 + 4', '40 + 6', '64 + 0'],
    hint: 'The 6 is in the tens place. 6 tens = 60.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Write the value of each place',
      teachingSteps: [
        '64 has 6 in the tens place and 4 in the ones place.',
        '6 tens = 60.',
        'Expanded form: 60 + 4.'
      ],
      correctAnswerExplanation: '64 = 60 + 4.'
    }
  }),
  _l24Q(54, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 72?',
    answer: '70 + 2',
    choices: ['70 + 2', '7 + 2', '20 + 7', '72 + 0'],
    hint: 'The 7 is in the tens place. 7 tens = 70.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens digit stands for tens, not ones',
      teachingSteps: [
        '72 has 7 in the tens place and 2 in the ones place.',
        '7 tens = 70.',
        'Expanded form: 70 + 2.'
      ],
      correctAnswerExplanation: '72 = 70 + 2.'
    }
  }),
  _l24Q(55, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 89?',
    answer: '80 + 9',
    choices: ['80 + 9', '8 + 9', '90 + 8', '80 + 90'],
    hint: 'The 8 is in the tens place. 8 tens = 80.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Expanded form shows place value, not digits',
      teachingSteps: [
        '89 has 8 in the tens place and 9 in the ones place.',
        '8 tens = 80.',
        'Expanded form: 80 + 9.'
      ],
      correctAnswerExplanation: '89 = 80 + 9.'
    }
  }),
  _l24Q(56, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 5, difficulty: 'medium',
    prompt: 'What is the expanded form of 50?',
    answer: '50 + 0',
    choices: ['50 + 0', '5 + 0', '50', '5 + 5'],
    hint: '50 has 5 tens and 0 ones. Include the + 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Always write + 0 for an empty ones place',
      teachingSteps: [
        '50 has 5 tens and 0 ones.',
        'Expanded form must show both places: 50 + 0.',
        'Writing just "50" is standard form, not expanded form.'
      ],
      correctAnswerExplanation: '50 = 50 + 0. The + 0 shows the ones place is empty.'
    }
  }),
  _l24Q(57, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 5, difficulty: 'medium',
    prompt: 'What is the expanded form of 70?',
    answer: '70 + 0',
    choices: ['70 + 0', '7 + 0', '70', '7 + 10'],
    hint: '70 has 7 tens and 0 ones. Show both places.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Expanded form includes the empty place',
      teachingSteps: [
        '70 has 7 tens and 0 ones.',
        'Both places must appear: 70 + 0.',
        'Just "70" is the standard form, not expanded form.'
      ],
      correctAnswerExplanation: '70 = 70 + 0.'
    }
  }),
  _l24Q(58, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 96?',
    answer: '90 + 6',
    choices: ['90 + 6', '9 + 6', '60 + 9', '90 + 60'],
    hint: 'The 9 is in the tens place. 9 tens = 90.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens place value is 10 times the digit',
      teachingSteps: [
        '96 has 9 in the tens place and 6 in the ones place.',
        '9 tens = 90.',
        'Expanded form: 90 + 6.'
      ],
      correctAnswerExplanation: '96 = 90 + 6.'
    }
  }),
  _l24Q(59, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 15?',
    answer: '10 + 5',
    choices: ['10 + 5', '1 + 5', '50 + 1', '15 + 0'],
    hint: '15 has 1 ten and 5 ones. 1 ten = 10.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Even 1 ten is worth 10, not 1',
      teachingSteps: [
        '15 has 1 in the tens place and 5 in the ones place.',
        '1 ten is worth 10, not just 1.',
        'Expanded form: 10 + 5.'
      ],
      correctAnswerExplanation: '15 = 10 + 5. The 1 in the tens place is worth 10.'
    }
  }),
  _l24Q(60, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 13?',
    answer: '10 + 3',
    choices: ['10 + 3', '1 + 3', '30 + 1', '13 + 0'],
    hint: '13 has 1 ten and 3 ones. 1 ten = 10.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: '1 ten is worth 10',
      teachingSteps: [
        '13 has 1 in the tens place and 3 in the ones place.',
        '1 ten = 10.',
        'Expanded form: 10 + 3.'
      ],
      correctAnswerExplanation: '13 = 10 + 3.'
    }
  }),
  _l24Q(61, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 18?',
    answer: '10 + 8',
    choices: ['10 + 8', '1 + 8', '80 + 1', '18 + 0'],
    hint: '18 has 1 ten and 8 ones.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'One ten equals 10',
      teachingSteps: [
        '18 has 1 in the tens place and 8 in the ones place.',
        '1 ten = 10.',
        'Expanded form: 10 + 8.'
      ],
      correctAnswerExplanation: '18 = 10 + 8.'
    }
  }),
  _l24Q(62, {
    subSkill: 'standard_to_expanded_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: 'What is the expanded form of 35?',
    answer: '30 + 5',
    choices: ['30 + 5', '3 + 5', '50 + 3', '35 + 0'],
    hint: 'The 3 is in the tens place. 3 tens = 30.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Tens place shows a multiple of 10',
      teachingSteps: [
        '35 has 3 in the tens place and 5 in the ones place.',
        '3 tens = 30.',
        'Expanded form: 30 + 5.'
      ],
      correctAnswerExplanation: '35 = 30 + 5.'
    }
  }),

  // Cat 2 medium: expanded → standard, full 2-digit range (q63–q72)
  _l24Q(63, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '10 + 6 = ___',
    answer: '16',
    choices: ['16', '61', '106', '10'],
    hint: '10 is 1 ten. Add 6 ones. Tens digit goes first.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens digit comes before ones digit',
      teachingSteps: [
        '10 + 6 means 1 ten and 6 ones.',
        'Tens digit first: 1, then ones digit: 6.',
        'Standard form: 16.'
      ],
      correctAnswerExplanation: '10 + 6 = 16.'
    }
  }),
  _l24Q(64, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '10 + 9 = ___',
    answer: '19',
    choices: ['19', '91', '109', '10'],
    hint: '10 is 1 ten. Add 9 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'One ten and nine ones makes 19',
      teachingSteps: [
        '10 + 9 means 1 ten and 9 ones.',
        'Standard form: 19.',
        '91 would be 9 tens and 1 one.'
      ],
      correctAnswerExplanation: '10 + 9 = 19.'
    }
  }),
  _l24Q(65, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '50 + 7 = ___',
    answer: '57',
    choices: ['57', '75', '507', '50'],
    hint: '50 is 5 tens. Add 7 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens place value comes first',
      teachingSteps: [
        '50 + 7 means 5 tens and 7 ones.',
        'Standard form: 57.',
        '75 would be 7 tens and 5 ones.'
      ],
      correctAnswerExplanation: '50 + 7 = 57.'
    }
  }),
  _l24Q(66, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '60 + 9 = ___',
    answer: '69',
    choices: ['69', '96', '609', '60'],
    hint: '60 is 6 tens. Add 9 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Six tens and nine ones makes 69',
      teachingSteps: [
        '60 + 9 means 6 tens and 9 ones.',
        'Standard form: 69.',
        '96 would be 9 tens and 6 ones.'
      ],
      correctAnswerExplanation: '60 + 9 = 69.'
    }
  }),
  _l24Q(67, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '70 + 5 = ___',
    answer: '75',
    choices: ['75', '57', '705', '70'],
    hint: '70 is 7 tens. Add 5 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens then ones in standard form',
      teachingSteps: [
        '70 + 5 means 7 tens and 5 ones.',
        'Standard form: 75.',
        '57 would be 5 tens and 7 ones.'
      ],
      correctAnswerExplanation: '70 + 5 = 75.'
    }
  }),
  _l24Q(68, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '40 + 9 = ___',
    answer: '49',
    choices: ['49', '94', '409', '40'],
    hint: '40 is 4 tens. Add 9 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens digit first, ones digit second',
      teachingSteps: [
        '40 + 9 means 4 tens and 9 ones.',
        'Standard form: 49.',
        '94 would be 9 tens and 4 ones.'
      ],
      correctAnswerExplanation: '40 + 9 = 49.'
    }
  }),
  _l24Q(69, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 5, difficulty: 'medium',
    prompt: '50 + 0 = ___',
    answer: '50',
    choices: ['50', '5', '500', '55'],
    hint: '50 is 5 tens. Plus 0 ones. The number is 50.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Five tens makes the number 50',
      teachingSteps: [
        '50 + 0 means 5 tens and 0 ones.',
        '5 tens is 50, not 5.',
        'Standard form: 50.'
      ],
      correctAnswerExplanation: '50 + 0 = 50.'
    }
  }),
  _l24Q(70, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 5, difficulty: 'medium',
    prompt: '70 + 0 = ___',
    answer: '70',
    choices: ['70', '7', '700', '77'],
    hint: '70 is 7 tens. Plus 0 ones.',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: 'Seven tens is 70',
      teachingSteps: [
        '70 + 0 means 7 tens and 0 ones.',
        '7 tens = 70.',
        'Standard form: 70.'
      ],
      correctAnswerExplanation: '70 + 0 = 70.'
    }
  }),
  _l24Q(71, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '80 + 3 = ___',
    answer: '83',
    choices: ['83', '38', '803', '80'],
    hint: '80 is 8 tens. Add 3 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Eight tens and three ones is 83',
      teachingSteps: [
        '80 + 3 means 8 tens and 3 ones.',
        'Standard form: 83.',
        '38 would be 3 tens and 8 ones.'
      ],
      correctAnswerExplanation: '80 + 3 = 83.'
    }
  }),
  _l24Q(72, {
    subSkill: 'expanded_to_standard_2digit', keyIdea: 1, difficulty: 'medium',
    prompt: '90 + 4 = ___',
    answer: '94',
    choices: ['94', '49', '904', '90'],
    hint: '90 is 9 tens. Add 4 ones.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Nine tens and four ones is 94',
      teachingSteps: [
        '90 + 4 means 9 tens and 4 ones.',
        'Standard form: 94.',
        '49 would be 4 tens and 9 ones.'
      ],
      correctAnswerExplanation: '90 + 4 = 94.'
    }
  }),

  // Cat 3 medium: standard → word, full 2-digit including teens (q73–q82)
  _l24Q(73, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 11 in word form.',
    answer: 'eleven',
    choices: ['eleven', 'one-one', 'ten-one', 'twenty-one'],
    hint: '11 is a special word. It is not "ten-one."',
    intervention: {
      errorTag: 'err_word_form_irregular',
      title: '11 is called eleven — a special word',
      teachingSteps: [
        '11 is a teen number with an irregular name.',
        'The word for 11 is "eleven."',
        'Teen numbers 11–19 do not follow the regular pattern.'
      ],
      correctAnswerExplanation: '11 in word form is "eleven."'
    }
  }),
  _l24Q(74, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 12 in word form.',
    answer: 'twelve',
    choices: ['twelve', 'one-two', 'ten-two', 'twenty-two'],
    hint: '12 is a special word — not "ten-two."',
    intervention: {
      errorTag: 'err_word_form_irregular',
      title: '12 is called twelve — another special word',
      teachingSteps: [
        '12 is a teen number with an irregular name.',
        'The word for 12 is "twelve."',
        'It does not follow the tens + ones pattern.'
      ],
      correctAnswerExplanation: '12 in word form is "twelve."'
    }
  }),
  _l24Q(75, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 14 in word form.',
    answer: 'fourteen',
    choices: ['fourteen', 'forty', 'four-ten', 'forty-one'],
    hint: '14 is a teen number. The ones part comes first in the word.',
    intervention: {
      errorTag: 'err_word_form_irregular',
      title: 'Fourteen is 14, not forty',
      teachingSteps: [
        '14 is a teen number.',
        'The word is "fourteen" — four + teen.',
        '"Forty" (40) is a different number with 4 tens.'
      ],
      correctAnswerExplanation: '14 in word form is "fourteen." Forty is the word for 40.'
    }
  }),
  _l24Q(76, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 16 in word form.',
    answer: 'sixteen',
    choices: ['sixteen', 'sixty', 'six-ten', 'sixty-one'],
    hint: '16 is a teen. "Sixty" is 60, not 16.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Sixteen is 16 — not sixty (60)',
      teachingSteps: [
        '16 is a teen number.',
        'The word is "sixteen."',
        '"Sixty" is the word for 60, a much larger number.'
      ],
      correctAnswerExplanation: '16 in word form is "sixteen." Sixty means 60.'
    }
  }),
  _l24Q(77, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 45 in word form.',
    answer: 'forty-five',
    choices: ['forty-five', 'fifty-four', 'four-five', 'forty-fifteen'],
    hint: '45 = 4 tens and 5 ones. Tens word first: forty-five.',
    intervention: {
      errorTag: 'err_word_form_reversed',
      title: 'Tens word comes first: forty-five',
      teachingSteps: [
        '45 has 4 tens and 5 ones.',
        'Word form: "forty" (4 tens) then "five" (5 ones).',
        'Standard form: 45; word form: forty-five.'
      ],
      correctAnswerExplanation: '45 in word form is "forty-five."'
    }
  }),
  _l24Q(78, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 63 in word form.',
    answer: 'sixty-three',
    choices: ['sixty-three', 'thirty-six', 'six-three', 'sixty-thirteen'],
    hint: '63 = 6 tens and 3 ones. Tens word first.',
    intervention: {
      errorTag: 'err_word_form_reversed',
      title: 'Tens word before ones word',
      teachingSteps: [
        '63 has 6 tens and 3 ones.',
        'Word form: "sixty" (6 tens) then "three" (3 ones).',
        '63 = "sixty-three."'
      ],
      correctAnswerExplanation: '63 in word form is "sixty-three."'
    }
  }),
  _l24Q(79, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 78 in word form.',
    answer: 'seventy-eight',
    choices: ['seventy-eight', 'eighty-seven', 'seven-eight', 'seventy-eighteen'],
    hint: '78 = 7 tens and 8 ones. Say tens first.',
    intervention: {
      errorTag: 'err_word_form_reversed',
      title: 'Seventy comes before eight',
      teachingSteps: [
        '78 has 7 tens and 8 ones.',
        'Word form: "seventy" then "eight."',
        '78 = "seventy-eight."'
      ],
      correctAnswerExplanation: '78 in word form is "seventy-eight."'
    }
  }),
  _l24Q(80, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 94 in word form.',
    answer: 'ninety-four',
    choices: ['ninety-four', 'forty-nine', 'nine-four', 'ninety-fourteen'],
    hint: '94 = 9 tens and 4 ones. Tens word: ninety.',
    intervention: {
      errorTag: 'err_word_form_reversed',
      title: 'Ninety comes first, then four',
      teachingSteps: [
        '94 has 9 tens and 4 ones.',
        'Word form: "ninety" then "four."',
        '94 = "ninety-four."'
      ],
      correctAnswerExplanation: '94 in word form is "ninety-four."'
    }
  }),
  _l24Q(81, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 19 in word form.',
    answer: 'nineteen',
    choices: ['nineteen', 'ninety', 'nine-ten', 'ninety-one'],
    hint: '19 is a teen. "Ninety" is 90.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Nineteen is 19 — not ninety (90)',
      teachingSteps: [
        '19 is a teen number.',
        'The word is "nineteen."',
        '"Ninety" is the word for 90, a much larger number.'
      ],
      correctAnswerExplanation: '19 in word form is "nineteen." Ninety means 90.'
    }
  }),
  _l24Q(82, {
    subSkill: 'standard_to_word_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'Write 17 in word form.',
    answer: 'seventeen',
    choices: ['seventeen', 'seventy', 'seven-ten', 'seventy-one'],
    hint: '17 is a teen. "Seventy" is 70.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Seventeen is 17 — not seventy (70)',
      teachingSteps: [
        '17 is a teen number.',
        'The word is "seventeen."',
        '"Seventy" is the word for 70.'
      ],
      correctAnswerExplanation: '17 in word form is "seventeen." Seventy means 70.'
    }
  }),

  // Cat 4 medium: word → standard, full 2-digit (q83–q90)
  _l24Q(83, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "forty-seven"?',
    answer: '47',
    choices: ['47', '74', '407', '470'],
    hint: 'Forty is 4 tens. Seven is 7 ones. Tens digit goes first.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Tens come before ones in standard form',
      teachingSteps: [
        '"Forty-seven" means 4 tens and 7 ones.',
        'Tens digit first: 4, ones digit: 7.',
        'Standard form: 47.'
      ],
      correctAnswerExplanation: '"Forty-seven" = 47.'
    }
  }),
  _l24Q(84, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "sixty-five"?',
    answer: '65',
    choices: ['65', '56', '605', '650'],
    hint: 'Sixty is 6 tens. Five is 5 ones.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Six tens and five ones is 65',
      teachingSteps: [
        '"Sixty-five" means 6 tens and 5 ones.',
        'Standard form: 65.',
        '56 would be "fifty-six," a different number.'
      ],
      correctAnswerExplanation: '"Sixty-five" = 65.'
    }
  }),
  _l24Q(85, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "eighty-two"?',
    answer: '82',
    choices: ['82', '28', '802', '820'],
    hint: 'Eighty is 8 tens. Two is 2 ones.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Eight tens and two ones is 82',
      teachingSteps: [
        '"Eighty-two" means 8 tens and 2 ones.',
        'Standard form: 82.',
        '28 would be "twenty-eight."'
      ],
      correctAnswerExplanation: '"Eighty-two" = 82.'
    }
  }),
  _l24Q(86, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "fourteen"?',
    answer: '14',
    choices: ['14', '40', '41', '104'],
    hint: 'Fourteen is a teen number: 1 ten and 4 ones.',
    intervention: {
      errorTag: 'err_word_form_irregular',
      title: 'Fourteen means 1 ten and 4 ones = 14',
      teachingSteps: [
        '"Fourteen" is a teen number.',
        'It means 1 ten and 4 ones.',
        'Standard form: 14, not 40.'
      ],
      correctAnswerExplanation: '"Fourteen" = 14. One ten and four ones.'
    }
  }),
  _l24Q(87, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "sixteen"?',
    answer: '16',
    choices: ['16', '60', '61', '106'],
    hint: 'Sixteen is a teen: 1 ten and 6 ones.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Sixteen means 1 ten and 6 ones = 16',
      teachingSteps: [
        '"Sixteen" is a teen number.',
        'It means 1 ten and 6 ones.',
        'Standard form: 16. Sixty (60) is a different word.'
      ],
      correctAnswerExplanation: '"Sixteen" = 16. Sixty is 60.'
    }
  }),
  _l24Q(88, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "ninety-three"?',
    answer: '93',
    choices: ['93', '39', '903', '930'],
    hint: 'Ninety is 9 tens. Three is 3 ones.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Nine tens and three ones is 93',
      teachingSteps: [
        '"Ninety-three" means 9 tens and 3 ones.',
        'Standard form: 93.',
        '39 would be "thirty-nine."'
      ],
      correctAnswerExplanation: '"Ninety-three" = 93.'
    }
  }),
  _l24Q(89, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "fifty-six"?',
    answer: '56',
    choices: ['56', '65', '506', '560'],
    hint: 'Fifty is 5 tens. Six is 6 ones.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Five tens and six ones is 56',
      teachingSteps: [
        '"Fifty-six" means 5 tens and 6 ones.',
        'Standard form: 56.',
        '65 would be "sixty-five."'
      ],
      correctAnswerExplanation: '"Fifty-six" = 56.'
    }
  }),
  _l24Q(90, {
    subSkill: 'word_to_standard_2digit', keyIdea: 2, difficulty: 'medium',
    prompt: 'What is the standard form of "seventy-eight"?',
    answer: '78',
    choices: ['78', '87', '708', '780'],
    hint: 'Seventy is 7 tens. Eight is 8 ones.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Seven tens and eight ones is 78',
      teachingSteps: [
        '"Seventy-eight" means 7 tens and 8 ones.',
        'Standard form: 78.',
        '87 would be "eighty-seven."'
      ],
      correctAnswerExplanation: '"Seventy-eight" = 78.'
    }
  }),

  // Cat 7: standard → expanded, 3-digit 100–120 (q91–q100)
  _l24Q(91, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 100?',
    answer: '100 + 0 + 0',
    choices: ['100 + 0 + 0', '1 + 0 + 0', '100', '10 + 0'],
    hint: '100 has 1 hundred, 0 tens, and 0 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '100 needs all three places shown',
      teachingSteps: [
        '100 has 1 hundred, 0 tens, and 0 ones.',
        'Expanded form shows all three places: 100 + 0 + 0.',
        'The + 0 + 0 shows the tens and ones places are both empty.'
      ],
      correctAnswerExplanation: '100 = 100 + 0 + 0.'
    }
  }),
  _l24Q(92, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 105?',
    answer: '100 + 0 + 5',
    choices: ['100 + 0 + 5', '100 + 5', '1 + 0 + 5', '10 + 5'],
    hint: '105 has 1 hundred, 0 tens, and 5 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Show all three places: hundreds, tens, ones',
      teachingSteps: [
        '105 has 1 hundred, 0 tens, and 5 ones.',
        'Expanded form: 100 + 0 + 5.',
        'We include + 0 for the empty tens place.'
      ],
      correctAnswerExplanation: '105 = 100 + 0 + 5.'
    }
  }),
  _l24Q(93, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 110?',
    answer: '100 + 10 + 0',
    choices: ['100 + 10 + 0', '100 + 10', '1 + 1 + 0', '110'],
    hint: '110 has 1 hundred, 1 ten, and 0 ones.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Show the empty ones place with + 0',
      teachingSteps: [
        '110 has 1 hundred, 1 ten, and 0 ones.',
        'Expanded form: 100 + 10 + 0.',
        'We include + 0 to show the ones place is empty.'
      ],
      correctAnswerExplanation: '110 = 100 + 10 + 0.'
    }
  }),
  _l24Q(94, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 113?',
    answer: '100 + 10 + 3',
    choices: ['100 + 10 + 3', '1 + 1 + 3', '100 + 13', '10 + 13'],
    hint: '113 has 1 hundred, 1 ten, and 3 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Write each place separately: 100 + 10 + 3',
      teachingSteps: [
        '113 has 1 hundred, 1 ten, and 3 ones.',
        '1 hundred = 100, 1 ten = 10, 3 ones = 3.',
        'Expanded form: 100 + 10 + 3.'
      ],
      correctAnswerExplanation: '113 = 100 + 10 + 3.'
    }
  }),
  _l24Q(95, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 120?',
    answer: '100 + 20 + 0',
    choices: ['100 + 20 + 0', '100 + 20', '1 + 2 + 0', '120'],
    hint: '120 has 1 hundred, 2 tens, and 0 ones.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Include + 0 for the empty ones place',
      teachingSteps: [
        '120 has 1 hundred, 2 tens, and 0 ones.',
        '1 hundred = 100, 2 tens = 20, 0 ones = 0.',
        'Expanded form: 100 + 20 + 0.'
      ],
      correctAnswerExplanation: '120 = 100 + 20 + 0.'
    }
  }),
  _l24Q(96, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 107?',
    answer: '100 + 0 + 7',
    choices: ['100 + 0 + 7', '100 + 7', '1 + 0 + 7', '107'],
    hint: '107 has 1 hundred, 0 tens, and 7 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Show the empty tens place with + 0',
      teachingSteps: [
        '107 has 1 hundred, 0 tens, and 7 ones.',
        'Expanded form: 100 + 0 + 7.',
        'The + 0 shows the tens place is empty.'
      ],
      correctAnswerExplanation: '107 = 100 + 0 + 7.'
    }
  }),
  _l24Q(97, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 115?',
    answer: '100 + 10 + 5',
    choices: ['100 + 10 + 5', '1 + 1 + 5', '100 + 15', '10 + 15'],
    hint: '115 has 1 hundred, 1 ten, and 5 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Write each place as its value',
      teachingSteps: [
        '115 has 1 hundred, 1 ten, and 5 ones.',
        '1 hundred = 100, 1 ten = 10, 5 ones = 5.',
        'Expanded form: 100 + 10 + 5.'
      ],
      correctAnswerExplanation: '115 = 100 + 10 + 5.'
    }
  }),
  _l24Q(98, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 119?',
    answer: '100 + 10 + 9',
    choices: ['100 + 10 + 9', '1 + 1 + 9', '100 + 19', '119'],
    hint: '119 has 1 hundred, 1 ten, and 9 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Each place gets its own term',
      teachingSteps: [
        '119 has 1 hundred, 1 ten, and 9 ones.',
        '100 + 10 + 9 shows each place separately.',
        'Expanded form: 100 + 10 + 9.'
      ],
      correctAnswerExplanation: '119 = 100 + 10 + 9.'
    }
  }),
  _l24Q(99, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 103?',
    answer: '100 + 0 + 3',
    choices: ['100 + 0 + 3', '100 + 3', '1 + 0 + 3', '10 + 3'],
    hint: '103 has 1 hundred, 0 tens, and 3 ones. Include + 0 for tens.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Show the empty tens place',
      teachingSteps: [
        '103 has 1 hundred, 0 tens, and 3 ones.',
        'Expanded form: 100 + 0 + 3.',
        'We include + 0 for the empty tens place.'
      ],
      correctAnswerExplanation: '103 = 100 + 0 + 3.'
    }
  }),
  _l24Q(100, {
    subSkill: 'standard_to_expanded_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: 'What is the expanded form of 118?',
    answer: '100 + 10 + 8',
    choices: ['100 + 10 + 8', '1 + 1 + 8', '100 + 18', '10 + 18'],
    hint: '118 has 1 hundred, 1 ten, and 8 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Write the value of every place',
      teachingSteps: [
        '118 has 1 hundred, 1 ten, and 8 ones.',
        '1 hundred = 100, 1 ten = 10, 8 ones = 8.',
        'Expanded form: 100 + 10 + 8.'
      ],
      correctAnswerExplanation: '118 = 100 + 10 + 8.'
    }
  }),

  // Cat 8: expanded → standard, 3-digit (q101–q106)
  _l24Q(101, {
    subSkill: 'expanded_to_standard_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: '100 + 0 + 0 = ___',
    answer: '100',
    choices: ['100', '10', '1', '1000'],
    hint: '1 hundred, 0 tens, 0 ones. The number is 100.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'One hundred is the number 100',
      teachingSteps: [
        '100 + 0 + 0 means 1 hundred, 0 tens, 0 ones.',
        'Standard form: 100.',
        '10 would only be 1 ten, which is much smaller.'
      ],
      correctAnswerExplanation: '100 + 0 + 0 = 100.'
    }
  }),
  _l24Q(102, {
    subSkill: 'expanded_to_standard_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: '100 + 10 + 3 = ___',
    answer: '113',
    choices: ['113', '131', '1013', '103'],
    hint: '1 hundred, 1 ten, 3 ones. Hundreds first, then tens, then ones.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Hundreds, tens, ones — in that order',
      teachingSteps: [
        '100 + 10 + 3 means 1 hundred, 1 ten, 3 ones.',
        'Hundreds digit first (1), tens digit next (1), ones digit last (3).',
        'Standard form: 113.'
      ],
      correctAnswerExplanation: '100 + 10 + 3 = 113.'
    }
  }),
  _l24Q(103, {
    subSkill: 'expanded_to_standard_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: '100 + 20 + 0 = ___',
    answer: '120',
    choices: ['120', '102', '1020', '12'],
    hint: '1 hundred, 2 tens, 0 ones. What is the number?',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'One hundred twenty is 120',
      teachingSteps: [
        '100 + 20 + 0 means 1 hundred, 2 tens, 0 ones.',
        'Standard form: 120.',
        '102 would be 100 + 0 + 2 — different arrangement.'
      ],
      correctAnswerExplanation: '100 + 20 + 0 = 120.'
    }
  }),
  _l24Q(104, {
    subSkill: 'expanded_to_standard_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: '100 + 0 + 7 = ___',
    answer: '107',
    choices: ['107', '170', '17', '1007'],
    hint: '1 hundred, 0 tens, 7 ones. Write all three digits.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Write all three digits: 1, 0, 7',
      teachingSteps: [
        '100 + 0 + 7 means 1 hundred, 0 tens, 7 ones.',
        'Hundreds digit: 1, Tens digit: 0, Ones digit: 7.',
        'Standard form: 107.'
      ],
      correctAnswerExplanation: '100 + 0 + 7 = 107.'
    }
  }),
  _l24Q(105, {
    subSkill: 'expanded_to_standard_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: '100 + 10 + 5 = ___',
    answer: '115',
    choices: ['115', '151', '1015', '105'],
    hint: '1 hundred, 1 ten, 5 ones. Hundreds first.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Hundreds, tens, ones — 115',
      teachingSteps: [
        '100 + 10 + 5 means 1 hundred, 1 ten, 5 ones.',
        'Standard form: 115.',
        '151 would require a 5 in the tens place, not 1.'
      ],
      correctAnswerExplanation: '100 + 10 + 5 = 115.'
    }
  }),
  _l24Q(106, {
    subSkill: 'expanded_to_standard_3digit', keyIdea: 4, difficulty: 'medium',
    prompt: '100 + 0 + 9 = ___',
    answer: '109',
    choices: ['109', '190', '19', '1009'],
    hint: '1 hundred, 0 tens, 9 ones.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Write all three digits: 1, 0, 9',
      teachingSteps: [
        '100 + 0 + 9 means 1 hundred, 0 tens, 9 ones.',
        'Standard form: 109.',
        '190 would be 100 + 90 + 0 — different.'
      ],
      correctAnswerExplanation: '100 + 0 + 9 = 109.'
    }
  }),

  // Cat 11 medium: visual → form, 3-digit (q107–q110)
  _l24Q(107, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'medium',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 0 } },
    answer: '100 + 0 + 0',
    choices: ['100 + 0 + 0', '1 + 0 + 0', '100', '10 + 0'],
    hint: 'The large blue square is 1 hundred = 100. No rods, no cubes.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'The flat = 100, not 1',
      teachingSteps: [
        'The large blue flat shows 1 hundred = 100.',
        'No rods = 0 tens. No cubes = 0 ones.',
        'Expanded form: 100 + 0 + 0.'
      ],
      correctAnswerExplanation: '1 flat (100) = 100 + 0 + 0.'
    }
  }),
  _l24Q(108, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'medium',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 3 } },
    answer: '100 + 10 + 3',
    choices: ['100 + 10 + 3', '1 + 1 + 3', '100 + 13', '113'],
    hint: '1 flat = 100, 1 rod = 10, 3 cubes = 3.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Flat = 100, rod = 10, cube = 1',
      teachingSteps: [
        '1 blue flat = 1 hundred = 100.',
        '1 blue rod = 1 ten = 10.',
        '3 orange cubes = 3 ones = 3. Expanded form: 100 + 10 + 3.'
      ],
      correctAnswerExplanation: '1 flat (100) + 1 rod (10) + 3 cubes (3) = 100 + 10 + 3.'
    }
  }),
  _l24Q(109, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'medium',
    prompt: 'What is the standard form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 5 } },
    answer: '105',
    choices: ['105', '150', '15', '1005'],
    hint: '1 flat = 100. No rods = 0 tens. 5 cubes = 5.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Flat is 1 hundred, write 3 digits',
      teachingSteps: [
        '1 flat = 100. No rods = 0 tens. 5 cubes = 5 ones.',
        'Hundreds digit: 1, Tens digit: 0, Ones digit: 5.',
        'Standard form: 105.'
      ],
      correctAnswerExplanation: '1 flat + 0 rods + 5 cubes = 105.'
    }
  }),
  _l24Q(110, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'medium',
    prompt: 'What is the standard form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: '120',
    choices: ['120', '102', '12', '1020'],
    hint: '1 flat = 100. 2 rods = 20. No cubes = 0.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Flat + 2 rods = 120',
      teachingSteps: [
        '1 flat = 100. 2 rods = 20. No cubes = 0 ones.',
        'Hundreds: 1, Tens: 2, Ones: 0.',
        'Standard form: 120.'
      ],
      correctAnswerExplanation: '1 flat (100) + 2 rods (20) + 0 cubes = 120.'
    }
  }),

  // ── medium end

  // ── hard (q111–q160) ──────────────────────────────────────────────────────

  // Cat 9: standard → word, 3-digit 100–120 (q111–q120)
  _l24Q(111, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 100 in word form.',
    answer: 'one hundred',
    choices: ['one hundred', 'ten', 'one hundred zero', 'one-zero-zero'],
    hint: '100 is one group of a hundred. The word is "one hundred."',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: '100 in words is "one hundred"',
      teachingSteps: [
        '100 has 1 hundred, 0 tens, 0 ones.',
        'We say the hundreds part: "one hundred."',
        'We do not say the zero tens or zero ones.'
      ],
      correctAnswerExplanation: '100 in word form is "one hundred."'
    }
  }),
  _l24Q(112, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 105 in word form.',
    answer: 'one hundred five',
    choices: ['one hundred five', 'one hundred fifty', 'one zero five', 'hundred five'],
    hint: '105 = 1 hundred and 5 ones. Say "one hundred" then "five."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred five is not one hundred fifty',
      teachingSteps: [
        '105 has 1 hundred, 0 tens, and 5 ones.',
        'Word form: "one hundred" then "five."',
        '"One hundred fifty" is 150 — a different number.'
      ],
      correctAnswerExplanation: '105 in word form is "one hundred five."'
    }
  }),
  _l24Q(113, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 110 in word form.',
    answer: 'one hundred ten',
    choices: ['one hundred ten', 'one hundred one', 'one ten', 'eleven'],
    hint: '110 = 1 hundred and 1 ten. Say "one hundred ten."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred ten is 110, not 11',
      teachingSteps: [
        '110 has 1 hundred, 1 ten, and 0 ones.',
        'Word form: "one hundred ten."',
        '"Eleven" is 11, which is much smaller.'
      ],
      correctAnswerExplanation: '110 in word form is "one hundred ten."'
    }
  }),
  _l24Q(114, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 113 in word form.',
    answer: 'one hundred thirteen',
    choices: ['one hundred thirteen', 'one hundred thirty', 'thirteen', 'one thirteen'],
    hint: '113 = 1 hundred, 1 ten, 3 ones. "One hundred thirteen."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred thirteen vs one hundred thirty',
      teachingSteps: [
        '113 has 1 hundred, 1 ten, and 3 ones.',
        'Word form: "one hundred thirteen."',
        '"One hundred thirty" is 130 — outside our range.'
      ],
      correctAnswerExplanation: '113 in word form is "one hundred thirteen."'
    }
  }),
  _l24Q(115, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 115 in word form.',
    answer: 'one hundred fifteen',
    choices: ['one hundred fifteen', 'one hundred fifty', 'fifteen', 'one fifteen'],
    hint: '115 = 1 hundred, 1 ten, 5 ones. "One hundred fifteen."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Fifteen vs fifty: different words',
      teachingSteps: [
        '115 has 1 hundred, 1 ten, and 5 ones.',
        'Word form: "one hundred fifteen."',
        '"Fifteen" alone means 15; "one hundred fifteen" means 115.'
      ],
      correctAnswerExplanation: '115 in word form is "one hundred fifteen."'
    }
  }),
  _l24Q(116, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 120 in word form.',
    answer: 'one hundred twenty',
    choices: ['one hundred twenty', 'one hundred two', 'twelve', 'one twenty'],
    hint: '120 = 1 hundred and 2 tens. "One hundred twenty."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred twenty is 120',
      teachingSteps: [
        '120 has 1 hundred, 2 tens, and 0 ones.',
        'Word form: "one hundred twenty."',
        '"Twelve" is 12, which is much smaller.'
      ],
      correctAnswerExplanation: '120 in word form is "one hundred twenty."'
    }
  }),
  _l24Q(117, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 108 in word form.',
    answer: 'one hundred eight',
    choices: ['one hundred eight', 'one hundred eighty', 'eighteen', 'one eight'],
    hint: '108 = 1 hundred and 8 ones. "One hundred eight."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Eight vs eighty: different words',
      teachingSteps: [
        '108 has 1 hundred, 0 tens, and 8 ones.',
        'Word form: "one hundred eight."',
        '"One hundred eighty" would be 180 — too big.'
      ],
      correctAnswerExplanation: '108 in word form is "one hundred eight."'
    }
  }),
  _l24Q(118, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 119 in word form.',
    answer: 'one hundred nineteen',
    choices: ['one hundred nineteen', 'one hundred ninety', 'nineteen', 'one nineteen'],
    hint: '119 = 1 hundred, 1 ten, 9 ones. "One hundred nineteen."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Nineteen vs ninety: different words',
      teachingSteps: [
        '119 has 1 hundred, 1 ten, and 9 ones.',
        'Word form: "one hundred nineteen."',
        '"Nineteen" alone means 19; add "one hundred" for 119.'
      ],
      correctAnswerExplanation: '119 in word form is "one hundred nineteen."'
    }
  }),
  _l24Q(119, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 116 in word form.',
    answer: 'one hundred sixteen',
    choices: ['one hundred sixteen', 'one hundred sixty', 'sixteen', 'one sixteen'],
    hint: '116 = 1 hundred, 1 ten, 6 ones. "One hundred sixteen."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Sixteen (16) vs sixty (60): different numbers',
      teachingSteps: [
        '116 has 1 hundred, 1 ten, and 6 ones.',
        'Word form: "one hundred sixteen."',
        '"One hundred sixty" would be 160 — outside our range.'
      ],
      correctAnswerExplanation: '116 in word form is "one hundred sixteen."'
    }
  }),
  _l24Q(120, {
    subSkill: 'standard_to_word_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'Write 112 in word form.',
    answer: 'one hundred twelve',
    choices: ['one hundred twelve', 'one hundred twenty', 'twelve', 'one twelve'],
    hint: '112 = 1 hundred, 1 ten, 2 ones. "One hundred twelve."',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Twelve (12) vs twenty (20): different words',
      teachingSteps: [
        '112 has 1 hundred, 1 ten, and 2 ones.',
        'Word form: "one hundred twelve."',
        '"One hundred twenty" is 120, a different number.'
      ],
      correctAnswerExplanation: '112 in word form is "one hundred twelve."'
    }
  }),

  // Cat 10: word → standard, 3-digit (q121–q128)
  _l24Q(121, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred"?',
    answer: '100',
    choices: ['100', '10', '1', '1000'],
    hint: 'One hundred = 1 hundred, 0 tens, 0 ones.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'One hundred is 100, not 10',
      teachingSteps: [
        '"One hundred" means 1 hundred.',
        '1 hundred is written as 100.',
        '10 is only 1 ten, which is much smaller.'
      ],
      correctAnswerExplanation: '"One hundred" = 100.'
    }
  }),
  _l24Q(122, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred thirteen"?',
    answer: '113',
    choices: ['113', '131', '1013', '103'],
    hint: 'One hundred = 100. Thirteen = 13. Put them together: 113.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'One hundred thirteen = 113, not 131',
      teachingSteps: [
        '"One hundred thirteen" means 100 + 13.',
        '100 + 13 = 113.',
        '131 would be "one hundred thirty-one," a different number.'
      ],
      correctAnswerExplanation: '"One hundred thirteen" = 113.'
    }
  }),
  _l24Q(123, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred twenty"?',
    answer: '120',
    choices: ['120', '102', '12', '1020'],
    hint: 'One hundred = 100. Twenty = 20. Together: 120.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'One hundred twenty = 120',
      teachingSteps: [
        '"One hundred twenty" means 100 + 20.',
        '100 + 20 = 120.',
        '102 would be "one hundred two," a different number.'
      ],
      correctAnswerExplanation: '"One hundred twenty" = 120.'
    }
  }),
  _l24Q(124, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred seven"?',
    answer: '107',
    choices: ['107', '170', '17', '1007'],
    hint: 'One hundred = 100. Seven = 7. Together: 107.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'One hundred seven = 107, not 170',
      teachingSteps: [
        '"One hundred seven" means 100 + 7.',
        '100 + 7 = 107.',
        '170 would be "one hundred seventy" — outside our range.'
      ],
      correctAnswerExplanation: '"One hundred seven" = 107.'
    }
  }),
  _l24Q(125, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred fifteen"?',
    answer: '115',
    choices: ['115', '150', '15', '1015'],
    hint: 'One hundred = 100. Fifteen = 15. Together: 115.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred fifteen = 115, not 150',
      teachingSteps: [
        '"One hundred fifteen" means 100 + 15.',
        '100 + 15 = 115.',
        '"One hundred fifty" would be 150 — outside our range.'
      ],
      correctAnswerExplanation: '"One hundred fifteen" = 115.'
    }
  }),
  _l24Q(126, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred nineteen"?',
    answer: '119',
    choices: ['119', '190', '19', '1019'],
    hint: 'One hundred = 100. Nineteen = 19. Together: 119.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred nineteen = 119',
      teachingSteps: [
        '"One hundred nineteen" means 100 + 19.',
        '100 + 19 = 119.',
        '"One hundred ninety" would be 190 — outside our range.'
      ],
      correctAnswerExplanation: '"One hundred nineteen" = 119.'
    }
  }),
  _l24Q(127, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred twelve"?',
    answer: '112',
    choices: ['112', '120', '12', '1012'],
    hint: 'One hundred = 100. Twelve = 12. Together: 112.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Twelve (12) vs twenty (20): read carefully',
      teachingSteps: [
        '"One hundred twelve" means 100 + 12.',
        '100 + 12 = 112.',
        '"One hundred twenty" is 120 — twelve and twenty are different words.'
      ],
      correctAnswerExplanation: '"One hundred twelve" = 112.'
    }
  }),
  _l24Q(128, {
    subSkill: 'word_to_standard_3digit', keyIdea: 4, difficulty: 'hard',
    prompt: 'What is the standard form of "one hundred ten"?',
    answer: '110',
    choices: ['110', '101', '11', '1010'],
    hint: 'One hundred = 100. Ten = 10. Together: 110.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred ten = 110, not 101',
      teachingSteps: [
        '"One hundred ten" means 100 + 10.',
        '100 + 10 = 110.',
        '101 would be "one hundred one" — ten and one are different.'
      ],
      correctAnswerExplanation: '"One hundred ten" = 110.'
    }
  }),

  // Cat 12: equivalence matching — all three forms (q129–q140)
  _l24Q(129, {
    subSkill: 'equivalence_match', keyIdea: 0, difficulty: 'hard',
    prompt: 'Which shows the same number as 47?',
    answer: '40 + 7',
    choices: ['40 + 7', '70 + 4', '4 + 7', 'forty-eight'],
    hint: '47 in expanded form is 40 + 7. Match the value.',
    intervention: {
      errorTag: 'err_expanded_form_reversed',
      title: 'All forms must show the same amount',
      teachingSteps: [
        '47 has 4 tens and 7 ones.',
        'Expanded form: 40 + 7.',
        '"70 + 4" would be 74, a different number.'
      ],
      correctAnswerExplanation: '47 = 40 + 7. All three forms show the same amount.'
    }
  }),
  _l24Q(130, {
    subSkill: 'equivalence_match', keyIdea: 0, difficulty: 'hard',
    prompt: 'Which shows the same number as "sixty-three"?',
    answer: '63',
    choices: ['63', '36', '630', '60 + 30'],
    hint: '"Sixty-three" = 6 tens and 3 ones = 63.',
    intervention: {
      errorTag: 'err_word_reversal',
      title: 'Sixty-three = 63, not 36',
      teachingSteps: [
        '"Sixty-three" means 6 tens and 3 ones.',
        'Standard form: 63.',
        '36 would be "thirty-six," not sixty-three.'
      ],
      correctAnswerExplanation: '"Sixty-three" = 63.'
    }
  }),
  _l24Q(131, {
    subSkill: 'equivalence_match', keyIdea: 0, difficulty: 'hard',
    prompt: 'Which shows the same number as 80 + 0?',
    answer: 'eighty',
    choices: ['eighty', 'eight', 'eighteen', 'eighty-one'],
    hint: '80 + 0 = 80. What is the word form of 80?',
    intervention: {
      errorTag: 'err_decade_digit_only',
      title: '80 + 0 equals eighty',
      teachingSteps: [
        '80 + 0 = 80.',
        'Word form of 80 is "eighty."',
        '"Eight" is only 8, and "eighteen" is 18.'
      ],
      correctAnswerExplanation: '80 + 0 = 80 = "eighty."'
    }
  }),
  _l24Q(132, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as 113?',
    answer: '100 + 10 + 3',
    choices: ['100 + 10 + 3', '100 + 30 + 1', '1 + 1 + 3', '100 + 13'],
    hint: '113 = 1 hundred, 1 ten, 3 ones = 100 + 10 + 3.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Match each digit to its place value',
      teachingSteps: [
        '113 has 1 hundred, 1 ten, and 3 ones.',
        'Expanded: 100 + 10 + 3.',
        '"100 + 30 + 1" would be 131, a different number.'
      ],
      correctAnswerExplanation: '113 = 100 + 10 + 3.'
    }
  }),
  _l24Q(133, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as "one hundred fifteen"?',
    answer: '115',
    choices: ['115', '150', '151', '105'],
    hint: '"One hundred fifteen" = 100 + 15 = 115.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred fifteen = 115',
      teachingSteps: [
        '"One hundred fifteen" means 100 + 15.',
        '100 + 15 = 115.',
        '150 would be "one hundred fifty" — fifteen and fifty are different.'
      ],
      correctAnswerExplanation: '"One hundred fifteen" = 115.'
    }
  }),
  _l24Q(134, {
    subSkill: 'equivalence_match', keyIdea: 0, difficulty: 'hard',
    prompt: 'Which shows the same number as 50 + 0?',
    answer: 'fifty',
    choices: ['fifty', 'five', 'fifty-zero', 'fifteen'],
    hint: '50 + 0 = 50. Word form of 50 is "fifty."',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: '50 = fifty — not fifteen',
      teachingSteps: [
        '50 + 0 = 50.',
        'Word form: "fifty."',
        '"Fifteen" is 15, which is much smaller than 50.'
      ],
      correctAnswerExplanation: '50 + 0 = 50 = "fifty."'
    }
  }),
  _l24Q(135, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as 100 + 20 + 0?',
    answer: 'one hundred twenty',
    choices: ['one hundred twenty', 'one hundred two', 'twelve', 'one hundred twelve'],
    hint: '100 + 20 + 0 = 120. What is the word form?',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: '120 = one hundred twenty',
      teachingSteps: [
        '100 + 20 + 0 = 120.',
        'Word form: "one hundred twenty."',
        '"One hundred two" is 102 — twenty and two are different.'
      ],
      correctAnswerExplanation: '100 + 20 + 0 = 120 = "one hundred twenty."'
    }
  }),
  _l24Q(136, {
    subSkill: 'equivalence_match', keyIdea: 0, difficulty: 'hard',
    prompt: 'Which three all show the same number? Pick the odd one out.',
    answer: '70 + 4',
    choices: ['70 + 4', '74', 'seventy-four', '47'],
    hint: '74 and "seventy-four" match. Which expanded form does NOT match 74?',
    intervention: {
      errorTag: 'err_expanded_form_reversed',
      title: '70 + 4 = 74, but 40 + 7 = 47',
      teachingSteps: [
        '74 = 7 tens and 4 ones.',
        'Expanded form of 74 is 70 + 4.',
        '47 is a different number — 4 tens and 7 ones = 40 + 7.'
      ],
      correctAnswerExplanation: '74, "seventy-four," and 70 + 4 all match. 47 is the odd one out.'
    }
  }),
  _l24Q(137, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as 100 + 0 + 6?',
    answer: '106',
    choices: ['106', '160', '16', '1006'],
    hint: '100 + 0 + 6 = 1 hundred, 0 tens, 6 ones.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '100 + 0 + 6 = 106',
      teachingSteps: [
        '100 + 0 + 6 means 1 hundred, 0 tens, 6 ones.',
        'Standard form: 106.',
        '160 would be "one hundred sixty" — outside our range.'
      ],
      correctAnswerExplanation: '100 + 0 + 6 = 106.'
    }
  }),
  _l24Q(138, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as "one hundred twelve"?',
    answer: '100 + 10 + 2',
    choices: ['100 + 10 + 2', '100 + 20 + 1', '100 + 2', '10 + 12'],
    hint: '"One hundred twelve" = 112 = 100 + 10 + 2.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Twelve = 12 = 10 + 2',
      teachingSteps: [
        '"One hundred twelve" = 112.',
        '112 = 1 hundred, 1 ten, 2 ones.',
        'Expanded: 100 + 10 + 2.'
      ],
      correctAnswerExplanation: '"One hundred twelve" = 112 = 100 + 10 + 2.'
    }
  }),
  _l24Q(139, {
    subSkill: 'equivalence_match', keyIdea: 0, difficulty: 'hard',
    prompt: 'Which shows the same number as "thirty"?',
    answer: '30 + 0',
    choices: ['30 + 0', '3 + 0', '13 + 0', '30 + 3'],
    hint: '"Thirty" = 30. What is the expanded form of 30?',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Thirty = 30 = 30 + 0',
      teachingSteps: [
        '"Thirty" means 3 tens = 30.',
        'Expanded form of 30: 30 + 0.',
        '"3 + 0" uses digits, not place values.'
      ],
      correctAnswerExplanation: '"Thirty" = 30 = 30 + 0.'
    }
  }),
  _l24Q(140, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as 100 + 10 + 9?',
    answer: 'one hundred nineteen',
    choices: ['one hundred nineteen', 'one hundred ninety', 'nineteen', 'one hundred nine'],
    hint: '100 + 10 + 9 = 119. What is the word form of 119?',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: '119 = one hundred nineteen',
      teachingSteps: [
        '100 + 10 + 9 = 119.',
        'Word form: "one hundred nineteen."',
        '"One hundred ninety" would be 190 — outside our range.'
      ],
      correctAnswerExplanation: '100 + 10 + 9 = 119 = "one hundred nineteen."'
    }
  }),

  // Cat 13: error repair (q141–q155)
  _l24Q(141, {
    subSkill: 'error_repair', keyIdea: 1, difficulty: 'hard',
    prompt: 'A student wrote the expanded form of 56 as "5 + 6." What is the correct expanded form?',
    answer: '50 + 6',
    choices: ['50 + 6', '5 + 6', '60 + 5', '5 + 60'],
    hint: 'The 5 is in the tens place. 5 tens = 50, not 5.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'The tens digit means tens, not ones',
      teachingSteps: [
        'The student wrote the digit 5 instead of its value (50).',
        '5 is in the tens place. 5 tens = 50.',
        'Correct expanded form: 50 + 6.'
      ],
      correctAnswerExplanation: '56 = 50 + 6. The 5 means 5 tens = 50.'
    }
  }),
  _l24Q(142, {
    subSkill: 'error_repair', keyIdea: 1, difficulty: 'hard',
    prompt: 'A student says 40 + 8 = 84. What is the correct standard form?',
    answer: '48',
    choices: ['48', '84', '408', '40'],
    hint: 'Tens come first in standard form. 40 is 4 tens → 4 goes in the tens place.',
    intervention: {
      errorTag: 'err_reversed_digits',
      title: 'Tens digit goes first, not second',
      teachingSteps: [
        '40 + 8 means 4 tens and 8 ones.',
        'The tens digit (4) goes first: 48.',
        '84 would mean 8 tens and 4 ones — the opposite.'
      ],
      correctAnswerExplanation: '40 + 8 = 48. The tens digit comes first.'
    }
  }),
  _l24Q(143, {
    subSkill: 'error_repair', keyIdea: 5, difficulty: 'hard',
    prompt: 'A student writes the expanded form of 70 as "70." What is missing?',
    answer: '70 + 0',
    choices: ['70 + 0', '70', '7 + 0', '70 + 7'],
    hint: '70 is the standard form. Expanded form must show both places.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Expanded form needs to show the ones place too',
      teachingSteps: [
        '"70" by itself is standard form, not expanded form.',
        'Expanded form shows every place: 70 + 0.',
        'The + 0 shows the ones place is empty.'
      ],
      correctAnswerExplanation: 'Expanded form of 70 is 70 + 0, not just "70."'
    }
  }),
  _l24Q(144, {
    subSkill: 'error_repair', keyIdea: 2, difficulty: 'hard',
    prompt: 'A student writes the word form of 19 as "ninety." What is the correct word form?',
    answer: 'nineteen',
    choices: ['nineteen', 'ninety', 'nine-teen', 'nine-one'],
    hint: '19 is a teen number, not a decade. "Ninety" is 90.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Nineteen (19) vs ninety (90)',
      teachingSteps: [
        '19 is a teen number: 1 ten and 9 ones.',
        'Word form: "nineteen."',
        '"Ninety" is the word for 90, which has 9 tens.'
      ],
      correctAnswerExplanation: '19 in word form is "nineteen." Ninety means 90.'
    }
  }),
  _l24Q(145, {
    subSkill: 'error_repair', keyIdea: 4, difficulty: 'hard',
    prompt: 'A student writes the expanded form of 113 as "1 + 1 + 3." What is the correct expanded form?',
    answer: '100 + 10 + 3',
    choices: ['100 + 10 + 3', '1 + 1 + 3', '100 + 13', '110 + 3'],
    hint: '113 has a hundreds place. 1 hundred = 100, 1 ten = 10.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Write place values, not digits',
      teachingSteps: [
        'The student wrote digits (1, 1, 3) instead of place values.',
        '1 hundred = 100, 1 ten = 10, 3 ones = 3.',
        'Correct expanded form: 100 + 10 + 3.'
      ],
      correctAnswerExplanation: '113 = 100 + 10 + 3. Each digit becomes its place value.'
    }
  }),
  _l24Q(146, {
    subSkill: 'error_repair', keyIdea: 4, difficulty: 'hard',
    prompt: 'A student says 100 + 20 + 0 = 102. What is the correct standard form?',
    answer: '120',
    choices: ['120', '102', '100', '1020'],
    hint: '100 is 1 hundred. 20 is 2 tens. 0 ones. The number is 120.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '100 + 20 + 0 = 120, not 102',
      teachingSteps: [
        '100 + 20 + 0 means 1 hundred, 2 tens, 0 ones.',
        'Standard form: 120.',
        '102 would be 100 + 0 + 2 — zero tens, two ones.'
      ],
      correctAnswerExplanation: '100 + 20 + 0 = 120.'
    }
  }),
  _l24Q(147, {
    subSkill: 'error_repair', keyIdea: 2, difficulty: 'hard',
    prompt: 'A student writes "forty" for the number 14. What is the correct word form of 14?',
    answer: 'fourteen',
    choices: ['fourteen', 'forty', 'four-ten', 'four-one'],
    hint: '14 is a teen (1 ten + 4 ones). Forty is 40 (4 tens).',
    intervention: {
      errorTag: 'err_word_form_irregular',
      title: 'Fourteen (14) vs forty (40)',
      teachingSteps: [
        '14 is a teen: 1 ten and 4 ones.',
        'Word form: "fourteen."',
        '"Forty" is 40 — four tens, which is much bigger than 14.'
      ],
      correctAnswerExplanation: '14 in word form is "fourteen." Forty means 40.'
    }
  }),
  _l24Q(148, {
    subSkill: 'error_repair', keyIdea: 4, difficulty: 'hard',
    prompt: 'A student says "one hundred thirteen" means 131. What does "one hundred thirteen" really equal?',
    answer: '113',
    choices: ['113', '131', '1013', '103'],
    hint: '"Thirteen" = 13 (1 ten + 3 ones). Not thirty-one.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: 'Thirteen (13) vs thirty-one (31)',
      teachingSteps: [
        '"One hundred thirteen" = 100 + 13.',
        '13 is thirteen — 1 ten and 3 ones.',
        '100 + 13 = 113, not 131.'
      ],
      correctAnswerExplanation: '"One hundred thirteen" = 113. Thirteen = 13.'
    }
  }),
  _l24Q(149, {
    subSkill: 'error_repair', keyIdea: 5, difficulty: 'hard',
    prompt: 'A student writes the expanded form of 110 as "100 + 10." What is missing?',
    answer: '100 + 10 + 0',
    choices: ['100 + 10 + 0', '100 + 10', '1 + 1 + 0', '110'],
    hint: 'The ones place must be shown. 110 has 0 ones — write + 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Show all three places — including + 0 for ones',
      teachingSteps: [
        '110 has 1 hundred, 1 ten, and 0 ones.',
        'Expanded form must include all three: 100 + 10 + 0.',
        'The + 0 shows the ones place is empty.'
      ],
      correctAnswerExplanation: '110 = 100 + 10 + 0. We include + 0 for the empty ones place.'
    }
  }),
  _l24Q(150, {
    subSkill: 'error_repair', keyIdea: 1, difficulty: 'hard',
    prompt: 'A student writes the expanded form of 92 as "90 + 20." What is correct?',
    answer: '90 + 2',
    choices: ['90 + 2', '90 + 20', '9 + 2', '9 + 20'],
    hint: '92 has 9 tens and 2 ones. 2 ones = 2, not 20.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Ones digit stays as ones — not tens',
      teachingSteps: [
        '92 has 9 in the tens place and 2 in the ones place.',
        '9 tens = 90. 2 ones = 2 (not 20).',
        'Correct expanded form: 90 + 2.'
      ],
      correctAnswerExplanation: '92 = 90 + 2. The ones digit 2 is worth 2, not 20.'
    }
  }),
  _l24Q(151, {
    subSkill: 'error_repair', keyIdea: 2, difficulty: 'hard',
    prompt: 'A student writes the word form of 80 as "eighty-zero." What is the correct word form?',
    answer: 'eighty',
    choices: ['eighty', 'eighty-zero', 'eight', 'eighteen'],
    hint: 'We do not say the zero ones. 80 in words is just "eighty."',
    intervention: {
      errorTag: 'err_word_form_digit_not_word',
      title: 'Do not say the zero ones in word form',
      teachingSteps: [
        '80 has 8 tens and 0 ones.',
        'In word form, we do not say the zero ones.',
        'Word form: "eighty."'
      ],
      correctAnswerExplanation: '80 in word form is "eighty" — we do not say "zero."'
    }
  }),
  _l24Q(152, {
    subSkill: 'error_repair', keyIdea: 4, difficulty: 'hard',
    prompt: 'A student says 100 + 0 + 7 = 170. What is the correct standard form?',
    answer: '107',
    choices: ['107', '170', '17', '1007'],
    hint: '0 in the tens place means 0 tens — not 7 tens.',
    intervention: {
      errorTag: 'err_reversed_tens_ones',
      title: '100 + 0 + 7 = 107, not 170',
      teachingSteps: [
        '100 + 0 + 7 means 1 hundred, 0 tens, 7 ones.',
        'Standard form: 107.',
        '170 would mean 1 hundred, 7 tens, 0 ones = 100 + 70 + 0.'
      ],
      correctAnswerExplanation: '100 + 0 + 7 = 107. Zero tens, seven ones.'
    }
  }),

  // Visual error repair / hard visual (q153–q160)
  _l24Q(153, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'hard',
    prompt: 'What is the word form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 5 } },
    answer: 'one hundred fifteen',
    choices: ['one hundred fifteen', 'one hundred fifty', 'fifteen', 'one fifteen'],
    hint: '1 flat = 100, 1 rod = 10, 5 cubes = 5. The number is 115.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Flat + rod + 5 cubes = 115 = one hundred fifteen',
      teachingSteps: [
        '1 flat = 100, 1 rod = 10, 5 cubes = 5.',
        '100 + 10 + 5 = 115.',
        'Word form: "one hundred fifteen."'
      ],
      correctAnswerExplanation: '1 flat + 1 rod + 5 cubes = 115 = "one hundred fifteen."'
    }
  }),
  _l24Q(154, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'hard',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 0, ones: 9 } },
    answer: '100 + 0 + 9',
    choices: ['100 + 0 + 9', '100 + 9', '1 + 0 + 9', '190'],
    hint: '1 flat = 100. No rods = 0 tens. 9 cubes = 9.',
    intervention: {
      errorTag: 'err_ignore_hundreds',
      title: 'Include + 0 for the empty tens place',
      teachingSteps: [
        '1 flat = 100. No rods = 0 tens. 9 cubes = 9.',
        'Expanded form must show all three places: 100 + 0 + 9.',
        'We include + 0 for the empty tens place.'
      ],
      correctAnswerExplanation: '1 flat (100) + 0 rods (0) + 9 cubes (9) = 100 + 0 + 9.'
    }
  }),
  _l24Q(155, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'hard',
    prompt: 'What is the word form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 2, ones: 0 } },
    answer: 'one hundred twenty',
    choices: ['one hundred twenty', 'one hundred two', 'twelve', 'one twenty'],
    hint: '1 flat = 100. 2 rods = 20. No cubes = 0. The number is 120.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'One hundred twenty is 120',
      teachingSteps: [
        '1 flat (100) + 2 rods (20) + 0 cubes = 120.',
        'Word form: "one hundred twenty."',
        '"One hundred two" would be 102 — a different number.'
      ],
      correctAnswerExplanation: '120 in word form is "one hundred twenty."'
    }
  }),
  _l24Q(156, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 3, difficulty: 'hard',
    prompt: 'What is the word form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 1, ones: 9 } },
    answer: 'nineteen',
    choices: ['nineteen', 'ninety', 'nine-ten', 'ninety-one'],
    hint: '1 rod = 10. 9 cubes = 9. The number is 19.',
    intervention: {
      errorTag: 'err_word_form_teen_confusion',
      title: 'Nineteen (19) vs ninety (90)',
      teachingSteps: [
        '1 rod = 1 ten. 9 cubes = 9 ones.',
        '1 ten and 9 ones = 19.',
        'Word form: "nineteen." Ninety is 90.'
      ],
      correctAnswerExplanation: '1 rod (10) + 9 cubes (9) = 19 = "nineteen."'
    }
  }),
  _l24Q(157, {
    subSkill: 'visual_to_expanded_2digit', keyIdea: 5, difficulty: 'hard',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 0, tens: 5, ones: 0 } },
    answer: '50 + 0',
    choices: ['50 + 0', '5 + 0', '50', '50 + 5'],
    hint: '5 rods = 50. No cubes = 0 ones. Include the + 0.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Include + 0 even when no cubes are shown',
      teachingSteps: [
        '5 rods = 5 tens = 50.',
        'No cubes = 0 ones.',
        'Expanded form: 50 + 0. We must show the ones place.'
      ],
      correctAnswerExplanation: '5 rods (50) + 0 cubes (0) = 50 + 0.'
    }
  }),
  _l24Q(158, {
    subSkill: 'visual_to_form_3digit', keyIdea: 3, difficulty: 'hard',
    prompt: 'What is the expanded form of the number shown?',
    visual: { type: 'base10', config: { hundreds: 1, tens: 1, ones: 0 } },
    answer: '100 + 10 + 0',
    choices: ['100 + 10 + 0', '100 + 10', '1 + 1 + 0', '110'],
    hint: '1 flat = 100. 1 rod = 10. No cubes = 0 ones.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Show all three places including + 0',
      teachingSteps: [
        '1 flat = 100. 1 rod = 10. No cubes = 0 ones.',
        'Expanded form: 100 + 10 + 0.',
        'We include + 0 for the empty ones place.'
      ],
      correctAnswerExplanation: '1 flat (100) + 1 rod (10) + 0 cubes = 100 + 10 + 0.'
    }
  }),
  _l24Q(159, {
    subSkill: 'equivalence_match', keyIdea: 4, difficulty: 'hard',
    prompt: 'Which shows the same number as "one hundred eight"?',
    answer: '100 + 0 + 8',
    choices: ['100 + 0 + 8', '100 + 80', '100 + 8', '100 + 0 + 80'],
    hint: '"Eight" = 8 ones. "Eighty" = 80. One hundred eight = 100 + 0 + 8.',
    intervention: {
      errorTag: 'err_word_form_hundred_teen',
      title: 'Eight (8) is ones, not tens',
      teachingSteps: [
        '"One hundred eight" = 1 hundred, 0 tens, 8 ones.',
        'Expanded: 100 + 0 + 8.',
        '"100 + 80" would be "one hundred eighty" — a different number.'
      ],
      correctAnswerExplanation: '"One hundred eight" = 108 = 100 + 0 + 8.'
    }
  }),
  _l24Q(160, {
    subSkill: 'error_repair', keyIdea: 4, difficulty: 'hard',
    prompt: 'A student says "one hundred twenty" means 100 + 2 + 0. What is the correct expanded form?',
    answer: '100 + 20 + 0',
    choices: ['100 + 20 + 0', '100 + 2 + 0', '100 + 2', '120'],
    hint: '"Twenty" = 2 tens = 20, not 2. 2 tens goes in the tens spot.',
    intervention: {
      errorTag: 'err_expanded_form_digit',
      title: 'Twenty = 20 in expanded form, not 2',
      teachingSteps: [
        '"One hundred twenty" = 120.',
        '120 has 1 hundred, 2 tens, 0 ones.',
        '2 tens = 20. Expanded form: 100 + 20 + 0.'
      ],
      correctAnswerExplanation: '"One hundred twenty" = 120 = 100 + 20 + 0.'
    }
  }),

  // ── hard end
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
    //  TEKS 1.2B · place_value_to_120
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l3',
      title: 'Numbers to 120',
      teks: ['1.2B'],
      skill: 'place_value_to_120',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        '10 tens make 100. That is why 100 has a 1 in the hundreds place.',
        'Numbers from 100 to 120 have 1 hundred, some tens, and some ones.',
        'After 100, tens and ones still work the same way.',
        '115 means 1 hundred, 1 ten, and 5 ones.',
        '120 means 1 hundred, 2 tens, and 0 ones.',
        'Numbers from 100 to 120 have a hundreds place, a tens place, and a ones place.'
      ],
      workedExamples: _l23Examples,
      quizBank: _l23QuizBank
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 2.4 — Represent Numbers
    //  TEKS 1.2C · represent_numbers_to_120
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l4',
      title: 'Represent Numbers',
      teks: ['1.2C'],
      skill: 'represent_numbers_to_120',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Standard form uses digits to write a number: 47.',
        'Expanded form shows the value of each place: 40 + 7.',
        'Word form writes a number in words: forty-seven.',
        'A base-10 model can match all three forms — the amount is always the same.',
        'Numbers to 120 can be written in all three forms, including hundreds: 113 = 100 + 10 + 3.',
        'Zero terms show empty places: 50 = 50 + 0, and 110 = 100 + 10 + 0.'
      ],
      workedExamples: _l24Examples,
      quizBank: _l24QuizBank
    }

  ]
};

export default G1_U2_SPEC;
