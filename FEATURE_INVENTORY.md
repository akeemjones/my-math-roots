# My Math Roots — Complete Feature Inventory

Commit `5ae6afb`. Companion to [PIVOT_AUDIT.md](PIVOT_AUDIT.md). Every entry verified in source.

Status key: **Live** = built, reachable, works. **Partial** = works with a known defect. **Broken** = reachable but wrong. **Inert** = reachable UI, does nothing. **Orphaned** = built, no way to reach it. **Absent** = does not exist.

---

## 1. Student app

### Entry and navigation

| Feature | Where | Status | Notes |
|---|---|---|---|
| Guest mode | `auth.js:1418-1433` | Live | Full app, localStorage only, no sync. COPPA gate first |
| Family code + PIN login | `auth.js:208-247, 685+` | Live | 8-digit `MMR-XXXXXXXX`, server lockout |
| Parent "Go to App" launch | `dashboard.js:6187-6208` | **Partial** | Creates a session with **no** `mmr_session_token` — the reload bug |
| Profile switcher | `profile-switcher.js` | Live | Bottom sheet, PIN or parent bypass. Shows at 2+ profiles |
| Screen router | `nav.js:4-55` | Live | 10 screens via `.on` class. **No URLs, no deep links** |
| Swipe-back gesture | `nav.js:89-300` | Live | iOS-style, own stack, intercepts `popstate` |
| Home / unit carousel | `home.js:44-358` | Live | Diff-based refresh |
| Unit → lesson grid | `unit.js:104-182` | Live | Rebuilds fully each visit |
| Progression locking | `nav.js:60-83` | Live | 80% on prior quiz unlocks next |
| Locked-item feedback | `unit.js:48-99` (sheet), toast for units | Live | Two different patterns for the same concept |
| Grade picker | `index.html:277-291`, `auth.js:3605-3651` | Live | K/1/2/3 enabled, 4/5 "Soon". **Full page reload on switch** |
| Resume unfinished quiz | `quiz.js:2949-2972`, `unit.js:186-219` | Live | Survives force-quit. Quiz-only, no mid-lesson resume |

### Learning

| Feature | Where | Status | Notes |
|---|---|---|---|
| Key Ideas instruction | `unit.js:2025-2049`, `key-ideas.js` (2,491 lines) | Live | ~35 topic step-generators, string-built SVG. Tap-to-open, never automatic |
| Worked examples | per-lesson `examples` | Live | Below G1's 12-per-lesson target (typically 3-6) |
| Practice questions | `quiz.js:2982-3010` | Live | Weak-question bank. Excluded from DONE/streak. **G1: only Unit 1 has any** |
| Lesson quiz (8 Q) | `quiz.js:656` | Live | 3 easy / 3 medium / 2 hard |
| Unit test (25 Q) | `quiz.js:666` | Live | Draws from unit `testBank` |
| Final test (50 Q) | `quiz.js:3627` | Partial | Eagerly loads ~5.5 MB of unit data |
| Question engine | `question-engine.js` | Live | One 4-option MC component. **No true/false, no number input, no drag/sort** — those are visual skins |
| Visual renderers | `visuals.js` | Partial | base10, numberLine, array, objectSet, twoGroups, tenFrame, imgChoice, domino, dicePattern, fivFrame, comparison, shapes, coinChoices, tapGroup |
| Answer grading | `quiz.js:962-985` | Live | Option-text equality. Buttons disable synchronously — no double-fire |
| Static hints | `quiz.js:2893-2928` | Live | −2% score per hint. 26 K hints leak their answer |
| AI hints (Gemini) | `events.js:84` | **Orphaned** | `_fetchAIHint` **never defined**. Backend `gemini-hint.js` fully built, zero callers. Advertised at `dashboard.js:3990` |
| Explanations | `quiz.js:1015-1038, 772-806, 3317-3337` | Live | Three contexts, no duplicate rendering |
| Interventions | `quiz.js:180-188, 1543-2236` | Live | 28-topic dispatcher on repeated error tags |
| Retry after intervention | `question-engine.js:168-254` | **Orphaned** | `QE.selectRetry` never called. Disabled after a stem/answer bug; 2 tests assert it stays off |
| Mastery tracking | `state.js:139-151`, `quiz.js:467-505` | Live | Keyed by **question-text hash**, not ID. Feeds sampling only — **never shown to the student** |
| Spaced review | `quiz.js:467-505` | Partial | Recency/accuracy weighting, not a real SRS |
| Scratch pad / Note Pad | `quiz.js:3386-3398` | **Partial** | Opaque full-screen. Problem preview added `303e639` — **blank visual on coin and picture questions** |
| Quiz timer | `unit.js:2202` | Live | Parent-configurable, cleared on all exits |
| Custom quiz lengths | `quiz-config.js` | Partial | Non-default lengths silently lose difficulty balancing |

### Streak calendar — the feature you asked about

This is a **student** feature, not a parent one. I had it filed under the parent dashboard in the audit; that was wrong.

| Piece | Where | Status |
|---|---|---|
| Calendar button | `index.html:52` (`#cal-btn`), `auth.js:2723-2741` | Live |
| Visibility rule | `auth.js:2726-2731` | **Home screen only, signed-in only.** Hidden for guests |
| Activity dot | `auth.js:2743-2754` (`_updateCalDot`) | Live — lights up if today is in `wb_act_dates` |
| Month grid modal | `auth.js:2766+` (`_openStreakCal`), `_buildStreakCal` at `:2955` | Live |
| Swipe month navigation | `auth.js:2775-2800` | Live — iOS-style drag with peek, plus `‹ ›` buttons |
| Future months blocked | `auth.js:2941-2944` | Live — next arrow disabled on current month |
| Streak header | `auth.js:2975-2985` | Live — current streak, "Best: N", animated fire SVG |
| Milestone badges | `auth.js:2755-2761` (`_getMilestone`) | Live — **GETTING STARTED** (3), **WEEK WARRIOR** (7), **SUPER STUDENT** (14), **MATH LEGEND** (30) |
| Day detail panel | `#scal-day-panel`, `auth.js:2993` | Live |
| Data source | `wb_act_dates` (localStorage array of ISO dates), written `auth.js:3145-3150` | Live — **works for guests too**, though guests can't open the calendar |
| Cloud sync | `p_act_dates_json` (`auth.js:2466`); hydrated `auth.js:638-659`, `2082-2086` | Live — patched directly against `student_profiles` because the RPC omits it |

The milestone badges are the only reward mechanic in the entire product. There are no badges, points, confetti, or unlockables anywhere else.

### Settings, accessibility, platform

| Feature | Where | Status |
|---|---|---|
| Dark mode | `settings.js:806-822` | Live — follows OS via matchMedia |
| Accessibility (reduce motion, etc.) | `settings.js:52-60` | Partial — opt-in only, **no `prefers-reduced-motion` bridge** |
| Sound toggle | `index.html:558` | **Inert** — no playback code exists |
| Install / PWA prompt | `boot.js:702-769` | Live — iOS splash + touch icons |
| Offline | `sw.js` | Partial — a unit works offline **only after being opened once** |
| App update | `boot.js:667-691` | Live — auto-applies, reloads. **This reload triggers the student→dashboard bug** |
| Push notifications | `settings.js:1369-1470`, `send-push/index.ts`, `sw.js:27-40` | **Orphaned** — real, backend-wired, live daily cron; `push-toggle-btn` **rendered nowhere**. A toast tells users to visit "Settings → Notifications", which doesn't exist. Icon `/icon-192-v5.1.png` doesn't exist either |
| Safe-area handling | `styles.css` (~20 sites) | Partial — 6 modal boxes unverified |
| Avatars | `auth.js:112-118, 796-893` | Live — emoji + gradient |
| Rooty mascot | — | **Absent** — no implementation anywhere |
| Rewards / badges / confetti | — | **Absent** — except calendar milestones |
| Audio | — | **Absent** |

---

## 2. Parent dashboard — every section, in render order

Not a separate app. It is `dashboard-screen` inside the same `index.html` SPA the child uses (`src/dashboard.js`, 6,441 lines, bundled into `app.js`). `dashboard/dashboard.html` is a **non-deployed** legacy copy.

Render order is fixed at `dashboard.js:5311-5332`:

| # | Section | Where | Status | What's in it |
|---|---|---|---|---|
| 0 | **View-grade filter** | `_getDashboardViewGrade` `:5290` | **Broken for G3** | A pure filter, per-student, stored `mmr_dash_view_grade_<sid>`. Deliberately never writes `mmr_grade` |
| 1 | **Student selector** | `_renderStudentSelector` `:733` | Live | Avatar chips, switches active child |
| 2 | **Action Summary** | `_renderParentActionSummary` `:5123` | Live | "What to do next" — one recommended action from stats + mastery + activity |
| 3 | **Practice Plan** | `_renderPracticePlan` `:1395` | Live | Recommended review lessons (`_recommendReviewLessons` `:664`), weak areas, review queue (`_computeReviewQueue` `:391`). **Template-based, not AI** |
| 4 | **Learning Insights ("Root System")** | `_renderLearningInsightsV2` `:4734`, built `:4417` | **Broken** | Mastery %, misconception patterns (`_computeMisconceptions` `:656`), tag stats, Common Mistakes, recovery rate. Mastery is derived from activity events (`_deriveMasteryFromActivity`) and falls back to `student.MASTERY` — **both trace to the wrong table** |
| 5 | **Unit Progress Map** | `_renderUnitProgressMap` `:1229`, `_computeUnitInsights` `:1118` | Live | Per-unit completion, accuracy, lesson drawers |
| 6 | **Recent Quizzes / History** | `_renderRecentQuizzes` `:1721`, `_renderQuizHistoryInner` `:1672` | Live | Date-range chips 7d/30d/60d/3m/6m/1y/lifetime (`:1506`). Tap a quiz → full question-by-question review (`openQuizReview` `:1740`, keyed by stable `score.id`) |
| 7 | **Activity Snapshot** | `_renderActivitySnapshot` `:752` | **Partial** | 7-day bar chart + drill-down. Sub-views: Accuracy (`:920`), Quizzes (`:955`), **Time (`:966` — always 0 for managed students)**, Lessons (`:989`), Day detail (`:1015`). Weekly rollup `_renderWeeklySnapshot` `:1046` |
| 8 | **Profiles accordion** | `_renderProfilesSection` `:5168` | Live | See below |
| 9 | **Settings accordion** | `_renderSettingsSection` `:5176` | Live | See below |

### Inside Profiles (section 8)

| Item | Where | Status | Notes |
|---|---|---|---|
| Manage Profiles | `_renderManageProfiles` `:5432` | Live | List, edit name/age/**grade**/avatar |
| Add student | `openAddStudentSheet` `:5753`, `dbAddSave` `:5846` | Live | Capped at `max_students_per_parent` (default 2), enforced by a fail-closed DB trigger. PIN hashed with a **static shared salt** (`:5861`) |
| Grade dropdown | `:5650-5657` | **Broken** | K, 2, 3 enabled. **Grade 1 disabled "(coming soon)" — despite G1 being complete (6,331 questions).** Grade 3 enabled despite being 8% built. Exactly backwards |
| Family code | `_dbCopyFamilyCode` `:5485` | Live | Copy-to-clipboard, server rate-limited |
| Go to student's app | `dbGoToApp` `:6187` | **Partial** | Source of the routing bug |
| Access Controls / unlock | `_renderUnlockSection` `:3402`, `_renderUnlockInner` `:3299` | Live | Free Mode, per-unit and per-lesson unlock toggles. Synced via RPC |
| Parent PIN | `_renderPinSection` `:3768` | Live | Gates `parent-screen` in-app |
| Password change | `_renderPasswordSection` `:3902`, `_dbSavePassword` `:3888` | Live | Real `auth.updateUser()` |
| Danger Zone | `_renderDangerZoneSection` `:3409`, `_dbFullReset` `:3183` | Live | **Progress wipe, not deletion** (`:3159-3168`). Name/PIN/avatar survive. No profile-delete path exists |

### Inside Settings (section 9)

| Item | Where | Status | Notes |
|---|---|---|---|
| Appearance / theme | `_renderThemeSection` `:5150` | Live | |
| Timer | `_renderTimerSection` `:3478` | Live | Per-quiz time limit, synced |
| Quiz Length | `_renderQuizLengthSection` `:3571`, `_dbSaveQuizLen` `:3638` | **Partial** | Per-scope lesson/unit counts. **localStorage only — does not sync across devices** (`:3508`). Non-default values lose difficulty balancing |
| Accessibility | `_renderA11ySection` `:3694` | Live | Synced |
| Reminders | `_renderRemindersSection` `:3793`, `_dbTogglePush` `:3837` | **Inert** | Prompts for notification permission, writes `wb_reminders`. **Nothing ever reads that key.** No scheduler. Promises "will show at 15:30" |
| Feedback | `_renderFeedbackSection` `:3957` | Partial | Writes to `feedback` table. Email trigger **dropped** in `20260611_feedback_lockdown.sql` for a JWT leak |
| Changelog | `_renderChangelogSection` `:3978` | **Misleading** | Hardcoded HTML. Advertises "Push Notifications" and "AI Hints — powered by Gemini" as shipped. Neither is reachable |

### AI Progress Report

| Item | Where | Status |
|---|---|---|
| Generate report | `generateAIReport` `:2146` → `gemini-report.js` | Live — the **only** working AI feature |
| Payload builder | `_buildDashboardPayload` `:1985` | Live — real aggregation |
| Report view | `_renderAIReportView` `:2269` | Live |
| Hardening | `gemini-report.js:473-486` | Live — JWT required, ownership check, rate limit, 14-day server cooldown, no-hallucination prompt |
| Privacy | `gemini-report.js:393-398` | **Risk** — sends the child's `display_name` plus full academic profile to Google |

### Absent from the parent dashboard

Assignments. Subscription or billing controls. Account deletion. Profile deletion. Data export. Realtime updates (**no polling, no subscription** — a parent watching the dashboard sees nothing until reload). Multi-parent access. Notifications that work.

---

## 3. Accounts and auth

| Feature | Where | Status |
|---|---|---|
| Email + password signup | `signup-gate.js` (the only path) | Live — Turnstile, cap check, atomic slot reservation, non-enumerating |
| Email verification | Supabase native | Live |
| Email + password login | `auth.js:1731-1860` | Live |
| Google OAuth | `auth.js:1470-1498` | Live — PKCE redirect. **Will not deep-link into a native shell** |
| Google One Tap | `auth.js:1457-1467` | Live |
| Password reset | `auth.js:1671-1693` | **Partial** — no `PASSWORD_RECOVERY` handler; resolves only via the 8s safety-net timeout |
| Session restore | `boot.js:584-599` | Partial — fast path for guest and PIN sessions; parent-launched sessions fall through |
| Sign-out | `auth.js:3557-3581` | Live — synchronous cleanup before async signOut |
| Waitlist | `waitlist-join.js`, `auth.js:1607-1660` | Live |
| Launch gate | `20260525_launch_gate.sql` | Live — `signup_enabled`, `max_parent_accounts=50`, `max_students_per_parent=2`, `waitlist_enabled` |
| Admin role | `admin_users` table, `is_admin()` | Live — hardened away from self-promotable `profiles.role` |
| COPPA consent gate | `auth.js:3044-3069`, `index.html:193-197` | Live — checkbox attestation |
| Route protection | RLS + SECURITY DEFINER RPCs | Live — client role is a UX hint only |
| Account deletion | — | **Absent** — email request only. Apple 5.1.1(v) blocker |
| Lead capture | `auth.js:3084-3130` | **Orphaned** — no render path; DB policy revoked |

---

## 4. Sync and data

| Feature | Where | Status |
|---|---|---|
| Local progress | `state.js` | Live — grade-namespaced, DJB2-signed, tamper-checked |
| Score sync | `push_quiz_scores` | **Partial** — no `reset_epoch` guard; can resurrect deleted scores |
| Lesson completion sync | `push_student_progress` (`done_json`) | Live — the only field with a proper `||` merge |
| Mastery sync | same (`mastery_json`) | **Broken** — wholesale replace, stale device deletes keys |
| Streak sync | same + direct `profiles` upsert | **Broken** — no anti-regression guard, plus an unguarded LWW upsert |
| Time-on-task sync | same (`apptime_json`) | **Broken** — wholesale replace; never fetched for managed students |
| Activity dates sync | `act_dates_json` | Live — patched directly against `student_profiles` |
| Intervention events | `quiz.js:215-226` → `intervention_events` | Partial — 500-event cap drops oldest, synced or not |
| Reset epoch | `20260520` | Partial — only guards one of the two push RPCs |
| Guest → account merge | `auth.js:2176-2179` | **Partial** — wipes DONE but not SCORES/MASTERY/STREAK/APP_TIME |

---

## 5. Internal and infrastructure

| Feature | Where | Status |
|---|---|---|
| Admin analytics dashboard | `admin-analytics.html` + `admin-analytics.js` | Live — deployed, `noindex`, **linked from nowhere**, admin-gated |
| Analytics ingest | `analytics.js`, `analytics-ingest.js` | Live — server-stamped IDs, two-layer PII strip, whitelist, no IP storage |
| Analytics query | `analytics-query.js` | Live — admin-only, allow-listed metrics |
| Content validator (G2) | `scripts/validate_grade2_content.js` | Live — 7,338 Qs, 0 critical |
| Phase-2 unit auditor | `scripts/audit_grade2_phase2.js` | Live — PASS on all 10 units |
| u4l1 generator + auditor | `scripts/lib/u4l1_addition.js`, `rebuild_u4l1_addition_bank.js`, `audit_u4l1_bank.js` | Live — the best content asset in the repo |
| Key-ideas auditor | `scripts/audit-key-ideas.js` | Live — K/G1/G2 |
| Hint generator | `scripts/generate-hints.js` | Live — Gemini-backed, build-time |
| One-off migrations | `scripts/migrate_u*_phase2.js` (10), `transform-*.js` (4), etc. | Historical — already applied |
| Web push backend | `supabase/functions/send-push` | Live — daily cron confirmed, **no UI** |
| Signup notification | `notify-new-signup` | Live — emails a personal Gmail |
| Visitor notification | `notify-new-visitor` | **Orphaned** — feed removed for COPPA |
| CI | `.github/workflows/deploy-staging.yml` | Live — test + build + audit. **Never deploys** |
| Deploy | `npm run deploy` | Live — manual, hand-bumped SW cache string |

---

## 6. Content

| Grade | Units | Lessons | Questions | Status |
|---|---|---|---|---|
| K | 8 | 39 | 1,966 | **Complete** — 26 hints leak answers |
| 1 | 8 | 40 | 6,331 | **Complete** — but 32 of 40 lessons have no practice items, and **the dashboard won't let a parent select it** |
| 2 | 10 | 35 | 7,338 | **Complete and validated** — the flagship |
| 3 | 10 | 97 | 81 + 62 CBE + 15 diagnostic | **8% built** — 89 of 97 lessons are empty shells. Selectable today |
| 4 | 0 | 0 | 0 | Absent |
| 5 | 0 | 0 | 0 | Absent |

Extras: `g3/cbe.js` (62-question CBE final, gated), `g3/unit0_diagnostic.js` (15-item readiness check, **authored but never routed** — `TODO(g3-routing)`).

---

## 7. Things the feature list claims that the code does not support

- **"Stable question IDs"** — G2: 0 of 3,463. K: 10 of 1,223. G3: 0 of 81. G1: 59%. Mastery keys on **question text hash** (`state.js:133-137`). Editing a question's text orphans its history.
- **"True/false questions", "number-input questions", "sorting and grouped-answer interactions"** — all render through the same 4-option multiple-choice component. They are visual skins, not distinct interaction types.
- **"TEKS alignment"** — K and G2 carry TEKS at the **unit level only**. 0 of 35 G2 lessons and 0 of 7,338 G2 questions have a `teks` field. G1 and G3 do.
- **"Texas Tech CBE alignment"** — exists only in `g3/cbe.js`, in the 8%-built grade.
- **"Rooty and animated instructional content"** — no Rooty implementation exists.
- **"Analytics"** as a parent feature — it is admin-only telemetry.
- **"Interventions"** — real, but the retry loop they were designed to feed is dead code.
