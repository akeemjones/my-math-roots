#!/usr/bin/env python3
"""Fix all Unit 4 issues: answer redistribution + explanation cleanup."""
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
# FIX 1: unitQuiz line 2373 — clean "Wait — recheck" + move 0→1
# [8,6,8,8] → [7,7,8,8]
# Unique to unitQuiz (not in testBank)
# =========================================================
print('\n=== FIX 1: unitQuiz 432−256 cleanup + move to index 1 ===')
fix(
    "q('What is 432 \u2212 256?',['176','104','234','315'],0,'Ones: 2 is less than 6, so borrow to get 12 \u2212 6 = 6. Tens: 2 is less than 5, so borrow to get 12 \u2212 5 = 7. Wait \u2014 recheck: 432 \u2212 256 = 176. Work carefully column by column.')",
    "q('What is 432 \u2212 256?',['104','176','234','315'],1,'Ones: 2 < 6, borrow \u2192 12\u22126=6. Tens: 2 < 5, borrow \u2192 12\u22125=7. Hundreds: 3\u22122=1. Answer: 176.')"
)

# =========================================================
# FIX 2: L1 qBank redistribution [5,23,1,1] → [8,7,8,7]
# Move 3→0, 7→2, 6→3 from index 1
# All cascade to testBank (2x each)
# =========================================================
print('\n=== FIX 2: L1 qBank — move to index 0 ===')

fix(
    "q('What is 381 + 249?',['573','630','681','742'],1,'Add the ones first: 1 + 9 = 10, write 0 and carry 1. Then tens: 8 + 4 + 1 = 13, write 3 and carry 1. Then hundreds: 3 + 2 + 1 = 6.')",
    "q('What is 381 + 249?',['630','573','681','742'],0,'Add the ones first: 1 + 9 = 10, write 0 and carry 1. Then tens: 8 + 4 + 1 = 13, write 3 and carry 1. Then hundreds: 3 + 2 + 1 = 6.')"
)
fix(
    "q('What is 648 + 175?',['764','823','871','912'],1,'Add the ones first: 8 + 5 = 13, write 3 and carry 1. Then tens: 4 + 7 + 1 = 12, write 2 and carry 1. Then hundreds: 6 + 1 + 1 = 8.')",
    "q('What is 648 + 175?',['823','764','871','912'],0,'Add the ones first: 8 + 5 = 13, write 3 and carry 1. Then tens: 4 + 7 + 1 = 12, write 2 and carry 1. Then hundreds: 6 + 1 + 1 = 8.')"
)
fix(
    "q('What is 174 + 368?',['471','542','583','624'],1,'Add the ones first: 4 + 8 = 12, write 2 and carry 1. Then tens: 7 + 6 + 1 = 14, write 4 and carry 1. Then hundreds: 1 + 3 + 1 = 5.')",
    "q('What is 174 + 368?',['542','471','583','624'],0,'Add the ones first: 4 + 8 = 12, write 2 and carry 1. Then tens: 7 + 6 + 1 = 14, write 4 and carry 1. Then hundreds: 1 + 3 + 1 = 5.')"
)

print('\n=== FIX 2: L1 qBank — move to index 2 ===')

fix(
    "q('What is 475 + 356?',['763','831','872','914'],1,'Add the ones first: 5 + 6 = 11, write 1 and carry 1. Then tens: 7 + 5 + 1 = 13, write 3 and carry 1. Then hundreds: 4 + 3 + 1 = 8.')",
    "q('What is 475 + 356?',['763','872','831','914'],2,'Add the ones first: 5 + 6 = 11, write 1 and carry 1. Then tens: 7 + 5 + 1 = 13, write 3 and carry 1. Then hundreds: 4 + 3 + 1 = 8.')"
)
fix(
    "q('What is 629 + 183?',['751','812','873','934'],1,'Add the ones first: 9 + 3 = 12, write 2 and carry 1. Then tens: 2 + 8 + 1 = 11, write 1 and carry 1. Then hundreds: 6 + 1 + 1 = 8.')",
    "q('What is 629 + 183?',['751','873','812','934'],2,'Add the ones first: 9 + 3 = 12, write 2 and carry 1. Then tens: 2 + 8 + 1 = 11, write 1 and carry 1. Then hundreds: 6 + 1 + 1 = 8.')"
)
fix(
    "q('What is 157 + 468?',['571','625','673','814'],1,'Add the ones first: 7 + 8 = 15, write 5 and carry 1. Then tens: 5 + 6 + 1 = 12, write 2 and carry 1. Then hundreds: 1 + 4 + 1 = 6.')",
    "q('What is 157 + 468?',['571','673','625','814'],2,'Add the ones first: 7 + 8 = 15, write 5 and carry 1. Then tens: 5 + 6 + 1 = 12, write 2 and carry 1. Then hundreds: 1 + 4 + 1 = 6.')"
)
fix(
    "q('What is 362 + 479?',['763','841','892','914'],1,'Add the ones first: 2 + 9 = 11, write 1 and carry 1. Then tens: 6 + 7 + 1 = 14, write 4 and carry 1. Then hundreds: 3 + 4 + 1 = 8.')",
    "q('What is 362 + 479?',['763','892','841','914'],2,'Add the ones first: 2 + 9 = 11, write 1 and carry 1. Then tens: 6 + 7 + 1 = 14, write 4 and carry 1. Then hundreds: 3 + 4 + 1 = 8.')"
)
fix(
    "q('What is 793 + 148?',['873','941','982','1014'],1,'Add the ones first: 3 + 8 = 11, write 1 and carry 1. Then tens: 9 + 4 + 1 = 14, write 4 and carry 1. Then hundreds: 7 + 1 + 1 = 9.')",
    "q('What is 793 + 148?',['873','982','941','1014'],2,'Add the ones first: 3 + 8 = 11, write 1 and carry 1. Then tens: 9 + 4 + 1 = 14, write 4 and carry 1. Then hundreds: 7 + 1 + 1 = 9.')"
)
fix(
    "q('What is 456 + 289?',['671','745','793','814'],1,'Add the ones first: 6 + 9 = 15, write 5 and carry 1. Then tens: 5 + 8 + 1 = 14, write 4 and carry 1. Then hundreds: 4 + 2 + 1 = 7.')",
    "q('What is 456 + 289?',['671','793','745','814'],2,'Add the ones first: 6 + 9 = 15, write 5 and carry 1. Then tens: 5 + 8 + 1 = 14, write 4 and carry 1. Then hundreds: 4 + 2 + 1 = 7.')"
)
fix(
    "q('Which addition problem requires regrouping twice?',['123+456','247+368','301+408','211+353'],1,'In 247 + 368, the ones give 7 + 8 = 15 (regroup!), and the tens give 4 + 6 + 1 = 11 (regroup again!). That is two regroupings!')",
    "q('Which addition problem requires regrouping twice?',['123+456','301+408','247+368','211+353'],2,'In 247 + 368, the ones give 7 + 8 = 15 (regroup!), and the tens give 4 + 6 + 1 = 11 (regroup again!). That is two regroupings!')"
)

print('\n=== FIX 2: L1 qBank — move to index 3 ===')

fix(
    "q('What is 539 + 283?',['751','822','873','934'],1,'Add the ones first: 9 + 3 = 12, write 2 and carry 1. Then tens: 3 + 8 + 1 = 12, write 2 and carry 1. Then hundreds: 5 + 2 + 1 = 8.')",
    "q('What is 539 + 283?',['751','873','934','822'],3,'Add the ones first: 9 + 3 = 12, write 2 and carry 1. Then tens: 3 + 8 + 1 = 12, write 2 and carry 1. Then hundreds: 5 + 2 + 1 = 8.')"
)
fix(
    "q('What is 427 + 396?',['761','823','874','915'],1,'Add the ones first: 7 + 6 = 13, write 3 and carry 1. Then tens: 2 + 9 + 1 = 12, write 2 and carry 1. Then hundreds: 4 + 3 + 1 = 8.')",
    "q('What is 427 + 396?',['761','874','915','823'],3,'Add the ones first: 7 + 6 = 13, write 3 and carry 1. Then tens: 2 + 9 + 1 = 12, write 2 and carry 1. Then hundreds: 4 + 3 + 1 = 8.')"
)
fix(
    "q('What is 685 + 237?',['851','922','973','1034'],1,'Add the ones first: 5 + 7 = 12, write 2 and carry 1. Then tens: 8 + 3 + 1 = 12, write 2 and carry 1. Then hundreds: 6 + 2 + 1 = 9.')",
    "q('What is 685 + 237?',['851','973','1034','922'],3,'Add the ones first: 5 + 7 = 12, write 2 and carry 1. Then tens: 8 + 3 + 1 = 12, write 2 and carry 1. Then hundreds: 6 + 2 + 1 = 9.')"
)
fix(
    "q('What is 352 + 179?',['463','531','582','614'],1,'Add the ones first: 2 + 9 = 11, write 1 and carry 1. Then tens: 5 + 7 + 1 = 13, write 3 and carry 1. Then hundreds: 3 + 1 + 1 = 5.')",
    "q('What is 352 + 179?',['463','582','614','531'],3,'Add the ones first: 2 + 9 = 11, write 1 and carry 1. Then tens: 5 + 7 + 1 = 13, write 3 and carry 1. Then hundreds: 3 + 1 + 1 = 5.')"
)
fix(
    "q('What is 463 + 258?',['653','721','782','814'],1,'Add the ones first: 3 + 8 = 11, write 1 and carry 1. Then tens: 6 + 5 + 1 = 12, write 2 and carry 1. Then hundreds: 4 + 2 + 1 = 7.')",
    "q('What is 463 + 258?',['653','782','814','721'],3,'Add the ones first: 3 + 8 = 11, write 1 and carry 1. Then tens: 6 + 5 + 1 = 12, write 2 and carry 1. Then hundreds: 4 + 2 + 1 = 7.')"
)
fix(
    "q('What is 871 + 254?',['1053','1125','1186','1214'],1,'Add the ones first: 1 + 4 = 5. Then tens: 7 + 5 = 12, write 2 and carry 1. Then hundreds: 8 + 2 + 1 = 11.')",
    "q('What is 871 + 254?',['1053','1186','1214','1125'],3,'Add the ones first: 1 + 4 = 5. Then tens: 7 + 5 = 12, write 2 and carry 1. Then hundreds: 8 + 2 + 1 = 11.')"
)

# =========================================================
# FIX 3: L2 qBank redistribution [4,20,1,5] → [7,7,8,8]
# Move 3→0, 7→2, 3→3 from index 1
# All cascade to testBank (2x each)
# =========================================================
print('\n=== FIX 3: L2 qBank — move to index 0 ===')

fix(
    "q('What is 600 \u2212 245?',['283','355','412','521'],1,'The ones and tens are both 0, so you need to borrow from the hundreds first. This gives you 5 hundreds, 9 tens, and 10 ones to work with. The answer is 355.')",
    "q('What is 600 \u2212 245?',['355','283','412','521'],0,'The ones and tens are both 0, so you need to borrow from the hundreds first. This gives you 5 hundreds, 9 tens, and 10 ones to work with. The answer is 355.')"
)
fix(
    "q('What is 517 \u2212 249?',['193','268','315','442'],1,'Ones: 7 is less than 9, so borrow to get 17 \u2212 9 = 8. Tens: after borrowing, 0 is less than 4, so borrow again to get 10 \u2212 4 = 6. Hundreds: 4 \u2212 2 = 2. The answer is 268.')",
    "q('What is 517 \u2212 249?',['268','193','315','442'],0,'Ones: 7 is less than 9, so borrow to get 17 \u2212 9 = 8. Tens: after borrowing, 0 is less than 4, so borrow again to get 10 \u2212 4 = 6. Hundreds: 4 \u2212 2 = 2. The answer is 268.')"
)
fix(
    "q('What is 500 \u2212 183?',['244','317','383','452'],1,'Both the ones and tens are 0, so you must borrow from the hundreds first, then borrow again for the ones. The answer is 317.')",
    "q('What is 500 \u2212 183?',['317','244','383','452'],0,'Both the ones and tens are 0, so you must borrow from the hundreds first, then borrow again for the ones. The answer is 317.')"
)

print('\n=== FIX 3: L2 qBank — move to index 2 ===')

fix(
    "q('What is 846 \u2212 279?',['493','567','624','712'],1,'Ones: 6 is less than 9, so borrow to get 16 \u2212 9 = 7. Tens: 3 is less than 7, so borrow to get 13 \u2212 7 = 6. Hundreds: 7 \u2212 2 = 5. The answer is 567.')",
    "q('What is 846 \u2212 279?',['493','624','567','712'],2,'Ones: 6 is less than 9, so borrow to get 16 \u2212 9 = 7. Tens: 3 is less than 7, so borrow to get 13 \u2212 7 = 6. Hundreds: 7 \u2212 2 = 5. The answer is 567.')"
)
fix(
    "q('What is 963 \u2212 487?',['394','476','531','623'],1,'Ones: 3 is less than 7, so borrow to get 13 \u2212 7 = 6. Tens: 5 is less than 8, so borrow to get 15 \u2212 8 = 7. Hundreds: 8 \u2212 4 = 4. The answer is 476.')",
    "q('What is 963 \u2212 487?',['394','531','476','623'],2,'Ones: 3 is less than 7, so borrow to get 13 \u2212 7 = 6. Tens: 5 is less than 8, so borrow to get 15 \u2212 8 = 7. Hundreds: 8 \u2212 4 = 4. The answer is 476.')"
)
fix(
    "q('What is 720 \u2212 354?',['293','366','421','512'],1,'Ones: 0 is less than 4, so borrow to get 10 \u2212 4 = 6. Tens: 1 is less than 5, so borrow to get 11 \u2212 5 = 6. Hundreds: 6 \u2212 3 = 3. The answer is 366.')",
    "q('What is 720 \u2212 354?',['293','421','366','512'],2,'Ones: 0 is less than 4, so borrow to get 10 \u2212 4 = 6. Tens: 1 is less than 5, so borrow to get 11 \u2212 5 = 6. Hundreds: 6 \u2212 3 = 3. The answer is 366.')"
)
fix(
    "q('Why is borrowing across a zero tricky?',['Nothing, zeros are easy','Must borrow from hundreds first','Skip the zero','Just subtract 0'],1,'When the tens digit is 0, there is nothing to borrow there! You must first borrow from the hundreds column, then pass that value along to the ones.')",
    "q('Why is borrowing across a zero tricky?',['Nothing, zeros are easy','Skip the zero','Must borrow from hundreds first','Just subtract 0'],2,'When the tens digit is 0, there is nothing to borrow there! You must first borrow from the hundreds column, then pass that value along to the ones.')"
)
fix(
    "q('What is 831 \u2212 467?',['281','364','423','512'],1,'Ones: 1 is less than 7, so borrow to get 11 \u2212 7 = 4. Tens: 2 is less than 6, so borrow to get 12 \u2212 6 = 6. Hundreds: 7 \u2212 4 = 3. The answer is 364.')",
    "q('What is 831 \u2212 467?',['281','423','364','512'],2,'Ones: 1 is less than 7, so borrow to get 11 \u2212 7 = 4. Tens: 2 is less than 6, so borrow to get 12 \u2212 6 = 6. Hundreds: 7 \u2212 4 = 3. The answer is 364.')"
)
fix(
    "q('What is 600 \u2212 342?',['185','258','324','413'],1,'The ones and tens are both 0, so borrow from the hundreds first. Work through each column carefully. The answer is 258.')",
    "q('What is 600 \u2212 342?',['185','324','258','413'],2,'The ones and tens are both 0, so borrow from the hundreds first. Work through each column carefully. The answer is 258.')"
)
fix(
    "q('What is 583 \u2212 296?',['216','287','354','423'],1,'Ones: 3 is less than 6, so borrow to get 13 \u2212 6 = 7. Tens: 7 is less than 9, so borrow to get 17 \u2212 9 = 8. Hundreds: 4 \u2212 2 = 2. The answer is 287.')",
    "q('What is 583 \u2212 296?',['216','354','287','423'],2,'Ones: 3 is less than 6, so borrow to get 13 \u2212 6 = 7. Tens: 7 is less than 9, so borrow to get 17 \u2212 9 = 8. Hundreds: 4 \u2212 2 = 2. The answer is 287.')"
)

print('\n=== FIX 3: L2 qBank — move to index 3 ===')

fix(
    "q('What is 700 \u2212 258?',['374','442','513','621'],1,'Both the ones and tens are 0, so you must borrow from the hundreds first, then borrow again for each column. The answer is 442.')",
    "q('What is 700 \u2212 258?',['374','513','621','442'],3,'Both the ones and tens are 0, so you must borrow from the hundreds first, then borrow again for each column. The answer is 442.')"
)
fix(
    "q('What is 472 \u2212 185?',['213','287','354','421'],1,'Ones: 2 is less than 5, so borrow to get 12 \u2212 5 = 7. Tens: 6 is less than 8, so borrow to get 16 \u2212 8 = 8. Hundreds: 3 \u2212 1 = 2. The answer is 287.')",
    "q('What is 472 \u2212 185?',['213','354','421','287'],3,'Ones: 2 is less than 5, so borrow to get 12 \u2212 5 = 7. Tens: 6 is less than 8, so borrow to get 16 \u2212 8 = 8. Hundreds: 3 \u2212 1 = 2. The answer is 287.')"
)
fix(
    "q('What is 635 \u2212 178?',['384','457','513','621'],1,'Ones: 5 is less than 8, so borrow to get 15 \u2212 8 = 7. Tens: 2 is less than 7, so borrow to get 12 \u2212 7 = 5. Hundreds: 5 \u2212 1 = 4. The answer is 457.')",
    "q('What is 635 \u2212 178?',['384','513','621','457'],3,'Ones: 5 is less than 8, so borrow to get 15 \u2212 8 = 7. Tens: 2 is less than 7, so borrow to get 12 \u2212 7 = 5. Hundreds: 5 \u2212 1 = 4. The answer is 457.')"
)

# =========================================================
# FIX 4: L3 qBank redistribution [3,25,0,2] → [7,7,9,7]
# Move 4→0, 9→2, 5→3 from index 1
# All cascade to testBank (2x each, 274 rounded cascades 3x)
# =========================================================
print('\n=== FIX 4: L3 qBank — move to index 0 ===')

# 274 rounded appears 3x (qBank + testBank mirror + testBank additional)
fix(
    "q('What is 274 rounded to the nearest hundred?',['200','300','270','280'],1,'Look at the tens digit. It is 7, which is 5 or more, so round UP to 300.')",
    "q('What is 274 rounded to the nearest hundred?',['300','200','270','280'],0,'Look at the tens digit. It is 7, which is 5 or more, so round UP to 300.')"
)
fix(
    "q('What is the best estimate for 312 + 489? (Round to the nearest hundred first.)',['700','800','900','600'],1,'312 rounds to 300, and 489 rounds to 500. Then 300 + 500 = 800.')",
    "q('What is the best estimate for 312 + 489? (Round to the nearest hundred first.)',['800','700','900','600'],0,'312 rounds to 300, and 489 rounds to 500. Then 300 + 500 = 800.')"
)
fix(
    "q('What is 78 rounded to the nearest ten?',['70','80','75','79'],1,'Look at the ones digit. It is 8, which is 5 or more, so round UP to 80.')",
    "q('What is 78 rounded to the nearest ten?',['80','70','75','79'],0,'Look at the ones digit. It is 8, which is 5 or more, so round UP to 80.')"
)
fix(
    "q('What is the best estimate for 589 \u2212 213? (Round to the nearest hundred first.)',['300','400','500','600'],1,'589 rounds to 600, and 213 rounds to 200. Then 600 \u2212 200 = 400.')",
    "q('What is the best estimate for 589 \u2212 213? (Round to the nearest hundred first.)',['400','300','500','600'],0,'589 rounds to 600, and 213 rounds to 200. Then 600 \u2212 200 = 400.')"
)

print('\n=== FIX 4: L3 qBank — move to index 2 ===')

fix(
    "q('What is 435 rounded to the nearest ten?',['430','440','400','500'],1,'Look at the ones digit. It is 5, which is 5 or more, so round UP to 440.')",
    "q('What is 435 rounded to the nearest ten?',['430','400','440','500'],2,'Look at the ones digit. It is 5, which is 5 or more, so round UP to 440.')"
)
fix(
    "q('What is 765 rounded to the nearest hundred?',['700','800','760','770'],1,'Look at the tens digit. It is 6, which is 5 or more, so round UP to 800.')",
    "q('What is 765 rounded to the nearest hundred?',['700','760','800','770'],2,'Look at the tens digit. It is 6, which is 5 or more, so round UP to 800.')"
)
fix(
    "q('What is the best estimate for 638 \u2212 192? (Round to the nearest hundred first.)',['300','400','500','600'],1,'638 rounds to 600, and 192 rounds to 200. Then 600 \u2212 200 = 400.')",
    "q('What is the best estimate for 638 \u2212 192? (Round to the nearest hundred first.)',['300','500','400','600'],2,'638 rounds to 600, and 192 rounds to 200. Then 600 \u2212 200 = 400.')"
)
fix(
    "q('What is 523 rounded to the nearest hundred?',['400','500','520','530'],1,'Look at the tens digit. It is 2, which is less than 5, so round DOWN to 500.')",
    "q('What is 523 rounded to the nearest hundred?',['400','520','500','530'],2,'Look at the tens digit. It is 2, which is less than 5, so round DOWN to 500.')"
)
fix(
    "q('What is the best estimate for 247 + 381? (Round to the nearest hundred first.)',['500','600','700','800'],1,'247 rounds to 200, and 381 rounds to 400. Then 200 + 400 = 600.')",
    "q('What is the best estimate for 247 + 381? (Round to the nearest hundred first.)',['500','700','600','800'],2,'247 rounds to 200, and 381 rounds to 400. Then 200 + 400 = 600.')"
)
fix(
    "q('What is 450 rounded to the nearest hundred?',['400','500','450','460'],1,'Look at the tens digit. It is 5, which is 5 or more, so round UP to 500.')",
    "q('What is 450 rounded to the nearest hundred?',['400','450','500','460'],2,'Look at the tens digit. It is 5, which is 5 or more, so round UP to 500.')"
)
fix(
    "q('What is 650 rounded to the nearest hundred?',['600','700','650','660'],1,'Look at the tens digit. It is 5, which is 5 or more, so round UP to 700.')",
    "q('What is 650 rounded to the nearest hundred?',['600','650','700','660'],2,'Look at the tens digit. It is 5, which is 5 or more, so round UP to 700.')"
)
fix(
    "q('What is the best estimate for 491 + 308? (Round to the nearest hundred first.)',['700','800','900','600'],1,'491 rounds to 500, and 308 rounds to 300. Then 500 + 300 = 800.')",
    "q('What is the best estimate for 491 + 308? (Round to the nearest hundred first.)',['700','900','800','600'],2,'491 rounds to 500, and 308 rounds to 300. Then 500 + 300 = 800.')"
)
fix(
    "q('What is 155 rounded to the nearest hundred?',['100','200','150','160'],1,'Look at the tens digit. It is 5, which is 5 or more, so round UP to 200.')",
    "q('What is 155 rounded to the nearest hundred?',['100','150','200','160'],2,'Look at the tens digit. It is 5, which is 5 or more, so round UP to 200.')"
)

print('\n=== FIX 4: L3 qBank — move to index 3 ===')

fix(
    "q('What is 67 rounded to the nearest ten?',['60','70','65','68'],1,'Look at the ones digit. It is 7, which is 5 or more, so round UP to 70.')",
    "q('What is 67 rounded to the nearest ten?',['60','65','68','70'],3,'Look at the ones digit. It is 7, which is 5 or more, so round UP to 70.')"
)
fix(
    "q('What is the best estimate for 723 \u2212 398? (Round to the nearest hundred first.)',['200','300','400','500'],1,'723 rounds to 700, and 398 rounds to 400. Then 700 \u2212 400 = 300.')",
    "q('What is the best estimate for 723 \u2212 398? (Round to the nearest hundred first.)',['200','400','500','300'],3,'723 rounds to 700, and 398 rounds to 400. Then 700 \u2212 400 = 300.')"
)
fix(
    "q('What is 249 rounded to the nearest hundred?',['100','200','240','250'],1,'Look at the tens digit. It is 4, which is less than 5, so round DOWN to 200.')",
    "q('What is 249 rounded to the nearest hundred?',['100','240','250','200'],3,'Look at the tens digit. It is 4, which is less than 5, so round DOWN to 200.')"
)
fix(
    "q('What is 95 rounded to the nearest ten?',['90','100','94','96'],1,'Look at the ones digit. It is 5, which is 5 or more, so round UP to 100.')",
    "q('What is 95 rounded to the nearest ten?',['90','94','96','100'],3,'Look at the ones digit. It is 5, which is 5 or more, so round UP to 100.')"
)
fix(
    "q('What is the best estimate for 563 + 418? (Round to the nearest hundred first.)',['900','1000','800','700'],1,'563 rounds to 600, and 418 rounds to 400. Then 600 + 400 = 1000.')",
    "q('What is the best estimate for 563 + 418? (Round to the nearest hundred first.)',['900','800','700','1000'],3,'563 rounds to 600, and 418 rounds to 400. Then 600 + 400 = 1000.')"
)

# =========================================================
# FIX 5: Bump SW cache version
# =========================================================
print('\n=== FIX 5: Bump SW cache version ===')
fix(
    "const CACHE = 'math-workbook-v5.47u3fixes';",
    "const CACHE = 'math-workbook-v5.48u4fixes';"
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
