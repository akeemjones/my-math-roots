'use strict';
// ────────────────────────────────────────────────────────────────────────────
// Regression guard: dark-mode Key Ideas (.kp-button) card contrast.
//
// Bug: .kp-button hardcodes `background:#fff` but `color:var(--txt)`. In dark
// mode --txt flips to white (#ffffff), leaving white text on a white card —
// the lesson Key Ideas text became invisible (number badge + arrow stayed
// visible because they carry inline accent colors).
//
// Fix: a SCOPED `body.dark .kp-button` rule gives the card a dark surface so the
// existing light text is legible. There is no CSS-rendering harness in this
// repo, so this is a source-contract guard (same pattern as build-output and
// the send-push source-contract tests). Verified visually in both themes via
// the preview at the time of the fix.
// ────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles.css'), 'utf8');

function ruleBody(selectorRegexSource) {
  const re = new RegExp(selectorRegexSource + '\\s*\\{([^}]*)\\}');
  const m = css.match(re);
  return m ? m[1] : null;
}

describe('dark-mode Key Ideas card contrast', () => {
  test('a scoped body.dark .kp-button rule exists', () => {
    expect(css).toMatch(/body\.dark\s+\.kp-button\s*\{/);
  });

  test('the dark-mode card sets its own background (not inheriting the light #fff)', () => {
    const body = ruleBody('body\\.dark\\s+\\.kp-button');
    expect(body).not.toBeNull();
    const bg = (body.match(/background\s*:\s*([^;]+)/) || [])[1];
    expect(bg).toBeTruthy();
    // Must NOT be opaque white — that would re-create the white-on-white bug.
    // A low-alpha white over the dark page (rgba(255,255,255,.06)) is fine.
    const norm = bg.trim().toLowerCase().replace(/\s+/g, '');
    expect(norm).not.toBe('#fff');
    expect(norm).not.toBe('#ffffff');
    expect(norm).not.toBe('white');
    expect(norm).not.toBe('rgb(255,255,255)');
  });

  test('light mode is untouched: base .kp-button keeps its #fff background', () => {
    const base = ruleBody('(?<![\\w-])\\.kp-button');
    expect(base).not.toBeNull();
    expect(base).toMatch(/background\s*:\s*#fff/);
  });

  test('the fix is scoped to .kp-button (does not blanket-restyle every dark card)', () => {
    // The dark override targets the Key Ideas button specifically.
    expect(css).toMatch(/body\.dark\s+\.kp-button/);
    // Sanity: there is no over-broad `body.dark *` / `body.dark .card` text-color reset bundled with it.
    expect(css).not.toMatch(/body\.dark\s+\*\s*\{[^}]*color/);
  });
});
