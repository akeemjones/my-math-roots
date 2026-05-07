/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 3: Addition and Subtraction to 20
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    Primary:
 *      1.3B  solve joining/separating/comparing word problems within 20 with
 *            unknowns in any position
 *      1.3C  compose 10 with two or more addends
 *      1.3D  apply basic fact strategies to add and subtract within 20
 *            (counting on, make 10, decompose to 10)
 *      1.3E  explain addition and subtraction strategies up to 20
 *      1.3F  generate and solve problem situations from + / – number sentences
 *            within 20
 *    Supporting (Algebraic Reasoning, where relevant):
 *      1.5D  represent word problems with concrete/pictorial models
 *      1.5E  understand the meaning of the equal sign
 *      1.5F  determine the unknown whole number in an + / – equation
 *      1.5G  apply properties of operations to add and subtract
 *
 *  TEKS 1.3A is intentionally NOT covered here — its scope is "multiple of 10
 *  + one-digit number to 99" which belongs in Unit 4 (Two-Digit Add/Sub).
 *
 *  Lessons:
 *    L3.1  Add Within 20                        ← stub (Phase 2)
 *    L3.2  Subtract Within 20                   ← stub (Phase 3)
 *    L3.3  Doubles and Near Doubles             ← stub (Phase 4)
 *    L3.4  Make 10                              ← stub (Phase 5)
 *    L3.5  Fact Families and Word Problems      ← stub (Phase 6)
 * ════════════════════════════════════════════════════════════════════════════ */

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
    //  Lesson 3.1 — Add Within 20
    //  TEKS 1.3D, 1.3E (supporting 1.5G)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u3-l1',
      title: 'Add Within 20',
      teks: ['1.3D', '1.3E', '1.5G'],
      skill: 'add_within_20_counting_on',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: []
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 3.2 — Subtract Within 20
    //  TEKS 1.3D, 1.3E (supporting 1.5F)
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
    //  Lesson 3.3 — Doubles and Near Doubles
    //  TEKS 1.3D, 1.3E (supporting 1.5G)
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
    //  Lesson 3.4 — Make 10
    //  TEKS 1.3C, 1.3D, 1.3E
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
    //  Lesson 3.5 — Fact Families and Word Problems
    //  TEKS 1.3B, 1.3E, 1.3F (supporting 1.5D, 1.5E, 1.5F)
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
