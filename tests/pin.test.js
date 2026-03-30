// tests/pin.test.js
// Run: npx jest tests/pin.test.js --no-coverage

// Node 18+ has SubtleCrypto natively via globalThis.crypto
const { subtle, getRandomValues } = require('node:crypto').webcrypto;
global.crypto = { subtle, getRandomValues };

const { _hashPinLegacy, _hashPin, _savePin, _verifyPin, _PARENT_PIN_KEY } = require('./pin-helpers.js');

describe('PIN hashing', () => {
  beforeEach(() => {
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
    const legacyHash = await _hashPinLegacy('4321');
    global.localStorage.setItem(_PARENT_PIN_KEY, legacyHash);
    global.localStorage.removeItem('wb_pin_v');

    expect(await _verifyPin('4321')).toBe(true);

    expect(global.localStorage.getItem('wb_pin_v')).toBe('2');
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
