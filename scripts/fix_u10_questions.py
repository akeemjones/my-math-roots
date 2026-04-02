"""Fix Unit 10 (Multiplication & Division) questions:
   - Remove giveaway answers from options
   - Fix typos in options/explanations
   - Rewrite fragment questions as complete sentences
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

hits = 0
misses = []

def patch(old, new, label=''):
    global content, hits
    old_b = old.encode('utf-8')
    new_b = new.encode('utf-8')
    count = content.count(old_b)
    if count == 0:
        misses.append(label or old[:70])
    else:
        content = content.replace(old_b, new_b)
        hits += count
        print(f'  OK ({count}x): {label}')

# =============================================================
# 1. CRITICAL: Fix giveaway options (products reveal the answer)
# =============================================================

# "18 / 3 solved by?" options show =12/=15/=18/=21 — =18 gives it away
patch(
    "q('18 \u00f7 3 solved by?',['3\u00d74=12','3\u00d75=15','3\u00d76=18','3\u00d77=21'],2,'3\u00d76=18, so 18\u00f73=6.')",
    "q('Which multiplication fact helps you solve 18 \u00f7 3?',['3\u00d74','3\u00d75','3\u00d76','3\u00d77'],2,'3\u00d76=18, so 18\u00f73=6.')",
    '18/3 solved by? (giveaway options with products)'
)

# "Which multiplication helps solve 18 / 3?" — same giveaway
patch(
    "q('Which multiplication helps solve 18 \u00f7 3?',['3\u00d74=12','3\u00d75=15','3\u00d76=18','3\u00d77=21'],2,'Since 3\u00d76=18, we know 18\u00f73=6.')",
    "q('Which multiplication fact helps solve 18 \u00f7 3?',['3\u00d74','3\u00d75','3\u00d76','3\u00d77'],2,'Since 3\u00d76=18, we know 18\u00f73=6.')",
    'Which multiplication helps solve 18/3? (giveaway options)'
)

# =============================================================
# 2. Fix question text giveaway
# =============================================================

# "In a 4x3 array, rows=4. Columns=?" — "4x3" directly reveals columns=3
patch(
    "q('In a 4\u00d73 array, rows=4. Columns=?',['2','3','4','5'],1,'4 rows, 3 columns.')",
    "q('An array has 4 rows and 12 items total. How many columns are there?',['2','3','4','5'],1,'4 rows \u00d7 3 columns = 12 items.')",
    'In a 4x3 array (question text giveaway)'
)

# =============================================================
# 3. Fix option typo
# =============================================================

# '3x5... wait' is a typo/mistake in an option
patch(
    "q('Which shows 5 groups of 3?',['5+5+5','3+3+3+3+3','5\u00d75','3\u00d75... wait'],1,'5 groups of 3=3+3+3+3+3.')",
    "q('Which shows 5 groups of 3?',['5+5+5','3+3+3+3+3','5\u00d75','3\u00d75'],1,'5 groups of 3=3+3+3+3+3.')",
    'Which shows 5 groups of 3? (typo in option)'
)

# =============================================================
# 4. Fix explanation typo + rewrite fragment (L0 qBank)
# =============================================================

patch(
    "q('4 groups of 6 = ?',['20','22','24','26'],2,'6\u00d76... wait 4\u00d76=24.')",
    "q('How many total in 4 groups of 6?',['20','22','24','26'],2,'4\u00d76=24.')",
    '4 groups of 6 (typo in explanation + fragment)'
)

# =============================================================
# 5. Rewrite fragment qBank questions (bytes.replace fixes testBank too)
# =============================================================

qbank_rewrites = [
    # L0 Equal Groups — arithmetic fragments
    ("q('3 groups of 4 = ?',['10','11','12','13'],2,'4+4+4=12.')",
     "q('How many total in 3 groups of 4?',['10','11','12','13'],2,'4+4+4=12.')"),
    ("q('Array: 3 rows, 4 cols. Total?',['7','10','12','14'],2,'3\u00d74=12.')",
     "q('An array has 3 rows and 4 columns. How many items total?',['7','10','12','14'],2,'3\u00d74=12.')"),
    ("q('5 groups of 2 = ?',['8','9','10','11'],2,'2+2+2+2+2=10.')",
     "q('How many total in 5 groups of 2?',['8','9','10','11'],2,'2+2+2+2+2=10.')"),
    ("q('Array 4 rows, 2 cols = ?',['6','7','8','9'],2,'4\u00d72=8.')",
     "q('An array has 4 rows and 2 columns. How many items total?',['6','7','8','9'],2,'4\u00d72=8.')"),
    ("q('2 groups of 6 = ?',['10','11','12','13'],2,'6+6=12.')",
     "q('How many total in 2 groups of 6?',['10','11','12','13'],2,'6+6=12.')"),
    ("q('Array 5 rows, 3 cols = ?',['12','13','14','15'],3,'5\u00d73=15.')",
     "q('An array has 5 rows and 3 columns. How many items total?',['12','13','14','15'],3,'5\u00d73=15.')"),
    ("q('3 groups of 5 = ?',['12','13','14','15'],3,'5+5+5=15.')",
     "q('How many total in 3 groups of 5?',['12','13','14','15'],3,'5+5+5=15.')"),
    ("q('Array 2 rows, 7 cols = ?',['12','13','14','15'],2,'2\u00d77=14.')",
     "q('An array has 2 rows and 7 columns. How many items total?',['12','13','14','15'],2,'2\u00d77=14.')"),
    ("q('4 groups of 4 = ?',['12','14','16','18'],2,'4+4+4+4=16.')",
     "q('How many total in 4 groups of 4?',['12','14','16','18'],2,'4+4+4+4=16.')"),
    ("q('Array 6 rows, 2 cols = ?',['8','10','12','14'],2,'6\u00d72=12.')",
     "q('An array has 6 rows and 2 columns. How many items total?',['8','10','12','14'],2,'6\u00d72=12.')"),
    ("q('2 groups of 9 = ?',['16','17','18','19'],2,'9+9=18.')",
     "q('How many total in 2 groups of 9?',['16','17','18','19'],2,'9+9=18.')"),
    ("q('Array 3 rows, 3 cols = ?',['6','7','8','9'],3,'3\u00d73=9.')",
     "q('An array has 3 rows and 3 columns. How many items total?',['6','7','8','9'],3,'3\u00d73=9.')"),
    ("q('5 groups of 5 = ?',['20','22','24','25'],3,'5\u00d75=25.')",
     "q('How many total in 5 groups of 5?',['20','22','24','25'],3,'5\u00d75=25.')"),
    ("q('3 groups of 7 = ?',['18','19','20','21'],3,'7+7+7=21.')",
     "q('How many total in 3 groups of 7?',['18','19','20','21'],3,'7+7+7=21.')"),
    ("q('Array 4 rows, 5 cols = ?',['16','18','20','22'],2,'4\u00d75=20.')",
     "q('An array has 4 rows and 5 columns. How many items total?',['16','18','20','22'],2,'4\u00d75=20.')"),
    ("q('6 groups of 3 = ?',['15','16','17','18'],3,'3+3+3+3+3+3=18.')",
     "q('How many total in 6 groups of 3?',['15','16','17','18'],3,'3+3+3+3+3+3=18.')"),
    ("q('Array 10 rows, 2 cols = ?',['16','18','20','22'],2,'10\u00d72=20.')",
     "q('An array has 10 rows and 2 columns. How many items total?',['16','18','20','22'],2,'10\u00d72=20.')"),
    ("q('2 groups of 4 = ?',['6','7','8','9'],2,'4+4=8.')",
     "q('How many total in 2 groups of 4?',['6','7','8','9'],2,'4+4=8.')"),
    ("q('Array 3 rows, 6 cols = ?',['15','16','17','18'],3,'3\u00d76=18.')",
     "q('An array has 3 rows and 6 columns. How many items total?',['15','16','17','18'],3,'3\u00d76=18.')"),
    ("q('5 groups of 4 = ?',['16','18','20','22'],2,'4+4+4+4+4=20.')",
     "q('How many total in 5 groups of 4?',['16','18','20','22'],2,'4+4+4+4+4=20.')"),
    ("q('Array 2 rows, 10 cols = ?',['15','18','20','22'],2,'2\u00d710=20.')",
     "q('An array has 2 rows and 10 columns. How many items total?',['15','18','20','22'],2,'2\u00d710=20.')"),
    ("q('3 groups of 8 = ?',['20','22','24','26'],2,'8+8+8=24.')",
     "q('How many total in 3 groups of 8?',['20','22','24','26'],2,'8+8+8=24.')"),

    # L0 lesson quiz fragments
    ("q('3 groups of 4 = ?',['10','11','12','13'],2,'4+4+4=12. Or 3\u00d74=12.')",
     "q('How many total in 3 groups of 4?',['10','11','12','13'],2,'4+4+4=12. Or 3\u00d74=12.')"),
    ("q('Array: 3 rows, 4 columns. Total?',['7','10','12','14'],2,'3\u00d74=12 items total.')",
     "q('An array has 3 rows and 4 columns. How many items total?',['7','10','12','14'],2,'3\u00d74=12 items total.')"),
    ("q('Array: 4 rows, 2 columns. Total?',['6','7','8','9'],2,'4\u00d72=8 total items.')",
     "q('An array has 4 rows and 2 columns. How many items total?',['6','7','8','9'],2,'4\u00d72=8 total items.')"),

    # L1 Adding the Same Number — arithmetic fragments
    ("q('4+4+4 = ? (3 groups)',['8','10','12','16'],2,'3\u00d74=12.')",
     "q('What is 4+4+4? (3 equal groups of 4)',['8','10','12','16'],2,'3\u00d74=12.')"),
    ("q('2+2+2+2+2 = ?',['5','7','10','12'],2,'5\u00d72=10.')",
     "q('What is 2+2+2+2+2?',['5','7','10','12'],2,'5\u00d72=10.')"),
    ("q('7+7+7 = ?',['18','19','20','21'],3,'3\u00d77=21.')",
     "q('What is 7+7+7?',['18','19','20','21'],3,'3\u00d77=21.')"),
    ("q('5+5+5+5 = ?',['15','18','20','22'],2,'4\u00d75=20.')",
     "q('What is 5+5+5+5?',['15','18','20','22'],2,'4\u00d75=20.')"),
    ("q('9+9 = ?',['16','17','18','19'],2,'2\u00d79=18.')",
     "q('What is 9+9?',['16','17','18','19'],2,'2\u00d79=18.')"),
    ("q('6+6+6+6 = ?',['20','22','24','26'],2,'4\u00d76=24.')",
     "q('What is 6+6+6+6?',['20','22','24','26'],2,'4\u00d76=24.')"),
    ("q('3\u00d73 = ?',['6','7','8','9'],3,'3\u00d73=9.')",
     "q('What is 3\u00d73?',['6','7','8','9'],3,'3\u00d73=9.')"),
    ("q('10+10+10 = ?',['20','25','30','35'],2,'3\u00d710=30.')",
     "q('What is 10+10+10?',['20','25','30','35'],2,'3\u00d710=30.')"),
    ("q('8+8 = ?',['14','15','16','17'],2,'2\u00d78=16.')",
     "q('What is 8+8?',['14','15','16','17'],2,'2\u00d78=16.')"),
    ("q('4+4+4+4+4 = ?',['16','18','20','22'],2,'5\u00d74=20.')",
     "q('What is 4+4+4+4+4?',['16','18','20','22'],2,'5\u00d74=20.')"),
    ("q('2\u00d79 = ?',['14','16','18','20'],2,'9+9=18.')",
     "q('What is 2\u00d79?',['14','16','18','20'],2,'9+9=18.')"),
    ("q('7+7+7+7 = ?',['24','26','28','30'],2,'4\u00d77=28.')",
     "q('What is 7+7+7+7?',['24','26','28','30'],2,'4\u00d77=28.')"),
    ("q('9+9+9 = ?',['25','26','27','28'],2,'3\u00d79=27.')",
     "q('What is 9+9+9?',['25','26','27','28'],2,'3\u00d79=27.')"),

    # L1 lesson quiz fragments
    ("q('4+4+4 = ? (3 groups of 4)',['8','10','12','16'],2,'3 groups of 4 = 12. Or 3\u00d74=12.')",
     "q('What is 4+4+4? (3 equal groups of 4)',['8','10','12','16'],2,'3 groups of 4 = 12. Or 3\u00d74=12.')"),
    ("q('2+2+2+2+2 = ? (5 groups of 2)',['5','7','10','12'],2,'5 groups of 2 = 10. Or 5\u00d72=10.')",
     "q('What is 2+2+2+2+2? (5 equal groups of 2)',['5','7','10','12'],2,'5 groups of 2 = 10. Or 5\u00d72=10.')"),
    ("q('7+7+7 = ? (3 groups of 7)',['18','19','20','21'],3,'3 groups of 7 = 21. Or 3\u00d77=21.')",
     "q('What is 7+7+7? (3 equal groups of 7)',['18','19','20','21'],3,'3 groups of 7 = 21. Or 3\u00d77=21.')"),

    # L2 Sharing Equally — division fragments
    ("q('15 \u00f7 3 = ?',['4','5','6','7'],1,'15\u00f73=5. Check: 3\u00d75=15.')",
     "q('What is 15 \u00f7 3?',['4','5','6','7'],1,'15\u00f73=5. Check: 3\u00d75=15.')"),
    ("q('20 \u00f7 4 = ?',['4','5','6','7'],1,'20\u00f74=5.')",
     "q('What is 20 \u00f7 4?',['4','5','6','7'],1,'20\u00f74=5.')"),
    ("q('12 \u00f7 4 = ?',['2','3','4','5'],1,'12\u00f74=3.')",
     "q('What is 12 \u00f7 4?',['2','3','4','5'],1,'12\u00f74=3.')"),
    ("q('24 \u00f7 4 = ?',['4','5','6','7'],2,'24\u00f74=6.')",
     "q('What is 24 \u00f7 4?',['4','5','6','7'],2,'24\u00f74=6.')"),
    ("q('\u00f7 means?',['Add','Subtract','Multiply','Share equally'],3,'Division=sharing equally.')",
     "q('What does the \u00f7 symbol mean?',['Add','Subtract','Multiply','Share equally'],3,'Division=sharing equally.')"),
    ("q('10 \u00f7 2 = ?',['3','4','5','6'],2,'10\u00f72=5.')",
     "q('What is 10 \u00f7 2?',['3','4','5','6'],2,'10\u00f72=5.')"),
    ("q('16 \u00f7 4 = ?',['2','3','4','5'],2,'16\u00f74=4.')",
     "q('What is 16 \u00f7 4?',['2','3','4','5'],2,'16\u00f74=4.')"),
    ("q('18 \u00f7 6 = ?',['2','3','4','5'],1,'18\u00f76=3.')",
     "q('What is 18 \u00f7 6?',['2','3','4','5'],1,'18\u00f76=3.')"),
    ("q('20 \u00f7 5 = ?',['3','4','5','6'],1,'20\u00f75=4.')",
     "q('What is 20 \u00f7 5?',['3','4','5','6'],1,'20\u00f75=4.')"),
    ("q('14 \u00f7 2 = ?',['5','6','7','8'],2,'14\u00f72=7.')",
     "q('What is 14 \u00f7 2?',['5','6','7','8'],2,'14\u00f72=7.')"),
    ("q('9 \u00f7 3 = ?',['2','3','4','5'],1,'9\u00f73=3.')",
     "q('What is 9 \u00f7 3?',['2','3','4','5'],1,'9\u00f73=3.')"),
    ("q('25 \u00f7 5 = ?',['3','4','5','6'],2,'25\u00f75=5.')",
     "q('What is 25 \u00f7 5?',['3','4','5','6'],2,'25\u00f75=5.')"),
    ("q('30 \u00f7 6 = ?',['4','5','6','7'],1,'30\u00f76=5.')",
     "q('What is 30 \u00f7 6?',['4','5','6','7'],1,'30\u00f76=5.')"),
    ("q('27 \u00f7 3 = ?',['7','8','9','10'],2,'27\u00f73=9.')",
     "q('What is 27 \u00f7 3?',['7','8','9','10'],2,'27\u00f73=9.')"),
    ("q('12 \u00f7 2 = ?',['4','5','6','7'],2,'12\u00f72=6.')",
     "q('What is 12 \u00f7 2?',['4','5','6','7'],2,'12\u00f72=6.')"),
    ("q('18 \u00f7 2 = ?',['7','8','9','10'],2,'18\u00f72=9.')",
     "q('What is 18 \u00f7 2?',['7','8','9','10'],2,'18\u00f72=9.')"),
    ("q('8 apples, 2 groups. Each?',['3','4','5','6'],1,'8\u00f72=4.')",
     "q('8 apples are shared equally between 2 groups. How many in each?',['3','4','5','6'],1,'8\u00f72=4.')"),
]

print('--- qBank/testBank/lesson-quiz rewrites ---')
for old, new in qbank_rewrites:
    patch(old, new, old[3:55])

# =============================================================
# 6. Rewrite unitQuiz fragment questions (compact format)
# =============================================================

unitquiz_rewrites = [
    ("q('3 groups of 4=?',['10','11','12','13'],2,'4+4+4=12.')",
     "q('How many total in 3 groups of 4?',['10','11','12','13'],2,'4+4+4=12.')"),
    ("q('5+5+5=?',['10','12','15','20'],2,'3 groups of 5=15.')",
     "q('What is 5+5+5?',['10','12','15','20'],2,'3 groups of 5=15.')"),
    ("q('Array:3 rows,4 cols. Total?',['7','10','12','14'],2,'3\u00d74=12.')",
     "q('An array has 3 rows and 4 columns. How many items total?',['7','10','12','14'],2,'3\u00d74=12.')"),
    ("q('2+2+2+2=?',['6','7','8','9'],2,'4 groups of 2=8.')",
     "q('What is 2+2+2+2?',['6','7','8','9'],2,'4 groups of 2=8.')"),
    ("q('15\u00f73=?',['4','5','6','7'],1,'15\u00f73=5.')",
     "q('What is 15 \u00f7 3?',['4','5','6','7'],1,'15\u00f73=5.')"),
    ("q('4 groups of 5=?',['15','18','20','25'],2,'4\u00d75=20.')",
     "q('How many total in 4 groups of 5?',['15','18','20','25'],2,'4\u00d75=20.')"),
    ("q('20\u00f74=?',['4','5','6','7'],1,'20\u00f74=5.')",
     "q('What is 20 \u00f7 4?',['4','5','6','7'],1,'20\u00f74=5.')"),
    ("q('3\u00d76=?',['15','16','17','18'],3,'3\u00d76=18.')",
     "q('What is 3\u00d76?',['15','16','17','18'],3,'3\u00d76=18.')"),
    ("q('Addition for 3\u00d75?',['5+5+5+5','3+3+3+3+3','5+5+5','3+5+3'],2,'3 groups of 5=5+5+5.')",
     "q('Which repeated addition matches 3\u00d75?',['5+5+5+5','3+3+3+3+3','5+5+5','3+5+3'],2,'3 groups of 5=5+5+5.')"),
    ("q('2 groups of 9=?',['16','17','18','19'],2,'2\u00d79=18.')",
     "q('How many total in 2 groups of 9?',['16','17','18','19'],2,'2\u00d79=18.')"),
    ("q('12\u00f73=?',['3','4','5','6'],1,'12\u00f73=4.')",
     "q('What is 12 \u00f7 3?',['3','4','5','6'],1,'12\u00f73=4.')"),
    ("q('Array:4 rows,2 cols=?',['6','7','8','9'],2,'4\u00d72=8.')",
     "q('An array has 4 rows and 2 columns. How many items total?',['6','7','8','9'],2,'4\u00d72=8.')"),
    ("q('6+6+6=?',['16','17','18','19'],2,'3 groups of 6=18.')",
     "q('What is 6+6+6?',['16','17','18','19'],2,'3 groups of 6=18.')"),
    ("q('18\u00f76=?',['2','3','4','5'],1,'18\u00f76=3.')",
     "q('What is 18 \u00f7 6?',['2','3','4','5'],1,'18\u00f76=3.')"),
    ("q('5 groups of 3=?',['12','13','14','15'],3,'5\u00d73=15.')",
     "q('How many total in 5 groups of 3?',['12','13','14','15'],3,'5\u00d73=15.')"),
    ("q('4\u00d73=12,so 12\u00f74=?',['2','3','4','5'],1,'Fact family:12\u00f74=3.')",
     "q('If 4\u00d73=12, then what is 12\u00f74?',['2','3','4','5'],1,'Fact family: 12\u00f74=3.')"),
    ("q('Skip by 3:3,6,9,12,___,18?',['13','14','15','16'],2,'12+3=15.')",
     "q('Skip count by 3: 3, 6, 9, 12, ___, 18. What is the missing number?',['13','14','15','16'],2,'12+3=15.')"),
    ("q('24\u00f74=?',['4','5','6','7'],2,'24\u00f74=6.')",
     "q('What is 24 \u00f7 4?',['4','5','6','7'],2,'24\u00f74=6.')"),
    ("q('3\u00d73=?',['6','7','8','9'],3,'3\u00d73=9.')",
     "q('What is 3\u00d73?',['6','7','8','9'],3,'3\u00d73=9.')"),
    ("q('10\u00f72=?',['3','4','5','6'],2,'10\u00f72=5.')",
     "q('What is 10 \u00f7 2?',['3','4','5','6'],2,'10\u00f72=5.')"),
    ("q('2 groups of 7=?',['12','13','14','15'],2,'2\u00d77=14.')",
     "q('How many total in 2 groups of 7?',['12','13','14','15'],2,'2\u00d77=14.')"),
    ("q('5\u00d72=?',['5','8','10','12'],2,'5\u00d72=10.')",
     "q('What is 5\u00d72?',['5','8','10','12'],2,'5\u00d72=10.')"),
    ("q('16\u00f74=?',['2','3','4','5'],2,'16\u00f74=4.')",
     "q('What is 16 \u00f7 4?',['2','3','4','5'],2,'16\u00f74=4.')"),
    ("q('Array:5 rows,3 cols=?',['12','13','14','15'],3,'5\u00d73=15.')",
     "q('An array has 5 rows and 3 columns. How many items total?',['12','13','14','15'],3,'5\u00d73=15.')"),
    ("q('7+7+7=?',['19','20','21','22'],2,'3\u00d77=21.')",
     "q('What is 7+7+7?',['19','20','21','22'],2,'3\u00d77=21.')"),
    ("q('\u00f7 symbol means?',['Add','Subtract','Multiply','Divide equally'],3,'Division=sharing equally.')",
     "q('What does the \u00f7 symbol mean?',['Add','Subtract','Multiply','Divide equally'],3,'Division=sharing equally.')"),
    ("q('4\u00d74=?',['12','14','16','18'],2,'4\u00d74=16.')",
     "q('What is 4\u00d74?',['12','14','16','18'],2,'4\u00d74=16.')"),
    ("q('20\u00f75=?',['3','4','5','6'],1,'20\u00f75=4.')",
     "q('What is 20 \u00f7 5?',['3','4','5','6'],1,'20\u00f75=4.')"),
    ("q('Equal groups:3+3+3 or 3+4+2?',['3+3+3','3+4+2','Both','Neither'],0,'3+3+3 has equal groups.')",
     "q('Which shows equal groups: 3+3+3 or 3+4+2?',['3+3+3','3+4+2','Both','Neither'],0,'3+3+3 has equal groups.')"),
]

print('\n--- unitQuiz rewrites ---')
for old, new in unitquiz_rewrites:
    patch(old, new, old[3:55])

# =============================================================
# Report
# =============================================================
print(f'\n{hits} total patches applied.')
if misses:
    print(f'{len(misses)} MISSES:')
    for m in misses:
        print(f'  MISS: {m[:80]}')
else:
    print('No misses!')

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('Saved.')
