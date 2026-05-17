/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 8: Financial Literacy
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.9A  Define money earned as income
 *    1.9B  Identify income as a means of obtaining goods and services,
 *          oftentimes making choices about what to purchase
 *    1.9C  Distinguish between spending and saving
 *    1.9D  Consider charitable giving
 *
 *  Lessons:
 *    L8.1  Earning Income           ← SCAFFOLD (0 questions)
 *    L8.2  Goods and Services       ← SCAFFOLD (0 questions)
 *    L8.3  Spending and Saving      ← SCAFFOLD (0 questions)
 *    L8.4  Charitable Giving        ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - NO coin identification (penny / nickel / dime / quarter) — K.4A territory.
 *    - NO coin values, NO coin counting — K.4A / G2 2.5A territory.
 *    - NO dollars-and-cents math, NO decimal money notation — G2 2.5.
 *    - NO wants-vs-needs as a lesson skill — K.9D territory, not G1.
 *    - NO multi-step money word problems.
 *    - NO interest, NO tax, NO percentages, NO fractions.
 *    - NO Grade 2 financial-literacy content.
 *    - Multiple-choice questions only at the L8 scaffold stage.
 *    - Grade 2's "u5" Money & Financial Literacy content is OUT OF SCOPE —
 *      different namespace, different file, different progression.
 *
 *  Cross-grade name note: Grade 2 default Unit 5 lives at src/data/u5.js
 *  ("Money & Financial Literacy"). Grade 2 default Unit 8 lives at
 *  src/data/u8.js ("Fractions"). This file is Grade 1's separate Unit 8
 *  namespace (g1u8) and is unrelated to either of those Grade 2 files.
 * ════════════════════════════════════════════════════════════════════════════ */


// ── Unit spec ────────────────────────────────────────────────────────────────
//  Phase 1 scaffold: empty lesson banks, infrastructure-only. Lesson content
//  is added in subsequent phases (L8.1 → L8.2 → L8.3 → L8.4) following the
//  same Plan → Implement → Verify → Lock pattern used for U7.
export const G1_U8_SPEC = {
  unitId: 'g1u8',
  title: 'Financial Literacy',
  teks: ['1.9A', '1.9B', '1.9C', '1.9D'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.1 — Earning Income   (SCAFFOLD)
    //  TEKS 1.9A | Focus: money earned by working at a job is called income.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l1',
      title: 'Earning Income',
      teks: ['1.9A'],
      skill: 'earning_income',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.2 — Goods and Services   (SCAFFOLD)
    //  TEKS 1.9B | Focus: income helps people obtain goods and services;
    //  people make purchase choices.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l2',
      title: 'Goods and Services',
      teks: ['1.9B'],
      skill: 'goods_and_services',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.3 — Spending and Saving   (SCAFFOLD)
    //  TEKS 1.9C | Focus: distinguish between spending and saving.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l3',
      title: 'Spending and Saving',
      teks: ['1.9C'],
      skill: 'spending_and_saving',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.4 — Charitable Giving   (SCAFFOLD)
    //  TEKS 1.9D | Focus: consider giving money to help others.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l4',
      title: 'Charitable Giving',
      teks: ['1.9D'],
      skill: 'charitable_giving',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    }

  ]
};

export default G1_U8_SPEC;
