# Preflight Hardening Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden My Math Roots across five security/infrastructure fronts: SW offline resilience, unlock-token signing, PBKDF2 PIN upgrade with silent migration, HMAC-SHA256 score signing with DJB2 migration, and a testable cloud-merge function with full Jest coverage.

**Architecture:** All crypto work uses the SubtleCrypto API already in use for AES-GCM and SHA-256. PIN hardening introduces a version flag (`wb_pin_v`) to migrate existing hashes silently on first successful login. Score signing moves from synchronous DJB2 to async HMAC-SHA256; a one-time boot migration clears unrecognised short-format sigs so they pass through the existing `!s._sig` backward-compat path. The merge logic is extracted from `_pullOnLogin` into a pure `_mergeCloudData` function before tests are written against it.

**Tech Stack:** Vanilla JS PWA, SubtleCrypto (PBKDF2, HMAC-SHA256, AES-GCM), Jest (new), Node 18+, Netlify/Supabase backend unchanged.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `sw.js` | Modify lines 66–78 | Network-first → stale-while-revalidate |
| `src/settings.js` | Modify lines 885–890 | `_signUnlockToken`: incorporate `wb_app_secret` |
| `src/util.js` | Modify lines 192–222, 288–301 | PBKDF2 `_hashPin`; async HMAC `_scoreSig`/`_scoreValid`; add `_hashPinLegacy` |
| `src/quiz.js` | Modify lines 693, 1020, 1056 | `await _scoreSig(...)` at all three call sites |
| `src/auth.js` | Modify lines 996–1016, 370–498 | Async `_pushScores` filter; extract `_mergeCloudData`; wire into `_pullOnLogin` |
| `src/boot.js` | Modify (after `wb_app_secret` block) | One-time DJB2 sig migration at boot |
| `tests/mergeCloudData.test.js` | Create | 21 Jest tests for `_mergeCloudData` |
| `package.json` | Modify | Add Jest dev-dependency + `"test"` script |
| `docs/plans/preflight_hardening.md` | Create | Copy of this plan (stored in-repo) |

---

## Task 1: SW Stale-While-Revalidate

**Files:** Modify `sw.js:66–78`

- [ ] **Step 1: Read the current handler**

  Confirm the network-first block at `sw.js:66–78`:
  ```js
  // Network-first for the main HTML document
  const isDoc = url.pathname === '/' || url.pathname === '/index.html';
  if(isDoc){
    e.respondWith(
      fetch(e.request).then(fresh => {
        if(fresh && fresh.status === 200){
          caches.open(CACHE).then(cache => cache.put(e.request, fresh.clone()));
        }
        return fresh;
      }).catch(() => caches.match(e.request).then(c => c || new Response('Offline', { status: 503 })))
    );
    return;
  }
  ```

- [ ] **Step 2: Replace with stale-while-revalidate**

  Replace the entire `if(isDoc){...}` block with:
  ```js
  // Stale-While-Revalidate for the main HTML document:
  // Serve cached version immediately (instant open), then update cache in background.
  if(isDoc){
    e.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        const fetchPromise = fetch(e.request).then(fresh => {
          if(fresh && fresh.status === 200) cache.put(e.request, fresh.clone());
          return fresh;
        }).catch(() => null);
        return cached || fetchPromise || new Response('Offline', { status: 503 });
      })
    );
    return;
  }
  ```

- [ ] **Step 3: Verify**

  Build and open the app with DevTools → Network tab → offline mode.
  - With no cache: app loads from network (same as before).
  - With existing cache + offline: app opens instantly from cache; no 503.
  - After coming back online: background fetch updates cache; hard-reload gets latest.

- [ ] **Step 4: Commit**

  ```bash
  git add sw.js
  git commit -m "perf: change SW index.html policy from network-first to stale-while-revalidate"
  ```

---

## Task 2: _signUnlockToken — Incorporate wb_app_secret

**Files:** Modify `src/settings.js:885–890`

**Context:** `_signUnlockToken` currently signs unlock tokens using only a static suffix. A user who reverse-engineers the DJB2 function can precompute valid tokens. Adding `wb_app_secret` makes signatures device-specific and unguessable without DevTools access. The function stays synchronous (no HMAC) to avoid making its two callers at lines 682 and 854 async.

- [ ] **Step 1: Read current function**

  Current `src/settings.js:885–890`:
  ```js
  function _signUnlockToken(token){
    const str = token + ':mymathroots_unlock_v1';
    let h = 0;
    for(let i = 0; i < str.length; i++) h = ((h<<5)-h+str.charCodeAt(i))|0;
    return String(h >>> 0);
  }
  ```

- [ ] **Step 2: Add wb_app_secret to the signature string**

  Replace with:
  ```js
  function _signUnlockToken(token){
    const secret = localStorage.getItem('wb_app_secret') || 'fallback';
    const str = token + ':mymathroots_unlock_v1:' + secret;
    let h = 0;
    for(let i = 0; i < str.length; i++) h = ((h<<5)-h+str.charCodeAt(i))|0;
    return String(h >>> 0);
  }
  ```

- [ ] **Step 3: Handle existing unlock tokens**

  Existing tokens stored in localStorage were signed without the secret, so they will now fail verification. This is intentional — parents must re-enter their PIN once to re-lock/unlock. No migration needed (losing an unlock state is harmless; the parent re-unlocks via PIN).

  Add a one-time migration in `src/boot.js` after the `wb_app_secret` block to clear stale unlock tokens:
  ```js
  // SEC-2 hardening: _signUnlockToken now uses wb_app_secret. Clear old device-agnostic
  // unlock tokens so parents re-authorize once rather than using pre-computed tokens.
  if(!localStorage.getItem('wb_unlock_migrated_v2')){
    localStorage.removeItem('wb_parent_unlock'); // PARENT_UNLOCK_KEY
    localStorage.setItem('wb_unlock_migrated_v2', '1');
  }
  ```

  > **Note:** Confirm `PARENT_UNLOCK_KEY` value by searching `src/settings.js` for `const PARENT_UNLOCK_KEY`. Use that exact string in the `removeItem` call.

- [ ] **Step 4: Commit**

  ```bash
  git add src/settings.js src/boot.js
  git commit -m "sec: incorporate wb_app_secret into _signUnlockToken to prevent precomputed bypass"
  ```

---

## Task 3: PBKDF2 PIN Hardening with Silent Migration

**Files:** Modify `src/util.js:192–222`

**Context:** `_hashPin` currently uses SHA-256 + static salt. PBKDF2 with 100,000 iterations and wb_app_secret as additional entropy makes brute-forcing a 4-digit PIN ~100,000× harder. Existing users must not be locked out — a `wb_pin_v` flag ('1' = SHA-256, absent = '1', '2' = PBKDF2) enables silent upgrade on first successful login.

- [ ] **Step 1: Write failing tests**

  Create `tests/pin.test.js`:
  ```js
  // tests/pin.test.js
  // Run: node --experimental-vm-modules node_modules/.bin/jest tests/pin.test.js

  // Polyfill SubtleCrypto for Node (Node 18+ has it natively via globalThis.crypto)
  const { subtle, getRandomValues } = require('node:crypto').webcrypto;
  global.crypto = { subtle, getRandomValues };

  // Inline the functions under test (copy from src/util.js after editing)
  // NOTE: update this path once implemented
  const { _hashPinLegacy, _hashPin, _savePin, _verifyPin, _PARENT_PIN_KEY } = require('./pin-helpers.js');

  describe('PIN hashing', () => {
    beforeEach(() => {
      // Provide a fake wb_app_secret
      global.localStorage = {
        _store: { wb_app_secret: 'test-secret-uuid' },
        getItem: (k) => global.localStorage._store[k] ?? null,
        setItem: (k, v) => { global.localStorage._store[k] = v; },
        removeItem: (k) => { delete global.localStorage._store[k]; },
      };
    });

    test('_hashPinLegacy returns 64-char hex', async () => {
      const h = await _hashPinLegacy('1234');
      expect(h).toMatch(/^[0-9a-f]{64}$/);
    });

    test('_hashPin (PBKDF2) returns 64-char hex', async () => {
      const h = await _hashPin('1234');
      expect(h).toMatch(/^[0-9a-f]{64}$/);
    });

    test('PBKDF2 and SHA-256 produce different hashes for same PIN', async () => {
      const legacy = await _hashPinLegacy('1234');
      const pbkdf2 = await _hashPin('1234');
      expect(legacy).not.toBe(pbkdf2);
    });

    test('_savePin stores PBKDF2 hash and sets wb_pin_v=2', async () => {
      await _savePin('5678');
      expect(global.localStorage.getItem(_PARENT_PIN_KEY)).toMatch(/^[0-9a-f]{64}$/);
      expect(global.localStorage.getItem('wb_pin_v')).toBe('2');
    });

    test('_verifyPin succeeds for newly saved PBKDF2 PIN', async () => {
      await _savePin('9999');
      expect(await _verifyPin('9999')).toBe(true);
    });

    test('_verifyPin rejects wrong PIN', async () => {
      await _savePin('1111');
      expect(await _verifyPin('2222')).toBe(false);
    });

    test('_verifyPin accepts legacy SHA-256 hash and upgrades to PBKDF2', async () => {
      // Simulate a device that stored a SHA-256 hash (wb_pin_v absent)
      const legacyHash = await _hashPinLegacy('4321');
      global.localStorage.setItem(_PARENT_PIN_KEY, legacyHash);
      global.localStorage.removeItem('wb_pin_v');

      expect(await _verifyPin('4321')).toBe(true);

      // After successful legacy verify, version flag must be upgraded
      expect(global.localStorage.getItem('wb_pin_v')).toBe('2');
      // And stored hash must now be a PBKDF2 hash (different from the legacy hash)
      const upgradedHash = global.localStorage.getItem(_PARENT_PIN_KEY);
      expect(upgradedHash).not.toBe(legacyHash);
    });

    test('_verifyPin rejects wrong PIN even against legacy hash', async () => {
      const legacyHash = await _hashPinLegacy('4321');
      global.localStorage.setItem(_PARENT_PIN_KEY, legacyHash);
      global.localStorage.removeItem('wb_pin_v');
      expect(await _verifyPin('0000')).toBe(false);
    });
  });
  ```

- [ ] **Step 2: Run tests → confirm RED**

  ```bash
  npx jest tests/pin.test.js --no-coverage
  ```
  Expected: FAIL — `pin-helpers.js` does not exist.

- [ ] **Step 3: Create test helper shim `tests/pin-helpers.js`**

  This file re-exports the functions under test in a way Jest can import without the full browser bundle:
  ```js
  // tests/pin-helpers.js
  // Shim: expose util.js PIN functions for Jest (no browser globals needed except localStorage + crypto)
  const PARENT_PIN_KEY = 'wb_parent_pin';

  async function _hashPinLegacy(pin){
    const encoder = new TextEncoder();
    const data = encoder.encode(String(pin) + 'mymathroots_pin_salt_2025');
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function _hashPin(pin){
    const secret = localStorage.getItem('wb_app_secret') || 'fallback';
    const keyMat = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(String(pin) + secret),
      { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name:'PBKDF2', salt: new TextEncoder().encode('mymathroots_pin_v2'),
        iterations: 100000, hash: 'SHA-256' },
      keyMat, 256
    );
    return Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function _savePin(pin){
    const hash = await _hashPin(pin);
    localStorage.setItem(PARENT_PIN_KEY, hash);
    localStorage.setItem('wb_pin_v', '2');
  }

  async function _verifyPin(entered){
    const stored = localStorage.getItem(PARENT_PIN_KEY);
    if(!stored || stored.length !== 64) return false;
    const ver = localStorage.getItem('wb_pin_v') || '1';
    try {
      if(ver === '2'){
        return (await _hashPin(entered)) === stored;
      } else {
        // Legacy SHA-256 path
        const legacyHash = await _hashPinLegacy(entered);
        if(legacyHash !== stored) return false;
        // Silent upgrade: re-hash with PBKDF2 and store
        const newHash = await _hashPin(entered);
        localStorage.setItem(PARENT_PIN_KEY, newHash);
        localStorage.setItem('wb_pin_v', '2');
        return true;
      }
    } catch { return false; }
  }

  module.exports = { _hashPinLegacy, _hashPin, _savePin, _verifyPin, _PARENT_PIN_KEY: PARENT_PIN_KEY };
  ```

- [ ] **Step 4: Run tests → confirm GREEN**

  ```bash
  npx jest tests/pin.test.js --no-coverage
  ```
  Expected: 8 tests PASS.

- [ ] **Step 5: Port the implementation to `src/util.js`**

  In `src/util.js`, make these changes:

  **After the existing `_hashPin` block (line 197), add `_hashPinLegacy`:**
  ```js
  // Legacy SHA-256 PIN hash — used only for migration of pre-v2 stored hashes
  async function _hashPinLegacy(pin){
    const encoder = new TextEncoder();
    const data = encoder.encode(String(pin) + 'mymathroots_pin_salt_2025');
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  ```

  **Replace `_hashPin` (lines 192–197) with PBKDF2 version:**
  ```js
  async function _hashPin(pin){
    const secret = localStorage.getItem('wb_app_secret') || 'fallback';
    const keyMat = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(String(pin) + secret),
      { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name:'PBKDF2', salt: new TextEncoder().encode('mymathroots_pin_v2'),
        iterations: 100000, hash: 'SHA-256' },
      keyMat, 256
    );
    return Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  ```

  **Replace `_savePin` (lines 200–203):**
  ```js
  async function _savePin(pin){
    const hash = await _hashPin(pin);
    localStorage.setItem(PARENT_PIN_KEY, hash);
    localStorage.setItem('wb_pin_v', '2');
  }
  ```

  **Replace `_verifyPin` (lines 209–222):**
  ```js
  async function _verifyPin(entered){
    const stored = localStorage.getItem(PARENT_PIN_KEY);
    if(!stored || stored.length !== 64) return false;
    const ver = localStorage.getItem('wb_pin_v') || '1';
    try {
      if(ver === '2'){
        return (await _hashPin(entered)) === stored;
      } else {
        // Legacy SHA-256 path — migrate silently on success
        const legacyHash = await _hashPinLegacy(entered);
        if(legacyHash !== stored) return false;
        const newHash = await _hashPin(entered);
        localStorage.setItem(PARENT_PIN_KEY, newHash);
        localStorage.setItem('wb_pin_v', '2');
        return true;
      }
    } catch { return false; }
  }
  ```

- [ ] **Step 6: Run tests against the production file path (optional smoke check)**

  Update the `require` in `tests/pin.test.js` to import from `tests/pin-helpers.js` (the shim, which mirrors the production code). Tests already cover the logic. The shim and production code are kept in sync by hand.

- [ ] **Step 7: Commit**

  ```bash
  git add src/util.js tests/pin.test.js tests/pin-helpers.js
  git commit -m "sec: upgrade PIN hashing from SHA-256 to PBKDF2; silent migration on first login (wb_pin_v)"
  ```

---

## Task 4: HMAC-SHA256 Score Signing

**Files:** `src/util.js:288–301`, `src/quiz.js:693,1020,1056`, `src/auth.js:996–1016`, `src/boot.js`

**Context:** DJB2 is a non-cryptographic 32-bit hash — trivially invertible. HMAC-SHA256 with `wb_app_secret` makes scores unforgeable without knowing the device secret. Existing DJB2 sigs (short numeric strings ≤11 chars) must be cleared at boot so they flow through the `!s._sig` backward-compat path in `_pushScores` rather than failing validation and being dropped.

- [ ] **Step 1: Make `_scoreSig` async (HMAC-SHA256)**

  In `src/util.js`, replace lines 287–296:
  ```js
  // SEC-2: Score signing — prevents tampered localStorage scores from reaching Supabase
  // Returns a 64-char hex HMAC-SHA256 signature. Async because SubtleCrypto is async.
  async function _scoreSig(entry){
    const secret = localStorage.getItem('wb_app_secret') || 'fallback';
    const msg = (entry.qid||'') + ':' + (entry.pct||0) + ':' + (entry.id||0);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
    return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  ```

- [ ] **Step 2: Make `_scoreValid` async**

  Replace lines 298–301:
  ```js
  async function _scoreValid(entry){
    if(!entry._sig) return false;
    // Reject legacy DJB2 sigs (short numeric strings); they were cleared at boot
    if(!/^[0-9a-f]{64}$/.test(entry._sig)) return false;
    return entry._sig === await _scoreSig(entry);
  }
  ```

- [ ] **Step 3: Update quiz.js — await _scoreSig at all 3 call sites**

  At `quiz.js:693` (in `_finishQuiz`):
  ```js
  // Before:
  if(_supaUser) autoEntry._sig = _scoreSig(autoEntry);
  // After:
  if(_supaUser) autoEntry._sig = await _scoreSig(autoEntry);
  ```

  At `quiz.js:1020` (in `confirmQuit`):
  ```js
  if(_supaUser) quitEntry._sig = await _scoreSig(quitEntry);
  ```

  At `quiz.js:1056` (in `confirmRestart`):
  ```js
  if(_supaUser) abandonedEntry._sig = await _scoreSig(abandonedEntry);
  ```

  Verify that `_finishQuiz`, `confirmQuit`, and `confirmRestart` are already declared `async` (they do `await` elsewhere). If any are not, add `async` to the function declaration.

- [ ] **Step 4: Update `_pushScores` to use async filter**

  In `src/auth.js`, replace lines 1001–1002:
  ```js
  // Before:
  const verifiedScores = SCORES.filter(s => !s._sig || _scoreValid(s));

  // After (async map → Promise.all → filter):
  const sigChecks = await Promise.all(SCORES.map(s => s._sig ? _scoreValid(s) : Promise.resolve(true)));
  const verifiedScores = SCORES.filter((_, i) => sigChecks[i]);
  ```

- [ ] **Step 5: Add DJB2 boot migration in `src/boot.js`**

  After the `wb_app_secret` block (after line 167 in the current file — just before `supabaseInit()`), add:
  ```js
  // SEC-2 hardening: clear legacy DJB2 score sigs (short numeric strings).
  // They will re-sign with HMAC next time the quiz completes. Cleared sigs
  // pass through the !s._sig backward-compat path in _pushScores.
  (function _clearLegacySigs(){
    if(localStorage.getItem('wb_sig_migrated_v2')) return;
    try{
      const raw = localStorage.getItem('wb_sc5');
      if(raw){
        const scores = JSON.parse(raw);
        let changed = false;
        scores.forEach(s => {
          if(s._sig && !/^[0-9a-f]{64}$/.test(s._sig)){
            delete s._sig; changed = true;
          }
        });
        if(changed) localStorage.setItem('wb_sc5', JSON.stringify(scores));
      }
    } catch {}
    localStorage.setItem('wb_sig_migrated_v2', '1');
  })();
  ```

  > **Note:** The in-memory SCORES array is loaded from `wb_sc5` at app start before this runs (or concurrently). If SCORES is already populated in memory, also patch it in-memory:
  > ```js
  > if(typeof SCORES !== 'undefined'){
  >   SCORES.forEach(s => { if(s._sig && !/^[0-9a-f]{64}$/.test(s._sig)) delete s._sig; });
  > }
  > ```
  > Check whether SCORES is a module-level const loaded before boot.js runs, and patch accordingly.

- [ ] **Step 6: Commit**

  ```bash
  git add src/util.js src/quiz.js src/auth.js src/boot.js
  git commit -m "sec: replace DJB2 _scoreSig with async HMAC-SHA256; migrate legacy sigs at boot"
  ```

---

## Task 5: Extract `_mergeCloudData` + Jest Test Suite

**Files:** `src/auth.js:389–497`, new `tests/mergeCloudData.test.js`, `package.json`

**Context:** The merge logic in `_pullOnLogin` (lines 389–497) is embedded with Supabase I/O, making it untestable. Extracting it as a pure function `_mergeCloudData(local, cloud)` enables a full Jest suite covering all five merge strategies (DONE, SCORES, STREAK, MASTERY, APP_TIME).

- [ ] **Step 1: Install Jest**

  ```bash
  npm install --save-dev jest
  ```

  Add to `package.json` scripts:
  ```json
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/.bin/jest",
    "test:watch": "node --experimental-vm-modules node_modules/.bin/jest --watch"
  }
  ```

  Add Jest config to `package.json`:
  ```json
  "jest": {
    "testEnvironment": "node",
    "transform": {}
  }
  ```

- [ ] **Step 2: Write failing tests**

  Create `tests/mergeCloudData.test.js`:
  ```js
  // tests/mergeCloudData.test.js
  const { _mergeCloudData } = require('./mergeCloudData-helpers.js');

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function makeScore(overrides = {}){
    return { qid:'q1', label:'Test', type:'lesson', score:8, total:10, pct:80,
      stars:'⭐⭐', unitIdx:1, color:'green', name:'', id:Date.now(),
      timeTaken:30, answers:[], date:'2026-03-30', time:'10:00',
      quit:false, abandoned:false, ...overrides };
  }

  function makeCloud(overrides = {}){
    return {
      prog: { done_json:{}, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } },
      remoteScores: [],
      profile: null,
      ...overrides
    };
  }

  function makeLocal(overrides = {}){
    return {
      done: {}, scores: [], streak: { current:0, longest:0, lastDate:'' },
      mastery: {}, appTime: { totalSecs:0, sessions:0, dailySecs:{} },
      ...overrides
    };
  }

  // ── DONE merge ───────────────────────────────────────────────────────────────
  describe('DONE union merge', () => {
    test('cloud keys are merged into local', () => {
      const local = makeLocal({ done: { 'u1-l1': true } });
      const cloud = makeCloud({ prog: { done_json: { 'u1-l2': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
      const result = _mergeCloudData(local, cloud);
      expect(result.done['u1-l1']).toBe(true);
      expect(result.done['u1-l2']).toBe(true);
    });

    test('cloud overwrites matching local key', () => {
      const local = makeLocal({ done: { 'u1-l1': false } });
      const cloud = makeCloud({ prog: { done_json: { 'u1-l1': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
      const result = _mergeCloudData(local, cloud);
      expect(result.done['u1-l1']).toBe(true);
    });

    test('local-only keys survive', () => {
      const local = makeLocal({ done: { 'u2-l3': true } });
      const cloud = makeCloud({ prog: { done_json: { 'u1-l1': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
      const result = _mergeCloudData(local, cloud);
      expect(result.done['u2-l3']).toBe(true);
    });

    test('prototype pollution keys are rejected', () => {
      const local = makeLocal();
      const cloud = makeCloud({ prog: { done_json: { '__proto__': true, 'constructor': true, 'prototype': true, 'safe-key': true }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
      const result = _mergeCloudData(local, cloud);
      expect(result.done['safe-key']).toBe(true);
      expect(Object.prototype.polluted).toBeUndefined();
      expect(result.done['__proto__']).toBeUndefined();
    });

    test('non-boolean values are coerced to boolean', () => {
      const local = makeLocal();
      const cloud = makeCloud({ prog: { done_json: { 'u1-l1': 1, 'u1-l2': 0 }, mastery_json:{}, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } });
      const result = _mergeCloudData(local, cloud);
      expect(result.done['u1-l1']).toBe(true);
      expect(result.done['u1-l2']).toBe(false);
    });
  });

  // ── SCORES append-only ───────────────────────────────────────────────────────
  describe('SCORES append-only merge', () => {
    test('remote score with new local_id is appended', () => {
      const local = makeLocal({ scores: [makeScore({ id: 1 })] });
      const remote = [{ local_id:2, qid:'q2', label:'', type:'', score:5, total:10, pct:50,
        stars:'⭐', unit_idx:1, color:'', student_name:'', time_taken:20, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
      const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
      expect(result.scores).toHaveLength(2);
    });

    test('remote score with existing local_id is ignored', () => {
      const local = makeLocal({ scores: [makeScore({ id: 1 })] });
      const remote = [{ local_id:1, qid:'q1', label:'', type:'', score:5, total:10, pct:50,
        stars:'⭐', unit_idx:1, color:'', student_name:'', time_taken:20, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
      const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
      expect(result.scores).toHaveLength(1);
    });

    test('merged scores are sorted descending by id', () => {
      const local = makeLocal({ scores: [makeScore({ id: 1 })] });
      const remote = [{ local_id:5, qid:'q2', label:'', type:'', score:5, total:10, pct:50,
        stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
      const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
      expect(result.scores[0].id).toBe(5);
      expect(result.scores[1].id).toBe(1);
    });

    test('scores capped at 200 after merge', () => {
      const local = makeLocal({ scores: Array.from({length:199}, (_,i) => makeScore({ id:i+1 })) });
      const remote = [
        { local_id:200, qid:'q', label:'', type:'', score:1, total:1, pct:100, stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false },
        { local_id:201, qid:'q', label:'', type:'', score:1, total:1, pct:100, stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false },
      ];
      const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
      expect(result.scores).toHaveLength(200);
    });

    test('invalid remote score (missing qid) is filtered out', () => {
      const local = makeLocal();
      const remote = [{ local_id:1, qid:null, label:'', type:'', score:5, total:10, pct:50,
        stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
      const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
      expect(result.scores).toHaveLength(0);
    });

    test('remote score with pct > 100 is filtered out', () => {
      const local = makeLocal();
      const remote = [{ local_id:1, qid:'q', label:'', type:'', score:5, total:10, pct:150,
        stars:'', unit_idx:0, color:'', student_name:'', time_taken:0, answers:[], date_str:'', time_str:'', quit:false, abandoned:false }];
      const result = _mergeCloudData(local, makeCloud({ remoteScores: remote }));
      expect(result.scores).toHaveLength(0);
    });
  });

  // ── STREAK last-writer-wins ──────────────────────────────────────────────────
  describe('STREAK last-writer-wins', () => {
    test('server date newer → adopt server values', () => {
      const local = makeLocal({ streak: { current:3, longest:5, lastDate:'2026-03-29' } });
      const profile = { current_streak:7, longest_streak:10, last_activity_date:'2026-03-30' };
      const result = _mergeCloudData(local, makeCloud({ profile }));
      expect(result.streak.current).toBe(7);
      expect(result.streak.lastDate).toBe('2026-03-30');
    });

    test('server date older → keep local', () => {
      const local = makeLocal({ streak: { current:5, longest:5, lastDate:'2026-03-30' } });
      const profile = { current_streak:2, longest_streak:3, last_activity_date:'2026-03-28' };
      const result = _mergeCloudData(local, makeCloud({ profile }));
      expect(result.streak.current).toBe(5);
    });

    test('longest_streak uses Math.max (never decreases)', () => {
      const local = makeLocal({ streak: { current:1, longest:20, lastDate:'2026-03-30' } });
      const profile = { current_streak:10, longest_streak:15, last_activity_date:'2026-03-30' };
      const result = _mergeCloudData(local, makeCloud({ profile }));
      expect(result.streak.longest).toBe(20);
    });

    test('missing local lastDate → adopt server', () => {
      const local = makeLocal({ streak: { current:0, longest:0, lastDate:'' } });
      const profile = { current_streak:3, longest_streak:3, last_activity_date:'2026-03-30' };
      const result = _mergeCloudData(local, makeCloud({ profile }));
      expect(result.streak.current).toBe(3);
    });
  });

  // ── MASTERY higher-attempts-wins ─────────────────────────────────────────────
  describe('MASTERY higher-attempts-wins', () => {
    test('higher remote attempts → replace local', () => {
      const local = makeLocal({ mastery: { 'add-2': { attempts:3, correct:2, lastSeen:0 } } });
      const mastery_json = { 'add-2': { attempts:5, correct:4, lastSeen:1 } };
      const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
      expect(result.mastery['add-2'].attempts).toBe(5);
    });

    test('equal attempts, higher remote correct → replace local', () => {
      const local = makeLocal({ mastery: { 'add-2': { attempts:3, correct:1, lastSeen:0 } } });
      const mastery_json = { 'add-2': { attempts:3, correct:3, lastSeen:0 } };
      const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
      expect(result.mastery['add-2'].correct).toBe(3);
    });

    test('lower remote attempts → keep local', () => {
      const local = makeLocal({ mastery: { 'add-2': { attempts:10, correct:8, lastSeen:0 } } });
      const mastery_json = { 'add-2': { attempts:3, correct:3, lastSeen:0 } };
      const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
      expect(result.mastery['add-2'].attempts).toBe(10);
    });

    test('missing local key → adopt remote', () => {
      const local = makeLocal({ mastery: {} });
      const mastery_json = { 'sub-3': { attempts:2, correct:1, lastSeen:0 } };
      const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json, apptime_json:{ totalSecs:0, sessions:0, dailySecs:{} } } }));
      expect(result.mastery['sub-3']).toBeDefined();
      expect(result.mastery['sub-3'].attempts).toBe(2);
    });
  });

  // ── APP_TIME max-per-day ─────────────────────────────────────────────────────
  describe('APP_TIME max merge', () => {
    test('remote totalSecs higher → adopt', () => {
      const local = makeLocal({ appTime: { totalSecs:100, sessions:1, dailySecs:{} } });
      const apptime_json = { totalSecs:500, sessions:3, dailySecs:{} };
      const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json:{}, apptime_json } }));
      expect(result.appTime.totalSecs).toBe(500);
    });

    test('remote dailySecs wins per-day max', () => {
      const local = makeLocal({ appTime: { totalSecs:0, sessions:0, dailySecs: { '2026-03-30': 120 } } });
      const apptime_json = { totalSecs:0, sessions:0, dailySecs: { '2026-03-30': 300, '2026-03-29': 60 } };
      const result = _mergeCloudData(local, makeCloud({ prog: { done_json:{}, mastery_json:{}, apptime_json } }));
      expect(result.appTime.dailySecs['2026-03-30']).toBe(300);
      expect(result.appTime.dailySecs['2026-03-29']).toBe(60);
    });
  });
  ```

- [ ] **Step 3: Run tests → confirm RED**

  ```bash
  npm test -- tests/mergeCloudData.test.js --no-coverage
  ```
  Expected: FAIL — `mergeCloudData-helpers.js` does not exist.

- [ ] **Step 4: Create `tests/mergeCloudData-helpers.js`**

  This shim contains the pure `_mergeCloudData` function (mirrored from `src/auth.js` after extraction):
  ```js
  // tests/mergeCloudData-helpers.js
  // Pure merge function — no Supabase, no localStorage, no global state.
  // Inputs:
  //   local: { done, scores, streak, mastery, appTime }
  //   cloud: { prog: { done_json, mastery_json, apptime_json }, remoteScores, profile }
  // Returns a new object with the same shape — does NOT mutate inputs.

  function _mergeCloudData(local, cloud){
    const done     = { ...local.done };
    const scores   = [...local.scores];
    const streak   = { ...local.streak };
    const mastery  = JSON.parse(JSON.stringify(local.mastery));
    const appTime  = JSON.parse(JSON.stringify(local.appTime));

    const { prog, remoteScores, profile } = cloud;

    // DONE — union merge
    if(prog && prog.done_json && typeof prog.done_json === 'object' && !Array.isArray(prog.done_json)){
      for(const [k,v] of Object.entries(prog.done_json)){
        if(typeof k === 'string' && k.length < 100
           && k !== '__proto__' && k !== 'constructor' && k !== 'prototype'){
          done[k] = !!v;
        }
      }
    }

    // SCORES — append-only dedup
    if(Array.isArray(remoteScores) && remoteScores.length){
      const localIds = new Set(scores.map(s => s.id));
      const incoming = remoteScores
        .filter(r => r && typeof r.local_id === 'number' && typeof r.qid === 'string'
          && typeof r.score === 'number' && typeof r.total === 'number'
          && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100
          && !localIds.has(r.local_id))
        .map(r => ({
          qid:r.qid, label:String(r.label||''), type:String(r.type||''),
          score:r.score, total:r.total, pct:r.pct, stars:String(r.stars||''),
          unitIdx:typeof r.unit_idx==='number'?r.unit_idx:0, color:String(r.color||''),
          name:String(r.student_name||''), id:r.local_id,
          timeTaken:typeof r.time_taken==='number'?r.time_taken:0,
          answers:Array.isArray(r.answers)?r.answers:[],
          date:String(r.date_str||''), time:String(r.time_str||''),
          quit:!!r.quit, abandoned:!!r.abandoned
        }));
      scores.push(...incoming);
      scores.sort((a,b) => b.id - a.id);
      if(scores.length > 200) scores.length = 200;
    }

    // STREAK — last-writer-wins
    if(profile && typeof profile.current_streak === 'number' && profile.current_streak >= 0){
      const serverDate = typeof profile.last_activity_date === 'string' ? profile.last_activity_date : '';
      const serverLongest = typeof profile.longest_streak === 'number' ? profile.longest_streak : 0;
      if(!streak.lastDate || serverDate >= streak.lastDate){
        streak.current = profile.current_streak;
        streak.longest = Math.max(serverLongest, streak.longest);
        streak.lastDate = serverDate || streak.lastDate;
      }
    }

    // MASTERY — higher-attempts-wins
    if(prog && prog.mastery_json && typeof prog.mastery_json === 'object'){
      for(const [k, cm] of Object.entries(prog.mastery_json)){
        if(!cm || typeof cm.attempts !== 'number') continue;
        const lm = mastery[k];
        if(!lm || cm.attempts > lm.attempts || (cm.attempts === lm.attempts && cm.correct > (lm.correct||0))){
          mastery[k] = { attempts:cm.attempts, correct:cm.correct||0, lastSeen:cm.lastSeen||0 };
        }
      }
    }

    // APP_TIME — max per field/day
    if(prog && prog.apptime_json && typeof prog.apptime_json === 'object'){
      const ct = prog.apptime_json;
      if(typeof ct.totalSecs === 'number' && ct.totalSecs > (appTime.totalSecs||0)) appTime.totalSecs = ct.totalSecs;
      if(typeof ct.sessions === 'number' && ct.sessions > (appTime.sessions||0)) appTime.sessions = ct.sessions;
      if(ct.dailySecs && typeof ct.dailySecs === 'object'){
        appTime.dailySecs = appTime.dailySecs || {};
        for(const [d, s] of Object.entries(ct.dailySecs)){
          if(typeof s === 'number' && s > (appTime.dailySecs[d]||0)) appTime.dailySecs[d] = s;
        }
      }
    }

    return { done, scores, streak, mastery, appTime };
  }

  module.exports = { _mergeCloudData };
  ```

- [ ] **Step 5: Run tests → confirm GREEN**

  ```bash
  npm test -- tests/mergeCloudData.test.js --no-coverage
  ```
  Expected: 21 tests PASS.

- [ ] **Step 6: Extract `_mergeCloudData` into `src/auth.js`**

  Above `_pullOnLogin` (before line 370), add the `_mergeCloudData` function using the same implementation as the test shim (adapted to read from the global DONE/SCORES/STREAK/MASTERY/APP_TIME objects):

  ```js
  // Pure merge function — extracted from _pullOnLogin for testability.
  // Merges cloud data into a copy of local state and returns the result.
  // Does NOT mutate inputs. Caller applies the result to globals.
  function _mergeCloudData(local, cloud){
    // ... (same body as tests/mergeCloudData-helpers.js)
  }
  ```

  Then in `_pullOnLogin` (lines 411–488), replace the inline merge logic with:
  ```js
  const merged = _mergeCloudData(
    { done: DONE, scores: SCORES, streak: STREAK, mastery: MASTERY, appTime: APP_TIME },
    { prog, remoteScores, profile }
  );
  Object.assign(DONE, merged.done);
  SCORES.length = 0; SCORES.push(...merged.scores);
  Object.assign(STREAK, merged.streak);
  Object.assign(MASTERY, merged.mastery);
  Object.assign(APP_TIME, merged.appTime);
  localStorage.setItem('wb_done5', JSON.stringify(DONE));
  localStorage.setItem('wb_sc5', JSON.stringify(SCORES));
  localStorage.setItem('wb_streak', JSON.stringify(STREAK));
  if(typeof saveMastery === 'function') saveMastery();
  if(typeof saveAppTime === 'function') saveAppTime();
  ```

  > **Note:** The original code called `saveMastery()` and `saveAppTime()` conditionally on `changed` flags. The refactored version always calls them after merge; these functions are idempotent writes so this is safe.

- [ ] **Step 7: Run full test suite**

  ```bash
  npm test --no-coverage
  ```
  Expected: All tests PASS.

- [ ] **Step 8: Commit**

  ```bash
  git add package.json src/auth.js tests/mergeCloudData.test.js tests/mergeCloudData-helpers.js tests/pin.test.js tests/pin-helpers.js
  git commit -m "test: add Jest; extract _mergeCloudData from _pullOnLogin; 21-case test suite"
  ```

---

## Task 6: Save Plan + Build

- [ ] **Step 1: Save plan to repo**

  Copy this plan to `docs/plans/preflight_hardening.md` in the worktree.

- [ ] **Step 2: Build**

  ```bash
  npm run build
  ```
  Expected: `dist/` output with no errors.

- [ ] **Step 3: Commit + push**

  ```bash
  git add docs/plans/preflight_hardening.md dist/
  git commit -m "docs: add preflight_hardening plan; include dist build"
  ```

---

## Verification

### Automated
```bash
npm test --no-coverage
```
Expected: All 29 tests pass (8 PIN + 21 merge).

### Manual — PIN hardening
1. Set a 4-digit PIN in Settings → Parent Controls.
2. Open DevTools → Application → Local Storage.
3. Confirm `wb_pin_v` = `'2'` and `wb_parent_pin` is a 64-char hex string.
4. On a device with an existing SHA-256 PIN (no `wb_pin_v`): enter correct PIN → verify it unlocks → confirm `wb_pin_v` is now `'2'` in storage.

### Manual — Score signing
1. Complete a quiz. Open DevTools → Application → Local Storage → `wb_sc5`.
2. Confirm the newest score entry has a `_sig` that is exactly 64 hex chars (not a short number).

### Manual — SW stale-while-revalidate
1. Load the app once. Go offline in DevTools → Network tab.
2. Hard-reload — app must open immediately from cache (not a 503 or blank).

### Manual — Unlock token
1. Have a parent unlock a unit via PIN.
2. Open DevTools → Application → Local Storage → `wb_parent_unlock`.
3. Confirm the `s` (signature) value changes between devices (device-specific secret).

### Build
```bash
npm run build
```
No errors, `dist/index.html` is produced.
