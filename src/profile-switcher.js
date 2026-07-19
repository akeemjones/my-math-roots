// ════════════════════════════════════════
//  PROFILE SWITCHER
//  Top-left avatar button + bottom sheet to switch child profiles.
//  No PIN — children are profiles under the authenticated Family Account.
// ════════════════════════════════════════

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
  var activeId = localStorage.getItem('mmr_active_student_id');
  // Show only when a child is active and there are 2+ children to switch between.
  if(!activeId || profiles.length < 2){
    btn.style.display = 'none';
    btn.classList.remove('prof-btn--stacked');
    return;
  }
  btn.style.display = 'flex';
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

// ── Open / close ──────────────────────────────────────────────────────────
function openProfileSwitcher(){
  var profiles = _psGetProfiles();
  // Only meaningful with 2+ children to switch between.
  if(profiles.length < 2) return;

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
// Single-family-account model: a child is a profile under the authenticated
// Family Account, not a login. Switching children is a one-tap app-state change
// with no PIN and no student session token.
function psSelectProfile(id){
  var profiles = _psGetProfiles();
  var profile  = profiles.find(function(p){ return p.id === id; });
  if(!profile) return;

  // If this IS the active profile, just close.
  var activeId = localStorage.getItem('mmr_active_student_id');
  if(id === activeId){ closeProfileSwitcher(); return; }

  closeProfileSwitcher();
  if (typeof enterStudentLearningSession === 'function') {
    enterStudentLearningSession({
      studentProfileId: profile.id,
      profile:          profile,
      sessionToken:     null,   // parent-owned session; no student token
      source:           'profile-switcher'
    });
  }
}

// (PIN entry / verify_student_pin removed — switching a child profile no longer
//  requires a PIN in the single-family-account model.)

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
