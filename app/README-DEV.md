# My Math Roots v2 — Developer Guide

## Architecture Overview

The codebase is organized into three domains under `src/lib/`:

| Domain | Path | Purpose |
|--------|------|---------|
| **Core** | `$lib/core/` | Pure TypeScript — types, data, stores, services. Zero DOM dependencies. Independently testable. |
| **UI** | `$lib/ui/` | Svelte components and browser-coupled services (audio, animations, gestures). |
| **Theme** | `$lib/theme/` | Centralized CSS — design tokens, glass effects, backgrounds, layout, components, dark mode, a11y. |

This separation ensures business logic (quiz scoring, mastery tracking, auth, sync) never depends on UI concerns, and visual styling lives in one discoverable location.

---

## Directory Map

```
app/src/
├── routes/                        SvelteKit file-based routing
│   ├── +layout.svelte             Root layout (auth guard, onboarding flow)
│   ├── +page.svelte               Home screen (unit grid)
│   ├── dashboard/                 Parent dashboard
│   ├── history/                   Score history
│   ├── lesson/[id]/               Lesson viewer (examples + practice)
│   ├── login/                     Email/Google sign-in
│   ├── quiz/[id]/                 Quiz engine
│   ├── select/                    Student profile selector
│   ├── settings/                  Preferences & accessibility
│   └── unit/[id]/                 Unit detail (lesson list)
│
└── lib/
    ├── core/
    │   ├── types/                 TypeScript interfaces & type aliases
    │   │   ├── user.ts            AuthUser, StudentProfile, A11yPrefs, AppSettings
    │   │   ├── content.ts         Unit, Lesson, Question, Example, PracticeItem
    │   │   ├── progress.ts        MasteryEntry, StreakState, DoneMap
    │   │   ├── quiz.ts            QuizState, QuizAnswer, ScoreEntry
    │   │   └── index.ts           Barrel re-export
    │   ├── data/                  Curriculum content (10 units, ~2500 questions)
    │   │   ├── shared.ts          Unit shells (metadata, lesson defs, colors)
    │   │   └── u1.ts–u10.ts       Per-unit question banks, examples, practice
    │   ├── services/              Business logic (network + computation)
    │   │   ├── quiz.ts            Adaptive sampling, scoring, mastery, streaks
    │   │   ├── auth.ts            Sign-in, PIN verification, profile management
    │   │   ├── sync.ts            Supabase push/pull, conflict resolution
    │   │   └── hint.ts            AI hint service wrapper
    │   ├── stores/                Svelte stores (reactive state)
    │   │   ├── content.ts         Unit/lesson data
    │   │   ├── user.ts            Auth user, student profiles, guest mode
    │   │   ├── progress.ts        Mastery, streaks, done flags, app time
    │   │   ├── quiz.ts            Current quiz state, scores
    │   │   ├── prefs.ts           Accessibility & app settings
    │   │   ├── syncStatus.ts      Sync state tracking
    │   │   ├── persist.ts         Versioned localStorage abstraction
    │   │   └── index.ts           Barrel re-export
    │   ├── supabase.ts            Supabase client singleton
    │   ├── boot.ts                App initialization (lazy-loads unit data)
    │   ├── pwa.ts                 PWA registration & update handling
    │   └── utils.ts               Shared utility functions
    │
    ├── ui/
    │   ├── components/
    │   │   ├── auth/              AvatarPicker, PinKeypad, ProfilePicker, StudentCard, DashboardGate
    │   │   ├── dashboard/         MasteryGrid, OverallStats, QuizHistory, AiReportCard, ParentSettings
    │   │   ├── home/              UnitCard, LessonRow, ScoreHistorySheet, StreakCalendar
    │   │   ├── quiz/              QuizEngine, QuizResults
    │   │   └── tour/              SpotlightTour, TutorialOverlay, InstallModal
    │   └── services/              Browser-coupled services
    │       ├── animations.ts      DOM animation sequencing
    │       ├── sound.ts           Audio playback (Web Audio API)
    │       ├── swipe.ts           Touch gesture detection
    │       ├── navStack.ts        Navigation history tracking
    │       └── tour.ts            Onboarding tour logic
    │
    ├── theme/                     Centralized CSS (see Theme System below)
    │   ├── theme.css              Barrel — @imports all partials
    │   ├── tokens.css             CSS custom properties (colors, spacing, type, radii)
    │   ├── glass.css              True Glass tiered blur system
    │   ├── backgrounds.css        Viewport gradients + SVG tile pattern
    │   ├── layout.css             Structural layout (.home-in, #home, .sc, .op)
    │   ├── components.css         Global component styles (.bar, .lcard, quiz, etc.)
    │   ├── dark.css               body.dark / html.dark overrides
    │   └── a11y.css               Accessibility toggle classes
    │
    ├── icons/                     SVG icon data (dashboard icons)
    └── assets/                    Static assets
```

---

## Import Conventions

```ts
// Core logic — pure TypeScript
import { type QuizState } from '$lib/core/types';
import { mastery, done } from '$lib/core/stores';
import { startQuiz, finaliseQuiz } from '$lib/core/services/quiz';
import { supabase } from '$lib/core/supabase';

// UI components
import QuizEngine from '$lib/ui/components/quiz/QuizEngine.svelte';
import { mountSwipeBack } from '$lib/ui/services/swipe';

// Theme (imported once in root layout)
import '$lib/theme/theme.css';
```

**Rule of thumb:** If a file imports from `svelte` (the component framework, not `svelte/store`) or uses DOM APIs (`document`, `window`, `Audio`), it belongs in `ui/`. Everything else goes in `core/`.

---

## Theme System

All visual styling flows through `$lib/theme/`. The barrel `theme.css` imports partials in specificity order:

1. **tokens.css** — `:root` CSS custom properties. All colors, spacing, typography, radii, shadows, and z-index values are defined here as `--variable` tokens.
2. **glass.css** — Four-tier glassmorphism system (see below).
3. **backgrounds.css** — The viewport-filling gradient + math-symbol SVG tile.
4. **layout.css** — Structural page layout, scroll containers, hero section.
5. **components.css** — Global component styles (bar, cards, quiz, modals).
6. **dark.css** — All `body.dark` overrides in one place.
7. **a11y.css** — Accessibility body-class toggles.

### True Glass Tiers

| Class | Blur | Opacity | When to use |
|-------|------|---------|-------------|
| `.glass-1` | 6px | 40% | Subtle panels, calendars, non-interactive surfaces |
| `.glass-2` | 12px | 65% | Cards, sheets, interactive surfaces |
| `.glass-3` | 18px | 80% | Overlays, tooltips, floating UI |
| `.glass-4` | 28px | 90% | Full-screen overlays, login, profile picker |

Each tier has dark mode variants defined in `glass.css`. Always use `-webkit-backdrop-filter` alongside `backdrop-filter` for Safari support.

### Adding a New Token

Add it to `tokens.css` under `:root`, with a comment explaining its purpose. If it needs a dark mode override, add the `body.dark` variant in `dark.css`.

### Dark Mode

Dark mode is toggled by adding `.dark` to both `<html>` and `<body>`. Token overrides live in `dark.css`. Component-level dark overrides also live in `dark.css` (prefixed with `body.dark`).

---

## Adding New Features

### Where does new code go?

```
Is it pure data/logic with no DOM?
  └── YES → core/services/ or core/stores/
  └── NO  → Does it render UI?
              └── YES → ui/components/{domain}/
              └── NO  → ui/services/ (animations, gestures, audio)
```

### New route page
Create under `src/routes/{name}/+page.svelte`. Import core logic from `$lib/core/`, UI components from `$lib/ui/components/`.

### New component
Add to the appropriate subdirectory in `ui/components/` (`auth/`, `dashboard/`, `home/`, `quiz/`, `tour/`). Create a new subdirectory if the component belongs to a new domain.

### New service
- Pure logic (no DOM): `core/services/`
- Browser APIs needed: `ui/services/`

---

## Dev Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Production build (adapter-static → build/)
npm run preview    # Preview production build locally
npm run check      # svelte-check + TypeScript verification
npm run test:unit  # Run Vitest unit tests
npm run lint       # Prettier + ESLint check
npm run format     # Auto-format with Prettier
```

---

## Tech Stack

- **Framework:** SvelteKit 2.50 + Svelte 5 (runes mode)
- **Build:** Vite 7 + adapter-static (SPA with index.html fallback)
- **Language:** TypeScript 5.9
- **Database:** Supabase (PostgreSQL + Auth + RPC)
- **PWA:** vite-plugin-pwa (auto-update service worker, Workbox caching)
- **Testing:** Vitest (unit), Playwright (e2e)
- **Deploy:** Netlify (static site + Netlify Functions)
