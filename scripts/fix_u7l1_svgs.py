with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

inch_w = 20
cm_w = inch_w / 2.54  # 7.874

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
        p.append(f'<text x="4" y="{y0 + 20}" font-size="7" fill="#333" font-weight="bold">{label}</text>')
        obj_w = length_in * inch_w
        p.append(f'<rect x="{ruler_x0}" y="{ruler_y - 14}" width="{obj_w}" height="10" fill="{color}" rx="3" opacity="0.85"/>')
        lbl_text = "1 inch" if length_in == 1 else f"{length_in} inches"
        p.append(f'<text x="{ruler_x0 + obj_w // 2}" y="{ruler_y - 6}" text-anchor="middle" font-size="5.5" fill="white" font-weight="bold">{lbl_text}</text>')
        p.append(f'<rect x="{ruler_x0}" y="{ruler_y}" width="{show_in * inch_w}" height="12" fill="#fff8e7" stroke="#c8a000" stroke-width="0.8" rx="1"/>')
        for i in range(show_in + 1):
            x = ruler_x0 + i * inch_w
            if x > rx1:
                break
            p.append(f'<line x1="{x}" y1="{ruler_y}" x2="{x}" y2="{ruler_y + 12}" stroke="#666" stroke-width="0.8"/>')
            p.append(f'<text x="{x}" y="{ruler_y + 18}" text-anchor="middle" font-size="4.5" fill="#444">{i}</text>')
        end_x = ruler_x0 + obj_w
        p.append(f'<line x1="{end_x}" y1="{ruler_y - 14}" x2="{end_x}" y2="{ruler_y + 12}" stroke="{color}" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.7"/>')
    p.append('</svg>')
    return ''.join(p)

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
    fy = ry + 30
    bx1 = rx0 + 12 * inch_w
    p.append(f'<path d="M{rx0},{fy - 3} L{rx0},{fy} L{bx1},{fy} L{bx1},{fy - 3}" fill="none" stroke="#27ae60" stroke-width="1.2"/>')
    p.append(f'<text x="{(rx0 + bx1) // 2}" y="{fy + 9}" text-anchor="middle" font-size="7" fill="#27ae60" font-weight="bold">= 1 foot</text>')
    p.append('<text x="140" y="64" text-anchor="middle" font-size="5.5" fill="#888">A classroom is about 30 feet long</text>')
    p.append('</svg>')
    return ''.join(p)

OBJECTS_SVG = build_objects_ruler_svg()
FEET_SVG = build_feet_svg()

# Replace placeholders using binary mode to avoid encoding issues
content = content.replace(b'OBJECTS_SVG_PLACEHOLDER', OBJECTS_SVG.encode('utf-8'))
content = content.replace(b'FEET_SVG_PLACEHOLDER', FEET_SVG.encode('utf-8'))

applied_o = b'OBJECTS_SVG_PLACEHOLDER' not in content
applied_f = b'FEET_SVG_PLACEHOLDER' not in content
print(f'Objects SVG applied: {applied_o}')
print(f'Feet SVG applied: {applied_f}')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)

print('Done.')
