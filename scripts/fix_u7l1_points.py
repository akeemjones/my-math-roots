import sys

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

inch_w = 20
cm_w = inch_w / 2.54
ruler_x0 = 12
ruler_x1 = ruler_x0 + 12 * inch_w
cx1 = ruler_x0 + cm_w

p = []
p.append('<svg width="528" height="136" viewBox="0 0 264 68" style="display:block;margin:6px 0;border-radius:8px;background:#f5f9ff;border:1px solid #dde">')
p.append('<rect x="11" y="24" width="242" height="16" fill="#fff8e7" stroke="#c8a000" stroke-width="1" rx="2"/>')
p.append('<rect x="12" y="24" width="20" height="16" fill="#dbeeff" opacity="0.7"/>')
p.append('<rect x="12" y="24" width="%.1f" height="16" fill="#ffe8e8" opacity="0.85"/>' % cm_w)
for j in range(1, 32):
    x = ruler_x0 + j * cm_w
    if x > ruler_x1 + 0.5:
        break
    p.append('<line x1="%.1f" y1="24" x2="%.1f" y2="28" stroke="#bbb" stroke-width="0.5"/>' % (x, x))
for i in range(12):
    x = ruler_x0 + i * inch_w + inch_w // 2
    p.append('<line x1="%d" y1="24" x2="%d" y2="31" stroke="#999" stroke-width="0.8"/>' % (x, x))
for i in range(13):
    x = ruler_x0 + i * inch_w
    p.append('<line x1="%d" y1="24" x2="%d" y2="40" stroke="#555" stroke-width="1"/>' % (x, x))
    p.append('<text x="%d" y="47" text-anchor="middle" font-size="5" fill="#444">%d</text>' % (x, i))
p.append('<path d="M12,16 L12,13 L32,13 L32,16" fill="none" stroke="#2980b9" stroke-width="1"/>')
p.append('<text x="22" y="11" text-anchor="middle" font-size="5" fill="#2980b9" font-weight="bold">1 inch</text>')
p.append('<line x1="12" y1="23" x2="%.1f" y2="23" stroke="#e74c3c" stroke-width="0.9"/>' % cx1)
p.append('<line x1="12" y1="22" x2="12" y2="24" stroke="#e74c3c" stroke-width="0.9"/>')
p.append('<line x1="%.1f" y1="22" x2="%.1f" y2="24" stroke="#e74c3c" stroke-width="0.9"/>' % (cx1, cx1))
p.append('<text x="%.0f" y="24" font-size="4.5" fill="#e74c3c" font-weight="bold">&#8592; 1 cm</text>' % (cx1 + 22))
p.append('<path d="M12,51 L12,54 L252,54 L252,51" fill="none" stroke="#27ae60" stroke-width="1"/>')
p.append('<text x="132" y="62" text-anchor="middle" font-size="6" fill="#27ae60" font-weight="bold">1 foot = 12 inches</text>')
p.append('<rect x="255" y="26" width="7" height="6" fill="#dbeeff" stroke="#2980b9" stroke-width="0.5"/>')
p.append('<text x="264" y="32" font-size="4.5" fill="#2980b9">= 1 inch</text>')
p.append('<rect x="255" y="35" width="7" height="6" fill="#ffe8e8" stroke="#e74c3c" stroke-width="0.5"/>')
p.append('<text x="264" y="41" font-size="4.5" fill="#e74c3c">= 1 cm</text>')
p.append('</svg>')
RULER_SVG = ''.join(p)

OLD = b"points:['Always start at the ZERO end of the ruler','Use INCHES for small things (pencil, book)','Use FEET for bigger things (room, door)','CENTIMETERS (cm) are smaller than inches \xe2\x80\x94 100 cm = 1 meter'],"
NEW = b"points:['Always start at the ZERO end of the ruler','Use INCHES for small things (pencil, book)','Use FEET for bigger things (room, door)','CENTIMETERS (cm) are smaller than inches \xe2\x80\x94 100 cm = 1 meter','" + RULER_SVG.encode('utf-8') + b"'],"

if OLD in content:
    content = content.replace(OLD, NEW, 1)
    print('Applied ruler SVG to points')
else:
    print('MISSING: points array not found')
    sys.exit(1)

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)

print('Done.')
