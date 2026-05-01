# Supabase Custom Domain (auth.mymathroots.com) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible Supabase project URL (`omjegwtzirskgmgeojdn.supabase.co`) with the branded custom domain `auth.mymathroots.com` so that Google's OAuth consent screen shows a trustworthy URL, without breaking any existing login or API functionality.

**Architecture:** The custom domain is a CNAME at the DNS level — Supabase keeps the old project URL permanently active, so old URLs never break. The code changes are additive (CSP gains a new allowed origin) and the env var swap is a single Netlify redeploy. All work follows a pre-flight → activate → switch order so there is zero downtime.

**Tech Stack:** Supabase (custom domains, paid feature), Google Cloud Console (OAuth redirect URIs), DNS registrar (CNAME + TXT records), Netlify (build env vars, CSP header in `netlify.toml`), Vanilla JS build (env placeholder replacement via `build.js`)

---

## Audit — What Changes and What Does Not

### Files that WILL change

| File | What changes |
|------|-------------|
| `netlify.toml` | CSP `connect-src` gains `https://auth.mymathroots.com` and `wss://auth.mymathroots.com` |
| `.env` (local dev) | `SUPA_URL=https://auth.mymathroots.com` |
| Netlify dashboard env | `SUPA_URL` build var → `https://auth.mymathroots.com` |

### What does NOT change

| Item | Reason |
|------|--------|
| `src/auth.js` source | Uses `%%SUPA_URL%%` placeholder — no hardcoding to change |
| `dashboard/dashboard.js` source | Same placeholder pattern |
| `netlify/functions/gemini-report.js` CORS allow-list | Lists app origins (`mymathroots.com`), not Supabase origins |
| `netlify/functions/gemini-hint.js` CORS allow-list | Same reason |
| Supabase Edge Functions (`send-push`, `notify-*`) | Supabase auto-injects `SUPABASE_URL` internally; old URL stays active |
| Supabase Auth Site URL / Redirect URLs | These are the app's domain (`mymathroots.com`), not Supabase's |
| `SUPABASE_URL` Netlify runtime env var | Old URL keeps working; defer until confirmed stable |

### Supabase URL touch-points in the codebase (for reference)

- `src/auth.js:4` — `const SUPA_URL = '%%SUPA_URL%%';` (replaced at build by `build.js:103`)
- `dashboard/dashboard.js:2246` — `var _SUPA_URL = '%%SUPA_URL%%';` (same pattern)
- `netlify.toml:25-26` — hardcoded in CSP `connect-src`
- `.env:1` — `SUPA_URL=https://omjegwtzirskgmgeojdn.supabase.co` (local dev only)
- Netlify dashboard: `SUPA_URL` (build-time) and `SUPABASE_URL` (runtime for Netlify functions)

---

## Task 1: Pre-flight — Add new Google OAuth redirect URI

> **Do this first.** Adding the URI before activation ensures Google accepts the new callback the moment Supabase starts using it. It is purely additive — the old URI keeps working.

**Files:** None (Google Cloud Console only)

- [ ] **Step 1: Open Google Cloud Console**

  Navigate to: `https://console.cloud.google.com/apis/credentials`

  Sign in with the account that owns the My Math Roots OAuth client.

- [ ] **Step 2: Open the OAuth 2.0 Client**

  Click the OAuth 2.0 Client ID named for My Math Roots (the one with Client ID `143755334187-cgqpo91oubridh9k8bqobrpaocs6gth0.apps.googleusercontent.com`).

- [ ] **Step 3: Add the new redirect URI**

  Under **Authorized redirect URIs**, click **ADD URI**.

  Type exactly:
  ```
  https://auth.mymathroots.com/auth/v1/callback
  ```

  Do **not** remove the existing URI:
  ```
  https://omjegwtzirskgmgeojdn.supabase.co/auth/v1/callback
  ```

- [ ] **Step 4: Save**

  Click **SAVE**. Google may take a few minutes to propagate.

- [ ] **Step 5: Verify**

  Reload the credentials page and confirm both URIs appear in the Authorized redirect URIs list.

---

## Task 2: Configure the Supabase custom domain

**Files:** None (Supabase dashboard only)

- [ ] **Step 1: Open the Supabase dashboard**

  Navigate to: `https://supabase.com/dashboard/project/omjegwtzirskgmgeojdn`

- [ ] **Step 2: Go to Custom Domains settings**

  `Project Settings → General → Custom Domains`

  (If you don't see "Custom Domains", confirm you're on the Pro plan — it's a paid add-on.)

- [ ] **Step 3: Enter the custom domain**

  In the "Custom Domain" field, enter:
  ```
  auth.mymathroots.com
  ```

  Click **Add**. Supabase will display the DNS records you need to create.

- [ ] **Step 4: Record the required DNS values**

  Supabase will show something like:

  | Type | Name | Value |
  |------|------|-------|
  | `CNAME` | `auth` | `omjegwtzirskgmgeojdn.supabase.co` |
  | `TXT` | `_cf-custom-hostname.auth` | `<uuid Supabase shows>` |

  Copy these values exactly — they vary per project.

---

## Task 3: Add DNS records at your domain registrar

**Files:** None (DNS registrar control panel — wherever mymathroots.com DNS is managed)

- [ ] **Step 1: Open your DNS provider**

  Log into the control panel for the registrar or DNS host managing `mymathroots.com`.

- [ ] **Step 2: Add the CNAME record**

  | Field | Value |
  |-------|-------|
  | Type | `CNAME` |
  | Name / Host | `auth` |
  | Target / Value | `omjegwtzirskgmgeojdn.supabase.co` |
  | TTL | 300 (or lowest available) |

  This maps `auth.mymathroots.com` → your Supabase project.

- [ ] **Step 3: Add the TXT verification record**

  | Field | Value |
  |-------|-------|
  | Type | `TXT` |
  | Name / Host | `_cf-custom-hostname.auth` |
  | Value | `<UUID shown in Supabase dashboard>` |
  | TTL | 300 |

  This allows Supabase to verify ownership and provision the SSL certificate.

- [ ] **Step 4: Save changes**

  Click Save / Apply in your DNS provider.

- [ ] **Step 5: Verify DNS propagation**

  Run in terminal:
  ```bash
  nslookup auth.mymathroots.com
  ```

  Expected: resolves to `omjegwtzirskgmgeojdn.supabase.co` (or shows as a CNAME to it).

  If not resolved yet, wait 5–30 minutes and retry. Low TTL helps.

---

## Task 4: Confirm Supabase activates the custom domain

**Files:** None

DNS propagation can take minutes to hours. Supabase must verify the DNS record and provision an SSL certificate before the domain is live.

- [ ] **Step 1: Return to Supabase Custom Domains page**

  `Project Settings → General → Custom Domains`

- [ ] **Step 2: Click "Verify" or "Activate"**

  Supabase shows a Verify button once it's ready to check your DNS. Click it.

- [ ] **Step 3: Confirm status shows "Active"**

  The status indicator should change to **Active** (green). If it shows an error:
  - DNS has not propagated yet — wait and retry
  - The TXT record value was entered incorrectly — double-check character for character

- [ ] **Step 4: Smoke-test the custom domain directly**

  In a browser, open:
  ```
  https://auth.mymathroots.com/auth/v1/health
  ```

  Expected response: `{"status":"ok"}` (Supabase health endpoint)

  A valid JSON response confirms SSL is working and the domain is routing to Supabase.

  > **Do not proceed to Task 5 until this step passes.** The code change in Task 5 requires the domain to be live before the next deploy goes out.

---

## Task 5: Update CSP and build env var — code change

**Files:**
- Modify: `netlify.toml` — CSP `connect-src` block (lines 24–28)
- Modify: `.env` — local dev `SUPA_URL`

- [ ] **Step 1: Add `auth.mymathroots.com` to CSP in netlify.toml**

  The current `connect-src` block (lines 23–28) reads:
  ```toml
  connect-src 'self'
    https://omjegwtzirskgmgeojdn.supabase.co
    wss://omjegwtzirskgmgeojdn.supabase.co
    https://accounts.google.com
    https://cdn.jsdelivr.net;
  ```

  Change it to (add the custom domain lines, keep the old ones during transition):
  ```toml
  connect-src 'self'
    https://omjegwtzirskgmgeojdn.supabase.co
    wss://omjegwtzirskgmgeojdn.supabase.co
    https://auth.mymathroots.com
    wss://auth.mymathroots.com
    https://accounts.google.com
    https://cdn.jsdelivr.net;
  ```

  > Keep the old `omjegwtzirskgmgeojdn.supabase.co` entries during the transition. They can be removed in a later cleanup PR once the switch is confirmed stable.

- [ ] **Step 2: Update `.env` for local development**

  In `.env`, change:
  ```
  SUPA_URL=https://omjegwtzirskgmgeojdn.supabase.co
  ```
  to:
  ```
  SUPA_URL=https://auth.mymathroots.com
  ```

- [ ] **Step 3: Run a local build to confirm the placeholder replaces correctly**

  ```bash
  node build.js
  ```

  Expected output: no warnings about `SUPA_URL not set`. No unreplaced `%%SUPA_URL%%` in `dist/`.

  Verify the replacement:
  ```bash
  grep -c "auth.mymathroots.com" dist/app.js
  ```
  Expected: at least 1 match (the injected URL in the Supabase client init).

- [ ] **Step 4: Commit**

  ```bash
  git add netlify.toml .env
  git commit -m "feat(infra): add auth.mymathroots.com to CSP; switch SUPA_URL to custom domain"
  ```

---

## Task 6: Update Netlify build env var

**Files:** None (Netlify dashboard)

This updates the production build so the deployed JS uses the custom domain.

- [ ] **Step 1: Open Netlify dashboard**

  Navigate to: `https://app.netlify.com` → your My Math Roots site → **Site configuration → Environment variables**

- [ ] **Step 2: Update SUPA_URL**

  Find the variable `SUPA_URL`. Click **Edit**.

  Change the value from:
  ```
  https://omjegwtzirskgmgeojdn.supabase.co
  ```
  to:
  ```
  https://auth.mymathroots.com
  ```

  Click **Save**.

- [ ] **Step 3: Trigger a new deploy**

  Go to **Deploys** → click **Trigger deploy → Deploy site**.

  Watch the build log. Confirm:
  - Build completes successfully
  - No `SUPA_URL not set` warning
  - No unreplaced `%%SUPA_URL%%` warning

---

## Task 7: Verify end-to-end after deploy

- [ ] **Step 1: Open the live site**

  Navigate to: `https://mymathroots.com`

- [ ] **Step 2: Open browser DevTools → Console**

  Look for any CSP violation errors:
  ```
  Refused to connect to 'https://auth.mymathroots.com/...' because it violates the following Content Security Policy directive
  ```

  Expected: no CSP errors.

- [ ] **Step 3: Open DevTools → Network**

  Filter by `auth.mymathroots.com`. Trigger a page load.

  Expected: Supabase auth requests (`/auth/v1/user`, etc.) now go to `auth.mymathroots.com`, not `omjegwtzirskgmgeojdn.supabase.co`.

- [ ] **Step 4: Test Google login**

  Click "Sign in with Google". Go through the full consent screen.

  Expected:
  - Google consent screen shows — no errors
  - The callback URL in the address bar during OAuth flow shows `auth.mymathroots.com/auth/v1/callback`
  - Login succeeds and lands back on `mymathroots.com`

- [ ] **Step 5: Test Realtime (WebSocket)**

  If the parent dashboard uses Supabase Realtime subscriptions, open the dashboard and confirm it connects without errors.

  Check DevTools → Network → WS tab for a WebSocket to `wss://auth.mymathroots.com` that stays open.

- [ ] **Step 6: Test the parent AI report flow**

  Go to the parent dashboard → request an AI report. Confirm:
  - The Netlify function (`gemini-report`) responds correctly
  - No auth errors (the JWT it receives from the frontend is still valid)

---

## Task 8: Post-go-live cleanup (deferred, ~1 week after stable)

Once you've confirmed the custom domain is stable in production for at least a week:

- [ ] **Remove old Supabase URL from Google Cloud Console**

  Open Google Cloud Console → OAuth client. Remove:
  ```
  https://omjegwtzirskgmgeojdn.supabase.co/auth/v1/callback
  ```

  Only do this after confirming `auth.mymathroots.com` is the only active callback.

- [ ] **Tighten CSP in netlify.toml**

  Remove the old entries from `connect-src`:
  ```toml
  https://omjegwtzirskgmgeojdn.supabase.co
  wss://omjegwtzirskgmgeojdn.supabase.co
  ```

  Commit:
  ```bash
  git add netlify.toml
  git commit -m "chore(security): remove legacy supabase.co from CSP after custom domain stable"
  ```

- [ ] **Optionally update SUPABASE_URL runtime env var**

  In Netlify dashboard, update `SUPABASE_URL` (used by Netlify functions) from the old URL to `https://auth.mymathroots.com`. This is low-priority — old URL stays active — but keeps configuration consistent.

---

## Rollback Plan

The old Supabase project URL (`omjegwtzirskgmgeojdn.supabase.co`) **never expires** — Supabase guarantees it remains active even after a custom domain is added. Rollback is therefore low-risk at every stage.

| Stage | Rollback action |
|-------|----------------|
| Before Supabase activation | No rollback needed — DNS records can just be deleted |
| After activation, before code deploy | No action — code still uses old URL until deploy |
| After code deploy — login broken | Revert `SUPA_URL` in Netlify dashboard to old URL, trigger redeploy (< 2 min) |
| After code deploy — CSP violation | Same as above, or revert the `netlify.toml` commit |
| Custom domain deleted from Supabase | Auth automatically falls back to `omjegwtzirskgmgeojdn.supabase.co` |

**Do not remove the Google OAuth old redirect URI** until you are fully confident — it's the safest anchor point.

---

## Key ordering constraint

```
Task 1 (Google pre-flight)
  └── Task 2 (Supabase config)
        └── Task 3 (DNS records)
              └── Task 4 (verify Supabase activation) ← GATE
                    └── Task 5 (code: CSP + .env)
                          └── Task 6 (Netlify env var + deploy)
                                └── Task 7 (verify)
                                      └── Task 8 (cleanup, 1 week later)
```

**Task 4 is a hard gate.** Do not run Task 5 or 6 until Supabase reports the custom domain as Active and the health endpoint returns `{"status":"ok"}`.
