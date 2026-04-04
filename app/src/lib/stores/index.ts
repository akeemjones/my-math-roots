/**
 * Barrel re-export for all Svelte stores.
 * Import from '$lib/stores' to get everything in one place.
 */

// Content
export { unitsData, activeUnit, mergeUnitContent } from './content.js';

// Quiz & scores
export { cur, scores, bestScore, hasPassed } from './quiz.js';

// User & auth
export { authUser, familyProfiles, activeStudentId, activeStudent, isSignedIn, isStudentActive, guestMode } from './user.js';

// Progress
export { mastery, streak, done, appTime, actDates, isDone, recentSecs, currentStreak, aiReports, unlockSettings, initialPullDone, syncStatus } from './progress.js';

// Preferences
export { a11y, settings } from './prefs.js';
