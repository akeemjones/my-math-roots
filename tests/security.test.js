// =============================================================================
//  My Math Roots — Security Test Suite (SEC-8, SEC-9, SEC-10)
//  Run: node --test tests/security.test.js
//  Requires Node 18+ (built-in node:test, node:assert, node:crypto)
// =============================================================================

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');

// =============================================================================
//  RE-IMPLEMENTED PURE FUNCTIONS (mirrors src/ logic for isolated testing)
// =============================================================================

// -- Consent form validation (from _submitSoftGate logic, SEC-8) ---------------

// Extracted validation logic — returns 'ok', 'invalid_email', or 'consent_required'
function _validateSoftGateForm({ email, consentChecked }) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'invalid_email';
  if (!consentChecked) return 'consent_required';
  return 'ok';
}

// -- AES-GCM email encryption helpers (from src/util.js, SEC-9) ---------------
// These mirror the exact implementation added to util.js so we can test
// the algorithm without a DOM or browser environment.

const { subtle } = webcrypto;
const getRandomValues = webcrypto.getRandomValues.bind(webcrypto);

async function _getDeviceKey(mockStorage) {
  const HEX_KEY = 'wb_device_key';
  const hex = mockStorage.getItem(HEX_KEY);
  let bytes;
  if (hex) {
    bytes = new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
  } else {
    bytes = new Uint8Array(32);
    getRandomValues(bytes);
    const newHex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    mockStorage.setItem(HEX_KEY, newHex);
  }
  return subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function _encryptStr(str, mockStorage) {
  const key = await _getDeviceKey(mockStorage);
  const iv = new Uint8Array(12);
  getRandomValues(iv);
  const enc = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(str)
  );
  const toHex = a => Array.from(new Uint8Array(a)).map(b => b.toString(16).padStart(2, '0')).join('');
  return { iv: toHex(iv), data: toHex(enc) };
}

async function _decryptStr(obj, mockStorage) {
  try {
    const key = await _getDeviceKey(mockStorage);
    const fromHex = h => new Uint8Array(h.match(/.{2}/g).map(b => parseInt(b, 16)));
    const dec = await subtle.decrypt(
      { name: 'AES-GCM', iv: fromHex(obj.iv) },
      key,
      fromHex(obj.data)
    );
    return new TextDecoder().decode(dec);
  } catch {
    return null;
  }
}

// Helper: minimal localStorage mock (Map-backed)
function makeMockStorage() {
  const store = {};
  return {
    getItem:    k => (k in store) ? store[k] : null,
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    has:        k => k in store,
    _store:     store,
  };
}

// -- Device ID cleanup (from _continueAsGuest and _clearUserData, SEC-10) ------

function _continueAsGuest_cleanup(ls) {
  ls.removeItem('wb_device_id');
  ls.removeItem('wb_anon_tracked');
}

function _clearUserData_cleanup(ls) {
  // mirrors the device-ID lines in _clearUserData()
  ls.removeItem('wb_device_id');
  ls.removeItem('wb_anon_tracked');
}

// =============================================================================
//  SEC-8 TESTS — COPPA Consent Checkbox
// =============================================================================

describe('SEC-8: Soft gate consent validation', () => {
  it('rejects submission when consent checkbox is unchecked', () => {
    const result = _validateSoftGateForm({
      email: 'parent@test.com',
      consentChecked: false,
    });
    assert.strictEqual(result, 'consent_required',
      'should block submission when consent is not checked');
  });

  it('accepts valid submission when consent is checked', () => {
    const result = _validateSoftGateForm({
      email: 'parent@test.com',
      consentChecked: true,
    });
    assert.strictEqual(result, 'ok',
      'should allow submission when email is valid and consent is checked');
  });

  it('rejects invalid email regardless of consent state', () => {
    const badEmails = ['notanemail', '@no-user.com', 'no-domain@', '', 'spaces @email.com'];
    for (const email of badEmails) {
      const result = _validateSoftGateForm({ email, consentChecked: true });
      assert.strictEqual(result, 'invalid_email',
        `should reject invalid email: "${email}"`);
    }
  });

  it('rejects both invalid email AND missing consent (email check runs first)', () => {
    const result = _validateSoftGateForm({
      email: 'notvalid',
      consentChecked: false,
    });
    assert.strictEqual(result, 'invalid_email',
      'email validation should run before consent validation');
  });

  it('accepts various valid email formats when consent is checked', () => {
    const goodEmails = [
      'parent@example.com',
      'parent+tag@school.org',
      'p.a.r.e.n.t@sub.domain.edu',
    ];
    for (const email of goodEmails) {
      const result = _validateSoftGateForm({ email, consentChecked: true });
      assert.strictEqual(result, 'ok', `should accept valid email: "${email}"`);
    }
  });
});

// =============================================================================
//  SEC-9 TESTS — AES-GCM Email Encryption
// =============================================================================

describe('SEC-9: AES-GCM email encryption — round trip', () => {
  it('encrypts and decrypts an email address correctly', async () => {
    const ls = makeMockStorage();
    const email = 'parent@test.com';
    const enc = await _encryptStr(email, ls);
    const dec = await _decryptStr(enc, ls);
    assert.strictEqual(dec, email, 'decrypted value should match original email');
  });

  it('encrypted payload has iv and data fields', async () => {
    const ls = makeMockStorage();
    const enc = await _encryptStr('any@email.com', ls);
    assert.ok(typeof enc.iv === 'string' && enc.iv.length > 0, 'should have iv field');
    assert.ok(typeof enc.data === 'string' && enc.data.length > 0, 'should have data field');
  });

  it('encrypted data does not contain the plain email string', async () => {
    const ls = makeMockStorage();
    const email = 'secret@example.com';
    const enc = await _encryptStr(email, ls);
    const json = JSON.stringify(enc);
    assert.ok(!json.includes(email),
      'encrypted payload must not contain the plain-text email');
  });

  it('encrypted data is not base64-decodable to the plain email', async () => {
    const ls = makeMockStorage();
    const email = 'hidden@example.com';
    const enc = await _encryptStr(email, ls);
    // Try to find email in the hex data (it shouldn't appear)
    const emailHex = Array.from(new TextEncoder().encode(email))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    assert.ok(!enc.data.includes(emailHex),
      'email must not appear as a plain hex sequence in encrypted data');
  });

  it('decryptStr returns null for tampered ciphertext', async () => {
    const ls = makeMockStorage();
    const enc = await _encryptStr('test@test.com', ls);
    const tampered = { iv: enc.iv, data: 'deadbeefdeadbeef' };
    const result = await _decryptStr(tampered, ls);
    assert.strictEqual(result, null,
      'should return null when decryption fails (tampered data)');
  });

  it('decryptStr returns null for wrong key (different storage instance)', async () => {
    const ls1 = makeMockStorage();
    const ls2 = makeMockStorage(); // different device key
    const enc = await _encryptStr('test@test.com', ls1);
    const result = await _decryptStr(enc, ls2);
    assert.strictEqual(result, null,
      'decryption with wrong key should return null');
  });

  it('each encryption of the same string produces different ciphertext (random IV)', async () => {
    const ls = makeMockStorage();
    const email = 'same@email.com';
    const enc1 = await _encryptStr(email, ls);
    const enc2 = await _encryptStr(email, ls);
    assert.notStrictEqual(enc1.iv, enc2.iv, 'each encryption should use a fresh random IV');
    assert.notStrictEqual(enc1.data, enc2.data, 'ciphertext should differ due to different IVs');
  });

  it('device key persists across calls (same key is reused)', async () => {
    const ls = makeMockStorage();
    await _encryptStr('first@email.com', ls);
    const keyHexAfterFirst = ls.getItem('wb_device_key');
    await _encryptStr('second@email.com', ls);
    const keyHexAfterSecond = ls.getItem('wb_device_key');
    assert.strictEqual(keyHexAfterFirst, keyHexAfterSecond,
      'device key should not be regenerated on subsequent encryptions');
  });

  it('remember-me flow: stores mmr_email_enc, not mmr_email (plain text)', async () => {
    const ls = makeMockStorage();
    const email = 'parent@example.com';

    // Simulate the remember-me WRITE flow
    const enc = await _encryptStr(email, ls);
    ls.setItem('mmr_email_enc', JSON.stringify(enc));
    ls.removeItem('mmr_email'); // ensure old key is gone

    assert.ok(!ls.has('mmr_email'),
      'plain-text mmr_email key must not exist in localStorage');
    assert.ok(ls.has('mmr_email_enc'),
      'mmr_email_enc must exist in localStorage');

    // Simulate the remember-me READ flow
    const stored = JSON.parse(ls.getItem('mmr_email_enc'));
    const recovered = await _decryptStr(stored, ls);
    assert.strictEqual(recovered, email,
      'reading mmr_email_enc should recover the original email');
  });

  it('wb_lead: stores emailEnc, not email (plain text)', async () => {
    const ls = makeMockStorage();
    const email = 'lead@example.com';
    const grade = '3';
    const referral = 'teacher';
    const date = '2026-03-30';

    // Simulate the Soft Gate storage flow
    const emailEnc = await _encryptStr(email, ls);
    const lead = { emailEnc, grade, referral, date };
    ls.setItem('wb_lead', JSON.stringify(lead));

    const stored = JSON.parse(ls.getItem('wb_lead'));
    assert.ok(!('email' in stored),
      'wb_lead must not have a plain "email" field');
    assert.ok('emailEnc' in stored,
      'wb_lead must have an "emailEnc" field');
    assert.ok(!JSON.stringify(stored).includes(email),
      'plain email must not appear anywhere in the wb_lead JSON string');
  });

  it('migration: upgrades mmr_email (plain) to mmr_email_enc', async () => {
    const ls = makeMockStorage();
    const email = 'olduser@example.com';
    ls.setItem('mmr_email', email); // simulate legacy plain-text storage

    // Simulate _migrateEmailStorage()
    const plain = ls.getItem('mmr_email');
    if (plain) {
      const enc = await _encryptStr(plain, ls);
      ls.setItem('mmr_email_enc', JSON.stringify(enc));
      ls.removeItem('mmr_email');
    }

    assert.ok(!ls.has('mmr_email'),
      'mmr_email plain key should be removed after migration');
    assert.ok(ls.has('mmr_email_enc'),
      'mmr_email_enc should exist after migration');
    const recovered = await _decryptStr(JSON.parse(ls.getItem('mmr_email_enc')), ls);
    assert.strictEqual(recovered, email, 'migrated email should decrypt correctly');
  });
});

// =============================================================================
//  SEC-10 TESTS — wb_device_id regression (already fixed, locking it in)
// =============================================================================

describe('SEC-10: wb_device_id is never written (regression guard)', () => {
  it('_continueAsGuest removes wb_device_id if present', () => {
    const ls = makeMockStorage();
    ls.setItem('wb_device_id', 'some-legacy-id');
    ls.setItem('wb_anon_tracked', '1');

    _continueAsGuest_cleanup(ls);

    assert.ok(!ls.has('wb_device_id'),
      'wb_device_id must be removed when a guest session starts');
    assert.ok(!ls.has('wb_anon_tracked'),
      'wb_anon_tracked must be removed when a guest session starts');
  });

  it('_continueAsGuest is safe even when wb_device_id is not present', () => {
    const ls = makeMockStorage(); // fresh storage with no device ID
    assert.doesNotThrow(() => _continueAsGuest_cleanup(ls),
      'should not throw when wb_device_id is absent');
    assert.ok(!ls.has('wb_device_id'),
      'wb_device_id must remain absent');
  });

  it('_clearUserData removes wb_device_id if present', () => {
    const ls = makeMockStorage();
    ls.setItem('wb_device_id', 'another-id');

    _clearUserData_cleanup(ls);

    assert.ok(!ls.has('wb_device_id'),
      'wb_device_id must be removed during user data clear (sign-out)');
  });

  it('wb_device_id is not re-created by _encryptStr (device key uses different key name)', async () => {
    const ls = makeMockStorage();
    await _encryptStr('test@test.com', ls);

    assert.ok(!ls.has('wb_device_id'),
      'SEC-9 crypto setup must not create wb_device_id — uses wb_device_key instead');
    assert.ok(ls.has('wb_device_key'),
      'SEC-9 should use wb_device_key (separate from legacy device tracking key)');
  });
});
