// ════════════════════════════════════════
//  PROFILE MANAGEMENT — owned child profiles
//
//  Single-family-account model: children are profiles owned by the authenticated
//  Family Account (student_profiles.parent_id = auth.uid()). This module fetches
//  the owned profiles and caches them for profile selection. It replaces the
//  fetch that lived in the removed parent dashboard.
//
//  Authorization: the SELECT runs under the parent's Supabase session and RLS
//  (parent_owns_profiles) scopes it to profiles this account owns. No family
//  code, PIN, or student session token is involved.
// ════════════════════════════════════════

// This device's cache of the owned child profiles (source: student_profiles).
var _managedProfiles = [];

// Fetch the Family Account's child profiles and mirror them into the local
// caches the profile selector / switcher read (mmr_family_profiles) and the
// per-profile grade cache (mmr_profile_grade_<id>). Falls back to the last
// cached list on any error so selection still works offline.
async function _fetchManagedProfiles() {
  if (typeof _supa === 'undefined' || !_supa) return;
  try {
    var result = await Promise.race([
      _supa
        .from('student_profiles')
        .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, username, updated_at, grade, streak_current, streak_longest, streak_last_date, act_dates_json')
        .order('created_at', { ascending: true }),
      new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;
    _managedProfiles = result.data || [];
    // Mirror Supabase grade into the per-profile local cache so the grade
    // resolver and child-side reads work without re-fetching.
    _managedProfiles.forEach(function (p) {
      if (p && p.id && p.grade && typeof _dbWriteProfileGrade === 'function') _dbWriteProfileGrade(p.id, p.grade);
    });
    localStorage.setItem('mmr_family_profiles',
      JSON.stringify(_managedProfiles.map(function (p) {
        return {
          id: p.id, display_name: p.display_name, age: p.age,
          avatar_emoji: p.avatar_emoji, avatar_color_from: p.avatar_color_from,
          avatar_color_to: p.avatar_color_to, username: p.username,
          grade: p.grade || null
        };
      }))
    );
  } catch (e) {
    try { _managedProfiles = JSON.parse(localStorage.getItem('mmr_family_profiles') || '[]'); }
    catch (e2) { _managedProfiles = []; }
  }
}

// Node/Jest bridge.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { _fetchManagedProfiles };
}
