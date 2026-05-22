'use strict';

/**
 * _validateFamilyCode — pure, no DOM/Supabase dependencies
 * Canonical family code is MMR- followed by exactly 8 numeric digits.
 * The /i flag tolerates "mmr-" prefix; the digits part is unaffected.
 */
function _validateFamilyCode(code) {
  if (code == null || code === '') return false;
  return /^MMR-[0-9]{8}$/i.test(String(code));
}

/**
 * _normalizeFamilyCode — mirror of the helper in src/auth.js
 * Returns the canonical "MMR-XXXXXXXX" or null.
 * Accepts:
 *   "12345678"        → "MMR-12345678"
 *   "MMR-12345678"    → "MMR-12345678"
 *   "mmr-12345678"    → "MMR-12345678"
 *   "  12 345 678  " → "MMR-12345678"
 *   "MMR-12-34-56-78" → "MMR-12345678"
 */
function _normalizeFamilyCode(input) {
  if (input == null) return null;
  let raw = String(input).trim().toUpperCase();
  if (raw.indexOf('MMR-') === 0) raw = raw.slice(4);
  raw = raw.replace(/[\s\-]/g, '');
  if (!/^[0-9]{8}$/.test(raw)) return null;
  return 'MMR-' + raw;
}

/**
 * _esc — XSS-safe escaper (same as dashboard.js)
 */
function _esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * _buildAvatarHtml — renders avatar picker row HTML
 * @param {Array} profiles — array of student profile objects
 * @param {string|null} selectedId — id of currently selected profile
 * @returns {string} HTML string
 */
function _buildAvatarHtml(profiles, selectedId) {
  if (!profiles || !profiles.length) return '';
  return profiles.map(function(p) {
    var isSelected = p.id === selectedId;
    var ringStyle = isSelected
      ? 'border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 0 3px rgba(245,158,11,0.45),0 4px 12px rgba(0,0,0,0.3);opacity:1'
      : 'border:2.5px solid rgba(255,255,255,0.25);box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7';
    return '<div class="ls-avatar-item' + (isSelected ? ' ls-avatar-selected' : '') + '"'
      + ' data-action="_lsSelectAvatar" data-arg="' + _esc(p.id) + '"'
      + ' data-id="' + _esc(p.id) + '">'
      + '<div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,'
      + _esc(p.avatar_color_from) + ',' + _esc(p.avatar_color_to)
      + ');display:flex;align-items:center;justify-content:center;font-size:1.5rem;' + ringStyle + '">'
      + _esc(p.avatar_emoji) + '</div>'
      + '<div style="font-size:.72rem;color:' + (isSelected ? '#fff' : 'rgba(255,255,255,0.65)') + ';font-weight:'
      + (isSelected ? '700' : '600') + ';margin-top:5px">' + _esc(p.display_name) + '</div>'
      + '</div>';
  }).join('');
}

/**
 * _buildStudentCardHtml — renders the full student card body
 * State A (profiles empty/null): family code input
 * State B (profiles has entries): avatar picker + PIN keypad
 */
function _buildStudentCardHtml(profiles, selectedId, pinBuffer) {
  if (!profiles || !profiles.length) {
    // State A — family code entry
    return '<div style="padding:4px 0">'
      + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.08em;text-align:center;margin-bottom:10px">Enter your family code</div>'
      + '<div style="display:flex;align-items:stretch;justify-content:center;margin-bottom:12px;gap:0">'
      + '<span id="ls-family-code-prefix" aria-hidden="true" style="display:flex;align-items:center;padding:0 14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.25);border-right:none;border-radius:8px 0 0 8px;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);letter-spacing:.12em;color:rgba(255,255,255,0.92)">MMR-</span>'
      + '<input id="ls-family-code-inp" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" class="set-inp" placeholder="12345678"'
      + ' maxlength="8" style="flex:1;text-align:center;letter-spacing:.15em;font-size:var(--fs-md);font-family:\'Boogaloo\',sans-serif;box-sizing:border-box;border-radius:0 8px 8px 0">'
      + '</div>'
      + '<div id="ls-family-code-msg" style="font-size:.78rem;color:#f87171;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>'
      + '<button data-action="_lsFamilyCodeSetup" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);cursor:pointer;letter-spacing:.3px;touch-action:manipulation">Link This Device</button>'
      + '</div>';
  }

  // State B — avatar picker + PIN keypad
  var buf = Array.isArray(pinBuffer) ? pinBuffer : [];
  var selected = profiles.find(function(p) { return p.id === selectedId; }) || profiles[0];
  var selId = selected ? selected.id : null;
  var selName = selected ? _esc(selected.display_name) : '';

  // PIN dots (4 total)
  var dots = '';
  for (var i = 0; i < 4; i++) {
    if (i < buf.length) {
      dots += '<div class="ls-pin-dot ls-pin-dot-filled"></div>';
    } else {
      dots += '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
  }

  // Keypad: 1-9, empty, 0, backspace
  var keys = '';
  var digits = ['1','2','3','4','5','6','7','8','9'];
  digits.forEach(function(d) {
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

module.exports = { _validateFamilyCode, _normalizeFamilyCode, _buildAvatarHtml, _buildStudentCardHtml };
