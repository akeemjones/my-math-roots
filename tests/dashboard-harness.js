'use strict';

// =============================================================================
//  PRODUCTION DASHBOARD HARNESS
//
//  Loads the REAL parent dashboard — src/dashboard.js, the file build.js
//  concatenates into dist/app.js — for tests to exercise.
//
//  WHY A VM SANDBOX AND NOT require('../src/dashboard.js')
//
//  src/dashboard.js is not a module. It is one slice of a single global scope
//  that build.js builds by concatenating SRC_FILES in order, and it reads
//  globals that earlier slices define. Requiring it alone leaves those globals
//  undefined, and the file has `typeof X === 'function' ? X : <fallback>`
//  guards that then silently take a fallback path which never runs in the
//  shipped bundle. Some of those fallbacks are DEGRADED — e.g.
//  _dbReadProfileGrade (src/dashboard.js:483-492) falls back to a normalizer
//  that maps every grade except 'K' to '2', so a Grade 1 profile would resolve
//  to Grade 2 under require() while resolving correctly in production.
//
//  Testing that would validate fallbacks instead of the product. So this
//  harness reproduces the bundle: same files, same order as build.js, one
//  shared context.
//
//  This replaces requiring dashboard/dashboard.js, a standalone fork that is
//  NOT deployed (build.js copies no dashboard/ directory into dist/) and had
//  drifted 2,317 lines behind the shipped implementation.
// =============================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

// The slice of build.js's SRC_FILES that the dashboard needs. Order matters and
// must match build.js:
//   app-config.js — product flags (isFeatureOn / isGradeLaunched)
//   state.js      — normalizeGrade + the grade-namespaced storage keys.
//                   dashboard.js calls normalizeGrade as a global.
//   dashboard.js  — the subject under test.
const BUNDLE_FILES = ['app-config.js', 'state.js', 'parent-progress.js', 'dashboard.js'];

// An in-memory localStorage stand-in with the same surface the app uses.
function makeStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem(k) { return map.has(String(k)) ? map.get(String(k)) : null; },
    setItem(k, v) { map.set(String(k), String(v)); },
    removeItem(k) { map.delete(String(k)); },
    clear() { map.clear(); },
    key(i) { return Array.from(map.keys())[i] ?? null; },
    get length() { return map.size; },
    _reset() { map.clear(); },
  };
}

// Evaluate the production bundle slice and return its global scope.
// Pass the storage the test wants the app to read/write; defaults to a fresh one.
function loadDashboard(storage) {
  const store = storage || makeStorage();

  const sandbox = {
    localStorage: store,
    console,
    module: { exports: {} },
    JSON, Math, Date, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, Proxy, Set, Map, Symbol, Promise,
    setTimeout, clearTimeout, setInterval, clearInterval,
    encodeURIComponent, decodeURIComponent,
  };
  // The bundle runs in a browser where `window` and `globalThis` are the global
  // scope itself. Self-reference so `window.x = ...` and `typeof window` behave.
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;

  vm.createContext(sandbox);

  for (const file of BUNDLE_FILES) {
    const src = fs.readFileSync(path.join(ROOT, 'src', file), 'utf8');
    try {
      vm.runInContext(src, sandbox, { filename: `src/${file}` });
    } catch (err) {
      throw new Error(
        `Production harness failed loading src/${file}: ${err.message}\n` +
        `The dashboard bundle slice (${BUNDLE_FILES.join(' -> ')}) must evaluate ` +
        `cleanly. If this broke after a src/ change, the bundle itself is broken.`
      );
    }
  }

  return sandbox;
}

module.exports = { loadDashboard, makeStorage, BUNDLE_FILES };
