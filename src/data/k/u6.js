// Kindergarten Unit 6: Geometry — Shapes & Solids
// Covers TEKS K.6A (2D shapes), K.6B–C (3D solids & faces), K.6D (attributes), K.6E–F (sort & create)
// Calls _mergeKUnitData — available globally from shared_k.js in the app bundle.
_mergeKUnitData(5, {
  lessons: [

    // ── Lesson 1: Flat Shapes (2D) — K.6A ───────────────────────────────────
    {
      points: [
        'A circle is perfectly round — no corners, no sides',
        'A triangle has 3 sides and 3 corners',
        'A square has 4 equal sides and 4 corners. A rectangle has 4 sides and 4 corners but the sides are not all equal'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Name the Shape',
          p: 'What is the name of this shape?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          s: 'Count the sides: 1, 2, 3 — three sides means triangle!',
          a: 'Triangle ✅'
        },
        {
          c: '#1976D2',
          tag: 'Round Shape',
          p: 'Which shape is perfectly round with no corners?',
          v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
          s: 'A circle has no sides and no corners — it is perfectly round.',
          a: 'Circle ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Four Sides',
          p: 'This shape has 4 equal sides and 4 corners. What is it?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          s: 'All 4 sides are the same length — that makes it a square!',
          a: 'Square ✅'
        }
      ],
      practice: [
        {q:'A stop sign has many sides. A triangle has ___ sides?', a:'3', h:'Count: 1 side, 2 sides, 3 sides', e:'3 sides — a triangle always has 3! ✅'},
        {q:'A book cover has 4 corners. What shape is it?', a:'Rectangle', h:'4 corners, 2 long sides, 2 short sides', e:'Rectangle! 4 corners and sides that are not all equal ✅'},
        {q:'Which shape has NO corners?', a:'Circle', h:'Round and no pointy corners', e:'Circle — round with no corners and no sides! ✅'}
      ],
      qBank: [
        // ── easy — basic shape identification ───────────────────────────────
        {
          t: 'Tap the shape with no corners.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle'},{val:'triangle',tag:'err_shape_sort'},{val:'square',tag:'err_shape_sort'},{val:'rectangle',tag:'err_shape_sort'}],
          a:0, e:'A circle is round — no corners, no sides.', d:'e', s:null, h:'Which shape has no pointy corners?'
        },
        {
          t: 'Tap the shape with 3 sides.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle',tag:'err_shape_sort'},{val:'triangle'},{val:'square',tag:'err_off_by_one'},{val:'rectangle',tag:'err_off_by_one'}],
          a:1, e:'A triangle has 3 sides.', d:'e', s:null, h:'Count the sides on each shape.'
        },
        {
          t: 'Tap the shape with all sides equal.',
          v: { type: 'shapes', config: { items: ['rectangle','square'], cols: 2, label: 'A rectangle and a square' } },
          o: [{val:'rectangle',tag:'err_random'},{val:'square'}],
          a:1, e:'A square has all 4 sides the same length.', d:'e', s:null, h:'Look at both — which has equal sides?'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          o: [{val:'triangle'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'A triangle has 3 sides and 3 corners.', d:'e', s:null, h:'Count the corners: 1, 2, 3'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
          o: [{val:'circle'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'A circle is round with no corners.', d:'e', s:null, h:'Perfectly round — no pointy corners'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'A square has 4 equal sides and 4 corners.', d:'e', s:null, h:'Count the sides — are they all the same length?'
        },
        {
          t: 'Look at the pizza slice. What shape is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🍕', layout: 'line' } },
          o: [{val:'triangle'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'A pizza slice has 3 sides — it is a triangle.', d:'e', s:null, h:'Count the straight sides on the slice.'
        },
        {
          t: 'Look at the book cover. What shape is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '📕', layout: 'line' } },
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'A book cover has 4 sides — a rectangle.', d:'e', s:null, h:'Count the corners and sides.'
        },
        {
          t: 'Look at the door. What shape is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🚪', layout: 'line' } },
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'A door is a rectangle — 4 corners, tall sides.', d:'e', s:null, h:'Is it round or does it have 4 corners?'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'A square has 4 equal sides and 4 corners.', d:'e', s:null, h:'All 4 sides are the same length.'
        },
        // ── medium — shape in context, comparisons ───────────────────────────
        {
          t: 'Look at the clock face. What shape is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🕐', layout: 'line' } },
          o: [{val:'circle'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'A clock face is round — a circle.', d:'m', s:null, h:'Is it round or has corners?'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'A triangle has 3 sides and 3 corners.', d:'m', s:null, h:'Count the corners.'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'A rectangle has 4 corners and 4 sides.', d:'m', s:null, h:'Count the corners — tall and wide.'
        },
        {
          t: 'Which two shapes both have 4 corners?',
          v: { type: 'shapes', config: { items: ['square','rectangle'], cols: 2, label: 'A square and a rectangle' } },
          o: [{val:'square and rectangle'},{val:'triangle and circle',tag:'err_random'},{val:'square and triangle',tag:'err_random'},{val:'circle and rectangle',tag:'err_random'}],
          a:0, e:'Square and rectangle both have 4 corners.', d:'m', s:null, h:'Count corners on each shape'
        },
        {
          t: 'Tap the shape with more sides.',
          v: { type: 'shapes', config: { items: ['triangle','rectangle'], cols: 2, label: 'A triangle and a rectangle' } },
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'}],
          a:1, e:'A rectangle has 4 sides; a triangle has 3.', d:'m', s:null, h:'Count sides on each shape.'
        },
        {
          t: 'How many sides does a rectangle have?',
          v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'A rectangle has 4 sides.', d:'m', s:null, h:'Count each side: top, bottom, left, right'
        },
        {
          t: 'Look at the yield sign. What shape is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '⚠️', layout: 'line' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'A yield sign has 3 corners — a triangle.', d:'m', s:null, h:'Count each corner.'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'A square has 4 equal sides and 4 corners.', d:'m', s:null, h:'All 4 sides are the same length.'
        },
        {
          t: 'Tap the shape with no sides.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle'},{val:'triangle',tag:'err_shape_sort'},{val:'square',tag:'err_shape_sort'},{val:'rectangle',tag:'err_shape_sort'}],
          a:0, e:'A circle is round with no straight sides.', d:'m', s:null, h:'Which shape has no straight edges?'
        },
        {
          t: 'Look at the ruler. What shape is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '📏', layout: 'line' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:3, e:'A ruler is long and thin — a rectangle.', d:'m', s:null, h:'Long and thin with 4 corners.'
        },
        // ── hard — orientation, comparisons, classification ──────────────────
        {
          t: 'A triangle is turned upside-down. What shape is it still?',
          v: { type: 'shapes', config: { items: ['triangle'], rotation: 180, label: 'An upside-down triangle' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_shape_orient'},{val:'rectangle',tag:'err_shape_orient'}],
          a:1, e:'Turning a shape does not change what it is.', d:'h', s:null, h:'Count the corners — do they change when turned?'
        },
        {
          t: 'A square is tilted sideways. What shape is it now?',
          v: { type: 'shapes', config: { items: ['square'], rotation: 45, label: 'A tilted square' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'diamond',tag:'err_shape_orient'},{val:'square'}],
          a:3, e:'Tilting does not change the shape — it is still a square.', d:'h', s:null, h:'Count the sides — do they change when tilted?'
        },
        {
          t: 'Tap the shape with sides all the same length.',
          v: { type: 'shapes', config: { items: ['rectangle','square'], cols: 2, label: 'A rectangle and a square' } },
          o: [{val:'rectangle',tag:'err_random'},{val:'square'}],
          a:1, e:'A square has all 4 sides equal. A rectangle does not.', d:'h', s:null, h:'Look at the side lengths — which are all equal?'
        },
        {
          t: 'How many MORE sides does a square have than a triangle?',
          v: { type: 'shapes', config: { items: ['square','triangle'], cols: 2, label: 'A square and a triangle' } },
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_random'}],
          a:1, e:'Square has 4, triangle has 3. 4 − 3 = 1.', d:'h', s:null, h:'Square = 4 sides; triangle = 3 sides'
        },
        {
          t: 'Tap the shape where the sides are NOT all equal.',
          v: { type: 'shapes', config: { items: ['rectangle','square'], cols: 2, label: 'A rectangle and a square' } },
          o: [{val:'rectangle'},{val:'square',tag:'err_random'}],
          a:0, e:'A rectangle has sides that are not all the same length.', d:'h', s:null, h:'Look at the longer and shorter sides.'
        },
        {
          t: 'Tap the shape with fewer corners.',
          v: { type: 'shapes', config: { items: ['triangle','square'], cols: 2, label: 'A triangle and a square' } },
          o: [{val:'triangle'},{val:'square',tag:'err_off_by_one'}],
          a:0, e:'A triangle has 3 corners; a square has 4.', d:'h', s:null, h:'Count corners on each shape.'
        },
        {
          t: 'Tap the round shape.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle'},{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:0, e:'A circle is the only round shape — no corners, no sides.', d:'h', s:null, h:'Which shape has no straight sides or corners?'
        },
        {
          t: 'Which of these is NOT a 2D flat shape?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'cube'},{val:'square',tag:'err_random'}],
          a:2, e:'A cube is a 3D solid — you can hold it.', d:'h', s:null, h:'Which one can you hold like a box?'
        },
        // ── tapGroup: identify shapes by name ─────────────────────────────────
        {
          id:'k-u6-l1-tg-01', type:'tapGroup', grade:'K', unit:6, lesson:1,
          t:'Tap all the triangles.',
          prompt:'Tap all the triangles.',
          hint:'Look for the pointy shapes!',
          explanation:'Triangles are pointy shapes — they have 3 sides!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'triangle',corners:3,correct:true},
            {id:'s2',shape:'circle',  corners:0,correct:false},
            {id:'s3',shape:'triangle',corners:3,correct:true},
            {id:'s4',shape:'square',  corners:4,correct:false},
            {id:'s5',shape:'triangle',corners:3,correct:true}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'triangle',corners:3,correct:true},
            {id:'s2',shape:'circle',  corners:0,correct:false},
            {id:'s3',shape:'triangle',corners:3,correct:true},
            {id:'s4',shape:'square',  corners:4,correct:false},
            {id:'s5',shape:'triangle',corners:3,correct:true}
          ]}},
          tags:['shapes','triangle','identify'],
          difficulty:'easy', standard:'K.6A',
          intervention:{ teach:{ text:'Triangles are the pointy shapes!', highlight:['triangle'] }, retry:{ strategy:'similar', matchTags:['triangle','identify'] } }
        },
        {
          id:'k-u6-l1-tg-02', type:'tapGroup', grade:'K', unit:6, lesson:1,
          t:'Tap the circles.',
          prompt:'Tap the circles.',
          hint:'Circles are the round shapes!',
          explanation:'Circles are round!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'triangle', corners:3,correct:false},
            {id:'s3',shape:'circle',   corners:0,correct:true},
            {id:'s4',shape:'square',   corners:4,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'triangle', corners:3,correct:false},
            {id:'s3',shape:'circle',   corners:0,correct:true},
            {id:'s4',shape:'square',   corners:4,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          tags:['shapes','circle','identify','round'],
          difficulty:'easy', standard:'K.6A',
          intervention:{ teach:{ text:'Circles are the round shapes!', highlight:['circle'] }, retry:{ strategy:'similar', matchTags:['circle','identify'] } }
        }
      ]
    },

    // ── Lesson 2: Solid Shapes (3D) — K.6B, K.6C ────────────────────────────
    {
      points: [
        'A sphere is round like a ball — it has NO flat faces',
        'A cube has 6 flat square faces — like a box',
        'A cone has 1 flat circular face and a pointy top. A cylinder has 2 flat circular faces and a curved side'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Sphere',
          p: 'A ball is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🎱', layout: 'line' } },
          s: 'A sphere is perfectly round like a ball — no flat faces, no corners!',
          a: 'Sphere ✅'
        },
        {
          c: '#1976D2',
          tag: 'Cube',
          p: 'A box has 6 flat square faces. What solid is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          s: 'A cube has 6 flat faces — all shaped like squares!',
          a: 'Cube ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Cone',
          p: 'An ice cream cone has a pointy top and 1 flat circle at the bottom. What solid is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🍦', layout: 'line' } },
          s: 'A cone has a pointed top and 1 flat circular face at the bottom!',
          a: 'Cone ✅'
        }
      ],
      practice: [
        {q:'A soup can is shaped like which solid?', a:'Cylinder', h:'Round tube with flat circles on top and bottom', e:'Cylinder! Two flat circles and a curved side ✅'},
        {q:'Which solid has NO flat faces at all?', a:'Sphere', h:'Perfectly round, like a ball', e:'Sphere — totally round, no flat faces! ✅'},
        {q:'The flat face of a cube is shaped like which 2D shape?', a:'Square', h:'Look at one side of a cube', e:'Square! Every flat face of a cube is a square ✅'}
      ],
      qBank: [
        // ── easy — name the solid ────────────────────────────────────────────
        {
          t: 'A ball is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🎱', layout: 'line' } },
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'A sphere is round like a ball.', d:'e', s:null, h:'Round with no flat faces — which solid?'
        },
        {
          t: 'An ice cream cone is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🍦', layout: 'line' } },
          o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:1, e:'A cone has a pointy top and a flat circle on the bottom.', d:'e', s:null, h:'Which solid has a pointy tip at the top?'
        },
        {
          t: 'A soup can is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder'}],
          a:3, e:'A cylinder is a round tube with flat circles on top and bottom.', d:'e', s:null, h:'Round tube with flat circles on each end'
        },
        {
          t: 'A block toy box is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'cube'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:0, e:'A cube has 6 flat square faces.', d:'e', s:null, h:'6 flat square faces — like a box'
        },
        {
          t: 'Look at the ball. Which solid is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '⚽', layout: 'line' } },
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'A ball is a sphere — perfectly round.', d:'e', s:null, h:'Round with no flat parts.'
        },
        {
          t: 'Look at the can. Which solid is it?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'cylinder'},{val:'sphere',tag:'err_random'}],
          a:2, e:'A can is a cylinder — round tube with flat ends.', d:'e', s:null, h:'Round tube with flat circles.'
        },
        {
          t: 'A globe is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🎱', layout: 'line' } },
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'A sphere is round like a ball — and a globe!', d:'e', s:null, h:'A globe is perfectly round — which solid is that?'
        },
        {
          t: 'Which solid has a pointy top?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:1, e:'A cone has a pointy top and a flat circle on the bottom.', d:'e', s:null, h:'Which solid has a pointed tip at the very top?'
        },
        {
          t: 'A game die (like in board games) is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'cube'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:0, e:'A cube has 6 flat square faces.', d:'e', s:null, h:'This solid has flat square faces on every side'
        },
        {
          t: 'Which solid has all flat square faces?',
          v: null,
          o: [{val:'cube'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:0, e:'A cube has 6 flat square faces.', d:'e', s:null, h:'Every flat face is a square — which solid?'
        },
        // ── medium — faces, surfaces, real-world ─────────────────────────────
        {
          t: 'A sphere can roll in any direction because its surface is ___?',
          v: null,
          o: [{val:'flat',tag:'err_random'},{val:'pointed',tag:'err_random'},{val:'curved'},{val:'square',tag:'err_random'}],
          a:2, e:'A curved surface lets it roll in any direction.', d:'m', s:null, h:'What kind of surface lets things roll?'
        },
        {
          t: 'A cube has how many flat faces?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'},{val:'8',tag:'err_random'}],
          a:2, e:'A cube has 6 flat faces: top, bottom, front, back, left, right.', d:'m', s:null, h:'Count all the flat sides of a box'
        },
        {
          t: 'A cone has how many flat faces?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🍦', layout: 'line' } },
          o: [{val:'0',tag:'err_off_by_one'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'}],
          a:1, e:'A cone has 1 flat face — the circle at the bottom.', d:'m', s:null, h:'Look at the bottom of a cone'
        },
        {
          t: 'A cylinder has how many flat faces?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'6',tag:'err_random'}],
          a:1, e:'A cylinder has 2 flat faces — one on top and one on the bottom.', d:'m', s:null, h:'Top face and bottom face — count them!'
        },
        {
          t: 'Which solid rolls in ANY direction on a flat floor?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere'},{val:'cylinder',tag:'err_random'}],
          a:2, e:'A sphere is curved all around — it rolls any direction.', d:'m', s:null, h:'Which solid is round in every direction?'
        },
        {
          t: 'A birthday party hat is shaped like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🍦', layout: 'line' } },
          o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
          a:1, e:'A cone has a pointy top and round base.', d:'m', s:null, h:'Pointy top and round base — which solid?'
        },
        {
          t: 'A drum is shaped most like which solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder'}],
          a:3, e:'A cylinder is a round tube with flat circles on top and bottom.', d:'m', s:null, h:'Round tube with flat circles on each end'
        },
        {
          t: 'The flat face of a CUBE is shaped like which 2D shape?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'circle',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'Every face of a cube is a square.', d:'m', s:null, h:'Look at one side of a cube — what shape is it?'
        },
        {
          t: 'The flat face of a CYLINDER is shaped like which 2D shape?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
          o: [{val:'square',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_wrong_solid'}],
          a:2, e:'Both flat faces of a cylinder are circles.', d:'m', s:null, h:'Round ends — what flat shape is round?'
        },
        {
          t: 'Which solid has NO flat faces at all?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:2, e:'A sphere is all curved — no flat faces.', d:'m', s:null, h:'Totally round — no flat part at all!'
        },
        // ── hard — properties, comparisons, faces of solids ─────────────────
        {
          t: 'A cone and a cylinder — what do they BOTH have?',
          v: null,
          o: [{val:'only flat faces',tag:'err_random'},{val:'a pointed top',tag:'err_random'},{val:'a circle on the bottom'},{val:'6 faces',tag:'err_random'}],
          a:2, e:'Both have a circle on the bottom! Cone has 1 circle; cylinder has 2.', d:'h', s:null, h:'Look at the bottom of each solid'
        },
        {
          t: 'How many corners does a cube have?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'4',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'8'},{val:'12',tag:'err_random'}],
          a:2, e:'A cube has 8 corners.', d:'h', s:null, h:'Count all the corner points on a box'
        },
        {
          t: 'Which solid has 2 flat circular faces AND 1 curved side?',
          v: null,
          o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere',tag:'err_wrong_solid'},{val:'cylinder'}],
          a:3, e:'A cylinder has two flat circles plus a curved middle.', d:'h', s:null, h:'Which has flat circles on both ends?'
        },
        {
          t: 'A cube has 6 faces. What shape is each flat face?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'circle',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'All 6 faces of a cube are squares.', d:'h', s:null, h:'Look at one side of a cube'
        },
        {
          t: 'Which solid CANNOT roll?',
          v: null,
          o: [{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'cube'}],
          a:3, e:'A cube has all flat faces — it cannot roll.', d:'h', s:null, h:'Which solid has only flat sides with no curves?'
        },
        {
          t: 'A sphere is like a circle but it is ___?',
          v: null,
          o: [{val:'flat',tag:'err_wrong_solid'},{val:'smaller',tag:'err_random'},{val:'3D — you can hold it'},{val:'a different color',tag:'err_random'}],
          a:2, e:'A sphere is 3D — you can hold it like a ball.', d:'h', s:null, h:'Can you hold it or is it just drawn flat?'
        },
        {
          t: 'A cone has 1 flat face. What 2D shape is that flat face?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🍦', layout: 'line' } },
          o: [{val:'square',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_wrong_solid'}],
          a:2, e:'The bottom face of a cone is a circle.', d:'h', s:null, h:'Look at the round bottom of a cone'
        },
        {
          t: 'Which solid has only a curved surface — no flat faces?',
          v: null,
          o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_wrong_solid'},{val:'cylinder',tag:'err_wrong_solid'},{val:'sphere'}],
          a:3, e:'A sphere is totally curved — no flat part at all.', d:'h', s:null, h:'Totally curved with no flat part at all'
        },
        {
          t: 'A cylinder can roll on its side. A cube cannot. Why?',
          v: null,
          o: [{val:'the cube is heavier',tag:'err_random'},{val:'the cylinder has a curved surface'},{val:'the cube has more faces',tag:'err_random'},{val:'the cylinder is smaller',tag:'err_random'}],
          a:1, e:'A curved surface lets the cylinder roll.', d:'h', s:null, h:'What does a curved surface allow?'
        }
      ]
    },

    // ── Lesson 3: Shape Attributes — Sides & Corners — K.6D ─────────────────
    {
      points: [
        'SIDES are the straight lines that make up a shape',
        'CORNERS (vertices) are the pointy places where two sides meet',
        'Count each side or corner one at a time — touch each one!'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Count the Sides',
          p: 'How many sides does a triangle have?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          s: 'Trace each side: 1 side, 2 sides, 3 sides. A triangle has 3 sides!',
          a: '3 sides ✅'
        },
        {
          c: '#1976D2',
          tag: 'Count the Corners',
          p: 'How many corners does a square have?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          s: 'Touch each corner: 1, 2, 3, 4. A square has 4 corners!',
          a: '4 corners ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Circles are Different',
          p: 'How many corners does a circle have?',
          v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
          s: 'A circle is round — it has NO corners and NO sides!',
          a: '0 corners ✅'
        }
      ],
      practice: [
        {q:'How many sides does a rectangle have?', a:'4', h:'Count each side: top, bottom, left, right', e:'4 sides — rectangles always have 4! ✅'},
        {q:'Which shape has MORE corners — a triangle or a rectangle?', a:'Rectangle (4 corners)', h:'Triangle = 3 corners; rectangle = 4 corners', e:'Rectangle! It has 4 corners; triangle only has 3 ✅'},
        {q:'How many total corners do a square and a triangle have together?', a:'7 (4 + 3)', h:'Square = 4 corners; triangle = 3 corners', e:'4 + 3 = 7 corners together! ✅'}
      ],
      qBank: [
        // ── easy — basic attribute counting ─────────────────────────────────
        {
          t: 'How many sides does a triangle have?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
          a:1, e:'A triangle has 3 sides.', d:'e', s:null, h:'Touch and count each side: 1, 2, 3'
        },
        {
          t: 'How many corners does a square have?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'A square has 4 corners.', d:'e', s:null, h:'Count each pointy corner'
        },
        {
          t: 'How many sides does a rectangle have?',
          v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'A rectangle has 4 sides.', d:'e', s:null, h:'Count each side: top, bottom, left, right'
        },
        {
          t: 'How many corners does a circle have?',
          v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:0, e:'A circle is round — no pointy corners.', d:'e', s:null, h:'Is a circle round or pointy?'
        },
        {
          t: 'How many corners does a triangle have?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
          a:2, e:'A triangle has 3 corners.', d:'e', s:null, h:'Touch each pointy corner'
        },
        {
          t: 'How many sides does a square have?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_random'}],
          a:2, e:'A square has 4 sides.', d:'e', s:null, h:'Count each straight line side'
        },
        {
          t: 'How many sides does a circle have?',
          v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
          o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:0, e:'A circle has no straight sides.', d:'e', s:null, h:'Round shapes have no straight sides'
        },
        {
          t: 'How many corners does a rectangle have?',
          v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'6',tag:'err_random'}],
          a:2, e:'A rectangle has 4 corners.', d:'e', s:null, h:'Count each corner of the rectangle'
        },
        {
          t: 'Tap the shape with 3 sides.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle',tag:'err_shape_sort'},{val:'triangle'},{val:'square',tag:'err_off_by_one'},{val:'rectangle',tag:'err_off_by_one'}],
          a:1, e:'A triangle has 3 sides.', d:'e', s:null, h:'Count the straight sides on each shape.'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'rectangle',tag:'err_random'},{val:'square'}],
          a:3, e:'A square has 4 equal sides.', d:'e', s:null, h:'All 4 sides are the same length.'
        },
        // ── medium — comparisons, identifying by attribute ───────────────────
        {
          t: 'Tap the shape with more corners.',
          v: { type: 'shapes', config: { items: ['triangle','rectangle'], cols: 2, label: 'A triangle and a rectangle' } },
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'}],
          a:1, e:'A rectangle has 4 corners; a triangle has 3.', d:'m', s:null, h:'Count corners on each shape.'
        },
        {
          t: 'How many more sides does a square have than a triangle?',
          v: { type: 'shapes', config: { items: ['square','triangle'], cols: 2, label: 'A square and a triangle' } },
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_random'}],
          a:1, e:'Square has 4; triangle has 3. 4 − 3 = 1.', d:'m', s:null, h:'Square = 4 sides; triangle = 3 sides'
        },
        {
          t: 'A shape has 4 corners. What shape could it be?',
          v: null,
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'none of them',tag:'err_random'}],
          a:2, e:'Rectangle! It has 4 corners. (Square also has 4!)', d:'m', s:null, h:'Which shapes have 4 corners?'
        },
        {
          t: 'Tap the shape with 3 corners.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle',tag:'err_shape_sort'},{val:'triangle'},{val:'square',tag:'err_off_by_one'},{val:'rectangle',tag:'err_off_by_one'}],
          a:1, e:'A triangle has 3 corners.', d:'m', s:null, h:'Count the pointy corners on each shape.'
        },
        {
          t: 'Tap the shape with fewer corners.',
          v: { type: 'shapes', config: { items: ['triangle','square'], cols: 2, label: 'A triangle and a square' } },
          o: [{val:'triangle'},{val:'square',tag:'err_off_by_one'}],
          a:0, e:'A triangle has 3 corners; a square has 4.', d:'m', s:null, h:'Count corners on each shape.'
        },
        {
          t: 'How many more corners does a square have than a triangle?',
          v: { type: 'shapes', config: { items: ['square','triangle'], cols: 2, label: 'A square and a triangle' } },
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:1, e:'Square has 4; triangle has 3. 4 − 3 = 1.', d:'m', s:null, h:'Count each, then find the difference'
        },
        {
          t: 'Tap the rectangle.',
          v: { type: 'shapes', config: { items: ['square','rectangle'], cols: 2, label: 'A square and a rectangle' } },
          o: [{val:'square',tag:'err_random'},{val:'rectangle'}],
          a:1, e:'A rectangle has 4 sides not all the same length.', d:'m', s:null, h:'The longer shape is the rectangle.'
        },
        {
          t: 'How many fewer corners does a triangle have than a rectangle?',
          v: { type: 'shapes', config: { items: ['triangle','rectangle'], cols: 2, label: 'A triangle and a rectangle' } },
          o: [{val:'0',tag:'err_random'},{val:'1'},{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_random'}],
          a:1, e:'Rectangle has 4; triangle has 3. 4 − 3 = 1.', d:'m', s:null, h:'Rectangle = 4 corners; triangle = 3 corners'
        },
        {
          t: 'Tap the shape with more sides.',
          v: { type: 'shapes', config: { items: ['square','triangle'], cols: 2, label: 'A square and a triangle' } },
          o: [{val:'square'},{val:'triangle',tag:'err_off_by_one'}],
          a:0, e:'A square has 4 sides; a triangle has 3.', d:'m', s:null, h:'Count sides on each shape.'
        },
        {
          t: 'Tap the shape with 0 sides.',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
          o: [{val:'circle'},{val:'triangle',tag:'err_shape_sort'},{val:'square',tag:'err_shape_sort'},{val:'rectangle',tag:'err_shape_sort'}],
          a:0, e:'A circle has no sides — it is just a curve.', d:'m', s:null, h:'Which shape has no straight edges?'
        },
        // ── hard — totals, comparisons, combined reasoning ───────────────────
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
          a:2, e:'A square has 4 corners and all sides the same length.', d:'h', s:null, h:'Count the sides — are they all equal?'
        },
        {
          t: 'How many total sides do 2 triangles have?',
          v: { type: 'shapes', config: { items: ['triangle','triangle'], cols: 2, label: 'Two triangles' } },
          o: [{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_off_by_one'},{val:'6'}],
          a:3, e:'Each triangle has 3 sides. 3 + 3 = 6.', d:'h', s:null, h:'One triangle = 3 sides. Two triangles = ?'
        },
        {
          t: 'How many total corners do 1 square and 1 triangle have together?',
          v: { type: 'shapes', config: { items: ['square','triangle'], cols: 2, label: 'A square and a triangle' } },
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
          a:3, e:'Square has 4 corners + triangle has 3 corners = 7.', d:'h', s:null, h:'Square = 4 corners; triangle = 3 corners'
        },
        {
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
          o: [{val:'triangle',tag:'err_random'},{val:'rectangle'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'}],
          a:1, e:'A rectangle has 4 corners and 4 sides.', d:'h', s:null, h:'Count the corners — how many?'
        },
        {
          t: 'A triangle has 3 sides. A square has 4. How many sides do they have TOGETHER?',
          v: { type: 'shapes', config: { items: ['triangle','square'], cols: 2, label: 'A triangle and a square' } },
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
          a:3, e:'3 sides + 4 sides = 7 sides together.', d:'h', s:null, h:'Add the sides: 3 + 4 = ?'
        },
        {
          t: 'How many corners does a square have?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'A square has 4 corners.', d:'h', s:null, h:'Count each pointy corner.'
        },
        {
          t: 'How many total sides do 1 triangle and 1 rectangle have together?',
          v: { type: 'shapes', config: { items: ['triangle','rectangle'], cols: 2, label: 'A triangle and a rectangle' } },
          o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
          a:3, e:'Triangle has 3 sides + rectangle has 4 sides = 7.', d:'h', s:null, h:'3 + 4 = ?'
        },
        {
          t: 'How many total corners do 2 squares have?',
          v: { type: 'shapes', config: { items: ['square','square'], cols: 2, label: 'Two squares' } },
          o: [{val:'4',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'}],
          a:3, e:'Each square has 4 corners. 4 + 4 = 8.', d:'h', s:null, h:'One square = 4 corners. Two squares = ?'
        },
        {
          t: 'Tap the shape with more corners.',
          v: { type: 'shapes', config: { items: ['triangle','circle'], cols: 2, label: 'A triangle and a circle' } },
          o: [{val:'triangle'},{val:'circle',tag:'err_random'}],
          a:0, e:'A triangle has 3 corners; a circle has 0.', d:'h', s:null, h:'Which shape has pointy corners?'
        },
        // ── tapGroup: corners ─────────────────────────────────────────────────
        {
          id:'k-u6-l3-tg-01', type:'tapGroup', grade:'K', unit:6, lesson:3,
          t:'Find the shapes with 3 corners.',
          prompt:'Find the shapes with 3 corners.',
          hint:'Touch each corner: 1, 2, 3!',
          explanation:'Triangles have 3 corners!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'triangle', corners:3,correct:true},
            {id:'s2',shape:'square',   corners:4,correct:false},
            {id:'s3',shape:'triangle', corners:3,correct:true},
            {id:'s4',shape:'circle',   corners:0,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'triangle', corners:3,correct:true},
            {id:'s2',shape:'square',   corners:4,correct:false},
            {id:'s3',shape:'triangle', corners:3,correct:true},
            {id:'s4',shape:'circle',   corners:0,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          tags:['shapes','corners','triangle','identify'],
          difficulty:'easy', standard:'K.6D',
          intervention:{ teach:{ text:'Touch each corner: 1, 2, 3! That shape is a triangle.', highlight:['triangle'] }, retry:{ strategy:'similar', matchTags:['corners','identify'] } }
        },
        {
          id:'k-u6-l3-tg-02', type:'tapGroup', grade:'K', unit:6, lesson:3,
          t:'Find the shapes with 4 corners.',
          prompt:'Find the shapes with 4 corners.',
          hint:'Count each corner: 1, 2, 3, 4!',
          explanation:'Squares and rectangles have 4 corners!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'square',   corners:4,correct:true},
            {id:'s2',shape:'circle',   corners:0,correct:false},
            {id:'s3',shape:'rectangle',corners:4,correct:true},
            {id:'s4',shape:'triangle', corners:3,correct:false},
            {id:'s5',shape:'square',   corners:4,correct:true}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'square',   corners:4,correct:true},
            {id:'s2',shape:'circle',   corners:0,correct:false},
            {id:'s3',shape:'rectangle',corners:4,correct:true},
            {id:'s4',shape:'triangle', corners:3,correct:false},
            {id:'s5',shape:'square',   corners:4,correct:true}
          ]}},
          tags:['shapes','corners','square','rectangle','identify'],
          difficulty:'easy', standard:'K.6D',
          distractors:{ type:'conceptual', rationale:'circle (0) tests zero-confusion; triangle (3) tests near-miss' },
          intervention:{ teach:{ text:'Count each corner: 1, 2, 3, 4! Squares and rectangles both have 4.', highlight:['square','rectangle'] }, retry:{ strategy:'similar', matchTags:['corners','identify'] } }
        },
        {
          id:'k-u6-l3-tg-03', type:'tapGroup', grade:'K', unit:6, lesson:3,
          t:'Tap the round shapes.',
          prompt:'Tap the round shapes.',
          hint:'Round shapes feel smooth — no pointy corners!',
          explanation:'Circles are round — no corners!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'triangle', corners:3,correct:false},
            {id:'s3',shape:'circle',   corners:0,correct:true},
            {id:'s4',shape:'square',   corners:4,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'triangle', corners:3,correct:false},
            {id:'s3',shape:'circle',   corners:0,correct:true},
            {id:'s4',shape:'square',   corners:4,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          tags:['shapes','corners','circle','identify','zero'],
          difficulty:'easy', standard:'K.6D',
          intervention:{ teach:{ text:'Circles are round — no pointy corners!', highlight:['circle'] }, retry:{ strategy:'similar', matchTags:['corners','identify'] } }
        }
      ]
    },

    // ── Lesson 4: Sort & Create Shapes — K.6E, K.6F ─────────────────────────
    {
      points: [
        'You can SORT shapes by number of sides, corners, or whether they are round or flat',
        'Shapes stay the SAME even when you turn or flip them — a tilted triangle is still a triangle!',
        'You can CREATE shapes by drawing or building with straight and curved lines'
      ],
      examples: [
        {
          c: '#2196F3',
          tag: 'Sort by Sides',
          p: 'How many of these shapes have 4 sides?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          s: 'Square and rectangle both have 4 sides. Circle has 0; triangle has 3. That is 2 shapes!',
          a: '2 shapes have 4 sides ✅'
        },
        {
          c: '#1976D2',
          tag: 'Shape Still the Same',
          p: 'A triangle is tilted to the side. Which group does it go in?',
          v: { type: 'shapes', config: { items: ['triangle'], rotation: 90, label: 'A tilted triangle' } },
          s: 'A tilted triangle is still a triangle! Count its corners — still 3!',
          a: 'Triangles ✅'
        },
        {
          c: '#0D47A1',
          tag: 'Draw a Shape',
          p: 'How many straight lines do you need to draw a triangle?',
          v: null,
          s: 'A triangle has 3 sides — so you need 3 straight lines!',
          a: '3 lines ✅'
        }
      ],
      practice: [
        {q:'Which shapes go in the "4 corners" group?', a:'Square and rectangle', h:'Which shapes have exactly 4 corners?', e:'Square and rectangle both have 4 corners ✅'},
        {q:'To draw a square, how many equal straight lines do you need?', a:'4', h:'A square has 4 equal sides', e:'4 equal lines — one for each side of the square ✅'},
        {q:'A triangle is turned upside-down. You sort it. Where does it go?', a:'Triangles group', h:'Turning a shape does not change what it is!', e:'Triangles group — a turned triangle is still a triangle ✅'}
      ],
      qBank: [
        // ── easy — sorting basics, drawing ───────────────────────────────────
        {
          type:'classify',
          t: 'Which group has shapes with 4 sides?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'circles only',tag:'err_random'},{val:'triangles only',tag:'err_random'},{val:'squares and rectangles'},{val:'circles and triangles',tag:'err_random'}],
          a:2, e:'Squares and rectangles both have 4 sides.', d:'e', s:null, h:'Which shapes have 4 sides?'
        },
        {
          type:'classify',
          t: 'Which group has shapes with 3 corners?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'circles only',tag:'err_random'},{val:'triangles only'},{val:'squares only',tag:'err_random'},{val:'rectangles only',tag:'err_random'}],
          a:1, e:'Triangles! Triangles have 3 corners.', d:'e', s:null, h:'Which shape always has 3 corners?'
        },
        {
          type:'sort-most',
          t: 'Which shape has the MOST sides?',
          v: { type: 'shapes', config: { items: ['circle','triangle','rectangle'], cols: 3, label: 'A circle, a triangle, and a rectangle' } },
          o: [{val:'circle',tag:'err_shape_sort'},{val:'triangle',tag:'err_shape_sort'},{val:'rectangle'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Rectangle has 4 sides — the most.', d:'e', s:null, h:'0, 3, 4 — which is biggest?'
        },
        {
          type:'sort-fewest',
          t: 'Which shape has the FEWEST sides?',
          v: { type: 'shapes', config: { items: ['circle','triangle','rectangle'], cols: 3, label: 'A circle, a triangle, and a rectangle' } },
          o: [{val:'circle'},{val:'triangle',tag:'err_shape_sort'},{val:'rectangle',tag:'err_shape_sort'},{val:'they are the same',tag:'err_random'}],
          a:0, e:'Circle has 0 sides — the fewest.', d:'e', s:null, h:'0, 3, 4 — which is smallest?'
        },
        {
          type:'classify',
          t: 'Which shapes have 4 corners?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'circles and triangles',tag:'err_random'},{val:'triangles only',tag:'err_random'},{val:'squares and rectangles'},{val:'circles only',tag:'err_random'}],
          a:2, e:'Squares and rectangles both have 4 corners.', d:'e', s:null, h:'Which shapes have 4 corners?'
        },
        {
          type:'draw-create',
          t: 'To draw a triangle, how many straight lines do you need?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
          a:1, e:'3 lines! One for each side of the triangle.', d:'e', s:null, h:'One line for each side of the triangle'
        },
        {
          type:'draw-create',
          t: 'To draw a square, how many straight lines do you need?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 lines! One for each side of the square.', d:'e', s:null, h:'One line for each side of the square'
        },
        {
          type:'classify',
          t: 'Which shapes have curved sides?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'squares and rectangles',tag:'err_random'},{val:'triangles and squares',tag:'err_random'},{val:'circles'},{val:'triangles only',tag:'err_random'}],
          a:2, e:'Circles have a curved side — no straight lines.', d:'e', s:null, h:'Which shape is round with no straight edges?'
        },
        {
          type:'classify',
          t: 'Which group of shapes all have exactly 4 corners?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'triangle and circle',tag:'err_random'},{val:'square and rectangle'},{val:'triangle and square',tag:'err_random'},{val:'circle and rectangle',tag:'err_random'}],
          a:1, e:'Square and rectangle both always have 4 corners.', d:'e', s:null, h:'Which shapes have 4 corners each?'
        },
        {
          type:'draw-create',
          t: 'Which shape has 3 straight sides?',
          v: null,
          o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
          a:1, e:'Triangle! 3 straight lines make a triangle.', d:'e', s:null, h:'Count the sides — which shape has that many?'
        },
        // ── medium — sorting rules, 2D vs 3D, creating ───────────────────────
        {
          type:'sort-last',
          t: 'Which shape has the MOST corners?',
          v: { type: 'shapes', config: { items: ['circle','triangle','rectangle'], cols: 3, label: 'A circle, a triangle, and a rectangle' } },
          o: [{val:'circle',tag:'err_shape_sort'},{val:'triangle',tag:'err_shape_sort'},{val:'rectangle'},{val:'they are the same',tag:'err_random'}],
          a:2, e:'Rectangle has 4 corners — the most, so it comes last.', d:'m', s:null, h:'Circle = 0, triangle = 3, rectangle = 4'
        },
        {
          type:'classify',
          t: 'Is this shape round or not round?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          o: [{val:'round',tag:'err_random'},{val:'not round'},{val:'both',tag:'err_random'},{val:'neither',tag:'err_random'}],
          a:1, e:'A triangle has straight sides and corners — not round.', d:'m', s:null, h:'Is a triangle curved or straight?'
        },
        {
          type:'classify',
          t: 'Which shapes have 3 sides?',
          v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'circles',tag:'err_random'},{val:'squares',tag:'err_random'},{val:'triangles'},{val:'rectangles',tag:'err_random'}],
          a:2, e:'Triangles always have 3 sides.', d:'m', s:null, h:'Three sides — which shape is that?'
        },
        {
          type:'draw-create',
          t: 'How many sticks do you need to build a square?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_random'}],
          a:1, e:'A square has 4 sides — so 4 sticks.', d:'m', s:null, h:'One stick per side.'
        },
        {
          type:'classify',
          t: 'Is a cube flat or a 3D solid?',
          v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
          o: [{val:'flat',tag:'err_wrong_solid'},{val:'3D solid'},{val:'both',tag:'err_random'},{val:'neither',tag:'err_random'}],
          a:1, e:'A cube is a 3D solid — you can hold it.', d:'m', s:null, h:'Can you hold a cube in your hands?'
        },
        {
          type:'classify',
          t: 'Is a circle flat or a 3D solid?',
          v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
          o: [{val:'flat'},{val:'3D solid',tag:'err_wrong_solid'},{val:'both',tag:'err_random'},{val:'neither',tag:'err_random'}],
          a:0, e:'A circle is flat — it is drawn on paper with no depth.', d:'m', s:null, h:'Can you hold a circle or is it just drawn?'
        },
        {
          type:'classify',
          t: 'Which two shapes both have ROUND sides?',
          v: null,
          o: [{val:'triangle and square',tag:'err_random'},{val:'circle and sphere'},{val:'square and cube',tag:'err_random'},{val:'triangle and cone',tag:'err_random'}],
          a:1, e:'Circle and sphere both have round curved surfaces.', d:'m', s:null, h:'Which shapes are round?'
        },
        {
          type:'classify',
          t: 'Does a triangle have fewer than 4 sides?',
          v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
          o: [{val:'no — 4 or more',tag:'err_off_by_one'},{val:'yes — fewer than 4'},{val:'both',tag:'err_random'},{val:'neither',tag:'err_random'}],
          a:1, e:'A triangle has 3 sides — fewer than 4.', d:'m', s:null, h:'Triangle has 3 sides. Is 3 fewer than 4?'
        },
        {
          type:'draw-create',
          t: 'How many lines do you need to draw a rectangle?',
          v: null,
          o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
          a:2, e:'4 lines! One for each side of the rectangle.', d:'m', s:null, h:'One line for each side of the rectangle'
        },
        {
          type:'classify',
          t: 'Which two shapes both have no corners?',
          v: null,
          o: [{val:'square and rectangle',tag:'err_random'},{val:'triangle and circle',tag:'err_random'},{val:'circle and sphere'},{val:'triangle and rectangle',tag:'err_random'}],
          a:2, e:'Circle and sphere are both round with no corners.', d:'m', s:null, h:'Which shapes have no corners at all?'
        },
        // ── hard — orientation, multi-step sorting, attributes ───────────────
        {
          type:'classify',
          t: 'What shape is this?',
          v: { type: 'shapes', config: { items: ['triangle'], rotation: 90, label: 'A tilted triangle' } },
          o: [{val:'square',tag:'err_shape_orient'},{val:'triangle'},{val:'circle',tag:'err_random'},{val:'rectangle',tag:'err_shape_orient'}],
          a:1, e:'Turning a shape does not change what it is.', d:'h', s:null, h:'Count the corners — still 3.'
        },
        {
          type:'sort-count',
          t: 'How many of these shapes have 4 or more sides?',
          v: { type: 'shapes', config: { items: ['circle','square','triangle','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:1, e:'2 shapes! Square (4 sides) and rectangle (4 sides).', d:'h', s:null, h:'Circle = 0, triangle = 3, square = 4, rectangle = 4'
        },
        {
          type:'compare',
          t: 'What can you use to sort these shapes?',
          v: { type: 'shapes', config: { items: ['circle','square','triangle'], cols: 3, label: 'A circle, a square, and a triangle' } },
          o: [{val:'color',tag:'err_random'},{val:'size',tag:'err_random'},{val:'number of sides'},{val:'number of letters in the name',tag:'err_random'}],
          a:2, e:'Number of sides! Circle = 0, triangle = 3, square = 4.', d:'h', s:null, h:'What is different about circle, triangle, and square?'
        },
        {
          type:'draw-create',
          t: 'You draw 4 equal lines connected at corners. What shape is it?',
          v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
          o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle',tag:'err_random'},{val:'square'}],
          a:3, e:'4 equal sides with 4 corners is a square.', d:'h', s:null, h:'All 4 sides the same length.'
        },
        {
          type:'sort-count',
          t: 'Which solid has ONLY flat faces?',
          v: null,
          o: [{val:'sphere',tag:'err_wrong_solid'},{val:'cube'},{val:'cone',tag:'err_wrong_solid'},{val:'cylinder',tag:'err_wrong_solid'}],
          a:1, e:'A cube has 6 flat faces — no curved surface.', d:'h', s:null, h:'Which has no curved parts?'
        },
        {
          type:'draw-create',
          t: 'How do you draw a circle?',
          v: null,
          o: [{val:'3 straight lines',tag:'err_random'},{val:'4 straight lines',tag:'err_random'},{val:'one curved line'},{val:'1 straight line',tag:'err_random'}],
          a:2, e:'A circle is one smooth curved line.', d:'h', s:null, h:'Straight lines or a curve?'
        },
        {
          type:'sort-count',
          t: 'How many of these shapes have fewer than 4 corners?',
          v: { type: 'shapes', config: { items: ['square','triangle','circle','rectangle'], cols: 2, label: 'Four shapes' } },
          o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
          a:1, e:'2 shapes! Circle (0 corners) and triangle (3 corners).', d:'h', s:null, h:'Circle = 0, triangle = 3, square = 4, rectangle = 4'
        },
        {
          type:'classify',
          t: 'Which shape has more than 3 corners?',
          v: null,
          o: [{val:'triangle',tag:'err_off_by_one'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'none of these',tag:'err_random'}],
          a:2, e:'A rectangle has 4 corners — more than 3.', d:'h', s:null, h:'Which shape has more than 3 corners?'
        },
        // ── tapGroup: 5 required interactive variations ───────────────────────
        {
          id:'k-u6-l4-tg-01', type:'tapGroup', grade:'K', unit:6, lesson:4,
          t:'Tap all the circles.',
          prompt:'Tap all the circles.',
          hint:'Circles are the round shapes!',
          explanation:'Circles are round!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'square',   corners:4,correct:false},
            {id:'s3',shape:'circle',   corners:0,correct:true},
            {id:'s4',shape:'triangle', corners:3,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'square',   corners:4,correct:false},
            {id:'s3',shape:'circle',   corners:0,correct:true},
            {id:'s4',shape:'triangle', corners:3,correct:false},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          tags:['shapes','circle','identify','sort'],
          difficulty:'easy', standard:'K.6E',
          intervention:{ teach:{ text:'Circles are the round shapes!', highlight:['circle'] }, retry:{ strategy:'similar', matchTags:['circle','identify'] } }
        },
        {
          id:'k-u6-l4-tg-02', type:'tapGroup', grade:'K', unit:6, lesson:4,
          t:'Find the shapes with 4 corners.',
          prompt:'Find the shapes with 4 corners.',
          hint:'Count each corner: 1, 2, 3, 4!',
          explanation:'Squares and rectangles have 4 corners!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'square',   corners:4,correct:true},
            {id:'s2',shape:'circle',   corners:0,correct:false},
            {id:'s3',shape:'rectangle',corners:4,correct:true},
            {id:'s4',shape:'triangle', corners:3,correct:false},
            {id:'s5',shape:'square',   corners:4,correct:true}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'square',   corners:4,correct:true},
            {id:'s2',shape:'circle',   corners:0,correct:false},
            {id:'s3',shape:'rectangle',corners:4,correct:true},
            {id:'s4',shape:'triangle', corners:3,correct:false},
            {id:'s5',shape:'square',   corners:4,correct:true}
          ]}},
          tags:['shapes','corners','square','rectangle','identify','sort'],
          difficulty:'easy', standard:'K.6D',
          distractors:{ type:'conceptual', rationale:'circle (0) tests zero-confusion; triangle (3) tests near-miss' },
          intervention:{ teach:{ text:'Count each corner: 1, 2, 3, 4! Squares and rectangles both have 4.', highlight:['square','rectangle'] }, retry:{ strategy:'similar', matchTags:['corners','identify'] } }
        },
        {
          id:'k-u6-l4-tg-03', type:'tapGroup', grade:'K', unit:6, lesson:4,
          t:'Tap the round shapes.',
          prompt:'Tap the round shapes.',
          hint:'Round shapes feel smooth — no pointy corners!',
          explanation:'Circles are round — no corners!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'triangle', corners:3,correct:false},
            {id:'s3',shape:'square',   corners:4,correct:false},
            {id:'s4',shape:'circle',   corners:0,correct:true},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:true},
            {id:'s2',shape:'triangle', corners:3,correct:false},
            {id:'s3',shape:'square',   corners:4,correct:false},
            {id:'s4',shape:'circle',   corners:0,correct:true},
            {id:'s5',shape:'rectangle',corners:4,correct:false}
          ]}},
          tags:['shapes','corners','circle','identify','sort','zero'],
          difficulty:'easy', standard:'K.6D',
          intervention:{ teach:{ text:'Circles are round — no pointy corners!', highlight:['circle'] }, retry:{ strategy:'similar', matchTags:['circle','identify'] } }
        },
        {
          id:'k-u6-l4-tg-04', type:'tapGroup', grade:'K', unit:6, lesson:4,
          t:'Tap all the triangles.',
          prompt:'Tap all the triangles.',
          hint:'Look for the pointy shapes!',
          explanation:'Triangles are the pointy shapes!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'triangle', corners:3,correct:true},
            {id:'s2',shape:'circle',   corners:0,correct:false},
            {id:'s3',shape:'triangle', corners:3,correct:true},
            {id:'s4',shape:'square',   corners:4,correct:false},
            {id:'s5',shape:'triangle', corners:3,correct:true}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'multi', shapes:[
            {id:'s1',shape:'triangle', corners:3,correct:true},
            {id:'s2',shape:'circle',   corners:0,correct:false},
            {id:'s3',shape:'triangle', corners:3,correct:true},
            {id:'s4',shape:'square',   corners:4,correct:false},
            {id:'s5',shape:'triangle', corners:3,correct:true}
          ]}},
          tags:['shapes','triangle','identify','sort','match'],
          difficulty:'easy', standard:'K.6E',
          intervention:{ teach:{ text:'Triangles are the pointy shapes!', highlight:['triangle'] }, retry:{ strategy:'similar', matchTags:['triangle','identify'] } }
        },
        {
          id:'k-u6-l4-tg-05', type:'tapGroup', grade:'K', unit:6, lesson:4,
          t:'Find the triangle.',
          prompt:'Find the triangle.',
          hint:'Look for the pointy shape!',
          explanation:'That is the triangle — the pointy shape!',
          answer:{},
          v:{ type:'tapGroup', config:{ mode:'single', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:false},
            {id:'s2',shape:'triangle', corners:3,correct:true},
            {id:'s3',shape:'square',   corners:4,correct:false},
            {id:'s4',shape:'rectangle',corners:4,correct:false}
          ]}},
          visual:{ type:'tapGroup', config:{ mode:'single', shapes:[
            {id:'s1',shape:'circle',   corners:0,correct:false},
            {id:'s2',shape:'triangle', corners:3,correct:true},
            {id:'s3',shape:'square',   corners:4,correct:false},
            {id:'s4',shape:'rectangle',corners:4,correct:false}
          ]}},
          tags:['shapes','triangle','identify'],
          difficulty:'easy', standard:'K.6A',
          intervention:{ teach:{ text:'Triangles are the pointy shapes!', highlight:['triangle'] }, retry:{ strategy:'similar', matchTags:['triangle','identify'] } }
        }
      ]
    }

  ],

  testBank: [
    // ── 2D Shapes (K.6A) ─────────────────────────────────────────────────────
    {
      t: 'A triangle has ___ sides.',
      v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
      a:1, e:'A triangle has 3 sides.', d:'e', s:null, h:'Count: 1 side, 2 sides, 3 sides'
    },
    {
      t: 'Name the flat shape that is perfectly round.',
      v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
      o: [{val:'triangle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_random'}],
      a:2, e:'A circle is perfectly round with no corners.', d:'e', s:null, h:'Which shape is round?'
    },
    {
      t: 'What shape is this?',
      v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'square',tag:'err_random'},{val:'rectangle'}],
      a:3, e:'A rectangle has 4 corners and 4 sides.', d:'e', s:null, h:'Count the corners — tall and wide.'
    },
    {
      t: 'Look at the coin. What shape is it?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🪙', layout: 'line' } },
      o: [{val:'triangle',tag:'err_random'},{val:'circle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
      a:1, e:'A coin is round — a circle.', d:'e', s:null, h:'Is it round or has corners?'
    },
    {
      t: 'A tile floor has square tiles. A square has how many sides?',
      v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'A square has 4 sides.', d:'e', s:null, h:'Count each side of the square'
    },
    {
      t: 'A slice of pie has 3 sides. What shape is it?',
      v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
      o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_random'},{val:'rectangle',tag:'err_random'}],
      a:1, e:'A triangle has 3 sides.', d:'m', s:null, h:'Which shape has exactly 3 sides?'
    },
    {
      t: 'Look at the kite. Which shape also has 4 sides?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🪁', layout: 'line' } },
      o: [{val:'triangle',tag:'err_off_by_one'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'none of them',tag:'err_random'}],
      a:2, e:'A kite has 4 sides. A rectangle does too.', d:'m', s:null, h:'Which shape has 4 sides?'
    },
    {
      t: 'What shape is this?',
      v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
      o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_random'},{val:'square'},{val:'rectangle',tag:'err_random'}],
      a:2, e:'A square has 4 equal sides.', d:'m', s:null, h:'All 4 sides are the same length.'
    },
    {
      t: 'Tap the shape with all sides equal.',
      v: { type: 'shapes', config: { items: ['square','rectangle'], cols: 2, label: 'A square and a rectangle' } },
      o: [{val:'square'},{val:'rectangle',tag:'err_random'}],
      a:0, e:'A square has all 4 sides the same length.', d:'m', s:null, h:'Which shape has equal sides?'
    },
    {
      t: 'Shapes do not change when you turn them. A turned triangle is still a ___?',
      v: { type: 'shapes', config: { items: ['triangle'], rotation: 135, label: 'A tilted triangle' } },
      o: [{val:'circle',tag:'err_random'},{val:'triangle'},{val:'square',tag:'err_shape_orient'},{val:'rectangle',tag:'err_shape_orient'}],
      a:1, e:'Turning never changes what a shape is.', d:'h', s:null, h:'Count the corners — do they change when turned?'
    },
    {
      t: 'Tap the shape made of only curves.',
      v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
      o: [{val:'circle'},{val:'triangle',tag:'err_shape_sort'},{val:'square',tag:'err_shape_sort'},{val:'rectangle',tag:'err_shape_sort'}],
      a:0, e:'A circle is one smooth curve — no straight parts.', d:'m', s:null, h:'Which shape has no straight edges?'
    },
    {
      t: 'A shape has 3 corners. It has ___ sides?',
      v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
      a:1, e:'A triangle has 3 corners AND 3 sides.', d:'m', s:null, h:'Corners and sides are equal in triangles'
    },
    {
      t: 'How many sides do 1 triangle and 1 circle have TOGETHER?',
      v: { type: 'shapes', config: { items: ['triangle','circle'], cols: 2, label: 'A triangle and a circle' } },
      o: [{val:'0',tag:'err_under_count'},{val:'1',tag:'err_under_count'},{val:'3'},{val:'4',tag:'err_off_by_one'}],
      a:2, e:'Triangle has 3 sides; circle has 0. 3 + 0 = 3.', d:'h', s:null, h:'Triangle = 3 sides; circle = 0 sides'
    },
    // ── 3D Solids (K.6B, K.6C) ───────────────────────────────────────────────
    {
      t: 'A marble is shaped like which solid?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🎱', layout: 'line' } },
      o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
      a:2, e:'A sphere is perfectly round like a marble.', d:'e', s:null, h:'Perfectly round like a ball — which solid has no flat parts?'
    },
    {
      t: 'A paper towel roll is shaped like which solid?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
      o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'sphere',tag:'err_random'},{val:'cylinder'}],
      a:3, e:'A cylinder is a round tube with flat circles on top and bottom.', d:'e', s:null, h:'Round tube with flat circles on each end'
    },
    {
      t: 'A traffic cone is shaped like which solid?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🍦', layout: 'line' } },
      o: [{val:'cube',tag:'err_random'},{val:'cone'},{val:'sphere',tag:'err_random'},{val:'cylinder',tag:'err_random'}],
      a:1, e:'A cone has a pointy top and a flat circle at the bottom.', d:'e', s:null, h:'Pointy at the top, flat circle at the bottom'
    },
    {
      t: 'A building block (cube) — how many corners does it have?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
      o: [{val:'4',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'8'},{val:'12',tag:'err_random'}],
      a:2, e:'A cube has 8 corners.', d:'m', s:null, h:'Count every pointy corner on a box'
    },
    {
      t: 'Which solid has 1 curved surface and no flat faces?',
      v: null,
      o: [{val:'cube',tag:'err_random'},{val:'cone',tag:'err_wrong_solid'},{val:'sphere'},{val:'cylinder',tag:'err_wrong_solid'}],
      a:2, e:'A sphere is all curved — no flat faces at all.', d:'m', s:null, h:'Totally round — no flat faces!'
    },
    {
      t: 'Which solid has exactly 1 flat face?',
      v: null,
      o: [{val:'sphere',tag:'err_random'},{val:'cone'},{val:'cylinder',tag:'err_off_by_one'},{val:'cube',tag:'err_random'}],
      a:1, e:'A cone has just one flat circle at the bottom.', d:'m', s:null, h:'Pointy top, one flat circle on the bottom'
    },
    {
      t: 'The flat end of a cylinder is shaped like a ___?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🥫', layout: 'line' } },
      o: [{val:'square',tag:'err_wrong_solid'},{val:'triangle',tag:'err_random'},{val:'circle'},{val:'rectangle',tag:'err_wrong_solid'}],
      a:2, e:'The top and bottom of a cylinder are circles.', d:'m', s:null, h:'Round end — what 2D shape is round?'
    },
    {
      t: 'Which solid has 6 equal square faces?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
      o: [{val:'sphere',tag:'err_random'},{val:'cone',tag:'err_random'},{val:'cylinder',tag:'err_random'},{val:'cube'}],
      a:3, e:'A cube has 6 flat square faces.', d:'m', s:null, h:'6 flat square faces — which solid?'
    },
    {
      t: 'A sphere looks like a circle but is different because ___?',
      v: null,
      o: [{val:'it is flat',tag:'err_wrong_solid'},{val:'it has corners',tag:'err_random'},{val:'it is 3D — you can hold it'},{val:'it has 4 faces',tag:'err_random'}],
      a:2, e:'A sphere is 3D — you can hold it like a ball.', d:'h', s:null, h:'Can you hold it or is it flat on paper?'
    },
    {
      t: 'A cone has 1 flat face. A cylinder has ___ flat faces?',
      v: null,
      o: [{val:'0',tag:'err_off_by_one'},{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'6',tag:'err_random'}],
      a:2, e:'A cylinder has 2 flat faces — one circle on top and one on the bottom.', d:'h', s:null, h:'Top circle + bottom circle = ?'
    },
    {
      t: 'Which solid would you use to trace a circle?',
      v: null,
      o: [{val:'cube',tag:'err_wrong_solid'},{val:'cone'},{val:'sphere',tag:'err_wrong_solid'},{val:'rectangle',tag:'err_random'}],
      a:1, e:'A cone has a flat circular face — trace around it.', d:'h', s:null, h:'Which solid has a flat circular face?'
    },
    {
      t: 'Which solid would you use to trace a square?',
      v: null,
      o: [{val:'sphere',tag:'err_wrong_solid'},{val:'cone',tag:'err_wrong_solid'},{val:'cylinder',tag:'err_wrong_solid'},{val:'cube'}],
      a:3, e:'A cube has flat square faces — trace around one.', d:'h', s:null, h:'Which solid has flat square faces?'
    },
    // ── Shape Attributes (K.6D) ───────────────────────────────────────────────
    {
      t: 'Tap the shape with 0 corners.',
      v: { type: 'shapes', config: { items: ['circle','triangle','square','rectangle'], cols: 2, label: 'Four shapes', vivid: true } },
      o: [{val:'circle'},{val:'triangle',tag:'err_shape_sort'},{val:'square',tag:'err_shape_sort'},{val:'rectangle',tag:'err_shape_sort'}],
      a:0, e:'A circle has no corners — it is perfectly round.', d:'e', s:null, h:'Which shape is perfectly round?'
    },
    {
      t: 'A triangle has ___ corners.',
      v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_off_by_one'},{val:'5',tag:'err_random'}],
      a:1, e:'A triangle has 3 corners.', d:'e', s:null, h:'Count each pointy corner'
    },
    {
      t: 'A square has ___ sides.',
      v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'A square has 4 sides.', d:'e', s:null, h:'Count each side of the square'
    },
    {
      t: 'A circle has ___ sides.',
      v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
      o: [{val:'0'},{val:'1',tag:'err_off_by_one'},{val:'2',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
      a:0, e:'A circle has no straight sides.', d:'e', s:null, h:'A circle is round — no straight sides!'
    },
    {
      t: 'A rectangle has ___ corners.',
      v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'A rectangle has 4 corners.', d:'m', s:null, h:'Touch each corner: 1, 2, 3, 4'
    },
    {
      t: 'What shape is this?',
      v: { type: 'shapes', config: { items: ['square'], label: 'A square' } },
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle',tag:'err_random'},{val:'square'}],
      a:3, e:'A square has 4 equal sides and 4 corners.', d:'m', s:null, h:'All 4 sides the same length.'
    },
    {
      t: 'A rectangle has 2 long sides and 2 short sides. How many sides total?',
      v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
      o: [{val:'2',tag:'err_off_by_one'},{val:'3',tag:'err_off_by_one'},{val:'4'},{val:'5',tag:'err_off_by_one'}],
      a:2, e:'2 long + 2 short = 4 sides total.', d:'m', s:null, h:'2 long + 2 short sides = ?'
    },
    {
      t: 'What shape is this?',
      v: { type: 'shapes', config: { items: ['rectangle'], label: 'A rectangle' } },
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'square',tag:'err_random'}],
      a:2, e:'A rectangle has 4 corners and 4 sides.', d:'h', s:null, h:'Count the corners — how many?'
    },
    {
      t: 'How many corners do a triangle and a square have TOGETHER?',
      v: { type: 'shapes', config: { items: ['triangle','square'], cols: 2, label: 'A triangle and a square' } },
      o: [{val:'4',tag:'err_under_count'},{val:'5',tag:'err_off_by_one'},{val:'6',tag:'err_off_by_one'},{val:'7'}],
      a:3, e:'Triangle = 3 corners + square = 4 corners. 3 + 4 = 7.', d:'h', s:null, h:'3 + 4 = ?'
    },
    {
      t: 'Which two shapes have the SAME number of sides?',
      v: null,
      o: [{val:'triangle and square',tag:'err_off_by_one'},{val:'circle and triangle',tag:'err_random'},{val:'square and rectangle'},{val:'triangle and circle',tag:'err_random'}],
      a:2, e:'Square and rectangle both have 4 sides.', d:'h', s:null, h:'Which two shapes both have 4 sides?'
    },
    {
      t: 'A shape with exactly 4 corners can be a square or a ___?',
      v: null,
      o: [{val:'triangle',tag:'err_random'},{val:'circle',tag:'err_random'},{val:'rectangle'},{val:'sphere',tag:'err_random'}],
      a:2, e:'Rectangles and squares both have 4 corners.', d:'m', s:null, h:'Which other shape has 4 corners?'
    },
    {
      t: 'How many sides do 2 squares have altogether?',
      v: { type: 'shapes', config: { items: ['square','square'], cols: 2, label: 'Two squares' } },
      o: [{val:'4',tag:'err_under_count'},{val:'6',tag:'err_off_by_one'},{val:'7',tag:'err_off_by_one'},{val:'8'}],
      a:3, e:'Each square has 4 sides. 4 + 4 = 8.', d:'h', s:null, h:'One square = 4 sides. Two squares = ?'
    },
    // ── Sort & Create (K.6E, K.6F) ───────────────────────────────────────────
    {
      t: 'Which group would you sort triangles into?',
      v: { type: 'shapes', config: { items: ['triangle'], label: 'A triangle' } },
      o: [{val:'0 sides',tag:'err_random'},{val:'2 sides',tag:'err_off_by_one'},{val:'3 sides'},{val:'4 sides',tag:'err_off_by_one'}],
      a:2, e:'Triangles always have 3 sides.', d:'e', s:null, h:'Triangle = 3 sides!'
    },
    {
      t: 'Which group would you sort circles into?',
      v: { type: 'shapes', config: { items: ['circle'], label: 'A circle' } },
      o: [{val:'3 corners',tag:'err_random'},{val:'4 corners',tag:'err_random'},{val:'no corners'},{val:'1 corner',tag:'err_random'}],
      a:2, e:'Circles have zero corners.', d:'e', s:null, h:'Circles are round — no corners!'
    },
    {
      t: 'Which group would you sort cubes into?',
      v: { type: 'objectSet', config: { count: 1, emoji: '🧊', layout: 'line' } },
      o: [{val:'flat shapes',tag:'err_wrong_solid'},{val:'3D solids'},{val:'curved shapes',tag:'err_random'},{val:'shapes with no corners',tag:'err_random'}],
      a:1, e:'A cube is a 3D solid — you can hold it.', d:'e', s:null, h:'Can you hold a cube?'
    },
    {
      t: 'To draw a circle, you draw ___?',
      v: null,
      o: [{val:'3 straight lines',tag:'err_random'},{val:'4 straight lines',tag:'err_random'},{val:'no straight lines — a smooth curve'},{val:'1 straight line',tag:'err_random'}],
      a:2, e:'A circle is a smooth curve — no straight lines.', d:'m', s:null, h:'Circles have curves, not straight lines!'
    },
    {
      t: 'A rectangle and a square are sorted together. What is the SAME about them?',
      v: { type: 'shapes', config: { items: ['rectangle','square'], cols: 2, label: 'A rectangle and a square' } },
      o: [{val:'sides are all equal',tag:'err_random'},{val:'both are round',tag:'err_random'},{val:'both have 4 sides and 4 corners'},{val:'both have 3 corners',tag:'err_random'}],
      a:2, e:'Both have 4 sides and 4 corners.', d:'m', s:null, h:'How many sides and corners do each have?'
    },
    {
      t: 'A child sorts circle and sphere together. Why do they belong together?',
      v: null,
      o: [{val:'both have corners',tag:'err_random'},{val:'both are flat',tag:'err_wrong_solid'},{val:'both are round with curved surfaces'},{val:'both have 4 sides',tag:'err_random'}],
      a:2, e:'Circle is round and flat; sphere is round and 3D.', d:'m', s:null, h:'What do circles and spheres have in common?'
    },
    {
      t: 'Sort: triangle, sphere, circle, cube. How many are flat 2D shapes?',
      v: null,
      o: [{val:'1',tag:'err_off_by_one'},{val:'2'},{val:'3',tag:'err_off_by_one'},{val:'4',tag:'err_random'}],
      a:1, e:'Triangle and circle are flat. Sphere and cube are 3D.', d:'m', s:null, h:'Which can be drawn flat on paper?'
    },
    {
      t: 'You draw a shape with 4 lines of equal length connected at corners. What shape did you make?',
      v: null,
      o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle',tag:'err_random'},{val:'square'}],
      a:3, e:'4 equal lines connected at corners = square.', d:'m', s:null, h:'4 equal sides = square!'
    },
    {
      t: 'A shape is placed upside-down but you still sort it as a triangle. Why?',
      v: { type: 'shapes', config: { items: ['triangle'], rotation: 180, label: 'An upside-down triangle' } },
      o: [{val:'it has no sides when flipped',tag:'err_shape_orient'},{val:'its sides and corners stay the same'},{val:'it becomes a square when flipped',tag:'err_shape_orient'},{val:'you cannot sort a flipped shape',tag:'err_random'}],
      a:1, e:'Turning never changes the sides or corners.', d:'h', s:null, h:'Does turning change how many corners it has?'
    },
    {
      t: 'Sort: sphere, cube, cone, triangle. How many are 3D solids?',
      v: null,
      o: [{val:'1',tag:'err_under_count'},{val:'2',tag:'err_off_by_one'},{val:'3'},{val:'4',tag:'err_random'}],
      a:2, e:'Sphere, cube, and cone are 3D. Triangle is flat.', d:'h', s:null, h:'Sphere, cube, cone — can you hold them?'
    },
    {
      t: 'Which sorting rule correctly separates triangles from rectangles?',
      v: { type: 'shapes', config: { items: ['triangle','rectangle'], cols: 2, label: 'A triangle and a rectangle' } },
      o: [{val:'by color',tag:'err_random'},{val:'by size',tag:'err_random'},{val:'by number of sides'},{val:'by which is taller',tag:'err_random'}],
      a:2, e:'Triangle has 3 sides; rectangle has 4 — always different.', d:'h', s:null, h:'What is always different about triangles and rectangles?'
    },
    {
      t: 'Which shape from this list has the MOST sides: circle, triangle, rectangle?',
      v: { type: 'shapes', config: { items: ['circle','triangle','rectangle'], cols: 3, label: 'A circle, a triangle, and a rectangle' } },
      o: [{val:'circle',tag:'err_random'},{val:'triangle',tag:'err_off_by_one'},{val:'rectangle'},{val:'they all have the same',tag:'err_random'}],
      a:2, e:'Rectangle has 4 sides — the most. Circle = 0, triangle = 3.', d:'h', s:null, h:'Circle = 0, triangle = 3, rectangle = 4'
    }
  ]
});

// Dev-only: confirm sort/order questions only use shapes named in the prompt as options.
// Runs in preview mode (preview=1) to catch data errors early.
(function(){
  if(typeof location === 'undefined' || location.search.indexOf('preview=1') === -1) return;
  var SHAPES = ['circle','triangle','square','rectangle','sphere','cube','cone','cylinder'];
  var SORT_TYPES = ['sort-last','sort-first','sort-most','sort-fewest'];
  // Access data via shared_k after _mergeKUnitData has run
  setTimeout(function(){
    if(typeof _UNITS_DATA_K === 'undefined') return;
    var unit = _UNITS_DATA_K[5];
    if(!unit) return;
    var allQ = (unit.testBank || []).concat(
      (unit.lessons || []).reduce(function(acc, l){ return acc.concat(l.qBank || []); }, [])
    );
    allQ.forEach(function(q){
      if(!q.type || SORT_TYPES.indexOf(q.type) === -1) return;
      var named = SHAPES.filter(function(s){ return q.t.toLowerCase().indexOf(s) !== -1; });
      if(!named.length) return;
      (q.o || []).forEach(function(opt){
        var v = (opt && typeof opt === 'object') ? opt.val : opt;
        if(SHAPES.indexOf(v) !== -1 && named.indexOf(v) === -1){
          console.error('[u6 validation] Sort question uses shape "' + v + '" not named in prompt: ' + q.t);
        }
      });
    });
    console.log('[u6 validation] Sort question audit complete — 0 errors means all clear.');
  }, 1500);
})();
