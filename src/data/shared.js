// ════════════════════════════════════════
//  QUESTION FACTORY
//  q(text, options[4], correctIndex 0-3, explanation)
// ════════════════════════════════════════
function q(t,o,a,e,s){return{t,o,a,e,s};}

// ════════════════════════════════════════
//  UI ICONS (inline SVG)
// ════════════════════════════════════════
const _ICO = {
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.93-1"/></svg>`,
  key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l2 2"/></svg>`,
  parentLock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  graduation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  medal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><circle cx="12" cy="15" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><path d="M15 7l-3-4-3 4"/></svg>`,
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  eyeOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  tablet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  megaphone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  bug: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  broom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M3 21l9-9"/><path d="M12.22 6.22L18 2l4 4-6.22 5.78c.06.74.08 1.49.04 2.22L22 18l-4 4-4.74-5.96A12 12 0 0 1 12 16c-.85 0-1.7-.1-2.54-.32L3 18l-1-4 5.32-1.46A11.93 11.93 0 0 1 7 10c0-1.38.37-2.68 1.02-3.8L12.22 6.22z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  muscle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14.5v-5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M11.5 14h-2a2 2 0 0 0-2 2v2.5c0 1.38 1.12 2.5 2.5 2.5h4c1.38 0 2.5-1.12 2.5-2.5V16a2 2 0 0 0-2-2h-3z"/></svg>`,
  scroll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  backpack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
  clap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

// ════════════════════════════════════════
//  CURRICULUM DATA — metadata shell only
//  Lesson content (points/examples/practice/qBank) and unit quizzes
//  are lazy-loaded on demand via _loadUnit(idx).
// ════════════════════════════════════════
const UNITS_DATA = [
  {
    "id": "u1",
    "name": "Basic Fact Strategies",
    "icon": "➕",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><circle cx=\"30\" cy=\"30\" r=\"27\" fill=\"#FF2200\" opacity=\"0.1\"/><rect x=\"8\" y=\"27\" width=\"18\" height=\"7\" rx=\"3.5\" fill=\"#FF2200\"/><rect x=\"13.5\" y=\"21.5\" width=\"7\" height=\"18\" rx=\"3.5\" fill=\"#FF2200\"/><rect x=\"34\" y=\"27\" width=\"18\" height=\"7\" rx=\"3.5\" fill=\"#FF2200\" opacity=\"0.75\"/><circle cx=\"9\" cy=\"47\" r=\"3\" fill=\"#FF2200\" opacity=\"0.35\"/><circle cx=\"51\" cy=\"13\" r=\"3\" fill=\"#FF2200\" opacity=\"0.35\"/></svg>",
    "color": "#FF2200",
    "gp": 1,
    "teks": "TEKS 2.4A, 2.7A",
    "lessons": [
      {
        "id": "u1l1",
        "title": "Count Up & Count Back",
        "icon": "🔢",
        "desc": "Count forward to add, backward to subtract"
      },
      {
        "id": "u1l2",
        "title": "Doubles!",
        "icon": "✌️",
        "desc": "Use doubles facts to add quickly"
      },
      {
        "id": "u1l3",
        "title": "Make a 10",
        "icon": "🔟",
        "desc": "Break apart numbers to reach 10 first"
      },
      {
        "id": "u1l4",
        "title": "Number Families",
        "icon": "👨‍👩‍👧",
        "desc": "Related addition & subtraction facts using 3 numbers"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u2",
    "name": "Place Value",
    "icon": "📦",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><rect x=\"3\" y=\"14\" width=\"54\" height=\"38\" rx=\"6\" fill=\"#0095FF\" opacity=\"0.1\" stroke=\"#0095FF\" stroke-width=\"2.5\"/><line x1=\"21\" y1=\"14\" x2=\"21\" y2=\"52\" stroke=\"#0095FF\" stroke-width=\"2\"/><line x1=\"39\" y1=\"14\" x2=\"39\" y2=\"52\" stroke=\"#0095FF\" stroke-width=\"2\"/><rect x=\"5\" y=\"17\" width=\"13\" height=\"6\" rx=\"2\" fill=\"#0095FF\" opacity=\"0.4\"/><rect x=\"23\" y=\"17\" width=\"13\" height=\"6\" rx=\"2\" fill=\"#0095FF\" opacity=\"0.4\"/><rect x=\"41\" y=\"17\" width=\"13\" height=\"6\" rx=\"2\" fill=\"#0095FF\" opacity=\"0.4\"/><rect x=\"5\" y=\"26\" width=\"13\" height=\"22\" rx=\"2\" fill=\"#0095FF\" opacity=\"0.65\"/><rect x=\"23\" y=\"32\" width=\"13\" height=\"16\" rx=\"2\" fill=\"#0095FF\" opacity=\"0.5\"/><rect x=\"41\" y=\"40\" width=\"13\" height=\"8\" rx=\"2\" fill=\"#0095FF\" opacity=\"0.35\"/><rect x=\"21\" y=\"8\" width=\"18\" height=\"5\" rx=\"2.5\" fill=\"#0095FF\" opacity=\"0.5\"/></svg>",
    "color": "#0095FF",
    "gp": 1,
    "teks": "TEKS 2.2A-F, 2.7B, 2.9C",
    "lessons": [
      {
        "id": "u2l1",
        "title": "Big Numbers",
        "icon": "🏠",
        "desc": "Each digit has a place and a value"
      },
      {
        "id": "u2l2",
        "title": "Different Ways to Write Numbers",
        "icon": "📖",
        "desc": "Write numbers three different ways"
      },
      {
        "id": "u2l3",
        "title": "Bigger or Smaller?",
        "icon": "⚖️",
        "desc": "Greater than, less than, and equal to"
      },
      {
        "id": "u2l4",
        "title": "Skip Counting",
        "icon": "🐸",
        "desc": "Count by 2s, 5s, 10s, and 100s"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u3",
    "name": "Add & Subtract to 200",
    "icon": "🔢",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><line x1=\"4\" y1=\"40\" x2=\"56\" y2=\"40\" stroke=\"#FF6600\" stroke-width=\"3\" stroke-linecap=\"round\"/><line x1=\"4\" y1=\"35\" x2=\"4\" y2=\"45\" stroke=\"#FF6600\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"35\" x2=\"30\" y2=\"45\" stroke=\"#FF6600\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><line x1=\"56\" y1=\"35\" x2=\"56\" y2=\"45\" stroke=\"#FF6600\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><path d=\"M4 40 Q17 22 30 40\" stroke=\"#FF6600\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M30 40 Q43 18 56 40\" stroke=\"#FF6600\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"4\" cy=\"40\" r=\"3.5\" fill=\"#FF6600\"/><circle cx=\"30\" cy=\"40\" r=\"3.5\" fill=\"#FF6600\"/><circle cx=\"56\" cy=\"40\" r=\"3.5\" fill=\"#FF6600\"/></svg>",
    "color": "#FF6600",
    "gp": 2,
    "teks": "TEKS 2.4A-D, 2.7B-C",
    "lessons": [
      {
        "id": "u3l1",
        "title": "Adding Bigger Numbers",
        "icon": "➕",
        "desc": "Add with and without regrouping"
      },
      {
        "id": "u3l2",
        "title": "Taking Away Bigger Numbers",
        "icon": "➖",
        "desc": "Subtract with and without borrowing"
      },
      {
        "id": "u3l3",
        "title": "Add Three Numbers",
        "icon": "🔱",
        "desc": "Find clever ways to add 3 numbers"
      },
      {
        "id": "u3l4",
        "title": "Math Stories",
        "icon": "📝",
        "desc": "Solve math stories step by step"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u4",
    "name": "Add & Subtract to 1,000",
    "icon": "🏔️",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><rect x=\"2\" y=\"6\" width=\"26\" height=\"26\" rx=\"3\" fill=\"#FF4400\" opacity=\"0.18\" stroke=\"#FF4400\" stroke-width=\"2\"/><line x1=\"10.7\" y1=\"6\" x2=\"10.7\" y2=\"32\" stroke=\"#FF4400\" stroke-width=\"1\" opacity=\"0.4\"/><line x1=\"19.3\" y1=\"6\" x2=\"19.3\" y2=\"32\" stroke=\"#FF4400\" stroke-width=\"1\" opacity=\"0.4\"/><line x1=\"2\" y1=\"14.7\" x2=\"28\" y2=\"14.7\" stroke=\"#FF4400\" stroke-width=\"1\" opacity=\"0.4\"/><line x1=\"2\" y1=\"23.3\" x2=\"28\" y2=\"23.3\" stroke=\"#FF4400\" stroke-width=\"1\" opacity=\"0.4\"/><rect x=\"33\" y=\"6\" width=\"10\" height=\"26\" rx=\"3\" fill=\"#FF4400\" opacity=\"0.55\" stroke=\"#FF4400\" stroke-width=\"2\"/><line x1=\"33\" y1=\"14.7\" x2=\"43\" y2=\"14.7\" stroke=\"#FF4400\" stroke-width=\"1\" opacity=\"0.5\"/><line x1=\"33\" y1=\"23.3\" x2=\"43\" y2=\"23.3\" stroke=\"#FF4400\" stroke-width=\"1\" opacity=\"0.5\"/><rect x=\"48\" y=\"18\" width=\"10\" height=\"10\" rx=\"2.5\" fill=\"#FF4400\" stroke=\"#FF4400\" stroke-width=\"2\"/></svg>",
    "color": "#FF4400",
    "gp": 2,
    "teks": "TEKS 2.4A-D, 2.7B-C",
    "lessons": [
      {
        "id": "u4l1",
        "title": "Adding Really Big Numbers",
        "icon": "➕",
        "desc": "Add hundreds, tens, and ones with regrouping"
      },
      {
        "id": "u4l2",
        "title": "Taking Away Really Big Numbers",
        "icon": "➖",
        "desc": "Subtract with regrouping across columns"
      },
      {
        "id": "u4l3",
        "title": "Close Enough Counts!",
        "icon": "🎯",
        "desc": "Round numbers to get close answers fast"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u5",
    "name": "Money & Financial Literacy",
    "icon": "💰",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><rect x=\"3\" y=\"18\" width=\"36\" height=\"24\" rx=\"5\" fill=\"#00CC44\" opacity=\"0.12\" stroke=\"#00CC44\" stroke-width=\"2.5\"/><path d=\"M21 24 Q15 24 15 29 Q15 33 21 33 Q27 33 27 37 Q27 41 21 41\" stroke=\"#00CC44\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\"/><line x1=\"21\" y1=\"21\" x2=\"21\" y2=\"44\" stroke=\"#00CC44\" stroke-width=\"2\" stroke-linecap=\"round\"/><ellipse cx=\"50\" cy=\"38\" rx=\"8\" ry=\"3\" fill=\"#00CC44\" opacity=\"0.35\" stroke=\"#00CC44\" stroke-width=\"1.5\"/><rect x=\"42\" y=\"30\" width=\"16\" height=\"8\" fill=\"#00CC44\" opacity=\"0.2\"/><ellipse cx=\"50\" cy=\"30\" rx=\"8\" ry=\"3\" fill=\"#00CC44\" opacity=\"0.55\" stroke=\"#00CC44\" stroke-width=\"1.5\"/><rect x=\"42\" y=\"22\" width=\"16\" height=\"8\" fill=\"#00CC44\" opacity=\"0.2\"/><ellipse cx=\"50\" cy=\"22\" rx=\"8\" ry=\"3\" fill=\"#00CC44\" stroke=\"#00CC44\" stroke-width=\"1.5\"/></svg>",
    "color": "#00CC44",
    "gp": 3,
    "teks": "TEKS 2.5A-B, 2.11A-F",
    "lessons": [
      {
        "id": "u5l1",
        "title": "All About Coins",
        "icon": "🪙",
        "desc": "Learn each coin and how much it is worth"
      },
      {
        "id": "u5l2",
        "title": "Count Your Coins",
        "icon": "💵",
        "desc": "Add coin values from biggest to smallest"
      },
      {
        "id": "u5l3",
        "title": "Dollars and Cents",
        "icon": "💲",
        "desc": "Write and compare money amounts"
      },
      {
        "id": "u5l4",
        "title": "Save, Spend and Give",
        "icon": "🏦",
        "desc": "Smart ways to use money"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u6",
    "name": "Data Analysis",
    "icon": "📊",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><line x1=\"7\" y1=\"48\" x2=\"56\" y2=\"48\" stroke=\"#00C7BE\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><line x1=\"7\" y1=\"10\" x2=\"7\" y2=\"48\" stroke=\"#00C7BE\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><rect x=\"11\" y=\"28\" width=\"13\" height=\"20\" rx=\"3\" fill=\"#00C7BE\" opacity=\"0.65\"/><rect x=\"28\" y=\"16\" width=\"13\" height=\"32\" rx=\"3\" fill=\"#00C7BE\"/><rect x=\"45\" y=\"36\" width=\"13\" height=\"12\" rx=\"3\" fill=\"#00C7BE\" opacity=\"0.45\"/></svg>",
    "color": "#00C7BE",
    "gp": 3,
    "teks": "TEKS 2.10A-D",
    "lessons": [
      {
        "id": "u6l1",
        "title": "Tally Marks",
        "icon": "📋",
        "desc": "Record and read data with tally marks"
      },
      {
        "id": "u6l2",
        "title": "Bar Graphs",
        "icon": "📊",
        "desc": "Read and understand bar graphs"
      },
      {
        "id": "u6l3",
        "title": "Picture Graphs",
        "icon": "🖼️",
        "desc": "Use pictures to represent data"
      },
      {
        "id": "u6l4",
        "title": "Line Plots",
        "icon": "📈",
        "desc": "Show and read data on a number line"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u7",
    "name": "Measurement & Time",
    "icon": "📏",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><rect x=\"3\" y=\"6\" width=\"54\" height=\"18\" rx=\"4\" fill=\"#4C4BFF\" opacity=\"0.1\" stroke=\"#4C4BFF\" stroke-width=\"2\"/><line x1=\"12\" y1=\"6\" x2=\"12\" y2=\"16\" stroke=\"#4C4BFF\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"20\" y1=\"6\" x2=\"20\" y2=\"13\" stroke=\"#4C4BFF\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"28\" y1=\"6\" x2=\"28\" y2=\"16\" stroke=\"#4C4BFF\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"36\" y1=\"6\" x2=\"36\" y2=\"13\" stroke=\"#4C4BFF\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><line x1=\"44\" y1=\"6\" x2=\"44\" y2=\"16\" stroke=\"#4C4BFF\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"52\" y1=\"6\" x2=\"52\" y2=\"13\" stroke=\"#4C4BFF\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"44\" r=\"13\" fill=\"#4C4BFF\" opacity=\"0.1\" stroke=\"#4C4BFF\" stroke-width=\"2.5\"/><line x1=\"30\" y1=\"44\" x2=\"24\" y2=\"37\" stroke=\"#4C4BFF\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"44\" x2=\"30\" y2=\"34\" stroke=\"#4C4BFF\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"44\" r=\"2.5\" fill=\"#4C4BFF\"/></svg>",
    "color": "#4C4BFF",
    "gp": 3,
    "teks": "TEKS 2.9A-G",
    "lessons": [
      {
        "id": "u7l1",
        "title": "How Long Is It?",
        "icon": "📏",
        "desc": "Measure in inches, feet, and centimeters"
      },
      {
        "id": "u7l2",
        "title": "What Time Is It?",
        "icon": "🕐",
        "desc": "Read clocks to hours and 5-minute intervals"
      },
      {
        "id": "u7l3",
        "title": "Hot, Cold and Full",
        "icon": "🌡️",
        "desc": "Read thermometers and measure liquids"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u8",
    "name": "Fractions",
    "icon": "🍕",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><circle cx=\"30\" cy=\"30\" r=\"24\" fill=\"#FF0055\" opacity=\"0.1\" stroke=\"#FF0055\" stroke-width=\"2.5\"/><path d=\"M30 30 L30 6 A24 24 0 0 1 54 30 Z\" fill=\"#FF0055\" opacity=\"0.75\"/><line x1=\"30\" y1=\"6\" x2=\"30\" y2=\"54\" stroke=\"#FF0055\" stroke-width=\"2.5\"/><line x1=\"6\" y1=\"30\" x2=\"54\" y2=\"30\" stroke=\"#FF0055\" stroke-width=\"2.5\"/><circle cx=\"30\" cy=\"30\" r=\"3\" fill=\"#FF0055\"/></svg>",
    "color": "#FF0055",
    "gp": 4,
    "teks": "TEKS 2.3A-D",
    "lessons": [
      {
        "id": "u8l1",
        "title": "What is a Fraction?",
        "icon": "✂️",
        "desc": "Understand what a fraction means"
      },
      {
        "id": "u8l2",
        "title": "Halves, Fourths and Eighths",
        "icon": "🍕",
        "desc": "Name and identify common fractions"
      },
      {
        "id": "u8l3",
        "title": "Which Piece is Bigger?",
        "icon": "⚖️",
        "desc": "Which fraction is bigger or smaller?"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u9",
    "name": "Geometry",
    "icon": "🔷",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><rect x=\"10\" y=\"28\" width=\"40\" height=\"26\" rx=\"3\" fill=\"#C844FF\" opacity=\"0.18\" stroke=\"#C844FF\" stroke-width=\"2.5\"/><polygon points=\"6,30 30,8 54,30\" fill=\"#C844FF\" opacity=\"0.35\" stroke=\"#C844FF\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/><circle cx=\"22\" cy=\"42\" r=\"6.5\" fill=\"#C844FF\" opacity=\"0.5\" stroke=\"#C844FF\" stroke-width=\"2\"/><rect x=\"33\" y=\"38\" width=\"11\" height=\"16\" rx=\"3\" fill=\"#C844FF\" opacity=\"0.4\" stroke=\"#C844FF\" stroke-width=\"2\"/></svg>",
    "color": "#C844FF",
    "gp": 4,
    "teks": "TEKS 2.8A-E",
    "lessons": [
      {
        "id": "u9l1",
        "title": "Flat Shapes",
        "icon": "⭕",
        "desc": "Flat shapes — sides and corners"
      },
      {
        "id": "u9l2",
        "title": "Solid Shapes",
        "icon": "📦",
        "desc": "Solid shapes — faces, edges, vertices"
      },
      {
        "id": "u9l3",
        "title": "Mirror Shapes",
        "icon": "🦋",
        "desc": "Lines of symmetry in shapes"
      }
    ],
    "_loaded": false
  },
  {
    "id": "u10",
    "name": "Multiplication & Division",
    "icon": "✖️",
    "svg": "<svg viewBox=\"0 0 60 60\" fill=\"none\"><circle cx=\"14\" cy=\"11\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"30\" cy=\"11\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"46\" cy=\"11\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"14\" cy=\"24\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"30\" cy=\"24\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"46\" cy=\"24\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"14\" cy=\"37\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"30\" cy=\"37\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"46\" cy=\"37\" r=\"6\" fill=\"#FFAA00\"/><circle cx=\"14\" cy=\"50\" r=\"5\" fill=\"#FFAA00\" opacity=\"0.4\"/><circle cx=\"30\" cy=\"50\" r=\"5\" fill=\"#FFAA00\" opacity=\"0.4\"/><circle cx=\"46\" cy=\"50\" r=\"5\" fill=\"#FFAA00\" opacity=\"0.4\"/></svg>",
    "color": "#FFAA00",
    "gp": 4,
    "teks": "TEKS 2.6A-B",
    "lessons": [
      {
        "id": "u10l1",
        "title": "Equal Groups",
        "icon": "🍎",
        "desc": "Groups with the same amount — start of multiplication"
      },
      {
        "id": "u10l2",
        "title": "Adding the Same Number",
        "icon": "🔄",
        "desc": "Adding equal groups — the bridge to multiplication"
      },
      {
        "id": "u10l3",
        "title": "Sharing Equally",
        "icon": "🤝",
        "desc": "Split into equal groups — introduction to division"
      }
    ],
    "_loaded": false
  }
];

// ════════════════════════════════════════
//  LAZY UNIT LOADER
// ════════════════════════════════════════
const _unitLoadPromises = {};

function _mergeUnitData(idx, data){
  const u = UNITS_DATA[idx];
  data.lessons.forEach(function(ld, i){ Object.assign(u.lessons[i], ld); });
  if(data.unitQuiz) u.unitQuiz = data.unitQuiz;
  if(data.testBank) u.testBank = data.testBank;
  u._loaded = true;
}

function _loadUnit(idx){
  const u = UNITS_DATA[idx];
  if(u._loaded) return Promise.resolve();
  if(_unitLoadPromises[idx]) return _unitLoadPromises[idx];
  _unitLoadPromises[idx] = new Promise(function(resolve, reject){
    const s = document.createElement('script');
    s.src = '/data/u' + (idx + 1) + '.js';
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('Failed to load unit ' + (idx + 1))); };
    document.head.appendChild(s);
  });
  return _unitLoadPromises[idx];
}
