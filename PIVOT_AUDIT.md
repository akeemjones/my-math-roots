# My Math Roots — Pivot Audit

Date: 2026-07-15. Commit audited: `5ae6afb`, branch `master`, working tree clean.
Method: static read of the repository plus read-only execution of the existing content validators. No code changed, nothing deployed, no database queried. Findings are marked CONFIRMED (verified in source), PLAUSIBLE (mechanism verified, trigger not reproduced), or UNCONFIRMED (not verifiable from this repo).

---

## Executive summary

The product is much further along than a feature list suggests, and its problems are not the ones a pivot normally uncovers. There is no feature bloat crisis. There is a **data-truth crisis**: the parent dashboard reads mastery from the wrong database table, and the student app can silently resurrect deleted scores. There is also a **routing defect that does exactly what you suspected** — a student launched into the app from the parent dashboard gets dumped into the parent dashboard on the next reload.

Three things dominate the decision:

1. **Grade 2 is a genuinely shippable product. Grade 3 is 8% built.** K, G1 and G2 are real and validated (15,635 authored questions). Grade 3 has 89 of 97 lessons as empty shells. Grades 4-5 do not exist. Launch scope is decided by the content, and the content says K-2.
2. **The parent dashboard is showing untrustworthy numbers today.** `get_student_progress_by_pin` reads mastery/done/activity from a legacy `student_progress` table filtered only by parent, `LIMIT 1`, with no student filter. Scores in the same response are correctly scoped. Parents see accurate scores next to wrong or empty mastery.
3. **Monetization is a greenfield.** Zero payment code exists. The only entitlement-shaped infrastructure is the beta signup cap, which is a global knob, not a per-account entitlement.

Recommended path: **freeze features, fix sync truth, ship K-2 as a Capacitor-wrapped native app with a family subscription.** Do not rebuild in React Native — it would mean rewriting the entire question renderer and duplicating the business logic that is currently the product's main asset.

---

## 1. Repository state

| Item | Value |
|---|---|
| Branch | `master` |
| Commit | `5ae6afb` — "chore(deploy): add npm run deploy script for manual production publish" |
| Working tree | Clean |
| Local branches | 21 (many stale worktree/feature branches) |
| Remote branches | 6 (`master`, `feat/quiz-notepad-problem-preview`, `fix/g2-objective-drift-validator`, `fix/g2-pool-drift`, `security/phase0-pre-launch`, HEAD) |
| Build | `node build.js` (`npm run build`) |
| Test | `npm test` → jest. Note: `jest.config.js` **excludes** `security.test.js`, `core.test.js`, `g1-unit-quiz.test.js`, `analytics*.test.js` — those run under `node --test` and are not in the default test command |
| Deploy | Manual only: `npm run deploy` → `netlify deploy --prod --dir=dist`, with `predeploy` running the build. CI (`.github/workflows/deploy-staging.yml`) runs install/test/build/audit and **never deploys** |
| Runtime deps | None. `package.json` has devDependencies only |

Recent commits relevant to the pivot: `511fb5a` (u4l1 rebuild), `a21a574` (configurable quiz lengths), `e000f3b` (decouple quiz-score sync from guarded profile push), `e21bc70` (preserve student grade across dashboard return).

Node is not on PATH on this machine; the working binary is `C:\Program Files\Adobe\Adobe Photoshop 2026\node.exe`.

### Frameworks and libraries

No framework, no bundler, no TypeScript. `build.js` concatenates 24 `src/*.js` files in a fixed order into a single global-scope `dist/app.js` (1.13 MB), substitutes `%%SUPA_URL%%`/`%%SUPA_KEY%%`/`%%GOOGLE_CLIENT_ID%%` from `.env`, and obfuscates with `javascript-obfuscator` (most transforms disabled; `renameGlobals:false` is required because `index.html` still has 18 inline `onclick=` handlers). Third-party code is CDN-loaded: Supabase JS 2.100.1 (SRI-pinned), Google Identity Services, Cloudflare Turnstile.

Build fragility worth knowing: env vars missing produce a **warning, not a failure** (`build.js:105-107`), shipping blank credentials. Grade 1 data files are ES modules converted by regex text replacement (`build.js:301-320`), not an AST transform.

### Entry points and routes

There are **no Netlify redirects anywhere**. This is a multi-page static site where each file is its own route, and `/` happens to host a large SPA.

| Entry | Status |
|---|---|
| `index.html` → `dist/index.html` (260 KB) | Live. The student app **and** the parent dashboard, both as screens in one SPA |
| `admin-analytics.html` + `src/admin-analytics.js` | Deployed, `noindex`, **not linked from anywhere** — URL-only access, server-gated by `admin_users` |
| `dashboard/dashboard.html` + `dashboard/dashboard.js` | **Not deployed.** `dist/` contains no `dashboard/` directory (verified) |
| `preview.html` (251 KB, root) | Orphan. A "Fractions SVG Preview (266 charts)" dev artifact. Not in the build, not referenced anywhere |

Student routes are not URLs. `src/nav.js:4` defines 10 screens (`login-screen`, `home`, `unit-screen`, `lesson-screen`, `quiz-screen`, `results-screen`, `history-screen`, `settings-screen`, `parent-screen`, `dashboard-screen`) toggled by a `.on` class. There is no History API routing; `popstate` is used only to defend against the iOS edge-swipe gesture. **This has a direct consequence for the native pivot: there are no deep links, and no URL state to preserve.**

### Service worker and PWA

`sw.js:1` — cache `math-workbook-v6.0.37-g2-u4l1-regroup-rebuild`, bumped by hand per deploy. `ASSETS = ['/', '/index.html', '/manifest.json']` — **`app.js` and `/data/*.js` are not precached**. Documents are network-first; everything else including `app.js` and the multi-megabyte unit data is **cache-first**. Invalidation depends entirely on the SW lifecycle firing: `boot.js:675-691` auto-applies updates and reloads on `controllerchange`. There is no content hash or query string on `app.js`, so a client whose SW registration silently fails (`.catch(()=>{})`, `boot.js:689`) can run stale `app.js` against a fresh `index.html` indefinitely.

**Classification: a mixture.** A traditional multi-page static host, serving one client-side SPA at `/`, wrapped as an installable PWA, plus a standalone admin page outside the bundle.

---

## 2. Current architecture

```
Netlify (static, no redirects, manual deploy)
├── /                     index.html + app.js (1.1MB, 24 concatenated files)
│   ├── SPA screens       nav.js show()/ALL_SCREENS — 10 screens, no URL routing
│   ├── Student app       home.js unit.js quiz.js question-engine.js visuals.js key-ideas.js
│   ├── Parent dashboard  src/dashboard.js (6,441 lines) — a SCREEN in the same SPA
│   ├── Auth              auth.js (3,651 lines)
│   └── State             state.js — grade-namespaced localStorage, DJB2-signed
├── /data/*.js            15+ MB of unit data, lazy-loaded via <script>, cache-first
├── /admin-analytics.html standalone, unlinked, admin-gated
├── /.netlify/functions/  signup-gate, waitlist-join, analytics-ingest, analytics-query,
│                         gemini-hint (NO CALLERS), gemini-report
└── Supabase              Auth + Postgres. Student writes go through SECURITY DEFINER RPCs.
                          Edge functions: send-push, notify-new-signup, notify-new-visitor (orphaned)
```

The single most consequential architectural fact for this pivot: **the parent dashboard is not a separate app.** It is `dashboard-screen` inside the same `index.html` SPA that children use. Your constraint "keep the parent dashboard separate from the child learning experience" is currently violated at the code level, and this is also what makes the routing bug in section 8 possible.

---

## 3. Complete feature inventory

### Student learning experience

| Feature | Implementation | Visible | Enabled | Functional | Notes |
|---|---|---|---|---|---|
| Grade selection | `index.html:277-291`, `auth.js:3605-3651` | Yes | K,1,2,3 | Yes | Switching does a **full `location.reload()`** (`auth.js:3650`) because `state.js:54-57` derives storage keys at parse time. G4/G5 shown as "Soon" |
| Unit selection | `home.js:44-358` | Yes | Yes | Yes | Diff-based refresh — a real optimization |
| Lesson selection | `unit.js:104-182` | Yes | Yes | Yes | Rebuilds grid unconditionally (`unit.js:141`), unlike home |
| Progression locking | `nav.js:60-83` | Yes | Yes | Yes | 80% on prior quiz unlocks next |
| Lesson instruction / Key Ideas | `unit.js:2025-2049`, `key-ideas.js` (2,491 lines, ~35 topic generators) | Yes | Yes | Yes | Tap-to-open only; string-built SVG; no listeners, leak-safe |
| Practice questions | `quiz.js:2982-3010` `_practiceWeak()` | Yes | Yes | Yes | Correctly excluded from DONE/streak |
| Lesson quizzes (8 Q) | `quiz.js:656` `_runQuiz()` | Yes | Yes | Yes | 3 easy/3 med/2 hard weighted sample |
| Unit tests (25 Q) | same | Yes | Yes | Yes | Draws from unit `testBank` |
| Final test (50 Q) | `quiz.js:3627` | Yes | Yes | Yes | **Eagerly loads all 10 G2 unit files (~5.5 MB)** |
| Custom quiz lengths | `quiz-config.js`, `dashboard.js:3510-3658` | Parent only | Yes | Partly | Non-default lengths **silently lose difficulty stratification** (`quiz.js:670-677`) |
| Scratch pad / Note Pad | `quiz.js:3386-3398`, `styles.css:1532-1537` | Yes | Yes | Partly | Opaque full-screen overlay. Problem preview added in `303e639`, but **blank visual for coin and picture-choice questions** |
| Hints (static) | `quiz.js:2893-2928` | Yes | Yes | Yes | −2% score penalty per hint |
| AI hints (Gemini) | `events.js:84` dispatches `fetchAIHint` | No | No | **No** | `_fetchAIHint` **is never defined**. Backend exists and is unreachable. Advertised to parents at `dashboard.js:3990` |
| Explanations | `quiz.js:1015-1038`, `772-806`, `3317-3337` | Yes | Yes | Yes | Three distinct contexts — no duplicate rendering found |
| Interventions | `quiz.js:180-188`, `1543-2236` (28-topic dispatcher) | Yes | Yes | Yes | ~160 lines duplicated between MC and tapGroup builders |
| Retry after intervention | `question-engine.js:168-254` `QE.selectRetry` | No | No | **Dead** | Never called from `src/`. Deliberately disabled after a stem/answer mismatch bug; two tests assert it stays uncalled |
| Mastery tracking | `state.js:139-151`, `quiz.js:467-505` | Internal | Yes | Yes | Feeds sampling. **Never displayed to students** — home progress bar reads binary pass/fail from SCORES |
| Spaced review | `quiz.js:467-505` | Internal | Yes | Partial | Recency/accuracy weighting, not a true SRS |
| Resume | `quiz.js:2949-2972`, `boot.js:539-551` | Yes | Yes | Yes | Well built. Quiz-only; no mid-lesson resume |
| Offline | `sw.js` | Yes | Yes | Incidental | A unit works offline **only after being opened once**. No prefetch |
| Dark mode | `settings.js:806-822` | Yes | Yes | Yes | Follows OS via matchMedia |
| Profile switcher | `profile-switcher.js` | Yes | Yes | Yes | PIN via RPC with server lockout, or parent bypass |
| Avatars | `auth.js:112-118, 796-893` | Yes | Yes | Yes | Emoji + gradient, set at signup |
| Audio | `#sound-toggle`, `index.html:558` | Toggle only | — | **No** | No playback code found in quiz/lesson files |
| Rewards / badges / confetti | — | — | — | **Absent** | Zero matches. Not dead code — never built |
| Rooty mascot | — | — | — | **Absent** | No implementation found. Branding only |
| Reduced motion | `styles.css:2442-2450` | Opt-in | Yes | Partial | No `@media (prefers-reduced-motion)` bridge |

### Parent experience

| Feature | Implementation | Real data? |
|---|---|---|
| Parent login (email/pw, Google) | `auth.js:1731-1860`, `1470-1498` | Yes |
| Child profile creation | `dashboard.js:5753, 5846` | Yes. PIN hashed with a **static shared salt** `'mymathroots_pin_salt_2025'` (~`dashboard.js:5861`) |
| Family code linking | `dashboard.js:5432-5485`, `auth.js:228` | Yes. 8-digit, server rate-limited |
| Student switching | `dashboard.js:5338, 733` | Yes |
| Quiz/test history + review | `dashboard.js:1672, 1549, 1740` | Yes. Keyed by stable `score.id` |
| Scores / overall stats | `dashboard.js:171-203` | Yes. Correctly returns 0, not 100%, on empty |
| Mastery / "Root System" | `dashboard.js:205, 4417, 4734` | **NO — reads the wrong table.** See section 9 |
| Weaknesses | `dashboard.js:233, 4983` | Partly — mistake tags from scores are sound; mastery percentages are not |
| Recommendations | `dashboard.js:664, 1395, 4973` | Template-based, not AI, though it reads like a diagnosis |
| AI progress report (Gemini) | `dashboard.js:2146` → `gemini-report.js` | Yes. Well-hardened: JWT required, ownership check, rate limit, 14-day server cooldown |
| Activity snapshot / calendar | `dashboard.js:752-911` | Partly — **time-on-task always renders 0 for managed students** |
| Streaks | `dashboard.js:5382-5407` | Yes (fixed previously) |
| Date filtering | `dashboard.js:1506` | Yes, client-side |
| Quiz-length config | `dashboard.js:3571-3658` | Yes but **localStorage only — does not sync across devices** (`dashboard.js:3508`) |
| Timer / unlock / a11y settings | `dashboard.js:3478, 3299, 3694` | Yes, synced via RPC |
| Password change | `dashboard.js:3888` | Yes |
| Reminders toggle | `dashboard.js:3793-3837` | **Inert.** Writes `wb_reminders` to localStorage; **nothing ever reads that key**. No scheduler exists |
| Changelog | `dashboard.js:3986-4020` | Hardcoded static HTML. Advertises push notifications and AI hints as shipped |
| Danger Zone / reset | `dashboard.js:3183, 3409` | Yes — but it is a **progress wipe, not profile deletion** (`dashboard.js:3159-3168`) |
| Assignments | — | **Does not exist** |
| Subscription controls | — | **Does not exist** |
| Account/profile deletion | — | **Does not exist in-app.** Email request only (`privacy.html:301`) |

Two push-notification systems share a name and neither works end to end. The toggle a parent can see (`dashboard.js:3793`) does nothing. The real, backend-wired Web Push implementation (`settings.js:1369-1470`, `supabase/functions/send-push`, `sw.js:27-40`, live daily cron confirmed by a migration comment) has **no reachable UI** — `push-toggle-btn` and `push-notif-section` are never rendered anywhere. Meanwhile `settings.js:1458` shows a toast telling users to "Enable in Settings → Notifications" — a section that does not exist.

### Admin and internal

| Tool | Verdict |
|---|---|
| `scripts/validate_grade2_content.js` | **Keep — load-bearing for math quality.** Validates all 7,338 G2 questions |
| `scripts/audit_grade2_phase2.js` | **Keep.** General, `--unit` arg |
| `scripts/audit-key-ideas.js` | **Keep.** Walks K/G1/G2 |
| `scripts/lib/u4l1_addition.js` + `rebuild_u4l1_addition_bank.js` + `audit_u4l1_bank.js` | **Keep.** The misconception-distractor generator is the best content asset in the repo |
| `scripts/verify_stage2.js`, `verify_stage3.js` | Keep — regression harnesses |
| `scripts/migrate_u*_phase2.js` (10), `patch_*`, `strip-stem-options.js`, `fix-u8-fraction-svg.js`, `u8_*.js`, `gen-visual-qs.py`, root `transform-*.js` (4) | One-off, already applied. Historical only |
| `scripts/*_review.txt`, `reports/*` | Output artifacts, not consumed by code |
| `admin-analytics.html` + `analytics-query.js` | Internal only. Keep for ops, exclude from the native app |
| `src/analytics.js` + `analytics-ingest.js` | Live. Genuinely privacy-by-design (see section 18) |
| `netlify/functions/gemini-hint.js` | Fully built, auth-hardened, tested — **zero callers** |
| `supabase/functions/notify-new-visitor` | Deployed but **orphaned** — its feeding path was removed for COPPA |
| `docs/supabase_migrations/001-013` | Superseded by `supabase/migrations/`, but see the schema gap in section 20 |

---

## 4. Enabled vs disabled features

**Enabled and working:** grade/unit/lesson selection and locking, key ideas, practice, lesson quizzes, unit tests, final test, static hints, explanations, interventions, mastery sampling, resume, profile switching, avatars, dark mode, parent login, child profiles, family codes, quiz history, AI progress report, streaks, date filtering, timer/unlock/a11y settings, password change, signup gate, waitlist, analytics.

**Intentionally disabled:** Grade 4/5 pickers (`index.html:287-288`, `dashboard.js:5653-5656`); `unlock.html` dev cheat page (deleted on every prod build with a post-build assertion, `build.js:45, 374-389`); leads capture (`20260612_leads_lockdown.sql` revoked the anon INSERT; the client form is already unreachable); feedback email trigger (`20260611_feedback_lockdown.sql`, dropped for a JWT leak).

**Partially disabled:** push notifications (backend live, UI missing); AI hints (backend live, frontend missing); G3 Unit 0 diagnostic (data authored, explicitly not routed — `TODO(g3-routing)`).

**Feature flags that exist:** `launch_settings` singleton (`signup_enabled=TRUE`, `max_parent_accounts=50`, `max_students_per_parent=2`, `waitlist_enabled=TRUE`) enforced server-side via `try_reserve_signup_slot()` and a fail-closed advisory-locked trigger; `?safeDebug=1` (works in production, diagnostic only); `?preview=1&testStreak=N` (localhost/192.168 only); `mmr_audit=1`; `ALLOW_LOCAL_REPORT` env var. There are no `window.FEATURE_*` flags — **the codebase has no general-purpose feature-flag mechanism.** That is a gap for the "hide behind a flag" recommendations below.

---

## 5. Dead and unfinished code

**Apparently dead:**
- `_fetchAIHint` — dispatched at `events.js:84`, never defined anywhere. CONFIRMED.
- `QE.selectRetry` (`question-engine.js:168-254`) — no callers in `src/`. Only `scripts/u8_smoke.js:108` calls it. CONFIRMED.
- `push-toggle-btn`, `push-notif-section`, `push-toggle-lbl` — referenced in `settings.js:1149, 1448-1449`, rendered nowhere. CONFIRMED.
- `mock_1`/`mock_2` branches in `src/dashboard.js` (8 sites) — `getAllStudents()` never produces those IDs. Note the mirror file `dashboard/dashboard.js:287-317` **does** generate demo profiles ungated, but that file is not deployed.
- `preview.html` (251 KB), `src/data/*.js.bak` (~2.5 MB across 12 files), `u6.js.bak2`, `u8.js.bak2`, `u6.js.compressed`, `src/visuals.js.bak`, root `transform-*.js` (4 files), `My_Math_Roots_*.pdf` (1.1 MB) — all unreferenced.
- `dist/manifest-v5.1.json` — stale build residue; the source file no longer exists, so builds silently skip it (`build.js:251` existsSync guard).
- `supabase/functions/notify-new-visitor` — deployed, feeding path removed.

**Live reference to a missing asset:** `sw.js:33-34` sets push notification `icon`/`badge` to `/icon-192-v5.1.png`, which **does not exist at repo root**. Push notifications, if ever wired up, would show a broken icon.

**Unsafe to remove:**
- `dashboard/dashboard.js` — not deployed, but `tests/dashboard.test.js` and `tests/g3.test.js` import it. See below.
- `QE.selectRetry` — `scripts/u8_smoke.js` depends on it.
- `_G3_UNIT0_DIAGNOSTIC` — `tests/g3.test.js` asserts its shape.
- Legacy storage migrations (`state.js:59-80`, `util.js:303`, `boot.js:601`) — marked "do not delete", run at every boot for existing installs.

**The single worst piece of technical debt in the repo:** `tests/dashboard.test.js` (149 KB, the largest dashboard test suite) and `tests/g3.test.js` `require('../dashboard/dashboard.js')` — a **fork that is not deployed and is 2,317 lines behind** the live `src/dashboard.js`. Every assertion in the largest dashboard suite validates code no user runs. This is worse than dead code: it manufactures confidence. Verified directly: `dist/` contains no `dashboard/` directory.

A second instance of the same pattern: `tests/sync-helpers.js` and `tests/push-merge-helpers.js` are **hand-written JS reimplementations** of `src/auth.js` logic and of PL/pgSQL migration bodies, by their own admission ("Pure JS mirror of the merge-preserve semantics"). They can drift from production silently, and they do — none of the sync defects in section 9 are caught by them.

---

## 6. Student-flow map

```
Cold start
 └─ boot.js parse → buildHome() runs unconditionally (line 563), splash hides it
    ├─ wb_guest_mode='1'          → FAST: show('home') before Supabase init      (boot.js:584-587)
    ├─ mmr_session_token present  → FAST: show('home') before Supabase init      (boot.js:588-597)
    └─ otherwise                  → supabaseInit(), wait on INITIAL_SESSION       (boot.js:598-599)
                                     ├─ 1.2s: _recoverVisibleScreen fallback      (boot.js:646)
                                     └─ 8.0s: hard timeout safety net             (boot.js:606-642)

Learning loop
 home → openUnit(idx) → _loadUnit(idx) [lazy <script>, 300KB-1.4MB] → unit-screen
      → openLesson() → _renderLesson() → lesson-screen (key ideas, tap to expand)
      → startLessonQuiz() → quiz-screen
           → _renderQ() → _pickAnswer() [buttons disabled synchronously, no double-fire]
           → wrong? _errTagCounts++ → _shouldShowFullIntervention() → overlay
           → per-answer autosave to wb_paused_quiz
      → _finishQuiz() → SCORES.unshift() + saveSc() → triggerCloudSync() [500ms debounce]
           → _updateStreak() if first pass → results-screen → afterResults() → home
```

Latency profile at first paint: the **blocking** Supabase CDN script at `index.html:38` (no `async`/`defer`, unlike GSI and Turnstile on the next two lines), plus 260 KB of HTML with inline CSS. `app.js` (1.1 MB) and `fonts.css` (225 KB) are correctly deferred/lazy — that part was done deliberately and well.

---

## 7. Parent-flow map

```
login-screen → signInWithPassword | signInWithOAuth(google) | family code + PIN
   └─ SIGNED_IN / INITIAL_SESSION → show('dashboard-screen') → _dbInit()
        ├─ _fetchManagedProfiles()        SELECT student_profiles (parent_id = auth.uid())
        ├─ _loadManagedStudentScores()    RPC get_student_progress_by_pin  ← WRONG TABLE for mastery
        ├─ _loadRemoteInterventionData()  SELECT intervention_events
        └─ renderDashboard()
             Action Summary → Practice Plan → Learning Insights → Unit Map →
             Quiz History → Activity Snapshot → Profiles → Settings

   "Go to <Name>'s App" → dbGoToApp (dashboard.js:6187) →
        enterStudentLearningSession({sessionToken: null}) → show('home')
        ⚠ this session has NO mmr_session_token — see section 8
```

There is **no polling and no realtime subscription**. A parent with the dashboard open will not see a quiz their child finishes on another device until they reload or switch students.

---

## 8. Authentication-flow map — and the student/dashboard routing defect

```
Anonymous  → _continueAsGuest() → COPPA gate (_showSoftGate) → _proceedAsGuest()
             wb_guest_mode='1', localStorage only, no sync. Full app access.
Signup     → signup-gate.js ONLY (Supabase native signup is disabled at project level)
             Turnstile → launch_settings check → try_reserve_signup_slot (atomic) →
             auth.admin.createUser → email confirmation. Non-enumerating 200 on duplicate.
Login      → signInWithPassword → SIGNED_IN → dashboard-screen
Google     → signInWithOAuth redirect → PKCE → INITIAL_SESSION → dashboard-screen
             _installHistoryGuard() scrubs the callback URL from history (iOS swipe defense)
Student A  → family code → get_profiles_by_family_code → verify_student_pin →
             session_token → enterStudentLearningSession(token) → show('home')
Student B  → parent taps "Go to App" → enterStudentLearningSession(sessionToken: null)
             → localStorage.removeItem('mmr_session_token')  (auth.js:363-366)
Sign-out   → synchronous _clearAuthRouteState() + show('login') BEFORE async signOut()
Reset pw   → resetPasswordForEmail → ⚠ no PASSWORD_RECOVERY case in onAuthStateChange
```

### CONFIRMED: the student IS routed to the parent dashboard. Here is the exact mechanism.

Your suspicion is correct, and it has a precise trigger. It affects **student path B only** (parent-launched, no PIN):

1. `enterStudentLearningSession({sessionToken: null})` **deletes** `mmr_session_token` (`auth.js:363-366`). The session is now `mmr_user_role='student'` + `mmr_active_student_id`, with **no token**.
2. On any full reload — browser refresh, PWA relaunch, **or the app's own service-worker auto-update reload at `boot.js:690`** — the fast path at `boot.js:588-597` requires `mmr_session_token`. It is absent, so boot falls through to `supabaseInit()` and renders nothing.
3. `INITIAL_SESSION` fires with the parent's still-valid Supabase session. `_shouldSuppressAuthNavigation()` (`auth.js:1214-1228`) sees `hasAuth && inLearningSession` and **suppresses navigation**, dismissing the splash without calling `show()`. No screen has `.on`. The user is looking at a blank page.
4. 1.2 s later, `_recoverVisibleScreen('post-init')` (`boot.js:646`) finds no active screen and computes `hasStudentSession` using the **stricter** token-requiring definition (`boot.js:446-449`) → false. `hasUser` → true. It executes `show('dashboard-screen'); _dbInit();` (`boot.js:459-463`).

**Root cause:** three predicates independently define "is this a valid student session" and they disagree. `_shouldSuppressAuthNavigation()` (`auth.js:1223-1225`) does **not** require `mmr_session_token`; `_hasValidStudentSession()` (`auth.js:1208`) and `boot.js:446-449` **do**. The gap between the lax guard that suppresses navigation and the strict guard that later recovers it is exactly where the child lands in the parent dashboard.

Commit `e21bc70` did **not** fix this — it fixed grade clobbering inside `enterStudentLearningSession`. No test covers this path. Note the compounding factor: a service-worker update pushed while a child is mid-lesson triggers this automatically, with no user action.

Data safety: this is a **routing/UX defect, not a privacy breach** — RLS still scopes everything to `parent_id = auth.uid()`, and the parent legitimately owns that data.

### Other auth findings

- **Password reset has no handler.** `onAuthStateChange` handles `INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT` — there is **no `PASSWORD_RECOVERY` case** (`auth.js:1263-1388`). A user returning via the reset link is routed only by the 8-second safety-net timeout, landing on the dashboard with no "set your new password" prompt. Reset works, but only by accident.
- **Route protection is server-side, correctly.** `show('dashboard-screen')` has no client guard; RLS and SECURITY DEFINER RPCs are the real gate. This is the right design and it is why the routing bug is not a data leak.
- **Admin role was hardened well.** `profiles.role='admin'` was self-promotable; `20260601_admin_source_of_truth.sql` moved truth to an `admin_users` table with no RLS policies (service-role only) plus a `BEFORE UPDATE OF role` trigger.

---

## 9. Progress-sync map — the most serious findings in this audit

```
answer → _updateMastery() [state.js:139-151, keyed by _qKey(text) hash]
       → SCORES.unshift() [quiz.js:3110]
       → saveSc() wrapped [auth.js:3224] → triggerCloudSync() [500ms debounce]
            → _pushAll() [auth.js:2435]
                ├─ RPC push_student_progress   p_scores:[] DELIBERATELY EMPTY (auth.js:2469)
                │    done_json    → JSONB || merge  ✅ (fixed in 20260609)
                │    mastery_json → WHOLESALE REPLACE ❌
                │    streak_*     → WHOLESALE, no anti-regression guard ❌
                │    apptime_json → WHOLESALE, aggregate-only guard ❌
                └─ RPC push_quiz_scores        → quiz_scores  (no reset_epoch param ❌)

dashboard ← RPC get_student_progress_by_pin
              quiz_scores    WHERE student_id = p_student_id      ✅ correct
              mastery_json   FROM student_progress WHERE user_id = v_parent_id LIMIT 1  ❌❌
              done_json      same wrong source ❌
              activity_json  same wrong source ❌
            ← direct SELECT student_profiles (streak, act_dates)  ✅ patched separately
            ← APP_TIME: never fetched at all → hardcoded 0 ❌
```

**S1. The parent dashboard reads mastery from the wrong table. CONFIRMED.**
`get_student_progress_by_pin` (`20260520_student_profiles_reset_epoch.sql:91-157`) sources `mastery_json`/`done_json`/`activity_json` from `student_progress sp WHERE sp.user_id = v_parent_id LIMIT 1` — a **legacy table**, filtered by parent only, **no `student_id` filter, no `ORDER BY`**. But the PIN-student write path (`push_student_progress`) writes mastery to `student_profiles.mastery_json`. Result: for the primary flow, the dashboard's mastery panel reads a table that likely has **no row for that student** (renders empty), or — for a parent with multiple children who has used the parent-direct path — can show **one child's mastery on another child's dashboard**. `quiz_scores` in the same response is correctly scoped, so parents see accurate scores beside wrong mastery. Corroboration that this is a known-shaped bug: the team already discovered the same RPC omits streak/act_dates and patched around it with a direct `student_profiles` query (`auth.js:635-665`) — **they never extended that patch to mastery/done/activity.**

**S2. Deleted quiz scores can be resurrected. CONFIRMED.**
`push_quiz_scores` (`20260628_push_quiz_scores_decoupled.sql:28-115`) has **no `p_reset_epoch` parameter and no epoch check**. Its only guard is `NOT EXISTS (student_id, local_id)`. Since `reset_student_data` deletes those rows, the guard trivially re-passes and a stale device re-inserts them permanently. The only protection comes from the sibling RPC returning `stale_reset_epoch`, which clears `SCORES` before the fall-through push — but that gate **only fires when the client sends `p_reset_epoch > 0`**, and `_dbReadLocalResetEpoch()` (`dashboard.js:3001-3008`) **defaults to 0** when `mmr_reset_epoch_<sid>` was never written. That key and `wb_sc5_<grade>` have independent lifetimes with nothing tying them together. Also, `_resumeSyncIfStudent` (`auth.js:2549-2550`) pushes **before** pulling, so a later correct pull hides the problem on-device while the resurrected rows persist server-side. Not self-healing.

**S3. Mastery, streak, and time-on-task are last-write-wins. CONFIRMED.**
`20260609_push_done_merge_preserve.sql:236-249`. Only `done_json` got the `||` merge — the migration says so itself ("Merging mastery/apptime is a separate, larger change", lines 232-235). `mastery_json = p_mastery_json` wholesale: a stale device **deletes every mastery key the server has that it doesn't know about**. This is the exact bug that caused a documented production incident for `done_json`; the fix was scoped to one field and left open for its siblings. Streak has **no anti-regression guard at all** (compare lines 100-118 vs 160-178) — a stale device can lower a streak and the server accepts it. `_updateStreak` (`auth.js:3156-3159`) additionally does a direct, unguarded LWW upsert to `profiles`.

**S4. Time-on-task is always zero for every managed student. CONFIRMED.**
`_fetchManagedProfiles()`'s SELECT (`dashboard.js:5407`) omits `apptime_json`. The seed hardcodes `APP_TIME: {totalSecs:0, sessions:0, dailySecs:{}}` (`dashboard.js:6144`) and nothing ever overwrites it. Real data exists server-side and is correctly written. This is the identical bug already fixed for STREAK (`dashboard.js:5374-5381`), never extended to APP_TIME. `tests/parent-dashboard-streak.test.js:162` hardcodes a zero appTime fixture, encoding the gap into the suite.

**S5. Guest progress leaks into a newly signed-in parent account. CONFIRMED.**
`_pullOnLogin()` explicitly wipes local `DONE` first (`auth.js:2176-2179`) with a comment stating the purpose: "prevents guest progress from being pushed to the parent's cloud account on first login on a shared device." It does **not** do the same for `SCORES`, `MASTERY`, `STREAK`, or `APP_TIME`. On a shared device, a guest child's scores and mastery merge into the next parent's account.

**S6. Intervention queue drops unsynced events.** `quiz.js:224` splices from the front at 500 events regardless of `synced` status. An offline device loses its oldest unsynced events permanently.

**S7. Two sync architectures coexist.** `_pullOnLogin` (`auth.js:2166-2329`, the parent-direct path) implements genuinely safe per-field merges: union DONE, append-only dedup SCORES, streak by date with `Math.max` longest, per-key mastery merge. The newer PIN-student RPC path — **the one most families now use** — is the less safe of the two.

**Test coverage of all of the above: zero.** Every defect S1-S7 passes CI today.

---

## 10. Major smoothness problems

| # | Severity | Symptom | Cause | Files | Platform | Fix | Risk |
|---|---|---|---|---|---|---|---|
| 1 | **Critical** | Child mid-lesson lands in the parent dashboard after an app update | Three disagreeing session predicates | `boot.js:446-463`, `auth.js:1214-1228, 363-366` | All | Unify into one `isStudentSession()`; make `_recoverVisibleScreen` accept parent-launched sessions | Medium |
| 2 | **Critical** | Parent sees wrong/empty mastery | RPC reads legacy `student_progress`, no student filter | `20260520...sql:91-157` | All | Repoint RPC to `student_profiles`, or patch client-side as was done for streak | Medium |
| 3 | **High** | Deleted scores reappear | `push_quiz_scores` epoch-blind | `20260628...sql:28-115` | All | Add `p_reset_epoch` + guard | Low-Medium |
| 4 | **High** | Parent's mastery/streak regresses | Wholesale replace, no guards | `20260609...sql:236-249` | All | Extend `||` merge to mastery; add monotonic streak guard | Medium |
| 5 | **High** | Time-on-task always 0 | `apptime_json` not selected | `dashboard.js:5407, 6144` | All | Add column to SELECT + hydrate | Low |
| 6 | **High** | Note Pad shows blank visual on coin/picture questions — the child loses the coins they need to solve the problem | No static branch for `coinChoices`/`imgChoice` | `visuals.js:240-258, 829-869` | All | Add read-only render branches | Low |
| 7 | **High** | Wrong lesson content renders after fast navigation | Missing stale-guard in `.then()` | `unit.js:1976-2008` | All | Add `if(CUR.unitIdx!==unitIdx) return;` — the pattern already exists in `openUnit()` | Low |
| 8 | Medium | Up to 8s on splash on poor networks | Auth safety-net timeout | `boot.js:606-642` | All | Shorten when `navigator.onLine===false`; show a connection affordance | Low |
| 9 | Medium | Slow first paint | Supabase CDN script blocks parsing | `index.html:38` | All | Add `defer` (verify no parse-time `window.supabase` access) | Low-Medium |
| 10 | Medium | Grade switch flashes a full app reboot | `location.reload()` | `auth.js:3650`, `state.js:54-57` | All | `setActiveGrade()` recomputing keys in memory | Medium |
| 11 | Medium | Advertised AI hints don't exist | `_fetchAIHint` undefined | `events.js:84`, `dashboard.js:3990` | All | Wire it or remove the claim | Product call |
| 12 | Low-Med | Final Test can pull ~5.5 MB | Eager `Promise.all` over all units | `quiz.js:3627, 3648` | Mobile | Pre-select the sample, or use G3's prebuilt-bank approach | Medium |
| 13 | Low-Med | Custom quiz lengths lose difficulty balance | Sampler gated on exact default | `quiz.js:670-677` | All | Scale targets proportionally | Medium |
| 14 | Low-Med | OS reduce-motion ignored | No media-query bridge | `styles.css:2442-2450` | All | Add `@media (prefers-reduced-motion)` | Low |
| 15 | Low-Med | Possible notch clipping on 6 modals | No safe-area on `.pin-box`, `.scratch-box`, etc. | `styles.css` | iPhone/iPad | Device check needed — UNCONFIRMED | Low |
| 16 | Low | Unit screen rebuilt every visit | `innerHTML=''` | `unit.js:141` | All | Port the diffing from `home.js` | Low |
| 17 | Low | Grade-picker listener accumulation | Not removed on close | `settings.js:1731-1742` | All | Store and remove the handler | Low |

**Confirmed clean** (worth stating, because these are the usual suspects): no double-scoring race — `_pickAnswer` disables buttons synchronously with a defense-in-depth guard (`quiz.js:962-985`); no 300 ms tap delay (`touch-action:manipulation` globally, `styles.css:322`); no duplicate explanation rendering; no `setInterval` leaks; no listener leaks in key-ideas/visuals; `location.reload()` is never used as in-app navigation.

---

## 11-12. Math content status and grade/unit inventory

All counts below were produced by loading the actual data files through the app's own merge functions and walking the result.

| Grade | Units | Lessons | Real content | qBank | testBank | unitQuiz | Total |
|---|---|---|---|---|---|---|---|
| K | 8 | 39 | **All 39** | 1,223 | 743 | — | **1,966** |
| 1 | 8 | 40 | **All 40** | 6,331 | runtime-assembled | same | **6,331** |
| 2 | 10 | 35 | **All 35** | 3,463 | 1,452 | 2,423 | **7,338** |
| 3 | 10 | 97 | **8 of 97 (8%)** | 81 | 81 | — | **81** + 62 CBE + 15 diagnostic |
| 4 | 0 | 0 | None | — | — | — | **0** |
| 5 | 0 | 0 | None | — | — | — | **0** |

Grade 2 by unit: u1 Basic Facts (4 lessons, 435/133/435), u2 Place Value (4, 442/130/435), u3 Add/Sub to 200 (4, 433/159/433), u4 Add/Sub to 1,000 (3, 302/160/70), u5 Money (4, 360/138/360), u6 Data (4, 363/113/289), u7 Measurement/Time (3, 272/138/30), u8 Fractions (3, 271/159/29), u9 Geometry (3, 272/160/272), u10 Mult/Div (3, 313/162/70).

**Grade 3 is a scaffold, not a curriculum.** `src/data/g3/u2.js` through `u10.js` are literally 7-9 lines each: `_mergeG3UnitData(N, { lessons: [], unitTest: {...} })`. 89 of 97 lessons have zero content. Only Unit 1 (Place Value to 100,000) is real.

**Question types:** everything renders through one 4-option multiple-choice component. There is **no true/false type, no typed-number-input, no drag/sort interaction** — "tap", "sort", and "coin" are visual skins on the same MC shape. Visual types: `base10`, `numberLine`, `array`, `objectSet`, `twoGroups`, `tenFrame`, `imgChoice`, `domino`, `dicePattern`, `fivFrame`, `comparison`, `shapes`, `coinChoices`, `tapGroup`. This matters for the pivot: your "unified structured question engine" is real, but its interaction surface is narrower than the feature list implies.

### Validator results (actually executed)

| Script | Result |
|---|---|
| `validate_grade2_content.js` | 7,338 questions scanned. **CRITICAL: 0. WARN: 19** (all `grade_range`). PASS |
| `audit_grade2_phase2.js --unit u1..u10` | **PASS on all 10**, each with 10-13 distinct misconception patterns |
| `audit_u4l1_bank.js` | 108 Qs, 100% 3d+3d, 87% multiple regrouping, 57.4% sums ≥1,000, 0 issues. **PASS** |

### Quality findings

- **TEKS alignment is inconsistent.** K and G2 carry TEKS at the **unit level only** — 0 of 35 G2 lessons and 0 of 7,338 G2 questions have a `teks` field. G1 (40/40 lessons, 59% of questions) and G3 (100%) carry it per-lesson and per-question. **For an App Store claim of TEKS alignment, G2 — your best content — is the least tagged.** No Texas Tech CBE alignment fields were found outside `g3/cbe.js`.
- **Stable question IDs do not exist where it matters.** G2: 0 of 3,463. K: 10 of 1,223. G3: 0 of 81. G1: 3,731 of 6,331 (59%). Questions are identified by **text hash** (`_qKey`, `state.js:133-137`). Your feature list claims "stable question IDs"; the data does not support it. Any question-text edit orphans that question's mastery history.
- **Distractor quality is genuinely strong** across G2/G1/K and G3 U1 — every sampled distractor carries an `err_*` tag, a `patternTag`, and a `me` misconception note.
- **Hint leakage:** heuristic flags K 26, G2 61, G1 2, G3 3. Most G2 flags are benign rounding scaffolds, but K has real leaks — e.g. `ku4l2` asks "Count 3 groups of 10. How many in all?" with hint "Count by tens: 10, 20, 30" and answer "30".
- **Duplicates:** mostly templated visual reuse by design, but at least one genuine duplicate confirmed in u1l1 (identical config, answer, and options, only reordered). 157 reversed-operand pairs in u1l1 — defensible for a commutativity lesson.
- **Scope creep:** 19 `grade_range` warnings, e.g. `u3l1` (unit titled "Add & Subtract to **200**") contains 284.
- **G1 gap:** `practiceQuestions` exist only for Unit 1 (154 items). **32 of 40 lessons have zero practice items.**

### u4l1 "Adding Really Big Numbers" — deep dive

**The rebuilt qBank is excellent and fully meets the objective.** 108/108 two-3-digit operands; 94/108 (87%) multiple regrouping (58 two-column, 36 three-column); 62/108 (57.4%) sums ≥ 1,000; distractors are misconception-simulated (`pattern_forgot_ones_carry`, `pattern_forgot_tens_carry`, `pattern_forgot_both_carries`); explanations are complete columnar worked solutions. **"What is 456 + 695?" → "1,151" is present**, with a full three-step explanation.

**But the lesson is only one-third fixed, and the student never sees just the qBank.** The known follow-up is confirmed and quantified:

- `u4.testBank` — 61 u4l1-tagged questions: only **31 (51%) are 3d+3d**. **12 (20%) are 2-digit + 2-digit** ("What is 54 + 38?"). **4 (7%) are subtraction** ("51 − 24 = 27. Check: 27 + 24 = ?"). 9 are conceptual with no computation. 5 are 3-operand multi-step.
- `u4.unitQuiz` — 38 u4l1-tagged questions: **22 (58%) are base-10-block place-value reading questions — not addition at all** ("What number do these base-10 blocks show?"), which belong to Unit 2. The remaining 16 are round-hundreds addition with **zero regrouping** ("300 + 100").

So a child who passes the rebuilt lesson then takes a unit test where half the "Adding Really Big Numbers" items are 2-digit addition or place-value reading. **The lesson is fixed; the assessments that measure it are not.** This is Phase 1's flagship task.

---

## 13. Feature keep / hide / remove matrix

### Keep for the first paid App Store release
Grade/unit/lesson selection and locking; key ideas instruction; practice; lesson quizzes; unit tests; static hints; explanations; interventions; mastery sampling; resume; scratch pad (after the coin/picture fix); dark mode; accessibility settings; parent login (email/password); child profiles; family code; PIN entry; profile switcher; avatars; quiz history + review; scores; mastery display (after the table fix); weaknesses; activity snapshot; streaks; progress sync; content validators; question-bank generator.

### Keep on the parent web dashboard only
AI progress report (Gemini) — see the privacy caveat in section 18; admin analytics; launch-gate controls; quiz-length configuration; danger-zone reset; account/password management; billing and subscription management (Apple requires IAP in-app, but the management surface belongs on web); data-export and deletion requests.

### Hide behind a feature flag
There is currently **no feature-flag mechanism in the client** — building a minimal one is a prerequisite for this row. Candidates: Grade 3 (until units 2-10 are built); final test (50 Q, eager 5.5 MB load); custom quiz lengths (loses difficulty balancing); spaced-review weighting; G3 Unit 0 diagnostic.

### Remove after dependency verification
`preview.html`; all `src/data/*.js.bak`/`.bak2`/`.compressed` (~2.5 MB); `src/visuals.js.bak`; root `transform-*.js` (4); root `My_Math_Roots_*.pdf` (1.1 MB); `dist/manifest-v5.1.json`; `notify-new-visitor` edge function + trigger; `mock_1`/`mock_2` branches; the inert Reminders toggle **or** its real backend (pick one — do not ship both); `_fetchAIHint` dispatch **or** the unused `gemini-hint.js` backend; the hardcoded changelog claims for push and AI hints; `dashboard/dashboard.js` — but **only after** repointing `tests/dashboard.test.js` and `tests/g3.test.js` at `src/dashboard.js`; the `/dashboard/*` header block in `netlify.toml` (dead config); `scripts/migrate_u*_phase2.js` and the other one-off scripts (archive rather than delete — they are the provenance record for the content).

### Reconsider after launch
Grades 3-5; assignments; rewards/gamification/badges; Rooty mascot; audio; in-quiz AI hints; push notifications; spaced repetition as a real SRS; realtime dashboard updates; the G3 CBE final.

**Do not remove**, despite complexity: the question engine, mastery tracking, content validators, the u4l1 misconception generator, progress sync, parent reporting, the signup gate, RLS/RPC security model. These are the product's moat.

---

## 14. Minimum viable paid product

A child opens the app, is already signed in, taps one button, resumes the right lesson, does 8 accurate questions with real feedback, and the parent sees a true number an hour later. Nothing else is required for v1.

**Essential student screens (6):** profile/PIN entry → home (units) → unit (lessons) → lesson (key ideas) → quiz → results. Cut from v1: history screen, final test, settings beyond sound/theme/accessibility.

**Essential parent screens (5):** login → student selector + overview → quiz history + review → weaknesses/next step → account & subscription. Cut from v1: AI report, analytics, learning calendar, reminders, quiz-length config.

**Features to disable for v1:** Grade 3 (8% built), final test, custom quiz lengths, reminders toggle, AI hint wiring, push notifications, the changelog.

**Features to postpone:** everything in "reconsider after launch".

---

## 15. Recommended initial scope

**Ship Grades K, 1, and 2. Do not ship Grade 3.**

The content decides this. K (1,966 Qs), G1 (6,331), and G2 (7,338) are real, validated, and misconception-tagged — 15,635 authored questions across 114 lessons. G3 is 81 questions across 8 of 97 lessons; shipping it as a paid grade would be selling an empty shell, and it is the single largest App Store rejection and refund risk in the plan.

Within that, **Grade 2 is the flagship** — it is the only grade with a passing content validator, a full unit-test/unit-quiz structure, and a misconception-distractor generator. Lead with it.

Required before shipping each:
- **G2:** rebuild `u4.testBank` and `u4.unitQuiz` u4l1 items (section 12); add lesson- and question-level TEKS; resolve the 19 grade_range warnings.
- **G1:** build practice items for units 2-8 (32 lessons currently have zero); raise worked examples toward target.
- **K:** fix the hint leaks (26 flagged); port the validator to K (it currently only covers G2).

---

## 16. Recommended App Store architecture

**Recommendation: Capacitor. This is not close.**

| | PWA only | **Capacitor** | React Native + Expo |
|---|---|---|---|
| Code reuse | 100% | **~95%** | **~15%** — data only |
| Effort | None | **Small-Medium** | **Very Large** |
| Native feel | Poor on iOS | Good with work | Excellent |
| Offline | Already works | **Better** — bundle data natively, drop the SW | Requires rebuild |
| Auth | Works | Needs deep-link OAuth | Needs rebuild |
| Supabase | Works | **Works** | Works |
| IAP | **Not possible** | Plugin | Native |
| Review risk | **Rejected** (3.1.1, 4.2) | Moderate | Low |
| Logic duplication | None | **None** | **Severe** |

**Why not React Native**, concretely: the entire question renderer is string-built HTML/SVG. `key-ideas.js` alone is 2,491 lines with ~35 topic-specific SVG generators; `visuals.js` renders base-10 blocks, number lines, ten-frames, dominoes and coins as SVG strings. None of it survives a port. You would rewrite `quiz.js` (173 KB), `visuals.js`, `key-ideas.js`, `unit.js`, and `home.js`, and then maintain **two** copies of the mastery, sampling, and sync logic — the exact business logic where this audit found seven live defects. Duplicating that is how you get a native app whose parent dashboard disagrees with the web one.

**Why not PWA-only:** Apple will not accept a repackaged website (4.2), and you cannot take subscription payment for it (3.1.1).

**Sharing boundary:**

| Layer | Disposition |
|---|---|
| Question bank (`src/data/**`, 15 MB) | **Share verbatim.** Bundle as native assets — this also fixes the cache-first staleness and the offline-only-after-first-visit gap |
| Question engine, sampling, mastery, scoring, interventions | **Share verbatim** |
| Validators, generator (`scripts/lib/u4l1_addition.js`) | **Share** — build-time only |
| Sync/RPC layer (`auth.js` push/pull) | **Share — but fix section 9 first.** Do not carry these defects into a second client |
| Student UI | **Share** (Capacitor) — needs safe-area, keyboard, and reduced-motion work |
| Parent dashboard | **Web-only.** Keep out of the app binary. This also resolves the "keep them separate" constraint |
| Admin analytics | **Web-only** |
| Service worker | **Drop in native.** Native asset bundling replaces it |
| Google OAuth redirect | **Rebuild.** `redirectTo: location.origin + '/'` (`auth.js:1485-1488`) will not deep-link into a native shell — needs a custom scheme plus `@capacitor/browser` |
| IAP | **New, native only** |

Prerequisite work before wrapping: give the SPA real routing or a durable session restore (there are no URLs today, and section 8's bug is a routing bug); extract the parent dashboard out of `index.html`.

---

## 17. Monetization-readiness gaps

**Nothing exists.** No Stripe, no IAP, no StoreKit, no receipts, no entitlements, no paywall, no trial, no plans, no tiers, no promo codes, no `ios/` or `android/` directory, no billing dependency. The only hit for "subscription" in the entire repo is `'subscription_started'`, an analytics event name that **nothing ever fires** (`analytics.js:24`). `terms.html:112` currently states no payment is required.

**The one reusable asset** is the launch-gate system: `launch_settings` (singleton: `signup_enabled`, `max_parent_accounts=50`, `max_students_per_parent=2`, `waitlist_enabled`), enforced by `try_reserve_signup_slot()` (atomic CAS) and a fail-closed, advisory-locked `BEFORE INSERT` trigger on `student_profiles`. This is **architecturally the right shape** for "free = 1 child, paid = 4 children" — server-enforced at the database, not the client. But today `max_students_per_parent` is a **single global value for every parent**. To become an entitlement it must move to a per-account row (`profiles.plan` or an `entitlements` table) that the trigger reads per parent.

**Recommended first model:** Grade K free in full (it is complete, it proves value, and it is a real trial rather than a timer). One family subscription unlocking G1+G2, monthly and annual. No ads. No consumables.

**Required sync architecture** — Apple, web, and Supabase must agree, with Supabase as the single source of truth:

```
Apple IAP purchase → App Store Server Notifications V2 (webhook) →
    Netlify function verify-apple-receipt (JWS signature verify against Apple's root cert)
        → UPSERT entitlements {parent_id, source:'apple', tier, expires_at, original_txn_id}
Stripe web purchase → Stripe webhook → same function shape → UPSERT entitlements {source:'stripe'}

Client (native + web) → RPC get_entitlement() → {tier, expires_at, grades[]}
Server → the student-cap trigger and every content RPC read `entitlements`, never the client
Restore purchases → StoreKit restore → re-verify → re-UPSERT by original_transaction_id
```

Non-negotiables: never trust a client-reported purchase; key Apple entitlements on `original_transaction_id` so restores are idempotent; handle the account-mismatch case (Apple ID ≠ Supabase account) explicitly; the grace-period/billing-retry states from ASSN V2 must map to a real `expires_at`, or families get locked out mid-month. Follow the existing codebase convention — server-side SECURITY DEFINER RPCs, client role is a UX hint only.

---

## 18. Privacy and account-readiness gaps

The analytics pipeline is genuinely well built and I want to say so plainly: IDs are **server-stamped from a verified JWT/PIN session, never trusted from the client** (`analytics-ingest.js:91-140`); PII is stripped in **two layers** (client `analytics.js:127-138`, server `:143-156`, including an email-regex nuke); events are **whitelisted** in three places including a DB CHECK; IP is used only for in-memory rate limiting and **never written to any column**; no fingerprinting, no ad IDs, no geolocation. `_trackAnonSession()` was **deliberately removed for COPPA** (`auth.js:1411-1417`). The COPPA consent gate exists in both the guest flow (`auth.js:3044-3069`) and signup (`index.html:193-197`).

Against that, the gaps:

1. **Child name + full academic profile is sent to Google Gemini.** `gemini-report.js:393-398` sends `display_name` — usually the child's real first name — with unit scores, mastery, error tags, misconception patterns, recovery rates, streaks and session timing. It **is** accurately disclosed (`privacy.html:420-430`). Two risks: the "not retained by Google beyond the API request" claim (`privacy.html:429`) depends on the Gemini API tier's terms and is **UNCONFIRMED** from this repo; and the name is unnecessary. **Recommendation: stop sending it.** Substitute "your student" or a first initial. The report quality does not depend on the name, and this single change removes the only child-identifying data crossing your trust boundary.
2. **`mmr_anon_visitor_id` contradicts the privacy policy.** `analytics.js:85-102` mints a `crypto.randomUUID()`, persists it indefinitely in localStorage, and transmits it (`auth.js:1117-1128`). `privacy.html:173-176` states "We do not collect persistent device identifiers." That is a stable, server-transmitted, persistent identifier. Rotate it daily or fix the wording.
3. **No in-app account deletion.** Email-only, manual (`privacy.html:301`). Apple guideline **5.1.1(v) requires in-app deletion** for any app supporting account creation. This is a hard blocker for submission. Note also that "Reset All" is a progress wipe that **keeps** the child's name, PIN, and avatar (`dashboard.js:3159-3168`).
4. **"AES-256-GCM encrypted" email is obfuscation, not encryption.** The key lives in `wb_app_secret` in the **same localStorage** as the ciphertext (`util.js:265-337`). Do not describe it to reviewers or users as protecting confidentiality.
5. **`privacy.html:467` still contains a literal `[Business address — add before launch]` placeholder.**
6. **Google Identity Services and Turnstile load on every page, including while a child is mid-quiz** (`index.html:38-40`), because parent and child share one HTML document. Splitting the dashboard out (section 16) fixes this too.
7. **Support contact is a personal Gmail** (`akeemjones93@gmail.com`) used for privacy requests, deletion, terms and admin alerts — while `send-push/index.ts:46` references `support@mymathroots.com`, which is not the published contact.
8. **90-day analytics retention depends on a `pg_cron` job described as a manual setup step** (`ANALYTICS_PLAN.md:59-67`). UNCONFIRMED whether it is actually scheduled. If not, the retention claim is not enforced.
9. **Consent is a checkbox attestation**, not FTC-verifiable parental consent. Whether that suffices given what is collected needs formal review — not a conclusion I can offer.

**Data minimization for a child math app:** stop sending the child's name to Gemini; drop or rotate the anon visitor ID; drop `age` if it is not driving anything (UNCONFIRMED whether it is); scope third-party scripts away from child screens; delete the orphaned `notify-new-visitor` path so it cannot be misdescribed on an App Privacy questionnaire or accidentally re-enabled.

These are technical and product risks. **Formal privacy review is required** for: the Gemini data flow and API tier terms, the checkbox-consent model, and the App Privacy disclosure itself.

---

## 19. Ordered implementation roadmap

### Phase 0 — Product freeze and cleanup plan (Small)
**Objective:** stop the bleeding and establish truth about what ships.
**Systems:** git branches; `tests/dashboard.test.js`, `tests/g3.test.js`; `dashboard/dashboard.js`; `netlify.toml`; root artifacts.
**Work:** freeze new features. Repoint the two test suites at `src/dashboard.js` and fix the resulting failures — **this must come first, because it will reveal untested defects in the code you actually ship**. Delete or archive `dashboard/dashboard.js`, `preview.html`, `*.bak*`, `transform-*.js`, root PDFs, `dist/manifest-v5.1.json`. Prune stale branches. Add a minimal client feature-flag mechanism (none exists). Decide: gemini-hint wired or removed; Reminders wired or removed; changelog claims corrected.
**Dependencies:** none. Start here.
**Acceptance:** `npm test` runs the deployed dashboard code and passes; no test imports a non-deployed file; `dist/` byte-diff unchanged by the deletions; repo has one dashboard implementation.
**Risks:** repointing the tests will surface real failures. That is the point — budget for it.

### Phase 1 — Math correctness and curriculum quality (Large)
**Objective:** every assessment measures the lesson it claims to.
**Systems:** `src/data/u4.js` (`testBank`, `unitQuiz`); `scripts/lib/u4l1_addition.js`; `scripts/validate_grade2_content.js`; `src/data/k/**`; `src/data/g1/**`; `src/data/shared*.js`.
**Work:** regenerate u4l1 items in `u4.testBank` (12 two-digit, 4 subtraction, 5 multi-step to replace) and `u4.unitQuiz` (22 place-value, 16 no-regroup to replace) using the existing generator — **never hand-edit u4l1**. Sweep the other 9 G2 units for the same objective drift. Add lesson- and question-level `teks` to G2 and K. Fix the 19 grade_range warnings. Fix K hint leaks (26). Build G1 practice items for units 2-8 (32 lessons). Extend the validator to K/G1/G3. Decide the stable-ID question (see risks).
**Dependencies:** Phase 0.
**Acceptance:** `audit_u4l1_bank.js` passes for testBank and unitQuiz, not just qBank; validators pass for K/G1/G2 with 0 critical and 0 grade_range; every shipping lesson has TEKS; no hint contains its answer.
**Risks:** **Adding stable IDs changes question identity and orphans existing mastery history** (keyed by text hash, `state.js:133-137`). Either accept a one-time mastery reset for beta users, or write a migration mapping hash→ID. Decide before touching the data, not after.

### Phase 2 — Student experience smoothness (Medium)
**Objective:** the app feels native before it is native.
**Systems:** `visuals.js:240-258`; `unit.js:1976-2008`; `index.html:38`; `boot.js:606-642`; `styles.css`; `auth.js:3650`/`state.js:54-57`.
**Work:** items 6-10 and 14-17 from section 10. Note **item 1 (the routing bug) moves to Phase 3** because it is a session-truth problem, not a rendering one.
**Dependencies:** Phase 0.
**Acceptance:** Note Pad renders coins and pictures; no stale-lesson render under rapid navigation; first paint unblocked; offline cold start under 3s; safe areas verified on a real iPhone and iPad.
**Risks:** the grade-switch refactor touches `state.js`, which everything reads. Do it last in this phase, or defer it.

### Phase 3 — Progress and parent-dashboard reliability (Large)
**Objective:** every number a parent sees is true. **This is the phase that decides whether the product is sellable.**
**Systems:** `get_student_progress_by_pin` (`20260520...sql:91-157`); `push_quiz_scores` (`20260628...sql`); `push_student_progress` (`20260609...sql:236-249`); `dashboard.js:5407, 6144`; `auth.js:2176-2179, 2435-2516`; `quiz.js:215-226`; `boot.js:446-463`; `auth.js:1214-1228`.
**Work:** repoint the RPC's mastery/done/activity reads to `student_profiles` (S1). Add `p_reset_epoch` to `push_quiz_scores` (S2). Extend the `||` merge to `mastery_json`; add monotonic guards to streak and per-day merge to apptime (S3). Add `apptime_json` to `_fetchManagedProfiles` and hydrate it (S4). Wipe guest SCORES/MASTERY/STREAK/APP_TIME on sign-in as DONE already is (S5). Make the intervention queue drop synced-first (S6). Converge the two sync architectures on the safer `_pullOnLogin` merge semantics (S7). **Unify the three session predicates into one and fix the student→dashboard routing bug** (section 8). Write tests for all of it — currently zero.
**Dependencies:** Phase 0. **Blocks Phases 5 and 6 — do not build a second client or sell a subscription on top of these defects.**
**Acceptance:** a parent-launched student session survives a service-worker reload and stays in the app; a reset then a stale-device push does not resurrect scores; a stale device cannot lower mastery/streak; time-on-task renders real values; mastery matches the child who earned it; every fix has a test that fails on the old code.
**Risks:** highest-risk phase. Changing live RPCs affects deployed clients — old clients keep calling old signatures, so add parameters with defaults rather than changing shapes. `mastery_json` merge semantics deserve a staging rehearsal.

### Phase 4 — Account and privacy readiness (Medium)
**Objective:** clear App Review and minimize child data.
**Systems:** `gemini-report.js:393-398`; `analytics.js:85-102`; `privacy.html`; `terms.html`; new deletion RPC + UI; `auth.js:1263-1388`.
**Work:** stop sending the child's name to Gemini. Rotate or drop the anon visitor ID. **Build in-app account and profile deletion** (Apple 5.1.1(v)) — a SECURITY DEFINER RPC plus a real UI, distinct from the progress reset. Fill the business-address placeholder. Correct the "persistent identifiers" and "encrypted email" wording. Set up a real support address. Add the `PASSWORD_RECOVERY` handler. Confirm the `pg_cron` retention job. Scope GSI/Turnstile away from child screens. Remove `notify-new-visitor`. Draft the App Privacy disclosure.
**Dependencies:** Phase 0. Section 16's dashboard split makes the third-party-script item easier.
**Acceptance:** no child-identifying data leaves the trust boundary; in-app deletion works end to end and is verified in the database; privacy.html matches code behavior claim by claim; App Privacy questionnaire drafted.
**Risks:** the privacy policy needs formal legal review — I am not offering a legal conclusion.

### Phase 5 — Native app foundation (Large)
**Objective:** a Capacitor iOS app running the existing student code.
**Systems:** new `ios/`; `index.html` split; `auth.js:1485-1488`; `sw.js`; `src/data/**`.
**Work:** extract the parent dashboard out of `index.html` into its own web entry (this also fixes the child/parent separation constraint and the third-party-script exposure). Add Capacitor. Bundle `src/data/**` as native assets and drop the SW in native. Rebuild Google OAuth as deep-link + `@capacitor/browser`. Native safe areas, keyboard, status bar, splash. Introduce real routing or durable session restore.
**Dependencies:** **Phases 1-4.** Do not wrap defective sync or unvalidated content.
**Acceptance:** iOS app boots offline with all K-2 content bundled; Google sign-in returns into the app; a child never sees the parent dashboard; parity with web on a real device.
**Risks:** the dashboard extraction is the largest structural change in the plan — `src/dashboard.js` is 6,441 lines sharing globals with the student app through concatenation. Sequence it carefully.

### Phase 6 — Subscription and entitlement system (Large)
**Objective:** a family subscription that Apple, web, and Supabase agree on.
**Systems:** new `entitlements` table + RPC; new `verify-apple-receipt` function; Stripe webhook; `launch_settings`/student-cap trigger; App Store Connect.
**Work:** per section 17. Move `max_students_per_parent` from global to per-account. Gate G1/G2 server-side; keep K free. Restore purchases. Handle grace/billing-retry states.
**Dependencies:** Phases 3 and 5.
**Acceptance:** purchase on iOS unlocks on web within seconds; restore is idempotent across reinstall; a revoked/expired receipt re-locks; no client-reported purchase is ever trusted; cancellation mid-cycle retains access to `expires_at`.
**Risks:** the Apple-ID-vs-account mismatch case; refund/chargeback handling; getting the grace-period mapping wrong locks paying families out.

### Phase 7 — TestFlight and controlled launch (Medium)
**Objective:** validate with real families before charging.
**Work:** internal TestFlight; external with the existing waitlist (`waitlist_entries` already exists and is rate-limited); reuse `launch_settings` caps for cohort control. Watch: crash-free rate, cold start, sync divergence between the child's device and the parent's view, purchase→unlock latency, quiz completion.
**Dependencies:** all prior phases.
**Acceptance:** ≥99% crash-free; zero sync-divergence reports; no App Review rejection on 3.1.1, 5.1.1(v), or 4.2; a beta cohort completes lessons and renews.
**Risks:** first submissions commonly reject on account deletion (Phase 4) and on "minimum functionality" if the app reads as a wrapped website — which is why Phase 5's native work is not optional polish.

---

## 20. Major risks and dependencies

**Critical**

1. **The database schema is not reproducible from this repo.** `20260600_profiles_baseline.sql:24-28` states outright that `quiz_scores`, `intervention_events`, `student_progress`, `user_mastery`, `push_subscriptions`, `pin_sessions`, `pin_attempts`, `anonymous_sessions`, `leads`, and `feedback` "exist in production but their baseline is out of scope — DEFERRED to a Phase 1 reverse-engineer pass." **Their RLS policies are unverifiable from this repository.** Given that `student_profiles` once carried an accidental `anon_select_for_realtime` policy that exposed every child's row (found and dropped in `20260501_launch_security_hardening.sql:41-45`), these tables should not be assumed safe. This needs live verification before launch, and it is the top item on the list.
2. **`_validate_pin_session` — the authorization gate every student RPC delegates to — has no definition anywhere in this repo.** Referenced dozens of times, created nowhere. Its expiry, scoping, and brute-force behavior are production-only and unauditable from source. Nearly all student write access flows through it.
3. **Migration history is split across two directories.** `verify_student_pin`, `ensure_family_code`, and the original `get_profiles_by_family_code` live in `docs/supabase_migrations/001-013`, not in the CLI-tracked `supabase/migrations/`. `supabase/migrations/` alone cannot provision a new environment. There is no staging parity.
4. **Section 9's sync defects are unshipped truth debt.** Every one passes CI. Phases 5 and 6 must not proceed on top of them.

**High**

5. **Content and code identity are coupled through text hashes.** Mastery keys on question text (`state.js:133-137`). Any Phase 1 text edit silently orphans history. Decide the ID strategy before editing.
6. **Grade 3 exists in the UI and is 8% built.** It is currently selectable. If any beta family is in G3, they are seeing 89 empty lessons.
7. **Deploys are manual, with a hand-edited service-worker cache string.** One forgotten `sw.js:1` bump ships stale `app.js` to every returning user with no other invalidation path.
8. **The 149 KB dashboard test suite validates code that does not ship.** Confidence is manufactured until Phase 0 fixes it.
9. **`tests/sync-helpers.js` and `tests/push-merge-helpers.js` are hand-written mirrors of production logic** and can drift silently. They did — none of S1-S7 was caught.

**Medium**

10. Build fails soft on missing env vars (`build.js:105-107`) — a blank-credential deploy is possible.
11. Static PIN salt shared across all installs (`dashboard.js:5861`).
12. `renameGlobals:false` is forced by 18 inline `onclick=` handlers in `index.html`, which also blocks the CSP hardening `events.js:1-21` was written for.
13. G1 data is transformed by regex, not AST (`build.js:301-320`) — fragile to any syntax deviation.
14. `sw.js:33-34` references `/icon-192-v5.1.png`, which does not exist.

**Dependency chain:** Phase 0 → Phase 1 (content) and Phase 3 (sync truth) in parallel → Phase 2 (smoothness) → Phase 4 (privacy) → **Phase 5 (native) requires 1-4** → Phase 6 (subscription) requires 3 and 5 → Phase 7 requires all.

**Do the database verification (risks 1-3) now, in parallel with Phase 0.** It is the only item that could invalidate the rest of the plan, and it cannot be answered from this repository.
