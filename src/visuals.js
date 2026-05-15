// ════════════════════════════════════════
//  visuals.js — Programmatic SVG Factory
//  Phase 1: Base-10 blocks · Number lines · Arrays
//
//  Rules:
//  • All functions return SVG strings — no DOM manipulation, no global mutation
//  • All colors via currentColor + opacity — dark mode safe, no hardcoded hex
//  • viewBox drives responsive scaling; CSS max-width:100% does the rest
//  • No external dependencies, no async, no app-state reads
// ════════════════════════════════════════

let _visUid = 0;

// ── Geometry: renders 1–4 named 2D shapes as solid-filled SVGs ───────────────
// Color mode is chosen by item count, with optional cfg overrides:
//
//   1 item     → CALM: one stable muted color per shape name.
//   2 items    → VIVID: two distinct bright colors, offset by item combination.
//   3–4 items  → MONO by default: all shapes the same neutral color.
//               These are typically classify/sort grids where shape contour is
//               already the discriminator and extra color adds noise.
//
//   cfg.mono  = true → force MONO regardless of count.
//   cfg.vivid = true → force VIVID for 3-item comparison visuals where distinct
//               color genuinely improves readability (rare; use deliberately).
//               Has no effect on single-shape visuals (those stay CALM).
//
// Colors never correlate with answer position — offsets derive from item content.
// Intervention visuals (quiz.js) don't call drawShapes, so this doesn't affect them.
// lArgIdx / rArgIdx: when provided for a 2-item config, renders each shape as a
// tappable vchoice button (same pattern as drawComparison / drawTwoGroups).
// When omitted, renders a static SVG grid (normal display mode).
function drawShapes(cfg, lArgIdx, rArgIdx) {
  if (!cfg || !cfg.items || !cfg.items.length) return '';
  const items = cfg.items.slice(0, 4);
  const rotation = cfg.rotation || 0;
  const label = cfg.label || items.join(', ');
  const cols = cfg.cols != null ? cfg.cols : (items.length <= 2 ? items.length : 2);

  const SHAPE_DEFS = {
    circle:    '<circle cx="40" cy="40" r="32"/>',
    triangle:  '<polygon points="40,8 72,72 8,72"/>',
    square:    '<rect x="8" y="8" width="64" height="64"/>',
    rectangle: '<rect x="4" y="16" width="72" height="48"/>',
  };

  // CALM: muted, readable tones for single-shape questions.
  const CALM   = ['#6ba3d6','#e07b6b','#5db87a'];
  // VIVID: bright, clearly distinct for two-shape comparisons.
  const VIVID  = ['#3b82f6','#ef4444','#22c55e','#a855f7','#f97316','#ec4899'];
  // MONO: one neutral that reads well on light and dark card backgrounds.
  const MONO   = '#6b7db3';

  // Deterministic seed: char-code sum of joined item names.
  var seed = 0;
  var key = items.join('');
  for (var k = 0; k < key.length; k++) seed += key.charCodeAt(k);

  // Choose color mode.
  var useMono  = cfg.mono || (items.length >= 3 && !cfg.vivid);
  var useCalm  = !useMono && items.length === 1;

  function _color(i, shape) {
    if (useMono) return MONO;
    if (useCalm) {
      var nh = 0;
      for (var n = 0; n < shape.length; n++) nh += shape.charCodeAt(n);
      return CALM[nh % CALM.length];
    }
    return VIVID[(seed + i) % VIVID.length];
  }

  // ── Tappable mode: N shapes as vchoice answer buttons ────────────────────────
  // lArgIdx is an array of shuffled-opt indices, one per item.
  if (Array.isArray(lArgIdx) && lArgIdx.length >= 2) {
    var argIdxs = lArgIdx;
    var btnSize   = items.length <= 2 ? 120 : 90;
    var gridClass = items.length > 2 ? 'vcmp vcmp-grid' : 'vcmp';
    var btns = items.map(function(shape, i) {
      var color   = _color(i, shape);
      var shapeEl = SHAPE_DEFS[shape] || '';
      var rotatePart = rotation !== 0 ? ' transform="rotate(' + rotation + ',40,40)"' : '';
      var shapeSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"' +
        ' style="width:' + btnSize + 'px;height:' + btnSize + 'px;display:block" focusable="false" aria-hidden="true">' +
        '<g fill="' + color + '"' + rotatePart + '>' + shapeEl + '</g>' +
        '</svg>';
      var argIdx = argIdxs[i];
      return '<button class="vchoice" id="abtn-' + argIdx + '" type="button"' +
        ' data-action="_pickAnswer" data-arg="' + argIdx + '" aria-label="' + _escHtml(shape) + '">' +
        shapeSVG +
        '<span class="vchoice-label">' + _escHtml(shape) + '</span>' +
        '</button>';
    }).join('');
    return '<div class="' + gridClass + '">' + btns + '</div>';
  }

  // ── Static mode: single composite SVG ────────────────────────────────────────
  const cellSize = 80;
  const gap = 12;
  const rows = Math.ceil(items.length / cols);
  const totalW = cols * cellSize + (cols - 1) * gap;
  const totalH = rows * cellSize + (rows - 1) * gap;

  let svgContent = '';
  items.forEach(function(shape, i) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellSize + gap);
    const y = row * (cellSize + gap);
    const shapeEl = SHAPE_DEFS[shape] || '';
    const color = _color(i, shape);
    const transform = rotation !== 0
      ? ' transform="translate(' + x + ',' + y + ') rotate(' + rotation + ',40,40)"'
      : ' transform="translate(' + x + ',' + y + ')"';
    svgContent += '<g' + transform + ' fill="' + color + '" stroke="none">' + shapeEl + '</g>';
  });

  return '<div class="q-visual"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + totalW + ' ' + totalH + '" style="max-width:' + totalW + 'px;width:100%;height:auto;display:block;margin:0 auto" aria-label="' + label + '" role="img">' + svgContent + '</svg></div>';
}

// ════════════════════════════════════════════════════════════════════════════
//  Grade 1 Unit 1 visual renderers
//  Called from _buildVisualHTML for types: tenFrame, fivFrame,
//  dicePattern, domino.  (objectSet re-uses the existing drawObjectSet.)
//
//  Dot positions within a 100×100 half-space (standard dice grid):
//    0:(25,25)  1:(50,25)  2:(75,25)
//    3:(25,50)  4:(50,50)  5:(75,50)
//    6:(25,75)  7:(50,75)  8:(75,75)
// ════════════════════════════════════════════════════════════════════════════

var _G1_DICE_DOTS = {
  0: [],
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 3, 6, 2, 5, 8]
};
var _G1_DICE_XY = [
  [25,25],[50,25],[75,25],
  [25,50],[50,50],[75,50],
  [25,75],[50,75],[75,75]
];

// Return SVG <circle> elements for a dice face, offset by (ox,oy) in the SVG.
function _g1DiceDots(face, ox, oy, r) {
  var indices = _G1_DICE_DOTS[Math.max(0, Math.min(6, +face || 0))] || [];
  return indices.map(function(i) {
    return '<circle cx="' + (ox + _G1_DICE_XY[i][0]) + '" cy="' + (oy + _G1_DICE_XY[i][1]) + '" r="' + r + '" fill="#1e293b"/>';
  }).join('');
}

// Ten-frame: 2 rows × 5 columns, N filled cells (N = 0–10).
// Reuses the .ten-frame / .tf-cell / .tf-fill CSS already defined in styles.css.
//
// Optional config fields (used by L3.1 intervention "Try it this way" visuals;
// all default to off so existing question visuals are unaffected):
//   highlightFromIdx — cells from this index forward render with a green dot
//                      instead of blue, marking "newly added" cells (e.g., +1
//                      shows the 10th cell green when starting from 9).
//   countLabels      — when true, fill cells render the count number 1, 2, …
//                      instead of a dot. Useful for "+0" interventions where
//                      the kid needs to count to confirm the total is unchanged.
//   caption          — small explanatory text rendered below the frame in the
//                      success-accent color (e.g., "9 + 1 = 10").
function _drawTenFrame(cfg) {
  var n = Math.max(0, Math.min(10, +(cfg && cfg.count) || 0));
  var hi      = (cfg && cfg.highlightFromIdx != null) ? Math.max(0, +cfg.highlightFromIdx) : null;
  var labels  = !!(cfg && cfg.countLabels);
  var caption = (cfg && cfg.caption) ? String(cfg.caption) : null;
  var cells = '';
  for (var i = 0; i < 10; i++) {
    var f = i < n;
    var isNew = (hi != null) && i >= hi && i < n;
    var content = '';
    if (f) {
      if (labels) {
        content = '<span style="font-size:0.95rem;font-weight:700;color:#1e3a5f;font-family:var(--ff2,\'Nunito\',sans-serif)">' + (i + 1) + '</span>';
      } else {
        content = isNew ? '🟢' : '🔵';
      }
    }
    cells += '<div class="tf-cell' + (f ? ' tf-fill' : '') + '">' + content + '</div>';
  }
  var html = '<div class="q-visual" style="text-align:center;padding:6px 0">' +
             '<div class="ten-frame">' + cells + '</div>';
  if (caption) {
    html += '<div style="margin-top:10px;font-size:0.95rem;color:#2d7d46;font-weight:700;font-family:var(--ff2,\'Nunito\',sans-serif)">' + _escHtml(caption) + '</div>';
  }
  html += '</div>';
  return html;
}

// Five-frame: 1 row × 5 columns, N filled cells (N = 0–5).
// Same CSS as ten-frame — 5 cells in a 5-column grid = exactly one row.
function _drawFivFrame(cfg) {
  var n = Math.max(0, Math.min(5, +(cfg && cfg.count) || 0));
  var cells = '';
  for (var i = 0; i < 5; i++) {
    var f = i < n;
    cells += '<div class="tf-cell' + (f ? ' tf-fill' : '') + '">' + (f ? '🔵' : '') + '</div>';
  }
  return '<div class="q-visual" style="text-align:center;padding:6px 0">' +
         '<div class="ten-frame">' + cells + '</div></div>';
}

// Dice pattern: standard dot layout for face 1–6, 100×100 SVG.
function _drawDicePattern(cfg) {
  var face = Math.max(1, Math.min(6, +(cfg && cfg.face) || 1));
  var dots = _g1DiceDots(face, 0, 0, 9);
  return '<div class="q-visual" style="text-align:center;padding:6px 0">' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"' +
    ' style="display:block;margin:0 auto" role="img" aria-label="Dice showing ' + face + '">' +
    '<rect x="2" y="2" width="96" height="96" rx="14" fill="#fff" stroke="#1e293b" stroke-width="2.5"/>' +
    dots +
    '</svg></div>';
}

// Domino: two dice halves (left/right, 0–6) side by side in a 208×104 SVG.
// Layout: [2px border] [100px left half] [4px divider] [100px right half] [2px border]
function _drawDomino(cfg) {
  var left  = Math.max(0, Math.min(6, +(cfg && cfg.left)  || 0));
  var right = Math.max(0, Math.min(6, +(cfg && cfg.right) || 0));
  var lDots = _g1DiceDots(left,  2,   2, 8);   // left half offset (2, 2)
  var rDots = _g1DiceDots(right, 106, 2, 8);   // right half offset (106, 2)
  return '<div class="q-visual" style="text-align:center;padding:6px 0">' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 104" width="208" height="104"' +
    ' style="display:block;margin:0 auto" role="img" aria-label="Domino ' + left + ' and ' + right + '">' +
    '<rect x="1" y="1" width="206" height="102" rx="12" fill="#fff" stroke="#1e293b" stroke-width="2"/>' +
    lDots +
    '<line x1="104" y1="6" x2="104" y2="98" stroke="#1e293b" stroke-width="3"/>' +
    rDots +
    '</svg></div>';
}

// ── Entry point called from quiz.js _renderQ() ───────────────────────────────
// Returns HTML string (div or button wrapper) or '' when v is absent/invalid.
function _buildVisualHTML(v) {
  if (!v || !v.type || !v.config) return '';
  if (v.type === 'tenFrame')    return _drawTenFrame(v.config);
  if (v.type === 'fivFrame')    return _drawFivFrame(v.config);
  if (v.type === 'dicePattern') return _drawDicePattern(v.config);
  if (v.type === 'domino')      return _drawDomino(v.config);
  if (v.type === 'tapGroup')     return _buildTapGroupVisual(v.config);
  if (v.type === 'comparison')   return drawComparison(v.config, null, null);
  if (v.type === 'objectSet')    return drawObjectSet(v.config, null);
  if (v.type === 'twoGroups')    return drawTwoGroups(v.config);
  if (v.type === 'shapes')       return drawShapes(v.config);
  if (v.type === 'rawHtml')      return '<div class="vis-box">' + (v.config.html || '') + '</div>';
  if (v.type === 'numberCards')  return drawNumberCards(v.config);
  let svg = '';
  if      (v.type === 'base10')     svg = drawBase10(v.config);
  else if (v.type === 'numberLine') svg = drawNumberLine(v.config);
  else if (v.type === 'array')      svg = drawArray(v.config);
  return svg ? '<div class="q-visual">' + svg + '</div>' : '';
}

// ── Internal: build accessible description for base-10 ───────────────────────
function _b10Label(h, t, o, val) {
  const ps = [];
  if (h > 0) ps.push(h + ' hundred' + (h !== 1 ? 's' : ''));
  if (t > 0) ps.push(t + ' ten'     + (t !== 1 ? 's' : ''));
  if (o > 0) ps.push(o + ' one'     + (o !== 1 ? 's' : ''));
  if (!ps.length) return 'Visual showing zero';
  return 'Visual showing ' + ps.join(', ') + ' \u2014 the number ' + val;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  drawBase10({ hundreds, tens, ones, label? })
//
//  Layout strategy (mobile-first):
//  • Denominations are stacked vertically (hundreds → tens → ones)
//  • Max 3 hundreds per row, max 5 tens per row, max 5 ones per row
//  • viewBox width = max(widest section, 120) + padding × 2
//  • This keeps aspect ratio ≈ 2:1 for typical numbers, scales cleanly at 375px
// ═══════════════════════════════════════════════════════════════════════════════
function drawBase10(cfg) {
  const h = Math.max(0, Math.min(9, +cfg.hundreds || 0));
  const t = Math.max(0, Math.min(9, +cfg.tens     || 0));
  const o = Math.max(0, Math.min(9, +cfg.ones     || 0));
  const uid = 'vis-' + (++_visUid);

  // ── Color palette (kid-friendly, readable on light AND dark panels) ──
  // Hundreds & tens share the blue family so they read as the "groups of ten"
  // denomination. Ones cubes use a warm orange to be unmistakably distinct.
  // Internal grid lines are white@70% so each unit segment is clearly visible
  // (this is what tells a Grade 1 child "one rod is made of 10 ones").
  const C_BLUE_FILL    = '#3B82F6';  // tailwind blue-500
  const C_BLUE_STROKE  = '#1E3A8A';  // blue-900 — strong outline for contrast
  const C_GRID         = '#FFFFFF';  // white interior grid lines on rods/flats
  const C_ORANGE_FILL  = '#F59E0B';  // amber-500 — warm orange/yellow
  const C_ORANGE_STROKE = '#B45309'; // amber-700 — clear outline

  // ── Geometry constants ──
  const U          = 11;  // grid cell size (viewBox units)
  const GAP        = 8;   // gap between sibling blocks in same row
  const LH         = 14;  // denomination label row height
  const SEC_GAP    = 12;  // vertical gap between denomination sections
  const PAD        = 10;  // outer padding on all sides
  const H_PER_ROW  = 3;   // max hundreds per row
  const T_PER_ROW  = 5;   // max tens per row
  const O_PER_ROW  = 5;   // max ones per row

  // Block sizes in viewBox units
  const HW = 10 * U, HH = 10 * U;  // hundred: 80×80 (10×10 grid of U-cells)
  const TW = U,      TH = 10 * U;  // ten rod: 8×80  (1×10 strip of U-cells)
  const OW = U,      OH = U;       // one cube: 8×8

  // Row/col counts per denomination
  const hRows = h > 0 ? Math.ceil(h / H_PER_ROW) : 0;
  const tRows = t > 0 ? Math.ceil(t / T_PER_ROW) : 0;
  const oRows = o > 0 ? Math.ceil(o / O_PER_ROW) : 0;

  // Width of widest row in each section
  const wH = h > 0 ? Math.min(h, H_PER_ROW) * HW + (Math.min(h, H_PER_ROW) - 1) * GAP : 0;
  const wT = t > 0 ? Math.min(t, T_PER_ROW) * TW + (Math.min(t, T_PER_ROW) - 1) * GAP : 0;
  const wO = o > 0 ? Math.min(o, O_PER_ROW) * OW + (Math.min(o, O_PER_ROW) - 1) * GAP : 0;

  // Only show denomination labels when ≥2 denominations are non-zero
  const nonZero     = [h > 0, t > 0, o > 0].filter(Boolean).length;
  const showLabels  = nonZero > 1;
  const labH        = showLabels ? LH + GAP : 0;

  // Height of each denomination section (0 when empty)
  const hSecH = h > 0 ? labH + hRows * HH + Math.max(0, hRows - 1) * GAP : 0;
  const tSecH = t > 0 ? labH + tRows * TH + Math.max(0, tRows - 1) * GAP : 0;
  const oSecH = o > 0 ? labH + oRows * OH + Math.max(0, oRows - 1) * GAP : 0;

  const W = Math.max(wH, wT, wO, 120) + PAD * 2;
  const H = PAD * 2 + hSecH + tSecH + oSecH + Math.max(0, nonZero - 1) * SEC_GAP;

  const parts = [];
  let curY = PAD;

  const val   = h * 100 + t * 10 + o;
  const label = cfg.label || _b10Label(h, t, o, val);

  // ── Hundreds ──
  if (h > 0) {
    if (showLabels) {
      parts.push(`<text x="${PAD}" y="${curY + LH - 2}" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">Hundreds</text>`);
      curY += LH + GAP;
    }
    for (let i = 0; i < h; i++) {
      const row = Math.floor(i / H_PER_ROW), col = i % H_PER_ROW;
      const bx = PAD + col * (HW + GAP), by = curY + row * (HH + GAP);
      // Hundreds flat — solid blue with white 10×10 grid showing 100 unit cubes
      parts.push(`<rect x="${bx}" y="${by}" width="${HW}" height="${HH}" fill="${C_BLUE_FILL}" stroke="${C_BLUE_STROKE}" stroke-width="1" rx="1"/>`);
      // 10×10 inner grid lines (white, semi-transparent)
      for (let r = 1; r < 10; r++) {
        parts.push(`<line x1="${bx}" y1="${by + r*U}" x2="${bx+HW}" y2="${by + r*U}" stroke="${C_GRID}" opacity="0.7" stroke-width="0.5"/>`);
        parts.push(`<line x1="${bx + r*U}" y1="${by}" x2="${bx + r*U}" y2="${by+HH}" stroke="${C_GRID}" opacity="0.7" stroke-width="0.5"/>`);
      }
    }
    curY += hRows * HH + Math.max(0, hRows - 1) * GAP;
    if (t > 0 || o > 0) curY += SEC_GAP;
  }

  // ── Tens ──
  if (t > 0) {
    if (showLabels) {
      parts.push(`<text x="${PAD}" y="${curY + LH - 2}" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">Tens</text>`);
      curY += LH + GAP;
    }
    for (let i = 0; i < t; i++) {
      const row = Math.floor(i / T_PER_ROW), col = i % T_PER_ROW;
      const bx = PAD + col * (TW + GAP), by = curY + row * (TH + GAP);
      // Tens rod — solid blue with white horizontal dividers showing 10 unit segments
      parts.push(`<rect x="${bx}" y="${by}" width="${TW}" height="${TH}" fill="${C_BLUE_FILL}" stroke="${C_BLUE_STROKE}" stroke-width="1" rx="0.5"/>`);
      // 9 horizontal segment dividers (white, semi-transparent)
      for (let r = 1; r < 10; r++) {
        parts.push(`<line x1="${bx}" y1="${by + r*U}" x2="${bx+TW}" y2="${by + r*U}" stroke="${C_GRID}" opacity="0.7" stroke-width="0.6"/>`);
      }
    }
    curY += tRows * TH + Math.max(0, tRows - 1) * GAP;
    if (o > 0) curY += SEC_GAP;
  }

  // ── Ones ──
  if (o > 0) {
    if (showLabels) {
      parts.push(`<text x="${PAD}" y="${curY + LH - 2}" font-size="11" fill="currentColor" opacity="0.55" font-family="sans-serif">Ones</text>`);
      curY += LH + GAP;
    }
    for (let i = 0; i < o; i++) {
      const row = Math.floor(i / O_PER_ROW), col = i % O_PER_ROW;
      const bx = PAD + col * (OW + GAP), by = curY + row * (OH + GAP);
      // Ones cube — solid orange/amber with darker outline (visually distinct from blue rods)
      parts.push(`<rect x="${bx}" y="${by}" width="${OW}" height="${OH}" fill="${C_ORANGE_FILL}" stroke="${C_ORANGE_STROKE}" stroke-width="1" rx="0.5"/>`);
    }
  }

  return `<svg role="img" aria-labelledby="${uid}" focusable="false" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;max-width:100%;height:auto"><title id="${uid}">${_escHtml(label)}</title>${parts.join('')}</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  drawNumberLine({ min, max, ticks[], jumps?:[{from,to,label,hideToLabel?}],
//                   mark?, hideLabels?:number[] })
//
//  • Fixed height, width derived from tick count × pitch
//  • Jump arcs drawn as quadratic SVG curves above the baseline
//  • mark highlights the start tick (bold, full opacity)
//  • hideLabels: suppress number labels for these tick values (tick line still shown)
//  • jump.hideToLabel: suppress the destination tick label for a jump
//    (used in assessment mode so the answer is not readable from the visual)
// ═══════════════════════════════════════════════════════════════════════════════
function drawNumberLine(cfg) {
  const uid  = 'vis-' + (++_visUid);
  const min  = +cfg.min || 0;
  const max  = +cfg.max || 10;
  const ticks = (cfg.ticks && cfg.ticks.length) ? cfg.ticks : [min, max];
  const jumps = cfg.jumps || [];
  const mark  = cfg.mark != null ? +cfg.mark : null;
  // Optional second emphasized tick — used by intervention/worked-example visuals
  // to highlight the answer tick (the count-on destination). Renders in the
  // theme's success/accent color with bold weight, distinct from the start mark.
  const endMark = cfg.endMark != null ? +cfg.endMark : null;

  // ── Assessment-mode: build set of tick labels to suppress ──
  // hideLabels config + any jump destination marked hideToLabel:true
  const hideSet = new Set((cfg.hideLabels || []).map(Number));
  jumps.forEach(j => { if (j.hideToLabel) hideSet.add(Number(j.to)); });
  const assessMode     = cfg.mode === 'assessment';
  const explicitLabels = cfg.labels != null ? cfg.labels : {};

  const PAD_L  = 20, PAD_R = 24, PAD_T = 42, PAD_B = 28;
  const n  = ticks.length;
  // Dynamic pitch: wider when few ticks, narrower when many (e.g. every-integer number lines)
  const PITCH  = n <= 6 ? 56 : n <= 12 ? 40 : 30;
  const W  = PAD_L + (n - 1) * PITCH + PAD_R;
  const LINE_Y = PAD_T;
  const H  = LINE_Y + PAD_B;

  const range   = (max - min) || 1;
  const valToX  = v => PAD_L + ((v - min) / range) * ((n - 1) * PITCH);

  const parts = [];

  // ── Baseline ──
  parts.push(`<line x1="${PAD_L - 6}" y1="${LINE_Y}" x2="${W - PAD_R + 6}" y2="${LINE_Y}" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`);
  // Arrowhead at right end
  parts.push(`<polygon points="${W-PAD_R+14},${LINE_Y} ${W-PAD_R+4},${LINE_Y-4.5} ${W-PAD_R+4},${LINE_Y+4.5}" fill="currentColor" opacity="0.6"/>`);

  // ── Jump arcs (drawn first so ticks render on top) ──
  jumps.forEach(j => {
    const x1 = valToX(j.from), x2 = valToX(j.to);
    const mx  = (x1 + x2) / 2;
    const ah  = Math.min(26, Math.abs(x2 - x1) * 0.45 + 8);
    const cy  = LINE_Y - ah;
    parts.push(`<path d="M${x1} ${LINE_Y} Q${mx} ${cy} ${x2} ${LINE_Y}" fill="none" stroke="currentColor" opacity="0.65" stroke-width="2.2" stroke-linecap="round"/>`);
    if (j.label != null) {
      parts.push(`<text x="${mx}" y="${cy - 4}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.85" font-family="sans-serif" font-weight="bold">${_escHtml(String(j.label))}</text>`);
    }
  });

  // ── Ticks and labels ──
  const tickFont = n <= 6 ? 13 : n <= 12 ? 11 : 9;
  ticks.forEach(v => {
    const x      = valToX(v);
    const isMark    = v === mark;
    const isEndMark = endMark != null && v === endMark;
    const key    = String(v);

    const showLabel = assessMode
      ? isMark || isEndMark || (key in explicitLabels)
      : isMark || isEndMark || !hideSet.has(v);

    const labelText = (assessMode && key in explicitLabels)
      ? explicitLabels[key]
      : String(v);

    // Stroke weight: bold for both start (mark) and end (endMark)
    const strokeW   = (isMark || isEndMark) ? 3 : 1.5;
    // Color: endMark uses a success-style accent so the answer pops vs the start
    const strokeCol = isEndMark ? '#2d7d46' : 'currentColor';
    const tickOp    = (isMark || isEndMark) ? 1 : 0.65;
    parts.push(`<line x1="${x}" y1="${LINE_Y - 8}" x2="${x}" y2="${LINE_Y + 8}" stroke="${strokeCol}" stroke-width="${strokeW}" opacity="${tickOp}"/>`);
    if (showLabel) {
      const labelCol = isEndMark ? '#2d7d46' : 'currentColor';
      const labelOp  = (isMark || isEndMark) ? 1 : 0.8;
      const labelWt  = (isMark || isEndMark) ? ' font-weight="bold"' : '';
      parts.push(`<text x="${x}" y="${LINE_Y + 22}" text-anchor="middle" font-size="${tickFont}" fill="${labelCol}" opacity="${labelOp}" font-family="sans-serif"${labelWt}>${_escHtml(labelText)}</text>`);
    }
  });

  // ── Aria label ──
  let ariaLabel;
  if (assessMode) {
    ariaLabel = mark != null ? `Number line starting at ${mark}` : 'Number line';
    if (jumps.length) {
      const desc = jumps.map(j => {
        const step = j.label != null ? j.label : (j.to - j.from);
        return +step < 0 ? 'one step backward' : 'one step forward';
      }).join(' and ');
      ariaLabel += ` with ${desc}`;
    }
  } else {
    ariaLabel = `Number line from ${min} to ${max}`;
    if (jumps.length) {
      ariaLabel += ' showing ' + jumps.map(j =>
        `a jump of ${j.label != null ? j.label : j.to - j.from} from ${j.from} to ${j.to}`
      ).join(' and ');
    }
    if (mark != null) ariaLabel += `, starting at ${mark}`;
  }
  const label = cfg.label || ariaLabel;

  return `<svg role="img" aria-labelledby="${uid}" focusable="false" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;max-width:100%;height:auto"><title id="${uid}">${_escHtml(label)}</title>${parts.join('')}</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  drawComparison({ left:{label,barLen,color}, right:{label,barLen,color} },
//                 leftArgIdx, rightArgIdx [, highlightSide])
//
//  barLen: integer 1–10 — proportional bar width (barLen * 14px, max 140px)
//  label:  display text shown below bar (may have leading emoji)
//
//  leftArgIdx / rightArgIdx: shuffled button indices from _renderQ().
//    Numbers → wraps each panel in a clickable <button id="abtn-N">
//    null    → renders static <div class="q-visual vcmp">
//
//  highlightSide: 'left'|'right'|null — used only for static mode (null indices).
//    Highlights correct panel green + ✓ for intervention review.
// ═══════════════════════════════════════════════════════════════════════════════
function drawComparison(cfg, leftArgIdx, rightArgIdx, highlightSide) {
  var uid   = 'vis-' + (++_visUid);
  var left  = cfg.left  || {};
  var right = cfg.right || {};
  var isClickable = leftArgIdx != null && rightArgIdx != null;

  function _hBar(item) {
    var W = 160, H = 52;
    var barW = Math.max(10, (+item.barLen || 5) * 14);
    return '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"'+
           ' focusable="false" aria-hidden="true" style="display:block">'+
      '<line x1="6" y1="8" x2="6" y2="44" stroke="'+(item.color||'#3b82f6')+'"'+
            ' stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>'+
      '<rect x="6" y="18" width="'+barW+'" height="16" rx="5"'+
            ' fill="'+(item.color||'#3b82f6')+'" opacity="0.82"/>'+
      '</svg>';
  }

  var lSVG = _hBar(left);
  var rSVG = _hBar(right);
  var lLbl = _escHtml(left.label  || '');
  var rLbl = _escHtml(right.label || '');
  var ariaLbl = _escHtml('Compare ' + (left.label||'left') + ' and ' + (right.label||'right'));

  if (isClickable) {
    return '<div class="vcmp" id="'+uid+'" aria-label="'+ariaLbl+'">'+
      '<button class="vchoice" id="abtn-'+leftArgIdx+'" type="button"'+
              ' data-action="_pickAnswer" data-arg="'+leftArgIdx+'"'+
              ' aria-label="'+lLbl+'">'+
        lSVG+'<span class="vchoice-label">'+lLbl+'</span>'+
      '</button>'+
      '<button class="vchoice" id="abtn-'+rightArgIdx+'" type="button"'+
              ' data-action="_pickAnswer" data-arg="'+rightArgIdx+'"'+
              ' aria-label="'+rLbl+'">'+
        rSVG+'<span class="vchoice-label">'+rLbl+'</span>'+
      '</button>'+
    '</div>';
  } else {
    var lClass = 'vchoice-static' + (highlightSide === 'left'  ? ' vchoice-hl-correct' : highlightSide ? ' vchoice-hl-faded' : '');
    var rClass = 'vchoice-static' + (highlightSide === 'right' ? ' vchoice-hl-correct' : highlightSide ? ' vchoice-hl-faded' : '');
    var lTick  = highlightSide === 'left'  ? '<span class="vchoice-tick">✓</span>' : '';
    var rTick  = highlightSide === 'right' ? '<span class="vchoice-tick">✓</span>' : '';
    return '<div class="q-visual vcmp" id="'+uid+'" aria-label="'+ariaLbl+'">'+
      '<div class="'+lClass+'">'+lSVG+'<span class="vchoice-label">'+lLbl+'</span>'+lTick+'</div>'+
      '<div class="'+rClass+'">'+rSVG+'<span class="vchoice-label">'+rLbl+'</span>'+rTick+'</div>'+
    '</div>';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  drawArray({ rows, cols, filled?, missingMark? })  — "dot grid" to students
//
//  • Dot grid capped at 10×10
//  • filled:       how many dots are solid (default: rows × cols)
//  • missingMark:  show first unfilled dot as a dashed ring (for "what's missing?" questions)
// ═══════════════════════════════════════════════════════════════════════════════
function drawArray(cfg) {
  const uid    = 'vis-' + (++_visUid);
  const rows   = Math.max(1, Math.min(10, +cfg.rows || 1));
  const cols   = Math.max(1, Math.min(10, +cfg.cols || 1));
  const total  = rows * cols;
  const filled = cfg.filled != null ? Math.max(0, Math.min(total, +cfg.filled)) : total;
  const missingMark = !!cfg.missingMark;

  const DOT_R = 8, PITCH = 24, PAD = 12;

  const W = PAD * 2 + (cols - 1) * PITCH + DOT_R * 2;
  const H = PAD * 2 + (rows - 1) * PITCH + DOT_R * 2;

  const parts = [];
  let dotNum  = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = PAD + DOT_R + c * PITCH;
      const cy = PAD + DOT_R + r * PITCH;
      dotNum++;
      if (dotNum <= filled) {
        // Filled dot
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${DOT_R}" fill="currentColor" opacity="0.72"/>`);
      } else if (missingMark && dotNum === filled + 1) {
        // First missing slot — dashed ring to indicate "something belongs here"
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${DOT_R}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,2" opacity="0.55"/>`);
      } else {
        // Empty slot — faint fill so the grid shape is visible
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${DOT_R}" fill="currentColor" opacity="0.1"/>`);
      }
    }
  }

  const label = cfg.label || `${rows} rows and ${cols} columns of dots, ${filled} of ${total} filled`;

  return `<svg role="img" aria-labelledby="${uid}" focusable="false" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;max-width:100%;height:auto"><title id="${uid}">${_escHtml(label)}</title>${parts.join('')}</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  drawObjectSet({count, emoji, layout}, argIdx)
//
//  count: number of objects (1–20)   emoji: display character
//  groups: number of groups (optional, enables grouped rendering)
//  groupSize: objects per group (required when groups is set)
//  layout: 'grid' | 'line'  (ignored for answer buttons — always compact)
//  argIdx: null → static question visual  |  number → clickable answer button
// ─────────────────────────────────────────────────────────────────────────────
function drawObjectSet(config, argIdx) {
  var emoji   = config.emoji  || '●';
  var isBtn   = argIdx != null;

  // Grouped rendering (skip count)
  var groups    = +config.groups    || 0;
  var groupSize = +config.groupSize || 0;
  if (groups && groupSize) {
    var groupsArr = [];
    for (var g = 0; g < groups; g++) {
      groupsArr.push('<span class="obj-group">' +
        Array(groupSize).fill(emoji).join('​') +
        '</span>');
    }
    var gridHTML = '<div class="obj-set-grid" style="display:flex; flex-direction:row; gap:0.5em">' +
      groupsArr.join('') +
      '</div>';
    if (isBtn) {
      var totalCount = groups * groupSize;
      return '<button class="vchoice" id="abtn-'+argIdx+'" type="button"'+
             ' data-action="_pickAnswer" data-arg="'+argIdx+'"'+
             ' aria-label="'+totalCount+' '+_escHtml(emoji)+'">'+
        gridHTML+
        '<span class="vchoice-label">'+totalCount+'</span>'+
      '</button>';
    }
    return '<div class="q-visual obj-set-visual">'+gridHTML+'</div>';
  }

  // Flat rendering (original behavior + optional teaching annotations)
  //
  // Optional config fields (used by L3.2 intervention "Try it this way" visuals;
  // both default to off so existing question objectSet visuals are unaffected):
  //   crossedFromIdx — emojis from this index forward render with a
  //                    red strikethrough overlay, marking "removed" items.
  //   caption        — small accent-colored explanatory line below the grid.
  var count   = +config.count || 0;
  var crossFrom = (config.crossedFromIdx != null) ? Math.max(0, +config.crossedFromIdx) : null;
  var caption = config.caption ? String(config.caption) : null;
  var MAX_ROW = isBtn ? 5 : (config.layout === 'line' ? 20 : 5);
  var rows = [], rem = count, idxSeen = 0;
  while (rem > 0) {
    var n = Math.min(rem, MAX_ROW);
    var rowHTML;
    if (crossFrom != null) {
      var pieces = [];
      for (var k = 0; k < n; k++) {
        var crossed = (idxSeen + k) >= crossFrom;
        if (crossed) {
          pieces.push('<span style="text-decoration:line-through;text-decoration-color:#dc2626;text-decoration-thickness:3px;opacity:0.55">' + emoji + '</span>');
        } else {
          pieces.push(emoji);
        }
      }
      rowHTML = pieces.join('​');
    } else {
      rowHTML = Array(n).fill(emoji).join('​');
    }
    rows.push(rowHTML);
    rem -= n;
    idxSeen += n;
  }
  var gridHTML = '<div class="obj-set-grid">' +
    rows.map(function(r){ return '<div class="obj-row">' + r + '</div>'; }).join('') +
    '</div>';
  if (isBtn) {
    return '<button class="vchoice" id="abtn-'+argIdx+'" type="button"'+
           ' data-action="_pickAnswer" data-arg="'+argIdx+'"'+
           ' aria-label="'+count+' '+_escHtml(emoji)+'">'+
      gridHTML+
      '<span class="vchoice-label">'+count+'</span>'+
    '</button>';
  }
  var html = '<div class="q-visual obj-set-visual">' + gridHTML;
  if (caption) {
    html += '<div style="margin-top:10px;font-size:0.95rem;color:#2d7d46;font-weight:700;font-family:var(--ff2,\'Nunito\',sans-serif)">' + _escHtml(caption) + '</div>';
  }
  html += '</div>';
  return html;
}


// ─────────────────────────────────────────────────────────────────────────────
//  drawTwoGroups({leftCount, leftObj, rightCount, rightObj, op},
//               leftArgIdx, rightArgIdx)
//
//  leftArgIdx / rightArgIdx: shuffled button indices from _renderQ().
//    Numbers → wraps each group in a clickable <button id="abtn-N">
//    null    → renders static <div class="q-visual two-groups-visual">
//  op: 'add' | 'subtract'
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
//  _drawShapeSVG(shapeName)
//
//  Returns an inline SVG for circle / triangle / square / rectangle.
//  Uses fill="currentColor" so CSS color classes drive appearance in dark mode.
//  viewBox 64×64 fits inside the 84×84 tap-shape button with padding.
// ─────────────────────────────────────────────────────────────────────────────
function _drawShapeSVG(shape) {
  var vb = '0 0 64 64';
  var inner = '';
  if (shape === 'circle') {
    inner = '<circle cx="32" cy="32" r="27" fill="currentColor" opacity="0.85"/>';
  } else if (shape === 'triangle') {
    inner = '<polygon points="32,6 60,58 4,58" fill="currentColor" opacity="0.85"/>';
  } else if (shape === 'square') {
    inner = '<rect x="7" y="7" width="50" height="50" rx="3" fill="currentColor" opacity="0.85"/>';
  } else if (shape === 'rectangle') {
    inner = '<rect x="4" y="16" width="56" height="32" rx="3" fill="currentColor" opacity="0.85"/>';
  } else {
    inner = '<rect x="7" y="7" width="50" height="50" rx="3" fill="currentColor" opacity="0.85"/>';
  }
  return '<svg viewBox="'+vb+'" width="48" height="48" focusable="false" aria-hidden="true" style="display:block;pointer-events:none">'+inner+'</svg>';
}
window._drawShapeSVG = _drawShapeSVG;

// ─────────────────────────────────────────────────────────────────────────────
//  _buildTapGroupVisual(config)
//
//  Static renderer — used in review mode (no buttons, shows correct/wrong
//  state via CSS classes on the wrapper). Interactive version lives in quiz.js.
// ─────────────────────────────────────────────────────────────────────────────
function _buildTapGroupVisual(config) {
  var shapes = (config && config.shapes) || [];
  var items = shapes.map(function(s) {
    return '<div class="tap-shape-static tg-shape-' + _escHtml(s.shape) + '">' +
      _drawShapeSVG(s.shape) +
      '<span class="tg-shape-label">' + _escHtml(s.shape) + '</span>' +
    '</div>';
  });
  return '<div class="q-visual tap-group-static">' + items.join('') + '</div>';
}

function drawTwoGroups(config, leftArgIdx, rightArgIdx) {
  var lCount = +(config.leftCount)  || 0;
  var rCount = +(config.rightCount) || 0;
  var lEmoji = (config.leftObj  || '●').repeat(lCount);
  var rEmoji = (config.rightObj || '●').repeat(rCount);
  var opStr  = config.op === 'subtract' ? '−' : config.op === 'compare' ? 'vs' : '+';
  // Optional caption (used by L3.3 intervention "Try it this way" visuals;
  // defaults to off so existing question/twoGroups visuals are unaffected).
  var caption = config.caption ? String(config.caption) : null;

  function _groupBtn(emoji, count, argIdx) {
    return '<button class="vchoice" id="abtn-'+argIdx+'" type="button"'+
           ' data-action="_pickAnswer" data-arg="'+argIdx+'"'+
           ' aria-label="'+count+'">'+
      '<div class="tg-group">'+emoji+'</div>'+
    '</button>';
  }

  var leftHTML  = leftArgIdx  != null ? _groupBtn(lEmoji, lCount, leftArgIdx)  : '<div class="tg-group">'+lEmoji+'</div>';
  var rightHTML = rightArgIdx != null ? _groupBtn(rEmoji, rCount, rightArgIdx) : '<div class="tg-group">'+rEmoji+'</div>';

  var wrapClass = 'q-visual two-groups-visual' + (leftArgIdx != null && rightArgIdx != null ? ' two-groups-compare' : '');
  var html = '<div class="'+wrapClass+'">'+
    leftHTML+
    '<div class="tg-op">'+opStr+'</div>'+
    rightHTML+
  '</div>';
  if (caption) {
    html += '<div style="margin-top:10px;font-size:0.95rem;color:#2d7d46;font-weight:700;font-family:var(--ff2,\'Nunito\',sans-serif);text-align:center">' + _escHtml(caption) + '</div>';
  }
  return html;
}

// ── numberCards: shows 2–4 numbers as place-value cards for ordering examples ─
// config: { cards: [{value, note?}], layout: 'ordered'|'input' }
//   ordered → cards appear left-to-right in sorted order with a chevron between
//   input   → cards appear in original (prompt) order, no chevrons
// Typical use: teach tens-first ordering ("2 tens", "4 tens", "8 tens").
function drawNumberCards(cfg) {
  var cards  = Array.isArray(cfg.cards) ? cfg.cards : [];
  var layout = cfg.layout || 'input';
  if (!cards.length) return '';

  var items = cards.map(function(card) {
    var noteHTML = card.note
      ? '<div class="nc-note">' + _escHtml(String(card.note)) + '</div>'
      : '';
    return '<div class="nc-card">' +
      '<div class="nc-value">' + _escHtml(String(card.value)) + '</div>' +
      noteHTML +
    '</div>';
  });

  var sep = layout === 'ordered' ? '<div class="nc-arrow">›</div>' : '';
  var inner = items.join(sep);

  return '<div class="q-visual">' +
    '<div class="nc-row">' + inner + '</div>' +
  '</div>';
}

// Renders 4 coin SVGs as tappable vchoice buttons.
// config.coins: ordered array of coin names matching the shuffled opts indices.
// optIdxs: parallel array of shuffled option indices for data-arg routing.
// Requires window.coinSVG (loaded by coin_assets.js for K Unit 8).
function drawCoinChoices(config, optIdxs) {
  var coins = config.coins || [];
  var coinFn = (typeof window !== 'undefined' && window.coinSVG) ? window.coinSVG : function(){ return ''; };
  var buttons = coins.map(function(name, i){
    var oi = optIdxs[i];
    return '<button class="vchoice" type="button" data-action="_pickAnswer" data-arg="'+oi+'" id="abtn-'+oi+'" aria-label="'+name+'" style="width:120px;height:120px;display:flex;align-items:center;justify-content:center;padding:0">'+
      coinFn(name, 90)+
    '</button>';
  }).join('');
  return '<div class="q-visual"><div class="vcmp-grid" style="display:grid;grid-template-columns:repeat(2,120px);gap:16px;padding:8px;justify-content:center">'+buttons+'</div></div>';
}

// ── drawImgChoice — generic 2-or-4 tappable picture grid ────────────────────
// Renders pre-built SVG/HTML picture strings as equal-size tappable choice
// cards. Used when the answer choices ARE the pictures themselves (e.g.,
// "Which picture shows: 'X is N units long'?"), so tapping the picture is
// the answer — no separate Picture A/B/C/D buttons.
//
// All cards share identical outer dimensions so the picture size never
// reveals the answer. The student decides by reading the picture content,
// not by spotting which card is wider.
//
// items:   array of short labels (e.g., ['A','B','C','D']) — used for a
//          small badge AND the aria-label fallback.
// svgs:    array of SVG/HTML strings (one per item), all rendered inside
//          fixed-size cards. The SVGs scale to fit via CSS.
// optIdxs: parallel array of shuffled option indices for data-arg routing.
//          The button id "abtn-<oi>" must match so _pickAnswer's
//          correct/wrong/selected class toggles still work.
function drawImgChoice(items, svgs, optIdxs) {
  var cells = items.map(function(label, i) {
    var oi = optIdxs[i];
    var safeLabel = _escHtml(label);
    return '<button class="vimg-card" type="button" data-action="_pickAnswer" ' +
      'data-arg="' + oi + '" id="abtn-' + oi + '" aria-label="Picture ' + safeLabel + '">' +
      '<span class="vimg-label">' + safeLabel + '</span>' +
      '<span class="vimg-svg">' + (svgs[i] || '') + '</span>' +
      '</button>';
  }).join('');
  return '<div class="q-visual"><div class="vimg-grid" role="group" aria-label="Picture choices">' + cells + '</div></div>';
}
