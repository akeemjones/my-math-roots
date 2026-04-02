# Security Sprint 2 — Design Spec
**Date:** 2026-03-30
**Vulnerabilities:** SEC-8, SEC-9, SEC-10
**Status:** Implemented

---

## Context

My Math Roots is a COPPA-regulated K–5 math PWA. Three privacy/security vulnerabilities required remediation:

| ID | Severity | Area | Summary |
|----|----------|------|---------|
| SEC-8 | High | COPPA/Consent | Soft Gate collected parent email + child grade without consent checkbox or Privacy Policy link |
| SEC-9 | Medium | Data Privacy | Parent email stored as plain text in localStorage under `mmr_email` and `wb_lead` |
| SEC-10 | Low | Tracking | `wb_device_id` reported as persisting — **pre-resolved** in prior sprint; regression test added |

---

## SEC-8 — COPPA Consent Gate

### Problem
The Soft Gate modal (`src/auth.js:_showSoftGate`) collected a parent email and child grade without:
- A parental consent checkbox
- A Privacy Policy link

This is a COPPA compliance gap: parental consent must be explicitly obtained before collecting PII.

### Solution

**Form changes (`src/auth.js`):**
- Added a required `<input type="checkbox" id="sg-consent">` with label: *"I am a parent or guardian of the child using this app"*
- Added inline Privacy Policy link: *"By continuing, you agree to our [Privacy Policy](./privacy.html)"*
- Added consent validation in `_submitSoftGate()`: submission blocked with visible error if unchecked

**New file: `privacy.html`** (served from repo root alongside `index.html`):
- Standalone page, no build step required
- Contains COPPA-compliant disclosures: what data is collected, why, data deletion rights, contact info
- Placeholder email addresses marked for replacement before launch

### Design Decisions
- Checkbox label uses `id="sg-consent-label"` for error styling (border turns red)
- Consent validation runs after email validation (email error shown first)
- Privacy Policy opens in `target="_blank"` to keep the user in the app flow

---

## SEC-9 — AES-GCM Email Encryption

### Problem
Parent emails were stored as plain text in localStorage:
- `mmr_email` — Remember Me feature (login screen)
- `wb_lead` — Soft Gate lead capture (email + grade + referral + date)

Both keys were visible verbatim in browser DevTools → Application → Local Storage.

### Solution

**New crypto helpers (`src/util.js`):**

```
_getDeviceKey()         → generates/retrieves a random 256-bit AES-GCM CryptoKey
                          stored as hex under localStorage key: wb_device_key
_encryptStr(str)        → AES-GCM encrypt → { iv: hex, data: hex }
_decryptStr({ iv, data }) → AES-GCM decrypt → string | null
_migrateEmailStorage()  → one-time boot migration: plain text → encrypted
```

**Key naming:**
| Old localStorage key | New key | Content |
|---------------------|---------|---------|
| `mmr_email` (plain) | `mmr_email_enc` | `JSON { iv, data }` (AES-GCM) |
| `wb_lead.email` (plain) | `wb_lead.emailEnc` | `{ iv, data }` nested in wb_lead JSON |

**Remember Me write (`src/auth.js:_lsSubmit`):** `_encryptStr(email)` → stored as `mmr_email_enc`

**Remember Me read (`src/nav.js:show`):** `_decryptStr(...)` → async pre-fill of login email field

**Soft Gate storage (`src/auth.js:_submitSoftGate`):** `_encryptStr(email)` → stored as `emailEnc` within `wb_lead`

**Boot migration (`src/boot.js`):** `_migrateEmailStorage()` called once at boot — silently upgrades any legacy plain-text keys

### Design Decisions
- **Device key survives logout** — `wb_device_key` and `mmr_email_enc` are intentionally NOT cleared in `_clearUserData()`. Remember Me should persist across logout/login cycles.
- **Fallback on crypto failure** — if `crypto.subtle` is unavailable (non-HTTPS dev environment), Soft Gate stores lead metadata without email rather than crashing.
- **`wb_lead` still syncs to Supabase with plain email** — the server-side insert uses the in-memory `email` variable (never touches localStorage). Only local storage is encrypted.
- **Migration is idempotent and silent** — safe to call at every boot.

---

## SEC-10 — Device ID Rotation (Pre-Resolved)

### Finding
`wb_device_id` was fully removed from the codebase in a prior sprint for COPPA compliance:
- `src/auth.js:_continueAsGuest()` — removes `wb_device_id` and `wb_anon_tracked`
- `src/auth.js:_clearUserData()` — removes both on logout
- Comment at `auth.js:120-127` explicitly documents the removal and rationale

### Action Taken
Added a regression test suite (`tests/security.test.js`) with 4 tests verifying:
1. `_continueAsGuest` removes `wb_device_id`
2. `_continueAsGuest` is safe when `wb_device_id` is absent
3. `_clearUserData` removes `wb_device_id`
4. The new `wb_device_key` (SEC-9) does NOT create a `wb_device_id` entry

---

## Files Changed

| File | Change |
|------|--------|
| `src/util.js` | Added `_getDeviceKey`, `_encryptStr`, `_decryptStr`, `_migrateEmailStorage` |
| `src/auth.js` | SEC-8 consent checkbox + validation; SEC-9 encrypted Remember Me write + encrypted Soft Gate storage |
| `src/nav.js` | SEC-9 async encrypted Remember Me read |
| `src/boot.js` | Added `_migrateEmailStorage()` call + new globals to `_APP_GLOBALS` |
| `privacy.html` | New — COPPA privacy policy placeholder page |
| `tests/security.test.js` | New — 20 tests across SEC-8, SEC-9, SEC-10 |

---

## Verification

1. **SEC-8:** Open Soft Gate → attempt submit without checking consent → blocked (label border turns red). Check consent → submit proceeds. Click Privacy Policy link → `/privacy.html` opens in new tab.
2. **SEC-9:** Open DevTools → Application → Local Storage after Remember Me save → `mmr_email` absent, `mmr_email_enc` present with `{iv, data}` JSON. Reload app → login email field pre-fills correctly via decryption.
3. **SEC-10:** Sign out → confirm `wb_device_id` is absent from Local Storage.
4. **Automated:** `node --test tests/security.test.js tests/core.test.js` → 82/82 pass.
5. **Build:** `npm run build` succeeds without errors.
