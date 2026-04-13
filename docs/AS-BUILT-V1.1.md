# My Math Roots — V1.1 As-Built Documentation

> **Status:** Shipped to production  
> **Date:** 2026-04-12  
> **Live URL:** https://mymathroots.netlify.app  
> **Repo:** `mymathroots-v1.1` (master branch, tag `v1.1`)

---

## Executive Summary

My Math Roots is a K–5 mathematics review platform built as an offline-capable Progressive Web App (PWA). It is designed for students in grades 1–5, with parent/teacher oversight controls. The app runs entirely in the browser with no server-side rendering — all logic is client-side vanilla JavaScript.

**What is shipped:**

- **7,000 multiple-choice questions** + **129 open-ended practice items** across 10 curriculum units and 34 lessons, aligned to Texas TEKS standards (Grades 2–5)
- **Two auth modes:** Student PIN login (no email required) and Parent/Teacher Google OAuth
- **Adaptive quiz engine** that weights weaker questions more heavily using a per-question mastery hash
- **Progress tracking** with streak system, mastery records, and time analytics
- **Parent dashboard** with accuracy breakdowns, weak-area spotting, activity heatmap, and session history
- **Accessibility suite** with 6 independently toggleable features (colorblind mode, reduce motion, focus indicators, text select, haptic feedback, screen reader support)
- **Full offline support** via a service worker (cache-first strategy) and PWA install prompt

**Tech at a glance:**

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (no framework), ~8,800 lines across 14 source files |
| Styling | 2,508 lines CSS with design tokens, dark mode, and accessibility classes |
| Build | Custom `build.js` — concatenation, env injection, JS obfuscation |
| Backend | Supabase (10 tables, 20 RPCs, Row Level Security on all tables) |
| Database extensions | `pgcrypto` (bcrypt PIN hashing) |
| Hosting | Netlify (CDN, security headers, CSP) |
| PWA | Service worker `sw.js` (v6.0.0-release), Web App Manifest |

**Content at a glance:**

| Units | Lessons | Multiple-Choice Questions | Practice Items | Grades Covered |
|---|---|---|---|---|
| 10 | 34 | 7,000 | 129 | 2–5 (TEKS-aligned) |

---

## 1. Existing Feature Set

### Core Mechanics

**Quiz flow:**
1. User navigates to a lesson or unit from the home carousel
2. Progress lock enforces 80%+ on prior content before unlocking the next (overridable by parent)
3. Questions are presented one at a time in the `quiz-screen` view
4. Each question has 4 multiple-choice options rendered as tappable buttons
5. On selection, immediate feedback fires: correct/incorrect color state, a Web Audio sound effect (swoosh, correct chime, or wrong buzz), and optional haptic vibration
6. The explanation for the correct answer is revealed below the options
7. A per-question timer tracks time spent (stored in the score record)
8. User taps "Next" to advance; a progress bar shows position in the set
9. On completion, the `results-screen` renders: score, percentage, star rating (1–3 stars), and a contextual feedback message

**Immediate feedback:**
- **100%:** Trophy + "PERFECT SCORE! You are a math superstar!" + 3 stars + confetti burst (50 canvas particles)
- **90–99%:** Medal + "Outstanding! Almost perfect!" + 3 stars
- **80–89%:** Star + "Great job!" + 2 stars
- **70–79%:** Check + "Good effort!" + 1 star
- **<70%:** Encouragement message + recommendation to review weak areas

**Sound effects (Web Audio API, 4 samples):**
- `swoosh-back` / `swoosh-forward` — screen navigation transitions
- `correct` — correct answer selected
- `wrong` — incorrect answer selected
- `pass-quiz` — quiz completion
- `confetti-burst` — 100% score celebration

Sound is stored in localStorage (`wb_sound`) and toggled in Settings.

---

### Progress Tracking

**DONE — lesson/quiz completion map**
Stored as `{ "lq_u1_l1": true, "uq_u1": true, ... }` in localStorage key `wb_done5`. Boolean flags per content ID. A lesson is "done" once its quiz is completed regardless of score.

**SCORES — quiz history (max 200 entries)**
Each record: `{ qid, label, type, score, total, pct, stars, unitIdx, color, studentName, timeTaken, answers, dateStr, timeStr, quit, abandoned }`. Stored locally and synced to Supabase `quiz_scores` table. The `answers` field is a JSONB array capturing each answer choice for post-hoc review.

**MASTERY — per-question performance**
Key: base36 encoding of a 31-bit DJB2 hash of the question text. Value: `{ attempts, correct, lastSeen }`. Used to weight adaptive question sampling. Stored in `wb_mastery` and pushed to Supabase on sync.

**Adaptive sampling formula:**
```
priority = (1 - attempts) * 1000 + (1 - accuracy) * 100
```
Higher priority = more likely to appear. Unseen questions appear first; low-accuracy questions repeat more often.

**STREAK — consecutive-day tracking**
`{ current, longest, lastDate }`. Immutable via ES6 Proxy (prevents accidental mutation). Increments when a quiz is completed on a calendar day not previously recorded. Synced to Supabase `streaks` table with last-writer-wins merge logic. Displayed as 🔥 in Progress Reports.

**APP_TIME — session analytics**
`{ totalSecs, sessions, dailySecs: { "YYYY-MM-DD": secs } }`. Tracks cumulative time in app and a rolling 14-day window of daily usage. Session timing starts on screen load and stops on `visibilitychange`.

**Progress lock (80% rule):**
- Lessons unlock sequentially within a unit
- Unit quiz unlocks after all lessons in that unit are complete
- Next unit unlocks after the current unit quiz is passed at ≥80%
- Parent can override any lock via the parent screen's unlock settings
- `freeMode: true` in unlock settings disables all locks

---

### State & Sync

**Local-first architecture.** All state lives in localStorage and works offline. Supabase sync is additive — it persists state remotely when a user is authenticated, but the app never blocks on it.

**localStorage keys:**

| Key | Contents |
|---|---|
| `wb_done5` | Signed DONE map |
| `wb_sc5` | Signed SCORES array |
| `wb_mastery` | Signed MASTERY map |
| `wb_streak` | Signed STREAK object |
| `wb_apptime` | Signed APP_TIME object |
| `wb_a11y` | Accessibility settings JSON |
| `wb_sound` | Sound toggle (`"on"` / `"off"`) |
| `wb_theme` | Theme preference (`"auto"` / `"dark"`) |
| `mmr_email_enc` | PBKDF2-encrypted email (parent) |
| `mmr_user_role` | `"student"` / `"parent"` / `"teacher"` |

**Signed integrity format:**
Each state object is stored as `{ d: JSON.stringify(data), s: DJB2_hash }`. The hash is verified on read; tampered entries fall back to defaults. This is integrity-checking, not cryptographic security.

**Supabase sync triggers (authenticated sessions only):**
- On quiz completion: SCORES record upserted to `quiz_scores`
- On streak update: STREAK upserted to `streaks` (last-writer-wins)
- On session token auth (student PIN): full progress pushed via `push_student_progress` RPC
- On app load (authenticated): full progress pulled via `pull_student_progress` RPC
- Sync failures are silent (toast shown on network error, app continues locally)

---

## 2. Current Content Set

### Curriculum Structure

Ten units organized by mathematical domain, each containing 3–4 lessons and one unit quiz. A Final Test covers all units. Units are lazy-loaded: the data file for a unit (`dist/data/u1.js`–`u10.js`) is fetched only when a student first navigates to that unit.

**Unit registry (from `src/data/shared.js` `UNITS_DATA`):**

| # | Unit Name | Grade | TEKS Standards | MC Questions |
|---|---|---|---|---|
| 1 | Addition & Subtraction | 2 | 2.2.A, 2.2.B | 874 |
| 2 | Place Value & Number Sense | 2 | 2.2.A, 2.4.A | 874 |
| 3 | Multiplication Concepts | 3 | 3.4.D, 3.4.E | 899 |
| 4 | Division Concepts | 3 | 3.4.F, 3.4.G, 3.4.H | 478 |
| 5 | Fractions | 3–4 | 3.3.A, 4.3.A | 894 |
| 6 | Geometry | 3–4 | 3.6.A, 4.6.A | 811 |
| 7 | Measurement | 3–4 | 3.7.A, 4.8.A | 482 |
| 8 | Data & Graphs | 4 | 4.9.A | 481 |
| 9 | Decimals | 4–5 | 4.4.A, 5.3.A | 723 |
| 10 | Multi-Step Problems | 5 | 5.4.A, 5.4.B | 484 |
| | **Total** | | | **7,000** |

Each unit in UNITS_DATA carries: `id`, `name`, `icon` (emoji), `svg` (inline SVG graphic), `color` (hex, used for progress bars and score cards), `gp` (grade level label), `teks` (array of standard codes), `lessons` (array of lesson metadata).

**Content types per unit:**
- `type: "lesson"` — lesson quiz (ID format: `lq_u{n}_l{n}`)
- `type: "unit"` — unit-level cumulative quiz (ID format: `uq_u{n}`)
- `type: "final"` — final test across all units (ID: `ft`)

---

### Question Bank & Delivery

**Question factory `q()` (defined in `src/data/shared.js`):**
```javascript
q(text, [option0, option1, option2, option3], correctIndex, explanation, statusBits)
```

| Field | Type | Description |
|---|---|---|
| `text` | String | Question stem (may contain inline SVG, HTML entities, or Unicode math symbols) |
| options | String[4] | Always exactly 4 choices |
| `correctIndex` | 0–3 | Index of the correct answer |
| `explanation` | String | Shown after answer is submitted; explains why the correct answer is right |
| `statusBits` | Integer | Reserved; currently unused (set to 0) |

**Question types (by content format):**
- **Text-only** — plain arithmetic or word problems
- **SVG-embedded** — questions containing inline ruler, clock, thermometer, fraction bar, or geometric shape SVGs rendered directly in the question stem
- **Symbol-rich** — Unicode fractions (½, ¾), comparison symbols (<, >, =), measurement units

**Hints:** No separate hint system exists in V1.1. The explanation field serves as post-answer feedback only; it is not revealed before an answer is submitted.

**Question rendering:**
- Question text is set via `innerHTML` (supports embedded SVG and HTML)
- Options are rendered as `<button>` elements with `data-idx` attributes
- On selection: correct option gets `.correct` class (green), wrong selection gets `.wrong` class (red or, in colorblind mode, dashed red)
- Explanation appears in a `.explanation` div below the options after selection

---

## 3. V1.1 Technical Specs

### Architecture Map

**Single-Page Application pattern.** One HTML file (`index.html`) contains all 10 screen templates as `<section>` elements and 13 modal overlays as `<div>` elements. Navigation is handled by `nav.js` toggling a `.on` class — no URL routing, no page reloads.

**Source file load order (concatenated by `build.js` into `dist/app.js`):**

| Order | File | Lines | Role |
|---|---|---|---|
| 1 | `src/data/shared.js` | ~900 | `UNITS_DATA` metadata, `q()` factory, 50+ `_ICO` SVG icons |
| 2 | `src/util.js` | 302 | Crypto helpers (PBKDF2 email encrypt/decrypt), UUID, DOM utilities |
| 3 | `src/state.js` | 139 | State objects: DONE, SCORES, MASTERY, STREAK, APP_TIME; signed serialization |
| 4 | `src/auth.js` | 2,352 | Supabase client init, dual-mode auth, session management, email encryption, streak sync |
| 5 | `src/nav.js` | 300 | Screen router, progress lock guards, iOS swipe-back gesture handler |
| 6 | `src/home.js` | 381 | Unit carousel rendering, progress bars, unlock indicators |
| 7 | `src/unit.js` | ~350 | Unit overview, lesson grid, per-lesson progress |
| 8 | `src/quiz.js` | 1,105 | Web Audio engine, adaptive sampling, timer, results calculation, confetti |
| 9 | `src/settings.js` | 1,932 | Preferences UI, accessibility config, Progress Reports, feedback form |
| 10 | `src/ui.js` | 295 | Toast notifications, modal open/close with backdrop blur |
| 11 | `src/tour.js` | 487 | First-visit spotlight onboarding tour |
| 12 | `src/profile-switcher.js` | 312 | Student profile selection UI |
| 13 | `src/events.js` | 292 | Global event delegation (click, change, submit handlers) |
| 14 | `src/boot.js` | 321 | App initialization, env setup, service worker registration, PWA install prompt |
| 15 | `src/dashboard.js` | 2,446 | Parent analytics: stats grid, unit breakdown, weak areas, activity heatmap, quiz log |

**No module system.** All files share a single global scope. External libraries loaded via CDN `<script>` tags in `index.html`: Supabase JS client, Google GSI (Sign-In), Cloudflare Turnstile (bot protection).

**Screen states (10 primary, managed by `nav.js` `show()`):**

| Screen ID | Trigger | What it shows |
|---|---|---|
| `login-screen` | Unauthenticated access | Student PIN + Parent OAuth carousel |
| `home` | After auth | Unit carousel with progress bars |
| `unit-screen` | Tap unit card | Unit overview, lesson grid |
| `lesson-screen` | Tap lesson | Lesson intro, start quiz button |
| `quiz-screen` | Start quiz | Question, options, progress, timer |
| `results-screen` | Quiz complete | Score, stars, feedback, next action |
| `history-screen` | Settings → History | Past quiz log with drill-down |
| `settings-screen` | Nav settings icon | Preferences, accessibility, reports, feedback |
| `parent-screen` | Parent icon | Timer/unlock controls, student management |
| `dashboard-screen` | Parent → Dashboard | Analytics, heatmap, weak areas |

**Modal overlays (13):**
`auth-modal`, `pin-modal`, `access-modal`, `timer-modal`, `a11y-modal`, `progress-report-modal`, `install-modal`, `forgot-pin-modal`, `unit-pin-modal`, `parent-auth-modal`, `profile-switch-modal`, `scal-modal` (streak calendar), `restart-modal`

---

### Database Schema

All tables have Row Level Security enabled. Direct table access is restricted to the owning user. Sensitive operations go through `SECURITY DEFINER` RPCs.

#### Tables

**`public.profiles`** — Parent/teacher accounts (auto-created on sign-up)
```
id                UUID PK → auth.users(id)
display_name      TEXT
role              TEXT CHECK ('student' | 'parent')
family_code       TEXT UNIQUE  ← 8-hex code format: MMR-XXXXXXXX
parent_pin_hash   TEXT         ← bcrypt hash (pgcrypto)
current_streak    INTEGER
longest_streak    INTEGER
last_activity_date TEXT
created_at / updated_at TIMESTAMPTZ
```
RLS: owner read + update only.

**`public.student_profiles`** — Student accounts (created by parent)
```
id                UUID PK
parent_id         UUID → auth.users(id)
username          TEXT
display_name      TEXT
age               INTEGER
avatar_emoji      TEXT (e.g. 🦁)
avatar_color_from / avatar_color_to  TEXT (hex gradient)
pin_hash          TEXT         ← bcrypt via verify_student_pin RPC
unlock_settings   JSONB
timer_settings    JSONB
a11y_settings     JSONB
mastery_json      JSONB
streak_current / streak_longest  INTEGER
streak_last_date  TEXT
apptime_json      JSONB
done_json         JSONB
act_dates_json    JSONB
settings_json     JSONB
a11y_json         JSONB
onboarding_json   JSONB
created_at / updated_at TIMESTAMPTZ
UNIQUE (parent_id, username)
```
RLS: parent owns all child records (`parent_id = auth.uid()`).

**`public.quiz_scores`** — Individual quiz results
```
id           BIGSERIAL PK
user_id      UUID → auth.users(id)
student_id   UUID → student_profiles(id)
local_id     BIGINT           ← client-generated ID for dedup
qid          TEXT             ← e.g. "lq_u1_l1"
label        TEXT
type         TEXT             ← 'lesson' | 'unit' | 'final' | 'review'
score / total / pct  INTEGER
stars        TEXT
unit_idx     INTEGER (0–9)
color        TEXT
student_name TEXT
time_taken   TEXT
answers      JSONB            ← per-question answer log
date_str / time_str  TEXT
quit / abandoned  BOOLEAN
created_at   TIMESTAMPTZ
UNIQUE INDEX (user_id, local_id)
```
RLS: owner read, insert, delete. Trigger `trg_validate_quiz_score` validates on insert.

**`public.student_progress`** — Bulk progress sync (auth users)
```
id         BIGSERIAL PK
user_id    UUID → auth.users(id)
student_id UUID → student_profiles(id)
done_json  JSONB
updated_at TIMESTAMPTZ
UNIQUE (user_id, student_id)
```
RLS: owner read, insert, update.

**`public.pin_sessions`** — Session tokens for PIN-only students
```
token       UUID PK
student_id  UUID → student_profiles(id)
created_at  TIMESTAMPTZ
expires_at  TIMESTAMPTZ  ← DEFAULT now() + 24 hours
```
RLS: `no_direct_access` (USING false) — access via RPC only.

**`public.pin_attempts`** — PIN lockout tracking
```
student_id   UUID PK → student_profiles(id)
attempts     INTEGER
locked_until TIMESTAMPTZ
window_start TIMESTAMPTZ
```
RLS: no direct access.

**`public.family_code_lookups`** — Rate limiting for family code searches
```
lookup_key   TEXT PK
attempts     INTEGER
window_start TIMESTAMPTZ
```
RLS: no direct access.

**`public.feedback`** — User feedback submissions
```
id          UUID PK
user_id     UUID → auth.users(id)
rating      INTEGER CHECK (1–5)
category    TEXT
comment     TEXT
app_version TEXT
created_at  TIMESTAMPTZ
```
RLS: anonymous insert allowed; owner read only.

**`public.push_subscriptions`** — Web push
```
endpoint TEXT PK
p256dh   TEXT
auth     TEXT
```

**`public.leads`** — Email captures
```
id         UUID PK
email      TEXT
created_at TIMESTAMPTZ
```

**View: `public.family_code_lookup`**
`SELECT id, family_code FROM profiles` — granted to `anon` and `authenticated` for student device lookup.

#### RPCs (Security Definer)

| RPC | Auth Required | Purpose |
|---|---|---|
| `get_profiles_by_family_code(code)` | anon | List students by family code (rate-limited: 10/15 min) |
| `verify_student_pin(student_id, pin)` | anon | Verify PIN, return session token; 5-attempt lockout |
| `create_student_profile(...)` | authenticated | Parent creates student with bcrypt PIN |
| `reset_student_pin(student_id, new_pin)` | authenticated | Parent resets PIN, invalidates all sessions |
| `push_student_progress(student_id, token, ...)` | anon/auth | Validated progress push (monotonic checks + score insert) |
| `pull_student_progress(student_id, token)` | anon/auth | Fetch full progress + last 200 scores |
| `get_all_student_settings(student_id)` | anon/auth | Composite: unlock + timer + a11y settings in one call |
| `get_unlock_settings / get_timer_settings / get_a11y_settings` | anon/auth | Individual settings fetch |
| `update_unlock_settings / update_timer_settings / update_a11y_settings` | authenticated | Parent-only settings update (ownership checked) |
| `get_pin_hash / update_pin_hash` | authenticated | Parent dashboard PIN management |
| `get_user_sync_data(student_id?)` | authenticated | Legacy sync path for parent OAuth sessions |
| `ensure_family_code(parent_id)` | authenticated | Generate MMR-XXXXXXXX code if not set |
| `cleanup_expired_pin_sessions()` | — | Cron target: delete expired tokens |
| `handle_new_user()` | — | Trigger: auto-create `profiles` row on auth.users insert |

**Extension required:** `pgcrypto` (bcrypt via `crypt()`, SHA-256 via `digest()`).

---

### Build & Deployment

**Build command:** `node build.js`

**Build steps:**
1. Reads `.env` for `SUPA_URL`, `SUPA_KEY`, `GOOGLE_CLIENT_ID`
2. Concatenates 15 source JS files in dependency order into one bundle
3. Replaces `%%SUPA_URL%%`, `%%SUPA_KEY%%`, `%%GOOGLE_CLIENT_ID%%` placeholders
4. Obfuscates with `javascript-obfuscator` (identifier mangling, compact output, global function names preserved for `onclick=` handlers)
5. Generates v3 source map (`dist/app.js.map`) with VLQ line-level mappings
6. Copies `src/data/u1.js`–`u10.js` to `dist/data/`
7. Copies static assets (icons, manifest, sw.js, health.json, HTML pages)

**Output (`dist/`):**
- `index.html` — minified shell (~50KB)
- `app.js` — obfuscated bundle (~30KB)
- `app.js.map` — source map (dev only)
- `fonts.css` — lazy-loaded font faces (~150KB, separate for perf)
- `data/u1.js`–`u10.js` — lazy unit data
- `icon-192.png`, `icon-512.png`, `manifest.json`, `sw.js`, `health.json`

**Environment variables (`.env`):**
```
SUPA_URL=https://<project>.supabase.co
SUPA_KEY=<anon-public-key>
GOOGLE_CLIENT_ID=<oauth-client-id>
```

**Netlify (`netlify.toml`):**
- Publish dir: root (serves `index.html` directly)
- Security headers on all routes: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS `max-age=31536000; includeSubDomains; preload`
- Permissions Policy: camera, mic, geolocation, payment — all blocked
- CSP: `default-src 'self'`; allowlisted: Google accounts, Cloudflare Turnstile, Supabase project URL, jsDelivr CDN
- Cache-Control: service worker → `no-cache`; immutable assets → `public, max-age=31536000`; manifest → `public, max-age=86400`

**Service Worker (`sw.js`, cache version `math-workbook-v6.0.0-release`):**
- Install phase: caches `index.html` and `manifest.json`
- Fetch strategy: network-first for HTML; cache-first with background update for all other assets
- Push notifications: supported (custom title/body payload)
- Offline behavior: app fully functional offline for previously visited units; unvisited unit data files require one online fetch

**PWA (`manifest.json`):**
- `display: standalone` (full-screen app mode)
- `orientation: portrait`
- `theme_color: #4a90d9`
- Icons: `icon-192.png` (192×192) and `icon-512.png` (512×512), both maskable
- Description: "My Math Roots — K-5 Review — 10 units, 34 lessons, 7,000+ questions"

---

## 4. UI/UX & Layout (As-Built)

### Component Library

**Design token system (CSS custom properties):**

*Spacing:* `--sp-1` (4px) through `--sp-8` (32px)

*Typography:*
```
--fs-xs:  0.72rem   badges, counters
--fs-sm:  0.85rem   labels, hints
--fs-base: 0.95rem  body text
--fs-md:  1.1rem    slightly prominent
--fs-lg:  1.3rem    card titles
--fs-xl:  1.6rem    section titles
--fs-2xl: 2rem      page headings
--fs-3xl: 2.5rem    display headings
```

*Border radius:* `--rad-sm` (12px), `--rad-md` (16px), `--rad-lg` (24px), `--rad-xl` (28px), `--rad-pill` (50px)

*Button padding:* `--btn-pad-sm` (10px 20px), `--btn-pad-md` (13px 28px), `--btn-pad-lg` (16px 36px)

**Color modes:**

Light mode key values:
```css
--bg: #ffffff          --txt: #1a2535
--txt2: #5a7080        --card-bg: #fff
--modal-blur: blur(28px) saturate(160%) brightness(1.04)
```

Dark mode key values:
```css
--bg: #08121e          --txt: #ffffff
--txt2: #7fb3cf        --card-bg: #1c2e48
--home-grad: linear-gradient(155deg, #0d1e35 0%, #152846 45%, #0a2418 100%)
```

Theme set in `<body>` via `.dark` class. Mode stored in `wb_theme` (`"auto"` respects `prefers-color-scheme`, `"dark"` forces dark).

**Z-index scale (abbreviated):**
```
--z-toast: 997       --z-modal: 9600
--z-auth-modal: 9900 --z-calendar: 9950
--z-splash: 99999
```

**Glassmorphism pattern (cards and modals):**
- Light: `backdrop-filter: blur(28px)` + `rgba(255,255,255,.92)` gradient
- Dark: `backdrop-filter: blur(12px)` + `rgba(255,255,255,.07)` overlay
- Inset highlight: `box-shadow: inset 0 1.5px 0 rgba(255,255,255,.18)`

**Accessibility CSS classes (toggled on `<body>`):**

| Class | Effect |
|---|---|
| `.a11y-colorblind` | Green checkmarks + dashed red X instead of red/green fill |
| `.a11y-reduce-motion` | All animation/transition duration set to 0 |
| `.a11y-text-select` | `-webkit-user-select: text` on buttons |
| `.a11y-focus` | Visible focus outlines on all interactive elements |
| `.a11y-screenreader` | Unhides `.qreveal-sr` content (visually-hidden text for screen readers) |
| `.a11y-haptic` | Enables vibration feedback (JS-controlled, CSS class is a flag) |

**Toast notifications (`ui.js`):**
Slide-in from bottom, auto-dismiss after 3s. One global `#toast` element, text replaced per call.

**Icon system (`_ICO` in `shared.js`):**
50+ inline SVG icons referenced by key (e.g. `_ICO.back`, `_ICO.lock`, `_ICO.star`). Injected via `innerHTML` — no icon font or external sprite.

**Confetti (`quiz.js`):**
50 canvas particles with randomized color, velocity, rotation, and gravity. Fires on quiz completion. Respects `.a11y-reduce-motion` (skipped entirely if active).

---

### Screen Inventory

**`login-screen`**
- Carousel with two slides: Student PIN entry and Parent OAuth
- Student: family code input → profile grid (avatars from `get_profiles_by_family_code`) → 4-digit PIN pad
- Parent: Google Sign-In button + email/password fallback
- PIN lockout display (attempts remaining, countdown timer)
- Cloudflare Turnstile bot-check widget

**`home`**
- App header: title, streak badge (🔥 + count), settings icon
- Unit carousel: horizontally scrollable cards, one per unit
- Each card: unit icon + name, color-coded progress bar (% complete), completion checkmark, lock icon if locked
- Soft-gate consent modal blocks on first visit (data privacy acknowledgment)
- PWA install prompt banner (dismissible)

**`unit-screen`**
- Unit header: icon, name, color accent
- Lesson grid: 3–4 lesson cards + unit quiz card
- Each card: lesson title, progress indicator, lock/unlock state
- "Start Unit Quiz" button (unlocked after all lessons complete)

**`lesson-screen`**
- Lesson title and description
- TEKS standard badge
- Estimated question count
- "Start Lesson" button

**`quiz-screen`**
- Progress bar (current Q / total)
- Question text (may include embedded SVG)
- 4 answer option buttons
- Timer display (elapsed or countdown if parent-set limit active)
- Back/Quit button (records `quit: true` on early exit)
- Explanation panel (shown after answer selection, hidden until then)
- "Next Question" button (appears after selection)

**`results-screen`**
- Score: "X / Y" in large type
- Percentage and star rating (1–3 stars)
- Contextual feedback message
- Confetti canvas overlay (if applicable)
- "Review Answers" button → history drill-down
- "Continue" button → next locked lesson or home

**`history-screen`**
- Scrollable list of past quiz attempts (from SCORES, max 200)
- Each entry: label, date/time, score, stars, type badge
- Tap to expand: per-question answer review (your answer vs. correct answer)

**`settings-screen`**
- **Sound:** toggle on/off
- **Theme:** Auto / Dark toggle
- **Accessibility:** button opens `a11y-modal` (6 toggles)
- **Progress Reports:** expandable section (same content as parent dashboard)
- **Feedback:** star rating + category dropdown + text field + submit
- **Install App:** PWA install prompt
- **Sign Out:** clears session

**`parent-screen`**
- Student profile list (avatar + name)
- Per-student controls:
  - Timer settings (lesson / unit / final in minutes)
  - Unlock settings (free mode toggle, per-unit unlock)
  - PIN reset
- Parent PIN setup for dashboard access
- "Open Dashboard" button

**`dashboard-screen`** (parent analytics)
- Summary row: quizzes taken, overall accuracy %, current streak
- Time row: this week, total time, avg session, avg per question
- Recent quizzes: last 10 with score and stars
- Weakness spotlight: topics with <60% accuracy and ≥2 attempts
- Unit strength breakdown: all units with average accuracy bars
- Activity heatmap: 7-day bar graph of quiz count per day

---

## 5. App Settings & Configuration

### User Controls

**Sound (all users)**
- Toggle: On / Off
- Storage: `wb_sound` in localStorage
- Scope: affects Web Audio playback for all 6 sound events

**Theme (all users)**
- Options: Auto (follows `prefers-color-scheme`) / Dark (forced)
- Storage: `wb_theme` in localStorage
- Applied: `.dark` class on `<body>` at boot and on change

**Accessibility (all users — via `a11y-modal`)**
All 6 toggles stored together in `wb_a11y` as a JSON object. Applied by toggling CSS classes on `<body>` and conditionally attaching/removing focus event listeners.

| Toggle | Key | Default | What it does |
|---|---|---|---|
| Colorblind-friendly answers | `colorblind` | off | Replaces red/green fill with checkmark/dashed-X pattern |
| Reduce motion | `reduceMotion` | off | Sets all CSS transitions/animations to 0 duration |
| Text selection | `textSelect` | off | Allows text copy from answer buttons |
| Focus indicators | `focus` | off | Adds visible outline ring to all focusable elements |
| Screen reader support | `screenreader` | off | Unhides `aria-label` helper text in question view |
| Haptic feedback | `haptic` | off | Vibrates device on correct/wrong (where supported) |

**Feedback form (all users)**
- 1–5 star rating
- Category: Bug Report / Feature Request / Content Issue / General
- Optional text comment
- Submitted to `public.feedback` table (anonymous insert allowed)
- App version auto-attached

**Profile switching (student)**
- Students on a shared device can switch profiles via the profile-switcher modal
- Each profile loads its own DONE / SCORES / MASTERY / STREAK from Supabase

**Parent controls (parent-authenticated only)**
- **Timer limits:** Per-student, per-quiz-type (lesson / unit / final); in minutes; stored in `timer_settings` JSONB on `student_profiles`
- **Content unlocks:** `freeMode` boolean or per-unit/per-lesson overrides; stored in `unlock_settings` JSONB
- **Student PIN reset:** Calls `reset_student_pin` RPC; invalidates all active sessions
- **Student name:** Editable via parent screen
- **Parent PIN:** 4-digit PIN protecting dashboard access; bcrypt hash in `profiles.parent_pin_hash`

---

### System Toggles

**Environment variables (`.env`, injected at build time)**

| Variable | Placeholder | Purpose |
|---|---|---|
| `SUPA_URL` | `%%SUPA_URL%%` | Supabase project URL |
| `SUPA_KEY` | `%%SUPA_KEY%%` | Supabase anon/public key |
| `GOOGLE_CLIENT_ID` | `%%GOOGLE_CLIENT_ID%%` | Google OAuth client ID |

These are injected into `dist/app.js` at build time. The `.env` file is gitignored. Production values are set in Netlify environment variables.

**Service worker cache version**
Hardcoded in `sw.js`: `math-workbook-v6.0.0-release`. Bump this string to force a cache bust on all clients.

**Progress lock threshold**
Hardcoded in `nav.js`: 80% pass rate required to unlock next content. Not configurable at runtime (parent free-mode toggle bypasses it entirely).

**SCORES history cap**
Hardcoded in `state.js`: max 200 entries in the local SCORES array. Oldest entries are trimmed when the cap is exceeded.

**APP_TIME rolling window**
Hardcoded in `state.js`: 14-day rolling window for `dailySecs`. Days older than 14 are pruned on each write.

**Mastery sampling weights**
Hardcoded in `quiz.js`: `priority = (1 - attempts) * 1000 + (1 - accuracy) * 100`. Not user-configurable.

**PIN lockout policy**
Hardcoded in `verify_student_pin` RPC: 5 attempts allowed, then 30-second cooldown. Not configurable from the app.

**Family code rate limit**
Hardcoded in `get_profiles_by_family_code` RPC: 10 lookups per 15-minute window per IP.

---

## Appendix: Key File Paths

| Purpose | Path |
|---|---|
| Main HTML template | `index.html` |
| Source JS (all modules) | `src/*.js` |
| Shared data + icons + `q()` factory | `src/data/shared.js` |
| Unit question data | `src/data/u1.js` – `src/data/u10.js` |
| CSS (all styles) | `src/styles.css` |
| Build script | `build.js` |
| Build output | `dist/` |
| Service worker | `sw.js` (root, copied to dist) |
| PWA manifest | `manifest.json` |
| Netlify config | `netlify.toml` |
| DB migrations (reference) | `docs/supabase_migrations/001`–`009.sql` |
| DB initial setup | `docs/supabase_setup.sql` |
| Changelog | `docs/CHANGELOG.md` |
| Repo instructions | `CLAUDE.md` |
