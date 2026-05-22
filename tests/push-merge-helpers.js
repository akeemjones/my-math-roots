'use strict';

// Pure JS mirror of the merge-preserve semantics introduced in
// supabase/migrations/20260609_push_done_merge_preserve.sql. The real
// implementation uses the PostgreSQL JSONB `||` operator on the server
// inside push_student_progress; this mirror lets jest exercise the
// expected behavior without a live database.

// Mirrors: COALESCE(v_stored.done_json, '{}'::jsonb)
//          || COALESCE(p_done_json, '{}'::jsonb)
// JSONB || is right-side wins on key collision; keys present only in
// stored are preserved; keys present only in payload are added.
function _mergeDoneJsonPreserve(stored, payload) {
  const s = (stored && typeof stored === 'object' && !Array.isArray(stored)) ? stored : {};
  const p = (payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : {};
  return Object.assign({}, s, p);
}

// Mirrors the existing anti-tamper guard
// (20260520_student_profiles_reset_epoch.sql lines 356-365):
//   For each stored key with value === true, if payload contains the key
//   and payload's value is NOT strictly === true, flag as a false-flip.
//
// The Tier 2 migration leaves this guard unchanged and runs it BEFORE
// the merge UPDATE, so a tampering payload is still rejected.
function _findFalseFlipKeys(stored, payload) {
  const flips = [];
  if (!stored || typeof stored !== 'object') return flips;
  if (!payload || typeof payload !== 'object') return flips;
  const keys = Object.keys(stored);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (stored[k] === true && Object.prototype.hasOwnProperty.call(payload, k)) {
      if (payload[k] !== true) flips.push(k);
    }
  }
  return flips;
}

module.exports = {
  _mergeDoneJsonPreserve,
  _findFalseFlipKeys,
};
