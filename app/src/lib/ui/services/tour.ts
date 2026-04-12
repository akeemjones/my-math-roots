/**
 * Tour service — spotlight definitions and state management.
 * Ported from src/tour.js.
 *
 * Onboarding state is stored in two places:
 *  1. localStorage (for immediate reads — no async needed in render path)
 *  2. student_profiles.onboarding_json in Supabase (account-level persistence)
 *
 * On pull, cloud state is written to localStorage.
 * On tutorial/spotlight completion, both localStorage and cloud are updated.
 */

import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { supabase } from '$lib/core/supabase';
import { activeStudent } from '$lib/core/stores';

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
    { sel: '.set-sec-head', emoji: '🎨', title: 'Settings', tip: 'Customize your name, theme, sounds, and accessibility options here.' },
    { sel: '.set-save, .set-section button', emoji: '📲', title: 'Install App', tip: 'Add My Math Roots to your home screen for a full-screen experience — no App Store needed!' },
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
const INSTALL_FLAG = 'install_seen';
const SCROLL_HINT_FLAG = 'scroll_hint_seen';

// ── Cookie helpers (persist across PWA reinstalls on same device) ─────────────
// Safari's standalone PWA has separate localStorage from the browser, so
// re-adding to home screen wipes localStorage. Cookies survive reinstalls.

const COOKIE_EXPIRY_DAYS = 365;

function setCookie(name: string, value: string): void {
  if (!browser) return;
  const expires = new Date(Date.now() + COOKIE_EXPIRY_DAYS * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (!browser) return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Check localStorage first, then cookie fallback. If cookie has it, backfill localStorage. */
function getOnboardingFlag(key: string): boolean {
  if (!browser) return false;
  if (localStorage.getItem(key)) return true;
  if (getCookie(key)) {
    // Backfill localStorage from cookie so future reads are fast
    try { localStorage.setItem(key, '1'); } catch { /* quota */ }
    return true;
  }
  return false;
}

/** Write to both localStorage and cookie so it survives PWA reinstalls. */
function setOnboardingFlag(key: string): void {
  if (!browser) return;
  try { localStorage.setItem(key, '1'); } catch { /* quota */ }
  setCookie(key, '1');
}

// ── Read state (localStorage + cookie fallback) ───────────────────────────────

export function isInstallSeen(): boolean {
  if (!browser) return false;
  return getOnboardingFlag(INSTALL_FLAG);
}

export function markInstallSeen(): void {
  if (!browser) return;
  setOnboardingFlag(INSTALL_FLAG);
}

export function isScrollHintSeen(): boolean {
  if (!browser) return false;
  return getOnboardingFlag(SCROLL_HINT_FLAG);
}

export function markScrollHintSeen(): void {
  if (!browser) return;
  setOnboardingFlag(SCROLL_HINT_FLAG);
  pushOnboardingToCloud();
}

export function isTutorialDone(): boolean {
  if (!browser) return false;
  return getOnboardingFlag(TUT_FLAG);
}

export function isScreenTourDone(path: string): boolean {
  if (!browser) return true;
  const screenId = routeToScreenId(path);
  if (!screenId) return true;
  if (!SPOT_TOURS[screenId]) return true;
  return getOnboardingFlag(SPOT_PREFIX + screenId);
}

export function getScreenTourSteps(path: string): SpotStep[] {
  const screenId = routeToScreenId(path);
  if (!screenId) return [];
  return SPOT_TOURS[screenId] ?? [];
}

// ── Write state (localStorage + cloud push) ──────────────────────────────────

export function markTutorialDone(): void {
  if (!browser) return;
  setOnboardingFlag(TUT_FLAG);
  pushOnboardingToCloud();
}

export function markScreenTourDone(path: string): void {
  if (!browser) return;
  const screenId = routeToScreenId(path);
  if (screenId) {
    setOnboardingFlag(SPOT_PREFIX + screenId);
    pushOnboardingToCloud();
  }
}

// ── Cloud sync helpers ───────────────────────────────────────────────────────

/** Build the onboarding_json object from current localStorage state. */
function buildOnboardingJson(): Record<string, boolean> {
  if (!browser) return {};
  const obj: Record<string, boolean> = {};
  if (localStorage.getItem(TUT_FLAG)) obj.tutorial = true;
  if (localStorage.getItem(SCROLL_HINT_FLAG)) obj.scroll_hint = true;
  for (const screenId of Object.keys(SPOT_TOURS)) {
    if (localStorage.getItem(SPOT_PREFIX + screenId)) {
      obj[`spot_${screenId}`] = true;
    }
  }
  return obj;
}

/**
 * Push current onboarding state to Supabase.
 * Fire-and-forget — called after marking a step done.
 */
async function pushOnboardingToCloud(): Promise<void> {
  const student = get(activeStudent);
  if (!student) return;

  const onboarding = buildOnboardingJson();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('student_profiles')
        .update({ onboarding_json: onboarding })
        .eq('id', student.id);
    } else {
      // PIN-only students: onboarding persists in localStorage only.
      // The push_student_progress RPC does not accept p_onboarding_json.
    }
  } catch {
    // Non-critical — localStorage is the primary read path
  }
}

/**
 * Apply cloud onboarding state to localStorage.
 * Called from sync.ts during pullStudentData.
 */
export function applyCloudOnboarding(cloud: Record<string, boolean> | null): void {
  if (!browser) return;
  if (!cloud || typeof cloud !== 'object') return;

  if (cloud.tutorial) setOnboardingFlag(TUT_FLAG);
  if (cloud.scroll_hint) setOnboardingFlag(SCROLL_HINT_FLAG);
  for (const screenId of Object.keys(SPOT_TOURS)) {
    if (cloud[`spot_${screenId}`]) {
      setOnboardingFlag(SPOT_PREFIX + screenId);
    }
  }
}

/**
 * Clear all onboarding localStorage flags.
 * Called when switching to a different student profile so the new
 * student's cloud state takes precedence on the next pull.
 */
export function clearOnboardingLocal(): void {
  if (!browser) return;
  localStorage.removeItem(TUT_FLAG);
  localStorage.removeItem(SCROLL_HINT_FLAG);
  for (const screenId of Object.keys(SPOT_TOURS)) {
    localStorage.removeItem(SPOT_PREFIX + screenId);
  }
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
