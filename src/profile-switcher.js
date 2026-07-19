// ════════════════════════════════════════
//  PROFILE SWITCHER
//  Top-left avatar button + bottom sheet to switch student profiles.
//  PIN required to switch to a different profile.
// ════════════════════════════════════════

var _psTargetProfileId = null;   // profile ID being authenticated into
var _psPinBuffer       = [];     // digits typed so far

// ── Helpers ───────────────────────────────────────────────────────────────
function _psGetProfiles(){
  try{ return JSON.parse(localStorage.getItem('mmr_family_profiles')||'[]'); }
  catch(e){ return []; }
}

function _psEsc(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _psValidColor(val){
  if(typeof val !== 'string') return '#f59e0b';
  var v = val.trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#f59e0b';
}

// ── Update the top-left button emoji ─────────────────────────────────────
function _psUpdateProfileBtn(){
  var btn = document.getElementById('prof-btn');
  if(!btn) return;
  var profiles = _psGetProfiles();
  var role     = localStorage.getItem('mmr_user_role');
  var calBtn = document.getElementById('cal-btn');
  // Hide if not a student with 2+ profiles (single-profile: no point switching)
  if(role !== 'student' || profiles.length < 2){
    btn.style.display = 'none';
    btn.classList.remove('prof-btn--stacked');
    return;
  }
  btn.style.display = 'flex';
  var activeId = localStorage.getItem('mmr_active_student_id');
  var profile  = profiles.find(function(p){ return p.id === activeId; });
  if(profile){
    btn.innerHTML = '<span style="font-size:1.4rem;line-height:1">' + _psEsc(profile.avatar_emoji) + '</span>';
    btn.setAttribute('aria-label', 'Switch profile: ' + _psEsc(profile.display_name));
  } else {
    btn.innerHTML = '<span style="font-size:1.2rem;line-height:1">👤</span>';
    btn.setAttribute('aria-label', 'Switch profile');
  }
  // Stack prof-btn below cal-btn when both visible
  btn.classList.add('prof-btn--stacked');
}

// ── Build profile-list HTML ───────────────────────────────────────────────
function _psProfileListHtml(profiles){
  var activeId = localStorage.getItem('mmr_active_student_id');
  var items = profiles.map(function(p){
    var isActive = p.id === activeId;
    var grad = 'linear-gradient(135deg,' + _psValidColor(p.avatar_color_from) + ',' + _psValidColor(p.avatar_color_to) + ')';
    return '<div class="ps-profile-item' + (isActive ? ' ps-profile-active' : '') + '"'
      + ' data-action="psSelectProfile" data-arg="' + _psEsc(p.id) + '">'
      + '<div class="ps-av" style="background:' + grad + '">' + _psEsc(p.avatar_emoji) + '</div>'
      + '<div class="ps-item-name">' + _psEsc(p.display_name) + '</div>'
      + (isActive ? '<div class="ps-check" aria-label="Active">✓</div>' : '')
      + '</div>';
  }).join('');
  return '<div class="ps-sheet-handle"></div>'
    + '<div class="ps-title">Switch Profile</div>'
    + '<div class="ps-profile-list">' + items + '</div>'
    + '<button class="ps-cancel-btn" data-action="closeProfileSwitcher">Cancel</button>';
}

// ── Build PIN-entry HTML ──────────────────────────────────────────────────
function _psPinViewHtml(profile){
  var grad = 'linear-gradient(135deg,' + _psValidColor(profile.avatar_color_from) + ',' + _psValidColor(profile.avatar_color_to) + ')';
  var dots = '';
  for(var i = 0; i < 4; i++){
    dots += '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
  }
  return '<div class="ps-sheet-handle"></div>'
    + '<button class="ps-back-btn" data-action="psBackToList">&#8592; Back</button>'
    + '<div class="ps-av-lg" style="background:' + grad + '">' + _psEsc(profile.avatar_emoji) + '</div>'
    + '<div class="ps-name-lg">' + _psEsc(profile.display_name) + '</div>'
    + '<div class="ps-tap-hint">Tap to enter PIN</div>'
    + '<div style="position:relative;padding:14px 0;cursor:pointer">'
    + '<div id="ps-pin-dots" style="display:flex;gap:12px;justify-content:center">' + dots + '</div>'
    + '<input type="tel" id="ps-pin-native" inputmode="numeric" pattern="[0-9]*" maxlength="4"'
    + ' autocomplete="one-time-code" data-oninput="psPinInput"'
    + ' style="position:absolute;inset:0;opacity:0;width:100%;height:100%;font-size:16px;cursor:pointer;border:none;outline:none;background:transparent">'
    + '</div>'
    + '<div id="ps-pin-msg" style="font-size:.78rem;color:#f87171;text-align:center;min-height:1.2rem;margin-top:4px"></div>';
}

// ── Open / close ──────────────────────────────────────────────────────────
function openProfileSwitcher(){
  var role     = localStorage.getItem('mmr_user_role');
  var profiles = _psGetProfiles();

  // Guest (no account): prompt to create one instead of opening the switcher
  if(!role || (role !== 'student' && role !== 'parent')){
    var modal   = document.getElementById('auth-modal');
    var titleEl = document.getElementById('auth-modal-title');
    var subEl   = document.getElementById('auth-modal-sub');
    var emailEl = document.getElementById('auth-email');
    var pwEl    = document.getElementById('auth-password');
    var msgEl   = document.getElementById('auth-msg');
    if(!modal) return;
    // Reset form
    if(emailEl) emailEl.value = '';
    if(pwEl)    pwEl.value    = '';
    if(msgEl)   msgEl.textContent = '';
    // Point to signup tab
    if(typeof _switchAuthTab === 'function') _switchAuthTab('signup');
    // Custom prompt copy
    if(titleEl) titleEl.textContent = 'Create a Free Account';
    if(subEl)   subEl.textContent   = 'Sign up to unlock student profiles, track progress across devices, and more.';
    modal.style.display = 'flex';
    setTimeout(function(){ if(emailEl) emailEl.focus(); }, 120);
    return;
  }

  // Guard: must be a student with multiple profiles loaded
  if(role !== 'student' || profiles.length < 2) return;

  _psTargetProfileId = null;
  _psPinBuffer       = [];

  var overlay = document.createElement('div');
  overlay.id  = 'profile-switch-modal';
  overlay.setAttribute('data-no-swipe', '');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:var(--z-modal,9600);'
    + 'display:flex;align-items:flex-end;background:rgba(0,0,0,0.52)';

  var sheet  = document.createElement('div');
  sheet.id   = 'ps-sheet';
  sheet.className = 'ps-sheet';
  sheet.innerHTML  = _psProfileListHtml(profiles);

  // Tap outside sheet → close
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closeProfileSwitcher();
  });

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  // Push history so the browser back-button / iOS pull-back closes the modal
  history.pushState({ mmrModal: 'profile-switch-modal' }, '');

  // Animate open
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      sheet.classList.add('ps-sheet-open');
    });
  });
}

function closeProfileSwitcher(){
  var modal = document.getElementById('profile-switch-modal');
  if(!modal) return;
  var sheet = document.getElementById('ps-sheet');
  if(sheet){ sheet.classList.remove('ps-sheet-open'); }
  setTimeout(function(){ if(modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
}

// ── Select a profile from the list ───────────────────────────────────────
function psSelectProfile(id){
  var profiles = _psGetProfiles();
  var profile  = profiles.find(function(p){ return p.id === id; });
  if(!profile) return;

  // If this IS the active profile, just close
  var activeId = localStorage.getItem('mmr_active_student_id');
  if(id === activeId){ closeProfileSwitcher(); return; }

  // Parent-authenticated bypass: when a parent's Supabase session is active,
  // they can switch between their own children with one tap. PIN is for the
  // PIN-only context (student logged in via family code, switching siblings).
  if (typeof _supaUser !== 'undefined' && _supaUser
      && typeof enterStudentLearningSession === 'function') {
    console.log('[MMR SWITCHER] parent authed, bypassing PIN for studentId=' + id);
    closeProfileSwitcher();
    enterStudentLearningSession({
      studentProfileId: profile.id,
      profile:          profile,
      sessionToken:     null,
      source:           'profile-switcher'
    });
    return;
  }

  _psTargetProfileId = id;
  _psPinBuffer       = [];

  var sheet = document.getElementById('ps-sheet');
  if(!sheet) return;
  sheet.innerHTML = _psPinViewHtml(profile);

  // Auto-focus the native input so the keyboard appears immediately
  setTimeout(function(){
    var inp = document.getElementById('ps-pin-native');
    if(inp) inp.focus();
  }, 60);
}

// ── Native input handler (called by data-oninput="psPinInput") ────────────
function psPinInput(){
  var inp = document.getElementById('ps-pin-native');
  if(!inp) return;
  var val = inp.value.replace(/\D/g,'').slice(0, 4);
  inp.value  = val;
  _psPinBuffer = val.split('');

  // Update dots
  var dots = document.getElementById('ps-pin-dots');
  if(dots){
    var html = '';
    for(var i = 0; i < 4; i++){
      html += i < _psPinBuffer.length
        ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
        : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
    dots.innerHTML = html;
  }

  if(_psPinBuffer.length === 4){
    inp.value = ''; // clear so it's ready for retry
    _psCheckPin();
  }
}

// Focus helper for accessibility (tap anywhere in PIN area)
function psPinFocus(){
  var inp = document.getElementById('ps-pin-native');
  if(inp) inp.focus();
}

// ── Back to profile list ──────────────────────────────────────────────────
function psBackToList(){
  _psTargetProfileId = null;
  _psPinBuffer       = [];
  var profiles = _psGetProfiles();
  var sheet    = document.getElementById('ps-sheet');
  if(!sheet) return;
  sheet.innerHTML = _psProfileListHtml(profiles);
}

// ── Verify PIN and switch profile ─────────────────────────────────────────
async function _psCheckPin(){
  var profiles = _psGetProfiles();
  var profile  = profiles.find(function(p){ return p.id === _psTargetProfileId; });
  if(!profile){ _psPinBuffer = []; return; }

  var _pinRaw  = _psPinBuffer.join('');
  _psPinBuffer = [];

  var msgEl = document.getElementById('ps-pin-msg');

  if(typeof _supa === 'undefined' || !_supa){
    if(msgEl) msgEl.textContent = 'No connection — try again.';
    return;
  }

  var psInp = document.getElementById('ps-pin-native');
  if(psInp){ psInp.disabled = true; psInp.value = ''; }

  try{
    var result = await Promise.race([
      _supa.rpc('verify_student_pin', { p_student_id: profile.id, p_pin: _pinRaw }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);

    if(psInp) psInp.disabled = false;
    if(result.error) throw result.error;

    var vr = result.data;

    // ── Locked out ───────────────────────────────────────────────────────
    if(vr && vr.locked_until){
      var secsLeft = Math.ceil((vr.locked_until - Date.now()) / 1000);
      if(secsLeft > 0){
        if(msgEl) msgEl.textContent = 'Too many attempts. Try again in ' + secsLeft + 's.';
        if(typeof _lsShakePinDots === 'function') _lsShakePinDots('ps-pin-dots');
        return;
      }
    }

    // ── Wrong PIN ────────────────────────────────────────────────────────
    if(!vr || !vr.success){
      if(msgEl) msgEl.textContent = (vr && vr.attempts_left === 0)
        ? 'Locked for 5 minutes.'
        : 'Wrong PIN — try again.';
      if(typeof _lsShakePinDots === 'function') _lsShakePinDots('ps-pin-dots');
      setTimeout(function(){
        if(psInp){ psInp.focus(); }
      }, 500);
      return;
    }

    // ── SUCCESS ──────────────────────────────────────────────────────────
    closeProfileSwitcher();
    if (typeof enterStudentLearningSession === 'function') {
      await enterStudentLearningSession({
        studentProfileId: profile.id,
        profile:          profile,
        sessionToken:     vr.session_token,
        source:           'profile-switcher'
      });
    }

  } catch(e){
    if(psInp) psInp.disabled = false;
    if(msgEl) msgEl.textContent = 'Connection error — try again.';
    setTimeout(function(){ if(psInp) psInp.focus(); }, 300);
  }
}

// ════════════════════════════════════════
//  PROFILE SELECTION SCREEN  (single-family-account model)
//  The post-login landing: pick which child is learning. A child profile is
//  application state, NOT a login — selecting one enters the learning app under
//  the already-authenticated Family Account (parent Supabase session), with no
//  family code, no PIN, and no session token. This is the PIN-free entry the
//  parent-launched regime already provides via enterStudentLearningSession.
// ════════════════════════════════════════
function _pselGradeLabel(profile){
  var g = (profile && profile.grade != null) ? String(profile.grade).trim().toLowerCase() : '';
  if(g === 'k' || g === 'kindergarten' || g === '0') return 'Kindergarten';
  if(g === '1') return 'Grade 1';
  if(g === '2') return 'Grade 2';
  if(g === '3') return 'Grade 3';
  return '';
}

function _pselInitials(name){
  var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return '?';
  return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
}

// Render the child cards into #psel-grid. Reads the family-profile cache; the
// same cache the switcher and (former) login card use.
function buildProfileSelection(){
  var grid = document.getElementById('psel-grid');
  if(!grid) return;
  var profiles = _psGetProfiles();
  if(!profiles.length){
    grid.innerHTML = '<div class="psel-empty">No child profiles yet. Add your first child to get started.</div>';
    return;
  }
  grid.innerHTML = profiles.map(function(p){
    var grad = 'linear-gradient(135deg,' + _psValidColor(p.avatar_color_from) + ',' + _psValidColor(p.avatar_color_to) + ')';
    var av   = p.avatar_emoji ? _psEsc(p.avatar_emoji) : _psEsc(_pselInitials(p.display_name));
    var gl   = _pselGradeLabel(p);
    return '<button type="button" class="psel-card" role="listitem"'
      + ' data-action="pselSelectChild" data-arg="' + _psEsc(p.id) + '">'
      + '<div class="psel-av" style="background:' + grad + '">' + av + '</div>'
      + '<div class="psel-name">' + _psEsc(p.display_name) + '</div>'
      + (gl ? '<div class="psel-grade">' + gl + '</div>' : '')
      + '</button>';
  }).join('');
}

// Show the selection screen and (re)render its cards.
function goProfileSelection(){
  if(typeof buildProfileSelection === 'function') buildProfileSelection();
  if(typeof show === 'function') show('profile-selection');
}

// Tap a child card → enter that child's learning app. No credential prompt.
function pselSelectChild(id){
  var profiles = _psGetProfiles();
  var profile  = profiles.find(function(p){ return p.id === id; });
  if(!profile) return;
  if(typeof enterStudentLearningSession === 'function'){
    enterStudentLearningSession({
      studentProfileId: profile.id,
      profile:          profile,
      sessionToken:     null,            // parent-owned session; no student token
      source:           'profile-selection'
    });
  }
}

// Add-child and Settings are parent-only — both open the parent-PIN-gated
// Settings. Add child lands in the Children section (deep-link wired with the
// Children section build).
function pselAddChild(){
  if(typeof openSettings === 'function') openSettings();
  else if(typeof goSettings === 'function') goSettings();
}
function pselOpenSettings(){
  if(typeof openSettings === 'function') openSettings();
  else if(typeof goSettings === 'function') goSettings();
}
