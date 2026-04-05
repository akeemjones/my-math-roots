/**
 * Barrel re-export for all type definitions.
 * Import from '$lib/types' to get everything in one place.
 */

export type {
  Difficulty,
  Question,
  Example,
  PracticeItem,
  LessonContent,
  Lesson,
  UnitQuiz,
  Unit,
} from './content.js';

export type {
  StudentProfile,
  AuthUser,
  A11yPrefs,
  AppSettings,
} from './user.js';

export { DEFAULT_A11Y_PREFS, DEFAULT_APP_SETTINGS } from './user.js';

export type {
  QuizType,
  QuizAnswer,
  QuizState,
  CurrentState,
  ScoreEntry,
} from './quiz.js';

export type {
  MasteryEntry,
  MasteryMap,
  StreakState,
  DoneMap,
  AppTimeState,
} from './progress.js';

export { DEFAULT_STREAK, DEFAULT_APP_TIME } from './progress.js';
