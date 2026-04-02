with open('E:/Cameron Jones/my-math-roots/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def lp(title, axis, vals, cnts, w=None, lmap=None):
    n = len(vals)
    mx = max(cnts) if cnts else 0
    top_y = (76 - 13*(mx-1)) if mx > 0 else 76
    h = max(108, 98 - top_y + 10) if mx > 0 else 108
    if w is None:
        w = 200 if n <= 4 else 240
    if n == 4 and w == 200: xs = [20, 73, 126, 179]
    elif n == 5 and w == 240: xs = [20, 70, 120, 170, 220]
    elif n == 3: xs = [35, 100, 165]
    else: xs = [round(20 + i*(w-40)/(n-1)) for i in range(n)]
    out = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">']
    out.append(f'<text x="{w//2}" y="11" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">{title}</text>')
    out.append(f'<line x1="12" y1="86" x2="{w-8}" y2="86" stroke="#333" stroke-width="2"/>')
    for i, (v, c) in enumerate(zip(vals, cnts)):
        x = xs[i]
        out.append(f'<line x1="{x}" y1="83" x2="{x}" y2="89" stroke="#555" stroke-width="1.5"/>')
        lbl = lmap.get(v, str(v)) if lmap else str(v)
        fs = '7' if len(str(lbl)) > 3 else '9'
        out.append(f'<text x="{x}" y="99" text-anchor="middle" font-size="{fs}" fill="#333">{lbl}</text>')
        for j in range(c):
            y = 76 - j*13
            out.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-size="12" fill="#229954" font-weight="bold">×</text>')
    out.append(f'<text x="{w//2}" y="{h-2}" text-anchor="middle" font-size="7" fill="#888">{axis}</text>')
    out.append('</svg>')
    return ''.join(out)

PETS  = lp('Pets in Class', 'Number of Pets', [1,2,3,4], [2,4,3,1])
READ  = lp('Reading Hours', 'Hours of Reading', [1,2,3,4,5], [1,2,4,2,1])

P1 = lp('Favorite Number', 'Number', [1,2,3], [2,3,1])
P2 = lp('Test Scores', 'Score', [4,5,6], [2,4,1])
P3 = lp('Daily Steps', 'Value', [2,3,4], [1,3,2])

Q12 = lp('Example Line Plot', 'Value', [1,2,3,4], [1,2,3,1])
Q13 = lp('Number Line Example', 'Numbers (bottom axis)', [1,2,3,4], [2,1,3,2])
Q14 = lp('Tallest Stack = Most Common', 'Value', [1,2,3,4], [1,2,5,1])
Q15 = lp('Line Plot', 'Value', [2,3,4], [1,3,2])
Q16 = lp('Line Plot', 'Value', [5,6,7], [2,1,3])
Q17 = lp('Line Plot', 'Value', [1,2,3,4], [1,2,4,1])
Q18 = lp('Reading Hours', 'Hours', [1,2,3,4,5], [1,2,4,2,1])
Q19 = lp('Days', 'Day', [1,2,3], [3,5,2], lmap={1:'Mon',2:'Tue',3:'Wed'})
Q20 = lp('Line Plot', 'Value', [1,2,3,4], [2,4,3,1])
Q21 = lp('Test Scores', 'Score', [8,9,10], [2,3,1])
Q22 = lp('Line Plot', 'Value', [3,4,5,6], [2,3,0,1])
Q23 = lp('Fruit Survey', 'Fruit', [1,2,3], [4,6,2], lmap={1:'Appl',2:'Ban',3:'Grp'})
Q24 = lp('Line Plot', 'Value', [1,2,3], [1,3,2])
Q25 = lp('Line Plot', 'Value', [1,2,3,4], [1,1,2,2])
Q26 = lp('Test Scores', 'Score', [88,90,92], [1,3,2])
Q27 = lp('Homework Time', 'Hours', [1,2,3,4], [2,3,3,1])
Q28 = lp('Line Plot', 'Value', [5,6,7,8], [1,2,3,1])
Q29 = lp('Line Plot', 'Value', [2,3,4], [2,3,0])

reps = [
    # Examples s field
    ("s:'Number line: shows the values (like 1, 2, 3, 4)\\n\u00d7 marks: each one = 1 data point\\nStack of 4 \u00d7s above 3 means FOUR students chose 3\\nAlways read the title to know what is being shown'",
     f"s:'{PETS}'"),
    ("s:'1 pet: \u00d7\u00d7 (2 students)\\n2 pets: \u00d7\u00d7\u00d7\u00d7 (4 students) \u2190 MOST\\n3 pets: \u00d7\u00d7\u00d7 (3 students)\\n4 pets: \u00d7 (1 student) \u2190 LEAST\\nTotal: 2+4+3+1 = 10 students'",
     f"s:'{PETS}'"),
    ("s:'Add all the \u00d7 marks together:\\n2 + 4 + 3 + 1 = 10\\nOr count every \u00d7 on the whole plot'",
     f"s:'{PETS}'"),
    # Practice q field
    ("q:'A line plot shows 1:\u00d7\u00d7, 2:\u00d7\u00d7\u00d7, 3:\u00d7. Which value has the most \u00d7s?'",
     f"q:'Which value has the most \u00d7s? {P1}'"),
    ("q:'A line plot shows 4:\u00d7\u00d7, 5:\u00d7\u00d7\u00d7\u00d7, 6:\u00d7. What is the total count?'",
     f"q:'What is the total count? {P2}'"),
    ("q:'Line plot: 2:\u00d7, 3:\u00d7\u00d7\u00d7, 4:\u00d7\u00d7. Which value is least common?'",
     f"q:'Which value is least common? {P3}'"),
    # qBank Q12-Q29 (append SVG inside first arg of q())
    ("q('What does each \u00d7 on a line plot represent?',",
     f"q('What does each \u00d7 on a line plot represent? {Q12}',"),
    ("q('In a line plot, where is the number line?',",
     f"q('In a line plot, where is the number line? {Q13}',"),
    ("q('What does the tallest stack of \u00d7 marks in a line plot tell you?',",
     f"q('What does the tallest stack of \u00d7 marks in a line plot tell you? {Q14}',"),
    ("q('A line plot shows 2:\u00d7, 3:\u00d7\u00d7\u00d7, 4:\u00d7\u00d7. Total data points?',",
     f"q('A line plot shows 2:\u00d7, 3:\u00d7\u00d7\u00d7, 4:\u00d7\u00d7. Total data points? {Q15}',"),
    ("q('A line plot shows 5:\u00d7\u00d7, 6:\u00d7, 7:\u00d7\u00d7\u00d7. Which value has the most marks?',",
     f"q('A line plot shows 5:\u00d7\u00d7, 6:\u00d7, 7:\u00d7\u00d7\u00d7. Which value has the most marks? {Q16}',"),
    ("q('A line plot shows 1:\u00d7, 2:\u00d7\u00d7, 3:\u00d7\u00d7\u00d7\u00d7, 4:\u00d7. How many more at 3 than 1?',",
     f"q('A line plot shows 1:\u00d7, 2:\u00d7\u00d7, 3:\u00d7\u00d7\u00d7\u00d7, 4:\u00d7. How many more at 3 than 1? {Q17}',"),
    ("q('What is the first step when reading a line plot?',",
     f"q('What is the first step when reading a line plot? {Q18}',"),
    ("q('A line plot: Monday: 3 marks, Tuesday: 5 marks, Wednesday: 2 marks. Total?',",
     f"q('A line plot: Monday: 3 marks, Tuesday: 5 marks, Wednesday: 2 marks. Total? {Q19}',"),
    ("q('Values 1\u20134: value 1=2, value 2=4, value 3=3, value 4=1. Least common?',",
     f"q('Values 1\u20134: value 1=2, value 2=4, value 3=3, value 4=1. Least common? {Q20}',"),
    ("q('A line plot shows scores: 8,8,9,9,9,10. How many \u00d7 marks are above 9?',",
     f"q('A line plot shows scores: 8,8,9,9,9,10. How many \u00d7 marks are above 9? {Q21}',"),
    ("q('In a line plot, value 5 has no \u00d7 marks. What does that mean?',",
     f"q('In a line plot, value 5 has no \u00d7 marks. What does that mean? {Q22}',"),
    ("q('A line plot shows Apples: 4 marks, Bananas: 6 marks, Grapes: 2 marks. Most popular?',",
     f"q('A line plot shows Apples: 4 marks, Bananas: 6 marks, Grapes: 2 marks. Most popular? {Q23}',"),
    ("q('How is a line plot different from a bar graph?',",
     f"q('How is a line plot different from a bar graph? {Q24}',"),
    ("q('A line plot shows 6 marks total. 2 are above 3. How many above other numbers?',",
     f"q('A line plot shows 6 marks total. 2 are above 3. How many above other numbers? {Q25}',"),
    ("q('A line plot shows test scores. Most marks are above 90. What can you conclude?',",
     f"q('A line plot shows test scores. Most marks are above 90. What can you conclude? {Q26}',"),
    ("q('A line plot: homework time 1:\u00d7\u00d7, 2:\u00d7\u00d7\u00d7, 3:\u00d7\u00d7\u00d7, 4:\u00d7. Which times are tied?',",
     f"q('A line plot: homework time 1:\u00d7\u00d7, 2:\u00d7\u00d7\u00d7, 3:\u00d7\u00d7\u00d7, 4:\u00d7. Which times are tied? {Q27}',"),
    ("q('A line plot shows 3 marks above 7. What does that tell us?',",
     f"q('A line plot shows 3 marks above 7. What does that tell us? {Q28}',"),
    ("q('A line plot has values 2, 3, 4. Value 4 has no marks. What does the line plot show?',",
     f"q('A line plot has values 2, 3, 4. Value 4 has no marks. What does the line plot show? {Q29}',"),
]

applied = 0
missing = []
for old, new in reps:
    if old in content:
        content = content.replace(old, new, 1)
        applied += 1
    else:
        missing.append(old[:60])

with open('E:/Cameron Jones/my-math-roots/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Applied: {applied}/{len(reps)}')
if missing:
    print('MISSING:')
    for m in missing:
        print(' ', repr(m))
