with open('E:/Cameron Jones/my-math-roots/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

inch_w = 20
cm_w = inch_w / 2.54  # 7.874 px per cm

# ─── RULER KEY IDEA SVG ──────────────────────────────────────────────────────
def build_ruler_svg():
    ruler_x0 = 12
    ruler_ytop = 24
    ruler_ybot = 40
    ruler_x1 = ruler_x0 + 12 * inch_w  # =252
    p = []
    p.append('<svg width="528" height="136" viewBox="0 0 264 68" style="display:block;margin:6px 0;border-radius:8px;background:#f5f9ff;border:1px solid #dde">')
    # ruler body
    p.append('<rect x="11" y="24" width="242" height="16" fill="#fff8e7" stroke="#c8a000" stroke-width="1" rx="2"/>')
    # 1-inch highlight
    p.append('<rect x="12" y="24" width="20" height="16" fill="#dbeeff" opacity="0.7"/>')
    # 1-cm highlight
    cx1 = ruler_x0 + cm_w
    p.append(f'<rect x="12" y="24" width="{cm_w:.1f}" height="16" fill="#ffe8e8" opacity="0.85"/>')
    # cm ticks
    for j in range(1, 32):
        x = ruler_x0 + j * cm_w
        if x > ruler_x1 + 0.5:
            break
        p.append(f'<line x1="{x:.1f}" y1="24" x2="{x:.1f}" y2="28" stroke="#bbb" stroke-width="0.5"/>')
    # half-inch ticks
    for i in range(12):
        x = ruler_x0 + i * inch_w + inch_w // 2
        p.append(f'<line x1="{x}" y1="24" x2="{x}" y2="31" stroke="#999" stroke-width="0.8"/>')
    # inch ticks + numbers 0-12
    for i in range(13):
        x = ruler_x0 + i * inch_w
        p.append(f'<line x1="{x}" y1="24" x2="{x}" y2="40" stroke="#555" stroke-width="1"/>')
        p.append(f'<text x="{x}" y="47" text-anchor="middle" font-size="5" fill="#444">{i}</text>')
    # 1-inch bracket above
    p.append('<path d="M12,16 L12,13 L32,13 L32,16" fill="none" stroke="#2980b9" stroke-width="1"/>')
    p.append('<text x="22" y="11" text-anchor="middle" font-size="5" fill="#2980b9" font-weight="bold">1 inch</text>')
    # 1-cm bracket at top edge
    p.append(f'<line x1="12" y1="23" x2="{cx1:.1f}" y2="23" stroke="#e74c3c" stroke-width="0.9"/>')
    p.append(f'<line x1="12" y1="22" x2="12" y2="24" stroke="#e74c3c" stroke-width="0.9"/>')
    p.append(f'<line x1="{cx1:.1f}" y1="22" x2="{cx1:.1f}" y2="24" stroke="#e74c3c" stroke-width="0.9"/>')
    p.append(f'<text x="{cx1+22:.0f}" y="24" font-size="4.5" fill="#e74c3c" font-weight="bold">← 1 cm</text>')
    # 1-foot bracket below
    p.append('<path d="M12,51 L12,54 L252,54 L252,51" fill="none" stroke="#27ae60" stroke-width="1"/>')
    p.append('<text x="132" y="62" text-anchor="middle" font-size="6" fill="#27ae60" font-weight="bold">1 foot = 12 inches</text>')
    # legend (right side)
    p.append('<rect x="255" y="26" width="7" height="6" fill="#dbeeff" stroke="#2980b9" stroke-width="0.5"/>')
    p.append('<text x="264" y="32" font-size="4.5" fill="#2980b9">= 1 inch</text>')
    p.append('<rect x="255" y="35" width="7" height="6" fill="#ffe8e8" stroke="#e74c3c" stroke-width="0.5"/>')
    p.append('<text x="264" y="41" font-size="4.5" fill="#e74c3c">= 1 cm</text>')
    p.append('</svg>')
    return ''.join(p)

RULER_SVG = build_ruler_svg()

# ─── EXAMPLE 1 SVG: Objects next to ruler ────────────────────────────────────
def build_objects_ruler_svg():
    objects = [
        ('Paperclip', 1,  '#e74c3c'),
        ('Pencil',    5,  '#2980b9'),
        ('Book',      8,  '#8e44ad'),
    ]
    row_h = 44
    total_h = len(objects) * row_h + 6
    vw = 280
    p = [f'<svg width="560" height="{total_h * 2}" viewBox="0 0 {vw} {total_h}" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">']
    for idx, (label, length_in, color) in enumerate(objects):
        y0 = 3 + idx * row_h
        ruler_y = y0 + 26
        ruler_x0 = 40
        show_in = min(length_in + 3, 11)
        rx1 = ruler_x0 + show_in * inch_w
        bg = '#f8faff' if idx % 2 == 0 else '#ffffff'
        p.append(f'<rect x="0" y="{y0}" width="{vw}" height="{row_h}" fill="{bg}" rx="3"/>')
        # Left label
        p.append(f'<text x="4" y="{y0 + 20}" font-size="7" fill="#333" font-weight="bold">{label}</text>')
        # Object bar
        obj_w = length_in * inch_w
        p.append(f'<rect x="{ruler_x0}" y="{ruler_y - 14}" width="{obj_w}" height="10" fill="{color}" rx="3" opacity="0.85"/>')
        p.append(f'<text x="{ruler_x0 + obj_w // 2}" y="{ruler_y - 6}" text-anchor="middle" font-size="5.5" fill="white" font-weight="bold">{"1 inch" if length_in == 1 else str(length_in) + " inches"}</text>')
        # Ruler body
        p.append(f'<rect x="{ruler_x0}" y="{ruler_y}" width="{show_in * inch_w}" height="12" fill="#fff8e7" stroke="#c8a000" stroke-width="0.8" rx="1"/>')
        # Inch ticks + numbers
        for i in range(show_in + 1):
            x = ruler_x0 + i * inch_w
            if x > rx1:
                break
            p.append(f'<line x1="{x}" y1="{ruler_y}" x2="{x}" y2="{ruler_y + 12}" stroke="#666" stroke-width="0.8"/>')
            p.append(f'<text x="{x}" y="{ruler_y + 18}" text-anchor="middle" font-size="4.5" fill="#444">{i}</text>')
        # Dashed line at object end
        p.append(f'<line x1="{ruler_x0 + obj_w}" y1="{ruler_y - 14}" x2="{ruler_x0 + obj_w}" y2="{ruler_y + 12}" stroke="{color}" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.7"/>')
    p.append('</svg>')
    return ''.join(p)

OBJECTS_SVG = build_objects_ruler_svg()

# ─── EXAMPLE 2 SVG: 12-inch ruler = 1 foot ───────────────────────────────────
def build_feet_svg():
    rx0, ry = 12, 28
    p = ['<svg width="560" height="130" viewBox="0 0 280 65" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">']
    p.append('<text x="140" y="11" text-anchor="middle" font-size="7" fill="#333" font-weight="bold">12 inches = 1 foot</text>')
    p.append(f'<rect x="{rx0 - 1}" y="{ry}" width="{12 * inch_w + 2}" height="16" fill="#fff8e7" stroke="#c8a000" stroke-width="1" rx="2"/>')
    for i in range(13):
        x = rx0 + i * inch_w
        p.append(f'<line x1="{x}" y1="{ry}" x2="{x}" y2="{ry + 16}" stroke="#555" stroke-width="0.9"/>')
        p.append(f'<text x="{x}" y="{ry + 22}" text-anchor="middle" font-size="5" fill="#444">{i}"</text>')
    # foot brace
    fy = ry + 30
    bx1 = rx0 + 12 * inch_w
    p.append(f'<path d="M{rx0},{fy - 3} L{rx0},{fy} L{bx1},{fy} L{bx1},{fy - 3}" fill="none" stroke="#27ae60" stroke-width="1.2"/>')
    p.append(f'<text x="{(rx0 + bx1) // 2}" y="{fy + 9}" text-anchor="middle" font-size="7" fill="#27ae60" font-weight="bold">= 1 foot</text>')
    p.append('<text x="140" y="64" text-anchor="middle" font-size="5.5" fill="#888">A classroom is about 30 feet long</text>')
    p.append('</svg>')
    return ''.join(p)

FEET_SVG = build_feet_svg()

print('RULER_SVG length:', len(RULER_SVG))
print('OBJECTS_SVG length:', len(OBJECTS_SVG))
print('FEET_SVG length:', len(FEET_SVG))

# ─── Apply replacements ───────────────────────────────────────────────────────
OLD_POINTS = "points:['Always start at the ZERO end of the ruler','Use INCHES for small things (pencil, book)','Use FEET for bigger things (room, door)','CENTIMETERS (cm) are smaller than inches \u2014 100 cm = 1 meter'],"
NEW_POINTS = "points:['Always start at the ZERO end of the ruler','Use INCHES for small things (pencil, book)','Use FEET for bigger things (room, door)','CENTIMETERS (cm) are smaller than inches \u2014 100 cm = 1 meter','" + RULER_SVG + "'],"

OLD_EX1_S = "s:'\ud83d\udcce Paperclip \u2248 1 inch\\n\u270f\ufe0f Pencil \u2248 5 inches\\n\ud83d\udcda Book \u2248 8 inches\\n\ud83d\udeaa Door \u2248 7 feet'"
NEW_EX1_S = "s:'" + OBJECTS_SVG + "\\n\ud83d\udeaa Door \u2248 7 feet (too big for ruler \u2014 about as tall as a room!)'"

OLD_EX2_S = "s:'12 inches = 1 foot\\nA ruler is usually 12 inches long\\nA classroom is about 30 feet long'"
NEW_EX2_S = "s:'" + FEET_SVG + "'"

applied = 0
for old, new in [(OLD_POINTS, NEW_POINTS), (OLD_EX1_S, NEW_EX1_S), (OLD_EX2_S, NEW_EX2_S)]:
    if old in content:
        content = content.replace(old, new, 1)
        applied += 1
        print('Applied:', old[:70])
    else:
        print('MISSING:', repr(old[:80]))

with open('E:/Cameron Jones/my-math-roots/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Total applied: {applied}/3')
