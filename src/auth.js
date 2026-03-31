// ════════════════════════════════════════
//  SUPABASE — AUTH + SYNC
// ════════════════════════════════════════
const SUPA_URL = '%%SUPA_URL%%';
const SUPA_KEY = '%%SUPA_KEY%%';
const GOOGLE_CLIENT_ID = '%%GOOGLE_CLIENT_ID%%';
let _supa      = null;
let _supaUser  = null;
let _authLoading = false;

function _lsSetRole(role) {
  localStorage.setItem('mmr_user_role', role);
  var btnStudent = document.getElementById('ls-role-student');
  var btnParent  = document.getElementById('ls-role-parent');
  if (btnStudent) btnStudent.classList.toggle('active', role === 'student');
  if (btnParent)  btnParent.classList.toggle('active',  role === 'parent');
}

var _lsCardIdx = 0;

// ── Student login state ──────────────────────────────────────────────────
var _lsFamilyProfiles = null;   // cached Array<profile> from mmr_family_profiles
var _lsSelectedStudentId = null; // id of avatar currently highlighted
var _lsPinBuffer = [];           // digits entered so far (max 4)
var _STU_FAIL_KEY   = 'mmr_stud_fail_ts';
var _STU_FAIL_COUNT = 'mmr_stud_fail_count';
var _STU_MAX_FAILS  = 5;
var _STU_LOCK_MS    = 30000;

// ── Parent onboarding state ──────────────────────────────────────────────
var _obPinBuffer = [];
var _obSelectedEmoji = '🦁';
var _AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
var _AVATAR_COLORS = {
  '🦁': { from: '#f59e0b', to: '#f97316' },
  '🦋': { from: '#8b5cf6', to: '#ec4899' },
  '🐉': { from: '#06b6d4', to: '#3b82f6' },
  '🦊': { from: '#ef4444', to: '#f97316' },
  '🐬': { from: '#10b981', to: '#0ea5e9' },
  '🌟': { from: '#f59e0b', to: '#eab308' },
};

function _validateFamilyCode(code) {
  if (code == null || code === '') return false;
  return /^MMR-[A-Z0-9]{4}$/i.test(String(code));
}

function _lsEsc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _lsValidColor(val) {
  if (typeof val !== 'string') return '#f59e0b';
  var v = val.trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#f59e0b';
}

function _buildAvatarHtml(profiles, selectedId) {
  if (!profiles || !profiles.length) return '';
  return profiles.map(function(p) {
    var isSelected = p.id === selectedId;
    var ringStyle = isSelected
      ? 'border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 0 3px rgba(245,158,11,0.45),0 4px 12px rgba(0,0,0,0.3);opacity:1'
      : 'border:2.5px solid rgba(255,255,255,0.25);box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7';
    return '<div class="ls-avatar-item' + (isSelected ? ' ls-avatar-selected' : '') + '"'
      + ' data-action="_lsSelectAvatar" data-arg="' + _lsEsc(p.id) + '"'
      + ' data-id="' + _lsEsc(p.id) + '">'
      + '<div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,'
      + _lsValidColor(p.avatar_color_from) + ',' + _lsValidColor(p.avatar_color_to)
      + ');display:flex;align-items:center;justify-content:center;font-size:1.5rem;' + ringStyle + '">'
      + _lsEsc(p.avatar_emoji) + '</div>'
      + '<div style="font-size:.72rem;color:' + (isSelected ? '#fff' : 'rgba(255,255,255,0.65)') + ';font-weight:'
      + (isSelected ? '700' : '600') + ';margin-top:5px">' + _lsEsc(p.display_name) + '</div>'
      + '</div>';
  }).join('');
}

function _buildStudentCardHtml(profiles, selectedId, pinBuffer) {
  if (!profiles || !profiles.length) {
    return '<div style="padding:4px 0">'
      + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.08em;text-align:center;margin-bottom:10px">Enter your family code</div>'
      + '<input id="ls-family-code-inp" type="text" class="set-inp" placeholder="MMR-0000"'
      + ' maxlength="8" style="width:100%;text-align:center;letter-spacing:.15em;text-transform:uppercase;font-size:var(--fs-md);font-family:\'Boogaloo\',sans-serif;box-sizing:border-box;margin-bottom:12px">'
      + '<div id="ls-family-code-msg" style="font-size:.78rem;color:#f87171;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>'
      + '<button data-action="_lsFamilyCodeSetup" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);cursor:pointer;letter-spacing:.3px;touch-action:manipulation">Link This Device</button>'
      + '</div>';
  }
  var buf = Array.isArray(pinBuffer) ? pinBuffer : [];
  var selected = profiles.find(function(p) { return p.id === selectedId; }) || profiles[0];
  var selId = selected ? selected.id : null;
  var selName = selected ? _lsEsc(selected.display_name) : '';
  var dots = '';
  for (var i = 0; i < 4; i++) {
    dots += i < buf.length
      ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
      : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
  }
  var keys = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(function(d) {
    keys += '<button class="ls-pin-key" data-action="_lsPinKey" data-arg="' + d + '">' + d + '</button>';
  });
  keys += '<div></div>';
  keys += '<button class="ls-pin-key" data-action="_lsPinKey" data-arg="0">0</button>';
  keys += '<button class="ls-pin-key ls-pin-key-back" data-action="_lsPinBackspace">&#x232B;</button>';
  return '<div style="margin-bottom:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);letter-spacing:.08em;text-transform:uppercase;text-align:center;margin-bottom:10px">Who\'s playing?</div>'
    + '<div class="ls-avatar-row">' + _buildAvatarHtml(profiles, selId) + '</div>'
    + '</div>'
    + '<div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-align:center;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">' + selName + '\'s PIN</div>'
    + '<div id="ls-pin-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:14px">' + dots + '</div>'
    + '<div id="ls-pin-msg" style="font-size:.75rem;color:#f87171;text-align:center;min-height:1.1rem;margin-bottom:6px"></div>'
    + '<div class="ls-pin-keypad" id="ls-pin-keypad">' + keys + '</div>'
    + '<div style="margin-top:12px;text-align:center;font-size:.68rem;color:rgba(255,255,255,0.35)">'
    + 'New device? <span data-action="_lsClearFamilyCache" style="color:rgba(255,210,80,0.85);text-decoration:underline;cursor:pointer">Enter family code &#x2192;</span>'
    + '</div>'
    + '</div>';
}

function _lsRenderStudentCard() {
  var body = document.getElementById('ls-student-body');
  if (!body) return;
  if (!_lsFamilyProfiles) {
    try {
      var raw = localStorage.getItem('mmr_family_profiles');
      _lsFamilyProfiles = raw ? JSON.parse(raw) : [];
    } catch(e) { _lsFamilyProfiles = []; }
  }
  if (!_lsSelectedStudentId && _lsFamilyProfiles && _lsFamilyProfiles.length) {
    var last = localStorage.getItem('mmr_last_student_id');
    _lsSelectedStudentId = last || _lsFamilyProfiles[0].id;
  }
  body.innerHTML = _buildStudentCardHtml(_lsFamilyProfiles, _lsSelectedStudentId, _lsPinBuffer);
}

async function _lsFamilyCodeSetup() {
  var inp = document.getElementById('ls-family-code-inp');
  var msg = document.getElementById('ls-family-code-msg');
  if (!inp || !msg) return;
  var code = inp.value.trim().toUpperCase();
  if (!_validateFamilyCode(code)) {
    msg.textContent = 'Enter a valid family code (e.g. MMR-4829)';
    return;
  }
  msg.textContent = '';
  inp.disabled = true;

  if (!_supa) { msg.textContent = 'No connection — please try again.'; inp.disabled = false; return; }

  try {
    var timeout = new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); });
    var result = await Promise.race([
      _supa.rpc('get_profiles_by_family_code', { p_family_code: code }),
      timeout
    ]);
    if (result.error) throw result.error;
    var profiles = result.data || [];
    if (!profiles.length) {
      msg.textContent = 'Family code not found — check with your parent.';
      inp.disabled = false;
      return;
    }
    localStorage.setItem('mmr_family_profiles', JSON.stringify(profiles));
    _lsFamilyProfiles = profiles;
    _lsSelectedStudentId = profiles[0].id;
    _lsPinBuffer = [];
    _lsRenderStudentCard();
  } catch(e) {
    msg.textContent = 'Could not connect — check your internet and try again.';
    inp.disabled = false;
  }
}

function _lsSelectAvatar(studentId) {
  _lsSelectedStudentId = studentId;
  _lsPinBuffer = [];
  _lsRenderStudentCard();
}

function _lsPinKey(digit) {
  // Silently ignore input while locked out
  var _failCount = parseInt(localStorage.getItem(_STU_FAIL_COUNT) || '0');
  var _failTs    = parseInt(localStorage.getItem(_STU_FAIL_KEY)   || '0');
  if (_failCount >= _STU_MAX_FAILS && (Date.now() - _failTs) < _STU_LOCK_MS) return;
  if (_lsPinBuffer.length >= 4) return;
  _lsPinBuffer.push(String(digit));
  var dots = document.getElementById('ls-pin-dots');
  if (dots) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < _lsPinBuffer.length
        ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
        : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
    dots.innerHTML = html;
  }
  if (_lsPinBuffer.length === 4) _lsStudentLogin();
}

function _lsPinBackspace() {
  if (!_lsPinBuffer.length) return;
  _lsPinBuffer.pop();
  var dots = document.getElementById('ls-pin-dots');
  if (dots) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < _lsPinBuffer.length
        ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
        : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
    dots.innerHTML = html;
  }
}

async function _lsStudentLogin() {
  var msg = document.getElementById('ls-pin-msg');

  var failCount = parseInt(localStorage.getItem(_STU_FAIL_COUNT) || '0');
  var failTs    = parseInt(localStorage.getItem(_STU_FAIL_KEY)   || '0');
  if (failCount >= _STU_MAX_FAILS) {
    var elapsed = Date.now() - failTs;
    if (elapsed < _STU_LOCK_MS) {
      var secs = Math.ceil((_STU_LOCK_MS - elapsed) / 1000);
      if (msg) msg.textContent = 'Too many attempts. Try again in ' + secs + 's.';
      _lsPinBuffer = [];
      return;
    }
    localStorage.removeItem(_STU_FAIL_COUNT);
    localStorage.removeItem(_STU_FAIL_KEY);
    failCount = 0;
  }

  var profile = _lsFamilyProfiles && _lsFamilyProfiles.find(function(p) { return p.id === _lsSelectedStudentId; });
  if (!profile) { _lsPinBuffer = []; return; }

  var entered = _lsPinBuffer.join('');
  var enteredHash = await _hashPin(entered);

  if (enteredHash === profile.pin_hash) {
    localStorage.removeItem(_STU_FAIL_COUNT);
    localStorage.removeItem(_STU_FAIL_KEY);
    localStorage.setItem('mmr_active_student_id', profile.id);
    localStorage.setItem('mmr_last_student_id', profile.id);
    localStorage.setItem('mmr_user_role', 'student');
    _lsPinBuffer = [];
    show('home');
    buildHome();
    _installHistoryGuard();
    setTimeout(tutCheckAndShow, 1500);
  } else {
    var newCount = failCount + 1;
    localStorage.setItem(_STU_FAIL_COUNT, String(newCount));
    localStorage.setItem(_STU_FAIL_KEY, String(Date.now()));
    _lsPinBuffer = [];
    if (msg) {
      var remaining = _STU_MAX_FAILS - newCount;
      msg.textContent = remaining > 0
        ? 'Wrong PIN. ' + remaining + ' attempt' + (remaining === 1 ? '' : 's') + ' left.'
        : 'Locked for 30 seconds.';
    }
    var dotsEl = document.getElementById('ls-pin-dots');
    if (dotsEl) {
      dotsEl.classList.add('ls-pin-shake');
      setTimeout(function() { dotsEl.classList.remove('ls-pin-shake'); }, 450);
      var emptyDots = '';
      for (var i = 0; i < 4; i++) emptyDots += '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
      setTimeout(function() { if (dotsEl) dotsEl.innerHTML = emptyDots; }, 450);
    }
  }
}

function _lsClearFamilyCache() {
  localStorage.removeItem('mmr_family_profiles');
  localStorage.removeItem('mmr_last_student_id');
  _lsFamilyProfiles = [];
  _lsSelectedStudentId = null;
  _lsPinBuffer = [];
  _lsRenderStudentCard();
}

async function _lsCheckOnboarding() {
  if (!_supa || !_supaUser) return;
  var role = localStorage.getItem('mmr_user_role');
  if (role !== 'parent') return;
  try {
    var result = await Promise.race([
      _supa.from('student_profiles').select('id', { count: 'exact', head: true }).eq('parent_id', _supaUser.id),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 5000); })
    ]);
    if (result.error) return;
    var count = result.count || 0;
    if (count === 0) _lsShowOnboarding();
  } catch(e) { /* silently skip if offline */ }
}

function _lsShowOnboarding() {
  var existing = document.getElementById('ls-onboard-modal');
  if (existing) return;
  _obPinBuffer = [];
  _obSelectedEmoji = '🦁';

  var modal = document.createElement('div');
  modal.id = 'ls-onboard-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';

  modal.innerHTML = '<div style="background:#fff;border-radius:24px;padding:24px;max-width:360px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.4);max-height:90vh;overflow-y:auto">'
    + '<div id="ls-onboard-step1">'
    + '<h2 style="font-family:\'Boogaloo\',sans-serif;font-size:1.3rem;color:#263238;margin-bottom:4px;text-align:center">Set up your first student profile</h2>'
    + '<p style="font-size:.82rem;color:#90a4ae;text-align:center;margin-bottom:16px">You can add more students later from the dashboard.</p>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Student Name *</label>'
    + '<input id="ls-ob-name" type="text" maxlength="20" placeholder="e.g. Cameron" class="set-inp" style="width:100%;box-sizing:border-box;margin-bottom:12px;font-size:.95rem">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="ls-ob-age" type="number" min="4" max="18" placeholder="e.g. 7" class="set-inp" style="width:100%;box-sizing:border-box;margin-bottom:12px;font-size:.95rem">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Pick an avatar</label>'
    + '<div id="ls-ob-avatars" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">'
    + _AVATAR_EMOJIS.map(function(e) {
        var c = _AVATAR_COLORS[e];
        return '<div data-action="_lsObSelectEmoji" data-arg="' + _lsEsc(e) + '"'
          + ' id="ls-ob-av-' + e.codePointAt(0) + '"'
          + ' style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,' + c.from + ',' + c.to + ');display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;border:' + (e === '🦁' ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Create a 4-digit PIN</label>'
    + '<div id="ls-ob-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px">'
    + '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.12);border:1.5px solid rgba(0,0,0,0.18)"></div>'.repeat(4)
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px" id="ls-ob-keypad">'
    + ['1','2','3','4','5','6','7','8','9'].map(function(d){ return '<button data-action="_lsObPinKey" data-arg="' + d + '" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;color:#263238;cursor:pointer">' + d + '</button>'; }).join('')
    + '<div></div>'
    + '<button data-action="_lsObPinKey" data-arg="0" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;color:#263238;cursor:pointer">0</button>'
    + '<button data-action="_lsObPinBack" style="background:#fce4ec;border:1px solid #ffcdd2;border-radius:10px;padding:12px 0;font-size:1rem;color:#c62828;cursor:pointer">&#x232B;</button>'
    + '</div>'
    + '<div id="ls-ob-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:8px"></div>'
    + '<button id="ls-ob-save-btn" data-action="_lsObSave" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#1565C0,#0d47a1);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Create Profile</button>'
    + '</div>'
    + '<div id="ls-onboard-step2" style="display:none;text-align:center">'
    + '<div style="font-size:2.5rem;margin-bottom:8px">&#x1F3E0;</div>'
    + '<h2 style="font-family:\'Boogaloo\',sans-serif;font-size:1.3rem;color:#263238;margin-bottom:4px">Your family code</h2>'
    + '<div id="ls-ob-family-code" style="font-family:\'Boogaloo\',sans-serif;font-size:2rem;color:#1565C0;letter-spacing:.15em;padding:12px;background:#e3f2fd;border-radius:14px;margin:14px 0"></div>'
    + '<p style="font-size:.82rem;color:#90a4ae;margin-bottom:20px">Enter this code once on your child\'s device to link it.</p>'
    + '<button data-action="_lsObDone" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#1565C0,#0d47a1);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer">Done</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(modal);
}

function _lsObSelectEmoji(emoji) {
  _obSelectedEmoji = emoji;
  _AVATAR_EMOJIS.forEach(function(e) {
    var el = document.getElementById('ls-ob-av-' + e.codePointAt(0));
    if (el) el.style.border = e === emoji ? '3px solid #1565C0' : '3px solid transparent';
  });
}

function _lsObPinKey(digit) {
  if (_obPinBuffer.length >= 4) return;
  _obPinBuffer.push(String(digit));
  _lsObUpdateDots();
  if (_obPinBuffer.length === 4) {
    var btn = document.getElementById('ls-ob-save-btn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
  }
}

function _lsObPinBack() {
  if (!_obPinBuffer.length) return;
  _obPinBuffer.pop();
  _lsObUpdateDots();
  var btn = document.getElementById('ls-ob-save-btn');
  if (btn && _obPinBuffer.length < 4) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

function _lsObUpdateDots() {
  var dotsEl = document.getElementById('ls-ob-dots');
  if (!dotsEl) return;
  var html = '';
  for (var i = 0; i < 4; i++) {
    html += i < _obPinBuffer.length
      ? '<div style="width:14px;height:14px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,0.5)"></div>'
      : '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.12);border:1.5px solid rgba(0,0,0,0.18)"></div>';
  }
  dotsEl.innerHTML = html;
}

async function _lsObSave() {
  var msg = document.getElementById('ls-ob-msg');
  var nameInp = document.getElementById('ls-ob-name');
  var ageInp  = document.getElementById('ls-ob-age');
  if (!nameInp || !msg) return;

  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Please enter a student name.'; return; }
  if (_obPinBuffer.length < 4) { msg.textContent = 'Please enter a 4-digit PIN.'; return; }
  if (!_supa || !_supaUser) { msg.textContent = 'Not signed in.'; return; }

  msg.textContent = '';
  var saveBtn = document.getElementById('ls-ob-save-btn');
  if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.style.pointerEvents = 'none'; }

  try {
    var pinHash = await _hashPin(_obPinBuffer.join(''));
    var avatarColors = _AVATAR_COLORS[_obSelectedEmoji] || { from: '#f59e0b', to: '#f97316' };
    var ageVal = ageInp ? parseInt(ageInp.value) || null : null;
    var username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'student';

    var insertResult = await Promise.race([
      _supa.from('student_profiles').insert({
        parent_id: _supaUser.id,
        username: username,
        display_name: name,
        age: ageVal,
        avatar_emoji: _obSelectedEmoji,
        avatar_color_from: avatarColors.from,
        avatar_color_to: avatarColors.to,
        pin_hash: pinHash,
      }).select('id').single(),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (insertResult.error) throw insertResult.error;

    var codeResult = await Promise.race([
      _supa.rpc('ensure_family_code', { p_parent_id: _supaUser.id }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    var familyCode = (codeResult && codeResult.data) ? codeResult.data : 'MMR-????';

    var step1 = document.getElementById('ls-onboard-step1');
    var step2 = document.getElementById('ls-onboard-step2');
    var codeEl = document.getElementById('ls-ob-family-code');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    if (codeEl) codeEl.textContent = familyCode;
  } catch(e) {
    if (msg) msg.textContent = e.message && e.message.includes('unique') ? 'A student with that name already exists.' : 'Error saving profile. Please try again.';
    if (saveBtn) { saveBtn.textContent = 'Create Profile'; saveBtn.style.pointerEvents = ''; }
  }
}

function _lsObDone() {
  var modal = document.getElementById('ls-onboard-modal');
  if (modal) modal.remove();
  window.location.href = '/dashboard/dashboard.html';
}

function _lsCarouselGo(idx) {
  idx = parseInt(idx, 10) || 0;
  var track = document.getElementById('ls-carousel-track');
  if (track) track.style.transform = 'translateX(' + (-50 * idx) + '%)';
  // Move shared form to the active card's mount point
  var form = document.getElementById('ls-form-shared');
  var mount = document.getElementById('ls-mount-' + idx);
  if (form && mount) mount.appendChild(form);
  // Update dot indicators
  document.querySelectorAll('.ls-dot').forEach(function(dot, i) {
    dot.classList.toggle('active', i === idx);
  });
  _lsCardIdx = idx;
  _lsSetRole(idx === 0 ? 'student' : 'parent');
  if (idx === 0) _lsRenderStudentCard();
  // Hide guest button on Parent/Teacher card — dashboard requires an account
  var guestBtn = document.getElementById('ls-guest-btn');
  if (guestBtn) guestBtn.style.display = idx === 0 ? '' : 'none';
}

function _lsInitCarousel() {
  var track = document.getElementById('ls-carousel-track');
  if (!track || track._carouselInited) return;
  track._carouselInited = true;
  var startX = 0;
  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) _lsCarouselGo(dx < 0 ? 1 : 0);
  }, { passive: true });
}

function _dismissSplash(fadeInId){
  const splash = document.getElementById('auth-splash');
  if(fadeInId){
    const el = document.getElementById(fadeInId);
    if(el){
      el.style.transition = 'opacity 0.9s ease';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.style.opacity='1'; }));
      setTimeout(()=>{ el.style.transition=''; el.style.opacity=''; }, 1000);
    }
  }
  if(splash){ splash.style.opacity='0'; setTimeout(()=>{ splash.style.display='none'; },950); }
}

// ── History guard ──────────────────────────────────────────────────────────
// After Google OAuth, the browser history contains OAuth/callback URLs.
// iOS's native edge-swipe navigates that history, showing the auth page
// mid-transition. This guard replaces those entries and intercepts popstate
// so the browser never leaves the app.
let _historyGuardInstalled = false;
function _installHistoryGuard(){
  if(_historyGuardInstalled) return;
  _historyGuardInstalled = true;
  const url = location.pathname + location.search;
  // Overwrite any OAuth redirect URLs in history with the clean app URL
  history.replaceState({mmr:1}, '', url);
  // Push a guard entry so popstate always has somewhere safe to land
  history.pushState({mmr:1}, '', url);
  // Re-push whenever the browser tries to go back (iOS native swipe or back btn)
  // If a modal is open, close it instead of navigating away.
  window.addEventListener('popstate', function(){
    history.pushState({mmr:1}, '', url);
    const modals = [
      { id:'scal-modal',   close: _closeStreakCal   },
      { id:'access-modal', close: closeAccessModal },
      { id:'timer-modal',  close: closeTimerModal  },
      { id:'a11y-modal',   close: closeA11yModal   },
      { id:'pin-modal',    close: closePinModal     },
    ];
    for(const m of modals){
      const el = document.getElementById(m.id);
      if(el && el.style.display === 'flex'){ m.close(); return; }
    }
  });
}

function supabaseInit(){
  if(typeof supabase === 'undefined' || !SUPA_URL || !SUPA_KEY){
    // CDN failed or credentials not set — dismiss splash and show login so user isn't stuck
    const _lscrCdn = document.getElementById('login-screen'); if(_lscrCdn) _lscrCdn.style.opacity='0';
    show('login-screen');
    _lsInitCarousel();
    _lsRenderStudentCard();
    _dismissSplash('login-screen');
    return;
  }
  _supa = supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

  _supa.auth.onAuthStateChange(async (event, session) => {
    _supaUser = session ? session.user : null;
    updateAccountUI();
    if(event === 'INITIAL_SESSION'){
      if(_supaUser){
        // Keep splash up — fetch all data first, then reveal fully-loaded home
        await _pullOnLogin();
        var _role1 = localStorage.getItem('mmr_user_role');
        if (_role1 === 'parent') {
          window.location.href = '/dashboard/dashboard.html';
          return;
        }
        show('home');
        _dismissSplash();
        _installHistoryGuard();
        setTimeout(tutCheckAndShow, 1500);
      } else {
        // Local preview mode: only auto-seed a fake user when ?preview=1 is in the URL.
        // Without it, show the real login screen so guest UX can be tested accurately.
        const _isLocal = ['localhost','127.0.0.1'].includes(location.hostname) || /^192\.168\./.test(location.hostname);
        const _previewMode = _isLocal && new URLSearchParams(location.search).get('preview') === '1';
        if(_previewMode){
          const _tsN = parseInt(new URLSearchParams(location.search).get('testStreak')) || 7;
          _supaUser = { id:'preview', email:'preview@test.com' };
          STREAK.current = _tsN; STREAK.longest = _tsN + 5; STREAK.lastDate = new Date().toISOString().slice(0,10);
          const _tsDates = [];
          for(let i=0;i<_tsN;i++) _tsDates.push(new Date(Date.now()-i*86400000).toISOString().slice(0,10));
          localStorage.setItem('wb_act_dates', JSON.stringify(_tsDates));
          show('home'); buildHome(); _renderStreak(); _installHistoryGuard();
        } else {
          const _lscr = document.getElementById('login-screen'); if(_lscr) _lscr.style.opacity='0';
          show('login-screen'); _initOneTap(); _lsInitCarousel();
          _lsRenderStudentCard();
          _dismissSplash('login-screen');
          return;
        }
        _dismissSplash();
      }
    } else if(event === 'SIGNED_IN'){
      // User just signed in from login screen — show home with local data immediately,
      // then sync server data silently in the background
      var _role2 = localStorage.getItem('mmr_user_role');
      if (_role2 === 'parent') {
        window.location.href = '/dashboard/dashboard.html';
        return;
      }
      show('home');
      buildHome();
      _installHistoryGuard();
      setTimeout(tutCheckAndShow, 1500);
      _pullOnLogin(); // silent background sync, no await
    } else if(event === 'SIGNED_OUT'){
      _clearUserData();
      show('login-screen');
      _initOneTap();
    }
  });
}

// ── ANONYMOUS SESSION TRACKING ───────────
// _trackAnonSession() REMOVED — COPPA compliance.
// This K-5 app must not generate persistent device identifiers or log
// referrer URLs for unauthenticated users (who may be children) before
// parental consent is obtained.  Supabase RPC log_anon_session is no
// longer called for guests.  Authenticated-user activity is tracked via
// _pullOnLogin() which runs only after a parent has signed in.
function _continueAsGuest() {
  // Purge any legacy device IDs written by older app versions
  localStorage.removeItem('wb_device_id');
  localStorage.removeItem('wb_anon_tracked');
  // Show consent gate before entering guest mode
  _showSoftGate();
}

function _proceedAsGuest() {
  document.getElementById('soft-gate-modal')?.remove();
  buildHome();
  show('home');
  // Lock the screen immediately if install/tutorial hasn't been shown yet,
  // so the user can't scroll or tap unit cards during the delay.
  if(!localStorage.getItem('install_seen') || !localStorage.getItem('wb_tutorial_v2')){
    _onboardingActive = true;
    document.body.classList.add('tut-active');
  }
  setTimeout(tutCheckAndShow, 1500);
}

// ── LOGIN SCREEN functions ────────────────
let _lsLoading = false;

let _oneTapReady = false;
let _oneTapNonce = null;
let _oneTapRetries = 0;
const _ONE_TAP_MAX_RETRIES = 15; // max ~6 seconds
async function _initOneTap(){
  if(typeof google === 'undefined'){
    if(++_oneTapRetries > _ONE_TAP_MAX_RETRIES) return; // give up — Google script didn't load
    setTimeout(_initOneTap, 400); return;
  }
  _oneTapRetries = 0; // reset for future calls
  if(!_supa) return;
  if(GOOGLE_CLIENT_ID.includes('%%')) { console.warn('[Auth] GOOGLE_CLIENT_ID not configured'); return; }
  if(!_oneTapReady){
    _oneTapReady = true;
    // Generate nonce — hashed version goes to Google, raw version to Supabase
    const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    _oneTapNonce = raw;
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const hashed = Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      nonce: hashed,
      use_fedcm_for_prompt: true,
      callback: async ({ credential }) => {
        const { error } = await _supa.auth.signInWithIdToken({ provider:'google', token:credential, nonce:_oneTapNonce });
        if(error){ const m=document.getElementById('ls-msg'); if(m) m.textContent=error.message; }
      }
    });
  }
  google.accounts.id.prompt();
}

async function _lsOAuth(provider){
  const msg = document.getElementById('ls-msg');
  if(msg) msg.textContent = '';
  if(!_supa){
    if(msg){ msg.style.color='#e74c3c'; msg.textContent='⚠️ Not connected. Please wait and try again.'; }
    return;
  }
  // Show loading state on the button
  const btn = [...document.querySelectorAll('#login-screen button')].find(b => (b.getAttribute('onclick')||'').includes(`_lsOAuth('${provider}')`));
  const origHTML = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled = true; btn.style.opacity='0.65'; btn.textContent='Connecting…'; }
  if(msg){ msg.style.color='#4a90d9'; msg.textContent='Redirecting to Google…'; }
  try {
    const { error } = await _supa.auth.signInWithOAuth({
      provider,
      options:{ redirectTo: location.origin + '/' }
    });
    if(error){
      if(msg){ msg.style.color='#e74c3c'; msg.textContent='⚠️ ' + error.message; }
      if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.innerHTML=origHTML; }
    }
    // No error = browser is redirecting, leave button disabled
  } catch(e){
    if(msg){ msg.style.color='#e74c3c'; msg.textContent='⚠️ Sign in failed. Please try again.'; }
    if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.innerHTML=origHTML; }
  }
}

function _lsSwitchTab(tab){
  const isSignup = tab === 'signup';
  document.getElementById('ls-tab-login').className  = 'auth-tab-btn ' + (isSignup?'idle':'active');
  document.getElementById('ls-tab-signup').className = 'auth-tab-btn ' + (isSignup?'active':'idle');
  document.getElementById('ls-name-row').style.display    = isSignup ? 'block' : 'none';
  document.getElementById('ls-consent-row').style.display = isSignup ? 'block' : 'none';
  document.getElementById('ls-submit-btn').textContent   = isSignup ? 'Create Account' : 'Sign In';
  document.getElementById('login-screen').dataset.tab    = tab;
  document.getElementById('ls-msg').textContent          = '';
  document.getElementById('ls-pw-strength').style.display = 'none';
  document.getElementById('ls-resend-row').style.display  = 'none';
  const pwInp = document.getElementById('ls-password');
  pwInp.value = ''; pwInp.type = 'password';
  const pwToggle = document.getElementById('ls-pw-toggle');
  if(pwToggle){ pwToggle.innerHTML = _ICO.eyeOn; pwToggle.setAttribute('aria-label','Show password'); }
  const forgotRow = document.getElementById('ls-forgot-row');
  if(forgotRow) forgotRow.style.display = isSignup ? 'none' : 'block';
  // Update placeholder text for password field
  document.getElementById('ls-password').placeholder = isSignup ? 'Password (min 8 characters)' : 'Password';
}

async function _lsForgotPassword(){
  if(!_supa) return;
  const msgEl = document.getElementById('ls-msg');
  const email = document.getElementById('ls-email').value.trim();
  if(!email){
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ Enter your email address above first.';
    document.getElementById('ls-email').focus();
    return;
  }
  msgEl.style.color = '#4a90d9';
  msgEl.textContent = 'Sending reset link…';
  const { error } = await _supa.auth.resetPasswordForEmail(email, {
    redirectTo: location.origin
  });
  if(error){
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ ' + error.message;
  } else {
    msgEl.style.color = '#27ae60';
    msgEl.textContent = '✅ Reset link sent — check your email!';
  }
}

// ── Password show/hide toggle ─────────────
function _lsTogglePw(){
  const inp = document.getElementById('ls-password');
  const btn = document.getElementById('ls-pw-toggle');
  if(!inp || !btn) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show ? _ICO.eyeOff : _ICO.eyeOn;
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}

// ── Turnstile token state ─────────────────
let _turnstileToken = null;
function _onTurnstileSuccess(token){ _turnstileToken = token; }
function _onTurnstileExpired(){ _turnstileToken = null; }
function _resetTurnstile(){
  _turnstileToken = null;
  if(window.turnstile) window.turnstile.reset('#ls-turnstile .cf-turnstile');
}

async function _lsSubmit(){
  if(!_supa || _lsLoading) return;
  const tab      = document.getElementById('login-screen').dataset.tab || 'login';
  const email    = document.getElementById('ls-email').value.trim();
  const password = document.getElementById('ls-password').value;
  const msgEl    = document.getElementById('ls-msg');
  msgEl.style.color = '#e74c3c';
  // Honeypot — bots fill hidden fields, humans don't. Silently block.
  if(document.getElementById('ls-hp')?.value){ return; }
  // Rate limit — max 5 attempts per minute
  if(!_rateLimit('login', 5)){
    msgEl.textContent = '⚠️ Too many attempts. Please wait a moment.';
    return;
  }
  if(!email || !password){ msgEl.textContent='⚠️ Please enter email and password.'; return; }
  if(!_validEmail(email)){ msgEl.textContent='⚠️ Please enter a valid email address.'; return; }
  if(tab === 'signup'){
    if(password.length < 8){ msgEl.textContent='⚠️ Password must be at least 8 characters.'; return; }
    if(_pwStrength(password) < 1){ msgEl.textContent='⚠️ Password is too weak — add numbers or symbols.'; return; }
    const nameVal = _sanitize(document.getElementById('ls-name').value, 30);
    if(!nameVal){ msgEl.textContent='⚠️ Please enter your name.'; document.getElementById('ls-name').focus(); return; }
    const consentEl = document.getElementById('ls-consent');
    if(!consentEl?.checked){
      msgEl.textContent='⚠️ Please confirm you are a parent or guardian.';
      const label = document.getElementById('ls-consent-label');
      if(label) label.style.borderColor = '#e74c3c';
      consentEl?.focus();
      return;
    }
  } else {
    if(password.length < 6){ msgEl.textContent='⚠️ Password must be at least 6 characters.'; return; }
  }
  // Turnstile CAPTCHA — must be verified before submitting
  if(!_turnstileToken){
    msgEl.textContent = '⚠️ Please complete the security check above.';
    return;
  }
  _lsLoading = true;
  const btn = document.getElementById('ls-submit-btn');
  const origTxt = btn.textContent;
  btn.textContent = '…';
  msgEl.style.color = '#4a90d9';
  msgEl.textContent = tab==='signup' ? 'Creating account…' : 'Signing in…';
  try{
    let result;
    if(tab === 'signup'){
      const displayName = _sanitize(document.getElementById('ls-name').value, 30) || 'Student';
      result = await _supa.auth.signUp({
        email, password,
        options: { data: { display_name:displayName }, captchaToken: _turnstileToken }
      });
    } else {
      result = await _supa.auth.signInWithPassword({
        email, password,
        options: { captchaToken: _turnstileToken }
      });
    }
    _resetTurnstile(); // always reset after use — token is single-use
    // Notify on new signup (fire-and-forget)
    if(!result.error && tab === 'signup'){
      const _dn = _sanitize(document.getElementById('ls-name')?.value||'', 30) || 'Student';
      _supa.functions.invoke('notify-new-signup', { body: { email, display_name: _dn } }).catch(()=>{});
    }
    // Remember email preference — SEC-9: store encrypted, never plain text
    if(!result.error && tab === 'login'){
      const rem = document.getElementById('ls-remember');
      if(rem?.checked){
        _encryptStr(email).then(enc => localStorage.setItem('mmr_email_enc', JSON.stringify(enc))).catch(()=>{});
      } else {
        localStorage.removeItem('mmr_email_enc');
      }
    }
    if(result.error){
      msgEl.style.color = '#e74c3c';
      msgEl.textContent = '⚠️ ' + _friendlyError(result.error);
    } else if(tab==='signup' && !result.data.session){
      msgEl.style.color = '#27ae60';
      msgEl.textContent = '✅ Check your email to confirm your account!';
      _lsLastSignupEmail = email;
      document.getElementById('ls-resend-row').style.display = 'block';
    }
    // onAuthStateChange handles navigation to home on success
  } catch(e){
    _logError('lsSubmit', e);
    _resetTurnstile();
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ ' + _friendlyError(e);
  } finally {
    _lsLoading = false;
    btn.textContent = origTxt;
  }
}

async function _pullOnLogin(){
  if(!_supa || !_supaUser) return;
  // Skip sync if we already pulled within the last 5 minutes (handles page refreshes
  // and brief re-opens without hammering Supabase on every session restore).
  const _syncKey = 'wb_last_sync_' + _supaUser.id;
  const _lastSync = parseInt(localStorage.getItem(_syncKey) || '0');
  if(Date.now() - _lastSync < 5 * 60 * 1000) return;
  try{
    // Single RPC call replaces 3 separate queries — 1 round trip instead of 3.
    const _timeout = new Promise((_,rej) => setTimeout(() => rej(new Error('pull_timeout')), 5000));
    const { data: syncData, error: rpcErr } = await Promise.race([
      _supa.rpc('get_user_sync_data'),
      _timeout
    ]);
    if(rpcErr) throw rpcErr;
    const prog         = syncData?.progress   || null;
    const remoteScores = syncData?.scores      || [];
    const profile      = syncData?.profile     || null;
    localStorage.setItem(_syncKey, String(Date.now()));
    // ── Conflict resolution strategy ──────────────────────────────
    // localStorage is the source of truth for the current session.
    // On login we merge cloud data INTO local, then push local back
    // to cloud so both sides converge.
    //
    //   DONE   – union merge: Object.assign(local, cloud) keeps every
    //            key from both sides. Cloud overwrites matching keys;
    //            local-only keys survive. _pushDone() then sends the
    //            merged result back so cloud gains any offline work.
    //
    //   SCORES – append-only: remote scores whose local_id is missing
    //            locally get appended. Local scores are never removed
    //            or overwritten. _pushScores() uploads any local-only
    //            scores the server hasn't seen yet.
    //
    //   STREAK – last-writer-wins by date: server values are adopted
    //            when its last_activity_date >= local. longest_streak
    //            uses Math.max() so it can never decrease.
    // ───────────────────────────────────────────────────────────────

    // DONE — union merge (cloud into local, then push back)
    // Validate: must be a plain object with string keys and boolean-ish values
    if(prog && prog.done_json && typeof prog.done_json === 'object' && !Array.isArray(prog.done_json)){
      const safe = {};
      for(const [k,v] of Object.entries(prog.done_json)){
        if(typeof k === 'string' && k.length < 100 && k !== '__proto__' && k !== 'constructor' && k !== 'prototype') safe[k] = !!v;
      }
      Object.assign(DONE, safe);
      localStorage.setItem('wb_done5', JSON.stringify(DONE));
    }
    // SCORES — append-only dedup by local_id (both sides preserved)
    // Validate: each score must have required fields with correct types
    if(Array.isArray(remoteScores) && remoteScores.length){
      const localIds = new Set(SCORES.map(s => s.id));
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
      SCORES.push(...incoming);
      SCORES.sort((a,b) => b.id - a.id);
      if(SCORES.length > 200) SCORES.length = 200;
      localStorage.setItem('wb_sc5', JSON.stringify(SCORES));
    }
    // STREAK — last-writer-wins by date, longest never decreases
    // Validate: streak fields must be numbers, date must be string
    if(profile && typeof profile.current_streak === 'number' && profile.current_streak >= 0){
      const serverDate = typeof profile.last_activity_date === 'string' ? profile.last_activity_date : '';
      const serverLongest = typeof profile.longest_streak === 'number' ? profile.longest_streak : 0;
      if(!STREAK.lastDate || serverDate >= STREAK.lastDate){
        STREAK.current = profile.current_streak;
        STREAK.longest = Math.max(serverLongest, STREAK.longest);
        STREAK.lastDate = serverDate || STREAK.lastDate;
        localStorage.setItem('wb_streak', JSON.stringify(STREAK));
      }
    }
    // MASTERY — per-key merge: higher attempts wins; ties go to higher correct count
    if(prog && prog.mastery_json && typeof prog.mastery_json === 'object' && typeof MASTERY !== 'undefined'){
      let masteryChanged = false;
      for(const [k, cm] of Object.entries(prog.mastery_json)){
        if(!cm || typeof cm.attempts !== 'number') continue;
        const lm = MASTERY[k];
        if(!lm || cm.attempts > lm.attempts || (cm.attempts === lm.attempts && cm.correct > lm.correct)){
          MASTERY[k] = { attempts:cm.attempts, correct:cm.correct||0, lastSeen:cm.lastSeen||0 };
          masteryChanged = true;
        }
      }
      if(masteryChanged && typeof saveMastery === 'function') saveMastery();
    }

    // APP_TIME — take max totalSecs/sessions; merge dailySecs by max per day
    if(prog && prog.apptime_json && typeof prog.apptime_json === 'object' && typeof APP_TIME !== 'undefined'){
      const ct = prog.apptime_json;
      let appChanged = false;
      if(typeof ct.totalSecs === 'number' && ct.totalSecs > (APP_TIME.totalSecs||0)){
        APP_TIME.totalSecs = ct.totalSecs; appChanged = true;
      }
      if(typeof ct.sessions === 'number' && ct.sessions > (APP_TIME.sessions||0)){
        APP_TIME.sessions = ct.sessions; appChanged = true;
      }
      if(ct.dailySecs && typeof ct.dailySecs === 'object'){
        APP_TIME.dailySecs = APP_TIME.dailySecs || {};
        for(const [d, s] of Object.entries(ct.dailySecs)){
          if(typeof s === 'number' && s > (APP_TIME.dailySecs[d]||0)){
            APP_TIME.dailySecs[d] = s; appChanged = true;
          }
        }
      }
      if(appChanged && typeof saveAppTime === 'function') saveAppTime();
    }

    // Push local-only data back to cloud so both sides converge
    _pushDone();
    _pushScores();
    _pushMastery();
    _pushAppTime();
    updateSyncLabel();
    buildHome();
    await _lsCheckOnboarding();
  } catch(e){ console.warn('[Supabase] pull error', e); }
}

async function _pushDone(){
  if(!_supa || !_supaUser) return;
  try{
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, done_json:DONE, updated_at:new Date().toISOString() },
        { onConflict:'user_id' }
      ),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('pushDone timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] pushDone error', e); }
}

async function _pushMastery(){
  if(!_supa || !_supaUser) return;
  try{
    const mastery = (typeof MASTERY !== 'undefined') ? MASTERY : {};
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, mastery_json:mastery, updated_at:new Date().toISOString() },
        { onConflict:'user_id' }
      ),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('pushMastery timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] pushMastery error', e); }
}

async function _pushAppTime(){
  if(!_supa || !_supaUser) return;
  try{
    const appTime = (typeof APP_TIME !== 'undefined') ? APP_TIME : {};
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, apptime_json:appTime, updated_at:new Date().toISOString() },
        { onConflict:'user_id' }
      ),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('pushAppTime timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] pushAppTime error', e); }
}

function _fireSvg(pfx, w, h){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 38" width="${w}" height="${h}" style="display:inline-block;vertical-align:middle"><defs><radialGradient id="${pfx}g" cx="50%" cy="95%" r="55%"><stop offset="0%" stop-color="#ffb300" stop-opacity=".7"/><stop offset="100%" stop-color="#ff6600" stop-opacity="0"/></radialGradient><linearGradient id="${pfx}o" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#ff9500"/><stop offset="55%" stop-color="#ff5a00"/><stop offset="100%" stop-color="#e83200"/></linearGradient><linearGradient id="${pfx}m" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#ffcd3c"/><stop offset="100%" stop-color="#ff8c00"/></linearGradient><linearGradient id="${pfx}i" x1="40%" y1="0%" x2="60%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="100%" stop-color="#ffe033"/></linearGradient></defs><ellipse cx="16" cy="36" rx="9" ry="2.5" fill="url(#${pfx}g)"/><path d="M16,36 C9,33 5,27 5,20 C5,13.5 8.5,8.5 12,5.5 C11,9.5 11.5,13 13.5,15.5 C12,10.5 14,3 16,0 C16,0 18,7.5 16.5,13 C19,10.5 19.5,7 19,4.5 C22.5,7.5 27,13.5 27,20 C27,27 23,33 16,36Z" fill="url(#${pfx}o)"/><path d="M16,32 C11,29.5 9,25.5 9,21.5 C9,17.5 11,14.5 13,12.5 C12.5,15.5 13,18 14.5,20 C14,16.5 14.5,13 16,11 C16,11 17.5,15 17,19 C18.5,17 19,14.5 18.5,12 C20.5,14 23,17.5 23,21.5 C23,25.5 21,29.5 16,32Z" fill="url(#${pfx}m)"/><path d="M16,28 C13.5,26 12.5,23.5 12.5,21 C12.5,18.5 14,16.5 15,15 C15,17 15.5,18.5 16,20.5 C16.5,18.5 17,17 16,15 C17.5,16.5 19.5,18.5 19.5,21 C19.5,23.5 18.5,26 16,28Z" fill="url(#${pfx}i)"/></svg>`;
}

function _showDayDetail(dateStr){
  const modal = document.getElementById('scal-modal');
  if(!modal) return;
  modal.dataset.calView = 'day';
  const sheet = modal.querySelector('div');
  if(!sheet) return;

  const formatted = new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const dateLabel = new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const dayScores = SCORES.filter(s => s.date === formatted);

  const typeLabel = t => t==='lesson'?'Lesson':t==='unit_quiz'?'Unit Quiz':t==='final'?'Final Test':'Quiz';
  const typeColor = t => t==='lesson'?'#4a90d9':t==='unit_quiz'?'#27ae60':'#ff7700';

  let items = dayScores.length === 0
    ? `<div style="text-align:center;padding:28px 16px;color:var(--txt2,#888);font-size:var(--fs-base)">No quiz records found for this day.</div>`
    : dayScores.map(s => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.05);border-radius:14px;margin-bottom:8px">
        <div style="width:5px;min-width:5px;height:38px;border-radius:3px;background:${_escHtml(s.color||typeColor(s.type))}"></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:var(--fs-sm);color:var(--txt,#333);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_escHtml(s.label||s.qid)}</div>
          <div style="font-size:var(--fs-xs);color:var(--txt2,#888);margin-top:2px">${typeLabel(s.type)} &nbsp;·&nbsp; ${_escHtml(s.stars)} &nbsp;·&nbsp; ${_escHtml(s.time||'')}</div>
        </div>
        <div style="font-size:var(--fs-md);font-weight:900;color:${s.pct===100?'#27ae60':s.pct>=80?'#4a90d9':'#e06000'};font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">${s.pct}%</div>
      </div>`).join('');

  sheet.innerHTML = `
    <div style="width:40px;height:4px;background:rgba(0,0,0,.1);border-radius:2px;margin:0 auto 18px"></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <button data-action="_buildStreakCal" style="background:rgba(0,0,0,.07);border:none;width:34px;height:34px;border-radius:50%;font-size:var(--fs-lg);cursor:pointer;color:var(--txt2,#666);display:flex;align-items:center;justify-content:center;flex-shrink:0">‹</button>
      <div>
        <div style="font-weight:800;font-size:var(--fs-base);color:var(--txt,#333)">${dateLabel}</div>
        <div style="font-size:var(--fs-xs);color:var(--txt2,#888);margin-top:1px">${dayScores.length} activit${dayScores.length===1?'y':'ies'} completed</div>
      </div>
    </div>
    ${items}`;
}

function _renderStreak(){
  const el = document.getElementById('streak-badge');
  if(!el) return;
  if(!STREAK.current){ el.style.display = 'none'; return; }
  el.style.display = 'inline-block';
  el.style.cursor = 'pointer';
  el.onclick = _openStreakCal;
  const best = STREAK.longest > STREAK.current ? ` <span style="opacity:.65;font-weight:400">· Best: ${STREAK.longest}</span>` : '';
  el.innerHTML = `${_fireSvg('sfb',22,30)} <strong>${STREAK.current}-day streak</strong>${best}`;
}

// ── STREAK CALENDAR ───────────────────────────────────────────────────────────
let _scDate = new Date();

let _scalSwipeX = 0, _scalSwipeY = 0, _scalDragging = false, _scalPeeked = false, _scalDir = 0, _scalSwipeT = 0;
function _openStreakCal(){
  _scDate = new Date();
  let modal = document.getElementById('scal-modal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'scal-modal';
    Object.assign(modal.style,{position:'fixed',inset:'0',zIndex:'9950' /* --z-calendar */,display:'none',alignItems:'center',justifyContent:'center',padding:'20px'});
    modal.addEventListener('click', e => {
      if(e.target !== modal) return;
      if(modal.dataset.calView === 'day') _buildStreakCal();
      else _closeStreakCal();
    });

    // iOS-style drag-to-swipe month navigation
    modal.addEventListener('touchstart', e => {
      _scalSwipeX = e.touches[0].clientX;
      _scalSwipeY = e.touches[0].clientY;
      _scalDragging = false; _scalPeeked = false; _scalDir = 0; _scalSwipeT = Date.now();
    }, {passive:true});

    modal.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - _scalSwipeX;
      const dy = e.touches[0].clientY - _scalSwipeY;
      if(!_scalDragging && Math.abs(dx) < 8) return;
      if(!_scalDragging && Math.abs(dy) > Math.abs(dx)) return; // vertical scroll — ignore
      _scalDragging = true;

      const n = new Date();
      const isCur = _scDate.getFullYear()===n.getFullYear() && _scDate.getMonth()===n.getMonth();
      const wantDir = dx > 0 ? -1 : 1; // right=prev, left=next
      if(wantDir === 1 && isCur) return; // can't go past current month

      // Build peek element once per gesture
      if(!_scalPeeked){
        _scalDir = wantDir; _scalPeeked = true;
        const peekDate = new Date(_scDate.getFullYear(), _scDate.getMonth() + _scalDir, 1);
        const vp = document.getElementById('scal-viewport');
        if(vp){
          let peek = document.getElementById('scal-peek');
          if(!peek){ peek = document.createElement('div'); peek.id = 'scal-peek'; peek.style.cssText = 'position:absolute;top:0;left:0;width:100%;will-change:transform'; vp.appendChild(peek); }
          peek.innerHTML = _buildCalGridHTML(peekDate);
          const vpW = vp.offsetWidth;
          peek.style.transition = 'none';
          peek.style.transform = `translateX(${_scalDir===1 ? vpW : -vpW}px)`;
        }
      }
      if(_scalDir === 0) return;

      const slide = document.getElementById('scal-slide');
      const vp = document.getElementById('scal-viewport');
      const peek = document.getElementById('scal-peek');
      if(!slide || !vp) return;
      const vpW = vp.offsetWidth;
      const moveDx = _scalDir===1 ? Math.min(0, dx) : Math.max(0, dx); // clamp to valid direction
      slide.style.transition = 'none';
      slide.style.transform = `translateX(${moveDx}px)`;
      if(peek){ peek.style.transition = 'none'; peek.style.transform = `translateX(${(_scalDir===1 ? vpW : -vpW) + moveDx}px)`; }
    }, {passive:true});

    modal.addEventListener('touchend', e => {
      if(!_scalDragging || _scalDir===0){ _scalDragging=false; return; }
      const dx = e.changedTouches[0].clientX - _scalSwipeX;
      const slide = document.getElementById('scal-slide');
      const vp = document.getElementById('scal-viewport');
      const peek = document.getElementById('scal-peek');
      _scalDragging = false;
      if(!slide || !vp) return;
      const vpW = vp.offsetWidth;
      const gestureMs = Math.max(1, Date.now() - _scalSwipeT);
      const velocity = Math.abs(dx) / gestureMs; // px/ms
      const isFastSwipe = velocity > 0.3 && Math.abs(dx) > 20;
      const committed = Math.abs(dx) >= vpW * 0.5 || isFastSwipe;
      const ease = 'cubic-bezier(0.4,0,0.2,1)';
      if(committed){
        slide.style.transition = `transform 0.25s ${ease}`;
        slide.style.transform = `translateX(${_scalDir===1 ? -vpW : vpW}px)`;
        if(peek){ peek.style.transition = `transform 0.25s ${ease}`; peek.style.transform = 'translateX(0)'; }
        const commitDir = _scalDir; _scalDir = 0;
        setTimeout(() => { _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+commitDir, 1); _buildStreakCal(); }, 250);
      } else {
        slide.style.transition = `transform 0.25s ${ease}`;
        slide.style.transform = 'translateX(0)';
        if(peek){
          peek.style.transition = `transform 0.25s ${ease}`;
          peek.style.transform = `translateX(${_scalDir===1 ? vpW : -vpW}px)`;
          setTimeout(() => { if(peek.parentNode) peek.parentNode.removeChild(peek); }, 250);
        }
        _scalDir = 0;
      }
    }, {passive:true});

    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  _lockScroll();
  history.pushState({mmrModal:'scal-modal'}, '');
  _buildStreakCal();
}

function _closeStreakCal(){
  _animateModalClose('scal-modal', ()=>{ const m=document.getElementById('scal-modal'); if(m) m.style.display='none'; _unlockScroll(); });
}

function _streakCalNav(dir){
  const slide = document.getElementById('scal-slide');
  const vp = document.getElementById('scal-viewport');
  if(!slide || !vp){ _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+dir, 1); _buildStreakCal(); return; }
  const vpW = vp.offsetWidth;
  const ease = 'cubic-bezier(0.4,0,0.2,1)';
  slide.style.transition = `transform 0.28s ${ease}`;
  slide.style.transform = `translateX(${dir===1 ? -vpW : vpW}px)`;
  setTimeout(() => {
    _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+dir, 1);
    _buildStreakCal();
    const newSlide = document.getElementById('scal-slide');
    if(newSlide){
      newSlide.style.transition = 'none';
      newSlide.style.transform = `translateX(${dir===1 ? vpW : -vpW}px)`;
      newSlide.offsetWidth; // force reflow
      newSlide.style.transition = `transform 0.28s ${ease}`;
      newSlide.style.transform = 'translateX(0)';
    }
  }, 280);
}

function _buildCalGridHTML(date){
  const FC = '#ff7700', GC = '#27ae60';
  const actSet = new Set(safeLoad('wb_act_dates', []));
  const todayStr = new Date().toISOString().slice(0,10);
  const y = date.getFullYear(), mo = date.getMonth();
  const monthLabel = date.toLocaleString('en-US',{month:'long',year:'numeric'});
  const firstDow = new Date(y, mo, 1).getDay();
  const daysInMo = new Date(y, mo+1, 0).getDate();
  const now = new Date();
  const isCurMo = (y === now.getFullYear() && mo === now.getMonth());
  const streakStart = STREAK.current > 0
    ? new Date(Date.now() - (STREAK.current-1)*86400000).toISOString().slice(0,10)
    : null;

  const pad = n => String(n).padStart(2,'0');
  let cells = '';
  for(let i=0;i<firstDow;i++) cells += '<div style="height:40px"></div>';

  for(let d=1; d<=daysInMo; d++){
    const ds = `${y}-${pad(mo+1)}-${pad(d)}`;
    const isAct = actSet.has(ds);
    const isToday = ds === todayStr;
    const inStreak = streakStart && ds >= streakStart && ds <= todayStr;
    const dow = (firstDow + d - 1) % 7;
    const prev = d>1 ? `${y}-${pad(mo+1)}-${pad(d-1)}` : null;
    const next = d<daysInMo ? `${y}-${pad(mo+1)}-${pad(d+1)}` : null;
    const prevConn = prev && actSet.has(prev) && dow !== 0;
    const nextConn = next && actSet.has(next) && dow !== 6;
    const col = inStreak ? FC : GC;
    const colL = inStreak ? 'rgba(255,119,0,.2)' : 'rgba(39,174,96,.2)';
    let pipBg='', pipTxt='var(--txt,#333)', pipEx='';
    if(isAct){ pipBg=`background:${col};`; pipTxt='#fff'; }
    if(isToday && !isAct){ pipBg=`border:2px solid ${inStreak?col:FC};`; pipTxt=inStreak?col:FC; }
    else if(isToday && isAct){ pipEx=`box-shadow:0 0 0 2.5px #fff,0 0 0 4.5px ${col};`; }
    const bL = (isAct&&prevConn) ? `<div style="position:absolute;left:0;width:50%;height:24px;top:50%;transform:translateY(-50%);background:${colL}"></div>` : '';
    const bR = (isAct&&nextConn) ? `<div style="position:absolute;right:0;width:50%;height:24px;top:50%;transform:translateY(-50%);background:${colL}"></div>` : '';
    const fw = (isAct||isToday) ? '700' : '400';
    const clickAttr = isAct ? `data-action="_showDayDetail" data-arg="${ds}" style="position:relative;display:flex;align-items:center;justify-content:center;height:40px;cursor:pointer"` : `style="position:relative;display:flex;align-items:center;justify-content:center;height:40px"`;
    cells += `<div ${clickAttr}>${bL}${bR}<div style="position:relative;z-index:1;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--fs-xs);font-weight:${fw};color:${pipTxt};font-family:'Nunito',sans-serif;${pipBg}${pipEx}">${d}</div></div>`;
  }

  // Pad to always 42 cells (6 rows × 7 cols) so the grid height never changes between months
  const totalCells = firstDow + daysInMo;
  const padEnd = 42 - totalCells;
  for(let i=0;i<padEnd;i++) cells += '<div style="height:40px"></div>';

  const hdrs = ['S','M','T','W','T','F','S'].map(x=>`<div style="text-align:center;font-size:var(--fs-xs);font-weight:700;color:var(--txt2,#999);padding-bottom:6px;font-family:'Nunito',sans-serif">${x}</div>`).join('');
  const streakLine = streakStart
    ? `<p style="text-align:center;font-size:var(--fs-sm);color:var(--txt2,#888);margin:14px 0 0;font-family:'Nunito',sans-serif">Streak started <strong style="color:${FC}">${new Date(streakStart+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</strong></p>`
    : '';
  const prevBtn = `<button data-action="_streakCalNav" data-arg="-1" style="background:none;border:none;font-size:var(--fs-xl);cursor:pointer;color:var(--txt,#444);padding:4px 14px;line-height:1">‹</button>`;
  const nextBtn = isCurMo
    ? `<button style="background:none;border:none;font-size:var(--fs-xl);cursor:default;color:var(--txt,#444);padding:4px 14px;line-height:1;opacity:.25">›</button>`
    : `<button data-action="_streakCalNav" data-arg="1" style="background:none;border:none;font-size:var(--fs-xl);cursor:pointer;color:var(--txt,#444);padding:4px 14px;line-height:1">›</button>`;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      ${prevBtn}
      <span style="font-weight:700;font-size:var(--fs-base);color:var(--txt,#333);font-family:'Nunito',sans-serif">${monthLabel}</span>
      ${nextBtn}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">${hdrs}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">${cells}</div>
    ${streakLine}`;
}

function _buildStreakCal(){
  const modal = document.getElementById('scal-modal');
  if(!modal) return;
  modal.dataset.calView = 'calendar';

  const FC = '#ff7700';
  const isDark = document.body.classList.contains('dark');
  const _bt = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.95)';
  const _bl = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)';
  const _br = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.30)';
  const _bg = isDark
    ? 'background:rgba(255,255,255,.07);box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.12)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.92) 0%,rgba(240,248,255,0.82) 55%,rgba(235,252,245,0.78) 100%);box-shadow:0 -8px 40px rgba(60,120,200,0.18),0 -2px 12px rgba(0,0,0,0.08),inset 0 1.5px 0 rgba(255,255,255,0.98)';

  modal.innerHTML = `
  <div style="${_bg};backdrop-filter:blur(28px) saturate(160%) brightness(1.04);-webkit-backdrop-filter:blur(28px) saturate(160%) brightness(1.04);border-top:1.5px solid ${_bt};border-left:1.5px solid ${_bl};border-right:1.5px solid ${_br};border-radius:28px;width:100%;max-width:400px;padding:20px 16px 32px;overflow-y:auto;max-height:88vh">
    <div style="width:40px;height:4px;background:rgba(0,0,0,.1);border-radius:2px;margin:0 auto 18px"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;width:100%">
        ${_fireSvg('scah',36,48)}
        <div style="text-align:center">
          <div style="font-size:var(--fs-3xl);font-weight:900;color:${FC};line-height:1;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">${STREAK.current}</div>
          <div style="font-size:var(--fs-xs);font-weight:700;color:var(--txt2,#888);text-transform:uppercase;letter-spacing:.6px;margin-top:2px;white-space:nowrap;font-family:'Nunito',sans-serif">Day Streak &nbsp;·&nbsp; Best: ${STREAK.longest}</div>
        </div>
      </div>
      <button data-action="_closeStreakCal" style="background:rgba(0,0,0,.07);border:none;width:34px;height:34px;border-radius:50%;font-size:var(--fs-base);cursor:pointer;color:var(--txt2,#666);display:flex;align-items:center;justify-content:center">✕</button>
    </div>
    <div id="scal-viewport" style="overflow:hidden;position:relative">
      <div id="scal-slide" style="position:relative;will-change:transform">
        ${_buildCalGridHTML(_scDate)}
      </div>
    </div>
  </div>`;
}

// ── SOFT REGISTRATION GATE ───────────────────────────────────────────────────
function _checkSoftGate(type){
  if(_supaUser) return;
  if(type !== 'lesson') return;
  if(localStorage.getItem('wb_nudge_shown')) return;
  localStorage.setItem('wb_nudge_shown', '1');
  setTimeout(_showSignupNudge, 1200);
}

function _showSignupNudge(){
  const overlay = _makeNudgeOverlay('signup-nudge-modal', true);
  if(!overlay) return;
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:#0d1e35;box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.08)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.95) 0%,rgba(240,248,255,0.88) 100%);box-shadow:0 8px 40px rgba(60,120,200,0.18),0 2px 12px rgba(0,0,0,0.08),inset 0 1.5px 0 rgba(255,255,255,0.98)';
  overlay.innerHTML = `<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;${_bg};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:2.4rem;margin-bottom:8px">🌟</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Save Your Progress!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:10px;line-height:1.6">Create a free account to save your scores and unlock all features — it only takes 30 seconds!</div>
    </div>
    <button data-action="nudgeModalSignup"
      style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#4a90d9,#27ae60);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px;letter-spacing:.3px;touch-action:manipulation">
      Create a Free Account →
    </button>
    <div style="text-align:center">
      <button data-action="nudgeModalDismiss"
        style="background:none;border:none;color:var(--txt2,#888);font-size:var(--fs-sm);cursor:pointer;text-decoration:underline;font-family:inherit;touch-action:manipulation">
        Maybe later
      </button>
    </div>
  </div>`;
}

// Creates a .nudge-overlay wrapper, appends to body, returns the element.
// If dismissable=true, clicking outside the inner card removes the overlay.
function _makeNudgeOverlay(id, dismissable){
  if(document.getElementById(id)) return null;
  const el = document.createElement('div');
  el.id = id;
  el.className = 'nudge-overlay';
  if(dismissable){
    el.addEventListener('click', function(e){ if(e.target === el) el.remove(); });
  }
  document.body.appendChild(el);
  return el;
}

function _showSoftGate(){
  if(document.getElementById('soft-gate-modal')) return;
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:#0d1e35;box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.08)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.95) 0%,rgba(240,248,255,0.88) 100%);box-shadow:0 8px 40px rgba(60,120,200,0.18),0 2px 12px rgba(0,0,0,0.08),inset 0 1.5px 0 rgba(255,255,255,0.98)';
  const overlay = _makeNudgeOverlay('soft-gate-modal', false);
  if(!overlay) return;
  overlay.innerHTML = `<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;${_bg};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
    <div style="text-align:center;margin-bottom:22px">
      <div style="font-size:2.2rem;margin-bottom:8px">👋</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Welcome to My Math Roots!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:8px;line-height:1.55">This app is designed for K–5 students.<br>A quick note for parents before you begin.</div>
    </div>
    <div style="margin-bottom:18px">
      <label id="sg-consent-label" style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:var(--fs-sm);color:var(--txt,#222);line-height:1.45;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(120,160,220,0.3);background:rgba(255,255,255,0.55)">
        <input type="checkbox" id="sg-consent" style="margin-top:2px;flex-shrink:0;width:17px;height:17px;cursor:pointer;accent-color:#ff6b00">
        <span>I am a parent or guardian of the child using this app</span>
      </label>
      <div style="margin-top:8px;font-size:var(--fs-xs);color:var(--txt2,#888);text-align:center;line-height:1.5">By continuing, you agree to our <a href="./privacy.html" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Privacy Policy</a> and <a href="./terms.html" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Terms of Service</a>.</div>
    </div>
    <div id="sg-msg" style="font-size:var(--fs-sm);color:#e74c3c;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>
    <button data-action="_guestConsentContinue" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff6b00,#e05200);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px;letter-spacing:.3px;touch-action:manipulation">Continue as Guest →</button>
    <button data-action="_softGateShowLogin" style="width:100%;padding:12px;border-radius:14px;border:2px solid #4a90d9;background:transparent;color:#4a90d9;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);cursor:pointer;margin-bottom:6px;touch-action:manipulation">Create a Free Account</button>
  </div>`;
}

function _guestConsentContinue(){
  const consentEl = document.getElementById('sg-consent');
  const consentLabel = document.getElementById('sg-consent-label');
  const msgEl = document.getElementById('sg-msg');
  if(!consentEl?.checked){
    if(consentLabel) consentLabel.style.borderColor = '#e74c3c';
    if(msgEl) msgEl.textContent = 'Please confirm you are a parent or guardian.';
    consentEl?.focus();
    return;
  }
  _proceedAsGuest();
}

async function _submitSoftGate(){
  const emailEl = document.getElementById('sg-email');
  const email = emailEl?.value?.trim();
  const grade = document.getElementById('sg-grade')?.value;
  const referral = document.getElementById('sg-referral')?.value;
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    emailEl.style.border = '1.5px solid #e74c3c';
    emailEl.placeholder = 'Please enter a valid email';
    emailEl.value = '';
    emailEl.focus();
    return;
  }
  // SEC-8: Require parental consent checkbox (COPPA)
  const consentEl = document.getElementById('sg-consent');
  const consentLabel = document.getElementById('sg-consent-label');
  if(!consentEl?.checked){
    if(consentLabel) consentLabel.style.borderColor = '#e74c3c';
    consentEl?.focus();
    return;
  }
  // SEC-9: Encrypt email before storing in localStorage
  const _leadDate = new Date().toISOString().slice(0,10);
  try{
    const emailEnc = await _encryptStr(email);
    localStorage.setItem('wb_lead', JSON.stringify({ emailEnc, grade, referral, date: _leadDate }));
  } catch {
    // Crypto unavailable — store metadata only, skip email
    localStorage.setItem('wb_lead', JSON.stringify({ grade, referral, date: _leadDate }));
  }
  localStorage.setItem('wb_gate_done', '1');
  if(_supa){
    try{
      await _supa.from('leads').insert({
        email,
        grade: grade || null,
        referral_source: referral || null
        // device_id intentionally omitted — no persistent identifiers before consent (COPPA)
      });
    } catch(e){ console.warn('[leads]', e); }
  }
  const modal = document.getElementById('soft-gate-modal');
  if(modal){
    modal.querySelector('div').innerHTML = `<div style="text-align:center;padding:24px 8px">
      <div style="font-size:var(--fs-3xl);margin-bottom:12px">✅</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);margin-bottom:8px">You're all set!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);line-height:1.55;margin-bottom:22px">Create a free account to sync progress<br>across devices and track your child's streak.</div>
      <button data-action="_softGateShowLogin" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff6b00,#e05200);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px">Create free account →</button>
      <button data-action="_softGateClose" style="background:none;border:none;color:var(--txt2,#888);font-size:var(--fs-sm);cursor:pointer;text-decoration:underline;font-family:inherit">Continue without account</button>
    </div>`;
    setTimeout(()=>{ modal.remove(); }, 10000);
  }
}

function _skipSoftGate(){
  document.getElementById('soft-gate-modal')?.remove();
}
// ─────────────────────────────────────────────────────────────────────────────

async function _updateStreak(){
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if(STREAK.lastDate === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  STREAK.current = (STREAK.lastDate === yesterday) ? STREAK.current + 1 : 1;
  if(STREAK.current > STREAK.longest) STREAK.longest = STREAK.current;
  STREAK.lastDate = today;
  localStorage.setItem('wb_streak', JSON.stringify(STREAK));
  // Log this day for the calendar view (works for guests too)
  const actDates = safeLoad('wb_act_dates', []);
  if(!actDates.includes(today)){
    actDates.push(today);
    if(actDates.length > 365) actDates.shift();
    localStorage.setItem('wb_act_dates', JSON.stringify(actDates));
  }
  _renderStreak();
  // Supabase sync — signed-in users only
  if(!_supa || !_supaUser) return;
  try{
    await _supa.from('profiles').upsert(
      { id: _supaUser.id, current_streak: STREAK.current, longest_streak: STREAK.longest, last_activity_date: today },
      { onConflict: 'id' }
    );
  } catch(e){ console.warn('[Supabase] streak update error', e); }
}

async function _pushScores(){
  if(!_supa || !_supaUser || !SCORES.length) return;
  try{
    // Filter out entries with a _sig that doesn't verify. Entries without _sig pass through (backwards compat).
    const verifiedScores = SCORES.filter(s => !s._sig || _scoreValid(s));
    const _activeStudentId = localStorage.getItem('mmr_active_student_id') || null;
    const rows = verifiedScores.map(s => ({
      user_id:_supaUser.id, local_id:s.id,
      student_id: _activeStudentId,
      qid:s.qid||'', label:s.label||'', type:s.type||'',
      score:s.score||0, total:s.total||0, pct:s.pct||0,
      stars:s.stars||'', unit_idx:s.unitIdx??null, color:s.color||null,
      student_name:s.name||null, time_taken:s.timeTaken||null,
      answers:s.answers||[], date_str:s.date||null, time_str:s.time||null,
      quit:!!s.quit, abandoned:!!s.abandoned
    }));
    await Promise.race([
      _supa.from('quiz_scores').upsert(rows,
        { onConflict:'user_id,local_id', ignoreDuplicates:true }),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('pushScores timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] pushScores error', e); }
}

async function _cloudDeleteAllScores(){
  if(!_supa || !_supaUser) return;
  try{
    await Promise.race([
      (async()=>{
        await _supa.from('quiz_scores').delete().eq('user_id', _supaUser.id);
        await _supa.from('student_progress').upsert(
          { user_id:_supaUser.id, done_json:{}, updated_at:new Date().toISOString() },
          { onConflict:'user_id' }
        );
      })(),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('cloudDeleteAll timeout')),10000))
    ]);
  } catch(e){ console.warn('[Supabase] cloudDelete error', e); }
}

async function _cloudDeleteScore(localId){
  if(!_supa || !_supaUser) return;
  try{
    await Promise.race([
      _supa.from('quiz_scores').delete()
        .eq('user_id', _supaUser.id).eq('local_id', localId),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('cloudDeleteScore timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] cloudDeleteScore error', e); }
}

// Monkey-patch save functions to push to cloud on every local save
const _origSaveDone = saveDone;
saveDone = function(){ _origSaveDone(); _pushDone(); };
const _origSaveSc = saveSc;
saveSc = function(){ _origSaveSc(); _pushScores(); };
const _origSaveMastery = saveMastery;
saveMastery = function(){ _origSaveMastery(); _pushMastery(); };
const _origSaveAppTime = saveAppTime;
saveAppTime = function(){ _origSaveAppTime(); _pushAppTime(); };

async function syncNow(){
  if(!_supa || !_supaUser){ showLockToast('Not signed in.'); return; }
  showLockToast('Syncing…');
  await _pushDone();
  await _pushScores();
  await _pushMastery();
  await _pushAppTime();
  updateSyncLabel();
  showLockToast('Synced! ✅');
}

// ── AUTH UI ──────────────────────────────
function openAuthModal(){
  _switchAuthTab('login');
  document.getElementById('auth-email').value    = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-msg').textContent= '';
  // Reset title/subtitle to defaults (may have been set by a feature gate)
  const _titleEl = document.getElementById('auth-modal-title');
  if(_titleEl) _titleEl.textContent = 'Sign In';
  const _subEl = document.getElementById('auth-modal-sub');
  if(_subEl) _subEl.textContent = 'Save your progress across devices';
  document.getElementById('auth-modal').style.display = 'flex';
  setTimeout(()=>document.getElementById('auth-email').focus(), 120);
}

function closeAuthModal(){
  _animateModalClose('auth-modal', ()=>{ document.getElementById('auth-modal').style.display='none'; });
}

function _switchAuthTab(tab){
  const isSignup = tab === 'signup';
  document.getElementById('auth-tab-login').className  = 'auth-tab-btn ' + (isSignup?'idle':'active');
  document.getElementById('auth-tab-signup').className = 'auth-tab-btn ' + (isSignup?'active':'idle');
  document.getElementById('auth-name-row').style.display = isSignup ? 'block' : 'none';
  document.getElementById('auth-submit-btn').textContent = isSignup ? 'Create Account' : 'Sign In';
  document.getElementById('auth-modal').dataset.tab = tab;
  document.getElementById('auth-msg').textContent = '';
}

async function submitAuth(){
  if(!_supa || _authLoading) return;
  const tab      = document.getElementById('auth-modal').dataset.tab || 'login';
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const msgEl    = document.getElementById('auth-msg');
  msgEl.style.color = '#e74c3c';
  if(!_rateLimit('authModal', 5)){ msgEl.textContent='⚠️ Too many attempts. Please wait a moment.'; return; }
  if(!email || !password){ msgEl.textContent='⚠️ Please enter email and password.'; return; }
  if(!_validEmail(email)){ msgEl.textContent='⚠️ Please enter a valid email address.'; return; }
  if(password.length < 6){ msgEl.textContent='⚠️ Password must be at least 6 characters.'; return; }
  _authLoading = true;
  const btn = document.getElementById('auth-submit-btn');
  const origTxt = btn.textContent;
  btn.textContent = '…';
  msgEl.style.color = '#4a90d9';
  msgEl.textContent = tab==='signup' ? 'Creating account…' : 'Signing in…';
  try{
    let result;
    if(tab === 'signup'){
      const displayName = _sanitize(document.getElementById('auth-name').value, 30)
        || loadSettings().studentName || 'Student';
      result = await _supa.auth.signUp({
        email, password,
        options: { data: { display_name:displayName } }
      });
    } else {
      result = await _supa.auth.signInWithPassword({ email, password });
    }
    if(result.error){
      msgEl.style.color = '#e74c3c';
      msgEl.textContent = '⚠️ ' + _friendlyError(result.error);
    } else if(tab==='signup' && !result.data.session){
      msgEl.style.color = '#27ae60';
      msgEl.textContent = '✅ Check your email to confirm your account!';
    } else {
      closeAuthModal();
      showLockToast('Signed in! Syncing…');
    }
  } catch(e){
    _logError('submitAuth', e);
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ ' + _friendlyError(e);
  } finally {
    _authLoading = false;
    btn.textContent = origTxt;
  }
}

function _clearUserData(){
  // ── Wipe in-memory state ──────────────────────────────────────
  SCORES.length = 0;
  Object.keys(DONE).forEach(k => delete DONE[k]);
  CUR.unitIdx = 0; CUR.lessonIdx = 0; CUR.quiz = null;
  _supaUser = null;
  _carouselInited = false;
  // Clear parent session timer to prevent leaked interval
  if(typeof _parentTimerInterval !== 'undefined') clearInterval(_parentTimerInterval);

  // ── Wipe user-specific localStorage ──────────────────────────
  // Progress & scores (synced to Supabase — reloaded on next login)
  localStorage.removeItem('wb_sc5');
  localStorage.removeItem('wb_done5');
  // Paused quiz state
  localStorage.removeItem('wb_paused_quiz');
  // Parent-managed unlocks and PIN
  localStorage.removeItem('wb_unit_unlocks');
  localStorage.removeItem('wb_lesson_unlocks');
  localStorage.removeItem('wb_parent_pin');
  _parentSessionTs = 0;
  localStorage.removeItem('wb_parent_unlock');
  localStorage.removeItem('wb_pin_changed');
  // PIN brute-force lockout counters
  localStorage.removeItem(_PIN_FAIL_KEY);
  localStorage.removeItem(_PIN_FAIL_COUNT_KEY);
  // Legacy anonymous-tracking identifiers (removed for COPPA compliance)
  localStorage.removeItem('wb_device_id');
  localStorage.removeItem('wb_anon_tracked');
  localStorage.removeItem('mmr_family_profiles');
  localStorage.removeItem('mmr_active_student_id');
  localStorage.removeItem('mmr_last_student_id');
  localStorage.removeItem(_STU_FAIL_KEY);
  localStorage.removeItem(_STU_FAIL_COUNT);
  _lsFamilyProfiles = null;
  _lsSelectedStudentId = null;
  _lsPinBuffer = [];

  // Update UI to reflect logged-out state
  updateAccountUI();
}

async function supaSignOut(){
  if(!_supa) return;
  if(!confirm('Sign out? Your progress is saved to your account and will reload on next login.')) return;
  await _supa.auth.signOut();
  // _clearUserData() and show('login-screen') handled by SIGNED_OUT auth event
  showLockToast('Signed out.');
}

function updateAccountUI(){
  const nudge = document.getElementById('guest-account-nudge');
  if(nudge) nudge.style.display = _supaUser ? 'none' : 'block';
  const signout = document.getElementById('signout-btn-wrap');
  if(signout) signout.style.display = _supaUser ? 'block' : 'none';
  // Show Change Password only for email/password accounts (not Google OAuth)
  const pwWrap = document.getElementById('pc-change-pw-wrap');
  if(pwWrap){
    const isEmail = _supaUser?.app_metadata?.provider === 'email';
    pwWrap.style.display = isEmail ? 'block' : 'none';
  }
}

async function _signOut(){
  if(!_supa) return;
  await _supa.auth.signOut();
  // onAuthStateChange SIGNED_OUT will redirect to login-screen
}

function updateSyncLabel(){
  const el = document.getElementById('account-sync-lbl');
  if(el) el.textContent = 'Last synced: ' +
    new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
}

let CUR = { unitIdx:0, lessonIdx:0, quiz:null };
// quiz: { questions[], shuffled[], idx, score, answers[], id, label, type, returnTo }
