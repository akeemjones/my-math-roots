/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 2: Place Value
 *  Design Spec — schema version 0.2.0
 *
 *  Phase 1 stub: infrastructure only.
 *  QuizBank content (Lessons 2.1–2.4) will be written in a follow-up phase.
 *
 *  TEKS covered:
 *    1.2A  Recognize and create sets of 10 and adjust for ones
 *    1.2B  Compose/decompose numbers to 120 as tens and ones
 *    1.2C  Represent numbers to 120 in standard, expanded, and word form
 *
 *  Lessons:
 *    L2.1  Groups of Ten      — 1.2B  compose_groups_of_ten
 *    L2.2  Tens and Ones      — 1.2B  tens_and_ones
 *    L2.3  Numbers to 120     — 1.2B  place_value_to_120
 *    L2.4  Represent Numbers  — 1.2C  represent_numbers_to_120
 * ════════════════════════════════════════════════════════════════════════════ */

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
        'We can count faster by making groups of 10.',
        '10 ones is the same as 1 ten.',
        'A tens rod shows 1 group of 10.',
        'Making groups of 10 helps us tell how many there are quickly.'
      ],
      workedExamples: [],
      quizBank: []
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
    //  TEKS 1.2B · place_value_to_120
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
    //  TEKS 1.2C · represent_numbers_to_120
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
