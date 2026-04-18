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

// ── Entry point called from quiz.js _renderQ() ───────────────────────────────
// Returns HTML string (div or button wrapper) or '' when v is absent/invalid.
function _buildVisualHTML(v) {
  if (!v || !v.type || !v.config) return '';
  if (v.type === 'comparison') return drawComparison(v.config, null, null);
  if (v.type === 'objectSet')  return drawObjectSet(v.config, null);
  if (v.type === 'twoGroups')  return drawTwoGroups(v.config);
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
      // Block body
      parts.push(`<rect x="${bx}" y="${by}" width="${HW}" height="${HH}" fill="currentColor" opacity="0.09" stroke="currentColor" stroke-width="0.8" rx="1"/>`);
      // 10×10 inner grid lines
      for (let r = 1; r < 10; r++) {
        parts.push(`<line x1="${bx}" y1="${by + r*U}" x2="${bx+HW}" y2="${by + r*U}" stroke="currentColor" opacity="0.2" stroke-width="0.3"/>`);
        parts.push(`<line x1="${bx + r*U}" y1="${by}" x2="${bx + r*U}" y2="${by+HH}" stroke="currentColor" opacity="0.2" stroke-width="0.3"/>`);
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
      // Rod body — denser opacity than hundreds to visually distinguish
      parts.push(`<rect x="${bx}" y="${by}" width="${TW}" height="${TH}" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="0.8" rx="0.5"/>`);
      // 9 horizontal segment dividers
      for (let r = 1; r < 10; r++) {
        parts.push(`<line x1="${bx}" y1="${by + r*U}" x2="${bx+TW}" y2="${by + r*U}" stroke="currentColor" opacity="0.4" stroke-width="0.4"/>`);
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
      // Solid cube — highest opacity to distinguish from tens and hundreds
      parts.push(`<rect x="${bx}" y="${by}" width="${OW}" height="${OH}" fill="currentColor" opacity="0.55" stroke="currentColor" stroke-width="0.8" rx="0.5"/>`);
    }
  }

  return `<svg role="img" aria-labelledby="${uid}" focusable="false" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;max-width:100%;height:auto"><title id="${uid}">${_escHtml(label)}</title>${parts.join('')}</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  drawNumberLine({ min, max, ticks[], jumps?:[{from,to,label}], mark? })
//
//  • Fixed height, width derived from tick count × pitch
//  • Jump arcs drawn as quadratic SVG curves above the baseline
//  • mark highlights the destination tick (bold, full opacity)
// ═══════════════════════════════════════════════════════════════════════════════
function drawNumberLine(cfg) {
  const uid  = 'vis-' + (++_visUid);
  const min  = +cfg.min || 0;
  const max  = +cfg.max || 10;
  const ticks = (cfg.ticks && cfg.ticks.length) ? cfg.ticks : [min, max];
  const jumps = cfg.jumps || [];
  const mark  = cfg.mark != null ? +cfg.mark : null;

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
    const isMark = v === mark;
    parts.push(`<line x1="${x}" y1="${LINE_Y - 8}" x2="${x}" y2="${LINE_Y + 8}" stroke="currentColor" stroke-width="${isMark ? 3 : 1.5}" opacity="${isMark ? 1 : 0.65}"/>`);
    parts.push(`<text x="${x}" y="${LINE_Y + 22}" text-anchor="middle" font-size="${tickFont}" fill="currentColor" opacity="${isMark ? 1 : 0.8}" font-family="sans-serif"${isMark ? ' font-weight="bold"' : ''}>${v}</text>`);
  });

  // ── Aria label ──
  let ariaLabel = `Number line from ${min} to ${max}`;
  if (jumps.length) {
    ariaLabel += ' showing ' + jumps.map(j =>
      `a jump of ${j.label != null ? j.label : j.to - j.from} from ${j.from} to ${j.to}`
    ).join(' and ');
  }
  if (mark != null) ariaLabel += `, landing on ${mark}`;
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
//  layout: 'grid' | 'line'  (ignored for answer buttons — always compact)
//  argIdx: null → static question visual  |  number → clickable answer button
// ─────────────────────────────────────────────────────────────────────────────
function drawObjectSet(config, argIdx) {
  var count   = +config.count || 0;
  var emoji   = config.emoji  || '●';
  var isBtn   = argIdx != null;
  var MAX_ROW = isBtn ? 5 : (config.layout === 'line' ? 20 : 5);
  var rows = [], rem = count;
  while (rem > 0) {
    var n = Math.min(rem, MAX_ROW);
    rows.push(Array(n).fill(emoji).join('\u200B'));
    rem -= n;
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
  return '<div class="q-visual obj-set-visual">'+gridHTML+'</div>';
}

// ─────────────────────────────────────────────────────────────────────────────
//  drawTwoGroups({leftCount, leftObj, rightCount, rightObj, op})
//
//  Static question visual only. Answer buttons rendered via drawObjectSet()
//  in _renderQ(). op: 'add' | 'subtract'
// ─────────────────────────────────────────────────────────────────────────────
function drawTwoGroups(config) {
  var lEmoji = (config.leftObj  || '●').repeat(+(config.leftCount)  || 0);
  var rEmoji = (config.rightObj || '●').repeat(+(config.rightCount) || 0);
  var opStr  = config.op === 'subtract' ? '−' : '+';
  return '<div class="q-visual two-groups-visual">'+
    '<div class="tg-group">'+lEmoji+'</div>'+
    '<div class="tg-op">'+opStr+'</div>'+
    '<div class="tg-group">'+rEmoji+'</div>'+
  '</div>';
}
