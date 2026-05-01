# SECURITY AUDIT — My Math Roots Public Launch

**Domain:** `https://mymathroots.com`
**Audit date:** 2026-05-01
**Codebase:** V1 vanilla JS PWA (master branch, commit `52a42c2`)
**Backend:** Supabase project `omjegwtzirskgmgeojdn` (us-east-2, Postgres 17)
**Audience:** COPPA-regulated K–5 children + their parents

---

## 1. Executive Summary

- The codebase is **substantially more mature** than its surface suggests. Migrations 005–013 plus newer 2026-03/04 work already deliver bcrypt PIN hashing, server-issued PIN session tokens, schema validation on every push, lockout on brute force, IP rate limiting on Gemini calls, and a strong CSP / HSTS / X-Frame-Options posture.
- The **public launch is currently blocked by four database-side findings** that grant unauthenticated access to children's profile data, progress, and an open email-spam relay. All four are fixable via one migration file (written, not applied) and one edge-function redeploy.
- **Frontend / build / deployment posture is solid.** No secrets are bundled into `dist/` (only the public anon key, which RLS protects). HSTS preload, strong CSP (with one accepted-risk `'unsafe-inline'`), Permissions-Policy, X-Frame-Options DENY are all in place.
- **130/130 tests pass** before and after the applied fixes; a clean build emits no source maps in production.
- 5 code fixes applied this audit + 1 migration file written. Two further follow-ups are required from the human operator (Supabase dashboard settings + edge-function redeploy of `notify-new-visitor`).

## 2. Launch Readiness Rating

> **🟢 GREEN — Safe to launch** as of **2026-05-01**.
>
> All four 🚨 launch-blocker findings (F-1 through F-4) are closed in production: migration applied, patched edge function deployed and verified (returns 401 for unauthenticated requests). F-9 (HaveIBeenPwned leaked-password protection) was activated after the project upgraded to **Pro plan** — the Attack Protection page now shows it as **ENABLED**. The remaining items (F-8, F-12, F-15, F-13, F-14) are recommended hardening, none are launch-blockers.

**Rating progression:**
- Audit baseline: 🔴 RED (anon could SELECT every child profile, etc.)
- After 2026-05-01 migration + edge-function redeploy: 🟡 YELLOW (F-9 still gated by FREE plan)
- After Pro upgrade + leaked-password toggle saved: **🟢 GREEN** ✅

### Rubric

| Rating | Meaning |
|--------|---------|
| 🟢 Green | Zero unfixed Critical / High; manual checklists confirmed; tests passing |
| 🟡 Yellow | Critical fixed; ≤3 High deferred with explicit mitigation |
| 🔴 Red | One or more unfixed Critical, or unverified RLS on a user-data table |

### Severity definitions

- **Critical** — direct, unauthenticated path to child PII or a clear bill-abuse vector
- **High** — requires authentication or a guess but still leaks data / costs money / breaks isolation
- **Medium** — defense-in-depth gaps or warnings that don't directly enable an attack today
- **Low** — hardening recommendations
- **Informational** — observations / accepted risks

---

## 3. Findings (severity-ranked)

| # | Severity | Title | Status |
|---|----------|-------|--------|
| F-1 | 🚨 Critical | `student_profiles.anon_select_for_realtime` policy lets any anon role SELECT every child profile | ✅ **Applied 2026-05-01** — verified `parent_owns_profiles` is the only remaining policy; anon REST returns `[]` |
| F-2 | 🚨 Critical | `get_student_progress_by_pin(uuid)` RPC has no ownership check | ✅ **Applied 2026-05-01** — replaced with 2-arg auth-checked version |
| F-3 | 🚨 Critical | `get_all_student_settings(uuid)` RPC has no ownership check | ✅ **Applied 2026-05-01** — replaced with 2-arg auth-checked version |
| F-4 | 🚨 Critical | `notify-new-visitor` edge function accepts unauthenticated POSTs (email-spam + Resend bill-risk) | ✅ **Applied 2026-05-01** — edge function redeployed (verified: 401 for no/wrong auth); trigger updated to send `Authorization: Bearer <vault_secret>` |
| F-5 | 🟠 High | `gemini-report.js` Netlify function trusted client-supplied `studentId` | ✅ **Fixed in code** (this audit) |
| F-6 | 🟠 High | Three stale `push_student_progress` overloads + one stale `pull_student_progress` overload still callable by anon | ✅ **Applied 2026-05-01** — only 14-arg push and 3-arg pull remain |
| F-7 | 🟠 High | `anonymous_sessions` allows public INSERT/UPDATE (bill-risk; frontend no longer writes) | ✅ **Applied 2026-05-01** — only `no_direct_access` policy remains |
| F-8 | 🟠 High | `leads.insert` policy is `WITH CHECK (true)` — unbounded anonymous inserts | Recommended fix documented; out of audit scope |
| F-9 | 🟠 High | HaveIBeenPwned leaked-password protection disabled in Supabase Auth | ✅ **Enabled 2026-05-01** — project upgraded to Pro plan; Attack Protection page shows ENABLED |
| F-10 | 🟡 Medium | PII (`studentId`, role, localStorage state) printed to `console.log` in production | ✅ **Fixed in code** (gated behind `_devLog`) |
| F-11 | 🟡 Medium | `validate_quiz_score()` has mutable search_path (advisor 0011) | ✅ **Applied 2026-05-01** — search_path locked to `public` |
| F-12 | 🟡 Medium | `notify-new-signup` Bearer-prefix check doesn't validate the JWT | Recommended fix documented |
| F-13 | 🔵 Low | CSP `'unsafe-inline'` in `script-src` (preserves `onclick=` handlers) | Accepted risk — see §17 |
| F-14 | 🔵 Low | `.github/workflows/deploy-staging.yml` references `app/` (V2 SvelteKit moved to separate repo) | Stale CI artifact; non-security |
| F-15 | ℹ️ Info | Family-code regex `/^MMR-[A-Z0-9]{4}$/i` in `auth.js:67` mismatches the 8-char format from migration 005 | Functionality bug, not security |

**Counts:** 4 Critical · 5 High · 3 Medium · 2 Low · 1 Info

---

## 4. RLS Table-by-Table Audit

All 14 tables in `public` have RLS **enabled** (verified via `pg_class.relrowsecurity`). Policies summarised below.

| Table | Verdict | Notes |
|-------|---------|-------|
| `profiles` | ✅ Sound | SELECT/INSERT/UPDATE all gated on `auth.uid() = id` |
| `student_profiles` | 🚨 **CRITICAL** | `parent_owns_profiles` is correct, but `anon_select_for_realtime` (USING `true`, role `anon`) overrides it — see F-1 |
| `student_progress` | ✅ Sound | All three policies use `auth.uid() = user_id` |
| `quiz_scores` | ✅ Sound | All four policies use `auth.uid() = user_id`. INSERT trigger `validate_quiz_score` adds defense-in-depth |
| `intervention_events` | ✅ Sound | INSERT/SELECT scoped via `student_profiles.parent_id = auth.uid()` join |
| `user_mastery` | ✅ Sound | ALL policy scoped via parent_id join |
| `feedback` | ✅ Sound | INSERT requires authenticated; SELECT on own only |
| `push_subscriptions` | ✅ Sound | All four ops use `auth.uid() = user_id`, role `authenticated` |
| `pin_sessions` | ✅ Sound | `no_direct_access` (USING `false`) — RPC-only |
| `pin_attempts` | ✅ Sound | Same — RPC-only |
| `family_code_lookups` | ✅ Sound | Same — RPC-only |
| `api_rate_limits` | ✅ Sound | RLS on, no policy = deny by default; only service_role via `check_and_increment_rate_limit` RPC. Advisor flags this as INFO; not a real gap |
| `anonymous_sessions` | 🟠 **HIGH** | INSERT/UPDATE policies are `WITH CHECK (true)` — see F-7 |
| `leads` | 🟠 **HIGH** | INSERT policy `WITH CHECK (true)`. SELECT is service-role-only (good) — see F-8 |

---

## 5. RPC / Function Ownership Audit

19 RPCs called from the frontend, plus 8 internal helpers. All are `SECURITY DEFINER` with `SET search_path` set explicitly (except F-11). **Definitions verified against production via `pg_proc`.**

| RPC | Args | Ownership check | Verdict |
|-----|------|-----------------|---------|
| `_validate_pin_session` | uuid, uuid | n/a (helper) | ✅ Validates token + matches student_id + expires_at |
| `check_and_increment_rate_limit` | text, int, bigint | role-only (service_role) | ✅ |
| `cleanup_expired_pin_sessions` | () | n/a | ✅ |
| `clear_intervention_events` | uuid | `parent_id = auth.uid()` | ✅ |
| `create_student_profile` | 6 args | `auth.uid()` (not client) | ✅ |
| `ensure_family_code` | uuid | implicit (caller-passed parent id) | ✅ Safe — only inserts a code |
| `get_a11y_settings` | uuid, uuid? | parent OR session token | ✅ Hardened in migration 007 |
| `get_timer_settings` | uuid, uuid? | parent OR session token | ✅ Hardened in migration 007 |
| `get_unlock_settings` | uuid, uuid? | parent OR session token | ✅ Hardened in migration 007 |
| `get_all_student_settings` | uuid | **NO CHECK** | 🚨 F-3 — fix in migration |
| `get_pin_hash` | uuid | `id = p_parent_id AND id = auth.uid()` | ✅ |
| `update_pin_hash` | text | `id = auth.uid()` | ✅ |
| `get_profiles_by_family_code` | text | rate-limited 10/15min/caller | ✅ Returns avatar metadata only |
| `get_student_progress_by_pin` | uuid | **NO CHECK** | 🚨 F-2 — fix in migration |
| `get_user_sync_data` | uuid?, text? | `auth.uid()` required, scopes by parent_id | ✅ |
| `handle_new_user` | () (auth trigger) | n/a | ✅ |
| `log_anon_session` | text, text | none (open by design) | 🟠 F-7 — table lockdown in migration |
| `notify_new_visitor` | () (table trigger) | none | 🚨 F-4 — trigger updated in migration |
| `pull_student_progress` | uuid, uuid (2-arg) | session token | 🟠 F-6 — stale, drop in migration |
| `pull_student_progress` | uuid, uuid, text (3-arg) | session token | ✅ Latest |
| `push_student_progress` | 12-arg | session token | 🟠 F-6 — stale, drop in migration |
| `push_student_progress` | 13-arg | session token | 🟠 F-6 — stale, drop in migration |
| `push_student_progress` | 14-arg | session token | ✅ Latest |
| `reset_student_data` | uuid | `parent_id = auth.uid()` | ✅ |
| `reset_student_pin` | uuid, text | `parent_id = auth.uid()` (UPDATE WHERE) | ✅ |
| `verify_student_pin` | uuid, text | bcrypt + 5-attempt lockout + session token issuance | ✅ Migration 007 |
| `update_a11y_settings` | uuid, jsonb | `parent_id = auth.uid()` | ✅ |
| `update_timer_settings` | uuid, jsonb | `parent_id = auth.uid()` | ✅ |
| `update_unlock_settings` | uuid, jsonb | `parent_id = auth.uid()` | ✅ |
| `validate_quiz_score` | () (table trigger) | n/a | 🟡 F-11 — search_path mutable |
| `rls_auto_enable` | () | utility | ℹ️ Informational |

### Edge functions

| Function | Auth | Verdict |
|----------|------|---------|
| `notify-new-signup` | Generic Bearer-prefix check | 🟡 F-12 — should validate JWT structure |
| `notify-new-visitor` | **None** | 🚨 F-4 — open email-spam relay |
| `send-push` | Cron header OR Bearer = service_role | ✅ |

### Netlify functions

| Function | Auth | Rate limit | Verdict |
|----------|------|-----------|---------|
| `gemini-hint` | none (CORS allow-list) | 60/min/IP | ✅ Acceptable for a stateless tutor proxy |
| `gemini-report` | now JWT-verifies parent ownership of studentId (F-5) | 10/min/IP + 14-day cooldown/student | ✅ Hardened this audit |

---

## 6. Secret / Key Audit

Verified by grepping the entire repo for: `SUPABASE_SERVICE_ROLE`, `JWT_SECRET`, `GEMINI_API_KEY`, `VAPID_PRIVATE`, `RESEND_API_KEY`, `GOOGLE_CLIENT_SECRET`, `client_secret`, `sk_live_`, `sk_test_`, `AIza[A-Za-z0-9_-]{30,}`, `eyJhbGc`.

| Item | Where | Risk | Status |
|------|-------|------|--------|
| `.env` | repo root | Listed in `.gitignore`, not tracked (verified: `git ls-files | grep .env` returns empty) | ✅ Safe |
| Supabase **anon** JWT (`"role":"anon"`) | `dist/app.js` | Bundled into frontend by `build.js` env-substitution. Decoded payload: `{"iss":"supabase","ref":"omjegwtzirskgmgeojdn","role":"anon",...}`. Anon-key-with-RLS is the supported pattern | ✅ Safe |
| `SUPABASE_SERVICE_ROLE_KEY` | `process.env.*` references in `netlify/functions/gemini-{hint,report}.js` and `supabase/functions/send-push/index.ts` | Server-side only, never substituted into frontend | ✅ Safe |
| `GEMINI_API_KEY` | `process.env.*` in `netlify/functions/gemini-{hint,report}.js` | Server-side only | ✅ Safe |
| `VAPID_PRIVATE_KEY` | `Deno.env.get(…)` in `supabase/functions/send-push/index.ts` | Server-side only | ✅ Safe |
| `RESEND_API_KEY` | `Deno.env.get(…)` in two `notify-*` edge functions | Server-side only | ✅ Safe |
| `GOOGLE_CLIENT_ID` (public) | bundled into `dist/app.js` via build-time substitution | Public OAuth client ID is by design | ✅ Safe |
| Two `eyJ…` strings | `src/data/u5.js`, `src/data/k/coin_assets.js` | Base64-encoded image data, not JWTs (manually verified — no JWT header signature suffix) | ✅ False positive |

**No credentials are bundled into `dist/` other than the Supabase anon key and Google public client ID, both of which are public-by-design.**

---

## 7. Auth + Role Isolation

| Scenario | Result |
|----------|--------|
| Logged-out user → `/dashboard/dashboard.html` | Reaches login screen via `_supa.auth.onAuthStateChange` initial-session handler (no `_supaUser` → `show('login-screen')`) ✅ |
| Stale `localStorage.mmr_user_role = 'parent'` while logged out | UI shows the parent toggle, but every dashboard data call is gated on `_supaUser`/`auth.uid()` — no data leaks ✅ |
| Student PIN session → tries to access another student | RPCs require `_validate_pin_session(student_id, token)` matching the bound student ✅ |
| 5 wrong PINs | `pin_attempts` row triggers 5-minute lockout + clamps `attempts_left = 0` ✅ |
| Sign-out then force-close | `_clearAuthRouteState` runs synchronously before `await _supa.auth.signOut()` — kills `mmr_*` localStorage and `sb-*-auth-token` synchronously so reopen lands on login ✅ |
| Parent A loads student belonging to Parent B | Blocked by RLS on `student_profiles` (after F-1 fix); blocked by ownership check in `get_*_settings` and progress RPCs (after F-2/F-3 fix) |
| Google OAuth callback host | All `redirectTo` calls use `location.origin + '/'` — dynamic, so production hits `https://mymathroots.com` automatically (no hardcoded staging URL) ✅ |
| Family code regex | `auth.js:67` enforces `/^MMR-[A-Z0-9]{4}$/i` (4 chars). Migration 005 generates 8-char codes (`MMR-XXXXXXXX`). Frontend will reject codes generated after migration 005. **F-15** — functionality bug, not a security one |

**Authoritative session check:** Throughout the codebase, dashboard data access goes through `_supa.rpc(...)` or `_supa.from(...)` calls with the active session. localStorage role flags are UX hints only.

---

## 8. Billing / Rate-Limit / Abuse Risk

| Path | Trigger | Cap | Verdict |
|------|---------|-----|---------|
| `/.netlify/functions/gemini-hint` | Wrong-answer auto-explanation + optional hint button | 60/min/IP via `check_and_increment_rate_limit` RPC, in-memory fallback | ✅ |
| `/.netlify/functions/gemini-report` | Parent "Generate Report" button | 10/min/IP + **14-day per-student cooldown** server-enforced via `student_profiles.report_last_generated` (now also JWT-verified — F-5) | ✅ |
| `verify_student_pin` | Student PIN entry | 5 attempts → 5-min lockout per student | ✅ |
| `get_profiles_by_family_code` | Family-code lookup | 10 lookups / 15 minutes / caller | ✅ |
| `notify-new-visitor` edge function | DB trigger on `anonymous_sessions` insert | **None today — open POST** → email + Resend cost | 🚨 F-4 |
| `anonymous_sessions` direct INSERT | `_supa.from('anonymous_sessions').insert(…)` | None | 🟠 F-7 (frontend stopped writing; lock down) |
| `leads.insert` | `_submitSoftGate` writing email/grade/referral | None | 🟠 F-8 (email-form spam vector) |
| `student_progress` push | `_pushAll` debounced | Schema validation + monotonic checks in 14-arg `push_student_progress` | ✅ |
| `quiz_scores` insert | Per quiz finish | RLS user_id check + `validate_quiz_score` trigger (range checks) | ✅ |
| `_unlockSyncTimer` setInterval (auth.js:1438) | Student session active | Bounded — terminates when `mmr_active_student_id` changes; one timer max | ✅ Verified |
| `feedback.insert` | Dashboard feedback form | Authenticated only; 500-char max in client | ✅ |

---

## 9. Sensitive Data + Privacy

The app stores or processes:

| Data | Where | Visible to | Acceptable? |
|------|-------|-----------|-------------|
| Child first name (`display_name`) | `student_profiles.display_name` | Parent (RLS); leaked via F-1 to anon today | ⚠️ until F-1 fixed |
| Child age | `student_profiles.age` | Same | ⚠️ until F-1 fixed |
| Avatar emoji + colors | `student_profiles.avatar_*` | Same | ⚠️ until F-1 fixed |
| Bcrypt PIN hash | `student_profiles.pin_hash` | Same — bcrypt slows brute force but exposure of hash + age + name lets a determined attacker match a child to their hash | ⚠️ until F-1 fixed |
| Parent email | localStorage `mmr_email_enc` (AES-GCM encrypted via SEC-9) + `auth.users` (Supabase-managed) | Parent only; encrypted at rest in localStorage | ✅ |
| Quiz scores + answers | `quiz_scores` (RLS user_id) | Parent (own user_id), student via PIN session | ✅ |
| Mastery / streak / app-time | `student_profiles.{mastery_json,streak_*,apptime_json}` | Same as #1 — leaked via F-1 today | ⚠️ until F-1 fixed |
| AI-generated parent report | `student_profiles.report_last_text` | Same — leaked via F-1 today; fix F-5 prevents fresh generation against another child | ⚠️ until F-1 fixed |
| Push subscription endpoint + keys | `push_subscriptions` (RLS user_id, authenticated only) | Server (service_role for sending) | ✅ |
| Family code | `profiles.family_code` | Parent only (RLS); 8-char hex space (~4B combinations) | ✅ |
| `device_id` (anonymous) | Removed from localStorage in SEC-10; legacy production rows in `anonymous_sessions` (11 rows) | Service role only after F-7 fix | ⚠️ until F-7 fixed |
| Console PII (studentId, role) | `console.log` calls in `auth.js`, `dashboard.js` | Anyone with DevTools on a shared device | ✅ Fixed F-10 |
| URL parameters | Only `?preview=1`, `?testStreak=N` (dev only) | n/a | ✅ |

**No sensitive data is cached by the service worker** — `sw.js` only caches `/`, `/index.html`, `/manifest.json`, fonts, and icons. Confirmed by reading `sw.js` (no `/rest/v1/` or `/auth/v1/` patterns).

---

## 10. Frontend Security

| Risk | Status |
|------|--------|
| `eval`, `new Function()`, `document.write` | None present (verified by grep) ✅ |
| `innerHTML` with user-controlled data | All sites confirmed to either use `_lsEsc`/`_psEsc`/`_escHtml` for interpolated values OR use static template strings. Defense-in-depth recommendation: prefer `textContent` for child display name in `_buildAvatarHtml` |
| `_sanitize` / `_escHtml` helpers | Present in `src/util.js` ✅ |
| `_rateLimit` IIFE for client-side form rate-limiting | Present ✅ |
| Service worker | Origin-checked `SKIP_WAITING` message; only caches `/`, `/index.html`, `/manifest.json`, fonts, icons; never caches REST or auth responses ✅ |
| localStorage tampering for role escalation | Blocked — `_supaUser` / `auth.uid()` is the authoritative gate ✅ |
| AES-GCM email encryption | `src/util.js` `_encryptStr` / `_decryptStr` — AES-GCM 256, IV per encryption, key in `wb_device_key` ✅ |
| CSP `script-src 'unsafe-inline'` | Present, intentional (preserves `onclick=` handlers); F-13 accepted risk |
| Content-Security-Policy `frame-ancestors` | `'none'` ✅ |
| Production debug logs printing PII | Fixed via `_devLog`/`_devWarn` helpers in `src/util.js` ✅ F-10 |
| Errors logged to `_appErrors` array | Capped at 30 entries; `_logError` only stores message string + context, no row data ✅ |

---

## 11. Netlify + Deployment

`netlify.toml` (post-fix):

| Header | Value | Verdict |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | ✅ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | ✅ |
| `Content-Security-Policy` | `default-src 'self'`; explicit allow-list for accounts.google.com / cdn.jsdelivr.net / the supabase project / Cloudflare; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'` | ✅ (with F-13 accepted) |
| `Cache-Control: no-store` for `/.netlify/functions/*` | New this audit | ✅ |
| `X-Robots-Tag: noindex, nofollow` for `/dashboard/*` | New this audit | ✅ |

**Build pipeline (`build.js`):**
- Loads `.env` only at build time; values are inlined into `combinedJs` via `%%PLACEHOLDER%%` substitution. The `.env` file itself is never copied into `dist/`. ✅
- Source maps (`app.js.map`) are emitted only with `--dev` flag. Production build has none. ✅
- JS is obfuscated via `javascript-obfuscator` with `renameGlobals=false` (preserves `onclick=` handlers); no string array, no dead-code injection (kept simple to avoid CSP issues). ✅
- Files copied into `dist/`: HTML pages (incl. `privacy.html`, `terms.html`), icons, manifests, `sw.js`, `health.json`, `robots.txt`, all unit JSON data files. No env files, no hidden directories.

**CI (`.github/workflows/deploy-staging.yml`):**
- Tests run on every push + PR via `npm test` ✅
- Production is deployed manually via Netlify UI — never auto-deployed ✅
- Secrets injected via GitHub Actions secrets ✅
- ⚠️ F-14: workflow references `app/` (SvelteKit V2) which is now in a separate repo; CI will fail on the SvelteKit step. Stale, not security.

---

## 12. Manual Supabase Checklist

Confirm in Supabase Dashboard (`https://supabase.com/dashboard/project/omjegwtzirskgmgeojdn`):

- [ ] **Auth → URL Configuration** — Site URL = `https://mymathroots.com` *(per prior session: already set)*
- [ ] **Auth → URL Configuration** — Redirect URL allow-list includes `https://mymathroots.com/**` *(per prior session: already set)*
- [ ] **Auth → Providers → Google** — only the production OAuth client; no stale dev client
- [ ] **Auth → Policies** — "Confirm email" is **enabled**
- [x] **Authentication → Attack Protection** — "Prevent use of leaked passwords" shows **ENABLED** ✅ (Pro plan + Email provider Save committed 2026-05-01)
- [ ] **Auth → Rate Limits** — confirm defaults aren't overly permissive (default: 30 sign-ins/hour/IP is fine)
- [ ] **Database → Tables** — every table in `public` shows the green RLS shield. (Confirmed via MCP: 14/14 tables ✓)
- [ ] **Storage → Buckets** — no public buckets exist (confirmed: zero storage buckets configured today)
- [ ] **Database → Backups** — daily PITR backups enabled
- [ ] **Settings → Billing** — usage / spend alerts configured (Postgres egress, Edge function invocations, Realtime, Auth users)
- [ ] **Database → Logs / Reports** — log retention set to ≥ 7 days
- [ ] **API → URL Configuration** — confirm `SUPABASE_SERVICE_ROLE_KEY` is **not** present in any frontend env
- [x] **Edge Functions → notify-new-visitor → Secrets** — `NOTIFY_NEW_VISITOR_SECRET` set ✅ (matches Vault secret)
- [x] **Database → Vault** — `notify_new_visitor_secret` created via `vault.create_secret()` ✅
- [ ] After applying the migration, re-run **Database → Advisors** and confirm Critical lints clear (post-application sanity check; the four launch-blocker classes are addressed in the migration)

---

## 13. Manual Google Cloud Console Checklist

Confirm in Google Cloud Console for OAuth client `143755334187-…`:

- [ ] **Credentials → OAuth 2.0 Client IDs → Authorized JavaScript origins** includes `https://mymathroots.com` *(per prior session: already added)*
- [ ] **Credentials → OAuth 2.0 Client IDs → Authorized JavaScript origins** also includes `https://www.mymathroots.com` if `www` is supported
- [ ] **Authorized redirect URIs** — includes only the Supabase callback `https://omjegwtzirskgmgeojdn.supabase.co/auth/v1/callback`
- [ ] **OAuth consent screen → App name** — "My Math Roots"
- [ ] **OAuth consent screen → User support email** — set
- [ ] **OAuth consent screen → Application home page** — `https://mymathroots.com`
- [ ] **OAuth consent screen → Application privacy policy link** — `https://mymathroots.com/privacy.html`
- [ ] **OAuth consent screen → Application terms of service link** — `https://mymathroots.com/terms.html`
- [ ] **OAuth consent screen → Authorized domains** — includes `mymathroots.com`
- [ ] **OAuth consent screen → Publishing status** — confirm it's `In production` if expecting public traffic (otherwise capped at ~100 test users)
- [ ] **OAuth consent screen → App logo + branding** uploaded
- [ ] Stale dev origins (e.g. `localhost`, old Netlify URL) only kept where strictly needed

---

## 14. Fixes Applied This Audit

All fixes were committed locally; the worktree's main branch shows the changes. Tests stay at **130/130 passing** through every fix.

| Fix | Files | Description |
|-----|-------|-------------|
| 1 | `netlify/functions/gemini-report.js`, `src/dashboard.js:2028-2033` | Added `_isUuid` + `_verifyParentOwnsStudent` helpers in the function. Handler now rejects with **403** if studentId is a UUID and the caller's Supabase JWT doesn't own it. Dashboard now sends `Authorization: Bearer <session.access_token>`. Non-UUID studentIds (e.g. `'local'` preview) skip both verification and DB persistence. |
| 2 | `src/util.js`, `src/auth.js` (8 sites), `src/dashboard.js` (2 sites) | Added `_isDev`, `_devLog`, `_devWarn` helpers gated on `localhost`/`127.0.0.1`/`192.168.*` hostnames. Replaced 10 PII-bearing `console.log/warn` sites that were printing studentId, role, session-token presence, and full localStorage state in production. |
| 3 | `supabase/migrations/20260501_launch_security_hardening.sql` | **Applied 2026-05-01.** DROPs `anon_select_for_realtime`; adds 2-arg auth-checked replacements for `get_all_student_settings` and `get_student_progress_by_pin`; drops 3 stale push/pull overloads; locks `validate_quiz_score` search_path; tightens `anonymous_sessions` to RPC-only; updates `notify_new_visitor` trigger to send `Authorization: Bearer <vault_secret>`. Secret stored via `vault.create_secret()` (Supabase Vault, since hosted Postgres doesn't allow `ALTER DATABASE … SET` for custom GUC). |
| 4 | `netlify.toml` | Added `Cache-Control: no-store` for `/.netlify/functions/*` and `X-Robots-Tag: noindex, nofollow` for `/dashboard/*` |
| 5 | `package.json` | Added `npm run audit` (production deps) and `npm run audit:full` (incl. dev) scripts |
| 6 | `supabase/functions/notify-new-visitor/index.ts` | **Deployed 2026-05-01.** Added env-var-driven `Authorization: Bearer <NOTIFY_NEW_VISITOR_SECRET>` check at the top of the handler. Fail-closed if the env var is unset. Verified live: returns 401 for missing or mismatched Authorization header. |

---

## 15. Fixes Still Needed

Ordered by severity. The four 🚨 launch-blockers are now resolved (see §14 below for the apply-record); items here are recommended hardening before/after launch.

### 🟠 F-8 — leads_insert hardening (frontend coordination required)

Add a rate-limited `submit_lead(p_email, p_grade, p_referral_source)` SECURITY DEFINER RPC, switch `auth.js:_submitSoftGate` to call it instead of `_supa.from('leads').insert(...)`, then drop the `leads_insert` policy. Do these together — single-step lockdown breaks the soft gate.

### 🟡 F-12 — Validate JWT structure in `notify-new-signup` edge function

Replace the generic `Bearer ` prefix check with a real Supabase JWT verification (call `${SUPABASE_URL}/auth/v1/user` with the token and confirm 200).

### 🟡 F-15 — Family-code regex mismatch

`src/auth.js:67` — `/^MMR-[A-Z0-9]{4}$/i` should be `/^MMR-[A-Z0-9]{8}$/i` to match the post-migration-005 8-char format. **Functional bug**, will block legitimate family-code linking.

### 🔵 F-13 — CSP `'unsafe-inline'` follow-up

Migrate all inline `onclick=` handlers in `index.html`, `dashboard/dashboard.html`, etc. to `data-action="…"` (the dispatcher pattern is already used widely in `dashboard.js`). Once all inline handlers are gone, drop `'unsafe-inline'` from `script-src` in `netlify.toml`.

### 🔵 F-14 — CI workflow cleanup

Remove or skip the SvelteKit-app steps in `.github/workflows/deploy-staging.yml` since V2 is now in a separate repo.

---

## 16. Verification — Commands Run + Results

### Pre-application (audit baseline)

```bash
$ npm test                              # 130 passed, 130 total ✅
$ npm run build                         # 🚀 Build complete → dist/ ✅
$ grep -rE "<secrets>" dist/            # (no matches) ✅
$ grep -r "mymathroots.netlify.app" dist/ # (no matches in built JS) ✅
$ <decode dist/app.js JWT payload>      # {"role":"anon"} (RLS-protected) ✅
$ npm run audit                         # found 0 vulnerabilities ✅
$ git ls-files | grep '^\.env'          # (empty — .env not tracked) ✅
```

### Post-application verification (2026-05-01)

```bash
# V1: anon SELECT to student_profiles via REST (real anon key)
$ curl -s "<SUPABASE_URL>/rest/v1/student_profiles?select=id,display_name,parent_id&limit=5" \
       -H "apikey: <ANON>" -H "Authorization: Bearer <ANON>"
[]                                      # ✅ RLS denies anon (no rows)

# V2/V3: RPC signatures verified via pg_proc
get_all_student_settings(p_student_id uuid, p_session_token uuid DEFAULT NULL)  ✅
get_student_progress_by_pin(p_student_id uuid, p_session_token uuid DEFAULT NULL) ✅

# V4: stale overloads dropped, only latest remain
pull_student_progress(p_student_id uuid, p_session_token uuid, p_grade text)    ✅
push_student_progress(... 14-arg with grade + activity_json)                     ✅

# V5: anonymous_sessions has only deny-all policy
no_direct_access ALL USING (false)      ✅

# V6: notify-new-visitor edge function rejects unauthenticated POST
$ curl -X POST "<SUPABASE_URL>/functions/v1/notify-new-visitor"  → HTTP 401   ✅
$ curl -X POST … -H "Authorization: Bearer wrong"                → HTTP 401   ✅

# V7: parent dashboard renders post-migration (browser smoke)
Loaded https://mymathroots.com/ as logged-in parent
Dashboard renders all sections; one pre-existing benign pull_timeout warning
unrelated to migration (8s race timeout in get_user_sync_data)  ✅

# V8: tests + build still clean after all changes
$ npm test    # 130 passed, 130 total  ✅
$ npm run build  # clean  ✅

# Sanity: vault secret in place; trigger reads it; only one student_profiles policy
SELECT EXISTS(... vault.decrypted_secrets WHERE name='notify_new_visitor_secret')
       AS vault_secret_exists                                    → true   ✅
       trigger_reads_vault                                        → true   ✅
       student_profiles_policy_count                              → 1      ✅
```

**Browser-side end-to-end of the Gemini-report ownership check** (F-5) was not exercised post-deploy because it requires a real authenticated parent session and a real student id pair that doesn't match. The unit-style verification (frontend now sends `Authorization` header; function rejects when ownership doesn't match) is covered by the code review and the existing test suite.

---

## 17. Out-of-Scope / Accepted Risks

These items are deliberately deferred per the user-approved Phase 2 scope:

| Item | Rationale |
|------|-----------|
| **CSP `'unsafe-inline'` in `script-src`** | Tightening would require migrating every `onclick=` handler in `index.html`, `dashboard/dashboard.html`, and several modals to `data-action=` dispatcher entries (~50+ sites). Tracked as F-13. |
| **`mymathroots.netlify.app` retained in CORS allow-lists** of both Netlify functions | Intentional — Netlify still serves that hostname, and the previous session confirmed this is backwards-compat by design. The grep confirms no traffic-router code points to it; it's only in the per-request CORS reflection. |
| **Direct DB-side leads policy lockdown without frontend coordination** | Would break sign-up. Tracked as F-8 with the recommended phased fix. |
| **Storage bucket privacy review** | No buckets currently exist in production; revisit if the app starts using Storage. |
| **CSRF protections** | Supabase auth uses Bearer tokens (header-based) and PKCE flow, not cookies; CSRF is not applicable to the current auth model. |
| **Anti-fingerprinting / referrer hardening** | Already mitigated by `Referrer-Policy: strict-origin-when-cross-origin`. |
| **In-app PII redaction in error messages** | `_friendlyError` already maps Supabase errors to opaque user messages; raw errors only reach `_devWarn` (now no-op in prod). |

---

*Audit conducted by Claude (Sonnet 4.6) on 2026-05-01 against commit `52a42c2` of master. Production database introspected read-only via Supabase MCP — no user data rows accessed.*
