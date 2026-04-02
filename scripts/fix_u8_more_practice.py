"""Add more practice questions to u8 lessons 0, 1, and 2."""
import math

# ── Compact SVG helpers (same as before) ────────────────────────────────────

def sector(cx, cy, r, sd, ed, color, stroke='white', sw=1.2):
    s = math.radians(sd-90); e = math.radians(ed-90)
    x1=cx+r*math.cos(s); y1=cy+r*math.sin(s)
    x2=cx+r*math.cos(e); y2=cy+r*math.sin(e)
    lg = 1 if (ed-sd)>180 else 0
    return (f'<path d="M{cx},{cy} L{x1:.1f},{y1:.1f} A{r},{r},0,{lg},1,{x2:.1f},{y2:.1f} Z" '
            f'fill="{color}" stroke="{stroke}" stroke-width="{sw}"/>')

def dividers(cx, cy, r, n, color='#888', sw=1.2):
    out = ''
    for i in range(n):
        a = math.radians(i*360/n - 90)
        out += f'<line x1="{cx}" y1="{cy}" x2="{cx+r*math.cos(a):.1f}" y2="{cy+r*math.sin(a):.1f}" stroke="{color}" stroke-width="{sw}"/>'
    return out

def circle_svg(n, shade, color, bg='#f3eaf8', crust_color=None, fill_color=None,
               cx=45, cy=45, r=38, w=90, h=90):
    """Generic fraction circle."""
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 90 90" style="display:block;margin:4px auto">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg}" stroke="#aaa" stroke-width="1.5"/>')
    deg = 360/n
    for i in range(shade):
        p.append(sector(cx, cy, r, i*deg, (i+1)*deg, color))
    p.append(dividers(cx, cy, r, n, '#888', 1.4))
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#888" stroke-width="1.5"/>')
    p.append('</svg>')
    return ''.join(p)

def bar_svg(n, shade, color, bg='#f0e6f8', w=190, h=38):
    """Fraction bar."""
    pw = w/n
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display:block;margin:4px auto">']
    for i in range(n):
        fill = color if i < shade else bg
        p.append(f'<rect x="{i*pw:.1f}" y="0" width="{pw:.1f}" height="{h}" '
                 f'fill="{fill}" stroke="#888" stroke-width="1"/>')
    p.append('</svg>')
    return ''.join(p)

def pizza_svg(n, shade, w=90, h=90):
    cx=cy=45; r=38; ri=31
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 90 90" style="display:block;margin:4px auto">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F0B27A" stroke="#D35400" stroke-width="2"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{ri}" fill="#E74C3C"/>')
    for ox,oy,rx,ry in [(32,26,8,5),(57,31,9,5),(30,54,6,7),(57,54,7,6),(45,64,6,4)]:
        p.append(f'<ellipse cx="{ox}" cy="{oy}" rx="{rx}" ry="{ry}" fill="#F9E79F"/>')
    for ox,oy in [(35,28),(57,36),(33,57),(58,57)]:
        p.append(f'<circle cx="{ox}" cy="{oy}" r="4" fill="#922B21" opacity="0.9"/>')
    deg = 360/n
    for i in range(shade):
        p.append(sector(cx,cy,r,i*deg,(i+1)*deg,'rgba(39,174,96,0.4)','#27ae60',1.5))
    p.append(dividers(cx,cy,r,n,'#D35400',1.8))
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#D35400" stroke-width="2"/>')
    p.append('</svg>')
    return ''.join(p)

def pie_svg(n, shade, w=90, h=90):
    cx=cy=45; r=38
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 90 90" style="display:block;margin:4px auto">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F5CBA7" stroke="#D4AC0D" stroke-width="2"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="32" fill="#E59866"/>')
    deg = 360/n
    for i in range(shade):
        p.append(sector(cx,cy,r,i*deg,(i+1)*deg,'rgba(142,68,173,0.5)','#8e44ad',1.5))
    p.append(dividers(cx,cy,r,n,'#D4AC0D',1.8))
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#D4AC0D" stroke-width="2"/>')
    p.append('</svg>')
    return ''.join(p)

def candy_svg(n, shade, w=180, h=50):
    pw = 140/n
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display:block;margin:4px auto">']
    p.append(f'<rect x="15" y="4" width="150" height="40" rx="6" fill="#6E2F0A" stroke="#4A1C03" stroke-width="1.5"/>')
    for i in range(n):
        x = 17 + i*pw
        fill = '#F39C12' if i < shade else '#784212'
        p.append(f'<rect x="{x:.1f}" y="7" width="{pw-2:.1f}" height="30" rx="3" fill="{fill}"/>')
        if i < shade:
            p.append(f'<rect x="{x:.1f}" y="7" width="{pw-2:.1f}" height="30" rx="3" fill="none" stroke="#E67E22" stroke-width="1.5"/>')
    p.append('</svg>')
    return ''.join(p)

def cake_svg(n, shade, w=90, h=90):
    """Layered cake shown as a circle."""
    cx=cy=45; r=38
    p = [f'<svg width="{w}" height="{h}" viewBox="0 0 90 90" style="display:block;margin:4px auto">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#FDEBD0" stroke="#E59866" stroke-width="2"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="30" fill="#FADBD8"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="22" fill="#FDEBD0"/>')
    deg = 360/n
    for i in range(shade):
        p.append(sector(cx,cy,r,i*deg,(i+1)*deg,'rgba(231,76,60,0.5)','#e74c3c',1.5))
    p.append(dividers(cx,cy,r,n,'#E59866',1.8))
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#E59866" stroke-width="2"/>')
    p.append('</svg>')
    return ''.join(p)

# ── New practice questions ───────────────────────────────────────────────────
# Format: {q:'...SVG...', a:'...', h:'...', e:'emoji'}
# SVG is appended to q text; no single quotes allowed in SVG

def pq(q_text, svg, answer, hint, emoji):
    full_q = q_text + svg
    assert "'" not in full_q, f"Single quote found in: {full_q[:60]}"
    return f"{{q:'{full_q}',a:'{answer}',h:'{hint}',e:'{emoji}'}}"

# ── LESSON 0 — What is a Fraction? (5 new questions) ────────────────────────
L0_NEW = [
    pq('A pie is cut into 8 equal slices. You take 3. What fraction do you have?',
       pie_svg(8, 3),
       '3/8', 'You took 3 out of 8 equal slices. That is three eighths!', '🥧'),

    pq('A chocolate bar is split into 4 equal pieces. You eat 1. What fraction is eaten?',
       candy_svg(4, 1),
       '1/4', 'You ate 1 out of 4 equal pieces. That is one fourth!', '🍫'),

    pq('A rectangle is divided into 6 equal parts. 2 parts are colored. What fraction is colored?',
       bar_svg(6, 2, '#3498db'),
       '2/6', '2 colored out of 6 equal parts = two sixths!', '📐'),

    pq('A pizza is cut into 8 equal slices. 5 slices are eaten. What fraction is left?',
       pizza_svg(8, 3),
       '3/8', '8 slices total, 5 eaten, so 3 are left. 3 out of 8 = three eighths!', '🍕'),

    pq('A circle is divided into 4 equal parts. 4 parts are shaded. What fraction is shaded?',
       circle_svg(4, 4, '#8e44ad'),
       '4/4 = 1 whole', 'All 4 parts are shaded! 4/4 equals one whole.', '⭐'),
]

# ── LESSON 1 — Halves, Fourths, and Eighths (5 new questions) ───────────────
L1_NEW = [
    pq('A cake is cut into 4 equal pieces. Which fraction is the BIGGEST piece?',
       cake_svg(4, 1),
       '1/4 (each piece)', 'When cut into 4 equal parts, each piece is one fourth. Fewer cuts = bigger pieces!', '🎂'),

    pq('A pizza has 8 equal slices. How many slices equal one half of the pizza?',
       pizza_svg(8, 4),
       '4 slices = 1/2', '4 out of 8 slices is the same as one half! 4/8 = 1/2.', '🍕'),

    pq('Which fraction is closer to a whole pizza: 3/4 or 3/8?',
       bar_svg(4, 3, '#e74c3c'),
       '3/4 is closer to a whole', '3/4 means bigger pieces! 3 large pieces is closer to a full pizza than 3 tiny pieces.', '🍕'),

    pq('A ribbon is cut into 2 equal halves. How many halves make the whole ribbon?',
       bar_svg(2, 2, '#8e44ad'),
       '2 halves', '2/2 = 1 whole. Both halves together make the whole ribbon!', '🎀'),

    pq('A pie is divided into 8 equal slices. Jada eats 1 slice. Tom eats 3 slices. What fraction is left?',
       pie_svg(8, 4),
       '4/8 (or 1/2)', 'Jada + Tom ate 4 slices. 8 - 4 = 4 slices left. 4 out of 8 = four eighths!', '🥧'),
]

# ── LESSON 2 — Which Piece is Bigger? (5 new questions) ─────────────────────
L2_NEW = [
    pq('Look at these two fractions. Which is greater: 5/8 or 2/8?',
       bar_svg(8, 5, '#e74c3c') + bar_svg(8, 2, '#2980b9'),
       '5/8', 'Same denominator! Compare the tops: 5 pieces is more than 2 pieces.', '⚖️'),

    pq('Which fraction is smaller: 1/4 or 1/2?',
       circle_svg(4, 1, '#e67e22', bg='#fef3e2') + circle_svg(2, 1, '#e74c3c', bg='#fde8e8'),
       '1/4 is smaller', '1/4 means cut into MORE pieces, so each piece is SMALLER than 1/2.', '⚖️'),

    pq('Put these fractions in order from least to greatest: 1/2, 1/8, 1/4.',
       circle_svg(8,1,'#8e44ad') + circle_svg(4,1,'#e67e22',bg='#fef3e2') + circle_svg(2,1,'#e74c3c',bg='#fde8e8'),
       '1/8, 1/4, 1/2', 'More cuts = smaller pieces. 1/8 is smallest, 1/2 is largest!', '📊'),

    pq('A pizza is cut into 4 slices. Another pizza is cut into 8 slices. You get 1 slice from each. Which slice is bigger?',
       pizza_svg(4, 1) + pizza_svg(8, 1),
       '1/4 is bigger', 'Fewer slices means each slice is bigger! 1/4 > 1/8.', '🍕'),

    pq('Which fraction is greater: 6/8 or 2/8?',
       bar_svg(8, 6, '#27ae60') + bar_svg(8, 2, '#e74c3c'),
       '6/8', 'Same denominator — just compare the numerators. 6 > 2, so 6/8 > 2/8!', '⚖️'),
]

# ── Apply to HTML ────────────────────────────────────────────────────────────

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

def insert_before(content, anchor_bytes, new_items_str):
    idx = content.find(anchor_bytes)
    if idx == -1:
        return content, False
    insert = ('\n    ' + ',\n    '.join(new_items_str) + ',').encode('utf-8')
    return content[:idx] + insert + b'\n  ' + content[idx:], True

# L0: insert before its closing ],  (anchor = the e:'🔢'}, closing of L0 practice)
L0_ANCHOR = '\u0022},\n  ],\n   qBank:[\n    q(\'Pizza cut into 4 equal slices'.encode('utf-8')
L0_ANCHOR = b"'},\r\n  ],\r\n   qBank:[\r\n    q('Pizza cut into 4 equal slices"

# Easier: find the last practice item of each lesson and insert after it
# L0 ends with: e:'🔢'}, then ],
L0_END = 'Denominator is DOWN at the bottom! Total equal parts.'.encode('utf-8') + b"', e:'\xf0\x9f\x94\xa2'},"
L1_END = 'You need all 8 equal pieces!'.encode('utf-8') + b"', e:'\xf0\x9f\x8d\x95'},"
L2_END = 'Smaller denominator = bigger pieces!'.encode('utf-8') + b"', e:'\xe2\x9a\x96\xef\xb8\x8f'},"

for anchor, new_qs, label in [
    (L0_END, L0_NEW, 'L0'),
    (L1_END, L1_NEW, 'L1'),
    (L2_END, L2_NEW, 'L2'),
]:
    idx = content.find(anchor)
    if idx == -1:
        print(f'MISS anchor for {label}: {repr(anchor[:50])}')
    else:
        insert_pos = idx + len(anchor)
        new_bytes = ('\n    ' + ',\n    '.join(new_qs) + ',').encode('utf-8')
        content = content[:insert_pos] + new_bytes + content[insert_pos:]
        print(f'OK {label}: inserted {len(new_qs)} questions')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Saved.')
