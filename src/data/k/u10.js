// Kindergarten Unit 8: Financial Literacy & Money
// Covers TEKS K.4A (identify U.S. coins by name: penny, nickel, dime, quarter)
//         TEKS K.9A (identify ways to earn income)
//         TEKS K.9B (differentiate income from gifts)
//         TEKS K.9C (list simple skills required for jobs)
//         TEKS K.9D (wants vs needs; income as source to meet wants and needs)
//
// Coin imagery is provided by src/data/k/coin_assets.js (single source of
// truth, lazy-loaded BEFORE this file by shared_k.js _loadKUnit(7) via the
// _K_UNIT_DEPS chain). Local `coinImg` aliases the global so call sites stay
// short.
//
// Calls _mergeKUnitData — available globally from shared_k.js.

(function(){
  var coinImg = window.coinImg;   // realistic PNG photo — Key Ideas only
  var coinSVG = window.coinSVG;   // lightweight SVG glyph — qBank / examples

  // All three helpers return RAW HTML strings (assigned to q.s or embedded in
  // ex.p / points[] template-literals). singleCoin / twoCoins use the SVG
  // glyph so qBank/testBank entries don't bloat with base64 photos.
  function emojiV(items, label){
    var emos = (items || []).map(function(e){
      return '<span style="font-size:48px;line-height:1;margin:0 12px">' + e + '</span>';
    }).join('');
    var lbl = label
      ? '<div style="font-size:0.85rem;color:#6b7280;margin-top:6px">' + label + '</div>'
      : '';
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 0">' +
      '<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap">' + emos + '</div>' +
      lbl +
    '</div>';
  }
  // SVG for qBank/testBank visuals — shows numeric value (1¢/5¢/10¢/25¢) so
  // identity questions are not trivially answered by reading the coin label.
  // Coins are proportionally sized (dime < penny < nickel < quarter).
  function singleCoin(name){
    return '<div style="display:flex;align-items:center;justify-content:center;padding:12px 0">' +
      coinSVG(name, 140) +
    '</div>';
  }
  function twoCoins(leftName, rightName){
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 0">' +
      coinSVG(leftName, 80) +
      '<span style="font-size:1.25rem;color:#9ca3af">vs</span>' +
      coinSVG(rightName, 80) +
    '</div>';
  }
  // 4-coin tappable photo grid for Key Ideas — mirrors Grade 2 lightbox pattern.
  // coinImg now carries data-coin/label/value attrs; click is handled globally.
  var _coinRow = (function(){
    var labels = [
      {n:'penny',   lbl:'Penny',   val:'1¢'},
      {n:'nickel',  lbl:'Nickel',  val:'5¢'},
      {n:'dime',    lbl:'Dime',    val:'10¢'},
      {n:'quarter', lbl:'Quarter', val:'25¢'}
    ];
    return labels.map(function(c){
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
        coinImg(c.n, 72) +
        '<span style="font-size:0.75rem;font-weight:700;color:#d1d5db;letter-spacing:0.04em">' + c.lbl + '</span>' +
        '<span style="font-size:0.7rem;color:#9ca3af">' + c.val + '</span>' +
      '</div>';
    }).join('');
  }());
  var fourCoinRow = '<div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;padding:10px 4px">' + _coinRow + '</div>';

  _mergeKUnitData(9, {
    lessons: [

      // ── Lesson 1: Earning Money & Jobs — K.9A, K.9B, K.9C ─────────────────
      {
        points: [
          'People EARN money by working at jobs — money you earn is called INCOME',
          'A GIFT is given freely — it is NOT the same as earning money by working',
          'Different jobs need different SKILLS — like reading, building, cooking, or caring for others'
        ],
        examples: [
          {
            c: '#FFB300',
            tag: 'Working = Earning',
            p: 'Mr. Lee bakes bread at the bakery and gets paid. Is he EARNING money?',
            v: null,
            s: 'Yes! Working at a job is how people earn money — that pay is called INCOME.',
            a: 'Yes ✅'
          },
          {
            c: '#F57C00',
            tag: 'Gift vs Income',
            p: 'Aunt Maria gives Sam a $5 birthday card. Did Sam EARN that money?',
            v: null,
            s: 'No — that is a GIFT. A gift is given freely. Earning money means doing work.',
            a: 'No, it is a gift ✅'
          },
          {
            c: '#E65100',
            tag: 'Job Skills',
            p: 'A teacher needs to do which thing to do her job well — read books, or watch TV all day?',
            v: null,
            s: 'Read books! Teachers use READING to teach kids — that is a JOB SKILL.',
            a: 'Read books ✅'
          }
        ],
        practice: [
          {q:'A doctor helps sick people and gets paid. Is the doctor EARNING money?', a:'Yes', h:'Doctors work at hospitals', e:'Yes — doctors earn money by working ✅'},
          {q:'Grandma gave you a toy for your birthday. Did you EARN the toy?', a:'No, it is a gift', h:'A gift is given for free', e:'A toy from Grandma is a gift, not earned ✅'},
          {q:'A chef needs to know how to ____ to do their job.', a:'Cook food', h:'What does a chef do all day?', e:'Cooking is the chef\'s main job skill ✅'}
        ],
        qBank: [
          // ── easy (18) — "Which person is WORKING / earning?" ────────────
          {t:'Which person is WORKING?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'the cook'},{val:'the person sleeping',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'neither',tag:'err_confused'}], a:0, e:'The cook is working at a job — sleeping is not earning money.', d:'e', s:emojiV(['👨‍🍳','😴'], 'Cook vs sleeping'), h:'Working means doing a job'},
          {t:'Which person earns INCOME?', v:null, o:[{val:'the teacher'},{val:'the kid watching TV',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Teachers work and earn income. Watching TV is not a job.', d:'e', s:emojiV(['👩‍🏫','📺'], 'Teacher vs watching TV'), h:'A teacher works at a school'},
          {t:'Which one is a JOB?', v:null, o:[{val:'police officer'},{val:'playing video games',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Police officers work and get paid. Video games are for fun.', d:'e', s:emojiV(['👮','🎮'], 'Police vs video games'), h:'A job earns money'},
          {t:'Which person is EARNING money?', v:null, o:[{val:'the builder'},{val:'the person napping',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Building is hard work — that earns money. Napping does not.', d:'e', s:emojiV(['👷','💤'], 'Builder vs napping'), h:'Earning means working'},
          {t:'Which one is a JOB that pays money?', v:null, o:[{val:'firefighter'},{val:'eating cake',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Firefighters earn money for their work. Eating cake is fun, not a job.', d:'e', s:emojiV(['🚒','🍰'], 'Firefighter vs eating cake'), h:'Which one is hard work?'},
          {t:'Which person earns INCOME?', v:null, o:[{val:'the nurse'},{val:'the kid reading comics',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Nurses earn income at the hospital. Reading comics is for fun.', d:'e', s:emojiV(['👩‍⚕️','📚'], 'Nurse vs reading comics'), h:'Nurses work at hospitals'},
          {t:'Which one is WORKING?', v:null, o:[{val:'the bus driver'},{val:'the person in bed',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Bus drivers work to earn money. Lying in bed is rest, not a job.', d:'e', s:emojiV(['🚌','🛏️'], 'Bus driver vs in bed'), h:'Driving the bus is a job'},
          {t:'Which person is EARNING money?', v:null, o:[{val:'the farmer'},{val:'the kid at the party',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Farmers earn money by growing food. A party is for fun.', d:'e', s:emojiV(['👩‍🌾','🎈'], 'Farmer vs balloon party'), h:'Farming is hard work'},
          {t:'Which one is a JOB?', v:null, o:[{val:'mail carrier'},{val:'eating birthday cake',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Mail carriers earn income by delivering mail.', d:'e', s:emojiV(['📫','🎂'], 'Mail carrier vs eating cake'), h:'Delivering mail is a job'},
          {t:'Which person earns INCOME?', v:null, o:[{val:'the dentist'},{val:'the kid eating popcorn',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Dentists work and earn income. Eating popcorn is for fun.', d:'e', s:emojiV(['🦷','🍿'], 'Dentist vs eating popcorn'), h:'Dentists clean teeth at work'},
          {t:'Which one is WORKING at a JOB?', v:null, o:[{val:'carpenter'},{val:'playing board games',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Carpenters earn money building things. Board games are for fun.', d:'e', s:emojiV(['🔨','🎲'], 'Carpenter vs board games'), h:'A carpenter builds and earns'},
          {t:'Which person is EARNING money?', v:null, o:[{val:'garbage truck driver'},{val:'kid watching cartoons',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Garbage truck drivers earn money keeping the city clean.', d:'e', s:emojiV(['🚛','📺'], 'Garbage truck driver vs cartoons'), h:'Driving the garbage truck is a job'},
          {t:'Which one is a JOB?', v:null, o:[{val:'baker'},{val:'sleeping in',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Bakers earn income by making bread early in the morning.', d:'e', s:emojiV(['🥖','🛌'], 'Baker vs sleeping in'), h:'Bakers work at bakeries'},
          {t:'Which person earns money?', v:null, o:[{val:'veterinarian (animal doctor)'},{val:'kid coloring for fun',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Vets earn income caring for animals. Coloring is a fun hobby.', d:'e', s:emojiV(['🐶','🎨'], 'Vet vs coloring for fun'), h:'A vet treats sick animals'},
          {t:'Which one is WORKING?', v:null, o:[{val:'the cashier'},{val:'eating ice cream',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Cashiers earn income by helping customers pay.', d:'e', s:emojiV(['🧾','🍦'], 'Cashier vs eating ice cream'), h:'Cashiers work at stores'},
          {t:'Which person earns INCOME?', v:null, o:[{val:'singer at the concert'},{val:'person in the bath',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Singers earn money performing for people.', d:'e', s:emojiV(['🎤','🛀'], 'Singer at concert vs taking a bath'), h:'Singing on stage is a job'},
          {t:'Which one is a JOB?', v:null, o:[{val:'librarian'},{val:'playing games',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Librarians earn money helping people find books.', d:'e', s:emojiV(['📚','🎮'], 'Librarian vs playing games'), h:'Librarians work at libraries'},
          {t:'Which person is EARNING money?', v:null, o:[{val:'the taxi driver'},{val:'kid eating pizza',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Taxi drivers earn income by driving people places.', d:'e', s:emojiV(['🚕','🍕'], 'Taxi driver vs eating pizza'), h:'Driving a taxi is a job'},

          // ── medium (16) — income vs gift, choose what was EARNED ─────────
          {t:'Which one EARNED money?', v:null, o:[{val:'Maya sold lemonade for $3'},{val:'Maya got $5 from Grandma for her birthday',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'neither',tag:'err_confused'}], a:0, e:'Selling lemonade is WORK — Maya earned it. The birthday $5 is a gift.', d:'m', s:null, h:'Earning means doing work for it'},
          {t:'Which one is a GIFT (not earned)?', v:null, o:[{val:'a card with $10 from Aunt Lin',tag:null},{val:'$10 Dad paid for raking leaves',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Aunt Lin gave it freely — that is a GIFT. Raking leaves is earned.', d:'m', s:null, h:'A gift comes free; income comes from work'},
          {t:'Which child EARNED money?', v:null, o:[{val:'Jay walked the neighbor\'s dog for $4'},{val:'Jay was given $4 for being good',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Walking the dog is WORK — Jay earned that money.', d:'m', s:null, h:'What did Jay DO to get the money?'},
          {t:'Which is INCOME (earned money)?', v:null, o:[{val:'Mom\'s paycheck from the office'},{val:'Mom\'s holiday card from Grandpa',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A paycheck is income — Mom worked for it. The card is a gift.', d:'m', s:null, h:'Income comes from a job'},
          {t:'Which child EARNED money?', v:null, o:[{val:'Sara babysat her cousin and was paid $6'},{val:'Sara hugged her mom and got $6',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Babysitting is a JOB — Sara earned it. A hug is not work.', d:'m', s:null, h:'Earning needs work'},
          {t:'Which is a GIFT?', v:null, o:[{val:'a new bike from Uncle Rob'},{val:'$10 Dad paid for shoveling snow',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'The bike was given freely — a GIFT. Shoveling is earned.', d:'m', s:null, h:'Gifts are given for free'},
          {t:'Which one is EARNING (not a gift)?', v:null, o:[{val:'Lily sells drawings at the fair'},{val:'Lily got a doll on Christmas',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Selling drawings is WORK and earns money.', d:'m', s:null, h:'Earning happens when you sell or work'},
          {t:'Which child EARNED money?', v:null, o:[{val:'Ben helped Mr. Lee paint his fence for $8'},{val:'Ben got $8 in his birthday card',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Painting the fence is WORK — that is earned income.', d:'m', s:null, h:'Did he do work for the money?'},
          {t:'Which is INCOME?', v:null, o:[{val:'Aunt Mei\'s paycheck from her job'},{val:'a present Aunt Mei got from a friend',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A paycheck is INCOME — earned by working.', d:'m', s:null, h:'Income comes from a job'},
          {t:'Which one is EARNED?', v:null, o:[{val:'Tip the waiter received from a customer'},{val:'Tip the waiter got from his mom on his birthday',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A tip from a customer is earned for good service.', d:'m', s:null, h:'Tips are extra pay for the job'},
          {t:'Which child EARNED money?', v:null, o:[{val:'Mia ran a bake sale and got $12'},{val:'Mia got $12 from her grandma\'s card',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A bake sale is WORK — selling treats earns money.', d:'m', s:null, h:'Selling = earning'},
          {t:'Which is a GIFT (not income)?', v:null, o:[{val:'a doll from Grandpa for the holiday'},{val:'pay from Grandpa for raking his yard',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'The doll was given for free — that is a GIFT.', d:'m', s:null, h:'Gifts are given freely'},
          {t:'Which one EARNED money?', v:null, o:[{val:'Carlos mowed the lawn for $5'},{val:'Carlos was given $5 for being kind',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Mowing the lawn is WORK — Carlos earned the $5.', d:'m', s:null, h:'Earning means doing a chore or job'},
          {t:'Which is INCOME from a JOB?', v:null, o:[{val:'Dad\'s pay from the bank where he works'},{val:'Dad\'s anniversary present from Mom',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Dad earns income at his job at the bank.', d:'m', s:null, h:'A job pays income'},
          {t:'Which one EARNED money?', v:null, o:[{val:'Jada taught swimming and got $10'},{val:'Jada got a $10 medal at the meet',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Teaching swim lessons is a JOB — Jada earned the money.', d:'m', s:null, h:'Teaching others is a job'},
          {t:'Which is a GIFT?', v:null, o:[{val:'a video game from Aunt Tia'},{val:'$15 Tia paid for cleaning her car',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'The game from Aunt Tia is a free gift, not earned.', d:'m', s:null, h:'A gift is given for free'},

          // ── hard (10) — job skills, K.9C ─────────────────────────────────
          {t:'A teacher uses which skill the MOST at work?', v:null, o:[{val:'reading and explaining'},{val:'sleeping all day',tag:'err_confused',patternTag:'err_not_income'},{val:'eating snacks',tag:'err_confused'},{val:'singing only',tag:'err_confused'}], a:0, e:'Teachers READ books and EXPLAIN ideas every day.', d:'h', s:null, h:'What does a teacher DO with kids?'},
          {t:'A chef needs to know how to ____ to do their job.', v:null, o:[{val:'cook food'},{val:'fly a plane',tag:'err_confused',patternTag:'err_not_income'},{val:'play video games',tag:'err_confused'},{val:'go to bed',tag:'err_confused'}], a:0, e:'Cooking is a chef\'s main job skill.', d:'h', s:null, h:'A chef makes meals'},
          {t:'A bus driver needs which job skill?', v:null, o:[{val:'paying close attention'},{val:'taking long naps',tag:'err_confused',patternTag:'err_not_income'},{val:'making cookies',tag:'err_confused'},{val:'painting walls',tag:'err_confused'}], a:0, e:'Bus drivers must FOCUS on the road to keep riders safe.', d:'h', s:null, h:'Driving safely needs attention'},
          {t:'A doctor needs which skill to do her job?', v:null, o:[{val:'caring about people'},{val:'ignoring sick people',tag:'err_confused',patternTag:'err_not_income'},{val:'racing cars',tag:'err_confused'},{val:'building houses',tag:'err_confused'}], a:0, e:'Doctors CARE for patients and listen to them.', d:'h', s:null, h:'Doctors help people get better'},
          {t:'A carpenter (builder) needs which skill?', v:null, o:[{val:'measuring and using tools'},{val:'reading bedtime stories only',tag:'err_confused',patternTag:'err_not_income'},{val:'cooking soup',tag:'err_confused'},{val:'styling hair',tag:'err_confused'}], a:0, e:'Carpenters use TOOLS and MEASURE to build things.', d:'h', s:null, h:'Builders use hammers and rulers'},
          {t:'A nurse needs which job skill?', v:null, o:[{val:'being kind and patient'},{val:'driving a fire truck',tag:'err_confused',patternTag:'err_not_income'},{val:'racing motorcycles',tag:'err_confused'},{val:'painting fences',tag:'err_confused'}], a:0, e:'Nurses are kind and patient with sick people.', d:'h', s:null, h:'Nurses help sick people gently'},
          {t:'A vet (animal doctor) needs which skill?', v:null, o:[{val:'loving and caring for animals'},{val:'being scared of all dogs',tag:'err_confused',patternTag:'err_not_income'},{val:'building rockets',tag:'err_confused'},{val:'driving trains',tag:'err_confused'}], a:0, e:'Vets must LOVE and care for animals every day.', d:'h', s:null, h:'A vet treats animals'},
          {t:'A pilot needs which skill?', v:null, o:[{val:'staying calm and focused'},{val:'getting upset easily',tag:'err_confused',patternTag:'err_not_income'},{val:'baking cupcakes',tag:'err_confused'},{val:'shoveling snow',tag:'err_confused'}], a:0, e:'Pilots stay CALM and focus while flying.', d:'h', s:null, h:'Flying needs a steady mind'},
          {t:'A coach needs which job skill?', v:null, o:[{val:'teaching and encouraging others'},{val:'only playing alone',tag:'err_confused',patternTag:'err_not_income'},{val:'sleeping in late',tag:'err_confused'},{val:'painting pictures',tag:'err_confused'}], a:0, e:'Coaches TEACH and CHEER for their team.', d:'h', s:null, h:'Coaches help players improve'},
          {t:'A baker needs which skill at work?', v:null, o:[{val:'measuring and mixing'},{val:'taking long vacations',tag:'err_confused',patternTag:'err_not_income'},{val:'flying kites',tag:'err_confused'},{val:'walking dogs',tag:'err_confused'}], a:0, e:'Bakers MEASURE flour and MIX dough for bread.', d:'h', s:null, h:'Baking needs careful measuring'}
        ]
      },

      // ── Lesson 2: Wants vs Needs — K.9D ────────────────────────────────────
      {
        points: [
          'NEEDS are things we MUST have to live — like food, water, clothes, and a home',
          'WANTS are things we WOULD LIKE — like toys, candy, video games, or treats',
          'People EARN money to buy what they need first, and what they want when they can'
        ],
        examples: [
          {
            c: '#FFB300',
            tag: 'Need',
            p: 'Is FOOD a NEED or a WANT?',
            v: null,
            s: 'NEED — we cannot live without food. Our bodies must have it.',
            a: 'NEED ✅'
          },
          {
            c: '#F57C00',
            tag: 'Want',
            p: 'Is a NEW TOY a need or a want?',
            v: null,
            s: 'WANT — toys are fun but we don\'t need them to live.',
            a: 'WANT ✅'
          },
          {
            c: '#E65100',
            tag: 'Income for needs',
            p: 'Mom earns money at her job. What should she pay for FIRST?',
            v: null,
            s: 'NEEDS first! Food and rent come before fun toys or candy.',
            a: 'Needs first ✅'
          }
        ],
        practice: [
          {q:'Is WATER a need or a want?', a:'Need', h:'We must drink it every day', e:'Water is a NEED — we drink it to stay alive ✅'},
          {q:'Is a CANDY BAR a need or a want?', a:'Want', h:'Tasty but not needed to live', e:'Candy is a WANT — fun but not needed ✅'},
          {q:'A family has $20. They have no food at home. What should they buy FIRST?', a:'Food', h:'Needs come before wants', e:'Buy food first — it is a NEED ✅'}
        ],
        qBank: [
          // ── easy (18) ─────────────────────────────────────────────────────
          {t:'Is FOOD a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Food is a NEED — bodies need to eat.', d:'e', s:emojiV(['🍎','🥕','🍞'], 'Food'), h:'Can you live without food?'},
          {t:'Is a TOY a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Toys are WANTS — fun but not needed to live.', d:'e', s:emojiV(['🧸','🚂','🪀'], 'Toys'), h:'Can you live without toys?'},
          {t:'Is WATER a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Water is a NEED — we must drink it every day.', d:'e', s:emojiV(['💧','🚰'], 'Water'), h:'Bodies need water'},
          {t:'Is CANDY a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Candy is a WANT — yummy but not needed.', d:'e', s:emojiV(['🍬','🍭','🍫'], 'Candy'), h:'Can you live without candy?'},
          {t:'Is a HOUSE a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A house is a NEED — we need shelter to be safe.', d:'e', s:emojiV(['🏠','🏡'], 'House'), h:'Where do you sleep at night?'},
          {t:'Is a VIDEO GAME a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Video games are WANTS — fun but not needed.', d:'e', s:emojiV(['🎮','🕹️'], 'Video game'), h:'Can your body live without games?'},
          {t:'Is a JACKET in winter a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A winter jacket is a NEED — we need warm clothes in cold weather.', d:'e', s:emojiV(['🧥','❄️'], 'Winter coat'), h:'How do you stay warm?'},
          {t:'Is ICE CREAM a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Ice cream is a WANT — a fun treat, not a need.', d:'e', s:emojiV(['🍦','🍨'], 'Ice cream'), h:'Can you live without ice cream?'},
          {t:'Is SLEEP a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Sleep is a NEED — bodies need rest to be healthy.', d:'e', s:emojiV(['🛌','😴'], 'Sleep'), h:'What happens if you never sleep?'},
          {t:'Are BALLOONS a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Balloons are WANTS — fun for parties but not needed.', d:'e', s:emojiV(['🎈','🎈'], 'Balloons'), h:'Can you live without balloons?'},
          {t:'Are CLOTHES a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Clothes are a NEED — we wear them every day to stay covered and warm.', d:'e', s:emojiV(['👕','👖'], 'Clothes'), h:'You wear them every day'},
          {t:'Is a FANCY DRESS a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A fancy dress is a WANT — pretty but not needed.', d:'e', s:emojiV(['👗','💎'], 'Fancy dress'), h:'Plain clothes already meet the need'},
          {t:'Are MEDICINE & DOCTOR visits a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Medicine and doctors are NEEDS — they keep us healthy.', d:'e', s:emojiV(['💊','🩺'], 'Medicine'), h:'Helps you when you are sick'},
          {t:'Is a NEW PHONE a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A new phone is a WANT for kindergarteners — not needed.', d:'e', s:emojiV(['📱'], 'New phone'), h:'Can you live without one?'},
          {t:'Are SHOES a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Shoes are a NEED — protect our feet every day.', d:'e', s:emojiV(['👟','👞'], 'Shoes'), h:'You wear them outside'},
          {t:'Are FIREWORKS a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Fireworks are WANTS — fun but not needed.', d:'e', s:emojiV(['🎆','🎇'], 'Fireworks'), h:'Can you live without fireworks?'},
          {t:'Is a BED a need or a want?', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A bed is a NEED — we need a place to sleep.', d:'e', s:emojiV(['🛏️'], 'Bed'), h:'Where do you sleep?'},
          {t:'Is a TOY ROBOT a need or a want?', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A toy robot is a WANT — fun but not needed.', d:'e', s:emojiV(['🤖','🎁'], 'Toy robot'), h:'Can you live without a robot toy?'},

          // ── medium (16) — pick the NEED / pick the WANT, mixed sets ──────
          {t:'Which is a NEED?', v:null, o:[{val:'bread'},{val:'lollipop',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'Bread is food — a NEED. Lollipops are wants.', d:'m', s:emojiV(['🍞','🍭'], 'Bread vs lollipop'), h:'Food we live on is a need'},
          {t:'Which is a WANT?', v:null, o:[{val:'chocolate'},{val:'water',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'Chocolate is a WANT. Water is a NEED.', d:'m', s:emojiV(['💧','🍫'], 'Water vs chocolate'), h:'Can you live without it?'},
          {t:'Which is a NEED?', v:null, o:[{val:'house'},{val:'video game',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'A house is a NEED — shelter keeps us safe.', d:'m', s:emojiV(['🏠','🎮'], 'House vs video game'), h:'Shelter is a need'},
          {t:'Which is a WANT?', v:null, o:[{val:'yo-yo'},{val:'shirt',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'A yo-yo is a WANT. Shirts are needed.', d:'m', s:emojiV(['👕','🪀'], 'Shirt vs yo-yo'), h:'You don\'t need a yo-yo to live'},
          {t:'Which is a NEED?', v:null, o:[{val:'bed'},{val:'balloon',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'A bed is a NEED for sleep.', d:'m', s:emojiV(['🛌','🎈'], 'Bed vs balloon'), h:'Sleep is a need'},
          {t:'Which is a WANT?', v:null, o:[{val:'donut'},{val:'broccoli',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'A donut is a treat — a WANT. Broccoli is healthy food, a NEED.', d:'m', s:emojiV(['🥦','🍩'], 'Broccoli vs donut'), h:'Treats are wants'},
          {t:'Which is a NEED?', v:null, o:[{val:'medicine'},{val:'gift',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'Medicine is a NEED — keeps us healthy.', d:'m', s:emojiV(['💊','🎁'], 'Medicine vs gift'), h:'You take it when sick'},
          {t:'Which is a WANT?', v:null, o:[{val:'popcorn'},{val:'carrot',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'Popcorn is a snack — a WANT.', d:'m', s:emojiV(['🥕','🍿'], 'Carrot vs popcorn'), h:'Snacks for fun are wants'},
          {t:'Which is a NEED?', v:null, o:[{val:'coat'},{val:'piñata',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A coat is a NEED to stay warm.', d:'m', s:emojiV(['🧥','🪅'], 'Coat vs piñata'), h:'Helps in cold weather'},
          {t:'Which is a WANT?', v:null, o:[{val:'karaoke mic'},{val:'tap water',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A karaoke mic is fun — a WANT.', d:'m', s:emojiV(['🚰','🎤'], 'Tap water vs karaoke mic'), h:'Singing toys are wants'},
          {t:'Mom has $5. Family is hungry. Buy WHAT first?', v:null, o:[{val:'food'},{val:'a new toy',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'a board game',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'candy',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'Food is a NEED — buy needs first.', d:'m', s:null, h:'Hungry family needs food'},
          {t:'Family has $10. The water bill is due. Pay WHAT first?', v:null, o:[{val:'the water bill'},{val:'fancy candy',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'new toys',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'tickets to a show',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'Water is a NEED — pay the bill first.', d:'m', s:null, h:'No water = no drink, no bath'},
          {t:'A child is cold. Spend money on what FIRST?', v:null, o:[{val:'a warm coat'},{val:'a new game',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'a candy bar',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'movie tickets',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'A coat is a NEED for cold weather.', d:'m', s:null, h:'Stay warm first'},
          {t:'Which list shows ONLY needs?', v:null, o:[{val:'food, water, home'},{val:'toys, candy, games',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'food, toy, game',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'water, candy, home',tag:'err_same',patternTag:'err_confuses_want_need'}], a:0, e:'Food, water, and a home are all NEEDS.', d:'m', s:null, h:'Things we cannot live without'},
          {t:'Which list shows ONLY wants?', v:null, o:[{val:'toy, candy, video game'},{val:'water, food, jacket',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'candy, food, bed',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'toy, water, shoes',tag:'err_same',patternTag:'err_confuses_want_need'}], a:0, e:'Toys, candy, and games are all WANTS.', d:'m', s:null, h:'Fun extras are wants'},
          {t:'Money EARNED at a job is BEST used FIRST for…', v:null, o:[{val:'paying for needs (food, home)'},{val:'buying lots of toys',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'only candy',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'video games only',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'Income should pay for NEEDS first, then wants.', d:'m', s:null, h:'Needs come first'},

          // ── hard (10) — close calls & tricky cases ───────────────────────
          {t:'A bicycle to ride to school could be a NEED if…', v:null, o:[{val:'there is no other way to get to school'},{val:'you already have a bus ride',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'you only want to look cool',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'you want a fancy color',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'If it\'s the only way to get to school, the bike becomes a NEED.', d:'h', s:null, h:'Needs depend on the situation'},
          {t:'Birthday cake at your party is usually a…', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Birthday cake is fun — a WANT, not a need.', d:'h', s:null, h:'You don\'t need cake to live'},
          {t:'A toothbrush is a…', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Toothbrushes are NEEDS — they keep teeth healthy.', d:'h', s:null, h:'Helps keep teeth clean'},
          {t:'A diamond ring is a…', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A diamond ring is a fancy WANT — pretty but not needed.', d:'h', s:null, h:'Bodies don\'t need rings'},
          {t:'Soap to wash your hands is a…', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Soap is a NEED — keeps us clean and safe.', d:'h', s:null, h:'Helps stop germs'},
          {t:'A sparkly star sticker is a…', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Stickers are WANTS — fun decorations only.', d:'h', s:null, h:'Stickers don\'t keep you alive'},
          {t:'School supplies (pencils, paper) at school are…', v:null, o:[{val:'NEEDS for learning'},{val:'WANTS only',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'neither',tag:'err_confused'},{val:'free toys',tag:'err_confused'}], a:0, e:'School supplies are NEEDS — kids must have them to learn.', d:'h', s:null, h:'You use them for school work'},
          {t:'Going on a vacation to Disney World is a…', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Vacations are WANTS — fun trips, not needed to live.', d:'h', s:null, h:'You can live without vacations'},
          {t:'A roof on your home is a…', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A roof is part of shelter — a NEED.', d:'h', s:null, h:'It keeps rain out'},
          {t:'After buying food and paying rent, money LEFT can be used for…', v:null, o:[{val:'wants like toys or fun'},{val:'nothing — only needs ever',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'starting a new job',tag:'err_confused'},{val:'going to bed',tag:'err_confused'}], a:0, e:'After NEEDS are paid, leftover money can buy WANTS.', d:'h', s:null, h:'Wants come after needs'}
        ]
      },

      // ── Lesson 3: Identify Coins — K.4A ────────────────────────────────────
      {
        points: [
          fourCoinRow,
          'PENNY (1¢) — brown/copper, shows Abraham Lincoln',
          'NICKEL (5¢) — silver, bigger than a penny, shows Thomas Jefferson',
          'DIME (10¢) — the SMALLEST coin, silver, shows Franklin Roosevelt',
          'QUARTER (25¢) — the BIGGEST silver coin, shows George Washington'
        ],
        examples: [
          {
            c: '#FFB300',
            tag: 'Penny',
            p: 'Look at the brown coin with Lincoln on it. What is it called? ' + singleCoin('penny') + '',
            v: null,
            s: 'That is a PENNY! Brown/copper color, with Abraham Lincoln.',
            a: 'Penny ✅'
          },
          {
            c: '#F57C00',
            tag: 'Dime',
            p: 'This is the SMALLEST coin. What is it called? ' + singleCoin('dime') + '',
            v: null,
            s: 'That is a DIME — the smallest coin of all four.',
            a: 'Dime ✅'
          },
          {
            c: '#E65100',
            tag: 'Quarter',
            p: 'This is the BIGGEST silver coin. What is it called? ' + singleCoin('quarter') + '',
            v: null,
            s: 'That is a QUARTER! The biggest of the four coins.',
            a: 'Quarter ✅'
          }
        ],
        practice: [
          {q:'A brown coin with Lincoln on it is called a ____', a:'Penny', h:'It is the only brown coin', e:'Penny — copper-colored, Lincoln ✅'},
          {q:'The smallest silver coin is called a ____', a:'Dime', h:'Tiny but worth ten', e:'Dime — smallest of all coins ✅'},
          {q:'The biggest silver coin is called a ____', a:'Quarter', h:'Biggest of the four', e:'Quarter — biggest, with Washington ✅'}
        ],
        qBank: [
          // ── easy (14) ────────────────────────────────────────────────────
          {t:'What coin is this?', v:null, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — brown, with Lincoln.', d:'e', s:singleCoin('penny'), h:'The only brown coin'},
          {t:'What coin is this?', v:null, o:[{val:'nickel'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — silver, with Jefferson.', d:'e', s:singleCoin('nickel'), h:'Bigger than a penny, silver'},
          {t:'What coin is this?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — the smallest coin.', d:'e', s:singleCoin('dime'), h:'Smallest of all four coins'},
          {t:'What coin is this?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — biggest silver coin.', d:'e', s:singleCoin('quarter'), h:'Biggest silver coin'},
          {t:'Find the penny.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — brown, copper-colored.', d:'e', s:null, h:'The brown coin'},
          {t:'Tap the dime.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — the smallest coin.', d:'e', s:null, h:'The smallest one'},
          {t:'Tap the nickel.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'nickel'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — with Jefferson.', d:'e', s:null, h:'Bigger silver coin, not biggest'},
          {t:'Tap the quarter.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — biggest silver coin.', d:'e', s:null, h:'Biggest silver coin'},
          {t:'What coin is this?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — copper color, Lincoln.', d:'e', s:singleCoin('penny'), h:'Only brown coin'},
          {t:'What coin is this?', v:null, o:[{val:'nickel'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — silver, Jefferson.', d:'e', s:singleCoin('nickel'), h:'Silver, not smallest, not biggest'},
          {t:'What coin is this?', v:null, o:[{val:'dime'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — smallest coin, Roosevelt.', d:'e', s:singleCoin('dime'), h:'The smallest silver coin'},
          {t:'What coin is this?', v:null, o:[{val:'quarter'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — biggest silver coin, Washington.', d:'e', s:singleCoin('quarter'), h:'Biggest of the four'},
          {t:'Which shows Lincoln?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — Lincoln is on the penny.', d:'e', s:null, h:'The brown coin'},
          {t:'Which shows Washington?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — Washington is on the quarter.', d:'e', s:null, h:'Biggest silver coin'},

          // ── medium (13) ───────────────────────────────────────────────────
          {t:'Which is smallest?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Dime is the smallest coin.', d:'m', s:null, h:'Tiny silver coin'},
          {t:'Which is biggest?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Quarter is the biggest coin.', d:'m', s:null, h:'Biggest of the four'},
          {t:'Which is brown?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny is the only brown coin.', d:'m', s:null, h:'The other three are silver'},
          {t:'Which shows Jefferson?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'nickel'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Jefferson is on the nickel.', d:'m', s:null, h:'Silver, between dime and quarter'},
          {t:'Which shows Roosevelt?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Roosevelt is on the dime.', d:'m', s:null, h:'The smallest coin'},
          {t:'Find the nickel.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'nickel'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — silver, Jefferson.', d:'m', s:null, h:'Silver, bigger than a dime'},
          {t:'Find the penny.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — brown, Lincoln.', d:'m', s:null, h:'Brown/copper'},
          {t:'Find the dime.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — smallest coin.', d:'m', s:null, h:'Smallest of all four'},
          {t:'Find the quarter.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'quarter'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — biggest silver coin.', d:'m', s:null, h:'Biggest silver coin'},
          {t:'Tap the dime.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — the smallest silver coin.', d:'m', s:null, h:'Smallest of all'},
          {t:'Tap the quarter.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — biggest silver coin.', d:'m', s:null, h:'Biggest of the four'},
          {t:'Which is brown?', v:null, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — the only non-silver coin.', d:'m', s:null, h:'Color matters'},
          {t:'Which is biggest?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Quarter is the biggest.', d:'m', s:null, h:'Biggest of the four'},

          // ── hard (9) ──────────────────────────────────────────────────────
          {t:'What coin is this?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — smallest, Roosevelt.', d:'h', s:singleCoin('dime'), h:'Smallest silver coin'},
          {t:'What coin is this?', v:null, o:[{val:'nickel'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_size_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — silver, Jefferson.', d:'h', s:singleCoin('nickel'), h:'Between dime and quarter in size'},
          {t:'Which is bigger?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is bigger than a dime.', d:'h', s:twoCoins('penny','dime'), h:'Dime is the smallest'},
          {t:'Which is smaller?', v:null, o:[{val:'dime'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a nickel.', d:'h', s:twoCoins('nickel','dime'), h:'Dime is the smallest coin'},
          {t:'Which shows Lincoln?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — Lincoln is on the penny.', d:'h', s:null, h:'The brown coin'},
          {t:'Which shows Roosevelt?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Roosevelt is on the dime.', d:'h', s:null, h:'The smallest coin'},
          {t:'Which shows Jefferson?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'nickel'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Jefferson is on the nickel.', d:'h', s:null, h:'Silver, between dime and quarter'},
          {t:'Which shows Washington?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Washington is on the quarter.', d:'h', s:null, h:'Biggest silver coin'},
          {t:'Which is brown?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny is the only brown coin.', d:'h', s:null, h:'Color is the clue'}
        ]
      },

      // ── Lesson 4: Compare Coins — K.4A ─────────────────────────────────────
      {
        points: [
          fourCoinRow,
          'Coins have different COLORS — penny is brown/copper, the rest are silver',
          'Coins have different SIZES — dime is SMALLEST, quarter is BIGGEST',
          'Order by size: DIME (smallest) → PENNY → NICKEL → QUARTER (biggest)'
        ],
        examples: [
          {
            c: '#FFB300',
            tag: 'Bigger',
            p: 'Look at a quarter and a dime. Which one is BIGGER? ' + twoCoins('quarter','dime') + '',
            v: null,
            s: 'The QUARTER is bigger — it is the biggest of all four coins.',
            a: 'Quarter ✅'
          },
          {
            c: '#F57C00',
            tag: 'Smaller',
            p: 'Look at a nickel and a dime. Which one is SMALLER? ' + twoCoins('nickel','dime') + '',
            v: null,
            s: 'The DIME — smallest coin of all four!',
            a: 'Dime ✅'
          },
          {
            c: '#E65100',
            tag: 'Match',
            p: 'Find the coin that MATCHES the penny. ' + singleCoin('penny') + '',
            v: null,
            s: 'Another penny would match — same brown color, same size, same Lincoln.',
            a: 'Another penny ✅'
          }
        ],
        practice: [
          {q:'Which is bigger — a quarter or a dime?', a:'Quarter', h:'Quarters are biggest', e:'Quarter is bigger ✅'},
          {q:'Which is smaller — a dime or a nickel?', a:'Dime', h:'Dime is the smallest', e:'Dime is smaller ✅'},
          {q:'A penny is brown. Which other coin matches that color?', a:'Another penny', h:'Only pennies are brown', e:'Only another penny matches ✅'}
        ],
        qBank: [
          // ── easy (14) — straight bigger/smaller with pictures ────────────
          {t:'Which coin is BIGGER?', v:null, o:[{val:'quarter'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same',patternTag:'err_visual_confusion'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger than a dime.', d:'e', s:twoCoins('quarter','dime'), h:'Quarters are biggest'},
          {t:'Which coin is SMALLER?', v:null, o:[{val:'dime'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same',patternTag:'err_visual_confusion'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is the smallest coin.', d:'e', s:twoCoins('nickel','dime'), h:'Dime is smallest'},
          {t:'Which coin is BIGGER?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger than a penny.', d:'e', s:twoCoins('quarter','penny'), h:'Quarter is the biggest'},
          {t:'Which coin is SMALLER?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a penny.', d:'e', s:twoCoins('penny','dime'), h:'Dime is the smallest'},
          {t:'Which coin is BIGGER?', v:null, o:[{val:'nickel'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Nickel is bigger than a dime.', d:'e', s:twoCoins('nickel','dime'), h:'Dime is smallest, nickel is bigger'},
          {t:'Which coin is BIGGER?', v:null, o:[{val:'quarter'},{val:'nickel',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger than a nickel.', d:'e', s:twoCoins('quarter','nickel'), h:'Quarter is biggest'},
          {t:'Which coin is SMALLER?', v:null, o:[{val:'penny'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is smaller than a quarter.', d:'e', s:twoCoins('quarter','penny'), h:'Quarter is biggest'},
          {t:'Which coin is SMALLER?', v:null, o:[{val:'penny'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is smaller than a nickel.', d:'e', s:twoCoins('nickel','penny'), h:'Nickel is bigger'},
          {t:'Which coin is BIGGER?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is bigger than a dime.', d:'e', s:twoCoins('penny','dime'), h:'Dime is smallest of all'},
          {t:'Which coin is SMALLER?', v:null, o:[{val:'dime'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller — it\'s the smallest coin.', d:'e', s:twoCoins('quarter','dime'), h:'Dime is smallest'},
          {t:'Which coin is BIGGER?', v:null, o:[{val:'quarter'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter — biggest silver coin.', d:'e', s:twoCoins('quarter','dime'), h:'Quarter is biggest'},
          {t:'Find the coin that MATCHES this one.', v:null, o:[{val:'another penny (brown, Lincoln)'},{val:'nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_visual_confusion'}], a:0, e:'Another penny matches — same color and size.', d:'e', s:singleCoin('penny'), h:'Same color, same coin'},
          {t:'Find the coin that MATCHES this one.', v:null, o:[{val:'another dime (small, silver)'},{val:'penny',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_visual_confusion'}], a:0, e:'Another dime matches — same small size and silver color.', d:'e', s:singleCoin('dime'), h:'Match the size and color'},
          {t:'Which is different?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'all the same',tag:'err_same',patternTag:'err_visual_confusion'}], a:0, e:'Penny is brown — the dime and nickel are silver.', d:'e', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('penny',80)+coinSVG('dime',80)+coinSVG('nickel',80)+'</div>', h:'Color is the clue'},

          // ── medium (13) ───────────────────────────────────────────────────
          {t:'Which is biggest?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'all the same',tag:'err_same'}], a:0, e:'Quarter — the biggest of the three shown.', d:'m', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('penny',80)+coinSVG('dime',80)+coinSVG('quarter',80)+'</div>', h:'Quarters are biggest'},
          {t:'Which is smallest?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_more',patternTag:'err_size_confusion'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'all the same',tag:'err_same'}], a:0, e:'Dime — smallest of all coins.', d:'m', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('penny',80)+coinSVG('quarter',80)+coinSVG('dime',80)+'</div>', h:'Dime is the smallest'},
          {t:'Which is smaller?', v:null, o:[{val:'dime'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a nickel.', d:'m', s:twoCoins('nickel','dime'), h:'Dime is smallest of all'},
          {t:'Which is bigger?', v:null, o:[{val:'quarter'},{val:'nickel',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger than a nickel.', d:'m', s:twoCoins('nickel','quarter'), h:'Quarter is biggest'},
          {t:'Which is smaller?', v:null, o:[{val:'dime'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a quarter.', d:'m', s:twoCoins('quarter','dime'), h:'Dime is the smallest'},
          {t:'Which is bigger?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is bigger than a dime.', d:'m', s:twoCoins('penny','dime'), h:'Dime is the smallest'},
          {t:'Which is bigger?', v:null, o:[{val:'quarter'},{val:'nickel',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter — biggest of the four.', d:'m', s:twoCoins('nickel','quarter'), h:'Quarter is biggest'},
          {t:'Which is smaller?', v:null, o:[{val:'dime'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a nickel.', d:'m', s:twoCoins('nickel','dime'), h:'Dime is the smallest'},
          {t:'Which is smaller?', v:null, o:[{val:'penny'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is smaller than a quarter.', d:'m', s:twoCoins('penny','quarter'), h:'Quarter is biggest'},
          {t:'Which is bigger?', v:null, o:[{val:'nickel'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Nickel is bigger than a dime.', d:'m', s:twoCoins('nickel','dime'), h:'Dime is smallest'},
          {t:'Which is bigger?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is bigger than a dime.', d:'m', s:twoCoins('penny','dime'), h:'Dime is smallest of all'},
          {t:'Which is biggest?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'all the same',tag:'err_same'}], a:0, e:'Quarter is the biggest coin.', d:'m', s:null, h:'Quarter is biggest'},
          {t:'Which is smallest?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_more',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'all the same',tag:'err_same'}], a:0, e:'Dime is the smallest coin.', d:'m', s:null, h:'Dime is smallest'},

          // ── hard (9) ──────────────────────────────────────────────────────
          {t:'Which is bigger?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger than a penny.', d:'h', s:twoCoins('quarter','penny'), h:'Quarter is biggest'},
          {t:'Which is smaller?', v:null, o:[{val:'penny'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is smaller than a nickel.', d:'h', s:twoCoins('nickel','penny'), h:'Nickel is bigger'},
          {t:'Which is bigger?', v:null, o:[{val:'nickel'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Nickel is bigger than a dime.', d:'h', s:twoCoins('nickel','dime'), h:'Dime is smallest'},
          {t:'Which is smaller?', v:null, o:[{val:'dime'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a quarter.', d:'h', s:twoCoins('quarter','dime'), h:'Dime is smallest'},
          {t:'Which is different?', v:null, o:[{val:'dime'},{val:'first penny',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'second penny',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'all the same',tag:'err_same',patternTag:'err_visual_confusion'}], a:0, e:'The dime is different — silver and small.', d:'h', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('penny',80)+coinSVG('penny',80)+coinSVG('dime',80)+'</div>', h:'One does not match'},
          {t:'Which is different?', v:null, o:[{val:'quarter'},{val:'first dime',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'second dime',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'all the same',tag:'err_same',patternTag:'err_visual_confusion'}], a:0, e:'The quarter is different — much bigger.', d:'h', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('dime',80)+coinSVG('dime',80)+coinSVG('quarter',80)+'</div>', h:'One is bigger'},
          {t:'Which is different?', v:null, o:[{val:'penny'},{val:'first nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'second nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'all the same',tag:'err_same',patternTag:'err_visual_confusion'}], a:0, e:'The penny is brown — different color.', d:'h', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('nickel',80)+coinSVG('nickel',80)+coinSVG('penny',80)+'</div>', h:'Color is the clue'},
          {t:'Which is bigger?', v:null, o:[{val:'quarter'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger than a dime.', d:'h', s:twoCoins('quarter','dime'), h:'Quarter is biggest'},
          {t:'Which is smaller?', v:null, o:[{val:'penny'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same size',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is smaller than a quarter.', d:'h', s:twoCoins('quarter','penny'), h:'Quarter is biggest'}
        ]
      }
    ],

    // ── testBank (76 total) ──────────────────────────────────────────────────
    testBank: [
      // ── ku8l1 — Earning Money & Jobs (20) ───────────────────────────────────
      {lessonId:'ku8l1', t:'Which person is WORKING?', s:emojiV(['👨‍🍳','😴'],'cook vs sleeping'), o:[{val:'the cook'},{val:'the person sleeping',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'The cook is working.', d:'e'},
      {lessonId:'ku8l1', t:'Which earns INCOME?', s:emojiV(['👩‍🏫','📺'],'teacher vs TV'), o:[{val:'the teacher'},{val:'kid watching TV',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Teachers earn income.', d:'e'},
      {lessonId:'ku8l1', t:'Which is a JOB?', s:emojiV(['👮','🎮'],'police vs games'), o:[{val:'police officer'},{val:'playing games',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Police is a job.', d:'e'},
      {lessonId:'ku8l1', t:'Which is WORKING?', s:emojiV(['🚒','🛌'],'firefighter vs bed'), o:[{val:'firefighter'},{val:'person in bed',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Firefighter is working.', d:'e'},
      {lessonId:'ku8l1', t:'Which person earns money?', s:emojiV(['👷','🍿'],'builder vs popcorn'), o:[{val:'the builder'},{val:'eating popcorn',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Builders earn income.', d:'e'},
      {lessonId:'ku8l1', t:'Which is a JOB?', s:emojiV(['👩‍🌾','🎈'],'farmer vs balloon'), o:[{val:'farmer'},{val:'kid with balloon',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Farming is a job.', d:'e'},
      {lessonId:'ku8l1', t:'Which earns INCOME?', s:emojiV(['🦷','🍦'],'dentist vs ice cream'), o:[{val:'the dentist'},{val:'kid eating ice cream',tag:'err_confused',patternTag:'err_not_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Dentists earn income.', d:'e'},
      {lessonId:'ku8l1', t:'Which one EARNED money?', v:null, o:[{val:'Maya sold lemonade for $3'},{val:'Maya got $5 for her birthday',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Selling lemonade is earning.', d:'m'},
      {lessonId:'ku8l1', t:'Which is a GIFT?', v:null, o:[{val:'a $10 birthday card from Aunt Lin'},{val:'$10 from raking leaves',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A birthday card is a gift.', d:'m'},
      {lessonId:'ku8l1', t:'Which child EARNED money?', v:null, o:[{val:'Jay walked the dog for $4'},{val:'Jay got $4 for being good',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Walking the dog is work.', d:'m'},
      {lessonId:'ku8l1', t:'Which is INCOME?', v:null, o:[{val:'Mom\'s paycheck'},{val:'Mom\'s holiday card',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A paycheck is income.', d:'m'},
      {lessonId:'ku8l1', t:'Which one EARNED money?', v:null, o:[{val:'Sara babysat for $6'},{val:'Sara got $6 for a hug',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Babysitting is a job.', d:'m'},
      {lessonId:'ku8l1', t:'Which is a GIFT?', v:null, o:[{val:'a bike from Uncle Rob'},{val:'$10 paid for shoveling',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'The bike is a gift.', d:'m'},
      {lessonId:'ku8l1', t:'Which child EARNED money?', v:null, o:[{val:'Ben painted the fence for $8'},{val:'Ben got $8 in his card',tag:'err_same',patternTag:'err_confuses_gift_income'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Painting the fence is earning.', d:'m'},
      {lessonId:'ku8l1', t:'A teacher uses which skill the MOST?', v:null, o:[{val:'reading and explaining'},{val:'sleeping all day',tag:'err_confused',patternTag:'err_not_income'},{val:'eating snacks',tag:'err_confused'},{val:'singing only',tag:'err_confused'}], a:0, e:'Reading and explaining.', d:'h'},
      {lessonId:'ku8l1', t:'A chef needs to know how to ____.', v:null, o:[{val:'cook food'},{val:'fly a plane',tag:'err_confused',patternTag:'err_not_income'},{val:'play games',tag:'err_confused'},{val:'go to bed',tag:'err_confused'}], a:0, e:'Chefs cook food.', d:'h'},
      {lessonId:'ku8l1', t:'A bus driver needs which skill?', v:null, o:[{val:'paying attention'},{val:'taking long naps',tag:'err_confused',patternTag:'err_not_income'},{val:'cooking',tag:'err_confused'},{val:'painting',tag:'err_confused'}], a:0, e:'Paying attention.', d:'h'},
      {lessonId:'ku8l1', t:'A doctor needs which skill?', v:null, o:[{val:'caring about people'},{val:'ignoring people',tag:'err_confused',patternTag:'err_not_income'},{val:'racing cars',tag:'err_confused'},{val:'building',tag:'err_confused'}], a:0, e:'Caring for patients.', d:'h'},
      {lessonId:'ku8l1', t:'A baker needs which skill?', v:null, o:[{val:'measuring and mixing'},{val:'long vacations',tag:'err_confused',patternTag:'err_not_income'},{val:'flying kites',tag:'err_confused'},{val:'walking dogs',tag:'err_confused'}], a:0, e:'Measuring and mixing.', d:'h'},
      {lessonId:'ku8l1', t:'A vet needs which skill?', v:null, o:[{val:'loving animals'},{val:'being scared of dogs',tag:'err_confused',patternTag:'err_not_income'},{val:'building rockets',tag:'err_confused'},{val:'driving trains',tag:'err_confused'}], a:0, e:'Loving animals.', d:'h'},

      // ── ku8l2 — Wants vs Needs (20) ─────────────────────────────────────────
      {lessonId:'ku8l2', t:'Is FOOD a need or a want?', s:emojiV(['🍎','🥕'],'food'), o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Food is a NEED.', d:'e'},
      {lessonId:'ku8l2', t:'Is a TOY a need or a want?', s:emojiV(['🧸'],'toy'), o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Toys are WANTS.', d:'e'},
      {lessonId:'ku8l2', t:'Is WATER a need or a want?', s:emojiV(['💧'],'water'), o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Water is a NEED.', d:'e'},
      {lessonId:'ku8l2', t:'Is CANDY a need or a want?', s:emojiV(['🍬'],'candy'), o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Candy is a WANT.', d:'e'},
      {lessonId:'ku8l2', t:'Is a HOUSE a need or a want?', s:emojiV(['🏠'],'house'), o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A house is a NEED.', d:'e'},
      {lessonId:'ku8l2', t:'Is a VIDEO GAME a need or a want?', s:emojiV(['🎮'],'video game'), o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Video games are WANTS.', d:'e'},
      {lessonId:'ku8l2', t:'Is a winter JACKET a need or a want?', s:emojiV(['🧥'],'jacket'), o:[{val:'NEED'},{val:'WANT',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Winter jackets are NEEDS.', d:'e'},
      {lessonId:'ku8l2', t:'Which is a NEED?', s:emojiV(['🍞','🍭'],'bread vs lollipop'), o:[{val:'bread'},{val:'lollipop',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'neither',tag:'err_confused'}], a:0, e:'Bread is a NEED.', d:'m'},
      {lessonId:'ku8l2', t:'Which is a WANT?', s:emojiV(['💧','🍫'],'water vs chocolate'), o:[{val:'chocolate'},{val:'water',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Chocolate is a WANT.', d:'m'},
      {lessonId:'ku8l2', t:'Which is a NEED?', s:emojiV(['🏠','🎮'],'house vs game'), o:[{val:'house'},{val:'video game',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A house is a NEED.', d:'m'},
      {lessonId:'ku8l2', t:'Which is a WANT?', s:emojiV(['👕','🪀'],'shirt vs yo-yo'), o:[{val:'yo-yo'},{val:'shirt',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A yo-yo is a WANT.', d:'m'},
      {lessonId:'ku8l2', t:'Which is a NEED?', s:emojiV(['🛌','🎈'],'bed vs balloon'), o:[{val:'bed'},{val:'balloon',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'A bed is a NEED.', d:'m'},
      {lessonId:'ku8l2', t:'Mom has $5. Family is hungry. Buy WHAT first?', v:null, o:[{val:'food'},{val:'a new toy',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'a board game',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'candy',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'Buy food first.', d:'m'},
      {lessonId:'ku8l2', t:'Family has $10. Water bill is due. Pay WHAT first?', v:null, o:[{val:'the water bill'},{val:'fancy candy',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'new toys',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'tickets',tag:'err_more',patternTag:'err_picks_want_as_need'}], a:0, e:'Pay the water bill.', d:'m'},
      {lessonId:'ku8l2', t:'Which list shows ONLY needs?', v:null, o:[{val:'food, water, home'},{val:'toys, candy, games',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'food, toy, game',tag:'err_same',patternTag:'err_confuses_want_need'},{val:'water, candy, home',tag:'err_same',patternTag:'err_confuses_want_need'}], a:0, e:'All needs.', d:'m'},
      {lessonId:'ku8l2', t:'A toothbrush is a…', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Toothbrushes are NEEDS.', d:'h'},
      {lessonId:'ku8l2', t:'A diamond ring is a…', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'A diamond ring is a WANT.', d:'h'},
      {lessonId:'ku8l2', t:'Soap is a…', v:null, o:[{val:'NEED'},{val:'WANT',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'neither',tag:'err_confused'},{val:'both',tag:'err_same'}], a:0, e:'Soap is a NEED.', d:'h'},
      {lessonId:'ku8l2', t:'Disney World vacation is a…', v:null, o:[{val:'WANT'},{val:'NEED',tag:'err_more',patternTag:'err_picks_want_as_need'},{val:'both',tag:'err_same'},{val:'neither',tag:'err_confused'}], a:0, e:'Vacations are WANTS.', d:'h'},
      {lessonId:'ku8l2', t:'After buying needs, leftover money can buy…', v:null, o:[{val:'wants like toys'},{val:'nothing — only needs',tag:'err_less',patternTag:'err_picks_need_as_want'},{val:'a new job',tag:'err_confused'},{val:'going to bed',tag:'err_confused'}], a:0, e:'Leftover money can buy wants.', d:'h'},

      // ── ku8l3 — Identify Coins (18) ─────────────────────────────────────────
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('penny'), o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — brown, Lincoln.', d:'e'},
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('nickel'), o:[{val:'nickel'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — silver, Jefferson.', d:'e'},
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('dime'), o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Dime — smallest, Roosevelt.', d:'e'},
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('quarter'), o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_wrong_coin'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Quarter — biggest silver coin, Washington.', d:'e'},
      {lessonId:'ku8l3', t:'Which shows Lincoln?', s:singleCoin('penny'), o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Lincoln is on the penny.', d:'e'},
      {lessonId:'ku8l3', t:'Which shows Washington?', s:singleCoin('quarter'), o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Washington is on the quarter.', d:'e'},
      {lessonId:'ku8l3', t:'Which is smallest?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Dime is smallest.', d:'m'},
      {lessonId:'ku8l3', t:'Which is biggest?', v:null, o:[{val:'quarter'},{val:'penny',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Quarter is biggest.', d:'m'},
      {lessonId:'ku8l3', t:'Which is brown?', v:null, o:[{val:'penny'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny is brown.', d:'m'},
      {lessonId:'ku8l3', t:'Which shows Jefferson?', v:null, o:[{val:'nickel'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Jefferson is on the nickel.', d:'m'},
      {lessonId:'ku8l3', t:'Which shows Roosevelt?', v:null, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Roosevelt is on the dime.', d:'m'},
      {lessonId:'ku8l3', t:'Find the nickel.', s:singleCoin('nickel'), o:[{val:'nickel'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Nickel — silver, Jefferson.', d:'m'},
      {lessonId:'ku8l3', t:'Which is brown?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny is the only brown coin.', d:'m'},
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('dime'), v:null, o:[{val:'dime'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_size_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Dime — the smallest silver coin.', d:'h'},
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('quarter'), v:null, o:[{val:'quarter'},{val:'dime',tag:'err_confused',patternTag:'err_size_confusion'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Quarter — the biggest silver coin.', d:'h'},
      {lessonId:'ku8l3', t:'What coin is this?', s:singleCoin('penny'), v:null, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Penny — the only brown coin.', d:'h'},
      {lessonId:'ku8l3', t:'Tap the nickel.', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'nickel'},{val:'penny',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_size_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_size_confusion'}], a:0, e:'Nickel — between dime and quarter in size.', d:'h'},
      {lessonId:'ku8l3', t:'Which shows Lincoln?', v:{type:'coinChoices',config:{coins:['penny','nickel','dime','quarter']}}, o:[{val:'penny'},{val:'nickel',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_coin_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_coin_confusion'}], a:0, e:'Lincoln is on the penny.', d:'h'},

      // ── ku8l4 — Compare Coins (18) ──────────────────────────────────────────
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('quarter','dime'), o:[{val:'quarter'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger.', d:'e'},
      {lessonId:'ku8l4', t:'Which is smaller?', s:twoCoins('nickel','dime'), o:[{val:'dime'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller.', d:'e'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('quarter','penny'), o:[{val:'quarter'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is bigger.', d:'e'},
      {lessonId:'ku8l4', t:'Which is smaller?', s:twoCoins('penny','dime'), o:[{val:'dime'},{val:'penny',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller.', d:'e'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('nickel','dime'), o:[{val:'nickel'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Nickel is bigger than a dime.', d:'e'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('quarter','nickel'), o:[{val:'quarter'},{val:'nickel',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is biggest.', d:'e'},
      {lessonId:'ku8l4', t:'Find the matching coin.', s:singleCoin('penny'), o:[{val:'another penny'},{val:'nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'dime',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_visual_confusion'}], a:0, e:'Another penny matches.', d:'e'},
      {lessonId:'ku8l4', t:'Find the matching coin.', s:singleCoin('dime'), o:[{val:'another dime'},{val:'penny',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'quarter',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'nickel',tag:'err_confused',patternTag:'err_visual_confusion'}], a:0, e:'Another dime matches.', d:'e'},
      {lessonId:'ku8l4', t:'Which is smaller?', s:twoCoins('nickel','dime'), o:[{val:'dime'},{val:'nickel',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is smaller than a nickel.', d:'m'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('nickel','quarter'), o:[{val:'quarter'},{val:'nickel',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is biggest.', d:'m'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('penny','dime'), o:[{val:'penny'},{val:'dime',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is bigger than a dime.', d:'m'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('quarter','penny'), o:[{val:'quarter'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is biggest.', d:'m'},
      {lessonId:'ku8l4', t:'Which is smaller?', s:twoCoins('penny','quarter'), o:[{val:'penny'},{val:'quarter',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Penny is smaller than a quarter.', d:'m'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('nickel','penny'), o:[{val:'nickel'},{val:'penny',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Nickel is bigger than a penny.', d:'h'},
      {lessonId:'ku8l4', t:'Which is smaller?', s:twoCoins('penny','dime'), o:[{val:'dime'},{val:'penny',tag:'err_more',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Dime is the smallest coin.', d:'h'},
      {lessonId:'ku8l4', t:'Which is different?', v:null, o:[{val:'dime'},{val:'first penny',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'second penny',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'all the same',tag:'err_same'}], a:0, e:'Dime is different — silver and small.', d:'h', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('penny',80)+coinSVG('penny',80)+coinSVG('dime',80)+'</div>'},
      {lessonId:'ku8l4', t:'Which is different?', v:null, o:[{val:'penny'},{val:'first nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'second nickel',tag:'err_confused',patternTag:'err_visual_confusion'},{val:'all the same',tag:'err_same'}], a:0, e:'Penny is brown — different color.', d:'h', s:'<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0">'+coinSVG('nickel',80)+coinSVG('nickel',80)+coinSVG('penny',80)+'</div>'},
      {lessonId:'ku8l4', t:'Which is bigger?', s:twoCoins('quarter','nickel'), o:[{val:'quarter'},{val:'nickel',tag:'err_less',patternTag:'err_size_confusion'},{val:'same',tag:'err_same'},{val:'cannot tell',tag:'err_confused'}], a:0, e:'Quarter is the biggest coin.', d:'h'}
    ]
  });
})();
