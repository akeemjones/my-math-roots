import sys

FILE = r'E:\Cameron Jones\my-math-roots\index.html'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# ── Step 1: Scale all existing pictograph SVGs 210×108 → 315×162 ──────────
OLD_SZ = 'width="210" height="108" viewBox="0 0 210 108"'
NEW_SZ = 'width="315" height="162" viewBox="0 0 210 108"'
n = content.count(OLD_SZ)
print(f'Scaling {n} pictograph SVGs from 210x108 to 315x162')
content = content.replace(OLD_SZ, NEW_SZ)

# ── SVG generators ────────────────────────────────────────────────────────

def pg_full(key_lbl, rows):
    """4-row full pictograph, 315×162, viewBox 0 0 210 108."""
    p = [
        f'<svg width="315" height="162" viewBox="0 0 210 108" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">',
        f'<rect x="4" y="2" width="202" height="14" fill="#e8f4ff" rx="3"/>',
        f'<text x="8" y="12" font-size="7" fill="#333" font-weight="bold">Key: {key_lbl}</text>',
        f'<line x1="4" y1="16" x2="206" y2="16" stroke="#ddd" stroke-width="1"/>',
    ]
    ys = [(31, 33, 37), (49, 51, 55), (67, 69, 73), (85, 87, None)]
    for i, (lbl, sym) in enumerate(rows):
        ty, sy, ly = ys[i]
        p.append(f'<text x="6" y="{ty}" font-size="8" fill="#333" font-weight="bold">{lbl}</text>')
        p.append(f'<text x="55" y="{sy}" font-size="14">{sym}</text>')
        if ly:
            p.append(f'<line x1="4" y1="{ly}" x2="206" y2="{ly}" stroke="#eee" stroke-width="1"/>')
    p.append('<line x1="4" y1="104" x2="206" y2="104" stroke="#ddd" stroke-width="1"/>')
    p.append('</svg>')
    return ''.join(p)

def mini1(key_lbl, lbl, sym):
    """1-row mini pictograph."""
    return (
        f'<svg width="280" height="72" viewBox="0 0 280 72" style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">'
        f'<rect x="4" y="2" width="272" height="15" fill="#e8f4ff" rx="3"/>'
        f'<text x="8" y="13" font-size="8" fill="#333" font-weight="bold">Key: {key_lbl}</text>'
        f'<line x1="4" y1="17" x2="276" y2="17" stroke="#ddd" stroke-width="1"/>'
        f'<text x="8" y="43" font-size="8" fill="#333" font-weight="bold">{lbl}</text>'
        f'<text x="65" y="47" font-size="16">{sym}</text>'
        f'<line x1="4" y1="62" x2="276" y2="62" stroke="#ddd" stroke-width="1"/>'
        f'</svg>'
    )

def mini2(key_lbl, l1, s1, l2, s2):
    """2-row mini pictograph."""
    return (
        f'<svg width="280" height="96" viewBox="0 0 280 96" style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">'
        f'<rect x="4" y="2" width="272" height="15" fill="#e8f4ff" rx="3"/>'
        f'<text x="8" y="13" font-size="8" fill="#333" font-weight="bold">Key: {key_lbl}</text>'
        f'<line x1="4" y1="17" x2="276" y2="17" stroke="#ddd" stroke-width="1"/>'
        f'<text x="8" y="38" font-size="8" fill="#333" font-weight="bold">{l1}</text>'
        f'<text x="65" y="42" font-size="16">{s1}</text>'
        f'<line x1="4" y1="56" x2="276" y2="56" stroke="#eee" stroke-width="1"/>'
        f'<text x="8" y="76" font-size="8" fill="#333" font-weight="bold">{l2}</text>'
        f'<text x="65" y="80" font-size="16">{s2}</text>'
        f'<line x1="4" y1="88" x2="276" y2="88" stroke="#ddd" stroke-width="1"/>'
        f'</svg>'
    )

def key_box(key_lbl):
    """Small key illustration for conceptual questions."""
    return (
        f'<svg width="220" height="52" viewBox="0 0 220 52" style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">'
        f'<rect x="4" y="6" width="212" height="18" fill="#e8f4ff" rx="4"/>'
        f'<text x="8" y="19" font-size="9" fill="#333" font-weight="bold">Key: {key_lbl}</text>'
        f'<text x="8" y="40" font-size="7" fill="#666">Always check the key before counting!</text>'
        f'</svg>'
    )

# Pre-build reusable SVGs
PG1 = pg_full('\U0001f4d6 = 2 books', [('Emma', '\U0001f4d6\U0001f4d6\U0001f4d6'), ('Liam', '\U0001f4d6\U0001f4d6'), ('Sofia', '\U0001f4d6\U0001f4d6\U0001f4d6\U0001f4d6'), ('Noah', '\U0001f4d6')])
KEY_ILLUS = key_box('\U0001f4d6 = 2 books')

# Example 2: key comparison SVG
EX2_SVG = (
    '<svg width="315" height="114" viewBox="0 0 315 114" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">'
    '<rect x="4" y="4" width="307" height="16" fill="#e8f4ff" rx="3"/>'
    '<text x="8" y="17" font-size="8" fill="#333" font-weight="bold">Same 3 pictures — different KEY = different totals:</text>'
    '<text x="12" y="42" font-size="13">\U0001f4d6\U0001f4d6\U0001f4d6</text>'
    '<text x="60" y="42" font-size="9" fill="#555">Key = 1 \u2192 3 \u00d7 1 = 3 books</text>'
    '<text x="12" y="66" font-size="13">\U0001f4d6\U0001f4d6\U0001f4d6</text>'
    '<text x="60" y="66" font-size="9" fill="#555">Key = 2 \u2192 3 \u00d7 2 = 6 books</text>'
    '<text x="12" y="90" font-size="13">\U0001f4d6\U0001f4d6\U0001f4d6</text>'
    '<text x="60" y="90" font-size="9" fill="#555">Key = 5 \u2192 3 \u00d7 5 = 15 books!</text>'
    '<rect x="4" y="96" width="307" height="14" fill="#fff3cd" rx="3"/>'
    '<text x="8" y="107" font-size="8" fill="#856404" font-weight="bold">Always check the KEY first!</text>'
    '</svg>'
)

EX3_SVG = mini2('\U0001f4d6 = 2 books', 'Emma', '\U0001f4d6\U0001f4d6\U0001f4d6', 'Liam', '\U0001f4d6\U0001f4d6')

# ── Step 2: Replace examples ──────────────────────────────────────────────

OLD_EX = (
    "   examples:[\n"
    "    {c:'#229954',tag:'Books Read (\U0001f4d6 = 2 books)',p:'Reading a pictograph:',s:'Emma: \U0001f4d6\U0001f4d6\U0001f4d6 = 3 pictures \u00d7 2 = 6 books\\nLiam: \U0001f4d6\U0001f4d6 = 2 pictures \u00d7 2 = 4 books\\nSofia: \U0001f4d6\U0001f4d6\U0001f4d6\U0001f4d6 = 4 pictures \u00d7 2 = 8 books\\nNoah: \U0001f4d6 = 1 picture \u00d7 2 = 2 books',a:'Sofia read the most (8 books)! \u2705'},\n"
    "    {c:'#229954',tag:'The Key',p:'Why does the KEY matter?',s:'Same picture, different keys:\\nIf \U0001f4d6 = 1 book: 3 pictures = 3 books\\nIf \U0001f4d6 = 2 books: 3 pictures = 6 books\\nIf \U0001f4d6 = 5 books: 3 pictures = 15 books!',a:'ALWAYS check the key first! \u2705'},\n"
    "    {c:'#229954',tag:'Comparing',p:'Emma: 3 pics, Liam: 2 pics. Key: \U0001f4d6=2',s:'Emma: 3\u00d72=6 books\\nLiam: 2\u00d72=4 books\\n6-4=2 more books for Emma',a:'Emma read 2 more books \u2705'},\n"
    "   ],\n"
)

NEW_EX = (
    "   examples:[\n"
    f"    {{c:'#229954',tag:'Books Read (\U0001f4d6 = 2 books)',p:'Read the pictograph \u2014 count pictures \u00d7 key:',s:'{PG1}',a:'Multiply pictures \u00d7 2 to get books. Sofia: 4 \u00d7 2 = 8 \u2014 most! \u2705'}},\n"
    f"    {{c:'#229954',tag:'The Key',p:'Why does the KEY matter?',s:'{EX2_SVG}',a:'Same pictures, very different totals \u2014 the key changes everything! \u2705'}},\n"
    f"    {{c:'#229954',tag:'Comparing',p:'Emma: 3 pics, Liam: 2 pics. Key = 2:',s:'{EX3_SVG}',a:'Emma: 3 \u00d7 2 = 6, Liam: 2 \u00d7 2 = 4. 6 \u2212 4 = 2 more books \u2705'}},\n"
    "   ],\n"
)

if OLD_EX not in content:
    print('ERROR: OLD_EX not found!')
    lines = content.split('\n')
    for i, l in enumerate(lines[2853:2860], 2854):
        print(f'{i}: {repr(l)}')
    sys.exit(1)
content = content.replace(OLD_EX, NEW_EX, 1)
print('Replaced examples')

# ── Step 3: Replace practice ──────────────────────────────────────────────

PR1 = mini1('\U0001f4d6 = 2 books', '3 pictures', '\U0001f4d6\U0001f4d6\U0001f4d6')
PR2 = mini1('\u2b50 = 5', 'Liam', '\u2b50\u2b50\u2b50\u2b50')
PR3 = mini2('\U0001f4d6 = 2 books', 'Emma', '\U0001f4d6\U0001f4d6\U0001f4d6\U0001f4d6', 'Noah', '\U0001f4d6\U0001f4d6')

OLD_PR = (
    "   practice:[\n"
    "    {q:'Key = 2 books per picture. 3 pictures = ?', a:'6 books', h:'3 times 2 = 6 books!', e:'\U0001f4d6'},\n"
    "    {q:'Key = 5. Liam has 4 pictures. How many?', a:'20', h:'4 times 5 = 20!', e:'\U0001f5bc\ufe0f'},\n"
    "    {q:'Key=2. Emma:4 pics, Noah:2 pics. More books for Emma?', a:'4 more books', h:'Emma: 4x2=8, Noah: 2x2=4. 8-4=4 more!', e:'\U0001f4da'},\n"
    "  ],\n"
)

NEW_PR = (
    "   practice:[\n"
    f"    {{q:'How many books total? {PR1}', a:'6 books', h:'3 pictures \u00d7 2 = 6 books!', e:'\U0001f4d6'}},\n"
    f"    {{q:'How many? {PR2}', a:'20', h:'4 pictures \u00d7 5 = 20!', e:'\U0001f5bc\ufe0f'}},\n"
    f"    {{q:'How many more books does Emma have? {PR3}', a:'4 more books', h:'Emma: 4\u00d72=8, Noah: 2\u00d72=4. 8\u22124=4 more!', e:'\U0001f4da'}},\n"
    "  ],\n"
)

if OLD_PR not in content:
    print('ERROR: OLD_PR not found!')
    lines = content.split('\n')
    for i, l in enumerate(lines[2858:2865], 2859):
        print(f'{i}: {repr(l)}')
    sys.exit(1)
content = content.replace(OLD_PR, NEW_PR, 1)
print('Replaced practice')

# ── Step 4: Replace text-only qBank questions ─────────────────────────────

def swap(old, new):
    if old not in content:
        print(f'MISSING: {old[:60]}...')
        return content
    return content.replace(old, new, 1)

# Q16 — KEY concept
KB = key_box('\U0001f4d6 = 2 books')
content = swap(
    "q('What does the KEY in a pictograph tell you?',['The title', 'What each picture equals', 'The number axis', 'The color'],1,'The key tells you how much each picture symbol is worth.'),",
    f"q('What does the KEY in a pictograph tell you? {KB}',['The title', 'What each picture equals', 'The number axis', 'The color'],1,'The key tells you how much each picture symbol is worth.'),"
)

# Q17 — first step
content = swap(
    "q('What is the first step when reading a pictograph?',['Count all pictures', 'Check the KEY', 'Read the title', 'Subtract bars'],1,'Always check the key so you know what each picture is worth.'),",
    f"q('What is the first step when reading a pictograph? {KB}',['Count all pictures', 'Check the KEY', 'Read the title', 'Subtract bars'],1,'Always check the key so you know what each picture is worth.'),"
)

# Q18 — Liam 2 pics key=5
M18 = mini1('\u2b50 = 5', 'Liam', '\u2b50\u2b50')
content = swap(
    "q('In a pictograph where 1 picture = 5, Liam has 2 pictures. How many?',['5', '8', '10', '12'],2,'2 pictures \u00d7 5 = 10.'),",
    f"q('In a pictograph where 1 picture = 5, Liam has 2 pictures. How many? {M18}',['5', '8', '10', '12'],2,'2 pictures \u00d7 5 = 10.'),"
)

# Q19 — 4 pics key=3
M19 = mini1('\u2b50 = 3', 'Row', '\u2b50\u2b50\u2b50\u2b50')
content = swap(
    "q('In a pictograph, 1 picture = 3. There are 4 pictures. What is the total?',['9', '10', '11', '12'],3,'4 \u00d7 3 = 12.'),",
    f"q('In a pictograph, 1 picture = 3. There are 4 pictures. What is the total? {M19}',['9', '10', '11', '12'],3,'4 \u00d7 3 = 12.'),"
)

# Q20 — 5 pics key=10
M20 = mini1('\u2b50 = 10', 'Row', '\u2b50\u2b50\u2b50\u2b50\u2b50')
content = swap(
    "q('In a pictograph, 1 picture = 10. There are 5 pictures. What is the total?',['40', '50', '60', '70'],1,'5 \u00d7 10 = 50.'),",
    f"q('In a pictograph, 1 picture = 10. There are 5 pictures. What is the total? {M20}',['40', '50', '60', '70'],1,'5 \u00d7 10 = 50.'),"
)

# Q21 — 6 pics key=2
M21 = mini1('\u2b50 = 2', 'Row', '\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50')
content = swap(
    "q('In a pictograph, 1 picture = 2. There are 6 pictures. Total?',['8', '10', '12', '14'],2,'6 \u00d7 2 = 12.'),",
    f"q('In a pictograph, 1 picture = 2. There are 6 pictures. Total? {M21}',['8', '10', '12', '14'],2,'6 \u00d7 2 = 12.'),"
)

# Q22 — reverse: show 8, key=2 → 4 pics
M22 = mini1('\U0001f4d6 = 2', 'Need 8', '\U0001f4d6\U0001f4d6\U0001f4d6\U0001f4d6')
content = swap(
    "q('In a pictograph where 1 picture = 2, how many pictures to show 8?',['2', '3', '4', '5'],2,'8 \u00f7 2 = 4 pictures.'),",
    f"q('In a pictograph where 1 picture = 2, how many pictures to show 8? {M22}',['2', '3', '4', '5'],2,'8 \u00f7 2 = 4 pictures.'),"
)

# Q23 — reverse: show 24, key=4 → 6 pics
M23 = mini1('\u2b50 = 4', 'Need 24', '\u2b50\u2b50\u2b50\u2b50\u2b50\u2b50')
content = swap(
    "q('In a pictograph where 1 picture = 4, how many pictures to show 24?',['4', '5', '6', '7'],2,'24 \u00f7 4 = 6 pictures.'),",
    f"q('In a pictograph where 1 picture = 4, how many pictures to show 24? {M23}',['4', '5', '6', '7'],2,'24 \u00f7 4 = 6 pictures.'),"
)

# Q24 — April 6 pics, key=5 rain
M24 = mini1('\U0001f327\ufe0f = 5 in', 'April', '\U0001f327\ufe0f\U0001f327\ufe0f\U0001f327\ufe0f\U0001f327\ufe0f\U0001f327\ufe0f\U0001f327\ufe0f')
content = swap(
    "q('A pictograph shows April: 6 pictures. Key: 1 picture = 5 inches of rain. How much?',['20', '25', '30', '35'],2,'6 \u00d7 5 = 30 inches.'),",
    f"q('A pictograph shows April: 6 pictures. Key: 1 picture = 5 inches of rain. How much? {M24}',['20', '25', '30', '35'],2,'6 \u00d7 5 = 30 inches.'),"
)

# Q25 — Sunday 4, Monday 2, key=3
M25 = mini2('\u2b50 = 3', 'Sunday', '\u2b50\u2b50\u2b50\u2b50', 'Monday', '\u2b50\u2b50')
content = swap(
    "q('A pictograph shows Sunday: 4 pictures, Monday: 2 pictures. Key = 3. Total?',['12', '16', '18', '20'],2,'(4+2) \u00d7 3 = 18.'),",
    f"q('A pictograph shows Sunday: 4 pictures, Monday: 2 pictures. Key = 3. Total? {M25}',['12', '16', '18', '20'],2,'(4+2) \u00d7 3 = 18.'),"
)

# Q26 — Apples 5, Oranges 3, key=2
M26 = mini2('\U0001f34e = 2', 'Apples', '\U0001f34e\U0001f34e\U0001f34e\U0001f34e\U0001f34e', 'Oranges', '\U0001f34e\U0001f34e\U0001f34e')
content = swap(
    "q('A pictograph shows Apples: 5, Oranges: 3. Key = 2. How many more apples?',['2', '3', '4', '5'],2,'Apples: 10, Oranges: 6. 10 \u2212 6 = 4 more.'),",
    f"q('A pictograph shows Apples: 5, Oranges: 3. Key = 2. How many more apples? {M26}',['2', '3', '4', '5'],2,'Apples: 10, Oranges: 6. 10 \u2212 6 = 4 more.'),"
)

# Q27 — conceptual: why pictures
content = swap(
    "q('Why do pictographs use pictures instead of numbers?',['Looks prettier', 'Each picture represents data quickly', 'Required by law', 'Easier to write'],1,'Pictures make data easy to see and compare at a glance.'),",
    f"q('Why do pictographs use pictures instead of numbers? {KB}',['Looks prettier', 'Each picture represents data quickly', 'Required by law', 'Easier to write'],1,'Pictures make data easy to see and compare at a glance.'),"
)

# Q28 — 1pic=4, 3pics
M28 = mini1('\u2b50 = 4', 'Row', '\u2b50\u2b50\u2b50')
content = swap(
    "q('In a pictograph, the key shows 1 picture = 4. A row has 3 pictures. Value?',['8', '10', '12', '16'],2,'3 \u00d7 4 = 12.'),",
    f"q('In a pictograph, the key shows 1 picture = 4. A row has 3 pictures. Value? {M28}',['8', '10', '12', '16'],2,'3 \u00d7 4 = 12.'),"
)

# Q29 — Class A:4, Class B:3, key=2
M29 = mini2('\u2b50 = 2', 'Class A', '\u2b50\u2b50\u2b50\u2b50', 'Class B', '\u2b50\u2b50\u2b50')
content = swap(
    "q('A pictograph shows Class A: 4 pictures, Class B: 3 pictures. Key = 2. Total?',['12', '14', '16', '18'],1,'(4+3) \u00d7 2 = 14.'),",
    f"q('A pictograph shows Class A: 4 pictures, Class B: 3 pictures. Key = 2. Total? {M29}',['12', '14', '16', '18'],1,'(4+3) \u00d7 2 = 14.'),"
)

# Q30 — Red:3, Blue:5, key=2
M30 = mini2('\u2b50 = 2', 'Red', '\u2b50\u2b50\u2b50', 'Blue', '\u2b50\u2b50\u2b50\u2b50\u2b50')
content = swap(
    "q('A pictograph shows Red: 3 pictures, Blue: 5 pictures. Key = 2. More for Blue?',['2', '3', '4', '5'],2,'Blue: 10, Red: 6. 10 \u2212 6 = 4 more.'),",
    f"q('A pictograph shows Red: 3 pictures, Blue: 5 pictures. Key = 2. More for Blue? {M30}',['2', '3', '4', '5'],2,'Blue: 10, Red: 6. 10 \u2212 6 = 4 more.'),"
)

# ── Step 5: Replace text-only quiz questions ──────────────────────────────

# Quiz Q5 — KEY concept (slightly different explanation from qBank Q16)
content = swap(
    "q('What does the KEY in a pictograph tell you?',['The title', 'What each picture equals', 'The number axis', 'The color'],1,'The key tells you what each picture is worth.'),",
    f"q('What does the KEY in a pictograph tell you? {KB}',['The title', 'What each picture equals', 'The number axis', 'The color'],1,'The key tells you what each picture is worth.'),"
)

# Quiz Q6 — 4 pics key=5
MQZ6 = mini1('\u2b50 = 5', 'Row', '\u2b50\u2b50\u2b50\u2b50')
content = swap(
    "q('In a pictograph, 1 picture = 5. There are 4 pictures. Total?',['15', '20', '25', '30'],1,'4 \u00d7 5 = 20.'),",
    f"q('In a pictograph, 1 picture = 5. There are 4 pictures. Total? {MQZ6}',['15', '20', '25', '30'],1,'4 \u00d7 5 = 20.'),"
)

# ── Save ──────────────────────────────────────────────────────────────────
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done — u6l3 pictograph SVGs updated!')
