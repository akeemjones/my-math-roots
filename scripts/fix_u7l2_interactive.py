import math

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# ─── Build interactive clock HTML ────────────────────────────────────────────
# Use &#39; for single quotes inside oninput JS so no escaping needed in the JS string
SQ = '&#39;'

cx, cy, r, nr = 50, 50, 44, 35

# Clock face elements
face = ''
face += f'<circle cx="{cx}" cy="{cy}" r="{r+2}" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>'
face += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fffef5" stroke="#888" stroke-width="1.5"/>'
for i in range(1, 13):
    a = math.radians(i * 30)
    x1 = cx + (r - 5) * math.sin(a)
    y1 = cy - (r - 5) * math.cos(a)
    x2 = cx + r * math.sin(a)
    y2 = cy - r * math.cos(a)
    sw = '2' if i % 3 == 0 else '1'
    face += (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
             f'stroke="#555" stroke-width="{sw}"/>')
    nx = cx + nr * math.sin(a)
    ny = cy - nr * math.cos(a)
    face += (f'<text x="{nx:.1f}" y="{ny:.1f}" text-anchor="middle" '
             f'dominant-baseline="central" font-size="9" font-weight="bold" fill="#333">{i}</text>')

# JS update handler (&#39; = single quote, safe inside double-quoted HTML attribute)
update = (
    f"(function(){{"
    f"var h=+document.getElementById({SQ}ic-hs{SQ}).value;"
    f"var m=+document.getElementById({SQ}ic-ms{SQ}).value;"
    f"var ha=(h%12+m/60)*30;"
    f"var ma=m*6;"
    f"document.getElementById({SQ}ic-hh{SQ}).setAttribute({SQ}transform{SQ},{SQ}rotate({SQ}+ha+{SQ},{cx},{cy}){SQ});"
    f"document.getElementById({SQ}ic-mh{SQ}).setAttribute({SQ}transform{SQ},{SQ}rotate({SQ}+ma+{SQ},{cx},{cy}){SQ});"
    f"document.getElementById({SQ}ic-dt{SQ}).textContent=h+{SQ}:{SQ}+(m<10?{SQ}0{SQ}:{SQ}{SQ})+m;"
    f"}}).call(this)"
)

INTERACTIVE_HTML = (
    '<div style="text-align:center;padding:4px">'
    # Clock SVG — initial position 3:00 (hour hand rotated 90°, minute at 0°)
    f'<svg id="iclock" width="240" height="240" viewBox="0 0 100 100" style="display:block;margin:6px auto">'
    + face +
    f'<line id="ic-mh" x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy-38}" '
    f'stroke="#333" stroke-width="2.5" stroke-linecap="round" transform="rotate(0,{cx},{cy})"/>'
    f'<line id="ic-hh" x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy-26}" '
    f'stroke="#2980b9" stroke-width="4.5" stroke-linecap="round" transform="rotate(90,{cx},{cy})"/>'
    f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="#e74c3c"/>'
    '</svg>'
    # Digital display
    '<div id="ic-dt" style="font-size:28px;font-weight:bold;color:#2980b9;margin:4px 0">3:00</div>'
    '<div style="font-size:11px;color:#666;margin-bottom:10px">'
    '&#128309; Short hand (blue) = hours &nbsp;|&nbsp; &#11035; Long hand = minutes'
    '</div>'
    # Sliders
    '<div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap">'
    f'<label style="font-size:13px;font-weight:bold;color:#333">&#x23F0; Hour<br>'
    f'<input id="ic-hs" type="range" min="1" max="12" value="3" '
    f'style="width:120px;margin-top:4px" oninput="{update}"></label>'
    f'<label style="font-size:13px;font-weight:bold;color:#333">&#8987; Minute<br>'
    f'<input id="ic-ms" type="range" min="0" max="55" step="5" value="0" '
    f'style="width:120px;margin-top:4px" oninput="{update}"></label>'
    '</div>'
    '</div>'
)

print('HTML length:', len(INTERACTIVE_HTML))
# Verify no single quotes (would break the JS string)
sq_count = INTERACTIVE_HTML.count("'")
print('Unescaped single quotes in HTML:', sq_count)
if sq_count > 0:
    for i, c in enumerate(INTERACTIVE_HTML):
        if c == "'":
            print('  at pos', i, ':', repr(INTERACTIVE_HTML[max(0,i-20):i+20]))

# ─── Insert as new example before closing ] of u7l2 examples ─────────────────
NEW_EXAMPLE = (
    "{c:'#1abc9c',tag:'Try It! Interactive Clock',p:'Move the sliders to set the hands:'"
    f",s:'{INTERACTIVE_HTML}'"
    ",a:'Short hand = hour, Long hand = minutes &#x2705;'}"
)

# Find the insertion point: after the last u7l2 example, before  ],
OLD = b"',vis:'clock:4:0'},\r\n   ],"
NEW = ("',vis:'clock:4:0'},\r\n    " + NEW_EXAMPLE + ",\r\n   ],").encode('utf-8')

if OLD in content:
    content = content.replace(OLD, NEW, 1)
    print('Inserted interactive clock example')
else:
    print('MISSING insertion point')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Done.')
