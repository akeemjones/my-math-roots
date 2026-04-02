"""Replace the simple geometric food shapes with realistic pizza/brownie/candy-bar SVGs."""

# ── Realistic Pizza SVG (1/4 shaded) ────────────────────────────────────────
pizza_svg = (
    '<svg width="130" height="130" viewBox="0 0 100 100" style="display:inline-block;vertical-align:middle">'
    # Outer crust
    '<circle cx="50" cy="50" r="46" fill="#F0B27A" stroke="#D35400" stroke-width="2.5"/>'
    # Sauce
    '<circle cx="50" cy="50" r="38" fill="#E74C3C"/>'
    # Cheese blobs
    '<ellipse cx="36" cy="30" rx="10" ry="7" fill="#F9E79F"/>'
    '<ellipse cx="62" cy="36" rx="11" ry="7" fill="#F9E79F"/>'
    '<ellipse cx="34" cy="60" rx="8"  ry="9" fill="#F9E79F"/>'
    '<ellipse cx="63" cy="60" rx="9"  ry="7" fill="#F9E79F"/>'
    '<ellipse cx="50" cy="72" rx="7"  ry="6" fill="#F9E79F"/>'
    # Pepperoni
    '<circle cx="38" cy="32" r="5" fill="#922B21" stroke="#7B241C" stroke-width="0.5" opacity="0.9"/>'
    '<circle cx="63" cy="40" r="5" fill="#922B21" stroke="#7B241C" stroke-width="0.5" opacity="0.9"/>'
    '<circle cx="36" cy="62" r="5" fill="#922B21" stroke="#7B241C" stroke-width="0.5" opacity="0.9"/>'
    '<circle cx="64" cy="62" r="5" fill="#922B21" stroke="#7B241C" stroke-width="0.5" opacity="0.9"/>'
    # Slice dividers (cut lines)
    '<line x1="50" y1="4" x2="50" y2="96" stroke="#D35400" stroke-width="2"/>'
    '<line x1="4" y1="50" x2="96" y2="50" stroke="#D35400" stroke-width="2"/>'
    # Highlight top-right slice (= 1/4) with green glow
    '<path d="M50,50 L50,4 A46,46,0,0,1,96,50 Z" fill="#2ecc71" opacity="0.3"/>'
    '<path d="M50,50 L50,4 A46,46,0,0,1,96,50 Z" fill="none" stroke="#27ae60" stroke-width="2"/>'
    # Crust border on top
    '<circle cx="50" cy="50" r="46" fill="none" stroke="#D35400" stroke-width="2.5"/>'
    '</svg>'
)

# ── Realistic Brownie Pan SVG (1/8 shaded) ───────────────────────────────────
brownie_svg = (
    '<svg width="150" height="110" viewBox="0 0 140 100" style="display:inline-block;vertical-align:middle">'
    # Pan
    '<rect x="4"  y="10" width="132" height="72" rx="8" fill="#6E2F0A" stroke="#4A1C03" stroke-width="2"/>'
    # Brownie surface
    '<rect x="10" y="15" width="120" height="62" rx="5" fill="#784212"/>'
    # Gloss highlight
    '<rect x="12" y="17" width="116" height="10" rx="3" fill="rgba(255,255,255,0.1)"/>'
    # Grid cuts (4 columns × 2 rows = 8 pieces)
    '<line x1="40"  y1="15" x2="40"  y2="77" stroke="#4A1C03" stroke-width="2"/>'
    '<line x1="70"  y1="15" x2="70"  y2="77" stroke="#4A1C03" stroke-width="2"/>'
    '<line x1="100" y1="15" x2="100" y2="77" stroke="#4A1C03" stroke-width="2"/>'
    '<line x1="10"  y1="46" x2="130" y2="46" stroke="#4A1C03" stroke-width="2"/>'
    # Chocolate chips on each piece
    '<circle cx="25"  cy="30" r="2.5" fill="#2C1503"/>'
    '<circle cx="55"  cy="25" r="2.5" fill="#2C1503"/>'
    '<circle cx="85"  cy="32" r="2.5" fill="#2C1503"/>'
    '<circle cx="115" cy="27" r="2.5" fill="#2C1503"/>'
    '<circle cx="25"  cy="62" r="2.5" fill="#2C1503"/>'
    '<circle cx="55"  cy="58" r="2.5" fill="#2C1503"/>'
    '<circle cx="85"  cy="63" r="2.5" fill="#2C1503"/>'
    '<circle cx="115" cy="60" r="2.5" fill="#2C1503"/>'
    # Highlight first piece (top-left = 1/8)
    '<rect x="11" y="16" width="28" height="29" rx="4" fill="#F39C12" opacity="0.55"/>'
    '<rect x="11" y="16" width="28" height="29" rx="4" fill="none" stroke="#E67E22" stroke-width="1.5"/>'
    '</svg>'
)

# ── Realistic Candy Bar / Chocolate Bar SVG (1/2 shaded) ─────────────────────
candy_svg = (
    '<svg width="130" height="90" viewBox="0 0 120 80" style="display:inline-block;vertical-align:middle">'
    # Wrapper background
    '<rect x="5"  y="8"  width="110" height="52" rx="8" fill="#8E44AD" stroke="#6C3483" stroke-width="2"/>'
    # Foil / wrapper texture strips
    '<rect x="7"  y="10" width="106" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>'
    '<rect x="7"  y="53" width="106" height="4" rx="2" fill="rgba(0,0,0,0.1)"/>'
    # Chocolate bar surface
    '<rect x="10" y="14" width="100" height="40" rx="5" fill="#6E2F0A"/>'
    # Shine
    '<rect x="12" y="16" width="96" height="8" rx="3" fill="rgba(255,255,255,0.12)"/>'
    # Center dividing score line
    '<line x1="60" y1="14" x2="60" y2="54" stroke="#4A1C03" stroke-width="2.5"/>'
    # Score lines on each half (for texture)
    '<line x1="10" y1="34" x2="60" y2="34" stroke="#5D1E00" stroke-width="1"/>'
    '<line x1="60" y1="34" x2="110" y2="34" stroke="#5D1E00" stroke-width="1"/>'
    # Highlight left half (= 1/2)
    '<rect x="11" y="15" width="48" height="38" rx="4" fill="#F39C12" opacity="0.5"/>'
    '<rect x="11" y="15" width="48" height="38" rx="4" fill="none" stroke="#E67E22" stroke-width="1.5"/>'
    # "1/2" text label inside bar
    '<text x="35" y="38" text-anchor="middle" font-size="13" fill="white" font-weight="bold" opacity="0.9">1/2</text>'
    '<text x="85" y="38" text-anchor="middle" font-size="13" fill="#784212" font-weight="bold" opacity="0.6">1/2</text>'
    '</svg>'
)

# ── Build new s field ─────────────────────────────────────────────────────────
def item(svg, line1, line2, color):
    return (
        f'<div style="text-align:center;margin:0 12px">'
        + svg +
        f'<div style="font-size:13px;font-weight:bold;color:{color};margin-top:4px">{line1}</div>'
        f'<div style="font-size:11px;color:#777">{line2}</div>'
        f'</div>'
    )

new_s = (
    '<div style="display:flex;justify-content:center;align-items:flex-end;flex-wrap:wrap;gap:4px;margin:10px 0">'
    + item(pizza_svg,  '1 slice = 1/4',  '(1 of 4 equal slices)', '#e74c3c')
    + item(candy_svg,  '1 half = 1/2',   '(1 of 2 equal pieces)', '#8e44ad')
    + item(brownie_svg,'1 piece = 1/8',  '(1 of 8 equal pieces)', '#e67e22')
    + '</div>'
)

# Check for single quotes in the new content
if "'" in new_s:
    print("WARNING: single quote found in new_s!")
    idx = new_s.index("'")
    print(repr(new_s[max(0,idx-20):idx+20]))
else:
    print("No single quotes — safe to embed in JS string")

# ── Find and replace in index.html ───────────────────────────────────────────
with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# Find the start and end of the current L0E2 s field
START_MARKER = b"tag:'Examples',p:'Fractions in real life:',s:'"
END_MARKER   = b"',a:'Fractions are everywhere!"

start = content.find(START_MARKER)
if start == -1:
    print("START MARKER not found!")
else:
    s_start = start + len(START_MARKER)  # position right after s:'
    end = content.find(END_MARKER, s_start)
    if end == -1:
        print("END MARKER not found!")
    else:
        old_s = content[s_start:end]
        print(f"Replacing {len(old_s)} bytes of old s field")
        new_s_b = new_s.encode('utf-8')
        content = content[:s_start] + new_s_b + content[end:]
        with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
            f.write(content)
        print("Saved.")
