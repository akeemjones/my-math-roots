// =============================================================================
//  Targeted Feedback — Test Suite
//
//  The simplified product replaces the full-screen intervention overlay with an
//  inline "acknowledge to continue" feedback card, governed by the
//  INTERVENTION_OVERLAYS flag. These source-level invariants lock in the new
//  wiring without needing a running quiz:
//    - a single mount helper chooses overlay (legacy) vs inline (simplified)
//    - the two pause functions delegate to it and keep telemetry untouched
//    - nextQ enforces acknowledge-to-continue for the inline card
//    - _renderQ cleans up a lingering inline card
// =============================================================================

'use strict';

const fs   = require('fs');
const path = require('path');

const QUIZ_JS = fs.readFileSync(path.join(__dirname, '..', 'src', 'quiz.js'), 'utf8');

// Brace-aware function-body extractor (same approach as
// intervention-topic-routing.test.js): tracks strings/comments so embedded
// braces and quotes don't confuse the depth counter.
function bodyOf(fnName) {
  const re = new RegExp('function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{', 'g');
  const m = re.exec(QUIZ_JS);
  if (!m) return null;
  let i = m.index + m[0].length - 1;
  let depth = 0, strChar = null, esc = false, lineComment = false, blockComment = false;
  for (; i < QUIZ_JS.length; i++) {
    const c = QUIZ_JS[i], next = QUIZ_JS[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (strChar) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === strChar) strChar = null;
      continue;
    }
    if (c === '/' && next === '/') { lineComment = true; i++; continue; }
    if (c === '/' && next === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { strChar = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return QUIZ_JS.slice(m.index, i + 1); }
  }
  return null;
}

describe('mount helper chooses presentation by flag', () => {
  const body = bodyOf('_mountInterventionCard');

  test('_mountInterventionCard is defined', () => {
    expect(body).not.toBeNull();
  });

  test('it branches on the INTERVENTION_OVERLAYS flag', () => {
    expect(body).toContain("isFeatureOn('INTERVENTION_OVERLAYS')");
  });

  test('it supports both an overlay and an inline presentation', () => {
    expect(body).toContain('data-focus-overlay');
    expect(body).toContain('data-inline-feedback');
  });

  test('overlay path is a fixed full-screen container', () => {
    expect(body).toContain('position:fixed');
  });

  test('inline path is anchored to the question card', () => {
    expect(body).toContain("getElementById('qcard')");
    expect(body).toContain('insertBefore');
  });

  test('it wires the "Got it" button to remove the card and run onDismiss', () => {
    expect(body).toContain("querySelector('#focus-overlay-got-it')");
    expect(body).toContain('onDismiss');
  });
});

describe('both pause functions delegate to the mount helper', () => {
  for (const fn of ['_pauseForIntervention', '_pauseForInterventionTapGroup']) {
    describe(fn, () => {
      const body = bodyOf(fn);

      test('exists', () => { expect(body).not.toBeNull(); });

      test('calls _mountInterventionCard', () => {
        expect(body).toContain('_mountInterventionCard(');
      });

      test('no longer appends its own overlay to the body', () => {
        expect(body).not.toContain('appendChild(overlay)');
      });

      test('still builds the card with the acknowledge button', () => {
        expect(body).toContain('focus-overlay-got-it');
        expect(body).toContain('Got it');
      });
    });
  }
});

describe('telemetry pipeline is preserved (flag governs UI only)', () => {
  const body = bodyOf('_pauseForIntervention');

  test('the triggered event is still logged to the local queue', () => {
    expect(body).toContain('_appendInterventionEvent(');
  });

  test('the intervention_shown analytics event still fires', () => {
    expect(body).toContain("'intervention_shown'");
  });
});

describe('acknowledge-to-continue is enforced', () => {
  test('nextQ refuses to advance while an inline card is present', () => {
    const body = bodyOf('nextQ');
    expect(body).not.toBeNull();
    expect(body).toContain("querySelector('[data-inline-feedback]')");
  });

  test('_renderQ clears a lingering inline card', () => {
    const body = bodyOf('_renderQ');
    expect(body).not.toBeNull();
    expect(body).toContain('data-inline-feedback');
  });
});
