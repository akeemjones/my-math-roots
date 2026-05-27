// =============================================================================
//  Intervention Topic-Routing — Test Suite
//
//  Verifies the topic-aware intervention dispatcher. Source-level invariants
//  cover the most important guarantees without needing a running quiz.
//
//  Bug context: the previous intervention path ran a chain of K-dynamic
//  handlers that parsed `correctVal`/`chosenVal` as integers and built
//  number-line / emoji-row visuals. For a fraction question with chosen
//  "3/4" and correct "2/4", parseInt → (3, 2) → number-line from 3 → 2 with
//  a "−1" jump. Same garbage for multiplication, place-value, graph, etc.
//
//  Fix: `_buildTopicAwareIntervention` runs FIRST, routing on the live
//  lesson topic to a topic-specific builder (fraction → fractionShaded,
//  array → arrayRepeatedAdd, place-value → drawBase10, etc.). When no
//  good content can be made, the dispatcher returns null and the modal is
//  skipped entirely.
// =============================================================================

'use strict';

const fs   = require('fs');
const path = require('path');

const QUIZ_JS = fs.readFileSync(path.join(__dirname, '..', 'src', 'quiz.js'), 'utf8');

// ── Body extractor that handles nested braces inside function bodies ─────────
// Tracks the actual opening quote char so an embedded `'` inside a "..." string
// does not flip parser state. Also skips // and /* comments and regex literals
// to the extent they appear in our source.
function bodyOf(fnName) {
  const re = new RegExp('function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{', 'g');
  const m = re.exec(QUIZ_JS);
  if (!m) return null;
  let i = m.index + m[0].length - 1; // points at the '{' of the body
  let depth = 0, strChar = null, esc = false;
  let lineComment = false, blockComment = false;
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

describe('Topic-aware intervention dispatcher exists and is wired in', () => {
  test('_buildTopicAwareIntervention function is defined', () => {
    const body = bodyOf('_buildTopicAwareIntervention');
    expect(body).not.toBeNull();
    expect(body.length).toBeGreaterThan(500);
  });

  test('_buildInterventionContent calls _buildTopicAwareIntervention first', () => {
    const body = bodyOf('_buildInterventionContent');
    expect(body).not.toBeNull();
    // The topic dispatcher must be invoked before any K-dynamic branch
    const topicIdx = body.indexOf('_buildTopicAwareIntervention');
    const kDynIdx  = body.indexOf("errorTag === 'err_off_by_one'");
    expect(topicIdx).toBeGreaterThan(0);
    expect(kDynIdx).toBeGreaterThan(topicIdx);
  });

  test('_buildInterventionContent returns null when no usable content', () => {
    const body = bodyOf('_buildInterventionContent');
    // The final else branch must return null when nothing matches
    expect(body).toMatch(/return null/);
  });

  test('_pauseForIntervention bails when content is null', () => {
    const body = bodyOf('_pauseForIntervention');
    expect(body).toMatch(/if\s*\(!content\)\s*return/);
  });

  test('_pauseForInterventionTapGroup bails when content is null', () => {
    const body = bodyOf('_pauseForInterventionTapGroup');
    expect(body).toMatch(/if\s*\(!content\)\s*return/);
  });
});

describe('Topic dispatcher routes each major topic to a non-number-line builder', () => {
  let body;
  beforeAll(() => { body = bodyOf('_buildTopicAwareIntervention'); });

  test('fraction topic uses fractionShaded (not numberLine)', () => {
    // The fraction branch must call safeBuilder('fractionShaded', ...) — not dynamicNL or numberLine
    const m = body.match(/_intFraction[\s\S]{0,3500}safeBuilder\('fractionShaded'/);
    expect(m).not.toBeNull();
  });

  test('array topic uses arrayRepeatedAdd', () => {
    const m = body.match(/_intArray[\s\S]{0,3500}safeBuilder\('arrayRepeatedAdd'/);
    expect(m).not.toBeNull();
  });

  test('pictograph topic uses pictographRowTotal', () => {
    const m = body.match(/_intPictograph[\s\S]{0,3500}safeBuilder\('pictographRowTotal'/);
    expect(m).not.toBeNull();
  });

  test('bar-graph topic uses barReadBar', () => {
    const m = body.match(/_intBarGraph[\s\S]{0,3500}safeBuilder\('barReadBar'/);
    expect(m).not.toBeNull();
  });

  test('place-value topic uses drawBase10 directly', () => {
    const m = body.match(/_intPlaceValue[\s\S]{0,3500}drawBase10\(/);
    expect(m).not.toBeNull();
  });

  test('regroup-add topic uses regroupAddRead', () => {
    const m = body.match(/_intRegroupAdd[\s\S]{0,3500}safeBuilder\('regroupAddRead'/);
    expect(m).not.toBeNull();
  });

  test('regroup-sub topic uses regroupSubRead', () => {
    const m = body.match(/_intRegroupSub[\s\S]{0,3500}safeBuilder\('regroupSubRead'/);
    expect(m).not.toBeNull();
  });

  test('shape topic uses shapeCorners', () => {
    const m = body.match(/_intShape[\s\S]{0,3500}safeBuilder\('shapeCorners'/);
    expect(m).not.toBeNull();
  });

  test('symmetry topic uses symLine', () => {
    const m = body.match(/_intSymmetry[\s\S]{0,3500}safeBuilder\('symLine'/);
    expect(m).not.toBeNull();
  });

  test('money topic uses moneyTotal', () => {
    const m = body.match(/_intMoney[\s\S]{0,3500}safeBuilder\('moneyTotal'/);
    expect(m).not.toBeNull();
  });

  test('time topic uses timeRead', () => {
    const m = body.match(/_intTime[\s\S]{0,3500}safeBuilder\('timeRead'/);
    expect(m).not.toBeNull();
  });

  test('measure topic uses measureRead', () => {
    const m = body.match(/_intMeasure[\s\S]{0,3500}safeBuilder\('measureRead'/);
    expect(m).not.toBeNull();
  });

  test('compare topic uses compareSymbol', () => {
    const m = body.match(/_intCompare\b[\s\S]{0,3500}safeBuilder\('compareSymbol'/);
    expect(m).not.toBeNull();
  });

  test('tally topic uses tallyLeftovers', () => {
    const m = body.match(/_intTally[\s\S]{0,3500}safeBuilder\('tallyLeftovers'/);
    expect(m).not.toBeNull();
  });

  test('line-plot topic uses lpCompare', () => {
    const m = body.match(/_intLinePlot[\s\S]{0,3500}safeBuilder\('lpCompare'/);
    expect(m).not.toBeNull();
  });

  test('equal-sharing topic uses shareEquation', () => {
    const m = body.match(/_intEqualSharing[\s\S]{0,3500}safeBuilder\('shareEquation'/);
    expect(m).not.toBeNull();
  });
});

describe('Dispatcher returns null for topics that should rely on legacy / no intervention', () => {
  test('default fallthrough returns null (skips intervention)', () => {
    const body = bodyOf('_buildTopicAwareIntervention');
    // The switch on `topic` must have a default that returns null
    expect(body).toMatch(/default[\s:]+return null/);
  });

  test('count-on is intentionally NOT in the topic switch (legacy K-dynamic handles it)', () => {
    const body = bodyOf('_buildTopicAwareIntervention');
    expect(body).not.toMatch(/case\s*'count-on'\s*:/);
    expect(body).not.toMatch(/case\s*'skip-count'\s*:/);
    expect(body).not.toMatch(/case\s*'number-line-add'\s*:/);
  });
});

describe('Old "Try a new one" intervention button text is gone', () => {
  test('quiz.js has no "Try a new one" string', () => {
    expect(QUIZ_JS).not.toMatch(/Try a new one/);
  });
  test('intervention button text says "Got it — continue"', () => {
    expect(QUIZ_JS).toMatch(/Got it[ -—]+continue/);
  });
});

describe('Question-swap regression guard still holds', () => {
  test('_resumeQuiz body is minimal (no swap, no selectRetry, no _renderQ, no _answered reset)', () => {
    const body = bodyOf('_resumeQuiz');
    expect(body).not.toMatch(/qz\.questions\[qz\.idx\]\s*=/);
    expect(body).not.toMatch(/selectRetry/);
    expect(body).not.toMatch(/_renderQ\s*\(/);
    expect(body).not.toMatch(/_answered\s*=\s*false/);
  });
});
