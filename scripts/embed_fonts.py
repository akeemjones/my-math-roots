#!/usr/bin/env python3
"""
Fetch Boogaloo + Nunito (700/800/900) from Google Fonts,
base64-encode the woff2 files, and inject them as inline @font-face
rules into index.html — replacing the external Google Fonts <link>.
"""

import re, base64, urllib.request

# ── Fetch helper ─────────────────────────────────────────────────────────────
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    )
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def fetch_text(url):
    return fetch(url).decode('utf-8')

# ── Step 1: Ask Google Fonts for the CSS (woff2 format) ──────────────────────
GF_URL = (
    'https://fonts.googleapis.com/css2'
    '?family=Boogaloo&family=Nunito:wght@700;800;900&display=swap'
)
print('Fetching Google Fonts CSS...')
css = fetch_text(GF_URL)

# ── Step 2: Parse each @font-face block and download the woff2 ───────────────
# Pattern matches the full @font-face block
block_re  = re.compile(r'@font-face\s*\{([^}]+)\}', re.DOTALL)
url_re    = re.compile(r"url\(([^)]+)\)\s*format\('woff2'\)")
family_re = re.compile(r"font-family:\s*'([^']+)'")
weight_re = re.compile(r'font-weight:\s*(\S+)')
style_re  = re.compile(r'font-style:\s*(\S+)')
unicode_re= re.compile(r'unicode-range:\s*([^;]+)')

blocks = []
for m in block_re.finditer(css):
    body    = m.group(1)
    url_m   = url_re.search(body)
    fam_m   = family_re.search(body)
    wgt_m   = weight_re.search(body)
    sty_m   = style_re.search(body)
    uni_m   = unicode_re.search(body)
    if not (url_m and fam_m):
        continue
    woff2_url = url_m.group(1).strip("'\" ")
    family    = fam_m.group(1)
    weight    = wgt_m.group(1) if wgt_m else '400'
    style     = sty_m.group(1).rstrip(';') if sty_m else 'normal'
    unicode_r = uni_m.group(1).strip() if uni_m else None

    # Only embed the Latin subset — skip Cyrillic, Vietnamese, Greek etc.
    # Latin blocks contain U+0000 or have no unicode-range (single-subset fonts)
    if unicode_r and 'U+0000' not in unicode_r:
        continue

    blocks.append(dict(
        family=family, weight=weight, style=style,
        url=woff2_url, unicode=unicode_r
    ))

print(f'Found {len(blocks)} @font-face blocks to embed.')

# ── Step 3: Download each woff2 and base64-encode ────────────────────────────
for b in blocks:
    print(f"  Downloading {b['family']} {b['weight']} {b['style']} ...")
    data = fetch(b['url'])
    b['b64'] = base64.b64encode(data).decode('ascii')
    print(f"    {len(data):,} bytes -> {len(b['b64']):,} chars base64")

# ── Step 4: Build the replacement <style> block ──────────────────────────────
lines = ['<style id="fonts-inline">']
for b in blocks:
    lines.append('@font-face {')
    lines.append(f"  font-family: '{b['family']}';")
    lines.append(f"  font-style: {b['style']};")
    lines.append(f"  font-weight: {b['weight']};")
    lines.append(  '  font-display: swap;')
    lines.append(f"  src: url('data:font/woff2;base64,{b['b64']}') format('woff2');")
    if b['unicode']:
        lines.append(f"  unicode-range: {b['unicode']};")
    lines.append('}')
lines.append('</style>')
font_style_block = '\n'.join(lines)

total_kb = sum(len(b['b64']) * 3 / 4 / 1024 for b in blocks)
print(f'\nTotal font data: {total_kb:.1f} KB across {len(blocks)} faces')

# ── Step 5: Patch index.html ──────────────────────────────────────────────────
SRC = r'E:\Cameron Jones\my-math-roots\index.html'
with open(SRC, encoding='utf-8') as f:
    html = f.read()

# Remove the Google Fonts <link> tag
gf_link_re = re.compile(
    r'<link[^>]+fonts\.googleapis\.com[^>]*>',
    re.IGNORECASE
)
if gf_link_re.search(html):
    html = gf_link_re.sub('', html, count=1)
    print('Removed Google Fonts <link> tag.')
else:
    print('WARNING: Google Fonts <link> not found — check manually.')

# Remove any existing inline fonts style block (idempotent)
html = re.sub(r'<style id="fonts-inline">.*?</style>', '',
              html, flags=re.DOTALL)

# Insert inline font style immediately before </head>
html = html.replace('</head>', font_style_block + '\n</head>', 1)
print('Injected inline @font-face block before </head>.')

with open(SRC, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nDone! index.html updated with self-hosted fonts.')
print('Fonts will now load from the file itself — no Google Fonts required.')
