// ════════════════════════════════════════
//  SCREEN READER HELPER
// ════════════════════════════════════════
// Returns attr string only when screen reader a11y is on; empty string otherwise
function _sr(attrs){ return document.body.classList.contains('a11y-screenreader') ? ' '+attrs : ''; }

// Fisher-Yates (Knuth) shuffle — uniform randomization
function _shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    const tmp=arr[i]; arr[i]=arr[j]; arr[j]=tmp;
  }
  return arr;
}

// ════════════════════════════════════════
//  SECURITY UTILITIES
// ════════════════════════════════════════

// Strip HTML tags and dangerous characters from user-entered text
function _sanitize(str, maxLen = 200){
  return String(str ?? '')
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/[<>"'`]/g, '')      // strip remaining dangerous chars
    .trim()
    .substring(0, maxLen);
}

// HTML-encode a value before interpolating into innerHTML — prevents XSS
function _escHtml(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validate email format
function _validEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Map raw Supabase/network errors to friendly user messages
function _friendlyError(err){
  const msg = (err?.message || String(err)).toLowerCase();
  if(msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('wrong password'))
    return 'Incorrect email or password. Please try again.';
  if(msg.includes('email not confirmed'))
    return 'Please check your email and confirm your account first.';
  if(msg.includes('already registered') || msg.includes('user already exists') || msg.includes('already been registered'))
    return 'If this email is not yet registered, a confirmation link will be sent. Otherwise, try signing in.';
  if(msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('429'))
    return 'Too many attempts. Please wait a moment and try again.';
  if(msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('load failed'))
    return 'Network error — check your connection and try again.';
  if(msg.includes('weak password') || msg.includes('password should be'))
    return 'Password is too weak. Please use at least 6 characters.';
  if(msg.includes('valid email') || msg.includes('email address'))
    return 'Please enter a valid email address.';
  if(msg.includes('expired') || msg.includes('token'))
    return 'Your session expired. Please sign in again.';
  return 'Something went wrong. Please try again.';
}

// Client-side rate limiting — prevent form spam
// Wrapped in IIFE so _rlBuckets is not accessible from the console
const _rateLimit = (()=>{
  const _rlBuckets = {};
  return function(key, maxPerMin = 5){
    const now = Date.now();
    if(!_rlBuckets[key]) _rlBuckets[key] = [];
    _rlBuckets[key] = _rlBuckets[key].filter(t => now - t < 60000);
    if(_rlBuckets[key].length >= maxPerMin) return false;
    _rlBuckets[key].push(now);
    return true;
  };
})();

// Error logging — captures unexpected errors silently in background
const _appErrors = [];
function _logError(context, err){
  const entry = { context, msg: String(err?.message || err), ts: new Date().toISOString() };
  console.warn('[App Error]', entry);
  _appErrors.unshift(entry);
  if(_appErrors.length > 30) _appErrors.pop();
}
// Global uncaught error handlers
window.onerror = (msg, src, line, col, err) => { _logError('uncaught', err || msg); return false; };
window.onunhandledrejection = (e) => { _logError('promise', e.reason); };

// ── PASSWORD STRENGTH ────────────────────
function _pwStrength(pw){
  let score = 0;
  if(pw.length >= 8)  score++;
  if(pw.length >= 12) score++;
  if(/[0-9]/.test(pw)) score++;
  if(/[A-Z]/.test(pw)) score++;
  if(/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
function _updatePwStrength(){
  const tab = document.getElementById('login-screen')?.dataset?.tab || 'login';
  const strengthEl = document.getElementById('ls-pw-strength');
  if(!strengthEl) return;
  if(tab !== 'signup'){ strengthEl.style.display = 'none'; return; }
  const pw = document.getElementById('ls-password')?.value || '';
  if(!pw){ strengthEl.style.display = 'none'; return; }
  strengthEl.style.display = 'block';
  const score = _pwStrength(pw);
  const configs = [
    { w:'20%', bg:'#e74c3c', text:'Weak — try adding numbers or symbols' },
    { w:'45%', bg:'#e67e22', text:'Fair — getting better' },
    { w:'70%', bg:'#f1c40f', text:'Good' },
    { w:'100%', bg:'#27ae60', text:'Strong ✓' },
  ];
  const cfg = configs[Math.max(0, score - 1)];
  const bar = document.getElementById('ls-pw-bar');
  const lbl = document.getElementById('ls-pw-label');
  bar.style.width = cfg.w;
  bar.style.background = cfg.bg;
  lbl.textContent = cfg.text;
  lbl.style.color = cfg.bg;
}

// ── RESEND CONFIRMATION EMAIL ────────────
let _lsLastSignupEmail = '';
async function _lsResend(){
  if(!_supa || !_lsLastSignupEmail) return;
  const msgEl = document.getElementById('ls-msg');
  try{
    const { error } = await _supa.auth.resend({ type:'signup', email:_lsLastSignupEmail });
    if(error){ msgEl.style.color='#e74c3c'; msgEl.textContent='⚠️ ' + _friendlyError(error); }
    else { msgEl.style.color='#27ae60'; msgEl.textContent='✅ Confirmation email resent!'; }
  } catch(e){
    msgEl.style.color='#e74c3c'; msgEl.textContent='⚠️ ' + _friendlyError(e);
  }
}

// ── PARENT SESSION TIMEOUT ───────────────
const PARENT_SESSION_MINS = 2;
let _parentTimerInterval = null;
let _parentSessionTs = 0; // in-memory mirror of PARENT_UNLOCK_KEY timestamp

function _startParentSession(){
  clearInterval(_parentTimerInterval);
  _parentTimerInterval = setInterval(()=>{
    if(!isParentUnlocked()){
      clearInterval(_parentTimerInterval);
      _parentTimerInterval = null;
      _parentSessionTs = 0; // clear in-memory flag
      if(typeof _stopPinPoll === 'function') _stopPinPoll(); // ensure PIN poll is cleaned up
      // Session expired — auto-lock, but only redirect if still on parent-screen
      const panel = document.getElementById('parent-panel');
      if(panel) panel.style.display = 'none';
      const psEl = document.getElementById('parent-screen');
      const prEl = document.getElementById('progress-report-modal');
      const onParentScreen = psEl && psEl.classList.contains('on');
      const progressReportOpen = prEl && prEl.style.display !== 'none' && prEl.style.display !== '';
      if(onParentScreen && !progressReportOpen){
        show('settings-screen');
        const _se2 = document.getElementById('settings-screen');
        if(_se2 && _se2._savedScrollTop) requestAnimationFrame(()=>{ _se2.scrollTop = _se2._savedScrollTop; });
      }
      showLockToast(_ICO.parentLock + ' Parent session expired — locked.');
    } else {
      _updateParentTimerDisplay();
    }
  }, 15000); // check every 15 seconds
  _updateParentTimerDisplay();
}

function _updateParentTimerDisplay(){
  const stored = localStorage.getItem(PARENT_UNLOCK_KEY);
  if(!stored) return;
  const ts = parseInt(stored);
  if(isNaN(ts)) return;
  const remainSecs = Math.max(0, PARENT_SESSION_MINS * 60 - Math.floor((Date.now() - ts) / 1000));
  const mins = Math.floor(remainSecs / 60);
  const secs = remainSecs % 60;
  const el = document.getElementById('parent-session-timer');
  if(el){
    el.textContent = remainSecs > 60
      ? `⏱ Session expires in ${mins}m ${secs.toString().padStart(2,'0')}s`
      : `⚠️ Session expires in ${remainSecs}s`;
    el.style.color = remainSecs <= 60 ? '#e74c3c' : 'var(--txt2)';
  }
}

// ── PIN SECURITY ─────────────────────────
// Legacy SHA-256 hash — used only for silent migration of pre-v2 stored hashes
async function _hashPinLegacy(pin){
  const encoder = new TextEncoder();
  const data = encoder.encode(String(pin) + 'mymathroots_pin_salt_2025');
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// PBKDF2 hash with wb_app_secret — 100k iterations, device-specific entropy
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

// Save PIN as a PBKDF2 hash; mark version so _verifyPin skips legacy path
async function _savePin(pin){
  const hash = await _hashPin(pin);
  localStorage.setItem(PARENT_PIN_KEY, hash);
  localStorage.setItem('wb_pin_v', '2');
}

// Returns true if a parent PIN has been explicitly set (i.e. a hash is stored)
function isPinSetup(){ return !!localStorage.getItem(PARENT_PIN_KEY); }

// Verify entered PIN against stored hash.
// wb_pin_v='2' → PBKDF2; absent/other → legacy SHA-256 (upgrades silently on success).
async function _verifyPin(entered){
  const stored = localStorage.getItem(PARENT_PIN_KEY);
  if(!stored || stored.length !== 64) return false;
  const ver = localStorage.getItem('wb_pin_v') || '1';
  try {
    if(ver === '2'){
      return (await _hashPin(entered)) === stored;
    } else {
      // Legacy SHA-256 path — migrate to PBKDF2 silently on success
      const legacyHash = await _hashPinLegacy(entered);
      if(legacyHash !== stored) return false;
      const newHash = await _hashPin(entered);
      localStorage.setItem(PARENT_PIN_KEY, newHash);
      localStorage.setItem('wb_pin_v', '2');
      return true;
    }
  } catch { return false; }
}

// ── DEVICE-SCOPED EMAIL ENCRYPTION (SEC-9) ───────────────────────────────────
// Generates or retrieves a random 256-bit AES-GCM key unique to this device/browser.
// The key is stored as hex in localStorage under wb_device_key.
// This protects stored emails from casual inspection (browser DevTools, screenshots,
// clipboard sniffing) without requiring a server-side session. The key never leaves
// the device and is not transmitted anywhere.
async function _getDeviceKey(){
  const HEX_KEY = 'wb_device_key';
  const hex = localStorage.getItem(HEX_KEY);
  let bytes;
  if(hex){
    bytes = new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
  } else {
    bytes = crypto.getRandomValues(new Uint8Array(32));
    const newHex = Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(HEX_KEY, newHex);
  }
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt','decrypt']);
}

// Encrypt a string → { iv: hex, data: hex } using the device key
async function _encryptStr(str){
  const key = await _getDeviceKey();
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, new TextEncoder().encode(str));
  const toHex = a => Array.from(new Uint8Array(a)).map(b => b.toString(16).padStart(2,'0')).join('');
  return { iv: toHex(iv), data: toHex(enc) };
}

// Decrypt { iv: hex, data: hex } back to the original string, or null on failure
async function _decryptStr(obj){
  try{
    const key   = await _getDeviceKey();
    const fromH = h => new Uint8Array(h.match(/.{2}/g).map(b => parseInt(b,16)));
    const dec   = await crypto.subtle.decrypt({ name:'AES-GCM', iv: fromH(obj.iv) }, key, fromH(obj.data));
    return new TextDecoder().decode(dec);
  } catch { return null; }
}

// One-time migration: upgrade any legacy plain-text email keys to encrypted form.
// Safe to call at boot — silently exits if nothing to migrate.
async function _migrateEmailStorage(){
  try{
    // Migrate mmr_email (Remember Me) → mmr_email_enc
    const plain = localStorage.getItem('mmr_email');
    if(plain){
      const enc = await _encryptStr(plain);
      localStorage.setItem('mmr_email_enc', JSON.stringify(enc));
      localStorage.removeItem('mmr_email');
    }
    // Migrate wb_lead email field if it's still plain text
    const leadRaw = localStorage.getItem('wb_lead');
    if(leadRaw){
      const lead = JSON.parse(leadRaw);
      if(lead && lead.email && !lead.emailEnc){
        const emailEnc = await _encryptStr(lead.email);
        const { email: _dropped, ...rest } = lead;
        localStorage.setItem('wb_lead', JSON.stringify({ ...rest, emailEnc }));
      }
    }
  } catch { /* silently ignore — migration is best-effort */ }
}

// SEC-2: Score signing — prevents tampered localStorage scores from reaching Supabase
function _scoreSig(entry){
  const secret = localStorage.getItem('wb_app_secret') || 'fallback';
  const str = (entry.qid||'') + ':' + (entry.pct||0) + ':' + (entry.id||0) + ':' + secret;
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}

function _scoreValid(entry){
  if(!entry._sig) return false;
  return entry._sig === _scoreSig(entry);
}
