// tests/pin-helpers.js
// Shim: expose util.js PIN functions for Jest (no browser globals needed except localStorage + crypto)
// Keep in sync with src/util.js PIN SECURITY section.
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

module.exports = { _hashPinLegacy, _hashPin, _savePin, _verifyPin, _PARENT_PIN_KEY: PARENT_PIN_KEY };
