/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 5: Geometry
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.6A  Classify and sort 2D shapes by attributes using informal language
 *    1.6B  Distinguish defining vs non-defining attributes of 2D and 3D shapes
 *    1.6C  Create 2D figures (circle, triangle, rectangle, square, rhombus, hexagon)
 *    1.6D  Identify 2D shapes and describe their attributes
 *    1.6E  Identify 3D solids and describe their attributes
 *    1.6F  Compose 2D shapes by joining two, three, or four figures
 *    1.6G  Partition 2D figures into two and four equal parts
 *    1.6H  Identify examples and non-examples of halves and fourths
 *
 *  Lessons:
 *    L5.1  2D Shapes — Identify and Describe     ← SCAFFOLD (0 questions)
 *    L5.2  3D Shapes — Identify and Describe     ← SCAFFOLD (0 questions)
 *    L5.3  Shape Attributes and Sorting          ← SCAFFOLD (0 questions)
 *    L5.4  Compose and Recognize 2D Shapes       ← SCAFFOLD (0 questions)
 *    L5.5  Equal Parts — Halves and Fourths      ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - 2D shapes: circle, triangle, rectangle, square, rhombus, hexagon ONLY.
 *    - Pentagon and octagon may appear as distractors/non-examples ONLY — never correct answers.
 *    - Do NOT use polygon or quadrilateral as required Grade 1 vocabulary.
 *    - 3D solids: sphere, cone, cylinder, cube, rectangular prism, triangular prism ONLY.
 *    - Square pyramid is NOT a Grade 1 solid — do not include.
 *    - L5.2: identification and real-world connection only — no face/edge/vertex counting.
 *    - L5.4: 2D shape composition only — no 3D, no symmetry.
 *    - L5.5: halves and fourths as equal parts only — no symmetry, no fractions beyond halves/fourths.
 *    - No symmetry content in any lesson (symmetry is TEKS 2.8D, Grade 2).
 * ════════════════════════════════════════════════════════════════════════════ */

export const G1_U5_SPEC = {
  unitId: 'g1u5',
  title: 'Geometry',
  teks: ['1.6A', '1.6B', '1.6C', '1.6D', '1.6E', '1.6F', '1.6G', '1.6H'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 5.1 — 2D Shapes — Identify and Describe (scaffold, 0 questions)
    //  TEKS 1.6C, 1.6D
    //  Shapes: circle, triangle, rectangle, square, rhombus, hexagon
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l1',
      title: '2D Shapes — Identify and Describe',
      teks: ['1.6C', '1.6D'],
      skill: 'identify_2d_shapes',
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
    //  Lesson 5.2 — 3D Shapes — Identify and Describe (scaffold, 0 questions)
    //  TEKS 1.6E
    //  Solids: sphere, cone, cylinder, cube, rectangular prism, triangular prism
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l2',
      title: '3D Shapes — Identify and Describe',
      teks: ['1.6E'],
      skill: 'identify_3d_solids',
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
    //  Lesson 5.3 — Shape Attributes and Sorting (scaffold, 0 questions)
    //  TEKS 1.6A, 1.6B
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l3',
      title: 'Shape Attributes and Sorting',
      teks: ['1.6A', '1.6B'],
      skill: 'shape_attributes_and_sorting',
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
    //  Lesson 5.4 — Compose and Recognize 2D Shapes (scaffold, 0 questions)
    //  TEKS 1.6F
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l4',
      title: 'Compose and Recognize 2D Shapes',
      teks: ['1.6F'],
      skill: 'compose_2d_shapes',
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
    //  Lesson 5.5 — Equal Parts — Halves and Fourths (scaffold, 0 questions)
    //  TEKS 1.6G, 1.6H
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u5-l5',
      title: 'Equal Parts — Halves and Fourths',
      teks: ['1.6G', '1.6H'],
      skill: 'equal_parts_halves_fourths',
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

export default G1_U5_SPEC;
