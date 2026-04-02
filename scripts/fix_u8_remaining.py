import math

PURPLE='#8e44ad'; RED='#e74c3c'; ORANGE='#e67e22'; GREEN='#27ae60'

def sector(cx,cy,r,sd,ed,color,stroke='white',sw=1.5):
    s=math.radians(sd-90); e=math.radians(ed-90)
    x1=cx+r*math.cos(s); y1=cy+r*math.sin(s)
    x2=cx+r*math.cos(e); y2=cy+r*math.sin(e)
    lg=1 if (ed-sd)>180 else 0
    return (f'<path d="M{cx},{cy} L{x1:.2f},{y1:.2f} A{r},{r},0,{lg},1,{x2:.2f},{y2:.2f} Z" '
            f'fill="{color}" stroke="{stroke}" stroke-width="{sw}"/>')

def frac_circle(n,shade,color,bg='#f3eaf8',cx=50,cy=50,r=40,w=100,h=100,label=None):
    p=[f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display:inline-block;vertical-align:middle">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg}" stroke="#aaa" stroke-width="1.5"/>')
    deg=360/n
    for i in range(shade): p.append(sector(cx,cy,r,i*deg,(i+1)*deg,color))
    for i in range(n):
        a=math.radians(i*deg-90)
        p.append(f'<line x1="{cx}" y1="{cy}" x2="{cx+r*math.cos(a):.2f}" y2="{cy+r*math.sin(a):.2f}" stroke="#888" stroke-width="1.5"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#888" stroke-width="1.5"/>')
    if label:
        p.append(f'<text x="{cx}" y="{h-4}" text-anchor="middle" font-size="12" fill="#555" font-weight="bold">{label}</text>')
    p.append('</svg>')
    return ''.join(p)

def unequal_circle(cx=50,cy=50,r=40,w=100,h=100):
    p=[f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display:inline-block;vertical-align:middle">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#f3eaf8" stroke="#aaa" stroke-width="1.5"/>')
    ox=cx+15; dy=math.sqrt(max(0,r**2-(ox-cx)**2))
    sa=math.degrees(math.acos((ox-cx)/r))
    p.append(sector(cx,cy,r,90-sa,90+sa,'#e74c3c',stroke='white'))
    p.append(f'<line x1="{ox}" y1="{cy-dy:.1f}" x2="{ox}" y2="{cy+dy:.1f}" stroke="#888" stroke-width="1.5"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#888" stroke-width="1.5"/>')
    p.append('</svg>')
    return ''.join(p)

def row(*items):
    inner=''.join(f'<div style="text-align:center;margin:0 8px">{i}</div>' for i in items)
    return f'<div style="display:flex;justify-content:center;align-items:flex-end;flex-wrap:wrap;gap:8px;margin:10px 0">{inner}</div>'
def labeled(svg,text,color='#555'):
    return svg+f'<div style="font-size:13px;font-weight:bold;color:{color};margin-top:4px">{text}</div>'

# L0 E1 — Equal Parts
c_eq  = frac_circle(2, 1, PURPLE, label='EQUAL')
c_neq = unequal_circle()
l0e1_s = (
    row(labeled(c_eq,  'EQUAL - same size halves', GREEN),
        labeled(c_neq, 'NOT EQUAL - uneven split',  RED)) +
    '<div style="text-align:center;font-size:13px;color:#555;margin:4px">'
    'Both parts must be the <b>SAME SIZE</b>!</div>'
)

# L1 E1 — Key Rule
c4x = frac_circle(4, 1, ORANGE, bg='#fef3e2', label='1/4')
c8x = frac_circle(8, 1, PURPLE, bg='#f3eaf8', label='1/8')
l1e1_s = (
    '<div style="text-align:center;font-size:13px;color:#555;margin:6px 0">'
    'More equal cuts - each piece gets <b>smaller</b>!</div>' +
    row(labeled(c4x, '4 pieces - bigger slice',  ORANGE),
        labeled(c8x, '8 pieces - smaller slice!', PURPLE))
)

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# Use exact byte patterns extracted directly from the file
old1 = (b"s:'EQUAL parts \xe2\x9c\x85 \xe2\x80\x94 a circle cut perfectly in half"
        b"\\nNOT EQUAL \xe2\x9d\x8c \xe2\x80\x94 a circle cut unevenly"
        b"\\n\\nBoth halves must be the SAME SIZE!'")
new1 = ("s:'" + l0e1_s + "'").encode('utf-8')

old2 = (b"s:'When you cut something into MORE pieces, each piece is SMALLER!"
        b"\\n4 pieces \xe2\x86\x92 each piece is bigger"
        b"\\n8 pieces \xe2\x86\x92 each piece is smaller'")
new2 = ("s:'" + l1e1_s + "'").encode('utf-8')

for old, new, name in [(old1, new1, 'L0 E1'), (old2, new2, 'L1 E1')]:
    if old in content:
        content = content.replace(old, new, 1)
        print(f'Fixed {name}')
    else:
        print(f'MISS {name}')
        # Try without the prefix to diagnose
        core = old[3:-1]  # strip s:' and '
        idx = content.find(core)
        if idx >= 0:
            print(f'  Core found at {idx} — checking surrounding bytes')
            print(repr(content[idx-5:idx+len(core)+5]))

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Saved.')
