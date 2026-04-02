/**
 * Tour service — spotlight definitions and state management.
 * Ported from src/tour.js.
 */

export interface SpotStep {
  sel: string;
  emoji: string;
  title: string;
  tip: string;
}

/** SvelteKit route → legacy screen id mapping for tour flags. */
function routeToScreenId(path: string): string | null {
  if (path === '/') return 'home';
  if (path.startsWith('/unit/')) return 'unit-screen';
  if (path.startsWith('/lesson/')) return 'lesson-screen';
  if (path.startsWith('/quiz/')) return 'quiz-screen';
  if (path === '/settings') return 'settings-screen';
  if (path === '/history') return 'history-screen';
  return null;
}

/** Per-screen spotlight tour definitions (from legacy SPOT_TOURS). */
export const SPOT_TOURS: Record<string, SpotStep[]> = {
  'home': [
    { sel: '.op-title', emoji: '📊', title: 'Your Progress', tip: 'This bar shows how many lessons you\'ve finished across all 10 units. Watch it grow as you learn!' },
    { sel: '#streak-badge', emoji: '🔥', title: 'Daily Streak', tip: 'Complete a lesson every day to build your streak! Tap the flame to open your streak calendar.' },
    { sel: '#ugrid .cs', emoji: '📚', title: 'Math Units', tip: 'Tap any unit card to open it and start learning. Scroll down to see all 10 units!' },
    { sel: '.scores-link .big-btn', emoji: '🏆', title: 'Score History', tip: 'Tap here to review every quiz you\'ve taken — see your stars, score, and go back over any questions!' },
    { sel: '.cog-btn', emoji: '⚙️', title: 'Settings', tip: 'Change your name, appearance, and sounds here. Parents can open controls with a PIN!' },
  ],
  'unit-screen': [
    { sel: '#lesson-cards .lcard, .lcard', emoji: '📖', title: 'Lessons', tip: 'Complete lessons in order — each one unlocks the next. Finish all of them to unlock the Unit Quiz!' },
    { sel: '#uq-btn, .uq-btn', emoji: '🏆', title: 'Unit Quiz', tip: 'A 25-question challenge covering everything in this unit. Score 80% or more to unlock the next unit!' },
  ],
  'lesson-screen': [
    { sel: '.learn-card', emoji: '💡', title: 'Key Ideas', tip: 'Read these facts and rules first — quiz questions are based directly on them!' },
    { sel: '#ex-card', emoji: '📖', title: 'Worked Examples', tip: 'See problems solved step by step. Tap ✨ New Examples anytime for a fresh set to study!' },
    { sel: '.practice-card', emoji: '✏️', title: 'Practice Problems', tip: 'Try each problem yourself, then tap 👀 Show Answer to check. Use ➕ More Practice for unlimited extras!' },
    { sel: '.lq-banner', emoji: '🚀', title: 'Quiz Time!', tip: 'When ready, take the 8-question Lesson Quiz. Score 80% or higher to unlock the next lesson — retry as many times as you need!' },
  ],
  'quiz-screen': [
    { sel: '#qlbl, .qlbl', emoji: '📊', title: 'Question Counter', tip: 'Shows your current question out of the total. Take your time — read each one carefully!' },
    { sel: '#qtimer, .qtimer', emoji: '⏱️', title: 'Quiz Timer', tip: 'Counts down your time for this quiz. Parents can turn the timer on/off and adjust the time limit inside Parent Controls!' },
    { sel: '.quiz-scratch-btn', emoji: '✏️', title: 'Scratch Pad', tip: 'Open a drawing pad to work out problems by hand — just like using paper!' },
    { sel: '.quiz-restart-btn', emoji: '↩️', title: 'Start Over', tip: 'Restart the quiz from question 1 at any time. Your current attempt will be saved as Abandoned in Score History.' },
    { sel: '.quiz-quit-btn', emoji: '🚪', title: 'Quit Quiz', tip: 'Exit the quiz early — a confirmation box will appear first. Your attempt is saved as Quit in Score History.' },
  ],
  'settings-screen': [
    { sel: '.set-section button, [data-action="goParentControls"]', emoji: '🔐', title: 'Parent Controls', tip: 'Set quiz timers, unlock lessons, clear scores, and send feedback. Default PIN: 1234.' },
  ],
  'history-screen': [
    { sel: '.hist-card, .sc-card', emoji: '📋', title: 'Score Entry', tip: 'Tap any entry to review your answers and see exactly which questions you got right or wrong!' },
  ],
};

/** Tutorial slide data (shown on first launch). */
export const TUT_SLIDES = [
  {
    emoji: '🌱',
    title: 'Welcome to My Math Roots!',
    body: 'A <strong>K–5 math practice app</strong> built to help students learn, practice, and grow through structured lessons and quizzes. Tap <strong>Next</strong> to continue or <strong>Skip</strong> to jump straight in!',
  },
  {
    emoji: '🗺️',
    title: 'Guided Page Tours',
    body: 'Each time you visit a <strong>new page</strong> for the first time, a quick tour highlights every feature — so you always know exactly what to do. Let\'s start with the home screen!',
  },
];

const TUT_FLAG = 'wb_tutorial_v2';
const SPOT_PREFIX = 'wb_spot_';

export function isTutorialDone(): boolean {
  return !!localStorage.getItem(TUT_FLAG);
}

export function markTutorialDone(): void {
  localStorage.setItem(TUT_FLAG, '1');
}

export function isScreenTourDone(path: string): boolean {
  const screenId = routeToScreenId(path);
  if (!screenId) return true;
  if (!SPOT_TOURS[screenId]) return true;
  return !!localStorage.getItem(SPOT_PREFIX + screenId);
}

export function markScreenTourDone(path: string): void {
  const screenId = routeToScreenId(path);
  if (screenId) localStorage.setItem(SPOT_PREFIX + screenId, '1');
}

export function getScreenTourSteps(path: string): SpotStep[] {
  const screenId = routeToScreenId(path);
  if (!screenId) return [];
  return SPOT_TOURS[screenId] ?? [];
}

/** Find the first matching element from a comma-separated selector list. */
export function findTourElement(sel: string): Element | null {
  const selectors = sel.split(',').map(s => s.trim());
  for (const s of selectors) {
    try {
      const el = document.querySelector(s);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) return el;
      }
    } catch { /* invalid selector — skip */ }
  }
  return null;
}
