"""Add rich SVG visuals to u9l3 Mirror Shapes: examples, practice, and qBank questions."""
import math

# ── SVG helpers ───────────────────────────────────────────────────────────────

def letter_svg(ch, has_sym, sym_dir='v', w=54, h=64):
    """Block letter with symmetry line (green) or no-symmetry X (red)."""
    mid_x = w // 2; mid_y = h // 2
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 4px">']
    parts.append(f'<text x="{mid_x}" y="{h-10}" text-anchor="middle" font-size="{h-16}" '
                 f'font-weight="bold" font-family="Arial,sans-serif" fill="#5d3a8e">{ch}</text>')
    if has_sym:
        if 'v' in sym_dir:
            parts.append(f'<line x1="{mid_x}" y1="2" x2="{mid_x}" y2="{h-2}" '
                         f'stroke="#27ae60" stroke-width="2" stroke-dasharray="5,3"/>')
        if 'h' in sym_dir:
            parts.append(f'<line x1="2" y1="{mid_y}" x2="{w-2}" y2="{mid_y}" '
                         f'stroke="#27ae60" stroke-width="2" stroke-dasharray="5,3"/>')
    else:
        # Red circle-slash "no symmetry" mark
        parts.append(f'<circle cx="{w-11}" cy="12" r="9" fill="none" stroke="#e74c3c" stroke-width="2"/>')
        parts.append(f'<line x1="{w-18}" y1="5" x2="{w-4}" y2="19" stroke="#e74c3c" stroke-width="2"/>')
    parts.append('</svg>')
    return ''.join(parts)

def circle_sym_svg(n_lines=4, w=70, h=70):
    """Circle with n_lines of symmetry shown as dashed lines."""
    cx = cy = w // 2; r = w // 2 - 5
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    for i in range(n_lines):
        a = math.radians(i * 180 / n_lines)
        x1 = cx + (r+2)*math.cos(a); y1 = cy + (r+2)*math.sin(a)
        x2 = cx - (r+2)*math.cos(a); y2 = cy - (r+2)*math.sin(a)
        parts.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                     f'stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#dff0f8" stroke="#2980b9" stroke-width="2.5"/>')
    parts.append(f'<text x="{cx}" y="{cy+5}" text-anchor="middle" font-size="11" '
                 f'fill="#2980b9" font-weight="bold">\u221e</text>')
    parts.append('</svg>')
    return ''.join(parts)

def poly_sym_svg(n, n_sym, w=72, h=72, fill='#e8d5f5', stroke='#6c3483'):
    """Regular n-gon with n_sym symmetry lines drawn."""
    cx = cy = w // 2; r = w // 2 - 6
    pts = ' '.join(f'{cx+r*math.cos(math.radians(i*360/n-90)):.1f},'
                  f'{cy+r*math.sin(math.radians(i*360/n-90)):.1f}' for i in range(n))
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    for i in range(n_sym):
        a = math.radians(i * 180 / n_sym - 90)
        parts.append(f'<line x1="{cx+(r+3)*math.cos(a):.1f}" y1="{cy+(r+3)*math.sin(a):.1f}" '
                     f'x2="{cx-(r+3)*math.cos(a):.1f}" y2="{cy-(r+3)*math.sin(a):.1f}" '
                     f'stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>')
    parts.append(f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>')
    parts.append('</svg>')
    return ''.join(parts)

def rect_sym_svg(w=110, h=68):
    """Rectangle with 2 symmetry lines."""
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'style="display:inline-block;vertical-align:middle;margin:0 5px">'
            f'<rect x="7" y="10" width="96" height="48" fill="#fde8d8" stroke="#e67e22" stroke-width="2"/>'
            f'<line x1="55" y1="4" x2="55" y2="64" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            f'<line x1="2" y1="34" x2="108" y2="34" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>'
            f'</svg>')

def rhombus_sym_svg(w=78, h=78):
    """Rhombus with 2 symmetry lines through diagonals."""
    cx = cy = w // 2
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    parts.append(f'<polygon points="{cx},5 {w-5},{cy} {cx},{h-5} 5,{cy}" '
                 f'fill="#e8d5f5" stroke="#6c3483" stroke-width="2"/>')
    parts.append(f'<line x1="{cx}" y1="2" x2="{cx}" y2="{h-2}" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>')
    parts.append(f'<line x1="2" y1="{cy}" x2="{w-2}" y2="{cy}" stroke="#e74c3c" stroke-width="2" stroke-dasharray="5,3"/>')
    parts.append('</svg>')
    return ''.join(parts)

def right_tri_svg(w=78, h=74):
    """Right triangle — NO symmetry (shows X)."""
    h8 = h - 8
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    parts.append(f'<polygon points="8,{h8} 8,8 {w-8},{h8}" fill="#fce4ec" stroke="#c0392b" stroke-width="2"/>')
    parts.append(f'<rect x="8" y="{h8-14}" width="14" height="14" fill="none" stroke="#c0392b" stroke-width="1.5"/>')
    # No-symmetry mark
    parts.append(f'<circle cx="{w-14}" cy="14" r="10" fill="none" stroke="#e74c3c" stroke-width="2"/>')
    parts.append(f'<line x1="{w-21}" y1="7" x2="{w-7}" y2="21" stroke="#e74c3c" stroke-width="2"/>')
    parts.append('</svg>')
    return ''.join(parts)

def scalene_tri_svg(w=78, h=74):
    """Scalene (irregular) triangle — shows no symmetry X."""
    h8 = h - 8
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    parts.append(f'<polygon points="10,{h8} {w-8},{h8} 20,8" fill="#fce4ec" stroke="#c0392b" stroke-width="2"/>')
    parts.append(f'<circle cx="{w-14}" cy="14" r="10" fill="none" stroke="#e74c3c" stroke-width="2"/>')
    parts.append(f'<line x1="{w-21}" y1="7" x2="{w-7}" y2="21" stroke="#e74c3c" stroke-width="2"/>')
    parts.append('</svg>')
    return ''.join(parts)

def heart_svg(w=78, h=72, sym=True):
    """Heart shape with optional vertical symmetry line."""
    cx = w // 2
    bx = w - 8
    path = (f'M{cx},22 Q{cx},6 {cx-17},6 Q8,6 8,26 Q8,50 {cx},{h-4}'
            f' Q{bx},50 {bx},26 Q{bx},6 {cx+17},6 Q{cx},6 {cx},22 Z')
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    parts.append(f'<path d="{path}" fill="#fad4d4" stroke="#e74c3c" stroke-width="2"/>')
    if sym:
        parts.append(f'<line x1="{cx}" y1="2" x2="{cx}" y2="{h-2}" '
                     f'stroke="#27ae60" stroke-width="2" stroke-dasharray="5,3"/>')
    parts.append('</svg>')
    return ''.join(parts)

def star_svg(n=5, w=80, h=80, show_sym=True):
    """n-pointed star with optional symmetry lines."""
    cx = cy = w // 2
    R = w // 2 - 4; ri = int(R * 0.42)
    pts = []
    for i in range(n * 2):
        r = R if i % 2 == 0 else ri
        a = math.radians(i * 180 / n - 90)
        pts.append(f'{cx+r*math.cos(a):.1f},{cy+r*math.sin(a):.1f}')
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    if show_sym:
        for i in range(n):
            a = math.radians(i * 360 / n - 90)
            x1 = cx + (R+3)*math.cos(a); y1 = cy + (R+3)*math.sin(a)
            x2 = cx - (R+3)*math.cos(a); y2 = cy - (R+3)*math.sin(a)
            parts.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                         f'stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>')
    parts.append(f'<polygon points="{" ".join(pts)}" fill="#f9e79f" stroke="#f39c12" stroke-width="2"/>')
    parts.append('</svg>')
    return ''.join(parts)

def snowflake_svg(w=82, h=82):
    """6-fold snowflake with symmetry lines."""
    cx = cy = w // 2; r = w // 2 - 5
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    # Draw 6 symmetry lines first (behind)
    for i in range(6):
        a = math.radians(i * 30 - 90)
        parts.append(f'<line x1="{cx+(r+2)*math.cos(a):.1f}" y1="{cy+(r+2)*math.sin(a):.1f}" '
                     f'x2="{cx-(r+2)*math.cos(a):.1f}" y2="{cy-(r+2)*math.sin(a):.1f}" '
                     f'stroke="#e74c3c" stroke-width="1" stroke-dasharray="3,2" opacity="0.5"/>')
    # 6 arms
    for i in range(6):
        angle = math.radians(i * 60 - 90)
        ex = cx + r*math.cos(angle); ey = cy + r*math.sin(angle)
        parts.append(f'<line x1="{cx}" y1="{cy}" x2="{ex:.1f}" y2="{ey:.1f}" '
                     f'stroke="#2980b9" stroke-width="2.5"/>')
        bx = cx + r*0.55*math.cos(angle); by = cy + r*0.55*math.sin(angle)
        for off in [-35, 35]:
            ba = angle + math.radians(off)
            brx = bx + r*0.3*math.cos(ba); bry = by + r*0.3*math.sin(ba)
            parts.append(f'<line x1="{bx:.1f}" y1="{by:.1f}" x2="{brx:.1f}" y2="{bry:.1f}" '
                         f'stroke="#2980b9" stroke-width="1.5"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="4" fill="#2980b9"/>')
    parts.append('</svg>')
    return ''.join(parts)

def butterfly_svg(w=100, h=84):
    """Butterfly with 1 vertical line of symmetry."""
    cx = w // 2
    parts = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
             f'style="display:inline-block;vertical-align:middle;margin:0 5px">']
    # Upper wings
    parts.append(f'<ellipse cx="25" cy="28" rx="23" ry="17" fill="#d7bde2" stroke="#6c3483" '
                 f'stroke-width="2" transform="rotate(-18 25 28)"/>')
    parts.append(f'<ellipse cx="75" cy="28" rx="23" ry="17" fill="#d7bde2" stroke="#6c3483" '
                 f'stroke-width="2" transform="rotate(18 75 28)"/>')
    # Lower wings
    parts.append(f'<ellipse cx="22" cy="57" rx="17" ry="12" fill="#c39bd3" stroke="#6c3483" '
                 f'stroke-width="2" transform="rotate(12 22 57)"/>')
    parts.append(f'<ellipse cx="78" cy="57" rx="17" ry="12" fill="#c39bd3" stroke="#6c3483" '
                 f'stroke-width="2" transform="rotate(-12 78 57)"/>')
    # Body
    parts.append(f'<ellipse cx="{cx}" cy="42" rx="5" ry="27" fill="#6c3483"/>')
    # Antennae
    parts.append(f'<line x1="{cx}" y1="16" x2="{cx-11}" y2="4" stroke="#6c3483" stroke-width="1.5"/>')
    parts.append(f'<line x1="{cx}" y1="16" x2="{cx+11}" y2="4" stroke="#6c3483" stroke-width="1.5"/>')
    parts.append(f'<circle cx="{cx-11}" cy="4" r="2.5" fill="#8e44ad"/>')
    parts.append(f'<circle cx="{cx+11}" cy="4" r="2.5" fill="#8e44ad"/>')
    # Center symmetry line
    parts.append(f'<line x1="{cx}" y1="1" x2="{cx}" y2="{h-2}" '
                 f'stroke="#27ae60" stroke-width="2" stroke-dasharray="5,3"/>')
    parts.append('</svg>')
    return ''.join(parts)

def labeled(svg, text, color='#555', size=12):
    return (f'<div style="text-align:center;margin:0 8px">'
            + svg +
            f'<div style="font-size:{size}px;font-weight:bold;color:{color};margin-top:3px">{text}</div>'
            f'</div>')

def row(*items):
    inner = ''.join(f'<div style="text-align:center;margin:0 8px">{i}</div>' for i in items)
    return (f'<div style="display:flex;justify-content:center;align-items:flex-end;'
            f'flex-wrap:wrap;gap:8px;margin:10px 0">{inner}</div>')

# ── Verify no single quotes ───────────────────────────────────────────────────
svgs_to_check = {
    'letter_A_sym': letter_svg('A', True, 'v'),
    'letter_Z_no': letter_svg('Z', False),
    'letter_B_h': letter_svg('B', True, 'h'),
    'letter_H_vh': letter_svg('H', True, 'vh'),
    'letter_M_v': letter_svg('M', True, 'v'),
    'letter_O_v': letter_svg('O', True, 'v'),
    'letter_S_no': letter_svg('S', False),
    'letter_X_vh': letter_svg('X', True, 'vh'),
    'circle_sym': circle_sym_svg(4),
    'poly_sq4': poly_sym_svg(4, 4),
    'poly_tri3': poly_sym_svg(3, 3),
    'poly_hex6': poly_sym_svg(6, 6),
    'rect_sym': rect_sym_svg(),
    'rhombus_sym': rhombus_sym_svg(),
    'right_tri': right_tri_svg(),
    'scalene': scalene_tri_svg(),
    'heart_sym': heart_svg(),
    'star5': star_svg(5),
    'snowflake': snowflake_svg(),
    'butterfly': butterfly_svg(),
}
for name, svg in svgs_to_check.items():
    if "'" in svg:
        print(f"WARNING single quote in {name}!")
print("SVG check done.")

# ── Build example s-field content ─────────────────────────────────────────────

# Example 1: What is Symmetry?
# Show: shape with fold line (MATCH ✓) vs irregular shape (NO MATCH ✗)
hex_with_line = poly_sym_svg(6, 1, fill='#e8d5f5', stroke='#6c3483')  # 1 vertical line
scalene = scalene_tri_svg()

E1_S = (
    row(
        labeled(hex_with_line,
                'Fold the line... BOTH halves match!',
                '#27ae60', 12),
        labeled(scalene,
                'Try any fold... halves don\'t match!',
                '#e74c3c', 12)
    ) +
    '<div style="text-align:center;font-size:13px;color:#555;margin-top:6px">'
    'The fold line is called the <b style="color:#6c3483">LINE OF SYMMETRY</b></div>'
)

# Wait - labeled() uses single quote in "don't"! Let me fix that.
E1_S = (
    row(
        labeled(hex_with_line,
                'Fold the line... BOTH halves match!',
                '#27ae60', 12),
        labeled(scalene,
                'Try any fold... halves do NOT match!',
                '#e74c3c', 12)
    ) +
    '<div style="text-align:center;font-size:13px;color:#555;margin-top:6px">'
    'The fold line is called the <b style="color:#6c3483">LINE OF SYMMETRY</b></div>'
)

# Verify E1_S
if "'" in E1_S:
    import re
    for i, ch in enumerate(E1_S):
        if ch == "'":
            print(f'Single quote at pos {i}: ...{E1_S[max(0,i-20):i+20]}...')
else:
    print('E1_S OK')

# Example 2: Shapes & Lines — grid of shapes with symmetry lines
sq_svg = poly_sym_svg(4, 4, w=72, h=72)
rect_s  = rect_sym_svg()
tri_s   = poly_sym_svg(3, 3, w=72, h=68, fill='#e8d5f5', stroke='#6c3483')
circ_s  = circle_sym_svg(4, w=70, h=70)

E2_S = (
    row(
        labeled(sq_svg,   'Square: 4 lines',       '#6c3483'),
        labeled(rect_s,   'Rectangle: 2 lines',    '#6c3483'),
        labeled(tri_s,    'Triangle: 3 lines',     '#6c3483'),
        labeled(circ_s,   'Circle: unlimited!',    '#2980b9'),
    ) +
    '<div style="text-align:center;font-size:12px;color:#777;margin-top:4px">'
    'More equal sides = more lines of symmetry</div>'
)
print('E2_S single-quote check:', "'" in E2_S)

# Example 3: Real Life symmetry
bfly = butterfly_svg()
star5 = star_svg(5, w=80, h=80)
snow  = snowflake_svg()

E3_S = (
    row(
        labeled(bfly,  'Butterfly: 1 line',    '#6c3483'),
        labeled(star5, 'Star: 5 lines',        '#f39c12'),
        labeled(snow,  'Snowflake: 6 lines',   '#2980b9'),
    ) +
    '<div style="text-align:center;font-size:12px;color:#777;margin-top:4px">'
    'Symmetry is all around us in nature!</div>'
)
print('E3_S single-quote check:', "'" in E3_S)

# ── Read the file ─────────────────────────────────────────────────────────────
with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# ── Helper: replace s: field using tag + end-of-a markers ────────────────────
def replace_s(content, tag, end_a, new_s):
    tag_b = tag.encode('utf-8')
    s_open = b"s:'"
    end_b = end_a.encode('utf-8')
    idx = content.find(tag_b)
    if idx == -1: return content, f'MISS tag: {tag}'
    s_idx = content.find(s_open, idx)
    if s_idx == -1: return content, f'MISS s:\' after tag'
    s_start = s_idx + len(s_open)
    end_idx = content.find(end_b, s_start)
    if end_idx == -1: return content, f'MISS end: {end_a}'
    old_len = end_idx - s_start
    new_b = new_s.encode('utf-8')
    return content[:s_start] + new_b + content[end_idx:], f'OK ({old_len}→{len(new_b)} bytes)'

content, r1 = replace_s(content, "tag:'What is Symmetry?'",
                         "',a:'Both halves must be mirror images", E1_S)
print('Example 1:', r1)

content, r2 = replace_s(content, "tag:'Shapes & Lines'",
                         "',a:'Count carefully!", E2_S)
print('Example 2:', r2)

content, r3 = replace_s(content, "tag:'Real Life'",
                         "',a:'Symmetry is beautiful!", E3_S)
print('Example 3:', r3)

# ── Practice question SVG additions ──────────────────────────────────────────
PRACTICE_PATCHES = [
    # Circle: show circle with multiple symmetry lines
    (b"{q:'Does a circle have a line of symmetry?'",
     b"{q:'Does a circle have a line of symmetry?" + circle_sym_svg(6, 72, 72).encode('utf-8') + b"'"),

    # Square: show square with 4 symmetry lines
    (b"{q:'How many lines of symmetry does a square have?'",
     b"{q:'How many lines of symmetry does a square have?" + poly_sym_svg(4,4,72,72).encode('utf-8') + b"'"),

    # Letter Z: show Z with no-symmetry mark
    (b"{q:'Does the letter Z have a line of symmetry?'",
     b"{q:'Does the letter Z have a line of symmetry?" + letter_svg('Z', False).encode('utf-8') + b"'"),
]

for old_b, new_b in PRACTICE_PATCHES:
    if old_b in content:
        content = content.replace(old_b, new_b, 1)
        print(f'  Practice OK: {old_b[4:55]}')
    else:
        print(f'  Practice MISS: {old_b[4:55]}')

# ── qBank SVG additions (append SVG to question text) ────────────────────────
def qpatch(old_q, svg):
    old_b = ("q('" + old_q + "',").encode('utf-8')
    new_b = ("q('" + old_q + svg + "',").encode('utf-8')
    return old_b, new_b

QBANK_PATCHES = [
    # Shapes
    qpatch('How many lines of symmetry does a circle have?',       circle_sym_svg(4, 68, 68)),
    qpatch('Which shape has NO symmetry?',                          scalene_tri_svg()),
    qpatch('How many lines of symmetry does a rhombus have?',      rhombus_sym_svg()),
    qpatch('How many lines of symmetry does a right triangle have?', right_tri_svg()),
    qpatch('How many lines of symmetry does a heart shape have?',  heart_svg()),
    qpatch('How many lines of symmetry does a 5-pointed star have?', star_svg(5, 80, 80)),
    qpatch('Snowflake typically has how many lines of symmetry?',   snowflake_svg()),
    qpatch('Butterfly has which type of symmetry?',                 butterfly_svg()),
    qpatch('Which shape has more lines of symmetry: a square or a rectangle?',
           poly_sym_svg(4,4,62,62) + rect_sym_svg(90,58)),

    # Letters WITH symmetry
    qpatch('Does the letter A have a line of symmetry?',  letter_svg('A', True, 'v')),
    qpatch('Does the letter B have a line of symmetry?',  letter_svg('B', True, 'h')),
    qpatch('How many lines of symmetry does the letter H have?', letter_svg('H', True, 'vh')),
    qpatch('Does the letter M have a line of symmetry?',  letter_svg('M', True, 'v')),
    qpatch('How many lines of symmetry does the letter O have?', letter_svg('O', True, 'v')),
    qpatch('How many lines of symmetry does the letter X have?', letter_svg('X', True, 'vh')),

    # Letters WITHOUT symmetry
    qpatch('Does the letter Z have a line of symmetry?',  letter_svg('Z', False)),
    qpatch('Does the letter S have a line of symmetry?',  letter_svg('S', False)),
    qpatch('Which letter has NO symmetry?',               letter_svg('F', False)),
]

hits = 0
for old_b, new_b in QBANK_PATCHES:
    if old_b in content:
        n = content.count(old_b)
        content = content.replace(old_b, new_b)
        hits += 1
        print(f'  qBank OK ({n}x): {old_b[3:55].decode("utf-8","replace")}')
    else:
        print(f'  qBank MISS: {old_b[3:55].decode("utf-8","replace")}')

print(f'\nqBank: {hits}/{len(QBANK_PATCHES)} patches applied.')

# ── Save ─────────────────────────────────────────────────────────────────────
with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Saved.')
