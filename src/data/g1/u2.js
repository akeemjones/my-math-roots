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
    //  TEKS 1.2B · tens_and_ones  ← stub
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u2-l2',
      title: 'Tens and Ones',
      teks: ['1.2B'],
      skill: 'tens_and_ones',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [
        'Two-digit numbers have a tens place and an ones place.',
        'The tens digit tells how many groups of 10.',
        'The ones digit tells how many leftover ones.',
        '34 = 3 tens and 4 ones = 30 + 4.'
      ],
      workedExamples: [],
      quizBank: []
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
