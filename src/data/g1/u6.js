/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 6: Measurement & Time
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.7A  Use non-standard units to describe the length of objects
 *    1.7B  Illustrate that length = same-size units, end-to-end, no gaps/overlaps
 *    1.7C  Measure same object with two different-size units; describe why counts differ
 *    1.7D  Describe length to the nearest whole unit using a number and a unit name
 *    1.7E  Tell time to the hour and half-hour using analog and digital clocks
 *
 *  Lessons:
 *    L6.1  Measuring with Non-Standard Units   ← SCAFFOLD (0 questions)
 *    L6.2  Understanding Units of Length       ← SCAFFOLD (0 questions)
 *    L6.3  Comparing Measurements              ← SCAFFOLD (0 questions)
 *    L6.4  Describing Length                   ← SCAFFOLD (0 questions)
 *    L6.5  Telling Time                        ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - Length: non-standard units ONLY (paper clips, cubes, tiles, etc.).
 *      Standard units (inches, centimeters, feet) are Grade 2 (TEKS 2.9).
 *      Do NOT introduce standard measurement units in any L6.1–L6.4 question.
 *    - L6.2: gaps-and-overlaps concept only — no area, no perimeter.
 *    - L6.3: compare unit counts when unit SIZE changes — same object only.
 *    - L6.4: nearest WHOLE unit only — no half-units, no fractions.
 *    - L6.5: hour and half-hour ONLY.
 *      Do NOT include minutes (other than :00/:30), elapsed time, or AM/PM.
 *      Elapsed time is Grade 2 content.
 * ════════════════════════════════════════════════════════════════════════════ */

// ── Lesson 6.1 data ──────────────────────────────────────────────────────────
const _l61KeyIdeas = [];
const _l61Examples = [];
const _l61Bank = [];

// ── Lesson 6.2 data ──────────────────────────────────────────────────────────
const _l62KeyIdeas = [];
const _l62Examples = [];
const _l62Bank = [];

// ── Lesson 6.3 data ──────────────────────────────────────────────────────────
const _l63KeyIdeas = [];
const _l63Examples = [];
const _l63Bank = [];

// ── Lesson 6.4 data ──────────────────────────────────────────────────────────
const _l64KeyIdeas = [];
const _l64Examples = [];
const _l64Bank = [];

// ── Lesson 6.5 data ──────────────────────────────────────────────────────────
const _l65KeyIdeas = [];
const _l65Examples = [];
const _l65Bank = [];

// ── Unit spec ─────────────────────────────────────────────────────────────────
export const G1_U6_SPEC = {
  unitId: 'g1u6',
  title: 'Measurement & Time',
  teks: ['1.7A', '1.7B', '1.7C', '1.7D', '1.7E'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.1 — Measuring with Non-Standard Units
    //  TEKS 1.7A | SCAFFOLD — 0 questions
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l1',
      title: 'Measuring with Non-Standard Units',
      teks: ['1.7A'],
      skill: 'measure_nonstandard_units',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l61KeyIdeas,
      workedExamples: _l61Examples,
      quizBank: _l61Bank,
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.2 — Understanding Units of Length
    //  TEKS 1.7B | SCAFFOLD — 0 questions
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l2',
      title: 'Understanding Units of Length',
      teks: ['1.7B'],
      skill: 'understand_length_units',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l62KeyIdeas,
      workedExamples: _l62Examples,
      quizBank: _l62Bank,
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.3 — Comparing Measurements
    //  TEKS 1.7C | SCAFFOLD — 0 questions
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l3',
      title: 'Comparing Measurements',
      teks: ['1.7C'],
      skill: 'compare_measurements',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l63KeyIdeas,
      workedExamples: _l63Examples,
      quizBank: _l63Bank,
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.4 — Describing Length
    //  TEKS 1.7D | SCAFFOLD — 0 questions
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l4',
      title: 'Describing Length',
      teks: ['1.7D'],
      skill: 'describe_length',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l64KeyIdeas,
      workedExamples: _l64Examples,
      quizBank: _l64Bank,
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 6.5 — Telling Time
    //  TEKS 1.7E | SCAFFOLD — 0 questions
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u6-l5',
      title: 'Telling Time',
      teks: ['1.7E'],
      skill: 'tell_time_hour_half_hour',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l65KeyIdeas,
      workedExamples: _l65Examples,
      quizBank: _l65Bank,
      diagnostics: {
        commonDistractors: [],
        errorTags: [],
        interventionRules: []
      }
    }

  ]
};

export default G1_U6_SPEC;
