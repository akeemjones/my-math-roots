with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# ─── SVG builder helpers ──────────────────────────────────────────────────────

def ruler_svg(n_inches, inch_w, objects=None, height=52, label_y_offset=0,
              show_zero=True, extra_elements=None):
    """
    Build a compact ruler SVG.
    objects = list of (label, start_in, end_in, color) for bars above ruler
    """
    rx0 = 10
    ry = 22
    r_h = 12
    vw = rx0 + n_inches * inch_w + 14
    vh = height
    p = [f'<svg width="{vw*2}" height="{vh*2}" viewBox="0 0 {vw} {vh}" '
         f'style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">']

    # Draw object bars above ruler (bottom of bar at ruler top)
    if objects:
        bar_h = 10
        bar_spacing = bar_h + 2
        n_bars = len(objects)
        bar_base_y = ry - 2  # bottom edge of bars
        for bi, (lbl, s_in, e_in, color) in enumerate(reversed(objects)):
            by = bar_base_y - (bi + 1) * bar_spacing
            bx0 = rx0 + s_in * inch_w
            bw = (e_in - s_in) * inch_w
            p.append(f'<rect x="{bx0}" y="{by}" width="{bw}" height="{bar_h}" '
                     f'fill="{color}" rx="3" opacity="0.85"/>')
            p.append(f'<text x="{bx0 + bw/2:.0f}" y="{by + 7}" '
                     f'text-anchor="middle" font-size="5" fill="white" font-weight="bold">{lbl}</text>')
            # dashed drop-line at end of bar
            p.append(f'<line x1="{bx0+bw}" y1="{by}" x2="{bx0+bw}" y2="{ry+r_h}" '
                     f'stroke="{color}" stroke-width="0.7" stroke-dasharray="2,2" opacity="0.6"/>')

    # Ruler body
    p.append(f'<rect x="{rx0}" y="{ry}" width="{n_inches*inch_w}" height="{r_h}" '
             f'fill="#fff8e7" stroke="#c8a000" stroke-width="0.8" rx="1"/>')

    # Half-inch ticks
    for i in range(n_inches):
        hx = rx0 + i * inch_w + inch_w // 2
        p.append(f'<line x1="{hx}" y1="{ry}" x2="{hx}" y2="{ry+6}" '
                 f'stroke="#aaa" stroke-width="0.6"/>')

    # Inch ticks + numbers
    for i in range(n_inches + 1):
        x = rx0 + i * inch_w
        p.append(f'<line x1="{x}" y1="{ry}" x2="{x}" y2="{ry+r_h}" '
                 f'stroke="#555" stroke-width="0.8"/>')
        if i == 0 and not show_zero:
            continue
        p.append(f'<text x="{x}" y="{ry+r_h+6+label_y_offset}" '
                 f'text-anchor="middle" font-size="5" fill="#444">{i}"</text>')

    if extra_elements:
        p.extend(extra_elements)

    p.append('</svg>')
    return ''.join(p)


def cm_ruler_svg(n_cm, cm_w=8, objects=None, height=50):
    """Centimeter ruler."""
    rx0 = 10
    ry = 22
    r_h = 12
    vw = rx0 + n_cm * cm_w + 14
    vh = height
    p = [f'<svg width="{vw*2}" height="{vh*2}" viewBox="0 0 {vw} {vh}" '
         f'style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">']

    if objects:
        bar_h = 10
        bar_base_y = ry - 2
        for bi, (lbl, s_cm, e_cm, color) in enumerate(reversed(objects)):
            by = bar_base_y - (bi + 1) * 12
            bx0 = rx0 + s_cm * cm_w
            bw = (e_cm - s_cm) * cm_w
            p.append(f'<rect x="{bx0}" y="{by}" width="{bw}" height="{bar_h}" '
                     f'fill="{color}" rx="3" opacity="0.85"/>')
            p.append(f'<text x="{bx0 + bw/2:.0f}" y="{by+7}" '
                     f'text-anchor="middle" font-size="5" fill="white" font-weight="bold">{lbl}</text>')
            p.append(f'<line x1="{bx0+bw}" y1="{by}" x2="{bx0+bw}" y2="{ry+r_h}" '
                     f'stroke="{color}" stroke-width="0.7" stroke-dasharray="2,2" opacity="0.6"/>')

    p.append(f'<rect x="{rx0}" y="{ry}" width="{n_cm*cm_w}" height="{r_h}" '
             f'fill="#fff8e7" stroke="#c8a000" stroke-width="0.8" rx="1"/>')
    for i in range(n_cm + 1):
        x = rx0 + i * cm_w
        p.append(f'<line x1="{x}" y1="{ry}" x2="{x}" y2="{ry+r_h}" stroke="#555" stroke-width="0.8"/>')
        p.append(f'<text x="{x}" y="{ry+r_h+6}" text-anchor="middle" font-size="5" fill="#444">{i} cm</text>')
    p.append('</svg>')
    return ''.join(p)


# ─── Build each question's SVG ────────────────────────────────────────────────

# Q1 & quiz Q1: pencil ends at 7 on ruler (0-9 range, inch_w=17)
SVG_PENCIL_7 = ruler_svg(9, 17,
    objects=[('pencil', 0, 7, '#2980b9')], height=52)

# Q3 & quiz Q3: book (8in) vs notebook (6in)
SVG_BOOK_VS_NB = ruler_svg(10, 16,
    objects=[('notebook  6"', 0, 6, '#e67e22'), ('book  8"', 0, 8, '#8e44ad')],
    height=64)

# Q6 & quiz Q6: crayon ~3 inches (show ruler 0-5 with "?" bar at 3)
SVG_CRAYON = ruler_svg(5, 24,
    objects=[('crayon  ≈ ?', 0, 3, '#e74c3c')], height=52)

# Q11: where to start measuring — ruler with arrow at zero
extra_arrow = [
    '<text x="10" y="10" text-anchor="middle" font-size="7">&#x2193;</text>',
    '<text x="10" y="20" text-anchor="middle" font-size="4.5" fill="#e74c3c" font-weight="bold">START</text>',
]
SVG_START = ruler_svg(6, 20, height=52, extra_elements=extra_arrow)

# Q13: paper clip ~1 inch (ruler 0-4)
SVG_PAPERCLIP = ruler_svg(4, 28,
    objects=[('paper clip  1"', 0, 1, '#e74c3c')], height=52)

# Q15 & quiz Q4: 12-inch ruler = 1 foot
_extra_foot = [
    f'<path d="M10,46 L10,49 L{10+12*13},49 L{10+12*13},46" fill="none" stroke="#27ae60" stroke-width="0.9"/>',
    f'<text x="{10 + 6*13}" y="55" text-anchor="middle" font-size="5.5" fill="#27ae60" font-weight="bold">= 1 foot</text>',
]
SVG_12IN = ruler_svg(12, 13, height=62, extra_elements=_extra_foot)

# Q17: pen (6in) + pencil (7in) on same ruler (0-14, inch_w=13)
SVG_PEN_PENCIL = ruler_svg(14, 13,
    objects=[('pen  6"', 0, 6, '#27ae60'), ('pencil  7"', 0, 7, '#2980b9')],
    height=64)

# Q20: straw 8 inches — cut mark at 5, remaining = ?
_cut_x = 10 + 5 * 18  # x position of cut at 5 inches
_extra_cut = [
    f'<line x1="{_cut_x}" y1="8" x2="{_cut_x}" y2="36" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="3,2"/>',
    f'<text x="{_cut_x}" y="6" text-anchor="middle" font-size="5" fill="#e74c3c" font-weight="bold">cut here</text>',
    f'<rect x="10" y="14" width="{5*18}" height="6" fill="#27ae60" opacity="0.5" rx="1"/>',
    f'<text x="{10+5*9}" y="18.5" text-anchor="middle" font-size="4.5" fill="#155724" font-weight="bold">? inches left</text>',
    f'<rect x="{10+5*18}" y="14" width="{3*18}" height="6" fill="#e74c3c" opacity="0.35" rx="1"/>',
    f'<text x="{10+5*18+3*9}" y="18.5" text-anchor="middle" font-size="4.5" fill="#7b0c0c">cut off (3")</text>',
]
SVG_STRAW = ruler_svg(9, 18,
    objects=[('straw  8"', 0, 8, '#8e44ad')], height=60,
    extra_elements=_extra_cut)

# Q21: pencil ~5 inches on ruler (0-7)
SVG_PENCIL_5 = ruler_svg(7, 22,
    objects=[('pencil  ≈ 5"', 0, 5, '#2980b9')], height=52)

# Q23: book 10cm on 30cm ruler
SVG_BOOK_CM = cm_ruler_svg(31, 8,
    objects=[('book  10 cm', 0, 10, '#8e44ad')], height=52)

# Q24: three books each 2 inches
_bk_w = 24
_extra_books = []
colors3 = ['#e74c3c','#2980b9','#8e44ad']
for bi in range(3):
    bx = 10 + bi * 2 * _bk_w
    _extra_books.append(
        f'<rect x="{bx}" y="10" width="{2*_bk_w}" height="10" fill="{colors3[bi]}" rx="2" opacity="0.85"/>')
    _extra_books.append(
        f'<text x="{bx+_bk_w}" y="17" text-anchor="middle" font-size="5" fill="white" font-weight="bold">2"</text>')
SVG_3BOOKS = ruler_svg(7, _bk_w, height=52, extra_elements=_extra_books)

# Q26: 14 - 9 on ruler
_diff_x0 = 10 + 9 * 13
_diff_x1 = 10 + 14 * 13
_extra_diff = [
    f'<rect x="{_diff_x0}" y="12" width="{5*13}" height="8" fill="#e74c3c" opacity="0.6" rx="2"/>',
    f'<text x="{_diff_x0+5*13//2}" y="18" text-anchor="middle" font-size="5" fill="white" font-weight="bold">difference = ?</text>',
]
SVG_14M9 = ruler_svg(15, 13, height=52, extra_elements=_extra_diff)


# ─── Apply replacements (binary) ─────────────────────────────────────────────
def patch(old_q, svg):
    """Append SVG to question text: find old_q string and insert SVG before closing quote."""
    old_bytes = old_q.encode('utf-8')
    svg_bytes = svg.encode('utf-8')
    new_bytes = old_q[:-1].encode('utf-8') + svg_bytes + b"'"
    return old_bytes, new_bytes

reps = [
    # qBank
    patch("q('A pencil ends at 7 on a ruler. How long is the pencil?',", SVG_PENCIL_7),
    patch("q('A book is 8 inches long. A notebook is 6 inches long. How much longer is the book?',", SVG_BOOK_VS_NB),
    patch("q('About how many inches long is a crayon?',", SVG_CRAYON),
    patch("q('Where should you start measuring on a ruler?',", SVG_START),
    patch("q('About how many inches long is a paper clip?',", SVG_PAPERCLIP),
    patch("q('A ruler is 12 inches long. What is another way to say that?',", SVG_12IN),
    patch("q('A pen is 6 inches long and a pencil is 7 inches long. What is their total length?',", SVG_PEN_PENCIL),
    patch("q('A straw is 8 inches long. You cut 3 inches off. How long is it now?',", SVG_STRAW),
    patch("q('About how many inches long is a pencil?',", SVG_PENCIL_5),
    patch("q('A book is 10 cm wide. A ruler is 30 cm long. How many centimeters of the ruler are NOT covered by the book?',", SVG_BOOK_CM),
    patch("q('Three books are each 2 inches wide. What is their total width?',", SVG_3BOOKS),
    patch("q('What is 14 inches minus 9 inches?',", SVG_14M9),
    # quiz section
    patch("q('A pencil goes from 0 to 7 on a ruler. How long is the pencil?',", SVG_PENCIL_7),
    patch("q('A book is 8 inches long. A notebook is 6 inches long. How much longer is the book?',", SVG_BOOK_VS_NB),
    patch("q('12 inches is the same as how many feet?',", SVG_12IN),
    patch("q('About how many inches long is a crayon?',", SVG_CRAYON),
]

applied = 0
for old_b, new_b in reps:
    if old_b in content:
        content = content.replace(old_b, new_b, 1)
        applied += 1
    else:
        print('MISSING:', old_b[:80])

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)

print(f'Applied {applied}/{len(reps)}')
