/**
 * SVG icon strings — parent dashboard.
 *
 * All icons are inline SVG strings, used via {@html ICON_NAME}.
 * currentColor inherits surrounding text color; explicit fills for colored icons.
 * style="vertical-align:middle" keeps icons aligned with adjacent text.
 */

const i = (svg: string) => svg; // identity — helps linters treat these as strings

/* ══════════════════════════════════════
   SECTION HEADER ICONS (currentColor)
   ══════════════════════════════════════ */

/** 📊  Line graph  ·  header title */
export const ICON_BARCHART = i(`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <!-- axes -->
  <line x1="2" y1="2" x2="2" y2="17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
  <line x1="2" y1="17" x2="18" y2="17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
  <!-- trend line -->
  <polyline points="2,14 6,10 10,11 14,6 18,3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <!-- dots -->
  <circle cx="6"  cy="10" r="1.5" fill="currentColor"/>
  <circle cx="10" cy="11" r="1.5" fill="currentColor"/>
  <circle cx="14" cy="6"  r="1.5" fill="currentColor"/>
  <circle cx="18" cy="3"  r="1.5" fill="currentColor"/>
</svg>`);

/** 👤  Person  ·  Manage Profiles */
export const ICON_PERSON = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <circle cx="9" cy="5" r="3.5" fill="currentColor"/>
  <path d="M1.5 17.5c0-4.14 3.36-6.5 7.5-6.5s7.5 2.36 7.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
</svg>`);

/** 📆  Calendar  ·  This Week */
export const ICON_CALENDAR = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <rect x="1" y="3" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M1 7h16" stroke="currentColor" stroke-width="1.4"/>
  <line x1="5.5" y1="1.5" x2="5.5" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="12.5" y1="1.5" x2="12.5" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="6" cy="11" r="1" fill="currentColor"/>
  <circle cx="9" cy="11" r="1" fill="currentColor"/>
  <circle cx="12" cy="11" r="1" fill="currentColor"/>
</svg>`);

/** ⏱  Stopwatch  ·  Time / Quiz Timer */
export const ICON_TIMER = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <circle cx="9" cy="11" r="6.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M9 7.5V11.5l3 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 2h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M15.5 5.5l-1.2 1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`);

/** 📋  Clipboard  ·  Recent Quizzes / What's New */
export const ICON_CLIPBOARD = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <rect x="3" y="3" width="12" height="14" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M6.5 3V2a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M6 8h6M6 11h6M6 14h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`);

/** ⚠️  Warning triangle  ·  Needs Attention */
export const ICON_WARNING = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <path d="M9 2L1 16h16L9 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>
  <line x1="9" y1="8" x2="9" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="9" cy="14.5" r=".9" fill="currentColor"/>
</svg>`);

/** 📝  Memo  ·  Needs More Practice */
export const ICON_MEMO = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <path d="M13 1H3a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V4l-3-3z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
  <path d="M13 1v3h3" stroke="currentColor" stroke-width="1.3"/>
  <path d="M5 8h8M5 11h8M5 14h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`);

/** 🔁  Cycle arrows  ·  Review Queue */
export const ICON_CYCLE = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <path d="M15 9A6 6 0 103 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M15 5.5V9h-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 12.5V9H6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

/** 📅  Calendar grid  ·  Activity */
export const ICON_CALDAY = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <rect x="1" y="3" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M1 7h16" stroke="currentColor" stroke-width="1.4"/>
  <line x1="5.5" y1="1.5" x2="5.5" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="12.5" y1="1.5" x2="12.5" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="5" y="9.5" width="2.5" height="2.5" rx=".5" fill="currentColor"/>
  <rect x="9" y="9.5" width="2.5" height="2.5" rx=".5" fill="currentColor" opacity=".6"/>
  <rect x="5" y="13" width="2.5" height="2.5" rx=".5" fill="currentColor" opacity=".6"/>
</svg>`);

/** 🔓  Unlocked padlock  ·  Access Controls */
export const ICON_UNLOCK = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <rect x="4" y="8" width="10" height="9" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M12 8V5a5 5 0 00-10 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <circle cx="9" cy="12.5" r="1.3" fill="currentColor"/>
</svg>`);

/** ♿  Accessibility symbol */
export const ICON_A11Y = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <circle cx="9" cy="2.5" r="1.8" fill="currentColor"/>
  <path d="M9 5v5l4 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M5 6.5l4 .5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M7 10.5A4 4 0 1012.8 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
</svg>`);

/** 🔑  Key  ·  Change Parent PIN */
export const ICON_KEY = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <circle cx="6.5" cy="7.5" r="4" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M10 10.5L16 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M13 14l1.5-1.5M15 16l1.5-1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`);

/** 🔔  Bell  ·  Reminders */
export const ICON_BELL = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <path d="M9 1.5a6 6 0 00-6 6v4.5H3l-1.5 1.5h15L15 12h-.5V7.5a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>
  <path d="M7 14.5a2 2 0 004 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`);

/** 🔒  Locked padlock  ·  Change Password */
export const ICON_LOCK = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <rect x="4" y="8" width="10" height="9" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M5.5 8V6a3.5 3.5 0 017 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <circle cx="9" cy="12.5" r="1.3" fill="currentColor"/>
</svg>`);

/** 💬  Speech bubble  ·  Send Feedback */
export const ICON_CHAT = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <path d="M2 2.5h14a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3V3.5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>
  <path d="M5.5 7.5h7M5.5 10h4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`);

/** 🤖  Robot  ·  AI Progress Report */
export const ICON_ROBOT = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <rect x="2" y="6" width="14" height="10" rx="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <circle cx="6.5" cy="11" r="1.5" fill="currentColor"/>
  <circle cx="11.5" cy="11" r="1.5" fill="currentColor"/>
  <path d="M6.5 14h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M9 6V3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="9" cy="2.5" r="1" fill="currentColor"/>
  <path d="M1 9.5h1.5M15.5 9.5H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`);

/* ══════════════════════════════════════
   ROOT SYSTEM STATE ICONS
   ══════════════════════════════════════ */

/** 🌳  Tree  ·  mastered state */
export const ICON_TREE = i(`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M10 18V10" stroke="#2e7d32" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="10" cy="7.5" r="5.5" fill="#43a047" opacity=".9"/>
  <circle cx="6.5" cy="10.5" r="3.5" fill="#388e3c"/>
  <circle cx="13.5" cy="10.5" r="3.5" fill="#388e3c"/>
  <circle cx="10" cy="5" r="3.5" fill="#66bb6a"/>
</svg>`);

/** 🌿  Sprout  ·  growing state */
export const ICON_SPROUT = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M9 17V9" stroke="#558b2f" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M9 9C9 9 4 8 3 4c4 0 6 2 6 5z" fill="#7cb342"/>
  <path d="M9 12C9 12 13 11 14 7c-4 0-5 2-5 5z" fill="#9ccc65"/>
</svg>`);

/** 🪨  Rock  ·  locked/not-started state */
export const ICON_ROCK = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <ellipse cx="9" cy="11" rx="7" ry="5.5" fill="#b0bec5"/>
  <path d="M2.5 11C3 7 6 4.5 9 4.5s6 2.5 6.5 6.5" fill="#cfd8dc"/>
  <path d="M3 10C4 7 6.5 5 9 5s5 2 6 5" stroke="#90a4ae" stroke-width=".8" fill="none"/>
</svg>`);

/* ══════════════════════════════════════
   WEEKLY / ACTIVITY ICONS
   ══════════════════════════════════════ */

/** 🔥  Flame  ·  streak */
export const ICON_FLAME = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M9 1C9 1 12 4.5 12 7.5c0 1-.4 1.8-1 2.3C11.5 8 10.5 7 10 6c0 0-1 2-1 4a3 3 0 01-3-3C4 9.5 5 12.5 7 14a5 5 0 0010-4c0-3-2-5.5-2-5.5-1 2-2 2.5-2 2.5C13.5 5.5 9 1 9 1z" fill="#f57f17"/>
  <path d="M9 10c0 2 1 3.5 2.5 4A4 4 0 017 10.5C7 9 8 7.5 8 7.5 8 9 9 10 9 10z" fill="#ffcc02"/>
</svg>`);

/** 📖  Open book  ·  lessons */
export const ICON_BOOK = i(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:4px">
  <path d="M9 4C9 4 6 2.5 2 3v12c4-.5 7 1 7 1V4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>
  <path d="M9 4c0 0 3-1.5 7-1v12c-4-.5-7 1-7 1V4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>
  <line x1="9" y1="4" x2="9" y2="16" stroke="currentColor" stroke-width="1.2"/>
</svg>`);

/* ══════════════════════════════════════
   UI / STATE ICONS
   ══════════════════════════════════════ */

/** ✅  Green check circle */
export const ICON_CHECK_CIRCLE = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <circle cx="8" cy="8" r="7.5" fill="#2e7d32"/>
  <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

/** ❌  Red cross circle */
export const ICON_CROSS_CIRCLE = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <circle cx="8" cy="8" r="7.5" fill="#c62828"/>
  <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
</svg>`);

/** 🗑  Trash / Full Reset */
export const ICON_TRASH = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M2 4h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4" stroke="currentColor" stroke-width="1.3"/>
  <rect x="3" y="4" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M6.5 7v4M9.5 7v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`);

/** 🔄  Refresh */
export const ICON_REFRESH = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block;margin-right:3px">
  <path d="M13.5 8A5.5 5.5 0 112.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M13.5 4V8H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

/** 🎉  Party popper */
export const ICON_PARTY = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M2 14L7 3l6 6-11 5z" fill="#f57f17" stroke="#e65100" stroke-width=".8"/>
  <circle cx="12" cy="4" r="1" fill="#6c5ce7"/>
  <circle cx="14" cy="7" r=".8" fill="#00b894"/>
  <circle cx="10" cy="2" r=".8" fill="#e74c3c"/>
  <circle cx="13" cy="2.5" r=".6" fill="#fdcb6e"/>
</svg>`);

/** 💡  Light bulb */
export const ICON_BULB = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M5.5 10.5A4 4 0 018 2a4 4 0 012.5 8.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M5.5 10.5h5v1a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-1z" stroke="currentColor" stroke-width="1.2" fill="none"/>
  <line x1="6.5" y1="13.5" x2="9.5" y2="13.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`);

/** 📈  Trend up */
export const ICON_TREND = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M1.5 12l4-4 3 2 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.5 4h3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

/** ⏰  Alarm clock */
export const ICON_ALARM = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <circle cx="8" cy="9" r="5.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M8 6.5V9l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M2 4.5L4 2.5M14 4.5L12 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M6 14.5l1 1h2l1-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`);

/** 🌟  Free Mode star label */
export const ICON_STAR = i(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;display:inline-block">
  <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10l-3.6 2 .7-4L2.2 5.2l4-.6L8 1z" fill="#f59e0b" stroke="#e08000" stroke-width=".6" stroke-linejoin="round"/>
</svg>`);

/* ══════════════════════════════════════
   AVATAR ICONS  (white, for colored bg)
   ══════════════════════════════════════ */

/** 🦁  Lion avatar */
export const AVT_LION = i(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
  <!-- mane -->
  <circle cx="16" cy="16" r="13" fill="white" opacity=".25"/>
  <circle cx="16" cy="16" r="10.5" fill="white" opacity=".85"/>
  <!-- ears -->
  <path d="M8 10l-2-4 4 2z" fill="white" opacity=".9"/>
  <path d="M24 10l2-4-4 2z" fill="white" opacity=".9"/>
  <!-- snout -->
  <ellipse cx="16" cy="20" rx="4.5" ry="3" fill="white" opacity=".55"/>
  <!-- eyes -->
  <circle cx="12.5" cy="15" r="1.4" fill="white"/>
  <circle cx="19.5" cy="15" r="1.4" fill="white"/>
  <circle cx="12.5" cy="15" r=".7" fill="rgba(0,0,0,.45)"/>
  <circle cx="19.5" cy="15" r=".7" fill="rgba(0,0,0,.45)"/>
  <!-- nose -->
  <path d="M14.5 19l1.5 1.5 1.5-1.5" stroke="white" stroke-width=".9" stroke-linecap="round"/>
  <circle cx="16" cy="19" r=".7" fill="rgba(0,0,0,.4)"/>
</svg>`);

/** 🦋  Butterfly avatar */
export const AVT_BUTTERFLY = i(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
  <!-- upper wings -->
  <ellipse cx="10" cy="12" rx="8" ry="7" fill="white" opacity=".9" transform="rotate(-20 10 12)"/>
  <ellipse cx="22" cy="12" rx="8" ry="7" fill="white" opacity=".75" transform="rotate(20 22 12)"/>
  <!-- lower wings -->
  <ellipse cx="10" cy="22" rx="6" ry="5" fill="white" opacity=".7" transform="rotate(15 10 22)"/>
  <ellipse cx="22" cy="22" rx="6" ry="5" fill="white" opacity=".55" transform="rotate(-15 22 22)"/>
  <!-- body -->
  <ellipse cx="16" cy="16" rx="2" ry="8" fill="white"/>
  <!-- antennae -->
  <path d="M14.5 9 Q11 4 9 3" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M17.5 9 Q21 4 23 3" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="9" cy="3" r="1.2" fill="white"/>
  <circle cx="23" cy="3" r="1.2" fill="white"/>
</svg>`);

/** 🐉  Dragon avatar */
export const AVT_DRAGON = i(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
  <!-- head -->
  <ellipse cx="16" cy="17" rx="11" ry="10" fill="white" opacity=".85"/>
  <!-- horns -->
  <path d="M11 9l-3-6 3 3z" fill="white" opacity=".9"/>
  <path d="M21 9l3-6-3 3z" fill="white" opacity=".9"/>
  <!-- eyes -->
  <ellipse cx="12" cy="15" rx="2.2" ry="2.5" fill="white"/>
  <ellipse cx="20" cy="15" rx="2.2" ry="2.5" fill="white"/>
  <ellipse cx="12" cy="15.5" rx="1.1" ry="1.5" fill="rgba(0,0,0,.5)"/>
  <ellipse cx="20" cy="15.5" rx="1.1" ry="1.5" fill="rgba(0,0,0,.5)"/>
  <!-- nostrils -->
  <circle cx="14.5" cy="21" r=".8" fill="rgba(0,0,0,.3)"/>
  <circle cx="17.5" cy="21" r=".8" fill="rgba(0,0,0,.3)"/>
  <!-- scales hint -->
  <path d="M9 19 Q16 22 23 19" stroke="white" stroke-width=".9" fill="none" opacity=".5"/>
</svg>`);

/** 🦊  Fox avatar */
export const AVT_FOX = i(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
  <!-- ears -->
  <path d="M9 12 L6 4 L13 10z" fill="white" opacity=".9"/>
  <path d="M23 12 L26 4 L19 10z" fill="white" opacity=".9"/>
  <!-- inner ears -->
  <path d="M9.5 11 L7.5 5.5 L12.5 10z" fill="rgba(0,0,0,.2)"/>
  <path d="M22.5 11 L24.5 5.5 L19.5 10z" fill="rgba(0,0,0,.2)"/>
  <!-- head -->
  <ellipse cx="16" cy="17" rx="10.5" ry="9.5" fill="white" opacity=".9"/>
  <!-- snout -->
  <ellipse cx="16" cy="21" rx="5" ry="3.5" fill="white" opacity=".6"/>
  <!-- eyes -->
  <circle cx="12" cy="15.5" r="1.6" fill="white"/>
  <circle cx="20" cy="15.5" r="1.6" fill="white"/>
  <circle cx="12" cy="15.5" r=".9" fill="rgba(0,0,0,.5)"/>
  <circle cx="20" cy="15.5" r=".9" fill="rgba(0,0,0,.5)"/>
  <!-- nose -->
  <ellipse cx="16" cy="20" rx="1.5" ry="1" fill="rgba(0,0,0,.4)"/>
  <!-- mouth -->
  <path d="M14.5 21.5 Q16 23 17.5 21.5" stroke="rgba(0,0,0,.3)" stroke-width=".9" fill="none" stroke-linecap="round"/>
</svg>`);

/** 🐬  Dolphin avatar */
export const AVT_DOLPHIN = i(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
  <!-- body -->
  <ellipse cx="15" cy="18" rx="11" ry="7.5" fill="white" opacity=".85" transform="rotate(-15 15 18)"/>
  <!-- belly -->
  <ellipse cx="14" cy="19" rx="7" ry="4.5" fill="white" opacity=".45" transform="rotate(-15 14 19)"/>
  <!-- dorsal fin -->
  <path d="M20 10 L24 5 L22 12z" fill="white" opacity=".85"/>
  <!-- tail -->
  <path d="M26 22 L30 20 L28 25 L30 28 L26 26z" fill="white" opacity=".8"/>
  <!-- eye -->
  <circle cx="10" cy="16" r="1.5" fill="white"/>
  <circle cx="10" cy="16" r=".8" fill="rgba(0,0,0,.5)"/>
  <!-- smile beak -->
  <path d="M7 18 Q9 20 12 19" stroke="rgba(0,0,0,.3)" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`);

/** 🌟  Star avatar */
export const AVT_STAR = i(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
  <!-- outer glow rays -->
  <path d="M16 2L18.4 11.1L26.5 7.5L20.9 14L30 16.4L20.9 18L26.5 24.5L18.4 20.9L16 30L13.6 20.9L5.5 24.5L11.1 18L2 16.4L11.1 14L5.5 7.5L13.6 11.1L16 2Z" fill="white" opacity=".35"/>
  <!-- main star -->
  <path d="M16 5L18.5 12.5L26.5 12.5L20.1 17.5L22.5 25L16 20.5L9.5 25L11.9 17.5L5.5 12.5L13.5 12.5L16 5Z" fill="white" opacity=".9"/>
  <!-- face -->
  <circle cx="13" cy="16" r="1" fill="rgba(0,0,0,.35)"/>
  <circle cx="19" cy="16" r="1" fill="rgba(0,0,0,.35)"/>
  <path d="M13.5 19.5 Q16 21.5 18.5 19.5" stroke="rgba(0,0,0,.35)" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`);

/** Avatar SVG map — keyed by emoji character */
export const AVATAR_SVG: Record<string, string> = {
  '🦁': AVT_LION,
  '🦋': AVT_BUTTERFLY,
  '🐉': AVT_DRAGON,
  '🦊': AVT_FOX,
  '🐬': AVT_DOLPHIN,
  '🌟': AVT_STAR,
};
