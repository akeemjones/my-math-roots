with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

SQ = '&#39;'

# ── Thermometer SVG dimensions ──────────────────────────────────────────────
cx     = 20      # horizontal center of thermometer tube
y_top  = 12      # top of mercury column
y_bot  = 118     # bottom of tube (meets bulb)
tube_h = y_bot - y_top   # 106 svg units = full scale
tube_x = cx - 4
tube_w = 8
bulb_cy = 129
bulb_r  = 11
min_t, max_t = 0, 220

def ty(t):
    """SVG y for top of mercury at temperature t."""
    return y_bot - (t - min_t) / (max_t - min_t) * tube_h

# ── Static thermometer SVG ───────────────────────────────────────────────────
init_t    = 70
init_h    = (init_t - min_t) / (max_t - min_t) * tube_h
init_y    = ty(init_t)

landmarks = [
    (212, '212\u00b0F  Boiling!',   '#e74c3c'),
    ( 98, ' 98\u00b0F  Body temp',  '#e67e22'),
    ( 70, ' 70\u00b0F  Comfortable','#27ae60'),
    ( 32, ' 32\u00b0F  Freezing!',  '#2980b9'),
]

p = [f'<svg width="220" height="300" viewBox="0 0 110 150" '
     f'style="display:block;margin:0 auto">']

# Glass tube
p.append(f'<rect x="{cx-5}" y="{y_top-4}" width="10" height="{tube_h+4}" '
         f'rx="5" fill="#e8f4f8" stroke="#aaa" stroke-width="1"/>')

# Mercury fill (variable)
p.append(f'<rect id="ith-fill" x="{tube_x}" y="{init_y:.1f}" '
         f'width="{tube_w}" height="{init_h:.1f}" fill="#e74c3c"/>')

# Bulb
p.append(f'<circle cx="{cx}" cy="{bulb_cy}" r="{bulb_r}" '
         f'fill="#e74c3c" stroke="#aaa" stroke-width="1"/>')
p.append(f'<circle cx="{cx}" cy="{bulb_cy}" r="{bulb_r-3}" fill="#c0392b"/>')

# Tick marks + labels
for t, lbl, color in landmarks:
    y = ty(t)
    p.append(f'<line x1="{cx+5}" y1="{y:.1f}" x2="{cx+9}" y2="{y:.1f}" '
             f'stroke="{color}" stroke-width="1.2"/>')
    p.append(f'<text x="{cx+11}" y="{y:.1f}" dominant-baseline="central" '
             f'font-size="6.5" fill="{color}" font-weight="bold">{lbl}</text>')

p.append('</svg>')
thermo_svg = ''.join(p)

# ── JS update handler ────────────────────────────────────────────────────────
update = (
    f"(function(){{"
    f"var t=+document.getElementById({SQ}ith-s{SQ}).value;"
    f"var fillH=(t-{min_t})/({max_t}-{min_t})*{tube_h};"
    f"var fillY={y_bot}-fillH;"
    f"var el=document.getElementById({SQ}ith-fill{SQ});"
    f"el.setAttribute({SQ}y{SQ},fillY);"
    f"el.setAttribute({SQ}height{SQ},fillH);"
    f"var dt=document.getElementById({SQ}ith-dt{SQ});"
    f"dt.textContent=t+{SQ}\u00b0F{SQ};"
    f"dt.style.color=t<=32?{SQ}#2980b9{SQ}:t<=75?{SQ}#27ae60{SQ}:{SQ}#e74c3c{SQ};"
    f"var lbl=t<=32?{SQ}Freezing!{SQ}:t<=50?{SQ}Cold{SQ}:t<=65?{SQ}Cool{SQ}"
    f":t<=75?{SQ}Comfortable{SQ}:t<=90?{SQ}Warm{SQ}:t<=105?{SQ}Hot!{SQ}:{SQ}Boiling!{SQ};"
    f"document.getElementById({SQ}ith-lbl{SQ}).textContent=lbl;"
    f"}}).call(this)"
)

# ── Full interactive HTML ────────────────────────────────────────────────────
INTERACTIVE_HTML = (
    '<div style="text-align:center;padding:4px">'
    + thermo_svg
    + f'<div id="ith-dt" style="font-size:32px;font-weight:bold;color:#27ae60;margin:6px 0">70\u00b0F</div>'
    f'<div id="ith-lbl" style="font-size:15px;color:#555;margin-bottom:10px">Comfortable</div>'
    f'<label style="font-size:13px;font-weight:bold;color:#333">&#127777;&#65039; Temperature<br>'
    f'<input id="ith-s" type="range" min="{min_t}" max="{max_t}" value="70" '
    f'style="width:200px;margin-top:6px" oninput="{update}"></label>'
    '</div>'
)

print('HTML length:', len(INTERACTIVE_HTML))
sq_count = INTERACTIVE_HTML.count("'")
print('Unescaped single quotes:', sq_count)
if sq_count:
    for i, c in enumerate(INTERACTIVE_HTML):
        if c == "'":
            print('  pos', i, repr(INTERACTIVE_HTML[max(0,i-20):i+20]))

# ── Insert as new example before closing ] of u7l3 examples ─────────────────
NEW_EXAMPLE = (
    "{c:'#e74c3c',tag:'Try It! Thermometer',p:'Drag the slider to change the temperature:'"
    f",s:'{INTERACTIVE_HTML}'"
    ",a:'Watch the mercury rise and fall! &#x2705;'}"
)

OLD = 'Ounces for light, pounds for heavy \u2705\'},\r\n   ],'
NEW = 'Ounces for light, pounds for heavy \u2705\'},\r\n    ' + NEW_EXAMPLE + ',\r\n   ],'

OLD_b = OLD.encode('utf-8')
NEW_b = NEW.encode('utf-8')

if OLD_b in content:
    content = content.replace(OLD_b, NEW_b, 1)
    print('Inserted thermometer example')
else:
    print('MISSING insertion point')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Done.')
