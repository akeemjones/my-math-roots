'use strict';

// =============================================================================
//  FOUR-SECTION DASHBOARD GROUPING
//
//  The simplified product collapses the flat 8-section dashboard into four
//  intent-based groups — Overview / Progress / Practice / Account — governed by
//  LEGACY_DASHBOARD_SECTIONS. Legacy (flag on) still renders the flat list.
//
//  Runs against the PRODUCTION dashboard via the bundle harness.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { loadDashboard, makeStorage } = require('./dashboard-harness.js');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const DASH = read('src/dashboard.js');

const D = loadDashboard(makeStorage());

describe('_dbGroup wrapper', () => {
  test('is defined on the production bundle', () => {
    expect(typeof D._dbGroup).toBe('function');
  });

  test('wraps a title and body in a labeled group (no extra accordion)', () => {
    const html = D._dbGroup('👀 Overview', '<p id="inner">x</p>');
    expect(html).toContain('class="db-group"');
    expect(html).toContain('class="db-group-title">👀 Overview</h2>');
    expect(html).toContain('<div class="db-group-body"><p id="inner">x</p></div>');
    // A group must NOT introduce its own collapsible section chrome.
    expect(html).not.toContain('data-action="toggleDbSection"');
  });
});

describe('renderDashboard composition', () => {
  test('is gated on LEGACY_DASHBOARD_SECTIONS', () => {
    expect(DASH).toContain("isFeatureOn('LEGACY_DASHBOARD_SECTIONS')");
  });

  test('simplified layout builds exactly the four intent groups', () => {
    expect(DASH).toContain("_dbGroup('👀 Overview'");
    expect(DASH).toContain("_dbGroup('📈 Progress'");
    expect(DASH).toContain("_dbGroup('🎯 Practice'");
    expect(DASH).toContain("_dbGroup('👤 Account'");
  });

  test('sections are bucketed by parent intent', () => {
    // Overview = action summary + activity snapshot
    expect(DASH).toContain("_dbGroup('👀 Overview', _secActionSummary + _secActivity)");
    // Progress = insights + unit map + quiz history
    expect(DASH).toContain("_dbGroup('📈 Progress', _secInsights + _secUnitMap + _secQuizzes)");
    // Practice = practice plan
    expect(DASH).toContain("_dbGroup('🎯 Practice', _secPracticePlan)");
    // Account = profiles + settings
    expect(DASH).toContain("_dbGroup('👤 Account',  _secProfiles + _secSettings)");
  });

  test('legacy layout still concatenates all eight flat sections', () => {
    expect(DASH).toContain(
      '_dbBody = _secActionSummary + _secPracticePlan + _secInsights + _secUnitMap'
    );
  });

  test('every one of the eight sections is placed in exactly one bucket', () => {
    const buckets = DASH.slice(DASH.indexOf('_dbGroup(\'👀 Overview\''), DASH.indexOf('root.innerHTML = _dbHeaderHtml'));
    for (const sec of ['_secActionSummary', '_secActivity', '_secInsights', '_secUnitMap',
                       '_secQuizzes', '_secPracticePlan', '_secProfiles', '_secSettings']) {
      const occurrences = buckets.split(sec).length - 1;
      expect(occurrences).toBe(1);
    }
  });
});
