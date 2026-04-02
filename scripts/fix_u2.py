#!/usr/bin/env python3
"""Fix all Unit 2 issues: explanation errors and answer redistribution."""
import sys

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

orig = content
count = 0

def fix(old, new, label=''):
    global content, count
    old_b = old.encode('utf-8')
    new_b = new.encode('utf-8')
    n = content.count(old_b)
    if n == 0:
        print(f'  NOT FOUND: {old_b[:80]}')
        return
    content = content.replace(old_b, new_b)
    count += n
    print(f'  OK ({n}x){" ["+label+"]" if label else ""}: {old_b[:70]}')

# =========================================================
# FIX 1: Explanation errors
# =========================================================
print('\n=== FIX 1: Explanation fixes ===')

# L3 qBank line 1517 — confusing/contradictory explanation
fix(
    "q('Which symbol goes in the blank? 807 ___ 780',['<','>','=','x'],1,'Hundreds equal, tens: 0<8. Wait\u2014807: 8H,0T,7O. 780: 7H,8T,0O. Hundreds: 8>7. So 807>780.')",
    "q('Which symbol goes in the blank? 807 ___ 780',['<','>','=','x'],1,'807: 8H,0T,7O. 780: 7H,8T,0O. Hundreds: 8>7, so 807>780.')"
)

# unitQuiz line 1707 — circular/weak explanation
fix(
    "q('What is the value of 0 in 908?',['0','10','90','900'],0,'0 in tens place = value of 0.')",
    "q('What is the value of 0 in 908?',['0','10','90','900'],0,'0 is in the tens place. Zero tens = 0.')"
)

# =========================================================
# FIX 2: L1 qBank — Add index 3 (none existed)
# Move 3 from index 0 → 3, and 4 from index 1 → 3
# Result: 7, 7, 9, 7
# Also cascades to testBank (same strings)
# =========================================================
print('\n=== FIX 2: L1 qBank redistribution (add index 3) ===')

# From index 0 → 3
fix(
    "q('What is 8 hundreds + 0 tens + 5 ones?',['805','850','508','580'],0,'800+0+5=805.')",
    "q('What is 8 hundreds + 0 tens + 5 ones?',['850','508','580','805'],3,'800+0+5=805.')"
)
fix(
    "q('In 614, what is the tens digit?',['1','4','6','14'],0,'614: 6 hundreds, 1 ten, 4 ones.')",
    "q('In 614, what is the tens digit?',['4','6','14','1'],3,'614: 6 hundreds, 1 ten, 4 ones.')"
)
fix(
    "q('In 799, what digit is in hundreds place?',['7','9','99','79'],0,'799: 7 hundreds, 9 tens, 9 ones.')",
    "q('In 799, what digit is in hundreds place?',['9','99','79','7'],3,'799: 7 hundreds, 9 tens, 9 ones.')"
)

# From index 1 → 3
fix(
    "q('What is 5 hundreds + 6 tens + 2 ones?',['526','562','625','652'],1,'500+60+2=562.')",
    "q('What is 5 hundreds + 6 tens + 2 ones?',['526','625','652','562'],3,'500+60+2=562.')"
)
fix(
    "q('What digit is in the tens place in 450?',['4','5','0','9'],1,'450: 4 hundreds, 5 tens, 0 ones.')",
    "q('What digit is in the tens place in 450?',['4','0','9','5'],3,'450: 4 hundreds, 5 tens, 0 ones.')"
)
fix(
    "q('What is the value of 6 in 164?',['6','60','600','16'],1,'6 is in tens place = 60.')",
    "q('What is the value of 6 in 164?',['6','600','16','60'],3,'6 is in tens place = 60.')"
)
fix(
    "q('In 615, what is the value of 1?',['1','10','100','1000'],1,'1 is in tens place = 10.')",
    "q('In 615, what is the value of 1?',['1','100','1000','10'],3,'1 is in tens place = 10.')"
)

# =========================================================
# FIX 3: L2 qBank — Add index 3 (none existed)
# Move 2 from index 0 → 3, and 5 from index 1 → 3
# Result: 7, 7, 9, 7
# Also cascades to testBank
# =========================================================
print('\n=== FIX 3: L2 qBank redistribution (add index 3) ===')

# From index 0 → 3
fix(
    "q('What is 300 + 50 + 0?',['350','305','530','503'],0,'3H+5T+0O=350.')",
    "q('What is 300 + 50 + 0?',['305','530','503','350'],3,'3H+5T+0O=350.')"
)
fix(
    "q('What is the expanded form of 762?',['700+60+2','700+6+2','70+60+2','762'],0,'7H+6T+2O=700+60+2.')",
    "q('What is the expanded form of 762?',['700+6+2','70+60+2','762','700+60+2'],3,'7H+6T+2O=700+60+2.')"
)

# From index 1 → 3
fix(
    "q('What is the expanded form of 806?',['800+6','800+0+6','80+6','8+0+6'],1,'8H+0T+6O=800+0+6.')",
    "q('What is the expanded form of 806?',['800+6','80+6','8+0+6','800+0+6'],3,'8H+0T+6O=800+0+6.')"
)
fix(
    "q('What is 400 + 0 + 9?',['490','409','904','940'],1,'4H+0T+9O=409.')",
    "q('What is 400 + 0 + 9?',['490','904','940','409'],3,'4H+0T+9O=409.')"
)
fix(
    "q('What is 300 + 80 + 0?',['308','380','830','803'],1,'3H+8T+0O=380.')",
    "q('What is 300 + 80 + 0?',['308','830','803','380'],3,'3H+8T+0O=380.')"
)
fix(
    "q('What is 700 + 60 + 4?',['746','764','674','467'],1,'7H+6T+4O=764.')",
    "q('What is 700 + 60 + 4?',['746','674','467','764'],3,'7H+6T+4O=764.')"
)
fix(
    "q('What is the standard form of three hundred forty?',['304','340','430','403'],1,'300+40=340.')",
    "q('What is the standard form of three hundred forty?',['304','430','403','340'],3,'300+40=340.')"
)

# =========================================================
# FIX 4: L4 qBank — Redistribute severely imbalanced answers
# Original: 0, 10, 18, 2
# Move 8 from index 2 → 0, and 5 from index 1 → 3
# Result: 8, 5, 10, 7
# Some cascade to unitQuiz (1558→1703, 1577→1718)
# =========================================================
print('\n=== FIX 4: L4 qBank redistribution ===')

# From index 2 → 0
fix(
    "q('What number comes next? Skip count by 10s: 40, 50, ___',['55','58','60','65'],2,'50+10=60.')",
    "q('What number comes next? Skip count by 10s: 40, 50, ___',['60','55','58','65'],0,'50+10=60.')"
)
fix(
    "q('What number comes next? Skip count by 100s: 200, 300, ___',['350','380','400','500'],2,'300+100=400.')",
    "q('What number comes next? Skip count by 100s: 200, 300, ___',['400','350','380','500'],0,'300+100=400.')"
)
fix(
    "q('What number comes next? Skip count by 5s: 40, 45, 50, ___',['52','54','55','60'],2,'50+5=55.')",
    "q('What number comes next? Skip count by 5s: 40, 45, 50, ___',['55','52','54','60'],0,'50+5=55.')"
)
fix(
    "q('What number comes next? Skip count by 100s: 500, 600, 700, ___',['750','780','800','900'],2,'700+100=800.')",
    "q('What number comes next? Skip count by 100s: 500, 600, 700, ___',['800','750','780','900'],0,'700+100=800.')"
)
fix(
    "q('What is the counting rule? 4, 8, 12, 16...',['Add 2','Add 3','Add 4','Add 5'],2,'Each number increases by 4.')",
    "q('What is the counting rule? 4, 8, 12, 16...',['Add 4','Add 2','Add 3','Add 5'],0,'Each number increases by 4.')"
)
fix(
    "q('What number comes next? Skip count by 10s: 130, 140, 150, ___',['155','158','160','165'],2,'150+10=160.')",
    "q('What number comes next? Skip count by 10s: 130, 140, 150, ___',['160','155','158','165'],0,'150+10=160.')"
)
fix(
    "q('What is the missing number? 3, 6, ___, 12, 15',['7','8','9','10'],2,'Skip by 3s: 6+3=9.')",
    "q('What is the missing number? 3, 6, ___, 12, 15',['9','7','8','10'],0,'Skip by 3s: 6+3=9.')"
)
fix(
    "q('What number comes next? Skip count by 5s: 80, 85, 90, ___',['92','94','95','97'],2,'90+5=95.')",
    "q('What number comes next? Skip count by 5s: 80, 85, 90, ___',['95','92','94','97'],0,'90+5=95.')"
)

# From index 1 → 3
# Line 1558 — also cascades to unitQuiz line 1703
fix(
    "q('What number comes next? Skip count by 10s: 70, 80, 90, ___',['95','100','105','110'],1,'90+10=100.')",
    "q('What number comes next? Skip count by 10s: 70, 80, 90, ___',['95','105','110','100'],3,'90+10=100.')"
)
fix(
    "q('What number comes next? Skip count by 2s: 8, 10, 12, ___',['13','14','15','16'],1,'12+2=14.')",
    "q('What number comes next? Skip count by 2s: 8, 10, 12, ___',['13','15','16','14'],3,'12+2=14.')"
)
fix(
    "q('What number comes next? Skip count by 2s: 96, 98, 100, ___',['101','102','103','104'],1,'100+2=102.')",
    "q('What number comes next? Skip count by 2s: 96, 98, 100, ___',['101','103','104','102'],3,'100+2=102.')"
)
fix(
    "q('What number comes next? Skip count by 2s: 72, 74, 76, ___',['77','78','79','80'],1,'76+2=78.')",
    "q('What number comes next? Skip count by 2s: 72, 74, 76, ___',['77','79','80','78'],3,'76+2=78.')"
)
# Line 1577 — also cascades to unitQuiz line 1718
fix(
    "q('What number comes next? Skip count by 5s: 95, 100, 105, ___',['108','110','112','115'],1,'105+5=110.')",
    "q('What number comes next? Skip count by 5s: 95, 100, 105, ___',['108','112','115','110'],3,'105+5=110.')"
)

# =========================================================
# FIX 5: unitQuiz — Additional redistribution
# After L4 cascades: 9, 11, 7, 3 → need 4 more from 1 → 3
# Final target: 9, 7, 7, 7
# =========================================================
print('\n=== FIX 5: unitQuiz redistribution (unique strings) ===')

# Move from index 1 → 3 (strings unique to unitQuiz, won't cascade to qBank)
fix(
    "q('What is 327 rounded to the nearest hundred?',['200','300','320','400'],1,'Tens digit 2 < 5, round down to 300.')",
    "q('What is 327 rounded to the nearest hundred?',['200','320','400','300'],3,'Tens digit 2 < 5, round down to 300.')"
)
fix(
    "q('What number comes next? Skip count by 5s: 35, 40, 45, ___',['48','50','52','55'],1,'45+5=50.')",
    "q('What number comes next? Skip count by 5s: 35, 40, 45, ___',['48','52','55','50'],3,'45+5=50.')"
)
fix(
    "q('What is the word form of 204?',['twenty-four','two hundred four','two hundred forty','two four'],1,'200+4=two hundred four.')",
    "q('What is the word form of 204?',['twenty-four','two hundred forty','two four','two hundred four'],3,'200+4=two hundred four.')"
)
fix(
    "q('What number comes next? Skip count by 2s: 18, 20, 22, ___',['23','24','25','26'],1,'22+2=24.')",
    "q('What number comes next? Skip count by 2s: 18, 20, 22, ___',['23','25','26','24'],3,'22+2=24.')"
)

# =========================================================
# Done — write file
# =========================================================
print(f'\nTotal replacements: {count}')

if content == orig:
    print('ERROR: No changes made!')
    sys.exit(1)

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('File written OK.')
