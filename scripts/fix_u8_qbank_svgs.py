"""Add food/object SVG visuals to u8 practice and qBank questions."""
import math

# ── SVG builder helpers ──────────────────────────────────────────────────────

def sector(cx, cy, r, sd, ed, color, stroke='white', sw=1.2):
    s = math.radians(sd - 90); e = math.radians(ed - 90)
    x1 = cx + r*math.cos(s); y1 = cy + r*math.sin(s)
    x2 = cx + r*math.cos(e); y2 = cy + r*math.sin(e)
    lg = 1 if (ed - sd) > 180 else 0
    return (f'<path d="M{cx},{cy} L{x1:.1f},{y1:.1f} '
            f'A{r},{r},0,{lg},1,{x2:.1f},{y2:.1f} Z" '
            f'fill="{color}" stroke="{stroke}" stroke-width="{sw}"/>')

def dividers(cx, cy, r, n, color='#888', sw=1.2):
    out = ''
    for i in range(n):
        a = math.radians(i * 360/n - 90)
        out += f'<line x1="{cx}" y1="{cy}" x2="{cx+r*math.cos(a):.1f}" y2="{cy+r*math.sin(a):.1f}" stroke="{color}" stroke-width="{sw}"/>'
    return out

def circle_border(cx, cy, r, color='#888', sw=1.5):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="{sw}"/>'

def bar_svg(n, shade, color, bg='#f0e6f8', w=190, h=40, label=''):
    """Simple fraction bar."""
    pw = w / n
    parts = [f'<svg width="{w}" height="{h+(14 if label else 0)}" '
             f'viewBox="0 0 {w} {h+(14 if label else 0)}" style="display:block;margin:4px auto">']
    for i in range(n):
        fill = color if i < shade else bg
        parts.append(f'<rect x="{i*pw:.1f}" y="0" width="{pw:.1f}" height="{h}" '
                     f'fill="{fill}" stroke="#888" stroke-width="1"/>')
    if label:
        parts.append(f'<text x="{w/2}" y="{h+11}" text-anchor="middle" '
                     f'font-size="10" fill="#555">{label}</text>')
    parts.append('</svg>')
    return ''.join(parts)

# ── Food-specific circle SVGs ────────────────────────────────────────────────

def pizza_svg(n, shade, w=110, h=110):
    cx = cy = 50; r = 44; ri = 36
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 100 100" style="display:block;margin:4px auto">']
    # Crust
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F0B27A" stroke="#D35400" stroke-width="2"/>')
    # Sauce
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{ri}" fill="#E74C3C"/>')
    # Cheese blobs
    for ox,oy,rx,ry in [(35,30,9,6),(63,35,10,6),(33,60,7,8),(63,60,8,7),(50,71,7,5)]:
        p.append(f'<ellipse cx="{ox}" cy="{oy}" rx="{rx}" ry="{ry}" fill="#F9E79F"/>')
    # Pepperoni
    for ox,oy in [(38,32),(63,40),(36,63),(64,63)]:
        p.append(f'<circle cx="{ox}" cy="{oy}" r="4.5" fill="#922B21" stroke="#7B241C" stroke-width="0.5" opacity="0.9"/>')
    # Shaded slices
    deg = 360/n
    for i in range(shade):
        p.append(sector(cx,cy,r,i*deg,(i+1)*deg,'#27ae60','#27ae60',1))
        p.append(f'<path d="M{cx},{cy} L{cx+r*math.cos(math.radians(i*deg-90)):.1f},{cy+r*math.sin(math.radians(i*deg-90)):.1f} '
                 f'A{r},{r},0,{"1" if deg>180 else "0"},1,{cx+r*math.cos(math.radians((i+1)*deg-90)):.1f},{cy+r*math.sin(math.radians((i+1)*deg-90)):.1f} Z" '
                 f'fill="rgba(39,174,96,0.35)"/>')
    p.append(dividers(cx,cy,r,n,'#D35400',1.8))
    p.append(circle_border(cx,cy,r,'#D35400',2))
    p.append('</svg>')
    return ''.join(p)

def watermelon_svg(n, shade_eaten, w=110, h=110):
    """Circle watermelon — shade_eaten slices shown as eaten (white-ish)."""
    cx = cy = 50; r = 44
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 100 100" style="display:block;margin:4px auto">']
    # Green rind
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#27ae60" stroke="#1e8449" stroke-width="2"/>')
    # Red flesh ring
    p.append(f'<circle cx="{cx}" cy="{cy}" r="38" fill="#E74C3C"/>')
    # Light center
    p.append(f'<circle cx="{cx}" cy="{cy}" r="20" fill="#F1948A" opacity="0.4"/>')
    # Eaten slices (show as missing / white)
    deg = 360/n
    for i in range(shade_eaten):
        p.append(sector(cx,cy,r,i*deg,(i+1)*deg,'#f0f0f0','white',1))
        # Add dotted border
        p.append(f'<path d="M{cx},{cy} L{cx+r*math.cos(math.radians(i*deg-90)):.1f},{cy+r*math.sin(math.radians(i*deg-90)):.1f} '
                 f'A{r},{r},0,{"1" if deg>180 else "0"},1,{cx+r*math.cos(math.radians((i+1)*deg-90)):.1f},{cy+r*math.sin(math.radians((i+1)*deg-90)):.1f} Z" '
                 f'fill="none" stroke="#aaa" stroke-width="1" stroke-dasharray="3,2"/>')
    # Seeds on remaining slices
    for ox,oy in [(35,38),(55,32),(65,55),(45,68),(62,68),(38,62),(50,42)]:
        # only add seed if not in eaten sector
        p.append(f'<circle cx="{ox}" cy="{oy}" r="2" fill="#2C3E50" opacity="0.6"/>')
    p.append(dividers(cx,cy,r,n,'#1e8449',1.8))
    p.append(circle_border(cx,cy,r,'#1e8449',2))
    p.append('</svg>')
    return ''.join(p)

def pie_svg(n, shade, w=110, h=110):
    cx = cy = 50; r = 44
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 100 100" style="display:block;margin:4px auto">']
    # Crust
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F5CBA7" stroke="#D4AC0D" stroke-width="2"/>')
    # Filling
    p.append(f'<circle cx="{cx}" cy="{cy}" r="38" fill="#E59866"/>')
    # Crumble texture
    for ox,oy in [(40,35),(60,42),(45,60),(62,58),(50,45)]:
        p.append(f'<circle cx="{ox}" cy="{oy}" r="2.5" fill="#D4AC0D" opacity="0.5"/>')
    # Shaded slices
    deg = 360/n
    for i in range(shade):
        p.append(sector(cx,cy,r,i*deg,(i+1)*deg,'#8e44ad','#8e44ad',1))
        p.append(f'<path d="M{cx},{cy} L{cx+r*math.cos(math.radians(i*deg-90)):.1f},{cy+r*math.sin(math.radians(i*deg-90)):.1f} '
                 f'A{r},{r},0,{"1" if deg>180 else "0"},1,{cx+r*math.cos(math.radians((i+1)*deg-90)):.1f},{cy+r*math.sin(math.radians((i+1)*deg-90)):.1f} Z" '
                 f'fill="rgba(142,68,173,0.4)"/>')
    p.append(dividers(cx,cy,r,n,'#D4AC0D',1.8))
    p.append(circle_border(cx,cy,r,'#D4AC0D',2))
    p.append('</svg>')
    return ''.join(p)

def candy_bar_svg(n, shade, w=180, h=55):
    """Chocolate candy bar divided into n sections, shade highlighted."""
    pw = 140/n
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display:block;margin:4px auto">']
    # Wrapper
    p.append(f'<rect x="15" y="5" width="150" height="42" rx="6" fill="#6E2F0A" stroke="#4A1C03" stroke-width="2"/>')
    # Gloss
    p.append(f'<rect x="17" y="7" width="146" height="8" rx="3" fill="rgba(255,255,255,0.1)"/>')
    # Sections
    for i in range(n):
        x = 17 + i*pw
        fill = '#F39C12' if i < shade else '#784212'
        p.append(f'<rect x="{x:.1f}" y="9" width="{pw-2:.1f}" height="32" rx="3" fill="{fill}"/>')
        if i < shade:
            p.append(f'<rect x="{x:.1f}" y="9" width="{pw-2:.1f}" height="32" rx="3" fill="none" stroke="#E67E22" stroke-width="1.5"/>')
        # Chocolate chip
        cx2 = x + pw/2; cy2 = 25
        p.append(f'<circle cx="{cx2:.1f}" cy="{cy2}" r="2" fill="#2C1503" opacity="0.7"/>')
    p.append('</svg>')
    return ''.join(p)

# ── Build all SVGs ───────────────────────────────────────────────────────────

SVGS = {
    # L0 qBank
    'pizza_1_4':   pizza_svg(4, 1),
    'bar_3_8':     bar_svg(8, 3, '#8e44ad', label='3 out of 8 pieces'),
    'bar_3_8_sq':  bar_svg(8, 3, '#2980b9', label='3 out of 8 squares'),
    'pie_2_6':     pie_svg(6, 2),
    'bar_4_5':     bar_svg(5, 4, '#e74c3c', label='4 out of 5 parts'),
    'bar_1_8':     bar_svg(8, 1, '#27ae60', label='1 out of 8 parts'),
    'bar_3_4':     bar_svg(4, 3, '#e67e22', label='3 out of 4 parts'),
    'candy_1_3':   candy_bar_svg(3, 1),
    'watermelon':  watermelon_svg(8, 3),
    'bar_1_4':     bar_svg(4, 1, '#8e44ad', label='1 out of 4 parts'),
    'bar_7_10':    bar_svg(10, 7, '#e74c3c', label='7 out of 10 parts'),
    # L1 qBank
    'pie_1_8':     pie_svg(8, 1),
    'pizza_2_4':   pizza_svg(4, 2),
    'bar_4_8':     bar_svg(8, 4, '#8e44ad', label='4 out of 8 parts'),
    'bar_1_4_p':   bar_svg(4, 1, '#27ae60', label='1 out of 4 parts'),
    'bar_6_8':     bar_svg(8, 6, '#e67e22', label='6 out of 8 parts'),
    # L0 Practice
    'pizza_1_4_p': pizza_svg(4, 1),
}

# Verify no single quotes
for name, svg in SVGS.items():
    if "'" in svg:
        print(f"WARNING: single quote in {name}!")

print(f"Generated {len(SVGS)} SVGs, all safe.")

# ── Patch questions ──────────────────────────────────────────────────────────

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

def patch_qbank(old_q, svg_key):
    """Append SVG to end of question text, before the closing ',["""
    svg = SVGS[svg_key]
    old_b = ("q('" + old_q + "',").encode('utf-8')
    new_b = ("q('" + old_q + svg + "',").encode('utf-8')
    return old_b, new_b

def patch_practice(old_q, svg_key):
    """Append SVG to practice q: field."""
    svg = SVGS[svg_key]
    old_b = ("{q:'" + old_q + "',").encode('utf-8')
    new_b = ("{q:'" + old_q + svg + "',").encode('utf-8')
    return old_b, new_b

PATCHES = [
    # L0 qBank
    patch_qbank('Pizza cut into 4 equal slices. Eat 1. Fraction?',        'pizza_1_4'),
    patch_qbank('Ribbon in 8 equal pieces, use 3. Fraction?',             'bar_3_8'),
    patch_qbank('Square cut in 8 equal parts. 3 shaded. Fraction?',       'bar_3_8_sq'),
    patch_qbank('Pie cut in 6 equal slices. You eat 2. Fraction?',        'pie_2_6'),
    patch_qbank('Rectangle divided into 5 equal parts. 4 shaded?',        'bar_4_5'),
    patch_qbank('8 equal parts, 1 colored. Fraction?',                    'bar_1_8'),
    patch_qbank('3 of 4 parts shaded. Fraction?',                         'bar_3_4'),
    patch_qbank('Candy bar split in 3 equal pieces, eat 1. Fraction?',    'candy_1_3'),
    patch_qbank('Watermelon cut into 8 equal slices, 3 eaten. Left?',     'watermelon'),
    patch_qbank('4 parts, 1 shaded. Fraction?',                           'bar_1_4'),
    patch_qbank('10 equal parts, 7 colored. Fraction?',                   'bar_7_10'),
    # L1 qBank
    patch_qbank('A pie has 8 equal slices. Each slice=?',                 'pie_1_8'),
    patch_qbank('Pizza: 4 slices total, you ate 2. Fraction eaten?',      'pizza_2_4'),
    patch_qbank('Rectangle: 8 parts, 4 shaded. Fraction?',               'bar_4_8'),
    patch_qbank('Fold paper in 4 equal parts, color 1. Fraction colored?','bar_1_4_p'),
    patch_qbank('Bar split in 8 equal parts, 6 colored. Fraction?',      'bar_6_8'),
    # L0 Practice
    patch_practice('Pizza cut into 4 equal pieces. You eat 1. What fraction?', 'pizza_1_4_p'),
]

hits = 0
for old_b, new_b in PATCHES:
    if old_b in content:
        content = content.replace(old_b, new_b, 1)
        hits += 1
        print(f'  OK: {old_b[3:53].decode("utf-8","replace")}...')
    else:
        print(f'  MISS: {old_b[3:60].decode("utf-8","replace")}')

print(f'\n{hits}/{len(PATCHES)} patches applied.')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Saved.')
