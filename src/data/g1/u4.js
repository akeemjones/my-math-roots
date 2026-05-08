/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 4: Tens and Ones Operations
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    Primary:    1.3A
 *    Supporting: 1.5C, 1.5D, 1.5G
 *
 *  Lessons:
 *    L4.1  Add Tens and Ones                    ← SCAFFOLD (0 questions)
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
    //  Lesson 4.1 — Add Tens and Ones (0 questions — scaffold)
    //  Scope: multiple of 10 + one-digit number, e.g. 40 + 5 = 45, 60 + 8 = 68
    //  TEKS 1.3A
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u4-l1',
      title: 'Add Tens and Ones',
      teks: ['1.3A'],
      skill: 'add_tens_and_ones',
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
