#!/usr/bin/env python3
"""Fix all Unit 3 issues: explanation cleanup, borrow question rewrite, answer redistribution."""
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
# FIX 1: L1 qBank — Remove "Wait:" from line 1752 explanation
# Combined with redistribution (index 1 → 2)
# Cascades to testBank (same string appears twice)
# =========================================================
print('\n=== FIX 1: Remove Wait: from line 1752 + move to index 2 ===')
fix(
    "q('What is 55 + 38?',['40','93','83','150'],1,'Ones:5+8=13, write 3 carry 1. Tens:5+3+1=9. Wait: 55+38=93.')",
    "q('What is 55 + 38?',['40','83','93','150'],2,'Ones:5+8=13, write 3 carry 1. Tens:5+3+1=9.')"
)

# =========================================================
# FIX 2: L2 qBank line 1815 — Rewrite confusing "Both B and C"
# Combined with redistribution (index 3 → 2)
# Cascades to testBank
# =========================================================
print('\n=== FIX 2: Rewrite borrow question (line 1815) ===')
fix(
    "q('When do you BORROW in subtraction?',['Always','When top ones is too small','When bottom is bigger','Both B and C'],3,'You borrow when the top ones digit is smaller than the bottom ones digit.')",
    "q('When do you BORROW in subtraction?',['Always','When numbers are large','When top ones digit is smaller','Never'],2,'You borrow when the top ones digit is smaller than the bottom ones digit.')"
)

# =========================================================
# FIX 3: L4 qBank line 1928 — Fix "children" vs "people" error
# (correct answer is 80 which includes teachers — fix question text)
# Cascades to testBank
# =========================================================
print('\n=== FIX 3: Fix children/people error (line 1928) ===')
fix(
    "q('There are 27 girls, 38 boys, and 15 teachers. How many children are there in all?',['65','80','90','45'],1,'27+38=65, 65+15=80.')",
    "q('There are 27 girls, 38 boys, and 15 teachers. How many people are there in all?',['45','90','55','80'],3,'27+38+15=80 people in all.')"
)

# =========================================================
# FIX 4: L1 qBank redistribution [0,27,3,0] → [7,7,9,7]
# Move 7 from index 1→0, 5 from index 1→2 (plus Fix 1 gives 6 total at 2),
# 7 from index 1→3
# All cascade to testBank (same strings)
# =========================================================
print('\n=== FIX 4: L1 qBank — move to index 0 ===')

fix(
    "q('What is 47 + 36?',['56','83','93','40'],1,'Ones:7+6=13, write 3 carry 1. Tens:4+3+1=8.')",
    "q('What is 47 + 36?',['83','56','93','40'],0,'Ones:7+6=13, write 3 carry 1. Tens:4+3+1=8.')"
)
fix(
    "q('What is 62 + 79?',['120','141','151','100'],1,'Ones:2+9=11, write 1 carry 1. Tens:6+7+1=14.')",
    "q('What is 62 + 79?',['141','120','151','100'],0,'Ones:2+9=11, write 1 carry 1. Tens:6+7+1=14.')"
)
fix(
    "q('What is 73 + 19?',['75','92','102','60'],1,'Ones:3+9=12, write 2 carry 1. Tens:7+1+1=9.')",
    "q('What is 73 + 19?',['92','75','102','60'],0,'Ones:3+9=12, write 2 carry 1. Tens:7+1+1=9.')"
)
fix(
    "q('What does REGROUP mean?',['Start over','Carry 10 ones as 1 ten','Subtract instead','Skip to next'],1,'Regrouping means trading 10 ones for 1 ten and carrying it.')",
    "q('What does REGROUP mean?',['Carry 10 ones as 1 ten','Start over','Subtract instead','Skip to next'],0,'Regrouping means trading 10 ones for 1 ten and carrying it.')"
)
fix(
    "q('When do you carry in addition?',['Always','When ones column is 10+','When tens column is 10+','Never'],1,'You carry (regroup) when the ones column reaches 10 or more.')",
    "q('When do you carry in addition?',['When ones column is 10+','Always','When tens column is 10+','Never'],0,'You carry (regroup) when the ones column reaches 10 or more.')"
)
fix(
    "q('What is 23 + 79?',['92','102','80','60'],1,'Ones:3+9=12, write 2 carry 1. Tens:2+7+1=10.')",
    "q('What is 23 + 79?',['102','92','80','60'],0,'Ones:3+9=12, write 2 carry 1. Tens:2+7+1=10.')"
)
fix(
    "q('What is 94 + 7?',['90','101','111','75'],1,'Ones:4+7=11, write 1 carry 1. Tens:9+0+1=10.')",
    "q('What is 94 + 7?',['101','90','111','75'],0,'Ones:4+7=11, write 1 carry 1. Tens:9+0+1=10.')"
)

print('\n=== FIX 4: L1 qBank — move to index 2 ===')

fix(
    "q('What is 39 + 45?',['64','84','94','50'],1,'Ones:9+5=14, write 4 carry 1. Tens:3+4+1=8.')",
    "q('What is 39 + 45?',['64','94','84','50'],2,'Ones:9+5=14, write 4 carry 1. Tens:3+4+1=8.')"
)
fix(
    "q('What is 28 + 65?',['50','93','140','82'],1,'Ones:8+5=13, write 3 carry 1. Tens:2+6+1=9.')",
    "q('What is 28 + 65?',['50','140','93','82'],2,'Ones:8+5=13, write 3 carry 1. Tens:2+6+1=9.')"
)
fix(
    "q('What is 83 + 9?',['80','92','102','65'],1,'Ones:3+9=12, write 2 carry 1. Tens:8+0+1=9.')",
    "q('What is 83 + 9?',['80','102','92','65'],2,'Ones:3+9=12, write 2 carry 1. Tens:8+0+1=9.')"
)
fix(
    "q('What is 68 + 25?',['78','93','83','150'],1,'Ones:8+5=13, write 3 carry 1. Tens:6+2+1=9.')",
    "q('What is 68 + 25?',['78','83','93','150'],2,'Ones:8+5=13, write 3 carry 1. Tens:6+2+1=9.')"
)
fix(
    "q('What is 64 + 27?',['80','91','55','130'],1,'Ones:4+7=11, write 1 carry 1. Tens:6+2+1=9.')",
    "q('What is 64 + 27?',['80','55','91','130'],2,'Ones:4+7=11, write 1 carry 1. Tens:6+2+1=9.')"
)

print('\n=== FIX 4: L1 qBank — move to index 3 ===')

fix(
    "q('What is 58 + 27?',['70','85','95','50'],1,'Ones:8+7=15, write 5 carry 1. Tens:5+2+1=8.')",
    "q('What is 58 + 27?',['70','95','50','85'],3,'Ones:8+7=15, write 5 carry 1. Tens:5+2+1=8.')"
)
fix(
    "q('What is 57 + 34?',['71','91','45','130'],1,'Ones:7+4=11, write 1 carry 1. Tens:5+3+1=9.')",
    "q('What is 57 + 34?',['71','45','130','91'],3,'Ones:7+4=11, write 1 carry 1. Tens:5+3+1=9.')"
)
fix(
    "q('What is 45 + 48?',['78','93','83','140'],1,'Ones:5+8=13, write 3 carry 1. Tens:4+4+1=9.')",
    "q('What is 45 + 48?',['78','83','140','93'],3,'Ones:5+8=13, write 3 carry 1. Tens:4+4+1=9.')"
)
fix(
    "q('What is 54 + 37?',['80','91','45','140'],1,'Ones:4+7=11, write 1 carry 1. Tens:5+3+1=9.')",
    "q('What is 54 + 37?',['80','45','140','91'],3,'Ones:4+7=11, write 1 carry 1. Tens:5+3+1=9.')"
)
fix(
    "q('What is 75 + 16?',['80','91','55','130'],1,'Ones:5+6=11, write 1 carry 1. Tens:7+1+1=9.')",
    "q('What is 75 + 16?',['80','55','130','91'],3,'Ones:5+6=11, write 1 carry 1. Tens:7+1+1=9.')"
)
fix(
    "q('What is 78 + 16?',['84','94','60','130'],1,'Ones:8+6=14, write 4 carry 1. Tens:7+1+1=9.')",
    "q('What is 78 + 16?',['84','60','130','94'],3,'Ones:8+6=14, write 4 carry 1. Tens:7+1+1=9.')"
)
fix(
    "q('What is 26 + 37?',['50','63','73','40'],1,'Ones:6+7=13, write 3 carry 1. Tens:2+3+1=6.')",
    "q('What is 26 + 37?',['50','73','40','63'],3,'Ones:6+7=13, write 3 carry 1. Tens:2+3+1=6.')"
)

# =========================================================
# FIX 5: L2 qBank redistribution — after Fix 2
# [0,28,1,1] → Fix2 changes 1815 from 3→2 → [0,28,2,0]
# Target [7,7,8,8]: move 7→0, 6→2, 8→3 from index 1
# All cascade to testBank
# =========================================================
print('\n=== FIX 5: L2 qBank — move to index 0 ===')

fix(
    "q('What is 73 \u2212 28?',['30','45','55','10'],1,'Borrow:13-8=5, 6-2=4.')",
    "q('What is 73 \u2212 28?',['45','30','55','10'],0,'Borrow:13-8=5, 6-2=4.')"
)
fix(
    "q('What is 91 \u2212 47?',['54','44','30','80'],1,'Borrow:11-7=4, 8-4=4.')",
    "q('What is 91 \u2212 47?',['44','54','30','80'],0,'Borrow:11-7=4, 8-4=4.')"
)
fix(
    "q('What is 84 \u2212 37?',['57','47','20','90'],1,'Borrow:14-7=7, 7-3=4.')",
    "q('What is 84 \u2212 37?',['47','57','20','90'],0,'Borrow:14-7=7, 7-3=4.')"
)
fix(
    "q('What is 62 \u2212 45?',['30','17','27','5'],1,'Borrow:12-5=7, 5-4=1.')",
    "q('What is 62 \u2212 45?',['17','30','27','5'],0,'Borrow:12-5=7, 5-4=1.')"
)
fix(
    "q('What is 50 \u2212 23?',['37','27','10','60'],1,'Borrow:10-3=7, 4-2=2.')",
    "q('What is 50 \u2212 23?',['27','37','10','60'],0,'Borrow:10-3=7, 4-2=2.')"
)
fix(
    "q('What is 76 \u2212 39?',['47','37','20','80'],1,'Borrow:16-9=7, 6-3=3.')",
    "q('What is 76 \u2212 39?',['37','47','20','80'],0,'Borrow:16-9=7, 6-3=3.')"
)
fix(
    "q('What is 83 \u2212 56?',['37','27','10','60'],1,'Borrow:13-6=7, 7-5=2.')",
    "q('What is 83 \u2212 56?',['27','37','10','60'],0,'Borrow:13-6=7, 7-5=2.')"
)

print('\n=== FIX 5: L2 qBank — move to index 2 ===')

fix(
    "q('What is 95 \u2212 48?',['57','47','20','90'],1,'Borrow:15-8=7, 8-4=4.')",
    "q('What is 95 \u2212 48?',['57','20','47','90'],2,'Borrow:15-8=7, 8-4=4.')"
)
fix(
    "q('What is 64 \u2212 28?',['46','36','10','70'],1,'Borrow:14-8=6, 5-2=3.')",
    "q('What is 64 \u2212 28?',['46','10','36','70'],2,'Borrow:14-8=6, 5-2=3.')"
)
fix(
    "q('What is 71 \u2212 35?',['46','36','10','70'],1,'Borrow:11-5=6, 6-3=3.')",
    "q('What is 71 \u2212 35?',['46','10','36','70'],2,'Borrow:11-5=6, 6-3=3.')"
)
fix(
    "q('What is 85 \u2212 47?',['48','38','20','70'],1,'Borrow:15-7=8, 7-4=3.')",
    "q('What is 85 \u2212 47?',['48','20','38','70'],2,'Borrow:15-7=8, 7-4=3.')"
)
fix(
    "q('What is 52 \u2212 27?',['35','25','10','60'],1,'Borrow:12-7=5, 4-2=2.')",
    "q('What is 52 \u2212 27?',['35','10','25','60'],2,'Borrow:12-7=5, 4-2=2.')"
)
fix(
    "q('What is 90 \u2212 34?',['66','56','20','100'],1,'Borrow:10-4=6, 8-3=5.')",
    "q('What is 90 \u2212 34?',['66','20','56','100'],2,'Borrow:10-4=6, 8-3=5.')"
)

print('\n=== FIX 5: L2 qBank — move to index 3 ===')

fix(
    "q('What is 67 \u2212 29?',['48','38','20','80'],1,'Borrow:17-9=8, 5-2=3.')",
    "q('What is 67 \u2212 29?',['48','20','80','38'],3,'Borrow:17-9=8, 5-2=3.')"
)
fix(
    "q('What is 78 \u2212 53?',['35','25','10','60'],1,'No borrow: 8-3=5, 7-5=2.')",
    "q('What is 78 \u2212 53?',['35','10','60','25'],3,'No borrow: 8-3=5, 7-5=2.')"
)
fix(
    "q('What is 86 \u2212 58?',['38','28','10','60'],1,'Borrow:16-8=8, 7-5=2.')",
    "q('What is 86 \u2212 58?',['38','10','60','28'],3,'Borrow:16-8=8, 7-5=2.')"
)
fix(
    "q('What is 74 \u2212 36?',['48','38','20','80'],1,'Borrow:14-6=8, 6-3=3.')",
    "q('What is 74 \u2212 36?',['48','20','80','38'],3,'Borrow:14-6=8, 6-3=3.')"
)
fix(
    "q('What is 93 \u2212 67?',['36','26','10','60'],1,'Borrow:13-7=6, 8-6=2.')",
    "q('What is 93 \u2212 67?',['36','10','60','26'],3,'Borrow:13-7=6, 8-6=2.')"
)
fix(
    "q('What is 60 \u2212 42?',['28','18','5','50'],1,'Borrow:10-2=8, 5-4=1.')",
    "q('What is 60 \u2212 42?',['28','5','50','18'],3,'Borrow:10-2=8, 5-4=1.')"
)
fix(
    "q('What is 55 \u2212 28?',['37','27','10','60'],1,'Borrow:15-8=7, 4-2=2.')",
    "q('What is 55 \u2212 28?',['37','10','60','27'],3,'Borrow:15-8=7, 4-2=2.')"
)
fix(
    "q('What is 81 \u2212 44?',['47','37','10','70'],1,'Borrow:11-4=7, 7-4=3.')",
    "q('What is 81 \u2212 44?',['47','10','70','37'],3,'Borrow:11-4=7, 7-4=3.')"
)

# =========================================================
# FIX 6: L3 qBank redistribution [1,1,28,0] → [7,7,9,7]
# Lines 1857 and 1858 cascade to unitQuiz 2056 and 2059
# All others cascade to testBank only
# =========================================================
print('\n=== FIX 6: L3 qBank — move to index 0 ===')

# Line 1857 — also cascades to unitQuiz 2056 (identical string)
fix(
    "q('What is 5 + 5 + 8?',['11','22','18','25'],2,'5+5=10, +8=18.')",
    "q('What is 5 + 5 + 8?',['18','11','22','25'],0,'5+5=10, +8=18.')"
)
fix(
    "q('What is 7 + 7 + 5?',['12','25','19','27'],2,'7+7=14, +5=19.')",
    "q('What is 7 + 7 + 5?',['19','12','25','27'],0,'7+7=14, +5=19.')"
)
fix(
    "q('What is 8 + 2 + 7?',['10','22','17','25'],2,'8+2=10, +7=17.')",
    "q('What is 8 + 2 + 7?',['17','10','22','25'],0,'8+2=10, +7=17.')"
)
fix(
    "q('What is 9 + 9 + 4?',['14','28','22','31'],2,'9+9=18, +4=22.')",
    "q('What is 9 + 9 + 4?',['22','14','28','31'],0,'9+9=18, +4=22.')"
)
fix(
    "q('In 2 + 9 + 8, which pair should you add first to make a ten?',['2+9','9+8','2+8','9+2'],2,'2+8=10 \u2014 make a ten first!')",
    "q('In 2 + 9 + 8, which pair should you add first to make a ten?',['2+8','2+9','9+8','9+2'],0,'2+8=10 \u2014 make a ten first!')"
)
fix(
    "q('In 5 + 7 + 5, which pair should you add first?',['5+7','7+5','5+5','7+7'],2,'5+5=10 \u2014 doubles make it easy!')",
    "q('In 5 + 7 + 5, which pair should you add first?',['5+5','5+7','7+5','7+7'],0,'5+5=10 \u2014 doubles make it easy!')"
)

print('\n=== FIX 6: L3 qBank — move to index 1 ===')

fix(
    "q('What is 6 + 4 + 12?',['14','28','22','31'],2,'6+4=10, +12=22.')",
    "q('What is 6 + 4 + 12?',['14','22','28','31'],1,'6+4=10, +12=22.')"
)
fix(
    "q('What is 5 + 6 + 5?',['9','21','16','24'],2,'5+5=10, +6=16.')",
    "q('What is 5 + 6 + 5?',['9','16','21','24'],1,'5+5=10, +6=16.')"
)
fix(
    "q('What is 6 + 6 + 9?',['13','27','21','30'],2,'6+6=12, +9=21.')",
    "q('What is 6 + 6 + 9?',['13','21','27','30'],1,'6+6=12, +9=21.')"
)
fix(
    "q('What is 4 + 4 + 9?',['10','22','17','25'],2,'4+4=8, +9=17.')",
    "q('What is 4 + 4 + 9?',['10','17','22','25'],1,'4+4=8, +9=17.')"
)
fix(
    "q('What is 8 + 8 + 6?',['13','27','22','31'],2,'8+8=16, +6=22.')",
    "q('What is 8 + 8 + 6?',['13','22','27','31'],1,'8+8=16, +6=22.')"
)
fix(
    "q('What is 3 + 3 + 14?',['11','25','20','29'],2,'3+3=6, +14=20.')",
    "q('What is 3 + 3 + 14?',['11','20','25','29'],1,'3+3=6, +14=20.')"
)

print('\n=== FIX 6: L3 qBank — move to index 3 ===')

# Line 1858 — also cascades to unitQuiz 2059 (identical string)
fix(
    "q('What is 4 + 6 + 9?',['12','24','19','27'],2,'4+6=10, +9=19.')",
    "q('What is 4 + 6 + 9?',['12','24','27','19'],3,'4+6=10, +9=19.')"
)
fix(
    "q('What is 3 + 7 + 8?',['11','23','18','26'],2,'3+7=10, +8=18.')",
    "q('What is 3 + 7 + 8?',['11','23','26','18'],3,'3+7=10, +8=18.')"
)
fix(
    "q('What is 3 + 8 + 7?',['11','23','18','26'],2,'3+7=10, +8=18.')",
    "q('What is 3 + 8 + 7?',['11','23','26','18'],3,'3+7=10, +8=18.')"
)
fix(
    "q('What is 7 + 3 + 15?',['15','31','25','34'],2,'7+3=10, +15=25.')",
    "q('What is 7 + 3 + 15?',['15','31','34','25'],3,'7+3=10, +15=25.')"
)
fix(
    "q('What is 6 + 4 + 18?',['17','33','28','36'],2,'6+4=10, +18=28.')",
    "q('What is 6 + 4 + 18?',['17','33','36','28'],3,'6+4=10, +18=28.')"
)
fix(
    "q('What is 7 + 7 + 9?',['13','28','23','32'],2,'7+7=14, +9=23.')",
    "q('What is 7 + 7 + 9?',['13','28','32','23'],3,'7+7=14, +9=23.')"
)
fix(
    "q('What is 4 + 6 + 7?',['9','22','17','25'],2,'4+6=10, +7=17.')",
    "q('What is 4 + 6 + 7?',['9','22','25','17'],3,'4+6=10, +7=17.')"
)

# =========================================================
# FIX 7: L4 qBank redistribution [0,26,3,1] → [7,7,8,8]
# Move 7→0, 5→2, 7→3 from index 1
# All cascade to testBank
# =========================================================
print('\n=== FIX 7: L4 qBank — move to index 0 ===')

fix(
    "q('Tom had 45 stickers and got 38 more. How many does he have in all?',['56','83','93','40'],1,'\"Got more\" = ADD. 45+38=83.')",
    "q('Tom had 45 stickers and got 38 more. How many does he have in all?',['83','56','93','40'],0,'\"Got more\" = ADD. 45+38=83.')"
)
fix(
    "q('There were 92 birds in a tree and 47 flew away. How many are left?',['25','45','55','10'],1,'\"Flew away\" = SUBTRACT. 92-47=45.')",
    "q('There were 92 birds in a tree and 47 flew away. How many are left?',['45','25','55','10'],0,'\"Flew away\" = SUBTRACT. 92-47=45.')"
)
fix(
    "q('Sam has 67 cards and Ana has 85. How many more cards does Ana have?',['8','18','30','50'],1,'\"How many more\" = SUBTRACT. 85-67=18.')",
    "q('Sam has 67 cards and Ana has 85. How many more cards does Ana have?',['18','8','30','50'],0,'\"How many more\" = SUBTRACT. 85-67=18.')"
)
fix(
    "q('Lily had 143 coins and gave away 68. How many coins does she have left?',['55','75','85','30'],1,'\"Gave away\" = SUBTRACT. 143-68=75.')",
    "q('Lily had 143 coins and gave away 68. How many coins does she have left?',['75','55','85','30'],0,'\"Gave away\" = SUBTRACT. 143-68=75.')"
)
fix(
    "q('There are 56 red apples and 78 green apples. How many apples are there in all?',['104','134','144','90'],1,'\"Total\" = ADD. 56+78=134.')",
    "q('There are 56 red apples and 78 green apples. How many apples are there in all?',['134','104','144','90'],0,'\"Total\" = ADD. 56+78=134.')"
)
fix(
    "q('There are 165 crayons and 78 are broken. How many good crayons are there?',['97','87','50','130'],1,'\"Broke\" = SUBTRACT. 165-78=87.')",
    "q('There are 165 crayons and 78 are broken. How many good crayons are there?',['87','97','50','130'],0,'\"Broke\" = SUBTRACT. 165-78=87.')"
)
fix(
    "q('What does the phrase \"how many left\" tell you to do?',['Add','Subtract','Multiply','Count up'],1,'\"Left\" = what remains after subtracting.')",
    "q('What does the phrase \"how many left\" tell you to do?',['Subtract','Add','Multiply','Count up'],0,'\"Left\" = what remains after subtracting.')"
)

print('\n=== FIX 7: L4 qBank — move to index 2 ===')

fix(
    "q('There are 82 students in one class and 59 in another. How many students are there combined?',['120','141','151','100'],1,'\"Combined\" = ADD. 82+59=141.')",
    "q('There are 82 students in one class and 59 in another. How many students are there combined?',['120','151','141','100'],2,'\"Combined\" = ADD. 82+59=141.')"
)
fix(
    "q('What is the first step when solving a word problem?',['Guess the answer','Read carefully','Write numbers first','Add everything'],1,'Always read the problem carefully first!')",
    "q('What is the first step when solving a word problem?',['Guess the answer','Write numbers first','Read carefully','Add everything'],2,'Always read the problem carefully first!')"
)
fix(
    "q('The park had 175 people and 89 left. How many people are still at the park?',['76','86','50','130'],1,'\"Left\" = SUBTRACT. 175-89=86.')",
    "q('The park had 175 people and 89 left. How many people are still at the park?',['76','50','86','130'],2,'\"Left\" = SUBTRACT. 175-89=86.')"
)
fix(
    "q('What does the phrase \"in all\" mean in a math story?',['Subtract','Add','Divide','None'],1,'\"In all\" is like \"total\" \u2014 it means ADD.')",
    "q('What does the phrase \"in all\" mean in a math story?',['Subtract','Divide','Add','None'],2,'\"In all\" is like \"total\" \u2014 it means ADD.')"
)
fix(
    "q('The store had 136 apples and sold 78. How many apples are left?',['38','58','68','20'],1,'\"Sold\" = SUBTRACT. 136-78=58.')",
    "q('The store had 136 apples and sold 78. How many apples are left?',['38','68','58','20'],2,'\"Sold\" = SUBTRACT. 136-78=58.')"
)

print('\n=== FIX 7: L4 qBank — move to index 3 ===')

fix(
    "q('There are 63 boys and 74 girls at school. How many students are there altogether?',['107','137','147','90'],1,'Boys + girls = ADD. 63+74=137.')",
    "q('There are 63 boys and 74 girls at school. How many students are there altogether?',['107','147','90','137'],3,'Boys + girls = ADD. 63+74=137.')"
)
fix(
    "q('What does the word \"difference\" mean in a math problem?',['Add two numbers','Subtract to find gap','Multiply','Count on'],1,'\"Difference\" always means SUBTRACT.')",
    "q('What does the word \"difference\" mean in a math problem?',['Add two numbers','Multiply','Count on','Subtract to find gap'],3,'\"Difference\" always means SUBTRACT.')"
)
fix(
    "q('Mia has 95 stickers and gives 47 away. How many stickers does she have left?',['38','48','20','80'],1,'\"Gives\" = SUBTRACT. 95-47=48.')",
    "q('Mia has 95 stickers and gives 47 away. How many stickers does she have left?',['38','20','80','48'],3,'\"Gives\" = SUBTRACT. 95-47=48.')"
)
fix(
    "q('There are 74 pencils and 58 more pencils. How many are there altogether?',['102','132','142','90'],1,'\"Altogether\" = ADD. 74+58=132.')",
    "q('There are 74 pencils and 58 more pencils. How many are there altogether?',['102','142','90','132'],3,'\"Altogether\" = ADD. 74+58=132.')"
)
fix(
    "q('The school had 183 books and 96 were checked out. How many books are still there?',['97','87','50','130'],1,'\"Checked out\" = SUBTRACT. 183-96=87.')",
    "q('The school had 183 books and 96 were checked out. How many books are still there?',['97','50','130','87'],3,'\"Checked out\" = SUBTRACT. 183-96=87.')"
)
fix(
    "q('A book has 152 pages and Maria has read 67 pages. How many pages are left?',['75','85','55','120'],1,'152-67=85.')",
    "q('A book has 152 pages and Maria has read 67 pages. How many pages are left?',['75','55','120','85'],3,'152-67=85.')"
)
fix(
    "q('There was 27 girls, 38 boys, and 15 teachers. How many people are there in all?',['45','90','55','80'],3,'27+38+15=80 people in all.')",
    "q('There are 27 girls, 38 boys, and 15 teachers. How many people are there in all?',['45','90','55','80'],3,'27+38+15=80 people in all.')"
)

# =========================================================
# FIX 8: unitQuiz redistribution
# After L3 cascades (2056→0, 2059→3): [1,26,2,1]
# Target [7,7,8,8]: move 6→0, 6→2, 7→3 from index 1
# unitQuiz strings are unique (different explanations)
# =========================================================
print('\n=== FIX 8: unitQuiz — move to index 0 ===')

fix(
    "q('What is 73 \u2212 28?',['30','45','55','10'],1,'Borrow:13-8=5, 6-2=4. Answer 45.')",
    "q('What is 73 \u2212 28?',['45','30','55','10'],0,'Borrow:13-8=5, 6-2=4. Answer 45.')"
)
fix(
    "q('A student had 85 stickers and gave away 37. How many stickers are left?',['38','48','20','80'],1,'85-37=48.')",
    "q('A student had 85 stickers and gave away 37. How many stickers are left?',['48','38','20','80'],0,'85-37=48.')"
)
fix(
    "q('What is 100 \u2212 63?',['47','37','20','80'],1,'100-63=37.')",
    "q('What is 100 \u2212 63?',['37','47','20','80'],0,'100-63=37.')"
)
fix(
    "q('What is 35 + 48?',['56','83','93','40'],1,'5+8=13,carry 1. 3+4+1=8. Answer 83.')",
    "q('What is 35 + 48?',['83','56','93','40'],0,'5+8=13,carry 1. 3+4+1=8. Answer 83.')"
)
fix(
    "q('What is 200 \u2212 76?',['104','124','134','90'],1,'200-76=124.')",
    "q('What is 200 \u2212 76?',['124','104','134','90'],0,'200-76=124.')"
)
fix(
    "q('What is 150 \u2212 63?',['97','87','50','130'],1,'150-63=87.')",
    "q('What is 150 \u2212 63?',['87','97','50','130'],0,'150-63=87.')"
)

print('\n=== FIX 8: unitQuiz — move to index 2 ===')

fix(
    "q('What is 47 + 36?',['56','83','93','40'],1,'7+6=13,carry 1. 4+3+1=8. Answer 83.')",
    "q('What is 47 + 36?',['56','93','83','40'],2,'7+6=13,carry 1. 4+3+1=8. Answer 83.')"
)
fix(
    "q('What is 91 \u2212 47?',['54','44','30','80'],1,'Borrow:11-7=4, 8-4=4. Answer 44.')",
    "q('What is 91 \u2212 47?',['54','30','44','80'],2,'Borrow:11-7=4, 8-4=4. Answer 44.')"
)
fix(
    "q('What is 84 \u2212 37?',['57','47','20','90'],1,'Borrow:14-7=7, 7-3=4. Answer 47.')",
    "q('What is 84 \u2212 37?',['57','20','47','90'],2,'Borrow:14-7=7, 7-3=4. Answer 47.')"
)
fix(
    "q('What is the missing number? 67 + ___ = 100',['23','33','50','60'],1,'100-67=33.')",
    "q('What is the missing number? 67 + ___ = 100',['23','50','33','60'],2,'100-67=33.')"
)
fix(
    "q('What is 23 + 14 + 36?',['52','73','86','41'],1,'23+14=37, 37+36=73.')",
    "q('What is 23 + 14 + 36?',['52','86','73','41'],2,'23+14=37, 37+36=73.')"
)
fix(
    "q('What is 42 + 39?',['70','81','91','50'],1,'2+9=11,carry 1. 4+3+1=8. Answer 81.')",
    "q('What is 42 + 39?',['70','91','81','50'],2,'2+9=11,carry 1. 4+3+1=8. Answer 81.')"
)

print('\n=== FIX 8: unitQuiz — move to index 3 ===')

fix(
    "q('What is 58 + 27?',['70','85','95','50'],1,'8+7=15,carry 1. 5+2+1=8. Answer 85.')",
    "q('What is 58 + 27?',['70','95','50','85'],3,'8+7=15,carry 1. 5+2+1=8. Answer 85.')"
)
fix(
    "q('What is 62 + 79?',['120','141','151','100'],1,'2+9=11,carry 1. 6+7+1=14. Answer 141.')",
    "q('What is 62 + 79?',['120','151','100','141'],3,'2+9=11,carry 1. 6+7+1=14. Answer 141.')"
)
fix(
    "q('What is 56 + 78?',['104','134','144','90'],1,'6+8=14,carry 1. 5+7+1=13. Answer 134.')",
    "q('What is 56 + 78?',['104','144','90','134'],3,'6+8=14,carry 1. 5+7+1=13. Answer 134.')"
)
fix(
    "q('What is 143 + 68?',['190','211','221','170'],1,'3+8=11,carry 1. 4+6+1=11,carry 1. 1+1+1=3. Answer 211.')",
    "q('What is 143 + 68?',['190','221','170','211'],3,'3+8=11,carry 1. 4+6+1=11,carry 1. 1+1+1=3. Answer 211.')"
)
fix(
    "q('What is 19 + 13 + 7?',['26','39','51','63'],1,'19+13=32, 32+7=39.')",
    "q('What is 19 + 13 + 7?',['26','51','63','39'],3,'19+13=32, 32+7=39.')"
)
fix(
    "q('What is 178 \u2212 94?',['94','84','50','130'],1,'178-94=84.')",
    "q('What is 178 \u2212 94?',['94','50','130','84'],3,'178-94=84.')"
)
fix(
    "q('What is 65 + 58?',['103','123','133','90'],1,'5+8=13,carry 1. 6+5+1=12. Answer 123.')",
    "q('What is 65 + 58?',['103','133','90','123'],3,'5+8=13,carry 1. 6+5+1=12. Answer 123.')"
)

# =========================================================
# FIX 9: Bump SW cache version
# =========================================================
print('\n=== FIX 9: Bump SW cache version ===')
fix(
    "const CACHE = 'math-workbook-v5.46u2fixes';",
    "const CACHE = 'math-workbook-v5.47u3fixes';"
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
