# Implementation Plan: Security Sprint 2 (SEC-8, SEC-9, SEC-10)

## Context

My Math Roots is a COPPA-regulated K–5 math PWA. Three vulnerabilities were identified and fixed:

- **SEC-8:** Soft Gate had no parental consent checkbox or Privacy Policy link (COPPA gap)
- **SEC-9:** Parent emails stored as plain text in localStorage
- **SEC-10:** `wb_device_id` persistence — **pre-resolved**, regression test added

**Design spec:** `docs/superpowers/specs/2026-03-30-security-sprint-2-design.md`

---

## Steps (Completed)

### Step 1 — Create `privacy.html` ✅
Created `privacy.html` in repo root (alongside `index.html`). COPPA-required disclosures:
- What data is collected (email, grade, progress)
- Why it's collected
- Data deletion rights and contact email (placeholder)
- Third-party services listed
No build step needed — served directly by Netlify.

### Step 2+4 — Write failing tests ✅
Created `tests/security.test.js` with 20 tests:
- SEC-8: 5 consent validation tests
- SEC-9: 11 AES-GCM round-trip and storage tests
- SEC-10: 4 regression tests for `wb_device_id` removal
Run: `node --test tests/security.test.js`

### Step 3 — Implement SEC-8 consent checkbox ✅
Files changed: `src/auth.js`
- `_showSoftGate()`: Added `#sg-consent` checkbox + Privacy Policy link between referral select and submit button
- `_submitSoftGate()`: Added consent validation — if unchecked, highlights label border red and returns

### Step 5 — Implement AES-GCM crypto helpers ✅
File changed: `src/util.js` (appended to end of file)
- `_getDeviceKey()` — generates/retrieves 256-bit AES-GCM key stored as hex under `wb_device_key`
- `_encryptStr(str)` — AES-GCM encrypt → `{ iv: hex, data: hex }`
- `_decryptStr(obj)` — AES-GCM decrypt → `string | null`
- `_migrateEmailStorage()` — one-time boot migration for legacy plain-text keys

### Step 6 — Wire up Remember Me encryption ✅
Files changed: `src/auth.js`, `src/nav.js`
- `auth.js:_lsSubmit()`: Remember Me write now calls `_encryptStr(email)` → `mmr_email_enc`
- `nav.js:show()`: Remember Me read now calls `_decryptStr(JSON.parse(...))` async → pre-fills email field

### Step 7 — Wire up Soft Gate + boot migration ✅
Files changed: `src/auth.js`, `src/boot.js`
- `auth.js:_submitSoftGate()`: Encrypts email before writing to `wb_lead` JSON (key: `emailEnc`)
- `boot.js`: Added `_migrateEmailStorage().catch(()=>{})` after `supabaseInit()` call
- `boot.js:_APP_GLOBALS`: Added `_getDeviceKey`, `_encryptStr`, `_decryptStr`, `_migrateEmailStorage`

### Step 8 — All tests GREEN ✅
`node --test tests/security.test.js tests/core.test.js` → **82/82 pass**

### Step 9 — Write docs ✅
- `docs/superpowers/specs/2026-03-30-security-sprint-2-design.md` — design spec
- `docs/plans/security_sprint_2.md` — this file

### Step 10 — Build and deploy
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist --site=d7bda627-be6f-4588-bc38-33a26e39bb85
```

---

## Verification Checklist

- [ ] SEC-8: Soft Gate submit blocked when consent unchecked; label border turns red
- [ ] SEC-8: Soft Gate submit proceeds when consent checked + valid email
- [ ] SEC-8: Privacy Policy link opens `/privacy.html` in new tab
- [ ] SEC-9: After Remember Me login, `mmr_email` absent from DevTools Local Storage
- [ ] SEC-9: `mmr_email_enc` present with `{iv, data}` JSON (not plain email)
- [ ] SEC-9: Reload app → login email field pre-fills correctly
- [ ] SEC-10: After sign-out, `wb_device_id` absent from Local Storage
- [ ] Automated: `node --test tests/security.test.js tests/core.test.js` → 82 pass
- [ ] Build: `npm run build` succeeds

---

## Key Implementation Notes

- `wb_device_key` and `mmr_email_enc` intentionally survive logout (Remember Me persists)
- `crypto.subtle` fallback in `_submitSoftGate`: stores grade/referral/date without email if encryption fails
- Privacy Policy placeholder emails (`[privacy@mymathroots.app]`) must be replaced before launch
- Supabase `leads` table insert still uses in-memory plain email — only localStorage is encrypted
