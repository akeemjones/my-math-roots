"""Add fraction circle/rectangle SVG visuals to all u8 lesson examples."""
import math

# ── SVG helper functions ─────────────────────────────────────────────────────

def sector(cx, cy, r, start_deg, end_deg, color, stroke='white', sw=1.5):
    s = math.radians(start_deg - 90)
    e = math.radians(end_deg - 90)
    x1 = cx + r * math.cos(s)
    y1 = cy + r * math.sin(s)
    x2 = cx + r * math.cos(e)
    y2 = cy + r * math.sin(e)
    lg = 1 if (end_deg - start_deg) > 180 else 0
    return (f'<path d="M{cx},{cy} L{x1:.2f},{y1:.2f} '
            f'A{r},{r},0,{lg},1,{x2:.2f},{y2:.2f} Z" '
            f'fill="{color}" stroke="{stroke}" stroke-width="{sw}"/>')

def frac_circle(n, shade, color, bg='#f3eaf8', cx=50, cy=50, r=40, w=100, h=100, label=None):
    """Circle divided into n equal parts with shade parts filled."""
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
         f'style="display:inline-block;vertical-align:middle">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg}" stroke="#aaa" stroke-width="1.5"/>')
    deg = 360 / n
    for i in range(shade):
        p.append(sector(cx, cy, r, i*deg, (i+1)*deg, color))
    # divider lines
    for i in range(n):
        a = math.radians(i*deg - 90)
        p.append(f'<line x1="{cx}" y1="{cy}" '
                 f'x2="{cx+r*math.cos(a):.2f}" y2="{cy+r*math.sin(a):.2f}" '
                 f'stroke="#888" stroke-width="1.5"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#888" stroke-width="1.5"/>')
    if label:
        p.append(f'<text x="{cx}" y="{h-4}" text-anchor="middle" '
                 f'font-size="12" fill="#555" font-weight="bold">{label}</text>')
    p.append('</svg>')
    return ''.join(p)

def frac_rect(n, shade, color, bg='#f3eaf8', w=120, h=36, label=None):
    """Rectangle divided into n equal columns with shade parts filled."""
    pw = w / n
    p = [f'<svg width="{w}" height="{h + (16 if label else 0)}" '
         f'viewBox="0 0 {w} {h + (16 if label else 0)}" '
         f'style="display:inline-block;vertical-align:middle">']
    for i in range(n):
        fill = color if i < shade else bg
        p.append(f'<rect x="{i*pw:.1f}" y="0" width="{pw:.1f}" height="{h}" '
                 f'fill="{fill}" stroke="#888" stroke-width="1"/>')
    if label:
        p.append(f'<text x="{w/2}" y="{h+13}" text-anchor="middle" '
                 f'font-size="12" fill="#555" font-weight="bold">{label}</text>')
    p.append('</svg>')
    return ''.join(p)

def frac_num(n, d, color='#8e44ad'):
    """Inline fraction symbol as SVG."""
    return (f'<svg width="36" height="52" viewBox="0 0 36 52" '
            f'style="display:inline-block;vertical-align:middle">'
            f'<text x="18" y="18" text-anchor="middle" font-size="18" '
            f'fill="{color}" font-weight="bold">{n}</text>'
            f'<line x1="4" y1="27" x2="32" y2="27" stroke="{color}" stroke-width="2"/>'
            f'<text x="18" y="46" text-anchor="middle" font-size="18" '
            f'fill="{color}" font-weight="bold">{d}</text>'
            f'</svg>')

def unequal_circle(cx=50, cy=50, r=40, w=100, h=100):
    """Circle with an off-center line (unequal parts)."""
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
         f'style="display:inline-block;vertical-align:middle">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#f3eaf8" stroke="#aaa" stroke-width="1.5"/>')
    # Off-center vertical line at x=cx+15
    ox = cx + 15
    # Clip line to circle edge
    dy = math.sqrt(max(0, r**2 - (ox-cx)**2))
    y1 = cy - dy
    y2 = cy + dy
    # Fill the smaller right portion in red
    # Use arc for the small segment
    sa = math.degrees(math.acos((ox-cx)/r))
    p.append(sector(cx, cy, r, 90-sa, 90+sa, '#e74c3c', stroke='white'))
    # Divider line
    p.append(f'<line x1="{ox}" y1="{y1:.1f}" x2="{ox}" y2="{y2:.1f}" stroke="#888" stroke-width="1.5"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#888" stroke-width="1.5"/>')
    p.append('</svg>')
    return ''.join(p)

# ── Build each example's s field ────────────────────────────────────────────

PURPLE = '#8e44ad'
ORANGE = '#e67e22'
GREEN  = '#27ae60'
RED    = '#e74c3c'
BLUE   = '#2980b9'

def row(*items, gap=16):
    inner = ''.join(
        f'<div style="text-align:center;margin:0 {gap//2}px">{item}</div>'
        for item in items
    )
    return f'<div style="display:flex;justify-content:center;align-items:flex-end;flex-wrap:wrap;gap:8px;margin:10px 0">{inner}</div>'

def labeled(svg, text, color='#555'):
    return (svg + f'<div style="font-size:13px;font-weight:bold;color:{color};'
            f'margin-top:4px">{text}</div>')

# ─────────────────────────────────────────────
# LESSON 0
# ─────────────────────────────────────────────

# L0 E0 — Fraction Parts (1/4)
c4 = frac_circle(4, 1, PURPLE, label='1/4')
l0e0_s = (
    row(labeled(c4, '1 out of 4 equal parts', PURPLE)) +
    '<div style="text-align:center;font-size:13px;color:#555;margin:6px 0">' +
    frac_num(1, 4) +
    '&nbsp;&nbsp;Top = parts you have &nbsp;|&nbsp; Bottom = total equal parts' +
    '</div>'
)

# L0 E1 — Equal Parts
c_eq = frac_circle(2, 1, PURPLE, label='EQUAL ✓')
c_neq = unequal_circle()
l0e1_s = row(
    labeled(c_eq,  'EQUAL ✓ — same size halves', GREEN),
    labeled(c_neq, 'NOT EQUAL ✗ — uneven split', RED)
) + '<div style="text-align:center;font-size:13px;color:#555;margin:4px">Both parts must be the <b>SAME SIZE</b>!</div>'

# L0 E2 — Real life examples
pizza = frac_circle(4, 1, '#e74c3c', bg='#fde8e8', label='1/4 pizza')
ribbon = frac_rect(2, 1, PURPLE, label='1/2 ribbon', w=110, h=30)
brownie = frac_rect(8, 1, '#e67e22', bg='#fef3e2', label='1/8 brownie', w=120, h=30)
l0e2_s = row(
    labeled(pizza, '1 slice of 4', RED),
    '<div>' + ribbon + '<div style="font-size:13px;font-weight:bold;color:#555;margin-top:4px">1 piece of 2</div></div>',
    '<div>' + brownie + '<div style="font-size:13px;font-weight:bold;color:#555;margin-top:4px">1 piece of 8</div></div>'
)

# ─────────────────────────────────────────────
# LESSON 1
# ─────────────────────────────────────────────

# L1 E0 — Common Fractions (1/2, 1/4, 1/8)
c2  = frac_circle(2, 1, RED,    bg='#fde8e8')
c4b = frac_circle(4, 1, ORANGE, bg='#fef3e2')
c8  = frac_circle(8, 1, PURPLE, bg='#f3eaf8')
l1e0_s = row(
    labeled(c2,  frac_num(1,2,'#e74c3c') + '<div style="color:#e74c3c;font-size:13px">one half</div>',   RED),
    labeled(c4b, frac_num(1,4,'#e67e22') + '<div style="color:#e67e22;font-size:13px">one fourth</div>', ORANGE),
    labeled(c8,  frac_num(1,8,'#8e44ad') + '<div style="color:#8e44ad;font-size:13px">one eighth</div>', PURPLE),
)

# L1 E1 — Key Rule (more cuts = smaller piece)
c4x = frac_circle(4, 1, ORANGE, bg='#fef3e2', label='1/4')
c8x = frac_circle(8, 1, PURPLE, bg='#f3eaf8', label='1/8')
l1e1_s = (
    '<div style="text-align:center;font-size:13px;color:#555;margin:6px 0">'
    'More equal cuts → each piece gets <b>smaller</b>!</div>' +
    row(
        labeled(c4x, '4 pieces → bigger slice',  ORANGE),
        labeled(c8x, '8 pieces → smaller slice!', PURPLE),
    )
)

# L1 E2 — Practice (pie with 8 slices)
p1 = frac_circle(8, 1, RED,    bg='#fde8e8', w=80, h=80, cx=40, cy=40, r=32)
p2 = frac_circle(8, 2, RED,    bg='#fde8e8', w=80, h=80, cx=40, cy=40, r=32)
p4 = frac_circle(8, 4, RED,    bg='#fde8e8', w=80, h=80, cx=40, cy=40, r=32)
p8 = frac_circle(8, 8, RED,    bg='#fde8e8', w=80, h=80, cx=40, cy=40, r=32)
l1e2_s = row(
    labeled(p1, '1 slice = 1/8', RED),
    labeled(p2, '2 slices = 2/8', RED),
    labeled(p4, '4 slices = 4/8', RED),
    labeled(p8, '8 slices = whole!', RED),
)

# ─────────────────────────────────────────────
# LESSON 2
# ─────────────────────────────────────────────

# L2 E0 — Same Denominator (3/8 vs 5/8)
c38 = frac_circle(8, 3, BLUE,   bg='#e8f4f8', label='3/8')
c58 = frac_circle(8, 5, GREEN,  bg='#eafaf1', label='5/8')
l2e0_s = (
    '<div style="text-align:center;font-size:13px;color:#555;margin:6px 0">'
    'Same size pieces (eighths) — just count the shaded parts!</div>' +
    row(
        labeled(c38, frac_num(3,8,BLUE),   BLUE),
        '<div style="font-size:28px;color:#555;align-self:center">&lt;</div>',
        labeled(c58, frac_num(5,8,GREEN),  GREEN),
    ) +
    '<div style="text-align:center;font-size:14px;font-weight:bold;color:#27ae60">5/8 is greater! More shaded pieces.</div>'
)

# L2 E1 — Same Numerator (1/2 vs 1/4)
c12 = frac_circle(2, 1, RED,    bg='#fde8e8', label='1/2')
c14 = frac_circle(4, 1, ORANGE, bg='#fef3e2', label='1/4')
l2e1_s = (
    '<div style="text-align:center;font-size:13px;color:#555;margin:6px 0">'
    'Both have <b>1</b> shaded piece — but the pieces are different sizes!</div>' +
    row(
        labeled(c12, frac_num(1,2,RED)    + '<div style="color:#e74c3c;font-size:12px">bigger piece!</div>', RED),
        '<div style="font-size:28px;color:#555;align-self:center">&gt;</div>',
        labeled(c14, frac_num(1,4,ORANGE) + '<div style="color:#e67e22;font-size:12px">smaller piece</div>', ORANGE),
    ) +
    '<div style="text-align:center;font-size:13px;color:#555">Fewer cuts → bigger pieces. Smaller denominator = bigger piece!</div>'
)

# L2 E2 — Order from Least (1/8, 1/4, 1/2)
o8 = frac_circle(8, 1, PURPLE, bg='#f3eaf8', label='1/8')
o4 = frac_circle(4, 1, ORANGE, bg='#fef3e2', label='1/4')
o2 = frac_circle(2, 1, RED,    bg='#fde8e8', label='1/2')
l2e2_s = (
    row(
        labeled(o8, frac_num(1,8,PURPLE) + '<div style="color:#8e44ad;font-size:12px">smallest</div>', PURPLE),
        '<div style="font-size:24px;color:#555;align-self:center">&lt;</div>',
        labeled(o4, frac_num(1,4,ORANGE) + '<div style="color:#e67e22;font-size:12px">medium</div>',   ORANGE),
        '<div style="font-size:24px;color:#555;align-self:center">&lt;</div>',
        labeled(o2, frac_num(1,2,RED)    + '<div style="color:#e74c3c;font-size:12px">largest</div>',  RED),
    ) +
    '<div style="text-align:center;font-size:14px;font-weight:bold;color:#555">1/8 &lt; 1/4 &lt; 1/2</div>'
)

# ── Apply all replacements ────────────────────────────────────────────────────

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

REPLACEMENTS = [
    # Lesson 0
    (
        b"s:'<div style=\"display:flex;justify-content:center;margin:10px 0\"><div class=\"frac\"><div class=\"frac-n\" style=\"color:#8e44ad\">1</div><div class=\"frac-l\" style=\"background:#8e44ad;width:40px\"></div><div class=\"frac-d\" style=\"color:#8e44ad\">4</div></div></div>\\nTop (1) = parts you have\\nBottom (4) = total equal parts'",
        ("s:'" + l0e0_s + "'").encode('utf-8')
    ),
    (
        b"s:'EQUAL parts \\u2705 \\u2014 a circle cut perfectly in half\\nNOT EQUAL \\u274c \\u2014 a circle cut unevenly\\n\\nBoth halves must be the SAME SIZE!'",
        ("s:'" + l0e1_s + "'").encode('utf-8')
    ),
    (
        b"s:'Pizza cut into 4 equal slices: each slice = 1/4\\nA ribbon cut in half: each piece = 1/2\\nA pan of brownies cut into 8 equal pieces: each = 1/8'",
        ("s:'" + l0e2_s + "'").encode('utf-8')
    ),
    # Lesson 1
    (
        b"s:'<div class=\"frac-row\">",
        ("s:'" + l1e0_s + "'").encode('utf-8')
    ),
    (
        b"s:'When you cut something into MORE pieces, each piece is SMALLER!\\n4 pieces \\u2192 each piece is bigger\\n8 pieces \\u2192 each piece is smaller'",
        ("s:'" + l1e1_s + "'").encode('utf-8')
    ),
    (
        b"s:'Each slice = 1/8\\n2 slices = 2/8\\n4 slices = 4/8 = half the pie!\\n8 slices = 8/8 = the whole pie'",
        ("s:'" + l1e2_s + "'").encode('utf-8')
    ),
    # Lesson 2
    (
        b"s:'Same sized pieces (eighths).\\n3 pieces vs 5 pieces.\\n5 is more than 3, so...'",
        ("s:'" + l2e0_s + "'").encode('utf-8')
    ),
    (
        b"s:'Same number of pieces (1).\\nBut halves are bigger than fourths!\\nSmaller denominator = bigger piece.'",
        ("s:'" + l2e1_s + "'").encode('utf-8')
    ),
    (
        b"s:'Think: which has biggest pieces?\\n1/8 = smallest piece (most cuts)\\n1/4 = medium piece\\n1/2 = largest piece'",
        ("s:'" + l2e2_s + "'").encode('utf-8')
    ),
]

hits = 0
for old_b, new_b in REPLACEMENTS:
    if old_b in content:
        content = content.replace(old_b, new_b, 1)
        hits += 1
        print(f'OK: {old_b[:60]}')
    else:
        print(f'MISS: {old_b[:80]}')

print(f'\n{hits}/{len(REPLACEMENTS)} replacements applied.')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Saved.')
