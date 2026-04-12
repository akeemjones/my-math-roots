/**
 * Content types — Units, Lessons, Questions, Examples, Practice.
 * These mirror the data structures in src/data/shared.js and src/data/u{N}.js.
 */

/** Difficulty tag on a qBank question. */
export type Difficulty = 'e' | 'm' | 'h';

/** A single multiple-choice question in a qBank. */
export interface Question {
  /** Question text. */
  t: string;
  /** Answer options (typically 4). */
  o: string[];
  /** Index of the correct answer in `o` (0-based). */
  a: number;
  /** Explanation shown after answering. */
  e: string;
  /** Difficulty tag — easy / medium / hard. */
  d?: Difficulty;
  /** Inline SVG markup for visual/geometry questions. */
  s?: string;
}

/** A worked example shown during the lesson. */
export interface Example {
  /** Accent colour (hex). */
  c: string;
  /** Short label, e.g. "No Regrouping". */
  tag: string;
  /** Problem statement, e.g. "23 + 45 = ?". */
  p: string;
  /** Solution — may contain HTML/SVG markup. */
  s: string;
  /** Answer text shown after the solution, e.g. "23 + 45 = 68 ✅". */
  a: string;
  /** Optional visualization hint for animated renderers, e.g. "add:🍎:7:3". */
  vis?: string;
}

/** A freeform practice problem (typed answer, not multiple choice). */
export interface PracticeItem {
  /** Question text. */
  q: string;
  /** Correct answer. */
  a: string;
  /** Hint shown on request. */
  h: string;
  /** Encouragement text shown after answering. */
  e: string;
}

/** Full lesson content — merged in from a data file after lazy-load. */
export interface LessonContent {
  /** Bullet-point teaching notes shown at the top of the lesson. */
  points: string[];
  /** Worked examples with step-by-step solutions. */
  examples: Example[];
  /** Freeform practice problems. */
  practice: PracticeItem[];
  /** Question bank used to build adaptive quizzes. */
  qBank: Question[];
  /** Legacy alias for qBank — present in some older unit files. */
  quiz?: Question[];
}

/**
 * Lesson shell — always present in memory (defined in shared.js).
 * Content fields are merged in after the unit data file loads.
 */
export interface Lesson extends Partial<LessonContent> {
  /** Unique lesson ID, e.g. "u1l1". */
  id: string;
  /** Display title, e.g. "Count Up & Count Back". */
  title: string;
  /** Emoji icon. */
  icon: string;
  /** Short description shown on the lesson card. */
  desc: string;
  /** TEKS standard codes covered by this lesson, e.g. ["2.4A", "2.7C"]. */
  teks_tags?: string[];
  /** True for lessons that extend beyond the grade-level TEKS scope. */
  enrichment?: boolean;
  /** Grade level of the enrichment content (3 or 4). */
  enrichment_grade?: 3 | 4;
}

/** Unit-level quiz question bank. */
export interface UnitQuiz {
  qBank: Question[];
}

/** A full unit — the top-level curriculum node. */
export interface Unit {
  /** Unique unit ID, e.g. "u1". */
  id: string;
  /** Display name, e.g. "Basic Fact Strategies". */
  name: string;
  /** Emoji icon. */
  icon: string;
  /** Inline SVG markup for the unit card illustration. */
  svg: string;
  /** Brand colour (hex). */
  color: string;
  /** Grade period (used for curriculum sequencing). */
  gp: number;
  /** TEKS standard reference, e.g. "TEKS 2.4A". */
  teks: string;
  /** TEKS standard codes covered by this unit, e.g. ["2.4A", "2.7C"]. */
  teks_tags?: string[];
  /** Optional unit description shown in the banner. */
  desc?: string;
  /** Lesson shells — always present; content merged after load. */
  lessons: Lesson[];
  /** Unit quiz bank — merged in from the data file. */
  unitQuiz?: UnitQuiz;
  /** Questions pooled into the Final Test. */
  testBank?: Question[];
  /** True once the data file for this unit has been loaded. */
  _loaded: boolean;
}
