#!/usr/bin/env python3
"""Fix Unit 5 answer distribution issues. No index 0 or 3 in L3/L4 qBanks; heavy index 2 in L1 quiz."""
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
# SECTION 1: U5L1 qBank — fix index-2 heavy (0=4,1=7,2=14,3=5 → 7,8,8,7)
# Move 3 from idx2→0, 1 from idx2→1, 3 from idx2→3
# =========================================================
print('\n=== SECTION 1: U5L1 qBank redistribution ===')

# idx 2 → 0
fix(
    "q('How many quarters equal $1.00?',['2','3','4','5'],2,'4 quarters × 25¢ = 100¢.')",
    "q('How many quarters equal $1.00?',['4','2','3','5'],0,'4 quarters × 25¢ = 100¢.')"
)
fix(
    "q('Which coin is the smallest in size?',['Penny','Nickel','Dime','Quarter'],2,'Even though it is worth 10 cents, the dime is the smallest coin.')",
    "q('Which coin is the smallest in size?',['Dime','Penny','Nickel','Quarter'],0,'Even though it is worth 10 cents, the dime is the smallest coin.')"
)
# cascades to quiz L2481 and testBank L2750
fix(
    "q('Which coin has Abraham Lincoln on it?',['Nickel','Dime','Penny','Quarter'],2,'Abraham Lincoln is on the penny (1 cent).')",
    "q('Which coin has Abraham Lincoln on it?',['Penny','Nickel','Dime','Quarter'],0,'Abraham Lincoln is on the penny (1 cent).')"
)

# idx 2 → 1
fix(
    "q('How many pennies equal one dime?',['5','8','10','15'],2,'10 pennies = 1 dime.')",
    "q('How many pennies equal one dime?',['5','10','8','15'],1,'10 pennies = 1 dime.')"
)

# idx 2 → 3
fix(
    "q('How many dimes equal $1.00?',['5','8','10','20'],2,'10 dimes × 10¢ = 100¢.')",
    "q('How many dimes equal $1.00?',['5','8','20','10'],3,'10 dimes × 10¢ = 100¢.')"
)
fix(
    "q('How many nickels equal one quarter?',['3','4','5','6'],2,'5 nickels × 5¢ = 25¢.')",
    "q('How many nickels equal one quarter?',['3','4','6','5'],3,'5 nickels × 5¢ = 25¢.')"
)
fix(
    "q('How many pennies equal one quarter?',['15','20','25','30'],2,'25 pennies = 1 quarter.')",
    "q('How many pennies equal one quarter?',['15','20','30','25'],3,'25 pennies = 1 quarter.')"
)

# =========================================================
# SECTION 2: U5L1 quiz — fix 5/7 at index 2 (unique strings, no cascade risk)
# =========================================================
print('\n=== SECTION 2: U5L1 quiz redistribution ===')

fix(
    "q('How many dimes make $1.00?',['5','8','10','20'],2,'10 dimes × 10¢ = 100¢ = $1.00.')",
    "q('How many dimes make $1.00?',['5','8','20','10'],3,'10 dimes × 10¢ = 100¢ = $1.00.')"
)
fix(
    "q('How many quarters make $1.00?',['2','3','4','5'],2,'4 quarters × 25¢ = 100¢ = $1.00.')",
    "q('How many quarters make $1.00?',['4','2','3','5'],0,'4 quarters × 25¢ = 100¢ = $1.00.')"
)
fix(
    "q('How many nickels make 25 cents?',['3','4','5','6'],2,'5 nickels × 5¢ = 25¢.')",
    "q('How many nickels make 25 cents?',['3','5','4','6'],1,'5 nickels × 5¢ = 25¢.')"
)

# =========================================================
# SECTION 3: U5L3 qBank — CRITICAL: zero index 0 or 3 (0=0,1=18,2=12,3=0 → 8,6,8,8)
# Move 8 from idx1→0, 4 from idx1→3, 4 from idx2→3
# Many cascade to quiz and testBank
# =========================================================
print('\n=== SECTION 3: U5L3 qBank — add index 0 and 3 ===')

# idx 1 → 0
fix(
    "q('What is $0.75 + $0.50?',['$1.10','$1.25','$1.35','$1.50'],1,'75\u00a2 + 50\u00a2 = 125\u00a2 = $1.25.')",
    "q('What is $0.75 + $0.50?',['$1.25','$1.10','$1.35','$1.50'],0,'75\u00a2 + 50\u00a2 = 125\u00a2 = $1.25.')"
)
fix(
    "q('How many cents are in $2.00?',['20','200','2000','20000'],1,'$2.00 = 2 \u00d7 100 cents = 200 cents.')",
    "q('How many cents are in $2.00?',['200','20','2000','20000'],0,'$2.00 = 2 \u00d7 100 cents = 200 cents.')"
)
fix(
    "q('How do you write \u201cone dollar and seven cents\u201d as a number?',['$1.70','$1.07','$17.00','$0.17'],1,'One dollar and seven cents = $1.07. The zero holds the tens place!')",
    "q('How do you write \u201cone dollar and seven cents\u201d as a number?',['$1.07','$1.70','$17.00','$0.17'],0,'One dollar and seven cents = $1.07. The zero holds the tens place!')"
)
fix(
    "q('How many cents are in $0.50?',['5','50','500','5000'],1,'$0.50 = 50 cents.')",
    "q('How many cents are in $0.50?',['50','5','500','5000'],0,'$0.50 = 50 cents.')"
)
fix(
    "q('What is $5.00 \u2212 $2.35?',['$2.55','$2.65','$2.75','$3.15'],1,'$5.00 \u2212 $2.35 = $2.65.')",
    "q('What is $5.00 \u2212 $2.35?',['$2.65','$2.55','$2.75','$3.15'],0,'$5.00 \u2212 $2.35 = $2.65.')"
)
fix(
    "q('What is $1.99 + $0.01?',['$1.99','$2.00','$2.01','$2.10'],1,'$1.99 + $0.01 = $2.00 exactly!')",
    "q('What is $1.99 + $0.01?',['$2.00','$1.99','$2.01','$2.10'],0,'$1.99 + $0.01 = $2.00 exactly!')"
)
fix(
    "q('How many cents are in $3.00?',['30','300','3000','30000'],1,'$3.00 = 3 \u00d7 100 cents = 300 cents.')",
    "q('How many cents are in $3.00?',['300','30','3000','30000'],0,'$3.00 = 3 \u00d7 100 cents = 300 cents.')"
)
fix(
    "q('What is $0.99 + $0.01?',['$0.99','$1.00','$1.01','$1.10'],1,'99\u00a2 + 1\u00a2 = 100\u00a2 = $1.00 exactly!')",
    "q('What is $0.99 + $0.01?',['$1.00','$0.99','$1.01','$1.10'],0,'99\u00a2 + 1\u00a2 = 100\u00a2 = $1.00 exactly!')"
)

# idx 1 → 3
fix(
    "q('Which amount is greater: $1.47 or $1.74?',['$1.47','$1.74','Equal','Cannot tell'],1,'Same dollar amount, so compare the cents: 47\u00a2 < 74\u00a2, so $1.74 is more.')",
    "q('Which amount is greater: $1.47 or $1.74?',['$1.47','Equal','Cannot tell','$1.74'],3,'Same dollar amount, so compare the cents: 47\u00a2 < 74\u00a2, so $1.74 is more.')"
)
fix(
    "q('Which amount is greater: $4.09 or $4.90?',['$4.09','$4.90','Equal','Cannot tell'],1,'Same dollars, so compare cents: 9\u00a2 < 90\u00a2, so $4.90 is more.')",
    "q('Which amount is greater: $4.09 or $4.90?',['$4.09','Equal','Cannot tell','$4.90'],3,'Same dollars, so compare cents: 9\u00a2 < 90\u00a2, so $4.90 is more.')"
)
fix(
    "q('What is $2.00 \u2212 $1.50?',['$0.25','$0.50','$0.75','$1.00'],1,'$2.00 \u2212 $1.50 = $0.50.')",
    "q('What is $2.00 \u2212 $1.50?',['$0.25','$0.75','$1.00','$0.50'],3,'$2.00 \u2212 $1.50 = $0.50.')"
)
fix(
    "q('Which amount is greater: $2.08 or $2.80?',['$2.08','$2.80','Equal','Cannot tell'],1,'Same dollars, so compare cents: 8\u00a2 < 80\u00a2, so $2.80 is more.')",
    "q('Which amount is greater: $2.08 or $2.80?',['$2.08','Equal','Cannot tell','$2.80'],3,'Same dollars, so compare cents: 8\u00a2 < 80\u00a2, so $2.80 is more.')"
)

# idx 2 → 3
fix(
    "q('What is $2.00 \u2212 $0.85?',['$1.05','$1.10','$1.15','$1.20'],2,'$2.00 \u2212 $0.85 = $1.15.')",
    "q('What is $2.00 \u2212 $0.85?',['$1.05','$1.10','$1.20','$1.15'],3,'$2.00 \u2212 $0.85 = $1.15.')"
)
fix(
    "q('What is $1.00 \u2212 $0.35?',['$0.55','$0.60','$0.65','$0.75'],2,'$1.00 \u2212 $0.35 = $0.65.')",
    "q('What is $1.00 \u2212 $0.35?',['$0.55','$0.60','$0.75','$0.65'],3,'$1.00 \u2212 $0.35 = $0.65.')"
)
fix(
    "q('What is $1.50 + $0.75?',['$2.00','$2.15','$2.25','$2.50'],2,'$1.50 + $0.75 = $2.25.')",
    "q('What is $1.50 + $0.75?',['$2.00','$2.15','$2.50','$2.25'],3,'$1.50 + $0.75 = $2.25.')"
)
fix(
    "q('What is $4.50 \u2212 $2.75?',['$1.50','$1.65','$1.75','$2.00'],2,'$4.50 \u2212 $2.75 = $1.75.')",
    "q('What is $4.50 \u2212 $2.75?',['$1.50','$1.65','$2.00','$1.75'],3,'$4.50 \u2212 $2.75 = $1.75.')"
)

# =========================================================
# SECTION 4: U5L4 qBank — no index 3 (0=8,1=13,2=9,3=0 → 8,8,7,7)
# Move 5 from idx1→3, 2 from idx2→3
# =========================================================
print('\n=== SECTION 4: U5L4 qBank — add index 3 ===')

# idx 1 → 3
fix(
    "q('Is a video game a need or a want?',['Need','Want','Both','Neither'],1,'Video games are fun but not necessary to survive.')",
    "q('Is a video game a need or a want?',['Need','Both','Neither','Want'],3,'Video games are fun but not necessary to survive.')"
)
# cascades to testBank L2715 (same string as L2614)
fix(
    "q('Is candy a need or a want?',['Need','Want','Both','Neither'],1,'Candy is a want. It tastes good but you do not need it to survive.')",
    "q('Is candy a need or a want?',['Need','Both','Neither','Want'],3,'Candy is a want. It tastes good but you do not need it to survive.')"
)
# cascades to testBank L2719 (same string as L2618)
fix(
    "q('Is a toy car a need or a want?',['Need','Want','Both','Neither'],1,'A toy car is a want. It is fun but not needed to survive.')",
    "q('Is a toy car a need or a want?',['Need','Both','Neither','Want'],3,'A toy car is a want. It is fun but not needed to survive.')"
)
fix(
    "q('Ana has $10. A toy costs $7 and a book costs $4. Can she buy both?',['Yes','No','Maybe','Need more info'],1,'$7 + $4 = $11, which is more than $10. Ana cannot buy both.')",
    "q('Ana has $10. A toy costs $7 and a book costs $4. Can she buy both?',['Yes','Maybe','Need more info','No'],3,'$7 + $4 = $11, which is more than $10. Ana cannot buy both.')"
)
fix(
    "q('Why is saving money a good idea?',['To bury it in the ground','To have money later for bigger things','To give it all away immediately','Because money spoils'],1,'Saving money lets you afford bigger things later that you cannot buy all at once.')",
    "q('Why is saving money a good idea?',['To bury it in the ground','To give it all away immediately','Because money spoils','To have money later for bigger things'],3,'Saving money lets you afford bigger things later that you cannot buy all at once.')"
)

# idx 2 → 3
fix(
    "q('What does SAVING money mean?',['Giving it away','Spending it now','Keeping it for later','Losing it'],2,'Saving means setting money aside to use later.')",
    "q('What does SAVING money mean?',['Giving it away','Spending it now','Losing it','Keeping it for later'],3,'Saving means setting money aside to use later.')"
)
fix(
    "q('What does GIVING money mean?',['Saving for yourself','Using it to buy wants','Sharing money with others','Investing in stocks'],2,'Giving means sharing your money with others or donating to help people in need.')",
    "q('What does GIVING money mean?',['Saving for yourself','Using it to buy wants','Investing in stocks','Sharing money with others'],3,'Giving means sharing your money with others or donating to help people in need.')"
)

# =========================================================
# SECTION 5: U5L4 quiz — 4/6 at index 2 (unique strings)
# =========================================================
print('\n=== SECTION 5: U5L4 quiz redistribution ===')

fix(
    "q('What does saving money mean?',['Giving it away','Spending it now','Keeping it for later','Losing it'],2,'Saving means setting money aside to spend on something later.')",
    "q('What does saving money mean?',['Keeping it for later','Giving it away','Spending it now','Losing it'],0,'Saving means setting money aside to spend on something later.')"
)
fix(
    "q('Which of these is a need?',['Candy','Toy car','Food','Movie ticket'],2,'Food is something you must have to survive. Food is a need!')",
    "q('Which of these is a need?',['Candy','Toy car','Movie ticket','Food'],3,'Food is something you must have to survive. Food is a need!')"
)
fix(
    "q('What does giving money mean?',['Saving for yourself','Spending on wants','Donating or gifting to others','Borrowing money'],2,'Giving means sharing your money with others or donating to help people in need.')",
    "q('What does giving money mean?',['Saving for yourself','Spending on wants','Borrowing money','Donating or gifting to others'],3,'Giving means sharing your money with others or donating to help people in need.')"
)

# =========================================================
# SECTION 6: Unit 5 testBank — fix unique strings (not already handled by cascades)
# Target: improve from 0=9,1=42,2=48,3=4
# =========================================================
print('\n=== SECTION 6: U5 testBank redistribution ===')

# idx 1 → 0
fix(
    "q('How many cents are in $2.00?',['20','200','2000','20000'],1,'$2.00 = 200 cents.')",
    "q('How many cents are in $2.00?',['200','20','2000','20000'],0,'$2.00 = 200 cents.')"
)
fix(
    "q('What is $0.99 + $0.01?',['$0.99','$1.00','$1.01','$1.10'],1,'99\u00a2 + 1\u00a2 = 100\u00a2 = $1.00.')",
    "q('What is $0.99 + $0.01?',['$1.00','$0.99','$1.01','$1.10'],0,'99\u00a2 + 1\u00a2 = 100\u00a2 = $1.00.')"
)
fix(
    "q('What is $0.75 + $0.50?',['$1.15','$1.25','$1.35','$1.50'],1,'75\u00a2 + 50\u00a2 = 125\u00a2 = $1.25.')",
    "q('What is $0.75 + $0.50?',['$1.25','$1.15','$1.35','$1.50'],0,'75\u00a2 + 50\u00a2 = 125\u00a2 = $1.25.')"
)
fix(
    "q('How many pennies equal one nickel?',['3','5','7','10'],1,'5 pennies = 5\u00a2 = 1 nickel.')",
    "q('How many pennies equal one nickel?',['5','3','7','10'],0,'5 pennies = 5\u00a2 = 1 nickel.')"
)
fix(
    "q('What does saving money mean?',['Spending it now','Keeping it for later','Giving it away','Losing it'],1,'Saving means keeping money for later instead of spending it right now.')",
    "q('What does saving money mean?',['Keeping it for later','Spending it now','Giving it away','Losing it'],0,'Saving means keeping money for later instead of spending it right now.')"
)

# idx 1 → 3
fix(
    "q('How do you write \u201cone dollar and seven cents\u201d?',['$1.70','$1.07','$17.00','$0.17'],1,'One dollar and seven cents = $1.07.')",
    "q('How do you write \u201cone dollar and seven cents\u201d?',['$1.70','$17.00','$0.17','$1.07'],3,'One dollar and seven cents = $1.07.')"
)
fix(
    "q('An item costs $1.79 and you pay $2.00. How much change do you get?',['$0.11','$0.21','$0.31','$0.41'],1,'$2.00 \u2212 $1.79 = $0.21 change.')",
    "q('An item costs $1.79 and you pay $2.00. How much change do you get?',['$0.11','$0.31','$0.41','$0.21'],3,'$2.00 \u2212 $1.79 = $0.21 change.')"
)
fix(
    "q('Is a video game a need or a want?',['Need','Want','Both','Neither'],1,'A video game is a want. It is fun but not needed to survive.')",
    "q('Is a video game a need or a want?',['Need','Both','Neither','Want'],3,'A video game is a want. It is fun but not needed to survive.')"
)
fix(
    "q('What does spending money mean?',['Keeping money','Using money to buy things','Giving money freely','Saving for later'],1,'Spending means using your money to buy something.')",
    "q('What does spending money mean?',['Keeping money','Giving money freely','Saving for later','Using money to buy things'],3,'Spending means using your money to buy something.')"
)
fix(
    "q('You earn $8 and spend $5. How much do you have left?',['$2','$3','$4','$5'],1,'$8 \u2212 $5 = $3 left.')",
    "q('You earn $8 and spend $5. How much do you have left?',['$2','$4','$5','$3'],3,'$8 \u2212 $5 = $3 left.')"
)
fix(
    "q('Is a movie ticket a need or a want?',['Need','Want','Both','Neither'],1,'A movie ticket is a want. Movies are fun entertainment but not necessary.')",
    "q('Is a movie ticket a need or a want?',['Need','Both','Neither','Want'],3,'A movie ticket is a want. Movies are fun entertainment but not necessary.')"
)
fix(
    "q('What does the word budget mean?',['A type of coin','A plan for spending and saving','A savings account','A type of bank'],1,'A budget is a plan for how you will use your money.')",
    "q('What does the word budget mean?',['A type of coin','A savings account','A type of bank','A plan for spending and saving'],3,'A budget is a plan for how you will use your money.')"
)
fix(
    "q('Which amount is greater: $2.08 or $2.80?',['$2.08','$2.80','Equal','Cannot tell'],1,'Same dollars. Compare cents: 8\u00a2 < 80\u00a2. So $2.80 is more.')",
    "q('Which amount is greater: $2.08 or $2.80?',['$2.08','Equal','Cannot tell','$2.80'],3,'Same dollars. Compare cents: 8\u00a2 < 80\u00a2. So $2.80 is more.')"
)
fix(
    "q('Which is greater: $1.47 or $1.74?',['$1.47 > $1.74','$1.47 < $1.74','They are equal','Cannot tell'],1,'Same dollars. Compare cents: 47\u00a2 < 74\u00a2. So $1.47 < $1.74.')",
    "q('Which is greater: $1.47 or $1.74?',['$1.47 > $1.74','They are equal','Cannot tell','$1.47 < $1.74'],3,'Same dollars. Compare cents: 47\u00a2 < 74\u00a2. So $1.47 < $1.74.')"
)

# idx 2 → 0
fix(
    "q('You save $2 every week. How much will you have after 4 weeks?',['$4','$6','$8','$10'],2,'$2 \u00d7 4 weeks = $8 saved.')",
    "q('You save $2 every week. How much will you have after 4 weeks?',['$8','$4','$6','$10'],0,'$2 \u00d7 4 weeks = $8 saved.')"
)
fix(
    "q('What does saving money mean?',['Giving it away','Spending it now','Keeping it for later','Losing it'],2,'Saving means keeping money for later instead of spending it now.')",
    "q('What does saving money mean?',['Keeping it for later','Giving it away','Spending it now','Losing it'],0,'Saving means keeping money for later instead of spending it now.')"
)
fix(
    "q('You save $5 every week. How much will you have after 3 weeks?',['$10','$12','$15','$20'],2,'$5 \u00d7 3 weeks = $15 saved.')",
    "q('You save $5 every week. How much will you have after 3 weeks?',['$15','$10','$12','$20'],0,'$5 \u00d7 3 weeks = $15 saved.')"
)
fix(
    "q('What does giving money mean?',['Saving it for yourself','Buying things you want','Sharing money with others','Investing in stocks'],2,'Giving means sharing your money with others or donating to help people in need.')",
    "q('What does giving money mean?',['Sharing money with others','Saving it for yourself','Buying things you want','Investing in stocks'],0,'Giving means sharing your money with others or donating to help people in need.')"
)
fix(
    "q('You save $3 every week. How much will you have after 6 weeks?',['$12','$15','$18','$21'],2,'$3 \u00d7 6 weeks = $18 saved.')",
    "q('You save $3 every week. How much will you have after 6 weeks?',['$18','$12','$15','$21'],0,'$3 \u00d7 6 weeks = $18 saved.')"
)
fix(
    "q('You have $20 saved. A bike costs $45. How much more do you need?',['$15','$20','$25','$30'],2,'$45 \u2212 $20 = $25 more needed.')",
    "q('You have $20 saved. A bike costs $45. How much more do you need?',['$25','$15','$20','$30'],0,'$45 \u2212 $20 = $25 more needed.')"
)
fix(
    "q('How many dimes does it take to make $1.00?',['5','8','10','20'],2,'10 dimes \u00d7 10\u00a2 = 100\u00a2 = $1.00.')",
    "q('How many dimes does it take to make $1.00?',['10','5','8','20'],0,'10 dimes \u00d7 10\u00a2 = 100\u00a2 = $1.00.')"
)
fix(
    "q('Which coin is the smallest in size?',['Penny','Nickel','Dime','Quarter'],2,'The dime is the smallest coin, even though it is worth 10 cents.')",
    "q('Which coin is the smallest in size?',['Dime','Penny','Nickel','Quarter'],0,'The dime is the smallest coin, even though it is worth 10 cents.')"
)
fix(
    "q('How many quarters does it take to make $1.00?',['2','3','4','5'],2,'4 quarters \u00d7 25\u00a2 = 100\u00a2 = $1.00.')",
    "q('How many quarters does it take to make $1.00?',['4','2','3','5'],0,'4 quarters \u00d7 25\u00a2 = 100\u00a2 = $1.00.')"
)
fix(
    "q('Which of these is a need?',['Toy','Video game','Food','Movie ticket'],2,'Food is something you must have to survive. Food is a need!')",
    "q('Which of these is a need?',['Food','Toy','Video game','Movie ticket'],0,'Food is something you must have to survive. Food is a need!')"
)
fix(
    "q('What is $1.35 + $0.75?',['$1.90','$2.00','$2.10','$2.20'],2,'$1.35 + $0.75 = $2.10.')",
    "q('What is $1.35 + $0.75?',['$2.10','$1.90','$2.00','$2.20'],0,'$1.35 + $0.75 = $2.10.')"
)
fix(
    "q('How many nickels does it take to make 25\u00a2?',['3','4','5','6'],2,'5 nickels \u00d7 5\u00a2 = 25\u00a2.')",
    "q('How many nickels does it take to make 25\u00a2?',['5','3','4','6'],0,'5 nickels \u00d7 5\u00a2 = 25\u00a2.')"
)

# idx 2 → 3
fix(
    "q('Something costs $2.40 and you pay $3.00. How much change do you get?',['$0.40','$0.55','$0.60','$0.65'],2,'$3.00 \u2212 $2.40 = $0.60 change.')",
    "q('Something costs $2.40 and you pay $3.00. How much change do you get?',['$0.40','$0.55','$0.65','$0.60'],3,'$3.00 \u2212 $2.40 = $0.60 change.')"
)
fix(
    "q('Donating to a food bank is an example of what?',['Saving','Spending','Giving','Investing'],2,'Donating to a food bank is giving. You are sharing with others who need it.')",
    "q('Donating to a food bank is an example of what?',['Saving','Spending','Investing','Giving'],3,'Donating to a food bank is giving. You are sharing with others who need it.')"
)
fix(
    "q('You have $15 saved and spend $9. How much do you have left?',['$4','$5','$6','$7'],2,'$15 \u2212 $9 = $6 left.')",
    "q('You have $15 saved and spend $9. How much do you have left?',['$4','$5','$7','$6'],3,'$15 \u2212 $9 = $6 left.')"
)

# =========================================================
# Done
# =========================================================
print(f'\nTotal replacements: {count}')

if content == orig:
    print('ERROR: No changes made!')
    sys.exit(1)

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('File written OK.')
