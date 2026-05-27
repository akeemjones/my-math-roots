// =============================================================================
//  Quiz Question Stability — Test Suite
//
//  Verifies the core invariant: once a quiz question is shown to the student,
//  the question object stays FROZEN for the entire question lifecycle. No
//  silent swaps to a "skill-matched follow-up" after an intervention.
//
//  Bug context: `_resumeQuiz` previously called `QE.selectRetry` and did
//  `qz.questions[qz.idx] = pick`, replacing the on-screen question with a
//  different one from the same skill bank. The "Try a new one →" intervention
//  button hid the swap. Students saw the new question's options + explanation
//  paired with what they remembered as the original stem, producing the
//  "Correct answer: 3/4" / "Mia explanation" / "circle stem with bar choices"
//  mashups in the screenshots.
//
//  The fix: `_resumeQuiz` no longer mutates `qz.questions[qz.idx]`, does not
//  reset `_answered`, and does not call `_renderQ`. The original answered
//  question card stays on screen; the student clicks Next to advance.
// =============================================================================

'use strict';

const fs   = require('fs');
const path = require('path');

const QUIZ_JS = fs.readFileSync(path.join(__dirname, '..', 'src', 'quiz.js'), 'utf8');

describe('_resumeQuiz must not mutate qz.questions (question stability)', () => {
  test('source contains no qz.questions[qz.idx] = ... assignment', () => {
    // The swap pattern that caused the bug. Should never reappear.
    expect(QUIZ_JS).not.toMatch(/qz\.questions\[qz\.idx\]\s*=\s*pick\b/);
    expect(QUIZ_JS).not.toMatch(/qz\.questions\[qz\.idx\]\s*=\s*[A-Za-z_]/);
  });

  test('source no longer calls QE.selectRetry inside _resumeQuiz', () => {
    // Extract the body of _resumeQuiz and confirm selectRetry is not invoked
    // (it stays defined in question-engine.js but must not be called from
    // _resumeQuiz where it used to drive the swap).
    const m = QUIZ_JS.match(/function\s+_resumeQuiz\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    expect(m).not.toBeNull();
    const body = m[1];
    expect(body).not.toMatch(/QE\.selectRetry/);
    expect(body).not.toMatch(/selectRetry/);
  });

  test('intervention button text no longer says "Try a new one"', () => {
    // The OLD UX promised a new question; the NEW UX keeps the question
    // frozen and just continues. Button text must reflect that.
    expect(QUIZ_JS).not.toMatch(/Try a new one/);
    expect(QUIZ_JS).toMatch(/Got it[ -—]+continue/);
  });

  test('_resumeQuiz body does NOT reset qz._answered = false', () => {
    // Resetting answered would allow the student to re-answer the same
    // question, defeating the stability rule (one answer per question).
    const m = QUIZ_JS.match(/function\s+_resumeQuiz\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    const body = m[1];
    expect(body).not.toMatch(/_answered\s*=\s*false/);
  });

  test('_resumeQuiz body does NOT call _renderQ() (no re-render of swapped question)', () => {
    const m = QUIZ_JS.match(/function\s+_resumeQuiz\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    const body = m[1];
    expect(body).not.toMatch(/_renderQ\s*\(/);
  });
});

// =============================================================================
//  Fraction-question data consistency — spot checks on the three lessons
//  flagged in the user's bug report. Each authored question's correct-answer
//  index MUST point to an option whose value matches the question semantics.
// =============================================================================

describe('G2 u8 fraction question data is internally consistent', () => {
  const U8_JS = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'u8.js'), 'utf8');

  // Brace-counting parser: from the stem position, walk forward and find the
  // matching closing brace of the surrounding question object. Returns the
  // parsed question, or null. Avoids JSON-substring brittleness.
  function questionFor(stem) {
    const stemMarker = '"t":"' + stem + '"';
    const out = [];
    let from = 0;
    while (true) {
      const stemAt = U8_JS.indexOf(stemMarker, from);
      if (stemAt === -1) break;
      // Walk backward to find the '{' that opens this question.
      let openAt = stemAt;
      while (openAt > 0 && U8_JS[openAt] !== '{') openAt--;
      // Walk forward, counting nested braces, to find the matching '}'.
      let depth = 0, end = -1, inStr = false, esc = false;
      for (let i = openAt; i < U8_JS.length; i++) {
        const c = U8_JS[i];
        if (inStr) {
          if (esc) { esc = false; continue; }
          if (c === '\\') { esc = true; continue; }
          if (c === '"') inStr = false;
          continue;
        }
        if (c === '"') { inStr = true; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end === -1) break;
      const slice = U8_JS.slice(openAt, end + 1);
      try { out.push(JSON.parse(slice)); }
      catch (_e) { /* skip unparseable slice — shouldn't happen for authored data */ }
      from = end + 1;
    }
    return out;
  }

  function correctVal(q) {
    const o = q.o[q.a];
    return (o && typeof o === 'object' && 'val' in o) ? o.val : o;
  }

  test('"Which shows one half?" — correct option is 2/4 (NOT 3/4)', () => {
    const qs = questionFor('Which shows one half?');
    expect(qs.length).toBeGreaterThan(0);
    qs.forEach(q => {
      const cv = correctVal(q);
      expect(cv).toMatch(/^(2\/4|1\/2|4\/8)$/);
      expect(cv).not.toBe('3/4');
    });
  });

  test('"Mia colors... still white?" (long form) — correct is 1/4 (NOT 3/4)', () => {
    const qs = questionFor('Mia colors 1/2 of a shape red, then 1/4 of the same shape blue. What fraction of the shape is still white?');
    expect(qs.length).toBeGreaterThan(0);
    qs.forEach(q => {
      expect(correctVal(q)).toBe('1/4');
      expect(q.e).toMatch(/white/i);
    });
  });

  test('"Mia... still white?" (short form) — correct is 1/4', () => {
    const qs = questionFor('Mia colors 1/2 of a shape red, then 1/4 blue. What fraction is still white?');
    expect(qs.length).toBeGreaterThan(0);
    qs.forEach(q => {
      expect(correctVal(q)).toBe('1/4');
    });
  });

  test('"Circle divided into 4. 3 parts colored. Fraction?" — correct is 3/4 with fraction (not bar) choices', () => {
    const qs = questionFor('Circle divided into 4. 3 parts colored. Fraction?');
    expect(qs.length).toBeGreaterThan(0);
    qs.forEach(q => {
      expect(correctVal(q)).toBe('3/4');
      q.o.forEach(opt => {
        const v = (opt && typeof opt === 'object' && 'val' in opt) ? opt.val : opt;
        expect(String(v)).not.toMatch(/bar/i);
      });
      expect(q.e).not.toMatch(/share\s+3\s+bars/i);
    });
  });
});
