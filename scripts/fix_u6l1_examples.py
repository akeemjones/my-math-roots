with open('E:/Cameron Jones/my-math-roots/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

SK = 'stroke="#333" stroke-width="2.5" stroke-linecap="round"'

def tally_at(n, tx, yt, yb):
    s = ''
    full, rem = n // 5, n % 5
    for g in range(full):
        sx = tx + g * 40
        for k in range(4):
            s += f'<line x1="{sx+k*8}" y1="{yt}" x2="{sx+k*8}" y2="{yb}" {SK}/>'
        s += f'<line x1="{sx-2}" y1="{yb}" x2="{sx+24}" y2="{yt}" {SK}/>'
    for j in range(rem):
        x = tx + full * 40 + j * 8
        s += f'<line x1="{x}" y1="{yt}" x2="{x}" y2="{yb}" {SK}/>'
    return s

# ── EXAMPLE 1: 2-column grid showing numbers 1–10 with tally marks ──────────
parts = ['<svg width="560" height="328" viewBox="0 0 280 164" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">']
parts.append('<rect x="4" y="2" width="134" height="14" fill="#e8f4ff" rx="3"/>')
parts.append('<rect x="142" y="2" width="134" height="14" fill="#e8f4ff" rx="3"/>')
parts.append('<text x="12" y="12" font-size="7" fill="#333" font-weight="bold">Number</text>')
parts.append('<text x="38" y="12" font-size="7" fill="#333" font-weight="bold">Tally Marks</text>')
parts.append('<text x="150" y="12" font-size="7" fill="#333" font-weight="bold">Number</text>')
parts.append('<text x="176" y="12" font-size="7" fill="#333" font-weight="bold">Tally Marks</text>')
parts.append('<line x1="140" y1="2" x2="140" y2="164" stroke="#ccc" stroke-width="0.8"/>')

for i in range(5):
    n1, n2 = i + 1, i + 6
    y0 = 14 + i * 30
    yc = y0 + 15
    yt, yb = yc - 12, yc + 12
    bg = '#f8faff' if i % 2 == 0 else '#ffffff'
    parts.append(f'<rect x="4" y="{y0}" width="134" height="30" fill="{bg}"/>')
    parts.append(f'<rect x="142" y="{y0}" width="134" height="30" fill="{bg}"/>')
    parts.append(f'<line x1="4" y1="{y0}" x2="276" y2="{y0}" stroke="#eee" stroke-width="0.5"/>')
    # Left: n1
    parts.append(f'<text x="20" y="{yc+4}" font-size="12" fill="#333" font-weight="bold" text-anchor="middle">{n1}</text>')
    parts.append(tally_at(n1, 38, yt, yb))
    # Right: n2
    parts.append(f'<text x="158" y="{yc+4}" font-size="12" fill="#333" font-weight="bold" text-anchor="middle">{n2}</text>')
    parts.append(tally_at(n2, 176, yt, yb))

parts.append('</svg>')
EX1_SVG = ''.join(parts)

# ── EXAMPLE 3: Full seasons tally chart with marks ───────────────────────────
seasons = [('Spring', 7), ('Summer', 9), ('Fall', 5), ('Winter', 3)]
n_rows = len(seasons)
height = 16 + n_rows * 36

s3 = [f'<svg width="560" height="{height*2}" viewBox="0 0 280 {height}" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">']
s3.append(f'<rect x="4" y="2" width="272" height="14" fill="#e8f4ff" rx="3"/>')
s3.append('<text x="8" y="12" font-size="7" fill="#333" font-weight="bold">Season</text>')
s3.append('<text x="70" y="12" font-size="7" fill="#333" font-weight="bold">Tally Marks</text>')
s3.append('<text x="272" y="12" text-anchor="end" font-size="7" fill="#333" font-weight="bold">Total</text>')

for i, (lbl, cnt) in enumerate(seasons):
    y0 = 16 + i * 36
    yc = y0 + 18
    yt, yb = yc - 12, yc + 12
    bg = '#f8faff' if i % 2 == 0 else '#ffffff'
    s3.append(f'<rect x="4" y="{y0}" width="272" height="36" fill="{bg}"/>')
    s3.append(f'<line x1="4" y1="{y0}" x2="276" y2="{y0}" stroke="#ddd" stroke-width="0.5"/>')
    s3.append(f'<text x="8" y="{yc+4}" font-size="9" fill="#333" font-weight="bold">{lbl}</text>')
    s3.append(tally_at(cnt, 70, yt, yb))
    s3.append(f'<text x="272" y="{yc+4}" text-anchor="end" font-size="9" fill="#229954" font-weight="bold">= {cnt}</text>')

s3.append('</svg>')
EX3_SVG = ''.join(s3)

# ── Replacements ─────────────────────────────────────────────────────────────
# Example 1: match from start of s field to end of its SVG
OLD1 = "s:'1 = <svg width=\"17\" height=\"30\" viewBox=\"0 0 17 30\""
NEW1 = f"s:'{EX1_SVG[:-6]}"  # will be closed after we find end

# Better approach: find and replace the full s field
import re

# Replace Example 1 s field
old1_start = "s:'1 = <svg"
old1_end = "</svg>',a:'The 5th mark always crosses"
new1 = f"s:'{EX1_SVG}',a:'The 5th mark always crosses"

# Replace Example 3 s field
old3 = "s:'Spring: 7 &nbsp; Summer: 9 &nbsp; Fall: 5 &nbsp; Winter: 3\\nFind the biggest number!'"
new3 = f"s:'{EX3_SVG}'"

applied = 0
for old, new in [(old3, new3)]:
    if old in content:
        content = content.replace(old, new, 1)
        applied += 1
        print(f'Applied: {old[:50]}')
    else:
        print(f'MISSING: {repr(old[:60])}')

# For Example 1, find the full s field using the start and end markers
idx1 = content.find(old1_start)
if idx1 != -1:
    # Find the closing ',a:' after the s field
    end_marker = "',a:'The 5th mark always crosses"
    idx1_end = content.find(end_marker, idx1)
    if idx1_end != -1:
        content = content[:idx1] + f"s:'{EX1_SVG}" + content[idx1_end:]
        applied += 1
        print('Applied: Example 1 s field')
    else:
        print('MISSING end marker for Example 1')
else:
    print('MISSING start of Example 1')

with open('E:/Cameron Jones/my-math-roots/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Total applied: {applied}')
