/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 7: Data Analysis
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.8A  Collect, sort, and organize data in up to three categories
 *          using models/representations such as tally marks or T-charts
 *    1.8B  Use data to create picture and bar-type graphs
 *    1.8C  Draw conclusions and generate/answer questions from data
 *
 *  Lessons:
 *    L7.1  Sorting and Organizing Data       ← SCAFFOLD (0 questions)
 *    L7.2  Picture Graphs                    ← SCAFFOLD (0 questions)
 *    L7.3  Bar-Type Graphs                   ← SCAFFOLD (0 questions)
 *    L7.4  Drawing Conclusions from Data     ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - Picture graphs: 1 picture = 1 data point ONLY (no scaled keys).
 *    - Bar graphs: each unit/cell = 1 (no skip-count scales).
 *    - No line plots, histograms, frequency tables, mean/median/mode.
 *    - Up to 3 categories at L7.1; up to 4 categories at L7.2–L7.4.
 *    - Individual category counts capped at ~10 for legibility.
 *    - L7.4 differences framed as graph-reading, not equations
 *      (no '+' or '−' symbols in prompts).
 *    - Grade 2's "u6" Data Analysis content (tally groups of 5, scaled
 *      picture graphs, line plots) is OUT OF SCOPE — different namespace,
 *      different file, different progression.
 *
 *  Cross-grade name note: Grade 2 default Data Analysis lives at
 *  src/data/u6.js with unit id "u6" (Grade 2 numbers it as Unit 6).
 *  This file is Grade 1's separate Unit 7 namespace (g1u7).
 * ════════════════════════════════════════════════════════════════════════════ */


// ── Unit spec (scaffold) ─────────────────────────────────────────────────────
export const G1_U7_SPEC = {
  unitId: 'g1u7',
  title: 'Data Analysis',
  teks: ['1.8A', '1.8B', '1.8C'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.1 — Sorting and Organizing Data   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l1',
      title: 'Sorting and Organizing Data',
      teks: ['1.8A'],
      skill: 'sort_and_organize_data',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.2 — Picture Graphs   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l2',
      title: 'Picture Graphs',
      teks: ['1.8B'],
      skill: 'read_build_picture_graphs',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.3 — Bar-Type Graphs   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l3',
      title: 'Bar-Type Graphs',
      teks: ['1.8B'],
      skill: 'read_build_bar_graphs',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 7.4 — Drawing Conclusions from Data   (SCAFFOLD)
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u7-l4',
      title: 'Drawing Conclusions from Data',
      teks: ['1.8C'],
      skill: 'draw_conclusions_from_data',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    }

  ]
};

export default G1_U7_SPEC;
